import { Cpu, MemoryStick, HardDrive, Thermometer, Terminal, Battery } from "lucide-react";
import { Card, BatteryIcon } from "./Shared";

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

export function RaspberryCard({ status }: { status: StatusData }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-2">
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
  );
}
