'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Plus, Calendar, DollarSign, Repeat, Play, Pause, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';

interface RecurringTransaction {
    _id: string;
    merchant: string;
    category: string;
    amount: number;
    type: 'Income' | 'Expense';
    currency: string;
    frequency: string;
    nextOccurrence: string;
    isActive: boolean;
    autoGenerate: boolean;
    tags?: string[];
    notes?: string;
}

const FREQUENCY_LABELS: Record<string, string> = {
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    biweekly: 'Bimensuel',
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    yearly: 'Annuel',
};

const CATEGORIES = [
    'Food', 'Transport', 'Entertainment', 'Shopping',
    'Utilities', 'Bills', 'Health', 'Salary', 'Freelance', 'Other',
];

const defaultForm = {
    merchant: '',
    category: 'Other',
    amount: '',
    type: 'Expense' as 'Income' | 'Expense',
    currency: 'DZD',
    frequency: 'monthly',
    nextOccurrence: new Date().toISOString().split('T')[0],
    autoGenerate: true,
    notes: '',
};

export default function RecurringTransactionsPage() {
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchRecurringTransactions();
    }, [showActiveOnly]);

    const fetchRecurringTransactions = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/recurring-transactions/list?isActive=${showActiveOnly}`);

            if (response.data.success) {
                setRecurringTransactions(response.data.data.recurringTransactions);
            }
        } catch (error) {
            console.error('Error fetching recurring transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setFormError('');
        if (!formData.merchant.trim()) { setFormError('Le nom / marchand est obligatoire'); return; }
        if (!formData.amount || parseFloat(formData.amount) <= 0) { setFormError('Le montant doit être supérieur à 0'); return; }

        try {
            setSubmitting(true);
            const payload = {
                merchant: formData.merchant.trim(),
                category: formData.category,
                amount: parseFloat(formData.amount),
                type: formData.type,
                currency: formData.currency,
                frequency: formData.frequency,
                startDate: new Date(formData.nextOccurrence).toISOString(),
                autoGenerate: formData.autoGenerate,
                notes: formData.notes.trim() || undefined,
            };
            const response = await api.post('/api/recurring-transactions/create', payload);
            if (response.success) {
                setShowCreateModal(false);
                setFormData(defaultForm);
                fetchRecurringTransactions();
            } else {
                setFormError(response.message || 'Erreur lors de la création');
            }
        } catch (error: any) {
            console.error('Error creating recurring transaction:', error);
            setFormError(error?.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/api/recurring-transactions/${id}`, {
                isActive: !currentStatus,
            });
            fetchRecurringTransactions();
        } catch (error) {
            console.error('Error toggling recurring transaction:', error);
        }
    };

    const handleGenerateNow = async (id: string) => {
        try {
            await api.post(`/api/recurring-transactions/${id}/generate`, {});
            alert('Transaction générée avec succès !');
            fetchRecurringTransactions();
        } catch (error) {
            console.error('Error generating transaction:', error);
            alert('Erreur lors de la génération de la transaction');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction récurrente ?')) {
            return;
        }

        try {
            await api.delete(`/api/recurring-transactions/${id}`);
            fetchRecurringTransactions();
        } catch (error) {
            console.error('Error deleting recurring transaction:', error);
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        if (currency === 'DZD') return `${amount.toLocaleString()} DA`;
        if (currency === 'EUR') return `€${amount.toLocaleString()}`;
        if (currency === 'USD') return `$${amount.toLocaleString()}`;
        return `${amount.toLocaleString()} ${currency}`;
    };

    const formatNextOccurrence = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'En retard';
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Demain';
        if (diffDays <= 7) return `Dans ${diffDays} jours`;

        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Transactions Récurrentes</h1>
                <p className="text-muted-foreground">
                    Gérez vos revenus et dépenses automatiques (salaires, abonnements, loyers, etc.)
                </p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    <Button
                        variant={showActiveOnly ? 'default' : 'outline'}
                        onClick={() => setShowActiveOnly(true)}
                    >
                        Actives
                    </Button>
                    <Button
                        variant={!showActiveOnly ? 'default' : 'outline'}
                        onClick={() => setShowActiveOnly(false)}
                    >
                        Toutes
                    </Button>
                </div>

                <Button className="gap-2" onClick={() => { setFormData(defaultForm); setFormError(''); setShowCreateModal(true); }}>
                    <Plus className="h-4 w-4" />
                    Nouvelle Transaction Récurrente
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Repeat className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Actives</p>
                            <p className="text-2xl font-bold">
                                {recurringTransactions.filter(rt => rt.isActive).length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Revenus Mensuels</p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(
                                    recurringTransactions
                                        .filter(rt => rt.type === 'Income' && rt.isActive && rt.frequency === 'monthly')
                                        .reduce((sum, rt) => sum + rt.amount, 0),
                                    'DZD'
                                )}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                            <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Dépenses Mensuelles</p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(
                                    recurringTransactions
                                        .filter(rt => rt.type === 'Expense' && rt.isActive && rt.frequency === 'monthly')
                                        .reduce((sum, rt) => sum + rt.amount, 0),
                                    'DZD'
                                )}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recurring Transactions List */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            ) : recurringTransactions.length === 0 ? (
                <Card className="p-12 text-center">
                    <Repeat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Aucune transaction récurrente</h3>
                    <p className="text-muted-foreground mb-4">
                        Créez votre première transaction récurrente pour automatiser vos finances
                    </p>
                    <Button className="gap-2" onClick={() => { setFormData(defaultForm); setFormError(''); setShowCreateModal(true); }}>
                        <Plus className="h-4 w-4" />
                        Créer une Transaction Récurrente
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {recurringTransactions.map((rt) => (
                        <Card key={rt._id} className={`p-4 ${!rt.isActive ? 'opacity-60' : ''}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${rt.type === 'Income'
                                            ? 'bg-green-100 dark:bg-green-900'
                                            : 'bg-red-100 dark:bg-red-900'
                                            }`}>
                                            <DollarSign className={`h-5 w-5 ${rt.type === 'Income'
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{rt.merchant}</h3>
                                            <p className="text-sm text-muted-foreground">{rt.category}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mt-3">
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <span className={`font-semibold ${rt.type === 'Income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {rt.type === 'Income' ? '+' : '-'}{formatCurrency(rt.amount, rt.currency)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Repeat className="h-4 w-4" />
                                            <span>{FREQUENCY_LABELS[rt.frequency] || rt.frequency}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Prochaine: {formatNextOccurrence(rt.nextOccurrence)}</span>
                                        </div>
                                    </div>

                                    {rt.notes && (
                                        <p className="text-sm text-muted-foreground mt-2">{rt.notes}</p>
                                    )}

                                    {rt.tags && rt.tags.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {rt.tags.map((tag, idx) => (
                                                <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 ml-4">
                                    {rt.isActive && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleGenerateNow(rt._id)}
                                            title="Générer maintenant"
                                        >
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleToggleActive(rt._id, rt.isActive)}
                                        title={rt.isActive ? 'Désactiver' : 'Activer'}
                                    >
                                        {rt.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(rt._id)}
                                        className="text-red-600 hover:bg-red-50"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
                    <Card className="p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Nouvelle Transaction Récurrente</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                {formError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Nom / Marchand *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                    placeholder="Ex: Netflix, Loyer, Salaire..."
                                    value={formData.merchant}
                                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Type *</label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Income' | 'Expense' })}
                                    >
                                        <option value="Expense">💸 Dépense</option>
                                        <option value="Income">💰 Revenu</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Catégorie</label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Montant (DA) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                        placeholder="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Devise</label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="DZD">DZD (DA)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Fréquence</label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                        value={formData.frequency}
                                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    >
                                        {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Prochaine Occurrence</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                        value={formData.nextOccurrence}
                                        onChange={(e) => setFormData({ ...formData, nextOccurrence: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Notes</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                    placeholder="Notes optionnelles..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="autoGenerate"
                                    checked={formData.autoGenerate}
                                    onChange={(e) => setFormData({ ...formData, autoGenerate: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="autoGenerate" className="text-sm">
                                    Générer automatiquement les transactions
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button onClick={handleCreate} className="flex-1" disabled={submitting}>
                                {submitting ? 'Création...' : 'Créer la Transaction'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                Annuler
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
