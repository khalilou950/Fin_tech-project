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
 * Simple CSV parser without external dependencies
 */
function parseCSVSimple(csvContent: string): Array<Record<string, string>> {
  // Normalize line endings
  const normalizedContent = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  // Parse header - handle different delimiters (comma, semicolon, tab)
  const headerLine = lines[0];
  let delimiter = ',';
  if (headerLine.includes(';') && !headerLine.includes(',')) {
    delimiter = ';';
  } else if (headerLine.includes('\t')) {
    delimiter = '\t';
  }
  
  const headers = headerLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));

  // Parse data rows
  const records: Array<Record<string, string>> = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles quoted fields)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    // Detect delimiter for this line
    let lineDelimiter = delimiter;
    if (line.includes(';') && !line.includes(',')) {
      lineDelimiter = ';';
    } else if (line.includes('\t')) {
      lineDelimiter = '\t';
    }

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === lineDelimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add last value

    // Create record object
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (values[index] || '').replace(/^"|"$/g, '').trim();
    });
    
    records.push(record);
  }

  return records;
}

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
    const records = parseCSVSimple(csvContent);

    if (records.length === 0) {
      throw new Error('No data found in CSV file');
    }

    const transactions = records.map((row: Record<string, string>) => {
      // Handle different CSV formats - case insensitive
      const getValue = (keys: string[]): string => {
        for (const key of keys) {
          // Try exact match first
          if (row[key]) return row[key];
          // Try case insensitive match
          const lowerKey = key.toLowerCase();
          for (const rowKey of Object.keys(row)) {
            if (rowKey.toLowerCase() === lowerKey) {
              return row[rowKey];
            }
          }
        }
        return '';
      };

      const merchant = getValue(['merchant', 'description', 'name', 'Merchant', 'Description', 'Name']) || 'Unknown';
      
      // Parse amount - handle different formats
      let amountStr = getValue(['amount', 'value', 'Amount', 'Value', 'montant', 'Montant']) || '0';
      // Remove currency symbols, spaces, and convert comma to dot
      if (typeof amountStr === 'string') {
        amountStr = amountStr
          .replace(/[€$£¥₹,]/g, '') // Remove currency symbols and commas
          .replace(/\s+/g, '') // Remove spaces
          .replace(/,/g, '.') // Convert comma to dot for decimal
          .trim();
      }
      const amount = parseFloat(amountStr) || 0;

      // Determine type
      const typeStr = (getValue(['type', 'Type']) || 'expense').toLowerCase();
      const type = typeStr === 'income' || typeStr === 'in' || typeStr === 'credit' || typeStr === 'revenu' ? 'Income' : 'Expense';

      // Get category
      const category = getValue(['category', 'Category', 'categorie', 'Categorie']) || detectCategory(merchant);

      // Parse date
      let date = new Date();
      const dateStr = getValue(['date', 'Date']);
      if (dateStr) {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate;
        }
      }

      return {
        merchant: String(merchant).trim(),
        amount: Math.abs(amount),
        type: type,
        category: String(category).trim(),
        date: date,
      };
    }).filter((tx) => {
      // Filter out invalid transactions
      return tx.merchant && tx.merchant !== 'Unknown' && tx.amount > 0;
    });

    if (transactions.length === 0) {
      throw new Error('No valid transactions found in CSV file');
    }

    return transactions;
  } catch (error: any) {
    console.error('CSV parsing error:', error);
    throw new Error(`CSV parsing error: ${error.message}`);
  }
};
