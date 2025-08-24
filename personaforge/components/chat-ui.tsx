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
          <div
            className="border-b p-3 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)" }}
          >
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-white" />
              <p className="text-sm font-medium text-white">PersonaForge AI - Banking & Finance Assistant</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Model Info Badge */}
              {modelInfo && (
                <Badge variant="outline" className="gap-1 border-white/20 text-white">
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
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                    {latestEmotion.label}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white">
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
                <AlertTitle className="text-primary">PersonaForge Banking AI Active</AlertTitle>
                <AlertDescription className="text-xs">
                  Specialized in banking & finance • {modelInfo.provider.toUpperCase()} • {modelInfo.model}
                  {modelInfo.config && ` • ${modelInfo.config}`}
                  {financialSummary && ` • Your financial data integrated`}
                </AlertDescription>
              </Alert>
            )}

            {persona ? (
              <Alert variant="default" className="border-secondary/20">
                <AlertTitle style={{ color: "#7F1D1D" }}>Your Financial Persona Active</AlertTitle>
                <AlertDescription className="text-xs">
                  {persona.name} • tone: {persona.tonePreference} • risk: {persona.riskAffinity} • channels:{" "}
                  {persona.contactChannels.join(", ")}
                </AlertDescription>
              </Alert>
            ) : null}

            {riskInfo && (
              <Alert variant="destructive" role="alert">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Financial Risk Alert</AlertTitle>
                <AlertDescription className="text-xs">{riskInfo.message}</AlertDescription>
              </Alert>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user"
              const content = isUser ? m.content : formatAssistantText(m.content)
              return (
                <div key={m.id} className={isUser ? "text-right" : "text-left"}>
                  <div
                    className="inline-block max-w-[85%] rounded-lg px-3 py-2 leading-relaxed break-words text-sm"
                    style={
                      isUser
                        ? { backgroundColor: "#7F1D1D", color: "white" } // Dark red for user messages
                        : { backgroundColor: "#f8f9fa", color: "#333", border: "1px solid #e9ecef" } // Clear/light for AI responses
                    }
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
                Analyzing your financial question...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Ask about banking, loans, investments, budgeting, savings, insurance, or financial planning..."
              aria-label="Your financial question"
              style={{ borderColor: "#B91C1C" }}
              className="focus:border-red-700"
            />
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#B91C1C", color: "white" }}
              className="hover:opacity-90"
            >
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
      `I'm PersonaForge AI, specialized in banking and financial services. I can help with:

• Banking services and accounts
• Loans and credit management  
• Investment planning
• Budgeting and savings
• Insurance coverage
• Financial planning

Please ask me about your financial needs, and I'll provide personalized advice based on your profile.`,
    modelInfo: { provider: "offline", model: "Banking FAQ mode" },
  }
}
