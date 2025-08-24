"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeCheck, BrainCircuit, Sparkles, UserCog2, Crown } from "lucide-react"
import RiveBadge from "@/components/rive-badge"
import AppShell from "@/components/app-shell"

export default function HomePage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        {/* Hero Section with BPI-inspired styling */}
        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bpi-text-gradient">PersonaForge</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              <span className="text-primary font-bold text-xl">For the People. Forged for You.</span>
              <br />
              An agentic AI system that builds and evolves a Synthetic Digital Twin Persona for each customer—enabling
              adaptive, emotionally aware banking experiences.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/personas">
                <Button className="bg-primary hover:bg-primary/90 text-white">View Personas</Button>
              </Link>
              <Link href="/personas/new">
                <Button
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                >
                  Create Persona
                </Button>
              </Link>
              <Link href="/chat">
                <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-white">
                  <Sparkles className="h-4 w-4" />
                  Open Chat Demo
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-primary/20">
                <CardContent className="flex items-start gap-3 p-4">
                  <UserCog2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Synthetic Personas</p>
                    <p className="text-sm text-muted-foreground">
                      Each user is represented by a behaviorally trained AI model.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-secondary/20">
                <CardContent className="flex items-start gap-3 p-4">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-medium">Autonomous Personalization</p>
                    <p className="text-sm text-muted-foreground">
                      Real-time nudges and low-risk decisions across channels.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="flex items-start gap-3 p-4">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Evolution Loop</p>
                    <p className="text-sm text-muted-foreground">
                      Personas adapt from outcomes, behaviors, and micro-cues.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-secondary/20">
                <CardContent className="flex items-start gap-3 p-4">
                  <BadgeCheck className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-medium">Context-Aware</p>
                    <p className="text-sm text-muted-foreground">
                      Communicates via channels and tones users intuitively trust.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="p-4 sm:p-6">
                <RiveBadge
                  src="/animations/persona-badge.riv"
                  ariaLabel="Persona animation"
                  className="aspect-[4/3] w-full"
                />
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Tip: drop a Rive file at {"/public/animations/persona-badge.riv"} or edit the path in RiveBadge.
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  )
}
