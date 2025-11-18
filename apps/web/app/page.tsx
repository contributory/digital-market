import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function Home() {
  const session = await auth();

  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">
            Welcome to the E-Commerce Platform
          </CardTitle>
          <CardDescription>
            {session
              ? `Hello, ${session.user.name}! Explore our marketplace.`
              : 'Sign in to start shopping and access exclusive features.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Features:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>User registration and login with JWT tokens</li>
              <li>Protected routes for authenticated users</li>
              <li>Role-based access control (Customer / Admin)</li>
              <li>Automatic token refresh</li>
              <li>Secure cookie-based session storage</li>
              <li>Responsive UI with dark mode support</li>
              <li>Real-time cart updates</li>
              <li>Accessible components with keyboard navigation</li>
            </ul>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-3">Quick Actions:</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
              <Link href="/checkout">
                <Button variant="secondary">Go to Checkout</Button>
              </Link>
              {session && (
                <Link href="/account">
                  <Button variant="outline">View Account</Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
