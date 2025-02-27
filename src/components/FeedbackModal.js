import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(3); // Default to middle rating
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const maxCharCount = 300;

  const emojis = [
    { value: 1, icon: '😞', label: 'Poor' },
    { value: 2, icon: '🙁', label: 'Fair' },
    { value: 3, icon: '😐', label: 'Okay' },
    { value: 4, icon: '🙂', label: 'Good' },
    { value: 5, icon: '😄', label: 'Nice' },
  ];

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        rating,
        feedback: feedbackText,
        createdAt: serverTimestamp()
      });
      
      setIsSuccess(true);
      setFeedbackText('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-20 z-50 max-w-sm w-full md:w-96 shadow-xl"
        >
          <div className="bg-white rounded-l-lg overflow-hidden border-l border-t border-b border-gray-200">
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-3 flex justify-between items-center">
              <h3 className="text-white font-medium text-lg">Its Feedback Time!</h3>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <p className="text-gray-600 mb-3 text-sm">Feel Free To Share Your Feedback With Us</p>
              
              <div className="flex justify-center items-center mb-4">
                <div className="flex space-x-1 sm:space-x-2 items-center">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji.value}
                      onClick={() => setRating(emoji.value)}
                      className={`p-1 sm:p-2 rounded-full transition-all transform ${
                        rating === emoji.value 
                          ? 'bg-yellow-100 scale-125 ring-2 ring-yellow-400' 
                          : 'hover:bg-gray-100'
                      }`}
                      title={emoji.label}
                    >
                      <span className="text-xl sm:text-2xl">{emoji.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="relative mb-2">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${(rating / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                  <span>Poor</span>
                  <span>Nice</span>
                </div>
              </div>
              
              <div className="mt-8">
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                  Tell Us About Your Experience
                </label>
                <textarea
                  id="feedback"
                  rows="4"
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="It's An Interesting App And I Enjoyed Using It But..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value.slice(0, maxCharCount))}
                ></textarea>
                <div className="flex justify-end mt-1 text-xs text-gray-500">
                  {feedbackText.length}/{maxCharCount}
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <button
                  onClick={onClose}
                  className="px-3 py-2 sm:px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !feedbackText.trim() || isSuccess}
                  className={`px-3 py-2 sm:px-4 rounded-md shadow-sm text-xs sm:text-sm font-medium text-white 
                    ${isSubmitting || !feedbackText.trim() || isSuccess
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    }`}
                >
                  {isSubmitting ? 'Sending...' : isSuccess ? 'Sent!' : 'Send Feedback'}
                </button>
              </div>
              
              {isSuccess && (
                <div className="mt-3 p-2 bg-green-100 text-green-800 rounded-md text-sm text-center">
                  Thank you for your feedback! We appreciate it.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
