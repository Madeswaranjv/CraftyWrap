import bcrypt from 'bcryptjs';
import type { RequestHandler } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { User } from '../models/User';
import { mergeGuestCart } from '../services/cartService';
import { signAccessToken } from '../utils/auth';
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

function serializeAuthUser(user: { _id: { toString(): string }; name: string; email: string; avatarUrl?: string; phone?: string; role: string; addresses: unknown[] }) {
  return { id: user._id.toString(), name: user.name, email: user.email, avatarUrl: user.avatarUrl, phone: user.phone, role: user.role, addresses: user.addresses };
}

async function completeLogin(user: Parameters<typeof serializeAuthUser>[0], cartToken?: string) {
  if (cartToken) await mergeGuestCart(user._id.toString(), cartToken);
  return { token: signAccessToken({ userId: user._id.toString(), role: user.role as 'customer' | 'admin' }), user: serializeAuthUser(user) };
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
  sendSuccess(res, 201, 'Welcome to CraftyWrap!', await completeLogin(user, cartToken));
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
  sendSuccess(res, 200, 'Signed in successfully.', await completeLogin(user, cartToken));
});

export const googleLogin: RequestHandler = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new HttpError(503, 'Google login has not been configured.');
  const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: req.body.credential, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email || !payload.email_verified) throw new HttpError(401, 'Google account could not be verified.');

  const user = await User.findOneAndUpdate(
    { $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }] },
    { $set: { googleId: payload.sub, name: payload.name ?? payload.email.split('@')[0], avatarUrl: payload.picture, email: payload.email.toLowerCase() }, $setOnInsert: { role: 'customer' } },
    { upsert: true, new: true, runValidators: true },
  );
  sendSuccess(res, 200, 'Signed in with Google.', await completeLogin(user, req.body.cartToken));
});
