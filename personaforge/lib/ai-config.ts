// AI Provider Configuration
// Change this to switch between providers easily
export const AI_CONFIG = {
  // Set to 'groq' or 'openai' to force a specific provider
  // Set to 'auto' to use the smart fallback logic
  FORCE_PROVIDER: "openai" as "groq" | "openai" | "auto",

  // Model overrides (optional)
  GROQ_MODEL: "llama-3.3-70b-versatile", // or 'llama-3.1-8b-instant' for speed
  OPENAI_MODEL: "gpt-4o-mini", // or 'gpt-4o' for better quality

  // Debug mode - shows provider info in chat
  DEBUG: true,
}

// Quick presets for common scenarios
export const AI_PRESETS = {
  GROQ_FAST: { FORCE_PROVIDER: "groq" as const, GROQ_MODEL: "llama-3.1-8b-instant" },
  GROQ_SMART: { FORCE_PROVIDER: "groq" as const, GROQ_MODEL: "llama-3.3-70b-versatile" },
  OPENAI_CHEAP: { FORCE_PROVIDER: "openai" as const, OPENAI_MODEL: "gpt-4o-mini" },
  OPENAI_PREMIUM: { FORCE_PROVIDER: "openai" as const, OPENAI_MODEL: "gpt-4o" },
  AUTO_FALLBACK: { FORCE_PROVIDER: "auto" as const },
}

// Uncomment one of these to use a preset:
// Object.assign(AI_CONFIG, AI_PRESETS.GROQ_FAST)
// Object.assign(AI_CONFIG, AI_PRESETS.OPENAI_CHEAP)
