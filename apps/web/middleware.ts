import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@repo/shared';

export default auth((req) => {
  const token = req.auth;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ['/account', '/checkout', '/admin'];
  const adminRoutes = ['/admin'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && token?.user?.role !== UserRole.ADMIN) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
