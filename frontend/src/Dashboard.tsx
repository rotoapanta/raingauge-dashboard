import { useEffect, useState } from "react";
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
  cpu: number;
  ram: number;
  disk: number;
  temp: number | null;
  hostname: string;
  ip: string;
  battery: {
    voltage: number;
    status: string;
  };
}

interface LogEntry {
  timestamp: string;
  status: string;
}

export default function Dashboard() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastPing, setLastPing] = useState<string>("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  const fetchStatus = async () => {
    const now = new Date().toLocaleTimeString();
    setLastPing(now);
    try {
      const res = await fetch("http://localhost:8000/status");
      if (!res.ok) throw new Error("Offline");
      const data = await res.json();
      setStatus(data);
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
      setStatus(null);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:8000/log");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs");
    }
  };

  const rebootDevice = async () => {
    try {
      await fetch("http://localhost:8000/reboot", { method: "POST" });
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

      {/* Panel de métricas */}
      {status ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card icon={<Cpu />} title="CPU Usage" value={`${status.cpu}%`} />
          <Card icon={<MemoryStick />} title="RAM Usage" value={`${status.ram}%`} />
          <Card icon={<HardDrive />} title="Disk Usage" value={`${status.disk}%`} />
          <Card
            icon={<Thermometer />}
            title="CPU Temp"
            value={status.temp !== null ? `${status.temp} °C` : "N/A"}
          />
          <Card icon={<Terminal />} title="Hostname" value={status.hostname} />
          <Card icon={<Wifi />} title="IP Address" value={status.ip} />
          <Card
            icon={<BatteryIcon status={status.battery.status} />}
            title="Battery Voltage"
            value={`${status.battery.voltage} V (${status.battery.status})`}
          />
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

      {/* Historial de conexión */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Historial de conexión</h2>
        <table className="min-w-full bg-gray-900 text-white text-sm rounded shadow">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-4 py-2">Fecha / Hora</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice().reverse().map((log, i) => (
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
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4">
      <div className="text-blue-400">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-2xl font-bold">{value}</p>
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
