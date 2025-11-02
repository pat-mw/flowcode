# Feature: Public Waitlist Statistics Endpoint

## Overview
Fix authentication issue where waitlist count ("Join X developers already on the list") only shows when user is logged in. Create a public endpoint for displaying the total count without requiring authentication.

## Problem
- WaitlistSection component uses `orpc.waitlist.getStats` to fetch count
- `getStats` is a protected endpoint requiring authentication
- Public landing page visitors cannot see the waitlist count
- Count only displays when user is logged in

## Root Cause
In `lib/api/routers/waitlist.ts`, the `getStats` procedure uses `protectedProcedure`:

```typescript
const getStats = protectedProcedure.handler(async () => {
  // Returns detailed breakdown: total, pending, approved, invited, rejected, priority
});
```

## Solution
Create a new **public** endpoint that returns only the total count:
1. Add `getPublicStats` public procedure (no auth required)
2. Returns only `{ total: number }`
3. Keep `getStats` protected for admin use (detailed breakdown)
4. Update WaitlistSection to use `getPublicStats`

## Security Consideration
The detailed `getStats` endpoint returns:
- total
- pending
- approved
- invited
- rejected (sensitive)
- priority (sensitive)

**Rationale for separation:**
- Public users should only see total count
- Status breakdown is admin-only information
- Rejected count could reveal business metrics
- Priority status is internal-only

## Implementation

### Backend Changes
**File:** `lib/api/routers/waitlist.ts`

1. Added `getPublicStats` public procedure
   - Uses `publicProcedure` (no auth)
   - Returns only total count
   - Simple SQL: `count(*)`

2. Kept `getStats` protected
   - Still requires authentication
   - Returns detailed breakdown for admin

3. Exported both in router

### Frontend Changes
**File:** `components/webcn/landing_page/webcn.webflow.io/WaitlistSection.tsx`

1. Changed query from:
   ```typescript
   const { data: stats } = useQuery(orpc.waitlist.getStats.queryOptions());
   ```

   To:
   ```typescript
   const { data: stats } = useQuery(orpc.waitlist.getPublicStats.queryOptions());
   ```

2. No other changes needed (both endpoints return `{ total: number }`)

## Files Modified
- `lib/api/routers/waitlist.ts` - Added getPublicStats endpoint
- `components/webcn/landing_page/webcn.webflow.io/WaitlistSection.tsx` - Updated query

## Success Criteria
- [x] getPublicStats endpoint created
- [x] getPublicStats is public (no auth required)
- [x] WaitlistSection updated to use getPublicStats
- [ ] Count displays for logged-out users
- [ ] Count displays for logged-in users
- [ ] Admin still has access to detailed getStats

## Testing Checklist
- [ ] Visit landing page while logged out
- [ ] Verify "Join X developers" count displays
- [ ] Log in and verify count still displays
- [ ] Visit waitlist admin page (should use getStats)
- [ ] Verify admin sees detailed breakdown

## API Endpoints Summary

**Public Endpoints:**
- `waitlist.join` - Submit email to waitlist
- `waitlist.getPublicStats` - Get total count (NEW)

**Protected Endpoints:**
- `waitlist.getAll` - List all entries (admin)
- `waitlist.getStats` - Detailed breakdown (admin)
- `waitlist.update` - Update entry (admin)
- `waitlist.remove` - Delete entry (admin)
- `waitlist.bulkUpdate` - Bulk operations (admin)

## Timeline Estimate
~10 minutes for implementation + testing
