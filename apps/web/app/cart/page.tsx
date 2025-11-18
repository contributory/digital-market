import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'View your shopping cart',
};

export default function CartPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Shopping Cart</CardTitle>
          <CardDescription>Review items in your cart</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your cart is empty</p>
        </CardContent>
      </Card>
    </div>
  );
}
