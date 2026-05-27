/* ══════════════════════════════════════════════════
   LANDLORD DASHBOARD JS — Property Warehouse
══════════════════════════════════════════════════ */

/* ── Auth guard ── */
const currentUser = JSON.parse(localStorage.getItem("pw_current_user") || "null");
if (!currentUser || currentUser.role !== "landlord") {
    window.location.href = "auth.html";
}

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

const userFirst = currentUser?.firstName || "Adeyemi";
const userLast  = currentUser?.lastName  || "Johnson";
const userFull  = `${userFirst} ${userLast}`.trim();

let LISTINGS = getLandlordListings(currentUser.email);

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
function renderListings() {
    const tbody = document.getElementById("ldTableBody");
    const table = document.getElementById("ldListingsTable");
    if (!tbody) return;

    LISTINGS = getLandlordListings(currentUser.email);

    if (!LISTINGS.length) {
        if (table) table.style.display = "none";
        let empty = document.getElementById("ldEmptyListings");
        if (!empty) {
            empty = document.createElement("div");
            empty.id = "ldEmptyListings";
            empty.style.cssText = "text-align:center;padding:48px 20px;";
            empty.innerHTML = `
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#c8c3bb" stroke-width="1.5"
                  style="display:block;margin:0 auto 16px"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                <p style="font-size:15px;font-weight:700;color:#5d6876;margin-bottom:16px">You haven't listed any properties yet.</p>
                <a href="create-listing.html"
                   style="display:inline-flex;align-items:center;gap:8px;background:#a97e4b;color:#fff;
                          padding:12px 24px;border-radius:12px;font-size:14px;font-weight:800;text-decoration:none;">
                   + Add Your First Property
                </a>`;
            tbody.closest(".ld-table-wrap").appendChild(empty);
        }
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
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const listing = LISTINGS.find(l => l.id === id);
            if (!listing) return;
            if (confirm(`Delete "${listing.title || listing.name}"? This cannot be undone.`)) {
                deleteListing(id);
                toast(`"${listing.title || listing.name}" deleted.`);
                renderListings();
            }
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
document.getElementById("ldLogoutBtn")?.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("pw_current_user");
    window.location.href = "auth.html";
});

/* ══════════════════════════════════════════════════
   INTERACTIVE BUTTONS
══════════════════════════════════════════════════ */
/* ldAddBtn is now an <a> link to create-listing.html */
document.getElementById("ldViewAll")?.addEventListener("click",      e => { e.preventDefault(); toast("Viewing all listings…"); });
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
   INIT
══════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    populateUser();
    renderListings();
    renderMessages();
    renderInspections();
    renderPayments();
});
