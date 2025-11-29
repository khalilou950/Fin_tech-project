import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

dotenv.config();

const categoryColors = {
  Food: '#FF6B6B',
  Transport: '#4ECDC4',
  Entertainment: '#45B7D1',
  Shopping: '#FFA07A',
  Utilities: '#98D8C8',
  Health: '#F7DC6F',
  Salary: '#2ECC71',
  Freelance: '#3498DB',
};

// Sample data
const sampleTransactions = [
  {
    merchant: 'Carrefour',
    category: 'Food',
    amount: 8500,
    type: 'Expense',
    date: new Date('2024-01-15'),
  },
  {
    merchant: 'Monthly Salary',
    category: 'Salary',
    amount: 150000,
    type: 'Income',
    date: new Date('2024-01-01'),
  },
  {
    merchant: 'Uber',
    category: 'Transport',
    amount: 2500,
    type: 'Expense',
    date: new Date('2024-01-14'),
  },
  {
    merchant: 'Movie Tickets',
    category: 'Entertainment',
    amount: 3000,
    type: 'Expense',
    date: new Date('2024-01-13'),
  },
  {
    merchant: 'Online Shopping',
    category: 'Shopping',
    amount: 12000,
    type: 'Expense',
    date: new Date('2024-01-12'),
  },
  {
    merchant: 'Electricity Bill',
    category: 'Utilities',
    amount: 4500,
    type: 'Expense',
    date: new Date('2024-01-11'),
  },
  {
    merchant: 'Doctor Visit',
    category: 'Health',
    amount: 3500,
    type: 'Expense',
    date: new Date('2024-01-10'),
  },
  {
    merchant: 'Freelance Project',
    category: 'Freelance',
    amount: 25000,
    type: 'Income',
    date: new Date('2024-01-09'),
  },
  {
    merchant: 'Restaurant',
    category: 'Food',
    amount: 5500,
    type: 'Expense',
    date: new Date('2024-01-08'),
  },
  {
    merchant: 'Gas Station',
    category: 'Transport',
    amount: 6000,
    type: 'Expense',
    date: new Date('2024-01-07'),
  },
];

const sampleBudgets = [
  { category: 'Food', limit: 30000, resetCycle: 'monthly' },
  { category: 'Transport', limit: 15000, resetCycle: 'monthly' },
  { category: 'Entertainment', limit: 20000, resetCycle: 'monthly' },
  { category: 'Shopping', limit: 40000, resetCycle: 'monthly' },
  { category: 'Utilities', limit: 12000, resetCycle: 'monthly' },
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🗑️  Clearing existing data...');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});

    console.log('✅ Database cleared');

    // Create default user
    console.log('👤 Creating default user...');
    const defaultUser = await User.create({
      fullName: 'Khalil Fares BENNABI',
      email: 'demo@example.com',
      password: 'Demo123!',
      currency: 'DZD',
      theme: 'light',
    });

    console.log('✅ Default user created:', defaultUser.email);

    // Create transactions
    console.log('💸 Creating transactions...');
    const transactions = await Transaction.insertMany(
      sampleTransactions.map((tx) => ({
        ...tx,
        userId: defaultUser._id,
        currency: defaultUser.currency,
        source: 'manual',
      }))
    );

    console.log(`✅ Created ${transactions.length} transactions`);

    // Calculate spent amounts for budgets
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Create budgets with calculated spent
    console.log('📊 Creating budgets...');
    const budgets = [];

    for (const budgetData of sampleBudgets) {
      const expenses = await Transaction.aggregate([
        {
          $match: {
            userId: defaultUser._id,
            category: budgetData.category,
            type: 'Expense',
            date: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const spent = expenses.length > 0 ? expenses[0].total : 0;

      const budget = await Budget.create({
        ...budgetData,
        userId: defaultUser._id,
        spent,
      });

      budgets.push(budget);
    }

    console.log(`✅ Created ${budgets.length} budgets`);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📝 Default credentials:');
    console.log('   Email: demo@example.com');
    console.log('   Password: Demo123!');
    console.log('\n🚀 You can now start using the API');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;

