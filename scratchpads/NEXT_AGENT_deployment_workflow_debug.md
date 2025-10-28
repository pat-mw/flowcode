# URGENT: Deployment Workflow Failing - "No declaration files found"

## Current Status

PR #11 is open with a proposed fix, but the user is correct - the fix is likely WRONG.

## The Problem

Deployment workflow fails with:
```
ERROR: Error: No declaration files found
```

## User's Key Insight

"I don't think the webflow CLI share command actually takes a build folder as input. It builds itself."

**User is correct!** The `webflow library share` command:
1. Reads the manifest
2. Finds component source files
3. Compiles AND uploads them in one step
4. Does NOT use pre-built bundles from `dist/`

## Root Cause Investigation Needed

The error "No declaration files found" means the CLI can't find the TypeScript component files.

### Hypothesis: Path Resolution Issue

Check this manifest path structure:
```
src/libraries/core/webflow.json contains:
  "components": ["./src/libraries/core/**/*.webflow.@(ts|tsx)"]
```

**Problem:** When running:
```bash
npx webflow library share --manifest src/libraries/core/webflow.json
```

The CLI might resolve paths RELATIVE TO THE MANIFEST FILE'S DIRECTORY, not the project root!

So `./src/libraries/core/**/*.webflow.@(ts|tsx)` from inside `src/libraries/core/` would look for:
```
src/libraries/core/src/libraries/core/**/*.webflow.@(ts|tsx)  ❌ WRONG!
```

Instead of:
```
src/libraries/core/**/*.webflow.@(ts|tsx)  ✅ CORRECT
```

## What Works Locally

Check these working commands:
1. `pnpm webflow:share` - What does this do? Check package.json
2. Does it use a different manifest structure?
3. Does it copy manifest to root first?

## Investigation Steps

1. **Check path resolution:**
   ```bash
   cd src/libraries/core
   npx webflow library share --manifest ./webflow.json
   # Does this work? Or does it have same error?
   ```

2. **Check if manifest paths need to be relative to manifest location:**
   ```json
   // Should components path be:
   "components": ["./**/*.webflow.@(ts|tsx)"]  // Relative to manifest
   // Instead of:
   "components": ["./src/libraries/core/**/*.webflow.@(ts|tsx)"]  // Absolute-ish
   ```

3. **Check build-library.ts script:**
   - Line 47: It copies manifest to root temporarily
   - Line 48: Then runs bundle command
   - This suggests manifests ARE designed to run from root!

4. **Alternative solution:**
   ```yaml
   - name: Copy manifest to root and deploy
     run: |
       cp src/libraries/${{ matrix.library.key }}/webflow.json ./webflow.json.temp
       npx webflow library share --manifest ./webflow.json.temp --no-input
       rm ./webflow.json.temp
   ```

## Critical Files to Review

1. `scripts/build-library.ts` - Lines 36-48 (manifest copying logic)
2. `src/libraries/*/webflow.json` - Component path patterns
3. `.github/workflows/webflow-deploy-all.yml` - Current deployment logic

## Expected Solution

The deployment workflow likely needs to:
1. Copy library manifest to project root (like build script does)
2. Run share command from root with root manifest
3. Clean up temp manifest

OR

1. Change manifest component paths to be relative to manifest location
2. Run share command with manifest path as-is

## Test Plan

1. Run deployment workflow with fix
2. Check for "No declaration files found" error
3. If still fails, check Webflow CLI debug logs at:
   `/home/runner/.local/state/webflow-cli-nodejs/*-debug.log`

## Context Constraints

⚠️ **IMPORTANT:** We are running low on context. Focus ONLY on:
1. Identifying the path resolution issue
2. Implementing the correct fix
3. Testing deployment works

DO NOT:
- Refactor unrelated code
- Add unnecessary features
- Explain multi-library system (already documented)

## Success Criteria

✅ Deployment workflow runs without "No declaration files found" error
✅ Libraries successfully upload to Webflow
✅ Both core and analytics libraries deploy correctly
