import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// Create a Redis client if credentials are available
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

// Create a rate limiter that allows 5 requests per hour per IP
export const rateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "ratelimit:emotion-analysis",
    })
  : null

// Helper function to get client IP from request
export function getClientIp(request: Request): string {
  // Try to get IP from Vercel-specific headers
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  // Fallback to a default IP if we can't determine the real one
  return "127.0.0.1"
}

// Helper function to check rate limit
export async function checkRateLimit(
  request: Request,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // If no rate limiter is available, allow the request
  if (!rateLimiter) {
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 3600000,
    }
  }

  const ip = getClientIp(request)
  const result = await rateLimiter.limit(ip)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
