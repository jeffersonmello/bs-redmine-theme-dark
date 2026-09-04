"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync("javascripts/theme.js", "utf8");

class FakeClassList {
  constructor(initial = []) {
    this.values = new Set(initial);
  }

  add(value) {
    this.values.add(value);
  }

  contains(value) {
    return this.values.has(value);
  }

  toggle(value, force) {
    if (force) this.values.add(value);
    else this.values.delete(value);
    return force;
  }
}

class FakeElement {
  constructor(tagName, id, initialClasses = []) {
    this.tagName = tagName;
    this.id = id || "";
    this.classList = new FakeClassList(initialClasses);
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.textContent = "";
    this.title = "";
    this.type = "";
  }

  appendChild(child) {
    this.children.push(child);
    if (child.id && this.ownerDocument) this.ownerDocument.elements[child.id] = child;
    return child;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  addEventListener(name, callback) {
    this.listeners[name] = callback;
  }

  click() {
    this.listeners.click();
  }
}

function loadTheme({ collapsed = false, desktop = true, noSidebar = false, storageThrows = false, legacyToggle = false } = {}) {
  const elements = {};
  const document = {
    readyState: "complete",
    documentElement: { lang: "pt-BR" },
    body: new FakeElement("body"),
    elements,
    createElement(tagName) {
      const element = new FakeElement(tagName);
      element.ownerDocument = document;
      return element;
    },
    getElementById(id) {
      return elements[id] || null;
    },
    addEventListener() {}
  };

  elements.main = new FakeElement("div", "main", noSidebar ? ["nosidebar"] : []);
  elements.sidebar = new FakeElement("div", "sidebar");
  elements.content = new FakeElement("div", "content");
  if (legacyToggle) elements["toggle-sidebar"] = new FakeElement("a", "toggle-sidebar");
  Object.values(elements).forEach((element) => { element.ownerDocument = document; });

  const values = new Map();
  if (collapsed) values.set("bs-redmine-theme-dark.sidebar-collapsed", "true");
  const localStorage = {
    getItem(key) {
      if (storageThrows) throw new Error("blocked");
      return values.get(key) || null;
    },
    setItem(key, value) {
      if (storageThrows) throw new Error("blocked");
      values.set(key, value);
    }
  };

  const mediaListeners = [];
  const window = {
    localStorage,
    matchMedia() {
      return {
        matches: desktop,
        addEventListener(_name, callback) { mediaListeners.push(callback); }
      };
    }
  };

  vm.runInNewContext(source, { document, window });
  return { document, elements, values };
}

test("creates a localized accessible toggle and persists both states", () => {
  const { document, elements, values } = loadTheme();
  const button = elements["theme-sidebar-toggle"];

  assert.ok(button);
  assert.equal(button.getAttribute("aria-controls"), "sidebar");
  assert.equal(button.getAttribute("aria-expanded"), "true");
  assert.equal(button.getAttribute("aria-label"), "Ocultar barra lateral");

  button.click();
  assert.equal(document.body.classList.contains("theme-sidebar-collapsed"), true);
  assert.equal(button.getAttribute("aria-expanded"), "false");
  assert.equal(button.getAttribute("aria-label"), "Mostrar barra lateral");
  assert.equal(values.get("bs-redmine-theme-dark.sidebar-collapsed"), "true");

  button.click();
  assert.equal(document.body.classList.contains("theme-sidebar-collapsed"), false);
  assert.equal(values.get("bs-redmine-theme-dark.sidebar-collapsed"), "false");
});

test("restores a collapsed desktop preference", () => {
  const { document, elements } = loadTheme({ collapsed: true });
  assert.equal(document.body.classList.contains("theme-sidebar-collapsed"), true);
  assert.equal(elements["theme-sidebar-toggle"].getAttribute("aria-expanded"), "false");
});

test("does not create a toggle for nosidebar pages", () => {
  const { elements } = loadTheme({ noSidebar: true });
  assert.equal(elements["theme-sidebar-toggle"], undefined);
});

test("does not collapse the Redmine mobile layout", () => {
  const { document, elements } = loadTheme({ collapsed: true, desktop: false });
  assert.equal(document.body.classList.contains("theme-sidebar-collapsed"), false);
  assert.equal(elements["theme-sidebar-toggle"].getAttribute("aria-expanded"), "true");
});

test("remains usable when local storage is blocked", () => {
  const { document, elements } = loadTheme({ storageThrows: true });
  elements["theme-sidebar-toggle"].click();
  assert.equal(document.body.classList.contains("theme-sidebar-collapsed"), true);
});

test("suppresses a competing legacy Smile sidebar control", () => {
  const { elements } = loadTheme({ legacyToggle: true });
  const legacyToggle = elements["toggle-sidebar"];
  assert.equal(legacyToggle.hidden, true);
  assert.equal(legacyToggle.tabIndex, -1);
  assert.equal(legacyToggle.getAttribute("aria-hidden"), "true");
});
