/* ============================================================
   SNTM SAP — contact.js
   Formulaire qualifiant en trois etapes.
   Sans JavaScript, les trois etapes restent visibles et le
   formulaire s'envoie normalement : le decoupage est un confort,
   pas une dependance.
   ============================================================ */

(function () {
  'use strict';

  const SNTM = window.SNTM;

  SNTM.whenReady(SNTM.initPageHero);

  // Les messages suivent la langue du document : une seule
  // version du script sert les deux versions du site.
  const EN = document.documentElement.lang === 'en';
  const MESSAGES = {
    manque: EN
      ? 'Something is missing to continue. Check the highlighted fields.'
      : 'Il manque une information pour continuer. Vérifiez les champs signalés.',
    avant: EN
      ? 'An earlier step is incomplete. Go back to fill it in.'
      : 'Une information est manquante à une étape précédente. Revenez en arrière pour la compléter.',
    photos: EN
      ? 'Three photos maximum. Keep the most telling ones.'
      : 'Trois photos au maximum. Gardez les plus parlantes.'
  };

  const form = document.getElementById('devis');
  if (!form) return;

  const steps = gsap.utils.toArray('.form__step', form);
  const bar   = document.getElementById('formBar');
  const num   = document.getElementById('formStep');
  const err   = document.getElementById('formError');
  let courant = 1;

  // Le decoupage n'existe qu'a partir d'ici : si le script echoue
  // avant, le formulaire reste utilisable d'un bloc.
  form.classList.add('is-stepped');

  function afficher(n, sens) {
    const cible = steps.find((s) => +s.dataset.step === n);
    const avant = steps.find((s) => +s.dataset.step === courant);
    if (!cible) return;

    err.hidden = true;
    courant = n;
    if (num) num.textContent = n;
    if (bar) bar.style.width = (n / steps.length * 100).toFixed(1) + '%';

    steps.forEach((s) => { if (s !== cible) s.hidden = true; });
    cible.hidden = false;

    if (SNTM.reduced) return;
    gsap.fromTo(cible,
      { autoAlpha: 0, x: sens > 0 ? 26 : -26 },
      { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' });
    if (avant && avant !== cible) gsap.set(avant, { clearProps: 'all' });
  }

  // Validation de l'etape courante uniquement : on ne bloque pas
  // le visiteur sur un champ qu'il n'a pas encore vu.
  function valide(step) {
    const champs = step.querySelectorAll('input, select, textarea');
    let ok = true, premier = null;

    champs.forEach(function (c) {
      if (c.type === 'radio') {
        const groupe = step.querySelectorAll('input[name="' + c.name + '"]');
        const requis = Array.from(groupe).some((g) => g.required);
        if (requis && !Array.from(groupe).some((g) => g.checked)) {
          ok = false; if (!premier) premier = groupe[0];
        }
        return;
      }
      if (!c.checkValidity()) { ok = false; if (!premier) premier = c; }
    });

    if (!ok) {
      form.classList.add('is-checked');
      err.hidden = false;
      err.textContent = MESSAGES.manque;
      if (premier) premier.focus({ preventScroll: false });
    }
    return ok;
  }

  form.addEventListener('click', function (e) {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    const cible = +b.dataset.go;
    if (cible > courant && !valide(steps.find((s) => +s.dataset.step === courant))) return;
    afficher(cible, cible > courant ? 1 : -1);
  });

  form.addEventListener('submit', function (e) {
    if (!valide(steps.find((s) => +s.dataset.step === courant))) {
      e.preventDefault();
      return;
    }
    // Toutes les etapes sont dans le DOM : les champs masques
    // partent avec le formulaire, rien n'est perdu.
    steps.forEach((s) => { s.hidden = false; });
    if (!form.checkValidity()) {
      e.preventDefault();
      steps.forEach((s) => { if (+s.dataset.step !== courant) s.hidden = true; });
      form.classList.add('is-checked');
      err.hidden = false;
      err.textContent = MESSAGES.avant;
    }
  });

  // Trois photos maximum, comme annonce.
  const photos = form.querySelector('input[type="file"]');
  if (photos) {
    photos.addEventListener('change', function () {
      if (photos.files.length > 3) {
        err.hidden = false;
        err.textContent = MESSAGES.photos;
        photos.value = '';
      }
    });
  }

  afficher(1, 1);
})();
