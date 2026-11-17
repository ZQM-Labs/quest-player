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

test("every demo finale discloses paused paid kits and the organizer coordination address", () => {
  const paused = {
    en: /currently unavailable/i,
    es: /no están disponibles actualmente/i,
    fr: /actuellement indisponibles/i,
    de: /derzeit nicht verfügbar/i,
    it: /non sono attualmente disponibili/i,
    pt: /atualmente indisponíveis/i,
    ru: /сейчас недоступны/i,
  };
  for (const lang of LANGS) {
    const note = load(lang).finale_demo_note;
    assert.match(note, paused[lang], lang + " must not imply paid kits are available");
    assert.ok(note.includes("zqmcomputing@gmail.com"), lang + " must identify the coordination address");
  }
});

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

test("language changes preserve every demo hint ladder and use only matching scare-level translations", () => {
  const i18n = require("../i18n.js");
  const current = i18n.current, translations = i18n.translations;
  const pack = JSON.parse(fs.readFileSync(path.join(root, "wisp-demo.json"), "utf8"));
  const original = JSON.stringify(pack);
  try {
    i18n.translations = {};
    for (const lang of LANGS) {
      i18n.current = lang;
      i18n.translations[lang] = { hint_1_cozy_1: "Cozy nudge", hint_1_spooky_1: "Spooky nudge", hint_1_1: "Legacy nudge" };
      const translated = i18n.translateGameContent(pack);
      assert.equal(translated.stops[0].hints.cozy[0], "Cozy nudge");
      assert.equal(translated.stops[0].hints.spooky[0], "Spooky nudge");
      for (let stop = 0; stop < pack.stops.length; stop++) {
        for (const level of ["cozy", "spooky", "afterdark", "overdrive"]) {
          const expected = pack.stops[stop].hints[level].slice();
          if (stop === 0 && level === "cozy") expected[0] = "Cozy nudge";
          if (stop === 0 && level === "spooky") expected[0] = "Spooky nudge";
          assert.deepEqual(translated.stops[stop].hints[level], expected, lang + ": stop " + (stop + 1) + " " + level);
        }
      }
      assert.equal(JSON.stringify(pack), original, "translation must not mutate the source pack");
    }
  } finally {
    i18n.current = current;
    i18n.translations = translations;
  }
});

test("legacy flat hints retain their translation keys without mutating source content", () => {
  const i18n = require("../i18n.js");
  const current = i18n.current, translations = i18n.translations;
  const pack = { stops: [{ id: 1, name: "First stop", hints: ["one", "two", "three"] }] };
  try {
    i18n.current = "es";
    i18n.translations = { es: { hint_1_1: "uno", hint_1_cozy_2: "wrong level" } };
    assert.deepEqual(i18n.translateGameContent(pack).stops[0].hints, ["uno", "two", "three"]);
    assert.deepEqual(pack.stops[0].hints, ["one", "two", "three"]);
  } finally {
    i18n.current = current;
    i18n.translations = translations;
  }
});
