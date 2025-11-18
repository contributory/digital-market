import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our collection of quality products',
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Browse our collection of quality products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Product catalog coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
