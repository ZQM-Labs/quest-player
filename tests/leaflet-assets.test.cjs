"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const cssPath = path.join(root, "vendor/leaflet.css");
const css = fs.readFileSync(cssPath, "utf8");
const worker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

test("all local Leaflet CSS URL assets resolve to vendored files", () => {
  const urls = [...css.matchAll(/url\(\s*["']?([^"'()]+)["']?\s*\)/g)].map(m => m[1].trim());
  const resources = urls.filter(url => !url.startsWith("#") && !url.startsWith("data:") && !/^[a-z][a-z\d+.-]*:/i.test(url));
  assert.ok(resources.length >= 3);
  for (const resource of resources) {
    const target = path.resolve(path.dirname(cssPath), resource.split(/[?#]/)[0]);
    assert.ok(target.startsWith(path.dirname(cssPath) + path.sep), "Unsafe vendor URL: " + resource);
    assert.ok(fs.statSync(target).isFile(), "Missing CSS-transitive asset: " + resource);
  }
});

test("matching local icon assets are part of the service-worker offline shell", () => {
  assert.match(worker, /const CACHE = "lantern-v29"/);
  for (const filename of ["marker-icon.svg", "marker-shadow.svg", "layers.svg", "layers-2x.svg"]) {
    const asset = "./vendor/images/" + filename;
    assert.ok(worker.includes('"' + asset + '"'), "Missing precache asset: " + asset);
    const image = fs.readFileSync(path.join(root, "vendor/images", filename), "utf8");
    assert.match(image, /^<svg\b/);
    assert.match(image, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  }
});

test("Leaflet's default marker fallback points to self-hosted offline icons", () => {
  for (const asset of ["marker-icon.svg", "marker-shadow.svg"]) {
    assert.ok(app.includes("vendor/images/" + asset));
  }
  assert.doesNotMatch(css, /url\(images\/(?:marker-icon|layers|layers-2x)\.png\)/);
});
