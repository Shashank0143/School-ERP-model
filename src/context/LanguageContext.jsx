import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { translations } from "../translations";
import { useAuth } from "./AuthContext";
import { ROLES } from "../auth/roles";

const LanguageContext = createContext();

const LANG_STORAGE_KEY = "edudash_lang_pref";

export function LanguageProvider({ children }) {
  const { role } = useAuth();
  
  // Initialize state
  const [lang, setLang] = useState("en");

  // 1. Force English for non-parent roles, Restore for parents
  useEffect(() => {
    if (role) {
      if (role !== ROLES.PARENT) {
        if (lang !== "en") setLang("en");
      } else {
        // Restore parent's saved preference on role switch/init
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved && saved !== lang) {
          setLang(saved);
        }
      }
    }
  }, [role]);

  // 2. Persist parent preference only
  useEffect(() => {
    if (role === ROLES.PARENT) {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
  }, [lang, role]);

  const handleSetLang = useCallback((newLang) => {
    if (role === ROLES.PARENT) {
      setLang(newLang);
    }
  }, [role]);

  const t = useCallback(
    (key, params = {}) => {
      if (!key) return "";
      
      let text = translations[lang]?.[key] || key;
      
      // Ensure text is a string before calling replace
      if (typeof text !== "string") text = String(text);

      // Only iterate if params is a non-null object
      if (params && typeof params === "object" && !Array.isArray(params)) {
        Object.keys(params).forEach((paramKey) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), params[paramKey]);
        });
      }
      
      return text;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang: handleSetLang, t }), [lang, handleSetLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
