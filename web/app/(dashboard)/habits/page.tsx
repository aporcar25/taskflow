"use client";

import { useState, useEffect } from "react";
import { type Habit } from "@/app/lib/mockData";
import { getHabits, checkHabit } from "../../../lib/api";

const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);

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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hábitos diarios</h1>
        <p className="text-gray-400 text-sm mt-1">
          {completedCount} de {habits.length} completados hoy
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Progreso de hoy</span>
          <span className="text-sm font-bold text-lime-400">
            {Math.round((completedCount / habits.length) * 100)}%
          </span>
        </div>
        <div className="h-2.5 bg-dark-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / habits.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Habits grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className={`bg-dark-800 border rounded-2xl p-5 transition-all duration-300 ${
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

              {/* Right: toggle button */}
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
    </div>
  );
}
