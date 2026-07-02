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

  // Quick Quote form -> sends via site PHP handler (Amazon SES SMTP, no Node backend).
  const quoteForm = document.getElementById("quick-quote-form");
  if (quoteForm) {
    const quoteStatus = document.getElementById("quick-quote-status");
    const quoteSubmit = quoteForm.querySelector(".gm-qq-submit");
    const mailEndpoint = "php/quick-quote-mail.php";

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
        website: (data.get("website") || "").toString().trim(), // honeypot
      };

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
})();
