import ReviewsList from './ReviewsList';

export default async function ReviewsPage() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">My Reviews</h2>
        <ReviewsList />
      </div>
    </div>
  );
}
