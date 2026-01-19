export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Simple CORS + security: allow only your production origin (and localhost for testing)
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = new Set([
      'https://applehealthdata.com',
      'https://www.applehealthdata.com',
      'http://localhost:8787'
    ]);

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://applehealthdata.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Proxy endpoint for commits
    if (url.pathname !== '/commits') {
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    }

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;

    const page = clampInt(url.searchParams.get('page') ?? '1', 1, 200);
    const perPage = clampInt(url.searchParams.get('per_page') ?? '10', 1, 50);

    if (!env.GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: 'Missing GitHub token' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const ghUrl = `https://api.github.com/repos/${owner}/${repo}/commits?page=${page}&per_page=${perPage}`;

    const ghRes = await fetch(ghUrl, {
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'User-Agent': 'applehealthdata-changelog-worker',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Pass through rate limit headers (useful for debugging)
    const rateHeaders = {
      'X-RateLimit-Limit': ghRes.headers.get('X-RateLimit-Limit') || '',
      'X-RateLimit-Remaining': ghRes.headers.get('X-RateLimit-Remaining') || '',
      'X-RateLimit-Reset': ghRes.headers.get('X-RateLimit-Reset') || ''
    };

    const bodyText = await ghRes.text();

    return new Response(bodyText, {
      status: ghRes.status,
      headers: {
        ...corsHeaders,
        ...rateHeaders,
        'Content-Type': 'application/json',
        // Cache at edge for 2 minutes to reduce GitHub API pressure
        'Cache-Control': 'public, max-age=120'
      }
    });
  }
};

function clampInt(value, min, max) {
  const n = parseInt(String(value), 10);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}
