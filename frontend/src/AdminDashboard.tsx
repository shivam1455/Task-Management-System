import { FormEvent, useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { getErrorMessage } from "./utils/getErrorMessage";

type Task = {
  id: number;
  title: string;
  description: string | null;
  assigned_to: number | null;
  priority: string;
  status: string;
  due_date: string | null;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const VALID_TASK_STATUSES = ["pending", "in_progress", "completed"];
const VALID_TASK_PRIORITIES = ["low", "medium", "high"];
const VALID_ROLES = ["admin", "user"];

function AdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("pending");
  const [dueDate, setDueDate] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const response = await api.get("/api/tasks");
      setTasks(response.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load tasks."));
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users");
      setUsers(response.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load users."));
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const resetTaskForm = () => {
    setTitle("");
    setDescription("");
    setAssignedTo("");
    setPriority("medium");
    setStatus("pending");
    setDueDate("");
    setEditingTaskId(null);
  };

  const handleCreateOrUpdateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedAssignedTo = assignedTo.trim();
    const normalizedDueDate = dueDate.trim();

    if (!normalizedTitle) {
      setError("Task title is required.");
      return;
    }
    if (!VALID_TASK_PRIORITIES.includes(priority)) {
      setError("Task priority is invalid.");
      return;
    }
    if (!VALID_TASK_STATUSES.includes(status)) {
      setError("Task status is invalid.");
      return;
    }
    if (normalizedAssignedTo && !Number.isInteger(Number(normalizedAssignedTo))) {
      setError("Assigned user id must be a valid number.");
      return;
    }
    if (normalizedDueDate && Number.isNaN(Date.parse(normalizedDueDate))) {
      setError("Due date must be a valid date.");
      return;
    }

    try {
      if (editingTaskId) {
        await api.put(`/api/tasks/${editingTaskId}`, {
          title: normalizedTitle,
          description: normalizedDescription || null,
          assigned_to: normalizedAssignedTo ? Number(normalizedAssignedTo) : null,
          priority,
          status,
          due_date: normalizedDueDate || null,
        });
      } else {
        await api.post("/api/tasks", {
          title: normalizedTitle,
          description: normalizedDescription || null,
          assigned_to: normalizedAssignedTo ? Number(normalizedAssignedTo) : null,
          priority,
          status,
          due_date: normalizedDueDate || null,
        });
      }

      resetTaskForm();
      fetchTasks();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save task."));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setAssignedTo(task.assigned_to ? String(task.assigned_to) : "");
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.due_date || "");
  };

  const handleDeleteTask = async (id: number) => {
    setError("");
    try {
      await api.delete(`/api/tasks/${id}`);
      if (editingTaskId === id) {
        resetTaskForm();
      }
      fetchTasks();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete task."));
    }
  };

  const resetUserForm = () => {
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setUserRole("user");
    setEditingUserId(null);
  };

  const handleCreateOrUpdateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const normalizedUserName = userName.trim();
    const normalizedUserEmail = userEmail.trim().toLowerCase();
    const normalizedUserPassword = userPassword.trim();
    const isEditing = editingUserId !== null;

    if (!normalizedUserName) {
      setError("User name is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedUserEmail)) {
      setError("Please provide a valid user email.");
      return;
    }
    if (!VALID_ROLES.includes(userRole)) {
      setError("User role is invalid.");
      return;
    }
    if (!isEditing && normalizedUserPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (isEditing && normalizedUserPassword && normalizedUserPassword.length < 6) {
      setError("Updated password must be at least 6 characters.");
      return;
    }

    try {
      if (editingUserId) {
        await api.put(`/api/users/${editingUserId}`, {
          name: normalizedUserName,
          email: normalizedUserEmail,
          password: normalizedUserPassword || undefined,
          role: userRole,
        });
      } else {
        await api.post("/api/users", {
          name: normalizedUserName,
          email: normalizedUserEmail,
          password: normalizedUserPassword,
          role: userRole,
        });
      }

      resetUserForm();
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save user."));
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPassword("");
    setUserRole(user.role);
  };

  const handleDeleteUser = async (id: number) => {
    setError("");
    try {
      await api.delete(`/api/users/${id}`);
      if (editingUserId === id) {
        resetUserForm();
      }
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete user."));
    }
  };

  const totalUsers = users.length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const filteredTasks = tasks.filter((task) =>
    taskFilter === "all" ? true : task.status === taskFilter
  );

  const exportTasksAsCsv = () => {
    const headers = [
      "id",
      "title",
      "description",
      "assigned_to",
      "priority",
      "status",
      "due_date",
    ];

    const escapeCsvValue = (value: unknown) => {
      const stringValue = value === null || value === undefined ? "" : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const rows = filteredTasks.map((task) =>
      [
        task.id,
        task.title,
        task.description,
        task.assigned_to,
        task.priority,
        task.status,
        task.due_date,
      ]
        .map(escapeCsvValue)
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    link.href = url;
    link.download = `task-report-${taskFilter}-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Manage tasks, users, and exports from one panel.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{totalUsers}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total Tasks</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{totalTasks}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{pendingTasks}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">
              {completedTasks}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingTaskId ? "Edit Task" : "Create Task"}
            </h2>
            <form className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={handleCreateOrUpdateTask}>
              <div className="sm:col-span-2">
                <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="task-description" className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <input
                  id="task-description"
                  type="text"
                  placeholder="Task description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="task-assigned-to" className="mb-1 block text-sm font-medium text-slate-700">
                  Assigned User
                </label>
                <select
                  id="task-assigned-to"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {user.name} ({user.email}) - #{user.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="task-due-date" className="mb-1 block text-sm font-medium text-slate-700">
                  Due Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="task-priority" className="mb-1 block text-sm font-medium text-slate-700">
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label htmlFor="task-status" className="mb-1 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                >
                  {editingTaskId ? "Update Task" : "Create Task"}
                </button>
                {editingTaskId && (
                  <button
                    type="button"
                    onClick={resetTaskForm}
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingUserId ? "Edit User" : "Create User"}
            </h2>
            <form className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={handleCreateOrUpdateUser}>
              <div>
                <label htmlFor="user-name" className="mb-1 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  placeholder="Full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="user-email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="user-password" className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="user-password"
                  type="password"
                  placeholder={
                    editingUserId ? "Password (optional for update)" : "Password"
                  }
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  required={!editingUserId}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="user-role" className="mb-1 block text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  id="user-role"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                >
                  {editingUserId ? "Update User" : "Create User"}
                </button>
                {editingUserId && (
                  <button
                    type="button"
                    onClick={resetUserForm}
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Task List</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                id="admin-task-filter"
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-auto"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button
                type="button"
                onClick={exportTasksAsCsv}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Export CSV
              </button>
            </div>
          </div>
          {filteredTasks.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No tasks found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-medium">Title</th>
                    <th className="px-3 py-2 font-medium">Assigned To</th>
                    <th className="px-3 py-2 font-medium">Priority</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Due Date</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-3 py-2 text-slate-800">{task.title}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {task.assigned_to ?? "Unassigned"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{task.priority}</td>
                      <td className="px-3 py-2 text-slate-600">{task.status}</td>
                      <td className="px-3 py-2 text-slate-600">{task.due_date || "-"}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditTask(task)}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                          >
                            <FiEdit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">User List</h2>
          {users.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No users found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-3 py-2 text-slate-800">{user.name}</td>
                      <td className="px-3 py-2 text-slate-600">{user.email}</td>
                      <td className="px-3 py-2 text-slate-600">{user.role}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditUser(user)}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                          >
                            <FiEdit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
