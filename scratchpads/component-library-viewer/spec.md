# Feature: Component Library Viewer

## Overview
Create a functional component library browser that displays all Webflow components organized by library, with detailed individual component pages showing metadata, usage instructions, and dependencies.

## Goals
- Display component grid organized by library (core, analytics, interactive, webcn, waitlist)
- Show component cards with name, description, and library badge
- Create individual component detail pages accessible via `?id=[component_id]`
- Extend registry to include rich component metadata beyond just filenames
- Make it easy to browse and understand available components

## Technical Approach

### 1. Extend Registry Types

Add component metadata to `src/libraries/types.ts`:
```typescript
export interface ComponentMetadata {
  id: string;                    // Unique identifier (e.g., "core-login-form")
  name: string;                  // Display name (e.g., "Login Form")
  description: string;           // Brief description
  category?: string;             // Optional category within library
  dependencies?: string[];       // npm packages used
  props?: ComponentProp[];       // Component props documentation
  usageExample?: string;         // Code example
  tags?: string[];              // Searchable tags
}

export interface ComponentProp {
  name: string;
  type: string;                  // "Text" | "Number" | "Boolean" | "Variant"
  description: string;
  defaultValue?: any;
  required?: boolean;
}

export interface LibraryConfig {
  // Existing fields...
  components?: ComponentMetadata[];  // NEW: Component metadata
}
```

### 2. Update Each Library Config

Add component metadata to each library's `index.ts`:
```typescript
// Example: src/libraries/core/index.ts
export const coreLibrary: LibraryConfig = {
  name: "BlogFlow Core",
  description: "Core authentication, posts, and navigation components",
  id: "blogflow-core",

  components: [
    {
      id: "core-login-form",
      name: "Login Form",
      description: "User authentication form with email/password",
      category: "Authentication",
      dependencies: ["@tanstack/react-query"],
      props: [
        {
          name: "redirectPath",
          type: "Text",
          description: "Path to redirect after successful login",
          defaultValue: "/dashboard",
          required: false
        }
      ],
      usageExample: `<LoginFormWrapper redirectPath="/dashboard" />`,
      tags: ["auth", "form", "login"]
    },
    // ... more components
  ],

  // Existing fields...
};
```

### 3. Create Component Data Helper

Add utility to fetch component data from registry:
```typescript
// lib/registry-utils.ts
import { libraries } from "@/src/libraries/registry.config";
import type { ComponentMetadata, LibraryKey } from "@/src/libraries/types";

export function getAllComponents(): Array<ComponentMetadata & { libraryKey: LibraryKey }> {
  const allComponents = [];

  for (const [key, library] of Object.entries(libraries)) {
    if (library.components) {
      library.components.forEach(component => {
        allComponents.push({
          ...component,
          libraryKey: key as LibraryKey
        });
      });
    }
  }

  return allComponents;
}

export function getComponentById(id: string) {
  const allComponents = getAllComponents();
  return allComponents.find(c => c.id === id);
}

export function getComponentsByLibrary(libraryKey: LibraryKey) {
  const library = libraries[libraryKey];
  return library.components || [];
}
```

### 4. Update ComponentGrid Component

Modify `components/ComponentGrid.tsx` to fetch real data:
```typescript
'use client';

import { getAllComponents } from "@/lib/registry-utils";
import { libraries } from "@/src/libraries/registry.config";

export default function ComponentGrid() {
  const allComponents = getAllComponents();
  const libraryKeys = Object.keys(libraries);

  // Group components by library
  const componentsByLibrary = libraryKeys.map(key => ({
    libraryKey: key,
    libraryName: libraries[key].name,
    components: allComponents.filter(c => c.libraryKey === key)
  }));

  return (
    <div className="space-y-12">
      {componentsByLibrary.map(({ libraryKey, libraryName, components }) => (
        <section key={libraryKey}>
          <h2 className="text-2xl font-bold mb-4">{libraryName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map(component => (
              <ComponentCard key={component.id} component={component} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

### 5. Create ComponentCard Component

```typescript
// components/ComponentCard.tsx
interface ComponentCardProps {
  component: ComponentMetadata & { libraryKey: string };
}

export function ComponentCard({ component }: ComponentCardProps) {
  return (
    <a
      href={`/lander/webcn/component?id=${component.id}`}
      className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold">{component.name}</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
          {component.libraryKey}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{component.description}</p>
      {component.tags && (
        <div className="flex flex-wrap gap-1">
          {component.tags.map(tag => (
            <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
```

### 6. Create Component Detail Page

```typescript
// app/(demos)/lander/webcn/component/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { getComponentById } from '@/lib/registry-utils';

export default function ComponentDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const component = id ? getComponentById(id) : null;

  if (!component) {
    return <div>Component not found</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-4">{component.name}</h1>
      <p className="text-muted-foreground mb-6">{component.description}</p>

      {/* Props documentation */}
      {component.props && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Props</h2>
          <table className="w-full">
            {component.props.map(prop => (
              <tr key={prop.name}>
                <td className="font-mono text-sm">{prop.name}</td>
                <td>{prop.type}</td>
                <td>{prop.description}</td>
              </tr>
            ))}
          </table>
        </section>
      )}

      {/* Usage example */}
      {component.usageExample && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Usage</h2>
          <pre className="bg-muted p-4 rounded">
            <code>{component.usageExample}</code>
          </pre>
        </section>
      )}

      {/* Dependencies */}
      {component.dependencies && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Dependencies</h2>
          <ul>
            {component.dependencies.map(dep => (
              <li key={dep} className="font-mono text-sm">{dep}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

## Libraries Affected

- **webcn**: ComponentGrid component needs updating
- **ALL libraries**: Need to add component metadata to their configs

## Backend Requirements

- **oRPC Endpoints**: None (client-side only)
- **Database Schema**: None
- **Environment Variables**: None

## Components to Create/Modify

1. **Modify**: `src/libraries/types.ts` - Add ComponentMetadata interface
2. **Create**: `lib/registry-utils.ts` - Helper functions for component data
3. **Modify**: `components/ComponentGrid.tsx` - Fetch real data from registry
4. **Create**: `components/ComponentCard.tsx` - Component card UI
5. **Create**: `app/(demos)/lander/webcn/component/page.tsx` - Detail page
6. **Modify**: `src/libraries/core/index.ts` - Add component metadata
7. **Modify**: `src/libraries/analytics/index.ts` - Add component metadata
8. **Modify**: `src/libraries/interactive/index.ts` - Add component metadata
9. **Modify**: `src/libraries/webcn/index.ts` - Add component metadata
10. **Modify**: `src/libraries/waitlist/index.ts` - Add component metadata

## Test Pages

- Existing: `app/(demos)/lander/webcn/page.tsx` - Test ComponentGrid
- New: `app/(demos)/lander/webcn/component/page.tsx` - Test detail page

## Dependencies

- None (uses existing libraries)

## Success Criteria

- [ ] ComponentGrid displays real components from registry
- [ ] Components are grouped by library
- [ ] Each component card shows name, description, and tags
- [ ] Clicking a card navigates to component detail page
- [ ] Detail page shows full metadata (props, usage, dependencies)
- [ ] All existing components have metadata defined
- [ ] Test page renders correctly

## Open Questions

- Should we auto-generate component metadata from .webflow.tsx files, or manually define it?
  - **Decision**: Manual for now (more control, better documentation)
- Should component detail pages show live previews?
  - **Future enhancement**: Yes, but not in initial implementation

## Timeline Estimate

~2 hours:
- 30 min: Extend types and update library configs
- 30 min: Create registry utils and ComponentCard
- 30 min: Update ComponentGrid to use real data
- 30 min: Create component detail page and test
