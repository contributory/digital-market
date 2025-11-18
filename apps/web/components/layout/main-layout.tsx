'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from './header';
import { Footer } from './footer';
import { MobileNav } from './mobile-nav';
import { SkipLink } from '../skip-link';

interface MainLayoutProps {
  children: React.ReactNode;
}

async function getCartItemCount(): Promise<number> {
  try {
    const response = await fetch('/api/cart/count');
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count || 0;
  } catch (_error) {
    return 0;
  }
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const { data: cartItemCount = 0 } = useQuery({
    queryKey: ['cart', 'count'],
    queryFn: getCartItemCount,
    refetchInterval: 30000,
  });

  return (
    <>
      <SkipLink />
      <div className="relative flex min-h-screen flex-col">
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
          cartItemCount={cartItemCount}
        />
        <MobileNav open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
