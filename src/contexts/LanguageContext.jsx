import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import translations from '../translations';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load user's language preference from Firestore
  useEffect(() => {
    const loadLanguagePreference = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.language) {
              setLanguage(userData.language);
            }
          }
        } catch (error) {
          console.error('Error loading language preference:', error);
        }
      }
      setLoading(false);
    };

    loadLanguagePreference();
  }, [user]);

  // Save user's language preference to Firestore
  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          await updateDoc(userRef, { language: newLanguage });
        } else {
          await setDoc(userRef, { language: newLanguage });
        }
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  };

  // Get translation for a specific key
  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {!loading && children}
    </LanguageContext.Provider>
  );
}
