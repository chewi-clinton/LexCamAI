/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const um = process.env.USER_MANAGEMENT_URL  || 'http://localhost:8001';
    const ls = process.env.LAWYER_SERVICE_URL   || 'http://localhost:8002';
    const ds = process.env.DOCUMENT_SERVICE_URL || 'http://localhost:8006';
    const ps = process.env.PAYMENT_SERVICE_URL  || 'http://localhost:8007';
    const rs = process.env.RAG_SERVICE_URL       || 'http://localhost:8004';
    const kb = process.env.KNOWLEDGE_BASE_URL   || 'http://localhost:8003';

    return [
      { source: '/api/v1/auth/:path*',      destination: `${um}/api/v1/auth/:path*` },
      { source: '/api/v1/users/:path*',     destination: `${um}/api/v1/users/:path*` },
      { source: '/api/v1/lawyers/:path*',   destination: `${ls}/api/v1/lawyers/:path*` },
      { source: '/api/v1/referrals/:path*', destination: `${ls}/api/v1/referrals/:path*` },
      { source: '/api/v1/documents/:path*', destination: `${ds}/api/v1/documents/:path*` },
      { source: '/api/v1/payments/:path*',  destination: `${ps}/api/v1/payments/:path*` },
      { source: '/api/v1/chat/:path*',      destination: `${rs}/api/v1/chat/:path*` },
      { source: '/api/v1/query/:path*',     destination: `${rs}/api/v1/query/:path*` },
      { source: '/api/kb/:path*',           destination: `${kb}/api/v1/:path*` },
    ];
  },
};

export default nextConfig;
