import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // RBAC: Role-Based Access Control
    const isAdmin = token?.role === 'admin' || token?.role === 'manager';

    // 1. Protect Admin routes
    if (pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }

    // 2. Protect Admin APIs
    if (pathname.startsWith('/api/admin') && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Performance & Observability Header
    const response = NextResponse.next();
    response.headers.set('x-epicenter-shield', 'active');
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Publicly accessible paths
        if (
          pathname === '/' ||
          pathname === '/login' ||
          pathname === '/signup' ||
          pathname === '/experience' ||
          pathname.startsWith('/reset-password') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/gallery') || // Semi-public
          pathname.startsWith('/api/experiences') // Semi-public
        ) {
          return true;
        }

        // Everything else needs a session
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*', 
    '/api/admin/:path*',
    '/api/stats/:path*',
    '/api/users/:path*',
  ],
};
