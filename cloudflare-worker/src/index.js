// Cloudflare Worker for applehealthdata.com
// - Serves /commits as a GitHub API proxy (existing behavior)
// - Proxies everything else to the GitHub Pages origin
// - Adds RFC 8288 Link response headers on HTML responses for agent discovery
// - Converts HTML to Markdown when request includes Accept: text/markdown

const GITHUB_PAGES_ORIGIN = 'https://krumjahn.github.io';

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
    if (url.pathname === '/commits') return handleCommits(request, url, env);
    return handleProxy(request, url);
  }
};

function acceptsMarkdown(request) {
  const accept = request.headers.get('Accept') || '';
  return accept.includes('text/markdown');
}

async function handleProxy(request, url) {
  const wantsMarkdown = acceptsMarkdown(request);

  const originHeaders = stripHopByHop(request.headers);
  if (wantsMarkdown) {
    originHeaders.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
  }

  const originUrl = new URL(url.pathname + url.search, 'https://applehealthdata.com');
  const originReq = new Request(originUrl.toString(), {
    method: request.method,
    headers: originHeaders,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
    cf: { resolveOverride: 'krumjahn.github.io' }
  });

  const originRes = await fetch(originReq);
  const contentType = originRes.headers.get('Content-Type') || '';
  const isHtml = contentType.includes('text/html');

  const headers = new Headers(originRes.headers);
  if (isHtml) headers.set('Link', LINK_HEADER);

  if (isHtml && wantsMarkdown) {
    const html = await originRes.text();
    const markdown = htmlToMarkdown(html);

    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    headers.set('X-Markdown-Tokens', String(Math.ceil(markdown.length / 4)));
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');

    return new Response(markdown, { status: originRes.status, statusText: originRes.statusText, headers });
  }

  return new Response(originRes.body, { status: originRes.status, statusText: originRes.statusText, headers });
}

// Dependency-free HTML→Markdown converter safe for the Workers runtime (no DOM APIs).
function htmlToMarkdown(html) {
  let md = html;

  // Strip <head>, <script>, <style>, <nav>, <footer>, <svg> blocks entirely
  md = md.replace(/<head[\s\S]*?<\/head>/gi, '');
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  md = md.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  md = md.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  md = md.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n# ${clean(t)}\n`);
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${clean(t)}\n`);
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${clean(t)}\n`);
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n#### ${clean(t)}\n`);
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `\n##### ${clean(t)}\n`);
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, t) => `\n###### ${clean(t)}\n`);

  // Bold / italic
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, (_, _t, t) => `**${clean(t)}**`);
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, (_, _t, t) => `_${clean(t)}_`);

  // Code
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, t) => `\n\`\`\`\n${clean(t)}\n\`\`\`\n`);
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => `\`${clean(t)}\``);

  // Links and images
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => `[${clean(t)}](${href})`);
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, (_, alt, src) => `![${alt}](${src})`);
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, (_, src, alt) => `![${alt}](${src})`);

  // Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${clean(t)}\n`);
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');

  // Paragraphs and line breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n${clean(t)}\n`);
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Block-level wrappers — just unwrap, keep content
  md = md.replace(/<\/?(?:div|section|article|main|header|aside|span|label)[^>]*>/gi, '');

  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = md.replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/&quot;/g, '"')
         .replace(/&#39;/g, "'")
         .replace(/&nbsp;/g, ' ');

  // Collapse excessive blank lines
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

// Strip tags and trim for inline content
function clean(str) {
  return str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
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

  return new Response(await ghRes.text(), {
    status: ghRes.status,
    headers: { ...corsHeaders, ...rateHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' }
  });
}

function stripHopByHop(headers) {
  const out = new Headers(headers);
  for (const h of ['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
    'te', 'trailers', 'transfer-encoding', 'upgrade', 'host']) out.delete(h);
  return out;
}

function clampInt(value, min, max) {
  const n = parseInt(String(value), 10);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}
