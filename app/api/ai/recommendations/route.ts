import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';
import { authMiddleware } from '@/middleware/auth';
// Removed generative-ai import to bypass nextjs resolution issues

export async function GET(req: NextRequest) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();
        const userId = auth.userId;

        // Fetch User Data for context
        const user = await import('@/models/User').then((m) => m.default.findById(userId));
        
        // Fetch budgets
        const budgets = await Budget.find({ userId });
        
        // Fetch the last 30 days of transactions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentTransactions = await Transaction.find({ 
            userId, 
            date: { $gte: thirtyDaysAgo } 
        }).sort({ date: -1 });

        // Calculate totals
        const totalIncome = recentTransactions
            .filter(t => t.type === 'Income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = recentTransactions
            .filter(t => t.type === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const categorySpending = recentTransactions
            .filter(t => t.type === 'Expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const budgetsInfo = budgets.map(b => ({
            category: b.category,
            limit: b.limit,
            spent: b.spent,
            status: b.spent > b.limit ? 'Over budget' : (b.spent / b.limit > 0.8 ? 'Near limit' : 'Good')
        }));

        let recommendations = [];

        const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (apiKey) {
            // Utiliser l'API HTTPS native de Gemini au lieu du package npm
            try {
                const prompt = `
Vous êtes un expert financier IA.
Générez 3 recommandations courtes, précises et actionnables pour un utilisateur basé sur ses dépenses récentes.
Répondez UNIQUEMENT sous forme de tableau JSON strict. Ne rajoutez pas de texte avant ou après. 
Format attendu :
[
  { "title": "Titre court", "description": "Astuce ou analyse précise", "icon": "trending-down" ou "alert-triangle" ou "check-circle", "type": "warning" ou "success" ou "info" }
]

Données financières de l'utilisateur (30 derniers jours) :
- Devise : ${user?.currency || 'DZD'}
- Revenus totaux : ${totalIncome}
- Dépenses totales : ${totalExpense}
- Dépenses par catégorie : ${JSON.stringify(categorySpending)}
- État des budgets fixés : ${JSON.stringify(budgetsInfo)}

Soyez constructif, encourageant, et pointez exactement là où il peut épargner de l'argent.
                `;

                const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json();
                    const responseText = aiData.candidates[0].content.parts[0].text;
                    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        recommendations = JSON.parse(jsonMatch[0]);
                    }
                }
            } catch (aiError) {
                console.error("Gemini AI Erreur HTTPS:", aiError);
            }
        }

        // Fallback Algorithmique si pas de clé API ou erreur IA
        if (recommendations.length === 0) {
            if (totalExpense > totalIncome * 0.8 && totalIncome > 0) {
                 recommendations.push({
                    title: "Risque de découvert",
                    description: "Vos dépenses représentent plus de 80% de vos revenus ce mois-ci. Réduisez les achats superflus.",
                    icon: "alert-triangle",
                    type: "warning"
                 });
            } else if (totalIncome > totalExpense && totalExpense > 0) {
                 recommendations.push({
                    title: "Bonne gestion constatée",
                    description: `Vous avez un rythme sain. Vous pourriez transférer ${(totalIncome - totalExpense) * 0.2} dans vos objectifs d'épargne.`,
                    icon: "check-circle",
                    type: "success"
                 });
            } else if (totalExpense === 0) {
                recommendations.push({
                    title: "Commencez le suivi",
                    description: "Ajoutez quelques dépenses pour que je puisse analyser vos habitudes.",
                    icon: "info",
                    type: "info"
                });
            }

            // Budget analysis fallback
            const overBudgets = budgetsInfo.filter(b => b.status === 'Over budget');
            if (overBudgets.length > 0) {
                recommendations.push({
                    title: "Dépassement de budget",
                    description: `Vous avez dépassé votre limite pour la catégorie ${overBudgets[0].category}. Essayez de limiter ces achats.`,
                    icon: "trending-down",
                    type: "warning"
                });
            } else {
                 const nearBudgets = budgetsInfo.filter(b => b.status === 'Near limit');
                 if (nearBudgets.length > 0) {
                     recommendations.push({
                         title: "Attention aux limites",
                         description: `Votre budget ${nearBudgets[0].category} est presque atteint. Souhaitez-vous le revoir à la hausse ?`,
                         icon: "info",
                         type: "info"
                     });
                 }
            }
        }
        
        // Make sure we have at least 1 item
        if (recommendations.length === 0) {
             recommendations.push({
                 title: "Analyse en cours",
                 description: "Continuez à utiliser Finovia. Des recommandations apparaîtront ici d'ici quelques jours.",
                 icon: "info",
                 type: "info"
             });
        }

        return NextResponse.json({
            success: true,
            data: recommendations
        });

    } catch (error: any) {
        console.error('AI Recommendations error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Server error' },
            { status: 500 }
        );
    }
}
