/* =========================================================
   MERSIN FENRIR OTEL — interaction layer
   ========================================================= */

(function () {
  "use strict";

  /* ------------------------------------------------------
     Nav: always cream-blur (works over light hero panel + image)
     ------------------------------------------------------ */
  const nav = document.getElementById("nav");
  if (nav) {
    nav.classList.add("is-scrolled");
    nav.classList.remove("is-light");
  }

  /* ------------------------------------------------------
     Mobile nav toggle
     ------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");

  if (navToggle && navMobile) {
    const setMenu = (open) => {
      navMobile.classList.toggle("is-open", open);
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    };
    navToggle.addEventListener("click", () => setMenu(!navMobile.classList.contains("is-open")));
    navMobile.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setMenu(false))
    );
    // ESC closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMobile.classList.contains("is-open")) setMenu(false);
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
     Sticky call CTA — appear after hero scrolls past
     ------------------------------------------------------ */
  const stickyCta = document.getElementById("stickyCall");
  if (stickyCta) {
    const threshold = 520;
    let lastVisible = false;
    const updateSticky = () => {
      const visible = window.scrollY > threshold;
      if (visible !== lastVisible) {
        stickyCta.classList.toggle("is-visible", visible);
        lastVisible = visible;
      }
    };
    window.addEventListener("scroll", updateSticky, { passive: true });
    updateSticky();
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
     Meta Pixel + CAPI — dual-track with shared event_id
     ------------------------------------------------------ */
  const CAPI_ENDPOINT = "https://api.mersinfenrirotel.com/api/track";

  const newEventId = () => {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "e_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  };

  const getCookie = (name) => {
    const m = document.cookie.match(
      new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
    );
    return m ? decodeURIComponent(m[1]) : undefined;
  };

  const track = (event, customData) => {
    const eventId = newEventId();
    // 1) Client-side Pixel
    if (typeof window.fbq === "function") {
      try {
        window.fbq("track", event, customData || {}, { eventID: eventId });
      } catch (_) {}
    }
    // 2) Server-side CAPI (deduped via shared eventID)
    try {
      const body = {
        event_name: event,
        event_id: eventId,
        event_source_url: window.location.href,
        user_data: {
          fbp: getCookie("_fbp"),
          fbc: getCookie("_fbc"),
        },
        custom_data: customData || {},
      };
      const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
      // sendBeacon survives page-unload (e.g., tel: tap navigating away)
      if (navigator.sendBeacon) {
        navigator.sendBeacon(CAPI_ENDPOINT, blob);
      } else {
        fetch(CAPI_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
          credentials: "omit",
        }).catch(() => {});
      }
    } catch (_) {}
  };

  // Fire PageView once main.js runs (deduped with CAPI via shared event_id)
  track("PageView");

  // Phone / WhatsApp / Mail → Contact
  document
    .querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me/"]')
    .forEach((a) => {
      a.addEventListener("click", () => {
        const h = a.getAttribute("href") || "";
        const channel = h.startsWith("tel:")
          ? "phone"
          : h.startsWith("mailto:")
          ? "email"
          : "whatsapp";
        track("Contact", { content_name: channel });
      });
    });

  // Reservation CTA → Lead
  document
    .querySelectorAll('a[href="#reserve"], a[href^="#reserve"], .room__cta')
    .forEach((a) => {
      a.addEventListener("click", () => {
        track("Lead", { content_category: "reservation" });
      });
    });

  // Room cards → ViewContent (once each, 45% threshold)
  const roomCards = document.querySelectorAll(".room");
  if ("IntersectionObserver" in window && roomCards.length) {
    const seen = new WeakSet();
    const rio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !seen.has(entry.target)) {
            seen.add(entry.target);
            const nameEl = entry.target.querySelector(".room__name");
            const name = nameEl ? nameEl.textContent.trim() : "Room";
            track("ViewContent", {
              content_name: name,
              content_category: "room",
            });
          }
        });
      },
      { threshold: 0.45 }
    );
    roomCards.forEach((r) => rio.observe(r));
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
