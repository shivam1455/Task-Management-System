import { useEffect, useState } from "react";
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

type TaskComment = {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  createdAt: string;
  author?: {
    id: number;
    name: string;
    email: string;
  };
};

const VALID_TASK_STATUSES = ["pending", "in_progress", "completed"];

function UserDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [commentsByTask, setCommentsByTask] = useState<
    Record<number, TaskComment[]>
  >({});
  const [newCommentByTask, setNewCommentByTask] = useState<Record<number, string>>(
    {}
  );
  const [taskFilter, setTaskFilter] = useState("all");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const filteredTasks = tasks.filter((task) =>
    taskFilter === "all" ? true : task.status === taskFilter
  );

  const fetchTasks = async () => {
    try {
      const response = await api.get("/api/tasks/my");
      const fetchedTasks: Task[] = response.data;
      setTasks(fetchedTasks);

      const commentResults = await Promise.all(
        fetchedTasks.map(async (task) => {
          const commentsResponse = await api.get(`/api/tasks/${task.id}/comments`);
          return { taskId: task.id, comments: commentsResponse.data as TaskComment[] };
        })
      );

      const nextCommentsByTask: Record<number, TaskComment[]> = {};
      for (const result of commentResults) {
        nextCommentsByTask[result.taskId] = result.comments;
      }
      setCommentsByTask(nextCommentsByTask);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load assigned tasks or comments."));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    if (!VALID_TASK_STATUSES.includes(newStatus)) {
      setError("Invalid status selected.");
      return;
    }

    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update task status."));
    }
  };

  const handleCommentInputChange = (taskId: number, value: string) => {
    setNewCommentByTask((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  const handleAddComment = async (taskId: number) => {
    const content = (newCommentByTask[taskId] || "").trim();
    if (!content) {
      setError("Comment cannot be empty.");
      return;
    }
    if (content.length > 1000) {
      setError("Comment must be 1000 characters or fewer.");
      return;
    }

    try {
      const response = await api.post(`/api/tasks/${taskId}/comments`, { content });
      const createdComment = response.data as TaskComment;

      setCommentsByTask((prev) => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), createdComment],
      }));

      setNewCommentByTask((prev) => ({
        ...prev,
        [taskId]: "",
      }));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add comment."));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              User Dashboard
            </h1>
            <p className="text-sm text-slate-600">View and update your assigned tasks.</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <select
              id="user-task-filter"
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-48"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            No tasks found for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredTasks.map((task) => (
              <article
                key={task.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-slate-900">{task.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {task.description || "No description"}
                  </p>
                </div>

                <div className="mb-4 text-sm text-slate-700">
                  <span className="font-medium">Due date:</span> {task.due_date || "-"}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor={`status-${task.id}`}
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Status
                  </label>
                  <select
                    id={`status-${task.id}`}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Comments</p>
                  {(commentsByTask[task.id] || []).length === 0 ? (
                    <p className="text-sm text-slate-500">No comments yet.</p>
                  ) : (
                    <ul className="space-y-1.5 rounded-lg bg-slate-50 p-3 text-sm">
                      {(commentsByTask[task.id] || []).map((comment) => (
                        <li key={comment.id} className="text-slate-700">
                          <span className="font-medium text-slate-900">
                            {comment.author?.name || "User"}:
                          </span>{" "}
                          {comment.content}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      placeholder="Add a comment"
                      value={newCommentByTask[task.id] || ""}
                      onChange={(e) =>
                        handleCommentInputChange(task.id, e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(task.id)}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default UserDashboard;
