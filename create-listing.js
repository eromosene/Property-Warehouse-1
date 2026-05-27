let currentStep = 1;
let currentUser = null;
const uploadedImages = [];
const uploadedDocs   = [];

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
  initDocUpload();
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

/* ── Document Upload ── */
function initDocUpload() {
  const dropzone = document.getElementById('clDocDropzone');
  const fileInput = document.getElementById('clDocInput');
  if (!dropzone || !fileInput) return;

  document.getElementById('clDocDropLink').addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', e => {
    handleDocFiles([...e.target.files]);
    fileInput.value = '';
  });

  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('cl-dropzone--over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('cl-dropzone--over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('cl-dropzone--over');
    handleDocFiles([...e.dataTransfer.files]);
  });
}

function handleDocFiles(files) {
  const remaining = 5 - uploadedDocs.length;
  if (!remaining) { alert('Maximum 5 documents allowed.'); return; }
  files.slice(0, remaining).forEach(file => {
    if (file.size > 10 * 1024 * 1024) { alert(`"${file.name}" exceeds the 10 MB limit.`); return; }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      alert(`"${file.name}" is not a supported format. Use PDF, JPG, or PNG.`); return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      uploadedDocs.push({ name: file.name, type: file.type, data: e.target.result });
      renderDocList();
    };
    reader.readAsDataURL(file);
  });
}

function renderDocList() {
  const list  = document.getElementById('clDocList');
  const count = document.getElementById('clDocCount');
  if (count) count.textContent = `${uploadedDocs.length} / 5`;
  if (!list) return;

  if (!uploadedDocs.length) { list.innerHTML = ''; return; }

  list.innerHTML = uploadedDocs.map((doc, i) => {
    const isPdf = doc.type === 'application/pdf' || doc.name.endsWith('.pdf');
    const icon  = isPdf
      ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#e53e3e" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>`
      : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#a97e4b" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
    return `
    <div class="cl-doc-item">
      <div class="cl-doc-icon">${icon}</div>
      <div class="cl-doc-name">${doc.name}</div>
      <button class="cl-thumb-remove" type="button" onclick="removeDoc(${i})" title="Remove">&#215;</button>
    </div>`;
  }).join('');
}

function removeDoc(idx) {
  uploadedDocs.splice(idx, 1);
  renderDocList();
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
  if (!validateStep(4)) { goToStep(4); return; }

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
  const docTypes  = [...document.querySelectorAll('input[name="docType"]:checked')].map(i => i.value);
  const area  = document.getElementById('clArea').value.trim();
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
    ownershipDocTypes: docTypes,
    ownershipDocCount: uploadedDocs.length,
    views:             0,
    createdAt:         new Date().toISOString().split('T')[0]
  };

  saveListing(listing);

  // Show success
  document.getElementById('clStep5').classList.add('hidden');
  document.getElementById('clSuccess').classList.remove('hidden');

  const docsNote = docTypes.length
    ? `<p>Ownership Docs: <span>${docTypes.join(', ')}</span></p>`
    : '';
  document.getElementById('clSuccessSummary').innerHTML = `
    <strong>${title}</strong>
    <p>Area: <span>${area}</span></p>
    <p>Annual Rent: <span>${formatNaira(rent)}</span></p>
    <p>Total Move-in: <span>${formatNaira(rent + caution + service)}</span></p>
    ${docsNote}
  `;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update progress to all done
  currentStep = 6;
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
  uploadedDocs.length   = 0;
  renderThumbs();
  renderDocList();
  document.querySelectorAll('input[type="text"], input[type="number"], input[type="tel"], input[type="url"], textarea').forEach(i => i.value = '');
  document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
  document.getElementById('clDescCount').textContent = '0/500';
  updatePricePreview();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
