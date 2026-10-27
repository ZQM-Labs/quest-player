# Deployment — quest-player

**This repository is the single brain (source of truth) for the game player
served at `https://zqmlabs.com/games/hunt-for-wisps/play/`.**

## How a change reaches production

Nothing in this repo deploys anything by itself. Production is assembled by
the composite build in `ZQM-Computing/zqm-labs`
(`.github/workflows/pages-deploy.yml`), which syncs the player from this
repo at a pinned commit, `PLAYER_SOURCE_SHA`.

To ship a change:

1. Merge the change to `main` here.
2. Open a pin-bump PR in `ZQM-Computing/zqm-labs` updating
   `PLAYER_SOURCE_SHA` to this repo's new `main` HEAD (full 40-char SHA).
3. When that PR merges, the composite workflow builds and deploys, and its
   verification step confirms the live origin serves the new pin.

Full architecture: `docs/single-brain-architecture.md` in
`ZQM-Computing/zqm-labs`.

## Service-worker cache rule

`sw.js` carries a cache name of the form `lantern-vNN`. **Bump the version
number in any change that alters player assets or behavior.** Clients pin to
the cache name; if it does not change, returning players keep the old build.
The production drift check compares the live cache name against the cache
name at the pinned commit — a mismatch is treated as a deploy incident.

## Do not

- Do not deploy this player to the `zqmlabs-site` Cloudflare Pages project
  from a checkout, a local build, or any other repo. The pinned composite
  build is the only production path.
- Do not edit the vendored player copy inside `ZQM-Computing/zqm-labs`
  (`zqmlabs-site/static/games/…`) expecting production to change — it is
  inert legacy that the composite build overwrites with the pinned player.
- Do not confuse this repo with the former `ZQM-Labs/lantern-player` name (now quest-player): that repo powers
  the separate standalone surface `zqmlabs-play.pages.dev`. This repo is the
  source for the player embedded on zqmlabs.com.
