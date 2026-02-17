const { Router } = require('express');
const { apiLimiter } = require('../middleware/rate-limit.middleware');
const airportsController = require('../controllers/airports.controller');

const router = Router();

router.get('/search', apiLimiter, airportsController.searchAirports);

module.exports = router;
