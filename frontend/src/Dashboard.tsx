import { useEffect, useState } from "react";
import { RPI_BASE_URL } from "./config";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./i18n";
import { RaspberryCard } from "./components/RaspberryCard";
import { RaspberryLogsCard } from "./components/RaspberryLogsCard";
import { DeviceAdmin } from "./components/DeviceAdmin";
import { MetricChart } from "./components/MetricChart";
import { AlertBanner } from "./components/AlertBanner";
import { AlertHistory } from "./components/AlertHistory";
import { UserAdmin } from "./components/UserAdmin";
import { Card, BatteryIcon } from "./components/Shared";
import { Spinner } from "./components/Spinner";
import { LoginForm } from "./components/LoginForm";
import {
  TerminalSquare,
  RefreshCcw,
  WifiOff,
  Wifi,
} from "lucide-react";

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

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [statusList, setStatusList] = useState<StatusData[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastPing, setLastPing] = useState<string>("");
  const [logsByRaspberry, setLogsByRaspberry] = useState<LogsByRaspberry[]>([]);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<"dashboard" | "admin" | "alerts">("dashboard");
  const [devices, setDevices] = useState<any[]>([]);
  const [showChart, setShowChart] = useState<{ deviceId: number; name: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => isTokenValid(localStorage.getItem("token")));
  const [userRole, setUserRole] = useState<string | null>(() => getUserRole());

  // Mapear IP a deviceId y nombre
  const devicesByIp = useMemo(() => {
    const map: Record<string, { id: number; name: string }> = {};
    devices.forEach((d) => { map[d.ip] = { id: d.id, name: d.name }; });
    return map;
  }, [devices]);

  // Obtener lista de dispositivos para mapear IP a ID
  useEffect(() => {
    fetch(`${RPI_BASE_URL}/devices/`).then(res => res.json()).then(setDevices);
  }, []);

  // Función para agregar el token a las peticiones protegidas
  function authFetch(input: RequestInfo, init: RequestInit = {}) {
    const token = localStorage.getItem("token");
    return fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  }

  const fetchStatus = async () => {
    const now = new Date().toLocaleTimeString();
    setLastPing(now);
    setLoading(true);
    setGlobalError("");
    try {
      const res = await fetch(`${RPI_BASE_URL}/status`);
      if (!res.ok) throw new Error("No se pudo conectar con el backend");
      const data = await res.json();
      setStatusList(Array.isArray(data) ? data : []);
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
      setStatusList([]);
      setGlobalError("No se pudo conectar con el backend. Verifica la red o el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${RPI_BASE_URL}/log`);
      if (!res.ok) throw new Error("No se pudo conectar con el backend");
      const data = await res.json();
      setLogsByRaspberry(Array.isArray(data) ? data : []);
    } catch (err) {
      setLogsByRaspberry([]);
      setGlobalError("No se pudo obtener el historial de logs.");
    }
  };

  // Peticiones protegidas
  const rebootDevice = async () => {
    try {
      await authFetch(`${RPI_BASE_URL}/reboot`, { method: "POST" });
      alert("Reboot command sent successfully.");
    } catch (err) {
      alert("Failed to send reboot command.");
    }
  };

  const toggleTerminal = () => {
    setShowTerminal((prev) => !prev);
  };

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
          if (data.metrics) {/* podrías usarlo para actualizar gráficas en tiempo real */}
          if (data.alerts) {/* podrías usarlo para alertas en tiempo real */}
        } catch {}
      };
    }
    connectWS();
    // Polling de respaldo si WebSocket no está activo
    fetchStatus();
    fetchLogs();
    interval = setInterval(() => {
      if (!wsActive) {
        fetchStatus();
        fetchLogs();
      }
    }, 10000);
    return () => {
      if (ws) ws.close();
      if (interval) clearInterval(interval);
    };
  }, []);

  // Logout
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
      {/* Tabs */}
      <div className="flex gap-2 mb-4 items-center">
        <select
          className="bg-gray-800 text-white rounded px-2 py-1 mr-2"
          value={i18n.language}
          onChange={e => i18n.changeLanguage(e.target.value)}
        >
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
        <button
          className={`px-4 py-2 rounded-t ${tab === "dashboard" ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-300"}`}
          onClick={() => setTab("dashboard")}
        >
          {t("Dashboard")}
        </button>
        {userRole === "admin" && (
          <button
            className={`px-4 py-2 rounded-t ${tab === "admin" ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-300"}`}
            onClick={() => setTab("admin")}
          >
            {t("Administrar Dispositivos")}
          </button>
        )}
        <button
          className={`px-4 py-2 rounded-t ${tab === "alerts" ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-300"}`}
          onClick={() => setTab("alerts")}
        >
          {t("Historial de Alertas")}
        </button>
        <button
          className="ml-auto px-4 py-2 rounded bg-red-700 text-white"
          onClick={handleLogout}
        >
          {t("Cerrar sesión")}
        </button>
      </div>
      {tab === "dashboard" ? (
        <>
          {/* Alertas activas */}
          <AlertBanner />
          {/* Error global */}
          {globalError && (
            <div className="bg-red-700 text-white px-4 py-2 rounded mb-2 text-center font-semibold">
              {globalError}
            </div>
          )}
          {/* Estado y ping */}
          <div className="flex items-center justify-between">
            <div
              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                isOnline ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              {isOnline ? (
                <span className="flex items-center gap-2">
                  <Wifi size={14} /> Online
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <WifiOff size={14} /> Offline
                </span>
              )}
            </div>
            <div className="text-sm text-gray-300">Último ping: {lastPing}</div>
          </div>

          {/* Panel de métricas tipo matriz (grid) para varias Raspberry Pi */}
          {loading ? (
            <Spinner />
          ) : statusList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusList.map((status, i) => (
              <div key={status.ip || i} className="cursor-pointer" onClick={() => {
              const device = devicesByIp[status.ip];
              if (device) setShowChart({ deviceId: device.id, name: device.name });
              }} title="Ver histórico de métricas">
              <RaspberryCard status={status} />
              </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400">No se pudo obtener datos.</div>
          )}

          {/* Botones */}
          <div className="flex flex-col items-center gap-4 mt-4">
            {/* Botón Reboot */}
            <button
              onClick={rebootDevice}
              className="w-96 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2 transition"
            >
              <RefreshCcw size={18} />
              Reboot Device
            </button>

            {/* Botón Open Remote Terminal */}
            <button
              onClick={toggleTerminal}
              className="w-96 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 transition"
            >
              <TerminalSquare size={18} />
              {showTerminal ? "Close Remote Terminal" : "Open Remote Terminal"}
            </button>

            {/* Consola embebida */}
            {showTerminal && (
              <iframe
                src="http://192.168.190.29:7681"
                className="w-full h-96 mt-4 border rounded shadow"
                title="Remote Terminal"
              />
            )}
          </div>

          {/* Historial de conexión por Raspberry Pi */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Historial de conexión</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logsByRaspberry.map((rasp, idx) => (
                <RaspberryLogsCard key={rasp.ip || idx} rasp={rasp} />
              ))}
            </div>
          </div>
          {/* Modal de gráfica de métricas */}
          {showChart && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
                <button
                  className="absolute top-2 right-2 text-white bg-red-600 rounded-full px-2 py-1 hover:bg-red-700"
                  onClick={() => setShowChart(null)}
                  aria-label="Cerrar"
                >
                  ✕
                </button>
                <h2 className="text-lg font-bold mb-4">Histórico de métricas: {showChart.name}</h2>
                <MetricChart deviceId={showChart.deviceId} />
              </div>
            </div>
          )}
        </>
      ) : tab === "admin" ? (
        userRole === "admin" ? (
          <>
            <DeviceAdmin />
            <div className="mt-8">
              <UserAdmin />
            </div>
          </>
        ) : (
          <div className="text-red-400">No tienes permisos de administrador.</div>
        )
      ) : (
        <AlertHistory />
      )}
    </div>
  );
}

// Card y BatteryIcon ahora están en ./components/Shared