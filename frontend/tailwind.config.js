/**
 * tailwind.config.js
 *
 * Main configuration file for Tailwind CSS. Defines content paths, theme extensions, and plugins.
 *
 * Archivo principal de configuración de Tailwind CSS. Define rutas de contenido, extensiones de tema y plugins.
 */

module.exports = {
  // Paths to all template files / Rutas a todos los archivos de plantilla
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {} // Extend default theme here / Extiende el tema por defecto aquí
  },
  plugins: [] // Add Tailwind plugins here / Agrega plugins de Tailwind aquí
}
