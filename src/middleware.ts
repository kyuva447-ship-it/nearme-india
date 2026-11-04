import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path.startsWith('/admin') || path.startsWith('/owner-profit')) {
        return token?.role === 'admin' || token?.role === 'owner';
      }
      if (path.startsWith('/merchant')) {
        return !!token;
      }
      return true;
    }
  }
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/owner-profit/:path*',
    '/merchant/:path*',
    '/escrow/:path*',
    '/bargain/:path*',
    '/franchise/:path*'
  ]
};
