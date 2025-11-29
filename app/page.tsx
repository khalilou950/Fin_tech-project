"use client"

import { useState } from "react"
import { mockTransactions, mockBudgets, mockUser, formatCurrency, categoryColors } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

export default function Dashboard() {
  const [budgets, setBudgets] = useState(mockBudgets)

  const totalIncome = mockTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = mockTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const categoryData = Object.entries(
    mockTransactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      ),
  ).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || "#95A5A6",
  }))

  const recentTransactions = [...mockTransactions].reverse().slice(0, 5)

  const overbudgetAlerts = budgets.filter((b) => b.spent > b.limit)

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Welcome back, {mockUser.name}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Balance</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(balance)}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-cyan-400/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Income</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/15 rounded-full flex items-center justify-center flex-shrink-0 border border-green-500/30">
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Expenses</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/15 rounded-full flex items-center justify-center flex-shrink-0 border border-red-500/30">
              <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {overbudgetAlerts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex gap-2 sm:gap-3">
            <AlertCircle className="text-amber-600 dark:text-amber-500 flex-shrink-0" size={18} />
            <div className="min-w-0">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm sm:text-base">Budget Alerts</h3>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 mt-1 break-words">
                {overbudgetAlerts.map((b) => b.category).join(", ")} budgets have been exceeded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Spending by Category */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Status */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Budget Status</h2>
          <div className="space-y-3 sm:space-y-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100
              const isExceeded = budget.spent > budget.limit
              return (
                <div key={budget.id}>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: budget.color }}
                      />
                      <span className="text-xs sm:text-sm font-medium text-foreground truncate">{budget.category}</span>
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${isExceeded ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                    >
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div
                      className={`h-1.5 sm:h-2 rounded-full transition-all shadow-sm ${isExceeded ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-primary to-cyan-400"}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow overflow-x-auto">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-semibold text-foreground">Description</th>
                <th className="text-left py-2 px-2 font-semibold text-foreground">Category</th>
                <th className="text-right py-2 px-2 font-semibold text-foreground whitespace-nowrap">Amount</th>
                <th className="text-left py-2 px-2 font-semibold text-foreground hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-2 px-2 text-foreground truncate">{tx.description}</td>
                  <td className="py-2 px-2">
                    <div
                      className="w-2 h-2 rounded-full inline-block mr-1 align-middle shadow-sm"
                      style={{ backgroundColor: tx.color }}
                    />
                    <span className="text-muted-foreground hidden sm:inline">{tx.category}</span>
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-semibold whitespace-nowrap ${tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground hidden sm:table-cell text-xs sm:text-sm">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
