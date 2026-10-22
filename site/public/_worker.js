// _worker.js — the Klein fold
// catches ALL requests to *.primals.eco
// routes subdomains → HUD paths
// the wildcard IS the maze. this worker IS the fold.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;

    // extract subdomain
    const parts = host.split('.');
    const isSubdomain = parts.length > 2 || (parts.length === 2 && !['primals'].includes(parts[0]));
    const sub = parts.length > 2 ? parts.slice(0, -2).join('.') : null;

    // core domains — serve as-is (Cloudflare Pages handles these)
    if (!sub || sub === 'hud' || sub === 'www') {
      return env.ASSETS.fetch(request);
    }

    // known subdomain → path redirects (the fold)
    const FOLDS = {
      'water':      '/',              // wateringHole IS the core, becomes the HUD
      'sporeprint': '/sporeprint',    // sporePrint bedrock
      'tuebor':     '/',              // defense IS the membrane
      'detroit':    '/',              // evidence lives in the HUD dashboard
      'signal':     '/',              // observatory IS the membrane view
      'clutch':     '/',              // investigation IS the sort deck
      'hypothesis': '/sporeprint',    // hypothesis → sporePrint
      'thesis':     '/sporeprint',    // thesis → sporePrint
      'gorilla':    '/',              // verification IS the membrane
      'barry':      '/',              // evidence → HUD
      'live':       '/',              // petalTongue → HUD (it IS live)
      'git':        '/',              // source → HUD (nav ring has git link)
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
    };

    if (FOLDS[sub]) {
      // preserve the path if one was given
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
