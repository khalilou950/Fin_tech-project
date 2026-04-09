import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SavingsGoal from '@/models/SavingsGoal';
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
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { amount, note } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ success: false, message: 'Valid contribution amount is required' }, { status: 400 });
        }

        const savingsGoal = await SavingsGoal.findOne({
            _id: params.id,
            userId: auth.userId,
        });

        if (!savingsGoal) {
            return NextResponse.json({ success: false, message: 'Savings goal not found' }, { status: 404 });
        }

        // Add contribution
        savingsGoal.contributions.push({
            date: new Date(),
            amount,
            note: note || '',
        });

        // Update current amount
        savingsGoal.currentAmount += amount;

        await savingsGoal.save();

        return NextResponse.json(
            {
                success: true,
                data: {
                    savingsGoal,
                    contribution: savingsGoal.contributions[savingsGoal.contributions.length - 1],
                },
                message: 'Contribution added successfully',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Add contribution error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
