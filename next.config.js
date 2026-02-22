/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const cspReportOnly = process.env.CSP_REPORT_ONLY === "true";

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  ...(isProd ? ["script-src 'self' 'unsafe-inline'"] : ["script-src 'self' 'unsafe-inline' 'unsafe-eval'"]),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss: http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:*",
  "frame-src 'self'",
  "worker-src 'self' blob:",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
];

const cspValue = cspDirectives.join("; ");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: cspReportOnly
              ? "Content-Security-Policy-Report-Only"
              : "Content-Security-Policy",
            value: cspValue,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;



