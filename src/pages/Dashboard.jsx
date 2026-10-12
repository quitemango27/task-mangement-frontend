import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTask, deleteTask, getTasks, updateTask } from "../api/tasks";
import { getErrorMessage } from "../utils/errors";
import Sidebar from "../components/Sidebar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { ErrorBanner } from "../components/AuthLayout";
import Icon from "../components/Icon";
import CoachCard from "../components/CoachCard";
import CelebrationToast from "../components/CelebrationToast";
import { AVATAR_FOR_MOOD, getMessages, getMood } from "../utils/coach";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ---- State: everything this page needs to remember ----
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState({ open: false, task: null }); // task=null means "new"
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [celebration, setCelebration] = useState(null); // {id, allDone} while the pop-up is showing
  const [seed] = useState(() => Math.floor(Math.random() * 1000)); // picks which coach message to show

  // ---- Load tasks once, when the page opens ----
  useEffect(() => {
    getTasks()
      .then((res) => setTasks(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // ---- Numbers for the summary cards ----
  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = total - completedCount;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;

  // ---- The list actually shown (after filter + search) ----
  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => (filter === "all" ? true : filter === "completed" ? t.completed : !t.completed))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .sort((a, b) => b.id - a.id); // newest first
  }, [tasks, filter, search]);

  // ---- The coach ----
  const mood = getMood(tasks);
  const coachLines = getMessages(mood, tasks);
  const coachMessage = coachLines[seed % coachLines.length];

  // Show the celebration pop-up (called right after a task becomes completed).
  const celebrate = (nextTasks) => {
    const allDone = nextTasks.length > 0 && nextTasks.every((t) => t.completed);
    setCelebration({ id: Date.now(), allDone });
  };

  // ---- Actions (each one calls the backend, then updates the screen) ----
  const handleSave = async (data) => {
    if (modal.task) {
      const res = await updateTask(modal.task.id, data);
      const next = tasks.map((t) => (t.id === modal.task.id ? res.data : t));
      setTasks(next);
      if (!modal.task.completed && res.data.completed) celebrate(next);
    } else {
      const res = await createTask(data);
      const next = [res.data, ...tasks];
      setTasks(next);
      if (res.data.completed) celebrate(next);
    }
  };

  const handleToggle = async (task) => {
    setError("");
    try {
      const res = await updateTask(task.id, {
        title: task.title,
        description: task.description,
        completed: !task.completed,
        priority: task.priority,
        due_date: task.due_date,
      });
      const next = tasks.map((t) => (t.id === task.id ? res.data : t));
      setTasks(next);
      if (!task.completed && res.data.completed) celebrate(next);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    await deleteTask(taskToDelete.id);
    setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    setTaskToDelete(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openNew = () => setModal({ open: true, task: null });
  const openEdit = (task) => setModal({ open: true, task });
  const closeModal = () => setModal({ open: false, task: null });

  const stats = [
    { label: "Total tasks", value: total, icon: "checklist", tint: "bg-secondary-container text-on-secondary-fixed" },
    { label: "Pending", value: pendingCount, icon: "hourglass_top", tint: "bg-amber-100 text-amber-800" },
    { label: "Completed", value: completedCount, icon: "task_alt", tint: "bg-primary-fixed text-primary" },
  ];

  return (
    <div className="min-h-screen">
      <Sidebar
        user={user}
        filter={filter}
        onFilterChange={setFilter}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:pl-64">
        {/* Top bar */}
        <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30">
          <div className="h-full px-4 md:px-6 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 -ml-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
            >
              <Icon name="menu" className="text-[22px]" />
            </button>

            <div className="relative flex-1 max-w-lg">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks"
                aria-label="Search tasks"
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface-container-lowest text-sm shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <button
              onClick={openNew}
              className="ml-auto h-9 px-4 rounded-lg bg-primary-container text-on-primary text-sm font-medium flex items-center gap-1 shadow-sm hover:bg-primary transition-colors"
            >
              <Icon name="add" className="text-[18px]" />
              <span className="hidden sm:inline">New task</span>
            </button>
          </div>
        </header>

        <main className="pt-16">
          <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto flex flex-col gap-8">
            {/* Welcome + completion bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name?.split(" ")[0]}</h1>
                <p className="text-on-surface-variant mt-1">
                  {total === 0
                    ? "You have a clean slate. Add your first task to get started."
                    : `${pendingCount} pending, ${completedCount} completed.`}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl">
                <div>
                  <p className="text-xs font-medium text-on-surface-variant">Completion</p>
                  <p className="font-display font-semibold text-lg leading-tight">{percent}%</p>
                </div>
                <div className="w-24 h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </div>

            {error && <ErrorBanner>{error}</ErrorBanner>}

            {!loading && (
              <CoachCard mood={mood} avatarMood={AVATAR_FOR_MOOD[mood]} message={coachMessage} />
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="p-5 rounded-xl bg-surface-container-lowest shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-on-surface-variant">{s.label}</span>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.tint}`}>
                      <Icon name={s.icon} className="text-[20px]" />
                    </div>
                  </div>
                  <p className="font-display text-5xl font-bold tracking-tight mt-4">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center p-1 bg-surface-container-low rounded-xl gap-1 w-fit">
              {TABS.map((tab) => {
                const count = tab.key === "all" ? total : tab.key === "completed" ? completedCount : pendingCount;
                const active = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors
                    ${active
                      ? "bg-surface-container-lowest text-on-surface shadow-sm font-semibold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"}`}
                  >
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-secondary-container text-on-secondary-fixed" : "bg-surface-container-high text-on-surface-variant"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Task list / loading / empty states */}
            {loading ? (
              <p className="text-on-surface-variant">Loading your tasks…</p>
            ) : total === 0 ? (
              <div className="flex flex-col items-center text-center py-16 px-4 rounded-2xl bg-surface-container-lowest shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-4">
                  <Icon name="checklist" className="text-[32px]" />
                </div>
                <h2 className="text-2xl font-semibold">No tasks yet</h2>
                <p className="text-on-surface-variant mt-1 mb-6 max-w-sm">
                  Tasks you add will show up here so you can track what's pending and what's done.
                </p>
                <button
                  onClick={openNew}
                  className="h-10 px-5 rounded-lg bg-primary-container text-on-primary text-sm font-medium hover:bg-primary transition-colors"
                >
                  Create your first task
                </button>
              </div>
            ) : visibleTasks.length === 0 ? (
              <p className="text-on-surface-variant py-8 text-center">No tasks match your search or filter.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onEdit={openEdit}
                    onDelete={setTaskToDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {modal.open && (
        <TaskModal
          key={modal.task?.id ?? "new"}
          task={modal.task}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
      {celebration && (
        <CelebrationToast
          key={celebration.id}
          allDone={celebration.allDone}
          onDone={() => setCelebration(null)}
        />
      )}
      {taskToDelete && (
        <ConfirmDialog task={taskToDelete} onCancel={() => setTaskToDelete(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
}
