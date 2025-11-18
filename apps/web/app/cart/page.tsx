import { Metadata } from 'next';
import { CartPageClient } from './CartPageClient';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'View your shopping cart',
};

export default function CartPage() {
  return <CartPageClient />;
}
