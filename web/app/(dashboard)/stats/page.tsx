"use client";

import { useState, useEffect } from "react";
import { getStats } from "../../../lib/api";

interface HabitDetail {
  nombre: string;
  icono: string;
  rachaActual: number;
  rachaMaxima: number;
}

interface DayActivity {
  day: string;
  tasks: number;
}

interface StatsData {
  tareasCompletadasHoy: number;
  tareasCompletadasEstaSemana: number;
  totalTareas: number;
  tareasCompletadas: number;
  tareasPendientes: number;
  porcentajeProductividad: number;
  rachaMaximaHabitos: number;
  actividadSemanal: DayActivity[];
  habitosDetalles: HabitDetail[];
  mejorDia: string;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 shimmer rounded-2xl mb-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 shimmer rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 shimmer rounded-2xl"></div>
          <div className="h-80 shimmer rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-white text-center py-10">Error al cargar estadísticas</div>;

  const maxTasks = Math.max(...(stats.actividadSemanal?.map((d: DayActivity) => d.tasks) || []), 1);
  const productivity = stats.porcentajeProductividad || 0;

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Tus <span className="text-lime-400">Estadísticas</span> 📊
        </h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">
          Visualiza tu progreso y rendimiento semanal
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 hover:border-lime-400/20 transition-all group">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Creadas</p>
          <p className="text-4xl font-bold text-white">{stats.totalTareas}</p>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            Desde que te uniste
          </div>
        </div>
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 hover:border-lime-400/20 transition-all group">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Completadas</p>
          <p className="text-4xl font-bold text-lime-400">{stats.tareasCompletadas}</p>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-lime-400 mr-2"></span>
            Tareas finalizadas
          </div>
        </div>
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 hover:border-lime-400/20 transition-all group">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Pendientes</p>
          <p className="text-4xl font-bold text-orange-400">{stats.tareasPendientes}</p>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-orange-400 mr-2"></span>
            Por completar
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Productivity Circular Chart */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold mb-8 self-start">Productividad Global</h2>
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                className="text-white/5"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - productivity / 100)}
                strokeLinecap="round"
                className="text-lime-400 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{productivity}%</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Éxito</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-8 max-w-[280px]">
            Tu porcentaje de tareas completadas respecto al total. ¡Sigue así!
          </p>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold">Actividad Semanal</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-lime-400"></span>
                Completadas
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-56 mt-4">
            {stats.actividadSemanal?.map((day: DayActivity, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
                <div className="w-full relative flex items-end justify-center flex-1">
                  <div
                    className="w-full max-w-[32px] sm:max-w-[40px] rounded-t-lg bg-gradient-to-t from-lime-400/40 to-lime-400 transition-all duration-500 group-hover:from-lime-400 group-hover:to-emerald-400 relative"
                    style={{ height: `${Math.max((day.tasks / maxTasks) * 100, 2)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-700 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.tasks}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Habit Streaks */}
        <div className="lg:col-span-2 bg-dark-800 border border-white/5 rounded-2xl p-8">
          <h2 className="text-lg font-semibold mb-6">Racha de Hábitos</h2>
          <div className="space-y-6">
            {stats.habitosDetalles && stats.habitosDetalles.length > 0 ? (
              stats.habitosDetalles.map((habit: HabitDetail, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{habit.icono}</span>
                      <span className="text-sm font-medium text-white">{habit.nombre}</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Actual</p>
                        <p className="text-sm font-bold text-lime-400">{habit.rachaActual}🔥</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Máxima</p>
                        <p className="text-sm font-bold text-white">{habit.rachaMaxima}🏆</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lime-400 transition-all duration-1000"
                      style={{ width: `${Math.min(100, (habit.rachaActual / (habit.rachaMaxima || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay hábitos registrados aún.</p>
            )}
          </div>
        </div>

        {/* Best Day Card */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Día más Productivo</h2>
          <p className="text-4xl font-bold text-white mb-2">{stats.mejorDia}</p>
          <p className="text-sm text-gray-500">
            Es el día en el que sueles completar más tareas. ¡Aprovecha esa energía!
          </p>
        </div>
      </div>
    </div>
  );
}
