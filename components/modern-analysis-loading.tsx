"use client"

import { useEffect, useState } from "react"
import { Loader2, MessageSquare, Brain, BarChart3, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ModernAnalysisLoadingProps {
  progress?: number
  message?: string
}

export default function ModernAnalysisLoading({ progress = 0, message }: ModernAnalysisLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: MessageSquare, label: "Reading messages", color: "text-blue-600" },
    { icon: Brain, label: "Analyzing patterns", color: "text-purple-600" },
    { icon: BarChart3, label: "Generating insights", color: "text-pink-600" },
    { icon: CheckCircle2, label: "Finalizing results", color: "text-green-600" },
  ]

  useEffect(() => {
    if (progress < 30) setCurrentStep(0)
    else if (progress < 60) setCurrentStep(1)
    else if (progress < 90) setCurrentStep(2)
    else setCurrentStep(3)
  }, [progress])

  const CurrentIcon = steps[currentStep].icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping">
                <CurrentIcon className={`h-16 w-16 ${steps[currentStep].color} opacity-20`} />
              </div>
              <CurrentIcon className={`h-16 w-16 ${steps[currentStep].color} relative z-10`} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Conversation</h2>
            <p className="text-gray-600 mb-4">{message || steps[currentStep].label}</p>
          </div>

          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <p className="text-center text-sm font-medium text-gray-700">{progress}% Complete</p>
          </div>

          <div className="flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? "opacity-100" : "opacity-30"
                  } transition-opacity`}
                >
                  <div className={`p-2 rounded-full ${index <= currentStep ? "bg-purple-100" : "bg-gray-100"} mb-1`}>
                    <StepIcon className={`h-5 w-5 ${index <= currentStep ? step.color : "text-gray-400"}`} />
                  </div>
                  <span className="text-xs text-gray-600">{step.label.split(" ")[0]}</span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>This may take a moment...</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
