/**
 * Cliente HTTP para comunicarse con el backend
 */
const API = {
  baseUrl: '/api',

  /**
   * Hace un fetch con headers de autenticacion si hay token
   */
  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json' };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || 'Error del servidor');
      error.status = response.status;
      error.details = data.details;
      throw error;
    }

    return data;
  },

  // ---- Search ----
  async searchFlights(params) {
    const query = Utils.buildQuery(params);
    return this.request(`/search?${query}`);
  },

  // ---- Flexible dates ----
  async getFlexibleDates(origin, destination) {
    return this.request(`/flexible?origin=${origin}&destination=${destination}`);
  },

  // ---- Price History ----
  async getPriceHistory(origin, destination, departureDate, days = 30) {
    const query = Utils.buildQuery({ origin, destination, departureDate, days });
    return this.request(`/prices/history?${query}`);
  },

  // ---- Auth ----
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(email, name, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password })
    });
  },

  async getProfile() {
    return this.request('/auth/profile');
  },

  // ---- Alerts ----
  async getAlerts() {
    return this.request('/alerts');
  },

  async createAlert(data) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAlert(id, data) {
    return this.request(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAlert(id) {
    return this.request(`/alerts/${id}`, {
      method: 'DELETE'
    });
  },

  // ---- Airports ----
  async searchAirports(query) {
    return this.request(`/airports/search?q=${encodeURIComponent(query)}`);
  }
};
