const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET / -> obtener todas las tareas del usuario autenticado
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener tareas' });
  }
});

// POST / -> crear nueva tarea
router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion, prioridad, categoria, fechaLimite, estado, tags, recurrencia } = req.body;

    if (!titulo) {
      return res.status(400).json({ mensaje: 'El título es obligatorio' });
    }

    const newTask = new Task({
      userId: req.user.id,
      titulo,
      descripcion,
      prioridad,
      categoria,
      fechaLimite,
      estado: estado || 'pendiente',
      completada: estado === 'completada',
      tags: tags || [],
      recurrencia: recurrencia || 'ninguna'
    });

    const task = await newTask.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear la tarea' });
  }
});

// PUT /:id -> editar tarea
router.put('/:id', async (req, res) => {
  try {
    const { titulo, descripcion, prioridad, categoria, fechaLimite, completada, estado, archivada, tags, recurrencia } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    task.titulo = titulo !== undefined ? titulo : task.titulo;
    task.descripcion = descripcion !== undefined ? descripcion : task.descripcion;
    task.prioridad = prioridad !== undefined ? prioridad : task.prioridad;
    task.categoria = categoria !== undefined ? categoria : task.categoria;
    task.fechaLimite = fechaLimite !== undefined ? fechaLimite : task.fechaLimite;

    if (estado !== undefined) {
      task.estado = estado;
      task.completada = (estado === 'completada');
    } else if (completada !== undefined) {
      task.completada = completada;
      task.estado = completada ? 'completada' : (task.estado === 'completada' ? 'pendiente' : task.estado);
    }

    task.archivada = archivada !== undefined ? archivada : task.archivada;
    task.tags = tags !== undefined ? tags : task.tags;
    task.recurrencia = recurrencia !== undefined ? recurrencia : task.recurrencia;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar la tarea' });
  }
});

// DELETE /:id -> eliminar tarea
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    await task.deleteOne();
    res.json({ mensaje: 'Tarea eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la tarea' });
  }
});

// PATCH /:id/complete -> marcar tarea como completada/descompletada
router.patch('/:id/complete', async (req, res) => {
  try {
    const { completada } = req.body;
    
    if (completada === undefined) {
      return res.status(400).json({ mensaje: 'El campo completada es obligatorio' });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    task.completada = completada;
    task.estado = completada ? 'completada' : (task.estado === 'completada' ? 'pendiente' : task.estado);
    await task.save();

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el estado de la tarea' });
  }
});

module.exports = router;
