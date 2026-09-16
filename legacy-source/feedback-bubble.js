/* ═══════════════════════════════════════════════
   FEEDBACK BUBBLE — Property Warehouse
   Self-injects on DOMContentLoaded
═══════════════════════════════════════════════ */
(function () {
  document.addEventListener('DOMContentLoaded', function () {

    /* ── Bubble button ── */
    var btn = document.createElement('button');
    btn.className = 'pw-bubble-btn';
    btn.setAttribute('aria-label', 'Feedback & Support');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
      '</svg>' +
      '<span class="pw-bubble-tooltip">Feedback &amp; Support</span>';

    if (!sessionStorage.getItem('pw_bubble_seen')) {
      btn.classList.add('pw-pulse');
    }

    /* ── Feedback panel ── */
    var panel = document.createElement('div');
    panel.className = 'pw-feedback-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Feedback panel');
    panel.innerHTML =
      '<div class="pw-fb-header">' +
        '<h3>Talk to Us</h3>' +
        '<button class="pw-fb-close" aria-label="Close panel">&times;</button>' +
      '</div>' +
      '<div class="pw-fb-body">' +
        '<div class="pw-fb-types">' +
          '<button class="pw-fb-pill pw-active" data-type="Feedback">Feedback</button>' +
          '<button class="pw-fb-pill" data-type="Complaint">Complaint</button>' +
          '<button class="pw-fb-pill" data-type="Suggestion">Suggestion</button>' +
        '</div>' +
        '<div class="pw-fb-field"><input type="text" id="pwFbName" placeholder="Your name" autocomplete="name" /></div>' +
        '<div class="pw-fb-field"><input type="email" id="pwFbEmail" placeholder="Your email" autocomplete="email" /></div>' +
        '<div class="pw-fb-field"><textarea id="pwFbMsg" rows="3" placeholder="Tell us what\'s on your mind..."></textarea></div>' +
        '<div class="pw-fb-success-msg" id="pwFbSuccess">Thanks! We\'ve received your message. ✅</div>' +
        '<button class="pw-fb-submit" id="pwFbSubmit">Send Message</button>' +
        '<hr class="pw-fb-divider" />' +
        '<a class="pw-fb-wa-link" href="https://chat.whatsapp.com/EHIitALME7RLuWP2wThMcL?mode=gi_t" target="_blank" rel="noopener noreferrer">' +
          '<svg viewBox="0 0 24 24" width="15" height="15" fill="#25D366">' +
            '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>' +
          '</svg>' +
          'Prefer to chat directly? Join our WhatsApp community &rarr;' +
        '</a>' +
      '</div>';

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    var selectedType = 'Feedback';
    var isOpen = false;

    function openPanel() {
      isOpen = true;
      panel.classList.add('pw-open');
      sessionStorage.setItem('pw_bubble_seen', '1');
      btn.classList.remove('pw-pulse');
    }

    function closePanel() {
      isOpen = false;
      panel.classList.remove('pw-open');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen ? closePanel() : openPanel();
    });

    panel.querySelector('.pw-fb-close').addEventListener('click', closePanel);

    panel.querySelectorAll('.pw-fb-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        panel.querySelectorAll('.pw-fb-pill').forEach(function (p) { p.classList.remove('pw-active'); });
        pill.classList.add('pw-active');
        selectedType = pill.dataset.type;
      });
    });

    panel.querySelector('#pwFbSubmit').addEventListener('click', function () {
      var name    = (panel.querySelector('#pwFbName').value || '').trim();
      var email   = (panel.querySelector('#pwFbEmail').value || '').trim();
      var message = (panel.querySelector('#pwFbMsg').value || '').trim();

      if (!name || !email || !message) {
        alert('Please fill in your name, email, and a message.');
        return;
      }

      try {
        var list = JSON.parse(localStorage.getItem('pw_feedback') || '[]');
        list.unshift({ type: selectedType, name: name, email: email, message: message, page: window.location.pathname, sentAt: new Date().toISOString() });
        localStorage.setItem('pw_feedback', JSON.stringify(list));
      } catch (err) {}

      var succ = panel.querySelector('#pwFbSuccess');
      succ.style.display = 'block';
      panel.querySelector('#pwFbSubmit').style.display = 'none';

      setTimeout(function () {
        succ.style.display = 'none';
        panel.querySelector('#pwFbSubmit').style.display = '';
        panel.querySelector('#pwFbName').value  = '';
        panel.querySelector('#pwFbEmail').value = '';
        panel.querySelector('#pwFbMsg').value   = '';
        panel.querySelectorAll('.pw-fb-pill').forEach(function (p) { p.classList.remove('pw-active'); });
        panel.querySelector('[data-type="Feedback"]').classList.add('pw-active');
        selectedType = 'Feedback';
        closePanel();
      }, 3000);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closePanel();
    });

    document.addEventListener('click', function (e) {
      if (isOpen && !panel.contains(e.target) && !btn.contains(e.target)) closePanel();
    });
  });
})();
