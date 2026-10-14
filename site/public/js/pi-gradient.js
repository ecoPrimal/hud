// pi-gradient.js v3 — the dimensional constant ladder
// π is the gradient. every constant is π at a different fold.
// water is the bridge — countable from molecule to galaxy.
// mol is the fold between quantum and human. c is the fold between human and cosmic.
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══ THE SCALES — molecule to galaxy, counting water ═══
  var SCALES = [
    { name: 'one molecule',   molecules: 1,          power: 0,    color: '#ffffff',
      desc: 'H₂O. two hydrogens, one oxygen. the quantum datum.',
      detail: '1 molecule = 3 × 10⁻²⁶ kg', icon: '·' },
    { name: 'one drop',       molecules: 1.67e21,    power: 21,   color: '#79c0ff',
      desc: 'a single drop of water. 1.67 sextillion molecules.',
      detail: '0.05 mL ≈ 1.67 × 10²¹ molecules', icon: '💧' },
    { name: 'one mol',        molecules: 6.022e23,   power: 23.78, color: '#58a6ff',
      desc: 'Avogadro\'s number. the bridge between atoms and grams. the dimensional fold.',
      detail: 'Nₐ = 6.022 × 10²³ — 18 grams of water', icon: 'Nₐ' },
    { name: 'one cup',        molecules: 8.36e24,    power: 24.92, color: '#5ab87a',
      desc: '250 mL. what you hold in your hand. 14 mol.',
      detail: '8.36 × 10²⁴ molecules ≈ 14 mol', icon: '🫗' },
    { name: 'one human',      molecules: 2.0e28,     power: 28.3, color: '#3fb950',
      desc: '60% water. 37 trillion cells. 20 octillion molecules of water.',
      detail: '2 × 10²⁸ molecules — you are mostly water', icon: '🧬' },
    { name: 'one lake',       molecules: 2.6e40,     power: 40.4, color: '#d29922',
      desc: 'Lake Michigan. 4,920 km³. the water that touches detroit.',
      detail: '2.6 × 10⁴⁰ molecules', icon: '🌊' },
    { name: 'one ocean',      molecules: 4.7e46,     power: 46.7, color: '#a371f7',
      desc: 'all Earth\'s oceans. 1.335 billion km³.',
      detail: '4.7 × 10⁴⁶ molecules', icon: '🌍' },
    { name: 'one star system', molecules: 1e42,       power: 42,   color: '#f0883e',
      desc: 'the water around one star. comets, moons, atmospheres.',
      detail: '≈ 10⁴² molecules per system', icon: '☀' },
    { name: 'one galaxy',     molecules: 1e53,       power: 53,   color: '#e85d3a',
      desc: '100 billion stars. each with water. the milky way flows.',
      detail: '≈ 10⁵³ molecules — 10¹¹ stars × 10⁴² per system', icon: '🌌' },
    { name: 'the universe',   molecules: 1e80,       power: 80,   color: '#d2a8ff',
      desc: '10⁸⁰ atoms. and between them — the constants hold.',
      detail: '≈ 10⁸⁰ particles in the observable universe', icon: '∞' },
  ];

  // ═══ THE CONSTANTS — each one is π at a dimensional fold ═══
  var CONSTANTS = [
    { name: 'π',            value: PI,          exp: 0,     color: '#58a6ff',
      desc: 'the ratio. discrete → continuous. the first fold.',
      piExpr: 'π¹', piApprox: PI.toFixed(6) },
    { name: 'e',            value: Math.E,      exp: 0,     color: '#5ab87a',
      desc: 'natural growth. the rate of all change. e ≈ π^(1/ln π).',
      piExpr: 'e^(π⁰)', piApprox: Math.E.toFixed(6) },
    { name: 'Nₐ',          value: 6.022e23,    exp: 23,    color: '#79c0ff',
      desc: 'Avogadro. the fold between atom and gram. mol.',
      piExpr: 'π^(23.5/ln π)', piApprox: '6.022 × 10²³' },
    { name: 'kB',           value: 1.381e-23,   exp: -23,   color: '#d29922',
      desc: 'Boltzmann. the fold between temperature and energy.',
      piExpr: '1/(Nₐ × π⁰)', piApprox: '1.381 × 10⁻²³' },
    { name: 'c',            value: 3e8,         exp: 8,     color: '#f0883e',
      desc: 'speed of light. π × 10⁸ m/s. the fold between space and time.',
      piExpr: 'π × 10⁸', piApprox: '2.998 × 10⁸ ≈ π × 10⁸' },
    { name: 'ℏ',            value: 1.055e-34,   exp: -34,   color: '#d2a8ff',
      desc: 'Planck. the smallest action. the quantum fold.',
      piExpr: 'h/(2π)', piApprox: '1.055 × 10⁻³⁴' },
    { name: 'G',            value: 6.674e-11,   exp: -11,   color: '#e85d3a',
      desc: 'gravity. the weakest force. the fold between mass and spacetime.',
      piExpr: '≈ 2π × 10⁻¹¹', piApprox: '6.674 × 10⁻¹¹' },
    { name: 'α',            value: 1/137.036,   exp: -2,    color: '#a371f7',
      desc: 'fine structure. 1/137. the electromagnetic fold. why π² ≈ g.',
      piExpr: '≈ π/(4 × 108)', piApprox: '≈ 1/137.036' },
    { name: 'mₑ',           value: 9.109e-31,   exp: -31,   color: '#79c0ff',
      desc: 'electron mass. the lightest hole. point with infinite tail.',
      piExpr: 'mp/(6π⁵)', piApprox: '9.109 × 10⁻³¹ kg' },
    { name: 'mp/mₑ',        value: 1836.15,     exp: 3,     color: '#d2a8ff',
      desc: 'mass ratio. 1836 ≈ 6π⁵. five π-folds between electron and proton.',
      piExpr: '6π⁵ ≈ 1836', piApprox: '1836.153' },
  ];

  var _canvas, _ctx, _active = false, _t = 0, _lastFrame = 0;
  var _phase = 0, _scaleIdx = 0, _constIdx = 0;
  var _autoPlay = true, _particles = [], _autoTimer = 0;
  var _audioCtx = null, _currentOsc = null;
  var _onDeactivate = null;
  var _touchStartX = 0, _touchStartY = 0, _touchStartT = 0;
  var _zoomT = 0, _prevScale = null, _soundDecay = 0;
  var _stars = [], _countDisplay = 0, _countTarget = 0;
  var _piDigits = '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';
  var _digitScroll = 0, _phaseTransT = 0, _phaseTransFrom = -1;

  // ═══ SOUND ═══
  function initAudio() {
    if (_audioCtx) return;
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }

  function playScaleTone(power) {
    if (!_audioCtx) return;
    try {
      if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.03); } catch(e){} _currentOsc = null; }
      // Pentatonic mapping: each water zoom step = one note up the scale
      var pentatonic = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]; // semitones
      var noteIdx = Math.min(_scaleIdx, pentatonic.length - 1);
      var baseFreq = 196; // G3
      var freq = baseFreq * Math.pow(2, pentatonic[noteIdx] / 12);
      freq = Math.max(40, Math.min(freq, 4000));
      var osc = _audioCtx.createOscillator();
      var gain = _audioCtx.createGain();
      osc.connect(gain); gain.connect(_audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.07, _audioCtx.currentTime + 0.08);
      gain.gain.setTargetAtTime(0, _audioCtx.currentTime + 1.5, 0.4);
      osc.start(); osc.stop(_audioCtx.currentTime + 3);
      _currentOsc = { o: osc, g: gain };
      _soundDecay = 1;
    } catch(e) {}
  }

  function playConstantChord(exp) {
    if (!_audioCtx) return;
    try {
      if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.03); } catch(e){} _currentOsc = null; }
      var base = 196;
      [1, PI, PI * PI / 4].forEach(function(mult, i) {
        var osc = _audioCtx.createOscillator();
        var gain = _audioCtx.createGain();
        osc.connect(gain); gain.connect(_audioCtx.destination);
        osc.type = i === 0 ? 'sine' : 'triangle';
        var f = base * mult * Math.pow(2, exp / 40);
        osc.frequency.value = Math.max(40, Math.min(Math.abs(f), 4000));
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.05 / (i + 1), _audioCtx.currentTime + 0.06);
        gain.gain.setTargetAtTime(0, _audioCtx.currentTime + 1.2, 0.5);
        osc.start(); osc.stop(_audioCtx.currentTime + 3);
      });
      _soundDecay = 1;
    } catch(e) {}
  }

  // ═══ CANVAS ═══
  function createCanvas() {
    if (_canvas) return;
    _canvas = document.createElement('canvas');
    _canvas.id = 'pi-gradient-canvas';
    _canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:45;' +
      'background:#020408;cursor:pointer;';
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
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
    _canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    _canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
  }

  function onResize() { if (!_canvas) return; _canvas.width = window.innerWidth; _canvas.height = window.innerHeight; }

  function onTouchStart(e) {
    if (!_active || !e.touches.length) return;
    _touchStartX = e.touches[0].clientX; _touchStartY = e.touches[0].clientY; _touchStartT = Date.now();
  }
  function onTouchEnd(e) {
    if (!_active) return;
    var ch = e.changedTouches && e.changedTouches[0];
    if (!ch) { advance(); return; }
    var dx = ch.clientX - _touchStartX, dist = Math.sqrt(dx * dx + Math.pow(ch.clientY - _touchStartY, 2));
    if (dist < 20) { _autoPlay = false; advance(); }
    else if (dist > 40 && Math.abs(dx) > Math.abs(ch.clientY - _touchStartY)) { _autoPlay = false; if (dx > 0) advance(); else retreat(); }
    e.preventDefault();
  }

  function onKey(e) {
    if (!_active) return;
    if (e.key === 'Escape') { deactivate(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); _autoPlay = false; advance(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); _autoPlay = false; retreat(); }
  }

  function advance() {
    initAudio();
    _zoomT = 0;
    if (_phase === 0) {
      _prevScale = SCALES[_scaleIdx];
      if (_scaleIdx < SCALES.length - 1) {
        _scaleIdx++;
        _autoTimer = 0;
        playScaleTone(SCALES[_scaleIdx].power);
        spawnWaterParticles(_canvas ? _canvas.width / 2 : 400, _canvas ? _canvas.height / 2 : 300);
        // Haptic at key milestones: mol (idx 3), galaxy (idx 7), universe (idx 9)
        if (navigator.vibrate && (_scaleIdx === 3 || _scaleIdx === 7 || _scaleIdx === 9)) {
          navigator.vibrate([50, 30, 100]);
        }
      } else {
        _phaseTransFrom = 0; _phaseTransT = 0;
        _phase = 1; _constIdx = 0; _autoTimer = 0; playConstantChord(CONSTANTS[0].exp);
        if (navigator.vibrate) navigator.vibrate([40, 20, 60, 20, 80]);
      }
    } else if (_phase === 1) {
      if (_constIdx < CONSTANTS.length - 1) { _constIdx++; _autoTimer = 0; playConstantChord(CONSTANTS[_constIdx].exp); }
      else { _phaseTransFrom = 1; _phaseTransT = 0; _phase = 2; _autoTimer = 0; if (navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 30, 50, 100]); }
    } else { deactivate(); }
  }

  function retreat() {
    _autoPlay = false;
    if (_phase === 2) { _phase = 1; _constIdx = CONSTANTS.length - 1; }
    else if (_phase === 1) { if (_constIdx > 0) _constIdx--; else { _phase = 0; _scaleIdx = SCALES.length - 1; } }
    else if (_phase === 0 && _scaleIdx > 0) _scaleIdx--;
  }

  function spawnWaterParticles(cx, cy) {
    for (var i = 0; i < 60; i++) {
      var a = Math.random() * TAU;
      var sp = 0.5 + Math.random() * 3;
      _particles.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
        life: 1, size: 1 + Math.random() * 2, blue: true });
    }
  }

  // ═══ STARS ═══
  function initStars() {
    _stars = [];
    for (var i = 0; i < 120; i++) {
      _stars.push({
        x: Math.random(), y: Math.random(),
        z: Math.random() * 0.8 + 0.2,
        size: Math.random() * 1.5 + 0.3,
        twinkle: Math.random() * TAU
      });
    }
  }

  function drawStars(ctx, W, H, t, depth) {
    for (var i = 0; i < _stars.length; i++) {
      var s = _stars[i];
      var parallax = 1 + depth * s.z * 0.15;
      var sx = ((s.x * parallax) % 1) * W;
      var sy = ((s.y * parallax) % 1) * H;
      var twink = 0.15 + Math.sin(t * 1.5 + s.twinkle) * 0.1;
      ctx.beginPath();
      ctx.arc(sx, sy, s.size * (0.5 + s.z * 0.5), 0, TAU);
      ctx.fillStyle = s.z > 0.7 ? '#79c0ff' : s.z > 0.4 ? '#c9d1d9' : '#484f58';
      ctx.globalAlpha = twink * s.z;
      ctx.fill();
    }
  }

  // ═══ DRAW HELPERS ═══
  function hexToRgb(hex) { return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]; }

  function drawWaterMolecule(ctx, cx, cy, r, alpha) {
    // Bond vibration — hydrogens oscillate slightly
    var vib = Math.sin(_t * 8) * 0.03;
    var hLx = cx - r * (0.7 + vib);
    var hLy = cy - r * (0.4 + vib * 0.5);
    var hRx = cx + r * (0.7 - vib);
    var hRy = cy - r * (0.4 + vib * 0.5);

    // Electron cloud glow
    ctx.globalAlpha = alpha * 0.08;
    var cloudGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2);
    cloudGrd.addColorStop(0, 'rgba(88,166,255,0.15)');
    cloudGrd.addColorStop(1, 'rgba(88,166,255,0)');
    ctx.fillStyle = cloudGrd;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.2, 0, TAU); ctx.fill();

    // Oxygen (center, red)
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#e85d3a';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.6, 0, TAU); ctx.fill();
    // O glow
    ctx.globalAlpha = alpha * 0.2;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.75, 0, TAU);
    ctx.strokeStyle = '#e85d3a'; ctx.lineWidth = 1; ctx.stroke();

    // Hydrogen atoms
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(hLx, hLy, r * 0.35, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(hRx, hRy, r * 0.35, 0, TAU); ctx.fill();

    // Bonds
    ctx.strokeStyle = '#484f58';
    ctx.lineWidth = Math.max(1, r * 0.04);
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath(); ctx.moveTo(hLx + (cx - hLx) * 0.4, hLy + (cy - hLy) * 0.4); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hRx + (cx - hRx) * 0.4, hRy + (cy - hRy) * 0.4); ctx.lineTo(cx, cy); ctx.stroke();

    // Labels
    ctx.globalAlpha = alpha * 0.35;
    ctx.font = Math.round(r * 0.3) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('H', hLx, hLy - r * 0.35 - 4);
    ctx.fillText('H', hRx, hRy - r * 0.35 - 4);
    ctx.fillStyle = '#e85d3a';
    ctx.fillText('O', cx, cy + r * 0.15);

    // Bond angle label (104.5°)
    ctx.globalAlpha = alpha * 0.12;
    ctx.font = Math.round(r * 0.18) + 'px monospace';
    ctx.fillStyle = '#8b949e';
    ctx.fillText('104.5°', cx, cy + r * 0.45);
  }

  function drawRollingCount(ctx, cx, y, target, color, ts2) {
    // Smooth counter that rolls toward target exponent
    var diff = target - _countDisplay;
    _countDisplay += diff * 0.08;
    if (Math.abs(diff) < 0.01) _countDisplay = target;

    var dispPower = Math.round(_countDisplay * 10) / 10;
    var whole = Math.floor(Math.abs(dispPower));
    var frac = Math.abs(dispPower) - whole;

    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.font = 'bold ' + Math.round(24 * ts2) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = color;

    if (dispPower < 1) {
      ctx.fillText('1', cx, y);
    } else {
      // Show 10^n with rolling decimal
      var expStr = dispPower.toFixed(1);
      ctx.fillText('10', cx - 20 * ts2, y);
      ctx.font = 'bold ' + Math.round(16 * ts2) + 'px monospace';
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fillText(expStr, cx + 12 * ts2, y - 10 * ts2);
    }
    ctx.restore();
  }

  function drawPiDigitStream(ctx, W, H, t, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#58a6ff';

    var scrollOffset = (t * 12) % (_piDigits.length * 8);
    for (var d = 0; d < Math.min(60, Math.ceil(W / 10)); d++) {
      var idx = (d + Math.floor(scrollOffset / 8)) % _piDigits.length;
      var dx = (d * 10) - (scrollOffset % 8);
      var dy = H - 96 + Math.sin(d * 0.3 + t * 0.8) * 3;
      ctx.globalAlpha = alpha * (0.3 + Math.sin(d * 0.15 + t) * 0.2);
      ctx.fillText(_piDigits[idx], dx, dy);
    }
    ctx.restore();
  }

  function drawExponentBar(ctx, W, H, power, maxPower, color) {
    var barW = Math.min(W * 0.7, 500);
    var barH = 4;
    var barX = (W - barW) / 2;
    var barY = H - 70;
    var pct = power / maxPower;

    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#21262d';
    ctx.fillRect(barX, barY, barW, barH);

    ctx.globalAlpha = 0.7;
    ctx.fillStyle = color;
    ctx.fillRect(barX, barY, barW * pct, barH);

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(barX + barW * pct, barY + barH / 2, 5, 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#484f58';
    ctx.fillText('10⁰', barX, barY - 6);
    ctx.textAlign = 'right';
    ctx.fillText('10⁸⁰', barX + barW, barY - 6);
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.fillText('10^' + Math.round(power), barX + barW * pct, barY - 6);
  }

  // ═══ RENDER ═══
  function render(ts) {
    if (!_active) return;
    var dt = Math.min(ts - _lastFrame, 50);
    _lastFrame = ts;
    _t += dt * 0.001;

    var W = _canvas.width, H = _canvas.height;
    var cx = W / 2, cy = H / 2;
    var ctx = _ctx;
    var mobile = W < 600;
    var ts2 = mobile ? 0.7 : 1;

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, W, H);

    // Subtle blue/water gradient background
    var bgGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.5);
    bgGrd.addColorStop(0, 'rgba(20,40,80,0.08)');
    bgGrd.addColorStop(1, 'rgba(2,4,8,0)');
    ctx.fillStyle = bgGrd;
    ctx.fillRect(0, 0, W, H);

    // Star field — more visible at cosmic scales
    var starDepth = _phase === 0 ? _scaleIdx * 0.3 : _phase === 1 ? 3.5 : 4;
    if (_scaleIdx >= 3 || _phase > 0) drawStars(ctx, W, H, _t, starDepth);

    // π digit stream — flows at bottom during Phase 1 and 2
    if (_phase >= 1) {
      var streamAlpha = _phase === 1 ? 0.04 + _constIdx * 0.01 : 0.08;
      drawPiDigitStream(ctx, W, H, _t, streamAlpha);
    }

    // π watermark — grows with progress
    var progress = _phase === 0 ? _scaleIdx / SCALES.length
      : _phase === 1 ? 0.5 + _constIdx / CONSTANTS.length * 0.4
      : 0.95;
    ctx.globalAlpha = 0.01 + progress * 0.05;
    ctx.font = Math.round(200 + progress * 100) + 'px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#58a6ff';
    ctx.fillText('\u03c0', cx, cy);
    ctx.textBaseline = 'alphabetic';

    var breath = 1 + Math.sin(_t * PI * 0.3) * 0.015;
    _zoomT = Math.min(1, _zoomT + dt * 0.001 * 1.5);
    var zoomEase = _zoomT < 1 ? 1 - Math.pow(1 - _zoomT, 3) : 1;

    // Autoplay
    if (_autoPlay) {
      _autoTimer += dt * 0.001;
      var interval = _phase === 0 ? 3.5 : _phase === 1 ? 4.0 : 6.0;
      if (_autoTimer > interval) { advance(); }
    }

    // Phase transition flash
    if (_phaseTransT < 1 && _phaseTransFrom >= 0) {
      _phaseTransT = Math.min(1, _phaseTransT + dt * 0.001 * 1.2);
      var flashAlpha = Math.sin(_phaseTransT * PI) * 0.15;
      ctx.globalAlpha = flashAlpha;
      ctx.fillStyle = _phaseTransFrom === 0 ? '#58a6ff' : '#d2a8ff';
      ctx.fillRect(0, 0, W, H);
      if (_phaseTransT >= 1) _phaseTransFrom = -1;
    }

    // ═══ PHASE 0: WATER ZOOM — molecule to galaxy ═══
    if (_phase === 0) {
      var sc = SCALES[_scaleIdx];
      var R = Math.min(W, H) * 0.18 * breath;

      // Concentric zoom rings — all previous scales
      for (var si = 0; si < _scaleIdx; si++) {
        var ringR = R * (0.12 + (si / SCALES.length) * 0.88);
        var ringAlpha = 0.03 + (si / SCALES.length) * 0.04;
        ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, TAU);
        ctx.strokeStyle = SCALES[si].color; ctx.globalAlpha = ringAlpha; ctx.lineWidth = 1; ctx.stroke();
      }

      // Current scale visualization
      if (_scaleIdx === 0) {
        var molScale = zoomEase;
        drawWaterMolecule(ctx, cx, cy, R * 0.8 * molScale, 0.85 * molScale);
      } else {
        // Expanding ripple — animates from inner to full size
        var rExpand = R * (0.3 + 0.7 * zoomEase);
        ctx.beginPath(); ctx.arc(cx, cy, rExpand, 0, TAU);
        ctx.strokeStyle = sc.color; ctx.globalAlpha = 0.6 * zoomEase; ctx.lineWidth = 2; ctx.stroke();

        // Fill glow
        var grd = ctx.createRadialGradient(cx, cy, rExpand * 0.3, cx, cy, rExpand * 1.2);
        var rgb = hexToRgb(sc.color);
        grd.addColorStop(0, 'rgba(' + rgb.join(',') + ',0.06)');
        grd.addColorStop(1, 'rgba(' + rgb.join(',') + ',0)');
        ctx.globalAlpha = zoomEase; ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(cx, cy, rExpand * 1.3, 0, TAU); ctx.fill();

        // Tiny water molecule at center
        if (_scaleIdx <= 4) drawWaterMolecule(ctx, cx, cy, R * 0.15, 0.25);

        // Scale icon
        ctx.globalAlpha = 0.15;
        ctx.font = Math.round(60 * ts2) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = sc.color;
        ctx.fillText(sc.icon, cx, cy + 20 * ts2);

        // Mini molecule clusters at larger scales
        if (_scaleIdx >= 2 && _scaleIdx <= 6) {
          var nMini = Math.min(_scaleIdx * 3, 15);
          for (var mi = 0; mi < nMini; mi++) {
            var mAngle = (mi / nMini) * TAU + _t * 0.1 + mi * 0.7;
            var mDist = rExpand * (0.5 + Math.sin(mi * 2.3 + _t * 0.3) * 0.3);
            var mx = cx + Math.cos(mAngle) * mDist;
            var my = cy + Math.sin(mAngle) * mDist;
            // Tiny 3-dot H₂O
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = '#e85d3a';
            ctx.beginPath(); ctx.arc(mx, my, 2, 0, TAU); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(mx - 3, my - 1.5, 1.2, 0, TAU); ctx.fill();
            ctx.beginPath(); ctx.arc(mx + 3, my - 1.5, 1.2, 0, TAU); ctx.fill();
          }
        }
      }

      // Text
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';

      ctx.font = 'bold ' + Math.round(36 * ts2) + 'px monospace';
      ctx.fillStyle = sc.color;
      ctx.fillText(sc.name, cx, mobile ? 50 : 70);

      ctx.font = Math.round(14 * ts2) + 'px monospace';
      ctx.fillStyle = '#6e7681';
      ctx.fillText(sc.detail, cx, mobile ? 68 : 95);

      ctx.font = Math.round(12 * ts2) + 'px monospace';
      ctx.fillStyle = '#484f58';
      ctx.fillText(sc.desc, cx, cy + R + (mobile ? 30 : 45));

      // Molecule count — rolling counter
      _countTarget = sc.power;
      drawRollingCount(ctx, cx, mobile ? cy - R - 10 : cy - R - 20, sc.power, sc.color, ts2);

      if (sc.molecules > 1) {
        ctx.globalAlpha = 0.35;
        ctx.font = Math.round(10 * ts2) + 'px monospace';
        ctx.fillStyle = '#6e7681';
        ctx.fillText('molecules of water', cx, mobile ? cy - R + 4 : cy - R - 2);
      }

      // Exponent bar
      drawExponentBar(ctx, W, H, sc.power, 80, sc.color);

      // π connection — what constant bridges this scale
      if (_scaleIdx >= 2) {
        ctx.globalAlpha = 0.25;
        ctx.font = Math.round(10 * ts2) + 'px monospace';
        ctx.fillStyle = '#58a6ff';
        var piNote = _scaleIdx === 2 ? 'Nₐ = 6.022 × 10²³ — the mol fold' :
                     _scaleIdx === 5 ? 'c = π × 10⁸ m/s bridges space' :
                     _scaleIdx >= 8 ? 'G = 6.674 × 10⁻¹¹ — gravity holds galaxies' :
                     'each scale is a π-fold deeper';
        ctx.fillText(piNote, cx, cy + R + (mobile ? 68 : 90));
      }

      // Progress dots — current one breathes
      var dotBarY = H - 50;
      for (var di = 0; di < SCALES.length; di++) {
        var dx = cx + (di - (SCALES.length - 1) / 2) * 22;
        var isCurr = di === _scaleIdx;
        var dotR = isCurr ? 4 + Math.sin(_t * 3) * 1 : 2;
        ctx.beginPath(); ctx.arc(dx, dotBarY, dotR, 0, TAU);
        ctx.fillStyle = di <= _scaleIdx ? SCALES[di].color : '#21262d';
        ctx.globalAlpha = isCurr ? 0.9 : 0.4;
        ctx.fill();
        // Glow ring on current
        if (isCurr) {
          ctx.beginPath(); ctx.arc(dx, dotBarY, dotR + 3, 0, TAU);
          ctx.strokeStyle = SCALES[di].color; ctx.globalAlpha = 0.2; ctx.lineWidth = 1; ctx.stroke();
        }
      }

      // Autoplay hint
      if (_autoPlay && _scaleIdx < SCALES.length - 1) {
        ctx.globalAlpha = 0.2 + Math.sin(_t * 2) * 0.08;
        ctx.font = Math.round(9 * ts2) + 'px monospace';
        ctx.fillStyle = '#484f58';
        ctx.fillText(mobile ? 'auto · tap to take control' : 'auto · click or → to take control', cx, H - 30);
      }

      ctx.globalAlpha = 1;
      ctx.font = Math.round(9 * ts2) + 'px monospace';
      ctx.fillStyle = '#30363d';
      ctx.fillText(mobile ? 'tap · swipe → zoom out' : 'click · → to zoom out · ← zoom in · ESC close', cx, H - 14);
    }

    // ═══ PHASE 1: CONSTANTS — π at every fold ═══
    else if (_phase === 1) {
      var cn = CONSTANTS[_constIdx];
      var fadeIn = zoomEase;

      // All constants as dots on a number line (exponent axis)
      var lineY = cy;
      var lineW = W * 0.7;
      var lineX = (W - lineW) / 2;

      // Exponent axis
      ctx.globalAlpha = 0.15 * fadeIn;
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(lineX, lineY); ctx.lineTo(lineX + lineW, lineY); ctx.stroke();

      // Tick marks for key exponents
      [-34, -23, -11, 0, 8, 23].forEach(function(exp) {
        var x = lineX + ((exp + 40) / 80) * lineW;
        ctx.globalAlpha = 0.2;
        ctx.beginPath(); ctx.moveTo(x, lineY - 6); ctx.lineTo(x, lineY + 6); ctx.stroke();
        ctx.font = '7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#484f58';
        ctx.fillText('10^' + exp, x, lineY + 16);
      });

      // All constants as circles on the line
      CONSTANTS.forEach(function(c, ci) {
        var x = lineX + ((c.exp + 40) / 80) * lineW;
        var isCurrent = ci === _constIdx;
        var r = isCurrent ? 10 * fadeIn : 4;

        ctx.beginPath(); ctx.arc(x, lineY, r, 0, TAU);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = isCurrent ? 0.9 : 0.2;
        ctx.fill();

        if (isCurrent) {
          ctx.beginPath(); ctx.arc(x, lineY, r + 4, 0, TAU);
          ctx.strokeStyle = c.color; ctx.globalAlpha = 0.3; ctx.lineWidth = 1.5; ctx.stroke();
        }

        // Label
        ctx.globalAlpha = isCurrent ? 0.9 : 0.15;
        ctx.font = (isCurrent ? 'bold ' : '') + Math.round((isCurrent ? 13 : 8) * ts2) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = c.color;
        ctx.fillText(c.name, x, lineY - r - 8);
      });

      // Autoplay hint for constants
      if (_autoPlay && _constIdx < CONSTANTS.length - 1) {
        ctx.globalAlpha = 0.2 + Math.sin(_t * 2) * 0.08;
        ctx.font = Math.round(9 * ts2) + 'px monospace';
        ctx.textAlign = 'center'; ctx.fillStyle = '#484f58';
        ctx.fillText(mobile ? 'auto · tap to take control' : 'auto · click or → to take control', cx, H - 30);
      }

      // Current constant detail
      ctx.globalAlpha = fadeIn;
      ctx.textAlign = 'center';

      ctx.font = 'bold ' + Math.round(42 * ts2) + 'px monospace';
      ctx.fillStyle = cn.color;
      ctx.fillText(cn.name, cx, mobile ? 55 : 75);

      ctx.font = Math.round(16 * ts2) + 'px monospace';
      ctx.fillStyle = '#c9d1d9';
      ctx.fillText(cn.piApprox, cx, mobile ? 75 : 100);

      ctx.font = Math.round(12 * ts2) + 'px monospace';
      ctx.fillStyle = '#484f58';
      ctx.fillText(cn.desc, cx, mobile ? cy + 65 : cy + 80);

      // π expression
      ctx.font = 'bold ' + Math.round(20 * ts2) + 'px monospace';
      ctx.fillStyle = '#58a6ff';
      ctx.globalAlpha = 0.6;
      ctx.fillText(cn.piExpr, cx, mobile ? cy + 88 : cy + 110);

      // The gradient line — π flows through all constants
      ctx.globalAlpha = 0.08;
      ctx.font = Math.round(80 * ts2) + 'px monospace';
      ctx.fillStyle = '#58a6ff';
      ctx.fillText('π', cx, cy + 30);

      // Progress dots — breathing current
      var cdotY = H - 50;
      for (var cdi = 0; cdi < CONSTANTS.length; cdi++) {
        var cdx = cx + (cdi - (CONSTANTS.length - 1) / 2) * 24;
        var isCurrC = cdi === _constIdx;
        var cdotR = isCurrC ? 4 + Math.sin(_t * 3) * 1 : 2;
        ctx.beginPath(); ctx.arc(cdx, cdotY, cdotR, 0, TAU);
        ctx.fillStyle = cdi <= _constIdx ? CONSTANTS[cdi].color : '#21262d';
        ctx.globalAlpha = isCurrC ? 0.9 : 0.4;
        ctx.fill();
        if (isCurrC) {
          ctx.beginPath(); ctx.arc(cdx, cdotY, cdotR + 3, 0, TAU);
          ctx.strokeStyle = CONSTANTS[cdi].color; ctx.globalAlpha = 0.2; ctx.lineWidth = 1; ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      ctx.font = Math.round(9 * ts2) + 'px monospace';
      ctx.fillStyle = '#30363d';
      ctx.fillText(mobile ? 'tap · swipe to change constant' : 'click · → next constant · ← prev · ESC close', cx, H - 14);
    }

    // ═══ PHASE 2: THE GRADIENT — everything breathes together ═══
    else if (_phase === 2) {
      // All scales as nested ripples
      SCALES.forEach(function(s, si) {
        var r = Math.min(W, H) * 0.04 * (1 + si * 0.8);
        var pulse = Math.sin(_t * 0.4 + si * 0.5) * 0.03;
        ctx.beginPath(); ctx.arc(cx, cy, r * (1 + pulse), 0, TAU);
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = 0.04 + pulse * 0.3;
        ctx.lineWidth = 1; ctx.stroke();
      });

      // Constants as orbiting dots with trails and connection lines
      CONSTANTS.forEach(function(c, ci) {
        var orbit = Math.min(W, H) * 0.15 + ci * 18;
        var angle = _t * 0.15 + ci * (TAU / CONSTANTS.length);
        var px = cx + Math.cos(angle) * orbit;
        var py = cy + Math.sin(angle) * orbit;

        // Orbit trail — fading arc behind the dot
        ctx.beginPath();
        var trailLen = PI * 0.6;
        for (var tr = 0; tr < 20; tr++) {
          var trAngle = angle - (tr / 20) * trailLen;
          var trx = cx + Math.cos(trAngle) * orbit;
          var trY = cy + Math.sin(trAngle) * orbit;
          if (tr === 0) ctx.moveTo(trx, trY); else ctx.lineTo(trx, trY);
        }
        ctx.strokeStyle = c.color;
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = 2; ctx.stroke();

        // Connection line to center (faint)
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py);
        ctx.strokeStyle = c.color;
        ctx.globalAlpha = 0.06 + Math.sin(_t * 0.5 + ci) * 0.03;
        ctx.lineWidth = 0.5; ctx.stroke();

        // Orbiting dot
        var dotPulse = 1 + Math.sin(_t * 2 + ci * 1.3) * 0.3;
        ctx.beginPath(); ctx.arc(px, py, 3 * dotPulse, 0, TAU);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = 0.4 + Math.sin(_t + ci) * 0.2;
        ctx.fill();

        // Glow ring on current dot
        ctx.beginPath(); ctx.arc(px, py, 6 * dotPulse, 0, TAU);
        ctx.strokeStyle = c.color; ctx.globalAlpha = 0.1; ctx.lineWidth = 0.5; ctx.stroke();

        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.5;
        ctx.fillText(c.name, px, py - 10);

        // π expression below the dot (faint)
        ctx.globalAlpha = 0.15;
        ctx.font = '6px monospace';
        ctx.fillText(c.piExpr, px, py + 12);
      });

      // Center: water molecule + π overlaid
      drawWaterMolecule(ctx, cx, cy - 5, Math.min(W, H) * 0.04, 0.12);

      var piScale = 1 + Math.sin(_t * 0.5) * 0.06;
      ctx.globalAlpha = 0.3 + Math.sin(_t * 0.7) * 0.1;
      ctx.font = Math.round(50 * piScale) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#58a6ff';
      ctx.fillText('π', cx, cy + 18);

      // The message
      ctx.globalAlpha = 0.2 + Math.sin(_t * 0.3) * 0.05;
      ctx.font = Math.round(11 * ts2) + 'px monospace';
      ctx.fillStyle = '#8b949e';
      ctx.fillText('every constant is π at a different fold', cx, cy + Math.min(W,H) * 0.3);
      ctx.fillText('water is the bridge — countable at every scale', cx, cy + Math.min(W,H) * 0.3 + 18);
      ctx.fillText('the gradient is the universe', cx, cy + Math.min(W,H) * 0.3 + 36);

      ctx.globalAlpha = 0.12;
      ctx.fillText('molecule · drop · mol · cup · human · lake · ocean · star · galaxy · ∞', cx, cy + Math.min(W,H) * 0.3 + 60);
      ctx.fillText('π · e · Nₐ · kB · c · ℏ · G · α', cx, cy + Math.min(W,H) * 0.3 + 76);

      // Slowly appearing deeper text
      var medTime = _autoTimer;
      if (medTime > 3) {
        ctx.globalAlpha = Math.min(0.15, (medTime - 3) * 0.03);
        ctx.fillText('one molecule contains it all', cx, cy + Math.min(W,H) * 0.3 + 100);
      }
      if (medTime > 6) {
        ctx.globalAlpha = Math.min(0.12, (medTime - 6) * 0.02);
        ctx.fillText('π is not a number. π is a gradient.', cx, cy + Math.min(W,H) * 0.3 + 118);
      }

      ctx.globalAlpha = 0.3;
      ctx.font = Math.round(9 * ts2) + 'px monospace';
      ctx.fillStyle = '#30363d';
      ctx.fillText('click to close · ESC', cx, H - 14);
    }

    // ═══ PARTICLES ═══
    for (var pi = _particles.length - 1; pi >= 0; pi--) {
      var p = _particles[pi];
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.98; p.vy *= 0.98;
      p.life -= dt * 0.001 * 0.5;
      if (p.life <= 0) { _particles.splice(pi, 1); continue; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, TAU);
      ctx.fillStyle = p.blue ? 'rgba(88,166,255,' + (p.life * 0.4) + ')' : 'rgba(255,255,255,' + (p.life * 0.3) + ')';
      ctx.globalAlpha = 1; ctx.fill();
    }

    // ═══ CLOSE BUTTON (top-left) ═══
    ctx.globalAlpha = 0.2;
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8b949e';
    ctx.fillText('✕', 14, 24);

    // Phase label (top-left)
    ctx.globalAlpha = 0.15;
    ctx.font = '8px monospace';
    ctx.fillText(
      _phase === 0 ? 'water zoom' : _phase === 1 ? 'constants' : 'the gradient',
      36, 22
    );

    // ═══ SOUND WAVE INDICATOR ═══
    if (_soundDecay > 0.01) {
      _soundDecay *= 0.96;
      ctx.save();
      ctx.globalAlpha = _soundDecay * 0.5;
      ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var wi = 0; wi < 20; wi++) {
        var wx = W - 50 + wi * 2;
        var wy = 25 + Math.sin(wi * 0.7 + _t * 6) * 6 * _soundDecay;
        wi === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
      }
      ctx.stroke(); ctx.restore();
    }

    requestAnimationFrame(render);
  }

  // ═══ LIFECYCLE ═══
  function activate(addEntry, onDone, opts) {
    if (_active) { deactivate(); return false; }
    _onDeactivate = onDone || null;
    var startOpts = opts || {};
    createCanvas();
    _active = true;
    _phase = 0; _scaleIdx = 0; _constIdx = 0;
    _autoPlay = true; _autoTimer = 0; _t = 0; _particles = []; _zoomT = 0;
    _countDisplay = 0; _countTarget = 0; _phaseTransT = 1; _phaseTransFrom = -1;
    if (_stars.length === 0) initStars();
    _lastFrame = performance.now();
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
    requestAnimationFrame(render);
    return true;
  }

  function deactivate() {
    _active = false;
    if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.02); } catch(e){} _currentOsc = null; }
    if (_canvas) {
      _canvas.removeEventListener('touchstart', onTouchStart);
      _canvas.removeEventListener('touchend', onTouchEnd);
      _canvas.remove(); _canvas = null; _ctx = null;
    }
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    var journey = { phase: _phase, scaleIdx: _scaleIdx, constIdx: _constIdx,
      scaleName: _phase === 0 ? SCALES[Math.min(_scaleIdx, SCALES.length-1)].name : null,
      constName: _phase >= 1 ? CONSTANTS[Math.min(_constIdx, CONSTANTS.length-1)].name : null,
      reachedConstants: _phase >= 1, completed: _phase >= 2 };
    if (_onDeactivate) { try { _onDeactivate(journey); } catch(e) {} }
  }

  window._piGradient = {
    activate: activate,
    deactivate: deactivate,
    isActive: function() { return _active; },
    currentScale: function() {
      if (!_active) return null;
      if (_phase === 0) return SCALES[Math.min(_scaleIdx, SCALES.length-1)];
      if (_phase === 1) return { name: CONSTANTS[Math.min(_constIdx, CONSTANTS.length-1)].name, color: CONSTANTS[Math.min(_constIdx, CONSTANTS.length-1)].color };
      return { name: 'gradient', color: '#58a6ff' };
    },
  };
})();
