"use client"

import type React from "react"

import { useState, useEffect } from "react"

export default function App() {
  const [ClientApp, setClientApp] = useState<React.ComponentType | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const loadClientApp = async () => {
      try {
        const { default: ClientAppComponent } = await import("@/components/client-app")
        setClientApp(() => ClientAppComponent)
        setMounted(true)
      } catch (error) {
        console.error("Failed to load client app:", error)
      }
    }

    loadClientApp()
  }, [])

  if (!mounted || !ClientApp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <ClientApp />
}
