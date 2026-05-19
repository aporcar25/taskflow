const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  prioridad: {
    type: String,
    enum: ['alta', 'media', 'baja'],
    default: 'media'
  },
  categoria: {
    type: String,
    default: 'general'
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en_progreso', 'completada'],
    default: 'pendiente'
  },
  completada: {
    type: Boolean,
    default: false
  },
  archivada: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  recurrencia: {
    type: String,
    enum: ['ninguna', 'diaria', 'semanal', 'mensual'],
    default: 'ninguna'
  },
  fechaLimite: {
    type: Date
  },
  recordatorioEnviado: {
    type: Boolean,
    default: false
  },
  imagenes: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
