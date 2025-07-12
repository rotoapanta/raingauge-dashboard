import { useEffect, useState } from "react";
import { RPI_BASE_URL } from "../config";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

interface Metric {
  id: number;
  device_id: number;
  timestamp: string;
  cpu?: number;
  ram?: number;
  disk?: number;
  temp?: number;
  status?: string;
}

export function MetricChart({ deviceId }: { deviceId: number }) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${RPI_BASE_URL}/devices/${deviceId}/metrics`)
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch(() => setError("No se pudo obtener el histórico de métricas."))
      .finally(() => setLoading(false));
  }, [deviceId]);

  if (loading) return <div className="text-gray-400">Cargando métricas...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!metrics.length) return <div className="text-gray-400">Sin datos históricos.</div>;

  return (
    <div className="bg-gray-900 p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Histórico de métricas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={metrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={t => new Date(t).toLocaleTimeString()} minTickGap={40} />
          <YAxis />
          <Tooltip labelFormatter={l => new Date(l).toLocaleString()} />
          <Legend />
          <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU (%)" dot={false} />
          <Line type="monotone" dataKey="ram" stroke="#82ca9d" name="RAM (%)" dot={false} />
          <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Disco (%)" dot={false} />
          <Line type="monotone" dataKey="temp" stroke="#ff7300" name="Temp (°C)" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
