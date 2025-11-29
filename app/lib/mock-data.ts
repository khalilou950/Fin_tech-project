export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  type: "income" | "expense"
  date: string
  color?: string
}

export interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  color: string
}

export interface User {
  id: string
  name: string
  email: string
  currency: "USD" | "DZD"
  password?: string
}

export const categoryColors: Record<string, string> = {
  Food: "#FF6B6B",
  Transport: "#4ECDC4",
  Entertainment: "#45B7D1",
  Shopping: "#FFA07A",
  Utilities: "#98D8C8",
  Health: "#F7DC6F",
  Salary: "#2ECC71",
  Freelance: "#3498DB",
}

// Initialize demo user on first load
if (typeof window !== "undefined") {
  const existingUsers = localStorage.getItem("users")
  if (!existingUsers) {
    const demoUser = {
      id: "demo-1",
      name: "Demo User",
      email: "demo@example.com",
      password: "Demo123!",
    }
    localStorage.setItem("users", JSON.stringify([demoUser]))
  }
}

export const mockUser: User = {
  id: "1",
  name: "Khalil Fares BENNABI",
  email: "ahmed@example.com",
  currency: "DZD",
}

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Grocery Shopping",
    amount: 8500,
    category: "Food",
    type: "expense",
    date: "2024-01-15",
    color: categoryColors["Food"],
  },
  {
    id: "2",
    description: "Monthly Salary",
    amount: 150000,
    category: "Salary",
    type: "income",
    date: "2024-01-01",
    color: categoryColors["Salary"],
  },
  {
    id: "3",
    description: "Uber Ride",
    amount: 2500,
    category: "Transport",
    type: "expense",
    date: "2024-01-14",
    color: categoryColors["Transport"],
  },
  {
    id: "4",
    description: "Movie Tickets",
    amount: 3000,
    category: "Entertainment",
    type: "expense",
    date: "2024-01-13",
    color: categoryColors["Entertainment"],
  },
  {
    id: "5",
    description: "Shopping Online",
    amount: 12000,
    category: "Shopping",
    type: "expense",
    date: "2024-01-12",
    color: categoryColors["Shopping"],
  },
  {
    id: "6",
    description: "Electricity Bill",
    amount: 4500,
    category: "Utilities",
    type: "expense",
    date: "2024-01-11",
    color: categoryColors["Utilities"],
  },
  {
    id: "7",
    description: "Doctor Visit",
    amount: 3500,
    category: "Health",
    type: "expense",
    date: "2024-01-10",
    color: categoryColors["Health"],
  },
  {
    id: "8",
    description: "Freelance Project",
    amount: 25000,
    category: "Freelance",
    type: "income",
    date: "2024-01-09",
    color: categoryColors["Freelance"],
  },
]

export const mockBudgets: Budget[] = [
  { id: "1", category: "Food", limit: 30000, spent: 18500, color: categoryColors["Food"] },
  { id: "2", category: "Transport", limit: 15000, spent: 8500, color: categoryColors["Transport"] },
  { id: "3", category: "Entertainment", limit: 20000, spent: 9000, color: categoryColors["Entertainment"] },
  { id: "4", category: "Shopping", limit: 40000, spent: 22000, color: categoryColors["Shopping"] },
  { id: "5", category: "Utilities", limit: 12000, spent: 8500, color: categoryColors["Utilities"] },
]

export const getCategoryColor = (category: string): string => {
  return categoryColors[category] || "#95A5A6"
}

export const formatCurrency = (amount: number, currency = "DZD"): string => {
  if (currency === "DZD") {
    return `${amount.toLocaleString("fr-DZ")} دج`
  }
  return `$${amount.toLocaleString("en-US")}`
}
