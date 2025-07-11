import { useEffect, useState } from "react";
import { RPI_BASE_URL } from "./config";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Thermometer,
  Terminal,
  TerminalSquare,
  RefreshCcw,
  Battery,
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

  const fetchStatus = async () => {
    const now = new Date().toLocaleTimeString();
    setLastPing(now);
    try {
      const res = await fetch(`${RPI_BASE_URL}/status`);
      if (!res.ok) throw new Error("Offline");
      const data = await res.json();
      setStatusList(Array.isArray(data) ? data : []);
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
      setStatusList([]);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${RPI_BASE_URL}/log`);
      const data = await res.json();
      setLogsByRaspberry(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching logs");
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
      {statusList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statusList.map((status, i) => (
            <div key={status.ip || i} className="bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-blue-300">{status.ip}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.error ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                  {status.error ? "Offline" : "Online"}
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                <Card icon={<Cpu />} title="CPU" value={status.cpu !== undefined ? `${status.cpu}%` : "-"} small />
                <Card icon={<MemoryStick />} title="RAM" value={status.ram !== undefined ? `${status.ram}%` : "-"} small />
                <Card icon={<HardDrive />} title="Disco" value={status.disk !== undefined ? `${status.disk}%` : "-"} small />
                <Card icon={<Thermometer />} title="Temp" value={status.temp !== undefined ? `${status.temp}°C` : "-"} small />
                <Card icon={<Terminal />} title="Hostname" value={status.hostname || "-"} small />
                <Card icon={<BatteryIcon status={status.battery && typeof status.battery.status === 'string' ? status.battery.status : ""} />} title="Batería" value={status.battery && typeof status.battery.voltage === 'number' && typeof status.battery.status === 'string' ? `${status.battery.voltage}V (${status.battery.status})` : "-"} small />
              </div>
              {status.error && (
                <div className="text-xs text-red-400 mt-2">No disponible</div>
              )}
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
            <div key={rasp.ip || idx} className="bg-gray-900 rounded-lg shadow p-4">
              <div className="font-mono text-blue-300 mb-2">{rasp.ip}</div>
              {Array.isArray(rasp.logs) ? (
                <table className="min-w-full text-white text-sm rounded shadow">
                  <thead>
                    <tr className="bg-gray-700 text-left">
                      <th className="px-4 py-2">Fecha / Hora</th>
                      <th className="px-4 py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rasp.logs.slice().reverse().map((log: LogEntry, i: number) => (
                      <tr key={i} className="border-t border-gray-700">
                        <td className="px-4 py-2">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td
                          className={`px-4 py-2 font-bold ${
                            log.status === "ONLINE" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {log.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-red-400 text-sm">No disponible</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  value,
  small = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${small ? "bg-gray-900 rounded p-2" : "bg-gray-800 rounded-lg shadow p-4"}`}>
      <div className="text-blue-400">{icon}</div>
      <div>
        <h2 className={small ? "text-xs font-semibold" : "text-lg font-semibold"}>{title}</h2>
        <p className={small ? "text-base font-bold" : "text-2xl font-bold"}>{value}</p>
      </div>
    </div>
  );
}

function BatteryIcon({ status }: { status: string }) {
  const color =
    status === "CRITICAL"
      ? "text-red-600"
      : status === "LOW"
      ? "text-yellow-400"
      : "text-green-400";
  return (
    <div className={color}>
      <Battery />
    </div>
  );
}