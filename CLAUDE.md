# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 project using React 19 that creates custom Webflow Code Components. Components are built in React/TypeScript and exported for use in Webflow sites via the Webflow CLI. The project uses Tailwind CSS for styling, shadcn/ui component library, and React Three Fiber for 3D components.

## Key Architecture Concepts

### Webflow Code Components Pattern

Components follow a dual-file pattern:

1. **Implementation Component** (`src/components/ComponentName.tsx` or `components/ComponentName.tsx`)
   - Contains the actual React component logic
   - Standard React component that can be used in the Next.js app

2. **Webflow Wrapper** (`src/components/ComponentName.webflow.tsx`)
   - Wraps the implementation component with Webflow-specific props
   - Uses `declareComponent()` from `@webflow/react` to define Webflow integration
   - Defines props using `@webflow/data-types` (props.Text, props.Number, props.Boolean, props.Variant)
   - Must import global styles: `import '@/app/globals.css'`
   - Exports component for use in Webflow

**Pattern:**
```typescript
// Component.tsx - Implementation
export default function Component({ prop1, prop2 }: Props) {
  return <div>...</div>;
}

// Component.webflow.tsx - Webflow wrapper
import Component from './Component';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import '@/app/globals.css';

export default declareComponent(Component, {
  name: 'ComponentName',
  description: 'Description for Webflow',
  group: 'Category',
  props: {
    prop1: props.Text({ name: "Prop 1", defaultValue: "value" }),
    prop2: props.Number({ name: "Prop 2", defaultValue: 0 })
  }
});
```

### Directory Structure

- `app/` - Next.js app router pages
- `src/components/` - Custom Webflow components (*.webflow.tsx files and their implementations)
- `components/` - Shared React components including shadcn/ui components (can also contain implementation components)
- `components/ui/` - shadcn/ui component library
- `lib/` - Utility functions and stores
- `lib/stores/` - Zustand state management stores (for cross-component state)
- `hooks/` - Custom React hooks
- `public/` - Static assets
- `docs/` - Extended documentation and architecture guides
- `webpack.webflow.js` - Webpack configuration for Webflow bundling
- `webflow.json` - Webflow CLI configuration
- `components.json` - shadcn/ui configuration

### Path Aliases

TypeScript is configured with `@/*` alias pointing to the project root:
- `@/components` → `components/`
- `@/lib` → `lib/`
- `@/app` → `app/`
- `@/hooks` → `hooks/`
- `@/assets` → `assets/`

### Technology Stack

- **Framework:** Next.js 15 with Turbopack
- **React:** Version 19
- **Styling:** Tailwind CSS v4 with shadcn/ui components
- **State Management:** Zustand (for cross-component state in Webflow)
- **3D Graphics:** React Three Fiber, Drei, Rapier (physics)
- **Webflow Integration:** @webflow/react, @webflow/data-types, @webflow/webflow-cli
- **Package Manager:** pnpm

## Development Commands

### Local Development
```bash
pnpm dev          # Start Next.js dev server with Turbopack
```

### Building
```bash
pnpm build        # Build Next.js app with Turbopack
pnpm start        # Start production server
```

### Linting
```bash
pnpm lint         # Run ESLint
```

### Webflow CLI
```bash
pnpm webflow:share    # Deploy components to Webflow (requires WEBFLOW_WORKSPACE_API_TOKEN)
```

The Webflow CLI is available via `@webflow/webflow-cli` for deploying components to Webflow. Requires `WEBFLOW_WORKSPACE_API_TOKEN` environment variable (see `env.example`).

## Environment Variables

Create a `.env` file based on `env.example`:
```
WEBFLOW_WORKSPACE_API_TOKEN="ws-xxxxx..."
```

## Component Development Guidelines

### Creating New Webflow Components

1. Create the implementation component in `src/components/ComponentName.tsx` (or `components/ComponentName.tsx`)
2. Create the Webflow wrapper in `src/components/ComponentName.webflow.tsx`
3. Use `declareComponent()` to register with Webflow
4. Always import `@/app/globals.css` in the .webflow.tsx file for Tailwind styles
5. Define props using `@webflow/data-types` prop types
6. Test locally in the Next.js app before deploying to Webflow
7. Add `'use client'` directive for interactive components (state, effects, event handlers)

### Component Locations

Implementation components can be placed in either:
- `src/components/` - For Webflow-specific implementations
- `components/` - For shared components used in both Next.js and Webflow (like shadcn/ui components)

Webflow wrapper files (*.webflow.tsx) must always be in `src/components/` to match the pattern in `webflow.json`.

### 3D Components

For Three.js components (like Lanyard):
- Mark components with `'use client'` directive
- Use React Three Fiber (`@react-three/fiber`)
- Use Drei for helpers (`@react-three/drei`)
- Use Rapier for physics (`@react-three/rapier`)
- Handle responsive behavior with window resize listeners
- Provide configurable props for position, gravity, FOV, etc.

### Props Configuration

Webflow components accept specific prop types:
- `props.Text()` - String values
- `props.Number()` - Numeric values
- `props.Boolean()` - True/false toggles
- `props.Variant()` - Predefined options (dropdown)

Each prop should have:
- `name` - Display name in Webflow
- `defaultValue` - Default value
- `tooltip` (optional) - Help text

### State Management with Zustand

For sharing state across multiple Webflow components (which render in separate Shadow DOM roots):

1. Create a Zustand store in `lib/stores/`
2. Use the store in multiple components
3. State persists across component instances via memory (or localStorage if needed)

**Example:**
```typescript
// lib/stores/slider-store.ts
import { create } from 'zustand';

interface SliderState {
  blueValue: number;
  setBlueValue: (value: number) => void;
}

export const useSliderStore = create<SliderState>((set) => ({
  blueValue: 0.5,
  setBlueValue: (value: number) => set({ blueValue: value }),
}));

// Component.tsx
'use client';
import { useSliderStore } from '@/lib/stores/slider-store';

export default function Component() {
  const value = useSliderStore((state) => state.blueValue);
  const setValue = useSliderStore((state) => state.setBlueValue);
  // ...
}
```

Note: React Context doesn't work across Webflow Code Components because each renders in its own Shadow DOM. Zustand works because it uses a singleton store.

## Webflow Configuration

### webflow.json
Defines:
- Library name and ID
- Component file patterns (looks for `./src/**/*.webflow.@(js|jsx|mjs|ts|tsx)`)
- Bundle configuration (`webpack.webflow.js`)
- Telemetry settings

### webpack.webflow.js
Sets up path aliases for bundling components for Webflow (must match tsconfig.json paths).

### components.json (shadcn/ui)
Configures shadcn/ui component generation:
- Style: "new-york"
- Base color: "neutral"
- CSS variables enabled
- Icon library: "lucide"
- Path aliases that match the project structure

## Additional Documentation

The `docs/` folder contains extended architecture documentation including:
- Webflow + Next.js integration patterns
- oRPC and React Query usage
- Routing strategies (query parameters vs dynamic routes)
- Database schemas and API design

Refer to `docs/README.md` for a complete overview of available documentation.
