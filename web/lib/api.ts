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

export const createTask = async (data: any) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creando tarea");
  return res.json();
};

export const updateTask = async (id: string, data: any) => {
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

export const createHabit = async (data: any) => {
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

export const updateHabit = async (id: string, data: any) => {
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

export const getStats = async (): Promise<any> => {
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
  }
  return result;
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
  }
  return result;
};
