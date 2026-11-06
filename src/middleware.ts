import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For security, any hit to the old auth endpoint redirects to login to avoid crash loops.
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
     return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/auth/:path*',
};
