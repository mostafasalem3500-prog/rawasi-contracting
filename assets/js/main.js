(() => {
  "use strict";

  const prefersMotion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  const hasGSAP = prefersMotion && typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const pointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (prefersMotion && !hasGSAP) document.documentElement.classList.add("motion");
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.set("[data-reveal]", { autoAlpha: 0, y: 28 });
  }

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Mobile nav ---------------- */
  const nav = document.getElementById("mainNav");
  const navToggle = document.getElementById("navToggle");
  const navClose = document.getElementById("navClose");

  function openNav() {
    nav.classList.add("is-open");
    navClose?.classList.add("is-visible");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeNav() {
    nav.classList.remove("is-open");
    navClose?.classList.remove("is-visible");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  navToggle?.addEventListener("click", () => {
    nav.classList.contains("is-open") ? closeNav() : openNav();
  });
  navClose?.addEventListener("click", closeNav);
  nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));

  /* ---------------- Sticky header hide/show ---------------- */
  const header = document.getElementById("siteHeader");
  let lastY = window.scrollY;
  let ticking = false;

  function onScrollHeader() {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 12);
    if (y > lastY && y > 120) {
      header.classList.add("is-hidden");
      closeNav();
    } else {
      header.classList.remove("is-hidden");
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(onScrollHeader);
      ticking = true;
    }
  });

  /* ---------------- Smooth anchor scroll offset for sticky header ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top, behavior: prefersMotion ? "smooth" : "auto" });
      history.pushState(null, "", id);
    });
  });

  /* ---------------- Reveal on scroll ---------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (hasGSAP) {
    revealEls.forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });
  } else if (prefersMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("is-visible"), i * 40);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- Hero signature title split ---------------- */
  document.querySelectorAll("[data-split]").forEach((title) => {
    title.querySelectorAll(".split-line").forEach((line, i) => {
      line.style.transitionDelay = prefersMotion ? `${i * 120 + 120}ms` : "0ms";
    });
  });
  requestAnimationFrame(() => {
    document.querySelectorAll("[data-split]").forEach((t) => t.classList.add("split-ready"));
  });

  /* ---------------- Number counters ---------------- */
  const fmt = new Intl.NumberFormat(window.SITE_LOCALE || "en-US");
  function setFinalCount(el) {
    el.textContent = fmt.format(Number(el.dataset.count || "0"));
  }
  const counters = document.querySelectorAll("[data-count]");
  if (hasGSAP) {
    counters.forEach((el) => {
      const target = Number(el.dataset.count || "0");
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = fmt.format(Math.round(obj.v));
        },
      });
    });
  } else if (prefersMotion && "IntersectionObserver" in window) {
    function animateCount(el) {
      const target = Number(el.dataset.count || "0");
      const duration = 1500;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt.format(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    const countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => countIO.observe(el));
  } else {
    counters.forEach(setFinalCount);
  }

  /* ---------------- Back to top ---------------- */
  const toTop = document.getElementById("toTop");
  window.addEventListener("scroll", () => {
    toTop?.classList.toggle("is-visible", window.scrollY > 600);
  });
  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersMotion ? "smooth" : "auto" });
  });

  /* ---------------- Magnetic primary buttons (desktop pointer only) ---------------- */
  if (hasGSAP && pointerFine) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.25);
      });
      el.addEventListener("pointerleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  /* ---------------- Projects data + render (with subtle 3D tilt, desktop pointer only) ---------------- */
  const PROJECTS = window.SITE_PROJECTS || [];

  function attachTilt(card) {
    const MAX = 6;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * MAX * 2;
      const ry = (px - 0.5) * MAX * 2;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  }

  const grid = document.getElementById("projectsGrid");
  if (grid) {
    grid.innerHTML = PROJECTS.map(
      (p) => `
      <article class="project-card${p.featured ? " is-featured" : ""}" data-cat="${p.cat}">
        <div class="project-thumb">
          <img src="${p.photo}" alt="${p.title}" loading="lazy">
          <span class="project-tag">${p.catLabel}</span>
          <span class="project-icon"><svg><use href="#${p.icon}"/></svg></span>
        </div>
        <div class="project-body">
          <h3>${p.title}</h3>
          <div class="project-loc"><svg><use href="#ic-map-pin"/></svg>${p.loc}</div>
          <p>${p.desc}</p>
        </div>
      </article>`
    ).join("");

    if (prefersMotion && pointerFine) {
      grid.querySelectorAll(".project-card").forEach(attachTilt);
    }
  }

  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter;
      document.querySelectorAll(".project-card").forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.hidden = !show;
      });
    });
  });

  /* ---------------- Contact form (front-end demo submit) ---------------- */
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }
    formSuccess.classList.add("is-visible");
    contactForm.reset();
    formSuccess.scrollIntoView({ behavior: prefersMotion ? "smooth" : "auto", block: "center" });
  });

  /* ---------------- Newsletter (front-end demo submit) ---------------- */
  const newsletterForm = document.getElementById("newsletterForm");
  newsletterForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("nlEmail");
    if (input) {
      input.placeholder = (window.SITE_STRINGS && window.SITE_STRINGS.newsletterSuccess) || "Subscribed successfully ✓";
      input.value = "";
    }
  });
})();
