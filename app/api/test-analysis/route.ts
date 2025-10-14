import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const startTime = Date.now()
  const log: string[] = []

  try {
    log.push(`[${new Date().toISOString()}] Test analysis started`)
    log.push(`Environment: ${process.env.NEXT_PUBLIC_VERCEL_ENV || "development"}`)

    // Parse the request
    const formData = await request.formData()
    log.push(`FormData parsed successfully`)

    // Check for files
    const files: File[] = []
    let fileIndex = 0

    while (true) {
      const file = formData.get(`file-${fileIndex}`) as File | null
      if (!file) break

      log.push(`File ${fileIndex}: ${file.name} (${file.size} bytes, ${file.type})`)

      // Validate file
      if (!file.size) {
        log.push(`ERROR: File ${fileIndex} has no size`)
        return NextResponse.json({ success: false, log, error: "File has no size" }, { status: 400 })
      }

      if (file.size > 10 * 1024 * 1024) {
        log.push(`ERROR: File ${fileIndex} is too large (${file.size} bytes)`)
        return NextResponse.json({ success: false, log, error: "File too large" }, { status: 400 })
      }

      // Try to read file
      try {
        const buffer = await file.arrayBuffer()
        log.push(`File ${fileIndex} readable: ${buffer.byteLength} bytes`)
      } catch (readError: any) {
        log.push(`ERROR: Cannot read file ${fileIndex}: ${readError.message}`)
        return NextResponse.json(
          { success: false, log, error: `Cannot read file: ${readError.message}` },
          {
            status: 400,
          },
        )
      }

      // Try to convert to base64
      try {
        const buffer = await file.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        const base64 = Buffer.from(bytes).toString("base64")
        log.push(`File ${fileIndex} converted to base64: ${base64.length} characters`)
      } catch (base64Error: any) {
        log.push(`ERROR: Cannot convert file ${fileIndex} to base64: ${base64Error.message}`)
        return NextResponse.json(
          { success: false, log, error: `Cannot convert to base64: ${base64Error.message}` },
          { status: 500 },
        )
      }

      files.push(file)
      fileIndex++
    }

    log.push(`Total files processed: ${files.length}`)

    if (files.length === 0) {
      log.push(`ERROR: No files provided`)
      return NextResponse.json({ success: false, log, error: "No files provided" }, { status: 400 })
    }

    // Test OpenAI API connectivity (without actually sending images)
    try {
      log.push(`Testing OpenAI API connectivity...`)
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        log.push(`OpenAI API connectivity: OK`)
      } else {
        log.push(`OpenAI API connectivity: FAILED (${response.status} ${response.statusText})`)
        return NextResponse.json(
          { success: false, log, error: `OpenAI API error: ${response.status}` },
          { status: 500 },
        )
      }
    } catch (apiError: any) {
      log.push(`OpenAI API connectivity: FAILED (${apiError.message})`)
      return NextResponse.json(
        { success: false, log, error: `OpenAI API error: ${apiError.message}` },
        {
          status: 500,
        },
      )
    }

    const duration = Date.now() - startTime
    log.push(`Test completed successfully in ${duration}ms`)

    return NextResponse.json({
      success: true,
      log,
      summary: {
        filesProcessed: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        duration: `${duration}ms`,
        openaiConnectivity: "OK",
      },
    })
  } catch (error: any) {
    log.push(`FATAL ERROR: ${error.message}`)
    log.push(`Stack: ${error.stack}`)

    return NextResponse.json(
      {
        success: false,
        log,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
