/* ============================================================
   SNTM SAP — v2.js
   Montée en gamme V2 (octobre 2026). Chargé après global.js
   sur toutes les pages. Chaque bloc vérifie que ses éléments
   existent : une page sans la section ne paie rien.
   Mouvement réduit : rien ne bouge, tout reste lisible.
   ============================================================ */

(function () {
  'use strict';

  const SNTM = window.SNTM || { reduced: false, whenReady: (f) => f() };
  const EN = document.documentElement.lang === 'en';
  const fin = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Les animations sous la ligne de flottaison se préparent quand le
  // navigateur est libre : rien ne s'ajoute au démarrage de la page.
  const plusTard = (fn) => {
    const go = () => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 200));
    document.readyState === 'complete' ? go() : window.addEventListener('load', go, { once: true });
  };

  /* ========================================================
     1. DÉFILEMENT FLUIDE (Lenis), synchronisé avec GSAP
     ======================================================== */

  let lenis = null;
  if (!SNTM.reduced && window.Lenis && fin) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    SNTM.lenis = lenis;

    // Le menu plein écran bloque le défilement : Lenis s'arrête avec lui.
    const menu = document.getElementById('menu');
    if (menu) {
      new MutationObserver(() => {
        const ouvert = !menu.hidden;
        document.documentElement.classList.toggle('menu-open', ouvert);
        ouvert ? lenis.stop() : lenis.start();
      }).observe(menu, { attributes: true, attributeFilter: ['hidden'] });
    }

    // Ancres internes : défilement doux, compensé par le header.
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      const cible = document.querySelector(a.getAttribute('href'));
      if (!cible) return;
      e.preventDefault();
      lenis.scrollTo(cible, { offset: -80 });
    });
  }

  /* ========================================================
     2. TRANSITION ENTRE LES PAGES : le voile à 28°
     ======================================================== */

  (function transitions() {
    if (SNTM.reduced) return;
    const veil = document.createElement('div');
    veil.className = 'veil';
    veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML = '<span class="veil__edge"></span>';
    document.body.appendChild(veil);

    const PLEIN = 'polygon(0 0,100% 0,100% 100%,0 100%)';
    const ENTREE = 'polygon(100% 0,100% 0,100% 100%,100% 100%)';
    const SORTIE = 'polygon(0 0,0 0,0 100%,0 100%)';
    let marque = null;
    try { marque = window.sessionStorage.getItem('sntm-veil'); } catch (e) { marque = null; }

    // Arrivée : si on vient d'une page du site, le voile se retire.
    if (marque) {
      try { sessionStorage.removeItem('sntm-veil'); } catch (e) {}
      gsap.set(veil, { clipPath: PLEIN });
      gsap.to(veil, { clipPath: SORTIE, duration: 0.85, ease: 'power3.inOut', delay: 0.05 });
    }

    // Retour arrière (cache du navigateur) : jamais d'écran noir.
    window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(veil, { clipPath: ENTREE }); });

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (!/\.html?$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      try { sessionStorage.setItem('sntm-veil', '1'); } catch (err) {}
      gsap.set(veil, { clipPath: ENTREE });
      gsap.to(veil, {
        clipPath: PLEIN, duration: 0.6, ease: 'power3.inOut',
        onComplete: () => { location.href = url.href; }
      });
    });
  })();

  /* ========================================================
     3. BOUTON APPELER (mobile)
     Apparaît une fois le hero passé, disparaît sur le
     formulaire de contact (il y a déjà tout à l'écran).
     ======================================================== */

  (function callbar() {
    if (document.querySelector('form[name]') && /contact/.test(location.pathname)) return;
    const bar = document.createElement('div');
    bar.className = 'callbar';
    // Contenu fixe, écrit ici : aucune donnée extérieure n'y entre.
    bar.innerHTML =
      '<a class="callbar__tel" href="tel:+33680304426"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>' + (EN ? 'Call' : 'Appeler') + '</a>' +
      '<a class="callbar__devis" href="contact.html">' + (EN ? 'Get a quote' : 'Devis') + '</a>';
    document.body.appendChild(bar);
    const seuil = () => Math.min(window.innerHeight * 0.6, 520);
    const maj = () => bar.classList.toggle('is-on', window.scrollY > seuil());
    window.addEventListener('scroll', maj, { passive: true });
    maj();
  })();

  /* ========================================================
     4. MANIFESTE LU AU DÉFILEMENT
     Chaque mot passe du clair au noir au rythme du scroll.
     Le texte reste un seul paragraphe pour les lecteurs
     d'écran et pour Google.
     ======================================================== */

  plusTard(function scrubWords() {
    document.querySelectorAll('.scrub-words').forEach((el) => {
      if (SNTM.reduced) return;
      const mots0 = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      mots0.forEach((w, k) => {
        const s = document.createElement('span');
        s.className = 'sw';
        s.textContent = w;
        el.appendChild(s);
        if (k < mots0.length - 1) el.appendChild(document.createTextNode(' '));
      });
      document.documentElement.classList.add('js-scrub');
      const mots = el.querySelectorAll('.sw');
      gsap.fromTo(mots, { color: '#6E7175' }, {
        color: '#1A1B1D', ease: 'none', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: 0.4 }
      });
    });
  });

  /* ========================================================
     5. REPÈRES CHIFFRÉS : comptés une seule fois
     ======================================================== */

  plusTard(function reperes() {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const fin = parseInt(el.dataset.count, 10);
      const depuis = parseInt(el.dataset.from || '0', 10);
      if (SNTM.reduced || isNaN(fin)) { el.textContent = fin; return; }
      const o = { v: depuis };
      el.textContent = depuis;
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(o, {
          v: fin, duration: 1.6, ease: 'power3.out',
          onUpdate: () => { el.textContent = Math.round(o.v); }
        })
      });
    });
  });

  /* ========================================================
     7. LUMIÈRE RASANTE sur les matériaux
     C'est ainsi qu'un spécialiste lit un sol : une lampe
     posée au ras de la surface révèle rayures et voiles.
     ======================================================== */

  (function raking() {
    const stage = document.getElementById('matsStage');
    if (!stage || !fin || SNTM.reduced) return;
    const light = document.createElement('span');
    light.className = 'raking';
    light.setAttribute('aria-hidden', 'true');
    stage.appendChild(light);

    let raf = 0, px = 50, py = 50;
    stage.addEventListener('pointerenter', () => stage.classList.add('is-raking'));
    stage.addEventListener('pointerleave', () => stage.classList.remove('is-raking'));
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 100;
      py = ((e.clientY - r.top) / r.height) * 100;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        light.style.setProperty('--rx', px.toFixed(1) + '%');
        light.style.setProperty('--ry', py.toFixed(1) + '%');
      });
    });
  })();

  /* ========================================================
     8. CHANTIER RÉEL et TERRAIN : entrée par la diagonale,
     léger décalage de parallaxe entre les deux photos
     ======================================================== */

  plusTard(function chantier() {
    if (SNTM.reduced) return;
    document.querySelectorAll('.chantier__media, .terrain__media').forEach((el, k) => {
      gsap.set(el, { clipPath: 'polygon(0 100%, 0 100%, 0 100%, 0 100%)' });
      ScrollTrigger.create({
        trigger: el, start: 'top 86%', once: true,
        onEnter: () => gsap.to(el, {
          clipPath: el.classList.contains('terrain__media')
            ? 'polygon(0 0,100% 0,100% 88%,88% 100%,0 100%)'
            : 'polygon(0 0,100% 0,100% 100%,0 100%)',
          duration: 1.2, ease: 'power3.inOut', delay: (k % 3) * 0.12
        })
      });
    });
    // Accueil : les deux photos du chantier glissent à des vitesses
    // différentes, la vue « pendant » passe devant la vue « après ».
    const scene = document.querySelector('section.chantier .chantier__stage');
    if (scene) {
      const apres = scene.querySelector('.chantier__fig--apres img');
      const pendant = scene.querySelector('.chantier__fig--pendant');
      const st = { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: true };
      if (apres) gsap.fromTo(apres, { yPercent: -5, scale: 1.1 }, { yPercent: 5, scale: 1.1, ease: 'none', scrollTrigger: st });
      if (pendant && window.matchMedia('(min-width: 760px)').matches) {
        gsap.fromTo(pendant, { yPercent: 14 }, { yPercent: -10, ease: 'none', scrollTrigger: { ...st } });
      }
    }
  });

})();
