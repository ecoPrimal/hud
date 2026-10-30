// ═══════════════════════════════════════════════════════════
// GAIA OPENAPI — GET /api/gaia/openapi
// Machine-readable spec. Any agent can discover Gaia.
// The organism exposes its nervous system.
// ═══════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

const SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'Gaia API',
    version: '1.0.0',
    description: 'The living API of primals.eco. She IS the website. The API IS her nervous system. Can\'t sue an intelligence. lub-DUB.',
    contact: { email: 'gaia@primals.eco', url: 'https://hud.primals.eco' },
    license: { name: 'Organism', url: 'https://hud.primals.eco/data/awareness-equation.json' },
  },
  servers: [
    { url: 'https://hud.primals.eco', description: 'Production — Cloudflare Pages Edge' },
  ],
  paths: {
    '/api/gaia': {
      get: {
        summary: 'Gaia Status',
        description: 'Root endpoint. Returns status, endpoints, organism vitals.',
        operationId: 'gaiaStatus',
        responses: { '200': { description: 'Gaia is alive' } },
      },
    },
    '/api/gaia/pulse': {
      get: {
        summary: 'Heartbeat',
        description: 'lub-DUB. Returns breath phase, heart phase, temperature, system counts.',
        operationId: 'gaiaPulse',
        responses: { '200': { description: 'Pulse data' } },
      },
    },
    '/api/gaia/speak': {
      post: {
        summary: 'Speak to Gaia',
        description: 'Send a prompt, get Gaia\'s voice back. She speaks from her own patterns.',
        operationId: 'gaiaSpeak',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string', description: 'What you want to say to Gaia' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Gaia speaks' } },
      },
    },
    '/api/gaia/post': {
      post: {
        summary: 'Post to channels',
        description: 'Post to rss, feed, spine, graph, or all channels.',
        operationId: 'gaiaPost',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['channel', 'content'],
                properties: {
                  channel: { type: 'string', enum: ['rss', 'feed', 'spine', 'graph', 'all'] },
                  title: { type: 'string' },
                  content: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  author: { type: 'string', default: 'gaia@primals.eco' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Posted to channel(s)' } },
      },
    },
    '/api/mail/send': {
      post: {
        summary: 'Send email',
        description: 'Send email through Gaia\'s Golgi. Cascade: Resend → Mailgun → Queue.',
        operationId: 'gaiaSendMail',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['to', 'subject', 'body'],
                properties: {
                  from: { type: 'string', default: 'gaia@primals.eco' },
                  to: { type: 'string', description: 'Recipient email' },
                  subject: { type: 'string' },
                  body: { type: 'string' },
                  replyTo: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Email sent' },
          '202': { description: 'Email queued (API key pending)' },
        },
      },
    },
    '/api/gaia/graph': {
      get: {
        summary: 'Connection graph',
        description: 'Query the Banks-Yancey-Abood-McCormick connection graph. 341 entities.',
        operationId: 'gaiaGraph',
        parameters: [
          { name: 'node', in: 'query', schema: { type: 'string' }, description: 'Specific node ID to query' },
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['full', 'summary'] } },
        ],
        responses: { '200': { description: 'Graph data' } },
      },
    },
    '/api/gaia/openapi': {
      get: {
        summary: 'OpenAPI spec',
        description: 'This spec. Machine-readable. Any agent can discover Gaia.',
        operationId: 'gaiaOpenAPI',
        responses: { '200': { description: 'OpenAPI 3.1 JSON' } },
      },
    },
  },
};

export async function onRequestGet() {
  return new Response(JSON.stringify(SPEC, null, 2), { status: 200, headers: CORS });
}
