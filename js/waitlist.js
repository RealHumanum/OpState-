/* Waitlist form — progressive enhancement over a plain Kit (ConvertKit) HTML form.
 *
 * With JS: submit via fetch so the visitor stays on the page and sees an inline
 *   "check your inbox" success (Kit uses double opt-in).
 * Without JS, or if the fetch is blocked: the <form> still posts natively to Kit,
 *   which shows its own hosted confirmation page. Either way, signups are captured.
 *
 * The only thing to configure is the form's `action` URL (the Kit form ID) in index.html. */
(function () {
  "use strict";

  var card = document.getElementById("waitlist-card");
  var form = document.getElementById("waitlist-form");
  var statusEl = document.getElementById("waitlist-status");
  var submitBtn = document.getElementById("waitlist-submit");
  var weekly = document.getElementById("weekly-updates");

  if (!form) return;

  var NOT_CONFIGURED = form.action.indexOf("__KIT_FORM_ID__") !== -1;

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "wl-status" + (kind ? " " + kind : "");
  }

  function showSuccess() {
    if (card) card.classList.add("is-submitted");
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

    if (NOT_CONFIGURED) {
      // Local/dev safety net before the Kit form ID is wired in.
      setStatus(
        "Waitlist backend isn't connected yet — set your Kit form ID in index.html.",
        "err"
      );
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Joining…";
    }

    var data = new FormData(form);
    // Be explicit about the weekly-updates choice so Kit always records yes/no.
    data.set("fields[weekly_updates]", weekly && weekly.checked ? "yes" : "no");

    fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
      mode: "cors",
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json().catch(function () {
          return {};
        });
      })
      .then(function () {
        showSuccess();
      })
      .catch(function () {
        // CORS/network hiccup — fall back to a native submit so the signup still lands.
        form.submit();
      });
  });
})();
