const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const themeSource = fs.readFileSync("javascripts/theme.js", "utf8");
const timerMarker = themeSource.indexOf('var TIMER_STORAGE_PREFIX = "bs-redmine-theme-dark.issue-timers.v1.user-"');
const timerStart = themeSource.lastIndexOf("\n(function () {", timerMarker);
const timerEndMarker = "\n})();";
const timerEnd = themeSource.indexOf(timerEndMarker, timerMarker) + timerEndMarker.length;

assert.notEqual(timerStart, -1, "local issue timer module must exist");
assert.ok(timerEnd > timerMarker, "local issue timer module must be complete");

const source = themeSource.slice(timerStart, timerEnd);
const timerSelector = "#content > .contextual > a.icon-time-add";
const storageKey = "bs-redmine-theme-dark.issue-timers.v1.user-7";

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

  toggle(name, force) {
    const enabled = force === undefined ? !this.contains(name) : Boolean(force);
    if (enabled) this.add(name);
    else this.remove(name);
    return enabled;
  }

  toString() {
    return Array.from(this.values).join(" ");
  }
}

class FakeEvent {
  constructor(type) {
    this.type = type;
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
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.parentNode = null;
    this.children = [];
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.eventListeners = new Map();
    this.disabled = false;
    this.hidden = false;
    this.href = "";
    this.textContent = "";
    this.title = "";
    this.type = "";
  }

  get className() {
    return this.classList.toString();
  }

  set className(value) {
    this.classList.values = new Set(String(value).split(/\s+/).filter(Boolean));
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
    const event = new FakeEvent("click");
    this.dispatchEvent(event);
    return event;
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
}

class FakeDocument {
  constructor() {
    this.readyState = "complete";
    this.documentElement = { lang: "pt-BR" };
    this.body = new FakeElement(this, "body");
    this.eventListeners = new Map();
    this.actionLinks = [];
    this.userLink = new FakeElement(this, "a");
    this.userLink.href = "https://redmine.test/redmine/users/7";
  }

  createElement(tagName) {
    return new FakeElement(this, tagName);
  }

  querySelector(selector) {
    if (selector === "#loggedas a.user" || selector === "#loggedas a") return this.userLink;
    return null;
  }

  querySelectorAll(selector) {
    return selector === timerSelector ? this.actionLinks.slice() : [];
  }

  addEventListener(type, listener) {
    if (!this.eventListeners.has(type)) this.eventListeners.set(type, []);
    this.eventListeners.get(type).push(listener);
  }

  dispatchEvent(event) {
    (this.eventListeners.get(event.type) || []).forEach((listener) => listener.call(this, event));
  }
}

class FakeStorage {
  constructor(initial = {}, throwsOnWrite = false) {
    this.values = new Map(Object.entries(initial));
    this.throwsOnWrite = throwsOnWrite;
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    if (this.throwsOnWrite) throw new Error("localStorage unavailable");
    this.values.set(key, String(value));
  }
}

function createEnvironment(options = {}) {
  const clock = { now: options.now || 1_700_000_000_000 };
  const document = new FakeDocument();
  const storage = options.storage === undefined ? new FakeStorage() : options.storage;
  const intervals = [];
  const windowEvents = new Map();
  const observers = [];
  let assignedUrl = null;

  class ClockDate extends Date {
    static now() {
      return clock.now;
    }
  }

  class FakeMutationObserver {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }

    observe() {}

    trigger() {
      this.callback([]);
    }
  }

  const window = {
    localStorage: storage,
    location: {
      href: "https://redmine.test/redmine/issues/42",
      origin: "https://redmine.test",
      pathname: "/redmine/issues/42",
      assign(url) {
        assignedUrl = url;
      }
    },
    setInterval(callback) {
      intervals.push(callback);
      return intervals.length;
    },
    addEventListener(type, listener) {
      if (!windowEvents.has(type)) windowEvents.set(type, []);
      windowEvents.get(type).push(listener);
    }
  };

  function addActionLink(issueId = "42", className = "icon icon-time-add") {
    const menu = document.createElement("div");
    const link = document.createElement("a");
    menu.className = "contextual";
    link.className = className;
    link.href = `https://redmine.test/redmine/issues/${issueId}/time_entries/new`;
    menu.appendChild(link);
    document.body.appendChild(menu);
    document.actionLinks.push(link);
    return link;
  }

  addActionLink();
  addActionLink();

  vm.runInNewContext(source, {
    Date: ClockDate,
    JSON,
    Math,
    MutationObserver: FakeMutationObserver,
    URL,
    document,
    isFinite,
    window
  });

  return {
    addActionLink,
    clock,
    document,
    intervals,
    observers,
    storage,
    assignedUrl: () => assignedUrl,
    dispatchWindow(type, event) {
      (windowEvents.get(type) || []).forEach((listener) => listener(event));
    }
  };
}

function timerControls(environment) {
  return environment.document.body.querySelectorAll(".theme-issue-timer");
}

test("starts one per-issue timer and synchronizes duplicated action menus", () => {
  const environment = createEnvironment();
  const controls = timerControls(environment);

  assert.equal(controls.length, 2);
  assert.equal(controls[0].children[0].getAttribute("aria-pressed"), "false");

  const event = controls[0].children[0].click();
  const timers = JSON.parse(environment.storage.getItem(storageKey));

  assert.equal(event.defaultPrevented, true);
  assert.equal(timers["42"].startedAt, environment.clock.now);
  assert.deepEqual(Object.keys(timers["42"]), ["startedAt"]);
  controls.forEach((control) => {
    assert.equal(control.classList.contains("is-running"), true);
    assert.equal(control.children[0].getAttribute("aria-pressed"), "true");
    assert.equal(control.children[0].children[0].textContent, "Encerrar timer");
  });

  environment.clock.now += 65_000;
  environment.intervals[0]();
  controls.forEach((control) => assert.equal(control.children[1].textContent, "00:01:05"));
});

test("finishes only the current issue timer and opens native time entry prefilled", () => {
  const environment = createEnvironment({
    storage: new FakeStorage({
      [storageKey]: JSON.stringify({
        99: {
          startedAt: 1_699_999_000_000
        }
      })
    })
  });
  const button = timerControls(environment)[0].children[0];

  button.click();
  let timers = JSON.parse(environment.storage.getItem(storageKey));
  assert.deepEqual(Object.keys(timers).sort(), ["42", "99"]);

  environment.clock.now += 30 * 60_000 + 20_000;
  button.click();
  timers = JSON.parse(environment.storage.getItem(storageKey));

  assert.deepEqual(Object.keys(timers), ["99"]);
  const target = new URL(environment.assignedUrl());
  assert.equal(target.pathname, "/redmine/issues/42/time_entries/new");
  assert.equal(target.searchParams.get("time_entry[hours]"), "0.50");
  assert.equal(target.searchParams.get("back_url"), "/redmine/issues/42");
});

test("restores persisted time and enhances action menus added dynamically only once", () => {
  const now = 1_700_000_000_000;
  const environment = createEnvironment({
    now,
    storage: new FakeStorage({
      [storageKey]: JSON.stringify({
        42: {
          startedAt: now - 3_661_000
        }
      })
    })
  });

  timerControls(environment).forEach((control) => {
    assert.equal(control.children[1].textContent, "01:01:01");
  });

  environment.addActionLink();
  environment.observers[0].trigger();
  environment.observers[0].trigger();
  assert.equal(timerControls(environment).length, 3);

  environment.clock.now += 2_000;
  environment.observers[0].trigger();
  timerControls(environment).forEach((control) => {
    assert.equal(control.children[1].textContent, "01:01:01");
  });
  environment.intervals[0]();
  timerControls(environment).forEach((control) => {
    assert.equal(control.children[1].textContent, "01:01:03");
  });

  environment.storage.setItem(storageKey, "{}");
  environment.dispatchWindow("storage", { key: storageKey });
  timerControls(environment).forEach((control) => {
    assert.equal(control.classList.contains("is-running"), false);
  });
});

test("keeps native time entry available when localStorage cannot be written", () => {
  const storage = new FakeStorage({}, true);
  const environment = createEnvironment({ storage });
  const controls = timerControls(environment);

  controls[0].children[0].click();

  assert.equal(environment.document.actionLinks.length, 2);
  assert.equal(environment.document.actionLinks[0].parentNode.children.includes(environment.document.actionLinks[0]), true);
  controls.forEach((control) => {
    assert.equal(control.classList.contains("has-error"), true);
    assert.equal(control.children[0].disabled, true);
    assert.equal(control.children[1].textContent, "O timer local não está disponível neste navegador.");
  });
  assert.equal(environment.assignedUrl(), null);
});

test("does not modify the page when localStorage is unavailable", () => {
  const environment = createEnvironment({ storage: null });

  assert.equal(timerControls(environment).length, 0);
  assert.equal(environment.document.actionLinks.length, 2);
});
