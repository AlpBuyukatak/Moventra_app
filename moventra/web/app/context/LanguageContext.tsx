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

function detectInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem("moventra-language");
  if (stored === "en" || stored === "de" || stored === "tr") return stored;

  const navLang =
    navigator.language || (navigator as any).userLanguage || "en";

  if (navLang.startsWith("tr")) return "tr";
  if (navLang.startsWith("de")) return "de";
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    setLanguageState(detectInitialLanguage());
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("moventra-language", lang);
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
