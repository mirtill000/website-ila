/* ============================================
   ILARIA VITA — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // --- Navigation scroll effect ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // --- Mobile menu ---
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      mobileMenu.classList.add('mobile-menu--open');
      document.body.style.overflow = 'hidden';
    });

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', function () {
        mobileMenu.classList.remove('mobile-menu--open');
        document.body.style.overflow = '';
      });
    }

    var mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('mobile-menu--open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll reveal (Intersection Observer) ---
  function initReveal() {
    var reveals = document.querySelectorAll('.reveal');
    var staggers = document.querySelectorAll('.stagger');

    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('reveal--visible'); });
      staggers.forEach(function (el) { el.classList.add('stagger--visible'); });
      return;
    }

    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });

    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('stagger--visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    staggers.forEach(function (el) {
      staggerObserver.observe(el);
    });
  }

  // --- Image reveal ---
  function initImageReveal() {
    var imgReveals = document.querySelectorAll('.img-reveal');

    if (!('IntersectionObserver' in window)) {
      imgReveals.forEach(function (el) { el.classList.add('img-reveal--visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('img-reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    imgReveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Counter animation for stats ---
  function animateCounters() {
    var counters = document.querySelectorAll('.stat__number');

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var text = el.textContent.trim();

          var match = text.match(/^([\d.]+)(.*)$/);
          if (match) {
            var target = parseFloat(match[1]);
            var suffix = match[2];

            var duration = 1500;
            var start = performance.now();

            function update(now) {
              var elapsed = now - start;
              var progress = Math.min(elapsed / duration, 1);
              var ease = 1 - Math.pow(1 - progress, 3);
              var current = Math.floor(target * ease);

              if (target % 1 !== 0) {
                current = (target * ease).toFixed(0);
              }

              el.textContent = current + suffix;

              if (progress < 1) {
                requestAnimationFrame(update);
              } else {
                el.textContent = text;
              }
            }

            requestAnimationFrame(update);
          }

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  // --- Parallax effect on hero ---
  function initParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        var heroContent = hero.querySelector('.hero__content');
        var heroBg = hero.querySelector('.hero__bg');
        if (heroContent) {
          heroContent.style.transform = 'translateY(' + (scrolled * 0.15) + 'px)';
          heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
        }
        if (heroBg) {
          heroBg.style.transform = 'translateY(' + (scrolled * 0.3) + 'px) scale(1.1)';
        }
      }
    }, { passive: true });
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initImageReveal();
    animateCounters();
    initParallax();
  });

})();
