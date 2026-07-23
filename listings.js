const PER_PAGE = 8;
let currentPage = 1;
let pwActiveChat = null;

/* Kicked off once on page load; chat-open prefill awaits this shared promise instead of
   re-fetching the session on every click (and instead of the old synchronous
   localStorage.getItem('pw_current_user') read, which no longer holds anything real). */
const pwSessionPromise = typeof PWAuth !== 'undefined' ? PWAuth.getSession() : Promise.resolve({ user: null });

/* Heart-button state for every card on the page — fetched once (not per card, not per re-render)
   and kept in sync locally as the tenant saves/unsaves, per pwToggleFavourite() below. Empty set
   for logged-out visitors and landlords, who simply see every heart unfilled. */
let pwFavouriteIds = new Set();
const pwFavouritesPromise = (async () => {
  const { user } = await pwSessionPromise;
  if (!user || user.role !== 'tenant') return;
  pwFavouriteIds = await getFavouriteIds();
})();

/* ── Helpers ── */
function getFilters() {
  const areas = [...document.querySelectorAll('input[name="area"]:checked')].map(i => i.value);
  const type  = document.querySelector('input[name="type"]:checked')?.value || '';
  const maxRentVal = Number(document.getElementById('lsMaxRent').value);
  const maxRent = maxRentVal > 0 ? maxRentVal : null; // null = "no cap", omitted from the query
  const amenities = [...document.querySelectorAll('input[name="amenity"]:checked')].map(i => i.value);
  const verifiedOnly = document.getElementById('lsVerifiedOnly').checked;
  const monthlyOnly  = document.getElementById('lsMonthlyOnly').checked;
  const q = document.getElementById('lsSearchInput').value.trim();
  return { areas, type, maxRent, amenities, verifiedOnly, monthlyOnly, q };
}

function getSort() {
  return document.getElementById('lsSortDesk').value
      || document.getElementById('lsSortSelect').value;
}

/* Builds the same querystring the backend's GET /api/listings expects — area/type/amenities
   are comma-separated lists, matching splitCsv() server-side (see listings.controller.js). */
function buildListingsQuery(page) {
  const { areas, type, maxRent, amenities, verifiedOnly, monthlyOnly, q } = getFilters();
  const params = new URLSearchParams();
  if (areas.length) params.set('area', areas.join(','));
  if (type) params.set('type', type);
  if (maxRent) params.set('maxRent', String(maxRent));
  if (amenities.length) params.set('amenities', amenities.join(','));
  if (verifiedOnly) params.set('verifiedOnly', 'true');
  if (monthlyOnly) params.set('monthlyOnly', 'true');
  if (q) params.set('q', q);
  const sort = getSort();
  if (sort) params.set('sort', sort);
  params.set('page', String(page));
  params.set('limit', String(PER_PAGE));
  return params.toString();
}

async function applyFilters() {
  currentPage = 1;
  await loadAndRender();
}

/* Fetches the current filter/sort/page state from the backend and renders it. Used for the
   initial load, every filter change, and as the "Retry" action on failure. */
async function loadAndRender() {
  const grid  = document.getElementById('lsGrid');
  const empty = document.getElementById('lsEmpty');
  empty.style.display = 'none';
  document.getElementById('lsPagination').innerHTML = '';
  grid.innerHTML = `<div class="ls-status" style="grid-column:1/-1;padding:48px 0;text-align:center;font-weight:700;color:#5d6876;">Loading listings…</div>`;

  const [res] = await Promise.all([
    PWApi.request('/api/listings?' + buildListingsQuery(currentPage)),
    pwFavouritesPromise,
  ]);

  if (!res.ok) {
    const msg = res.error === 'network'
      ? "Couldn't reach the server. Check your connection and try again."
      : 'Something went wrong loading listings.';
    grid.innerHTML = `<div class="ls-status" style="grid-column:1/-1;padding:48px 0;text-align:center;font-weight:700;color:#c0392b;">
      ${msg}
      <button onclick="loadAndRender()" style="display:block;margin:14px auto 0;padding:8px 18px;border-radius:8px;border:none;background:#a97e4b;color:#fff;font-weight:800;cursor:pointer;font-family:inherit">Retry</button>
    </div>`;
    return;
  }

  render(res.data);
}

function render(data) {
  const grid  = document.getElementById('lsGrid');
  const empty = document.getElementById('lsEmpty');
  const count = document.getElementById('lsCountText');
  const rcount = document.getElementById('lsResultCount');

  const { listings, total, page, totalPages } = data;

  rcount.textContent = `${total} propert${total === 1 ? 'y' : 'ies'} found`;
  count.textContent  = `${total} propert${total === 1 ? 'y' : 'ies'} found`;

  if (!total) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
    document.getElementById('lsPagination').innerHTML = '';
    return;
  }
  empty.style.display = 'none';

  pwActiveChat = null;

  const WA_SVG = '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>';
  const MSG_SVG = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  const HEART_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  grid.innerHTML = listings.map(l => {
    const waMsg  = encodeURIComponent('Hello, I am interested in your property "' + l.title + '" listed on Property Warehouse.');
    const waHref = 'https://wa.me/' + l.landlordWhatsApp + '?text=' + waMsg;
    const safeLandlord = l.landlordName.replace(/"/g, '&quot;');
    const safeTitle    = l.title.replace(/"/g, '&quot;');
    const safeArea     = l.area.replace(/"/g, '&quot;');
    const isSaved      = pwFavouriteIds.has(l.id);

    return `
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
        <button class="ls-heart-btn${isSaved ? ' liked' : ''}" type="button" data-id="${l.id}"
          aria-label="${isSaved ? 'Remove from saved' : 'Save listing'}"
          onclick="pwToggleFavourite(this); event.stopPropagation()">
          ${HEART_SVG}
        </button>
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
          <a class="ls-card-cta" href="listing-detail.html?id=${l.id}" onclick="event.stopPropagation()">
            View Details
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h13m-5-5 5 5-5 5"/></svg>
          </a>
        </div>
        <div class="pw-card-actions" onclick="event.stopPropagation()">
          <a class="pw-wa-btn-sm" href="${waHref}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
            ${WA_SVG} Chat on WhatsApp
          </a>
          <button class="pw-inquiry-btn-sm" data-lid="${l.id}" onclick="pwToggleChat(this); event.stopPropagation()">
            ${MSG_SVG} Send Inquiry
          </button>
        </div>
      </div>
      <div class="pw-chat-panel" id="pw-chat-${l.id}" onclick="event.stopPropagation()">
        <div class="pw-chat-header">
          <span>Message ${safeLandlord}</span>
          <button class="pw-chat-close" onclick="pwCloseChat('${l.id}'); event.stopPropagation()" aria-label="Close chatbox">&times;</button>
        </div>
        <div class="pw-chat-fields">
          <input id="pw-name-${l.id}" type="text" placeholder="Your name" />
          <input id="pw-phone-${l.id}" type="tel" placeholder="Your phone number" />
          <textarea id="pw-msg-${l.id}" rows="3" placeholder="Hi, I'm interested in this property..."></textarea>
        </div>
        <button class="pw-chat-send"
          data-lid="${l.id}"
          data-title="${safeTitle}"
          data-landlord="${safeLandlord}"
          data-area="${safeArea}"
          onclick="pwSubmitInquiry(this); event.stopPropagation()">
          Send Message
        </button>
        <div class="pw-chat-success" id="pw-succ-${l.id}"></div>
      </div>
    </div>`;
  }).join('');

  renderPagination(page, totalPages);
}

/* ── Favourites (heart button) ── */
async function pwToggleFavourite(btn) {
  // Disabled synchronously, before the first await, so a second rapid click on the same heart
  // can't start a concurrent invocation racing this one over pwFavouriteIds — a disabled button
  // doesn't dispatch click events at all, native or synthetic.
  btn.disabled = true;

  const { user } = await pwSessionPromise;
  if (!user || user.role !== 'tenant') {
    btn.disabled = false;
    alert('Please log in as a tenant to save listings.');
    location.href = 'auth.html';
    return;
  }

  const id = btn.dataset.id;
  const wasSaved = pwFavouriteIds.has(id);

  const res = wasSaved ? await unsaveFavourite(id) : await saveFavourite(id);
  btn.disabled = false;

  if (!res.ok) {
    alert(res.error === 'network' ? "Couldn't reach the server. Please try again." : 'Something went wrong. Please try again.');
    return;
  }

  if (wasSaved) pwFavouriteIds.delete(id); else pwFavouriteIds.add(id);
  btn.classList.toggle('liked', !wasSaved);
  btn.setAttribute('aria-label', wasSaved ? 'Save listing' : 'Remove from saved');
}

/* ── Chatbox logic ── */
async function pwToggleChat(btn) {
  const lid = btn.dataset.lid;
  const panel = document.getElementById('pw-chat-' + lid);
  if (!panel) return;

  if (pwActiveChat && pwActiveChat !== lid) {
    const prev = document.getElementById('pw-chat-' + pwActiveChat);
    if (prev) prev.classList.remove('pw-open');
  }

  const opening = !panel.classList.contains('pw-open');
  panel.classList.toggle('pw-open', opening);
  pwActiveChat = opening ? lid : null;

  if (opening) {
    const { user } = await pwSessionPromise;
    if (user) {
      const nameEl  = document.getElementById('pw-name-' + lid);
      const phoneEl = document.getElementById('pw-phone-' + lid);
      if (nameEl)  nameEl.value  = ((user.firstName || '') + ' ' + (user.lastName || '')).trim();
      if (phoneEl) phoneEl.value = user.phone || '';
    }
  }
}

function pwCloseChat(lid) {
  const panel = document.getElementById('pw-chat-' + lid);
  if (panel) panel.classList.remove('pw-open');
  if (pwActiveChat === lid) pwActiveChat = null;
}

function pwSubmitInquiry(btn) {
  const lid         = btn.dataset.lid;
  const title       = btn.dataset.title;
  const landlordName = btn.dataset.landlord;
  const area        = btn.dataset.area;

  const nameEl  = document.getElementById('pw-name-'  + lid);
  const phoneEl = document.getElementById('pw-phone-' + lid);
  const msgEl   = document.getElementById('pw-msg-'   + lid);
  const succEl  = document.getElementById('pw-succ-'  + lid);

  const name    = nameEl  ? nameEl.value.trim()  : '';
  const phone   = phoneEl ? phoneEl.value.trim() : '';
  const message = msgEl   ? msgEl.value.trim()   : '';

  if (!name || !phone || !message) {
    alert('Please fill in your name, phone number, and a message.');
    return;
  }

  addInquiry({ listingId: lid, listingTitle: title, landlordName, area, senderName: name, senderPhone: phone, message });

  if (succEl) succEl.textContent = '✅ Message sent! The landlord will contact you shortly.';

  setTimeout(function () {
    pwCloseChat(lid);
    if (succEl)  succEl.textContent = '';
    if (nameEl)  nameEl.value  = '';
    if (phoneEl) phoneEl.value = '';
    if (msgEl)   msgEl.value   = '';
  }, 3000);
}

/* ── Pagination ── */
function renderPagination(page, totalPages) {
  const pag = document.getElementById('lsPagination');
  if (totalPages <= 1) { pag.innerHTML = ''; return; }

  let html = `<button class="ls-pg-btn" ${page===1?'disabled':''} onclick="goPage(${page-1})">&#x2190; Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 6 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) {
      if (i === 3 || i === totalPages - 2) html += `<span class="ls-pg-ellipsis">...</span>`;
      continue;
    }
    html += `<button class="ls-pg-btn${i===page?' active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="ls-pg-btn" ${page===totalPages?'disabled':''} onclick="goPage(${page+1})">Next &#x2192;</button>`;
  pag.innerHTML = html;
}

async function goPage(n) {
  currentPage = n;
  await loadAndRender();
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
  document.querySelector('input[name="type"]').checked = true;

  const params = new URLSearchParams(location.search);
  if (params.get('q')) document.getElementById('lsSearchInput').value = params.get('q');

  applyFilters();

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

  document.getElementById('lsMenuBtn').addEventListener('click', () =>
    document.getElementById('lsDrawer').classList.toggle('open'));

  document.getElementById('lsFilterToggle').addEventListener('click', () => {
    document.getElementById('lsSidebar').classList.toggle('open');
  });

  document.addEventListener('click', e => {
    const sb  = document.getElementById('lsSidebar');
    const btn = document.getElementById('lsFilterToggle');
    if (sb.classList.contains('open') && !sb.contains(e.target) && !btn.contains(e.target)) {
      sb.classList.remove('open');
    }
  });
});

function closeSidebar() {
  document.getElementById('lsSidebar').classList.remove('open');
}
