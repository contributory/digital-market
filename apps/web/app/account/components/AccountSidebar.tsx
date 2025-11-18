'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Profile', href: '/account', icon: '👤' },
  { name: 'Addresses', href: '/account/addresses', icon: '📍' },
  { name: 'Orders', href: '/account/orders', icon: '📦' },
  { name: 'Reviews', href: '/account/reviews', icon: '⭐' },
  { name: 'Security', href: '/account/security', icon: '🔒' },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/account' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <span className="mr-3 text-lg" aria-hidden="true">
              {item.icon}
            </span>
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
