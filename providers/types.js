/**
 * @typedef {Object} FlightSegment
 * @property {string} airline - Codigo IATA de la aerolinea (ej: 'IB')
 * @property {string} airlineName - Nombre de la aerolinea
 * @property {string} flightNumber - Numero de vuelo (ej: 'IB3214')
 * @property {string} origin - Codigo IATA origen
 * @property {string} destination - Codigo IATA destino
 * @property {string} departure - ISO datetime de salida
 * @property {string} arrival - ISO datetime de llegada
 * @property {string} duration - Duracion en formato ISO (ej: 'PT2H30M')
 * @property {string} cabin - Clase de cabina
 */

/**
 * @typedef {Object} FlightOffer
 * @property {string} id - ID unico de la oferta
 * @property {string} provider - Nombre del provider ('amadeus', 'kiwi')
 * @property {number} price - Precio total
 * @property {string} currency - Codigo de moneda (ej: 'EUR')
 * @property {FlightSegment[]} outbound - Segmentos de ida
 * @property {FlightSegment[]} inbound - Segmentos de vuelta (si aplica)
 * @property {number} stops - Numero de escalas (ida)
 * @property {string} totalDuration - Duracion total
 * @property {string} deepLink - URL para comprar
 * @property {string} lastTicketingDate - Fecha limite para comprar
 */

/**
 * @typedef {Object} SearchParams
 * @property {string} origin - Codigo IATA de origen
 * @property {string} destination - Codigo IATA de destino
 * @property {string} departureDate - Fecha de ida YYYY-MM-DD
 * @property {string} [returnDate] - Fecha de vuelta YYYY-MM-DD
 * @property {number} [adults=1] - Numero de adultos
 * @property {string} [currency='EUR'] - Moneda preferida
 * @property {number} [maxResults=50] - Maximo de resultados
 */

module.exports = {};
