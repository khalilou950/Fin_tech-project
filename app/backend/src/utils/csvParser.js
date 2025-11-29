import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';

// Category auto-detection rules
const categoryKeywords = {
  Food: ['restaurant', 'grocery', 'supermarket', 'carrefour', 'food', 'eat', 'cafe', 'mcdonalds', 'kfc', 'pizza'],
  Transport: ['uber', 'taxi', 'bus', 'metro', 'train', 'transport', 'fuel', 'gas', 'parking'],
  Entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater', 'entertainment'],
  Shopping: ['amazon', 'store', 'shop', 'mall', 'shopping', 'market', 'clothes', 'fashion'],
  Utilities: ['electricity', 'water', 'gas', 'internet', 'phone', 'utility', 'bill'],
  Health: ['hospital', 'doctor', 'pharmacy', 'medicine', 'clinic', 'health', 'gym', 'fitness'],
  Salary: ['salary', 'paycheck', 'income', 'wage'],
  Freelance: ['freelance', 'contract', 'project', 'client'],
};

/**
 * Auto-detect category based on merchant name
 */
export const detectCategory = (merchant) => {
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
 * Parse CSV file and convert to transaction objects
 */
export const parseCSV = async (filePath) => {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const transactions = records.map((row) => {
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
  } catch (error) {
    throw new Error(`CSV parsing error: ${error.message}`);
  }
};

