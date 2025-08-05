/**
 * DeviceAdmin.tsx
 *
 * Component for device administration (CRUD) with authentication.
 * Allows adding, editing, deleting, and listing devices.
 *
 * Componente para la administración de dispositivos (CRUD) con autenticación.
 * Permite agregar, editar, eliminar y listar dispositivos.
 */

import { useEffect, useState } from "react";
import { RPI_BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

interface Device {
  id?: number;
  ip: string;
  description?: string;
  enabled: boolean;
}

/**
 * Main component for managing devices (CRUD) with authentication.
 * Handles device list, form state, and actions for add, edit, and delete.
 *
 * Componente principal para administrar dispositivos (CRUD) con autenticación.
 * Maneja la lista de dispositivos, el estado del formulario y las acciones de agregar, editar y eliminar.
 */
export function DeviceAdmin() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [form, setForm] = useState<Partial<Device>>({ enabled: true });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Perform authenticated requests using JWT token
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

  // Fetch the list of devices from backend
  // Obtener la lista de dispositivos del backend
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${RPI_BASE_URL}/devices/`);
      const data = await res.json();
      setDevices(data);
    } catch (e) {
      setError("Could not fetch device list.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch devices on mount
  // Obtener dispositivos al montar el componente
  useEffect(() => {
    fetchDevices();
  }, []);

  // Handle form input changes
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission for adding or updating a device
  // Manejar el envío del formulario para agregar o actualizar un dispositivo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
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
        let msg = "Error saving device.";
        try {
          const data = await res.json();
          if (data && data.detail) {
            msg = data.detail;
          }
        } catch {}
        // If the message is about a duplicate, show it in green
        // Si el mensaje es de duplicado, mostrarlo en verde
        if (
          msg.toLowerCase().includes("already exists")
        ) {
          setSuccessMessage(msg);
          setTimeout(() => setSuccessMessage(""), 3000);
          return;
        }
        throw new Error(msg);
      }
      setForm({ enabled: true });
      setEditingId(null);
      setSuccessMessage(editingId ? "Device updated successfully." : "Device added successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchDevices();
    } catch (e: any) {
      setError(e.message || "Error saving device.");
    }
  };

  // Fill the form for editing a device
  // Rellenar el formulario para editar un dispositivo
  const handleEdit = (device: Device) => {
    setForm(device);
    setEditingId(device.id!);
  };

  // Delete a device
  // Eliminar un dispositivo
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    setSuccessMessage("");
    try {
      const res = await authFetch(`${RPI_BASE_URL}/devices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSuccessMessage("Device deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchDevices();
    } catch {
      setError("Error deleting device.");
    }
  };

  return (
    <div className="bg-gray-900 p-4 md:p-6 rounded shadow">
      <h2 className="text-lg font-bold mb-4 text-center">Device List</h2>
      {error && <div className="text-red-400 mb-2 text-center text-sm md:text-base">{error}</div>}
      {successMessage && (
        <div className="bg-green-700 text-white px-4 py-2 rounded mb-2 text-center font-semibold text-sm md:text-base">
          {successMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            name="ip"
            value={form.ip || ""}
            onChange={handleChange}
            placeholder={t("IP")}
            className="p-2 md:p-3 rounded bg-gray-800 text-white flex-1 text-base md:text-lg"
            required
          />
        </div>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder={t("Description")}
          className="p-2 md:p-3 rounded bg-gray-800 text-white text-base md:text-lg"
        />
        <label className="flex items-center gap-2 text-base md:text-lg">
          <input
            type="checkbox"
            name="enabled"
            checked={form.enabled ?? true}
            onChange={handleChange}
          />
          {t("Enabled")}
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded hover:bg-blue-700 w-full md:w-40 text-base md:text-lg"
        >
          {editingId ? t("Update") : t("Add")}
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
          {t("Cancel edit")}
          </button>
        )}
      </form>
      <h3 className="font-semibold mb-2 text-center">{t("Device List")}</h3>
      {loading ? (
        <div className="text-gray-400 text-center">{t("Loading...")}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-white text-xs md:text-sm rounded shadow">
            <thead>
              <tr className="bg-gray-700 text-left">
                <th className="px-1 py-1 md:px-2 md:py-1">{t("IP")}</th>
                <th className="px-1 py-1 md:px-2 md:py-1">{t("Description")}</th>
                <th className="px-1 py-1 md:px-2 md:py-1">{t("Enabled")}</th>
                <th className="px-1 py-1 md:px-2 md:py-1">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-t border-gray-700">
                  <td className="px-1 py-1 md:px-2 md:py-1 font-mono">{d.ip}</td>
                  <td className="px-1 py-1 md:px-2 md:py-1">{d.description}</td>
                  <td className="px-1 py-1 md:px-2 md:py-1">{d.enabled ? t("Yes") : t("No")}</td>
                  <td className="px-1 py-1 md:px-2 md:py-1 flex gap-2 flex-wrap">
                    <button
                      className="text-blue-400 underline"
                      onClick={() => handleEdit(d)}
                    >
                    {t("Edit")}
                    </button>
                    <button
                      className="text-red-400 underline"
                      onClick={() => handleDelete(d.id!)}
                    >
                    {t("Delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
