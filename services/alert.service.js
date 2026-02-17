const { Alert, User } = require('../models');
const { Op } = require('sequelize');
const searchService = require('./search.service');
const notificationService = require('./notification.service');

/**
 * Crea una nueva alerta de precio
 */
async function createAlert(userId, data) {
  const expiresAt = data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

  return Alert.create({
    user_id: userId,
    origin: data.origin.toUpperCase(),
    destination: data.destination.toUpperCase(),
    departure_date: data.departureDate,
    return_date: data.returnDate || null,
    target_price: data.targetPrice,
    currency: data.currency || 'EUR',
    expires_at: expiresAt
  });
}

/**
 * Obtiene alertas de un usuario
 */
async function getUserAlerts(userId) {
  return Alert.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });
}

/**
 * Actualiza una alerta
 */
async function updateAlert(alertId, userId, data) {
  const alert = await Alert.findOne({ where: { id: alertId, user_id: userId } });
  if (!alert) return null;

  if (data.targetPrice !== undefined) alert.target_price = data.targetPrice;
  if (data.active !== undefined) alert.active = data.active;
  if (data.expiresAt !== undefined) alert.expires_at = data.expiresAt;

  await alert.save();
  return alert;
}

/**
 * Elimina una alerta
 */
async function deleteAlert(alertId, userId) {
  const result = await Alert.destroy({ where: { id: alertId, user_id: userId } });
  return result > 0;
}

/**
 * Verifica todas las alertas activas y envia notificaciones
 * Llamado por el job de node-cron
 */
async function checkAllAlerts() {
  const now = new Date();

  const alerts = await Alert.findAll({
    where: {
      active: true,
      expires_at: { [Op.gt]: now },
      departure_date: { [Op.gt]: now }
    },
    include: [{ model: User, as: 'user' }]
  });

  console.log(`Verificando ${alerts.length} alertas activas...`);
  let triggered = 0;

  for (const alert of alerts) {
    try {
      const searchResult = await searchService.searchFlights({
        origin: alert.origin,
        destination: alert.destination,
        departureDate: alert.departure_date,
        returnDate: alert.return_date,
        adults: 1,
        currency: alert.currency
      });

      if (!searchResult.results.length) continue;

      const lowestPrice = searchResult.results[0].price;

      // Actualizar ultimo precio y fecha de verificacion
      alert.last_checked_at = now;
      alert.last_price = lowestPrice;

      if (lowestPrice <= parseFloat(alert.target_price)) {
        // Precio debajo del umbral - notificar
        alert.last_triggered_at = now;
        triggered++;

        await notificationService.sendPriceAlert(alert.user, alert, lowestPrice, searchResult.results[0]);
      }

      await alert.save();
    } catch (err) {
      console.error(`Error verificando alerta ${alert.id}:`, err.message);
    }
  }

  console.log(`Alertas verificadas: ${alerts.length}, notificaciones enviadas: ${triggered}`);
  return { checked: alerts.length, triggered };
}

module.exports = { createAlert, getUserAlerts, updateAlert, deleteAlert, checkAllAlerts };
