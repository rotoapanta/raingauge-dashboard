/**
 * AlertHistory.tsx
 *
 * Componente que muestra el historial de alertas del sistema.
 * Permite marcar alertas como resueltas y consulta el backend al cargar.
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
 * Muestra una tabla con el historial de alertas y permite resolverlas.
 */
export function AlertHistory() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Obtiene el historial de alertas del backend
  const fetchAlerts = () => {
    setLoading(true);
    setError("");
    fetch(`${RPI_BASE_URL}/devices/alerts`)
      .then(res => res.json())
      .then(setAlerts)
      .catch(() => setError("No se pudo obtener el historial de alertas."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Marca una alerta como resuelta
  const handleResolve = async (id: number) => {
    if (!window.confirm("¿Marcar esta alerta como resuelta?")) return;
    try {
      await fetch(`${RPI_BASE_URL}/devices/alerts/${id}/resolve`, { method: "POST" });
      fetchAlerts();
    } catch {
      setError("No se pudo resolver la alerta.");
    }
  };

  if (loading) return <div className="text-gray-400">Cargando alertas...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!alerts.length) return <div className="text-gray-400">No hay alertas registradas.</div>;

  return (
    <div className="bg-gray-900 p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">Historial de Alertas</h2>
      <table className="min-w-full text-white text-sm rounded shadow">
        <thead>
          <tr className="bg-gray-700 text-left">
            <th className="px-2 py-1">Mensaje</th>
            <th className="px-2 py-1">Nivel</th>
            <th className="px-2 py-1">Fecha/Hora</th>
            <th className="px-2 py-1">Estado</th>
            <th className="px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(alert => (
            <tr key={alert.id} className="border-t border-gray-700">
              <td className="px-2 py-1">{alert.message}</td>
              <td className={`px-2 py-1 font-bold ${alert.level === "CRITICAL" ? "text-red-400" : "text-yellow-300"}`}>{alert.level}</td>
              <td className="px-2 py-1">{new Date(alert.timestamp).toLocaleString()}</td>
              <td className="px-2 py-1">{alert.resolved ? "Resuelta" : "Activa"}</td>
              <td className="px-2 py-1">
                {!alert.resolved && (
                  <button
                    className="text-green-400 underline"
                    onClick={() => handleResolve(alert.id)}
                  >
                    Marcar como resuelta
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
