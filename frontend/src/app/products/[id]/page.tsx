'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { CustomSelect } from '@/components/CustomSelect';
import { StarRating } from '@/components/StarRating';
import { WhatsAppLogo } from '@/components/SocialIcons';
import {
  ShoppingBag,
  Wand2,
  Heart,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Upload,
  MessageCircle,
  ChevronRight,
  Star,
  Check,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { CatalogProduct, toCatalogProduct } from '@/lib/catalog';

interface ProductReview {
  _id: string;
  author: string;
  rating: number;
  comment: string;
  verified: boolean;
  userPhoto?: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'care' | 'reviews'>('description');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewsList, setReviewsList] = useState<ProductReview[]>([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        const [productData, relatedData, reviewsData] = await Promise.all([
          apiRequest<CatalogProduct>(`/products/${encodeURIComponent(productId)}`),
          apiRequest<CatalogProduct[]>(`/products/${encodeURIComponent(productId)}/related`),
          apiRequest<ProductReview[]>(`/reviews/product/${encodeURIComponent(productId)}`),
        ]);
        if (!isCurrent) return;
        setProduct(toCatalogProduct(productData));
        setRelatedProducts(relatedData.map(toCatalogProduct));
        setReviewsList(reviewsData);
      } catch (error) {
        if (isCurrent) setFormError(error instanceof Error ? error.message : 'Unable to load this product.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    void loadProduct();
    return () => { isCurrent = false; };
  }, [productId]);

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Cat': return '🐱';
      case 'Carrot': return '🥕';
      case 'Strawberry': return '🍓';
      case 'Bear': return '🐻';
      case 'Unicorn': return '🦄';
      case 'Flower': return '🌻';
      case 'Avocado': return '🥑';
      case 'Penguin': return '🐧';
      case 'Broccoli': return '🥦';
      case 'Rose': return '🌹';
      case 'Dragon': return '🐲';
      case 'Bunny': return '🐰';
      default: return '🧶';
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewName.trim() && reviewComment.trim()) {
      try {
        const formData = new FormData();
        formData.set('author', reviewName);
        formData.set('rating', String(reviewRating));
        formData.set('comment', reviewComment);
        if (reviewImage) formData.set('image', reviewImage);
        const review = await apiRequest<ProductReview>(`/reviews/product/${encodeURIComponent(productId)}`, { method: 'POST', body: formData });
        setReviewsList((current) => [review, ...current]);
        setReviewName('');
        setReviewComment('');
        setReviewImage(null);
        setReviewSubmitted(true);
        setTimeout(() => setReviewSubmitted(false), 4000);
        // Refresh product details to show updated rating average
        const refreshedProduct = await apiRequest<CatalogProduct>(`/products/${encodeURIComponent(productId)}`);
        setProduct(toCatalogProduct(refreshedProduct));
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Unable to submit your review.');
      }
    }
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-warmbrown-600">Loading product…</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-warmbrown-600">{formError ?? 'Product not found.'}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-warmbrown-500 font-medium">
        <Link href="/" className="hover:text-warmbrown-800">Home</Link>
        <ChevronRight size={12} />
        <Link href="/collections" className="hover:text-warmbrown-800">Collections</Link>
        <ChevronRight size={12} />
        <Link href={`/collections?category=${encodeURIComponent(product.category)}`} className="hover:text-warmbrown-800">
          {product.category}
        </Link>
        <ChevronRight size={12} />
        <span className="text-warmbrown-800 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className={`w-full aspect-[4/3] rounded-3xl bg-gradient-to-br ${product.imageBg} flex items-center justify-center relative shadow-card border border-peach-200 overflow-hidden`}>
            <div className="text-9xl animate-float drop-shadow-lg">
              {renderIcon(product.imageIconName)}
            </div>

            {/* Badge tags overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.isBestSeller && (
                <span className="bg-warmbrown-800 text-peach-100 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Best Seller
                </span>
              )}
              <span className="bg-white/90 backdrop-blur-md text-warmbrown-800 text-xs font-bold px-3 py-1 rounded-full border border-peach-200">
                {product.yarnType}
              </span>
            </div>
          </div>

          {/* Thumbnail row */}
          <div className="flex items-center gap-3">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIdx(idx)}
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${product.imageBg} flex items-center justify-center border-2 transition-all ${
                  selectedImageIdx === idx
                    ? 'border-warmbrown-800 scale-105 shadow-md'
                    : 'border-peach-200 hover:border-peach-300 opacity-70'
                }`}
              >
                <span className="text-2xl">{renderIcon(product.imageIconName)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-6 space-y-6 bg-white dark:bg-[#1F1610] p-6 sm:p-8 rounded-3xl border border-peach-200/80 dark:border-warmbrown-900/80 shadow-soft">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-warmbrown-500 dark:text-peach-300/60 uppercase tracking-widest">
              <span>{product.category} Collection</span>
              <span className="flex items-center gap-1 text-warmbrown-700 dark:text-peach-200 bg-peach-100 dark:bg-warmbrown-900 px-2.5 py-0.5 rounded-full">
                <Clock size={12} /> Ready in {product.prepTimeDays} days
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800 dark:text-peach-100">
              {product.name}
            </h1>

            <StarRating rating={product.rating} count={product.reviewCount} size={18} />
          </div>

          {/* Price & Stock status */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-peach-100 dark:border-warmbrown-900">
            <span className="text-3xl font-extrabold text-warmbrown-800 dark:text-peach-100">
              ₹{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-base text-warmbrown-400 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              In Stock ({product.stockCount} available)
            </span>
          </div>

          {/* Attributes Badges Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-peach-50/80 p-3 rounded-2xl border border-peach-100">
              <span className="block text-[11px] font-bold text-warmbrown-500 uppercase">Yarn Type</span>
              <span className="font-bold text-warmbrown-800 text-sm">{product.yarnType}</span>
            </div>
            <div className="bg-peach-50/80 p-3 rounded-2xl border border-peach-100">
              <span className="block text-[11px] font-bold text-warmbrown-500 uppercase">Size</span>
              <span className="font-bold text-warmbrown-800 text-sm">{product.size}</span>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-warmbrown-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity + Add to Cart Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-peach-50 border border-peach-200 rounded-full p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-white text-warmbrown-800 font-bold hover:bg-peach-200 transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-10 text-center font-extrabold text-sm text-warmbrown-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-white text-warmbrown-800 font-bold hover:bg-peach-200 transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Primary Button */}
              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 bg-warmbrown-800 hover:bg-warmbrown-900 text-peach-50 py-3.5 px-6 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                <span>Add {quantity} to Cart — ₹{(product.price * quantity).toFixed(2)}</span>
              </button>
            </div>

            {/* Secondary CTA: Customize this Doll */}
            <button
              onClick={() => router.push(`/custom-order?ref=${encodeURIComponent(product.name)}`)}
              className="w-full bg-peach-100 hover:bg-peach-200 text-warmbrown-900 py-3 px-4 rounded-full font-bold text-xs border border-peach-300 transition-colors flex items-center justify-center gap-2"
            >
              <Wand2 size={15} className="text-peach-600" />
              <span>Customize This Doll (Choose custom colors or size)</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-peach-100 text-[11px] font-semibold text-warmbrown-600 text-center">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={18} className="text-warmbrown-700" />
              <span>Safety Stitches</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck size={18} className="text-warmbrown-700" />
              <span>Secure Shipping</span>
            </div>
            <a
              href="https://wa.me/919363515015"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 hover:text-emerald-700 transition-colors"
              title="Chat on WhatsApp +91 93635 15015"
            >
              <WhatsAppLogo size={18} className="text-emerald-600" />
              <span>WhatsApp Help</span>
            </a>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Care Instructions, Reviews */}
      <div className="bg-white rounded-3xl border border-peach-200/80 p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-center gap-4 border-b border-peach-100 pb-3">
          <button
            onClick={() => setActiveTab('description')}
            className={`font-bold text-sm sm:text-base pb-2 transition-colors relative ${
              activeTab === 'description'
                ? 'text-warmbrown-800 border-b-2 border-warmbrown-800'
                : 'text-warmbrown-400 hover:text-warmbrown-700'
            }`}
          >
            Product Features
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`font-bold text-sm sm:text-base pb-2 transition-colors relative ${
              activeTab === 'care'
                ? 'text-warmbrown-800 border-b-2 border-warmbrown-800'
                : 'text-warmbrown-400 hover:text-warmbrown-700'
            }`}
          >
            Materials & Care
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`font-bold text-sm sm:text-base pb-2 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'text-warmbrown-800 border-b-2 border-warmbrown-800'
                : 'text-warmbrown-400 hover:text-warmbrown-700'
            }`}
          >
            <span>Customer Reviews</span>
            <span className="bg-peach-100 text-warmbrown-800 text-xs px-2 py-0.5 rounded-full">
              {reviewsList.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Description Highlights */}
        {activeTab === 'description' && (
          <div className="space-y-4 text-xs sm:text-sm text-warmbrown-700 leading-relaxed">
            <p>{product.description}</p>
            <h4 className="font-bold text-warmbrown-800 text-sm">Key Craft Highlights:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2 bg-peach-50/70 p-2.5 rounded-xl border border-peach-100">
                  <Check size={15} className="text-emerald-600 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab 2: Materials & Care */}
        {activeTab === 'care' && (
          <div className="space-y-4 text-xs sm:text-sm text-warmbrown-700 leading-relaxed">
            <div className="bg-peach-50 p-4 rounded-2xl border border-peach-200 space-y-2">
              <h4 className="font-bold text-warmbrown-800">Cleaning & Washing Guide:</h4>
              <p>{product.careInstructions}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-peach-200 rounded-2xl">
                <h5 className="font-bold text-warmbrown-800 mb-1">Yarn Specification</h5>
                <p>{product.yarnType} — non-fading dyes and tight gauge weave.</p>
              </div>
              <div className="p-4 bg-white border border-peach-200 rounded-2xl">
                <h5 className="font-bold text-warmbrown-800 mb-1">Stuffing</h5>
                <p>100% recycled premium polyester fiberfill with hypoallergenic barrier.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reviews with Photo Upload UI */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Reviews List */}
            <div className="space-y-4">
              {reviewsList.map((rev) => (
                <div key={rev._id} className="bg-peach-50/60 p-4 rounded-2xl border border-peach-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-peach-300 text-warmbrown-800">
                        {rev.author[0]}
                      </div>
                      <div>
                        <h5 className="font-bold text-warmbrown-800 text-xs">{rev.author}</h5>
                        <span className="text-[10px] text-warmbrown-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <StarRating rating={rev.rating} showText={false} size={14} />
                  </div>
                  <p className="text-xs text-warmbrown-700 leading-relaxed">{rev.comment}</p>
                  {rev.userPhoto && (
                    <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      📸 Verified Photo Attached
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Write a Review Form with Photo Upload UI */}
            <div className="bg-white p-6 rounded-2xl border border-peach-300 space-y-4">
              <h4 className="font-bold text-warmbrown-800 text-base">Write a Review for {product.name}</h4>

              {reviewSubmitted ? (
                <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check size={18} /> Thank you! Your review and photo have been submitted.
                </div>
              ) : (
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-warmbrown-700 block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full bg-peach-50 border border-peach-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-warmbrown-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-warmbrown-700 block mb-1">Rating</label>
                      <CustomSelect
                        value={reviewRating}
                        onChange={(val) => setReviewRating(Number(val))}
                        options={[
                          { value: 5, label: '5 Stars — Loved it!' },
                          { value: 4, label: '4 Stars — Very Good' },
                          { value: 3, label: '3 Stars — Average' },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-warmbrown-700 block mb-1">Your Review</label>
                    <textarea
                      rows={3}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts about the doll's softness, stitching quality, or shipping..."
                      className="w-full bg-peach-50 border border-peach-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-warmbrown-600"
                    />
                  </div>

                  {/* Photo Upload UI Stub */}
                  <div>
                    <label className="text-xs font-bold text-warmbrown-700 block mb-1">
                      Upload Photo of your CraftyWrap doll (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="bg-peach-100 hover:bg-peach-200 border border-peach-300 text-warmbrown-800 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2">
                        <Upload size={14} />
                        <span>{reviewImage ? reviewImage.name : 'Choose Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setReviewImage(e.target.files?.[0] ?? null)}
                          className="hidden"
                        />
                      </label>
                      {reviewImage && (
                        <span className="text-xs text-emerald-700 font-medium">Ready to submit</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-warmbrown-800 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-warmbrown-900 transition-colors"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* "You May Also Like" Related Products Row */}
      <section className="space-y-6 pt-6">
        <div className="border-b border-peach-100 pb-3">
          <h2 className="text-2xl font-extrabold text-warmbrown-800">You May Also Like</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
