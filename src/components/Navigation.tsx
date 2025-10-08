import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';

interface NavigationProps {
  activeSection: string;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection }) => {
  const { data } = useFirebase();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = data.navigation?.menuItems || [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      className="fixed top-0 w-full bg-gray-900/90 backdrop-blur-sm z-50 border-b border-gray-800"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {data.navigation?.logo && (
              <img
                src={data.navigation.logo}
                alt="Logo"
                className="w-8 h-8 rounded"
              />
            )}
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {data.navigation?.siteTitle || 'BM'}
            </div>
            {data.navigation?.siteSubtitle && (
              <span className="hidden lg:block text-sm text-gray-400">
                {data.navigation.siteSubtitle}
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item: any) => (
              <button
                key={item.id || item.href?.replace('#', '')}
                onClick={() => scrollToSection(item.href?.replace('#', '') || item.id)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeSection === (item.href?.replace('#', '') || item.id)
                    ? 'text-purple-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                const cvUrl = data.resume?.cvUrl;
                if (cvUrl) {
                  const link = document.createElement('a');
                  link.href = cvUrl;
                  link.download = 'CV_Resume.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  scrollToSection('contact');
                }
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Download CV
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => {
                const cvUrl = data.resume?.cvUrl;
                if (cvUrl) {
                  const link = document.createElement('a');
                  link.href = cvUrl;
                  link.download = 'CV_Resume.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  scrollToSection('contact');
                }
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Download CV
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-gray-800/95 backdrop-blur-sm border-t border-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item: any) => (
                <button
                  key={item.id || item.href?.replace('#', '')}
                  onClick={() => {
                    scrollToSection(item.href?.replace('#', '') || item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                    activeSection === (item.href?.replace('#', '') || item.id)
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;