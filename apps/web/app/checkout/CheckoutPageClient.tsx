'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ShippingAddressSchema } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCart } from '@/lib/hooks/useCart';
import { useCheckout, useDeliveryOptions } from '@/lib/hooks/useCheckout';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

type Step = 'shipping' | 'delivery' | 'review';

const CheckoutFormSchema = ShippingAddressSchema.extend({
  guestEmail: z.string().email().optional(),
  deliveryOptionId: z.string().min(1, 'Please select a delivery option'),
});

type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

export function CheckoutPageClient() {
  const [step, setStep] = useState<Step>('shipping');
  const { data: session } = useSession();
  const { cart, isLoading: isLoadingCart } = useCart();
  const { data: deliveryOptions } = useDeliveryOptions();
  const { createCheckoutSession, isCreating } = useCheckout();
  const { toast } = useToast();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
      guestEmail: '',
      deliveryOptionId: '',
    },
  });

  const deliveryOptionId = form.watch('deliveryOptionId');
  const selectedDelivery = deliveryOptions?.find(
    (opt) => opt.id === deliveryOptionId
  );

  if (isLoadingCart) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card>
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

  const onSubmit = (data: CheckoutFormData) => {
    const { deliveryOptionId, guestEmail, ...shippingAddress } = data;

    createCheckoutSession(
      {
        shippingAddress,
        deliveryOptionId,
        guestEmail: !session ? guestEmail : undefined,
      },
      {
        onSuccess: (response) => {
          if (response.url) {
            window.location.href = response.url;
          }
        },
        onError: (error) => {
          toast({
            title: 'Checkout failed',
            description: error.message || 'Failed to create checkout session',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleNext = async () => {
    if (step === 'shipping') {
      const shippingFields: (keyof CheckoutFormData)[] = [
        'fullName',
        'addressLine1',
        'city',
        'state',
        'postalCode',
        'country',
        'phone',
      ];

      if (!session) {
        shippingFields.push('guestEmail');
      }

      const isValid = await form.trigger(shippingFields);
      if (isValid) {
        setStep('delivery');
      }
    } else if (step === 'delivery') {
      const isValid = await form.trigger('deliveryOptionId');
      if (isValid) {
        setStep('review');
      }
    }
  };

  const orderTotal = cart.total + (selectedDelivery?.price || 0);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center mb-6">
            <div
              className={`flex items-center ${
                step === 'shipping' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'shipping'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div
              className={`flex items-center ${
                step === 'delivery' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'delivery'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Delivery</span>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div
              className={`flex items-center ${
                step === 'review' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'review'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Review</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 'shipping' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!session && (
                      <FormField
                        control={form.control}
                        name="guestEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addressLine1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addressLine2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Apt 4B" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {step === 'delivery' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="deliveryOptionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-3">
                              {deliveryOptions?.map((option) => (
                                <label
                                  key={option.id}
                                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                                    field.value === option.id
                                      ? 'border-primary bg-primary/5'
                                      : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      {...field}
                                      value={option.id}
                                      checked={field.value === option.id}
                                      className="w-4 h-4"
                                    />
                                    <div>
                                      <p className="font-medium">
                                        {option.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {option.description}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="font-semibold">
                                    ${option.price.toFixed(2)}
                                  </p>
                                </label>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {step === 'review' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Order</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      <div className="text-sm text-muted-foreground">
                        <p>{form.getValues('fullName')}</p>
                        <p>{form.getValues('addressLine1')}</p>
                        {form.getValues('addressLine2') && (
                          <p>{form.getValues('addressLine2')}</p>
                        )}
                        <p>
                          {form.getValues('city')}, {form.getValues('state')}{' '}
                          {form.getValues('postalCode')}
                        </p>
                        <p>{form.getValues('country')}</p>
                        <p>{form.getValues('phone')}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Delivery Method</h3>
                      {selectedDelivery && (
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium">{selectedDelivery.name}</p>
                          <p>{selectedDelivery.description}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Order Items</h3>
                      <div className="space-y-2">
                        {cart.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.productName} × {item.quantity}
                            </span>
                            <span>
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                {step !== 'shipping' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (step === 'delivery') setStep('shipping');
                      else if (step === 'review') setStep('delivery');
                    }}
                  >
                    Back
                  </Button>
                )}

                {step !== 'review' ? (
                  <Button type="button" onClick={handleNext}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount && cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${cart.tax.toFixed(2)}</span>
              </div>
              {selectedDelivery && (
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${selectedDelivery.price.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
