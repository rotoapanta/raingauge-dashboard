import React from "react";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <footer className="bg-gray-900 text-gray-400 text-sm py-3 text-center border-t border-gray-800">
        Raingauge Dashboard · IG-EPN · © 2025 · Desarrollado por Roberto Toapanta @rotoapanta
      </footer>
    </div>
  );
}
