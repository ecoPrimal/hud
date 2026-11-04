// sitting Inter: thesis host → static book.
// index.html wins over _redirects. this middleware runs first.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'thesis.primals.eco') {
    const dest = 'https://sporeprint.primals.eco/thesis' +
      (url.pathname === '/' ? '/' : url.pathname) +
      url.search;
    return Response.redirect(dest, 302);
  }
  return context.next();
}
