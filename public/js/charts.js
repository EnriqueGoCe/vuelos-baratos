/**
 * Graficas con Chart.js
 */

/**
 * Renderiza grafica de historial de precios
 */
function renderPriceHistoryChart(canvasId, history) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !history.length) return;

  // Destroy existing chart if any
  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();

  const labels = history.map(h => {
    const d = new Date(h.date);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  });

  const datasets = [
    {
      label: 'Precio mas bajo',
      data: history.map(h => h.lowestPrice),
      borderColor: '#48bb78',
      backgroundColor: 'rgba(72, 187, 120, 0.1)',
      fill: true,
      tension: 0.3
    }
  ];

  if (history.some(h => h.averagePrice)) {
    datasets.push({
      label: 'Precio promedio',
      data: history.map(h => h.averagePrice),
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: false,
      tension: 0.3
    });
  }

  if (history.some(h => h.highestPrice)) {
    datasets.push({
      label: 'Precio mas alto',
      data: history.map(h => h.highestPrice),
      borderColor: '#fc8181',
      backgroundColor: 'rgba(252, 129, 129, 0.1)',
      fill: false,
      tension: 0.3,
      borderDash: [5, 5]
    });
  }

  new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} EUR`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (val) => val + ' EUR'
          }
        }
      }
    }
  });
}

/**
 * Renderiza grafica de fechas flexibles (barra)
 */
function renderFlexChart(dates) {
  const canvas = document.getElementById('flex-chart');
  if (!canvas || !dates.length) return;

  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();

  // Limitar a 60 para que sea legible
  const displayDates = dates.slice(0, 60);
  const minPrice = Math.min(...displayDates.map(d => d.price));

  const labels = displayDates.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  });

  const colors = displayDates.map(d => {
    if (d.price === minPrice) return '#48bb78';
    if (d.price < minPrice * 1.3) return '#667eea';
    return '#fc8181';
  });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Precio',
        data: displayDates.map(d => d.price),
        backgroundColor: colors,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => displayDates[items[0].dataIndex]?.date,
            label: (ctx) => `${ctx.parsed.y} ${displayDates[ctx.dataIndex]?.currency || 'EUR'}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: { callback: (val) => val + ' EUR' }
        },
        x: {
          ticks: { maxRotation: 45 }
        }
      }
    }
  });
}
