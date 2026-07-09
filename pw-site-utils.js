/**
 * pw-site-utils.js
 * Shared utilities: maintenance-mode overlay + announcement banner.
 * Reads from localStorage on every page load; admin sets these via admin.html.
 */
(function () {
  'use strict';

  /* ── Maintenance Mode ─────────────────────────────────────────── */
  function checkMaintenance() {
    if (localStorage.getItem('pw_maintenance_mode') !== '1') return;

    // Let admin panel through without the overlay
    if (window.location.pathname.endsWith('admin.html')) return;

    const overlay = document.createElement('div');
    overlay.id = 'pw-maint-overlay';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'background:#0d1b2a', 'display:flex', 'flex-direction:column',
      'align-items:center', 'justify-content:center',
      'font-family:Manrope,sans-serif', 'color:#f0ece5', 'text-align:center',
      'padding:2rem'
    ].join(';');
    overlay.innerHTML = `
      <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#e8a838" stroke-width="1.5" style="margin-bottom:1.25rem">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="#e8a838"/>
      </svg>
      <h1 style="font-size:1.6rem;font-weight:700;margin:0 0 .75rem">We'll be back soon</h1>
      <p style="max-width:36ch;opacity:.75;line-height:1.6;margin:0 0 1.5rem">
        Property Warehouse is currently undergoing scheduled maintenance.
        Please check back shortly.
      </p>
      <a href="admin.html" style="font-size:.75rem;opacity:.35;color:#f0ece5;text-decoration:none;margin-top:auto;padding-top:2rem">Admin</a>
    `;
    document.body.appendChild(overlay);
  }

  /* ── Announcement Banner ──────────────────────────────────────── */
  function checkAnnouncements() {
    try {
      const announcements = JSON.parse(localStorage.getItem('pw_announcements') || '[]');
      const dismissed     = JSON.parse(sessionStorage.getItem('pw_dismissed_ann') || '[]');
      // admin.js stores `isActive` (not `active`); newest item is at index 0 (admin uses unshift)
      const active        = announcements.filter(a => a.isActive && !dismissed.includes(a.id));
      if (!active.length) return;

      // Show the most-recently created active announcement (index 0 = newest after unshift)
      const ann = active[0];

      const banner = document.createElement('div');
      banner.id = 'pw-ann-banner';
      banner.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:9998',
        'background:#1a3a5c', 'color:#f0ece5',
        'font-family:Manrope,sans-serif', 'font-size:.85rem',
        'display:flex', 'align-items:center', 'justify-content:center',
        'gap:.75rem', 'padding:.6rem 3rem .6rem 1rem',
        'box-shadow:0 2px 8px rgba(0,0,0,.25)', 'line-height:1.4'
      ].join(';');
      // Build banner safely without innerHTML for user-authored content (XSS prevention)
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('width', '16');
      icon.setAttribute('height', '16');
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', '#e8a838');
      icon.setAttribute('stroke-width', '2');
      icon.style.cssText = 'flex-shrink:0';
      icon.innerHTML = '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>';

      const msgSpan = document.createElement('span');
      msgSpan.textContent = ann.message || ''; // textContent — no XSS

      const dismissBtn = document.createElement('button');
      dismissBtn.id = 'pw-ann-dismiss';
      dismissBtn.setAttribute('aria-label', 'Dismiss announcement');
      dismissBtn.textContent = '×';
      dismissBtn.style.cssText = [
        'position:absolute', 'right:.75rem', 'top:50%', 'transform:translateY(-50%)',
        'background:none', 'border:none', 'color:#f0ece5', 'opacity:.65',
        'cursor:pointer', 'font-size:1.1rem', 'line-height:1', 'padding:.25rem'
      ].join(';');

      banner.appendChild(icon);
      banner.appendChild(msgSpan);
      banner.appendChild(dismissBtn);
      document.body.prepend(banner);

      // Push page content down by the banner height
      requestAnimationFrame(() => {
        const h = banner.offsetHeight;
        const firstChild = document.body.children[1];
        if (firstChild && firstChild !== banner) {
          firstChild.style.marginTop = (parseFloat(getComputedStyle(firstChild).marginTop) + h) + 'px';
        }
      });

      banner.querySelector('#pw-ann-dismiss').addEventListener('click', () => {
        dismissed.push(ann.id);
        sessionStorage.setItem('pw_dismissed_ann', JSON.stringify(dismissed));
        banner.remove();
      });
    } catch (_) { /* silently fail */ }
  }

  /* ── Run on DOM ready ─────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      checkMaintenance();
      checkAnnouncements();
    });
  } else {
    checkMaintenance();
    checkAnnouncements();
  }
})();
