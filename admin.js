/* ══════════════════════════════════════════════════
   ADMIN DASHBOARD JS — Property Warehouse
   All logic for the admin panel
══════════════════════════════════════════════════ */

/* ── Constants ──
   ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_CREDS_KEY/ADMIN_KEY used to live here and back a purely
   client-side login check. The admin account (and its password hash) now lives in the
   backend's database, seeded from backend/.env — see /api/auth/admin/login below. */
const ADMIN_LOG_KEY  = 'pw_admin_log';
const SETTINGS_KEY   = 'pw_admin_settings';
const DEMO_MODE_KEY  = 'pw_demo_mode';
const MAINT_KEY      = 'pw_maintenance_mode';
const ANN_KEY        = 'pw_announcements';

/* ── Default platform settings ── */
const DEFAULT_SETTINGS = {
  minListingPrice: 150000,
  maxPhotosPerListing: 10,
  freeTierListingLimit: 1,
  transactionFeePercent: 3,
  verifiedBadgeFee: 15000,
  inquiryRateLimit: 20
};

/* ── Avatar colours ── */
const AVATAR_COLORS = ['#2ecc71','#3498db','#9b59b6','#e67e22','#e74c3c','#1abc9c','#c9a84c','#0a1628'];
function avatarColor(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(first, last) { return ((first||'').charAt(0) + (last||'').charAt(0)).toUpperCase() || '?'; }

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
function admFmt(n) { return '₦' + Number(n||0).toLocaleString('en-NG'); }
function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  if (d < 30) return d + 'd ago';
  return Math.floor(d/30) + 'mo ago';
}
function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-NG', {day:'numeric',month:'short',year:'numeric'}); }
  catch { return iso; }
}
function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function $(id) { return document.getElementById(id); }

function admShowToast(msg, type='') {
  const t = $('admToast');
  t.textContent = msg;
  t.className = 'adm-toast' + (type ? ' ' + type : '');
  requestAnimationFrame(() => { t.style.transform = 'translateX(-50%) translateY(0)'; });
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(80px)'; }, 3000);
}

function admLogAction(action, section, details='') {
  const log = JSON.parse(localStorage.getItem(ADMIN_LOG_KEY) || '[]');
  log.unshift({ action, section, details, user: 'Technology Integration Group', time: new Date().toISOString() });
  if (log.length > 200) log.length = 200;
  localStorage.setItem(ADMIN_LOG_KEY, JSON.stringify(log));
}

/* ══════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════ */
// Auto-login if a valid admin session cookie already exists (was a synchronous localStorage
// read before the backend existed — now an async /api/auth/me check). A network failure here
// just leaves the login form showing, which is already a safe, usable default state.
async function admCheckAuth() {
  const { user, networkError } = await PWAuth.getSession();
  if (networkError) {
    console.warn('Could not reach the backend to check for an existing admin session.');
    return;
  }
  if (user && user.role === 'admin') {
    showDashboard(user);
  }
}

function showDashboard(admin) {
  $('admLoginOverlay').classList.add('hidden');
  $('admDashboard').classList.remove('hidden');
  const name = admin.name || 'Technology Integration Group';
  const parts = name.split(' ');
  const inits = initials(parts[0], parts[1]);
  $('sidebarAvatar').innerHTML = inits + '<span class="adm-online-dot"></span>';
  $('sidebarAdminName').textContent = name;
  $('admHeaderAvatar').textContent = inits;
  $('admHeaderName').textContent = name;
  initDashboard();
}

$('admLoginBtn').addEventListener('click', doLogin);
$('admLoginPassword').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

async function doLogin() {
  const email = $('admLoginEmail').value.trim();
  const pwd   = $('admLoginPassword').value;
  const err   = $('admLoginError');
  const btn   = $('admLoginBtn');

  btn.disabled = true;
  const res = await PWAuth.adminLogin({ email, password: pwd });
  btn.disabled = false;

  if (res.ok) {
    admLogAction('Admin login', 'Auth', 'Login from ' + email);
    err.style.display = 'none';
    showDashboard(res.data.user);
  } else {
    err.textContent = res.error === 'network'
      ? "Couldn't reach the server. Please try again."
      : 'Invalid admin credentials.';
    err.style.display = 'block';
  }
}

$('admLogoutBtn').addEventListener('click', async () => {
  admLogAction('Admin logout', 'Auth');
  await PWAuth.logout();
  location.reload();
});

/* ══════════════════════════════════════════════════
   DEMO MODE
══════════════════════════════════════════════════ */
let isDemoMode = sessionStorage.getItem(DEMO_MODE_KEY) === '1';

function updateDemoToggleUI() {
  const toggle = $('admDemoToggle');
  const banner = $('admDemoBanner');
  if (isDemoMode) {
    toggle.classList.add('demo-on');
    banner.classList.add('visible');
  } else {
    toggle.classList.remove('demo-on');
    banner.classList.remove('visible');
  }
}

$('admDemoToggle').addEventListener('click', () => {
  isDemoMode = !isDemoMode;
  sessionStorage.setItem(DEMO_MODE_KEY, isDemoMode ? '1' : '0');
  updateDemoToggleUI();
  refreshCurrentSection();
  admShowToast(isDemoMode ? 'Demo Mode ON — showing sample data' : 'Demo Mode OFF — showing real data');
});

/* ── Data access (real vs demo) ── */
function getData(key, fallback=[]) {
  if (isDemoMode) {
    const demoMap = {
      'users_tenants':    DEMO_DATA.users.tenants,
      'users_landlords':  DEMO_DATA.users.landlords,
      'listings':         DEMO_DATA.listings,
      'inquiries':        DEMO_DATA.inquiries,
      'feedback':         DEMO_DATA.feedback,
      'verification':     DEMO_DATA.verificationRequests,
      'verif_history':    DEMO_DATA.verificationHistory,
      'finance_txn':      DEMO_DATA.finance.transactions,
      'activity_log':     DEMO_DATA.activityLog,
      'recent_signups':   DEMO_DATA.recentSignups,
      'announcements':    []
    };
    return demoMap[key] !== undefined ? demoMap[key] : fallback;
  }
  // Real data
  const realMap = {
    'users_tenants': () => {
      const all = [];
      try {
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('pw_tenant_') || k === 'pw_tenant') {
            const u = JSON.parse(localStorage.getItem(k)||'null');
            if (u && u.email) all.push({...u, id: u.email, role:'tenant', status: u.status||'active'});
          }
        });
        // also check pw_tenant directly
        const t = JSON.parse(localStorage.getItem('pw_tenant')||'null');
        if (t && t.email && !all.find(x=>x.email===t.email)) all.push({...t, id:t.email, role:'tenant', status:t.status||'active'});
      } catch(e){}
      return all;
    },
    'users_landlords': () => {
      const all = [];
      try {
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('pw_landlord_') || k === 'pw_landlord') {
            const u = JSON.parse(localStorage.getItem(k)||'null');
            if (u && u.email) all.push({...u, id:u.email, role:'landlord', status:u.status||'active'});
          }
        });
        const l = JSON.parse(localStorage.getItem('pw_landlord')||'null');
        if (l && l.email && !all.find(x=>x.email===l.email)) all.push({...l, id:l.email, role:'landlord', status:l.status||'active'});
      } catch(e){}
      return all;
    },
    'listings':       () => JSON.parse(localStorage.getItem('pw_listings') || '[]'),
    'inquiries':      () => JSON.parse(localStorage.getItem('pw_inquiries') || '[]'),
    'feedback':       () => JSON.parse(localStorage.getItem('pw_feedback') || '[]'),
    'verification':   () => JSON.parse(localStorage.getItem('pw_verification_requests') || '[]'),
    'verif_history':  () => JSON.parse(localStorage.getItem('pw_verif_history') || '[]'),
    'finance_txn':    () => JSON.parse(localStorage.getItem('pw_finance_transactions') || '[]'),
    'activity_log':   () => JSON.parse(localStorage.getItem(ADMIN_LOG_KEY) || '[]'),
    'announcements':  () => JSON.parse(localStorage.getItem(ANN_KEY) || '[]'),
    'recent_signups': () => {
      const tenants = getData('users_tenants', []).map(u=>({...u, role:'Tenant'}));
      const landlords = getData('users_landlords', []).map(u=>({...u, role:'Landlord'}));
      return [...tenants, ...landlords]
        .sort((a,b) => new Date(b.joinDate||b.createdAt||0) - new Date(a.joinDate||a.createdAt||0))
        .slice(0, 5).map(u => ({
          initials: initials(u.firstName||u.name||'?', u.lastName||''),
          firstName: u.firstName||u.name||'User', lastName: u.lastName||'',
          email: u.email, role: u.role,
          time: u.joinDate||u.createdAt||new Date().toISOString()
        }));
    }
  };
  if (realMap[key]) {
    try { return realMap[key](); } catch(e) { return fallback; }
  }
  return fallback;
}

/* ══════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════ */
const SECTION_META = {
  overview:      { title: 'Overview',           subtitle: "Welcome back. Here's what's happening on your platform." },
  users:         { title: 'Users',              subtitle: 'Manage all tenant and landlord accounts on the platform.' },
  listings:      { title: 'Listings',           subtitle: 'Review, approve, and manage all property listings.' },
  inquiries:     { title: 'Inquiries',          subtitle: 'Manage and respond to all property inquiries.' },
  feedback:      { title: 'Feedback & Complaints', subtitle: 'Review and respond to user feedback and complaints.' },
  verification:  { title: 'Verification Queue', subtitle: 'Review and approve landlord verification requests.' },
  finance:       { title: 'Finance',            subtitle: 'Track revenue, transactions, payouts, and financial health.' },
  analytics:     { title: 'Analytics',          subtitle: 'Track platform performance, user behavior, and business intelligence.' },
  announcements: { title: 'Announcements',      subtitle: 'Create and manage platform-wide announcements.' },
  settings:      { title: 'Settings',           subtitle: 'Manage platform configuration, security, and preferences.' }
};

let currentSection = 'overview';

function admNavigateTo(section) {
  document.querySelectorAll('.adm-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.section === section);
  });
  document.querySelectorAll('.adm-section').forEach(el => {
    el.classList.toggle('active', el.id === 'section' + section.charAt(0).toUpperCase() + section.slice(1));
  });
  currentSection = section;
  const meta = SECTION_META[section] || {};
  $('admPageTitle').textContent = meta.title || section;
  $('admPageSubtitle').textContent = meta.subtitle || '';
  $('admPageContent').scrollTop = 0;
  renderSection(section);
  // Close sidebar on mobile
  $('admSidebar').classList.remove('open');
  $('admSidebarOverlay').classList.remove('open');
}

document.querySelectorAll('.adm-nav-item').forEach(btn => {
  btn.addEventListener('click', () => admNavigateTo(btn.dataset.section));
});

function refreshCurrentSection() {
  renderSection(currentSection);
}

/* ══════════════════════════════════════════════════
   SIDEBAR MOBILE TOGGLE
══════════════════════════════════════════════════ */
$('admHamburger').addEventListener('click', () => {
  $('admSidebar').classList.toggle('open');
  $('admSidebarOverlay').classList.toggle('open');
});
$('admSidebarOverlay').addEventListener('click', () => {
  $('admSidebar').classList.remove('open');
  $('admSidebarOverlay').classList.remove('open');
});

/* ══════════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════════ */
function buildNotifications() {
  const items = [
    { icon: 'home', text: 'New listing submitted for approval', time: '2h ago', color: '#c9a84c', section: 'listings' },
    { icon: 'alert', text: 'New complaint received — Amaka Nwosu', time: '3h ago', color: '#e74c3c', section: 'feedback' },
    { icon: 'shield', text: 'Verification request from Chioma Eze', time: '5h ago', color: '#3b82f6', section: 'verification' },
    { icon: 'dollar', text: 'Pending payout of ₦380,000 awaiting', time: '1d ago', color: '#2ecc71', section: 'finance' }
  ];
  let html = '';
  items.forEach(n => {
    html += `<div class="adm-notif-item" onclick="admNavigateTo('${n.section}')">
      <div class="adm-notif-icon" style="background:${n.color}20;">
        <svg viewBox="0 0 24 24" fill="none" stroke="${n.color}" stroke-width="2">
          ${n.icon==='home'?'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>':
            n.icon==='alert'?'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>':
            n.icon==='shield'?'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>':
            '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'}
        </svg>
      </div>
      <div>
        <div class="adm-notif-text">${escHtml(n.text)}</div>
        <div class="adm-notif-time">${n.time}</div>
      </div>
    </div>`;
  });
  $('admNotifList').innerHTML = html;
}

$('admNotifBtn').addEventListener('click', e => {
  e.stopPropagation();
  $('admNotifDropdown').classList.toggle('open');
});
$('admMarkAllRead').addEventListener('click', () => {
  $('admNotifCount').textContent = '0';
  $('admNotifDropdown').classList.remove('open');
  admShowToast('All notifications marked as read');
});
document.addEventListener('click', e => {
  if (!e.target.closest('#admNotifBtn') && !e.target.closest('#admNotifDropdown'))
    $('admNotifDropdown').classList.remove('open');
  if (!e.target.closest('#admProfileChip'))
    $('admProfileDropdown').classList.remove('open');
});
$('admProfileChip').addEventListener('click', e => {
  e.stopPropagation();
  $('admProfileDropdown').classList.toggle('open');
});

/* ══════════════════════════════════════════════════
   SIDEBAR BADGES
══════════════════════════════════════════════════ */
// Shared real (non-demo) admin listings fetch, used by the nav badge, table, and sidebar.
// Returns { ok, listings, error } so callers needing a retry UI (the table) can distinguish
// "fetch failed" from "zero listings", while callers that just want a best-effort count (the
// nav badge, sidebar chart) can treat a failure as "0" via the `listings` array.
async function fetchAdminListings() {
  const res = await PWApi.request('/api/admin/listings');
  return { ok: res.ok, listings: res.ok ? res.data.listings : [], error: res.error };
}

async function updateNavBadges() {
  const tenants   = getData('users_tenants', []);
  const landlords = getData('users_landlords', []);
  const listings  = isDemoMode ? DEMO_DATA.listings : (await fetchAdminListings()).listings;
  const feedback  = getData('feedback', []);
  const verif     = getData('verification', []);

  const totalUsers   = tenants.length + landlords.length;
  const pendingCount = listings.filter(l => l.status === 'pending').length;
  const newFeedback  = feedback.filter(f => f.status === 'new' || !f.status).length;
  const verifCount   = verif.filter(v => v.status === 'pending').length;

  $('navBadgeUsers').textContent    = isDemoMode ? '248' : totalUsers;
  $('navBadgeListings').textContent = isDemoMode ? '12 pending' : (pendingCount ? pendingCount + ' pending' : '0');
  $('navBadgeFeedback').textContent = isDemoMode ? '7' : (newFeedback || '0');
  $('navBadgeVerif').textContent    = isDemoMode ? '5' : (verifCount || '0');

  if (!pendingCount && !isDemoMode) $('navBadgeListings').classList.add('hidden');
  else $('navBadgeListings').classList.remove('hidden');
}

/* ══════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════ */
function initTabGroup(tabsEl, tabContentsParent) {
  if (!tabsEl) return;
  tabsEl.querySelectorAll('.adm-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.adm-tab-content').forEach(c => {
        c.classList.toggle('active', c.id === btn.dataset.tab);
      });
      if (btn.dataset.tab === 'tabTenants') renderTenantsTable();
      if (btn.dataset.tab === 'tabLandlords') renderLandlordsTable();
    });
  });
}

function initSubTabGroup(containerId) {
  const cont = $(containerId);
  if (!cont) return;
  cont.querySelectorAll('.adm-sub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      cont.querySelectorAll('.adm-sub-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.adm-sub-tab-content').forEach(c => {
        c.classList.toggle('active', c.id === btn.dataset.subtab);
      });
      renderSubTab(btn.dataset.subtab);
    });
  });
}

function renderSubTab(id) {
  if (id === 'financeOverview')       renderFinanceOverview();
  if (id === 'financeTransactions')   renderTransactionsTable();
  if (id === 'financeListingFees')    renderListingFees();
  if (id === 'financePayouts')        renderPayouts();
  if (id === 'financeBadges')         renderBadges();
  if (id === 'financeReferrals')      renderReferrals();
  if (id === 'financeDisputes')       renderDisputes();
  if (id === 'analyticsOverview')     renderAnalyticsOverview();
  if (id === 'analyticsUsers')        renderUserAnalytics();
  if (id === 'analyticsListings')     renderListingAnalytics();
  if (id === 'analyticsFinancial')    renderFinancialAnalytics();
  if (id === 'analyticsConversion')   renderConversionAnalytics();
}

/* ══════════════════════════════════════════════════
   RENDER SECTION DISPATCHER
══════════════════════════════════════════════════ */
function renderSection(section) {
  if (section === 'overview')      renderOverview();
  if (section === 'users')        { renderTenantsTable(); renderLandlordsTable(); renderUsersSidebar(); }
  if (section === 'listings')     { renderListingsTable(); renderListingsSidebar(); }
  if (section === 'inquiries')    { renderInquiriesTable(); renderInquiriesSidebar(); }
  if (section === 'feedback')     { renderFeedbackGrid(); renderFeedbackSidebar(); }
  if (section === 'verification') renderVerification();
  if (section === 'finance')      renderFinanceOverview();
  if (section === 'analytics')    renderAnalyticsOverview();
  if (section === 'announcements') renderAnnouncements();
  if (section === 'settings')     renderSettings();
}

/* ══════════════════════════════════════════════════
   OVERVIEW
══════════════════════════════════════════════════ */
function renderOverview() {
  const listings  = isDemoMode ? DEMO_DATA.listings : JSON.parse(localStorage.getItem('pw_listings')||'[]');
  const inquiries = getData('inquiries', []);
  const feedback  = getData('feedback', []);
  const tenants   = getData('users_tenants', []);
  const landlords = getData('users_landlords', []);

  const totalUsers     = isDemoMode ? 1842 : tenants.length + landlords.length;
  const activeListings = isDemoMode ? 347  : listings.filter(l=>l.status==='active'||!l.status).length;
  const totalInq       = isDemoMode ? 4291 : inquiries.length;
  const revenue        = isDemoMode ? 8450000 : 0;
  const complaints     = isDemoMode ? 7 : feedback.filter(f=>f.type==='complaint'&&(f.status==='new'||!f.status)).length;

  const stats = [
    { label:'Total Users',       value: totalUsers.toLocaleString(),    trend:'+124 this week',    icon: usersIcon(),    trendClass:'up' },
    { label:'Active Listings',   value: activeListings.toLocaleString(),trend:'+23 from last month',icon: homeIcon(),    trendClass:'up' },
    { label:'Total Inquiries',   value: totalInq.toLocaleString(),      trend:'+18% this week',    icon: msgIcon(),     trendClass:'up' },
    { label:'Platform Revenue',  value: admFmt(revenue),                trend:'+22% this month',   icon: dollarIcon(),  trendClass:'up' },
    { label:'Open Complaints',   value: complaints.toString(),          trend: isDemoMode?'3 urgent':'', icon: alertIcon(), trendClass:'down' }
  ];

  $('overviewStats').innerHTML = stats.map(s => `
    <div class="adm-stat-card">
      <div class="adm-stat-icon">${s.icon}</div>
      <div class="adm-stat-label">${s.label}</div>
      <div class="adm-stat-value">${escHtml(s.value)}</div>
      ${s.trend ? `<div class="adm-stat-trend ${s.trendClass}"><span>${s.trendClass==='up'?'↑':'↓'}</span>${escHtml(s.trend)}</div>` : ''}
    </div>`).join('');

  // Chart
  renderActivityChart();

  // Top areas
  const areas = isDemoMode ? DEMO_DATA.analytics.inquiriesByArea :
    (() => {
      const map = {};
      listings.forEach(l => { map[l.area||'Other'] = (map[l.area||'Other']||0) + (l.inquiries||0); });
      inquiries.forEach(i => { map[i.area||i.listingArea||'Other'] = (map[i.area||i.listingArea||'Other']||0) + 1; });
      return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([area,count])=>({area,count}));
    })();
  const maxArea = areas.reduce((m,a)=>Math.max(m,a.count),1);
  $('topAreasList').innerHTML = areas.map((a,i) => `
    <li class="adm-rank-item">
      <span class="adm-rank-num">${i+1}</span>
      <span class="adm-rank-area">${escHtml(a.area)}</span>
      <div class="adm-rank-bar-wrap"><div class="adm-progress"><div class="adm-progress-bar" style="width:${(a.count/maxArea*100).toFixed(0)}%"></div></div></div>
      <span class="adm-rank-count">${a.count.toLocaleString()}</span>
    </li>`).join('');

  // Recent signups
  const signups = getData('recent_signups', []);
  $('recentSignupsList').innerHTML = signups.length ? signups.map(s => `
    <div class="adm-recent-signup-item">
      <div class="adm-avatar" style="background:${avatarColor(s.firstName)}">${escHtml(initials(s.firstName,s.lastName))}</div>
      <div>
        <div class="adm-name">${escHtml(s.firstName+' '+s.lastName)}</div>
        <div class="adm-email">${escHtml(s.email||'')}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;">
        <span class="adm-badge ${s.role==='Landlord'?'gold':'blue'}">${escHtml(s.role)}</span>
        <span class="adm-time">${timeAgo(s.time)}</span>
      </div>
    </div>`).join('') : '<div class="adm-empty"><p>No signups yet</p></div>';

  // Pending listings
  const pending = isDemoMode ? DEMO_DATA.listings.filter(l=>l.status==='pending') :
    JSON.parse(localStorage.getItem('pw_listings')||'[]').filter(l=>l.status==='pending');
  $('pendingListingsList').innerHTML = pending.slice(0,3).map(l => `
    <div class="adm-pending-card" id="pcard-${escHtml(l.id)}">
      <img src="${escHtml(l.images&&l.images[0]||'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=60')}" class="adm-pending-thumb" onerror="this.style.background='#f0f2f5';this.src=''">
      <div class="adm-pending-info">
        <div class="adm-ptitle">${escHtml(l.title||'Listing')}</div>
        <div class="adm-plandlord">Landlord: ${escHtml(l.landlordName||'Unknown')}</div>
        <div class="adm-pprice">${admFmt(l.rentPerYear)} /yr</div>
        <div class="adm-pending-actions">
          <button class="adm-btn adm-btn-green adm-btn-sm" onclick="approveListing('${escHtml(l.id)}')">Approve</button>
          <button class="adm-btn adm-btn-red adm-btn-sm" onclick="rejectListing('${escHtml(l.id)}')">Reject</button>
        </div>
      </div>
    </div>`).join('') || '<div class="adm-empty"><p>No listings pending approval</p></div>';

  if (pending.length === 0) $('pendingListingsList').innerHTML = '<div class="adm-empty"><p style="font-size:13px;color:var(--adm-text-muted);">No listings pending approval 🎉</p></div>';

  // Recent feedback
  const fb = getData('feedback', []).slice(0, 3);
  $('recentFeedbackList').innerHTML = fb.length ? fb.map(f => `
    <div class="adm-feedback-card">
      <div class="adm-feedback-card-header">
        <span class="adm-badge ${f.type==='complaint'?'red':f.type==='suggestion'?'orange':'blue'}">${escHtml((f.type||'feedback').charAt(0).toUpperCase()+(f.type||'feedback').slice(1))}</span>
        <span style="font-size:13px;font-weight:600;">${escHtml(f.name||'Anonymous')}</span>
        <span style="font-size:11.5px;color:var(--adm-text-muted);margin-left:auto;">${timeAgo(f.sentAt)}</span>
      </div>
      <div class="adm-preview">${escHtml((f.message||'').slice(0,100))}${(f.message||'').length>100?'...':''}</div>
      <button class="adm-view-link" onclick="admNavigateTo('feedback')">View →</button>
    </div>`).join('') : '<div class="adm-empty"><p style="font-size:13px;color:var(--adm-text-muted);">No feedback yet</p></div>';

  // Activity log
  const log = getData('activity_log', []).slice(0, 5);
  $('activityLogList').innerHTML = log.length ? log.map(l => `
    <div class="adm-activity-item">
      <div class="adm-activity-icon" style="background:#f0f2f5;">
        ${activityIconSvg(l.icon||l.type)}
      </div>
      <div class="adm-activity-info">
        <span class="adm-act-type">${escHtml(l.type||l.action||'Action')}</span>
        <span class="adm-act-details"> — ${escHtml(l.details||l.description||'')}</span>
        <div class="adm-act-user" style="font-size:11.5px;margin-top:2px;">${escHtml(l.user||'')}${l.user?' · ':''}<span style="color:var(--adm-text-muted);">${timeAgo(l.time)}</span></div>
      </div>
    </div>`).join('') : '<div class="adm-empty"><p>No activity yet</p></div>';

  // Storage
  const usedBytes = new Blob(Object.keys(localStorage).map(k=>localStorage.getItem(k))).size;
  const limitKB = 5120;
  const usedKB = Math.round(usedBytes/1024);
  const pct = Math.min(100, Math.round(usedKB/limitKB*100));
  $('storageUsageLabel').textContent = usedKB + ' KB used of ~5 MB';
  $('storageUsageBar').style.width = pct + '%';

  // Platform summary
  const sumData = isDemoMode ? DEMO_DATA.stats : {
    totalTenants: tenants.length, totalLandlords: landlords.length,
    verifiedListings: listings.filter(l=>l.isVerified).length,
    totalReviews: 0, avgResponseTime: 'N/A', platformUptime: '99.9%'
  };
  const summaryItems = [
    { icon: usersIcon(), label:'Total Tenants',      value: sumData.totalTenants?.toLocaleString(),    trend: isDemoMode?'↑15 this week':'' },
    { icon: homeIcon(),  label:'Total Landlords',    value: sumData.totalLandlords?.toLocaleString(),  trend: isDemoMode?'↑8 this week':'' },
    { icon: shieldIcon(),label:'Verified Listings',  value: sumData.verifiedListings?.toLocaleString(),trend: isDemoMode?'↑12 this month':'' },
    { icon: starIcon(),  label:'Total Reviews',      value: sumData.totalReviews?.toLocaleString(),    trend: isDemoMode?'↑20 this month':'' },
    { icon: clockIcon(), label:'Avg Response Time',  value: sumData.avgResponseTime,                   trend: isDemoMode?'↑15% faster':'' },
    { icon: activityIcon(),label:'Platform Uptime',  value: sumData.platformUptime,                    trend: 'Excellent' }
  ];
  $('platformSummary').innerHTML = summaryItems.map(s => `
    <div class="adm-summary-item">
      <div class="adm-sum-icon">${s.icon}</div>
      <div class="adm-sum-value">${escHtml(s.value||'0')}</div>
      <div class="adm-sum-label">${escHtml(s.label)}</div>
      ${s.trend ? `<div class="adm-sum-trend">${escHtml(s.trend)}</div>` : ''}
    </div>`).join('');

  // Maintenance toggle state
  const maintOn = localStorage.getItem(MAINT_KEY) === '1';
  const qt = $('quickMaintToggle');
  if (qt) qt.className = 'adm-toggle' + (maintOn ? ' on' : '');
}

/* ── Activity Chart ── */
let chartActivity = null;
function renderActivityChart() {
  const ctx = $('chartPlatformActivity');
  if (!ctx) return;
  const labels = isDemoMode ? ['Dec','Jan','Feb','Mar','Apr','May'] : ['Jan','Feb','Mar','Apr','May','Jun'];
  const newUsers   = isDemoMode ? [1100,1300,1600,1900,2200,2600] : [2,4,3,6,5,8];
  const newListings= isDemoMode ? [180,220,260,290,320,347]        : [1,2,2,3,4,5];
  const newInqs    = isDemoMode ? [2100,2600,3100,3600,3900,4291]  : [3,6,5,9,8,12];
  if (chartActivity) { chartActivity.destroy(); chartActivity=null; }
  chartActivity = new Chart(ctx, {
    type:'line',
    data:{labels, datasets:[
      {label:'New Users', data:newUsers, borderColor:'#0a1628', backgroundColor:'rgba(10,22,40,0.05)', tension:.4, fill:false},
      {label:'Listings', data:newListings, borderColor:'#c9a84c', backgroundColor:'rgba(201,168,76,0.05)', tension:.4, fill:false},
      {label:'Inquiries', data:newInqs, borderColor:'#2ecc71', backgroundColor:'rgba(46,204,113,0.05)', tension:.4, fill:false}
    ]},
    options:{responsive:true, plugins:{legend:{position:'top',labels:{boxWidth:12,font:{size:11}}}}, scales:{y:{beginAtZero:true, grid:{color:'rgba(0,0,0,0.04)'}}, x:{grid:{display:false}}}}
  });
}

/* ══════════════════════════════════════════════════
   USERS
══════════════════════════════════════════════════ */
let tenantPage = 1, landlordPage = 1;
const PER_PAGE = 8;

function renderTenantsTable() {
  const all = getData('users_tenants', []);
  const search = ($('tenantSearch')||{}).value?.toLowerCase()||'';
  const areaF  = ($('tenantAreaFilter')||{}).value||'';
  let filtered = all.filter(u => {
    if (search && !`${u.firstName}${u.lastName}${u.email}${u.phone}`.toLowerCase().includes(search)) return false;
    if (areaF && (u.area||'').toLowerCase() !== areaF.toLowerCase()) return false;
    return true;
  });
  // Area filter options
  const areas = [...new Set(all.map(u=>u.area).filter(Boolean))].sort();
  const aFilter = $('tenantAreaFilter');
  if (aFilter && aFilter.options.length <= 1) {
    areas.forEach(a => { const o=document.createElement('option'); o.value=a; o.textContent=a; aFilter.appendChild(o); });
  }
  const start = (tenantPage-1)*PER_PAGE;
  const page = filtered.slice(start, start+PER_PAGE);
  const tbody = $('tenantsTableBody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML=`<tr><td colspan="9"><div class="adm-empty"><p>No tenants found</p></div></td></tr>`; return; }
  tbody.innerHTML = page.map(u => `
    <tr>
      <td><div class="adm-user-cell"><div class="adm-avatar" style="background:${avatarColor((u.firstName||'')+u.lastName||'')}; font-size:11px;">${escHtml(initials(u.firstName||u.name,u.lastName))}</div><div><div class="adm-uname">${escHtml((u.firstName||u.name||'')+' '+(u.lastName||''))}</div></div></div></td>
      <td class="adm-f12 adm-text-muted">${escHtml(u.email||'—')}</td>
      <td class="adm-f12">${escHtml(u.phone||'—')}</td>
      <td class="adm-f12">${escHtml(u.area||'—')}</td>
      <td class="adm-f12">${escHtml(u.budgetRange||'—')}</td>
      <td class="adm-f12">${fmtDate(u.joinDate||u.createdAt)}</td>
      <td class="adm-f12">${(u.savedListings||0)}</td>
      <td><span class="adm-badge ${u.status==='suspended'?'red':u.status==='pending'?'orange':'green'}">${escHtml(u.status||'active')}</span></td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="adm-btn-icon" title="View" onclick="showUserPanel('${escHtml(u.email||u.id)}','tenant')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
          <button class="adm-btn-icon" title="Suspend" onclick="toggleUserStatus('${escHtml(u.email||u.id)}','tenant','${u.status==='suspended'?'active':'suspended'}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></button>
          <button class="adm-btn-icon" title="Delete" onclick="deleteUser('${escHtml(u.email||u.id)}','tenant')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
        </div>
      </td>
    </tr>`).join('');
  renderPagination('tenantsPagination', filtered.length, tenantPage, PER_PAGE, p => { tenantPage=p; renderTenantsTable(); });

  // Stats
  const active = all.filter(u=>u.status!=='suspended').length;
  const susp   = all.filter(u=>u.status==='suspended').length;
  const newThisMonth = all.filter(u=>{ const d=new Date(u.joinDate||u.createdAt||0); const n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); }).length;
  $('tenantStats').innerHTML = makeStats([
    {label:'Total Tenants', value:isDemoMode?1245:all.length, trend:isDemoMode?'↑15 this week':''},
    {label:'Active', value:isDemoMode?1190:active, trendClass:'up'},
    {label:'Suspended', value:isDemoMode?55:susp, trendClass:'down'},
    {label:'New This Month', value:isDemoMode?87:newThisMonth, trendClass:'up'}
  ]);
}

function renderLandlordsTable() {
  const all = getData('users_landlords', []);
  const search = ($('landlordSearch')||{}).value?.toLowerCase()||'';
  const areaF  = ($('landlordAreaFilter')||{}).value||'';
  let filtered = all.filter(u => {
    if (search && !`${u.firstName}${u.lastName}${u.email}`.toLowerCase().includes(search)) return false;
    if (areaF && (u.lga||'').toLowerCase() !== areaF.toLowerCase()) return false;
    return true;
  });
  const areas = [...new Set(all.map(u=>u.lga).filter(Boolean))].sort();
  const aFilter = $('landlordAreaFilter');
  if (aFilter && aFilter.options.length <= 1) {
    areas.forEach(a => { const o=document.createElement('option'); o.value=a; o.textContent=a; aFilter.appendChild(o); });
  }
  const start = (landlordPage-1)*PER_PAGE;
  const page = filtered.slice(start, start+PER_PAGE);
  const tbody = $('landlordsTableBody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML=`<tr><td colspan="9"><div class="adm-empty"><p>No landlords found</p></div></td></tr>`; return; }
  tbody.innerHTML = page.map(u => `
    <tr>
      <td><div class="adm-user-cell"><div class="adm-avatar" style="background:${avatarColor((u.firstName||'')+u.lastName||'')}; font-size:11px;">${escHtml(initials(u.firstName||u.name,u.lastName))}</div><div><div class="adm-uname">${escHtml((u.firstName||u.name||'')+' '+(u.lastName||''))}</div></div></div></td>
      <td class="adm-f12 adm-text-muted">${escHtml(u.email||'—')}</td>
      <td class="adm-f12">${escHtml(u.phone||'—')}</td>
      <td class="adm-f12">${escHtml(u.lga||'—')}</td>
      <td class="adm-f12">${(u.listingsCount||u.listings||0)}</td>
      <td class="adm-f12">${fmtDate(u.joinDate||u.createdAt)}</td>
      <td><span class="adm-badge ${u.verified||u.landlordVerified?'gold':'grey'}">${(u.verified||u.landlordVerified)?'✓ Verified':'Unverified'}</span></td>
      <td><span class="adm-badge ${u.status==='suspended'?'red':'green'}">${escHtml(u.status||'active')}</span></td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="adm-btn-icon" title="View" onclick="showUserPanel('${escHtml(u.email||u.id)}','landlord')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
          <button class="adm-btn-icon" title="Suspend" onclick="toggleUserStatus('${escHtml(u.email||u.id)}','landlord','${u.status==='suspended'?'active':'suspended'}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></button>
          <button class="adm-btn-icon" title="Delete" onclick="deleteUser('${escHtml(u.email||u.id)}','landlord')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
        </div>
      </td>
    </tr>`).join('');
  renderPagination('landlordsPagination', filtered.length, landlordPage, PER_PAGE, p => { landlordPage=p; renderLandlordsTable(); });

  const active = all.filter(u=>u.status!=='suspended').length;
  const susp   = all.filter(u=>u.status==='suspended').length;
  $('landlordStats').innerHTML = makeStats([
    {label:'Total Landlords', value:isDemoMode?597:all.length, trend:''},
    {label:'Active', value:isDemoMode?580:active, trendClass:'up'},
    {label:'Suspended', value:isDemoMode?17:susp, trendClass:'down'},
    {label:'Verified', value:isDemoMode?412:all.filter(u=>u.verified||u.landlordVerified).length, trendClass:'up'}
  ]);
}

function renderUsersSidebar() {
  const tenants   = getData('users_tenants', []);
  const landlords = getData('users_landlords', []);
  const total = tenants.length + landlords.length;
  const active = isDemoMode ? 1770 : (tenants.filter(u=>u.status!=='suspended').length + landlords.filter(u=>u.status!=='suspended').length);
  const susp   = isDemoMode ? 72   : (tenants.filter(u=>u.status==='suspended').length + landlords.filter(u=>u.status==='suspended').length);
  $('usersSidebar').innerHTML = `
    <div class="adm-card">
      <div class="adm-card-header"><h3>User Overview</h3></div>
      <div class="adm-chart-container" style="max-height:200px;"><canvas id="chartUserOverview"></canvas></div>
      <div style="margin-top:12px;">
        <div class="adm-bar-item"><div class="adm-bar-item-header"><span>Active</span><span>${active.toLocaleString()}</span></div><div class="adm-progress"><div class="adm-progress-bar green" style="width:${total?Math.round(active/total*100):0}%"></div></div></div>
        <div class="adm-bar-item"><div class="adm-bar-item-header"><span>Suspended</span><span>${susp.toLocaleString()}</span></div><div class="adm-progress"><div class="adm-progress-bar red" style="width:${total?Math.round(susp/total*100):0}%"></div></div></div>
      </div>
    </div>
    <div class="adm-card adm-mt16">
      <div class="adm-card-header"><h3>User Roles</h3></div>
      <table class="adm-table"><thead><tr><th>Role</th><th>Count</th><th>%</th></tr></thead><tbody>
        <tr><td>Tenants</td><td>${isDemoMode?1245:tenants.length}</td><td>${total?Math.round((isDemoMode?1245:tenants.length)/(isDemoMode?1842:total)*100):0}%</td></tr>
        <tr><td>Landlords</td><td>${isDemoMode?597:landlords.length}</td><td>${total?Math.round((isDemoMode?597:landlords.length)/(isDemoMode?1842:total)*100):0}%</td></tr>
      </tbody></table>
    </div>`;
  // Donut
  setTimeout(() => {
    const ctx = $('chartUserOverview');
    if (ctx) new Chart(ctx, { type:'doughnut', data:{labels:['Active','Suspended'], datasets:[{data:[isDemoMode?1770:active, isDemoMode?72:susp], backgroundColor:['#2ecc71','#e74c3c'], borderWidth:0}]}, options:{responsive:true, cutout:'70%', plugins:{legend:{display:false}}} });
  }, 100);
  $('landlordsSidebar').innerHTML = $('usersSidebar').innerHTML;
}

function showUserPanel(id, type) {
  $('userPanelOverlay').classList.add('open');
  $('userDetailPanel').classList.add('open');
  const users = getData(type==='tenant'?'users_tenants':'users_landlords', []);
  const u = users.find(x=>(x.email===id||x.id===id)) || {firstName:id,email:id};
  $('userPanelTitle').textContent = `${(u.firstName||u.name||'')} ${u.lastName||''} — ${type.charAt(0).toUpperCase()+type.slice(1)}`;
  const inits = initials(u.firstName||u.name,u.lastName);
  $('userPanelBody').innerHTML = `
    <div style="text-align:center;padding-bottom:20px;border-bottom:1px solid var(--adm-border);margin-bottom:20px;">
      <div class="adm-avatar" style="width:64px;height:64px;background:${avatarColor(inits)};font-size:22px;font-weight:800;margin:0 auto 12px;">${inits}</div>
      <div style="font-size:17px;font-weight:700;">${escHtml((u.firstName||u.name||'')+' '+(u.lastName||''))}</div>
      <div style="font-size:13px;color:var(--adm-text-muted);">${escHtml(u.email||'')}</div>
      <span class="adm-badge ${u.status==='suspended'?'red':'green'}" style="margin-top:8px;display:inline-flex;">${escHtml(u.status||'active')}</span>
    </div>
    <div style="display:grid;gap:10px;">
      ${[['Phone',u.phone],['Area',u.area||u.lga],['Joined',fmtDate(u.joinDate||u.createdAt)],['Budget',u.budgetRange||'N/A']].map(([k,v])=>v?`<div class="adm-flex-between" style="font-size:13px;padding:6px 0;border-bottom:1px solid var(--adm-grey-light);"><span class="adm-text-muted">${k}</span><span class="adm-fw600">${escHtml(String(v))}</span></div>`:'').join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:20px;">
      <button class="adm-btn adm-btn-outline" onclick="toggleUserStatus('${escHtml(id)}','${type}','${u.status==='suspended'?'active':'suspended'}');closeUserPanel()">${u.status==='suspended'?'Unsuspend':'Suspend'} User</button>
      <button class="adm-btn adm-btn-red" onclick="if(confirm('Delete this user?')){deleteUser('${escHtml(id)}','${type}');closeUserPanel();}">Delete</button>
    </div>`;
}
function closeUserPanel() { $('userPanelOverlay').classList.remove('open'); $('userDetailPanel').classList.remove('open'); }
$('userPanelOverlay').addEventListener('click', closeUserPanel);

function toggleUserStatus(id, type, newStatus) {
  if (isDemoMode) { admShowToast('Cannot modify data in Demo Mode'); return; }
  const key = type === 'tenant' ? 'pw_tenant' : 'pw_landlord';
  const u = JSON.parse(localStorage.getItem(key)||'null');
  if (u && u.email === id) { u.status = newStatus; localStorage.setItem(key, JSON.stringify(u)); }
  admLogAction(`User ${newStatus}`, 'Users', id);
  admShowToast(`User ${newStatus} successfully`, 'success');
  renderTenantsTable(); renderLandlordsTable();
}

function deleteUser(id, type) {
  if (isDemoMode) { admShowToast('Cannot modify data in Demo Mode'); return; }
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
  const key = type==='tenant'?'pw_tenant':'pw_landlord';
  const u = JSON.parse(localStorage.getItem(key)||'null');
  if (u && u.email===id) localStorage.removeItem(key);
  admLogAction('User deleted', 'Users', id);
  admShowToast('User deleted', 'success');
  renderTenantsTable(); renderLandlordsTable();
}

/* ══════════════════════════════════════════════════
   LISTINGS
══════════════════════════════════════════════════ */
let listingPage = 1;
let listingStatusFilter = 'all';
// Populated on every successful renderListingsTable() fetch; openListingEdit() reads from this
// instead of re-fetching, since it's only ever triggered from an Edit click on an already-
// rendered row (i.e. always after this has run at least once).
let adminListingsCache = [];

async function renderListingsTable() {
  const tbody = $('listingsTableBody');
  if (!tbody) return;

  let rawListings;
  if (isDemoMode) {
    rawListings = DEMO_DATA.listings;
  } else {
    const res = await fetchAdminListings();
    if (!res.ok) {
      tbody.innerHTML = `<tr><td colspan="9"><div class="adm-empty">
        <p style="color:#c0392b;font-weight:700">${res.error === 'network' ? "Couldn't reach the server. Check your connection." : "Couldn't load listings."}</p>
        <button onclick="renderListingsTable()" style="margin-top:10px;padding:8px 18px;border-radius:8px;border:none;background:#a97e4b;color:#fff;font-weight:800;cursor:pointer;font-family:inherit">Retry</button>
      </div></td></tr>`;
      return;
    }
    rawListings = res.listings;
  }
  adminListingsCache = rawListings;

  const search  = ($('listingSearch')||{}).value?.toLowerCase()||'';
  const areaF   = ($('listingAreaFilter')||{}).value||'';
  const typeF   = ($('listingTypeFilter')||{}).value||'';

  let filtered = rawListings.filter(l => {
    if (search && !`${l.title}${l.area}${l.landlordName}`.toLowerCase().includes(search)) return false;
    if (areaF && (l.area||'').toLowerCase() !== areaF.toLowerCase()) return false;
    if (typeF && (l.type||'').toLowerCase() !== typeF.toLowerCase()) return false;
    if (listingStatusFilter !== 'all') {
      const st = l.status || 'active';
      if (listingStatusFilter !== st) return false;
    }
    return true;
  });

  // Populate filters
  const aFilter = $('listingAreaFilter');
  if (aFilter && aFilter.options.length <= 1) {
    [...new Set(rawListings.map(l=>l.area).filter(Boolean))].sort().forEach(a => { const o=document.createElement('option'); o.value=a; o.textContent=a; aFilter.appendChild(o); });
  }
  const tFilter = $('listingTypeFilter');
  if (tFilter && tFilter.options.length <= 1) {
    ['1 Bedroom','2 Bedroom','3 Bedroom','4 Bedroom','Duplex','Terrace','Self-contain','Studio'].forEach(t => { const o=document.createElement('option'); o.value=t; o.textContent=t; tFilter.appendChild(o); });
  }

  // Status pills
  const statusCounts = { all: rawListings.length };
  ['active','pending','flagged','rejected'].forEach(s => { statusCounts[s] = rawListings.filter(l=>(l.status||'active')===s).length; });
  $('listingStatusPills').innerHTML = Object.entries(statusCounts).map(([s,c]) => `
    <button class="adm-status-pill ${listingStatusFilter===s?'active':''}" onclick="setListingFilter('${s}')">${s.charAt(0).toUpperCase()+s.slice(1)} (${c})</button>`).join('');

  const start = (listingPage-1)*PER_PAGE;
  const page  = filtered.slice(start, start+PER_PAGE);
  if (!filtered.length) { tbody.innerHTML=`<tr><td colspan="9"><div class="adm-empty"><p>No listings found</p></div></td></tr>`; return; }

  tbody.innerHTML = page.map(l => {
    const st = l.status || 'active';
    const stBadge = {active:'green',pending:'orange',flagged:'red',rejected:'grey'}[st]||'grey';
    return `<tr>
      <td><div class="adm-listing-cell">
        <img src="${escHtml(l.images&&l.images[0]||'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=60')}" class="adm-listing-thumb" onerror="this.style.background='#f0f2f5';this.src=''">
        <div><div class="adm-ltitle">${escHtml(l.title||'Listing')}</div><div class="adm-ltype">${escHtml(l.type||'')}</div></div>
      </div></td>
      <td class="adm-f12">${escHtml(l.landlordName||'—')}</td>
      <td class="adm-f12">${escHtml(l.area||'—')}</td>
      <td class="adm-f12 adm-fw700">${admFmt(l.rentPerYear)}</td>
      <td><span class="adm-badge ${stBadge}">${st}</span>${l.isVerified?'<span class="adm-badge gold" style="margin-left:4px;">✓</span>':''}</td>
      <td class="adm-f12">${(l.views||0).toLocaleString()}</td>
      <td class="adm-f12">${(l.inquiries||0).toLocaleString()}</td>
      <td class="adm-f12">${fmtDate(l.createdAt||l.dateAdded)}</td>
      <td><div style="display:flex;gap:3px;">
        <button class="adm-btn-icon approve" title="Approve" onclick="approveListing('${escHtml(l.id)}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></button>
        <button class="adm-btn-icon reject" title="Reject" onclick="rejectListing('${escHtml(l.id)}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <button class="adm-btn-icon" title="Edit" onclick="openListingEdit('${escHtml(l.id)}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="adm-btn-icon reject" title="Delete" onclick="if(confirm('Delete this listing?'))deleteListingAdmin('${escHtml(l.id)}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
      </div></td>
    </tr>`;
  }).join('');
  renderPagination('listingsPagination', filtered.length, listingPage, PER_PAGE, p => { listingPage=p; renderListingsTable(); });
}

function setListingFilter(status) { listingStatusFilter=status; listingPage=1; renderListingsTable(); }

async function renderListingsSidebar() {
  // Fetches independently rather than reading adminListingsCache, since this is called
  // alongside (not after) renderListingsTable() and shouldn't race it — mirrors the original
  // code, where both functions always independently derived their own copy of the data.
  const all = isDemoMode ? DEMO_DATA.listings : (await fetchAdminListings()).listings;
  const counts = { active:0, pending:0, flagged:0, rejected:0 };
  all.forEach(l => { const s = l.status||'active'; if(counts[s]!==undefined) counts[s]++; });
  $('listingsSidebar').innerHTML = `
    <div class="adm-card">
      <div class="adm-card-header"><h3>Listings Overview</h3></div>
      <div class="adm-chart-container" style="max-height:180px;"><canvas id="chartListingsOverview"></canvas></div>
      <div style="margin-top:12px;">
        ${Object.entries(counts).map(([s,c]) => `<div class="adm-bar-item"><div class="adm-bar-item-header"><span>${s.charAt(0).toUpperCase()+s.slice(1)}</span><span>${c}</span></div><div class="adm-progress"><div class="adm-progress-bar ${s==='active'?'green':s==='pending'?'':'red'}" style="width:${all.length?Math.round(c/all.length*100):0}%;background:${{active:'#2ecc71',pending:'#f39c12',flagged:'#e74c3c',rejected:'#aaa'}[s]}"></div></div></div>`).join('')}
      </div>
    </div>
    <div class="adm-card adm-mt16">
      <div class="adm-card-header"><h3>Quick Actions</h3></div>
      <button class="adm-quick-action" onclick="bulkApproveListings()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>Bulk Approve Listings</button>
      <button class="adm-quick-action" onclick="exportCSV('listings')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>Export All Listings</button>
    </div>`;
  setTimeout(() => {
    const ctx = $('chartListingsOverview');
    if (ctx) new Chart(ctx, { type:'doughnut', data:{labels:['Active','Pending','Flagged','Rejected'], datasets:[{data:Object.values(counts), backgroundColor:['#2ecc71','#f39c12','#e74c3c','#aaa'], borderWidth:0}]}, options:{responsive:true, cutout:'65%', plugins:{legend:{display:false}}} });
  }, 100);
}

async function approveListing(id) {
  admLogAction('Listing approved', 'Listings', id);
  if (!isDemoMode) {
    const res = await PWApi.request('/api/admin/listings/' + encodeURIComponent(id) + '/approve', { method: 'PATCH' });
    if (!res.ok) {
      admShowToast(res.error === 'network' ? "Couldn't reach the server. Please try again." : 'Failed to approve listing.', 'error');
      return;
    }
  }
  const card = document.getElementById('pcard-'+id);
  if (card) card.style.opacity = '0.3';
  admShowToast('Listing approved and published', 'success');
  updateNavBadges();
  renderListingsTable();
}

async function rejectListing(id) {
  admLogAction('Listing rejected', 'Listings', id);
  if (!isDemoMode) {
    const res = await PWApi.request('/api/admin/listings/' + encodeURIComponent(id) + '/reject', { method: 'PATCH' });
    if (!res.ok) {
      admShowToast(res.error === 'network' ? "Couldn't reach the server. Please try again." : 'Failed to reject listing.', 'error');
      return;
    }
  }
  admShowToast('Listing rejected', 'error');
  updateNavBadges();
  renderListingsTable();
}

async function deleteListingAdmin(id) {
  if (isDemoMode) { admShowToast('Cannot modify data in Demo Mode'); return; }
  const res = await PWApi.request('/api/admin/listings/' + encodeURIComponent(id), { method: 'DELETE' });
  if (!res.ok) {
    admShowToast(res.error === 'network' ? "Couldn't reach the server. Please try again." : 'Failed to delete listing.', 'error');
    return;
  }
  admLogAction('Listing deleted', 'Listings', id);
  admShowToast('Listing deleted', 'success');
  renderListingsTable();
  updateNavBadges();
}

async function bulkApproveListings() {
  admLogAction('Bulk approve listings', 'Listings');
  if (!isDemoMode) {
    const res = await PWApi.request('/api/admin/listings/bulk-approve', { method: 'POST' });
    if (!res.ok) {
      admShowToast(res.error === 'network' ? "Couldn't reach the server. Please try again." : 'Failed to bulk-approve listings.', 'error');
      return;
    }
  }
  admShowToast('All pending listings approved', 'success');
  renderListingsTable(); updateNavBadges();
}

function openListingEdit(id) {
  const all = isDemoMode ? DEMO_DATA.listings : adminListingsCache;
  const l = all.find(x=>x.id===id) || {};
  $('listingEditBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      ${[['Title','title',l.title],['Area','area',l.area],['Type','type',l.type],['Rent/yr','rentPerYear',l.rentPerYear],['Landlord','landlordName',l.landlordName]].map(([lbl,key,val])=>`
        <div><label style="font-size:12.5px;font-weight:600;display:block;margin-bottom:4px;">${lbl}</label>
          <input data-key="${key}" value="${escHtml(val||'')}" style="width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:6px;font-family:inherit;font-size:13px;" data-id="${id}">
        </div>`).join('')}
      <div><label style="font-size:12.5px;font-weight:600;display:block;margin-bottom:4px;">Status</label>
        <select data-key="status" data-id="${id}" style="width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:6px;font-family:inherit;font-size:13px;">
          ${['active','pending','flagged','rejected'].map(s=>`<option ${(l.status||'active')===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>`;
  $('listingEditModal').classList.add('open');
  $('listingEditModal').dataset.id = id;
}

function closeListingModal() { $('listingEditModal').classList.remove('open'); }

async function saveListingEdit() {
  if (isDemoMode) { admShowToast('Cannot modify data in Demo Mode'); return; }
  const id = $('listingEditModal').dataset.id;
  const updates = {};
  $('listingEditBody').querySelectorAll('[data-key]').forEach(el => {
    // rentPerYear is a plain text input — coerce to a number so it isn't stored as a string in
    // what the backend treats as an integer column.
    updates[el.dataset.key] = el.dataset.key === 'rentPerYear' ? (Number(el.value) || 0) : el.value;
  });

  const res = await PWApi.request('/api/admin/listings/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(updates) });
  if (!res.ok) {
    admShowToast(res.error === 'network' ? "Couldn't reach the server. Please try again." : 'Failed to update listing.', 'error');
    return;
  }
  admLogAction('Listing edited', 'Listings', id);
  admShowToast('Listing updated', 'success');
  closeListingModal();
  renderListingsTable();
}

/* ══════════════════════════════════════════════════
   INQUIRIES
══════════════════════════════════════════════════ */
let inquiryPage = 1;

function renderInquiriesTable() {
  const all = getData('inquiries', []);
  const search = ($('inquirySearch')||{}).value?.toLowerCase()||'';
  const statusF= ($('inquiryStatusFilter')||{}).value||'';
  let filtered = all.filter(i => {
    if (search && !`${i.name}${i.phone}${i.messagePreview||i.message}${i.listingTitle}`.toLowerCase().includes(search)) return false;
    if (statusF && (i.status||'new') !== statusF) return false;
    return true;
  });
  const start = (inquiryPage-1)*PER_PAGE;
  const page  = filtered.slice(start, start+PER_PAGE);
  const tbody = $('inquiriesTableBody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML=`<tr><td colspan="7"><div class="adm-empty"><p>No inquiries found</p></div></td></tr>`; return; }
  tbody.innerHTML = page.map(i => {
    const st = i.status||'new';
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:8px;"><div class="adm-avatar" style="background:${avatarColor(i.name||'')}; font-size:10px;">${escHtml(initials((i.name||'?').split(' ')[0],(i.name||'?').split(' ')[1]||''))}</div><div><div style="font-size:13px;font-weight:600;">${escHtml(i.name||'—')}</div><div style="font-size:11.5px;color:var(--adm-text-muted);">${escHtml(i.phone||'')}</div></div></div></td>
      <td style="max-width:200px;"><span style="font-size:12.5px;color:var(--adm-text-muted);">${escHtml((i.messagePreview||i.message||'').slice(0,70))}...</span></td>
      <td class="adm-f12">${escHtml(i.listingTitle||'—')}</td>
      <td class="adm-f12">${escHtml(i.landlordName||'—')}</td>
      <td class="adm-f12">${timeAgo(i.sentAt)}</td>
      <td><span class="adm-badge ${st==='new'?'orange':st==='read'?'blue':st==='replied'?'green':'grey'}">${st}</span></td>
      <td><div style="display:flex;gap:4px;">
        <button class="adm-btn-icon" title="View"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button class="adm-btn-icon reject" title="Delete" onclick="deleteInquiry('${escHtml(i.id||'')}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
      </div></td>
    </tr>`;
  }).join('');
  renderPagination('inquiriesPagination', filtered.length, inquiryPage, PER_PAGE, p => { inquiryPage=p; renderInquiriesTable(); });

  const stats = isDemoMode ? {total:4291,thisWeek:186,waConv:'73%',avgResp:'2.4 hrs'} : {total:all.length,thisWeek:all.filter(i=>{const d=new Date(i.sentAt||0);return Date.now()-d<7*86400000;}).length,waConv:'N/A',avgResp:'N/A'};
  $('inquiryStats').innerHTML = makeStats([
    {label:'Total Inquiries', value:stats.total.toLocaleString(), trend:isDemoMode?'↑18% from last month':''},
    {label:'This Week', value:stats.thisWeek.toLocaleString(), trend:isDemoMode?'↑23% from last week':'', trendClass:'up'},
    {label:'WhatsApp Conversions', value:stats.waConv, trend:isDemoMode?'↑8% conversion rate':''},
    {label:'Avg Response Time', value:stats.avgResp, trend:isDemoMode?'↑15% faster':''}
  ]);
}

function renderInquiriesSidebar() {
  const all = getData('inquiries', []);
  const counts = { new:0, read:0, replied:0, closed:0 };
  all.forEach(i => { const s=(i.status||'new'); if(counts[s]!==undefined) counts[s]++; });
  const dCounts = isDemoMode ? {new:1245,read:2180,replied:756,closed:110} : counts;
  $('inquiriesSidebar').innerHTML = `
    <div class="adm-card">
      <div class="adm-card-header"><h3>Inquiry Overview</h3></div>
      <div class="adm-chart-container" style="max-height:180px;"><canvas id="chartInqOverview"></canvas></div>
    </div>
    <div class="adm-card adm-mt16">
      <div class="adm-card-header"><h3>Quick Filters</h3></div>
      ${Object.entries(dCounts).map(([s,c]) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--adm-grey-light);cursor:pointer;" onclick="$('inquiryStatusFilter').value='${s}';renderInquiriesTable()">
        <span style="font-size:13px;font-weight:500;">${s.charAt(0).toUpperCase()+s.slice(1)} Inquiries</span>
        <span style="font-weight:700;color:${s==='new'?'#f39c12':s==='replied'?'#2ecc71':'var(--adm-navy)'};">${c.toLocaleString()}</span>
      </div>`).join('')}
    </div>`;
  setTimeout(() => {
    const ctx = $('chartInqOverview');
    if(ctx) new Chart(ctx, {type:'doughnut', data:{labels:['New','Read','Replied','Closed'], datasets:[{data:Object.values(dCounts), backgroundColor:['#f39c12','#3b82f6','#2ecc71','#aaa'], borderWidth:0}]}, options:{responsive:true, cutout:'65%', plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}}}});
  }, 100);
}

function deleteInquiry(id) {
  if (isDemoMode) { admShowToast('Cannot modify data in Demo Mode'); return; }
  const list = JSON.parse(localStorage.getItem('pw_inquiries')||'[]');
  localStorage.setItem('pw_inquiries', JSON.stringify(list.filter(i=>i.id!==id)));
  admShowToast('Inquiry deleted', 'success');
  renderInquiriesTable();
}

/* ══════════════════════════════════════════════════
   FEEDBACK
══════════════════════════════════════════════════ */
function renderFeedbackGrid() {
  const all = getData('feedback', []);
  const typeF   = ($('fbTypeFilter')||{}).value||'';
  const statusF = ($('fbStatusFilter')||{}).value||'';
  const search  = ($('fbSearch')||{}).value?.toLowerCase()||'';
  let filtered = all.filter(f => {
    if (typeF && f.type !== typeF) return false;
    if (statusF && (f.status||'new') !== statusF) return false;
    if (search && !`${f.name}${f.message}${f.email}`.toLowerCase().includes(search)) return false;
    return true;
  });
  const grid = $('feedbackGrid');
  if (!grid) return;
  if (!filtered.length) {
    grid.innerHTML = `<div class="adm-empty"><p>No feedback yet — this section will populate as users interact with the feedback bubble on the site.</p></div>`;
    return;
  }
  grid.innerHTML = `<div class="adm-feedback-grid">${filtered.map(f => `
    <div class="adm-fb-card">
      <div class="adm-fb-header">
        <span class="adm-badge ${f.type==='complaint'?'red':f.type==='suggestion'?'orange':'blue'}">${escHtml((f.type||'').charAt(0).toUpperCase()+(f.type||'feedback').slice(1))}</span>
        <span style="font-size:11.5px;color:var(--adm-text-muted);margin-left:auto;">${timeAgo(f.sentAt)}</span>
      </div>
      <div><div class="adm-fb-name">${escHtml(f.name||'Anonymous')}</div><div class="adm-fb-meta">${escHtml(f.email||'')}</div></div>
      <div class="adm-fb-page">From: ${escHtml(f.page||'website')}</div>
      <div class="adm-fb-message">${escHtml(f.message||'')}</div>
      <select onchange="updateFeedbackStatus('${escHtml(f.id||f.sentAt||'')}',this.value)" style="padding:6px 10px;border:1.5px solid var(--adm-border);border-radius:6px;font-size:12px;font-family:inherit;width:100%;">
        ${['new','in_review','resolved'].map(s=>`<option value="${s}" ${(f.status||'new')===s?'selected':''}>${s==='in_review'?'In Review':s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
      </select>
      <textarea class="adm-fb-note" placeholder="Add internal note..." data-fbid="${escHtml(f.id||f.sentAt||'')}">${escHtml(f.adminNote||'')}</textarea>
      <div class="adm-fb-actions">
        <button class="adm-btn adm-btn-green adm-btn-sm" onclick="resolveFeedback('${escHtml(f.id||f.sentAt||'')}')">Mark Resolved</button>
        <button class="adm-btn adm-btn-red adm-btn-sm" onclick="deleteFeedback('${escHtml(f.id||f.sentAt||'')}')">Delete</button>
      </div>
    </div>`).join('')}</div>`;

  // Stats
  const newCount = all.filter(f=>f.status==='new'||!f.status).length;
  const reviewCount = all.filter(f=>f.status==='in_review').length;
  const resolvedCount = all.filter(f=>f.status==='resolved').length;
  $('feedbackStats').innerHTML = makeStats([
    {label:'Total Received', value:(isDemoMode?6:all.length).toLocaleString()},
    {label:'Open', value:(isDemoMode?2:newCount).toLocaleString(), trendClass:'down'},
    {label:'In Review', value:(isDemoMode?2:reviewCount).toLocaleString()},
    {label:'Resolved', value:(isDemoMode?2:resolvedCount).toLocaleString(), trendClass:'up'}
  ]);
}

function renderFeedbackSidebar() {
  const all = getData('feedback', []);
  const complaints  = all.filter(f=>f.type==='complaint').length;
  const suggestions = all.filter(f=>f.type==='suggestion').length;
  const feedback    = all.filter(f=>f.type==='feedback'||!f.type).length;
  $('feedbackSidebar').innerHTML = `
    <div class="adm-card">
      <div class="adm-card-header"><h3>Feedback by Type</h3></div>
      <div class="adm-chart-container" style="max-height:180px;"><canvas id="chartFbType"></canvas></div>
    </div>
    <div class="adm-card adm-mt16">
      <div class="adm-card-header"><h3>Quick Help</h3></div>
      ${[['How to handle complaints','#'],['Response time guidelines','#'],['Escalation process','#'],['User communication tips','#']].map(([t,h])=>`<a href="${h}" style="display:block;padding:9px 0;border-bottom:1px solid var(--adm-grey-light);font-size:13px;color:var(--adm-navy);text-decoration:none;font-weight:500;">${t}</a>`).join('')}
      <button class="adm-btn adm-btn-outline adm-btn-sm" style="margin-top:12px;" onclick="downloadGuidelines()">Download Guidelines</button>
    </div>`;
  setTimeout(() => {
    const ctx = $('chartFbType');
    if(ctx) new Chart(ctx, {type:'doughnut', data:{labels:['Feedback','Complaints','Suggestions'], datasets:[{data:isDemoMode?[2,2,2]:[feedback,complaints,suggestions], backgroundColor:['#3b82f6','#e74c3c','#f39c12'], borderWidth:0}]}, options:{responsive:true, cutout:'65%', plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}}}});
  }, 100);
}

function updateFeedbackStatus(id, status) {
  if (isDemoMode) return;
  const list = JSON.parse(localStorage.getItem('pw_feedback')||'[]');
  const i = list.findIndex(f=>f.id===id||f.sentAt===id);
  if (i > -1) { list[i].status = status; localStorage.setItem('pw_feedback', JSON.stringify(list)); }
  admLogAction('Feedback status updated', 'Feedback', status);
}

function resolveFeedback(id) {
  updateFeedbackStatus(id, 'resolved');
  admShowToast('Marked as resolved', 'success');
  renderFeedbackGrid();
}

function deleteFeedback(id) {
  if (isDemoMode) { admShowToast('Cannot modify data in Demo Mode'); return; }
  if (!confirm('Delete this feedback?')) return;
  const list = JSON.parse(localStorage.getItem('pw_feedback')||'[]');
  localStorage.setItem('pw_feedback', JSON.stringify(list.filter(f=>f.id!==id&&f.sentAt!==id)));
  admShowToast('Feedback deleted', 'success');
  renderFeedbackGrid();
}

function downloadGuidelines() {
  const text = `Property Warehouse — Admin Response Guidelines\n\n1. COMPLAINTS\n   - Respond within 24 hours\n   - Acknowledge the issue without admitting fault\n   - Investigate before drawing conclusions\n   - Update the user with findings\n\n2. RESPONSE TIMES\n   - Complaints: 24 hours\n   - Suggestions: 48 hours\n   - General Feedback: 72 hours\n\n3. ESCALATION\n   - Escalate to senior admin if unresolved after 72hrs\n   - Legal matters: refer to platform legal team\n\n4. USER COMMUNICATION\n   - Always be professional and empathetic\n   - Use the user's name\n   - Provide clear next steps\n\n© 2025 Property Warehouse`;
  const blob = new Blob([text], {type:'text/plain'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='PW-Admin-Guidelines.txt'; a.click();
}

/* ══════════════════════════════════════════════════
   VERIFICATION QUEUE
══════════════════════════════════════════════════ */
function renderVerification() {
  const requests = getData('verification', []);
  const history  = getData('verif_history', []);
  const pending  = requests.filter(r=>r.status==='pending');

  $('verifBannerText').textContent = `${pending.length} ${pending.length===1?'Request':'Requests'} Pending Verification`;
  $('verifApprovedCount').textContent = isDemoMode ? '18' : history.filter(h=>h.action==='approved').length;
  $('verifPendingCount').textContent  = pending.length;
  $('verifRejectedCount').textContent = isDemoMode ? '3' : history.filter(h=>h.action==='rejected').length;

  // Queue
  const queueEl = $('verifQueueList');
  if (pending.length === 0) {
    queueEl.innerHTML = `<div class="adm-empty"><h4>Queue is clear!</h4><p>No pending verification requests at this time.</p></div>`;
  } else {
    queueEl.innerHTML = '<div class="adm-card-header" style="padding:0 0 12px;"><h3>Pending Requests</h3></div>' + pending.map(r => `
      <div class="adm-verif-card">
        <div class="adm-avatar adm-verif-avatar" style="background:${avatarColor(r.name||'?')};font-size:16px;font-weight:800;">${escHtml(initials((r.name||'?').split(' ')[0],(r.name||'?').split(' ')[1]||''))}</div>
        <div class="adm-verif-info">
          <div class="adm-vname">${escHtml(r.name||'Unknown')}</div>
          <div class="adm-vmeta">${escHtml(r.email||'')} · ${escHtml(r.phone||'')}</div>
          <div class="adm-vmeta" style="margin-top:2px;">${escHtml(r.location||'')} · ${escHtml(r.propertyType||'')}</div>
          <div class="adm-verif-docs">
            ${[['Gov ID',r.documents?.govId],['Proof of Address',r.documents?.proofOfAddress],['Property Ownership',r.documents?.propertyOwnership]].map(([d,v])=>`
              <span class="adm-doc-check ${v?'yes':'no'}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${v?'<polyline points="20 6 9 17 4 12"/>':'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'}</svg>${d}
              </span>`).join('')}
          </div>
        </div>
        <div class="adm-verif-actions">
          <div class="adm-verif-time">Applied ${timeAgo(r.appliedDate)}</div>
          <button class="adm-btn adm-btn-green adm-btn-sm" onclick="approveVerification('${escHtml(r.id)}')">Approve</button>
          <button class="adm-btn adm-btn-red adm-btn-sm" onclick="rejectVerification('${escHtml(r.id)}')">Reject</button>
        </div>
      </div>`).join('');
  }

  // History
  $('verifHistoryBody').innerHTML = history.length ? history.map(h => `
    <tr>
      <td>${escHtml(h.landlordName||'—')}</td>
      <td class="adm-f12 adm-text-muted">${escHtml(h.email||'')}</td>
      <td><span class="adm-badge ${h.action==='approved'?'green':'red'}">${escHtml(h.action||'')}</span></td>
      <td class="adm-f12">${fmtDate(h.date)}</td>
      <td class="adm-f12">${escHtml(h.admin||'Admin')}</td>
      <td class="adm-f12 adm-text-muted">${escHtml(h.notes||'—')}</td>
    </tr>`).join('') : '<tr><td colspan="6"><div class="adm-empty" style="padding:20px;"><p>No verification history yet</p></div></td></tr>';

  // Sidebar
  $('verifSidebar').innerHTML = `
    <div class="adm-card">
      <div class="adm-card-header"><h3>Verification Summary</h3></div>
      <div class="adm-chart-container" style="max-height:180px;"><canvas id="chartVerifSummary"></canvas></div>
    </div>
    <div class="adm-card adm-mt16">
      <div class="adm-card-header"><h3>Verification Guidelines</h3></div>
      ${['Verify government ID is valid and unexpired','Check proof of address matches property location','Confirm property ownership documents are authentic','Look for signs of forgery or editing','Cross-reference contact details online'].map(g=>`<div style="display:flex;gap:6px;padding:7px 0;border-bottom:1px solid var(--adm-grey-light);font-size:12.5px;"><span style="color:var(--adm-green);font-weight:700;">✓</span><span>${g}</span></div>`).join('')}
    </div>`;
  setTimeout(() => {
    const ctx = $('chartVerifSummary');
    const approved = isDemoMode?18:history.filter(h=>h.action==='approved').length;
    const rejected = isDemoMode?3:history.filter(h=>h.action==='rejected').length;
    if(ctx) new Chart(ctx, {type:'doughnut', data:{labels:['Verified','Pending','Rejected'], datasets:[{data:[approved, pending.length, rejected], backgroundColor:['#2ecc71','#f39c12','#e74c3c'], borderWidth:0}]}, options:{responsive:true, cutout:'65%', plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}}}});
  }, 100);
}

function approveVerification(id) {
  admLogAction('Verification approved', 'Verification Queue', id);
  if (!isDemoMode) {
    const requests = JSON.parse(localStorage.getItem('pw_verification_requests')||'[]');
    const r = requests.find(x=>x.id===id);
    if (r) {
      r.status = 'approved';
      localStorage.setItem('pw_verification_requests', JSON.stringify(requests));
      // Update landlord record
      const landlordKey = 'pw_landlord_' + r.landlordId;
      const l = JSON.parse(localStorage.getItem(landlordKey)||localStorage.getItem('pw_landlord')||'null');
      if (l) { l.landlordVerified = true; l.verified = true; localStorage.setItem(landlordKey, JSON.stringify(l)); }
      // Update verif history
      const hist = JSON.parse(localStorage.getItem('pw_verif_history')||'[]');
      hist.unshift({ landlordName:r.name, email:r.email, action:'approved', date:new Date().toISOString(), admin:'Technology Integration Group', notes:'Documents verified.' });
      localStorage.setItem('pw_verif_history', JSON.stringify(hist));
    }
  }
  admShowToast('Landlord verified successfully', 'success');
  updateNavBadges();
  renderVerification();
}

function rejectVerification(id) {
  admLogAction('Verification rejected', 'Verification Queue', id);
  if (!isDemoMode) {
    const requests = JSON.parse(localStorage.getItem('pw_verification_requests')||'[]');
    const r = requests.find(x=>x.id===id);
    if (r) {
      r.status = 'rejected';
      localStorage.setItem('pw_verification_requests', JSON.stringify(requests));
      const hist = JSON.parse(localStorage.getItem('pw_verif_history')||'[]');
      hist.unshift({ landlordName:r.name, email:r.email, action:'rejected', date:new Date().toISOString(), admin:'Technology Integration Group', notes:'Documents incomplete.' });
      localStorage.setItem('pw_verif_history', JSON.stringify(hist));
    }
  }
  admShowToast('Verification request rejected', 'error');
  updateNavBadges();
  renderVerification();
}

/* ══════════════════════════════════════════════════
   FINANCE
══════════════════════════════════════════════════ */
let chartRev=null, chartRevSrc=null, chartPay=null;

function renderFinanceOverview() {
  const data = isDemoMode ? DEMO_DATA.finance.overview : {
    totalRevenue: 0, thisMonth: 0, pendingPayouts: 0, openDisputes: 0, urgentDisputes: 0
  };
  $('financeStats').innerHTML = makeStats([
    {label:'Total Revenue', value:admFmt(data.totalRevenue), trend:isDemoMode?'↑22% this month':'', trendClass:'up'},
    {label:'This Month', value:admFmt(data.thisMonth), trend:isDemoMode?'↑18% from last month':'', trendClass:'up'},
    {label:'Pending Payouts', value:admFmt(data.pendingPayouts), trend:isDemoMode?'↑5% from last week':''},
    {label:'Open Disputes', value:String(data.openDisputes), trend:isDemoMode?data.urgentDisputes+' urgent':'', trendClass:'down'}
  ]);

  // Monthly revenue chart
  const mData = isDemoMode ? DEMO_DATA.finance.monthlyRevenue : [{month:'Now',listingFees:0,transactionFees:0,badgeFees:0,referralEarnings:0}];
  const revCtx = $('chartRevenueBreakdown');
  if (revCtx) {
    if (chartRev) { chartRev.destroy(); chartRev=null; }
    chartRev = new Chart(revCtx, { type:'bar', data:{labels:mData.map(m=>m.month), datasets:[
      {label:'Listing Fees', data:mData.map(m=>m.listingFees), backgroundColor:'#c9a84c'},
      {label:'Transaction Fees', data:mData.map(m=>m.transactionFees), backgroundColor:'#0a1628'},
      {label:'Badge Fees', data:mData.map(m=>m.badgeFees), backgroundColor:'#2ecc71'},
      {label:'Referral Earnings', data:mData.map(m=>m.referralEarnings), backgroundColor:'#f39c12'}
    ]}, options:{responsive:true, plugins:{legend:{labels:{boxWidth:12,font:{size:11}}}}, scales:{x:{stacked:true,grid:{display:false}}, y:{stacked:true,beginAtZero:true,grid:{color:'rgba(0,0,0,0.04)'}}}} });
  }

  // Revenue source donut
  const srcCtx = $('chartRevenueSource');
  if (srcCtx) {
    if (chartRevSrc) { chartRevSrc.destroy(); chartRevSrc=null; }
    chartRevSrc = new Chart(srcCtx, { type:'doughnut', data:{labels:['Listing Fees','Transaction Fees','Badge Fees','Referrals'], datasets:[{data:[45,30,15,10], backgroundColor:['#c9a84c','#0a1628','#2ecc71','#f39c12'], borderWidth:0}]}, options:{responsive:true, cutout:'65%', plugins:{legend:{position:'right',labels:{boxWidth:12,font:{size:11}}}}} });
  }

  // Recent transactions
  const txns = isDemoMode ? DEMO_DATA.finance.transactions.slice(0,5) : JSON.parse(localStorage.getItem('pw_finance_transactions')||'[]').slice(0,5);
  $('recentTxnBody').innerHTML = txns.length ? txns.map(t => `
    <tr>
      <td class="adm-f12 adm-fw700">${escHtml(t.id||'—')}</td>
      <td class="adm-f12">${escHtml(t.tenant||'—')}</td>
      <td class="adm-f12">${escHtml(t.landlord||'—')}</td>
      <td class="adm-f12 adm-fw700">${admFmt(t.gross)}</td>
      <td class="adm-f12 adm-text-muted">${admFmt(t.fee)}</td>
      <td class="adm-f12">${admFmt(t.net)}</td>
      <td><span class="adm-badge ${t.status==='paid'?'green':t.status==='pending'?'orange':'red'}">${escHtml(t.status||'—')}</span></td>
    </tr>`).join('') : '<tr><td colspan="7"><div class="adm-empty" style="padding:16px;"><p>No transactions yet</p></div></td></tr>';

  // Quick summary
  $('finQuickSummary').innerHTML = `<div class="adm-card-header"><h3>Quick Financial Summary</h3></div>
    ${[['Total Transactions',isDemoMode?1352:0],['Successful',isDemoMode?1187:0,'green'],['Pending',isDemoMode?98:0,'orange'],['Failed',isDemoMode?67:0,'red'],['Success Rate',isDemoMode?'87.8%':'N/A'],['Avg Transaction Value',admFmt(isDemoMode?1165000:0)]].map(([k,v,c])=>`<div class="adm-flex-between" style="padding:8px 0;border-bottom:1px solid var(--adm-grey-light);font-size:13px;"><span class="adm-text-muted">${k}</span><span class="adm-fw700" ${c?`style="color:var(--adm-${c})"`:''}>${v}</span></div>`).join('')}
    <button class="adm-btn adm-btn-gold" style="width:100%;margin-top:12px;justify-content:center;" onclick="document.querySelector('[data-subtab=financeReports]').click()">View Full Reports</button>`;

  // Top earning landlords
  const top = isDemoMode ? DEMO_DATA.finance.topLandlords : [];
  $('topEarningLandlords').innerHTML = `<div class="adm-card-header"><h3>Top Earning Landlords</h3></div>` +
    (top.length ? top.map(l=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--adm-grey-light);">
      <div class="adm-avatar" style="background:${avatarColor(l.name)};font-size:11px;">${initials(l.name.split(' ')[0],l.name.split(' ')[1]||'')}</div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:600;">${escHtml(l.name)}</div><div style="font-size:11.5px;color:var(--adm-text-muted);">${l.listings} listings</div></div>
      <span style="font-weight:700;font-size:13px;">${admFmt(l.earnings)}</span>
    </div>`).join('') : '<div class="adm-empty" style="padding:16px;"><p>No data yet</p></div>');

  // Payment method
  const payCtx = $('chartPaymentMethod');
  if (payCtx) {
    if(chartPay){chartPay.destroy();chartPay=null;}
    chartPay = new Chart(payCtx, {type:'doughnut', data:{labels:['Paystack','Bank Transfer','Card Payment','Other'], datasets:[{data:[78,15,5,2], backgroundColor:['#c9a84c','#0a1628','#2ecc71','#aaa'], borderWidth:0}]}, options:{responsive:true, cutout:'65%', plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10}}}}}});
  }

  // Platform fee collection
  $('platformFeeCollection').innerHTML = `<div class="adm-card-header"><h3>Platform Fee Collection</h3></div>
    ${[['Listing Fees Collected',isDemoMode?2450000:0],['Transaction Fees (3%)',isDemoMode?1950000:0],['Badge Fees Collected',isDemoMode?1270000:0],['Referral Earnings',isDemoMode?850000:0]].map(([k,v])=>`<div class="adm-flex-between" style="padding:8px 0;border-bottom:1px solid var(--adm-grey-light);font-size:13px;"><span class="adm-text-muted">${k}</span><span class="adm-fw700">${admFmt(v)}</span></div>`).join('')}
    <div class="adm-flex-between" style="padding:10px 0 0;font-size:14px;font-weight:800;color:var(--adm-navy);"><span>Total Platform Fees</span><span>${admFmt(isDemoMode?6520000:0)}</span></div>`;

  // Payout overview
  $('payoutOverview').innerHTML = `<div class="adm-card-header"><h3>Payout Overview</h3></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
      ${[['Total Paid Out',isDemoMode?6200000:0,'navy'],['Pending',isDemoMode?380000:0,'orange'],['Failed',isDemoMode?45000:0,'red']].map(([k,v,c])=>`<div style="text-align:center;padding:10px;background:var(--adm-light);border-radius:8px;"><div style="font-size:15px;font-weight:800;color:var(--adm-${c});">${admFmt(v)}</div><div style="font-size:11px;color:var(--adm-text-muted);">${k}</div></div>`).join('')}
    </div>
    <div style="font-size:12.5px;margin-bottom:6px;"><span class="adm-text-muted">Payout Success Rate</span></div>
    <div class="adm-progress"><div class="adm-progress-bar green" style="width:${isDemoMode?98.7:0}%"></div></div>
    <div style="font-size:12px;margin-top:4px;font-weight:700;">${isDemoMode?'98.7%':'0%'}</div>
    <button class="adm-view-all" style="margin-top:12px;" onclick="document.querySelector('[data-subtab=financePayouts]').click()">Manage Payouts <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>`;

  $('disputeOverview').innerHTML = `<div class="adm-card-header"><h3>Dispute Overview</h3></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
      ${[['Total',isDemoMode?23:0,'navy'],['Open',isDemoMode?3:0,'red'],['Resolved',isDemoMode?20:0,'green']].map(([k,v,c])=>`<div style="text-align:center;padding:10px;background:var(--adm-light);border-radius:8px;"><div style="font-size:15px;font-weight:800;color:var(--adm-${c});">${v}</div><div style="font-size:11px;color:var(--adm-text-muted);">${k}</div></div>`).join('')}
    </div>
    <div style="font-size:12.5px;margin-bottom:6px;"><span class="adm-text-muted">Resolution Rate</span></div>
    <div class="adm-progress"><div class="adm-progress-bar green" style="width:${isDemoMode?87:0}%"></div></div>
    <div style="font-size:12px;margin-top:4px;font-weight:700;">${isDemoMode?'87%':'0%'}</div>
    <button class="adm-view-all" style="margin-top:12px;" onclick="document.querySelector('[data-subtab=financeDisputes]').click()">View All Disputes <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>`;

  $('upcomingEvents').innerHTML = `<div class="adm-card-header"><h3>Upcoming Financial Events</h3></div>
    ${[['Tomorrow','Weekly Payout Run','Payout'],['Jun 2','Monthly Revenue Report','Report'],['Jun 5','Listing Fee Renewals','Fee'],['Jun 21','VAT Filing Deadline','Tax']].map(([d,e,t])=>`<div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--adm-grey-light);"><div style="min-width:50px;font-size:11px;color:var(--adm-text-muted);font-weight:600;">${d}</div><div style="flex:1;font-size:13px;font-weight:500;">${e}</div><span class="adm-badge grey" style="font-size:10px;">${t}</span></div>`).join('')}`;
}

function renderTransactionsTable() {
  const all = isDemoMode ? DEMO_DATA.finance.transactions : JSON.parse(localStorage.getItem('pw_finance_transactions')||'[]');
  const search = ($('txnSearch')||{}).value?.toLowerCase()||'';
  const statusF= ($('txnStatusFilter')||{}).value||'';
  let filtered = all.filter(t => {
    if (search && !`${t.id}${t.tenant}${t.landlord}${t.listing}`.toLowerCase().includes(search)) return false;
    if (statusF && t.status !== statusF) return false;
    return true;
  });
  const tbody = $('txnTableBody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML=`<tr><td colspan="10"><div class="adm-empty"><p>No transactions found</p></div></td></tr>`; return; }
  tbody.innerHTML = filtered.map(t => `
    <tr>
      <td class="adm-f12 adm-fw700">${escHtml(t.id||'—')}</td>
      <td class="adm-f12">${fmtDate(t.date)}</td>
      <td class="adm-f12">${escHtml(t.tenant||'—')}</td>
      <td class="adm-f12">${escHtml(t.landlord||'—')}</td>
      <td class="adm-f12" style="max-width:120px;">${escHtml((t.listing||'—').slice(0,30))}</td>
      <td class="adm-f12 adm-fw700">${admFmt(t.gross)}</td>
      <td class="adm-f12 adm-text-muted">${admFmt(t.fee)}</td>
      <td class="adm-f12">${admFmt(t.net)}</td>
      <td class="adm-f12">${escHtml(t.method||'—')}</td>
      <td><span class="adm-badge ${t.status==='paid'?'green':t.status==='pending'?'orange':'red'}">${escHtml(t.status||'—')}</span></td>
    </tr>`).join('');
}

function renderListingFees() {
  const all = isDemoMode ? DEMO_DATA.finance.listingFees : [];
  const tbody = $('listingFeesBody');
  if (!tbody) return;
  tbody.innerHTML = all.length ? all.map(f => `
    <tr style="${f.status==='expired'?'background:#fff5f5;':''}">
      <td class="adm-f12 adm-fw600">${escHtml(f.landlord||'—')}</td>
      <td class="adm-f12 adm-text-muted">${escHtml(f.email||'—')}</td>
      <td><span class="adm-badge ${f.tier==='Premium'?'gold':f.tier==='Standard'?'blue':'grey'}">${escHtml(f.tier||'Free')}</span></td>
      <td class="adm-f12 adm-fw700">${admFmt(f.amount)}</td>
      <td class="adm-f12">${fmtDate(f.paymentDate)}</td>
      <td class="adm-f12">${fmtDate(f.expiry)}</td>
      <td><span class="adm-badge ${f.status==='active'?'green':f.status==='expiring'?'orange':'red'}">${escHtml(f.status)}</span></td>
      <td><button class="adm-btn adm-btn-outline adm-btn-sm" onclick="admShowToast('Action coming soon')">Upgrade Tier</button></td>
    </tr>`).join('') : '<tr><td colspan="8"><div class="adm-empty" style="padding:16px;"><p>No listing fee records yet</p></div></td></tr>';
}

function renderPayouts() {
  const all = isDemoMode ? DEMO_DATA.finance.payouts : [];
  const total = all.reduce((s,p)=>s+(p.status==='paid'?p.net:0),0);
  const pending = all.reduce((s,p)=>s+(p.status==='pending'?p.net:0),0);
  const failed  = all.reduce((s,p)=>s+(p.status==='failed'?p.net:0),0);
  $('payoutStats').innerHTML = makeStats([
    {label:'Total Paid Out', value:admFmt(isDemoMode?6200000:total)},
    {label:'Pending', value:admFmt(isDemoMode?380000:pending), trendClass:'down'},
    {label:'Failed', value:admFmt(isDemoMode?45000:failed), trendClass:'down'}
  ], 'cols-3');
  const tbody = $('payoutsBody');
  if (!tbody) return;
  tbody.innerHTML = all.length ? all.map(p => `
    <tr>
      <td class="adm-f12 adm-fw600">${escHtml(p.landlord||'—')}</td>
      <td class="adm-f12">${escHtml(p.listing||'—')}</td>
      <td class="adm-f12">${admFmt(p.gross)}</td>
      <td class="adm-f12 adm-text-muted">${admFmt(p.fee)}</td>
      <td class="adm-f12 adm-fw700">${admFmt(p.net)}</td>
      <td class="adm-f12">${escHtml(p.method||'—')}</td>
      <td><span class="adm-badge ${p.status==='paid'?'green':p.status==='pending'?'orange':p.status==='on_hold'?'blue':'red'}">${escHtml(p.status||'—')}</span></td>
      <td class="adm-f12">${fmtDate(p.date)}</td>
      <td><button class="adm-btn adm-btn-outline adm-btn-sm" onclick="admShowToast('Action recorded','success')">Mark Paid</button></td>
    </tr>`).join('') : '<tr><td colspan="9"><div class="adm-empty" style="padding:16px;"><p>No payouts yet</p></div></td></tr>';
}

function renderBadges() {
  const all = isDemoMode ? DEMO_DATA.finance.badges : [];
  const tbody = $('badgesBody');
  if (!tbody) return;
  tbody.innerHTML = all.length ? all.map(b => `
    <tr style="${b.status==='expired'?'background:#fff5f5;':''}">
      <td class="adm-f12 adm-fw600">${escHtml(b.landlord||'—')}</td>
      <td class="adm-f12 adm-text-muted">${escHtml(b.email||'—')}</td>
      <td class="adm-f12 adm-fw700">${admFmt(b.amount)}</td>
      <td class="adm-f12">${fmtDate(b.date)}</td>
      <td class="adm-f12">${fmtDate(b.expiry)}</td>
      <td><span class="adm-badge ${b.status==='active'?'gold':'red'}">${escHtml(b.status)}</span></td>
      <td><button class="adm-btn adm-btn-outline adm-btn-sm" onclick="admShowToast('Action recorded','success')">${b.status==='expired'?'Re-verify':'Renew'}</button></td>
    </tr>`).join('') : '<tr><td colspan="7"><div class="adm-empty" style="padding:16px;"><p>No badge records</p></div></td></tr>';
}

function renderReferrals() {
  const all = isDemoMode ? DEMO_DATA.finance.referrals : [];
  const total = all.reduce((s,r)=>s+r.total,0);
  $('referralStats').innerHTML = makeStats([
    {label:'Total Referral Earnings', value:admFmt(isDemoMode?507000:total)},
    {label:'Active Partners', value:String(all.filter(r=>r.status==='active').length)},
    {label:'Best Performer', value:all.length?(all.sort((a,b)=>b.total-a.total)[0]?.partner||'—'):'—'}
  ], 'cols-3');
  const tbody = $('referralsBody');
  if (!tbody) return;
  tbody.innerHTML = all.length ? all.map(r => `
    <tr>
      <td class="adm-f12 adm-fw600">${escHtml(r.partner)}</td>
      <td class="adm-f12 adm-text-muted">${escHtml(r.category)}</td>
      <td class="adm-f12">${r.count}</td>
      <td class="adm-f12">${admFmt(r.perReferral)}</td>
      <td class="adm-f12 adm-fw700">${admFmt(r.total)}</td>
      <td class="adm-f12">${fmtDate(r.lastPayment)}</td>
      <td><span class="adm-badge ${r.status==='active'?'green':'grey'}">${escHtml(r.status)}</span></td>
    </tr>`).join('') : '<tr><td colspan="7"><div class="adm-empty" style="padding:16px;"><p>No referral partners yet</p></div></td></tr>';
}

function renderDisputes() {
  const all = isDemoMode ? DEMO_DATA.finance.disputes : [];
  const tbody = $('disputesBody');
  if (!tbody) return;
  tbody.innerHTML = all.length ? all.map(d => `
    <tr>
      <td class="adm-f12 adm-fw600">${escHtml(d.tenant||'—')}</td>
      <td class="adm-f12">${escHtml(d.landlord||'—')}</td>
      <td class="adm-f12">${escHtml((d.listing||'—').slice(0,25))}</td>
      <td class="adm-f12 adm-fw700">${admFmt(d.amount)}</td>
      <td class="adm-f12" style="max-width:140px;">${escHtml(d.reason||'—')}</td>
      <td class="adm-f12">${fmtDate(d.opened)}</td>
      <td><span class="adm-badge ${d.status==='open'?'red':d.status==='under_review'?'orange':'green'}">${escHtml(d.status?.replace('_',' ')||'—')}</span></td>
      <td>
        <button class="adm-btn adm-btn-green adm-btn-sm" onclick="admShowToast('Refund approved','success')">Approve Refund</button>
        <button class="adm-btn adm-btn-red adm-btn-sm" style="margin-top:4px;" onclick="admShowToast('Dispute rejected')">Reject</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="8"><div class="adm-empty" style="padding:16px;"><p>No disputes yet</p></div></td></tr>';
}

function generateReport() {
  const type  = ($('reportType')||{}).value || 'monthly_revenue';
  const from  = ($('reportDateFrom')||{}).value || '2025-01-01';
  const to    = ($('reportDateTo')||{}).value   || new Date().toISOString().slice(0,10);
  const mode  = isDemoMode ? 'DEMO' : 'LIVE';
  const data  = isDemoMode ? DEMO_DATA.finance : {};
  const lines = [
    `PROPERTY WAREHOUSE — ${type.replace(/_/g,' ').toUpperCase()} REPORT`,
    `Generated: ${new Date().toLocaleString('en-NG')}`,
    `Period: ${from} to ${to}`,
    `Data Mode: ${mode}`,
    '═'.repeat(50),
    '',
    isDemoMode ? [
      `Total Revenue:          ${admFmt(data.overview?.totalRevenue)}`,
      `This Month:             ${admFmt(data.overview?.thisMonth)}`,
      `Pending Payouts:        ${admFmt(data.overview?.pendingPayouts)}`,
      `Open Disputes:          ${data.overview?.openDisputes}`,
      '',
      'TOP TRANSACTIONS:',
      ...(data.transactions||[]).slice(0,5).map(t=>`  ${t.id} | ${t.tenant} → ${t.landlord} | ${admFmt(t.gross)} | ${t.status}`)
    ].join('\n') : 'No data available in real mode. Enable Demo Mode to see sample data.',
    '',
    '═'.repeat(50),
    `© 2025 Property Warehouse Admin. All rights reserved.`
  ].join('\n');
  const blob = new Blob([lines], {type:'text/plain'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download = `PW-Report-${type}-${to}.txt`; a.click();
  admShowToast('Report downloaded', 'success');
}

/* ══════════════════════════════════════════════════
   ANALYTICS
══════════════════════════════════════════════════ */
let analyticsCharts = {};
function destroyChart(id) { if (analyticsCharts[id]) { analyticsCharts[id].destroy(); delete analyticsCharts[id]; } }

function renderAnalyticsOverview() {
  $('analyticsStats').innerHTML = makeStats([
    {label:'Top Search Area', value:isDemoMode?'Lekki Phase 1':'N/A', trend:isDemoMode?'1,245 inquiries this week':''},
    {label:'Most Viewed Listing', value:isDemoMode?'4 Bed Terrace, Lekki':'N/A', trend:isDemoMode?'1,890 views this week':''},
    {label:'Avg Rent (Lagos)', value:isDemoMode?admFmt(1850000):'N/A', trend:isDemoMode?'↑8% from last month':'', trendClass:'up'},
    {label:'Inquiry Conversion', value:isDemoMode?'73%':'N/A', trend:isDemoMode?'↑5% from last month':'', trendClass:'up'}
  ]);

  // Weekly signups
  const d = isDemoMode ? DEMO_DATA.analytics.weeklySignups : {labels:['W1','W2','W3','W4','W5','W6','W7','W8'],tenants:[0,0,0,0,0,0,0,0],landlords:[0,0,0,0,0,0,0,0]};
  destroyChart('weeklySignups');
  const wsCtx = $('chartWeeklySignups');
  if (wsCtx) analyticsCharts['weeklySignups'] = new Chart(wsCtx, {type:'line', data:{labels:d.labels, datasets:[
    {label:'Tenants', data:d.tenants, borderColor:'#c9a84c', tension:.4, fill:false, pointRadius:4},
    {label:'Landlords', data:d.landlords, borderColor:'#0a1628', tension:.4, fill:false, pointRadius:4}
  ]}, options:{responsive:true, plugins:{legend:{labels:{boxWidth:12,font:{size:11}}}}, scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.04)'}}, x:{grid:{display:false}}}}});

  // Inquiries by area
  const areas = isDemoMode ? DEMO_DATA.analytics.inquiriesByArea : [];
  const maxA = areas.reduce((m,a)=>Math.max(m,a.count),1);
  $('inquiriesByAreaList').innerHTML = areas.map(a=>`<div class="adm-bar-item"><div class="adm-bar-item-header"><span>${escHtml(a.area)}</span><span>${a.count.toLocaleString()}</span></div><div class="adm-progress"><div class="adm-progress-bar" style="width:${(a.count/maxA*100).toFixed(0)}%"></div></div></div>`).join('') || '<p style="color:var(--adm-text-muted);font-size:13px;">No data</p>';

  // Budget distribution
  destroyChart('budgetDist');
  const bdCtx = $('chartBudgetDist');
  const bd = isDemoMode ? DEMO_DATA.analytics.budgetDistribution : [];
  if (bdCtx && bd.length) analyticsCharts['budgetDist'] = new Chart(bdCtx, {type:'doughnut', data:{labels:bd.map(b=>b.label), datasets:[{data:bd.map(b=>b.value), backgroundColor:['#0a1628','#c9a84c','#2ecc71','#f39c12','#e74c3c'], borderWidth:0}]}, options:{responsive:true, cutout:'65%', plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10}}}}}});

  // Top listings
  const top = isDemoMode ? DEMO_DATA.analytics.topListings : [];
  $('topListingsBody').innerHTML = top.map(l=>`<tr>
    <td style="font-size:13px;font-weight:600;">${escHtml(l.title)}</td>
    <td class="adm-f12">${escHtml(l.area)}</td>
    <td class="adm-f12">${l.inquiries}</td>
    <td class="adm-f12">${l.views.toLocaleString()}</td>
    <td class="adm-f12">${l.saves}</td>
    <td><div class="adm-progress" style="width:60px;"><div class="adm-progress-bar green" style="width:${l.occupancy}%"></div></div><span style="font-size:11px;margin-left:4px;">${l.occupancy}%</span></td>
    <td><span class="adm-badge ${l.performance==='Excellent'?'green':l.performance==='Very Good'?'blue':'orange'}">${l.performance}</span></td>
  </tr>`).join('') || '<tr><td colspan="7"><div class="adm-empty" style="padding:16px;"><p>No data</p></div></td></tr>';

  // Platform overview widget
  const po = isDemoMode ? DEMO_DATA.analytics.platformOverview : {};
  $('platformOverviewWidget').innerHTML = `<div class="adm-card-header"><h3>Platform Overview</h3></div>` +
    Object.entries(po).map(([k,v])=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--adm-grey-light);">
      <span style="font-size:12.5px;color:var(--adm-text-muted);">${k.replace(/([A-Z])/g,' $1').trim()}</span>
      <div style="text-align:right;"><div style="font-size:14px;font-weight:700;">${typeof v.value==='number'?v.value.toLocaleString():v.value}</div><div style="font-size:10.5px;color:var(--adm-green);">${v.trend}</div></div>
    </div>`).join('');

  // User growth
  destroyChart('userGrowth');
  const ug = isDemoMode ? DEMO_DATA.analytics.userGrowth : {labels:['Jan','Feb','Mar','Apr','May','Jun'],tenants:[0,0,0,0,0,0],landlords:[0,0,0,0,0,0]};
  const ugCtx = $('chartUserGrowth');
  if (ugCtx) analyticsCharts['userGrowth'] = new Chart(ugCtx, {type:'line', data:{labels:ug.labels, datasets:[
    {label:'Tenants', data:ug.tenants, borderColor:'#2ecc71', backgroundColor:'rgba(46,204,113,0.08)', tension:.4, fill:true},
    {label:'Landlords', data:ug.landlords, borderColor:'#0a1628', backgroundColor:'rgba(10,22,40,0.05)', tension:.4, fill:true}
  ]}, options:{responsive:true, plugins:{legend:{labels:{boxWidth:12,font:{size:11}}}}, scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.04)'}}, x:{grid:{display:false}}}}});

  // Traffic by source
  destroyChart('trafficSource');
  const ts = isDemoMode ? DEMO_DATA.analytics.trafficBySource : [];
  const tsCtx = $('chartTrafficSource');
  if (tsCtx && ts.length) analyticsCharts['trafficSource'] = new Chart(tsCtx, {type:'doughnut', data:{labels:ts.map(t=>t.source), datasets:[{data:ts.map(t=>t.value), backgroundColor:['#0a1628','#c9a84c','#2ecc71','#f39c12','#aaa'], borderWidth:0}]}, options:{responsive:true, cutout:'65%', plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10}}}}}});

  // Top keywords
  const kw = isDemoMode ? DEMO_DATA.analytics.topKeywords : [];
  $('topKeywordsWidget').innerHTML = `<div class="adm-card-header"><h3>Top Search Keywords</h3></div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0 8px;font-size:11.5px;color:var(--adm-text-muted);font-weight:700;border-bottom:1.5px solid var(--adm-border);"><span>KEYWORD</span><span>SEARCHES</span></div>
    ${kw.map(k=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--adm-grey-light);font-size:12.5px;"><span>${escHtml(k.keyword)}</span><span class="adm-fw700">${k.searches.toLocaleString()}</span></div>`).join('')}`;

  // Top landlords by listings
  const tl = isDemoMode ? DEMO_DATA.analytics.topLandlordsByListings : [];
  $('topLandlordsBody').innerHTML = tl.map(l=>`<tr>
    <td><div style="display:flex;align-items:center;gap:6px;"><div class="adm-avatar" style="background:${avatarColor(l.name)};font-size:11px;width:28px;height:28px;">${escHtml(l.initials)}</div><span style="font-size:13px;font-weight:600;">${escHtml(l.name)}</span></div></td>
    <td class="adm-f12">${l.listings}</td><td class="adm-f12">${l.active}</td><td class="adm-f12">${l.inquiries}</td><td class="adm-f12 adm-fw700">${admFmt(l.revenue)}</td>
  </tr>`).join('') || '<tr><td colspan="5"><div class="adm-empty" style="padding:16px;"><p>No data</p></div></td></tr>';

  // Device usage
  destroyChart('deviceUsage');
  const du = isDemoMode ? DEMO_DATA.analytics.deviceUsage : [];
  const duCtx = $('chartDeviceUsage');
  if (duCtx && du.length) analyticsCharts['deviceUsage'] = new Chart(duCtx, {type:'doughnut', data:{labels:du.map(d=>d.device), datasets:[{data:du.map(d=>d.value), backgroundColor:['#0a1628','#c9a84c','#2ecc71'], borderWidth:0}]}, options:{responsive:true, cutout:'65%', plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}}}});
}

function renderUserAnalytics() {
  $('userAnalyticsStats').innerHTML = makeStats([
    {label:'Total Users', value:isDemoMode?'1,842':'0', trend:isDemoMode?'↑14 this week':''},
    {label:'New This Month', value:isDemoMode?'142':'0', trendClass:'up'},
    {label:'Verification Rate', value:isDemoMode?'68%':'0%'},
    {label:'Retention Rate', value:isDemoMode?'84%':'N/A', trendClass:'up'}
  ]);

  // Signup trends
  const ug = isDemoMode ? DEMO_DATA.analytics.userGrowth : {labels:['Jan','Feb','Mar'],tenants:[0,0,0],landlords:[0,0,0]};
  destroyChart('signupTrends');
  const ctx = $('chartSignupTrends');
  if (ctx) analyticsCharts['signupTrends'] = new Chart(ctx, {type:'bar', data:{labels:ug.labels, datasets:[
    {label:'Tenants', data:ug.tenants, backgroundColor:'#c9a84c'},
    {label:'Landlords', data:ug.landlords, backgroundColor:'#0a1628'}
  ]}, options:{responsive:true, plugins:{legend:{labels:{boxWidth:12,font:{size:11}}}}, scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.04)'}}, x:{grid:{display:false}}}}});

  const areas = isDemoMode ? DEMO_DATA.analytics.inquiriesByArea : [];
  const maxA = areas.reduce((m,a)=>Math.max(m,a.count),1);
  $('userAreaDistList').innerHTML = areas.map(a=>`<div class="adm-bar-item"><div class="adm-bar-item-header"><span>${escHtml(a.area)}</span><span>${a.count.toLocaleString()}</span></div><div class="adm-progress"><div class="adm-progress-bar" style="width:${(a.count/maxA*100).toFixed(0)}%"></div></div></div>`).join('');

  const bd = isDemoMode ? DEMO_DATA.analytics.budgetDistribution : [];
  $('budgetSegmentsList').innerHTML = bd.map(b=>`<div class="adm-bar-item"><div class="adm-bar-item-header"><span>${escHtml(b.label)}</span><span>${b.value}%</span></div><div class="adm-progress"><div class="adm-progress-bar" style="width:${b.value*3}%"></div></div></div>`).join('');

  $('verifRatesList').innerHTML = [['Email Verified','82%','green'],['Phone Verified','76%','green'],['ID Verified (Landlords)','68%','gold'],['Unverified Accounts','18%','red']].map(([k,v,c])=>`<div class="adm-bar-item"><div class="adm-bar-item-header"><span>${k}</span><span>${v}</span></div><div class="adm-progress"><div class="adm-progress-bar ${c}" style="width:${v}"></div></div></div>`).join('');
}

function renderListingAnalytics() {
  const allListings = isDemoMode ? DEMO_DATA.listings : [...(typeof DEFAULT_LISTINGS!=='undefined'?DEFAULT_LISTINGS:[]), ...JSON.parse(localStorage.getItem('pw_listings')||'[]')];
  $('listingAnalyticsStats').innerHTML = makeStats([
    {label:'Total Listings', value:(isDemoMode?347:allListings.length).toLocaleString()},
    {label:'Active', value:(isDemoMode?298:allListings.filter(l=>(l.status||'active')==='active').length).toLocaleString(), trendClass:'up'},
    {label:'Avg Rent', value:admFmt(isDemoMode?1850000:allListings.reduce((s,l)=>s+(l.rentPerYear||0),0)/(allListings.length||1))},
    {label:'Verified', value:(isDemoMode?'86%':Math.round(allListings.filter(l=>l.isVerified).length/(allListings.length||1)*100)+'%')}
  ]);

  destroyChart('listingsByType');
  const ctx = $('chartListingsByType');
  if (ctx) analyticsCharts['listingsByType'] = new Chart(ctx, {type:'bar', data:{labels:['1 Bed','2 Bed','3 Bed','4 Bed','Duplex','Terrace','Studio'], datasets:[{data:isDemoMode?[45,89,72,54,38,29,20]:[0,0,0,0,0,0,0], backgroundColor:'#c9a84c'}]}, options:{responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.04)'}}, x:{grid:{display:false}}}}});

  const priceRanges = [['Under ₦500K',isDemoMode?32:0],['₦500K–₦1M',isDemoMode?78:0],['₦1M–₦2M',isDemoMode?96:0],['₦2M–₦3M',isDemoMode?67:0],['Above ₦3M',isDemoMode?74:0]];
  const maxP = priceRanges.reduce((m,[,v])=>Math.max(m,v),1);
  $('listingsByPriceList').innerHTML = priceRanges.map(([k,v])=>`<div class="adm-bar-item"><div class="adm-bar-item-header"><span>${k}</span><span>${v}</span></div><div class="adm-progress"><div class="adm-progress-bar" style="width:${(v/maxP*100).toFixed(0)}%"></div></div></div>`).join('');

  const areas = isDemoMode ? DEMO_DATA.analytics.inquiriesByArea : [];
  const maxA = areas.reduce((m,a)=>Math.max(m,a.count),1);
  $('areaPopularityList').innerHTML = areas.map(a=>`<div class="adm-bar-item"><div class="adm-bar-item-header"><span>${escHtml(a.area)}</span><span>${a.count}</span></div><div class="adm-progress"><div class="adm-progress-bar" style="width:${(a.count/maxA*100).toFixed(0)}%"></div></div></div>`).join('');

  destroyChart('listingStatus');
  const lsCtx = $('chartListingStatus');
  const counts = {active:0,pending:0,flagged:0,rejected:0};
  if (isDemoMode) { Object.assign(counts,{active:298,pending:32,flagged:12,rejected:5}); }
  else { allListings.forEach(l=>{const s=l.status||'active';if(counts[s]!==undefined)counts[s]++;}); }
  if (lsCtx) analyticsCharts['listingStatus'] = new Chart(lsCtx, {type:'doughnut', data:{labels:['Active','Pending','Flagged','Rejected'], datasets:[{data:Object.values(counts), backgroundColor:['#2ecc71','#f39c12','#e74c3c','#aaa'], borderWidth:0}]}, options:{responsive:true, cutout:'65%', plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}}}});
}

function renderFinancialAnalytics() {
  $('financialAnalyticsStats').innerHTML = makeStats([
    {label:'Total Revenue', value:admFmt(isDemoMode?8450000:0), trendClass:'up'},
    {label:'MRR', value:admFmt(isDemoMode?1240000:0), trendClass:'up'},
    {label:'Avg Transaction', value:admFmt(isDemoMode?1165000:0)},
    {label:'Revenue Growth', value:isDemoMode?'+22%':'N/A', trendClass:'up'}
  ]);

  const mData = isDemoMode ? DEMO_DATA.finance.monthlyRevenue : [];
  destroyChart('revenueTrends');
  const rtCtx = $('chartRevenueTrends');
  if (rtCtx) analyticsCharts['revenueTrends'] = new Chart(rtCtx, {type:'line', data:{labels:mData.map(m=>m.month), datasets:[{label:'Total Revenue', data:mData.map(m=>m.listingFees+m.transactionFees+m.badgeFees+m.referralEarnings), borderColor:'#c9a84c', backgroundColor:'rgba(201,168,76,0.1)', tension:.4, fill:true}]}, options:{responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.04)'}}, x:{grid:{display:false}}}}});

  destroyChart('feeBreakdown');
  const fbCtx = $('chartFeeBreakdown');
  if (fbCtx) analyticsCharts['feeBreakdown'] = new Chart(fbCtx, {type:'bar', data:{labels:mData.map(m=>m.month), datasets:[
    {label:'Listing Fees', data:mData.map(m=>m.listingFees), backgroundColor:'#c9a84c'},
    {label:'Transaction Fees', data:mData.map(m=>m.transactionFees), backgroundColor:'#0a1628'},
    {label:'Badge Fees', data:mData.map(m=>m.badgeFees), backgroundColor:'#2ecc71'},
    {label:'Referral', data:mData.map(m=>m.referralEarnings), backgroundColor:'#f39c12'}
  ]}, options:{responsive:true, plugins:{legend:{labels:{boxWidth:10,font:{size:10}}}}, scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.04)'}}, x:{grid:{display:false}}}}});

  const ptCtx = $('chartPayoutTrends'); destroyChart('payoutTrends');
  if (ptCtx) analyticsCharts['payoutTrends'] = new Chart(ptCtx, {type:'bar', data:{labels:mData.map(m=>m.month), datasets:[{label:'Payouts', data:isDemoMode?[480000,620000,780000,890000,1020000,1200000]:[0,0,0,0,0,0], backgroundColor:'#2ecc71'}]}, options:{responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.04)'}}, x:{grid:{display:false}}}}});

  $('finSummaryAnalytics').innerHTML = `<div class="adm-card-header"><h3>Financial Summary</h3></div>
    ${[['Total Revenue',admFmt(isDemoMode?8450000:0)],['Platform Fees',admFmt(isDemoMode?6520000:0)],['Landlord Payouts',admFmt(isDemoMode?6200000:0)],['Dispute Refunds',admFmt(isDemoMode?120000:0)],['Net Platform Profit',admFmt(isDemoMode?2250000:0)]].map(([k,v])=>`<div class="adm-flex-between" style="padding:8px 0;border-bottom:1px solid var(--adm-grey-light);font-size:13px;"><span class="adm-text-muted">${k}</span><span class="adm-fw700">${v}</span></div>`).join('')}`;
}

function renderConversionAnalytics() {
  $('conversionStats').innerHTML = makeStats([
    {label:'View-to-Inquiry Rate', value:isDemoMode?'18.4%':'N/A', trendClass:'up'},
    {label:'Inquiry-to-WhatsApp', value:isDemoMode?'73%':'N/A', trendClass:'up'},
    {label:'Signup-to-First Inquiry', value:isDemoMode?'4.2 days':'N/A'},
    {label:'Listing-to-Verification', value:isDemoMode?'2.8 days':'N/A'}
  ]);

  $('conversionFunnel').innerHTML = [
    ['Profile Views', isDemoMode?12345:0, '100%', '#0a1628'],
    ['Listing Clicks', isDemoMode?8640:0, isDemoMode?'70%':'0%', '#c9a84c'],
    ['Inquiries Sent', isDemoMode?4291:0, isDemoMode?'35%':'0%', '#2ecc71'],
    ['WhatsApp Follow-up', isDemoMode?3132:0, isDemoMode?'25%':'0%', '#3b82f6'],
    ['Confirmed Rentals (est.)', isDemoMode?890:0, isDemoMode?'7%':'0%', '#f39c12']
  ].map(([label,count,pct,color])=>`<div style="margin-bottom:12px;"><div class="adm-flex-between" style="font-size:13px;margin-bottom:5px;"><span class="adm-fw600">${label}</span><span style="color:var(--adm-text-muted);">${count.toLocaleString()} (${pct})</span></div><div class="adm-progress"><div class="adm-progress-bar" style="width:${pct};background:${color};"></div></div></div>`).join('');

  const areas = isDemoMode ? DEMO_DATA.analytics.inquiriesByArea : [];
  $('conversionByArea').innerHTML = areas.map(a=>{
    const rate = isDemoMode ? (Math.random()*20+10).toFixed(1) : 0;
    return `<div class="adm-bar-item"><div class="adm-bar-item-header"><span>${escHtml(a.area)}</span><span>${rate}%</span></div><div class="adm-progress"><div class="adm-progress-bar" style="width:${rate*4}%"></div></div></div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════
   ANNOUNCEMENTS
══════════════════════════════════════════════════ */
let selectedAudience = 'all';

function selectAudience(el) {
  document.querySelectorAll('.adm-audience-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  selectedAudience = el.dataset.audience;
  updateAnnPreview();
}

function updateAnnPreview() {
  const title = ($('annTitle')||{}).value || '';
  const msg   = ($('annMessage')||{}).value || '';
  const start = ($('annStartDate')||{}).value || '';
  const end   = ($('annEndDate')||{}).value || '';
  $('annPreviewText').textContent = (title ? title + ': ' : '') + (msg || 'Your announcement will appear here...');
  $('previewAudience').textContent = selectedAudience === 'all' ? 'All Users' : selectedAudience === 'tenants' ? 'Tenants Only' : 'Landlords Only';
  $('previewStart').textContent = start || '—';
  $('previewEnd').textContent   = end   || '—';
}

function publishAnnouncement() {
  const title = ($('annTitle')||{}).value?.trim();
  const msg   = ($('annMessage')||{}).value?.trim();
  if (!title || !msg) { admShowToast('Please fill in Title and Message'); return; }
  const ann = {
    id: 'ANN' + Date.now(),
    title, message: msg, audience: selectedAudience,
    startDate: ($('annStartDate')||{}).value || new Date().toISOString().slice(0,10),
    endDate:   ($('annEndDate')||{}).value   || new Date(Date.now()+7*86400000).toISOString().slice(0,10),
    isActive: true, impressions: 0,
    createdAt: new Date().toISOString()
  };
  const anns = JSON.parse(localStorage.getItem(ANN_KEY)||'[]');
  anns.unshift(ann); localStorage.setItem(ANN_KEY, JSON.stringify(anns));
  admLogAction('Announcement published', 'Announcements', title);
  admShowToast('Announcement published', 'success');
  $('annTitle').value=''; $('annMessage').value='';
  renderAnnouncements();
}

function renderAnnouncements() {
  const anns = JSON.parse(localStorage.getItem(ANN_KEY)||'[]');
  const active = anns.filter(a=>a.isActive);
  const past   = anns.filter(a=>!a.isActive);

  $('activeAnnouncements').innerHTML = active.length ? active.map(a => `
    <div class="adm-ann-card">
      <div class="adm-ann-card-header">
        <div class="adm-ann-title">${escHtml(a.title)}</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="adm-toggle ${a.isActive?'on':''}" onclick="toggleAnn('${a.id}',this)" title="Toggle"></button>
          <button class="adm-btn-icon" onclick="deleteAnn('${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
        </div>
      </div>
      <div class="adm-ann-msg">${escHtml(a.message)}</div>
      <div class="adm-ann-meta">
        <span class="adm-badge ${a.audience==='all'?'navy':'blue'}">${a.audience==='all'?'All Users':a.audience==='tenants'?'Tenants Only':'Landlords Only'}</span>
        <span>📅 ${fmtDate(a.startDate)} → ${fmtDate(a.endDate)}</span>
      </div>
    </div>`).join('') : '<div class="adm-empty" style="grid-column:1/-1;padding:24px;"><p style="font-size:13.5px;color:var(--adm-text-muted);">No active announcements. Create one below.</p></div>';

  $('pastAnnouncementsBody').innerHTML = past.length ? past.map(a=>`
    <tr>
      <td style="font-size:13px;font-weight:600;">${escHtml(a.title)}</td>
      <td><span class="adm-badge grey">${escHtml(a.audience==='all'?'All Users':a.audience==='tenants'?'Tenants':'Landlords')}</span></td>
      <td class="adm-f12">${fmtDate(a.startDate)}</td>
      <td class="adm-f12">${fmtDate(a.endDate)}</td>
      <td class="adm-f12">${a.impressions||0}</td>
      <td><span class="adm-badge grey">Ended</span></td>
      <td><button class="adm-btn-icon reject" onclick="deleteAnn('${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button></td>
    </tr>`).join('') : '<tr><td colspan="7"><div class="adm-empty" style="padding:16px;"><p>No past announcements</p></div></td></tr>';
}

function toggleAnn(id, btn) {
  const anns = JSON.parse(localStorage.getItem(ANN_KEY)||'[]');
  const i = anns.findIndex(a=>a.id===id);
  if (i>-1) { anns[i].isActive=!anns[i].isActive; localStorage.setItem(ANN_KEY, JSON.stringify(anns)); }
  admLogAction('Announcement toggled', 'Announcements', id);
  renderAnnouncements();
}

function deleteAnn(id) {
  const anns = JSON.parse(localStorage.getItem(ANN_KEY)||'[]');
  localStorage.setItem(ANN_KEY, JSON.stringify(anns.filter(a=>a.id!==id)));
  admShowToast('Announcement deleted', 'success');
  renderAnnouncements();
}

/* ══════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════ */
function renderSettings() {
  // Settings mini-nav
  document.querySelectorAll('.adm-settings-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.adm-settings-nav-item').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.adm-settings-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      $(btn.dataset.spanel)?.classList.add('active');
    });
  });

  renderPlatformRules();
  renderActivityLogs();
  renderIntegrations();
  renderEmailSettings();

  // Maintenance toggle state
  const maintOn = localStorage.getItem(MAINT_KEY) === '1';
  const mt = $('maintToggle');
  if (mt) mt.className = 'adm-toggle' + (maintOn ? ' on' : '');
  const sl = $('maintStatusLabel');
  if (sl) { sl.textContent = maintOn ? 'ON — Currently ON' : 'OFF — Currently OFF'; sl.style.color = maintOn?'var(--adm-green)':'var(--adm-red)'; }
}

function renderPlatformRules() {
  const rules = JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null') || DEFAULT_SETTINGS;
  const fields = [
    ['Minimum listing price (₦)', 'minListingPrice', rules.minListingPrice, 'The minimum annual rent allowed for any listing.'],
    ['Maximum photos per listing', 'maxPhotosPerListing', rules.maxPhotosPerListing, 'Max images landlords can upload.'],
    ['Free tier listing limit', 'freeTierListingLimit', rules.freeTierListingLimit, 'Active listings allowed on free tier.'],
    ['Platform transaction fee (%)', 'transactionFeePercent', rules.transactionFeePercent, 'Percentage fee deducted from every transaction.'],
    ['Verified badge fee (₦)', 'verifiedBadgeFee', rules.verifiedBadgeFee, 'Amount charged for verified landlord badge.'],
    ['Inquiry rate limit (per hour)', 'inquiryRateLimit', rules.inquiryRateLimit, 'Max inquiries a user can send per hour.']
  ];
  const grid = $('platformRulesGrid');
  if (!grid) return;
  grid.innerHTML = fields.map(([label, key, val, desc]) => `
    <div>
      <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">${label}</label>
      <input type="number" id="rule_${key}" value="${val}" style="width:100%;padding:9px 12px;border:1.5px solid var(--adm-border);border-radius:6px;font-family:inherit;font-size:13px;">
      <div style="font-size:11px;color:var(--adm-text-muted);margin-top:4px;">${desc}</div>
    </div>`).join('');
}

function savePlatformRules() {
  const rules = {};
  ['minListingPrice','maxPhotosPerListing','freeTierListingLimit','transactionFeePercent','verifiedBadgeFee','inquiryRateLimit'].forEach(key => {
    const el = $('rule_'+key);
    if (el) rules[key] = parseFloat(el.value)||0;
  });
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(rules));
  admLogAction('Platform rules updated', 'Settings');
  admShowToast('Platform rules saved', 'success');
}

function renderActivityLogs() {
  const log = JSON.parse(localStorage.getItem(ADMIN_LOG_KEY)||'[]');
  const shortBody = $('activityLogShort');
  const fullBody  = $('fullActivityLog');
  const rows = log.slice(0,10).map(l=>`<tr><td style="font-size:12.5px;font-weight:500;">${escHtml(l.action||'Action')}</td><td class="adm-f12 adm-text-muted">${escHtml(l.section||'')}</td><td class="adm-f12 adm-text-muted">${fmtDate(l.time)}</td></tr>`).join('') || '<tr><td colspan="3"><div class="adm-empty" style="padding:12px;"><p>No activity yet</p></div></td></tr>';
  if (shortBody) shortBody.innerHTML = rows;
  if (fullBody) fullBody.innerHTML = log.map(l=>`<tr><td style="font-size:12.5px;font-weight:500;">${escHtml(l.action||'')}</td><td class="adm-f12 adm-text-muted">${escHtml(l.section||'')}</td><td class="adm-f12 adm-text-muted">${escHtml(l.user||'Admin')}</td><td class="adm-f12 adm-text-muted">${fmtDate(l.time)}</td></tr>`).join('') || '<tr><td colspan="4"><div class="adm-empty" style="padding:12px;"><p>No activity yet</p></div></td></tr>';
}

function clearActivityLog() {
  if (!confirm('Clear all activity logs?')) return;
  localStorage.removeItem(ADMIN_LOG_KEY);
  admShowToast('Activity log cleared');
  renderActivityLogs();
}

function renderIntegrations() {
  const grid = $('integrationsGrid');
  if (!grid) return;
  const ints = [['Paystack (Payments)','Live','#00C3F7'],['Firebase (Notifications)','Live','#F5820D'],['Slack (Alerts)','Connected','#4A154B'],['Google Analytics','Connected','#E37400'],['Cloudinary (Images)','Connected','#3448C5']];
  grid.innerHTML = ints.map(([name,status,color])=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--adm-grey-light);">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:8px;height:8px;border-radius:50%;background:${color};"></div>
      <span style="font-size:13.5px;font-weight:500;">${escHtml(name)}</span>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
      <span class="adm-badge ${status==='Live'?'green':'blue'}">${status}</span>
      <button class="adm-btn adm-btn-outline adm-btn-sm" onclick="admShowToast('Integration settings — coming soon in production')">Settings</button>
    </div>
  </div>`).join('');
}

function renderEmailSettings() {
  const grid = $('emailSettingsGrid');
  if (!grid) return;
  const settings = [['SMTP Provider','SendGrid'],['From Email','noreply@propertywarehouse.ng'],['From Name','Property Warehouse'],['Reply To','support@propertywarehouse.ng'],['Active Templates','12 Active'],['Last Test Email','Not sent yet']];
  grid.innerHTML = settings.map(([k,v])=>`<div class="adm-flex-between" style="padding:8px 0;border-bottom:1px solid var(--adm-grey-light);font-size:13px;"><span class="adm-text-muted">${k}</span><span class="adm-fw600">${escHtml(v)}</span></div>`).join('');
}

function changeAdminPassword() {
  // The admin password now lives in the backend's database (seeded from backend/.env), not
  // localStorage — there's no /api/admin/me/password endpoint yet (see MIGRATION-NOTES.md),
  // so this can no longer pretend to succeed via localStorage without lying to the admin.
  admShowToast('Password changes aren’t available yet — update ADMIN_PASSWORD in backend/.env and reseed.', 'error');
}

/* ── Maintenance Mode ── */
function admToggleMaintenance(btn) {
  const isOn = localStorage.getItem(MAINT_KEY) === '1';
  const newState = !isOn;
  localStorage.setItem(MAINT_KEY, newState ? '1' : '0');
  // Update all toggles
  document.querySelectorAll('#maintToggle, #quickMaintToggle').forEach(t => {
    t.className = 'adm-toggle' + (newState ? ' on' : '');
  });
  const sl = $('maintStatusLabel');
  if (sl) { sl.textContent = newState ? 'ON — Currently ON' : 'OFF — Currently OFF'; sl.style.color = newState?'var(--adm-green)':'var(--adm-red)'; }
  admLogAction(newState?'Maintenance mode enabled':'Maintenance mode disabled', 'Settings');
  admShowToast(newState ? 'Maintenance mode is now ON' : 'Maintenance mode is now OFF', newState?'error':'success');
}

/* ══════════════════════════════════════════════════
   DATA EXPORT / BACKUP
══════════════════════════════════════════════════ */
function exportCSV(type) {
  let data=[], headers=[], filename='';
  if (type==='tenants') {
    data = getData('users_tenants',[]);
    headers = ['Name','Email','Phone','Area','Budget','Join Date','Status'];
    filename = 'PW-Tenants.csv';
  } else if (type==='landlords') {
    data = getData('users_landlords',[]);
    headers = ['Name','Email','Phone','LGA','Listings','Verified','Status'];
    filename = 'PW-Landlords.csv';
  } else if (type==='listings') {
    data = isDemoMode ? DEMO_DATA.listings : JSON.parse(localStorage.getItem('pw_listings')||'[]');
    headers = ['ID','Title','Type','Area','Rent','Status','Landlord'];
    filename = 'PW-Listings.csv';
  } else if (type==='inquiries') {
    data = getData('inquiries',[]);
    headers = ['Name','Phone','Email','Listing','Landlord','Status','Sent At'];
    filename = 'PW-Inquiries.csv';
  } else if (type==='feedback') {
    data = getData('feedback',[]);
    headers = ['Type','Name','Email','Message','Status','Sent At'];
    filename = 'PW-Feedback.csv';
  } else if (type==='transactions') {
    data = isDemoMode ? DEMO_DATA.finance.transactions : JSON.parse(localStorage.getItem('pw_finance_transactions')||'[]');
    headers = ['ID','Date','Tenant','Landlord','Gross','Fee','Net','Status'];
    filename = 'PW-Transactions.csv';
  }
  const rows = data.map(row => {
    if (type==='tenants') return [`${row.firstName||row.name||''} ${row.lastName||''}`,row.email,row.phone,row.area,row.budgetRange,row.joinDate,row.status||'active'].map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(',');
    if (type==='landlords') return [`${row.firstName||row.name||''} ${row.lastName||''}`,row.email,row.phone,row.lga,row.listingsCount||row.listings||0,row.verified||row.landlordVerified?'Yes':'No',row.status||'active'].map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(',');
    if (type==='listings') return [row.id,row.title,row.type,row.area,row.rentPerYear,row.status||'active',row.landlordName].map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(',');
    if (type==='inquiries') return [row.name,row.phone,row.email,row.listingTitle,row.landlordName,row.status||'new',row.sentAt].map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(',');
    if (type==='feedback') return [row.type,row.name,row.email,(row.message||'').slice(0,100),row.status||'new',row.sentAt].map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(',');
    if (type==='transactions') return [row.id,row.date,row.tenant,row.landlord,row.gross,row.fee,row.net,row.status].map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(',');
    return '';
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
  admShowToast('CSV exported', 'success');
}

function exportAllData() {
  const dump = {};
  for (let i=0; i<localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith('pw_')) { try { dump[k] = JSON.parse(localStorage.getItem(k)); } catch { dump[k] = localStorage.getItem(k); } }
  }
  const blob = new Blob([JSON.stringify(dump, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`PW-DataExport-${new Date().toISOString().slice(0,10)}.json`; a.click();
  admShowToast('Data exported', 'success');
}

function clearAllData() {
  const keys = [];
  for (let i=0; i<localStorage.length; i++) {
    const k = localStorage.key(i); if (k.startsWith('pw_')) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
  admShowToast('All data cleared', 'success');
  setTimeout(() => location.reload(), 1000);
}

/* ══════════════════════════════════════════════════
   PAGINATION HELPER
══════════════════════════════════════════════════ */
function renderPagination(containerId, total, currentPage, perPage, onPageChange) {
  const cont = $(containerId);
  if (!cont) return;
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) { cont.innerHTML=''; return; }
  const showing = `Showing ${Math.min((currentPage-1)*perPage+1, total)}–${Math.min(currentPage*perPage, total)} of ${total}`;
  let btns = '';
  if (currentPage > 1) btns += `<button class="adm-page-btn" onclick="(${onPageChange.toString()})(${currentPage-1})">‹</button>`;
  const range = [];
  for (let i=1;i<=totalPages;i++) {
    if (i===1||i===totalPages||Math.abs(i-currentPage)<=1) range.push(i);
    else if (range[range.length-1]!=='...') range.push('...');
  }
  range.forEach(p => {
    if (p==='...') btns += `<button class="adm-page-btn" disabled>...</button>`;
    else btns += `<button class="adm-page-btn ${p===currentPage?'active':''}" onclick="(${onPageChange.toString()})(${p})">${p}</button>`;
  });
  if (currentPage < totalPages) btns += `<button class="adm-page-btn" onclick="(${onPageChange.toString()})(${currentPage+1})">›</button>`;
  cont.innerHTML = `<span>${showing}</span><div class="adm-pagination-btns">${btns}</div>`;
}

/* ══════════════════════════════════════════════════
   STAT CARD BUILDER
══════════════════════════════════════════════════ */
function makeStats(items, colClass='cols-4') {
  return `<div class="adm-stats-row ${colClass}">${items.map(s => `
    <div class="adm-stat-card">
      <div class="adm-stat-label">${escHtml(s.label)}</div>
      <div class="adm-stat-value">${escHtml(String(s.value||'0'))}</div>
      ${s.trend ? `<div class="adm-stat-trend ${s.trendClass||'neutral'}">${s.trendClass==='up'?'↑':s.trendClass==='down'?'↓':''} ${escHtml(s.trend)}</div>` : ''}
    </div>`).join('')}</div>`;
}

// Override makeStats to insert directly (not wrap in a grid since container is already a grid)
function makeStats(items) {
  return items.map(s => `
    <div class="adm-stat-card">
      <div class="adm-stat-label">${escHtml(s.label)}</div>
      <div class="adm-stat-value">${escHtml(String(s.value||'0'))}</div>
      ${s.trend ? `<div class="adm-stat-trend ${s.trendClass||'neutral'}">${s.trendClass==='up'?'↑':s.trendClass==='down'?'↓':''} ${escHtml(s.trend)}</div>` : ''}
    </div>`).join('');
}

/* ══════════════════════════════════════════════════
   SVG ICON HELPERS
══════════════════════════════════════════════════ */
function svgIcon(path, size=18) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:${size}px;height:${size}px;">${path}</svg>`; }
function usersIcon()   { return svgIcon('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'); }
function homeIcon()    { return svgIcon('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'); }
function msgIcon()     { return svgIcon('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'); }
function dollarIcon()  { return svgIcon('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'); }
function alertIcon()   { return svgIcon('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'); }
function shieldIcon()  { return svgIcon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'); }
function starIcon()    { return svgIcon('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'); }
function clockIcon()   { return svgIcon('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'); }
function activityIcon(){ return svgIcon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'); }

function activityIconSvg(type) {
  const t = (type||'').toLowerCase();
  if (t.includes('user')||t.includes('signup')) return svgIcon('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', 14);
  if (t.includes('listing')||t.includes('home')) return svgIcon('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',14);
  if (t.includes('inquiry')||t.includes('message')) return svgIcon('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',14);
  if (t.includes('verif')||t.includes('check')) return svgIcon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',14);
  if (t.includes('complaint')||t.includes('alert')) return svgIcon('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>',14);
  return svgIcon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',14);
}

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
function initDashboard() {
  updateDemoToggleUI();
  updateNavBadges();
  buildNotifications();
  initTabGroup(document.querySelector('.adm-tabs'));
  initSubTabGroup('financeSubTabs');
  initSubTabGroup('analyticsSubTabs');
  admNavigateTo('overview');

  // Date range label
  const now = new Date();
  $('admDateRangeLabel').textContent = `${new Intl.DateTimeFormat('en-NG',{month:'short',day:'numeric'}).format(new Date(now.getFullYear(),now.getMonth(),1))} – ${new Intl.DateTimeFormat('en-NG',{month:'short',day:'numeric',year:'numeric'}).format(new Date(now.getFullYear(),now.getMonth()+1,0))}`;

  // Set default report dates
  const rFrom = $('reportDateFrom'); const rTo = $('reportDateTo');
  if (rFrom) rFrom.value = new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10);
  if (rTo)   rTo.value   = new Date().toISOString().slice(0,10);
}

// Boot
admCheckAuth();
