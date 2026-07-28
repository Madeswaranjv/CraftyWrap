'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  User,
  Phone,
} from 'lucide-react';

export default function SignUpPage() {
  const { register, loginWithGoogle } = useCart();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Full Name must be at least 2 characters long.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setErrorMsg('Password must contain at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (trimmedPhone && trimmedPhone.length < 6) {
      setErrorMsg('Phone number must be at least 6 digits long.');
      return;
    }

    if (!agreed) {
      setErrorMsg('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsSigningUp(true);
    try {
      await register(trimmedName, trimmedEmail, password, trimmedPhone || undefined);
      router.push('/');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleSocialClick = () => {
    loginWithGoogle();
    router.push('/account');
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-peach-100/60 via-peach-50/40 to-warmbrown-100/30 flex items-center justify-center p-4 sm:p-8">
      {/* Main Sign-Up Modal Card */}
      <div className="bg-white rounded-3xl border border-peach-200/90 shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 relative p-4 sm:p-6 gap-6">
        {/* Top-Right Close Button */}
        <Link
          href="/"
          className="absolute top-6 right-6 z-20 text-warmbrown-400 hover:text-warmbrown-800 p-2 rounded-full hover:bg-peach-100/70 transition-all duration-300 group"
          title="Close"
        >
          <X size={20} className="transition-transform duration-500 group-hover:rotate-180" />
        </Link>

        {/* Left Column: Illustration & Brand Banner */}
        <div className="md:col-span-6 bg-gradient-to-br from-peach-100 via-peach-50 to-warmbrown-100/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[380px]">
          {/* Brand Logo Header */}
          <div className="z-10 flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-warmbrown-800">
              CraftyWrap.
            </span>
          </div>

          {/* Illustration */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto pt-4">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              <Image
                src="/signup-illustration.png"
                alt="Create your CraftyWrap account"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            <div className="text-center pt-3">
              <span className="inline-block bg-white/90 backdrop-blur-md text-warmbrown-800 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-peach-200 shadow-xs">
                Join the CraftyWrap Family! ✨
              </span>
            </div>
          </div>

          {/* Decorative Bottom Bar Lines */}
          <div className="z-10 space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-warmbrown-700 bg-peach-300" />
              <div className="w-16 h-2 rounded-full bg-warmbrown-700/80" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-warmbrown-700 bg-peach-300" />
              <div className="w-24 h-2 rounded-full bg-warmbrown-700/80" />
            </div>
          </div>
        </div>

        {/* Right Column: Sign-Up Form */}
        <div className="md:col-span-6 flex flex-col justify-center p-2 sm:p-6 space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800">
              Create Account
            </h1>
            <p className="text-xs text-warmbrown-600 font-medium">
              Sign up to order handmade gifts & track your shipments
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-warmbrown-500 hover:text-warmbrown-800 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-warmbrown-800 block">
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmbrown-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-warmbrown-800 block">
                Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmbrown-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-warmbrown-800 block">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmbrown-500">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-warmbrown-800 block">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmbrown-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-10 pr-10 py-2.5 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-warmbrown-400 hover:text-warmbrown-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-warmbrown-800 block">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmbrown-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-10 pr-10 py-2.5 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 text-warmbrown-400 hover:text-warmbrown-700"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-warmbrown-700 w-3.5 h-3.5 rounded cursor-pointer"
              />
              <label
                htmlFor="agree-terms"
                className="text-[11px] text-warmbrown-600 font-medium leading-tight cursor-pointer"
              >
                I agree to the{' '}
                <span className="font-bold text-warmbrown-800 hover:underline cursor-pointer">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="font-bold text-warmbrown-800 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </label>
            </div>

            {/* Main Sign Up Button */}
            <button
              type="submit"
              disabled={!agreed}
              className="w-full bg-gradient-to-r from-warmbrown-800 to-warmbrown-700 hover:from-warmbrown-900 hover:to-warmbrown-800 disabled:from-warmbrown-400 disabled:to-warmbrown-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs tracking-wide cursor-pointer"
            >
              Create Account
            </button>
          </form>

          {/* Or Continue With Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-peach-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-warmbrown-500 shrink-0">
              Or Sign Up With
            </span>
            <div className="border-t border-peach-200 w-full" />
          </div>

          {/* Social Login Circles (Google, Meta, Apple) */}
          <div className="flex items-center justify-center gap-4">
            {/* Google OAuth Button */}
            <button
              onClick={handleSocialClick}
              className="w-11 h-11 rounded-full border border-peach-200 bg-white flex items-center justify-center hover:bg-peach-50 shadow-xs hover:scale-105 transition-transform"
              title="Sign up with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </button>

            {/* Meta / Facebook Button */}
            <button
              onClick={handleSocialClick}
              className="w-11 h-11 rounded-full border border-peach-200 bg-white flex items-center justify-center hover:bg-peach-50 shadow-xs hover:scale-105 transition-transform"
              title="Sign up with Facebook"
            >
              <svg className="w-5 h-5 fill-blue-600" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            {/* Apple OAuth Button */}
            <button
              onClick={handleSocialClick}
              className="w-11 h-11 rounded-full border border-peach-200 bg-white flex items-center justify-center hover:bg-peach-50 shadow-xs hover:scale-105 transition-transform"
              title="Sign up with Apple"
            >
              <svg className="w-5 h-5 fill-slate-900" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.1-.97.04-2.17.65-2.87 1.47-.62.72-1.16 1.88-.99 3 1.08.08 2.2-0.55 2.87-1.37z" />
              </svg>
            </button>
          </div>

          {/* Bottom Login Link */}
          <div className="text-center pt-1">
            <p className="text-xs text-warmbrown-600 font-medium">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-warmbrown-800 hover:text-peach-600 underline"
              >
                Log In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
