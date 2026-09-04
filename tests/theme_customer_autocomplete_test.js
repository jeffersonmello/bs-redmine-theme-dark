const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync("javascripts/theme.js", "utf8");

class FakeClassList {
  constructor(element) {
    this.element = element;
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

  toggle(name, force) {
    const enabled = force === undefined ? !this.contains(name) : force;
    if (enabled) this.add(name);
    else this.remove(name);
    return enabled;
  }

  toString() {
    return Array.from(this.values).join(" ");
  }
}

class FakeEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = Boolean(options.bubbles);
    this.key = options.key;
    this.defaultPrevented = false;
    this.target = null;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

class FakeElement {
  constructor(document, tagName) {
    this.ownerDocument = document;
    this.tagName = tagName.toUpperCase();
    this.id = "";
    this.parentNode = null;
    this.children = [];
    this.attributes = new Map();
    this.classList = new FakeClassList(this);
    this.eventListeners = new Map();
    this.style = {};
    this.hidden = false;
    this.options = [];
    this.multiple = false;
    this.selected = false;
    this.textContent = "";
    this.value = "";
    this.form = null;
  }

  get className() {
    return this.classList.toString();
  }

  set className(value) {
    this.classList.values = new Set(String(value).split(/\s+/).filter(Boolean));
  }

  get nextSibling() {
    if (!this.parentNode) return null;
    const index = this.parentNode.children.indexOf(this);
    return this.parentNode.children[index + 1] || null;
  }

  set innerHTML(value) {
    if (value !== "") throw new Error("The fake DOM only supports clearing innerHTML");
    this.children.forEach((child) => { child.parentNode = null; });
    this.children = [];
  }

  appendChild(child) {
    if (child.parentNode) child.remove();
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  insertBefore(child, reference) {
    if (child.parentNode) child.remove();
    child.parentNode = this;
    const index = reference ? this.children.indexOf(reference) : -1;
    if (index === -1) this.children.push(child);
    else this.children.splice(index, 0, child);
    return child;
  }

  remove() {
    if (!this.parentNode) return;
    const index = this.parentNode.children.indexOf(this);
    if (index >= 0) this.parentNode.children.splice(index, 1);
    this.parentNode = null;
  }

  contains(candidate) {
    return this === candidate || this.children.some((child) => child.contains(candidate));
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener(type, listener) {
    if (!this.eventListeners.has(type)) this.eventListeners.set(type, []);
    this.eventListeners.get(type).push(listener);
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    (this.eventListeners.get(event.type) || []).forEach((listener) => listener.call(this, event));
    return !event.defaultPrevented;
  }

  click() {
    this.dispatchEvent(new FakeEvent("click", { bubbles: true }));
  }

  focus() {
    this.ownerDocument.activeElement = this;
    this.dispatchEvent(new FakeEvent("focus"));
  }

  querySelectorAll(selector) {
    const matches = [];
    const className = selector.startsWith(".") ? selector.slice(1) : null;

    this.children.forEach(function visit(child) {
      if (className && child.classList.contains(className)) matches.push(child);
      child.children.forEach(visit);
    });

    return matches;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  getBoundingClientRect() {
    return { left: 20, top: 70, right: 440, bottom: 114, width: 420, height: 44 };
  }

  scrollIntoView() {}
}

class FakeDocument {
  constructor(language = "pt-BR") {
    this.readyState = "complete";
    this.eventListeners = new Map();
    this.documentElement = { lang: language, clientWidth: 1200 };
    this.body = new FakeElement(this, "body");
    this.activeElement = this.body;
  }

  createElement(tagName) {
    return new FakeElement(this, tagName);
  }

  getElementById(id) {
    let result = null;

    (function visit(element) {
      if (result) return;
      if (element.id === id) {
        result = element;
        return;
      }
      element.children.forEach(visit);
    })(this.body);

    return result;
  }

  addEventListener(type, listener) {
    if (!this.eventListeners.has(type)) this.eventListeners.set(type, []);
    this.eventListeners.get(type).push(listener);
  }
}

function option(document, value, label, selected = false) {
  const element = document.createElement("option");
  element.value = value;
  element.textContent = label;
  element.selected = selected;
  return element;
}

function addCustomerSelect(document, { multiple = true, selected = false } = {}) {
  const field = document.createElement("div");
  const select = document.createElement("select");

  select.id = "issue_custom_field_values_4";
  select.multiple = multiple;
  select.options = [
    option(document, "", ""),
    option(document, "customer-1", "Árvore Azul", selected),
    option(document, "customer-2", "Cliente Beta")
  ];
  field.appendChild(select);
  document.body.appendChild(field);
  return select;
}

function createEnvironment({ withSelect = true, selected = false } = {}) {
  const document = new FakeDocument();
  const observerInstances = [];
  const windowListeners = new Map();

  class FakeMutationObserver {
    constructor(callback) {
      this.callback = callback;
      observerInstances.push(this);
    }

    observe() {}
  }

  const window = {
    document,
    innerWidth: 1200,
    localStorage: { getItem: () => null, setItem: () => {} },
    matchMedia: () => ({ matches: true, addEventListener: () => {} }),
    addEventListener(type, listener) {
      if (!windowListeners.has(type)) windowListeners.set(type, []);
      windowListeners.get(type).push(listener);
    },
    setTimeout(callback) { callback(); }
  };

  const select = withSelect ? addCustomerSelect(document, { selected }) : null;
  const context = vm.createContext({
    window,
    document,
    Event: FakeEvent,
    MutationObserver: FakeMutationObserver,
    console
  });

  vm.runInContext(source, context);
  return { document, observerInstances, select, window };
}

test("enhances custom field 4 with an accessible dark-theme autocomplete", () => {
  const { document, select } = createEnvironment();
  const wrapper = document.getElementById("tm-clientes-autocomplete");
  const dropdown = document.getElementById("tm-clientes-dropdown");
  const input = wrapper.querySelector(".tm-clientes-input");
  let changes = 0;

  select.addEventListener("change", () => { changes += 1; });

  assert.equal(select.classList.contains("tm-clientes-select--enhanced"), true);
  assert.equal(input.getAttribute("role"), "combobox");
  assert.equal(input.getAttribute("aria-controls"), "tm-clientes-dropdown");
  assert.equal(dropdown.getAttribute("role"), "listbox");

  input.value = "arvore";
  input.dispatchEvent(new FakeEvent("input"));
  assert.equal(dropdown.hidden, false);
  assert.equal(dropdown.children.length, 1);
  assert.equal(dropdown.children[0].textContent, "Árvore Azul");

  dropdown.children[0].dispatchEvent(new FakeEvent("mousedown"));
  dropdown.children[0].click();

  assert.equal(select.options[1].selected, true);
  assert.equal(changes, 1);
  assert.equal(wrapper.querySelector(".tm-cliente-chip").textContent, "Árvore Azul ×");
  assert.equal(input.getAttribute("aria-expanded"), "true");
});

test("supports multiple selection and Backspace removal", () => {
  const { document, select } = createEnvironment({ selected: true });
  const wrapper = document.getElementById("tm-clientes-autocomplete");
  const input = wrapper.querySelector(".tm-clientes-input");

  input.focus();
  input.dispatchEvent(new FakeEvent("keydown", { key: "ArrowDown" }));
  input.dispatchEvent(new FakeEvent("keydown", { key: "Enter" }));

  assert.equal(select.options[2].selected, true);
  assert.equal(wrapper.querySelectorAll(".tm-cliente-chip").length, 2);

  input.value = "";
  input.dispatchEvent(new FakeEvent("keydown", { key: "Backspace" }));

  assert.equal(select.options[2].selected, false);
  assert.equal(wrapper.querySelectorAll(".tm-cliente-chip").length, 1);
});

test("initializes a dynamically inserted Redmine custom field once", () => {
  const { document, observerInstances } = createEnvironment({ withSelect: false });

  assert.equal(document.getElementById("tm-clientes-autocomplete"), null);
  assert.ok(observerInstances.length >= 1);

  const select = addCustomerSelect(document);
  const mutation = [{ addedNodes: [select.parentNode] }];
  observerInstances.forEach((observer) => observer.callback(mutation));
  observerInstances.forEach((observer) => observer.callback(mutation));

  assert.equal(select.getAttribute("data-theme-customer-autocomplete"), "true");
  assert.equal(document.body.querySelectorAll(".tm-clientes-autocomplete").length, 1);
  assert.equal(document.body.querySelectorAll(".tm-clientes-dropdown").length, 1);
});
