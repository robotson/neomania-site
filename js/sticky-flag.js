// ===== STICKY FLAG - Progressive Enhancement =====

document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".main-hero");
  if (!hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      hero.classList.toggle("stuck", entry.intersectionRatio < 1);
    },
    { threshold: [1] }
  );

  observer.observe(hero);
});
