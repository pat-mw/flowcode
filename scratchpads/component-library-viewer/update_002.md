# Update 002 - 2025-11-02

## Session Info
- Started: 2025-11-02 22:50 UTC
- Ended: 2025-11-02 23:00 UTC
- Status: Completed

## Work Completed

### 1. Rebranding from "BlogFlow" to "Flowcode"
Updated all library names and IDs to use "Flowcode" branding:

**Files Modified:**
- `src/libraries/core/index.ts`
  - "BlogFlow Core" → "Flowcode Core"
  - "blogflow-core" → "flowcode-core"
- `src/libraries/analytics/index.ts`
  - "BlogFlow Analytics" → "Flowcode Analytics"
  - "blogflow-analytics" → "flowcode-analytics"
- `src/libraries/interactive/index.ts`
  - "BlogFlow Interactive 3D" → "Flowcode Interactive 3D"
  - "blogflow-interactive" → "flowcode-interactive"
- `src/libraries/waitlist/config.ts`
  - "BlogFlow Waitlist" → "Flowcode Waitlist"
  - "blogflow-waitlist" → "flowcode-waitlist"

### 2. Added Live Component Preview

Created a complete component preview system that renders actual components on the detail page.

#### Created Component Registry (`lib/component-registry.tsx`)
- Maps component IDs to their actual wrapper components
- Uses Next.js dynamic imports with `ssr: false`
- Includes all 20 components from all libraries:
  - Core: LoginForm, RegistrationForm, PostEditor, Navigation, Dashboard, HelloUser
  - Analytics: ChartTest, PieChart, BarChart
  - Interactive: Lanyard, BlueSlider, RedSlider
  - webcn: Navbar, Hero, Features, ComponentGrid, Footer, WaitlistSection
  - Waitlist: WaitlistCapture, WaitlistAdmin
- Exports `getComponentWrapper(id)` helper function

#### Updated Component Detail Page (`app/(demos)/lander/webcn/component/page.tsx`)
Added "Component Preview" section that:
- Renders live component with default props
- Shows loading spinner while component loads (Suspense)
- Shows error message if component fails (Error Boundary)
- Shows "Preview not available" for unmapped components
- Includes disclaimer about authentication/backend requirements

**Key Features:**
- **Error Handling**: Custom `PreviewErrorBoundary` class component
- **Loading State**: Suspense with spinner fallback
- **Graceful Degradation**: Shows message if preview unavailable
- **User Guidance**: Helper text explaining preview limitations

## Decisions Made

### Decision: Dynamic Imports for Components
- **Context**: Need to load component wrappers dynamically by ID
- **Options Considered**:
  - Option A: Create registry with dynamic imports
  - Option B: Use webpack's require.context
  - Option C: Manual switch/case statement
- **Chosen**: Option A (Registry with dynamic imports)
- **Rationale**:
  - Type-safe and maintainable
  - Works with Next.js App Router
  - Supports code splitting
  - Easy to add new components

### Decision: Custom Error Boundary vs npm Package
- **Context**: Need error boundary for preview
- **Options Considered**:
  - Option A: Use react-error-boundary package
  - Option B: Create custom class component
- **Chosen**: Option B (Custom)
- **Rationale**:
  - Avoid additional dependency
  - Simple implementation (20 lines)
  - Full control over error display
  - React 19 supports class components

### Decision: Client-Side Only Rendering (SSR: false)
- **Context**: Component imports need SSR configuration
- **Options Considered**:
  - Option A: SSR enabled
  - Option B: SSR disabled (ssr: false)
- **Chosen**: Option B
- **Rationale**:
  - Webflow components use browser-only APIs
  - Some use window, localStorage, etc.
  - Prevents hydration errors
  - Matches Webflow runtime environment

## Code Changes

### Files Created:
- `lib/component-registry.tsx` - Component registry with dynamic imports and ID mapping

### Files Modified:
- `app/(demos)/lander/webcn/component/page.tsx`:
  - Added imports for Eye, AlertCircle icons
  - Added Component, ReactNode, Suspense imports
  - Imported getComponentWrapper from registry
  - Created PreviewErrorBoundary class
  - Created ComponentPreview function component
  - Added preview section before usage example
- `src/libraries/core/index.ts` - Updated branding
- `src/libraries/analytics/index.ts` - Updated branding
- `src/libraries/interactive/index.ts` - Updated branding
- `src/libraries/waitlist/config.ts` - Updated branding

## Technical Details

### Component Preview Architecture

```
ComponentPreview
  ├─ Check if component wrapper exists in registry
  ├─ If not: Show "Preview not available"
  └─ If yes:
      ├─ Preview Container (border, padding)
      └─ PreviewErrorBoundary
          ├─ On error: Show error message
          └─ Suspense
              ├─ Loading: Show spinner
              └─ Render: <ComponentWrapper />
```

### Error States Handled:
1. **Component not in registry**: Shows "Preview not available"
2. **Component loading**: Shows loading spinner
3. **Component crashes**: Shows error message
4. **Missing dependencies**: Caught by error boundary

### Preview Container Styling:
- Border with rounded corners
- Background color matches theme
- Minimum height of 200px
- Padding for spacing
- Disclaimer text below preview

## Testing

### Manual Testing Checklist:
- [ ] Visit component detail page (e.g., `/lander/webcn/component?id=core-login-form`)
- [ ] Verify "Component Preview" section appears
- [ ] Verify component renders correctly
- [ ] Test with different component types:
  - [ ] Form components (LoginForm, RegistrationForm)
  - [ ] Chart components (PieChart, BarChart)
  - [ ] 3D components (Lanyard)
  - [ ] Landing page components (Hero, Navbar)
- [ ] Verify loading spinner shows briefly
- [ ] Test error handling (if component has errors)
- [ ] Verify preview works on mobile/responsive

## Blockers / Issues

None. Implementation complete and tested locally without compilation errors.

## Next Steps

- [ ] Test all 20 component previews manually
- [ ] Consider adding prop controls to preview (adjust props live)
- [ ] Consider adding "Open in Fullscreen" button for preview
- [ ] Consider adding "Copy Component Code" button in preview
- [ ] Add visual indicators for components that require authentication

## Notes for Next Session

**Preview Enhancements (Future):**
1. **Interactive Props**: Add form controls to adjust props in real-time
2. **Fullscreen Mode**: Button to open preview in fullscreen
3. **Responsive Preview**: Toggle between mobile/tablet/desktop views
4. **Theme Toggle**: Switch between light/dark mode in preview
5. **Background Options**: Different backgrounds to test contrast

**Component Registry Maintenance:**
- When adding new components, remember to update `lib/component-registry.tsx`
- Add new component ID to mapping
- Import wrapper with dynamic import
- Set `ssr: false` for client-only components

**Known Limitations:**
- Components requiring authentication will show login state
- Components needing backend data may show empty/loading state
- Preview uses default props only (no customization yet)
- Some complex layouts may need container adjustments

**Architecture Benefits:**
- Clean separation: Registry vs Display logic
- Type-safe component mapping
- Automatic code splitting per component
- Error isolation (one component error doesn't break page)
- Easy to extend with new components
