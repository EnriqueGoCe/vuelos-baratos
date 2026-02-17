/**
 * Renderizado de resultados de busqueda (search.html)
 */
(function () {
  let allResults = [];
  let searchParams = {};
  let currentSort = 'price';
  let currentFilter = 'all';

  function init() {
    const params = Utils.getQueryParams();
    if (!params.origin || !params.destination || !params.departureDate) {
      window.location.href = '/';
      return;
    }

    searchParams = params;
    document.getElementById('search-summary').textContent =
      `${params.origin} → ${params.destination}`;
    document.getElementById('search-meta').textContent =
      `${Utils.formatDate(params.departureDate)}${params.returnDate ? ' - ' + Utils.formatDate(params.returnDate) : ' (solo ida)'}`;

    // Sort tabs
    document.querySelectorAll('.sort-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.sort-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentSort = tab.dataset.sort;
        renderResults();
      });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderResults();
      });
    });

    // Alert button
    document.getElementById('create-alert-btn')?.addEventListener('click', openAlertModal);
    document.getElementById('alert-cancel')?.addEventListener('click', closeAlertModal);
    document.getElementById('alert-form')?.addEventListener('submit', handleCreateAlert);

    performSearch();
  }

  async function performSearch() {
    try {
      showLoading(true);
      const data = await API.searchFlights(searchParams);

      allResults = data.results || [];

      showLoading(false);

      if (allResults.length === 0) {
        document.getElementById('results-empty').classList.remove('hidden');
        return;
      }

      document.getElementById('results-count').textContent =
        `${data.totalResults} vuelos encontrados${data.cached ? ' (cache)' : ''}`;

      renderResults();

      // Show alert CTA if logged in
      if (Auth.isLoggedIn()) {
        document.getElementById('alert-cta').classList.remove('hidden');
      }

      // Load price chart
      loadPriceChart();
    } catch (err) {
      showLoading(false);
      document.getElementById('results-error').classList.remove('hidden');
      document.getElementById('error-message').textContent =
        err.message || 'Error al buscar vuelos';
    }
  }

  function showLoading(show) {
    document.getElementById('results-loading').classList.toggle('hidden', !show);
  }

  function renderResults() {
    let filtered = [...allResults];

    // Apply filter
    if (currentFilter === 'direct') {
      filtered = filtered.filter(r => r.stops === 0);
    } else if (currentFilter === '1stop') {
      filtered = filtered.filter(r => r.stops === 1);
    }

    // Apply sort
    if (currentSort === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'duration') {
      filtered.sort((a, b) => (a.totalDuration || '').localeCompare(b.totalDuration || ''));
    } else if (currentSort === 'stops') {
      filtered.sort((a, b) => a.stops - b.stops);
    }

    const container = document.getElementById('results-list');
    container.innerHTML = filtered.map(renderFlightCard).join('');
  }

  function renderFlightCard(flight) {
    const outFirst = flight.outbound[0];
    const outLast = flight.outbound[flight.outbound.length - 1];
    if (!outFirst || !outLast) return '';

    const depTime = Utils.formatTime(outFirst.departure);
    const arrTime = Utils.formatTime(outLast.arrival);
    const stopsText = Utils.stopsText(flight.stops);

    let inboundHtml = '';
    if (flight.inbound && flight.inbound.length > 0) {
      const inFirst = flight.inbound[0];
      const inLast = flight.inbound[flight.inbound.length - 1];
      const inStops = flight.inbound.length - 1;
      inboundHtml = `
        <div class="flight-route mt-1" style="opacity:0.7;">
          <div class="flight-time">
            <div class="time">${Utils.formatTime(inFirst.departure)}</div>
            <div class="code">${Utils.escapeHtml(inFirst.origin)}</div>
          </div>
          <div class="flight-line" data-duration="Vuelta" data-stops="${Utils.stopsText(inStops)}">
            <span class="plane-icon">&#9992;</span>
          </div>
          <div class="flight-time">
            <div class="time">${Utils.formatTime(inLast.arrival)}</div>
            <div class="code">${Utils.escapeHtml(inLast.destination)}</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="flight-card">
        <div class="flight-info">
          <div class="flight-route">
            <div class="flight-time">
              <div class="time">${depTime}</div>
              <div class="code">${Utils.escapeHtml(outFirst.origin)}</div>
            </div>
            <div class="flight-line" data-duration="${Utils.escapeHtml(flight.totalDuration || '')}" data-stops="${stopsText}">
              <span class="plane-icon">&#9992;</span>
            </div>
            <div class="flight-time">
              <div class="time">${arrTime}</div>
              <div class="code">${Utils.escapeHtml(outLast.destination)}</div>
            </div>
          </div>
          ${inboundHtml}
          <div class="flight-meta">
            <div class="flight-airline">
              ${Utils.escapeHtml(outFirst.airlineName)} - ${Utils.escapeHtml(outFirst.flightNumber)}
            </div>
            <span class="badge badge-primary">${Utils.escapeHtml(flight.provider)}</span>
          </div>
        </div>
        <div class="flight-price">
          <div>
            <span class="amount">${flight.price}</span>
            <span class="currency">${Utils.escapeHtml(flight.currency)}</span>
          </div>
          <div class="per-person">por persona</div>
          ${flight.deepLink ? `<a href="${Utils.escapeHtml(flight.deepLink)}" target="_blank" class="btn btn-primary btn-sm mt-1">Reservar</a>` : ''}
        </div>
      </div>
    `;
  }

  async function loadPriceChart() {
    try {
      const history = await API.getPriceHistory(
        searchParams.origin,
        searchParams.destination,
        searchParams.departureDate
      );

      if (history.length > 1) {
        document.getElementById('price-chart-section').classList.remove('hidden');
        renderPriceHistoryChart('price-chart', history);
      }
    } catch {
      // Chart is optional, ignore errors
    }
  }

  function openAlertModal() {
    if (!Auth.isLoggedIn()) {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }

    document.getElementById('alert-route').value =
      `${searchParams.origin} → ${searchParams.destination} (${Utils.formatDate(searchParams.departureDate)})`;

    // Suggest target price as 80% of current cheapest
    const cheapest = allResults[0]?.price;
    if (cheapest) {
      document.getElementById('alert-target-price').value = Math.round(cheapest * 0.8);
    }

    document.getElementById('alert-modal').classList.remove('hidden');
  }

  function closeAlertModal() {
    document.getElementById('alert-modal').classList.add('hidden');
  }

  async function handleCreateAlert(e) {
    e.preventDefault();
    const targetPrice = document.getElementById('alert-target-price').value;

    try {
      await API.createAlert({
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate || null,
        targetPrice: parseFloat(targetPrice)
      });

      closeAlertModal();
      alert('Alerta creada. Te notificaremos si el precio baja.');
    } catch (err) {
      alert('Error al crear alerta: ' + (err.message || 'Error desconocido'));
    }
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
