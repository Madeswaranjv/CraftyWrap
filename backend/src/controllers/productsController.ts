import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { SortOrder } from 'mongoose';
import { Product } from '../models/Product';
import { HttpError } from '../utils/HttpError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { serializeProduct } from '../utils/serializers';

export const productPayloadSchema = z.object({
  slug: z.string().trim().min(2).max(160),
  name: z.string().trim().min(2).max(180),
  productType: z.string().trim().min(2).max(100),
  designTheme: z.string().trim().min(2).max(100),
  yarnType: z.string().trim().min(2).max(100),
  size: z.string().trim().min(2).max(100),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  stockCount: z.number().int().nonnegative(),
  prepTimeDays: z.number().int().nonnegative(),
  isBestSeller: z.boolean().optional(),
  isNew: z.boolean().optional(),
  description: z.string().trim().min(10).max(5000),
  highlights: z.array(z.string().trim().min(1).max(300)).max(20),
  careInstructions: z.string().trim().max(1000).optional(),
  images: z.array(z.string().url()).max(12).optional(),
  isActive: z.boolean().optional(),
});

function positiveInteger(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

export const listProducts: RequestHandler = asyncHandler(async (req, res) => {
  const page = positiveInteger(req.query.page, 1, 100000);
  const limit = positiveInteger(req.query.limit, 12, 48);
  const filter: Record<string, unknown> = { isActive: true };
  const exactFilters = ['productType', 'designTheme', 'yarnType', 'size'] as const;
  for (const key of exactFilters) {
    const value = req.query[key];
    if (typeof value === 'string' && value.trim()) filter[key] = value.trim();
  }
  if (req.query.inStock === 'true') filter.stockCount = { $gt: 0 };
  if (req.query.bestSeller === 'true') filter.isBestSeller = true;
  if (req.query.newArrival === 'true') filter.isNew = true;

  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);
  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    filter.price = { ...(Number.isFinite(minPrice) ? { $gte: minPrice } : {}), ...(Number.isFinite(maxPrice) ? { $lte: maxPrice } : {}) };
  }
  const minRating = Number(req.query.minRating);
  if (Number.isFinite(minRating)) filter.rating = { $gte: minRating };

  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { slug: { $regex: escaped, $options: 'i' } },
      { name: { $regex: escaped, $options: 'i' } },
      { productType: { $regex: escaped, $options: 'i' } },
      { designTheme: { $regex: escaped, $options: 'i' } },
      { yarnType: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
    ];
  }

  const sortBy = typeof req.query.sort === 'string' ? req.query.sort : 'featured';
  const sort = ({
    featured: { isBestSeller: -1, rating: -1, reviewCount: -1, createdAt: -1 },
    'price-low': { price: 1, createdAt: -1 },
    'price-high': { price: -1, createdAt: -1 },
    rating: { rating: -1, reviewCount: -1 },
    newest: { createdAt: -1 },
  }[sortBy] ?? { isBestSeller: -1, rating: -1, reviewCount: -1 }) as Record<string, SortOrder>;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  sendSuccess(res, 200, 'Products retrieved.', {
    products: products.map((product) => serializeProduct(product)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getProductBySlug: RequestHandler = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new HttpError(404, 'Product not found.');
  sendSuccess(res, 200, 'Product retrieved.', serializeProduct(product));
});

export const getRelatedProducts: RequestHandler = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new HttpError(404, 'Product not found.');
  const products = await Product.find({ _id: { $ne: product._id }, isActive: true, designTheme: product.designTheme })
    .sort({ isBestSeller: -1, rating: -1 })
    .limit(4);
  sendSuccess(res, 200, 'Related products retrieved.', products.map((item) => serializeProduct(item)));
});

export const autocompleteProducts: RequestHandler = asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q.length < 2) {
    sendSuccess(res, 200, 'Autocomplete results retrieved.', []);
    return;
  }
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const products = await Product.find({ isActive: true, $or: [{ name: { $regex: escaped, $options: 'i' } }, { slug: { $regex: escaped, $options: 'i' } }, { productType: { $regex: escaped, $options: 'i' } }, { designTheme: { $regex: escaped, $options: 'i' } }] })
    .select('slug name productType designTheme images price')
    .limit(8);
  sendSuccess(res, 200, 'Autocomplete results retrieved.', products.map((product) => serializeProduct(product)));
});

export const createProduct: RequestHandler = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  sendSuccess(res, 201, 'Product created.', serializeProduct(product));
});

export const updateProduct: RequestHandler = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.productId, { $set: req.body }, { new: true, runValidators: true });
  if (!product) throw new HttpError(404, 'Product not found.');
  sendSuccess(res, 200, 'Product updated.', serializeProduct(product));
});

export const deactivateProduct: RequestHandler = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.productId, { $set: { isActive: false } }, { new: true });
  if (!product) throw new HttpError(404, 'Product not found.');
  sendSuccess(res, 200, 'Product deactivated.', serializeProduct(product));
});
