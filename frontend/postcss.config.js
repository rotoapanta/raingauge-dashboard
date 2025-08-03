/**
 * postcss.config.js
 *
 * Main configuration file for PostCSS. Sets up plugins for CSS processing, including Tailwind CSS and Autoprefixer.
 *
 * Archivo principal de configuración de PostCSS. Configura plugins para el procesamiento de CSS, incluyendo Tailwind CSS y Autoprefixer.
 */

module.exports = {
  plugins: {
    tailwindcss: {},    // Tailwind CSS framework / Framework Tailwind CSS
    autoprefixer: {},   // Adds vendor prefixes / Agrega prefijos de navegador
  },
}
