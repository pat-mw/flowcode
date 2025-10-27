# Webflow Code Components - Local Development & Debugging

This guide covers local bundling, debugging, and testing of Webflow Code Components before deploying to Webflow.

## Table of Contents

- [Local Bundling](#local-bundling)
- [Debug Bundler Configuration](#debug-bundler-configuration)
- [Serving Local Bundles](#serving-local-bundles)
- [Debugging Common Issues](#debugging-common-issues)
- [Testing Workflow](#testing-workflow)

---

## Local Bundling

Instead of deploying to Webflow each time you make changes, you can bundle your components locally for testing and debugging.

### Commands

```bash
# Bundle components for local testing
pnpm webflow:bundle

# Bundle with detailed webpack debug output
pnpm webflow:bundle:debug
```

### What This Does

The `webflow:bundle` command:
1. Finds all `*.webflow.tsx` files in `src/components/`
2. Bundles each component using webpack with the config from `webpack.webflow.js`
3. Generates a `dist/` folder with bundled JavaScript files
4. Sets the public path to `http://localhost:4000/` (where you'll serve the bundle)

### Output

After running `pnpm webflow:bundle`, you'll see:

```
dist/
├── Client/
│   ├── remoteEntry.js          # Module Federation entry point
│   ├── 99.js                   # Component bundles
│   └── ...
└── manifest.json               # Component metadata
```

---

## Debug Bundler Configuration

Use the debug flag to inspect the final webpack configuration being used:

```bash
pnpm webflow:bundle:debug
```

This will output:
- The complete webpack configuration
- All resolved loaders and plugins
- Module resolution details
- Build warnings and errors

**Use this when**:
- Debugging build errors
- Verifying environment variables are being replaced (DefinePlugin)
- Checking if path aliases are resolving correctly
- Inspecting which modules are being bundled

---

## Serving Local Bundles

After bundling, you need to serve the `dist/` folder to test components.

### Option 1: Simple HTTP Server (Recommended for Testing)

```bash
# Install a simple HTTP server (if not already installed)
npm install -g http-server

# Serve the dist folder on port 4000
cd dist && http-server -p 4000 --cors
```

The `--cors` flag is important for allowing Webflow to load the bundle.

### Option 2: Using Python

```bash
# Python 3
cd dist && python3 -m http.server 4000
```

### Option 3: Using Node.js

```bash
# Install serve globally
npm install -g serve

# Serve the dist folder
serve dist -p 4000 --cors
```

### Verify Server is Running

Visit `http://localhost:4000/Client/remoteEntry.js` in your browser. You should see the bundled JavaScript code.

---

## Testing Local Bundles in Webflow

**Note**: Webflow Designer does not support loading components from localhost. Local bundles are primarily for:
1. Inspecting the final bundled code
2. Debugging webpack configuration issues
3. Verifying environment variable replacement
4. Testing bundle size and dependencies

To actually test components in Webflow, you must deploy via `pnpm webflow:share`.

### Inspecting Bundles

1. **Check for `process.env` references**:
   ```bash
   # Search for process.env in bundles (should return nothing after DefinePlugin fix)
   grep -r "process\.env" dist/Client/
   ```

2. **Check bundle size**:
   ```bash
   # See file sizes
   ls -lh dist/Client/
   ```

3. **Verify specific dependencies are included**:
   ```bash
   # Check if React Query is bundled
   grep -r "QueryClient" dist/Client/
   ```

---

## Debugging Common Issues

### Issue 1: `process is not defined` Error

**Symptom**: Components fail to load in Webflow with `ReferenceError: process is not defined`

**Cause**: Environment variables accessed via `process.env.*` are not replaced at build time

**Solution**:
1. Verify `webpack.webflow.js` has DefinePlugin configured (see `webpack.webflow.js:8-13`)
2. Run `pnpm webflow:bundle:debug` to check DefinePlugin is in config
3. Inspect bundle: `grep -r "process\.env" dist/Client/` (should return nothing)
4. Redeploy: `pnpm webflow:share`

**Reference**: See `/home/uzo/dev/blogflow/webpack.webflow.js` for DefinePlugin configuration

---

### Issue 2: Path Aliases Not Resolving

**Symptom**: Build errors like `Cannot find module '@/components/...'`

**Cause**: webpack alias not configured or path doesn't exist

**Solution**:
1. Check `webpack.webflow.js:4-7` has correct alias configuration:
   ```javascript
   resolve: {
     alias: {
       '@': path.resolve(__dirname),
     },
   }
   ```
2. Verify the file exists at the expected path
3. Run `pnpm webflow:bundle:debug` to see resolved modules

---

### Issue 3: Missing Dependencies in Bundle

**Symptom**: Runtime errors about missing modules

**Cause**: Dependency not installed or webpack externals config excluding it

**Solution**:
1. Check dependency is in `package.json`
2. Run `pnpm install` to ensure it's installed
3. Check `webpack.webflow.js` for any `externals` configuration that might exclude it
4. Run `pnpm webflow:bundle:debug` to see what's being bundled

---

### Issue 4: Styles Not Loading

**Symptom**: Components render without Tailwind CSS styles in Webflow

**Cause**: Missing `import '@/app/globals.css'` in Webflow wrapper

**Solution**:
1. Ensure **every** `*.webflow.tsx` file imports globals.css:
   ```typescript
   import '@/app/globals.css';
   ```
2. Check that `globals.css` contains Tailwind directives
3. Rebuild and redeploy: `pnpm webflow:share`

**Reference**: See `src/components/LoginForm.webflow.tsx:12` for example

---

## Testing Workflow

### 1. Development in Next.js (Fastest)

```bash
# Run Next.js dev server
pnpm dev

# Test components at http://localhost:3000
# Make changes to implementation components in components/
```

**Benefits**:
- Hot reload
- Fast iteration
- Can use Next.js dev tools
- No need to rebuild Webflow bundles

**Limitation**: Not testing Webflow-specific wrapper or Shadow DOM behavior

---

### 2. Local Bundle Inspection (Build Verification)

```bash
# Bundle locally to check for build errors
pnpm webflow:bundle

# Debug build configuration if errors occur
pnpm webflow:bundle:debug

# Inspect output
ls -lh dist/Client/
grep -r "process\.env" dist/Client/  # Should be empty
```

**Benefits**:
- Fast build without network upload
- Can inspect bundled code
- Verify environment variables replaced
- Check bundle size

**Limitation**: Cannot actually run components in Webflow environment

---

### 3. Deploy to Webflow (Full Testing)

```bash
# Deploy to Webflow
pnpm webflow:share

# Test in Webflow Designer
# https://webflow.com/dashboard/workspace/uzo-lab/shared-libraries-and-templates
```

**Benefits**:
- Full Webflow environment testing
- Shadow DOM behavior
- Actual rendering in Designer
- Production-like environment

**Limitation**: Slower iteration (network upload required)

---

## Environment Variables in Local Bundles

When bundling locally, environment variables are replaced at **build time** using webpack DefinePlugin.

### Setting Environment Variables for Local Bundle

```bash
# Set env var before bundling
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true pnpm webflow:bundle
```

### Verifying Replacement

After bundling, check that `process.env` was replaced:

```bash
# This should NOT return any results
grep -r "process\.env\.NEXT_PUBLIC" dist/Client/

# If it does return results, DefinePlugin is not working
# Check webpack.webflow.js configuration
```

### Adding New Environment Variables

Edit `webpack.webflow.js` and add to DefinePlugin:

```javascript
new webpack.DefinePlugin({
  'process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED': JSON.stringify(
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED || ''
  ),
  'process.env.NEXT_PUBLIC_NEW_VAR': JSON.stringify(
    process.env.NEXT_PUBLIC_NEW_VAR || 'default'
  ),
}),
```

---

## Quick Reference

### Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `pnpm dev` | Next.js dev server | Component development |
| `pnpm webflow:bundle` | Bundle locally | Build verification |
| `pnpm webflow:bundle:debug` | Bundle with debug output | Debugging webpack config |
| `pnpm webflow:share` | Deploy to Webflow | Testing in Webflow Designer |

### Files

| File | Purpose |
|------|---------|
| `webpack.webflow.js` | Webpack configuration for Webflow bundles |
| `webflow.json` | Webflow CLI configuration |
| `src/components/*.webflow.tsx` | Webflow wrapper components (bundled) |
| `components/*.tsx` | Implementation components (used by wrappers) |
| `dist/` | Local bundle output directory |

### Debugging Checklist

When components fail to load in Webflow:

1. ✅ Check browser console for errors
2. ✅ Run `pnpm webflow:bundle` locally to verify build succeeds
3. ✅ Run `pnpm webflow:bundle:debug` to inspect webpack config
4. ✅ Check for `process.env` references: `grep -r "process\.env" dist/Client/`
5. ✅ Verify DefinePlugin in `webpack.webflow.js:8-13`
6. ✅ Ensure `import '@/app/globals.css'` in all `.webflow.tsx` files
7. ✅ Redeploy with `pnpm webflow:share`
8. ✅ Clear Webflow Designer cache (hard refresh)

---

## Additional Resources

- **Webflow CLI Documentation**: https://developers.webflow.com/docs/cli
- **webpack DefinePlugin**: https://webpack.js.org/plugins/define-plugin/
- **Project Conventions**: See `CLAUDE.md` for Webflow Code Components patterns
- **Component Specifications**: See `docs/sitemap.md` for component details

---

**Last Updated**: 2025-10-27
**Related Files**: `webpack.webflow.js`, `package.json`, `CLAUDE.md`
