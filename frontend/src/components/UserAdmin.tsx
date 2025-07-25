/**
 * UserAdmin.tsx
 *
 * Componente de administración de usuarios.
 * Permite agregar, editar, eliminar y listar usuarios con autenticación.
 */

import { useEffect, useState } from "react";
import { RPI_BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

interface User {
  id?: number;
  username: string;
  email?: string;
  role: string;
}

/**
 * Componente para administrar usuarios (CRUD) con autenticación.
 */
export function UserAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<Partial<User>>({ role: "user" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  // Obtiene la lista de usuarios
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${RPI_BASE_URL}/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(t("No se pudo obtener la lista de usuarios."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Maneja cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Envía el formulario para agregar o actualizar un usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${RPI_BASE_URL}/users/${editingId}`
        : `${RPI_BASE_URL}/users/`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        let msg = "";
        try {
          const data = await res.json();
          if (data && data.detail) {
            msg = t(data.detail);
          }
        } catch {}
        if (!msg) {
          msg = t("Error al guardar el usuario.");
        }
        if (
          msg.toLowerCase().includes("already exists") ||
          msg.toLowerCase().includes("ya existe")
        ) {
          setSuccessMessage(msg);
          setTimeout(() => setSuccessMessage(""), 3000);
          return;
        }
        throw new Error(msg);
      }
      setForm({ role: "user" });
      setEditingId(null);
      fetchUsers();
      setSuccessMessage(t("Usuario agregado correctamente"));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e: any) {
      setError(e.message || t("Error al guardar el usuario."));
    }
  };

  // Rellena el formulario para editar un usuario
  const handleEdit = (user: User) => {
    setForm(user);
    setEditingId(user.id!);
  };

  // Elimina un usuario
  const handleDelete = async (id: number) => {
    if (!window.confirm(t("¿Seguro que deseas eliminar este usuario?"))) return;
    try {
      const res = await fetch(`${RPI_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      fetchUsers();
      setSuccessMessage(t("Usuario eliminado correctamente"));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setError(t("Error al eliminar el usuario."));
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">{t("Administrar Usuarios")}</h2>
      {successMessage && (
        <div className="bg-green-700 text-white px-4 py-2 rounded mb-2 text-center font-semibold">
          {successMessage}
        </div>
      )}
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            name="username"
            value={form.username || ""}
            onChange={handleChange}
            placeholder={t("Usuario")}
            className="p-2 rounded bg-gray-800 text-white flex-1"
            required
          />
          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            placeholder={t("Email")}
            className="p-2 rounded bg-gray-800 text-white flex-1"
          />
          <select
            name="role"
            value={form.role || "user"}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="user">{t("Usuario")}</option>
            <option value="admin">{t("Administrador")}</option>
          </select>
        </div>
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
              setForm({ role: "user" });
              setEditingId(null);
            }}
          >
            {t("Cancelar edición")}
          </button>
        )}
      </form>
      <h3 className="font-semibold mb-2">{t("Lista de usuarios")}</h3>
      {loading ? (
        <div className="text-gray-400">{t("Cargando...")}</div>
      ) : (
        <table className="min-w-full text-white text-sm rounded shadow">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-2 py-1">{t("Usuario")}</th>
              <th className="px-2 py-1">{t("Email")}</th>
              <th className="px-2 py-1">{t("Rol")}</th>
              <th className="px-2 py-1">{t("Acciones")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-700">
                <td className="px-2 py-1">{u.username}</td>
                <td className="px-2 py-1">{u.email}</td>
                <td className="px-2 py-1">{u.role === "admin" ? t("Administrador") : t("Usuario")}</td>
                <td className="px-2 py-1 flex gap-2">
                  <button
                    className="text-blue-400 underline"
                    onClick={() => handleEdit(u)}
                  >
                    {t("Editar")}
                  </button>
                  <button
                    className="text-red-400 underline"
                    onClick={() => handleDelete(u.id!)}
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
