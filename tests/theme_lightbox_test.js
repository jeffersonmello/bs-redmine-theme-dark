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
    this.clientX = options.clientX === undefined ? 0 : options.clientX;
    this.clientY = options.clientY === undefined ? 0 : options.clientY;
    this.deltaY = options.deltaY === undefined ? 0 : options.deltaY;
    this.pointerType = options.pointerType || "mouse";
    this.pointerId = options.pointerId === undefined ? 1 : options.pointerId;
    this.buttons = options.buttons === undefined ? 1 : options.buttons;
    this.defaultPrevented = Boolean(options.defaultPrevented);
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
    this.open = false;
    this.style = {};
    this.clientWidth = 800;
    this.clientHeight = 600;
    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this.scrollLeft = 0;
    this.scrollTop = 0;
    this.complete = false;
    this.capturedPointers = new Set();
    this.rect = { left: 0, top: 0 };
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

  showModal() {
    if (this.tagName !== "DIALOG") throw new Error("showModal requires a dialog");
    this.open = true;
    this.setAttribute("open", "");
  }

  close() {
    if (this.tagName !== "DIALOG") throw new Error("close requires a dialog");
    this.open = false;
    this.removeAttribute("open");
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

  getBoundingClientRect() {
    return {
      ...this.rect,
      width: this.clientWidth,
      height: this.clientHeight,
      right: this.rect.left + this.clientWidth,
      bottom: this.rect.top + this.clientHeight
    };
  }

  setPointerCapture(pointerId) {
    this.capturedPointers.add(pointerId);
  }

  releasePointerCapture(pointerId) {
    this.capturedPointers.delete(pointerId);
  }

  hasPointerCapture(pointerId) {
    return this.capturedPointers.has(pointerId);
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
    eventListeners: new Map(),
    addEventListener(type, listener) {
      if (!this.eventListeners.has(type)) this.eventListeners.set(type, []);
      this.eventListeners.get(type).push(listener);
    },
    dispatchEvent(event) {
      (this.eventListeners.get(event.type) || []).forEach((listener) => listener.call(this, event));
      return !event.defaultPrevented;
    },
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
  return { document, window, observers, ...fixtures };
}

function byClass(document, className) {
  return document.body.querySelector(`.${className}`);
}

function openPreview(environment) {
  const { document, image, anchor } = environment;
  document.dispatchEvent(new FakeEvent("click", { target: anchor || image, button: 0 }));
  return {
    modal: document.getElementById("theme-image-lightbox"),
    preview: byClass(document, "theme-lightbox__image"),
    viewport: byClass(document, "theme-lightbox__viewport"),
    canvas: byClass(document, "theme-lightbox__canvas"),
    zoomIn: byClass(document, "theme-lightbox__zoom-in"),
    zoomOut: byClass(document, "theme-lightbox__zoom-out"),
    zoomReset: byClass(document, "theme-lightbox__zoom-reset"),
    zoomLevel: byClass(document, "theme-lightbox__zoom-level"),
    close: byClass(document, "theme-lightbox__close")
  };
}

function loadPreview(document, refs, width = 1600, height = 1200) {
  refs.preview.naturalWidth = width;
  refs.preview.naturalHeight = height;
  refs.preview.complete = true;
  document.dispatchEvent(new FakeEvent("load", { target: refs.preview }));
}

function clickControl(document, target) {
  const event = new FakeEvent("click", { target, button: 0 });
  document.dispatchEvent(event);
  return event;
}

function assertPreviewSize(preview, width, height) {
  assert.equal(Number(preview.getAttribute("width")), width);
  assert.equal(Number(preview.getAttribute("height")), height);
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
  assert.equal(modal.tagName, "DIALOG");
  assert.equal(modal.hidden, false);
  assert.equal(modal.open, true);
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
  assert.equal(modal.open, false);
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

  document.dispatchEvent(new FakeEvent("click", { target: anchor, button: 0 }));
  const cancel = new FakeEvent("cancel", { target: modal });
  document.dispatchEvent(cancel);
  assert.equal(cancel.defaultPrevented, true);
  assert.equal(modal.hidden, true);
  assert.equal(modal.open, false);
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

test("fits landscape, portrait and small images before enabling bounded zoom", () => {
  const environment = createEnvironment((document) => addImage(document));
  const { document } = environment;
  const refs = openPreview(environment);

  assert.equal(refs.viewport.getAttribute("tabindex"), "-1");
  assert.ok(refs.viewport.getAttribute("aria-label"));
  [refs.zoomIn, refs.zoomOut, refs.zoomReset].forEach((button) => {
    assert.equal(button.getAttribute("aria-disabled"), "true");
    clickControl(document, button);
  });
  assert.equal(refs.zoomLevel.textContent, "100%");

  loadPreview(document, refs, 1600, 800);
  assert.equal(refs.viewport.getAttribute("tabindex"), "0");
  assertPreviewSize(refs.preview, 800, 400);
  assert.equal(refs.zoomIn.getAttribute("aria-disabled"), "false");
  assert.equal(refs.zoomOut.getAttribute("aria-disabled"), "true");

  clickControl(document, refs.zoomIn);
  assert.equal(refs.zoomLevel.textContent, "125%");
  assertPreviewSize(refs.preview, 1000, 500);
  assert.equal(refs.zoomOut.getAttribute("aria-disabled"), "false");

  for (let count = 0; count < 20; count += 1) clickControl(document, refs.zoomIn);
  assert.equal(refs.zoomLevel.textContent, "400%");
  assertPreviewSize(refs.preview, 3200, 1600);
  assert.equal(refs.zoomIn.getAttribute("aria-disabled"), "true");
  assert.equal(refs.modal.hidden, false);

  for (let count = 0; count < 20; count += 1) clickControl(document, refs.zoomOut);
  assert.equal(refs.zoomLevel.textContent, "100%");
  assertPreviewSize(refs.preview, 800, 400);
  assert.equal(refs.zoomOut.getAttribute("aria-disabled"), "true");
  assert.equal(refs.viewport.scrollLeft, 0);
  assert.equal(refs.viewport.scrollTop, 0);

  clickControl(document, refs.close);
  openPreview(environment);
  loadPreview(document, refs, 800, 1600);
  assertPreviewSize(refs.preview, 300, 600);

  clickControl(document, refs.close);
  openPreview(environment);
  loadPreview(document, refs, 200, 100);
  assertPreviewSize(refs.preview, 200, 100);
});

test("cycles every zoom control and the ready viewport with Tab and Shift+Tab", () => {
  const environment = createEnvironment((document) => addImage(document, {
    anchorHref: "https://redmine.test/redmine/attachments/42"
  }));
  const { document, anchor } = environment;
  const refs = openPreview(environment);

  function tab(expected, shiftKey = false) {
    const event = new FakeEvent("keydown", {
      target: document.activeElement,
      key: "Tab",
      shiftKey
    });
    document.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
    assert.equal(document.activeElement, expected);
  }

  assert.equal(document.activeElement, refs.close);
  tab(refs.zoomOut);
  tab(refs.zoomReset);
  tab(refs.zoomIn);
  tab(refs.close);

  loadPreview(document, refs);
  tab(refs.viewport);
  tab(refs.zoomOut);
  tab(refs.zoomReset);
  tab(refs.zoomIn);
  tab(refs.close);
  tab(refs.zoomIn, true);
  tab(refs.zoomReset, true);
  tab(refs.zoomOut, true);
  tab(refs.viewport, true);
  tab(refs.close, true);

  document.activeElement = anchor;
  tab(refs.close);
  document.dispatchEvent(new FakeEvent("keydown", { target: refs.close, key: "Escape" }));
  assert.equal(refs.modal.hidden, true);
  assert.equal(document.activeElement, anchor);
});

test("supports zoom keyboard shortcuts while preserving browser shortcuts", () => {
  const environment = createEnvironment((document) => addImage(document));
  const { document } = environment;
  const refs = openPreview(environment);
  loadPreview(document, refs);

  function key(value, options = {}) {
    const event = new FakeEvent("keydown", { target: refs.close, key: value, ...options });
    document.dispatchEvent(event);
    return event;
  }

  assert.equal(key("+", { shiftKey: true }).defaultPrevented, true);
  assert.equal(refs.zoomLevel.textContent, "125%");
  assert.equal(key("=").defaultPrevented, true);
  assert.equal(refs.zoomLevel.textContent, "150%");
  assert.equal(key("-").defaultPrevented, true);
  assert.equal(refs.zoomLevel.textContent, "125%");

  for (const modifier of ["ctrlKey", "metaKey", "altKey"]) {
    for (const shortcut of ["+", "=", "-", "0"]) {
      assert.equal(key(shortcut, { [modifier]: true }).defaultPrevented, false);
      assert.equal(refs.zoomLevel.textContent, "125%");
    }
  }
  assert.equal(key("ArrowDown").defaultPrevented, false);
  assert.equal(key("+", { defaultPrevented: true }).defaultPrevented, true);
  assert.equal(refs.zoomLevel.textContent, "125%");

  assert.equal(key("0").defaultPrevented, true);
  assert.equal(refs.zoomLevel.textContent, "100%");
  assertPreviewSize(refs.preview, 800, 600);
  assert.equal(refs.viewport.scrollLeft, 0);
  assert.equal(refs.viewport.scrollTop, 0);
});

test("anchors wheel zoom to the pointer and leaves modified or unrelated wheels alone", () => {
  const environment = createEnvironment((document) => addImage(document));
  const { document } = environment;
  const refs = openPreview(environment);
  refs.viewport.rect = { left: 100, top: 50 };
  loadPreview(document, refs);

  function wheel(target, options = {}) {
    const event = new FakeEvent("wheel", {
      target,
      deltaY: -100,
      clientX: 300,
      clientY: 200,
      ...options
    });
    document.dispatchEvent(event);
    return event;
  }

  for (const modifier of ["ctrlKey", "metaKey", "altKey", "shiftKey"]) {
    assert.equal(wheel(refs.viewport, { [modifier]: true }).defaultPrevented, false);
  }
  assert.equal(wheel(refs.close).defaultPrevented, false);
  assert.equal(wheel(refs.viewport, { deltaY: 0 }).defaultPrevented, false);
  assert.equal(refs.zoomLevel.textContent, "100%");

  assert.equal(wheel(refs.preview).defaultPrevented, true);
  assert.equal(refs.zoomLevel.textContent, "125%");
  assert.ok(Math.abs(refs.viewport.scrollLeft - 50) <= 1);
  assert.ok(Math.abs(refs.viewport.scrollTop - 37.5) <= 1);

  assert.equal(wheel(refs.canvas).defaultPrevented, true);
  assert.equal(refs.zoomLevel.textContent, "150%");
  assert.equal(wheel(refs.viewport, { deltaY: 100 }).defaultPrevented, true);
  assert.equal(refs.zoomLevel.textContent, "125%");
  clickControl(document, refs.zoomReset);
  assert.equal(refs.zoomLevel.textContent, "100%");
  assert.equal(refs.viewport.scrollLeft, 0);
  assert.equal(refs.viewport.scrollTop, 0);
});

test("pans a zoomed image with a mouse and ends dragging outside the viewport", () => {
  const environment = createEnvironment((document) => addImage(document));
  const { document } = environment;
  const refs = openPreview(environment);
  loadPreview(document, refs);

  const fitPointer = new FakeEvent("pointerdown", {
    target: refs.preview,
    button: 0,
    clientX: 500,
    clientY: 400
  });
  document.dispatchEvent(fitPointer);
  assert.equal(fitPointer.defaultPrevented, false);

  for (let count = 0; count < 4; count += 1) clickControl(document, refs.zoomIn);
  const initialLeft = refs.viewport.scrollLeft;
  const initialTop = refs.viewport.scrollTop;
  const touch = new FakeEvent("pointerdown", {
    target: refs.preview,
    button: 0,
    pointerType: "touch"
  });
  document.dispatchEvent(touch);
  assert.equal(touch.defaultPrevented, false);

  document.dispatchEvent(new FakeEvent("pointerdown", {
    target: refs.preview,
    button: 0,
    clientX: 500,
    clientY: 400
  }));
  document.dispatchEvent(new FakeEvent("pointermove", {
    target: refs.viewport,
    clientX: 450,
    clientY: 350
  }));
  assert.equal(refs.viewport.scrollLeft, initialLeft + 50);
  assert.equal(refs.viewport.scrollTop, initialTop + 50);
  assert.equal(refs.modal.hidden, false);

  document.dispatchEvent(new FakeEvent("pointerup", { target: document.body }));
  document.dispatchEvent(new FakeEvent("pointermove", {
    target: refs.viewport,
    clientX: 400,
    clientY: 300
  }));
  assert.equal(refs.viewport.scrollLeft, initialLeft + 50);
  assert.equal(refs.viewport.scrollTop, initialTop + 50);

  document.dispatchEvent(new FakeEvent("pointerdown", {
    target: refs.preview,
    button: 0,
    clientX: 450,
    clientY: 350
  }));
  document.dispatchEvent(new FakeEvent("pointercancel", { target: refs.viewport }));
  document.dispatchEvent(new FakeEvent("pointermove", {
    target: refs.viewport,
    clientX: 300,
    clientY: 200
  }));
  assert.equal(refs.viewport.scrollLeft, initialLeft + 50);
  assert.equal(refs.viewport.scrollTop, initialTop + 50);
});

test("refits on viewport resize and clears zoom and scrolling when reopened", () => {
  const environment = createEnvironment((document) => addImage(document));
  const { document, window } = environment;
  const refs = openPreview(environment);
  loadPreview(document, refs);
  clickControl(document, refs.zoomIn);
  clickControl(document, refs.zoomIn);
  refs.viewport.scrollLeft = 200;
  refs.viewport.scrollTop = 150;

  refs.viewport.clientWidth = 400;
  refs.viewport.clientHeight = 300;
  window.dispatchEvent(new FakeEvent("resize"));
  assert.equal(refs.zoomLevel.textContent, "100%");
  assertPreviewSize(refs.preview, 400, 300);
  assert.equal(refs.viewport.scrollLeft, 0);
  assert.equal(refs.viewport.scrollTop, 0);

  clickControl(document, refs.zoomIn);
  clickControl(document, refs.close);
  assert.equal(refs.zoomLevel.textContent, "100%");
  assert.equal(refs.viewport.scrollLeft, 0);
  assert.equal(refs.viewport.scrollTop, 0);
  assert.equal(refs.zoomIn.getAttribute("aria-disabled"), "true");

  openPreview(environment);
  assert.equal(refs.zoomLevel.textContent, "100%");
  loadPreview(document, refs, 1200, 600);
  assertPreviewSize(refs.preview, 400, 200);
  assert.equal(refs.zoomIn.getAttribute("aria-disabled"), "false");
  assert.equal(document.body.querySelectorAll(".theme-lightbox").length, 1);
});

test("resets zoom through image fallback and errors and ignores load events after close", () => {
  const environment = createEnvironment((document) => addImage(document, {
    anchorHref: "https://redmine.test/redmine/attachments/84",
    src: "https://redmine.test/redmine/attachments/thumbnail/84/200",
    currentSrc: "https://redmine.test/redmine/attachments/thumbnail/84/200"
  }));
  const { document } = environment;
  const refs = openPreview(environment);
  loadPreview(document, refs);
  clickControl(document, refs.zoomIn);

  document.dispatchEvent(new FakeEvent("error", { target: refs.preview }));
  assert.equal(refs.preview.src, "https://redmine.test/redmine/attachments/thumbnail/84/200");
  assert.equal(refs.zoomLevel.textContent, "100%");
  assert.equal(refs.zoomIn.getAttribute("aria-disabled"), "true");
  assert.equal(refs.viewport.scrollLeft, 0);
  assert.equal(refs.viewport.scrollTop, 0);

  loadPreview(document, refs, 200, 150);
  assertPreviewSize(refs.preview, 200, 150);
  clickControl(document, refs.zoomIn);
  assertPreviewSize(refs.preview, 250, 188);

  document.dispatchEvent(new FakeEvent("error", { target: refs.preview }));
  assert.equal(refs.modal.classList.contains("has-error"), true);
  assert.equal(refs.zoomLevel.textContent, "100%");
  [refs.zoomIn, refs.zoomOut, refs.zoomReset].forEach((button) => {
    assert.equal(button.getAttribute("aria-disabled"), "true");
  });
  clickControl(document, refs.close);
  loadPreview(document, refs, 2000, 1000);
  document.dispatchEvent(new FakeEvent("error", { target: refs.preview }));
  assert.equal(refs.modal.hidden, true);
  assert.equal(refs.modal.classList.contains("has-error"), false);
  assert.equal(refs.zoomIn.getAttribute("aria-disabled"), "true");
  assert.equal(refs.preview.getAttribute("src"), null);

  openPreview(environment);
  loadPreview(document, refs, 2000, 1000);
  assert.equal(refs.modal.classList.contains("has-error"), false);
  assert.equal(refs.zoomLevel.textContent, "100%");
  assertPreviewSize(refs.preview, 800, 400);
  assert.equal(refs.zoomIn.getAttribute("aria-disabled"), "false");
});
