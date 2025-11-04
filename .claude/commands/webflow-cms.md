# Webflow CMS Management Guide

This command provides comprehensive guidance for working with Webflow CMS collections and items using the webflow-local MCP server.

## Overview

The Webflow MCP server provides two categories of tools:
- **Data Tools**: REST API calls for CMS collections, items, pages, etc.
- **Designer Tools**: UI tools for working with elements, styles, pages in the Designer

This guide focuses on **Data Tools** for CMS management.

## Prerequisites

### Getting Site ID

**ALWAYS get the site ID first** - most operations require it:

```typescript
// Get list of all sites
mcp__webflow-local__sites_list()

// Returns: { sites: [{ id: "xxx", displayName: "...", ... }] }
```

Store the site ID for subsequent operations.

### Check Available Collections

```typescript
mcp__webflow-local__collections_list({ site_id: "your-site-id" })

// Returns: { collections: [{ id: "xxx", displayName: "...", slug: "..." }] }
```

## Creating Collections

### Basic Collection Creation

```typescript
mcp__webflow-local__collections_create({
  site_id: "your-site-id",
  request: {
    displayName: "Components",  // Human-readable name
    singularName: "Component",  // Singular form
    slug: "components"          // URL-friendly slug (optional)
  }
})
```

**Response includes:**
- `id`: Collection ID (save this!)
- Auto-generated fields: `name` (required), `slug` (required)

### Important Notes

✅ **Default Fields**: Every collection automatically gets:
- `name` (PlainText, required, max 256 chars)
- `slug` (PlainText, required, max 256 chars, alphanumeric only)

❌ **Duplicate Collections**: If collection already exists, you'll get:
```json
{
  "statusCode": 409,
  "body": {
    "message": "Collection already exists",
    "code": "duplicate_collection"
  }
}
```

## Adding Fields to Collections

### Field Types Available

1. **Static Fields** (simple data):
   - `PlainText` - Single line text
   - `RichText` - HTML formatted text
   - `Email` - Email addresses
   - `Phone` - Phone numbers
   - `Number` - Numeric values
   - `DateTime` - Dates and times
   - `Switch` - Boolean (true/false)
   - `Color` - Color values
   - `Link` - URLs
   - `Image` - Single image
   - `MultiImage` - Multiple images
   - `Video` - Video embeds
   - `File` - File attachments

2. **Option Fields** (dropdowns):
   - `Option` - Single selection from predefined list

3. **Reference Fields** (relationships):
   - `Reference` - Link to one item in another collection
   - `MultiReference` - Link to multiple items in another collection

### Creating Static Fields

```typescript
mcp__webflow-local__collection_fields_create_static({
  collection_id: "your-collection-id",
  request: {
    type: "PlainText",           // or RichText, Number, Switch, etc.
    displayName: "Description",   // Field label in CMS
    helpText: "Optional help text shown in CMS", // Optional
    isRequired: false,            // Optional, defaults to false
    isEditable: true              // Optional, defaults to true
  }
})
```

**Field Slug Auto-Generation:**
- `displayName: "Library ID"` → `slug: "library-id"`
- `displayName: "Description"` → `slug: "description"`

### Creating Option Fields (Dropdowns)

```typescript
mcp__webflow-local__collection_fields_create_option({
  collection_id: "your-collection-id",
  request: {
    type: "Option",
    displayName: "Status",
    helpText: "Item status",
    metadata: {
      options: [
        { name: "Draft" },      // id auto-generated
        { name: "Published" },
        { name: "Archived" }
      ]
    }
  }
})
```

### Creating Reference Fields (Relationships)

**Single Reference:**
```typescript
mcp__webflow-local__collection_fields_create_reference({
  collection_id: "components-collection-id",
  request: {
    type: "Reference",
    displayName: "Library",
    helpText: "Parent library this component belongs to",
    metadata: {
      collectionId: "libraries-collection-id"  // Target collection
    }
  }
})
```

**Multi-Reference (for many-to-many):**
```typescript
mcp__webflow-local__collection_fields_create_reference({
  collection_id: "libraries-collection-id",
  request: {
    type: "MultiReference",
    displayName: "Components",
    helpText: "Components in this library",
    metadata: {
      collectionId: "components-collection-id"
    }
  }
})
```

## Working with Collection Items

### Creating Items (Draft Mode)

**Pattern: Create as drafts first, then optionally publish**

```typescript
mcp__webflow-local__collections_items_create_item({
  collection_id: "your-collection-id",
  request: {
    items: [
      {
        fieldData: {
          name: "Item Name",           // Required
          slug: "item-slug",            // Required
          "field-slug": "value",        // Use field slugs, not displayNames
          "library": "reference-id",    // For Reference fields
          "components": ["id1", "id2"]  // For MultiReference fields
        }
      },
      // Can create multiple items in one call
      {
        fieldData: { name: "Item 2", slug: "item-2" }
      }
    ]
  }
})
```

**Critical Rules:**

✅ **Use field slugs** (e.g., `"library-id"`, not `"Library ID"`)
- Field slugs are auto-generated: `"Library ID"` → `"library-id"`
- Use kebab-case

✅ **Required fields**: Always include `name` and `slug`

✅ **Reference fields**: Pass the referenced item's ID as a string
- Single reference: `"library": "69080b11c5c5bb9af60c7c89"`
- Multi-reference: `"components": ["id1", "id2", "id3"]`

✅ **Boolean fields** (Switch): Use `true` or `false`

✅ **Rich text fields**: Use HTML with `<p>` tags
- Example: `"description": "<p>This is <strong>formatted</strong> text</p>"`

❌ **DO NOT use live creation endpoint initially**:
- `collections_items_create_item_live` often returns 404 errors
- Use `collections_items_create_item` (draft mode) instead

### Response Structure

```json
{
  "items": [
    {
      "id": "69080b11c5c5bb9af60c7c89",  // Save this!
      "cmsLocaleId": "...",
      "lastPublished": null,              // null for drafts
      "lastUpdated": "2025-11-03T01:53:21.711Z",
      "createdOn": "2025-11-03T01:53:21.711Z",
      "isArchived": false,
      "isDraft": true,                    // Items start as drafts
      "fieldData": { /* your data */ }
    }
  ]
}
```

**IMPORTANT**: Save the `id` for each created item - you'll need it for updates and references.

### Updating Items

```typescript
mcp__webflow-local__collections_items_update_items({
  collection_id: "your-collection-id",
  request: {
    items: [
      {
        id: "item-id-to-update",  // Required!
        fieldData: {
          // Only include fields you want to change
          "library-id": "new-value",
          "components": ["new-ref-1", "new-ref-2"]
        }
      }
    ]
  }
})
```

**Key Points:**
- `id` is **required** for updates
- Only include fields you want to modify (partial updates)
- Multi-references are **replaced**, not appended
  - To add a component: include existing IDs + new ID
  - To remove a component: omit its ID from the array

### Publishing Items

```typescript
mcp__webflow-local__collections_items_publish_items({
  collection_id: "your-collection-id",
  itemIds: ["item-id-1", "item-id-2", "item-id-3"]
})
```

**Note**: Publishing may return 404 errors in some cases. Items remain as drafts but are still functional in the CMS.

## Common Workflows

### Workflow 1: Create Related Collections (One-to-Many)

Example: Libraries → Components relationship

**Step 1: Create both collections**
```typescript
// Create Libraries collection
collections_create({ displayName: "Libraries", singularName: "Library" })
// Save libraries_collection_id

// Create Components collection
collections_create({ displayName: "Components", singularName: "Component" })
// Save components_collection_id
```

**Step 2: Add fields to Libraries**
```typescript
// Add basic fields
collection_fields_create_static({
  collection_id: libraries_collection_id,
  request: { type: "PlainText", displayName: "Library ID" }
})

// Add multi-reference to components
collection_fields_create_reference({
  collection_id: libraries_collection_id,
  request: {
    type: "MultiReference",
    displayName: "Components",
    metadata: { collectionId: components_collection_id }
  }
})
```

**Step 3: Add fields to Components**
```typescript
// Add reference back to library
collection_fields_create_reference({
  collection_id: components_collection_id,
  request: {
    type: "Reference",
    displayName: "Library",
    metadata: { collectionId: libraries_collection_id }
  }
})
```

**Step 4: Create items in order**
```typescript
// 1. Create library items first (no references yet)
collections_items_create_item({
  collection_id: libraries_collection_id,
  request: {
    items: [{ fieldData: { name: "Core", slug: "core" } }]
  }
})
// Save library_item_id

// 2. Create component items with library reference
collections_items_create_item({
  collection_id: components_collection_id,
  request: {
    items: [{
      fieldData: {
        name: "Login Form",
        slug: "login-form",
        library: library_item_id  // Reference to library
      }
    }]
  }
})
// Save component_item_id

// 3. Update library to include component in multi-reference
collections_items_update_items({
  collection_id: libraries_collection_id,
  request: {
    items: [{
      id: library_item_id,
      fieldData: {
        components: [component_item_id]  // Add component to library
      }
    }]
  }
})
```

### Workflow 2: Batch Create Items

**Create multiple items efficiently:**

```typescript
// Create all items in one call
collections_items_create_item({
  collection_id: "components-collection-id",
  request: {
    items: [
      { fieldData: { name: "Component 1", slug: "component-1", library: "lib-id" } },
      { fieldData: { name: "Component 2", slug: "component-2", library: "lib-id" } },
      { fieldData: { name: "Component 3", slug: "component-3", library: "lib-id" } },
      // ... up to many items
    ]
  }
})
```

**Response includes all created items with IDs:**
```json
{
  "items": [
    { "id": "id-1", "fieldData": {...} },
    { "id": "id-2", "fieldData": {...} },
    { "id": "id-3", "fieldData": {...} }
  ]
}
```

**Then update parent with multi-reference:**
```typescript
collections_items_update_items({
  collection_id: "libraries-collection-id",
  request: {
    items: [{
      id: "library-id",
      fieldData: {
        components: ["id-1", "id-2", "id-3"]  // All component IDs
      }
    }]
  }
})
```

## Troubleshooting

### Error: 404 Not Found

**Cause**: Usually occurs with `create_item_live` or `publish_items`

**Solution**: Use `create_item` (draft mode) instead of `create_item_live`

### Error: 409 Duplicate Collection

**Cause**: Collection with same name already exists

**Solution**:
1. List collections to find existing one
2. Use existing collection ID
3. Or choose different name

### Items Not Showing in CMS

**Cause**: Items are drafts or not published

**Solution**: Items work fine as drafts. Check:
1. `isDraft: true` in response (normal)
2. Items appear in Webflow CMS draft mode
3. Publishing is optional for functionality

### Field Slug Mismatch

**Symptom**: Updates fail with "field not found"

**Cause**: Using displayName instead of slug

**Solution**:
1. Get collection details: `collections_get({ collection_id })`
2. Check `fields[].slug` values
3. Use exact slug in `fieldData` (e.g., `"library-id"` not `"libraryId"`)

### Multi-Reference Not Updating

**Cause**: Passing invalid item IDs or wrong format

**Solution**:
- Multi-reference expects **array of strings**: `["id1", "id2"]`
- Single reference expects **single string**: `"id1"`
- Verify referenced items exist before linking

## Best Practices

### 1. Plan Collection Structure First

Before creating anything:
- Map out relationships (one-to-many, many-to-many)
- Decide which fields are required
- Plan reference directions (which collection references which)

### 2. Create in Order

**Correct order:**
1. Create collections
2. Add fields to collections
3. Create items (children before parents for references)
4. Update parent items with multi-references

### 3. Save All IDs

Create a mapping object as you go:
```typescript
const ids = {
  collections: {
    libraries: "69080ad05b5bb9a43ab2897f",
    components: "6908065569747d13e82a4416"
  },
  libraries: {
    core: "69080b11c5c5bb9af60c7c89",
    analytics: "69080b1b74c43601b928ad94"
  },
  components: {
    loginForm: "69080b3e5b5bb9a43ab2c754",
    // ...
  }
}
```

### 4. Use Batch Operations

- Create multiple items in single `items` array
- Reduces API calls
- More efficient than one-by-one

### 5. Handle HTML in Rich Text Properly

```typescript
// ✅ Correct: Wrap in <p> tags
"description": "<p>This is the description</p>"

// ✅ Correct: Use HTML formatting
"description": "<p>This has <strong>bold</strong> and <em>italic</em> text</p>"

// ❌ Wrong: Plain text without tags
"description": "This is the description"
```

### 6. Validate References Before Creating

```typescript
// Before creating component with library reference:
// 1. Verify library exists
collections_items_list_items({
  collection_id: libraries_collection_id
})

// 2. Get library ID from response
// 3. Then create component with valid library reference
```

## Common Patterns

### Pattern: Bidirectional Relationship

Libraries ↔ Components (both directions):

```typescript
// Library has: components (MultiReference) → [Component IDs]
// Component has: library (Reference) → Library ID

// Creating the relationship:
// 1. Create library (no components yet)
const library = { id: "lib-1", name: "Core" }

// 2. Create component with library reference
const component = {
  id: "comp-1",
  name: "Login",
  library: "lib-1"  // Points to library
}

// 3. Update library to reference component
update_library({
  id: "lib-1",
  components: ["comp-1"]  // Points back to component
})
```

### Pattern: Metadata-Rich Items

For component registry:
```typescript
{
  fieldData: {
    name: "Login Form",
    slug: "login-form",
    "component-id": "core-login-form",  // Custom ID field
    description: "<p>User authentication form</p>",
    category: "Authentication",
    library: "library-id",
    tags: "auth, form, login, oauth",  // Comma-separated
    dependencies: "@tanstack/react-query, lucide-react",
    "backend-dependencies": "auth.signIn.email",
    "usage-example": "<code>&lt;LoginFormWrapper /&gt;</code>",
    "file-path": "src/libraries/core/components/LoginForm.webflow.tsx"
  }
}
```

## Field Types Quick Reference

| Type | Use Case | Value Format | Example |
|------|----------|--------------|---------|
| PlainText | Short text | String | `"Hello World"` |
| RichText | HTML content | HTML string | `"<p>Hello <strong>World</strong></p>"` |
| Number | Numeric values | Number | `42` |
| Switch | Boolean | Boolean | `true` or `false` |
| Reference | Link to 1 item | String (item ID) | `"69080b11..."` |
| MultiReference | Link to many items | Array of strings | `["id1", "id2"]` |
| Option | Dropdown selection | String (option name) | `"Draft"` |

## Example: Complete Workflow

Here's a complete example of creating a component registry:

```typescript
// 1. Get site ID
const { sites } = await sites_list()
const siteId = sites[0].id

// 2. Create Libraries collection
const libCollection = await collections_create({
  site_id: siteId,
  request: {
    displayName: "Libraries",
    singularName: "Library"
  }
})
const libCollectionId = libCollection.id

// 3. Create Components collection
const compCollection = await collections_create({
  site_id: siteId,
  request: {
    displayName: "Components",
    singularName: "Component"
  }
})
const compCollectionId = compCollection.id

// 4. Add fields to Libraries
await collection_fields_create_static({
  collection_id: libCollectionId,
  request: { type: "PlainText", displayName: "Library ID" }
})

await collection_fields_create_static({
  collection_id: libCollectionId,
  request: { type: "RichText", displayName: "Description" }
})

await collection_fields_create_reference({
  collection_id: libCollectionId,
  request: {
    type: "MultiReference",
    displayName: "Components",
    metadata: { collectionId: compCollectionId }
  }
})

// 5. Add fields to Components
await collection_fields_create_static({
  collection_id: compCollectionId,
  request: { type: "RichText", displayName: "Description" }
})

await collection_fields_create_reference({
  collection_id: compCollectionId,
  request: {
    type: "Reference",
    displayName: "Library",
    metadata: { collectionId: libCollectionId }
  }
})

// 6. Create library
const { items: [library] } = await collections_items_create_item({
  collection_id: libCollectionId,
  request: {
    items: [{
      fieldData: {
        name: "Core Library",
        slug: "core",
        "library-id": "flowcode-core",
        description: "<p>Core components</p>"
      }
    }]
  }
})

// 7. Create components
const { items: components } = await collections_items_create_item({
  collection_id: compCollectionId,
  request: {
    items: [
      {
        fieldData: {
          name: "Login Form",
          slug: "login-form",
          description: "<p>User login</p>",
          library: library.id
        }
      },
      {
        fieldData: {
          name: "Registration Form",
          slug: "registration-form",
          description: "<p>User registration</p>",
          library: library.id
        }
      }
    ]
  }
})

// 8. Link components to library
await collections_items_update_items({
  collection_id: libCollectionId,
  request: {
    items: [{
      id: library.id,
      fieldData: {
        components: components.map(c => c.id)
      }
    }]
  }
})

console.log("✅ Complete! Library with components created.")
```

## Summary

**Key Takeaways:**
1. Always start by getting site ID
2. Create collections before adding fields
3. Use draft mode (`create_item`) not live mode
4. Field slugs are kebab-case versions of displayNames
5. Save all IDs as you go
6. Create referenced items before creating references
7. Multi-references are arrays, single references are strings
8. Items work fine as drafts, publishing is optional

**Most Common Operations:**
- `sites_list` - Get site ID
- `collections_create` - Create collection
- `collection_fields_create_static` - Add text/number/boolean fields
- `collection_fields_create_reference` - Add relationships
- `collections_items_create_item` - Create items (draft mode)
- `collections_items_update_items` - Update items
- `collections_get` - Check collection structure and field slugs

This guide covers 95% of common CMS operations. For edge cases, consult the Webflow API documentation or use `webflow_guide_tool` for additional guidance.

---

## Appendix: Component Registry Schema (webcn Site)

This section documents the actual collections created for the component registry on the webcn site.

### Site Information

- **Site ID**: `69036070772daa1ecd30cbde`
- **Site Name**: webcn
- **Created**: 2025-10-30

### Collections Created

#### 1. Libraries Collection

**Collection ID**: `69080ad05b5bb9a43ab2897f`

**Fields Schema**:

| Field | Type | Slug | Field ID | Required | Description |
|-------|------|------|----------|----------|-------------|
| Name | PlainText | `name` | `cae0766c6094f63d1b6183eabe029e37` | Yes | Library display name |
| Slug | PlainText | `slug` | `dcc76911a7f9cbc30a2b80f92daf15a1` | Yes | URL-friendly identifier |
| Library ID | PlainText | `library-id` | `acb6e90c2bcaabcb8290d8279937d80d` | No | Unique library identifier (e.g., flowcode-core) |
| Description | RichText | `description` | `54d1df23bfd4b6ccf874f47d4cb62da2` | No | Library description and purpose |
| Deploy Enabled | Switch | `deploy-enabled` | `3db7291044b1820c203fe8757d332228` | No | Auto-deployment flag |
| Components | MultiReference | `components` | `b7236edfd29ed14b4343d88811a90c89` | No | References to Components collection |

**Library Items Created** (6 total):

1. **Flowcode Core** - `69080b11c5c5bb9af60c7c89`
   - Library ID: `flowcode-core`
   - Deploy Enabled: `true`
   - Components: 6 (Login Form, Registration Form, Post Editor, Navigation, Dashboard, Hello User)

2. **Flowcode Analytics** - `69080b1b74c43601b928ad94`
   - Library ID: `flowcode-analytics`
   - Deploy Enabled: `true`
   - Components: 3 (Chart Test, Pie Chart, Bar Chart)

3. **Flowcode Interactive 3D** - `69080b1b74c43601b928ad97`
   - Library ID: `flowcode-interactive`
   - Deploy Enabled: `false`
   - Components: 4 (Lanyard, Blue Slider, Red Slider, LaserFlow Hero)

4. **webcn Landing Page** - `69080b1b74c43601b928ad9a`
   - Library ID: `webcn-landing`
   - Deploy Enabled: `true`
   - Components: 5 (Navbar, Hero, Features, Footer, Waitlist Section)

5. **Flowcode Waitlist** - `69080b1b74c43601b928ad9d`
   - Library ID: `flowcode-waitlist`
   - Deploy Enabled: `true`
   - Components: 2 (Waitlist Capture, Waitlist Admin)

6. **Component Registry Dashboard** - `69080b1b74c43601b928ada0`
   - Library ID: `blogflow-registry-dashboard`
   - Deploy Enabled: `true`
   - Components: 6 (Component Grid, Detail Header, Detail Preview, Detail Props, Detail Usage, Detail Sidebar)

#### 2. Components Collection

**Collection ID**: `6908065569747d13e82a4416`

**Fields Schema**:

| Field | Type | Slug | Field ID | Required | Description |
|-------|------|------|----------|----------|-------------|
| Name | PlainText | `name` | `6d0d774d756d905cb48317be0fa0262d` | Yes | Component display name |
| Slug | PlainText | `slug` | `6069a13965f1f9dd5e5de462a4b0ab69` | Yes | URL-friendly identifier |
| Component ID | PlainText | `component-id` | `32997d484b0961e5eeeb7b97a2161570` | No | Unique component identifier |
| Description | RichText | `description` | `bf497bbb7c8e5f4d2e6ef490040e1fdd` | No | Component description and purpose |
| Category | PlainText | `category` | `f5ce00621c94d52605389102a59c278c` | No | Component category |
| Library | Reference | `library` | `68c2e0fa1e652342e57b344d34bddd27` | No | Reference to Libraries collection |
| Tags | PlainText | `tags` | `0389d7ad5d16519a4f110e90e4b4366a` | No | Comma-separated searchable tags |
| Dependencies | PlainText | `dependencies` | `090c91e207fdec533ad372a446a15ba5` | No | NPM dependencies (comma-separated) |
| Backend Dependencies | PlainText | `backend-dependencies` | `b29dd8ff2122fb9fcbcabf0b92750c74` | No | oRPC endpoints used (comma-separated) |
| Usage Example | RichText | `usage-example` | `9fd18d799d3439c1505f5b2c61f33c3e` | No | Code example with copy button |
| File Path | PlainText | `file-path` | `4e0cb704b77d994e2d0bdbf77c8d6791` | No | Path to .webflow.tsx file |

**Component Items Created** (21 total):

**Core Library (6 components):**
1. Login Form - `69080b3e5b5bb9a43ab2c754`
2. Registration Form - `69080b3e5b5bb9a43ab2c758`
3. Post Editor - `69080b3e5b5bb9a43ab2c75c`
4. Navigation - `69080b3e5b5bb9a43ab2c760`
5. Dashboard - `69080b3e5b5bb9a43ab2c764`
6. Hello User - `69080b3e5b5bb9a43ab2c768`

**Analytics Library (3 components):**
1. Chart Test - `69080b4a1aa6f2bdca97c785`
2. Pie Chart - `69080b4a1aa6f2bdca97c789`
3. Bar Chart - `69080b4a1aa6f2bdca97c78d`

**Interactive Library (4 components):**
1. Lanyard - `69080b5a1d3ee4bea76ac5c1`
2. Blue Slider - `69080b5a1d3ee4bea76ac5c5`
3. Red Slider - `69080b5a1d3ee4bea76ac5c9`
4. LaserFlow Hero - `69080b5a1d3ee4bea76ac5cd`

**webcn Landing Page Library (5 components):**
1. Navbar - `69080b69c5c5bb9af60c8bc9`
2. Hero - `69080b69c5c5bb9af60c8bcd`
3. Features - `69080b69c5c5bb9af60c8bd1`
4. Footer - `69080b69c5c5bb9af60c8bd5`
5. Waitlist Section - `69080b69c5c5bb9af60c8bd9`

**Waitlist Library (2 components):**
1. Waitlist Capture - `69080b74b6cdf09721de1144`
2. Waitlist Admin - `69080b74b6cdf09721de1148`

**Registry Dashboard Library (6 components):**
1. Component Grid - `69080b8469e967b7aee43048`
2. Component Detail Header - `69080b8469e967b7aee4304c`
3. Component Detail Preview - `69080b8469e967b7aee43050`
4. Component Detail Props - `69080b8469e967b7aee43054`
5. Component Detail Usage - `69080b8469e967b7aee43058`
6. Component Detail Sidebar - `69080b8469e967b7aee4305c`

### Relationship Structure

**Bidirectional References:**
- Each Library item has a `components` field (MultiReference) linking to Component items
- Each Component item has a `library` field (Reference) linking back to its parent Library item

**Example Queries:**

```typescript
// Get a library with all its components
collections_items_list_items({
  collection_id: "69080ad05b5bb9a43ab2897f", // Libraries
  // Filter by specific library if needed
})

// Get a component with its library reference
collections_items_list_items({
  collection_id: "6908065569747d13e82a4416", // Components
  // Filter by component ID if needed
})
```

### Usage Notes

1. **All items are in draft status** - Can be published via Webflow CMS interface or API
2. **References are fully linked** - Both directions of the relationship are established
3. **Metadata is complete** - All components include description, category, tags, dependencies, usage examples, and file paths
4. **Searchable by tags** - Components can be filtered by comma-separated tags
5. **Backend integration documented** - Each component lists required oRPC endpoints

### Future Enhancements

Potential fields to add:
- `version` (PlainText) - Component version number
- `preview-url` (Link) - Direct link to live preview
- `demo-video` (Video) - Component demo video
- `status` (Option) - Development status (stable, beta, deprecated)
- `props-schema` (RichText/JSON) - Structured props documentation
- `last-updated` (DateTime) - Track component updates
