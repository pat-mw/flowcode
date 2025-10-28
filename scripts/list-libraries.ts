#!/usr/bin/env tsx

import { getLibraryKeys, libraries } from "../src/libraries/index.js";

/**
 * Output library metadata for GitHub Actions matrix
 * Usage: tsx scripts/list-libraries.ts
 * Output: { "libraries": [{ "key": "core", "name": "BlogFlow Core", "id": "blogflow-core" }, ...] }
 */
function listLibraries() {
  const keys = getLibraryKeys();

  const librariesMatrix = keys.map((key) => ({
    key,
    name: libraries[key].name,
    id: libraries[key].id,
  }));

  // Output as JSON for GitHub Actions
  console.log(JSON.stringify({ libraries: librariesMatrix }));
}

listLibraries();
