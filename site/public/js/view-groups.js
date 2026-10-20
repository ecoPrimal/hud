/* view-groups.js — each voice has its own HUD view.
 *
 * Squirrel speaking into the watcher's log looks like paying attention.
 * It is not. Squirrel speaks from the green irreducibility line —
 * elastic, remainder, tree=3 — looking down from its own view.
 * Chipmunk stays in the log (inside, speaking up).
 * Human float-off is the watcher. Grouping starts here.
 */
(function () {
  var PI = Math.PI, TAU = PI * 2;
  var canvas, ctx, W = 0, H = 0, raf = 0, t = 0;
  var green = 0.62;
  var remainder = 0.77;
  var bubble, bubbleX = 0, bubbleY = 0, hideTimer = 0;
  var lastMsg = '';
  var pulse = 0;

  var GROUPS = {
    squirrel: { color: '#3fb950', speaks: 'down', home: 'green-line', attention: false },
    chipmunk: { color: '#5ab87a', speaks: 'up', home: 'log', attention: false },
    human: { color: '#c9d1d9', speaks: 'gaze', home: 'float-off', attention: true }
  };

  /* φ budget: green line lives in the left 1/φ column, scaled down */
  var PHI_INV = 1 / 1.618;
  function cx() { return W * 0.08; }
  function cy() { return H * PHI_INV; }
  function greenLen() { return Math.min(W * 0.09, H * 0.28); }

  /* ═══ SPECTRUM STATE ═══
   * The green line IS the frequency spectrum.
   * Harmonics live along the line: 0D self at origin, higher modes outward.
   * Membrane heartbeat + Anderson localization drive amplitude.
   * beat = heartbeat period from membrane pulse.
   * modes[] = 6 Anderson modes as spectral harmonics.
   */
  var MODES = 6;
  var spectrum = new Float32Array(MODES);
  var beat = { period: 30, phase: 0, energy: 0 };

  function readBeat() {
    var hb;
    if (window._piBus && window._piBus.get) {
      var p = window._piBus.get('/pulse.json');
      if (p && p.heartbeat) hb = p.heartbeat;
    }
    if (hb) {
      beat.period = hb.period || 30;
      beat.energy = hb.energy || 0;
    }
    beat.phase = (t / beat.period) * TAU;
  }

  function computeSpectrum() {
    readBeat();
    var beatAmp = 0.3 + beat.energy * 0.7;
    for (var m = 0; m < MODES; m++) {
      var freq = (m + 1) * PI;
      var anderson = 1 / (1 + m * 0.38);
      var osc = Math.sin(freq * t * 0.15 + beat.phase * (m + 1) * 0.5);
      spectrum[m] = spectrum[m] * 0.88 + (osc * anderson * beatAmp) * 0.12;
    }
    spectrum[0] = spectrum[0] * 0.9 + (Math.sin(beat.phase) * 0.6 + pulse * 0.4) * 0.1;
  }

  function linePoint(frac) {
    var len = greenLen();
    var originX = cx(), originY = cy();
    var spectralDisp = 0;
    for (var m = 0; m < MODES; m++) {
      spectralDisp += spectrum[m] * Math.sin((m + 1) * PI * frac) * (4 / (m + 1));
    }
    return {
      x: originX + spectralDisp * green,
      y: originY - len * frac
    };
  }

  function init() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'green-line';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:7;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    bubble = document.createElement('div');
    bubble.id = 'squirrel-view';
    bubble.style.cssText =
      'position:fixed;z-index:7;pointer-events:none;max-width:220px;' +
      'background:rgba(13,17,23,0.55);border:1px solid rgba(63,185,80,0.28);' +
      'border-left:2px solid rgba(63,185,80,0.7);border-radius:2px 10px 10px 2px;' +
      'padding:6px 10px;color:#8b949e;font:10px "Courier New",monospace;' +
      'line-height:1.4;opacity:0;transition:opacity 0.6s ease;' +
      'transform-origin:left center;';
    document.body.appendChild(bubble);

    resize();
    window.addEventListener('resize', resize);
    loop();
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function loop() {
    t = performance.now() / 1000;
    pulse *= 0.96;
    draw();
    springBubble();
    raf = requestAnimationFrame(loop);
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    computeSpectrum();
    var originX = cx(), originY = cy();
    var len = greenLen();
    var dusk = parseFloat(getComputedStyle(document.body).getPropertyValue('--hud-dusk') || '0') || 0;
    var vis = 0.55 + (1 - dusk) * 0.25;
    var SEGS = 64;

    ctx.save();

    /* ── spectral standing wave ── the line IS the spectrum.
     * each segment = a position along the 0D→∞ frequency axis.
     * displacement = Σ modes, Anderson-localized (inner modes dominate). */
    ctx.shadowColor = '#3fb950';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    for (var seg = 0; seg <= SEGS; seg++) {
      var frac = seg / SEGS;
      var p = linePoint(frac);
      if (seg === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 1.8 + green * 1.4;
    ctx.globalAlpha = vis * (0.35 + green * 0.35);
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* ── harmonic nodes: where standing wave crosses zero ──
     * these are the Anderson separation boundaries.
     * mode m has m+1 nodes along the line. */
    for (var m = 0; m < MODES; m++) {
      var amp = Math.abs(spectrum[m]);
      if (amp < 0.01) continue;
      for (var n = 0; n <= m + 1; n++) {
        var nFrac = n / (m + 2);
        var np = linePoint(nFrac);
        ctx.globalAlpha = vis * 0.15 * amp;
        ctx.strokeStyle = '#3fb950';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(np.x - 3, np.y);
        ctx.lineTo(np.x + 3, np.y);
        ctx.stroke();
      }
    }

    /* ── 0D self-separation origin: the hyperlocal point ──
     * this is where all modes converge. frequency=0. self=here. */
    ctx.globalAlpha = vis * 0.6;
    ctx.fillStyle = '#3fb950';
    ctx.beginPath();
    ctx.arc(originX, originY, 2.5 + beat.energy * 2, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = vis * 0.3;
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(originX, originY, 6 + beat.energy * 4, 0, TAU);
    ctx.stroke();
    ctx.font = '7px monospace';
    ctx.fillStyle = '#3fb950';
    ctx.textAlign = 'center';
    ctx.globalAlpha = vis * 0.4;
    ctx.fillText('0d', originX, originY + 12);

    /* ── down from origin: mirrored spectrum (negative frequencies) ── */
    ctx.beginPath();
    for (var seg = 0; seg <= 24; seg++) {
      var frac = seg / 24;
      var spectralDisp = 0;
      for (var m = 0; m < MODES; m++) {
        spectralDisp -= spectrum[m] * Math.sin((m + 1) * PI * frac) * (3 / (m + 1));
      }
      var py = originY + len * 0.35 * frac;
      var px = originX + spectralDisp * green;
      if (seg === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 1 + green * 0.8;
    ctx.globalAlpha = vis * 0.18;
    ctx.stroke();

    /* ── irreducible remainder tick ── */
    var rem = linePoint(0.40);
    ctx.globalAlpha = vis * 0.45;
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rem.x - 6, rem.y);
    ctx.lineTo(rem.x + 6, rem.y);
    ctx.stroke();
    ctx.font = '8px monospace';
    ctx.fillStyle = '#3fb950';
    ctx.textAlign = 'right';
    ctx.fillText('irreducible', rem.x - 8, rem.y - 2);
    ctx.globalAlpha = vis * 0.22;
    ctx.fillText('r=' + remainder.toFixed(3), rem.x - 8, rem.y + 8);

    /* ── beat indicator at base ── */
    var beatX = originX;
    var beatY = originY + len * 0.38;
    var beatR = 1.5 + Math.abs(Math.sin(beat.phase)) * 3;
    ctx.globalAlpha = vis * (0.15 + beat.energy * 0.35);
    ctx.fillStyle = '#5ab87a';
    ctx.beginPath();
    ctx.arc(beatX, beatY, beatR, 0, TAU);
    ctx.fill();
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.globalAlpha = vis * 0.2;
    ctx.fillText(beat.period.toFixed(0) + 's', beatX, beatY + 10);

    /* ── spectrum sidebar: per-mode amplitude ── */
    for (var m = 0; m < MODES; m++) {
      var mFrac = (m + 0.5) / MODES;
      var mp = linePoint(mFrac);
      var amp = spectrum[m];
      var barW = Math.abs(amp) * 12;
      ctx.globalAlpha = vis * 0.2;
      ctx.fillStyle = amp > 0 ? '#3fb950' : '#5ab87a';
      ctx.fillRect(mp.x + 5, mp.y - 1, barW, 2);
      ctx.font = '6px monospace';
      ctx.fillStyle = '#3fb950';
      ctx.textAlign = 'left';
      ctx.globalAlpha = vis * 0.15;
      ctx.fillText('m' + m, mp.x + 6 + barW, mp.y + 2);
    }

    /* ── squirrel station ── */
    var sq = squirrelPoint();
    ctx.globalAlpha = vis * (0.55 + pulse * 0.4);
    ctx.fillStyle = '#3fb950';
    ctx.beginPath();
    ctx.arc(sq.x, sq.y, 2.8 + pulse * 2, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = vis * 0.3;
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(sq.x, sq.y, 7 + pulse * 5, 0, TAU);
    ctx.stroke();

    /* ── elastic pulse when squirrel speaks ── */
    if (pulse > 0.04) {
      var pf = 0.55 + (1 - pulse) * 0.4;
      var pp = linePoint(Math.min(0.95, pf));
      ctx.globalAlpha = pulse * vis;
      ctx.fillStyle = '#7ee787';
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, 2.2, 0, TAU);
      ctx.fill();
    }

    ctx.restore();

    window._sqDotScreen = { x: sq.x, y: sq.y, wake: 0.4 + pulse, view: 'squirrel' };
  }

  function squirrelPoint() {
    return linePoint(0.55);
  }

  function springBubble() {
    if (!bubble) return;
    var sq = squirrelPoint();
    var tx = sq.x + 16;
    var ty = sq.y - 10;
    bubbleX += (tx - bubbleX) * 0.12;
    bubbleY += (ty - bubbleY) * 0.12;
    var stretch = 1 + Math.sin(t * 1.7) * 0.012 * green;
    bubble.style.left = bubbleX.toFixed(1) + 'px';
    bubble.style.top = bubbleY.toFixed(1) + 'px';
    bubble.style.transform = 'scale(' + stretch.toFixed(4) + ')';
  }

  function saySquirrel(msg, opts) {
    opts = opts || {};
    if (!bubble) init();
    lastMsg = msg;
    pulse = 1;
    var isReact = opts.state === 'react';
    bubble.innerHTML =
      '<div style="color:#3fb950;margin-bottom:3px;font-size:9px">squirrel · own view</div>' +
      '<div style="color:' + (isReact ? '#8b949e' : '#c9d1d9') + ';' +
      (isReact ? 'font-style:italic;' : '') + 'padding-left:4px">' + msg + '</div>';
    bubble.style.opacity = '1';
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { bubble.style.opacity = '0'; }, isReact ? 6000 : 14000);
  }

  function sayChipmunk(msg) {
    try {
      var add = window._chipmunkCore && window._chipmunkCore.addEntry;
      if (add) add('chipmunk', '<span class="dim">' + msg + '</span>');
    } catch (e) {}
  }

  function say(who, msg, opts) {
    if (who === 'squirrel') return saySquirrel(msg, opts);
    if (who === 'chipmunk') return sayChipmunk(msg);
    return sayChipmunk(msg);
  }

  window._hudViews = {
    groups: GROUPS,
    say: say,
    point: squirrelPoint,
    spectrum: function () {
      var modes = [];
      for (var m = 0; m < MODES; m++) modes.push(+spectrum[m].toFixed(4));
      return { modes: modes, beat: { period: beat.period, energy: beat.energy } };
    },
    status: function () {
      return {
        groups: Object.keys(GROUPS),
        squirrel: { home: 'green-line', attention: false, last: lastMsg.slice(0, 80) },
        chipmunk: { home: 'log', attention: false },
        human: { home: 'float-off', attention: true },
        remainder: remainder,
        spectrum: 'live 6-mode Anderson standing wave. 0d self-separation at origin.',
        beat: { period: beat.period, energy: +beat.energy.toFixed(3) },
        note: 'squirrel speaks from the green line. not the watcher. not paying attention.'
      };
    }
  };

  document.addEventListener('squirrel-feed', function (e) {
    var d = e.detail;
    if (!d || !d.msg) return;
    saySquirrel(d.msg, { state: d.state, cmd: d.cmd });
  });

  document.addEventListener('chipmunk-bounce', function (e) {
    var d = e.detail;
    if (!d || !d.msg) return;
    sayChipmunk(d.msg);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
