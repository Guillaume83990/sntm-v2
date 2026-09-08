/* ============================================================
   SNTM SAP — realisations.js
   Six chantiers en flux normal. Un comparateur par chantier,
   et un sommaire qui suit la lecture.
   ============================================================ */

(function () {
  'use strict';

  const SNTM = window.SNTM;
  SNTM.whenReady(SNTM.initPageHero);

  const cartes = gsap.utils.toArray('.real');
  const liens  = gsap.utils.toArray('.reals__index a');

  /* ========================================================
     1. LES COMPARATEURS
     Declencheur vertical classique : la section n'est ni
     epinglee ni deplacee, donc il fonctionne sans reserve.
     ======================================================== */

  cartes.forEach(function (c) {
    SNTM.initCompare(c.querySelector('.ba__stage'));
  });

  /* ========================================================
     2. LE SOMMAIRE SUIT LA LECTURE
     ======================================================== */

  cartes.forEach(function (carte) {
    const lien = liens.find((a) => a.getAttribute('href') === '#' + carte.id);
    if (!lien) return;
    ScrollTrigger.create({
      trigger: carte,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: (self) => lien.classList.toggle('is-on', self.isActive)
    });
  });

  /* ========================================================
     3. L'ENTRÉE DE CHAQUE CHANTIER
     Le titre et les reperes se posent, l'image reste nette
     des le depart : c'est elle qu'on vient voir.
     ======================================================== */

  if (!SNTM.reduced) {
    cartes.forEach(function (carte) {
      const bits = carte.querySelectorAll('.real__head, .real__specs > div');
      gsap.set(bits, { autoAlpha: 0, y: 18 });
      ScrollTrigger.create({
        trigger: carte,
        start: 'top 80%',
        once: true,
        onEnter: () => gsap.to(bits, {
          autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.06
        })
      });
    });
  }
})();
