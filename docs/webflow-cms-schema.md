# Webflow CMS Schemas - webcn Site

**Site ID**: `69036070772daa1ecd30cbde`

## Libraries Collection
**Collection ID**: `69080ad05b5bb9a43ab2897f`

### Fields
- `name` (PlainText, required)
- `slug` (PlainText, required, auto-generated)
- `library-id` (PlainText)
- `description` (RichText)
- `deploy-enabled` (Switch/Boolean)
- `components` (MultiReference → Components Collection)

### Items (6 total)
1. Flowcode Core - `69080b11c5c5bb9af60c7c89`
2. Flowcode Analytics - `69080b1b74c43601b928ad94`
3. Flowcode Interactive 3D - `69080b1b74c43601b928ad97`
4. webcn Landing Page - `69080b1b74c43601b928ad9a`
5. Flowcode Waitlist - `69080b1b74c43601b928ad9d`
6. Component Registry Dashboard - `69080b1b74c43601b928ada0`

## Components Collection
**Collection ID**: `6908065569747d13e82a4416`

### Fields
- `name` (PlainText, required)
- `slug` (PlainText, required, auto-generated)
- `component-id` (PlainText)
- `description` (RichText)
- `category` (PlainText)
- `library` (Reference → Libraries Collection)
- `tags` (PlainText)
- `dependencies` (PlainText)
- `backend-dependencies` (PlainText)
- `usage-example` (RichText)
- `file-path` (PlainText)

### Items (21 total, organized by library)

**Core Library** (6):
- Login Form - `69080c0974c43601b928ae57`
- Registration Form - `69080c0974c43601b928ae5a`
- Navbar - `69080c0974c43601b928ae5d`
- Footer - `69080c0974c43601b928ae60`
- Post Feed - `69080c0974c43601b928ae63`
- Post Card - `69080c0974c43601b928ae66`

**Analytics Library** (3):
- Chart Test - `69080c5a74c43601b928ae99`
- Pie Chart - `69080c5a74c43601b928ae9c`
- Bar Chart - `69080c5a74c43601b928ae9f`

**Interactive Library** (4):
- Lanyard - `69080ca6c5c5bb9af60c7db9`
- Blue Slider - `69080ca6c5c5bb9af60c7dbc`
- Red Slider - `69080ca6c5c5bb9af60c7dbf`
- LaserFlow Hero - `69080ca6c5c5bb9af60c7dc2`

**webcn Library** (5):
- Navbar - `69080cf5c5c5bb9af60c7de1`
- Hero - `69080cf5c5c5bb9af60c7de4`
- Features - `69080cf5c5c5bb9af60c7de7`
- Footer - `69080cf5c5c5bb9af60c7dea`
- Waitlist Section - `69080cf5c5c5bb9af60c7ded`

**Waitlist Library** (2):
- Waitlist Capture - `69080d3cc5c5bb9af60c7e01`
- Waitlist Admin - `69080d3cc5c5bb9af60c7e04`

**Registry Dashboard Library** (6):
- Component Grid - `69080d7cc5c5bb9af60c7e1c`
- Component Detail Header - `69080d7cc5c5bb9af60c7e1f`
- Component Detail Preview - `69080d7cc5c5bb9af60c7e22`
- Component Detail Props - `69080d7cc5c5bb9af60c7e25`
- Component Detail Usage - `69080d7cc5c5bb9af60c7e28`
- Component Detail Sidebar - `69080d7cc5c5bb9af60c7e2b`

## Relationships
- Each Component has a `library` reference to one Library item
- Each Library has a `components` multi-reference to multiple Component items
