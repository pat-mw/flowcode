#!/usr/bin/env tsx

import { spawn } from "child_process";
import { getLibraryKeys, libraries } from "../src/libraries/index.js";

/**
 * Build all libraries sequentially to avoid dist/ folder race conditions
 * (In CI, matrix jobs run in isolation, so they can run in parallel)
 */
async function buildAllLibraries() {
  const libraryKeys = getLibraryKeys();

  console.log(`🚀 Building ${libraryKeys.length} libraries sequentially...\n`);
  console.log(`ℹ️  Note: Sequential builds prevent dist/ folder conflicts locally.`);
  console.log(`   In CI, libraries build in parallel (isolated jobs).\n`);

  const results: Array<{ key: string; success: boolean }> = [];

  // Build each library sequentially
  for (const key of libraryKeys) {
    const lib = libraries[key];
    console.log(`📦 Building: ${lib.name} (${key})`);

    const success = await new Promise<boolean>((resolve) => {
      const child = spawn("tsx", ["scripts/build-library.ts", key], {
        stdio: "inherit",
      });

      child.on("close", (code) => {
        if (code === 0) {
          console.log(`✅ ${lib.name} build complete\n`);
          resolve(true);
        } else {
          console.error(`❌ ${lib.name} build failed\n`);
          resolve(false);
        }
      });
    });

    results.push({ key, success });
  }

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
