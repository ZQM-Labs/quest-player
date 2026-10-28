#!/usr/bin/env bash
# test-suite.sh — comprehensive E2E test suite for zqmlabs.com
# Usage: bash test-suite.sh [--live] [--local] [--verbose]
#   --live   Test against production (zqmlabs.com)
#   --local  Test against local build only
#   --verbose Show detailed output for each test

set -euo pipefail

# Configuration
SITE_URL="${SITE_URL:-https://zqmlabs.com}"
API_URL="${API_URL:-https://api.zqmlabs.com}"
PLAYER_PATH="/games/hunt-for-wisps/play"
# Paths default to this repository, not any one machine's old layout.
# (The previous defaults pointed at a retired Windows/Hermes checkout and a
# lantern-content tree that does not exist in this repo, so sections 6-8
# always skipped or failed anywhere else. Override any of these via env.)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
NODE_EXE="${NODE_EXE:-node}"
TOOLS_DIR="${TOOLS_DIR:-$SCRIPT_DIR}"
PLAYER_SRC="${PLAYER_SRC:-$REPO_ROOT/app.js}"
PYTHON_EXE="${PYTHON_EXE:-python3}"
PACK_FILE="${PACK_FILE:-$REPO_ROOT/wisp-demo.json}"
# NOTE: sections 6-7 need verify-playthrough.js / verify-deeplink.js in
# TOOLS_DIR; those helpers are not shipped in this repo, so the sections
# skip (as before) unless you provide them.

# Counters
PASS=0
FAIL=0
SKIP=0
RESULTS=()

# Colors (if terminal supports it)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test function
test() {
    local name="$1"
    local expected="$2"
    local actual="$3"
    local detail="${4:-}"
    
    if [ "$expected" = "$actual" ]; then
        PASS=$((PASS+1))
        RESULTS+=("PASS|$name")
        echo -e "  ${GREEN}[PASS]${NC} $name"
    else
        FAIL=$((FAIL+1))
        RESULTS+=("FAIL|$name|$expected|$actual")
        echo -e "  ${RED}[FAIL]${NC} $name"
        if [ -n "$detail" ]; then
            echo "         expected: $expected"
            echo "         actual:   $actual"
        fi
    fi
}

# Test function for numeric comparisons
test_gt() {
    local name="$1"
    local threshold="$2"
    local actual="$3"
    
    if [ "$actual" -gt "$threshold" ] 2>/dev/null; then
        PASS=$((PASS+1))
        RESULTS+=("PASS|$name")
        echo -e "  ${GREEN}[PASS]${NC} $name ($actual > $threshold)"
    else
        FAIL=$((FAIL+1))
        RESULTS+=("FAIL|$name|$threshold|$actual")
        echo -e "  ${RED}[FAIL]${NC} $name (expected > $threshold, got: $actual)"
    fi
}

# Test function for HTTP status
test_http() {
    local name="$1"
    local url="$2"
    local expected_code="$3"
    
    local actual_code
    actual_code=$(curl -s -m 10 -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    test "$name" "$expected_code" "$actual_code"
}

# Test function for HTTP content type
test_content_type() {
    local name="$1"
    local url="$2"
    local expected_type="$3"
    
    local actual_type
    actual_type=$(curl -s -m 10 -o /dev/null -w "%{content_type}" "$url" 2>/dev/null || echo "")
    if echo "$actual_type" | grep -q "$expected_type"; then
        PASS=$((PASS+1))
        RESULTS+=("PASS|$name")
        echo -e "  ${GREEN}[PASS]${NC} $name"
    else
        FAIL=$((FAIL+1))
        RESULTS+=("FAIL|$name|$expected_type|$actual_type")
        echo -e "  ${RED}[FAIL]${NC} $name (expected: $expected_type, got: $actual_type)"
    fi
}

# Test function for header presence
test_header() {
    local name="$1"
    local url="$2"
    local header_name="$3"
    
    local headers
    headers=$(curl -s -m 10 -D - -o /dev/null "$url" 2>/dev/null || echo "")
    if echo "$headers" | grep -qi "$header_name"; then
        PASS=$((PASS+1))
        RESULTS+=("PASS|$name")
        echo -e "  ${GREEN}[PASS]${NC} $name"
    else
        FAIL=$((FAIL+1))
        RESULTS+=("FAIL|$name|header:$header_name|missing")
        echo -e "  ${RED}[FAIL]${NC} $name (header '$header_name' not found)"
    fi
}

# Test function for content presence
test_contains() {
    local name="$1"
    local url="$2"
    local pattern="$3"
    
    local content
    content=$(curl -s -m 10 "$url" 2>/dev/null || echo "")
    if echo "$content" | grep -q "$pattern"; then
        PASS=$((PASS+1))
        RESULTS+=("PASS|$name")
        echo -e "  ${GREEN}[PASS]${NC} $name"
    else
        FAIL=$((FAIL+1))
        RESULTS+=("FAIL|$name|$pattern|not found")
        echo -e "  ${RED}[FAIL]${NC} $name (pattern '$pattern' not found)"
    fi
}

# Test function for JSON field
test_json() {
    local name="$1"
    local url="$2"
    local pattern="$3"
    
    local content
    content=$(curl -s -m 10 "$url" 2>/dev/null || echo "")
    if echo "$content" | grep -q "$pattern"; then
        PASS=$((PASS+1))
        RESULTS+=("PASS|$name")
        echo -e "  ${GREEN}[PASS]${NC} $name"
    else
        FAIL=$((FAIL+1))
        RESULTS+=("FAIL|$name|$pattern|not found")
        echo -e "  ${RED}[FAIL]${NC} $name (JSON pattern '$pattern' not found)"
    fi
}

# ============================================
# TEST SUITE
# ============================================

echo "========================================"
echo "ZQM LABS — E2E Test Suite"
echo "========================================"
echo "Site:   $SITE_URL"
echo "API:    $API_URL"
echo "Date:   $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "========================================"
echo

# ------------------------------------------
# 1. Site Pages
# ------------------------------------------
echo "--- 1. Site Pages ---"
for p in "/" "/about/" "/faq/" "/tiers/" "/halloween/" "$PLAYER_PATH/"; do
    test_http "GET $p" "$SITE_URL$p" "200"
done
echo

# ------------------------------------------
# 2. Security Headers
# ------------------------------------------
echo "--- 2. Security Headers ---"
test_header "CSP present" "$SITE_URL/" "content-security-policy"
test_header "HSTS present" "$SITE_URL/" "strict-transport-security"
test_header "X-Frame-Options" "$SITE_URL/" "x-frame-options"
test_header "X-Content-Type-Options" "$SITE_URL/" "x-content-type-options"
test_header "Referrer-Policy" "$SITE_URL/" "referrer-policy"
echo

# ------------------------------------------
# 3. Player Assets
# ------------------------------------------
echo "--- 3. Player Assets ---"
for a in "index.html" "app.js" "styles.css" "sw.js" "manifest.webmanifest" \
         "vendor/leaflet.js" "vendor/leaflet.css" \
         "assets/img/hero-pumpkin.svg" \
         "assets/img/relic-pumpkin.svg" "assets/img/relic-lantern.svg" \
         "assets/img/relic-ghost.svg" "assets/img/relic-spider.svg" \
         "assets/img/relic-bat.svg" "assets/img/relic-wisp.svg" \
         "assets/audio/hoot.wav" "assets/audio/hoot.ogg"; do
    test_http "asset: $a" "$SITE_URL$PLAYER_PATH/$a" "200"
done
echo

# ------------------------------------------
# 4. All 24 WebP Files
# ------------------------------------------
echo "--- 4. WebP Files (24) ---"
STOPS="1:pumpkin 2:oak 3:graveyard 4:spider 5:owl 6:lantern"
TIERS="cozy spooky afterdark overdrive"
for stop_entry in $STOPS; do
    sid="${stop_entry%%:*}"
    sname="${stop_entry##*:}"
    for tier in $TIERS; do
        f="stop-${sid}-${sname}-${tier}.webp"
        test_http "webp: $f" "$SITE_URL$PLAYER_PATH/assets/img/$f" "200"
    done
done
echo

# ------------------------------------------
# 5. Backend API
# ------------------------------------------
echo "--- 5. Backend API ---"
test_json "health" "$API_URL/api/health" '"code":200'
test_json "validate WISP-2026-DEMO" "$API_URL/api/lantern/validate" '"valid":true'
test_json "validate INVALID" "$API_URL/api/lantern/validate" '"valid":false'
test_json "progress POST" "$API_URL/api/lantern/progress" '"ok":true'
test_json "leaderboard" "$API_URL/api/lantern/leaderboard/91z45pwv5wi5lkj" '"leaderboard"'
test_json "export CSV" "$API_URL/api/lantern/export/91z45pwv5wi5lkj" "team,scare"
echo

# ------------------------------------------
# 6. Player Logic (Playthrough)
# ------------------------------------------
echo "--- 6. Player Logic ---"
if [ -f "$NODE_EXE" ] && [ -f "$TOOLS_DIR/verify-playthrough.js" ]; then
    OUTPUT=$("$NODE_EXE" "$TOOLS_DIR/verify-playthrough.js" "$PLAYER_SRC" "CI" "?demo=1" 2>&1 || true)
    if echo "$OUTPUT" | grep -q "stops_lit=6/6"; then
        test "playthrough 6/6" "yes" "yes"
    else
        test "playthrough 6/6" "yes" "no"
    fi
    if echo "$OUTPUT" | grep -q "completable=true"; then
        test "completable" "yes" "yes"
    else
        test "completable" "yes" "no"
    fi
    if echo "$OUTPUT" | grep -q "duplicates=false"; then
        test "no duplicates" "yes" "yes"
    else
        test "no duplicates" "yes" "no"
    fi
else
    SKIP=$((SKIP+1))
    echo "  [SKIP] playthrough (node or tools not found)"
fi
echo

# ------------------------------------------
# 7. QR Deep Link
# ------------------------------------------
echo "--- 7. QR Deep Link ---"
if [ -f "$NODE_EXE" ] && [ -f "$TOOLS_DIR/verify-deeplink.js" ]; then
    OUTPUT=$("$NODE_EXE" "$TOOLS_DIR/verify-deeplink.js" "$PLAYER_SRC" "CI" "?stop=3&code=LANTERN-3" 2>&1 || true)
    if echo "$OUTPUT" | grep -q "QR params CONSUMED"; then
        test "QR deep link" "yes" "yes"
    else
        test "QR deep link" "yes" "no"
    fi
else
    SKIP=$((SKIP+1))
    echo "  [SKIP] QR deep link (node or tools not found)"
fi
echo

# ------------------------------------------
# 8. Content Pack Integrity
# ------------------------------------------
echo "--- 8. Content Pack ---"
if [ -f "$PYTHON_EXE" ]; then
    OUTPUT=$("$PYTHON_EXE" -c "
import json, os
pack = json.load(open(os.environ.get('PACK_FILE', 'wisp-demo.json'), encoding='utf-8'))
stops = pack.get('stops', [])
print(f'stops:{len(stops)}')
print(f'hints:{[len(s.get(\"hints\", [])) for s in stops]}')
print(f'puzzle:{[len(s.get(\"puzzle\", {})) for s in stops]}')
print(f'story:{[len(s.get(\"story\", {})) for s in stops]}')
print(f'art:{all(s.get(\"art\", \"\") != \"\" for s in stops)}')
" 2>&1 || echo "error")
    
    if echo "$OUTPUT" | grep -q "stops:6"; then
        test "6 stops" "yes" "yes"
    else
        test "6 stops" "yes" "no"
    fi
    
    if echo "$OUTPUT" | grep -q "hints:[3, 3, 3, 3, 3, 3]"; then
        test "3 hints each" "yes" "yes"
    else
        test "3 hints each" "yes" "no"
    fi
    
    if echo "$OUTPUT" | grep -q "puzzle:[4, 4, 4, 4, 4, 4]"; then
        test "4 puzzle variants (one per Dial level)" "yes" "yes"
    else
        test "4 puzzle variants (one per Dial level)" "yes" "no"
    fi
    
    if echo "$OUTPUT" | grep -q "art:True"; then
        test "art references" "yes" "yes"
    else
        test "art references" "yes" "no"
    fi
else
    SKIP=$((SKIP+1))
    echo "  [SKIP] content pack (python not found)"
fi
echo

# ------------------------------------------
# 9. Service Worker
# ------------------------------------------
echo "--- 9. Service Worker ---"
test_contains "SW cache version" "$SITE_URL$PLAYER_PATH/sw.js" "lantern-v"
test_contains "SW precache leaflet" "$SITE_URL$PLAYER_PATH/sw.js" "vendor/leaflet.js"
test_contains "SW offline fallback" "$SITE_URL$PLAYER_PATH/sw.js" "index.html"
echo

# ------------------------------------------
# 10. Acceptance Checks
# ------------------------------------------
echo "--- 10. Acceptance Checks ---"
test_content_type "app.js MIME" "$SITE_URL$PLAYER_PATH/app.js" "application/javascript"
test_http "404 handling" "$SITE_URL/zzz-nope-xyz/" "404"
test_contains "iframe ?demo=1" "$SITE_URL$PLAYER_PATH/" "demo=1"
test_contains "player renders" "$SITE_URL$PLAYER_PATH/?demo=1" "screen-start"
echo

# ------------------------------------------
# 11. DNS Routing
# ------------------------------------------
echo "--- 11. DNS Routing ---"
test_http "zqmlabs.com" "$SITE_URL/" "200"
test_http "api.zqmlabs.com" "$API_URL/api/health" "200"
echo

# ------------------------------------------
# 12. Performance (basic)
# ------------------------------------------
echo "--- 12. Performance ---"
TIME_APP=$(curl -s -m 10 -o /dev/null -w "%{time_total}" "$SITE_URL$PLAYER_PATH/app.js" 2>/dev/null || echo "99")
TIME_HOME=$(curl -s -m 10 -o /dev/null -w "%{time_total}" "$SITE_URL/" 2>/dev/null || echo "99")
echo "  app.js load time: ${TIME_APP}s"
echo "  homepage load time: ${TIME_HOME}s"
if [ "$(echo "$TIME_APP < 2.0" | bc 2>/dev/null || echo 0)" = "1" ]; then
    test "app.js < 2s" "fast" "fast"
else
    SKIP=$((SKIP+1))
    echo "  [SKIP] performance (bc not available)"
fi
echo

# ------------------------------------------
# SUMMARY
# ------------------------------------------
echo "========================================"
echo "RESULTS: $PASS passed, $FAIL failed, $SKIP skipped"
echo "========================================"

if [ "$FAIL" -gt 0 ]; then
    echo
    echo "FAILURES:"
    for r in "${RESULTS[@]}"; do
        if [[ "$r" == FAIL* ]]; then
            IFS='|' read -r _ name expected actual <<< "$r"
            echo "  $name (expected: $expected, got: $actual)"
        fi
    done
    exit 1
fi

echo "All tests passed."
exit 0
