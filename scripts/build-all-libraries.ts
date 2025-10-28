#!/usr/bin/env tsx

import { spawn } from "child_process";
import { getLibraryKeys, libraries } from "../src/libraries/index.js";

/**
 * Build all libraries in parallel
 */
async function buildAllLibraries() {
  const libraryKeys = getLibraryKeys();

  console.log(`🚀 Building ${libraryKeys.length} libraries in parallel...\n`);

  // Create promises for parallel builds
  const buildPromises = libraryKeys.map((key) => {
    return new Promise<{ key: string; success: boolean }>((resolve) => {
      const lib = libraries[key];
      console.log(`📦 Starting build: ${lib.name} (${key})`);

      const child = spawn("tsx", ["scripts/build-library.ts", key], {
        stdio: "inherit",
      });

      child.on("close", (code) => {
        if (code === 0) {
          console.log(`✅ ${lib.name} build complete\n`);
          resolve({ key, success: true });
        } else {
          console.error(`❌ ${lib.name} build failed\n`);
          resolve({ key, success: false });
        }
      });
    });
  });

  // Wait for all builds
  const results = await Promise.all(buildPromises);

  // Summary
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Build Summary`);
  console.log("=".repeat(50));
  console.log(`✅ Successful: ${successful.length}/${results.length}`);

  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach((f) => {
      const lib = libraries[f.key as keyof typeof libraries];
      console.log(`   - ${lib.name}`);
    });
    process.exit(1);
  } else {
    console.log("\n✨ All libraries built successfully!");
  }
}

buildAllLibraries();
