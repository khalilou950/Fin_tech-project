import { parse } from 'csv-parse/sync';

// Category auto-detection rules
const categoryKeywords: Record<string, string[]> = {
  Food: ['restaurant', 'grocery', 'supermarket', 'carrefour', 'food', 'eat', 'cafe', 'mcdonalds', 'kfc', 'pizza', 'market'],
  Transport: ['uber', 'taxi', 'bus', 'metro', 'train', 'transport', 'fuel', 'gas', 'parking', 'ride'],
  Entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater', 'entertainment'],
  Shopping: ['amazon', 'store', 'shop', 'mall', 'shopping', 'market', 'clothes', 'fashion'],
  Utilities: ['electricity', 'water', 'gas', 'internet', 'phone', 'utility', 'bill'],
  Bills: ['bill', 'invoice', 'payment', 'subscription', 'service'],
  Health: ['hospital', 'doctor', 'pharmacy', 'medicine', 'clinic', 'health', 'gym', 'fitness'],
  Salary: ['salary', 'paycheck', 'income', 'wage', 'payment'],
  Freelance: ['freelance', 'contract', 'project', 'client'],
};

/**
 * Auto-detect category based on merchant name
 */
export const detectCategory = (merchant: string): string => {
  if (!merchant) return 'Other';

  const lowerMerchant = merchant.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lowerMerchant.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
};

/**
 * Parse CSV content and convert to transaction objects
 */
export const parseCSV = (csvContent: string): Array<{
  merchant: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  date: Date;
}> => {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const transactions = records.map((row: any) => {
      // Handle different CSV formats
      const merchant = row.merchant || row.description || row.name || 'Unknown';
      const amount = parseFloat(row.amount || row.value || 0);
      const type = (row.type || 'expense').toLowerCase();
      const category = row.category || detectCategory(merchant);
      const date = row.date ? new Date(row.date) : new Date();

      return {
        merchant: merchant.trim(),
        amount: Math.abs(amount),
        type: type === 'income' ? 'Income' : 'Expense',
        category: category.trim(),
        date: date,
      };
    });

    return transactions;
  } catch (error: any) {
    throw new Error(`CSV parsing error: ${error.message}`);
  }
};

