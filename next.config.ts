import type { NextConfig } from "next";

/**
 * The SPA must call the Laravel API on its own origin for Sanctum's stateful
 * cookie/CSRF flow to work: the XSRF-TOKEN cookie has to be readable by the
 * page and the session cookie has to be first-party. These rewrites proxy the
 * API paths to the local Laravel server (`php artisan serve`) so the browser
 * only ever talks to the Next.js origin, whether it is reached directly
 * (`http://localhost:3000`) or through the XAMPP reverse proxy
 * (`http://lonepay.local`).
 */
const apiProxyTarget = (
  process.env.API_PROXY_TARGET || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/sanctum/:path*",
        destination: `${apiProxyTarget}/sanctum/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
