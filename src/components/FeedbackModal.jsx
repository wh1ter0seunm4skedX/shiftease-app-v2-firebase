import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(3); // Default to middle rating
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const maxCharCount = 300;
  const isRtl = language === 'he';

  const emojis = [
    { value: 1, icon: '😞', label: t('poor') },
    { value: 2, icon: '🙁', label: t('fair') },
    { value: 3, icon: '😐', label: t('okay') },
    { value: 4, icon: '🙂', label: t('good') },
    { value: 5, icon: '😄', label: t('nice') },
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
      alert(t('failed_to_submit'));
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
          <div className={`bg-white overflow-hidden border-t border-b rounded-l-lg border-l border-gray-200 ${isRtl ? 'rtl' : 'ltr'}`}>
            <div className={`${isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-purple-600 to-blue-500 px-4 py-4 flex justify-between items-center`}>
              <h3 className="text-white font-medium text-lg">{t('feedback_time')}</h3>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
                aria-label={t('close')}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5 max-h-[80vh] overflow-y-auto">
              <p className="text-gray-600 mb-4 text-sm">{t('share_feedback')}</p>
              
              <div className="flex justify-center items-center mb-5">
                <div className={`flex ${isRtl ? 'space-x-reverse' : ''} space-x-2 sm:space-x-3 items-center`}>
                  {emojis.map((emoji) => (
                    <button
                      key={emoji.value}
                      onClick={() => setRating(emoji.value)}
                      className={`p-2 sm:p-3 rounded-full transition-all transform ${
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
              
              <div className="relative mb-4">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${(rating / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                  <span>{isRtl ? t('poor') : t('poor')}</span>
                  <span>{isRtl ? t('nice') : t('nice')}</span>
                </div>
              </div>
              
              <div className="mt-10">
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('about_experience')}
                </label>
                <textarea
                  id="feedback"
                  rows="4"
                  className="w-full px-3 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={t('feedback_placeholder')}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value.slice(0, maxCharCount))}
                  dir={isRtl ? 'rtl' : 'ltr'}
                ></textarea>
                <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} mt-1 text-xs text-gray-500`}>
                  {feedbackText.length}/{maxCharCount}
                </div>
              </div>
              
              <div className={`mt-6 flex ${isRtl ? 'flex-row-reverse' : ''} justify-between space-x-4 ${isRtl ? 'space-x-reverse' : ''}`}>
                <button
                  onClick={onClose}
                  className="min-w-[100px] px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {t('dismiss')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !feedbackText.trim() || isSuccess}
                  className={`min-w-[120px] px-4 py-3 rounded-md shadow-sm text-sm font-medium text-white 
                    ${isSubmitting || !feedbackText.trim() || isSuccess
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    }`}
                >
                  {isSubmitting ? t('sending') : isSuccess ? t('sent') : t('send_feedback')}
                </button>
              </div>
              
              {isSuccess && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-sm text-center">
                  {t('feedback_thanks')}
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
