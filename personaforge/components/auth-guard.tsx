"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getAuthState } from "@/lib/auth"
import { Loader2 } from "lucide-react"

type AuthGuardProps = {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [authState, setAuthState] = useState<{ isAuthenticated: boolean; user: any }>({
    isAuthenticated: false,
    user: null,
  })

  // Public routes that don't require authentication
  const publicRoutes = ["/login"]

  useEffect(() => {
    function checkAuth() {
      const auth = getAuthState()
      setAuthState(auth)
      setIsChecking(false)

      // Only redirect if not authenticated and not on a public route
      if (!auth.isAuthenticated && !publicRoutes.includes(pathname)) {
        router.replace("/login")
      }
    }

    // Check auth immediately
    checkAuth()

    // Listen for auth state changes
    function handleAuthChange(event: CustomEvent) {
      const newAuth = event.detail
      setAuthState(newAuth)

      // If user just logged in and is on login page, redirect to home
      if (newAuth.isAuthenticated && pathname === "/login") {
        router.replace("/")
      }
    }

    window.addEventListener("authStateChanged", handleAuthChange as EventListener)

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange as EventListener)
    }
  }, [pathname, router])

  // Show loading spinner while checking auth
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // If not authenticated and not on public route, show nothing (redirect is happening)
  if (!authState.isAuthenticated && !publicRoutes.includes(pathname)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Redirecting to login...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
