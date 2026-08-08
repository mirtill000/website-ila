/* ============================================
   ILARIA VITA — BETA — main.js
   Nav scroll state, mobile menu, GSAP reveals/animations.
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

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  if (!hasGSAP || reduceMotion) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  var heroEls = document.querySelectorAll('.hero .reveal');
  gsap.set(heroEls, { opacity: 0, y: 26 });
  gsap.timeline({ delay: 0.1 }).to(heroEls, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power4.out' });

  // Generic scroll reveals (everything outside hero)
  var rest = Array.prototype.filter.call(document.querySelectorAll('.reveal'), function (el) { return !el.closest('.hero'); });
  gsap.set(rest, { opacity: 0, y: 26 });
  ScrollTrigger.batch(rest, {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }); }
  });

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

  // Gentle parallax on hero + pillar photography
  document.querySelectorAll('.hero__portrait img, .pillar-card__media img').forEach(function (img) {
    gsap.to(img, {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: img.closest('.hero, .pillar-card'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // Magnetic buttons — subtle, fits the pill shape too
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
