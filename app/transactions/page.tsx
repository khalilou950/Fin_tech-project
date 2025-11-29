"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { categoryColors, formatCurrency } from "@/lib/mock-data"
import { Upload } from "lucide-react"
import { useToast } from "@/components/toast"
import { api } from "@/lib/api"

interface Transaction {
  _id: string
  merchant: string
  amount: number
  category: string
  type: "Income" | "Expense"
  date: string
  color?: string
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)
  const { addToast } = useToast()

  // Load transactions from API on mount
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const response = await api.getTransactions()
      if (response.success && response.data?.transactions) {
        const formattedTransactions = response.data.transactions.map((tx: any) => ({
          _id: tx._id || tx.id,
          merchant: tx.merchant || tx.description || "Unknown",
          amount: tx.amount || 0,
          category: tx.category || "Other",
          type: tx.type || "Expense",
          date: tx.date ? new Date(tx.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          color: categoryColors[tx.category] || "#95A5A6",
        }))
        setTransactions(formattedTransactions)
      }
    } catch (error) {
      console.error("Error loading transactions:", error)
      addToast("Failed to load transactions", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const response = await api.uploadCSV(file)
      
      if (response.success) {
        addToast(response.message || `Successfully imported ${response.data?.count || 0} transactions`, "success")
        // Reload transactions from API
        await loadTransactions()
      } else {
        addToast(response.message || "Failed to import CSV file", "error")
      }
    } catch (error) {
      console.error("Error uploading CSV:", error)
      addToast("An error occurred while uploading the CSV file", "error")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const categories = Array.from(new Set(transactions.map((t) => t.category)))
  const filtered = filter ? transactions.filter((t) => t.category === filter) : transactions
  
  // Sort by date (newest first)
  const sortedFiltered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">View and manage all your transactions</p>
      </div>

      {/* Upload Section */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Upload className="text-primary" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Import Transactions</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Upload a CSV file to import transactions</p>
          </div>
          <label className={`px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:opacity-90 transition-opacity text-xs sm:text-sm whitespace-nowrap ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? "Uploading..." : "Upload CSV"}
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleCSVUpload} 
              disabled={uploading}
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${
            filter === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
              filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColors[cat] || "#95A5A6" }} />
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      )}

      {/* Transactions Table */}
      {!loading && (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 overflow-x-auto">
          {sortedFiltered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found. Import a CSV file to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-semibold text-foreground">Description</th>
                    <th className="text-left py-3 px-2 font-semibold text-foreground hidden sm:table-cell">Category</th>
                    <th className="text-right py-3 px-2 font-semibold text-foreground">Amount</th>
                    <th className="text-left py-3 px-2 font-semibold text-foreground hidden md:table-cell">Type</th>
                    <th className="text-left py-3 px-2 font-semibold text-foreground hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiltered.map((tx) => (
                    <tr key={tx._id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-2 text-foreground truncate">{tx.merchant}</td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.color }} />
                          <span className="text-muted-foreground">{tx.category}</span>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-2 text-right font-semibold ${tx.type === "Income" ? "text-green-600" : "text-foreground"}`}
                      >
                        {tx.type === "Income" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                            tx.type === "Income"
                              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100"
                              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell text-xs">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
