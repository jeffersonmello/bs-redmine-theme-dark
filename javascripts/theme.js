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
