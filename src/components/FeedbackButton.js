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
        className={`fixed ${isRtl ? 'left-4 md:left-6' : 'right-4 md:right-6'} bottom-6 md:bottom-8 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full p-4 shadow-lg flex items-center justify-center z-40 group overflow-hidden`}
        whileHover={{ width: 'auto', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}
        initial={{ width: '3.5rem', height: '3.5rem' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        aria-label={t('feedback')}
      >
        {isRtl ? (
          <>
            <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap group-hover:block hidden text-base font-medium"
                  style={{ direction: 'rtl' }}>
              {t('feedback')}
            </span>
            <span className="absolute right-4 opacity-100 group-hover:opacity-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </span>
          </>
        ) : (
          <>
            <span className="absolute right-4 opacity-100 group-hover:opacity-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap group-hover:block hidden text-base font-medium"
                  style={{ direction: 'ltr' }}>
              {t('feedback')}
            </span>
          </>
        )}
      </motion.button>
      
      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default FeedbackButton;
