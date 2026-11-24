import { NextRequest, NextResponse } from 'next/server';

const ROUTE_LOCALES = new Set(['tr', 'en', 'de', 'es', 'ru', 'fr', 'ar', 'zh']);

export function proxy(request: NextRequest) {
  const locale = request.nextUrl.pathname.split('/')[1]?.toLowerCase();
  if (!locale || !ROUTE_LOCALES.has(locale)) return NextResponse.next();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-xucuz-route-locale', locale);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ['/tr', '/tr/:path*', '/en', '/en/:path*', '/de', '/de/:path*', '/es', '/es/:path*', '/ru', '/ru/:path*', '/fr', '/fr/:path*', '/ar', '/ar/:path*', '/zh', '/zh/:path*'] };
