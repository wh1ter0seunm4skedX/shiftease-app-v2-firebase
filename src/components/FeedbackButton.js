import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FeedbackModal from './FeedbackModal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const FeedbackButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  
  // Don't render the button for admins
  if (isAdmin) return null;

  const isRtl = language === 'he';

  return (
    <>
      <motion.button
        className="fixed right-5 bottom-5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full p-3 shadow-lg flex items-center justify-center z-40 group overflow-hidden"
        whileHover={{ width: 'auto', paddingLeft: '1rem', paddingRight: '1rem' }}
        initial={{ width: '3rem', height: '3rem' }}
        onClick={() => setIsModalOpen(true)}
      >
        <span className="absolute right-3 opacity-100 group-hover:opacity-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </span>
        <span 
          className="opacity-0 group-hover:opacity-100 whitespace-nowrap group-hover:block hidden"
          style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {t('feedback')}
        </span>
      </motion.button>
      
      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default FeedbackButton;
