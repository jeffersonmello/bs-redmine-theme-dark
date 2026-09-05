(function () {
  "use strict";

  var STORAGE_KEY = "bs-redmine-theme-dark.sidebar-collapsed";
  var COLLAPSED_CLASS = "theme-sidebar-collapsed";
  var DESKTOP_QUERY = "(min-width: 900px)";

  function readPreference() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch (_error) {
      return false;
    }
  }

  function writePreference(collapsed) {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch (_error) {
      // Storage can be blocked by browser policy; the current page still works.
    }
  }

  function initializeSidebarToggle() {
    var main = document.getElementById("main");
    var sidebar = document.getElementById("sidebar");
    var content = document.getElementById("content");
    var legacyToggle = document.getElementById("toggle-sidebar");
    var language = (document.documentElement.lang || "en").toLowerCase();
    var labels = language.indexOf("pt") === 0
      ? { hide: "Ocultar barra lateral", show: "Mostrar barra lateral" }
      : { hide: "Hide sidebar", show: "Show sidebar" };

    if (!main || !sidebar || !content || main.classList.contains("nosidebar")) {
      return;
    }

    if (document.getElementById("theme-sidebar-toggle")) {
      return;
    }

    if (legacyToggle) {
      legacyToggle.hidden = true;
      legacyToggle.tabIndex = -1;
      legacyToggle.setAttribute("aria-hidden", "true");
    }

    var button = document.createElement("button");
    var icon = document.createElement("span");
    var label = document.createElement("span");

    button.id = "theme-sidebar-toggle";
    button.type = "button";
    button.setAttribute("aria-controls", "sidebar");
    icon.className = "theme-sidebar-toggle__icon";
    icon.setAttribute("aria-hidden", "true");
    label.className = "theme-visually-hidden";
    button.appendChild(icon);
    button.appendChild(label);
    main.appendChild(button);

    function applyState(collapsed, persist) {
      var desktop = window.matchMedia(DESKTOP_QUERY).matches;
      var effectiveCollapsed = desktop && collapsed;
      var accessibleLabel = effectiveCollapsed ? labels.show : labels.hide;

      document.body.classList.toggle(COLLAPSED_CLASS, effectiveCollapsed);
      button.setAttribute("aria-expanded", String(!effectiveCollapsed));
      button.setAttribute("aria-label", accessibleLabel);
      button.title = accessibleLabel;
      icon.textContent = effectiveCollapsed ? "‹" : "›";
      label.textContent = accessibleLabel;

      if (persist) {
        writePreference(collapsed);
      }
    }

    var collapsed = readPreference();
    applyState(collapsed, false);
    document.body.classList.add("theme-sidebar-ready");

    button.addEventListener("click", function () {
      collapsed = !document.body.classList.contains(COLLAPSED_CLASS);
      applyState(collapsed, true);
    });

    var desktopMedia = window.matchMedia(DESKTOP_QUERY);
    var handleViewportChange = function () {
      applyState(collapsed, false);
    };

    if (typeof desktopMedia.addEventListener === "function") {
      desktopMedia.addEventListener("change", handleViewportChange);
    } else if (typeof desktopMedia.addListener === "function") {
      desktopMedia.addListener(handleViewportChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSidebarToggle);
  } else {
    initializeSidebarToggle();
  }
})();

(function () {
  "use strict";

  var SELECT_ID = "issue_custom_field_values_4";
  var WRAPPER_ID = "tm-clientes-autocomplete";
  var DROPDOWN_ID = "tm-clientes-dropdown";
  var ENHANCED_ATTRIBUTE = "data-theme-customer-autocomplete";
  var RESULT_LIMIT = 80;

  function normalizeText(text) {
    var normalized = String(text || "").toLowerCase();

    if (typeof normalized.normalize === "function") {
      normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    return normalized;
  }

  function dispatchChange(select) {
    var event;

    if (typeof Event === "function") {
      event = new Event("change", { bubbles: true });
    } else {
      event = document.createEvent("Event");
      event.initEvent("change", true, false);
    }

    select.dispatchEvent(event);
  }

  function cleanupAutocomplete() {
    var wrapper = document.getElementById(WRAPPER_ID);
    var dropdown = document.getElementById(DROPDOWN_ID);

    if (wrapper) {
      wrapper.remove();
    }

    if (dropdown) {
      dropdown.remove();
    }
  }

  function initializeCustomerAutocomplete() {
    var select = document.getElementById(SELECT_ID);

    if (!select) {
      cleanupAutocomplete();
      return;
    }

    if (select.getAttribute(ENHANCED_ATTRIBUTE) === "true") {
      if (document.getElementById(WRAPPER_ID) && document.getElementById(DROPDOWN_ID)) {
        return;
      }

      select.removeAttribute(ENHANCED_ATTRIBUTE);
      select.classList.remove("tm-clientes-select--enhanced");
    }

    var availableOptions = Array.prototype.filter.call(select.options || [], function (option) {
      return option.value && option.value.trim() !== "";
    });

    if (availableOptions.length === 0 || !select.parentNode) {
      return;
    }

    cleanupAutocomplete();
    select.setAttribute(ENHANCED_ATTRIBUTE, "true");
    select.classList.add("tm-clientes-select--enhanced");

    var language = (document.documentElement.lang || "en").toLowerCase();
    var labels = language.indexOf("pt") === 0
      ? {
          input: "Buscar clientes",
          placeholder: "Digite para buscar clientes...",
          empty: "Nenhum cliente encontrado",
          remove: "Remover cliente"
        }
      : {
          input: "Search customers",
          placeholder: "Type to search customers...",
          empty: "No customers found",
          remove: "Remove customer"
        };

    var container = document.createElement("div");
    var selectedBox = document.createElement("div");
    var input = document.createElement("input");
    var dropdown = document.createElement("div");
    var visibleOptions = [];
    var optionRows = [];
    var activeIndex = -1;

    container.id = WRAPPER_ID;
    container.className = "tm-clientes-autocomplete";
    selectedBox.className = "tm-clientes-selected-box";

    input.type = "text";
    input.id = SELECT_ID + "_search";
    input.className = "tm-clientes-input";
    input.placeholder = labels.placeholder;
    input.autocomplete = "off";
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", DROPDOWN_ID);
    input.setAttribute("aria-expanded", "false");

    var fieldLabel = typeof document.querySelector === "function"
      ? document.querySelector('label[for="' + SELECT_ID + '"]')
      : null;

    if (fieldLabel) {
      fieldLabel.setAttribute("for", input.id);
    } else {
      input.setAttribute("aria-label", labels.input);
    }

    dropdown.id = DROPDOWN_ID;
    dropdown.className = "tm-clientes-dropdown";
    dropdown.hidden = true;
    dropdown.setAttribute("role", "listbox");
    dropdown.setAttribute("aria-multiselectable", String(Boolean(select.multiple)));

    selectedBox.appendChild(input);
    container.appendChild(selectedBox);
    select.parentNode.insertBefore(container, select.nextSibling);
    document.body.appendChild(dropdown);

    function getOptions() {
      return Array.prototype.filter.call(select.options || [], function (option) {
        return option.value && option.value.trim() !== "";
      });
    }

    function getSelectedOptions() {
      return getOptions().filter(function (option) {
        return option.selected;
      });
    }

    function setOptionSelected(option, selected) {
      if (selected && !select.multiple) {
        getOptions().forEach(function (candidate) {
          candidate.selected = false;
        });
      }

      option.selected = selected;
      dispatchChange(select);
    }

    function positionDropdown() {
      var rect = selectedBox.getBoundingClientRect();
      var viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      var width = Math.max(180, Math.min(rect.width, viewportWidth - 16));
      var left = Math.min(Math.max(8, rect.left), Math.max(8, viewportWidth - width - 8));

      dropdown.style.left = left + "px";
      dropdown.style.top = rect.bottom + 4 + "px";
      dropdown.style.width = width + "px";
    }

    function hideDropdown() {
      dropdown.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      activeIndex = -1;
    }

    function setActiveIndex(index) {
      optionRows.forEach(function (row) {
        row.classList.remove("is-active");
      });

      if (optionRows.length === 0) {
        activeIndex = -1;
        input.removeAttribute("aria-activedescendant");
        return;
      }

      activeIndex = (index + optionRows.length) % optionRows.length;
      optionRows[activeIndex].classList.add("is-active");
      input.setAttribute("aria-activedescendant", optionRows[activeIndex].id);

      if (typeof optionRows[activeIndex].scrollIntoView === "function") {
        optionRows[activeIndex].scrollIntoView({ block: "nearest" });
      }
    }

    function renderChips() {
      Array.prototype.forEach.call(selectedBox.querySelectorAll(".tm-cliente-chip"), function (chip) {
        chip.remove();
      });

      getSelectedOptions().forEach(function (option) {
        var chip = document.createElement("button");
        var label = (option.textContent || option.value).trim();

        chip.type = "button";
        chip.className = "tm-cliente-chip";
        chip.textContent = label + " ×";
        chip.title = labels.remove + ": " + label;
        chip.setAttribute("aria-label", chip.title);

        chip.addEventListener("click", function () {
          setOptionSelected(option, false);
          renderChips();
          renderDropdown(input.value);
          input.focus();
        });

        selectedBox.insertBefore(chip, input);
      });
    }

    function chooseOption(option) {
      setOptionSelected(option, true);
      input.value = "";
      renderChips();
      renderDropdown("");
      input.focus();
    }

    function createOptionRow(option, index) {
      var row = document.createElement("div");

      row.id = DROPDOWN_ID + "-option-" + index;
      row.className = "tm-clientes-option";
      row.textContent = (option.textContent || option.value).trim();
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", "false");

      row.addEventListener("mouseenter", function () {
        setActiveIndex(index);
      });

      row.addEventListener("mousedown", function (event) {
        event.preventDefault();
      });

      row.addEventListener("click", function () {
        chooseOption(option);
      });

      return row;
    }

    function renderDropdown(filter) {
      var term = normalizeText(String(filter || "").trim());
      var selectedValues = getSelectedOptions().map(function (option) {
        return option.value;
      });

      visibleOptions = getOptions().filter(function (option) {
        var label = normalizeText(option.textContent || option.value);
        return selectedValues.indexOf(option.value) === -1 && label.indexOf(term) !== -1;
      }).slice(0, RESULT_LIMIT);

      dropdown.innerHTML = "";
      optionRows = [];
      activeIndex = -1;
      input.removeAttribute("aria-activedescendant");

      if (visibleOptions.length === 0) {
        var empty = document.createElement("div");
        empty.className = "tm-clientes-empty";
        empty.textContent = labels.empty;
        dropdown.appendChild(empty);
      } else {
        visibleOptions.forEach(function (option, index) {
          var row = createOptionRow(option, index);
          optionRows.push(row);
          dropdown.appendChild(row);
        });
      }

      positionDropdown();
      dropdown.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }

    input.addEventListener("input", function () {
      renderDropdown(input.value);
    });

    input.addEventListener("focus", function () {
      renderDropdown(input.value);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        if (dropdown.hidden) {
          renderDropdown(input.value);
        }

        setActiveIndex(activeIndex + (event.key === "ArrowDown" ? 1 : -1));
        return;
      }

      if (event.key === "Enter" && activeIndex >= 0 && visibleOptions[activeIndex]) {
        event.preventDefault();
        chooseOption(visibleOptions[activeIndex]);
        return;
      }

      if (event.key === "Backspace" && input.value === "") {
        var selected = getSelectedOptions();

        if (selected.length > 0) {
          setOptionSelected(selected[selected.length - 1], false);
          renderChips();
          renderDropdown("");
        }
      }

      if (event.key === "Escape" || event.key === "Tab") {
        hideDropdown();
      }
    });

    selectedBox.addEventListener("click", function () {
      input.focus();
    });

    select.addEventListener("change", renderChips);

    document.addEventListener("click", function (event) {
      if (!container.contains(event.target) && !dropdown.contains(event.target)) {
        hideDropdown();
      }
    });

    window.addEventListener("scroll", function () {
      if (!dropdown.hidden) {
        positionDropdown();
      }
    }, true);

    window.addEventListener("resize", function () {
      if (!dropdown.hidden) {
        positionDropdown();
      }
    });

    if (select.form) {
      select.form.addEventListener("reset", function () {
        window.setTimeout(renderChips, 0);
      });
    }

    renderChips();
  }

  function startCustomerAutocomplete() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", startCustomerAutocomplete, { once: true });
      return;
    }

    initializeCustomerAutocomplete();

    if (typeof MutationObserver === "function") {
      var observer = new MutationObserver(initializeCustomerAutocomplete);
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  startCustomerAutocomplete();
})();

(function () {
  "use strict";

  var LIGHTBOX_ID = "theme-image-lightbox";
  var IMAGE_SELECTOR = [
    "#content .wiki img",
    "#content div.thumbnails img",
    "#content img.filecontent.image",
    "#content #activity dd .description img"
  ].join(", ");
  var IMAGE_EXTENSION = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:$|[?#])/i;
  var activeTrigger = null;
  var fallbackSource = "";
  var lightbox = null;
  var zoom = 1;
  var fitWidth = 0;
  var fitHeight = 0;
  var drag = null;

  function closest(element, selector) {
    return element && typeof element.closest === "function" ? element.closest(selector) : null;
  }

  function isEligibleImage(image) {
    if (!image || image.tagName !== "IMG" || typeof image.matches !== "function") {
      return false;
    }

    if (!image.matches(IMAGE_SELECTOR)) {
      return false;
    }

    if (
      image.classList.contains("gravatar") ||
      image.classList.contains("avatar") ||
      image.classList.contains("emoji") ||
      image.classList.contains("smiley")
    ) {
      return false;
    }

    if (closest(image, ".gravatar-with-child, .jstElements, .theme-lightbox, a.user")) {
      return false;
    }

    return Boolean(image.currentSrc || image.src || image.getAttribute("src"));
  }

  function findImageFromTarget(target) {
    if (isEligibleImage(target)) {
      return target;
    }

    var trigger = closest(target, ".theme-lightbox-trigger-link");
    if (!trigger || typeof trigger.querySelector !== "function") {
      return null;
    }

    var image = trigger.querySelector("img");
    return isEligibleImage(image) ? image : null;
  }

  function attachmentDownloadSource(rawSource) {
    if (!rawSource || typeof URL !== "function") {
      return null;
    }

    try {
      var url = new URL(rawSource, window.location.href);

      if (url.origin !== window.location.origin) {
        return null;
      }

      var download = url.pathname.match(/^(.*\/attachments)\/download\/(\d+)(?:\/.*)?$/);
      if (download) {
        return url.href;
      }

      var thumbnail = url.pathname.match(/^(.*\/attachments)\/thumbnail\/(\d+)(?:\/.*)?$/);
      var attachment = url.pathname.match(/^(.*\/attachments)\/(\d+)(?:\/.*)?$/);
      var match = thumbnail || attachment;

      if (!match) {
        return null;
      }

      url.pathname = match[1] + "/download/" + match[2];
      url.search = "";
      url.hash = "";
      return url.href;
    } catch (_error) {
      return null;
    }
  }

  function resolveImageSource(image) {
    var anchor = closest(image, "a");
    var sources = [
      anchor && anchor.href,
      image.currentSrc,
      image.src,
      image.getAttribute("src")
    ];

    for (var index = 0; index < sources.length; index += 1) {
      var attachmentSource = attachmentDownloadSource(sources[index]);
      if (attachmentSource) {
        return attachmentSource;
      }
    }

    if (anchor && anchor.href && IMAGE_EXTENSION.test(anchor.href)) {
      return anchor.href;
    }

    return image.currentSrc || image.src || image.getAttribute("src");
  }

  function buildLightbox() {
    var existing = document.getElementById(LIGHTBOX_ID);
    if (existing && lightbox) {
      return lightbox;
    }

    if (existing && typeof existing.remove === "function") {
      existing.remove();
    }

    var language = (document.documentElement.lang || "en").toLowerCase();
    var labels = language.indexOf("pt") === 0
      ? {
          title: "Visualização da imagem",
          close: "Fechar visualização",
          zoomIn: "Ampliar imagem (+)",
          zoomOut: "Reduzir imagem (-)",
          zoomReset: "Ajustar à tela (0)",
          fit: "Ajustar",
          zoom: "Zoom relativo ao tamanho ajustado à tela",
          viewport: "Imagem ampliável. Use + e - para zoom, 0 para ajustar e as setas para rolar.",
          error: "Não foi possível carregar a imagem em tamanho completo."
        }
      : {
          title: "Image preview",
          close: "Close preview",
          zoomIn: "Zoom in (+)",
          zoomOut: "Zoom out (-)",
          zoomReset: "Fit to screen (0)",
          fit: "Fit",
          zoom: "Zoom relative to the fitted image size",
          viewport: "Zoomable image. Use + and - to zoom, 0 to fit and arrow keys to scroll.",
          error: "The full-size image could not be loaded."
        };
    var overlay = document.createElement("dialog");
    var title = document.createElement("h2");
    var stage = document.createElement("div");
    var closeButton = document.createElement("button");
    var figure = document.createElement("figure");
    var preview = document.createElement("img");
    var caption = document.createElement("figcaption");
    var toolbar = document.createElement("div");
    var viewport = document.createElement("div");
    var canvas = document.createElement("div");
    var zoomOut = document.createElement("button");
    var zoomReset = document.createElement("button");
    var zoomIn = document.createElement("button");
    var zoomLevel = document.createElement("span");

    overlay.id = LIGHTBOX_ID;
    overlay.className = "theme-lightbox";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-labelledby", LIGHTBOX_ID + "-title");

    title.id = LIGHTBOX_ID + "-title";
    title.className = "theme-visually-hidden";
    title.textContent = labels.title;

    stage.className = "theme-lightbox__stage";
    closeButton.type = "button";
    closeButton.className = "theme-lightbox__close";
    closeButton.setAttribute("aria-label", labels.close);
    closeButton.title = labels.close;
    closeButton.textContent = "×";

    figure.className = "theme-lightbox__figure";
    preview.className = "theme-lightbox__image";
    caption.className = "theme-lightbox__caption";
    toolbar.className = "theme-lightbox__toolbar";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", labels.zoom);
    viewport.className = "theme-lightbox__viewport";
    viewport.setAttribute("tabindex", "0");
    viewport.setAttribute("role", "region");
    viewport.setAttribute("aria-label", labels.viewport);
    canvas.className = "theme-lightbox__canvas";
    preview.setAttribute("draggable", "false");
    zoomOut.className = "theme-lightbox__zoom-out";
    zoomReset.className = "theme-lightbox__zoom-reset";
    zoomIn.className = "theme-lightbox__zoom-in";
    [zoomOut, zoomReset, zoomIn].forEach(function (button, index) {
      var label = [labels.zoomOut, labels.zoomReset, labels.zoomIn][index];
      button.type = "button";
      button.title = label;
      button.setAttribute("aria-label", label);
    });
    zoomOut.textContent = "−";
    zoomReset.textContent = labels.fit;
    zoomIn.textContent = "+";
    zoomLevel.className = "theme-lightbox__zoom-level";
    zoomLevel.setAttribute("role", "status");
    zoomLevel.setAttribute("aria-live", "polite");
    zoomLevel.setAttribute("aria-atomic", "true");
    zoomLevel.title = labels.zoom;

    toolbar.appendChild(zoomOut);
    toolbar.appendChild(zoomLevel);
    toolbar.appendChild(zoomReset);
    toolbar.appendChild(zoomIn);
    canvas.appendChild(preview);
    viewport.appendChild(canvas);
    figure.appendChild(viewport);
    figure.appendChild(caption);
    stage.appendChild(toolbar);
    stage.appendChild(closeButton);
    stage.appendChild(figure);
    overlay.appendChild(title);
    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    lightbox = {
      overlay: overlay,
      stage: stage,
      closeButton: closeButton,
      preview: preview,
      caption: caption,
      viewport: viewport,
      canvas: canvas,
      zoomOut: zoomOut,
      zoomReset: zoomReset,
      zoomIn: zoomIn,
      zoomLevel: zoomLevel,
      labels: labels
    };

    return lightbox;
  }

  function endDrag() {
    var previousDrag = drag;
    drag = null;
    if (previousDrag && typeof lightbox.viewport.releasePointerCapture === "function") {
      try {
        lightbox.viewport.releasePointerCapture(previousDrag.id);
      } catch (_error) {
        // Capture may already have ended after pointer cancellation.
      }
    }
    lightbox.viewport.classList.remove("is-dragging");
  }

  function updateZoomControls() {
    var ready = fitWidth > 0 && fitHeight > 0;
    lightbox.zoomOut.setAttribute("aria-disabled", String(!ready || zoom <= 1));
    lightbox.zoomReset.setAttribute("aria-disabled", String(!ready || zoom === 1));
    lightbox.zoomIn.setAttribute("aria-disabled", String(!ready || zoom >= 4));
    lightbox.zoomLevel.textContent = Math.round(zoom * 100) + "%";
    lightbox.viewport.setAttribute("tabindex", ready ? "0" : "-1");
    if (zoom > 1) {
      lightbox.viewport.classList.add("is-zoomed");
    } else {
      lightbox.viewport.classList.remove("is-zoomed");
    }
  }

  function resetZoom() {
    endDrag();
    zoom = 1;
    fitWidth = 0;
    fitHeight = 0;
    lightbox.preview.removeAttribute("width");
    lightbox.preview.removeAttribute("height");
    lightbox.viewport.scrollLeft = 0;
    lightbox.viewport.scrollTop = 0;
    updateZoomControls();
  }

  function fitImage() {
    resetZoom();
    var preview = lightbox.preview;
    var viewport = lightbox.viewport;
    if (!preview.naturalWidth || !preview.naturalHeight ||
        !viewport.clientWidth || !viewport.clientHeight) {
      return;
    }

    var scale = Math.min(1, viewport.clientWidth / preview.naturalWidth,
      viewport.clientHeight / preview.naturalHeight);
    fitWidth = Math.max(1, Math.floor(preview.naturalWidth * scale));
    fitHeight = Math.max(1, Math.floor(preview.naturalHeight * scale));
    preview.setAttribute("width", fitWidth);
    preview.setAttribute("height", fitHeight);
    updateZoomControls();
  }

  function setZoom(nextZoom, clientX, clientY) {
    if (!fitWidth || !fitHeight || lightbox.overlay.hidden) {
      return;
    }
    nextZoom = Math.max(1, Math.min(4, nextZoom));
    if (nextZoom === zoom) {
      return;
    }

    var viewport = lightbox.viewport;
    var rect = viewport.getBoundingClientRect();
    var x = clientX === undefined ? viewport.clientWidth / 2 : clientX - rect.left;
    var y = clientY === undefined ? viewport.clientHeight / 2 : clientY - rect.top;
    var oldWidth = Math.round(fitWidth * zoom);
    var oldHeight = Math.round(fitHeight * zoom);
    var imageX = (viewport.scrollLeft + x - Math.max(0, (viewport.clientWidth - oldWidth) / 2)) / oldWidth;
    var imageY = (viewport.scrollTop + y - Math.max(0, (viewport.clientHeight - oldHeight) / 2)) / oldHeight;

    endDrag();
    zoom = nextZoom;
    var width = Math.round(fitWidth * zoom);
    var height = Math.round(fitHeight * zoom);
    lightbox.preview.setAttribute("width", width);
    lightbox.preview.setAttribute("height", height);
    viewport.scrollLeft = zoom === 1 ? 0 : Math.max(0, Math.min(width - viewport.clientWidth,
      Math.max(0, Math.min(1, imageX)) * width - x));
    viewport.scrollTop = zoom === 1 ? 0 : Math.max(0, Math.min(height - viewport.clientHeight,
      Math.max(0, Math.min(1, imageY)) * height - y));
    updateZoomControls();
  }

  function isImageViewport(target) {
    return lightbox && (target === lightbox.preview || target === lightbox.canvas ||
      target === lightbox.viewport);
  }

  function cycleLightboxFocus(backwards) {
    var controls = [lightbox.zoomOut, lightbox.zoomReset, lightbox.zoomIn, lightbox.closeButton];
    if (fitWidth && fitHeight) {
      controls.push(lightbox.viewport);
    }
    var index = controls.indexOf(document.activeElement);
    if (index === -1) {
      lightbox.closeButton.focus();
    } else {
      controls[(index + (backwards ? -1 : 1) + controls.length) % controls.length].focus();
    }
  }

  function showLightboxDialog(overlay) {
    overlay.hidden = false;

    if (typeof overlay.showModal === "function") {
      try {
        if (!overlay.open) {
          overlay.showModal();
        }
        return;
      } catch (_error) {
        // The fixed-position CSS remains the fallback when the top layer fails.
      }
    }

    overlay.setAttribute("open", "");
  }

  function hideLightboxDialog(overlay) {
    if (typeof overlay.close === "function" && overlay.open) {
      try {
        overlay.close();
      } catch (_error) {
        // Removing the open attribute still closes the CSS fallback.
      }
    }

    overlay.removeAttribute("open");
    overlay.hidden = true;
  }

  function closeLightbox() {
    if (!lightbox || lightbox.overlay.hidden) {
      return;
    }

    hideLightboxDialog(lightbox.overlay);
    resetZoom();
    lightbox.overlay.setAttribute("aria-hidden", "true");
    lightbox.overlay.classList.remove("is-loading", "has-error");
    lightbox.preview.removeAttribute("src");
    document.body.classList.remove("theme-lightbox-open");

    if (activeTrigger && typeof activeTrigger.focus === "function") {
      activeTrigger.focus({ preventScroll: true });
    }

    activeTrigger = null;
    fallbackSource = "";
  }

  function openLightbox(image) {
    var refs = buildLightbox();
    var anchor = closest(image, "a");
    var captionText = image.getAttribute("alt") || image.getAttribute("title") ||
      (anchor && anchor.getAttribute("title")) || "";

    activeTrigger = anchor || image;
    fallbackSource = image.currentSrc || image.src || image.getAttribute("src") || "";
    refs.preview.alt = captionText;
    refs.caption.textContent = captionText;
    refs.caption.hidden = captionText === "";
    showLightboxDialog(refs.overlay);
    refs.overlay.setAttribute("aria-hidden", "false");
    refs.overlay.classList.add("is-loading");
    refs.overlay.classList.remove("has-error");
    resetZoom();
    document.body.classList.add("theme-lightbox-open");
    refs.preview.src = resolveImageSource(image);
    refs.closeButton.focus({ preventScroll: true });
  }

  function enhanceImage(image) {
    if (!isEligibleImage(image) || image.getAttribute("data-theme-lightbox") === "true") {
      return;
    }

    var anchor = closest(image, "a");
    image.setAttribute("data-theme-lightbox", "true");
    image.classList.add("theme-lightbox-trigger");

    if (anchor) {
      anchor.classList.add("theme-lightbox-trigger-link");
      anchor.setAttribute("aria-haspopup", "dialog");
    } else {
      image.setAttribute("tabindex", "0");
      image.setAttribute("role", "button");
      image.setAttribute("aria-haspopup", "dialog");
    }
  }

  function enhanceImages(root) {
    if (!root || typeof root.querySelectorAll !== "function") {
      return;
    }

    Array.prototype.forEach.call(root.querySelectorAll(IMAGE_SELECTOR), enhanceImage);
  }

  function isPlainPrimaryClick(event) {
    return !event.defaultPrevented &&
      (event.button === undefined || event.button === 0) &&
      !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  function startImageLightbox() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", startImageLightbox, { once: true });
      return;
    }

    enhanceImages(document);

    document.addEventListener("click", function (event) {
      if (lightbox && (event.target === lightbox.overlay || event.target === lightbox.stage)) {
        closeLightbox();
        return;
      }

      if (lightbox && event.target === lightbox.closeButton) {
        closeLightbox();
        return;
      }

      if (!isPlainPrimaryClick(event)) {
        return;
      }

      if (lightbox && !lightbox.overlay.hidden) {
        if (event.target === lightbox.zoomIn) {
          setZoom(zoom + 0.25);
        } else if (event.target === lightbox.zoomOut) {
          setZoom(zoom - 0.25);
        } else if (event.target === lightbox.zoomReset) {
          setZoom(1);
        }
        return;
      }

      var image = findImageFromTarget(event.target);
      if (!image) {
        return;
      }

      event.preventDefault();
      openLightbox(image);
    }, true);

    document.addEventListener("keydown", function (event) {
      if (lightbox && !lightbox.overlay.hidden) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeLightbox();
        } else if (event.key === "Tab") {
          event.preventDefault();
          cycleLightboxFocus(event.shiftKey);
        } else if (!event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.altKey) {
          if (event.key === "+" || event.key === "=" || event.key === "-" || event.key === "0") {
            event.preventDefault();
            setZoom(event.key === "0" ? 1 : zoom + (event.key === "-" ? -0.25 : 0.25));
          }
        }
        return;
      }

      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      var image = findImageFromTarget(event.target);
      if (!image) {
        return;
      }

      event.preventDefault();
      openLightbox(image);
    });

    document.addEventListener("cancel", function (event) {
      if (!lightbox || event.target !== lightbox.overlay) {
        return;
      }

      event.preventDefault();
      closeLightbox();
    }, true);

    document.addEventListener("load", function (event) {
      if (lightbox && !lightbox.overlay.hidden && event.target === lightbox.preview) {
        lightbox.overlay.classList.remove("is-loading", "has-error");
        fitImage();
      }
    }, true);

    document.addEventListener("error", function (event) {
      if (!lightbox || lightbox.overlay.hidden || event.target !== lightbox.preview) {
        return;
      }

      resetZoom();
      if (fallbackSource && lightbox.preview.src !== fallbackSource) {
        lightbox.preview.src = fallbackSource;
        return;
      }

      lightbox.overlay.classList.remove("is-loading");
      lightbox.overlay.classList.add("has-error");
      lightbox.caption.hidden = false;
      lightbox.caption.textContent = lightbox.labels.error;
    }, true);

    document.addEventListener("wheel", function (event) {
      if (!isImageViewport(event.target) || lightbox.overlay.hidden || !fitWidth ||
          event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey ||
          event.shiftKey || !event.deltaY) {
        return;
      }
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? 0.25 : -0.25), event.clientX, event.clientY);
    }, { passive: false });

    document.addEventListener("pointerdown", function (event) {
      if (!isImageViewport(event.target) || lightbox.overlay.hidden || zoom <= 1 ||
          event.pointerType !== "mouse" || !isPlainPrimaryClick(event)) {
        return;
      }
      event.preventDefault();
      var viewport = lightbox.viewport;
      viewport.focus({ preventScroll: true });
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
        left: viewport.scrollLeft, top: viewport.scrollTop };
      viewport.classList.add("is-dragging");
      if (typeof viewport.setPointerCapture === "function") {
        viewport.setPointerCapture(event.pointerId);
      }
    });

    document.addEventListener("pointermove", function (event) {
      if (!drag || event.pointerId !== drag.id) {
        return;
      }
      lightbox.viewport.scrollLeft = drag.left + drag.x - event.clientX;
      lightbox.viewport.scrollTop = drag.top + drag.y - event.clientY;
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (type) {
      document.addEventListener(type, function (event) {
        if (drag && event.pointerId === drag.id) {
          endDrag();
        }
      });
    });

    window.addEventListener("resize", function () {
      if (lightbox && !lightbox.overlay.hidden && fitWidth) {
        fitImage();
      }
    });

    if (typeof MutationObserver === "function") {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
            if (node.nodeType !== 1) {
              return;
            }

            enhanceImage(node);
            enhanceImages(node);
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  startImageLightbox();
})();

(function () {
  "use strict";

  var TIMER_STORAGE_PREFIX = "bs-redmine-theme-dark.issue-timers.v1.user-";
  var TIMER_ACTION_SELECTOR = "#content > .contextual > a.icon-time-add";
  var TIMER_LINK_MARKER = "data-theme-issue-timer-link";
  var controls = [];
  var storage = null;
  var storageKey = "";

  function labelsForPage() {
    var language = (document.documentElement.lang || "en").toLowerCase();

    return language.indexOf("pt") === 0
      ? {
          start: "Iniciar timer",
          startTitle: "Iniciar timer desta tarefa",
          stop: "Encerrar timer",
          stopTitle: "Encerrar timer e apontar tempo",
          elapsed: "Tempo decorrido",
          storageError: "O timer local não está disponível neste navegador."
        }
      : {
          start: "Start timer",
          startTitle: "Start this issue timer",
          stop: "Finish timer",
          stopTitle: "Finish timer and log time",
          elapsed: "Elapsed time",
          storageError: "The local timer is not available in this browser."
        };
  }

  var labels = labelsForPage();

  function localStorageForPage() {
    try {
      return window.localStorage || null;
    } catch (_error) {
      return null;
    }
  }

  function currentUserId() {
    if (typeof document.querySelector !== "function" || typeof URL !== "function") {
      return "current";
    }

    var userLink = document.querySelector("#loggedas a.user") ||
      document.querySelector("#loggedas a");

    if (!userLink || !userLink.href) {
      return "current";
    }

    try {
      var path = new URL(userLink.href, window.location.href).pathname;
      var match = path.match(/\/users\/(\d+)(?:\/|$)/);
      return match ? match[1] : "current";
    } catch (_error) {
      return "current";
    }
  }

  function readTimers() {
    if (!storage) {
      return {};
    }

    try {
      var parsed = JSON.parse(storage.getItem(storageKey) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function writeTimers(timers) {
    if (!storage) {
      return false;
    }

    try {
      storage.setItem(storageKey, JSON.stringify(timers));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function timerForIssue(timers, issueId) {
    var timer = timers[String(issueId)];
    var startedAt = timer && Number(timer.startedAt);

    if (!timer || !isFinite(startedAt) || startedAt <= 0) {
      return null;
    }

    return timer;
  }

  function issueFromLink(link) {
    if (!link || !link.href || typeof URL !== "function") {
      return null;
    }

    try {
      var url = new URL(link.href, window.location.href);
      var match = url.pathname.match(/\/issues\/(\d+)\/time_entries\/new\/?$/);

      if (url.origin !== window.location.origin || !match) {
        return null;
      }

      return {
        id: match[1],
        timeEntryUrl: url.href
      };
    } catch (_error) {
      return null;
    }
  }

  function currentIssuePath() {
    try {
      var url = new URL(window.location.href);
      return url.pathname + url.search + url.hash;
    } catch (_error) {
      return window.location.pathname || "/";
    }
  }

  function elapsedMilliseconds(timer) {
    return Math.max(0, Date.now() - Number(timer.startedAt));
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function formatElapsed(milliseconds) {
    var totalSeconds = Math.floor(milliseconds / 1000);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
  }

  function decimalHours(milliseconds) {
    var roundedMinutes = Math.max(1, Math.round(milliseconds / 60000));
    return (roundedMinutes / 60).toFixed(2);
  }

  function renderControl(control, timer) {
    var running = Boolean(timer);

    control.wrapper.classList.toggle("is-running", running);
    control.wrapper.classList.remove("has-error");
    control.button.disabled = false;
    control.button.setAttribute("aria-pressed", running ? "true" : "false");
    control.button.title = running ? labels.stopTitle : labels.startTitle;
    control.label.textContent = running ? labels.stop : labels.start;
    control.output.hidden = !running;

    if (running) {
      var elapsed = formatElapsed(elapsedMilliseconds(timer));
      control.output.textContent = elapsed;
      control.output.setAttribute("aria-label", labels.elapsed + ": " + elapsed);
    } else {
      control.output.textContent = "";
      control.output.removeAttribute("aria-label");
    }
  }

  function renderAllControls() {
    var timers = readTimers();

    controls.forEach(function (control) {
      renderControl(control, timerForIssue(timers, control.issue.id));
    });
  }

  function showStorageError(issueId) {
    controls.forEach(function (control) {
      if (control.issue.id !== issueId) {
        return;
      }

      control.wrapper.classList.add("has-error");
      control.button.disabled = true;
      control.output.hidden = false;
      control.output.textContent = labels.storageError;
      control.output.setAttribute("aria-label", labels.storageError);
    });
  }

  function startTimer(issue) {
    var timers = readTimers();

    timers[String(issue.id)] = {
      startedAt: Date.now()
    };

    if (!writeTimers(timers)) {
      showStorageError(issue.id);
      return;
    }

    renderAllControls();
  }

  function timeEntryUrl(issue, elapsed) {
    var url = new URL(issue.timeEntryUrl, window.location.href);

    if (url.origin !== window.location.origin) {
      url = new URL(issue.timeEntryUrl, window.location.href);
    }

    url.hash = "";
    url.searchParams.set("time_entry[hours]", decimalHours(elapsed));
    url.searchParams.set("back_url", currentIssuePath());
    return url.href;
  }

  function finishTimer(issue, timer) {
    var elapsed = elapsedMilliseconds(timer);
    var timers = readTimers();

    delete timers[String(issue.id)];

    if (!writeTimers(timers)) {
      showStorageError(issue.id);
      return;
    }

    renderAllControls();
    window.location.assign(timeEntryUrl(issue, elapsed));
  }

  function toggleTimer(issue) {
    var timers = readTimers();
    var timer = timerForIssue(timers, issue.id);

    if (timer) {
      finishTimer(issue, timer);
    } else {
      startTimer(issue);
    }
  }

  function createControl(link, issue) {
    var wrapper = document.createElement("span");
    var button = document.createElement("button");
    var label = document.createElement("span");
    var output = document.createElement("output");
    var control = {
      issue: issue,
      wrapper: wrapper,
      button: button,
      label: label,
      output: output
    };

    wrapper.className = "theme-issue-timer";
    wrapper.setAttribute("data-issue-id", issue.id);
    button.type = "button";
    button.className = "theme-issue-timer__button";
    label.className = "theme-issue-timer__label";
    output.className = "theme-issue-timer__elapsed";
    output.hidden = true;
    output.setAttribute("aria-live", "off");

    button.appendChild(label);
    wrapper.appendChild(button);
    wrapper.appendChild(output);
    link.parentNode.insertBefore(wrapper, link);
    link.setAttribute(TIMER_LINK_MARKER, "true");
    controls.push(control);

    button.addEventListener("click", function (event) {
      event.preventDefault();
      toggleTimer(issue);
    });

    return control;
  }

  function initializeIssueTimers() {
    var initializedControl = false;

    if (!storage || typeof document.querySelectorAll !== "function") {
      return;
    }

    Array.prototype.forEach.call(document.querySelectorAll(TIMER_ACTION_SELECTOR), function (link) {
      if (link.getAttribute(TIMER_LINK_MARKER) === "true") {
        return;
      }

      var issue = issueFromLink(link);
      if (issue) {
        createControl(link, issue);
        initializedControl = true;
      }
    });

    if (initializedControl) {
      renderAllControls();
    }
  }

  function startIssueTimers() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", startIssueTimers, { once: true });
      return;
    }

    storage = localStorageForPage();
    if (!storage || typeof document.querySelectorAll !== "function") {
      return;
    }

    storageKey = TIMER_STORAGE_PREFIX + currentUserId();
    initializeIssueTimers();
    window.setInterval(renderAllControls, 1000);
    window.addEventListener("storage", function (event) {
      if (event.key === storageKey) {
        renderAllControls();
      }
    });
    document.addEventListener("visibilitychange", renderAllControls);

    if (typeof MutationObserver === "function") {
      var observer = new MutationObserver(initializeIssueTimers);
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  startIssueTimers();
})();
