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
     Video showcase — sound toggle (mutex: only one unmuted)
     ------------------------------------------------------ */
  const soundBtns = document.querySelectorAll(".showcase__sound");
  soundBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".showcase__card");
      const video = card && card.querySelector(".showcase__video");
      if (!video) return;
      const wantOn = btn.dataset.sound !== "on";
      // mute everyone first
      document.querySelectorAll(".showcase__video").forEach((v) => {
        v.muted = true;
      });
      soundBtns.forEach((b) => (b.dataset.sound = "off"));
      if (wantOn) {
        video.muted = false;
        video.play().catch(() => {});
        btn.dataset.sound = "on";
      }
    });
  });

  /* ------------------------------------------------------
     Pause videos when offscreen (perf)
     ------------------------------------------------------ */
  if ("IntersectionObserver" in window) {
    const vio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target;
          if (entry.isIntersecting) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.25 }
    );
    document.querySelectorAll(".showcase__video").forEach((v) => vio.observe(v));
  }

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
