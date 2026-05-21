const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  icono: {
    type: String,
    default: '🌟'
  },
  racha: {
    type: Number,
    default: 0
  },
  rachaMaxima: {
    type: Number,
    default: 0
  },
  completadoHoy: {
    type: Boolean,
    default: false
  },
  ultimaFecha: {
    type: Date,
    default: null
  },
  historial: [{
    type: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema);
