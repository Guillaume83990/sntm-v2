/* ============================================================
   SNTM SAP — remise-en-etat.js
   Animations propres a la page « remise en etat apres travaux ».
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
     2. LA CHRONOLOGIE
     Le rail se remplit en rouge a mesure qu'on descend, et
     chaque pastille s'allume quand son etape est atteinte.
     Sans JS, le rail reste un simple filet gris et les quatre
     etapes se lisent normalement.
     ======================================================== */

  const liste = document.getElementById('chronoList');
  const fill  = document.getElementById('chronoFill');
  const steps = gsap.utils.toArray('.chrono__step');

  if (liste && fill && !SNTM.reduced) {
    ScrollTrigger.create({
      trigger: liste,
      start: 'top 72%',
      end: 'bottom 72%',
      scrub: 0.4,
      onUpdate: (self) => { fill.style.height = (self.progress * 100).toFixed(1) + '%'; }
    });

    steps.forEach(function (step) {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 72%',
        onEnter: () => step.classList.add('is-on'),
        onLeaveBack: () => step.classList.remove('is-on')
      });
    });
  }

  /* ========================================================
     3. LES RÉSIDUS
     Arrivee en cascade, colonne par colonne.
     ======================================================== */

  if (!SNTM.reduced) {
    const items = gsap.utils.toArray('.resid__item');
    if (items.length) {
      gsap.set(items, { autoAlpha: 0, y: 20 });
      ScrollTrigger.create({
        trigger: '.resid__grid',
        start: 'top 82%',
        once: true,
        onEnter: () => gsap.to(items, {
          autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06
        })
      });
    }
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
