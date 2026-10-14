// bubble-pop.js v5 — the numeric bubble popping
// dot → line → triangle → square → ... → circle → π
// Each power of π is a dimensional fold.
// Sound: each n-gon gets a tone. As n→∞, harmonics converge to a sine (circle).
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  var SHAPES = [
    { n: 1,   name: 'dot',       color: '#ffffff', desc: 'the point exists' },
    { n: 2,   name: 'line',      color: '#d2a8ff', desc: 'two points connect' },
    { n: 3,   name: 'triangle',  color: '#f0883e', desc: 'the first closed shape' },
    { n: 4,   name: 'square',    color: '#58a6ff', desc: 'the first right angle' },
    { n: 5,   name: 'pentagon',  color: '#5ab87a', desc: 'the golden ratio hides here' },
    { n: 6,   name: 'hexagon',   color: '#3fb950', desc: 'tiling begins — honeycomb' },
    { n: 8,   name: 'octagon',   color: '#79c0ff', desc: 'the stop sign — pause' },
    { n: 12,  name: 'dodecagon', color: '#d29922', desc: 'twelve — time emerges' },
    { n: 24,  name: '24-gon',    color: '#a371f7', desc: 'almost round — shimmer' },
    { n: 64,  name: '64-gon',    color: '#e85d3a', desc: 'the eye cannot tell' },
    { n: 999, name: 'circle',    color: '#58a6ff', desc: 'π — the bubble pops' },
  ];

  var FOLDS = [
    { power: 0,   value: 1,          label: 'π⁰ = 1',     color: '#ffffff', name: '∅ null',      desc: 'the point exists. raw data.' },
    { power: 0.5, value: Math.sqrt(PI), label: '√π ≈ 1.77', color: '#8b949e', name: '√π',          desc: 'half a fold. the datum stirs.' },
    { power: 1,   value: PI,         label: 'π ≈ 3.14',   color: '#58a6ff', name: 'π celestial',  desc: 'the circle closes. the pattern.' },
    { power: 2,   value: PI*PI,      label: 'π² ≈ 9.87',  color: '#5ab87a', name: 'π² geodesic',  desc: 'the surface. connection of patterns.' },
    { power: 3,   value: PI*PI*PI,   label: 'π³ ≈ 31.0',  color: '#e85d3a', name: 'π³ surface',   desc: 'the thought. volume deepens.' },
  ];

  var _canvas, _ctx, _active = false, _t = 0, _lastFrame = 0;
  var _phase = 0, _shapeIdx = 0, _foldIdx = 0, _morphT = 0;
  var _autoPlay = true, _particles = [], _popFlash = 0;
  var _audioCtx = null, _currentOsc = null;
  var _onDeactivate = null;
  var _touchStartX = 0, _touchStartY = 0, _touchStartT = 0;
  var _soundActive = false, _soundDecay = 0;

  // ═══ SOUND ═══
  function initAudio() {
    if (_audioCtx) return;
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }

  function playShapeTone(n) {
    if (!_audioCtx) return;
    try {
      // Kill previous
      if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.05); } catch(e){} _currentOsc = null; }

      var baseFreq = 196; // π-just base (same as membrane-sound)
      // Frequency: base * (n / π) — converges as n approaches circle
      var freq = baseFreq * (1 + (n - 1) * 0.15);
      if (n >= 999) freq = baseFreq * PI; // circle = π harmonic

      var osc = _audioCtx.createOscillator();
      var gain = _audioCtx.createGain();
      osc.connect(gain);
      gain.connect(_audioCtx.destination);

      // Wave shape: more sides = closer to sine
      if (n <= 2) { osc.type = 'sawtooth'; }
      else if (n <= 4) { osc.type = 'triangle'; }
      else if (n <= 12) { osc.type = 'square'; gain.gain.value = 0.06; }
      else { osc.type = 'sine'; }

      osc.frequency.value = freq;
      gain.gain.value = Math.min(0.1, 0.12 / Math.sqrt(n));

      // Gentle attack
      gain.gain.setValueAtTime(0, _audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(gain.gain.value, _audioCtx.currentTime + 0.08);

      osc.start();

      // Fade out after 1.5s
      gain.gain.setTargetAtTime(0, _audioCtx.currentTime + 1.2, 0.3);
      osc.stop(_audioCtx.currentTime + 2.5);

      _currentOsc = { o: osc, g: gain };
      _soundActive = true; _soundDecay = 1;
    } catch(e) {}
  }

  function playPopChord() {
    if (!_audioCtx) return;
    try {
      // Play a π-harmonic chord: base, π×base, π²×base
      var base = 196;
      [1, PI, PI*PI/3].forEach(function(mult, i) {
        var osc = _audioCtx.createOscillator();
        var gain = _audioCtx.createGain();
        osc.connect(gain);
        gain.connect(_audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = base * mult;
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, _audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08 / (i + 1), _audioCtx.currentTime + 0.05);
        gain.gain.setTargetAtTime(0, _audioCtx.currentTime + 0.8, 0.5);
        osc.start();
        osc.stop(_audioCtx.currentTime + 3);
      });
      _soundActive = true; _soundDecay = 1;
    } catch(e) {}
  }

  function playFoldTone(power) {
    if (!_audioCtx) return;
    try {
      if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.05); } catch(e){} _currentOsc = null; }
      var freq = 196 * Math.pow(PI, power * 0.5);
      var osc = _audioCtx.createOscillator();
      var gain = _audioCtx.createGain();
      osc.connect(gain);
      gain.connect(_audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.08, _audioCtx.currentTime + 0.1);
      gain.gain.setTargetAtTime(0, _audioCtx.currentTime + 1.5, 0.4);
      osc.start();
      osc.stop(_audioCtx.currentTime + 3);
      _currentOsc = { o: osc, g: gain };
      _soundActive = true; _soundDecay = 1;
    } catch(e) {}
  }

  // ═══ CANVAS ═══
  function createCanvas() {
    if (_canvas) return;
    _canvas = document.createElement('canvas');
    _canvas.id = 'bubble-pop-canvas';
    _canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:45;' +
      'background:#020408;cursor:pointer;';
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    document.body.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');
    _canvas.addEventListener('click', function(e) {
      if (e.pointerType === 'touch') return;
      advance();
    });
    _canvas.addEventListener('dblclick', function() { deactivate(); });
    _canvas.addEventListener('wheel', function(e) {
      e.preventDefault();
      _autoPlay = false;
      if (e.deltaY > 0) advance(); else retreat();
    }, { passive: false });
    _canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    _canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
  }

  function onResize() {
    if (!_canvas) return;
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
  }

  function onTouchStart(e) {
    if (!_active || !e.touches.length) return;
    _touchStartX = e.touches[0].clientX;
    _touchStartY = e.touches[0].clientY;
    _touchStartT = Date.now();
  }

  function onTouchEnd(e) {
    if (!_active) return;
    var ch = e.changedTouches && e.changedTouches[0];
    if (!ch) { advance(); return; }
    var dx = ch.clientX - _touchStartX;
    var dy = ch.clientY - _touchStartY;
    var dt = Date.now() - _touchStartT;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 20 && dt < 400) {
      advance();
    } else if (dist > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) advance();
      else retreat();
    }
    e.preventDefault();
  }

  function onKey(e) {
    if (!_active) return;
    if (e.key === 'Escape') { deactivate(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); advance(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); retreat(); }
  }

  function advance() {
    _autoPlay = false;
    initAudio();
    if (_phase === 0) {
      if (_shapeIdx < SHAPES.length - 1) {
        _shapeIdx++;
        _morphT = 0;
        playShapeTone(SHAPES[_shapeIdx].n);
        if (_shapeIdx === SHAPES.length - 1) {
          _popFlash = 1; spawnPop(); playPopChord();
          if (navigator.vibrate) try { navigator.vibrate([40, 30, 80]); } catch(e) {}
        }
      } else { _phase = 1; _foldIdx = 0; _morphT = 0; playFoldTone(FOLDS[0].power); }
    } else if (_phase === 1) {
      if (_foldIdx < FOLDS.length - 1) { _foldIdx++; _morphT = 0; playFoldTone(FOLDS[_foldIdx].power); }
      else { _phase = 2; }
    } else { deactivate(); }
  }

  function retreat() {
    _autoPlay = false;
    if (_phase === 2) { _phase = 1; _foldIdx = FOLDS.length - 1; }
    else if (_phase === 1) { if (_foldIdx > 0) { _foldIdx--; _morphT = 0; } else { _phase = 0; _shapeIdx = SHAPES.length - 1; } }
    else if (_phase === 0 && _shapeIdx > 0) { _shapeIdx--; _morphT = 0; }
  }

  // ═══ PARTICLES ═══
  function spawnPop() {
    var cx = _canvas.width / 2, cy = _canvas.height / 2;
    for (var i = 0; i < 120; i++) {
      var a = Math.random() * TAU;
      var sp = 1.5 + Math.random() * 5;
      _particles.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 1, size: 1+Math.random()*3, hue: Math.random()*360 });
    }
  }

  // ═══ DRAW N-GON ═══
  function drawNgon(ctx, cx, cy, r, n, color, alpha, lw) {
    ctx.beginPath();
    if (n <= 1) {
      ctx.arc(cx, cy, Math.max(3, r * 0.04), 0, TAU);
      ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.fill();
      return;
    }
    if (n === 2) {
      ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
      ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = lw || 2; ctx.stroke();
      return;
    }
    var sides = n >= 999 ? 180 : n;
    for (var i = 0; i <= sides; i++) {
      var angle = (i / sides) * TAU - PI / 2;
      var x = cx + Math.cos(angle) * r;
      var y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = lw || 2; ctx.stroke();
  }

  function hexToRgb(hex) { return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]; }
  function lerpColor(c1, c2, t) {
    var a = hexToRgb(c1), b = hexToRgb(c2);
    return 'rgb(' + Math.round(a[0]+(b[0]-a[0])*t) + ',' + Math.round(a[1]+(b[1]-a[1])*t) + ',' + Math.round(a[2]+(b[2]-a[2])*t) + ')';
  }

  // ═══ RENDER ═══
  function render(ts) {
    if (!_active) return;
    var dt = Math.min(ts - _lastFrame, 50);
    _lastFrame = ts;
    _t += dt * 0.001;

    var W = _canvas.width, H = _canvas.height;
    var cx = W / 2, cy = H / 2;
    var R = Math.min(W, H) * 0.22;
    var ctx = _ctx;

    // Full clear — no trail
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, W, H);

    // Responsive text scale for mobile
    var mobile = W < 600;
    var ts = mobile ? 0.7 : 1;

    // Subtle radial glow
    var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2);
    grd.addColorStop(0, 'rgba(30,40,60,0.15)');
    grd.addColorStop(1, 'rgba(2,4,8,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    var breath = 1 + Math.sin(_t * PI * 0.4) * 0.02;
    var baseR = R * breath;

    // ═══ PHASE 0: SHAPE LADDER ═══
    if (_phase === 0) {
      var shape = SHAPES[_shapeIdx];

      // Auto morph
      if (_morphT < 1) { _morphT = Math.min(1, _morphT + dt * 0.001 * 0.9); }
      else if (_autoPlay && _shapeIdx < SHAPES.length - 1) {
        _morphT += dt * 0.001 * 0.25;
        if (_morphT > 2.8) {
          _shapeIdx++; _morphT = 0;
          initAudio(); playShapeTone(SHAPES[_shapeIdx].n);
          if (_shapeIdx === SHAPES.length - 1) { _popFlash = 1; spawnPop(); playPopChord(); }
        }
      } else if (_autoPlay && _shapeIdx === SHAPES.length - 1 && _morphT >= 1) {
        _morphT += dt * 0.001 * 0.15;
        if (_morphT > 4) { _phase = 1; _foldIdx = 0; _morphT = 0; }
      }

      // π watermark — grows as n approaches ∞
      if (_shapeIdx > 1) {
        var piAlpha = (_shapeIdx / SHAPES.length) * 0.06;
        ctx.globalAlpha = piAlpha;
        ctx.font = Math.round(120 * ts) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#58a6ff';
        ctx.fillText('π', cx, cy + 40 * ts);
      }

      // Ghost layers — all previous shapes
      for (var i = 0; i < _shapeIdx; i++) {
        var gAlpha = 0.04 + (i / SHAPES.length) * 0.06;
        var gR = baseR * (0.15 + (i / SHAPES.length) * 0.85);
        drawNgon(ctx, cx, cy, gR, SHAPES[i].n, SHAPES[i].color, gAlpha, 1);
      }

      // Current shape with vertex dots
      drawNgon(ctx, cx, cy, baseR, shape.n, shape.color, 0.75, 2.5);

      if (shape.n > 2 && shape.n < 999) {
        for (var v = 0; v < shape.n; v++) {
          var va = (v / shape.n) * TAU - PI / 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(va) * baseR, cy + Math.sin(va) * baseR, 3.5, 0, TAU);
          ctx.fillStyle = shape.color; ctx.globalAlpha = 0.7; ctx.fill();
        }
      }

      // Pop flash ring
      if (_popFlash > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * (1 + (1 - _popFlash) * 3), 0, TAU);
        ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = _popFlash * 0.4; ctx.lineWidth = 2; ctx.stroke();
        _popFlash = Math.max(0, _popFlash - dt * 0.001 * 0.6);
      }

      // Shape counter bar (bottom)
      var barY = H - 60;
      var barW = Math.min(W * 0.6, 400);
      var barX = cx - barW / 2;
      for (var si = 0; si < SHAPES.length; si++) {
        var dotX = barX + (si / (SHAPES.length - 1)) * barW;
        var isCurrent = si === _shapeIdx;
        ctx.beginPath();
        ctx.arc(dotX, barY, isCurrent ? 5 : 2.5, 0, TAU);
        ctx.fillStyle = si <= _shapeIdx ? SHAPES[si].color : '#30363d';
        ctx.globalAlpha = isCurrent ? 1 : 0.5;
        ctx.fill();
      }

      // Text — clean centered
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';

      ctx.font = 'bold ' + Math.round(44 * ts) + 'px monospace';
      ctx.fillStyle = shape.color;
      ctx.fillText(shape.name, cx, mobile ? 55 : 80);

      ctx.font = Math.round(15 * ts) + 'px monospace';
      ctx.fillStyle = '#6e7681';
      var vertStr = shape.n >= 999 ? '∞ vertices' : shape.n + (shape.n === 1 ? ' vertex' : ' vertices');
      ctx.fillText(vertStr, cx, mobile ? 73 : 105);

      ctx.font = Math.round(13 * ts) + 'px monospace';
      ctx.fillStyle = '#484f58';
      ctx.fillText(shape.desc, cx, cy + baseR + (mobile ? 28 : 40));

      if (shape.n >= 999) {
        ctx.font = 'bold ' + Math.round(22 * ts) + 'px monospace';
        ctx.fillStyle = '#58a6ff';
        ctx.fillText('n → ∞   ⟹   π emerges', cx, cy + baseR + (mobile ? 50 : 75));
        ctx.font = Math.round(13 * ts) + 'px monospace';
        ctx.fillStyle = '#3fb950';
        ctx.fillText('the discrete becomes continuous. the bubble pops.', cx, cy + baseR + (mobile ? 68 : 100));

        // Water molecule hint — π connects to water
        if (_morphT > 2) {
          var hintAlpha = Math.min(0.2, (_morphT - 2) * 0.05);
          ctx.globalAlpha = hintAlpha;
          ctx.font = Math.round(10 * ts) + 'px monospace';
          ctx.fillStyle = '#79c0ff';
          ctx.fillText('H₂O waits — /water to count every molecule in the galaxy', cx, cy + baseR + (mobile ? 88 : 120));
        }
      }

      // Autoplay indicator
      if (_autoPlay && _shapeIdx < SHAPES.length - 1) {
        ctx.globalAlpha = 0.25 + Math.sin(_t * 2) * 0.1;
        ctx.font = Math.round(9 * ts) + 'px monospace';
        ctx.fillStyle = '#484f58';
        ctx.fillText(mobile ? 'auto · tap to take control' : 'auto · click or press → to take control', cx, H - 32);
      }

      // Footer — touch-aware
      ctx.globalAlpha = 1;
      ctx.font = Math.round(10 * ts) + 'px monospace';
      ctx.fillStyle = '#30363d';
      ctx.fillText(mobile ? 'tap · swipe → advance · swipe ← back' : 'click · → to advance · ← back · ESC close', cx, H - 16);
    }

    // ═══ PHASE 1: π FOLDS ═══
    else if (_phase === 1) {
      var fold = FOLDS[_foldIdx];

      // Concentric rings for each fold
      for (var fi = 0; fi <= _foldIdx; fi++) {
        var f = FOLDS[fi];
        var fR = baseR * (0.15 + fi * 0.22);
        var curr = fi === _foldIdx;

        // Ring
        ctx.beginPath();
        ctx.arc(cx, cy, fR, 0, TAU);
        ctx.strokeStyle = f.color;
        ctx.globalAlpha = curr ? 0.7 : 0.12;
        ctx.lineWidth = curr ? 2.5 : 1;
        ctx.stroke();

        // Glow fill on current
        if (curr) {
          var fg = ctx.createRadialGradient(cx, cy, fR * 0.7, cx, cy, fR * 1.2);
          var rgb = hexToRgb(f.color);
          fg.addColorStop(0, 'rgba(' + rgb.join(',') + ',0.03)');
          fg.addColorStop(1, 'rgba(' + rgb.join(',') + ',0)');
          ctx.globalAlpha = 1;
          ctx.fillStyle = fg;
          ctx.beginPath(); ctx.arc(cx, cy, fR * 1.3, 0, TAU); ctx.fill();
        }

        // Label on ring
        ctx.globalAlpha = curr ? 0.8 : 0.25;
        ctx.font = curr ? '13px monospace' : '9px monospace';
        ctx.fillStyle = f.color;
        ctx.textAlign = 'right';
        ctx.fillText(f.label, cx + fR - 6, cy - 6);
      }

      // Center π symbol
      ctx.globalAlpha = 0.15;
      ctx.font = '80px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = fold.color;
      ctx.fillText('π', cx, cy + 28);

      // Text
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';

      ctx.font = 'bold ' + Math.round(38 * ts) + 'px monospace';
      ctx.fillStyle = fold.color;
      ctx.fillText(fold.label, cx, mobile ? 55 : 75);

      ctx.font = Math.round(18 * ts) + 'px monospace';
      ctx.fillStyle = '#c9d1d9';
      ctx.fillText(fold.name, cx, mobile ? 75 : 102);

      ctx.font = Math.round(13 * ts) + 'px monospace';
      ctx.fillStyle = '#8b949e';
      ctx.fillText(fold.desc, cx, cy + baseR + (mobile ? 30 : 45));

      ctx.font = Math.round(15 * ts) + 'px monospace';
      ctx.fillStyle = '#484f58';
      ctx.fillText('dimensional fold: ' + (fold.power === 0 ? '0D point' : fold.power === 0.5 ? '0.5D half-fold' : fold.power === 1 ? '1D circumference' : fold.power === 2 ? '2D area' : '3D volume'), cx, cy + baseR + (mobile ? 50 : 70));

      // Progress dots
      var fBarY = H - 60;
      for (var fdi = 0; fdi < FOLDS.length; fdi++) {
        var fdx = cx + (fdi - (FOLDS.length-1)/2) * 30;
        ctx.beginPath();
        ctx.arc(fdx, fBarY, fdi === _foldIdx ? 5 : 2.5, 0, TAU);
        ctx.fillStyle = fdi <= _foldIdx ? FOLDS[fdi].color : '#30363d';
        ctx.globalAlpha = fdi === _foldIdx ? 1 : 0.5;
        ctx.fill();
      }

      ctx.font = Math.round(10 * ts) + 'px monospace'; ctx.fillStyle = '#30363d'; ctx.globalAlpha = 1;
      ctx.fillText(mobile ? 'tap · swipe → advance · swipe ← back' : 'click · → to advance · ← back · ESC close', cx, H - 16);
    }

    // ═══ PHASE 2: MEDITATION ═══
    else if (_phase === 2) {
      // All shapes nested, breathing, with π at center
      for (var mi = 0; mi < SHAPES.length; mi++) {
        var mr = baseR * (0.08 + (mi / SHAPES.length) * 0.92);
        var mPulse = Math.sin(_t * 0.4 + mi * 0.4) * 0.03;
        drawNgon(ctx, cx, cy, mr * (1 + mPulse), SHAPES[mi].n, SHAPES[mi].color, 0.06 + mPulse * 0.5, 1);
      }

      // π folds as breathing rings
      for (var mf = 0; mf < FOLDS.length; mf++) {
        var mfR = baseR * (0.15 + mf * 0.25) * (1 + Math.sin(_t * 0.3 + mf) * 0.02);
        ctx.beginPath(); ctx.arc(cx, cy, mfR, 0, TAU);
        ctx.strokeStyle = FOLDS[mf].color;
        ctx.globalAlpha = 0.06 + Math.sin(_t * 0.5 + mf * 0.7) * 0.03;
        ctx.lineWidth = 1; ctx.stroke();
      }

      // Breathing π
      var piScale = 1 + Math.sin(_t * 0.6) * 0.08;
      ctx.globalAlpha = 0.35 + Math.sin(_t * 0.8) * 0.15;
      ctx.font = (60 * piScale) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#58a6ff';
      ctx.fillText('π', cx, cy + 20);

      // The shape sequence as text
      ctx.globalAlpha = 0.2;
      ctx.font = '11px monospace';
      ctx.fillStyle = '#8b949e';
      ctx.fillText('· · △ □ ⬠ ⬡ · · · · ○', cx, cy + baseR + 35);

      ctx.globalAlpha = 0.15;
      ctx.fillText('every polygon was trying to be this', cx, cy + baseR + 55);
      ctx.fillText('π⁰ → π¹ → π² → π³', cx, cy + baseR + 72);

      ctx.globalAlpha = 0.3;
      ctx.font = '10px monospace'; ctx.fillStyle = '#30363d';
      ctx.fillText('click to close · ESC', cx, H - 16);
    }

    // ═══ SOUND WAVE INDICATOR ═══
    if (_soundDecay > 0.01) {
      _soundDecay *= 0.97;
      var swX = W - 50, swY = 28;
      ctx.globalAlpha = _soundDecay * 0.5;
      ctx.strokeStyle = '#d2a8ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var sw = 0; sw < 30; sw++) {
        var swVal = Math.sin(sw * 0.5 + _t * 8) * 4 * _soundDecay;
        if (sw === 0) ctx.moveTo(swX + sw, swY + swVal);
        else ctx.lineTo(swX + sw, swY + swVal);
      }
      ctx.stroke();
      ctx.font = '8px monospace';
      ctx.fillStyle = '#d2a8ff';
      ctx.textAlign = 'right';
      ctx.fillText('♪', swX - 4, swY + 3);
    }

    // ═══ PARTICLES ═══
    for (var pi = _particles.length - 1; pi >= 0; pi--) {
      var p = _particles[pi];
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.97; p.vy *= 0.97;
      p.life -= dt * 0.001 * 0.4;
      if (p.life <= 0) { _particles.splice(pi, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, TAU);
      ctx.fillStyle = 'hsl(' + p.hue + ',70%,65%)';
      ctx.globalAlpha = p.life * 0.5;
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  // ═══ LIFECYCLE ═══
  function activate(addEntry, onDone) {
    if (_active) { deactivate(); return false; }
    _onDeactivate = onDone || null;
    createCanvas();
    _active = true;
    _phase = 0; _shapeIdx = 0; _foldIdx = 0; _morphT = 0;
    _autoPlay = true; _t = 0; _popFlash = 0; _particles = [];
    _soundDecay = 0;
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

    // Report what was seen
    var journey = { phase: _phase, shapeIdx: _shapeIdx, foldIdx: _foldIdx,
      shapeName: _phase === 0 ? SHAPES[Math.min(_shapeIdx, SHAPES.length-1)].name : null,
      foldName: _phase >= 1 ? FOLDS[Math.min(_foldIdx, FOLDS.length-1)].name : null,
      reachedCircle: _shapeIdx >= SHAPES.length - 1,
      reachedFolds: _phase >= 1,
      completed: _phase >= 2 };
    if (_onDeactivate) { try { _onDeactivate(journey); } catch(e) {} }
  }

  window._bubblePop = {
    activate: activate,
    deactivate: deactivate,
    isActive: function() { return _active; },
    currentShape: function() {
      if (!_active) return null;
      if (_phase === 0) return SHAPES[Math.min(_shapeIdx, SHAPES.length-1)];
      if (_phase === 1) return { n: 999, name: 'π fold', color: FOLDS[Math.min(_foldIdx, FOLDS.length-1)].color };
      return { n: 999, name: 'meditation', color: '#58a6ff' };
    },
  };
})();
