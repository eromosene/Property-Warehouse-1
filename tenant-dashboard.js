/* ═══════════════════════════════════════════
   TENANT DASHBOARD — Property Warehouse
═══════════════════════════════════════════ */

let currentUser = null;
let currentSection = 'overview';

/* ── Auth Guard ── */
document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('pw_current_user');
  if (!raw) { location.href = 'auth.html'; return; }
  currentUser = JSON.parse(raw);
  if (currentUser.role !== 'tenant') { location.href = 'auth.html'; return; }

  initUI();
  renderAll();
  bindNav();
  bindMobile();
});

/* ── Init ── */
function initUI() {
  const name  = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;
  const first = currentUser.firstName || name;

  document.getElementById('tdUserName').textContent    = name;
  document.getElementById('tdWelcomeName').textContent = `Welcome, ${first}`;
  document.getElementById('tdAvatar').textContent      = (first[0] || '?').toUpperCase();
}

/* ── Render everything ── */
function renderAll() {
  const saved     = getSavedListings();
  const inquiries = getInquiries();

  /* Stats */
  document.getElementById('statSaved').textContent = saved.length;
  document.getElementById('statInq').textContent   = inquiries.length;

  /* Member since */
  const joined = currentUser.joinedAt ? new Date(currentUser.joinedAt) : null;
  if (joined) {
    document.getElementById('statDays').textContent =
      joined.toLocaleDateString('en-NG', { month: 'short', year: 'numeric' });
  } else {
    document.getElementById('statDays').textContent = 'Today';
  }

  /* Badges */
  setBadge('tdSavedBadge', saved.length);
  setBadge('tdInqBadge', inquiries.length);

  /* Overview previews */
  renderSavedGrid('tdOverviewSaved', saved.slice(0, 3));
  renderInqList('tdOverviewInq', inquiries.slice(0, 3), true);

  /* Full sections */
  renderSavedGrid('tdSavedGrid', saved);
  renderInqList('tdInqList', inquiries, false);
}

function setBadge(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = count;
  el.dataset.count = count;
  el.style.display = count > 0 ? '' : 'none';
}

/* ── Saved Listings Grid ── */
function renderSavedGrid(containerId, listings) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!listings.length) {
    el.innerHTML = `
      <div class="td-empty-state">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#c8c3bb" stroke-width="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <p>No saved properties yet.</p>
        <a href="listings.html" class="td-empty-link">Browse Listings →</a>
      </div>`;
    return;
  }

  el.innerHTML = listings.map(l => `
    <div class="td-prop-card" id="saved-card-${l.id}">
      <img class="td-prop-img"
        src="${(l.images && l.images[0]) || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60'}"
        alt="${l.title}" loading="lazy" />
      <div class="td-prop-body">
        <div class="td-prop-title">${l.title}</div>
        <div class="td-prop-area">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${l.area}
        </div>
        <div class="td-prop-price">${formatNaira(l.rentPerYear)} <span>/yr</span></div>
        <div class="td-prop-actions">
          <a class="td-prop-view-btn" href="listing-detail.html?id=${l.id}">View Details</a>
          <button class="td-prop-unsave-btn" type="button" data-id="${l.id}" onclick="unsaveListing('${l.id}')">
            Remove
          </button>
        </div>
      </div>
    </div>`).join('');
}

function unsaveListing(id) {
  toggleFavourite(id);
  renderAll();
}

/* ── Inquiry List ── */
function renderInqList(containerId, inquiries, compact) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!inquiries.length) {
    el.innerHTML = `
      <div class="td-empty-state">
        <svg viewBox="0 0 24 24" width="${compact ? 40 : 48}" height="${compact ? 40 : 48}" fill="none" stroke="#c8c3bb" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>No inquiries sent yet.</p>
        <a href="listings.html" class="td-empty-link">Find a Property →</a>
      </div>`;
    return;
  }

  const listing = inq => getListingById(inq.listingId);

  el.innerHTML = `<div class="td-inq-list">${inquiries.map(inq => {
    const l     = listing(inq);
    const img   = l ? (l.images && l.images[0]) : null;
    const title = inq.listingTitle || (l && l.title) || 'Property';
    const area  = inq.area  || (l && l.area)  || '—';
    const rent  = inq.rentPerYear || (l && l.rentPerYear) || 0;
    const date  = inq.sentAt ? new Date(inq.sentAt).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—';
    const waUrl = `https://wa.me/${inq.landlordWhatsApp || ''}`;
    return `
      <div class="td-inq-card">
        ${img ? `<img class="td-inq-img" src="${img}" alt="${title}" loading="lazy" />` : ''}
        <div class="td-inq-body">
          <div class="td-inq-title">${title}</div>
          <div class="td-inq-meta">${area} · ${inq.landlordName || 'Landlord'}</div>
          <div class="td-inq-date">Sent ${date}</div>
        </div>
        <div class="td-inq-price">${formatNaira(rent)}<small style="font-size:11px;color:#9a9490;font-family:var(--font-sans)">/yr</small></div>
        ${inq.landlordWhatsApp ? `
          <a class="td-reinq-btn" href="${waUrl}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="none">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Re-inquire
          </a>` : ''}
      </div>`;
  }).join('')}</div>`;
}

/* ── Navigation ── */
function bindNav() {
  document.querySelectorAll('.td-nav-item[data-section], .td-view-all[data-section]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      goToSection(link.dataset.section);
    });
  });

  document.getElementById('tdLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('pw_current_user');
    location.href = 'auth.html';
  });
}

function goToSection(section) {
  currentSection = section;

  document.querySelectorAll('.td-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === section);
  });
  document.querySelectorAll('.td-section').forEach(s => s.classList.remove('active'));

  const sectionEl = document.getElementById(`tdSection${cap(section)}`);
  if (sectionEl) sectionEl.classList.add('active');

  const titles = { overview: 'Overview', saved: 'Saved Listings', inquiries: 'My Inquiries' };
  document.getElementById('tdTopbarTitle').textContent = titles[section] || '';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  const sidebar = document.getElementById('tdSidebar');
  sidebar.classList.remove('open');
  document.getElementById('tdSidebarOverlay').classList.remove('visible');
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ── Mobile sidebar ── */
function bindMobile() {
  const sidebar  = document.getElementById('tdSidebar');
  const overlay  = document.getElementById('tdSidebarOverlay');
  const menuBtn  = document.getElementById('tdMenuBtn');

  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  });
}
