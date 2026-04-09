import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';
import { authMiddleware } from '@/middleware/auth';

/**
 * Parse un texte vocal en français pour extraire les informations de transaction
 * Supporte différents formats comme:
 * - "j'ai acheté 1L de lait avec 300 da"
 * - "dépense de 500 dinars pour le transport"
 * - "revenu de 20000 da salaire"
 * - "250 da essence"
 */
function parseVoiceInput(text: string, language: string = 'fr-FR') {
    const lowerText = text.toLowerCase().trim();

    // Déterminer le type (Income ou Expense) - Multi-langues
    let type: 'Income' | 'Expense' = 'Expense';
    const incomeKeywords = [
        // Français
        'revenu', 'salaire', 'gagné', 'reçu', 'gain', 'paie',
        // English
        'income', 'salary', 'earned', 'received', 'gain', 'payment', 'revenue',
        // Arabic (transliteration)
        'دخل', 'راتب', 'مكافأة', 'أجر'
    ];
    const expenseKeywords = [
        // Français
        'acheté', 'dépense', 'payé', 'dépensé', 'coûté',
        // English
        'bought', 'spent', 'paid', 'expense', 'cost', 'purchase',
        // Arabic (transliteration)
        'مصروف', 'اشتريت', 'دفعت', 'صرفت'
    ];

    if (incomeKeywords.some(keyword => lowerText.includes(keyword))) {
        type = 'Income';
    } else if (expenseKeywords.some(keyword => lowerText.includes(keyword))) {
        type = 'Expense';
    }

    // Extraire le montant (supports: 300, 300da, 300 da, 300 dinars, etc.)
    const amountPatterns = [
        // Dinar algérien
        /(\d+(?:[.,]\d+)?)\s*(?:da|dinar|dinars|dzd|دينار)/i,
        // Euro
        /(\d+(?:[.,]\d+)?)\s*(?:euro|euros|eur|€)/i,
        // Dollar
        /(\d+(?:[.,]\d+)?)\s*(?:dollar|dollars|usd|\$)/i,
        // Avec prépositions (français)
        /(?:avec|pour|de|à|بـ)\s+(\d+(?:[.,]\d+)?)/i,
        // Avec prépositions (anglais)
        /(?:for|with|of)\s+(\d+(?:[.,]\d+)?)/i,
        // Nombre seul
        /(\d+(?:[.,]\d+)?)/,
    ];

    let amount = 0;
    let currency: 'DZD' | 'EUR' | 'USD' = 'DZD';

    for (const pattern of amountPatterns) {
        const match = lowerText.match(pattern);
        if (match) {
            amount = parseFloat(match[1].replace(',', '.'));

            // Déterminer la devise
            if (match[0].includes('euro') || match[0].includes('eur') || match[0].includes('€')) {
                currency = 'EUR';
            } else if (match[0].includes('dollar') || match[0].includes('usd') || match[0].includes('$')) {
                currency = 'USD';
            }
            break;
        }
    }

    // Extraction de la description/merchant
    let merchant = '';

    // Nettoyer le texte pour extraire le merchant (multi-langues)
    let cleanText = lowerText
        // Français
        .replace(/j'ai|jai/gi, '')
        .replace(/acheté|achete/gi, '')
        .replace(/dépensé|depense/gi, '')
        .replace(/payé|paye/gi, '')
        .replace(/pour|avec|de/gi, '')
        // English 
        .replace(/i bought|bought/gi, '')
        .replace(/i spent|spent/gi, '')
        .replace(/i paid|paid/gi, '')
        .replace(/for|with|of/gi, '')
        // Arabic
        .replace(/اشتريت|دفعت|صرفت/gi, '')
        .replace(/بـ|من|على/gi, '')
        // Montant et devises
        .replace(/\d+(?:[.,]\d+)?\s*(?:da|dinar|dinars|dzd|euro|euros|eur|dollar|dollars|usd|دينار)/gi, '')
        .trim();

    merchant = cleanText || (language === 'ar-SA' ? 'شراء صوتي' : (language === 'en-US' ? 'Voice purchase' : 'Achat vocal'));
    // Capitaliser la première lettre (sauf pour l'arabe)
    if (language !== 'ar-SA') {
        merchant = merchant.charAt(0).toUpperCase() + merchant.slice(1);
    }

    // Déterminer la catégorie basée sur des mots-clés (multi-langues)
    const categoryMap: { [key: string]: string[] } = {
        'Food': [
            // Français
            'lait', 'pain', 'nourriture', 'restaurant', 'café', 'pizza', 'burger', 'sandwich', 'fruit', 'légume', 'viande', 'poulet', 'poisson',
            // English
            'milk', 'bread', 'food', 'restaurant', 'coffee', 'pizza', 'burger', 'sandwich', 'fruit', 'vegetable', 'meat', 'chicken', 'fish',
            // Arabic
            'حليب', 'خبز', 'طعام', 'مطعم', 'قهوة', 'بيتزا', 'فاكهة', 'خضار', 'لحم', 'دجاج', 'سمك'
        ],
        'Transport': [
            // Français
            'essence', 'transport', 'taxi', 'bus', 'métro', 'train', 'voiture', 'carburant',
            // English
            'gasoline', 'gas', 'transport', 'taxi', 'bus', 'metro', 'train', 'car', 'fuel',
            // Arabic
            'وقود', 'نقل', 'تاكسي', 'حافلة', 'مترو', 'قطار', 'سيارة', 'بنزين'
        ],
        'Shopping': [
            // Français
            'vêtement', 'habit', 'chaussure', 'shopping', 'magasin', 'achats',
            // English
            'clothing', 'clothes', 'shoes', 'shopping', 'store', 'purchase',
            // Arabic
            'ملابس', 'أحذية', 'تسوق', 'متجر', 'مشتريات'
        ],
        'Entertainment': [
            // Français
            'cinéma', 'film', 'jeu', 'concert', 'sortie', 'loisir',
            // English
            'cinema', 'movie', 'game', 'concert', 'entertainment', 'leisure',
            // Arabic
            'سينما', 'فيلم', 'لعبة', 'حفلة', 'ترفيه'
        ],
        'Utilities': [
            // Français
            'électricité', 'eau', 'gaz', 'internet', 'téléphone',
            // English
            'electricity', 'water', 'gas', 'internet', 'phone',
            // Arabic
            'كهرباء', 'ماء', 'غاز', 'انترنت', 'هاتف'
        ],
        'Bills': [
            // Français
            'facture', 'loyer', 'assurance',
            // English
            'bill', 'rent', 'insurance',
            // Arabic
            'فاتورة', 'إيجار', 'تأمين'
        ],
        'Health': [
            // Français
            'médecin', 'pharmacie', 'médicament', 'santé', 'docteur',
            // English
            'doctor', 'pharmacy', 'medicine', 'health',
            // Arabic
            'طبيب', 'صيدلية', 'دواء', 'صحة'
        ],
        'Salary': [
            // Français
            'salaire', 'paie',
            // English
            'salary', 'wage', 'paycheck',
            // Arabic
            'راتب', 'أجر'
        ],
        'Freelance': [
            // Français
            'freelance', 'mission', 'contrat',
            // English
            'freelance', 'gig', 'contract',
            // Arabic
            'عمل حر', 'مهمة', 'عقد'
        ],
    };

    let category = 'Other';
    for (const [cat, keywords] of Object.entries(categoryMap)) {
        if (keywords.some((keyword: string) => lowerText.includes(keyword))) {
            category = cat;
            break;
        }
    }

    return {
        amount,
        merchant,
        category,
        type,
        currency,
        date: new Date(),
        source: 'voice' as const,
    };
}

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Not authorized',
                },
                { status: 401 }
            );
        }

        await connectDB();

        const userId = auth.userId;
        const user = await import('@/models/User').then((m) => m.default.findById(userId));

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        const body = await req.json();
        const { voiceText, language } = body;

        if (!voiceText || typeof voiceText !== 'string') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Voice text is required',
                },
                { status: 400 }
            );
        }

        // Parser le texte vocal avec la langue spécifiée
        const parsedData = parseVoiceInput(voiceText, language || 'fr-FR');

        if (parsedData.amount <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Could not extract a valid amount from voice input',
                    parsedData,
                },
                { status: 400 }
            );
        }

        // Créer la transaction
        const transaction = await Transaction.create({
            ...parsedData,
            userId,
            currency: parsedData.currency || user.currency || 'DZD',
        });

        // Update budget spent if it's an expense
        if (transaction.type === 'Expense') {
            const budget = await Budget.findOne({
                userId,
                category: transaction.category,
            });

            if (budget) {
                await budget.recalculateSpent();
            }
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    transaction,
                    parsedData,
                    originalText: voiceText,
                },
                message: 'Transaction created from voice successfully',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create transaction from voice error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Server error',
            },
            { status: 500 }
        );
    }
}
