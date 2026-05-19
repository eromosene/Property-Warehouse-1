/* ══════════════════════════════════════════════════
   DASHBOARD JS — Property Warehouse
══════════════════════════════════════════════════ */

/* ── Guard: redirect to login if not authenticated ── */
const currentUser = JSON.parse(localStorage.getItem("pw_current_user") || "null");
if (!currentUser || currentUser.role !== "tenant") {
    window.location.href = "auth.html";
}

/* ── DATA ── */
const IMAGES = [
    "IMG-20260512-WA0088.jpg",
    "IMG-20260512-WA0021.jpg",
    "IMG-20260512-WA0053.jpg",
    "IMG-20260512-WA0089.jpg",
    "IMG-20260512-WA0087.jpg"
];

const userArea = currentUser?.area || "Lekki";

const savedHomes = [
    { id: 1, name: "3 Bed Apartment", location: "Lekki Phase 1, Lagos", price: "₦2,400,000/yr", img: IMAGES[0], liked: true },
    { id: 2, name: "2 Bed Flat",       location: "Ikoyi, Lagos Island",   price: "₦1,800,000/yr", img: IMAGES[1], liked: true },
    { id: 3, name: "4 Bed Duplex",     location: "Yaba, Mainland",        price: "₦2,800,000/yr", img: IMAGES[2], liked: true },
    { id: 4, name: "2 Bed Apartment",  location: "Ajah, Lagos",           price: "₦1,200,000/yr", img: IMAGES[3], liked: true },
    { id: 5, name: "3 Bed Terrace",    location: "Ikeja, Lagos",          price: "₦1,950,000/yr", img: IMAGES[4], liked: false }
];

const recommended = [
    {
        id: 10, name: "Luxury 3 Bedroom Apartment", location: userArea + ", Lagos",
        price: "₦2,400,000/yr", movein: "₦2,800,000", img: IMAGES[0],
        beds: 3, baths: 3, parking: true, views: 342, monthly: true
    },
    {
        id: 11, name: "2 Bedroom Terrace Duplex", location: "Ajah, Lagos",
        price: "₦1,500,000/yr", movein: "₦1,750,000", img: IMAGES[1],
        beds: 2, baths: 3, parking: true, views: 298, monthly: true
    },
    {
        id: 12, name: "Studio Apartment", location: "Surulere, Lagos",
        price: "₦800,000/yr", movein: "₦900,000", img: IMAGES[2],
        beds: 1, baths: 1, parking: true, views: 189, monthly: true
    },
    {
        id: 13, name: "3 Bedroom Flat", location: "Yaba, Mainland",
        price: "₦1,900,000/yr", movein: "₦2,200,000", img: IMAGES[3],
        beds: 3, baths: 2, parking: true, views: 156, monthly: true
    }
];

const messages = [
    {
        name: "Mr. Adeyemi Johnson", initials: "AJ", verified: true,
        text: "Hi Daniel, the apartment is still available. When would you like to inspect?",
        time: "2m ago", unread: true, img: IMAGES[4]
    },
    {
        name: "Blessing Okafor", initials: "BO", verified: true,
        text: "Thanks for your interest! I have an opening this Saturday at 11am.",
        time: "1h ago", unread: true, img: IMAGES[1]
    },
    {
        name: "Tunde Bakare", initials: "TB", verified: true,
        text: "Please let me know if you need more information.",
        time: "Yesterday", unread: false, img: IMAGES[3]
    }
];

const activities = [
    {
        type: "saved",   icon: "heart",
        desc: "You saved Luxury 3 Bed Apartment in " + userArea,
        time: "2 hours ago"
    },
    {
        type: "inspect", icon: "calendar",
        desc: "You scheduled an inspection in Yaba",
        time: "Today, 10:30 AM"
    },
    {
        type: "applied", icon: "file",
        desc: "You applied for 2 Bedroom Flat in Ikoyi",
        time: "Yesterday, 4:15 PM"
    },
    {
        type: "payment", icon: "credit",
        desc: "Payment of ₦1,200,000 recorded",
        time: "May 20, 2025"
    }
];

const inspections = [
    { month: "MAY", day: "24", name: "Lekki 3 Bed Apartment", loc: "Lekki Phase 1", time: "10:00 AM", img: IMAGES[0] },
    { month: "MAY", day: "25", name: "2 Bedroom Flat",         loc: "Yaba, Mainland",time: "1:00 PM",  img: IMAGES[2] },
    { month: "MAY", day: "26", name: "4 Bed Duplex",           loc: "Ajah, Lagos",   time: "11:00 AM", img: IMAGES[3] }
];

/* ── GREETING ── */
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
}

function populateUser() {
    const fn   = currentUser.firstName || "User";
    const ln   = currentUser.lastName  || "";
    const full = `${fn} ${ln}`.trim();
    const initials = (fn[0] + (ln[0] || fn[1] || "")).toUpperCase();

    document.getElementById("dbGreeting").innerHTML =
        `${getGreeting()}, <span class="greet-name">${fn}</span> <span>👋</span>`;

    const areaNote = currentUser.area ? ` in ${currentUser.area}` : " in Lagos";
    document.getElementById("dbSubtitle").textContent =
        `Let's help you find your perfect space${areaNote}.`;

    document.getElementById("dbAvatar").textContent   = initials;
    document.getElementById("dbUserName").textContent = full;

    /* budget-driven affordability */
    const budgetMap = {
        "Under ₦500,000/yr":            { maxRent: "₦500,000",   pct: 22, spent: 250000,   budget: 500000   },
        "₦500,000 – ₦1,000,000/yr":     { maxRent: "₦1,000,000", pct: 25, spent: 600000,   budget: 1000000  },
        "₦1,000,000 – ₦2,000,000/yr":   { maxRent: "₦1,500,000", pct: 27, spent: 900000,   budget: 1500000  },
        "₦2,000,000 – ₦3,500,000/yr":   { maxRent: "₦2,000,000", pct: 28, spent: 1200000,  budget: 2000000  },
        "Above ₦3,500,000/yr":           { maxRent: "₦3,500,000", pct: 30, spent: 2000000,  budget: 3500000  }
    };
    const b = budgetMap[currentUser.budget] || budgetMap["₦2,000,000 – ₦3,500,000/yr"];

    document.getElementById("maxRent").innerHTML = `${b.maxRent} <small>/yr</small>`;
    document.getElementById("gaugePct").textContent = `${b.pct}%`;

    const circ = 2 * Math.PI * 50; // ~314.16
    const filled = (b.pct / 100) * circ;
    document.getElementById("gaugeFill").setAttribute(
        "stroke-dasharray", `${filled.toFixed(1)} ${(circ - filled).toFixed(1)}`
    );

    const left = b.budget - b.spent;
    const pct  = Math.round((b.spent / b.budget) * 100);
    document.getElementById("rentBudgetLabel").innerHTML = `${b.maxRent} <small>/mo</small>`;
    document.getElementById("payBarFill").style.width = pct + "%";
    document.getElementById("spentLabel").textContent  = `₦${b.spent.toLocaleString()} spent`;
    document.getElementById("leftLabel").textContent   = `₦${left.toLocaleString()} left`;
}

/* ── SVG ICON HELPERS ── */
function activityIconSVG(type) {
    const icons = {
        heart:    `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
        calendar: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        file:     `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        credit:   `<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`
    };
    return icons[type] || icons.file;
}

function amenityIcon(type) {
    const icons = {
        bed:     `<svg viewBox="0 0 24 24"><path d="M2 9V4h20v5"/><path d="M2 9a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v11H2z"/><path d="M2 16h20"/></svg>`,
        bath:    `<svg viewBox="0 0 24 24"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" y1="5" x2="8" y2="7"/><path d="M22 12H4"/></svg>`,
        parking: `<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M9 9h3a2 2 0 0 1 0 4H9v-4zm0 4v3"/></svg>`
    };
    return icons[type] || "";
}

/* ── RENDER: SAVED HOMES ── */
function renderSaved() {
    const track = document.getElementById("savedTrack");
    track.innerHTML = savedHomes.map(h => `
        <div class="saved-card" data-id="${h.id}">
            <div class="saved-card-img">
                <img src="${h.img}" alt="${h.name}" loading="lazy">
                <button class="saved-heart ${h.liked ? "liked" : ""}" type="button" data-id="${h.id}" aria-label="Save">
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
            </div>
            <div class="saved-card-body">
                <div class="saved-location">${h.location}</div>
                <div class="saved-name">${h.name}</div>
                <div class="saved-price-row">
                    <span class="saved-price">${h.price}</span>
                    <span class="verified-badge">Verified</span>
                </div>
            </div>
        </div>
    `).join("");

    /* heart toggle */
    track.querySelectorAll(".saved-heart").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            btn.classList.toggle("liked");
            const svg = btn.querySelector("svg path");
            if (btn.classList.contains("liked")) {
                svg.setAttribute("fill", "#e53e3e");
                svg.setAttribute("stroke", "#e53e3e");
            } else {
                svg.setAttribute("fill", "none");
                svg.setAttribute("stroke", "currentColor");
            }
        });
    });

    /* open quick-view on card click */
    track.querySelectorAll(".saved-card").forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".saved-heart")) return;
            const id   = +card.dataset.id;
            const prop = savedHomes.find(h => h.id === id);
            if (prop) openQuickView({ ...prop, beds: 3, baths: 2, parking: true });
        });
    });
}

/* ── RENDER: RECOMMENDED ── */
function renderRec() {
    const grid = document.getElementById("recGrid");
    grid.innerHTML = recommended.map(p => `
        <div class="rec-card" data-id="${p.id}">
            <div class="rec-card-img">
                <img src="${p.img}" alt="${p.name}" loading="lazy">
                <div class="rec-badges">
                    ${p.monthly ? `<span class="rec-badge verified">✓ Verified</span><span class="rec-badge monthly">● Monthly</span>` : ""}
                </div>
                <span class="rec-views">👁 ${p.views}</span>
            </div>
            <div class="rec-card-body">
                <div class="rec-name">${p.name}</div>
                <div class="rec-loc">${p.location}</div>
                <div class="rec-amenities">
                    <span class="rec-amenity">${amenityIcon("bed")} ${p.beds} Beds</span>
                    <span class="rec-amenity">${amenityIcon("bath")} ${p.baths} Baths</span>
                    ${p.parking ? `<span class="rec-amenity">${amenityIcon("parking")} Parking</span>` : ""}
                </div>
                <div class="rec-price">${p.price}</div>
                <div class="rec-movein">Move-in: <span>${p.movein}</span></div>
            </div>
        </div>
    `).join("");

    grid.querySelectorAll(".rec-card").forEach(card => {
        card.addEventListener("click", () => {
            const id   = +card.dataset.id;
            const prop = recommended.find(p => p.id === id);
            if (prop) openQuickView(prop);
        });
    });
}

/* ── RENDER: MESSAGES ── */
function renderMessages() {
    const list = document.getElementById("msgList");
    list.innerHTML = messages.map(m => `
        <div class="msg-item">
            <div class="msg-avatar">${m.initials}</div>
            <div class="msg-body">
                <div class="msg-name-row">
                    <span class="msg-name">${m.name}</span>
                    <span class="msg-verified">✓ Verified Landlord</span>
                    <span class="msg-time">${m.time}</span>
                </div>
                <div class="msg-text">${m.text}</div>
            </div>
            ${m.unread ? `<div class="msg-unread-dot"></div>` : ""}
        </div>
    `).join("");
}

/* ── RENDER: ACTIVITY ── */
function renderActivity() {
    const list = document.getElementById("activityList");
    list.innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-icon ${a.type}">${activityIconSVG(a.icon)}</div>
            <div class="activity-text">
                <div class="activity-desc">${a.desc}</div>
                <div class="activity-time">${a.time}</div>
            </div>
        </div>
    `).join("");
}

/* ── RENDER: INSPECTIONS ── */
function renderInspections() {
    const list = document.getElementById("inspectionList");
    list.innerHTML = inspections.map(i => `
        <div class="inspection-item">
            <img class="insp-img" src="${i.img}" alt="${i.name}">
            <div class="insp-date-block">
                <div class="insp-month">${i.month}</div>
                <div class="insp-day">${i.day}</div>
            </div>
            <div class="insp-info">
                <div class="insp-name">${i.name}</div>
                <div class="insp-loc">${i.loc}</div>
                <div class="insp-time">${i.time}</div>
            </div>
        </div>
    `).join("");
}

/* ── QUICK-VIEW MODAL ── */
function openQuickView(prop) {
    document.getElementById("qvImg").src           = prop.img;
    document.getElementById("qvImg").alt           = prop.name;
    document.getElementById("qvTitle").textContent = prop.name;
    document.getElementById("qvLocation").textContent = prop.location || prop.loc || "";
    document.getElementById("qvPrice").textContent = prop.price || "";
    document.getElementById("qvMeta").innerHTML    = `
        ${prop.beds    ? `<span class="qv-meta-item">${amenityIcon("bed")} ${prop.beds} Bedrooms</span>` : ""}
        ${prop.baths   ? `<span class="qv-meta-item">${amenityIcon("bath")} ${prop.baths} Bathrooms</span>` : ""}
        ${prop.parking ? `<span class="qv-meta-item">${amenityIcon("parking")} Parking</span>` : ""}
    `;
    document.getElementById("qvOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeQuickView() {
    document.getElementById("qvOverlay").classList.remove("open");
    document.body.style.overflow = "";
}

document.getElementById("qvClose").addEventListener("click", closeQuickView);
document.getElementById("qvOverlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeQuickView();
});
document.getElementById("qvContact").addEventListener("click", () => {
    closeQuickView();
    document.querySelector("[data-section='messages']")?.click();
});
document.getElementById("qvSchedule").addEventListener("click", () => {
    closeQuickView();
    showToast("Inspection request sent!");
});

/* ── SAVED CAROUSEL ARROWS ── */
function initCarouselArrows() {
    const track = document.getElementById("savedTrack");
    document.querySelector(".saved-prev")?.addEventListener("click", () => {
        const card = track.querySelector(".saved-card");
        track.scrollBy({ left: -(card.offsetWidth + 14), behavior: "smooth" });
    });
    document.querySelector(".saved-next")?.addEventListener("click", () => {
        const card = track.querySelector(".saved-card");
        track.scrollBy({ left: card.offsetWidth + 14, behavior: "smooth" });
    });
}

/* ── SIDEBAR NAV ── */
function initNav() {
    document.querySelectorAll(".db-nav-item, .db-user-dropdown a[data-section]").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            document.querySelectorAll(".db-nav-item").forEach(l => l.classList.remove("active"));
            const sidebarLink = document.querySelector(`.db-nav-item[data-section="${section}"]`);
            if (sidebarLink) sidebarLink.classList.add("active");
            closeDropdown();
            document.querySelector(".db-sidebar")?.classList.remove("open");
            showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} coming soon!`);
        });
    });
}

/* ── MOBILE SIDEBAR TOGGLE ── */
document.getElementById("dbMenuToggle")?.addEventListener("click", () => {
    document.querySelector(".db-sidebar").classList.toggle("open");
});

/* ── USER DROPDOWN ── */
function closeDropdown() {
    document.getElementById("dbUserDropdown").classList.remove("open");
}

document.getElementById("dbUserChip")?.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("dbUserDropdown").classList.toggle("open");
});

document.addEventListener("click", closeDropdown);

/* ── LOGOUT ── */
document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("pw_current_user");
    window.location.href = "auth.html";
});

/* ── TOAST ── */
function showToast(msg) {
    let toast = document.querySelector(".db-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "db-toast";
        toast.style.cssText = `
            position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(80px);
            background:var(--ink); color:#fff; padding:12px 22px; border-radius:10px;
            font-size:13px; font-weight:700; box-shadow:0 10px 30px rgba(9,24,42,0.22);
            z-index:999; transition:transform .35s cubic-bezier(.16,1,.3,1); white-space:nowrap;
            font-family:var(--font-sans);
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => {
        toast.style.transform = "translateX(-50%) translateY(0)";
    });
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.transform = "translateX(-50%) translateY(80px)";
    }, 2800);
}

/* ── SEARCH ── */
document.querySelector(".db-search input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
        showToast(`Searching for "${e.target.value.trim()}"…`);
    }
});

/* ── NOTIFICATIONS ── */
document.querySelector(".db-notif-btn")?.addEventListener("click", () => {
    showToast("You have 6 unread notifications");
});

/* ── SCHEDULE BTN ── */
document.querySelector(".db-schedule-btn")?.addEventListener("click", () => {
    showToast("Open the Inspections page to schedule a new visit.");
});

/* ── ADJUST BUDGET BTN ── */
document.querySelector(".db-adjust-btn")?.addEventListener("click", () => {
    showToast("Budget adjustment coming soon!");
});

/* ── REMINDER BTN ── */
document.querySelector(".db-reminder-btn")?.addEventListener("click", () => {
    showToast("Payment reminders set up successfully!");
});

/* ── ADD SVG GRADIENT DEF for gauge ── */
function injectGaugeDefs() {
    const svg = document.querySelector(".afford-gauge");
    if (!svg) return;
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#15935f"/>
            <stop offset="100%" stop-color="#f5a623"/>
        </linearGradient>
    `;
    svg.prepend(defs);
}

/* ── INIT ── */
function init() {
    populateUser();
    renderSaved();
    renderRec();
    renderMessages();
    renderActivity();
    renderInspections();
    initCarouselArrows();
    initNav();
    injectGaugeDefs();
}

document.addEventListener("DOMContentLoaded", init);
