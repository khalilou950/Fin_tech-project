import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

export interface JWTPayload {
  id: string;
  email: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
};

export const getTokenFromRequest = (req: NextRequest): string | null => {
  // Try Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const token = req.cookies.get('token')?.value;
  if (token) {
    return token;
  }

  return null;
};

export const getAuthenticatedUser = async (req: NextRequest): Promise<IUser | null> => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      console.log('No token found in request');
      return null;
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) {
      console.log('Invalid token payload:', decoded);
      return null;
    }

    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return null;
    }

    return user;
  } catch (error: any) {
    console.error('getAuthenticatedUser error:', error.message);
    return null;
  }
};

