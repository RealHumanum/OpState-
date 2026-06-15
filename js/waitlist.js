/* OpState landing — waitlist capture + tasteful enhancement.
 *
 * Waitlist: every <form data-waitlist> (hero + main) posts to the same Kit
 *   (ConvertKit) form. With JS we submit via fetch and swap in an inline
 *   "you're on the list" success; without JS (or if blocked) the form posts
 *   natively to Kit's hosted confirmation. Either way the signup lands.
 * Plus: scroll-reveal, header elevation on scroll, and a sticky mobile CTA. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Waitlist forms ---------- */
  var forms = document.querySelectorAll("form[data-waitlist]");
  var anySubmitted = false;

  forms.forEach(function (form) {
    var wrap = form.closest("[data-wl]") || form.parentNode;
    var statusEl = form.querySelector("[data-wl-status]");
    var submitBtn = form.querySelector('button[type="submit"]');
    var weekly = form.querySelector('input[name="fields[weekly_updates]"]');
    var notConfigured = form.action.indexOf("__KIT_FORM_ID__") !== -1;

    function setStatus(msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg || "";
      statusEl.className = "wl-status" + (kind ? " " + kind : "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("");

      var emailField = form.querySelector('input[name="email_address"]');
      var email = emailField ? emailField.value.trim() : "";
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus("Please enter a valid email address.", "err");
        if (emailField) emailField.focus();
        return;
      }
      if (notConfigured) {
        setStatus("Waitlist backend isn't connected yet — set your Kit form ID.", "err");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = "Joining…";
      }

      var data = new FormData(form);
      data.set("fields[weekly_updates]", weekly && weekly.checked ? "yes" : "no");

      fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" }, mode: "cors" })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json().catch(function () { return {}; });
        })
        .then(function () {
          anySubmitted = true;
          if (wrap && wrap.classList) wrap.classList.add("is-submitted");
          hideMobileCta();
        })
        .catch(function () {
          // CORS/network hiccup — native submit so the signup still lands.
          form.submit();
        });
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Header elevation ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Sticky mobile CTA ---------- */
  var cta = document.getElementById("mobileCta");
  var hero = document.querySelector(".hero");
  var waitlist = document.getElementById("waitlist");
  var waitlistVisible = false;
  var heroVisible = true;

  function hideMobileCta() { if (cta) cta.classList.remove("show"); }

  if (cta && hero) {
    if ("IntersectionObserver" in window) {
      // Track whether the final waitlist section is on screen.
      if (waitlist) {
        new IntersectionObserver(function (entries) {
          waitlistVisible = entries[0].isIntersecting;
          updateCta();
        }, { threshold: 0.15 }).observe(waitlist);
      }
      // Show the bar once the hero has scrolled away.
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        updateCta();
      }, { threshold: 0 }).observe(hero);
    }
  }
  function updateCta() {
    if (!cta || anySubmitted) return;
    cta.classList.toggle("show", !heroVisible && !waitlistVisible);
  }
})();
