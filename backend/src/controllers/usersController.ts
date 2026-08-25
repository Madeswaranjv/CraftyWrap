import type { RequestHandler } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const addressSchema = z.object({
  label: z.string().trim().min(1).max(50).optional(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(25),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().trim().min(3).max(20),
  isDefault: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().min(6).max(25).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  addresses: z.array(addressSchema).max(20).optional(),
});

function serializeUser(user: Awaited<ReturnType<typeof User.findById>> | Record<string, unknown>) {
  const value = user && typeof user === 'object' && 'toObject' in user && typeof user.toObject === 'function' ? user.toObject() : user;
  const record = value as Record<string, unknown>;
  delete record.passwordHash;
  return { ...record, id: record._id?.toString() };
}

export const getMyProfile: RequestHandler = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth!.userId);
  if (!user) throw new HttpError(404, 'User not found.');
  sendSuccess(res, 200, 'Profile retrieved.', serializeUser(user));
});

export const updateMyProfile: RequestHandler = asyncHandler(async (req, res) => {
  const update = { ...req.body } as { addresses?: Array<{ isDefault?: boolean }> };
  if (update.addresses) {
    const defaultIndex = update.addresses.findIndex((address) => address.isDefault);
    if (defaultIndex >= 0) {
      update.addresses = update.addresses.map((address, index) => ({ ...address, isDefault: index === defaultIndex }));
    }
  }

  const user = await User.findByIdAndUpdate(req.auth!.userId, { $set: update }, { new: true, runValidators: true });
  if (!user) throw new HttpError(404, 'User not found.');
  sendSuccess(res, 200, 'Profile updated.', serializeUser(user));
});

export const setDefaultAddress: RequestHandler = asyncHandler(async (req, res) => {
  const addressIndex = Number(req.params.addressIndex);
  if (!Number.isInteger(addressIndex) || addressIndex < 0) throw new HttpError(400, 'Address index is invalid.');
  const user = await User.findById(req.auth!.userId);
  if (!user) throw new HttpError(404, 'User not found.');
  if (!user.addresses[addressIndex]) throw new HttpError(404, 'Address not found.');
  user.addresses.forEach((address: { isDefault?: boolean }, index: number) => { address.isDefault = index === addressIndex; });
  await user.save();
  sendSuccess(res, 200, 'Default address updated.', serializeUser(user));
});

export const listUsers: RequestHandler = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Users retrieved.', users.map((user) => serializeUser(user)));
});

export const updateUserAsAdmin: RequestHandler = asyncHandler(async (req, res) => {
  const allowed = z.object({ role: z.enum(['customer', 'admin']).optional(), name: z.string().trim().min(2).optional(), phone: z.string().trim().min(6).optional() }).parse(req.body);
  const user = await User.findByIdAndUpdate(req.params.userId, { $set: allowed }, { new: true, runValidators: true });
  if (!user) throw new HttpError(404, 'User not found.');
  sendSuccess(res, 200, 'User updated.', serializeUser(user));
});
