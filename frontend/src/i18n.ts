/**
 * i18n.ts
 *
 * This file configures internationalization (i18n) for the React application using i18next and react-i18next.
 * It loads language resources and sets up the default language and fallback.
 *
 * Este archivo configura la internacionalización (i18n) para la aplicación React usando i18next y react-i18next.
 * Carga los recursos de idioma y establece el idioma por defecto y el de respaldo.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import English translations
// Importar traducciones al inglés
import en from "./locales/en.json";

// Initialize i18n with configuration
// Inicializar i18n con la configuración
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en }, // English resources / Recursos en inglés
  },
  lng: "en", // Default language / Idioma por defecto
  fallbackLng: "en", // Fallback language / Idioma de respaldo
  interpolation: { escapeValue: false }, // React already escapes / React ya escapa valores
});

export default i18n;
