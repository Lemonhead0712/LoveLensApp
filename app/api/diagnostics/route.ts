import { NextResponse } from "next/server"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
    checks: [] as Array<{ name: string; status: "pass" | "fail"; details: string }>,
  }

  // Check 1: OpenAI API Key
  try {
    if (!process.env.OPENAI_API_KEY) {
      diagnostics.checks.push({
        name: "OpenAI API Key",
        status: "fail",
        details: "OPENAI_API_KEY environment variable is not set",
      })
    } else if (process.env.OPENAI_API_KEY.length < 20) {
      diagnostics.checks.push({
        name: "OpenAI API Key",
        status: "fail",
        details: "OPENAI_API_KEY appears to be invalid (too short)",
      })
    } else {
      diagnostics.checks.push({
        name: "OpenAI API Key",
        status: "pass",
        details: `Key present (${process.env.OPENAI_API_KEY.substring(0, 7)}...)`,
      })
    }
  } catch (error) {
    diagnostics.checks.push({
      name: "OpenAI API Key",
      status: "fail",
      details: `Error checking key: ${error}`,
    })
  }

  // Check 2: OpenAI API Connectivity
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      diagnostics.checks.push({
        name: "OpenAI API Connectivity",
        status: "pass",
        details: "Successfully connected to OpenAI API",
      })
    } else {
      diagnostics.checks.push({
        name: "OpenAI API Connectivity",
        status: "fail",
        details: `API returned status ${response.status}: ${response.statusText}`,
      })
    }
  } catch (error: any) {
    diagnostics.checks.push({
      name: "OpenAI API Connectivity",
      status: "fail",
      details: `Connection failed: ${error.message}`,
    })
  }

  // Check 3: Memory and Performance
  try {
    if (typeof process.memoryUsage === "function") {
      const memory = process.memoryUsage()
      const memoryMB = {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024),
      }

      diagnostics.checks.push({
        name: "Server Memory",
        status: memoryMB.heapUsed < 500 ? "pass" : "fail",
        details: `RSS: ${memoryMB.rss}MB, Heap: ${memoryMB.heapUsed}/${memoryMB.heapTotal}MB`,
      })
    }
  } catch (error) {
    diagnostics.checks.push({
      name: "Server Memory",
      status: "fail",
      details: `Unable to check memory: ${error}`,
    })
  }

  // Check 4: File Processing Capability
  try {
    const testBlob = new Blob(["test"], { type: "text/plain" })
    const testFile = new File([testBlob], "test.txt", { type: "text/plain" })
    const buffer = await testFile.arrayBuffer()

    diagnostics.checks.push({
      name: "File Processing",
      status: "pass",
      details: `Can create and read files (${buffer.byteLength} bytes)`,
    })
  } catch (error: any) {
    diagnostics.checks.push({
      name: "File Processing",
      status: "fail",
      details: `File processing failed: ${error.message}`,
    })
  }

  // Check 5: Base64 Encoding
  try {
    const testString = "Hello, World!"
    const encoded = Buffer.from(testString).toString("base64")
    const decoded = Buffer.from(encoded, "base64").toString("utf-8")

    diagnostics.checks.push({
      name: "Base64 Encoding",
      status: decoded === testString ? "pass" : "fail",
      details: decoded === testString ? "Encoding/decoding works correctly" : "Encoding/decoding mismatch",
    })
  } catch (error: any) {
    diagnostics.checks.push({
      name: "Base64 Encoding",
      status: "fail",
      details: `Base64 operations failed: ${error.message}`,
    })
  }

  const allPassed = diagnostics.checks.every((check) => check.status === "pass")

  return NextResponse.json(
    {
      ...diagnostics,
      overallStatus: allPassed ? "healthy" : "unhealthy",
      summary: `${diagnostics.checks.filter((c) => c.status === "pass").length}/${diagnostics.checks.length} checks passed`,
    },
    { status: allPassed ? 200 : 500 },
  )
}
