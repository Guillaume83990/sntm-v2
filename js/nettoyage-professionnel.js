/* ============================================================
   SNTM SAP — nettoyage-professionnel.js
   Animations et interactions propres à la page pilier
   « nettoyage professionnel ».
   ============================================================ */

(function () {
  'use strict';

  const SNTM = window.SNTM;

  /* ========================================================
     1. HERO DE PAGE
     L'entree est commune aux quatre pages interieures.
     ======================================================== */

  SNTM.whenReady(SNTM.initPageHero);

  /* ========================================================
     2. QUESTIONS FRÉQUENTES
     Une seule ouverte à la fois, avec une hauteur animée.
     Le balisage reste <details>, donc la page fonctionne
     entièrement sans JavaScript et reste indexable.
     ======================================================== */

  const items = gsap.utils.toArray('.faq__item');

  items.forEach(function (item) {
    const summary = item.querySelector('summary');
    const answer = item.querySelector('.faq__answer');

    summary.addEventListener('click', function (e) {
      if (SNTM.reduced) return;
      e.preventDefault();

      const isOpen = item.hasAttribute('open');

      // Refermer les autres.
      items.forEach(function (other) {
        if (other === item || !other.hasAttribute('open')) return;
        const oa = other.querySelector('.faq__answer');
        gsap.to(oa, {
          height: 0, autoAlpha: 0, duration: 0.4, ease: 'power2.inOut',
          onComplete: () => { other.removeAttribute('open'); gsap.set(oa, { height: 'auto' }); }
        });
      });

      if (isOpen) {
        gsap.to(answer, {
          height: 0, autoAlpha: 0, duration: 0.4, ease: 'power2.inOut',
          onComplete: () => { item.removeAttribute('open'); gsap.set(answer, { height: 'auto' }); }
        });
      } else {
        item.setAttribute('open', '');
        gsap.fromTo(answer,
          { height: 0, autoAlpha: 0 },
          { height: 'auto', autoAlpha: 1, duration: 0.5, ease: 'power2.out',
            onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });
})();
