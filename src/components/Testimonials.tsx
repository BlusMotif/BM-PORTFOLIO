import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';
import { getFileURL } from '../firebase/storage';

const Testimonials: React.FC = () => {
  const { data } = useFirebase();
  const [currentIndex, setCurrentIndex] = useState(0);

  const ImageLoader: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [imageSrc, setImageSrc] = React.useState<string>('');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      // Clear the image source first to force re-loading
      setImageSrc('');
      setLoading(true);

      const loadImage = async () => {
        try {
          if (!src) {
            // Use fallback placeholder for empty src
            setImageSrc("https://picsum.photos/100/100?random=fallback");
          } else if (src.startsWith('data:') || src.startsWith('http')) {
            setImageSrc(src);
          } else {
            const url = await getFileURL(src);
            setImageSrc(url || "https://picsum.photos/100/100?random=fallback");
          }
        } catch (error) {
          console.error('Error loading image:', error);
          // Fallback to placeholder
          setImageSrc("https://picsum.photos/100/100?random=fallback");
        } finally {
          setLoading(false);
        }
      };

      loadImage();
    }, [src]);

    if (loading) {
      return (
        <div className={`bg-gray-700 animate-pulse ${className}`} />
      );
    }

    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={(e) => {
          console.error('Image failed to load:', src);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  };

  if (!data.testimonials || !data.testimonials.testimonials || data.testimonials.testimonials.length === 0) return null;

  const testimonials = data.testimonials.testimonials;
  const hasMultiple = testimonials.length > 1;

  // Auto-advance carousel
  useEffect(() => {
    if (!hasMultiple) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length, hasMultiple]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section id="testimonials" className="pt-16 py-20 bg-gray-800">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">{data.testimonials.title}</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">{data.testimonials.subtitle}</p>
        </motion.div>

        <div className="relative">
          {/* Main Testimonial Card */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mx-auto max-w-2xl"
                drag={hasMultiple ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (!hasMultiple) return;
                  const swipeThreshold = 50;
                  if (info.offset.x > swipeThreshold) {
                    goToPrevious();
                  } else if (info.offset.x < -swipeThreshold) {
                    goToNext();
                  }
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <ImageLoader
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-20 h-20 rounded-full mb-6 object-cover border-4 border-gray-700"
                  />
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-white mb-1">{testimonials[currentIndex].name}</h4>
                    <p className="text-gray-400 text-sm">{testimonials[currentIndex].position} at {testimonials[currentIndex].company}</p>
                  </div>
                  <p className="text-gray-300 mb-6 italic text-lg leading-relaxed">"{testimonials[currentIndex].content}"</p>
                  <div className="flex justify-center">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="text-yellow-400 text-xl"
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          {hasMultiple && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800/80 hover:bg-gray-700/80 rounded-full flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm border border-gray-600 hover:border-gray-500"
                aria-label="Previous testimonial"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800/80 hover:bg-gray-700/80 rounded-full flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm border border-gray-600 hover:border-gray-500"
                aria-label="Next testimonial"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? 'bg-blue-500 scale-125'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;