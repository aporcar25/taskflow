"use client";

import { useState, useEffect } from "react";
import { getPreferences, updatePreferences, getCustomCategories, updateCustomCategories } from "../../../lib/api";

export default function SettingsPage() {
  const [preferences, setPreferences] = useState({
    emailReminders: true,
    dailySummary: true,
  });
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prefs, categories] = await Promise.all([
          getPreferences(),
          getCustomCategories()
        ]);
        setPreferences(prefs);
        setCustomCategories(categories || []);
        // Sync with localStorage
        localStorage.setItem("taskflow_preferences", JSON.stringify(prefs));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed || customCategories.includes(trimmed)) return;

    const updated = [...customCategories, trimmed];
    setCustomCategories(updated);
    setNewCategory("");
    try {
      await updateCustomCategories(updated);
      setMessage({ type: "success", text: "Categoría añadida" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Error al añadir categoría" });
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    const updated = customCategories.filter(c => c !== cat);
    setCustomCategories(updated);
    try {
      await updateCustomCategories(updated);
      setMessage({ type: "success", text: "Categoría eliminada" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Error al eliminar categoría" });
    }
  };

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
        <h2 className="text-lg font-bold text-dark-900 dark:text-white px-1">Notificaciones</h2>
        {/* Email Reminders */}
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex items-center justify-between group transition-all hover:border-lime-400/20 shadow-sm dark:shadow-none">
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
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-6 flex items-center justify-between group transition-all hover:border-lime-400/20 shadow-sm dark:shadow-none">
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

      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-dark-900 dark:text-white px-1">Categorías Personalizadas</h2>
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nueva categoría (ej. Trabajo 2.0)"
              className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/10 text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-lime-400 text-dark-900 rounded-xl text-sm font-bold hover:bg-lime-400/90 transition-colors"
            >
              Añadir
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {customCategories.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No has añadido categorías personalizadas aún.</p>
            ) : (
              customCategories.map((cat) => (
                <div key={cat} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 group">
                  <span className="text-sm text-dark-900 dark:text-white">{cat}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
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
