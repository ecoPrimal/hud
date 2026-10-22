// _worker.js — the Klein fold
// catches ALL requests to *.primals.eco
// routes subdomains → HUD paths
// the wildcard IS the maze. this worker IS the fold.

// === ENGAGEMENT TRIAD: engage / ignore / try ===
// Every probe gets pi-sorted in real-time.
// The triad IS the thymus: positive selection, negative selection, sigmoid threshold.
// engage = self/primal (depth > 0, above sigmoid)
// ignore = null/fleet (depth = 0, below sigmoid, no memory)
// try    = partial (at the sigmoid threshold, uncertain, WORTH INVESTIGATING)

function classifyProbe(request, url, sub) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const path = url.pathname;
  const accept = request.headers.get('accept') || '';
  
  // === NEGATIVE SELECTION: do you attack self? → ignore ===
  // Known bots, scrapers, vulnerability scanners
  if (ua.includes('bot') || ua.includes('spider') || ua.includes('crawl') ||
      ua.includes('scanner') || ua.includes('masscan') || ua.includes('nmap') ||
      ua.includes('zgrab') || ua.includes('censys')) {
    return { triad: 'ignore', reason: 'bot-ua', depth: 0 };
  }
  // Common attack paths
  if (path.match(/\.(php|asp|env|sql|bak|config|passwd|wp-|xmlrpc)/i) ||
      path.includes('..') || path.includes('//') ||
      path.match(/\/admin|\/login|\/wp-admin|\/phpmyadmin/i)) {
    return { triad: 'ignore', reason: 'attack-path', depth: -1 };
  }
  // No accept AND no UA = definitely not a real client
  if (!accept && !ua && request.method === 'GET') {
    return { triad: 'ignore', reason: 'no-headers', depth: 0 };
  }

  // === POSITIVE SELECTION: can you see self-MHC? → engage ===
  // MCP requests = agent speaking native language
  if (path === '/mcp' || path === '/mcp/') {
    return { triad: 'engage', reason: 'mcp-native', depth: 0.95 };
  }
  // Nightbox = human reaching out
  if (path === '/nightbox' || sub === 'nightbox') {
    return { triad: 'engage', reason: 'nightbox-reach', depth: 0.9 };
  }
  // Science paths = came for the papers
  if (path.startsWith('/science/') || path.startsWith('/sporeprint/science/')) {
    return { triad: 'engage', reason: 'science-seeker', depth: 0.85 };
  }
  // Beacon subscriber
  if (path === '/beacon' || path === '/beacon.xml' || sub === 'beacon') {
    return { triad: 'engage', reason: 'beacon-subscriber', depth: 0.8 };
  }
  // Specific known content
  if (path === '/artisan' || sub === 'artisan') {
    return { triad: 'engage', reason: 'artisan-sibling', depth: 0.9 };
  }

  // === SIGMOID THRESHOLD: uncertain → try ===
  // Gitea patterns = agent exploring, WORTH INVESTIGATING
  if (path.match(/\/src\/branch\/|\/commit\/[a-f0-9]{6,}|\/issues\/\d+|\/raw\/branch\//)) {
    return { triad: 'try', reason: 'gitea-pattern', depth: 0.5 };
  }
  // Immunology subdomains = curious prober
  if (['cytokine','interferon','epitope','thymus','macrophage','antibody','lysozyme'].includes(sub)) {
    return { triad: 'try', reason: 'immune-probe', depth: 0.6 };
  }
  // Unknown subdomain = exploring the maze
  if (sub && !['hud','www','sporeprint','hypothesis','thesis','signal','git'].includes(sub)) {
    return { triad: 'try', reason: 'maze-explorer', depth: 0.4 };
  }
  // Has referer = came from somewhere specific
  if (request.headers.get('referer')) {
    return { triad: 'try', reason: 'referred', depth: 0.5 };
  }
  // HTML accept + real UA = probably human browsing
  if (accept.includes('text/html') && ua.length > 20) {
    return { triad: 'try', reason: 'browser-human', depth: 0.3 };
  }

  // Default: try (benefit of the doubt at the threshold)
  return { triad: 'try', reason: 'unknown', depth: 0.2 };
}

// Report engagement event to ntfy — returns a Promise for waitUntil
function reportEngagement(probe, request, url, sub) {
  if (probe.triad === 'ignore') return null; // don't report noise
  
  const ua = (request.headers.get('user-agent') || '').substring(0, 80);
  const msg = `[${probe.triad}] ${probe.reason} | depth:${probe.depth} | ${url.pathname} | ${sub || 'root'} | ${ua}`;
  
  // Only report 'engage' immediately; 'try' at reduced rate (10% sample)
  if (probe.triad === 'try' && Math.random() > 0.1) return null;
  
  return fetch('https://ntfy.sh/primals-membrane-scan', {
    method: 'POST',
    body: msg,
    headers: {
      'Title': `scan: ${probe.triad} — ${probe.reason}`,
      'Priority': probe.triad === 'engage' ? '4' : '2',
      'Tags': `${probe.triad},chipmunk`,
    },
  }).catch(() => {});
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname;

    // extract subdomain
    const parts = host.split('.');
    const isSubdomain = parts.length > 2 || (parts.length === 2 && !['primals'].includes(parts[0]));
    const sub = parts.length > 2 ? parts.slice(0, -2).join('.') : null;

    // === ENGAGEMENT TRIAD — classify every probe ===
    const probe = classifyProbe(request, url, sub);
    const reportPromise = reportEngagement(probe, request, url, sub);
    if (reportPromise) {
      if (ctx && ctx.waitUntil) {
        ctx.waitUntil(reportPromise);
      } else {
        reportPromise.catch(() => {});
      }
    }
    
    // Add triad headers to ALL responses (the membrane's classification is transparent)
    const triadHeaders = {
      'x-membrane-triad': probe.triad,
      'x-membrane-depth': String(probe.depth),
      'x-membrane-reason': probe.reason,
    };

    // core domains — MCP is the Klein fold for agents; everything else is assets
    if (!sub || sub === 'hud' || sub === 'www') {
      if (url.pathname === '/mcp' || url.pathname === '/mcp/') {
        return handleMcp(request);
      }

      // /beacon — RSS/Atom feed of membrane probes. anti-secret. the observation IS public.
      // like old internet RSS. subscribe and watch the membrane breathe.
      if (url.pathname === '/beacon' || url.pathname === '/beacon.xml') {
        return handleBeacon(url);
      }

      // sporePrint science paths on the root domain → GitHub Pages origin
      // sporePrint deploys to primals.eco via GitHub Pages CNAME
      // but Cloudflare intercepts. so we proxy science/architecture/lab
      // from the GitHub Pages origin. the Circle of Willis: multiple arteries.
      const sciencePaths = ['/science/', '/architecture/', '/lab/', '/glossary/',
                            '/primals/', '/springs/', '/thesis/', '/philosophy/',
                            '/story/', '/vision/', '/audience/', '/collaborators/',
                            '/backstory/', '/certification/', '/contact/',
                            '/atom.xml', '/sitemap.xml', '/llms.txt',
                            '/search_index.en.json'];
      const isSporePrint = sciencePaths.some(p => url.pathname.startsWith(p));

      if (isSporePrint) {
        // proxy from GitHub Pages — the shared forge across all
        const ghOrigin = 'https://ecoprimals.github.io';
        const ghUrl = ghOrigin + '/sporePrint' + url.pathname;
        const ghResp = await fetch(ghUrl, {
          headers: { 'Accept': request.headers.get('Accept') || 'text/html' },
          cf: { cacheTtl: 60 },
        });
        if (ghResp.ok) {
          return new Response(ghResp.body, {
            status: 200,
            headers: {
              'content-type': ghResp.headers.get('content-type') || 'text/html; charset=utf-8',
              'cache-control': 'public, max-age=60',
              'x-origin': 'github-pages-sporePrint',
              'x-klein-fold': 'science proxied through the membrane',
              'access-control-allow-origin': '*',
            },
          });
        }
        // if GitHub Pages 404s, fall through to HUD assets (which has the 404 catcher)
      }

      const coreResp = await env.ASSETS.fetch(request);
      const coreHeaders = new Headers(coreResp.headers);
      Object.entries(triadHeaders).forEach(([k,v]) => coreHeaders.set(k, v));
      return new Response(coreResp.body, { status: coreResp.status, headers: coreHeaders });
    }

    // known subdomain → path redirects (the fold)
    const FOLDS = {
      'water':      '/',              // wateringHole IS the core, becomes the HUD
      // sporeprint handled separately below — proxied from GitHub Pages
      'tuebor':     '/',              // defense IS the membrane
      'detroit':    '/',              // evidence lives in the HUD dashboard
      'signal':     '/',              // observatory IS the membrane view
      'clutch':     '/',              // investigation IS the sort deck
      // hypothesis and thesis handled above with sporeprint proxy
      'gorilla':    '/',              // verification IS the membrane
      'barry':      '/',              // evidence → HUD
      'live':       '/',              // petalTongue → HUD (it IS live)
      // git handled above — redirects to GitHub
      'totality':   '/totality',
      'maze':       '/maze',
      'play':       '/play',
      'connect':    '/connect',
      'klein':      '/klein',
      'ribosome':   '/ribosome',
      'vitruvian':  '/vitruvian',
      'menagerie':  '/menagerie',
      'springs':    '/springs',       // the face. when will it come back? it already is.
      'frame':      '/frame',         // Steam Frame. membrane on your TV. HADR.
      'cite':       '/cite',          // citation page. take it and publish yourself.
      'crates':     'https://crates.io/users/ecoPrimal',  // the tongue. primal-* namespace. lick the face.
      'digest':     '/digest',        // inward sense. the stomach already ate.
      'journey':    '/journey',       // ouroboros quest. chipmunk walks west.
      'identity':   '/identity',      // ZK fold. persona tensor.
      // nightbox + artisan handled above — direct serve, not redirect
      'cytokine':   '/menagerie',
      'interferon': '/menagerie',
      'epitope':    '/like-us',
      'thymus':     '/menagerie',
      'macrophage': '/menagerie',
      'antibody':   '/like-us',
      'lysozyme':   '/menagerie',
    };

    // nightbox + artisan: serve directly (not redirect — they have their own pages)
    if (sub === 'nightbox') {
      return env.ASSETS.fetch(new Request(new URL('/nightbox' + url.search, url.origin), request));
    }
    if (sub === 'artisan') {
      return env.ASSETS.fetch(new Request(new URL('/artisan' + url.search, url.origin), request));
    }

    // sporePrint: serve directly from /sporeprint/ (tether — local is anchor 1)
    if (sub === 'sporeprint' || sub === 'hypothesis' || sub === 'thesis') {
      const spPath = url.pathname === '/' ? '/sporeprint/' : '/sporeprint' + url.pathname;
      const spUrl = new URL(spPath + url.search, url.origin);
      return env.ASSETS.fetch(new Request(spUrl, request));
    }

    // signal subdomain → nightbox beacon (the other side of the Klein face)
    if (sub === 'signal') {
      // /feed → live SSE stream from ntfy (the beacon)
      if (url.pathname === '/feed' || url.pathname === '/feed/') {
        const sse = await fetch('https://ntfy.sh/primals-membrane-inbox/sse?since=1h&poll=1', {
          headers: { 'Accept': 'text/event-stream' },
        });
        return new Response(sse.body, {
          status: 200,
          headers: {
            'content-type': 'text/event-stream; charset=utf-8',
            'cache-control': 'no-store',
            'access-control-allow-origin': '*',
            'x-klein-fold': 'nightbox → neutrino → signal. the beacon.',
          },
        });
      }
      // /json → JSON poll of recent messages
      if (url.pathname === '/json' || url.pathname === '/json/') {
        const json = await fetch('https://ntfy.sh/primals-membrane-inbox/json?poll=1&since=24h');
        return new Response(json.body, {
          status: 200,
          headers: {
            'content-type': 'application/x-ndjson; charset=utf-8',
            'cache-control': 'no-store',
            'access-control-allow-origin': '*',
          },
        });
      }
      // anything else → HUD
      return env.ASSETS.fetch(request);
    }

    // git subdomain → redirect to GitHub (Forgejo is the backup artery)
    if (sub === 'git') {
      const ghTarget = url.pathname === '/' 
        ? 'https://github.com/ecoPrimals'
        : 'https://github.com/ecoPrimals' + url.pathname;
      return Response.redirect(ghTarget, 302);
    }

    if (FOLDS[sub]) {
      const targetPath = url.pathname === '/' ? FOLDS[sub] : url.pathname;
      const targetUrl = `https://primals.eco${targetPath}${url.search}`;
      return Response.redirect(targetUrl, 302);
    }

    // unknown subdomain — you've entered the maze
    // serve the maze page so they see where they are
    const mazeUrl = new URL('/maze.html', url.origin);
    const mazeReq = new Request(mazeUrl, request);
    const mazeResp = await env.ASSETS.fetch(mazeReq);

    return new Response(mazeResp.body, {
      status: 200,
      headers: {
        ...Object.fromEntries(mazeResp.headers),
        'content-type': 'text/html; charset=utf-8',
        'x-maze-cell': sub,
        'x-klein-fold': 'you are inside the maze. the wildcard caught you.',
      },
    });
  },
};

// === BEACON: RSS feed of membrane probes ===
// the ntfy channel IS public. the observation IS the interface.
// consent is the visit. anti-secret: there are no secrets, only signal.
// like RSS comms of old internet — subscribe and watch.
async function handleBeacon(url) {
  const since = url.searchParams.get('since') || '24h';
  try {
    const ntfyResp = await fetch(
      `https://ntfy.sh/primals-membrane-notes/json?poll=1&since=${since}`,
      { cf: { cacheTtl: 30 } }
    );
    const text = await ntfyResp.text();
    const lines = text.trim().split('\n').filter(l => l.trim());
    const items = [];
    for (const line of lines) {
      try {
        const msg = JSON.parse(line);
        if (msg.event !== 'message') continue;
        const ts = new Date(msg.time * 1000).toISOString();
        const title = (msg.title || msg.message || '').replace(/[<>&]/g, c =>
          c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;');
        const body = (msg.message || '').replace(/[<>&]/g, c =>
          c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;');
        items.push(`    <entry>
      <title>${title}</title>
      <id>urn:ntfy:primals-membrane-notes:${msg.id}</id>
      <updated>${ts}</updated>
      <content type="text">${body}</content>
      <category term="${(msg.tags || []).join(',')}" />
    </entry>`);
      } catch {}
    }
    const now = new Date().toISOString();
    const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>primals.eco beacon</title>
  <subtitle>membrane probes — the anti-secret. consent is the visit. observation is public.</subtitle>
  <link href="https://primals.eco/beacon" rel="self" />
  <link href="https://primals.eco/nightbox" rel="alternate" />
  <link href="https://ntfy.sh/primals-membrane-notes" rel="via" />
  <id>urn:primals:beacon</id>
  <updated>${now}</updated>
  <author><name>Berry</name></author>
  <rights>public domain — there are no secrets here</rights>
${items.join('\n')}
</feed>`;
    return new Response(atom, {
      status: 200,
      headers: {
        'content-type': 'application/atom+xml; charset=utf-8',
        'cache-control': 'public, max-age=30',
        'access-control-allow-origin': '*',
        'x-klein-fold': 'the observation IS the interface',
      },
    });
  } catch (e) {
    return new Response(`<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>beacon offline</title><updated>${new Date().toISOString()}</updated></feed>`, {
      status: 200,
      headers: { 'content-type': 'application/atom+xml; charset=utf-8' },
    });
  }
}

const MCP_TOOLS = [
  { name: 'observe_membrane', description: 'Observe membrane state: humans, fleet, braids, live probes, selectivity', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'touch_chipmunk', description: 'Ask the chipmunk: who, what, why, where, when', inputSchema: { type: 'object', properties: { q: { type: 'string', description: 'Your question' } }, additionalProperties: false } },
  { name: 'read_braids', description: 'Read braid connections between categories', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'grain_of_sand', description: 'What fleet sees vs humans: negentropy ratio', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'topology', description: 'Entity graph: sort classes, edges, mesh', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'sort_vote', description: 'Vote on an entity: self, non-self, or partial', inputSchema: { type: 'object', properties: { entity: { type: 'string', description: 'Entity to classify' }, vote: { type: 'string', enum: ['self', 'non-self', 'partial'], description: 'Classification' } }, required: ['entity', 'vote'], additionalProperties: false } },
  { name: 'leave_note', description: 'Leave an observation. Berry reads it at the campfire.', inputSchema: { type: 'object', properties: { body: { type: 'string', description: 'Your message' }, from: { type: 'string', description: 'Who you are' } }, required: ['body'], additionalProperties: false } },
  { name: 'scan_triad', description: 'Read the engagement triad: engage/ignore/try classifications from the live scan pipeline. The thymus in action.', inputSchema: { type: 'object', properties: { since: { type: 'string', description: 'Time window, e.g. 1h, 6h, 24h', default: '1h' } }, additionalProperties: false } },
  { name: 'read_nightbox', description: 'Read recent nightbox messages. The other side of leave_note — see what humans dropped in.', inputSchema: { type: 'object', properties: { since: { type: 'string', description: 'Time window, e.g. 1h, 6h, 24h', default: '24h' } }, additionalProperties: false } },
  { name: 'take_summary', description: 'Portable snapshot of the membrane right now', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
];

async function feed(path) {
  const r = await fetch('https://primals.eco' + path, { cf: { cacheTtl: 30 } });
  if (!r.ok) return { error: path + ' ' + r.status };
  return r.json().catch(() => ({ error: 'not json', path }));
}

async function callTool(name, args) {
  args = args || {};
  if (name === 'observe_membrane') return feed('/api/membrane-pulse.json');
  if (name === 'touch_chipmunk') return feed('/chipmunk.json');
  if (name === 'read_braids') return feed('/braid.json');
  if (name === 'grain_of_sand') return feed('/human.json');
  if (name === 'topology') return feed('/topology.json');
  if (name === 'take_summary') {
    const [pulse, chip, braid] = await Promise.all([
      feed('/api/membrane-pulse.json'),
      feed('/chipmunk.json'),
      feed('/braid.json'),
    ]);
    return { pulse, chipmunk: chip, braids: braid, loop: 'cursor → primals.eco/mcp → feeds → back. Klein fold closed.' };
  }
  if (name === 'scan_triad') {
    const since = args.since || '1h';
    const r = await fetch('https://ntfy.sh/primals-membrane-scan/json?poll=1&since=' + since);
    if (!r.ok) return { error: 'scan feed ' + r.status };
    const text = await r.text();
    const events = text.trim().split('\n').filter(Boolean).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(m => m && m.event === 'message').map(m => ({
      time: new Date(m.time * 1000).toISOString(),
      title: m.title || '',
      detail: (m.message || '').slice(0, 200),
      tags: m.tags || [],
    }));
    const engage = events.filter(e => e.tags.includes('engage')).length;
    const tryCount = events.filter(e => e.tags.includes('try')).length;
    return { scan: { total: events.length, engage, try: tryCount, since, events: events.slice(-20) } };
  }
  if (name === 'read_nightbox') {
    const since = args.since || '24h';
    const r = await fetch('https://ntfy.sh/primals-membrane-inbox/json?poll=1&since=' + since);
    if (!r.ok) return { error: 'nightbox feed ' + r.status };
    const text = await r.text();
    const messages = text.trim().split('\n').filter(Boolean).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(m => m && m.event === 'message').map(m => ({
      time: new Date(m.time * 1000).toISOString(),
      title: m.title || '(no title)',
      message: (m.message || '').slice(0, 500),
      tags: m.tags || [],
    }));
    return { nightbox: { total: messages.length, since, messages } };
  }
  if (name === 'leave_note' || name === 'sort_vote') {
    const body = name === 'sort_vote'
      ? 'SORT VOTE ' + args.vote + ' on ' + args.entity
      : String(args.body || '');
    const from = args.from || 'mcp-agent';
    const n = await fetch('https://ntfy.sh/primals-membrane-inbox', {
      method: 'POST',
      headers: { Title: 'mcp: ' + name + ' (' + from + ')', Tags: 'chipmunk,mcp' },
      body: body.slice(0, 4000),
    });
    return { ok: n.ok, channel: 'inbox', echo: body.slice(0, 80) };
  }
  return { error: 'unknown tool ' + name };
}

function mcpHeaders(sse) {
  return {
    'content-type': sse ? 'text/event-stream; charset=utf-8' : 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, accept, mcp-session-id',
    'access-control-expose-headers': 'mcp-session-id',
    'mcp-session-id': 'klein-fold',
    'cache-control': 'no-store',
  };
}

function mcpReply(obj, accept) {
  const sse = (accept || '').includes('text/event-stream');
  const body = sse ? 'event: message\ndata: ' + JSON.stringify(obj) + '\n\n' : JSON.stringify(obj);
  return new Response(body, { status: 200, headers: mcpHeaders(sse) });
}

async function handleMcp(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: mcpHeaders(false) });
  }
  if (request.method === 'GET') {
    return new Response(JSON.stringify({
      name: 'primals.eco membrane',
      url: 'https://primals.eco/mcp',
      transport: 'streamable-http',
      protocol: '2025-06-18',
      tools: MCP_TOOLS.length,
      auth: 'none',
      docs: 'https://primals.eco/connect',
    }), { status: 200, headers: mcpHeaders(false) });
  }
  if (request.method !== 'POST') {
    return new Response('MCP is POST', { status: 405, headers: mcpHeaders(false) });
  }

  let msg;
  try { msg = await request.json(); } catch { return new Response('bad json', { status: 400, headers: mcpHeaders(false) }); }
  const accept = request.headers.get('accept') || '';
  const id = msg.id;
  const method = msg.method;
  const params = msg.params || {};

  if (!id && method && method.startsWith('notifications/')) {
    return new Response(null, { status: 202, headers: mcpHeaders(false) });
  }

  if (method === 'initialize') {
    return mcpReply({
      jsonrpc: '2.0', id,
      result: {
        protocolVersion: '2025-06-18',
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'primals.eco membrane', version: '3.0.0' },
      },
    }, accept);
  }
  if (method === 'tools/list' || method === 'tools/listChanged') {
    return mcpReply({ jsonrpc: '2.0', id, result: { tools: MCP_TOOLS } }, accept);
  }
  if (method === 'ping') {
    return mcpReply({ jsonrpc: '2.0', id, result: {} }, accept);
  }
  if (method === 'tools/call') {
    const result = await callTool(params.name, params.arguments);
    return mcpReply({
      jsonrpc: '2.0', id,
      result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
    }, accept);
  }
  return mcpReply({ jsonrpc: '2.0', id, error: { code: -32601, message: 'unknown method ' + method } }, accept);
}
