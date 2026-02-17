/**
 * Dashboard de alertas (alerts.html)
 */
(function () {
  function init() {
    if (!Auth.isLoggedIn()) {
      document.getElementById('auth-required').classList.remove('hidden');
      return;
    }
    loadAlerts();
  }

  async function loadAlerts() {
    const loading = document.getElementById('alerts-loading');
    const list = document.getElementById('alerts-list');
    const empty = document.getElementById('alerts-empty');

    loading.classList.remove('hidden');

    try {
      const alerts = await API.getAlerts();
      loading.classList.add('hidden');

      if (alerts.length === 0) {
        empty.classList.remove('hidden');
        return;
      }

      list.innerHTML = alerts.map(renderAlertCard).join('');

      // Bind events
      list.querySelectorAll('.toggle input').forEach(toggle => {
        toggle.addEventListener('change', () => toggleAlert(toggle.dataset.id, toggle.checked));
      });

      list.querySelectorAll('.delete-alert').forEach(btn => {
        btn.addEventListener('click', () => deleteAlert(btn.dataset.id));
      });
    } catch (err) {
      loading.classList.add('hidden');
      list.innerHTML = `<div class="alert alert-error">Error al cargar alertas: ${Utils.escapeHtml(err.message)}</div>`;
    }
  }

  function renderAlertCard(alert) {
    const isActive = alert.active;
    const lastPrice = alert.last_price ? `Ultimo: ${alert.last_price} ${alert.currency}` : 'Sin datos';
    const lastChecked = alert.last_checked_at
      ? `Verificado: ${Utils.formatDate(alert.last_checked_at)}`
      : 'Pendiente';

    return `
      <div class="alert-card">
        <div class="route-icon">&#9992;</div>
        <div class="alert-details">
          <h4>${Utils.escapeHtml(alert.origin)} &rarr; ${Utils.escapeHtml(alert.destination)}</h4>
          <div class="meta">
            <span>${Utils.formatDate(alert.departure_date)}</span>
            ${alert.return_date ? `<span>Vuelta: ${Utils.formatDate(alert.return_date)}</span>` : ''}
            <span>${lastPrice}</span>
            <span>${lastChecked}</span>
          </div>
        </div>
        <div class="alert-actions">
          <div>
            <div class="price-target">&le; ${alert.target_price} ${Utils.escapeHtml(alert.currency)}</div>
            <div class="current-price">${lastPrice}</div>
          </div>
          <label class="toggle">
            <input type="checkbox" data-id="${alert.id}" ${isActive ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <button class="btn btn-danger btn-sm delete-alert" data-id="${alert.id}">Eliminar</button>
        </div>
      </div>
    `;
  }

  async function toggleAlert(id, active) {
    try {
      await API.updateAlert(id, { active });
    } catch (err) {
      alert('Error al actualizar alerta');
      loadAlerts(); // Reload to reset state
    }
  }

  async function deleteAlert(id) {
    if (!confirm('Eliminar esta alerta?')) return;

    try {
      await API.deleteAlert(id);
      loadAlerts();
    } catch (err) {
      alert('Error al eliminar alerta');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
