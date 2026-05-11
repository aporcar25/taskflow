"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Priority, Category } from "@/app/lib/mockData";

export default function NewTaskPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", priority: "" as Priority | "",
    category: "" as Category | "", dueDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "El título es obligatorio";
    if (!form.description.trim()) e.description = "La descripción es obligatoria";
    if (!form.priority) e.priority = "Selecciona una prioridad";
    if (!form.category) e.category = "Selecciona una categoría";
    if (!form.dueDate) e.dueDate = "La fecha límite es obligatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => router.push("/tasks"), 600);
  };

  const ic = (f: string) =>
    `w-full px-4 py-3 rounded-xl bg-dark-700 border text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all ${errors[f] ? "border-red-500/50" : "border-white/10"}`;

  const selStyle = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em', paddingRight: '2.5rem' };

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/tasks" className="w-10 h-10 rounded-xl bg-dark-800 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Nueva tarea</h1>
          <p className="text-gray-400 text-sm mt-1">Rellena los campos para crear una tarea</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1.5">Título</label>
            <input id="title" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="¿Qué necesitas hacer?" className={ic("title")} />
            {errors.title && <p className="text-red-400 text-xs mt-1.5">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="desc" className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
            <textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe los detalles..." rows={4} className={`${ic("description")} resize-none`} />
            {errors.description && <p className="text-red-400 text-xs mt-1.5">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1.5">Prioridad</label>
              <select id="priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className={`${ic("priority")} cursor-pointer appearance-none`} style={selStyle}>
                <option value="">Seleccionar</option>
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Media</option>
                <option value="baja">🔵 Baja</option>
              </select>
              {errors.priority && <p className="text-red-400 text-xs mt-1.5">{errors.priority}</p>}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1.5">Categoría</label>
              <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className={`${ic("category")} cursor-pointer appearance-none`} style={selStyle}>
                <option value="">Seleccionar</option>
                <option value="trabajo">💼 Trabajo</option>
                <option value="personal">👤 Personal</option>
                <option value="salud">❤️ Salud</option>
                <option value="estudio">📖 Estudio</option>
                <option value="hogar">🏠 Hogar</option>
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1.5">{errors.category}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1.5">Fecha límite</label>
            <input id="dueDate" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={`${ic("dueDate")} cursor-pointer`} style={{ colorScheme: "dark" }} />
            {errors.dueDate && <p className="text-red-400 text-xs mt-1.5">{errors.dueDate}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Link href="/tasks" className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-all">Cancelar</Link>
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all hover:shadow-lg hover:shadow-lime-400/20 disabled:opacity-50 flex items-center gap-2">
            {loading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Guardando...</>
            ) : (<>Crear tarea</>)}
          </button>
        </div>
      </form>
    </div>
  );
}
