/**
 * main.tsx
 *
 * Entry point for the React application. Renders the App component (which wraps the Dashboard) into the root DOM element.
 *
 * Punto de entrada para la aplicación React. Renderiza el componente App (que envuelve el Dashboard) en el elemento raíz del DOM.
 */

// Import React and ReactDOM libraries
// Importar las librerías React y ReactDOM
import React from "react";
import ReactDOM from "react-dom/client";

// Import main components and styles
// Importar los componentes principales y estilos
import Dashboard from "./Dashboard";
import App from "./App";
import "./index.css";

// Render the App (with Dashboard inside) into the root element
// Renderizar App (con Dashboard dentro) en el elemento raíz
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App>
        <Dashboard />
      </App>
    </React.StrictMode>
  );
});
