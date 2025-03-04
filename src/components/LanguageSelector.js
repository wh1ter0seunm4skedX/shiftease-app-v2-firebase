import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Dialog, RadioGroup } from '@mui/material';
import { IoLanguageOutline } from 'react-icons/io5';

function LanguageSelector() {
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const handleOpen = () => {
    setIsOpen(true);
    setSelectedLanguage(language);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSave = () => {
    changeLanguage(selectedLanguage);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center px-3 py-2 border border-gray-200 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
      >
        <IoLanguageOutline className={`h-4 w-4 ${language === 'he' ? 'ml-2' : 'mr-2'} text-gray-500`} />
        {t('language')}
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
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <RadioGroup
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="space-y-3 mt-4"
          >
            <div
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                selectedLanguage === 'en'
                  ? 'bg-purple-50 border-2 border-purple-500'
                  : 'border-2 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedLanguage('en')}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${language === 'he' ? 'ml-3' : 'mr-3'} ${
                selectedLanguage === 'en' ? 'border-purple-500' : 'border-gray-400'
              }`}>
                {selectedLanguage === 'en' && (
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">English</div>
                <div className="text-sm text-gray-500">English language</div>
              </div>
              <span className="text-2xl">🇺🇸</span>
            </div>

            <div
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                selectedLanguage === 'he'
                  ? 'bg-purple-50 border-2 border-purple-500'
                  : 'border-2 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedLanguage('he')}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${language === 'he' ? 'ml-3' : 'mr-3'} ${
                selectedLanguage === 'he' ? 'border-purple-500' : 'border-gray-400'
              }`}>
                {selectedLanguage === 'he' && (
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">עברית</div>
                <div className="text-sm text-gray-500">Hebrew language</div>
              </div>
              <span className="text-2xl">🇮🇱</span>
            </div>
          </RadioGroup>

          <div className={`mt-6 flex ${language === 'he' ? 'justify-start' : 'justify-end'} space-x-3`}>
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default LanguageSelector;
