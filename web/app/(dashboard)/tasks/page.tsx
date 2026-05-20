"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import TutorialTooltip from "../../components/TutorialTooltip";
import { useToast } from "../../components/ToastProvider";
import { useAuth } from "../../context/AuthContext";
import { type Task, type Priority, type Category } from "@/app/lib/mockData";
import {
  getTasks,
  deleteTask,
  updateTask,
  createTask,
  getCustomCategories,
  shareTask,
  unshareTask,
  getSharedTasks
} from "../../../lib/api";

interface ApiTask {
  _id: string;
  titulo?: string;
  descripcion?: string;
  prioridad: string;
  categoria: string;
  fechaLimite?: string;
  completada: boolean;
  estado?: string;
  archivada?: boolean;
  tags?: string[];
  recurrencia?: string;
  imagenes?: string[];
  esCompartida?: boolean;
  compartidaCon?: { usuario: any; permiso: string }[];
  userId: any;
  createdAt: string;
}

const priorityColors: Record<Priority, string> = {
  alta: "bg-red-500/10 text-red-400 border-red-500/20",
  media: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  baja: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function TasksPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animatingTasks, setAnimatingTasks] = useState<Set<string>>(new Set());

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<"mismas" | "compartidas">("mismas");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [showArchived, setShowArchived] = useState(false);

  // Forms
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "", description: "", priority: "" as Priority | "",
    category: "" as Category | "", dueDate: "",
    estado: "pendiente" as "pendiente" | "en_progreso" | "completada",
    tags: "",
    recurrencia: "ninguna" as "ninguna" | "diaria" | "semanal" | "mensual",
    imagenes: [] as string[]
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    title: "", description: "", priority: "" as Priority,
    category: "" as Category | string, dueDate: "",
    estado: "pendiente" as "pendiente" | "en_progreso" | "completada",
    tags: "",
    recurrencia: "ninguna" as "ninguna" | "diaria" | "semanal" | "mensual",
    imagenes: [] as string[]
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "todas">("todas");
  const [filterCategory, setFilterCategory] = useState<Category | "todas">("todas");
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Sharing
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermiso, setSharePermiso] = useState("ver");
  const [isSharing, setIsSharing] = useState(false);

  // Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Fullscreen Viewer
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState<string | null>(null);

  /**
   * Data Fetching
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tasksData, sharedData, catsData] = await Promise.all([
        getTasks(),
        getSharedTasks(),
        getCustomCategories()
      ]);

      const mapApiTask = (t: ApiTask): Task => ({
        id: t._id,
        title: t.titulo || "",
        description: t.descripcion || "",
        priority: t.prioridad as Priority,
        category: t.categoria,
        dueDate: t.fechaLimite ? t.fechaLimite.substring(0, 10) : "",
        completed: t.completada,
        estado: (t.estado as any) || (t.completada ? "completada" : "pendiente"),
        archivada: !!t.archivada,
        tags: t.tags || [],
        recurrencia: (t.recurrencia as any) || "ninguna",
        imagenes: t.imagenes || [],
        esCompartida: t.esCompartida || false,
        compartidaCon: t.compartidaCon || [],
        userId: t.userId,
        createdAt: t.createdAt
      });

      const mappedTasks = (tasksData as ApiTask[]).map(mapApiTask);
      const mappedShared = (sharedData as ApiTask[]).map(mapApiTask);

      // Combine and remove duplicates
      const combined = [...mappedTasks];
      mappedShared.forEach((st: Task) => {
        if (!combined.find(t => t.id === st.id)) {
          combined.push(st);
        }
      });

      const priorityOrder = { alta: 0, media: 1, baja: 2 };
      const sorted = combined.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

      setTasks(sorted);
      setCustomCategories(catsData || []);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, currentUser]);

  /**
   * Computed State
   */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const title = task.title || "";
      const description = task.description || "";
      const matchesSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = filterPriority === "todas" || task.priority === filterPriority;
      const matchesCategory = filterCategory === "todas" || task.category === filterCategory;
      const matchesArchived = task.archivada === showArchived;

      const currentUserId = currentUser?._id || currentUser?.id;

      // Exact requested isOwner check
      const isOwner = !task.userId
        ? true
        : typeof task.userId === 'string'
          ? task.userId === currentUserId
          : task.userId?._id === currentUserId || task.userId?.id === currentUserId;

      const matchesTab = activeTab === "mismas" ? isOwner : !isOwner;

      return matchesSearch && matchesPriority && matchesCategory && matchesArchived && matchesTab;
    });
  }, [tasks, search, filterPriority, filterCategory, showArchived, activeTab, currentUser]);

  const completedCount = filteredTasks.filter((t) => t.completed).length;

  /**
   * Actions
   */
  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = !task.completed;
    const newEstado = newStatus ? "completada" : "pendiente";

    if (newStatus) {
      setAnimatingTasks(prev => new Set(prev).add(id));
      setTimeout(() => {
        setAnimatingTasks(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1000);
    }

    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: newStatus, estado: newEstado as any } : t));

    try {
      await updateTask(id, { completada: newStatus, estado: newEstado });
      showToast(newStatus ? "Tarea completada" : "Tarea pendiente", "success");
    } catch (err) {
      console.error(err);
      showToast("Error", "error");
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !newStatus, estado: (!newStatus ? "completada" : "pendiente") as any } : t));
    }
  };

  const archiveTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newArchived = !task.archivada;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, archivada: newArchived } : t));
    try {
      await updateTask(id, { archivada: newArchived });
      showToast(newArchived ? "Tarea archivada" : "Tarea desarchivada", "success");
    } catch (err) {
      showToast("Error", "error");
      setTasks(prev => prev.map(t => t.id === id ? { ...t, archivada: !newArchived } : t));
    }
  };

  const moveTask = async (id: string, newEstado: "pendiente" | "en_progreso" | "completada") => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const isCompleted = newEstado === "completada";

    if (isCompleted && !task.completed) {
      setAnimatingTasks(prev => new Set(prev).add(id));
      setTimeout(() => {
        setAnimatingTasks(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1000);
    }

    setTasks(prev => prev.map(t => t.id === id ? { ...t, estado: newEstado, completed: isCompleted } : t));
    try {
      await updateTask(id, { estado: newEstado, completada: isCompleted });
      showToast("Tarea movida", "success");
    } catch (err) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, estado: task.estado, completed: task.completed } : t));
    }
  };

  const saveCreate = async () => {
    const e: Record<string, string> = {};
    if (!createForm.title.trim()) e.title = "Obligatorio";
    if (!createForm.description.trim()) e.description = "Obligatorio";
    if (!createForm.priority) e.priority = "Obligatorio";
    if (!createForm.category) e.category = "Obligatorio";
    if (!createForm.dueDate) e.dueDate = "Obligatorio";
    if (Object.keys(e).length > 0) { setCreateErrors(e); return; }

    setIsCreating(true);
    try {
      const newTask = await createTask({
        titulo: createForm.title,
        descripcion: createForm.description,
        prioridad: createForm.priority,
        categoria: createForm.category,
        fechaLimite: createForm.dueDate,
        estado: createForm.estado,
        tags: createForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        recurrencia: createForm.recurrencia,
        imagenes: createForm.imagenes
      });

      const mapApiTask = (t: ApiTask): Task => ({
        id: t._id, title: t.titulo || "", description: t.descripcion || "", priority: t.prioridad as Priority, category: t.categoria, dueDate: t.fechaLimite ? t.fechaLimite.substring(0, 10) : "", completed: t.completada, estado: (t.estado as any) || (t.completada ? "completada" : "pendiente"), archivada: !!t.archivada, tags: t.tags || [], recurrencia: (t.recurrencia as any) || "ninguna", imagenes: t.imagenes || [], esCompartida: t.esCompartida || false, compartidaCon: t.compartidaCon || [], userId: t.userId, createdAt: t.createdAt
      });

      setTasks([mapApiTask(newTask as ApiTask), ...tasks]);
      setIsCreateModalOpen(false);
      setCreateForm({ title: "", description: "", priority: "" as any, category: "" as any, dueDate: "", estado: "pendiente", tags: "", recurrencia: "ninguna", imagenes: [] });
      setCreateErrors({});
      showToast("Tarea creada", "success");
    } catch (err) {
      showToast("Error al crear", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete);
      setTasks(tasks.filter(t => t.id !== taskToDelete));
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      showToast("Tarea eliminada", "success");
    } catch (err) {
      showToast("Error al eliminar", "error");
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title, description: task.description, priority: task.priority, category: task.category, dueDate: task.dueDate, estado: task.estado, tags: task.tags.join(", "), recurrencia: task.recurrencia, imagenes: task.imagenes || []
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingTask) return;
    const e: Record<string, string> = {};
    if (!editForm.title.trim()) e.title = "Obligatorio";
    if (Object.keys(e).length > 0) { setEditErrors(e); return; }

    setIsSaving(true);
    try {
      const updated = await updateTask(editingTask.id, {
        titulo: editForm.title, descripcion: editForm.description, prioridad: editForm.priority, categoria: editForm.category, fechaLimite: editForm.dueDate, estado: editForm.estado, tags: editForm.tags.split(",").map(t => t.trim()).filter(Boolean), recurrencia: editForm.recurrencia, imagenes: editForm.imagenes
      });

      const mapApiTask = (t: ApiTask): Task => ({
        id: t._id, title: t.titulo || "", description: t.descripcion || "", priority: t.prioridad as Priority, category: t.categoria, dueDate: t.fechaLimite ? t.fechaLimite.substring(0, 10) : "", completed: t.completada, estado: (t.estado as any) || (t.completada ? "completada" : "pendiente"), archivada: !!t.archivada, tags: t.tags || [], recurrencia: (t.recurrencia as any) || "ninguna", imagenes: t.imagenes || [], esCompartida: t.esCompartida || false, compartidaCon: t.compartidaCon || [], userId: t.userId, createdAt: t.createdAt
      });

      setTasks(tasks.map(t => t.id === editingTask.id ? mapApiTask(updated as ApiTask) : t));
      setIsEditModalOpen(false);
      setEditingTask(null);
      showToast("Tarea actualizada", "success");
    } catch (err) {
      showToast("Error al actualizar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!editingTask || !shareEmail) return;
    setIsSharing(true);
    try {
      const result = await shareTask(editingTask.id, shareEmail, sharePermiso);
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, esCompartida: result.task.esCompartida, compartidaCon: result.task.compartidaCon } : t));
      setShareEmail("");
      showToast("Compartida correctamente", "success");
    } catch (err: any) {
      showToast(err.message || "Error al compartir", "error");
    } finally {
      setIsSharing(false);
    }
  };

  const handleUnshare = async (userId: string) => {
    if (!editingTask) return;
    try {
      const result = await unshareTask(editingTask.id, userId);
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, esCompartida: result.task.esCompartida, compartidaCon: result.task.compartidaCon } : t));
      showToast("Usuario eliminado", "success");
    } catch (err) {
      showToast("Error al eliminar", "error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = Array.from(e.target.files || []);
    const currentImages = isEdit ? (editForm.imagenes || []) : (createForm.imagenes || []);
    if (currentImages.length + files.length > 3) { showToast("Máximo 3 imágenes", "error"); return; }

    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) { showToast(`${file.name} excede 2MB`, "error"); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isEdit) setEditForm(prev => ({ ...prev, imagenes: [...(prev.imagenes || []), base64] }));
        else setCreateForm(prev => ({ ...prev, imagenes: [...(prev.imagenes || []), base64] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number, isEdit: boolean) => {
    if (isEdit) setEditForm(prev => ({ ...prev, imagenes: (prev.imagenes || []).filter((_, i) => i !== index) }));
    else setCreateForm(prev => ({ ...prev, imagenes: (prev.imagenes || []).filter((_, i) => i !== index) }));
  };

  /**
   * Internal TaskCard Component
   */
  const TaskCardInternal = ({ task, index, isKanban = false }: { task: Task, index: number, isKanban?: boolean }) => {
    const currentUserId = currentUser?._id || currentUser?.id || null;
    const isOwner = !task.userId
      ? true
      : typeof task.userId === 'string'
        ? task.userId === currentUserId
        : task.userId?._id === currentUserId || task.userId?.id === currentUserId;

    const shareEntry = task.compartidaCon?.find(c => {
      const uid = typeof c.usuario === 'string' ? c.usuario : (c.usuario?._id || c.usuario?.id);
      return uid === currentUserId;
    });

    const canEdit = isOwner || (shareEntry && shareEntry.permiso === 'editar');
    const canDelete = isOwner;

    return (
      <div className={`group bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-4 hover:border-gray-200 dark:hover:border-white/10 transition-all duration-200 shadow-sm dark:shadow-none ${isKanban ? "mb-3" : ""}`} style={{ animationDelay: `${index * 50}ms` }}>
        <div className="flex items-start gap-3">
          <div className="relative">
            <button onClick={() => toggleTask(task.id)} className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${task.completed ? "bg-lime-400 border-lime-400 text-dark-900" : "border-gray-200 dark:border-white/10 hover:border-lime-400/50"}`}>
              {task.completed && <svg className="w-3 h-3 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </button>
            {animatingTasks.has(task.id) && (
              <div className="absolute -inset-2 flex items-center justify-center pointer-events-none z-10">
                <div className="absolute inset-0 bg-lime-400/20 rounded-full animate-sparkle" />
                <svg className="w-8 h-8 text-lime-400 animate-checkmark-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className={`text-sm font-bold truncate transition-all ${task.completed ? "text-gray-400 line-through" : "text-dark-900 dark:text-white"}`}>{task.title}</h3>
                {!isKanban && <p className={`text-xs mt-1 truncate ${task.completed ? "text-gray-500 dark:text-gray-600" : "text-gray-600 dark:text-gray-400"}`}>{task.description}</p>}
                {!isOwner && task.userId && (
                  <p className="text-[10px] text-blue-400 font-medium mt-1 truncate">
                    Compartida por {typeof task.userId === 'string' ? '...' : (task.userId.nombre || task.userId.email)}
                  </p>
                )}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                {canDelete && <button onClick={() => archiveTask(task.id)} className="p-1.5 rounded-lg hover:bg-lime-500/10 text-gray-400 hover:text-lime-400 transition-colors"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg></button>}
                {canEdit && <button onClick={() => openEditModal(task)} className="p-1.5 rounded-lg hover:bg-lime-500/10 text-gray-400 hover:text-lime-400 transition-colors"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>}
                {canDelete && <button onClick={() => { setTaskToDelete(task.id); setIsDeleteModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${priorityColors[task.priority as Priority]}`}>{task.priority}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">{task.category}</span>
              {task.recurrencia !== "ninguna" && <span className="text-[10px] font-medium text-lime-400 flex items-center gap-0.5"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>{task.recurrencia}</span>}
              {task.esCompartida && <span className="text-[10px] font-medium text-blue-400 flex items-center gap-0.5"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>Compartida</span>}
              {task.imagenes && task.imagenes.length > 0 && <span className="text-[10px] font-medium text-lime-400 flex items-center gap-0.5"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{task.imagenes.length}</span>}
            </div>
            {task.tags && task.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{task.tags.map(tag => <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20">#{tag}</span>)}</div>}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Final Render
   */
  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      <TutorialTooltip steps={[{ targetId: "view-toggle", content: "Cambia de vista." }, { targetId: "btn-new-task", content: "Crea nuevas tareas." }]} pageKey="tasks" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark-900 dark:text-white">Tareas</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{completedCount} de {filteredTasks.length} {showArchived ? "archivadas" : "activas"}</p>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-xl p-1">
          <button onClick={() => setActiveTab("mismas")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "mismas" ? "bg-white dark:bg-dark-700 text-lime-400 shadow-sm" : "text-gray-400 hover:text-white"}`}>Mis tareas</button>
          <button onClick={() => setActiveTab("compartidas")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "compartidas" ? "bg-white dark:bg-dark-700 text-lime-400 shadow-sm" : "text-gray-400 hover:text-white"}`}>Compartidas</button>
        </div>
        <div className="flex items-center gap-2">
          <div id="view-toggle" className="flex items-center bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-white dark:bg-dark-700 text-lime-400 shadow-sm" : "text-gray-400 hover:text-white"}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <button onClick={() => setViewMode("kanban")} className={`p-2 rounded-lg ${viewMode === "kanban" ? "bg-white dark:bg-dark-700 text-lime-400 shadow-sm" : "text-gray-400 hover:text-white"}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg></button>
          </div>
          <button onClick={() => setShowArchived(!showArchived)} className={`p-2.5 rounded-xl border transition-all ${showArchived ? "bg-lime-400/10 border-lime-400/30 text-lime-400" : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 hover:text-white"}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg></button>
          <button id="btn-new-task" onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all shadow-lg shadow-lime-400/20"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 4v16m8-8H4" /></svg>Nueva tarea</button>
        </div>
      </div>

      <div id="task-filters" className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30" />
        </div>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as any)} className="px-4 py-2.5 rounded-xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 text-dark-900 dark:text-white text-sm">
          <option value="todas">Prioridad</option><option value="alta">🔴 Alta</option><option value="media">🟡 Media</option><option value="baja">🔵 Baja</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as any)} className="px-4 py-2.5 rounded-xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 text-dark-900 dark:text-white text-sm">
          <option value="todas">Categoría</option><option value="trabajo">💼 Trabajo</option><option value="personal">👤 Personal</option><option value="salud">❤️ Salud</option><option value="estudio">📖 Estudio</option><option value="hogar">🏠 Hogar</option>{customCategories.map(cat => <option key={cat} value={cat}>✨ {cat}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 shimmer rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5" />)}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 opacity-50"><p>No se encontraron tareas</p></div>
        ) : viewMode === "list" ? (
          <div className="space-y-3 overflow-y-auto h-full pr-2 custom-scrollbar">
            {filteredTasks.map((task, index) => <TaskCardInternal key={task.id} task={task} index={index} />)}
          </div>
        ) : (
          <div className="flex gap-6 pb-4 w-full" style={{ height: 'calc(100vh - 200px)' }}>
            {["pendiente", "en_progreso", "completada"].map((status) => (
              <div key={status} className="bg-gray-100/50 dark:bg-white/5 rounded-2xl p-4 flex-1 flex flex-col h-full" onDragOver={e => e.preventDefault()} onDrop={e => moveTask(e.dataTransfer.getData("taskId"), status as any)}>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 px-2 flex items-center justify-between">
                  {status === "pendiente" ? "Pendiente" : status === "en_progreso" ? "En progreso" : "Completada"}
                  <span className="bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-lg text-xs">{filteredTasks.filter(t => t.estado === status).length}</span>
                </h3>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {filteredTasks.filter(t => t.estado === status).map((task, index) => (
                    <div key={task.id} draggable onDragStart={e => e.dataTransfer.setData("taskId", task.id)} className="cursor-grab active:cursor-grabbing">
                      <TaskCardInternal task={task} index={index} isKanban />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col justify-center">
            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">Eliminar tarea</h3>
            <p className="text-gray-400 text-sm mb-6">¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setIsDeleteModalOpen(false); setTaskToDelete(null); }} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors border border-white/10">Cancelar</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/10 rounded-none sm:rounded-2xl p-6 min-h-screen sm:min-h-0 max-w-lg w-full shadow-2xl animate-fade-in my-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-dark-900 dark:text-white">Nueva tarea</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveCreate(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Título</label>
                <input type="text" value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} placeholder="¿Qué necesitas hacer?" className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border ${createErrors.title ? "border-red-500/50" : "border-gray-200 dark:border-white/10"} text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
                <textarea rows={3} value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} placeholder="Describe los detalles..." className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border ${createErrors.description ? "border-red-500/50" : "border-gray-200 dark:border-white/10"} text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={createForm.priority} onChange={e => setCreateForm({...createForm, priority: e.target.value as any})} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm">
                  <option value="">Prioridad</option><option value="alta">🔴 Alta</option><option value="media">🟡 Media</option><option value="baja">🔵 Baja</option>
                </select>
                <select value={createForm.category} onChange={e => setCreateForm({...createForm, category: e.target.value as any})} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm">
                  <option value="">Categoría</option><option value="trabajo">💼 Trabajo</option><option value="personal">👤 Personal</option><option value="salud">❤️ Salud</option><option value="estudio">📖 Estudio</option><option value="hogar">🏠 Hogar</option>{customCategories.map(cat => <option key={cat} value={cat}>✨ {cat}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={createForm.dueDate} onChange={e => setCreateForm({...createForm, dueDate: e.target.value})} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm" />
                <select value={createForm.recurrencia} onChange={e => setCreateForm({...createForm, recurrencia: e.target.value as any})} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm">
                  <option value="ninguna">Ninguna</option><option value="diaria">Diaria</option><option value="semanal">Semanal</option><option value="mensual">Mensual</option>
                </select>
              </div>
              <input type="text" value={createForm.tags} onChange={e => setCreateForm({...createForm, tags: e.target.value})} placeholder="Etiquetas (coma...)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm focus:outline-none" />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Imágenes (máx 3)</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {createForm.imagenes.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover cursor-pointer" onClick={() => setIsFullscreenImageOpen(img)} />
                      <button type="button" onClick={() => removeImage(idx, false)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                  ))}
                  {createForm.imagenes.length < 3 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-lime-400/50 hover:bg-lime-400/5 transition-all"><svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth={2}/></svg><input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, false)} /></label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 border border-white/10 hover:bg-white/5 transition-colors">Cancelar</button>
                <button type="submit" disabled={isCreating} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-lime-400 text-dark-900 hover:bg-lime-400/90 transition-colors shadow-lg shadow-lime-400/20 disabled:opacity-50 flex items-center gap-2">
                  {isCreating ? "Creando..." : "Crear tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/10 rounded-none sm:rounded-2xl p-6 min-h-screen sm:min-h-0 max-w-lg w-full shadow-2xl animate-fade-in my-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-dark-900 dark:text-white">Editar tarea</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <div className="space-y-4">
              <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50" />
              <textarea rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 resize-none" />
              <div className="grid grid-cols-2 gap-4">
                <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value as any})} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm focus:outline-none">
                  <option value="alta">🔴 Alta</option><option value="media">🟡 Media</option><option value="baja">🔵 Baja</option>
                </select>
                <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value as any})} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm focus:outline-none">
                  <option value="trabajo">💼 Trabajo</option><option value="personal">👤 Personal</option><option value="salud">❤️ Salud</option><option value="estudio">📖 Estudio</option><option value="hogar">🏠 Hogar</option>{customCategories.map(cat => <option key={cat} value={cat}>✨ {cat}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm focus:outline-none" />
                <select value={editForm.estado} onChange={e => setEditForm({...editForm, estado: e.target.value as any})} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm focus:outline-none">
                  <option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completada">Completada</option>
                </select>
              </div>
              <select value={editForm.recurrencia} onChange={e => setEditForm({...editForm, recurrencia: e.target.value as any})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm focus:outline-none">
                <option value="ninguna">Ninguna</option><option value="diaria">Diaria</option><option value="semanal">Semanal</option><option value="mensual">Mensual</option>
              </select>
              <input type="text" value={editForm.tags} onChange={e => setEditForm({...editForm, tags: e.target.value})} placeholder="Etiquetas..." className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm focus:outline-none" />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Imágenes (máx 3)</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {(editForm.imagenes || []).map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover cursor-pointer" onClick={() => setIsFullscreenImageOpen(img)} />
                      <button type="button" onClick={() => removeImage(idx, true)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                  ))}
                  {(editForm.imagenes || []).length < 3 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer hover:border-lime-400/50 hover:bg-lime-400/5 transition-all"><svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth={2}/></svg><input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, true)} /></label>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-white/10 pt-6 mt-6">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>Compartir</h4>
                <div className="flex gap-2 mb-4">
                  <input type="email" value={shareEmail} onChange={e => setShareEmail(e.target.value)} placeholder="Email..." className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-white text-sm focus:outline-none" />
                  <select value={sharePermiso} onChange={e => setSharePermiso(e.target.value)} className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-white text-sm focus:outline-none"><option value="ver">Ver</option><option value="editar">Editar</option></select>
                  <button onClick={handleShare} disabled={isSharing || !shareEmail} className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-colors disabled:opacity-50">Invitar</button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {editingTask.compartidaCon?.map((share: any) => (
                    <div key={share.usuario?._id || share.usuario} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">{(share.usuario?.nombre || 'U').substring(0, 2).toUpperCase()}</div>
                        <div className="min-w-0"><p className="text-[10px] text-gray-500 truncate">{share.usuario?.nombre || '...'}</p><p className="text-xs font-bold text-white truncate">{share.usuario?.email || '...'}</p><span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${share.permiso === 'editar' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'}`}>{share.permiso}</span></div>
                      </div>
                      <button onClick={() => handleUnshare(share.usuario?._id || share.usuario)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 transition-colors border border-transparent hover:border-red-400/20"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 border border-white/10 hover:bg-white/5 transition-colors">Cancelar</button>
                <button onClick={saveEdit} disabled={isSaving} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-lime-400 text-dark-900 hover:bg-lime-400/90 transition-colors shadow-lg shadow-lime-400/20 disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Viewer */}
      {isFullscreenImageOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setIsFullscreenImageOpen(null)}>
          <img src={isFullscreenImageOpen} alt="Full" className="max-w-full max-h-full rounded-2xl shadow-2xl animate-scale-in" />
        </div>
      )}
    </div>
  );
}
