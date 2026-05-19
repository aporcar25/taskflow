const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// POST /api/tasks/:id/share -> Compartir tarea con un usuario por email
router.post('/:id/share', async (req, res) => {
  try {
    const { email, permiso } = req.body;
    const taskId = req.params.id;

    if (!email || !permiso) {
      return res.status(400).json({ mensaje: 'Email y permiso son obligatorios' });
    }

    // Buscar la tarea y verificar que el usuario sea el dueño
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado para compartir esta tarea' });
    }

    // Buscar al usuario con quien se quiere compartir
    const userToShare = await User.findOne({ email: email.toLowerCase() });
    if (!userToShare) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (userToShare._id.toString() === req.user.id) {
      return res.status(400).json({ mensaje: 'No puedes compartir una tarea contigo mismo' });
    }

    // Verificar si ya está compartida con este usuario
    const alreadyShared = task.compartidaCon.find(c => c.usuario.toString() === userToShare._id.toString());
    if (alreadyShared) {
      alreadyShared.permiso = permiso;
    } else {
      task.compartidaCon.push({ usuario: userToShare._id, permiso });
    }

    task.esCompartida = true;
    await task.save();

    res.json({ mensaje: 'Tarea compartida correctamente', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al compartir la tarea' });
  }
});

// DELETE /api/tasks/:id/share/:userId -> Dejar de compartir tarea con un usuario
router.delete('/:id/share/:userId', async (req, res) => {
  try {
    const taskId = req.params.id;
    const userIdToRemove = req.params.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    // Solo el dueño puede quitar a alguien
    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    task.compartidaCon = task.compartidaCon.filter(c => c.usuario.toString() !== userIdToRemove);

    if (task.compartidaCon.length === 0) {
      task.esCompartida = false;
    }

    await task.save();
    res.json({ mensaje: 'Usuario eliminado de la tarea compartida', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario compartido' });
  }
});

// GET /api/tasks/shared -> Obtener todas las tareas compartidas CON el usuario actual
router.get('/shared', async (req, res) => {
  try {
    const tasks = await Task.find({
      'compartidaCon.usuario': req.user.id
    }).populate('userId', 'nombre email foto').sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener tareas compartidas' });
  }
});

module.exports = router;
