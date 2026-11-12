import React, { createContext, Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { DevSettings, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lang, setLang } from './index';

const STORAGE_KEY = 'amal.language';

type LanguageState = { lang: Lang; changeLanguage: (lang: Lang) => Promise<void> };
const LanguageContext = createContext<LanguageState | null>(null);

// Right-to-left layout for Arabic. React Native only applies this after the app reloads.
function setDirection(lang: Lang): boolean {
  const rtl = lang === 'ar';
  if (I18nManager.isRTL === rtl) return false;
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
  return true; // a reload is needed to flip the layout
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null);

  // On start-up: use the language the user chose last time (English the first time).
  useEffect(() => {
    (async () => {
      let saved: Lang = 'en';
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        if (value === 'ar' || value === 'en') saved = value;
      } catch {
        // storage not available: stay in English
      }
      setLang(saved);
      setDirection(saved); // takes effect from the next start if it changed
      setLangState(saved);
    })();
  }, []);

  const changeLanguage = useCallback(async (next: Lang) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // still switch for this session
    }
    setLang(next);
    setLangState(next); // text changes straight away
    if (setDirection(next)) {
      // Reload once so the whole layout flips left ↔ right.
      setTimeout(() => DevSettings.reload(), 300);
    }
  }, []);

  if (!lang) return null;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {/* key={lang} redraws every screen in the new language */}
      <Fragment key={lang}>{children}</Fragment>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
