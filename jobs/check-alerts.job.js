const cron = require('node-cron');
const alertService = require('../services/alert.service');

/**
 * Job que verifica alertas de precio cada 4 horas
 */
function startAlertJob() {
  // Cada 4 horas: 0 */4 * * *
  cron.schedule('0 */4 * * *', async () => {
    console.log('[Job] Verificando alertas de precio...');
    try {
      const result = await alertService.checkAllAlerts();
      console.log(`[Job] Alertas: ${result.checked} verificadas, ${result.triggered} notificaciones`);
    } catch (err) {
      console.error('[Job] Error en verificacion de alertas:', err.message);
    }
  });

  console.log('Job de alertas programado (cada 4 horas)');
}

module.exports = { startAlertJob };
