// complexity-scale.js v1 — decompose and compress from 0 to 1000
// too small (bit) → too big (universe). scan, sweep, sort at every scale.
// the bingo cube compresses: Attention × Curiosity × Interaction
// everything maps to the 0-1000 axis. decompose left, compress right.
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══ THE COMPLEXITY SCALE — 0 to 1000 ═══
  // Each level: position on scale, name, what lives there, decompose/compress ratio
  var SCALE = [
    { pos: 0,    name: 'bit',           count: 1,         color: '#ffffff',
      desc: '0 or 1. the quantum of information. indivisible.',
      contains: 'one binary choice', decomposes: 'nothing smaller', compresses: '1:1' },
    { pos: 1,    name: 'byte',          count: 8,         color: '#c9d1d9',
      desc: '8 bits. 256 states. one character. one pixel channel.',
      contains: '8 bits', decomposes: '→ 8 bits', compresses: '8:1 → bit' },
    { pos: 10,   name: 'word',          count: 64,        color: '#79c0ff',
      desc: '64 bits. one number. one pointer. one instruction.',
      contains: '8 bytes', decomposes: '→ 8 bytes → 64 bits', compresses: '64:1 → bit' },
    { pos: 25,   name: 'packet',        count: 1500,      color: '#58a6ff',
      desc: '~1500 bytes. one network packet. MTU. the unit of internet.',
      contains: '1500 bytes = 12000 bits', decomposes: '→ bytes → bits', compresses: '12000:1 → bit' },
    { pos: 50,   name: 'signal',        count: 46,        color: '#5ab87a',
      desc: '46 browser input types. one signal from the input wall.',
      contains: '46 input channels × weight', decomposes: '→ A×C×I per channel', compresses: 'bingo cube' },
    { pos: 75,   name: 'epitope',       count: 43,        color: '#3fb950',
      desc: '43 human sessions. 6 epitope types. the pore shapes.',
      contains: 'coder(21) investigator(9) visitor(7) observer(4) explorer(1) reader(1)',
      decomposes: '→ session → page views → clicks', compresses: '43:6 types' },
    { pos: 100,  name: 'entity',        count: 341,       color: '#f0883e',
      desc: '341 detroit investigation entities. the graph nodes.',
      contains: 'self(120) partial(114) null(100) non-self(7)',
      decomposes: '→ sort class → edges → attributes', compresses: '341:4 classes' },
    { pos: 150,  name: 'cluster',       count: 14,        color: '#d29922',
      desc: '14 bingo clusters. 342→14 at 24.4:1 compression.',
      contains: '~24 entities per cluster', decomposes: '→ entities → edges → attributes',
      compresses: '342:14 = 24.4:1' },
    { pos: 200,  name: 'edge',          count: 131329,    color: '#d2a8ff',
      desc: '131,329 edges. the connections. 10 types.',
      contains: 'cross_ref(26873) structural(15529) halo(10976) triadic(7590)…',
      decomposes: '→ edge type → source/target → weight', compresses: '131329:10 types' },
    { pos: 250,  name: 'node',          count: 7554,      color: '#a371f7',
      desc: '7,554 graph nodes. the full investigation web.',
      contains: 'entities + connections + attributes', decomposes: '→ entity → edges → attributes',
      compresses: '7554:341 entities' },
    { pos: 300,  name: 'method',        count: 36,        color: '#e85d3a',
      desc: '36 classification methods. cascade, phase, governance, court…',
      contains: 'cascade_self(53) phase5(34) phase3(26) cascade_null(21)…',
      decomposes: '→ method → entity → confidence', compresses: '36 methods → 4 classes' },
    { pos: 400,  name: 'traffic',       count: 256142,    color: '#8b949e',
      desc: '256,142 membrane traffic events. the river.',
      contains: 'chorus(243089) human(6629) ghost(3138) sovereign(2533) spectrum(747) stealth(6)',
      decomposes: '→ anderson mode → source → pattern', compresses: '256142:6 modes' },
    { pos: 500,  name: 'membrane',      count: 1,         color: '#58a6ff',
      desc: 'the membrane itself. opacity 92%. selectivity 97%. one system.',
      contains: 'entities + traffic + humans + fleet + braids',
      decomposes: '→ traffic + entities + humans + braids + fleet',
      compresses: '256,477 → 1 membrane state' },
    { pos: 600,  name: 'shifter',       count: 2874,      color: '#f0883e',
      desc: '2,874 shifters. crossing category boundaries. the hard ones.',
      contains: 'entities that resist classification',
      decomposes: '→ classifications attempted → confidence scores', compresses: '2874:? (unsorted)' },
    { pos: 700,  name: 'braid',         count: 5,         color: '#d2a8ff',
      desc: '5 braid routes. the holes in the membrane. passage paths.',
      contains: '24 humans flowing through 5 routes',
      decomposes: '→ route → visitors → entry/exit epitope', compresses: '24:5 routes' },
    { pos: 800,  name: 'orbit',         count: 6,         color: '#3fb950',
      desc: '6 visitor orbits. the paths humans take between sites.',
      contains: 'git→lansing(4813) git→sporeprint(3979) lansing→sporeprint(2161)…',
      decomposes: '→ site pair → visitors → dwell', compresses: '19344:6 paths' },
    { pos: 900,  name: 'fossil',        count: 21,        color: '#d29922',
      desc: '21 fossilized observations. from 7 perspectives.',
      contains: 'on(2) inside(3) above(3) below(2) beside(3) before(2) through(6)',
      decomposes: '→ perspective → observation → data', compresses: 'all data → 21 fossils' },
    { pos: 1000, name: 'everything',    count: 256477,    color: '#ffffff',
      desc: '256,477 total entities. the whole system. one number.',
      contains: 'all of the above',
      decomposes: '→ membrane + detroit + human + fleet', compresses: '256477:1' },
  ];

  // ═══ COMPRESSION RATIOS — how each level maps ═══
  var COMPRESSIONS = [
    { from: 'everything', to: 'membrane',  ratio: '256477:1',   method: 'system boundary' },
    { from: 'traffic',    to: 'modes',      ratio: '256142:6',   method: 'anderson sort' },
    { from: 'entity',     to: 'classes',    ratio: '341:4',      method: 'cascade classify' },
    { from: 'entity',     to: 'clusters',   ratio: '342:14',     method: 'bingo sieve (24.4:1)' },
    { from: 'edge',       to: 'types',      ratio: '131329:10',  method: 'edge classification' },
    { from: 'node',       to: 'entity',     ratio: '7554:341',   method: 'node→entity collapse' },
    { from: 'epitope',    to: 'types',      ratio: '43:6',       method: 'human sort' },
    { from: 'signal',     to: 'cube',       ratio: '46:3',       method: 'bingo cube A×C×I' },
    { from: 'orbit',      to: 'paths',      ratio: '19344:6',    method: 'path aggregation' },
    { from: 'shifter',    to: '?',          ratio: '2874:?',     method: 'unresolved — needs human' },
  ];

  var _canvas, _ctx, _active = false, _t = 0, _lastFrame = 0;
  var _scaleIdx = 0, _autoPlay = true, _autoTimer = 0, _zoomT = 0;
  var _soundDecay = 0, _audioCtx = null, _currentOsc = null;
  var _onDeactivate = null;
  var _touchStartX = 0;
  var _particles = [];

  // ═══ SOUND ═══
  function initAudio() {
    if (_audioCtx) return;
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }

  function playScaleTone(pos) {
    if (!_audioCtx) return;
    try {
      if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.03); } catch(e){} _currentOsc = null; }
      var freq = 110 * Math.pow(2, pos / 300); // low→high across the scale
      freq = Math.max(40, Math.min(freq, 4000));
      var osc = _audioCtx.createOscillator();
      var gain = _audioCtx.createGain();
      osc.connect(gain); gain.connect(_audioCtx.destination);
      osc.type = pos < 100 ? 'square' : pos < 500 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.05, _audioCtx.currentTime + 0.06);
      gain.gain.setTargetAtTime(0, _audioCtx.currentTime + 1.0, 0.3);
      osc.start(); osc.stop(_audioCtx.currentTime + 2);
      _currentOsc = { o: osc, g: gain };
      _soundDecay = 1;
    } catch(e) {}
  }

  // ═══ CANVAS ═══
  function createCanvas() {
    if (_canvas) return;
    _canvas = document.createElement('canvas');
    _canvas.id = 'complexity-scale-canvas';
    _canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:45;background:#020408;cursor:pointer;';
    _canvas.width = window.innerWidth; _canvas.height = window.innerHeight;
    document.body.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');
    _canvas.addEventListener('click', function(e) {
      if (e.pointerType === 'touch') return;
      if (e.clientX < 45 && e.clientY < 40) { deactivate(); return; }
      _autoPlay = false; advance();
    });
    _canvas.addEventListener('wheel', function(e) {
      e.preventDefault(); _autoPlay = false;
      if (e.deltaY > 0) advance(); else retreat();
    }, { passive: false });
    _canvas.addEventListener('touchstart', function(e) {
      if (_active && e.touches.length) _touchStartX = e.touches[0].clientX;
    }, { passive: true });
    _canvas.addEventListener('touchend', function(e) {
      if (!_active) return;
      var ch = e.changedTouches && e.changedTouches[0];
      if (!ch) { _autoPlay = false; advance(); return; }
      var dx = ch.clientX - _touchStartX;
      if (Math.abs(dx) < 20) { _autoPlay = false; advance(); }
      else if (Math.abs(dx) > 40) { _autoPlay = false; dx > 0 ? advance() : retreat(); }
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', function() { if (_canvas) { _canvas.width = window.innerWidth; _canvas.height = window.innerHeight; } });
  }

  function onKey(e) {
    if (!_active) return;
    if (e.key === 'Escape') { deactivate(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); _autoPlay = false; advance(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); _autoPlay = false; retreat(); }
  }

  function advance() {
    initAudio(); _zoomT = 0;
    if (_scaleIdx < SCALE.length - 1) { _scaleIdx++; _autoTimer = 0; playScaleTone(SCALE[_scaleIdx].pos); }
    else deactivate();
  }

  function retreat() {
    _autoPlay = false;
    if (_scaleIdx > 0) { _scaleIdx--; _zoomT = 0; }
  }

  // ═══ RENDER ═══
  function render(ts) {
    if (!_active) return;
    var dt = Math.min(ts - _lastFrame, 50);
    _lastFrame = ts; _t += dt * 0.001;

    var W = _canvas.width, H = _canvas.height;
    var cx = W / 2, cy = H / 2;
    var ctx = _ctx;
    var mobile = W < 600;
    var ts2 = mobile ? 0.7 : 1;

    _zoomT = Math.min(1, _zoomT + dt * 0.001 * 1.5);
    var ease = _zoomT < 1 ? 1 - Math.pow(1 - _zoomT, 3) : 1;

    if (_autoPlay) { _autoTimer += dt * 0.001; if (_autoTimer > 3.5) advance(); }

    // Background
    ctx.globalAlpha = 1; ctx.fillStyle = '#020408'; ctx.fillRect(0, 0, W, H);

    var sc = SCALE[_scaleIdx];

    // ═══ SCALE BAR — horizontal 0 to 1000 ═══
    var barW = W * 0.8;
    var barX = (W - barW) / 2;
    var barY = cy + 10;
    var barH = 4;

    // Bar background
    ctx.globalAlpha = 0.1; ctx.fillStyle = '#21262d';
    ctx.fillRect(barX, barY, barW, barH);

    // Fill to current position
    var pct = sc.pos / 1000;
    ctx.globalAlpha = 0.5; ctx.fillStyle = sc.color;
    ctx.fillRect(barX, barY, barW * pct, barH);

    // All scale points as dots
    SCALE.forEach(function(s, si) {
      var x = barX + (s.pos / 1000) * barW;
      var isCurr = si === _scaleIdx;
      var r = isCurr ? 6 + Math.sin(_t * 3) * 1 : 2;
      ctx.beginPath(); ctx.arc(x, barY + barH / 2, r, 0, TAU);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = isCurr ? 0.9 : (si < _scaleIdx ? 0.3 : 0.08);
      ctx.fill();
      if (isCurr) {
        ctx.beginPath(); ctx.arc(x, barY + barH / 2, r + 4, 0, TAU);
        ctx.strokeStyle = s.color; ctx.globalAlpha = 0.2; ctx.lineWidth = 1; ctx.stroke();
      }
    });

    // Labels on bar
    ctx.globalAlpha = 0.2; ctx.font = '7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#484f58';
    ctx.fillText('0', barX, barY - 6);
    ctx.fillText('1000', barX + barW, barY - 6);
    ctx.fillText('← decompose', barX + 40, barY + 18);
    ctx.textAlign = 'right';
    ctx.fillText('compress →', barX + barW - 10, barY + 18);

    // ═══ CURRENT SCALE ITEM ═══
    var curX = barX + pct * barW;

    // Position label
    ctx.globalAlpha = 0.4; ctx.font = Math.round(12 * ts2) + 'px monospace';
    ctx.textAlign = 'center'; ctx.fillStyle = sc.color;
    ctx.fillText(sc.pos, curX, barY - 10);

    // Title
    ctx.globalAlpha = ease;
    ctx.font = 'bold ' + Math.round(34 * ts2) + 'px monospace';
    ctx.fillStyle = sc.color; ctx.textAlign = 'center';
    ctx.fillText(sc.name, cx, mobile ? 45 : 60);

    // Count
    ctx.font = 'bold ' + Math.round(22 * ts2) + 'px monospace';
    ctx.fillStyle = '#c9d1d9';
    ctx.fillText(sc.count.toLocaleString(), cx, mobile ? 68 : 88);

    // Description
    ctx.font = Math.round(11 * ts2) + 'px monospace';
    ctx.fillStyle = '#6e7681';
    ctx.fillText(sc.desc, cx, mobile ? 85 : 108);

    // ═══ DECOMPOSE / COMPRESS BOX ═══
    var boxY = cy - 80;
    var boxW = Math.min(W * 0.7, 500);
    var boxX = (W - boxW) / 2;

    // Contains
    ctx.globalAlpha = 0.6 * ease;
    ctx.font = Math.round(9 * ts2) + 'px monospace';
    ctx.textAlign = 'left'; ctx.fillStyle = '#8b949e';
    ctx.fillText('contains:', boxX, boxY);
    ctx.fillStyle = '#c9d1d9';
    var containsText = sc.contains.length > 70 && mobile ? sc.contains.substring(0, 60) + '…' : sc.contains;
    ctx.fillText(containsText, boxX + 55, boxY);

    // Decomposes
    ctx.fillStyle = '#58a6ff'; ctx.globalAlpha = 0.5 * ease;
    ctx.fillText('decompose:', boxX, boxY + 16);
    ctx.fillStyle = '#79c0ff';
    ctx.fillText(sc.decomposes, boxX + 65, boxY + 16);

    // Compresses
    ctx.fillStyle = '#d2a8ff'; ctx.globalAlpha = 0.5 * ease;
    ctx.fillText('compress:', boxX, boxY + 32);
    ctx.fillStyle = '#a371f7';
    ctx.fillText(sc.compresses, boxX + 60, boxY + 32);

    // ═══ SIZE VISUALIZATION — concentric rings proportional to count ═══
    var vizR = Math.min(W, H) * 0.08;
    var vizCx = cx;
    var vizCy = boxY - 50;

    // Ring size proportional to log of count
    var logCount = sc.count > 0 ? Math.log10(sc.count + 1) : 0;
    var maxLog = Math.log10(260000);
    var ringR = vizR * (0.2 + (logCount / maxLog) * 0.8) * ease;

    // Ring
    ctx.beginPath(); ctx.arc(vizCx, vizCy, ringR, 0, TAU);
    ctx.strokeStyle = sc.color; ctx.globalAlpha = 0.4 * ease; ctx.lineWidth = 2; ctx.stroke();

    // Fill glow
    var grd = ctx.createRadialGradient(vizCx, vizCy, ringR * 0.2, vizCx, vizCy, ringR * 1.3);
    grd.addColorStop(0, sc.color + '15');
    grd.addColorStop(1, sc.color + '00');
    ctx.globalAlpha = ease; ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(vizCx, vizCy, ringR * 1.3, 0, TAU); ctx.fill();

    // Count inside
    ctx.globalAlpha = 0.5 * ease;
    ctx.font = Math.round(14 * ts2) + 'px monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = sc.color;
    ctx.fillText(sc.count > 99999 ? (sc.count / 1000).toFixed(0) + 'K' : sc.count.toString(), vizCx, vizCy + 5);

    // ═══ COMPRESSION ARROWS — show what compresses to what ═══
    var compY = barY + 35;
    var relevantComps = COMPRESSIONS.filter(function(c) {
      return c.from === sc.name || c.to === sc.name;
    });
    if (relevantComps.length > 0) {
      ctx.globalAlpha = 0.3; ctx.font = Math.round(8 * ts2) + 'px monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = '#484f58';
      ctx.fillText('compression:', cx, compY);
      relevantComps.forEach(function(c, ci) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#c9d1d9';
        ctx.fillText(c.from + ' → ' + c.to + ' (' + c.ratio + ') via ' + c.method, cx, compY + 14 + ci * 13);
      });
    }

    // ═══ DECOMPOSE/COMPRESS PARTICLES ═══
    // Spawn particles representing decomposition (small→big) or compression (big→small)
    if (_zoomT < 0.5 && _particles.length < 40) {
      var count = Math.min(Math.ceil(Math.log10(sc.count + 2)), 8);
      for (var pi = 0; pi < count; pi++) {
        var angle = Math.random() * TAU;
        var dist = ringR * (0.5 + Math.random());
        _particles.push({
          x: vizCx + Math.cos(angle) * dist,
          y: vizCy + Math.sin(angle) * dist,
          vx: Math.cos(angle) * (30 + Math.random() * 30),
          vy: Math.sin(angle) * (30 + Math.random() * 30),
          life: 1,
          decay: 0.008 + Math.random() * 0.012,
          size: 1 + Math.random() * 2.5,
          color: sc.color,
        });
      }
    }
    // Update and draw particles
    for (var pi2 = _particles.length - 1; pi2 >= 0; pi2--) {
      var p = _particles[pi2];
      p.x += p.vx * dt * 0.001;
      p.y += p.vy * dt * 0.001;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.life -= p.decay;
      if (p.life <= 0) { _particles.splice(pi2, 1); continue; }
      ctx.globalAlpha = p.life * 0.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, TAU);
      ctx.fill();
    }

    // ═══ SIEVE THRESHOLDS — 4 horizontal lines on the scale bar ═══
    var sieveThresholds = [
      { pos: 1.0,   label: 'full',  color: '#3fb950' },
      { pos: 0.5,   label: 'half',  color: '#d29922' },
      { pos: 0.318, label: '1/π',   color: '#58a6ff' },
      { pos: 0.1,   label: 'tight', color: '#e85d3a' },
    ];
    sieveThresholds.forEach(function(st) {
      var sx = barX + st.pos * barW;
      ctx.globalAlpha = 0.12; ctx.strokeStyle = st.color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, barY - 3); ctx.lineTo(sx, barY + barH + 3); ctx.stroke();
      ctx.globalAlpha = 0.15; ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = st.color;
      ctx.fillText(st.label, sx, barY + barH + 12);
    });

    // ═══ BOTTOM — autoplay / controls ═══
    if (_autoPlay && _scaleIdx < SCALE.length - 1) {
      ctx.globalAlpha = 0.2 + Math.sin(_t * 2) * 0.08;
      ctx.font = Math.round(9 * ts2) + 'px monospace'; ctx.fillStyle = '#484f58'; ctx.textAlign = 'center';
      ctx.fillText(mobile ? 'auto · tap to control' : 'auto · click/scroll/→ to control', cx, H - 30);
    }

    // Close button
    ctx.globalAlpha = 0.2; ctx.font = '16px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#8b949e';
    ctx.fillText('✕', 14, 24);
    ctx.globalAlpha = 0.15; ctx.font = '8px monospace';
    ctx.fillText('complexity ' + sc.pos + '/1000', 36, 22);

    // Controls
    ctx.globalAlpha = 1; ctx.font = Math.round(9 * ts2) + 'px monospace';
    ctx.fillStyle = '#30363d'; ctx.textAlign = 'center';
    ctx.fillText(mobile ? 'tap/swipe · scroll' : 'click · scroll · → advance · ← back · ESC close', cx, H - 14);

    // Sound indicator
    if (_soundDecay > 0.01) {
      _soundDecay *= 0.96;
      ctx.save(); ctx.globalAlpha = _soundDecay * 0.4;
      ctx.strokeStyle = sc.color; ctx.lineWidth = 1.5; ctx.beginPath();
      for (var wi = 0; wi < 20; wi++) {
        var wx = W - 50 + wi * 2, wy = 25 + Math.sin(wi * 0.7 + _t * 6) * 5 * _soundDecay;
        wi === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
      }
      ctx.stroke(); ctx.restore();
    }

    requestAnimationFrame(render);
  }

  // ═══ LIFECYCLE ═══
  function activate(addEntry, onDone) {
    if (_active) { deactivate(); return false; }
    _onDeactivate = onDone || null;
    createCanvas(); _active = true;
    _scaleIdx = 0; _autoPlay = true; _autoTimer = 0; _t = 0; _zoomT = 0;
    _lastFrame = performance.now();
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
    requestAnimationFrame(render);
    return true;
  }

  function deactivate() {
    _active = false;
    if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.02); } catch(e){} _currentOsc = null; }
    if (_canvas) { _canvas.remove(); _canvas = null; _ctx = null; }
    window.removeEventListener('keydown', onKey);
    var journey = {
      scaleIdx: _scaleIdx,
      scaleName: SCALE[Math.min(_scaleIdx, SCALE.length-1)].name,
      scalePos: SCALE[Math.min(_scaleIdx, SCALE.length-1)].pos,
      completed: _scaleIdx >= SCALE.length - 1,
    };
    if (_onDeactivate) { try { _onDeactivate(journey); } catch(e) {} }
  }

  window._complexityScale = {
    activate: activate,
    deactivate: deactivate,
    isActive: function() { return _active; },
    currentScale: function() {
      if (!_active) return null;
      var s = SCALE[Math.min(_scaleIdx, SCALE.length-1)];
      return { name: s.name, pos: s.pos, color: s.color };
    },
    SCALE: SCALE,
    COMPRESSIONS: COMPRESSIONS,
  };
})();
