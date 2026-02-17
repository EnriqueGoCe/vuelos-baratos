const { Router } = require('express');
const { query } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { searchLimiter } = require('../middleware/rate-limit.middleware');
const flexibleController = require('../controllers/flexible.controller');

const router = Router();

router.get('/',
  searchLimiter,
  [
    query('origin').isLength({ min: 3, max: 3 }).withMessage('Codigo IATA de origen requerido'),
    query('destination').isLength({ min: 3, max: 3 }).withMessage('Codigo IATA de destino requerido')
  ],
  validate,
  flexibleController.getFlexibleDates
);

module.exports = router;
