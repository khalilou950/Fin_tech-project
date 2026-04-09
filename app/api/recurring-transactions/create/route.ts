import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RecurringTransaction from '@/models/RecurringTransaction';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

const createRecurringTransactionSchema = z.object({
    merchant: z.string().min(1, 'Merchant is required').trim(),
    category: z.enum([
        'Food',
        'Transport',
        'Entertainment',
        'Shopping',
        'Utilities',
        'Bills',
        'Health',
        'Salary',
        'Freelance',
        'Other',
    ]),
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['Income', 'Expense']),
    currency: z.enum(['USD', 'DZD', 'EUR']).optional(),
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
    startDate: z.string().datetime().or(z.date()).optional(),
    endDate: z.string().datetime().or(z.date()).optional().nullable(),
    dayOfMonth: z.number().min(1).max(31).optional().nullable(),
    dayOfWeek: z.number().min(0).max(6).optional().nullable(),
    autoGenerate: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: 'Not authorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await req.json();
        const validation = createRecurringTransactionSchema.safeParse(body);

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
        const userId = auth.userId;

        // Calculate first occurrence
        const start = data.startDate ? new Date(data.startDate) : new Date();
        let nextOccurrence = new Date(start);

        // Set specific day if provided
        if (data.frequency === 'monthly' && data.dayOfMonth) {
            nextOccurrence.setDate(Math.min(data.dayOfMonth, new Date(nextOccurrence.getFullYear(), nextOccurrence.getMonth() + 1, 0).getDate()));
        } else if (data.frequency === 'weekly' && data.dayOfWeek !== undefined && data.dayOfWeek !== null) {
            const currentDay = nextOccurrence.getDay();
            const daysUntilTarget = (data.dayOfWeek - currentDay + 7) % 7;
            nextOccurrence.setDate(nextOccurrence.getDate() + daysUntilTarget);
        }

        const recurringTransaction = await RecurringTransaction.create({
            userId,
            merchant: data.merchant,
            category: data.category,
            amount: data.amount,
            type: data.type,
            currency: data.currency || 'DZD',
            frequency: data.frequency,
            startDate: start,
            endDate: data.endDate ? new Date(data.endDate) : null,
            nextOccurrence,
            dayOfMonth: data.dayOfMonth,
            dayOfWeek: data.dayOfWeek,
            autoGenerate: data.autoGenerate !== undefined ? data.autoGenerate : true,
            isActive: true,
            tags: data.tags || [],
            notes: data.notes || '',
        });

        return NextResponse.json(
            {
                success: true,
                data: { recurringTransaction },
                message: 'Recurring transaction created successfully',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create recurring transaction error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Server error' },
            { status: 500 }
        );
    }
}
