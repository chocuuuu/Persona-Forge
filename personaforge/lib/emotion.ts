export type EmotionResult = {
  label: "euphoric" | "positive" | "neutral" | "concerned" | "stressed"
  score: number // -5..+5
  intensity: number // 1..3
}

const POSITIVE = ["happy", "excited", "great", "awesome", "love", "win", "celebrate", "thrilled"]
const NEGATIVE = ["sad", "worried", "anxious", "scared", "angry", "upset", "nervous", "regret"]
const STRESS = ["overwhelmed", "burnout", "stress", "panic", "tired", "broke", "debt", "late"]

export function analyzeEmotion(text: string): EmotionResult {
  const t = text.toLowerCase()
  let score = 0
  for (const w of POSITIVE) if (t.includes(w)) score += 1
  for (const w of NEGATIVE) if (t.includes(w)) score -= 1
  for (const w of STRESS) if (t.includes(w)) score -= 1

  // intensity cues
  let intensity = 1
  const exclamations = (text.match(/!/g) ?? []).length
  if (exclamations >= 2) intensity++
  if (/[A-Z]{3,}/.test(text)) intensity++

  let label: EmotionResult["label"] = "neutral"
  if (score >= 2 && intensity >= 2) label = "euphoric"
  else if (score > 0) label = "positive"
  else if (score < -1) label = "stressed"
  else if (score < 0) label = "concerned"
  else label = "neutral"

  // clamp score to -5..5
  score = Math.max(-5, Math.min(5, score + (intensity - 1)))
  return { label, score, intensity }
}
