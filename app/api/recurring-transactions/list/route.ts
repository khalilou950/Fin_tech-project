import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RecurringTransaction from '@/models/RecurringTransaction';
import { authMiddleware } from '@/middleware/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const isActive = searchParams.get('isActive');

        const filter: any = { userId: auth.userId };
        if (isActive !== null) {
            filter.isActive = isActive === 'true';
        }

        const recurringTransactions = await RecurringTransaction.find(filter).sort({ nextOccurrence: 1, createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: {
                recurringTransactions,
                count: recurringTransactions.length,
            },
        });
    } catch (error: any) {
        console.error('Get recurring transactions error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Server error' },
            { status: 500 }
        );
    }
}
