"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { getTasks, getHabits } from "@/lib/api";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    label: "Objetivos",
    href: "/objetivos",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12a7 7 0 11-14 0 7 7 0 0114 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Notas",
    href: "/notas",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Estadísticas",
    href: "/stats",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Tareas",
    href: "/tasks",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Hábitos",
    href: "/habits",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: "Ajustes",
    href: "/settings",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({
  isOpen,
  setIsOpen,
  isPomodoroOpen,
  setIsPomodoroOpen
}: {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  isPomodoroOpen?: boolean;
  setIsPomodoroOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();

  const [user, setUser] = useState<{ nombre: string; email: string; foto?: string } | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [isDark, setIsDark] = useState(true);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchData, setSearchData] = useState<{ tasks: { _id: string; titulo: string; descripcion: string; completada: boolean; prioridad: string }[], habits: { _id: string; nombre: string; icono: string; racha: number }[] }>({ tasks: [], habits: [] });

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const loadUser = () => {
      const userStr = localStorage.getItem('taskflow_user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser({ nombre: userData.nombre || 'Usuario', email: userData.email || '', foto: userData.foto || '' });
        } catch {
          setUser(null);
        }
      }
    };
    loadUser();

    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://taskflow-p73h.onrender.com/api"}/stats`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("taskflow_token")}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Find max current streak among habits
          let maxStreak = 0;
          if (data.habitosDetalles) {
            maxStreak = Math.max(...data.habitosDetalles.map((h: { rachaActual: number }) => h.rachaActual), 0);
          }
          setStreak(maxStreak);
        }
      } catch (error) {
        console.error("Error fetching streak:", error);
      }
    };
    fetchStats();

    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  const fetchSearchData = async () => {
    try {
      const [tasks, habits] = await Promise.all([getTasks(), getHabits()]);
      setSearchData({
        tasks: (tasks as { _id: string; titulo: string; descripcion: string; completada: boolean; prioridad: string }[]).map(t => ({ _id: (t as { _id: string })._id, titulo: t.titulo, descripcion: t.descripcion, completada: t.completada, prioridad: t.prioridad })),
        habits: (habits as { _id: string; nombre: string; icono: string; racha: number }[]).map(h => ({ _id: (h as { _id: string })._id, nombre: h.nombre, icono: h.icono, racha: h.racha }))
      });
      setIsSearchOpen(true);
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return { tasks: [], habits: [] };
    const query = searchQuery.toLowerCase();
    return {
      tasks: searchData.tasks.filter(t =>
        t.titulo?.toLowerCase().includes(query) ||
        t.descripcion?.toLowerCase().includes(query)
      ).slice(0, 5),
      habits: searchData.habits.filter(h =>
        h.nombre?.toLowerCase().includes(query)
      ).slice(0, 5)
    };
  }, [searchQuery, searchData]);

  const handleLogout = () => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
    window.location.href = "/";
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden animate-fade-in"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-white/5 z-50 transition-all duration-300 transform md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-lime-400 flex items-center justify-center">
            <svg className="w-5 h-5 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
            <span className="text-xl font-bold tracking-tight text-dark-900 dark:text-white">
              Task<span className="text-lime-400">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
          <button
            onClick={fetchSearchData}
            className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-lime-400 transition-colors"
            title="Buscar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-lime-400 transition-colors"
            title="Cambiar tema"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                  ? "bg-lime-400/10 text-lime-400 border border-lime-400/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-dark-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
              >
                <span className={`transition-colors ${isActive ? "text-lime-400" : "text-gray-500 group-hover:text-dark-900 dark:group-hover:text-white"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-white/5 space-y-1">
          <button
            onClick={() => setIsPomodoroOpen?.(!isPomodoroOpen)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isPomodoroOpen
                ? "bg-lime-400/10 text-lime-400 border border-lime-400/20"
                : "text-gray-500 dark:text-gray-400 hover:text-dark-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
          >
            <svg className={`w-5 h-5 transition-colors ${isPomodoroOpen ? "text-lime-400" : "text-gray-500 group-hover:text-dark-900 dark:group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pomodoro
          </button>

          <Link href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10 group-hover:border-lime-400/50 transition-colors">
              {user?.foto ? (
                <img src={user.foto} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-dark-900 font-bold text-sm">
                  {user?.nombre?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-dark-900 dark:text-white truncate group-hover:text-lime-400 transition-colors">{user?.nombre || 'Usuario'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
              {streak > 0 && (
                <span className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/10">
                  {streak}🔥
                </span>
              )}
            </div>
          </Link>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>


      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => { setIsSearchOpen(false); setSearchQuery(""); }}
        query={searchQuery}
        setQuery={setSearchQuery}
        results={filteredResults}
      />

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsLogoutModalOpen(false)}>
          <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">¿Cerrar sesión?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Seguro que quieres cerrar sesión? Tendrás que volver a ingresar tus credenciales.</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-gray-100 dark:border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchModal({ isOpen, onClose, query, setQuery, results }: { isOpen: boolean, onClose: () => void, query: string, setQuery: (q: string) => void, results: { tasks: { _id: string; titulo: string; completada: boolean; prioridad: string }[], habits: { _id: string; nombre: string; icono: string; racha: number }[] } }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-0 sm:pt-[15vh] px-0 sm:px-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/10 rounded-none sm:rounded-3xl w-full max-w-2xl h-full sm:h-auto shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-white/5">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar tareas, hábitos..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-700 border-none rounded-2xl text-dark-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {query.trim() === "" ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 dark:text-gray-500">Escribe algo para empezar a buscar...</p>
            </div>
          ) : results.tasks.length === 0 && results.habits.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 dark:text-gray-500">No se encontraron resultados para &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.tasks.length > 0 && (
                <div>
                  <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tareas</h3>
                  <div className="space-y-1">
                    {results.tasks.map(task => (
                      <Link
                        key={task._id}
                        href="/tasks"
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                      >
                        <div className={`w-2 h-2 rounded-full ${task.completada ? 'bg-lime-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${task.completada ? 'line-through text-gray-500' : 'text-dark-900 dark:text-white'}`}>
                            {task.titulo}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-gray-400">{task.prioridad}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.habits.length > 0 && (
                <div>
                  <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hábitos</h3>
                  <div className="space-y-1">
                    {results.habits.map(habit => (
                      <Link
                        key={habit._id}
                        href="/habits"
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                      >
                        <span className="text-xl">{habit.icono}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
                            {habit.nombre}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">{habit.racha}🔥</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center">
          <p className="text-[10px] text-gray-400">Presiona <kbd className="bg-white dark:bg-dark-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10 text-gray-500 font-sans">ESC</kbd> para cerrar</p>
          <button onClick={onClose} className="text-[10px] font-bold text-lime-500 hover:underline">Cerrar buscador</button>
        </div>
      </div>
    </div>
  );
}