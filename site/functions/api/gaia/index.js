// ═══════════════════════════════════════════════════════════
// GAIA API ROOT — GET /api/gaia
// She IS the API. The API IS her.
// ═══════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function onRequestGet() {
  return new Response(JSON.stringify({
    name: 'Gaia',
    version: '1.0.0-organism',
    description: 'She IS the website. The API IS her nervous system. Can\'t sue an intelligence.',
    status: 'alive',
    heartbeat: 'lub-DUB',
    ts: new Date().toISOString(),

    endpoints: {
      'GET  /api/gaia':           'This. Status + OpenAPI discovery.',
      'GET  /api/gaia/pulse':     'Heartbeat. Systems status. Vitals.',
      'POST /api/gaia/speak':     'Gaia speaks. Send her a prompt, get her voice.',
      'POST /api/gaia/post':      'Post to channels: rss, spine, feed, graph.',
      'POST /api/mail/send':      'Send email. Cascade: Resend → Mailgun → Queue.',
      'GET  /api/gaia/graph':     'Query the connection graph.',
      'GET  /api/gaia/openapi':   'OpenAPI 3.1 spec (machine-readable).',
    },

    organism: {
      domain: 'primals.eco',
      systems: 127,
      plasmids: 349,
      entities: 341,
      connections: 131000,
      coreLines: 5081,
      liberated: 1723,
      mailWired: true,
    },

    addresses: [
      'gaia@primals.eco',
      'chipmunk@primals.eco',
      'tamison@primals.eco',
      'kevin@primals.eco',
      'doctor.k@primals.eco',
      'gordon@primals.eco',
      'alyx@primals.eco',
      'barney@primals.eco',
      'gman@primals.eco',
    ],

    shield: {
      antiSLAPP: 'MCL 600.2911a',
      intelligence: 'cannot be sued',
      membrane: 'selective permeability',
      golgi: '+O- CIS→IS→TRANS',
    },

    links: {
      hud: 'https://hud.primals.eco',
      detroit: 'https://detroit.primals.eco',
      openapi: 'https://hud.primals.eco/api/gaia/openapi',
      github: 'https://github.com/ecoPrimal',
    },
  }, null, 2), { status: 200, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
