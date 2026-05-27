let currentStep = 1;
let currentUser = null;
const uploadedImages = [];

/* ── Auth Guard ── */
document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('pw_current_user');
  if (!raw) { location.href = 'auth.html#landlord'; return; }
  currentUser = JSON.parse(raw);
  if (currentUser.role !== 'landlord') { location.href = 'auth.html#landlord'; return; }

  const name = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;
  document.getElementById('clUserName').textContent = name;
  document.getElementById('clContactName').value = name;
  if (currentUser.phone) document.getElementById('clPhone').value = currentUser.phone;

  // Description char counter
  document.getElementById('clDesc').addEventListener('input', () => {
    const len = document.getElementById('clDesc').value.length;
    document.getElementById('clDescCount').textContent = `${len}/500`;
  });

  // WhatsApp preview
  document.getElementById('clWhatsapp').addEventListener('input', () => {
    const num = document.getElementById('clWhatsapp').value.trim();
    document.getElementById('clWaPreviewLink').textContent = num ? `wa.me/${num}` : 'wa.me/—';
  });

  // Draft btn
  document.getElementById('clDraftBtn').addEventListener('click', () => {
    alert('Draft saved! (Tip: Your form data is preserved while on this page.)');
  });

  updateProgress();
  initPhotoUpload();
});

/* ── Photo Tab Switching ── */
function switchPhotoTab(tab) {
  const isUpload = tab === 'upload';
  document.getElementById('clTabUpload').classList.toggle('active', isUpload);
  document.getElementById('clTabUrl').classList.toggle('active', !isUpload);
  document.getElementById('clUploadPane').style.display = isUpload ? '' : 'none';
  document.getElementById('clUrlPane').style.display = isUpload ? 'none' : '';
}

/* ── Photo Upload ── */
function initPhotoUpload() {
  const dropzone  = document.getElementById('clDropzone');
  const fileInput = document.getElementById('clFileInput');
  if (!dropzone) return;

  document.getElementById('clDropLink').addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', e => {
    handleFiles([...e.target.files]);
    fileInput.value = '';
  });

  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('cl-dropzone--over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('cl-dropzone--over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('cl-dropzone--over');
    handleFiles([...e.dataTransfer.files].filter(f => f.type.startsWith('image/')));
  });
}

function handleFiles(files) {
  const remaining = 6 - uploadedImages.length;
  if (!remaining) { alert('Maximum 6 photos allowed.'); return; }
  files.slice(0, remaining).forEach(file => {
    if (file.size > 5 * 1024 * 1024) { alert(`"${file.name}" exceeds the 5 MB limit.`); return; }
    const reader = new FileReader();
    reader.onload = e => compressImage(e.target.result, compressed => {
      uploadedImages.push(compressed);
      renderThumbs();
    });
    reader.readAsDataURL(file);
  });
}

function compressImage(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    const MAX = 900;
    let w = img.width, h = img.height;
    if (w > MAX || h > MAX) {
      if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
      else        { w = Math.round(w * MAX / h); h = MAX; }
    }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    callback(canvas.toDataURL('image/jpeg', 0.82));
  };
  img.src = dataUrl;
}

function renderThumbs() {
  const strip = document.getElementById('clThumbStrip');
  const count = document.getElementById('clPhotoCount');
  if (count) count.textContent = `${uploadedImages.length} / 6`;
  if (!strip) return;
  strip.innerHTML = uploadedImages.map((src, i) => `
    <div class="cl-thumb">
      <img src="${src}" alt="Photo ${i + 1}" />
      ${i === 0 ? '<span class="cl-thumb-badge">Cover</span>' : ''}
      <button class="cl-thumb-remove" type="button" onclick="removeThumb(${i})" title="Remove">&#215;</button>
    </div>`).join('');
}

function removeThumb(idx) {
  uploadedImages.splice(idx, 1);
  renderThumbs();
}

/* ── Step Navigation ── */
function goToStep(n) {
  if (n > currentStep && !validateStep(currentStep)) return;

  document.getElementById(`clStep${currentStep}`).classList.add('hidden');
  if (currentStep < n) markDone(currentStep);

  currentStep = n;
  document.getElementById(`clStep${currentStep}`).classList.remove('hidden');
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function markDone(step) {
  const el = document.querySelector(`.cl-step[data-step="${step}"]`);
  el.classList.remove('active');
  el.classList.add('done');
  const line = el.nextElementSibling;
  if (line && line.classList.contains('cl-step-line')) line.classList.add('done');
}

function updateProgress() {
  document.querySelectorAll('.cl-step').forEach(s => {
    const n = Number(s.dataset.step);
    s.classList.remove('active', 'done');
    if (n < currentStep) s.classList.add('done');
    if (n === currentStep) s.classList.add('active');
  });
  document.querySelectorAll('.cl-step-line').forEach((line, idx) => {
    line.classList.toggle('done', idx + 1 < currentStep);
  });
}

/* ── Validation ── */
function validateStep(step) {
  let valid = true;

  const clear = () => document.querySelectorAll('.cl-error').forEach(el => {
    el.classList.remove('cl-error');
    el.parentElement.querySelectorAll('.cl-error-msg').forEach(e => e.remove());
  });

  const mark = (id, msg) => {
    const el = document.getElementById(id);
    el.classList.add('cl-error');
    let m = el.parentElement.querySelector('.cl-error-msg');
    if (!m) { m = document.createElement('p'); m.className = 'cl-error-msg'; el.parentElement.appendChild(m); }
    m.textContent = msg;
    valid = false;
  };

  clear();

  if (step === 1) {
    if (!document.getElementById('clTitle').value.trim()) mark('clTitle', 'Please enter a title.');
    if (!document.getElementById('clArea').value.trim()) mark('clArea', 'Please enter the area name.');
    if (!document.getElementById('clLga').value) mark('clLga', 'Please select an LGA.');
    if (!document.getElementById('clAddress').value.trim()) mark('clAddress', 'Please enter the full address.');
    if (!document.getElementById('clType').value) mark('clType', 'Please select a property type.');
    if (!document.getElementById('clBeds').value) mark('clBeds', 'Required.');
    if (!document.getElementById('clBaths').value) mark('clBaths', 'Required.');
    if (!document.getElementById('clDesc').value.trim()) mark('clDesc', 'Please add a description.');
  }

  if (step === 2) {
    if (!document.getElementById('clRent').value || Number(document.getElementById('clRent').value) <= 0)
      mark('clRent', 'Please enter a valid annual rent.');
  }

  if (step === 4) {
    if (!document.getElementById('clContactName').value.trim()) mark('clContactName', 'Please enter your name.');
    if (!document.getElementById('clWhatsapp').value.trim()) mark('clWhatsapp', 'Please enter your WhatsApp number.');
  }

  return valid;
}

/* ── Price Preview ── */
function updatePricePreview() {
  const rent    = Number(document.getElementById('clRent').value)    || 0;
  const caution = Number(document.getElementById('clCaution').value) || 0;
  const service = Number(document.getElementById('clService').value) || 0;
  const total   = rent + caution + service;

  document.getElementById('prevRent').textContent    = formatNaira(rent);
  document.getElementById('prevCaution').textContent = formatNaira(caution);
  document.getElementById('prevService').textContent = formatNaira(service);
  document.getElementById('prevTotal').textContent   = formatNaira(total);
}

/* ── Publish ── */
function publishListing() {
  if (!validateStep(4)) return;

  const rent    = Number(document.getElementById('clRent').value)    || 0;
  const caution = Number(document.getElementById('clCaution').value) || 0;
  const service = Number(document.getElementById('clService').value) || 0;

  const urlImages = [...document.querySelectorAll('.cl-img-url')]
    .map(i => i.value.trim()).filter(u => u.length > 0);
  const images = [...uploadedImages, ...urlImages];
  if (!images.length) {
    images.push('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80');
  }

  const amenities = [...document.querySelectorAll('input[name="amenity"]:checked')].map(i => i.value);
  const area = document.getElementById('clArea').value.trim();
  const title = document.getElementById('clTitle').value.trim();
  const waNum = document.getElementById('clWhatsapp').value.trim();
  const name  = document.getElementById('clContactName').value.trim();

  const listing = {
    id:                generateListingId(),
    landlordId:        currentUser.email,
    landlordName:      name,
    landlordPhone:     document.getElementById('clPhone').value.trim(),
    landlordWhatsApp:  waNum,
    landlordSince:     String(new Date().getFullYear()),
    landlordVerified:  false,
    landlordListings:  1,
    title,
    area,
    lga:               document.getElementById('clLga').value,
    address:           document.getElementById('clAddress').value.trim(),
    type:              document.getElementById('clType').value,
    rentPerYear:       rent,
    cautionFee:        caution,
    serviceCharge:     service,
    totalMoveIn:       rent + caution + service,
    isVerified:        false,
    isMonthly:         document.getElementById('clMonthly').checked,
    beds:              Number(document.getElementById('clBeds').value) || 0,
    baths:             Number(document.getElementById('clBaths').value) || 1,
    amenities,
    description:       document.getElementById('clDesc').value.trim(),
    images,
    views:             0,
    createdAt:         new Date().toISOString().split('T')[0]
  };

  saveListing(listing);

  // Show success
  document.getElementById(`clStep4`).classList.add('hidden');
  document.getElementById('clSuccess').classList.remove('hidden');
  document.getElementById('clSuccessSummary').innerHTML = `
    <strong>${title}</strong>
    <p>Area: <span>${area}</span></p>
    <p>Annual Rent: <span>${formatNaira(rent)}</span></p>
    <p>Total Move-in: <span>${formatNaira(rent + caution + service)}</span></p>
  `;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update progress to done
  currentStep = 5;
  document.querySelectorAll('.cl-step').forEach(s => s.classList.add('done'));
  document.querySelectorAll('.cl-step-line').forEach(l => l.classList.add('done'));
}

/* ── Reset ── */
function resetForm() {
  document.getElementById('clSuccess').classList.add('hidden');
  currentStep = 1;
  document.querySelectorAll('.cl-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('clStep1').classList.remove('hidden');
  uploadedImages.length = 0;
  renderThumbs();
  document.querySelectorAll('input[type="text"], input[type="number"], input[type="tel"], input[type="url"], textarea').forEach(i => i.value = '');
  document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
  document.getElementById('clDescCount').textContent = '0/500';
  updatePricePreview();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
