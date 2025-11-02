# Building a Full-Stack Component Library for Webflow: A Hackathon Journey

*How solving Shadow DOM isolation, achieving end-to-end type safety, and cracking cross-origin auth led to rethinking what's possible in Webflow.*

---

When I signed up for the Webflow x Contra hackathon, I had no idea what I was building. I'd heard about Code Components - the ability to deploy React components directly into Webflow sites - but never tried it. So I did what any curious developer does: started tinkering.

What I discovered completely changed my mental model of Webflow. This isn't a story about building another blog platform. It's about stumbling into an architecture that makes full-stack, type-safe applications possible in a visual builder.

It started with a deceptively simple question: *How do you make React components talk to each other when they're trapped in separate Shadow DOM prisons?*

---

## The Shadow DOM Problem

My first Code Component was embarrassingly simple - a button that logged to console. But the workflow? Smooth as butter. Write React with TypeScript, wrap it in `declareComponent()`, define props, and boom - it appears in Webflow's editor like any native element.

**[IMAGE: Screenshot of a basic Code Component in Webflow's visual editor with the props panel open]**

I built more components: a login form, a dashboard, a navigation bar. Each worked perfectly in isolation. Then I hit the wall: **they couldn't communicate.**

**Webflow Code Components render in isolated Shadow DOM boundaries** - perfect for preventing CSS conflicts, terrible for sharing state. React Context doesn't cross these boundaries. Each component is a completely isolated island.

**[DIAGRAM: 3 Code Components on a Webflow page, each enclosed in separate Shadow DOM bubbles with X marks between them]**

I tried the obvious workarounds:
- **Props?** Manually threading state through Webflow's visual editor? No thanks.
- **Custom events?** Feels like 2010 jQuery.
- **LocalStorage polling?** I have *some* dignity.

Then it clicked: **Zustand doesn't use React Context.**

---

## Breakthrough #1: Zustand Across Shadow DOM

Zustand stores state in a JavaScript singleton - a single shared object living completely outside the React tree. Components subscribe directly via hooks, bypassing Context entirely.

**The elegant consequence: Shadow DOM boundaries don't matter to JavaScript singletons.**

```typescript
// lib/stores/authStore.ts
export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => localStorage) }
  )
);
```

Now any component can access this store:

```typescript
// LoginForm.webflow.tsx - Updates auth state
const setAuth = useAuthStore(state => state.setAuth);

// Dashboard.webflow.tsx - Different Shadow DOM, instant access
const user = useAuthStore(state => state.user);
const isAuthenticated = useAuthStore(state => state.isAuthenticated);
```

**[ANIMATION: Diagram showing Zustand store floating above all components, with arrows showing data flow crossing Shadow DOM boundaries]**

I logged in through LoginForm. Dashboard (in a completely different Shadow DOM) instantly showed my user data. Navigation updated its buttons. A PostEditor checked auth status.

*It just worked.*

**First revelation:** Webflow Code Components could be more than isolated widgets. They could be the building blocks of a unified application.

---

## Breakthrough #2: End-to-End Type Safety with oRPC

If Code Components could power real applications, they needed real infrastructure: proper auth, database validation, row-level security, and - non-negotiably - **end-to-end type safety**.

Coming from Next.js, I'm spoiled by tools like tRPC. Change a database field? TypeScript shows you everywhere that needs updating before you even refresh.

Enter **oRPC** - a newer alternative to tRPC with one killer advantage: it works in environments where you don't control the bundler (exactly Webflow's situation).

```typescript
// Server: lib/api/routers/posts.ts
export const postsRouter = os.router({
  list: protectedProcedure
    .input(z.object({ status: z.enum(['draft', 'published']).optional() }))
    .handler(async ({ input, context }) => {
      return await db.query.posts.findMany({
        where: eq(posts.authorId, context.userId),
      });
    }),
});

// Client: Any .webflow.tsx component
const { data: posts } = orpc.posts.list.useQuery({ status: 'draft' });
//     ^? Post[] - TypeScript knows the exact shape!
```

**[DIAGRAM: Type information flowing from PostgreSQL → Drizzle ORM → oRPC → Client components]**

No code generation. No build step. Pure TypeScript inference that works everywhere - local dev *and* deployed Webflow components.

Add a field to your database? TypeScript immediately shows every component that needs updating. Refactor an endpoint? Type errors surface instantly.

**[IMAGE: Side-by-side showing server-side type change causing TypeScript error in client component]**

**Second revelation:** I could build production-grade, type-safe applications entirely within Webflow.

I moved fast. Auth forms with validation. Rich text editor. Dashboard. Publish workflow. Everything was type-safe, everything worked locally, and I was way too confident.

Then I deployed to production.

---

## The Authentication Crisis

Everything worked perfectly in local development. Then I opened the deployed Webflow site:

```
401 UNAUTHORIZED
[protectedProcedure] Auth check failed - missing userId or session
```

After three hours of debugging, I found the culprit: **third-party cookies**.

Webflow Code Components run on `*.webflow.io`. My API is on `*.vercel.app`. Modern browsers (Chrome 115+, Safari 16.4+, Firefox 120+) block third-party cookies by default. The session cookie Better Auth was setting? Silently refused.

**[DIAGRAM: Two panels showing same-origin (vercel→vercel) with cookies flowing vs cross-origin (webflow→vercel) with cookies blocked]**

The entire authentication system relied on cookies, and cookies didn't work in production. I was dead in the water.

---

## Breakthrough #3: Bearer Tokens

I researched frantically. Storage Access API? Requires intrusive permission prompts. Proxy through Webflow? Not supported. Custom token system? Way too complex for a hackathon.

Then I found it in the Better Auth docs: the bearer plugin. **Bearer tokens** - the industry standard for cross-origin auth. Instead of cookies, send an `Authorization: Bearer <token>` header with each request.

The implementation was surprisingly clean:

```typescript
// 1. Enable bearer plugin (lib/auth/config.ts)
export const auth = betterAuth({
  plugins: [bearer()], // One line
});

// 2. Configure oRPC client to send token
const link = new RPCLink({
  headers: () => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },
});

// 3. Extract and store token on login
const data = await loginAPI(email, password);
if (data.session?.token) {
  setToken(data.session.token); // localStorage on webflow.io
}
```

**[DIAGRAM: Auth flow showing login → token extraction → localStorage → Authorization header → validated request]**

I deployed and clicked "Create Post" from Webflow. The server logs lit up:

```
[Bearer Plugin] Token validated successfully
[oRPC] Context created: { hasSession: true, userId: 'ImZJ6...' }
[posts.create] Post created: { id: 'Ai9fW...', slug: 'my-first-post' }
```

**It worked.**

From `webflow.io` to `vercel.app`:
- ✅ Full authentication
- ✅ Session persistence across page loads
- ✅ No permission prompts, no CORS hacks
- ✅ Production-ready

**[IMAGE: Split screen showing Authorization header in browser devtools and server logs showing successful auth]**

---

## What We Built: A Full-Stack Component Library

Looking at what I'd built, I realized this wasn't just a blog platform. It was a proof of concept for **a full-stack component library for Webflow.**

### The Stack

**Frontend:** React 19, Zustand, TanStack Query, Tiptap, Tailwind CSS, shadcn/ui
**Backend:** Next.js 15, oRPC, Better Auth, Drizzle ORM, PostgreSQL
**The Magic:** Zustand (Shadow DOM state), oRPC (type safety), Bearer tokens (cross-origin auth)

**[DIAGRAM: Full system architecture - Webflow layer → Zustand stores → HTTP with bearer tokens → Next.js API → Database]**

### The Components

**Authentication Suite:**
- LoginForm, RegistrationForm, Dashboard, LogoutButton

**Content Management:**
- PostEditor (rich text with Tiptap, auto-save, publish workflow)
- PostsList (filterable, with status indicators)

Each component is fully type-safe from DB to UI, production-ready, and works seamlessly across Shadow DOM boundaries.

**[IMAGE: Grid layout showing screenshots of each component in action]**

We're calling it "flow/cn" as a working title (a nod to shadcn/ui), but the name is very much TBD. The vision: **a library of full-stack components that Webflow developers can drop into their sites, with the entire backend infrastructure already built, configured, and type-safe.**

---

## The Bigger Picture

This hackathon started as idle curiosity and evolved into rethinking what's possible in Webflow.

The traditional view: *Webflow is a visual design tool for marketing sites and landing pages.*

Code Components expand that model. With this architecture, you can now build:

- **SaaS applications** with dashboards and admin panels
- **E-commerce platforms** with shopping carts and order management
- **Content management systems** with multi-user editing and publishing
- **Interactive tools** with real-time collaboration and complex state

All living inside Webflow. All using the visual editor. All backed by robust, type-safe infrastructure.

**[DIAGRAM: Pyramid showing traditional Webflow use cases expanding upward to new possibilities like SaaS apps and platforms]**

Imagine a SaaS product where your marketing site, auth flows, user dashboard, and admin panel all live in Webflow, sharing a single design system - and it's all type-safe.

That's not hypothetical. That's what this architecture enables.

---

## Try It, Break It, Build With It

The code is open source. The patterns are reusable. Clone the repo, deploy your own instance, build components we haven't thought of. Push this architecture to its limits.

The patterns we've developed - Zustand for Shadow DOM state, oRPC for type-safe APIs, bearer tokens for cross-origin auth - are building blocks for anyone working with Webflow Code Components.

This started as a hackathon project. It's become a proof of concept for a new way of building for the web.

Let's see where it goes next.

---

**Project Status:** Alpha / Proof of Concept
**Tech Stack:** React 19, Next.js 15, oRPC, Better Auth, Zustand, Drizzle ORM, PostgreSQL, TanStack Query, Tiptap, Tailwind CSS, shadcn/ui
**Deployment:** Webflow + Vercel
**License:** MIT
**Name:** TBD (seriously, help us with this)

**Read time:** ~5 minutes
**Hackathon:** Webflow x Contra Challenge
**Lessons learned:** More than we expected

---

*Built something with Code Components? Have ideas for the name? Found a better approach? We'd love to hear from you.*
