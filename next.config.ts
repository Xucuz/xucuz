import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'standalone', poweredByHeader: false,
  async headers() { return [{ source: '/:path*', headers: [
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'X-Frame-Options',value:'DENY'},
    {key:'Permissions-Policy',value:'camera=(self), microphone=(self), geolocation=()'},
    {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.googlesyndication.com; font-src 'self'; connect-src 'self' https://pagead2.googlesyndication.com https://*.googlesyndication.com; frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"},
    ...(process.env.NODE_ENV === 'production' ? [{key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains'}] : [])
  ]}]; }
};
export default config;
