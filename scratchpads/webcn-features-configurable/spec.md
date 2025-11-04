# Feature: Configurable Features Section Props

## Overview
Make the webcn Features component fully configurable via Webflow props, allowing users to customize all 6 feature cards (title, description) through the Webflow Designer interface.

## Goals
- Make all 6 feature card titles configurable via props.Text
- Make all 6 feature card descriptions configurable via props.Text
- Maintain backward compatibility with default values
- Keep the implementation component clean and maintainable
- Ensure the component works correctly in Webflow Designer

## Current State
The Features component currently has:
- Configurable section title and subtitle (already done)
- Hardcoded array of 6 features with fixed titles and descriptions
- Icons are mapped to features by array index

## Technical Approach

### Component Props Structure
Add 12 new props to the Webflow wrapper (6 titles + 6 descriptions):

```typescript
{
  // Section-level props (already exist)
  sectionTitle: props.Text(...),
  sectionSubtitle: props.Text(...),

  // Feature 1 (shadcn/ui Ready)
  feature1Title: props.Text({ name: "Feature 1 Title", defaultValue: "shadcn/ui Ready" }),
  feature1Description: props.Text({ name: "Feature 1 Description", defaultValue: "All your favorite shadcn components..." }),

  // Feature 2 (Full-Stack Components)
  feature2Title: props.Text({ name: "Feature 2 Title", defaultValue: "Full-Stack Components" }),
  feature2Description: props.Text({ name: "Feature 2 Description", defaultValue: "Pre-built authentication..." }),

  // ... and so on for features 3-6
}
```

### Conditional Rendering Logic
**IMPORTANT**: Only render feature cards that have a non-empty title.

- If `feature1Title` is empty/null → Skip Feature 1 card
- If `feature2Title` is empty/null → Skip Feature 2 card
- etc.

This allows users to display 1-6 features by providing only the titles they want.

**Example Use Cases:**
- Display all 6 features (default) → All titles have values
- Display only 3 features → Set feature1-3 titles, leave feature4-6 titles empty
- Display custom set → Provide titles for desired features, empty strings for unwanted ones

### Implementation Component Changes
Modify `components/webcn/landing_page/webcn.webflow.io/Features.tsx`:

1. Update `FeaturesProps` interface to include 12 new optional props (all strings)
2. Keep the icons array separate (icons remain fixed)
3. Build the features array dynamically:
   - Combine props with corresponding icons
   - **Filter out features where title is empty/null/undefined**
4. Maintain default values in case props are not provided

### Icon Mapping
Icons will remain in a fixed order (matched to feature slot):
1. Code2 (shadcn/ui) - Feature 1
2. Database (Full-Stack) - Feature 2
3. Lock (Authentication) - Feature 3
4. Zap (Zero Configuration) - Feature 4
5. Layers (Composable) - Feature 5
6. Workflow (Webflow Integration) - Feature 6

## Libraries Affected
- **webcn**: Update Features component and wrapper

## Components to Modify
1. `components/webcn/landing_page/webcn.webflow.io/Features.tsx` - Add props to interface, build dynamic features array
2. `src/libraries/webcn/components/Features.webflow.tsx` - Add 12 new props.Text() declarations

## Test Pages
- `app/(demos)/lander/webcn/page.tsx` - Verify default behavior still works
- Test in Webflow Designer after deployment to verify prop editing

## Dependencies
None - uses existing structure

## Success Criteria
- [ ] All 6 feature titles are configurable via props
- [ ] All 6 feature descriptions are configurable via props
- [ ] Default values match current hardcoded values
- [ ] Component renders correctly with defaults
- [ ] Component renders correctly with custom values
- [ ] No visual regression in existing demo page
- [ ] Props are clearly named and organized in Webflow Designer

## Implementation Plan

1. **Update Implementation Component** (`Features.tsx`):
   - Extend `FeaturesProps` interface with 12 new optional props
   - Create icons array separately
   - Build features array dynamically from props + icons
   - Use default values from original hardcoded array

2. **Update Webflow Wrapper** (`Features.webflow.tsx`):
   - Add 12 new `props.Text()` declarations
   - Pass all props to implementation component
   - Organize props logically (Feature 1, Feature 2, etc.)

3. **Test locally**:
   - Verify demo page still renders correctly
   - Test with custom prop values

4. **Deploy and verify**:
   - Deploy to Webflow
   - Test prop editing in Designer

## Timeline Estimate
~30 minutes implementation + testing
