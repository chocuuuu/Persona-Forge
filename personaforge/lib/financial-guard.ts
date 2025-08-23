// Financial topic detection and validation
const FINANCIAL_KEYWORDS = [
  // Banking terms
  "bank",
  "banking",
  "account",
  "balance",
  "deposit",
  "withdraw",
  "transfer",
  "atm",
  "savings",
  "checking",
  "loan",
  "credit",
  "debit",
  "card",
  "payment",
  "transaction",

  // Money and currency
  "money",
  "cash",
  "peso",
  "pesos",
  "₱",
  "dollar",
  "currency",
  "amount",
  "cost",
  "price",
  "pay",
  "paid",
  "spend",
  "spending",
  "expense",
  "expenses",
  "income",
  "salary",
  "wage",

  // Financial planning
  "budget",
  "budgeting",
  "save",
  "saving",
  "invest",
  "investment",
  "portfolio",
  "fund",
  "emergency fund",
  "retirement",
  "pension",
  "insurance",
  "financial",
  "finance",

  // Financial products
  "mortgage",
  "home loan",
  "personal loan",
  "auto loan",
  "credit card",
  "time deposit",
  "mutual fund",
  "stocks",
  "bonds",
  "crypto",
  "cryptocurrency",
  "remittance",

  // Financial goals and concerns
  "debt",
  "bills",
  "utilities",
  "rent",
  "tuition",
  "education fund",
  "travel fund",
  "wedding fund",
  "business capital",
  "startup",
  "freelance",
  "side hustle",

  // Financial actions
  "borrow",
  "lend",
  "refinance",
  "consolidate",
  "payoff",
  "interest",
  "rate",
  "apr",
  "fee",
  "charge",
  "penalty",
  "reward",
  "cashback",
  "points",
  "miles",

  // Financial planning concepts
  "goal",
  "goals",
  "plan",
  "planning",
  "strategy",
  "advice",
  "guidance",
  "help",
  "recommend",
  "suggestion",
  "tip",
  "tips",
  "should i",
  "how to",
  "what if",

  // BPI specific
  "bpi",
  "bank of the philippine islands",
  "expressnet",
  "online banking",
  "mobile banking",
]

const NON_FINANCIAL_PATTERNS = [
  // Clearly non-financial topics
  /\b(weather|sports|movies|music|food|recipe|cooking|travel|vacation|health|medical|doctor|hospital)\b/i,
  /\b(politics|government|election|president|mayor|senator)\b/i,
  /\b(technology|programming|coding|software|hardware|computer|phone|app)\b/i,
  /\b(education|school|university|college|teacher|student|homework|exam)\b/i,
  /\b(entertainment|celebrity|actor|actress|singer|artist|game|gaming)\b/i,
  /\b(relationship|dating|marriage|family|friend|love|romance)\b/i,
  /\b(religion|church|prayer|god|jesus|bible|spiritual)\b/i,
  /\b(science|physics|chemistry|biology|math|mathematics|history)\b/i,

  // Greetings and casual conversation (allow these)
  // /\b(hello|hi|hey|good morning|good afternoon|good evening|how are you|thanks|thank you)\b/i,
]

export function isFinancialQuery(text: string): boolean {
  const normalizedText = text.toLowerCase().trim()

  // Allow basic greetings and polite conversation
  const greetingPatterns = [
    /^(hello|hi|hey|good morning|good afternoon|good evening)$/i,
    /^(how are you|thanks|thank you|please|excuse me)$/i,
    /^(yes|no|okay|ok|sure|alright)$/i,
  ]

  if (greetingPatterns.some((pattern) => pattern.test(normalizedText))) {
    return true
  }

  // Check for clearly non-financial topics first
  if (NON_FINANCIAL_PATTERNS.some((pattern) => pattern.test(normalizedText))) {
    return false
  }

  // Check for financial keywords
  const hasFinancialKeywords = FINANCIAL_KEYWORDS.some((keyword) => normalizedText.includes(keyword.toLowerCase()))

  // Additional context clues for financial intent
  const financialContextPatterns = [
    /\b(should i|how to|what if|can i|is it good|is it bad|advice|help|recommend)\b.*\b(money|financial|bank|pay|buy|invest|save|spend|loan|credit)\b/i,
    /\b(money|financial|bank|pay|buy|invest|save|spend|loan|credit)\b.*\b(should i|how to|what if|can i|is it good|is it bad|advice|help|recommend)\b/i,
    /\b\d+\s*(peso|pesos|₱|php|dollars?)\b/i, // Mentions specific amounts
    /\b(monthly|annual|yearly|daily|weekly)\s*(income|expense|payment|budget|saving)\b/i,
  ]

  const hasFinancialContext = financialContextPatterns.some((pattern) => pattern.test(normalizedText))

  return hasFinancialKeywords || hasFinancialContext
}

export function getFinancialRefusalMessage(): string {
  return `I'm PersonaForge AI, your specialized banking and financial assistant. I can only help with banking, finance, and money-related questions.

I can assist you with:
• Banking services and account management
• Financial planning and budgeting
• Investment and savings advice
• Loan and credit guidance
• BPI products and services
• Personal finance strategies

Please ask me about your financial needs, and I'll be happy to provide personalized guidance based on your profile and transaction history.`
}
