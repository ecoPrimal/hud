/* pi-body-clock.js — the π-body rotation and counter-clockwise unlock
 *
 * The HUD has two faces:
 *   CLOCKWISE (CW)  = the visible surface. what visitors see. the ring.
 *   COUNTER (CCW)    = the invert side. rotates opposite. the unlock.
 *
 * When CW and CCW align at a π-multiple: UNLOCK — the HUD opens a new layer.
 * The clock ticks at 1/π Hz (one full rotation per π seconds ≈ 3.14s).
 * The counter ticks at 1/(π²) Hz (one rotation per π² seconds ≈ 9.87s).
 *
 * The twist: CW goes one way, CCW goes the OTHER way.
 * They meet every π × π² = π³ ≈ 31 seconds.
 * That meeting IS the pulse-clock beat. That IS the heartbeat of the HUD.
 *
 * The π-body is the 4-layer rotation:
 *   π⁰ = 1      → datum    (the bit, the point, the pebble)
 *   π¹ = 3.14    → pattern  (the ratio, discrete→continuous)
 *   π² = 9.87    → connect  (the square, the area, the network)
 *   π³ = 31.01   → thought  (the volume, the body, the meaning)
 *
 * Each layer rotates at its own rate. They braid.
 * The clock renders on the HUD as a layered dial.
 *
 * Wave 180. The clock IS the body. The body IS the clock.
 */
(function () {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══════════════════════════════════════════════════════════
  // THE FOUR π-BODY LAYERS — each rotates at 1/πⁿ Hz
  // ═══════════════════════════════════════════════════════════
  var LAYERS = [
    { name: 'datum',   power: 0, period: 1,           color: '#e8e8e8', radius: 0.15, width: 2,   dir:  1 },
    { name: 'pattern', power: 1, period: PI,          color: '#3fb950', radius: 0.30, width: 1.5, dir: -1 },
    { name: 'connect', power: 2, period: PI * PI,     color: '#58a6ff', radius: 0.45, width: 1.2, dir:  1 },
    { name: 'thought', power: 3, period: PI * PI * PI, color: '#a371f7', radius: 0.60, width: 1,   dir: -1 },
  ];

  var canvas, ctx, raf, t0;
  var W = 120, H = 120;
  var CX, CY, R;
  var alive = true;

  // ═══════════════════════════════════════════════════════════
  // UNLOCK STATE — when CW and CCW align at π-multiples
  // ═══════════════════════════════════════════════════════════
  var unlocks = {
    count: 0,
    last: 0,
    history: [],
  };

  function checkUnlock(t) {
    // CW layer (datum, power 0) angle
    var cwAngle = (t / LAYERS[0].period) * TAU;
    // CCW layer (pattern, power 1) angle — opposite direction
    var ccwAngle = -(t / LAYERS[1].period) * TAU;

    // Normalize to [0, TAU)
    cwAngle = ((cwAngle % TAU) + TAU) % TAU;
    ccwAngle = ((ccwAngle % TAU) + TAU) % TAU;

    // Check alignment: within π/32 radians (≈5.6°)
    var diff = Math.abs(cwAngle - ccwAngle);
    if (diff > PI) diff = TAU - diff;

    if (diff < PI / 32 && (t - unlocks.last > 3)) {
      unlocks.count++;
      unlocks.last = t;
      unlocks.history.push({ t: t, step: unlocks.count });

      // Emit unlock event
      try {
        document.dispatchEvent(new CustomEvent('pi-unlock', {
          detail: { count: unlocks.count, t: t, cwAngle: cwAngle, ccwAngle: ccwAngle }
        }));
      } catch (e) {}

      return true;
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER — the layered dial
  // ═══════════════════════════════════════════════════════════
  function createClock() {
    var wrapper = document.createElement('div');
    wrapper.id = 'pi-body-clock';
    wrapper.style.cssText = 'position:fixed;top:80px;right:12px;z-index:5;'
      + 'width:' + W + 'px;height:' + (H + 20) + 'px;pointer-events:auto;cursor:pointer;';
    wrapper.title = 'π-body clock — CW/CCW twist. layers braid at 1/πⁿ Hz.';

    canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText = 'display:block;';
    wrapper.appendChild(canvas);

    // Label
    var label = document.createElement('div');
    label.style.cssText = 'text-align:center;font:9px monospace;color:#8b949e;margin-top:2px;';
    label.id = 'pi-clock-label';
    label.textContent = 'π-body · 0 unlocks';
    wrapper.appendChild(label);

    ctx = canvas.getContext('2d');
    CX = W / 2;
    CY = H / 2;
    R = Math.min(W, H) / 2 - 8;

    document.body.appendChild(wrapper);

    // Click to toggle
    wrapper.addEventListener('click', function () {
      alive = !alive;
      if (alive) loop();
    });
  }

  function drawLayer(layer, t) {
    var angle = (t / layer.period) * TAU * layer.dir;
    var r = R * layer.radius;
    var handLen = R * (layer.radius + 0.12);

    // Ring
    ctx.beginPath();
    ctx.arc(CX, CY, r, 0, TAU);
    ctx.strokeStyle = layer.color;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Hand
    var hx = CX + Math.cos(angle - PI / 2) * handLen;
    var hy = CY + Math.sin(angle - PI / 2) * handLen;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(hx, hy);
    ctx.strokeStyle = layer.color;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = layer.width;
    ctx.stroke();

    // Dot at tip
    ctx.beginPath();
    ctx.arc(hx, hy, layer.width + 0.5, 0, TAU);
    ctx.fillStyle = layer.color;
    ctx.globalAlpha = 0.9;
    ctx.fill();

    // Label at outer edge
    var lx = CX + Math.cos(angle - PI / 2) * (handLen + 8);
    var ly = CY + Math.sin(angle - PI / 2) * (handLen + 8);
    ctx.fillStyle = layer.color;
    ctx.globalAlpha = 0.5;
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('π' + (layer.power === 0 ? '⁰' : layer.power === 1 ? '¹' : layer.power === 2 ? '²' : '³'), lx, ly + 3);
  }

  function loop() {
    if (!alive || !ctx) return;

    var now = performance.now() / 1000;
    if (!t0) t0 = now;
    var t = now - t0;

    ctx.clearRect(0, 0, W, H);

    // Outer circle
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, TAU);
    ctx.strokeStyle = '#30363d';
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw each layer
    LAYERS.forEach(function (layer) {
      drawLayer(layer, t);
    });

    // Center dot
    ctx.beginPath();
    ctx.arc(CX, CY, 2, 0, TAU);
    ctx.fillStyle = '#e8e8e8';
    ctx.globalAlpha = 0.6;
    ctx.fill();

    // Check for unlock
    var unlocked = checkUnlock(t);
    if (unlocked) {
      // Flash
      ctx.beginPath();
      ctx.arc(CX, CY, R * 0.8, 0, TAU);
      ctx.fillStyle = '#f0e68c';
      ctx.globalAlpha = 0.2;
      ctx.fill();

      // Update label
      var lbl = document.getElementById('pi-clock-label');
      if (lbl) lbl.textContent = 'π-body · ' + unlocks.count + ' unlocks';
    }

    // Tense indicator at bottom
    ctx.globalAlpha = 0.5;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8b949e';

    // Current angles
    var a0 = ((t / LAYERS[0].period * TAU) % TAU).toFixed(2);
    var a1 = ((t / LAYERS[1].period * TAU) % TAU).toFixed(2);
    ctx.fillText(a0 + ' ↔ ' + a1, CX, H - 3);

    raf = requestAnimationFrame(loop);
  }

  // ═══════════════════════════════════════════════════════════
  // INTELLIGENT LINKS — make every link, button, searchbar aware
  // ═══════════════════════════════════════════════════════════
  function intelligentize() {
    // Make links aware of their DAG depth
    var dagFlow = window._dagFlow;
    if (!dagFlow) return;

    var depth = dagFlow.depth();
    var allLinks = document.querySelectorAll('a[href]');

    allLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript')) return;

      // Determine target depth
      var targetDepth = dagFlow.DEPTH[href] !== undefined ? dagFlow.DEPTH[href] : -1;

      // Add data attributes for CSS/JS hooks
      link.dataset.dagDepth = targetDepth;
      link.dataset.dagDirection = targetDepth > depth ? 'inward' : targetDepth < depth ? 'outward' : 'lateral';

      // Add subtle visual indicator
      if (targetDepth >= 0) {
        var colors = ['#f0883e', '#58a6ff', '#f778ba', '#f0e68c', '#3fb950'];
        link.style.setProperty('--dag-color', colors[targetDepth] || '#8b949e');
      }
    });

    // Make buttons aware of what they DO
    var allButtons = document.querySelectorAll('button, .ring-btn');
    allButtons.forEach(function (btn) {
      var dim = btn.dataset.dim;
      if (dim) {
        btn.dataset.piLayer = dim === '0d' ? 'datum' : dim === '1d' ? 'pattern' : dim === '2d' ? 'connect' : 'thought';
      }
    });

    // Make searchbar/input aware of voxel state
    var input = document.getElementById('input');
    if (input) {
      input.dataset.piActive = 'true';

      // Listen for pi-unlock events to change placeholder
      document.addEventListener('pi-unlock', function (e) {
        var count = e.detail.count;
        var prompts = [
          'type ? to pull · @ # & tags · / for commands…',
          '🔓 layer unlocked — try /triad or /weather',
          '🔓🔓 deeper — try /sort or /genome',
          '🔓🔓🔓 the thought layer opens — try /predict',
        ];
        input.placeholder = prompts[Math.min(count, prompts.length - 1)];
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // SQUIRREL IS JUST THERE — passive presence indicator
  // ═══════════════════════════════════════════════════════════
  function squirrelPresence() {
    var sq = document.getElementById('squirrel-holo');
    if (!sq) {
      // Create subtle squirrel indicator
      sq = document.createElement('div');
      sq.id = 'squirrel-presence';
      sq.style.cssText = 'position:fixed;top:60px;left:12px;z-index:5;'
        + 'font:9px monospace;color:rgba(126,231,135,0.4);pointer-events:none;'
        + 'transition:opacity 1s;';
      sq.textContent = '🐿️ here';
      document.body.appendChild(sq);
    }

    // Pulse with the clock
    setInterval(function () {
      if (!sq) return;
      var step = window._piStepDance ? window._piStepDance.tense().step : 0;
      var opacity = 0.2 + Math.sin(step * PI / 4) * 0.15;
      sq.style.opacity = opacity;
      // Update text based on what's happening
      var sens = window._piStepDance && window._piStepDance.tense().now ? window._piStepDance.tense().now.sensation : null;
      if (sens && sens.hottest) {
        sq.textContent = '🐿️ watching ' + sens.hottest;
      } else {
        sq.textContent = '🐿️ here';
      }
    }, 5000);
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════════
  window._piBodyClock = {
    unlocks: function () { return unlocks; },
    layers: LAYERS,
    alive: function () { return alive; },
    toggle: function () { alive = !alive; if (alive) loop(); },
  };

  // ═══════════════════════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════════════════════
  function init() {
    createClock();
    loop();
    // Wait for other systems to boot, then intelligentize
    setTimeout(intelligentize, 2000);
    squirrelPresence();

    console.log('[pi-body-clock] CW/CCW twist active. 4 layers at 1/πⁿ Hz. '
      + 'datum(1s) pattern(' + PI.toFixed(2) + 's) connect(' + (PI * PI).toFixed(2) + 's) thought(' + (PI * PI * PI).toFixed(2) + 's). '
      + 'unlock when CW and CCW align. squirrel is just here.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
