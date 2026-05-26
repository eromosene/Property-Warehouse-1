/* ═══════════════════════════════════════════
   LEAFLET HEAT MAP — Lagos, Nigeria
═══════════════════════════════════════════ */

// Lagos heat data: [lat, lng, intensity]
// Real coordinates for Lagos neighbourhoods
const HEAT_POINTS = [
  // Lekki Phase 1 — very high demand
  [6.4478, 3.4733, 1.0],
  [6.4460, 3.4700, 0.95],
  [6.4500, 3.4760, 0.9],
  [6.4430, 3.4680, 0.85],

  // Ikoyi — high / premium
  [6.4550, 3.4300, 0.88],
  [6.4530, 3.4260, 0.82],
  [6.4570, 3.4350, 0.80],

  // Victoria Island
  [6.4281, 3.4219, 0.85],
  [6.4260, 3.4180, 0.80],

  // Yaba — emerging / high
  [6.5050, 3.3750, 0.76],
  [6.5030, 3.3720, 0.72],
  [6.5070, 3.3780, 0.70],

  // Surulere — high demand
  [6.4950, 3.3540, 0.81],
  [6.4920, 3.3510, 0.78],
  [6.4970, 3.3570, 0.74],

  // Gbagada — affordable
  [6.5520, 3.3870, 0.68],
  [6.5490, 3.3840, 0.64],

  // Ajah — fast rising
  [6.4688, 3.5699, 0.72],
  [6.4660, 3.5670, 0.68],
  [6.4710, 3.5730, 0.65],

  // Sangotedo — emerging
  [6.4376, 3.6085, 0.59],
  [6.4350, 3.6050, 0.55],

  // Ikeja — affordable
  [6.6018, 3.3515, 0.65],
  [6.5990, 3.3480, 0.60],

  // Agege
  [6.6175, 3.3220, 0.51],
  [6.6150, 3.3190, 0.47],

  // Apapa
  [6.4483, 3.3614, 0.55],

  // Lagos Island
  [6.4541, 3.3947, 0.70],
  [6.4510, 3.3920, 0.65],

  // Ojodu / Berger
  [6.6390, 3.3640, 0.48],
];

// Initialise map
const map = L.map("lagosMap", {
  center: [6.5244, 3.3792],
  zoom: 11,
  zoomControl: true,
  scrollWheelZoom: false,
});

// Tile layer — CartoDB Positron (clean, light basemap, free)
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }
).addTo(map);

// Heat layer
const heatLayer = L.heatLayer(HEAT_POINTS, {
  radius: 40,
  blur: 30,
  maxZoom: 13,
  max: 1.0,
  gradient: {
    0.0: "#4575b4",
    0.25: "#74add1",
    0.5: "#fdae61",
    0.75: "#f46d43",
    1.0: "#d73027",
  },
}).addTo(map);

// Area markers with popups
const AREAS = [
  { name: "Lekki Phase 1", lat: 6.4478, lng: 3.4733, score: 92, tag: "High Demand", rent: "₦2.8M/yr" },
  { name: "Ikoyi",         lat: 6.4550, lng: 3.4300, score: 88, tag: "Premium",     rent: "₦3.5M/yr" },
  { name: "Victoria Island",lat: 6.4281,lng: 3.4219, score: 85, tag: "Premium",     rent: "₦4.2M/yr" },
  { name: "Surulere",      lat: 6.4950, lng: 3.3540, score: 81, tag: "High Demand", rent: "₦1.45M/yr" },
  { name: "Yaba",          lat: 6.5050, lng: 3.3750, score: 76, tag: "Emerging",    rent: "₦1.2M/yr" },
  { name: "Ajah",          lat: 6.4688, lng: 3.5699, score: 72, tag: "Emerging",    rent: "₦1.1M/yr" },
  { name: "Gbagada",       lat: 6.5520, lng: 3.3870, score: 68, tag: "Affordable",  rent: "₦900K/yr" },
  { name: "Ikeja",         lat: 6.6018, lng: 3.3515, score: 65, tag: "Affordable",  rent: "₦850K/yr" },
  { name: "Sangotedo",     lat: 6.4376, lng: 3.6085, score: 59, tag: "Emerging",    rent: "₦750K/yr" },
  { name: "Agege",         lat: 6.6175, lng: 3.3220, score: 51, tag: "Affordable",  rent: "₦600K/yr" },
];

function tagColor(tag) {
  if (tag === "High Demand") return "#e8472d";
  if (tag === "Premium")     return "#7c3aed";
  if (tag === "Emerging")    return "#1a9e4a";
  return "#b45309";
}

AREAS.forEach(area => {
  const icon = L.divIcon({
    className: "",
    html: `<div style="
      background:#fff;
      border:2px solid ${tagColor(area.tag)};
      color:#09182a;
      font-family:Manrope,sans-serif;
      font-size:10px;
      font-weight:800;
      padding:4px 8px;
      border-radius:8px;
      white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,.15);
      cursor:pointer;
    ">${area.name}</div>`,
    iconAnchor: [0, 0],
  });

  const marker = L.marker([area.lat, area.lng], { icon }).addTo(map);
  marker.bindPopup(`
    <div style="font-family:Manrope,sans-serif;min-width:160px;">
      <strong style="font-size:14px;">${area.name}</strong>
      <span style="display:inline-block;margin-left:6px;background:${tagColor(area.tag)};color:#fff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:999px;">${area.tag}</span>
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;">
          <span style="color:#5d6876;">Demand Score</span>
          <strong>${area.score}/100</strong>
        </div>
        <div style="height:5px;background:#f0eeeb;border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${area.score}%;background:linear-gradient(90deg,#ff4d4d,#ff9900);border-radius:999px;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:4px;">
          <span style="color:#5d6876;">Avg Rent</span>
          <strong>${area.rent}</strong>
        </div>
      </div>
      <a href="index.html#listings" style="display:block;margin-top:12px;text-align:center;background:#09182a;color:#fff;font-size:11px;font-weight:700;padding:7px;border-radius:7px;text-decoration:none;">View Properties</a>
    </div>
  `, { maxWidth: 200 });
});

/* ═══ TAB FILTERING ═══ */
const tabs = document.querySelectorAll(".hm-tabs button");
const cards = document.querySelectorAll(".hm-area-card");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(btn => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    const filter = tab.dataset.filter;

    cards.forEach(card => {
      if (filter === "all" || card.dataset.category === filter) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  });
});

/* ═══ VIEW BY SELECT ═══ */
const viewBySelect = document.getElementById("viewBySelect");
viewBySelect.addEventListener("change", () => {
  const val = viewBySelect.value;

  if (val === "rent") {
    heatLayer.setOptions({ gradient: {
      0.0: "#f7fbff", 0.4: "#6baed6", 0.7: "#2171b5", 1.0: "#08306b"
    }});
  } else if (val === "listings") {
    heatLayer.setOptions({ gradient: {
      0.0: "#f7fcf5", 0.4: "#74c476", 0.7: "#238b45", 1.0: "#00441b"
    }});
  } else {
    heatLayer.setOptions({ gradient: {
      0.0: "#4575b4", 0.25: "#74add1", 0.5: "#fdae61", 0.75: "#f46d43", 1.0: "#d73027"
    }});
  }
});

/* ═══ REFRESH BUTTON ═══ */
const refreshBtn = document.getElementById("refreshBtn");
refreshBtn.addEventListener("click", () => {
  refreshBtn.disabled = true;
  refreshBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .8s linear infinite"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
    Refreshing…`;

  setTimeout(() => {
    refreshBtn.disabled = false;
    refreshBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      Refresh Data`;

    const dateEl = document.querySelector(".hm-data-updated");
    const now = new Date();
    dateEl.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      Data updated: ${now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  }, 1400);
});

/* ═══ DOWNLOAD BUTTON ═══ */
document.getElementById("downloadBtn").addEventListener("click", () => {
  alert("Report download will be available once you log in. Sign up free to access full market reports.");
});

/* ═══ MOBILE MENU ═══ */
const menuBtn = document.getElementById("hmMenuBtn");
const drawer = document.getElementById("hmDrawer");

menuBtn.addEventListener("click", () => {
  drawer.classList.toggle("open");
});

/* ═══ SPIN KEYFRAME (for refresh animation) ═══ */
const style = document.createElement("style");
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
