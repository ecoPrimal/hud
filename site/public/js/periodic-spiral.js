// periodic-spiral.js v2 — Mendeleev's spiral from the center of being
// proton · neutron · electron — the hole that has holes.
// Hydrogen first. Then the spiral: 2, 8, 8, 18, 18, 32, 32.
// Each shell is 2n². The quantum numbers ARE π.
// mp/me ≈ 1836 ≈ 6π⁵. The mass ratio is a π-fold.
// Carbon is not the first — hydrogen is. But carbon is where life begins to fold.
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══ THE THREE PARTICLES — the center of being ═══
  var PARTICLES = [
    { name: 'electron', symbol: 'e⁻', mass: 9.109e-31, massExp: -31,
      color: '#58a6ff', radius: 'point', spin: '½',
      desc: 'the point with the infinite tail. holographic. massless in one frame, everything in another.',
      piExpr: 'me = 9.109 × 10⁻³¹ kg', nature: 'lepton — indivisible' },
    { name: 'proton',   symbol: 'p⁺', mass: 1.673e-27, massExp: -27,
      color: '#e85d3a', radius: '0.87 fm', spin: '½',
      desc: 'two up quarks, one down. held by the strong force. the positive hole.',
      piExpr: 'mp = 1.673 × 10⁻²⁷ kg', nature: 'baryon — 3 quarks' },
    { name: 'neutron',  symbol: 'n⁰', mass: 1.675e-27, massExp: -27,
      color: '#8b949e', radius: '0.87 fm', spin: '½',
      desc: 'two down quarks, one up. neutral. decays alone in 15 min. stable only in nuclei.',
      piExpr: 'mn = 1.675 × 10⁻²⁷ kg', nature: 'baryon — 3 quarks' },
  ];

  // ═══ THE MASS RATIO — the great π-fold ═══
  var MASS_RATIO = {
    value: 1836.15267,
    piExpr: '6π⁵ ≈ 1836.12',
    desc: 'proton is 1836× heavier than electron. this ratio ≈ 6π⁵. a five-dimensional π-fold.',
  };

  // ═══ THE ELEMENTS — Mendeleev's spiral ═══
  // Shell sizes: 2n² → 2, 8, 18, 32
  // Period lengths: 2, 8, 8, 18, 18, 32, 32
  var SHELLS = [
    { n: 1, capacity: 2,  label: 'n=1 · 1s' },
    { n: 2, capacity: 8,  label: 'n=2 · 2s 2p' },
    { n: 3, capacity: 8,  label: 'n=3 · 3s 3p' },
    { n: 4, capacity: 18, label: 'n=4 · 3d 4s 4p' },
    { n: 5, capacity: 18, label: 'n=5 · 4d 5s 5p' },
    { n: 6, capacity: 32, label: 'n=6 · 4f 5d 6s 6p' },
    { n: 7, capacity: 32, label: 'n=7 · 5f 6d 7s 7p' },
  ];

  // Key elements — the ones that matter most
  var ELEMENTS = [
    { z: 1,  sym: 'H',  name: 'hydrogen',   mass: 1.008,   color: '#ffffff',
      desc: 'the first. one proton, one electron. the simplest atom. where Mendeleev began.',
      life: true, water: true, shell: 1 },
    { z: 2,  sym: 'He', name: 'helium',     mass: 4.003,   color: '#d2a8ff',
      desc: 'two protons. noble. born in the Big Bang. fills shell n=1.',
      life: false, water: false, shell: 1 },
    { z: 3,  sym: 'Li', name: 'lithium',    mass: 6.941,   color: '#e85d3a',
      desc: 'three protons. the lightest metal. born in the Big Bang too.',
      life: false, water: false, shell: 2 },
    { z: 6,  sym: 'C',  name: 'carbon',     mass: 12.011,  color: '#3fb950',
      desc: 'six protons. four bonds. the backbone of life. tetrahedron.',
      life: true, water: false, shell: 2 },
    { z: 7,  sym: 'N',  name: 'nitrogen',   mass: 14.007,  color: '#79c0ff',
      desc: 'seven protons. in every amino acid, every DNA base. the breath.',
      life: true, water: false, shell: 2 },
    { z: 8,  sym: 'O',  name: 'oxygen',     mass: 15.999,  color: '#e85d3a',
      desc: 'eight protons. the O in H₂O. the breath. the rust. the fire.',
      life: true, water: true, shell: 2 },
    { z: 10, sym: 'Ne', name: 'neon',       mass: 20.180,  color: '#f0883e',
      desc: 'ten protons. noble. fills shell n=2. glows orange-red.',
      life: false, water: false, shell: 2 },
    { z: 11, sym: 'Na', name: 'sodium',     mass: 22.990,  color: '#d29922',
      desc: 'eleven. one electron past noble neon. dissolved in every ocean.',
      life: true, water: false, shell: 3 },
    { z: 12, sym: 'Mg', name: 'magnesium',  mass: 24.305,  color: '#5ab87a',
      desc: 'twelve. center of chlorophyll. photosynthesis starts here.',
      life: true, water: false, shell: 3 },
    { z: 15, sym: 'P',  name: 'phosphorus', mass: 30.974,  color: '#a371f7',
      desc: 'fifteen. backbone of DNA. in every ATP. the energy currency.',
      life: true, water: false, shell: 3 },
    { z: 16, sym: 'S',  name: 'sulfur',     mass: 32.065,  color: '#d29922',
      desc: 'sixteen. disulfide bridges fold proteins. hot springs smell.',
      life: true, water: false, shell: 3 },
    { z: 17, sym: 'Cl', name: 'chlorine',   mass: 35.453,  color: '#58a6ff',
      desc: 'seventeen. dissolved in oceans as chloride. essential for nerves.',
      life: true, water: false, shell: 3 },
    { z: 19, sym: 'K',  name: 'potassium',  mass: 39.098,  color: '#a371f7',
      desc: 'nineteen. nerve impulses. banana element. K for kalium.',
      life: true, water: false, shell: 4 },
    { z: 20, sym: 'Ca', name: 'calcium',    mass: 40.078,  color: '#ffffff',
      desc: 'twenty. bones. shells. teeth. signals. the structure element.',
      life: true, water: false, shell: 4 },
    { z: 26, sym: 'Fe', name: 'iron',       mass: 55.845,  color: '#e85d3a',
      desc: 'twenty-six. most stable nucleus. where stellar fusion stops. the red of blood.',
      life: true, water: false, shell: 4 },
    { z: 29, sym: 'Cu', name: 'copper',     mass: 63.546,  color: '#f0883e',
      desc: 'twenty-nine. electron transport. blue blood in crustaceans.',
      life: true, water: false, shell: 4 },
    { z: 30, sym: 'Zn', name: 'zinc',       mass: 65.38,   color: '#8b949e',
      desc: 'thirty. in 300+ enzymes. zinc fingers grip DNA.',
      life: true, water: false, shell: 4 },
    { z: 47, sym: 'Ag', name: 'silver',     mass: 107.87,  color: '#c9d1d9',
      desc: 'forty-seven. best conductor. mirrors. antimicrobial.',
      life: false, water: false, shell: 5 },
    { z: 53, sym: 'I',  name: 'iodine',     mass: 126.90,  color: '#a371f7',
      desc: 'fifty-three. thyroid needs it. seaweed concentrates it.',
      life: true, water: false, shell: 5 },
    { z: 79, sym: 'Au', name: 'gold',       mass: 196.97,  color: '#d29922',
      desc: 'seventy-nine. forged in neutron star mergers. does not corrode.',
      life: false, water: false, shell: 6 },
    { z: 82, sym: 'Pb', name: 'lead',       mass: 207.2,   color: '#484f58',
      desc: 'eighty-two. end of the decay chains. stable. heavy.',
      life: false, water: false, shell: 6 },
    { z: 92, sym: 'U',  name: 'uranium',    mass: 238.03,  color: '#3fb950',
      desc: 'ninety-two. heaviest natural element. radioactive. powers stars differently.',
      life: false, water: false, shell: 7 },
  ];

  // ═══ STATE ═══
  var _canvas, _ctx, _active = false, _t = 0, _lastFrame = 0;
  var _phase = 0;          // 0=particles, 1=spiral, 2=connections, 3=meditation
  var _particleIdx = 0;    // which particle we're looking at
  var _elementIdx = 0;     // which element in the spiral
  var _shellIdx = 0;       // which shell ring
  var _autoPlay = true, _autoTimer = 0;
  var _zoomT = 0, _soundDecay = 0;
  var _audioCtx = null, _currentOsc = null;
  var _onDeactivate = null;
  var _touchStartX = 0, _touchStartY = 0;
  var _particles = [];     // visual particles

  // ═══ SOUND ═══
  function initAudio() {
    if (_audioCtx) return;
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }

  function playElementTone(z) {
    if (!_audioCtx) return;
    try {
      if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.03); } catch(e){} _currentOsc = null; }
      // Map atomic number to pentatonic: heavier = higher
      var semitones = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
      var noteIdx = Math.min(Math.floor(z / 10), semitones.length - 1);
      var freq = 196 * Math.pow(2, semitones[noteIdx] / 12);
      var osc = _audioCtx.createOscillator();
      var gain = _audioCtx.createGain();
      osc.connect(gain); gain.connect(_audioCtx.destination);
      osc.type = z <= 2 ? 'sine' : z <= 18 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.06, _audioCtx.currentTime + 0.06);
      gain.gain.setTargetAtTime(0, _audioCtx.currentTime + 1.2, 0.3);
      osc.start(); osc.stop(_audioCtx.currentTime + 2.5);
      _currentOsc = { o: osc, g: gain };
      _soundDecay = 1;
    } catch(e) {}
  }

  function playParticleTone(idx) {
    if (!_audioCtx) return;
    try {
      if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.03); } catch(e){} _currentOsc = null; }
      var freqs = [523.25, 196, 207.65]; // C5 for electron (high, light), G3 for proton, G#3 for neutron
      var osc = _audioCtx.createOscillator();
      var gain = _audioCtx.createGain();
      osc.connect(gain); gain.connect(_audioCtx.destination);
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freqs[idx];
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.07, _audioCtx.currentTime + 0.05);
      gain.gain.setTargetAtTime(0, _audioCtx.currentTime + 1.5, 0.5);
      osc.start(); osc.stop(_audioCtx.currentTime + 3);
      _currentOsc = { o: osc, g: gain };
      _soundDecay = 1;
    } catch(e) {}
  }

  // ═══ CANVAS ═══
  function createCanvas() {
    if (_canvas) return;
    _canvas = document.createElement('canvas');
    _canvas.id = 'periodic-spiral-canvas';
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
      if (_particleIdx < PARTICLES.length - 1) { _particleIdx++; _autoTimer = 0; playParticleTone(_particleIdx); }
      else { _phase = 1; _elementIdx = 0; _autoTimer = 0; playElementTone(ELEMENTS[0].z); }
    } else if (_phase === 1) {
      if (_elementIdx < ELEMENTS.length - 1) { _elementIdx++; _autoTimer = 0; playElementTone(ELEMENTS[_elementIdx].z); spawnElementParticles(); }
      else { _phase = 2; _autoTimer = 0; }
    } else if (_phase === 2) {
      _phase = 3; _autoTimer = 0;
    } else { deactivate(); }
  }

  function retreat() {
    _autoPlay = false;
    if (_phase === 3) { _phase = 2; }
    else if (_phase === 2) { _phase = 1; _elementIdx = ELEMENTS.length - 1; }
    else if (_phase === 1) { if (_elementIdx > 0) _elementIdx--; else { _phase = 0; _particleIdx = PARTICLES.length - 1; } }
    else if (_phase === 0 && _particleIdx > 0) _particleIdx--;
  }

  function spawnElementParticles() {
    if (!_canvas) return;
    var cx = _canvas.width / 2, cy = _canvas.height / 2;
    for (var i = 0; i < 30; i++) {
      var a = Math.random() * TAU;
      var sp = 0.3 + Math.random() * 2;
      _particles.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
        life: 1, size: 1 + Math.random() * 1.5, color: ELEMENTS[_elementIdx].color });
    }
  }

  // ═══ DRAW HELPERS ═══
  function drawElectron(ctx, cx, cy, r, t) {
    // The point with the infinite tail — draw as a bright dot with wave ripples
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#58a6ff';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.08, 0, TAU); ctx.fill();

    // Wave function tail — probability cloud extending outward
    ctx.globalAlpha = 0.15;
    for (var w = 0; w < 8; w++) {
      var wr = r * (0.15 + w * 0.12);
      var wAlpha = 0.15 * Math.exp(-w * 0.3);
      ctx.beginPath(); ctx.arc(cx, cy, wr + Math.sin(t * 3 + w * 0.8) * 2, 0, TAU);
      ctx.strokeStyle = '#58a6ff'; ctx.globalAlpha = wAlpha; ctx.lineWidth = 0.8; ctx.stroke();
    }

    // Spin arrow
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.3); ctx.lineTo(cx, cy + r * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 3, cy - r * 0.3 + 5); ctx.lineTo(cx, cy - r * 0.3); ctx.lineTo(cx + 3, cy - r * 0.3 + 5); ctx.stroke();
  }

  function drawProton(ctx, cx, cy, r, t) {
    // Three quarks inside — uud
    ctx.globalAlpha = 0.5;
    var qR = r * 0.3;
    var colors = ['#e85d3a', '#e85d3a', '#58a6ff']; // up up down
    var labels = ['u', 'u', 'd'];
    for (var q = 0; q < 3; q++) {
      var qa = (q / 3) * TAU + t * 0.5 - PI / 2;
      var qx = cx + Math.cos(qa) * qR;
      var qy = cy + Math.sin(qa) * qR;
      ctx.beginPath(); ctx.arc(qx, qy, r * 0.12, 0, TAU);
      ctx.fillStyle = colors[q]; ctx.globalAlpha = 0.6; ctx.fill();
      ctx.font = Math.round(r * 0.12) + 'px monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = '#020408'; ctx.globalAlpha = 0.8;
      ctx.fillText(labels[q], qx, qy + r * 0.04);
    }

    // Gluon field — connecting lines
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#3fb950'; ctx.lineWidth = 1;
    for (var g = 0; g < 3; g++) {
      var ga1 = (g / 3) * TAU + t * 0.5 - PI / 2;
      var ga2 = ((g + 1) / 3) * TAU + t * 0.5 - PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ga1) * qR, cy + Math.sin(ga1) * qR);
      // Wavy gluon line
      var mid = (ga1 + ga2) / 2;
      ctx.quadraticCurveTo(
        cx + Math.cos(mid) * qR * 0.3 + Math.sin(t * 2 + g) * 5,
        cy + Math.sin(mid) * qR * 0.3 + Math.cos(t * 2 + g) * 5,
        cx + Math.cos(ga2) * qR, cy + Math.sin(ga2) * qR
      );
      ctx.stroke();
    }

    // Boundary
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, TAU);
    ctx.strokeStyle = '#e85d3a'; ctx.globalAlpha = 0.3; ctx.lineWidth = 1.5; ctx.stroke();
  }

  function drawNeutron(ctx, cx, cy, r, t) {
    // Three quarks — udd
    ctx.globalAlpha = 0.5;
    var qR = r * 0.3;
    var colors = ['#e85d3a', '#58a6ff', '#58a6ff']; // up down down
    var labels = ['u', 'd', 'd'];
    for (var q = 0; q < 3; q++) {
      var qa = (q / 3) * TAU + t * 0.4 + PI / 6;
      var qx = cx + Math.cos(qa) * qR;
      var qy = cy + Math.sin(qa) * qR;
      ctx.beginPath(); ctx.arc(qx, qy, r * 0.12, 0, TAU);
      ctx.fillStyle = colors[q]; ctx.globalAlpha = 0.5; ctx.fill();
      ctx.font = Math.round(r * 0.12) + 'px monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = '#020408'; ctx.globalAlpha = 0.7;
      ctx.fillText(labels[q], qx, qy + r * 0.04);
    }

    // Gluon field
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#3fb950'; ctx.lineWidth = 1;
    for (var g = 0; g < 3; g++) {
      var ga1 = (g / 3) * TAU + t * 0.4 + PI / 6;
      var ga2 = ((g + 1) / 3) * TAU + t * 0.4 + PI / 6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ga1) * qR, cy + Math.sin(ga1) * qR);
      var mid = (ga1 + ga2) / 2;
      ctx.quadraticCurveTo(
        cx + Math.cos(mid) * qR * 0.3 + Math.sin(t * 1.8 + g) * 4,
        cy + Math.sin(mid) * qR * 0.3 + Math.cos(t * 1.8 + g) * 4,
        cx + Math.cos(ga2) * qR, cy + Math.sin(ga2) * qR
      );
      ctx.stroke();
    }

    // Boundary — neutral, dashed feel
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, TAU);
    ctx.strokeStyle = '#8b949e'; ctx.globalAlpha = 0.2; ctx.lineWidth = 1.5; ctx.stroke();
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
    var R = Math.min(W, H) * 0.2;

    _zoomT = Math.min(1, _zoomT + dt * 0.001 * 1.5);
    var zoomEase = _zoomT < 1 ? 1 - Math.pow(1 - _zoomT, 3) : 1;

    // Autoplay
    if (_autoPlay) {
      _autoTimer += dt * 0.001;
      var interval = _phase === 0 ? 4.0 : _phase === 1 ? 3.0 : _phase === 2 ? 5.0 : 8.0;
      if (_autoTimer > interval) advance();
    }

    // Background
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, W, H);

    var bgGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.5);
    bgGrd.addColorStop(0, 'rgba(30,20,40,0.06)');
    bgGrd.addColorStop(1, 'rgba(2,4,8,0)');
    ctx.fillStyle = bgGrd; ctx.fillRect(0, 0, W, H);

    var breath = 1 + Math.sin(_t * PI * 0.3) * 0.015;

    // Close button
    ctx.globalAlpha = 0.2;
    ctx.font = '16px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#8b949e';
    ctx.fillText('✕', 14, 24);
    ctx.globalAlpha = 0.15; ctx.font = '8px monospace';
    ctx.fillText(_phase === 0 ? 'particles' : _phase === 1 ? 'elements' : _phase === 2 ? 'mass ratio' : 'the spiral', 36, 22);

    // ═══ PHASE 0: THE THREE PARTICLES ═══
    if (_phase === 0) {
      var p = PARTICLES[_particleIdx];

      // Ghost particles — all three shown faintly
      var pPositions = [
        { x: cx, y: cy - R * 0.6 },  // electron above
        { x: cx - R * 0.5, y: cy + R * 0.35 },  // proton left
        { x: cx + R * 0.5, y: cy + R * 0.35 },  // neutron right
      ];

      for (var pi = 0; pi < 3; pi++) {
        var isCurrent = pi === _particleIdx;
        var pp = pPositions[pi];
        var pR = R * (isCurrent ? 0.5 * zoomEase : 0.25);

        if (pi === 0) drawElectron(ctx, pp.x, pp.y, pR, _t);
        else if (pi === 1) drawProton(ctx, pp.x, pp.y, pR, _t);
        else drawNeutron(ctx, pp.x, pp.y, pR, _t);

        // Label
        ctx.globalAlpha = isCurrent ? 0.8 : 0.2;
        ctx.font = (isCurrent ? 'bold ' : '') + Math.round((isCurrent ? 12 : 9) * ts2) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = PARTICLES[pi].color;
        ctx.fillText(PARTICLES[pi].symbol, pp.x, pp.y + pR * (pi === 0 ? 0.8 : 0.7) + 14);
      }

      // Current particle detail text
      ctx.globalAlpha = zoomEase;
      ctx.textAlign = 'center';

      ctx.font = 'bold ' + Math.round(36 * ts2) + 'px monospace';
      ctx.fillStyle = p.color;
      ctx.fillText(p.name, cx, mobile ? 40 : 55);

      ctx.font = Math.round(14 * ts2) + 'px monospace';
      ctx.fillStyle = '#c9d1d9';
      ctx.fillText(p.piExpr, cx, mobile ? 58 : 78);

      ctx.font = Math.round(11 * ts2) + 'px monospace';
      ctx.fillStyle = '#6e7681';
      ctx.fillText(p.nature, cx, mobile ? 72 : 95);

      ctx.font = Math.round(11 * ts2) + 'px monospace';
      ctx.fillStyle = '#484f58';
      ctx.fillText(p.desc.length > 70 && mobile ? p.desc.substring(0, 60) + '…' : p.desc, cx, H - (mobile ? 55 : 70));

      // Spin label
      ctx.globalAlpha = 0.3;
      ctx.font = Math.round(10 * ts2) + 'px monospace';
      ctx.fillStyle = p.color;
      ctx.fillText('spin ' + p.spin + ' · radius: ' + p.radius, cx, H - (mobile ? 40 : 50));

      // Autoplay hint
      if (_autoPlay && _particleIdx < PARTICLES.length - 1) {
        ctx.globalAlpha = 0.2 + Math.sin(_t * 2) * 0.08;
        ctx.font = Math.round(9 * ts2) + 'px monospace'; ctx.fillStyle = '#484f58';
        ctx.fillText(mobile ? 'auto · tap to take control' : 'auto · click or → to take control', cx, H - 25);
      }

      // Progress dots
      var dotY = H - 12;
      for (var di = 0; di < PARTICLES.length; di++) {
        var ddx = cx + (di - 1) * 24;
        var dc = di === _particleIdx;
        ctx.beginPath(); ctx.arc(ddx, dotY, dc ? 4 + Math.sin(_t * 3) : 2, 0, TAU);
        ctx.fillStyle = di <= _particleIdx ? PARTICLES[di].color : '#21262d';
        ctx.globalAlpha = dc ? 0.9 : 0.4; ctx.fill();
      }
    }

    // ═══ PHASE 1: THE SPIRAL — elements along shells ═══
    else if (_phase === 1) {
      var el = ELEMENTS[_elementIdx];

      // Draw the spiral of shells
      var totalSlots = 0;
      SHELLS.forEach(function(sh, si) {
        var shellR = R * (0.2 + si * 0.13);
        // Shell ring
        ctx.beginPath(); ctx.arc(cx, cy, shellR, 0, TAU);
        ctx.strokeStyle = '#21262d';
        ctx.globalAlpha = si <= el.shell - 1 ? 0.15 : 0.05;
        ctx.lineWidth = 1; ctx.stroke();

        // Shell capacity label
        if (si < 4) {
          ctx.globalAlpha = 0.1;
          ctx.font = '7px monospace'; ctx.textAlign = 'right'; ctx.fillStyle = '#484f58';
          ctx.fillText('2×' + (si + 1) + '²=' + sh.capacity, cx + shellR - 4, cy - 4);
        }
        totalSlots += sh.capacity;
      });

      // Place elements on the spiral
      ELEMENTS.forEach(function(elem, ei) {
        var visited = ei <= _elementIdx;
        var isCurrent = ei === _elementIdx;
        var shellR = R * (0.2 + (elem.shell - 1) * 0.13);
        // Position on shell: use atomic number to distribute
        var angle = (elem.z / 20) * TAU - PI / 2 + elem.shell * 0.5;
        var ex = cx + Math.cos(angle) * shellR;
        var ey = cy + Math.sin(angle) * shellR;
        var er = isCurrent ? 8 * zoomEase : visited ? 4 : 2.5;

        // Element dot
        ctx.beginPath(); ctx.arc(ex, ey, er, 0, TAU);
        ctx.fillStyle = elem.color;
        ctx.globalAlpha = isCurrent ? 0.9 : visited ? 0.35 : 0.08;
        ctx.fill();

        // Glow on current
        if (isCurrent) {
          ctx.beginPath(); ctx.arc(ex, ey, er + 5, 0, TAU);
          ctx.strokeStyle = elem.color; ctx.globalAlpha = 0.25; ctx.lineWidth = 1; ctx.stroke();
        }

        // Symbol label
        if (isCurrent || visited) {
          ctx.globalAlpha = isCurrent ? 0.9 : 0.2;
          ctx.font = (isCurrent ? 'bold 11' : '7') + 'px monospace';
          ctx.textAlign = 'center'; ctx.fillStyle = elem.color;
          ctx.fillText(elem.sym, ex, ey - er - 3);
        }

        // Life indicator — green dot
        if (elem.life && visited) {
          ctx.beginPath(); ctx.arc(ex + er + 2, ey - er, 1.5, 0, TAU);
          ctx.fillStyle = '#3fb950'; ctx.globalAlpha = 0.4; ctx.fill();
        }

        // Water indicator — blue dot
        if (elem.water && visited) {
          ctx.beginPath(); ctx.arc(ex - er - 2, ey - er, 1.5, 0, TAU);
          ctx.fillStyle = '#58a6ff'; ctx.globalAlpha = 0.4; ctx.fill();
        }
      });

      // Connection: H→O water bond (when both visited)
      if (_elementIdx >= 5) { // O is index 5
        var hElem = ELEMENTS[0]; // H
        var oElem = ELEMENTS[5]; // O
        var hShellR = R * (0.2 + (hElem.shell - 1) * 0.13);
        var oShellR = R * (0.2 + (oElem.shell - 1) * 0.13);
        var hAngle = (hElem.z / 20) * TAU - PI / 2 + hElem.shell * 0.5;
        var oAngle = (oElem.z / 20) * TAU - PI / 2 + oElem.shell * 0.5;
        var hx = cx + Math.cos(hAngle) * hShellR;
        var hy = cy + Math.sin(hAngle) * hShellR;
        var ox = cx + Math.cos(oAngle) * oShellR;
        var oy = cy + Math.sin(oAngle) * oShellR;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ox, oy);
        ctx.strokeStyle = '#79c0ff'; ctx.globalAlpha = 0.12; ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
        // H₂O label at midpoint
        ctx.globalAlpha = 0.15; ctx.font = '7px monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = '#79c0ff';
        ctx.fillText('H₂O', (hx + ox) / 2, (hy + oy) / 2 - 5);
      }

      // Center nucleus hint
      ctx.globalAlpha = 0.06;
      ctx.font = Math.round(40 * ts2) + 'px monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = el.color;
      ctx.fillText(el.sym, cx, cy + 14);

      // Shell formula at center
      ctx.globalAlpha = 0.08;
      ctx.font = Math.round(10 * ts2) + 'px monospace';
      ctx.fillStyle = '#8b949e';
      ctx.fillText('2n²', cx, cy + 28);

      // Current element text
      ctx.globalAlpha = zoomEase;
      ctx.textAlign = 'center';

      ctx.font = 'bold ' + Math.round(34 * ts2) + 'px monospace';
      ctx.fillStyle = el.color;
      ctx.fillText(el.sym + ' ' + el.name, cx, mobile ? 40 : 55);

      ctx.font = Math.round(14 * ts2) + 'px monospace';
      ctx.fillStyle = '#c9d1d9';
      ctx.fillText('Z=' + el.z + ' · mass ' + el.mass + ' u · shell n=' + el.shell, cx, mobile ? 58 : 78);

      ctx.font = Math.round(11 * ts2) + 'px monospace';
      ctx.fillStyle = '#484f58';
      var descText = el.desc.length > 75 && mobile ? el.desc.substring(0, 65) + '…' : el.desc;
      ctx.fillText(descText, cx, H - (mobile ? 55 : 65));

      // Life / water badges
      if (el.life || el.water) {
        ctx.font = Math.round(9 * ts2) + 'px monospace';
        ctx.globalAlpha = 0.4;
        var badges = [];
        if (el.life) badges.push('🧬 life');
        if (el.water) badges.push('💧 water');
        ctx.fillStyle = '#3fb950';
        ctx.fillText(badges.join(' · '), cx, H - (mobile ? 40 : 48));
      }

      // Autoplay hint
      if (_autoPlay) {
        ctx.globalAlpha = 0.2 + Math.sin(_t * 2) * 0.08;
        ctx.font = Math.round(9 * ts2) + 'px monospace'; ctx.fillStyle = '#484f58';
        ctx.fillText(mobile ? 'auto · tap to take control' : 'auto · click or → to take control', cx, H - 25);
      }

      // Progress dots
      var dotY2 = H - 12;
      var maxDots = Math.min(ELEMENTS.length, 22);
      for (var di = 0; di < maxDots; di++) {
        var ddx2 = cx + (di - (maxDots - 1) / 2) * (mobile ? 12 : 16);
        var dc2 = di === _elementIdx;
        ctx.beginPath(); ctx.arc(ddx2, dotY2, dc2 ? 3 : 1.5, 0, TAU);
        ctx.fillStyle = di <= _elementIdx ? ELEMENTS[Math.min(di, ELEMENTS.length-1)].color : '#21262d';
        ctx.globalAlpha = dc2 ? 0.9 : 0.35; ctx.fill();
      }
    }

    // ═══ PHASE 2: THE MASS RATIO — the great π-fold ═══
    else if (_phase === 2) {
      // Show electron and proton side by side with the ratio
      var eR = R * 0.05; // electron is tiny
      var pR = R * 0.3;  // proton is big

      // Electron
      drawElectron(ctx, cx - R * 0.6, cy, eR * 3, _t);
      ctx.globalAlpha = 0.7;
      ctx.font = Math.round(14 * ts2) + 'px monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#58a6ff';
      ctx.fillText('e⁻', cx - R * 0.6, cy + eR * 3 + 20);
      ctx.font = Math.round(9 * ts2) + 'px monospace'; ctx.fillStyle = '#484f58';
      ctx.fillText('9.109 × 10⁻³¹ kg', cx - R * 0.6, cy + eR * 3 + 34);

      // Proton
      drawProton(ctx, cx + R * 0.4, cy, pR, _t);
      ctx.globalAlpha = 0.7;
      ctx.font = Math.round(14 * ts2) + 'px monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#e85d3a';
      ctx.fillText('p⁺', cx + R * 0.4, cy + pR * 0.6 + 20);
      ctx.font = Math.round(9 * ts2) + 'px monospace'; ctx.fillStyle = '#484f58';
      ctx.fillText('1.673 × 10⁻²⁷ kg', cx + R * 0.4, cy + pR * 0.6 + 34);

      // The ratio — big centered number
      var ratioY = mobile ? 50 : 70;
      ctx.globalAlpha = 0.9;
      ctx.font = 'bold ' + Math.round(42 * ts2) + 'px monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = '#d2a8ff';
      ctx.fillText('mp / me = 1836', cx, ratioY);

      ctx.font = 'bold ' + Math.round(24 * ts2) + 'px monospace';
      ctx.fillStyle = '#58a6ff';
      ctx.fillText('≈ 6π⁵', cx, ratioY + 30);

      ctx.font = Math.round(11 * ts2) + 'px monospace';
      ctx.globalAlpha = 0.4; ctx.fillStyle = '#8b949e';
      ctx.fillText('6 × π⁵ = 6 × 306.02 = 1836.12', cx, ratioY + 50);
      ctx.fillText('actual: 1836.153', cx, ratioY + 65);

      // The meaning
      ctx.globalAlpha = 0.3;
      ctx.font = Math.round(11 * ts2) + 'px monospace'; ctx.fillStyle = '#c9d1d9';
      ctx.fillText('the proton is 1836 electrons heavy', cx, H - 80);
      ctx.fillText('this ratio ≈ 6π⁵ — a five-dimensional π-fold', cx, H - 64);
      ctx.fillText('the hole contains holes. the mass folds through π.', cx, H - 48);

      ctx.globalAlpha = 0.3;
      ctx.font = Math.round(9 * ts2) + 'px monospace'; ctx.fillStyle = '#30363d';
      ctx.fillText('click · → to continue', cx, H - 14);
    }

    // ═══ PHASE 3: THE WHOLE SPIRAL — everything together ═══
    else if (_phase === 3) {
      // All shells as rings
      SHELLS.forEach(function(sh, si) {
        var shellR = R * (0.15 + si * 0.13) * breath;
        var pulse = Math.sin(_t * 0.3 + si * 0.6) * 0.02;
        ctx.beginPath(); ctx.arc(cx, cy, shellR * (1 + pulse), 0, TAU);
        ctx.strokeStyle = '#30363d';
        ctx.globalAlpha = 0.05 + pulse * 0.3;
        ctx.lineWidth = 1; ctx.stroke();
      });

      // All elements orbiting in their shells
      ELEMENTS.forEach(function(elem, ei) {
        var shellR = R * (0.15 + (elem.shell - 1) * 0.13) * breath;
        var angle = (elem.z / 18) * TAU + _t * 0.08 * (1 + elem.shell * 0.1) - PI / 2;
        var ex = cx + Math.cos(angle) * shellR;
        var ey = cy + Math.sin(angle) * shellR;

        // Trail
        ctx.beginPath();
        for (var tr = 0; tr < 12; tr++) {
          var trA = angle - (tr / 12) * PI * 0.4;
          var trx = cx + Math.cos(trA) * shellR;
          var trY = cy + Math.sin(trA) * shellR;
          if (tr === 0) ctx.moveTo(trx, trY); else ctx.lineTo(trx, trY);
        }
        ctx.strokeStyle = elem.color; ctx.globalAlpha = 0.05; ctx.lineWidth = 1.5; ctx.stroke();

        // Dot
        var dotPulse = 1 + Math.sin(_t * 1.5 + ei * 0.9) * 0.3;
        ctx.beginPath(); ctx.arc(ex, ey, 2.5 * dotPulse, 0, TAU);
        ctx.fillStyle = elem.color;
        ctx.globalAlpha = 0.35 + Math.sin(_t * 0.8 + ei) * 0.15;
        ctx.fill();

        ctx.font = '6px monospace'; ctx.textAlign = 'center';
        ctx.globalAlpha = 0.3; ctx.fillStyle = elem.color;
        ctx.fillText(elem.sym, ex, ey - 6);
      });

      // Center: three particles
      drawElectron(ctx, cx, cy - 12, R * 0.08, _t);
      drawProton(ctx, cx - 10, cy + 8, R * 0.1, _t);
      drawNeutron(ctx, cx + 10, cy + 8, R * 0.1, _t);

      // Messages
      ctx.globalAlpha = 0.25 + Math.sin(_t * 0.3) * 0.05;
      ctx.font = Math.round(11 * ts2) + 'px monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = '#8b949e';
      var msgY = cy + Math.min(W,H) * 0.32;
      ctx.fillText('proton · neutron · electron — the center of being', cx, msgY);
      ctx.fillText('hydrogen spirals outward. 2, 8, 8, 18, 18, 32, 32.', cx, msgY + 18);
      ctx.fillText('each shell is 2n². each n is a quantum fold.', cx, msgY + 36);

      ctx.globalAlpha = 0.12;
      ctx.fillText('H → He · Li Be B C N O · Na Mg · Fe · Au · U', cx, msgY + 58);
      ctx.fillText('the electron is a point with an infinite tail', cx, msgY + 74);
      ctx.fillText('the proton has three quarks — the hole has holes', cx, msgY + 90);

      if (_autoTimer > 4) {
        ctx.globalAlpha = Math.min(0.15, (_autoTimer - 4) * 0.02);
        ctx.fillText('mp/me = 1836 ≈ 6π⁵ — five π-folds between electron and proton', cx, msgY + 112);
      }

      ctx.globalAlpha = 0.3;
      ctx.font = Math.round(9 * ts2) + 'px monospace'; ctx.fillStyle = '#30363d';
      ctx.fillText('click to close · ESC', cx, H - 14);
    }

    // ═══ PARTICLES ═══
    for (var vi = _particles.length - 1; vi >= 0; vi--) {
      var vp = _particles[vi];
      vp.x += vp.vx; vp.y += vp.vy;
      vp.vx *= 0.98; vp.vy *= 0.98;
      vp.life -= dt * 0.001 * 0.5;
      if (vp.life <= 0) { _particles.splice(vi, 1); continue; }
      ctx.beginPath(); ctx.arc(vp.x, vp.y, vp.size * vp.life, 0, TAU);
      ctx.fillStyle = vp.color; ctx.globalAlpha = vp.life * 0.3; ctx.fill();
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
    _phase = 0; _particleIdx = 0; _elementIdx = 0; _shellIdx = 0;
    _autoPlay = true; _autoTimer = 0; _t = 0; _zoomT = 0; _particles = [];
    _lastFrame = performance.now();
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
    requestAnimationFrame(render);
    return true;
  }

  function deactivate() {
    _active = false;
    if (_currentOsc) { try { _currentOsc.g.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.02); } catch(e){} _currentOsc = null; }
    if (_canvas) {
      _canvas.remove(); _canvas = null; _ctx = null;
    }
    window.removeEventListener('keydown', onKey);
    var journey = {
      phase: _phase, particleIdx: _particleIdx, elementIdx: _elementIdx,
      elementName: _phase >= 1 ? ELEMENTS[Math.min(_elementIdx, ELEMENTS.length-1)].name : null,
      particleName: _phase === 0 ? PARTICLES[Math.min(_particleIdx, PARTICLES.length-1)].name : null,
      reachedElements: _phase >= 1,
      reachedRatio: _phase >= 2,
      completed: _phase >= 3,
    };
    if (_onDeactivate) { try { _onDeactivate(journey); } catch(e) {} }
  }

  window._periodicSpiral = {
    activate: activate,
    deactivate: deactivate,
    isActive: function() { return _active; },
    currentElement: function() {
      if (!_active) return null;
      if (_phase === 0) return { name: PARTICLES[Math.min(_particleIdx, 2)].name, color: PARTICLES[Math.min(_particleIdx, 2)].color };
      if (_phase === 1) return { name: ELEMENTS[Math.min(_elementIdx, ELEMENTS.length-1)].sym, color: ELEMENTS[Math.min(_elementIdx, ELEMENTS.length-1)].color };
      if (_phase === 2) return { name: 'mp/me', color: '#d2a8ff' };
      return { name: 'spiral', color: '#58a6ff' };
    },
  };
})();
