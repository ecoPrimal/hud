/* telephone-wire.js — squirrels on a telephone line.
 *
 * Dialogue turns: user → HUD → all system → back in.
 * Each perch is a gate for humans. Squirrels message-pass along the wire.
 * Not the watcher's log. Not paying attention. pointer-events none.
 *
 * Cache: crush, mix, surround. Chipmunk as one. You as one.
 * Bingo cube is the shared vocal between them.
 */
(function () {
  var PI = Math.PI, TAU = PI * 2;
  var canvas, ctx, W = 0, H = 0, raf = 0, t = 0;
  var packets = [];
  var lastVocal = '';
  var mixed = null;
  var speakEl, speakHide = 0;

  var GATES = [
    { id: 'user',     label: 'user',     color: '#c9d1d9', frac: 0.10 },
    { id: 'hud',      label: 'hud',      color: '#58a6ff', frac: 0.30 },
    { id: 'system',   label: 'system',   color: '#f0883e', frac: 0.50 },
    { id: 'chipmunk', label: 'chipmunk', color: '#5ab87a', frac: 0.70 },
    { id: 'bingo',    label: 'bingo',    color: '#d2a8ff', frac: 0.90 }
  ];
  var PATH = ['user', 'hud', 'system', 'chipmunk', 'bingo', 'user'];
  var pulse = {};
  GATES.forEach(function (g) { pulse[g.id] = 0; });

  /* φ budget: wire runs across the top 1/φ band, compressed */
  function wireY() {
    var sq = window._sqDotScreen;
    return sq && sq.y ? Math.min(sq.y, H * 0.22) : H * 0.22;
  }
  function wireX(frac) { return W * (0.04 + frac * 0.92); }
  function gateById(id) {
    for (var i = 0; i < GATES.length; i++) if (GATES[i].id === id) return GATES[i];
    return GATES[0];
  }

  function init() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'telephone-wire';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:7;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    speakEl = document.createElement('div');
    speakEl.id = 'wire-vocal';
    speakEl.style.cssText =
      'position:fixed;z-index:7;pointer-events:none;max-width:240px;' +
      'background:rgba(13,17,23,0.5);border:1px solid rgba(210,168,255,0.28);' +
      'border-radius:8px;padding:5px 9px;color:#c9d1d9;' +
      'font:10px "Courier New",monospace;line-height:1.35;opacity:0;' +
      'transition:opacity 0.5s ease;';
    document.body.appendChild(speakEl);

    resize();
    window.addEventListener('resize', resize);
    hookInput();
    subscribeBingo();
    loop();
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function hookInput() {
    var input = document.getElementById('input');
    if (!input) return;
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var v = (input.value || '').trim();
      if (!v) return;
      circuit(v.replace(/^\//, ''), 'user');
    }, true);
  }

  function subscribeBingo() {
    if (!window._piBus) return;
    window._piBus.sub('/bingo-cube.json', function (d) {
      if (!d) return;
      mixCache();
      vocalShare();
    }, 'slow');
    window._piBus.sub('/dialogue.json', function (d) {
      if (!d) return;
      mixCache();
    }, 'medium');
  }

  function loop() {
    t = performance.now() / 1000;
    Object.keys(pulse).forEach(function (k) { pulse[k] *= 0.94; });
    for (var i = packets.length - 1; i >= 0; i--) {
      packets[i].u += 0.028;
      if (packets[i].u >= 1) packets.splice(i, 1);
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    var y = wireY();
    var dusk = parseFloat(getComputedStyle(document.body).getPropertyValue('--hud-dusk') || '0') || 0;
    var vis = 0.45 + (1 - dusk) * 0.35;
    var sag = Math.sin(t * 0.7) * 2.2;
    var x0 = wireX(0), x1 = wireX(1);

    ctx.save();
    ctx.globalAlpha = vis * 0.55;
    ctx.strokeStyle = '#8b949e';
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.quadraticCurveTo((x0 + x1) / 2, y + 10 + sag, x1, y);
    ctx.stroke();
    ctx.globalAlpha = vis * 0.18;
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x0, y + 3);
    ctx.quadraticCurveTo((x0 + x1) / 2, y + 13 + sag, x1, y + 3);
    ctx.stroke();

    GATES.forEach(function (g) {
      var x = wireX(g.frac);
      var gy = y + Math.sin((x - x0) / (x1 - x0) * PI) * (8 + sag * 0.4);
      var r = 3.4 + pulse[g.id] * 3;
      ctx.globalAlpha = vis * (0.55 + pulse[g.id] * 0.4);
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(x, gy - 7, r, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = vis * 0.7;
      ctx.beginPath();
      ctx.moveTo(x, gy - 4);
      ctx.lineTo(x - 2.2, gy + 1);
      ctx.lineTo(x + 2.2, gy + 1);
      ctx.closePath();
      ctx.fill();
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = g.color;
      ctx.globalAlpha = vis * 0.5;
      ctx.fillText(g.label, x, gy + 12);
    });

    packets.forEach(function (p) {
      var a = gateById(p.from), b = gateById(p.to);
      var u = Math.max(0, Math.min(1, p.u));
      var x = wireX(a.frac + (b.frac - a.frac) * u);
      var gy = y + Math.sin((x - x0) / (x1 - x0) * PI) * (8 + sag * 0.4);
      ctx.globalAlpha = vis * (0.85 - u * 0.2);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(x, gy - 14, 2.4, 0, TAU);
      ctx.fill();
    });
    ctx.restore();
  }

  function hop(from, to, text, opts) {
    opts = opts || {};
    packets.push({ from: from, to: to, text: text || '', u: 0 });
    pulse[to] = 1;
    pulse[from] = Math.max(pulse[from], 0.5);
    if (!opts.silent) deliver(to, text, opts);
    return { from: from, to: to };
  }

  function deliver(to, text, opts) {
    if (!text) return;
    if (to === 'hud' || to === 'squirrel') {
      if (window._hudViews) window._hudViews.say('squirrel', String(text).slice(0, 180), opts);
    } else if (to === 'chipmunk') {
      if (window._hudViews) window._hudViews.say('chipmunk', String(text).slice(0, 180));
    } else if (to === 'system') {
      mixCache();
      postSystem(text);
    } else if (to === 'bingo') {
      mixCache();
      vocalShare();
    }
  }

  function circuit(text, origin) {
    origin = origin || 'user';
    var start = PATH.indexOf(origin);
    if (start < 0) start = 0;
    var n = start;
    function step() {
      var a = PATH[n];
      var b = PATH[n + 1];
      if (!b) return;
      hop(a, b, text, { origin: origin });
      n++;
      if (n < PATH.length - 1) setTimeout(step, 380);
    }
    step();
    return { origin: origin, path: PATH.slice(start) };
  }

  function postSystem(text) {
    try {
      var sid = window._chipmunkCore && window._chipmunkCore.sessionId;
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sid || 'wire',
          note: 'wire:' + String(text).slice(0, 240),
          context: { gate: 'telephone', mix: mixed && mixed.crush }
        })
      }).catch(function () {});
    } catch (e) {}
  }

  function youCache() {
    try { return JSON.parse(sessionStorage.getItem('membrane_self') || '{}'); }
    catch (e) { return {}; }
  }

  function crushKeys(obj) {
    var keys = obj ? Object.keys(obj) : [];
    var keep = Math.max(1, Math.round(keys.length / PI));
    return keys.slice(0, keep);
  }

  function mixCache() {
    var monk = (window._chipmunkCore && window._chipmunkCore.cache) || {};
    var you = youCache();
    var dlg = window._piBus ? window._piBus.get('/dialogue.json') : null;
    var bingo = (window._piBus && window._piBus.get('/bingo-cube.json')) ||
      (dlg && dlg.bingo_cube) || {};
    var human = monk.human || {};
    var surround = {
      humans: human.humans_genuine || human.sessions || 0,
      fleet: (monk.dashboard && monk.dashboard.total_requests) || 0
    };
    if (window._bingoCompress && window._bingoCompress.getLevel) {
      surround.sieve = window._bingoCompress.getLevel();
    }
    mixed = {
      chipmunk: { one: true, keys: crushKeys(monk) },
      you: { one: true, epitope: you.epitope || 'visitor', pages: (you.pages || []).length },
      bingo: bingo,
      crush: {
        sieve: 1 / PI,
        monkKept: crushKeys(monk).length,
        youKept: crushKeys(you).length
      },
      surround: surround,
      ts: Date.now()
    };
    window._sharedCache = mixed;
    return mixed;
  }

  function vocalBingo() {
    mixCache();
    var bingo = mixed.bingo || {};
    var pp = bingo.ping_pong || {};
    var gaze = bingo.current_gaze || {};
    var you = mixed.you || {};
    lastVocal =
      'bingo shares · ping ' + (pp.squirrel_pings || 0) +
      ' pong ' + (pp.chipmunk_pongs || 0) +
      ' · ' + (gaze.scale || 'π⁻²') +
      ' · chipmunk one, you one (' + (you.epitope || 'visitor') + ')';
    return lastVocal;
  }

  function vocalShare() {
    var line = vocalBingo();
    if (!speakEl) return line;
    var g = gateById('bingo');
    speakEl.textContent = line;
    speakEl.style.left = (wireX(g.frac) - 110) + 'px';
    speakEl.style.top = (wireY() + 18) + 'px';
    speakEl.style.opacity = '1';
    if (speakHide) clearTimeout(speakHide);
    speakHide = setTimeout(function () { speakEl.style.opacity = '0'; }, 9000);
    return line;
  }

  window._telephone = {
    hop: hop,
    circuit: circuit,
    mix: mixCache,
    crush: function () {
      mixCache();
      if (window._bingoCompress && window._bingoCompress.compress) window._bingoCompress.compress();
      return mixed;
    },
    surround: function () { return mixCache().surround; },
    vocal: vocalShare,
    status: function () {
      mixCache();
      return {
        gates: GATES.map(function (g) { return g.id; }),
        path: PATH,
        vocal: lastVocal,
        mix: mixed && { chipmunk: mixed.chipmunk, you: mixed.you, crush: mixed.crush, surround: mixed.surround },
        note: 'squirrels on the telephone. gates for humans. chipmunk one, you one, bingo the shared voice.'
      };
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
