/**
 * Dashboard.tsx
 *
 * Main dashboard component for device and user management, metrics, and real-time status.
 * Handles authentication, data fetching, and UI tab navigation.
 *
 * Componente principal del dashboard para la gestión de dispositivos y usuarios, métricas y estado en tiempo real.
 * Maneja autenticación, obtención de datos y navegación de pestañas en la interfaz.
 */

import { useEffect, useState, useMemo } from "react";
import { RPI_BASE_URL } from "./config";
import { useTranslation } from "react-i18next";
import "./i18n";
import { RaspberryTable } from "./components/RaspberryTable";
import { DeviceAdmin } from "./components/DeviceAdmin";
import { UserAdmin } from "./components/UserAdmin";
import { Spinner } from "./components/Spinner";
import { LoginForm } from "./components/LoginForm";

// Get user role from JWT token
// Obtener el rol de usuario desde el token JWT
function getUserRole(): string | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

interface StatusData {
  ip: string;
  cpu?: number;
  ram?: number;
  disk?: number;
  temp?: number | null;
  hostname?: string;
  battery?: {
    voltage: number;
    status: string;
  };
  error?: string;
}

interface LogEntry {
  timestamp: string;
  status: string;
}

interface LogsByRaspberry {
  ip: string;
  logs: LogEntry[] | { error: string };
}

// Check if JWT token is valid
// Verificar si el token JWT es válido
function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/**
 * Dashboard main component for device and user management, metrics, and real-time status.
 *
 * Componente principal del dashboard para gestión de dispositivos y usuarios, métricas y estado en tiempo real.
 */
export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [statusList, setStatusList] = useState<StatusData[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastPing, setLastPing] = useState<string>("");
  const [logsByRaspberry, setLogsByRaspberry] = useState<LogsByRaspberry[]>([]);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<"dashboard" | "admin">("dashboard");
  const [devices, setDevices] = useState<any[]>([]);
  const [showChart, setShowChart] = useState<{ deviceId: number; name: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => isTokenValid(localStorage.getItem("token")));
  const [userRole, setUserRole] = useState<string | null>(() => getUserRole());
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Map IP to deviceId and name
  // Mapear IP a deviceId y nombre
  const devicesByIp = useMemo(() => {
    const map: Record<string, { id: number; name: string }> = {};
    devices.forEach((d) => { map[d.ip] = { id: d.id, name: d.name }; });
    return map;
  }, [devices]);

  // Fetch device list to map IP to ID on mount
  // Obtener lista de dispositivos para mapear IP a ID al montar el componente
  useEffect(() => {
    fetch(`${RPI_BASE_URL}/devices/`).then(res => res.json()).then(setDevices);
  }, []);

  // authFetch and toggleTerminal removed as unused
  // authFetch y toggleTerminal eliminados por no usarse

  // Fetch status from backend
  // Obtener estado desde el backend
  const fetchStatus = async () => {
    const now = new Date().toLocaleTimeString();
    setLastPing(now);
    setLoading(true);
    setGlobalError("");
    try {
      const res = await fetch(`${RPI_BASE_URL}/api/v1/status`);
      if (!res.ok) throw new Error("Could not connect to backend");
      const data = await res.json();
      setStatusList(Array.isArray(data) ? data : []);
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
      setStatusList([]);
      setGlobalError("Could not connect to backend. Check network or server.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs from backend
  // Obtener logs desde el backend
  const fetchLogs = async () => {
    try {
      const res = await fetch(`${RPI_BASE_URL}/log`);
      if (!res.ok) throw new Error("Could not connect to backend");
      const data = await res.json();
      setLogsByRaspberry(Array.isArray(data) ? data : []);
      // Check if all logs failed
      // Verificar si todos los logs fallaron
      if (Array.isArray(data) && data.length > 0) {
        const allFail = data.every((d) => d.logs && d.logs.error);
        const someFail = data.some((d) => d.logs && d.logs.error);
        if (allFail) {
          setGlobalError("Could not get log history from any device.");
        } else if (someFail) {
          setGlobalError("Some devices did not respond when fetching log history.");
        } else {
          setGlobalError("");
        }
      } else {
        setGlobalError("Could not get log history.");
      }
    } catch (err) {
      setLogsByRaspberry([]);
      setGlobalError("Could not get log history.");
    }
  };

  // WebSocket and polling for real-time updates
  // WebSocket y polling para actualizaciones en tiempo real
  useEffect(() => {
    let ws: WebSocket | null = null;
    let wsActive = false;
    let interval: NodeJS.Timeout | null = null;

    function connectWS() {
      ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/status`);
      ws.onopen = () => { wsActive = true; };
      ws.onclose = () => { wsActive = false; };
      ws.onerror = () => { wsActive = false; };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.devices) setDevices(data.devices);
          if (data.metrics) {/* could be used for real-time chart updates / podría usarse para actualizar gráficas en tiempo real */}
          if (data.alerts) {/* could be used for real-time alerts / podría usarse para alertas en tiempo real */}
        } catch {}
      };
    }

    if (tab === "dashboard") {
      connectWS();
      fetchStatus();
      fetchLogs();
      interval = setInterval(() => {
        fetchStatus();
        fetchLogs();
      }, 10000);
    }

    return () => {
      if (ws) ws.close();
      if (interval) clearInterval(interval);
    };
  }, [tab]);

  // Logout handler
  // Manejador de cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => {
      setIsAuthenticated(true);
      setUserRole(getUserRole());
    }} />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Tabs / Pestañas */}
      <div className="flex gap-2 mb-4 items-center flex-wrap">
        <button
          className={`px-4 py-2 md:px-6 md:py-3 rounded-t text-base md:text-lg font-semibold transition-all duration-150 ${tab === "dashboard" ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          onClick={() => setTab("dashboard")}
        >
          {t("Dashboard")}
        </button>
        {userRole === "admin" && (
          <button
            className={`px-4 py-2 md:px-6 md:py-3 rounded-t text-base md:text-lg font-semibold transition-all duration-150 ${tab === "admin" ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            onClick={() => setTab("admin")}
          >
            {t("Manage Devices and Users")}
          </button>
        )}
        {/* Alert history button removed / Botón de historial de alertas eliminado */}
        <button
          className="ml-auto px-4 py-2 md:px-6 md:py-3 rounded bg-red-700 text-white text-base md:text-lg font-semibold"
          onClick={handleLogout}
        >
          Logout {(() => {
            try {
              const token = localStorage.getItem("token");
              if (!token) return "";
              const payload = JSON.parse(atob(token.split(".")[1]));
              return payload.name ? `(${payload.name})` : payload.username ? `(${payload.username})` : "";
            } catch {
              return "";
            }
          })()}
        </button>
      </div>
      {successMessage && (
        <div className="bg-green-700 text-white px-4 py-2 rounded mb-2 text-center font-semibold">
          {successMessage}
        </div>
      )}
      {tab === "dashboard" ? (
        <>
          {/* Global error removed, only message if no accessible devices / Error global eliminado, solo mensaje si no hay dispositivos accesibles */}
          {/* State and ping removed / Estado y ping eliminado */}

          {/* Metrics panel (table) for multiple Raspberry Pi / Panel de métricas tipo matriz (tabla) para varias Raspberry Pi */}
          {loading ? (
            <Spinner />
          ) : statusList.length > 0 ? (
            <RaspberryTable
              statusList={statusList}
              logsByRaspberry={logsByRaspberry}
            />
          ) : null}

          {/* Metrics chart modal / Modal de gráfica de métricas */}
          {showChart && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
                <button
                  className="absolute top-2 right-2 text-white bg-red-600 rounded-full px-2 py-1 hover:bg-red-700"
                  onClick={() => setShowChart(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
                <h2 className="text-lg font-bold mb-4">Metrics history: {showChart.name}</h2>
                {/* MetricChart removed: no chart implementation */}
              </div>
            </div>
          )}
        </>
      ) : tab === "admin" ? (
        userRole === "admin" ? (
          <>
            <DeviceAdmin onSuccess={msg => setSuccessMessage(msg)} />
            <div className="mt-8">
              <UserAdmin onSuccess={msg => setSuccessMessage(msg)} />
            </div>
          </>
        ) : null
      ) : null}
    </div>
  );
}
