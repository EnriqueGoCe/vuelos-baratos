const Amadeus = require('amadeus');

let client = null;

function getClient() {
  if (!client) {
    client = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET
    });
  }
  return client;
}

const AIRLINE_NAMES = {
  IB: 'Iberia', VY: 'Vueling', FR: 'Ryanair', U2: 'easyJet',
  LH: 'Lufthansa', AF: 'Air France', BA: 'British Airways',
  KL: 'KLM', AZ: 'ITA Airways', SK: 'SAS', TP: 'TAP Portugal',
  UX: 'Air Europa', W6: 'Wizz Air', EW: 'Eurowings', LX: 'SWISS',
  OS: 'Austrian', SN: 'Brussels Airlines', EI: 'Aer Lingus',
  AY: 'Finnair', DY: 'Norwegian', TK: 'Turkish Airlines'
};

/**
 * Parsea la duracion ISO 8601 a formato legible
 */
function parseDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] || '0';
  const m = match[2] || '0';
  return `${h}h ${m}m`;
}

/**
 * Convierte una oferta de Amadeus al formato unificado
 */
function mapOffer(offer) {
  const itineraries = offer.itineraries || [];
  const outboundItinerary = itineraries[0];
  const inboundItinerary = itineraries[1];

  const mapSegments = (itinerary) => {
    if (!itinerary) return [];
    return (itinerary.segments || []).map(seg => ({
      airline: seg.carrierCode,
      airlineName: AIRLINE_NAMES[seg.carrierCode] || seg.carrierCode,
      flightNumber: `${seg.carrierCode}${seg.number}`,
      origin: seg.departure.iataCode,
      destination: seg.arrival.iataCode,
      departure: seg.departure.at,
      arrival: seg.arrival.at,
      duration: parseDuration(seg.duration),
      cabin: (offer.travelerPricings?.[0]?.fareDetailsBySegment?.find(
        f => f.segmentId === seg.id
      )?.cabin) || 'ECONOMY'
    }));
  };

  const outbound = mapSegments(outboundItinerary);

  return {
    id: `amadeus-${offer.id}`,
    provider: 'amadeus',
    price: parseFloat(offer.price.total),
    currency: offer.price.currency,
    outbound,
    inbound: mapSegments(inboundItinerary),
    stops: outbound.length - 1,
    totalDuration: parseDuration(outboundItinerary?.duration),
    deepLink: null,
    lastTicketingDate: offer.lastTicketingDate
  };
}

/**
 * Busca vuelos en Amadeus
 * @param {import('./types').SearchParams} params
 * @returns {Promise<import('./types').FlightOffer[]>}
 */
async function search(params) {
  const amadeus = getClient();

  const query = {
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departureDate,
    adults: params.adults || 1,
    currencyCode: params.currency || 'EUR',
    max: params.maxResults || 50
  };

  if (params.returnDate) {
    query.returnDate = params.returnDate;
  }

  const response = await amadeus.shopping.flightOffersSearch.get(query);
  const data = JSON.parse(response.body);

  return (data.data || []).map(mapOffer);
}

/**
 * Busca fechas flexibles (precios por dia)
 * @param {string} origin
 * @param {string} destination
 * @returns {Promise<Array<{date: string, price: number, currency: string}>>}
 */
async function searchFlexibleDates(origin, destination) {
  const amadeus = getClient();

  const response = await amadeus.shopping.flightDates.get({
    origin,
    destination
  });
  const data = JSON.parse(response.body);

  return (data.data || [])
    .filter(item => item.price?.total)
    .map(item => ({
      date: item.departureDate,
      price: parseFloat(item.price.total),
      currency: item.price.currency || 'EUR'
    }));
}

module.exports = { search, searchFlexibleDates };
