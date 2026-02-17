const searchService = require('../services/search.service');

async function search(req, res) {
  try {
    const { origin, destination, departureDate, returnDate, adults, currency } = req.query;

    const params = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      returnDate: returnDate || null,
      adults: parseInt(adults, 10) || 1,
      currency: currency || 'EUR'
    };

    const result = await searchService.searchFlights(params);

    res.json(result);
  } catch (err) {
    console.error('Error en busqueda:', err);
    res.status(500).json({ error: 'Error al buscar vuelos' });
  }
}

module.exports = { search };
