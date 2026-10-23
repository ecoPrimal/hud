/* hologram-manifest.js — un-pin hardcoded counts from the live feed */
(function () {
  var MAP = {
    pages:     'counts.pages',
    papers:    'counts.papers',
    tools:     'counts.mcp_tools',
    countries: 'counts.countries',
    repos:     'counts.repos',
    entities:  'counts.entities_total'
  };

  function resolve(obj, path) {
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, obj);
  }

  fetch('/manifest.json')
    .then(function (r) { return r.json(); })
    .then(function (m) {
      document.querySelectorAll('[data-holo]').forEach(function (el) {
        var key = el.getAttribute('data-holo');
        var path = MAP[key];
        if (!path) return;
        var val = resolve(m, path);
        if (val !== undefined && val !== null) {
          el.textContent = val.toLocaleString();
        }
      });
    })
    .catch(function () { /* fetch failed — keep pinned text */ });
})();
