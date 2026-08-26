/* TEST AI page (test-ai.html): visitor uploads a walkthrough video, our backend
 * runs furniture detection (gm-detect module on the portal server) and shows the
 * inventory + vehicle recommendation, with a CTA into the quote funnel.
 *
 * Flow:
 *   1. POST /api/v1/s3/upload            (multipart, folder=submitted-videos)
 *   2. POST /api/v1/submitted-videos/test-ai   (records the upload for admins)
 *   3. POST /api/v1/yolo/process {s3_key, async:1} -> job_id
 *   4. GET  /api/v1/yolo/jobs/<id>?include_frames=0  (poll until results)
 *   5. Render inventory; "Get my quote" stores video+inventory in sessionStorage
 *      and goes to quick-quote.html (getmoved.js attaches them to the payload).
 */
(function () {
  "use strict";

  var API = "https://portal.getmoved.app/api/v1";
  var MAX_MB = 300;
  var POLL_MS = 8000;
  var MAX_POLLS = 150; // 8s * 150 = 20 min hard stop

  var $ = function (id) { return document.getElementById(id); };
  var dropzone = $("tai-dropzone");
  var fileInput = $("tai-file");
  var pickBtn = $("tai-pick");
  if (!dropzone || !fileInput) return; // not on this page

  var stateUpload = $("tai-state-upload");
  var stateProcessing = $("tai-state-processing");
  var stateResults = $("tai-state-results");
  var stateError = $("tai-state-error");
  var progBar = $("tai-prog-bar");
  var progWrap = $("tai-prog");
  var procText = $("tai-proc-text");
  var procTimer = $("tai-proc-timer");
  var errText = $("tai-error-text");
  var itemsBox = $("tai-items");
  var summaryBox = $("tai-summary");
  var vehicleBox = $("tai-vehicle");
  var quoteBtn = $("tai-quote-btn");
  var restartBtns = document.querySelectorAll("[data-tai-restart]");

  var track = typeof window.gmTrack === "function" ? window.gmTrack : function () {};

  var current = { videoUrl: "", s3Key: "", jobId: "", inventory: [] };
  var timerHandle = null;
  var startedAt = 0;

  function show(state) {
    [stateUpload, stateProcessing, stateResults, stateError].forEach(function (el) {
      if (el) el.style.display = "none";
    });
    if (state) state.style.display = "block";
  }

  function fail(message) {
    if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
    if (errText) errText.textContent = message || "Something went wrong. Please try again.";
    show(stateError);
    track("test_ai_error", { source: "landing", message: String(message || "").slice(0, 120) });
  }

  function prettyName(raw) {
    var s = String(raw || "").replace(/_/g, " ").trim();
    return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function startTimer() {
    startedAt = Date.now();
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = setInterval(function () {
      if (!procTimer) return;
      var s = Math.floor((Date.now() - startedAt) / 1000);
      procTimer.textContent = Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
    }, 1000);
  }

  // ---- Step 1: upload to S3 with progress -----------------------------------
  function uploadVideo(file) {
    if (!file) return;
    if (!/^video\//i.test(file.type || "")) { fail("Please choose a video file (MP4, MOV…)."); return; }
    if (file.size > MAX_MB * 1024 * 1024) { fail("Video is too large (max " + MAX_MB + "MB). Try a shorter recording."); return; }

    track("test_ai_upload_start", { source: "landing", size_mb: Math.round(file.size / 1048576) });
    show(stateProcessing);
    if (procText) procText.textContent = "Uploading your video…";
    if (progWrap) progWrap.style.display = "block";
    if (progBar) progBar.style.width = "0%";
    startTimer();

    var fd = new FormData();
    fd.append("file", file, file.name || "walkthrough.mp4");
    fd.append("folder", "submitted-videos");

    var xhr = new XMLHttpRequest();
    xhr.open("POST", API + "/s3/upload");
    xhr.upload.onprogress = function (ev) {
      if (ev.lengthComputable && progBar) progBar.style.width = Math.round((ev.loaded / ev.total) * 100) + "%";
    };
    xhr.onerror = function () { fail("Upload failed. Check your connection and try again."); };
    xhr.onload = function () {
      var body = {};
      try { body = JSON.parse(xhr.responseText || "{}"); } catch (e) {}
      var url = (body.data && body.data.url) || "";
      var key = (body.data && body.data.key) || "";
      if (xhr.status < 200 || xhr.status >= 300 || !url) { fail("Upload failed. Please try again."); return; }
      current.videoUrl = url;
      current.s3Key = key;
      logUpload();
      startDetection();
    };
    xhr.send(fd);
  }

  // ---- Step 2: record the upload for the admins (best-effort) ---------------
  function logUpload(extra) {
    var payload = { video_url: current.videoUrl, s3_key: current.s3Key, job_id: current.jobId };
    if (extra) { for (var k in extra) payload[k] = extra[k]; }
    fetch(API + "/submitted-videos/test-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {});
  }

  // ---- Step 3: kick detection (async) ---------------------------------------
  function startDetection() {
    if (progWrap) progWrap.style.display = "none";
    if (procText) procText.textContent = "Our AI is watching your video and identifying furniture… This usually takes a few minutes.";
    fetch(API + "/yolo/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ s3_key: current.s3Key, video_url: current.videoUrl, async: 1 }),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { ok: r.ok, body: b }; }); })
      .then(function (res) {
        var jobId = res.body && res.body.job_id;
        if (!jobId) { fail((res.body && (res.body.error || res.body.details)) || "Could not start the AI analysis. Please try again."); return; }
        current.jobId = String(jobId);
        logUpload(); // update the record with the job id
        track("test_ai_job_started", { source: "landing" });
        pollJob(0);
      })
      .catch(function () { fail("Could not start the AI analysis. Please try again."); });
  }

  // ---- Step 4: poll until results -------------------------------------------
  function pollJob(attempt) {
    if (attempt > MAX_POLLS) { fail("The analysis is taking longer than expected. Please try again with a shorter video."); return; }
    setTimeout(function () {
      fetch(API + "/yolo/jobs/" + encodeURIComponent(current.jobId) + "?include_frames=0")
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (data) {
          var status = String(data.status || (data.status_data && data.status_data.status) || "").toLowerCase();
          var results = data.results || data.results_data || null;
          if (results && (results.inventory_items || results.items_with_quantity || results.product_groups)) {
            renderResults(data);
            return;
          }
          if (status === "failed" || (data.status_data && data.status_data.error)) {
            fail("The AI could not process this video. Try a steadier, well-lit walkthrough.");
            return;
          }
          if (procText && attempt === Math.floor(MAX_POLLS / 4)) {
            procText.textContent = "Still working — counting items and estimating sizes…";
          }
          pollJob(attempt + 1);
        })
        .catch(function () { pollJob(attempt + 1); }); // transient network error: keep polling
    }, attempt === 0 ? 4000 : POLL_MS);
  }

  // ---- Step 5: render -------------------------------------------------------
  function renderResults(data) {
    if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
    var rd = data.results_data || {};
    var r = data.results || {};
    var items = rd.items_with_quantity || r.items_with_quantity || rd.clustered_items || r.clustered_items || rd.inventory_items || r.inventory_items || [];

    // Collapse to {name, quantity} and merge duplicates by name.
    var byName = {};
    items.forEach(function (it) {
      var name = prettyName(it.className || it.class_name || it.name);
      if (!name) return;
      var qty = Number(it.quantity) > 0 ? Number(it.quantity) : 1;
      if (!byName[name]) byName[name] = { name: name, quantity: 0, image: it.image_filename || "" };
      byName[name].quantity += qty;
      if (!byName[name].image && it.image_filename) byName[name].image = it.image_filename;
    });
    var list = Object.keys(byName).map(function (k) { return byName[k]; });
    list.sort(function (a, b) { return b.quantity - a.quantity || a.name.localeCompare(b.name); });

    current.inventory = list.map(function (it) { return { name: it.name, quantity: it.quantity }; });

    if (!list.length) {
      fail("We could not confidently detect furniture in this video. Try filming slower, closer, and with good lighting.");
      return;
    }

    if (itemsBox) {
      itemsBox.innerHTML = list.map(function (it) {
        var img = it.image
          ? '<img loading="lazy" src="' + API + '/yolo/detected-image/' + encodeURIComponent(it.image) + '" alt="' + it.name + '" onerror="this.style.display=\'none\'">'
          : "";
        return '<div class="tai-item">' + img +
          '<span class="tai-item-name">' + it.name + '</span>' +
          '<span class="tai-item-qty">&times; ' + it.quantity + '</span></div>';
      }).join("");
    }

    var totals = rd.totals || r.totals || null;
    if (summaryBox) {
      var totalCount = list.reduce(function (s, it) { return s + it.quantity; }, 0);
      var bits = ['<strong>' + totalCount + '</strong> items detected'];
      if (totals && totals.total_volume_m3) bits.push("~<strong>" + Number(totals.total_volume_m3).toFixed(1) + " m&sup3;</strong> (" + Math.round(Number(totals.total_volume_m3) * 35.31) + " cu ft)");
      if (totals && totals.total_weight_kg) bits.push("~<strong>" + Math.round(Number(totals.total_weight_kg) * 2.2) + " lbs</strong>");
      summaryBox.innerHTML = bits.join(" &middot; ");
    }

    var vr = rd.vehicle_recommendation || r.vehicle_recommendation || null;
    if (vehicleBox) {
      var rec = vr && (vr.recommended_vehicle || vr);
      var vname = rec && (rec.name || rec.vehicle_name);
      vehicleBox.innerHTML = vname
        ? '<i class="ti-truck"></i> Recommended vehicle: <strong>' + vname + "</strong>"
        : "";
      vehicleBox.style.display = vname ? "block" : "none";
    }

    show(stateResults);
    track("test_ai_complete", { source: "landing", items: list.length });
    try { window.scrollTo({ top: stateResults.offsetTop - 120, behavior: "smooth" }); } catch (e) {}

    // Final record update: attach the inventory so admins see it with the video.
    logUpload({ inventory: current.inventory });
  }

  // ---- CTA: carry video + inventory into the quote funnel -------------------
  if (quoteBtn) {
    quoteBtn.addEventListener("click", function () {
      try {
        sessionStorage.setItem("gm_testai_video_url", current.videoUrl || "");
        sessionStorage.setItem("gm_testai_inventory", JSON.stringify(current.inventory || []));
      } catch (e) {}
      track("test_ai_quote_click", { source: "landing", items: current.inventory.length });
      window.location.href = "free-moving-quote.html";
    });
  }

  restartBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      current = { videoUrl: "", s3Key: "", jobId: "", inventory: [] };
      fileInput.value = "";
      show(stateUpload);
    });
  });

  // ---- Dropzone wiring ------------------------------------------------------
  if (pickBtn) pickBtn.addEventListener("click", function () { fileInput.click(); });
  dropzone.addEventListener("click", function (ev) {
    if (ev.target === pickBtn || pickBtn.contains(ev.target)) return;
    fileInput.click();
  });
  fileInput.addEventListener("change", function () { uploadVideo(fileInput.files && fileInput.files[0]); });
  ["dragover", "dragenter"].forEach(function (evName) {
    dropzone.addEventListener(evName, function (ev) { ev.preventDefault(); dropzone.classList.add("is-drag"); });
  });
  ["dragleave", "drop"].forEach(function (evName) {
    dropzone.addEventListener(evName, function (ev) { ev.preventDefault(); dropzone.classList.remove("is-drag"); });
  });
  dropzone.addEventListener("drop", function (ev) {
    var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
    uploadVideo(file);
  });

  track("test_ai_view", { source: "landing" });
})();
