/* ===========================================================
   テック・スマイル｜こどもプログラミング教室
   Interactions
   =========================================================== */
(function () {
  "use strict";

  /* --- 常に最上部から開始 --- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  const toTop = document.getElementById("toTop");
  const floaters = Array.from(document.querySelectorAll(".js-float"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Page Transitions --- */
  document.addEventListener("click", function (e) {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.includes("://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      link.getAttribute("target") === "_blank"
    ) return;
    e.preventDefault();
    if (reduceMotion) { window.location.href = href; return; }
    document.body.classList.add("ts-exit");
    setTimeout(() => { window.location.href = href; }, 240);
  });

  /* --- Scroll: header + back-to-top + blob parallax --- */
  let ticking = false;
  let lastY = window.scrollY;
  function render() {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);
    toTop.classList.toggle("is-visible", y > 600);

    // ヘッダー：下スクロールで隠し、上スクロール（最上部以外でも）で表示
    const navOpen = nav && nav.classList.contains("is-open");
    if (y <= 80 || navOpen) {
      header.classList.remove("is-hidden");
    } else if (y > lastY + 4) {
      header.classList.add("is-hidden");
    } else if (y < lastY - 4) {
      header.classList.remove("is-hidden");
    }
    lastY = y;

    if (!reduceMotion) {
      for (const el of floaters) {
        const speed = parseFloat(el.dataset.speed || "0");
        el.style.transform = "translateY(" + y * speed + "px)";
      }
    }
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(render);
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  render();

  /* --- Mobile nav --- */
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) {
        nav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* --- Pricing toggle (monthly / yearly) --- */
  const toggleBtns = document.querySelectorAll(".toggle__btn");
  const amounts = document.querySelectorAll(".plan__price .amount");
  const pers = document.querySelectorAll(".plan__price .per");
  function setPlan(plan) {
    toggleBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.plan === plan));
    const swap = (els) =>
      els.forEach((el) => {
        const val = el.dataset[plan];
        if (val == null) return;
        el.style.opacity = "0";
        setTimeout(() => {
          el.textContent = val;
          el.style.opacity = "1";
        }, 130);
      });
    swap(amounts);
    swap(pers);
  }
  toggleBtns.forEach((btn) => btn.addEventListener("click", () => setPlan(btn.dataset.plan)));

  /* --- Scrollspy --- */
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = "#" + entry.target.id;
            navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* --- Reveal on scroll --- */
  const revealTargets = document.querySelectorAll(
    ".lead, .about__catch, .trio__card, .toggle, .plan, .step, .voice__card, .faq__item, .access__map, .access__info, .contact__form, " +
    ".panel, .block, .flowstep, .stats__item, .detail, .faqgroup, .cta-band__inner"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  }

  /* --- FAQ: only one open --- */
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", function () {
      if (item.open) faqItems.forEach((o) => { if (o !== item) o.open = false; });
    });
  });

  /* --- Contact form (demo) --- */
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const name = (document.getElementById("parent").value || "").trim();
      note.textContent = (name ? name + "さん、" : "") + "ありがとうございます！2営業日以内にご連絡します。";
      form.reset();
      setTimeout(() => (note.textContent = ""), 8000);
    });
  }

  /* --- Scratch cat mascot --- */
  document.querySelectorAll(".detail__emoji--cat, .plan__emoji--cat").forEach(function (wrapper) {
    var img = wrapper.querySelector(".cat-mascot img");
    if (!img || reduceMotion) return;

    wrapper.addEventListener("mouseenter", function () {
      if (img.classList.contains("is-wiggle")) return;
      img.classList.add("is-wiggle");
    });
    img.addEventListener("animationend", function (e) {
      if (e.animationName === "catWiggle") img.classList.remove("is-wiggle");
    });
    wrapper.addEventListener("mouseleave", function () {
      img.classList.remove("is-wiggle");
    });
  });

  /* --- Footer year --- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
