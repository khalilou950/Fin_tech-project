import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/auth';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

const settingsSchema = z.object({
  currency: z.enum(['USD', 'DZD', 'EUR']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim().optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const authResponse = await authMiddleware(req);
    if (authResponse && authResponse.status !== 200) {
      return authResponse;
    }

    await connectDB();

    const body = await req.json();
    const validation = settingsSchema.safeParse(body);

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

    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 401 }
      );
    }

    const updateData: any = {};
    if (validation.data.currency) updateData.currency = validation.data.currency;
    if (validation.data.theme) updateData.theme = validation.data.theme;
    if (validation.data.fullName) updateData.fullName = validation.data.fullName;
    if (validation.data.avatar !== undefined) updateData.avatar = validation.data.avatar || null;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: user.toJSON(),
        },
        message: 'Settings updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

