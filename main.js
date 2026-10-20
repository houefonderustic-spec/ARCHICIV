/* ARCHICIV INGÉNIERIE SARL — JavaScript natif, sans bibliothèque.
   Chaque bloc est indépendant : s'il n'y a rien à animer sur la page, il ne fait rien. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Photos : 1) votre fichier dans assets/images/  2) photo en ligne  3) illustration .svg */
  function chain(img) {
    if (img.dataset.remote && !img.dataset.stage) { img.dataset.stage = "remote"; img.src = img.dataset.remote; }
    else if (img.dataset.fallback && img.dataset.stage !== "fb") { img.dataset.stage = "fb"; img.src = img.dataset.fallback; }
  }
  function watch(img) {
    img.addEventListener("error", function () { chain(img); });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) chain(img);
  }
  function setPhoto(img, local, remote, fb) { img.dataset.stage = ""; img.dataset.remote = remote || ""; img.dataset.fallback = fb || ""; img.src = local; }
  $$("img[data-fallback]").forEach(watch);

  /* Année du copyright */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Menu mobile */
  var burger = $(".burger"), nav = $("#nav");
  function closeMenu() { if (!burger) return; burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Ouvrir le menu"); nav.classList.remove("is-open"); }
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      if (open) { closeMenu(); return; }
      burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Fermer le menu"); nav.classList.add("is-open");
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); burger.focus(); } });
    document.addEventListener("click", function (e) { if (!nav.contains(e.target) && !burger.contains(e.target)) closeMenu(); });
    window.matchMedia("(min-width: 961px)").addEventListener("change", closeMenu);
  }

  /* En-tête : ombre au défilement + barre de progression + parallaxe douce */
  var header = $(".site-header"), bar = $(".progress"), parallax = $$("[data-parallax]"), ticking = false;
  function onScroll() {
    var y = window.scrollY || 0, max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    document.body.classList.toggle("show-mbar", y > 420);
    if (bar && max > 0) bar.style.transform = "scaleX(" + Math.min(y / max, 1) + ")";
    if (!reduce) parallax.forEach(function (el) {
      var box = el.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      var p = (box.top + box.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.transform = "translate3d(0," + (p * -34).toFixed(1) + "px,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Apparition au défilement */
  var reveals = $$(".reveal, .blueprint");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Services : onglets interactifs (page d'accueil) */
  var svcBtns = $$(".svc-btn");
  if (svcBtns.length) {
    var view = $(".svc-view"), img = $("img", view), ttl = $("#svc-title"), dsc = $("#svc-desc");
    var select = function (btn, focus) {
      svcBtns.forEach(function (b) { b.setAttribute("aria-selected", b === btn ? "true" : "false"); b.tabIndex = b === btn ? 0 : -1; });
      img.classList.add("is-swapping");
      setTimeout(function () {
        setPhoto(img, btn.dataset.img, btn.dataset.remote, btn.dataset.fb); img.alt = btn.dataset.alt;
        ttl.textContent = btn.dataset.title; dsc.textContent = btn.dataset.desc;
        img.classList.remove("is-swapping");
      }, reduce ? 0 : 280);
      if (focus) btn.focus();
      if (btn.scrollIntoView && window.matchMedia("(max-width: 900px)").matches) btn.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
    };
    svcBtns.forEach(function (btn, i) {
      btn.addEventListener("click", function () { select(btn); });
      btn.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches && btn.getAttribute("aria-selected") !== "true") select(btn); });
      btn.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (n) { e.preventDefault(); select(svcBtns[(i + n + svcBtns.length) % svcBtns.length], true); }
      });
    });
  }

  /* Comparateur plan / bâtiment */
  var cmp = $("#compare");
  if (cmp) {
    var rng = $(".compare-range", cmp);
    var setPos = function (v) { cmp.style.setProperty("--pos", v + "%"); };
    rng.addEventListener("input", function () { setPos(rng.value); });
    if ("IntersectionObserver" in window && !reduce) {
      var ioC = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          ioC.disconnect();
          var t0 = performance.now(), stop = false;
          ["pointerdown", "input", "keydown", "touchstart"].forEach(function (ev) { cmp.addEventListener(ev, function () { stop = true; }, { once: true }); });
          (function frame(t) {
            if (stop) return;
            var p = Math.min((t - t0) / 2600, 1), v = 50 + 32 * Math.sin(p * Math.PI * 2) * (1 - p * .3);
            rng.value = v; setPos(v);
            if (p < 1) requestAnimationFrame(frame); else { rng.value = 50; setPos(50); }
          })(t0);
        });
      }, { threshold: 0.6 });
      ioC.observe(cmp);
    }
  }

  /* Effets souris : inclinaison des cartes et boutons « magnétiques » */
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".proj").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty("--ry", (x * 7).toFixed(2) + "deg"); c.style.setProperty("--rx", (-y * 7).toFixed(2) + "deg");
      });
      c.addEventListener("pointerleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
    $$(".btn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * .12).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * .25).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
  }

  /* Carrousel des réalisations */
  var track = $(".track");
  if (track) {
    var prev = $(".arrow.prev"), next = $(".arrow.next");
    var step = function () { var c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 14 : 300; };
    var sync = function () {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); });
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
    /* Glisser à la souris sur ordinateur */
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener("pointermove", function (e) {
      if (!down) return; var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; track.style.scrollSnapType = "none"; track.scrollLeft = sl - dx; }
    });
    window.addEventListener("pointerup", function () { if (down) { down = false; track.style.scrollSnapType = ""; } });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  }

  /* Réalisations : filtres par catégorie */
  var chips = $$(".chip[data-filter]");
  if (chips.length) {
    var cards = $$(".grid .proj"), empty = $(".empty-note");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        var f = chip.dataset.filter, shown = 0;
        cards.forEach(function (card) {
          var ok = f === "all" || card.dataset.cat === f;
          card.classList.toggle("is-hidden", !ok); if (ok) shown++;
        });
        if (empty) empty.style.display = shown ? "none" : "block";
      });
    });
  }

  /* Formulaire de contact : validation + préparation d'un message WhatsApp.
     Aucun envoi serveur n'existe : voir README (service de formulaire ou PHP). */
  var form = $("#contact-form");
  if (form) {
    var WA = "https://wa.me/2290196113590";
    var result = $("#form-result");
    var setErr = function (input, msg) {
      var e = $("#" + input.id + "-err"); if (e) e.textContent = msg || "";
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    };
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = form.elements.nom, contact = form.elements.contact, type = form.elements.type, msg = form.elements.message, ok = true;
      [name, contact, msg].forEach(function (i) { setErr(i, ""); });
      if (!name.value.trim()) { setErr(name, "Indiquez votre nom."); ok = false; }
      var c = contact.value.trim();
      if (!/^\+?[\d\s().-]{8,}$/.test(c) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) { setErr(contact, "Indiquez un téléphone ou un e-mail valide."); ok = false; }
      if (msg.value.trim().length < 10) { setErr(msg, "Décrivez votre projet en quelques mots."); ok = false; }
      if (!ok) { var first = form.querySelector('[aria-invalid="true"]'); if (first) first.focus(); return; }
      var text = "Bonjour ARCHICIV INGÉNIERIE,\nJe m'appelle " + name.value.trim() + ".\nType de projet : " + type.value + "\nContact : " + c + "\n\n" + msg.value.trim();
      var url = WA + "?text=" + encodeURIComponent(text);
      result.hidden = false;
      result.innerHTML = "Votre message est prêt. <a href=\"" + url + "\" target=\"_blank\" rel=\"noopener\">Ouvrir WhatsApp et l'envoyer</a>";
      result.focus();
      window.open(url, "_blank", "noopener");
    });
  }
})();
