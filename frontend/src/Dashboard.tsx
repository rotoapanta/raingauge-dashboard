import { useEffect, useState } from "react";
import { RPI_BASE_URL } from "./config";
import { RaspberryCard } from "./components/RaspberryCard";
import { RaspberryLogsCard } from "./components/RaspberryLogsCard";
import { Card, BatteryIcon } from "./components/Shared";
import { Spinner } from "./components/Spinner";
import {
  TerminalSquare,
  RefreshCcw,
  WifiOff,
  Wifi,
} from "lucide-react";

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

export default function Dashboard() {
  const [statusList, setStatusList] = useState<StatusData[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastPing, setLastPing] = useState<string>("");
  const [logsByRaspberry, setLogsByRaspberry] = useState<LogsByRaspberry[]>([]);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

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

  const rebootDevice = async () => {
    try {
      await fetch(`${RPI_BASE_URL}/reboot`, { method: "POST" });
      alert("Reboot command sent successfully.");
    } catch (err) {
      alert("Failed to send reboot command.");
    }
  };

  const toggleTerminal = () => {
    setShowTerminal((prev) => !prev);
  };

  useEffect(() => {
    fetchStatus();
    fetchLogs();
    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 space-y-4">
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
            <RaspberryCard key={status.ip || i} status={status} />
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
    </div>
  );
}

// Card y BatteryIcon ahora están en ./components/Shared