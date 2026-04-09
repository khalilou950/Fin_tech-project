import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Card from '@/models/Card';
import Budget from '@/models/Budget';
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
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();

        const card = await Card.findOne({ _id: params.id, userId: auth.userId });

        if (!card) {
            return NextResponse.json({ success: false, message: 'Card not found' }, { status: 404 });
        }

        const body = await req.json();
        const allowedUpdates = ['name', 'type', 'totalLimit', 'currency', 'resetCycle', 'color', 'icon', 'lastFour', 'isActive'];

        allowedUpdates.forEach((field) => {
            if (body[field] !== undefined) {
                (card as any)[field] = body[field];
            }
        });

        await card.save();

        return NextResponse.json({
            success: true,
            data: { card },
            message: 'Card updated successfully',
        });
    } catch (error: any) {
        console.error('Update card error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();

        const card = await Card.findOne({ _id: params.id, userId: auth.userId });

        if (!card) {
            return NextResponse.json({ success: false, message: 'Card not found' }, { status: 404 });
        }

        // Check if card has associated budgets
        const budgetsCount = await Budget.countDocuments({ cardId: params.id });

        if (budgetsCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot delete card with ${budgetsCount} associated budget(s). Remove budgets first.`,
                },
                { status: 400 }
            );
        }

        await Card.findByIdAndDelete(params.id);

        return NextResponse.json({
            success: true,
            message: 'Card deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete card error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
