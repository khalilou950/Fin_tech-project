import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpire,
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpire,
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.refreshTokenSecret);
};

