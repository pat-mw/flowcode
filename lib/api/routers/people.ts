/**
 * People Router
 * Handles user profile operations
 */

import { z } from 'zod';
import { os } from '@orpc/server';
import { publicProcedure, protectedProcedure } from '../procedures';
import { db, people, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Context } from '../context';

const getByUserId = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .handler(async ({ input }) => {
    const person = await db.query.people.findFirst({
      where: eq(people.userId, input.userId),
    });

    if (!person) {
      throw new Error('Person profile not found');
    }

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

    console.log('[people.getMe] Querying database for userId:', ctx.userId);

    try {
      let person = await db.query.people.findFirst({
        where: eq(people.userId, ctx.userId),
      });

      console.log('[people.getMe] Query result:', person ? 'Person found' : 'Person not found');

      // If person doesn't exist, auto-create it
      if (!person) {
        console.log('[people.getMe] Person not found, auto-creating...');

        // Get user info from Better Auth users table
        const user = await db.query.users.findFirst({
          where: eq(users.id, ctx.userId),
        });

        if (!user) {
          console.log('[people.getMe] ERROR: User not found in users table');
          throw new Error('User not found');
        }

        console.log('[people.getMe] User found:', {
          name: user.name,
          email: user.email,
        });

        // Create person record with user's name as displayName
        const newPersonId = nanoid();
        const [createdPerson] = await db.insert(people).values({
          id: newPersonId,
          userId: ctx.userId,
          displayName: user.name || user.email || 'User',
          bio: null,
          avatar: user.image || null,
          website: null,
          webflowItemId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        console.log('[people.getMe] Person created:', {
          id: createdPerson.id,
          displayName: createdPerson.displayName,
        });

        person = createdPerson;
      } else {
        console.log('[people.getMe] Person ID:', person.id);
        console.log('[people.getMe] Display name:', person.displayName);
      }

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
    const person = await db.query.people.findFirst({
      where: eq(people.userId, ctx.userId!),
    });

    if (!person) {
      throw new Error('Person profile not found');
    }

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
