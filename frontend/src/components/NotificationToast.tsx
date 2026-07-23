'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Heart, CheckCircle2, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notification, setNotification } = useCart();

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="bg-warmbrown-800 text-peach-50 px-5 py-3.5 rounded-2xl shadow-2xl border border-warmbrown-600/30 flex items-center gap-3 max-w-md">
        <div className="w-8 h-8 rounded-full bg-peach-300/20 text-peach-300 flex items-center justify-center shrink-0">
          <Heart size={18} className="fill-peach-300 text-peach-300" />
        </div>
        <p className="text-sm font-medium pr-2 text-peach-100">{notification}</p>
        <button
          onClick={() => setNotification(null)}
          className="text-peach-200/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all duration-300 group"
          title="Close notification"
        >
          <X size={16} className="transition-transform duration-500 group-hover:rotate-180" />
        </button>
      </div>
    </div>
  );
};
