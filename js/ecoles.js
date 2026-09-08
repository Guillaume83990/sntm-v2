/* ============================================================
   SNTM SAP — ecoles.js
   Animations propres a la page « etablissements scolaires ».
   ============================================================ */

(function () {
  'use strict';

  const SNTM = window.SNTM;

  /* ========================================================
     1. HERO DE PAGE
     L'entree est commune aux pages interieures.
     ======================================================== */

  SNTM.whenReady(SNTM.initPageHero);

  /* ========================================================
     2. LES TROIS TEMPS
     L'image arrive par la diagonale, le texte suit.
     ======================================================== */

  if (!SNTM.reduced) {
    gsap.utils.toArray('.tmps__item').forEach(function (item) {
      const img = item.querySelector('.tmps__img');
      const bits = item.querySelectorAll('.tmps__num, .tmps__body h3, .tmps__key, .tmps__body p:not(.tmps__key)');

      gsap.set(img, { clipPath: 'polygon(-50% 100%, -95% 0%, -45% 0%, 0% 100%)' });
      gsap.set(bits, { autoAlpha: 0, y: 20 });

      ScrollTrigger.create({
        trigger: item,
        start: 'top 78%',
        once: true,
        onEnter: () => gsap.timeline({ defaults: { ease: 'power3.out' } })
          .to(img, {
            clipPath: 'polygon(-50% 100%, -95% 0%, 100% 0%, 100% 100%)',
            duration: 1.15, ease: 'power3.inOut'
          }, 0)
          .to(bits, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 }, 0.35)
      });
    });
  }

  /* ========================================================
     3. LES POINTS DE CONTACT
     Les douze pastilles se posent en cascade.
     ======================================================== */

  if (!SNTM.reduced) {
    const chips = gsap.utils.toArray('.ctc__list li');
    if (chips.length) {
      gsap.set(chips, { autoAlpha: 0, y: 14, scale: 0.96 });
      ScrollTrigger.create({
        trigger: '.ctc__list',
        start: 'top 84%',
        once: true,
        onEnter: () => gsap.to(chips, {
          autoAlpha: 1, y: 0, scale: 1,
          duration: 0.65, ease: 'power3.out', stagger: 0.045
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
