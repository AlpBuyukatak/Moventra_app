"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Language = "en" | "de" | "tr";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

type LanguageProviderProps = {
  children: ReactNode;
  // SSR tarafında (layout’tan) gelen ilk dil
  initialLanguage?: Language;
};

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Client’ta localStorage / navigator bilgisine bak
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("moventra-language");
    if (stored === "en" || stored === "de" || stored === "tr") {
      setLanguageState(stored);
      return;
    }

    // localStorage yoksa navigator’dan tahmin et
    const navLang =
      navigator.language || (navigator as any).userLanguage || "en";

    let detected: Language = initialLanguage;

    if (navLang.startsWith("tr")) detected = "tr";
    else if (navLang.startsWith("de")) detected = "de";
    else detected = "en";

    setLanguageState(detected);
    window.localStorage.setItem("moventra-language", detected);
  }, [initialLanguage]);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("moventra-language", lang);
      } catch {
        // sessiz geç
      }
      // Cookie de yazalım ki SSR tarafı aynı dili yakalasın
      document.cookie = `moventra_lang=${lang}; path=/; max-age=31536000`;
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
