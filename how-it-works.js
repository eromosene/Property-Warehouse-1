/* ═══ MOBILE MENU ═══ */
const menuBtn = document.getElementById("hiwMenuBtn");
const drawer  = document.getElementById("hiwDrawer");

menuBtn.addEventListener("click", () => drawer.classList.toggle("open"));

document.addEventListener("click", e => {
  if (!drawer.contains(e.target) && !menuBtn.contains(e.target)) {
    drawer.classList.remove("open");
  }
});

/* ═══ HERO TOGGLE ═══ */
const toggleBtns = document.querySelectorAll(".hiw-toggle-btn");
const tenantJourney   = document.getElementById("tenantJourney");
const landlordJourney = document.getElementById("landlordJourney");
const journeySection  = document.getElementById("journeySection");

toggleBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    toggleBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.dataset.target;

    if (target === "tenant") {
      tenantJourney.style.opacity   = "1";
      landlordJourney.style.opacity = "0.4";
    } else {
      landlordJourney.style.opacity = "1";
      tenantJourney.style.opacity   = "0.4";
    }

    // Smooth scroll to journeys section
    journeySection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ═══ FAQ ACCORDION ═══ */
document.querySelectorAll(".hiw-faq-q").forEach(btn => {
  btn.addEventListener("click", () => {
    const answer   = btn.nextElementSibling;
    const expanded = btn.getAttribute("aria-expanded") === "true";

    // Close all others in the same column
    btn.closest(".hiw-faq-col").querySelectorAll(".hiw-faq-q").forEach(other => {
      if (other !== btn) {
        other.setAttribute("aria-expanded", "false");
        other.nextElementSibling.classList.remove("open");
      }
    });

    btn.setAttribute("aria-expanded", String(!expanded));
    answer.classList.toggle("open", !expanded);
  });
});

/* ═══ SCROLL: sticky header shadow ═══ */
const header = document.querySelector(".hiw-header");
window.addEventListener("scroll", () => {
  header.style.boxShadow = window.scrollY > 10
    ? "0 2px 20px rgba(0,0,0,.10)"
    : "";
}, { passive: true });
