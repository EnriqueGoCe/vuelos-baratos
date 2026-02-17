const { ApiUsage } = require('../models');

// Limites mensuales por provider
const LIMITS = {
  amadeus: parseInt(process.env.AMADEUS_MONTHLY_LIMIT, 10) || 2000,
  kiwi: parseInt(process.env.KIWI_MONTHLY_LIMIT, 10) || 3000
};

/**
 * Obtiene el mes actual en formato YYYY-MM
 */
function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Verifica si un provider tiene cuota disponible
 */
async function canMakeRequest(provider) {
  if (!LIMITS[provider]) {
    console.warn(`Provider desconocido: ${provider}`);
    return false;
  }
  const month = getCurrentMonth();
  const limit = LIMITS[provider];

  const [usage] = await ApiUsage.findOrCreate({
    where: { provider, month },
    defaults: { call_count: 0 }
  });

  return usage.call_count < limit;
}

/**
 * Registra una llamada a la API
 */
async function trackRequest(provider) {
  const month = getCurrentMonth();

  const [usage] = await ApiUsage.findOrCreate({
    where: { provider, month },
    defaults: { call_count: 0 }
  });

  await usage.increment('call_count');
}

/**
 * Obtiene el uso actual de todos los providers
 */
async function getUsageStats() {
  const month = getCurrentMonth();
  const stats = await ApiUsage.findAll({ where: { month } });

  return Object.keys(LIMITS).map(provider => {
    const usage = stats.find(s => s.provider === provider);
    return {
      provider,
      used: usage ? usage.call_count : 0,
      limit: LIMITS[provider],
      remaining: LIMITS[provider] - (usage ? usage.call_count : 0)
    };
  });
}

module.exports = { canMakeRequest, trackRequest, getUsageStats };
