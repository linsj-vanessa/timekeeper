
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { LanguageCode } from '../types';
import { DEFAULT_LANGUAGE, LOCAL_STORAGE_LANGUAGE_KEY } from '../constants';

// Dynamically load locales using fetch
const loadLocaleData = async (locale: LanguageCode): Promise<Record<string, string>> => {
  try {
    // Paths are relative to the public root where index.html is served.
    const response = await fetch(`/locales/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load locale ${locale}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading locale ${locale}:`, error);
    // Fallback to English if the selected locale fails to load, or if it's the initial load and 'en' fails (though unlikely)
    if (locale !== 'en') {
      try {
        const fallbackResponse = await fetch(`/locales/en.json`);
        if (fallbackResponse.ok) {
          return await fallbackResponse.json();
        }
      } catch (fallbackError) {
        console.error(`Error loading fallback locale en:`, fallbackError);
      }
    }
    return {}; // Return empty object if all attempts fail
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  formatTime: (totalSeconds: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const storedLang = localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) as LanguageCode | null;
    return storedLang || DEFAULT_LANGUAGE;
  });
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    loadLocaleData(language).then(loadedTranslations => {
      if (Object.keys(loadedTranslations).length > 0) {
        setTranslations(loadedTranslations);
      } else {
        // Attempt to load English if the primary load (even if 'en') returned empty
        // This handles cases where the initial language (e.g. 'pt') fails and fallback to 'en' also failed inside loadLocaleData
        // or if 'en' itself failed.
        console.warn(`Translations for ${language} were empty. Attempting to load English as a final fallback.`);
        loadLocaleData('en').then(setTranslations);
      }
    });
    document.documentElement.lang = language; // Set lang attribute on HTML element
  }, [language]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, lang);
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    let translation = translations[key];
    if (translation === undefined) {
        console.warn(`Translation key "${key}" not found for language "${language}".`);
        translation = key; // Return key if not found
    }
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(`{${placeholder}}`, String(value));
      });
    }
    return translation;
  }, [translations, language]);

  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatTime }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
