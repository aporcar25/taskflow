const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/goals -> obtener objetivos de una semana específica
router.get('/', async (req, res) => {
  try {
    const { semana } = req.query;
    let query = { usuario: req.user.id };

    if (semana) {
      const startOfWeek = new Date(semana);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      query.semana = { $gte: startOfWeek, $lt: endOfWeek };
    }

    const goals = await Goal.find(query).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener objetivos' });
  }
});

// POST /api/goals -> crear nuevo objetivo
router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion, meta, unidad, color, semana } = req.body;

    if (!titulo || !semana) {
      return res.status(400).json({ mensaje: 'Título y semana son obligatorios' });
    }

    const newGoal = new Goal({
      usuario: req.user.id,
      titulo,
      descripcion,
      meta: meta || 100,
      unidad: unidad || '',
      color: color || '#a3e635',
      semana: new Date(semana)
    });

    const goal = await newGoal.save();
    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el objetivo' });
  }
});

// PUT /api/goals/:id -> editar objetivo
router.put('/:id', async (req, res) => {
  try {
    const { titulo, descripcion, meta, unidad, color, progreso, completado } = req.body;

    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ mensaje: 'Objetivo no encontrado' });
    }

    if (goal.usuario.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    goal.titulo = titulo !== undefined ? titulo : goal.titulo;
    goal.descripcion = descripcion !== undefined ? descripcion : goal.descripcion;
    goal.meta = meta !== undefined ? meta : goal.meta;
    goal.unidad = unidad !== undefined ? unidad : goal.unidad;
    goal.color = color !== undefined ? color : goal.color;

    if (progreso !== undefined) {
      goal.progreso = progreso;
      goal.completado = goal.progreso >= goal.meta;
    }

    if (completado !== undefined) {
      goal.completado = completado;
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el objetivo' });
  }
});

// DELETE /api/goals/:id -> eliminar objetivo
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ mensaje: 'Objetivo no encontrado' });
    }

    if (goal.usuario.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    await goal.deleteOne();
    res.json({ mensaje: 'Objetivo eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar el objetivo' });
  }
});

// PATCH /api/goals/:id/progress -> actualizar progreso
router.patch('/:id/progress', async (req, res) => {
  try {
    const { valor } = req.body; // Puede ser absoluto o relativo (+10)

    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ mensaje: 'Objetivo no encontrado' });
    }

    if (goal.usuario.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    if (typeof valor === 'string' && (valor.startsWith('+') || valor.startsWith('-'))) {
      goal.progreso += parseInt(valor);
    } else {
      goal.progreso = parseInt(valor);
    }

    if (goal.progreso < 0) goal.progreso = 0;
    goal.completado = goal.progreso >= goal.meta;

    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el progreso' });
  }
});

module.exports = router;
