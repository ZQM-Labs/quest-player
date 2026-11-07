"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { readShell, report } = require("../tools/audit-pwa-shell.cjs");

test("canonical service worker shell has a reproducible source inventory", () => {
  const data = report();
  assert.equal(data.schema_version, 1);
  assert.match(data.cache_name, /^lantern-v\d+$/);
  assert.ok(data.pwa_app_shell_routes > 10);
  assert.ok(data.distinct_source_files > 10);
  assert.ok(data.distinct_source_files <= data.pwa_app_shell_routes);
  assert.ok(data.source_bytes > 0);
  assert.ok(data.static_encoded_estimate_bytes > 0);
  assert.equal(data.measurement, "source_files_not_network_or_cache-install");
  assert.equal(data.actual_browser_transfer_tested, false);
  assert.equal(data.offline_success_verified, false);
  assert.equal(Object.values(data.by_kind).reduce((sum, g) => sum + g.files, 0),
    data.distinct_source_files);
  assert.equal(Object.values(data.by_kind).reduce((sum, g) => sum + g.bytes, 0),
    data.source_bytes);
});

test("shell parser rejects duplicates and absent shell declarations", () => {
  assert.deepEqual(readShell('const SHELL = ["./", "./index.html"];'),
    ["./", "./index.html"]);
  assert.throws(() => readShell('const SHELL = ["./a", "./a"];'), /Repeated/);
  assert.throws(() => readShell("const OTHER = [];"), /shell array/);
});

test("rejects local traversal in a synthetic shell fixture", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zqm-shell-test-"));
  try {
    fs.writeFileSync(path.join(dir, "sw.js"),
      'const CACHE = "lantern-v1"; const SHELL = ["./../private.txt"];');
    fs.writeFileSync(path.join(dir, "manifest.webmanifest"),
      '{"start_url":"./","display":"standalone"}');
    assert.throws(() => report(dir), /Invalid or nonlocal shell path/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("rejects shell expressions and unsupported string forms instead of silently omitting them", () => {
  for (const shell of [
    'const SHELL = ["./index.html", dynamicAsset];',
    "const SHELL = ['./index.html'];",
    'const SHELL = ["./index.html", 12];',
    'const SHELL = ["./index.html", "https://example.com/app.js"];',
  ]) {
    assert.throws(() => readShell(shell), /Invalid or unsupported|Invalid or nonlocal/);
  }
  assert.deepEqual(readShell('const SHELL = ["./", "./index.html",];'),
    ["./", "./index.html"]);
});

test("rejects symlinked app-shell asset and parent directories", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zqm-shell-link-"));
  try {
    fs.writeFileSync(path.join(dir, "sw.js"),
      'const CACHE = "lantern-v1"; const SHELL = ["./asset.js"];');
    fs.writeFileSync(path.join(dir, "manifest.webmanifest"),
      '{"start_url":"./","display":"standalone"}');
    fs.writeFileSync(path.join(dir, "real.js"), "console.log(1);");
    try {
      fs.symlinkSync("real.js", path.join(dir, "asset.js"));
    } catch (error) {
      if (["EPERM", "ENOTSUP", "EACCES"].includes(error.code)) {
        t.skip("symlink creation unavailable");
        return;
      }
      throw error;
    }
    assert.throws(() => report(dir), /Symlinked shell path/);
    fs.unlinkSync(path.join(dir, "asset.js"));
    fs.mkdirSync(path.join(dir, "real"));
    fs.writeFileSync(path.join(dir, "real", "asset.js"), "console.log(2);");
    fs.symlinkSync("real", path.join(dir, "alias"), "dir");
    fs.writeFileSync(path.join(dir, "sw.js"),
      'const CACHE = "lantern-v1"; const SHELL = ["./alias/asset.js"];');
    assert.throws(() => report(dir), /Symlinked shell path/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("no synthetic data is presented as a user, sales or browser measurement", () => {
  const text = JSON.stringify(report());
  assert.match(text, /not_network_or_cache-install/);
  assert.match(text, /offline_success_verified":false/);
  assert.match(text, /actual_browser_transfer_tested":false/);
  assert.doesNotMatch(text, /participant_id|access_code|gps_lat|stripe_payment_id/i);
});
