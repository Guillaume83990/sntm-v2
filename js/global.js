/* ============================================================
   SNTM SAP — global.js
   GSAP, préloader, menu, header, mouvement réduit.
   Règle du projet : aucun élément n'est pré-masqué en CSS.
   Tout est posé par gsap.set() juste avant l'animation.
   ============================================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // Sur iOS et Android, l'apparition/disparition de la barre d'URL
  // change innerHeight et provoquerait un refresh en plein scroll,
  // donc un saut visible sur les sections epinglees.
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* --- État partagé, lu par index.js ---------------------- */
  const SNTM = window.SNTM = {
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ready: false,
    onReady: [],
    whenReady(fn) {
      this.ready ? fn() : this.onReady.push(fn);
    },
    _fire() {
      this.ready = true;
      this.onReady.forEach((fn) => fn());
      this.onReady.length = 0;
    }
  };

  /* --- Année du footer ------------------------------------ */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ========================================================
     1. DÉMARRAGE
     Pas de préloader : la page est utilisable à la première
     frame. Les animations d'entrée partent dès que le DOM
     est prêt, sans attendre le chargement des images.
     ======================================================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SNTM._fire(), { once: true });
  } else {
    SNTM._fire();
  }

  /* ========================================================
     2. MENU PLEIN ÉCRAN
     Entrée par la diagonale, focus piégé, scroll bloqué.
     ======================================================== */

  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const header = document.getElementById('siteHeader');

  if (burger && menu) {
    const links = menu.querySelectorAll('a, button');
    const items = menu.querySelectorAll('.menu__list li > a');
    const blocks = menu.querySelectorAll('.menu__aside > *');
    let open = false;
    let scrollY = 0;
    let tl = null;

    const CLOSED = 'polygon(0% 0%, 0% 0%, -45% 100%, 0% 100%)';
    const OPENED = 'polygon(0% 0%, 145% 0%, 100% 100%, 0% 100%)';

    function openMenu() {
      if (open) return;
      open = true;
      scrollY = window.scrollY;

      menu.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      header.classList.add('is-open');

      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('is-locked');

      gsap.set(menu, { clipPath: CLOSED });
      gsap.set(items, { yPercent: 115 });
      gsap.set(blocks, { autoAlpha: 0, y: 18 });

      if (tl) tl.kill();
      tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(menu, { clipPath: OPENED, duration: SNTM.reduced ? 0.01 : 0.52, ease: 'power3.inOut' })
        .to(items, { yPercent: 0, duration: SNTM.reduced ? 0.01 : 0.6, stagger: 0.06 }, '-=0.24')
        .to(blocks, { autoAlpha: 1, y: 0, duration: SNTM.reduced ? 0.01 : 0.5, stagger: 0.07 }, '-=0.36');

      links[0] && links[0].focus({ preventScroll: true });
    }

    function closeMenu() {
      if (!open) return;
      open = false;

      burger.setAttribute('aria-expanded', 'false');
      header.classList.remove('is-open');

      if (tl) tl.kill();
      tl = gsap.timeline({
        onComplete: () => {
          menu.hidden = true;
          document.body.classList.remove('is-locked');
          document.body.style.top = '';
          window.scrollTo(0, scrollY);
          burger.focus({ preventScroll: true });
        }
      });
      tl.to(blocks, { autoAlpha: 0, duration: SNTM.reduced ? 0.01 : 0.2 })
        .to(menu, { clipPath: CLOSED, duration: SNTM.reduced ? 0.01 : 0.38, ease: 'power3.inOut' }, '-=0.1');
    }

    burger.addEventListener('click', () => (open ? closeMenu() : openMenu()));

    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (!open) return;

      if (e.key === 'Escape') { closeMenu(); return; }

      // Piège à focus : on ne sort pas du menu à la tabulation.
      if (e.key === 'Tab') {
        const first = links[0];
        const last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ========================================================
     3. HEADER
     Trois etats : transparent sur le hero, barre pleine
     ensuite, retire quand on descend. Le logo ne peut plus
     se retrouver pose sur un texte.
     ======================================================== */

  if (header) {
    let last = window.scrollY;
    let ticking = false;

    function onScroll() {
      const y = window.scrollY;
      const seuil = Math.max(120, window.innerHeight * 0.7);

      header.classList.toggle('is-stuck', y > 80);

      // On ne masque jamais la barre pres du sommet, ni menu ouvert.
      const descend = y > last && y > seuil;
      const remonte = y < last - 4;

      if (menu && !menu.hidden) {
        header.classList.remove('is-hidden');
      } else if (descend) {
        header.classList.add('is-hidden');
      } else if (remonte || y <= seuil) {
        header.classList.remove('is-hidden');
      }

      last = y;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });

    onScroll();
  }

  /* ========================================================
     HERO DE PAGE INTÉRIEURE
     Meme entree sur les quatre pages : l'image se decouvre par
     la diagonale, le fil d'Ariane puis le titre se posent, et
     le sommaire arrive en dernier.
     ======================================================== */

  SNTM.initPageHero = function () {
    const media = document.getElementById('pheroMedia');
    if (!media || SNTM.reduced) return;

    const lines = document.querySelectorAll('.phero .line-mask > span');
    const crumb = document.querySelector('.phero .crumb');
    const index = document.querySelector('.phero__index');
    const img = media.querySelector('img');

    gsap.set(media, { clipPath: 'polygon(-50% 100%, -95% 0%, -45% 0%, 0% 100%)' });
    gsap.set(lines, { yPercent: 112 });
    gsap.set([crumb, index], { autoAlpha: 0, y: 12 });

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(media, {
        clipPath: 'polygon(-50% 100%, -95% 0%, 100% 0%, 100% 100%)',
        duration: 1.3, ease: 'power3.inOut'
      }, 0)
      .fromTo(img, { scale: 1.12 }, { scale: 1, duration: 2, ease: 'power2.out' }, 0)
      .to(crumb, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.4)
      .to(lines, { yPercent: 0, duration: 1, stagger: 0.08 }, 0.5)
      .to(index, { autoAlpha: 1, y: 0, duration: 0.8 }, 1);

    gsap.to(img, {
      yPercent: 9, ease: 'none',
      scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true }
    });
  };

  /* ========================================================
     COMPARATEUR AVANT / APRÈS
     Pointeur fin : le scroll pilote. Tactile : le doigt.
     L'apres se decouvre depuis la droite.
     ======================================================== */

  SNTM.initCompare = function (stage) {
    if (!stage) return;

    // Position de repos : la coupe est au milieu. Sans JavaScript,
    // c'est deja l'etat affiche par le CSS.
    if (SNTM.reduced) { stage.style.setProperty('--reveal', 50); return; }

    const mots = stage.querySelectorAll('.ba__word');
    const filets = stage.querySelectorAll('.ba__edge');

    stage.style.setProperty('--reveal', 0);
    gsap.set([mots, filets], { autoAlpha: 0 });

    ScrollTrigger.create({
      trigger: stage,
      start: 'top 82%',
      once: true,
      onEnter: function () {
        const etat = { v: 0 };
        gsap.timeline({ defaults: { ease: 'power3.inOut' } })
          .to(filets, { autoAlpha: 1, duration: 0.3, ease: 'none' }, 0)
          .to(etat, {
            v: 50, duration: 1.25,
            onUpdate: () => stage.style.setProperty('--reveal', etat.v.toFixed(2))
          }, 0)
          .to(mots, { autoAlpha: 1, duration: 0.6, ease: 'power2.out', stagger: 0.12 }, 0.85);
      }
    });
  };

  /* ========================================================
     HERO DE PAGE INTÉRIEURE
     Meme entree sur les quatre pages : l'image se decouvre par
     la diagonale, le fil d'Ariane puis le titre se posent, et
     le sommaire arrive en dernier.
     ======================================================== */

  SNTM.initPageHero = function () {
    const media = document.getElementById('pheroMedia');
    if (!media || SNTM.reduced) return;

    const lines = document.querySelectorAll('.phero .line-mask > span');
    const crumb = document.querySelector('.phero .crumb');
    const index = document.querySelector('.phero__index');
    const img = media.querySelector('img');

    gsap.set(media, { clipPath: 'polygon(-50% 100%, -95% 0%, -45% 0%, 0% 100%)' });
    gsap.set(lines, { yPercent: 112 });
    gsap.set([crumb, index], { autoAlpha: 0, y: 12 });

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(media, {
        clipPath: 'polygon(-50% 100%, -95% 0%, 100% 0%, 100% 100%)',
        duration: 1.3, ease: 'power3.inOut'
      }, 0)
      .fromTo(img, { scale: 1.12 }, { scale: 1, duration: 2, ease: 'power2.out' }, 0)
      .to(crumb, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.4)
      .to(lines, { yPercent: 0, duration: 1, stagger: 0.08 }, 0.5)
      .to(index, { autoAlpha: 1, y: 0, duration: 0.8 }, 1);

    gsap.to(img, {
      yPercent: 9, ease: 'none',
      scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true }
    });
  };

  /* ========================================================
     COMPARATEUR AVANT / APRÈS
     Pointeur fin : le scroll pilote. Tactile : le doigt.
     L'apres se decouvre depuis la droite.
     ======================================================== */

  SNTM.initCompare = function (stage) {
    if (!stage) return;
    const handle = stage.querySelector('.ba__handle');
    let value = 0;

    function setReveal(v) {
      value = Math.max(0, Math.min(100, v));
      stage.style.setProperty('--reveal', value);
      if (!handle) return;
      handle.setAttribute('aria-valuenow', Math.round(value));
      handle.setAttribute('aria-valuetext',
        value < 15 ? 'Sol avant intervention'
          : value > 85 ? 'Sol après intervention'
            : 'Comparaison en cours, ' + Math.round(value) + ' pour cent révélé');
    }

    setReveal(0);
    const mm = gsap.matchMedia();

    mm.add('(hover: hover) and (pointer: fine)', function () {
      if (SNTM.reduced) { setReveal(100); return; }
      const st = ScrollTrigger.create({
        trigger: stage,
        start: 'top 85%',
        end: 'bottom 62%',
        scrub: 0.6,
        onUpdate: (self) => setReveal(self.progress * 100)
      });
      return () => st.kill();
    });

    mm.add('(hover: none), (pointer: coarse)', function () {
      let dragging = false;

      function fromEvent(e) {
        const rect = stage.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        setReveal((1 - x / rect.width) * 100);
      }
      const down = (e) => { dragging = true; fromEvent(e); };
      const move = (e) => { if (dragging) fromEvent(e); };
      const up = () => { dragging = false; };

      stage.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);

      let played = false;
      const hint = ScrollTrigger.create({
        trigger: stage, start: 'top 65%',
        onEnter: () => {
          if (played || SNTM.reduced) return;
          played = true;
          gsap.fromTo({ v: 0 }, { v: 0 }, {
            v: 72, duration: 1.4, delay: 0.35, ease: 'power2.inOut',
            onUpdate() { setReveal(this.targets()[0].v); }
          });
        }
      });

      return () => {
        stage.removeEventListener('pointerdown', down);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        hint.kill();
      };
    });

    if (handle) {
      handle.addEventListener('keydown', function (e) {
        const step = e.shiftKey ? 10 : 4;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setReveal(value - step); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setReveal(value + step); }
        else if (e.key === 'Home') { e.preventDefault(); setReveal(0); }
        else if (e.key === 'End') { e.preventDefault(); setReveal(100); }
      });
    }
  };

  /* ========================================================
     4. RÉVÉLATIONS COMMUNES
     Appliquées à toutes les pages : .reveal et .reveal-img
     ======================================================== */

  SNTM.initReveals = function (scope) {
    const root = scope || document;

    // Les gros titres arrivent mot par mot, masques par le bas.
    // Le texte reste intact dans le DOM : on n'emballe que des mots.
    root.querySelectorAll('.section-title, .cta__title').forEach((el) => {
      if (SNTM.reduced || el.dataset.split === '1') return;
      el.dataset.split = '1';
      el.innerHTML = el.textContent.trim().split(/\s+/)
        .map((w) => '<span class="w"><i>' + w + '</i></span>')
        .join(' ');
      const mots = el.querySelectorAll('.w > i');
      gsap.set(mots, { yPercent: 118 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 86%',
        once: true,
        onEnter: () => gsap.to(mots, {
          yPercent: 0, duration: 0.95, ease: 'power3.out', stagger: 0.055
        })
      });
    });

    root.querySelectorAll('.reveal').forEach((el) => {
      if (SNTM.reduced) return;
      gsap.set(el, { y: 26, autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to(el, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' })
      });
    });

    // Les images arrivent par la diagonale, comme le préloader.
    root.querySelectorAll('.reveal-img').forEach((el) => {
      if (SNTM.reduced) return;
      gsap.set(el, { clipPath: 'polygon(-50% 100%, -95% 0%, -45% 0%, 0% 100%)' });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(el, {
          clipPath: 'polygon(-50% 100%, -95% 0%, 100% 0%, 100% 100%)',
          duration: 1.15,
          ease: 'power3.inOut'
        })
      });
    });
  };

  SNTM.whenReady(() => SNTM.initReveals(document));

  /* --- Recalcul après chargement des images ---------------- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
