import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

/**
 * Migration Script: Normalize Transaction Types
 * 
 * This script fixes budget synchronization issues by:
 * 1. Normalizing all transaction types to proper capitalization (Income/Expense)
 * 2. Recalculating all budget spent amounts
 * 3. Adding default values for new fields (tags, notes, attachments)
 */

async function migrateTransactions() {
    try {
        console.log('🔄 Starting transaction migration...\n');

        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pocketguard-ai';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const transactionsCollection = db.collection('transactions');

        // Get all transactions
        const transactions = await transactionsCollection.find({}).toArray();
        console.log(`📊 Found ${transactions.length} transactions to check\n`);

        let updatedCount = 0;
        let alreadyCorrectCount = 0;

        for (const transaction of transactions) {
            const updates = {};
            let needsUpdate = false;

            // Normalize type field
            if (transaction.type) {
                const typeStr = String(transaction.type).toLowerCase();
                let normalizedType = transaction.type;

                if (typeStr === 'income') {
                    normalizedType = 'Income';
                } else if (typeStr === 'expense') {
                    normalizedType = 'Expense';
                }

                if (normalizedType !== transaction.type) {
                    updates.type = normalizedType;
                    needsUpdate = true;
                    console.log(`🔧 Transaction ${transaction._id}: Normalizing type from "${transaction.type}" to "${normalizedType}"`);
                }
            }

            // Add default values for new fields if they don't exist
            if (!transaction.tags) {
                updates.tags = [];
                needsUpdate = true;
            }
            if (!transaction.notes) {
                updates.notes = '';
                needsUpdate = true;
            }
            if (!transaction.attachments) {
                updates.attachments = [];
                needsUpdate = true;
            }

            // Update if needed
            if (needsUpdate) {
                await transactionsCollection.updateOne(
                    { _id: transaction._id },
                    { $set: updates }
                );
                updatedCount++;
            } else {
                alreadyCorrectCount++;
            }
        }

        console.log('\n📈 Transaction Migration Summary:');
        console.log(`   ✅ Updated: ${updatedCount}`);
        console.log(`   ✓  Already correct: ${alreadyCorrectCount}`);
        console.log(`   📊 Total: ${transactions.length}\n`);

        return { updated: updatedCount, total: transactions.length };
    } catch (error) {
        console.error('❌ Error migrating transactions:', error);
        throw error;
    }
}

async function recalculateAllBudgets() {
    try {
        console.log('🔄 Recalculating all budgets...\n');

        const db = mongoose.connection.db;
        const budgetsCollection = db.collection('budgets');
        const transactionsCollection = db.collection('transactions');

        const budgets = await budgetsCollection.find({}).toArray();
        console.log(`📊 Found ${budgets.length} budgets to recalculate\n`);

        for (const budget of budgets) {
            // Calculate date range based on reset cycle
            let startDate = new Date();

            if (budget.resetCycle === 'weekly') {
                const day = startDate.getDay();
                const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
                startDate = new Date(startDate.setDate(diff));
                startDate.setHours(0, 0, 0, 0);
            } else if (budget.resetCycle === 'yearly') {
                startDate = new Date(startDate.getFullYear(), 0, 1);
                startDate.setHours(0, 0, 0, 0);
            } else {
                // Default: monthly
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
            }

            // Aggregate expenses
            const result = await transactionsCollection.aggregate([
                {
                    $match: {
                        userId: budget.userId,
                        category: budget.category,
                        type: 'Expense',
                        date: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' },
                        count: { $sum: 1 },
                    },
                },
            ]).toArray();

            const spent = result.length > 0 ? result[0].total : 0;
            const count = result.length > 0 ? result[0].count : 0;
            const oldSpent = budget.spent || 0;

            // Update budget
            await budgetsCollection.updateOne(
                { _id: budget._id },
                { $set: { spent } }
            );

            console.log(`💰 Budget "${budget.category}" (${budget.resetCycle}): ${oldSpent} DZD → ${spent} DZD (${count} transactions)`);
        }

        console.log('\n✅ All budgets recalculated successfully!\n');
        return budgets.length;
    } catch (error) {
        console.error('❌ Error recalculating budgets:', error);
        throw error;
    }
}

async function runMigration() {
    try {
        console.log('╔════════════════════════════════════════════╗');
        console.log('║  Finovia - Budget Sync Migration Script   ║');
        console.log('╚════════════════════════════════════════════╝\n');

        // Step 1: Migrate transactions
        const transactionResult = await migrateTransactions();

        // Step 2: Recalculate all budgets
        const budgetCount = await recalculateAllBudgets();

        console.log('╔════════════════════════════════════════════╗');
        console.log('║           Migration Completed! ✅           ║');
        console.log('╚════════════════════════════════════════════╝\n');
        console.log(`📊 Summary:`);
        console.log(`   • Transactions checked: ${transactionResult.total}`);
        console.log(`   • Transactions updated: ${transactionResult.updated}`);
        console.log(`   • Budgets recalculated: ${budgetCount}\n`);

        console.log('🎉 Your budgets should now sync correctly with transactions!\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
}

// Run migration
runMigration();
