const { Airport } = require('../models');
const { Op } = require('sequelize');

async function searchAirports(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const term = `%${q}%`;

    const airports = await Airport.findAll({
      where: {
        [Op.or]: [
          { iata_code: { [Op.like]: q.toUpperCase() } },
          { name: { [Op.like]: term } },
          { city: { [Op.like]: term } }
        ]
      },
      limit: 10,
      order: [['city', 'ASC']]
    });

    res.json(airports.map(a => ({
      code: a.iata_code,
      name: a.name,
      city: a.city,
      country: a.country,
      label: `${a.city} (${a.iata_code}) - ${a.name}`
    })));
  } catch (err) {
    console.error('Error buscando aeropuertos:', err);
    res.status(500).json({ error: 'Error al buscar aeropuertos' });
  }
}

module.exports = { searchAirports };
