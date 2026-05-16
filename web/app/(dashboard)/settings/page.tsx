"use client";

import { useState, useEffect } from "react";
import { getPreferences, updatePreferences } from "../../../lib/api";

export default function SettingsPage() {
  const [preferences, setPreferences] = useState({
    emailReminders: true,
    dailySummary: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const prefs = await getPreferences();
        setPreferences(prefs);
        // Sync with localStorage
        localStorage.setItem("taskflow_preferences", JSON.stringify(prefs));
      } catch (error) {
        console.error("Error fetching preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleToggle = async (key: "emailReminders" | "dailySummary") => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await updatePreferences(newPrefs);
      localStorage.setItem("taskflow_preferences", JSON.stringify(newPrefs));
      setMessage({ type: "success", text: "Preferencias actualizadas" });
    } catch (error) {
      console.error("Error updating preferences:", error);
      setMessage({ type: "error", text: "Error al guardar cambios" });
      // Rollback on error
      setPreferences(preferences);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 shimmer rounded-2xl mb-2"></div>
        <div className="space-y-4">
          <div className="h-24 shimmer rounded-2xl"></div>
          <div className="h-24 shimmer rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark-900 dark:text-white">
          Ajustes de <span className="text-lime-400">Notificaciones</span> ⚙️
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gestiona cómo y cuándo quieres recibir avisos de TaskFlow.
        </p>
      </div>

      <div className="space-y-4">
        {/* Email Reminders */}
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex items-center justify-between group transition-all hover:border-lime-400/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark-900 dark:text-white">Recordatorios por Email</h3>
              <p className="text-xs text-gray-500">Recibe notificaciones cuando tus tareas estén próximas a vencer.</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("emailReminders")}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              preferences.emailReminders ? "bg-lime-400" : "bg-gray-200 dark:bg-dark-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.emailReminders ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Daily Summary */}
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex items-center justify-between group transition-all hover:border-lime-400/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark-900 dark:text-white">Resumen Diario</h3>
              <p className="text-xs text-gray-500">Un resumen cada mañana con tus tareas y objetivos del día.</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("dailySummary")}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              preferences.dailySummary ? "bg-lime-400" : "bg-gray-200 dark:bg-dark-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.dailySummary ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium animate-slide-up ${
          message.type === "success" ? "bg-lime-400/10 text-lime-500 border border-lime-400/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
