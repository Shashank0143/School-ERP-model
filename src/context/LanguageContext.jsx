import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { translations } from "../translations";
import { useAuth } from "./AuthContext";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const [lang, setLang] = useState("en");

  const handleSetLang = useCallback((newLang) => {
    // Future-ready: check permissions
    if (user?.role === 'student' && newLang === 'hi') {
      console.warn("Student role primarily uses English. Translation enabled for Parent only in future production.");
    }
    setLang(newLang);
  }, [user]);

  const t = useCallback(
    (key, params = {}) => {
      let text = translations[lang]?.[key] || key;
      
      // Simple interpolation: replace {name} with params.name
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), params[paramKey]);
      });
      
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
