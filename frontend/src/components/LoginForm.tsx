import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RPI_BASE_URL } from "../config";

export function LoginForm({ onLogin }: { onLogin: () => void }) {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"ad" | "local">("ad");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "ad" ? "/auth/login" : "/auth/local-login";
      const res = await fetch(`${RPI_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error de autenticación");
      localStorage.setItem("token", data.access_token);
      onLogin();
    } catch (e: any) {
      setError(e.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded shadow max-w-sm mx-auto mt-12 flex flex-col gap-4">
      <h2 className="text-lg font-bold mb-2">{t("Iniciar sesión")}</h2>
      <div className="flex gap-2 mb-2">
        <label className="flex items-center gap-1">
          <input type="radio" name="mode" value="ad" checked={mode === "ad"} onChange={() => setMode("ad")}/>
          AD
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="mode" value="local" checked={mode === "local"} onChange={() => setMode("local")}/>
          Local
        </label>
      </div>
      {error && <div className="text-red-400">{error}</div>}
      <input
        type="text"
        placeholder={mode === "ad" ? t("Usuario AD") : t("Usuario")}
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="p-2 rounded bg-gray-800 text-white"
        required
      />
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={t("Contraseña")}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white w-full pr-10"
          required
        />
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
        {loading ? t("Ingresando...") : t("Ingresar")}
      </button>
    </form>
  );
}
