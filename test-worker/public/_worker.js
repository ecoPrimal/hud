export default {
  async fetch(request, env) {
    const resp = await env.ASSETS.fetch(request);
    const h = new Headers(resp.headers);
    h.set('x-test', 'alive');
    return new Response(resp.body, { status: resp.status, headers: h });
  }
};
