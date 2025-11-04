/**
 * Helper: Get or Create Person
 *
 * Ensures a person record exists for a user.
 * If not found, auto-creates it from Better Auth user data.
 *
 * This should be used by ALL protected procedures that need person data
 * to avoid "Person profile not found" errors for newly registered users.
 */

import { db, people, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function getOrCreatePerson(userId: string) {
  console.log('[getOrCreatePerson] Looking up person for userId:', userId);

  // Try to find existing person
  const person = await db.query.people.findFirst({
    where: eq(people.userId, userId),
  });

  if (person) {
    console.log('[getOrCreatePerson] Person found:', {
      id: person.id,
      displayName: person.displayName,
    });
    return person;
  }

  // Person doesn't exist - auto-create
  console.log('[getOrCreatePerson] Person not found, auto-creating...');

  // Get user info from Better Auth users table
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    console.error('[getOrCreatePerson] ERROR: User not found in users table for userId:', userId);
    throw new Error('User not found');
  }

  console.log('[getOrCreatePerson] User found:', {
    name: user.name,
    email: user.email,
  });

  // Create person record with user's name as displayName
  const newPersonId = nanoid();
  const [createdPerson] = await db.insert(people).values({
    id: newPersonId,
    userId: userId,
    displayName: user.name || user.email || 'User',
    bio: null,
    avatar: user.image || null,
    website: null,
    webflowItemId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  console.log('[getOrCreatePerson] Person created:', {
    id: createdPerson.id,
    displayName: createdPerson.displayName,
  });

  return createdPerson;
}
