const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

/**
 * Middleware que verifica el token JWT
 * Agrega req.user con { id, email }
 */
function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacion requerido' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

/**
 * Middleware opcional: si hay token lo decodifica, si no, sigue sin user
 */
function authOptional(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, jwtSecret);
      req.user = { id: decoded.id, email: decoded.email };
    } catch {
      // Token invalido, ignorar
    }
  }
  next();
}

module.exports = { authRequired, authOptional };
