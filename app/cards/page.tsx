'use client';

import { useState, useEffect } from 'react';
import { Card as CardUI } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Plus, Landmark, Wallet, Coins, TrendingUp, AlertCircle, Trash2, Edit, ShieldCheck, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface Account {
    _id: string;
    name: string;
    type: 'bank' | 'ccp' | 'cash' | 'savings';
    totalLimit: number; // Plafond ou Solde alloué
    totalSpent: number;
    currency: string;
    resetCycle: string;
    color: string;
    institution?: string; // BNA, CPA, BaridiMob, Cash, etc.
    isActive: boolean;
}

interface Stats {
    total: number;
    active: number;
    totalLimit: number;
    totalSpent: number;
}

const ACCOUNT_TYPES: Record<string, { label: string; icon: any; placeholder: string; desc: string }> = {
    bank: {
        label: 'Compte Bancaire (BNA, CPA, BEA...)',
        icon: Landmark,
        placeholder: 'Ex: Compte Courant BNA',
        desc: 'Banque publique ou privée',
    },
    ccp: {
        label: 'Compte CCP / BaridiMob',
        icon: Wallet,
        placeholder: 'Ex: Mon BaridiMob principal',
        desc: 'Poste Algérie / BaridiMob',
    },
    cash: {
        label: 'Espèces / Portefeuille Cash',
        icon: Coins,
        placeholder: 'Ex: Espèces du mois',
        desc: 'Argent liquide pour dépenses quotidiennes',
    },
    savings: {
        label: 'Compte Épargne / Livret',
        icon: TrendingUp,
        placeholder: 'Ex: Livret Épargne',
        desc: 'Fonds de sécurité ou réserve',
    },
};

const SUGGESTED_PRESETS = [
    { name: 'Compte BaridiMob / CCP', type: 'ccp', color: '#F39C12', limit: 80000 },
    { name: 'Compte Courant Bancaire', type: 'bank', color: '#2980B9', limit: 120000 },
    { name: 'Portefeuille Espèces / Cash', type: 'cash', color: '#27AE60', limit: 30000 },
    { name: 'Livret d’Épargne Réserve', type: 'savings', color: '#8E44AD', limit: 200000 },
];

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'ccp' as 'bank' | 'ccp' | 'cash' | 'savings',
        totalLimit: '',
        currency: 'DZD',
        resetCycle: 'monthly',
        color: '#2980B9',
        institution: '',
    });
    const [editId, setEditId] = useState<string | null>(null);

    const handleEditAccount = (acc: Account) => {
        setFormData({
            name: acc.name,
            type: (acc.type as any) || 'bank',
            totalLimit: acc.totalLimit ? acc.totalLimit.toString() : '0',
            currency: acc.currency || 'DZD',
            resetCycle: acc.resetCycle || 'monthly',
            color: acc.color || '#2980B9',
            institution: acc.institution || '',
        });
        setEditId(acc._id);
        setShowModal(true);
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/cards/list');

            if (response.success) {
                // Map existing cards to account models safely
                const mapped = (response.data.cards || []).map((c: any) => {
                    let type = c.type;
                    if (type === 'debit' || type === 'credit') type = 'bank';
                    if (type === 'prepaid') type = 'ccp';
                    return {
                        ...c,
                        type: type || 'bank',
                        institution: c.lastFour ? `Réf: ${c.lastFour}` : ''
                    };
                });
                setAccounts(mapped);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte financier ?')) {
            return;
        }

        try {
            await api.delete(`/api/cards/${id}`);
            fetchAccounts();
        } catch (error: any) {
            alert('Erreur lors de la suppression');
        }
    };

    const formatCurrency = (amount: number) => {
        return `${(amount || 0).toLocaleString()} DZD`;
    };

    const handleSaveAccount = async () => {
        if (!formData.name || !formData.totalLimit) {
            alert('Veuillez renseigner le nom du compte et son plafond / solde mensuel');
            return;
        }

        try {
            const payload = {
                name: formData.name,
                type: formData.type,
                totalLimit: parseFloat(formData.totalLimit),
                currency: formData.currency,
                resetCycle: formData.resetCycle,
                color: formData.color,
                lastFour: formData.institution ? formData.institution.slice(-4) : undefined,
            };

            if (editId) {
                await api.put(`/api/cards/${editId}`, payload);
            } else {
                await api.post('/api/cards/create', payload);
            }

            setShowModal(false);
            setEditId(null);
            setFormData({
                name: '',
                type: 'ccp',
                totalLimit: '',
                currency: 'DZD',
                resetCycle: 'monthly',
                color: '#2980B9',
                institution: '',
            });
            fetchAccounts();
        } catch (error) {
            console.error('Error saving account:', error);
            alert('Erreur lors de la sauvegarde du compte');
        }
    };

    const applyPreset = (preset: typeof SUGGESTED_PRESETS[0]) => {
        setFormData({
            ...formData,
            name: preset.name,
            type: preset.type as any,
            color: preset.color,
            totalLimit: preset.limit.toString(),
        });
    };

    const getProgress = (acc: Account) => {
        if (!acc.totalLimit || acc.totalLimit <= 0) return 0;
        return Math.min(((acc.totalSpent || 0) / acc.totalLimit) * 100, 100);
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">Chargement des comptes...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                        <Landmark className="h-8 w-8 text-primary" />
                        Comptes & Sources de Dépenses
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Centralisez vos comptes (BaridiMob, Banque, Espèces) sans jamais renseigner de coordonnées bancaires sensibles.
                    </p>
                </div>

                <Button
                    className="gap-2 shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    onClick={() => {
                        setEditId(null);
                        setFormData({
                            name: '',
                            type: 'ccp',
                            totalLimit: '',
                            currency: 'DZD',
                            resetCycle: 'monthly',
                            color: '#2980B9',
                            institution: '',
                        });
                        setShowModal(true);
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Nouveau Compte
                </Button>
            </div>

            {/* Privacy & Security Banner */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                    <strong>100% Sécurisé & Sans Risque :</strong> Finovia est un gestionnaire budgétaire. Nous ne demandons <strong>aucun numéro de carte à 16 chiffres, code secret ou CVV</strong>. Vous définissez simplement vos comptes pour suivre vos dépenses.
                </p>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <CardUI className="p-4 bg-card/60 backdrop-blur-sm border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Comptes Actifs</p>
                                <p className="text-xl sm:text-2xl font-bold">{accounts.length}</p>
                            </div>
                        </div>
                    </CardUI>

                    <CardUI className="p-4 bg-card/60 backdrop-blur-sm border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Budget Total Alloué</p>
                                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalLimit)}</p>
                            </div>
                        </div>
                    </CardUI>

                    <CardUI className="p-4 bg-card/60 backdrop-blur-sm border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
                                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Dépenses Enregistrées</p>
                                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                            </div>
                        </div>
                    </CardUI>
                </div>
            )}

            {/* Accounts Grid */}
            {accounts.length === 0 ? (
                <CardUI className="p-10 text-center border-dashed border-2">
                    <Landmark className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-lg font-bold mb-1">Aucun compte financier configuré</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                        Créez vos sources de dépenses (ex: BaridiMob, Cash, BNA) pour voir où part votre argent chaque mois.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {SUGGESTED_PRESETS.map((p, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    applyPreset(p);
                                    setShowModal(true);
                                }}
                                className="text-xs"
                            >
                                + {p.name}
                            </Button>
                        ))}
                    </div>
                    <Button onClick={() => setShowModal(true)}>Créer un Compte</Button>
                </CardUI>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {accounts.map((acc) => {
                        const progress = getProgress(acc);
                        const isOverLimit = acc.totalSpent > acc.totalLimit;
                        const typeInfo = ACCOUNT_TYPES[acc.type] || ACCOUNT_TYPES.bank;
                        const IconComponent = typeInfo.icon;

                        return (
                            <div
                                key={acc._id}
                                className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Bar Card */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                                                style={{ backgroundColor: acc.color }}
                                            >
                                                <IconComponent className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-foreground leading-tight">{acc.name}</h3>
                                                <span className="text-xs text-muted-foreground">{typeInfo.label.split('(')[0]}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleEditAccount(acc)}
                                            >
                                                <Edit className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                onClick={() => handleDelete(acc._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Financial amounts */}
                                    <div className="bg-muted/50 rounded-xl p-3 mb-4 space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Dépensé ce mois</span>
                                            <span>Plafond mensuel</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-lg font-bold text-foreground">
                                                {formatCurrency(acc.totalSpent)}
                                            </span>
                                            <span className="text-sm font-semibold text-muted-foreground">
                                                {formatCurrency(acc.totalLimit)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1 mb-2">
                                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    isOverLimit
                                                        ? 'bg-rose-500'
                                                        : progress > 80
                                                        ? 'bg-amber-500'
                                                        : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground pt-0.5">
                                            <span>{Math.round(progress)}% utilisé</span>
                                            <span className={isOverLimit ? 'text-rose-600 font-bold' : ''}>
                                                {isOverLimit
                                                    ? `Dépassement de ${formatCurrency(acc.totalSpent - acc.totalLimit)}`
                                                    : `Reste ${formatCurrency(acc.totalLimit - acc.totalSpent)}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t text-xs text-muted-foreground flex justify-between items-center">
                                    <span>Cycle : {acc.resetCycle === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}</span>
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                        <Check className="h-3 w-3" /> Actif
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de création / édition de Compte */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <CardUI
                        className="max-w-lg w-full p-6 shadow-2xl bg-card border rounded-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4 border-b pb-3">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Landmark className="h-5 w-5 text-primary" />
                                {editId ? 'Modifier le Compte' : 'Ajouter un Compte Financier'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-muted-foreground hover:text-foreground text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Presets rapides si nouveau compte */}
                        {!editId && (
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                                    Suggestions rapides :
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SUGGESTED_PRESETS.map((p, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => applyPreset(p)}
                                            className="px-2.5 py-1 text-xs rounded-lg border bg-muted/50 hover:bg-muted font-medium transition"
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Type de compte */}
                            <div>
                                <label className="text-xs font-semibold text-foreground mb-1 block">
                                    Catégorie du Compte *
                                </label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            type: e.target.value as any,
                                        })
                                    }
                                >
                                    <option value="ccp">Poste / BaridiMob (CCP)</option>
                                    <option value="bank">Compte Bancaire (BNA, CPA, BEA, Société Générale...)</option>
                                    <option value="cash">Portefeuille Espèces / Liquide</option>
                                    <option value="savings">Compte Épargne / Livret</option>
                                </select>
                            </div>

                            {/* Nom du compte */}
                            <div>
                                <label className="text-xs font-semibold text-foreground mb-1 block">
                                    Nom du Compte *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder={ACCOUNT_TYPES[formData.type]?.placeholder || 'Ex: BaridiMob'}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Plafond / Budget mensuel */}
                            <div>
                                <label className="text-xs font-semibold text-foreground mb-1 block">
                                    Budget / Plafond mensuel prévu (DZD) *
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="50000"
                                    value={formData.totalLimit}
                                    onChange={(e) => setFormData({ ...formData, totalLimit: e.target.value })}
                                />
                                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                                    Indique la limite de dépenses que vous vous fixez pour ce compte par mois.
                                </span>
                            </div>

                            {/* Couleur */}
                            <div>
                                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                                    Couleur d'identification
                                </label>
                                <div className="flex gap-2.5">
                                    {['#2980B9', '#27AE60', '#F39C12', '#8E44AD', '#E74C3C', '#16A085', '#2C3E50'].map(
                                        (color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`w-8 h-8 rounded-full transition-transform ${
                                                    formData.color === color
                                                        ? 'scale-110 ring-2 ring-offset-2 ring-primary'
                                                        : 'hover:scale-105'
                                                }`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setFormData({ ...formData, color })}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6 pt-3 border-t">
                            <Button onClick={handleSaveAccount} className="flex-1 bg-primary text-primary-foreground">
                                {editId ? 'Enregistrer les modifications' : 'Créer le Compte'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Annuler
                            </Button>
                        </div>
                    </CardUI>
                </div>
            )}
        </div>
    );
}
