'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

export function CartPageClient() {
  const {
    cart,
    isLoading,
    updateCartItem,
    removeCartItem,
    applyPromoCode,
    removePromoCode,
    isUpdating,
  } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    updateCartItem(
      { itemId, data: { quantity } },
      {
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to update quantity',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleRemoveItem = (itemId: string) => {
    removeCartItem(itemId, {
      onSuccess: () => {
        toast({
          title: 'Item removed',
          description: 'Item has been removed from your cart',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to remove item',
          variant: 'destructive',
        });
      },
    });
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    applyPromoCode(
      { promoCode: promoCode.trim() },
      {
        onSuccess: () => {
          toast({
            title: 'Promo code applied',
            description: 'Your discount has been applied',
          });
          setPromoCode('');
          setIsApplyingPromo(false);
        },
        onError: (error) => {
          toast({
            title: 'Invalid promo code',
            description: error.message || 'The promo code is invalid',
            variant: 'destructive',
          });
          setIsApplyingPromo(false);
        },
      }
    );
  };

  const handleRemovePromo = () => {
    removePromoCode(undefined, {
      onSuccess: () => {
        toast({
          title: 'Promo code removed',
          description: 'Your discount has been removed',
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Shopping Cart</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-4">
              Your cart is empty
            </p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const insufficientStock = item.quantity > item.stock;

            return (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-md flex-shrink-0 relative">
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover rounded-md"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="font-semibold hover:text-primary"
                      >
                        {item.productName}
                      </Link>
                      {item.variantName && (
                        <p className="text-sm text-muted-foreground">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-lg font-bold mt-2">
                        ${item.price.toFixed(2)}
                      </p>

                      {insufficientStock && (
                        <p className="text-sm text-red-600 mt-1">
                          Only {item.stock} left in stock
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock || isUpdating}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating}
                      >
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>

                      <p className="text-lg font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                {cart.discount && cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount
                      {cart.promoCode && ` (${cart.promoCode})`}
                    </span>
                    <span>-${cart.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${cart.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Promo Code</label>
                {cart.promoCode ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-md bg-green-50 text-green-700">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm">{cart.promoCode}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePromo}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyPromo();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim() || isApplyingPromo}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push('/checkout')}
                disabled={cart.items.some((item) => item.quantity > item.stock)}
              >
                Proceed to Checkout
              </Button>
              <Link href="/products" className="w-full">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
