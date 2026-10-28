// Pack drift test: structural alignment between the screen and on-site
// editions of the demo pack (quest-player issue #66, follow-up to the
// two-editions declaration on #45).
//
// Screen edition: this repo's embedded DEMO_PACK in app.js — the pack
// players actually play. On-site edition: the zqm-labs monorepo file
// lantern-content/content-packs/wisp-demo.json, vendored here as a
// snapshot (tests/fixtures/onsite-wisp-demo.json) because CI cannot reach
// across repos. Refresh it with tools/refresh-onsite-fixture.sh; a stale
// snapshot fails loudly on the first structural change, which is the point.
//
// What this test asserts (issue #66, exactly):
//   - same stop ids (1..6) in the same order
//   - same stop names
//   - every stop complete in both editions: all four scare tiers present,
//     each with a puzzle and an answer
//
// What it deliberately does NOT assert: answer equality. The editions may
// legitimately differ where the physical site differs from the picture
// (on-site clues point at real props; screen clues point at demo pictures).
// Story text, coordinates, and hint shapes are likewise out of scope here.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const TIERS = ["cozy", "spooky", "afterdark", "overdrive"];

function loadDemoPack() {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const anchor = app.indexOf("DEMO_PACK =");
  assert.ok(anchor >= 0, "DEMO_PACK should exist in app.js");
  const start = app.indexOf("{", anchor);
  let depth = 0, end = -1;
  for (let j = start; j < app.length; j++) {
    if (app[j] === "{") depth++;
    else if (app[j] === "}") { depth--; if (depth === 0) { end = j; break; } }
  }
  assert.ok(end > start, "DEMO_PACK object should close");
  return new Function("return (" + app.slice(start, end + 1) + ");")();
}

const screen = loadDemoPack();
const onsite = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures", "onsite-wisp-demo.json"), "utf8")
);

test("drift: same stop ids in the same order", () => {
  const screenIds = screen.stops.map((s) => String(s.id));
  const onsiteIds = onsite.stops.map((s) => String(s.id));
  assert.deepEqual(screenIds, ["1", "2", "3", "4", "5", "6"]);
  assert.deepEqual(onsiteIds, screenIds);
});

test("drift: same stop names in the same order", () => {
  const screenNames = screen.stops.map((s) => s.name);
  const onsiteNames = onsite.stops.map((s) => s.name);
  assert.deepEqual(onsiteNames, screenNames);
});

test("drift: every stop complete in both editions (all tiers, puzzle + answer)", () => {
  assert.equal(screen.stops.length, 6);
  assert.equal(onsite.stops.length, 6);
  for (const [label, edition] of [["screen", screen], ["onsite", onsite]]) {
    for (const [j, stop] of edition.stops.entries()) {
      for (const tier of TIERS) {
        const p = stop.puzzle && stop.puzzle[tier];
        assert.ok(p && p.q && String(p.a).length,
          `${label} stop ${j + 1} ${tier}: puzzle with q+a`);
      }
    }
  }
});
