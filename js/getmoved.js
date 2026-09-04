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
  // Infer the acquisition source from the referring site when the inbound link
  // wasn't UTM-tagged (e.g. an untagged Reddit/Nextdoor ad or organic click).
  // UTM/gclid always take priority; this is only a fallback.
  function gmSourceFromReferrer() {
    try {
      var ref = document.referrer || "";
      if (!ref) return "";
      var host = new URL(ref).hostname.toLowerCase().replace(/^www\./, "");
      if (!host || host.indexOf("getmoved.app") !== -1) return ""; // ignore our own site
      var MAP = [
        [/(^|\.)reddit\.com$|(^|\.)redd\.it$/, "reddit"],
        [/(^|\.)nextdoor\.com$/, "nextdoor"],
        [/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.me$/, "facebook"],
        [/(^|\.)instagram\.com$/, "instagram"],
        [/(^|\.)t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, "twitter"],
        [/(^|\.)tiktok\.com$/, "tiktok"],
        [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, "linkedin"],
        [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "youtube"],
        [/(^|\.)google\./, "google"],
        [/(^|\.)bing\.com$/, "bing"],
      ];
      for (var i = 0; i < MAP.length; i++) { if (MAP[i][0].test(host)) return MAP[i][1]; }
      return host; // any other external referrer -> its host
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
      // Fallback to referrer-based source when the link had no UTM/gclid.
      if (!attr.source) {
        var refSrc = gmSourceFromReferrer();
        if (refSrc) { attr.source = refSrc; if (!attr.medium) attr.medium = "referral"; }
      }
      if (g || attr.source) sessionStorage.setItem("gm_attribution", JSON.stringify(attr));
    } catch (e) {}
    return attr;
  }
  // Reddit click id (rdt_cid): captured once per session from the ad-click URL so
  // it can be sent with the server-side CAPI Lead event for attribution.
  function gmRedditClickId() {
    try {
      var qs = new URLSearchParams(window.location.search);
      var cid = qs.get("rdt_cid") || "";
      if (cid) { try { sessionStorage.setItem("gm_rdt_cid", cid); } catch (e) {} return cid; }
      return sessionStorage.getItem("gm_rdt_cid") || "";
    } catch (e) { return ""; }
  }
  function gmUuid() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
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
    if (["begin_quote", "begin_signup", "form_start", "form_step_complete", "form_error", "reveal_step", "partial_lead"].indexOf(eventName) !== -1) {
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

  // --- Meta (Facebook) Pixel + Conversions API helpers ------------------------------
  // Each event fires twice — browser fbq(...,{eventID}) and server CAPI — sharing one
  // event_id so Meta deduplicates. Gated on the SAME cookie consent as gtag: fire
  // unless the visitor explicitly declined (gm_cookie_consent === 'denied'). The base
  // pixel + PageView live inline in each page's <head>. Flip the check to
  // === 'granted' for strict opt-in before an EU rollout.
  var GM_META_CAPI_ENDPOINT = "https://portal.getmoved.app/api/v1/meta/event";
  function gmMetaConsentOk() {
    try { return localStorage.getItem("gm_cookie_consent") !== "denied"; } catch (e) { return true; }
  }
  function gmGetFbCookies() {
    var read = function (n) {
      try {
        var m = document.cookie.split("; ").find(function (c) { return c.indexOf(n + "=") === 0; });
        return m ? m.split("=")[1] : null;
      } catch (e) { return null; }
    };
    return { fbp: read("_fbp"), fbc: read("_fbc") };
  }
  // Capture ?fbclid= into an _fbc cookie on landing (belt-and-suspenders; fbevents.js
  // also does this once loaded). Skipped entirely when consent is denied.
  function gmCaptureFbclid() {
    if (!gmMetaConsentOk()) return;
    try {
      var fbclid = new URLSearchParams(window.location.search).get("fbclid");
      if (fbclid && document.cookie.indexOf("_fbc=") === -1) {
        document.cookie = "_fbc=fb.1." + Date.now() + "." + fbclid + "; max-age=7776000; path=/; SameSite=Lax";
      }
    } catch (e) {}
  }
  // Best-effort parse of "City, ST 12345" -> { city, state, zip }.
  function gmParseLoc(s) {
    s = String(s || "").trim();
    var out = { city: "", state: "", zip: "" };
    var zipM = s.match(/(\d{5})(?:-\d{4})?\s*$/); if (zipM) out.zip = zipM[1];
    var stM = s.match(/,\s*([A-Za-z]{2})\b(?:\s+\d{5}(?:-\d{4})?)?\s*$/); if (stM) out.state = stM[1];
    out.city = s.split(",")[0].trim();
    return out;
  }
  // Bucketed move-value estimate (USD) for Meta value-based optimisation. Crude on
  // purpose — a rough bucket beats a constant. size: Studio/1BR/2BR/3BR+.
  //   studio/1BR local  -> 800    2BR/3BR+ local  -> 2000
  //   studio/1BR long   -> 3500   2BR/3BR+ long   -> 7000
  function gmMoveValue(propertyType, moveType) {
    var s = String(propertyType || "").toLowerCase();
    var big = s.indexOf("2br") !== -1 || s.indexOf("3br") !== -1;
    var long = moveType === "long_distance";
    return long ? (big ? 7000 : 3500) : (big ? 2000 : 800);
  }
  // Fire a Meta event: browser fbq + server CAPI relay, sharing one event_id.
  function gmFireMeta(eventName, customData, userData) {
    if (!gmMetaConsentOk()) return null;
    var eventId = gmUuid();
    try { if (typeof window.fbq === "function") window.fbq("track", eventName, customData || {}, { eventID: eventId }); } catch (e) {}
    try {
      var ud = Object.assign({}, userData || {}, gmGetFbCookies());
      fetch(GM_META_CAPI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName: eventName, eventId: eventId, eventSourceUrl: window.location.href, userData: ud, customData: customData || {} }),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
    return eventId;
  }
  // Run on load: capture fbclid, and fire ViewContent on any page that hosts a quote form.
  gmCaptureFbclid();
  if (document.getElementById("qq-step1-form") || document.getElementById("quick-quote-form")) {
    gmFireMeta("ViewContent", { content_name: "Quote Request", content_category: "moving_quote" });
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
    const quoteSubmit = quoteForm.querySelector('button[type="submit"]');
    const mailEndpoint = "https://portal.getmoved.app/api/v1/email/quick-quote";

    const setStatus = (message, isError) => {
      if (!quoteStatus) return;
      quoteStatus.textContent = message || "";
      quoteStatus.classList.toggle("is-error", Boolean(isError));
    };
    const clearErrors = () => {
      quoteForm.querySelectorAll(".gm-qq-err").forEach((el) => { el.textContent = ""; el.classList.remove("is-hint"); });
      quoteForm.querySelectorAll(".gm-qq-field.has-error").forEach((el) => el.classList.remove("has-error"));
    };
    const showError = (input, key, msg, focus) => {
      const field = input.closest(".gm-qq-field") || input.parentElement;
      if (field) field.classList.add("has-error");
      const errEl = quoteForm.querySelector('[data-err-for="' + key + '"]');
      if (errEl) errEl.textContent = msg;
      if (focus) {
        try { input.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
        try { input.focus({ preventScroll: true }); } catch (e2) { try { input.focus(); } catch (e3) {} }
      }
    };
    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    // form_start (+ begin_quote for the existing dashboard): once per session on first focus.
    quoteForm.addEventListener("focusin", function () {
      try { if (sessionStorage.getItem("gm_form_start")) return; sessionStorage.setItem("gm_form_start", "1"); } catch (e) {}
      gmTrack("begin_quote", { source: "landing" });
      gmTrack("form_start", { source: "landing" });
    });

    // Contact: two separate fields — Email (above) and Phone (below), BOTH required.
    // (Replaced the old "Contact me by" Phone/Email toggle.)

    // Optional details expander.
    const moreBtn = quoteForm.querySelector("[data-more]");
    const detailsBox = quoteForm.querySelector("[data-details]");
    if (moreBtn && detailsBox) {
      moreBtn.addEventListener("click", () => {
        const hidden = detailsBox.classList.toggle("is-hidden");
        moreBtn.classList.toggle("is-open", !hidden);
      });
    }

    // Soft out-of-area hint (we currently serve NY & NJ) — informational, never blocks submit.
    const zipRegion = (v) => { const m = String(v || "").match(/\b(\d{5})\b/); if (!m) return null; const n = parseInt(m[1].slice(0, 3), 10); if (n >= 100 && n <= 149) return "NY"; if (n >= 70 && n <= 89) return "NJ"; return "other"; };
    ["move_from", "move_to"].forEach((nm) => {
      const el = quoteForm.querySelector('[name="' + nm + '"]');
      if (!el) return;
      el.addEventListener("blur", () => {
        const errEl = quoteForm.querySelector('[data-err-for="' + nm + '"]');
        const fld = el.closest(".gm-qq-field");
        if (!errEl || (fld && fld.classList.contains("has-error"))) return; // never override a real error
        if (zipRegion(el.value) === "other") { errEl.textContent = "Heads up: we currently serve New York & New Jersey."; errEl.classList.add("is-hint"); }
        else if (errEl.classList.contains("is-hint")) { errEl.textContent = ""; errEl.classList.remove("is-hint"); }
      });
    });

    // Size dropdown from the portal (public); static fallback so it is never empty.
    const sizeSelect = document.getElementById("qq-size");
    if (sizeSelect) {
      const SIZE_FALLBACK = ["Room or Less - 153 CF", "Studio - 297 CF", "Small 1 Bedroom - 323 CF", "Large 1 Bedroom - 452 CF", "Small 2 Bedroom - 650 CF", "Large 2 Bedroom - 689 CF", "2 Bedroom House - 932 CF", "3 Bedroom Apartment - 1047 CF", "3 Bedroom House - 1199 CF", "4+ Bedroom House - 1478 CF"];
      const addOpt = (label) => { if (!label) return; const o = document.createElement("option"); o.value = label; o.textContent = label; sizeSelect.appendChild(o); };
      const ensure = () => { if (sizeSelect.options.length <= 1) SIZE_FALLBACK.forEach(addOpt); };
      fetch("https://portal.getmoved.app/api/v1/size-of-move?active=true")
        .then((r) => (r.ok ? r.json() : null))
        .then((body) => {
          const rows = Array.isArray(body) ? body : (body && Array.isArray(body.data) ? body.data : []);
          rows.filter((row) => row && (row.is_active === undefined || row.is_active))
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .forEach((row) => addOpt(String((row && (row.display_name || row.name)) || "").trim()));
          ensure();
        })
        .catch(ensure);
    }

    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors();

      // Step 2 (contact): first name, phone, email required. Route/date/size come
      // from step 1 as hidden fields.
      const firstInput = quoteForm.querySelector('[name="first_name"]');
      const emailInput = quoteForm.querySelector('[name="email"]');
      const phoneInput = quoteForm.querySelector('[name="phone"]');
      const errors = [];
      if (firstInput && !firstInput.value.trim()) errors.push([firstInput, "first_name", "Enter your first name"]);
      if (phoneInput) {
        const pv = phoneInput.value.trim();
        if (!pv) errors.push([phoneInput, "phone", "Enter your phone number"]);
      }
      if (emailInput) {
        const ev = emailInput.value.trim();
        if (!ev) errors.push([emailInput, "email", "Enter your email address"]);
        else if (!emailOk(ev)) errors.push([emailInput, "email", "Enter a valid email address"]);
      }
      if (errors.length) {
        errors.forEach((e, i) => showError(e[0], e[1], e[2], i === 0));
        gmTrack("form_error", { source: "landing", field: errors[0][1] });
        setStatus("Please complete the highlighted fields.", true);
        return;
      }

      gmTrack("form_step_complete", { source: "landing", step: 1, name: "essentials" });

      const data = new FormData(quoteForm);
      const payload = {
        fullName: (data.get("first_name") || data.get("full_name") || "").toString().trim(),
        email: (data.get("email") || "").toString().trim(),
        phone: (data.get("phone") || "").toString().trim(),
        moveFrom: (data.get("move_from") || "").toString().trim(),
        moveTo: (data.get("move_to") || "").toString().trim(),
        movingDate: (data.get("moving_date") || "").toString().trim(),
        propertyType: (data.get("property_type") || "").toString().trim(),
        details: (data.get("details") || "").toString().trim(),
        video_url: (data.get("video_url") || "").toString().trim(),
        hp: (data.get("hp") || "").toString().trim(),
      };
      var attribution = gmAttribution();
      payload.gclid = attribution.gclid;
      payload.source = attribution.source;
      payload.medium = attribution.medium;
      payload.campaign = attribution.campaign;
      // Reddit CAPI attribution: pass the ad-click id and a shared conversion_id
      // so the server-side Lead event dedupes against the browser pixel below.
      var rdtConversionId = gmUuid();
      payload.rdt_cid = gmRedditClickId();
      payload.reddit_conversion_id = rdtConversionId;

      // Link the step-1 partial lead (if we captured its id) so the backend can
      // merge it into this full lead precisely, even if the phone was edited.
      try {
        var partialId1 = sessionStorage.getItem("gm_qq_partial_id");
        if (partialId1) payload.partial_lead_id = Number(partialId1) || null;
      } catch (e) {}

      // TEST AI handoff: if the visitor analyzed a walkthrough on test-ai.html,
      // carry its S3 video + detected inventory into the quote. The backend
      // attaches the items to the created Request (see sendQuickQuote).
      try {
        if (!payload.video_url) payload.video_url = sessionStorage.getItem("gm_testai_video_url") || "";
        var tinv = JSON.parse(sessionStorage.getItem("gm_testai_inventory") || "null");
        if (Array.isArray(tinv) && tinv.length) payload.inventory = tinv.slice(0, 100);
      } catch (e) {}

      if (quoteSubmit) { quoteSubmit.disabled = true; quoteSubmit.textContent = "Sending..."; }
      setStatus("", false);

      fetch(mailEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then((response) => { if (!response.ok) { throw new Error("Request failed with status " + response.status); } return response.json().catch(() => ({})); })
        .then((result) => {
          if (result && result.success === false) { throw new Error(result.message || "Send failed"); }
          gmTrack("generate_lead", { source: "landing" });
          // OpenAI Ads conversion — same trigger as GA4 generate_lead (confirmed
          // backend success only; never on partial / quote_step_1).
          if (window.oaiq) {
            oaiq("measure", "lead_created", { type: "customer_action" });
          }
          // Same conversion_id as the server-side CAPI event so Reddit dedupes them.
          if (typeof window.rdt === "function") { window.rdt("track", "Lead", { conversion_id: rdtConversionId }); }
          if (typeof window.ndp === "function") { window.ndp("track", "LEAD"); }
          if (typeof window.gtag === "function") {
            window.gtag("set", "user_data", { email: payload.email, phone_number: payload.phone });
            window.gtag("event", "conversion", { send_to: "AW-18301808532/Cd3sCNnGm8scEJTf_ZZE", value: 1.0, currency: "USD" });
            // Request quote (1) conversion — fires on successful quote submit.
            window.gtag("event", "conversion", { send_to: "AW-18301808532/tyknCISIsN8cEJTf_ZZE" });
          }
          // Meta Lead — browser Pixel + server CAPI (shared event_id), fired only on
          // confirmed backend success (the quote is persisted).
          try {
            var _mLoc = gmParseLoc(payload.moveFrom);
            var _oState = (_mLoc.state || "").toLowerCase();
            var _dState = (gmParseLoc(payload.moveTo).state || "").toLowerCase();
            // Long-distance only when origin/destination are KNOWN different states;
            // unknown or same-state defaults to local (conservative).
            var _mType = (_oState && _dState && _oState !== _dState) ? "long_distance" : "local";
            var _mValue = gmMoveValue(payload.propertyType, _mType); // bucketed $ estimate
            gmFireMeta("Lead", { content_name: "Quote Request", content_category: _mType, value: _mValue, currency: "USD" }, {
              email: payload.email, phone: payload.phone, firstName: payload.fullName, lastName: "",
              city: _mLoc.city, state: _mLoc.state, zip: _mLoc.zip
            });
          } catch (e) {}
          quoteForm.reset();
          // The TEST AI inventory is now attached to the created Request — clear the handoff.
          try { sessionStorage.removeItem("gm_testai_video_url"); sessionStorage.removeItem("gm_testai_inventory"); } catch (e) {}
          setStatus("Thank you! Redirecting…", false);
          // P0.4: the thank-you state is its own URL (quote-received.html), not an inline
          // swap. Lead has already fired here on confirmed success; the thank-you page
          // fires no Lead, so a direct load or refresh counts nothing. The short delay
          // lets the fbq beacon flush (the CAPI relay uses keepalive and survives anyway).
          setTimeout(function () { window.location.href = "quote-received.html"; }, 400);
        })
        .catch(() => { setStatus("Sorry, something went wrong. Please email us directly at sales@getmoved.app.", true); })
        .finally(() => { if (quoteSubmit) { quoteSubmit.disabled = false; quoteSubmit.textContent = quoteSubmit.getAttribute("data-orig-label") || "Compare My Free Quotes"; } });
    });
    if (quoteSubmit && !quoteSubmit.getAttribute("data-orig-label")) {
      quoteSubmit.setAttribute("data-orig-label", quoteSubmit.textContent);
    }

    // ---- Quote page (step 2) extras: prefill route from step 1 + video upload -------------
    // Present only on quote.html (the elements don't exist on other pages).
    (function () {
      // Prefill Pick up / Delivery from ?from=&to= (with sessionStorage fallback).
      try {
        var qs = new URLSearchParams(window.location.search);
        var fromV = (qs.get("from") || sessionStorage.getItem("gm_qq_from") || "").trim();
        var toV = (qs.get("to") || sessionStorage.getItem("gm_qq_to") || "").trim();
        var dateV = (qs.get("date") || sessionStorage.getItem("gm_qq_date") || "").trim();
        var sizeV = (qs.get("size") || sessionStorage.getItem("gm_qq_size") || "").trim();
        var setHidden = function (nm, val) { var el = quoteForm.querySelector('[name="' + nm + '"]'); if (el && val) el.value = val; };
        setHidden("move_from", fromV);
        setHidden("move_to", toV);
        setHidden("moving_date", dateV);
        setHidden("property_type", sizeV);
        // Step-1 contact (email + phone) -> prefill the hidden step-2 fields.
        // If someone lands here directly with no step-1 data, un-hide the
        // contact block so the form still works standalone.
        try {
          var s1Email = (sessionStorage.getItem("gm_qq_email") || "").trim();
          var s1Phone = (sessionStorage.getItem("gm_qq_phone") || "").trim();
          var emTarget = quoteForm.querySelector('[name="email"]');
          var phTarget = quoteForm.querySelector('[name="phone"]');
          if (emTarget && s1Email && !emTarget.value) emTarget.value = s1Email;
          if (phTarget && s1Phone && !phTarget.value) phTarget.value = s1Phone;
          if (!s1Email || !s1Phone) {
            var fb = document.getElementById("qq-contact-fallback");
            if (fb) fb.style.display = "";
          }
        } catch (e) {}

        // Email typo helper (soft "did you mean", never a hard block).
        try {
          var emEl2 = quoteForm.querySelector('[name="email"]');
          if (emEl2) {
            var TYPOS = { gmial: "gmail", gmai: "gmail", gamil: "gmail", hotmial: "hotmail", hotmal: "hotmail", yaho: "yahoo", yahooo: "yahoo", outlok: "outlook" };
            emEl2.addEventListener("blur", function () {
              var errEl2 = quoteForm.querySelector('[data-err-for="email"]');
              if (!errEl2 || errEl2.classList.contains("has-error")) return;
              var v2 = (emEl2.value || "").trim().toLowerCase();
              var m2 = /@([a-z0-9-]+)\./.exec(v2);
              if (m2 && TYPOS[m2[1]]) {
                errEl2.textContent = "Did you mean " + v2.replace("@" + m2[1] + ".", "@" + TYPOS[m2[1]] + ".") + "?";
                errEl2.classList.add("is-hint");
              } else if (errEl2.classList.contains("is-hint")) {
                errEl2.textContent = "";
                errEl2.classList.remove("is-hint");
              }
            });
          }
        } catch (e) {}
        // Summary of the move details collected in step 1.
        var sum = document.getElementById("qq-summary");
        if (sum && (fromV || toV)) {
          var parts = ['<strong>' + (fromV || "?") + '</strong> &rarr; <strong>' + (toV || "?") + '</strong>'];
          if (dateV) parts.push(dateV);
          if (sizeV) parts.push(sizeV);
          sum.innerHTML = parts.join(' &middot; ');
        }
      } catch (e) {}

      var vBtn = document.getElementById("qq-video-btn");
      var vFile = document.getElementById("qq-video-file");
      var vUrl = document.getElementById("qq-video-url");
      if (!vBtn || !vFile || !vUrl) return;
      var vProg = document.getElementById("qq-video-prog");
      var vBar = document.getElementById("qq-video-bar");
      var vDone = document.getElementById("qq-video-done");
      var vErr = document.getElementById("qq-video-err");
      var uploading = false;

      var setVErr = function (msg) { if (vErr) vErr.textContent = msg || ""; };

      vBtn.addEventListener("click", function () { vFile.click(); });
      vFile.addEventListener("change", function () {
        var file = vFile.files && vFile.files[0];
        if (!file) return;
        setVErr("");
        if (file.size > 500 * 1024 * 1024) { setVErr("Video is too large (max 500MB). Try a shorter recording."); vFile.value = ""; return; }

        var fd = new FormData();
        fd.append("file", file, file.name || "walkthrough.mp4");
        fd.append("folder", "leads/videos");

        uploading = true;
        vUrl.value = "";
        if (vProg) vProg.style.display = "block";
        if (vBar) vBar.style.width = "0%";
        if (vDone) vDone.style.display = "none";
        vBtn.disabled = true;
        vBtn.innerHTML = '<i class="ti-reload"></i> Uploading…';

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://portal.getmoved.app/api/v1/s3/upload");
        xhr.upload.onprogress = function (ev) {
          if (ev.lengthComputable && vBar) vBar.style.width = Math.round((ev.loaded / ev.total) * 100) + "%";
        };
        xhr.onload = function () {
          uploading = false;
          vBtn.disabled = false;
          var url = "";
          try {
            var body = JSON.parse(xhr.responseText || "{}");
            url = (body.data && (body.data.url || body.data.Location)) || body.url || "";
          } catch (e) {}
          if (xhr.status >= 200 && xhr.status < 300 && url) {
            vUrl.value = url;
            if (vBar) vBar.style.width = "100%";
            if (vDone) { vDone.textContent = "✓ " + (file.name || "Video") + " uploaded — movers will quote your exact move"; vDone.style.display = "block"; }
            vBtn.innerHTML = '<i class="ti-video-camera"></i> Replace video';
            gmTrack("video_uploaded", { source: "landing" });
            gmFireMeta("CompleteRegistration", { content_name: "AI Video Walkthrough", content_category: "ai_video_walkthrough" });
            if (quoteSubmit) quoteSubmit.textContent = "Send & Get My Precise Quotes";
          } else {
            if (vProg) vProg.style.display = "none";
            vBtn.innerHTML = '<i class="ti-video-camera"></i> Upload video';
            setVErr("Upload failed — please try again, or submit without the video.");
          }
        };
        xhr.onerror = function () {
          uploading = false;
          vBtn.disabled = false;
          if (vProg) vProg.style.display = "none";
          vBtn.innerHTML = '<i class="ti-video-camera"></i> Upload video';
          setVErr("Upload failed — please try again, or submit without the video.");
        };
        xhr.send(fd);
      });

      // Don't let the form submit mid-upload (the video URL would be lost).
      quoteForm.addEventListener("submit", function (ev) {
        if (uploading) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          setVErr("Your video is still uploading — one moment…");
        }
      }, true);
    })();
  }

  // Quick-quote STEP 1 (homepage hero): locations only -> quote.html with them pre-filled.
  const step1Form = document.getElementById("qq-step1-form");
  if (step1Form) {
    // --- data-progressive pages (all step-1 landing pages): all four fields are
    // ALWAYS visible — no disclosure, no reveal animation, no "change" summary.
    // The flag still gates the extras added with that pass: early partial on
    // email blur, inline blur validation, and form_start on first focus.
    // HARD CONSTRAINT: no ad pixel moves — Meta Lead + CAPI, gtag conversions,
    // Reddit Lead and Nextdoor LEAD stay exclusively on the step-2 final submit;
    // InitiateCheckout stays on the step-1 submit below.
    var progressive = step1Form.getAttribute("data-progressive") === "1";
    var qq1FromEl = step1Form.querySelector('[name="move_from"]');

    if (progressive && qq1FromEl) {
      // form_start: first interaction with any field, once per session.
      step1Form.addEventListener("focusin", function () {
        try { if (sessionStorage.getItem("gm_form_start")) return; sessionStorage.setItem("gm_form_start", "1"); } catch (e) {}
        gmTrack("begin_quote", { source: "landing" });
        gmTrack("form_start", { source: "landing" });
      });
    }

    // Partial lead writer — the server upserts on the lowercased email (24h window).
    function qq1SendPartial(emailV, phoneE164) {
      try {
        var attributionP = gmAttribution();
        var toElP = step1Form.querySelector('[name="move_to"]');
        fetch("https://portal.getmoved.app/api/v1/leads/partial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            move_from: ((qq1FromEl && qq1FromEl.value) || "").trim(),
            move_to: ((toElP && toElP.value) || "").trim(),
            email: emailV,
            phone: phoneE164 || "",
            source: attributionP.source,
            medium: attributionP.medium,
            campaign: attributionP.campaign,
          }),
        })
          .then(function (r) { return r.json().catch(function () { return {}; }); })
          .then(function (pr) {
            try { if (pr && pr.data && pr.data.id) sessionStorage.setItem("gm_qq_partial_id", String(pr.data.id)); } catch (e) {}
          })
          .catch(function () {});
      } catch (e) {}
    }

    // Email: inline validation + typo hint + EARLY partial (valid email + blur ->
    // POST /leads/partial, at most once per distinct email per session — whoever
    // abandons at the phone field is still in the database).
    (function () {
      var em1 = step1Form.querySelector('[name="email"]');
      if (!em1) return;
      var TYPOS1 = { gmial: "gmail", gmai: "gmail", gamil: "gmail", hotmial: "hotmail", hotmal: "hotmail", yaho: "yahoo", yahooo: "yahoo", outlok: "outlook" };
      var partialTimer = null;
      em1.addEventListener("blur", function () {
        var errEl1 = step1Form.querySelector('[data-err-for="email"]');
        var fld1 = em1.closest(".gm-qq-field");
        var v1 = (em1.value || "").trim().toLowerCase();
        var valid1 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v1);
        // Inline format error on blur (progressive form), not only on submit.
        if (progressive && errEl1) {
          if (v1 && !valid1) {
            if (fld1) fld1.classList.add("has-error");
            errEl1.classList.remove("is-hint");
            errEl1.textContent = "Enter a valid email address.";
            return;
          }
          if (fld1) fld1.classList.remove("has-error");
          if (!errEl1.classList.contains("is-hint")) errEl1.textContent = "";
        }
        // Soft "did you mean …?" for top-domain typos — a suggestion, never a block.
        if (errEl1) {
          var m1 = /@([a-z0-9-]+)\./.exec(v1);
          if (m1 && TYPOS1[m1[1]]) {
            errEl1.textContent = "Did you mean " + v1.replace("@" + m1[1] + ".", "@" + TYPOS1[m1[1]] + ".") + "?";
            errEl1.classList.add("is-hint");
          } else if (errEl1.classList.contains("is-hint")) {
            errEl1.textContent = "";
            errEl1.classList.remove("is-hint");
          }
        }
        // Early partial: debounced, once per distinct email per session.
        if (progressive && valid1) {
          clearTimeout(partialTimer);
          partialTimer = setTimeout(function () {
            var sent = [];
            try { sent = JSON.parse(sessionStorage.getItem("gm_qq_partials_sent") || "[]"); } catch (e) {}
            if (sent.indexOf(v1) !== -1) return;
            sent.push(v1);
            try { sessionStorage.setItem("gm_qq_partials_sent", JSON.stringify(sent)); } catch (e) {}
            try { sessionStorage.setItem("gm_qq_email", v1); } catch (e) {}
            qq1SendPartial(v1, "");
            gmTrack("partial_lead", { source: "landing", has_email: true });
            // OpenAI Ads event — inherits the once-per-distinct-email-per-session
            // guard of this block, same cadence as the GA4 event above.
            if (window.oaiq) {
              oaiq("measure", "registration_completed", { type: "customer_action" });
            }
          }, 400);
        }
      });
      // Phone: inline error on blur ("Enter a 10-digit US phone number.").
      var ph1v = step1Form.querySelector('[name="phone"]');
      if (progressive && ph1v) {
        ph1v.addEventListener("blur", function () {
          var errP = step1Form.querySelector('[data-err-for="phone"]');
          var fldP = ph1v.closest(".gm-qq-field");
          if (!errP) return;
          var dP = (ph1v.value || "").replace(/\D/g, "");
          if (dP.length === 11 && dP.charAt(0) === "1") dP = dP.slice(1);
          if (ph1v.value.trim() && dP.length !== 10) {
            if (fldP) fldP.classList.add("has-error");
            errP.textContent = "Enter a 10-digit US phone number.";
          } else {
            if (fldP) fldP.classList.remove("has-error");
            errP.textContent = "";
          }
        });
      }
    })();
    step1Form.addEventListener("submit", function (event) {
      event.preventDefault();
      var fromEl = step1Form.querySelector('[name="move_from"]');
      var toEl = step1Form.querySelector('[name="move_to"]');
      var showErr = function (el, key, msg) {
        var fld = el.closest(".gm-qq-field");
        if (fld) fld.classList.add("has-error");
        var errEl = step1Form.querySelector('[data-err-for="' + key + '"]');
        if (errEl) errEl.textContent = msg;
      };
      step1Form.querySelectorAll(".gm-qq-err").forEach(function (el) { el.textContent = ""; });
      step1Form.querySelectorAll(".gm-qq-field.has-error").forEach(function (el) { el.classList.remove("has-error"); });
      var fromV = (fromEl && fromEl.value || "").trim();
      var toV = (toEl && toEl.value || "").trim();
      var dateEl = step1Form.querySelector('[name="moving_date"]');
      var flexEl = step1Form.querySelector('[name="flexible"]');
      var sizeEl = step1Form.querySelector('[name="property_type"]');
      var dateV = flexEl && flexEl.checked ? "I'm flexible" : ((dateEl && dateEl.value || "").trim());
      var sizeV = (sizeEl && sizeEl.value || "").trim();
      // Step 1 captures BOTH contacts: email (account identity, the dedup key)
      // and phone (so a mover can confirm a missing detail). An abandoned step 2
      // still leaves a usable partial lead — followed up by EMAIL only.
      var email1El = step1Form.querySelector('[name="email"]');
      var email1V = (email1El && email1El.value || "").trim().toLowerCase();
      var email1Valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email1V);
      var phone1El = step1Form.querySelector('[name="phone"]');
      var phone1Raw = (phone1El && phone1El.value || "").trim();
      var phone1Digits = phone1Raw.replace(/\D/g, "");
      // Accept 10 digits, or 11 starting with 1; normalize to E.164 (+1XXXXXXXXXX).
      if (phone1Digits.length === 11 && phone1Digits.charAt(0) === "1") phone1Digits = phone1Digits.slice(1);
      var phone1Valid = phone1Digits.length === 10;
      var phone1E164 = phone1Valid ? "+1" + phone1Digits : "";
      if (!fromV) { showErr(fromEl, "move_from", "Enter your pick up city or ZIP"); }
      if (!toV) { showErr(toEl, "move_to", "Enter your delivery city or ZIP"); }
      if (email1El && !email1Valid) { showErr(email1El, "email", "Enter a valid email address."); }
      if (phone1El && !phone1Valid) { showErr(phone1El, "phone", "Enter a 10-digit US phone number."); }
      if (!fromV || !toV || (email1El && !email1Valid) || (phone1El && !phone1Valid)) return;

      // Capture the partial lead NOW (fire-and-forget, keepalive survives the redirect).
      // HARD CONSTRAINT: no Meta/Reddit/Nextdoor/gtag conversion events here — those stay
      // bound to the final step-2 submit so ad algorithms optimize for full leads.
      if (email1Valid) {
        try {
          var attribution1 = gmAttribution();
          fetch("https://portal.getmoved.app/api/v1/leads/partial", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({
              move_from: fromV,
              move_to: toV,
              email: email1V,
              phone: phone1E164,
              source: attribution1.source,
              medium: attribution1.medium,
              campaign: attribution1.campaign,
            }),
          })
            .then(function (r) { return r.json().catch(function () { return {}; }); })
            .then(function (pr) {
              // Best-effort: remember the partial id so step 2 can merge exactly.
              try { if (pr && pr.data && pr.data.id) sessionStorage.setItem("gm_qq_partial_id", String(pr.data.id)); } catch (e) {}
            })
            .catch(function () {});
          sessionStorage.setItem("gm_qq_email", email1V);
          sessionStorage.setItem("gm_qq_phone", phone1E164);
        } catch (e) {}
        gmTrack("quote_step_1", { source: "landing", has_email: true, has_phone: true });
        // OpenAI Ads mid-funnel event — same trigger and cadence as the GA4 event above.
        if (window.oaiq) {
          oaiq("measure", "checkout_started", { type: "contents" });
        }
      }
      try {
        if (!sessionStorage.getItem("gm_form_start")) {
          sessionStorage.setItem("gm_form_start", "1");
          gmTrack("begin_quote", { source: "landing" });
          gmTrack("form_start", { source: "landing" });
        }
        sessionStorage.setItem("gm_qq_from", fromV);
        sessionStorage.setItem("gm_qq_to", toV);
        sessionStorage.setItem("gm_qq_date", dateV);
        sessionStorage.setItem("gm_qq_size", sizeV);
      } catch (e) {}
      gmTrack("form_step_complete", { source: "landing", step: 1, name: "move_details" });
      // Meta InitiateCheckout — step 1 (addresses + date) accepted. Fire it, THEN let the
      // browser Pixel beacon flush before navigating. An immediate redirect was discarding
      // the queued fbq call on unload (fbevents.js may not have replayed the queue yet),
      // leaving only the server (CAPI) event — which is why the IC count looked stuck.
      // ~300ms is imperceptible; the CAPI relay uses keepalive and survives regardless.
      var _step2Url = "quote.html?from=" + encodeURIComponent(fromV) + "&to=" + encodeURIComponent(toV) +
        (dateV ? "&date=" + encodeURIComponent(dateV) : "") + (sizeV ? "&size=" + encodeURIComponent(sizeV) : "");
      gmFireMeta("InitiateCheckout", { content_name: "Quote Request", content_category: "quote_form_step1" }, gmParseLoc(fromV));
      setTimeout(function () { window.location.href = _step2Url; }, 300);
    });
  }

  // Ad-matched headline (spec fix 01): "-neighborhood" ad variants get a
  // neighborhood-flavored H1 on the quote landing. Display-only, no tracking impact.
  try {
    var utmContentV = new URLSearchParams(window.location.search).get("utm_content") || "";
    if (/-neighborhood/.test(utmContentV)) {
      var adH1 = document.getElementById("qq-hero-h1");
      var adH1m = document.getElementById("qq-hero-h1-mobile");
      var adTxt = "Moving out of your neighborhood? Get free quotes.";
      if (adH1) adH1.textContent = adTxt;
      if (adH1m) adH1m.textContent = adTxt;
    }
  } catch (e) {}

  // call_click (spec fix 03/06): measure tap-to-call separately. GA4 + funnel
  // mirror only — deliberately NOT a Meta/Nextdoor/Reddit conversion.
  document.querySelectorAll('a[href^="tel:"]').forEach(function (telA) {
    telA.addEventListener("click", function () {
      gmTrack("call_click", { source: "landing", href: telA.getAttribute("href") || "" });
      try { if (typeof window.gtag === "function") window.gtag("event", "call_click", { link_url: telA.getAttribute("href") || "" }); } catch (e) {}
    });
  });

  // Register-as-Mover form -> posts to the same backend endpoint as the portal registration.
  // Pre-launch city landing pages: waitlist email capture (no quote flow, no Meta Lead).
  var waitlistForm = document.getElementById("waitlist-form");
  if (waitlistForm) {
    var wlStatus = document.getElementById("waitlist-status");
    var wlSubmit = waitlistForm.querySelector('button[type="submit"]');
    var wlEndpoint = "https://portal.getmoved.app/api/v1/email/waitlist";
    if (wlSubmit && !wlSubmit.getAttribute("data-orig-label")) wlSubmit.setAttribute("data-orig-label", wlSubmit.textContent);
    waitlistForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(waitlistForm);
      var email = (data.get("email") || "").toString().trim();
      var name = (data.get("name") || "").toString().trim();
      var city = (data.get("city") || waitlistForm.getAttribute("data-city") || "").toString().trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (wlStatus) { wlStatus.textContent = "Please enter a valid email address."; wlStatus.classList.add("is-error"); }
        return;
      }
      if (wlSubmit) { wlSubmit.disabled = true; wlSubmit.textContent = "Signing up…"; }
      if (wlStatus) { wlStatus.textContent = ""; wlStatus.classList.remove("is-error"); }
      fetch(wlEndpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ email: email, name: name, city: city, hp: (data.get("hp") || "").toString() }),
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (res && res.success === false) throw new Error(res.error || "Signup failed");
          // GA/funnel only — a pre-launch waitlist signup is NOT a Meta Lead conversion.
          gmTrack("generate_lead", { source: "waitlist", city: city });
          // No oaiq lead_created here: "Quote Lead" means a NY/NJ moving-quote
          // request only — a pre-launch waitlist signup stays GA4-only.
          waitlistForm.reset();
          if (wlStatus) { wlStatus.textContent = "You're on the list! We'll email you the moment GetMoved launches in " + (city || "your city") + "."; wlStatus.classList.remove("is-error"); }
        })
        .catch(function () { if (wlStatus) { wlStatus.textContent = "Sorry, something went wrong. Please try again."; wlStatus.classList.add("is-error"); } })
        .finally(function () { if (wlSubmit) { wlSubmit.disabled = false; wlSubmit.textContent = wlSubmit.getAttribute("data-orig-label") || "Notify me at launch"; } });
    });
  }

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
          // Nextdoor conversion for a completed mover registration (distinct from the
          // customer LEAD event fired on quote submit). Data source: f6ccadb4-...
          if (typeof window.ndp === "function") { window.ndp("track", "SIGN_UP"); }
          moverForm.reset();
          setMoverStatus("Thank you! Your registration has been submitted. Our team will review it and get back to you.", false);
        })
        .catch(function (err) {
          setMoverStatus((err && err.message) || "Sorry, something went wrong. Please try again or email sales@getmoved.app.", true);
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
    // Covers the step-1 hero fields (qq1-*) and the quote-page route fields (qq-move-*).
    ["qq-move-from", "qq-move-to", "qq1-from", "qq1-to"].forEach((id) => {
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
          input.dataset.acPicked = "1";
        });
      } catch (e) {
        /* Maps unavailable — the field still accepts free-typed ZIP / city, state */
      }
      // Any further typing invalidates the picked-suggestion flag.
      input.addEventListener("input", () => { input.dataset.acPicked = ""; });
      // Normalize free-typed values: if the visitor blurs WITHOUT picking a
      // suggestion, geocode the raw text ("Bayside", "11810") into a full
      // "City, ST ZIP, USA" so requests always carry a routable address with
      // at least the ZIP. Best-effort — the raw value stays if geocoding fails.
      input.addEventListener("blur", () => {
        setTimeout(() => {
          try {
            const v = (input.value || "").trim();
            if (!v || v.length < 3 || input.dataset.acPicked === "1" || input.dataset.geocoding === "1") return;
            if (!(window.google && google.maps && google.maps.Geocoder)) return;
            input.dataset.geocoding = "1";
            // Bias (not restrict) to the NY/NJ service area so ambiguous city
            // names ("Bayside") resolve to our market, not another state.
            const gmBias = new google.maps.LatLngBounds({ lat: 39.4, lng: -75.6 }, { lat: 42.1, lng: -71.7 });
            new google.maps.Geocoder().geocode(
              { address: v, componentRestrictions: { country: "US" }, bounds: gmBias },
              (results, status) => {
                input.dataset.geocoding = "";
                if (status !== "OK" || !results || !results[0] || !results[0].formatted_address) return;
                // Reject results too coarse to route (country / bare state) — a
                // typo'd ZIP must keep the raw value, not become "United States".
                const rTypes = results[0].types || [];
                if (rTypes.indexOf("country") !== -1 || rTypes.indexOf("administrative_area_level_1") !== -1) return;
                input.value = results[0].formatted_address;
                input.dataset.acPicked = "1";
                // Keep the progressive confirmed row ("From: … ✓") in sync.
                if (input.id === "qq1-from") {
                  const cv = document.getElementById("qq1-from-confirmed-val");
                  if (cv && cv.textContent) cv.textContent = results[0].formatted_address;
                }
              }
            );
          } catch (e2) { input.dataset.geocoding = ""; }
        }, 350);
      });
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
        if (typeof window.rdt === "function") { window.rdt("track", "Lead"); }
          if (typeof window.ndp === "function") { window.ndp("track", "LEAD"); }
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
