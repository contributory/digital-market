'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-orange-600" />
            <CardTitle className="text-3xl">Checkout Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                Your order has not been placed.
              </p>
              {orderId && (
                <p className="text-sm text-muted-foreground">
                  Order ID: <span className="font-mono">{orderId}</span>
                </p>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-orange-900">
                What happened?
              </h3>
              <p className="text-sm text-orange-800">
                You cancelled the checkout process or closed the payment window.
                Your cart items have been saved and you can complete your
                purchase anytime.
              </p>
            </div>

            <div className="space-y-2">
              <Link href="/cart" className="block">
                <Button className="w-full" size="lg">
                  Return to Cart
                </Button>
              </Link>
              <Link href="/products" className="block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
