/**
 * Utilidades globales del frontend
 */
const Utils = {
  /**
   * Formatea precio con moneda
   */
  formatPrice(amount, currency = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Formatea fecha ISO a formato legible
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  },

  /**
   * Formatea datetime ISO a hora
   */
  formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Formatea fecha para inputs type="date"
   */
  formatDateInput(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  },

  /**
   * Obtiene parametros de la URL
   */
  getQueryParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  },

  /**
   * Construye query string desde objeto
   */
  buildQuery(params) {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    );
    return new URLSearchParams(filtered).toString();
  },

  /**
   * Texto de escalas
   */
  stopsText(stops) {
    if (stops === 0) return 'Directo';
    if (stops === 1) return '1 escala';
    return `${stops} escalas`;
  },

  /**
   * Debounce
   */
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Escapa HTML para prevenir XSS
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Establece fecha minima de hoy en inputs de fecha
   */
  setMinDate(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      input.min = this.formatDateInput(new Date());
    }
  }
};
