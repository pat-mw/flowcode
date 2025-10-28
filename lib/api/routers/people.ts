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
    const person = await db.query.people.findFirst({
      where: eq(people.userId, ctx.userId!),
    });

    if (!person) {
      throw new Error('Person profile not found');
    }

    return person;
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
