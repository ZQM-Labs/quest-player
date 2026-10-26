// Content-consistency guard for the embedded DEMO_PACK.
//
// Background (2026-10-21): the built-in pack shipped puzzles whose keys and
// final "Ranger assist" hints contradicted the game's own art (stop-1 keyed
// 4 smiling pumpkins against art showing 1; the assist hints stated the same
// wrong answers, so hints could not rescue a stuck player). The screen-
// solvable and four-tier follow-up PRs fixed the content. This test pins
// the pack's own convention so the class cannot regress silently: every
// tier of every stop carries a 3-hint ladder, and the final hint — the one
// that states the answer — must agree with the puzzle's key.

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

const pack = loadDemoPack();

const NUMBER_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20 };

function numbersIn(text) {
  const found = (String(text).replace(/,/g, "").match(/\d+(\.\d+)?/g) || []).map(Number);
  for (const w of String(text).toLowerCase().match(/[a-z]+/g) || []) {
    if (w in NUMBER_WORDS) found.push(NUMBER_WORDS[w]);
  }
  return found;
}

test("embedded pack: every stop x tier has a puzzle and a 3-hint ladder", () => {
  assert.equal(pack.stops.length, 6);
  for (const [i, stop] of pack.stops.entries()) {
    for (const tier of TIERS) {
      const p = stop.puzzle && stop.puzzle[tier];
      assert.ok(p && p.q && String(p.a).length, `stop ${i + 1} ${tier}: puzzle with q+a`);
      const hints = stop.hints && stop.hints[tier];
      assert.ok(Array.isArray(hints) && hints.length === 3, `stop ${i + 1} ${tier}: 3 hints`);
    }
    assert.ok(stop.fallback && stop.fallback.q && String(stop.fallback.a).length,
      `stop ${i + 1}: fallback with q+a`);
  }
});

test("embedded pack: final Ranger-assist hint agrees with the puzzle key", () => {
  for (const [i, stop] of pack.stops.entries()) {
    for (const tier of TIERS) {
      const p = stop.puzzle[tier];
      const finalHint = stop.hints[tier][2];
      if (p.type === "number") {
        const key = Number(String(p.a).replace(/,/g, ""));
        assert.ok(numbersIn(finalHint).includes(key),
          `stop ${i + 1} ${tier}: final hint "${finalHint}" should state the key ${p.a}`);
      } else {
        assert.ok(finalHint.toLowerCase().includes(String(p.a).toLowerCase()),
          `stop ${i + 1} ${tier}: final hint "${finalHint}" should state the answer "${p.a}"`);
      }
    }
  }
});

test("demo cozy puzzles use the shipped on-screen art as their answer basis", () => {
  assert.match(pack.stops[0].puzzle.cozy.q, /demo pumpkin picture/i);
  assert.equal(pack.stops[0].puzzle.cozy.a, "1");
  assert.match(pack.stops[0].hints.cozy[2], /exactly 1 pumpkin/i);

  assert.match(pack.stops[1].puzzle.cozy.q, /demo oak picture/i);
  assert.equal(pack.stops[1].puzzle.cozy.a, "0");
  assert.match(pack.stops[1].hints.cozy[2], /shows 0 swings or benches/i);
});

test("embedded player pack and standalone demo pack keep puzzle content in sync", () => {
  const standalone = JSON.parse(fs.readFileSync(path.join(root, "wisp-demo.json"), "utf8"));
  assert.equal(standalone.stops.length, pack.stops.length, "both demo packs should have the same stop count");
  for (const [i, stop] of pack.stops.entries()) {
    const other = standalone.stops[i];
    assert.equal(other.id, stop.id, `stop ${i + 1}: IDs should align`);
    for (const tier of TIERS) {
      assert.deepEqual(other.puzzle[tier], stop.puzzle[tier],
        `stop ${i + 1} ${tier}: standalone and embedded puzzle content should match`);
    }
  }
});

test("demo overdrive arithmetic answers match the stated operations", () => {
  // 5 tombstones × 4 letters = 20 letters; add 5 tombstones => 25.
  assert.match(pack.stops[2].puzzle.overdrive.q, /5 tombstones/i);
  assert.match(pack.stops[2].puzzle.overdrive.q, /4 letters/i);
  assert.equal(pack.stops[2].puzzle.overdrive.a, "25");

  // 10 hoots × 2 syllables = 20 syllables; add 10 hoots => 30.
  assert.match(pack.stops[4].puzzle.overdrive.q, /10 times/i);
  assert.match(pack.stops[4].puzzle.overdrive.q, /2 syllables/i);
  assert.equal(pack.stops[4].puzzle.overdrive.a, "30");
});
