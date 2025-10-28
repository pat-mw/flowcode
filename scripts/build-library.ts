#!/usr/bin/env tsx

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { libraries, type LibraryKey } from "../src/libraries/index.js";

interface BuildOptions {
  library: LibraryKey;
  dev?: boolean;
  publicPath?: string;
}

/**
 * Build a single library using Webflow CLI
 */
function buildLibrary({ library, dev = false, publicPath }: BuildOptions) {
  const lib = libraries[library];
  const manifestPath = path.join(
    process.cwd(),
    "src",
    "libraries",
    library,
    "webflow.json"
  );

  // Ensure manifest exists
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `Manifest not found for library "${library}". Run generate-manifests first.`
    );
  }

  console.log(`📦 Building library: ${lib.name} (${library})`);

  // Backup existing webflow.json if it exists
  const rootManifest = path.join(process.cwd(), "webflow.json");
  const backupManifest = path.join(process.cwd(), "webflow.json.backup");
  let hasBackup = false;

  if (fs.existsSync(rootManifest)) {
    fs.copyFileSync(rootManifest, backupManifest);
    hasBackup = true;
  }

  try {
    // Copy library manifest to root
    fs.copyFileSync(manifestPath, rootManifest);

    // Set environment variables for this library
    const envVars = Object.entries(lib.env || {})
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    // Build command
    const devFlag = dev ? "--dev" : "";
    const defaultPublicPath = "http://localhost:4000/";
    const publicPathFlag = `--public-path ${publicPath || defaultPublicPath}`;
    const outputDir = path.join("dist", library);

    const command = [
      envVars,
      "npx webflow library bundle",
      devFlag,
      publicPathFlag,
    ]
      .filter(Boolean)
      .join(" ");

    console.log(`Running: ${command}\n`);

    execSync(command, {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    // Move dist/Client to dist/[library]/Client
    const defaultDist = path.join(process.cwd(), "dist", "Client");
    const libraryDist = path.join(process.cwd(), outputDir, "Client");

    if (fs.existsSync(defaultDist)) {
      fs.mkdirSync(path.dirname(libraryDist), { recursive: true });
      fs.renameSync(defaultDist, libraryDist);
      console.log(`\n📁 Moved bundle to ${outputDir}/Client`);
    }

    console.log(`✅ Built: ${lib.name}`);

    // Check bundle size
    checkBundleSize(library);
  } catch (error) {
    console.error(`❌ Failed to build ${lib.name}`);
    throw error;
  } finally {
    // Restore original webflow.json
    if (hasBackup) {
      fs.copyFileSync(backupManifest, rootManifest);
      fs.unlinkSync(backupManifest);
    } else {
      // Remove the temporary manifest
      if (fs.existsSync(rootManifest)) {
        fs.unlinkSync(rootManifest);
      }
    }
  }
}

/**
 * Check if bundle size is within limit
 * Uses WEBFLOW_BUNDLE_SIZE_LIMIT_MB env var (defaults to 15MB)
 */
function checkBundleSize(library: LibraryKey) {
  const lib = libraries[library];
  const distPath = path.join(process.cwd(), "dist", library);

  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️  No dist folder found for ${library}`);
    return;
  }

  // Calculate size
  const sizeKB = execSync(`du -sk ${distPath} | cut -f1`, {
    encoding: "utf-8",
  }).trim();

  const sizeMB = parseFloat(sizeKB) / 1024;
  const limit = parseFloat(process.env.WEBFLOW_BUNDLE_SIZE_LIMIT_MB || "15");

  console.log(`\n📊 Bundle Size Check: ${lib.name}`);
  console.log(`   Size: ${sizeMB.toFixed(2)}MB`);
  console.log(`   Limit: ${limit}MB`);

  if (sizeMB > limit) {
    const overBy = sizeMB - limit;
    console.error(`\n❌ BUNDLE SIZE EXCEEDED by ${overBy.toFixed(2)}MB!`);
    process.exit(1);
  } else {
    const remaining = limit - sizeMB;
    console.log(`   ✅ Within limit (${remaining.toFixed(2)}MB remaining)\n`);
  }
}

// CLI usage
const libraryArg = process.argv[2] as LibraryKey;
if (!libraryArg || !libraries[libraryArg]) {
  console.error(`Usage: tsx scripts/build-library.ts <library-key>`);
  console.error(`Available libraries: ${Object.keys(libraries).join(", ")}`);
  process.exit(1);
}

buildLibrary({ library: libraryArg });
