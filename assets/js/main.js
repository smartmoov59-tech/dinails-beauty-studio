/* =========================================================
   DiNails Beauty Studio — scripts
   ========================================================= */

/* ---------------------------------------------------------
   1. CONFIGURATION DU SALON (à mettre à jour facilement)
   --------------------------------------------------------- */
const SALON = {
  nom: "DiNails Beauty Studio",
  // Numéro de Dina, au format international sans espaces, ex. "+33612345678".
  // Laisser vide tant qu'il n'est pas connu : les boutons SMS / Appeler restent masqués.
  telephone: "",
  instagram: "dinails.beauty_studio_",
  adresse: "240 avenue de la Libération, 54000 Nancy",
  // Jours d'ouverture (0 = dimanche … 6 = samedi) et horaires
  joursOuverts: [1, 2, 5, 6],
  ouverture: "09:00",
  fermeture: "19:00",
  pasCreneau: 30,          // minutes entre deux créneaux proposés
  dernierCreneau: "18:00", // dernier départ possible
  moisReservables: 3
};

/* GRILLE TARIFAIRE — reprise de la story Instagram « Tarifs » de Dina (relevée le 13/11/2026).
   prix en euros. « duree » (minutes, estimation) sert uniquement au fichier agenda (.ics).
   reservable: false = affiché dans la carte mais pas proposé seul à la réservation. */
const TARIFS = [
  {
    cat: "Beauté des mains", note: "Manucure russe comprise dans chaque prestation", items: [
      { id: "pose", nom: "Pose complète", prix: 65, duree: 150 },
      { id: "remplissage", nom: "Remplissage gel (acrygel)", prix: 50, duree: 120 },
      { id: "renfo", nom: "Renforcement d’ongles naturels", prix: 45, duree: 90 },
      { id: "depose-mains", nom: "Dépose (manucure russe comprise)", prix: 25, duree: 60 },
      { id: "russe", nom: "Manucure russe", prix: 20, duree: 45 },
      { id: "repa-in", nom: "Réparation d’ongle pendant les prestations", prix: 2, reservable: false },
      { id: "repa-out", nom: "Réparation d’ongles hors prestations", prix: 5, duree: 20 }
    ]
  },
  {
    cat: "Beauté des pieds", note: "Pédicure comprise dans chaque prestation", items: [
      { id: "pieds-semi", nom: "Pose de vernis semi-permanent", prix: 35, duree: 75 },
      { id: "pieds-depose-pose", nom: "Dépose et pose de vernis semi-permanent", prix: 40, duree: 90 },
      { id: "pieds-depose", nom: "Dépose (pédicure comprise)", prix: 25, duree: 60 },
      { id: "pedicure", nom: "Pédicure", prix: 20, duree: 45 },
      { id: "pieds-reconstruction", nom: "Reconstruction d’ongles", prix: 5, reservable: false },
      { id: "callus", nom: "Calluspeeling", prix: 50, duree: 60 },
      { id: "callus-vernis", nom: "Calluspeeling avec une pose de vernis permanent", prix: 60, duree: 90 }
    ]
  }
];
const SUPPLEMENTS = [
  { id: "babyboomer", nom: "Baby boomer", prix: 5, label: "5 €" },
  { id: "french", nom: "French", prix: 5, label: "5 €" },
  { id: "deco", nom: "Déco", prix: 0, label: "1 €/ongle" }
];

/* Cartes « La carte » (défilement horizontal) */
const PRESTATIONS = [
  { id: "russe", nom: "Manucure russe", desc: "Préparation à sec à la fraise, cuticules travaillées au plus près&nbsp;: la base de toutes les poses de Dina, et une prestation à part entière.", prix: "20 €", img: "assets/img/blanc-lacte.jpg", alt: "Manucure russe blanc lacté" },
  { id: "renfo", nom: "Renforcement des ongles naturels", desc: "Une base de renforcement sur votre ongle naturel&nbsp;: il gagne en solidité et pousse sans casser. Manucure russe comprise.", prix: "45 €", img: "assets/img/renforcement-naturel.jpg", alt: "Renforcement des ongles naturels rose lacté" },
  { id: "pose", nom: "Pose complète", desc: "Rallongement en gel ou acrygel, amande, carrée, ballerine ou stiletto, construit pour l’équilibre et la finesse. Manucure russe comprise.", prix: "65 €", img: "assets/img/fuchsia.jpg", alt: "Pose longue forme amande fuchsia" },
  { id: "remplissage", nom: "Remplissage gel", desc: "On comble la repousse, on rééquilibre l’architecture et on change de couleur si l’envie vous prend. Manucure russe comprise.", prix: "50 €", img: "assets/img/rouge-passion.jpg", alt: "Remplissage rouge framboise" },
  { id: "pieds-semi", nom: "Beauté des pieds", desc: "Semi-permanent avec pédicure comprise, pédicure seule ou calluspeeling pour des talons tout doux.", prix: "20 €", prefix: "dès", img: "assets/img/stock-pedicure.jpg", alt: "Soin pédicure en institut" },
  { id: "", nom: "French, baby boomer & déco", desc: "French fine, dégradé baby boomer ou nail art (léopard, dentelle, feuille d’or…) en supplément de votre pose.", prix: "5 €", prefix: "+", img: "assets/img/dentelle-noire.jpg", alt: "Nail art dentelle noire" }
];
const ALL_TARIFS = TARIFS.flatMap((c) => c.items.map((it) => ({ ...it, cat: c.cat })));
const findTarif = (id) => ALL_TARIFS.find((t) => t.id === id);

/* ---------------------------------------------------------
   2. OUTILS
   --------------------------------------------------------- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasGSAP = () => typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
const euro = (n) => `${n} €`;
const pad2 = (n) => String(n).padStart(2, "0");
const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const fmtMin = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const fmtDateLong = (d) => `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

document.documentElement.classList.add("js");
if (reduceMotion) document.documentElement.classList.add("no-motion");

/* ---------------------------------------------------------
   3. RENDU : cartes prestations + options de réservation
   --------------------------------------------------------- */
function renderServices() {
  const track = $("#services-track");
  if (track) {
    track.innerHTML = PRESTATIONS.map((p, i) => `
      <a class="card" href="#reservation" data-service="${p.id}">
        <div class="card__img"><img src="${p.img}" alt="${p.alt}" loading="lazy"></div>
        <div class="card__body">
          <span class="card__num">${pad2(i + 1)} / ${pad2(PRESTATIONS.length)}</span>
          <h3>${p.nom}</h3>
          <p>${p.desc}</p>
          <div class="card__foot">
            <span class="card__price">${p.prefix ? `<small>${p.prefix}</small>` : ""}${p.prix}</span>
            <span class="card__go" aria-hidden="true">→</span>
          </div>
        </div>
      </a>`).join("") + `
      <a class="card card--end" href="#reservation">
        <div class="card__body">
          <span class="card__num">Une envie précise&nbsp;?</span>
          <h3>Composez votre pose avec Dina</h3>
          <p>Choisissez la prestation la plus proche et décrivez votre inspiration dans la demande.</p>
          <span class="card__go" aria-hidden="true" style="margin:0 auto">→</span>
        </div>
      </a>`;
  }
  const opts = $("#bk-services");
  if (opts) {
    opts.innerHTML = TARIFS.map((c) => `
      <p class="bk__cat">${c.cat}<span>${c.note}</span></p>
      ${c.items.filter((it) => it.reservable !== false).map((it) => `
      <div class="opt">
        <input type="radio" name="service" id="svc-${it.id}" value="${it.id}">
        <label for="svc-${it.id}"><strong>${it.nom}</strong><span>${euro(it.prix)}</span></label>
      </div>`).join("")}`).join("");
  }
  const sup = $("#bk-supp");
  if (sup) {
    sup.innerHTML = SUPPLEMENTS.map((s) => `
      <label class="supp"><input type="checkbox" name="supp" value="${s.id}"><span>${s.nom} <em>+ ${s.label}</em></span></label>`).join("");
  }
  // carte des tarifs complète
  const menu = $("#tarifs-menu");
  if (menu) {
    const row = (nom, prix) => `<li><span class="tm__name">${nom}</span><span class="tm__dots" aria-hidden="true"></span><span class="tm__price">${prix}</span></li>`;
    menu.innerHTML = TARIFS.map((c, i) => `
      <div class="tm__col">
        <h3 class="tm__title">${c.cat}</h3>
        <p class="tm__note">${c.note}</p>
        <ul class="tm__list">${c.items.map((it) => row(it.nom, euro(it.prix))).join("")}</ul>
        ${i === 0 ? `<h4 class="tm__sub">Les suppléments</h4><ul class="tm__list">${SUPPLEMENTS.map((s) => row(s.nom, s.label)).join("")}</ul>` : ""}
      </div>`).join("");
  }
}
renderServices();

/* ---------------------------------------------------------
   4. RÉSERVATION (100 % statique : Instagram / SMS / .ics)
   --------------------------------------------------------- */
const booking = { service: null, date: null, slot: null, view: null };

function initBooking() {
  const form = $("#booking-form");
  if (!form) return;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today); maxDate.setMonth(maxDate.getMonth() + SALON.moisReservables);
  booking.view = new Date(today.getFullYear(), today.getMonth(), 1);

  const calDays = $(".cal__days", form), calMonth = $(".cal__month", form);
  const [prevBtn, nextBtn] = $$(".cal__nav", form);

  function isOpen(d) {
    if (d < today || d > maxDate) return false;
    if (!SALON.joursOuverts.includes(d.getDay())) return false;
    if (sameDay(d, new Date())) {
      const now = new Date(); const nowMin = now.getHours() * 60 + now.getMinutes();
      return nowMin + 60 <= toMin(SALON.dernierCreneau);
    }
    return true;
  }

  function renderCal() {
    const v = booking.view;
    calMonth.textContent = `${MOIS[v.getMonth()]} ${v.getFullYear()}`;
    const first = new Date(v.getFullYear(), v.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // lundi = 0
    const days = new Date(v.getFullYear(), v.getMonth() + 1, 0).getDate();
    let html = "";
    for (let i = 0; i < offset; i++) html += `<span></span>`;
    for (let d = 1; d <= days; d++) {
      const date = new Date(v.getFullYear(), v.getMonth(), d);
      const open = isOpen(date);
      const cls = ["cal__day", open ? "is-open" : "", sameDay(date, today) ? "is-today" : "", sameDay(date, booking.date) ? "is-selected" : ""].join(" ");
      html += `<button type="button" class="${cls}" data-d="${d}" ${open ? "" : "disabled"} aria-label="${fmtDateLong(date)}${open ? "" : ", indisponible"}" aria-pressed="${sameDay(date, booking.date)}">${d}</button>`;
    }
    calDays.innerHTML = html;
    prevBtn.disabled = v <= new Date(today.getFullYear(), today.getMonth(), 1);
    nextBtn.disabled = new Date(v.getFullYear(), v.getMonth() + 1, 1) > maxDate;
  }

  function renderSlots() {
    const wrap = $("#bk-slots");
    if (!booking.date) { wrap.innerHTML = `<p class="bk__placeholder">Choisissez d’abord un jour.</p>`; return; }
    let start = toMin(SALON.ouverture);
    const end = toMin(SALON.dernierCreneau);
    if (sameDay(booking.date, new Date())) {
      const now = new Date(); const m = now.getHours() * 60 + now.getMinutes() + 60;
      start = Math.max(start, Math.ceil(m / SALON.pasCreneau) * SALON.pasCreneau);
    }
    let html = "";
    for (let m = start; m <= end; m += SALON.pasCreneau) {
      const t = fmtMin(m); const id = "slot-" + t.replace(":", "");
      html += `<div class="slot"><input type="radio" name="slot" id="${id}" value="${t}" ${booking.slot === t ? "checked" : ""}><label for="${id}">${t.replace(":", " h ")}</label></div>`;
    }
    wrap.innerHTML = html || `<p class="bk__placeholder">Plus de créneau ce jour-là, choisissez une autre date.</p>`;
    if (window.gsap && !reduceMotion) gsap.from($$(".slot", wrap), { y: 14, opacity: 0, duration: .5, stagger: .02, ease: "power3.out" });
  }

  calDays.addEventListener("click", (e) => {
    const b = e.target.closest(".cal__day"); if (!b || b.disabled) return;
    booking.date = new Date(booking.view.getFullYear(), booking.view.getMonth(), +b.dataset.d);
    booking.slot = null;
    renderCal(); renderSlots(); updateRecap();
  });
  prevBtn.addEventListener("click", () => { booking.view.setMonth(booking.view.getMonth() - 1); renderCal(); });
  nextBtn.addEventListener("click", () => { booking.view.setMonth(booking.view.getMonth() + 1); renderCal(); });

  form.addEventListener("change", (e) => {
    if (e.target.name === "service") booking.service = findTarif(e.target.value);
    if (e.target.name === "slot") booking.slot = e.target.value;
    updateRecap();
  });
  form.addEventListener("input", (e) => { if (e.target.closest(".field")) e.target.closest(".field").classList.remove("is-invalid"); updateRecap(); });

  function updateRecap() {
    const r = $("#bk-recap");
    const parts = [];
    const supps = selectedSupps();
    if (booking.service) parts.push(`<b>${booking.service.nom}</b>${booking.service.cat === "Beauté des pieds" ? " (pieds)" : ""}`);
    if (supps.length) parts.push(`+ ${supps.map((s) => s.nom.toLowerCase()).join(", ")}`);
    if (booking.date) parts.push(`le <b>${fmtDateLong(booking.date)}</b>`);
    if (booking.slot) parts.push(`à <b>${booking.slot.replace(":", " h ")}</b>`);
    r.innerHTML = parts.length ? parts.join(" ") + "." + (booking.service ? `<span class="bk__total">Total indicatif : ${totalLabel()}</span>` : "") : "Votre sélection apparaîtra ici.";
    const done = [booking.service, booking.date, booking.slot, form.prenom.value.trim() && form.tel.value.trim()].filter(Boolean).length;
    $(".bk__progress span", form).style.transform = `scaleX(${done / 4})`;
    $("#bk-error").textContent = "";
  }

  function selectedSupps() { return $$('input[name="supp"]:checked', form).map((i) => SUPPLEMENTS.find((s) => s.id === i.value)); }
  function totalLabel() {
    const supps = selectedSupps();
    const total = booking.service.prix + supps.reduce((a, s) => a + s.prix, 0);
    return `${euro(total)}${supps.some((s) => s.id === "deco") ? " + déco (1 €/ongle)" : ""}`;
  }

  function buildMessage() {
    const f = form;
    const nom = [f.prenom.value.trim(), f.nom.value.trim()].filter(Boolean).join(" ");
    const supps = selectedSupps();
    const lines = [
      "Bonjour Dina 💅",
      `Je souhaite réserver un rendez-vous chez ${SALON.nom} :`,
      `• Prestation : ${booking.service.nom} – ${booking.service.cat} (${euro(booking.service.prix)})`
    ];
    if (supps.length) lines.push(`• Suppléments : ${supps.map((s) => `${s.nom} (+${s.label})`).join(", ")}`);
    lines.push(`• Total indicatif : ${totalLabel()}`);
    lines.push(
      `• Date souhaitée : ${fmtDateLong(booking.date)} à ${booking.slot.replace(":", "h")}`,
      `• Nom : ${nom}`,
      `• Téléphone : ${f.tel.value.trim()}`
    );
    if (f.insta.value.trim()) lines.push(`• Instagram : @${f.insta.value.trim().replace(/^@/, "")}`);
    lines.push(`• Première visite : ${f.premiere.checked ? "oui" : "non"}`);
    if (f.note.value.trim()) lines.push(`• Précisions : ${f.note.value.trim()}`);
    lines.push("", "Merci de me confirmer si ce créneau est disponible 🙏");
    return lines.join("\n");
  }

  function validate() {
    const err = $("#bk-error");
    const fail = (msg, focusEl) => { err.textContent = msg; if (focusEl) { scrollToEl(focusEl); setTimeout(() => focusEl.focus?.({ preventScroll: true }), 600); } return false; };
    if (!booking.service) return fail("Choisissez une prestation.", $("#bk-services input"));
    if (!booking.date) return fail("Choisissez un jour d’ouverture dans le calendrier.", $(".cal__day.is-open") || $("#bk-cal"));
    if (!booking.slot) return fail("Choisissez une heure.", $("#bk-slots input"));
    if (!form.prenom.value.trim()) { form.prenom.closest(".field").classList.add("is-invalid"); return fail("Indiquez votre prénom.", form.prenom); }
    const tel = form.tel.value.replace(/[\s.\-()]/g, "");
    if (!/^(\+?\d{9,15})$/.test(tel)) { form.tel.closest(".field").classList.add("is-invalid"); return fail("Indiquez un numéro de téléphone valide, pour que Dina puisse vous recontacter.", form.tel); }
    return true;
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand("copy"); } catch {} t.remove(); return ok; }
  }

  const modal = $(".sendmodal");
  let lastFocus = null;
  function openModal(msg) {
    lastFocus = document.activeElement;
    $("#sendmodal-msg").textContent = msg;
    const sms = $(".js-sms", modal);
    if (SALON.telephone) { sms.hidden = false; sms.href = `sms:${SALON.telephone}?&body=${encodeURIComponent(msg)}`; }
    modal.hidden = false;
    window.__lenis?.stop();
    if (window.gsap && !reduceMotion) gsap.fromTo(".sendmodal__card", { y: 40, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .7, ease: "expo.out" });
    $("#send-ig").focus();
  }
  function closeModal() { modal.hidden = true; window.__lenis?.start(); lastFocus?.focus?.(); }
  $(".sendmodal__close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  $("#send-copy").addEventListener("click", async (e) => { const ok = await copy($("#sendmodal-msg").textContent); const l = $(".btn__label", e.currentTarget); l.textContent = ok ? "Copié ✓" : "Sélectionnez le texte"; setTimeout(() => (l.textContent = "Copier à nouveau"), 2000); });
  $("#send-ics").addEventListener("click", downloadICS);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const msg = buildMessage();
    await copy(msg);
    openModal(msg);
  });

  function downloadICS() {
    const d = booking.date; const [h, m] = booking.slot.split(":").map(Number);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
    const end = new Date(start.getTime() + (booking.service.duree || 90) * 60000);
    const f = (x) => `${x.getFullYear()}${pad2(x.getMonth() + 1)}${pad2(x.getDate())}T${pad2(x.getHours())}${pad2(x.getMinutes())}00`;
    const now = new Date();
    const stamp = `${now.getUTCFullYear()}${pad2(now.getUTCMonth() + 1)}${pad2(now.getUTCDate())}T${pad2(now.getUTCHours())}${pad2(now.getUTCMinutes())}00Z`;
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DiNails Beauty Studio//Reservation//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${stamp}-${Math.random().toString(36).slice(2)}@dinails`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Paris:${f(start)}`,
      `DTEND;TZID=Europe/Paris:${f(end)}`,
      `SUMMARY:DiNails · ${booking.service.nom} (à confirmer par Dina)`,
      `LOCATION:${SALON.nom}\\, ${SALON.adresse.replace(/,/g, "\\,")}`,
      "DESCRIPTION:Demande de rendez-vous envoyée à Dina. Le créneau est définitif après sa confirmation.",
      "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Rendez-vous DiNails", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "rendez-vous-dinails.ics"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  // préselection depuis les cartes prestations
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-service]"); if (!c) return;
    const input = $(`#svc-${c.dataset.service}`);
    if (input) { input.checked = true; booking.service = findTarif(c.dataset.service); updateRecap(); }
  });

  renderCal();
}
initBooking();

/* ---------------------------------------------------------
   5. INFOS PRATIQUES : horaires du jour, téléphone, année
   --------------------------------------------------------- */
(function practical() {
  const now = new Date(); const day = now.getDay();
  $(`.hours tr[data-day="${day}"]`)?.classList.add("is-today");
  const st = $("#open-status");
  if (st) {
    const m = now.getHours() * 60 + now.getMinutes();
    const open = SALON.joursOuverts.includes(day) && m >= toMin(SALON.ouverture) && m < toMin(SALON.fermeture);
    let next = "";
    if (!open) {
      for (let i = 0; i < 8; i++) {
        const d = (day + i) % 7;
        if (SALON.joursOuverts.includes(d) && (i > 0 || m < toMin(SALON.ouverture))) { next = i === 0 ? "aujourd’hui à 9 h" : i === 1 ? "demain à 9 h" : `${JOURS[d]} à 9 h`; break; }
      }
    }
    st.classList.toggle("is-closed", !open);
    st.innerHTML = `<i aria-hidden="true"></i>${open ? "Ouvert en ce moment · jusqu’à 19 h" : `Fermé · ouvre ${next}`}`;
  }
  if (SALON.telephone) $$(".js-phone-link").forEach((a) => { a.hidden = false; a.href = `tel:${SALON.telephone}`; });
  const y = $("#year"); if (y) y.textContent = now.getFullYear();
})();

/* ---------------------------------------------------------
   6. MENU MOBILE
   --------------------------------------------------------- */
(function menu() {
  const burger = $(".nav__burger"), menuEl = $("#menu");
  if (!burger) return;
  let open = false;
  const toggle = (state) => {
    open = state ?? !open;
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    menuEl.setAttribute("aria-hidden", !open);
    if (open) window.__lenis?.stop(); else window.__lenis?.start();
    if (window.gsap) {
      if (open) {
        gsap.set(menuEl, { visibility: "visible" });
        gsap.to(".menu__bg", { clipPath: "ellipse(150% 150% at 92% 4%)", duration: reduceMotion ? 0 : .9, ease: "expo.inOut" });
        gsap.fromTo(".menu__links a", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .8, stagger: .06, delay: .3, ease: "expo.out" });
        gsap.fromTo(".menu__foot", { opacity: 0 }, { opacity: .7, delay: .6 });
      } else {
        gsap.to(".menu__links a", { yPercent: -110, opacity: 0, duration: .4, stagger: .03, ease: "power3.in" });
        gsap.to(".menu__bg", { clipPath: "ellipse(0% 0% at 92% 4%)", duration: reduceMotion ? 0 : .7, delay: .2, ease: "expo.inOut", onComplete: () => gsap.set(menuEl, { visibility: "hidden" }) });
      }
    } else { menuEl.style.visibility = open ? "visible" : "hidden"; $(".menu__bg").style.clipPath = open ? "none" : ""; }
  };
  burger.addEventListener("click", () => toggle());
  $$(".menu__links a").forEach((a) => a.addEventListener("click", () => toggle(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) toggle(false); });
})();

/* ---------------------------------------------------------
   7. LIGHTBOX GALERIE
   --------------------------------------------------------- */
(function lightbox() {
  const lb = $(".lightbox"); if (!lb) return;
  const items = $$(".g-item");
  let idx = 0, last = null;
  const img = $("img", lb), cap = $("figcaption", lb);
  const show = (i) => {
    idx = (i + items.length) % items.length;
    const src = $("img", items[idx]);
    img.src = src.currentSrc || src.src; img.alt = src.alt; cap.textContent = items[idx].dataset.caption;
    if (window.gsap && !reduceMotion) gsap.fromTo(img, { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: .6, ease: "expo.out" });
  };
  const open = (i) => { last = document.activeElement; lb.hidden = false; show(i); window.__lenis?.stop(); $(".lightbox__close", lb).focus(); };
  const close = () => { lb.hidden = true; window.__lenis?.start(); last?.focus(); };
  items.forEach((it, i) => $(".g-btn", it).addEventListener("click", () => open(i)));
  $(".lightbox__close", lb).addEventListener("click", close);
  $(".lightbox__nav--prev", lb).addEventListener("click", () => show(idx - 1));
  $(".lightbox__nav--next", lb).addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
})();

/* ---------------------------------------------------------
   8. CARROUSEL AVIS (drag + flèches + auto)
   --------------------------------------------------------- */
(function reviews() {
  const slider = $(".reviews__slider"); if (!slider) return;
  const track = $(".reviews__track", slider), cards = $$(".review", track), dots = $(".reviews__dots");
  dots.innerHTML = cards.map(() => "<i></i>").join("");
  let i = 0, x = 0, timer = null;
  const maxX = () => Math.max(0, track.scrollWidth - slider.clientWidth + parseFloat(getComputedStyle(slider).paddingLeft) * 2);
  const go = (n, instant) => {
    i = Math.max(0, Math.min(cards.length - 1, n));
    x = Math.min(cards[i].offsetLeft - cards[0].offsetLeft, maxX());
    if (window.gsap && !instant) gsap.to(track, { x: -x, duration: reduceMotion ? 0 : 1, ease: "expo.out" });
    else track.style.transform = `translateX(${-x}px)`;
    cards.forEach((c, k) => c.classList.toggle("is-dim", k !== i));
    $$("i", dots).forEach((d, k) => d.classList.toggle("is-on", k === i));
  };
  $$(".reviews__btn").forEach((b) => b.addEventListener("click", () => { go(i + +b.dataset.dir); restart(); }));
  // drag
  let startX = 0, startT = 0, dragging = false;
  slider.addEventListener("pointerdown", (e) => { if (e.target.closest("a")) return; dragging = true; startX = e.clientX; startT = x; slider.setPointerCapture(e.pointerId); stop(); });
  slider.addEventListener("pointermove", (e) => { if (!dragging) return; const dx = e.clientX - startX; track.style.transform = `translateX(${-(startT - dx)}px)`; if (window.gsap) gsap.set(track, { x: -(startT - dx) }); });
  const end = (e) => { if (!dragging) return; dragging = false; const dx = e.clientX - startX; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); else go(i); restart(); };
  slider.addEventListener("pointerup", end); slider.addEventListener("pointercancel", end);
  const stop = () => clearInterval(timer);
  const restart = () => { stop(); if (!reduceMotion) timer = setInterval(() => go(i + 1 >= cards.length ? 0 : i + 1), 6500); };
  slider.addEventListener("mouseenter", stop); slider.addEventListener("mouseleave", restart);
  window.addEventListener("resize", () => go(i, true));
  go(0, true); restart();
})();

/* ---------------------------------------------------------
   9. VIDÉO CTA EN LAZY LOAD
   --------------------------------------------------------- */
(function lazyVideo() {
  const vids = $$("video[data-lazy-video]");
  const load = (v) => { $$("source[data-src]", v).forEach((s) => { s.src = s.dataset.src; s.removeAttribute("data-src"); }); v.load(); v.play?.().catch(() => {}); };
  if (!("IntersectionObserver" in window)) return vids.forEach(load);
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { load(en.target); io.unobserve(en.target); } }), { rootMargin: "600px" });
  vids.forEach((v) => io.observe(v));
})();

/* ---------------------------------------------------------
   10. ANIMATIONS (GSAP + ScrollTrigger + Lenis)
   --------------------------------------------------------- */
function splitChars(el) {
  // découpe un élément texte en mots > lettres, avec masque
  const text = el.textContent;
  el.innerHTML = `<span class="sr-only">${text}</span>` + text.split(/(\s+)/).map((w) => {
    if (/^\s+$/.test(w)) return " ";
    return `<span class="split-word" aria-hidden="true">${[...w].map((c) => `<span class="split-char">${c}</span>`).join("")}</span>`;
  }).join("");
  return $$(".split-char", el);
}
function splitWords(el) {
  const text = el.textContent;
  el.innerHTML = `<span class="sr-only">${text.trim()}</span>` + text.trim().split(/\s+/).map((w) => `<span class="split-word" aria-hidden="true"><span class="split-inner">${w}</span></span>`).join(" ");
  return $$(".split-inner", el);
}
function scrollToEl(el) {
  const target = typeof el === "string" ? $(el) : el;
  if (!target) return;
  if (window.__lenis) window.__lenis.scrollTo(target, { offset: -90, duration: 1.4 });
  else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

function finishLoaderPlain() {
  const l = $(".loader"); if (l) l.remove();
  document.body.classList.remove("is-loading");
  $$(".fade-up").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
}

function initMotion() {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* ----- Lenis ----- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({ lerp: .085, wheelMultiplier: 1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* ancres */
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href"); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault(); scrollToEl(t);
    history.replaceState(null, "", id);
  }));

  /* ----- Loader ----- */
  const heroChars = $$(".hero__title .split").flatMap(splitChars);
  const loaderTl = gsap.timeline({ paused: true });
  const counter = { v: 0 };
  const loaderNum = $(".loader__num");
  gsap.set(".hero__float .almond", { scale: 0, rotate: -12 });
  gsap.set([".hero__kicker", ".hero__lead", ".hero__actions", ".hero__rating", ".hero__scroll", ".nav"], { opacity: 0, y: 20 });
  gsap.set(heroChars, { yPercent: 115, rotate: 6 });

  const intro = gsap.timeline({ paused: true });
  intro
    .to(".loader__inner", { y: -40, opacity: 0, duration: .6, ease: "power3.in" })
    .to(".loader__panel--top", { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=.1")
    .to(".loader__panel--bottom", { yPercent: 100, duration: 1.2, ease: "expo.inOut" }, "<")
    .fromTo(".hero__video", { scale: 1.45 }, { scale: 1.15, duration: 2.2, ease: "expo.out" }, "<.15")
    .to(heroChars, { yPercent: 0, rotate: 0, duration: 1.3, stagger: .028, ease: "expo.out" }, "<.35")
    .to(".hero__float .almond", { scale: 1, rotate: 0, duration: 1.4, stagger: .12, ease: "elastic.out(1, .75)" }, "<.3")
    .to([".hero__kicker", ".hero__lead", ".hero__actions", ".hero__rating", ".hero__scroll", ".nav"], { opacity: 1, y: 0, duration: 1, stagger: .07, ease: "power3.out" }, "<.2")
    .add(() => { $(".loader")?.remove(); document.body.classList.remove("is-loading"); lenis?.start(); ScrollTrigger.refresh(); }, "-=.6");

  loaderTl
    .to(".loader__mono text", { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0)
    .to(".loader__mono text", { fill: "#B4705C", duration: .6, ease: "power2.out" }, 1.1)
    .to(".loader__brand", { opacity: 1, duration: .8 }, .5);
  loaderTl.play();

  // progression réelle (images + vidéo) avec un minimum de durée
  const assets = [$(".hero__video"), ...$$(".hero img")];
  let loaded = 0; const total = assets.length;
  const bump = () => { loaded++; };
  assets.forEach((el) => {
    if (el.tagName === "VIDEO") { if (el.readyState >= 2) bump(); else { el.addEventListener("loadeddata", bump, { once: true }); el.addEventListener("error", bump, { once: true }); } }
    else if (el.complete) bump(); else { el.addEventListener("load", bump, { once: true }); el.addEventListener("error", bump, { once: true }); }
  });
  const t0 = performance.now();
  const tick = () => {
    const elapsed = (performance.now() - t0) / 1000;
    const real = loaded / total;
    const target = Math.min(real, elapsed / 1.8) * 100;
    counter.v += (target - counter.v) * .12;
    if (elapsed > 4) counter.v += (100 - counter.v) * .2; // sécurité : on n'attend jamais plus de ~4,5 s
    if (counter.v > 99.5) counter.v = 100;
    const v = Math.round(counter.v);
    loaderNum.textContent = v;
    gsap.set(".loader__bar span", { scaleX: v / 100 });
    if (v >= 100) { gsap.ticker.remove(tick); setTimeout(() => intro.play(), 250); }
  };
  gsap.ticker.add(tick);

  /* ----- Progression lecture ----- */
  gsap.to(".progress span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: .3 } });

  /* ----- Nav : cache/affiche + fond ----- */
  const nav = $("#nav"), fab = $(".fab");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-solid", y > window.innerHeight * .85);
      if (!document.body.classList.contains("menu-open")) nav.classList.toggle("is-hidden", self.direction === 1 && y > 200);
    }
  });
  ScrollTrigger.create({ trigger: ".hero", start: "bottom 80%", end: "max", onToggle: (s) => fab.classList.toggle("is-visible", s.isActive) });
  ScrollTrigger.create({ trigger: "#reservation", start: "top 80%", end: "bottom 20%", onToggle: (s) => fab.style.opacity = s.isActive ? 0 : "" });

  const mm = gsap.matchMedia();

  /* ----- Hero parallax multicouche ----- */
  gsap.to(".hero__media", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__content", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
  $$(".hero__float .almond").forEach((a) => {
    const d = parseFloat(a.dataset.depth || .5);
    gsap.to(a, { y: () => -window.innerHeight * d * .8, rotate: d * 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  });
  if (finePointer) {
    const floats = $$(".hero__float .almond").map((a) => ({ a, d: parseFloat(a.dataset.depth), qx: gsap.quickTo(a, "x", { duration: 1.2, ease: "power3" }) }));
    $(".hero").addEventListener("mousemove", (e) => {
      const nx = e.clientX / window.innerWidth - .5;
      floats.forEach((f) => f.qx(nx * -60 * f.d));
    });
  }

  /* ----- Marquee réactif au scroll ----- */
  $$(".marquee__track").forEach((track) => {
    const row = $(".marquee__row", track);
    track.appendChild(row.cloneNode(true)).setAttribute("aria-hidden", "true");
    const dir = +track.dataset.dir;
    const tw = gsap.fromTo(track, { xPercent: dir > 0 ? 0 : -50 }, { xPercent: dir > 0 ? -50 : 0, duration: dir > 0 ? 38 : 46, ease: "none", repeat: -1 });
    let ts = 1;
    ScrollTrigger.create({
      trigger: ".marquee", start: "top bottom", end: "bottom top",
      onUpdate: (self) => {
        const v = self.getVelocity();
        ts = gsap.utils.clamp(-6, 6, (self.direction) * (1 + Math.abs(v) / 300));
        gsap.to(tw, { timeScale: ts, duration: .2, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: self.direction, duration: 1.2, ease: "power2.out" }) });
      }
    });
  });

  /* ----- Titres : apparition mot par mot ----- */
  $$(".reveal-words").forEach((el) => {
    const w = splitWords(el);
    gsap.from(w, { yPercent: 110, rotate: 4, duration: 1.1, stagger: .045, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
  });
  $$("section:not(.hero) .split").forEach((el) => {
    const c = splitChars(el);
    gsap.from(c, { yPercent: 115, duration: 1.2, stagger: .035, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  $$(".ritual__title, .reviews__title").forEach((el) => {
    gsap.from(el, { clipPath: "inset(0 0 100% 0)", y: 40, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
  });
  gsap.set(".fade-up", { opacity: 0, y: 30 });
  ScrollTrigger.batch(".fade-up", { start: "top 90%", onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1, stagger: .1, ease: "power3.out", overwrite: true }) });

  /* ----- Révélation d'images par masque + parallax interne ----- */
  $$(".mask-reveal").forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0% round 999px 999px 18px 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 999px 999px 18px 18px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 85%" } });
    const img = $("img", el);
    gsap.fromTo(img, { yPercent: -12, scale: 1.25 }, { yPercent: 0, scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ----- Séparateur « 5 ongles » ----- */
  gsap.from(".nail-divider i", { scaleY: 0, opacity: 0, duration: 1, stagger: .08, ease: "back.out(2)", scrollTrigger: { trigger: ".nail-divider", start: "top 90%" } });

  /* ----- Rituel épinglé (storytelling) ----- */
  const steps = $$(".ritual__step"), imgs = $$(".ritual__img"), cur = $(".ritual__current");
  let current = 0;
  const setStep = (n) => {
    if (n === current) return;
    const prev = current; current = n;
    steps.forEach((s, k) => s.classList.toggle("is-active", k === n));
    cur.textContent = pad2(n + 1);
    const down = n > prev;
    imgs.forEach((im, k) => {
      if (k === n) {
        gsap.fromTo(im, { clipPath: down ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", scale: 1.25, zIndex: 2 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.1, ease: "expo.inOut" });
      } else if (k === prev) {
        gsap.set(im, { zIndex: 1 }); gsap.to(im, { scale: .9, duration: 1.1, ease: "expo.inOut" });
      } else gsap.set(im, { zIndex: 0, clipPath: "inset(100% 0% 0% 0%)" });
    });
  };
  gsap.set(imgs, { clipPath: "inset(100% 0% 0% 0%)" }); gsap.set(imgs[0], { clipPath: "inset(0% 0% 0% 0%)", scale: 1, zIndex: 2 });

  mm.add("(min-width: 901px)", () => {
    const st = ScrollTrigger.create({
      trigger: ".ritual", start: "top top", end: "+=" + (steps.length * 70) + "%", pin: ".ritual__pin", scrub: true,
      onUpdate: (self) => {
        setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * .999)));
        gsap.set(".ritual__ring circle", { strokeDashoffset: 301.6 * (1 - self.progress) });
      }
    });
    gsap.to(".ritual__frame", { rotate: 3, ease: "none", scrollTrigger: { trigger: ".ritual", start: "top top", end: "+=" + (steps.length * 70) + "%", scrub: true } });
    return () => st.kill();
  });
  mm.add("(max-width: 900px)", () => {
    steps.forEach((s, k) => s.classList.add("is-active"));
    const sts = steps.map((s, k) => ScrollTrigger.create({ trigger: s, start: "top 60%", end: "bottom 60%", onToggle: (self) => { if (self.isActive) { setStep(k); gsap.set(".ritual__ring circle", { strokeDashoffset: 301.6 * (1 - (k + 1) / steps.length) }); } } }));
    return () => sts.forEach((x) => x.kill());
  });

  /* ----- Prestations : défilement horizontal piloté par le scroll ----- */
  mm.add("(min-width: 901px)", () => {
    const track = $("#services-track"), intro = $(".services__intro");
    const dist = () => track.scrollWidth - (window.innerWidth - intro.offsetWidth);
    const tween = gsap.to(track, { x: () => -dist(), ease: "none" });
    const st = ScrollTrigger.create({ trigger: ".services", start: "top top", end: () => "+=" + dist(), pin: ".services__pin", scrub: 1, animation: tween, invalidateOnRefresh: true });
    $$(".card", track).forEach((card) => {
      const im = $(".card__img img", card);
      gsap.fromTo(im, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      gsap.from(card, { y: 80, rotate: 3, opacity: .3, ease: "power2.out", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 105%", end: "left 60%", scrub: true } });
    });
    gsap.to(".services__intro", { opacity: 0, x: -80, ease: "none", scrollTrigger: { trigger: ".services", start: "top top", end: () => "+=" + intro.offsetWidth * .9, scrub: true } });
    return () => { st.kill(); tween.kill(); gsap.set(track, { x: 0 }); };
  });

  /* ----- Carte des tarifs : colonnes qui montent, lignes pointillées qui se tracent ----- */
  gsap.from(".tm__col", { y: 120, rotate: (i) => (i ? 4 : -4), opacity: 0, duration: 1.4, stagger: .15, ease: "expo.out", scrollTrigger: { trigger: ".tm", start: "top 80%" } });
  $$(".tm__col").forEach((col) => {
    gsap.from($$(".tm__dots", col), { scaleX: 0, duration: 1.1, stagger: .06, ease: "power3.inOut", scrollTrigger: { trigger: col, start: "top 70%" } });
    gsap.from($$(".tm__price", col), { opacity: 0, x: 14, duration: .8, stagger: .06, delay: .4, ease: "power3.out", scrollTrigger: { trigger: col, start: "top 70%" } });
  });

  /* ----- Compteurs ----- */
  $$(".count").forEach((el) => {
    const to = parseFloat(el.dataset.to), dec = +(el.dataset.decimals || 0), o = { v: 0 };
    gsap.to(o, { v: to, duration: 2.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" }, onUpdate: () => (el.textContent = o.v.toFixed(dec).replace(".", ",")) });
  });
  gsap.from(".stat", { y: 60, opacity: 0, duration: 1.1, stagger: .12, ease: "expo.out", scrollTrigger: { trigger: ".stats", start: "top 75%" } });
  gsap.fromTo(".stats__drip", { scaleY: -.3 }, { scaleY: -1, ease: "none", scrollTrigger: { trigger: ".stats", start: "bottom bottom", end: "bottom 40%", scrub: true } });

  /* ----- Hygiène : cercle qui s'agrandit ----- */
  gsap.fromTo(".circle-reveal", { clipPath: "circle(8% at 50% 50%)" }, { clipPath: "circle(71% at 50% 50%)", ease: "none", scrollTrigger: { trigger: ".hygiene", start: "top 85%", end: "center 55%", scrub: 1 } });
  gsap.fromTo(".circle-reveal img", { scale: 1.5, rotate: -8 }, { scale: 1, rotate: 0, ease: "none", scrollTrigger: { trigger: ".hygiene", start: "top 85%", end: "bottom top", scrub: 1 } });

  /* ----- Galerie : apparition en cascade + Ken Burns ----- */
  gsap.set(".g-item", { y: 80, opacity: 0 });
  ScrollTrigger.batch(".g-item", { start: "top 92%", onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 1.1, stagger: .09, ease: "expo.out" }) });
  gsap.fromTo(".gallery__title", { x: -40 }, { x: 40, ease: "none", scrollTrigger: { trigger: ".gallery", start: "top bottom", end: "bottom top", scrub: true } });

  /* ----- CTA : la vidéo s'ouvre ----- */
  gsap.fromTo(".cta__media", { clipPath: "inset(12% 18% round 400px)" }, { clipPath: "inset(0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: ".cta", start: "top 80%", end: "center center", scrub: 1 } });
  gsap.fromTo(".cta__media video", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });

  /* ----- Réservation ----- */
  gsap.from(".bk", { y: 100, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".booking", start: "top 75%" } });
  gsap.from(".bk__step", { y: 40, opacity: 0, duration: 1, stagger: .12, ease: "power3.out", scrollTrigger: { trigger: ".bk", start: "top 70%" } });

  /* ----- Carte ----- */
  gsap.fromTo(".find__map", { clipPath: "inset(30% 20% 0% 20% round 260px 260px 18px 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 260px 260px 18px 18px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: ".find__map", start: "top 85%" } });
  gsap.from(".hours tr", { x: -30, opacity: 0, duration: .8, stagger: .06, ease: "power3.out", scrollTrigger: { trigger: ".hours", start: "top 85%" } });

  /* ----- Footer : nom géant ----- */
  gsap.from(".footer__giant span", { yPercent: 100, opacity: 0, rotate: 8, stagger: .06, ease: "power3.out", scrollTrigger: { trigger: ".footer__giant", start: "top 95%", end: "bottom bottom", scrub: 1 } });

  /* ----- Micro-interactions desktop ----- */
  if (finePointer) {
    // boutons magnétiques
    $$(".magnetic").forEach((el) => {
      const qx = gsap.quickTo(el, "x", { duration: .6, ease: "power3" }), qy = gsap.quickTo(el, "y", { duration: .6, ease: "power3" });
      el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .3); qy((e.clientY - r.top - r.height / 2) * .4); });
      el.addEventListener("mouseleave", () => { gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, .4)" }); });
    });
    // cartes 3D + reflet
    const tilt = (el, max) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--ry", `${(px - .5) * max}deg`); el.style.setProperty("--rx", `${(.5 - py) * max}deg`);
        el.style.setProperty("--gx", `${px * 100}%`); el.style.setProperty("--gy", `${py * 100}%`);
      });
      el.addEventListener("mouseleave", () => { el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg"); });
    };
    $$(".card").forEach((c) => tilt(c, 14));
    $$(".g-item").forEach((c) => tilt(c, 8));
    // curseur amande
    const cursor = $(".cursor");
    const dx = gsap.quickTo(".cursor__dot", "x", { duration: .15 }), dy = gsap.quickTo(".cursor__dot", "y", { duration: .15 });
    const rx = gsap.quickTo(".cursor__ring", "x", { duration: .6, ease: "power3" }), ry = gsap.quickTo(".cursor__ring", "y", { duration: .6, ease: "power3" });
    gsap.set(cursor, { opacity: 0 });
    let seen = false;
    window.addEventListener("mousemove", (e) => { if (!seen) { seen = true; gsap.set([".cursor__dot", ".cursor__ring"], { x: e.clientX, y: e.clientY }); gsap.to(cursor, { opacity: 1, duration: .4 }); } dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener("mouseover", (e) => {
      const view = e.target.closest(".g-btn");
      const hov = e.target.closest("a, button, input, label, textarea, .card");
      cursor.classList.toggle("is-view", !!view);
      cursor.classList.toggle("is-hover", !!hov && !view);
    });
    document.addEventListener("mouseleave", () => gsap.to(cursor, { opacity: 0 }));
    document.addEventListener("mouseenter", () => gsap.to(cursor, { opacity: 1 }));
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* ---------------------------------------------------------
   11. DÉMARRAGE
   --------------------------------------------------------- */
function start() {
  if (hasGSAP() && !reduceMotion) {
    try { initMotion(); return; } catch (err) { console.error(err); }
  }
  // version allégée : pas de smooth scroll ni d'animations lourdes
  setTimeout(finishLoaderPlain, reduceMotion ? 200 : 0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href"); if (id.length < 2) return; const t = $(id); if (!t) return;
    e.preventDefault(); scrollToEl(t);
  }));
  const fab = $(".fab");
  const onScroll = () => fab.classList.toggle("is-visible", window.scrollY > window.innerHeight * .8);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
