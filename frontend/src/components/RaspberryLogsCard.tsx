/**
 * RaspberryLogsCard.tsx
 *
 * Componente que muestra el historial de logs de conexión de una Raspberry Pi.
 * Presenta los estados ONLINE/OFFLINE en una tabla o un mensaje de error si no hay datos.
 */

interface LogEntry {
  timestamp: string;
  status: string;
}

interface LogsByRaspberry {
  ip: string;
  logs: LogEntry[] | { error: string };
}

interface RaspberryLogsCardProps {
  rasp: LogsByRaspberry;
}

/**
 * Muestra una tarjeta con el historial de logs de conexión de una Raspberry Pi.
 */
export function RaspberryLogsCard({ rasp }: RaspberryLogsCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg shadow p-4">
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
  );
}
