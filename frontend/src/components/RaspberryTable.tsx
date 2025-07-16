import React from "react";
import {
  Activity,
  Gauge,
  HardDrive,
  Flame,
  Server,
  BatteryFull,
  CheckCircle,
  XCircle,
  FolderOpen,
  RotateCcw
} from "lucide-react";

interface DiskInfo {
  total: number;
  used: number;
  free: number;
}

interface UsbDisk {
  mount: string;
  device: string;
  total: number;
  used: number;
  free: number;
  percent: number;
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
  disk_info?: DiskInfo;
  usb?: UsbDisk[];
  uptime?: number;
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

interface RaspberryTableProps {
  statusList: StatusData[];
  onReboot: (ip: string) => void;
  logsByRaspberry: LogsByRaspberry[];
}

export const RaspberryTable: React.FC<RaspberryTableProps> = ({ statusList, onReboot, logsByRaspberry }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-900 rounded-lg shadow">
        <thead>
          <tr className="text-white text-center">
            <th className="px-2 py-2"><Server className="inline" /> IP</th>
            <th className="px-2 py-2"><CheckCircle className="inline" /> Estado</th>
            <th className="px-2 py-2"><Activity className="inline" /> CPU (%)</th>
            <th className="px-2 py-2"><Gauge className="inline" /> RAM (%)</th>
            <th className="px-2 py-2"><HardDrive className="inline" /> Disco (%)</th>
            <th className="px-2 py-2"><Flame className="inline" /> Temp (°C)</th>
            <th className="px-2 py-2"><Server className="inline" /> Hostname</th>
            <th className="px-2 py-2"><BatteryFull className="inline" /> Batería</th>
            <th className="px-2 py-2">Uptime</th>
            <th className="px-2 py-2"><FolderOpen className="inline" /> Discos</th>
            <th className="px-2 py-2"><RotateCcw className="inline" /> Reboot</th>
          </tr>
        </thead>
        <tbody>
          {statusList.map((status, idx) => {
            return (
            <tr key={status.ip || idx} className="text-center text-gray-200 hover:bg-gray-800 transition">
              <td className="px-2 py-1 font-mono">{status.ip}</td>
              <td className="px-2 py-1">
                {status.error ? (
                  <span className="flex items-center justify-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-600 text-white">
                    <XCircle size={16} /> Offline
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-600 text-white">
                    <CheckCircle size={16} /> Online
                  </span>
                )}
              </td>
              <td className="px-2 py-1">{status.cpu !== undefined ? status.cpu : "-"}</td>
              <td className="px-2 py-1">{status.ram !== undefined ? status.ram : "-"}</td>
              <td className="px-2 py-1">{status.disk !== undefined ? status.disk : "-"}</td>
              <td className="px-2 py-1">{status.temp !== undefined && status.temp !== null ? status.temp : "-"}</td>
              <td className="px-2 py-1">{status.hostname || "-"}</td>
              <td className="px-2 py-1">
                {status.battery ? `${status.battery.voltage}V (${status.battery.status})` : "-"}
              </td>
              <td className="px-2 py-1">{
                typeof status.uptime === "number"
                  ? formatUptime(status.uptime)
                  : "-"
              }</td>
              <td className="px-2 py-1 text-left">
                {status.disk_info && (
                  <div className="text-xs">
                    <div>Total: {status.disk_info.total} GB</div>
                    <div>Usado: {status.disk_info.used} GB</div>
                    <div>Libre: {status.disk_info.free} GB</div>
                  </div>
                )}
                {status.usb && status.usb.length > 0 && (
                  <div className="mt-1 text-xs">
                    {status.usb.map((usb, i) => (
                      <div key={i} className="border-t border-gray-700 pt-1 mt-1">
                        <div>USB: {usb.device} ({usb.mount})</div>
                        <div>Total: {usb.total} GB</div>
                        <div>Usado: {usb.used} GB</div>
                        <div>Libre: {usb.free} GB</div>
                        <div>Uso: {usb.percent}%</div>
                      </div>
                    ))}
                  </div>
                )}
                {!(status.disk_info || (status.usb && status.usb.length > 0)) && "-"}
              </td>
              <td className="px-2 py-1">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  onClick={() => onReboot(status.ip)}
                  disabled={!!status.error}
                  title={status.error ? "No disponible" : "Reiniciar Raspberry Pi"}
                >
                  <RotateCcw size={16} className="inline mr-1" />
                  Reboot
                </button>
              </td>
              </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
};

function formatUptime(uptime: number): string {
  if (uptime < 60) return `${uptime}s`;
  const m = Math.floor(uptime / 60);
  const s = uptime % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h < 24) return `${h}h ${min}m ${s}s`;
  const d = Math.floor(h / 24);
  const hr = h % 24;
  return `${d}d ${hr}h ${min}m`;
}
