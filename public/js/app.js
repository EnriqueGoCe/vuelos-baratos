/**
 * Inicializacion global de la aplicacion
 */
document.addEventListener('DOMContentLoaded', () => {
  // Actualizar navbar con estado de auth
  Auth.updateNavbar();

  // Init search form if on index page
  if (typeof initSearchForm === 'function') {
    initSearchForm();
  }
});
