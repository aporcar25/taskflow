const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://taskflow-p73h.onrender.com/api";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("taskflow_token");
  }
  return null;
};

const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const notifyUserUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event('taskflow-user-updated'));
  }
};

export const register = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre: name, email, password }),
  });
  if (!res.ok) throw new Error("Error en el registro");
  const data = await res.json();
  if (data.user) {
    localStorage.setItem('taskflow_user', JSON.stringify(data.user));
    notifyUserUpdate();
  }
  return data;
};

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Credenciales incorrectas");
  const data = await res.json();
  if (data.user) {
    localStorage.setItem('taskflow_user', JSON.stringify(data.user));
    notifyUserUpdate();
  }
  return data;
};

export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo usuario");
  return res.json();
};

export const getTasks = async () => {
  const res = await fetch(`${API_URL}/tasks`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo tareas");
  return res.json();
};

export const createTask = async (data: unknown) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creando tarea");
  return res.json();
};

export const updateTask = async (id: string, data: unknown) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando tarea");
  return res.json();
};

export const completeTask = async (id: string, completada: boolean) => {
  const res = await fetch(`${API_URL}/tasks/${id}/complete`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ completada }),
  });
  if (!res.ok) throw new Error("Error completando tarea");
  return res.json();
};

export const deleteTask = async (id: string) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error eliminando tarea");
  return res.json();
};

export const getHabits = async () => {
  const res = await fetch(`${API_URL}/habits`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo hábitos");
  return res.json();
};

export const createHabit = async (data: unknown) => {
  const res = await fetch(`${API_URL}/habits`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creando hábito");
  return res.json();
};

export const checkHabit = async (id: string) => {
  const res = await fetch(`${API_URL}/habits/${id}/check`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error marcando hábito");
  return res.json();
};

export const updateHabit = async (id: string, data: unknown) => {
  const res = await fetch(`${API_URL}/habits/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando hábito");
  return res.json();
};

export const deleteHabit = async (id: string) => {
  const res = await fetch(`${API_URL}/habits/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error eliminando hábito");
  return res.json();
};

export const getStats = async (): Promise<unknown> => {
  const res = await fetch(`${API_URL}/stats`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo estadísticas");
  return res.json();
};

export const updateProfile = async (data: { nombre?: string; email?: string }) => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando perfil");
  const result = await res.json();
  if (result.id) {
    localStorage.setItem('taskflow_user', JSON.stringify(result));
    notifyUserUpdate();
  }
  return result;
};

export const shareTask = async (taskId: string, email: string, permiso: string) => {
  const res = await fetch(`${API_URL}/sharing/${taskId}/share`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, permiso }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.mensaje || "Error al compartir tarea");
  }
  return res.json();
};

export const unshareTask = async (taskId: string, userId: string) => {
  const res = await fetch(`${API_URL}/sharing/${taskId}/share/${userId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error al dejar de compartir tarea");
  return res.json();
};

export const getSharedTasks = async () => {
  const res = await fetch(`${API_URL}/sharing/shared`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo tareas compartidas");
  return res.json();
};

export const getNotes = async () => {
  const res = await fetch(`${API_URL}/notes`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo notas");
  return res.json();
};

export const createNote = async (data: unknown) => {
  const res = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creando nota");
  return res.json();
};

export const updateNote = async (id: string, data: unknown) => {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando nota");
  return res.json();
};

export const deleteNote = async (id: string) => {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error eliminando nota");
  return res.json();
};

export const pinNote = async (id: string) => {
  const res = await fetch(`${API_URL}/notes/${id}/pin`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error al fijar nota");
  return res.json();
};

export const getGoals = async (semana?: string) => {
  const url = semana ? `${API_URL}/goals?semana=${semana}` : `${API_URL}/goals`;
  const res = await fetch(url, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo objetivos");
  return res.json();
};

export const createGoal = async (data: unknown) => {
  const res = await fetch(`${API_URL}/goals`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creando objetivo");
  return res.json();
};

export const updateGoal = async (id: string, data: unknown) => {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando objetivo");
  return res.json();
};

export const deleteGoal = async (id: string) => {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error eliminando objetivo");
  return res.json();
};

export const updateGoalProgress = async (id: string, valor: string | number) => {
  const res = await fetch(`${API_URL}/goals/${id}/progress`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ valor }),
  });
  if (!res.ok) throw new Error("Error actualizando progreso");
  return res.json();
};

export const completeTutorial = async (page: string) => {
  const res = await fetch(`${API_URL}/auth/tutorial-complete`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ page }),
  });
  if (!res.ok) throw new Error("Error actualizando tutorial");
  const result = await res.json();
  if (result.id) {
    localStorage.setItem('taskflow_user', JSON.stringify(result));
    notifyUserUpdate();
  }
  return result;
};

export const getCustomCategories = async () => {
  const res = await fetch(`${API_URL}/auth/custom-categories`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo categorías");
  return res.json();
};

export const updateCustomCategories = async (categories: string[]) => {
  const res = await fetch(`${API_URL}/auth/custom-categories`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ categories }),
  });
  if (!res.ok) throw new Error("Error actualizando categorías");
  return res.json();
};

export const updatePreferences = async (data: { emailReminders?: boolean; dailySummary?: boolean }) => {
  const res = await fetch(`${API_URL}/auth/preferences`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando preferencias");
  return res.json();
};

export const getPreferences = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error obteniendo preferencias");
  const user = await res.json();
  return user.preferences || { emailReminders: true, dailySummary: true };
};

export const changePassword = async (data: { currentPassword?: string; newPassword?: string }) => {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.mensaje || "Error al cambiar la contraseña");
  }
  return res.json();
};

export const completeOnboarding = async () => {
  const res = await fetch(`${API_URL}/auth/onboarding-complete`, {
    method: "PUT",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error actualizando onboarding");
  const result = await res.json();
  if (result.id) {
    localStorage.setItem('taskflow_user', JSON.stringify(result));
    notifyUserUpdate();
  }
  return result;
};

export const updateProfilePhoto = async (foto: string) => {
  const res = await fetch(`${API_URL}/auth/profile/photo`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ foto }),
  });
  if (!res.ok) throw new Error("Error actualizando foto");
  const result = await res.json();
  if (result.id) {
    localStorage.setItem('taskflow_user', JSON.stringify(result));
    notifyUserUpdate();
  }
  return result;
};
