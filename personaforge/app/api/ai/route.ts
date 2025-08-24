import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai as openaiProvider, createOpenAI } from "@ai-sdk/openai"
import { AI_CONFIG } from "@/lib/ai-config"

function selectModel() {
  // Use forced provider if specified, otherwise use env var or default to groq
  const provider =
    AI_CONFIG.FORCE_PROVIDER === "auto" ? (process.env.AI_PROVIDER || "openai").toLowerCase() : AI_CONFIG.FORCE_PROVIDER

  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      // Fallback to OpenAI if Groq not configured
      if (process.env.OPENAI_API_KEY) {
        const modelName = AI_CONFIG.OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini"
        return { model: openaiProvider(modelName), provider: "openai", modelName }
      }
      return { error: { code: "not_configured", message: "Neither GROQ_API_KEY nor OPENAI_API_KEY found" } }
    }
    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey,
    })
    const modelName = AI_CONFIG.GROQ_MODEL || process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
    return { model: groq(modelName), provider: "groq", modelName }
  }

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // Fallback to Groq if OpenAI not configured
      if (process.env.GROQ_API_KEY) {
        const groq = createOpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey: process.env.GROQ_API_KEY,
        })
        const modelName = AI_CONFIG.GROQ_MODEL || process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
        return { model: groq(modelName), provider: "groq", modelName }
      }
      return { error: { code: "not_configured", message: "Neither OPENAI_API_KEY nor GROQ_API_KEY found" } }
    }
    const modelName = AI_CONFIG.OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini"
    return { model: openaiProvider(modelName), provider: "openai", modelName }
  }

  // Default fallback: try Groq first, then OpenAI
  if (process.env.GROQ_API_KEY) {
    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
    })
    const modelName = AI_CONFIG.GROQ_MODEL || process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
    return { model: groq(modelName), provider: "groq", modelName }
  }

  if (process.env.OPENAI_API_KEY) {
    const modelName = AI_CONFIG.OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini"
    return { model: openaiProvider(modelName), provider: "openai", modelName }
  }

  return { error: { code: "not_configured", message: "Neither GROQ_API_KEY nor OPENAI_API_KEY found" } }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[]
    persona?: any
    risk?: { level: "low" | "medium" | "high" }
    financialSummary?: any
    conversationHistory?: any[]
  }

  const sel = selectModel()
  if ("error" in sel) {
    return NextResponse.json(
      { error: sel.error?.message, code: sel.error?.code, provider: AI_CONFIG.FORCE_PROVIDER },
      { status: 400 },
    )
  }

  const history = body.messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")

  // Enhanced system prompt with all three data sources
  const systemParts = [
    "You are a cautious, empathetic banking assistant for BPI (Bank of the Philippine Islands).",
    "You provide personalized financial advice based on the user's profile, transaction history, and conversation context.",

    // Risk assessment
    body.risk?.level === "high"
      ? "IMPORTANT: The user is showing high-risk impulsive behavior. Always recommend a cooling-off period and provide a detailed checklist before any risky financial decisions."
      : body.risk?.level === "medium"
        ? "CAUTION: Provide a brief safety check before financial recommendations."
        : "",

    // Persona integration
    body.persona
      ? `USER PERSONA: Name: ${body.persona.name}, Communication Style: ${body.persona.tonePreference}, Risk Tolerance: ${body.persona.riskAffinity}, Goals: ${(body.persona.goals ?? []).join(", ")}, Preferred Channels: ${(body.persona.contactChannels ?? []).join(", ")}`
      : "",

    // Financial data integration
    body.financialSummary
      ? `FINANCIAL CONTEXT: Monthly Income: ₱${body.financialSummary.totalIncome?.toLocaleString() || "N/A"}, Monthly Expenses: ₱${body.financialSummary.totalExpenses?.toLocaleString() || "N/A"}, Net Position: ₱${body.financialSummary.netWorth?.toLocaleString() || "N/A"}, Top Spending Categories: ${body.financialSummary.topCategories?.map((c: any) => `${c.category} (₱${c.amount?.toLocaleString()})`).join(", ") || "N/A"}`
      : "",

    // Conversation context
    body.conversationHistory && body.conversationHistory.length > 0
      ? `RECENT CONVERSATION CONTEXT: The user has been discussing: ${body.conversationHistory
          .slice(-3)
          .map((m: any) => m.content)
          .join(" | ")}`
      : "",

    "Always provide specific, actionable financial advice tailored to their situation. Use Philippine Peso (₱) for currency references. Be empathetic and match their communication style.",
  ]

  const system = systemParts.filter(Boolean).join("\n\n")

  try {
    const { text } = await generateText({
      model: sel.model,
      system,
      prompt: history,
    })

    const response = {
      text,
      provider: sel.provider,
      model: sel.modelName,
      ...(AI_CONFIG.DEBUG && { config: AI_CONFIG.FORCE_PROVIDER }),
    }

    return NextResponse.json(response)
  } catch (err: any) {
    const msg = String(err?.message ?? "AI error")
    const isQuota =
      err?.statusCode === 429 ||
      err?.code === "insufficient_quota" ||
      msg.includes("insufficient_quota") ||
      msg.toLowerCase().includes("quota")

    if (isQuota) {
      return NextResponse.json(
        { error: "Quota exceeded", code: "insufficient_quota", provider: sel.provider, model: sel.modelName },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: "AI failed", code: "ai_failed", provider: sel.provider, model: sel.modelName },
      { status: 500 },
    )
  }
}
