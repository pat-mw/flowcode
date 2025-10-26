# Webflow Routing Patterns & Code Component Navigation

## Understanding Webflow Routing Constraints

Webflow uses a **flat routing structure** with query parameters instead of nested dynamic routes. This is a key architectural difference from traditional Next.js or React Router applications.

### ✅ Webflow-Compatible Routes
```
/page                       Static page
/page?param=value           Page with query parameter
/page?id=123&mode=edit      Multiple query parameters
/blog/[slug]                CMS collection template (built-in Webflow feature)
```

### ❌ Not Compatible (Without Webflow Cloud)
```
/page/123                   Dynamic segment
/page/[id]                  Dynamic segment
/page/edit/123              Nested dynamic segment
/page/[category]/[id]       Multiple dynamic segments
```

### 🚀 Alternative: Webflow Cloud (Advanced)

If you deploy your Next.js app to Webflow Cloud, you can use traditional dynamic routes:
```
/api/posts/[id]            API routes with dynamic segments
/dashboard/posts/[id]/edit  Dynamic page routes
```

However, for this prototype, we're using **standalone Webflow pages with Code Components**, so we must use query parameters.

---

## Query Parameter Patterns

### Pattern 1: Single Resource ID

**Use Case:** Edit a specific post, view a specific user

```typescript
// URL: /dashboard/edit?post=123

// Read in component
const postId = new URLSearchParams(window.location.search).get('post');
// Returns: "123" (string)
```

**Navigation:**
```typescript
// Link
<a href="/dashboard/edit?post=123">Edit Post</a>

// Programmatic
window.location.href = `/dashboard/edit?post=${postId}`;

// Or with multiple params
const params = new URLSearchParams({ post: '123', mode: 'edit' });
window.location.href = `/dashboard/edit?${params.toString()}`;
```

### Pattern 2: Multiple Parameters

**Use Case:** Filtering, pagination, complex state

```typescript
// URL: /dashboard/posts?status=draft&page=2&sort=date

// Read in component
const params = new URLSearchParams(window.location.search);
const status = params.get('status');    // "draft"
const page = params.get('page');        // "2"
const sort = params.get('sort');        // "date"
```

**Navigation:**
```typescript
function updateFilters(status: string, page: number, sort: string) {
  const params = new URLSearchParams({
    status,
    page: page.toString(),
    sort,
  });
  
  window.location.href = `/dashboard/posts?${params.toString()}`;
}
```

### Pattern 3: Optional Parameters

**Use Case:** Component works with or without parameters

```typescript
// URL: /dashboard/editor (new post)
// URL: /dashboard/editor?post=123 (edit post)

const params = new URLSearchParams(window.location.search);
const postId = params.get('post'); // null or "123"

if (postId) {
  // Edit mode
  fetchPost(parseInt(postId, 10));
} else {
  // Create mode
  initializeNewPost();
}
```

---

## Custom Hooks for Query Parameters

### Basic Hook: Single Parameter

```typescript
// hooks/useQueryParam.ts
import { useState, useEffect } from 'react';

export function useQueryParam(key: string): string | null {
  const [value, setValue] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue(params.get(key));
    
    // Listen for URL changes (browser back/forward)
    const handleUrlChange = () => {
      const newParams = new URLSearchParams(window.location.search);
      setValue(newParams.get(key));
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [key]);
  
  return value;
}

// Usage
function PostEditor() {
  const postId = useQueryParam('post');
  
  if (!postId) {
    return <div>Creating new post...</div>;
  }
  
  return <div>Editing post {postId}</div>;
}
```

### Advanced Hook: Typed Parameters with Defaults

```typescript
// hooks/useQueryParam.ts
import { useState, useEffect, useCallback } from 'react';

export function useQueryParam<T = string>(
  key: string,
  defaultValue?: T,
  parser?: (value: string) => T
): [T | null, (value: T) => void] {
  const [value, setValue] = useState<T | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const paramValue = params.get(key);
    
    if (!paramValue) return defaultValue ?? null;
    
    return parser ? parser(paramValue) : (paramValue as unknown as T);
  });
  
  const updateValue = useCallback((newValue: T) => {
    const params = new URLSearchParams(window.location.search);
    
    if (newValue === null || newValue === undefined) {
      params.delete(key);
    } else {
      params.set(key, String(newValue));
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    setValue(newValue);
  }, [key]);
  
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const paramValue = params.get(key);
      
      if (!paramValue) {
        setValue(defaultValue ?? null);
        return;
      }
      
      setValue(parser ? parser(paramValue) : (paramValue as unknown as T));
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [key, defaultValue, parser]);
  
  return [value, updateValue];
}

// Usage examples
function PostsList() {
  // String parameter
  const [status, setStatus] = useQueryParam<string>('status', 'all');
  
  // Number parameter with parser
  const [page, setPage] = useQueryParam<number>(
    'page', 
    1, 
    (val) => parseInt(val, 10)
  );
  
  // Boolean parameter
  const [showArchived, setShowArchived] = useQueryParam<boolean>(
    'archived',
    false,
    (val) => val === 'true'
  );
  
  return (
    <div>
      <button onClick={() => setStatus('draft')}>Show Drafts</button>
      <button onClick={() => setPage(page + 1)}>Next Page</button>
      <button onClick={() => setShowArchived(!showArchived)}>
        Toggle Archived
      </button>
    </div>
  );
}
```

### Hook: Multiple Parameters Object

```typescript
// hooks/useQueryParams.ts
import { useState, useEffect, useCallback } from 'react';

export function useQueryParams<T extends Record<string, any>>(
  defaults?: Partial<T>
): [Partial<T>, (updates: Partial<T>) => void] {
  const [params, setParams] = useState<Partial<T>>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const result: any = { ...defaults };
    
    for (const [key, value] of urlParams.entries()) {
      result[key] = value;
    }
    
    return result;
  });
  
  const updateParams = useCallback((updates: Partial<T>) => {
    const currentParams = new URLSearchParams(window.location.search);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, String(value));
      }
    });
    
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    setParams(prev => ({ ...prev, ...updates }));
  }, []);
  
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const result: any = { ...defaults };
      
      for (const [key, value] of urlParams.entries()) {
        result[key] = value;
      }
      
      setParams(result);
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [defaults]);
  
  return [params, updateParams];
}

// Usage
interface PostsFilters {
  status: string;
  page: number;
  sort: string;
  search: string;
}

function PostsList() {
  const [filters, setFilters] = useQueryParams<PostsFilters>({
    status: 'all',
    page: 1,
    sort: 'date',
    search: '',
  });
  
  return (
    <div>
      <input 
        value={filters.search || ''} 
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      
      <select 
        value={filters.status} 
        onChange={(e) => setFilters({ status: e.target.value })}
      >
        <option value="all">All</option>
        <option value="draft">Drafts</option>
        <option value="published">Published</option>
      </select>
      
      <button onClick={() => setFilters({ page: filters.page + 1 })}>
        Next Page
      </button>
    </div>
  );
}
```

---

## Navigation Patterns

### Pattern 1: Simple Link Navigation

```typescript
// PostListItem.tsx
function PostListItem({ post }: { post: Post }) {
  return (
    <div className="post-item">
      <h3>{post.title}</h3>
      <div className="actions">
        <a href={`/dashboard/edit?post=${post.id}`}>Edit</a>
        <a href={`/blog/${post.slug}`}>View</a>
      </div>
    </div>
  );
}
```

### Pattern 2: Programmatic Navigation

```typescript
// PostActions.tsx
function PostActions({ postId }: { postId: number }) {
  const handleEdit = () => {
    window.location.href = `/dashboard/edit?post=${postId}`;
  };
  
  const handleView = async () => {
    const post = await orpc.posts.getById(postId);
    window.location.href = `/blog/${post.slug}`;
  };
  
  return (
    <div>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleView}>View</button>
    </div>
  );
}
```

### Pattern 3: Navigation with State Preservation

```typescript
// Preserve scroll position and state before navigating
function navigateToEdit(postId: number) {
  // Save current state to localStorage
  localStorage.setItem('posts-list-scroll', window.scrollY.toString());
  localStorage.setItem('posts-list-filters', JSON.stringify(filters));
  
  // Navigate
  window.location.href = `/dashboard/edit?post=${postId}`;
}

// Restore state on component mount
useEffect(() => {
  const savedScroll = localStorage.getItem('posts-list-scroll');
  const savedFilters = localStorage.getItem('posts-list-filters');
  
  if (savedScroll) {
    window.scrollTo(0, parseInt(savedScroll, 10));
    localStorage.removeItem('posts-list-scroll');
  }
  
  if (savedFilters) {
    setFilters(JSON.parse(savedFilters));
    localStorage.removeItem('posts-list-filters');
  }
}, []);
```

### Pattern 4: Navigation with Confirmation

```typescript
function PostEditor() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        window.location.href = '/dashboard/posts';
      }
    } else {
      window.location.href = '/dashboard/posts';
    }
  };
  
  return (
    <div>
      <button onClick={handleCancel}>Cancel</button>
      {/* Editor content */}
    </div>
  );
}
```

---

## Integration with React Query

### Fetching Data Based on Query Parameters

```typescript
// PostEditor.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { useQueryParam } from '@/hooks/useQueryParam';
import { orpc } from '@/lib/orpc-client';

function PostEditor() {
  const postId = useQueryParam('post');
  const isEditMode = !!postId;
  
  // Fetch post data if in edit mode
  const { data: post, isLoading } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => orpc.posts.getById(parseInt(postId!, 10)),
    enabled: isEditMode, // Only fetch when postId exists
  });
  
  // Create mutation for new posts
  const createMutation = useMutation({
    mutationFn: (data: CreatePostInput) => orpc.posts.create(data),
    onSuccess: (newPost) => {
      // Navigate to edit mode after creating
      window.location.href = `/dashboard/edit?post=${newPost.id}`;
    },
  });
  
  // Update mutation for existing posts
  const updateMutation = useMutation({
    mutationFn: (data: UpdatePostInput) => 
      orpc.posts.update({ id: parseInt(postId!, 10), ...data }),
  });
  
  const handleSave = (data: any) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  if (isEditMode && isLoading) {
    return <div>Loading post...</div>;
  }
  
  return (
    <div>
      <h1>{isEditMode ? 'Edit Post' : 'Create Post'}</h1>
      {/* Editor form */}
    </div>
  );
}
```

### Query Invalidation After Navigation

```typescript
// After creating a post and navigating to edit mode,
// invalidate the posts list cache
createMutation.mutate(data, {
  onSuccess: (newPost) => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    window.location.href = `/dashboard/edit?post=${newPost.id}`;
  },
});
```

---

## URL State Synchronization

### Syncing Filters with URL

```typescript
function PostsList() {
  const [filters, setFilters] = useQueryParams<{
    status: string;
    search: string;
    page: number;
  }>({
    status: 'all',
    search: '',
    page: 1,
  });
  
  // Fetch posts based on URL params
  const { data: posts } = useQuery({
    queryKey: ['posts', filters],
    queryFn: () => orpc.posts.list({
      status: filters.status !== 'all' ? filters.status : undefined,
      limit: 20,
      offset: (filters.page - 1) * 20,
    }),
  });
  
  // Update URL when filters change
  const handleStatusChange = (status: string) => {
    setFilters({ status, page: 1 }); // Reset to page 1 when filtering
  };
  
  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        placeholder="Search posts..."
      />
      
      <select value={filters.status} onChange={(e) => handleStatusChange(e.target.value)}>
        <option value="all">All</option>
        <option value="draft">Drafts</option>
        <option value="published">Published</option>
      </select>
      
      {posts?.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
      
      <div className="pagination">
        <button 
          onClick={() => setFilters({ page: filters.page - 1 })}
          disabled={filters.page === 1}
        >
          Previous
        </button>
        <span>Page {filters.page}</span>
        <button onClick={() => setFilters({ page: filters.page + 1 })}>
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## Webflow CMS Template Pages (Dynamic Routes)

Webflow **does** support dynamic routes for CMS collection items:

```
/blog/[slug]              ✅ Works natively in Webflow
/products/[product-slug]  ✅ Works natively in Webflow
/category/[category-name] ✅ Works natively in Webflow
```

These are **not** Code Components - they're native Webflow CMS template pages.

### How to Set Up CMS Template Pages

1. **Create Collection:** Create a CMS collection (e.g., "Blog Posts")
2. **Add Slug Field:** Add a slug field to the collection
3. **Create Template Page:** Webflow automatically creates `/blog/[slug]` template
4. **Design Template:** Use Webflow Designer to style the template with dynamic fields

### Using CMS Data in Code Components on Template Pages

```typescript
// RelatedPosts.webflow.tsx
// This component can be placed on the /blog/[slug] template page

function RelatedPosts() {
  // Get current post slug from URL
  const slug = window.location.pathname.split('/').pop();
  
  // Fetch related posts
  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', slug],
    queryFn: async () => {
      // First, get the current post to find its tags
      const currentPost = await orpc.posts.getBySlug(slug);
      
      // Then fetch related posts with similar tags
      return orpc.posts.publicList({
        tags: currentPost.tags,
        limit: 3,
        exclude: currentPost.id,
      });
    },
  });
  
  return (
    <div className="related-posts">
      <h3>Related Posts</h3>
      {relatedPosts?.map(post => (
        <a key={post.id} href={`/blog/${post.slug}`}>
          {post.title}
        </a>
      ))}
    </div>
  );
}
```

---

## Best Practices

### 1. Always Type-Check Query Parameters

```typescript
// ❌ Bad: Assumes parameter exists
const postId = new URLSearchParams(window.location.search).get('post')!;
const post = await fetchPost(parseInt(postId, 10));

// ✅ Good: Validates parameter exists
const postId = new URLSearchParams(window.location.search).get('post');

if (!postId) {
  return <div>Post ID is required</div>;
}

const numericPostId = parseInt(postId, 10);

if (isNaN(numericPostId)) {
  return <div>Invalid post ID</div>;
}

const post = await fetchPost(numericPostId);
```

### 2. Use Custom Hooks for Reusability

```typescript
// ✅ Good: Reusable hook
const postId = useQueryParam('post');
const userId = useQueryParam('user');
const mode = useQueryParam('mode');

// ❌ Bad: Duplicate code
const params1 = new URLSearchParams(window.location.search);
const postId = params1.get('post');

const params2 = new URLSearchParams(window.location.search);
const userId = params2.get('user');
```

### 3. Preserve Query Parameters When Navigating

```typescript
// ✅ Good: Preserves existing params
function addFilter(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  window.location.href = `${window.location.pathname}?${params.toString()}`;
}

// ❌ Bad: Overwrites all params
function addFilter(key: string, value: string) {
  window.location.href = `${window.location.pathname}?${key}=${value}`;
}
```

### 4. Handle Missing Parameters Gracefully

```typescript
function PostEditor() {
  const postId = useQueryParam('post');
  
  // ✅ Good: Clear fallback behavior
  if (!postId) {
    return <CreateNewPost />;
  }
  
  return <EditExistingPost postId={parseInt(postId, 10)} />;
}
```

### 5. Use Descriptive Parameter Names

```typescript
// ✅ Good: Clear parameter names
/dashboard/edit?post=123
/dashboard/posts?status=draft&page=2&sort=date

// ❌ Bad: Unclear parameter names
/dashboard/edit?id=123
/dashboard/posts?s=draft&p=2&o=date
```

---

## Comparison: Traditional Routes vs. Query Parameters

| Feature | Traditional Routes | Query Parameters |
|---------|-------------------|------------------|
| URL Pattern | `/posts/123/edit` | `/edit?post=123` |
| SEO Friendly | ✅ More semantic | ⚠️ Less semantic |
| Bookmarkable | ✅ Yes | ✅ Yes |
| Shareable | ✅ Yes | ✅ Yes |
| Browser Back | ✅ Works | ✅ Works |
| Type Safety | ✅ With TypeScript routing | ⚠️ Always strings |
| Webflow Native | ❌ Requires Cloud | ✅ Works everywhere |
| Implementation | Framework-dependent | Standard Web API |
| Analytics Tracking | ✅ Easier | ⚠️ Requires parsing |

---

## Troubleshooting

### Problem: Query Parameters Not Updating

**Symptom:** Changing URL query parameters doesn't re-render component

**Solution:** Add `popstate` event listener

```typescript
useEffect(() => {
  const handleUrlChange = () => {
    // Re-read query parameters
    const params = new URLSearchParams(window.location.search);
    setPostId(params.get('post'));
  };
  
  window.addEventListener('popstate', handleUrlChange);
  return () => window.removeEventListener('popstate', handleUrlChange);
}, []);
```

### Problem: Query Parameters Lost on Page Refresh

**Symptom:** Query parameters disappear when page is refreshed

**Solution:** Query parameters in the URL are preserved on refresh. The issue is likely in how you're reading them. Make sure to read from `window.location.search` on component mount:

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('post');
  setPostId(id);
}, []); // Empty dependency array - runs once on mount
```

### Problem: Special Characters in Query Parameters

**Symptom:** Query parameters with spaces or special characters break

**Solution:** Always encode/decode URI components

```typescript
// ✅ Encoding
const searchTerm = "Hello World!";
const params = new URLSearchParams({ search: searchTerm });
window.location.href = `/search?${params.toString()}`;
// Result: /search?search=Hello+World%21

// ✅ Decoding (automatic with URLSearchParams)
const params = new URLSearchParams(window.location.search);
const search = params.get('search'); // "Hello World!"
```

### Problem: Multiple Values for Same Parameter

**Symptom:** Need to pass array of values (e.g., multiple tags)

**Solution:** Use comma-separated values or multiple parameters

```typescript
// Option 1: Comma-separated
const tags = ['javascript', 'react', 'typescript'];
const params = new URLSearchParams({ tags: tags.join(',') });
// Result: ?tags=javascript,react,typescript

const urlParams = new URLSearchParams(window.location.search);
const tagsStr = urlParams.get('tags');
const tagsArray = tagsStr ? tagsStr.split(',') : [];

// Option 2: Multiple parameters (less common in Webflow)
const params = new URLSearchParams();
tags.forEach(tag => params.append('tag', tag));
// Result: ?tag=javascript&tag=react&tag=typescript
```

---

## Complete Example: PostEditor Component

```typescript
// components/PostEditor.webflow.tsx
import { declareComponent } from '@webflow/designer';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { orpc } from '@/lib/orpc-client';
import { useAuthStore } from '@/stores/authStore';
import { useQueryParam } from '@/hooks/useQueryParam';

function PostEditorComponent() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Read post ID from query parameter
  const postId = useQueryParam('post');
  const isEditMode = !!postId;
  
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  
  // Fetch existing post if in edit mode
  const { data: post, isLoading } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => orpc.posts.getById(parseInt(postId!, 10)),
    enabled: isEditMode,
  });
  
  // Initialize editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: post?.content || '',
  });
  
  // Populate fields when post loads
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setExcerpt(post.excerpt || '');
      editor?.commands.setContent(post.content);
    }
  }, [post, editor]);
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => orpc.posts.create(data),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Navigate to edit mode with the new post ID
      window.location.href = `/dashboard/edit?post=${newPost.id}`;
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => 
      orpc.posts.update({ id: parseInt(postId!, 10), ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
  
  const handleSave = () => {
    const content = editor?.getJSON();
    const data = { title, content, excerpt };
    
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleCancel = () => {
    window.location.href = '/dashboard/posts';
  };
  
  if (!user) {
    return <div>Please log in to continue</div>;
  }
  
  if (isEditMode && isLoading) {
    return <div>Loading post...</div>;
  }
  
  return (
    <div className="post-editor">
      <div className="header">
        <h1>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
        <div className="actions">
          <button onClick={handleCancel}>Cancel</button>
          <button 
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending 
              ? 'Saving...' 
              : 'Save'}
          </button>
        </div>
      </div>
      
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title..."
        className="title-input"
      />
      
      <textarea
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Brief excerpt..."
        className="excerpt-input"
      />
      
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}

export default declareComponent(PostEditorComponent, {
  displayName: 'Post Editor',
  description: 'Create and edit blog posts',
});
```

---

This guide covers all the essential patterns for working with query parameters in Webflow Code Components!

