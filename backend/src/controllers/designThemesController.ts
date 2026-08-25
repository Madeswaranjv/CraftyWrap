import type { RequestHandler } from 'express';
import { z } from 'zod';
import { DesignTheme } from '../models/DesignTheme';
import { Product } from '../models/Product';
import { HttpError } from '../utils/HttpError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const designThemeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().max(50).optional(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
});

export const listDesignThemes: RequestHandler = asyncHandler(async (_req, res) => {
  const [themes, counts] = await Promise.all([
    DesignTheme.find().sort({ displayOrder: 1, name: 1 }),
    Product.aggregate<{ _id: string; itemCount: number }>([
      { $match: { isActive: true } },
      { $group: { _id: '$designTheme', itemCount: { $sum: 1 } } },
    ]),
  ]);
  const countsByName = new Map(counts.map((count) => [count._id, count.itemCount]));
  sendSuccess(res, 200, 'Design themes retrieved.', themes.map((theme) => ({ ...theme.toObject(), itemCount: countsByName.get(theme.name) ?? 0 })));
});

export const createDesignTheme: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.body.slug) {
    req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (req.body.displayOrder === undefined) {
    req.body.displayOrder = 0;
  }
  sendSuccess(res, 201, 'Design theme created.', await DesignTheme.create(req.body));
});
export const updateDesignTheme: RequestHandler = asyncHandler(async (req, res) => {
  const item = await DesignTheme.findByIdAndUpdate(req.params.designThemeId, { $set: req.body }, { new: true, runValidators: true });
  if (!item) throw new HttpError(404, 'Design theme not found.');
  sendSuccess(res, 200, 'Design theme updated.', item);
});
export const deleteDesignTheme: RequestHandler = asyncHandler(async (req, res) => {
  const item = await DesignTheme.findByIdAndDelete(req.params.designThemeId);
  if (!item) throw new HttpError(404, 'Design theme not found.');
  sendSuccess(res, 200, 'Design theme deleted.', { id: item._id.toString() });
});
