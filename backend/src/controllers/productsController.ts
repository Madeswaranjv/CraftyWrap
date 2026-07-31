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

type FacetField = 'productType' | 'designTheme' | 'yarnType' | 'size';

function queryString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function queryNumber(value: unknown): number | undefined {
  const rawValue = queryString(value);
  if (!rawValue) return undefined;
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds the MongoDB predicate shared by product results, totals, and facets.
 * `exclude` deliberately omits one field so each sidebar count answers
 * "what would happen if I selected this option?" without fetching products
 * into the browser.
 */
function buildProductFilter(req: Parameters<RequestHandler>[0], exclude?: FacetField): Record<string, unknown> {
  const filter: Record<string, unknown> = { isActive: true };
  const exactFilters: FacetField[] = ['productType', 'designTheme', 'yarnType', 'size'];

  for (const key of exactFilters) {
    if (key === exclude) continue;
    const value = queryString(req.query[key]);
    if (value) filter[key] = value;
  }

  const stock = queryString(req.query.stock);
  if (queryString(req.query.inStock) === 'true' || stock === 'in-stock' || stock === 'true') {
    filter.stockCount = { $gt: 0 };
  }
  if (stock === 'out-of-stock') filter.stockCount = 0;
  if (queryString(req.query.bestSeller) === 'true') filter.isBestSeller = true;
  if (queryString(req.query.newArrival) === 'true') filter.isNew = true;

  const minPrice = queryNumber(req.query.minPrice);
  const maxPrice = queryNumber(req.query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {
      ...(minPrice !== undefined ? { $gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { $lte: maxPrice } : {}),
    };
  }

  const minRating = queryNumber(req.query.minRating);
  if (minRating !== undefined) filter.rating = { $gte: minRating };

  // `q` remains supported for the existing global-search clients. `search` is
  // the public catalogue-search parameter and takes precedence when supplied.
  const search = (queryString(req.query.search) || queryString(req.query.q)).slice(0, 160);
  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { slug: { $regex: escaped, $options: 'i' } },
      { name: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
      { highlights: { $regex: escaped, $options: 'i' } },
      { productType: { $regex: escaped, $options: 'i' } },
      { designTheme: { $regex: escaped, $options: 'i' } },
    ];
  }

  return filter;
}

async function getFacetCounts(filter: Record<string, unknown>, field: FacetField): Promise<Record<string, number>> {
  const counts = await Product.aggregate<{ _id: string; count: number }>([
    { $match: filter },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return Object.fromEntries(
    counts
      .filter((entry) => Boolean(entry._id))
      .map((entry) => [entry._id, entry.count]),
  );
}

export const listProducts: RequestHandler = asyncHandler(async (req, res) => {
  const page = positiveInteger(req.query.page, 1, 100000);
  const limit = positiveInteger(req.query.limit, 12, 48);
  const filter = buildProductFilter(req);

  const sortBy = typeof req.query.sort === 'string' ? req.query.sort : 'featured';
  const sort = ({
    featured: { isBestSeller: -1, rating: -1, reviewCount: -1, createdAt: -1 },
    'price-low': { price: 1, createdAt: -1 },
    'price-high': { price: -1, createdAt: -1 },
    rating: { rating: -1, reviewCount: -1 },
    newest: { createdAt: -1 },
  }[sortBy] ?? { isBestSeller: -1, rating: -1, reviewCount: -1 }) as Record<string, SortOrder>;

  const [products, total, productTypeCounts, designThemeCounts, yarnTypeCounts, sizeCounts] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
    getFacetCounts(buildProductFilter(req, 'productType'), 'productType'),
    getFacetCounts(buildProductFilter(req, 'designTheme'), 'designTheme'),
    getFacetCounts(buildProductFilter(req, 'yarnType'), 'yarnType'),
    getFacetCounts(buildProductFilter(req, 'size'), 'size'),
  ]);
  sendSuccess(res, 200, 'Products retrieved.', {
    products: products.map((product) => serializeProduct(product)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    facets: { productTypeCounts, designThemeCounts, yarnTypeCounts, sizeCounts },
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
