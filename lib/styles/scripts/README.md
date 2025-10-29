# CSS Variable Transformer & Theme Generator for Webflow

Two complementary scripts for managing Webflow Code Component theming:

1. **transform-css-vars.js** - Transform shadcn variables to Webflow format
2. **generate-theme-webflow.js** - Generate theme files with live Webflow variable overrides

Automatically transforms shadcn/ui CSS variables to Webflow-compatible format and strips out everything except the variable declarations you need.

## The Problem

Webflow's variable panel system requires a specific naming convention with extra dashes and underscores. Additionally, your shadcn globals.css file contains lots of content Webflow doesn't need (@tailwind directives, @theme blocks, component styles, etc.).

**Standard shadcn format:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: oklch(0.9777 0.0041 301.4256);
  --primary: oklch(0.6104 0.0767 299.7335);
  --font-sans: Geist, sans-serif;
}

.dark {
  --background: oklch(0.2166 0.0215 292.8474);
  --primary: oklch(0.7058 0.0777 302.0489);
}

@theme inline {
  --color-background: var(--background);
}
```

**Webflow format (what you need):**
```css
:root {
  --_color---background: oklch(0.9777 0.0041 301.4256);
  --_color---primary: oklch(0.6104 0.0767 299.7335);
  --_font---sans: Geist, sans-serif;
}

.dark {
  --_color---background: oklch(0.2166 0.0215 292.8474);
  --_color---primary: oklch(0.7058 0.0777 302.0489);
}
```

## The Solution

This Node.js script automatically:
- ✅ Transforms variables to Webflow naming convention (`--_category---name`)
- ✅ Extracts only `:root` and `.dark` sections
- ✅ Strips out @tailwind, @theme, @layer, and all other content
- ✅ Gives you clean, ready-to-upload CSS

## Installation & Usage

### Requirements
- Node.js 12+ (no additional packages needed!)

### Quick Start

```bash
# 1. Copy transform-css-vars.js to lib/styles/scripts/

# 2. Make it executable (optional)
chmod +x lib/styles/scripts/transform-css-vars.js

# 3. Run it! (short form for lib/styles structure)
pnpm styles amethyst_haze.css
# → Input: lib/styles/tweakcn/amethyst_haze.css
# → Output: lib/styles/variables/amethyst_haze-webflow.css

# Apply as defaults
pnpm styles amethyst_haze.css --apply
# → Also overwrites lib/styles/variables/default.css

# Custom output filename
pnpm styles amethyst_haze.css custom-theme.css
# → Output: lib/styles/variables/custom-theme.css
```

### Usage Syntax

```bash
# Short form (recommended for lib/styles structure)
pnpm styles <theme-name.css> [output.css] [--apply]

# Direct script usage
node lib/styles/scripts/transform-css-vars.js <input.css> [output.css] [--apply]
```

**Arguments:**
- `theme-name.css` - Theme file name (looks in `lib/styles/tweakcn/` by default)
- `output.css` - Output filename (saves to `lib/styles/variables/` by default)
- `--apply` - Apply transformed theme as defaults to `lib/styles/variables/default.css`

### Examples

```bash
# Short form (recommended for lib/styles structure)
pnpm styles amethyst_haze.css
# → Input: lib/styles/tweakcn/amethyst_haze.css
# → Output: lib/styles/variables/amethyst_haze-webflow.css

pnpm styles amethyst_haze.css --apply
# → Also overwrites lib/styles/variables/default.css

pnpm styles amethyst_haze.css custom-theme.css
# → Output: lib/styles/variables/custom-theme.css

# Direct script usage (for files outside lib/styles)
node lib/styles/scripts/transform-css-vars.js ./app/globals.css ./public/webflow.css
node lib/styles/scripts/transform-css-vars.js ./src/styles/theme.css ./dist/webflow-theme.css

# Show help
pnpm styles --help
```

## Add to package.json (Recommended)

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "styles": "node lib/styles/scripts/transform-css-vars.js",
    "transform:webflow": "node lib/styles/scripts/transform-css-vars.js ./app/globals.css",
    "transform:apply": "node lib/styles/scripts/transform-css-vars.js ./lib/styles/globals.css --apply",
    "transform:watch": "nodemon --watch app/globals.css --exec npm run transform:webflow"
  }
}
```

Then run:
```bash
pnpm styles amethyst_haze.css        # Short form (recommended)
pnpm styles amethyst_haze.css --apply # Apply as defaults
npm run transform:webflow            # Regular transformation
npm run transform:apply              # Apply as defaults
```

## Transformation Rules

Variables are prefixed with their category following the pattern: `--_{category}---{name}`

### Colors
```
--background          → --_color---background
--foreground          → --_color---foreground
--primary             → --_color---primary
--primary-foreground  → --_color---primary-foreground
--card                → --_color---card
--border              → --_color---border
--destructive         → --_color---destructive
--muted               → --_color---muted
--accent              → --_color---accent
--ring                → --_color---ring
--chart-1 through 5   → --_color---chart-1 through 5
--sidebar-*           → --_color---sidebar-*
```

### Typography
```
--font-sans   → --_font---sans
--font-serif  → --_font---serif
--font-mono   → --_font---mono
```

### Layout
```
--radius   → --_radius---value  (special case)
--spacing  → --_spacing---value (special case)
```

### Shadows
```
--shadow      → --_shadow---default  (special case!)
--shadow-xs   → --_shadow---xs
--shadow-sm   → --_shadow---sm
--shadow-md   → --_shadow---md
--shadow-lg   → --_shadow---lg
--shadow-xl   → --_shadow---xl
--shadow-2xl  → --_shadow---2xl
--shadow-x/y/blur/spread/opacity/color → --_shadow---x/y/blur/spread/opacity/color
```

### Other
```
--tracking-normal  → --_tracking---normal
```

## What Gets Filtered Out

The script automatically removes everything except `:root` and `.dark` blocks:

❌ `@tailwind` directives  
❌ `@layer` blocks  
❌ `@theme` blocks  
❌ `@import` statements  
❌ Body styles  
❌ Component styles  
❌ Media queries  
❌ Any other CSS rules  

✅ Keeps only: `:root { ... }` and `.dark { ... }` with transformed variables

## Features

✓ **Smart path handling** - Defaults to `lib/styles/tweakcn/` input and `lib/styles/variables/` output  
✓ **Auto-creates directories** - Output directories created automatically  
✓ **Clean filtering** - Strips out everything except :root and .dark  
✓ **Variable transformation** - Converts to Webflow naming convention  
✓ **Reference updates** - Updates var(--name) references too  
✓ **Apply as defaults** - `--apply` flag overwrites `lib/styles/variables/default.css`  
✓ **Convenient npm script** - Use `pnpm styles theme.css` for quick access  
✓ **Helpful output** - Shows exactly what's happening  
✓ **No dependencies** - Uses only Node.js built-ins  

## Console Output

When you run the script, you'll see:

```
🔄 Transforming CSS variables...

📥 Input:  lib/styles/tweakcn/amethyst_haze.css
📤 Output: lib/styles/variables/amethyst_haze-webflow.css
🧹 Filter: Extracting only :root and .dark sections

✅ Transformation complete!

📋 Variable format changed:
   --background     →  --_color---background
   --primary        →  --_color---primary
   --font-sans      →  --_font---sans
   --radius         →  --_radius---value
   --shadow         →  --_shadow---default

🎉 Your Webflow-compatible CSS is ready!
📄 File saved to: lib/styles/variables/amethyst_haze-webflow.css
```

When using the `--apply` flag, you'll also see:

```
🎯 Applied theme as defaults to: lib/styles/variables/default.css
```

## Next.js Integration

Perfect for Next.js projects with shadcn/ui:

### App Router
```bash
node transform-css-vars.js ./app/globals.css
node transform-css-vars.js ./src/app/globals.css
```

### Pages Router
```bash
node transform-css-vars.js ./styles/globals.css
node transform-css-vars.js ./src/styles/globals.css
```

### Pre-build Hook
```json
{
  "scripts": {
    "prebuild": "node transform-css-vars.js ./app/globals.css ./public/webflow.css",
    "build": "next build"
  }
}
```

## Extending the Script

To add new variable transformations, edit the `TRANSFORMATION_RULES` object in the script:

```javascript
const TRANSFORMATION_RULES = {
  'your-variable': 'category',           // → --_category---your-variable
  'special-case': 'category---suffix',   // → --_category---suffix
};
```

## Troubleshooting

**Error: Input file not found**
- Verify the path to your globals.css file
- Make sure you're running from your project root
- Try using `./` prefix: `./app/globals.css`

**Variables not transforming**
- Ensure variables start with `--` (double dash)
- Check that variable names match shadcn conventions
- Look for warnings in the console output

**Need to transform multiple files?**
```bash
# Create multiple npm scripts
"styles:amethyst": "pnpm styles amethyst_haze.css",
"styles:bubblegum": "pnpm styles bubblegum.css",
"styles:apply": "pnpm styles amethyst_haze.css --apply",
"styles:all": "pnpm styles amethyst_haze.css && pnpm styles bubblegum.css"
```

## Using in Webflow

1. ✅ Run the transformation script
2. ✅ Upload the output CSS to your Webflow project
3. ✅ Variables appear grouped by category in Webflow's variable panel
4. ✅ Edit visually in the Webflow Designer

## File Size

The filtered output is typically **much smaller** than your original globals.css since it removes all the build tool directives, component styles, and other content Webflow doesn't need.

## CI/CD Integration

### GitHub Actions
```yaml
- name: Transform CSS for Webflow
  run: node transform-css-vars.js ./app/globals.css ./dist/webflow.css
```

### Vercel
```json
{
  "buildCommand": "node transform-css-vars.js ./app/globals.css ./public/webflow.css && next build"
}
```

## License

MIT - Feel free to use and modify for your projects!

## Theme Generator (generate-theme-webflow.js)

### The Complete Workflow

This script solves the Shadow DOM theming challenge by generating theme files that:
1. ✅ Use fallback values in Next.js (dev/production)
2. ✅ Allow Webflow Designer variables to override when present
3. ✅ Work without any Webflow variables configured

### Quick Start

```bash
# Generate theme with defaults
pnpm theme:generate

# Generate from specific variable set
pnpm theme:generate amethyst_haze-webflow.css

# Or use the script directly
node lib/styles/scripts/generate-theme-webflow.js [input.css]
```

### How It Works

**Input** (lib/styles/variables/default.css):
```css
:root {
  --_color---background: #faf7f5;
  --_color---primary: #9b2c2c;
}
```

**Output** (lib/styles/theme/theme.webflow.css):
```css
@theme inline {
  --color-background: var(--_color---background, #faf7f5);
  --color-primary: var(--_color---primary, #9b2c2c);
}
```

**The Magic:**
- Webflow Designer variables (like `--_color---background`) override when present
- Fallback values (like `#faf7f5`) used in Next.js and when Webflow vars missing
- Shadow DOM can access CSS variables from parent scope!

### Complete Theme Workflow

#### 1. Design Your Theme
Use shadcn/tweakcn to create a theme file:
```bash
# Create theme in lib/styles/tweakcn/my-theme.css
```

#### 2. Transform to Webflow Format
```bash
# Transform shadcn variables to Webflow format
pnpm styles my-theme.css
# → Output: lib/styles/variables/my-theme-webflow.css
```

#### 3. Generate Theme File
```bash
# Generate theme.webflow.css with fallbacks
pnpm theme:generate my-theme-webflow.css
# → Output: lib/styles/theme/theme.webflow.css
```

#### 4. Set as Defaults (Optional)
```bash
# Apply as default variables for Next.js
pnpm styles my-theme.css --apply
# → Overwrites: lib/styles/variables/default.css
```

#### 5. Configure Webflow Designer
In Webflow Designer's Styles panel:
1. Create variables matching the exact names:
   - `--_color---background`
   - `--_color---primary`
   - `--_color---foreground`
   - etc.
2. Set colors in Webflow Designer
3. Variables automatically override Shadow DOM defaults!

### Usage Examples

```bash
# Default (uses lib/styles/variables/default.css)
pnpm theme:generate

# From specific variable set
pnpm theme:generate example.webflow.css
pnpm theme:generate amethyst_haze-webflow.css

# Show help
pnpm theme:generate --help

# Direct script usage
node lib/styles/scripts/generate-theme-webflow.js
node lib/styles/scripts/generate-theme-webflow.js custom.css
node lib/styles/scripts/generate-theme-webflow.js ./path/vars.css ./path/theme.css
```

### Package.json Scripts

```json
{
  "scripts": {
    "styles": "node lib/styles/scripts/transform-css-vars.js",
    "theme:generate": "node lib/styles/scripts/generate-theme-webflow.js"
  }
}
```

### Why This Approach Works

**The Problem:**
When bundling Webflow Code Components, webpack bakes hardcoded CSS variable values into the bundle. Changes in Webflow Designer don't affect the components.

**The Solution:**
CSS custom properties (variables) **DO** inherit through Shadow DOM boundaries. By using `var(--_color---background, fallback)`:
1. If Webflow Designer has `--_color---background` set → Uses Webflow value ✅
2. If Webflow Designer doesn't have it → Uses fallback value ✅
3. In Next.js dev/production → Uses fallback value ✅

### Troubleshooting

**Theme not updating in Webflow:**
- Verify variable names match exactly: `--_color---background` (note the triple dash `---`)
- Use "Copy CSS" from Webflow Designer Variables panel to get exact names
- Rebuild and redeploy: `pnpm webflow:bundle`

**Colors baked into bundle:**
- Make sure you're using `theme.webflow.css` generated by this script
- Don't directly define colors in component styles
- Always reference via Tailwind classes (e.g., `bg-background`, `text-primary`)

**Next.js shows wrong colors:**
- Check `lib/styles/variables/default.css` has correct fallback values
- Regenerate theme: `pnpm theme:generate`
- Clear Next.js cache: `rm -rf .next && pnpm dev`

### Variable Naming Convention

**Webflow Format** (used in Designer):
```
--_{category}---{name}
```

**Theme Format** (used in Tailwind):
```
--{category}-{name}
```

**Examples:**
```
--_color---background    → --color-background
--_color---primary       → --color-primary
--_font---sans           → --font-sans
--_radius---value        → --radius-lg
--_shadow---default      → --shadow
```

## Help & Support

For more examples and guides, see:
- **FILTERING-GUIDE.md** - Detailed filtering examples
- **NEXTJS-SETUP.md** - Complete Next.js integration
- **CONFIGURATION-EXAMPLES.md** - Path configuration examples
- **QUICK-REFERENCE.md** - Command cheat sheet

Run `node transform-css-vars.js --help` or `node generate-theme-webflow.js --help` for usage information.