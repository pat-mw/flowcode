/**
 * Waitlist table - Captures email signups with optional metadata
 * Tracks referral sources, timestamps, and admin notes
 */

import { pgTable, text, timestamp, index, jsonb, boolean } from 'drizzle-orm/pg-core';

export const waitlist = pgTable(
  'waitlist',
  {
    id: text('id').primaryKey(),

    // Contact information
    email: text('email').notNull().unique(),
    name: text('name'),
    company: text('company'),

    // Metadata
    referralSource: text('referral_source'), // Where they heard about us
    metadata: jsonb('metadata'), // Additional flexible data (company size, use case, etc.)

    // Status tracking
    status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'invited' | 'rejected'
    invitedAt: timestamp('invited_at'),

    // Admin notes
    notes: text('notes'),

    // Priority/flagging
    isPriority: boolean('is_priority').notNull().default(false),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('waitlist_email_idx').on(table.email),
    statusIdx: index('waitlist_status_idx').on(table.status),
    createdAtIdx: index('waitlist_created_at_idx').on(table.createdAt),
    isPriorityIdx: index('waitlist_is_priority_idx').on(table.isPriority),
  })
);

export type WaitlistEntry = typeof waitlist.$inferSelect;
export type NewWaitlistEntry = typeof waitlist.$inferInsert;
