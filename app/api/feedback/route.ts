import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { getClientIp } from "@/lib/rate-limit"

// Create a Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

export async function POST(req: NextRequest) {
  try {
    const { insightId, feedbackType, analysisId } = await req.json()

    if (!insightId || !feedbackType || !analysisId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate feedback type
    if (!["accurate", "inaccurate", "thoughtProvoking"].includes(feedbackType)) {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 })
    }

    // Get client IP for analytics (anonymized)
    const clientIp = getClientIp(req)
    const anonymizedIp = anonymizeIp(clientIp)

    // Store feedback in Redis
    const feedbackData = {
      insightId,
      feedbackType,
      analysisId,
      timestamp: new Date().toISOString(),
      anonymizedIp,
    }

    // Use a Redis list to store all feedback
    await redis.lpush("insight-feedback", JSON.stringify(feedbackData))

    // Also store by insight ID for easier retrieval
    await redis.hset(`insight-feedback:${insightId}`, {
      [Date.now()]: JSON.stringify(feedbackData),
    })

    // Increment counter for this feedback type
    await redis.hincrby("insight-feedback-counts", `${insightId}:${feedbackType}`, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error storing feedback:", error)
    return NextResponse.json({ error: "Failed to store feedback" }, { status: 500 })
  }
}

// Helper function to anonymize IP addresses
function anonymizeIp(ip: string): string {
  // For IPv4, remove the last octet
  // For IPv6, remove the last 80 bits (last 20 hex chars)
  if (ip.includes(".")) {
    // IPv4
    return ip.split(".").slice(0, 3).join(".") + ".0"
  } else if (ip.includes(":")) {
    // IPv6
    return ip.substring(0, ip.length - 20) + ":0000:0000:0000:0000:0000"
  }
  return "unknown"
}
