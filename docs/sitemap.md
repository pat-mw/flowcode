# Blog Platform Sitemap

## Version 1: Simple Sitemap (Pages & Paths)

### Public Pages
```
/                           Home page with featured posts
/login                      User login
/register                   User registration
/blog                       Public blog index (all published posts)
/blog/[slug]                Individual blog post (Webflow CMS template)
/about                      About page (static)
```

**Note:** The `/blog/[slug]` route is a native Webflow CMS collection template page, not a Code Component page.

### Protected Pages (Require Authentication)
```
/dashboard                  User dashboard overview
/dashboard/posts            User's posts list (drafts + published)
/dashboard/new              Create new post
/dashboard/edit?post=[id]   Edit existing post (query param)
/dashboard/profile          User profile settings
```

**Note:** Webflow routes use query parameters instead of dynamic path segments (e.g., `/edit?post=123` instead of `/edit/123`)

### API Routes
```
/api/orpc/[...all]         oRPC API handler (all procedures)
/api/upload                Image upload endpoint
/api/health                Health check endpoint
```

---

## Version 2: Detailed Sitemap (Components + Server Interactions)

### 🎯 Important: Webflow Routing Constraints

**Webflow uses query parameters instead of dynamic path segments for client-side routing.**

#### Route Patterns:
- ✅ **Correct:** `/dashboard/edit?post=123`
- ❌ **Incorrect:** `/dashboard/edit/123` (requires Webflow Cloud deployment)

#### Reading Query Parameters in Code Components:

```typescript
// In any Webflow Code Component
import { useEffect, useState } from 'react';

function PostEditor() {
  const [postId, setPostId] = useState<number | null>(null);
  
  useEffect(() => {
    // Parse query parameters from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('post');
    
    if (id) {
      setPostId(parseInt(id, 10));
    }
  }, []);
  
  // Use postId to fetch/edit post
  // ...
}
```

#### Alternative: Custom Hook for Query Params

```typescript
// hooks/useQueryParam.ts
import { useState, useEffect } from 'react';

export function useQueryParam(key: string): string | null {
  const [value, setValue] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue(params.get(key));
    
    // Listen for URL changes
    const handleUrlChange = () => {
      const newParams = new URLSearchParams(window.location.search);
      setValue(newParams.get(key));
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [key]);
  
  return value;
}

// Usage in component
function PostEditor() {
  const postId = useQueryParam('post');
  
  const { data: post } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => orpc.posts.getById(parseInt(postId!, 10)),
    enabled: !!postId,
  });
  
  // ...
}
```

#### Navigation with Query Parameters

```typescript
// Navigate to edit page with post ID
function navigateToEdit(postId: number) {
  window.location.href = `/dashboard/edit?post=${postId}`;
}

// Or use native link
<a href={`/dashboard/edit?post=${post.id}`}>Edit Post</a>
```

---

### 🏠 Home Page
**Path:** `/`  
**Type:** Public  
**Description:** Landing page with hero, featured posts, and global map

#### Components Used:
- **FeaturedPosts** (Code Component)
  - 📥 Server Queries:
    - `posts.publicList()` - Fetch published posts
  - Props:
    - `limit`: number (default: 6)
    - `showMap`: boolean (default: true)

- **GlobalMap** (Code Component)
  - 📥 Server Queries:
    - `posts.publicList()` - Fetch all published posts with locations
  - Features:
    - Interactive map with post markers
    - Click marker to preview post
    - Filter by date/author

- **Hero Section** (Native Webflow)
  - Static content
  - No server interactions

---

### 🔐 Login Page
**Path:** `/login`  
**Type:** Public  
**Description:** User authentication page

#### Components Used:
- **LoginForm** (Code Component)
  - 📤 Server Mutations:
    - `auth.login(email, password)` - Authenticate user
  - Props:
    - `redirectUrl`: string (default: '/dashboard')
  - State Management:
    - Uses `authStore.setAuth()` on success
    - Stores JWT token in localStorage
  - Redirects:
    - ✅ Success → `/dashboard`
    - ❌ Already logged in → `/dashboard`

---

### 📝 Register Page
**Path:** `/register`  
**Type:** Public  
**Description:** New user registration

#### Components Used:
- **RegistrationForm** (Code Component)
  - 📤 Server Mutations:
    - `auth.register(email, password, name)` - Create new account
  - Props:
    - `redirectUrl`: string (default: '/dashboard')
  - Validation:
    - Email format validation
    - Password strength requirements (min 8 chars)
    - Name required
  - State Management:
    - Auto-login on success via `authStore.setAuth()`
  - Redirects:
    - ✅ Success → `/dashboard`
    - ❌ Already logged in → `/dashboard`

---

### 📰 Blog Index Page
**Path:** `/blog`  
**Type:** Public  
**Description:** List of all published blog posts

#### Components Used:
- **PublicPostsList** (Code Component)
  - 📥 Server Queries:
    - `posts.publicList()` - Fetch published posts
  - Props:
    - `postsPerPage`: number (default: 12)
    - `showExcerpt`: boolean (default: true)
    - `showAuthor`: boolean (default: true)
  - Features:
    - Pagination
    - Search/filter by title
    - Sort by date/popularity
  - No mutations (read-only)

- **PostCard** (Sub-component)
  - Display: Title, excerpt, author, publish date, cover image
  - Click → Navigate to `/blog/[slug]`

---

### 📄 Blog Post Detail Page
**Path:** `/blog/[slug]`  
**Type:** Public  
**Description:** Individual blog post page (Webflow CMS template)

#### Components Used:
- **Native Webflow CMS Template**
  - Content pulled from Webflow CMS
  - No Code Components
  - Dynamic content:
    - Post title
    - Post content (rich text)
    - Author info (reference to People collection)
    - Published date
    - Cover image
    - SEO metadata

- **RelatedPosts** (Optional Code Component)
  - 📥 Server Queries:
    - `posts.publicList()` - Fetch related posts by tags/category
  - Props:
    - `currentPostId`: number
    - `limit`: number (default: 3)

- **CommentSection** (Optional Code Component)
  - 📥 Server Queries:
    - `comments.list(postId)` - Fetch comments
  - 📤 Server Mutations:
    - `comments.create(postId, content)` - Add comment (requires auth)
  - Protected: Must be logged in to comment

---

### 🎛️ Dashboard Home
**Path:** `/dashboard`  
**Type:** Protected  
**Description:** User dashboard overview with stats and recent activity

#### Authentication:
- **Middleware:** Checks `authStore.user`
- **Redirect:** If not authenticated → `/login`

#### Components Used:
- **DashboardStats** (Code Component)
  - 📥 Server Queries:
    - `posts.list({ status: 'draft' })` - Count drafts
    - `posts.list({ status: 'published' })` - Count published
  - Display:
    - Total posts
    - Draft posts count
    - Published posts count
    - Total views (if implemented)
  - No mutations

- **RecentPosts** (Code Component)
  - 📥 Server Queries:
    - `posts.list({ limit: 5 })` - Fetch 5 most recent posts
  - Props:
    - `limit`: number (default: 5)
  - Features:
    - Quick edit button → `/dashboard/edit?post=[id]`
    - Quick publish button
  - 📤 Server Mutations:
    - `posts.publish(postId)` - Quick publish action

- **QuickActions** (Code Component)
  - Actions:
    - "New Post" → `/dashboard/new`
    - "View All Posts" → `/dashboard/posts`
    - "Edit Profile" → `/dashboard/profile`
  - No server interactions (navigation only)

---

### 📋 Posts List Page
**Path:** `/dashboard/posts`  
**Type:** Protected  
**Description:** List of all user's posts (drafts + published)

#### Authentication:
- **Middleware:** Checks `authStore.user`
- **Redirect:** If not authenticated → `/login`

#### Components Used:
- **PostsListManager** (Code Component)
  - 📥 Server Queries:
    - `posts.list()` - Fetch all user's posts
    - `posts.list({ status: 'draft' })` - Drafts tab
    - `posts.list({ status: 'published' })` - Published tab
  - Props:
    - `defaultTab`: 'all' | 'draft' | 'published' (default: 'all')
  - Features:
    - Tabs: All / Drafts / Published
    - Search by title
    - Sort by: Date created, Date updated, Title
    - Bulk actions: Delete, Publish
  - 📤 Server Mutations:
    - `posts.update(postId, { status })` - Change status
    - `posts.delete(postId)` - Delete post
    - `posts.publish(postId)` - Publish post
  - State Management:
    - Local state for filters/tabs
    - React Query for data caching
    - Optimistic updates on publish/delete

- **PostListItem** (Sub-component)
  - Display: Title, status, last edited, actions
  - Actions:
    - ✏️ Edit → `/dashboard/edit?post=[id]`
    - 🗑️ Delete → Confirm modal → `posts.delete()`
    - 📤 Publish → `posts.publish()`
    - 👁️ Preview (if published) → `/blog/[slug]`

---

### ✍️ New Post Page
**Path:** `/dashboard/new`  
**Type:** Protected  
**Description:** Create a new blog post

**Route Note:** Uses query parameter for mode: `/dashboard/new` for create mode

#### Authentication:
- **Middleware:** Checks `authStore.user`
- **Redirect:** If not authenticated → `/login`

#### Components Used:
- **PostEditor** (Code Component)
  - 📥 Server Queries:
    - None (creating new post)
  - 📤 Server Mutations:
    - `posts.create({ title, content, excerpt })` - Create draft
    - `posts.update(postId, updates)` - Auto-save
    - `posts.publish(postId)` - Publish post
  - Props:
    - `mode`: 'create' | 'edit' (default: 'create')
    - ⚠️ **No postId prop** - Read from query params instead
  - **Query Parameter Handling:**
    ```typescript
    // Component reads mode from URL
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') || 'create'; // Optional mode param
    ```
  - Features:
    - Rich text editor (Tiptap)
    - Title input
    - Excerpt input
    - Cover image upload
    - Auto-save every 30 seconds
    - Manual save button
    - Publish button
    - Preview mode toggle
  - State Management:
    - Local state for editor content
    - Debounced auto-save
    - Optimistic updates
    - `postsStore` for sharing state

- **EditorToolbar** (Sub-component)
  - Actions:
    - Bold, Italic, Underline
    - Headings (H1-H3)
    - Lists (bullet, numbered)
    - Link insertion
    - Image upload
    - Code block
    - Blockquote

- **ImageUploadModal** (Sub-component)
  - 📤 Server Mutations:
    - `/api/upload` - Upload image to storage
  - Features:
    - Drag & drop
    - File picker
    - Image preview
    - Alt text input
    - Returns image URL

- **SaveIndicator** (Sub-component)
  - Display save status:
    - "Saving..." (mutation pending)
    - "Saved" (mutation success)
    - "Error saving" (mutation error)
  - No server interactions (observes mutations)

---

### 📝 Edit Post Page
**Path:** `/dashboard/edit?post=[id]`  
**Type:** Protected  
**Description:** Edit existing blog post

**Route Note:** Post ID is passed as a query parameter. The component reads `?post=123` from the URL.

#### Authentication:
- **Middleware:** Checks `authStore.user` AND post ownership
- **Redirect:** 
  - If not authenticated → `/login`
  - If not owner → `/dashboard` (403)

#### Components Used:
- **PostEditor** (Code Component) - Same component as New Post, different mode
  - **Query Parameter Handling:**
    ```typescript
    // Component reads post ID from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post'); // e.g., "123"
    ```
  - 📥 Server Queries:
    - `posts.getById(postId)` - Fetch post data (initial load)
  - 📤 Server Mutations:
    - `posts.update(postId, updates)` - Save changes
    - `posts.publish(postId)` - Publish post
    - `posts.delete(postId)` - Delete post
  - Props:
    - ⚠️ **No props needed** - Reads from URL query params
  - Component Logic:
    ```typescript
    const postId = useQueryParam('post'); // Custom hook
    const isEditMode = !!postId;
    
    const { data: post } = useQuery({
      queryKey: ['posts', postId],
      queryFn: () => orpc.posts.getById(parseInt(postId!, 10)),
      enabled: !!postId, // Only fetch if postId exists
    });
    ```
  - Additional Features (vs New Post):
    - Delete button
    - Revision history (future feature)
    - Last edited timestamp
    - Status indicator (draft/published)

- **PostMetadataEditor** (Sub-component)
  - Edit:
    - Slug (with validation)
    - Excerpt
    - SEO title
    - SEO description
    - Tags/categories
  - 📤 Server Mutations:
    - `posts.update(postId, { metadata })` - Save metadata

- **PublishSettings** (Sub-component)
  - Options:
    - Publish date (schedule)
    - Visibility (public/private)
    - Comments enabled
  - 📤 Server Mutations:
    - `posts.update(postId, settings)` - Save settings
    - `posts.publish(postId)` - Execute publish

---

### 👤 Profile Page
**Path:** `/dashboard/profile`  
**Type:** Protected  
**Description:** User profile and settings

#### Authentication:
- **Middleware:** Checks `authStore.user`
- **Redirect:** If not authenticated → `/login`

#### Components Used:
- **ProfileEditor** (Code Component)
  - 📥 Server Queries:
    - `auth.getSession()` - Get current user
    - `people.getByUserId(userId)` - Get person profile
  - 📤 Server Mutations:
    - `people.update({ displayName, bio, avatar, website })` - Update profile
  - Features:
    - Display name input
    - Bio textarea
    - Avatar upload
    - Website URL input
    - Email (read-only, from auth)
  - State Management:
    - Local form state
    - Optimistic updates on save

- **AvatarUpload** (Sub-component)
  - 📤 Server Mutations:
    - `/api/upload` - Upload avatar image
  - Features:
    - Current avatar preview
    - Click to upload
    - Crop/resize (future feature)

- **AccountSettings** (Sub-component)
  - 📤 Server Mutations:
    - `auth.changePassword(old, new)` - Change password
    - `auth.updateEmail(newEmail)` - Update email (requires verification)
  - Features:
    - Change password form
    - Change email form
    - Two-factor authentication toggle (future)

- **DangerZone** (Sub-component)
  - 📤 Server Mutations:
    - `auth.deleteAccount()` - Delete user account (requires confirmation)
  - Features:
    - Delete account button
    - Confirmation modal with "type to confirm"
    - Warning about data loss

---

### 🌍 About Page
**Path:** `/about`  
**Type:** Public  
**Description:** Static about page

#### Components Used:
- **Native Webflow Elements**
  - Static content
  - No Code Components
  - No server interactions

---

## API Routes Detail

### 🔌 Main API Handler
**Path:** `/api/orpc/[...all]`  
**Type:** oRPC/tRPC handler  
**Description:** Central API endpoint for all procedures

#### Available Procedures:

##### **Auth Router** (`auth.*`)
- `auth.register(email, password, name)`
  - Creates new user account
  - Returns: User + Session token
  - Public
  
- `auth.login(email, password)`
  - Authenticates user
  - Returns: User + Session token
  - Public

- `auth.getSession()`
  - Gets current session
  - Returns: Session | null
  - Public

- `auth.logout()`
  - Invalidates session
  - Returns: Success boolean
  - Protected

- `auth.changePassword(oldPassword, newPassword)`
  - Updates user password
  - Returns: Success boolean
  - Protected

##### **Posts Router** (`posts.*`)
- `posts.list({ status?, limit?, offset? })`
  - Lists user's posts
  - Returns: Post[]
  - Protected

- `posts.getById(postId)`
  - Gets single post by ID
  - Returns: Post
  - Protected (must own post)

- `posts.create({ title, content, excerpt?, coverImage? })`
  - Creates new draft post
  - Returns: Post
  - Protected

- `posts.update(postId, { title?, content?, excerpt?, coverImage? })`
  - Updates existing post
  - Returns: Post
  - Protected (must own post)

- `posts.delete(postId)`
  - Deletes post
  - Returns: Success boolean
  - Protected (must own post)

- `posts.publish(postId)`
  - Publishes post to Webflow CMS
  - Returns: Post (with webflowItemId)
  - Protected (must own post)
  - Side effects: Syncs to Webflow

- `posts.unpublish(postId)` (future)
  - Unpublishes post
  - Returns: Post
  - Protected (must own post)

- `posts.publicList({ limit?, offset?, search? })`
  - Lists all published posts
  - Returns: Post[]
  - Public

##### **People Router** (`people.*`)
- `people.getByUserId(userId)`
  - Gets person profile
  - Returns: Person
  - Protected (must be self or admin)

- `people.update({ displayName?, bio?, avatar?, website? })`
  - Updates person profile
  - Returns: Person
  - Protected

##### **Comments Router** (`comments.*`) - Future Feature
- `comments.list(postId)`
  - Lists comments for post
  - Returns: Comment[]
  - Public

- `comments.create(postId, content)`
  - Creates comment
  - Returns: Comment
  - Protected

- `comments.delete(commentId)`
  - Deletes comment
  - Returns: Success boolean
  - Protected (must own comment)

---

### 📤 Image Upload
**Path:** `/api/upload`  
**Type:** REST endpoint  
**Description:** Handles image uploads

#### Request:
```typescript
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: FormData with 'file' field
```

#### Response:
```typescript
{
  url: string,          // Publicly accessible URL
  filename: string,     // Original filename
  size: number,         // File size in bytes
  mimeType: string      // MIME type
}
```

#### Features:
- File type validation (images only)
- Size limit: 5MB
- Resize/optimize images
- Upload to cloud storage (S3/Cloudinary/Vercel Blob)
- Generate unique filenames

---

### 🏥 Health Check
**Path:** `/api/health`  
**Type:** REST endpoint  
**Description:** System health check

#### Response:
```typescript
{
  status: 'healthy' | 'unhealthy',
  timestamp: string,
  services: {
    database: 'up' | 'down',
    auth: 'up' | 'down',
    webflow: 'up' | 'down'
  }
}
```

#### Use Cases:
- Monitoring/alerting
- Load balancer health checks
- Status page integration

---

## State Management Overview

### Global Stores (Zustand)

#### `authStore`
**Purpose:** Manage authentication state across all components

**State:**
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean
}
```

**Actions:**
- `setAuth(user, token)` - Set authenticated user
- `clearAuth()` - Logout user
- `updateUser(updates)` - Update user data

**Persistence:** localStorage (`auth-storage`)

**Used by:**
- LoginForm
- RegistrationForm
- DashboardStats
- PostEditor
- ProfileEditor
- All protected components

---

#### `postsStore`
**Purpose:** Share post data between editor and preview components

**State:**
```typescript
{
  currentPostId: number | null,
  posts: Record<number, Post>,
  filters: {
    status?: 'draft' | 'published',
    search?: string
  }
}
```

**Actions:**
- `setCurrentPost(postId)` - Set active post
- `updatePost(postId, updates)` - Update post data
- `removePost(postId)` - Remove post from store
- `setFilters(filters)` - Update list filters

**Persistence:** None (session only)

**Used by:**
- PostEditor
- PostsListManager
- RecentPosts
- SaveIndicator

---

### React Query Cache Keys

**Purpose:** Organize server state caching

```typescript
// Authentication
['session'] - Current user session

// Posts
['posts'] - All user's posts
['posts', status] - Filtered by status
['posts', postId] - Single post
['posts', 'public'] - Public posts list

// People
['people', userId] - Person profile

// Comments (future)
['comments', postId] - Post comments
```

---

## Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Landing (/)                          │
│  Components: Hero, FeaturedPosts, GlobalMap                 │
└───────┬─────────────────────────────────────────────────────┘
        │
        ├──→ /login ──→ [Login] ──→ /dashboard
        │                              │
        ├──→ /register ──→ [Register]─┘
        │
        └──→ /blog ──→ [PublicPostsList] ──→ /blog/[slug]
                                                    │
                                            [Post Detail]
                                                    │
                                    (if authenticated) ──→ [Comments]

┌─────────────────────────────────────────────────────────────┐
│                      Dashboard (/dashboard)                  │
│  Components: DashboardStats, RecentPosts, QuickActions      │
└───┬───────────────────────────────────────────┬─────────────┘
    │                                           │
    ├──→ /dashboard/posts                      ├──→ /dashboard/profile
    │      │                                    │      │
    │      └─→ [PostsListManager]              │      └─→ [ProfileEditor]
    │            │                              │            │
    │            ├──→ /dashboard/new            │            └─→ [AccountSettings]
    │            │      │                       │
    │            │      └─→ [PostEditor]        └──→ [Logout] ──→ /
    │            │
    │            └──→ /dashboard/edit?post=[id]
    │                   │
    │                   └─→ [PostEditor]
    │                         │
    │                         └─→ [Publish] ──→ Webflow CMS ──→ /blog/[slug]
    │
    └──→ /about (static)
```

---

## Component Dependency Matrix

| Component           | Auth Required | Server Queries                    | Server Mutations                           | Stores Used         |
|---------------------|---------------|-----------------------------------|--------------------------------------------|---------------------|
| LoginForm           | ❌            | None                              | auth.login                                 | authStore           |
| RegistrationForm    | ❌            | None                              | auth.register                              | authStore           |
| FeaturedPosts       | ❌            | posts.publicList                  | None                                       | None                |
| GlobalMap           | ❌            | posts.publicList                  | None                                       | None                |
| PublicPostsList     | ❌            | posts.publicList                  | None                                       | None                |
| DashboardStats      | ✅            | posts.list (drafts + published)   | None                                       | authStore           |
| RecentPosts         | ✅            | posts.list                        | posts.publish                              | authStore, postsStore |
| PostsListManager    | ✅            | posts.list                        | posts.update, posts.delete, posts.publish  | authStore, postsStore |
| PostEditor          | ✅            | posts.getById (edit mode)         | posts.create, posts.update, posts.publish  | authStore, postsStore |
| ProfileEditor       | ✅            | auth.getSession, people.getByUserId | people.update                            | authStore           |
| AccountSettings     | ✅            | auth.getSession                   | auth.changePassword, auth.updateEmail      | authStore           |
| ImageUploadModal    | ✅            | None                              | /api/upload                                | None                |
| RelatedPosts        | ❌            | posts.publicList                  | None                                       | None                |
| CommentSection      | ❌/✅*        | comments.list                     | comments.create* (requires auth)           | authStore           |

*CommentSection: Viewing is public, creating requires auth

---

## Webflow CMS Collections Integration

### Posts Collection
**Synced from:** PostgreSQL `posts` table  
**Triggered by:** `posts.publish()` mutation  
**Sync Direction:** One-way (PostgreSQL → Webflow)

**Fields Mapping:**
```
PostgreSQL           →    Webflow CMS
─────────────────────────────────────────
posts.title          →    title (PlainText)
posts.slug           →    slug (PlainText)
posts.excerpt        →    excerpt (PlainText)
posts.content (JSON) →    content (RichText, converted to HTML)
posts.coverImage     →    cover-image (ImageRef)
posts.authorId       →    author (ItemRef → People)
posts.publishedAt    →    published-date (DateTime)
posts.id             →    external-id (PlainText)
```

**Template Page:** `/blog/[slug]`  
**Used by:** Native Webflow CMS template

---

### People Collection
**Synced from:** PostgreSQL `people` table  
**Triggered by:** First time user publishes a post  
**Sync Direction:** One-way (PostgreSQL → Webflow)

**Fields Mapping:**
```
PostgreSQL              →    Webflow CMS
─────────────────────────────────────────
people.displayName      →    display-name (PlainText)
people.bio              →    bio (PlainText)
people.avatar           →    avatar (ImageRef)
people.website          →    website (Link)
people.id               →    external-id (PlainText)
```

**Used by:** Post detail pages (author info)

---

## Future Enhancements

### Additional Pages (Phase 2)
- `/dashboard/analytics` - Post analytics and insights
- `/dashboard/settings` - Advanced user settings
- `/dashboard/team` - Team management (multi-user accounts)
- `/tags/[tag]` - Posts filtered by tag
- `/author/[id]` - Author profile page

### Additional Components (Phase 2)
- **PostAnalytics** - View post performance
- **CommentModeration** - Manage comments
- **TeamInvites** - Invite collaborators
- **PostScheduler** - Schedule future posts
- **MediaLibrary** - Manage uploaded images

### Additional API Procedures (Phase 2)
- `posts.duplicate(postId)` - Duplicate a post
- `posts.restore(postId)` - Restore deleted post (soft delete)
- `analytics.getPostStats(postId)` - Get post analytics
- `team.invite(email)` - Invite team member
- `webhooks.configure()` - Configure Webflow webhooks

---

## SEO & Meta Tags

### Dynamic Meta Tags (Per Page)

**Home (`/`):**
```html
<title>Blog Platform - Share Your Stories</title>
<meta name="description" content="A modern blogging platform..." />
<meta property="og:type" content="website" />
```

**Blog Index (`/blog`):**
```html
<title>Blog Posts - Blog Platform</title>
<meta name="description" content="Browse all blog posts..." />
```

**Post Detail (`/blog/[slug]`):**
```html
<title>{post.title} - Blog Platform</title>
<meta name="description" content={post.excerpt} />
<meta property="og:type" content="article" />
<meta property="og:image" content={post.coverImage} />
<meta property="article:published_time" content={post.publishedAt} />
<meta property="article:author" content={post.author.displayName} />
```

**Dashboard Pages:**
```html
<meta name="robots" content="noindex, nofollow" />
```

---

## Performance Considerations

### Code Splitting
- Each Code Component is lazy-loaded
- Route-based code splitting in Next.js
- Dynamic imports for heavy libraries

### Caching Strategy
- **React Query staleTime:** 5 minutes (public posts), 30 seconds (user posts)
- **React Query cacheTime:** 10 minutes
- **Webflow CMS:** Cached by Webflow CDN
- **Static assets:** Long-term caching (immutable)

### Optimization Techniques
- Image optimization (Next.js Image)
- Virtual scrolling for long lists
- Debounced auto-save (30s)
- Optimistic updates for mutations
- Prefetch on hover (next/link)

---

This sitemap provides both high-level navigation and detailed component-level implementation details for the entire application.

