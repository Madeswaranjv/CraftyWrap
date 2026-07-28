'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InstagramLogo, WhatsAppLogo } from '@/components/SocialIcons';
import { apiRequest, getStoredAccessToken } from '@/lib/api';
import {
  Wand2,
  Upload,
  CheckCircle2,
  Heart,
  Clock,
  Send,
  Image as ImageIcon,
} from 'lucide-react';

function CustomOrderContent() {
  const searchParams = useSearchParams();
  const refDoll = searchParams.get('ref') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState(
    refDoll ? `I would like to request a custom variation of "${refDoll}": ` : ''
  );
  const [yarnPreference, setYarnPreference] = useState('Velvet Chenille');
  const [budget, setBudget] = useState('$30 - $50');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name || (!email && !phone) || !description) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('name', name.trim());
      formData.set('contactInfo', email.trim() || phone.trim());
      if (email.trim()) formData.set('email', email.trim());
      if (phone.trim()) formData.set('phone', phone.trim());
      formData.set('yarnPreference', yarnPreference);
      formData.set('budget', budget);
      formData.set('description', description.trim());
      if (refDoll) formData.set('referenceDollName', refDoll);
      if (selectedFile) formData.set('referenceImage', selectedFile);

      await apiRequest('/custom-orders', {
        method: 'POST',
        token: getStoredAccessToken(),
        body: formData,
      });

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit custom order request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-warmbrown-800 via-warmbrown-700 to-warmbrown-900 text-peach-50 p-8 sm:p-10 rounded-3xl shadow-xl border border-warmbrown-600 space-y-3 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-peach-300/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-peach-300/20 text-peach-200 px-3.5 py-1 rounded-full text-xs font-bold">
          <Wand2 size={14} /> Custom Handmade Crochet Consultation
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Tell Us What You&apos;re Dreaming Of! 🧶
        </h1>

        <p className="text-xs sm:text-sm text-peach-200/90 max-w-xl mx-auto leading-relaxed">
          From custom pets to unique character plushies, we translate your favorite ideas into handcrafted yarn dolls with love.
        </p>
      </div>

      {submitted ? (
        /* Submission Success Screen with Instagram & WhatsApp CTAs */
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-peach-300 shadow-card text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
            <CheckCircle2 size={48} />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800">
              Custom Request Received!
            </h2>
            <p className="text-xs sm:text-sm text-warmbrown-600 leading-relaxed">
              Thank you, <span className="font-bold text-warmbrown-800">{name}</span>! Your request details are saved. Our artisan family will follow up personally within 24 hours.
            </p>
          </div>

          {/* Prominent CTAs for Instagram & WhatsApp */}
          <div className="bg-peach-50 p-6 rounded-2xl border border-peach-200 space-y-4 max-w-lg mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-warmbrown-700 block">
              Want faster confirmation or to send live voice notes?
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://www.instagram.com/crafty_wrap"
                target="_blank"
                rel="noreferrer"
                className="bg-warmbrown-800 hover:bg-warmbrown-900 text-white p-3.5 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <InstagramLogo size={18} className="text-white" />
                <span>Instagram (@crafty_wrap)</span>
              </a>

              <a
                href="https://wa.me/919363515015"
                target="_blank"
                rel="noreferrer"
                className="bg-[#0F6543] hover:bg-[#0B4F34] text-white p-3.5 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <WhatsAppLogo size={18} className="text-white" />
                <span>WhatsApp (+91 93635 15015)</span>
              </a>
            </div>
          </div>

          <button
            onClick={() => setSubmitted(false)}
            className="text-xs font-bold text-warmbrown-600 hover:text-warmbrown-800 underline pt-2"
          >
            Submit another custom request
          </button>
        </div>
      ) : (
        /* Custom Order Request Form */
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-peach-200/80 shadow-soft space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-warmbrown-800 uppercase tracking-wider block mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jessica Parker"
                className="w-full bg-peach-50 border border-peach-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-warmbrown-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-warmbrown-800 uppercase tracking-wider block mb-1">
                Email Address or Phone Number *
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., jessica@gmail.com or +1 555-0192"
                className="w-full bg-peach-50 border border-peach-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-warmbrown-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-warmbrown-800 uppercase tracking-wider block mb-1">
                Preferred Yarn Texture
              </label>
              <select
                value={yarnPreference}
                onChange={(e) => setYarnPreference(e.target.value)}
                className="w-full bg-peach-50 border border-peach-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-warmbrown-600 font-semibold"
              >
                <option value="Velvet Chenille">Velvet Chenille (Ultra Soft & Plush)</option>
                <option value="Milk Cotton">Milk Cotton (Crisp Stitch Definition)</option>
                <option value="Chunky Wool">Chunky Wool (Heavy Huggable)</option>
                <option value="Organic Bamboo">Organic Bamboo (Hypoallergenic)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-warmbrown-800 uppercase tracking-wider block mb-1">
                Estimated Budget Range
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-peach-50 border border-peach-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-warmbrown-600 font-semibold"
              >
                <option value="$20 - $35">$20 - $35 (Mini Plushies / Keychains)</option>
                <option value="$35 - $55">$35 - $55 (Standard Medium Dolls)</option>
                <option value="$55 - $90">$55 - $90 (Giant / Detailed Custom Art)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-warmbrown-800 uppercase tracking-wider block mb-1">
              Custom Doll Description & Details *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what doll you want us to create (e.g., color preferences, outfit, size, special features like embroidered initials)..."
              className="w-full bg-peach-50 border border-peach-200 rounded-xl p-4 text-xs outline-none focus:border-warmbrown-600"
            />
          </div>

          {/* Reference Image Upload Field */}
          <div>
            <label className="text-xs font-bold text-warmbrown-800 uppercase tracking-wider block mb-1">
              Upload Reference Photo or Drawing (Optional)
            </label>
            <div className="border-2 border-dashed border-peach-300 rounded-2xl p-6 text-center hover:bg-peach-50 transition-colors">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-peach-300 shadow-md">
                    {/* Image Preview */}
                    <img src={imagePreview} alt="Reference Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2 block">
                  <Upload size={28} className="mx-auto text-warmbrown-500" />
                  <span className="text-xs font-bold text-warmbrown-800 block">
                    Click to select an image from your device
                  </span>
                  <span className="text-[11px] text-warmbrown-500 block">
                    PNG, JPG, or WEBP files supported
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-warmbrown-800 hover:bg-warmbrown-900 text-peach-50 py-4 rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Send size={16} />
            <span>Submit Custom Doll Request</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function CustomOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-warmbrown-700">Loading form...</div>}>
      <CustomOrderContent />
    </Suspense>
  );
}
