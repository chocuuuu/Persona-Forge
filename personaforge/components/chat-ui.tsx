"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ShieldAlert, Cpu, Crown } from "lucide-react"
import { analyzeEmotion } from "@/lib/emotion"
import { assessImpulsiveRisk } from "@/lib/guardrails"
import {
  createPersonaFromFirstMessage,
  getLocalPersonaById,
  getOrCreateSessionPersonaId,
  saveLocalPersona,
} from "@/lib/client-personas"
import { loadFaq, findFaqAnswer } from "@/lib/faq"
import { getFinancialSummary } from "@/lib/transactions"
import { getAuthState } from "@/lib/auth"
import type { Persona } from "@/types/persona"
import type { FinancialSummary } from "@/types/transaction"
import Markdown from "@/components/markdown"
import { formatAssistantText } from "@/lib/text-format"

type ChatMessage = { id: string; role: "user" | "assistant"; content: string; timestamp: string }
type ModelInfo = { provider: string; model: string; config?: string }

export default function ChatUI({ className = "h-full min-h-0" }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([])
  const [persona, setPersona] = useState<Persona | null>(null)
  const [riskInfo, setRiskInfo] = useState<ReturnType<typeof assessImpulsiveRisk> | null>(null)
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadFaq("/data/faq.csv")
      .then(setFaq)
      .catch(() => setFaq([]))
  }, [])

  useEffect(() => {
    const id = getOrCreateSessionPersonaId()
    const p = getLocalPersonaById(id)
    if (p) setPersona(p)

    // Load user's financial data
    const auth = getAuthState()
    if (auth.user) {
      const summary = getFinancialSummary(auth.user.id)
      setFinancialSummary(summary)
    }
  }, [])

  // Check model info on mount
  useEffect(() => {
    fetch("/api/ai/ping")
      .then((r) => r.json())
      .then((data) => {
        if (data.configured) {
          setModelInfo({
            provider: data.provider,
            model: data.model,
            config: data.fallback ? `fallback from ${data.fallback}` : undefined,
          })
        }
      })
      .catch(() => setModelInfo({ provider: "offline", model: "FAQ mode" }))
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, riskInfo])

  const latestEmotion = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    return lastUser ? analyzeEmotion(lastUser.content) : null
  }, [messages])

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return

    const timestamp = new Date().toISOString()
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, timestamp }
    setMessages((m) => [...m, userMsg])
    setInput("")

    const current = persona
    if (!current) {
      const created = createPersonaFromFirstMessage(text)
      setPersona(created)
    }

    const emotion = analyzeEmotion(text)
    const risk = assessImpulsiveRisk(text, emotion)
    setRiskInfo(risk.level === "low" ? null : risk)

    setLoading(true)
    try {
      const result = await getAssistantReply({
        messages: [...messages, userMsg],
        persona: current ?? getLocalPersonaById(getOrCreateSessionPersonaId()),
        faq,
        risk,
        financialSummary,
      })

      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.text,
          timestamp: new Date().toISOString(),
        },
      ])

      // Update model info from the actual response
      if (result.modelInfo) {
        setModelInfo(result.modelInfo)
      }

      const p = getLocalPersonaById(getOrCreateSessionPersonaId())
      if (p) {
        const updated: Persona = { ...p, tonePreference: emotion.label, updatedAt: new Date().toISOString() }
        saveLocalPersona(updated)
        setPersona(updated)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="h-full p-0">
        <div className="grid h-full grid-rows-[auto_1fr_auto]">
          <div className="border-b p-3 flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">PersonaForge AI Assistant</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Model Info Badge */}
              {modelInfo && (
                <Badge variant="outline" className="gap-1 border-primary/20">
                  <Cpu className="h-3 w-3" />
                  <span className="text-xs">
                    {modelInfo.provider === "groq" && "🚀"}
                    {modelInfo.provider === "openai" && "🤖"}
                    {modelInfo.provider === "offline" && "📚"}
                    {modelInfo.provider}/{modelInfo.model.split("-").slice(-2).join("-")}
                  </span>
                </Badge>
              )}
              {/* Emotion Badges */}
              {latestEmotion && (
                <>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                    {latestEmotion.label}
                  </Badge>
                  <Badge variant="outline" className="border-primary/20">
                    score {latestEmotion.score}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div ref={listRef} className="min-h-0 overflow-y-auto p-4 space-y-3">
            {/* Enhanced Model Info Alert */}
            {modelInfo && (
              <Alert variant="default" className="border-primary/20">
                <Crown className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">PersonaForge AI Active</AlertTitle>
                <AlertDescription className="text-xs">
                  Using {modelInfo.provider.toUpperCase()} • {modelInfo.model}
                  {modelInfo.config && ` • ${modelInfo.config}`}
                  {financialSummary && ` • Financial data integrated`}
                </AlertDescription>
              </Alert>
            )}

            {persona ? (
              <Alert variant="default" className="border-secondary/20">
                <AlertTitle className="text-secondary">Persona Active</AlertTitle>
                <AlertDescription className="text-xs">
                  {persona.name} • tone: {persona.tonePreference} • risk: {persona.riskAffinity} • channels:{" "}
                  {persona.contactChannels.join(", ")}
                </AlertDescription>
              </Alert>
            ) : null}

            {riskInfo && (
              <Alert variant="destructive" role="alert">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Impulse Guard</AlertTitle>
                <AlertDescription className="text-xs">{riskInfo.message}</AlertDescription>
              </Alert>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user"
              const content = isUser ? m.content : formatAssistantText(m.content)
              const isRestricted = !isUser && m.content.includes("I'm PersonaForge AI, your specialized banking")

              return (
                <div key={m.id} className={isUser ? "text-right" : "text-left"}>
                  <div
                    className={[
                      "inline-block max-w-[85%] rounded-lg px-3 py-2 leading-relaxed break-words",
                      isUser
                        ? "bg-primary text-primary-foreground text-sm"
                        : isRestricted
                          ? "bg-secondary/10 text-secondary border border-secondary/20 text-sm"
                          : "bg-muted text-sm border border-primary/10",
                    ].join(" ")}
                  >
                    {isUser ? (
                      <span className="whitespace-pre-wrap">{content}</span>
                    ) : (
                      <Markdown className="whitespace-pre-wrap">{content}</Markdown>
                    )}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Generating personalized response...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Ask about banking, investments, loans, budgeting, or financial planning..."
              aria-label="Your message"
              className="border-primary/20 focus:border-primary"
            />
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              Send
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

async function getAssistantReply(args: {
  messages: { role: "user" | "assistant"; content: string; timestamp: string }[]
  persona: Persona | null
  faq: { q: string; a: string }[]
  risk: ReturnType<typeof assessImpulsiveRisk>
  financialSummary: FinancialSummary | null
}): Promise<{ text: string; modelInfo?: ModelInfo }> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: args.messages.map((m) => ({ role: m.role, content: m.content })),
        persona: args.persona,
        risk: args.risk,
        financialSummary: args.financialSummary,
        conversationHistory: args.messages.slice(-10), // Last 10 messages for context
      }),
    })
    if (res.ok) {
      const data = (await res.json()) as { text: string; provider?: string; model?: string; config?: string }
      return {
        text: data.text,
        modelInfo: data.provider
          ? {
              provider: data.provider,
              model: data.model || "unknown",
              config: data.config,
            }
          : undefined,
      }
    }
  } catch {}

  const lastUser = [...args.messages].reverse().find((m) => m.role === "user")?.content ?? ""
  const found = findFaqAnswer(lastUser, args.faq)
  return {
    text:
      found ??
      `I'm not fully configured with an AI provider yet, but here's a safe-first approach:
- Clarify your goal, amount, and timeline.
- Compare at least 3 options (APR, fees, prepayment rules).
- Simulate cash flow impact across 3–6 months.`,
    modelInfo: { provider: "offline", model: "FAQ mode" },
  }
}
