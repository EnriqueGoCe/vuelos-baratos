const alertService = require('../services/alert.service');

async function getAlerts(req, res) {
  try {
    const alerts = await alertService.getUserAlerts(req.user.id);
    res.json(alerts);
  } catch (err) {
    console.error('Error obteniendo alertas:', err);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
}

async function createAlert(req, res) {
  try {
    const alert = await alertService.createAlert(req.user.id, {
      origin: req.body.origin,
      destination: req.body.destination,
      departureDate: req.body.departureDate,
      returnDate: req.body.returnDate,
      targetPrice: req.body.targetPrice,
      currency: req.body.currency
    });
    res.status(201).json(alert);
  } catch (err) {
    console.error('Error creando alerta:', err);
    res.status(500).json({ error: 'Error al crear alerta' });
  }
}

async function updateAlert(req, res) {
  try {
    const alert = await alertService.updateAlert(
      parseInt(req.params.id, 10),
      req.user.id,
      req.body
    );
    if (!alert) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json(alert);
  } catch (err) {
    console.error('Error actualizando alerta:', err);
    res.status(500).json({ error: 'Error al actualizar alerta' });
  }
}

async function deleteAlert(req, res) {
  try {
    const deleted = await alertService.deleteAlert(
      parseInt(req.params.id, 10),
      req.user.id
    );
    if (!deleted) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json({ message: 'Alerta eliminada' });
  } catch (err) {
    console.error('Error eliminando alerta:', err);
    res.status(500).json({ error: 'Error al eliminar alerta' });
  }
}

module.exports = { getAlerts, createAlert, updateAlert, deleteAlert };
