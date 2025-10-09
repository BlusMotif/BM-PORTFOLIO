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
      className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-md z-50 border-b border-gray-700 shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
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
              onClick={async () => {
                const cvUrl = data.resume?.cvUrl;
                if (cvUrl) {
                  try {
                    // Import the getFileURL function to get the actual file data
                    const { getFileURL } = await import('../firebase/storage');
                    const fileDataUrl = await getFileURL(cvUrl);

                    if (fileDataUrl) {
                      // For data URLs, we need to handle download differently
                      if (fileDataUrl.startsWith('data:')) {
                        // Extract the MIME type and base64 data
                        const [mimePart, base64Data] = fileDataUrl.split(',');
                        const mimeType = mimePart.split(':')[1].split(';')[0];

                        // Convert base64 to blob
                        const byteCharacters = atob(base64Data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: mimeType });

                        // Create download link with blob URL
                        const blobUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = data.resume?.fileName || 'CV_Resume.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        // Clean up the blob URL
                        URL.revokeObjectURL(blobUrl);
                      } else {
                        // For regular URLs, use the original method
                        const link = document.createElement('a');
                        link.href = fileDataUrl;
                        link.download = data.resume?.fileName || 'CV_Resume.pdf';
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    } else {
                      console.error('Could not retrieve CV file');
                      scrollToSection('contact');
                    }
                  } catch (error) {
                    console.error('Error downloading CV:', error);
                    scrollToSection('contact');
                  }
                } else {
                  // If no CV uploaded, scroll to contact section
                  scrollToSection('contact');
                  console.log('No CV uploaded yet. Please upload a CV through the admin dashboard.');
                }
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              {data.resume?.buttonText || 'Download CV'}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              className="md:hidden bg-gray-900/98 backdrop-blur-md border-t border-gray-700 absolute top-full left-0 right-0 shadow-xl z-50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 pt-4 pb-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {navItems.map((item: any) => (
                  <button
                    key={item.id || item.href?.replace('#', '')}
                    onClick={() => {
                      scrollToSection(item.href?.replace('#', '') || item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                      activeSection === (item.href?.replace('#', '') || item.id)
                        ? 'bg-purple-500/20 text-purple-400 border-l-4 border-purple-400'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={async () => {
                      const cvUrl = data.resume?.cvUrl;
                      if (cvUrl) {
                        try {
                          // Import the getFileURL function to get the actual file data
                          const { getFileURL } = await import('../firebase/storage');
                          const fileDataUrl = await getFileURL(cvUrl);

                          if (fileDataUrl) {
                            // For data URLs, we need to handle download differently
                            if (fileDataUrl.startsWith('data:')) {
                              // Extract the MIME type and base64 data
                              const [mimePart, base64Data] = fileDataUrl.split(',');
                              const mimeType = mimePart.split(':')[1].split(';')[0];

                              // Convert base64 to blob
                              const byteCharacters = atob(base64Data);
                              const byteNumbers = new Array(byteCharacters.length);
                              for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                              }
                              const byteArray = new Uint8Array(byteNumbers);
                              const blob = new Blob([byteArray], { type: mimeType });

                              // Create download link with blob URL
                              const blobUrl = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = blobUrl;
                              link.download = data.resume?.fileName || 'CV_Resume.pdf';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);

                              // Clean up the blob URL
                              URL.revokeObjectURL(blobUrl);
                            } else {
                              // For regular URLs, use the original method
                              const link = document.createElement('a');
                              link.href = fileDataUrl;
                              link.download = data.resume?.fileName || 'CV_Resume.pdf';
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          } else {
                            console.error('Could not retrieve CV file');
                            scrollToSection('contact');
                          }
                        } catch (error) {
                          console.error('Error downloading CV:', error);
                          scrollToSection('contact');
                        }
                      } else {
                        // If no CV uploaded, scroll to contact section
                        scrollToSection('contact');
                        console.log('No CV uploaded yet. Please upload a CV through the admin dashboard.');
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                  >
                    {data.resume?.buttonText || 'Download CV'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;