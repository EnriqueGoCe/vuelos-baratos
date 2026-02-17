/**
 * Logica del formulario de busqueda (index.html)
 */
function initSearchForm() {
  const form = document.getElementById('search-form');
  if (!form) return;

  // Init autocomplete
  initAutocomplete('origin', 'origin-code', 'origin-list');
  initAutocomplete('destination', 'destination-code', 'destination-list');

  // Set min dates
  Utils.setMinDate('departure-date');
  Utils.setMinDate('return-date');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const origin = document.getElementById('origin-code').value;
    const destination = document.getElementById('destination-code').value;
    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value;

    if (!origin || !destination) {
      alert('Selecciona origen y destino de la lista de sugerencias');
      return;
    }

    const params = Utils.buildQuery({
      origin,
      destination,
      departureDate,
      returnDate: returnDate || undefined
    });

    window.location.href = `/search.html?${params}`;
  });
}

/**
 * Busqueda rapida desde rutas populares
 */
function quickSearch(origin, destination) {
  // Set departure date to 2 weeks from now
  const date = new Date();
  date.setDate(date.getDate() + 14);
  const departureDate = Utils.formatDateInput(date);

  window.location.href = `/search.html?origin=${origin}&destination=${destination}&departureDate=${departureDate}`;
}
