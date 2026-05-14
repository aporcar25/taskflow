"use client";

import { useState, useEffect, useRef } from "react";
import { getMe, updateProfile, updateProfilePhoto } from "../../../lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState({ nombre: "", email: "", foto: "" });
  const [form, setForm] = useState({ nombre: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser({ nombre: userData.nombre || "", email: userData.email || "", foto: userData.foto || "" });
        setForm({ nombre: userData.nombre || "", email: userData.email || "" });
      } catch (err) {
        console.error("Error loading profile", err);
        setError("No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updatedUser = await updateProfile({ nombre: form.nombre, email: form.email });
      setUser((prev) => ({ ...prev, nombre: updatedUser.nombre, email: updatedUser.email }));
      setSuccess("Perfil actualizado con éxito.");
      
      // Update local storage so Sidebar updates if needed (Sidebar reads from localstorage, though a page reload might be needed to reflect changes)
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      setError("Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError("La imagen es demasiado grande. Máximo 2MB.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const updatedUser = await updateProfilePhoto(base64String);
        setUser((prev) => ({ ...prev, foto: updatedUser.foto }));
        setSuccess("Foto actualizada con éxito.");
        
        // Dispatch storage event
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        setError("Error al actualizar la foto.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin w-8 h-8 text-lime-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-gray-400 text-sm mt-1">Gestiona tu información personal y foto de perfil</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-400 text-sm">
          {success}
        </div>
      )}

      <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-700 border-2 border-white/10 flex items-center justify-center">
              {user.foto ? (
                <img src={user.foto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl uppercase font-bold text-gray-500">
                  {user.nombre.charAt(0)}
                </span>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{user.nombre}</h3>
            <p className="text-gray-400">{user.email}</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-3 text-sm text-lime-400 hover:text-lime-300 font-medium transition-colors"
            >
              {uploading ? 'Subiendo...' : 'Cambiar foto de perfil'}
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all hover:shadow-lg hover:shadow-lime-400/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
