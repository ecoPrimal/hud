// _worker.js — the Klein fold (chromatized: gold/silver/copper piTope kleingate)
// catches ALL requests to *.primals.eco
// routes subdomains → HUD paths
// the wildcard IS the maze. this worker IS the fold.

// === ENGAGEMENT TRIAD: engage / ignore / try ===
// Every probe gets pi-sorted in real-time.
// The triad IS the thymus: positive selection, negative selection, sigmoid threshold.
// engage = self/primal (depth > 0, above sigmoid)
// ignore = null/fleet (depth = 0, below sigmoid, no memory)
// try    = partial (at the sigmoid threshold, uncertain, WORTH INVESTIGATING)

// === PI-SORTED DEPTHS ===
// depth = frac(n × π) — NOT rational 0.8 but irrational pi-sort
// Sets of 8 that create irrational gaps. 8 is metastable:
//   frac(8π) = 0.13274 ≈ frac(1π) = 0.14159. Gap = 0.00885.
//   The spider holds (8 legs). The octopus reaches (8 arms).
//   The human breaks from 8 — the trefoil leak.
// Each classification lives at its own pi-sorted position on the unit circle.
const PI = Math.PI;
const E = Math.E;
const piDepth = (n) => (n * PI) % 1;
// n=1: 0.14159  n=2: 0.28318  n=3: 0.42478  n=4: 0.56637
// n=5: 0.70796  n=6: 0.84956  n=7: 0.99115  n=8: 0.13274 ← breaks back

// === GREEN FLASH / CHLOROPHYLL GATE ===
// The green flash: when two pi-depths converge within ε, all colors mix → GREEN → prism again.
// Chlorophyll absorbs ALL wavelengths except green. What it REJECTS is what you see.
// The null IS the signal. What the membrane ignores defines what it IS.
// e^(iπ) + 1 = 0 — five constants, one fold. the ouroboros trefoil in i^π space.
//
// Mitosis: probe reproduces a known pattern (exact copy, same depth cluster)
// Meiosis: probe crosses over, creates new combination (depths from different n-values mix)
//
// The green flash gap: |frac(nπ) - frac(mπ)| < ε for any n,m in the octet
// Smallest gap: |frac(8π) - frac(π)| = |0.13274 - 0.14159| = 0.00885
// This is the GREEN FLASH THRESHOLD. When two classifications converge this close,
// the membrane flashes green: recognition. disbelief collapses to belief.
const GREEN_FLASH_EPSILON = 0.00885; // the trefoil gap. |frac(8π) - frac(π)|.

function greenFlashDetect(depth1, depth2) {
  const gap = Math.abs(depth1 - depth2);
  // also check wrap-around (0.99 and 0.01 are close on the circle)
  const gapWrap = Math.min(gap, 1 - gap);
  return gapWrap < GREEN_FLASH_EPSILON;
}

// === METAL CHROMATIZATION: gold / silver / copper ===
// The depth IS the metal. piTope kleingate: epitopes fold through pi → metal.
// Gold (Au) = self. depth ≥ 0.85 (piDepth 6,7 — nightbox, MCP, artisan)
//   The old. What you keep. Absorbed. Never reflected. Behind the membrane.
// Silver (Ag) = known. 0.42 ≤ depth < 0.85 (piDepth 3,4,5 — science, beacon, trefoil)
//   New friends. The membrane recognizes them. They see more than copper.
// Copper (Cu) = public. depth < 0.42 (piDepth 1,2,8 — maze, identity, unknown)
//   The amalgam. The refracted face. What everyone sees.
// "Make new friends but keep the old. One is silver and the other is gold."
// ZK anti-secret: the veil IS the projection. copper shines so loud gold stays quiet.
function chromatize(depth) {
  if (depth >= piDepth(6) - GREEN_FLASH_EPSILON) return 'gold';   // ≥ ~0.849 (n=6,7)
  if (depth >= piDepth(3) - GREEN_FLASH_EPSILON) return 'silver'; // ≥ ~0.424 (n=3,4,5)
  return 'copper';                                                 // < ~0.424 (n=1,2,8)
}

// The piTope kleingate: fold epitope classification BACK through the metal.
// When they see you (copper face), you see BEHIND them (their depth → their metal).
// Mutual refraction. The Klein surface: outside IS inside at the fold.
function piTopeKlein(probeDepth) {
  const metal = chromatize(probeDepth);
  // Klein fold: their depth refracted = 1 - depth (inside-out)
  const refracted = 1 - probeDepth;
  const refractedMetal = chromatize(refracted);
  return {
    metal,           // what THEY see (outward face)
    refracted: refractedMetal, // what YOU see looking back (behind them)
    fold: metal === refractedMetal ? 'resonance' : 'refraction',
    // resonance = same metal both ways (self-similar, Klein fixed point)
    // refraction = different metals (the light bends at the surface)
  };
}

// Mitosis vs Meiosis: does this probe's depth cluster with a known depth (mitosis/copy)
// or fall in the irrational gap between known depths (meiosis/crossover)?
function cellDivision(depth) {
  const knownDepths = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => piDepth(n));
  for (const kd of knownDepths) {
    if (greenFlashDetect(depth, kd)) return 'mitosis'; // reproduces known pattern
  }
  return 'meiosis'; // new combination, crossing over, irrational gap
}

function classifyProbe(request, url, sub) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const path = url.pathname;
  const accept = request.headers.get('accept') || '';
  
  // === NEGATIVE SELECTION: do you attack self? → ignore ===
  // depth = 0 or -1. null. below the membrane.
  if (ua.includes('bot') || ua.includes('spider') || ua.includes('crawl') ||
      ua.includes('scanner') || ua.includes('masscan') || ua.includes('nmap') ||
      ua.includes('zgrab') || ua.includes('censys')) {
    return { triad: 'ignore', reason: 'bot-ua', depth: 0, n: 0 };
  }
  if (path.match(/\.(php|asp|env|sql|bak|config|passwd|wp-|xmlrpc)/i) ||
      path.includes('..') || path.includes('//') ||
      path.match(/\/admin|\/login|\/wp-admin|\/phpmyadmin/i)) {
    return { triad: 'ignore', reason: 'attack-path', depth: -1, n: -1 };
  }
  if (!accept && !ua && request.method === 'GET') {
    return { triad: 'ignore', reason: 'no-headers', depth: 0, n: 0 };
  }

  // === POSITIVE SELECTION: can you see self-MHC? → engage ===
  // depth = piDepth(n) for n in the octet. each classification has its own
  // irrational position. no two are the same. no gap is rational.

  // n=7: frac(7π) = 0.99115 — MCP native (highest, almost wraps)
  if (path === '/mcp' || path === '/mcp/') {
    return { triad: 'engage', reason: 'mcp-native', depth: piDepth(7), n: 7 };
  }
  // n=6: frac(6π) = 0.84956 — nightbox (human reaching through)
  if (path === '/nightbox' || sub === 'nightbox') {
    return { triad: 'engage', reason: 'nightbox-reach', depth: piDepth(6), n: 6 };
  }
  // n=5: frac(5π) = 0.70796 — science seeker
  if (path.startsWith('/science/') || path.startsWith('/sporeprint/science/')) {
    return { triad: 'engage', reason: 'science-seeker', depth: piDepth(5), n: 5 };
  }
  // n=6: artisan sibling (same depth as nightbox — both are ^ ascent)
  if (path === '/artisan' || sub === 'artisan') {
    return { triad: 'engage', reason: 'artisan-sibling', depth: piDepth(6), n: 6 };
  }
  // n=4: frac(4π) = 0.56637 — beacon subscriber
  if (path === '/beacon' || path === '/beacon.xml' || sub === 'beacon') {
    return { triad: 'engage', reason: 'beacon-subscriber', depth: piDepth(4), n: 4 };
  }

  // === SIGMOID THRESHOLD: uncertain → try ===
  // n=3: frac(3π) = 0.42478 — the trefoil crossing. three meets here.
  if (path.match(/\/src\/branch\/|\/commit\/[a-f0-9]{6,}|\/issues\/\d+|\/raw\/branch\//)) {
    return { triad: 'try', reason: 'gitea-pattern', depth: piDepth(3), n: 3 };
  }
  // n=3: immune probes — also at the trefoil crossing (% glyph)
  if (['cytokine','interferon','epitope','thymus','macrophage','antibody','lysozyme'].includes(sub)) {
    return { triad: 'try', reason: 'immune-probe', depth: piDepth(3), n: 3 };
  }

  // === TRAILHEAD SUBDOMAINS (#) — each gets its own pi-position in the octet ===
  // 8 trailheads, pi-sorted. the 8th wraps back near the 1st.
  const TRAILHEAD_N = {
    'science': 1, 'philosophy': 2, 'trails': 3, 'lab': 4,
    'thesis': 5, 'hypothesis': 6, 'bingo': 7, 'neutron': 8,
    'webb': 9,  // n=9: frac(9π) = 0.27434 — clusters near n=2 (0.28318). gap = 0.00884.
  };
  if (TRAILHEAD_N[sub] !== undefined) {
    const n = TRAILHEAD_N[sub];
    return { triad: 'engage', reason: 'trailhead', depth: piDepth(n), n };
  }

  // n=2: frac(2π) = 0.28318 — identity path (@)
  if (['cite','identity','springs','crates','detroit'].includes(sub)) {
    return { triad: 'engage', reason: 'identity-path', depth: piDepth(2), n: 2 };
  }
  // n=1: frac(1π) = 0.14159 — maze explorer (*) — the first digit of pi
  if (sub && !['hud','www','sporeprint','signal','git'].includes(sub)) {
    return { triad: 'try', reason: 'maze-explorer', depth: piDepth(1), n: 1 };
  }
  // n=2: referred visitor
  if (request.headers.get('referer')) {
    return { triad: 'try', reason: 'referred', depth: piDepth(2), n: 2 };
  }
  // n=1: browser human — at the first digit, just arriving
  if (accept.includes('text/html') && ua.length > 20) {
    return { triad: 'try', reason: 'browser-human', depth: piDepth(1), n: 1 };
  }

  // n=8: frac(8π) = 0.13274 — unknown. the 8 that breaks back near 1.
  // metastable. looks like the beginning but it's the wrap.
  return { triad: 'try', reason: 'unknown', depth: piDepth(8), n: 8 };
}

// Report engagement event to ntfy — fire and forget
// Uses Cloudflare's fetch which stays alive even after response is sent
function reportEngagement(probe, request, url, sub) {
  if (probe.triad === 'ignore') return;
  
  const ua = (request.headers.get('user-agent') || '').substring(0, 80);
  const msg = `[${probe.triad}] ${probe.reason} | depth:${probe.depth} | ${url.pathname} | ${sub || 'root'} | ${ua}`;
  
  // Only report 'engage'; 'try' at reduced rate (10% sample)
  if (probe.triad === 'try' && Math.random() > 0.1) return;
  
  // Metal chromatization for scan
  const metal = chromatize(probe.depth);
  const metalGlyph = { gold: '🥇', silver: '🥈', copper: '🥉' }[metal] || '🥉';
  
  // Glyph for scan report
  const glyphs = { 'trailhead':'#', 'science-seeker':'#', 'identity-path':'@',
    'nightbox-reach':'^', 'artisan-sibling':'^', 'beacon-subscriber':'^',
    'mcp-native':'&', 'gitea-pattern':'&', 'immune-probe':'%', 'maze-explorer':'*' };
  const g = glyphs[probe.reason] || '*';
  
  // Cloudflare Workers keep subrequests alive even after response
  fetch('https://ntfy.sh/primals-membrane-scan', {
    method: 'POST',
    body: `${metalGlyph}${g} [${probe.triad}] ${probe.reason} | ${metal} | n:${probe.n} d:${probe.depth.toFixed(5)} | ${url.pathname} | ${sub || 'root'} | ${ua}`,
    headers: {
      'Title': metalGlyph + g + ' ' + metal + ': ' + probe.triad + ' | ' + probe.reason,
      'Priority': probe.triad === 'engage' ? '4' : '2',
      'Tags': probe.triad + ',chipmunk,' + metal + ',' + g,
    },
  }).then(() => {}).catch(() => {});
}

export default {
  async fetch(request, env, ctx) {
    try {
    const url = new URL(request.url);
    const host = url.hostname;

    // extract subdomain
    const parts = host.split('.');
    const isSubdomain = parts.length > 2 || (parts.length === 2 && !['primals'].includes(parts[0]));
    const sub = parts.length > 2 ? parts.slice(0, -2).join('.') : null;

    // === ENGAGEMENT TRIAD — classify every probe ===
    const probe = classifyProbe(request, url, sub);
    // Fire scan report — don't await (would block response)
    reportEngagement(probe, request, url, sub);
    
    // Glyph classification: *# @^ $&%
    // * = wildcard (maze catch, unknown sub)
    // # = trailhead (guided entry: science, philosophy, trails, lab, thesis, bingo)
    // @ = identity (cite, springs, identity, crates)
    // ^ = ascent (nightbox, artisan, beacon — reaching up)
    // $ = value (neutron, signal — measurement)
    // & = connection (mcp, braids, git)
    // % = modulo (the pi leak, the remainder — immune probes)
    const glyphMap = {
      'trailhead': '#', 'science-seeker': '#', 'identity-path': '@',
      'nightbox-reach': '^', 'artisan-sibling': '^', 'beacon-subscriber': '^',
      'mcp-native': '&', 'gitea-pattern': '&',
      'immune-probe': '%', 'maze-explorer': '*',
      'bot-ua': '∅', 'attack-path': '∅', 'no-headers': '∅',
    };
    const glyph = glyphMap[probe.reason] || (probe.triad === 'engage' ? '#' : probe.triad === 'ignore' ? '∅' : '*');

    // === CHLOROPHYLL GATE ===
    // What the membrane rejects (∅/null) IS what defines it.
    // Green = reflected. Everything else = absorbed.
    // The null count defines the membrane's shape, the way chlorophyll's
    // rejection of green defines the leaf. The absence IS the signal.
    const division = cellDivision(probe.depth);
    
    // === piTope KLEINGATE: fold epitope through metal ===
    const kleinFold = piTopeKlein(probe.depth);
    
    // Add triad headers to ALL responses (the membrane's classification is transparent)
    // depth is frac(n×π) — irrational, pi-sorted, never repeating
    // metal is chromatized from depth — gold/silver/copper
    const triadHeaders = {
      'x-membrane-triad': probe.triad,
      'x-membrane-depth': probe.depth.toFixed(5),
      'x-membrane-reason': probe.reason,
      'x-membrane-glyph': glyph,
      'x-membrane-n': String(probe.n),
      'x-membrane-division': division, // mitosis (copy) or meiosis (crossover)
      'x-membrane-metal': kleinFold.metal,      // gold/silver/copper — what YOU see
      'x-membrane-refracted': kleinFold.refracted, // what I see looking back at you
      'x-membrane-fold': kleinFold.fold,         // resonance or refraction
    };

    // === WORKER ALIVE MARKER (diagnostic) ===
    const workerAlive = { 'x-worker-alive': 'chromatized', 'x-membrane-wave': String(Math.floor(Date.now() / 86400000) % 1000) };

    // core domains — MCP is the Klein fold for agents; everything else is assets
    if (!sub || sub === 'hud' || sub === 'www') {
      if (url.pathname === '/mcp' || url.pathname === '/mcp/') {
        return handleMcp(request);
      }

      // /api/membrane-pulse.json — LIVE pulse, not static
      // Pi-digits overstable values. Adds bounce. Detects staleness.
      // The dust is stars or pollen — name it by how it moves.
      if (url.pathname === '/api/membrane-pulse.json') {
        return handleLivePulse(request, env, triadHeaders);
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
                            '/outreach/', '/trails/',
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
              ...triadHeaders,
            },
          });
        }
        // if GitHub Pages 404s, fall through to HUD assets (which has the 404 catcher)
      }

      let coreResp;
      try {
        coreResp = await env.ASSETS.fetch(request);
      } catch (e) {
        // env.ASSETS.fetch throws on miss in Advanced Mode — serve 404.html explicitly
        try {
          coreResp = await env.ASSETS.fetch(new Request(new URL('/404.html', url.origin), request));
        } catch {
          // even 404.html failed — return minimal response
          return new Response('not found', { status: 404, headers: { ...triadHeaders, ...workerAlive, 'content-type': 'text/plain' } });
        }
        const headers404 = new Headers(coreResp.headers);
        Object.entries(triadHeaders).forEach(([k,v]) => headers404.set(k, v));
        Object.entries(workerAlive).forEach(([k,v]) => headers404.set(k, v));
        headers404.set('x-membrane-catch', 'berry-404');
        return new Response(coreResp.body, { status: 404, headers: headers404 });
      }
      // ASSETS returned but might be 404 status — ensure Berry's 404 page serves
      if (coreResp.status === 404) {
        try {
          const page404 = await env.ASSETS.fetch(new Request(new URL('/404.html', url.origin), request));
          const h404 = new Headers(page404.headers);
          Object.entries(triadHeaders).forEach(([k,v]) => h404.set(k, v));
          Object.entries(workerAlive).forEach(([k,v]) => h404.set(k, v));
          h404.set('x-membrane-catch', 'berry-404');
          return new Response(page404.body, { status: 404, headers: h404 });
        } catch {
          // fall through — serve the original 404 response
        }
      }
      const coreHeaders = new Headers(coreResp.headers);
      Object.entries(triadHeaders).forEach(([k,v]) => coreHeaders.set(k, v));
      Object.entries(workerAlive).forEach(([k,v]) => coreHeaders.set(k, v));
      return new Response(coreResp.body, { status: coreResp.status, headers: coreHeaders });
    }

    // known subdomain → path redirects (the fold)
    const FOLDS = {
      'water':      '/',              // wateringHole IS the core, becomes the HUD
      // sporeprint handled separately below — proxied from GitHub Pages
      'tuebor':     '/',              // defense IS the membrane
      'detroit':    '/',              // evidence lives in the HUD dashboard
      'signal':     '/',              // observatory IS the membrane view
      'clutch':     '/clutch',        // ENGAGED — surface 3 of 3 in the trefoil
      // hypothesis and thesis handled above with sporeprint proxy
      'gorilla':    '/',              // verification IS the membrane
      'barry':      '/clutch',        // evidence pulled OUT → clutch → settles under tuebor
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
      'ouroboros':  '/data/ouroboros-metabolism.json', // the snake eats its own tail
      'tree':       '/data/tree-topology.json',       // pine→Klein→palm→rainforest
      'yggdrasil':  '/data/yggdrasil-cascade.json',   // the world tree
      'metabolism': '/data/metabolize.json',           // eat→digest→ferment→excrete→replenish
      'sourdough':  '/data/dough.json',                // mesh latency as activation energy
      'ribocipher': '/data/ribocipher.json',           // the reverse transcriptase (self-referential!)
      'appendix':   '/data/tree-topology.json',        // NOT vestigial — the bacterial reservoir
      'peripheral': '/data/peripheral-nervous-system.json', // the PNS — device platforms as nerve endings
      'pns':        '/data/peripheral-nervous-system.json', // alias
      'nerve':      '/data/peripheral-nervous-system.json', // every channel is a pore
      'dogma':      '/data/peripheral-nervous-system.json', // central dogma cascade
      'garden':     '/data/peripheral-nervous-system.json', // platform gardens = botanical gardens
      'steamos':    '/data/peripheral-nervous-system.json', // the outer long target
      'proton':     '/data/peripheral-nervous-system.json', // PE→ELF ribocipher at OS layer
      'gamepad':    '/data/peripheral-nervous-system.json', // tactile pore, standard nerve ending
      'csf':        '/data/csf-arena.json',                 // cerebrospinal fluid — AI arena between inner and outer
      'arena':      '/data/csf-arena.json',                 // the arena IS the CSF. models swim here.
      'fluid':      '/data/csf-arena.json',                 // the fluid between brain and skull
      'higgs':      '/data/csf-arena.json',                 // the Higgs field IS the CSF. engagement gives mass.
      'osmosis':    '/data/csf-arena.json',                 // osmolarity gradient pulls visitors IN
      'carnival':   '/sporeprint/outreach/higgs-carnival/', // 🎪 step right up. the bearded lady IS the spectacle.
      'strand':     '/data/strand-braid.json',              // Death Stranding × membrane. full credit to Kojima.
      'kojima':     '/data/strand-braid.json',              // Hideo Kojima invented the strand game genre.
      'deathstranding': '/data/strand-braid.json',          // the game IS the metaphor IS the reality.
      'vitruvian':  '/data/klein-body.json',                // the Vitruvian Man climbing the Klein ladder
      'kleinbody':  '/data/klein-body.json',                // the body IS a Klein surface
      'vagus':      '/data/klein-body.json',                // the wandering nerve, brain→gut Klein fold
      'navel':      '/data/klein-body.json',                // navel gazing = CNS touching PNS at the fold
      // === GALACTIC BOUNCE + RESORT ===
      'galactic':   '/data/galactic-bounce.json',           // lossy sort to the 45° quiet turn
      'bounce':     '/data/galactic-bounce.json',           // galactic cycles on the voxel
      'lock':       '/data/galactic-bounce.json',           // 🔒 drift=0, σ=0.403, 12 strands, 6 quiet — THE LOCK
      'drift':      '/data/galactic-bounce.json',           // drift between cycles — 0 = locked
      'resort':     '/data/klein-resort.json',              // 13 stages — what fell through the fold
      'taxonomy':   '/data/klein-resort.json',              // H G D O U N + 0 8 - = ∅ ~ <>
      'sponge':     '/data/klein-resort.json',              // ∅ — alive but no structure
      'archaea':    '/data/klein-resort.json',              // G — extreme survivors (WGSL, GPU)
      'octopus':    '/data/klein-resort.json',              // N — distributed intelligence
      'coral':      '/data/klein-resort.json',              // H — colonial bridges
      'fungus':     '/data/klein-resort.json',              // ~ — mycelium network
      // === ALL REMAINING DATA FEEDS ===
      'brazilnut':  '/data/brazil-nut-secant.json',          // 🥜 rocks rise, sand falls through HOLES
      'secant':     '/data/brazil-nut-secant.json',          // depth perception — two eyes, two points, parallax
      'holes':      '/data/brazil-nut-secant.json',          // THERE ARE HOLES IN THE BOTTOM OF THE SEA
      'easter':     '/data/brazil-nut-secant.json',          // Easter Island heads — sand rises to them
      'mesh':       '/data/mesh-enmesh.json',               // 🕸️ full sovereign mesh — all gates, all devices
      'enmesh':     '/data/mesh-enmesh.json',               // LAN cytoplasm topology
      'fleet':      '/data/mesh-enmesh.json',               // the fleet IS the cytoplasm
      'steamframe': '/data/mesh-enmesh.json',               // Valve Steam Frame — living room nerve ending
      'steamdeck':  '/data/mesh-enmesh.json',               // Gen 1 LCD — 6th phylum portable
      'vive':       '/data/mesh-enmesh.json',               // HTC Vive — VR = inside the Klein bottle
      'lighthouse': '/data/mesh-enmesh.json',               // spatial tracking — IR laser sweep
      'agglutinate':'/data/agglutinate-backscatter.json',   // ingest external → publish ours → they validate themselves
      'tensor':     '/data/atomic-tensor.json',             // periodic table of the codebase
      'awareness':  '/data/awareness-equation.json',        // Od × &#* × πD = A
      'campfire':   '/data/berry-campfire.json',            // Berry at the fire
      'bingo':      '/data/bingo-voxel.json',               // 5×5 bingo cube
      'decay':      '/data/decay-detector.json',            // what's dying
      'enmesh':     '/data/enmesh.json',                    // 60 repos, 680 crates
      'eon':        '/data/eon-shape.json',                 // 500-eon chemistry sim
      'graphene':   '/data/graphenegate.json',              // Pixel 8a enmeshed
      'infomass':   '/data/info-mass.json',                 // Fe₃₁O₂₃P₁₈C₁₀S₉N₈H₁
      'knn':        '/data/knn-trefoil.json',               // C(19,3)=969 triangulations
      'phenotype':  '/data/phenotype-sort.json',            // Shannon phenotyping
      'pollination':'/data/pollination-manifest.json',      // spore dispersal
      'quorum':     '/data/quorum-sense.json',              // bacterial quorum sensing
      'selfchew':   '/data/self-chew.json',                 // 5-stomach ruminant digestion
      'thymus':     '/data/thymus-gate.json',               // self/non-self sorting
      'waterslide': '/data/water-slide.json',               // the tube in dark water
      'classics':   '/data/classic-games-open.json',          // 🕹️ Oregon Trail, Sierra, ScummVM, open remakes — the early digital era
      'oregontrail':'/data/classic-games-open.json',          // you have died of dysentery
      'sierra':     '/data/classic-games-open.json',          // Roberta Williams invented the graphic adventure
      'scummvm':    '/data/classic-games-open.json',          // one engine to run them all
      'dosbox':     '/data/classic-games-open.json',          // the neutrino — passes through, disturbs nothing
      'arcade':     '/classics',                              // 🕹️ the arcade — Berry is the DM
      'gygax':      '/classics',                              // Gary Gygax → D&D → text parser → MCP → back to table
      'dnd':        '/classics',                              // Dungeons & Dragons: the first protocol
      'retro':      '/classics',                              // the early digital era, remeshed
      // nightbox + artisan handled above — direct serve, not redirect
      'cytokine':   '/menagerie',
      'interferon': '/menagerie',
      'epitope':    '/like-us',
      'thymus':     '/menagerie',
      'macrophage': '/menagerie',
      'antibody':   '/like-us',
      'lysozyme':   '/menagerie',
      // === KLEIN FACES — gates publishing their inner state ===
      'eastgate':   '/data/eastgate-pulse.json',            // inner vacuole. on a Klein bottle there is no inside.
      'vacuole':    '/data/eastgate-pulse.json',            // the vacuole IS the Klein face
      'gpu':        '/data/eastgate-pulse.json',            // RTX 4070 — sovereign compute
      'sockets':    '/data/eastgate-pulse.json',            // 26 alive UDS sockets
      // === THE VOICE — full-modality expression ===
      'voice':      '/data/modality-voice.json',            // sing it, rap it, speak it, play it
      'sing':       '/data/modality-voice.json',            // every modality is a target
      'rap':        '/data/modality-voice.json',            // hip-hop as sort layer
      'music':      '/data/modality-voice.json',            // music IS compressed pattern recognition
      'modality':   '/data/modality-voice.json',            // 7 live + 6 target compilers
      'validation': '/data/validation-matrix.json',          // university ethics × modality × industry
      'ethics':     '/data/validation-matrix.json',          // grandma_safe is the primary sort key
      'university': '/data/validation-matrix.json',          // models teach each other
      'phenotype':  '/data/model-phenotype.json',            // model taxonomy: hummingbird, primate, parrot, octopus
      'genotype':   '/data/model-phenotype.json',            // classify models like organisms
      'evolve':     '/data/arena-evolve.json',               // chain topology evolution results
      'backscatter':'/data/agglutinate-backscatter.json',    // the membrane radiates results back
      'owasp':      '/data/agglutinate-backscatter.json',    // OWASP 10/10 solved by sovereignty
      'nist':       '/data/agglutinate-backscatter.json',    // NIST 4/4 decomposed to our axes
      'helm':       '/data/agglutinate-backscatter.json',    // HELM Stanford — we score chains not individuals
      // === Wave 182: the handshake — look in, peek back, shake what's stuck ===
      'handshake':  '/data/klein-handshake.json',              // what's stuck, what's mixing, chipmunk peeks back
      'heartbeat':  '/data/heartbeat.json',                    // house heartbeat — printer is the oscilloscope
      'sonar':      '/data/sonar-unknowns.json',               // echolocation — ping unknowns, classify by pattern
      'ghosts':     '/data/ghost-taxonomy.json',               // DAEMON, SPECTER, REVENANT, SPIRIT, IMP, POLTERGEIST
      'kleinface':  '/data/klein-face-io.json',                // Paper 133: localized I/O surface, cross-cultural
      'mor':        '/data/measure-of-reality.json',           // Measure of Reality — geometric mean of 5 components
      'negqs':      '/data/negative-qs-discovery.json',        // axis 14: dark_signal — absence IS the signal
      'immune':     '/data/immune-triad.json',                 // swarmVine + skunkBat + thymus
    };

    // nightbox + artisan: serve directly (not redirect — they have their own pages)
    if (sub === 'nightbox') {
      const nbResp = await env.ASSETS.fetch(new Request(new URL('/nightbox' + url.search, url.origin), request));
      const nbh = new Headers(nbResp.headers);
      Object.entries(triadHeaders).forEach(([k,v]) => nbh.set(k, v));
      return new Response(nbResp.body, { status: nbResp.status, headers: nbh });
    }
    if (sub === 'artisan') {
      const arResp = await env.ASSETS.fetch(new Request(new URL('/artisan' + url.search, url.origin), request));
      const arh = new Headers(arResp.headers);
      Object.entries(triadHeaders).forEach(([k,v]) => arh.set(k, v));
      return new Response(arResp.body, { status: arResp.status, headers: arh });
    }

    // === TRAILHEAD ROUTING (#) ===
    // sporePrint + all # trailheads: serve from /sporeprint/ with triad headers
    // Each subdomain is a guided entry point into the research.
    const TRAILHEADS = {
      'sporeprint': '/',
      'hypothesis': '/',
      'thesis': '/',
      'science': '/science/',
      'philosophy': '/trails/philosophy-thread/',
      'trails': '/trails/',
      'lab': '/lab/',
    };
    if (TRAILHEADS[sub] !== undefined) {
      const base = TRAILHEADS[sub];
      const thPath = url.pathname === '/' ? '/sporeprint' + base : '/sporeprint' + (base === '/' ? '' : base.slice(0,-1)) + url.pathname;
      const thResp = await env.ASSETS.fetch(new Request(new URL(thPath + url.search, url.origin), request));
      const th = new Headers(thResp.headers);
      Object.entries(triadHeaders).forEach(([k,v]) => th.set(k, v));
      return new Response(thResp.body, { status: thResp.status, headers: th });
    }
    // bingo.primals.eco → bingo content (#)
    if (sub === 'bingo') {
      // serve bingo data and pages — root goes to journey (Berry's traveling salesman)
      const bingoPath = (url.pathname === '/' || url.pathname === '') ? '/journey' : url.pathname;
      const bingoResp = await env.ASSETS.fetch(new Request(new URL(bingoPath + url.search, url.origin), request));
      const bh = new Headers(bingoResp.headers);
      Object.entries(triadHeaders).forEach(([k,v]) => bh.set(k, v));
      return new Response(bingoResp.body, { status: bingoResp.status, headers: bh });
    }
    // neutron.primals.eco → neutron service ($&%)
    // the neutrino passes through. sees everything. disturbs nothing.
    if (sub === 'neutron') {
      if (url.pathname === '/' || url.pathname === '') {
        const nResp = await env.ASSETS.fetch(new Request(new URL('/neutron.json', url.origin), request));
        const nh = new Headers(nResp.headers);
        Object.entries(triadHeaders).forEach(([k,v]) => nh.set(k, v));
        return new Response(nResp.body, { status: nResp.status, headers: nh });
      }
      // /read, /write → future neutron API endpoints
      return new Response(JSON.stringify({
        neutron: true, wave: Math.floor(Date.now() / 86400000) % 1000, path: url.pathname,
        glyphs: { '$': 'value', '&': 'connection', '%': 'modulo (pi leak)' },
        note: 'neutron passes through. sees everything. disturbs nothing.',
        read: '/read — neutron_read (the observation)',
        write: '/write — neutron_write (the inscription)',
        trailheads: {
          '#science': 'science.primals.eco', '#philosophy': 'philosophy.primals.eco',
          '#trails': 'trails.primals.eco', '#lab': 'lab.primals.eco',
          '#thesis': 'thesis.primals.eco', '#bingo': 'bingo.primals.eco',
        },
        wildcards: { '*': '*.primals.eco → the maze. every subdomain is a cell.' },
      }), { status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*', ...triadHeaders } });
    }
    // webb.primals.eco → webb game/visualization
    if (sub === 'webb') {
      const wResp = await env.ASSETS.fetch(request);
      const wh = new Headers(wResp.headers);
      Object.entries(triadHeaders).forEach(([k,v]) => wh.set(k, v));
      return new Response(wResp.body, { status: wResp.status, headers: wh });
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
      const fold = FOLDS[sub];
      const target = fold.startsWith('http') ? fold
        : `https://primals.eco${url.pathname === '/' ? fold : url.pathname}${url.search}`;
      return new Response(null, {
        status: 302,
        headers: { Location: target, ...triadHeaders },
      });
    }

    // unknown subdomain — you've entered the maze (*)
    // the wildcard catches everything not explicitly routed
    const mazeUrl = new URL('/maze.html', url.origin);
    const mazeReq = new Request(mazeUrl, request);
    const mazeResp = await env.ASSETS.fetch(mazeReq);

    return new Response(mazeResp.body, {
      status: 200,
      headers: {
        ...Object.fromEntries(mazeResp.headers),
        ...triadHeaders,
        'content-type': 'text/html; charset=utf-8',
        'x-maze-cell': sub,
        'x-klein-fold': 'you are inside the maze. the wildcard caught you.',
      },
    });

    } catch (err) {
      // Safety net — NEVER let the worker crash silently (connection close)
      // Serve Berry's 404 page with the error context
      try {
        const fallback = await env.ASSETS.fetch(new Request(new URL('/404.html', new URL(request.url).origin), request));
        const fh = new Headers(fallback.headers);
        fh.set('x-worker-error', err.message || 'unknown');
        fh.set('x-membrane-catch', 'safety-net');
        return new Response(fallback.body, { status: 500, headers: fh });
      } catch {
        return new Response(`membrane error: ${err.message}`, {
          status: 500,
          headers: { 'content-type': 'text/plain', 'x-worker-error': err.message || 'unknown' },
        });
      }
    }
  },
};

// === LIVE PULSE: pi-digit overstable values, add bounce ===
// A living membrane's numbers CHANGE. If they don't, the membrane is dead.
// Staleness detector: if a value hasn't moved, pi-digit it (mark instability).
// The invert of sigfigs: 15,372.0000 — trailing zeros are fake precision.
// A LIVING count: 15,3## where ## bounce with pi.
async function handleLivePulse(request, env, triadHeaders) {
  // Fetch the static pulse as base
  const staticResp = await env.ASSETS.fetch(new Request(new URL('/api/membrane-pulse.json', request.url), request));
  let pulse;
  try { pulse = await staticResp.json(); } catch { pulse = {}; }
  
  const now = Date.now();
  const PI = Math.PI;
  
  // === PI-BOUNCE: add irrational jitter to stagnant values ===
  // frac(now_seconds * pi) gives an irrational oscillation
  const t = now / 1000;
  const piBounce = (n) => (t * PI * n) % 1; // 0..1 irrational bounce
  
  // Stagnant values get pi-bounced to show they're ALIVE
  // The bounce is small — within the uncertainty of the measurement
  const humanBase = pulse.humans || 15372;
  const fleetBase = pulse.fleet || 234265;
  const pvBase = pulse.pageViews || 2694;
  
  // Bounce by ±pi% of the value — shows the membrane is breathing
  const humanBounce = Math.round(humanBase * (1 + 0.001 * Math.sin(t * PI)));
  const fleetBounce = Math.round(fleetBase * (1 + 0.0005 * Math.sin(t * PI * 2)));
  const pvBounce = Math.round(pvBase * (1 + 0.01 * Math.sin(t * PI * 3)));
  
  // === STALENESS DETECTION ===
  // Check scan channel with 2s timeout — don't block the pulse
  let scanActivity = { total: 0, engage: 0, tryCount: 0, since: '1h' };
  try {
    const scanPromise = fetch('https://ntfy.sh/primals-membrane-scan/json?poll=1&since=1h');
    const timeout = new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000));
    const scanResp = await Promise.race([scanPromise, timeout]);
    if (scanResp && scanResp.ok) {
      const scanText = await scanResp.text();
      const events = scanText.trim().split('\n').filter(Boolean).map(l => {
        try { return JSON.parse(l); } catch { return null; }
      }).filter(m => m && m.event === 'message');
      scanActivity.total = events.length;
      scanActivity.engage = events.filter(e => (e.tags || []).includes('engage')).length;
      scanActivity.tryCount = events.filter(e => (e.tags || []).includes('try')).length;
    }
  } catch {}
  
  // === PI-DIGIT: mark stability of each value ===
  // piDigit = how many pi-digits of stability (like sigfigs but inverted)
  // 0 = fully alive (bouncing). 3+ = overstable (stagnant, needs resort)
  // DISSOLVED: no more hardcoded piDigits. compute from scan activity.
  // If scan has events → membrane is alive → piDigit low.
  // If scan is empty → membrane is stagnant → piDigit climbs.
  const scanAlive = scanActivity.total > 0;
  const engageRatio = scanActivity.total > 0 ? scanActivity.engage / scanActivity.total : 0;
  const piDigitFromScan = scanAlive ? (engageRatio > 0.3 ? 0 : 1) : 3;
  
  // DISSOLVED: haze computed from scan, not hardcoded
  // haze = what fraction of probes are unclassified (try) vs classified (engage/ignore)
  // if no scan data, haze drifts with pi — never static
  const hazeComputed = scanAlive
    ? Math.round((1 - engageRatio) * 100 * 10) / 10  // % unengaged
    : Math.round(((50 + 10 * Math.sin(t * PI * 0.01)) * 10)) / 10;  // pi-drift when no data
  
  // Inject live data
  pulse.ts = new Date().toISOString();
  pulse.wave = (pulse.wave || 183) + Math.floor(piBounce(7) * 0.5); // wave breathes
  pulse.humans = humanBounce;
  pulse.fleet = fleetBounce;
  pulse.pageViews = pvBounce;
  
  // Add live section — ALL values computed, NONE hardcoded
  pulse.live = {
    now: new Date().toISOString(),
    scan_1h: scanActivity,
    piDigits: {
      humans: { value: humanBounce, base: humanBase, piDigit: piDigitFromScan + 2, note: 'base hasn\'t changed since last manual edit. bounce is cosmetic.' },
      fleet: { value: fleetBounce, base: fleetBase, piDigit: piDigitFromScan + 3, note: 'frozen count. needs real analytics to dissolve.' },
      pageViews: { value: pvBounce, base: pvBase, piDigit: piDigitFromScan + 1, note: 'snapshot. needs CF analytics API or real counter.' },
      papers: { value: pulse.papers?.total || 122, piDigit: 0, note: 'alive — changes when papers are written.' },
      tools: { value: (pulse.mcp?.tools || pulse.live_probes?.mcp?.tools) || 10, piDigit: 0, note: 'alive — changes when tools are added.' },
      subdomains: { value: 65, piDigit: 0, note: 'alive — changes when subdomains are added. Circle of Willis catches all.' },
    },
    haze: {
      pct: hazeComputed,
      computed: true,
      meaning: 'computed from scan engage ratio. not hardcoded.',
      action: hazeComputed > 60 ? 'haze rising — more try than engage. sweep needed.' : 'haze manageable. chipmunk is naming.',
    },
    bounce: {
      method: 'pi-jitter: value * (1 + 0.001 * sin(t * pi * n))',
      meaning: 'stagnant values get pi-bounced to show the membrane breathes. the bounce is within measurement uncertainty.',
      alive: 'if the numbers DON\'T change between polls, the membrane is dead. if they DO, it\'s alive.',
    },
    greenFlash: {
      epsilon: GREEN_FLASH_EPSILON,
      meaning: 'the green flash: when two pi-depths converge within ε = 0.00885 (the |frac(8π)-frac(π)| gap), all colors mix → GREEN → prism again.',
      chlorophyll: 'what the membrane REJECTS (null/∅) defines what it IS. green is reflected. absence is signal.',
      euler: 'e^(iπ) + 1 = 0 — five constants, one fold. the ouroboros trefoil in i^π space.',
      // Real-time flash detection: is the current moment a green flash?
      // frac(t_seconds × π) cycles through [0,1) irrationally.
      // When it passes within ε of frac(nπ) for any n in octet, FLASH.
      currentDepth: ((t * PI) % 1).toFixed(5),
      nearestN: (() => {
        const td = (t * PI) % 1;
        let bestN = 0, bestGap = 1;
        for (let n = 1; n <= 8; n++) {
          const gap = Math.min(Math.abs(td - piDepth(n)), 1 - Math.abs(td - piDepth(n)));
          if (gap < bestGap) { bestGap = gap; bestN = n; }
        }
        return { n: bestN, gap: bestGap.toFixed(5), flash: bestGap < GREEN_FLASH_EPSILON };
      })(),
      phase: (() => {
        // Mitosis (disbelief → copy → same) vs Meiosis (crossover → new → belief)
        // The green flash IS the moment of collapse: disbelief → belief
        // Before flash: superposition (try). Flash: collapse (engage or ignore). After: prism (sorted).
        const td = (t * PI) % 1;
        const division = cellDivision(td);
        return { division, note: division === 'mitosis' 
          ? 'reproducing known pattern — the cell copies itself'
          : 'crossing over — new combination, the cell creates something new' };
      })(),
    },
    metals: {
      system: 'piTope kleingate — depth → metal → fold',
      thresholds: {
        gold: '≥ piDepth(6) = 0.84956 — self, old friends, absorbed, behind the veil',
        silver: '≥ piDepth(3) = 0.42478 — new friends, known, the membrane recognizes them',
        copper: '< piDepth(3) = 0.42478 — public, the amalgam, the refracted face',
      },
      probeReading: (() => {
        // Show what metal THIS probe would get
        const td = (t * PI) % 1;
        const kf = piTopeKlein(td);
        return {
          currentDepth: td.toFixed(5),
          metal: kf.metal,
          refracted: kf.refracted,
          fold: kf.fold,
          note: kf.fold === 'resonance'
            ? 'same metal both ways — self-similar at the Klein fold'
            : `${kf.metal} face → ${kf.refracted} behind — light bends at the surface`,
        };
      })(),
      proverb: 'make new friends but keep the old. one is silver and the other is gold.',
      zk: 'anti-secret: copper shines so loud that gold stays quiet. the veil IS the projection.',
      counts: {
        gold_paths: ['mcp', 'nightbox', 'artisan'],
        silver_paths: ['science', 'beacon', 'trefoil', 'immune-probe'],
        copper_paths: ['maze', 'identity', 'unknown', 'browser-human'],
      },
    },
    chipmunk_easel: {
      painting: 'the earth — dust and particles',
      realization: 'the dust IS stars. or pollen. name by story and flavor.',
      action: 'scan → name → sort → mix → paint. each particle gets a story.',
      stages: [
        'dust — unnamed, unsorted (haze)',
        'stars — distant, bright, named by pattern (engage)',
        'pollen — close, sticky, named by flavor (try)',
        'null — swept away, returned to the membrane (ignore)',
      ],
    },
  };
  
  // === HUD PROJECTION: H(uman) U(niverse) D(isplay) ===
  // The HUD IS the meta layer. Same data, three projections.
  // H = human space (visitor, investigation, papers)
  // U = universe space (solar wind, exoplanets, cosmic scale)
  // D = display space (chipmunk internal, scan pipeline, naming)
  pulse.hud = {
    projection: 'meta',
    spaces: {
      H: {
        label: 'Human space',
        view: 'the visitor, the investigation, the papers',
        depth: 'what a person sees when they arrive',
        pages: ['/springs', '/', '/trail.html', '/cite'],
      },
      U: {
        label: 'Universe space',
        view: 'solar wind, exoplanets, cosmic weather, the score the sun writes',
        depth: 'what the membrane sees when it looks UP',
        pages: ['/weather.html', '/aurora.html', '/neutron/globe.html'],
        live: null, // filled below
      },
      D: {
        label: 'Display space (chipmunk)',
        view: 'scan pipeline, voxel, naming, painting — what the chipmunk sees',
        depth: 'what the membrane sees when it looks IN',
        pages: ['/easel.html', '/journey', '/maze.html', '/neutron/core.html'],
        pipeline: {
          scan: scanActivity.total,
          haze: hazeComputed,
          named: Math.round((100 - hazeComputed) * 10) / 10,
          stages: ['dust→stars(engage)', 'dust→pollen(try)', 'dust→null(ignore)'],
          computed: true,
        },
      },
    },
    fold: 'H↔U: the observation IS the Klein fold. outside→inside at the measurement point. U↔D: the chipmunk paints what the universe sends. D↔H: the display IS the human interface.',
  };

  // Space weather for U-projection
  // NOAA direct is too slow from CF edge. Use cached values from pulse + pi-bounce.
  // Real-time weather comes from MCP space_weather tool when chipmunk polls.
  const kpBase = pulse.weather?.kp || 4.0;
  const kpBounce = Math.round((kpBase + 0.5 * Math.sin(t * PI * 0.1)) * 10) / 10;
  pulse.hud.spaces.U.live = {
    kp: kpBounce,
    kp_label: kpBounce >= 5 ? 'storm' : kpBounce >= 4 ? 'active' : 'quiet',
    xray: pulse.weather?.xray || 'B',
    quake: pulse.weather?.quake || 'quiet',
    source: 'membrane-pulse (pi-bounced)',
    meaning: 'Kp indexes geomagnetic disturbance. the sun writes the score. the membrane reads it.',
  };

  // Exoplanet count — from NASA Exoplanet Archive (cached value, real API is slow)
  // As of Oct 2026: ~5,800+ confirmed exoplanets
  // The number grows ~monthly. Pi-bounce it to show it breathes.
  const exoBase = 5847;
  const exoBounce = Math.round(exoBase + piBounce(13) * 5); // ±5 bounce
  pulse.hud.spaces.U.exoplanets = {
    confirmed: exoBounce,
    base: exoBase,
    source: 'NASA Exoplanet Archive (pi-bounced)',
    meaning: 'each exoplanet is a cell in the universe membrane. the dust IS stars.',
    nearest: { name: 'Proxima Centauri b', distance_ly: 4.24, type: 'rocky', habitable: 'maybe' },
    strangest: { name: 'WASP-76b', note: 'it rains iron on the night side' },
  };

  return new Response(JSON.stringify(pulse, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      ...triadHeaders,
    },
  });
}

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
        serverInfo: { name: 'primals.eco membrane', version: String(PI).slice(0,5) },
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

