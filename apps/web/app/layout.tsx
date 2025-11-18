import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/SessionProvider';
import { QueryProvider } from '@/components/query-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error-boundary';
import { MainLayout } from '@/components/layout/main-layout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://eshop.example.com'),
  title: {
    default: 'E-Shop - Your Trusted Online Marketplace',
    template: '%s | E-Shop',
  },
  description:
    'Discover quality products at great prices. Shop electronics, fashion, home goods, and more with fast shipping and easy returns.',
  keywords: [
    'e-commerce',
    'online shopping',
    'marketplace',
    'electronics',
    'fashion',
    'home goods',
  ],
  authors: [{ name: 'E-Shop' }],
  creator: 'E-Shop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://eshop.example.com',
    title: 'E-Shop - Your Trusted Online Marketplace',
    description:
      'Discover quality products at great prices. Shop electronics, fashion, home goods, and more.',
    siteName: 'E-Shop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Shop - Your Trusted Online Marketplace',
    description:
      'Discover quality products at great prices. Shop electronics, fashion, home goods, and more.',
    creator: '@eshop',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider defaultTheme="system" storageKey="eshop-theme">
            <SessionProvider>
              <QueryProvider>
                <MainLayout>{children}</MainLayout>
                <Toaster />
              </QueryProvider>
            </SessionProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
