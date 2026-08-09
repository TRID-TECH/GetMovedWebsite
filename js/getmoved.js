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
    if (["begin_quote", "begin_signup", "form_start", "form_step_complete", "form_error"].indexOf(eventName) !== -1) {
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

      // Required: pickup, delivery, email, and phone.
      const nameInput = quoteForm.querySelector('[name="full_name"]');
      const from = quoteForm.querySelector('[name="move_from"]');
      const to = quoteForm.querySelector('[name="move_to"]');
      const emailInput = quoteForm.querySelector('[name="email"]');
      const phoneInput = quoteForm.querySelector('[name="phone"]');
      const errors = [];
      if (nameInput && !nameInput.value.trim()) errors.push([nameInput, "full_name", "Enter your name"]);
      if (from && !from.value.trim()) errors.push([from, "move_from", "Enter your pickup ZIP code"]);
      if (to && !to.value.trim()) errors.push([to, "move_to", "Enter your delivery ZIP code"]);
      if (emailInput) {
        const ev = emailInput.value.trim();
        if (!ev) errors.push([emailInput, "email", "Enter your email address"]);
        else if (!emailOk(ev)) errors.push([emailInput, "email", "Enter a valid email address"]);
      }
      if (phoneInput) {
        const pv = phoneInput.value.trim();
        if (!pv) errors.push([phoneInput, "phone", "Enter your phone number"]);
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
        fullName: (data.get("full_name") || "").toString().trim(),
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

      if (quoteSubmit) { quoteSubmit.disabled = true; quoteSubmit.textContent = "Sending..."; }
      setStatus("", false);

      fetch(mailEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then((response) => { if (!response.ok) { throw new Error("Request failed with status " + response.status); } return response.json().catch(() => ({})); })
        .then((result) => {
          if (result && result.success === false) { throw new Error(result.message || "Send failed"); }
          gmTrack("generate_lead", { source: "landing" });
          // Same conversion_id as the server-side CAPI event so Reddit dedupes them.
          if (typeof window.rdt === "function") { window.rdt("track", "Lead", { conversion_id: rdtConversionId }); }
          if (typeof window.ndp === "function") { window.ndp("track", "LEAD"); }
          if (typeof window.gtag === "function") {
            window.gtag("set", "user_data", { email: payload.email, phone_number: payload.phone });
            window.gtag("event", "conversion", { send_to: "AW-18301808532/Cd3sCNnGm8scEJTf_ZZE", value: 1.0, currency: "USD" });
          }
          quoteForm.reset();
          setStatus("Thank you! Your request has been sent. Our team will contact you shortly.", false);
        })
        .catch(() => { setStatus("Sorry, something went wrong. Please email us directly at jack@getmoved.app.", true); })
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
        var fromEl = quoteForm.querySelector('[name="move_from"]');
        var toEl = quoteForm.querySelector('[name="move_to"]');
        if (fromEl && fromV && !fromEl.value) fromEl.value = fromV;
        if (toEl && toV && !toEl.value) toEl.value = toV;
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
      if (!fromV) { showErr(fromEl, "move_from", "Enter your pick up city or ZIP"); }
      if (!toV) { showErr(toEl, "move_to", "Enter your delivery city or ZIP"); }
      if (!fromV || !toV) return;
      try {
        if (!sessionStorage.getItem("gm_form_start")) {
          sessionStorage.setItem("gm_form_start", "1");
          gmTrack("begin_quote", { source: "landing" });
          gmTrack("form_start", { source: "landing" });
        }
        sessionStorage.setItem("gm_qq_from", fromV);
        sessionStorage.setItem("gm_qq_to", toV);
      } catch (e) {}
      gmTrack("form_step_complete", { source: "landing", step: 1, name: "route" });
      window.location.href = "quote.html?from=" + encodeURIComponent(fromV) + "&to=" + encodeURIComponent(toV);
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
