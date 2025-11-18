import { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();

  const response = await fetch(`${API_URL}/products?${queryString}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
