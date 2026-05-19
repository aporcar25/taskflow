"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "../../components/ToastProvider";
import { getNotes, createNote, updateNote, deleteNote, pinNote } from "../../../lib/api";

interface Note {
  _id: string;
  titulo: string;
  contenido: string;
  color: string;
  fijada: boolean;
  updatedAt: string;
}

const PRESET_COLORS = [
  "#1a1a1a", // Default dark
  "#1a2a1a", // Dark green
  "#1a1a2a", // Dark blue
  "#2a1a1a", // Dark red
  "#1a2a2a", // Dark cyan
  "#2a2a1a", // Dark yellow/olive
];

export default function NotesPage() {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateEditor, setShowCreateEditor] = useState(false);
  const [createForm, setCreateForm] = useState({ titulo: "", contenido: "", color: "#1a1a1a" });

  // Edit state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ titulo: "", contenido: "", color: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      showToast("Error al cargar las notas", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.contenido.trim()) {
      showToast("La nota no puede estar vacía", "error");
      return;
    }
    setIsCreating(true);
    try {
      const newNote = await createNote(createForm);
      setNotes([newNote, ...notes]);
      setCreateForm({ titulo: "", contenido: "", color: "#1a1a1a" });
      setShowCreateEditor(false);
      showToast("Nota creada", "success");
    } catch (error) {
      console.error("Error creating note:", error);
      showToast("Error al crear la nota", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.contenido.trim()) {
      showToast("El contenido no puede estar vacío", "error");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateNote(id, editForm);
      setNotes(notes.map(n => n._id === id ? updated : n));
      setEditingNoteId(null);
      showToast("Nota actualizada", "success");
    } catch (error) {
      console.error("Error updating note:", error);
      showToast("Error al actualizar la nota", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;
    try {
      await deleteNote(noteToDelete);
      setNotes(notes.filter(n => n._id !== noteToDelete));
      setNoteToDelete(null);
      showToast("Nota eliminada", "success");
    } catch (error) {
      console.error("Error deleting note:", error);
      showToast("Error al eliminar la nota", "error");
    }
  };

  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await pinNote(id);
      setNotes(prev => {
        const newNotes = prev.map(n => n._id === id ? updated : n);
        return [...newNotes].sort((a, b) => (b.fijada ? 1 : 0) - (a.fijada ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    } catch (error) {
      console.error("Error pinning note:", error);
      showToast("Error al fijar la nota", "error");
    }
  };

  const openEdit = (note: Note) => {
    setEditingNoteId(note._id);
    setEditForm({ titulo: note.titulo, contenido: note.contenido, color: note.color });
    setShowCreateEditor(false);
  };

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.fijada && !b.fijada) return -1;
      if (!a.fijada && b.fijada) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes]);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-8">
        <div className="h-10 w-48 shimmer rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 shimmer rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark-900 dark:text-white">Notas</h1>
        {!showCreateEditor && (
          <button
            onClick={() => { setShowCreateEditor(true); setEditingNoteId(null); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-dark-900 font-semibold text-sm hover:bg-lime-400/90 transition-all hover:shadow-lg hover:shadow-lime-400/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva nota
          </button>
        )}
      </div>

      {/* Inline Create Editor */}
      {showCreateEditor && (
        <div className="mb-8 p-4 bg-white dark:bg-dark-800 border border-lime-400/30 rounded-2xl shadow-xl animate-slide-down max-w-2xl mx-auto" style={{ backgroundColor: createForm.color }}>
          <input
            type="text"
            placeholder="Título"
            value={createForm.titulo}
            onChange={e => setCreateForm({ ...createForm, titulo: e.target.value })}
            className="w-full bg-transparent border-none text-dark-900 dark:text-white font-bold placeholder-gray-500 focus:ring-0 mb-2 px-0"
          />
          <textarea
            placeholder="Escribe una nota..."
            autoFocus
            value={createForm.contenido}
            onChange={e => setCreateForm({ ...createForm, contenido: e.target.value })}
            className="w-full bg-transparent border-none text-dark-900 dark:text-white placeholder-gray-500 focus:ring-0 resize-none min-h-[100px] px-0"
          />
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-dark-900/10 dark:border-white/10">
            <div className="flex gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setCreateForm({ ...createForm, color: c })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${createForm.color === c ? "border-lime-400" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateEditor(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-dark-900/5 dark:hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="px-6 py-2 rounded-xl text-sm font-bold bg-lime-400 text-dark-900 hover:bg-lime-400/90 transition-all disabled:opacity-50"
              >
                {isCreating ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 flex items-center justify-center mb-6 shadow-sm">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-dark-900 dark:text-white">No tienes notas</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mt-2">Crea una para empezar a organizar tus ideas.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {sortedNotes.map(note => (
            <div
              key={note._id}
              onClick={() => editingNoteId !== note._id && openEdit(note)}
              className={`break-inside-avoid relative group rounded-2xl border transition-all duration-300 ${editingNoteId === note._id ? "ring-2 ring-lime-400 shadow-2xl scale-[1.02] z-10" : "hover:shadow-lg hover:border-gray-300 dark:hover:border-white/20 cursor-pointer"}`}
              style={{ backgroundColor: editingNoteId === note._id ? editForm.color : note.color, borderColor: editingNoteId === note._id ? "transparent" : "rgba(255,255,255,0.05)" }}
            >
              {/* Pin Icon */}
              <button
                onClick={(e) => handleTogglePin(note._id, e)}
                className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all z-20 ${note.fijada ? "text-lime-400 bg-lime-400/10" : "text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-white/10"}`}
              >
                <svg className="w-4 h-4" fill={note.fijada ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              <div className="p-5">
                {editingNoteId === note._id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.titulo}
                      onChange={e => setEditForm({ ...editForm, titulo: e.target.value })}
                      className="w-full bg-transparent border-none text-dark-900 dark:text-white font-bold placeholder-gray-500 focus:ring-0 p-0"
                    />
                    <textarea
                      autoFocus
                      value={editForm.contenido}
                      onChange={e => setEditForm({ ...editForm, contenido: e.target.value })}
                      className="w-full bg-transparent border-none text-dark-900 dark:text-white placeholder-gray-500 focus:ring-0 resize-none min-h-[120px] p-0"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-dark-900/10 dark:border-white/10">
                      <div className="flex gap-1.5">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setEditForm({ ...editForm, color: c })}
                            className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${editForm.color === c ? "border-lime-400" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingNoteId(null); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-dark-900/5 dark:hover:bg-white/5 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdate(note._id); }}
                          disabled={isSaving}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-lime-400 text-dark-900 hover:bg-lime-400/90 transition-all"
                        >
                          {isSaving ? "..." : "Hecho"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2 pr-8">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: note.color === '#1a1a1a' ? '#a3e635' : '#fff' }}></div>
                      {note.titulo && <h3 className="text-sm font-bold text-dark-900 dark:text-white truncate">{note.titulo}</h3>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-[12]">
                      {note.contenido}
                    </p>
                    <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-gray-500">{new Date(note.updatedAt).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setNoteToDelete(note._id); }}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setNoteToDelete(null)}>
          <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">¿Eliminar nota?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Esta acción es permanente y no se puede deshacer.</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setNoteToDelete(null)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-gray-100 dark:border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
