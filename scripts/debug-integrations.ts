import { db, integrations } from '../lib/db';

const allIntegrations = await db.select().from(integrations);

console.log('Total integrations:', allIntegrations.length);
console.log(JSON.stringify(allIntegrations.map(i => ({
  id: i.id,
  userId: i.userId,
  provider: i.provider,
  metadata: i.metadata,
  createdAt: i.createdAt
})), null, 2));
