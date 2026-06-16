/**
 * GetMoved site visit counter.
 * On the first page load of a browser session, pings the backend which
 * increments the visit counter and emails the site owner.
 *
 * One email per browser session by default (avoids spamming on every
 * page refresh / internal navigation). Remove the sessionStorage guard
 * below if you want an email on every single page load.
 */
(function () {
  "use strict";

  // Backend base URL. Locally we hit the dev backend directly; in production
  // we route through portal.getmoved.app which proxies /api/v1 to the backend.
  function getApiBase() {
    var host = window.location.hostname;
    var isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".local");
    if (isLocal) {
      return window.location.protocol + "//127.0.0.1:3000";
    }
    return "https://portal.getmoved.app";
  }

  var SESSION_KEY = "gm_visit_tracked";

  function trackVisit() {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        return;
      }
    } catch (e) {
      // sessionStorage may be unavailable (private mode) — proceed anyway.
    }

    var payload = {
      page: window.location.href,
      referrer: document.referrer || "",
      language: navigator.language || "",
      screen: window.screen ? window.screen.width + "x" + window.screen.height : "",
      userAgent: navigator.userAgent || "",
    };

    fetch(getApiBase() + "/api/v1/visits/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then(function () {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch (e) {
          /* ignore */
        }
      })
      .catch(function () {
        /* Silent — visit tracking must never disrupt the page. */
      });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    trackVisit();
  } else {
    window.addEventListener("DOMContentLoaded", trackVisit);
  }
})();
