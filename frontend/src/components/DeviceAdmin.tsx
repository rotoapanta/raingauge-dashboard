import { useEffect, useState } from "react";
import { RPI_BASE_URL } from "../config";

interface Device {
  id?: number;
  name: string;
  ip: string;
  description?: string;
  enabled: boolean;
}

export function DeviceAdmin() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [form, setForm] = useState<Partial<Device>>({ enabled: true });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${RPI_BASE_URL}/devices/`);
      const data = await res.json();
      setDevices(data);
    } catch (e) {
      setError("No se pudo obtener la lista de dispositivos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${RPI_BASE_URL}/devices/${editingId}`
        : `${RPI_BASE_URL}/devices/`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al guardar el dispositivo");
      setForm({ enabled: true });
      setEditingId(null);
      fetchDevices();
    } catch (e) {
      setError("Error al guardar el dispositivo.");
    }
  };

  const handleEdit = (device: Device) => {
    setForm(device);
    setEditingId(device.id!);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este dispositivo?")) return;
    try {
      const res = await fetch(`${RPI_BASE_URL}/devices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchDevices();
    } catch {
      setError("Error al eliminar el dispositivo.");
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">Administrar Dispositivos</h2>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            placeholder="Nombre"
            className="p-2 rounded bg-gray-800 text-white flex-1"
            required
          />
          <input
            name="ip"
            value={form.ip || ""}
            onChange={handleChange}
            placeholder="IP"
            className="p-2 rounded bg-gray-800 text-white flex-1"
            required
          />
        </div>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder="Descripción"
          className="p-2 rounded bg-gray-800 text-white"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enabled"
            checked={form.enabled ?? true}
            onChange={handleChange}
          />
          Habilitado
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-40"
        >
          {editingId ? "Actualizar" : "Agregar"}
        </button>
        {editingId && (
          <button
            type="button"
            className="text-xs text-gray-400 underline"
            onClick={() => {
              setForm({ enabled: true });
              setEditingId(null);
            }}
          >
            Cancelar edición
          </button>
        )}
      </form>
      <h3 className="font-semibold mb-2">Lista de dispositivos</h3>
      {loading ? (
        <div className="text-gray-400">Cargando...</div>
      ) : (
        <table className="min-w-full text-white text-sm rounded shadow">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-2 py-1">Nombre</th>
              <th className="px-2 py-1">IP</th>
              <th className="px-2 py-1">Descripción</th>
              <th className="px-2 py-1">Habilitado</th>
              <th className="px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} className="border-t border-gray-700">
                <td className="px-2 py-1">{d.name}</td>
                <td className="px-2 py-1 font-mono">{d.ip}</td>
                <td className="px-2 py-1">{d.description}</td>
                <td className="px-2 py-1">{d.enabled ? "Sí" : "No"}</td>
                <td className="px-2 py-1 flex gap-2">
                  <button
                    className="text-blue-400 underline"
                    onClick={() => handleEdit(d)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-400 underline"
                    onClick={() => handleDelete(d.id!)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
