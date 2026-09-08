/* ============================================================
   SNTM SAP — locaux-commerciaux.js
   Animations propres a la page « locaux commerciaux ».
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
     2. L'ANNÉE
     Les douze segments montent de gauche a droite. Leur
     hauteur est definie en CSS : le JS ne fait que retarder
     leur apparition, donc la section reste juste sans lui.
     ======================================================== */

  const mois = gsap.utils.toArray('.sais__mois');

  if (mois.length && !SNTM.reduced) {
    gsap.set(mois, { scaleY: 0, transformOrigin: 'bottom center' });
    ScrollTrigger.create({
      trigger: '.sais__year',
      start: 'top 82%',
      once: true,
      onEnter: () => gsap.to(mois, {
        scaleY: 1, duration: 0.85, ease: 'power3.out', stagger: 0.055
      })
    });
  }

  /* ========================================================
     3. LA CHECKLIST
     Les huit points se cochent l'un apres l'autre au scroll.
     ======================================================== */

  const points = gsap.utils.toArray('.check__list li');

  if (points.length && !SNTM.reduced) {
    ScrollTrigger.create({
      trigger: '.check__list',
      start: 'top 78%',
      once: true,
      onEnter: () => points.forEach((li, i) =>
        gsap.delayedCall(0.12 * i, () => li.classList.add('is-on')))
    });
  } else {
    points.forEach((li) => li.classList.add('is-on'));
  }

  /* ========================================================
     4. QUESTIONS FRÉQUENTES
     ======================================================== */

  const faq = gsap.utils.toArray('.faq__item');

  faq.forEach(function (item) {
    const summary = item.querySelector('summary');
    const answer = item.querySelector('.faq__answer');

    summary.addEventListener('click', function (e) {
      if (SNTM.reduced) return;
      e.preventDefault();

      const isOpen = item.hasAttribute('open');

      faq.forEach(function (other) {
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
