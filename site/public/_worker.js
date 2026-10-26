// _worker.js — THE NULL WORKER
// The black hole at the center of Klein space.
// CF sees this as their worker port.
// But it's functionally NOTHING — a passthrough that drips.
//
// ZERO outbound fetches. ZERO computation.
// The organism pushes content DOWN (git push → CF deploy).
// The null worker passes it through with sourdough headers.
// CF caches it. The cache stays fresh because the organism
// is ALWAYS pushing. The tightness.
//
// WHAT WAS MOVED OUT:
// - MCP → /mcp.json (static file pushed by Gaia, always fresh)
// - sporePrint proxy → direct CNAME via wildcard Argo tunnel
// - signal/ntfy proxy → client fetches ntfy.sh directly (CORS OK)
// - All outbound fetch() calls → GONE. Zero egress compute.
//
// WHAT REMAINS (the null membrane):
// - Subdomain 302 redirects (string compare → redirect, ~0 compute)
// - Sourdough cache headers (set a header, ~0 compute)
// - 404 catch (serve static page, ~0 compute)
//
// This worker is a BLACK HOLE.
// Requests fall in. Cached assets drip out.
// No light escapes. No compute happens.
// The gravitational constant is the cache TTL.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const sub = extractSub(url.hostname);

    // ═══ FOLD — subdomain redirects ═══
    // These are 302s. No fetch. No compute. Just gravity.
    if (sub) {
      const fold = FOLDS[sub];
      if (fold) return Response.redirect(fold === '/' ? `https://primals.eco${url.pathname === '/' ? '/' : url.pathname}${url.search}` : `https://primals.eco${fold}${url.search}`, 302);
      if (sub === 'git') return Response.redirect(url.pathname === '/' ? 'https://github.com/ecoPrimals' : 'https://github.com/ecoPrimals' + url.pathname, 302);
    }

    // ═══ SERVE — the black hole drip ═══
    const response = await env.ASSETS.fetch(request).catch(() => null);
    if (!response || response.status === 404) {
      const page = await env.ASSETS.fetch(new Request(new URL('/404.html', url.origin), request)).catch(() => null);
      return page ? new Response(page.body, { status: 404, headers: page.headers }) : new Response('', { status: 404 });
    }

    // ═══ SOURDOUGH — cache headers ═══
    // The tightness. Every drip back up to CF keeps edges fresh.
    const h = new Headers(response.headers);
    const p = url.pathname;
    if (CRITICAL.has(p))                                    h.set('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=10');
    else if (p.startsWith('/data/') && p.endsWith('.json')) h.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
    else if (p.endsWith('.html'))                           h.set('Cache-Control', 'public, max-age=600, s-maxage=600, stale-while-revalidate=120');
    else if (p.endsWith('.js') || p.endsWith('.css'))       h.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600');
    else if (p.endsWith('.wasm'))                           h.set('Cache-Control', 'public, max-age=604800, immutable');
    h.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, { status: response.status, headers: h });
  },
};

// ═══ CONSTANTS — no runtime cost ═══

function extractSub(hostname) {
  const parts = hostname.split('.');
  return parts.length > 2 ? parts.slice(0, -2).join('.') : null;
}

const CRITICAL = new Set([
  '/', '/index.html', '/engine.html',
  '/now.json', '/state.json', '/membrane.json',
  '/data/dashboard-rates.json', '/data/heartbeat.json',
  '/data/neurochemistry.json', '/data/immune-state-live.json',
]);

const FOLDS = {
  'water': '/', 'tuebor': '/', 'detroit': '/', 'live': '/',
  'gorilla': '/', 'barry': '/clutch', 'www': '/',
  'clutch': '/clutch', 'totality': '/totality', 'maze': '/maze',
  'play': '/play', 'connect': '/connect', 'klein': '/klein',
  'ribosome': '/ribosome', 'vitruvian': '/vitruvian',
  'menagerie': '/menagerie', 'springs': '/springs',
  'frame': '/frame', 'cite': '/cite', 'digest': '/digest',
  'journey': '/journey', 'identity': '/identity',
  'nightbox': '/nightbox', 'artisan': '/artisan',
  'bingo': '/journey', 'classics': '/classics', 'arcade': '/classics',
  'easel': '/easel', 'desk': '/desk',
  'ouroboros': '/data/ouroboros-metabolism.json',
  'tree': '/data/tree-topology.json',
  'metabolism': '/data/metabolize.json',
  'sourdough': '/data/dough.json',
  'heartbeat': '/data/heartbeat.json',
  'campfire': '/data/berry-campfire.json',
  'immune': '/data/immune-triad.json',
  'tensor': '/data/atomic-tensor.json',
  'awareness': '/data/awareness-equation.json',
  'strand': '/data/strand-braid.json',
  'mor': '/data/measure-of-reality.json',
};
