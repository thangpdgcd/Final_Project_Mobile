import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

import { getLang, setLang, type AppLang as Lang } from '@/i18n/t';

type I18nContextValue = {
  lang: Lang;
  setAppLang: (lang: Lang) => Promise<void>;
  toggleLang: () => Promise<void>;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'app.lang';

const normalizeLang = (v: unknown): Lang | null => {
  if (v === 'vi' || v === 'en') return v;
  return null;
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = React.useState<Lang>(() => getLang());

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const normalized = normalizeLang(saved);
        if (!normalized) return;
        if (cancelled) return;
        setLang(normalized);
        setLangState(normalized);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setAppLang = React.useCallback(async (next: Lang) => {
    setLang(next);
    setLangState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggleLang = React.useCallback(async () => {
    const next: Lang = lang === 'vi' ? 'en' : 'vi';
    await setAppLang(next);
  }, [lang, setAppLang]);

  return <I18nContext.Provider value={{ lang, setAppLang, toggleLang }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
};
