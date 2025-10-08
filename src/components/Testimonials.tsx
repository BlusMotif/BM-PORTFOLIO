import React from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';
import { getFileURL } from '../firebase/storage';

const Testimonials: React.FC = () => {
  const { data } = useFirebase();

  const ImageLoader: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [imageSrc, setImageSrc] = React.useState<string>('');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
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

  return (
    <section id="testimonials" className="pt-16 py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.testimonials.testimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
            >
              <div className="flex items-center mb-4">
                <ImageLoader
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.position} at {testimonial.company}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
              <div className="flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;