"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Activity } from "lucide-react"

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await onLogin(username, password)
      if (!success) {
        setError("Invalid username or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-accent rounded-lg">
              <Activity className="h-6 w-6 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">mySage Client Portal</h1>
          </div>
          <p className="text-muted-foreground">Secure access for healthcare professionals</p>
        </div>

        {/* Login Form */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent">Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Staff:</strong> staff@clinic1.com / password123
            </div>
            <div>
              <strong>Admin:</strong> admin@clinic1.com / password123
            </div>
            <div>
              <strong>System Admin:</strong> sysadmin@mysage.com / password123
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
