import jwt from 'jsonwebtoken';
import type { UserRole } from '../models/User';
import { HttpError } from './HttpError';

interface TokenPayload {
  userId: string;
  role: UserRole;
}

const DEFAULT_JWT_SECRET = 'craftywrap_default_secure_jwt_secret_key_minimum_32_characters_long_2026';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return DEFAULT_JWT_SECRET;
  }
  return secret;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  const payload = jwt.verify(token, getJwtSecret());
  if (typeof payload === 'string' || !payload.userId || !payload.role) {
    throw new HttpError(401, 'Invalid access token.');
  }
  return { userId: payload.userId, role: payload.role as UserRole };
}
