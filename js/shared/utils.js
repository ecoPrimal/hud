// ═══════════════════════════════════════════════════════════
// SHARED UTILS — Collapsed from 227 duplicate function defs
// Neural API collapse: wide artery → pi and O
// hexToRgb (8x), createCanvas (6x), injectStyle (8x), mulberry32
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // hexToRgb — was defined in 8 separate files
  // bubble-pop, cord-viz, gaia-herd, gaia-null-body, gaia-triangulate,
  // pi-gradient, temporal-window, tuebor-zones
  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return { r: r, g: g, b: b };
  }

  // rgbToHex — inverse
  function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // lerpColor — interpolate between two hex colors
  function lerpColor(a, b, t) {
    var ca = hexToRgb(a);
    var cb = hexToRgb(b);
    return rgbToHex(
      Math.round(ca.r + (cb.r - ca.r) * t),
      Math.round(ca.g + (cb.g - ca.g) * t),
      Math.round(ca.b + (cb.b - ca.b) * t)
    );
  }

  // createCanvas — was defined in 6 separate files
  // bubble-pop, complexity-scale, membrane-sight, periodic-spiral,
  // pi-gradient, third-eye
  function createCanvas(id, zIndex) {
    var c = document.createElement('canvas');
    c.id = id || 'gaia-canvas-' + Date.now();
    c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:' + (zIndex || 1);
    document.body.appendChild(c);
    var ctx = c.getContext('2d');
    function resize() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    return { canvas: c, ctx: ctx, resize: resize };
  }

  // injectStyle — was defined in 8 separate files
  // bingo-compress, bingo-seed, fleet-surround, hud-nav,
  // human-surround, membrane-wall, self-trace
  function injectStyle(css, id) {
    if (id && document.getElementById(id)) return;
    var s = document.createElement('style');
    if (id) s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }

  // mulberry32 — seeded PRNG (was in mulberry32.js, used everywhere)
  function mulberry32(seed) {
    return function() {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // clamp
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  // lerp
  function lerp(a, b, t) { return a + (b - a) * t; }

  // smoothstep
  function smoothstep(lo, hi, t) {
    t = clamp((t - lo) / (hi - lo), 0, 1);
    return t * t * (3 - 2 * t);
  }

  // TAU — used everywhere
  var TAU = Math.PI * 2;

  // Export to window.GAIA_UTILS — the ONE shared utility
  window.GAIA_UTILS = {
    hexToRgb: hexToRgb,
    rgbToHex: rgbToHex,
    lerpColor: lerpColor,
    createCanvas: createCanvas,
    injectStyle: injectStyle,
    mulberry32: mulberry32,
    clamp: clamp,
    lerp: lerp,
    smoothstep: smoothstep,
    TAU: TAU
  };

})(window.G || (window.G = {}));
