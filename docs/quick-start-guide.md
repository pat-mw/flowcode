# Quick Start Guide: Adding Components to BlogFlow

This guide helps you add NEW components to the existing BlogFlow/Webflow Code Components project.

## Project Context

**BlogFlow** is an EXISTING Next.js 15 + React 19 application that creates custom Webflow Code Components. The infrastructure, build system, and development environment are already set up and working.

### What's Already Built

- Next.js 15 app with Turbopack
- React 19 with TypeScript
- Tailwind CSS v4 styling system
- shadcn/ui component library
- Webflow Code Components integration (@webflow/react, @webflow/data-types)
- React Three Fiber for 3D components
- Zustand for state management
- Build and deployment configuration

### Existing Components

The project already includes several working components:
- **Badge** - Simple badge component (demo)
- **BlueSlider & RedSlider** - Slider components with Zustand state sharing
- **Lanyard** - 3D physics-based lanyard component using React Three Fiber
- **OrderConfirmation** - Order confirmation UI component

## Prerequisites

If you're setting up the project for the first time on your machine:

```bash
# Required tools
node >= 18
pnpm >= 8
git
```

## Initial Setup (First Time Only)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd blogflow

# Install dependencies
pnpm install
```

### 2. Configure Environment

Create a `.env` file based on `env.example`:

```bash
cp env.example .env
```

Required environment variable:
```
WEBFLOW_WORKSPACE_API_TOKEN="ws-xxxxx..."
```

Get your token from: [Webflow Workspace Settings > Code Components](https://webflow.com/dashboard/settings/code-components)

### 3. Verify Installation

```bash
# Start development server
pnpm dev

# Visit http://localhost:3000
```

## Adding a NEW Component

This is the main workflow you'll use to add new components to the project.

### Step 1: Create the Implementation Component

Decide where to place your component:

**Option A: Webflow-Specific Implementation**
- Location: `src/components/YourComponent.tsx`
- Use for: Components primarily used in Webflow

**Option B: Shared Implementation**
- Location: `components/YourComponent.tsx`
- Use for: Components shared between Next.js app and Webflow

**Example: Create a Button Component**

```typescript
// src/components/CustomButton.tsx
'use client'; // Required for interactive components

interface CustomButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export default function CustomButton({
  label,
  variant = 'primary',
  onClick
}: CustomButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium ${
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );
}
```

### Step 2: Create the Webflow Wrapper

Every Webflow component needs a `.webflow.tsx` wrapper file in `src/components/`.

**Pattern: `src/components/YourComponent.webflow.tsx`**

```typescript
// src/components/CustomButton.webflow.tsx
import CustomButton from './CustomButton';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import '@/app/globals.css'; // CRITICAL: Import global styles

export default declareComponent(CustomButton, {
  name: 'Custom Button',
  description: 'A customizable button component',
  group: 'Interactive', // Category in Webflow
  props: {
    label: props.Text({
      name: 'Button Label',
      defaultValue: 'Click Me',
      tooltip: 'The text displayed on the button',
    }),
    variant: props.Variant({
      name: 'Variant',
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
      ],
    }),
  },
});
```

### Step 3: Test Locally in Next.js

Add your component to a Next.js page for testing:

```typescript
// app/test-components/page.tsx
import CustomButton from '@/src/components/CustomButton';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1>Component Testing</h1>
      <CustomButton label="Primary Button" variant="primary" />
      <CustomButton label="Secondary Button" variant="secondary" />
    </div>
  );
}
```

Run the dev server:
```bash
pnpm dev
```

Visit `http://localhost:3000/test-components` to verify your component works.

### Step 4: Deploy to Webflow

Once your component is working locally:

```bash
# Build and deploy to Webflow
pnpm webflow:share
```

This command will:
1. Bundle your component with Webpack
2. Upload to your Webflow workspace
3. Make it available in the Webflow Designer

### Step 5: Use in Webflow Designer

1. Open your Webflow project
2. Go to the Components panel
3. Find your component under the category you specified
4. Drag and drop onto your page
5. Configure props in the right panel
6. Publish your site

## Common Component Patterns

### Pattern 1: Simple Presentational Component

For components that just display data:

```typescript
// Implementation
interface CardProps {
  title: string;
  description: string;
  imageUrl?: string;
}

export default function Card({ title, description, imageUrl }: CardProps) {
  return (
    <div className="border rounded-lg p-4 shadow">
      {imageUrl && <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded" />}
      <h3 className="text-xl font-bold mt-2">{title}</h3>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
  );
}

// Webflow Wrapper
import Card from './Card';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import '@/app/globals.css';

export default declareComponent(Card, {
  name: 'Card',
  description: 'A simple card component',
  group: 'Display',
  props: {
    title: props.Text({ name: 'Title', defaultValue: 'Card Title' }),
    description: props.Text({ name: 'Description', defaultValue: 'Card description' }),
    imageUrl: props.Text({ name: 'Image URL', defaultValue: '' }),
  },
});
```

### Pattern 2: Interactive Component with State

For components with internal state (requires `'use client'`):

```typescript
// Implementation
'use client';

import { useState } from 'react';

interface CounterProps {
  initialCount?: number;
  step?: number;
}

export default function Counter({ initialCount = 0, step = 1 }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setCount(c => c - step)}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        -
      </button>
      <span className="text-2xl font-bold">{count}</span>
      <button
        onClick={() => setCount(c => c + step)}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        +
      </button>
    </div>
  );
}

// Webflow Wrapper
import Counter from './Counter';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import '@/app/globals.css';

export default declareComponent(Counter, {
  name: 'Counter',
  description: 'An interactive counter component',
  group: 'Interactive',
  props: {
    initialCount: props.Number({ name: 'Initial Count', defaultValue: 0 }),
    step: props.Number({ name: 'Step', defaultValue: 1 }),
  },
});
```

### Pattern 3: Component with Cross-Component State (Zustand)

For components that need to share state across multiple instances:

```typescript
// lib/stores/theme-store.ts
import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  toggle: () => set((state) => ({ isDark: !state.isDark })),
}));

// src/components/ThemeToggle.tsx
'use client';

import { useThemeStore } from '@/lib/stores/theme-store';

export default function ThemeToggle() {
  const { isDark, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      className="px-4 py-2 rounded bg-gray-800 text-white"
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

// src/components/ThemeDisplay.tsx
'use client';

import { useThemeStore } from '@/lib/stores/theme-store';

export default function ThemeDisplay() {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <div className={`p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      Current theme: {isDark ? 'Dark' : 'Light'}
    </div>
  );
}

// Create .webflow.tsx wrappers for both components
```

**Why Zustand?** React Context doesn't work across Webflow Code Components because each component renders in its own Shadow DOM. Zustand uses a singleton store that works across boundaries.

### Pattern 4: 3D Component with React Three Fiber

For Three.js/3D components (see `Lanyard.webflow.tsx` for full example):

```typescript
// src/components/Box3D.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface Box3DProps {
  color?: string;
  size?: number;
}

function Box({ color, size }: { color: string; size: number }) {
  return (
    <mesh>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function Box3D({ color = '#0066ff', size = 1 }: Box3DProps) {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box color={color} size={size} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

// Create .webflow.tsx wrapper with props for color and size
```

### Pattern 5: Using shadcn/ui Components

The project includes shadcn/ui components in `components/ui/`:

```typescript
// src/components/FormExample.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function FormExample() {
  const [name, setName] = useState('');

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      <Button onClick={() => alert(`Hello, ${name}!`)}>
        Submit
      </Button>
    </div>
  );
}
```

## Webflow Props Types Reference

When creating your `.webflow.tsx` wrapper, use these prop types:

### Text Input
```typescript
props.Text({
  name: 'Display Name',
  defaultValue: 'default value',
  tooltip: 'Help text shown in Webflow',
})
```

### Number Input
```typescript
props.Number({
  name: 'Count',
  defaultValue: 0,
  tooltip: 'Numeric value',
})
```

### Boolean Toggle
```typescript
props.Boolean({
  name: 'Is Active',
  defaultValue: false,
  tooltip: 'True or false',
})
```

### Variant Dropdown
```typescript
props.Variant({
  name: 'Style',
  defaultValue: 'option1',
  options: [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
  ],
})
```

## Development Workflow

### Daily Development

```bash
# Start dev server (with hot reload)
pnpm dev

# Run linter
pnpm lint

# Build for production
pnpm build
```

### Testing Components

1. **Local Testing**: Create a test page in `app/` directory
2. **Component Testing**: Import and render your component with different props
3. **Style Verification**: Ensure Tailwind classes work correctly
4. **Interactivity Testing**: Test state changes, events, and user interactions

### Deploying to Webflow

```bash
# Deploy all components
pnpm webflow:share

# The CLI will show progress:
# ✓ Building components...
# ✓ Bundling with Webpack...
# ✓ Uploading to Webflow...
# ✓ Components available in Designer
```

## Project Structure Reference

```
blogflow/
├── app/                      # Next.js app router pages
│   ├── globals.css          # Global styles (imported by Webflow components)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── src/
│   └── components/          # Webflow Code Components
│       ├── *.tsx            # Component implementations
│       └── *.webflow.tsx    # Webflow wrappers
├── components/              # Shared React components
│   └── ui/                 # shadcn/ui component library
├── lib/
│   ├── stores/             # Zustand state stores
│   └── utils.ts            # Utility functions
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
├── docs/                   # Extended documentation
├── CLAUDE.md              # Project guidance
├── webflow.json           # Webflow CLI configuration
├── webpack.webflow.js     # Webpack config for Webflow bundling
└── package.json           # Dependencies and scripts
```

## Common Issues & Solutions

### Issue: Styles Not Appearing in Webflow

**Problem**: Component looks unstyled in Webflow Designer

**Solution**: Ensure you import global styles in your `.webflow.tsx` file:
```typescript
import '@/app/globals.css'; // This line is CRITICAL
```

### Issue: React Context Not Working

**Problem**: Context values are undefined in child components

**Solution**: Use Zustand instead. React Context doesn't work across Shadow DOM boundaries in Webflow Code Components.

### Issue: Component Not Showing in Webflow

**Problem**: After deploying, component doesn't appear in Designer

**Solutions**:
1. Verify `webflow.json` includes the correct pattern: `./src/**/*.webflow.@(js|jsx|mjs|ts|tsx)`
2. Ensure `.webflow.tsx` file is in `src/components/`
3. Check that you exported with `declareComponent()`
4. Verify `WEBFLOW_WORKSPACE_API_TOKEN` is set correctly

### Issue: TypeScript Errors

**Problem**: Import paths not resolving

**Solution**: Use the configured path aliases:
- `@/components` → `components/`
- `@/lib` → `lib/`
- `@/app` → `app/`
- `@/src/components` → `src/components/`

### Issue: 3D Component Not Rendering

**Problem**: React Three Fiber component shows blank

**Solutions**:
1. Ensure `'use client'` directive is present
2. Set explicit width/height on container div
3. Verify Three.js dependencies are installed
4. Check browser console for WebGL errors

## Advanced Topics

### Adding New shadcn/ui Components

```bash
# Use the CLI to add components
npx shadcn@latest add <component-name>

# Example: Add a dialog component
npx shadcn@latest add dialog
```

Components are added to `components/ui/` and can be imported in your Webflow components.

### Creating Stores for State Management

```typescript
// lib/stores/my-store.ts
import { create } from 'zustand';

interface MyState {
  value: number;
  increment: () => void;
  decrement: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 })),
  decrement: () => set((state) => ({ value: state.value - 1 })),
}));
```

### Persisting State with localStorage

```typescript
// lib/stores/persisted-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePersistedStore = create()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: 'my-storage-key', // localStorage key
    }
  )
);
```

### Adding Custom Fonts

1. Add font files to `public/fonts/`
2. Import in `app/globals.css`:
```css
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/my-font.woff2') format('woff2');
}
```
3. Use in Tailwind classes or custom CSS

### Responsive Design

Use Tailwind's responsive prefixes:

```typescript
<div className="
  w-full
  p-4 sm:p-6 md:p-8
  text-sm sm:text-base md:text-lg
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
">
  {/* Content */}
</div>
```

## Next Steps

Now that you understand how to add components:

1. **Review Existing Components**: Study the existing components in `src/components/` to see real examples
2. **Check Documentation**: See `docs/` for advanced patterns and architecture details
3. **Start Building**: Create your first component following the patterns above
4. **Iterate**: Test locally, deploy to Webflow, refine based on feedback

## Additional Resources

- **Project Documentation**: `docs/README.md` - Complete documentation index
- **Architecture Guide**: `docs/webflow-nextjs-architecture.md` - Full system design
- **CLAUDE.md**: Project conventions and patterns
- **Webflow Docs**: https://developers.webflow.com/code-components
- **Next.js Docs**: https://nextjs.org/docs
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Zustand**: https://zustand-demo.pmnd.rs/
- **shadcn/ui**: https://ui.shadcn.com/

---

**Questions or Issues?** Check the `docs/` folder for detailed guides or refer to CLAUDE.md for project-specific conventions.
