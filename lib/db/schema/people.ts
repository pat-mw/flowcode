/**
 * People table - Extended user profiles
 * Links to Better Auth users table and extends with blog-specific fields
 */

import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const people = pgTable(
  'people',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    displayName: text('display_name').notNull(),
    bio: text('bio'),
    avatar: text('avatar'),
    website: text('website'),

    // Webflow CMS integration
    webflowItemId: text('webflow_item_id').unique(),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('people_user_id_idx').on(table.userId),
    webflowItemIdIdx: index('people_webflow_item_id_idx').on(table.webflowItemId),
  })
);

export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
