import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  data: any;
}

// Component to load images from database using keys
const ImageLoader: React.FC<{ src: string; alt: string; className: string; style?: React.CSSProperties }> = ({ src, alt, className, style }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    // Clear the image URL first to force re-loading
    setImageUrl('');

    const loadImage = async () => {
      if (!src) {
        // Use fallback placeholder for empty src
        setImageUrl("https://picsum.photos/150/150?random=fallback");
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
          setImageUrl("https://picsum.photos/150/150?random=fallback");
        }
      } catch (error) {
        console.error('Error loading image:', error);
        // Fallback to placeholder
        setImageUrl("https://picsum.photos/150/150?random=fallback");
      }
    };

    loadImage();
  }, [src]);

  if (!imageUrl) {
    return <div className={`${className} bg-gray-700 animate-pulse rounded-full`} />;
  }

  return <img src={imageUrl} alt={alt} className={className} style={style} />;
};

const Hero: React.FC<HeroProps> = ({ data }) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {data.hero?.backgroundImage && (
        <div className="absolute inset-0">
          <ImageLoader
            key={data.hero.backgroundImage}
            src={data.hero.backgroundImage}
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20"></div>
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <ImageLoader
            key={data.hero?.profileImage}
            src={data.hero?.profileImage || data.about?.image}
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto mb-8 border-4 border-purple-400 shadow-lg object-cover"
          />
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {data.hero?.title || "Hi, I'm Blu Motif"}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            {data.hero?.subtitle || "Full Stack Developer & AI Enthusiast"}
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            {data.hero?.description || "I build exceptional and accessible digital experiences for the web, focused on creating clean, user-friendly applications."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => scrollToSection('projects')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {data.hero?.cta || "View My Work"}
            </motion.button>
            <motion.button
              onClick={() => scrollToSection('contact')}
              className="border-2 border-purple-400 text-purple-400 px-8 py-3 rounded-lg font-medium hover:bg-purple-400 hover:text-white transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get In Touch
            </motion.button>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;