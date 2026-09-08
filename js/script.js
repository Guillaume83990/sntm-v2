'use strict';
document.addEventListener('DOMContentLoaded', () => {
    initPageTransition();
    initCursor();
    initNav();
    initHeroSlider();
    initReveal();
    initCounters();
    initMagneticButtons();
    initParallax();
    initSmoothScroll();
    initGallery();
    initContactForm();
    initScrollTop();
    initLangSwitcher();
    initTextSplit();
    initHoverTilt();
    if (!document.querySelector('.hero')) {
        document.getElementById('nav')?.classList.add('solid');
    }
});
function initPageTransition() {
    if (!document.getElementById('pt-overlay')) {
        const el = document.createElement('div');
        el.id = 'pt-overlay';
        el.style.cssText = [
            'position:fixed', 'inset:0', 'background:#111',
            'z-index:9000', 'pointer-events:none',
            'transition:opacity 0.5s ease',
            'opacity:1'
        ].join(';');
        document.body.appendChild(el);
    }
    const overlay = document.getElementById('pt-overlay');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 600);
        });
    });
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto') ||
            href.startsWith('tel') || a.target === '_blank') return;
        e.preventDefault();
        const newOverlay = document.createElement('div');
        newOverlay.style.cssText = [
            'position:fixed', 'inset:0', 'background:#111',
            'z-index:9000', 'pointer-events:none',
            'opacity:0', 'transition:opacity 0.35s ease'
        ].join(';');
        document.body.appendChild(newOverlay);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                newOverlay.style.opacity = '1';
                setTimeout(() => { window.location.href = href; }, 380);
            });
        });
    });
}
function initCursor() {
    if (window.matchMedia('(hover: none)').matches) return;
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    let tx = 0, ty = 0;
    let rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
        tx = e.clientX; ty = e.clientY;
        dot.style.left = tx + 'px';
        dot.style.top = ty + 'px';
    }, { passive: true });
    let rafId;
    function loopRing() {
        rx += (tx - rx) * 0.14;
        ry += (ty - ry) * 0.14;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        rafId = requestAnimationFrame(loopRing);
    }
    loopRing();
    const targets = 'a, button, .hs-card, .sol-card, .gallery-item, .review-card, .service-block, .city-chip, .sol-matiere, .chiffre-card, .gallery-filter, .btn';
    document.querySelectorAll(targets).forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovering'), { passive: true });
        el.addEventListener('mouseleave', () => ring.classList.remove('hovering'), { passive: true });
    });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '0.4'; });
}
function initNav() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    if (!nav) return;
    const hasHero = !!document.querySelector('.hero');
    let lastY = 0, ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            nav.classList.toggle('solid', y > 60 || !hasHero);
            nav.classList.toggle('hidden', y > lastY && y > 380);
            lastY = y;
            updateActiveLink();
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    const closeMenu = () => {
        menu?.classList.remove('open');
        overlay?.classList.remove('show');
        burger?.classList.remove('open');
        burger?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };
    burger?.addEventListener('click', () => {
        const open = menu?.classList.toggle('open');
        overlay?.classList.toggle('show', open);
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    });
    overlay?.addEventListener('click', closeMenu);
    menu?.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}
function updateActiveLink() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link[href]').forEach(l => {
        const href = l.getAttribute('href').split('#')[0];
        l.classList.toggle('active', href === page && !l.classList.contains('nav-cta'));
    });
}
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length < 2) return;
    let cur = 0;
    if (!document.getElementById('kb-style')) {
        const s = document.createElement('style');
        s.id = 'kb-style';
        s.textContent = `
.hero-slide.active { animation: kenBurns 6s ease-out forwards; }
@keyframes kenBurns {
0% { transform: scale(1.08) translateX(0px); }
100% { transform: scale(1) translateX(-8px); }
}
`;
        document.head.appendChild(s);
    }
    function nextSlide() {
        slides[cur].classList.remove('active');
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add('active');
    }
    setInterval(nextSlide, 5500);
}
function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('visible'));
        return;
    }
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            en.target.classList.add('visible');
            obs.unobserve(en.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => obs.observe(el));
    document.querySelectorAll('.home-services-grid, .reviews-grid, .sols-grid, .services-extra-grid, .about-values-grid, .chiffres-grid').forEach(grid => {
        const children = grid.querySelectorAll(':scope > *');
        children.forEach((child, i) => {
            if (!child.hasAttribute('data-reveal')) {
                child.setAttribute('data-reveal', '');
                child.style.transitionDelay = (i * 0.08) + 's';
                obs.observe(child);
            }
        });
    });
}
function initCounters() {
    const counters = document.querySelectorAll('.stat-num[data-target], .chiffre-num[data-target]');
    if (!counters.length) return;
    let triggered = false;
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function runCounters() {
        if (triggered) return;
        triggered = true;
        counters.forEach(el => {
            const target = parseInt(el.dataset.target, 10);
            if (isNaN(target)) return;
            const suffix = el.dataset.suffix || '';
            const duration = 2200;
            const start = performance.now();
            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const value = Math.floor(easeOutCubic(progress) * target);
                el.textContent = value + suffix;
                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target + suffix;
                }
            }
            requestAnimationFrame(tick);
        });
    }
    const container = counters[0].closest('section, .home-about-stats, .about-chiffres');
    if (container) {
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { runCounters(); io.disconnect(); }
        }, { threshold: 0.25 });
        io.observe(container);
    }
    const fallback = () => {
        if (triggered) return;
        const r = (container || counters[0]).getBoundingClientRect();
        if (r.top < window.innerHeight * 0.85) { runCounters(); }
    };
    window.addEventListener('scroll', fallback, { passive: true });
}
function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.btn').forEach(btn => {
        btn.style.willChange = 'transform';
        btn.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease, background 0.25s ease, border-color 0.25s ease';
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * 0.22;
            const dy = (e.clientY - cy) * 0.22;
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
        }, { passive: true });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });
}
function initParallax() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    const aboutImg = document.querySelector('.ha-img-1 img, .as-img-main img');
    if (!heroSlides.length && !aboutImg) return;
    heroSlides.forEach(s => { s.style.willChange = 'transform'; });
    if (aboutImg) aboutImg.style.willChange = 'transform';
    let raf = null;
    let lastScroll = -1;
    function applyParallax() {
        const sy = window.scrollY;
        if (sy === lastScroll) { raf = requestAnimationFrame(applyParallax); return; }
        lastScroll = sy;
        if (sy < window.innerHeight * 1.2) {
            const offset = sy * 0.25;
            heroSlides.forEach(s => {
                s.style.transform = `translateY(${offset}px) scale(1.05)`;
            });
        }
        if (aboutImg) {
            const section = aboutImg.closest('section');
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                    const shift = (progress - 0.5) * 40;
                    aboutImg.style.transform = `translateY(${shift}px) scale(1.06)`;
                }
            }
        }
        raf = requestAnimationFrame(applyParallax);
    }
    window.addEventListener('scroll', () => {
        if (!raf) raf = requestAnimationFrame(applyParallax);
    }, { passive: true });
}
function initTextSplit() {
    const targets = document.querySelectorAll('.page-hero h1, .hero-title');
    targets.forEach(el => {
        const children = Array.from(el.childNodes);
        el.innerHTML = '';
        children.forEach((node, ni) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const words = node.textContent.trim().split(/\s+/).filter(Boolean);
                words.forEach((word, wi) => {
                    const span = document.createElement('span');
                    span.className = 'split-word';
                    span.textContent = word + (wi < words.length - 1 ? '\u00a0' : '');
                    span.style.cssText = [
                        'display:inline-block',
                        'opacity:0',
                        'transform:translateY(24px)',
                        `transition:opacity 0.55s ease ${(ni * 3 + wi) * 0.07}s, transform 0.55s ease ${(ni * 3 + wi) * 0.07}s`
                    ].join(';');
                    el.appendChild(span);
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.tagName.toLowerCase();
                const wrapper = document.createElement(tag);
                wrapper.className = node.className;
                const words = node.textContent.trim().split(/\s+/).filter(Boolean);
                words.forEach((word, wi) => {
                    const span = document.createElement('span');
                    span.className = 'split-word';
                    span.textContent = word + (wi < words.length - 1 ? '\u00a0' : '');
                    span.style.cssText = [
                        'display:inline-block',
                        'opacity:0',
                        'transform:translateY(24px)',
                        `transition:opacity 0.55s ease ${(ni * 3 + wi) * 0.07 + 0.15}s, transform 0.55s ease ${(ni * 3 + wi) * 0.07 + 0.15}s`
                    ].join(';');
                    wrapper.appendChild(span);
                });
                el.appendChild(wrapper);
            }
        });
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.querySelectorAll('.split-word').forEach(w => {
                    w.style.opacity = '1';
                    w.style.transform = 'translateY(0)';
                });
            });
        });
    });
}
function initHoverTilt() {
    if (window.matchMedia('(hover: none)').matches) return;
    const tiltables = document.querySelectorAll('.hs-card, .review-card, .sol-card, .se-card, .av-card, .chiffre-card');
    tiltables.forEach(el => {
        el.style.willChange = 'transform';
        el.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const rx = y * -6;
            const ry = x * 6;
            el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
        }, { passive: true });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
}
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#' || id === '#!') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '80');
            window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
        });
    });
}
function initGallery() {
    const filters = document.querySelectorAll('.gallery-filter');
    const items = document.querySelectorAll('.gallery-item[data-cat]');
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const f = btn.dataset.filter;
            items.forEach((item, i) => {
                const show = f === 'all' || item.dataset.cat === f;
                item.style.transition = `opacity 0.35s ease ${i * 0.04}s, transform 0.35s ease ${i * 0.04}s`;
                if (show) {
                    item.style.display = '';
                    requestAnimationFrame(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; });
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.92)';
                    setTimeout(() => { if (item.style.opacity === '0') item.style.display = 'none'; }, 380);
                }
            });
        });
    });
    const imgs = Array.from(document.querySelectorAll('.gallery-item img'));
    imgs.forEach((img, i) => {
        const parent = img.closest('.gallery-item');
        if (parent) parent.addEventListener('click', () => openLightbox(i, imgs));
    });
}
function openLightbox(idx, imgs) {
    let cur = idx;
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.style.cssText = [
        'position:fixed', 'inset:0', 'background:rgba(11,11,11,0.97)',
        'z-index:8000', 'display:flex', 'align-items:center', 'justify-content:center',
        'opacity:0', 'transition:opacity 0.3s ease'
    ].join(';');
    function render() {
        lb.innerHTML = `
<button class="lb-x" aria-label="Fermer" style="position:absolute;top:1.5rem;right:1.5rem;width:44px;height:44px;border:2px solid rgba(255,255,255,0.25);border-radius:4px;color:#fff;font-size:1.6rem;display:flex;align-items:center;justify-content:center;background:none;transition:border-color 0.2s,background 0.2s">✕</button>
<button class="lb-prev" aria-label="Précédent" style="position:absolute;left:1.5rem;top:50%;transform:translateY(-50%);width:48px;height:48px;border:2px solid rgba(255,255,255,0.2);border-radius:4px;color:#fff;font-size:1.5rem;display:flex;align-items:center;justify-content:center;background:none;transition:border-color 0.2s,background 0.2s">‹</button>
<div style="text-align:center;padding:2rem;max-width:92vw">
<img src="${imgs[cur].src}" alt="${imgs[cur].alt}" style="max-width:88vw;max-height:80vh;object-fit:contain;border-radius:4px;box-shadow:0 24px 80px rgba(0,0,0,0.7);animation:lbZoom 0.35s cubic-bezier(0.34,1.56,0.64,1) both">
<p style="color:rgba(255,255,255,0.45);font-size:0.78rem;margin-top:0.8rem;letter-spacing:0.1em;text-transform:uppercase">${imgs[cur].alt}</p>
<p style="color:rgba(255,255,255,0.2);font-size:0.7rem;margin-top:0.3rem">${cur + 1} / ${imgs.length}</p>
</div>
<button class="lb-next" aria-label="Suivant" style="position:absolute;right:1.5rem;top:50%;transform:translateY(-50%);width:48px;height:48px;border:2px solid rgba(255,255,255,0.2);border-radius:4px;color:#fff;font-size:1.5rem;display:flex;align-items:center;justify-content:center;background:none;transition:border-color 0.2s,background 0.2s">›</button>
`;
    }
    if (!document.getElementById('lb-css')) {
        const s = document.createElement('style'); s.id = 'lb-css';
        s.textContent = `
@keyframes lbZoom { from { opacity:0; transform:scale(0.88); } to { opacity:1; transform:scale(1); } }
#lightbox .lb-x:hover, #lightbox .lb-prev:hover, #lightbox .lb-next:hover {
border-color: #e60012 !important; background: rgba(230,0,18,0.15) !important;
}
`;
        document.head.appendChild(s);
    }
    render();
    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => { requestAnimationFrame(() => { lb.style.opacity = '1'; }); });
    const close = () => {
        lb.style.opacity = '0';
        setTimeout(() => { lb.remove(); document.body.style.overflow = ''; }, 320);
    };
    lb.addEventListener('click', e => {
        const t = e.target;
        if (t === lb || t.classList.contains('lb-x')) { close(); return; }
        if (t.classList.contains('lb-prev')) { cur = (cur - 1 + imgs.length) % imgs.length; render(); }
        if (t.classList.contains('lb-next')) { cur = (cur + 1) % imgs.length; render(); }
    });
    let touchX = 0;
    lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) {
            cur = dx < 0 ? (cur + 1) % imgs.length : (cur - 1 + imgs.length) % imgs.length;
            render();
        }
    });
    const kb = e => {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', kb); }
        if (e.key === 'ArrowLeft') { cur = (cur - 1 + imgs.length) % imgs.length; render(); }
        if (e.key === 'ArrowRight') { cur = (cur + 1) % imgs.length; render(); }
    };
    document.addEventListener('keydown', kb);
}
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(f => {
        f.addEventListener('blur', () => validateField(f));
        f.addEventListener('input', () => { if (f.dataset.touched) validateField(f); });
        f.addEventListener('blur', () => { f.dataset.touched = '1'; }, { once: true });
    });
    form.addEventListener('submit', async e => {
        e.preventDefault();
        let ok = true;
        form.querySelectorAll('input[required], select[required], textarea[required]').forEach(f => {
            f.dataset.touched = '1';
            if (!validateField(f)) ok = false;
        });
        if (!ok) {
            form.style.animation = 'formShake 0.4s ease';
            setTimeout(() => { form.style.animation = ''; }, 400);
            return;
        }
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px">Envoi… <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 0.8s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></span>';
        btn.disabled = true;
        if (!document.getElementById('spin-css')) {
            const s = document.createElement('style'); s.id = 'spin-css';
            s.textContent = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes formShake {
0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)}
40%{transform:translateX(8px)} 60%{transform:translateX(-5px)}
80%{transform:translateX(5px)}
}
`;
            document.head.appendChild(s);
        }
        const data = Object.fromEntries(new FormData(form));
        console.log('📩 Formulaire SNTM SAP:', data);
        await new Promise(r => setTimeout(r, 1600));
        showToast('✓ Message envoyé ! Nous vous répondons sous 24h.', 'success');
        form.reset();
        btn.innerHTML = orig;
        btn.disabled = false;
    });
}
function validateField(f) {
    const v = f.value.trim();
    let ok = true;
    if (f.required && !v) ok = false;
    if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok = false;
    if (f.type === 'tel' && v && !/^[\d\s+\-()\u00a0]{9,}$/.test(v)) ok = false;
    f.style.borderColor = ok ? (v ? 'rgba(230,0,18,0.5)' : '#e0e0e0') : '#ef4444';
    if (!ok) f.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
    else f.style.boxShadow = v ? '0 0 0 3px rgba(230,0,18,0.1)' : 'none';
    return ok;
}
function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast show ${type}`;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 5500);
}
function initScrollTop() {
    const btn = document.getElementById('scrollTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
function initLangSwitcher() {
    const btns = document.querySelectorAll('.lang-btn');
    const match = document.cookie.match(/googtrans=\/[a-z]{2}\/([a-z]{2})/);
    if (match && match[1] === 'en') {
        btns.forEach(b => b.classList.toggle('active', b.dataset.lang === 'en'));
    }
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const val = btn.dataset.lang === 'en' ? '/fr/en' : '/fr/fr';
            const exp = new Date(Date.now() + 365 * 864e5).toUTCString();
            document.cookie = `googtrans=${val};expires=${exp};path=/`;
            document.cookie = `googtrans=${val};expires=${exp};domain=.${location.hostname};path=/`;
            location.reload();
        });
    });
}
console.log(
    '%c🧹 SNTM SAP\n%cNettoyage Professionnel · Saint-Tropez\n%cSite par SudWeb Project — sudwebproject.com',
    'color:#e60012;font-family:serif;font-size:1.8rem;font-weight:bold;letter-spacing:.1em',
    'color:#888;font-size:.9rem',
    'color:#e60012;font-size:.8rem;font-weight:600'
);