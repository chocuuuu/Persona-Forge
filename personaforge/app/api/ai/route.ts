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
  }

  const sel = selectModel()
  if ("error" in sel) {
    return NextResponse.json(
      { error: sel.error?.message, code: sel.error?.code, provider: AI_CONFIG.FORCE_PROVIDER },
      { status: 400 },
    )
  }

  const history = body.messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")
  const system = [
    "You are a cautious, empathetic banking assistant.",
    body.risk?.level === "high"
      ? "Always recommend a cooling-off period and checklist before any risky recommendation."
      : body.risk?.level === "medium"
        ? "Provide a short caution before recommendations."
        : "",
    body.persona
      ? `Persona hints: tone=${body.persona.tonePreference}, risk=${body.persona.riskAffinity}, goals=${(
          body.persona.goals ?? []
        ).join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n")

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
