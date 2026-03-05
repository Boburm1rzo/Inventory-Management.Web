import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./en.json";
import uzTranslations from "./uz.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    uz: { translation: uzTranslations },
  },
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
