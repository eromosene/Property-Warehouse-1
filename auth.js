/* ── Mobile menu ── */
const menuButton = document.querySelector(".menu-button");
menuButton?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".site-nav a, .header-actions a").forEach((link) => {
    link.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
        menuButton?.setAttribute("aria-expanded", "false");
    });
});

/* ── Boot: enforce hidden state regardless of CSS cache ── */
document.querySelectorAll(".auth-form").forEach((f) => {
    if (f.classList.contains("hidden")) f.style.display = "none";
});

/* ── Tab switching ── */
function showForm(formEl) {
    formEl.classList.remove("hidden");
    formEl.style.display = "";
}
function hideForm(formEl) {
    formEl.classList.add("hidden");
    formEl.style.display = "none";
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const targetFormId = btn.dataset.tab;
        const panelId      = btn.dataset.panel;
        const panel        = document.getElementById(panelId);

        panel.querySelectorAll(".tab-btn").forEach(b => {
            b.classList.remove("active");
            b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        panel.querySelectorAll(".auth-form").forEach(hideForm);
        const targetForm = document.getElementById(targetFormId);
        if (targetForm) showForm(targetForm);
    });
});

/* ── Password visibility toggle ── */
document.querySelectorAll(".pw-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
        const input = btn.closest(".field-group, .password-field").querySelector("input[type='password'], input[type='text']");
        if (!input) return;
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        btn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        btn.querySelector("svg").style.opacity = isPassword ? "0.5" : "1";
    });
});

/* ── Toast helper ── */
function showToast(msg) {
    let toast = document.querySelector(".auth-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "auth-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ── Scroll to landlord panel if hash is #landlord ── */
window.addEventListener("DOMContentLoaded", () => {
    if (location.hash === "#landlord") {
        const el = document.getElementById("landlord");
        if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }
});

/* ── Form submissions ── */

/* TENANT LOGIN */
document.getElementById("tenant-login")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form    = e.target;
    const email   = form.querySelector("input[type='text'], input[type='email']")?.value.trim();
    const password = form.querySelector("input[type='password'], input[type='text'][autocomplete='current-password']")?.value;

    if (!email || !password) {
        showToast("Please fill in all fields.");
        return;
    }

    const stored = JSON.parse(localStorage.getItem("pw_tenant") || "null");
    if (!stored || stored.email !== email || stored.password !== password) {
        showToast("Invalid credentials. Please sign up first.");
        return;
    }

    localStorage.setItem("pw_current_user", JSON.stringify({ ...stored, role: "tenant" }));
    showToast("Welcome back, " + stored.firstName + "! Redirecting…");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1200);
});

/* TENANT SIGN UP */
document.getElementById("tenant-signup")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form      = e.target;
    const inputs    = form.querySelectorAll("input");
    const selects   = form.querySelectorAll("select");
    const firstName = inputs[0]?.value.trim();
    const lastName  = inputs[1]?.value.trim();
    const email     = inputs[2]?.value.trim();
    const phone     = inputs[3]?.value.trim();
    const password  = inputs[4]?.value;
    const area      = selects[0]?.value;
    const budget    = selects[1]?.value;

    if (!firstName || !lastName || !email || !password) {
        showToast("Please fill in all required fields.");
        return;
    }

    const userData = { firstName, lastName, email, phone, password, area, budget, role: "tenant", joinedDate: new Date().toISOString() };
    localStorage.setItem("pw_tenant", JSON.stringify(userData));
    localStorage.setItem("pw_current_user", JSON.stringify(userData));
    showToast("Account created! Welcome, " + firstName + "! Redirecting…");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1400);
});

/* LANDLORD LOGIN */
document.getElementById("landlord-login")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form    = e.target;
    const email   = form.querySelector("input")?.value.trim();
    const password = form.querySelectorAll("input")[1]?.value;

    const stored = JSON.parse(localStorage.getItem("pw_landlord") || "null");
    if (!stored || stored.email !== email || stored.password !== password) {
        showToast("Invalid credentials. Please sign up first.");
        return;
    }

    localStorage.setItem("pw_current_user", JSON.stringify({ ...stored, role: "landlord" }));
    showToast("Welcome back, " + stored.firstName + "!");
    setTimeout(() => { window.location.href = "landlord-dashboard.html"; }, 1200);
});

/* LANDLORD SIGN UP */
document.getElementById("landlord-signup")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form      = e.target;
    const inputs    = form.querySelectorAll("input");
    const selects   = form.querySelectorAll("select");
    const firstName = inputs[0]?.value.trim();
    const lastName  = inputs[1]?.value.trim();
    const email     = inputs[2]?.value.trim();
    const phone     = inputs[3]?.value.trim();
    const password  = inputs[4]?.value;
    const propType  = selects[0]?.value;
    const lga       = selects[1]?.value;

    if (!firstName || !lastName || !email || !password) {
        showToast("Please fill in all required fields.");
        return;
    }

    const userData = { firstName, lastName, email, phone, password, propType, lga, role: "landlord", joinedDate: new Date().toISOString() };
    localStorage.setItem("pw_landlord", JSON.stringify(userData));
    localStorage.setItem("pw_current_user", JSON.stringify(userData));
    showToast("Landlord account created! Welcome, " + firstName + "!");
    setTimeout(() => { window.location.href = "landlord-dashboard.html"; }, 1400);
});
