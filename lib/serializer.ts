/**
 * RPC JSON Serializer
 * Enables proper serialization/deserialization of oRPC types during SSR hydration
 *
 * This serializer supports all oRPC types including:
 * - Date objects
 * - BigInt values
 * - Custom types with serializers
 *
 * Used by TanStack Query for:
 * - Query key hashing
 * - SSR state dehydration
 * - Client-side hydration
 *
 * @see https://orpc.unnoq.com/docs/advanced/rpc-json-serializer
 */

import { StandardRPCJsonSerializer } from '@orpc/client/standard';

/**
 * Singleton serializer instance
 *
 * Add custom serializers here if you need to support additional types:
 *
 * @example
 * ```typescript
 * export const serializer = new StandardRPCJsonSerializer({
 *   customJsonSerializers: [
 *     // Add custom serializers here
 *   ]
 * });
 * ```
 */
export const serializer = new StandardRPCJsonSerializer();
