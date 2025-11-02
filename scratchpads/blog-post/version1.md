# Building a Full-Stack Component Library for Webflow: A Hackathon Journey

*How exploring Webflow Code Components led to solving Shadow DOM isolation, achieving end-to-end type safety, and building production-grade applications in an unexpected place.*

---

## The Unexpected Discovery

Here's a confession: when I signed up for the Webflow x Contra hackathon, I had no idea what I was going to build.

I'd heard whispers about Webflow's Code Components feature - supposedly you could build React components and deploy them straight into Webflow sites. Cool concept, but I'd never actually tried it. The hackathon seemed like the perfect excuse to stop reading docs and start breaking things.

So I opened up a fresh Next.js project and started tinkering.

What I discovered over the next few days completely changed my mental model of what Webflow could be. This isn't a story about building another blog platform. It's about stumbling into an architecture that makes full-stack, type-safe applications possible in a no-code builder.

And it all started with a seemingly simple question: *How do you make React components talk to each other when they're trapped in separate Shadow DOM prisons?*

---

## Act I: The Shadow DOM Problem

My first Code Component was embarrassingly simple - just a button that logged something to the console. But the workflow? *Chef's kiss.*

Write React with TypeScript, wrap it in `declareComponent()`, define some props with types, and boom - it appears in Webflow's visual editor like any native element. The developer experience was suspiciously smooth.

**[IMAGE: Screenshot of a basic Code Component in Webflow's visual editor with the props panel open]**

Encouraged, I started building more components: a login form, a dashboard, a navigation bar. Each one worked perfectly in isolation. And that's when I hit the wall.

The components couldn't talk to each other.

Here's what was happening: **Webflow Code Components render in isolated Shadow DOM boundaries**. It's a browser feature designed to prevent CSS leakage and DOM conflicts - perfect for component isolation, terrible for component communication.

**[DIAGRAM: Visual representation of 3 Code Components on a Webflow page, each enclosed in separate Shadow DOM bubbles with X marks between them showing they can't communicate]**

If you're a React developer, your first instinct is probably the same as mine: "Just use Context!"

Except Context doesn't cross Shadow DOM boundaries. Each component is a completely isolated island. They might as well be on different pages.

I tried the obvious workarounds:
- **Props?** Sure, if you enjoy manually threading state through Webflow's visual editor.
- **Custom events?** Works, but feels like we're back in 2010 dispatching DOM events like it's jQuery.
- **LocalStorage polling?** Please. I have *some* dignity.

I was starting to think that Code Components were fundamentally limited to simple, isolated widgets. Authentication systems, dashboards, multi-step forms - anything requiring shared state was off the table.

Then I remembered something I'd glossed over in the Zustand docs.

---

## Act II: The Eureka Moment

**Zustand doesn't use React Context.**

That single fact changed everything.

Zustand is a state management library built on a simple premise: store your state in a JavaScript singleton - a single, shared object that lives completely outside the React component tree. Components subscribe to it directly via hooks, bypassing Context entirely.

And here's the beautiful, elegant consequence: **Shadow DOM boundaries don't matter to JavaScript singletons.**

Let me show you what that looks like in practice:

```typescript
// lib/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      person: null,
      isAuthenticated: false,

      setAuth: (user, person) =>
        set({ user, person, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, person: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
```

This single store lives in JavaScript memory, accessible from *any* component on the page. Then, in any Code Component:

```typescript
// In LoginForm.webflow.tsx
function LoginForm() {
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async (email, password) => {
    const user = await loginUser(email, password);
    setAuth(user); // Update global state
  };
  // ...
}

// In Dashboard.webflow.tsx (completely different Shadow DOM)
function Dashboard() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (!isAuthenticated) return <LoginPrompt />;
  return <div>Welcome back, {user.name}!</div>;
}

// In Navigation.webflow.tsx (yet another Shadow DOM)
function Navigation() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return (
    <nav>
      {isAuthenticated ? <LogoutButton /> : <LoginLink />}
    </nav>
  );
}
```

**[ANIMATION: Same diagram as before, but now with a glowing Zustand store floating above all components, with bi-directional arrows showing data flow crossing Shadow DOM boundaries]**

I logged in through the LoginForm component. The Dashboard, sitting in a completely different Shadow DOM root, instantly showed my user data. The Navigation component updated its buttons. A PostEditor component I'd added could check authentication status.

*It just worked.*

This was the first breakthrough. The moment I realized: **Webflow Code Components could be more than isolated widgets. They could be the building blocks of a unified application.**

The possibilities exploded. User authentication? Check. Shopping carts? Easy. Multi-step workflows? No problem. Any state that needed to be shared across components could live in a Zustand store.

But I was just getting started.

---

## Act III: The Type Safety Revelation

With client-side state solved, I turned my attention to the server. I wasn't building a toy project - if Code Components could power real applications, they needed real infrastructure.

That meant:
- A proper authentication system
- A database with schema validation
- CRUD operations with row-level security
- And here's the non-negotiable part: **end-to-end type safety**

Coming from the Next.js ecosystem, I'm spoiled by tools like tRPC that give you type inference from your API routes straight to your frontend. Change a database field? TypeScript errors show you *everywhere* that needs updating before you even refresh the browser.

I needed that same DX for Webflow Code Components.

Enter **oRPC**.

oRPC is a newer alternative to tRPC, inspired by its approach to type safety. But it has one killer advantage: it works in environments where you don't control the bundler - exactly the situation with Webflow Code Components, which get bundled by Webflow's infrastructure.

Here's the magic. You define your API procedures on your server:

```typescript
// Server: lib/api/routers/posts.ts
import { os } from '@orpc/server';
import { z } from 'zod';

export const postsRouter = os.router({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(['draft', 'published']).optional()
    }))
    .handler(async ({ input, context }) => {
      // context.userId is guaranteed non-null by protectedProcedure
      return await db.query.posts.findMany({
        where: and(
          eq(posts.authorId, context.userId),
          input.status ? eq(posts.status, input.status) : undefined
        ),
      });
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.any(), // Tiptap JSON
      excerpt: z.string().optional()
    }))
    .handler(async ({ input, context }) => {
      const slug = await generateUniqueSlug(input.title);
      return await db.insert(posts).values({
        ...input,
        slug,
        authorId: context.userId,
        status: 'draft',
      });
    }),
});
```

And then in *any* Webflow Code Component, you get full TypeScript inference:

```typescript
// Client: Any .webflow.tsx component
import { orpc } from '@/lib/orpc-client';

function PostEditor() {
  // Full type inference - no code generation!
  const { data: posts } = orpc.posts.list.useQuery({
    status: 'draft'
  });
  //     ^? Post[] - TypeScript knows the exact shape!

  const createPost = orpc.posts.create.useMutation({
    onSuccess: (data) => {
      //          ^? { id: string, title: string, slug: string, ... }
      console.log(`Created post with slug: ${data.slug}`);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      createPost.mutate({
        title: "My Post",
        content: editorState.toJSON(),
        // TypeScript error if you forget required fields!
      });
    }}>
      {/* ... */}
    </form>
  );
}
```

**[DIAGRAM: Flow chart showing type information flowing from PostgreSQL schema → Drizzle ORM → oRPC procedures → Client components, with TypeScript logos at each stage]**

No code generation step. No separate build process. Just pure TypeScript inference that works everywhere - your local Next.js dev server *and* your deployed Webflow components.

This was the second revelation: **I could build production-grade, type-safe applications entirely within Webflow.**

Want to add a new field to your posts table? Update the schema, and TypeScript immediately shows you every component that needs to handle the new field. Refactor an API endpoint? Your components light up with type errors if they're calling it wrong. Change validation rules? The errors surface instantly.

**[IMAGE: Side-by-side code editor screenshot showing a server-side type change causing a TypeScript error in a client component]**

The developer experience was identical to building a monolithic Next.js app - except the frontend was deploying to Webflow.

I started moving faster. Authentication forms with validation. A rich text editor with Tiptap. A dashboard listing posts. A publish workflow. Everything was type-safe, everything worked locally, and I was getting *way* too confident.

Then I deployed to production.

---

## Act IV: The Authentication Crisis

The first production deployment was... catastrophic.

Everything worked perfectly in local development. Login? Smooth. Create posts? No problem. Session persistence? Rock solid. Better Auth was setting session cookies, my API was validating them, life was good.

Then I opened the deployed Webflow site and tried to log in.

```
401 UNAUTHORIZED
[protectedProcedure] Auth check failed - missing userId or session
```

Wait, what? I *just* logged in. The auth store shows `isAuthenticated: true`. The user data is right there in localStorage. But every API call to a protected endpoint is getting rejected.

I spent the next three hours in console.log hell, adding logging everywhere:

```typescript
// In authStore after successful login
console.log('✅ Login successful, user:', user); // ✅ Working

// In API middleware
console.log('📦 Request headers:', request.headers); // 🤔 Suspicious

// In protectedProcedure
console.log('🔐 Session check:', session); // ❌ null
console.log('🆔 User ID:', userId); // ❌ undefined
```

The pattern was clear: the login API call worked (same-origin, same domain), but every subsequent authenticated API call failed. The session was getting created, but then... vanishing.

Finally, I checked the browser's Network tab and compared requests:

**Local Development (Vercel → Vercel):**
```
Request URL: https://my-app.vercel.app/api/orpc/posts/create
Cookie: __Secure-better-auth.session_token=abc123...
Sec-Fetch-Site: same-origin
✅ Status: 200 OK
```

**Production (Webflow → Vercel):**
```
Request URL: https://my-app.vercel.app/api/orpc/posts/create
Cookie: (empty)
Sec-Fetch-Site: cross-site
Origin: https://my-site.webflow.io
❌ Status: 401 Unauthorized
```

**The cookie header was missing.**

And then it clicked. Modern browsers block third-party cookies by default:
- Chrome 115+ blocks them
- Safari 16.4+ blocks them
- Firefox 120+ blocks them

My Webflow components were running on `*.webflow.io`. My API was on `*.vercel.app`. Different domains = third-party context = cookies blocked. The browser was silently refusing to send the session cookie with cross-origin requests.

**[DIAGRAM: Two-panel illustration showing:
Panel 1: Same-origin request (vercel.app → vercel.app) with cookie flowing through
Panel 2: Cross-origin request (webflow.io → vercel.app) with cookie being blocked by browser shield]**

This was a fundamental architectural problem. The entire authentication system relied on cookies, and cookies didn't work in the production environment.

I was dead in the water.

---

## Act V: The Bearer Token Breakthrough

I researched solutions frantically:

**Storage Access API?** It lets third-party contexts request cookie access, but requires an intrusive permission prompt. Imagine asking every user: "Do you want webflow.io to access cookies from vercel.app?" before they can log in. Non-starter.

**Proxy through Webflow?** Not supported by Code Components.

**Custom token system?** I could build one, but now I'm maintaining crypto primitives and refresh token logic. This was supposed to be a hackathon project, not a security audit.

Then I found a footnote in the Better Auth documentation about the bearer plugin. Bearer tokens - the industry-standard pattern for cross-origin auth. Instead of relying on cookies, you send an `Authorization: Bearer <token>` header with each request.

I'd been overthinking it. Better Auth already had the solution built in.

The implementation was surprisingly clean:

**1. Enable the bearer plugin:**
```typescript
// lib/auth/config.ts
import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';

export const auth = betterAuth({
  database: /* ... */,
  plugins: [
    bearer(), // That's it. One line.
  ],
});
```

**2. Create a token storage utility:**
```typescript
// lib/token-storage.ts
const TOKEN_KEY = 'better-auth.bearer-token';

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
```

**3. Update the oRPC client to send the token:**
```typescript
// lib/orpc-client.ts
import { RPCLink } from '@orpc/client';
import { getToken } from '@/lib/token-storage';

const link = new RPCLink({
  url: `${process.env.NEXT_PUBLIC_API_URL}/api/orpc`,
  credentials: 'include', // Still send cookies for same-origin
  headers: () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add bearer token if available (for cross-origin)
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },
});
```

**4. Extract and store the token on login:**
```typescript
// components/LoginForm.tsx
const handleLogin = async (email: string, password: string) => {
  // Call Better Auth API directly to get the token in response
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in/email`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await response.json();

  if (data.user && data.session) {
    // Extract the session token
    const sessionToken = data.session.token;

    // Store it in localStorage (domain: webflow.io)
    setToken(sessionToken);

    // Update Zustand store
    setAuth(data.user, data.person);

    console.log('✅ Bearer token stored, auth complete');
  }
};
```

**[DIAGRAM: Authentication flow diagram showing:
1. User logs in from webflow.io
2. API on vercel.app returns { user, session: { token } }
3. Token stored in webflow.io localStorage
4. Subsequent requests include Authorization: Bearer <token> header
5. Better Auth validates token on server
6. Request proceeds with authenticated context]**

I deployed the changes, held my breath, and clicked "Create Post" from a Webflow component.

The server logs lit up:

```
[oRPC] Request received: posts.create
[oRPC] Authorization header found: Bearer tPHxbusrg76O...
[Bearer Plugin] Token validated successfully
[oRPC] Context created: { hasSession: true, userId: 'ImZJ6...' }
[protectedProcedure] Auth check passed ✅
[posts.create] Person lookup: { found: true, personId: 'xPI1...' }
[posts.create] Generating unique slug...
[posts.create] Post created: { id: 'Ai9fW...', slug: 'my-first-post' }
[oRPC] Handler response: { status: 200, ok: true }
```

**It worked.**

From a component running on `webflow.io`, making requests to `vercel.app`:
- ✅ Full authentication
- ✅ Session persistence across page loads
- ✅ Proper authorization on every endpoint
- ✅ Token stored securely in domain-specific localStorage
- ✅ Automatic inclusion in all API requests
- ✅ No permission prompts, no CORS hacks, no workarounds

**[IMAGE: Split screen showing browser devtools network tab with Authorization header on left, and server logs showing successful auth on right]**

The third breakthrough. The one that made everything else work in production. **Cross-origin authentication with bearer tokens.**

---

## What We Built: A Component Library for the Modern Web

As I cleaned up the code and added the final components, I realized what I'd actually built over the course of this hackathon.

It wasn't just a blog platform. It was a proof of concept for something much bigger: **a full-stack component library for Webflow.**

Think about what we've assembled here:

### The Stack

**Frontend (Webflow Code Components):**
- React 19 with full TypeScript support
- Zustand for state management across Shadow DOM boundaries
- TanStack Query (React Query) for server state
- Tiptap for rich text editing
- Tailwind CSS + shadcn/ui for components
- Form validation with React Hook Form + Zod

**Backend (Next.js on Vercel):**
- Next.js 15 with App Router
- oRPC for type-safe API procedures
- Better Auth with bearer token support
- Drizzle ORM with PostgreSQL
- Row-level security on all operations
- Automatic slug generation and conflict resolution

**The Architecture:**

**[DIAGRAM: Full system architecture showing:
- Webflow Site layer with multiple Code Components in Shadow DOM bubbles
- Zustand stores floating above, connecting all components
- HTTP layer showing oRPC requests with Bearer tokens
- Next.js API layer with oRPC router
- Better Auth middleware
- Database layer with Drizzle ORM
- PostgreSQL at the bottom]**

### The Components

So far, the library includes:

**Authentication Suite:**
- `LoginForm` - Email/password with validation
- `RegistrationForm` - Signup with auto-login
- `Dashboard` - Protected route with user profile
- `LogoutButton` - Session cleanup

**Content Management:**
- `PostEditor` - Rich text editor with Tiptap, auto-save, publish workflow
- `PostsList` - Filterable list of user's posts
- Status indicators, word counts, last edited timestamps

Each component is:
- ✅ Fully type-safe from DB to UI
- ✅ Production-ready with error handling
- ✅ Works seamlessly across Shadow DOM boundaries
- ✅ Handles both same-origin and cross-origin auth
- ✅ Styled with Tailwind CSS
- ✅ Responsive and accessible

**[IMAGE: Grid layout showing screenshots of each component in action]**

We're calling it "flow/cn" as a working title (a playful nod to shadcn/ui), but the name is very much still in the air. What matters is the vision: **a library of full-stack components that Webflow developers can drop into their sites, with the entire backend infrastructure already built, configured, and type-safe.**

Want to add user authentication to your Webflow site? Import the auth components, point them at your deployed Next.js backend, done. Need a blog CMS? Drop in the editor components. Building a SaaS dashboard? We've got starter components for that too.

All backed by a proper database, proper security, and proper type safety.

---

## The Hard-Won Lessons

The path to this architecture wasn't linear. Beyond the three main breakthroughs, we hit a bunch of smaller but equally important challenges:

### Slug Deduplication

Users could create multiple posts with the same title, causing database unique constraint violations: `duplicate key value violates unique constraint "posts_slug_unique"`.

The fix was automatic slug suffixing - if "hello" exists, try "hello-1", then "hello-2", etc:

```typescript
async function generateUniqueSlug(title: string): Promise<string> {
  let slug = generateSlug(title); // URL-safe version of title
  let attempt = 0;

  while (true) {
    const existing = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    });

    if (!existing) return slug;

    attempt++;
    slug = `${generateSlug(title)}-${attempt}`;
  }
}
```

Simple, but critical for production reliability.

### Session Revalidation Bug

Page refreshes were logging users out. Why? The session revalidation check was using a plain `fetch()` call without the bearer token:

```typescript
// ❌ Before: Missing auth token
const response = await fetch('/api/orpc/auth/getSession');

// ✅ After: Include bearer token
const token = getToken();
const response = await fetch('/api/orpc/auth/getSession', {
  headers: {
    'Authorization': token ? `Bearer ${token}` : '',
  },
});
```

Even session checks need authentication in a cross-origin context.

### Relative vs Absolute URLs

API calls from Webflow were resolving to `webflow.io/api/orpc` instead of `vercel.app/api/orpc`. Everything needed absolute URLs:

```typescript
// ❌ Before
const response = await fetch('/api/orpc/posts/create', /* ... */);

// ✅ After
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const response = await fetch(`${apiUrl}/api/orpc/posts/create`, /* ... */);
```

When you don't control the domain, you can't assume relative paths.

---

## What's Next: The Roadmap

We've validated the core architecture, but there's so much more to explore:

### Immediate Next Steps

**Expand the component library:**
- Payment forms (Stripe integration)
- File upload with progress indicators
- Data tables with sorting/filtering
- Analytics dashboards
- Multi-step forms with progress tracking
- Search components with autocomplete

**Developer tooling:**
- CLI for scaffolding new components
- Deployment automation scripts
- Component templates with best practices
- Testing utilities for Shadow DOM environments

**Documentation:**
- Getting started guide
- Component API references
- Authentication setup tutorial
- Deployment guide
- Best practices and patterns

### Advanced Features

**Token refresh mechanism:** Right now tokens last 7 days. Implement sliding window expiration for better UX.

**Multi-tab synchronization:** Use the BroadcastChannel API to sync state changes across browser tabs.

**Offline support:** Service workers + IndexedDB for local-first data.

**Server-side rendering:** Explore SSR for initial page loads (currently all client-side).

**Webflow CMS sync:** Two-way sync between our database and Webflow's CMS for public content.

### The Name

Most importantly: we need to find the right name. "flow/cn" is a placeholder that works for developers familiar with shadcn/ui, but we need something that captures the broader vision.

Something that says: *full-stack development, component-based architecture, production-ready infrastructure, all within Webflow.*

(Suggestions genuinely welcome.)

---

## The Bigger Picture: Rethinking Webflow's Possibilities

This hackathon project started as idle curiosity and evolved into a fundamental rethinking of what's possible within the Webflow ecosystem.

The traditional mental model of Webflow is: *a visual design tool for marketing sites and landing pages.* It's where designers build beautiful, responsive layouts without writing code. Where businesses launch their web presence. Where freelancers deliver client sites.

Code Components don't replace that model - they *expand* it.

With the architecture we've built here - Code Components + Zustand + oRPC + Bearer Auth - you can now build:

- **SaaS applications** with user authentication, dashboards, and admin panels
- **E-commerce platforms** with shopping carts, checkout flows, and order management
- **Content management systems** with multi-user editing, version control, and publishing workflows
- **Interactive tools** with real-time collaboration, data visualization, and complex state
- **Member communities** with profiles, messaging, and user-generated content

All living inside Webflow. All using Webflow's visual editor for layout and design. All backed by a robust, type-safe API layer.

**[DIAGRAM: Pyramid showing traditional Webflow use cases at the bottom (marketing sites, portfolios) expanding upward to new possibilities enabled by Code Components (SaaS apps, platforms, tools) at the top]**

Imagine building a SaaS product where:
- Your marketing pages are built visually in Webflow
- Your login and signup flows are Code Components with full auth
- Your user dashboard is composed of modular Code Components
- Your admin panel uses the same component library
- Everything shares a single design system
- Everything is type-safe
- Everything deploys together

That's not a hypothetical. That's what this architecture enables.

The hackathon ends, but the exploration is just beginning.

---

## Try It, Break It, Build With It

The code is open source, the patterns are reusable, and we'd love for you to explore what's possible.

Clone the repo. Deploy your own instance. Build a component we haven't thought of. Find the edge cases we missed. Push this architecture to its limits.

The patterns we've developed here - Zustand for Shadow DOM state management, oRPC for type-safe cross-origin APIs, bearer tokens for authentication - these are building blocks. Reusable primitives for anyone building with Webflow Code Components.

If you build something interesting, we want to see it. If you find a better approach to any of this, we want to learn from it. If you have ideas for components that should exist, let's talk.

This started as a hackathon project. It's become a proof of concept for a new way of building for the web.

Let's see where it goes next.

---

**Project Status:** Alpha / Proof of Concept
**Tech Stack:** React 19, Next.js 15, oRPC, Better Auth, Zustand, Drizzle ORM, PostgreSQL, TanStack Query, Tiptap, Tailwind CSS, shadcn/ui
**Deployment:** Webflow + Vercel
**License:** MIT
**Name:** TBD (seriously, help us with this)

**Read time:** ~12 minutes
**Hackathon:** Webflow x Contra Challenge
**Lessons learned:** More than we expected
**Coffee consumed:** Don't ask

---

*Have thoughts on the name? Built something with Code Components? Found a better way to solve Shadow DOM state? [Get in touch / drop a comment / find us on GitHub / your CTA here]*
