"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const player = fs.readFileSync("app.js", "utf8");
const worker = fs.readFileSync("sw.js", "utf8");

assert.match(player, /const HINT_BUDGET = 18;/, "six stops should allow three hints per stop");
assert.match(
  player,
  /hintLevel = Math\.min\(3, Number\.isInteger\(state\.stopHints\[currentStop\.id\]\) \? state\.stopHints\[currentStop\.id\] : 0\)/,
  "reopening a stop should resume the consumed hint count"
);
assert.match(player, /state\.hintsUsed >= HINT_BUDGET/, "the global hint cap must be enforced");
assert.ok(player.includes('for (const tier of ["spooky", "afterdark", "overdrive"])'), "present non-cozy scare levels must be validated for every stop (cozy is the required base tier, checked separately)");
for (const tier of ["spooky", "afterdark", "overdrive"]) {
  // Count puzzle-variant objects for the tier in either source form: the
  // compact `spooky: { q: ... }` form or the JSON-style `"spooky": { "q": ... }`
  // form main's DEMO_PACK now uses (story values are strings, so only puzzle
  // objects match the `"q":` that follows the opening brace).
  const variants = (player.match(new RegExp(`"?${tier}"?\\s*:\\s*\\{\\s*"q":`, "g")) || []).length;
  assert.ok(variants >= 6, tier + " must define a puzzle variant for all six stops");
}
assert.match(worker, /const CACHE = "lantern-v\d+";/, "the app-shell cache must carry a versioned lantern-v<N> key so a release invalidates the previous cache");

console.log("Player source regression checks passed.");
