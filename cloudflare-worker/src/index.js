// Cloudflare Worker for applehealthdata.com
// - Serves /commits as a GitHub API proxy (existing behavior)
// - Proxies everything else to the GitHub Pages origin
// - Adds RFC 8288 Link response headers on HTML responses for agent discovery

const GITHUB_PAGES_ORIGIN = 'https://krumjahn.github.io';

// RFC 8288 Link header values advertised on HTML responses.
// rel values: "service-doc" (RFC 8631), "sitemap" (IANA), "terms-of-service" (IANA),
// "help" (IANA), "author" (IANA).
const LINK_HEADER = [
  '</docs/api-reference.html>; rel="service-doc"; type="text/html"',
  '</docs/>; rel="help"; type="text/html"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</privacy/>; rel="privacy-policy"; type="text/html"',
  '</robots.txt>; rel="describedby"; type="text/plain"'
].join(', ');

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/commits') {
      return handleCommits(request, url, env);
    }

    return handleProxy(request, url);
  }
};

async function handleProxy(request, url) {
  const originUrl = new URL(url.pathname + url.search, GITHUB_PAGES_ORIGIN);

  const originReq = new Request(originUrl.toString(), {
    method: request.method,
    headers: stripHopByHop(request.headers),
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual'
  });

  const originRes = await fetch(originReq);

  const headers = new Headers(originRes.headers);
  const contentType = headers.get('Content-Type') || '';

  if (contentType.includes('text/html')) {
    headers.set('Link', LINK_HEADER);
  }

  return new Response(originRes.body, {
    status: originRes.status,
    statusText: originRes.statusText,
    headers
  });
}

async function handleCommits(request, url, env) {
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
      'Cache-Control': 'public, max-age=120'
    }
  });
}

function stripHopByHop(headers) {
  const out = new Headers(headers);
  const hopByHop = ['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
    'te', 'trailers', 'transfer-encoding', 'upgrade', 'host'];
  for (const h of hopByHop) out.delete(h);
  out.set('Host', new URL(GITHUB_PAGES_ORIGIN).host);
  return out;
}

function clampInt(value, min, max) {
  const n = parseInt(String(value), 10);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}
