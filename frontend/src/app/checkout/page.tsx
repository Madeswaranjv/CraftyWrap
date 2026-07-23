'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function CheckoutPage() {
  const { cart, subtotal, giftWrap, clearCart } = useCart();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'upi'>('online');
  const [upiCopied, setUpiCopied] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Address form fields
  const [fullName, setFullName] = useState('Maya Lin');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('42 Yarn Street, Crafty Town');
  const [city, setCity] = useState('Bangalore');
  const [pincode, setPincode] = useState('560001');

  const giftWrapFee = giftWrap ? 4.99 : 0;
  const shippingFee = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + giftWrapFee + shippingFee;

  const copyUpiId = () => {
    navigator.clipboard.writeText('craftywrap@upi');
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2500);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);
    setTimeout(() => {
      setIsPlacingOrder(false);
      setOrderPlaced(true);
      clearCart();
    }, 1500);
  };

  if (orderPlaced) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-5xl shadow-inner">
          <CheckCircle2 size={56} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
            Order Confirmed!
          </span>
          <h1 className="text-3xl font-extrabold text-warmbrown-800">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-warmbrown-600">
            Order ID: <span className="font-bold text-warmbrown-800">#CW-89421</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-peach-200 shadow-soft text-left space-y-3 text-xs text-warmbrown-700">
          <h4 className="font-bold text-warmbrown-800 border-b border-peach-100 pb-2 text-sm">
            Shipping Confirmation Details
          </h4>
          <p><strong>Deliver to:</strong> {fullName}</p>
          <p><strong>Address:</strong> {address}, {city} - {pincode}</p>
          <p><strong>Payment Method:</strong> {paymentMethod === 'online' ? 'Razorpay Online' : 'UPI Instant'}</p>
          <p className="text-emerald-700 font-bold">Status: Preparing with love 🧶 (Estimated delivery in 4-6 days)</p>
        </div>

        <button
          onClick={() => router.push('/account')}
          className="bg-warmbrown-800 hover:bg-warmbrown-900 text-white px-8 py-3.5 rounded-full font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
        >
          <span>View Order History in Account</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-peach-100 pb-4">
        <h1 className="text-3xl font-extrabold text-warmbrown-800">Checkout</h1>
        <p className="text-xs text-warmbrown-600">Complete your shipping & payment details</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shipping Address & Payment Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-peach-200/80 shadow-soft space-y-4">
            <h3 className="font-extrabold text-warmbrown-800 text-lg flex items-center gap-2 border-b border-peach-100 pb-3">
              <Truck size={20} className="text-warmbrown-600" />
              1. Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-warmbrown-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-peach-50 border border-peach-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-warmbrown-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-warmbrown-700 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-peach-50 border border-peach-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-warmbrown-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-warmbrown-700 block mb-1">Delivery Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-peach-50 border border-peach-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-warmbrown-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-warmbrown-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-peach-50 border border-peach-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-warmbrown-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-warmbrown-700 block mb-1">Pincode / Postal Code *</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-peach-50 border border-peach-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-warmbrown-600"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-peach-200/80 shadow-soft space-y-4">
            <h3 className="font-extrabold text-warmbrown-800 text-lg flex items-center gap-2 border-b border-peach-100 pb-3">
              <Lock size={18} className="text-warmbrown-600" />
              2. Payment Method
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 ${
                  paymentMethod === 'online'
                    ? 'border-warmbrown-800 bg-peach-50/70 shadow-sm'
                    : 'border-peach-200 hover:border-peach-300 bg-white'
                }`}
              >
                <CreditCard size={22} className={paymentMethod === 'online' ? 'text-warmbrown-800' : 'text-warmbrown-400'} />
                <div>
                  <span className="font-bold text-warmbrown-800 text-xs block">Pay Online</span>
                  <span className="text-[10px] text-warmbrown-500">Razorpay / Cards / Wallets</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 ${
                  paymentMethod === 'upi'
                    ? 'border-warmbrown-800 bg-peach-50/70 shadow-sm'
                    : 'border-peach-200 hover:border-peach-300 bg-white'
                }`}
              >
                <QrCode size={22} className={paymentMethod === 'upi' ? 'text-warmbrown-800' : 'text-warmbrown-400'} />
                <div>
                  <span className="font-bold text-warmbrown-800 text-xs block">Pay via UPI</span>
                  <span className="text-[10px] text-warmbrown-500">GPay, PhonePe, Paytm QR</span>
                </div>
              </button>
            </div>

            {/* Payment Method Details Panel */}
            {paymentMethod === 'online' ? (
              <div className="bg-peach-50 p-4 rounded-2xl border border-peach-200 text-xs text-warmbrown-700 space-y-2">
                <p className="font-bold text-warmbrown-800 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Razorpay Secure Gateway Stub
                </p>
                <p className="text-[11px] leading-relaxed">
                  Clicking &quot;Place Order&quot; simulates a successful online payment checkout token generation.
                </p>
              </div>
            ) : (
              <div className="bg-peach-50 p-5 rounded-2xl border border-peach-200 space-y-4 text-center">
                <span className="text-xs font-bold text-warmbrown-800 block uppercase tracking-wider">
                  Scan QR Code or Copy UPI ID
                </span>

                {/* QR Code Placeholder Canvas */}
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border-2 border-warmbrown-700 shadow-md flex flex-col items-center justify-center space-y-1">
                  <QrCode size={90} className="text-warmbrown-900" />
                  <span className="text-[9px] font-extrabold text-warmbrown-800 uppercase tracking-widest">
                    CraftyWrap
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className="bg-white px-3 py-1.5 rounded-lg border border-peach-300 text-xs font-bold text-warmbrown-800">
                    craftywrap@upi
                  </span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="bg-warmbrown-800 hover:bg-warmbrown-900 text-white p-1.5 rounded-lg text-xs transition-colors"
                    title="Copy UPI ID"
                  >
                    {upiCopied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-peach-200/80 shadow-card space-y-4">
            <h3 className="font-extrabold text-warmbrown-800 text-lg border-b border-peach-100 pb-3">
              Order Items ({cart.length})
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-warmbrown-800">{item.quantity}x</span>
                    <span className="text-warmbrown-700 truncate max-w-[160px]">{item.product.name}</span>
                  </div>
                  <span className="font-bold text-warmbrown-800">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-peach-100 pt-3 space-y-2 text-xs text-warmbrown-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold">{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              {giftWrap && (
                <div className="flex justify-between">
                  <span>Gift Wrapping</span>
                  <span className="font-bold">${giftWrapFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-warmbrown-800 border-t border-peach-200 pt-3">
                <span>Total Amount</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPlacingOrder}
              className="w-full bg-warmbrown-800 hover:bg-warmbrown-900 text-peach-50 py-4 rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPlacingOrder ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Place Order — ${total.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
