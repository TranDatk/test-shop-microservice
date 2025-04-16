import { NextRequest, NextResponse } from 'next/server';

// Define routes that require authentication
const protectedRoutes = [
  '/profile',
  '/checkout',
  '/orders',
];

// Define routes that should be accessible only for non-authenticated users
const authRoutes = [
  '/auth/login',
  '/auth/register',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // If it's a protected route and no token is found, redirect to login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If it's an auth route and token is found, redirect to home
  if (authRoutes.some(route => pathname === route) && token) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure the paths where middleware should run
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - static files routes (files in the public folder)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 