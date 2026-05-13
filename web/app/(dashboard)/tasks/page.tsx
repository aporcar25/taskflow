"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { type Task, type Priority, type Category } from "@/app/lib/mockData";
import { getTasks, completeTask } from "../../../lib/api";

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        const mappedTasks = data.map((t: any) => ({
          id: t._id,
          title: t.titulo,
          description: t.descripcion,
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
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
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
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all hover:shadow-lg hover:shadow-lime-400/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva tarea
        </Link>
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
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border ${priorityColors[task.priority]}`}>
                      {task.priority === "alta" ? "🔴" : task.priority === "media" ? "🟡" : "🔵"} {task.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${categoryColors[task.category]}`}>
                      {categoryIcons[task.category]} {task.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
