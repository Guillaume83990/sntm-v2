/* ============================================================
   SNTM SAP — a-propos.js
   ============================================================ */

(function () {
  'use strict';

  const SNTM = window.SNTM;
  SNTM.whenReady(SNTM.initPageHero);

  /* ========================================================
     1. LES PARTIS PRIS
     Le chiffre en contour arrive avant le texte : il pose le
     rythme, le texte le suit.
     ======================================================== */

  if (!SNTM.reduced) {
    gsap.utils.toArray('.parti').forEach(function (p) {
      const num = p.querySelector('.parti__num');
      const txt = p.querySelectorAll('h3, p');

      gsap.set(num, { autoAlpha: 0, x: 24 });
      gsap.set(txt, { autoAlpha: 0, y: 18 });

      ScrollTrigger.create({
        trigger: p,
        start: 'top 82%',
        once: true,
        onEnter: () => gsap.timeline({ defaults: { ease: 'power3.out' } })
          .to(num, { autoAlpha: 1, x: 0, duration: 1.1 }, 0)
          .to(txt, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 }, 0.15)
      });
    });
  }

  /* ========================================================
     2. LE TERRITOIRE
     L'image arrive par la diagonale, comme partout ailleurs.
     ======================================================== */

  if (!SNTM.reduced) {
    gsap.utils.toArray('.terr__item').forEach(function (item) {
      const img = item.querySelector('.terr__img');
      const txt = item.querySelectorAll('h3, p');

      gsap.set(img, { clipPath: 'polygon(-50% 100%, -95% 0%, -45% 0%, 0% 100%)' });
      gsap.set(txt, { autoAlpha: 0, y: 18 });

      ScrollTrigger.create({
        trigger: item,
        start: 'top 80%',
        once: true,
        onEnter: () => gsap.timeline({ defaults: { ease: 'power3.out' } })
          .to(img, {
            clipPath: 'polygon(-50% 100%, -95% 0%, 100% 0%, 100% 100%)',
            duration: 1.15, ease: 'power3.inOut'
          }, 0)
          .to(txt, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 }, 0.35)
      });
    });
  }

  /* ========================================================
     3. LE VÉHICULE
     Léger recul de l'image au scroll.
     ======================================================== */

  const camion = document.querySelector('.camion__media img');
  if (camion && !SNTM.reduced) {
    gsap.to(camion, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.camion__media', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }
})();
