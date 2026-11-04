// ═══════════════════════════════════════════════════════════
// IO — NestGate pattern. THE IO.
// Collapsed from klein-io + gaia-desk-io + gaia-human-io
//
// NestGate = Storage/Federation in biomeOS
// Klein = the face (what the world sees through the bottle)
// Everything reads/writes through ONE IO layer.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var cache = {};     // path → { data, ts, ttl }
  var pending = {};   // path → Promise
  var dataRoot = '/data/';

  // Read data (with cache)
  function read(path, opts) {
    opts = opts || {};
    var fullPath = path.startsWith('/') ? path : dataRoot + path;
    var ttl = opts.ttl || 60000; // 1 minute default

    // Check cache
    var cached = cache[fullPath];
    if (cached && (Date.now() - cached.ts) < ttl) {
      return Promise.resolve(cached.data);
    }

    // De-dupe concurrent requests
    if (pending[fullPath]) return pending[fullPath];

    pending[fullPath] = fetch(fullPath)
      .then(function(r) {
        if (!r.ok) throw new Error(r.status + ' ' + fullPath);
        var ct = r.headers.get('content-type') || '';
        return ct.indexOf('json') >= 0 ? r.json() : r.text();
      })
      .then(function(data) {
        cache[fullPath] = { data: data, ts: Date.now(), ttl: ttl };
        delete pending[fullPath];
        return data;
      })
      .catch(function(e) {
        delete pending[fullPath];
        throw e;
      });

    return pending[fullPath];
  }

  // Read JSON specifically
  function json(path, opts) {
    return read(path.endsWith('.json') ? path : path + '.json', opts);
  }

  // Batch read multiple paths
  function batch(paths, opts) {
    return Promise.all(paths.map(function(p) { return read(p, opts); }));
  }

  // Write to localStorage (client-side persistence)
  function store(key, value) {
    try {
      localStorage.setItem('gaia:' + key, JSON.stringify({ v: value, ts: Date.now() }));
      return true;
    } catch(e) { return false; }
  }

  // Read from localStorage
  function recall(key, maxAge) {
    try {
      var raw = localStorage.getItem('gaia:' + key);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (maxAge && (Date.now() - parsed.ts) > maxAge) return null;
      return parsed.v;
    } catch(e) { return null; }
  }

  // Clear cache
  function flush(path) {
    if (path) { delete cache[path]; }
    else { cache = {}; }
  }

  // Stats
  function stats() {
    return {
      cached: Object.keys(cache).length,
      pending: Object.keys(pending).length,
      stored: Object.keys(localStorage).filter(function(k) { return k.startsWith('gaia:'); }).length
    };
  }

  window.GAIA_IO = {
    read: read,
    json: json,
    batch: batch,
    store: store,
    recall: recall,
    flush: flush,
    stats: stats,
    cache: cache
  };

})(window.G || (window.G = {}));
