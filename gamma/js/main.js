/* ============================================
   ILARIA VITA — GAMMA — main.js
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

  // Hero entrance — portrait first, then nodes/spokes radiate outward
  var heroText = document.querySelectorAll('.hero .reveal');
  var portrait = document.querySelector('.orbit__portrait, .orbit-fallback__portrait');
  var spokes = document.querySelectorAll('.orbit__spoke');
  var nodes = document.querySelectorAll('.orbit__node, .orbit-fallback__node');

  gsap.set(heroText, { opacity: 0, y: 24 });
  if (portrait) gsap.set(portrait, { opacity: 0, scale: 0.85 });
  gsap.set(spokes, { opacity: 0 });
  gsap.set(nodes, { opacity: 0, scale: 0.6 });

  var tl = gsap.timeline({ delay: 0.1 });
  tl.to(heroText, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out' });
  if (portrait) tl.to(portrait, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, '-=0.3');
  tl.to(spokes, { opacity: 1, duration: 0.5, stagger: 0.08 }, '-=0.3');
  tl.to(nodes, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' }, '-=0.3');

  // Generic scroll reveals (everything outside hero)
  var rest = Array.prototype.filter.call(document.querySelectorAll('.reveal'), function (el) { return !el.closest('.hero'); });
  gsap.set(rest, { opacity: 0, y: 24 });
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

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
