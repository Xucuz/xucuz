import { NextRequest, NextResponse } from 'next/server';

const ROUTE_LOCALES = new Set(['tr', 'en', 'de', 'es']);

export function proxy(request: NextRequest) {
  const locale = request.nextUrl.pathname.split('/')[1]?.toLowerCase();
  if (!locale || !ROUTE_LOCALES.has(locale)) return NextResponse.next();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-xucuz-route-locale', locale);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ['/tr/:path*', '/en/:path*', '/de/:path*', '/es/:path*'] };
