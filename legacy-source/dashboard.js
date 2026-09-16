/* ══════════════════════════════════════════════════
   DASHBOARD JS — Property Warehouse
══════════════════════════════════════════════════ */

/* ── Auth guard ──
   Resolved asynchronously in boot() at the bottom of this file (was a synchronous
   localStorage read before the backend existed). Everything below that references
   currentUser is only ever called after boot() has set it. */
let currentUser = null;

/* ══════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════ */
const IMGS = [
    "dashboard homes sample images assets/04A4A0B0-F13E-44C9-91E6-96DE440E47E9.png",
    "dashboard homes sample images assets/1D47CC0D-EBBB-4843-B36C-FF1584FBF3C0.png",
    "dashboard homes sample images assets/205A56A8-1549-4228-8254-4C4FAD5D441E.png",
    "dashboard homes sample images assets/2BBB6637-9807-47DA-998C-93EDCE888A96.png",
    "dashboard homes sample images assets/B85B7D15-92A0-4AEB-93A9-E1816F2BA58C.png"
];

/* These used to be computed once at parse time from a synchronous localStorage read; now
   that currentUser resolves asynchronously, they're derived fresh each time from currentUser
   instead (see populateUser() / getActivities()). */
function getActivities() {
    const userArea = currentUser?.area || "Lekki";
    return [
        { type:"saved",   icon:"heart",    desc:"You saved Luxury 3 Bed Apartment in "+userArea,  time:"2 hours ago"      },
        { type:"inspect", icon:"calendar", desc:"You scheduled an inspection in Yaba",             time:"Today, 10:30 AM"  },
        { type:"applied", icon:"file",     desc:"You applied for 2 Bedroom Flat in Ikoyi",        time:"Yesterday, 4:15 PM" },
        { type:"payment", icon:"credit",   desc:"Payment of ₦1,200,000 recorded",                 time:"May 20, 2025"     }
    ];
}

const INSPECTIONS = [
    { month:"MAY", day:"24", name:"Lekki 3 Bed Apartment", loc:"Lekki Phase 1", time:"10:00 AM", img:IMGS[0] },
    { month:"MAY", day:"25", name:"2 Bedroom Flat",         loc:"Yaba, Mainland",time:"1:00 PM",  img:IMGS[2] },
    { month:"MAY", day:"26", name:"4 Bed Duplex",           loc:"Ajah, Lagos",   time:"11:00 AM", img:IMGS[3] }
];

const BUDGET_MAP = {
    "Under ₦500,000/yr":          { maxRent:"₦500,000",   pct:22, spent:250000,  budget:500000  },
    "₦500,000 – ₦1,000,000/yr":  { maxRent:"₦1,000,000", pct:25, spent:600000,  budget:1000000 },
    "₦1,000,000 – ₦2,000,000/yr":{ maxRent:"₦1,500,000", pct:27, spent:900000,  budget:1500000 },
    "₦2,000,000 – ₦3,500,000/yr":{ maxRent:"₦2,000,000", pct:28, spent:1200000, budget:2000000 },
    "Above ₦3,500,000/yr":        { maxRent:"₦3,500,000", pct:30, spent:2000000, budget:3500000 }
};

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
}

function fmt(n) { return "₦" + n.toLocaleString(); }

function iconSVG(type) {
    const map = {
        heart:    `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
        calendar: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        file:     `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        credit:   `<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
        bed:      `<svg viewBox="0 0 24 24"><path d="M2 9V4h20v5"/><path d="M2 9a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v11H2z"/><path d="M2 16h20"/></svg>`,
        bath:     `<svg viewBox="0 0 24 24"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M22 12H4"/></svg>`,
        parking:  `<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M9 9h3a2 2 0 0 1 0 4H9v-4zm0 4v3"/></svg>`
    };
    return map[type] || map.file;
}

function toast(msg) {
    let el = document.querySelector(".db-toast");
    if (!el) {
        el = document.createElement("div");
        el.className = "db-toast";
        Object.assign(el.style, {
            position:"fixed", bottom:"80px", left:"50%",
            transform:"translateX(-50%) translateY(80px)",
            background:"var(--ink)", color:"#fff",
            padding:"11px 20px", borderRadius:"10px",
            fontSize:"13px", fontWeight:"700",
            boxShadow:"0 10px 28px rgba(9,24,42,.22)",
            zIndex:"500", transition:"transform .32s cubic-bezier(.16,1,.3,1)",
            whiteSpace:"nowrap", fontFamily:"var(--font-sans)"
        });
        document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => { el.style.transform = "translateX(-50%) translateY(0)"; });
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.transform = "translateX(-50%) translateY(80px)"; }, 2800);
}

/* ══════════════════════════════════════════════════
   POPULATE USER DATA
══════════════════════════════════════════════════ */
function populateUser() {
    const userFirst = currentUser?.firstName || "User";
    const userLast  = currentUser?.lastName  || "";
    const userFull  = `${userFirst} ${userLast}`.trim();
    const initials  = (userFirst[0] + (userLast[0] || userFirst[1] || "")).toUpperCase();

    const greetText = `${greeting()}, ${userFirst}`;
    const areaNote  = currentUser?.area ? ` in ${currentUser.area}` : " in Lagos";
    const subtitle  = `Let's help you find your perfect space${areaNote}.`;

    /* Desktop header greeting */
    const gEl = document.getElementById("dbGreeting");
    if (gEl) gEl.innerHTML = `${greetText} <span>👋</span>`;
    const sEl = document.getElementById("dbSubtitle");
    if (sEl) sEl.textContent = subtitle;

    /* Mobile greeting */
    const gmEl = document.getElementById("dbGreetingMobile");
    if (gmEl) gmEl.innerHTML = `${greetText} <span>👋</span>`;
    const smEl = document.getElementById("dbSubtitleMobile");
    if (smEl) smEl.textContent = subtitle;

    /* Avatar + name */
    const av = document.getElementById("dbAvatar");
    if (av) av.textContent = initials;
    const un = document.getElementById("dbUserName");
    if (un) un.textContent = userFull;

    /* Budget-driven widgets */
    const b = BUDGET_MAP[currentUser?.budget] || BUDGET_MAP["₦2,000,000 – ₦3,500,000/yr"];

    const mr = document.getElementById("maxRent");
    if (mr) mr.innerHTML = `${b.maxRent} <small>/yr</small>`;

    const gp = document.getElementById("gaugePct");
    if (gp) gp.textContent = `${b.pct}%`;

    const fill = document.getElementById("gaugeFill");
    if (fill) {
        const circ   = 2 * Math.PI * 50;
        const filled = (b.pct / 100) * circ;
        fill.setAttribute("stroke-dasharray", `${filled.toFixed(1)} ${(circ - filled).toFixed(1)}`);
    }

    const left = b.budget - b.spent;
    const pct  = Math.round((b.spent / b.budget) * 100);

    const rbl = document.getElementById("rentBudgetLabel");
    if (rbl) rbl.innerHTML = `${b.maxRent} <small>/mo</small>`;

    const pbf = document.getElementById("payBarFill");
    if (pbf) setTimeout(() => { pbf.style.width = pct + "%"; }, 300);

    const sl = document.getElementById("spentLabel");
    if (sl) sl.textContent = `${fmt(b.spent)} spent`;

    const ll = document.getElementById("leftLabel");
    if (ll) ll.textContent = `${fmt(left)} left`;
}

/* ══════════════════════════════════════════════════
   RENDER SECTIONS
══════════════════════════════════════════════════ */
async function renderSaved() {
    const track = document.getElementById("savedTrack");
    if (!track) return;

    const homes = await getSavedListings();

    if (!homes.length) {
        track.innerHTML = `<div style="padding:20px 8px;font-size:13px;font-weight:700;color:#5d6876;">
            No saved homes yet.&nbsp;
            <a href="listings.html" style="color:#a97e4b;text-decoration:underline;">Browse listings →</a>
        </div>`;
        return;
    }

    track.innerHTML = homes.map(h => `
        <div class="saved-card" data-id="${h.id}" tabindex="0" role="button" aria-label="View ${h.title}">
            <div class="saved-card-img">
                <img src="${(h.images && h.images[0]) || IMGS[0]}" alt="${h.title}" loading="lazy">
                <button class="saved-heart liked" type="button" data-id="${h.id}" aria-label="Remove from saved">
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#e53e3e" stroke="#e53e3e"/></svg>
                </button>
            </div>
            <div class="saved-card-body">
                <div class="saved-location">${h.area}, Lagos</div>
                <div class="saved-name">${h.title}</div>
                <div class="saved-price-row">
                    <span class="saved-price">${formatNaira(h.rentPerYear)}/yr</span>
                    ${h.isVerified ? '<span class="verified-badge">Verified</span>' : ''}
                </div>
            </div>
        </div>`).join("");

    track.querySelectorAll(".saved-heart").forEach(btn => {
        btn.addEventListener("click", async e => {
            e.stopPropagation();
            const id = btn.dataset.id;
            btn.disabled = true;
            const res = await unsaveFavourite(id);
            if (!res.ok) {
                btn.disabled = false;
                toast(res.error === "network" ? "Couldn't reach the server. Please try again." : "Couldn't remove listing. Please try again.");
                return;
            }
            const card = btn.closest(".saved-card");
            if (card) {
                card.style.transition = "opacity .3s";
                card.style.opacity = "0";
                setTimeout(() => renderSaved(), 320);
            }
        });
    });

    track.querySelectorAll(".saved-card").forEach(card => {
        const open = e => {
            if (e.target.closest(".saved-heart")) return;
            window.location.href = `listing-detail.html?id=${card.dataset.id}`;
        };
        card.addEventListener("click", open);
        card.addEventListener("keydown", e => { if (e.key === "Enter") open(e); });
    });

    /* Arrows — attach only once */
    const prevBtn = document.querySelector(".saved-prev");
    const nextBtn = document.querySelector(".saved-next");
    if (prevBtn && !prevBtn.dataset.bound) {
        prevBtn.dataset.bound = "1";
        prevBtn.addEventListener("click", () => {
            const w = track.querySelector(".saved-card")?.offsetWidth + 12 || 192;
            track.scrollBy({ left: -w, behavior: "smooth" });
        });
    }
    if (nextBtn && !nextBtn.dataset.bound) {
        nextBtn.dataset.bound = "1";
        nextBtn.addEventListener("click", () => {
            const w = track.querySelector(".saved-card")?.offsetWidth + 12 || 192;
            track.scrollBy({ left: w, behavior: "smooth" });
        });
    }
}

async function renderRec() {
    const grid = document.getElementById("recGrid");
    if (!grid) return;

    const all = (await getAllListings()).slice(0, 4);

    if (!all.length) {
        grid.innerHTML = `<div style="padding:20px 8px;font-size:13px;font-weight:700;color:#5d6876;">
            Couldn't load recommendations right now.</div>`;
        return;
    }

    grid.innerHTML = all.map(p => `
        <div class="rec-card" data-id="${p.id}" tabindex="0" role="button" aria-label="View ${p.title}">
            <div class="rec-card-img">
                <img src="${(p.images && p.images[0]) || IMGS[0]}" alt="${p.title}" loading="lazy">
                <div class="rec-badges">
                    ${p.isVerified ? '<span class="rec-badge verified">✓ Verified</span>' : ''}
                    ${p.isMonthly  ? '<span class="rec-badge monthly">● Monthly</span>'   : ''}
                </div>
                <span class="rec-views">👁 ${p.views || 0}</span>
            </div>
            <div class="rec-card-body">
                <div class="rec-name">${p.title}</div>
                <div class="rec-loc">${p.area}, Lagos</div>
                <div class="rec-amenities">
                    <span class="rec-amenity">${iconSVG("bed")} ${p.beds} Beds</span>
                    <span class="rec-amenity">${iconSVG("bath")} ${p.baths} Baths</span>
                    ${p.amenities && p.amenities.includes("Parking") ? `<span class="rec-amenity">${iconSVG("parking")} Parking</span>` : ""}
                </div>
                <div class="rec-price">${formatNaira(p.rentPerYear)}/yr</div>
                <div class="rec-movein">Move-in: <span>${formatNaira(p.totalMoveIn || p.rentPerYear)}</span></div>
            </div>
        </div>`).join("");

    grid.querySelectorAll(".rec-card").forEach(card => {
        const open = () => { window.location.href = `listing-detail.html?id=${card.dataset.id}`; };
        card.addEventListener("click", open);
        card.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
    });
}

function timeAgo(iso) {
    if (!iso) return "";
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 3600)  return Math.max(1, Math.floor(diff / 60)) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    if (diff < 172800) return "Yesterday";
    return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function renderMessages() {
    const list = document.getElementById("msgList");
    if (!list) return;

    const inquiries = getInquiries().slice(0, 5);

    if (!inquiries.length) {
        list.innerHTML = `<div style="padding:16px 0;font-size:13px;font-weight:600;color:#5d6876;">
            No inquiries yet — contact a landlord from any listing page.</div>`;
        return;
    }

    list.innerHTML = inquiries.map(inq => {
        const initials = (inq.landlordName || "LL").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
        return `
        <div class="msg-item">
            <div class="msg-avatar">${initials}</div>
            <div class="msg-body">
                <div class="msg-name-row">
                    <span class="msg-name">${inq.landlordName || "Landlord"}</span>
                    <span class="msg-verified">✓ Landlord</span>
                    <span class="msg-time">${timeAgo(inq.sentAt)}</span>
                </div>
                <div class="msg-text">You inquired about <strong>${inq.listingTitle || "a property"}</strong> in ${inq.area || "Lagos"}</div>
            </div>
            <div class="msg-unread-dot"></div>
        </div>`;
    }).join("");
}

function renderActivity() {
    const list = document.getElementById("activityList");
    if (!list) return;
    list.innerHTML = getActivities().map(a => `
        <div class="activity-item">
            <div class="activity-icon ${a.type}">${iconSVG(a.icon)}</div>
            <div class="activity-text">
                <div class="activity-desc">${a.desc}</div>
                <div class="activity-time">${a.time}</div>
            </div>
        </div>`).join("");
}

function renderInspections() {
    const list = document.getElementById("inspectionList");
    if (!list) return;
    list.innerHTML = INSPECTIONS.map(i => `
        <div class="inspection-item">
            <img class="insp-img" src="${i.img}" alt="${i.name}" loading="lazy">
            <div class="insp-date-block">
                <div class="insp-month">${i.month}</div>
                <div class="insp-day">${i.day}</div>
            </div>
            <div class="insp-info">
                <div class="insp-name">${i.name}</div>
                <div class="insp-loc">${i.loc}</div>
            </div>
            <div class="insp-time">${i.time}</div>
        </div>`).join("");
}

/* ══════════════════════════════════════════════════
   QUICK-VIEW MODAL
══════════════════════════════════════════════════ */
function openQV(prop) {
    document.getElementById("qvImg").src              = prop.img;
    document.getElementById("qvImg").alt              = prop.name;
    document.getElementById("qvTitle").textContent    = prop.name;
    document.getElementById("qvLocation").textContent = prop.location || "";
    document.getElementById("qvPrice").textContent    = prop.price   || "";
    document.getElementById("qvMeta").innerHTML = [
        prop.beds    ? `<span class="qv-meta-item">${iconSVG("bed")} ${prop.beds} Bedrooms</span>`    : "",
        prop.baths   ? `<span class="qv-meta-item">${iconSVG("bath")} ${prop.baths} Bathrooms</span>` : "",
        prop.parking ? `<span class="qv-meta-item">${iconSVG("parking")} Parking</span>`              : ""
    ].join("");
    document.getElementById("qvOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeQV() {
    document.getElementById("qvOverlay").classList.remove("open");
    document.body.style.overflow = "";
}

document.getElementById("qvClose")?.addEventListener("click", closeQV);
document.getElementById("qvOverlay")?.addEventListener("click", e => { if (e.target === e.currentTarget) closeQV(); });
document.getElementById("qvContact")?.addEventListener("click", () => { closeQV(); toast("Message sent to landlord!"); });
document.getElementById("qvSchedule")?.addEventListener("click", () => { closeQV(); toast("Inspection request sent!"); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeQV(); });

/* ══════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════ */
function openSidebar() {
    document.getElementById("dbSidebar").classList.add("open");
    document.getElementById("dbSidebarOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
}
function closeSidebar() {
    document.getElementById("dbSidebar").classList.remove("open");
    document.getElementById("dbSidebarOverlay").classList.remove("open");
    document.body.style.overflow = "";
}

document.getElementById("dbMenuToggle")?.addEventListener("click", () => {
    document.getElementById("dbSidebar").classList.contains("open") ? closeSidebar() : openSidebar();
});
document.getElementById("dbSidebarOverlay")?.addEventListener("click", closeSidebar);

/* ══════════════════════════════════════════════════
   NAV ITEMS (sidebar + bottom nav)
══════════════════════════════════════════════════ */
function activateSection(section) {
    /* Sidebar nav */
    document.querySelectorAll(".db-nav-item").forEach(l => {
        l.classList.toggle("active", l.dataset.section === section);
    });
    /* Bottom nav */
    document.querySelectorAll(".db-bnav-item").forEach(l => {
        l.classList.toggle("active", l.dataset.section === section);
    });
    closeSidebar();
}

const SECTION_SCROLL = {
    saved:    ".db-section--saved",
    messages: ".db-section--messages"
};

document.querySelectorAll(".db-nav-item, .db-bnav-item").forEach(link => {
    link.addEventListener("click", e => {
        const sec = link.dataset.section;
        if (!sec) return;
        e.preventDefault();
        activateSection(sec);
        if (SECTION_SCROLL[sec]) {
            document.querySelector(SECTION_SCROLL[sec])?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (sec !== "dashboard") {
            toast(`${sec.charAt(0).toUpperCase() + sec.slice(1)} coming soon!`);
        }
    });
});

/* Dropdown nav links */
document.querySelectorAll(".db-user-dropdown a[data-section]").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        activateSection(link.dataset.section);
        closeDropdown();
        toast(`${link.dataset.section.charAt(0).toUpperCase()+link.dataset.section.slice(1)} coming soon!`);
    });
});

/* ══════════════════════════════════════════════════
   USER DROPDOWN
══════════════════════════════════════════════════ */
function closeDropdown() { document.getElementById("dbUserDropdown")?.classList.remove("open"); }

document.getElementById("dbUserChip")?.addEventListener("click", e => {
    e.stopPropagation();
    document.getElementById("dbUserDropdown")?.classList.toggle("open");
});
document.addEventListener("click", closeDropdown);

/* ══════════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════════ */
document.getElementById("logoutBtn")?.addEventListener("click", async e => {
    e.preventDefault();
    await PWAuth.logout();
    window.location.href = "auth.html";
});

/* ══════════════════════════════════════════════════
   INTERACTIVE BUTTONS
══════════════════════════════════════════════════ */
document.querySelector(".db-schedule-btn")?.addEventListener("click", () => toast("Open Inspections to schedule a new visit."));
document.querySelector(".db-adjust-btn")?.addEventListener("click",   () => toast("Budget adjustment coming soon!"));
document.querySelector(".db-reminder-btn")?.addEventListener("click", () => toast("Payment reminders set up!"));
document.querySelector(".db-notif-btn")?.addEventListener("click",    () => toast("You have 6 unread notifications."));
document.querySelector(".db-promo-btn")?.addEventListener("click",    () => toast("Premium upgrade coming soon!"));

/* Search — both desktop and mobile inputs */
document.querySelectorAll(".db-search input, .db-mobile-search input").forEach(inp => {
    inp.addEventListener("keydown", e => {
        if (e.key === "Enter" && inp.value.trim()) {
            toast(`Searching for "${inp.value.trim()}"…`);
        }
    });
});

/* ══════════════════════════════════════════════════
   INIT — resolves the session before rendering anything user-specific.
══════════════════════════════════════════════════ */
async function boot() {
    PWOverlay.showLoading("Loading your dashboard…");

    const { user, networkError } = await PWAuth.getSession();

    if (networkError) {
        PWOverlay.showError("Couldn't reach the server. Check your connection and try again.", {
            retry: () => window.location.reload(),
        });
        return;
    }
    if (!user || user.role !== "tenant") {
        window.location.href = "auth.html";
        return;
    }

    currentUser = user;
    PWOverlay.hide();

    populateUser();
    renderSaved();
    renderRec();
    renderMessages();
    renderActivity();
    renderInspections();
}

document.addEventListener("DOMContentLoaded", boot);
