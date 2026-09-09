import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { Product } from '../models/Product';
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
  const typeParam = req.params.productTypeId;
  const filter = isValidObjectId(typeParam)
    ? { _id: typeParam }
    : { $or: [{ slug: typeParam }, { name: typeParam }] };

  const current = await ProductType.findOne(filter);
  if (!current) throw new HttpError(404, 'Product type not found.');

  if (req.body.name && !req.body.slug) {
    req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  const item = await ProductType.findByIdAndUpdate(current._id, { $set: req.body }, { new: true, runValidators: true });
  if (!item) throw new HttpError(404, 'Product type not found.');

  if (req.body.name && req.body.name !== current.name) {
    await Product.updateMany({ productType: current.name }, { $set: { productType: item.name } });
  }

  sendSuccess(res, 200, 'Product type updated.', item);
});

export const deleteProductType: RequestHandler = asyncHandler(async (req, res) => {
  const typeParam = req.params.productTypeId;
  const filter = isValidObjectId(typeParam)
    ? { _id: typeParam }
    : { $or: [{ slug: typeParam }, { name: typeParam }] };

  const item = await ProductType.findOneAndDelete(filter);
  if (!item) throw new HttpError(404, 'Product type not found.');
  sendSuccess(res, 200, 'Product type deleted.', { id: item._id.toString() });
});
