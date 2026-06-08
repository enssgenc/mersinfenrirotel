/* =========================================================
   MERSIN FENRIR OTEL — interaction layer
   ========================================================= */

(function () {
  "use strict";

  /* ------------------------------------------------------
     Sticky nav: dark on hero, light after scroll
     ------------------------------------------------------ */
  const nav = document.getElementById("nav");
  const hero = document.querySelector(".hero");

  function updateNavState() {
    if (!nav || !hero) return;
    const threshold = hero.offsetHeight - 120;
    const scrolled = window.scrollY > threshold;
    nav.classList.toggle("is-scrolled", scrolled);
    nav.classList.toggle("is-light", !scrolled);
  }

  window.addEventListener("scroll", updateNavState, { passive: true });
  updateNavState();

  /* ------------------------------------------------------
     Mobile nav toggle
     ------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");

  if (navToggle && navMobile) {
    navToggle.addEventListener("click", () => {
      const open = navMobile.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });

    navMobile.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navMobile.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ------------------------------------------------------
     Scroll reveal — IntersectionObserver
     ------------------------------------------------------ */
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ------------------------------------------------------
     Footer year
     ------------------------------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------
     Hero parallax (subtle)
     ------------------------------------------------------ */
  const heroMedia = document.querySelector(".hero__media img");
  if (heroMedia && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const y = window.scrollY;
            if (y < window.innerHeight) {
              heroMedia.style.transform = `translateY(${y * 0.18}px) scale(1)`;
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }
})();
