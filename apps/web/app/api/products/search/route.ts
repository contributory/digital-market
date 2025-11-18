import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const results: SearchResult[] = await response.json();
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json([]);
  }
}
