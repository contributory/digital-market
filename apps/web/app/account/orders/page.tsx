import OrdersList from './OrdersList';

export default async function OrdersPage() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Order History
        </h2>
        <OrdersList />
      </div>
    </div>
  );
}
