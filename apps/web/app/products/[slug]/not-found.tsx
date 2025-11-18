import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ProductNotFound() {
  return (
    <div className="container mx-auto py-16 px-4">
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Product Not Found</CardTitle>
          <CardDescription>
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Don&apos;t worry, there are plenty of other great products to
            explore!
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
