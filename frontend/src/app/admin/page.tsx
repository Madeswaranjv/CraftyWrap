'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { apiRequest, getStoredAccessToken } from '@/lib/api';
import { CatalogProduct, CatalogProductType, CatalogTheme } from '@/lib/catalog';
import {
  Package,
  Layers,
  Tag,
  Ticket,
  ShoppingBag,
  Star,
  Users,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Sparkles,
  Flame,
  Check,
  Search,
  Filter,
  Image as ImageIcon,
  ShieldAlert,
  AlertTriangle,
  Upload,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface PromoCodeItem {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minSubtotal?: number;
  usedCount: number;
  isActive: boolean;
}

interface ReviewItem {
  _id: string;
  author: string;
  rating: number;
  comment: string;
  verified: boolean;
  userPhoto?: string;
  createdAt: string;
  product?: { name: string; slug: string };
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  createdAt: string;
}

interface OrderItem {
  _id: string;
  orderNumber: string;
  user?: { name: string; email: string };
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  shippingAddress: { fullName: string; city: string };
}

export interface ProductFormState {
  _id?: string;
  databaseId?: string;
  slug: string;
  name: string;
  productType: string;
  designTheme: string;
  yarnType: string;
  size: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stockCount: number;
  prepTimeDays: number;
  isBestSeller: boolean;
  isNew: boolean;
  description: string;
  highlights: string[];
  careInstructions?: string;
  images: string[];
  isActive: boolean;
}

const emptyProductForm: ProductFormState = {
  name: '',
  slug: '',
  price: 29.99,
  originalPrice: 34.99,
  productType: 'Dolls',
  designTheme: 'Domestic Animals',
  yarnType: 'Velvet Chenille',
  size: 'Medium (23 cm)',
  stockCount: 10,
  prepTimeDays: 2,
  rating: 4.8,
  reviewCount: 0,
  isBestSeller: false,
  isNew: true,
  description: 'Handcrafted with premium ultra-soft plush yarn.',
  highlights: ['100% Hand-crocheted', 'Hypoallergenic yarn & safety eyes'],
  careInstructions: 'Spot clean gently with cold water.',
  images: [],
  isActive: true,
};

const COMMON_PRODUCT_TYPES = [
  'Dolls',
  'Keychains',
  'Bag Charms',
  'Flower Pots',
  'Mats',
  'Caps',
  'Bouquets',
  'Door Screens',
  'Pencil Stands',
  'Coasters',
  'Head Clips',
  'Hair Bands',
];

const COMMON_DESIGN_THEMES = [
  'Domestic Animals',
  'Wild Animals',
  'Aquatic Animals',
  'Fruits',
  'Vegetables',
  'Flowers',
  'Fantasy',
  'Insects',
];

const COMMON_YARN_TYPES = [
  'Velvet Chenille',
  'Milk Cotton',
  'Organic Bamboo',
  'Chunky Wool',
  'Soft Acrylic',
];

export default function AdminDashboardPage() {
  const { user } = useCart();
  const [activeTab, setActiveTab] = useState<'products' | 'themes' | 'types' | 'promos' | 'orders' | 'reviews' | 'users'>('products');

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [themes, setThemes] = useState<CatalogTheme[]>([]);
  const [types, setTypes] = useState<CatalogProductType[]>([]);
  const [promos, setPromos] = useState<PromoCodeItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Product Admin Console State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [themeFilter, setThemeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Product Editor Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [newHighlightText, setNewHighlightText] = useState('');
  const [newImageUrlText, setNewImageUrlText] = useState('');

  // Permanent Delete Confirmation Modal
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingProductName, setDeletingProductName] = useState<string>('');

  // Clear All DB Confirmation Modal
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Other Tabs Form States
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeSlug, setNewThemeSlug] = useState('');
  const [newThemeIcon, setNewThemeIcon] = useState('🐱');
  const [newThemeDesc, setNewThemeDesc] = useState('');

  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeSlug, setNewTypeSlug] = useState('');
  const [newTypeIcon, setNewTypeIcon] = useState('🧶');

  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoValue, setNewPromoValue] = useState(10);

  const token = getStoredAccessToken();

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const res = await apiRequest<{ products: CatalogProduct[] }>('/products?limit=1000&includeInactive=true');
        setProducts(res.products);
      } else if (activeTab === 'themes') {
        const res = await apiRequest<CatalogTheme[]>('/design-themes');
        setThemes(res);
      } else if (activeTab === 'types') {
        const res = await apiRequest<CatalogProductType[]>('/product-types');
        setTypes(res);
      } else if (activeTab === 'promos') {
        const res = await apiRequest<PromoCodeItem[]>('/promo-codes', { token });
        setPromos(res);
      } else if (activeTab === 'orders') {
        const res = await apiRequest<OrderItem[]>('/orders', { token });
        setOrders(res);
      } else if (activeTab === 'reviews') {
        const res = await apiRequest<ReviewItem[]>('/reviews', { token });
        setReviews(res);
      } else if (activeTab === 'users') {
        const res = await apiRequest<UserItem[]>('/users/admin', { token });
        setUsers(res);
      }
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Error loading admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [activeTab]);

  // Product Modal Handlers
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setProductForm(emptyProductForm);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: CatalogProduct) => {
    setModalMode('edit');
    setProductForm({
      _id: product.databaseId || product.id,
      databaseId: product.databaseId || product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      productType: product.productType,
      designTheme: product.designTheme,
      yarnType: product.yarnType,
      size: product.size,
      stockCount: product.stockCount,
      prepTimeDays: product.prepTimeDays,
      rating: product.rating ?? 4.8,
      reviewCount: product.reviewCount ?? 0,
      isBestSeller: product.isBestSeller ?? false,
      isNew: product.isNew ?? false,
      description: product.description,
      highlights: product.highlights ?? [],
      careInstructions: product.careInstructions ?? '',
      images: product.images ?? [],
      isActive: product.isActive ?? true,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const generatedSlug = productForm.slug.trim()
        ? productForm.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : productForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const payload = {
        name: productForm.name.trim(),
        slug: generatedSlug,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        productType: productForm.productType.trim(),
        designTheme: productForm.designTheme.trim(),
        yarnType: productForm.yarnType.trim(),
        size: productForm.size.trim(),
        stockCount: Number(productForm.stockCount),
        prepTimeDays: Number(productForm.prepTimeDays),
        rating: Number(productForm.rating),
        reviewCount: Number(productForm.reviewCount),
        isBestSeller: Boolean(productForm.isBestSeller),
        isNew: Boolean(productForm.isNew),
        description: productForm.description.trim(),
        highlights: productForm.highlights,
        careInstructions: productForm.careInstructions?.trim() || undefined,
        images: productForm.images,
        isActive: Boolean(productForm.isActive),
      };

      if (modalMode === 'create') {
        await apiRequest('/products', {
          method: 'POST',
          token,
          body: JSON.stringify(payload),
        });
        showNotification('success', `Product "${productForm.name}" created successfully!`);
      } else {
        const targetId = productForm.databaseId || productForm._id;
        await apiRequest(`/products/${targetId}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(payload),
        });
        showNotification('success', `Product "${productForm.name}" updated successfully!`);
      }

      setIsProductModalOpen(false);
      void loadData();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to save product.');
    }
  };

  const handleToggleProductActive = async (product: CatalogProduct) => {
    if (!token) return;
    const targetId = product.databaseId || product.id;
    const nextStatus = !product.isActive;

    try {
      await apiRequest(`/products/${targetId}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ isActive: nextStatus }),
      });
      showNotification('success', `Product "${product.name}" is now ${nextStatus ? 'Active' : 'Inactive'}.`);
      void loadData();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to update product status.');
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!token || !deletingProductId) return;
    try {
      await apiRequest(`/products/${deletingProductId}/permanent`, {
        method: 'DELETE',
        token,
      });
      showNotification('success', `Product "${deletingProductName}" permanently removed from database.`);
      setDeletingProductId(null);
      void loadData();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to delete product.');
    }
  };

  const handleConfirmClearAllProducts = async () => {
    if (!token) return;
    try {
      await apiRequest('/products/clear-all', {
        method: 'DELETE',
        token,
      });
      showNotification('success', 'All default & existing products removed from database.');
      setIsClearAllModalOpen(false);
      void loadData();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to clear products database.');
    }
  };

  // Highlights Manager
  const handleAddHighlight = () => {
    if (!newHighlightText.trim()) return;
    setProductForm((prev) => ({
      ...prev,
      highlights: [...prev.highlights, newHighlightText.trim()],
    }));
    setNewHighlightText('');
  };

  const handleRemoveHighlight = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // Image URLs Manager
  const handleAddImageUrl = () => {
    if (!newImageUrlText.trim()) return;
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrlText.trim()],
    }));
    setNewImageUrlText('');
  };

  const handleRemoveImageUrl = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        if (!rawDataUrl) {
          resolve('');
          return;
        }
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(rawDataUrl);
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressedUrl = await compressImageFile(file);
        if (compressedUrl) {
          setProductForm((prev) => ({
            ...prev,
            images: [...prev.images, compressedUrl],
          }));
        }
      } catch (err) {
        console.error('Image compression failed:', err);
      }
    }
    e.target.value = '';
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setProductForm((prev) => {
      const newImages = [...prev.images];
      const targetIdx = direction === 'left' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newImages.length) return prev;
      const temp = newImages[index];
      newImages[index] = newImages[targetIdx];
      newImages[targetIdx] = temp;
      return { ...prev, images: newImages };
    });
  };

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designTheme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? p.isActive === true
        : p.isActive === false;

    const matchesTheme = themeFilter === 'all' ? true : p.designTheme === themeFilter;
    const matchesType = typeFilter === 'all' ? true : p.productType === typeFilter;

    return matchesSearch && matchesStatus && matchesTheme && matchesType;
  });

  // Non-product form submit handlers
  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/design-themes', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: newThemeName.trim(),
          slug: (newThemeSlug.trim() || newThemeName.trim()).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: newThemeIcon.trim() || '🧶',
          description: newThemeDesc.trim() || `${newThemeName} crochet collection`,
          displayOrder: 0,
        }),
      });
      showNotification('success', 'Design Theme created!');
      setNewThemeName('');
      setNewThemeSlug('');
      void loadData();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to create theme.');
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/product-types', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: newTypeName.trim(),
          slug: (newTypeSlug.trim() || newTypeName.trim()).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: newTypeIcon.trim() || '🧶',
          displayOrder: 0,
        }),
      });
      showNotification('success', 'Product Type created!');
      setNewTypeName('');
      setNewTypeSlug('');
      void loadData();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to create product type.');
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/promo-codes', {
        method: 'POST',
        token,
        body: JSON.stringify({
          code: newPromoCode.toUpperCase().trim(),
          discountType: 'percentage',
          discountValue: Number(newPromoValue),
          isActive: true,
        }),
      });
      showNotification('success', 'Promo Code created!');
      setNewPromoCode('');
      void loadData();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to create promo code.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus: string) => {
    try {
      await apiRequest(`/orders/${orderId}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      showNotification('success', `Order #${orderId.slice(-6)} updated.`);
      void loadData();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to update order.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await apiRequest(`/reviews/${reviewId}`, { method: 'DELETE', token });
      showNotification('success', 'Review deleted.');
      void loadData();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to delete review.');
    }
  };

  const handleUpdateUserRole = async (userId: string, role: 'customer' | 'admin') => {
    try {
      await apiRequest(`/users/admin/${userId}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ role }),
      });
      showNotification('success', 'User role updated.');
      void loadData();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to update user role.');
    }
  };

  if (!user.isLoggedIn || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-rose-500" />
        <h1 className="text-2xl font-bold text-warmbrown-800 dark:text-peach-100">Admin Access Required</h1>
        <p className="text-xs text-warmbrown-600 dark:text-peach-200/70">
          You must be logged in as an administrator to access the admin dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-peach-200 dark:border-warmbrown-900 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 bg-peach-100 dark:bg-warmbrown-900 text-warmbrown-800 dark:text-peach-200 px-3 py-1 rounded-full text-[11px] font-bold mb-1">
            <ShieldAlert size={13} className="text-amber-600" /> Administrator Controls
          </div>
          <h1 className="text-3xl font-extrabold text-warmbrown-800 dark:text-peach-100 tracking-tight">
            CraftyWrap Admin Console
          </h1>
          <p className="text-xs text-warmbrown-600 dark:text-peach-300/70">
            Safely add, edit, or remove products and manage live store operations
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'products' && (
            <>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="bg-warmbrown-800 hover:bg-warmbrown-900 dark:bg-warmbrown-700 dark:hover:bg-warmbrown-600 text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={15} /> Add New Product
              </button>

              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(true)}
                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Trash2 size={14} /> Wipe Default Products
              </button>
            </>
          )}

          <button
            type="button"
            onClick={loadData}
            className="bg-peach-100 hover:bg-peach-200 dark:bg-warmbrown-900 dark:hover:bg-warmbrown-800 text-warmbrown-800 dark:text-peach-100 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-peach-300 dark:border-warmbrown-700 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs ${
            message.type === 'success'
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="text-xs underline hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-peach-200 dark:border-warmbrown-900 pb-3">
        {[
          { id: 'products', label: 'Products Catalog', icon: Package, count: products.length },
          { id: 'themes', label: 'Design Themes', icon: Layers, count: themes.length },
          { id: 'types', label: 'Product Types', icon: Tag, count: types.length },
          { id: 'promos', label: 'Promo Codes', icon: Ticket, count: promos.length },
          { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
          { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
          { id: 'users', label: 'Users', icon: Users, count: users.length },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === t.id
                  ? 'bg-warmbrown-800 dark:bg-warmbrown-700 text-white shadow-sm'
                  : 'bg-peach-50 dark:bg-warmbrown-900/60 text-warmbrown-700 dark:text-peach-200 hover:bg-peach-100 dark:hover:bg-warmbrown-800'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === t.id ? 'bg-white/20 text-white' : 'bg-peach-200/70 dark:bg-warmbrown-800 text-warmbrown-800 dark:text-peach-200'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCTS ADMIN CONSOLE */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-[#1F1610] p-4 rounded-3xl border border-peach-200 dark:border-warmbrown-900/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warmbrown-400 dark:text-peach-300/60" />
              <input
                type="text"
                placeholder="Search products by name, slug, theme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-peach-50 dark:bg-warmbrown-900/90 border border-peach-200 dark:border-warmbrown-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-warmbrown-900 dark:text-peach-100 outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-warmbrown-400 hover:text-warmbrown-800 dark:text-peach-300/60 dark:hover:text-peach-100"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-warmbrown-600 dark:text-peach-300/80 flex items-center gap-1">
                <Filter size={13} /> Status:
              </span>
              {(['all', 'active', 'inactive'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-warmbrown-800 dark:bg-warmbrown-700 text-white'
                      : 'bg-peach-50 dark:bg-warmbrown-900 text-warmbrown-700 dark:text-peach-200 hover:bg-peach-100 dark:hover:bg-warmbrown-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Products Summary & Table */}
          <div className="bg-white dark:bg-[#1F1610] rounded-3xl border border-peach-200 dark:border-warmbrown-900/80 overflow-hidden shadow-card">
            <div className="px-6 py-4 bg-peach-50/70 dark:bg-warmbrown-900/60 border-b border-peach-200 dark:border-warmbrown-800 flex items-center justify-between">
              <h3 className="font-bold text-warmbrown-800 dark:text-peach-100 text-sm flex items-center gap-2">
                <Package size={16} /> Live Database Products ({filteredProducts.length} items)
              </h3>
              <span className="text-[11px] text-warmbrown-500 dark:text-peach-300/70 font-medium">
                Click ✏️ to edit all attributes or 🗑️ to delete
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <span className="text-4xl block">🧶</span>
                <p className="text-sm font-bold text-warmbrown-800 dark:text-peach-100">No products found.</p>
                <p className="text-xs text-warmbrown-500 dark:text-peach-300/60 max-w-sm mx-auto">
                  {products.length === 0
                    ? 'Your database is currently empty. Click "Add New Product" to populate your catalog.'
                    : 'No products match your search/filter criteria. Try clearing search filters.'}
                </p>
                {products.length === 0 && (
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="mt-2 bg-warmbrown-800 dark:bg-warmbrown-700 text-white px-5 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Plus size={14} /> Add First Product
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-peach-50 dark:bg-warmbrown-950 border-b border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Theme / Type</th>
                      <th className="p-3.5">Yarn & Size</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Badges</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-peach-100 dark:divide-warmbrown-900/60">
                    {filteredProducts.map((p) => {
                      const hasDiscount = p.originalPrice && p.originalPrice > p.price;
                      return (
                        <tr
                          key={p.databaseId || p.id}
                          className="hover:bg-peach-50/50 dark:hover:bg-warmbrown-900/40 transition-colors"
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-peach-100 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 flex items-center justify-center overflow-hidden shrink-0">
                                {p.images && p.images.length > 0 ? (
                                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xl">🧶</span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-warmbrown-800 dark:text-peach-100 text-xs">
                                  {p.name}
                                </h4>
                                <span className="text-[10px] text-warmbrown-400 dark:text-peach-300/50 font-mono">
                                  slug: {p.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-warmbrown-800 dark:text-peach-200 block">
                                {p.designTheme}
                              </span>
                              <span className="text-[10px] text-warmbrown-500 dark:text-peach-300/60 block">
                                {p.productType}
                              </span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <span className="text-warmbrown-700 dark:text-peach-200 block">{p.yarnType}</span>
                              <span className="text-[10px] text-warmbrown-500 dark:text-peach-300/60 block">
                                {p.size}
                              </span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div>
                              <span className="font-extrabold text-warmbrown-800 dark:text-peach-100 block">
                                ₹{p.price.toFixed(2)}
                              </span>
                              {hasDiscount && (
                                <span className="text-[10px] text-warmbrown-400 dark:text-peach-300/50 line-through block">
                                  ₹{p.originalPrice?.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                p.stockCount > 5
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200'
                                  : p.stockCount > 0
                                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200'
                                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200'
                              }`}
                            >
                              {p.stockCount > 0 ? `${p.stockCount} in stock` : 'Out of stock'}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-1 flex-wrap">
                              {p.isBestSeller && (
                                <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-0.5">
                                  <Flame size={10} /> Bestseller
                                </span>
                              )}
                              {p.isNew && (
                                <span className="bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-0.5">
                                  <Sparkles size={10} /> New
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <button
                              type="button"
                              onClick={() => void handleToggleProductActive(p)}
                              title="Click to toggle Active status"
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                                p.isActive
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:opacity-80'
                                  : 'bg-gray-100 dark:bg-warmbrown-900 text-gray-600 dark:text-peach-300/60 border border-gray-300 dark:border-warmbrown-800 hover:opacity-80'
                              }`}
                            >
                              {p.isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                              <span>{p.isActive ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(p)}
                                className="bg-peach-100 hover:bg-peach-200 dark:bg-warmbrown-800 dark:hover:bg-warmbrown-700 text-warmbrown-800 dark:text-peach-100 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all"
                              >
                                <Edit3 size={13} /> Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingProductId(p.databaseId || p.id);
                                  setDeletingProductName(p.name);
                                }}
                                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-300 p-1.5 rounded-xl transition-all"
                                title="Permanently delete product from DB"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRODUCT CREATE / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[65px] z-40 bg-black/60 backdrop-blur-xs p-4 sm:p-6 flex items-start sm:items-center justify-center overflow-y-auto pt-4 sm:pt-6 pb-8">
          <div className="bg-white dark:bg-[#1A120B] rounded-3xl border border-peach-200 dark:border-warmbrown-800 max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto">
            {/* STICKY HEADER */}
            <div className="p-5 sm:p-6 border-b border-peach-200 dark:border-warmbrown-800 bg-white dark:bg-[#1A120B] shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-warmbrown-800 dark:text-peach-100 flex items-center gap-2">
                  {modalMode === 'create' ? <Plus size={20} /> : <Edit3 size={20} />}
                  {modalMode === 'create' ? 'Create New Product' : `Edit Product: ${productForm.name}`}
                </h2>
                <p className="text-xs text-warmbrown-500 dark:text-peach-300/70">
                  Update any product detail — changes save directly to MongoDB and reflect live on the website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-warmbrown-400 dark:text-peach-300/60 hover:text-warmbrown-800 dark:hover:text-peach-100 p-1.5 rounded-full hover:bg-peach-100 dark:hover:bg-warmbrown-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* SCROLLABLE FORM BODY */}
            <form id="adminProductForm" onSubmit={handleSaveProduct} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* SECTION 1: BASIC PRODUCT INFORMATION */}
              <div className="space-y-3">
                <h3 className="font-bold text-warmbrown-800 dark:text-peach-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={14} /> Basic Product Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Whiskers Calico Kitten"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">
                      URL Slug (Auto-generated if blank)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. crafty-cat-whiskers"
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                      className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Original Price (₹) (Optional for Discount)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 39.99"
                      value={productForm.originalPrice ?? ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          originalPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Stock Count *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={productForm.stockCount}
                      onChange={(e) => setProductForm({ ...productForm, stockCount: Number(e.target.value) })}
                      className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Preparation Time (Days) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={productForm.prepTimeDays}
                      onChange={(e) => setProductForm({ ...productForm, prepTimeDays: Number(e.target.value) })}
                      className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CATEGORIZATION & MATERIAL DETAILS */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-warmbrown-800 dark:text-peach-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={14} /> Categorization & Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Product Type *</label>
                    <input
                      type="text"
                      list="product-types-list"
                      required
                      value={productForm.productType}
                      onChange={(e) => setProductForm({ ...productForm, productType: e.target.value })}
                      className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                    />
                    <datalist id="product-types-list">
                      {COMMON_PRODUCT_TYPES.map((pt) => (
                        <option key={pt} value={pt} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Design Theme *</label>
                    <input
                      type="text"
                      list="design-themes-list"
                      required
                      value={productForm.designTheme}
                      onChange={(e) => setProductForm({ ...productForm, designTheme: e.target.value })}
                      className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                    />
                    <datalist id="design-themes-list">
                      {COMMON_DESIGN_THEMES.map((dt) => (
                        <option key={dt} value={dt} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Yarn Type *</label>
                    <input
                      type="text"
                      list="yarn-types-list"
                      required
                      value={productForm.yarnType}
                      onChange={(e) => setProductForm({ ...productForm, yarnType: e.target.value })}
                      className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                    />
                    <datalist id="yarn-types-list">
                      {COMMON_YARN_TYPES.map((yt) => (
                        <option key={yt} value={yt} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Size Dimensions *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Medium (23 cm)"
                      value={productForm.size}
                      onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                      className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DESCRIPTIONS & CARE INSTRUCTIONS */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-warmbrown-800 dark:text-peach-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 size={14} /> Description & Care Instructions
                </h3>
                <div>
                  <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Product Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-warmbrown-700 dark:text-peach-200 mb-1">Care Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Spot clean gently with cold water. Air dry."
                    value={productForm.careInstructions ?? ''}
                    onChange={(e) => setProductForm({ ...productForm, careInstructions: e.target.value })}
                    className="w-full bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2.5 rounded-xl outline-none focus:border-warmbrown-600 dark:focus:border-peach-300"
                  />
                </div>
              </div>

              {/* SECTION 4: HIGHLIGHT BULLET POINTS MANAGER */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-warmbrown-800 dark:text-peach-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Check size={14} /> Product Highlights ({productForm.highlights.length})
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 100% Ultra-Soft Velvet Chenille Yarn"
                    value={newHighlightText}
                    onChange={(e) => setNewHighlightText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    className="flex-1 bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 p-2 rounded-xl outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="bg-warmbrown-800 text-white px-3 py-2 rounded-xl font-bold hover:bg-warmbrown-900 shrink-0"
                  >
                    Add Point
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {productForm.highlights.map((hl, idx) => (
                    <span
                      key={idx}
                      className="bg-peach-100 dark:bg-warmbrown-900 text-warmbrown-800 dark:text-peach-200 px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 border border-peach-300 dark:border-warmbrown-800"
                    >
                      <span>{hl}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="hover:text-rose-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SECTION 5: MULTIPLE PRODUCT IMAGES UPLOADER & MANAGER */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-warmbrown-800 dark:text-peach-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} /> Product Images ({productForm.images.length})
                  </h3>
                  <span className="text-[10px] text-warmbrown-500 dark:text-peach-300/60 font-medium">
                    Upload multiple files from computer or add URLs
                  </span>
                </div>

                {/* File Upload Zone + URL Adder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Uploader Button & Dropzone */}
                  <label className="bg-peach-50 dark:bg-warmbrown-900/90 hover:bg-peach-100 dark:hover:bg-warmbrown-800 border-2 border-dashed border-peach-300 dark:border-warmbrown-700 p-3 rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-1 text-center transition-all group">
                    <Upload size={20} className="text-warmbrown-600 dark:text-peach-300 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-warmbrown-800 dark:text-peach-100 text-xs">
                      Upload Multiple Image Files
                    </span>
                    <span className="text-[10px] text-warmbrown-500 dark:text-peach-300/60">
                      Click to choose files from device (PNG, JPG, WebP)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* URL Input Box */}
                  <div className="bg-peach-50 dark:bg-warmbrown-900/90 p-3 rounded-2xl border border-peach-200 dark:border-warmbrown-800 flex flex-col justify-between gap-2">
                    <label className="font-bold text-warmbrown-800 dark:text-peach-100 text-xs block">
                      Or Add Image Web URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://example.com/photo.jpg"
                        value={newImageUrlText}
                        onChange={(e) => setNewImageUrlText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                        className="flex-1 bg-white dark:bg-warmbrown-950 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-900 dark:text-peach-100 px-2.5 py-1.5 rounded-xl outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="bg-warmbrown-800 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-warmbrown-900 shrink-0 text-xs"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Thumbnails Grid with Cover Badges & Reordering */}
                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {productForm.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-2xl overflow-hidden border border-peach-300 dark:border-warmbrown-700 bg-peach-50 dark:bg-warmbrown-900 aspect-square group shadow-xs"
                      >
                        <img src={imgUrl} alt={`Product Image ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Cover Badge */}
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-warmbrown-800 text-peach-100 text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                            Main Cover
                          </span>
                        )}

                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'left')}
                              className="bg-white/90 text-warmbrown-900 p-1.5 rounded-full hover:bg-white transition-colors"
                              title="Move Left"
                            >
                              <ArrowLeft size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImageUrl(idx)}
                            className="bg-rose-600 text-white p-1.5 rounded-full hover:bg-rose-700 transition-colors"
                            title="Remove Image"
                          >
                            <X size={13} />
                          </button>
                          {idx < productForm.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'right')}
                              className="bg-white/90 text-warmbrown-900 p-1.5 rounded-full hover:bg-white transition-colors"
                              title="Move Right"
                            >
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 6: BADGES & ACTIVE TOGGLES */}
              <div className="pt-3 border-t border-peach-200 dark:border-warmbrown-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer bg-peach-50 dark:bg-warmbrown-900/60 p-3 rounded-2xl border border-peach-200 dark:border-warmbrown-800">
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-warmbrown-800 accent-warmbrown-800"
                  />
                  <div>
                    <span className="font-extrabold text-warmbrown-800 dark:text-peach-100 block">Product Active</span>
                    <span className="text-[10px] text-warmbrown-500 dark:text-peach-300/60 block">Visible in catalog</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-peach-50 dark:bg-warmbrown-900/60 p-3 rounded-2xl border border-peach-200 dark:border-warmbrown-800">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                  />
                  <div>
                    <span className="font-extrabold text-warmbrown-800 dark:text-peach-100 block">Bestseller Badge</span>
                    <span className="text-[10px] text-warmbrown-500 dark:text-peach-300/60 block">Highlight on home page</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-peach-50 dark:bg-warmbrown-900/60 p-3 rounded-2xl border border-peach-200 dark:border-warmbrown-800">
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 accent-purple-600"
                  />
                  <div>
                    <span className="font-extrabold text-warmbrown-800 dark:text-peach-100 block">New Arrival Badge</span>
                    <span className="text-[10px] text-warmbrown-500 dark:text-peach-300/60 block">Show new arrival badge</span>
                  </div>
                </label>
              </div>
            </form>

            {/* STICKY FOOTER */}
            <div className="p-4 sm:p-6 border-t border-peach-200 dark:border-warmbrown-800 bg-peach-50/60 dark:bg-warmbrown-950/80 shrink-0 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="bg-white hover:bg-peach-100 dark:bg-warmbrown-900 dark:hover:bg-warmbrown-800 text-warmbrown-800 dark:text-peach-200 px-5 py-2.5 rounded-full font-bold border border-peach-200 dark:border-warmbrown-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="adminProductForm"
                className="bg-warmbrown-800 hover:bg-warmbrown-900 dark:bg-warmbrown-700 dark:hover:bg-warmbrown-600 text-white px-7 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center gap-2"
              >
                <Check size={16} /> Save Product to Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      {deletingProductId && (
        <div className="fixed inset-x-0 bottom-0 top-[65px] z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A120B] rounded-3xl border border-rose-200 dark:border-rose-900 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-extrabold">
              <AlertTriangle size={24} />
              <h3 className="text-lg">Permanently Delete Product?</h3>
            </div>
            <p className="text-xs text-warmbrown-700 dark:text-peach-200 leading-relaxed">
              Are you sure you want to delete <span className="font-extrabold text-warmbrown-900 dark:text-white">“{deletingProductName}”</span> permanently from MongoDB? This operation cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="bg-peach-100 dark:bg-warmbrown-900 text-warmbrown-800 dark:text-peach-200 px-4 py-2 rounded-full font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-full font-bold text-xs shadow-md"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL DEFAULT PRODUCTS CONFIRMATION MODAL */}
      {isClearAllModalOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[65px] z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A120B] rounded-3xl border border-rose-200 dark:border-rose-900 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-extrabold">
              <ShieldAlert size={24} />
              <h3 className="text-lg">Wipe All Default Products?</h3>
            </div>
            <p className="text-xs text-warmbrown-700 dark:text-peach-200 leading-relaxed">
              This will remove <span className="font-bold">ALL default & existing products</span> from your database so you can start with a completely fresh product catalog managed by you.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="bg-peach-100 dark:bg-warmbrown-900 text-warmbrown-800 dark:text-peach-200 px-4 py-2 rounded-full font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllProducts}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-full font-bold text-xs shadow-md"
              >
                Wipe All Products from DB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DESIGN THEMES */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateTheme} className="bg-white dark:bg-[#1F1610] p-6 rounded-3xl border border-peach-200 dark:border-warmbrown-900/80 space-y-4">
            <h3 className="font-bold text-warmbrown-800 dark:text-peach-100 text-sm flex items-center gap-2">
              <Plus size={16} /> Create New Design Theme
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input type="text" placeholder="Theme Name" required value={newThemeName} onChange={(e) => setNewThemeName(e.target.value)} className="bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 p-2.5 rounded-xl outline-none" />
              <input type="text" placeholder="Icon (Emoji)" required value={newThemeIcon} onChange={(e) => setNewThemeIcon(e.target.value)} className="bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 p-2.5 rounded-xl outline-none" />
              <input type="text" placeholder="Description" value={newThemeDesc} onChange={(e) => setNewThemeDesc(e.target.value)} className="bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 p-2.5 rounded-xl outline-none" />
            </div>
            <button type="submit" className="bg-warmbrown-800 dark:bg-warmbrown-700 text-white px-5 py-2 rounded-full text-xs font-bold">Add Theme</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themes.map((t) => (
              <div key={t._id || t.id} className="bg-white dark:bg-[#1F1610] p-4 rounded-2xl border border-peach-200 dark:border-warmbrown-900/80 flex items-center gap-3">
                <span className="text-3xl">{t.icon}</span>
                <div>
                  <h4 className="font-bold text-warmbrown-800 dark:text-peach-100 text-sm">{t.name}</h4>
                  <p className="text-xs text-warmbrown-500 dark:text-peach-300/60">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT TYPES */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateType} className="bg-white dark:bg-[#1F1610] p-6 rounded-3xl border border-peach-200 dark:border-warmbrown-900/80 space-y-4">
            <h3 className="font-bold text-warmbrown-800 dark:text-peach-100 text-sm flex items-center gap-2">
              <Plus size={16} /> Create New Product Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input type="text" placeholder="Product Type Name" required value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} className="bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 p-2.5 rounded-xl outline-none" />
              <input type="text" placeholder="Icon (Emoji)" value={newTypeIcon} onChange={(e) => setNewTypeIcon(e.target.value)} className="bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 p-2.5 rounded-xl outline-none" />
            </div>
            <button type="submit" className="bg-warmbrown-800 dark:bg-warmbrown-700 text-white px-5 py-2 rounded-full text-xs font-bold">Add Product Type</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {types.map((t) => (
              <div key={t._id || t.name} className="bg-white dark:bg-[#1F1610] p-4 rounded-2xl border border-peach-200 dark:border-warmbrown-900/80 flex items-center gap-3">
                <span className="text-2xl">{t.icon ?? '🧶'}</span>
                <h4 className="font-bold text-warmbrown-800 dark:text-peach-100 text-sm">{t.name}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROMO CODES */}
      {activeTab === 'promos' && (
        <div className="space-y-6">
          <form onSubmit={handleCreatePromo} className="bg-white dark:bg-[#1F1610] p-6 rounded-3xl border border-peach-200 dark:border-warmbrown-900/80 space-y-4">
            <h3 className="font-bold text-warmbrown-800 dark:text-peach-100 text-sm flex items-center gap-2">
              <Plus size={16} /> Create New Promo Code
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input type="text" placeholder="Code (e.g. SUMMER20)" required value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value)} className="bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 p-2.5 rounded-xl outline-none uppercase font-bold" />
              <input type="number" placeholder="Discount Percentage (%)" required value={newPromoValue} onChange={(e) => setNewPromoValue(Number(e.target.value))} className="bg-peach-50 dark:bg-warmbrown-900 border border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 p-2.5 rounded-xl outline-none" />
            </div>
            <button type="submit" className="bg-warmbrown-800 dark:bg-warmbrown-700 text-white px-5 py-2 rounded-full text-xs font-bold">Add Promo Code</button>
          </form>

          <div className="bg-white dark:bg-[#1F1610] rounded-3xl border border-peach-200 dark:border-warmbrown-900/80 overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-peach-50 dark:bg-warmbrown-900 border-b border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 font-bold">
                  <th className="p-3">Code</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Times Used</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-peach-100 dark:divide-warmbrown-900/60">
                {promos.map((pr) => (
                  <tr key={pr._id} className="hover:bg-peach-50/50 dark:hover:bg-warmbrown-900/40">
                    <td className="p-3 font-mono font-bold text-warmbrown-800 dark:text-peach-100">{pr.code}</td>
                    <td className="p-3 font-bold">{pr.discountValue}%</td>
                    <td className="p-3">{pr.usedCount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${pr.isActive ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'}`}>
                        {pr.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-[#1F1610] rounded-3xl border border-peach-200 dark:border-warmbrown-900/80 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-peach-50 dark:bg-warmbrown-900 border-b border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 font-bold">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-peach-100 dark:divide-warmbrown-900/60">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-peach-50/50 dark:hover:bg-warmbrown-900/40">
                  <td className="p-3 font-mono font-bold text-warmbrown-800 dark:text-peach-100">#{ord._id.slice(-6)}</td>
                  <td className="p-3">{ord.user?.name ?? ord.shippingAddress.fullName}</td>
                  <td className="p-3">{ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</td>
                  <td className="p-3 font-bold">₹{ord.total.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${ord.paymentStatus === 'paid' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'}`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    {ord.paymentStatus !== 'paid' && (
                      <button onClick={() => void handleUpdateOrderStatus(ord._id, 'preparing', 'paid')} className="bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                        Verify Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-[#1F1610] rounded-3xl border border-peach-200 dark:border-warmbrown-900/80 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-peach-50 dark:bg-warmbrown-900 border-b border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 font-bold">
                <th className="p-3">Author</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Comment</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-peach-100 dark:divide-warmbrown-900/60">
              {reviews.map((rev) => (
                <tr key={rev._id} className="hover:bg-peach-50/50 dark:hover:bg-warmbrown-900/40">
                  <td className="p-3 font-bold text-warmbrown-800 dark:text-peach-100">{rev.author}</td>
                  <td className="p-3 font-bold text-amber-600">{rev.rating} ★</td>
                  <td className="p-3">{rev.comment}</td>
                  <td className="p-3">
                    <button onClick={() => void handleDeleteReview(rev._id)} className="text-rose-600 dark:text-rose-400 hover:underline font-bold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 7: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#1F1610] rounded-3xl border border-peach-200 dark:border-warmbrown-900/80 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-peach-50 dark:bg-warmbrown-900 border-b border-peach-200 dark:border-warmbrown-800 text-warmbrown-800 dark:text-peach-100 font-bold">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-peach-100 dark:divide-warmbrown-900/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-peach-50/50 dark:hover:bg-warmbrown-900/40">
                  <td className="p-3 font-bold text-warmbrown-800 dark:text-peach-100">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300' : 'bg-peach-100 dark:bg-warmbrown-900 text-warmbrown-800 dark:text-peach-200'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    {u.role === 'customer' ? (
                      <button onClick={() => void handleUpdateUserRole(u._id, 'admin')} className="text-purple-700 dark:text-purple-400 font-bold underline">Make Admin</button>
                    ) : (
                      <button onClick={() => void handleUpdateUserRole(u._id, 'customer')} className="text-warmbrown-600 dark:text-peach-300 font-bold underline">Make Customer</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
