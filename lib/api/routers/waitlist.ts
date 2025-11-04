/**
 * Waitlist Router
 * Handles waitlist signup and admin operations
 */

import { z } from 'zod';
import { os } from '@orpc/server';
import { publicProcedure, protectedProcedure } from '../procedures';
import { db, waitlist } from '@/lib/db';
import { eq, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Public procedure: Join waitlist
 * Anyone can sign up for the waitlist
 */
const join = publicProcedure
  .input(
    z.object({
      email: z.string().email('Invalid email address'),
      name: z.string().min(1).max(255).optional(),
      company: z.string().max(255).optional(),
      referralSource: z.string().max(255).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
  )
  .handler(async ({ input }) => {
    // Check if email already exists
    const existing = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, input.email),
    });

    if (existing) {
      // Return existing entry instead of error (idempotent)
      return {
        success: true,
        entry: existing,
        message: 'You are already on the waitlist!',
      };
    }

    // Create new waitlist entry
    const [entry] = await db
      .insert(waitlist)
      .values({
        id: nanoid(),
        email: input.email,
        name: input.name,
        company: input.company,
        referralSource: input.referralSource,
        metadata: input.metadata,
        status: 'pending',
        isPriority: false,
      })
      .returning();

    return {
      success: true,
      entry,
      message: 'Successfully added to waitlist!',
    };
  });

/**
 * Protected procedure: Get all waitlist entries
 * Requires authentication (admin only)
 */
const getAll = protectedProcedure
  .input(
    z
      .object({
        status: z.enum(['pending', 'approved', 'invited', 'rejected']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
      .optional()
  )
  .handler(async ({ input }) => {
    const { status, limit = 50, offset = 0 } = input || {};

    const conditions = status ? eq(waitlist.status, status) : undefined;

    const entries = await db.query.waitlist.findMany({
      where: conditions,
      orderBy: [desc(waitlist.isPriority), desc(waitlist.createdAt)],
      limit,
      offset,
    });

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(waitlist)
      .where(conditions);

    return {
      entries,
      total: Number(count),
      limit,
      offset,
    };
  });

/**
 * Public procedure: Get public waitlist statistics
 * Returns only the total count for public display
 */
const getPublicStats = publicProcedure.handler(async () => {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
    })
    .from(waitlist);

  return {
    total: Number(stats.total),
  };
});

/**
 * Protected procedure: Get detailed waitlist statistics
 * Requires authentication (admin only)
 */
const getStats = protectedProcedure.handler(async () => {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
      pending: sql<number>`count(*) filter (where status = 'pending')`,
      approved: sql<number>`count(*) filter (where status = 'approved')`,
      invited: sql<number>`count(*) filter (where status = 'invited')`,
      rejected: sql<number>`count(*) filter (where status = 'rejected')`,
      priority: sql<number>`count(*) filter (where is_priority = true)`,
    })
    .from(waitlist);

  return {
    total: Number(stats.total),
    pending: Number(stats.pending),
    approved: Number(stats.approved),
    invited: Number(stats.invited),
    rejected: Number(stats.rejected),
    priority: Number(stats.priority),
  };
});

/**
 * Protected procedure: Update waitlist entry
 * Requires authentication (admin only)
 */
const update = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(['pending', 'approved', 'invited', 'rejected']).optional(),
      notes: z.string().optional(),
      isPriority: z.boolean().optional(),
    })
  )
  .handler(async ({ input }) => {
    const { id, ...updateData } = input;

    const entry = await db.query.waitlist.findFirst({
      where: eq(waitlist.id, id),
    });

    if (!entry) {
      throw new Error('Waitlist entry not found');
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updateData.status !== undefined) {
      updates.status = updateData.status;
      // Set invitedAt timestamp when status changes to invited
      if (updateData.status === 'invited') {
        updates.invitedAt = new Date();
      }
    }
    if (updateData.notes !== undefined) updates.notes = updateData.notes;
    if (updateData.isPriority !== undefined) updates.isPriority = updateData.isPriority;

    const [updated] = await db
      .update(waitlist)
      .set(updates)
      .where(eq(waitlist.id, id))
      .returning();

    return updated;
  });

/**
 * Protected procedure: Delete waitlist entry
 * Requires authentication (admin only)
 */
const remove = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const entry = await db.query.waitlist.findFirst({
      where: eq(waitlist.id, input.id),
    });

    if (!entry) {
      throw new Error('Waitlist entry not found');
    }

    await db.delete(waitlist).where(eq(waitlist.id, input.id));

    return { success: true, message: 'Entry deleted successfully' };
  });

/**
 * Protected procedure: Bulk update waitlist entries
 * Requires authentication (admin only)
 */
const bulkUpdate = protectedProcedure
  .input(
    z.object({
      ids: z.array(z.string()).min(1),
      status: z.enum(['pending', 'approved', 'invited', 'rejected']).optional(),
      isPriority: z.boolean().optional(),
    })
  )
  .handler(async ({ input }) => {
    const { ids, ...updateData } = input;

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updateData.status !== undefined) {
      updates.status = updateData.status;
      if (updateData.status === 'invited') {
        updates.invitedAt = new Date();
      }
    }
    if (updateData.isPriority !== undefined) updates.isPriority = updateData.isPriority;

    const updated = await db
      .update(waitlist)
      .set(updates)
      .where(sql`${waitlist.id} = ANY(${ids})`)
      .returning();

    return {
      success: true,
      updated: updated.length,
      message: `Successfully updated ${updated.length} entries`,
    };
  });

export const waitlistRouter = os.router({
  join,
  getAll,
  getStats,
  getPublicStats,
  update,
  remove,
  bulkUpdate,
});
