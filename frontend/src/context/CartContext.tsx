'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/mockData';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  customNote?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  isLoggedIn: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, customNote?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  giftWrap: boolean;
  setGiftWrap: (val: boolean) => void;
  giftNote: string;
  setGiftNote: (note: string) => void;
  user: UserProfile;
  loginWithGoogle: () => void;
  logout: () => void;
  notification: string | null;
  setNotification: (msg: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const [user, setUser] = useState<UserProfile>({
    name: 'Crafty Fan',
    email: 'hello@craftywrap.com',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CraftyCat',
    isLoggedIn: false,
  });

  const addToCart = (product: Product, quantity = 1, customNote = '') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, customNote }];
    });

    setNotification(`Added "${product.name}" to your cart! 🧶`);
    setTimeout(() => setNotification(null), 3500);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const loginWithGoogle = () => {
    setUser({
      name: 'Maya Lin',
      email: 'maya.crafty@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      isLoggedIn: true,
    });
    setNotification('Successfully signed in with Google! Welcome back, Maya 🐱');
    setTimeout(() => setNotification(null), 4000);
  };

  const logout = () => {
    setUser({
      name: '',
      email: '',
      avatarUrl: '',
      isLoggedIn: false,
    });
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        giftWrap,
        setGiftWrap,
        giftNote,
        setGiftNote,
        user,
        loginWithGoogle,
        logout,
        notification,
        setNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
