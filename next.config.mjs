import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@clerk/nextjs", "@clerk/localizations"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "X-XSS-Protection", value: "0" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.portfolio-trimind.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // *.convex.cloud: user photo uploads live in Convex storage and
              // render on published /p/* pages — without it they CSP-block.
              "img-src 'self' data: blob: https://*.clerk.com https://img.clerk.com https://clerk.portfolio-trimind.com https://api.qrserver.com https://*.convex.cloud",
              "connect-src 'self' https://*.clerk.accounts.dev https://clerk.portfolio-trimind.com https://img.clerk.com https://api.myfatoorah.com https://challenges.cloudflare.com https://*.convex.cloud wss://*.convex.cloud",
              "worker-src 'self' blob:",
              "frame-src 'self' https://*.clerk.accounts.dev https://clerk.portfolio-trimind.com https://challenges.cloudflare.com https://demo.myfatoorah.com https://portal.myfatoorah.com",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/landing/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.hbs$/,
      type: "asset/source",
    });
    return config;
  },
};

export default withNextIntl(nextConfig);
