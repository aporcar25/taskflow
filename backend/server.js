require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const habitRoutes = require('./routes/habits');
const authMiddleware = require('./middleware/auth');
const Task = require('./models/Task');
const Habit = require('./models/Habit');
const { initJobs } = require('./jobs/emailJobs');
const { enviarRecordatorioTarea, enviarResumenDiario } = require('./services/emailService');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);

// Stats Endpoint
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Inicio del día de hoy
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Inicio de la semana (asumiendo Lunes como inicio)
    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay() || 7;
    startOfWeek.setDate(startOfWeek.getDate() - day + 1);

    const tasks = await Task.find({ userId });

    let tareasCompletadasHoy = 0;
    let tareasCompletadasEstaSemana = 0;
    let totalTareas = tasks.length;
    let completedTasks = 0;

    tasks.forEach(task => {
      if (task.completada) {
        completedTasks++;
        const updated = new Date(task.updatedAt);
        if (updated >= startOfToday) {
          tareasCompletadasHoy++;
        }
        if (updated >= startOfWeek) {
          tareasCompletadasEstaSemana++;
        }
      }
    });

    const porcentajeProductividad = totalTareas > 0 ? Math.round((completedTasks / totalTareas) * 100) : 0;

    // Racha máxima de hábitos
    const habits = await Habit.find({ userId });
    let rachaMaximaHabitos = 0;
    habits.forEach(habit => {
      if (habit.racha > rachaMaximaHabitos) {
        rachaMaximaHabitos = habit.racha;
      }
    });

    // Actividad semanal (Lun-Dom)
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const actividadSemanal = diasSemana.map((dia, i) => {
      const diaInicio = new Date(startOfWeek);
      diaInicio.setDate(diaInicio.getDate() + i);
      const diaFin = new Date(diaInicio);
      diaFin.setDate(diaFin.getDate() + 1);

      const completadasEseDia = tasks.filter(task => {
        if (!task.completada) return false;
        const updated = new Date(task.updatedAt);
        return updated >= diaInicio && updated < diaFin;
      }).length;

      return { day: dia, tasks: completadasEseDia };
    });

    res.json({
      tareasCompletadasHoy,
      tareasCompletadasEstaSemana,
      totalTareas,
      porcentajeProductividad,
      rachaMaximaHabitos,
      actividadSemanal
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
  }
});

// Endpoint temporal para probar envío de emails
app.get('/api/test-email', authMiddleware, async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const tasks = await Task.find({ userId: user._id });

    if (tasks.length > 0) {
      // Prueba 1: Recordatorio (usando la primera tarea)
      await enviarRecordatorioTarea(user, tasks[0]);
    }
    
    // Prueba 2: Resumen diario (usando todas las tareas del usuario)
    await enviarResumenDiario(user, tasks);

    res.json({ mensaje: 'Emails de prueba enviados con éxito. Revisa tu bandeja de entrada.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error enviando emails de prueba' });
  }
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    initJobs(); // Initialize cron jobs after DB is connected
  })
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
