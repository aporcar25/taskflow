const cron = require('node-cron');
const Habit = require('../models/Habit');

const initHabitJobs = () => {
  console.log("Inicializando CRON jobs de hábitos...");

  // Job: Todos los días a las 00:00 AM (medianoche)
  // Resetea completadoHoy y verifica rachas
  cron.schedule('0 0 * * *', async () => {
    console.log("Ejecutando job de mantenimiento de hábitos...");
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // 1. Resetear completadoHoy para todos
      await Habit.updateMany({}, { completadoHoy: false });

      // 2. Resetear racha para hábitos cuya ultimaFecha no es ayer (ni hoy, por si acaso)
      // Si la última vez que se completó fue antes de ayer, se rompió la racha.
      const habitsToReset = await Habit.find({
        ultimaFecha: { $lt: yesterday },
        racha: { $gt: 0 }
      });

      for (const habit of habitsToReset) {
        habit.racha = 0;
        await habit.save();
      }

      console.log(`Mantenimiento de hábitos completado. ${habitsToReset.length} rachas reseteadas.`);
    } catch (error) {
      console.error("Error en el job de mantenimiento de hábitos:", error);
    }
  });
};

module.exports = { initHabitJobs };
