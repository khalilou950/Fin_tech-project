import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RecurringTransaction from '@/models/RecurringTransaction';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';

export async function GET(req: Request) {
  try {
    // Basic security for the cron endpoint
    const url = new URL(req.url);
    const cronKey = url.searchParams.get('key');
    
    // In production, matching Vercel's CRON_SECRET or a custom key from env
    if (process.env.CRON_SECRET && cronKey !== process.env.CRON_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const now = new Date();

    // Find all active recurring transactions that are due
    const dueTransactions = await RecurringTransaction.find({
      isActive: true,
      nextDate: { $lte: now },
    });

    if (dueTransactions.length === 0) {
      return NextResponse.json({ success: true, message: 'No recurring transactions due.' });
    }

    let generatedCount = 0;

    // Process each transaction mapping to actual Transaction creations
    for (const recurring of dueTransactions) {
      try {
        // Create the actual transaction
        const newTx = new Transaction({
          userId: recurring.userId,
          date: now,
          merchant: recurring.merchant,
          category: recurring.category,
          amount: recurring.amount,
          type: recurring.type,
          currency: recurring.currency || 'DZD',
          source: 'manual', // or generic custom "cron-automated"
          notes: `[Auto-généré] ${recurring.notes || ''}`.trim()
        });
        
        await newTx.save();

        // Update the 'nextDate' properly based on frequency
        const nextDate = new Date(recurring.nextDate);
        if (recurring.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        else if (recurring.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (recurring.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        else if (recurring.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

        recurring.nextDate = nextDate;
        await recurring.save();

        // Update connected budget if it's an expense
        if (recurring.type === 'Expense') {
            const budget = await Budget.findOne({ userId: recurring.userId, category: recurring.category });
            if (budget) {
                await budget.recalculateSpent();
            }
        }

        generatedCount++;
      } catch (err) {
        console.error(`Failed to process recurring tx ${recurring._id}`, err);
      }
    }

    return NextResponse.json({
      success: true,
      generatedCount,
      message: `Successfully executed ${generatedCount} automated transactions.`
    });

  } catch (error: any) {
    console.error('CRON Error:', error);
    return NextResponse.json({ success: false, message: 'CRON failed' }, { status: 500 });
  }
}
