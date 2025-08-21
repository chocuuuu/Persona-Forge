import { NextResponse } from "next/server"

export async function GET() {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase()
  const openaiConfigured = !!process.env.OPENAI_API_KEY
  const groqConfigured = !!process.env.GROQ_API_KEY
  const configured = (provider === "groq" && openaiConfigured) || (provider === "groq" && groqConfigured)

  return NextResponse.json({
    configured,
    provider,
    model:
      provider === "openai"
        ? process.env.GROQ_MODEL || "llama-3.1-70b-versatile"
        : process.env.OPENAI_MODEL || "gpt-4o-mini",
  })
}
