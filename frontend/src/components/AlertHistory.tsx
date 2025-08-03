/**
 * AlertHistory.tsx
 *
 * Component that displays the system alert history and allows marking alerts as resolved. Fetches from backend on load.
 *
 * Componente que muestra el historial de alertas del sistema y permite marcar alertas como resueltas. Consulta el backend al cargar.
 */

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

/**
 * Displays a table with the alert history and allows resolving them.
 *
 * Muestra una tabla con el historial de alertas y permite resolverlas.
 */
export function AlertHistory() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch alert history from backend
  // Obtiene el historial de alertas del backend
  const fetchAlerts = () => {
    setLoading(true);
    setError("");
    fetch(`${RPI_BASE_URL}/devices/alerts`)
      .then(res => res.json())
      .then(setAlerts)
      .catch(() => setError("Could not fetch alert history."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Mark an alert as resolved
  // Marca una alerta como resuelta
  const handleResolve = async (id: number) => {
    if (!window.confirm("Mark this alert as resolved?")) return;
    try {
      await fetch(`${RPI_BASE_URL}/devices/alerts/${id}/resolve`, { method: "POST" });
      fetchAlerts();
    } catch {
      setError("Could not resolve the alert.");
    }
  };

  if (loading) return <div className="text-gray-400">Loading alerts...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!alerts.length) return <div className="text-gray-400">No alerts registered.</div>;

  return (
    <div className="bg-gray-900 p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">Alert History</h2>
      <table className="min-w-full text-white text-sm rounded shadow">
        <thead>
          <tr className="bg-gray-700 text-left">
            <th className="px-2 py-1">Message</th>
            <th className="px-2 py-1">Level</th>
            <th className="px-2 py-1">Date/Time</th>
            <th className="px-2 py-1">Status</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(alert => (
            <tr key={alert.id} className="border-t border-gray-700">
              <td className="px-2 py-1">{alert.message}</td>
              <td className={`px-2 py-1 font-bold ${alert.level === "CRITICAL" ? "text-red-400" : "text-yellow-300"}`}>{alert.level}</td>
              <td className="px-2 py-1">{new Date(alert.timestamp).toLocaleString()}</td>
              <td className="px-2 py-1">{alert.resolved ? "Resolved" : "Active"}</td>
              <td className="px-2 py-1">
                {!alert.resolved && (
                  <button
                    className="text-green-400 underline"
                    onClick={() => handleResolve(alert.id)}
                  >
                    Mark as resolved
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
