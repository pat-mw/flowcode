# CORS Configuration for Webflow Integration

## Overview

This document explains the CORS (Cross-Origin Resource Sharing) configuration that allows Webflow Code Components hosted on `https://blogflow-three.webflow.io` to make API requests to the Next.js backend hosted on `https://blogflow-three.vercel.app`.

## Problem Statement

By default, browsers block cross-origin requests for security reasons. Since the Webflow Code Components run on a different domain than the backend API, requests were being blocked with CORS errors:

```
Access to fetch at 'https://blogflow-three.vercel.app/api/auth/sign-in/email'
from origin 'https://blogflow-three.webflow.io' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

CORS headers were added to both API endpoints:
1. **Better Auth endpoints** (`/api/auth/*`) - Authentication and session management
2. **oRPC endpoints** (`/api/orpc/*`) - Type-safe API procedures

### 1. Better Auth CORS Configuration

**File**: `/lib/auth/config.ts`

Better Auth v1.3.32+ has built-in CORS support via the `trustedOrigins` option:

```typescript
export const auth = betterAuth({
  // ... other config ...

  // CORS configuration - allow Webflow domain to make auth requests
  trustedOrigins: [
    'https://blogflow-three.webflow.io',  // Production Webflow site
    'http://localhost:3000',               // Local development
    'https://blogflow-three.vercel.app',   // Production backend (for testing)
  ],
});
```

The Better Auth route handler (`/app/api/auth/[...all]/route.ts`) automatically applies these CORS headers to all auth endpoints:
- `/api/auth/sign-in/email`
- `/api/auth/sign-up/email`
- `/api/auth/sign-out`
- `/api/auth/session`
- `/api/auth/callback/google`
- etc.

### 2. oRPC CORS Middleware

**File**: `/app/api/orpc/[...path]/route.ts`

Custom CORS middleware was implemented for oRPC endpoints:

```typescript
// CORS configuration
const ALLOWED_ORIGINS = [
  'https://blogflow-three.webflow.io',  // Production Webflow site
  'http://localhost:3000',               // Local development
  'https://blogflow-three.vercel.app',   // Production backend (for testing)
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

function setCorsHeaders(response: Response, origin: string | null): Response {
  const newResponse = new Response(response.body, response);

  if (origin && isOriginAllowed(origin)) {
    newResponse.headers.set('Access-Control-Allow-Origin', origin);
    newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  newResponse.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return newResponse;
}
```

**Key features:**
- Handles preflight `OPTIONS` requests
- Only allows requests from whitelisted origins
- Supports credentials (cookies) for session management
- Caches preflight responses for 24 hours

## CORS Headers Explained

### Access-Control-Allow-Origin
Specifies which origin can access the resource. We dynamically set this to the requesting origin if it's in our allowed list.

**Why not use `*` (wildcard)?**
- Cannot use wildcards when `Access-Control-Allow-Credentials: true` (needed for cookies/sessions)
- Security best practice to explicitly allow known origins

### Access-Control-Allow-Credentials
Allows the browser to send cookies and authentication headers.

**Required for:**
- Better Auth session cookies
- Authentication state persistence

### Access-Control-Allow-Methods
Lists HTTP methods the client can use.

**Allowed methods:**
- `GET` - Fetching data
- `POST` - Creating resources, authentication
- `PUT` / `PATCH` - Updating resources
- `DELETE` - Deleting resources
- `OPTIONS` - Preflight requests

### Access-Control-Allow-Headers
Lists headers the client can send.

**Allowed headers:**
- `Content-Type` - JSON request bodies
- `Authorization` - Bearer tokens (if used)
- `X-Requested-With` - Common AJAX header

### Access-Control-Max-Age
How long the browser can cache the preflight response (in seconds).

**Set to 86400 seconds (24 hours):**
- Reduces preflight requests for better performance
- Browser makes fewer OPTIONS requests

## Allowed Origins

### Production
- **Webflow Site**: `https://blogflow-three.webflow.io`
- **Backend API**: `https://blogflow-three.vercel.app`

### Development
- **Local Server**: `http://localhost:3000`

### Future Additions

If you need to add more origins (e.g., custom domain, staging environment):

1. **Update Better Auth config** (`/lib/auth/config.ts`):
   ```typescript
   trustedOrigins: [
     'https://blogflow-three.webflow.io',
     'https://custom-domain.com',  // Add here
     'http://localhost:3000',
   ],
   ```

2. **Update oRPC middleware** (`/app/api/orpc/[...path]/route.ts`):
   ```typescript
   const ALLOWED_ORIGINS = [
     'https://blogflow-three.webflow.io',
     'https://custom-domain.com',  // Add here
     'http://localhost:3000',
   ];
   ```

## Testing CORS

### From Browser Console (on Webflow site)

Test authentication:
```javascript
fetch('https://blogflow-three.vercel.app/api/auth/session', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Test oRPC endpoint:
```javascript
fetch('https://blogflow-three.vercel.app/api/orpc/people.me', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Expected Response Headers

Inspect the response headers (Network tab):
```
Access-Control-Allow-Origin: https://blogflow-three.webflow.io
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

### Preflight Request (OPTIONS)

Before the actual request, the browser sends a preflight OPTIONS request. You should see:
- Request: `OPTIONS /api/auth/session`
- Response: `204 No Content` with CORS headers

## Common Issues

### 1. CORS Error Still Appears

**Check:**
- Is the requesting origin in the allowed list?
- Are you using `credentials: 'include'` in fetch requests?
- Is the response header `Access-Control-Allow-Origin` set correctly?

**Debug:**
```bash
# Check response headers
curl -H "Origin: https://blogflow-three.webflow.io" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://blogflow-three.vercel.app/api/auth/session \
     -v
```

### 2. Credentials Not Sent

**Ensure:**
- Client uses `credentials: 'include'` in fetch
- Server sends `Access-Control-Allow-Credentials: true`
- Origin is explicitly allowed (not `*`)

### 3. Preflight Failures

**Check:**
- Server handles `OPTIONS` method
- Preflight response has status `204` or `200`
- All required headers are present

## Security Considerations

### 1. Explicit Origin Allowlist
We use a strict allowlist of origins instead of `*` wildcard for security:
- Prevents unauthorized domains from accessing the API
- Required when using credentials

### 2. Credentials Flag
Only enable `Access-Control-Allow-Credentials: true` when necessary:
- Allows cookies/sessions to be sent
- Cannot be used with wildcard origins

### 3. Method Restrictions
Only allow necessary HTTP methods:
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE` - Standard REST operations
- `OPTIONS` - Required for preflight

### 4. Header Restrictions
Only allow necessary headers:
- `Content-Type` - JSON payloads
- `Authorization` - Auth tokens (if using Bearer tokens)
- `X-Requested-With` - Common AJAX identifier

## Environment-Specific Configuration

Currently, origins are hardcoded in the source files. For future flexibility, you can use environment variables:

**Add to `.env`:**
```bash
ALLOWED_CORS_ORIGINS=https://blogflow-three.webflow.io,http://localhost:3000,https://custom-domain.com
```

**Parse in code:**
```typescript
const ALLOWED_ORIGINS = process.env.ALLOWED_CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
];
```

**Note:** This is currently documented in `env.example` but not implemented in code. Hardcoded origins are simpler and sufficient for most use cases.

## Related Documentation

- **Better Auth CORS**: [Better Auth Docs - Trusted Origins](https://www.better-auth.com/docs/concepts/trusted-origins)
- **MDN CORS Guide**: [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- **Webflow API Integration**: See `/docs/webflow-nextjs-integration.md`

## Changes Made

**Update 08 - CORS Configuration (2025-10-27)**
- Added `trustedOrigins` to Better Auth config
- Implemented CORS middleware for oRPC endpoints
- Added OPTIONS handler for preflight requests
- Documented CORS configuration in `env.example`
- Created this documentation file

---

**Last Updated**: 2025-10-27
**Related Issues**: CORS blocking Webflow → Vercel API requests
