'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { WhatsAppLogo } from '@/components/SocialIcons';
import {
  User,
  Package,
  MapPin,
  Clock,
  ChevronRight,
  LogOut,
  ShoppingBag,
  CheckCircle2,
  Truck,
  Wand2,
  QrCode,
  CreditCard,
  AlertTriangle,
  Edit2,
  Check,
  X,
  ShieldAlert,
  Calendar,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import TrackingTimeline from '@/components/ui/tracking-timeline';
import {
  buildOrderTimelineItems,
  calculateEstimatedDeliveryDate,
  formatExactDeliveryDay,
} from '@/lib/orderTimeline';

export default function AccountPage() {
  const { user, logout, orders, updateProfile, authLoading } = useCart();
  const router = useRouter();
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Address Add State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newFullName, setNewFullName] = useState(user.name || '');
  const [newPhone, setNewPhone] = useState(user.phone || '');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');

  useEffect(() => {
    if (!authLoading && !user.isLoggedIn) {
      router.push('/login');
    }
  }, [authLoading, user.isLoggedIn, router]);

  useEffect(() => {
    if (user.isLoggedIn) {
      setEditName(user.name);
      setEditPhone(user.phone || '');
      setNewFullName(user.name);
      setNewPhone(user.phone || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
      });
      setIsEditingProfile(false);
    } catch {
      // Handled in context notification
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const addressItem = {
      label: newLabel,
      fullName: newFullName,
      phone: newPhone,
      address: newAddress,
      city: newCity,
      state: newState || 'Karnataka',
      pincode: newPincode,
      isDefault: user.addresses.length === 0,
    };
    await updateProfile({ addresses: [...user.addresses, addressItem] });
    setShowAddAddress(false);
    setNewAddress('');
    setNewCity('');
    setNewPincode('');
  };

  const addresses = user.addresses;

  if (authLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-warmbrown-600 font-bold">Loading account profile…</div>;
  }

  if (!user.isLoggedIn) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-peach-200/80 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-peach-200 border-2 border-peach-300 flex items-center justify-center text-warmbrown-800 text-2xl font-bold overflow-hidden shrink-0 shadow-sm relative">
              <User size={28} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-warmbrown-800">
                  {user.name}
                </h1>
                <span className="bg-peach-100 text-warmbrown-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-peach-200">
                  {user.role === 'admin' ? 'Store Admin' : 'Crafty VIP'}
                </span>
              </div>
              <p className="text-xs text-warmbrown-600 font-medium">
                {user.email} {user.phone ? `• ${user.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="bg-warmbrown-800 hover:bg-warmbrown-900 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <ShieldAlert size={14} /> Open Admin Console
              </Link>
            )}
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="bg-peach-100 hover:bg-peach-200 text-warmbrown-900 px-4 py-2.5 rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-peach-300"
            >
              <Edit2 size={14} className="text-warmbrown-700" />
              <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="bg-warmbrown-800 hover:bg-warmbrown-900 text-white px-4 py-2.5 rounded-full text-xs font-bold transition-colors shadow-xs"
              >
                Admin Panel
              </Link>
            )}

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="p-2.5 text-warmbrown-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors border border-peach-200"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Inline Profile Edit Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="pt-4 border-t border-peach-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-warmbrown-800 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-peach-50 border border-peach-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-warmbrown-800 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-peach-50 border border-peach-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="bg-warmbrown-800 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-warmbrown-900 shadow-xs"
              >
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Account Tabs / Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#1F1610] p-6 sm:p-8 rounded-3xl border border-peach-200/80 dark:border-warmbrown-900/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-peach-100 dark:border-warmbrown-900 pb-4">
              <h2 className="text-xl font-extrabold text-warmbrown-800 flex items-center gap-2">
                <Package size={22} className="text-warmbrown-700" />
                Order History & Status
              </h2>
              <span className="text-xs text-warmbrown-500 font-medium">
                Showing {orders.length} orders
              </span>
            </div>

            <div className="space-y-4">
              {orders.map((order) => {
                const isPendingVerification = order.paymentStatus === 'pending_verification';

                return (
                  <div
                    key={order.id}
                    className={`border rounded-2xl p-5 transition-all space-y-3 ${
                      isPendingVerification
                        ? 'border-amber-300 bg-amber-50/40 hover:border-amber-400'
                        : 'border-peach-200 bg-peach-50/40 hover:border-warmbrown-400'
                    }`}
                  >
                    {(() => {
                      const timelineItems = buildOrderTimelineItems(order);
                      const estDeliveryDate = calculateEstimatedDeliveryDate(order);
                      const exactDeliveryDayStr = formatExactDeliveryDay(estDeliveryDate);
                      const isDelivered = order.orderStatus === 'delivered';
                      const isShipped = order.orderStatus === 'shipped';

                      return (
                        <>
                          {/* Header line with status badge */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-peach-100 pb-3 text-xs">
                            <div>
                              <span className="font-bold text-warmbrown-800 text-sm">#{order.orderNumber || order.id}</span>
                              <span className="text-warmbrown-500 ml-2">Placed on {order.date}</span>
                            </div>

                            {/* Distinct Status Badges */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border text-[11px] self-start sm:self-auto ${order.statusColor}`}
                            >
                              {isPendingVerification ? (
                                <>
                                  <Clock size={13} className="text-amber-700" />
                                  <span>Payment Pending Verification</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={13} className="text-emerald-700" />
                                  <span>{order.status}</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* EXACT DELIVERY DAY BANNER */}
                          <div className="bg-gradient-to-r from-peach-100/90 via-peach-50 to-peach-100/90 border border-peach-300/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-warmbrown-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                                <Truck size={20} className="text-peach-200" />
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wider font-extrabold text-warmbrown-600">
                                  {isDelivered ? 'Order Delivered On' : 'Expected Delivery Day'}
                                </div>
                                <div className="text-sm sm:text-base font-extrabold text-warmbrown-900 flex items-center gap-1.5">
                                  <Calendar size={15} className="text-warmbrown-700 shrink-0" />
                                  <span>{exactDeliveryDayStr}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isShipped && (
                                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 inline-flex items-center gap-1 animate-pulse">
                                  <Truck size={12} /> Out for Delivery
                                </span>
                              )}
                              {isDelivered && (
                                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Delivered
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Items Summary */}
                          <div className="space-y-1.5 text-xs text-warmbrown-700 pt-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>
                                  {item.qty}x {item.name}
                                </span>
                                <span className="font-bold">₹{(item.price * item.qty).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-peach-100 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-warmbrown-800">
                                Total: ₹{order.total.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-warmbrown-500">
                                ({order.paymentMethod === 'razorpay' ? 'Razorpay' : 'UPI Manual'})
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                setSelectedOrderDetails(
                                  selectedOrderDetails === order.id ? null : order.id
                                )
                              }
                              className="text-warmbrown-700 hover:text-warmbrown-900 font-bold flex items-center gap-1 hover:underline"
                            >
                              <span>
                                {selectedOrderDetails === order.id ? 'Hide Details & Timeline' : 'View Details & Timeline'}
                              </span>
                              <ChevronRight
                                size={14}
                                className={`transition-transform ${
                                  selectedOrderDetails === order.id ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                          </div>

                          {/* Expanded Details & Animated Tracking Timeline Panel */}
                          {selectedOrderDetails === order.id && (
                            <div className="bg-white p-5 rounded-2xl border border-peach-200 text-xs space-y-5 mt-3 animate-in fade-in duration-200 shadow-xs">
                              {/* Animated Tracking Timeline Component */}
                              <div className="bg-peach-50/50 rounded-2xl border border-peach-200/90 p-4 sm:p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-peach-200/80 pb-3">
                                  <h4 className="font-extrabold text-warmbrown-900 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles size={14} className="text-amber-600" />
                                    Handcrafted Order Journey
                                  </h4>
                                  <span className="text-[11px] text-warmbrown-600 font-medium">
                                    Arriving: <strong className="text-warmbrown-900">{exactDeliveryDayStr}</strong>
                                  </span>
                                </div>

                                <TrackingTimeline items={timelineItems} className="pt-2" />

                                {/* Out for Delivery Real Tracking Information */}
                                {order.trackingNumber ? (
                                  <div className="mt-4 p-3.5 bg-white border border-peach-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] font-bold text-warmbrown-500 uppercase tracking-wider block">
                                        Courier Partner & Real Tracking
                                      </span>
                                      <p className="font-extrabold text-warmbrown-900 text-xs">
                                        {order.courierPartner || 'Direct Courier'} • AWB: <span className="font-mono text-warmbrown-800">{order.trackingNumber}</span>
                                      </p>
                                    </div>
                                    {order.trackingUrl ? (
                                      <a
                                        href={order.trackingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-warmbrown-800 hover:bg-warmbrown-900 text-white font-bold px-3.5 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
                                      >
                                        <span>Live Courier Tracking</span>
                                        <ExternalLink size={12} />
                                      </a>
                                    ) : (
                                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                        Dispatched
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-warmbrown-600 bg-white/60 p-2.5 rounded-xl border border-peach-100 flex items-center gap-2">
                                    <Clock size={13} className="text-warmbrown-500 shrink-0" />
                                    <span>Real courier tracking number will appear as soon as the order is dispatched for delivery.</span>
                                  </div>
                                )}
                              </div>

                              {isPendingVerification && (
                                <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300 text-amber-900 space-y-1">
                                  <p className="font-bold flex items-center gap-1.5">
                                    <AlertTriangle size={14} className="text-amber-700" />
                                    UPI Payment Awaiting Manual Family Verification
                                  </p>
                                  <p className="text-[11px] text-amber-800">
                                    Please allow up to a few hours for CraftyWrap to verify your UPI transfer. Preparation starts immediately upon verification.
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-warmbrown-700 pt-2 border-t border-peach-100">
                                <p>
                                  <strong>Payment Method:</strong>{' '}
                                  {order.paymentMethod === 'razorpay'
                                    ? 'Razorpay Online (Paid)'
                                    : 'UPI (craftywrap@upi)'}
                                </p>
                                <p>
                                  <strong>Payment Status:</strong>{' '}
                                  <span
                                    className={
                                      isPendingVerification
                                        ? 'text-amber-800 font-bold'
                                        : 'text-emerald-700 font-bold'
                                    }
                                  >
                                    {isPendingVerification ? 'Pending Verification' : 'Verified Paid'}
                                  </span>
                                </p>
                                <p>
                                  <strong>Tracking Number:</strong>{' '}
                                  {order.trackingNumber ? (
                                    <span className="font-mono font-bold text-warmbrown-900">{order.trackingNumber}</span>
                                  ) : (
                                    'Pending Dispatch'
                                  )}
                                </p>
                                <p>
                                  <strong>Recipient:</strong> {order.shippingAddress.fullName} (
                                  {order.shippingAddress.city})
                                </p>
                              </div>

                              <p className="text-warmbrown-700 pt-2 border-t border-peach-100">
                                <strong>Direct Support:</strong>{' '}
                                <a
                                  href={`https://wa.me/919363515015?text=${encodeURIComponent(
                                    `Hi CraftyWrap! I am checking on Order #${order.id}`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-warmbrown-800 dark:text-peach-200 font-bold hover:underline inline-flex items-center gap-1 ml-1"
                                >
                                  <WhatsAppLogo size={14} className="text-warmbrown-800 dark:text-peach-200" />
                                  <span>Message us on WhatsApp (+91 93635 15015)</span>
                                </a>{' '}
                                with Order ID <strong>#{order.id}</strong>.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Saved Delivery Addresses */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-peach-200/80 shadow-soft space-y-4">
            <h3 className="font-extrabold text-warmbrown-800 text-base flex items-center gap-2 border-b border-peach-100 pb-3">
              <MapPin size={18} className="text-warmbrown-700" />
              Saved Addresses
            </h3>

            {addresses.map((addr, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-peach-50/80 border border-peach-200 space-y-1 text-xs text-warmbrown-700 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-warmbrown-800 block text-xs">{addr.label || 'Saved Address'}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="font-semibold text-warmbrown-800">{addr.fullName}</p>
                <p>{addr.address}</p>
                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-warmbrown-500 font-mono pt-1">{addr.phone}</p>
              </div>
            ))}

            {showAddAddress ? (
              <form onSubmit={handleAddAddressSubmit} className="space-y-3 pt-2 border-t border-peach-100">
                <h4 className="font-bold text-warmbrown-800 text-xs uppercase">New Delivery Address</h4>
                <input
                  type="text"
                  placeholder="Address Label (e.g. Home, Office)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full bg-peach-50 border border-peach-200 rounded-xl p-2.5 text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-peach-50 border border-peach-200 rounded-xl p-2.5 text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-peach-50 border border-peach-200 rounded-xl p-2.5 text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-peach-50 border border-peach-200 rounded-xl p-2.5 text-xs outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-peach-50 border border-peach-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    required
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-full bg-peach-50 border border-peach-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-warmbrown-800 text-white py-2 rounded-xl text-xs font-bold hover:bg-warmbrown-900"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-3 bg-peach-100 text-warmbrown-800 py-2 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddAddress(true)}
                className="w-full bg-peach-100 hover:bg-peach-200 text-warmbrown-800 py-2.5 rounded-full text-xs font-bold transition-colors border border-peach-300"
              >
                + Add New Delivery Address
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
