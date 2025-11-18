import AddressesList from './AddressesList';

export default async function AddressesPage() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Saved Addresses
        </h2>
        <AddressesList />
      </div>
    </div>
  );
}
