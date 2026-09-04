const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const themeSource = fs.readFileSync("javascripts/theme.js", "utf8");
const lightboxMarker = themeSource.indexOf('var LIGHTBOX_ID = "theme-image-lightbox"');
const lightboxStart = themeSource.lastIndexOf("\n(function () {", lightboxMarker);
const lightboxEndMarker = "\n})();";
const lightboxEnd = themeSource.indexOf(lightboxEndMarker, lightboxMarker) + lightboxEndMarker.length;

assert.notEqual(lightboxStart, -1, "image lightbox module must exist");
assert.ok(lightboxEnd > lightboxMarker, "image lightbox module must be complete");

const source = themeSource.slice(lightboxStart, lightboxEnd);

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(...names) {
    names.forEach((name) => this.values.add(name));
  }

  remove(...names) {
    names.forEach((name) => this.values.delete(name));
  }

  contains(name) {
    return this.values.has(name);
  }

  toString() {
    return Array.from(this.values).join(" ");
  }
}

class FakeEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.target = options.target || null;
    this.button = options.button;
    this.key = options.key;
    this.metaKey = Boolean(options.metaKey);
    this.ctrlKey = Boolean(options.ctrlKey);
    this.shiftKey = Boolean(options.shiftKey);
    this.altKey = Boolean(options.altKey);
    this.defaultPrevented = false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

function elementMatchesSelector(element, selector) {
  if (selector === "a") return element.tagName === "A";
  if (selector === "a.user") return element.tagName === "A" && element.classList.contains("user");
  if (selector.startsWith(".")) return element.classList.contains(selector.slice(1));
  return false;
}

class FakeElement {
  constructor(document, tagName) {
    this.ownerDocument = document;
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.id = "";
    this.parentNode = null;
    this.children = [];
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.hidden = false;
    this.textContent = "";
    this.title = "";
    this.type = "";
    this.href = "";
    this.alt = "";
    this.currentSrc = "";
    this._src = "";
    this.eligibleImage = false;
  }

  get className() {
    return this.classList.toString();
  }

  set className(value) {
    this.classList.values = new Set(String(value).split(/\s+/).filter(Boolean));
  }

  get src() {
    return this._src;
  }

  set src(value) {
    this._src = String(value || "");
    if (value) this.attributes.set("src", this._src);
    else this.attributes.delete("src");
  }

  appendChild(child) {
    if (child.parentNode) child.remove();
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  remove() {
    if (!this.parentNode) return;
    const index = this.parentNode.children.indexOf(this);
    if (index >= 0) this.parentNode.children.splice(index, 1);
    this.parentNode = null;
  }

  setAttribute(name, value) {
    const normalized = String(value);
    this.attributes.set(name, normalized);
    if (name === "src") this._src = normalized;
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "src") this._src = "";
  }

  matches(selector) {
    return this.tagName === "IMG" && this.eligibleImage && selector.includes("#content");
  }

  closest(selector) {
    const selectors = selector.split(",").map((value) => value.trim());
    let current = this;

    while (current) {
      if (selectors.some((part) => elementMatchesSelector(current, part))) return current;
      current = current.parentNode;
    }

    return null;
  }

  querySelectorAll(selector) {
    const matches = [];

    this.children.forEach(function visit(child) {
      const isImageQuery = selector === "img" && child.tagName === "IMG";
      const isEligibleQuery = selector.includes("#content") && child.tagName === "IMG" && child.eligibleImage;
      const isClassQuery = selector.startsWith(".") && child.classList.contains(selector.slice(1));

      if (isImageQuery || isEligibleQuery || isClassQuery) matches.push(child);
      child.children.forEach(visit);
    });

    return matches;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }
}

class FakeDocument {
  constructor() {
    this.readyState = "complete";
    this.documentElement = { lang: "pt-BR", clientWidth: 1440 };
    this.body = new FakeElement(this, "body");
    this.activeElement = this.body;
    this.eventListeners = new Map();
  }

  createElement(tagName) {
    return new FakeElement(this, tagName);
  }

  getElementById(id) {
    let found = null;

    (function visit(element) {
      if (found) return;
      if (element.id === id) {
        found = element;
        return;
      }
      element.children.forEach(visit);
    })(this.body);

    return found;
  }

  querySelectorAll(selector) {
    return this.body.querySelectorAll(selector);
  }

  addEventListener(type, listener) {
    if (!this.eventListeners.has(type)) this.eventListeners.set(type, []);
    this.eventListeners.get(type).push(listener);
  }

  dispatchEvent(event) {
    (this.eventListeners.get(event.type) || []).forEach((listener) => listener.call(this, event));
    return !event.defaultPrevented;
  }
}

function addImage(document, options = {}) {
  const content = document.getElementById("content");
  const image = document.createElement("img");

  image.eligibleImage = options.eligible !== false;
  image.src = options.src || "/redmine/attachments/thumbnail/42/200";
  image.currentSrc = options.currentSrc || image.src;
  image.setAttribute("alt", options.alt || "Captura da tarefa");
  image.alt = image.getAttribute("alt");
  (options.classes || []).forEach((name) => image.classList.add(name));

  if (options.anchorHref) {
    const anchor = document.createElement("a");
    anchor.href = options.anchorHref;
    if (options.anchorTitle) anchor.setAttribute("title", options.anchorTitle);
    anchor.appendChild(image);
    content.appendChild(anchor);
    return { anchor, image };
  }

  content.appendChild(image);
  return { anchor: null, image };
}

function createEnvironment(configure) {
  const document = new FakeDocument();
  const content = document.createElement("div");
  const observers = [];

  content.id = "content";
  document.body.appendChild(content);

  class FakeMutationObserver {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }

    observe() {}
  }

  const window = {
    document,
    location: {
      href: "https://redmine.test/redmine/issues/49125",
      origin: "https://redmine.test"
    }
  };

  const fixtures = configure ? configure(document) : {};
  const context = vm.createContext({
    window,
    document,
    URL,
    MutationObserver: FakeMutationObserver,
    console
  });

  vm.runInContext(source, context);
  return { document, observers, ...fixtures };
}

function byClass(document, className) {
  return document.body.querySelector(`.${className}`);
}

test("opens Redmine 5.1.4 attachment thumbnails in an accessible modal", () => {
  const { document, anchor, image } = createEnvironment((currentDocument) => addImage(currentDocument, {
    anchorHref: "https://redmine.test/redmine/attachments/42",
    anchorTitle: "captura.png"
  }));

  assert.equal(image.getAttribute("data-theme-lightbox"), "true");
  assert.equal(anchor.getAttribute("aria-haspopup"), "dialog");

  const click = new FakeEvent("click", { target: anchor, button: 0 });
  document.dispatchEvent(click);

  const modal = document.getElementById("theme-image-lightbox");
  const preview = byClass(document, "theme-lightbox__image");
  const close = byClass(document, "theme-lightbox__close");

  assert.equal(click.defaultPrevented, true);
  assert.equal(modal.hidden, false);
  assert.equal(modal.getAttribute("role"), "dialog");
  assert.equal(modal.getAttribute("aria-modal"), "true");
  assert.equal(modal.getAttribute("aria-hidden"), "false");
  assert.equal(preview.src, "https://redmine.test/redmine/attachments/download/42");
  assert.equal(document.body.classList.contains("theme-lightbox-open"), true);
  assert.equal(document.activeElement, close);

  document.dispatchEvent(new FakeEvent("load", { target: preview }));
  assert.equal(modal.classList.contains("is-loading"), false);

  const escape = new FakeEvent("keydown", { target: close, key: "Escape" });
  document.dispatchEvent(escape);

  assert.equal(escape.defaultPrevented, true);
  assert.equal(modal.hidden, true);
  assert.equal(modal.getAttribute("aria-hidden"), "true");
  assert.equal(document.body.classList.contains("theme-lightbox-open"), false);
  assert.equal(document.activeElement, anchor);

  document.dispatchEvent(new FakeEvent("click", { target: anchor, button: 0 }));
  document.activeElement = anchor;
  const tab = new FakeEvent("keydown", { target: anchor, key: "Tab" });
  document.dispatchEvent(tab);

  assert.equal(tab.defaultPrevented, true);
  assert.equal(document.activeElement, close);

  document.dispatchEvent(new FakeEvent("click", { target: modal, button: 0 }));
  assert.equal(modal.hidden, true);

  document.dispatchEvent(new FakeEvent("click", { target: anchor, button: 0 }));
  document.dispatchEvent(new FakeEvent("click", { target: close, button: 0 }));
  assert.equal(modal.hidden, true);
  assert.equal(document.body.querySelectorAll(".theme-lightbox").length, 1);
});

test("keeps avatars, emoji and modified attachment clicks out of the lightbox", () => {
  const { document, regular, avatar, emoji } = createEnvironment((currentDocument) => ({
    regular: addImage(currentDocument, {
      anchorHref: "https://redmine.test/redmine/attachments/51"
    }),
    avatar: addImage(currentDocument, { classes: ["gravatar"] }),
    emoji: addImage(currentDocument, { classes: ["emoji"] })
  }));

  assert.equal(avatar.image.getAttribute("data-theme-lightbox"), null);
  assert.equal(emoji.image.getAttribute("data-theme-lightbox"), null);

  const click = new FakeEvent("click", {
    target: regular.anchor,
    button: 0,
    ctrlKey: true
  });
  document.dispatchEvent(click);

  assert.equal(click.defaultPrevented, false);
  assert.equal(document.getElementById("theme-image-lightbox"), null);
});

test("enhances dynamic inline images and supports keyboard opening", () => {
  const { document, observers } = createEnvironment();
  const dynamic = addImage(document, {
    src: "https://redmine.test/redmine/attachments/download/73/photo.png",
    currentSrc: "https://redmine.test/redmine/attachments/download/73/photo.png"
  });

  observers[0].callback([{ addedNodes: [dynamic.image] }]);

  assert.equal(dynamic.image.getAttribute("tabindex"), "0");
  assert.equal(dynamic.image.getAttribute("role"), "button");
  assert.equal(dynamic.image.getAttribute("aria-haspopup"), "dialog");

  const enter = new FakeEvent("keydown", { target: dynamic.image, key: "Enter" });
  document.dispatchEvent(enter);

  assert.equal(enter.defaultPrevented, true);
  assert.equal(document.getElementById("theme-image-lightbox").hidden, false);
  assert.equal(byClass(document, "theme-lightbox__image").src,
    "https://redmine.test/redmine/attachments/download/73/photo.png");
});

test("falls back to the rendered image and reports a localized load error", () => {
  const { document, anchor } = createEnvironment((currentDocument) => addImage(currentDocument, {
    anchorHref: "https://redmine.test/redmine/attachments/84",
    src: "https://redmine.test/redmine/attachments/thumbnail/84/200",
    currentSrc: "https://redmine.test/redmine/attachments/thumbnail/84/200"
  }));

  document.dispatchEvent(new FakeEvent("click", { target: anchor, button: 0 }));

  const modal = document.getElementById("theme-image-lightbox");
  const preview = byClass(document, "theme-lightbox__image");
  const caption = byClass(document, "theme-lightbox__caption");

  document.dispatchEvent(new FakeEvent("error", { target: preview }));
  assert.equal(preview.src, "https://redmine.test/redmine/attachments/thumbnail/84/200");

  document.dispatchEvent(new FakeEvent("error", { target: preview }));
  assert.equal(modal.classList.contains("is-loading"), false);
  assert.equal(modal.classList.contains("has-error"), true);
  assert.equal(caption.hidden, false);
  assert.equal(caption.textContent, "Não foi possível carregar a imagem em tamanho completo.");
});
