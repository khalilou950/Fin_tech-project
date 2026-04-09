import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Card from '@/models/Card';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

const createCardSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    type: z.enum(['credit', 'debit', 'prepaid']).optional(),
    totalLimit: z.number().positive('Total limit must be positive'),
    currency: z.enum(['USD', 'DZD', 'EUR']).optional(),
    resetCycle: z.enum(['weekly', 'monthly', 'yearly']).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    lastFour: z.string().max(4).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const validation = createCardSchema.safeParse(body);

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

        const card = await Card.create({
            userId: auth.userId,
            name: data.name,
            type: data.type || 'debit',
            totalLimit: data.totalLimit,
            currency: data.currency || 'DZD',
            resetCycle: data.resetCycle || 'monthly',
            color: data.color || '#3498DB',
            icon: data.icon || 'CreditCard',
            lastFour: data.lastFour,
            totalSpent: 0,
            isActive: true,
        });

        return NextResponse.json(
            {
                success: true,
                data: { card },
                message: 'Card created successfully',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create card error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
