let currentStep = 1;
let currentUser = null;
const uploadedImages = [];
const uploadedDocs   = [];

/* ── Auth Guard ── */
document.addEventListener('DOMContentLoaded', async () => {
  PWOverlay.showLoading('Loading…');
  const { user, networkError } = await PWAuth.getSession();

  if (networkError) {
    PWOverlay.showError("Couldn't reach the server. Check your connection and try again.", {
      retry: () => location.reload(),
    });
    return;
  }
  if (!user || user.role !== 'landlord') { location.href = 'auth.html#landlord'; return; }
  currentUser = user;
  PWOverlay.hide();

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
      // Uploads to Supabase as soon as it's picked (not batched at Publish) so the remove
      // button on each thumb has a real storage key to delete — see removeThumb().
      const item = { previewSrc: compressed, key: null, url: null, status: 'uploading' };
      uploadedImages.push(item);
      renderThumbs();
      uploadOneImage(item);
    });
    reader.readAsDataURL(file);
  });
}

async function uploadOneImage(item) {
  try {
    const blob = await dataUrlToBlob(item.previewSrc);
    const formData = new FormData();
    formData.append('images', blob, 'photo.jpg');
    const token = localStorage.getItem(PW_TOKEN_KEY);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(API_BASE + '/api/uploads/images', { method: 'POST', credentials: 'include', headers, body: formData });
    if (!res.ok) throw new Error('upload failed');
    const data = await res.json();
    item.key = data.files[0].key;
    item.url = data.files[0].url;
    item.status = 'done';
  } catch (err) {
    item.status = 'error';
  }
  renderThumbs();
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
  strip.innerHTML = uploadedImages.map((item, i) => `
    <div class="cl-thumb">
      <img src="${item.previewSrc}" alt="Photo ${i + 1}" />
      ${i === 0 ? '<span class="cl-thumb-badge">Cover</span>' : ''}
      ${item.status === 'uploading' ? '<div class="cl-thumb-spinner"></div>' : ''}
      ${item.status === 'error' ? '<div class="cl-thumb-error" title="Upload failed">!</div>' : ''}
      <button class="cl-thumb-remove" type="button" onclick="removeThumb(${i})" title="Remove" ${item.status === 'uploading' ? 'disabled' : ''}>&#215;</button>
    </div>`).join('');
}

// Removes the thumb from the UI immediately, then best-effort deletes the file from Supabase
// Storage if it finished uploading (nothing to delete yet if it's still mid-upload or errored).
async function removeThumb(idx) {
  const item = uploadedImages[idx];
  if (!item || item.status === 'uploading') return;
  uploadedImages.splice(idx, 1);
  renderThumbs();
  if (!item.key) return;
  try {
    const token = localStorage.getItem(PW_TOKEN_KEY);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/api/uploads/images/${item.key}`, { method: 'DELETE', credentials: 'include', headers });
    if (!res.ok) throw new Error('delete failed');
  } catch (err) {
    // The photo is already gone from the form either way — it won't be published — but the file
    // may still be sitting in storage, so make that visible instead of failing silently.
    alert("Removed from the form, but couldn't confirm it was deleted from the server.");
  }
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
      // Uploads to Supabase as soon as it's picked (not batched at Publish) so the remove
      // button on each row has a real storage key to delete — see removeDoc().
      const item = { name: file.name, type: file.type, data: e.target.result, key: null, status: 'uploading' };
      uploadedDocs.push(item);
      renderDocList();
      uploadOneDoc(item);
    };
    reader.readAsDataURL(file);
  });
}

async function uploadOneDoc(item) {
  try {
    const blob = await dataUrlToBlob(item.data);
    const formData = new FormData();
    formData.append('documents', blob, item.name);
    const token = localStorage.getItem(PW_TOKEN_KEY);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(API_BASE + '/api/uploads/documents', { method: 'POST', credentials: 'include', headers, body: formData });
    if (!res.ok) throw new Error('upload failed');
    const data = await res.json();
    console.log('uploadOneDoc: response', data);
    item.key = data.files[0].key;
    item.status = 'done';
  } catch (err) {
    item.status = 'error';
  }
  renderDocList();
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
    const status = doc.status === 'uploading' ? '<span class="cl-doc-status">Uploading…</span>'
      : doc.status === 'error' ? '<span class="cl-doc-status cl-doc-status--error">Failed</span>'
      : '';
    return `
    <div class="cl-doc-item">
      <div class="cl-doc-icon">${icon}</div>
      <div class="cl-doc-name">${doc.name}</div>
      ${status}
      <button class="cl-thumb-remove" type="button" onclick="removeDoc(${i})" title="Remove">&#215;</button>
    </div>`;
  }).join('');
}

// Removes the row from the UI immediately, then best-effort deletes the file from Supabase
// Storage if it finished uploading (nothing to delete yet if it's still mid-upload or errored).
// Always clickable — even mid-upload — so the button never silently swallows a click; if the
// item hasn't finished uploading yet there's simply no key to delete server-side.
async function removeDoc(idx) {
  const doc = uploadedDocs[idx];
  if (!doc) return;
  uploadedDocs.splice(idx, 1);
  renderDocList();
  if (!doc.key) return;
  try {
    const token = localStorage.getItem(PW_TOKEN_KEY);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/api/uploads/documents/${doc.key}`, { method: 'DELETE', credentials: 'include', headers });
    if (!res.ok) throw new Error('delete failed');
  } catch (err) {
    // The document is already gone from the form either way — it won't be published — but the
    // file may still be sitting in storage, so make that visible instead of failing silently.
    alert("Removed from the form, but couldn't confirm it was deleted from the server.");
  }
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

/* ── Upload helpers ──
   Multipart uploads must NOT carry a JSON Content-Type header (the browser sets the correct
   multipart boundary itself), so these call fetch() directly instead of going through
   PWApi.request (which defaults to Content-Type: application/json). The client-side
   compression in compressImage() is kept as-is — only the final "embed as base64" step is
   replaced with a real upload.

   Photos and documents upload to Supabase as soon as they're picked (uploadOneImage/uploadOneDoc,
   near handleFiles/handleDocFiles above) rather than in one batch at Publish — that's what gives
   each thumb/row a real storage key so its remove button can actually delete the file instead of
   just clearing a local preview. Publish then just reads the already-uploaded key/url off each
   item (see publishListing() below). */
async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}

function showPublishError(msg) {
  const publishBtn = document.getElementById('clPublishBtn');
  let err = document.getElementById('clPublishError');
  if (!err) {
    err = document.createElement('p');
    err.id = 'clPublishError';
    err.style.cssText = 'color:#c0392b;font-weight:700;font-size:13px;margin-top:10px;text-align:center';
    publishBtn.insertAdjacentElement('afterend', err);
  }
  err.textContent = msg;
}

function clearPublishError() {
  document.getElementById('clPublishError')?.remove();
}

/* ── Publish ── */
async function publishListing() {
  if (!validateStep(4)) { goToStep(4); return; }

  const publishBtn = document.getElementById('clPublishBtn');
  const originalBtnText = publishBtn.textContent;
  publishBtn.disabled = true;
  publishBtn.textContent = 'Publishing…';
  clearPublishError();

  const rent    = Number(document.getElementById('clRent').value)    || 0;
  const caution = Number(document.getElementById('clCaution').value) || 0;
  const service = Number(document.getElementById('clService').value) || 0;

  const urlImages = [...document.querySelectorAll('.cl-img-url')]
    .map(i => i.value.trim()).filter(u => u.length > 0);

  // Photos/documents already uploaded to Supabase as they were picked (see uploadOneImage/
  // uploadOneDoc) — just confirm nothing is still mid-upload or failed before publishing.
  if (uploadedImages.some(i => i.status === 'uploading') || uploadedDocs.some(d => d.status === 'uploading')) {
    showPublishError('Please wait for all photo/document uploads to finish before publishing.');
    publishBtn.disabled = false;
    publishBtn.textContent = originalBtnText;
    return;
  }
  if (uploadedImages.some(i => i.status === 'error')) {
    showPublishError('One of your photos failed to upload. Remove it and try again.');
    publishBtn.disabled = false;
    publishBtn.textContent = originalBtnText;
    return;
  }
  if (uploadedDocs.some(d => d.status === 'error')) {
    showPublishError('One of your documents failed to upload. Remove it and try again.');
    publishBtn.disabled = false;
    publishBtn.textContent = originalBtnText;
    return;
  }

  const images = [...uploadedImages.map(i => i.url), ...urlImages];
  if (!images.length) {
    images.push('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80');
  }

  const amenities = [...document.querySelectorAll('input[name="amenity"]:checked')].map(i => i.value);
  const docTypes  = [...document.querySelectorAll('input[name="docType"]:checked')].map(i => i.value);
  const area  = document.getElementById('clArea').value.trim();
  const title = document.getElementById('clTitle').value.trim();
  const waNum = document.getElementById('clWhatsapp').value.trim();
  const name  = document.getElementById('clContactName').value.trim();

  // landlordId/landlordSince/landlordVerified/landlordListings/totalMoveIn/views/createdAt/id
  // are no longer sent — the backend derives/assigns all of these (landlordId from the session,
  // the rest computed or defaulted server-side).
  const payload = {
    landlordName:      name,
    landlordPhone:     document.getElementById('clPhone').value.trim(),
    landlordWhatsApp:  waNum,
    title,
    area,
    lga:               document.getElementById('clLga').value,
    address:           document.getElementById('clAddress').value.trim(),
    type:              document.getElementById('clType').value,
    rentPerYear:       rent,
    cautionFee:        caution,
    serviceCharge:     service,
    isMonthly:         document.getElementById('clMonthly').checked,
    beds:              Number(document.getElementById('clBeds').value) || 0,
    baths:             Number(document.getElementById('clBaths').value) || 1,
    amenities,
    description:       document.getElementById('clDesc').value.trim(),
    images,
    documents:         uploadedDocs.map(d => d.key),
    ownershipDocTypes: docTypes,
  };

  const res = await PWApi.request('/api/listings', { method: 'POST', body: JSON.stringify(payload) });

  publishBtn.disabled = false;
  publishBtn.textContent = originalBtnText;

  if (!res.ok) {
    showPublishError(res.error === 'network'
      ? "Couldn't reach the server. Check your connection and try again."
      : (res.error || 'Something went wrong publishing your listing. Please try again.'));
    return;
  }

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
    <p style="margin-top:.75rem;padding:.6rem .9rem;background:#fff8ec;border-left:3px solid #e8a838;border-radius:4px;font-size:.85rem;color:#5a4a2a">
      ⏳ Your listing has been submitted for review and will go live once approved by our team.
    </p>
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
