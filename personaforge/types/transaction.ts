export type TransactionType = "income" | "expense" | "transfer" | "investment"
export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investment_return"
  | "other_income"
  | "food"
  | "transport"
  | "utilities"
  | "entertainment"
  | "healthcare"
  | "shopping"
  | "education"
  | "insurance"
  | "loan_payment"
  | "other_expense"
  | "savings"
  | "investment"
  | "loan"
  | "other_transfer"

export type Transaction = {
  id: string
  userId: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  date: string
  balance?: number
  merchant?: string
  location?: string
  createdAt: string
}

export type FinancialSummary = {
  totalIncome: number
  totalExpenses: number
  netWorth: number
  monthlyAverage: number
  topCategories: { category: TransactionCategory; amount: number }[]
  recentTransactions: Transaction[]
}
