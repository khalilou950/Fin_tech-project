'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Target, Repeat, Calendar, DollarSign, CreditCard, Plus, Sparkles, CheckCircle, Info } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { convertCurrency, formatCurrencyDisplay } from '@/lib/currencyConverter';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';

const categoryColors: Record<string, string> = {
  Food: '#E74C3C',
  Transport: '#3498DB',
  Entertainment: '#9B59B6',
  Shopping: '#E67E22',
  Utilities: '#1ABC9C',
  Bills: '#F39C12',
  Health: '#27AE60',
  Salary: '#2ECC71',
  Freelance: '#16A085',
  Other: '#95A5A6',
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recurringStats, setRecurringStats] = useState<any>(null);
  const [savingsStats, setSavingsStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAiRecommendations();
  }, []);

  const fetchAiRecommendations = async () => {
    try {
      setLoadingAi(true);
      const res = await api.get('/api/ai/recommendations');
      if (res.data && Array.isArray(res.data)) {
         setAiRecommendations(res.data);
      }
    } catch (error) {
      console.error('Erreur IA:', error);
    } finally {
      setLoadingAi(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [transactionsRes, budgetsRes, recurringRes, savingsRes, cardsRes, userRes] = await Promise.all([
        api.getTransactions({ limit: 100 }).catch(() => ({ data: { transactions: [] } })),
        api.getBudgets().catch(() => ({ data: { budgets: [] } })),
        api.get('/api/recurring-transactions/list?isActive=true').catch(() => ({ data: { savingsGoals: [], stats: null } })),
        api.get('/api/savings-goals/list?isCompleted=false').catch(() => ({ data: { savingsGoals: [], stats: null } })),
        api.get('/api/cards/list').catch(() => ({ data: { cards: [] } })),
        api.getMe().catch(() => ({ data: null })),
      ]);

      setTransactions(transactionsRes.data?.transactions || []);
      setBudgets(budgetsRes.data?.budgets || []);
      setRecurringStats(recurringRes.data || null);
      setSavingsStats(savingsRes.data?.stats || null);
      setCards(cardsRes.data?.cards || []);
      setUserProfile(userRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userCurrency = userProfile?.currency || 'DZD';

  const formatCurrency = (amount: number) => {
    return formatCurrencyDisplay(amount, userCurrency);
  };

  // Calculate financial stats with Currency Conversion Support
  const totalIncome = transactions.filter((t) => t.type === 'Income').reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'DZD', userCurrency), 0);
  const totalExpense = transactions.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + convertCurrency(t.amount, t.currency || 'DZD', userCurrency), 0);

  // Balance calculated from cards (Total Limit - Total Spent)
  const balance = cards.length > 0
    ? cards.reduce((sum, card) => sum + (card.totalLimit - card.totalSpent), 0)
    : totalIncome - totalExpense; // Fallback to transaction calc if no cards

  // Category breakdown with currency normalization
  const categoryData = Object.entries(
    transactions
      .filter((t) => t.type === 'Expense')
      .reduce(
        (acc, t) => {
          const catAmount = convertCurrency(t.amount, t.currency || 'DZD', userCurrency);
          acc[t.category] = (acc[t.category] || 0) + catAmount;
          return acc;
        },
        {} as Record<string, number>
      )
  ).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || '#95A5A6',
  }));

  // Recent transactions
  const recentTransactions = [...transactions].reverse().slice(0, 5);

  // Budget alerts
  const overbudgetAlerts = budgets.filter((b) => b.spent > b.limit);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Vue d'ensemble de vos finances</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Solde Total</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(balance)}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-cyan-400/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <DollarSign className="text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Revenus</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/15 rounded-full flex items-center justify-center flex-shrink-0 border border-green-500/30">
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Dépenses</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(totalExpense)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/15 rounded-full flex items-center justify-center flex-shrink-0 border border-red-500/30">
              <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
        </div>

        <Link href="/savings-goals" className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Objectifs d'Épargne</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {savingsStats ? savingsStats.active : 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {savingsStats && savingsStats.totalTarget > 0
                  ? `${Math.round((savingsStats.totalSaved / savingsStats.totalTarget) * 100)}% complété`
                  : 'Aucun objectif'}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/15 rounded-full flex items-center justify-center flex-shrink-0 border border-purple-500/30">
              <Target className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Actions Rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/transactions?new=true">
            <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Plus className="h-6 w-6" />
              <span>Transaction</span>
            </Button>
          </Link>

          <Link href="/recurring-transactions">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Repeat className="h-6 w-6 text-blue-600" />
              <span>Récurrente</span>
            </Button>
          </Link>

          <Link href="/savings-goals">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20">
              <Target className="h-6 w-6 text-green-600" />
              <span>Objectif</span>
            </Button>
          </Link>

          <Link href="/cards">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20">
              <CreditCard className="h-6 w-6 text-purple-600" />
              <span>Ajouter Carte</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* New Features Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/recurring-transactions"
          className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Repeat className="text-blue-600 dark:text-blue-400" size={24} />
                <h3 className="font-semibold text-lg">Transactions Récurrentes</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Gérez vos revenus et dépenses automatiques
              </p>
              {recurringStats && (
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Actives: </span>
                    <span className="font-semibold">{recurringStats.data?.savingsGoals?.filter((g: any) => g.isActive).length || 0}</span>
                  </div>
                </div>
              )}
            </div>
            <Calendar className="text-blue-400" size={32} />
          </div>
        </Link>

        <Link
          href="/savings-goals"
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-purple-600 dark:text-purple-400" size={24} />
                <h3 className="font-semibold text-lg">Objectifs d'Épargne</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Suivez vos objectifs financiers</p>
              {savingsStats && (
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Actifs: </span>
                    <span className="font-semibold">{savingsStats.active}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Complétés: </span>
                    <span className="font-semibold text-green-600">{savingsStats.completed}</span>
                  </div>
                </div>
              )}
            </div>
            <DollarSign className="text-purple-400" size={32} />
          </div>
        </Link>
      </div>

      {/* Alerts */}
      {overbudgetAlerts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex gap-2 sm:gap-3">
            <AlertCircle className="text-amber-600 dark:text-amber-500 flex-shrink-0" size={18} />
            <div className="min-w-0">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm sm:text-base">
                Alertes de Budget
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 mt-1 break-words">
                {overbudgetAlerts.map((b) => b.category).join(', ')} ont dépassé leurs limites.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Recommendations */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-indigo-600 dark:text-indigo-400" size={24} />
          <h2 className="text-lg sm:text-xl font-bold text-indigo-900 dark:text-indigo-100">Assistant IA Finovia</h2>
        </div>
        
        {loadingAi ? (
          <div className="flex space-x-2 animate-pulse py-4">
            <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
            <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
            <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
            <span className="text-sm text-indigo-600/70 ml-2">Génération des recommandations en cours...</span>
          </div>
        ) : aiRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiRecommendations.map((rec, idx) => {
              const bgColors = {
                 warning: 'bg-amber-100/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50',
                 success: 'bg-green-100/50 border-green-200 dark:bg-green-900/20 dark:border-green-700/50',
                 info: 'bg-blue-100/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50'
              };
              const iconColors = {
                 warning: 'text-amber-600 dark:text-amber-400',
                 success: 'text-green-600 dark:text-green-400',
                 info: 'text-blue-600 dark:text-blue-400'
              };
              
              const getIcon = (iconName: string, type: 'warning' | 'success' | 'info') => {
                 const className = iconColors[type] || iconColors.info;
                 switch(iconName) {
                    case 'trending-down': return <TrendingDown className={className} size={20} />;
                    case 'alert-triangle': return <AlertCircle className={className} size={20} />;
                    case 'check-circle': return <CheckCircle className={className} size={20} />;
                    default: return <Info className={className} size={20} />;
                 }
              };

              return (
                <div key={idx} className={`p-4 rounded-lg border ${bgColors[rec.type as 'warning'|'success'|'info'] || bgColors.info} flex items-start gap-3`}>
                   <div className="mt-1 flex-shrink-0">
                      {getIcon(rec.icon, rec.type)}
                   </div>
                   <div>
                      <h4 className="font-semibold text-sm mb-1 text-foreground">{rec.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{rec.description}</p>
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-indigo-600 dark:text-indigo-400">Aucune nouvelle recommandation pour le moment.</p>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Spending by Category */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Dépenses par Catégorie</h2>
          {categoryData.length > 0 ? (
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
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">Aucune dépense enregistrée</p>
          )}
        </div>

        {/* Budget Status */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Statut des Budgets</h2>
          <div className="space-y-3 sm:space-y-4">
            {budgets.length > 0 ? (
              budgets.map((budget) => {
                const percentage = (budget.spent / budget.limit) * 100;
                const isExceeded = budget.spent > budget.limit;
                return (
                  <div key={budget._id}>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: categoryColors[budget.category] || '#95A5A6' }}
                        />
                        <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {budget.category}
                        </span>
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${isExceeded ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}
                      >
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div
                        className={`h-1.5 sm:h-2 rounded-full transition-all shadow-sm ${isExceeded
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : 'bg-gradient-to-r from-primary to-cyan-400'
                          }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun budget configuré</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow overflow-x-auto">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Transactions Récentes</h2>
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          {recentTransactions.length > 0 ? (
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-semibold text-foreground">Marchand</th>
                  <th className="text-left py-2 px-2 font-semibold text-foreground">Catégorie</th>
                  <th className="text-right py-2 px-2 font-semibold text-foreground whitespace-nowrap">Montant</th>
                  <th className="text-left py-2 px-2 font-semibold text-foreground hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-2 px-2 text-foreground truncate">{tx.merchant}</td>
                    <td className="py-2 px-2">
                      <div
                        className="w-2 h-2 rounded-full inline-block mr-1 align-middle shadow-sm"
                        style={{ backgroundColor: categoryColors[tx.category] || '#95A5A6' }}
                      />
                      <span className="text-muted-foreground hidden sm:inline">{tx.category}</span>
                    </td>
                    <td
                      className={`py-2 px-2 text-right font-semibold whitespace-nowrap ${tx.type === 'Income' ? 'text-green-600 dark:text-green-400' : 'text-foreground'
                        }`}
                    >
                      {tx.type === 'Income' ? '+' : '-'}
                      {formatCurrencyDisplay(tx.amount, tx.currency || 'DZD')}
                    </td>
                    <td className="py-2 px-2 text-muted-foreground hidden sm:table-cell text-xs sm:text-sm">
                      {new Date(tx.date).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune transaction récente</p>
          )}
        </div>
      </div>
    </div>
  );
}
