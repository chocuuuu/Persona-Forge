"use client"

import { useEffect, useMemo, useState } from "react"
import AppShell from "@/components/app-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PersonStanding, RefreshCcw } from "lucide-react"
import { getPersonas } from "@/lib/api"
import { getLocalPersonas } from "@/lib/client-personas"
import PersonaCard from "@/components/persona-card"
import type { Persona } from "@/types/persona"

export default function PersonasPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const list = await getPersonas({ q: query })
      const locals = getLocalPersonas()
      const merged = dedupeById([...list, ...locals])
      setPersonas(merged)
    } catch (e: any) {
      setError(e?.message ?? "Failed to load personas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!query) return personas
    const q = query.toLowerCase()
    return personas.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.goals.join(" ").toLowerCase().includes(q),
    )
  }, [personas, query])

  function dedupeById(arr: Persona[]) {
    const map = new Map<string, Persona>()
    for (const p of arr) map.set(p.id, p)
    return Array.from(map.values())
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <PersonStanding className="h-5 w-5 text-primary" />
            Personas
          </h1>
          <div className="flex w-full gap-2 sm:w-auto">
            <Input
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Search by name, summary, or goal"
              aria-label="Search personas"
              className="border-primary/20 focus:border-primary"
            />
            <Button
              onClick={load}
              variant="outline"
              disabled={loading}
              aria-busy={loading}
              className="border-primary/20 bg-transparent"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </header>

        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-lg border bg-muted/30" />
              ))
            : filtered.map((p) => <PersonaCard key={p.id} persona={p} />)}
        </section>

        {!loading && filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">No personas found.</p>
        )}
      </main>
    </AppShell>
  )
}
