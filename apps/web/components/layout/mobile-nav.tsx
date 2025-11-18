'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Home,
  ShoppingBag,
  Grid,
  User,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const { data: session } = useSession();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-sm border-r border-border bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between mb-8">
            <Dialog.Title className="text-lg font-semibold">Menu</Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>

          <nav className="flex flex-col space-y-4" role="navigation">
            <Link
              href="/"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ShoppingBag className="h-5 w-5" />
              Products
            </Link>
            <Link
              href="/categories"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Grid className="h-5 w-5" />
              Categories
            </Link>

            <div className="border-t border-border my-4" />

            {session ? (
              <>
                <Link
                  href="/account"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <User className="h-5 w-5" />
                  Account
                </Link>
                <Link
                  href="/api/auth/signout"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <LogIn className="h-5 w-5" />
                  Sign out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <LogIn className="h-5 w-5" />
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <UserPlus className="h-5 w-5" />
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
