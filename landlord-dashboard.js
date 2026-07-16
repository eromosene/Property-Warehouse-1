/* ══════════════════════════════════════════════════
   LANDLORD DASHBOARD JS — Property Warehouse
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

/* Unsplash tenant avatars */
const PEOPLE = [
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
];

let LISTINGS = [];

const MESSAGES = [
    { name:"Amaka Nwosu",    text:"Hi, is this Lekki apartment still available? I'm interested in scheduling an inspection.",  time:"2m ago",    unread:true,  img:PEOPLE[0] },
    { name:"Tunde Adebayo",  text:"I'd like to know more about the 4 bed duplex in Ajah, is it still available?",             time:"15m ago",   unread:true,  img:PEOPLE[1] },
    { name:"Kemi Balogun",   text:"Thanks for the info. I'm ready to proceed with the payment.",                               time:"1h ago",    unread:false, img:PEOPLE[2] },
    { name:"David Okonkwo",  text:"Can I see more pictures of the property in Gbagada?",                                       time:"2h ago",    unread:false, img:PEOPLE[3] }
];

const INSPECTIONS = [
    { month:"MAY", day:"24", name:"Lekki 3 Bed Apartment",  loc:"Lekki Phase 1",  time:"10:00 AM", img:PEOPLE[4] },
    { month:"MAY", day:"25", name:"2 Bedroom Flat",          loc:"Yaba, Mainland", time:"1:00 PM",  img:PEOPLE[0] },
    { month:"MAY", day:"26", name:"4 Bed Duplex",            loc:"Ajah, Lagos",    time:"11:00 AM", img:PEOPLE[1] }
];

const PAYMENTS = [
    { name:"Luxury 3 Bed Duplex – Lekki",  type:"Annual Rent Payment", amount:"₦2,400,000", status:"paid" },
    { name:"2 Bed Apartment – Yaba",        type:"Annual Rent Payment", amount:"₦1,200,000", status:"paid" },
    { name:"4 Bed Terrace – Ajah",          type:"Annual Rent Payment", amount:"₦2,000,000", status:"paid" }
];

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

function toast(msg) {
    let el = document.querySelector(".ld-toast");
    if (!el) {
        el = document.createElement("div");
        el.className = "ld-toast";
        document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => { el.style.transform = "translateX(-50%) translateY(0)"; });
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.transform = "translateX(-50%) translateY(80px)"; }, 2800);
}

function statusLabel(s) {
    const map = { verified:"Verified", occupied:"Occupied", available:"Available" };
    return map[s] || s;
}

/* ══════════════════════════════════════════════════
   POPULATE USER
══════════════════════════════════════════════════ */
function populateUser() {
    const userFirst = currentUser?.firstName || "Adeyemi";
    const userLast  = currentUser?.lastName  || "Johnson";
    const userFull  = `${userFirst} ${userLast}`.trim();
    const greet = `${greeting()}, ${userFirst}`;

    const gEl = document.getElementById("ldGreeting");
    if (gEl) gEl.innerHTML = `${greet} <span>👋</span>`;

    const gmEl = document.getElementById("ldGreetingMobile");
    if (gmEl) gmEl.innerHTML = `${greet} <span>👋</span>`;

    const un = document.getElementById("ldUserName");
    if (un) un.textContent = userFull;
}

/* ══════════════════════════════════════════════════
   RENDER LISTINGS TABLE
══════════════════════════════════════════════════ */
function showListingsMessage(html) {
    const tbody = document.getElementById("ldTableBody");
    const table = document.getElementById("ldListingsTable");
    if (table) table.style.display = "none";
    let empty = document.getElementById("ldEmptyListings");
    if (!empty) {
        empty = document.createElement("div");
        empty.id = "ldEmptyListings";
        empty.style.cssText = "text-align:center;padding:48px 20px;";
        tbody.closest(".ld-table-wrap").appendChild(empty);
    }
    empty.innerHTML = html;
}

async function renderListings() {
    const tbody = document.getElementById("ldTableBody");
    const table = document.getElementById("ldListingsTable");
    if (!tbody) return;

    const res = await PWApi.request('/api/landlord/listings');
    if (!res.ok) {
        showListingsMessage(`
            <p style="font-size:15px;font-weight:700;color:#c0392b;margin-bottom:16px">
              ${res.error === 'network' ? "Couldn't reach the server. Check your connection and try again." : "Couldn't load your listings."}
            </p>
            <button onclick="renderListings()" style="padding:10px 20px;border-radius:10px;border:none;background:#a97e4b;color:#fff;font-weight:800;cursor:pointer;font-family:inherit">Retry</button>`);
        return;
    }
    LISTINGS = res.data.listings;

    if (!LISTINGS.length) {
        showListingsMessage(`
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#c8c3bb" stroke-width="1.5"
              style="display:block;margin:0 auto 16px"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <p style="font-size:15px;font-weight:700;color:#5d6876;margin-bottom:16px">You haven't listed any properties yet.</p>
            <a href="create-listing.html"
               style="display:inline-flex;align-items:center;gap:8px;background:#a97e4b;color:#fff;
                      padding:12px 24px;border-radius:12px;font-size:14px;font-weight:800;text-decoration:none;">
               + Add Your First Property
            </a>`);
        return;
    }

    const emptyEl = document.getElementById("ldEmptyListings");
    if (emptyEl) emptyEl.remove();
    if (table) table.style.display = "";

    tbody.innerHTML = LISTINGS.map(l => {
        const img      = (l.images && l.images[0]) || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=80&q=60";
        const name     = l.title || l.name || "Untitled";
        const area     = l.area  || "—";
        const status   = l.isVerified ? "verified" : "available";
        const inquiries = l.views || 0;
        const rent     = formatNaira(l.rentPerYear || 0);
        return `
        <tr>
            <td>
                <div class="ld-prop-cell">
                    <div class="ld-prop-thumb"><img src="${img}" alt="${name}" loading="lazy"></div>
                    <a class="ld-prop-name" href="listing-detail.html?id=${l.id}" style="text-decoration:none;color:inherit">${name}</a>
                </div>
            </td>
            <td class="ld-prop-area-cell">${area}</td>
            <td>
                <span class="ld-status-badge ${status}">
                    <svg viewBox="0 0 8 8" width="6" height="6"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>
                    ${statusLabel(status)}
                </span>
            </td>
            <td class="ld-td-num">${inquiries}</td>
            <td class="ld-td-num">${rent}</td>
            <td>
                <div class="ld-occ-bar-wrap">
                    <div class="ld-occ-bar"><div class="ld-occ-bar-fill" style="width:0%"></div></div>
                    <span class="ld-occ-pct">—</span>
                </div>
            </td>
            <td>
                <div class="ld-perf-cell">
                    <span class="ld-perf-label good">Active</span>
                </div>
            </td>
            <td>
                <button class="ld-row-menu ld-delete-btn" type="button"
                  aria-label="Delete listing" data-id="${l.id}"
                  title="Delete listing"
                  style="color:#c0392b">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                </button>
            </td>
        </tr>`;
    }).join("");

    tbody.querySelectorAll(".ld-delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const listing = LISTINGS.find(l => l.id === id);
            if (!listing) return;
            if (!confirm(`Delete "${listing.title || listing.name}"? This cannot be undone.`)) return;

            btn.disabled = true;
            const res = await PWApi.request('/api/listings/' + encodeURIComponent(id), { method: 'DELETE' });
            if (!res.ok) {
                toast(res.error === 'network' ? "Couldn't reach the server. Please try again." : 'Failed to delete listing.');
                btn.disabled = false;
                return;
            }
            toast(`"${listing.title || listing.name}" deleted.`);
            renderListings();
        });
    });
}

/* ══════════════════════════════════════════════════
   RENDER MESSAGES
══════════════════════════════════════════════════ */
function renderMessages() {
    const list = document.getElementById("ldMsgList");
    if (!list) return;
    list.innerHTML = MESSAGES.map(m => `
        <div class="ld-msg-item">
            <div class="ld-msg-avatar"><img src="${m.img}" alt="${m.name}" loading="lazy"></div>
            <div class="ld-msg-body">
                <div class="ld-msg-name-row">
                    <span class="ld-msg-name">${m.name}</span>
                    <span class="ld-msg-time">${m.time}</span>
                </div>
                <div class="ld-msg-text">${m.text}</div>
            </div>
            ${m.unread ? `<div class="ld-msg-unread"></div>` : ""}
        </div>`).join("");

    list.querySelectorAll(".ld-msg-item").forEach((item, i) => {
        item.addEventListener("click", () => toast(`Opening message from ${MESSAGES[i].name}…`));
    });
}

/* ══════════════════════════════════════════════════
   RENDER INSPECTIONS
══════════════════════════════════════════════════ */
function renderInspections() {
    const list = document.getElementById("ldInspList");
    if (!list) return;
    list.innerHTML = INSPECTIONS.map(i => `
        <div class="ld-insp-item">
            <div class="ld-insp-avatar"><img src="${i.img}" alt="${i.name}" loading="lazy"></div>
            <div class="ld-insp-date">
                <div class="ld-insp-month">${i.month}</div>
                <div class="ld-insp-day">${i.day}</div>
            </div>
            <div class="ld-insp-info">
                <div class="ld-insp-name">${i.name}</div>
                <div class="ld-insp-loc">${i.loc}</div>
            </div>
            <div class="ld-insp-time">${i.time}</div>
        </div>`).join("");
}

/* ══════════════════════════════════════════════════
   RENDER PAYMENTS
══════════════════════════════════════════════════ */
function renderPayments() {
    const list = document.getElementById("ldPayList");
    if (!list) return;
    list.innerHTML = PAYMENTS.map(p => `
        <div class="ld-pay-item">
            <div class="ld-pay-icon">
                <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <div class="ld-pay-info">
                <div class="ld-pay-name">${p.name}</div>
                <div class="ld-pay-type">${p.type}</div>
            </div>
            <div class="ld-pay-right">
                <span class="ld-pay-amount">${p.amount}</span>
                <span class="ld-pay-status ${p.status}">${p.status.charAt(0).toUpperCase()+p.status.slice(1)}</span>
            </div>
        </div>`).join("");
}

/* ══════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════ */
function openSidebar() {
    document.getElementById("ldSidebar").classList.add("open");
    document.getElementById("ldSidebarOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
}
function closeSidebar() {
    document.getElementById("ldSidebar").classList.remove("open");
    document.getElementById("ldSidebarOverlay").classList.remove("open");
    document.body.style.overflow = "";
}

document.getElementById("ldMenuToggle")?.addEventListener("click", () => {
    document.getElementById("ldSidebar").classList.contains("open") ? closeSidebar() : openSidebar();
});
document.getElementById("ldSidebarOverlay")?.addEventListener("click", closeSidebar);

/* ══════════════════════════════════════════════════
   NAV ITEMS
══════════════════════════════════════════════════ */
function activateSection(section) {
    document.querySelectorAll(".ld-nav-item").forEach(l => {
        l.classList.toggle("active", l.dataset.section === section);
    });
    document.querySelectorAll(".ld-bnav-item").forEach(l => {
        l.classList.toggle("active", l.dataset.section === section);
    });
    closeSidebar();
}

document.querySelectorAll(".ld-nav-item, .ld-bnav-item").forEach(link => {
    link.addEventListener("click", e => {
        const sec = link.dataset.section;
        if (!sec) return;
        e.preventDefault();
        if (sec === "listings") {
            window.location.href = "listings.html";
            return;
        }
        if (sec === "inquiries") {
            activateSection(sec);
            const sect = document.getElementById("ldInquiriesSection");
            if (sect) sect.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }
        activateSection(sec);
        if (sec !== "dashboard") toast(`${sec.charAt(0).toUpperCase()+sec.slice(1)} coming soon!`);
    });
});

/* ══════════════════════════════════════════════════
   USER DROPDOWN
══════════════════════════════════════════════════ */
function closeDropdown() { document.getElementById("ldUserDropdown")?.classList.remove("open"); }

document.getElementById("ldUserChip")?.addEventListener("click", e => {
    e.stopPropagation();
    document.getElementById("ldUserDropdown")?.classList.toggle("open");
});
document.addEventListener("click", closeDropdown);

document.querySelectorAll(".ld-user-dropdown a[data-section]").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        closeDropdown();
        toast(`${link.dataset.section.charAt(0).toUpperCase()+link.dataset.section.slice(1)} coming soon!`);
    });
});

/* ══════════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════════ */
document.getElementById("ldLogoutBtn")?.addEventListener("click", async e => {
    e.preventDefault();
    await PWAuth.logout();
    window.location.href = "auth.html";
});

/* ══════════════════════════════════════════════════
   INTERACTIVE BUTTONS
══════════════════════════════════════════════════ */
/* ldAddBtn is now an <a> link to create-listing.html */
document.getElementById("ldViewAll")?.addEventListener("click",      e => { e.preventDefault(); window.location.href = "listings.html"; });
document.querySelector(".ld-add-insp-btn")?.addEventListener("click",() => toast("Inspection scheduler coming soon!"));
document.querySelector(".ld-promo-btn")?.addEventListener("click",   () => toast("Promotion feature coming soon!"));
document.querySelector(".ld-view-profile-link")?.addEventListener("click", e => { e.preventDefault(); toast("Profile page coming soon!"); });
document.querySelector(".ld-notif-btn")?.addEventListener("click",   () => toast("You have 3 unread notifications."));
document.querySelector(".ld-period-select")?.addEventListener("change", () => toast("Chart filter updated!"));

document.querySelectorAll(".ld-search input, .ld-mobile-search input").forEach(inp => {
    inp.addEventListener("keydown", e => {
        if (e.key === "Enter" && inp.value.trim()) {
            toast(`Searching for "${inp.value.trim()}"…`);
        }
    });
});

/* ══════════════════════════════════════════════════
   INQUIRIES
══════════════════════════════════════════════════ */
function pwRelTime(isoStr) {
    if (!isoStr) return "";
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
}

async function renderInquiries() {
    const container = document.getElementById("ldInqList");
    if (!container) return;

    const lastSeen = localStorage.getItem("pw_dashboard_last_seen");
    const now = new Date().toISOString();

    // Inquiries themselves are still localStorage-only (Phase 2+) — only "which listings are
    // mine" now comes from the real API, mirroring how this function always independently
    // looked up the landlord's listings rather than relying on renderListings()'s state.
    const listingsRes = await PWApi.request('/api/landlord/listings');
    if (!listingsRes.ok) {
        container.innerHTML = `
            <div class="pw-inq-empty">
                <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#c8c3bb" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p>Couldn't load inquiries right now.</p>
            </div>`;
        return;
    }
    const landlordListingIds = listingsRes.data.listings.map(l => l.id);
    const allInquiries = JSON.parse(localStorage.getItem("pw_inquiries") || "[]");
    const myInquiries  = allInquiries.filter(inq => landlordListingIds.includes(inq.listingId));

    localStorage.setItem("pw_dashboard_last_seen", now);

    const badgeEl = document.getElementById("ldInqNewBadge");
    if (badgeEl && myInquiries.length > 0 && lastSeen) {
        const newCount = myInquiries.filter(inq => inq.sentAt > lastSeen).length;
        if (newCount > 0) {
            badgeEl.textContent = `${newCount} New`;
            badgeEl.style.display = "inline-flex";
        }
    }

    if (!myInquiries.length) {
        container.innerHTML = `
            <div class="pw-inq-empty">
                <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#c8c3bb" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p>No inquiries yet. Share your listings to get messages!</p>
            </div>`;
        return;
    }

    const WA_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>';

    container.innerHTML = myInquiries.map(inq => {
        const isNew   = !!(lastSeen && inq.sentAt > lastSeen);
        const phone   = (inq.senderPhone || "").replace(/\D/g, "");
        const waMsg   = encodeURIComponent(`Hello ${inq.senderName || ""}, thank you for your interest in my property on Property Warehouse.`);
        const waHref  = `https://wa.me/${phone}?text=${waMsg}`;
        const relTime = pwRelTime(inq.sentAt);
        return `
        <div class="pw-inq-card${isNew ? " pw-inq-card--new" : ""}">
            ${isNew ? '<span class="pw-inq-new-badge">New</span>' : ""}
            <div class="pw-inq-top">
                <div class="pw-inq-sender">
                    <strong>${inq.senderName || "Unknown"}</strong>
                    <a href="tel:${inq.senderPhone || ""}" class="pw-inq-phone">${inq.senderPhone || ""}</a>
                </div>
                <span class="pw-inq-time">${relTime}</span>
            </div>
            <div class="pw-inq-listing">${inq.listingTitle || inq.listingId || "—"}</div>
            <p class="pw-inq-msg">${inq.message || ""}</p>
            <a class="pw-inq-wa-btn" href="${waHref}" target="_blank" rel="noopener noreferrer">
                ${WA_SVG} Reply on WhatsApp
            </a>
        </div>`;
    }).join("");
}

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
    if (!user || user.role !== "landlord") {
        window.location.href = "auth.html";
        return;
    }

    currentUser = user;
    PWOverlay.hide();

    populateUser();
    renderListings();
    renderMessages();
    renderInspections();
    renderPayments();
    renderInquiries();
}

document.addEventListener("DOMContentLoaded", boot);
