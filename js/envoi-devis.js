/* ============================================================
   SNTM SAP — envoi-devis.js
   Envoie la demande de devis une fois que contact.js l'a
   validée (il bloque l'envoi tant qu'une étape est incomplète).

   Deux modes :
   1. EmailJS, dès que les trois clés ci-dessous sont remplies
      (compte EmailJS de SNTM, voir le README de V2) ;
   2. en attendant, ouverture d'un e-mail pré-rempli vers
      sntm@hotmail.fr : aucune demande n'est perdue.

   Les clés EmailJS sont publiques par conception (elles sont
   faites pour être dans le navigateur) : limiter les envois et
   activer la protection anti-spam dans le tableau de bord.
   ============================================================ */

(function () {
  'use strict';

  const EMAILJS = {
    publicKey: '',   // à remplir : Account > General > Public key
    serviceId: '',   // à remplir : Email Services > Service ID
    templateId: ''   // à remplir : Email Templates > Template ID
  };
  const DESTINATAIRE = 'sntm@hotmail.fr';

  const form = document.getElementById('devis');
  if (!form) return;
  const EN = document.documentElement.lang === 'en';
  const err = document.getElementById('formError');
  const bouton = form.querySelector('[type="submit"]');
  const ouverture = Date.now();

  // Messages du module de validation SWP en anglais sur la page anglaise.
  if (EN && window.SWPValidation) Object.assign(window.SWPValidation.messages, {
    requis: 'Please fill in this field.', requisChoix: 'Please choose an option from the list.',
    email: 'This address looks incomplete (example: name@domain.com).',
    tel: 'Please enter a 10-digit number, or an international one (+33…).',
    min: 'A few more words will help us reply ({n} characters minimum).',
    max: 'This text is a little long ({n} characters maximum).', suggestion: 'Did you mean ',
    resume: (n) => (n > 1 ? n + ' fields need correcting.' : 'One field needs correcting.')
  });

  const TXT = EN ? {
    envoi: 'Sending…', ok: 'Thank you, your request has been sent. We will get back to you shortly.',
    mail: 'Your email app is opening with your request already written: you just need to send it. Nothing opened? Write to ' + DESTINATAIRE + ' or call +33 6 80 30 44 26.',
    echec: 'The request could not be sent. Please call +33 6 80 30 44 26 or write to ' + DESTINATAIRE + '.',
    sujet: 'Quote request from the website', photos: 'Photos: please attach them to this email.'
  } : {
    envoi: 'Envoi en cours…', ok: 'Merci, votre demande est bien partie. Nous revenons vers vous rapidement.',
    mail: 'Votre messagerie s’ouvre avec la demande déjà rédigée : il ne reste qu’à l’envoyer. Rien ne s’ouvre ? Écrivez à ' + DESTINATAIRE + ' ou appelez le 06 80 30 44 26.',
    echec: 'La demande n’a pas pu partir. Appelez le 06 80 30 44 26 ou écrivez à ' + DESTINATAIRE + '.',
    sujet: 'Demande de devis depuis le site', photos: 'Photos : merci de les joindre à ce mail.'
  };

  function message(texte, type) {
    if (!err) return;
    err.hidden = false;
    err.textContent = texte;
    err.dataset.etat = type || '';
  }

  function champs() {
    const data = new FormData(form);
    const lignes = [];
    let photos = false;
    data.forEach((v, k) => {
      if (k === 'bot-field') return;
      if (v instanceof File) { if (v.size) photos = true; return; }
      const t = String(v).trim();
      if (t) lignes.push(k + ' : ' + t);
    });
    if (photos) lignes.push(TXT.photos);
    return lignes;
  }

  // Charge EmailJS seulement au moment de l'envoi : la page reste légère.
  function chargerEmailJS() {
    if (window.emailjs) return Promise.resolve(window.emailjs);
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      s.async = true;
      s.onload = () => { window.emailjs.init({ publicKey: EMAILJS.publicKey }); ok(window.emailjs); };
      s.onerror = ko;
      document.head.appendChild(s);
    });
  }

  form.addEventListener('submit', function (e) {
    // contact.js a déjà bloqué l'envoi si une étape est incomplète.
    if (e.defaultPrevented) return;
    e.preventDefault();

    // contact.js a déplié toutes les étapes pour l'envoi : on revient sur la dernière.
    const etapes = Array.from(form.querySelectorAll('.form__step'));
    const derniere = etapes.reduce((a, b) => (+b.dataset.step > +a.dataset.step ? b : a), etapes[0]);
    etapes.forEach((st) => { st.hidden = st !== derniere; });

    // Anti-robots : champ piège rempli, ou envoi en moins de 3 secondes.
    const piege = form.querySelector('[name="bot-field"]');
    if ((piege && piege.value) || Date.now() - ouverture < 3000) { message(TXT.ok, 'ok'); form.reset(); return; }

    const lignes = champs();

    if (EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId) {
      if (bouton) { bouton.disabled = true; bouton.dataset.texte = bouton.textContent; bouton.textContent = TXT.envoi; }
      chargerEmailJS()
        .then((ejs) => ejs.send(EMAILJS.serviceId, EMAILJS.templateId, {
          sujet: TXT.sujet,
          demande: lignes.join('\n'),
          nom: (form.querySelector('[name="Nom"]') || {}).value || '',
          email: (form.querySelector('[name="E-mail"]') || {}).value || '',
          telephone: (form.querySelector('[name="Téléphone"]') || {}).value || ''
        }))
        .then(() => { message(TXT.ok, 'ok'); form.reset(); })
        .catch(() => message(TXT.echec, 'erreur'))
        .finally(() => { if (bouton) { bouton.disabled = false; bouton.textContent = bouton.dataset.texte; } });
      return;
    }

    // Repli sans service d'envoi : un e-mail pré-rempli.
    const lien = 'mailto:' + DESTINATAIRE +
      '?subject=' + encodeURIComponent(TXT.sujet) +
      '&body=' + encodeURIComponent(lignes.join('\n'));
    message(TXT.mail, 'ok');
    window.location.href = lien;
  });
})();
