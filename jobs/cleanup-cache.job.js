const cron = require('node-cron');
const { SearchCache } = require('../models');
const { Op } = require('sequelize');

/**
 * Job que limpia cache expirado de la BD cada hora
 */
function startCleanupJob() {
  // Cada hora: 0 * * * *
  cron.schedule('0 * * * *', async () => {
    try {
      const deleted = await SearchCache.destroy({
        where: {
          expires_at: { [Op.lt]: new Date() }
        }
      });
      if (deleted > 0) {
        console.log(`[Job] Cache limpiado: ${deleted} entradas expiradas eliminadas`);
      }
    } catch (err) {
      console.error('[Job] Error limpiando cache:', err.message);
    }
  });

  console.log('Job de limpieza de cache programado (cada hora)');
}

module.exports = { startCleanupJob };
