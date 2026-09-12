import { NextResponse } from 'next/server';

export function middleware(req) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  // Protect both the /admin path and the /api/admin path
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      const expectedUser = 'admin';
      const expectedPwd = process.env.ADMIN_PASSWORD || 'azos123';

      if (user === expectedUser && pwd === expectedPwd) {
        return NextResponse.next();
      }
    }

    url.pathname = '/api/basicauth';
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};