const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ mensaje: 'No hay token, autorización denegada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user || decoded;
    req.user.id = req.user.id || req.user._id;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token no válido' });
  }
};
