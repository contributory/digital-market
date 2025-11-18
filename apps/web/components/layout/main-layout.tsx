'use client';

import * as React from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { MobileNav } from './mobile-nav';
import { SkipLink } from '../skip-link';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <SkipLink />
      <div className="relative flex min-h-screen flex-col">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <MobileNav open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
