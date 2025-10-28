#!/usr/bin/env node

/**
 * CSS Variable Transformer for Webflow
 * 
 * Transforms standard shadcn CSS variables to Webflow-compatible format:
 * --variable-name  =>  --_category---variable-name
 * 
 * Usage: node transform-css-vars.js [input.css] [output.css]
 * Or: ./transform-css-vars.js [input.css] [output.css]
 */

const fs = require('fs');
const path = require('path');

// Transformation rules mapping variable prefixes to their categories
const TRANSFORMATION_RULES = {
  // Colors
  'background': 'color',
  'foreground': 'color',
  'card': 'color',
  'card-foreground': 'color',
  'popover': 'color',
  'popover-foreground': 'color',
  'primary': 'color',
  'primary-foreground': 'color',
  'secondary': 'color',
  'secondary-foreground': 'color',
  'muted': 'color',
  'muted-foreground': 'color',
  'accent': 'color',
  'accent-foreground': 'color',
  'destructive': 'color',
  'destructive-foreground': 'color',
  'border': 'color',
  'input': 'color',
  'ring': 'color',
  'chart-1': 'color',
  'chart-2': 'color',
  'chart-3': 'color',
  'chart-4': 'color',
  'chart-5': 'color',
  'sidebar': 'color',
  'sidebar-foreground': 'color',
  'sidebar-primary': 'color',
  'sidebar-primary-foreground': 'color',
  'sidebar-accent': 'color',
  'sidebar-accent-foreground': 'color',
  'sidebar-border': 'color',
  'sidebar-ring': 'color',
  
  // Fonts
  'font-sans': 'font',
  'font-serif': 'font',
  'font-mono': 'font',
  
  // Radius (special case - becomes "value")
  'radius': 'radius---value',
  
  // Shadows
  'shadow-x': 'shadow',
  'shadow-y': 'shadow',
  'shadow-blur': 'shadow',
  'shadow-spread': 'shadow',
  'shadow-opacity': 'shadow',
  'shadow-color': 'shadow',
  'shadow-2xs': 'shadow',
  'shadow-xs': 'shadow',
  'shadow-sm': 'shadow',
  'shadow': 'shadow---default', // Special case for plain --shadow
  'shadow-md': 'shadow',
  'shadow-lg': 'shadow',
  'shadow-xl': 'shadow',
  'shadow-2xl': 'shadow',
  
  // Other
  'tracking-normal': 'tracking',
  'spacing': 'spacing---value',
};

/**
 * Transform a single variable name
 */
function transformVariableName(varName) {
  // Remove leading dashes
  const cleanName = varName.replace(/^--/, '');
  
  // Check for exact matches first (for special cases)
  if (TRANSFORMATION_RULES.hasOwnProperty(cleanName)) {
    const category = TRANSFORMATION_RULES[cleanName];
    
    // Handle special cases that already include the suffix
    if (category.includes('---')) {
      return `--_${category}`;
    }
    
    // For fonts, remove the 'font-' prefix from the variable name
    if (category === 'font' && cleanName.startsWith('font-')) {
      const fontName = cleanName.replace(/^font-/, '');
      return `--_${category}---${fontName}`;
    }
    
    // For shadows (except special shadow---default case), remove 'shadow-' prefix
    if (category === 'shadow' && cleanName.startsWith('shadow-')) {
      const shadowName = cleanName.replace(/^shadow-/, '');
      return `--_${category}---${shadowName}`;
    }
    
    // Normal transformation
    return `--_${category}---${cleanName}`;
  }
  
  // If no match found, return original (shouldn't happen with complete rules)
  console.warn(`⚠️  Warning: No transformation rule found for ${varName}`);
  return varName;
}

/**
 * Extract only :root and .dark sections from CSS
 */
function extractRootAndDarkSections(cssContent) {
  const sections = [];
  
  // Match :root block
  const rootMatch = cssContent.match(/:root\s*\{[^}]*\}/s);
  if (rootMatch) {
    sections.push(rootMatch[0]);
  }
  
  // Match .dark block
  const darkMatch = cssContent.match(/\.dark\s*\{[^}]*\}/s);
  if (darkMatch) {
    sections.push(darkMatch[0]);
  }
  
  // Join sections with double newline
  return sections.join('\n\n') + '\n';
}

/**
 * Transform CSS variable declarations in :root and .dark blocks
 */
function transformCSSVariables(cssContent) {
  // First, extract only :root and .dark sections
  const filteredContent = extractRootAndDarkSections(cssContent);
  
  // Transform variable declarations (--var: value;)
  let transformed = filteredContent.replace(
    /^(\s*)(--[a-z0-9-]+)(\s*:\s*)/gm,
    (match, indent, varName, colon) => {
      const transformedName = transformVariableName(varName);
      return `${indent}${transformedName}${colon}`;
    }
  );
  
  // Transform variable references (var(--var))
  transformed = transformed.replace(
    /var\((--[a-z0-9-]+)\)/g,
    (match, varName) => {
      const transformedName = transformVariableName(varName);
      return `var(${transformedName})`;
    }
  );
  
  return transformed;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  // Show help if no arguments or help flag
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('🎨 CSS Variable Transformer for Webflow\n');
    console.log('Usage:');
    console.log('  node transform-css-vars.js <input.css> [output.css] [--apply]');
    console.log('  ./transform-css-vars.js <input.css> [output.css] [--apply]\n');
    console.log('Arguments:');
    console.log('  input.css   - Path to your input CSS file (required)');
    console.log('  output.css  - Path for the transformed CSS file (optional)');
    console.log('  --apply     - Apply transformed theme as defaults to lib/styles/variables/default.css\n');
    console.log('Examples:');
    console.log('  # Short form (recommended for lib/styles structure)');
    console.log('  node transform-css-vars.js amethyst_haze.css');
    console.log('  → Input: lib/styles/tweakcn/amethyst_haze.css');
    console.log('  → Output: lib/styles/variables/amethyst_haze-webflow.css\n');
    console.log('  # Apply theme as defaults');
    console.log('  node transform-css-vars.js amethyst_haze.css --apply');
    console.log('  → Transforms and applies to lib/styles/variables/default.css\n');
    console.log('  # Custom output filename');
    console.log('  node transform-css-vars.js amethyst_haze.css custom-theme.css');
    console.log('  → Output: lib/styles/variables/custom-theme.css\n');
    console.log('  # Full paths (for files outside lib/styles)');
    console.log('  node transform-css-vars.js ./app/globals.css ./public/webflow.css');
    console.log('  node transform-css-vars.js ./src/styles/theme.css ./dist/webflow-theme.css\n');
    console.log('Default Behavior:');
    console.log('  • Input: If path doesn\'t start with ./ or ../, assumes lib/styles/tweakcn/');
    console.log('  • Output: If not specified, creates <name>-webflow.css in lib/styles/variables/');
    console.log('  • The --apply flag overwrites lib/styles/variables/default.css with the transformed content');
    process.exit(0);
  }
  
  // Parse arguments
  const applyFlag = args.includes('--apply');
  const filteredArgs = args.filter(arg => arg !== '--apply');
  
  let inputFile = filteredArgs[0];
  let outputFile = filteredArgs[1];
  
  // Handle default paths within lib/styles structure
  if (inputFile && !path.isAbsolute(inputFile)) {
    // If input doesn't start with ./ or ../, assume it's relative to lib/styles/tweakcn/
    if (!inputFile.startsWith('./') && !inputFile.startsWith('../')) {
      inputFile = path.join('lib/styles/tweakcn', inputFile);
    }
  }
  
  // Resolve relative paths
  inputFile = path.resolve(inputFile);
  
  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: Input file '${inputFile}' not found.\n`);
    console.log('💡 Tips:');
    console.log('   • Make sure the file path is correct');
    console.log('   • Try using an absolute path or ./ prefix');
    console.log('   • Check if you\'re running from the correct directory\n');
    console.log('Current directory:', process.cwd());
    process.exit(1);
  }
  
  // If no output specified, create one based on input name
  if (!outputFile) {
    const parsed = path.parse(inputFile);
    // Default output to lib/styles/variables/ directory
    const defaultOutputDir = path.resolve('lib/styles/variables');
    outputFile = path.join(defaultOutputDir, `${parsed.name}-webflow${parsed.ext}`);
    console.log('ℹ️  No output path specified. Using default...\n');
  } else {
    // Handle default output path within lib/styles structure
    if (!path.isAbsolute(outputFile)) {
      // If output doesn't start with ./ or ../, assume it's relative to lib/styles/variables/
      if (!outputFile.startsWith('./') && !outputFile.startsWith('../')) {
        outputFile = path.join('lib/styles/variables', outputFile);
      }
    }
    // Resolve output path
    outputFile = path.resolve(outputFile);
  }
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    console.log(`📁 Creating output directory: ${outputDir}\n`);
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('🔄 Transforming CSS variables...\n');
  console.log(`📥 Input:  ${path.relative(process.cwd(), inputFile)}`);
  console.log(`📤 Output: ${path.relative(process.cwd(), outputFile)}`);
  console.log(`🧹 Filter: Extracting only :root and .dark sections\n`);
  
  // Read input file
  const cssContent = fs.readFileSync(inputFile, 'utf8');
  
  // Transform
  const transformed = transformCSSVariables(cssContent);
  
  // Write output
  fs.writeFileSync(outputFile, transformed, 'utf8');
  
  // Handle --apply flag
  if (applyFlag) {
    const defaultCssPath = path.resolve('lib/styles/variables/default.css');
    
    // Ensure the default.css directory exists
    const defaultDir = path.dirname(defaultCssPath);
    if (!fs.existsSync(defaultDir)) {
      console.log(`📁 Creating default directory: ${defaultDir}\n`);
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    
    // Write transformed content to default.css
    fs.writeFileSync(defaultCssPath, transformed, 'utf8');
    console.log(`🎯 Applied theme as defaults to: ${path.relative(process.cwd(), defaultCssPath)}`);
  }
  
  console.log('✅ Transformation complete!\n');
  console.log('📋 Variable format changed:');
  console.log('   --background     →  --_color---background');
  console.log('   --primary        →  --_color---primary');
  console.log('   --font-sans      →  --_font---sans');
  console.log('   --radius         →  --_radius---value');
  console.log('   --shadow         →  --_shadow---default\n');
  console.log('🎉 Your Webflow-compatible CSS is ready!');
  console.log(`📄 File saved to: ${path.relative(process.cwd(), outputFile)}`);
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

module.exports = { transformVariableName, transformCSSVariables, extractRootAndDarkSections };