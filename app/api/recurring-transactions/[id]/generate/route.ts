import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RecurringTransaction from '@/models/RecurringTransaction';
import { authMiddleware } from '@/middleware/auth';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const recurringTransaction = await RecurringTransaction.findOne({
            _id: params.id,
            userId: auth.userId,
        });

        if (!recurringTransaction) {
            return NextResponse.json(
                { success: false, message: 'Recurring transaction not found' },
                { status: 404 }
            );
        }

        if (!recurringTransaction.isActive) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cannot generate transaction from inactive recurring transaction',
                },
                { status: 400 }
            );
        }

        const transaction = await recurringTransaction.generateTransaction();

        return NextResponse.json(
            {
                success: true,
                data: {
                    transaction,
                    recurringTransaction,
                },
                message: 'Transaction generated successfully',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Generate transaction error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Server error' },
            { status: 500 }
        );
    }
}
