/**
 * vite.config.ts
 *
 * Main configuration file for Vite in this React project. Sets up plugins and development server options.
 *
 * Archivo principal de configuración de Vite para este proyecto React. Configura plugins y opciones del servidor de desarrollo.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react() // React plugin for Vite / Plugin de React para Vite
  ],
  server: {
    host: true, // Listen on all network interfaces / Escuchar en todas las interfaces de red
    port: 5173  // Development server port / Puerto del servidor de desarrollo
  }
})
