/**
 * RaspberryTable.tsx
 *
 * Component that displays a summary table of all Raspberry Pi devices and their main metrics.
 * Includes status, CPU, RAM, temperature, hostname, battery, uptime, and disks.
 *
 * Componente que muestra una tabla resumen de todas las Raspberry Pi y sus métricas principales.
 * Incluye estado, CPU, RAM, temperatura, hostname, batería, uptime y discos.
 */

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
  FolderOpen
} from "lucide-react";
import { useTranslation } from "react-i18next";

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
  logsByRaspberry: LogsByRaspberry[];
}

/**
 * Summary table of all Raspberry Pi devices and their main metrics.
 *
 * Tabla resumen de todas las Raspberry Pi y sus métricas principales.
 */
export const RaspberryTable: React.FC<RaspberryTableProps> = ({ statusList, logsByRaspberry }) => {
  const { t } = useTranslation();
  return (
    // Table container / Contenedor de la tabla
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-900 rounded-lg shadow">
        <thead>
          <tr className="text-white text-center">
            <th className="px-2 py-2"><Server className="inline" /> {t("IP")}</th>
            <th className="px-2 py-2"><CheckCircle className="inline" /> {t("Estado")}</th>
            <th className="px-2 py-2"><Activity className="inline" /> {t("CPU (%)")}</th>
            <th className="px-2 py-2"><Gauge className="inline" /> {t("RAM (%)")}</th>
            <th className="px-2 py-2"><Flame className="inline" /> {t("Temp (°C)")}</th>
            <th className="px-2 py-2"><Server className="inline" /> {t("Hostname")}</th>
            <th className="px-2 py-2"><BatteryFull className="inline" /> {t("Batería")}</th>
            <th className="px-2 py-2">{t("Uptime")}</th>
            <th className="px-2 py-2"><FolderOpen className="inline" /> {t("Discos")}</th>
          </tr>
        </thead>
        <tbody>
          {statusList.map((status, idx) => (
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
              <td className="px-2 py-1">{status.temp !== undefined && status.temp !== null ? `${status.temp}°C` : "-"}</td>
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
                {/* Disk info / Información de disco */}
                {status.disk_info && (
                  <div className="text-xs">
                    <div>Total: {status.disk_info.total} GB</div>
                    <div>Usado: {status.disk_info.used} GB</div>
                    <div>Libre: {status.disk_info.free} GB</div>
                  </div>
                )}
                {/* USB disks / Discos USB */}
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
                {/* No disk info / Sin información de disco */}
                {!(status.disk_info || (status.usb && status.usb.length > 0)) && "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Format uptime in human-readable form
// Formatear uptime en forma legible
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
