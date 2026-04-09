import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Card from '@/models/Card';
import { authMiddleware } from '@/middleware/auth';

export async function GET(req: NextRequest) {
    try {
        const auth = await authMiddleware(req);
        if (!auth) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const isActive = searchParams.get('isActive');

        const filter: any = { userId: auth.userId };
        if (isActive !== null) {
            filter.isActive = isActive === 'true';
        }

        const cards = await Card.find(filter).sort({ createdAt: -1 });

        const stats = {
            total: cards.length,
            active: cards.filter((c: any) => c.isActive).length,
            totalLimit: cards.reduce((sum: number, c: any) => sum + c.totalLimit, 0),
            totalSpent: cards.reduce((sum: number, c: any) => sum + c.totalSpent, 0),
        };

        return NextResponse.json({
            success: true,
            data: { cards, stats },
        });
    } catch (error: any) {
        console.error('Get cards error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
