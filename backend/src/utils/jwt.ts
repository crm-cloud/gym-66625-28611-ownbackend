import jwt from 'jsonwebtoken';
import type { AuthUser } from '../middleware/authenticate.js';

// Type assertion for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';
const JWT_ACCESS_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production environment');
}

// Add this interface for the tokens response
export interface Tokens {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
}

export interface TokenPayload {
  userId: string;
  user_id: string;
  email: string;
  role: string;
  branchId?: string | null;
  gymId?: string | null;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  tokenId?: string;
  type?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export function generateAccessToken(user: AuthUser): string {
  // Create a clean payload with only the necessary fields
  const payload: TokenPayload = {
    userId: user.userId,
    user_id: user.userId, // For backward compatibility
    email: user.email,
    role: user.role || 'member',
    branchId: user.branchId || null,
    gymId: user.gymId || null,
    fullName: user.fullName || null,
    phone: user.phone || null,
    avatarUrl: user.avatarUrl || null,
    emailVerified: user.emailVerified || false,
    permissions: user.permissions || []
  };
  
  // Create options with proper type assertion
  const options: jwt.SignOptions = {
    expiresIn: '15m',
    issuer: 'fitverse-api',
    audience: 'fitverse-client',
    algorithm: 'HS256'
  } as const;

  return jwt.sign(payload, JWT_SECRET, options);
}

export function generateRefreshToken(user: AuthUser): string {
  const payload: TokenPayload = {
    userId: user.userId,
    user_id: user.userId, // For backward compatibility
    email: user.email,
    role: user.role || 'member',
    tokenId: generateTokenId()
  };

  const options: jwt.SignOptions = {
    expiresIn: '7d',
    issuer: 'fitverse-api',
    audience: 'fitverse-client',
    algorithm: 'HS256'
  } as const;

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Generate unique token ID for refresh token rotation
 */
function generateTokenId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    console.log('[JWT] Verifying access token', { 
      tokenLength: token.length, 
      tokenPreview: token.substring(0, 30) + '...',
      secretConfigured: !!JWT_SECRET,
      secretLength: JWT_SECRET.length
    });
    
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: 'fitverse-api',
      audience: 'fitverse-client'
    }) as TokenPayload;
    
    console.log('[JWT] Token verification successful', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    });
    
    // Basic validation of required fields
    if (!payload.userId || !payload.email) {
      console.error('Invalid token payload: missing required fields', { userId: payload.userId, email: payload.email });
      throw new Error('Invalid token payload: missing required fields');
    }
    
    // Ensure all required fields have proper values
    const verifiedPayload: TokenPayload = {
      ...payload,
      userId: payload.userId,
      user_id: payload.user_id || payload.userId,
      email: payload.email,
      role: payload.role || 'member',
      branchId: payload.branchId || null,
      gymId: payload.gymId || null,
      fullName: payload.fullName || null,
      phone: payload.phone || null,
      avatarUrl: payload.avatarUrl || null,
      emailVerified: payload.emailVerified || false,
      permissions: Array.isArray(payload.permissions) ? payload.permissions : []
    };
    
    return verifiedPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('[JWT] ❌ Token expired', { 
        expiredAt: error.expiredAt,
        now: new Date()
      });
      throw new Error('Token expired');
    }
    console.error('[JWT] ❌ Token verification failed', { 
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown'
    });
    throw new Error('Invalid token');
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'fitverse-api',
    audience: 'fitverse-client'
  }) as TokenPayload;
}

/**
 * Generate access and refresh tokens
 */
export function generateTokens(user: AuthUser): Tokens {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Calculate token expiration dates
  const accessTokenExpires = new Date(
    Date.now() + (parseInt(JWT_ACCESS_EXPIRY) * 1000 || 15 * 60 * 1000) // Default 15 minutes
  );
  
  const refreshTokenExpires = new Date(
    Date.now() + (parseInt(JWT_REFRESH_EXPIRY) * 1000 || 7 * 24 * 60 * 60 * 1000) // Default 7 days
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires,
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires,
    },
  };
}
