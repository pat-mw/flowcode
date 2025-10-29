#!/usr/bin/env node

/**
 * Webflow Theme Generator with Fallbacks
 *
 * Generates a theme.webflow.css file that references Webflow Designer variables
 * with fallbacks. This allows:
 * 1. Default values work in Next.js dev/production
 * 2. Webflow Designer variables override when present
 * 3. Components work without Webflow variables set
 *
 * Usage: node generate-theme-webflow.js [input.css] [output.css]
 * Or: ./generate-theme-webflow.js [input.css] [output.css]
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Reverse transformation rules - maps Webflow format to theme format
const THEME_MAPPINGS = {
  // Colors
  '--_color---background': '--color-background',
  '--_color---foreground': '--color-foreground',
  '--_color---card': '--color-card',
  '--_color---card-foreground': '--color-card-foreground',
  '--_color---popover': '--color-popover',
  '--_color---popover-foreground': '--color-popover-foreground',
  '--_color---primary': '--color-primary',
  '--_color---primary-foreground': '--color-primary-foreground',
  '--_color---secondary': '--color-secondary',
  '--_color---secondary-foreground': '--color-secondary-foreground',
  '--_color---muted': '--color-muted',
  '--_color---muted-foreground': '--color-muted-foreground',
  '--_color---accent': '--color-accent',
  '--_color---accent-foreground': '--color-accent-foreground',
  '--_color---destructive': '--color-destructive',
  '--_color---destructive-foreground': '--color-destructive-foreground',
  '--_color---border': '--color-border',
  '--_color---input': '--color-input',
  '--_color---ring': '--color-ring',
  '--_color---chart-1': '--color-chart-1',
  '--_color---chart-2': '--color-chart-2',
  '--_color---chart-3': '--color-chart-3',
  '--_color---chart-4': '--color-chart-4',
  '--_color---chart-5': '--color-chart-5',
  '--_color---sidebar': '--color-sidebar',
  '--_color---sidebar-foreground': '--color-sidebar-foreground',
  '--_color---sidebar-primary': '--color-sidebar-primary',
  '--_color---sidebar-primary-foreground': '--color-sidebar-primary-foreground',
  '--_color---sidebar-accent': '--color-sidebar-accent',
  '--_color---sidebar-accent-foreground': '--color-sidebar-accent-foreground',
  '--_color---sidebar-border': '--color-sidebar-border',
  '--_color---sidebar-ring': '--color-sidebar-ring',

  // Fonts
  '--_font---sans': '--font-sans',
  '--_font---serif': '--font-serif',
  '--_font---mono': '--font-mono',

  // Radius (special case)
  '--_radius---value': '--radius-lg',

  // Shadows
  '--_shadow---x': '--shadow-x',
  '--_shadow---y': '--shadow-y',
  '--_shadow---blur': '--shadow-blur',
  '--_shadow---spread': '--shadow-spread',
  '--_shadow---opacity': '--shadow-opacity',
  '--_shadow---color': '--shadow-color',
  '--_shadow---2xs': '--shadow-2xs',
  '--_shadow---xs': '--shadow-xs',
  '--_shadow---sm': '--shadow-sm',
  '--_shadow---default': '--shadow',
  '--_shadow---md': '--shadow-md',
  '--_shadow---lg': '--shadow-lg',
  '--_shadow---xl': '--shadow-xl',
  '--_shadow---2xl': '--shadow-2xl',

  // Other
  '--_tracking---tracking-normal': '--tracking-normal',
  '--_spacing---value': '--spacing-value',
};

// Additional radius mappings (derived from --_radius---value)
const RADIUS_DERIVED = [
  { theme: '--radius-sm', calc: 'calc(var(--_radius---value) - 4px)' },
  { theme: '--radius-md', calc: 'calc(var(--_radius---value) - 2px)' },
  { theme: '--radius-xl', calc: 'calc(var(--_radius---value) + 4px)' },
];

/**
 * Parse CSS to extract variable definitions from :root block
 */
function parseRootVariables(cssContent) {
  const variables = new Map();

  // Extract :root block
  const rootMatch = cssContent.match(/:root\s*\{([^}]*)\}/s);
  if (!rootMatch) {
    console.warn('⚠️  Warning: No :root block found in input file');
    return variables;
  }

  const rootContent = rootMatch[1];

  // Parse variable declarations: --var-name: value;
  const varRegex = /^\s*(--[a-z0-9-_]+)\s*:\s*([^;]+);/gm;
  let match;

  while ((match = varRegex.exec(rootContent)) !== null) {
    const varName = match[1];
    const value = match[2].trim();
    variables.set(varName, value);
  }

  return variables;
}

/**
 * Parse CSS to extract variable definitions from .dark block
 */
function parseDarkVariables(cssContent) {
  const variables = new Map();

  // Extract .dark block
  const darkMatch = cssContent.match(/\.dark\s*\{([^}]*)\}/s);
  if (!darkMatch) {
    console.warn('⚠️  Warning: No .dark block found in input file');
    return variables;
  }

  const darkContent = darkMatch[1];

  // Parse variable declarations: --var-name: value;
  const varRegex = /^\s*(--[a-z0-9-_]+)\s*:\s*([^;]+);/gm;
  let match;

  while ((match = varRegex.exec(darkContent)) !== null) {
    const varName = match[1];
    const value = match[2].trim();
    variables.set(varName, value);
  }

  return variables;
}

/**
 * Generate @theme inline block with var() references and fallbacks
 */
function generateThemeBlock(variables) {
  const lines = [];

  lines.push('@custom-variant dark (&:is(.dark *));');
  lines.push('');
  lines.push('@theme inline {');

  // Process each mapping
  for (const [webflowVar, themeVar] of Object.entries(THEME_MAPPINGS)) {
    const fallbackValue = variables.get(webflowVar);

    if (fallbackValue) {
      // If fallbackValue already contains var(), keep it as is
      if (fallbackValue.startsWith('var(')) {
        lines.push(`  ${themeVar}: ${fallbackValue};`);
      } else {
        // Create var() reference with fallback
        lines.push(`  ${themeVar}: var(${webflowVar}, ${fallbackValue});`);
      }
    } else {
      console.warn(`⚠️  Warning: No value found for ${webflowVar}, skipping ${themeVar}`);
    }
  }

  // Add derived radius values
  lines.push('');
  lines.push('  /* Derived radius values */');
  for (const { theme, calc } of RADIUS_DERIVED) {
    lines.push(`  ${theme}: ${calc};`);
  }

  lines.push('}');

  return lines.join('\n') + '\n';
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  // Show help if help flag is present
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🎨 Webflow Theme Generator with Fallbacks\n');
    console.log('Generate theme.webflow.css with var() references and fallback values.\n');
    console.log('Usage:');
    console.log('  node generate-theme-webflow.js [input.css] [output.css] [--light|--dark]');
    console.log('  ./generate-theme-webflow.js [input.css] [output.css] [--light|--dark]\n');
    console.log('Arguments:');
    console.log('  input.css   - Webflow variables file (default: lib/styles/variables/default.css)');
    console.log('  output.css  - Output theme file (default: lib/styles/theme/theme.webflow.css)');
    console.log('  --light     - Use :root values as fallbacks (light mode)');
    console.log('  --dark      - Use .dark values as fallbacks (dark mode) [DEFAULT]\n');
    console.log('Examples:');
    console.log('  # Use dark mode fallbacks (default)');
    console.log('  node generate-theme-webflow.js');
    console.log('  node generate-theme-webflow.js --dark\n');
    console.log('  # Use light mode fallbacks');
    console.log('  node generate-theme-webflow.js --light\n');
    console.log('  # Specify input and mode');
    console.log('  node generate-theme-webflow.js amethyst_haze-webflow.css --light\n');
    console.log('What This Does:');
    console.log('  • Reads variables from input file (--_color---background, etc.)');
    console.log('  • Generates @theme block with var() references and fallbacks');
    console.log('  • Example: --color-background: var(--_color---background, #faf7f5);');
    console.log('  • Webflow Designer variables override when present');
    console.log('  • Fallback values used in Next.js and when Webflow vars not set\n');
    process.exit(0);
  }

  // Parse mode flag
  const useLight = args.includes('--light');
  const useDark = args.includes('--dark');
  const mode = useLight ? 'light' : 'dark'; // Default to dark

  // Filter out mode flags from args
  const filteredArgs = args.filter(arg => arg !== '--light' && arg !== '--dark');

  let inputFile = filteredArgs[0];
  let outputFile = filteredArgs[1];

  // Default input: lib/styles/variables/default.css
  if (!inputFile) {
    inputFile = path.resolve('lib/styles/variables/default.css');
    console.log('ℹ️  No input specified. Using default variables file...\n');
  } else if (!path.isAbsolute(inputFile)) {
    // If input doesn't start with ./ or ../, assume it's in lib/styles/variables/
    if (!inputFile.startsWith('./') && !inputFile.startsWith('../')) {
      inputFile = path.join('lib/styles/variables', inputFile);
    }
    inputFile = path.resolve(inputFile);
  }

  // Default output: lib/styles/theme/theme.webflow.css
  if (!outputFile) {
    outputFile = path.resolve('lib/styles/theme/theme.webflow.css');
    console.log('ℹ️  No output specified. Using default theme file...\n');
  } else if (!path.isAbsolute(outputFile)) {
    // If output doesn't start with ./ or ../, assume it's in lib/styles/theme/
    if (!outputFile.startsWith('./') && !outputFile.startsWith('../')) {
      outputFile = path.join('lib/styles/theme', outputFile);
    }
    outputFile = path.resolve(outputFile);
  }

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: Input file '${inputFile}' not found.\n`);
    console.log('💡 Tips:');
    console.log('   • Make sure the file path is correct');
    console.log('   • Try using an absolute path or ./ prefix');
    console.log('   • Run without arguments to use default: lib/styles/variables/default.css\n');
    console.log('Current directory:', process.cwd());
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    console.log(`📁 Creating output directory: ${outputDir}\n`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🔄 Generating Webflow theme with fallbacks...\n');
  console.log(`📥 Input:  ${path.relative(process.cwd(), inputFile)}`);
  console.log(`📤 Output: ${path.relative(process.cwd(), outputFile)}`);
  console.log(`🎨 Mode:   ${mode}\n`);

  // Read input file
  const cssContent = fs.readFileSync(inputFile, 'utf8');

  // Parse variables based on mode
  let variables;
  if (mode === 'light') {
    variables = parseRootVariables(cssContent);
    console.log(`📊 Found ${variables.size} variables in :root block\n`);
  } else {
    variables = parseDarkVariables(cssContent);
    console.log(`📊 Found ${variables.size} variables in .dark block\n`);
  }

  // Generate theme block
  const themeContent = generateThemeBlock(variables);

  // Write theme output
  fs.writeFileSync(outputFile, themeContent, 'utf8');

  console.log('✅ Theme generation complete!\n');
  console.log('📋 Generated format:');
  console.log('   --color-background: var(--_color---background, #fallback);');
  console.log('   --color-primary: var(--_color---primary, #fallback);');
  console.log('   --font-sans: var(--_font---sans, Poppins, sans-serif);\n');
  console.log('🎯 How it works:');
  console.log('   ✅ Webflow Designer variables override when present');
  console.log('   ✅ Webflow "modes" feature handles light/dark automatically');
  console.log(`   ✅ Fallback values from ${mode} mode used when no Designer vars\n`);
  console.log('🎉 Your theme file is ready!');
  console.log(`📄 File: ${path.relative(process.cwd(), outputFile)}\n`);
  console.log('Next steps:');
  console.log('   1. Set up variables in Webflow Designer (optional)');
  console.log('      Variable names: --_color---background, --_color---primary, etc.');
  console.log('      Use Webflow\'s "modes" feature to set different values for light/dark');
  console.log('   2. Bundle and test: pnpm webflow:bundle');
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = { parseRootVariables, parseDarkVariables, generateThemeBlock };
