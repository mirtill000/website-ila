/* ============================================
   ILARIA VITA — Scroll & Interaction Animations
   Requires GSAP + ScrollTrigger (loaded before this file)
   ============================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  // No GSAP (CDN blocked/offline) or user prefers no motion: show everything
  // immediately instead of leaving .reveal/.stagger content stuck at opacity:0.
  if (!hasGSAP || reduceMotion) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.stagger > *').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.img-reveal').forEach(function (el) {
      el.classList.add('img-reveal--visible');
    });
    document.querySelectorAll('.stat__number').forEach(function (el) {
      // leave the authored value as-is, no count-up
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  // ------------------------------------------------------------
  // 1. Hero entrance — runs once on load, not on scroll.
  //    Elements inside .hero already carry .reveal / .reveal--delay-N
  //    from the markup; we animate them directly with a timeline so the
  //    easing/stagger is intentional instead of relying on CSS transitions.
  // ------------------------------------------------------------
  function heroEntrance() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var els = hero.querySelectorAll('.reveal');
    if (!els.length) return;

    gsap.set(els, { opacity: 0, y: 34 });

    var tl = gsap.timeline({ delay: 0.15 });
    tl.to(els, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      stagger: 0.14,
      ease: 'power4.out'
    });

    // Slow, deliberate zoom on the hero media so the entrance timeline and
    // the Ken Burns effect read as one continuous moment rather than two.
    var media = hero.querySelector('.hero-slider__slides, .hero__bg');
    if (media) {
      gsap.from(media, { opacity: 0, duration: 1.6, ease: 'power2.out' });
    }

    // Mark these elements as handled so the generic scroll-reveal pass
    // below skips them (they are above the fold and already animated).
    els.forEach(function (el) { el.dataset.heroHandled = 'true'; });
  }

  // ------------------------------------------------------------
  // 2. Scroll reveals — batched into as few ScrollTrigger instances as
  //    possible (one per section is expensive at 20+ elements; batch()
  //    shares a single scroll listener for the whole group).
  // ------------------------------------------------------------
  function scrollReveals() {
    var targets = Array.prototype.filter.call(
      document.querySelectorAll('.reveal'),
      function (el) { return el.dataset.heroHandled !== 'true'; }
    );
    if (!targets.length) return;

    gsap.set(targets, { opacity: 0, y: 34 });

    ScrollTrigger.batch(targets, {
      start: 'top 88%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 });
      }
    });
  }

  // ------------------------------------------------------------
  // 3. Stagger groups (.stagger > *) — service grids, stat rows, brand
  //    grids. Driven by however many children exist, not capped at 6
  //    like the old nth-child CSS rules.
  // ------------------------------------------------------------
  function staggerGroups() {
    document.querySelectorAll('.stagger').forEach(function (group) {
      var children = group.children;
      if (!children.length) return;

      gsap.set(children, { opacity: 0, y: 24 });

      ScrollTrigger.create({
        trigger: group,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          gsap.to(children, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 });
        }
      });
    });
  }

  // ------------------------------------------------------------
  // 4. Image curtain reveal (.img-reveal) — the wipe itself is a CSS
  //    ::after transition (can't be targeted by GSAP), so we just flip
  //    the trigger from IntersectionObserver to ScrollTrigger.
  // ------------------------------------------------------------
  function imageReveals() {
    document.querySelectorAll('.img-reveal').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: function () { el.classList.add('img-reveal--visible'); }
      });
    });
  }

  // ------------------------------------------------------------
  // 5. Stat counters — GSAP tweens a proxy object and writes the
  //    formatted value on every tick instead of hand-rolled rAF math.
  // ------------------------------------------------------------
  function statCounters() {
    document.querySelectorAll('.stat__number').forEach(function (el) {
      var text = el.textContent.trim();
      var match = text.match(/^([\d.]+)(.*)$/);
      if (!match) return; // e.g. the "∞" stat — leave untouched

      var target = parseFloat(match[1]);
      var suffix = match[2];
      var decimals = (match[1].split('.')[1] || '').length;
      var proxy = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          gsap.to(proxy, {
            val: target,
            duration: 1.6,
            ease: 'power3.out',
            onUpdate: function () {
              el.textContent = proxy.val.toFixed(decimals) + suffix;
            },
            onComplete: function () { el.textContent = text; }
          });
        }
      });
    });
  }

  // ------------------------------------------------------------
  // 6. Parallax — scroll-scrubbed, transform-only (no layout thrash).
  //    Applied to wrapper elements, never to the same node the CSS
  //    Ken Burns keyframe animates, so the two transforms don't collide.
  // ------------------------------------------------------------
  function parallax() {
    var heroSlides = document.querySelector('.hero-slider__slides');
    if (heroSlides) {
      gsap.to(heroSlides, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSlides.closest('.hero'),
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    var heroBg = document.querySelector('.hero__bg');
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 15,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: heroBg.closest('.hero'),
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    document.querySelectorAll('.split__image img').forEach(function (img) {
      gsap.to(img, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.split__image'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  // ------------------------------------------------------------
  // 7. Magnetic buttons — the button eases toward the cursor within its
  //    own box, then springs back. quickTo() reuses one tween per axis
  //    instead of creating a new tween on every mousemove.
  // ------------------------------------------------------------
  function magneticButtons() {
    var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarsePointer) return; // magnetic hover is a mouse-only affordance

    document.querySelectorAll('.btn').forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });

      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        xTo(relX * 0.35);
        yTo(relY * 0.5);
      });

      btn.addEventListener('mouseleave', function () {
        xTo(0);
        yTo(0);
      });
    });
  }

  // ------------------------------------------------------------
  // 8. Tilt on portfolio/service surfaces — a light 3D tilt that follows
  //    the cursor, on top of the existing CSS image-zoom hover.
  // ------------------------------------------------------------
  function tiltCards() {
    var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarsePointer) return;

    var cards = document.querySelectorAll('.triptych__panel, .service-card');
    cards.forEach(function (card) {
      var rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      var rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });

      gsap.set(card, { transformPerspective: 900, transformOrigin: 'center' });

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        rotateY(px * 6);
        rotateX(py * -6);
      });

      card.addEventListener('mouseleave', function () {
        rotateX(0);
        rotateY(0);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    heroEntrance();
    scrollReveals();
    staggerGroups();
    imageReveals();
    statCounters();
    parallax();
    magneticButtons();
    tiltCards();

    // Layout (images, fonts) can shift section positions after first
    // paint; recalculate trigger start/end points once things settle.
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });

})();
