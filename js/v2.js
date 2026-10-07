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
      if (el.closest('.camion__reel')) return; // tirages photo de l'À propos : pas de découpe
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


  /* ========================================================
     9. SECTIONS SIGNATURE : une par page, inspirées de 21st
     (réécrites en GSAP et CSS, dans l'identité SNTM). Chaque
     bloc ne s'active que si sa section existe sur la page.
     ======================================================== */

  plusTard(function signatures() {
    if (SNTM.reduced) return;
    const large = window.matchMedia('(min-width: 1000px)').matches;
    const moyen = window.matchMedia('(min-width: 760px)').matches;
    const vu = (el, cb, start) => ScrollTrigger.create({ trigger: el, start: start || 'top 72%', once: true, onEnter: cb });

    // 9.1 Accueil, « Sur le terrain » (Portfolio Scroll Grid) : le mot SNTM
    // reste fixé en CSS, les trois photos glissent à des vitesses différentes.
    const terrain = document.querySelector('section.terrain .terrain__grid');
    if (terrain && moyen) {
      terrain.querySelectorAll('.terrain__card').forEach((c, k) => {
        const v = [8, -14, 4][k % 3];
        gsap.fromTo(c, { yPercent: v }, { yPercent: -v, ease: 'none',
          scrollTrigger: { trigger: terrain, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }

    // 9.2 À propos, « Vous nous verrez arriver » : les trois photos sont
    // des tirages posés sur la table. Empilés au départ, ils s'écartent en
    // éventail pendant qu'on descend. Format moyen, photo entière.
    const reel = document.querySelector('.camion__reel');
    if (reel && moyen) {
      const cartes = reel.querySelectorAll('.terrain__card');
      const pile = [[36, -1, 26], [0, 2, 0], [-34, 3, 18]];
      const eventail = [[0, -5, 0], [0, 1.5, -26], [0, 4, 14]];
      cartes.forEach((c, k) => {
        const [x0, r0, y0] = pile[k % 3], [x1, r1, y1] = eventail[k % 3];
        gsap.fromTo(c, { xPercent: x0, rotate: r0, y: y0 }, { xPercent: x1, rotate: r1, y: y1, ease: 'none',
          scrollTrigger: { trigger: reel, start: 'top 88%', end: 'center 48%', scrub: 0.8 } });
      });
    }

    // 9.3 Nettoyage professionnel, le périmètre (Scroll Reveal Content) :
    // la ligne lue s'allume, un repère rouge suit la lecture.
    const peri = document.querySelector('.peri__table');
    if (peri) {
      peri.classList.add('v2-peri');
      peri.querySelectorAll('tbody tr').forEach((tr) => ScrollTrigger.create({
        trigger: tr, start: 'top 64%', end: 'bottom 64%', toggleClass: { targets: tr, className: 'is-on' } }));
    }

    // 9.4 Traitement des sols, les réflexes (Dual Wipe Reveal) : le mauvais
    // geste est barré en rouge, puis le bon geste se pose, coché.
    const ref = document.querySelector('.ref__table');
    if (ref) {
      ref.classList.add('v2-ref');
      ref.querySelectorAll('.ref__pair').forEach((p) => {
        const bad = p.querySelector('.ref__bad');
        if (bad) { const s = document.createElement('span'); s.className = 'ref__strike'; while (bad.firstChild) s.appendChild(bad.firstChild); bad.appendChild(s); }
        vu(p, () => p.classList.add('is-vu'), 'top 70%');
      });
    }

    // 9.5 Remise en état, les trois échéances (Scroll 01) : l'image reste
    // fixée et change à chaque échéance lue.
    const mom = document.querySelector('.mom__grid');
    if (mom && large) {
      const items = Array.from(mom.querySelectorAll('.mom__item'));
      const scene = document.createElement('div');
      scene.className = 'swap__stage';
      scene.setAttribute('aria-hidden', 'true');
      items.forEach((it, k) => {
        const pic = it.querySelector('.mom__img picture');
        if (!pic) return;
        const c = pic.cloneNode(true);
        c.classList.add('swap__img');
        if (k === 0) c.classList.add('is-on');
        c.querySelectorAll('source').forEach((s) => s.setAttribute('sizes', '45vw'));
        c.querySelector('img').alt = '';
        scene.appendChild(c);
      });
      mom.prepend(scene);
      mom.classList.add('v2-swap');
      items[0] && items[0].classList.add('is-on');
      const imgs = scene.querySelectorAll('.swap__img');
      items.forEach((it, k) => ScrollTrigger.create({ trigger: it, start: 'top 58%', end: 'bottom 58%',
        onToggle: (s) => { if (!s.isActive) return;
          imgs.forEach((im, j) => im.classList.toggle('is-on', j === k));
          items.forEach((x, j) => x.classList.toggle('is-on', j === k)); } }));
    }

    // 9.6 Locaux commerciaux, les créneaux : une journée qui avance, le fil
    // rouge progresse et chaque créneau s'allume à son tour.
    const cren = document.querySelector('.cren__grid');
    if (cren) {
      const its = Array.from(cren.querySelectorAll('.cren__item'));
      cren.classList.add('v2-rail');
      ScrollTrigger.create({ trigger: cren, start: 'top 72%', end: 'bottom 50%', scrub: true,
        onUpdate: (s) => {
          cren.style.setProperty('--p', s.progress.toFixed(3));
          const n = Math.min(its.length, Math.floor(s.progress * its.length + 0.25));
          its.forEach((x, k) => x.classList.toggle('is-on', k < n));
        } });
    }

    // 9.7 Écoles, les six zones (Spotlight Card) : un halo suit la souris.
    const zon = document.querySelector('.zon__grid');
    if (zon && fin) {
      zon.classList.add('v2-spot');
      zon.querySelectorAll('.zon__item').forEach((it) => it.addEventListener('pointermove', (e) => {
        const r = it.getBoundingClientRect();
        it.style.setProperty('--sx', (e.clientX - r.left) + 'px');
        it.style.setProperty('--sy', (e.clientY - r.top) + 'px');
      }));
    }

    // 9.8 Réalisations, « Savoir regarder » (balayage éditorial) : un bloc
    // rouge traverse chaque titre et le découvre.
    document.querySelectorAll('.lire__list li').forEach((li, k) => {
      const h = li.querySelector('h3');
      if (!h) return;
      const s = document.createElement('span'); s.className = 'wipe';
      const t = document.createElement('span'); t.className = 'wipe__t';
      while (h.firstChild) t.appendChild(h.firstChild);
      s.appendChild(t); h.appendChild(s);
      li.style.setProperty('--d', (k * 0.12) + 's');
      vu(li, () => li.classList.add('is-vu'), 'top 80%');
    });

    // 9.9 Zones d'intervention : le losange se dessine, puis les communes
    // se découvrent une à une par le même balayage.
    document.querySelectorAll('.zone__field').forEach((field) => {
      field.classList.add('v2-zone');
      field.querySelectorAll('.zone__name').forEach((n, k) => {
        const s = document.createElement('span'); s.className = 'wipe';
        const t = document.createElement('span'); t.className = 'wipe__t';
        while (n.firstChild) t.appendChild(n.firstChild);
        s.appendChild(t); n.appendChild(s);
        n.style.setProperty('--d', (0.35 + k * 0.09) + 's');
      });
      vu(field, () => field.classList.add('is-vu'), 'top 75%');
    });
  });

})();
