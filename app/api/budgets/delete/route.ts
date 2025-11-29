import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';
import { authMiddleware } from '@/middleware/auth';

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const auth = await authMiddleware(req);
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authorized',
        },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = auth.userId;
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Budget ID is required',
        },
        { status: 400 }
      );
    }

    const budget = await Budget.findOne({ _id: id, userId });

    if (!budget) {
      return NextResponse.json(
        {
          success: false,
          message: 'Budget not found',
        },
        { status: 404 }
      );
    }

    await Budget.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Budget deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete budget error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

