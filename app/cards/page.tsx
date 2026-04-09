'use client';

import { useState, useEffect } from 'react';
import { Card as CardUI } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Plus, CreditCard, TrendingUp, AlertCircle, Trash2, Edit } from 'lucide-react';
import { api } from '@/lib/api';

interface Card {
    _id: string;
    name: string;
    type: 'credit' | 'debit' | 'prepaid';
    totalLimit: number;
    totalSpent: number;
    currency: string;
    resetCycle: string;
    color: string;
    lastFour?: string;
    isActive: boolean;
}

interface Stats {
    total: number;
    active: number;
    totalLimit: number;
    totalSpent: number;
}

const CARD_TYPE_LABELS: Record<string, string> = {
    credit: 'Crédit',
    debit: 'Débit',
    prepaid: 'Prépayée',
};

export default function CardsPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'debit' as 'credit' | 'debit' | 'prepaid',
        totalLimit: '',
        currency: 'DZD',
        resetCycle: 'monthly',
        color: '#3498DB',
        lastFour: '',
    });
    const [editId, setEditId] = useState<string | null>(null);

    const handleEditCard = (card: Card) => {
        setFormData({
            name: card.name,
            type: card.type,
            totalLimit: card.totalLimit.toString(),
            currency: card.currency || 'DZD',
            resetCycle: card.resetCycle || 'monthly',
            color: card.color || '#3498DB',
            lastFour: card.lastFour || '',
        });
        setEditId(card._id);
        setShowModal(true);
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/cards/list');

            if (response.success) {
                setCards(response.data.cards);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
            return;
        }

        try {
            await api.delete(`/api/cards/${id}`);
            fetchCards();
        } catch (error: any) {
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Erreur lors de la suppression de la carte');
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return `${amount.toLocaleString()} DA`;
    };

    const handleCreateCard = async () => {
        if (!formData.name || !formData.totalLimit) {
            alert('Veuillez remplir tous les champs obligatoires');
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
                lastFour: formData.lastFour || undefined,
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
                type: 'debit',
                totalLimit: '',
                currency: 'DZD',
                resetCycle: 'monthly',
                color: '#3498DB',
                lastFour: '',
            });
            fetchCards();
        } catch (error) {
            console.error('Error saving card:', error);
            alert('Erreur lors de la sauvegarde de la carte');
        }
    };

    const getProgress = (card: Card) => {
        return Math.min((card.totalSpent / card.totalLimit) * 100, 100);
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Mes Cartes Bancaires</h1>
                <p className="text-muted-foreground">Gérez vos cartes et suivez vos budgets par carte</p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-muted-foreground">
                    {stats && `${stats.active} carte(s) active(s) sur ${stats.total}`}
                </div>

                <Button className="gap-2" onClick={() => {
                    setEditId(null);
                    setFormData({
                        name: '',
                        type: 'debit',
                        totalLimit: '',
                        currency: 'DZD',
                        resetCycle: 'monthly',
                        color: '#3498DB',
                        lastFour: '',
                    });
                    setShowModal(true);
                }}>
                    <Plus className="h-4 w-4" />
                    Nouvelle Carte
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <CardUI className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Cartes</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </CardUI>

                    <CardUI className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Limite Totale</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.totalLimit)}</p>
                            </div>
                        </div>
                    </CardUI>

                    <CardUI className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Dépensé</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                            </div>
                        </div>
                    </CardUI>
                </div>
            )}

            {/* Cards Grid */}
            {cards.length === 0 ? (
                <CardUI className="p-12 text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Aucune carte bancaire</h3>
                    <p className="text-muted-foreground mb-4">Ajoutez votre première carte pour commencer</p>
                    <Button className="gap-2" onClick={() => setShowModal(true)}>
                        <Plus className="h-4 w-4" />
                        Ajouter une Carte
                    </Button>
                </CardUI>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => {
                        const progress = getProgress(card);
                        const isOverLimit = card.totalSpent > card.totalLimit;

                        return (
                            <div key={card._id} className="relative">
                                {/* Card Visual */}
                                <div
                                    className="rounded-xl p-6 shadow-lg text-white h-48 flex flex-col justify-between relative overflow-hidden"
                                    style={{ backgroundColor: card.color }}
                                >
                                    {/* Card Pattern/Texture */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                                    </div>

                                    {/* Card Header */}
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-5 w-5" />
                                                <span className="text-sm opacity-90">{CARD_TYPE_LABELS[card.type]}</span>
                                            </div>
                                            {!card.isActive && (
                                                <span className="text-xs bg-white/20 px-2 py-1 rounded">Inactive</span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold">{card.name}</h3>
                                    </div>

                                    {/* Card Number */}
                                    <div className="relative z-10">
                                        {card.lastFour && (
                                            <p className="text-sm opacity-75 mb-2">•••• •••• •••• {card.lastFour}</p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs opacity-75">Dépensé</p>
                                                <p className="text-lg font-bold">{formatCurrency(card.totalSpent)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs opacity-75">Limite</p>
                                                <p className="text-lg font-bold">{formatCurrency(card.totalLimit)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3 mb-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${isOverLimit
                                                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                    : 'bg-gradient-to-r from-green-500 to-green-600'
                                                }`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>{Math.round(progress)}% utilisé</span>
                                        <span className={isOverLimit ? 'text-red-600 font-semibold' : ''}>
                                            {formatCurrency(card.totalLimit - card.totalSpent)} restant
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditCard(card)}>
                                        <Edit className="h-4 w-4 mr-1" />
                                        Modifier
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(card._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Card Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <CardUI className="max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6">{editId ? 'Modifier la Carte' : 'Ajouter une Carte Bancaire'}</h2>

                        <div className="space-y-4">
                            {/* Nom de la carte */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Nom de la carte *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Ex: Carte Principale"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Type de carte */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Type de carte</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({ ...formData, type: e.target.value as 'credit' | 'debit' | 'prepaid' })
                                    }
                                >
                                    <option value="debit">Débit</option>
                                    <option value="credit">Crédit</option>
                                    <option value="prepaid">Prépayée</option>
                                </select>
                            </div>

                            {/* Limite totale */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Limite totale (DA) *</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="50000"
                                    value={formData.totalLimit}
                                    onChange={(e) => setFormData({ ...formData, totalLimit: e.target.value })}
                                />
                            </div>

                            {/* Cycle de reset */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Cycle de réinitialisation</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.resetCycle}
                                    onChange={(e) => setFormData({ ...formData, resetCycle: e.target.value })}
                                >
                                    <option value="weekly">Hebdomadaire</option>
                                    <option value="monthly">Mensuel</option>
                                    <option value="yearly">Annuel</option>
                                </select>
                            </div>

                            {/* Couleur */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Couleur de la carte</label>
                                <div className="flex gap-2">
                                    {['#3498DB', '#E74C3C', '#9B59B6', '#2ECC71', '#F39C12', '#1ABC9C', '#34495E'].map((color) => (
                                        <button
                                            key={color}
                                            className={`w-10 h-10 rounded-lg ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                                                }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setFormData({ ...formData, color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Derniers 4 chiffres */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">4 derniers chiffres (optionnel)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="1234"
                                    maxLength={4}
                                    value={formData.lastFour}
                                    onChange={(e) => setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <Button onClick={handleCreateCard} className="flex-1">
                                {editId ? 'Sauvegarder' : 'Créer la Carte'}
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
