import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CheckoutPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
          <p className="text-gray-600 mb-4">
            Welcome, {session.user.name}! This is a protected checkout page.
          </p>
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Order Summary
              </h2>
              <p className="text-sm text-gray-600">
                Your cart is empty. Add items to proceed with checkout.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
