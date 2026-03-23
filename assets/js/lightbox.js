(function () {
  function ensureLightbox() {
    let lightbox = document.querySelector("[data-lightbox]");

    if (lightbox) {
      return lightbox;
    }

    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("data-lightbox", "true");
    lightbox.innerHTML = `
      <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="Xem ảnh tư liệu">
        <img src="" alt="" data-lightbox-preview>
        <div class="lightbox-caption" data-lightbox-caption></div>
        <button class="button button-primary lightbox-close" type="button" data-lightbox-close>Đóng</button>
      </div>
    `;
    document.body.appendChild(lightbox);

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target.hasAttribute("data-lightbox-close")) {
        lightbox.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        lightbox.classList.remove("is-open");
      }
    });

    return lightbox;
  }

  function initLightbox() {
    const lightbox = ensureLightbox();
    const preview = lightbox.querySelector("[data-lightbox-preview]");
    const caption = lightbox.querySelector("[data-lightbox-caption]");

    document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        preview.src = trigger.dataset.lightboxImage;
        preview.alt = trigger.dataset.lightboxAlt || "Ảnh tư liệu";
        caption.textContent = trigger.dataset.lightboxCaption || "";
        lightbox.classList.add("is-open");
      });
    });
  }

  window.NgasonLightbox = {
    initLightbox
  };
})();