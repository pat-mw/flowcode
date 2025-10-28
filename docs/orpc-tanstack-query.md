# oRPC TanStack Query Integration Guide

## Overview

oRPC provides a lightweight integration with TanStack Query (formerly React Query) that enables type-safe data fetching, caching, and state management. This integration supports React, Vue, Angular, Solid, Svelte, and other frameworks that TanStack Query supports.

**Official Documentation**: [https://orpc.unnoq.com/docs/integrations/tanstack-query](https://orpc.unnoq.com/docs/integrations/tanstack-query)

## Installation

```bash
pnpm install @orpc/tanstack-query@latest
```

**NPM Package**: [https://www.npmjs.com/package/@orpc/tanstack-query](https://www.npmjs.com/package/@orpc/tanstack-query)

## Prerequisites

Before using oRPC with TanStack Query, ensure you have:

1. Configured an oRPC client (server-side or client-side)
2. Basic familiarity with TanStack Query concepts

**Client Setup Documentation**: 
- [Server-side Client](https://orpc.unnoq.com/docs/client/server-side)
- [Client-side Client](https://orpc.unnoq.com/docs/client/client-side)

## Basic Setup

```typescript
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

export const orpc = createTanstackQueryUtils(client)
```

### Avoiding Key Conflicts

When working with multiple clients, use unique base keys:

```typescript
const userORPC = createTanstackQueryUtils(userClient, {
  path: ['user']
})

const postORPC = createTanstackQueryUtils(postClient, {
  path: ['post']
})
```

## Core Features

### 1. Query Options

Use `.queryOptions()` with hooks like `useQuery`, `useSuspenseQuery`, or `prefetchQuery`:

```typescript
import { useQuery } from '@tanstack/react-query'

const query = useQuery(orpc.planet.find.queryOptions({
  input: { id: 123 },
  context: { cache: true },
  // additional TanStack Query options...
}))
```

### 2. Infinite Queries

Use `.infiniteOptions()` for pagination:

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'

const query = useInfiniteQuery(orpc.planet.list.infiniteOptions({
  input: (pageParam: number | undefined) => ({ 
    limit: 10, 
    offset: pageParam 
  }),
  context: { cache: true },
  initialPageParam: undefined,
  getNextPageParam: lastPage => lastPage.nextPageParam,
}))
```

**Note**: The `input` parameter must be a function that accepts the page parameter and returns the query input.

### 3. Mutations

Use `.mutationOptions()` with `useMutation`:

```typescript
import { useMutation } from '@tanstack/react-query'

const mutation = useMutation(orpc.planet.create.mutationOptions({
  context: { cache: true },
  onSuccess: () => {
    // Handle success
  },
}))

mutation.mutate({ name: 'Earth' })
```

### 4. Streaming Queries

Use `.streamedOptions()` for real-time streaming data:

```typescript
const query = useQuery(orpc.streamed.experimental_streamedOptions({
  input: { id: 123 },
  context: { cache: true },
  queryFnOptions: {
    refetchMode: 'reset',
    maxChunks: 3,
  },
  retry: true,
}))
```

Data is returned as an array of events, with new events appended as they arrive.

**Related**: [Event Iterator Documentation](https://orpc.unnoq.com/docs/event-iterator)

### 5. Live Queries

Use `.liveOptions()` for always-latest data:

```typescript
const query = useQuery(orpc.live.experimental_liveOptions({
  input: { id: 123 },
  context: { cache: true },
  retry: true,
}))
```

Data is always the latest event, replacing previous values when new ones arrive.

## Query Key Management

oRPC provides helper methods for generating cache keys:

| Method | Purpose |
|--------|---------|
| `.key()` | Partial matching key for invalidation |
| `.queryKey()` | Full key for Query Options |
| `.streamedKey()` | Full key for Streamed Query Options |
| `.infiniteKey()` | Full key for Infinite Query Options |
| `.mutationKey()` | Full key for Mutation Options |

### Examples

```typescript
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// Invalidate all planet queries
queryClient.invalidateQueries({
  queryKey: orpc.planet.key(),
})

// Invalidate only regular (non-infinite) planet queries
queryClient.invalidateQueries({
  queryKey: orpc.planet.key({ type: 'query' })
})

// Invalidate specific query
queryClient.invalidateQueries({
  queryKey: orpc.planet.find.key({ input: { id: 123 } })
})

// Update query data
queryClient.setQueryData(
  orpc.planet.find.queryKey({ input: { id: 123 } }), 
  (old) => ({ ...old, id: 123, name: 'Earth' })
)
```

## Direct Client Calls

Use `.call()` to invoke a procedure directly:

```typescript
const planet = await orpc.planet.find.call({ id: 123 })
```

## Type-Safe Error Handling

Use the `isDefinedError` helper for type-safe error handling:

```typescript
import { isDefinedError } from '@orpc/client'

const mutation = useMutation(orpc.planet.create.mutationOptions({
  onError: (error) => {
    if (isDefinedError(error)) {
      // Handle known, type-safe errors
      console.error(error.data)
    } else {
      // Handle unknown errors
    }
  }
}))

// Or check errors after mutation
if (mutation.error && isDefinedError(mutation.error)) {
  // Handle the error
}
```

**Learn More**: [Type-Safe Error Handling Guide](https://orpc.unnoq.com/docs/error-handling#type‐safe-error-handling)

## Advanced Features

### skipToken for Conditional Queries

Use `skipToken` as a type-safe alternative to the `disabled` option:

```typescript
import { skipToken } from '@tanstack/react-query'

const query = useQuery(
  orpc.planet.list.queryOptions({
    input: search ? { search } : skipToken,
  })
)

// Works with infinite queries too
const infiniteQuery = useInfiniteQuery(
  orpc.planet.list.infiniteOptions({
    input: search
      ? (offset: number | undefined) => ({ limit: 10, offset, search })
      : skipToken,
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage.nextPageParam,
  })
)
```

### Reactive Options (Vue/Solid)

For reactive frameworks, TanStack Query supports computed values:

```typescript
// Vue
const query = useQuery(computed(
  () => orpc.planet.find.queryOptions({
    input: { id: id.value },
  })
))

// Solid
const query = useQuery(
  () => orpc.planet.find.queryOptions({
    input: { id: id() },
  })
)
```

**Reference**: [TanStack Query Reactive Options](https://tanstack.com/query/latest/docs/guides/reactive-options)

### Operation Context

oRPC automatically adds operation context to client calls, useful for configuring request behavior:

```typescript
import {
  TANSTACK_QUERY_OPERATION_CONTEXT_SYMBOL,
  TanstackQueryOperationContext,
} from '@orpc/tanstack-query'

interface ClientContext extends TanstackQueryOperationContext {}

const GET_OPERATION_TYPE = new Set(['query', 'streamed', 'live', 'infinite'])

const link = new RPCLink<ClientContext>({
  url: 'http://localhost:3000/rpc',
  method: ({ context }, path) => {
    const operationType = context[TANSTACK_QUERY_OPERATION_CONTEXT_SYMBOL]?.type
    
    if (operationType && GET_OPERATION_TYPE.has(operationType)) {
      return 'GET'
    }
    return 'POST'
  },
})
```

### Server-Side Rendering (SSR) & Hydration

For SSR applications, use oRPC's RPC JSON Serializer to support all oRPC types during hydration:

```typescript
import { StandardRPCJsonSerializer } from '@orpc/client/standard'
import { QueryClient } from '@tanstack/react-query'

const serializer = new StandardRPCJsonSerializer({
  customJsonSerializers: [
    // Add custom serializers here
  ]
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn(queryKey) {
        const [json, meta] = serializer.serialize(queryKey)
        return JSON.stringify({ json, meta })
      },
      staleTime: 60 * 1000, // Prevent immediate refetching on mount
    },
    dehydrate: {
      serializeData(data) {
        const [json, meta] = serializer.serialize(data)
        return { json, meta }
      }
    },
    hydrate: {
      deserializeData(data) {
        return serializer.deserialize(data.json, data.meta)
      }
    },
  }
})
```

**Learn More**: 
- [TanStack Query SSR Guide](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [RPC JSON Serializer](https://orpc.unnoq.com/docs/advanced/rpc-json-serializer)

## Client Context Considerations

⚠️ **Important**: oRPC excludes client context from query keys to prevent issues with deduplication. If you need context-specific caching:

```typescript
const query = useQuery(orpc.planet.find.queryOptions({
  context: { cache: true },
  queryKey: [['planet', 'find'], { context: { cache: true } }], // Manual override
  retry: true, // Use built-in retry instead of oRPC Client Retry Plugin
}))
```

**Related**: 
- [Client Context Documentation](https://orpc.unnoq.com/docs/client/rpc-link#using-client-context)
- [Client Retry Plugin](https://orpc.unnoq.com/docs/plugins/client-retry)

## Complete Example: Next.js App Router

### 1. Create Serializer

```typescript
// lib/serializer.ts
import { StandardRPCJsonSerializer } from '@orpc/client/standard'

export const serializer = new StandardRPCJsonSerializer()
```

### 2. Create Query Client Factory

```typescript
// lib/query/client.ts
import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { serializer } from '../serializer'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn(queryKey) {
          const [json, meta] = serializer.serialize(queryKey)
          return JSON.stringify({ json, meta })
        },
        staleTime: 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: query => 
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
        serializeData(data) {
          const [json, meta] = serializer.serialize(data)
          return { json, meta }
        },
      },
      hydrate: {
        deserializeData(data) {
          return serializer.deserialize(data.json, data.meta)
        }
      },
    }
  })
}
```

### 3. Create Hydration Utilities

```typescript
// lib/query/hydration.ts
import { createQueryClient } from './client'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

export const getQueryClient = cache(createQueryClient)

export function HydrateClient(props: { 
  children: React.ReactNode
  client: QueryClient 
}) {
  return (
    <HydrationBoundary state={dehydrate(props.client)}>
      {props.children}
    </HydrationBoundary>
  )
}
```

### 4. Create Providers

```typescript
// app/providers.tsx
'use client'

import { useState } from 'react'
import { createQueryClient } from '../lib/query/client'
import { QueryClientProvider } from '@tanstack/react-query'

export function Providers(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
}
```

### 5. Server Component with Prefetching

```typescript
// app/page.tsx
import { getQueryClient, HydrateClient } from '../lib/query/hydration'
import { ListPlanets } from '../components/list-planets'
import { orpc } from '../lib/orpc'

export default function Page() {
  const queryClient = getQueryClient()

  queryClient.prefetchQuery(
    orpc.planet.list.queryOptions(),
  )

  return (
    <HydrateClient client={queryClient}>
      <ListPlanets />
    </HydrateClient>
  )
}
```

### 6. Client Component

```typescript
// components/list-planets.tsx
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { orpc } from '../lib/orpc'

export function ListPlanets() {
  const { data, isError } = useSuspenseQuery(
    orpc.planet.list.queryOptions()
  )

  if (isError) {
    return <p>Something went wrong</p>
  }

  return (
    <ul>
      {data.map(planet => (
        <li key={planet.id}>{planet.name}</li>
      ))}
    </ul>
  )
}
```

## Additional Resources

- **Main oRPC Website**: [https://orpc.unnoq.com](https://orpc.unnoq.com)
- **GitHub Repository**: [https://github.com/unnoq/orpc](https://github.com/unnoq/orpc)
- **TanStack Query Documentation**: [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
- **oRPC Playgrounds**: [https://orpc.unnoq.com/docs/playgrounds](https://orpc.unnoq.com/docs/playgrounds)
- **Alternative: React SWR Integration**: [https://orpc.unnoq.com/docs/integrations/react-swr](https://orpc.unnoq.com/docs/integrations/react-swr)

## Related oRPC Packages

- `@orpc/server` - Server-side oRPC
- `@orpc/client` - Client utilities
- `@orpc/openapi` - OpenAPI integration
- `@orpc/zod` - Zod schema support

## Summary

oRPC's TanStack Query integration provides:

- ✅ End-to-end type safety
- ✅ Automatic query key generation
- ✅ Support for queries, mutations, infinite queries, and streaming
- ✅ Type-safe error handling
- ✅ SSR/hydration support
- ✅ Framework-agnostic (React, Vue, Solid, Svelte, etc.)
- ✅ Seamless integration with existing TanStack Query patterns

The integration is lightweight, maintaining the developer experience you expect from TanStack Query while adding the power of type-safe RPC calls.