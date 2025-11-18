import { auth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return Response.json(
      { status: 'error', message: 'Authentication required' },
      { status: 401 }
    );
  }

  const body = await request.json();

  const response = await fetch(`${API_URL}/products/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
