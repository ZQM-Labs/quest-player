# PWA shell footprint: source-measured baseline

**This is a reproducible local source inventory, not an observed mobile
conversion lift or a successful offline field-play test.**

The November 2026 ZQM strategy brief cites well-known historical PWA
case studies, including Pinterest, Starbucks, Alibaba, Flipkart Lite and
Trivago. Their reported uplift percentages concern **other businesses,
cohorts, eras and attribution methods**. None measures ZQM Labs, and
this repository must not repeat those numbers as evidence that the
Wisp player doubles orders, increases conversion, or has an advantage
over installed native games.

## Reproduce the shell inventory

From the `quest-player` repository root with Node 18 or newer:

```bash
node tools/audit-pwa-shell.cjs
npm test
```

The tool parses the local `sw.js` `SHELL` array, validates each
local path and the PWA manifest, deduplicates the physical
`./` / `./index.html` alias, and reports source bytes grouped into
HTML, script, CSS, data, image and audio. A static encoded-size estimate
uses local gzip for text and raw sizes for already compressed media.
It makes **no network requests** and collects **no location, user,
marketing or payment data**.

The output records the source cache label and includes
`offline_success_verified: false` and
`actual_browser_transfer_tested: false`. An enumerated asset is
not necessarily in the cache: the existing service worker caches
files individually with best-effort semantics. Local source bytes
are not HTTP payload bytes, browser storage usage, cold-start
times, Lighthouse scores, energy usage, or mobile network performance.

## Release-acceptance matrix

| Goal | Appropriate measurement | What this tool proves |
| --- | --- | --- |
| Small app shell | Exact local file bytes and manifest assets | Source inventory only |
| Fast first play | Browser Navigation/Resource Timing or a reproducible Lighthouse run under declared device/network conditions | Not tested |
| Offline resilience | Playwright clean-cache install, failed request simulation, no-network repeat play, all signed routes | Not tested |
| Frictionless join | Real mobile QR/link open, permissions, alternate join and accessibility paths | Not tested |
| Re-engagement | Consented repeat-use counts over a specified period | Not collected |
| Host conversion | Reviewed event outcomes with verified denominators, proposals and paid fulfillment | Not collected |

Before publishing a performance claim, record the exact player
commit, **separate production pin**, test device/browser, cold/warm
cache status, network profile, asset transfer measurement, and
confidence/repeatability. Do not compare to a native app unless
that app's relevant installed/download size and comparable device
flow have actually been measured.

The [Organizer Toolkit](https://github.com/ZQM-Labs/organizer-toolkit) offline outcomes calculator (currently under review as organizer-toolkit PR #36)
can summarize manually entered aggregate counts without installing
tracking in the PWA; it does not verify any sale or finished event.

## Constraints

The canonical Wisp PWA is deployed through a **pinned source SHA**
in `ZQM-Computing/zqm-labs`. This audit adds no service-worker
precache paths, cache version bumps, install prompts, SDKs, maps,
tracking, payments, build steps, route changes or new browser permissions.
It does not independently publish or deploy the game.

A contextual install prompt is a possible future *UX experiment*
only after a successful first-play task. It would require device
acceptance, accessible dismissal, no coercive prompts, and proof
that browser play is fully usable without installing.
