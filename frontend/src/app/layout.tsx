import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NotificationToast } from '@/components/NotificationToast';

export const metadata: Metadata = {
  title: 'CraftyWrap — Unwrap the Joy | Handmade Yarn Dolls',
  description: 'Shop cute, high-quality handcrafted yarn dolls, veggies, fruits, animals, and request custom doll designs made with love.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between antialiased transition-colors duration-300 bg-[#FFFDFA] text-[#5C3A21]">
        <ThemeProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <NotificationToast />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
