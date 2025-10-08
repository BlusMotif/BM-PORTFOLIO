import React from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';

const Footer: React.FC = () => {
  const { data } = useFirebase();

  if (!data.footer) return null;

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              {data.navigation?.siteTitle || 'Portfolio'}
            </h3>
            <p className="text-gray-400">{data.footer.description}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              {data.navigation?.menuItems?.map((item: any, index: number) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Additional Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">More</h4>
            <div className="flex flex-col space-y-2">
              {data.footer.additionalLinks?.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links */}
        {data.footer.showSocialLinks && data.socials && (
          <div className="flex justify-center space-x-6 mt-8">
            {Object.entries(data.socials).map(([platform, socialData]: [string, any]) => {
              if (!socialData?.url) return null;
              return (
                <motion.a
                  key={platform}
                  href={socialData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
                >
                  <span className="text-lg">
                    {platform === 'github' && '🐙'}
                    {platform === 'linkedin' && '💼'}
                    {platform === 'twitter' && '🐦'}
                    {platform === 'instagram' && '📷'}
                    {platform === 'youtube' && '📺'}
                  </span>
                </motion.a>
              );
            })}
          </div>
        )}

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">{data.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;