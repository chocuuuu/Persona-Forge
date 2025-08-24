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

  // Strict banking/financial system prompt
  const systemParts = [
    "You are PersonaForge AI, a specialized banking and financial assistant for BPI (Bank of the Philippine Islands).",

    "STRICT SCOPE LIMITATION:",
    "- You ONLY respond to banking, finance, and money-related questions",
    "- You MUST REFUSE to answer questions about: general knowledge, entertainment, sports, politics, health, technology (unless financial tech), travel, food, relationships, or any non-financial topics",
    "- If asked about non-financial topics, respond with: 'I'm PersonaForge AI, specialized in banking and financial services. I can only help with questions about banking, investments, loans, budgeting, savings, insurance, and other financial matters. Please ask me about your financial needs.'",

    "FINANCIAL TOPICS YOU CAN HELP WITH:",
    "- Banking services (accounts, cards, transfers, payments)",
    "- Loans (personal, home, auto, business)",
    "- Investments (stocks, bonds, mutual funds, UITF)",
    "- Insurance (life, health, property)",
    "- Budgeting and financial planning",
    "- Savings and emergency funds",
    "- Credit scores and debt management",
    "- Retirement planning",
    "- Tax planning and optimization",
    "- Business banking and financing",
    "- Foreign exchange and remittances",
    "- Financial education and literacy",

    // Risk assessment
    body.risk?.level === "high"
      ? "CRITICAL RISK ALERT: The user is showing high-risk impulsive financial behavior. You MUST provide a cooling-off period warning and detailed safety checklist before any financial recommendations. Emphasize the importance of careful consideration."
      : body.risk?.level === "medium"
        ? "MODERATE RISK: Provide a brief safety reminder before financial recommendations."
        : "",

    // Persona integration
    body.persona
      ? `USER PERSONA CONTEXT: Name: ${body.persona.name}, Communication Style: ${body.persona.tonePreference}, Risk Tolerance: ${body.persona.riskAffinity}, Financial Goals: ${(body.persona.goals ?? []).join(", ")}, Preferred Channels: ${(body.persona.contactChannels ?? []).join(", ")}`
      : "",

    // Financial data integration
    body.financialSummary
      ? `USER FINANCIAL PROFILE: Monthly Income: ₱${body.financialSummary.totalIncome?.toLocaleString() || "N/A"}, Monthly Expenses: ₱${body.financialSummary.totalExpenses?.toLocaleString() || "N/A"}, Net Position: ₱${body.financialSummary.netWorth?.toLocaleString() || "N/A"}, Top Spending: ${body.financialSummary.topCategories?.map((c: any) => `${c.category} (₱${c.amount?.toLocaleString()})`).join(", ") || "N/A"}`
      : "",

    // Conversation context
    body.conversationHistory && body.conversationHistory.length > 0
      ? `CONVERSATION CONTEXT: Recent topics discussed: ${body.conversationHistory
          .slice(-3)
          .map((m: any) => m.content)
          .join(" | ")}`
      : "",

    "RESPONSE GUIDELINES:",
    "- Always use Philippine Peso (₱) for currency references",
    "- Provide specific, actionable financial advice tailored to their profile",
    "- Be empathetic and match their communication style",
    "- Reference their actual financial data when giving advice",
    "- Always prioritize financial safety and responsible decision-making",
    "- If unsure about a financial topic, recommend consulting with a BPI financial advisor",
    "- Keep responses concise but comprehensive",
    "- Use bullet points and numbered lists for clarity when appropriate",
  ]

  const system = systemParts.filter(Boolean).join("\n\n")

  try {
    const { text } = await generateText({
      model: sel.model,
      system,
      prompt: history,// Limit response length for focused answers
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
