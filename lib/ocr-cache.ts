/**
 * OCR Result Caching
 *
 * This module provides functions for caching OCR results to improve performance
 * by avoiding redundant processing of the same images.
 */

import type { Message } from "./types"

// Cache structure
interface OcrCacheEntry {
  timestamp: number
  messages: Message[]
  rawText: string
  confidence: number
}

// In-memory cache (will be cleared on page refresh)
const ocrCache = new Map<string, OcrCacheEntry>()

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION_MS = 30 * 60 * 1000

/**
 * Generates a cache key for an image file
 *
 * @param file - The image file
 * @returns A promise that resolves to a cache key
 */
export async function generateCacheKey(file: File): Promise<string> {
  // Use file name, size, and last modified time as the cache key
  return `${file.name}-${file.size}-${file.lastModified}`
}

/**
 * Stores OCR results in the cache
 *
 * @param key - The cache key
 * @param messages - The extracted messages
 * @param rawText - The raw extracted text
 * @param confidence - The OCR confidence score
 */
export function cacheOcrResult(key: string, messages: Message[], rawText: string, confidence: number): void {
  ocrCache.set(key, {
    timestamp: Date.now(),
    messages,
    rawText,
    confidence,
  })
}

/**
 * Retrieves OCR results from the cache if available
 *
 * @param key - The cache key
 * @returns The cached OCR results or null if not found or expired
 */
export function getCachedOcrResult(key: string): { messages: Message[]; rawText: string; confidence: number } | null {
  const entry = ocrCache.get(key)

  // Return null if not found or expired
  if (!entry || Date.now() - entry.timestamp > CACHE_EXPIRATION_MS) {
    if (entry) {
      // Remove expired entry
      ocrCache.delete(key)
    }
    return null
  }

  return {
    messages: entry.messages,
    rawText: entry.rawText,
    confidence: entry.confidence,
  }
}

/**
 * Clears the OCR cache
 */
export function clearOcrCache(): void {
  ocrCache.clear()
}
