"use client";

import { useState, useEffect } from "react";
import { type Habit } from "@/app/lib/mockData";
import { getHabits, checkHabit, createHabit, updateHabit, deleteHabit } from "../../../lib/api";

const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("✨");
  const [isCreating, setIsCreating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editHabitName, setEditHabitName] = useState("");
  const [editHabitIcon, setEditHabitIcon] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setEditHabitName(habit.name);
    setEditHabitIcon(habit.icon);
    setIsEditModalOpen(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editHabitName.trim()) return;
    setIsSaving(true);
    try {
      const updated = await updateHabit(editingHabit.id, { nombre: editHabitName, icono: editHabitIcon });
      setHabits(habits.map(h => h.id === editingHabit.id ? { ...h, name: updated.nombre, icon: updated.icono } : h));
      setIsEditModalOpen(false);
      setEditingHabit(null);
    } catch (err) {
      console.error("Error editando hábito", err);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;
    try {
      await deleteHabit(habitToDelete);
      setHabits(habits.filter(h => h.id !== habitToDelete));
      setIsDeleteModalOpen(false);
      setHabitToDelete(null);
    } catch (err) {
      console.error("Error eliminando hábito", err);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    setIsCreating(true);
    try {
      await createHabit({ nombre: newHabitName, icono: newHabitIcon });
      window.location.href = "/habits";
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const data = await getHabits();
        
        const getCompletedDays = (historial: string[]) => {
          const historyDates = historial.map(d => new Date(d).toISOString().substring(0, 10));
          const today = new Date();
          const dayOfWeek = today.getDay();
          const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          const monday = new Date(today);
          monday.setDate(today.getDate() + diffToMonday);

          return [0, 1, 2, 3, 4, 5, 6].map(i => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return historyDates.includes(d.toISOString().substring(0, 10));
          });
        };

        const mappedHabits = data.map((h: any) => ({
          id: h._id,
          name: h.nombre,
          icon: h.icono,
          streak: h.racha,
          completedToday: h.completadoHoy,
          completedDays: getCompletedDays(h.historial || [])
        }));
        setHabits(mappedHabits);
      } catch (err) {
        console.error("Error cargando hábitos:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHabits();
  }, []);

  const toggleHabit = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const nowCompleted = !habit.completedToday;

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        return {
          ...h,
          completedToday: nowCompleted,
          streak: nowCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
        };
      })
    );

    try {
      await checkHabit(id);
    } catch (err) {
      console.error(err);
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== id) return h;
          return {
            ...h,
            completedToday: !nowCompleted,
            streak: habit.streak,
          };
        })
      );
    }
  };

  const completedCount = habits.filter((h) => h.completedToday).length;

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-10 w-48 shimmer rounded-2xl mb-8"></div>
      <div className="h-24 w-full shimmer rounded-2xl mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start justify-between p-5 bg-dark-800 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shimmer rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 shimmer rounded-2xl"></div>
                <div className="h-3 w-24 shimmer rounded-2xl"></div>
              </div>
            </div>
            <div className="w-11 h-11 shimmer rounded-2xl"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hábitos diarios</h1>
          <p className="text-gray-400 text-sm mt-1">
            {completedCount} de {habits.length} completados hoy
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all hover:shadow-lg hover:shadow-lime-400/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo hábito
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Progreso de hoy</span>
          <span className="text-sm font-bold text-lime-400">
            {habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0}%
          </span>
        </div>
        <div className="h-2.5 bg-dark-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Habits grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className={`group bg-dark-800 border rounded-2xl p-5 transition-all duration-300 ${
              habit.completedToday
                ? "border-lime-400/20 bg-lime-400/[0.03]"
                : "border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: icon + info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  habit.completedToday ? "bg-lime-400/10" : "bg-dark-700"
                }`}>
                  {habit.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white">{habit.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                    <span className="text-sm text-gray-400">
                      <span className="font-semibold text-orange-400">{habit.streak}</span> días de racha
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons + toggle */}
              <div className="flex items-center gap-2">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 sm:gap-2 mr-2">
                  <button
                    onClick={() => openEditModal(habit)}
                    className="p-2 rounded-xl bg-dark-700 hover:bg-lime-500/10 text-gray-400 hover:text-lime-400 transition-colors"
                    title="Editar hábito"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button
                    onClick={() => { setHabitToDelete(habit.id); setIsDeleteModalOpen(true); }}
                    className="p-2 rounded-xl bg-dark-700 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                    title="Eliminar hábito"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    habit.completedToday
                      ? "bg-lime-400 text-dark-900 shadow-lg shadow-lime-400/20"
                      : "bg-dark-600 text-gray-500 hover:bg-dark-500 hover:text-white"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Weekly dots */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
              <span className="text-xs text-gray-500 mr-1">Semana:</span>
              {habit.completedDays.map((done, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                      done
                        ? "bg-lime-400/20 text-lime-400"
                        : "bg-dark-700 text-gray-600"
                    }`}
                  >
                    {dayLabels[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Hábito */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Nuevo hábito</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre del hábito</label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all"
                  placeholder="Ej: Leer 30 minutos, Beber agua..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Icono (Emoji)</label>
                <input
                  type="text"
                  value={newHabitIcon}
                  onChange={(e) => setNewHabitIcon(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all"
                  placeholder="Ej: 📚, 💧, 🏃‍♂️..."
                  required
                />
              </div>

              <div className="flex items-center gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? "Creando..." : "Crear hábito"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Eliminar hábito</h3>
            <p className="text-gray-400 text-sm mb-6">¿Estás seguro de que deseas eliminar este hábito? Se perderá todo el historial de rachas.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setHabitToDelete(null); }}
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Editar hábito</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre del hábito</label>
                <input
                  type="text"
                  value={editHabitName}
                  onChange={(e) => setEditHabitName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all"
                  placeholder="Ej: Leer 30 minutos..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Icono (Emoji)</label>
                <input
                  type="text"
                  value={editHabitIcon}
                  onChange={(e) => setEditHabitIcon(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all"
                  placeholder="Ej: 📚..."
                  required
                />
              </div>

              <div className="flex items-center gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
