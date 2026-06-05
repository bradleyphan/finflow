import "server-only";
import { Redis } from "@upstash/redis";

let client: Redis | null = null;

/**
 * Returns an Upstash Redis client if credentials are configured, otherwise null.
 * This lets the app build/run locally even before the database is set up.
 */
export function getRedis(): Redis | null {
  // Support both Upstash console naming and Vercel KV/Marketplace naming
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  if (!client) {
    client = new Redis({ url, token });
  }
  return client;
}

export function householdKey(code: string): string {
  return `household:${code.toLowerCase()}`;
}
