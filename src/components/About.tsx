import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, CheckCircle, GraduationCap, Palette, Smartphone, Star, Sparkles, Type, ArrowRight, Grid3X3 } from 'lucide-react';

interface AboutProps {
  data: any;
}

// Component to load images from database using keys
const ImageLoader: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    // Clear the image URL first to force re-loading
    setImageUrl('');

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
  // Icon mapping for different detail types
  const getIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'full name':
        return <User className="w-6 h-6" />;
      case 'location':
        return <MapPin className="w-6 h-6" />;
      case 'experience':
        return <Briefcase className="w-6 h-6" />;
      case 'available':
        return <CheckCircle className="w-6 h-6" />;
      case 'education':
        return <GraduationCap className="w-6 h-6" />;
      case 'graphic design':
        return <Palette className="w-6 h-6" />;
      case 'adobe photoshop':
        return <Palette className="w-6 h-6" />;
      case 'illustrator':
        return <Palette className="w-6 h-6" />;
      case 'figma':
        return <Smartphone className="w-6 h-6" />;
      case 'canva':
        return <Palette className="w-6 h-6" />;
      case 'coredraw':
        return <Palette className="w-6 h-6" />;
      case 'wireframing':
        return <Grid3X3 className="w-6 h-6" />;
      case 'prototyping':
        return <Smartphone className="w-6 h-6" />;
      case 'responsive design':
        return <Smartphone className="w-6 h-6" />;
      case 'user flow mapping':
        return <ArrowRight className="w-6 h-6" />;
      case 'logo design':
        return <Star className="w-6 h-6" />;
      case 'visual identity':
        return <Star className="w-6 h-6" />;
      case 'color theory':
        return <Palette className="w-6 h-6" />;
      case 'typography':
        return <Type className="w-6 h-6" />;
      case 'poster design':
        return <Sparkles className="w-6 h-6" />;
      case 'social media graphics':
        return <Sparkles className="w-6 h-6" />;
      case 'infographics':
        return <Sparkles className="w-6 h-6" />;
      case 'layout composition':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  // Use dynamic details from Firebase, fallback to default if not available
  const stats = data.about?.details || [
    { title: 'Graphic Design', description: 'Creative visual design and digital art' },
    { title: 'Adobe Photoshop', description: 'Professional photo editing and manipulation' },
    { title: 'Illustrator', description: 'Vector graphics and logo design' },
    { title: 'Figma', description: 'Collaborative UI/UX design platform' },
    { title: 'Canva', description: 'User-friendly design and publishing' },
    { title: 'CorelDRAW', description: 'Vector illustration and layout design' },
    { title: 'Wireframing', description: 'Creating low-fidelity design blueprints' },
    { title: 'Prototyping', description: 'Interactive design mockups and testing' },
    { title: 'Responsive Design', description: 'Cross-device compatible layouts' },
    { title: 'User Flow Mapping', description: 'Planning user journey and interactions' },
    { title: 'Logo Design', description: 'Brand identity and symbol creation' },
    { title: 'Visual Identity', description: 'Complete brand visual systems' },
    { title: 'Color Theory', description: 'Color psychology and palette design' },
    { title: 'Typography', description: 'Font selection and text hierarchy' },
    { title: 'Poster Design', description: 'Promotional and informational graphics' },
    { title: 'Social Media Graphics', description: 'Platform-optimized visual content' },
    { title: 'Infographics', description: 'Data visualization and information design' },
    { title: 'Layout Composition', description: 'Visual arrangement and balance' },
  ];

  return (
    <section id="about" className="pt-16 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Know Me More
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {data.about?.description || "I'm a passionate developer with expertise in building modern web applications."}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-center min-h-[400px]">
          {/* Profile Image */}
          <motion.div
            className="lg:col-span-1 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-purple-500 shadow-2xl">
                <ImageLoader
                  key={data.about?.image}
                  src={data.about?.image}
                  alt="About"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🚀</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.map((stat: any, index: number) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg border border-gray-600 hover:border-purple-500 transition-all duration-300 hover:shadow-purple-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-purple-400">
                      {getIcon(stat.title)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 uppercase tracking-wide font-medium">
                        {stat.title}
                      </div>
                      <div className="text-lg font-semibold text-white mt-1">
                        {stat.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;