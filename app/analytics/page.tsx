"use client"

import { useState, useEffect } from "react"
import { categoryColors, formatCurrency } from "@/lib/mock-data"
import { api } from "@/lib/api"
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
  const [data, setData] = useState<{
    spendingByCategory: Record<string, number>
    evolution: { month: string; income: number; expense: number; balance: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.getDashboardAnalytics()
        if (response.success) {
          setData(response.data)
        }
      } catch (error) {
        console.error("Error loading analytics:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-3 sm:p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Chargement des analyses...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-3 sm:p-6 text-center text-muted-foreground">
        Erreur lors du chargement des données.
      </div>
    )
  }

  const categoryData = Object.entries(data.spendingByCategory).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || "#95A5A6",
  }))

  const totalExpense = categoryData.reduce((sum, cat) => sum + cat.value, 0)

  // Format month (YYYY-MM to short month name)
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString("fr-FR", { month: "short" })
  }

  const formattedEvolution = data.evolution.map((item) => ({
    ...item,
    displayMonth: formatMonth(item.month),
  }))

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Aperçu détaillé de vos finances</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Category Breakdown */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Dépenses par catégorie</h2>
          {categoryData.length > 0 ? (
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
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Aucune dépense ce mois-ci
            </div>
          )}
        </div>

        {/* Category Details */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Détails des catégories</h2>
          {categoryData.length > 0 ? (
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
          ) : (
             <div className="h-[100px] flex items-center justify-center text-muted-foreground">
              Aucune donnée
            </div>
          )}
        </div>
      </div>

      {/* Trends */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Évolution Revenus vs Dépenses (Derniers mois)</h2>
        {formattedEvolution.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={formattedEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayMonth" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="income" fill="#2ECC71" name="Revenus" />
              <Bar dataKey="expense" fill="#E74C3C" name="Dépenses" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Aucune donnée historique
          </div>
        )}
      </div>
    </div>
  )
}
