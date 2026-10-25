# quest-player — ZQM Labs player web app

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="docs/assets/wisps-lost-lanterns-readme-banner.svg" alt="Wisp's Lost Lanterns — a six-checkpoint story hunt from ZQM Labs" width="100%" />
</p>
<!-- markdownlint-enable MD033 -->

<!-- ZQM-START -->
<!-- markdownlint-disable MD033 -->
<p align="center">
  <strong>ZQM Labs — Z's Quests & Mischief</strong><br>
  <a href="https://zqmlabs.com">zqmlabs.com</a> •
  <a href="https://github.com/ZQM-Labs">GitHub</a>
</p>
<!-- markdownlint-enable MD033 -->
<!-- ZQM-END -->

## The game: Wisp's Lost Lanterns

Wisp is a will-o'-the-wisp — a small, wandering light — and she has lost
her six glow lanterns. Without them she cannot find her way home, and the
shadows are growing longer. Your team are her Lantern Keepers. Walk the
route, find each stop, solve its puzzle, and relight the lanterns before
the light fades for good.

The lanterns are waiting in real places: under the Welcome Pumpkin, in the
branches of the Whispering Oak, past the Giggling Graveyard (pretend!),
across the Spider's Counting Web, beneath the Owl's Night Watch, and at
the Lantern Parade Ground, where every relit lantern joins the parade.
Each stop proves you are really there — scan the sign, type its code, or
pass the GPS check — and every puzzle carries a three-hint ladder, so no
team is ever stuck in the dark for long.

One hunt, four tellings. The story/scare dial — Cozy Glow, Spooky, After
Dark, Overdrive — retells the same route with different story, puzzles,
and art, from a gentle family walk to a proper Halloween dare. And when
the last lantern lights, Wisp gets her ending: *the light you carry is
the light you share.*

This repository is where that story becomes playable. The words are
authored as content packs in `lantern-content`; this player is the stage
they are performed on — offline-first, with locale files for seven
languages, on whatever phone a Lantern Keeper has in their pocket.

The **ZQM Labs quest-player Progressive Web App (PWA)** runs location-based scavenger hunts in a mobile browser using vanilla HTML, CSS, and JavaScript. It presents versioned quest packs, checkpoint puzzles, hint ladders, and story/scare-level variants, with offline-first behavior as a design goal. The runtime must be validated on supported devices and clean hosts; repository docs and static checks alone do not prove every offline or GPS/QR flow works in the field.

## Repository role and status

**Status:** Active, public. Canonical game player source for ZQM Labs location games; deployment-critical.

**What this repository is:** The player web app (PWA) for ZQM Labs location games: vanilla HTML/CSS/JS with no build step, Leaflet maps, GPS geofence and QR/code unlocks, a four-level story/scare Dial, 3-hint ladders per puzzle, offline play via a service worker, and progress persistence. It plays the six-stop Wisp's Lost Lanterns format and consumes JSON content packs written to the quest-authoring spec.

**What it contributes:** Every public game runs through this player. It is the runtime that quest-packs editions are validated against, and its progress sync feeds the quest-analytics backend leaderboards.

**Deployment:** This repo is the canonical player source. The production deploy (ZQM-Computing/zqm-labs, `.github/workflows/pages-deploy.yml`) pins this repository by commit in `PLAYER_SOURCE_SHA`, syncs the player from that pin, and overwrites the served player copy in the site bundle — changes here go live only when the pin is bumped in the monorepo.

**Name history:** Renamed from `lantern-player` to `quest-player` on 2026-10-19. Older documents and links may still use the old name; GitHub redirects the old repository URL.

## Installation

No build step and no dependencies: the player is vanilla JavaScript with a vendored copy of Leaflet. Clone the repo and serve the files statically:

```bash
git clone https://github.com/ZQM-Labs/quest-player.git
cd quest-player
```

## Run

```bash
python3 -m http.server 8080
# Demo (embedded Wisp content, no backend): http://localhost:8080/?demo=1
# Live (needs lantern-backend):             http://localhost:8080/?kit=<kitId>&code=<accessCode>
```

## Usage

Open the player (see [Run](#run)), load a quest pack, and play: pick a
stop, walk to it, and solve its puzzle. If you get stuck, Dr. Z offers
hints — the story portraits and the hint system are wired into every
pack that follows the format described under [Content packs](#content-packs).

## How a game flows

1. Team opens the kit link (or scans the start QR) → enters access code.
2. **Story/scare dial**: Cozy Glow 🎃 / Spooky 👻 / After Dark 🦇 / Overdrive 🔥 —
   selects story and puzzle variants and the visual theme. Organizer default comes from the kit.
3. Six checkpoints. Each unlocks by scanning the QR sign (the code is in the
   URL), typing the code, or passing a GPS geofence check — every checkpoint
   also has an observation-answer fallback (accessibility + dead-battery rule).
4. Each puzzle has exactly **3 hints**: nudge → bigger hint → answer ("Ranger
   assist"). Progress persists in localStorage; with a backend, progress also
   syncs for leaderboards (office tier).
5. Finale: completion screen, team photo prompt, badge, partner/finale code.

## Language support

The player currently ships locale files for English (`en`), Spanish (`es`), French (`fr`), German (`de`), Portuguese (`pt`), Italian (`it`), and Russian (`ru`). The language selector is experimental: matching translation keys do not guarantee complete or professionally reviewed translations, and some interface text and quest-pack content may remain in English or the pack's source language. Do not advertise full localization until content coverage and language quality have been reviewed and tested.

## Content packs

The player consumes a JSON content pack exported from `lantern-content`.
`DEMO_PACK` in `app.js` is the embedded example: every stop has `story` and
`puzzle` for all four levels (`cozy`, `spooky`, `afterdark`, `overdrive`); missing variants fall back to Cozy text. Never
hardcode new story text here — author it in `lantern-content`.

## Files

- `index.html` — shell, screens (start / scare / map / puzzle / finale)
- `app.js` — game state machine, unlock logic, hint tiers, demo pack
- `styles.css` — base layout + scare themes via `body[data-scare]`
- `sw.js` — service worker: cache-first app shell (offline play)
- `manifest.webmanifest` — installable PWA metadata

## Deployment

This repo is the single brain for the game player served at
`https://zqmlabs.com/games/hunt-for-wisps/play/`. Nothing here deploys by
itself: production is assembled by the composite build in
`ZQM-Computing/zqm-labs`, which syncs the player from this repo at the
pinned `PLAYER_SOURCE_SHA`. To ship, merge here, then pin-bump
`PLAYER_SOURCE_SHA` in the monorepo. Bump the `lantern-vNN` cache name in
`sw.js` whenever player assets or behavior change. Full rules:
[docs/deployment.md](docs/deployment.md).

## Related repos

- quest-analytics — team analytics + tracking backend (FastAPI + SQLite) for the quest-player PWA; its source repository is private and is not linked from public documentation
- [quest-authoring](https://github.com/ZQM-Labs/quest-authoring) — quest pack spec, validator, and generator
- [quest-packs](https://github.com/ZQM-Labs/quest-packs) — ready-to-play quest packs

<!-- ZQM-FOOTER-START -->
<!-- markdownlint-disable MD033 -->
---

<p align="center">
  <em>Play more. Plan less.</em><br>
  <a href="https://zqmlabs.com">zqmlabs.com</a> •
  <a href="https://github.com/ZQM-Labs">ZQM Labs</a> •
  <a href="https://github.com/ZQM-Computing">ZQM Computing</a>
</p>
<!-- markdownlint-enable MD033 -->
<!-- ZQM-FOOTER-END -->

## Release validation contract

A green unit-test or CI result is necessary but does not prove that a location-based release is ready for players. Before tagging a release, record the player commit, content-pack version, browser/device matrix, and results of the checks below. Use the [playtest protocol](https://github.com/ZQM-Labs/playtests) and keep physical observations separate from automated test results.

| Area | Minimum release check | Evidence |
|---|---|---|
| Startup | Fresh install opens the game without uncaught errors; malformed or missing pack input fails with a useful message rather than a crash | CI result and reproducible test case |
| Offline | Install/load once, disconnect the network, reload, resume progress, and confirm the documented offline scope | Device/browser, steps, outcome |
| Content | Validate the exact release pack with the authoring validator and player; test missing, malformed, and unsupported fields | Pack filename/version and test result |
| Languages | Confirm available locale choices and review actual story/UI coverage; do not infer translation completeness from matching key counts | Locale coverage report and reviewer |
| QR and GPS | Test printed QR codes at actual size and lighting; test GPS on the intended route and record drift/failure behavior | Route/device notes and photos only where safe |
| Accessibility and safety | Verify the non-GPS observation fallback, route permissions, safe sign placement, and an accessible alternative for each checkpoint | Completed organizer checklist |
| Assets | Confirm every referenced image/audio/font file exists in the standalone package, not only in the marketing-site bundle | Asset check output |
| Recovery | Verify refresh/reopen behavior, progress persistence, and the documented recovery path for a failed checkpoint | Playtest record |

Do not publish a physical-validation claim until the route, signs, and accessible alternatives have actually been checked in the field. Do not publish a language as fully supported solely because a locale file exists.

## Release status is evidence-based

A working local demo, a successful automated workflow, and a field-ready paid game are different states. This README does not establish that Wisp's Lost Lanterns is currently orderable or approved for an in-person event. Before calling it released, link a dated release record that identifies the exact player and content versions and includes browser/device, offline/update, asset, language, QR/GPS, accessibility/safety, and checkout/fulfillment evidence. If evidence is missing, record the status as **unknown** and keep public copy limited to the state that has actually been verified.

## License

MIT — see [LICENSE](LICENSE).
