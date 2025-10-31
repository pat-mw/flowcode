# Feature: DarkVeil Hero Background Integration

## Overview
Add the DarkVeil animated background component from @react-bits to the webcn landing page hero section with a toggleable visibility prop for modular control.

## Goals
- Install DarkVeil component from @react-bits/DarkVeil-TS-CSS
- Integrate DarkVeil into the webcn Hero component
- Add a `showBackground` prop to toggle visibility
- Keep the implementation modular and maintainable
- Ensure the hero section remains responsive and performant

## Technical Approach

### Libraries Affected
- **webcn**: Modify Hero component to include DarkVeil background

### Components to Create/Modify
1. Install DarkVeil via shadcn CLI
2. Modify `src/libraries/webcn/components/Hero.webflow.tsx`
   - Add DarkVeil as background layer
   - Add `showBackground` boolean prop (default: true)
   - Conditionally render DarkVeil based on prop

### Implementation Pattern
```typescript
// Hero component structure:
<div className="relative">
  {showBackground && <DarkVeil />}
  <div className="relative z-10">
    {/* Existing hero content */}
  </div>
</div>
```

### Backend Requirements
- None (client-side component only)

### Database Schema
- None

### Environment Variables
- None (no new env vars needed)

### Dependencies
- @react-bits/DarkVeil-TS-CSS (will be added via shadcn CLI)

### Test Pages
- Existing: `app/(demos)/lander/webcn/page.tsx` - Verify DarkVeil renders and toggles correctly

## Success Criteria
- [ ] DarkVeil component installed successfully
- [ ] Hero component updated with DarkVeil background
- [ ] `showBackground` prop works correctly (true/false toggle)
- [ ] Hero content remains readable with background active
- [ ] No performance degradation on landing page
- [ ] Landing page demo shows working implementation
- [ ] Component remains modular (easy to disable/remove)

## Open Questions
- Should DarkVeil have customization props (color, opacity, etc.)?
- Should we add z-index utilities to ensure content stays above background?

## Timeline Estimate
~30 minutes
- Install component: 5 min
- Integrate into Hero: 10 min
- Test and adjust styling: 10 min
- Documentation: 5 min
