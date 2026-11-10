import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';
import { authMiddleware } from '@/middleware/auth';

/**
 * Normalise le texte pour gommer les accents, ponctuations et variations phonétiques
 */
function normalizePhoneticText(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprime les accents (é, è, ê -> e)
        .replace(/[،,;:!?\.\(\)\-_]/g, ' ')
        // Normalisation spécifique aux chiffres arabes orientaux (٠١٢٣٤٥٦٧٨٩ -> 0123456789)
        .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
        // Normalisation des lettres arabes souvent permutées à l'oral
        .replace(/[إأآٱ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Parse un texte vocal multi-langues avec support des accents, prononciations régionales et Darija
 */
function parseVoiceInput(text: string, language: string = 'fr-FR') {
    const rawLower = text.toLowerCase().trim();
    const normalizedText = normalizePhoneticText(rawLower);

    // Déterminer le type (Income ou Expense) - Multi-langues + Darija + Phonétique
    let type: 'Income' | 'Expense' = 'Expense';
    const incomeKeywords = [
        // Français (avec/sans accents)
        'revenu', 'salaire', 'gagne', 'recu', 'gain', 'paie', 'virement', 'touche', 'entree',
        // English
        'income', 'salary', 'earned', 'received', 'gain', 'payment', 'revenue', 'deposit', 'paycheck', 'got',
        // Arabe standard & Darija Algérienne
        'دخل', 'راتب', 'مكافاه', 'اجر', 'مدخول', 'خلصة', 'دخلتني', 'دخلني', 'قبضت', 'جاني', 'ربحت', 'فيرمون'
    ];
    const expenseKeywords = [
        // Français
        'achete', 'depense', 'paye', 'coute', 'achat', 'consomme', 'donne', 'regle',
        // English
        'bought', 'spent', 'paid', 'expense', 'cost', 'purchase', 'buy', 'pay',
        // Arabe standard & Darija Algérienne
        'مصروف', 'اشتريت', 'دفعت', 'صرفت', 'شريت', 'خلصت', 'سلكت', 'شريتلي', 'خسرت', 'مديت'
    ];

    if (incomeKeywords.some(keyword => normalizedText.includes(normalizePhoneticText(keyword)))) {
        type = 'Income';
    } else if (expenseKeywords.some(keyword => normalizedText.includes(normalizePhoneticText(keyword)))) {
        type = 'Expense';
    }

    // Convertisseur de nombres écrits en mots (Français, Arabe, Anglais, Darija)
    const wordNumbers: { [key: string]: number } = {
        // Français
        'un': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5, 'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
        'quinze': 15, 'vingt': 20, 'trente': 30, 'quarante': 40, 'cinquante': 50, 'cent': 100, 'mille': 1000,
        // Anglais
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'ten': 10, 'twenty': 20, 'fifty': 50, 'hundred': 100, 'thousand': 1000,
        // Arabe / Darija
        'واحد': 1, 'زوج': 2, 'تلاتة': 3, 'ثلاثة': 3, 'اربعة': 4, 'خمسة': 5, 'عشرة': 10, 'عشرين': 20, 'خمسين': 50, 'مية': 100, 'مئة': 100, 'الف': 1000, 'مليون': 1000000
    };

    // Extraire le montant (supporte: 300, 300da, 300 dinars, 500 دورو (doro -> /20 = 25 DZD), etc.)
    const amountPatterns = [
        // Spécifique Darija: "دورو" ou "doro" (1 DZD = 20 doro)
        /(\d+(?:[.,]\d+)?)\s*(?:doro|دورو|سنتيم|centime|centimes)/i,
        // Dinar algérien
        /(\d+(?:[.,]\d+)?)\s*(?:da|dinar|dinars|dzd|دينار|دج|د\.ج)/i,
        // Euro
        /(\d+(?:[.,]\d+)?)\s*(?:euro|euros|eur|€|اورو|يورو)/i,
        // Dollar
        /(\d+(?:[.,]\d+)?)\s*(?:dollar|dollars|usd|\$|دولار)/i,
        // Avec prépositions multi-langues
        /(?:avec|pour|de|a|for|with|of|بـ|ب|حق|سعر|بقيمة)\s+(\d+(?:[.,]\d+)?)/i,
        // Nombre seul
        /(\d+(?:[.,]\d+)?)/,
    ];

    let amount = 0;
    let currency: 'DZD' | 'EUR' | 'USD' = 'DZD';

    // 1. Recherche par pattern regex
    for (const pattern of amountPatterns) {
        const match = normalizedText.match(pattern);
        if (match) {
            let extracted = parseFloat(match[1].replace(',', '.'));
            const fullMatch = match[0].toLowerCase();

            // Gestion de l'unité populaire algérienne "Centimes" ou "Doro"
            if (fullMatch.includes('doro') || fullMatch.includes('دورو')) {
                // 100 دورو = 5 dinars (divisé par 20)
                extracted = extracted / 20;
            } else if (fullMatch.includes('centime') || fullMatch.includes('سنتيم')) {
                // 10000 centimes = 100 dinars (divisé par 100)
                extracted = extracted / 100;
            }

            amount = extracted;

            // Déterminer la devise
            if (fullMatch.includes('euro') || fullMatch.includes('eur') || fullMatch.includes('€') || fullMatch.includes('اورو') || fullMatch.includes('يورو')) {
                currency = 'EUR';
            } else if (fullMatch.includes('dollar') || fullMatch.includes('usd') || fullMatch.includes('$') || fullMatch.includes('دولار')) {
                currency = 'USD';
            }
            break;
        }
    }

    // 2. Si aucun chiffre n'est trouvé, vérifier les mots de nombres
    if (amount === 0) {
        const tokens = normalizedText.split(' ');
        for (const token of tokens) {
            if (wordNumbers[token]) {
                amount = wordNumbers[token];
                break;
            }
        }
    }

    // Extraction de la description / marchand
    let cleanText = normalizedText
        // Mots d'actions FR
        .replace(/\b(j'ai|jai|achete|depense|paye|pour|avec|de|a|le|la|les|du|des|un|une)\b/gi, '')
        // Mots d'actions EN
        .replace(/\b(i|bought|spent|paid|for|with|of|the|a|an)\b/gi, '')
        // Mots d'actions AR / Darija
        .replace(/\b(اشتريت|دفعت|صرفت|شريت|خلصت|سلكت|مديت|حق|تاع|ديال|بـ|من|على|في)\b/gi, '')
        // Montant et devises
        .replace(/\d+(?:[.,]\d+)?\s*(da|dinar|dinars|dzd|euro|euros|eur|dollar|dollars|usd|دينار|دج|دورو|سنتيم)/gi, '')
        .replace(/\d+/g, '')
        .trim();

    const isArabic = language.startsWith('ar') || /[\u0600-\u06FF]/.test(text);
    const isEnglish = language.startsWith('en');

    let merchant = cleanText || (isArabic ? 'معاملة صوتية' : (isEnglish ? 'Voice transaction' : 'Transaction vocale'));
    if (!isArabic) {
        merchant = merchant.charAt(0).toUpperCase() + merchant.slice(1);
    }

    // Dictionnaire enrichi de catégories avec prononciations et accents divers
    const categoryMap: { [key: string]: string[] } = {
        'Food': [
            // Français
            'lait', 'pain', 'nourriture', 'restaurant', 'cafe', 'pizza', 'burger', 'sandwich', 'fruit', 'legume', 'viande', 'poulet', 'poisson', 'repas', 'supermarche', 'marche', 'eau', 'chocolat', 'patisserie', 'gateau', 'dejeuner', 'diner', 'croissant',
            // English
            'milk', 'bread', 'food', 'restaurant', 'coffee', 'pizza', 'burger', 'sandwich', 'fruit', 'vegetable', 'meat', 'chicken', 'fish', 'meal', 'supermarket', 'market', 'snack', 'water', 'groceries', 'dinner', 'lunch',
            // Arabe / Darija
            'حليب', 'خبز', 'طعام', 'مطعم', 'قهوه', 'بيتزا', 'فاكهه', 'خضار', 'لحم', 'دجاج', 'سمك', 'ماكله', 'كاسكروط', 'شاورما', 'غداء', 'عشاء', 'فطور', 'سوبيرات', 'حوت', 'لبن', 'قاطو'
        ],
        'Transport': [
            // Français
            'essence', 'transport', 'taxi', 'bus', 'metro', 'train', 'voiture', 'carburant', 'gasoil', 'peage', 'parking', 'billet', 'aeroport', 'vol', 'uber', 'yassir', 'coursier',
            // English
            'gasoline', 'gas', 'transport', 'taxi', 'bus', 'metro', 'train', 'car', 'fuel', 'subway', 'flight', 'ticket', 'uber', 'parking',
            // Arabe / Darija
            'وقود', 'نقل', 'تاكسي', 'حافله', 'مترو', 'قطار', 'سياره', 'بنزين', 'مازوت', 'ليسونس', 'كار', 'طياره', 'يسير', 'باركينغ', 'طريق'
        ],
        'Shopping': [
            // Français
            'vetement', 'habit', 'chaussure', 'shopping', 'magasin', 'achats', 'pantalon', 'chemise', 'veste', 'tshirt', 'parfum', 'boutique', 'cadeau', 'montre',
            // English
            'clothing', 'clothes', 'shoes', 'shopping', 'store', 'purchase', 'pants', 'shirt', 'dress', 'jacket', 'perfume', 'mall', 'gift', 'watch',
            // Arabe / Darija
            'ملابس', 'احذيه', 'تسوق', 'متجر', 'مشتريات', 'قش', 'حوايج', 'صباط', 'سروال', 'تريكو', 'فيستة', 'ريحة', 'كادو', 'ساعة'
        ],
        'Entertainment': [
            // Français
            'cinema', 'film', 'jeu', 'concert', 'sortie', 'loisir', 'theatre', 'match', 'stade', 'netflix', 'playstation', 'soiree', 'voyage',
            // English
            'cinema', 'movie', 'game', 'concert', 'entertainment', 'leisure', 'theatre', 'stadium', 'netflix', 'steam', 'party', 'trip',
            // Arabe / Darija
            'سينما', 'فيلم', 'لعبه', 'حفله', 'ترفيه', 'ملعب', 'ماتش', 'سهرة', 'بلايستيشن', 'فرجة', 'تحويسة'
        ],
        'Utilities': [
            // Français
            'electricite', 'eau', 'gaz', 'internet', 'telephone', 'sonelgaz', 'algerie telecom', 'recharge', 'flexy', 'mobilis', 'djezzy', 'ooredoo', 'wifi',
            // English
            'electricity', 'water', 'gas', 'internet', 'phone', 'recharge', 'wifi', 'utility',
            // Arabe / Darija
            'كهرباء', 'ماء', 'غاز', 'انترنت', 'هاتف', 'فليكسي', 'كونكسيون', 'سونلغاز', 'موبيليس', 'جيزي', 'اوريدو', 'تريسينتي'
        ],
        'Bills': [
            // Français
            'facture', 'loyer', 'assurance', 'taxe', 'impot', 'scolarite', 'frais',
            // English
            'bill', 'rent', 'insurance', 'tax', 'fees', 'tuition',
            // Arabe / Darija
            'فاتوره', 'ايجار', 'تامين', 'ضريبه', 'كرى', 'فاكتير', 'لاسيرونس', 'حق الكراء'
        ],
        'Health': [
            // Français
            'medecin', 'pharmacie', 'medicament', 'sante', 'docteur', 'dentiste', 'hopital', 'clinique', 'analyse', 'radio',
            // English
            'doctor', 'pharmacy', 'medicine', 'health', 'dentist', 'hospital', 'clinic', 'pills',
            // Arabe / Darija
            'طبيب', 'صيدليه', 'دواء', 'صحه', 'فرماسي', 'طبيب اسنان', 'سبيطار', 'كلينيك', 'دوا', 'طبيب عيون'
        ],
        'Salary': [
            // Français
            'salaire', 'paie', 'virement', 'prime', 'bonus',
            // English
            'salary', 'wage', 'paycheck', 'bonus',
            // Arabe / Darija
            'راتب', 'اجر', 'خلصة', 'صالير', 'بريم'
        ],
        'Freelance': [
            // Français
            'freelance', 'mission', 'contrat', 'projet', 'prestation', 'client',
            // English
            'freelance', 'gig', 'contract', 'project', 'client',
            // Arabe / Darija
            'عمل حر', 'مهمه', 'عقد', 'خدمة حرة', 'مشروع', 'بريستاسيون'
        ],
    };

    let category = 'Other';
    for (const [cat, keywords] of Object.entries(categoryMap)) {
        if (keywords.some((keyword: string) => normalizedText.includes(normalizePhoneticText(keyword)))) {
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
