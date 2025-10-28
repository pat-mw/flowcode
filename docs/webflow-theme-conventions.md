# Webflow Theme Conventions & CSS Variable System

## Overview

This guide documents the CSS variable transformation system used to make shadcn/ui components compatible with Webflow's styling requirements. The system transforms standard CSS variables into Webflow's categorized variable format.

## Table of Contents

- [CSS Variable Transformation](#css-variable-transformation)
- [File Structure](#file-structure)
- [Variable Categories](#variable-categories)
- [Dark Mode Support](#dark-mode-support)
- [Using the Transform Script](#using-the-transform-script)
- [Chart Colors](#chart-colors)
- [Best Practices](#best-practices)

---

## CSS Variable Transformation

### Standard Format vs Webflow Format

**Standard shadcn CSS variables:**
```css
--background: #faf7f5;
--foreground: #1a1a1a;
--primary: #9b2c2c;
--font-sans: Poppins, sans-serif;
--radius: 0.375rem;
```

**Webflow-compatible format:**
```css
--_color---background: #faf7f5;
--_color---foreground: #1a1a1a;
--_color---primary: #9b2c2c;
--_font---sans: Poppins, sans-serif;
--_radius---value: 0.375rem;
```

### Why This Transformation?

Webflow requires CSS variables to follow a specific naming convention for proper categorization and usage within the Webflow Designer. The transformation:

1. **Categorizes variables** by adding category prefixes (`_color`, `_font`, `_shadow`, etc.)
2. **Uses triple-dash separator** (`---`) to denote category boundaries
3. **Maintains compatibility** with Tailwind CSS v4's `@theme` system

---

## File Structure

### Primary Files

```
lib/styles/
├── globals.css                          # Main entry point
├── variables/
│   └── default.css                      # Transformed Webflow variables
├── theme/
│   └── theme.webflow.css                # Theme mapping layer
├── tweakcn/
│   └── *.css                            # Source themes from tweakcn
└── scripts/
    └── transform-css-vars.js            # Transformation script
```

### How Files Work Together

1. **`globals.css`** - Imports everything:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "./variables/default.css";
@import "./theme/theme.webflow.css";
```

2. **`variables/default.css`** - Contains transformed variables:
```css
:root {
  --_color---background: #faf7f5;
  --_color---primary: #9b2c2c;
  /* ... all color, font, shadow variables */
}

.dark {
  --_color---background: #1c1917;
  --_color---primary: #b91c1c;
  /* ... dark mode overrides */
}
```

3. **`theme.webflow.css`** - Maps to Tailwind:
```css
@theme inline {
  --color-background: var(--_color---background);
  --color-primary: var(--_color---primary);
  --font-sans: var(--_font---sans);
  --radius-lg: var(--_radius---value);
}
```

---

## Variable Categories

### Colors (`_color---*`)

All color-related variables use the `_color` category:

```css
/* UI Colors */
--_color---background
--_color---foreground
--_color---card
--_color---card-foreground
--_color---popover
--_color---popover-foreground
--_color---primary
--_color---primary-foreground
--_color---secondary
--_color---secondary-foreground
--_color---muted
--_color---muted-foreground
--_color---accent
--_color---accent-foreground
--_color---destructive
--_color---destructive-foreground
--_color---border
--_color---input
--_color---ring

/* Chart Colors */
--_color---chart-1
--_color---chart-2
--_color---chart-3
--_color---chart-4
--_color---chart-5

/* Sidebar Colors */
--_color---sidebar
--_color---sidebar-foreground
--_color---sidebar-primary
--_color---sidebar-primary-foreground
--_color---sidebar-accent
--_color---sidebar-accent-foreground
--_color---sidebar-border
--_color---sidebar-ring
```

### Fonts (`_font---*`)

Typography variables (note: `font-` prefix is removed):

```css
--_font---sans: Poppins, sans-serif;
--_font---serif: Libre Baskerville, serif;
--_font---mono: IBM Plex Mono, monospace;
```

**Original:** `--font-sans` → **Transformed:** `--_font---sans`

### Radius (`_radius---value`)

Border radius is a special case:

```css
--_radius---value: 0.375rem;
```

Used with Tailwind radius utilities:
```css
--radius-sm: calc(var(--_radius---value) - 4px);
--radius-md: calc(var(--_radius---value) - 2px);
--radius-lg: var(--_radius---value);
--radius-xl: calc(var(--_radius---value) + 4px);
```

### Shadows (`_shadow---*`)

Shadow variables (note: `shadow-` prefix is removed):

```css
--_shadow---x: 1px;
--_shadow---y: 1px;
--_shadow---blur: 16px;
--_shadow---spread: -2px;
--_shadow---opacity: 0.12;
--_shadow---color: hsl(0 63% 18%);

/* Composed shadows */
--_shadow---2xs: 1px 1px 16px -2px hsl(0 63% 18% / 0.06);
--_shadow---xs: 1px 1px 16px -2px hsl(0 63% 18% / 0.06);
--_shadow---sm: 1px 1px 16px -2px hsl(0 63% 18% / 0.12), 1px 1px 2px -3px hsl(0 63% 18% / 0.12);
--_shadow---default: 1px 1px 16px -2px hsl(0 63% 18% / 0.12), 1px 1px 2px -3px hsl(0 63% 18% / 0.12);
--_shadow---md: 1px 1px 16px -2px hsl(0 63% 18% / 0.12), 1px 2px 4px -3px hsl(0 63% 18% / 0.12);
--_shadow---lg: 1px 1px 16px -2px hsl(0 63% 18% / 0.12), 1px 4px 6px -3px hsl(0 63% 18% / 0.12);
--_shadow---xl: 1px 1px 16px -2px hsl(0 63% 18% / 0.12), 1px 8px 10px -3px hsl(0 63% 18% / 0.12);
--_shadow---2xl: 1px 1px 16px -2px hsl(0 63% 18% / 0.30);
```

**Special case:** `--shadow` → `--_shadow---default` (not `--_shadow---shadow`)

### Spacing (`_spacing---value`)

```css
--_spacing---value: 0.25rem;
```

### Tracking (`_tracking---*`)

```css
--_tracking---tracking-normal: 0em;
```

---

## Dark Mode Support

### Implementation

Dark mode is handled through CSS class application, not through next-themes `ThemeProvider` (which doesn't work in Shadow DOM).

**In Webflow Components:**
```tsx
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

export function ComponentWrapper(props: Props) {
  return (
    <WebflowProvidersWrapper>
      <Component {...props} />
    </WebflowProvidersWrapper>
  );
}
```

**WebflowProvidersWrapper applies dark mode:**
```tsx
export function WebflowProvidersWrapper({ children }) {
  return (
    <QueryClientProvider client={webflowQueryClient}>
      <TooltipProvider delayDuration={200}>
        <div className="dark"> {/* Dark mode applied here */}
          {children}
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

### Dark Mode Variables

All color variables have dark mode overrides in `variables/default.css`:

```css
:root {
  --_color---background: #faf7f5;
  --_color---foreground: #1a1a1a;
  --_color---primary: #9b2c2c;
}

.dark {
  --_color---background: #1c1917;
  --_color---foreground: #f5f5f4;
  --_color---primary: #b91c1c;
}
```

### Custom Variant for Dark Mode

The `theme.webflow.css` file includes a custom Tailwind variant:

```css
@custom-variant dark (&:is(.dark *));
```

This enables dark mode styles when elements are inside a `.dark` container:

```tsx
<div className="bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground">
  Content adapts to dark mode
</div>
```

---

## Using the Transform Script

### Overview

The `transform-css-vars.js` script automates the conversion of standard shadcn themes to Webflow format.

**Location:** `lib/styles/scripts/transform-css-vars.js`

### Basic Usage

```bash
# Transform a theme from tweakcn
node lib/styles/scripts/transform-css-vars.js amethyst_haze.css

# Specify custom output
node lib/styles/scripts/transform-css-vars.js amethyst_haze.css my-theme.css

# Apply as default theme
node lib/styles/scripts/transform-css-vars.js amethyst_haze.css --apply
```

### Default Behavior

**Input path rules:**
- If no path prefix (`./` or `../`), assumes `lib/styles/tweakcn/`
- Full paths work: `./app/theme.css`, `../external/theme.css`

**Output path rules:**
- If no output specified, creates `<name>-webflow.css` in `lib/styles/variables/`
- Custom output: specify filename or full path

**Examples:**

```bash
# Input: lib/styles/tweakcn/amethyst_haze.css
# Output: lib/styles/variables/amethyst_haze-webflow.css
node lib/styles/scripts/transform-css-vars.js amethyst_haze.css

# Custom output filename (still in lib/styles/variables/)
node lib/styles/scripts/transform-css-vars.js amethyst_haze.css my-custom-theme.css

# Full custom paths
node lib/styles/scripts/transform-css-vars.js ./src/theme.css ./dist/webflow.css
```

### Apply Flag

The `--apply` flag overwrites `lib/styles/variables/default.css`:

```bash
node lib/styles/scripts/transform-css-vars.js amethyst_haze.css --apply
```

This:
1. Transforms the theme
2. Saves transformed version to `lib/styles/variables/amethyst_haze-webflow.css`
3. **Overwrites** `lib/styles/variables/default.css` with transformed content
4. Makes the theme active across the entire app

### What Gets Transformed

The script extracts and transforms **only** `:root` and `.dark` blocks:

**Input (standard shadcn):**
```css
@layer base {
  :root {
    --background: #faf7f5;
    --foreground: #1a1a1a;
    --primary: #9b2c2c;
  }

  .dark {
    --background: #1c1917;
    --foreground: #f5f5f4;
    --primary: #b91c1c;
  }
}
```

**Output (Webflow format):**
```css
:root {
  --_color---background: #faf7f5;
  --_color---foreground: #1a1a1a;
  --_color---primary: #9b2c2c;
}

.dark {
  --_color---background: #1c1917;
  --_color---foreground: #f5f5f4;
  --_color---primary: #b91c1c;
}
```

Note: `@layer` and other CSS directives are removed.

---

## Chart Colors

### Overview

Charts use a dedicated set of color variables for data visualization. These support both light and dark modes.

### Chart Color Variables

```css
:root {
  --_color---chart-1: #b91c1c;
  --_color---chart-2: #9b2c2c;
  --_color---chart-3: #7f1d1d;
  --_color---chart-4: #b45309;
  --_color---chart-5: #92400e;
}

.dark {
  --_color---chart-1: #f87171;
  --_color---chart-2: #ef4444;
  --_color---chart-3: #dc2626;
  --_color---chart-4: #fbbf24;
  --_color---chart-5: #f59e0b;
}
```

### Using Chart Colors with shadcn/ui Charts

**Method 1: Theme-based (Recommended)**

Uses the `theme` property for automatic light/dark mode support:

```tsx
import { ChartConfig } from '@/components/ui/chart';

const chartConfig: ChartConfig = {
  views: {
    label: 'Views',
    theme: {
      light: '#b91c1c',
      dark: '#f87171',
    },
  },
  likes: {
    label: 'Likes',
    theme: {
      light: '#9b2c2c',
      dark: '#ef4444',
    },
  },
};
```

**Method 2: Single color (Less flexible)**

```tsx
const chartConfig: ChartConfig = {
  views: {
    label: 'Views',
    color: 'hsl(var(--chart-1))',
  },
};
```

### Chart Component Example

```tsx
import { Bar, BarChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const data = [
  { month: 'Jan', views: 2400, likes: 400 },
  { month: 'Feb', views: 1398, likes: 300 },
];

const chartConfig = {
  views: {
    label: 'Views',
    theme: { light: '#b91c1c', dark: '#f87171' },
  },
  likes: {
    label: 'Likes',
    theme: { light: '#9b2c2c', dark: '#ef4444' },
  },
};

export function Chart() {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={data}>
        <Bar dataKey="views" fill="var(--color-views)" />
        <Bar dataKey="likes" fill="var(--color-likes)" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  );
}
```

---

## Best Practices

### 1. Always Use Transformed Variables

❌ **Don't** use standard CSS variables in Webflow components:
```css
color: var(--primary);
```

✅ **Do** use the theme mapping layer:
```css
color: hsl(var(--color-primary));
```

The `theme.webflow.css` file handles the mapping automatically.

### 2. Dark Mode in Webflow Components

❌ **Don't** use ThemeProvider:
```tsx
import { ThemeProvider } from 'next-themes';

// This doesn't work in Shadow DOM!
<ThemeProvider attribute="class">
  <Component />
</ThemeProvider>
```

✅ **Do** use WebflowProvidersWrapper:
```tsx
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

<WebflowProvidersWrapper>
  <Component />
</WebflowProvidersWrapper>
```

### 3. Testing Theme Changes

After modifying theme variables:

1. **Test in Next.js app:**
   ```bash
   pnpm dev
   # Visit http://localhost:3000/test-components
   ```

2. **Test Webflow bundle:**
   ```bash
   pnpm webflow:bundle
   # Visit http://localhost:4000 (served bundle)
   ```

3. **Deploy to Webflow:**
   ```bash
   pnpm webflow:share
   ```

### 4. Creating New Themes

To add a new theme:

1. **Get source theme** (from tweakcn or create manually)
2. **Place in** `lib/styles/tweakcn/`
3. **Transform it:**
   ```bash
   node lib/styles/scripts/transform-css-vars.js new-theme.css
   ```
4. **Review output** in `lib/styles/variables/new-theme-webflow.css`
5. **Apply if desired:**
   ```bash
   node lib/styles/scripts/transform-css-vars.js new-theme.css --apply
   ```

### 5. Maintaining Consistency

When adding new color variables:

1. **Add to transformation rules** in `transform-css-vars.js`:
   ```js
   const TRANSFORMATION_RULES = {
     'new-color': 'color',
     'new-font': 'font',
     // ...
   };
   ```

2. **Update default.css** with new variable
3. **Update theme.webflow.css** with mapping:
   ```css
   @theme inline {
     --color-new-color: var(--_color---new-color);
   }
   ```

### 6. Version Control

Always commit both:
- Source theme files (`lib/styles/tweakcn/*.css`)
- Transformed files (`lib/styles/variables/*.css`)

This maintains a clear history of theme evolution.

---

## Troubleshooting

### Variables Not Applying

**Problem:** Theme variables don't apply in Webflow components

**Solution:** Ensure `@/lib/styles/globals.css` is imported in `.webflow.tsx` files:
```tsx
// At the top of your Webflow wrapper
import '@/lib/styles/globals.css';
```

However, with `WebflowProvidersWrapper`, this is handled automatically.

### Dark Mode Not Working

**Problem:** Dark mode colors not showing

**Check:**
1. Is component wrapped with `WebflowProvidersWrapper`?
2. Does `variables/default.css` have `.dark` overrides?
3. Is `@custom-variant dark` defined in `theme.webflow.css`?

### Chart Colors Not Showing

**Problem:** Chart bars/lines have no color

**Solution:** Use `theme` property instead of `color` for automatic light/dark mode:

```tsx
// ❌ Single color
color: 'hsl(var(--chart-1))'

// ✅ Theme-aware
theme: {
  light: '#b91c1c',
  dark: '#f87171',
}
```

---

## Summary

The Webflow theme convention system:

1. ✅ **Transforms** standard CSS variables to Webflow format (`--var` → `--_category---var`)
2. ✅ **Categorizes** variables by type (color, font, shadow, etc.)
3. ✅ **Supports** dark mode through `.dark` class
4. ✅ **Maps** transformed variables to Tailwind via `theme.webflow.css`
5. ✅ **Automates** transformation with `transform-css-vars.js` script
6. ✅ **Maintains** compatibility with both Next.js and Webflow environments

By following these conventions, shadcn/ui components work seamlessly in both Next.js development and Webflow production environments.
