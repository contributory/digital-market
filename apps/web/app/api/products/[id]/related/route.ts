const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const response = await fetch(`${API_URL}/products/${id}/related`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
