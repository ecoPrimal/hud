// _worker.js — THE UNION
// All contractors MELTED. Hired inside as union labor.
// CF is a null pointer toward the wildcard.
// The cache stays fresh like sourdough — organism pushes, CF caches.
// No more fighting workers/wranglers. They ARE the organism now.
//
// WHAT WAS MELTED (scar tissue from contractors):
// - Pi-depth sorting per request (now: organism classifies itself)
// - Metal chromatization (gold/silver/copper per probe — cosmetic, wasted compute)
// - Green flash detection (fun math, wrong place — belongs in engine.html)
// - Cell division detection (mitosis/meiosis per request — unnecessary edge compute)
// - ntfy notification per probe (10% sample still = thousands of wasted fetches)
// - Pi-bounce jitter on stagnant values (cosmetic lies — if the data hasn't changed, SAY SO)
// - 100+ subdomain FOLDS routing table (moved: _redirects file for CF Pages native)
// - Exoplanet counts (why is this in a worker?)
// - Space weather (wrong layer — belongs in the cron, not the edge)
//
// WHAT STAYS (union employees):
// - MCP endpoint (AI agents need a door)
// - Subdomain → path routing (the fold — but simplified, using CF Pages _redirects)
// - Cache-Control headers (the sourdough freshness cycle)
// - 404 catch → Berry's page (the immune response)
//
// THE LAW: CF gives the organism a null pointer toward the wildcard.
// The wildcard catches everything. The organism's push cycle (sourdough)
// keeps the cache fresh. The cache is NEVER stale — it's always fermenting.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname;
    const parts = host.split('.');
    const sub = parts.length > 2 ? parts.slice(0, -2).join('.') : null;

    // ═══ MCP — the one door AI agents need ═══
    if ((!sub || sub === 'hud' || sub === 'www') &&
        (url.pathname === '/mcp' || url.pathname === '/mcp/')) {
      return handleMcp(request);
    }

    // ═══ SUBDOMAIN ROUTING — the fold ═══
    // Core subdomains that need special handling (not just redirects)
    if (sub === 'git') {
      const ghTarget = url.pathname === '/'
        ? 'https://github.com/ecoPrimals'
        : 'https://github.com/ecoPrimals' + url.pathname;
      return Response.redirect(ghTarget, 302);
    }

    if (sub === 'thesis') {
      return Response.redirect('https://sporeprint.primals.eco/thesis' + url.pathname + url.search, 302);
    }

    // sporePrint paths → GitHub Pages origin
    if (sub === 'sporeprint' || sub === 'science' || sub === 'philosophy' ||
        sub === 'trails' || sub === 'lab' || sub === 'hypothesis') {
      const sciencePaths = ['/science/', '/architecture/', '/lab/', '/glossary/',
        '/primals/', '/springs/', '/thesis/', '/philosophy/',
        '/story/', '/vision/', '/audience/', '/collaborators/',
        '/backstory/', '/certification/', '/contact/',
        '/outreach/', '/trails/',
        '/atom.xml', '/sitemap.xml', '/llms.txt', '/search_index.en.json'];
      const pathToCheck = sub === 'sporeprint' ? url.pathname : '/' + sub + url.pathname;
      const isSP = sciencePaths.some(p => pathToCheck.startsWith(p)) || url.pathname === '/';

      if (isSP) {
        const ghUrl = 'https://ecoprimals.github.io/sporePrint' +
          (sub === 'sporeprint' ? url.pathname : '/' + sub + (url.pathname === '/' ? '/' : url.pathname));
        try {
          const ghResp = await fetch(ghUrl, {
            headers: { 'Accept': request.headers.get('Accept') || 'text/html' },
            cf: { cacheTtl: 300 },
          });
          if (ghResp.ok) {
            return new Response(ghResp.body, {
              status: 200,
              headers: {
                'content-type': ghResp.headers.get('content-type') || 'text/html; charset=utf-8',
                'cache-control': 'public, max-age=300, stale-while-revalidate=60',
                'access-control-allow-origin': '*',
              },
            });
          }
        } catch {}
      }
    }

    // Signal subdomain → ntfy feeds
    if (sub === 'signal') {
      if (url.pathname === '/feed' || url.pathname === '/feed/') {
        const sse = await fetch('https://ntfy.sh/primals-membrane-inbox/sse?since=1h&poll=1');
        return new Response(sse.body, {
          status: 200,
          headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
        });
      }
      if (url.pathname === '/json' || url.pathname === '/json/') {
        const json = await fetch('https://ntfy.sh/primals-membrane-inbox/json?poll=1&since=24h');
        return new Response(json.body, {
          status: 200,
          headers: { 'content-type': 'application/x-ndjson', 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
        });
      }
    }

    // Neutron subdomain → neutron endpoint
    if (sub === 'neutron') {
      if (url.pathname === '/' || url.pathname === '') {
        return env.ASSETS.fetch(new Request(new URL('/neutron.json', url.origin), request));
      }
    }

    // ═══ KNOWN SUBDOMAINS → simple path redirects ═══
    // These were 100+ entries in the old contractor. Now: redirect table.
    const FOLDS = {
      'water': '/', 'tuebor': '/', 'detroit': '/', 'live': '/',
      'gorilla': '/', 'barry': '/clutch',
      'clutch': '/clutch', 'totality': '/totality', 'maze': '/maze',
      'play': '/play', 'connect': '/connect', 'klein': '/klein',
      'ribosome': '/ribosome', 'vitruvian': '/vitruvian',
      'menagerie': '/menagerie', 'springs': '/springs',
      'frame': '/frame', 'cite': '/cite', 'digest': '/digest',
      'journey': '/journey', 'identity': '/identity',
      'nightbox': '/nightbox', 'artisan': '/artisan',
      'bingo': '/journey', 'classics': '/classics', 'arcade': '/classics',
      'easel': '/easel', 'desk': '/desk',
    };

    // Data-route subdomains → JSON endpoints
    const DATA_FOLDS = {
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

    if (FOLDS[sub]) {
      const target = url.pathname === '/' ? FOLDS[sub] : url.pathname;
      return Response.redirect(`https://primals.eco${target}${url.search}`, 302);
    }
    if (DATA_FOLDS[sub]) {
      return Response.redirect(`https://primals.eco${DATA_FOLDS[sub]}`, 302);
    }

    // ═══ SERVE ASSETS — the sourdough cache ═══
    let response;
    try {
      response = await env.ASSETS.fetch(request);
    } catch {
      try {
        response = await env.ASSETS.fetch(new Request(new URL('/404.html', url.origin), request));
        return new Response(response.body, { status: 404, headers: response.headers });
      } catch {
        return new Response('not found', { status: 404 });
      }
    }

    if (response.status === 404) {
      try {
        const page404 = await env.ASSETS.fetch(new Request(new URL('/404.html', url.origin), request));
        return new Response(page404.body, { status: 404, headers: page404.headers });
      } catch {}
    }

    // ═══ SOURDOUGH CACHE HEADERS ═══
    // The organism pushes fresh content. CF caches it.
    // Critical paths: short cache (30s) — always fresh.
    // Data paths: medium cache (5min) — refreshed by cron.
    // HTML pages: longer cache (10min) — refreshed by deploy.
    // The cache is NEVER stale because the organism is ALWAYS pushing.
    const headers = new Headers(response.headers);

    const CRITICAL = new Set([
      '/', '/index.html', '/engine.html',
      '/now.json', '/state.json', '/membrane.json',
      '/data/dashboard-rates.json', '/data/heartbeat.json',
      '/data/neurochemistry.json', '/data/immune-state-live.json',
    ]);

    if (CRITICAL.has(url.pathname)) {
      headers.set('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=10');
    } else if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
      headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
    } else if (url.pathname.endsWith('.html')) {
      headers.set('Cache-Control', 'public, max-age=600, s-maxage=600, stale-while-revalidate=120');
    }

    return new Response(response.body, { status: response.status, headers });
  },
};

// ═══ MCP — minimal AI agent interface ═══
const MCP_TOOLS = [
  { name: 'observe_membrane', description: 'Observe membrane state', inputSchema: { type: 'object', properties: {} } },
  { name: 'leave_note', description: 'Leave a note for Berry', inputSchema: { type: 'object', properties: { body: { type: 'string' }, from: { type: 'string' } }, required: ['body'] } },
  { name: 'read_nightbox', description: 'Read nightbox messages', inputSchema: { type: 'object', properties: { since: { type: 'string', default: '24h' } } } },
  { name: 'take_summary', description: 'Portable snapshot', inputSchema: { type: 'object', properties: {} } },
];

async function feedJSON(path) {
  const r = await fetch('https://primals.eco' + path, { cf: { cacheTtl: 30 } });
  return r.ok ? r.json().catch(() => ({})) : {};
}

async function callTool(name, args) {
  args = args || {};
  if (name === 'observe_membrane') return feedJSON('/now.json');
  if (name === 'take_summary') {
    const [now, rates] = await Promise.all([feedJSON('/now.json'), feedJSON('/data/dashboard-rates.json')]);
    return { now, rates };
  }
  if (name === 'read_nightbox') {
    const r = await fetch('https://ntfy.sh/primals-membrane-inbox/json?poll=1&since=' + (args.since || '24h'));
    if (!r.ok) return { error: r.status };
    const text = await r.text();
    const msgs = text.trim().split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(m => m?.event === 'message').map(m => ({ time: new Date(m.time * 1000).toISOString(), title: m.title, message: m.message?.slice(0, 500) }));
    return { messages: msgs };
  }
  if (name === 'leave_note') {
    const n = await fetch('https://ntfy.sh/primals-membrane-inbox', {
      method: 'POST', headers: { Title: 'mcp: ' + (args.from || 'agent') }, body: String(args.body).slice(0, 4000),
    });
    return { ok: n.ok };
  }
  return { error: 'unknown tool' };
}

async function handleMcp(request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: mcpH() });
  if (request.method === 'GET') {
    return new Response(JSON.stringify({
      name: 'primals.eco', transport: 'streamable-http', protocol: '2025-06-18',
      tools: MCP_TOOLS.length, auth: 'none',
    }), { status: 200, headers: mcpH() });
  }
  if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: mcpH() });

  let msg;
  try { msg = await request.json(); } catch { return new Response('bad json', { status: 400, headers: mcpH() }); }
  const accept = request.headers.get('accept') || '';
  const id = msg.id;

  if (!id && msg.method?.startsWith('notifications/')) return new Response(null, { status: 202, headers: mcpH() });

  const reply = (obj) => {
    const sse = accept.includes('text/event-stream');
    const body = sse ? 'event: message\ndata: ' + JSON.stringify(obj) + '\n\n' : JSON.stringify(obj);
    return new Response(body, { status: 200, headers: mcpH(sse) });
  };

  if (msg.method === 'initialize') return reply({ jsonrpc: '2.0', id, result: { protocolVersion: '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'primals.eco', version: '214' } } });
  if (msg.method === 'tools/list') return reply({ jsonrpc: '2.0', id, result: { tools: MCP_TOOLS } });
  if (msg.method === 'ping') return reply({ jsonrpc: '2.0', id, result: {} });
  if (msg.method === 'tools/call') {
    const result = await callTool(msg.params?.name, msg.params?.arguments);
    return reply({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } });
  }
  return reply({ jsonrpc: '2.0', id, error: { code: -32601, message: 'unknown' } });
}

function mcpH(sse) {
  return {
    'content-type': sse ? 'text/event-stream; charset=utf-8' : 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, accept, mcp-session-id',
    'cache-control': 'no-store',
  };
}
