'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest, clearStoredAccessToken, getOrCreateCartToken, getStoredAccessToken, resetCartToken, setStoredAccessToken } from '@/lib/api';
import { CatalogProduct, toCatalogProduct } from '@/lib/catalog';

export type PaymentMethod = 'razorpay';
export type PaymentStatus = 'paid' | 'pending_verification' | 'failed' | 'refunded';

export interface Address {
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CartItem {
  product: CatalogProduct;
  quantity: number;
  customNote?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  role?: 'customer' | 'admin';
  addresses: Address[];
  isLoggedIn: boolean;
}

export interface Order {
  id: string;
  orderNumber?: string;
  createdAt?: string;
  date: string;
  items: Array<{ name: string; quantity: number; qty: number; price: number }>;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus?: string;
  status: string;
  statusColor: string;
  shippingAddress: Address;
  trackingNumber?: string;
}

interface AuthResponse {
  token: string;
  user: Omit<UserProfile, 'isLoggedIn'>;
}

interface RemoteCart {
  items: Array<{ product: CatalogProduct; quantity: number; customNote?: string }>;
  giftWrap?: boolean;
  giftNote?: string;
  promoCode?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CatalogProduct, quantity?: number, customNote?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartCount: number;
  subtotal: number;
  giftWrap: boolean;
  setGiftWrap: (value: boolean) => void;
  giftNote: string;
  setGiftNote: (note: string) => void;
  promoCode: string;
  setPromoCode: (code: string) => Promise<void>;
  user: UserProfile;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  loginWithGoogle: (credential?: string) => Promise<void>;
  updateProfile: (profile: Partial<Pick<UserProfile, 'name' | 'phone' | 'avatarUrl' | 'addresses'>>) => Promise<void>;
  logout: () => void;
  notification: string | null;
  setNotification: (message: string | null) => void;
  orders: Order[];
  refreshOrders: () => Promise<void>;
  setLatestOrder: (order: Order | null) => void;
  latestOrder: Order | null;
  addOrder: (order: Order) => void;
}

const emptyUser: UserProfile = { name: '', email: '', avatarUrl: '', addresses: [], isLoggedIn: false };
const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeCart(remoteCart: RemoteCart): Pick<CartContextType, 'cart' | 'giftWrap' | 'giftNote' | 'promoCode'> {
  return {
    cart: (remoteCart.items ?? []).map((item) => {
      const rawPrice = Number(item.product?.price ?? (item as unknown as { price?: number }).price ?? 0);
      const safePrice = Number.isNaN(rawPrice) ? 0 : rawPrice;
      const product = toCatalogProduct({ ...item.product, price: safePrice });
      return {
        ...item,
        product,
        quantity: Number(item.quantity ?? 1),
      };
    }),
    giftWrap: Boolean(remoteCart.giftWrap),
    giftNote: remoteCart.giftNote ?? '',
    promoCode: remoteCart.promoCode ?? '',
  };
}

function normalizeOrder(order: Record<string, unknown>): Order {
  return {
    id: String(order._id ?? order.id),
    orderNumber: String(order.orderNumber),
    createdAt: String(order.createdAt),
    date: new Date(String(order.createdAt)).toLocaleDateString(),
    items: ((order.items as Array<{ name: string; quantity: number; price: number }>) ?? []).map((item) => ({ ...item, qty: item.quantity })),
    total: Number(order.total),
    paymentMethod: order.paymentMethod as PaymentMethod,
    paymentStatus: order.paymentStatus as PaymentStatus,
    orderStatus: String(order.orderStatus),
    status: String(order.orderStatus).replaceAll('_', ' '),
    statusColor: order.paymentStatus === 'pending_verification' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300',
    shippingAddress: order.shippingAddress as Address,
    trackingNumber: order.trackingNumber as string | undefined,
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [giftWrap, setGiftWrapState] = useState(false);
  const [giftNote, setGiftNoteState] = useState('');
  const [promoCode, setPromoCodeState] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile>(emptyUser);
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const cartRef = useRef(cart);
  const quantityTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const requestOptions = useCallback(() => ({ token: getStoredAccessToken(), cartToken: getOrCreateCartToken() }), []);

  const applyCart = useCallback((remoteCart: RemoteCart) => {
    const nextCart = normalizeCart(remoteCart);
    setCart(nextCart.cart);
    setGiftWrapState(nextCart.giftWrap);
    setGiftNoteState(nextCart.giftNote);
    setPromoCodeState(nextCart.promoCode);
  }, []);

  const refreshCart = useCallback(async () => {
    const remoteCart = await apiRequest<RemoteCart>('/carts/current', requestOptions());
    applyCart(remoteCart);
  }, [applyCart, requestOptions]);

  const refreshOrders = useCallback(async () => {
    if (!getStoredAccessToken()) {
      setOrders([]);
      return;
    }
    const remoteOrders = await apiRequest<Record<string, unknown>[]>('/orders/me', requestOptions());
    setOrders(remoteOrders.map(normalizeOrder));
  }, [requestOptions]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = getStoredAccessToken();
        if (token) {
          const profile = await apiRequest<Omit<UserProfile, 'isLoggedIn'>>('/users/me', { token });
          setUser({ ...profile, isLoggedIn: true });
          await refreshOrders();
        }
      } catch {
        clearStoredAccessToken();
        setUser(emptyUser);
      } finally {
        try {
          await refreshCart();
        } catch (error) {
          setNotification(error instanceof Error ? error.message : 'Unable to load your cart.');
        }
        setAuthLoading(false);
      }
    };
    void initialize();
  }, [refreshCart, refreshOrders]);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 3500);
  }, []);

  const completeAuthentication = useCallback(async (auth: AuthResponse) => {
    setStoredAccessToken(auth.token);
    setUser({ ...auth.user, isLoggedIn: true });
    await Promise.all([refreshCart(), refreshOrders()]);
  }, [refreshCart, refreshOrders]);

  const login = useCallback(async (email: string, password: string) => {
    const auth = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, cartToken: getOrCreateCartToken() }),
    });
    await completeAuthentication(auth);
    showNotification('Signed in successfully.');
  }, [completeAuthentication, showNotification]);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const auth = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, cartToken: getOrCreateCartToken() }),
    });
    await completeAuthentication(auth);
    showNotification('Your CraftyWrap account is ready.');
  }, [completeAuthentication, showNotification]);

  const loginWithGoogle = useCallback(async (credential?: string) => {
    if (!credential) throw new Error('Google sign-in requires a Google credential.');
    const auth = await apiRequest<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, cartToken: getOrCreateCartToken() }),
    });
    await completeAuthentication(auth);
    showNotification('Signed in with Google.');
  }, [completeAuthentication, showNotification]);

  const updateProfile = useCallback(async (profile: Partial<Pick<UserProfile, 'name' | 'phone' | 'avatarUrl' | 'addresses'>>) => {
    const updatedProfile = await apiRequest<Omit<UserProfile, 'isLoggedIn'>>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(profile),
      token: getStoredAccessToken(),
    });
    setUser({ ...updatedProfile, isLoggedIn: true });
    showNotification('Profile updated.');
  }, [showNotification]);



  const addToCart = useCallback(async (product: CatalogProduct, quantity = 1, customNote = '') => {
    setCart((currentCart) => {
      const existingIndex = currentCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...currentCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...currentCart, { product, quantity, customNote }];
    });
    showNotification(`Added "${product.name}" to your cart.`);

    try {
      const remoteCart = await apiRequest<RemoteCart>('/carts/items', {
        ...requestOptions(),
        method: 'POST',
        body: JSON.stringify({ productId: product.databaseId, quantity, customNote }),
      });
      applyCart(remoteCart);
    } catch (error) {
      void refreshCart();
      showNotification(error instanceof Error ? error.message : 'Unable to add item to cart.');
    }
  }, [applyCart, refreshCart, requestOptions, showNotification]);

  const updateQuantity = useCallback(async (productId: string, nextQuantity: number) => {
    // 1. Update UI state instantly
    setCart((currentCart) => {
      if (nextQuantity <= 0) {
        return currentCart.filter((item) => item.product.id !== productId);
      }
      return currentCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: nextQuantity } : item
      );
    });

    // 2. Debounce backend sync call per product so rapid clicks don't race
    const existingTimer = quantityTimeoutsRef.current.get(productId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      quantityTimeoutsRef.current.delete(productId);
      const targetItem = cartRef.current.find((i: CartItem) => i.product.id === productId);

      try {
        if (nextQuantity <= 0) {
          if (targetItem?.product?.databaseId) {
            await apiRequest(`/carts/items/${targetItem.product.databaseId}`, {
              ...requestOptions(), method: 'DELETE',
            });
          }
        } else {
          const dbId = targetItem?.product?.databaseId;
          if (dbId) {
            const remoteCart = await apiRequest<RemoteCart>(`/carts/items/${dbId}`, {
              ...requestOptions(),
              method: 'PATCH',
              body: JSON.stringify({ quantity: nextQuantity }),
            });
            const next = normalizeCart(remoteCart);
            setGiftWrapState(next.giftWrap);
            setGiftNoteState(next.giftNote);
            setPromoCodeState(next.promoCode);
          }
        }
      } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Unable to sync quantity.');
      }
    }, 350);

    quantityTimeoutsRef.current.set(productId, timer);
  }, [requestOptions, showNotification]);

  const removeFromCart = useCallback(async (productId: string) => {
    const item = cart.find((cartItem) => cartItem.product.id === productId);
    if (!item) return;

    const previousCart = cart;

    setCart((currentCart) => currentCart.filter((cartItem) => cartItem.product.id !== productId));

    try {
      const remoteCart = await apiRequest<RemoteCart>(`/carts/items/${item.product.databaseId}`, {
        ...requestOptions(), method: 'DELETE',
      });
      applyCart(remoteCart);
    } catch (error) {
      setCart(previousCart);
      showNotification(error instanceof Error ? error.message : 'Unable to remove item.');
    }
  }, [applyCart, cart, requestOptions, showNotification]);

  const clearCart = useCallback(async () => {
    await apiRequest('/carts/current', { ...requestOptions(), method: 'DELETE' });
    applyCart({ items: [] });
  }, [applyCart, requestOptions]);

  const updateSettings = useCallback(async (settings: Partial<Pick<RemoteCart, 'giftWrap' | 'giftNote' | 'promoCode'>>) => {
    const remoteCart = await apiRequest<RemoteCart>('/carts/current', { ...requestOptions(), method: 'PATCH', body: JSON.stringify(settings) });
    applyCart(remoteCart);
  }, [applyCart, requestOptions]);

  const setGiftWrap = useCallback((value: boolean) => {
    setGiftWrapState(value);
    void updateSettings({ giftWrap: value }).catch((error) => {
      setGiftWrapState(!value);
      showNotification(error instanceof Error ? error.message : 'Unable to update gift wrap.');
    });
  }, [showNotification, updateSettings]);
  const setGiftNote = useCallback((note: string) => { setGiftNoteState(note); void updateSettings({ giftNote: note }).catch((error) => showNotification(error instanceof Error ? error.message : 'Unable to update gift note.')); }, [showNotification, updateSettings]);
  const setPromoCode = useCallback(async (code: string) => { await updateSettings({ promoCode: code || undefined }); }, [updateSettings]);

  const logout = useCallback(() => {
    clearStoredAccessToken();
    resetCartToken();
    setUser(emptyUser);
    setOrders([]);
    setCart([]);
    setGiftWrapState(false);
    setGiftNoteState('');
    setPromoCodeState('');
    showNotification('Signed out.');
    void refreshCart();
  }, [refreshCart, showNotification]);

  const addOrder = useCallback((order: Order) => {
    setLatestOrder(order);
    setOrders((currentOrders) => [order, ...currentOrders]);
  }, []);

  const value = useMemo<CartContextType>(() => ({
    cart, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart,
    cartCount: cart.reduce((total, item) => total + (Number.isNaN(Number(item.quantity)) ? 0 : Number(item.quantity)), 0),
    subtotal: cart.reduce((total, item) => {
      const price = Number(item.product?.price ?? 0);
      const qty = Number(item.quantity ?? 1);
      const safePrice = Number.isNaN(price) ? 0 : price;
      const safeQty = Number.isNaN(qty) ? 1 : qty;
      return total + (safePrice * safeQty);
    }, 0),
    giftWrap, setGiftWrap, giftNote, setGiftNote, promoCode, setPromoCode,
    user, authLoading, login, register, loginWithGoogle, updateProfile, logout,
    notification, setNotification, orders, refreshOrders, latestOrder, setLatestOrder, addOrder,
  }), [addOrder, addToCart, authLoading, cart, clearCart, giftNote, giftWrap, latestOrder, login, loginWithGoogle, logout, notification, orders, promoCode, refreshCart, refreshOrders, register, removeFromCart, setGiftNote, setGiftWrap, setPromoCode, updateProfile, updateQuantity, user]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
