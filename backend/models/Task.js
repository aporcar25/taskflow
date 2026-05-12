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
  completada: {
    type: Boolean,
    default: false
  },
  fechaLimite: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
