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

    if (habit.userId.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    const now = new Date();
    
    if (habit.completadoHoy) {
      // Desmarcar
      habit.completadoHoy = false;
      habit.racha = Math.max(0, habit.racha - 1);
      
      // Remover hoy del historial
      const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      habit.historial = habit.historial.filter(date => {
        const dStr = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        return dStr !== todayStr;
      });
    } else {
      // Marcar
      habit.completadoHoy = true;
      habit.racha += 1;
      habit.historial.push(now);
    }

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

module.exports = router;
