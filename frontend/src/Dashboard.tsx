import { useEffect, useState, useMemo } from "react";
import { RPI_BASE_URL } from "./config";
import { useTranslation } from "react-i18next";
import "./i18n";
import { RaspberryTable } from "./components/RaspberryTable";
import { DeviceAdmin } from "./components/DeviceAdmin";
import { MetricChart } from "./components/MetricChart";
import { AlertBanner } from "./components/AlertBanner";
import { UserAdmin } from "./components/UserAdmin";
import { Spinner } from "./components/Spinner";
import { LoginForm } from "./components/LoginForm";

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
  const [tab, setTab] = useState<"dashboard" | "admin">("dashboard");
  const [devices, setDevices] = useState<any[]>([]);
  const [showChart, setShowChart] = useState<{ deviceId: number; name: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => isTokenValid(localStorage.getItem("token")));
  const [userRole, setUserRole] = useState<string | null>(() => getUserRole());
  const [successMessage, setSuccessMessage] = useState<string>("");

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

  // authFetch y toggleTerminal eliminados por no usarse

  const fetchStatus = async () => {
    const now = new Date().toLocaleTimeString();
    setLastPing(now);
    setLoading(true);
    setGlobalError("");
    try {
      const res = await fetch(`${RPI_BASE_URL}/api/v1/status`);
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
      // Verifica si todos los logs fallaron
      if (Array.isArray(data) && data.length > 0) {
        const allFail = data.every((d) => d.logs && d.logs.error);
        const someFail = data.some((d) => d.logs && d.logs.error);
        if (allFail) {
          setGlobalError("No se pudo obtener el historial de logs de ningún dispositivo.");
        } else if (someFail) {
          setGlobalError("Algunos dispositivos no respondieron al obtener el historial de logs.");
        } else {
          setGlobalError("");
        }
      } else {
        setGlobalError("No se pudo obtener el historial de logs.");
      }
    } catch (err) {
      setLogsByRaspberry([]);
      setGlobalError("No se pudo obtener el historial de logs.");
    }
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

  // Forzar actualización al cambiar a la pestaña dashboard
  useEffect(() => {
    if (tab === "dashboard") {
      fetchStatus();
      fetchLogs();
    }
  }, [tab]);

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
            {t("Administrar Dispositivos y Usuarios")}
          </button>
        )}
        {/* Botón de historial de alertas eliminado */}
        <button
          className="ml-auto px-4 py-2 rounded bg-red-700 text-white"
          onClick={handleLogout}
        >
          {t("Cerrar sesión")} {(() => {
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
          {/* Alertas activas */}
          <AlertBanner />
          {/* Error global eliminado, solo mensaje si no hay dispositivos accesibles */}
          {/* Estado y ping eliminado */}

          {/* Panel de métricas tipo matriz (tabla) para varias Raspberry Pi */}
          {loading ? (
            <Spinner />
          ) : statusList.length > 0 ? (
            <RaspberryTable
              statusList={statusList}
              logsByRaspberry={logsByRaspberry}
            />
          ) : null}

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