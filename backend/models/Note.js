const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  titulo: {
    type: String,
    trim: true,
    default: ''
  },
  contenido: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#1a1a1a'
  },
  fijada: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
