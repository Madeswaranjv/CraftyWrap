'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithGoogle, user } = useCart();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(trimmedEmail, password);
      router.push('/');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Sign in failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setErrorMsg(null);
    setIsLoggingIn(true);
    try {
      await loginWithGoogle(credential);
      router.push('/account');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleError = (msg: string) => {
    setErrorMsg(msg);
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-peach-100/60 via-peach-50/40 to-warmbrown-100/30 dark:from-[#1A120B] dark:via-[#140E0A] dark:to-[#1A120B] flex items-center justify-center p-4 sm:p-8">
      {/* Main Login Modal Card */}
      <div className="bg-white dark:bg-[#1F1610] rounded-3xl border border-peach-200/90 dark:border-warmbrown-900/80 shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 relative p-4 sm:p-6 gap-6">
        {/* Top-Right Close Button */}
        <Link
          href="/"
          className="absolute top-6 right-6 z-20 text-warmbrown-400 dark:text-peach-300/60 hover:text-warmbrown-800 dark:hover:text-peach-100 p-2 rounded-full hover:bg-peach-100/70 dark:hover:bg-warmbrown-900 transition-all duration-300 group"
          title="Close"
        >
          <X size={20} className="transition-transform duration-500 group-hover:rotate-180" />
        </Link>

        {/* Left Column: Illustration & Brand Banner */}
        <div className="md:col-span-6 bg-gradient-to-br from-peach-100 via-peach-50 to-warmbrown-100/50 dark:from-[#291C14] dark:via-[#221710] dark:to-[#1A120B] rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[380px]">
          {/* Brand Logo Header */}
          <div className="z-10 flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-warmbrown-800 dark:text-peach-100">
              CraftyWrap.
            </span>
          </div>

          {/* Illustration */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto pt-4">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              <Image
                src="/signin-illustration.png"
                alt="Welcome back to CraftyWrap"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            <div className="text-center pt-3">
              <span className="inline-block bg-white/90 backdrop-blur-md text-warmbrown-800 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-peach-200 shadow-xs">
                Welcome Back! 🧶
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

        {/* Right Column: Login Form & Social Connections */}
        <div className="md:col-span-6 flex flex-col justify-center p-2 sm:p-6 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800">
              Login
            </h1>
            <p className="text-xs text-warmbrown-600 font-medium">
              Sign in to manage custom doll orders & track shipments
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

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Input Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-warmbrown-800 dark:text-peach-200 block">
                Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmbrown-500 dark:text-peach-300/60">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="daniel21fisher@gmail.com"
                  className="w-full bg-white dark:bg-warmbrown-900/90 border border-peach-300 dark:border-warmbrown-800 focus:border-warmbrown-600 dark:focus:border-peach-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-warmbrown-900 dark:text-peach-100 font-medium placeholder-warmbrown-400 dark:placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-warmbrown-800 dark:text-peach-200 block">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmbrown-500 dark:text-peach-300/60">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-warmbrown-900/90 border border-peach-300 dark:border-warmbrown-800 focus:border-warmbrown-600 dark:focus:border-peach-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-warmbrown-900 dark:text-peach-100 font-medium placeholder-warmbrown-400 dark:placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-warmbrown-400 hover:text-warmbrown-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setErrorMsg('To reset your password, please contact support@craftywrap.com or register via Google.')}
                  className="text-[11px] font-bold text-peach-600 hover:text-warmbrown-800 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Main Log In Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-warmbrown-800 to-warmbrown-700 hover:from-warmbrown-900 hover:to-warmbrown-800 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs tracking-wide cursor-pointer"
            >
              Log In
            </button>
          </form>

          {/* Or Continue With Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-peach-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-warmbrown-500 shrink-0">
              Or Continue With
            </span>
            <div className="border-t border-peach-200 w-full" />
          </div>

          {/* Google OAuth Section */}
          <div className="w-full pt-1">
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              buttonText="Sign in with Google"
              text="signin_with"
            />
          </div>

          {/* Bottom Signup Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-warmbrown-600 font-medium">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-bold text-warmbrown-800 hover:text-peach-600 underline"
              >
                Sign Up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
