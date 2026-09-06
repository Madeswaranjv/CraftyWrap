import bcrypt from 'bcryptjs';
import type { RequestHandler, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { User } from '../models/User';
import { mergeGuestCart } from '../services/cartService';
import { signAccessToken, verifyAccessToken } from '../utils/auth';
import { HttpError } from '../utils/HttpError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(120),
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.').max(128),
  phone: z.string().trim().min(6, 'Phone number must be at least 6 characters.').max(25).optional().or(z.literal('')),
  cartToken: z.string().min(16).max(200).optional(),
});
export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.').max(128),
  cartToken: z.string().min(16).max(200).optional(),
});
export const googleSchema = z.object({ credential: z.string().min(20), cartToken: z.string().min(16).max(200).optional() });

const COOKIE_NAME = 'cw_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

function clearAuthCookie(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
}

function serializeAuthUser(user: { _id: { toString(): string }; name: string; email: string; avatarUrl?: string; phone?: string; role: string; addresses: unknown[] }) {
  return { id: user._id.toString(), name: user.name, email: user.email, avatarUrl: user.avatarUrl, phone: user.phone, role: user.role, addresses: user.addresses };
}

async function completeLogin(res: Response, user: Parameters<typeof serializeAuthUser>[0], cartToken?: string) {
  if (cartToken) await mergeGuestCart(user._id.toString(), cartToken);
  const token = signAccessToken({ userId: user._id.toString(), role: user.role as 'customer' | 'admin' });
  setAuthCookie(res, token);
  return { token, user: serializeAuthUser(user) };
}

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const { name, email, password, phone, cartToken } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new HttpError(409, 'This email is already registered.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone ? phone.trim() : undefined,
    passwordHash,
    role: 'customer',
  });
  if (!user) throw new HttpError(500, 'Unable to create account.');
  sendSuccess(res, 201, 'Welcome to CraftyWrap!', await completeLogin(res, user, cartToken));
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password, cartToken } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    throw new HttpError(401, 'No account found with this email.');
  }
  if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Incorrect password. Please try again.');
  }
  sendSuccess(res, 200, 'Signed in successfully.', await completeLogin(res, user, cartToken));
});

export const googleLogin: RequestHandler = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) throw new HttpError(503, 'Google login has not been configured.');

  let payload;
  try {
    const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: req.body.credential, audience: clientId });
    payload = ticket.getPayload();
  } catch (error: any) {
    throw new HttpError(401, error?.message || 'Google account verification failed. Please try again.');
  }

  if (!payload?.sub || !payload.email || !payload.email_verified) throw new HttpError(401, 'Google account could not be verified.');

  const user = await User.findOneAndUpdate(
    { $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }] },
    { $set: { googleId: payload.sub, name: payload.name ?? payload.email.split('@')[0], avatarUrl: payload.picture, email: payload.email.toLowerCase() }, $setOnInsert: { role: 'customer' } },
    { upsert: true, new: true, runValidators: true },
  );
  sendSuccess(res, 200, 'Signed in with Google.', await completeLogin(res, user, req.body.cartToken));
});

export const getMe: RequestHandler = asyncHandler(async (req, res) => {
  // Try cookie first, then Authorization header
  const token = req.cookies?.cw_token
    ?? (req.header('authorization')?.startsWith('Bearer ') ? req.header('authorization')!.slice(7).trim() : undefined);
  if (!token) {
    throw new HttpError(401, 'Not authenticated.');
  }
  const { userId } = verifyAccessToken(token);
  const user = await User.findById(userId);
  if (!user) {
    clearAuthCookie(res);
    throw new HttpError(401, 'User not found.');
  }
  sendSuccess(res, 200, 'Authenticated.', { user: serializeAuthUser(user), token });
});

export const logoutHandler: RequestHandler = (_req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, 200, 'Signed out successfully.', null);
};
