(() => {
  "use strict";

  const prefersMotion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  if (prefersMotion) document.documentElement.classList.add("motion");

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
  if (prefersMotion && "IntersectionObserver" in window) {
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
  const fmt = new Intl.NumberFormat("ar-SA-u-nu-latn");
  function animateCount(el) {
    const target = Number(el.dataset.count || "0");
    if (!prefersMotion) {
      el.textContent = fmt.format(target);
      return;
    }
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
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
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
    counters.forEach(animateCount);
  }

  /* ---------------- Back to top ---------------- */
  const toTop = document.getElementById("toTop");
  window.addEventListener("scroll", () => {
    toTop?.classList.toggle("is-visible", window.scrollY > 600);
  });
  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersMotion ? "smooth" : "auto" });
  });

  /* ---------------- Projects data + render ---------------- */
  const PROJECTS = [
    {
      title: "مجمع أبراج الواحة السكني",
      loc: "الرياض",
      cat: "residential",
      catLabel: "سكني",
      desc: "3 أبراج سكنية بارتفاع 22 طابقًا و480 وحدة سكنية.",
      icon: "ic-building",
    },
    {
      title: "الطريق الدائري الشرقي",
      loc: "جدة",
      cat: "infrastructure",
      catLabel: "بنية تحتية",
      desc: "42 كم من الطرق وجسور تقاطعات متعددة المستويات.",
      icon: "ic-road",
    },
    {
      title: "مصنع الأفق للصناعات الغذائية",
      loc: "الدمام",
      cat: "industrial",
      catLabel: "صناعي",
      desc: "منشأة صناعية بمساحة 38,000 م² وخطوط إنتاج متكاملة.",
      icon: "ic-factory",
    },
    {
      title: "مركز رواسي بلازا التجاري",
      loc: "مكة المكرمة",
      cat: "commercial",
      catLabel: "تجاري",
      desc: "مركز تجاري متعدد الطوابق بمواقف لأكثر من 1,200 سيارة.",
      icon: "ic-store",
    },
    {
      title: "مجمع مستشفى الشفاء التخصصي",
      loc: "المدينة المنورة",
      cat: "health",
      catLabel: "صحي",
      desc: "منشأة طبية بسعة 260 سريرًا و12 قسمًا متخصصًا.",
      icon: "ic-cross",
    },
    {
      title: "محطة معالجة مياه النخيل",
      loc: "الخبر",
      cat: "infrastructure",
      catLabel: "بنية تحتية",
      desc: "محطة بطاقة معالجة تصل إلى 45,000 م³ يوميًا.",
      icon: "ic-road",
    },
  ];

  const THUMB_SHADES = ["#122a4d", "#0B1F3A", "#1b3660"];

  function projectThumbSVG(icon, seed) {
    const shade = THUMB_SHADES[seed % THUMB_SHADES.length];
    return `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <pattern id="pgrid${seed}" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#C9A227" stroke-width="0.5" opacity="0.16"/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill="${shade}"/>
        <rect width="400" height="300" fill="url(#pgrid${seed})"/>
        <circle cx="335" cy="55" r="34" fill="none" stroke="#C9A227" stroke-width="1.5" opacity="0.6"/>
        <g transform="translate(150,90)" color="#E9DDB8">
          <use href="#${icon}" width="100" height="100"/>
        </g>
        <path d="M0 260h400" stroke="#C9A227" stroke-width="1" opacity="0.4"/>
      </svg>`;
  }

  const grid = document.getElementById("projectsGrid");
  if (grid) {
    grid.innerHTML = PROJECTS.map(
      (p, i) => `
      <article class="project-card" data-cat="${p.cat}">
        <div class="project-thumb">
          ${projectThumbSVG(p.icon, i)}
          <span class="project-tag">${p.catLabel}</span>
        </div>
        <div class="project-body">
          <h3>${p.title}</h3>
          <div class="project-loc"><svg><use href="#ic-map-pin"/></svg>${p.loc}</div>
          <p>${p.desc}</p>
        </div>
      </article>`
    ).join("");
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
      input.placeholder = "تم الاشتراك بنجاح ✓";
      input.value = "";
    }
  });
})();
