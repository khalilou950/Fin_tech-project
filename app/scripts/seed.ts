import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';

async function seed() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create default user
    const user = await User.create({
      fullName: 'Khalil Fares BENNABI',
      email: 'demo@example.com',
      password: 'Demo123!',
      currency: 'DZD',
      theme: 'light',
    });
    console.log('✅ Created default user:', user.email);

    // Create sample transactions
    const transactions = [
      {
        userId: user._id,
        date: new Date('2024-11-15'),
        merchant: 'Carrefour',
        category: 'Food',
        amount: 5000,
        type: 'Expense',
        currency: 'DZD',
        source: 'manual',
      },
      {
        userId: user._id,
        date: new Date('2024-11-14'),
        merchant: 'Uber',
        category: 'Transport',
        amount: 800,
        type: 'Expense',
        currency: 'DZD',
        source: 'manual',
      },
      {
        userId: user._id,
        date: new Date('2024-11-13'),
        merchant: 'Netflix',
        category: 'Entertainment',
        amount: 1500,
        type: 'Expense',
        currency: 'DZD',
        source: 'manual',
      },
      {
        userId: user._id,
        date: new Date('2024-11-12'),
        merchant: 'Salary',
        category: 'Salary',
        amount: 150000,
        type: 'Income',
        currency: 'DZD',
        source: 'manual',
      },
      {
        userId: user._id,
        date: new Date('2024-11-10'),
        merchant: 'Amazon',
        category: 'Shopping',
        amount: 12000,
        type: 'Expense',
        currency: 'DZD',
        source: 'manual',
      },
      {
        userId: user._id,
        date: new Date('2024-11-08'),
        merchant: 'Restaurant Le Gourmet',
        category: 'Food',
        amount: 3500,
        type: 'Expense',
        currency: 'DZD',
        source: 'manual',
      },
      {
        userId: user._id,
        date: new Date('2024-11-05'),
        merchant: 'Electricity Bill',
        category: 'Bills',
        amount: 2500,
        type: 'Expense',
        currency: 'DZD',
        source: 'manual',
      },
      {
        userId: user._id,
        date: new Date('2024-11-03'),
        merchant: 'Pharmacy',
        category: 'Health',
        amount: 2000,
        type: 'Expense',
        currency: 'DZD',
        source: 'manual',
      },
    ];

    await Transaction.insertMany(transactions);
    console.log(`✅ Created ${transactions.length} transactions`);

    // Create sample budgets
    const budgets = [
      {
        userId: user._id,
        category: 'Food',
        limit: 20000,
        resetCycle: 'monthly',
      },
      {
        userId: user._id,
        category: 'Transport',
        limit: 10000,
        resetCycle: 'monthly',
      },
      {
        userId: user._id,
        category: 'Entertainment',
        limit: 5000,
        resetCycle: 'monthly',
      },
      {
        userId: user._id,
        category: 'Shopping',
        limit: 30000,
        resetCycle: 'monthly',
      },
      {
        userId: user._id,
        category: 'Bills',
        limit: 15000,
        resetCycle: 'monthly',
      },
    ];

    // Recalculate spent for each budget
    for (const budgetData of budgets) {
      const budget = await Budget.create(budgetData);
      await budget.recalculateSpent();
    }

    console.log(`✅ Created ${budgets.length} budgets`);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📝 Default credentials:');
    console.log('   Email: demo@example.com');
    console.log('   Password: Demo123!');
    console.log('\n🚀 You can now start using the application');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
