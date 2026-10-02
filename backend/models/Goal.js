const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  usuario: {
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
    trim: true,
    default: ''
  },
  progreso: {
    type: Number,
    default: 0
  },
  meta: {
    type: Number,
    default: 100
  },
  unidad: {
    type: String,
    default: '',
    trim: true
  },
  color: {
    type: String,
    default: '#a3e635'
  },
  semana: {
    type: Date,
    required: true
  },
  completado: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);
