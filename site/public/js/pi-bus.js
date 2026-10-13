// pi-bus.js — shared π-timed data bus
// Single fetch per endpoint, all consumers subscribe
// Eliminates duplicate polling across scripts on same page
(function(){
  "use strict";
  var cache = {};      // url → {data, ts, subs:[]}
  var PI = Math.PI;
  var PI2 = PI * PI;   // ≈ 9.87s

  // π-timed intervals (all polling aligned to π multiples)
  var RATES = {
    fast:    Math.round(PI2 * 1000),          // π² ≈ 10s
    medium:  Math.round(PI2 * PI * 1000),     // π³ ≈ 31s
    slow:    Math.round(PI2 * PI * PI * 1000)  // π⁴ ≈ 97s (not used yet)
  };

  function _fetch(url) {
    var c = cache[url];
    if (!c) return;
    fetch(url, {cache: "no-store"})
      .then(function(r) { return r.ok ? (url.endsWith(".json") ? r.json() : r.text()) : null; })
      .then(function(d) {
        if (d !== null) {
          c.data = d;
          c.ts = Date.now();
          for (var i = 0; i < c.subs.length; i++) {
            try { c.subs[i](d); } catch(e) {}
          }
        }
      })
      .catch(function(){});
  }

  // Subscribe to a data feed. Returns cached data immediately if fresh.
  // rate: "fast"|"medium"|"slow" (default "fast")
  function sub(url, callback, rate) {
    rate = rate || "fast";
    if (!cache[url]) {
      cache[url] = {data: null, ts: 0, subs: [], timer: null};
      // First subscriber starts the poll
      _fetch(url);
      cache[url].timer = setInterval(function(){ _fetch(url); }, RATES[rate] || RATES.fast);
    }
    cache[url].subs.push(callback);
    // If data already cached, fire immediately
    if (cache[url].data !== null) {
      try { callback(cache[url].data); } catch(e) {}
    }
  }

  // Get cached data without subscribing (for on-demand reads)
  function get(url) {
    return cache[url] ? cache[url].data : null;
  }

  // Expose
  window._piBus = {sub: sub, get: get, cache: cache, RATES: RATES};
})();
