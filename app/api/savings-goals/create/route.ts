import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SavingsGoal from '@/models/SavingsGoal';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

const createSavingsGoalSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    description: z.string().optional(),
    targetAmount: z.number().positive('Target amount must be positive'),
    currentAmount: z.number().min(0).optional(),
    deadline: z.string().datetime().or(z.date()).optional().nullable(),
    category: z.enum(['emergency', 'vacation', 'purchase', 'education', 'retirement', 'house', 'car', 'wedding', 'other']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    autoContribute: z
        .object({
            enabled: z.boolean(),
            amount: z.number().min(0).optional(),
            frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
        })
        .optional(),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const validation = createSavingsGoalSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: validation.error.errors,
                },
                { status: 400 }
            );
        }

        const data = validation.data;

        const savingsGoal = await SavingsGoal.create({
            userId: auth.userId,
            name: data.name,
            description: data.description,
            targetAmount: data.targetAmount,
            currentAmount: data.currentAmount || 0,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
            category: data.category || 'other',
            priority: data.priority || 'medium',
            autoContribute: data.autoContribute || { enabled: false },
        });

        return NextResponse.json(
            {
                success: true,
                data: { savingsGoal },
                message: 'Savings goal created successfully',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create savings goal error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
