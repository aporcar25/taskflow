const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/notes -> obtener todas las notas del usuario autenticado
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ usuario: req.user.id }).sort({ fijada: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las notas' });
  }
});

// POST /api/notes -> crear nueva nota
router.post('/', async (req, res) => {
  try {
    const { titulo, contenido, color, fijada } = req.body;

    if (!contenido) {
      return res.status(400).json({ mensaje: 'El contenido es obligatorio' });
    }

    const newNote = new Note({
      usuario: req.user.id,
      titulo: titulo || '',
      contenido,
      color: color || '#1a1a1a',
      fijada: fijada || false
    });

    const note = await newNote.save();
    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear la nota' });
  }
});

// PUT /api/notes/:id -> editar nota
router.put('/:id', async (req, res) => {
  try {
    const { titulo, contenido, color, fijada } = req.body;

    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ mensaje: 'Nota no encontrada' });
    }

    if (note.usuario.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    note.titulo = titulo !== undefined ? titulo : note.titulo;
    note.contenido = contenido !== undefined ? contenido : note.contenido;
    note.color = color !== undefined ? color : note.color;
    note.fijada = fijada !== undefined ? fijada : note.fijada;

    await note.save();
    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar la nota' });
  }
});

// DELETE /api/notes/:id -> eliminar nota
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ mensaje: 'Nota no encontrada' });
    }

    if (note.usuario.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    await note.deleteOne();
    res.json({ mensaje: 'Nota eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la nota' });
  }
});

// PATCH /api/notes/:id/pin -> alternar estado de fijada
router.patch('/:id/pin', async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ mensaje: 'Nota no encontrada' });
    }

    if (note.usuario.toString() !== req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    note.fijada = !note.fijada;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al alternar pin de la nota' });
  }
});

module.exports = router;
