import { Metadata } from 'next';
import { CheckoutPageClient } from './CheckoutPageClient';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your purchase',
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
