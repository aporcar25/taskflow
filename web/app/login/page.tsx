"use client";

import Link from "next/link";
import { useState } from "react";
import { login } from "../../lib/api";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Introduce un email válido";
    }
    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (form.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      localStorage.setItem("taskflow_token", data.token);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setErrors({ email: err.message || "Error al iniciar sesión" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-lime-400/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
            <svg className="w-5 h-5 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-dark-900 dark:text-white">
            Task<span className="text-lime-400">Flow</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 rounded-2xl p-8 shadow-sm dark:shadow-none">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2 text-dark-900 dark:text-white">Bienvenido de vuelta</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Inicia sesión para continuar con tu productividad</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-700 border text-dark-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all ${
                  errors.email ? "border-red-500/50" : "border-gray-200 dark:border-white/10"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-700 border text-dark-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all ${
                  errors.password ? "border-red-500/50" : "border-gray-200 dark:border-white/10"
                }`}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all hover:shadow-lg hover:shadow-lime-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-lime-400 hover:text-lime-300 font-medium transition-colors">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
