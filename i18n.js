import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './languages/en';
import { id } from './languages/id';
import AsyncStorage from "@react-native-async-storage/async-storage";

const languageDetector = {
  type: "languageDetector",
  async: true,
  init: () => {},
  detect: async function (callback) {
    try {
      const chosenLang = await AsyncStorage.getItem('chosenLanguage');

      if(chosenLang){
        console.log(chosenLang)
        return callback(chosenLang);
      }
      else{
        console.log('no chosenLang');
        return callback('en');
      }
    } 
    catch(error) {
      alert(error.message ?? JSON.stringify(error));
    }
  },
  cacheUserLanguage: async function (lang) {
    try {
      await AsyncStorage.setItem('chosenLanguage', lang);
    } 
    catch (error) {
      alert(error.message ?? JSON.stringify(error));
    }
  },
}

i18n.use(initReactI18next).use(languageDetector).init({
    resources: {
      en: { translation: en },
      id: { translation: id }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });
export default i18n;