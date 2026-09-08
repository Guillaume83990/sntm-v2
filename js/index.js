/* ============================================================
   SNTM SAP — index.js
   Animations propres à la page d'accueil.
   ============================================================ */

(function () {
  'use strict';

  const SNTM = window.SNTM;
  const mm = gsap.matchMedia();

  /* ========================================================
     1. HERO — « LA SURFACE SE RÉVÈLE »
     Épinglé sur 220vh. Le scroll pilote quatre choses à la
     fois : l'avancée de la caméra, la diagonale de lumière qui
     découvre l'état entretenu, la relève des verbes du métier,
     et la montée de la marque.
     ======================================================== */

  (function surface() {
    const pin      = document.getElementById('heroPin');
    const stage    = document.getElementById('heroStage');
    const frame    = document.getElementById('heroFrame');
    const brand    = document.getElementById('heroBrand');
    const stroke   = document.querySelector('.hero__stroke');
    const activity = document.getElementById('heroActivity');
    const claim    = document.getElementById('heroClaim');
    const sectors  = document.getElementById('heroSectors');
    const place    = document.getElementById('heroPlace');
    const verbs    = gsap.utils.toArray('#heroVerbs span');
    const actions  = document.getElementById('heroActions');
    const veil     = document.getElementById('heroVeil');
    const rule     = document.getElementById('heroRule');
    const footL    = document.getElementById('heroFootL');
    const footR    = document.getElementById('heroFootR');

    if (!pin || !stage) return;

    /* --- Entrée : rien ne clignote, tout se pose ---------- */
    SNTM.whenReady(function () {
      if (SNTM.reduced) return;
      gsap.set(brand,    { autoAlpha: 0, letterSpacing: '.9em' });
      gsap.set(stroke,   { scaleY: 0, transformOrigin: 'top center' });
      gsap.set(activity, { autoAlpha: 0, y: 22 });
      gsap.set(claim,    { autoAlpha: 0, y: 16 });
      gsap.set(sectors,  { autoAlpha: 0, y: 14 });
      gsap.set(place,    { autoAlpha: 0, y: 12 });
      gsap.set(actions,  { autoAlpha: 0, y: 14 });
      gsap.set(frame,    { autoAlpha: 0, scale: 1.035 });
      gsap.set('.hero__foot', { autoAlpha: 0 });

      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(frame,    { autoAlpha: 1, scale: 1, duration: 1.5, ease: 'power3.inOut' }, 0)
        .to(brand,    { autoAlpha: 1, letterSpacing: '.52em', duration: 1.3 }, 0.15)
        .to(stroke,   { scaleY: 1, duration: 0.9 }, 0.7)
        // L'ordre d'apparition est l'ordre de lecture voulu :
        // l'activité d'abord, la signature ensuite, le reste après.
        .to(activity, { autoAlpha: 1, y: 0, duration: 1.1 }, 0.8)
        .to(claim,    { autoAlpha: 1, y: 0, duration: 0.9 }, 1.05)
        .to(sectors,  { autoAlpha: 1, y: 0, duration: 0.85 }, 1.25)
        .to(place,    { autoAlpha: 1, y: 0, duration: 0.8 }, 1.35)
        .to(actions,  { autoAlpha: 1, y: 0, duration: 0.9 }, 1.45)
        .to('.hero__foot', { autoAlpha: 1, duration: 0.8 }, 1.6);
    });

    if (SNTM.reduced) { pin.style.setProperty('--pass', 100); return; }

    gsap.set(verbs, { autoAlpha: 0 });
    pin.style.setProperty('--pass', 0);

    const fenetres = [[0.10, 0.30], [0.28, 0.48], [0.46, 0.66], [0.64, 0.82]];
    const etats = ['Surface mate', 'Nettoyée', 'Entretenue', 'Préservée', 'Restaurée'];

    // La course d'épinglage s'adapte au support : au doigt, une
    // course de 220vh est interminable. 140vh suffit sur mobile.
    function course() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const k = w < 700 ? 1.4 : w < 1024 ? 1.8 : 2.2;
      // Bornée en pixels : sur une tablette portrait de 1366 px de
      // haut, 2.2x donnerait 3000 px de scroll pour un seul écran.
      return Math.round(Math.min(Math.max(h * k, 900), 2100));
    }

    ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: () => '+=' + course(),
      pin: true,
      pinSpacing: true,
      scrub: 0.55,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress;

        // La caméra avance lentement vers la matière.
        gsap.set(stage, { scale: 1 + p * 0.18, yPercent: -p * 3 });
        // Le cadre s'ouvre avec elle, de quelques pixels.
        gsap.set(frame, { scale: 1 + p * 0.018 });

        // La diagonale découvre l'état entretenu.
        const pass = gsap.utils.clamp(0, 1, (p - 0.04) / 0.80);
        pin.style.setProperty('--pass', (pass * 100).toFixed(2));
        gsap.set(veil, { opacity: 1 - pass * 0.42 });

        // Les verbes se relaient à la place de la signature de
        // marque. La ligne d'activité, elle, ne bouge jamais.
        let actif = false;
        verbs.forEach(function (v, i) {
          const [a, b] = fenetres[i];
          if (p < a || p > b) { gsap.set(v, { autoAlpha: 0 }); return; }
          actif = true;
          const t = (p - a) / (b - a);
          const f = Math.sin(Math.PI * t);
          gsap.set(v, { autoAlpha: f, yPercent: (1 - f) * 34 * (t < 0.5 ? 1 : -1) });
        });
        gsap.set(claim, { autoAlpha: actif ? 0 : 1 });

        // Le filet de progression et l'état courant de la surface.
        if (rule) rule.style.width = (pass * 100).toFixed(1) + '%';
        if (footL) {
          const k = Math.min(etats.length - 1, Math.floor(pass * (etats.length - 0.001)));
          if (footL.textContent !== etats[k]) footL.textContent = etats[k];
        }
        if (footR) gsap.set(footR, { autoAlpha: 1 - gsap.utils.clamp(0, 1, p / 0.14) });

        // Fin de course : la marque se resserre.
        const fin = gsap.utils.clamp(0, 1, (p - 0.82) / 0.18);
        gsap.set(brand, { letterSpacing: (0.52 - fin * 0.14) + 'em' });
      }
    });
  })();

  /* ========================================================
     2. TRAITEMENT DES SOLS
     Section épinglée. Cinq substitutions le long de la
     diagonale à 28°, avec un temps de pause sur chaque
     matière. Le rail est cliquable : le visiteur n'est
     jamais prisonnier de la séquence.
     ======================================================== */

  (function matieres() {
    const pin   = document.getElementById('matsPin');
    const stage = document.getElementById('matsStage');
    const imgs  = gsap.utils.toArray('.mats__img');
    const metas = gsap.utils.toArray('.mats__meta');
    const noms  = gsap.utils.toArray('#matsNames span');
    const puces = gsap.utils.toArray('#matsRail button');

    if (!pin || imgs.length < 2) return;

    const N = imgs.length;
    const SEG = 1 / (N - 1);          // une substitution par intervalle
    const TRANS = 0.62;               // 62 % de transition, 38 % de pause

    let courant = -1;

    function afficher(i) {
      if (i === courant) return;
      courant = i;
      metas.forEach((m, k) => gsap.to(m, { autoAlpha: k === i ? 1 : 0, duration: 0.35, ease: 'none' }));
      noms.forEach((n, k) => gsap.to(n, { autoAlpha: k === i ? 1 : 0, duration: 0.45, ease: 'none' }));
      puces.forEach((b, k) => b.classList.toggle('is-on', k === i));
    }

    // État de départ lisible même si le scroll ne démarre jamais.
    gsap.set(metas.slice(1), { autoAlpha: 0 });
    gsap.set(noms.slice(1), { autoAlpha: 0 });
    afficher(0);

    if (SNTM.reduced) return;

    const st = ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: () => '+=' + Math.min(Math.max(window.innerHeight * (N - 1) * 0.62, 1400), 3200),
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress;
        let actif = 0;
        let frontal = -1;

        for (let k = 1; k < N; k++) {
          const debut = (k - 1) * SEG;
          const r = gsap.utils.clamp(0, 1, (p - debut) / (SEG * TRANS));
          imgs[k].style.setProperty('--reveal', (r * 100).toFixed(2));
          if (r >= 0.5) actif = k;
          if (r > 0.001 && r < 0.999) frontal = r;
        }

        // Le filet rouge n'existe que pendant une substitution.
        stage.style.setProperty('--edge', ((frontal < 0 ? 0 : frontal) * 100).toFixed(2));
        stage.style.setProperty('--edgeon', frontal < 0 ? 0 : 1);

        afficher(actif);
      }
    });

    // Le rail emmène directement à la matière voulue.
    puces.forEach(function (b, i) {
      b.addEventListener('click', function () {
        const cible = st.start + (st.end - st.start) * (i * SEG + SEG * TRANS * 0.85);
        window.scrollTo({ top: i === 0 ? st.start + 2 : cible, behavior: 'smooth' });
      });
    });
  })();

  /* ========================================================
     3. AVANT / APRÈS
     La mecanique vit dans global.js : elle sert aussi aux
     pages interieures.
     ======================================================== */

  SNTM.initCompare(document.getElementById('baStage'));

})();
