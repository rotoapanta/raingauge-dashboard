/**
 * LoginForm.tsx
 *
 * Login form component for user authentication. Shows errors and visual feedback.
 * Stores JWT token in localStorage on successful login.
 *
 * Componente de formulario de inicio de sesión para autenticación de usuario. Muestra errores y feedback visual.
 * Guarda el token JWT en localStorage al autenticarse correctamente.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RPI_BASE_URL } from "../config";
import logo from "../assets/logo-raspberry-pi-dashboard.png";

interface LoginFormProps {
  onLogin: () => void;
}

/**
 * Login form with local authentication. Handles form state, error display, and password visibility toggle.
 *
 * Formulario de login con autenticación local. Maneja el estado del formulario, muestra errores y permite alternar la visibilidad de la contraseña.
 */
export function LoginForm({ onLogin }: LoginFormProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle login form submission
  // Manejar el envío del formulario de login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = "/auth/local-login";
      const res = await fetch(`${RPI_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication error");
      localStorage.setItem("token", data.access_token);
      onLogin();
    } catch (e: any) {
      setError(e.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Login form container / Contenedor del formulario de login
    <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded shadow max-w-sm mx-auto mt-12 flex flex-col gap-4">
      <img src={logo} alt="Raspberry Pi Dashboard Logo" className="mx-auto mb-4 w-72 h-72 object-contain" />
      <h2 className="text-lg font-bold mb-2">Sign In</h2>
      {/* Error message / Mensaje de error */}
      {error && <div className="text-red-400">{error}</div>}
      <input
        type="text"
        placeholder={t("Username")}
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="p-2 rounded bg-gray-800 text-white"
        required
      />
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={t("Password")}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white w-full pr-10"
          required
        />
        {/* Password visibility toggle / Alternar visibilidad de la contraseña */}
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? t("Signing in...") : t("Sign In")}
      </button>
    </form>
  );
}
