import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SavingsGoal from '@/models/SavingsGoal';
import { authMiddleware } from '@/middleware/auth';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();
        const mongoose = await import('mongoose');

        const resolvedParams = 'then' in context.params ? await context.params : context.params;
        const goalId = resolvedParams.id;

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

        const body = await req.json();
        const allowedUpdates = ['name', 'description', 'targetAmount', 'deadline', 'category', 'priority', 'autoContribute'];

        allowedUpdates.forEach((field) => {
            if (body[field] !== undefined) {
                (savingsGoal as any)[field] = body[field];
            }
        });

        await savingsGoal.save();

        return NextResponse.json({
            success: true,
            data: { savingsGoal },
            message: 'Savings goal updated successfully',
        });
    } catch (error: any) {
        console.error('Update savings goal error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();
        const mongoose = await import('mongoose');

        const resolvedParams = 'then' in context.params ? await context.params : context.params;
        const goalId = resolvedParams.id;

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

        await SavingsGoal.findByIdAndDelete(goalIdObjectId);

        return NextResponse.json({
            success: true,
            message: 'Savings goal deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete savings goal error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
