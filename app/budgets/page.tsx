"use client"

import { useState, useEffect } from "react"
import { categoryColors, formatCurrency } from "@/lib/mock-data"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { useToast } from "@/components/toast"
import { api } from "@/lib/api"

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  color: string
}

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ category: "", limit: "", spent: "" })
  const { addToast } = useToast()

  // Load budgets from API on mount
  useEffect(() => {
    loadBudgets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const response = await api.getBudgets()
      if (response.success && response.data?.budgets) {
        const formattedBudgets = response.data.budgets.map((budget: any) => ({
          id: budget._id || budget.id,
          category: budget.category,
          limit: budget.limit,
          spent: budget.spent || 0,
          color: categoryColors[budget.category] || "#95A5A6",
        }))
        setBudgets(formattedBudgets)
      }
    } catch (error) {
      console.error("Error loading budgets:", error)
      addToast("Failed to load budgets", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.category || !formData.limit) {
      addToast("Please fill in all fields", "error")
      return
    }

    try {
      if (editId) {
        // Update existing budget
        const response = await api.updateBudget(editId, {
          limit: Number.parseFloat(formData.limit),
        })
        
        if (response.success) {
          addToast("Budget updated successfully", "success")
          setEditId(null)
          await loadBudgets() // Reload from API
        } else {
          addToast(response.message || "Failed to update budget", "error")
        }
      } else {
        // Create new budget
        const response = await api.createBudget({
          category: formData.category,
          limit: Number.parseFloat(formData.limit),
        })
        
        if (response.success) {
          addToast("Budget created successfully", "success")
          await loadBudgets() // Reload from API
        } else {
          addToast(response.message || "Failed to create budget", "error")
        }
      }

      setFormData({ category: "", limit: "", spent: "" })
      setShowForm(false)
    } catch (error) {
      console.error("Error saving budget:", error)
      addToast("An error occurred while saving the budget", "error")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await api.deleteBudget(id)
      if (response.success) {
        addToast("Budget deleted successfully", "success")
        await loadBudgets() // Reload from API
      } else {
        addToast(response.message || "Failed to delete budget", "error")
      }
    } catch (error) {
      console.error("Error deleting budget:", error)
      addToast("An error occurred while deleting the budget", "error")
    }
  }

  const handleEdit = (budget: (typeof budgets)[0]) => {
    setEditId(budget.id)
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      spent: budget.spent.toString(),
    })
    setShowForm(true)
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Budgets</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage your spending limits</p>
        </div>
        <button
          onClick={() => {
            setEditId(null)
            setFormData({ category: "", limit: "", spent: "" })
            setShowForm(!showForm)
          }}
          className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Add Budget</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
          <h2 className="font-semibold text-foreground text-sm sm:text-base">
            {editId ? "Edit Budget" : "Create New Budget"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={!!editId}
              className="px-3 py-2 text-sm bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Utilities">Utilities</option>
              <option value="Bills">Bills</option>
              <option value="Health">Health</option>
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Budget Limit"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              className="px-3 py-2 text-sm bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="number"
              placeholder="Amount Spent (auto-calculated)"
              value={formData.spent}
              disabled
              className="px-3 py-2 text-sm bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring opacity-50 cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              {editId ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setEditId(null)
              }}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading budgets...</p>
        </div>
      )}

      {/* Budgets Grid */}
      {!loading && budgets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No budgets found. Create your first budget to get started!</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100
          const isExceeded = budget.spent > budget.limit
          return (
            <div key={budget.id} className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: budget.color }}
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{budget.category}</h3>
                    <p className={`text-xs sm:text-sm font-medium ${isExceeded ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Edit2 size={16} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-1.5 sm:p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <div
                    className={`h-1.5 sm:h-2 transition-all ${isExceeded ? "bg-red-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{Math.round(percentage)}% of budget used</p>
              </div>
            </div>
          )
        })}
        </div>
      )}
    </div>
  )
}
