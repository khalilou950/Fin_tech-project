import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/middleware/auth';
import { authMiddleware } from '@/middleware/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const authResponse = await authMiddleware(req);
    if (authResponse && authResponse.status !== 200) {
      return authResponse;
    }

    await connectDB();

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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Get refresh token from body if provided
    const body = await req.json().catch(() => ({}));
    const refreshToken = body.refreshToken;

    // Remove refresh token if provided
    if (refreshToken && user.refreshTokens) {
      user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
      await user.save();
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Clear cookie
    response.cookies.delete('token');

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

