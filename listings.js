const PER_PAGE = 8;
let currentPage = 1;
let filtered = [];

/* ── Helpers ── */
function getFilters() {
  const areas = [...document.querySelectorAll('input[name="area"]:checked')].map(i => i.value);
  const type  = document.querySelector('input[name="type"]:checked')?.value || '';
  const maxRent = Number(document.getElementById('lsMaxRent').value) || Infinity;
  const amenities = [...document.querySelectorAll('input[name="amenity"]:checked')].map(i => i.value);
  const verifiedOnly = document.getElementById('lsVerifiedOnly').checked;
  const monthlyOnly  = document.getElementById('lsMonthlyOnly').checked;
  const q = document.getElementById('lsSearchInput').value.toLowerCase().trim();
  return { areas, type, maxRent, amenities, verifiedOnly, monthlyOnly, q };
}

function getSort() {
  return document.getElementById('lsSortDesk').value
      || document.getElementById('lsSortSelect').value;
}

function applyFilters() {
  const { areas, type, maxRent, amenities, verifiedOnly, monthlyOnly, q } = getFilters();
  const all = getAllListings();

  filtered = all.filter(l => {
    if (areas.length && !areas.includes(l.area)) return false;
    if (type && l.type !== type) return false;
    if (l.rentPerYear > maxRent) return false;
    if (amenities.length && !amenities.every(a => l.amenities.includes(a))) return false;
    if (verifiedOnly && !l.isVerified) return false;
    if (monthlyOnly && !l.isMonthly) return false;
    if (q && !`${l.title} ${l.area} ${l.type} ${l.description}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const sort = getSort();
  if (sort === 'price-asc')  filtered.sort((a,b) => a.rentPerYear - b.rentPerYear);
  if (sort === 'price-desc') filtered.sort((a,b) => b.rentPerYear - a.rentPerYear);
  if (sort === 'views')      filtered.sort((a,b) => b.views - a.views);
  if (sort === 'newest')     filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  currentPage = 1;
  render();
}

function render() {
  const grid  = document.getElementById('lsGrid');
  const empty = document.getElementById('lsEmpty');
  const count = document.getElementById('lsCountText');
  const rcount = document.getElementById('lsResultCount');

  const total = filtered.length;
  rcount.textContent = `${total} propert${total === 1 ? 'y' : 'ies'} found`;
  count.textContent  = `${total} propert${total === 1 ? 'y' : 'ies'} found`;

  if (!total) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
    document.getElementById('lsPagination').innerHTML = '';
    return;
  }
  empty.style.display = 'none';

  const start = (currentPage - 1) * PER_PAGE;
  const page  = filtered.slice(start, start + PER_PAGE);

  grid.innerHTML = page.map(l => `
    <div class="ls-card" onclick="location.href='listing-detail.html?id=${l.id}'">
      <div class="ls-card-img-wrap">
        <img src="${l.images[0]}" alt="${l.title}" loading="lazy" />
        <div class="ls-card-badges">
          ${l.isVerified ? '<span class="ls-badge ls-badge-verified">&#x1F6E1; Verified</span>' : ''}
          ${l.isMonthly  ? '<span class="ls-badge ls-badge-monthly">&#x1F4C5; Monthly</span>' : ''}
        </div>
        <div class="ls-views-pill">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          ${l.views}
        </div>
      </div>
      <div class="ls-card-body">
        <div class="ls-card-title">${l.title}</div>
        <div class="ls-card-loc">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${l.area}, Lagos
        </div>
        <div class="ls-card-meta">
          <span>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M4 20V8l8-6 8 6v12"/><rect x="9" y="14" width="6" height="6"/></svg>
            ${l.beds} bed${l.beds > 1 ? 's' : ''}
          </span>
          <span>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16"/><path d="M4 6V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8"/><path d="M2 20h20v-2a6 6 0 0 0-6-6H8a6 6 0 0 0-6 6v2z"/></svg>
            ${l.baths} bath${l.baths > 1 ? 's' : ''}
          </span>
          <span>${l.type}</span>
        </div>
        <div class="ls-card-price">
          <div>
            <div class="ls-card-rent">${formatNaira(l.rentPerYear)}<span style="font-size:13px;color:#5d6876;font-family:'Manrope',sans-serif;font-weight:600">/yr</span></div>
            <div class="ls-card-movein">Move-in: <strong>${formatNaira(l.totalMoveIn)}</strong></div>
          </div>
          <a class="ls-card-cta" href="listing-detail.html?id=${l.id}">
            View Details
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h13m-5-5 5 5-5 5"/></svg>
          </a>
        </div>
      </div>
    </div>
  `).join('');

  renderPagination(total);
}

function renderPagination(total) {
  const pag = document.getElementById('lsPagination');
  const pages = Math.ceil(total / PER_PAGE);
  if (pages <= 1) { pag.innerHTML = ''; return; }

  let html = `<button class="ls-pg-btn" ${currentPage===1?'disabled':''} onclick="goPage(${currentPage-1})">&#x2190; Prev</button>`;
  for (let i = 1; i <= pages; i++) {
    if (pages > 6 && i > 2 && i < pages - 1 && Math.abs(i - currentPage) > 1) {
      if (i === 3 || i === pages - 2) html += `<span class="ls-pg-ellipsis">...</span>`;
      continue;
    }
    html += `<button class="ls-pg-btn${i===currentPage?' active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="ls-pg-btn" ${currentPage===pages?'disabled':''} onclick="goPage(${currentPage+1})">Next &#x2192;</button>`;
  pag.innerHTML = html;
}

function goPage(n) {
  currentPage = n;
  render();
  window.scrollTo({ top: document.querySelector('.ls-body').offsetTop - 80, behavior: 'smooth' });
}

function clearFilters() {
  document.querySelectorAll('input[name="area"]').forEach(i => i.checked = false);
  document.querySelectorAll('input[name="type"]').forEach(i => i.checked = false);
  document.querySelector('input[name="type"]').checked = true;
  document.getElementById('lsMaxRent').value = '';
  document.querySelectorAll('input[name="amenity"]').forEach(i => i.checked = false);
  document.getElementById('lsVerifiedOnly').checked = false;
  document.getElementById('lsMonthlyOnly').checked = false;
  document.getElementById('lsSearchInput').value = '';
  applyFilters();
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  // Pre-select first radio
  document.querySelector('input[name="type"]').checked = true;

  // URL search param
  const params = new URLSearchParams(location.search);
  if (params.get('q')) document.getElementById('lsSearchInput').value = params.get('q');

  applyFilters();

  // Events
  document.getElementById('lsSearchBtn').addEventListener('click', applyFilters);
  document.getElementById('lsSearchInput').addEventListener('keydown', e => { if (e.key==='Enter') applyFilters(); });
  document.getElementById('lsApplyFilters').addEventListener('click', () => { applyFilters(); closeSidebar(); });
  document.getElementById('lsClearAll').addEventListener('click', clearFilters);
  document.getElementById('lsClearEmpty').addEventListener('click', clearFilters);
  document.getElementById('lsSortDesk').addEventListener('change', applyFilters);
  document.getElementById('lsSortSelect').addEventListener('change', () => {
    document.getElementById('lsSortDesk').value = document.getElementById('lsSortSelect').value;
    applyFilters();
  });
  document.getElementById('lsVerifiedOnly').addEventListener('change', applyFilters);
  document.getElementById('lsMonthlyOnly').addEventListener('change', applyFilters);
  document.getElementById('lsMaxRent').addEventListener('change', applyFilters);

  // Mobile menu
  document.getElementById('lsMenuBtn').addEventListener('click', () =>
    document.getElementById('lsDrawer').classList.toggle('open'));

  // Mobile filter toggle
  document.getElementById('lsFilterToggle').addEventListener('click', () => {
    const sb = document.getElementById('lsSidebar');
    sb.classList.toggle('open');
  });

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', e => {
    const sb = document.getElementById('lsSidebar');
    const btn = document.getElementById('lsFilterToggle');
    if (sb.classList.contains('open') && !sb.contains(e.target) && !btn.contains(e.target)) {
      sb.classList.remove('open');
    }
  });
});

function closeSidebar() {
  document.getElementById('lsSidebar').classList.remove('open');
}
