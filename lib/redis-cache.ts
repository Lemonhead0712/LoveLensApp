import { Redis } from "@upstash/redis"

// Create a Redis client if credentials are available
const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null

// Cache expiration time (24 hours in seconds)
const CACHE_EXPIRATION = 60 * 60 * 24

export async function cacheGPTAnalysis(
  messageHash: string,
  firstPersonName: string,
  secondPersonName: string,
  analysis: any,
): Promise<void> {
  if (!redis) {
    console.log("Redis client not available, skipping cache")
    return
  }

  try {
    const cacheKey = `gpt-analysis:${messageHash}:${firstPersonName}:${secondPersonName}`
    await redis.set(cacheKey, JSON.stringify(analysis), { ex: CACHE_EXPIRATION })
    console.log(`Cached GPT analysis with key: ${cacheKey}`)
  } catch (error) {
    console.error("Error caching GPT analysis:", error)
    // Don't throw - caching failures shouldn't break the app
  }
}

export async function getCachedGPTAnalysis(
  messageHash: string,
  firstPersonName: string,
  secondPersonName: string,
): Promise<any | null> {
  if (!redis) {
    console.log("Redis client not available, skipping cache lookup")
    return null
  }

  try {
    const cacheKey = `gpt-analysis:${messageHash}:${firstPersonName}:${secondPersonName}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log(`Cache hit for GPT analysis with key: ${cacheKey}`)
      return typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData
    }

    console.log(`Cache miss for GPT analysis with key: ${cacheKey}`)
    return null
  } catch (error) {
    console.error("Error retrieving cached GPT analysis:", error)
    return null
  }
}

// Helper function to generate a hash from messages for cache key
export function generateMessageHash(messages: any[]): string {
  // Simple hash function for messages
  // In production, you might want a more sophisticated hash function
  const messageString = messages
    .map((m) => `${m.sender}:${m.text || m.content || ""}`)
    .join("|")
    .slice(0, 100) // Limit length to avoid extremely long keys

  // Create a simple hash
  let hash = 0
  for (let i = 0; i < messageString.length; i++) {
    const char = messageString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16)
}
