import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Check if the code is running in a client environment
 */
export function isClient(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

/**
 * Check if the code is running in a server environment
 */
export function isServer(): boolean {
  return !isClient()
}

// Other utility functions...
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
