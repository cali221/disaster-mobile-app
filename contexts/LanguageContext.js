import React, { createContext, useState, useCallback, useMemo } from "react";;
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
    const { t, i18n } = useTranslation();

    // currently used
    const [currentLang, setCurrentLang] = useState(i18n.resolvedLanguage);

    // function to handle language change
    const handleLangChange = useCallback((langCode)=>{
        if(langCode != 'en' && langCode != 'id'){
            throw new Error(`${t('shared.unrecognizedLangCodeError')}`)
        }

        i18n.changeLanguage(langCode);
        setCurrentLang(langCode);
    }, []);

  const contextValue = useMemo(() => ({
    currentLang, 
    handleLangChange
  }), [currentLang, 
       handleLangChange]);

   return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;