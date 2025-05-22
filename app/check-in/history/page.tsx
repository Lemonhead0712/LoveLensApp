"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getCheckIns } from "@/lib/database"
import type { CheckIn } from "@/types/database"
import MoodChart from "@/components/mood-chart"

export default function CheckInHistoryPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function loadCheckIns() {
      if (user) {
        setIsDataLoading(true)
        try {
          const checks = await getCheckIns(user.id)
          setCheckIns(checks)
        } catch (error) {
          console.error("Error loading check-ins:", error)
        } finally {
          setIsDataLoading(false)
        }
      }
    }

    if (user) {
      loadCheckIns()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="pl-0 mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Check-in History</h1>
            <p className="text-gray-600">Track your relationship mood over time</p>
          </div>
          <Link href="/check-in">
            <Button className="bg-rose-600 hover:bg-rose-700">New Check-in</Button>
          </Link>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mood Trends</CardTitle>
              <CardDescription>Visualize how your relationship mood has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                </div>
              ) : (
                <MoodChart checkIns={checkIns} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Check-ins</CardTitle>
              <CardDescription>Your complete check-in history</CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                </div>
              ) : checkIns.length > 0 ? (
                <div className="space-y-4">
                  {checkIns.map((checkIn) => (
                    <div key={checkIn.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 mr-2">Mood: {checkIn.mood}</span>
                            {checkIn.mood === "Happy" && "😊"}
                            {checkIn.mood === "Content" && "😌"}
                            {checkIn.mood === "Neutral" && "😐"}
                            {checkIn.mood === "Concerned" && "😟"}
                            {checkIn.mood === "Sad" && "😢"}
                            {checkIn.mood === "Frustrated" && "😤"}
                            {checkIn.mood === "Angry" && "😠"}
                          </div>
                          <p className="text-sm text-gray-500">{formatDate(checkIn.created_at)}</p>
                        </div>
                      </div>
                      {checkIn.note && <p className="mt-2 text-gray-700">{checkIn.note}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't recorded any check-ins yet.</p>
                  <Link href="/check-in">
                    <Button className="bg-rose-600 hover:bg-rose-700">New Check-in</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
