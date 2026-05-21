# TaskFlow 🚀
 
> **Aplicación de productividad personal** con gestión de tareas, hábitos, notas y objetivos. Desarrollada como proyecto de Formación Dual.
 
---
 
## 📋 Índice
 
- [Descripción](#-descripción)
- [Demo](#-demo)
- [Stack tecnológico](#-stack-tecnológico)
- [Funcionalidades](#-funcionalidades)
- [Arquitectura](#-arquitectura)
- [Instalación y uso local](#-instalación-y-uso-local)
- [Despliegue](#-despliegue)
- [App móvil](#-app-móvil)
- [API Reference](#-api-reference)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Autor](#-autor)
---
 
## 📖 Descripción
 
TaskFlow es una aplicación de productividad completa que permite a los usuarios gestionar su día a día de forma eficiente. Cuenta con sistema de tareas con kanban, seguimiento de hábitos con racha de días, bloc de notas, objetivos semanales y estadísticas detalladas.
 
El proyecto está compuesto por tres partes:
- **Frontend web** — Next.js con diseño oscuro y responsive
- **Backend** — API REST con Node.js/Express y MongoDB
- **App móvil** — React Native/Expo para Android e iOS
---
 
## 🌐 Demo
 
| Plataforma | URL |
|---|---|
| 🌍 Web | [an-taskflow.netlify.app](https://an-taskflow.netlify.app) |
| ⚙️ API | [taskflow-p73h.onrender.com](https://taskflow-p73h.onrender.com) |
| 📱 Android | APK disponible en releases |
 
---
 
## 🛠 Stack tecnológico
 
### Frontend Web
- **Next.js 14** — Framework React con App Router
- **Tailwind CSS** — Estilos con diseño dark mode
- **Recharts** — Gráficas de estadísticas
- **Axios** — Peticiones HTTP
### Backend
- **Node.js + Express** — Servidor API REST
- **MongoDB + Mongoose** — Base de datos NoSQL
- **JWT** — Autenticación con tokens
- **Resend** — Envío de emails transaccionales
- **node-cron** — Trabajos programados
### App Móvil
- **React Native + Expo SDK 54** — Aplicación multiplataforma
- **expo-router v6** — Navegación
- **EAS Build** — Compilación de APK en la nube
### Infraestructura
- **Netlify** — Hosting del frontend
- **Render** — Hosting del backend
- **MongoDB Atlas** — Base de datos en la nube
---
 
## ✨ Funcionalidades
 
### 🔐 Autenticación
- Registro e inicio de sesión con email y contraseña
- Tokens JWT con persistencia en localStorage
- Cambio de contraseña
- Onboarding para nuevos usuarios
- Tutorial interactivo por página
### ✅ Tareas
- Crear, editar, eliminar y completar tareas
- Vista lista y vista kanban (Pendiente / En progreso / Completada)
- Prioridades: alta 🔴, media 🟡, baja 🔵
- Categorías con emojis: personal 👤, trabajo 💼, salud ❤️, hogar 🏠, estudios 📚...
- Fecha límite con color según urgencia (rojo, naranja, amarillo, verde)
- Etiquetas personalizadas
- Tareas recurrentes (diaria, semanal, mensual)
- Archivar tareas
- Adjuntar imágenes (hasta 3, en base64)
- Galería de imágenes con navegación
- **Compartir tareas** con otros usuarios por email con permisos (ver/editar)
- Pestaña "Compartidas conmigo" para ver tareas de otros
- Búsqueda y filtros por prioridad y categoría
- Animación al completar tarea
### 🔥 Hábitos
- Crear, editar y eliminar hábitos con icono emoji
- Marcar como completado cada día
- Racha de días consecutivos con fuego animado 🔥
- Pérdida de racha si se salta un día
- Calendario semanal (L M X J V S D)
- Racha máxima histórica
### 📝 Notas
- Bloc de notas estilo masonry
- Colores personalizables por nota (6 colores)
- Fijar notas importantes (aparecen primero con 📌)
- Crear, editar y eliminar notas
### 🎯 Objetivos Semanales
- Crear metas con valor numérico y unidad (km, páginas, horas...)
- Barra de progreso animada con color personalizable
- Navegación entre semanas
- Resumen circular de objetivos completados
- Actualizar progreso incrementalmente
### 📊 Estadísticas
- Gráfica de tareas completadas por día de la semana
- Porcentaje de productividad
- Distribución por categorías y prioridades
- Calendario mensual de hábitos completados
- Racha actual vs mejor racha
- Ranking de rachas por hábito
- Día más productivo de la semana
### 👤 Perfil
- Editar nombre, email y foto de perfil
- Cambiar contraseña
- Preferencias de notificaciones por email
### ⚙️ Ajustes
- Modo claro / oscuro
- Preferencias de notificaciones email
### 📧 Notificaciones Email
- Recordatorio de tareas próximas a vencer (cada hora)
- Resumen diario de productividad (8:00 AM)
### 🍅 Extras
- Pomodoro timer en el sidebar
- Búsqueda global
- Botón flotante de resumen rápido
- Toast notifications
- Loading skeletons con efecto shimmer
- Página 404 personalizada
- Diseño responsive (móvil, tablet, escritorio)
---
 
## 🏗 Arquitectura
 
```
taskflow/
├── web/                    # Frontend Next.js
│   ├── app/
│   │   ├── (auth)/         # Login, Register
│   │   └── (dashboard)/    # Páginas protegidas
│   │       ├── dashboard/
│   │       ├── tasks/
│   │       ├── habits/
│   │       ├── notas/
│   │       ├── objetivos/
│   │       ├── stats/
│   │       ├── profile/
│   │       └── settings/
│   └── lib/
│       └── api.ts          # Capa de comunicación con el backend
│
├── backend/                # API Node.js/Express
│   ├── models/             # Esquemas Mongoose
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Habit.js
│   │   ├── Note.js
│   │   └── Goal.js
│   ├── routes/             # Endpoints REST
│   ├── middleware/         # Autenticación JWT
│   ├── services/           # Email (Resend)
│   ├── jobs/               # Tareas programadas (cron)
│   └── server.js
│
└── mobile/                 # App React Native/Expo
    ├── app/
    │   ├── (main)/         # Tabs principales
    │   │   ├── index.js    # Dashboard
    │   │   ├── tasks.js
    │   │   ├── habits.js
    │   │   ├── notes.js
    │   │   └── profile.js
    │   ├── stats.js
    │   ├── goals.js
    │   ├── login.js
    │   └── register.js
    └── src/
        ├── context/        # AuthContext
        └── services/       # API service
```
 
---
 
## 🚀 Instalación y uso local
 
### Requisitos previos
- Node.js 18+
- MongoDB (local o Atlas)
- Cuenta en [Resend](https://resend.com) para emails
### 1. Clonar el repositorio
 
```bash
git clone https://github.com/aporcar25/taskflow.git
cd taskflow
```
 
### 2. Configurar el Backend
 
```bash
cd backend
npm install
```
 
Crear el archivo `.env`:
 
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_secreto_jwt
RESEND_API_KEY=re_xxxxxxxxxx
PORT=5000
```
 
Iniciar el servidor:
 
```bash
npm run dev
```
 
### 3. Configurar el Frontend Web
 
```bash
cd web
npm install
```
 
Crear `.env.local`:
 
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
 
Iniciar el frontend:
 
```bash
npm run dev
```
 
Abre [http://localhost:3000](http://localhost:3000)
 
### 4. App Móvil (desarrollo)
 
```bash
cd mobile
npm install --legacy-peer-deps
npx expo start --clear
```
 
Escanea el QR con la cámara del iPhone o instala la APK en Android.
 
---
 
## 🌍 Despliegue
 
### Frontend → Netlify
- Conectado al repositorio GitHub (rama `main`)
- Build command: `npm run build`
- Publish directory: `.next`
- Variables de entorno configuradas en Netlify
### Backend → Render
- Web Service conectado al repositorio GitHub
- Start command: `node server.js`
- Variables de entorno configuradas en Render
### Base de datos → MongoDB Atlas
- Cluster M0 (gratuito)
- IP de Render en lista blanca
---
 
## 📱 App Móvil
 
### Pantallas disponibles
| Pantalla | Descripción |
|---|---|
| Dashboard | Estadísticas, tareas recientes y hábitos de hoy |
| Tareas | Lista con filtros, crear/completar/eliminar |
| Hábitos | Seguimiento diario con racha |
| Notas | Bloc de notas con colores |
| Perfil | Editar datos y cambiar contraseña |
| Estadísticas | Gráficas de productividad |
| Objetivos | Metas semanales con progreso |
 
### Generar APK
 
```bash
cd mobile
eas build --platform android --profile preview
```
 
---
 
## 📡 API Reference
 
### Autenticación
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/profile` | Obtener perfil |
| PUT | `/api/auth/profile` | Actualizar perfil |
| POST | `/api/auth/change-password` | Cambiar contraseña |
 
### Tareas
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/tasks` | Obtener todas las tareas |
| POST | `/api/tasks` | Crear tarea |
| PUT | `/api/tasks/:id` | Editar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| PATCH | `/api/tasks/:id/complete` | Completar/descompletar |
| GET | `/api/tasks/shared` | Tareas compartidas conmigo |
| POST | `/api/tasks/:id/share` | Compartir tarea |
| DELETE | `/api/tasks/:id/share/:userId` | Dejar de compartir |
 
### Hábitos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/habits` | Obtener hábitos |
| POST | `/api/habits` | Crear hábito |
| PUT | `/api/habits/:id` | Editar hábito |
| DELETE | `/api/habits/:id` | Eliminar hábito |
| PATCH | `/api/habits/:id/check` | Marcar completado |
 
### Notas
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/notes` | Obtener notas |
| POST | `/api/notes` | Crear nota |
| PUT | `/api/notes/:id` | Editar nota |
| DELETE | `/api/notes/:id` | Eliminar nota |
| PATCH | `/api/notes/:id/pin` | Fijar/desfijar nota |
 
### Objetivos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/goals` | Obtener objetivos de la semana |
| POST | `/api/goals` | Crear objetivo |
| PUT | `/api/goals/:id` | Editar objetivo |
| DELETE | `/api/goals/:id` | Eliminar objetivo |
| PATCH | `/api/goals/:id/progress` | Actualizar progreso |
 
### Estadísticas
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/stats` | Obtener estadísticas completas |
 
---
 
## 🔀 GitFlow
 
El proyecto sigue la metodología GitFlow:
 
```
main          ← producción
  └── develop ← integración
        └── feature/nombre-feature ← desarrollo
```
 
Cada nueva funcionalidad se desarrolla en una rama `feature/`, se integra en `develop` y finalmente se despliega a `main`.
 
---
 
## 👤 Autor
 
**Antonio** — Alumno de Formación Dual  
📧 aporcar2505@g.educaand.es  
🐙 [github.com/aporcar25](https://github.com/aporcar25)
 
---
 
> Proyecto desarrollado como parte del ciclo de Formación Dual en Desarrollo de Aplicaciones Web.
