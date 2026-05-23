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

const LISTINGS = [
    { id:1, name:"Luxury 3 Bedroom Duplex",   area:"Lekki Phase 1",  status:"verified",  inquiries:56, rent:"₦2,400,000", occ:95,  perf:"Excellent", score:4.9, img:IMGS[0] },
    { id:2, name:"2 Bedroom Apartment",        area:"Yaba, Mainland", status:"occupied",  inquiries:32, rent:"₦1,200,000", occ:100, perf:"Excellent", score:4.7, img:IMGS[1] },
    { id:3, name:"4 Bedroom Terrace Duplex",   area:"Ajah, Lagos",    status:"available", inquiries:18, rent:"₦2,000,000", occ:0,   perf:"Good",      score:4.2, img:IMGS[2] },
    { id:4, name:"Studio Apartment",           area:"Surulere, Lagos",status:"occupied",  inquiries:24, rent:"₦800,000",   occ:100, perf:"Good",      score:4.3, img:IMGS[3] },
    { id:5, name:"3 Bedroom Flat",             area:"Gbagada, Lagos", status:"available", inquiries:12, rent:"₦1,500,000", occ:0,   perf:"Average",   score:3.8, img:IMGS[4] }
];

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
    if (!tbody) return;
    tbody.innerHTML = LISTINGS.map(l => `
        <tr>
            <td>
                <div class="ld-prop-cell">
                    <div class="ld-prop-thumb"><img src="${l.img}" alt="${l.name}" loading="lazy"></div>
                    <span class="ld-prop-name">${l.name}</span>
                </div>
            </td>
            <td class="ld-prop-area-cell">${l.area}</td>
            <td>
                <span class="ld-status-badge ${l.status}">
                    <svg viewBox="0 0 8 8" width="6" height="6"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>
                    ${statusLabel(l.status)}
                </span>
            </td>
            <td class="ld-td-num">${l.inquiries}</td>
            <td class="ld-td-num">${l.rent}</td>
            <td>
                <div class="ld-occ-bar-wrap">
                    <div class="ld-occ-bar"><div class="ld-occ-bar-fill" style="width:${l.occ}%"></div></div>
                    <span class="ld-occ-pct">${l.occ}%</span>
                </div>
            </td>
            <td>
                <div class="ld-perf-cell">
                    <span class="ld-perf-label ${l.perf.toLowerCase()}">${l.perf}</span>
                    <span class="ld-perf-score">${l.score}</span>
                </div>
            </td>
            <td>
                <button class="ld-row-menu" type="button" aria-label="More options" data-id="${l.id}">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg>
                </button>
            </td>
        </tr>`).join("");

    tbody.querySelectorAll(".ld-row-menu").forEach(btn => {
        btn.addEventListener("click", () => {
            const listing = LISTINGS.find(l => l.id === +btn.dataset.id);
            if (listing) toast(`Options for ${listing.name}`);
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
        e.preventDefault();
        const sec = link.dataset.section;
        if (!sec) return;
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
document.getElementById("ldAddBtn")?.addEventListener("click",       () => toast("Add property form coming soon!"));
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
