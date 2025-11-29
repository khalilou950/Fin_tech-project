import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function authMiddleware(req: NextRequest): Promise<{ user: any; userId: string } | null> {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return null;
    }

    return {
      user,
      userId: user._id.toString(),
    };
  } catch (error) {
    return null;
  }
}

export const getUserIdFromRequest = async (req: NextRequest): Promise<string | null> => {
  // Try to get from header (set by authMiddleware)
  const userId = req.headers.get('x-user-id');
  if (userId) return userId;

  // Fallback: extract from token
  try {
    const user = await getAuthenticatedUser(req);
    return user?._id.toString() || null;
  } catch {
    return null;
  }
};

