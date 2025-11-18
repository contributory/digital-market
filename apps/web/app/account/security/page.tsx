import ChangePasswordForm from './ChangePasswordForm';
import SessionHistory from './SessionHistory';

export default async function SecurityPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Change Password
          </h2>
          <ChangePasswordForm />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Login History
          </h2>
          <SessionHistory />
        </div>
      </div>
    </div>
  );
}
