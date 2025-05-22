"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { saveCheckIn } from "@/lib/database"

const MOOD_OPTIONS = [
  { value: "Happy", emoji: "😊", color: "bg-green-100 border-green-300" },
  { value: "Content", emoji: "😌", color: "bg-emerald-100 border-emerald-300" },
  { value: "Neutral", emoji: "😐", color: "bg-gray-100 border-gray-300" },
  { value: "Concerned", emoji: "😟", color: "bg-yellow-100 border-yellow-300" },
  { value: "Sad", emoji: "😢", color: "bg-blue-100 border-blue-300" },
  { value: "Frustrated", emoji: "😤", color: "bg-orange-100 border-orange-300" },
  { value: "Angry", emoji: "😠", color: "bg-red-100 border-red-300" },
]

export default function CheckInForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMood) {
      setError("Please select a mood")
      return
    }

    if (!user) {
      setError("You must be logged in to submit a check-in")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await saveCheckIn(user.id, selectedMood, note)
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("Error saving check-in:", err)
      setError("Failed to save your check-in. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Relationship Check-in</CardTitle>
        <CardDescription className="text-center">How are you feeling about your relationship today?</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select your mood</label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    selectedMood === mood.value
                      ? `${mood.color} border-2 ring-2 ring-rose-500 ring-opacity-50`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-xs font-medium">{mood.value}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <Textarea
              id="note"
              placeholder="Share your thoughts about your relationship today..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-rose-600 hover:bg-rose-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Check-in"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
