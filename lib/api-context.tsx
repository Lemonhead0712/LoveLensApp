"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ApiContextType {
  apiAvailable: boolean
  setApiAvailable: (value: boolean) => void
  isLimitedMode: boolean
  setIsLimitedMode: (value: boolean) => void
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

export function ApiProvider({
  children,
  initialApiAvailable = false,
}: { children: ReactNode; initialApiAvailable?: boolean }) {
  const [apiAvailable, setApiAvailable] = useState(initialApiAvailable)
  const [isLimitedMode, setIsLimitedMode] = useState(false)

  return (
    <ApiContext.Provider value={{ apiAvailable, setApiAvailable, isLimitedMode, setIsLimitedMode }}>
      {children}
    </ApiContext.Provider>
  )
}

export function useApiStatus() {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error("useApiStatus must be used within an ApiProvider")
  }
  return context
}
