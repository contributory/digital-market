import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Shop by category',
};

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Shop by category</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Category listings coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
