/**
 * DeviceAdmin.tsx
 *
 * Componente de administración de dispositivos.
 * Permite agregar, editar, eliminar y listar dispositivos con autenticación.
 */

import { useEffect, useState } from "react";
import { RPI_BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

interface Device {
  id?: number;
  name: string;
  ip: string;
  description?: string;
  enabled: boolean;
}

/**
 * Componente para administrar dispositivos (CRUD) con autenticación.
 */
export function DeviceAdmin() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [form, setForm] = useState<Partial<Device>>({ enabled: true });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Realiza peticiones autenticadas usando el token JWT
  function authFetch(input: RequestInfo, init: RequestInit = {}) {
    const token = localStorage.getItem("token");
    return fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  }

  // Obtiene la lista de dispositivos
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${RPI_BASE_URL}/devices/`);
      const data = await res.json();
      setDevices(data);
    } catch (e) {
      setError(t("No se pudo obtener la lista de dispositivos."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Maneja cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Envía el formulario para agregar o actualizar un dispositivo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${RPI_BASE_URL}/devices/${editingId}`
        : `${RPI_BASE_URL}/devices/`;
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        let msg = t("Error al guardar el dispositivo.");
        try {
          const data = await res.json();
          if (data && data.detail) {
            msg = t(data.detail);
          }
        } catch {}
        throw new Error(msg);
      }
      setForm({ enabled: true });
      setEditingId(null);
      setSuccess(editingId ? t("Dispositivo actualizado correctamente.") : t("Dispositivo agregado correctamente."));
      setTimeout(() => setSuccess(""), 2000);
      fetchDevices();
    } catch (e: any) {
      setError(e.message || t("Error al guardar el dispositivo."));
    }
  };

  // Rellena el formulario para editar un dispositivo
  const handleEdit = (device: Device) => {
    setForm(device);
    setEditingId(device.id!);
  };

  // Elimina un dispositivo
  const handleDelete = async (id: number) => {
    if (!window.confirm(t("¿Seguro que deseas eliminar este dispositivo?"))) return;
    setSuccess("");
    try {
      const res = await authFetch(`${RPI_BASE_URL}/devices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSuccess(t("Dispositivo eliminado correctamente."));
      setTimeout(() => setSuccess(""), 2000);
      fetchDevices();
    } catch {
      setError(t("Error al eliminar el dispositivo."));
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">{t("Lista de dispositivos")}</h2>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {success && <div className="text-green-400 mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            name="ip"
            value={form.ip || ""}
            onChange={handleChange}
            placeholder={t("IP")}
            className="p-2 rounded bg-gray-800 text-white flex-1"
            required
          />
        </div>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder={t("Descripción")}
          className="p-2 rounded bg-gray-800 text-white"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enabled"
            checked={form.enabled ?? true}
            onChange={handleChange}
          />
          {t("Habilitado")}
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-40"
        >
          {editingId ? t("Actualizar") : t("Agregar")}
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
            {t("Cancelar edición")}
          </button>
        )}
      </form>
      <h3 className="font-semibold mb-2">{t("Lista de dispositivos")}</h3>
      {loading ? (
        <div className="text-gray-400">{t("Cargando...")}</div>
      ) : (
        <table className="min-w-full text-white text-sm rounded shadow">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-2 py-1">{t("IP")}</th>
              <th className="px-2 py-1">{t("Descripción")}</th>
              <th className="px-2 py-1">{t("Habilitado")}</th>
              <th className="px-2 py-1">{t("Acciones")}</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} className="border-t border-gray-700">
                <td className="px-2 py-1 font-mono">{d.ip}</td>
                <td className="px-2 py-1">{d.description}</td>
                <td className="px-2 py-1">{d.enabled ? t("Sí") : t("No")}</td>
                <td className="px-2 py-1 flex gap-2">
                  <button
                    className="text-blue-400 underline"
                    onClick={() => handleEdit(d)}
                  >
                    {t("Editar")}
                  </button>
                  <button
                    className="text-red-400 underline"
                    onClick={() => handleDelete(d.id!)}
                  >
                    {t("Eliminar")}
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
