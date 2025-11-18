import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@repo/shared';

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== UserRole.ADMIN) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-4">
            Welcome, {session.user.name}! This is a protected admin-only page.
          </p>
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Admin Actions
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>Manage users</li>
                <li>View analytics</li>
                <li>Configure system settings</li>
                <li>Access admin tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
