"use client"

import { useEffect, useState } from "react"
import { useLocalStorage } from "@/lib/storage-utils"

/**
 * OfflineSyncManager component
 *
 * Manages synchronization of data when the app comes back online
 * Stores pending operations in local storage and processes them when connection is restored
 */
export function OfflineSyncManager() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingOperations, setPendingOperations] = useLocalStorage<
    Array<{
      type: string
      data: any
      timestamp: number
    }>
  >("offline-pending-operations", [])

  useEffect(() => {
    // Set initial state based on navigator.onLine
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true)

    const handleOnline = async () => {
      setIsOnline(true)

      // Process any pending operations when we come back online
      if (pendingOperations.length > 0) {
        console.log(`Processing ${pendingOperations.length} pending operations`)

        // Process operations in order
        const operations = [...pendingOperations]
        setPendingOperations([])

        for (const operation of operations) {
          try {
            // Process based on operation type
            switch (operation.type) {
              case "feedback":
                await processFeedbackOperation(operation.data)
                break
              case "analysis":
                await processAnalysisOperation(operation.data)
                break
              default:
                console.warn(`Unknown operation type: ${operation.type}`)
            }
          } catch (error) {
            console.error("Error processing offline operation:", error)
            // Re-add failed operations to the queue
            setPendingOperations((prev) => [...prev, operation])
          }
        }
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [pendingOperations, setPendingOperations])

  // Helper functions to process different types of operations
  async function processFeedbackOperation(data: any) {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      throw error
    }
  }

  async function processAnalysisOperation(data: any) {
    // Implementation for processing analysis operations
    console.log("Processing analysis operation:", data)
    // This would typically involve sending data to an API endpoint
  }

  // This component doesn't render anything visible
  return null
}
