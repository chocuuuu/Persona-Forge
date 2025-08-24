"use client"

import Link from "next/link"
import type { PropsWithChildren } from "react"
import { Button } from "@/components/ui/button"
import { Crown, Home, PersonStanding, Sparkles, User, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { getAuthState, logout } from "@/lib/auth"
import { useEffect, useState } from "react"
import type { AuthState } from "@/types/user"

type AppShellProps = PropsWithChildren<{ title?: string }>

export default function AppShell({ children, title = "PersonaForge" }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null })

  useEffect(() => {
    // Initial auth check
    setAuth(getAuthState())

    // Listen for auth state changes
    function handleAuthChange(event: CustomEvent) {
      setAuth(event.detail)
    }

    window.addEventListener("authStateChanged", handleAuthChange as EventListener)

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange as EventListener)
    }
  }, [])

  const nav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/personas", label: "Personas", icon: PersonStanding },
    { href: "/chat", label: "Chat", icon: Sparkles },
  ]

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr_auto]">
      <header className="border-b shadow-lg" style={{ backgroundColor: "#B91C1C", color: "white" }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Crown className="h-6 w-6" style={{ color: "#7F1D1D" }} aria-hidden="true" />
            <span className="font-bold text-xl text-white">{title}</span>
            <span className="sr-only">Go to home</span>
          </Link>

          <div className="flex items-center gap-4">
            <nav aria-label="Main navigation" className="flex items-center gap-1">
              {nav.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className={cn("gap-2 text-white hover:text-white", active ? "text-white" : "hover:bg-white/10")}
                      style={active ? { backgroundColor: "#7F1D1D" } : {}}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-2">
              {auth.isAuthenticated && auth.user ? (
                <>
                  <Link href="/profile">
                    <Button variant="ghost" className="gap-2 text-white hover:text-white hover:bg-white/10">
                      <User className="h-4 w-4" />
                      {auth.user.name}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="gap-2 bg-transparent border-white text-white hover:bg-white hover:text-red-700"
                  >
                    <User className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 overflow-y-auto">{children}</main>

      <footer className="border-t bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          Built with React, Next.js, and shadcn/ui. Enhanced with BPI-inspired design and personalized AI.
        </div>
      </footer>
    </div>
  )
}
