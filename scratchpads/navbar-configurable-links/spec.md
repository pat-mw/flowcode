# Feature: Configurable Navbar Links

## Overview
Make the Navbar component's navigation links configurable via Webflow props instead of being hardcoded.

## Goals
- Allow customization of navigation link text
- Allow customization of navigation link URLs/hrefs
- Provide option to show/hide individual links
- Maintain responsive design and styling

## Current State
The Navbar has 4 hardcoded links:
1. Features → `#features`
2. Components → `#components`
3. Demo → `#demo`
4. Story → `#story`

## Technical Approach

### Props Structure
Add props for each navigation link:
- `link1Label`, `link1Url`, `showLink1`
- `link2Label`, `link2Url`, `showLink2`
- `link3Label`, `link3Url`, `showLink3`
- `link4Label`, `link4Url`, `showLink4`

### Implementation Steps
1. **Update NavbarProps interface** in `Navbar.tsx`
   - Add link configuration props
   - Provide sensible defaults matching current behavior

2. **Update Navbar component** logic
   - Use props for link text and URLs
   - Conditionally render links based on show flags
   - Filter out hidden links to avoid empty gaps

3. **Update Webflow wrapper** in `Navbar.webflow.tsx`
   - Add all new props to declareComponent
   - Use props.Text for labels and URLs
   - Use props.Boolean for show/hide toggles

## Files to Modify
- `components/webcn/landing_page/webcn.webflow.io/Navbar.tsx`
- `src/libraries/webcn/components/Navbar.webflow.tsx`

## Success Criteria
- [x] All 4 navigation links are configurable ✅ (update_001)
- [x] Default values match current hardcoded behavior ✅ (update_001)
- [x] Links can be individually shown/hidden ✅ (update_001)
- [x] Webflow wrapper exposes all configuration props ✅ (update_001)
- [x] GitHub URL is configurable ✅ (already existed)
- [x] "Get Started" button URL is configurable ✅ (update_002)
- [x] Responsive design maintained ✅
- [x] No TypeScript errors ✅

## Dependencies
None - uses existing component structure

## Timeline Estimate
~15-20 minutes
