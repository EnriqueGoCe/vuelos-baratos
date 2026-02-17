const rateLimit = require('express-rate-limit');

// Rate limit general para la API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Demasiadas peticiones, intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit estricto para busquedas (consume API externa)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: { error: 'Demasiadas busquedas, espera un momento' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para auth (proteccion contra brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos, intenta de nuevo mas tarde' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter, searchLimiter, authLimiter };
