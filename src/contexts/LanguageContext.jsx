import React, { createContext, useContext } from 'react';
import translations from '../translations';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  // Always use Hebrew
  const language = 'he';

  // Get translation for a specific key
  const t = (key) => {
    return translations[key] || key;
  };

  const value = {
    language,
    t,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
