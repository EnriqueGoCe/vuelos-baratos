const NodeCache = require('node-cache');
const { SearchCache } = require('../models');
const aggregator = require('../providers/aggregator');
const priceTracker = require('./price-tracker.service');

const memoryCache = new NodeCache({
  stdTTL: (parseInt(process.env.CACHE_TTL_MINUTES, 10) || 30) * 60,
  checkperiod: 120
});

/**
 * Genera clave de cache unica para una busqueda
 */
function buildCacheKey(params) {
  return `${params.origin}:${params.destination}:${params.departureDate}:${params.returnDate || ''}:${params.adults || 1}`;
}

/**
 * Busca vuelos con sistema de cache en dos niveles (memoria + BD)
 */
async function searchFlights(params) {
  const cacheKey = buildCacheKey(params);

  // Nivel 1: Cache en memoria
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached) {
    return { ...memoryCached, cached: true, cacheSource: 'memory' };
  }

  // Nivel 2: Cache en BD
  try {
    const dbCached = await SearchCache.findOne({
      where: { cache_key: cacheKey }
    });

    if (dbCached && new Date(dbCached.expires_at) > new Date()) {
      const data = dbCached.results;
      memoryCache.set(cacheKey, data);
      return { ...data, cached: true, cacheSource: 'database' };
    }
  } catch (err) {
    console.error('Error leyendo cache de BD:', err.message);
  }

  // Sin cache: buscar en providers
  const searchResult = await aggregator.searchAll(params);

  const responseData = {
    results: searchResult.results,
    providers: searchResult.providers,
    errors: searchResult.errors,
    totalResults: searchResult.results.length,
    searchParams: params
  };

  // Guardar en cache memoria
  memoryCache.set(cacheKey, responseData);

  // Guardar en cache BD (async, no bloquea la respuesta)
  const ttlMinutes = parseInt(process.env.CACHE_TTL_MINUTES, 10) || 30;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  SearchCache.upsert({
    cache_key: cacheKey,
    results: responseData,
    expires_at: expiresAt
  }).catch(err => console.error('Error guardando cache en BD:', err.message));

  // Registrar precios en historial (async)
  if (searchResult.results.length > 0) {
    priceTracker.recordPrices(params, searchResult.results)
      .catch(err => console.error('Error registrando precios:', err.message));
  }

  return { ...responseData, cached: false };
}

module.exports = { searchFlights };
