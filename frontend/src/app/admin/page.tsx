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
  Edit2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
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
  const [message, setMessage] = useState<string | null>(null);

  // New Item Form States
  const [newProductName, setNewProductName] = useState('');
  const [newProductSlug, setNewProductSlug] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(29.99);
  const [newProductType, setNewProductType] = useState('Plush Doll');
  const [newProductTheme, setNewProductTheme] = useState('Cute Animals');
  const [newProductYarn, setNewProductYarn] = useState('Velvet Chenille');
  const [newProductSize, setNewProductSize] = useState('Medium');
  const [newProductStock, setNewProductStock] = useState(10);
  const [newProductDesc, setNewProductDesc] = useState('Handcrafted with premium plush yarn.');

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

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const res = await apiRequest<{ products: CatalogProduct[] }>('/products?limit=100');
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
      setMessage(error instanceof Error ? error.message : 'Error loading admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [activeTab]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/products', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: newProductName,
          slug: newProductSlug || newProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          price: Number(newProductPrice),
          productType: newProductType,
          designTheme: newProductTheme,
          yarnType: newProductYarn,
          size: newProductSize,
          stockCount: Number(newProductStock),
          prepTimeDays: 3,
          description: newProductDesc,
          highlights: ['Handmade with love', 'Hypoallergenic yarn'],
        }),
      });
      setMessage('Product created!');
      setNewProductName('');
      setNewProductSlug('');
      void loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create product.');
    }
  };

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/design-themes', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: newThemeName,
          slug: newThemeSlug || newThemeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: newThemeIcon,
          description: newThemeDesc || `${newThemeName} crochet collection`,
        }),
      });
      setMessage('Design Theme created!');
      setNewThemeName('');
      setNewThemeSlug('');
      void loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create theme.');
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/product-types', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: newTypeName,
          slug: newTypeSlug || newTypeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: newTypeIcon,
        }),
      });
      setMessage('Product Type created!');
      setNewTypeName('');
      setNewTypeSlug('');
      void loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create product type.');
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
      setMessage('Promo Code created!');
      setNewPromoCode('');
      void loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create promo code.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus: string) => {
    try {
      await apiRequest(`/orders/${orderId}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      setMessage(`Order #${orderId.slice(-6)} updated.`);
      void loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update order.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await apiRequest(`/reviews/${reviewId}`, { method: 'DELETE', token });
      setMessage('Review deleted.');
      void loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to delete review.');
    }
  };

  const handleUpdateUserRole = async (userId: string, role: 'customer' | 'admin') => {
    try {
      await apiRequest(`/users/admin/${userId}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ role }),
      });
      setMessage('User role updated.');
      void loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update user role.');
    }
  };

  if (!user.isLoggedIn || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-rose-500" />
        <h1 className="text-2xl font-bold text-warmbrown-800">Admin Access Required</h1>
        <p className="text-xs text-warmbrown-600">You must be logged in as an administrator to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-peach-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-warmbrown-800">Admin CRUD Operations</h1>
          <p className="text-xs text-warmbrown-600">Manage MongoDB collections & live store data</p>
        </div>
        <button
          onClick={loadData}
          className="bg-peach-100 hover:bg-peach-200 text-warmbrown-800 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 border border-peach-300 w-fit"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {message && (
        <div className="bg-emerald-100 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-peach-200 pb-3">
        {[
          { id: 'products', label: 'Products', icon: Package },
          { id: 'themes', label: 'Design Themes', icon: Layers },
          { id: 'types', label: 'Product Types', icon: Tag },
          { id: 'promos', label: 'Promo Codes', icon: Ticket },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'reviews', label: 'Reviews', icon: Star },
          { id: 'users', label: 'Users', icon: Users },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === t.id
                  ? 'bg-warmbrown-800 text-white shadow-sm'
                  : 'bg-peach-50 text-warmbrown-700 hover:bg-peach-100'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateProduct} className="bg-white p-6 rounded-3xl border border-peach-200 space-y-4">
            <h3 className="font-bold text-warmbrown-800 text-sm flex items-center gap-2">
              <Plus size={16} /> Create New Product
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input type="text" placeholder="Product Name" required value={newProductName} onChange={(e) => setNewProductName(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
              <input type="text" placeholder="Slug (optional)" value={newProductSlug} onChange={(e) => setNewProductSlug(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
              <input type="number" step="0.01" placeholder="Price ($)" required value={newProductPrice} onChange={(e) => setNewProductPrice(Number(e.target.value))} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
              <input type="text" placeholder="Product Type" value={newProductType} onChange={(e) => setNewProductType(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
              <input type="text" placeholder="Design Theme" value={newProductTheme} onChange={(e) => setNewProductTheme(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
              <input type="text" placeholder="Yarn Type" value={newProductYarn} onChange={(e) => setNewProductYarn(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
            </div>
            <button type="submit" className="bg-warmbrown-800 text-white px-5 py-2 rounded-full text-xs font-bold">Add Product</button>
          </form>

          <div className="bg-white rounded-3xl border border-peach-200 overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-peach-50 border-b border-peach-200 text-warmbrown-800 font-bold">
                  <th className="p-3">Name</th>
                  <th className="p-3">Theme</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-peach-100">
                {products.map((p) => (
                  <tr key={p.databaseId || p.id} className="hover:bg-peach-50/50">
                    <td className="p-3 font-bold text-warmbrown-800">{p.name}</td>
                    <td className="p-3">{p.designTheme}</td>
                    <td className="p-3">{p.productType}</td>
                    <td className="p-3 font-bold">${p.price.toFixed(2)}</td>
                    <td className="p-3">{p.stockCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DESIGN THEMES */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateTheme} className="bg-white p-6 rounded-3xl border border-peach-200 space-y-4">
            <h3 className="font-bold text-warmbrown-800 text-sm flex items-center gap-2">
              <Plus size={16} /> Create New Design Theme
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input type="text" placeholder="Theme Name" required value={newThemeName} onChange={(e) => setNewThemeName(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
              <input type="text" placeholder="Icon (Emoji)" required value={newThemeIcon} onChange={(e) => setNewThemeIcon(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
              <input type="text" placeholder="Description" value={newThemeDesc} onChange={(e) => setNewThemeDesc(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
            </div>
            <button type="submit" className="bg-warmbrown-800 text-white px-5 py-2 rounded-full text-xs font-bold">Add Theme</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themes.map((t) => (
              <div key={t._id || t.id} className="bg-white p-4 rounded-2xl border border-peach-200 flex items-center gap-3">
                <span className="text-3xl">{t.icon}</span>
                <div>
                  <h4 className="font-bold text-warmbrown-800 text-sm">{t.name}</h4>
                  <p className="text-xs text-warmbrown-500">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT TYPES */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateType} className="bg-white p-6 rounded-3xl border border-peach-200 space-y-4">
            <h3 className="font-bold text-warmbrown-800 text-sm flex items-center gap-2">
              <Plus size={16} /> Create New Product Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input type="text" placeholder="Product Type Name" required value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
              <input type="text" placeholder="Icon (Emoji)" value={newTypeIcon} onChange={(e) => setNewTypeIcon(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
            </div>
            <button type="submit" className="bg-warmbrown-800 text-white px-5 py-2 rounded-full text-xs font-bold">Add Product Type</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {types.map((t) => (
              <div key={t._id || t.name} className="bg-white p-4 rounded-2xl border border-peach-200 flex items-center gap-3">
                <span className="text-2xl">{t.icon ?? '🧶'}</span>
                <h4 className="font-bold text-warmbrown-800 text-sm">{t.name}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROMO CODES */}
      {activeTab === 'promos' && (
        <div className="space-y-6">
          <form onSubmit={handleCreatePromo} className="bg-white p-6 rounded-3xl border border-peach-200 space-y-4">
            <h3 className="font-bold text-warmbrown-800 text-sm flex items-center gap-2">
              <Plus size={16} /> Create New Promo Code
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input type="text" placeholder="Code (e.g. SUMMER20)" required value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value)} className="bg-peach-50 border p-2.5 rounded-xl outline-none uppercase font-bold" />
              <input type="number" placeholder="Discount Percentage (%)" required value={newPromoValue} onChange={(e) => setNewPromoValue(Number(e.target.value))} className="bg-peach-50 border p-2.5 rounded-xl outline-none" />
            </div>
            <button type="submit" className="bg-warmbrown-800 text-white px-5 py-2 rounded-full text-xs font-bold">Add Promo Code</button>
          </form>

          <div className="bg-white rounded-3xl border border-peach-200 overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-peach-50 border-b border-peach-200 text-warmbrown-800 font-bold">
                  <th className="p-3">Code</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Times Used</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-peach-100">
                {promos.map((pr) => (
                  <tr key={pr._id} className="hover:bg-peach-50/50">
                    <td className="p-3 font-mono font-bold text-warmbrown-800">{pr.code}</td>
                    <td className="p-3 font-bold">{pr.discountValue}%</td>
                    <td className="p-3">{pr.usedCount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${pr.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
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
        <div className="bg-white rounded-3xl border border-peach-200 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-peach-50 border-b border-peach-200 text-warmbrown-800 font-bold">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-peach-100">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-peach-50/50">
                  <td className="p-3 font-mono font-bold text-warmbrown-800">#{ord._id.slice(-6)}</td>
                  <td className="p-3">{ord.user?.name ?? ord.shippingAddress.fullName}</td>
                  <td className="p-3">{ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                  <td className="p-3 font-bold">${ord.total.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    {ord.paymentStatus !== 'paid' && (
                      <button onClick={() => handleUpdateOrderStatus(ord._id, 'preparing', 'paid')} className="bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
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
        <div className="bg-white rounded-3xl border border-peach-200 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-peach-50 border-b border-peach-200 text-warmbrown-800 font-bold">
                <th className="p-3">Author</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Comment</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-peach-100">
              {reviews.map((rev) => (
                <tr key={rev._id} className="hover:bg-peach-50/50">
                  <td className="p-3 font-bold text-warmbrown-800">{rev.author}</td>
                  <td className="p-3 font-bold text-amber-600">{rev.rating} ★</td>
                  <td className="p-3">{rev.comment}</td>
                  <td className="p-3">
                    <button onClick={() => handleDeleteReview(rev._id)} className="text-rose-600 hover:text-rose-800 font-bold">
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
        <div className="bg-white rounded-3xl border border-peach-200 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-peach-50 border-b border-peach-200 text-warmbrown-800 font-bold">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-peach-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-peach-50/50">
                  <td className="p-3 font-bold text-warmbrown-800">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-peach-100 text-warmbrown-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    {u.role === 'customer' ? (
                      <button onClick={() => handleUpdateUserRole(u._id, 'admin')} className="text-purple-700 font-bold underline">Make Admin</button>
                    ) : (
                      <button onClick={() => handleUpdateUserRole(u._id, 'customer')} className="text-warmbrown-600 font-bold underline">Make Customer</button>
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
