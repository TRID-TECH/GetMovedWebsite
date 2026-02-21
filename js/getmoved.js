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
