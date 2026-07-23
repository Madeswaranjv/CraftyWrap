'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import {
  Trash2,
  Gift,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    giftWrap,
    setGiftWrap,
    giftNote,
    setGiftNote,
  } = useCart();
  const router = useRouter();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  const giftWrapFee = giftWrap ? 4.99 : 0;
  const shippingFee = subtotal > 50 || cart.length === 0 ? 0 : 5.99;
  const total = Math.max(0, subtotal + giftWrapFee + shippingFee - discount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'CRAFTY10') {
      setDiscount(subtotal * 0.1);
      setPromoApplied(true);
    } else if (promoCode.trim()) {
      alert('Invalid code! Try code: CRAFTY10');
    }
  };

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

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 bg-peach-100 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner">
          🧶
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-warmbrown-800">Your Cart is Empty</h1>
          <p className="text-xs sm:text-sm text-warmbrown-600 max-w-sm mx-auto">
            You haven&apos;t added any handmade yarn dolls to your shopping cart yet!
          </p>
        </div>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 bg-warmbrown-800 text-white px-7 py-3.5 rounded-full font-bold text-xs hover:bg-warmbrown-900 transition-colors shadow-md"
        >
          <ShoppingBag size={16} />
          <span>Explore Collections Now</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-peach-100 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-warmbrown-800">Shopping Cart</h1>
          <p className="text-xs text-warmbrown-600">
            {cart.reduce((acc, item) => acc + item.quantity, 0)} items in your cart
          </p>
        </div>
        <Link
          href="/collections"
          className="text-xs font-bold text-warmbrown-600 hover:text-warmbrown-800 flex items-center gap-1"
        >
          <ChevronLeft size={14} /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-white p-4 sm:p-5 rounded-3xl border border-peach-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.product.imageBg} flex items-center justify-center shrink-0 border border-peach-200 text-3xl`}
                >
                  {renderIcon(item.product.imageIconName)}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-warmbrown-500 bg-peach-50 px-2 py-0.5 rounded-md border border-peach-100">
                    {item.product.category}
                  </span>
                  <Link href={`/products/${item.product.id}`}>
                    <h3 className="font-bold text-warmbrown-800 text-sm hover:text-warmbrown-600 transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-warmbrown-600">
                    <span>{item.product.yarnType}</span>
                    <span>•</span>
                    <span>{item.product.size}</span>
                  </div>
                  <p className="text-xs font-bold text-warmbrown-800 sm:hidden">
                    ${item.product.price.toFixed(2)} each
                  </p>
                </div>
              </div>

              {/* Quantity Stepper & Price & Remove */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-peach-100 pt-3 sm:pt-0">
                <div className="flex items-center bg-peach-50 border border-peach-200 rounded-full p-1">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-white text-warmbrown-800 font-bold hover:bg-peach-200 transition-colors flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-extrabold text-xs text-warmbrown-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-white text-warmbrown-800 font-bold hover:bg-peach-200 transition-colors flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-warmbrown-800 text-base block">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-warmbrown-500 hidden sm:block">
                    ${item.product.price.toFixed(2)} / ea
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-warmbrown-400 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Gift Wrap & Gift Note Option Card */}
          <div className="bg-peach-50/80 p-5 rounded-3xl border border-peach-200/80 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                className="w-4 h-4 accent-warmbrown-700 rounded cursor-pointer"
              />
              <div className="flex items-center gap-2 text-xs font-bold text-warmbrown-800">
                <Gift size={16} className="text-peach-600" />
                <span>Add Handcrafted Gift Wrapping & Custom Tag (+ $4.99)</span>
              </div>
            </label>

            {giftWrap && (
              <div className="pl-7 space-y-2 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-warmbrown-700 block">
                  Write Your Handwritten Gift Note:
                </label>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="e.g., Happy Birthday Chloe! Hope this cute bunny brings you joy. Love, Mom."
                  className="w-full bg-white border border-peach-300 rounded-xl p-3 text-xs outline-none focus:border-warmbrown-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-peach-200/80 shadow-card space-y-4">
            <h3 className="font-extrabold text-warmbrown-800 text-lg border-b border-peach-100 pb-3">
              Order Summary
            </h3>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo Code (Try: CRAFTY10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="bg-peach-50 border border-peach-200 rounded-xl px-3 py-2 text-xs w-full outline-none uppercase font-semibold"
              />
              <button
                type="submit"
                className="bg-warmbrown-800 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-warmbrown-900 transition-colors shrink-0"
              >
                Apply
              </button>
            </form>

            {promoApplied && (
              <div className="text-[11px] text-emerald-700 font-bold bg-emerald-100 p-2 rounded-lg">
                10% Crafty discount applied!
              </div>
            )}

            {/* Pricing Breakdown */}
            <div className="space-y-2 text-xs text-warmbrown-700 border-t border-peach-100 pt-3">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Estimate</span>
                <span className="font-bold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700">FREE ($50+ orders)</span>
                  ) : (
                    `$${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              {giftWrap && (
                <div className="flex justify-between">
                  <span>Gift Packaging</span>
                  <span className="font-bold">${giftWrapFee.toFixed(2)}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-warmbrown-800 border-t border-peach-200 pt-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-warmbrown-800 hover:bg-warmbrown-900 text-peach-50 py-3.5 rounded-full font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
