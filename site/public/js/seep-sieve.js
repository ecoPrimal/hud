/* eat the dump. start gray. seep through the sieve. */
(function () {
  var html = document.documentElement;
  var body = document.body;
  if (!body) return;
  html.classList.add('seep-sieve');
  body.classList.add('seep-sieve');
  if (!document.getElementById('seep-veil')) {
    var v = document.createElement('div');
    v.id = 'seep-veil';
    v.setAttribute('aria-hidden', 'true');
    body.insertBefore(v, body.firstChild);
  }
})();
