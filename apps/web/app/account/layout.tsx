import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AccountSidebar from './components/AccountSidebar';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          <aside className="lg:col-span-3">
            <AccountSidebar />
          </aside>
          <div className="lg:col-span-9 mt-6 lg:mt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
