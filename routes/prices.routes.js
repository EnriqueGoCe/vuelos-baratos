const { Router } = require('express');
const { query } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const pricesController = require('../controllers/prices.controller');

const router = Router();

router.get('/history',
  [
    query('origin').isLength({ min: 3, max: 3 }).withMessage('Codigo IATA de origen requerido'),
    query('destination').isLength({ min: 3, max: 3 }).withMessage('Codigo IATA de destino requerido'),
    query('departureDate').isDate().withMessage('Fecha de ida invalida'),
    query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Dias entre 1 y 90')
  ],
  validate,
  pricesController.getHistory
);

module.exports = router;
