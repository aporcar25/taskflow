"use client";

import { useState, useEffect, useMemo } from "react";
import { getStats, getTasks, getHabits } from "../../../lib/api";

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

interface TaskData {
  _id: string;
  categoria: string;
  prioridad: string;
  completada: boolean;
  updatedAt: string;
}

interface HabitData {
  _id: string;
  racha: number;
  historial: string[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tasksData, habitsData] = await Promise.all([
          getStats(),
          getTasks(),
          getHabits()
        ]);
        setStats(statsData);
        setTasks(tasksData);
        setHabits(habitsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // New calculations
  const categoriesData = useMemo(() => {
    const counts: Record<string, number> = { personal: 0, trabajo: 0, salud: 0, estudios: 0 };
    tasks.forEach((t: TaskData) => {
      if (Object.prototype.hasOwnProperty.call(counts, t.categoria)) {
        counts[t.categoria]++;
      } else {
        counts[t.categoria] = (counts[t.categoria] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [tasks]);

  const prioritiesData = useMemo(() => {
    return {
      alta: tasks.filter(t => t.prioridad === 'alta').length,
      media: tasks.filter(t => t.prioridad === 'media').length,
      baja: tasks.filter(t => t.prioridad === 'baja').length,
    };
  }, [tasks]);

  const streaksData = useMemo(() => {
    let currentMax = 0;
    let historicalMax = 0;
    habits.forEach((h: HabitData) => {
      if (h.racha > currentMax) currentMax = h.racha;

      let maxH = 0;
      let currentH = 0;
      const sortedHistory = [...h.historial].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      if (sortedHistory.length > 0) {
        currentH = 1;
        maxH = 1;
        for (let i = 1; i < sortedHistory.length; i++) {
          const d1 = new Date(sortedHistory[i-1]);
          const d2 = new Date(sortedHistory[i]);
          d1.setHours(0,0,0,0);
          d2.setHours(0,0,0,0);
          const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            currentH++;
          } else if (diff > 1) {
            currentH = 1;
          }
          if (currentH > maxH) maxH = currentH;
        }
      }
      if (maxH > historicalMax) historicalMax = maxH;
    });
    return { currentMax, historicalMax };
  }, [habits]);

  const dayRanking = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    tasks.filter((t: TaskData) => t.completada && t.updatedAt).forEach((t: TaskData) => {
      const date = new Date(t.updatedAt);
      counts[date.getDay()]++;
    });
    return days.map((name, i) => ({ name, count: counts[i] }))
      .sort((a, b) => b.count - a.count);
  }, [tasks]);

  const weeklyHabits = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push(d);
    }

    return weekDays.map(date => {
      const dateStr = date.toDateString();
      const isToday = dateStr === today.toDateString();
      const isFuture = date > today && !isToday;

      const allCompleted = !isFuture && habits.length > 0 && habits.every((h: HabitData) =>
        h.historial.some((hd: string) => new Date(hd).toDateString() === dateStr)
      );

      return {
        label: ['L', 'M', 'X', 'J', 'V', 'S', 'D'][date.getDay() === 0 ? 6 : date.getDay() - 1],
        completed: allCompleted,
        isFuture,
        isToday
      };
    });
  }, [habits]);

  const monthlyHabits = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toDateString();
      const isToday = dateStr === today.toDateString();
      const isFuture = date > today && !isToday;

      const allCompleted = !isFuture && habits.length > 0 && habits.every((h: HabitData) =>
        h.historial.some((hd: string) => new Date(hd).toDateString() === dateStr)
      );

      days.push({ day: i, completed: allCompleted, isFuture, isToday });
    }
    return days;
  }, [habits]);

  const monthlyProgress = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const completedThisMonth = tasks.filter((t: TaskData) => {
      if (!t.completada || !t.updatedAt) return false;
      const d = new Date(t.updatedAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const completedLastMonth = tasks.filter((t: TaskData) => {
      if (!t.completada || !t.updatedAt) return false;
      const d = new Date(t.updatedAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    }).length;

    const diff = completedThisMonth - completedLastMonth;
    const improvement = completedLastMonth === 0 ? 100 : Math.round((diff / completedLastMonth) * 100);

    return { thisMonth: completedThisMonth, lastMonth: completedLastMonth, improvement, diff };
  }, [tasks]);

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

  const productivity = stats.porcentajeProductividad || 0;

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark-900 dark:text-white">
          Tus <span className="text-lime-400">Estadísticas</span> 📊
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
          Visualiza tu progreso y rendimiento semanal
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:border-lime-400/20 transition-all group shadow-sm dark:shadow-none">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Creadas</p>
          <p className="text-4xl font-bold text-dark-900 dark:text-white">{stats.totalTareas}</p>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            Desde que te uniste
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:border-lime-400/20 transition-all group shadow-sm dark:shadow-none">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Completadas</p>
          <p className="text-4xl font-bold text-lime-500 dark:text-lime-400">{stats.tareasCompletadas}</p>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-lime-400 mr-2"></span>
            Tareas finalizadas
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:border-lime-400/20 transition-all group shadow-sm dark:shadow-none">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Pendientes</p>
          <p className="text-4xl font-bold text-orange-500 dark:text-orange-400">{stats.tareasPendientes}</p>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-orange-400 mr-2"></span>
            Por completar
          </div>
        </div>
      </div>

      {/* Tareas por Prioridad & Progreso Mensual */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-center shadow-sm dark:shadow-none">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">Tareas por Prioridad</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-2xl font-bold text-red-500">{prioritiesData.alta}</span>
              <span className="text-[10px] uppercase tracking-widest text-red-400/70 mt-1 font-bold">Alta</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-2xl font-bold text-yellow-500">{prioritiesData.media}</span>
              <span className="text-[10px] uppercase tracking-widest text-yellow-400/70 mt-1 font-bold">Media</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-2xl font-bold text-blue-500">{prioritiesData.baja}</span>
              <span className="text-[10px] uppercase tracking-widest text-blue-400/70 mt-1 font-bold">Baja</span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between group overflow-hidden relative shadow-sm dark:shadow-none">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-lime-400/5 rounded-full blur-2xl"></div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Este Mes</p>
            <p className="text-4xl font-bold text-dark-900 dark:text-white">{monthlyProgress.thisMonth}</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${monthlyProgress.diff >= 0 ? 'bg-lime-400/10 text-lime-400' : 'bg-red-400/10 text-red-400'}`}>
              <svg className={`w-3 h-3 ${monthlyProgress.diff < 0 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              {Math.abs(monthlyProgress.improvement)}%
            </div>
            <span className="text-[10px] text-gray-500">vs mes pasado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Productivity Circular Chart */}
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold mb-8 self-start text-dark-900 dark:text-white">Productividad Global</h2>
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90">
              <defs>
                <linearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a3e635" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                className="text-gray-100 dark:text-white/5"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="transparent"
                stroke="url(#limeGradient)"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - productivity / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-dark-900 dark:text-white">{productivity}%</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Éxito</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-8 max-w-[280px]">
            Tu porcentaje de tareas completadas respecto al total. ¡Sigue así!
          </p>
        </div>

        {/* Tareas por Categoría - Horizontal Bar Chart */}
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-8 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold mb-8 text-dark-900 dark:text-white">Tareas por Categoría</h2>
          <div className="space-y-6">
            {categoriesData.map((cat, i) => {
              const maxCount = Math.max(...categoriesData.map(c => c.count), 1);
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400 capitalize">{cat.name}</span>
                    <span className="font-bold text-dark-900 dark:text-white">{cat.count}</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 transition-all duration-1000"
                      style={{ width: `${(cat.count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habits this week & Streak comparison */}
        <div className="flex flex-col gap-8">
          <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-8 flex-1 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold mb-6 text-dark-900 dark:text-white">Hábitos esta Semana</h2>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-dark-700/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
              {weeklyHabits.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <span className={`text-xs font-bold ${day.isToday ? 'text-lime-400' : 'text-gray-500'}`}>{day.label}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    day.completed
                      ? 'bg-lime-400 text-dark-900 shadow-lg shadow-lime-400/20'
                      : day.isToday
                        ? 'bg-lime-400/20 border border-lime-400 text-lime-400'
                        : day.isFuture
                          ? 'bg-white/5 border border-white/5'
                          : 'bg-white/10 text-gray-500'
                  }`}>
                    {day.completed ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-4 text-center">
              Días donde completaste todos tus hábitos programados
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-8 flex items-center justify-between group overflow-hidden relative shadow-sm dark:shadow-none">
            <div className="absolute right-0 top-0 w-32 h-32 bg-lime-400/10 rounded-full blur-3xl group-hover:bg-lime-400/20 transition-all"></div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold leading-tight text-dark-900 dark:text-white">Racha Actual vs<br/><span className="text-lime-500 dark:text-lime-400">Mejor Racha</span></h2>
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Actual</p>
                  <p className="text-3xl font-bold text-dark-900 dark:text-white">{streaksData.currentMax}🔥</p>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mb-1"></div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Mejor</p>
                  <p className="text-3xl font-bold text-lime-500 dark:text-lime-400">{streaksData.historicalMax}🏆</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-lime-400 flex items-center justify-center text-dark-900 shadow-xl shadow-lime-400/20 transform -rotate-12 group-hover:rotate-0 transition-transform">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Habit Streaks */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-8 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold mb-6 text-dark-900 dark:text-white">Racha de Hábitos</h2>
          <div className="space-y-6">
            {stats.habitosDetalles && stats.habitosDetalles.length > 0 ? (
              stats.habitosDetalles.map((habit: HabitDetail, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{habit.icono}</span>
                      <span className="text-sm font-medium text-dark-900 dark:text-white">{habit.nombre}</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Actual</p>
                        <p className="text-sm font-bold text-lime-400">{habit.rachaActual}🔥</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Máxima</p>
                        <p className="text-sm font-bold text-dark-900 dark:text-white">{habit.rachaMaxima}🏆</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 transition-all duration-1000"
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

        {/* Best Day & Ranking Card */}
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-8 flex flex-col shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Día más Productivo</h2>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center mb-8">
            <p className="text-5xl font-bold text-dark-900 dark:text-white mb-2">{dayRanking[0]?.name || stats.mejorDia}</p>
            <p className="text-sm text-gray-500 max-w-[180px]">
              Tu pico de productividad suele ser los <span className="text-dark-900 dark:text-white font-medium">{dayRanking[0]?.name || stats.mejorDia}</span>
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Ranking semanal</p>
            {dayRanking.slice(0, 3).map((day, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-700/30 border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 flex items-center justify-center rounded-lg text-[10px] font-bold ${i === 0 ? 'bg-lime-400 text-dark-900' : 'bg-gray-200 dark:bg-dark-600 text-gray-400'}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-dark-900 dark:text-white">{day.name}</span>
                </div>
                <span className="text-xs text-gray-500">{day.count} tareas</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Habits Calendar */}
      <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-8 shadow-sm dark:shadow-none">
        <h2 className="text-lg font-semibold mb-6 text-dark-900 dark:text-white">Hábitos este Mes</h2>
        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              {d}
            </div>
          ))}
          {(() => {
            const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
            const blanks = Array(firstDay).fill(null);
            return [
              ...blanks.map((_, i) => <div key={`blank-${i}`} />),
              ...monthlyHabits.map((day) => (
                <div
                  key={day.day}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-all ${
                    day.completed
                      ? 'bg-lime-400 border-lime-400 text-dark-900 shadow-lg shadow-lime-400/20'
                      : day.isToday
                        ? 'bg-lime-400/10 border-lime-400 text-lime-400'
                        : day.isFuture
                          ? 'bg-transparent border-white/5 text-gray-700'
                          : 'bg-white/5 border-white/5 text-gray-500'
                  }`}
                >
                  {day.day}
                  {day.completed && (
                    <svg className="w-2.5 h-2.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))
            ];
          })()}
        </div>
        <p className="text-[10px] text-gray-500 mt-6 text-center">
          Visualización mensual del cumplimiento total de tus hábitos diarios
        </p>
      </div>
    </div>
  );
}
