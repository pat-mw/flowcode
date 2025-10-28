/**
 * CSS Variable Utilities
 *
 * Helper functions for working with CSS variables (custom properties) in Webflow Code Components.
 * These utilities ensure proper var() syntax and provide fallback values for robustness.
 */

/**
 * Converts a CSS variable name to proper var() syntax with fallback.
 * Handles both input formats: "--variable-name" and "var(--variable-name)".
 *
 * This utility is essential for Webflow Code Components because:
 * - CSS variables cross Shadow DOM boundaries (unlike most CSS)
 * - Designers can use their Webflow site's Variables panel colors
 * - Fallbacks ensure graceful degradation when variables don't exist
 *
 * @param varName - CSS variable name (with or without var() wrapper)
 * @param fallback - Fallback value when CSS variable is not defined
 * @returns Properly formatted CSS var() string with fallback
 *
 * @example
 * // Input: "--background-primary"
 * toCssVar("--background-primary", "white")
 * // Returns: "var(--background-primary, white)"
 *
 * @example
 * // Input already wrapped (user entered "var(--text-color)")
 * toCssVar("var(--text-color)", "black")
 * // Returns: "var(--text-color, black)"
 *
 * @example
 * // Usage in component
 * <div style={{ backgroundColor: toCssVar(cardBgVar, 'white') }}>
 *   Content
 * </div>
 */
export function toCssVar(varName: string, fallback: string): string {
  // Already in var() format - return as-is
  if (varName.startsWith('var(')) {
    return varName;
  }
  // Convert to var() format with fallback
  return `var(${varName}, ${fallback})`;
}

/**
 * Batch converts multiple CSS variables to proper var() syntax.
 * Useful when applying multiple CSS variables at once.
 *
 * @param variables - Object mapping property names to { varName, fallback }
 * @returns Object with same keys, values converted to var() syntax
 *
 * @example
 * const styles = toCssVars({
 *   backgroundColor: { varName: '--bg-primary', fallback: 'white' },
 *   color: { varName: '--text-primary', fallback: 'black' },
 *   borderColor: { varName: '--border-subtle', fallback: '#e5e7eb' }
 * });
 * // Returns:
 * // {
 * //   backgroundColor: 'var(--bg-primary, white)',
 * //   color: 'var(--text-primary, black)',
 * //   borderColor: 'var(--border-subtle, #e5e7eb)'
 * // }
 *
 * <div style={styles}>Content</div>
 */
export function toCssVars(
  variables: Record<string, { varName: string; fallback: string }>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, { varName, fallback }] of Object.entries(variables)) {
    result[key] = toCssVar(varName, fallback);
  }
  return result;
}
