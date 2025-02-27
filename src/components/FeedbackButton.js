import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FeedbackModal from './FeedbackModal';
import { useAuth } from '../contexts/AuthContext';

const FeedbackButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin } = useAuth();
  
  // Don't render the button for admins
  if (isAdmin) return null;

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-0 top-20 z-40 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 px-3 sm:px-4 rounded-l-lg shadow-lg flex items-center space-x-1 sm:space-x-2"
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
        initial={{ x: 5 }}
        animate={{ x: 0 }}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="text-sm sm:text-base font-medium">Feedback</span>
      </motion.button>
      
      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default FeedbackButton;
