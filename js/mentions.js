/* ══════════════════════════════════════════════════════════
   SNTM SAP — mentions.js
   Sidebar active tracking · Smooth scroll · Section highlight
══════════════════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initSidebarTracking();
    initSectionHighlight();
    initSmoothScrollMentions();
});

/* ─────────────────────────────────────────────────────────
   SIDEBAR — Active link au scroll
───────────────────────────────────────────────────────── */
function initSidebarTracking() {
    const sidebarLinks = document.querySelectorAll('.ml-sidebar-link');
    const sections = document.querySelectorAll('.ml-section[id]');
    if (!sidebarLinks.length || !sections.length) return;

    let ticking = false;

    function updateActive() {
        const scrollY = window.scrollY + 130;
        let current = '';

        sections.forEach(section => {
            if (section.offsetTop <= scrollY) {
                current = section.id;
            }
        });

        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            link.classList.toggle('active', href === current);
        });
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActive();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Init au chargement
    updateActive();
}

/* ─────────────────────────────────────────────────────────
   SECTION HIGHLIGHT — Bordure rouge quand active
───────────────────────────────────────────────────────── */
function initSectionHighlight() {
    const sections = document.querySelectorAll('.ml-section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('active', entry.isIntersecting);
        });
    }, {
        rootMargin: '-10% 0px -85% 0px',
        threshold: 0
    });

    sections.forEach(s => observer.observe(s));
}

/* ─────────────────────────────────────────────────────────
   SMOOTH SCROLL — Liens TOC hero + sidebar
───────────────────────────────────────────────────────── */
function initSmoothScrollMentions() {
    const links = document.querySelectorAll('.ml-toc-link, .ml-sidebar-link');

    links.forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const navH = 100;
            window.scrollTo({
                top: target.offsetTop - navH,
                behavior: 'smooth'
            });
        });
    });
}