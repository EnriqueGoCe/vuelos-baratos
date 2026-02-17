const amadeusProvider = require('./amadeus.provider');
const kiwiProvider = require('./kiwi.provider');
const rateLimiter = require('./rate-limiter');

const providers = [
  { name: 'amadeus', module: amadeusProvider },
  { name: 'kiwi', module: kiwiProvider }
];

/**
 * Busca en todos los providers disponibles y combina resultados
 * @param {import('./types').SearchParams} params
 * @returns {Promise<{results: import('./types').FlightOffer[], providers: string[], errors: string[]}>}
 */
async function searchAll(params) {
  const results = [];
  const usedProviders = [];
  const errors = [];

  const searches = providers.map(async ({ name, module }) => {
    try {
      const hasQuota = await rateLimiter.canMakeRequest(name);
      if (!hasQuota) {
        errors.push(`${name}: cuota mensual agotada`);
        return;
      }

      const offers = await module.search(params);
      await rateLimiter.trackRequest(name);

      usedProviders.push(name);
      return offers;
    } catch (err) {
      console.error(`Error en provider ${name}:`, err.message);
      errors.push(`${name}: ${err.message}`);
      return [];
    }
  });

  const allResults = await Promise.allSettled(searches);

  for (const result of allResults) {
    if (result.status === 'fulfilled' && result.value) {
      results.push(...result.value);
    }
  }

  // Deduplicar por ruta + hora similar + precio similar
  const deduplicated = deduplicateResults(results);

  // Ordenar por precio
  deduplicated.sort((a, b) => a.price - b.price);

  return { results: deduplicated, providers: usedProviders, errors };
}

/**
 * Deduplica resultados que tengan la misma ruta y horarios similares
 */
function deduplicateResults(results) {
  const seen = new Map();

  for (const offer of results) {
    const key = generateDeduplicationKey(offer);

    if (!seen.has(key)) {
      seen.set(key, offer);
    } else {
      // Mantener el de menor precio
      const existing = seen.get(key);
      if (offer.price < existing.price) {
        seen.set(key, offer);
      }
    }
  }

  return Array.from(seen.values());
}

/**
 * Genera clave para deduplicacion basada en ruta y horario
 */
function generateDeduplicationKey(offer) {
  const outFirst = offer.outbound[0];
  const outLast = offer.outbound[offer.outbound.length - 1];
  if (!outFirst || !outLast) return offer.id;

  // Redondear hora de salida a intervalos de 30 min para agrupar similares
  const depTime = new Date(outFirst.departure);
  depTime.setMinutes(Math.round(depTime.getMinutes() / 30) * 30, 0, 0);

  return `${outFirst.origin}-${outLast.destination}-${depTime.toISOString()}-${offer.stops}`;
}

module.exports = { searchAll };
