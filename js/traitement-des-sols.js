/* ============================================================
   SNTM SAP — traitement-des-sols.js
   Animations propres a la page « traitement des sols ».
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
     2. LE NUANCIER SUIT LA LECTURE
     La bande de la matière à l'écran reste soulignée, et un
     clic emmène directement à sa fiche.
     ======================================================== */

  const bandes = gsap.utils.toArray('.nuan__strip');
  const fiches = gsap.utils.toArray('.fiche');

  fiches.forEach(function (fiche) {
    const bande = bandes.find((b) => b.getAttribute('href') === '#' + fiche.id);
    if (!bande) return;
    ScrollTrigger.create({
      trigger: fiche,
      start: 'top 60%',
      end: 'bottom 60%',
      onToggle: (self) => bande.classList.toggle('is-on', self.isActive)
    });
  });

  /* ========================================================
     3. LES FICHES
     L'image arrive par la diagonale à 28°, les repères
     techniques se posent l'un après l'autre.
     ======================================================== */

  if (!SNTM.reduced) {
    fiches.forEach(function (fiche) {
      const img    = fiche.querySelector('.fiche__img');
      const nom    = fiche.querySelector('.fiche__name');
      const num    = fiche.querySelector('.fiche__num');
      const specs  = fiche.querySelectorAll('.fiche__specs > div');
      const textes = fiche.querySelectorAll('.fiche__prose p, .fiche__need');
      const ghost  = fiche.querySelector('.fiche__ghost');

      gsap.set(img, { clipPath: 'polygon(-50% 100%, -95% 0%, -45% 0%, 0% 100%)' });
      gsap.set([num, nom], { autoAlpha: 0, y: 22 });
      gsap.set(specs, { autoAlpha: 0, y: 14 });
      gsap.set(textes, { autoAlpha: 0, y: 16 });
      gsap.set(ghost, { autoAlpha: 0, x: -30 });

      ScrollTrigger.create({
        trigger: fiche,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.timeline({ defaults: { ease: 'power3.out' } })
            .to(img, {
              clipPath: 'polygon(-50% 100%, -95% 0%, 100% 0%, 100% 100%)',
              duration: 1.2, ease: 'power3.inOut'
            }, 0)
            .to(ghost, { autoAlpha: 1, x: 0, duration: 1.2 }, 0.1)
            .to(num,   { autoAlpha: 1, y: 0, duration: 0.7 }, 0.15)
            .to(nom,   { autoAlpha: 1, y: 0, duration: 0.9 }, 0.22)
            .to(specs, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.42)
            .to(textes,{ autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.55);
        }
      });
    });
  }

  /* ========================================================
     4. LES RÉFLEXES
     Chaque paire arrive en deux temps : le mauvais geste,
     puis la correction.
     ======================================================== */

  if (!SNTM.reduced) {
    gsap.utils.toArray('.ref__pair').forEach(function (pair) {
      const bad  = pair.querySelector('.ref__bad');
      const good = pair.querySelector('.ref__good');
      gsap.set([bad, good], { autoAlpha: 0, y: 14 });
      ScrollTrigger.create({
        trigger: pair,
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })
          .to(bad,  { autoAlpha: 1, y: 0 })
          .to(good, { autoAlpha: 1, y: 0 }, 0.22)
      });
    });
  }

  /* ========================================================
     5. AVANT / APRÈS
     ======================================================== */

  SNTM.initCompare(document.getElementById('baStage'));

  /* ========================================================
     6. QUESTIONS FRÉQUENTES
     Une seule ouverte à la fois. Le balisage reste <details>,
     donc la page fonctionne sans JavaScript et reste indexable.
     ======================================================== */

  const items = gsap.utils.toArray('.faq__item');

  items.forEach(function (item) {
    const summary = item.querySelector('summary');
    const answer = item.querySelector('.faq__answer');

    summary.addEventListener('click', function (e) {
      if (SNTM.reduced) return;
      e.preventDefault();

      const isOpen = item.hasAttribute('open');

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
