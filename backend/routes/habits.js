const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET / -> obtener todos los hábitos del usuario
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let updatedHabits = false;

    // Reseteamos completadoHoy si el hábito fue actualizado antes de hoy
    for (let habit of habits) {
      const lastUpdated = new Date(habit.updatedAt);
      if (habit.completadoHoy && lastUpdated < today) {
        habit.completadoHoy = false;
        await habit.save();
        updatedHabits = true;
      }
    }

    if (updatedHabits) {
      const updated = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
      return res.json(updated);
    }

    res.json(habits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener hábitos' });
  }
});

// POST / -> crear nuevo hábito
router.post('/', async (req, res) => {
  try {
    const { nombre, icono } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    }

    const newHabit = new Habit({
      userId: req.user.id,
      nombre,
      icono: icono || '🌟'
    });

    const habit = await newHabit.save();
    res.status(201).json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el hábito' });
  }
});

// PATCH /:id/check -> marcar hábito como completado hoy, actualizar racha
router.patch('/:id/check', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ mensaje: 'Hábito no encontrado' });
    }

    if (habit.userId.toString() !== req.usuario.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (habit.completadoHoy) {
      // Desmarcar
      habit.completadoHoy = false;
      habit.racha = Math.max(0, habit.racha - 1);

      // Ajustar ultimaFecha a ayer para permitir re-marcar hoy si se desea,
      // o dejar que el cron lo resetee si no se marca.
      habit.ultimaFecha = yesterday;

      // Remover hoy del historial
      const todayTime = today.getTime();
      habit.historial = habit.historial.filter(date => {
        const d = new Date(date);
        const dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        return dTime !== todayTime;
      });
    } else {
      // Marcar
      const lastCompleted = habit.ultimaFecha ? new Date(habit.ultimaFecha) : null;
      const lastCompletedTime = lastCompleted ? new Date(lastCompleted.getFullYear(), lastCompleted.getMonth(), lastCompleted.getDate()).getTime() : null;

      if (lastCompletedTime === yesterday.getTime()) {
        habit.racha += 1;
      } else if (lastCompletedTime === today.getTime()) {
        // Ya estaba marcado hoy (teóricamente no debería pasar por completadoHoy check)
      } else {
        habit.racha = 1;
      }

      if (habit.racha > (habit.rachaMaxima || 0)) {
        habit.rachaMaxima = habit.racha;
      }

      habit.completadoHoy = true;
      habit.ultimaFecha = today;
      habit.historial.push(now);
    }

    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el hábito' });
  }
});

// PUT /:id -> editar hábito
router.put('/:id', async (req, res) => {
  try {
    const { nombre, icono } = req.body;

    let habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ mensaje: 'Hábito no encontrado' });
    }

    if (habit.userId.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    if (nombre) habit.nombre = nombre;
    if (icono) habit.icono = icono;

    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el hábito' });
  }
});

// DELETE /:id -> eliminar hábito
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ mensaje: 'Hábito no encontrado' });
    }

    if (habit.userId.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    await habit.deleteOne();
    res.json({ mensaje: 'Hábito eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar el hábito' });
  }
});

// GET /fix-streaks -> migración para actualizar rachaMaxima en hábitos existentes
router.get('/fix-streaks', async (req, res) => {
  try {
    const result = await Habit.updateMany(
      { $or: [{ rachaMaxima: { $exists: false } }, { rachaMaxima: 0 }] },
      [{ $set: { rachaMaxima: "$racha" } }]
    );
    res.json({ mensaje: 'Migración completada', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en la migración' });
  }
});

module.exports = router;
