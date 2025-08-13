"use client"

import type { Persona } from "@/types/persona"
import { analyzeEmotion } from "./emotion"

const STORE_KEY = "pf_personas"
const SESSION_KEY = "pf_session_persona_id"

export function getLocalPersonas(): Persona[] {
  const raw = localStorage.getItem(STORE_KEY)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw) as Persona[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function saveLocalPersonas(arr: Persona[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(arr))
}

export function saveLocalPersona(p: Persona) {
  const all = getLocalPersonas()
  const idx = all.findIndex((x) => x.id === p.id)
  if (idx >= 0) {
    all[idx] = p
  } else {
    all.push(p)
  }
  saveLocalPersonas(all)
}

export function getLocalPersonaById(id: string): Persona | null {
  return getLocalPersonas().find((p) => p.id === id) ?? null
}

export function getOrCreateSessionPersonaId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = `local-${Date.now()}`
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function createPersonaFromFirstMessage(firstMessage: string): Persona {
  const id = getOrCreateSessionPersonaId()
  const emotion = analyzeEmotion(firstMessage)
  const now = new Date().toISOString()

  // naive mapping from emotion to risk/tone
  const riskAffinity: Persona["riskAffinity"] =
    emotion.label === "euphoric" ? "conservative" : emotion.label === "stressed" ? "moderate" : "balanced"

  const persona: Persona = {
    id,
    name: "You",
    summary:
      "Persona created from conversation. Evolves with your interactions to personalize guidance and channel choices.",
    status: "active",
    riskAffinity,
    tonePreference: emotion.label,
    contactChannels: ["app push", "email"],
    goals: ["responsible finance", "avoid impulsive debt", "optimize cashflow"],
    createdAt: now,
    updatedAt: now,
  }

  saveLocalPersona(persona)
  return persona
}
