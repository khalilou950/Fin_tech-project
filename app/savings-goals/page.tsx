'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Plus, Target, TrendingUp, Calendar, DollarSign, Trash2, Edit, CheckCircle2, X } from 'lucide-react';
import { api } from '@/lib/api';

interface SavingsGoal {
    _id: string;
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    isCompleted: boolean;
    completedAt?: string;
    contributions: Array<{
        date: string;
        amount: number;
        note?: string;
    }>;
    createdAt: string;
}

interface Stats {
    total: number;
    active: number;
    completed: number;
    totalTarget: number;
    totalSaved: number;
}

const CATEGORY_LABELS: Record<string, string> = {
    emergency: '🚨 Urgence',
    vacation: '✈️ Vacances',
    purchase: '🛍️ Achat',
    education: '🎓 Éducation',
    retirement: '👴 Retraite',
    house: '🏠 Maison',
    car: '🚗 Voiture',
    wedding: '💒 Mariage',
    other: '📌 Autre',
};

const PRIORITY_COLORS = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

const defaultForm = {
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'other',
    priority: 'medium' as 'low' | 'medium' | 'high',
};

export default function SavingsGoalsPage() {
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
    const [contributionAmount, setContributionAmount] = useState('');
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchSavingsGoals();
    }, [showActiveOnly]);

    const fetchSavingsGoals = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/savings-goals/list?isCompleted=${!showActiveOnly}`);

            if (response.success) {
                setSavingsGoals(response.data.savingsGoals);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching savings goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async () => {
        setFormError('');
        if (!formData.name.trim()) { setFormError('Le nom est obligatoire'); return; }
        if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) { setFormError('Le montant cible doit être supérieur à 0'); return; }

        try {
            setSubmitting(true);
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                targetAmount: parseFloat(formData.targetAmount),
                currentAmount: parseFloat(formData.currentAmount) || 0,
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
                category: formData.category,
                priority: formData.priority,
            };
            if (editId) {
                const updatePayload = {
                    name: payload.name,
                    description: payload.description,
                    targetAmount: payload.targetAmount,
                    deadline: payload.deadline,
                    category: payload.category,
                    priority: payload.priority,
                };
                const response = await api.put(`/api/savings-goals/${editId}`, updatePayload);
                if (response.success) {
                    setShowCreateModal(false);
                    setEditId(null);
                    setFormData(defaultForm);
                    fetchSavingsGoals();
                } else {
                    setFormError(response.message || 'Erreur lors de la modification');
                }
            } else {
                const response = await api.post('/api/savings-goals/create', payload);
                if (response.success) {
                    setShowCreateModal(false);
                    setFormData(defaultForm);
                    fetchSavingsGoals();
                } else {
                    setFormError(response.message || 'Erreur lors de la création');
                }
            }
        } catch (error: any) {
            console.error('Error creating savings goal:', error);
            setFormError(error?.message || 'Erreur lors de la création de l\'objectif');
        } finally {
            setSubmitting(false);
        }
    };

    const handleContribute = async () => {
        if (!selectedGoal || !contributionAmount || parseFloat(contributionAmount) <= 0) {
            alert('Veuillez entrer un montant valide');
            return;
        }

        try {
            await api.post(`/api/savings-goals/${selectedGoal._id}/contribute`, {
                amount: parseFloat(contributionAmount),
            });

            setShowContributeModal(false);
            setContributionAmount('');
            setSelectedGoal(null);
            fetchSavingsGoals();
        } catch (error) {
            console.error('Error adding contribution:', error);
            alert('Erreur lors de l\'ajout de la contribution');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
            return;
        }

        try {
            await api.delete(`/api/savings-goals/${id}`);
            fetchSavingsGoals();
        } catch (error) {
            console.error('Error deleting savings goal:', error);
        }
    };

    const getProgress = (goal: SavingsGoal) => {
        return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    };

    const getRemainingDays = (deadline?: string) => {
        if (!deadline) return null;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatCurrency = (amount: number) => {
        return `${amount.toLocaleString()} DA`;
    };

    const globalProgress = stats && stats.totalTarget > 0
        ? Math.round((stats.totalSaved / stats.totalTarget) * 100)
        : 0;

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Objectifs d'Épargne</h1>
                <p className="text-muted-foreground">
                    Définissez et suivez vos objectifs financiers
                </p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    <Button
                        variant={showActiveOnly ? 'default' : 'outline'}
                        onClick={() => setShowActiveOnly(true)}
                    >
                        En Cours
                    </Button>
                    <Button
                        variant={!showActiveOnly ? 'default' : 'outline'}
                        onClick={() => setShowActiveOnly(false)}
                    >
                        Tous
                    </Button>
                </div>

                <Button className="gap-2" onClick={() => { setEditId(null); setFormData(defaultForm); setFormError(''); setShowCreateModal(true); }}>
                    <Plus className="h-4 w-4" />
                    Nouvel Objectif
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Objectifs</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">En Cours</p>
                                <p className="text-2xl font-bold">{stats.active}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Complétés</p>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Progression Globale</p>
                                <p className="text-2xl font-bold">
                                    {globalProgress}%
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Savings Goals List */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            ) : savingsGoals.length === 0 ? (
                <Card className="p-12 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Aucun objectif d'épargne</h3>
                    <p className="text-muted-foreground mb-4">
                        Créez votre premier objectif pour commencer à épargner
                    </p>
                    <Button className="gap-2" onClick={() => { setFormData(defaultForm); setFormError(''); setShowCreateModal(true); }}>
                        <Plus className="h-4 w-4" />
                        Créer un Objectif
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {savingsGoals.map((goal) => {
                        const progress = getProgress(goal);
                        const remainingDays = getRemainingDays(goal.deadline);

                        return (
                            <Card key={goal._id} className={`p-6 ${goal.isCompleted ? 'opacity-75' : ''}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg">{goal.name}</h3>
                                            {goal.isCompleted && (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {CATEGORY_LABELS[goal.category] || goal.category}
                                        </p>
                                        {goal.description && (
                                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                                        )}
                                    </div>

                                    <span className={`px-2 py-1 text-xs rounded-full ${PRIORITY_COLORS[goal.priority]}`}>
                                        {goal.priority === 'high' ? 'Haute' : goal.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                                        <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${goal.isCompleted
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                                }`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>{Math.round(progress)}% atteint</span>
                                        <span>{formatCurrency(goal.targetAmount - goal.currentAmount)} restant</span>
                                    </div>
                                </div>

                                {/* Deadline Info */}
                                {goal.deadline && (
                                    <div className="flex items-center gap-2 mb-4 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className={remainingDays !== null && remainingDays < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                                            {remainingDays !== null && remainingDays < 0
                                                ? `En retard de ${Math.abs(remainingDays)} jours`
                                                : remainingDays === 0
                                                    ? "Échéance aujourd'hui"
                                                    : remainingDays === 1
                                                        ? 'Échéance demain'
                                                        : `${remainingDays} jours restants`}
                                        </span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {!goal.isCompleted && (
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => {
                                                setSelectedGoal(goal);
                                                setShowContributeModal(true);
                                            }}
                                        >
                                            <DollarSign className="h-4 w-4 mr-1" />
                                            Contribuer
                                        </Button>
                                    )}

                                    <Button size="sm" variant="outline" onClick={() => {
                                        setEditId(goal._id);
                                        setFormData({
                                            name: goal.name,
                                            description: goal.description || '',
                                            targetAmount: goal.targetAmount.toString(),
                                            currentAmount: goal.currentAmount.toString(),
                                            deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
                                            category: goal.category,
                                            priority: goal.priority,
                                        });
                                        setShowCreateModal(true);
                                    }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(goal._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create Goal Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
                    <Card className="p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">{editId ? 'Modifier l\'Objectif' : 'Nouvel Objectif d\'Épargne'}</h3>
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
                                <label className="text-sm font-medium mb-1 block">Nom de l'objectif *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                    placeholder="Ex: Vacances été 2026"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                    placeholder="Description optionnelle"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Montant Cible (DA) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                        placeholder="100000"
                                        value={formData.targetAmount}
                                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Montant Initial (DA)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50"
                                        placeholder="0"
                                        value={formData.currentAmount}
                                        disabled={!!editId}
                                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Catégorie</label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Priorité</label>
                                    <select
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                    >
                                        <option value="high">🔴 Haute</option>
                                        <option value="medium">🟡 Moyenne</option>
                                        <option value="low">🔵 Basse</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Date Limite</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button onClick={handleCreateGoal} className="flex-1" disabled={submitting}>
                                {submitting ? 'En cours...' : (editId ? 'Sauvegarder' : 'Créer l\'Objectif')}
                            </Button>
                            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                Annuler
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Contribute Modal */}
            {showContributeModal && selectedGoal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowContributeModal(false)}>
                    <Card className="p-6 max-w-md w-full m-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Ajouter une Contribution</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Objectif: {selectedGoal.name}
                        </p>

                        <div className="mb-4">
                            <label className="text-sm font-medium mb-2 block">Montant (DA)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                placeholder="0.00"
                                value={contributionAmount}
                                onChange={(e) => setContributionAmount(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleContribute} className="flex-1">
                                Confirmer
                            </Button>
                            <Button variant="outline" onClick={() => setShowContributeModal(false)}>
                                Annuler
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
