/**
 * Autocompletado de aeropuertos
 */
function initAutocomplete(inputId, hiddenId, listId) {
  const input = document.getElementById(inputId);
  const hidden = document.getElementById(hiddenId);
  const list = document.getElementById(listId);
  if (!input || !hidden || !list) return;

  let highlightIndex = -1;
  let items = [];

  const search = Utils.debounce(async (query) => {
    if (query.length < 2) {
      list.classList.remove('active');
      return;
    }

    try {
      items = await API.searchAirports(query);
      renderList();
    } catch {
      list.classList.remove('active');
    }
  }, 250);

  function renderList() {
    if (items.length === 0) {
      list.classList.remove('active');
      return;
    }

    list.innerHTML = items.map((item, i) => `
      <div class="autocomplete-item${i === highlightIndex ? ' highlighted' : ''}" data-index="${i}">
        <span class="code">${Utils.escapeHtml(item.code)}</span>
        <span class="city">${Utils.escapeHtml(item.city)}</span>
        <span class="country"> - ${Utils.escapeHtml(item.country)}</span>
      </div>
    `).join('');

    list.classList.add('active');

    // Click events on items
    list.querySelectorAll('.autocomplete-item').forEach(el => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectItem(parseInt(el.dataset.index, 10));
      });
    });
  }

  function selectItem(index) {
    const item = items[index];
    if (!item) return;
    input.value = `${item.city} (${item.code})`;
    hidden.value = item.code;
    list.classList.remove('active');
    highlightIndex = -1;
  }

  input.addEventListener('input', (e) => {
    hidden.value = '';
    highlightIndex = -1;
    search(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    if (!list.classList.contains('active')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIndex = Math.min(highlightIndex + 1, items.length - 1);
      renderList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIndex = Math.max(highlightIndex - 1, 0);
      renderList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0) {
        selectItem(highlightIndex);
      }
    } else if (e.key === 'Escape') {
      list.classList.remove('active');
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => list.classList.remove('active'), 200);
  });

  input.addEventListener('focus', () => {
    if (items.length > 0 && input.value.length >= 2) {
      list.classList.add('active');
    }
  });
}
