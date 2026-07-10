(() => {
  const modal = document.getElementById("sample-modal");
  const openButtons = document.querySelectorAll(".js-open-sample");
  const closeButtons = modal ? modal.querySelectorAll(".js-close-sample") : [];
  const runButton = document.getElementById("run-sample");
  const sampleStatus = document.getElementById("sample-status");
  const sampleAfter = document.getElementById("sample-after");
  const demoAfterPanel = document.getElementById("demo-after-panel");

  const openModal = () => {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("gm-modal-open");
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gm-modal-open");
    if (sampleAfter) {
      sampleAfter.classList.add("d-none");
      sampleAfter.innerHTML = "";
    }
    if (runButton) {
      runButton.disabled = false;
      runButton.textContent = "Run sample";
    }
    if (sampleStatus) {
      sampleStatus.textContent = "";
    }
  };

  openButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  if (runButton) {
    runButton.addEventListener("click", () => {
      if (!sampleAfter || !demoAfterPanel) return;
      runButton.disabled = true;
      runButton.textContent = "Processing...";
      if (sampleStatus) {
        sampleStatus.textContent = "Processing video on HPC...";
      }

      window.setTimeout(() => {
        sampleAfter.innerHTML = demoAfterPanel.innerHTML;
        sampleAfter.classList.remove("d-none");
        if (sampleStatus) {
          sampleStatus.textContent = "Done. Review the sample output below.";
        }
        runButton.disabled = false;
        runButton.textContent = "Run again";
      }, 2500);
    });
  }

  // --- Shared funnel analytics (surface = 'web'): GA4 for all events; our DB (POST /track)
  // only for the "started" events (begin_quote, begin_signup). Completions (generate_lead,
  // sign_up) are written server-side, so no double count. ---
  var trackEndpoint = "https://portal.getmoved.app/api/v1/track";
  function gmSessionId() {
    try {
      var v = sessionStorage.getItem("gm_session_id");
      if (!v) { v = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10); sessionStorage.setItem("gm_session_id", v); }
      return v;
    } catch (e) { return ""; }
  }
  // Ad attribution captured once per session from the landing URL (gclid/gbraid/wbraid + UTM).
  function gmAttribution() {
    try { var st = sessionStorage.getItem("gm_attribution"); if (st) return JSON.parse(st); } catch (e) {}
    var attr = { gclid: "", source: "", medium: "", campaign: "" };
    try {
      var qs = new URLSearchParams(window.location.search);
      var g = qs.get("gclid") || qs.get("gbraid") || qs.get("wbraid") || "";
      attr.gclid = g;
      attr.source = qs.get("utm_source") || (g ? "google" : "");
      attr.medium = qs.get("utm_medium") || (g ? "cpc" : "");
      attr.campaign = qs.get("utm_campaign") || "";
      if (g || attr.source) sessionStorage.setItem("gm_attribution", JSON.stringify(attr));
    } catch (e) {}
    return attr;
  }
  function gmTrack(eventName, params) {
    params = params || {};
    var attr = gmAttribution();
    var payload = Object.assign({ surface: "web" }, params);
    if (attr.gclid) payload.gclid = attr.gclid;
    if (attr.source) payload.source = attr.source;
    if (attr.medium) payload.medium = attr.medium;
    if (attr.campaign) payload.campaign = attr.campaign;
    if (typeof window.gtag === "function") { window.gtag("event", eventName, payload); }
    if (eventName === "begin_quote" || eventName === "begin_signup") {
      try {
        fetch(trackEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.assign({ event_name: eventName, session_id: gmSessionId() }, payload)),
          keepalive: true,
        }).catch(function () {});
      } catch (e) {}
    }
  }

  // --- Cookie consent banner (Consent Mode v2). Default is 'denied' (set in the <head>),
  // so GA already sends cookieless pings; Accept upgrades to full (cookie) tracking. ---
  (function () {
    var KEY = "gm_cookie_consent";
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    function apply(state) {
      try { localStorage.setItem(KEY, state); } catch (e) {}
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { ad_storage: state, ad_user_data: state, ad_personalization: state, analytics_storage: state });
      }
    }
    if (stored === "granted" || stored === "denied") return; // choice already made
    function mount() {
      if (document.getElementById("gm-cookie-banner")) return;
      var bar = document.createElement("div");
      bar.id = "gm-cookie-banner";
      bar.setAttribute("role", "dialog");
      bar.setAttribute("aria-label", "Cookie consent");
      bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#0f1520;color:#e5e7eb;padding:16px 20px;box-shadow:0 -2px 18px rgba(0,0,0,.4);font-family:inherit;font-size:14px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:center;";
      bar.innerHTML =
        '<span style="max-width:720px;line-height:1.5;">We use cookies to analyze traffic and improve your experience. See our <a href="privacy.html" style="color:#22c55e;text-decoration:underline;">Privacy Policy</a>.</span>' +
        '<span style="display:inline-flex;gap:10px;flex:none;">' +
        '<button type="button" id="gm-cc-reject" style="cursor:pointer;border:1px solid #374151;background:transparent;color:#e5e7eb;padding:9px 18px;border-radius:6px;font-size:14px;">Reject</button>' +
        '<button type="button" id="gm-cc-accept" style="cursor:pointer;border:0;background:#22c55e;color:#04120a;font-weight:700;padding:9px 22px;border-radius:6px;font-size:14px;">Accept</button>' +
        '</span>';
      document.body.appendChild(bar);
      document.getElementById("gm-cc-accept").addEventListener("click", function () { apply("granted"); if (bar.parentNode) bar.parentNode.removeChild(bar); });
      document.getElementById("gm-cc-reject").addEventListener("click", function () { apply("denied"); if (bar.parentNode) bar.parentNode.removeChild(bar); });
    }
    if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
  })();

  // Quick Quote form -> sends via the GetMoved backend API (Amazon SES).
  const quoteForm = document.getElementById("quick-quote-form");
  if (quoteForm) {
    const quoteStatus = document.getElementById("quick-quote-status");
    const quoteSubmit = quoteForm.querySelector(".gm-qq-submit");
    const mailEndpoint = "https://portal.getmoved.app/api/v1/email/quick-quote";

    // begin_quote: fire once per session the first time the visitor focuses the form.
    quoteForm.addEventListener("focusin", function () {
      try { if (sessionStorage.getItem("gm_begin_quote_web")) return; sessionStorage.setItem("gm_begin_quote_web", "1"); } catch (e) {}
      gmTrack("begin_quote", { source: "landing" });
    });

    const setStatus = (message, isError) => {
      if (!quoteStatus) return;
      quoteStatus.textContent = message;
      quoteStatus.classList.toggle("is-error", Boolean(isError));
    };

    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!quoteForm.reportValidity()) {
        return;
      }

      const data = new FormData(quoteForm);
      const payload = {
        fullName: (data.get("full_name") || "").toString().trim(),
        email: (data.get("email") || "").toString().trim(),
        phone: (data.get("phone") || "").toString().trim(),
        moveFrom: (data.get("move_from") || "").toString().trim(),
        moveTo: (data.get("move_to") || "").toString().trim(),
        movingDate: (data.get("moving_date") || "").toString().trim(),
        propertyType: (data.get("property_type") || "").toString().trim(),
        details: (data.get("details") || "").toString().trim(),
        hp: (data.get("hp") || "").toString().trim(), // honeypot (renamed from "website" — Chrome autofilled the old field and falsely tripped the bot filter)
      };
      // Attach ad attribution so the server-side generate_lead row carries gclid/UTM.
      var attribution = gmAttribution();
      payload.gclid = attribution.gclid;
      payload.source = attribution.source;
      payload.medium = attribution.medium;
      payload.campaign = attribution.campaign;

      if (quoteSubmit) {
        quoteSubmit.disabled = true;
        quoteSubmit.textContent = "Sending...";
      }
      setStatus("", false);

      fetch(mailEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Request failed with status " + response.status);
          }
          return response.json().catch(() => ({}));
        })
        .then((result) => {
          if (result && result.success === false) {
            throw new Error(result.message || "Send failed");
          }
          // generate_lead: GA4 only (the DB row is written server-side by the quick-quote endpoint).
          gmTrack("generate_lead", { source: "landing" });
          // Google Ads "Request quote" conversion — fires on successful submit (not click).
          if (typeof window.gtag === "function") {
            // Enhanced Conversions: pass user-entered email/phone; Google hashes them client-side
            // (requires Enhanced Conversions enabled on the Ads conversion action).
            window.gtag("set", "user_data", { email: payload.email, phone_number: payload.phone });
            window.gtag("event", "conversion", {
              send_to: "AW-18301808532/Cd3sCNnGm8scEJTf_ZZE",
              value: 1.0,
              currency: "USD",
            });
          }
          quoteForm.reset();
          setStatus(
            "Thank you! Your request has been sent. Our team will contact you shortly.",
            false
          );
        })
        .catch(() => {
          setStatus(
            "Sorry, something went wrong. Please email us directly at jack@getmoved.app.",
            true
          );
        })
        .finally(() => {
          if (quoteSubmit) {
            quoteSubmit.disabled = false;
            quoteSubmit.textContent = "Submit Request";
          }
        });
    });
  }

  // Register-as-Mover form -> posts to the same backend endpoint as the portal registration.
  const moverForm = document.getElementById("mover-registration-form");
  if (moverForm) {
    const moverStatus = document.getElementById("mover-registration-status");
    const moverSubmit = moverForm.querySelector(".gm-qq-submit");
    const moverEndpoint = "https://portal.getmoved.app/api/v1/mover-registrations";

    const setMoverStatus = function (msg, isError) {
      if (!moverStatus) return;
      moverStatus.textContent = msg;
      moverStatus.style.color = isError ? "#e03131" : "#2f9e44";
    };

    // begin_signup: fire once per session the first time the visitor focuses the form.
    moverForm.addEventListener("focusin", function () {
      try { if (sessionStorage.getItem("gm_begin_signup_web")) return; sessionStorage.setItem("gm_begin_signup_web", "1"); } catch (e) {}
      gmTrack("begin_signup", { source: "landing" });
    });

    var MR_TEXT = ["companyLegalName", "tradingName", "email", "country", "city", "businessAddress", "companyRegistrationNumber", "vatTaxId", "yearsInOperation", "companyWebsite", "regionsCitiesCovered", "maxMovingDistance", "numberOfVansTrucks", "vehicleTypes", "maxLoadCapacity", "numberOfFullTimeMovers", "insuranceCoverage", "liabilityInsuranceAmount"];
    var MR_BOOL = ["residentialMoving", "commercialMoving", "packingServices", "storage", "furnitureDisassembly", "pianoSpecialItems", "internationalRelocation"];

    moverForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!moverForm.reportValidity()) return;
      var data = new FormData(moverForm);
      var payload = {};
      MR_TEXT.forEach(function (k) { payload[k] = (data.get(k) || "").toString().trim(); });
      MR_BOOL.forEach(function (k) { var el = moverForm.querySelector('[name="' + k + '"]'); payload[k] = !!(el && el.checked); });
      // Backend expects a string (it .trim()s it); the portal also joins to a comma string.
      payload.countriesServed = (data.get("countriesServed") || "").toString().trim();
      payload.hp = (data.get("hp") || "").toString().trim();
      payload.utm = { source: "landing" };

      if (moverSubmit) { moverSubmit.disabled = true; moverSubmit.textContent = "Submitting..."; }
      setMoverStatus("", false);

      fetch(moverEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (j) { return { ok: response.ok, j: j }; });
        })
        .then(function (r) {
          if (!r.ok || (r.j && r.j.success === false)) { throw new Error((r.j && (r.j.error || r.j.message)) || "Submission failed"); }
          // sign_up is logged server-side by the endpoint; fire GA4 here for Ads attribution.
          gmTrack("sign_up", { method: "email", source: "landing" });
          moverForm.reset();
          setMoverStatus("Thank you! Your registration has been submitted. Our team will review it and get back to you.", false);
        })
        .catch(function (err) {
          setMoverStatus((err && err.message) || "Sorry, something went wrong. Please try again or email jack@getmoved.app.", true);
        })
        .finally(function () {
          if (moverSubmit) { moverSubmit.disabled = false; moverSubmit.textContent = "Submit Registration"; }
        });
    });
  }

  // Google Maps Places autocomplete for the Move From / Move To fields. Accepts a
  // ZIP code or City, State (US regions only — no street addresses). Exposed on
  // window so the Maps script's `callback=gmInitPlacesAutocomplete` invokes it once ready.
  window.gmInitPlacesAutocomplete = function () {
    if (!(window.google && window.google.maps && window.google.maps.places)) return;
    ["qq-move-from", "qq-move-to"].forEach((id) => {
      const input = document.getElementById(id);
      if (!input || input.dataset.acInit === "1") return;
      input.dataset.acInit = "1";
      try {
        const ac = new google.maps.places.Autocomplete(input, {
          types: ["(regions)"], // cities, states, ZIP/postal codes
          componentRestrictions: { country: ["us"] },
          fields: ["formatted_address", "name"],
        });
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          input.value = (place && (place.formatted_address || place.name)) || input.value;
        });
      } catch (e) {
        /* Maps unavailable — the field still accepts free-typed ZIP / city, state */
      }
      // Don't let Enter (choosing a suggestion) submit the form.
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") e.preventDefault();
      });
    });
  };

  const form = document.getElementById("contact-form");
  const formWrapper = document.getElementById("contact-form-wrapper");
  const successWrapper = document.getElementById("contact-success");
  const submitButton = document.getElementById("submit");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      const formData = new FormData(form);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      const showSuccess = () => {
        if (formWrapper) {
          formWrapper.classList.add("none");
        }
        if (successWrapper) {
          successWrapper.classList.remove("none");
        }
        form.reset();
      };

      const fallback = () =>
        new Promise((resolve) => {
          window.setTimeout(resolve, 800);
        });

      fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Lead endpoint unavailable");
          }
        })
        .then(showSuccess)
        .catch(() => fallback().then(showSuccess))
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Request demo";
          }
        });
    });
  }

  // --- Floating "Get a Quote" button: appears on every page. On pages that contain the
  // quote form it shows only when the form is scrolled out of view (and scrolls to it on
  // click); on pages without the form it stays visible and links to the quote page. ---
  (function () {
    function mountFloatQuote() {
      if (document.getElementById("gm-float-quote")) return;
      var section = document.getElementById("quick-quote");
      var btn = document.createElement("a");
      btn.id = "gm-float-quote";
      btn.href = section ? "#quick-quote" : "free-moving-quote.html";
      btn.setAttribute("aria-label", "Get a free moving quote");
      btn.textContent = "Get a Quote";
      btn.style.cssText =
        "position:fixed;right:20px;bottom:20px;z-index:99998;background:#22c55e;color:#04120a;" +
        "font-weight:700;font-family:inherit;font-size:15px;line-height:1;padding:15px 26px;" +
        "border-radius:999px;box-shadow:0 8px 22px rgba(0,0,0,.28);text-decoration:none;" +
        "display:none;cursor:pointer;transition:opacity .2s,transform .2s;";
      btn.onmouseenter = function () { btn.style.transform = "translateY(-2px)"; };
      btn.onmouseleave = function () { btn.style.transform = "translateY(0)"; };
      if (section) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      document.body.appendChild(btn);

      if (section && "IntersectionObserver" in window) {
        var io = new IntersectionObserver(
          function (entries) {
            var visible = entries[0] && entries[0].isIntersecting;
            btn.style.display = visible ? "none" : "inline-flex";
          },
          { threshold: 0.12 }
        );
        io.observe(section);
      } else {
        btn.style.display = "inline-flex"; // no quote form on this page -> always show
      }
    }
    if (document.body) mountFloatQuote();
    else document.addEventListener("DOMContentLoaded", mountFloatQuote);
  })();
})();
