import type { RequestHandler } from 'express';
import { z } from 'zod';
import { ProductType } from '../models/ProductType';
import { HttpError } from '../utils/HttpError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const productTypeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).optional(),
  icon: z.string().trim().max(50).optional(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
});

export const listProductTypes: RequestHandler = asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, 'Product types retrieved.', await ProductType.find().sort({ displayOrder: 1, name: 1 }));
});
export const createProductType: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.body.slug) {
    req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (req.body.displayOrder === undefined) {
    req.body.displayOrder = 0;
  }
  sendSuccess(res, 201, 'Product type created.', await ProductType.create(req.body));
});
export const updateProductType: RequestHandler = asyncHandler(async (req, res) => {
  const item = await ProductType.findByIdAndUpdate(req.params.productTypeId, { $set: req.body }, { new: true, runValidators: true });
  if (!item) throw new HttpError(404, 'Product type not found.');
  sendSuccess(res, 200, 'Product type updated.', item);
});
export const deleteProductType: RequestHandler = asyncHandler(async (req, res) => {
  const item = await ProductType.findByIdAndDelete(req.params.productTypeId);
  if (!item) throw new HttpError(404, 'Product type not found.');
  sendSuccess(res, 200, 'Product type deleted.', { id: item._id.toString() });
});
