"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { messages, resolveMessage, Language } from "../i18n/messages";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>("en");

  // İlk yükleme: localStorage + navigator.language
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("language") as Language | null;
    if (stored && messages[stored]) {
      setLanguageState(stored);
      return;
    }

    const navLang = window.navigator.language?.slice(0, 2);
    if (navLang === "tr" || navLang === "de" || navLang === "en") {
      setLanguageState(navLang as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("language", lang);
    }
  };

  const t = (key: string, vars: Record<string, string> = {}): string => {
    const raw =
      resolveMessage(language, key) ?? resolveMessage("en", key) ?? key;

    return Object.keys(vars).reduce((acc, k) => {
      return acc.replace(`{${k}}`, vars[k]);
    }, raw);
  };

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

// Dışarıya Language tipini de eskisi gibi export edelim:
export type { Language };
