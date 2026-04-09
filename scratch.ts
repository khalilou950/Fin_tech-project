import fs from 'fs';
import { parseCSV } from './lib/csvParser';

const test = () => {
    try {
        const fileContent = fs.readFileSync('./test_transactions.csv', 'utf8');
        const parsed = parseCSV(fileContent);
        console.log("PARSED RECORDS:", parsed.length);
        
        const valid = parsed.map((tx: any) => {
          const validCategories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Bills', 'Health', 'Salary', 'Freelance', 'Other'];
          const category = validCategories.includes(tx.category) ? tx.category : 'Other';
          const type = tx.type === 'Income' || tx.type === 'Expense' ? tx.type : 'Expense';
          const amount = isNaN(tx.amount) || tx.amount <= 0 ? 0 : tx.amount;
          const date = tx.date instanceof Date && !isNaN(tx.date.getTime()) ? tx.date : new Date();
          
          return {
            merchant: String(tx.merchant).trim() || 'Unknown',
            amount,
            type,
            category,
            date,
          };
        }).filter((tx: any) => tx.merchant && tx.merchant !== 'Unknown' && tx.amount > 0);

        console.log("VALID RECORDS:", valid.length);
    } catch (e: any) {
        console.error("ERROR:", e.message);
    }
}
test();
