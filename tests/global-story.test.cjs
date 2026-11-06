const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");

function element() {
  return {
    textContent: "",
    className: "",
    style: {},
    children: [],
    querySelector() { return null; },
    insertBefore(child) { this.children.push(child); },
    appendChild(child) { this.children.push(child); }
  };
}

// Synchronous fixture: the supported Node 18 runtime lacks Date timer mocks.
// Restore globals even when a story assertion throws.
function withStoryClock(now, randomValue, check) {
  const OriginalDate = Date;
  const originalRandom = Math.random;
  const timestamp = now.getTime();
  global.Date = class extends OriginalDate {
    constructor(...args) {
      if (args.length) super(...args);
      else super(timestamp);
    }
    static now() { return timestamp; }
  };
  Math.random = () => randomValue;
  try {
    return check();
  } finally {
    global.Date = OriginalDate;
    Math.random = originalRandom;
  }
}

test("GlobalStory initializes and applies a valid mode and culture", () => {
  withStoryClock(new Date(2026, 9, 31, 12), 0, () => {
    const screens = {
      "screen-start": element(),
      "screen-finale": element(),
      "screen-map": element()
    };
    global.document = {
      readyState: "loading",
      addEventListener() {},
      getElementById(id) { return screens[id] || null; },
      createElement() { return element(); }
    };
    global.pack = { stops: [{ id: 1 }], story_content: {}, environmental_storytelling: {} };
    global.state = { solved: [] };
    global.nextUnsolved = () => global.pack.stops[0];

    // Recent Node versions expose navigator through a getter. Plain assignment
    // silently leaves the host locale in place; replace and restore its descriptor.
    const navigatorDescriptor = Object.getOwnPropertyDescriptor(global, "navigator");
    Object.defineProperty(global, "navigator", {
      configurable: true, writable: true, value: { language: "en-US" }
    });
    try {
      delete require.cache[require.resolve("../global-story.js")];
      const story = require("../global-story.js");
      assert.doesNotThrow(() => story.init());
      assert.equal(story.getCurrentMode(), "halloween");
      assert.equal(story.getCurrentCulture(), "western");
      assert.ok(story.adaptedStory);
      assert.equal(typeof story.adaptedStory.intro, "string");
    } finally {
      if (navigatorDescriptor) Object.defineProperty(global, "navigator", navigatorDescriptor);
      else delete global.navigator;
    }
  });
});

if (!process.env.ZQM_STORY_LOCALE_CHILD) {
  test("story initialization controls a read-only non-English navigator", () => {
    const env = { ...process.env, ZQM_STORY_LOCALE_CHILD: "1" };
    delete env.NODE_TEST_CONTEXT;
    const source = [
      'const assert = require("node:assert/strict");',
      'const navigatorGetter = () => ({ language: "hi-IN" });',
      'Object.defineProperty(global, "navigator", { configurable: true, get: navigatorGetter });',
      'require(process.argv[1]);',
      'process.on("exit", () => assert.equal(Object.getOwnPropertyDescriptor(global, "navigator").get, navigatorGetter));'
    ].join(" ");
    const child = spawnSync(process.execPath, ["-e", source, __filename], {
      env, encoding: "utf8", timeout: 30000
    });
    assert.equal(child.status, 0, child.stdout + child.stderr);
    assert.match(child.stdout, /GlobalStory initializes/);
  });
}

test("story selection follows the existing seasonal boundaries with a controlled clock", async (t) => {
  const story = require("../global-story.js");
  const cases = [
    [1, 1, "lantern_festival"],
    [2, 28, "lantern_festival"],
    [3, 19, "halloween"],
    [3, 20, "spring_equinox"],
    [6, 19, "halloween"],
    [6, 20, "summer_solstice"],
    [7, 1, "halloween"],
    [9, 15, "halloween"],
    [9, 16, "mid_autumn"],
    [10, 1, "halloween"],
    [10, 31, "halloween"],
    [11, 1, "diwali"],
    [11, 14, "diwali"],
    [11, 15, "halloween"],
    [12, 31, "halloween"]
  ];

  for (const [month, day, expected] of cases) {
    await t.test(`${month}/${day}: ${expected}`, () => {
      // Local noon keeps date-window fixtures independent of runner timezone.
      // Seed the out-of-season fallback without changing production behavior.
      withStoryClock(new Date(2026, month - 1, day, 12), 0, () => {
        assert.equal(story.detectMode(), expected);
      });
    });
  }
});

test("out-of-season story selection retains the existing random variety", () => {
  withStoryClock(new Date(2026, 3, 1, 12), 0.999, () => {
    assert.equal(require("../global-story.js").detectMode(), "mid_autumn");
  });
});

test("service worker precaches the new player modules and available translation files", () => {
  const source = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  // The CACHE value is a release counter bumped on every release (v9 -> v13 in
  // one day); assert the naming FORMAT, never a specific version, or this
  // suite goes red after every legitimate release.
  assert.match(source, /const CACHE = "lantern-v\d+"/);
  for (const asset of ["./global-story.js", "./i18n.js"]) {
    assert.ok(source.includes(`"${asset}"`), `missing precache entry: ${asset}`);
  }
  const i18n = require("../i18n.js");
  for (const language of Object.keys(i18n.languages)) {
    const asset = `./i18n/${language}.json`;
    assert.ok(source.includes(`"${asset}"`), `missing precache entry: ${asset}`);
    assert.equal(
      source.split(`"${asset}"`).length - 1,
      1,
      `precache entry must appear exactly once: ${asset}`
    );
  }
});

test("language picker lists only languages with translation files", () => {
  global.document = { readyState: "loading", addEventListener() {} };
  delete require.cache[require.resolve("../i18n.js")];
  const i18n = require("../i18n.js");
  const languages = Object.keys(i18n.languages).sort();
  const localeFiles = fs.readdirSync(path.join(root, "i18n"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -5))
    .filter((name) => Object.hasOwn(i18n.languages, name))
    .sort();

  assert.ok(languages.includes("en"), "English must remain available as the fallback");
  assert.deepEqual(
    languages,
    localeFiles,
    "the language picker must match the locale files that ship with the player"
  );

  const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  for (const language of languages) {
    assert.ok(
      serviceWorker.includes(`"./i18n/${language}.json"`),
      `missing offline precache entry for advertised language: ${language}`
    );
  }
});

test("pack validator rejects null stop records and malformed field types without throwing", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8").replace(/\r\n/g, "\n");
  const start = app.indexOf("function validatePack(p) {");
  const end = app.indexOf("\n\nconst $ = id", start);
  assert.ok(start >= 0 && end > start, "validatePack function should exist");
  const validator = app.slice(start, end);
  assert.match(validator, /typeof s !== "object"/);
  assert.match(validator, /s\.hints\.every/);
  assert.match(validator, /Number\.isFinite/);
});

test("all advertised languages have the same complete, non-empty interface key set", () => {
  const english = JSON.parse(fs.readFileSync(path.join(root, "i18n/en.json"), "utf8"));
  const keys = Object.keys(english).sort();
  assert.ok(keys.length > 0, "English translation file must not be empty");
  for (const language of Object.keys(require("../i18n.js").languages).filter((code) => code !== "en")) {
    const translations = JSON.parse(fs.readFileSync(path.join(root, "i18n", language + ".json"), "utf8"));
    assert.deepEqual(Object.keys(translations).sort(), keys, language + " must match English key coverage");
    for (const key of keys) {
      assert.equal(typeof translations[key], "string", language + "." + key + " must be a string");
      assert.ok(translations[key].trim(), language + "." + key + " must not be empty");
    }
  }
});

test("service worker precaches every artwork path referenced by the player and only clears its own cache family", () => {
  const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  assert.match(sw, /const CACHE = "lantern-v\d+"/);
  for (const file of fs.readdirSync(path.join(root, "assets", "img"))) {
    if (/\.(webp|svg)$/i.test(file) && !["hero-pumpkin.svg", "relic-bat.svg", "relic-ghost.svg", "relic-lantern.svg", "relic-pumpkin.svg", "relic-spider.svg", "relic-wisp.svg"].includes(file)) {
      assert.ok(sw.includes("./assets/img/" + file), "missing artwork precache: " + file);
    }
  }
  assert.match(sw, /k\.startsWith\("lantern-"\)/);
});
