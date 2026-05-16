"use client";

import { useState, useEffect } from "react";
import { getStats } from "../lib/api";

export default function QuickSummary() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({ pending: 0, habitCompletion: 0 });

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const data = await getStats();

        // To be more accurate, we'll just use the pending tasks from stats
        setStats({
          pending: data.tareasPendientes || 0,
          habitCompletion: Math.round(data.porcentajeProductividad || 0),
        });
      } catch (error) {
        console.error("Error fetching quick stats:", error);
      }
    };

    if (isOpen) {
      fetchQuickStats();
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-64 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 animate-slide-up transition-colors">
          <h3 className="text-sm font-bold text-dark-900 dark:text-white mb-3 flex items-center justify-between">
            Resumen de Hoy 📋
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tareas Pendientes</span>
              </div>
              <span className="text-sm font-bold text-dark-900 dark:text-white">{stats.pending}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center text-lime-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Hábitos</span>
              </div>
              <span className="text-sm font-bold text-dark-900 dark:text-white">{stats.habitCompletion}%</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-dark-900 dark:bg-white text-white dark:text-dark-900 rotate-90"
            : "bg-lime-400 text-dark-900 shadow-lime-400/20"
        }`}
      >
        {isOpen ? (
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )}
      </button>
    </div>
  );
}
