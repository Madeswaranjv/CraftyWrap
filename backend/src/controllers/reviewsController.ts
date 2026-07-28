import type { RequestHandler } from 'express';
import { z } from 'zod';
import { uploadToCloudinary } from '../config/cloudinary';
import { Product } from '../models/Product';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const reviewSchema = z.object({ author: z.string().trim().min(2).max(120).optional(), rating: z.coerce.number().min(1).max(5), comment: z.string().trim().min(3).max(2000) });
export const reviewAdminSchema = z.object({ verified: z.boolean().optional(), comment: z.string().trim().min(3).max(2000).optional(), rating: z.number().min(1).max(5).optional() });

async function updateProductRating(productId: string): Promise<void> {
  const [summary] = await Review.aggregate<{ averageRating: number; reviewCount: number }>([
    { $match: { product: Product.db.base.Types.ObjectId.createFromHexString(productId) } },
    { $group: { _id: '$product', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    $set: { rating: summary ? Number(summary.averageRating.toFixed(2)) : 0, reviewCount: summary?.reviewCount ?? 0 },
  });
}

export const listProductReviews: RequestHandler = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new HttpError(404, 'Product not found.');
  sendSuccess(res, 200, 'Reviews retrieved.', await Review.find({ product: product._id }).sort({ createdAt: -1 }));
});

export const createReview: RequestHandler = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw new HttpError(404, 'Product not found.');
  const user = req.auth ? await User.findById(req.auth.userId) : undefined;
  const author = user?.name ?? req.body.author;
  if (!author) throw new HttpError(400, 'Author is required for a guest review.');
  const userPhoto = req.file ? (await uploadToCloudinary(req.file.buffer, 'craftywrap/reviews')).secureUrl : undefined;
  const review = await Review.create({ product: product._id, ...(req.auth ? { user: req.auth.userId } : {}), author, rating: req.body.rating, comment: req.body.comment, userPhoto, verified: Boolean(req.auth) });
  await updateProductRating(product._id.toString());
  sendSuccess(res, 201, 'Review submitted.', review);
});

export const listReviews: RequestHandler = asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, 'Reviews retrieved.', await Review.find().sort({ createdAt: -1 }).populate('product', 'name slug').populate('user', 'name email'));
});

export const updateReviewAsAdmin: RequestHandler = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.reviewId, { $set: req.body }, { new: true, runValidators: true });
  if (!review) throw new HttpError(404, 'Review not found.');
  await updateProductRating(review.product.toString());
  sendSuccess(res, 200, 'Review updated.', review);
});

export const deleteReviewAsAdmin: RequestHandler = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.reviewId);
  if (!review) throw new HttpError(404, 'Review not found.');
  await updateProductRating(review.product.toString());
  sendSuccess(res, 200, 'Review deleted.', { id: review._id.toString() });
});
