/**
 * App.tsx
 *
 * Root component for the React application. Wraps all content and provides a common layout with a footer.
 *
 * Componente raíz para la aplicación React. Envuelve todo el contenido y proporciona un diseño común con un pie de página.
 */

import React from "react";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    // Main container for the app
    // Contenedor principal de la aplicación
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Render child components here / Renderizar los componentes hijos aquí */}
        {children}
      </div>
      {/* Footer with credits / Pie de página con créditos */}
      <footer className="bg-gray-900 text-gray-400 text-sm py-3 text-center border-t border-gray-800">
        Raspberry Pi Dashboard · IG-EPN · © 2025 · Desarrollado por Roberto Toapanta @rotoapanta
      </footer>
    </div>
  );
}
