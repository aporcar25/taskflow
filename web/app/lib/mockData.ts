// ============================================================
// Mock Data — TaskFlow
// All data is hardcoded for now. Backend will be connected later.
// ============================================================

export type Priority = "alta" | "media" | "baja";
export type Category = "trabajo" | "personal" | "salud" | "estudio" | "hogar";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category | string;
  dueDate: string;
  completed: boolean;
  estado: "pendiente" | "en_progreso" | "completada";
  archivada: boolean;
  tags: string[];
  recurrencia: "ninguna" | "diaria" | "semanal" | "mensual";
  imagenes: string[];
  esCompartida: boolean;
  compartidaCon: { usuario: string | { _id: string, nombre: string, email: string }; permiso: string }[];
  userId: string | { _id: string, nombre: string, email: string };
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  streak: number;
  completedToday: boolean;
  completedDays: boolean[];  // last 7 days
}

export interface WeeklyActivity {
  day: string;
  tasks: number;
}

// ----- Tasks -----
export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Diseñar wireframes del proyecto",
    description: "Crear los wireframes de baja fidelidad para la app móvil usando Figma",
    priority: "alta",
    category: "trabajo",
    dueDate: "2026-05-13",
    completed: false,
    createdAt: "2026-05-10",
  },
  {
    id: "2",
    title: "Revisar pull requests pendientes",
    description: "Revisar y aprobar los PR del equipo en el repositorio principal",
    priority: "alta",
    category: "trabajo",
    dueDate: "2026-05-11",
    completed: true,
    createdAt: "2026-05-09",
  },
  {
    id: "3",
    title: "Hacer ejercicio 30 minutos",
    description: "Rutina de cardio y ejercicios de fuerza en casa",
    priority: "media",
    category: "salud",
    dueDate: "2026-05-11",
    completed: true,
    createdAt: "2026-05-11",
  },
  {
    id: "4",
    title: "Estudiar para el examen de React",
    description: "Repasar hooks avanzados: useReducer, useContext y custom hooks",
    priority: "alta",
    category: "estudio",
    dueDate: "2026-05-15",
    completed: false,
    createdAt: "2026-05-08",
  },
  {
    id: "5",
    title: "Comprar ingredientes para la cena",
    description: "Ir al supermercado y comprar verduras, pollo y arroz",
    priority: "baja",
    category: "hogar",
    dueDate: "2026-05-11",
    completed: false,
    createdAt: "2026-05-11",
  },
  {
    id: "6",
    title: "Leer capítulo del libro",
    description: "Continuar leyendo 'Atomic Habits' de James Clear — capítulo 8",
    priority: "baja",
    category: "personal",
    dueDate: "2026-05-12",
    completed: true,
    createdAt: "2026-05-10",
  },
  {
    id: "7",
    title: "Preparar presentación del lunes",
    description: "Crear las diapositivas para la reunión semanal del equipo",
    priority: "alta",
    category: "trabajo",
    dueDate: "2026-05-12",
    completed: false,
    createdAt: "2026-05-09",
  },
  {
    id: "8",
    title: "Actualizar el CV",
    description: "Añadir los últimos proyectos y actualizar las habilidades técnicas",
    priority: "media",
    category: "personal",
    dueDate: "2026-05-14",
    completed: false,
    createdAt: "2026-05-07",
  },
  {
    id: "9",
    title: "Configurar entorno de testing",
    description: "Instalar Jest y React Testing Library, configurar scripts de test",
    priority: "media",
    category: "trabajo",
    dueDate: "2026-05-16",
    completed: false,
    createdAt: "2026-05-10",
  },
  {
    id: "10",
    title: "Meditar 10 minutos",
    description: "Sesión de meditación guiada por la mañana para empezar el día con calma",
    priority: "media",
    category: "salud",
    dueDate: "2026-05-11",
    completed: true,
    createdAt: "2026-05-11",
  },
];

// ----- Habits -----
export const mockHabits: Habit[] = [
  {
    id: "1",
    name: "Meditar",
    icon: "🧘",
    streak: 12,
    completedToday: true,
    completedDays: [true, true, true, true, false, true, true],
  },
  {
    id: "2",
    name: "Ejercicio",
    icon: "💪",
    streak: 8,
    completedToday: false,
    completedDays: [true, true, false, true, true, true, true],
  },
  {
    id: "3",
    name: "Leer 30 min",
    icon: "📚",
    streak: 5,
    completedToday: true,
    completedDays: [false, true, true, true, true, true, true],
  },
  {
    id: "4",
    name: "Beber 2L agua",
    icon: "💧",
    streak: 21,
    completedToday: true,
    completedDays: [true, true, true, true, true, true, true],
  },
  {
    id: "5",
    name: "Dormir 8 horas",
    icon: "😴",
    streak: 3,
    completedToday: false,
    completedDays: [false, false, true, false, true, true, true],
  },
  {
    id: "6",
    name: "Sin redes sociales",
    icon: "📵",
    streak: 0,
    completedToday: false,
    completedDays: [false, true, false, false, true, false, false],
  },
];

// ----- Weekly Activity -----
export const weeklyActivity: WeeklyActivity[] = [
  { day: "Lun", tasks: 5 },
  { day: "Mar", tasks: 8 },
  { day: "Mié", tasks: 3 },
  { day: "Jue", tasks: 7 },
  { day: "Vie", tasks: 6 },
  { day: "Sáb", tasks: 2 },
  { day: "Dom", tasks: 4 },
];

// ----- Dashboard Stats -----
export const dashboardStats = {
  completedToday: 4,
  totalToday: 6,
  completedThisWeek: 23,
  totalThisWeek: 35,
  productivity: 78,
  streakDays: 12,
};
