import React from "react";
import ReactDOM from "react-dom/client";
import Dashboard from "./Dashboard";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App>
      <Dashboard />
    </App>
  </React.StrictMode>
);
