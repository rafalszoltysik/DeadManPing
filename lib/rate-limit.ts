import { Redis } from '@upstash/redis'

// In-memory fallback for development (when Redis is not configured)
const inMemoryStore = new Map<string, number>()

// Initialize Redis client if credentials are available
let redisClient: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

/**
 * Rate limiting utility with Redis support
 * Falls back to in-memory Map if Redis is not configured
 * 
 * @param key - Unique key for rate limiting (e.g., `monitor:${monitorId}`)
 * @param windowMs - Time window in milliseconds (e.g., 10000 for 10 seconds)
 * @returns true if allowed, false if rate limited
 */
export async function checkRateLimit(
  key: string,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now()
  const windowStart = now - windowMs

  if (redisClient) {
    // Use Redis for production (shared across all serverless instances)
    try {
      // Get last ping timestamp
      const lastPingStr = await redisClient.get<string>(key)
      const lastPing = lastPingStr ? parseInt(lastPingStr, 10) : 0
      
      if (now - lastPing < windowMs) {
        // Rate limited - calculate remaining time
        const remaining = windowMs - (now - lastPing)
        return { allowed: false, remaining: Math.max(0, remaining) }
      }
      
      // Allowed - update timestamp and set expiration
      const ttlSeconds = Math.ceil(windowMs / 1000) + 60 // Add 60s buffer for cleanup
      await redisClient.set(key, now.toString(), { ex: ttlSeconds })
      
      return { allowed: true, remaining: windowMs }
    } catch (error) {
      console.error('Redis rate limit error, falling back to in-memory:', error)
      // Fall through to in-memory fallback
    }
  }

  // Fallback to in-memory store (development or Redis unavailable)
  const lastPing = inMemoryStore.get(key) || 0
  
  if (now - lastPing < windowMs) {
    const remaining = windowMs - (now - lastPing)
    return { allowed: false, remaining: Math.max(0, remaining) }
  }
  
  inMemoryStore.set(key, now)
  
  // Cleanup old entries periodically (simple approach)
  if (inMemoryStore.size > 1000) {
    const cutoff = now - windowMs * 10 // Keep entries from last 10 windows
    for (const [k, v] of inMemoryStore.entries()) {
      if (v < cutoff) {
        inMemoryStore.delete(k)
      }
    }
  }
  
  return { allowed: true, remaining: windowMs }
}

