"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage, LANGUAGES } from "../contexts/LanguageContext";

const CODE_TO_SHORT: Record<string, string> = {
  deu: "DE",
  eng: "EN",
  esp: "ES",
  fra: "FR",
  ita: "IT",
  jpn: "JP",
  kor: "KR",
  pol: "PL",
  ptb: "PT",
  rus: "RU",
  spa: "LA",
  tha: "TH",
  tur: "TR",
  zhs: "CN",
};

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-colors"
        aria-label="Select language"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <span className="text-xs font-medium">{CODE_TO_SHORT[lang] || "EN"}</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-48 max-h-80 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-xl shadow-black/30 z-50"
        >
          <div className="py-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  l.code === lang
                    ? "text-[var(--accent-gold)] bg-[var(--bg-card)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                }`}
              >
                <span className="font-medium">{l.name}</span>
                <span className="text-xs text-[var(--text-muted)] ml-2">{CODE_TO_SHORT[l.code]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
