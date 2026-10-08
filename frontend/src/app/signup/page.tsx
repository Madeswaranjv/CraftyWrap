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
  User,
  Phone,
  MapPin,
  Home,
  Compass,
} from 'lucide-react';
import { FlowButton } from '@/components/ui/flow-button';

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

  // Address Information
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');

  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedPincode = pincode.trim();

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

    if (!trimmedAddress || trimmedAddress.length < 5) {
      setErrorMsg('Please enter your delivery street address (at least 5 characters).');
      return;
    }

    if (!trimmedCity || trimmedCity.length < 2) {
      setErrorMsg('Please enter your city.');
      return;
    }

    if (!trimmedPincode || trimmedPincode.length < 3) {
      setErrorMsg('Please enter a valid pincode/postal code.');
      return;
    }

    if (!agreed) {
      setErrorMsg('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsSigningUp(true);
    try {
      await register(trimmedName, trimmedEmail, password, trimmedPhone || undefined, {
        label: addressLabel,
        fullName: trimmedName,
        phone: trimmedPhone || undefined,
        address: trimmedAddress,
        city: trimmedCity,
        state: trimmedState || 'Karnataka',
        pincode: trimmedPincode,
      });
      router.push('/');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setErrorMsg(null);
    setIsSigningUp(true);
    try {
      await loginWithGoogle(credential);
      router.push('/account');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Google sign-up failed. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleError = (msg: string) => {
    setErrorMsg(msg);
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-peach-100/60 via-peach-50/40 to-warmbrown-100/30 flex items-center justify-center p-3 sm:p-6 my-4">
      {/* Main Sign-Up Modal Card */}
      <div className="bg-white rounded-3xl border border-peach-200/90 shadow-2xl overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 relative p-4 sm:p-6 gap-6">
        {/* Top-Right Close Button */}
        <Link
          href="/"
          className="absolute top-5 right-5 z-20 text-warmbrown-400 hover:text-warmbrown-800 p-2 rounded-full hover:bg-peach-100/70 transition-all duration-300 group"
          title="Close"
        >
          <X size={20} className="transition-transform duration-500 group-hover:rotate-180" />
        </Link>

        {/* Left Column: Illustration & Brand Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-peach-100 via-peach-50 to-warmbrown-100/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[380px]">
          {/* Brand Logo Header */}
          <div className="z-10 flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-warmbrown-800">
              CraftyWrap.
            </span>
          </div>

          {/* Illustration */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto pt-4">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64">
              <Image
                src="/signup-illustration.png"
                alt="Create your CraftyWrap account"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            <div className="text-center pt-3 space-y-1">
              <span className="inline-block bg-white/90 backdrop-blur-md text-warmbrown-800 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-peach-200 shadow-xs">
                Join the CraftyWrap Family! ✨
              </span>
              <p className="text-[11px] text-warmbrown-600 font-medium">
                Save delivery addresses once, enjoy effortless 1-click checkout forever.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sign-Up Form with Address Details */}
        <div className="md:col-span-7 flex flex-col justify-start p-1 sm:p-4 space-y-4 max-h-[85vh] overflow-y-auto pr-1">
          <div className="text-left space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800">
              Create Account
            </h1>
            <p className="text-xs text-warmbrown-600 font-medium">
              Register with your delivery details to auto-fill payment & shipping
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
            {/* Full Name & Phone in 2-cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-warmbrown-800 block">
                  Full Name *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-warmbrown-500">
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-9 pr-3 py-2 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-warmbrown-800 block">
                  Phone Number *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-warmbrown-500">
                    <Phone size={15} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-9 pr-3 py-2 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-warmbrown-800 block">
                Email Address *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmbrown-500">
                  <Mail size={15} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-9 pr-3 py-2 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Delivery Address Information Card */}
            <div className="bg-peach-50/70 p-3.5 sm:p-4 rounded-2xl border border-peach-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-warmbrown-900">
                  <MapPin size={15} className="text-warmbrown-700" />
                  <span>Delivery Address Information</span>
                </div>
                <span className="text-[10px] bg-white text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                  ✨ Auto-fills Checkout
                </span>
              </div>

              {/* Address Tag Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-warmbrown-600">Type:</span>
                {(['Home', 'Work', 'Other'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAddressLabel(type)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      addressLabel === type
                        ? 'bg-warmbrown-800 text-white border-warmbrown-800 shadow-2xs'
                        : 'bg-white text-warmbrown-700 border-peach-200 hover:border-warmbrown-400'
                    }`}
                  >
                    {type === 'Home' ? '🏠 Home' : type === 'Work' ? '🏢 Work' : '📍 Other'}
                  </button>
                ))}
              </div>

              {/* Street Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-warmbrown-800 block">
                  Street Address / Flat / Building *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-warmbrown-500">
                    <Home size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 42 Handloom Street, Green Valley Apt 3B"
                    className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-9 pr-3 py-2 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* City & Pincode 2-cols */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-warmbrown-800 block">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl px-3 py-2 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-warmbrown-800 block">
                    Pincode / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 560001"
                    className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl px-3 py-2 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-warmbrown-800 block">
                  State / Region
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-warmbrown-500">
                    <Compass size={14} />
                  </div>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-9 pr-3 py-2 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password in 2-cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-warmbrown-800 block">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-warmbrown-500">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars (letters & numbers)"
                    className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-9 pr-9 py-2 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-warmbrown-400 hover:text-warmbrown-700"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-warmbrown-800 block">
                  Confirm Password *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-warmbrown-500">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-white border border-peach-300 focus:border-warmbrown-600 rounded-xl pl-9 pr-9 py-2 text-xs text-warmbrown-900 font-medium placeholder-warmbrown-400 outline-none transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 text-warmbrown-400 hover:text-warmbrown-700"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
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
            <FlowButton
              type="submit"
              disabled={!agreed || isSigningUp}
              text={isSigningUp ? 'Creating Account…' : 'Create Account'}
              className="w-full py-3.5 text-xs font-bold tracking-wide border-warmbrown-800/40 text-warmbrown-900 dark:text-peach-100 shadow-sm"
            />
          </form>

          {/* Or Continue With Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-peach-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-warmbrown-500 shrink-0">
              Or Sign Up With
            </span>
            <div className="border-t border-peach-200 w-full" />
          </div>

          {/* Google OAuth Section */}
          <div className="w-full pt-0.5">
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              buttonText="Sign up with Google"
              text="signup_with"
            />
          </div>

          {/* Bottom Login Link */}
          <div className="text-center pt-0.5 pb-2">
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
