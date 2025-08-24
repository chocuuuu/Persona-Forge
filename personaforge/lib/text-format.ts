// Normalizes LLM/plain text into readable Markdown for chat bubbles.
// Let the Markdown renderer handle spacing.
export function formatAssistantText(input: string): string {
  let t = (input ?? "").trim();

  // Normalize all bullet types.
  t = t.replace(/[•·]/g, "-");

  // Replace any empty lines between list items with a single newline.
  t = t.replace(/(\r?\n)\s*\n+(\s*[-*+]|\s*\d+\.\s)/g, '$1$2');

  return t.trim();
}