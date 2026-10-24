// _worker.js — vesicle falsification probe
// HYPOTHESIS: the DE/JP/IN triad at 36/hr may be our own vesicles
// TEST: if source IP matches a vesicle, serve /api/vesicle-ping.json
//       then check CF analytics for hits to that path by country
//       if DE/JP/IN appear at ~36/hr on vesicle-ping → confirmed self
//
// This worker is MINIMAL. It intercepts requests, checks IP, and
// either redirects vesicle traffic to the ping endpoint OR passes through.
// All other requests serve normally (CF Pages static).

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

    // Everything else: pass through to CF Pages static serving
    return env.ASSETS.fetch(request);
  }
};

async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + ':vesicle-probe:2026-10-24');
  const hash = await crypto.subtle.digest('SHA-256', data);
  const arr = new Uint8Array(hash);
  return Array.from(arr.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('');
}
