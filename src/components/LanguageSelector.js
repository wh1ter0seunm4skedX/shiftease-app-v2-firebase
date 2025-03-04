import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Dialog, RadioGroup } from '@mui/material';
import { IoLanguageOutline } from 'react-icons/io5';

function LanguageSelector() {
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setSelectedLanguage(language);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSave = () => {
    if (selectedLanguage !== language) {
      setIsTransitioning(true);
      setTimeout(() => {
        changeLanguage(selectedLanguage);
      }, 300);
    }
    setIsOpen(false);
  };

  // Reset transition state after language change
  useEffect(() => {
    if (isTransitioning) {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 700);
    }
  }, [language, isTransitioning]);

  return (
    <>
      <button
        onClick={handleOpen}
        className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-3 border border-gray-200 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 ${language === 'he' ? 'rtl:space-x-reverse' : ''}`}
      >
        {language === 'he' ? (
          <>
            {t('language')}
            <IoLanguageOutline className="h-4 w-4 ml-2 text-gray-500" />
          </>
        ) : (
          <>
            <IoLanguageOutline className="h-4 w-4 mr-2 text-gray-500" />
            {t('language')}
          </>
        )}
      </button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'rounded-xl overflow-hidden',
        }}
      >
        <div className={`bg-white p-6 ${language === 'he' ? 'rtl' : 'ltr'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{t('language_selection')}</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={t('close')}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <RadioGroup
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <div className={`space-y-3 ${language === 'he' ? 'rtl' : 'ltr'}`}>
                <label className={`flex items-center justify-center p-3 border border-gray-200 rounded-lg ${selectedLanguage === 'en' ? 'bg-purple-50 border-purple-200' : 'bg-white'} cursor-pointer hover:bg-gray-50 transition-colors`}>
                  <input
                    type="radio"
                    name="language"
                    value="en"
                    checked={selectedLanguage === 'en'}
                    onChange={() => setSelectedLanguage('en')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className={`${language === 'he' ? 'mr-3' : 'ml-3'} block text-sm font-medium text-gray-700 text-center`}>
                    English
                  </span>
                </label>

                <label className={`flex items-center justify-center p-3 border border-gray-200 rounded-lg ${selectedLanguage === 'he' ? 'bg-purple-50 border-purple-200' : 'bg-white'} cursor-pointer hover:bg-gray-50 transition-colors`}>
                  <input
                    type="radio"
                    name="language"
                    value="he"
                    checked={selectedLanguage === 'he'}
                    onChange={() => setSelectedLanguage('he')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className={`${language === 'he' ? 'mr-3' : 'ml-3'} block text-sm font-medium text-gray-700 text-center`}>
                    עברית
                  </span>
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className={`flex ${language === 'he' ? 'flex-row-reverse space-x-reverse' : ''} space-x-3 justify-end`}>
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-w-[80px] text-center"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-w-[80px] text-center"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Language transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-500 animate-pulse">
          <div className="bg-white p-8 rounded-lg shadow-xl transform transition-transform duration-500 animate-bounce">
            <IoLanguageOutline className="h-16 w-16 text-purple-500 mx-auto mb-4 animate-spin" />
            <p className="text-xl font-medium text-center">
              {selectedLanguage === 'he' ? 'מחליף לעברית...' : 'Switching to English...'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default LanguageSelector;
