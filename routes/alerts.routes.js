const { Router } = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authRequired } = require('../middleware/auth.middleware');
const alertsController = require('../controllers/alerts.controller');

const router = Router();

// Todas las rutas de alertas requieren autenticacion
router.use(authRequired);

router.get('/', alertsController.getAlerts);

router.post('/',
  [
    body('origin').isLength({ min: 3, max: 3 }).withMessage('Codigo IATA de origen requerido'),
    body('destination').isLength({ min: 3, max: 3 }).withMessage('Codigo IATA de destino requerido'),
    body('departureDate').isDate().withMessage('Fecha de ida invalida'),
    body('targetPrice').isFloat({ min: 1 }).withMessage('Precio objetivo requerido')
  ],
  validate,
  alertsController.createAlert
);

router.put('/:id',
  [param('id').isInt().withMessage('ID invalido')],
  validate,
  alertsController.updateAlert
);

router.delete('/:id',
  [param('id').isInt().withMessage('ID invalido')],
  validate,
  alertsController.deleteAlert
);

module.exports = router;
