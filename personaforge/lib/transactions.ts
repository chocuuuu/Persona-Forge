"use client"

import type { Transaction, FinancialSummary, TransactionCategory } from "@/types/transaction"

const TRANSACTIONS_KEY = "pf_transactions"

// Mock transaction data for demo
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-1",
    userId: "demo-user-1",
    type: "income",
    category: "salary",
    amount: 5000,
    description: "Monthly Salary",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    balance: 15000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "txn-2",
    userId: "demo-user-1",
    type: "expense",
    category: "food",
    amount: -150,
    description: "Grocery Shopping",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    merchant: "SM Supermarket",
    balance: 14850,
    createdAt: new Date().toISOString(),
  },
  {
    id: "txn-3",
    userId: "demo-user-1",
    type: "expense",
    category: "transport",
    amount: -50,
    description: "Grab rides",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    balance: 14800,
    createdAt: new Date().toISOString(),
  },
  {
    id: "txn-4",
    userId: "demo-user-1",
    type: "expense",
    category: "utilities",
    amount: -200,
    description: "Electricity Bill",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    balance: 14600,
    createdAt: new Date().toISOString(),
  },
]

export function getUserTransactions(userId: string): Transaction[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY)
    if (!raw) {
      // Initialize with mock data for demo user
      if (userId === "demo-user-1") {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(MOCK_TRANSACTIONS))
        return MOCK_TRANSACTIONS
      }
      return []
    }

    const allTransactions = JSON.parse(raw) as Transaction[]
    return allTransactions.filter((t) => t.userId === userId)
  } catch {
    return []
  }
}

export function addTransaction(transaction: Transaction) {
  if (typeof window === "undefined") return

  const allTransactions = getAllTransactions()
  allTransactions.push(transaction)
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions))
}

function getAllTransactions(): Transaction[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getFinancialSummary(userId: string): FinancialSummary {
  const transactions = getUserTransactions(userId)
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const recentTransactions = transactions
    .filter((t) => new Date(t.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalIncome = recentTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = Math.abs(
    recentTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
  )

  const netWorth = totalIncome - totalExpenses

  // Calculate top spending categories
  const categoryTotals = new Map<TransactionCategory, number>()
  recentTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const current = categoryTotals.get(t.category) || 0
      categoryTotals.set(t.category, current + Math.abs(t.amount))
    })

  const topCategories = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return {
    totalIncome,
    totalExpenses,
    netWorth,
    monthlyAverage: totalExpenses / 1, // Last 30 days
    topCategories,
    recentTransactions: recentTransactions.slice(0, 10),
  }
}
