const priceTracker = require('../services/price-tracker.service');

async function getHistory(req, res) {
  try {
    const { origin, destination, departureDate, days } = req.query;

    const history = await priceTracker.getHistory(
      origin.toUpperCase(),
      destination.toUpperCase(),
      departureDate,
      parseInt(days, 10) || 30
    );

    res.json(history);
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    res.status(500).json({ error: 'Error al obtener historial de precios' });
  }
}

module.exports = { getHistory };
