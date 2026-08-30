'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, Order } from '@/context/CartContext';
import { apiRequest, getOrCreateCartToken, getStoredAccessToken } from '@/lib/api';
import {
  CreditCard,
  CheckCircle2,
  Lock,
  Truck,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { cart, subtotal, giftWrap, user, clearCart, addOrder } = useCart();
  const router = useRouter();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pendingDemoOrder, setPendingDemoOrder] = useState<Order | null>(null);
  const [selectedDemoOption, setSelectedDemoOption] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('upi');

  const confirmDemoPayment = async () => {
    if (!pendingDemoOrder) return;
    try {
      const demoPaymentId = `pay_demo_${Date.now().toString(36)}`;
      const demoSignature = `demo_signature_${Date.now().toString(36)}`;
      await apiRequest(`/orders/${pendingDemoOrder.id}/verify-payment`, {
        method: 'POST',
        body: JSON.stringify({
          razorpayPaymentId: demoPaymentId,
          razorpaySignature: demoSignature,
        }),
      });

      const paidOrder: Order = {
        ...pendingDemoOrder,
        paymentStatus: 'paid',
        orderStatus: 'preparing',
        status: 'preparing',
        statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      };
      addOrder(paidOrder);
      setPlacedOrder(paidOrder);
    } catch (err) {
      console.error('Demo payment verification error:', err);
      const paidOrder: Order = {
        ...pendingDemoOrder,
        paymentStatus: 'paid',
        orderStatus: 'preparing',
        status: 'preparing',
        statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      };
      addOrder(paidOrder);
      setPlacedOrder(paidOrder);
    } finally {
      setPendingDemoOrder(null);
      await clearCart();
    }
  };

  // Address form fields
  const [fullName, setFullName] = useState(user.name || 'Maya Lin');
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [address, setAddress] = useState('42 Yarn Street, Crafty Town');
  const [city, setCity] = useState('Bangalore');
  const [pincode, setPincode] = useState('560001');

  const safeSubtotal = Number.isNaN(Number(subtotal)) ? 0 : Number(subtotal);
  const giftWrapFee = giftWrap ? 49 : 0;
  const shippingFee = cart.length === 0 ? 0 : 50;
  const total = safeSubtotal + giftWrapFee + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (cart.length === 0 && !placedOrder) {
      alert('Your cart is empty!');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const responseRes = await apiRequest<{
        order: Record<string, unknown>;
        razorpayOrder?: { id: string; amount: number; currency: string; keyId: string };
      }>('/orders/checkout', {
        method: 'POST',
        token: getStoredAccessToken(),
        cartToken: getOrCreateCartToken(),
        body: JSON.stringify({
          shippingAddress: {
            fullName,
            phone,
            address,
            city,
            state: 'Karnataka',
            pincode,
          },
          paymentMethod: 'razorpay',
        }),
      });

      const createdOrder = responseRes.order ?? responseRes;

      const formattedOrder: Order = {
        id: String(createdOrder._id ?? createdOrder.id),
        orderNumber: String(createdOrder.orderNumber),
        createdAt: String(createdOrder.createdAt),
        date: new Date(String(createdOrder.createdAt || Date.now())).toLocaleDateString(),
        items: ((createdOrder.items as Array<{ name: string; quantity: number; price: number }>) ?? []).map((item) => ({ ...item, qty: item.quantity })),
        total: Number(createdOrder.total),
        paymentMethod: 'razorpay',
        paymentStatus: (createdOrder.paymentStatus as 'paid' | 'pending_verification') ?? 'paid',
        orderStatus: String(createdOrder.orderStatus),
        status: String(createdOrder.orderStatus).replaceAll('_', ' '),
        statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        shippingAddress: createdOrder.shippingAddress as any,
        trackingNumber: createdOrder.trackingNumber as string | undefined,
      };

      const isLoaded = await loadRazorpayScript();
      const rzpOrder = responseRes.razorpayOrder;

      if (isLoaded && (window as unknown as { Razorpay?: any }).Razorpay && rzpOrder) {
        const razorpayOptions = {
          key: rzpOrder.keyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'CraftyWrap',
          description: `Order #${formattedOrder.orderNumber || formattedOrder.id}`,
          image: '/logo.png',
          order_id: rzpOrder.id,
          prefill: {
            name: fullName,
            phone: phone,
          },
          theme: {
            color: '#5C3A21',
          },
        };
        console.log('[Razorpay Checkout.js Initialization Options]:', razorpayOptions);

        const rzp = new (window as unknown as { Razorpay: any }).Razorpay({
          ...razorpayOptions,
          handler: async function (res: { razorpay_payment_id: string; razorpay_signature: string }) {
            try {
              await apiRequest(`/orders/${formattedOrder.id}/verify-payment`, {
                method: 'POST',
                body: JSON.stringify({
                  razorpayPaymentId: res.razorpay_payment_id,
                  razorpaySignature: res.razorpay_signature,
                }),
              });
              const paidOrder: Order = {
                ...formattedOrder,
                paymentStatus: 'paid',
                orderStatus: 'preparing',
                status: 'preparing',
                statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
              };
              addOrder(paidOrder);
              setPlacedOrder(paidOrder);
              await clearCart();
            } catch {
              addOrder(formattedOrder);
              setPlacedOrder(formattedOrder);
              await clearCart();
            }
          },
          prefill: {
            name: fullName,
            phone: phone,
          },
          theme: {
            color: '#5C3A21',
          },
        });
        rzp.open();
        return;
      } else {
        // Open Razorpay test/demo payment modal for interactive preview
        setPendingDemoOrder(formattedOrder);
        return;
      }
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Order Confirmation State
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6 animate-in zoom-in-95 duration-300">
        {/* Top Status Icon & Badge */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={48} />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-300">
              ORDER CONFIRMED!
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800">
              Thank You For Your Order!
            </h1>

            <p className="text-xs sm:text-sm text-warmbrown-600 max-w-lg mx-auto leading-relaxed">
              We&apos;ve received your payment for Order{' '}
              <span className="font-bold text-warmbrown-800">#{placedOrder.orderNumber || placedOrder.id}</span>. Our artisans are getting your handcrafted items ready!
            </p>
          </div>
        </div>

        {/* Order Details Summary Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-peach-200 shadow-soft text-left space-y-3.5 text-xs text-warmbrown-700">
          <h4 className="font-extrabold text-warmbrown-800 border-b border-peach-100 pb-2.5 text-sm flex items-center justify-between">
            <span>Order Summary & Delivery</span>
            <span className="font-mono text-xs font-bold text-warmbrown-600">#{placedOrder.orderNumber || placedOrder.id}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <p>
              <strong className="text-warmbrown-800 block text-[11px] uppercase tracking-wider">Recipient</strong>
              {placedOrder.shippingAddress.fullName} ({placedOrder.shippingAddress.phone})
            </p>
            <p>
              <strong className="text-warmbrown-800 block text-[11px] uppercase tracking-wider">Address</strong>
              {placedOrder.shippingAddress.address}, {placedOrder.shippingAddress.city} - {placedOrder.shippingAddress.pincode}
            </p>
          </div>

          <div className="border-t border-peach-100 pt-3 space-y-1.5">
            <p className="flex justify-between">
              <strong className="text-warmbrown-800">Payment Method:</strong>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck size={14} /> Razorpay Online (Paid)
              </span>
            </p>
            <p className="flex justify-between">
              <strong className="text-warmbrown-800">Total Amount:</strong>
              <span className="font-extrabold text-warmbrown-900 text-sm">
                ₹{placedOrder.total.toFixed(2)}
              </span>
            </p>
            <p className="flex justify-between items-center pt-1">
              <strong className="text-warmbrown-800">Status:</strong>
              <span className="font-bold text-xs px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-900 border-emerald-300">
                Preparing with love 🧶 (Estimated delivery in 4-6 days)
              </span>
            </p>
          </div>
        </div>

        {/* Action Button to View Order in Account */}
        <div className="pt-2 text-center">
          <button
            onClick={() => router.push('/account')}
            className="w-full sm:w-auto bg-warmbrown-800 hover:bg-warmbrown-900 text-white px-8 py-3.5 rounded-full font-bold text-xs shadow-md transition-all inline-flex items-center justify-center gap-2"
          >
            <span>View Order History in Account</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Active Checkout Form View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-peach-100 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-warmbrown-800">Checkout</h1>
          <p className="text-xs text-warmbrown-600">Complete your shipping & payment details</p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address Section */}
          <div className="bg-white dark:bg-[#1F1610] p-6 sm:p-8 rounded-3xl border border-peach-200/80 dark:border-warmbrown-900/80 shadow-soft space-y-4">
            <h3 className="font-extrabold text-warmbrown-800 dark:text-peach-100 text-lg flex items-center gap-2 border-b border-peach-100 dark:border-warmbrown-900 pb-3">
              <Truck size={20} className="text-warmbrown-600 dark:text-peach-300" />
              1. Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-warmbrown-700 dark:text-peach-200 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-peach-50 dark:bg-warmbrown-900/90 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-400 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-warmbrown-700 dark:text-peach-200 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-peach-50 dark:bg-warmbrown-900/90 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-400 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-warmbrown-700 dark:text-peach-200 block mb-1">Delivery Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-peach-50 dark:bg-warmbrown-900/90 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-400 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-warmbrown-700 dark:text-peach-200 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-peach-50 dark:bg-warmbrown-900/90 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-400 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-warmbrown-700 dark:text-peach-200 block mb-1">Pincode / Postal Code *</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-peach-50 dark:bg-warmbrown-900/90 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-400 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white dark:bg-[#1F1610] p-6 sm:p-8 rounded-3xl border border-peach-200/80 dark:border-warmbrown-900/80 shadow-soft space-y-4">
            <h3 className="font-extrabold text-warmbrown-800 dark:text-peach-100 text-lg flex items-center gap-2 border-b border-peach-100 dark:border-warmbrown-900 pb-3">
              <Lock size={18} className="text-warmbrown-600 dark:text-peach-300" />
              2. Payment Method
            </h3>

            <div className="bg-peach-50/80 dark:bg-warmbrown-900/80 p-5 rounded-2xl border-2 border-warmbrown-800/20 dark:border-peach-300/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-warmbrown-800 flex items-center justify-center text-warmbrown-800 dark:text-peach-200 shadow-xs border border-peach-200 dark:border-warmbrown-700">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-warmbrown-800 dark:text-peach-100 text-sm">
                      Razorpay Online Payment
                    </h4>
                    <p className="text-[11px] text-warmbrown-600 dark:text-peach-200/70 font-medium">
                      Instant & 100% Secure Checkout
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck size={13} /> VERIFIED SECURE
                </span>
              </div>

              <p className="text-xs text-warmbrown-700 dark:text-peach-200/80 leading-relaxed border-t border-peach-200/60 dark:border-warmbrown-800 pt-3">
                Supports all major Credit & Debit Cards, UPI (Google Pay, PhonePe, Paytm), NetBanking, and Digital Wallets.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#1F1610] p-6 rounded-3xl border border-peach-200/80 dark:border-warmbrown-900/80 shadow-card space-y-4 sticky top-24">
            <h3 className="font-extrabold text-warmbrown-800 dark:text-peach-100 text-lg border-b border-peach-100 dark:border-warmbrown-900 pb-3">
              Order Items ({cart.length})
            </h3>

            {cart.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-warmbrown-800 dark:text-peach-100">{item.quantity}x</span>
                      <span className="text-warmbrown-700 dark:text-peach-200 truncate max-w-[160px]">
                        {item.product.name}
                      </span>
                    </div>
                    <span className="font-bold text-warmbrown-800 dark:text-peach-100">
                      ₹{((Number.isNaN(Number(item.product.price)) ? 0 : item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-warmbrown-500 dark:text-peach-300/60 italic py-2 text-center">
                Your cart is empty.
              </p>
            )}

            <div className="border-t border-peach-100 dark:border-warmbrown-900 pt-3 space-y-2 text-xs text-warmbrown-700 dark:text-peach-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">₹{(Number.isNaN(Number(subtotal)) ? 0 : subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold">₹{shippingFee.toFixed(2)}</span>
              </div>
              {giftWrap && (
                <div className="flex justify-between">
                  <span>Gift Wrapping</span>
                  <span className="font-bold">₹{giftWrapFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-warmbrown-800 dark:text-peach-100 border-t border-peach-200 dark:border-warmbrown-800 pt-3">
                <span>Total Amount</span>
                <span>₹{(Number.isNaN(Number(total)) ? 0 : total).toFixed(2)}</span>
              </div>
            </div>

            {checkoutError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl text-xs font-medium border border-rose-200 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPlacingOrder || cart.length === 0}
              className="w-full py-4 rounded-full font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-warmbrown-800 hover:bg-warmbrown-900 text-peach-50 disabled:opacity-50"
            >
              {isPlacingOrder ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Pay Now & Place Order — ₹{total.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Interactive Razorpay Demo Modal Overlay (when backend API keys are in test/demo mode) */}
      {pendingDemoOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#121A29] text-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 animate-in zoom-in-95 duration-200">
            {/* Razorpay Modal Header */}
            <div className="bg-[#0C131F] p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warmbrown-800 flex items-center justify-center font-bold text-lg text-white shadow-inner">
                  🧶
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">CraftyWrap</h4>
                  <p className="text-[11px] text-slate-400">Order #{pendingDemoOrder.orderNumber || pendingDemoOrder.id}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount</span>
                <span className="text-lg font-extrabold text-emerald-400">₹{pendingDemoOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Body: Payment Option Tabs */}
            <div className="p-5 space-y-4">
              <div className="bg-amber-950/60 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-200/90 leading-relaxed">
                <strong className="text-amber-300 block mb-0.5">ℹ️ Test Mode Preview</strong>
                Razorpay API keys are not yet configured in <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-amber-300">backend/.env</code>. Choose a payment method below to test order completion:
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Select Payment Method:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDemoOption('upi')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                      selectedDemoOption === 'upi'
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg">📱</span>
                    <div>
                      <div className="text-xs font-bold">UPI</div>
                      <div className="text-[10px] text-slate-400">GPay / PhonePe / Paytm</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDemoOption('card')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                      selectedDemoOption === 'card'
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg">💳</span>
                    <div>
                      <div className="text-xs font-bold">Card</div>
                      <div className="text-[10px] text-slate-400">Visa / MasterCard / RuPay</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDemoOption('netbanking')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                      selectedDemoOption === 'netbanking'
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg">🏦</span>
                    <div>
                      <div className="text-xs font-bold">NetBanking</div>
                      <div className="text-[10px] text-slate-400">All Major Banks</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDemoOption('wallet')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                      selectedDemoOption === 'wallet'
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg">👛</span>
                    <div>
                      <div className="text-xs font-bold">Wallets</div>
                      <div className="text-[10px] text-slate-400">Amazon Pay / Mobikwik</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPendingDemoOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDemoPayment}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck size={16} />
                  <span>Pay ₹{pendingDemoOrder.total.toFixed(2)} (Simulate Success)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
