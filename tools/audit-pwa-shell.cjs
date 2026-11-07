#!/usr/bin/env node
"use strict";
/* Static source evidence only: no browser, network, analytics or asset downloads.
   This is NOT a transfer-size benchmark or verified offline-install success.
*/
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");
const textExtensions = new Set([".html", ".js", ".css", ".json", ".webmanifest", ".svg"]);
const kindFor = (relative) => {
  const ext = path.extname(relative).toLowerCase();
  if ([".js"].includes(ext)) return "script";
  if ([".css"].includes(ext)) return "style";
  if ([".json", ".webmanifest"].includes(ext)) return "data";
  if ([".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(ext)) return "image";
  if ([".ogg", ".mp3", ".wav"].includes(ext)) return "audio";
  if ([".html"].includes(ext)) return "html";
  return "other";
};

function readShell(source) {
  const shell = source.match(/\bconst\s+SHELL\s*=\s*\[([\s\S]*?)\];/);
  if (!shell) throw new Error("Service worker shell array not found");
  // Parse every token, not only strings matching a permissive regex. A silent
  // omission would undercount the service worker's actual app-shell inventory.
  let entries;
  try {
    entries = JSON.parse("[" + shell[1].replace(/,\s*$/, "") + "]");
  } catch {
    throw new Error("Invalid or unsupported service worker shell entry");
  }
  if (!Array.isArray(entries) || !entries.length ||
      entries.some(entry => typeof entry !== "string" || !entry.startsWith("./"))) {
    throw new Error("Invalid or nonlocal shell entry");
  }
  if (new Set(entries).size !== entries.length) throw new Error("Repeated shell route");
  return entries;
}

function report(rootDir = root) {
  const sw = fs.readFileSync(path.join(rootDir, "sw.js"), "utf8");
  const match = sw.match(/\bconst\s+CACHE\s*=\s*"([^"]+)"/);
  if (!match || !/^lantern-v\d+$/.test(match[1])) {
    throw new Error("Missing or invalid named PWA cache");
  }
  const shell = readShell(sw);
  const distinct = new Set();
  for (const entry of shell) {
    // URL aliases ./ and ./index.html are the same physical HTML asset.
    const relative = entry === "./" ? "index.html" : entry.slice(2);
    if (!relative || relative.includes("\\") || relative.startsWith("/") ||
        relative.split("/").some(part => part === "." || part === ".." || !part)) {
      throw new Error("Invalid or nonlocal shell path: " + entry);
    }
    const absolute = path.resolve(rootDir, relative);
    if (!absolute.startsWith(path.resolve(rootDir) + path.sep)) {
      throw new Error("Shell path escaped app root");
    }
    // Do not follow symlinks, including ancestors: the inventory must measure
    // only physical assets within the checked-out application directory.
    let current = path.resolve(rootDir);
    for (const part of relative.split("/")) {
      current = path.join(current, part);
      if (fs.lstatSync(current).isSymbolicLink()) {
        throw new Error("Symlinked shell path is not allowed: " + entry);
      }
    }
    if (!fs.statSync(absolute).isFile()) {
      throw new Error("Shell path not a regular file: " + entry);
    }
    distinct.add(relative);
  }
  const groups = {};
  let bytes = 0;
  let estimatedEncoded = 0;
  for (const relative of [...distinct].sort()) {
    const content = fs.readFileSync(path.join(rootDir, relative));
    const ext = path.extname(relative).toLowerCase();
    const raw = content.length;
    // Already compressed media uses actual file bytes as a conservative
    // static estimate; text uses local gzip, not real HTTP Content-Encoding.
    const encoded = textExtensions.has(ext) ? zlib.gzipSync(content).length : raw;
    const kind = kindFor(relative);
    groups[kind] ??= { files: 0, bytes: 0, static_encoded_estimate_bytes: 0 };
    groups[kind].files++;
    groups[kind].bytes += raw;
    groups[kind].static_encoded_estimate_bytes += encoded;
    bytes += raw;
    estimatedEncoded += encoded;
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, "manifest.webmanifest"), "utf8"));
  if (manifest.start_url !== "./" || manifest.display !== "standalone") {
    throw new Error("Unexpected PWA start_url or display mode");
  }
  return {
    schema_version: 1,
    cache_name: match[1],
    measurement: "source_files_not_network_or_cache-install",
    actual_browser_transfer_tested: false,
    offline_success_verified: false,
    pwa_app_shell_routes: shell.length,
    distinct_source_files: distinct.size,
    source_bytes: bytes,
    static_encoded_estimate_bytes: estimatedEncoded,
    by_kind: groups,
    limitations: [
      "Source sizes include explicitly listed SW SHELL files, not runtime downloads.",
      "One route alias is deduplicated; compression estimates are local, not HTTP measurements.",
      "Service worker caches shell files best-effort; presence does not prove offline success.",
      "No native application comparison, revenue lift, marketing conversion or ZQM sale is measured.",
    ],
  };
}

if (require.main === module) {
  try {
    process.stdout.write(JSON.stringify(report(), null, 2) + "\n");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { readShell, report };
