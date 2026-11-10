import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SavingsGoal from '@/models/SavingsGoal';
import { authMiddleware } from '@/middleware/auth';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();
        const mongoose = await import('mongoose');

        // Resolve params if it's a Promise in Next.js 15+
        const resolvedParams = 'then' in context.params ? await context.params : context.params;
        const goalId = resolvedParams.id;

        const body = await req.json();
        const { amount, note } = body;

        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return NextResponse.json({ success: false, message: 'Valid contribution amount is required' }, { status: 400 });
        }

        const userId = auth.userId;
        const userIdObjectId = mongoose.default.Types.ObjectId.isValid(userId)
            ? new mongoose.default.Types.ObjectId(userId)
            : null;

        const userFilter = userIdObjectId
            ? { $or: [{ userId: userIdObjectId }, { userId: userId }] }
            : { userId: userId };

        const goalIdObjectId = mongoose.default.Types.ObjectId.isValid(goalId)
            ? new mongoose.default.Types.ObjectId(goalId)
            : goalId;

        const savingsGoal = await SavingsGoal.findOne({
            _id: goalIdObjectId,
            ...userFilter,
        });

        if (!savingsGoal) {
            return NextResponse.json({ success: false, message: 'Savings goal not found' }, { status: 404 });
        }

        // Add contribution
        savingsGoal.contributions.push({
            date: new Date(),
            amount: numAmount,
            note: note || '',
        });

        // Update current amount
        savingsGoal.currentAmount = (savingsGoal.currentAmount || 0) + numAmount;
        if (savingsGoal.currentAmount >= savingsGoal.targetAmount) {
            savingsGoal.isCompleted = true;
            savingsGoal.completedAt = new Date();
        }

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
