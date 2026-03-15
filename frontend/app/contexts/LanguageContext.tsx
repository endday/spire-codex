"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export const LANGUAGES: { code: string; name: string }[] = [
  { code: "deu", name: "Deutsch" },
  { code: "eng", name: "English" },
  { code: "esp", name: "Español (ES)" },
  { code: "fra", name: "Français" },
  { code: "ita", name: "Italiano" },
  { code: "jpn", name: "日本語" },
  { code: "kor", name: "한국어" },
  { code: "pol", name: "Polski" },
  { code: "ptb", name: "Português (BR)" },
  { code: "rus", name: "Русский" },
  { code: "spa", name: "Español (LA)" },
  { code: "tha", name: "ไทย" },
  { code: "tur", name: "Türkçe" },
  { code: "zhs", name: "简体中文" },
];

const STORAGE_KEY = "spire-codex-lang";

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "eng",
  setLang: () => {},
});

function getInitialLang(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      return stored;
    }
  }
  return "eng";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = (code: string) => {
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
