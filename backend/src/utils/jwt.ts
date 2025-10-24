import jwt, { SignOptions } from 'jsonwebtoken';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production environment');
}

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export interface TokenPayload extends jwt.JwtPayload {
  userId: string;
  email: string;
  role?: string;
  teamRole?: string;
  branchId?: string;
  gymId?: string;
  tokenId?: string;
  type?: string;
}

export function generateAccessToken(payload: Omit<TokenPayload, 'exp' | 'iat' | 'jti'>): string {
  const options: SignOptions = { expiresIn: JWT_ACCESS_EXPIRY as string | number };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'exp' | 'iat' | 'jti'>): string {
  const tokenPayload = {
    ...payload,
    tokenId: generateTokenId(),
    type: 'refresh',
  };
  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRY as string | number };
  return jwt.sign(tokenPayload, JWT_SECRET, options);
}

/**
 * Generate unique token ID for refresh token rotation
 */
function generateTokenId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}
