/* ============================================
   ILARIA VITA — GAMMA (v2) — main.js
   Nav, mobile menu, and a richer animation pass than beta: hero collage
   parallax, curtain-wipe image reveals, tilt on the pillar cards, a
   parallax image break, magnetic buttons, stat counters.
   ============================================ */

(function () {
  'use strict';

  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
  }, { passive: true });

  var toggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileClose = document.getElementById('mobileMenuClose');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () { mobileMenu.classList.add('mobile-menu--open'); document.body.style.overflow = 'hidden'; });
    mobileClose.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(function (l) { l.addEventListener('click', closeMenu); });
  }
  function closeMenu() { mobileMenu.classList.remove('mobile-menu--open'); document.body.style.overflow = ''; }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Tilt on pillar cards — works with or without GSAP, so it's set up
  // unconditionally (unlike the scroll/parallax effects below).
  if (!window.matchMedia('(pointer: coarse)').matches) {
    document.querySelectorAll('.pillar-card').forEach(function (card) {
      var media = card.querySelector('.pillar-card__media');
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        media.style.setProperty('--tilt-y', (px * 10).toFixed(2) + 'deg');
        media.style.setProperty('--tilt-x', (py * -10).toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        media.style.setProperty('--tilt-y', '0deg');
        media.style.setProperty('--tilt-x', '0deg');
      });
    });
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  if (!hasGSAP || reduceMotion) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
    document.querySelectorAll('.img-reveal').forEach(function (el) { el.classList.add('img-reveal--visible'); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance — text first, then the collage images
  var heroText = document.querySelectorAll('.hero .reveal');
  var collageAccent = document.querySelector('.hero__collage-accent');
  var collageMain = document.querySelector('.hero__collage-main');

  gsap.set(heroText, { opacity: 0, y: 24 });
  if (collageAccent) gsap.set(collageAccent, { opacity: 0, x: -30 });
  if (collageMain) gsap.set(collageMain, { opacity: 0, x: 30 });

  var tl = gsap.timeline({ delay: 0.1 });
  tl.to(heroText, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out' });
  if (collageAccent) tl.to(collageAccent, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3');
  if (collageMain) tl.to(collageMain, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6');

  // Hero collage parallax — accent and main image drift at different
  // speeds so the layering reads as depth while scrolling past.
  if (collageAccent) {
    gsap.to(collageAccent, {
      yPercent: -14, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }
  if (collageMain) {
    gsap.to(collageMain, {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // Generic scroll reveals (everything outside hero)
  var rest = Array.prototype.filter.call(document.querySelectorAll('.reveal'), function (el) { return !el.closest('.hero'); });
  gsap.set(rest, { opacity: 0, y: 26 });
  ScrollTrigger.batch(rest, {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }); }
  });

  // Curtain-wipe reveal on the pillar/gallery images
  document.querySelectorAll('.img-reveal').forEach(function (el) {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: function () { el.classList.add('img-reveal--visible'); }
    });
  });

  // Parallax on the pillar photography + the full-bleed image break
  document.querySelectorAll('.pillar-card__media-main img').forEach(function (img) {
    gsap.to(img, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: img.closest('.pillar-card'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
  var breakImg = document.querySelector('.image-break__media img');
  if (breakImg) {
    gsap.to(breakImg, {
      yPercent: 14, ease: 'none',
      scrollTrigger: { trigger: '.image-break', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  // Stat counters
  document.querySelectorAll('.stat__num').forEach(function (el) {
    var text = el.textContent.trim();
    var match = text.match(/^([\d.]+)(.*)$/);
    if (!match) return;
    var target = parseFloat(match[1]);
    var suffix = match[2];
    var proxy = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () {
        gsap.to(proxy, {
          val: target, duration: 1.6, ease: 'power3.out',
          onUpdate: function () { el.textContent = Math.floor(proxy.val) + suffix; },
          onComplete: function () { el.textContent = text; }
        });
      }
    });
  });

  // Magnetic buttons
  if (!window.matchMedia('(pointer: coarse)').matches) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
