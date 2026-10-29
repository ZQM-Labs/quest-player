const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
let server;
let baseUrl;
let browser;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav"
};

test.before(async () => {
  server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) && file !== path.join(root, "index.html")) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    fs.readFile(file, (err, body) => {
      if (err) {
        res.writeHead(404).end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
        "Service-Worker-Allowed": "/"
      });
      res.end(body);
    });
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  baseUrl = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch({ headless: true });
});

test.after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

test("20 consecutive launches render the start screen without uncaught JavaScript errors", async () => {
  const context = await browser.newContext();
  const errors = [];
  for (let i = 0; i < 20; i++) {
    const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
    page.on("pageerror", error => errors.push("launch " + (i + 1) + ": " + error.message));
    await page.goto(baseUrl + "/?demo=1", { waitUntil: "domcontentloaded" });
    await page.locator("#screen-start.active").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Start the hunt" }).waitFor({ state: "visible" });
    await page.close();
  }
  await context.close();
  assert.deepEqual(errors, [], "startup must not emit uncaught page errors");
});

test("malformed packs return validation errors rather than throwing", async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  await page.goto(baseUrl + "/?demo=1", { waitUntil: "domcontentloaded" });
  const result = await page.evaluate(() => {
    const validStop = i => ({
      id: i, name: "Stop " + i, code: "CODE-" + i,
      lat: 29 + i / 100, lng: -80 - i / 100,
      story: { cozy: "A story", spooky: "A spooky story", afterdark: "An afterdark story", overdrive: "An overdrive story" },
      puzzle: { cozy: { q: "Question?", a: "answer-" + i }, spooky: { q: "Spooky question?", a: "spooky-" + i }, afterdark: { q: "Afterdark question?", a: "afterdark-" + i }, overdrive: { q: "Overdrive question?", a: "overdrive-" + i } },
      fallback: { q: "Fallback question?", a: "fallback-" + i },
      hints: ["hint one", "hint two", "hint three"]
    });
    const base = { stops: Array.from({ length: 6 }, (_, i) => validStop(i + 1)) };
    const cases = [
      ["null pack", null],
      ["null stop", { stops: [null, ...base.stops.slice(1)] }],
      ["array stop", { stops: [[], ...base.stops.slice(1)] }],
      ["non-string name", { stops: [{ ...base.stops[0], name: { bad: true } }, ...base.stops.slice(1)] }],
      ["non-string hint", { stops: [{ ...base.stops[0], hints: ["ok", 42, "ok"] }, ...base.stops.slice(1)] }],
      ["non-finite latitude", { stops: [{ ...base.stops[0], lat: Infinity }, ...base.stops.slice(1)] }],
      ["out-of-range longitude", { stops: [{ ...base.stops[0], lng: 181 }, ...base.stops.slice(1)] }],
      ["duplicate ids", { stops: [base.stops[0], { ...base.stops[1], id: 1 }, ...base.stops.slice(2)] }]
    ];
    return {
      valid: window.validatePack(base),
      cases: cases.map(([name, pack]) => {
        try { return { name, errors: window.validatePack(pack), threw: false }; }
        catch (error) { return { name, error: error.message, threw: true }; }
      })
    };
  });
  await context.close();
  assert.deepEqual(result.valid, [], "valid pack should pass");
  for (const item of result.cases) {
    assert.equal(item.threw, false, item.name + " must not throw");
    assert.ok(item.errors.length > 0, item.name + " must be rejected");
  }
});

test("installed player survives five offline reloads and completes ten consecutive six-stop quests offline", async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));

  await page.goto(baseUrl + "/tests/fixtures/blank.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => {
    const oldCache = await caches.open("lantern-v6");
    await oldCache.put(new Request(location.origin + "/old-version-sentinel"), new Response("old"));
    const unrelated = await caches.open("unrelated-app-cache");
    await unrelated.put(new Request(location.origin + "/sentinel"), new Response("keep me"));
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 });
  await page.goto(baseUrl + "/?demo=1", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 });
  await page.reload({ waitUntil: "domcontentloaded" });
  // Sign codes verify arrival only (b719ea0): a stop is solved by answering
  // its puzzle. Resolve the demo pack's answer the same way app.js does.
  const answerFor = (id) => page.evaluate((stopId) => {
    const s = pack.stops.find(x => x.id === stopId);
    const pz = (s.puzzle && (s.puzzle[state.scare] || s.puzzle.cozy)) || s.fallback;
    return pz.a;
  }, id);
  const cached = await page.evaluate(async () => {
    const cacheNames = await caches.keys();
    const currentCache = cacheNames.find((name) => /^lantern-v\d+$/.test(name));
    const cache = currentCache ? await caches.open(currentCache) : null;
    const paths = [
      "./index.html", "./app.js", "./global-story.js", "./i18n.js",
      "./i18n/en.json", "./i18n/es.json", "./i18n/fr.json", "./i18n/de.json", "./i18n/pt.json",
      "./assets/img/logo-primary.webp", "./assets/img/stop-1-pumpkin-cozy.webp",
      "./assets/img/finale-lantern-parade.webp", "./assets/audio/hoot.ogg"
    ];
    const missing = [];
    for (const path of paths) if (!cache || !(await cache.match(path))) missing.push(path);
    return { missing, cacheNames, currentCache };
  });
  assert.ok(cached.currentCache, "the player service worker must create a versioned lantern cache");
  assert.deepEqual(cached.missing, [], "offline shell, translations, audio, and key art must be precached");
  assert.ok(!cached.cacheNames.includes("lantern-v6"), "activation must remove the previous player cache");
  assert.ok(cached.cacheNames.includes("unrelated-app-cache"), "the player must preserve unrelated origin caches");

  await context.setOffline(true);
  for (let i = 0; i < 5; i++) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#screen-start.active").waitFor({ state: "visible" });
    await page.waitForFunction(() => { const img = document.querySelector(".brand-logo"); return img && img.complete && img.naturalWidth > 0; });
    const logoWidth = await page.locator(".brand-logo").evaluate(img => img.naturalWidth);
    assert.ok(logoWidth > 0, "logo must load offline on cycle " + (i + 1));
  }

  await page.getByLabel("Team name").fill("Acceptance Team");
  await page.getByRole("button", { name: "Start the hunt" }).click();
  await page.locator('[data-pick="cozy"]').click();
  await page.locator("#screen-map.active").waitFor({ state: "visible" });

  for (let stop = 1; stop <= 6; stop++) {
    await page.locator("#next-stop").getByRole("button", { name: /We're at the stop/ }).click();
    await page.locator("#screen-puzzle.active").waitFor({ state: "visible" });
    try {
      await page.waitForFunction(() => { const img = document.querySelector("#stop-art"); return img && img.complete && img.naturalWidth > 0; }, null, { timeout: 5000 });
    } catch (error) {
      const detail = await page.locator("#stop-art").evaluate(img => ({ src: img.src, complete: img.complete, naturalWidth: img.naturalWidth, display: img.style.display }));
      throw new Error("stop " + stop + " artwork failed offline: " + JSON.stringify(detail) + "; " + error.message);
    }
    const artWidth = await page.locator("#stop-art").evaluate(img => img.naturalWidth);
    assert.ok(artWidth > 0, "stop " + stop + " artwork must load offline");
    await page.locator("#unlock-code").fill("LANTERN-" + stop);
    await page.locator("#btn-unlock").click();
    await page.locator("#puzzle-answer").fill(await answerFor(stop));
    await page.locator("#btn-answer").click();
    await page.waitForFunction(expected => {
      const saved = JSON.parse(localStorage.getItem("lantern-state") || "{}");
      return Array.isArray(saved.solved) && saved.solved.length >= expected;
    }, stop, { timeout: 5000 });
    if (stop < 6) await page.locator("#screen-map.active").waitFor({ state: "visible", timeout: 5000 });
    if (stop === 1) {
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("#screen-start.active").waitFor({ state: "visible" });
      const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("lantern-state") || "{}"));
      assert.deepEqual(persisted.solved, [1], "progress must survive reload");
      await page.getByRole("button", { name: "Start the hunt" }).click();
      await page.locator('[data-pick="cozy"]').click();
      await page.locator("#screen-map.active").waitFor({ state: "visible" });
    }
  }
  await page.locator("#screen-finale.active").waitFor({ state: "visible", timeout: 5000 });
  await page.waitForFunction(() => { const img = document.querySelector("#screen-finale img.story-art"); return img && img.complete && img.naturalWidth > 0; });
  const finaleWidth = await page.locator("#screen-finale img.story-art").evaluate(img => img.naturalWidth);
  assert.ok(finaleWidth > 0, "finale artwork must load offline");

  // Repeat the complete quest ten times in the same offline Chromium session.
  for (let run = 2; run <= 10; run++) {
    await page.locator("#btn-restart").click();
    await page.locator("#screen-start.active").waitFor({ state: "visible" });
    await page.getByLabel("Team name").fill("Acceptance Team " + run);
    await page.getByRole("button", { name: "Start the hunt" }).click();
    await page.locator('[data-pick="cozy"]').click();
    await page.locator("#screen-map.active").waitFor({ state: "visible" });

    for (let stop = 1; stop <= 6; stop++) {
      await page.locator("#next-stop").getByRole("button", { name: /We're at the stop/ }).click();
      await page.locator("#screen-puzzle.active").waitFor({ state: "visible" });
      await page.locator("#unlock-code").fill("LANTERN-" + stop);
      await page.locator("#btn-unlock").click();
      await page.locator("#puzzle-answer").fill(await answerFor(stop));
      await page.locator("#btn-answer").click();
      await page.waitForFunction(expected => {
        const saved = JSON.parse(localStorage.getItem("lantern-state") || "{}");
        return Array.isArray(saved.solved) && saved.solved.length >= expected;
      }, stop, { timeout: 5000 });
      if (stop < 6) await page.locator("#screen-map.active").waitFor({ state: "visible", timeout: 5000 });
    }
    await page.locator("#screen-finale.active").waitFor({ state: "visible", timeout: 5000 });
  }
  assert.deepEqual(errors, [], "offline play must not emit uncaught JavaScript errors");
  await context.close();
});


test("corrupt saved state does not prevent startup", async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  await page.goto(baseUrl + "/?demo=1", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.setItem("lantern-state", "{broken-json"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("#screen-start.active").waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Start the hunt" }).waitFor({ state: "visible" });
  await context.close();
});

test("disabled localStorage does not crash startup or prevent entering the game", async () => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() { throw new DOMException("Storage disabled", "SecurityError"); }
    });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(baseUrl + "/?demo=1", { waitUntil: "domcontentloaded" });
  await page.locator("#screen-start.active").waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Start the hunt" }).click();
  await page.locator("#screen-scare.active").waitFor({ state: "visible" });
  assert.deepEqual(errors, []);
  await context.close();
});

test("language switching preserves progress and clearly discloses incomplete translation coverage", async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  await page.goto(baseUrl + "/?demo=1", { waitUntil: "domcontentloaded" });
  const note = await page.locator("#language-support-note").innerText();
  assert.match(note, /experimental/i);
  assert.match(note, /not fully translated/i);
  await page.getByLabel("Team name").fill("Language Test");
  await page.getByRole("button", { name: "Start the hunt" }).click();
  await page.locator('[data-pick="cozy"]').click();
  await page.locator("#next-stop").getByRole("button", { name: /We're at the stop/ }).click();
  await page.locator("#screen-puzzle.active").waitFor({ state: "visible" });
  await page.locator("#lang-switcher [data-lang=" + '"es"' + "]").click();
  await page.waitForFunction(() => localStorage.getItem("lantern-lang") === "es");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lantern-state") || "{}"));
  assert.deepEqual(saved.solved || [], [], "changing language must not reset or invent progress");
  await context.close();
});

test("stale pause marker from a previous session cannot drive a new hunt timer negative", async () => {
  // Regression for the 2026-10-29 live demo: a ~7.7-day-old hiddenAt left in
  // localStorage was added to a fresh hunt's startedAt, showing -11075 min.
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  await page.goto(baseUrl + "/?demo=1", { waitUntil: "domcontentloaded" });
  await page.locator("#screen-start.active").waitFor({ state: "visible" });
  const eightDays = 8 * 24 * 3600 * 1000;
  await page.evaluate((ago) => {
    const stale = { team: "QA Verify", scare: "cozy", solved: [], hintsUsed: 0,
      startedAt: Date.now() - ago, pausedAt: null, hiddenAt: Date.now() - ago,
      kitId: null, cleanSolves: 0, stopHints: {}, arrivedGps: {} };
    localStorage.setItem("lantern-state", JSON.stringify(stale));
  }, eightDays);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("#screen-start.active").waitFor({ state: "visible" });
  await page.getByLabel("Team name").fill("Timer Regression");
  await page.getByRole("button", { name: "Start the hunt" }).click();
  await page.locator('[data-pick="cozy"]').click();
  await page.locator("#screen-map.active").waitFor({ state: "visible" });
  const clock = await page.locator("#hunt-clock").innerText();
  assert.match(clock, /^⏱ \d+:\d{2}$/, "fresh hunt clock must never be negative, stale markers or not");
  await context.close();
});

test("audio-cued stop shows a sound replay control, other stops do not", async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(baseUrl + "/?demo=1", { waitUntil: "domcontentloaded" });
  await page.locator("#screen-start.active").waitFor({ state: "visible" });
  await page.getByLabel("Team name").fill("Sound Check");
  await page.getByRole("button", { name: "Start the hunt" }).click();
  await page.locator('[data-pick="cozy"]').click();
  await page.locator("#screen-map.active").waitFor({ state: "visible" });
  const answerFor = (id) => page.evaluate((stopId) => {
    const s = pack.stops.find(x => x.id === stopId);
    const pz = (s.puzzle && (s.puzzle[state.scare] || s.puzzle.cozy)) || s.fallback;
    return pz.a;
  }, id);
  for (let stop = 1; stop <= 5; stop++) {
    await page.locator("#next-stop").getByRole("button", { name: /We're at the stop/ }).click();
    await page.locator("#screen-puzzle.active").waitFor({ state: "visible" });
    if (stop === 1) {
      assert.equal(await page.locator("#sound-row").isVisible(), false, "non-audio stop must not show the sound control");
    }
    if (stop === 5) {
      assert.equal(await page.locator("#sound-row").isVisible(), true, "owl stop must show the sound control");
      await page.locator("#btn-sound").click();
    }
    await page.locator("#unlock-code").fill("LANTERN-" + stop);
    await page.locator("#btn-unlock").click();
    await page.locator("#puzzle-answer").fill(await answerFor(stop));
    await page.locator("#btn-answer").click();
    await page.waitForFunction((expected) => {
      const saved = JSON.parse(localStorage.getItem("lantern-state") || "{}");
      return Array.isArray(saved.solved) && saved.solved.length >= expected;
    }, stop, { timeout: 5000 });
    if (stop < 5) await page.locator("#screen-map.active").waitFor({ state: "visible", timeout: 5000 });
  }
  assert.deepEqual(errors, [], "sound control must not throw page errors");
  await context.close();
});
