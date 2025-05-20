import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Create a Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

// In a real app, you would add authentication middleware here
// to ensure only admins can access this endpoint

export async function GET(req: NextRequest) {
  try {
    // Get the most recent feedback (up to 100 items)
    const feedbackList = await redis.lrange("insight-feedback", 0, 99)

    // Parse the JSON strings into objects
    const feedback = feedbackList
      .map((item) => {
        try {
          return JSON.parse(item)
        } catch (e) {
          console.error("Error parsing feedback item:", e)
          return null
        }
      })
      .filter(Boolean)

    // Get the feedback counts
    const counts = (await redis.hgetall("insight-feedback-counts")) || {}

    return NextResponse.json({ feedback, counts })
  } catch (error) {
    console.error("Error fetching feedback data:", error)
    return NextResponse.json({ error: "Failed to fetch feedback data" }, { status: 500 })
  }
}
