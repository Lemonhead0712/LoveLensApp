"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, LogOut, User, History, Settings, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import { getAnalysisResults, getCheckIns, getJournalEntries } from "@/lib/database"
import type { AnalysisResult, CheckIn, JournalEntry } from "@/types/database"

export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function loadUserData() {
      if (user) {
        setIsDataLoading(true)
        try {
          const [results, checks, journals] = await Promise.all([
            getAnalysisResults(user.id),
            getCheckIns(user.id),
            getJournalEntries(user.id),
          ])
          setAnalysisResults(results)
          setCheckIns(checks)
          setJournalEntries(journals)
        } catch (error) {
          console.error("Error loading user data:", error)
        } finally {
          setIsDataLoading(false)
        }
      }
    }

    if (user) {
      loadUserData()
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline">Home</Button>
            </Link>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 max-w-3xl mx-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="analyses">Analyses</TabsTrigger>
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-rose-600" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="bg-rose-600 hover:bg-rose-700">Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5 text-rose-600" />
                  Analysis History
                </CardTitle>
                <CardDescription>Your previous relationship analyses</CardDescription>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                  </div>
                ) : analysisResults.length > 0 ? (
                  <div className="space-y-4">
                    {analysisResults.map((result) => (
                      <div
                        key={result.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/analysis/${result.id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{result.title || "Untitled Analysis"}</h3>
                            <p className="text-sm text-gray-500">{formatDate(result.created_at)}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't performed any analyses yet.</p>
                    <Link href="/">
                      <Button className="bg-rose-600 hover:bg-rose-700">Start New Analysis</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkins" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-rose-600" />
                      Relationship Check-ins
                    </CardTitle>
                    <CardDescription>Track your relationship mood over time</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/check-in/history">
                      <Button variant="outline">View All</Button>
                    </Link>
                    <Link href="/check-in">
                      <Button className="bg-rose-600 hover:bg-rose-700">New Check-in</Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                  </div>
                ) : checkIns.length > 0 ? (
                  <div className="space-y-4">
                    {checkIns.slice(0, 3).map((checkIn) => (
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
                    {checkIns.length > 3 && (
                      <div className="text-center">
                        <Link href="/check-in/history">
                          <Button variant="link" className="text-rose-600">
                            View all {checkIns.length} check-ins
                          </Button>
                        </Link>
                      </div>
                    )}
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
          </TabsContent>

          <TabsContent value="journal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-rose-600" />
                  Relationship Journal
                </CardTitle>
                <CardDescription>Your private thoughts and reflections</CardDescription>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                  </div>
                ) : journalEntries.length > 0 ? (
                  <div className="space-y-4">
                    {journalEntries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-gray-500">{formatDate(entry.created_at)}</p>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't created any journal entries yet.</p>
                    <Button className="bg-rose-600 hover:bg-rose-700">New Journal Entry</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-rose-600" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email updates about your analyses</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor="notifications" className="ml-2 text-sm text-gray-900 sr-only">
                      Email Notifications
                    </label>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
