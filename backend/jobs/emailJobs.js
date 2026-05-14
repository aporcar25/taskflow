const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { enviarRecordatorioTarea, enviarResumenDiario } = require('../services/emailService');

const initJobs = () => {
  console.log("Inicializando CRON jobs de emails...");

  // Job 1: Cada hora en el minuto 0
  // Busca tareas que vencen en menos de 24 horas y no están completadas, y no se ha enviado recordatorio
  cron.schedule('0 * * * *', async () => {
    console.log("Ejecutando job de recordatorios de tareas...");
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const tasksToRemind = await Task.find({
        completada: false,
        fechaLimite: { $exists: true, $ne: null, $gt: now, $lt: in24Hours },
        recordatorioEnviado: false
      }).populate('userId');

      for (const task of tasksToRemind) {
        if (task.userId && task.userId.email) {
          await enviarRecordatorioTarea(task.userId, task);
          
          // Marcar como enviado
          task.recordatorioEnviado = true;
          await task.save();
        }
      }
    } catch (error) {
      console.error("Error en el job de recordatorios:", error);
    }
  });

  // Job 2: Todos los días a las 08:00 AM
  // Envía un resumen diario con las tareas que vencen hoy a cada usuario
  cron.schedule('0 8 * * *', async () => {
    console.log("Ejecutando job de resumen diario...");
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Buscar todos los usuarios
      const users = await User.find({});

      for (const user of users) {
        // Tareas del usuario que vencen hoy y no están completadas
        const tasksToday = await Task.find({
          userId: user._id,
          completada: false,
          fechaLimite: { $gte: today, $lt: tomorrow }
        });

        if (tasksToday.length > 0) {
          await enviarResumenDiario(user, tasksToday);
        }
      }
    } catch (error) {
      console.error("Error en el job de resumen diario:", error);
    }
  });
};

module.exports = { initJobs };
