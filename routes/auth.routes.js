const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authRequired } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rate-limit.middleware');
const authController = require('../controllers/auth.controller');

const router = Router();

router.post('/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email invalido'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre entre 2 y 100 caracteres'),
    body('password').isLength({ min: 6 }).withMessage('Password minimo 6 caracteres')
  ],
  validate,
  authController.register
);

router.post('/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email invalido'),
    body('password').notEmpty().withMessage('Password requerido')
  ],
  validate,
  authController.login
);

router.get('/profile', authRequired, authController.getProfile);

module.exports = router;
