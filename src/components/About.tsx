import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AboutProps {
  data: any;
}

// Component to load images from database using keys
const ImageLoader: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        // Use fallback placeholder for empty src
        setImageUrl("https://picsum.photos/400/400?random=fallback");
        return;
      }

      // If it's already a data URL, use it directly
      if (src.startsWith('data:') || src.startsWith('http')) {
        setImageUrl(src);
        return;
      }

      try {
        // Try to fetch from database using the key
        const { getFileURL } = await import('../firebase/storage');
        const url = await getFileURL(src);
        if (url) {
          setImageUrl(url);
        } else {
          // Fallback to placeholder if no URL found
          setImageUrl("https://picsum.photos/400/400?random=fallback");
        }
      } catch (error) {
        console.error('Error loading image:', error);
        // Fallback to placeholder
        setImageUrl("https://picsum.photos/400/400?random=fallback");
      }
    };

    loadImage();
  }, [src]);

  if (!imageUrl) {
    return <div className={`${className} bg-gray-700 animate-pulse rounded-lg`} />;
  }

  return <img src={imageUrl} alt={alt} className={className} />;
};

const About: React.FC<AboutProps> = ({ data }) => {
  const personalDetails = [
    { label: 'Full Name', value: data.about?.name || 'Blu Motif' },
    { label: 'Location', value: data.about?.location || 'Your Location' },
    { label: 'Experience', value: data.about?.experience || 'X+ Years' },
    { label: 'Available', value: data.about?.availability || 'Open To Work' },
    { label: 'Education', value: data.about?.education || 'Your Degree' },
  ];

  return (
    <section id="about" className="pt-16 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Know Me More</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {data.about?.description || "I'm a passionate developer with expertise in building modern web applications."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <ImageLoader
              src={data.about?.image}
              alt="About"
              className="w-full rounded-lg shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-6">Personal Details</h3>
            <div className="space-y-4">
              {personalDetails.map((detail, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div>
                    <span className="text-gray-400">{detail.label}:</span>
                    <span className="ml-2 text-white">{detail.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;