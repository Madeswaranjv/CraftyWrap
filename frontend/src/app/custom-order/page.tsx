'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InstagramLogo, WhatsAppLogo } from '@/components/SocialIcons';
import { CustomSelect } from '@/components/CustomSelect';
import { Wand2, Upload, Send } from 'lucide-react';
import { FlowButton } from '@/components/ui/flow-button';

const YARN_OPTIONS = [
  { value: 'Velvet Chenille', label: 'Velvet Chenille (Ultra Soft & Plush)' },
  { value: 'Milk Cotton', label: 'Milk Cotton (Crisp Stitch Definition)' },
  { value: 'Chunky Wool', label: 'Chunky Wool (Heavy Huggable)' },
  { value: 'Organic Bamboo', label: 'Organic Bamboo (Hypoallergenic)' },
];

const BUDGET_OPTIONS = [
  { value: '₹150 - ₹300', label: '₹150 - ₹300 (Small)' },
  { value: '₹350 - ₹500', label: '₹350 - ₹500 (Medium)' },
  { value: '₹500 - ₹750', label: '₹500 - ₹750 (Extra Medium)' },
  { value: 'Above ₹1,000', label: 'Above ₹1,000 (Large)' },
];

const WHATSAPP_NUMBER = '919363515015';

function CustomOrderContent() {
  const searchParams = useSearchParams();
  const refDoll = searchParams.get('ref') || '';
  const refImageParam = searchParams.get('img') || searchParams.get('image') || '';

  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [description, setDescription] = useState(
    refDoll ? `I would like to request a custom variation of "${refDoll}": ` : ''
  );
  const [yarnPreference, setYarnPreference] = useState('Velvet Chenille');
  const [budget, setBudget] = useState('₹350 - ₹500');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string>(refImageParam);
  const [imagePreview, setImagePreview] = useState<string | null>(refImageParam || null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (refImageParam && !selectedFile) {
      setProductImageUrl(refImageParam);
      setImagePreview(refImageParam);
    }
  }, [refImageParam, selectedFile]);

  useEffect(() => {
    if (refDoll && !description) {
      setDescription(`I would like to request a custom variation of "${refDoll}": `);
    }
  }, [refDoll, description]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setProductImageUrl('');
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAbsoluteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedContact = contactInfo.trim();
    const trimmedDescription = description.trim();

    const missingFields: string[] = [];
    if (!trimmedName) {
      missingFields.push('Full Name');
    }
    if (!trimmedContact) {
      missingFields.push('Email Address or Phone Number');
    }
    if (!trimmedDescription) {
      missingFields.push('Custom Doll Description & Details');
    }

    if (missingFields.length > 0) {
      setValidationError(
        `Please complete the required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}.`
      );
      setBlockedUrl(null);
      setSuccessNote(null);
      return;
    }

    setValidationError(null);

    const selectedYarn =
      YARN_OPTIONS.find((opt) => opt.value === yarnPreference)?.label || yarnPreference;
    const selectedBudget =
      BUDGET_OPTIONS.find((opt) => opt.value === budget)?.label || budget;

    let referencePhotoText = 'No reference photo/drawing provided.';

    if (selectedFile && productImageUrl) {
      const absUrl = getAbsoluteUrl(productImageUrl);
      referencePhotoText = [
        'I have selected a custom reference photo/drawing (will attach manually in WhatsApp).',
        `Original Product Photo (${refDoll || 'Catalog Product'}): ${absUrl}`,
      ].join('\n');
    } else if (selectedFile) {
      referencePhotoText =
        'I have selected a reference photo/drawing. I will attach it manually in WhatsApp.';
    } else if (productImageUrl) {
      const absUrl = getAbsoluteUrl(productImageUrl);
      referencePhotoText = [
        `Product Reference Photo (${refDoll || 'Catalog Product'}):`,
        absUrl,
        'I have selected this product photo as reference. I can also attach it manually in WhatsApp if needed.',
      ].join('\n');
    }

    const message = [
      'Hi CraftyWrap! I would like to request a custom order.',
      '',
      'CUSTOM ORDER DETAILS',
      '',
      'Full Name:',
      trimmedName,
      '',
      'Email / Phone:',
      trimmedContact,
      '',
      'Preferred Yarn Texture:',
      selectedYarn,
      '',
      'Estimated Budget:',
      selectedBudget,
      '',
      'Customization Details:',
      trimmedDescription,
      '',
      'Reference Photo:',
      referencePhotoText,
      '',
      'Please let me know the details, pricing, and availability.',
      '',
      'Thank you!',
    ].join('\n');

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    try {
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        setBlockedUrl(whatsappUrl);
        setSuccessNote(null);
      } else {
        setBlockedUrl(null);
        setSuccessNote('WhatsApp opened! Please review your custom order request and press Send in WhatsApp.');
      }
    } catch {
      setBlockedUrl(whatsappUrl);
      setSuccessNote(null);
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

        <p className="text-xs sm:text-sm font-semibold text-peach-100 pt-1">
          Want even more customization then feel free to contact us!
        </p>
      </div>

      {/* Custom Order Request Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white dark:bg-[#1F1610] p-6 sm:p-10 rounded-3xl border border-peach-200/80 dark:border-warmbrown-900/80 shadow-soft space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-warmbrown-800 dark:text-peach-200 uppercase tracking-wider block mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g., Jessica Parker"
              className="w-full bg-peach-50 dark:bg-warmbrown-900/90 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-400 rounded-xl px-4 py-3 text-xs outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-warmbrown-800 dark:text-peach-200 uppercase tracking-wider block mb-1">
              Email Address or Phone Number *
            </label>
            <input
              type="text"
              required
              value={contactInfo}
              onChange={(e) => {
                setContactInfo(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g., jessica@gmail.com or +1 555-0192"
              className="w-full bg-peach-50 dark:bg-warmbrown-900/90 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-400 rounded-xl px-4 py-3 text-xs outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-warmbrown-800 dark:text-peach-200 uppercase tracking-wider block mb-1">
              Preferred Yarn Texture
            </label>
            <CustomSelect
              value={yarnPreference}
              onChange={(val) => setYarnPreference(String(val))}
              options={YARN_OPTIONS}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-warmbrown-800 dark:text-peach-200 uppercase tracking-wider block mb-1">
              Estimated Budget Range
            </label>
            <CustomSelect
              value={budget}
              onChange={(val) => setBudget(String(val))}
              options={BUDGET_OPTIONS}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-warmbrown-800 dark:text-peach-200 uppercase tracking-wider block mb-1">
            Custom Doll Description & Details *
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Describe what doll you want us to create (e.g., color preferences, outfit, size, special features like embroidered initials)..."
            className="w-full bg-peach-50 dark:bg-warmbrown-900/90 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-400 rounded-xl p-4 text-xs outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
          />
        </div>

        {/* Reference Image Upload Field */}
        <div>
          <label className="text-xs font-bold text-warmbrown-800 dark:text-peach-200 uppercase tracking-wider block mb-1">
            Upload Reference Photo or Drawing (Optional)
          </label>
          <div className="border-2 border-dashed border-peach-300 dark:border-warmbrown-700 rounded-2xl p-6 text-center hover:bg-peach-50 dark:hover:bg-warmbrown-900/50 transition-colors">
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-peach-300 shadow-md">
                  {/* Image Preview */}
                  <img
                    src={imagePreview}
                    alt={refDoll ? `${refDoll} Reference` : 'Reference Preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {productImageUrl && !selectedFile && (
                  <span className="text-[11px] text-warmbrown-600 dark:text-peach-200 font-medium block">
                    Product Reference: <span className="font-bold text-warmbrown-800 dark:text-peach-100">{refDoll || 'Catalog Product'}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleRemovePhoto}
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
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {validationError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
            <span>{validationError}</span>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-warmbrown-500 hover:text-warmbrown-800 font-bold ml-2 p-1"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {blockedUrl && (
          <div className="bg-amber-50 border border-amber-200 text-warmbrown-800 p-4 rounded-2xl text-xs space-y-1.5 shadow-xs">
            <p className="font-bold text-amber-900">
              WhatsApp could not be opened automatically (it may have been blocked by your browser popup blocker).
            </p>
            <p>
              Please{' '}
              <a
                href={blockedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-warmbrown-900 underline font-bold hover:text-warmbrown-700"
              >
                click here to open WhatsApp directly
              </a>{' '}
              or manually message us on WhatsApp at <span className="font-bold">+91 93635 15015</span>.
            </p>
          </div>
        )}

        {successNote && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
            <span>{successNote}</span>
            <button
              type="button"
              onClick={() => setSuccessNote(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 p-1"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )}

        <FlowButton
          type="submit"
          variant="filled"
          icon={Send}
          text="Submit Custom Doll Request"
          className="w-full py-4 text-sm font-bold shadow-md"
        />

        {/* Contact Callout Banner */}
        <div className="bg-peach-50/80 dark:bg-warmbrown-900/60 p-4 sm:p-5 rounded-2xl border border-peach-200 dark:border-warmbrown-800 text-center space-y-2 mt-4">
          <p className="text-xs sm:text-sm font-extrabold text-warmbrown-800 dark:text-peach-100">
            Want even more customization then feel free to contact us!
          </p>
          <div className="flex items-center justify-center gap-6 pt-2">
            <a
              href="https://wa.me/919363515015"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp (+91 93635 15015)"
              title="WhatsApp (+91 93635 15015)"
              className="text-warmbrown-800 hover:text-warmbrown-600 dark:text-peach-100 dark:hover:text-white transition-transform hover:scale-125 p-1 inline-flex items-center justify-center"
            >
              <WhatsAppLogo size={26} className="w-6.5 h-6.5" />
            </a>
            <a
              href="https://www.instagram.com/crafty_wrap"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram (@crafty_wrap)"
              title="Instagram (@crafty_wrap)"
              className="text-warmbrown-800 hover:text-warmbrown-600 dark:text-peach-100 dark:hover:text-white transition-transform hover:scale-125 p-1 inline-flex items-center justify-center"
            >
              <InstagramLogo size={26} className="w-6.5 h-6.5" />
            </a>
          </div>
        </div>
      </form>
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
