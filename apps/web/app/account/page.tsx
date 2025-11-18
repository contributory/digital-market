import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Account Dashboard
          </h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Profile Information
              </h2>
              <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {session.user.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {session.user.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {session.user.role}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-6">
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/login' });
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
