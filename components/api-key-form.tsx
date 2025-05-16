"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Key } from "lucide-react"
import { configureOpenAI } from "@/lib/api-config"
import { getApiStatus, validateApiKey } from "@/app/actions/api-actions"

interface ApiKeyFormProps {
  onConfigured: () => void
  onSkip?: () => void
}

export function ApiKeyForm({ onConfigured, onSkip }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  // Check if API is already configured via environment variable
  useEffect(() => {
    const checkApiStatus = async () => {
      const status = await getApiStatus()
      if (status.hasApiKey) {
        setIsConfigured(true)
        onConfigured()
      }
    }

    checkApiStatus()
  }, [onConfigured])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!apiKey.trim()) {
      setError("Please enter an API key")
      return
    }

    setIsConfiguring(true)

    try {
      // Validate the API key using our server action
      const result = await validateApiKey(apiKey)

      if (result.success) {
        // If successful, configure the API client-side for this session
        configureOpenAI(apiKey)
        setIsConfigured(true)
        onConfigured()
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Error configuring OpenAI:", error)
      setError(error instanceof Error ? error.message : "Failed to configure API key")
    } finally {
      setIsConfiguring(false)
    }
  }

  const handleSkip = () => {
    if (onSkip) onSkip()
  }

  if (isConfigured) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertTitle>OpenAI API Configured</AlertTitle>
        <AlertDescription>
          Your OpenAI API key has been configured successfully. You can now use enhanced sentiment analysis.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-rose-500" />
          Configure OpenAI API
        </CardTitle>
        <CardDescription>
          Add your OpenAI API key to enable enhanced sentiment analysis. Your key is stored locally and never sent to
          our servers.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              You can get your API key from the{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-600 hover:underline"
              >
                OpenAI dashboard
              </a>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleSkip}>
            Skip (Use Basic Analysis)
          </Button>
          <Button type="submit" disabled={isConfiguring}>
            {isConfiguring ? "Configuring..." : "Configure API"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
