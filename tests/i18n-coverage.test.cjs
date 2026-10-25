const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const LANGS = ["en", "es", "fr", "de", "it", "pt", "ru"];
const load = (l) => JSON.parse(fs.readFileSync(path.join(root, "i18n", l + ".json"), "utf8"));

// Keys added when the remaining UI chrome was wired (Oct 2026). If a locale
// file loses one, or the markup loses its data-i18n hook, the language
// switcher silently stops translating that element — this test is the alarm.
const NEW_KEYS = [
  "skip_to_content", "global_leaderboard", "communities_near_you",
  "lab_note_label", "lab_note_short", "lab_note_text",
  "pause_button", "resume_button", "light_lantern_button",
  "unlock_sign_code_button", "your_relics", "past_stops_button",
  "team_name_too_long", "global_rankings_empty", "communities_empty",
  "invite_team_title", "invite_team_text", "copy_link_button",
  "copied_button", "close_button",
];

test("all locales carry identical key sets including the wired-chrome keys", () => {
  const en = load("en");
  for (const k of NEW_KEYS) assert.ok(en[k], "en missing " + k);
  for (const l of LANGS) {
    assert.deepEqual(Object.keys(load(l)).sort(), Object.keys(en).sort(), l + " key set differs from en");
  }
});

test("index.html wires the chrome elements with data-i18n", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  for (const k of ["skip_to_content", "global_leaderboard", "communities_near_you",
    "lab_note_label", "lab_note_short", "lab_note_text", "your_relics",
    "pause_button", "light_lantern_button", "unlock_sign_code_button", "past_stops_button"]) {
    assert.ok(html.includes('data-i18n="' + k + '"'), "index.html missing data-i18n=" + k);
  }
});

test("dynamic chrome strings route through the i18n helper", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.ok(app.includes('T("pause_button"'), "app.js pause label not localized");
  assert.ok(app.includes('T("resume_button"'), "app.js resume label not localized");
  assert.ok(app.includes('T("team_name_too_long"'), "app.js team-name alert not localized");
});
