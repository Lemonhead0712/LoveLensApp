/**
 * Environment utility functions that work safely on both client and server
 */

// Safe way to check if we're in development mode
export const isDevelopment = () => {
  // Check if window exists (client-side)
  if (typeof window !== "undefined") {
    // Use a different approach on the client
    // This could be based on URL, a build-time injected value, or other client-safe methods
    return (
      process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ||
      process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    )
  }

  // Server-side can directly use NODE_ENV
  return process.env.NODE_ENV === "development"
}

// Safe way to check if we're in production
export const isProduction = () => {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
      process.env.NEXT_PUBLIC_NODE_ENV === "production" ||
      (!isDevelopment() && !isTest())
    )
  }

  return process.env.NODE_ENV === "production"
}

// Safe way to check if we're in test mode
export const isTest = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_VERCEL_ENV === "test" || process.env.NEXT_PUBLIC_NODE_ENV === "test"
  }

  return process.env.NODE_ENV === "test"
}
