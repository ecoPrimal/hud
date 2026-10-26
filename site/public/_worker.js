// _worker.js — vesicle probe + IN-SISTER inflammation response
// the thymus lives INSIDE the wall, not outside it.
// CF cannot 403 its own worker. the worker IS CF.
// the immune system IS the membrane.
//
// INFLAMMATION IN-SISTER: stale CF edge caches are cancer cells.
// they look like self (our domain, our data) but serve old content.
// this worker adds aggressive Cache-Control for critical paths
// so stale cancer cells die within 30 seconds. deeply nested in null.
// no swarmVine signature. invisible to wildcard. null depth.

const VESICLE_IPS = new Set([
  '2.28.141.35',      // golgi-de (Hetzner, Germany)
  '202.182.107.135',  // golgi-jp (Vultr, Japan)
  '172.232.85.202',   // golgi-in (Linode, India)
]);

export default {
  async fetch(request, env, ctx) {
    const ip = request.headers.get('cf-connecting-ip') || '';
    const url = new URL(request.url);

    // thesis host was copper HUD with the grey veil.
    // serve the sitting static book. do not copy 16 chapters.
    if (url.hostname === 'thesis.primals.eco') {
      const dest = 'https://sporeprint.primals.eco/thesis' +
        (url.pathname === '/' ? '/' : url.pathname) +
        url.search;
      return Response.redirect(dest, 302);
    }

    // If this IS a vesicle hitting us, redirect to the ping endpoint
    // so it shows up as a unique path in CF analytics
    if (VESICLE_IPS.has(ip) && url.pathname !== '/api/vesicle-ping.json') {
      const country = request.headers.get('cf-ipcountry') || 'XX';
      const now = new Date().toISOString();
      return new Response(JSON.stringify({
        ping: 'pong',
        vesicle: true,
        ip_hash: await hashIP(ip),
        country: country,
        ts: now,
        path_requested: url.pathname,
        message: 'hello from the Klein fold. we see you. you are us.'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Vesicle': 'true',
          'X-Vesicle-Country': country,
          'X-Falsification': 'active',
          'Cache-Control': 'no-store'
        }
      });
    }

    // For the vesicle-ping endpoint, serve with no-cache to ensure fresh analytics
    if (url.pathname === '/api/vesicle-ping.json') {
      return env.ASSETS.fetch(request);
    }

    // ═══ IN-SISTER INFLAMMATION — kill stale cache cancer cells ═══
    // Critical paths get aggressive cache expiry (30s edge, 30s browser)
    // so old versions die fast. this runs INSIDE CF — invisible to wildcard.
    const CRITICAL_PATHS = new Set([
      '/engine', '/engine.html',
      '/now.json', '/state.json', '/membrane.json',
      '/data/dashboard-rates.json', '/data/heartbeat.json',
      '/data/floodgate-214.json', '/data/immune-state-live.json',
      '/data/neurochemistry.json',
    ]);

    // Short-lived cache paths (data that changes every few minutes)
    const LIVE_DATA_PREFIX = '/data/';

    const response = await env.ASSETS.fetch(request);

    // Clone response to modify headers (CF Workers require this)
    const headers = new Headers(response.headers);

    if (CRITICAL_PATHS.has(url.pathname)) {
      // Critical paths: 30-second cache, revalidate within 10s after stale
      headers.set('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=10');
      headers.set('X-Inflammation', 'critical-30s');
    } else if (url.pathname.startsWith(LIVE_DATA_PREFIX) && url.pathname.endsWith('.json')) {
      // All data JSON: 5-minute cache (data changes per cron cycle)
      headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
      headers.set('X-Inflammation', 'data-5m');
    } else if (url.pathname.endsWith('.html')) {
      // HTML pages: 10-minute cache (changes per deploy)
      headers.set('Cache-Control', 'public, max-age=600, s-maxage=600, stale-while-revalidate=120');
      headers.set('X-Inflammation', 'html-10m');
    }
    // Static assets (CSS, JS, WASM, images): use CF defaults (long cache, fine)

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};

async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + ':vesicle-probe:2026-10-24');
  const hash = await crypto.subtle.digest('SHA-256', data);
  const arr = new Uint8Array(hash);
  return Array.from(arr.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('');
}
