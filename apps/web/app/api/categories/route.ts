const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET() {
  const response = await fetch(`${API_URL}/categories`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
