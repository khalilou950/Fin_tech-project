import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RecurringTransaction from '@/models/RecurringTransaction';
import { authMiddleware } from '@/middleware/auth';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
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

        const body = await req.json();

        // Update allowed fields
        const allowedUpdates = [
            'merchant',
            'category',
            'amount',
            'type',
            'currency',
            'frequency',
            'endDate',
            'dayOfMonth',
            'dayOfWeek',
            'autoGenerate',
            'isActive',
            'tags',
            'notes',
        ];

        allowedUpdates.forEach((field) => {
            if (body[field] !== undefined) {
                (recurringTransaction as any)[field] = body[field];
            }
        });

        // Recalculate next occurrence if frequency changed
        if (body.frequency) {
            recurringTransaction.nextOccurrence = recurringTransaction.calculateNextOccurrence();
        }

        await recurringTransaction.save();

        return NextResponse.json({
            success: true,
            data: { recurringTransaction },
            message: 'Recurring transaction updated successfully',
        });
    } catch (error: any) {
        console.error('Update recurring transaction error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

        await RecurringTransaction.findByIdAndDelete(params.id);

        return NextResponse.json({
            success: true,
            message: 'Recurring transaction deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete recurring transaction error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Server error' },
            { status: 500 }
        );
    }
}
