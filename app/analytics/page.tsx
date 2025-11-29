"use client"

import { mockTransactions, categoryColors, formatCurrency } from "@/lib/mock-data"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function Analytics() {
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

  const totalExpense = categoryData.reduce((sum, cat) => sum + cat.value, 0)

  const weeklyData = Array.from({ length: 4 }, (_, i) => ({
    week: `Week ${i + 1}`,
    expense: Math.floor(totalExpense / 4 + Math.random() * 5000),
    income: Math.floor(mockTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0) / 4),
  }))

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Detailed insights into your finances</p>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${((value / totalExpense) * 100).toFixed(1)}%`}
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

        {/* Category Details */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Category Details</h2>
          <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-foreground text-sm sm:text-base truncate">{cat.name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-foreground text-xs sm:text-sm">{formatCurrency(cat.value)}</p>
                  <p className="text-xs text-muted-foreground">{((cat.value / totalExpense) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Income vs Expenses Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="income" fill="#2ECC71" name="Income" />
            <Bar dataKey="expense" fill="#E74C3C" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
