const { PriceHistory } = require('../models');

/**
 * Registra precios de una busqueda en el historial
 * @param {import('../providers/types').SearchParams} params
 * @param {import('../providers/types').FlightOffer[]} results
 */
async function recordPrices(params, results) {
  if (!results.length) return;

  const prices = results.map(r => r.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;

  await PriceHistory.create({
    origin: params.origin,
    destination: params.destination,
    departure_date: params.departureDate,
    lowest_price: lowest,
    average_price: Math.round(average * 100) / 100,
    highest_price: highest,
    currency: params.currency || 'EUR',
    sample_size: results.length,
    recorded_at: new Date()
  });
}

/**
 * Obtiene historial de precios para una ruta
 */
async function getHistory(origin, destination, departureDate, days = 30) {
  const { Op } = require('sequelize');
  const since = new Date();
  since.setDate(since.getDate() - days);

  const history = await PriceHistory.findAll({
    where: {
      origin,
      destination,
      departure_date: departureDate,
      recorded_at: { [Op.gte]: since }
    },
    order: [['recorded_at', 'ASC']]
  });

  return history.map(h => ({
    date: h.recorded_at,
    lowestPrice: parseFloat(h.lowest_price),
    averagePrice: h.average_price ? parseFloat(h.average_price) : null,
    highestPrice: h.highest_price ? parseFloat(h.highest_price) : null,
    sampleSize: h.sample_size,
    currency: h.currency
  }));
}

/**
 * Obtiene el precio mas bajo actual para una ruta
 */
async function getLowestPrice(origin, destination, departureDate) {
  const latest = await PriceHistory.findOne({
    where: { origin, destination, departure_date: departureDate },
    order: [['recorded_at', 'DESC']]
  });

  if (!latest) return null;
  return {
    price: parseFloat(latest.lowest_price),
    currency: latest.currency,
    recordedAt: latest.recorded_at
  };
}

module.exports = { recordPrices, getHistory, getLowestPrice };
