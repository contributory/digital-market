import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">E-Commerce App</h1>
            </div>
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <span className="text-gray-700">
                    Hello, {session.user.name}
                  </span>
                  <Link
                    href="/account"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Account
                  </Link>
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      Admin
                    </Link>
                  )}
                  <form
                    action={async () => {
                      'use server';
                      await signOut({ redirectTo: '/login' });
                    }}
                  >
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-500"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to the E-Commerce Platform
          </h2>
          <p className="text-gray-600 mb-6">
            This is a demo application with NextAuth authentication integration.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Features:
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>User registration and login with JWT tokens</li>
                <li>Protected routes for authenticated users</li>
                <li>Role-based access control (Customer / Admin)</li>
                <li>Automatic token refresh</li>
                <li>Secure cookie-based session storage</li>
              </ul>
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Try it out:
              </h3>
              <div className="flex gap-4">
                <Link
                  href="/checkout"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Go to Checkout
                </Link>
                <Link
                  href="/account"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  View Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
