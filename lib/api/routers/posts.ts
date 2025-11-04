/**
 * Posts Router
 * Handles all blog post CRUD operations and publishing
 */

import { z } from 'zod';
import { os } from '@orpc/server';
import { publicProcedure, protectedProcedure } from '../procedures';
import { db, posts } from '@/lib/db';
import { eq, and, desc, or, ilike } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Context } from '../context';
import { getOrCreatePerson } from '../helpers/getOrCreatePerson';

// Helper function to generate URL-safe slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to ensure unique slug
async function generateUniqueSlug(baseTitle: string): Promise<string> {
  let slug = generateSlug(baseTitle);
  let attempt = 0;

  // Check if slug exists
  while (true) {
    const existing = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    });

    if (!existing) {
      return slug; // Slug is unique
    }

    // Slug exists, append number
    attempt++;
    slug = `${generateSlug(baseTitle)}-${attempt}`;
  }
}

// List posts procedure
const list = protectedProcedure
  .input(z.object({
    status: z.enum(['draft', 'published']).optional(),
    search: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }))
  .handler(async ({ input, context }) => {
    const ctx = context as Context;

    console.log('[posts.list] Starting handler');
    console.log('[posts.list] Input:', input);
    console.log('[posts.list] UserId:', ctx.userId);

    // Get or create person (handles new users gracefully)
    const person = await getOrCreatePerson(ctx.userId!);

    console.log('[posts.list] Person found:', {
      personId: person.id,
      displayName: person.displayName,
    });

    const conditions = [eq(posts.authorId, person.id)];

    if (input.status) {
      conditions.push(eq(posts.status, input.status));
    }

    if (input.search) {
      const searchCondition = or(
        ilike(posts.title, `%${input.search}%`),
        ilike(posts.excerpt, `%${input.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    console.log('[posts.list] Querying posts with authorId:', person.id);

    const postsList = await db.query.posts.findMany({
      where: and(...conditions),
      orderBy: [desc(posts.updatedAt)],
      limit: input.limit,
      offset: input.offset,
    });

    console.log('[posts.list] Found posts:', {
      count: postsList.length,
      posts: postsList.map(p => ({ id: p.id, title: p.title, status: p.status })),
    });

    return postsList;
  });

// Get post by ID procedure
const getById = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .handler(async ({ input, context }) => {
    const ctx = context as Context;

    // Get or create person (handles new users gracefully)
    const person = await getOrCreatePerson(ctx.userId!);

    const post = await db.query.posts.findFirst({
      where: and(
        eq(posts.id, input.id),
        eq(posts.authorId, person.id)
      ),
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  });

// Create post procedure
const create = protectedProcedure
  .input(z.object({
    title: z.string().min(1).max(255),
    content: z.any(),
    excerpt: z.string().max(500).optional(),
    coverImage: z.string().url().optional(),
  }))
  .handler(async ({ input, context }) => {
    try {
      console.log('[posts.create] Starting post creation', {
        title: input.title,
        hasContent: !!input.content,
        contentType: typeof input.content,
        excerpt: input.excerpt,
        coverImage: input.coverImage,
      });

      const ctx = context as Context;
      console.log('[posts.create] Context:', { userId: ctx.userId, hasSession: !!ctx.session });

      // Get or create person (handles new users gracefully)
      const person = await getOrCreatePerson(ctx.userId!);

      console.log('[posts.create] Person lookup:', { found: !!person, personId: person?.id });

      const slug = await generateUniqueSlug(input.title);
      const id = nanoid();

      console.log('[posts.create] Inserting post:', { id, slug, authorId: person.id });

      const [newPost] = await db.insert(posts).values({
        id,
        authorId: person.id,
        title: input.title,
        slug,
        content: input.content,
        excerpt: input.excerpt || null,
        coverImage: input.coverImage || null,
        status: 'draft',
      }).returning();

      console.log('[posts.create] Post created successfully:', { id: newPost.id });

      return newPost;
    } catch (error) {
      console.error('[posts.create] ERROR:', error);
      console.error('[posts.create] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
      throw error;
    }
  });

// Update post procedure
const update = protectedProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().min(1).max(255).optional(),
    content: z.any().optional(),
    excerpt: z.string().max(500).optional(),
    coverImage: z.string().url().optional(),
  }))
  .handler(async ({ input, context }) => {
    const ctx = context as Context;

    // Get or create person (handles new users gracefully)
    const person = await getOrCreatePerson(ctx.userId!);

    const existingPost = await db.query.posts.findFirst({
      where: and(
        eq(posts.id, input.id),
        eq(posts.authorId, person.id)
      ),
    });

    if (!existingPost) {
      throw new Error('Post not found');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
      updateData.slug = generateSlug(input.title);
    }
    if (input.content !== undefined) updateData.content = input.content;
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
    if (input.coverImage !== undefined) updateData.coverImage = input.coverImage;

    const [updatedPost] = await db.update(posts)
      .set(updateData)
      .where(eq(posts.id, input.id))
      .returning();

    return updatedPost;
  });

// Delete post procedure
const deleteProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .handler(async ({ input, context }) => {
    const ctx = context as Context;

    // Get or create person (handles new users gracefully)
    const person = await getOrCreatePerson(ctx.userId!);

    const existingPost = await db.query.posts.findFirst({
      where: and(
        eq(posts.id, input.id),
        eq(posts.authorId, person.id)
      ),
    });

    if (!existingPost) {
      throw new Error('Post not found');
    }

    await db.delete(posts).where(eq(posts.id, input.id));

    return { success: true };
  });

// Publish post procedure
const publish = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .handler(async ({ input, context }) => {
    const ctx = context as Context;

    // Get or create person (handles new users gracefully)
    const person = await getOrCreatePerson(ctx.userId!);

    const post = await db.query.posts.findFirst({
      where: and(
        eq(posts.id, input.id),
        eq(posts.authorId, person.id)
      ),
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const [publishedPost] = await db.update(posts)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(posts.id, input.id))
      .returning();

    return publishedPost;
  });

// Public list of published posts
const publicList = publicProcedure
  .input(z.object({
    search: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }))
  .handler(async ({ input }) => {
    const conditions = [eq(posts.status, 'published')];

    if (input.search) {
      const searchCondition = or(
        ilike(posts.title, `%${input.search}%`),
        ilike(posts.excerpt, `%${input.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const postsList = await db.query.posts.findMany({
      where: and(...conditions),
      orderBy: [desc(posts.publishedAt)],
      limit: input.limit,
      offset: input.offset,
      with: {
        author: true,
      },
    });

    return postsList;
  });

// Public get post by ID (for published posts only)
const publicGetById = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .handler(async ({ input }) => {
    const post = await db.query.posts.findFirst({
      where: and(
        eq(posts.id, input.id),
        eq(posts.status, 'published')
      ),
      with: {
        author: true,
      },
    });

    if (!post) {
      throw new Error('Post not found or not published');
    }

    return post;
  });

export const postsRouter = os.router({
  list,
  getById,
  create,
  update,
  delete: deleteProcedure,
  publish,
  publicList,
  publicGetById,
});
