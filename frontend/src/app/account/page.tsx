'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ExternalLink,
} from 'lucide-react';

export default function AccountPage() {
  const { user, logout } = useCart();
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<string | null>(null);

  // Mock order history dataset
  const orders = [
    {
      id: 'CW-89421',
      date: '2026-07-20',
      status: 'Preparing with Love',
      statusColor: 'bg-amber-100 text-amber-900 border-amber-300',
      total: 58.49,
      items: [
        { name: 'Whiskers the Calico Kitten', qty: 1, price: 34.99 },
        { name: 'Sammy the Sweet Strawberry', qty: 1, price: 18.50 },
      ],
      trackingNumber: 'TRK-98230192',
    },
    {
      id: 'CW-76102',
      date: '2026-06-12',
      status: 'Delivered',
      statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      total: 38.00,
      items: [
        { name: 'Sparkle Star Unicorn', qty: 1, price: 38.00 },
      ],
      trackingNumber: 'TRK-44109281',
    },
  ];

  const addresses = [
    {
      id: 1,
      type: 'Home (Default)',
      name: user.isLoggedIn ? user.name : 'Maya Lin',
      address: '42 Yarn Street, Crafty Town',
      city: 'Bangalore, Karnataka - 560001',
      phone: '+91 98765 43210',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-peach-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-peach-200 border-2 border-peach-300 flex items-center justify-center text-warmbrown-800 text-2xl font-bold overflow-hidden shrink-0 shadow-sm">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={28} />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-warmbrown-800">
                {user.isLoggedIn ? user.name : 'Maya Lin (Demo Account)'}
              </h1>
              <span className="bg-peach-100 text-warmbrown-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-peach-200">
                Crafty VIP
              </span>
            </div>
            <p className="text-xs text-warmbrown-600">
              {user.isLoggedIn ? user.email : 'maya.crafty@gmail.com'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/custom-order"
            className="flex-1 sm:flex-none bg-peach-100 hover:bg-peach-200 text-warmbrown-900 px-4 py-2.5 rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-peach-300"
          >
            <Wand2 size={14} className="text-peach-600" />
            <span>Custom Order Request</span>
          </Link>

          {user.isLoggedIn && (
            <button
              onClick={logout}
              className="p-2.5 text-warmbrown-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors border border-peach-200"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Account Tabs / Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-peach-200/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-peach-100 pb-4">
              <h2 className="text-xl font-extrabold text-warmbrown-800 flex items-center gap-2">
                <Package size={22} className="text-warmbrown-700" />
                Order History & Status
              </h2>
              <span className="text-xs text-warmbrown-500 font-medium">
                Showing {orders.length} orders
              </span>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-peach-200 rounded-2xl p-5 hover:border-warmbrown-400 transition-all space-y-3 bg-peach-50/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-peach-100 pb-3 text-xs">
                    <div>
                      <span className="font-bold text-warmbrown-800 text-sm">{order.id}</span>
                      <span className="text-warmbrown-500 ml-2">Placed on {order.date}</span>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full font-bold border text-[11px] self-start sm:self-auto ${order.statusColor}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Items Summary */}
                  <div className="space-y-1.5 text-xs text-warmbrown-700">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.qty}x {item.name}</span>
                        <span className="font-bold">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-peach-100 text-xs">
                    <span className="font-bold text-warmbrown-800">Total: ${order.total.toFixed(2)}</span>

                    <button
                      onClick={() =>
                        setSelectedOrderDetails(
                          selectedOrderDetails === order.id ? null : order.id
                        )
                      }
                      className="text-warmbrown-700 hover:text-warmbrown-900 font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>{selectedOrderDetails === order.id ? 'Hide Details' : 'View Details'}</span>
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${
                          selectedOrderDetails === order.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Expanded Details Panel */}
                  {selectedOrderDetails === order.id && (
                    <div className="bg-white p-4 rounded-xl border border-peach-200 text-xs space-y-2 mt-2 animate-in fade-in duration-200">
                      <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                      <p><strong>Package Type:</strong> CraftyWrap Eco Padded Gift Box with Birth Tags</p>
                      <p>
                        <strong>Direct Support:</strong>{' '}
                        <a
                          href={`https://wa.me/919363515015?text=${encodeURIComponent(`Hi CraftyWrap! I need an update on Order ${order.id}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <WhatsAppLogo size={14} className="text-emerald-600" />
                          <span>Message us on WhatsApp (+91 93635 15015)</span>
                        </a>{' '}
                        with Order ID <strong>{order.id}</strong> for live photo updates.
                      </p>
                    </div>
                  )}
                </div>
              ))}
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

            {addresses.map((addr) => (
              <div key={addr.id} className="p-4 rounded-2xl bg-peach-50/80 border border-peach-200 space-y-1 text-xs text-warmbrown-700">
                <span className="font-bold text-warmbrown-800 block text-xs">{addr.type}</span>
                <p className="font-semibold text-warmbrown-800">{addr.name}</p>
                <p>{addr.address}</p>
                <p>{addr.city}</p>
                <p className="text-warmbrown-500 font-mono pt-1">{addr.phone}</p>
              </div>
            ))}

            <button className="w-full bg-peach-100 hover:bg-peach-200 text-warmbrown-800 py-2.5 rounded-full text-xs font-bold transition-colors border border-peach-300">
              + Add New Delivery Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
