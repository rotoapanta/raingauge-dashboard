import { useEffect, useState } from "react";
import { RPI_BASE_URL } from "../config";

interface Alert {
  id: number;
  device_id: number;
  timestamp: string;
  level: string;
  message: string;
  resolved: boolean;
}

export function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch(`${RPI_BASE_URL}/devices/alerts?unresolved_only=true`)
      .then(res => res.json())
      .then(setAlerts)
      .catch(() => setAlerts([]));
    const interval = setInterval(() => {
      fetch(`${RPI_BASE_URL}/devices/alerts?unresolved_only=true`)
        .then(res => res.json())
        .then(setAlerts)
        .catch(() => setAlerts([]));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!alerts.length) return null;

  return (
    <div className="mb-4">
      {alerts.map(alert => (
        <div key={alert.id} className={`px-4 py-2 rounded mb-2 font-semibold text-white ${alert.level === "CRITICAL" ? "bg-red-700" : "bg-yellow-600"}`}>
          <span className="mr-2">⚠️</span>
          <span>{alert.message}</span>
          <span className="ml-2 text-xs text-gray-300">({new Date(alert.timestamp).toLocaleString()})</span>
        </div>
      ))}
    </div>
  );
}
