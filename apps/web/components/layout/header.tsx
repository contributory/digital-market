'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Moon,
  Sun,
  Search as SearchIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { SearchBar } from './search-bar';

interface HeaderProps {
  onMenuClick: () => void;
  cartItemCount?: number;
}

export function Header({ onMenuClick, cartItemCount = 0 }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [showSearch, setShowSearch] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">E-Shop</span>
            </Link>

            <nav className="hidden lg:flex lg:gap-6 lg:ml-8" role="navigation">
              <Link
                href="/"
                className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1"
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-2 py-1"
              >
                Categories
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block flex-1 max-w-md">
              <SearchBar />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Toggle search"
            >
              <SearchIcon className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Link
              href="/cart"
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="danger"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="User menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-semibold">
                    {session.user.name}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className="flex cursor-pointer items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="flex cursor-pointer items-center"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/api/auth/signout"
                      className="flex cursor-pointer items-center text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {showSearch && (
          <div className="md:hidden pb-4">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  );
}
