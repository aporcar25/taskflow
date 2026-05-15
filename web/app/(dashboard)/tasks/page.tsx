"use client";

import { useState, useMemo, useEffect } from "react";
import { type Task, type Priority, type Category } from "@/app/lib/mockData";
import { getTasks, completeTask, deleteTask, updateTask, createTask } from "../../../lib/api";

const priorityColors: Record<Priority, string> = {
  alta: "bg-red-500/10 text-red-400 border-red-500/20",
  media: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  baja: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const categoryColors: Record<Category, string> = {
  trabajo: "bg-purple-500/10 text-purple-400",
  personal: "bg-pink-500/10 text-pink-400",
  salud: "bg-green-500/10 text-green-400",
  estudio: "bg-cyan-500/10 text-cyan-400",
  hogar: "bg-orange-500/10 text-orange-400",
};

const categoryIcons: Record<Category, string> = {
  trabajo: "💼",
  personal: "👤",
  salud: "❤️",
  estudio: "📖",
  hogar: "🏠",
};

const getDueDateColor = (dueDate: string) => {
  if (!dueDate) return "text-gray-500";
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return "text-red-400 font-semibold";
  if (diffDays <= 2) return "text-orange-400 font-medium";
  return "text-green-400 font-medium";
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "", description: "", priority: "" as Priority | "",
    category: "" as Category | "", dueDate: "",
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const validateCreate = () => {
    const e: Record<string, string> = {};
    if (!createForm.title.trim()) e.title = "El título es obligatorio";
    if (!createForm.description.trim()) e.description = "La descripción es obligatoria";
    if (!createForm.priority) e.priority = "Selecciona una prioridad";
    if (!createForm.category) e.category = "Selecciona una categoría";
    if (!createForm.dueDate) e.dueDate = "La fecha límite es obligatoria";
    setCreateErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveCreate = async () => {
    if (!validateCreate()) return;
    setIsCreating(true);
    try {
      const newTask = await createTask({
        titulo: createForm.title,
        descripcion: createForm.description,
        prioridad: createForm.priority,
        categoria: createForm.category,
        fechaLimite: createForm.dueDate
      });

      const mappedNewTask = {
        id: (newTask as any)._id,
        title: (newTask as any).titulo || "",
        description: (newTask as any).descripcion || "",
        priority: (newTask as any).prioridad,
        category: (newTask as any).categoria,
        dueDate: (newTask as any).fechaLimite ? (newTask as any).fechaLimite.substring(0, 10) : "",
        completed: (newTask as any).completada,
        createdAt: (newTask as any).createdAt
      };

      setTasks([mappedNewTask, ...tasks]);
      setIsCreateModalOpen(false);
      setCreateForm({
        title: "", description: "", priority: "" as Priority | "",
        category: "" as Category | "", dueDate: "",
      });
      setCreateErrors({});
    } catch (err) {
      console.error("Error al crear tarea:", err);
    } finally {
      setIsCreating(false);
    }
  };
  const [editForm, setEditForm] = useState({
    title: "", description: "", priority: "" as Priority | "",
    category: "" as Category | "", dueDate: "",
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete);
      setTasks(tasks.filter(t => t.id !== taskToDelete));
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error("Error eliminando tarea", err);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate || "",
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const validateEdit = () => {
    const e: Record<string, string> = {};
    if (!editForm.title.trim()) e.title = "El título es obligatorio";
    if (!editForm.description.trim()) e.description = "La descripción es obligatoria";
    if (!editForm.priority) e.priority = "Selecciona una prioridad";
    if (!editForm.category) e.category = "Selecciona una categoría";
    if (!editForm.dueDate) e.dueDate = "La fecha límite es obligatoria";
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveEdit = async () => {
    if (!editingTask || !validateEdit()) return;
    setIsSaving(true);
    try {
      const updated = await updateTask(editingTask.id, {
        titulo: editForm.title,
        descripcion: editForm.description,
        prioridad: editForm.priority,
        categoria: editForm.category,
        fechaLimite: editForm.dueDate
      });
      setTasks(tasks.map(t => t.id === editingTask.id ? {
        ...t,
        title: updated.titulo || "",
        description: updated.descripcion || "",
        priority: updated.prioridad,
        category: updated.categoria,
        dueDate: updated.fechaLimite ? updated.fechaLimite.substring(0, 10) : "",
      } : t));
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error("Error editando tarea", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        const mappedTasks = data.map((t: { _id: string; titulo?: string; descripcion?: string; prioridad: Priority; categoria: Category; fechaLimite?: string; completada: boolean; createdAt: string }) => ({
          id: t._id,
          title: t.titulo || "",
          description: t.descripcion || "",
          priority: t.prioridad,
          category: t.categoria,
          dueDate: t.fechaLimite ? t.fechaLimite.substring(0, 10) : "",
          completed: t.completada,
          createdAt: t.createdAt
        }));
        setTasks(mappedTasks);
      } catch (err) {
        console.error("Error cargando tareas:", err);
      }
    };
    fetchTasks();
  }, []);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "todas">("todas");
  const [filterCategory, setFilterCategory] = useState<Category | "todas">("todas");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const title = task.title || "";
      const description = task.description || "";
      const matchesSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = filterPriority === "todas" || task.priority === filterPriority;
      const matchesCategory = filterCategory === "todas" || task.category === filterCategory;
      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [tasks, search, filterPriority, filterCategory]);

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = !task.completed;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: newStatus } : t
      )
    );

    try {
      await completeTask(id, newStatus);
    } catch (err) {
      console.error(err);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: !newStatus } : t
        )
      );
    }
  };

  const completedCount = filteredTasks.filter((t) => t.completed).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tareas</h1>
          <p className="text-gray-400 text-sm mt-1">
            {completedCount} de {filteredTasks.length} completadas
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all hover:shadow-lg hover:shadow-lime-400/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva tarea
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tareas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400/30 transition-all"
          />
        </div>

        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | "todas")}
          className="px-4 py-2.5 rounded-xl bg-dark-800 border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 cursor-pointer appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.5rem' }}
        >
          <option value="todas">Todas las prioridades</option>
          <option value="alta">🔴 Alta</option>
          <option value="media">🟡 Media</option>
          <option value="baja">🔵 Baja</option>
        </select>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as Category | "todas")}
          className="px-4 py-2.5 rounded-xl bg-dark-800 border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 cursor-pointer appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.5rem' }}
        >
          <option value="todas">Todas las categorías</option>
          <option value="trabajo">💼 Trabajo</option>
          <option value="personal">👤 Personal</option>
          <option value="salud">❤️ Salud</option>
          <option value="estudio">📖 Estudio</option>
          <option value="hogar">🏠 Hogar</option>
        </select>
      </div>

      {/* Tasks list */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No se encontraron tareas</p>
          <p className="text-gray-600 text-sm mt-1">Prueba a cambiar los filtros o crea una nueva tarea</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className="group bg-dark-800 border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/10 transition-all duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    task.completed
                      ? "bg-lime-400 border-lime-400"
                      : "border-gray-600 hover:border-lime-400/50"
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3.5 h-3.5 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className={`font-semibold text-sm sm:text-base ${task.completed ? "line-through text-gray-500" : "text-white"}`}>
                        {task.title}
                      </h3>
                      <p className={`text-sm mt-1 ${task.completed ? "text-gray-600" : "text-gray-400"}`}>
                        {task.description}
                      </p>
                    </div>
                    {/* Buttons Edit & Delete */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 rounded-lg bg-dark-700 hover:bg-lime-500/10 text-gray-400 hover:text-lime-400 transition-colors"
                        title="Editar tarea"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        onClick={() => { setTaskToDelete(task.id); setIsDeleteModalOpen(true); }}
                        className="p-2 rounded-lg bg-dark-700 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                        title="Eliminar tarea"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border ${priorityColors[task.priority]}`}>
                      {task.priority === "alta" ? "🔴" : task.priority === "media" ? "🟡" : "🔵"} {task.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${categoryColors[task.category]}`}>
                      {categoryIcons[task.category]} {task.category}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${getDueDateColor(task.dueDate)}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {task.dueDate || "Sin fecha límite"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Eliminar tarea</h3>
            <p className="text-gray-400 text-sm mb-6">¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setTaskToDelete(null); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto pt-20 pb-10">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in my-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Nueva tarea</h3>
              <button onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({
                  title: "", description: "", priority: "" as Priority | "",
                  category: "" as Category | "", dueDate: "",
                });
                setCreateErrors({});
              }} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveCreate(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Título</label>
                <input type="text" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} placeholder="¿Qué necesitas hacer?" className={`w-full px-4 py-2.5 rounded-xl bg-dark-700 border ${createErrors.title ? "border-red-500/50" : "border-white/10"} text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all`} />
                {createErrors.title && <p className="text-red-400 text-xs mt-1">{createErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
                <textarea rows={3} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} placeholder="Describe los detalles..." className={`w-full px-4 py-2.5 rounded-xl bg-dark-700 border ${createErrors.description ? "border-red-500/50" : "border-white/10"} text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all resize-none`} />
                {createErrors.description && <p className="text-red-400 text-xs mt-1">{createErrors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Prioridad</label>
                  <select value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as Priority })} className={`w-full px-4 py-2.5 rounded-xl bg-dark-700 border ${createErrors.priority ? "border-red-500/50" : "border-white/10"} text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 appearance-none`} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}>
                    <option value="">Seleccionar</option>
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Media</option>
                    <option value="baja">🔵 Baja</option>
                  </select>
                  {createErrors.priority && <p className="text-red-400 text-xs mt-1">{createErrors.priority}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Categoría</label>
                  <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as Category })} className={`w-full px-4 py-2.5 rounded-xl bg-dark-700 border ${createErrors.category ? "border-red-500/50" : "border-white/10"} text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 appearance-none`} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}>
                    <option value="">Seleccionar</option>
                    <option value="trabajo">💼 Trabajo</option>
                    <option value="personal">👤 Personal</option>
                    <option value="salud">❤️ Salud</option>
                    <option value="estudio">📖 Estudio</option>
                    <option value="hogar">🏠 Hogar</option>
                  </select>
                  {createErrors.category && <p className="text-red-400 text-xs mt-1">{createErrors.category}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Fecha límite</label>
                <input type="date" value={createForm.dueDate} onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl bg-dark-700 border ${createErrors.dueDate ? "border-red-500/50" : "border-white/10"} text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50`} style={{ colorScheme: "dark" }} />
                {createErrors.dueDate && <p className="text-red-400 text-xs mt-1">{createErrors.dueDate}</p>}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateForm({
                    title: "", description: "", priority: "" as Priority | "",
                    category: "" as Category | "", dueDate: "",
                  });
                  setCreateErrors({});
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors border border-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-lime-400 text-dark-900 hover:bg-lime-400/90 transition-colors shadow-lg shadow-lime-400/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isCreating ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creando...</>
                ) : (<>Crear tarea</>)}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto pt-20 pb-10">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in my-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Editar tarea</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Título</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl bg-dark-700 border ${editErrors.title ? "border-red-500/50" : "border-white/10"} text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all`} />
                {editErrors.title && <p className="text-red-400 text-xs mt-1">{editErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
                <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl bg-dark-700 border ${editErrors.description ? "border-red-500/50" : "border-white/10"} text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all resize-none`} />
                {editErrors.description && <p className="text-red-400 text-xs mt-1">{editErrors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Prioridad</label>
                  <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })} className={`w-full px-4 py-2.5 rounded-xl bg-dark-700 border ${editErrors.priority ? "border-red-500/50" : "border-white/10"} text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 appearance-none`} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}>
                    <option value="">Seleccionar</option>
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Media</option>
                    <option value="baja">🔵 Baja</option>
                  </select>
                  {editErrors.priority && <p className="text-red-400 text-xs mt-1">{editErrors.priority}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Categoría</label>
                  <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })} className={`w-full px-4 py-2.5 rounded-xl bg-dark-700 border ${editErrors.category ? "border-red-500/50" : "border-white/10"} text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 appearance-none`} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}>
                    <option value="">Seleccionar</option>
                    <option value="trabajo">💼 Trabajo</option>
                    <option value="personal">👤 Personal</option>
                    <option value="salud">❤️ Salud</option>
                    <option value="estudio">📖 Estudio</option>
                    <option value="hogar">🏠 Hogar</option>
                  </select>
                  {editErrors.category && <p className="text-red-400 text-xs mt-1">{editErrors.category}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Fecha límite</label>
                <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl bg-dark-700 border ${editErrors.dueDate ? "border-red-500/50" : "border-white/10"} text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50`} style={{ colorScheme: "dark" }} />
                {editErrors.dueDate && <p className="text-red-400 text-xs mt-1">{editErrors.dueDate}</p>}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors border border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-lime-400 text-dark-900 hover:bg-lime-400/90 transition-colors shadow-lg shadow-lime-400/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
