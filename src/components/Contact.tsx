import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pushData } from '../firebase/database';
import { useForm } from '@formspree/react';

interface ContactProps {
  data: any;
}

const Contact: React.FC<ContactProps> = ({ data }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [state, handleSubmit] = useForm(import.meta.env.VITE_FORMSPREE_FORM_ID || "xpwyyowd");

  // Save to Firebase when form submission succeeds
  useEffect(() => {
    if (state.succeeded && formData.name && formData.email && formData.message) {
      pushData('messages', { ...formData, timestamp: Date.now() })
        .then(() => {
          console.log('Message saved to Firebase');
        })
        .catch((error) => {
          console.error('Failed to save to Firebase:', error);
        });
    }
  }, [state.succeeded, formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Show success message when form is successfully submitted
  if (state.succeeded) {
    return (
      <section id="contact" className="pt-16 py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-gray-300 mb-4">Thank you for your message. I'll get back to you soon.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Send Another Message
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const renderContactIcon = (iconType: string) => {
    switch (iconType) {
      case '📧':
        return (
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case '📱':
        return (
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case '📍':
        return (
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return <span className="text-2xl">{iconType}</span>;
    }
  };

  const contactInfo = [
    {
      label: 'Email',
      value: data.contact?.email || 'your.email@example.com',
      icon: '📧'
    },
    {
      label: 'Phone',
      value: data.contact?.phone || '+1 (555) 123-4567',
      icon: '📱'
    },
    {
      label: 'Location',
      value: data.contact?.address || 'Your City, Country',
      icon: '📍'
    }
  ];

  return (
    <section id="contact" className="pt-16 py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{data.contact?.title || "Get In Touch"}</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {data.contact?.subtitle || "Feel free to reach out for collaborations, opportunities, or just a friendly chat."}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {renderContactIcon(info.icon)}
                  </div>
                  <div>
                    <div className="text-gray-400">{info.label}</div>
                    <div className="text-white">{info.value}</div>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>

          {data.contact?.formEnabled && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="mb-6">
                  <textarea
                    name="message"
                    placeholder="Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={state.submitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
                >
                  {state.submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;