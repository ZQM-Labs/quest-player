// Regression tests for the 2026-10-20 pack-validation parity fix.
//
// Background: validatePack() in app.js used to require story+puzzle for ALL
// four scare tiers on every stop, so it rejected SPEC-conformant packs —
// including the official sample pack (30 errors). SPEC.md (ZQM-Labs/
// quest-authoring), the Python validator, and the player's own variant()
// runtime all treat tiers as OPTIONAL with a cozy fallback. These tests pin
// the corrected contract by evaluating the REAL validatePack extracted from
// app.js (same slicing approach as tests/global-story.test.cjs), not a copy.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function loadValidatePack() {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8").replace(/\r\n/g, "\n");
  const start = app.indexOf("function validatePack(p) {");
  const end = app.indexOf("\n\nconst $ = id", start);
  assert.ok(start >= 0 && end > start, "validatePack should exist in app.js");
  const factory = new Function(app.slice(start, end) + "\nreturn validatePack;");
  return factory();
}

const validatePack = loadValidatePack();

// Vendored verbatim from ZQM-Labs/quest-packs sample-quest/wisp-sample.json
// (the official sample: 6 stops, story cozy+spooky only, puzzle cozy only,
// flat hint ladders, observation fallbacks).
const sample = JSON.parse(
  fs.readFileSync(path.join(root, "tests", "fixtures", "wisp-sample.json"), "utf8")
);

function cloneSample() {
  return JSON.parse(JSON.stringify(sample));
}

test("validatePack accepts the official sample pack shape (tiers optional, cozy fallback)", () => {
  assert.deepEqual(validatePack(sample), []);
});

test("validatePack still rejects a malformed PRESENT puzzle tier", () => {
  const pack = cloneSample();
  pack.stops[0].puzzle.spooky = { q: "   ", a: "ghost" };
  const errs = validatePack(pack);
  assert.ok(
    errs.some((e) => /puzzle\.spooky is present but needs a non-empty question and answer/.test(e)),
    "expected a present-but-malformed puzzle.spooky error, got: " + JSON.stringify(errs)
  );
});

test("validatePack still rejects a present-but-invalid story tier", () => {
  const pack = cloneSample();
  pack.stops[1].story.afterdark = "";
  const errs = validatePack(pack);
  assert.ok(
    errs.some((e) => /story\.afterdark is present but invalid/.test(e)),
    "expected a present-but-invalid story.afterdark error, got: " + JSON.stringify(errs)
  );
});

test("validatePack accepts a complete per-level hints object", () => {
  const pack = cloneSample();
  for (const stop of pack.stops) {
    stop.hints = {
      cozy: ["cozy hint 1", "cozy hint 2", "cozy hint 3"],
      spooky: ["spooky hint 1", "spooky hint 2", "spooky hint 3"],
      afterdark: ["afterdark hint 1", "afterdark hint 2", "afterdark hint 3"],
      overdrive: ["overdrive hint 1", "overdrive hint 2", "overdrive hint 3"]
    };
  }
  assert.deepEqual(validatePack(pack), []);
});

test("validatePack rejects an incomplete per-level hints object (both validators require all 4 levels x 3)", () => {
  const pack = cloneSample();
  pack.stops[0].hints = {
    cozy: ["a", "b", "c"],
    spooky: ["a", "b", "c"],
    afterdark: ["a", "b", "c"],
    overdrive: ["only", "two"]
  };
  const errs = validatePack(pack);
  assert.ok(
    errs.some((e) => /hints/.test(e)),
    "expected a hints error for the incomplete per-level object, got: " + JSON.stringify(errs)
  );
});

// The hint button picks hints[state.scare] with a cozy fallback, then the raw
// hints value (legacy flat array). Evaluate the REAL selection expression
// from app.js against stubs so a refactor that drops the fallback fails here.
test("hint selection uses the active scare level and falls back to cozy", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8").replace(/\r\n/g, "\n");
  const match = app.match(/var hintSet = .*$/m);
  assert.ok(match, "hint selection expression should exist in app.js");
  const pick = new Function(
    "currentStop",
    "state",
    match[0] + "\nreturn hintSet;"
  );

  const stop = {
    hints: {
      cozy: ["c1", "c2", "c3"],
      spooky: ["s1", "s2", "s3"],
      afterdark: ["a1", "a2", "a3"],
      overdrive: ["o1", "o2", "o3"]
    }
  };
  assert.deepEqual(pick(stop, { scare: "spooky" }), ["s1", "s2", "s3"]);
  assert.deepEqual(pick(stop, { scare: "overdrive" }), ["o1", "o2", "o3"]);

  const cozyOnly = { hints: { cozy: ["c1", "c2", "c3"] } };
  assert.deepEqual(pick(cozyOnly, { scare: "afterdark" }), ["c1", "c2", "c3"]);

  const flat = { hints: ["f1", "f2", "f3"] };
  assert.deepEqual(pick(flat, { scare: "cozy" }), ["f1", "f2", "f3"]);
});

// Regression for the 2026-10-20 finale fix: the relic tray lives on the map
// screen, so the finale must render its own collection into #finale-relics.
test("finale screen renders the relic collection", () => {
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.ok(index.includes('id="finale-relics"'), "index.html must contain the finale relic container");
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8").replace(/\r\n/g, "\n");
  assert.ok(app.includes('$("finale-relics")'), "app.js finale() must render into #finale-relics");
});

// Precache completeness, reverse direction: every SHELL entry in sw.js must
// resolve to a file that actually ships, or cache.addAll() rejects and the
// service worker never installs (offline play silently breaks). The existing
// tests cover artwork->SHELL; this covers SHELL->tree.
test("every service worker precache entry exists in the shipped tree", () => {
  const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  const shellMatch = sw.match(/const SHELL = \[([\s\S]*?)\];/);
  assert.ok(shellMatch, "sw.js should declare a SHELL precache list");
  const entries = [...shellMatch[1].matchAll(/"(\.\/[^"]*)"/g)].map((m) => m[1]);
  assert.ok(entries.length > 0, "SHELL should not be empty");
  for (const entry of entries) {
    const rel = entry === "./" ? "index.html" : entry.replace(/^\.\//, "");
    assert.ok(
      fs.existsSync(path.join(root, rel)),
      `precached path does not exist in the tree: ${entry}`
    );
  }
});

// Regression for the 2026-10-24 malformed-pack fail-open (audit P0 #6):
// a live kit whose pack fails validatePack() used to alert "using the
// built-in game" and then keep playing the embedded demo pack under the
// live kit id, so syncProgress() posted demo-content solves to that kit's
// leaderboard. The start handler must now abort BEFORE startingKit is set,
// so no session starts and nothing syncs. The unloadable-pack path
// (fetchKitBundle returns null) is unchanged and still aborts via the
// bundle-null check above this branch.
test("malformed live-kit pack aborts the session instead of falling back to demo content", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8").replace(/\r\n/g, "\n");
  assert.ok(!app.includes("using the built-in game"),
    "no fallback-to-demo copy may remain for a rejected live-kit pack");
  const idx = app.indexOf("pack_validation_failed");
  assert.ok(idx >= 0, "pack_validation_failed alert should exist");
  const segment = app.slice(idx, idx + 700);
  assert.ok(segment.includes("return;"),
    "the validation-failure branch must return (abort) before startingKit is set");
  const after = app.slice(idx);
  const retAt = after.indexOf("return;");
  const kitAt = after.indexOf("startingKit = result.kit");
  assert.ok(retAt >= 0 && kitAt > retAt,
    "abort return must precede the live-kit assignment");
  assert.ok(app.includes("if (!bundle.pack)"),
    "a live kit with no pack at all must also abort, not play demo content under its id");
});
