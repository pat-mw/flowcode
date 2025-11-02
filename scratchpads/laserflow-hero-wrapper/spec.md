# Feature: LaserFlow Hero Webflow Component

## Overview
Create a Webflow wrapper for the LaserFlow Hero component that combines the interactive laser effect with a customizable hero box. This component will be part of the Interactive library.

## Goals
- Register LaserFlow Hero as a Webflow component in the Interactive library
- Pass through all LaserFlow props to allow full customization
- Add a configurable title prop (default: 'Flowcode') that displays in the hero box
- Maintain the interactive reveal effect from the original demo

## Technical Approach

### Libraries Affected
- **interactive**: Adding new component `LaserFlowHero.webflow.tsx`

### Backend Requirements
- None (purely client-side interactive component)

### Components to Create/Modify

1. **Modify** `components/react-bits/laser-flow/hero.tsx`
   - Accept all LaserFlow props as passthrough
   - Add `title` prop (default: 'Flowcode')
   - Render title inside the hero box

2. **Create** `src/libraries/interactive/components/LaserFlowHero.webflow.tsx`
   - Declare all LaserFlow props using @webflow/data-types
   - Add title prop
   - Wrap with WebflowProvidersWrapper

### Test Pages
- Can test in existing pages or create new test page if needed
- Component is visual so testing in browser is essential

## LaserFlow Props (from LaserFlow.tsx lines 5-26)
```typescript
{
  className?: string;
  style?: React.CSSProperties;
  wispDensity?: number;           // default: 1
  dpr?: number;                   // device pixel ratio
  mouseSmoothTime?: number;       // default: 0.0
  mouseTiltStrength?: number;     // default: 0.01
  horizontalBeamOffset?: number;  // default: 0.1
  verticalBeamOffset?: number;    // default: 0.0
  flowSpeed?: number;             // default: 0.35
  verticalSizing?: number;        // default: 2.0
  horizontalSizing?: number;      // default: 0.5
  fogIntensity?: number;          // default: 0.45
  fogScale?: number;              // default: 0.3
  wispSpeed?: number;             // default: 15.0
  wispIntensity?: number;         // default: 5.0
  flowStrength?: number;          // default: 0.25
  decay?: number;                 // default: 1.1
  falloffStart?: number;          // default: 1.2
  fogFallSpeed?: number;          // default: 0.6
  color?: string;                 // default: '#FF79C6'
}
```

## Success Criteria
- [ ] Hero component accepts and passes through all LaserFlow props
- [ ] Title prop works and displays in the box
- [ ] Webflow wrapper created with all props declared
- [ ] Component appears in Webflow Interactive library
- [ ] Visual testing confirms interactive effects work

## Dependencies
- No new dependencies (uses existing LaserFlow component)

## Timeline Estimate
~30 minutes for implementation and testing
