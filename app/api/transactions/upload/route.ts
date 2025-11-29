import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';
import { parseCSV } from '@/lib/csvParser';
import { authMiddleware, getUserIdFromRequest } from '@/middleware/auth';
import mongoose from 'mongoose';

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
    // Convert userId to ObjectId if it's a string
    const userIdObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    const User = await import('@/models/User').then((m) => m.default);
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get('csv') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'CSV file is required',
        },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    console.log('CSV file received, size:', fileContent.length, 'bytes');

    // Parse CSV
    let parsedTransactions;
    try {
      parsedTransactions = parseCSV(fileContent);
      console.log(`Parsed ${parsedTransactions.length} transactions from CSV`);
    } catch (parseError: any) {
      console.error('CSV parsing failed:', parseError);
      return NextResponse.json(
        {
          success: false,
          message: parseError.message || 'Failed to parse CSV file',
        },
        { status: 400 }
      );
    }

    if (parsedTransactions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No transactions found in CSV file',
        },
        { status: 400 }
      );
    }

    // Validate and prepare transactions
    const transactionsToInsert = parsedTransactions.map((tx) => {
      // Validate category
      const validCategories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Bills', 'Health', 'Salary', 'Freelance', 'Other'];
      const category = validCategories.includes(tx.category) ? tx.category : 'Other';
      
      // Validate type
      const type = tx.type === 'Income' || tx.type === 'Expense' ? tx.type : 'Expense';
      
      // Validate amount
      const amount = isNaN(tx.amount) || tx.amount <= 0 ? 0 : tx.amount;
      
      // Validate date
      const date = tx.date instanceof Date && !isNaN(tx.date.getTime()) ? tx.date : new Date();
      
      return {
        merchant: String(tx.merchant).trim() || 'Unknown',
        amount: amount,
        type: type,
        category: category,
        date: date,
        userId: userIdObjectId,
        currency: user.currency || 'DZD',
        source: 'csv' as const,
      };
    }).filter((tx) => {
      // Filter out invalid transactions
      return tx.merchant && tx.merchant !== 'Unknown' && tx.amount > 0;
    });

    if (transactionsToInsert.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid transactions to insert',
        },
        { status: 400 }
      );
    }

    console.log(`Prepared ${transactionsToInsert.length} valid transactions for insertion`);
    console.log('Sample transaction:', JSON.stringify(transactionsToInsert[0], null, 2));

    // Create transactions
    let transactions;
    try {
      transactions = await Transaction.insertMany(transactionsToInsert, { ordered: false });
      console.log(`Successfully inserted ${transactions.length} transactions`);
    } catch (insertError: any) {
      console.error('Transaction insertion failed:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      
      // If some transactions were inserted, return partial success
      if (insertError.insertedDocs && insertError.insertedDocs.length > 0) {
        return NextResponse.json(
          {
            success: true,
            data: {
              transactions: insertError.insertedDocs,
              count: insertError.insertedDocs.length,
            },
            message: `Partially imported ${insertError.insertedDocs.length} transactions. Some transactions failed to import.`,
            warning: insertError.message,
          },
          { status: 207 } // 207 Multi-Status
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          message: insertError.message || 'Failed to save transactions',
          error: insertError.name,
        },
        { status: 500 }
      );
    }

    // Update all affected budgets
    const expenseTransactions = transactions.filter((tx) => tx.type === 'Expense');
    const categories = [...new Set(expenseTransactions.map((tx) => tx.category))];

    console.log(`Updating budgets for categories: ${categories.join(', ')}`);
    
    for (const category of categories) {
      try {
        const budget = await Budget.findOne({ userId: userIdObjectId, category });
        if (budget) {
          console.log(`Recalculating spent for budget: ${category}`);
          await budget.recalculateSpent();
          console.log(`Budget ${category} updated - spent: ${budget.spent}`);
        } else {
          console.log(`No budget found for category: ${category}`);
        }
      } catch (budgetError: any) {
        console.error(`Error updating budget for category ${category}:`, budgetError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          transactions,
          count: transactions.length,
        },
        message: `Successfully imported ${transactions.length} transactions`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

