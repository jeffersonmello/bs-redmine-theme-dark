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
