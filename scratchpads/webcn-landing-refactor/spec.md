# Feature: Webcn Landing Page Refactor

## Overview
Refactor the webcn landing page to be more concise by creating a summary features section on the main page, with a dedicated features page for detailed information.

## Goals
- Shorten the main landing page by removing detailed sections
- Create a high-level "Features Summary" section highlighting: modular, typesafe, authenticated
- Move detailed feature sections to a dedicated `/features` page
- Provide clear CTA to navigate to the features page

## Technical Approach

### Pages Affected
- **Main Landing:** `app/(demos)/lander/webcn/page.tsx`
- **New Features Page:** `app/(demos)/lander/webcn/features/page.tsx` (to be created)

### Components to Create
1. **FeaturesSummary.tsx** - High-level summary component for main page
   - Location: `components/webcn/landing_page/webcn.webflow.io/FeaturesSummary.tsx`
   - Highlights: Modular, TypeSafe, Authenticated
   - CTA button: "Explore All Features" → links to `/features`

2. **FeaturesSummary.webflow.tsx** - Webflow wrapper
   - Location: `src/libraries/webcn/components/FeaturesSummary.webflow.tsx`

### Components to Move to Features Page
Move these from main landing page to dedicated features page:
1. **StylingControlSection** - Detailed styling customization info
2. **HubDashboardSection** - Component hub dashboard details
3. **Features** (existing) - Current 6-feature grid
4. **ArchitectureSection** - Technical architecture details

### Page Structure

**Main Landing Page (Shortened):**
```
- Navbar
- Hero
- FeaturesSummary (NEW - high-level: modular, typesafe, authenticated)
- ComponentGrid
- WaitlistSection
- DemoSection
- VideoSection
- StorySection
- BlogCTA
- Footer
```

**New Features Page:**
```
- Navbar
- Hero (minimal variant or skip?)
- Features (existing 6-feature grid)
- StylingControlSection
- ArchitectureSection
- HubDashboardSection
- BlogCTA (or different CTA)
- Footer
```

## Implementation Steps

1. **Create FeaturesSummary Component**
   - High-level 3-column grid
   - Icons + title + brief description for each
   - Features:
     - **Modular**: "Build with reusable, composable components"
     - **TypeSafe**: "End-to-end type safety with TypeScript and oRPC"
     - **Authenticated**: "Built-in auth with Better Auth integration"
   - CTA button at bottom: "Explore All Features" → `/lander/webcn/features`

2. **Create Features Page**
   - New file: `app/(demos)/lander/webcn/features/page.tsx`
   - Import all detail sections:
     - FeaturesWrapper (6-feature grid)
     - StylingControlSectionWrapper
     - ArchitectureSectionWrapper
     - HubDashboardSectionWrapper
   - Add Navbar and Footer
   - Add back-to-home link or breadcrumb

3. **Update Main Landing Page**
   - Remove: StylingControlSection, ArchitectureSection, HubDashboardSection, Features
   - Add: FeaturesSummaryWrapper
   - Keep: Hero, ComponentGrid, Waitlist, Demo, Video, Story, BlogCTA

4. **Test Navigation**
   - Verify CTA button links correctly
   - Test both pages load properly
   - Verify responsive design

## Success Criteria
- [ ] Main landing page is significantly shorter
- [ ] FeaturesSummary highlights 3 key points clearly
- [ ] Features page contains all detailed sections
- [ ] Navigation between pages works smoothly
- [ ] All existing components still render correctly
- [ ] Responsive design maintained on both pages

## Files to Create
- `components/webcn/landing_page/webcn.webflow.io/FeaturesSummary.tsx`
- `src/libraries/webcn/components/FeaturesSummary.webflow.tsx`
- `app/(demos)/lander/webcn/features/page.tsx`

## Files to Modify
- `app/(demos)/lander/webcn/page.tsx`

## Dependencies
None - uses existing components and patterns

## Timeline Estimate
~30-45 minutes for implementation and testing
