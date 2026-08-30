'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { InstagramLogo, WhatsAppLogo } from '@/components/SocialIcons';
import { FadeInSection } from '@/components/motion/FadeInSection';

export const Footer: React.FC = () => {
  return (
    <FadeInSection>
      <footer className="bg-gradient-to-b from-warmbrown-800 to-warmbrown-900 text-peach-100 pt-16 pb-8 border-t-4 border-peach-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 text-sm">
            {/* Brand Info (2 Columns) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-peach-300 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="CraftyWrap Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-extrabold text-2xl tracking-tight text-white block">
                    CraftyWrap
                  </span>
                  <span className="text-xs font-medium text-peach-300 tracking-wider">
                    Unwrap the Joy 🧶
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-peach-200/80 leading-relaxed max-w-sm">
                Every doll at CraftyWrap is 100% handcrafted with love by our small artisan family using ultra-soft plush yarn, hypoallergenic filling, and safety-locked stitches.
              </p>

              <div className="pt-2 flex items-center gap-3 text-xs font-semibold text-peach-200">
                <a
                  href="https://www.instagram.com/crafty_wrap"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-warmbrown-700/90 hover:bg-warmbrown-600 text-white px-4 py-2 rounded-full transition-all shadow-xs border border-warmbrown-500 font-bold"
                >
                  <InstagramLogo size={16} className="text-white" /> Instagram
                </a>
                <a
                  href="https://wa.me/919363515015"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-[#0F6543] hover:bg-[#0B4F34] text-white px-4 py-2 rounded-full transition-all shadow-xs border border-emerald-600 font-bold"
                >
                  <WhatsAppLogo size={16} className="text-white" /> WhatsApp
                </a>
              </div>
            </div>

            {/* Customer Care Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-base border-b border-warmbrown-700 pb-2">
                Customer Care
              </h4>
              <ul className="space-y-2 text-xs text-peach-200/80 font-medium">
                <li>
                  <Link href="/custom-order" className="hover:text-peach-300 transition-colors">
                    Custom Order Request
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-peach-300 transition-colors">
                    Cart & Checkout
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="hover:text-peach-300 transition-colors">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-peach-300 transition-colors">
                    Yarn Care Instructions
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-peach-300 transition-colors">
                    FAQs & Returns
                  </Link>
                </li>
              </ul>
            </div>

            {/* Direct Support Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-base border-b border-warmbrown-700 pb-2">
                Direct Contact
              </h4>
              <div className="space-y-2.5 text-xs text-peach-200/80">
                <a
                  href="https://wa.me/919363515015"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-emerald-400 font-bold hover:underline"
                >
                  <WhatsAppLogo size={16} className="text-emerald-400 shrink-0" />
                  <span>+91 93635 15015 (WhatsApp)</span>
                </a>
                <p className="text-[11px] text-peach-300/70">
                  Quick WhatsApp chat available for custom consultations 7 days a week.
                </p>
                <a
                  href="mailto:craftywrap30@gmail.com"
                  className="flex items-center gap-2 text-peach-200 hover:text-white transition-colors hover:underline"
                >
                  <Mail size={15} className="text-peach-300 shrink-0" />
                  <span>craftywrap30@gmail.com</span>
                </a>
                <div className="pt-2">
                  <span className="block text-[11px] font-bold text-peach-300 uppercase tracking-wider mb-1">
                    Accepted Payments
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="bg-warmbrown-700 px-2 py-1 rounded text-peach-100">UPI</span>
                    <span className="bg-warmbrown-700 px-2 py-1 rounded text-peach-100">Razorpay</span>
                    <span className="bg-warmbrown-700 px-2 py-1 rounded text-peach-100">Cards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Legal / Copyright Strip */}
          <div className="border-t border-warmbrown-700/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-peach-300/70">
            <p>
              &copy; {new Date().getFullYear()} CraftyWrap. All rights reserved. Handcrafted with love 🧶
            </p>
            <div className="flex items-center gap-4">
              <span className="hover:text-peach-200 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-peach-200 cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-peach-200 cursor-pointer">Refund Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </FadeInSection>
  );
};
