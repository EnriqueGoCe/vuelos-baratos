const axios = require('axios');

const KIWI_BASE_URL = 'https://api.tequila.kiwi.com/v2';

function getHeaders() {
  return { apikey: process.env.KIWI_API_KEY };
}

const CABIN_MAP = { M: 'ECONOMY', W: 'PREMIUM_ECONOMY', C: 'BUSINESS', F: 'FIRST' };

/**
 * Convierte duracion en segundos a formato legible
 */
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

/**
 * Convierte resultado de Kiwi al formato unificado
 */
function mapResult(flight) {
  const routes = flight.route || [];
  const outboundRoutes = routes.filter(r => r.return === 0);
  const inboundRoutes = routes.filter(r => r.return === 1);

  const mapRoutes = (segments) => segments.map(seg => ({
    airline: seg.airline,
    airlineName: seg.airline,
    flightNumber: `${seg.airline}${seg.flight_no}`,
    origin: seg.flyFrom,
    destination: seg.flyTo,
    departure: new Date(seg.dTime * 1000).toISOString(),
    arrival: new Date(seg.aTime * 1000).toISOString(),
    duration: formatDuration(seg.aTime - seg.dTime),
    cabin: CABIN_MAP[seg.fare_category] || 'ECONOMY'
  }));

  return {
    id: `kiwi-${flight.id}`,
    provider: 'kiwi',
    price: flight.price,
    currency: flight.currency || 'EUR',
    outbound: mapRoutes(outboundRoutes),
    inbound: mapRoutes(inboundRoutes),
    stops: Math.max(0, outboundRoutes.length - 1),
    totalDuration: formatDuration(flight.duration?.departure || 0),
    deepLink: flight.deep_link || null,
    lastTicketingDate: null
  };
}

/**
 * Busca vuelos en Kiwi Tequila
 * @param {import('./types').SearchParams} params
 * @returns {Promise<import('./types').FlightOffer[]>}
 */
async function search(params) {
  const query = {
    fly_from: params.origin,
    fly_to: params.destination,
    date_from: formatDate(params.departureDate),
    date_to: formatDate(params.departureDate),
    adults: params.adults || 1,
    curr: params.currency || 'EUR',
    limit: params.maxResults || 50,
    sort: 'price',
    one_for_city: 0
  };

  if (params.returnDate) {
    query.return_from = formatDate(params.returnDate);
    query.return_to = formatDate(params.returnDate);
    query.flight_type = 'round';
  } else {
    query.flight_type = 'oneway';
  }

  const response = await axios.get(`${KIWI_BASE_URL}/search`, {
    headers: getHeaders(),
    params: query
  });

  return (response.data.data || []).map(mapResult);
}

/**
 * Convierte YYYY-MM-DD a DD/MM/YYYY (formato Kiwi)
 */
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

module.exports = { search };
