import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthGuard from "@/components/auth-guard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PersonaForge",
  description: "AI-powered banking personas for personalized financial experiences",
  icons: {
    icon: "/crown.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}