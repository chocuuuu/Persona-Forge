import { NextResponse } from "next/server"

export async function GET() {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase()
  const openaiConfigured = !!process.env.OPENAI_API_KEY
  const groqConfigured = !!process.env.GROQ_API_KEY

  // Check configuration based on priority: OpenAI first, then Groq
  let configured = false
  let activeProvider = "openai"
  let activeModel = "gpt-4o-mini"

  if (provider === "openai" && openaiConfigured) {
    configured = true
    activeProvider = "openai"
    activeModel = process.env.OPENAI_MODEL || "gpt-4o-mini"
  } else if (provider === "groq" && groqConfigured) {
    configured = true
    activeProvider = "groq"
    activeModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
  } else if (openaiConfigured) {
    // Fallback to OpenAI if available
    configured = true
    activeProvider = "openai"
    activeModel = process.env.OPENAI_MODEL || "gpt-4o-mini"
  } else if (groqConfigured) {
    // Fallback to Groq if available
    configured = true
    activeProvider = "groq"
    activeModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
  }

  return NextResponse.json({
    configured,
    provider: activeProvider,
    model: activeModel,
    fallback: configured && provider !== activeProvider ? `Fell back from ${provider} to ${activeProvider}` : null,
  })
}
