const { Router } = require('express');
const { query } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { searchLimiter } = require('../middleware/rate-limit.middleware');
const searchController = require('../controllers/search.controller');

const router = Router();

router.get('/',
  searchLimiter,
  [
    query('origin').isLength({ min: 3, max: 3 }).withMessage('Codigo IATA de origen requerido (3 letras)'),
    query('destination').isLength({ min: 3, max: 3 }).withMessage('Codigo IATA de destino requerido (3 letras)'),
    query('departureDate').isDate().withMessage('Fecha de ida invalida (YYYY-MM-DD)'),
    query('returnDate').optional().isDate().withMessage('Fecha de vuelta invalida (YYYY-MM-DD)'),
    query('adults').optional().isInt({ min: 1, max: 9 }).withMessage('Adultos entre 1 y 9')
  ],
  validate,
  searchController.search
);

module.exports = router;
