// third-eye.js v2 — the nose is the third eye
// it points. it triangulates. it is the most forward sensor.
// two eyes = stereo pair. nose tip = the singular point.
// together: a triangle. the first closed shape (n=3, from bubble-pop).
// the vertical line — philtrum, septum — where left meets right.
// it fused in the womb. when it doesn't: cleft. when it splits: pain.
// smell is the oldest sense. directly wired to memory and emotion.
// the face is a sensing membrane. the nose is its leading edge.
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══ THE GEOMETRY ═══
  var CONCEPTS = [
    { id: 'triangle',
      title: 'the sensing triangle',
      desc: 'two eyes and a nose. the first closed shape on the body.',
      detail: 'stereo vision gives depth. the nose gives direction. together: a triangle — the simplest polygon that encloses space. n=3 from bubble-pop.',
      color: '#58a6ff' },
    { id: 'point',
      title: 'the leading point',
      desc: 'the tip of the nose is the furthest forward point on the body.',
      detail: 'it enters every room first. it points where attention goes. it is the body\'s cursor. the electron of the face — a point that senses.',
      color: '#d2a8ff' },
    { id: 'smell',
      title: 'the oldest sense',
      desc: 'olfaction. directly wired to the limbic system. memory and emotion.',
      detail: '400 receptor types. 1 trillion distinguishable odors. no thalamic relay — smell goes straight to the amygdala. the most primal sense.',
      color: '#3fb950' },
    { id: 'split',
      title: 'the vertical line',
      desc: 'the philtrum. the septum. where left meets right.',
      detail: 'the face forms from three plates that fuse in week 7. the seam runs from forehead through nose to lip. bilateral symmetry — a π-fold of left/right. when it doesn\'t fuse: cleft lip. when it aches: the fold is felt.',
      color: '#e85d3a' },
    { id: 'breath',
      title: 'the breath gate',
      desc: 'inhale through two nostrils. the air spirals.',
      detail: 'nasal turbinates create vortex flow. left nostril = parasympathetic (calm). right = sympathetic (alert). they alternate every 2-3 hours. the ultradian rhythm. breathing is a π-oscillation.',
      color: '#79c0ff' },
    { id: 'bridge',
      title: 'the bridge',
      desc: 'the nasal bridge connects brow to tip. bone to cartilage.',
      detail: 'bone above, cartilage below. the transition from rigid to flexible. from skull to sensing tip. like the mol — a bridge between hard structure and soft information.',
      color: '#f0883e' },
    { id: 'fold',
      title: 'the face as fold',
      desc: 'the face is a membrane. it folds inward at every opening.',
      detail: 'eyes fold in (pupils). nostrils fold in (turbinates). mouth folds in (tongue). ears fold in (cochlea). every sense organ is a fold — outside becoming inside. the face is a topology of folds. each fold is a π-turn of reality sensing itself.',
      color: '#d2a8ff' },
  ];

  var _canvas, _ctx, _active = false, _t = 0, _lastFrame = 0;
  var _conceptIdx = 0, _phase = 0; // 0=concepts, 1=meditation
  var _autoPlay = true, _autoTimer = 0, _zoomT = 0;
  var _soundDecay = 0, _audioCtx = null, _currentOsc = null;
  var _onDeactivate = null;
  var _touchStartX = 0, _touchStartY = 0;
  var _tiltX = 0, _tiltY = 0;
  var _gyroListener = null;

  // ═══ SOUND ═══
  function initAudio() {
    if (_audioCtx) return;
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }

  function playConceptTone(idx) {
    if (!_audioCtx) return;
    try {
      if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.03); } catch(e){} _currentOsc = null; }
      // Breath-like tones: each concept gets a different harmonic
      var harmonics = [1, 1.5, PI/2, 2, PI, 2.5, PI*PI/3];
      var freq = 220 * harmonics[idx % harmonics.length];
      var osc = _audioCtx.createOscillator();
      var gain = _audioCtx.createGain();
      osc.connect(gain); gain.connect(_audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.05, _audioCtx.currentTime + 0.15);
      gain.gain.setTargetAtTime(0, _audioCtx.currentTime + 2.0, 0.6);
      osc.start(); osc.stop(_audioCtx.currentTime + 4);
      _currentOsc = { o: osc, g: gain };
      _soundDecay = 1;
    } catch(e) {}
  }

  // ═══ CANVAS ═══
  function createCanvas() {
    if (_canvas) return;
    _canvas = document.createElement('canvas');
    _canvas.id = 'third-eye-canvas';
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
    _canvas.addEventListener('touchstart', function(e) {
      if (!_active || !e.touches.length) return;
      _touchStartX = e.touches[0].clientX; _touchStartY = e.touches[0].clientY;
    }, { passive: true });
    _canvas.addEventListener('touchend', function(e) {
      if (!_active) return;
      var ch = e.changedTouches && e.changedTouches[0];
      if (!ch) { _autoPlay = false; advance(); return; }
      var dx = ch.clientX - _touchStartX;
      var dist = Math.sqrt(dx * dx + Math.pow(ch.clientY - _touchStartY, 2));
      if (dist < 20) { _autoPlay = false; advance(); }
      else if (dist > 40 && Math.abs(dx) > Math.abs(ch.clientY - _touchStartY)) {
        _autoPlay = false;
        if (dx > 0) advance(); else retreat();
      }
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', function() { if (_canvas) { _canvas.width = window.innerWidth; _canvas.height = window.innerHeight; } });
    // Gyroscope — tilt the face
    if ('DeviceOrientationEvent' in window && !_gyroListener) {
      _gyroListener = function(e) {
        if (e.gamma !== null) _tiltX = e.gamma * 0.01; // left-right tilt
        if (e.beta !== null) _tiltY = (e.beta - 45) * 0.008; // forward-back tilt (centered at 45°)
      };
      window.addEventListener('deviceorientation', _gyroListener);
    }
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
      if (_conceptIdx < CONCEPTS.length - 1) { _conceptIdx++; _autoTimer = 0; playConceptTone(_conceptIdx); }
      else { _phase = 1; _autoTimer = 0; }
    } else { deactivate(); }
  }

  function retreat() {
    _autoPlay = false;
    if (_phase === 1) { _phase = 0; _conceptIdx = CONCEPTS.length - 1; }
    else if (_phase === 0 && _conceptIdx > 0) { _conceptIdx--; _zoomT = 0; }
  }

  // ═══ FACE DRAWING ═══
  function drawFaceTriangle(ctx, cx, cy, R, t, concept) {
    var breath = 1 + Math.sin(t * PI * 0.3) * 0.02;
    // Gyro tilt — face follows device orientation
    cx += _tiltX * R * 0.5;
    cy += _tiltY * R * 0.3;
    var triH = R * 1.4 * breath;
    var triW = R * 1.0 * breath;

    // Eye positions
    var eyeL = { x: cx - triW * 0.5, y: cy - triH * 0.25 };
    var eyeR = { x: cx + triW * 0.5, y: cy - triH * 0.25 };
    // Nose tip
    var nose = { x: cx, y: cy + triH * 0.35 };

    // The triangle — sensing triangle
    ctx.beginPath();
    ctx.moveTo(eyeL.x, eyeL.y);
    ctx.lineTo(eyeR.x, eyeR.y);
    ctx.lineTo(nose.x, nose.y);
    ctx.closePath();
    ctx.strokeStyle = concept.color;
    ctx.globalAlpha = 0.15 + Math.sin(t * 0.5) * 0.05;
    ctx.lineWidth = 1; ctx.stroke();

    // Fill — very faint
    ctx.globalAlpha = 0.02;
    ctx.fillStyle = concept.color;
    ctx.fill();

    // The vertical line — bilateral fold
    var splitAlpha = concept.id === 'split' ? 0.5 : 0.08;
    ctx.globalAlpha = splitAlpha + Math.sin(t * 0.7) * 0.03;
    ctx.strokeStyle = '#e85d3a';
    ctx.lineWidth = concept.id === 'split' ? 2 : 0.8;
    ctx.setLineDash(concept.id === 'split' ? [] : [4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy - triH * 0.5);
    ctx.lineTo(cx, cy + triH * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Eyes — as circles (sensing folds)
    var eyeR2 = R * 0.08;
    var eyeOpen = concept.id === 'fold' ? 0.6 + Math.sin(t * 2) * 0.4 : 1;

    // Left eye
    ctx.beginPath(); ctx.arc(eyeL.x, eyeL.y, eyeR2, 0, TAU);
    ctx.strokeStyle = '#58a6ff'; ctx.globalAlpha = 0.4; ctx.lineWidth = 1.5; ctx.stroke();
    // Pupil
    ctx.beginPath(); ctx.arc(eyeL.x, eyeL.y, eyeR2 * 0.35 * eyeOpen, 0, TAU);
    ctx.fillStyle = '#020408'; ctx.globalAlpha = 0.8; ctx.fill();
    // Iris glow
    ctx.beginPath(); ctx.arc(eyeL.x, eyeL.y, eyeR2 * 0.6, 0, TAU);
    ctx.strokeStyle = '#58a6ff'; ctx.globalAlpha = 0.15; ctx.lineWidth = 0.5; ctx.stroke();

    // Right eye
    ctx.beginPath(); ctx.arc(eyeR.x, eyeR.y, eyeR2, 0, TAU);
    ctx.strokeStyle = '#58a6ff'; ctx.globalAlpha = 0.4; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(eyeR.x, eyeR.y, eyeR2 * 0.35 * eyeOpen, 0, TAU);
    ctx.fillStyle = '#020408'; ctx.globalAlpha = 0.8; ctx.fill();
    ctx.beginPath(); ctx.arc(eyeR.x, eyeR.y, eyeR2 * 0.6, 0, TAU);
    ctx.strokeStyle = '#58a6ff'; ctx.globalAlpha = 0.15; ctx.lineWidth = 0.5; ctx.stroke();

    // Nose — the third eye, the point
    var noseGlow = concept.id === 'point' || concept.id === 'triangle' ? 0.7 : 0.3;
    var nosePulse = 1 + Math.sin(t * 2.5) * 0.15;
    ctx.beginPath(); ctx.arc(nose.x, nose.y, R * 0.04 * nosePulse, 0, TAU);
    ctx.fillStyle = concept.color;
    ctx.globalAlpha = noseGlow; ctx.fill();

    // Nose glow rings
    for (var nr = 0; nr < 3; nr++) {
      ctx.beginPath(); ctx.arc(nose.x, nose.y, R * (0.06 + nr * 0.04) * nosePulse, 0, TAU);
      ctx.strokeStyle = concept.color;
      ctx.globalAlpha = 0.08 * (3 - nr) / 3;
      ctx.lineWidth = 0.5; ctx.stroke();
    }

    // Nostrils — two small curves (breath gates)
    if (concept.id === 'breath' || concept.id === 'fold') {
      var nostrilY = nose.y - R * 0.02;
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#79c0ff'; ctx.lineWidth = 1;
      // Left nostril
      ctx.beginPath();
      ctx.arc(cx - R * 0.03, nostrilY, R * 0.025, 0.3, PI - 0.3);
      ctx.stroke();
      // Right nostril
      ctx.beginPath();
      ctx.arc(cx + R * 0.03, nostrilY, R * 0.025, 0.3, PI - 0.3);
      ctx.stroke();

      // Breath flow — spiraling air with ultradian rhythm
      if (concept.id === 'breath') {
        var breathPhase = t * 1.5;
        var inhale = Math.sin(breathPhase) > 0;
        var breathAmt = Math.abs(Math.sin(breathPhase));

        // Ultradian rhythm indicator — which nostril is dominant
        var ultradianPhase = (t * 0.005) % 1; // cycles slowly
        var leftDominant = ultradianPhase < 0.5;

        // Left nostril flow
        var leftAlpha = leftDominant ? 0.25 : 0.06;
        ctx.globalAlpha = leftAlpha * breathAmt;
        ctx.strokeStyle = '#79c0ff'; ctx.lineWidth = 1;
        for (var bi = 0; bi < 10; bi++) {
          var by = nose.y + (inhale ? -1 : 1) * (bi * 5 + breathAmt * 8);
          var bx = cx - R * 0.03 + Math.sin(bi * 0.9 + t * 3) * (3 + bi * 1.2);
          ctx.beginPath(); ctx.arc(bx, by, 1 + bi * 0.1, 0, TAU); ctx.stroke();
        }

        // Right nostril flow
        var rightAlpha = !leftDominant ? 0.25 : 0.06;
        ctx.globalAlpha = rightAlpha * breathAmt;
        ctx.strokeStyle = '#e85d3a';
        for (var bj = 0; bj < 10; bj++) {
          var by2 = nose.y + (inhale ? -1 : 1) * (bj * 5 + breathAmt * 8);
          var bx2 = cx + R * 0.03 + Math.sin(bj * 0.9 + t * 3 + 1) * (3 + bj * 1.2);
          ctx.beginPath(); ctx.arc(bx2, by2, 1 + bj * 0.1, 0, TAU); ctx.stroke();
        }

        // Breath counter — cycles per minute
        ctx.globalAlpha = 0.2;
        ctx.font = '8px monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = inhale ? '#79c0ff' : '#e85d3a';
        ctx.fillText(inhale ? 'inhale' : 'exhale', cx, nose.y + R * 0.2);

        // Dominant nostril label
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = leftDominant ? '#79c0ff' : '#e85d3a';
        ctx.fillText(leftDominant ? '← parasympathetic (calm)' : 'sympathetic (alert) →', cx, nose.y + R * 0.27);
      }
    }

    // Philtrum — the vertical groove + embryonic fusion animation
    if (concept.id === 'split') {
      // The seam
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#e85d3a'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, nose.y + R * 0.03);
      ctx.lineTo(cx, nose.y + R * 0.14);
      ctx.stroke();
      // Seam glow
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#e85d3a';
      ctx.fillRect(cx - 1, nose.y + R * 0.03, 2, R * 0.11);

      // Embryonic fusion — three plates approaching
      var fuseT = (Math.sin(t * 0.4) + 1) * 0.5; // 0 to 1, oscillating
      var gap = R * 0.08 * (1 - fuseT);

      // Left plate
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#e85d3a';
      ctx.beginPath();
      ctx.moveTo(cx - gap - R * 0.15, cy - triH * 0.3);
      ctx.lineTo(cx - gap, cy);
      ctx.lineTo(cx - gap - R * 0.12, cy + triH * 0.2);
      ctx.closePath(); ctx.fill();

      // Right plate
      ctx.beginPath();
      ctx.moveTo(cx + gap + R * 0.15, cy - triH * 0.3);
      ctx.lineTo(cx + gap, cy);
      ctx.lineTo(cx + gap + R * 0.12, cy + triH * 0.2);
      ctx.closePath(); ctx.fill();

      // Top plate (frontonasal)
      ctx.fillStyle = '#f0883e'; ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.1, cy - triH * 0.35 - gap * 0.5);
      ctx.lineTo(cx + R * 0.1, cy - triH * 0.35 - gap * 0.5);
      ctx.lineTo(cx, cy - triH * 0.15 - gap * 0.3);
      ctx.closePath(); ctx.fill();

      // Week 7 label
      ctx.globalAlpha = 0.15; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#e85d3a';
      ctx.fillText('week 7: fusion', cx, cy + triH * 0.45);
      ctx.globalAlpha = fuseT * 0.15;
      ctx.fillText(fuseT > 0.8 ? 'fused ✓' : 'fusing…', cx, cy + triH * 0.45 + 12);
    }

    // Connection lines from eyes to nose (triangulation)
    if (concept.id === 'triangle') {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(eyeL.x, eyeL.y); ctx.lineTo(nose.x, nose.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(eyeR.x, eyeR.y); ctx.lineTo(nose.x, nose.y); ctx.stroke();
      ctx.setLineDash([]);

      // Depth convergence point
      var convDist = R * 0.6;
      var convX = cx;
      var convY = cy - convDist;
      ctx.globalAlpha = 0.15;
      ctx.beginPath(); ctx.arc(convX, convY, 3, 0, TAU);
      ctx.fillStyle = '#3fb950'; ctx.fill();
      ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('convergence', convX, convY - 8);

      // n=3 label — connection to bubble-pop
      ctx.globalAlpha = 0.12;
      ctx.font = '9px monospace';
      ctx.fillStyle = '#f0883e';
      ctx.fillText('n = 3', cx + triW * 0.4, cy + triH * 0.15);
      ctx.font = '7px monospace'; ctx.globalAlpha = 0.08;
      ctx.fillText('the first closed shape', cx + triW * 0.4, cy + triH * 0.15 + 10);

      // Vertex dots at the three corners
      [eyeL, eyeR, nose].forEach(function(v, vi) {
        ctx.beginPath(); ctx.arc(v.x, v.y, 4, 0, TAU);
        ctx.strokeStyle = '#f0883e'; ctx.globalAlpha = 0.2; ctx.lineWidth = 1; ctx.stroke();
      });
    }

    // Smell waves
    if (concept.id === 'smell') {
      for (var si = 0; si < 5; si++) {
        var sw = R * (0.08 + si * 0.06);
        var sa = 0.1 * (5 - si) / 5 * (0.5 + Math.sin(t * 1.2 + si * 0.5) * 0.5);
        ctx.beginPath(); ctx.arc(nose.x, nose.y, sw, -PI * 0.7, -PI * 0.3);
        ctx.strokeStyle = '#3fb950'; ctx.globalAlpha = sa; ctx.lineWidth = 1; ctx.stroke();
      }
    }

    // Fold indicators — inward arrows at each opening
    if (concept.id === 'fold') {
      var folds = [
        { x: eyeL.x, y: eyeL.y, label: 'eye' },
        { x: eyeR.x, y: eyeR.y, label: 'eye' },
        { x: nose.x, y: nose.y, label: 'nose' },
        { x: cx, y: nose.y + R * 0.18, label: 'mouth' },
        { x: cx - R * 0.55, y: cy - triH * 0.1, label: 'ear' },
        { x: cx + R * 0.55, y: cy - triH * 0.1, label: 'ear' },
      ];
      folds.forEach(function(f) {
        // Spiral inward
        ctx.beginPath();
        for (var fi = 0; fi < 20; fi++) {
          var fa = fi * 0.4 + t * 1.5;
          var fr = R * 0.015 * (20 - fi) / 20;
          var fx = f.x + Math.cos(fa) * fr;
          var fy = f.y + Math.sin(fa) * fr;
          fi === 0 ? ctx.moveTo(fx, fy) : ctx.lineTo(fx, fy);
        }
        ctx.strokeStyle = '#d2a8ff'; ctx.globalAlpha = 0.2; ctx.lineWidth = 0.8; ctx.stroke();
      });
    }
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
    var R = Math.min(W, H) * 0.25;

    _zoomT = Math.min(1, _zoomT + dt * 0.001 * 1.5);
    var zoomEase = _zoomT < 1 ? 1 - Math.pow(1 - _zoomT, 3) : 1;

    // Autoplay
    if (_autoPlay) {
      _autoTimer += dt * 0.001;
      var interval = _phase === 0 ? 5.0 : 8.0;
      if (_autoTimer > interval) advance();
    }

    // Background
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, W, H);

    // Warm radial
    var bgGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2);
    bgGrd.addColorStop(0, 'rgba(40,25,30,0.06)');
    bgGrd.addColorStop(1, 'rgba(2,4,8,0)');
    ctx.fillStyle = bgGrd; ctx.fillRect(0, 0, W, H);

    // Close button
    ctx.globalAlpha = 0.2; ctx.font = '16px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#8b949e';
    ctx.fillText('✕', 14, 24);
    ctx.globalAlpha = 0.15; ctx.font = '8px monospace';
    ctx.fillText(_phase === 0 ? 'third eye' : 'the fold', 36, 22);

    if (_phase === 0) {
      var concept = CONCEPTS[_conceptIdx];

      // Draw the face triangle with concept-specific details
      drawFaceTriangle(ctx, cx, cy, R, _t, concept);

      // Text
      ctx.globalAlpha = zoomEase;
      ctx.textAlign = 'center';

      ctx.font = 'bold ' + Math.round(30 * ts2) + 'px monospace';
      ctx.fillStyle = concept.color;
      ctx.fillText(concept.title, cx, mobile ? 40 : 55);

      ctx.font = Math.round(13 * ts2) + 'px monospace';
      ctx.fillStyle = '#c9d1d9';
      ctx.fillText(concept.desc, cx, mobile ? 58 : 78);

      // Detail text — wrapped if needed
      ctx.font = Math.round(10 * ts2) + 'px monospace';
      ctx.fillStyle = '#484f58';
      var detail = concept.detail;
      if (detail.length > 80 && !mobile) {
        var mid = detail.lastIndexOf(' ', 80);
        ctx.fillText(detail.substring(0, mid), cx, H - (mobile ? 65 : 82));
        ctx.fillText(detail.substring(mid + 1), cx, H - (mobile ? 50 : 66));
      } else if (detail.length > 55 && mobile) {
        var mid2 = detail.lastIndexOf(' ', 55);
        ctx.fillText(detail.substring(0, mid2), cx, H - 65);
        var rest = detail.substring(mid2 + 1);
        if (rest.length > 55) {
          var mid3 = rest.lastIndexOf(' ', 55);
          ctx.fillText(rest.substring(0, mid3), cx, H - 50);
          ctx.fillText(rest.substring(mid3 + 1), cx, H - 35);
        } else {
          ctx.fillText(rest, cx, H - 50);
        }
      } else {
        ctx.fillText(detail, cx, H - (mobile ? 55 : 70));
      }

      // Autoplay hint
      if (_autoPlay && _conceptIdx < CONCEPTS.length - 1) {
        ctx.globalAlpha = 0.2 + Math.sin(_t * 2) * 0.08;
        ctx.font = Math.round(9 * ts2) + 'px monospace'; ctx.fillStyle = '#484f58';
        ctx.fillText(mobile ? 'auto · tap to take control' : 'auto · click or → to take control', cx, H - 25);
      }

      // Progress dots
      var dotY = H - 12;
      for (var di = 0; di < CONCEPTS.length; di++) {
        var ddx = cx + (di - (CONCEPTS.length - 1) / 2) * 20;
        var dc = di === _conceptIdx;
        ctx.beginPath(); ctx.arc(ddx, dotY, dc ? 3.5 + Math.sin(_t * 3) * 0.8 : 1.5, 0, TAU);
        ctx.fillStyle = di <= _conceptIdx ? CONCEPTS[di].color : '#21262d';
        ctx.globalAlpha = dc ? 0.9 : 0.35; ctx.fill();
      }
    }

    // ═══ PHASE 1: MEDITATION — all concepts at once ═══
    else if (_phase === 1) {
      // Cycle through concept visualizations — each one gets 3 seconds
      var cyclePeriod = 3.5;
      var cycleIdx = Math.floor((_t % (cyclePeriod * CONCEPTS.length)) / cyclePeriod);
      var cycleConcept = CONCEPTS[cycleIdx % CONCEPTS.length];

      // Draw the face with cycling concept details
      drawFaceTriangle(ctx, cx, cy, R, _t, cycleConcept);

      // Rotating concept labels around the face with trails
      CONCEPTS.forEach(function(c, ci) {
        var orbit = R * 0.65 + ci * 14;
        var angle = _t * 0.1 + ci * (TAU / CONCEPTS.length);
        var px = cx + Math.cos(angle) * orbit;
        var py = cy + Math.sin(angle) * orbit;
        var isCycle = ci === cycleIdx % CONCEPTS.length;

        // Trail arc
        ctx.beginPath();
        for (var tr = 0; tr < 12; tr++) {
          var ta = angle - (tr / 12) * PI * 0.3;
          var tx = cx + Math.cos(ta) * orbit;
          var ty = cy + Math.sin(ta) * orbit;
          tr === 0 ? ctx.moveTo(tx, ty) : ctx.lineTo(tx, ty);
        }
        ctx.strokeStyle = c.color; ctx.globalAlpha = 0.04; ctx.lineWidth = 1.5; ctx.stroke();

        // Dot
        var dotR = isCycle ? 4 + Math.sin(_t * 3) * 1 : 2;
        ctx.beginPath(); ctx.arc(px, py, dotR, 0, TAU);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = isCycle ? 0.7 : 0.2 + Math.sin(_t + ci) * 0.1;
        ctx.fill();

        ctx.font = (isCycle ? 'bold 9' : '7') + 'px monospace'; ctx.textAlign = 'center';
        ctx.globalAlpha = isCycle ? 0.6 : 0.2;
        ctx.fillText(c.id, px, py - dotR - 3);
      });

      // Center text
      ctx.globalAlpha = 0.25 + Math.sin(_t * 0.3) * 0.05;
      ctx.font = Math.round(11 * ts2) + 'px monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = '#8b949e';
      var msgY = cy + R * 0.6;
      ctx.fillText('the third eye is on the tip of your nose', cx, msgY);
      ctx.fillText('it points. it triangulates. it senses.', cx, msgY + 18);
      ctx.fillText('the vertical line — where left meets right — can hurt', cx, msgY + 36);

      ctx.globalAlpha = 0.12;
      ctx.fillText('the face is a sensing membrane', cx, msgY + 58);
      ctx.fillText('every opening is a fold — outside becoming inside', cx, msgY + 74);
      ctx.fillText('each fold is a π-turn of reality sensing itself', cx, msgY + 90);

      if (_autoTimer > 4) {
        ctx.globalAlpha = Math.min(0.15, (_autoTimer - 4) * 0.02);
        ctx.fillText('the electron is a point with an infinite tail', cx, msgY + 112);
        ctx.fillText('the nose tip is a point with an infinite smell', cx, msgY + 128);
      }

      ctx.globalAlpha = 0.3;
      ctx.font = Math.round(9 * ts2) + 'px monospace'; ctx.fillStyle = '#30363d';
      ctx.fillText('click to close · ESC', cx, H - 14);
    }

    // Sound indicator
    if (_soundDecay > 0.01) {
      _soundDecay *= 0.96;
      ctx.save(); ctx.globalAlpha = _soundDecay * 0.4;
      ctx.strokeStyle = '#d2a8ff'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var wi = 0; wi < 20; wi++) {
        var wx = W - 50 + wi * 2;
        var wy = 25 + Math.sin(wi * 0.7 + _t * 6) * 5 * _soundDecay;
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
    createCanvas();
    _active = true;
    _phase = 0; _conceptIdx = 0;
    _autoPlay = true; _autoTimer = 0; _t = 0; _zoomT = 0;
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
    if (_gyroListener) { window.removeEventListener('deviceorientation', _gyroListener); _gyroListener = null; }
    var journey = {
      phase: _phase, conceptIdx: _conceptIdx,
      conceptName: CONCEPTS[Math.min(_conceptIdx, CONCEPTS.length-1)].id,
      completed: _phase >= 1,
    };
    if (_onDeactivate) { try { _onDeactivate(journey); } catch(e) {} }
  }

  window._thirdEye = {
    activate: activate,
    deactivate: deactivate,
    isActive: function() { return _active; },
    currentConcept: function() {
      if (!_active) return null;
      var c = CONCEPTS[Math.min(_conceptIdx, CONCEPTS.length-1)];
      return { name: c.id, color: c.color };
    },
  };
})();
