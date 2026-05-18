const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /register -> registrar usuario, hashear password con bcrypt, devolver JWT
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, foto } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Por favor, incluye nombre, email y password' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ mensaje: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      nombre,
      email,
      password: hashedPassword,
      foto
    });

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, foto: user.foto, onboardingCompleted: user.onboardingCompleted } });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// POST /login -> validar credenciales, devolver JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Por favor, incluye email y password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, foto: user.foto, onboardingCompleted: user.onboardingCompleted } });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// GET /me -> devolver datos del usuario autenticado (requiere JWT)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// PUT /profile -> actualizar nombre y email del usuario
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { nombre, email } = req.body;
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (nombre) user.nombre = nombre;
    if (email) user.email = email;

    await user.save();
    res.json({ id: user.id, nombre: user.nombre, email: user.email, foto: user.foto, onboardingCompleted: user.onboardingCompleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar perfil' });
  }
});

// POST /profile/photo -> actualizar foto de perfil
router.post('/profile/photo', authMiddleware, async (req, res) => {
  try {
    const { foto } = req.body;
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    user.foto = foto;
    await user.save();
    res.json({ id: user.id, nombre: user.nombre, email: user.email, foto: user.foto, onboardingCompleted: user.onboardingCompleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar foto de perfil' });
  }
});

// PUT /change-password -> cambiar contraseña
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ mensaje: 'Por favor, incluye la contraseña actual y la nueva' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ mensaje: 'Contraseña actualizada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al cambiar la contraseña' });
  }
});

// PUT /preferences -> actualizar preferencias del usuario
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { emailReminders, dailySummary } = req.body;
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (user.preferences === undefined) {
      user.preferences = {};
    }

    if (typeof emailReminders === 'boolean') user.preferences.emailReminders = emailReminders;
    if (typeof dailySummary === 'boolean') user.preferences.dailySummary = dailySummary;

    await user.save();
    res.json(user.preferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar preferencias' });
  }
});

// GET /custom-categories -> obtener categorías personalizadas
router.get('/custom-categories', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('categoriasPersonalizadas');
    res.json(user.categoriasPersonalizadas || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener categorías' });
  }
});

// PUT /onboarding-complete -> marcar onboarding como completado
router.put('/onboarding-complete', authMiddleware, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    user.onboardingCompleted = true;
    await user.save();

    res.json({ id: user.id, nombre: user.nombre, email: user.email, foto: user.foto, onboardingCompleted: user.onboardingCompleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar onboarding' });
  }
});

// PUT /custom-categories -> actualizar categorías personalizadas
router.put('/custom-categories', authMiddleware, async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ mensaje: 'categories debe ser un array' });
    }

    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    user.categoriasPersonalizadas = categories;
    await user.save();
    res.json(user.categoriasPersonalizadas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar categorías' });
  }
});

module.exports = router;
