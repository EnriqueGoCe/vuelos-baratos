const amadeusProvider = require('../providers/amadeus.provider');
const rateLimiter = require('../providers/rate-limiter');

async function getFlexibleDates(req, res) {
  try {
    const { origin, destination } = req.query;

    const hasQuota = await rateLimiter.canMakeRequest('amadeus');
    if (!hasQuota) {
      return res.status(429).json({ error: 'Cuota de API agotada, intenta mas tarde' });
    }

    const dates = await amadeusProvider.searchFlexibleDates(
      origin.toUpperCase(),
      destination.toUpperCase()
    );

    await rateLimiter.trackRequest('amadeus');

    res.json({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      dates
    });
  } catch (err) {
    console.error('Error en fechas flexibles:', err);
    res.status(500).json({ error: 'Error al buscar fechas flexibles' });
  }
}

module.exports = { getFlexibleDates };
