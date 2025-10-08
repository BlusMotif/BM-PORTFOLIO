import React from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';
import { getFileURL } from '../firebase/storage';

const Resume: React.FC = () => {
  const { data } = useFirebase();
  const [cvDownloadUrl, setCvDownloadUrl] = React.useState<string>('');

  React.useEffect(() => {
    const loadCvUrl = async () => {
      if (data.resume?.cvUrl) {
        try {
          const url = await getFileURL(data.resume.cvUrl);
          setCvDownloadUrl(url || '');
        } catch (error) {
          console.error('Error loading CV URL:', error);
        }
      }
    };

    loadCvUrl();
  }, [data.resume?.cvUrl]);

  if (!data.resume) return null;

  return (
    <section id="resume" className="pt-16 py-20 bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700"
        >
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">{data.resume?.title || 'Download My Resume'}</h2>
            <p className="text-xl text-gray-400 mb-6">{data.resume?.subtitle || 'Get a copy of my professional CV'}</p>
            <p className="text-gray-300 mb-8">{data.resume?.description || 'Download my resume to learn more about my experience, skills, and qualifications.'}</p>
          </div>

          {cvDownloadUrl ? (
            <motion.a
              href={cvDownloadUrl}
              download={data.resume?.fileName || "CV_Resume.pdf"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {data.resume?.buttonText || 'Download CV'}
            </motion.a>
          ) : (
            <div className="inline-flex items-center px-8 py-4 bg-gray-600 text-white font-semibold rounded-lg cursor-not-allowed">
              <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Loading CV...
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Resume;