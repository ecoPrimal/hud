// NUCLEATION: PRNG seed — 4 lines that determine everything
// Tommy Ettinger, public domain. The seed IS the viewer.
(function(window) {
  'use strict';
  var urlSeed = new URLSearchParams(location.search).get('seed');
  var SEED = urlSeed ? parseInt(urlSeed, 10) : (crypto.getRandomValues(new Uint32Array(1))[0]);
  if (!urlSeed) {
    var u = new URL(location.href);
    u.searchParams.set('seed', SEED);
    history.replaceState(null, '', u);
  }

  function mulberry32(s) {
    return function() {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, s | 1);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var rng = mulberry32(SEED);
  function rngRange(lo, hi) { return lo + rng() * (hi - lo); }
  function rngInt(lo, hi) { return Math.floor(rngRange(lo, hi)); }
  function rngPick(arr) { return arr[rngInt(0, arr.length)]; }

  window.GAIA_SEED = SEED;
  window.rng = rng;
  window.rngRange = rngRange;
  window.rngInt = rngInt;
  window.rngPick = rngPick;
})(window);
