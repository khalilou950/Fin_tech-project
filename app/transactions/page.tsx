"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { categoryColors, formatCurrency } from "@/lib/mock-data"
import { Upload, Plus, X, Trash2 } from "lucide-react"
import { useToast } from "@/components/toast"
import { api } from "@/lib/api"
import VoiceTransactionInput from "@/components/voice-transaction-input"

interface Transaction {
  _id: string
  merchant: string
  amount: number
  category: string
  type: "Income" | "Expense"
  date: string
  color?: string
}

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping',
  'Utilities', 'Bills', 'Health', 'Salary', 'Freelance', 'Other',
]

const defaultForm = {
  merchant: '',
  amount: '',
  category: 'Other',
  type: 'Expense' as 'Income' | 'Expense',
  date: new Date().toISOString().split('T')[0],
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const { addToast } = useToast()

  // Check for ?new=true in URL to auto-open the form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('new') === 'true') {
      setShowCreateModal(true)
    }
  }, [])

  // Load transactions from API on mount
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    console.log('📋 [TRANSACTIONS] Début du chargement des transactions...');
    try {
      setLoading(true)
      const response = await api.getTransactions()
      console.log('📋 [TRANSACTIONS] Réponse API:', response);

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
        console.log('📋 [TRANSACTIONS] Transactions formatées:', formattedTransactions.length);
        setTransactions(formattedTransactions)
      }
    } catch (error) {
      console.error("📋 [TRANSACTIONS] Error loading transactions:", error)
      addToast("Failed to load transactions", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = async () => {
    setFormError('')
    if (!formData.merchant.trim()) { setFormError('Le marchand / description est obligatoire'); return; }
    if (!formData.amount || parseFloat(formData.amount) <= 0) { setFormError('Le montant doit être supérieur à 0'); return; }

    try {
      setSubmitting(true)
      const payload = {
        merchant: formData.merchant.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        date: new Date(formData.date).toISOString(),
        source: 'manual' as const,
      }
      const response = await api.post('/api/transactions/create', payload)
      if (response.success) {
        addToast('Transaction créée avec succès !', 'success')
        setShowCreateModal(false)
        setFormData(defaultForm)
        await loadTransactions()
      } else {
        setFormError(response.message || 'Erreur lors de la création')
      }
    } catch (error: any) {
      console.error("Error creating transaction:", error)
      setFormError(error?.message || 'Erreur lors de la création de la transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cette transaction ?')) return
    try {
      await api.deleteTransaction(id)
      addToast('Transaction supprimée', 'success')
      await loadTransactions()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      addToast('Erreur lors de la suppression', 'error')
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Consultez et gérez toutes vos transactions</p>
        </div>
        <button
          onClick={() => { setFormData(defaultForm); setFormError(''); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <Plus size={16} />
          Nouvelle Transaction
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Upload className="text-primary" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Importer des Transactions</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Téléchargez un fichier CSV pour importer des transactions</p>
          </div>
          <label className={`px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:opacity-90 transition-opacity text-xs sm:text-sm whitespace-nowrap ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? "Importation..." : "Upload CSV"}
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

      {/* Voice Input Section */}
      <VoiceTransactionInput onTransactionCreated={loadTransactions} />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${filter === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
        >
          Tous
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
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
          <p className="text-muted-foreground">Chargement des transactions...</p>
        </div>
      )}

      {/* Transactions Table */}
      {!loading && (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 overflow-x-auto">
          {sortedFiltered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Aucune transaction trouvée. Ajoutez une transaction ou importez un fichier CSV.</p>
              <button
                onClick={() => { setFormData(defaultForm); setFormError(''); setShowCreateModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium mx-auto"
              >
                <Plus size={16} />
                Ajouter une Transaction
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-semibold text-foreground">Description</th>
                    <th className="text-left py-3 px-2 font-semibold text-foreground hidden sm:table-cell">Catégorie</th>
                    <th className="text-right py-3 px-2 font-semibold text-foreground">Montant</th>
                    <th className="text-left py-3 px-2 font-semibold text-foreground hidden md:table-cell">Type</th>
                    <th className="text-left py-3 px-2 font-semibold text-foreground hidden lg:table-cell">Date</th>
                    <th className="text-center py-3 px-2 font-semibold text-foreground">Action</th>
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
                          className={`px-2 py-1 rounded text-xs font-medium inline-block ${tx.type === "Income"
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100"
                            : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100"
                            }`}
                        >
                          {tx.type === "Income" ? "Revenu" : "Dépense"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell text-xs">{tx.date}</td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(tx._id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Nouvelle Transaction</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              {/* Type Toggle */}
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, type: 'Expense' })}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors border ${formData.type === 'Expense'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'}`}
                  >
                    💸 Dépense
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, type: 'Income' })}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors border ${formData.type === 'Income'
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'}`}
                  >
                    💰 Revenu
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-foreground">Marchand / Description *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ex: Supermarché, Salaire..."
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground">Montant (DA) *</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground">Catégorie</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-foreground">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTransaction}
                disabled={submitting}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.type === 'Income'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-primary hover:opacity-90 text-primary-foreground'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Création...' : 'Créer la Transaction'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
