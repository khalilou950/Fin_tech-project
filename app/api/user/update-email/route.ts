import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthenticatedUser, getUserIdFromRequest } from '@/lib/auth';
import { authMiddleware } from '@/middleware/auth';
import { z } from 'zod';

const updateEmailSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
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
    const validation = updateEmailSchema.safeParse(body);

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

    const { email } = validation.data;
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

    // Check if email already exists
    const emailExists = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email already in use',
        },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { email },
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
        message: 'Email updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update email error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

