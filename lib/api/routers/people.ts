/**
 * People Router
 * Handles user profile operations
 */

import { z } from 'zod';
import { os } from '@orpc/server';
import { publicProcedure, protectedProcedure } from '../procedures';
import { db, people } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { Context } from '../context';
import { getOrCreatePerson } from '../helpers/getOrCreatePerson';

const getByUserId = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .handler(async ({ input }) => {
    // Get or create person (handles new users gracefully)
    const person = await getOrCreatePerson(input.userId);
    return person;
  });

const getMe = protectedProcedure
  .handler(async ({ context }) => {
    const ctx = context as Context;

    console.log('[people.getMe] Starting handler');
    console.log('[people.getMe] Context:', {
      userId: ctx.userId,
      session: ctx.session,
    });

    if (!ctx.userId) {
      console.log('[people.getMe] ERROR: No userId in context');
      throw new Error('User ID not found in context');
    }

    console.log('[people.getMe] Using shared getOrCreatePerson helper');

    try {
      // Use shared helper that implements "get or create" logic
      const person = await getOrCreatePerson(ctx.userId);

      console.log('[people.getMe] Success - returning person');
      return person;
    } catch (error) {
      console.log('[people.getMe] Database error:', error);
      throw error;
    }
  });

const updateProcedure = protectedProcedure
  .input(z.object({
    displayName: z.string().min(1).max(255).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
    website: z.string().url().optional(),
  }))
  .handler(async ({ input, context }) => {
    const ctx = context as Context;

    // Get or create person (handles new users gracefully)
    const person = await getOrCreatePerson(ctx.userId!);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.displayName !== undefined) updateData.displayName = input.displayName;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.avatar !== undefined) updateData.avatar = input.avatar;
    if (input.website !== undefined) updateData.website = input.website;

    const [updatedPerson] = await db.update(people)
      .set(updateData)
      .where(eq(people.id, person.id))
      .returning();

    return updatedPerson;
  });

export const peopleRouter = os.router({
  getByUserId,
  getMe,
  update: updateProcedure,
});
