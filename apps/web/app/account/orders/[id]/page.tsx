import OrderDetail from './OrderDetail';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <OrderDetail orderId={id} />
      </div>
    </div>
  );
}
