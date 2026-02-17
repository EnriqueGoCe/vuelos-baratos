/**
 * Manejo de autenticacion en el frontend
 */
const Auth = {
  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  saveSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async login(email, password) {
    const data = await API.login(email, password);
    this.saveSession(data.token, data.user);
    this.updateNavbar();
    return data;
  },

  async register(name, email, password) {
    const data = await API.register(email, name, password);
    this.saveSession(data.token, data.user);
    this.updateNavbar();
    return data;
  },

  logout() {
    this.clearSession();
    this.updateNavbar();
    window.location.href = '/';
  },

  /**
   * Actualiza el navbar segun estado de auth
   */
  updateNavbar() {
    const container = document.getElementById('navbar-auth');
    if (!container) return;

    if (this.isLoggedIn()) {
      const user = this.getUser();
      container.innerHTML = `
        <span style="font-weight:500;color:var(--gray-700);">${Utils.escapeHtml(user?.name || 'Usuario')}</span>
        <button class="btn btn-secondary btn-sm" onclick="Auth.logout()">Salir</button>
      `;
    } else {
      container.innerHTML = `
        <a href="/login.html" class="btn btn-secondary btn-sm">Iniciar sesion</a>
      `;
    }
  }
};
