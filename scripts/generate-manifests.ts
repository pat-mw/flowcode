#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import {
  libraries,
  getLibraryKeys,
  generateManifest,
} from "../src/libraries/index.js";

/**
 * Generate webflow.json manifest files for all libraries
 * Each library gets its own manifest in its directory
 */
function generateManifests() {
  const libraryKeys = getLibraryKeys();

  console.log(
    `📦 Generating manifests for ${libraryKeys.length} libraries...\n`
  );

  for (const key of libraryKeys) {
    const lib = libraries[key];
    const manifest = generateManifest(key);

    // Write manifest to library directory
    const manifestPath = path.join(
      process.cwd(),
      "src",
      "libraries",
      key,
      "webflow.json"
    );

    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

    console.log(`✅ ${key}: ${manifestPath}`);
  }

  console.log("\n✨ Manifest generation complete!");
}

generateManifests();
