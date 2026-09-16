let pwDetListingData = null;

/* Kicked off once on page load; chat-open prefill awaits this shared promise instead of
   re-fetching the session on every click (and instead of the old synchronous
   localStorage.getItem('pw_current_user') read, which no longer holds anything real). */
const pwSessionPromise = typeof PWAuth !== 'undefined' ? PWAuth.getSession() : Promise.resolve({ user: null });

const AMENITY_ICONS = {
  Water: '💧', Parking: '🚗', Security: '🔒',
  Generator: '⚡', AC: '❄️', Lift: '🛗'
};

const INCOME_MAP = {
  'below50':  600000,
  '50to150':  1200000,
  '150to300': 2700000,
  'above300': 4500000
};

async function init() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { location.href = 'listings.html'; return; }

  PWOverlay.showLoading('Loading listing…');

  const listingRes = await PWApi.request('/api/listings/' + encodeURIComponent(id));

  if (!listingRes.ok && listingRes.status === 0) {
    PWOverlay.showError("Couldn't reach the server. Check your connection and try again.", { retry: init });
    return;
  }
  if (!listingRes.ok) { location.href = 'listings.html'; return; }

  const l = listingRes.data.listing;

  // Best-effort view increment — awaited so the count shown below is accurate, but a failure
  // here shouldn't block viewing the listing (falls back to the count already on `l`).
  const viewRes = await PWApi.request('/api/listings/' + encodeURIComponent(id) + '/view', { method: 'POST' });
  if (viewRes.ok && typeof viewRes.data.views === 'number') l.views = viewRes.data.views;

  const simRes = await PWApi.request('/api/listings/' + encodeURIComponent(id) + '/similar');
  const similar = simRes.ok ? simRes.data.listings : [];

  // Seed the Save button's initial state — only tenants have favourites, so this is skipped
  // (and the button just starts unsaved) for logged-out visitors and landlords.
  const { user } = await pwSessionPromise;
  const favIds = user && user.role === 'tenant' ? await getFavouriteIds() : new Set();

  document.title = `${l.title} — Property Warehouse`;
  document.getElementById('ldetBcTitle').textContent = l.title;

  document.getElementById('ldetBody').innerHTML = buildHTML(l, similar);
  pwDetListingData = l;
  bindEvents(l, favIds.has(l.id));

  PWOverlay.hide();
}

function buildHTML(l, similar) {
  const monthlyAmt = Math.round(l.rentPerYear / 12);

  return `
  <div class="ldet-layout">
    <!-- LEFT -->
    <div class="ldet-left">

      <!-- Gallery -->
      <div class="ldet-gallery">
        <img class="ldet-main-img" id="ldetMainImg" src="${l.images[0]}" alt="${l.title}" />
        <div class="ldet-thumbs">
          ${l.images.map((img, i) => `
            <img class="ldet-thumb${i===0?' active':''}" src="${img}"
              alt="Photo ${i+1}" data-idx="${i}" onclick="swapImg(this, '${img}')" />
          `).join('')}
        </div>
      </div>

      <!-- Property Info -->
      <div class="ldet-card">
        <div class="ldet-badges">
          ${l.isVerified ? '<span class="ldet-badge ldet-badge-verified">🛡️ Verified</span>' : ''}
          ${l.isMonthly  ? '<span class="ldet-badge ldet-badge-monthly">📅 Pay Monthly</span>' : ''}
          <span class="ldet-badge ldet-badge-type">${l.type}</span>
        </div>
        <h1 class="ldet-title">${l.title}</h1>
        <div class="ldet-address">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${l.address}
        </div>
        <div class="ldet-meta">
          <div class="ldet-meta-item">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M4 20V8l8-6 8 6v12"/><rect x="9" y="14" width="6" height="6"/></svg>
            ${l.beds} Bedroom${l.beds > 1 ? 's' : ''}
          </div>
          <div class="ldet-meta-item">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16"/><path d="M4 6V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8"/><path d="M2 20h20v-2a6 6 0 0 0-6-6H8a6 6 0 0 0-6 6v2z"/></svg>
            ${l.baths} Bathroom${l.baths > 1 ? 's' : ''}
          </div>
          <div class="ldet-meta-item">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ${l.views} views
          </div>
        </div>
        <p class="ldet-desc">${l.description}</p>
      </div>

      <!-- Amenities -->
      <div class="ldet-card">
        <h3 style="font-size:13px;font-weight:800;color:#09182a;margin-bottom:14px;letter-spacing:0.5px;text-transform:uppercase">Amenities</h3>
        <div class="ldet-amenities-grid">
          ${l.amenities.map(a => `
            <span class="ldet-amenity-chip">${AMENITY_ICONS[a] || '✓'} ${a}</span>
          `).join('')}
        </div>
      </div>

      <!-- Price Breakdown -->
      <div class="ldet-price-card">
        <h3>Price Breakdown</h3>
        <div class="ldet-price-row">
          <span class="ldet-price-label">Annual Rent</span>
          <span class="ldet-price-val">${formatNaira(l.rentPerYear)}</span>
        </div>
        <div class="ldet-price-row">
          <span class="ldet-price-label">Caution Fee</span>
          <span class="ldet-price-val">${formatNaira(l.cautionFee)}</span>
        </div>
        <div class="ldet-price-row">
          <span class="ldet-price-label">Service Charge</span>
          <span class="ldet-price-val">${formatNaira(l.serviceCharge)}</span>
        </div>
        <hr class="ldet-price-divider" />
        <div class="ldet-total-row">
          <span class="ldet-total-label">Total Move-in</span>
          <span class="ldet-total-val">${formatNaira(l.totalMoveIn)}</span>
        </div>
      </div>

      <!-- Pay Monthly -->
      ${l.isMonthly ? `
      <div class="ldet-monthly-card">
        <h4>📅 Pay Monthly Option Available</h4>
        <p>Instead of ${formatNaira(l.rentPerYear)} upfront, pay
          <span class="ldet-monthly-amt">${formatNaira(monthlyAmt)}</span>/month
          agreed directly with the landlord.
        </p>
      </div>` : ''}

      <!-- Rent Burden Calculator -->
      <div class="ldet-card ldet-calc-card">
        <h4>🧮 Can you afford this?</h4>
        <select class="ldet-calc-select" id="ldetIncomeSelect" onchange="calcBurden(${l.rentPerYear})">
          <option value="">Select your monthly income range</option>
          <option value="below50">Below ₦50,000/month</option>
          <option value="50to150">₦50,000 – ₦150,000/month</option>
          <option value="150to300">₦150,000 – ₦300,000/month</option>
          <option value="above300">Above ₦300,000/month</option>
        </select>
        <div class="ldet-calc-result" id="ldetCalcResult"></div>
      </div>

      <!-- Contact Actions -->
      <div class="pw-detail-actions">
        <a class="pw-wa-btn-sm"
          href="https://wa.me/${l.landlordWhatsApp}?text=${encodeURIComponent('Hello, I am interested in your property "' + l.title + '" listed on Property Warehouse.')}"
          target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          Chat on WhatsApp
        </a>
        <button class="pw-inquiry-btn-sm" onclick="pwToggleDetailChat()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Send Inquiry
        </button>
      </div>

      <!-- Inline chatbox -->
      <div class="pw-chat-panel pw-det-chat" id="pwDetChat">
        <div class="pw-chat-header">
          <span>Message ${l.landlordName.replace(/'/g, "&#39;")}</span>
          <button class="pw-chat-close" onclick="pwToggleDetailChat()" aria-label="Close chatbox">&times;</button>
        </div>
        <div class="pw-chat-fields">
          <input id="pwDetName"  type="text" placeholder="Your name" />
          <input id="pwDetPhone" type="tel"  placeholder="Your phone number" />
          <textarea id="pwDetMsg" rows="3" placeholder="Hi, I'm interested in this property..."></textarea>
        </div>
        <button class="pw-chat-send" onclick="pwSubmitDetailInquiry()">Send Message</button>
        <div class="pw-chat-success" id="pwDetSucc"></div>
      </div>

    </div>

    <!-- RIGHT -->
    <div class="ldet-right">

      <!-- Contact Card -->
      <div class="ldet-contact-card">
        <button class="ldet-save-btn" id="ldetSaveBtn" type="button">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span id="ldetSaveLbl">Save Property</span>
        </button>
        <h3>Interested in this property?</h3>
        <p>Message the landlord directly — no agents.</p>
        <div class="ldet-form-field">
          <label>YOUR NAME</label>
          <input type="text" id="ldetName" placeholder="e.g. Amaka Obi" />
        </div>
        <div class="ldet-form-field">
          <label>YOUR PHONE</label>
          <input type="tel" id="ldetPhone" placeholder="+234 ..." />
        </div>
        <div class="ldet-form-field">
          <label>MESSAGE</label>
          <textarea id="ldetMsg" rows="3"
            placeholder="Hello, I'm interested in this property..."></textarea>
        </div>
        <a class="ldet-wa-btn" id="ldetWaBtn"
          href="https://wa.me/${l.landlordWhatsApp}?text=${encodeURIComponent('Hello '+l.landlordName+', I am interested in '+l.title+' at '+l.address+'.')}"
          target="_blank" rel="noopener" onclick="trackInquiry('${l.id}','${l.title.replace(/'/g,"\\'")}','${l.area}',${l.rentPerYear},'${l.landlordName.replace(/'/g,"\\'")}','${l.landlordWhatsApp}'); showSuccess()">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          Contact via WhatsApp
        </a>
        <div class="ldet-wa-success" id="ldetWaSuccess">
          ✅ Opening WhatsApp — your message is ready to send!
        </div>
      </div>

      <!-- Landlord Card -->
      <div class="ldet-card">
        <div class="ldet-ll-label">Listed By</div>
        <div class="ldet-ll-name">${l.landlordName}</div>
        <div class="ldet-ll-meta">
          Member since ${l.landlordSince}<br>
          ${l.landlordListings} active listing${l.landlordListings > 1 ? 's' : ''}
        </div>
        ${l.landlordVerified ? `<span class="ldet-ll-verified">🛡️ Verified Landlord</span>` : ''}
      </div>

      <!-- Similar Properties -->
      ${similar.length ? `
      <div>
        <div class="ldet-similar-title">Similar in ${l.area}</div>
        <div class="ldet-sim-cards">
          ${similar.map(s => `
            <a class="ldet-sim-card" href="listing-detail.html?id=${s.id}">
              <img class="ldet-sim-img" src="${s.images[0]}" alt="${s.title}" />
              <div class="ldet-sim-info">
                <div class="ldet-sim-name">${s.title}</div>
                <div class="ldet-sim-area">${s.area}</div>
                <div class="ldet-sim-price">${formatNaira(s.rentPerYear)}/yr</div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>` : ''}

    </div>
  </div>`;
}

function swapImg(thumb, src) {
  document.getElementById('ldetMainImg').src = src;
  document.querySelectorAll('.ldet-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function calcBurden(rentPerYear) {
  const sel = document.getElementById('ldetIncomeSelect').value;
  const res = document.getElementById('ldetCalcResult');
  if (!sel) { res.className = 'ldet-calc-result'; return; }

  const annualIncome = INCOME_MAP[sel];
  const ratio = rentPerYear / annualIncome;

  if (ratio <= 0.30) {
    res.className = 'ldet-calc-result green';
    res.innerHTML = '✅ <strong>Affordable</strong> — This rent is within 30% of your estimated income. A healthy range.';
  } else if (ratio <= 0.50) {
    res.className = 'ldet-calc-result yellow';
    res.innerHTML = '⚠️ <strong>You\'ll feel stretched</strong> — This rent takes 30–50% of your income. Manage expenses carefully.';
  } else {
    res.className = 'ldet-calc-result red';
    res.innerHTML = '🚨 <strong>High Burden</strong> — This rent exceeds 50% of your estimated income. Consider lower-priced options.';
  }
}

function showSuccess() {
  setTimeout(() => {
    const s = document.getElementById('ldetWaSuccess');
    if (s) { s.classList.add('show'); }
  }, 400);
}

function trackInquiry(id, title, area, rent, landlordName, landlordWhatsApp) {
  try {
    const name  = document.getElementById('ldetName')?.value.trim()  || '';
    const phone = document.getElementById('ldetPhone')?.value.trim() || '';
    addInquiry({ listingId: id, listingTitle: title, area, rentPerYear: rent, landlordName, landlordWhatsApp, tenantName: name, tenantPhone: phone });
  } catch(e) {}
}

function bindEvents(l, initiallySaved) {
  document.getElementById('ldetMenuBtn').addEventListener('click', () =>
    document.getElementById('ldetDrawer').classList.toggle('open'));

  const saveBtn = document.getElementById('ldetSaveBtn');
  if (saveBtn) {
    let saved = initiallySaved;
    const updateSaveBtn = () => {
      saveBtn.classList.toggle('saved', saved);
      document.getElementById('ldetSaveLbl').textContent = saved ? 'Saved' : 'Save Property';
    };
    updateSaveBtn();
    saveBtn.addEventListener('click', async () => {
      // Disabled synchronously, before the first await, so a second rapid click can't start a
      // concurrent handler invocation racing this one on the shared `saved` variable — a
      // disabled button doesn't dispatch click events at all, native or synthetic.
      saveBtn.disabled = true;

      const { user } = await pwSessionPromise;
      if (!user || user.role !== 'tenant') {
        saveBtn.disabled = false;
        alert('Please log in as a tenant to save listings.');
        location.href = 'auth.html';
        return;
      }
      const res = saved ? await unsaveFavourite(l.id) : await saveFavourite(l.id);
      saveBtn.disabled = false;
      if (!res.ok) {
        alert(res.error === 'network' ? "Couldn't reach the server. Please try again." : 'Something went wrong. Please try again.');
        return;
      }
      saved = !saved;
      updateSaveBtn();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

/* ── Inline chatbox (detail page) ── */
let pwDetChatOpen = false;

async function pwToggleDetailChat() {
  const panel = document.getElementById('pwDetChat');
  if (!panel) return;
  pwDetChatOpen = !pwDetChatOpen;
  panel.classList.toggle('pw-open', pwDetChatOpen);
  if (pwDetChatOpen) {
    const { user } = await pwSessionPromise;
    if (user) {
      const nameEl  = document.getElementById('pwDetName');
      const phoneEl = document.getElementById('pwDetPhone');
      if (nameEl)  nameEl.value  = ((user.firstName || '') + ' ' + (user.lastName || '')).trim();
      if (phoneEl) phoneEl.value = user.phone || '';
    }
  }
}

function pwSubmitDetailInquiry() {
  const l = pwDetListingData;
  if (!l) return;

  const name    = (document.getElementById('pwDetName')?.value  || '').trim();
  const phone   = (document.getElementById('pwDetPhone')?.value || '').trim();
  const message = (document.getElementById('pwDetMsg')?.value   || '').trim();
  const succEl  = document.getElementById('pwDetSucc');

  if (!name || !phone || !message) {
    alert('Please fill in your name, phone number, and a message.');
    return;
  }

  addInquiry({ listingId: l.id, listingTitle: l.title, landlordName: l.landlordName, area: l.area, senderName: name, senderPhone: phone, message });

  if (succEl) succEl.textContent = '✅ Message sent! The landlord will contact you shortly.';

  setTimeout(function () {
    const panel = document.getElementById('pwDetChat');
    if (panel) { panel.classList.remove('pw-open'); pwDetChatOpen = false; }
    if (succEl) succEl.textContent = '';
    const nameEl  = document.getElementById('pwDetName');
    const phoneEl = document.getElementById('pwDetPhone');
    const msgEl   = document.getElementById('pwDetMsg');
    if (nameEl)  nameEl.value  = '';
    if (phoneEl) phoneEl.value = '';
    if (msgEl)   msgEl.value   = '';
  }, 3000);
}
