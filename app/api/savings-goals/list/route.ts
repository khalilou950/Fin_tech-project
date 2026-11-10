import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SavingsGoal from '@/models/SavingsGoal';
import { authMiddleware } from '@/middleware/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();
        const mongoose = await import('mongoose');

        const { searchParams } = new URL(req.url);
        const isCompleted = searchParams.get('isCompleted');
        const priority = searchParams.get('priority');
        const category = searchParams.get('category');

        const userId = auth.userId;
        const userIdObjectId = mongoose.default.Types.ObjectId.isValid(userId)
            ? new mongoose.default.Types.ObjectId(userId)
            : null;

        const userFilter = userIdObjectId
            ? { $or: [{ userId: userIdObjectId }, { userId: userId }] }
            : { userId: userId };

        const filter: any = { ...userFilter };
        if (isCompleted !== null) {
            filter.isCompleted = isCompleted === 'true';
        }
        if (priority) {
            filter.priority = priority;
        }
        if (category) {
            filter.category = category;
        }

        const savingsGoals = await SavingsGoal.find(filter).sort({ priority: -1, deadline: 1, createdAt: -1 });

        // Calculate stats
        const stats = {
            total: savingsGoals.length,
            active: savingsGoals.filter((g: any) => !g.isCompleted).length,
            completed: savingsGoals.filter((g: any) => g.isCompleted).length,
            totalTarget: savingsGoals.reduce((sum: number, g: any) => sum + g.targetAmount, 0),
            totalSaved: savingsGoals.reduce((sum: number, g: any) => sum + g.currentAmount, 0),
        };

        return NextResponse.json({
            success: true,
            data: { savingsGoals, stats },
        });
    } catch (error: any) {
        console.error('Get savings goals error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
