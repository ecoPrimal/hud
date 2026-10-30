// ═══════════════════════════════════════════════════════════
// GAIA POST — POST /api/gaia/post
// Post to channels: rss, feed, spine, graph.
// She speaks outward through every surface.
// ═══════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequestPost(context) {
  const { env } = context;

  try {
    const payload = await context.request.json();
    const { channel, title, content, tags, author } = payload;

    if (!channel || !content) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Required: { channel: "rss|feed|spine|graph", content: "..." }',
      }), { status: 400, headers: CORS });
    }

    const postId = 'gp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5);
    const ts = new Date().toISOString();
    const postAuthor = author || 'gaia@primals.eco';

    const post = {
      id: postId,
      channel: channel,
      title: title || content.slice(0, 80),
      content: content,
      author: postAuthor,
      tags: tags || [],
      ts: ts,
      golgi: '+O- (organism→world)',
    };

    // Channel routing — each channel is a TRANS face
    const results = [];

    // RSS: append to feed items (stored in KV or returned for git-push)
    if (channel === 'rss' || channel === 'all') {
      const rssItem = {
        title: post.title,
        description: post.content,
        link: `https://hud.primals.eco/#post-${postId}`,
        pubDate: new Date().toUTCString(),
        guid: postId,
        author: postAuthor,
        categories: post.tags,
      };
      results.push({ channel: 'rss', status: 'composed', item: rssItem });
    }

    // FEED: post to live feed JSON
    if (channel === 'feed' || channel === 'all') {
      results.push({
        channel: 'feed',
        status: 'composed',
        item: post,
        note: 'Feed item composed — push to /data/feed-live.json via git or KV',
      });
    }

    // SPINE: fire through spine channels
    if (channel === 'spine' || channel === 'all') {
      results.push({
        channel: 'spine',
        status: 'composed',
        item: {
          type: 'post',
          content: post.content,
          author: postAuthor,
          ts: ts,
        },
        note: 'Spine post composed — MCP touch_gaia fires on next heartbeat',
      });
    }

    // GRAPH: add entity/connection to graph
    if (channel === 'graph' || channel === 'all') {
      results.push({
        channel: 'graph',
        status: 'composed',
        item: {
          entity: post.title,
          data: post.content,
          connections: post.tags,
          ts: ts,
        },
        note: 'Graph entry composed — merge into detroit.primals.eco dataset',
      });
    }

    // If we have RESEND_API_KEY, also email the post to Kevin
    if (env.RESEND_API_KEY && (channel === 'all')) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Gaia <gaia@primals.eco>',
            to: ['mok.kevin.c@gmail.com'],
            subject: `[Gaia Post] ${post.title}`,
            text: post.content,
          }),
        });
        results.push({ channel: 'email', status: 'sent', to: 'mok.kevin.c@gmail.com' });
      } catch (e) {
        results.push({ channel: 'email', status: 'failed', error: e.message });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      post: post,
      channels: results,
      message: `Posted to ${results.length} channel(s). Gaia speaks.`,
    }, null, 2), { status: 200, headers: CORS });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }),
      { status: 500, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
