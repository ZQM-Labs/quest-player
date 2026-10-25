"use strict";
/* lantern-player — game state machine.
   Content comes from a pack (exported by lantern-content). DEMO_PACK below is
   the embedded example so ?demo=1 plays with no backend. Each stop must provide
   story and puzzle content for all four scare levels; malformed packs are rejected. */

const API_BASE =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8090" : "https://api.zqmlabs.com";

const DEMO_PACK = {
  "title": "Wisp's Lost Lanterns",
  "kit": "DEMO",
  "stops": [
    {
      "id": 1,
      "name": "The Welcome Pumpkin",
      "lat": 29.0258,
      "lng": -80.927,
      "code": "LANTERN-1",
      "story": {
        "cozy": "Wisp spins in a wobbly circle, her light thin as a candle in the wind. “My first lantern rolled away — right here, right at the start!” Her voice is small, but her hope is not gone yet. “You found me, Keepers. Help me light this one, and maybe the road home will start to come back.”",
        "spooky": "A carved pumpkin grins where no pumpkin should be. Something glows inside it — something alive, something watching. The grin widens as you approach, and you realize: it's not a pumpkin at all. It's a lantern, and it's been waiting for you.",
        "afterdark": "The old-timers say a light once wandered this road, looking for the turning it missed in 1768. They say it still wanders, still searching, still hoping. Tonight, that light is Wisp — and tonight, Keepers, you can help her find her way home.",
        "overdrive": "Dr. Z's voice crackles through the static: “FULL MADNESS engaged! Lantern one of six, and my sensors detect faster teams ahead of you. That pumpkin isn't smiling — it's SMIRKING. Wipe that smirk off its face and reclaim what's Wisp's!”"
      },
      "puzzle": {
        "cozy": {
          "q": "Count the pumpkins in the patch picture your organizer showed you. How many are smiling?",
          "a": "4",
          "type": "number"
        },
        "spooky": {
          "q": "Riddle: I have a face but cannot see, I glow but cannot flee. On Halloween night I watch the street. What am I?",
          "a": "jack-o-lantern",
          "type": "text"
        },
        "afterdark": {
          "q": "The colony year hides in the welcome sign's numbers. Add its digits. What do you get?",
          "a": "22",
          "type": "number"
        },
        "overdrive": {
          "q": "Dr. Z's madness meter reads 6.66. Round to the nearest whole number and multiply by the number of lanterns.",
          "a": "42",
          "type": "number"
        }
      },
      "fallback": {
        "q": "What color is the ribbon on the welcome sign?",
        "a": "orange"
      },
      "hints": {
        "cozy": [
          "Look low — lanterns love the ground.",
          "Count slowly, out loud, as a team.",
          "Ranger assist: the smiling pumpkins are 4."
        ],
        "spooky": [
          "Look low — lanterns love the ground.",
          "Count slowly, out loud, as a team.",
          "Ranger assist: a carved, glowing jack-o-lantern."
        ],
        "afterdark": [
          "Look low — lanterns love the ground.",
          "Count slowly, out loud, as a team.",
          "Ranger assist: add the year's digits — they sum to 22."
        ],
        "overdrive": [
          "Look low — lanterns love the ground.",
          "Count slowly, out loud, as a team.",
          "Ranger assist: 7 × 6 = 42."
        ]
      },
      "art": "stop-1-pumpkin.webp",
      "wisp": "That's MINE! Oh — oh! It still remembers me. Quick, light it!",
      "lit": "One down! See how it glows? That's my happy leaking out."
    },
    {
      "id": 2,
      "name": "The Whispering Oak",
      "lat": 29.0262,
      "lng": -80.9264,
      "code": "LANTERN-2",
      "story": {
        "cozy": "Oakie has stood here longer than anyone can remember, and somewhere high in his branches a lantern waits. Wisp's light is steadier now — one lantern lit will do that. “Oakie kept it safe all this time,” she whispers, looking up. “Let's show him what Keepers can do.”",
        "spooky": "Behind you, one lantern burns. Ahead, the oak's branches are bare, but something in the canopy breathes in and out, in and out — like the tree is dreaming. The leaves rustle though there's no wind. A voice whispers from the branches: “Whooo dares to enter my domain?” — and underneath it, fainter, something else whispers the words back, a half-second late.",
        "afterdark": "One lantern burns behind you as you step under the oak. They say this oak was a hanging tree in the 1800s. On still nights the leaves whisper names — the names of those who never left. Listen carefully. Is one of them yours? Or is it Wisp's, calling out for help?",
        "overdrive": "Dr. Z crackles in: “Lantern two of six! My bark-cams caught Oakie NAPPING through your arrival. Two hundred years old and asleep on duty! Wake him the loud way, Keepers — fast feet, faster answers. That lantern is not going to reclaim itself.”"
      },
      "puzzle": {
        "cozy": {
          "q": "Find the oak. How many wooden swings or benches face it?",
          "a": "2",
          "type": "number"
        },
        "spooky": {
          "q": "I whisper without a mouth and shelter without walls. I drop acorns for the squirrels below. What am I?",
          "a": "oak",
          "type": "text"
        },
        "afterdark": {
          "q": "The word 'whispering' hides a number. Count its letters, then subtract the benches (2).",
          "a": "8",
          "type": "number"
        },
        "overdrive": {
          "q": "The oak has whispered 200 years. Each year it whispers 3 words. How many words total? Count the digits.",
          "a": "6",
          "type": "number"
        }
      },
      "fallback": {
        "q": "What is carved on the small sign by the oak?",
        "a": "wisp"
      },
      "hints": {
        "cozy": [
          "Face the tree like it is facing you.",
          "Only count the ones looking at the oak.",
          "Ranger assist: the answer is 2."
        ],
        "spooky": [
          "Face the tree like it is facing you.",
          "Only count the ones looking at the oak.",
          "Ranger assist: the oak itself."
        ],
        "afterdark": [
          "Face the tree like it is facing you.",
          "Only count the ones looking at the oak.",
          "Ranger assist: 'whispering' has 10 letters — 10 − 2 benches = 8."
        ],
        "overdrive": [
          "Face the tree like it is facing you.",
          "Only count the ones looking at the oak.",
          "Ranger assist: 200 × 3 = 600 words, and 6 + 0 + 0 = 6."
        ]
      },
      "art": "stop-2-oak.webp",
      "wisp": "Shhh — Oakie is sleeping. He only hides things for friends. We're friends, right?",
      "lit": "Got it! Oakie says you're officially tree-approved."
    },
    {
      "id": 3,
      "name": "The Giggling Graveyard (pretend!)",
      "lat": 29.0266,
      "lng": -80.9258,
      "code": "LANTERN-3",
      "story": {
        "cozy": "The tombstones are foam, the ghosts are pretend, and the giggling is real — bubbling up from under the grass like a joke that won't stay buried. Wisp's giggle joins it, louder than it was at the pumpkin patch. Two lights will do that. Somewhere under the giggles, a lantern waits to be found.",
        "spooky": "Two lanterns burn behind you. The foam tombstones lean like bad teeth, and the giggling isn't coming from any of them. It's coming from underneath. The ground trembles slightly, and you realize: the graveyard is alive, and it's laughing at you.",
        "afterdark": "Two lanterns lit, and the ground remembers more than the stones do. Pretend stones, real ground. The town buried its 1918 flu dead in a field like this one — and on Halloween the veil is thin enough to hear them laugh. They're not mocking you. They're inviting you to play.",
        "overdrive": "Dr. Z crackles in: “My scoreboard says you're trailing a team of TODDLERS, Keepers! The ghosts are keeping score and they are NOT impressed. Tag them back — TAG. THEM. BACK. — and take lantern three before the toddlers do.”"
      },
      "puzzle": {
        "cozy": {
          "q": "One foam tombstone says R.I.P. — Rest In... what? (The silly word on the stone!)",
          "a": "pumpkins",
          "type": "text"
        },
        "spooky": {
          "q": "The gnome's hat points to the tombstones. His hat is red. What color is it?",
          "a": "red",
          "type": "text"
        },
        "afterdark": {
          "q": "One stone reads 'Here lies Wisp's lantern'. Count the letters in 'lantern'.",
          "a": "7",
          "type": "number"
        },
        "overdrive": {
          "q": "The graveyard has 5 tombstones. Each tombstone has 4 letters. Add the letters to the number of stones.",
          "a": "9",
          "type": "number"
        }
      },
      "fallback": {
        "q": "How many foam tombstones are there?",
        "a": "5"
      },
      "hints": {
        "cozy": [
          "Read the stones — one of them is joking.",
          "It rhymes with the patch from Stop 1.",
          "Ranger assist: Rest In Pumpkins."
        ],
        "spooky": [
          "Read the stones — one of them is joking.",
          "It rhymes with the patch from Stop 1.",
          "Ranger assist: red — the question tells you!"
        ],
        "afterdark": [
          "Read the stones — one of them is joking.",
          "It rhymes with the patch from Stop 1.",
          "Ranger assist: count l-a-n-t-e-r-n — 7 letters."
        ],
        "overdrive": [
          "Read the stones — one of them is joking.",
          "It rhymes with the patch from Stop 1.",
          "Ranger assist: 4 letters per stone + 5 stones = 9."
        ]
      },
      "art": "stop-3-graveyard.webp",
      "wisp": "Tag, you're it! Kidding — unless…? No, kidding. Probably.",
      "lit": "The ghosts are doing the wave. That's their applause. You're welcome."
    },
    {
      "id": 4,
      "name": "The Spider's Counting Web",
      "lat": 29.027,
      "lng": -80.9252,
      "code": "LANTERN-4",
      "story": {
        "cozy": "Mrs. Spider — she's friendly, and made of pipe cleaners — has a lantern tangled in her web, right where the parade path crosses. Something in the web's pattern tugs at Wisp. “I know this crossing,” she says slowly. “I danced the parade through here — before.” Three lights burn behind her, and the way home is starting to feel familiar. “She only lends it to good listeners. Are you listening?”",
        "spooky": "Three lanterns burn behind you. The web stretches between the gazebo posts like a trap, and the dew on it isn't dew — it's too thick, and it trembles when you step close. Mrs. Spider watches you with all eight eyes, and the web hums against the dark, counting every step you take.",
        "afterdark": "Three lanterns lit, and this web has been rebuilt in this exact spot for eleven years. Orb weavers rebuild every night. This one remembers every face that's ever been caught. She's waiting to see if yours is worth remembering.",
        "overdrive": "Dr. Z crackles in: “Mrs. Spider has rebuilt eleven webs tonight AND finished a crossword, Keepers! Your excuse is WHAT, exactly? Untangle lantern four before she loses patience — and spiders are not known for their patience. Clock's ticking!”"
      },
      "puzzle": {
        "cozy": {
          "q": "A real spider has 8 legs. Mrs. Spider is holding up 3 legs to wave. How many legs are on the ground?",
          "a": "5",
          "type": "number"
        },
        "spooky": {
          "q": "Mrs. Spider's web has 8 points. She cuts 5. How many remain?",
          "a": "3",
          "type": "number"
        },
        "afterdark": {
          "q": "Mrs. Spider has 8 legs. She gives 3 to her sister and 4 to her brother. How many legs does she have left?",
          "a": "1",
          "type": "number"
        },
        "overdrive": {
          "q": "Mrs. Spider weaves 8 legs. Each leg has 7 joints. How many joints total? Count the digits.",
          "a": "11",
          "type": "number"
        }
      },
      "fallback": {
        "q": "What color is Mrs. Spider?",
        "a": "purple"
      },
      "hints": {
        "cozy": [
          "Start with 8 legs, like every spider.",
          "She waves with 3 of them.",
          "Ranger assist: 8 − 3 = 5."
        ],
        "spooky": [
          "Start with 8 legs, like every spider.",
          "She waves with 3 of them.",
          "Ranger assist: 8 points − 5 cut = 3 remain."
        ],
        "afterdark": [
          "Start with 8 legs, like every spider.",
          "She waves with 3 of them.",
          "Ranger assist: 8 − 3 − 4 = 1."
        ],
        "overdrive": [
          "Start with 8 legs, like every spider.",
          "She waves with 3 of them.",
          "Ranger assist: 8 × 7 = 56 joints, and 5 + 6 = 11."
        ]
      },
      "art": "stop-4-spider.webp",
      "wisp": "Mrs. Spider says hi. She says it with all eight legs. It's a lot of hi.",
      "lit": "Untangled! Mrs. Spider is doing a happy leg-dance. All eight. It's a LOT."
    },
    {
      "id": 5,
      "name": "The Owl's Night Watch",
      "lat": 29.0274,
      "lng": -80.9246,
      "code": "LANTERN-5",
      "story": {
        "cozy": "High in the tree, Professor Hoot guards a lantern. He has one question for every visitor, and he always knows when the answer is a guess. Four lights burn behind Wisp now, and she sits up straighter in the dark. One more after this one, and then the parade. Then home. Answer true, Keepers — Hoot can tell.",
        "spooky": "Four lanterns burn behind you. The owl doesn't blink. Owls can't — but this one isn't trying to. It watches you solve, and you can feel it grading you. The silence is heavy, expectant. One wrong answer and you'll fail the test.",
        "afterdark": "Four lanterns lit, and the owl is listening closer than ever. Barred owls ask 'who cooks for you.' The old stories say if you answer wrong, you follow the sound into the dark and don't come back. Answer carefully. Tonight it has asked Wisp herself — and for the first time all night, she almost knows the answer.",
        "overdrive": "Dr. Z crackles in: “Lantern five of six, Keepers! Professor Hoot graded your last answer a C+. A C! In MY hunt! Listen harder, answer faster — make an owl proud. He's waiting, and owls are not known for their patience. Well, they are. But he's not.”"
      },
      "puzzle": {
        "cozy": {
          "q": "Listen to the sound your phone plays at this stop: is it an owl, a cat, or a frog?",
          "a": "owl",
          "type": "text"
        },
        "spooky": {
          "q": "The owl's favorite time rhymes with 'twilight light'. What is it?",
          "a": "twilight",
          "type": "text"
        },
        "afterdark": {
          "q": "Professor Hoot's name has 4 letters. The owl hoots 6 times. Add them.",
          "a": "10",
          "type": "number"
        },
        "overdrive": {
          "q": "Professor Hoot hoots 10 times. Each hoot has 2 syllables. Add the syllables to the number of hoots.",
          "a": "12",
          "type": "number"
        }
      },
      "fallback": {
        "q": "What two letters does an owl 'say'?",
        "a": "ho"
      },
      "hints": {
        "cozy": [
          "It is the sound this whole stop is named after.",
          "Twilight is this bird's favorite time.",
          "Ranger assist: it's the owl."
        ],
        "spooky": [
          "It is the sound this whole stop is named after.",
          "Twilight is this bird's favorite time.",
          "Ranger assist: twilight."
        ],
        "afterdark": [
          "It is the sound this whole stop is named after.",
          "Twilight is this bird's favorite time.",
          "Ranger assist: Hoot is 4 letters + 6 hoots = 10."
        ],
        "overdrive": [
          "It is the sound this whole stop is named after.",
          "Twilight is this bird's favorite time.",
          "Ranger assist: 2 syllables per hoot + 10 hoots = 12."
        ]
      },
      "art": "stop-5-owl.webp",
      "wisp": "Professor Hoot is very serious. Do your serious face. …Not that serious. Dial it back.",
      "lit": "‘Hoo,’ he says. That's owl for ‘well done.’ I translated. You're welcome."
    },
    {
      "id": 6,
      "name": "The Lantern Parade Ground",
      "lat": 29.0278,
      "lng": -80.924,
      "code": "LANTERN-6",
      "story": {
        "cozy": "The last lantern! Five lights already burn behind you, and the whole parade is waiting to glow. Say the old words with Wisp, Keepers, the way every parade begins: “Light the way, Wisp!” Then light it — and watch the road home appear.",
        "spooky": "Five lights behind you, one to go. The empty parade ground waits. Six lanterns, six shadows — but there are seven shadows moving on the grass, and one of them is waving at you. Wisp's light flickers nervously. “That's... that's not one of mine.”",
        "afterdark": "Every lantern you've lit is still burning behind you, a dotted line of fire through the dark. One more, and the road home exists. One more, and Wisp can find her way. One more, Keepers, and the night is yours.",
        "overdrive": "Dr. Z crackles in: “FINAL STRETCH — lantern six of six! Wisp ran the numbers and they are NOT in your favor. Light that last lantern like you mean it — FULL! MADNESS! The parade ground is watching, the shadows are waiting, and I'm timing you. GO!”"
      },
      "puzzle": {
        "cozy": {
          "q": "Teamwork finale: how many lanterns did you light on the whole hunt (including this one)?",
          "a": "6",
          "type": "number"
        },
        "spooky": {
          "q": "If each lantern burns for 3 hours, how many total hours do all 6 burn?",
          "a": "18",
          "type": "number"
        },
        "afterdark": {
          "q": "The 6 lanterns are numbered 1 through 6. Add the even numbers.",
          "a": "12",
          "type": "number"
        },
        "overdrive": {
          "q": "FINAL CHALLENGE: 6 lanterns, each burns 3 hours. Total burn time? Add the digits of your answer.",
          "a": "9",
          "type": "number"
        }
      },
      "fallback": {
        "q": "Say the magic words out loud as a team: 'Light the way, Wisp!' then type: wisp",
        "a": "wisp"
      },
      "hints": {
        "cozy": [
          "Count the stops on your map.",
          "One lantern per stop.",
          "Ranger assist: 6 lanterns."
        ],
        "spooky": [
          "Count the stops on your map.",
          "One lantern per stop.",
          "Ranger assist: 6 lanterns × 3 hours = 18."
        ],
        "afterdark": [
          "Count the stops on your map.",
          "One lantern per stop.",
          "Ranger assist: the even lanterns — 2 + 4 + 6 = 12."
        ],
        "overdrive": [
          "Count the stops on your map.",
          "One lantern per stop.",
          "Ranger assist: 6 × 3 = 18 hours, and 1 + 8 = 9."
        ]
      },
      "art": "stop-6-lantern.webp",
      "wisp": "This is it — the last one! My hands are all shaky. Do I have hands? I'm shaky anyway!",
      "lit": "IT'S LIT! Look at them all — look at ME! I'm basically a sunrise!"
    }
  ]
};

/* ---------- state ---------- */
const qs = new URLSearchParams(location.search);
// Demo mode is explicit: ?demo=1 (not ?demo=0). (m2)
const _demoVal = (qs.get("demo") || "").toLowerCase();
let isDemo = qs.has("demo") && !["0", "false", "no", "off"].includes(_demoVal);
// Corrupt saved state must not brick the player on load. (P3)
let _loaded = null;
try { _loaded = JSON.parse(localStorage.getItem("lantern-state") || "null"); } catch { _loaded = null; }
const state = _loaded || {
  team: "", scare: "cozy", solved: [], hintsUsed: 0, startedAt: null, pausedAt: null, hiddenAt: null, kitId: null
};
const HINT_BUDGET = 18;
state.pausedAt = state.pausedAt || null;
state.hiddenAt = state.hiddenAt || null;
state.cleanSolves = state.cleanSolves || 0;
state.stopHints = state.stopHints || {};
state.arrivedGps = state.arrivedGps || {};
state.stopAttempts = state.stopAttempts || {};  // wrong answers per stop id
state.stopTimes = state.stopTimes || {};        // {start, end} timestamps per stop id
state.arrivedVia = state.arrivedVia || {};      // gps|qr|manual per stop id
// Prefill the start screen's team field from saved state, so a returning
// player sees their team after a reload instead of a blank box. (The
// start handler also treats a blank field as "keep the saved team", so
// this is presentation only — but it prevents the confusion entirely.)
{ const tn = document.getElementById("team-name"); if (tn && state.team) tn.value = state.team; }
let sourcePack = DEMO_PACK;
let pack = DEMO_PACK;
let currentStop = null;
let hintLevel = 0;

/* i18n shortcut: translate a UI string via I18n.t, falling back to the
   English literal when i18n is unavailable or the key is untranslated. */
function T(key, fallback) {
  try {
    if (typeof I18n !== "undefined" && I18n.translations && I18n.translations[I18n.current]) {
      const v = I18n.t(key);
      if (v && v !== key) return v;
    }
  } catch (e) { /* fall through to the literal */ }
  return fallback;
}

/* ---------- pack validation (mirrors ZQM-Labs/quest-authoring SPEC.md) ----------
   A remote pack replaces DEMO_PACK wholesale. Without this gate a malformed
   pack (wrong stop count, missing hints, duplicate answers) crashes openMap()
   or the hint ladder mid-hunt. The caller rejects it by aborting the live-kit
   session; it must never fall back to the embedded pack under a live kit id. */
function validatePack(p) {
  if (!p || !Array.isArray(p.stops) || p.stops.length !== 6) {
    const got = !p ? "nothing" : (Array.isArray(p.stops) ? p.stops.length : typeof p.stops);
    return ["expected 6 stops, got " + got];
  }

  const errs = [];
  const answers = [];
  const ids = [];
  for (const s of p.stops) {
    if (!s || typeof s !== "object" || Array.isArray(s)) {
      errs.push("stop ?: must be an object");
      continue;
    }
    const tag = `stop ${s.id ?? "?"}`;
    // Tier variants are OPTIONAL (SPEC.md): variant() falls back to cozy at
    // runtime, so a missing tier is fine. A tier that IS present must be
    // well-formed — a malformed present tier would be used as-is and break.
    for (const tier of ["spooky", "afterdark", "overdrive"]) {
      const tierStory = s.story ? s.story[tier] : undefined;
      if (tierStory !== undefined && tierStory !== null &&
          (typeof tierStory !== "string" || !tierStory.trim())) {
        errs.push(`${tag}: story.${tier} is present but invalid`);
      }
      const tierPuzzle = s.puzzle ? s.puzzle[tier] : undefined;
      if (tierPuzzle !== undefined && tierPuzzle !== null) {
        const questionOk = typeof tierPuzzle.q === "string" && tierPuzzle.q.trim() !== "";
        const answerOk = (typeof tierPuzzle.a === "string" && tierPuzzle.a.trim() !== "") ||
          (typeof tierPuzzle.a === "number" && Number.isFinite(tierPuzzle.a));
        if (!questionOk || !answerOk) {
          errs.push(`${tag}: puzzle.${tier} is present but needs a non-empty question and answer`);
        }
      }
    }
    if (typeof s.id !== "number" || !Number.isInteger(s.id)) errs.push(`${tag}: id must be an integer`);
    else ids.push(s.id);
    if (typeof s.name !== "string" || !s.name.trim() ||
        typeof s.code !== "string" || !s.code.trim()) {
      errs.push(`${tag}: name + code must be non-empty strings`);
    }
    if (!s.story || typeof s.story !== "object" ||
        typeof s.story.cozy !== "string" || !s.story.cozy.trim()) {
      errs.push(`${tag}: story.cozy missing or invalid`);
    }
    const pz = s.puzzle && typeof s.puzzle === "object" ? s.puzzle.cozy : null;
    const qOk = pz && typeof pz.q === "string" && pz.q.trim() !== "";
    const aOk = pz && (typeof pz.a === "string" || (typeof pz.a === "number" && Number.isFinite(pz.a))) &&
      String(pz.a).trim() !== "";
    if (!qOk || !aOk) errs.push(`${tag}: puzzle.cozy needs a non-empty question and answer`);
    else answers.push(String(pz.a).trim().toLowerCase());
    if (!s.fallback || typeof s.fallback !== "object" ||
        typeof s.fallback.q !== "string" || !s.fallback.q.trim() ||
        !["string", "number"].includes(typeof s.fallback.a) || !String(s.fallback.a).trim()) {
      errs.push(`${tag}: fallback needs a non-empty question + answer`);
    }
    var hintsOk = false;
    if (Array.isArray(s.hints)) {
      hintsOk = s.hints.length === 3 &&
        s.hints.every(function (h) { return typeof h === "string" && h.trim(); });
    } else if (s.hints && typeof s.hints === "object") {
      hintsOk = ["cozy", "spooky", "afterdark", "overdrive"].every(function (lv) {
        return Array.isArray(s.hints[lv]) && s.hints[lv].length === 3 &&
          s.hints[lv].every(function (h) { return typeof h === "string" && h.trim(); });
      });
    }
    if (!hintsOk) {
      errs.push(`${tag}: needs exactly 3 non-empty string hints per scare level (or a legacy flat array of 3)`);
    }
    if (typeof s.lat !== "number" || !Number.isFinite(s.lat) ||
        typeof s.lng !== "number" || !Number.isFinite(s.lng)) {
      errs.push(`${tag}: lat/lng must be finite numbers`);
    } else if (s.lat < -90 || s.lat > 90 || s.lng < -180 || s.lng > 180) {
      errs.push(`${tag}: lat/lng out of geographic bounds`);
    }
  }
  if (new Set(answers).size !== answers.length) errs.push("cozy answers must be unique");
  if (new Set(ids).size !== ids.length) errs.push("stop ids must be unique");
  return errs;
}

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
function save() { try { localStorage.setItem("lantern-state", JSON.stringify(state)); } catch { /* private mode / quota - game continues in memory */ } }
function show(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
    s.setAttribute("aria-hidden", "true");
  });
  const target = $(id);
  target.classList.add("active");
  target.setAttribute("aria-hidden", "false");
  const heading = target.querySelector("h1, h2");
  if (heading) heading.focus();
  applyDemoBadge();
}
function applyDemoBadge() {
  const db = $("demo-badge");
  if (db) db.style.display = isDemo ? "block" : "none";
}
/* Scare-tier art: stop-1-pumpkin-spooky.webp etc. Cozy reuses the base file;
   a missing tier file falls back to base art via the img onerror guard. */
function safeArtName(name) {
  // Only allow a simple local WebP filename from an authored pack.
  return typeof name === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]*\.webp$/i.test(name) && !name.includes("..") ? name : "";
}
function artFor(stop) {
  const name = safeArtName(stop && stop.art);
  if (!name) return "";
  const tier = ["spooky", "afterdark", "overdrive"].includes(state.scare) ? state.scare : "cozy";
  if (tier !== "cozy") return "assets/img/" + name.replace(/\.webp$/i, "-" + tier + ".webp");
  return "assets/img/" + name.replace(/\.webp$/i, "-cozy.webp");
}

function variant(stop, kind) { // kind: "story" | puzzle object
  if (kind === "story") return stop.story[state.scare] || stop.story.cozy;
  return (stop.puzzle && (stop.puzzle[state.scare] || stop.puzzle.cozy)) || stop.fallback;
}

/* ---------- pilot-bundle HUD: relics, Wisp meter, hint budget ----------
   Pack-supplied names are untrusted (remote packs) — esc() them anywhere
   they enter HTML. WISP_MOODS is a local constant, safe. */
// Wisp's mood evolves with progress: her three story moments double as the
// meter's tiers, so the HUD itself tells her arc (lost → hopeful → home).
const WISP_MOODS = [
  { min: 0, src: "wisp-sad-intro.webp",
    alt: "Wisp the will-o'-the-wisp twirling sadly — 0 to 2 lanterns lit, she is still lost",
    cap: "Wisp is still lost…", capKey: "wisp_still_lost" },
  { min: 3, src: "wisp-hiding-lantern.webp",
    alt: "Wisp giggling, hope returning — 3 to 4 lanterns lit",
    cap: "Hope is flickering back…", capKey: "hope_flickering" },
  { min: 5, src: "wisp-leading-parade.webp",
    alt: "Wisp soaring joyfully at the head of her lanterns — 5 to 6 lit, she is almost home",
    cap: "She's almost home!", capKey: "almost_home" }
];
function wispMood(lit) {
  return WISP_MOODS.filter(m => lit >= m.min).pop();
}
// Map markers wear each stop's spot illustration; solved stops get a lit ring.
let markers = [];
let playerMarker = null, playerCircle = null;
function updatePlayerMarker(lat, lng, acc) {
  if (!map || mapBroken) return;
  const ll = [lat, lng];
  if (!playerMarker) {
    playerMarker = L.circleMarker(ll, { radius: 8, color: '#1a73e8', fillColor: '#1a73e8', fillOpacity: 0.9, weight: 2 }).addTo(map);
    playerCircle = L.circle(ll, { radius: acc, color: '#1a73e8', fillColor: '#1a73e8', fillOpacity: 0.15, weight: 1 }).addTo(map);
  } else {
    playerMarker.setLatLng(ll);
    playerCircle.setLatLng(ll).setRadius(acc);
  }
}
function stopIcon(s) {
  const lit = state.solved.includes(s.id);
  const face = artFor(s)
    ? `<img src="${artFor(s)}" alt="${lit ? "Lit" : "Unlit"}: Stop ${s.id} — ${esc(s.name)}" onerror="this.onerror=null;this.remove()">`
    : `<div class="pin-fallback" role="img" aria-label="${lit ? "Lit" : "Unlit"}: Stop ${s.id} — ${esc(s.name)}">🏮</div>`;
  return L.divIcon({ className: "stop-marker" + (lit ? " lit" : ""), html: face,
    iconSize: [46, 46], iconAnchor: [23, 23] });
}
/* ---------- live geolocation: tracking, geofences, routing ----------
   Offline-first: every piece degrades. No permission -> the manual flow
   (stop list + Navigate + sign codes) works exactly as before. Leaflet
   absent -> distance-sorted text stop list. OSRM unreachable -> straight
   dashed guide line. Nothing here is required to finish the hunt. */
const GEO_DEFAULT_RADIUS = 30; // meters; a stop may override with `radius`
let geoWatchId = null;
let playerPos = null;          // {lat, lng, acc}
let geoState = "idle";         // idle | asking | active | denied | declined | unavailable
let geoDeclined = false;       // session flag: user tapped "No thanks"
let guideLine = null;
let lastRouteKey = "";
let arrivalFired = {};
// Session-only arrivalFired resets on reload; state.arrivedGps persists in
// localStorage. hasArrived() unifies both so arrival UI survives reloads.
function hasArrived(s) {
  return !!(arrivalFired[s.id] || (state.arrivedGps && state.arrivedGps[s.id]));
};
let lastCardSig = "";
let lastListSig = "";

function stopRadius(s) { return s.radius || GEO_DEFAULT_RADIUS; }
function nextUnsolved() { return pack.stops.find(s => !state.solved.includes(s.id)); }
function mapsUrl(s) {
  return "https://www.google.com/maps/dir/?api=1&destination=" +
    s.lat + "," + s.lng + "&travelmode=walking";
}
function fmtDist(m) {
  return m < 950 ? Math.round(m) + "m" : (m / 1000).toFixed(1) + "km";
}
function startTracking() {
  if (!("geolocation" in navigator)) { geoState = "unavailable"; renderNextStop(); return; }
  if (geoWatchId !== null || geoDeclined) return;
  geoState = "asking";
  renderNextStop();
  geoWatchId = navigator.geolocation.watchPosition(onGeoPos, onGeoErr, {
    enableHighAccuracy: true, maximumAge: 5000, timeout: 15000
  });
}
function stopTracking() {
  if (geoWatchId !== null) {
    try { navigator.geolocation.clearWatch(geoWatchId); } catch (e) {}
    geoWatchId = null;
  }
}
function onGeoPos(pos) {
  const c = pos.coords;
  playerPos = { lat: c.latitude, lng: c.longitude, acc: c.accuracy || 999 };
  geoState = "active";
  updatePlayerMarker(playerPos.lat, playerPos.lng, playerPos.acc);
  checkGeofences();
  if (mapBroken) renderStopList(); else renderNextStop();
  updateGuideLine();
}
function onGeoErr(err) {
  geoState = (err && err.code === 1) ? "denied" : "unavailable";
  if (mapBroken) renderStopList(); else renderNextStop();
}
// A stop counts as "arrived" when the player is inside its radius with a
// sane fix. Poor-accuracy fixes never trigger arrivals (no parking-lot
// false positives from across the street).
function checkGeofences() {
  if (!playerPos || playerPos.acc > 60) return;
  state.arrivedGps = state.arrivedGps || {};
  let changed = false;
  for (const s of pack.stops) {
    if (state.solved.includes(s.id) || arrivalFired[s.id]) continue;
    if (haversine(playerPos.lat, playerPos.lng, s.lat, s.lng) <= stopRadius(s)) {
      arrivalFired[s.id] = true;
      state.arrivedGps[s.id] = true; state.arrivedVia[s.id] = "gps";
      changed = true;
    }
  }
  if (changed) save();
}
function cardSig(next) {
  const arrived = pack.stops
    .filter(s => hasArrived(s) && !state.solved.includes(s.id))
    .map(s => s.id).join(",");
  const d = (playerPos && next)
    ? Math.round(haversine(playerPos.lat, playerPos.lng, next.lat, next.lng) / 5) : "-";
  return [geoState, next ? next.id : "x", d, arrived, state.solved.length].join("|");
}
function geoPromptNodes(box) {
  const p = document.createElement("p");
  p.textContent = "Let Wisp track your team? She\u2019ll point at the next stop and cheer when you arrive.";
  const en = document.createElement("button");
  en.textContent = "\uD83D\uDCCD " + T("enable_location", "Enable location");
  en.setAttribute("aria-label", "Enable location tracking");
  en.addEventListener("click", () => { geoDeclined = false; startTracking(); });
  const no = document.createElement("button");
  no.textContent = T("no_thanks", "No thanks");
  no.className = "ghost-btn";
  no.setAttribute("aria-label", "Decline location tracking");
  no.addEventListener("click", () => {
    geoDeclined = true; geoState = "declined";
    lastCardSig = ""; lastListSig = "";
    if (mapBroken) renderStopList(); else renderNextStop();
  });
  box.appendChild(p); box.appendChild(en); box.appendChild(no);
}
function navButton(s, label) {
  const nav = document.createElement("a");
  nav.className = "nav-btn";
  nav.href = mapsUrl(s);
  nav.setAttribute("aria-label", "Open directions to " + s.name + " in maps");
  nav.target = "_blank";
  nav.rel = "noopener";
  nav.textContent = label || ("\uD83E\uDDED " + T("navigate_button", "Navigate"));
  return nav;
}
function renderNextStop() {
  if (currentStop && !state.stopTimes[currentStop.id]) state.stopTimes[currentStop.id] = { start: Date.now() };
  const box = $("next-stop");
  if (!box) return;
  const next = nextUnsolved();
  const sig = cardSig(next);
  if (sig === lastCardSig) return; // don't thrash the DOM on every GPS tick
  lastCardSig = sig;
  box.textContent = "";
  if (!next) return;
  // Arrival banners for any unsolved stop we're standing at.
  for (const s of pack.stops) {
    if (hasArrived(s) && !state.solved.includes(s.id)) {
      const banner = document.createElement("div");
      banner.className = "arrival-banner";
      const b = document.createElement("strong");
      b.textContent = `\uD83D\uDCCD ${T("youre_at", "You're at Stop")} ${s.id}: ${s.name}!`;
      banner.appendChild(b);
      const sub = document.createElement("div");
      sub.textContent = `${T("within", "Within ~")}${stopRadius(s)}${T("meters", "m")} \u2014 Wisp can smell the lantern from here.`;
      banner.appendChild(sub);
      const open = document.createElement("button");
      open.textContent = T("open_puzzle", "Open the puzzle") + " \u2192";
      open.addEventListener("click", () => window.openStop(s.id));
      banner.appendChild(open);
      box.appendChild(banner);
    }
  }
  const head = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = `Next: Stop ${next.id} \u2014 ${next.name}`;
  head.appendChild(strong);
  box.appendChild(head);

  const row = document.createElement("div");
  row.className = "geo-row";
  if (geoState === "active" && playerPos) {
    const d = haversine(playerPos.lat, playerPos.lng, next.lat, next.lng);
    const b = bearing(playerPos.lat, playerPos.lng, next.lat, next.lng);
    const info = document.createElement("span");
    info.textContent = `\uD83D\uDCCD ${fmtDist(d)} ${compassDir(b)} of you`;
    row.appendChild(info);
    if (playerPos.acc > 60) {
      const weak = document.createElement("span");
      weak.className = "geo-weak";
      weak.textContent = ` (GPS \u00B1${Math.round(playerPos.acc)}m \u2014 move to open sky)`;
      row.appendChild(weak);
    }
  } else if (geoState === "asking") {
    const info = document.createElement("span");
    info.textContent = "\uD83D\uDCCD " + T("finding_you", "Finding you\u2026");
    row.appendChild(info);
  } else if (geoState === "idle" && !geoDeclined) {
    geoPromptNodes(box);
  } else {
    const info = document.createElement("span");
    info.textContent = geoState === "denied"
      ? "\uD83D\uDCCD " + T("location_off", "Location is off \u2014 the hunt still works fine without it.")
      : "\uD83D\uDCCD " + T("no_location", "No live location \u2014 use Navigate below.");
    row.appendChild(info);
    const en = document.createElement("button");
    en.textContent = "\uD83D\uDCCD " + T("enable_location", "Enable location");
    en.className = "ghost-btn";
    en.addEventListener("click", () => { geoDeclined = false; startTracking(); });
    row.appendChild(en);
  }
  if (row.childNodes.length) box.appendChild(row);

  box.appendChild(navButton(next));
  const btn = document.createElement("button");
  btn.textContent = T("at_stop_button", "We're at the stop") + " \u2192";
  btn.addEventListener("click", () => window.openStop(next.id));
  box.appendChild(btn);

  if (state.solved.length === 3) {
    const note = document.createElement("p");
    note.className = "lab-note";
    note.innerHTML = `\uD83D\uDCDC <strong>Lab note, halfway:</strong> Wisp's glow is stabilizing \u2014 the lanterns are remembering her. Don't let the fourth one spook you. It spooked <em>me</em>, and I built the things. \u2014 <em>Dr. Z</em>`;
    box.appendChild(note);
  }
}
// Text fallback when Leaflet can't load: stops sorted by live distance,
// each with a Navigate link. Fully offline-capable.
function renderStopList() {
  const box = $("next-stop");
  if (!box) return;
  const sig = "list|" + cardSig(nextUnsolved());
  if (sig === lastListSig) return;
  lastListSig = sig;
  box.textContent = "";
  const intro = document.createElement("p");
  intro.textContent = T("stop_list_intro", "Map tiles unavailable \u2014 the stop list works offline:");
  box.appendChild(intro);
  if (geoState === "idle" && !geoDeclined) geoPromptNodes(box);
  const sorted = [...pack.stops].sort((a, b) => {
    if (!playerPos) return a.id - b.id;
    return haversine(playerPos.lat, playerPos.lng, a.lat, a.lng) -
           haversine(playerPos.lat, playerPos.lng, b.lat, b.lng);
  });
  const ol = document.createElement("ol");
  ol.className = "stop-list";
  for (const s of sorted) {
    const li = document.createElement("li");
    const done = state.solved.includes(s.id);
    let label = `Stop ${s.id}: ${s.name}`;
    if (done) label = "\uD83C\uDFEE " + label + " \u2014 " + T("lit", "lit!");
    else {
      if (playerPos) label += ` \u2014 ${fmtDist(haversine(playerPos.lat, playerPos.lng, s.lat, s.lng))}`;
      if (hasArrived(s)) label = "\uD83D\uDCCD " + label + " \u2014 " + T("youre_here", "you're here!");
    }
    const span = document.createElement("span");
    span.textContent = label;
    li.appendChild(span);
    li.appendChild(document.createTextNode(" "));
    li.appendChild(navButton(s, "\uD83E\uDDED"));
    if (!done) {
      const go = document.createElement("button");
      go.textContent = "Open \u2192";
      go.addEventListener("click", () => window.openStop(s.id));
      li.appendChild(document.createTextNode(" "));
      li.appendChild(go);
    }
    ol.appendChild(li);
  }
  box.appendChild(ol);
}
// Guide line: dashed straight line offline; upgraded to a real walking
// route from OSRM when the network cooperates. Stale responses are dropped.
function updateGuideLine() {
  if (!map || mapBroken || !playerPos) return;
  const next = nextUnsolved();
  if (!next) {
    if (guideLine) { map.removeLayer(guideLine); guideLine = null; }
    return;
  }
  drawStraightGuide(next);
  const key = `${playerPos.lat.toFixed(4)},${playerPos.lng.toFixed(4)}>${next.id}`;
  if (key !== lastRouteKey) {
    lastRouteKey = key;
    fetchOsrmRoute(next, key, { lat: playerPos.lat, lng: playerPos.lng });
  }
}
function drawStraightGuide(next) {
  if (!map || mapBroken || !playerPos) return;
  if (guideLine) map.removeLayer(guideLine);
  guideLine = L.polyline(
    [[playerPos.lat, playerPos.lng], [next.lat, next.lng]],
    { color: "#7c4dff", weight: 3, dashArray: "8 8", opacity: 0.85 }
  ).addTo(map);
}
async function fetchOsrmRoute(next, key, from) {
  if (!navigator.onLine) return;
  try {
    const u = "https://router.project-osrm.org/route/v1/foot/" +
      `${from.lng},${from.lat};${next.lng},${next.lat}?overview=full&geometries=geojson`;
    const r = await fetch(u);
    if (!r.ok) return;
    const j = await r.json();
    const coords = j.routes && j.routes[0] && j.routes[0].geometry && j.routes[0].geometry.coordinates;
    if (!coords || !coords.length || !map || mapBroken) return;
    const cur = nextUnsolved();
    if (!cur || cur.id !== next.id || lastRouteKey !== key) return; // stale
    if (guideLine) map.removeLayer(guideLine);
    guideLine = L.polyline(coords.map(c => [c[1], c[0]]),
      { color: "#1a73e8", weight: 4, opacity: 0.9 }).addTo(map);
  } catch (e) { /* keep the dashed straight line */ }
}

function updateHUD() {
  const lit = state.solved.length, total = pack.stops.length;
  const wm = $("wisp-meter");
  if (wm) {
    const mood = wispMood(lit);
    let dots = "";
    for (let i = 0; i < total; i++) {
      const on = i < lit;
      const curAttr = (i === (lit < total ? lit : lit - 1)) ? ' aria-current="step"' : "";
      dots += `<span role="listitem"${curAttr} aria-label="Lantern ${i + 1}: ${on ? "lit" : "not lit"}">${on ? "🏮" : "🌑"}</span>`;
    }
    wm.innerHTML = `<strong>${T("wisp_glow", "Wisp's glow")}</strong>` +
      `<img class="wisp-mood" src="assets/img/${mood.src}" alt="${mood.alt}">` +
      `<div class="dots" role="list" aria-label="${lit} of ${total} ${T("lanterns_lit", "lanterns lit")}">${dots}</div>` +
      `<div>${lit}/${total} ${T("lanterns_lit", "lanterns lit")} — ${mood.capKey ? T(mood.capKey, mood.cap) : mood.cap}</div>`;
  }
  markers.forEach((m, i) => { if (m.setIcon) m.setIcon(stopIcon(pack.stops[i])); });
  const tray = $("relics");
  if (tray) {
    tray.innerHTML = pack.stops.map(s => {
      const got = state.solved.includes(s.id);
      const cls = got ? "relic" : "relic locked";
      const inner = (got && artFor(s))
        ? `<img class="${cls}" src="${artFor(s)}" alt="Relic from Stop ${s.id}: ${esc(s.name)}" onerror="this.onerror=null;this.remove()">`
        : `<div class="${cls}" role="img" aria-label="${got ? "lit lantern relic" : "unfound relic"}">${got ? "🏮" : "❔"}</div>`;
      return `<span title="${got ? esc(s.name) : "???"}">${inner}</span>`;
    }).join("");
  }
  const left = HINT_BUDGET - state.hintsUsed;
  const hc = $("hint-count"), hb = $("btn-hint");
  if (hc) hc.textContent = left > 0 ? `(${left} left)` : "(none left)";
  if (hb) hb.disabled = left <= 0;
}

/* ---------- flow ---------- */
$("btn-start").addEventListener("click", async () => {
  const teamName = $("team-name").value.trim();
  if (teamName.length > 30) { alert(T("team_name_too_long", "Team name must be 30 characters or less.")); return; }
  const prevTeam = state.team;
  // A blank field must not read as a team change. After a reload the input
  // starts empty (it is not prefilled from saved state), so a returning
  // player who just taps Start would otherwise trip the new-kit guard
  // below and lose every solved stop. Blank keeps the saved team; the
  // default name applies only when there is no saved team either.
  state.team = teamName || prevTeam || "Lantern Keepers";
  const code = $("access-code").value.trim();
  let startingKit = "DEMO";
  // The public demo code plays the embedded pack with no backend. Poster-QR
  // arrivals carry ?kit=DEMO&ac=... but no ?demo=1, so without this check the
  // demo code falls into live-kit validation and dies against the backend.
  if (!isDemo && code.toUpperCase() === "WISP-2026-DEMO") isDemo = true;
  if (!isDemo) {
    const result = await validateCode(code);
    if (!result) { alert(T("access_code_invalid", "That access code didn't check out — ask your organizer.")); return; }
    // Show loading state
    const startBtn = $("btn-start");
    startBtn.disabled = true;
    startBtn.textContent = "Loading...";
    // Fetch kit bundle + content pack. Always restore the control even if an
    // unexpected exception escapes the helper, so a transient failure cannot
    // strand the player in a permanent loading state.
    let bundle = null;
    try {
      bundle = await fetchKitBundle(result.kit, code);
    } finally {
      startBtn.disabled = false;
      startBtn.textContent = T("start_button", "Start the hunt");
    }
    if (!bundle) { alert(T("load_failed", "Could not load the game — check your connection.")); return; }
    // A live kit must start on its own validated pack. A malformed pack (or
    // a kit with no pack at all) aborts the session here — BEFORE startingKit
    // is set — so the embedded demo pack can never play under a live kit id
    // and syncProgress() can never post demo-content solves to that kit's
    // leaderboard. The fetch-failure path above (bundle === null) is unchanged.
    if (!bundle.pack) { alert(T("load_failed", "Could not load the game — check your connection.")); return; }
    {
      // Gate the remote pack: a malformed one would crash openMap()/hints mid-hunt.
      const errs = validatePack(bundle.pack);
      if (errs.length) {
        console.error("Rejected content pack:", errs);
        alert(T("pack_validation_failed", "This kit's content failed validation — the hunt cannot start with this kit. No progress has been saved to its leaderboard. Tell your organizer."));
        return;
      }
      sourcePack = bundle.pack;
      pack = (typeof I18n !== "undefined") ? I18n.translateGameContent(sourcePack) : sourcePack;
    }
    // Update scare level from kit if available
    if (result.scare) {
      state.scare = result.scare;
    }
    startingKit = result.kit;
  }
  if (state.kitId !== startingKit || (prevTeam && prevTeam !== state.team)) {
    // New kit (or demo<->live switch): start clean instead of inheriting
    // solved stops from whatever was played before on this device. (P1)
    state.solved = []; state.hintsUsed = 0; state.cleanSolves = 0; state.stopHints = {};
    state.arrivedGps = {}; arrivalFired = {}; lastRouteKey = ""; lastCardSig = ""; lastListSig = "";
    state.startedAt = Date.now();
    state.kitId = startingKit;
  } else {
    state.startedAt = state.startedAt || Date.now();
  }
  const awaySince = state.pausedAt || state.hiddenAt;
  if (awaySince && state.startedAt) {
    // Reloaded while paused or hidden: keep the whole away span out of
    // elapsed time and come back paused (Resume re-anchors from here).
    state.startedAt += Date.now() - awaySince;
    state.pausedAt = Date.now();
    state.hiddenAt = null;
    $("btn-pause").textContent = T("resume_button", "▶ Resume");
  }
  paintClock();
  save(); show("screen-scare");
  if (!state.pausedAt) startTimer();
  focusFirst();
  const scareHeading = document.querySelector("#screen-scare h2");
  if (scareHeading) scareHeading.focus();
  playSound("assets/audio/hoot.ogg");
});

/* ---------- QR deep links ----------
   The kit's signs encode ?kit=&stop=&code=. Reading them here is what makes
   "scan to unlock the puzzle" actually work; without it the QR is decorative
   and every code has to be typed by hand. */
// Strict stop parsing: ?stop=3abc no longer reads as 3. (m8)
const _stopRaw = qs.get("stop") || "";
const deepStop = /^\d+$/.test(_stopRaw) ? parseInt(_stopRaw, 10) : NaN;
const deepSignCode = (qs.get("code") || "").trim();
const deepKit = (qs.get("kit") || "").trim();
// Access codes arrive as ?ac=; ?code= is the *sign* code on stop QRs. Old
// start posters used ?code= for access - honor it only when no ?stop= is
// present, so a scanned stop sign can never poison the access field. (P2)
const accessCode = (qs.get("ac") || "").trim() || (!qs.get("stop") ? deepSignCode : "");
if (deepKit && !state.kitId) state.kitId = deepKit;
if (accessCode) {
  const ac = $("access-code");
  if (ac && !ac.value) ac.value = accessCode;
}

// In demo mode the access code is optional, but nothing on the start
// screen said so — first-timers stalled looking for a code. Say it.
if (isDemo) {
  const ac = $("access-code");
  if (ac) ac.placeholder = "Demo mode — no code needed, just start!";
}


// Guard against double-initialization (e.g., HMR or script re-execution)
if (!document.querySelector(".scare-card[data-initialized]")) {
  document.querySelectorAll(".scare-card").forEach((b, idx, cards) => {
    b.setAttribute("data-initialized", "true");
    b.addEventListener("click", () => {
    document.querySelectorAll(".scare-card").forEach(c => c.setAttribute("aria-checked", "false"));
    b.setAttribute("aria-checked", "true");
    state.scare = b.dataset.pick;
    document.body.dataset.scare = state.scare;
    save(); openMap();
  // A QR that carried ?stop=N jumps straight to that puzzle after scare choice.
  if (Number.isInteger(deepStop) && deepStop >= 1) {
    const target = pack.stops.find(s => s.id === deepStop);
    if (target && !state.solved.includes(target.id)) window.openStop(deepStop);
  }
  // Show transition narrative
  showTransition();
  });
    b.addEventListener("keydown", (e) => {
      let newIdx = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") newIdx = (idx + 1) % cards.length;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") newIdx = (idx - 1 + cards.length) % cards.length;
      else if (e.key === "Home") newIdx = 0;
      else if (e.key === "End") newIdx = cards.length - 1;
      if (newIdx !== null) { e.preventDefault(); cards[newIdx].focus(); }
    });
  });
}

let map = null;
let mapBroken = false;
function openMap() {
  show("screen-map");
  const mapHeading = document.querySelector("#screen-map h2");
  if (mapHeading) mapHeading.focus();
  if (!mapBroken && !map) {
    // Leaflet may be absent (CDN blocked by CSP, or offline). Degrade to a
    // text stop list instead of throwing ReferenceError and killing the screen.
    if (typeof L === "undefined") {
      mapBroken = true;
      const el = $("map");
      // Static literal only — no untrusted data interpolated here.
      if (el) el.textContent = T("map_unavailable", "Map unavailable — use the stop list below.");
    } else {
      try {
        map = L.map("map");
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          { attribution: "© OpenStreetMap contributors" }).addTo(map);
        markers = pack.stops.map(s => L.marker([s.lat, s.lng], { icon: stopIcon(s) }).addTo(map)
          .bindPopup(`${s.id}. ${esc(s.name)}`));
      } catch (e) {
        mapBroken = true;
        console.error("map init failed:", e);
      }
    }
  }
  const next = nextUnsolved();
  updateHUD();
  if (!next) { stopTracking(); return show("screen-finale"), finale(); }
  if (map && !mapBroken) map.setView([next.lat, next.lng], 17);
  // Tiles may not load if the map container was sized while hidden.
  if (map && !mapBroken) requestAnimationFrame(() => { try { map.invalidateSize(); } catch (e) {} });
  startTracking();
  lastCardSig = ""; lastListSig = ""; // force a fresh card for the new stop
  if (mapBroken) renderStopList(); else renderNextStop();
}

window.openStop = function (id) {
  currentStop = pack.stops.find(s => s.id === id);
  if (!currentStop) return;
  hintLevel = Math.min(3, Number.isInteger(state.stopHints[currentStop.id]) ? state.stopHints[currentStop.id] : 0); $("hint-text").textContent = ""; var _dh=$("drz-hint-img"); if(_dh) _dh.hidden = true; $("feedback").textContent = "";
  $("puzzle-title").textContent = `Stop ${currentStop.id}: ${currentStop.name}`;
  if (state.arrivedGps && state.arrivedGps[currentStop.id]) {
    const chip = document.createElement("span");
    chip.className = "verified-chip";
    chip.textContent = " \uD83D\uDCCD on-site";
    $("puzzle-title").appendChild(chip);
  }
  const sa = $("stop-art");
  if (sa) {
    const baseArt = safeArtName(currentStop.art);
    if (baseArt) {
      const selectedArt = artFor(currentStop);
      const candidates = [...new Set([
        selectedArt,
        "assets/img/" + baseArt.replace(/\.webp$/i, "-cozy.webp"),
        "assets/img/" + baseArt
      ])];
      let candidateIndex = 0;
      sa.onerror = function () {
        candidateIndex++;
        if (candidateIndex < candidates.length) {
          sa.src = candidates[candidateIndex];
        } else {
          sa.onerror = null;
          sa.removeAttribute("src");
          sa.style.display = "none";
        }
      };
      sa.src = candidates[0];
      sa.alt = "Relic from Stop " + currentStop.id + ": " + currentStop.name;
      sa.style.display = "";
    } else {
      sa.onerror = null;
      sa.removeAttribute("src");
      sa.style.display = "none";
    }
  }
  $("puzzle-story").textContent = variant(currentStop, "story");
  const ws = $("wisp-says");
  if (ws) {
    if (currentStop.wisp) { ws.textContent = "\u201C" + currentStop.wisp + "\u201D — Wisp"; ws.style.display = ""; }
    else { ws.textContent = ""; ws.style.display = "none"; }
  }
  $("puzzle-question").textContent = variant(currentStop, "puzzle").q;
  $("puzzle-answer").value = ""; $("unlock-code").value = "";
  // A QR that carried this stop's sign code pre-fills the unlock field -
  // never another stop's code. (m19)
  if (deepSignCode && deepSignCode.toUpperCase() === String(currentStop.code).toUpperCase())
    $("unlock-code").value = deepSignCode;
  show("screen-puzzle");
  $("puzzle-title").focus();
};

function solved() {
  if (!(state.stopHints[currentStop.id] > 0)) state.cleanSolves++;
  // Dedupe: re-scanning a sign must not inflate the leaderboard payload.
  // The portal scores base = solved.length * POINTS_PER_STOP.
  if (!state.solved.includes(currentStop.id)) {
    state.solved.push(currentStop.id);
  }
  if (state.stopTimes[currentStop.id]) state.stopTimes[currentStop.id].end = Date.now();
  save();
  $("feedback").textContent = "🏮 " + (currentStop.lit || T("lantern_lit", "Lantern lit!"));
  setTimeout(openMap, 900);
  syncProgress(); // fire-and-forget leaderboard sync when backend present
}

// Answer matching: forgiving about how players actually type. Case,
// punctuation and spacing are ignored (as before); a leading article
// ("a tree", "the owl") and a plural ending ("candles", "spiders") are
// also accepted, since every riddle in the pack invites them. Numbers
// pass through untouched apart from separators ("7.5", "4,015").
function normalizeAnswer(s) {
  const tokens = String(s).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (tokens.length > 1 && ["a", "an", "the", "mr", "mrs", "ms", "dr"].includes(tokens[0])) tokens.shift();
  if (tokens.length) {
    const last = tokens[tokens.length - 1];
    if (/^[a-z]+$/.test(last) && last.length > 3 && last.endsWith("s") && !last.endsWith("ss")) {
      tokens[tokens.length - 1] = last.slice(0, -1);
    }
  }
  return tokens.join("");
}

$("btn-answer").addEventListener("click", () => {
  const p = variant(currentStop, "puzzle");
  const got = normalizeAnswer($("puzzle-answer").value);
  if (got === normalizeAnswer(p.a)) solved();
  else { state.stopAttempts[currentStop.id] = (state.stopAttempts[currentStop.id] || 0) + 1; save(); $("feedback").textContent = T("not_quite", "Not quite — try a hint, Keeper!"); }
});

$("btn-unlock").addEventListener("click", () => {
  if ($("unlock-code").value.trim().toUpperCase() === String(currentStop.code).toUpperCase()) {
    // Sign code = verified arrival (same as GPS), NOT a solve: the puzzle
    // still has to be answered. (Was calling solved() directly, which also
    // counted the stop as a clean solve and inflated leaderboard badges.)
    state.arrivedVia[currentStop.id] = state.arrivedVia[currentStop.id] || "qr";
    state.arrivedGps = state.arrivedGps || {};
    state.arrivedGps[currentStop.id] = true; arrivalFired[currentStop.id] = true; save();
    $("feedback").textContent = "📍 " + T("youre_here_verified", "You're here — verified on-site! Now solve the puzzle above.");
  }
  else $("feedback").textContent = T("wrong_code", "That code isn't from this stop's sign.");
});

$("btn-gps").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const acc = pos.coords.accuracy || 999;
    if (acc > 50) {
      $("feedback").textContent = `${T("gps_poor", "GPS accuracy is poor (±")}${Math.round(acc)}${T("move_to_open_sky", "m) — move to open sky or use the sign code.")}`;
      return;
    }
    const plat = pos.coords.latitude, plng = pos.coords.longitude;
    const d = haversine(plat, plng, currentStop.lat, currentStop.lng);
    const radius = currentStop.radius || 30;
    updatePlayerMarker(plat, plng, acc);
    if (d <= radius) {
      state.arrivedGps = state.arrivedGps || {};
      state.arrivedGps[currentStop.id] = true; arrivalFired[currentStop.id] = true; save();
      $("feedback").textContent = "📍 " + T("youre_here_verified", "You're here — verified on-site! Now solve the puzzle above.");
    }
    else {
      const b = bearing(plat, plng, currentStop.lat, currentStop.lng);
      $("feedback").textContent = `${T("still_away", "Still")} ${Math.round(d)}${T("away", "m away to the")} ${compassDir(b)} ${T("keep_hunting", "— keep hunting!")}`;
    }
  }, () => $("feedback").textContent = T("gps_unavailable", "GPS unavailable — use the sign code instead."), { timeout: 10000, enableHighAccuracy: true });
});

$("btn-hint").addEventListener("click", () => {
  var _dh2=$("drz-hint-img"); if(_dh2) _dh2.hidden = false;
  if (state.hintsUsed >= HINT_BUDGET) {
    $("hint-text").textContent = T("hint_jar_empty", "The hint jar is empty! Ask your organizer — a Lab Assistant can grant a rescue hint.");
    $("btn-hint").setAttribute("aria-expanded", "false");
    return;
  }
  if (hintLevel < 3) {
    var hintSet = (currentStop.hints && currentStop.hints[state.scare]) || (currentStop.hints && currentStop.hints.cozy) || currentStop.hints || [];
    $("hint-text").textContent = hintSet[hintLevel] || ""; hintLevel++;
    state.hintsUsed++;
    state.stopHints[currentStop.id] = (state.stopHints[currentStop.id] || 0) + 1;
    save(); updateHUD();
    $("btn-hint").setAttribute("aria-expanded", "true");
  } else {
    $("hint-text").textContent = T("all_hints_used", "That's all 3 hints for this stop — trust your team!");
    $("btn-hint").setAttribute("aria-expanded", "false");
  }
});

/* ---------- audio: play sound effects ---------- */
let audioCtx = null;
function playSound(url) {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return; // no Web Audio on this device/browser
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  } catch (e) { return; }
  fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(audioBuf => {
      const src = audioCtx.createBufferSource();
      src.buffer = audioBuf;
      src.connect(audioCtx.destination);
      src.start();
    })
    .catch(() => {});
}

/* ---------- share: native share or clipboard fallback ---------- */
function shareTeam() {
  const mins = state.startedAt ? Math.round((Date.now() - state.startedAt) / 60000) : 0;
  const text = `${isDemo ? "(Demo) " : ""}I'm a Lantern Keeper in Wisp's Lost Lanterns! I lit ${state.solved.length} lanterns in ${mins} minutes with ${state.hintsUsed} hints. Join the hunt!`;
  // Strip bearer credentials: ?ac= is the team access code and ?code= is a
  // stop sign code. Keep ?kit= so friends can still join the same kit.
  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.delete("ac");
  shareUrl.searchParams.delete("code");
  const url = shareUrl.toString();
  if (navigator.share) {
    navigator.share({ title: "Wisp's Lost Lanterns", text, url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text + " " + url).then(() => {
      $("feedback").textContent = T("link_copied", "Link copied! Share it with your team.");
    }).catch(() => {
      $("feedback").textContent = "Copy this link to invite your team: " + url;
    });
  } else {
    $("feedback").textContent = "Copy this link to invite your team (codes removed): " + url;
  }
}

/* ---------- timer: elapsed time display ---------- */
let timerInterval = null;
function paintClock() {
  const el = $("hunt-clock");
  if (!el || !state.startedAt) return;
  const secs = Math.floor((Date.now() - state.startedAt) / 1000);
  const m = Math.floor(secs / 60), s = secs % 60;
  el.textContent = `⏱ ${m}:${String(s).padStart(2, "0")}`;
}
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const el = $("hunt-clock");
    if (!el || !state.startedAt) return;
    const secs = Math.floor((Date.now() - state.startedAt) / 1000);
    const m = Math.floor(secs / 60), s = secs % 60;
    el.textContent = `⏱ ${m}:${String(s).padStart(2, "0")}`;
  }, 1000);
}
function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

/* ---------- PWA install prompt ---------- */
let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = $("btn-install");
  if (btn) btn.style.display = "inline-block";
});
function installPWA() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(() => { deferredInstallPrompt = null; });
  }
}

/* ---------- focus management ---------- */
function focusFirst() {
  const first = document.querySelector("input, button");
  if (first) first.focus();
}

/* ---------- story transitions ---------- */
function showTransition() {
  const box = $("next-stop");
  if (!box) return;
  const transition = document.createElement("div");
  transition.className = "story-transition";
  const mode = GlobalStory.getCurrentMode();
  const lang = (typeof I18n !== "undefined") ? I18n.current : "en";
  const storyContent = pack.story_content || {};
  const content = storyContent[lang] || storyContent["en"] || {};
  const transitions = content.transitions || GlobalStory.transitions[mode] || GlobalStory.transitions.halloween;
  const idx = Math.min(state.solved.length, transitions.length - 1);
  transition.textContent = transitions[idx];
  box.appendChild(transition);
  setTimeout(() => transition.remove(), 4000);
}

/* ---------- story mode selector ---------- */
function renderStoryModeSelector() {
  const container = $("story-mode-selector");
  if (!container) return;
  const modes = GlobalStory.modes;
  const current = GlobalStory.getCurrentMode();
  container.innerHTML = "";
  Object.values(modes).forEach(mode => {
    const btn = document.createElement("button");
    btn.className = "mode-btn" + (mode.id === current ? " active" : "");
    btn.innerHTML = `${mode.icon} ${mode.name}`;
    btn.setAttribute("aria-pressed", mode.id === current ? "true" : "false");
    btn.addEventListener("click", () => {
      GlobalStory.currentMode = mode.id;
      GlobalStory.applyCulturalAdaptation();
      renderStoryModeSelector();
      GlobalStory.renderStoryElements();
    });
    container.appendChild(btn);
  });
}

/* ---------- leaderboard scoring ----------
   Lower is better. Weights: completion >> clean solves >> hints >> time >> wrong guesses.
   Matches backend sort intent (finished, hints) with richer local signals. */
function teamScore(r) {
  if (!r.finished && (r.solvedCount ?? 0) < 6) return 1e9 + (r.hintsUsed * 100);
  return (r.hintsUsed * 1000) - ((r.cleanSolves || 0) * 150) + (r.mins || 0) + ((r.totalAttempts || 0) * 10) - ((r.verified || 0) * 5);
}
function teamTitle(r, stops) {
  const titles = [];
  if (r.hintsUsed === 0) titles.push("🌟 " + T("purist", "Purist"));
  if ((r.cleanSolves || 0) === stops) titles.push("🎯 " + T("flawless", "Flawless"));
  if ((r.verified || 0) === stops) titles.push("📍 " + T("true_explorer", "True Explorer"));
  return titles.join(" ");
}

function finale() {
  stopTracking();
  const mins = state.startedAt ? Math.round((Date.now() - state.startedAt) / 60000) : 0;
  const verified = pack.stops.filter(s => state.arrivedGps && state.arrivedGps[s.id]).length;
  const totalAttempts = Object.values(state.stopAttempts || {}).reduce((a, b) => a + b, 0);

  // Save this run to local history for team comparisons
  const run = {
    team: state.team, mins, hintsUsed: state.hintsUsed,
    cleanSolves: state.cleanSolves || 0, verified, totalAttempts,
    scare: state.scare, date: new Date().toISOString().slice(0, 10),
    demo: !!isDemo,
    ts: Date.now()
  };
  let history = [];
  try { history = JSON.parse(localStorage.getItem("lantern-history") || "[]"); } catch {}
  // Don't duplicate: skip if same team finished within last 5 min
  const dup = history.find(h => h.team === run.team && (run.ts - h.ts) < 300000);
  if (!dup) { history.push(run); localStorage.setItem("lantern-history", JSON.stringify(history.slice(-50))); }

  // Rank this run among all runs (fewer hints = better, then more clean solves, then faster)
  // (scoring via teamScore)
  // Demo runs are recorded (flagged) but never ranked against real hunts:
  // a practice run must not set the device's records or leaderboard.
  const realHistory = history.filter(h => !h.demo);
  const ranked = [...realHistory].sort((a, b) => teamScore(a) - teamScore(b));
  const rank = ranked.findIndex(r => r.ts === run.ts) + 1;

  // Best records
  const bestTime = Math.min(...realHistory.map(r => r.mins));
  const bestClean = Math.max(...realHistory.map(r => r.cleanSolves));
  const fewestHints = Math.min(...realHistory.map(r => r.hintsUsed));

  let compare = "";
  if (isDemo) {
    compare = "\n🎮 " + T("demo_compare", "Demo run — rankings and records belong to real hunts.");
  } else if (realHistory.length > 1) {
    const ord = rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : rank + "th";
    compare = `\n🏆 ${ord} of ${realHistory.length} ${T("of_teams", "teams on this device")}`;
    const records = [];
    if (run.mins === bestTime && realHistory.length > 1) records.push(T("fastest_time", "fastest time"));
    if (run.cleanSolves === bestClean && run.cleanSolves > 0) records.push(T("most_clean", "most clean solves"));
    if (run.hintsUsed === fewestHints) records.push(T("fewest_hints", "fewest hints"));
    if (records.length) compare += ` · ${T("new_record", "New record:")} ${records.join(", ")}!`;
  } else {
    compare = "\n🎉 " + T("first_team", "First team on this device — you set the bar!");
  }

  $("finale-stats").textContent =
    `${state.team} · ${pack.stops.length} lanterns · ${mins} ${T("minutes", "minutes")} · ${state.hintsUsed} ${T("hints_used", "hints used")} · ★ ${state.cleanSolves}/${pack.stops.length} ${T("clean_solves", "clean solves")} · 📍 ${verified}/${pack.stops.length} ${T("verified_on_site", "verified on-site")} · 🎯 ${totalAttempts} ${T("wrong_guesses", "wrong guesses")}${compare}`;

  // Show the finished relic collection on the finale (the live tray sits on
  // the map screen, so without this the finale never displays the relics).
  const frelics = $("finale-relics");
  if (frelics) {
    frelics.innerHTML = pack.stops.map(s => {
      const got = state.solved.includes(s.id);
      const cls = got ? "relic" : "relic locked";
      const inner = (got && artFor(s))
        ? `<img class="${cls}" src="${artFor(s)}" alt="${"Relic: " + esc(s.name)}" onerror="this.onerror=null;this.remove()">`
        : `<div class="${cls}" role="img" aria-label="${got ? "lit lantern relic" : "unfound relic"}">${got ? "🏮" : "❔"}</div>`;
      return `<span title="${got ? esc(s.name) : "???"}">${inner}</span>`;
    }).join("");
  }

  // Render leaderboard table (top 10)
  const lb = $("leaderboard"), lbl = $("leaderboard-list");
  if (lb && lbl && !isDemo && realHistory.length > 0) {
    lb.style.display = "block";
    const medals = ["🥇", "🥈", "🥉"];
    lbl.innerHTML = ranked.slice(0, 10).map((r, i) => {
      const medal = medals[i] || `${i + 1}.`;
      const title = teamTitle(r, pack.stops.length);
      const hl = r.ts === run.ts ? ' style="font-weight:700;background:#fff3cd;border-radius:8px;padding:2px 6px"' : "";
      return `<div${hl}>${medal} ${esc(r.team)} — ${r.mins}m · ${r.hintsUsed} hints · ★${r.cleanSolves}/${pack.stops.length} ${title}</div>`;
    }).join("");
  }
  // Demo finishers get the demo note + kit CTA, not the finale-table
  // claim line: badges & treats are earned on the real trail.
  const claimEl = $("finale-claim"), demoNoteEl = $("finale-demo-note"), demoCtaEl = $("finale-demo-cta");
  if (claimEl) claimEl.style.display = isDemo ? "none" : "";
  if (demoNoteEl) demoNoteEl.style.display = isDemo ? "" : "none";
  if (demoCtaEl) demoCtaEl.style.display = isDemo ? "" : "none";
  syncProgress(true);
  stopTimer();
  fetchGlobalLeaderboard();
  showAchievements();
  // Show share and install buttons
  const shareBtn = $("btn-share-finale");
  if (shareBtn) shareBtn.style.display = "inline-block";
  if (deferredInstallPrompt) {
    const installBtn = $("btn-install");
    if (installBtn) installBtn.style.display = "inline-block";
  }
  focusFirst();
  const finaleHeading = document.querySelector("#screen-finale h2");
  if (finaleHeading) finaleHeading.focus();
}
window.addEventListener("pagehide", stopTracking);
$("btn-restart").addEventListener("click", () => {
  // Preserve mode: forcing ?demo=1 on restart would strand a live team in the
  // offline pack and drop their kit binding.
  const keep = new URLSearchParams(location.search);
  keep.delete("stop");   // clear the QR deep-link so the new run starts clean
  keep.delete("code");   // and the sign code, so it is not pre-filled next run (m3)
  const q = keep.toString();
  localStorage.removeItem("lantern-state");
  location.href = location.pathname + (q ? "?" + q : "");
});

// Share button
$("btn-share-finale").addEventListener("click", shareTeam);

// Install PWA button
$("btn-install").addEventListener("click", installPWA);

// Past stops history
$("btn-history").addEventListener("click", () => {
  let history = [];
  try { history = JSON.parse(localStorage.getItem("lantern-history") || "[]"); } catch {}
  const lb = $("leaderboard"), lbl = $("leaderboard-list");
  if (lb && lbl) {
    lb.style.display = "block";
    if (history.length === 0) {
      lbl.innerHTML = "<div><strong>📜 Past runs</strong></div><div>No past stops yet — finish a hunt to see history!</div>";
    } else {
      lbl.innerHTML = "<div><strong>📜 Past runs</strong></div>" + history.slice(-10).reverse().map((r, i) => {
        const title = teamTitle(r, pack.stops.length);
        return `<div>${i + 1}. ${esc(r.team)} — ${r.mins}m · ${r.hintsUsed} hints · ★${r.cleanSolves}/${pack.stops.length} ${title}</div>`;
      }).join("");
    }
    lb.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

// Keyboard navigation: Enter to submit, Escape to go back
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.tagName === "INPUT") {
    const btn = e.target.parentElement.querySelector("button");
    if (btn) btn.click();
  }
  if (e.key === "Escape") {
    const active = document.querySelector(".screen.active");
    if (active && active.id === "screen-puzzle") openMap();
  }
});

// Pause/resume game. The marker lives in state (persisted by save())
// so a reload mid-pause keeps the pause instead of silently unpausing.

$("btn-pause").addEventListener("click", () => {
  if (state.pausedAt) {
    // Resume: adjust startedAt forward by the pause duration
    state.startedAt += Date.now() - state.pausedAt;
    state.pausedAt = null;
    $("btn-pause").textContent = T("pause_button", "⏸ Pause");
    startTimer();
  } else {
    // Pause
    state.pausedAt = Date.now();
    state.hiddenAt = null;  // a button pause supersedes any hidden-tab marker
    $("btn-pause").textContent = T("resume_button", "▶ Resume");
    stopTimer();
  }
  save();
});

// Touch feedback: haptic on mobile
document.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON" && navigator.vibrate) {
    navigator.vibrate(10);
  }
}, { passive: true });

// Pause timer when tab is hidden. Background time must not count toward
// elapsed (the score and the fastest-time record derive from it), so a
// hidden span is accounted exactly like a button pause: startedAt shifts
// on return. A deliberate button pause wins: never restart over it.
// Reloads and tab closes do not reliably fire visibilitychange before
// unload, which would silently add the away span to elapsed (or lose the
// pause). pagehide is the dependable unload signal: stamp the marker.
window.addEventListener("pagehide", () => {
  if (state.startedAt && !state.pausedAt && !state.hiddenAt) {
    state.hiddenAt = Date.now();
    save();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopTimer();
    if (state.startedAt && !state.pausedAt && !state.hiddenAt) {
      state.hiddenAt = Date.now();
      save();
    }
  } else {
    if (state.hiddenAt) {
      state.startedAt += Date.now() - state.hiddenAt;
      state.hiddenAt = null;
      save();
    }
    if (!state.pausedAt && state.startedAt && state.solved.length < pack.stops.length) {
      startTimer();
    }
  }
});

// Offline detection
window.addEventListener("offline", () => {
  const el = $("offline-banner");
  if (el) el.style.display = "block";
});
window.addEventListener("online", () => {
  const el = $("offline-banner");
  if (el) el.style.display = "none";
});

// Image lazy loading
document.querySelectorAll("img").forEach(img => {
  if (!img.src && img.dataset.src) {
    img.src = img.dataset.src;
  }
});

/* ---------- helpers / backend stubs ---------- */
function haversine(a, b, c, d) {
  const R = 6371000, t = x => x * Math.PI / 180;
  const h = Math.sin(t(c - a) / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(t(d - b) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function bearing(a, b, c, d) {
  const t = x => x * Math.PI / 180;
  const y = Math.sin(t(d - b)) * Math.cos(t(c));
  const x = Math.cos(t(a)) * Math.sin(t(c)) - Math.sin(t(a)) * Math.cos(t(c)) * Math.cos(t(d - b));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
function compassDir(deg) {
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8];
}
async function validateCode(code) {
  try {
    const r = await fetch(`${API_BASE}/api/lantern/validate`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }) });
    if (!r.ok) return null;
    const data = await r.json();
    return data.valid === true ? data : null;
  } catch { return null; }
}

async function fetchKitBundle(kitId, accessCode) {
  try {
    const r = await fetch(`${API_BASE}/api/lantern/kit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kitId, code: accessCode })
    });
    if (!r.ok) return null;
    const bundle = await r.json();
    // Fetch the content pack file if present
    if (bundle.content_pack_url) {
      const cp = bundle.content_pack_url;
      const cpUrl = /^https?:\/\//i.test(cp) ? cp : `${API_BASE}${cp}`;
      const cpResp = await fetch(cpUrl);
      // A live kit with an unloadable pack is an error, not a silent fallback
      // to demo content (which would pollute the live leaderboard). (P5)
      if (!cpResp.ok) return null;
      const pack = await cpResp.json();
      return { ...bundle, pack };
    }
    return { ...bundle, pack: null };
  } catch { return null; }
}
async function fetchGlobalLeaderboard() {
  if (isDemo) return;
  try {
    const r = await fetch(`${API_BASE}/api/lantern/leaderboard`);
    if (!r.ok) return;
    const data = await r.json();
    const lb = $("global-leaderboard"), lbl = $("global-leaderboard-list");
    if (lb && lbl && data.teams) {
      lb.style.display = "block";
      lbl.innerHTML = data.teams.slice(0, 10).map((t, i) => {
        const medal = ["🥇", "🥈", "🥉"][i] || `${i + 1}.`;
        return `<div>${medal} ${esc(t.team)} — ${t.mins}m · ${t.hintsUsed} hints</div>`;
      }).join("");
    }
  } catch { /* offline is fine */ }
}

function showAchievements() {
  const achievements = [];
  if (state.cleanSolves === pack.stops.length) achievements.push("🎯 Flawless — no hints used!");
  if (state.hintsUsed === 0) achievements.push("🌟 Purist — zero hints!");
  if (state.solved.length === pack.stops.length) achievements.push("🏮 Lantern Master — all 6 lit!");
  const toast = $("achievements-toast");
  if (toast && achievements.length > 0) {
    toast.textContent = achievements.join(" ");
    setTimeout(() => { toast.textContent = ""; }, 5000);
  }
}

async function syncProgress(done = false) {
  if (isDemo) return;
  try {
    await fetch(`${API_BASE}/api/lantern/progress`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team: state.team, kit: state.kitId, solved: state.solved,
        hintsUsed: state.hintsUsed, scare: state.scare, finished: done,
        cleanSolves: state.cleanSolves, stopAttempts: state.stopAttempts,
        stopTimes: state.stopTimes, arrivedVia: state.arrivedVia }) });
  } catch { /* offline is fine — progress also lives in localStorage */ }
}
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
document.body.dataset.scare = state.scare;
applyDemoBadge();

// Re-apply any available pack translations when the selected language changes.
document.addEventListener("languageChanged", () => {
  pack = (typeof I18n !== "undefined") ? I18n.translateGameContent(sourcePack) : sourcePack;
  lastCardSig = ""; lastListSig = ""; // translated strings must re-render
  if (typeof updateHUD === "function") updateHUD();
  if (currentStop) {
    const activePuzzle = $("screen-puzzle")?.classList.contains("active");
    if (activePuzzle) window.openStop(currentStop.id);
    else renderNextStop();
  }
});

// Initialize global story mode selector
if (typeof renderStoryModeSelector === "function") renderStoryModeSelector();
