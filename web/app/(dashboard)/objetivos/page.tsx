"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "../../components/ToastProvider";
import { getGoals, createGoal, updateGoal, deleteGoal, updateGoalProgress } from "../../../lib/api";

interface Goal {
  _id: string;
  titulo: string;
  descripcion: string;
  progreso: number;
  meta: number;
  unidad: string;
  color: string;
  semana: string;
  completado: boolean;
}

const PRESET_COLORS = [
  "#a3e635", // lime-400
  "#34d399", // emerald-400
  "#38bdf8", // sky-400
  "#818cf8", // indigo-400
  "#fb7185", // rose-400
  "#fbbf24", // amber-400
];

export default function GoalsPage() {
  const { showToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(() => {
    const d = new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ titulo: "", descripcion: "", meta: 100, unidad: "", color: "#a3e635" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeProgressInput, setActiveProgressInput] = useState<string | null>(null);
  const [progressIncrement, setProgressIncrement] = useState("");

  useEffect(() => {
    fetchGoals();
  }, [currentWeek]);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const data = await getGoals(currentWeek.toISOString());
      setGoals(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
      showToast("Error al cargar los objetivos", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevWeek = () => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() - 7);
    setCurrentWeek(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + 7);
    setCurrentWeek(d);
  };

  const getWeekRange = () => {
    const start = new Date(currentWeek);
    const end = new Date(currentWeek);
    end.setDate(end.getDate() + 6);
    return `Semana del ${start.getDate()} al ${end.getDate()} de ${start.toLocaleString('es-ES', { month: 'long' })}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    setIsSubmitting(true);
    try {
      const newGoal = await createGoal({ ...form, semana: currentWeek.toISOString() });
      setGoals([newGoal, ...goals]);
      setIsModalOpen(false);
      setForm({ titulo: "", descripcion: "", meta: 100, unidad: "", color: "#a3e635" });
      showToast("Objetivo creado", "success");
    } catch (error) {
      showToast("Error al crear el objetivo", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIncrement = async (id: string) => {
    if (!progressIncrement.trim()) return;
    try {
      const updated = await updateGoalProgress(id, progressIncrement.startsWith('+') || progressIncrement.startsWith('-') ? progressIncrement : `+${progressIncrement}`);
      setGoals(goals.map(g => g._id === id ? updated : g));
      setActiveProgressInput(null);
      setProgressIncrement("");
      if (updated.completado) showToast("¡Objetivo completado!", "success");
    } catch (error) {
      showToast("Error al actualizar progreso", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este objetivo?")) return;
    try {
      await deleteGoal(id);
      setGoals(goals.filter(g => g._id !== id));
      showToast("Objetivo eliminado", "success");
    } catch (error) {
      showToast("Error al eliminar", "error");
    }
  };

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.completado).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [goals]);

  return (
    <div className="animate-fade-in pb-10">
      {/* Header & Week Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark-900 dark:text-white">Objetivos Semanales</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
            <button onClick={handlePrevWeek} className="p-1 hover:text-lime-400 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-medium">{getWeekRange()}</span>
            <button onClick={handleNextWeek} className="p-1 hover:text-lime-400 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" strokeWidth={2} /></svg>
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all hover:shadow-lg hover:shadow-lime-400/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Nueva meta
        </button>
      </div>

      {/* Summary Card */}
      {goals.length > 0 && (
        <div className="mb-8 p-6 bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center gap-6 shadow-sm">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-white/5" />
              <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={226} strokeDashoffset={226 - (226 * stats.percent) / 100} className="text-lime-400 transition-all duration-1000" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-dark-900 dark:text-white">
              {stats.percent}%
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-900 dark:text-white">Resumen de la semana</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Has completado {stats.completed} de {stats.total} objetivos. ¡Sigue así!</p>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 shimmer rounded-2xl"></div>)}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-dark-900 dark:text-white">No tienes objetivos para esta semana</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Crea una meta para empezar a medir tu progreso.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <div key={goal._id} className={`p-6 bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl transition-all ${goal.completado ? 'opacity-60' : 'hover:border-gray-200 dark:hover:border-white/10'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-dark-900 dark:text-white flex items-center gap-2">
                    {goal.titulo}
                    {goal.completado && <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                  </h3>
                  {goal.descripcion && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{goal.descripcion}</p>}
                </div>
                <button onClick={() => handleDelete(goal._id)} className="text-gray-400 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="mb-2 flex justify-between items-end">
                <span className="text-sm font-bold text-dark-900 dark:text-white">
                  {goal.progreso} / {goal.meta} <span className="text-xs font-medium text-gray-500">{goal.unidad}</span>
                </span>
                <span className="text-xs font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full">
                  {Math.round((goal.progreso / goal.meta) * 100)}%
                </span>
              </div>

              <div className="relative h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(100, (goal.progreso / goal.meta) * 100)}%`,
                    backgroundColor: goal.color,
                    boxShadow: goal.progreso / goal.meta >= 0.9 ? `0 0 10px ${goal.color}` : 'none'
                  }}
                />
              </div>

              <div className="flex justify-between items-center">
                {activeProgressInput === goal._id ? (
                  <div className="flex gap-2 animate-slide-down">
                    <input
                      type="text"
                      autoFocus
                      placeholder="+10"
                      value={progressIncrement}
                      onChange={e => setProgressIncrement(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleIncrement(goal._id)}
                      className="w-20 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                    />
                    <button onClick={() => handleIncrement(goal._id)} className="p-2 rounded-lg bg-lime-400 text-dark-900 hover:bg-lime-400/90">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button onClick={() => setActiveProgressInput(null)} className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveProgressInput(goal._id)}
                    className="text-xs font-bold text-lime-400 hover:bg-lime-400/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Actualizar progreso
                  </button>
                )}
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Meta Semanal</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in my-auto">
            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6">Nueva meta semanal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Título</label>
                <input required type="text" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50" placeholder="Ej. Leer un libro" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Descripción (opcional)</label>
                <input type="text" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50" placeholder="Detalles..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Meta</label>
                  <input required type="number" value={form.meta} onChange={e => setForm({...form, meta: parseInt(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Unidad</label>
                  <input type="text" value={form.unidad} onChange={e => setForm({...form, unidad: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50" placeholder="Ej. páginas, km" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Color</label>
                <div className="flex gap-3">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${form.color === c ? 'border-white ring-2 ring-lime-400' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-lime-400 text-dark-900 hover:bg-lime-400/90 transition-all shadow-lg shadow-lime-400/20 disabled:opacity-50">
                  {isSubmitting ? "Creando..." : "Crear meta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
