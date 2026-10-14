// pi-bus.js v2 — shared π-timed data bus with throttle awareness
// Single fetch per endpoint, all consumers subscribe
// Respects membrane-throttle tier for mobile/weak devices
// Pauses polling when page is hidden
(function(){
  "use strict";
  var cache = {};      // url → {data, ts, subs:[], timer, rate}
  var _m = window._membrane || {}; var PI = _m.PI || Math.PI;
  var PI2 = PI * PI;   // ≈ 9.87s

  // throttle multiplier from membrane-throttle.js (1x, 2x, or 3x)
  var throttle = window._membraneThrottle || {};
  var mult = throttle.rateMultiplier || 1;

  // π-timed intervals, scaled by device capability
  var RATES = {
    fast:    Math.round(PI2 * 1000 * mult),            // full: π²≈10s, reduced: 20s, minimal: 30s
    medium:  Math.round(PI2 * PI * 1000 * mult),       // full: π³≈31s, reduced: 62s, minimal: 93s
    slow:    Math.round(PI2 * PI * PI * 1000 * mult)   // full: π⁴≈97s, reduced: 194s, minimal: 291s
  };

  var _fetchQueue = [];
  var _fetching = 0;
  var MAX_CONCURRENT = throttle.tier === "minimal" ? 1 : (throttle.tier === "reduced" ? 2 : 4);

  function _doFetch(url) {
    var c = cache[url];
    if (!c) return;
    // skip if page hidden
    if (document.hidden) return;
    _fetching++;
    fetch(url, {cache: "no-store"})
      .then(function(r) { return r.ok ? (url.endsWith(".json") ? r.json() : r.text()) : null; })
      .then(function(d) {
        _fetching--;
        if (d !== null) {
          c.data = d;
          c.ts = Date.now();
          for (var i = 0; i < c.subs.length; i++) {
            try { c.subs[i](d); } catch(e) {}
          }
        }
        _drainQueue();
      })
      .catch(function(){ _fetching--; _drainQueue(); });
  }

  function _drainQueue() {
    while (_fetchQueue.length > 0 && _fetching < MAX_CONCURRENT) {
      _doFetch(_fetchQueue.shift());
    }
  }

  function _fetch(url) {
    if (_fetching >= MAX_CONCURRENT) {
      // queue it — don't pile up
      if (_fetchQueue.indexOf(url) === -1) _fetchQueue.push(url);
      return;
    }
    _doFetch(url);
  }

  // Subscribe to a data feed
  function sub(url, callback, rate) {
    rate = rate || "fast";
    if (!cache[url]) {
      cache[url] = {data: null, ts: 0, subs: [], timer: null, rate: rate};
      _fetch(url);
      cache[url].timer = setInterval(function(){ _fetch(url); }, RATES[rate] || RATES.fast);
    }
    cache[url].subs.push(callback);
    if (cache[url].data !== null) {
      try { callback(cache[url].data); } catch(e) {}
    }
  }

  function get(url) {
    return cache[url] ? cache[url].data : null;
  }

  // pause/resume on visibility
  var _timers = [];
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      // pause all timers
      for (var url in cache) {
        if (cache[url].timer) {
          clearInterval(cache[url].timer);
          _timers.push({url: url, rate: cache[url].rate});
          cache[url].timer = null;
        }
      }
    } else {
      // resume all timers
      for (var i = 0; i < _timers.length; i++) {
        var t = _timers[i];
        if (cache[t.url]) {
          _fetch(t.url); // immediate refresh on return
          cache[t.url].timer = setInterval(function(u){ return function(){ _fetch(u); }; }(t.url), RATES[t.rate] || RATES.fast);
        }
      }
      _timers = [];
    }
  });

  window._piBus = {sub: sub, get: get, cache: cache, RATES: RATES};
  console.log("[pi-bus] v2 tier=" + (throttle.tier||"full") + " mult=" + mult + " maxConcurrent=" + MAX_CONCURRENT + " rates: fast=" + RATES.fast + "ms medium=" + RATES.medium + "ms slow=" + RATES.slow + "ms");
})();
