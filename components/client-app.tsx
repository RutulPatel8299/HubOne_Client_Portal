"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import LoginPage from "@/components/auth/login-page"
import Dashboard from "@/components/dashboard/dashboard"
import QueueManagement from "@/components/queue/queue-management"
import PATracker from "@/components/pa/pa-tracker"
import EVTracker from "@/components/ev/ev-tracker"
import Reports from "@/components/reports/reports"
import Layout from "@/components/layout/layout"

// Mock authentication context
export interface User {
  id: string
  username: string
  role: "Staff" | "Admin" | "System Admin"
  clinicId: string
  clinicName: string
}

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

function ProtectedRoute({ children, user, onLogout }: { children: React.ReactNode; user: User; onLogout: () => void }) {
  return (
    <Layout user={user} onLogout={onLogout}>
      {children}
    </Layout>
  )
}

function AppRoutes({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const location = useLocation()

  if (!user) {
    return (
      <LoginPage
        onLogin={async (username: string, password: string) => {
          // This will be handled by the parent component
          return false
        }}
      />
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user} onLogout={onLogout}>
            <Dashboard user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue"
        element={
          <ProtectedRoute user={user} onLogout={onLogout}>
            <QueueManagement user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pa-tracker"
        element={
          <ProtectedRoute user={user} onLogout={onLogout}>
            <PATracker user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ev-tracker"
        element={
          <ProtectedRoute user={user} onLogout={onLogout}>
            <EVTracker user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute user={user} onLogout={onLogout}>
            <Reports user={user} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function RouterWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleRedirect = () => {
      // Check for redirect from 404.html
      const redirect = sessionStorage.getItem("redirect")
      if (redirect && redirect !== location.pathname) {
        sessionStorage.removeItem("redirect")
        // Small delay to ensure React Router is ready
        setTimeout(() => {
          navigate(redirect, { replace: true })
        }, 100)
      }
    }

    // Handle redirect on mount
    handleRedirect()

    // Store current path for future refreshes
    if (location.pathname !== "/") {
      sessionStorage.setItem("currentPath", location.pathname)
    }
  }, [navigate, location])

  return <>{children}</>
}

export default function ClientApp() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("mysage_user")
    const currentPath = sessionStorage.getItem("currentPath")

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)

        // If we have a saved path and user is logged in, we'll navigate there
        if (currentPath && currentPath !== "/") {
          sessionStorage.setItem("redirect", currentPath)
        }
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("mysage_user")
      }
    }
    setIsLoading(false)
  }, [])

  // Mock login function with static data
  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user data based on username
    const mockUsers: Record<string, User> = {
      "staff@clinic1.com": {
        id: "1",
        username: "staff@clinic1.com",
        role: "Staff",
        clinicId: "clinic1",
        clinicName: "Downtown Medical Center",
      },
      "admin@clinic1.com": {
        id: "2",
        username: "admin@clinic1.com",
        role: "Admin",
        clinicId: "clinic1",
        clinicName: "Downtown Medical Center",
      },
      "sysadmin@mysage.com": {
        id: "3",
        username: "sysadmin@mysage.com",
        role: "System Admin",
        clinicId: "all",
        clinicName: "mySage System",
      },
    }

    if (mockUsers[username] && password === "password123") {
      const userData = mockUsers[username]
      setUser(userData)
      localStorage.setItem("mysage_user", JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("mysage_user")
    sessionStorage.removeItem("currentPath")
    sessionStorage.removeItem("redirect")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <RouterWrapper>
          {!user ? <LoginPage onLogin={login} /> : <AppRoutes user={user} onLogout={logout} />}
        </RouterWrapper>
      </div>
    </BrowserRouter>
  )
}
