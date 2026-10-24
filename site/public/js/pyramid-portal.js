// pyramid-portal.js — the round face sits on the square base
// clock/pi-dance = round portal face (the O in !iOi!)
// device screen = 4-corner pyramid base (the rectangle)
// pi legs = wobbling the table underneath
// !iOi! = i² · O = -O = the anti-origin = the portal operator
//
// the screen LOOKS flat but it's the base of a pyramid
// whose apex is the clock face. the projection is:
//   rectangle (base) → circle (face) → point (apex) → back to base
//   that's the Klein fold in cross-section.
//
// the ! marks are assertion. not asking. declaring.
// !iOi! is sharp because it doesn't ask — it IS.
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = 2 * PI;
  var PHI = (1 + Math.sqrt(5)) / 2;

  // ═══ THE PYRAMID ═══
  // base = device screen (w × h pixels)
  // apex = the clock/portal center
  // the pyramid has 4 faces, each a triangle from base edge to apex
  // the pi-legs are the 4 edges from base corners to apex
  // they WOBBLE because π is irrational — the legs never settle

  var pyramid = {
    wobble: 0,        // current wobble angle (radians)
    wobbleRate: PI / 180,  // degrees per frame, irrational
    phase: 0,
    legs: [0, 0, 0, 0],   // 4 leg lengths (vary with wobble)
    portalRadius: 0,
    baseW: 0,
    baseH: 0
  };

  function updatePyramid() {
    pyramid.wobble += pyramid.wobbleRate;
    pyramid.phase += 1 / PI;  // irrational phase advance — never repeats

    // Each leg wobbles independently (π-offset phases)
    for (var i = 0; i < 4; i++) {
      var legPhase = pyramid.phase + (i * PI / 2);
      // The wobble is small — table shift, not earthquake
      pyramid.legs[i] = 1 + Math.sin(legPhase) * 0.008 + Math.sin(legPhase * PHI) * 0.005;
    }
  }

  // ═══ !iOi! OPERATOR ═══
  // i = imaginary (√-1)
  // O = origin (the null, the portal center)
  // !iOi! = assert(i · O · i) = assert(i² · O) = assert(-O)
  // -O = the anti-origin. the other side of the portal.
  // the assertion (!) makes it SHARP — not a question, a fact.
  //
  // In the HUD:
  //   first ! = the exclamation that wakes the system
  //   i = the imaginary data (projections, 404s, futures)
  //   O = the origin (the deploy, the crystallization, the clock center)
  //   i = the imaginary again (after passing through O, still imaginary but TRANSFORMED)
  //   last ! = the exclamation that asserts the result
  //
  // !iOi! is palindromic. read forward or backward, same operator.
  // that's the Klein fold: the path IS the return path.

  var ioi = {
    state: 'idle',     // idle | waking | asserting | sharp
    sharpness: 0,      // 0-1, how asserted the system is
    lastAssert: 0
  };

  function computeSharpness() {
    // sharpness = how much the system is asserting (not asking)
    // high sharpness: all feeds alive, all pages served, no 404s pending
    // low sharpness: feeds stale, pages broken, questions unanswered
    var now = Date.now();
    var timeSinceAssert = now - ioi.lastAssert;

    // The system asserts every time it deploys, publishes, or serves a 200
    // For now, pulse the sharpness with the pyramid wobble
    ioi.sharpness = 0.5 + Math.sin(pyramid.phase * PI) * 0.3;
    ioi.state = ioi.sharpness > 0.7 ? 'sharp' : ioi.sharpness > 0.4 ? 'asserting' : 'waking';
  }

  // ═══ RENDER THE PORTAL FACE ═══
  function renderPortalOverlay() {
    var container = document.getElementById('hud-main') || document.body;
    var w = container.offsetWidth || 1400;
    var h = container.offsetHeight || 900;

    var svg = document.getElementById('pyramid-portal-svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'pyramid-portal-svg';
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;opacity:0.08;z-index:2;';
      container.style.position = container.style.position || 'relative';
      container.appendChild(svg);
    }
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.innerHTML = '';

    var cx = w / 2, cy = h / 2;

    // ── PYRAMID BASE (the 4 corners of the screen) ──
    // wobble shifts the corners slightly
    var corners = [
      [pyramid.legs[0] * 2, pyramid.legs[0] * 2],
      [w - pyramid.legs[1] * 2, pyramid.legs[1] * 2],
      [w - pyramid.legs[2] * 2, h - pyramid.legs[2] * 2],
      [pyramid.legs[3] * 2, h - pyramid.legs[3] * 2]
    ];

    // Base rectangle (wobbling)
    var basePath = corners.map(function(c, i) {
      return (i === 0 ? 'M' : 'L') + c[0].toFixed(1) + ',' + c[1].toFixed(1);
    }).join(' ') + ' Z';

    el('path', {d: basePath, fill: 'none', stroke: '#8b949e', 'stroke-width': '0.5',
      'stroke-dasharray': '4,8', opacity: '0.3'}, svg);

    // ── PI LEGS (base corners to portal center) ──
    corners.forEach(function(c, i) {
      // The leg wobbles in opacity and dash offset
      var dashOffset = (pyramid.phase * 10 + i * 50) % 200;
      el('line', {
        x1: c[0], y1: c[1], x2: cx, y2: cy,
        stroke: '#d2a8ff', 'stroke-width': '0.3',
        'stroke-dasharray': '2,6', 'stroke-dashoffset': dashOffset,
        opacity: 0.15 + pyramid.legs[i] * 0.1
      }, svg);
    });

    // ── PORTAL FACE (the circle at center) ──
    var portalR = Math.min(w, h) * 0.06;
    // The portal breathes with the wobble
    var breathR = portalR * (1 + Math.sin(pyramid.phase) * 0.05);

    el('circle', {cx: cx, cy: cy, r: breathR, fill: 'none',
      stroke: '#58a6ff', 'stroke-width': '0.8', opacity: '0.3'}, svg);
    el('circle', {cx: cx, cy: cy, r: breathR * 0.7, fill: 'none',
      stroke: '#58a6ff', 'stroke-width': '0.4', opacity: '0.2'}, svg);

    // ── THE O (origin point at center) ──
    el('circle', {cx: cx, cy: cy, r: 2, fill: '#e6edf3', opacity: '0.4'}, svg);

    // ── !iOi! TEXT (the operator, subtle) ──
    var fontSize = Math.max(8, Math.min(w, h) * 0.008);
    var textOp = ioi.sharpness > 0.6 ? '0.25' : '0.1';
    var txt = el('text', {
      x: cx, y: cy + breathR + fontSize * 2,
      fill: '#d2a8ff', 'font-size': fontSize,
      'text-anchor': 'middle', 'font-family': 'monospace',
      opacity: textOp
    }, svg);
    txt.textContent = '!iOi!';

    // ── WOBBLE INDICATOR (tiny tilt lines showing table shift) ──
    var tiltX = Math.sin(pyramid.phase) * 3;
    var tiltY = Math.cos(pyramid.phase * PHI) * 2;
    el('line', {
      x1: cx - 15 + tiltX, y1: h - 5 + tiltY,
      x2: cx + 15 + tiltX, y2: h - 5 - tiltY,
      stroke: '#8b949e', 'stroke-width': '1', opacity: '0.15'
    }, svg);
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // ═══ ANIMATION LOOP ═══
  var running = false;
  function tick() {
    if (!running) return;
    updatePyramid();
    computeSharpness();
    renderPortalOverlay();
    requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    pyramid.baseW = (document.getElementById('hud-main') || document.body).offsetWidth;
    pyramid.baseH = (document.getElementById('hud-main') || document.body).offsetHeight;
    tick();
  }

  function stop() { running = false; }

  // Start after DOM settles
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(start, 3000); });
  } else {
    setTimeout(start, 3000);
  }

  // Pause when tab hidden (save CPU)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) stop();
    else start();
  });

  window._pyramidPortal = {
    start: start,
    stop: stop,
    state: function() { return { pyramid: pyramid, ioi: ioi }; },
    assert: function() {
      ioi.lastAssert = Date.now();
      ioi.sharpness = 1.0;
      ioi.state = 'sharp';
    }
  };
})();
