const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  foto: {
    type: String,
    default: ''
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  tutorialDashboard: {
    type: Boolean,
    default: false
  },
  tutorialTasks: {
    type: Boolean,
    default: false
  },
  tutorialHabits: {
    type: Boolean,
    default: false
  },
  tutorialStats: {
    type: Boolean,
    default: false
  },
  categoriasPersonalizadas: {
    type: [String],
    default: []
  },
  preferences: {
    emailReminders: {
      type: Boolean,
      default: true
    },
    dailySummary: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
