/**
 * UserAdmin.tsx
 *
 * User administration component for CRUD operations with authentication.
 * Allows adding, editing, deleting, and listing users.
 *
 * Componente de administración de usuarios para operaciones CRUD con autenticación.
 * Permite agregar, editar, eliminar y listar usuarios.
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
 * Main component for managing users (CRUD) with authentication.
 * Handles user list, form state, and actions for add, edit, and delete.
 *
 * Componente principal para administrar usuarios (CRUD) con autenticación.
 * Maneja la lista de usuarios, el estado del formulario y las acciones de agregar, editar y eliminar.
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

  // Fetch the list of users from the backend
  // Obtener la lista de usuarios del backend
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
      setError("Could not fetch user list."); // No se pudo obtener la lista de usuarios.
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on mount
  // Obtener usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission for adding or updating a user
  // Manejar el envío del formulario para agregar o actualizar un usuario
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
            msg = data.detail;
          }
        } catch {}
        if (!msg) {
          msg = "Error saving user."; // Error al guardar el usuario.
        }
        if (
          msg.toLowerCase().includes("already exists")
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
      setSuccessMessage(editingId ? "User updated successfully" : "User added successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e: any) {
      setError(e.message || "Error saving user."); // Error al guardar el usuario.
    }
  };

  // Fill the form for editing a user
  // Rellenar el formulario para editar un usuario
  const handleEdit = (user: User) => {
    setForm(user);
    setEditingId(user.id!);
  };

  // Delete a user
  // Eliminar un usuario
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return; // ¿Seguro que deseas eliminar este usuario?
    try {
      const res = await fetch(`${RPI_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      fetchUsers();
      setSuccessMessage("User deleted successfully"); // Usuario eliminado correctamente
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setError("Error deleting user."); // Error al eliminar el usuario.
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">User Administration</h2>
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
            placeholder="Username"
            className="p-2 rounded bg-gray-800 text-white flex-1"
            required
          />
          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            placeholder="Email"
            className="p-2 rounded bg-gray-800 text-white flex-1"
          />
          <select
            name="role"
            value={form.role || "user"}
            onChange={handleChange}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-40"
        >
          {editingId ? "Update" : "Add"}
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
            Cancel edit
          </button>
        )}
      </form>
      <h3 className="font-semibold mb-2">User List</h3>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <table className="min-w-full text-white text-sm rounded shadow">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-2 py-1">Username</th>
              <th className="px-2 py-1">Email</th>
              <th className="px-2 py-1">Role</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-700">
                <td className="px-2 py-1">{u.username}</td>
                <td className="px-2 py-1">{u.email}</td>
                <td className="px-2 py-1">{u.role === "admin" ? "Admin" : "User"}</td>
                <td className="px-2 py-1 flex gap-2">
                  <button
                    className="text-blue-400 underline"
                    onClick={() => handleEdit(u)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-400 underline"
                    onClick={() => handleDelete(u.id!)}
                  >
                    Delete
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
