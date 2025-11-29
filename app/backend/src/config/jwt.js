export const jwtConfig = {
  accessTokenSecret: process.env.JWT_SECRET || 'your-secret-key',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  accessTokenExpire: process.env.JWT_EXPIRE || '7d',
  refreshTokenExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
};

