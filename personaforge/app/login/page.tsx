"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, LogIn, UserPlus, Sparkles } from "lucide-react"
import { authenticateUser, registerUser, setAuthState } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const user = authenticateUser(email, password)
      if (!user) {
        setError("Invalid email or password")
        return
      }

      // Set auth state first
      setAuthState({ isAuthenticated: true, user })
      setSuccess("Login successful! Redirecting to home...")

      // Simple redirect without reload
      setTimeout(() => {
        router.replace("/")
      }, 800)
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    if (!email || !password || !name) {
      setError("All fields are required")
      setLoading(false)
      return
    }

    if (password.length < 3) {
      setError("Password must be at least 3 characters")
      setLoading(false)
      return
    }

    try {
      const user = registerUser(email, password, name)

      // Set auth state first
      setAuthState({ isAuthenticated: true, user })
      setSuccess("Account created successfully! Redirecting to home...")

      // Simple redirect without reload
      setTimeout(() => {
        router.replace("/")
      }, 800)
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Header with red background */}
        <div
          className="text-center mb-8 p-6 rounded-t-2xl"
          style={{ background: "linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)" }}
        >
          <div className="inline-flex items-center gap-3 text-3xl font-bold text-white mb-4">
            <Crown className="h-10 w-10 text-white" />
            PersonaForge
          </div>
          <p className="text-white text-lg font-medium">For the People. Forged for You.</p>
          <p className="mt-2 text-white/90">Sign in to access your personalized banking AI</p>
        </div>

        <Card className="shadow-2xl border-0 rounded-t-none">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Access your financial persona and personalized banking experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1" style={{ backgroundColor: "#B91C1C" }}>
                <TabsTrigger
                  value="login"
                  className="text-white data-[state=active]:bg-white data-[state=active]:text-red-700 font-medium"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="text-white data-[state=active]:bg-white data-[state=active]:text-red-700 font-medium"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      className="h-11 border-2 border-gray-300 focus:border-red-600 focus:ring-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                      className="h-11 border-2 border-gray-300 focus:border-red-600 focus:ring-red-600"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-white font-medium hover:opacity-90"
                    disabled={loading}
                    style={{ backgroundColor: "#B91C1C" }}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      disabled={loading}
                      className="h-11 border-2 border-gray-300 focus:border-red-600 focus:ring-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      className="h-11 border-2 border-gray-300 focus:border-red-600 focus:ring-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="Create a password (min 3 chars)"
                      required
                      disabled={loading}
                      minLength={3}
                      className="h-11 border-2 border-gray-300 focus:border-red-600 focus:ring-red-600"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-white font-medium hover:opacity-90"
                    disabled={loading}
                    style={{ backgroundColor: "#B91C1C" }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <Sparkles className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Demo Info Card with red styling */}
            <Card className="mt-6 border-2" style={{ borderColor: "#B91C1C", backgroundColor: "#FEF2F2" }}>
              <CardContent className="p-0">
                <div className="text-center">
                  <h3 className="font-semibold text-red-700 mb-2">Demo Mode</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• Any password works for existing users</p>
                    <p>
                      • Try: <code className="bg-red-100 text-red-800 px-2 py-1 rounded">demo@example.com</code>
                    </p>
                    <p>• Or create a new account to get started</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Preview with red styling */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div
                className="text-center p-3 rounded-lg border-2"
                style={{ borderColor: "#B91C1C", backgroundColor: "#FEF2F2" }}
              >
                <Crown className="h-6 w-6 mx-auto mb-2 text-red-700" />
                <p className="font-medium text-red-700">AI Personas</p>
                <p className="text-gray-600">Personalized banking</p>
              </div>
              <div
                className="text-center p-3 rounded-lg border-2"
                style={{ borderColor: "#7F1D1D", backgroundColor: "#FEF2F2" }}
              >
                <Sparkles className="h-6 w-6 mx-auto mb-2" style={{ color: "#7F1D1D" }} />
                <p className="font-medium" style={{ color: "#7F1D1D" }}>
                  Smart Chat
                </p>
                <p className="text-gray-600">Financial guidance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>Built with React, Next.js, and AI</p>
          <p className="mt-1">Enhanced with BPI-inspired design</p>
        </div>
      </div>
    </div>
  )
}
