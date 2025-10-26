/**
 * Posts table - Blog posts with rich text content
 * Stores Tiptap JSON content and syncs to Webflow CMS on publish
 */

import { pgTable, text, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { people } from './people';

export const posts = pgTable(
  'posts',
  {
    id: text('id').primaryKey(),
    authorId: text('author_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),

    // Content fields
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt'),
    content: jsonb('content').notNull(), // Tiptap JSON
    coverImage: text('cover_image'),

    // Status
    status: text('status').notNull().default('draft'), // 'draft' | 'published'
    publishedAt: timestamp('published_at'),

    // Webflow CMS integration
    webflowItemId: text('webflow_item_id').unique(),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    authorIdIdx: index('posts_author_id_idx').on(table.authorId),
    statusIdx: index('posts_status_idx').on(table.status),
    slugIdx: index('posts_slug_idx').on(table.slug),
    publishedAtIdx: index('posts_published_at_idx').on(table.publishedAt),
    webflowItemIdIdx: index('posts_webflow_item_id_idx').on(table.webflowItemId),
  })
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
