import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ count: 0 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/cart/count`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ count: 0 });
    }

    const data = await response.json();
    return NextResponse.json({ count: data.count || 0 });
  } catch (error) {
    console.error('Cart count API error:', error);
    return NextResponse.json({ count: 0 });
  }
}
