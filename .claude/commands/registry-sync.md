# Registry Sync Command

**Purpose:** Synchronize component metadata across all libraries in the multi-library registry system. This command discovers all Webflow components, extracts their metadata from the source code, and ensures the `componentMetadata` array in each library's config file is accurate and up-to-date.

## Overview

The registry sync process ensures that the component metadata in each library's config file (`index.ts` or `config.ts`) accurately reflects the actual Webflow components (`.webflow.tsx` files) in that library. This metadata powers:
- Component library dashboards
- Documentation generation
- Dependency tracking
- Backend API usage mapping

## Execution Protocol

### Phase 1: Discovery

**Step 1.1: Find All Libraries**

```bash
# List all library directories
ls -d src/libraries/*/
```

Expected directories:
- `src/libraries/core/`
- `src/libraries/analytics/`
- `src/libraries/interactive/`
- `src/libraries/webcn/`
- `src/libraries/waitlist/`
- `src/libraries/registryDashboard/`

**Step 1.2: For Each Library, Locate Config File**

Check for config file in this order:
1. `src/libraries/{library}/index.ts` (contains LibraryConfig export)
2. `src/libraries/{library}/config.ts` (alternative location)

**Identify the config export:**
- Look for `export const {library}Library: LibraryConfig = { ... }`
- Example: `export const coreLibrary: LibraryConfig = { ... }`

**Step 1.3: Read webflow.json Manifest**

```bash
# For each library
cat src/libraries/{library}/webflow.json
```

**Extract component glob pattern:**
- JSON path: `library.components[0]`
- Example: `"./src/libraries/core/**/*.webflow.@(ts|tsx)"`
- This pattern is relative to project root

### Phase 2: Component Discovery

**Step 2.1: Use Glob Pattern to Find Components**

For each library, use the glob pattern from `webflow.json` to find all `.webflow.tsx` files:

```typescript
// Example pattern: "./src/libraries/core/**/*.webflow.@(ts|tsx)"
// Resolve to: src/libraries/core/components/*.webflow.tsx
```

**Step 2.2: List Found Components**

For each library, output:
```
Library: core
Pattern: ./src/libraries/core/**/*.webflow.@(ts|tsx)
Found components:
  - src/libraries/core/components/LoginForm.webflow.tsx
  - src/libraries/core/components/RegistrationForm.webflow.tsx
  - src/libraries/core/components/PostEditor.webflow.tsx
  - ...
```

### Phase 3: Extract Component Metadata

For **each component file** found, extract metadata by analyzing the source code:

**Step 3.1: Read Component File**

Read the entire `.webflow.tsx` file.

**Step 3.2: Extract declareComponent() Metadata**

Look for the `declareComponent()` call (usually at the end of file):

```typescript
export default declareComponent(ComponentWrapper, {
  name: 'Component Name',
  description: 'Component description',
  group: 'Category',
  props: {
    prop1: props.Text({ ... }),
    prop2: props.Number({ ... }),
    ...
  }
});
```

**Extract these fields:**
1. **name**: The display name (from `name` field)
2. **description**: Component description (from `description` field)
3. **category**: Component category (from `group` field)
4. **props**: Array of prop definitions (parse from `props` object)

**Step 3.3: Extract Props Metadata**

For each prop in the `props` object, build a `ComponentProp` object:

```typescript
interface ComponentProp {
  name: string;              // Key from props object
  type: "Text" | "Number" | "Boolean" | "Variant" | "JSON";  // From props.Type()
  description: string;       // From tooltip or name field
  defaultValue?: unknown;    // From defaultValue field
  required?: boolean;        // Infer from structure
  options?: Array<{ label: string; value: string }>;  // For Variant type
}
```

**Prop type mapping:**
- `props.Text(...)` → `type: "Text"`
- `props.Number(...)` → `type: "Number"`
- `props.Boolean(...)` → `type: "Boolean"`
- `props.Variant(...)` → `type: "Variant"` (also extract options array)
- `props.JSON(...)` → `type: "JSON"`

**Step 3.4: Infer Dependencies**

Scan the import statements to identify dependencies:

```typescript
// Look for these imports:
import ... from '@tanstack/react-query';  // → dependency: "@tanstack/react-query"
import ... from '@tiptap/react';          // → dependency: "@tiptap/react"
import ... from 'lucide-react';           // → dependency: "lucide-react"
import ... from '@react-three/fiber';     // → dependency: "@react-three/fiber"
import ... from '@react-three/drei';      // → dependency: "@react-three/drei"
import ... from '@react-three/rapier';    // → dependency: "@react-three/rapier"
// etc.
```

**Filter out internal dependencies:**
- Ignore imports from `@/...` (internal modules)
- Ignore imports from `react`, `react-dom` (core dependencies)
- Only include third-party npm packages

**Step 3.5: Infer Backend Dependencies**

**This requires manual analysis or user input.** Backend dependencies are oRPC endpoints the component calls.

**Heuristic approach:**
1. Search component file for `orpc.` or `client.` calls
2. Identify patterns like `orpc.auth.signIn`, `orpc.posts.create`
3. Extract endpoint names as strings (e.g., `"auth.signIn.email"`, `"posts.create"`)

**Manual approach:**
- Ask user to specify backend endpoints for each component
- Or reference existing metadata as a guide

**Step 3.6: Generate Component ID**

Generate a unique ID for the component:

```typescript
// Format: "{library-name}-{component-name-kebab-case}"
// Example: "core-login-form", "waitlist-capture-form"

function generateComponentId(libraryKey: string, componentName: string): string {
  const kebab = componentName
    .replace(/([a-z])([A-Z])/g, '$1-$2')  // camelCase to kebab-case
    .toLowerCase()
    .replace(/\s+/g, '-');  // spaces to hyphens

  return `${libraryKey}-${kebab}`;
}
```

**Step 3.7: Generate Usage Example**

```typescript
// Format: <{ComponentWrapperName} {prop1}="value" {prop2}={value} />
// Example: <LoginFormWrapper redirectTo="/dashboard" />

function generateUsageExample(wrapperName: string, props: ComponentProp[]): string {
  const propsStr = props
    .filter(p => !p.required) // Show optional props with defaults
    .slice(0, 2) // Max 2 props for brevity
    .map(p => {
      if (p.type === "Text") return `${p.name}="${p.defaultValue}"`;
      if (p.type === "Number" || p.type === "Boolean") return `${p.name}={${p.defaultValue}}`;
      return `${p.name}={...}`;
    })
    .join(' ');

  return `<${wrapperName} ${propsStr} />`;
}
```

**Step 3.8: Infer Tags**

Generate searchable tags based on component name, category, and purpose:

```typescript
// Lowercase keywords from:
// - Component name words
// - Category
// - Common keywords (form, dashboard, chart, editor, etc.)

// Example for "Login Form":
// ["login", "form", "auth", "authentication", "signin"]
```

**Step 3.9: Build ComponentMetadata Object**

Combine all extracted data:

```typescript
interface ComponentMetadata {
  id: string;                     // Generated in step 3.6
  name: string;                   // From declareComponent name
  description: string;            // From declareComponent description
  category?: string;              // From declareComponent group
  dependencies?: string[];        // Inferred from imports (step 3.4)
  backendDependencies?: string[]; // Inferred or manual (step 3.5)
  props?: ComponentProp[];        // Extracted from props (step 3.3)
  usageExample?: string;          // Generated (step 3.7)
  tags?: string[];                // Generated (step 3.8)
  filePath?: string;              // Relative path from project root
  previewImage?: string;          // Optional, leave undefined
}
```

### Phase 4: Compare with Existing Metadata

**Step 4.1: Read Current componentMetadata Array**

From the library's config file (`index.ts` or `config.ts`), extract the current `componentMetadata` array.

**Step 4.2: Build Comparison Map**

Create a map of existing metadata by component ID:

```typescript
const existingMap = new Map<string, ComponentMetadata>();
for (const metadata of currentComponentMetadata) {
  existingMap.set(metadata.id, metadata);
}
```

**Step 4.3: Identify Changes**

For each discovered component:

1. **Missing component**: Component file exists but no metadata entry
   - Action: ADD to componentMetadata

2. **Stale metadata**: Metadata exists but component file not found
   - Action: REMOVE from componentMetadata

3. **Outdated metadata**: Component exists and metadata exists, but values differ
   - Action: UPDATE metadata entry
   - Compare: name, description, category, props, dependencies
   - Note: backendDependencies may need manual review

4. **Correct metadata**: Component exists, metadata exists, all values match
   - Action: KEEP (no change)

### Phase 5: Generate Report

**Step 5.1: Summary Report**

For each library, output:

```markdown
## Library: {library-name}

### Status
- ✅ Components scanned: X
- ➕ Components to ADD: Y
- 🔄 Components to UPDATE: Z
- ❌ Components to REMOVE: W
- ✔️ Components up-to-date: V

### Actions Required

#### ➕ ADD (Y components)
1. **Component Name** (`src/libraries/{library}/components/File.webflow.tsx`)
   - ID: `{generated-id}`
   - Category: {category}
   - Props: {prop count}
   - Reason: New component not in metadata

#### 🔄 UPDATE (Z components)
1. **Component Name** (`{id}`)
   - File: `src/libraries/{library}/components/File.webflow.tsx`
   - Changes:
     - name: "Old Name" → "New Name"
     - props: 2 → 3 (added: propX)
     - dependencies: [...] → [...]

#### ❌ REMOVE (W components)
1. **Component Name** (`{id}`)
   - Reason: Metadata exists but component file not found at `{filePath}`
```

**Step 5.2: Detailed Metadata Output**

For each component that needs to be ADDED or UPDATED, output the complete `ComponentMetadata` object in TypeScript format:

```typescript
// ADD: Login Form
{
  id: "core-login-form",
  name: "Login Form",
  description: "User authentication login form with Better Auth integration",
  category: "Authentication",
  dependencies: ["@tanstack/react-query", "lucide-react"],
  backendDependencies: ["auth.signIn.email"], // ⚠️ Manually verify
  props: [
    {
      name: "redirectTo",
      type: "Text",
      description: "URL to redirect to after successful login",
      defaultValue: "/dashboard",
      required: false,
    },
    {
      name: "showGoogleAuth",
      type: "Boolean",
      description: "Display Google OAuth sign-in button",
      defaultValue: true,
      required: false,
    },
  ],
  usageExample: `<LoginFormWrapper redirectTo="/dashboard" showGoogleAuth={true} />`,
  tags: ["login", "form", "auth", "authentication", "signin"],
  filePath: "src/libraries/core/components/LoginForm.webflow.tsx",
},
```

### Phase 6: Apply Updates (Optional)

**⚠️ IMPORTANT: Always show the report first and ask for user confirmation before applying changes.**

**Step 6.1: Ask User for Confirmation**

```
Found X changes across Y libraries. Would you like me to:
1. Show detailed report only (recommended first)
2. Apply all changes automatically
3. Apply changes library by library (with confirmation)
4. Apply specific changes only

Please confirm before I modify any files.
```

**Step 6.2: Apply Changes**

If user confirms, update the config files:

1. **For ADDs:**
   - Insert new ComponentMetadata object into componentMetadata array
   - Maintain alphabetical order by ID

2. **For UPDATEs:**
   - Replace existing metadata object with updated version
   - Preserve manually-curated fields:
     - backendDependencies (only update if explicitly confirmed)
     - previewImage (never overwrite)
     - Any custom tags user may have added

3. **For REMOVEs:**
   - Remove metadata object from array
   - Log the removed entry for user review

**Step 6.3: Format and Write**

- Preserve TypeScript formatting
- Maintain consistent indentation (2 spaces)
- Keep array items in alphabetical order by `id`
- Add comments for manual review items

**Step 6.4: Verification**

After updating files:
1. Run TypeScript compiler to verify no syntax errors: `npx tsc --noEmit`
2. Verify library config exports: `tsx -e "import { libraries } from './src/libraries/registry.config.js'; console.log(Object.keys(libraries));"`
3. Output success message with changed files list

## Usage Examples

### Example 1: Full Registry Sync

```
User: /registry-sync

Agent:
I'll perform a full registry sync across all libraries. Let me start by discovering all libraries...

[Phase 1: Discovery]
Found 6 libraries:
  ✓ core (config: index.ts)
  ✓ analytics (config: index.ts)
  ✓ interactive (config: index.ts)
  ✓ webcn (config: index.ts)
  ✓ waitlist (config: config.ts)
  ✓ registryDashboard (config: index.ts)

[Phase 2: Component Discovery]
Library: core
  Pattern: ./src/libraries/core/**/*.webflow.@(ts|tsx)
  Found 6 components:
    - LoginForm.webflow.tsx
    - RegistrationForm.webflow.tsx
    - PostEditor.webflow.tsx
    - Navigation.webflow.tsx
    - Dashboard.webflow.tsx
    - HelloUser.webflow.tsx

Library: waitlist
  Pattern: ./src/libraries/waitlist/**/*.webflow.@(ts|tsx)
  Found 2 components:
    - WaitlistCapture.webflow.tsx
    - WaitlistAdmin.webflow.tsx

[Continuing for all libraries...]

[Phase 3-4: Analysis]
Analyzing components and comparing with existing metadata...

## Summary Report

### Library: core
- ✅ Components scanned: 6
- ➕ Components to ADD: 0
- 🔄 Components to UPDATE: 2
- ❌ Components to REMOVE: 0
- ✔️ Components up-to-date: 4

### Actions Required for core:

#### 🔄 UPDATE (2 components)

1. **Login Form** (`core-login-form`)
   - File: src/libraries/core/components/LoginForm.webflow.tsx
   - Changes:
     - props: 1 → 2 (added: showGoogleAuth)
     - description: Updated to match current implementation

2. **Post Editor** (`core-post-editor`)
   - File: src/libraries/core/components/PostEditor.webflow.tsx
   - Changes:
     - dependencies: Added "@tiptap/react"

[... continues for all libraries ...]

Would you like me to:
1. Show detailed metadata for changes
2. Apply these updates automatically
3. Review each library individually
```

### Example 2: Single Library Sync

```
User: /registry-sync --library=waitlist

Agent:
I'll sync the waitlist library specifically.

[Phase 1: Discovery]
Library: waitlist
Config: src/libraries/waitlist/config.ts
webflow.json: ✓ Found

[Phase 2: Component Discovery]
Pattern: ./src/libraries/waitlist/**/*.webflow.@(ts|tsx)
Found 2 components:
  - WaitlistCapture.webflow.tsx
  - WaitlistAdmin.webflow.tsx

[Phase 3: Extract Metadata]
Analyzing WaitlistCapture.webflow.tsx...
  ✓ name: "Waitlist Capture"
  ✓ description: "Email capture form for waitlist signups..."
  ✓ category: "Forms"
  ✓ props: 2 (title, subtitle)
  ✓ dependencies: ["@tanstack/react-query", "lucide-react"]
  ⚠️ backendDependencies: Inferred ["waitlist.join"] - please verify

Analyzing WaitlistAdmin.webflow.tsx...
  ✓ name: "Waitlist Admin"
  ✓ description: "Admin dashboard for managing waitlist entries..."
  ✓ category: "Admin"
  ✓ props: 0
  ✓ dependencies: ["@tanstack/react-query", "lucide-react"]
  ⚠️ backendDependencies: Found multiple endpoints - please verify

[Phase 4: Compare]
Comparing with existing metadata in config.ts...

## Summary Report

### Library: waitlist
- ✅ Components scanned: 2
- ➕ Components to ADD: 0
- 🔄 Components to UPDATE: 0
- ❌ Components to REMOVE: 0
- ✔️ Components up-to-date: 2

✅ All metadata is current! No changes needed.
```

### Example 3: Report Only Mode

```
User: /registry-sync --report-only

Agent:
Running in report-only mode (no files will be modified).

[... full discovery and analysis ...]

## Final Report

Total across all libraries:
- ✅ Components scanned: 28
- ➕ Components to ADD: 3
- 🔄 Components to UPDATE: 5
- ❌ Components to REMOVE: 1
- ✔️ Components up-to-date: 19

### Components to ADD (3):

1. **ProfileEditor** (webcn library)
   File: src/libraries/webcn/components/ProfileEditor.webflow.tsx
   Generated ID: webcn-profile-editor
   Category: Forms

2. **PostsList** (core library)
   File: src/libraries/core/components/PostsList.webflow.tsx
   Generated ID: core-posts-list
   Category: Content

[... etc ...]

No files were modified (report-only mode).
To apply these changes, run: /registry-sync --apply
```

## Command Options

### Optional Flags

**`--library={name}`**
- Sync only the specified library
- Example: `--library=core`, `--library=waitlist`

**`--report-only`**
- Generate report without modifying files
- Safe dry-run mode for verification

**`--apply`**
- Automatically apply all changes without confirmation
- ⚠️ Use with caution - review report first

**`--verify-backend`**
- Prompt user to verify backend dependencies for each component
- Recommended for accuracy

**`--skip-backend`**
- Don't infer backend dependencies (leave existing values)
- Useful if backend dependencies are manually curated

### Example with Flags

```
/registry-sync --library=core --report-only
/registry-sync --apply --skip-backend
/registry-sync --library=waitlist --verify-backend
```

## Best Practices

### When to Run Registry Sync

Run this command when:
1. **After adding new components** - Ensure metadata is tracked
2. **After modifying component props** - Keep prop documentation current
3. **Before creating PR** - Verify all components are documented
4. **Weekly maintenance** - Keep registry clean and accurate
5. **After refactoring** - Update changed dependencies

### Before Applying Changes

**Always:**
1. Run in `--report-only` mode first
2. Review the generated metadata
3. Verify backend dependencies (they're inferred, may be incorrect)
4. Check for removed components (may be intentional renames)
5. Commit changes separately with clear commit message

### Manual Review Required For

**⚠️ These fields may need manual adjustment:**

1. **backendDependencies**
   - Auto-inference is heuristic-based
   - Verify endpoint names match oRPC router
   - Check for missing or extra endpoints

2. **tags**
   - Generated tags are keyword-based
   - Add domain-specific tags manually
   - Ensure searchability

3. **previewImage**
   - Never auto-generated
   - Add manually after taking screenshots

4. **category**
   - Inferred from `group` in declareComponent
   - May need standardization across libraries

### Maintaining Consistency

**Standard categories across libraries:**
- Authentication
- Content
- Forms
- Admin
- Dashboard
- Navigation
- Display
- Interactive
- Analytics

**Naming conventions:**
- Component IDs: `{library}-{component-name-kebab-case}`
- Component names: Title Case (e.g., "Login Form")
- File paths: Relative from project root

### After Running Sync

**Verification steps:**
1. Run TypeScript compiler: `npx tsc --noEmit`
2. Build libraries: `pnpm library:build:all`
3. Check git diff: Review changes before committing
4. Test import: `tsx -e "import { libraries } from './src/libraries/index.js'; console.log(Object.keys(libraries));"`
5. Commit with message: `chore: sync component metadata for {library} library`

## Troubleshooting

### Issue: Component Not Found by Glob Pattern

**Symptom:** Component file exists but not discovered

**Solution:**
1. Check `webflow.json` glob pattern
2. Verify component file matches pattern
3. Regenerate manifests: `pnpm library:manifests`
4. Check file extension (must be `.webflow.tsx` or `.webflow.ts`)

### Issue: Cannot Parse declareComponent()

**Symptom:** Metadata extraction fails for a component

**Solution:**
1. Verify component follows standard pattern
2. Check that `declareComponent()` is exported as default
3. Ensure props use `@webflow/data-types` prop types
4. Review syntax errors in component file

### Issue: Incorrect Dependencies Detected

**Symptom:** Dependencies list includes unwanted packages

**Solution:**
1. Check import statements in component
2. Filter out internal imports (`@/...`)
3. Remove React core packages
4. Manually adjust in metadata after sync

### Issue: Config File Not Found

**Symptom:** Library has no `index.ts` or `config.ts`

**Solution:**
1. Create config file following pattern
2. Export `LibraryConfig` with required fields
3. Register in `src/libraries/registry.config.ts`
4. Run `pnpm library:manifests` to generate webflow.json

### Issue: Backend Dependencies Inaccurate

**Symptom:** Backend endpoints don't match actual usage

**Solution:**
1. Run sync with `--verify-backend` flag
2. Manually review component source for API calls
3. Cross-reference with `app/api/[[...route]]/route.ts`
4. Update metadata after confirming correct endpoints

## Implementation Notes

### For Claude Code Agents

When implementing this command:

1. **Use Tool Priority:**
   - `Glob` tool for finding components by pattern
   - `Read` tool for parsing component files
   - `Edit` tool for updating config files (preserve formatting)

2. **AST Parsing Approach:**
   - Parse `declareComponent()` call using regex or simple string matching
   - Look for object literal passed as second argument
   - Extract `name`, `description`, `group`, `props` fields

3. **Props Parsing Strategy:**
   ```typescript
   // Look for pattern: propName: props.Type({ ... })
   const propsRegex = /(\w+):\s*props\.(Text|Number|Boolean|Variant|JSON)\({([^}]+)}\)/g;

   // Extract defaultValue, name, tooltip fields
   // Map to ComponentProp structure
   ```

4. **Dependency Detection:**
   ```typescript
   // Find all import statements
   const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;

   // Filter for third-party packages (not @/ or react/react-dom)
   const isThirdParty = (pkg: string) =>
     !pkg.startsWith('@/') &&
     !pkg.startsWith('.') &&
     pkg !== 'react' &&
     pkg !== 'react-dom';
   ```

5. **Error Handling:**
   - If parsing fails, report error but continue with other components
   - Provide partial metadata if some fields extracted successfully
   - Always show which components failed with specific error messages

6. **Formatting Preservation:**
   - When updating config files, use Edit tool with precise string matching
   - Maintain existing indentation (2 spaces)
   - Keep array order (alphabetical by ID)
   - Preserve comments

### Testing the Command

**Dry run first:**
```bash
/registry-sync --report-only
```

**Test single library:**
```bash
/registry-sync --library=core --report-only
```

**Verify no errors:**
```bash
npx tsc --noEmit
pnpm library:build:all
```

## Related Documentation

- **Multi-library system**: `@src/libraries/README.md`
- **Library types**: `@src/libraries/types.ts`
- **Component metadata interface**: `@src/libraries/types.ts` (ComponentMetadata)
- **Example library config**: `@src/libraries/core/index.ts`
- **Webflow component pattern**: `@CLAUDE.md` (Component Development Guidelines)

## Maintenance

**This command file should be updated when:**
1. ComponentMetadata interface changes in `types.ts`
2. New prop types added to `@webflow/data-types`
3. Library config structure changes
4. New standard categories defined
5. Discovery or parsing logic needs refinement

**Last updated:** 2025-11-03
**Maintainer:** Claude Code Agent
**Status:** Active