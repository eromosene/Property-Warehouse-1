const menuButton = document.querySelector(".menu-button");
const track = document.querySelector("[data-track]");
const prevButton = document.querySelector(".carousel-arrow.prev");
const nextButton = document.querySelector(".carousel-arrow.next");

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

const scrollCards = (direction) => {
    if (!track) return;

    const firstCard = track.querySelector(".workflow-card");
    const distance = firstCard ? firstCard.getBoundingClientRect().width + 16 : 260;

    track.scrollBy({
        left: direction * distance,
        behavior: "smooth"
    });
};

prevButton?.addEventListener("click", () => scrollCards(-1));
nextButton?.addEventListener("click", () => scrollCards(1));

document.querySelector(".search-panel")?.addEventListener("submit", (event) => {
    event.preventDefault();
});
