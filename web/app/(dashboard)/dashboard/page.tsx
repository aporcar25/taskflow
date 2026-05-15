"use client";

import { useState, useEffect } from "react";
import { weeklyActivity as defaultWeeklyActivity } from "@/app/lib/mockData";
import { getStats, getTasks } from "../../../lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    completedToday: 0,
    totalToday: 0,
    completedThisWeek: 0,
    totalThisWeek: 0,
    productivity: 0,
    streakDays: 0,
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("Buenos días");
  const [userName, setUserName] = useState("Antón");
  const weeklyActivity = defaultWeeklyActivity;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      setGreeting("Buenos días");
    } else if (hour >= 12 && hour < 21) {
      setGreeting("Buenas tardes");
    } else {
      setGreeting("Buenas noches");
    }

    const userStr = localStorage.getItem('taskflow_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.nombre) {
          setUserName(user.nombre.split(' ')[0]);
        }
      } catch (e) {}
    }

    const fetchData = async () => {
      try {
        const statsData = await getStats();
        setStats({
          completedToday: statsData.tareasCompletadasHoy || 0,
          totalToday: statsData.totalTareas || 0,
          completedThisWeek: statsData.tareasCompletadasEstaSemana || 0,
          totalThisWeek: statsData.totalTareas || 0,
          productivity: statsData.porcentajeProductividad || 0,
          streakDays: statsData.rachaMaximaHabitos || 0,
        });

        const tasksData = await getTasks();
        const mappedTasks = tasksData.map((t: any) => ({
          id: t._id,
          title: t.titulo,
          category: t.categoria,
          priority: t.prioridad,
          completed: t.completada,
        }));
        setRecentTasks(mappedTasks.slice(0, 5));
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      }
    };
    fetchData();
  }, []);

  const maxTasks = Math.max(...weeklyActivity.map((d) => d.tasks));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {greeting}, <span className="text-lime-400">{userName}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">
          Aquí tienes tu resumen de productividad
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Completed today */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-5 hover:border-lime-400/20 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center text-lime-400 group-hover:bg-lime-400/20 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white animate-count-up">
            {stats.completedToday}
            <span className="text-lg text-gray-500 font-normal">/{stats.totalToday}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">tareas completadas</p>
        </div>

        {/* Completed this week */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-5 hover:border-lime-400/20 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Semana</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400/20 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white animate-count-up">
            {stats.completedThisWeek}
            <span className="text-lg text-gray-500 font-normal">/{stats.totalThisWeek}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">esta semana</p>
        </div>

        {/* Productivity */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-5 hover:border-lime-400/20 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Productividad</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400/20 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white animate-count-up">
            {stats.productivity}
            <span className="text-lg text-lime-400 font-normal">%</span>
          </p>
          <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${stats.productivity}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-5 hover:border-lime-400/20 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Racha</span>
            <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-400/20 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white animate-count-up">
            {stats.streakDays}
            <span className="text-lg text-gray-500 font-normal"> días</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">racha consecutiva</p>
        </div>
      </div>

      {/* Activity chart + Recent tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weekly activity chart */}
        <div className="lg:col-span-3 bg-dark-800 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Actividad semanal</h2>
            <span className="text-xs text-gray-500 bg-dark-700 px-3 py-1 rounded-lg">Esta semana</span>
          </div>

          {/* Chart */}
          <div className="flex items-end justify-between gap-3 h-48">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">{day.tasks}</span>
                <div className="w-full relative group">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-lime-400/80 to-lime-400 transition-all duration-500 group-hover:from-lime-400 group-hover:to-emerald-400 group-hover:shadow-lg group-hover:shadow-lime-400/20"
                    style={{
                      height: `${(day.tasks / maxTasks) * 160}px`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent tasks */}
        <div className="lg:col-span-2 bg-dark-800 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Tareas recientes</h2>
            <Link href="/tasks" className="text-xs text-lime-400 hover:text-lime-300 transition-colors font-medium">
              Ver todas →
            </Link>
          </div>

          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-700 transition-colors group"
              >
                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    task.completed
                      ? "bg-lime-400 border-lime-400"
                      : "border-gray-600 group-hover:border-gray-400"
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.completed ? "line-through text-gray-500" : "text-white"}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">{task.category}</p>
                </div>

                {/* Priority badge */}
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase ${
                    task.priority === "alta"
                      ? "bg-red-500/10 text-red-400"
                      : task.priority === "media"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
