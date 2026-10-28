#!/bin/sh
# Refresh tests/fixtures/onsite-wisp-demo.json from the zqm-labs monorepo
# (the on-site edition of the demo pack). Run this whenever the on-site
# pack changes, then re-run the drift test: node --test tests/pack-drift.test.cjs
# The snapshot is vendored because CI cannot fetch across repos; a stale
# snapshot fails loudly on the first structural change, which is the point.
set -eu
cd "$(dirname "$0")/.."
curl -fsSL -o tests/fixtures/onsite-wisp-demo.json \
  https://raw.githubusercontent.com/ZQM-Computing/zqm-labs/main/lantern-content/content-packs/wisp-demo.json
echo "refreshed tests/fixtures/onsite-wisp-demo.json"
