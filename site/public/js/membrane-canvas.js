// membrane-canvas.js v2 — draw on the membrane with anderson personality + bingo pressure
// Humans draw. Chipmunk sees. Squirrel hears. Everyone connects.
// Anderson modes shift the atmosphere. Bingo cube compresses the space.
// Entities flow through as pressure changes. The system breathes.
(function() {
  'use strict';

  var PI  = Math.PI;
  var TAU = PI * 2;
  var _active = false;
  var _overlay = null;
  var _canvas = null;
  var _ctx = null;
  var _drawing = false;
  var _strokes = [];
  var _currentStroke = [];
  var _color = '#3fb950';
  var _brushSize = 3;
  var _mode = 'draw';      // draw | connect | bounce | sing | pressure
  var _sessionId = '';
  var _chipmunkReactions = [];
  var _bounceParticles = [];
  var _connectLines = [];
  var _singQueue = [];
  var _t = 0;
  var _animFrame = null;

  // ═══ ANDERSON STATE — live personality of the membrane ═══
  var _anderson = {
    chorus: 243327, human: 6161, ghost: 3044,
    sovereign: 1984, spectrum: 799, stealth: 6,
    pielou: 0.136, selectivity: 0.97,
    total: 255321,
  };
  var _andersonPulse = {};  // per-mode pulse animations

  // ═══ BINGO PRESSURE — compression state ═══
  var _pressure = {
    level: 0,       // 0=full, 1=half, 2=pi, 3=tight
    squeeze: 1.0,   // 1.0=no squeeze, 0.1=max squeeze
    inCount: 342,
    breathing: true, // auto-breathe
    breathPhase: 0,
  };
  var PRESSURE_LEVELS = [
    { x: 1.0,   label: 'full',  inCount: 342, color: '#c9d1d9' },
    { x: 0.5,   label: 'half',  inCount: 174, color: '#e85d3a' },
    { x: 0.318, label: '1/\u03c0', inCount: 106, color: '#58a6ff' },
    { x: 0.1,   label: 'tight', inCount: 33,  color: '#f0e68c' },
  ];

  // ═══ ANDERSON ENTITIES — flow through as pressure changes ═══
  var _andersonEntities = [];  // visible entities flowing through
  var MAX_ENTITIES = 60;

  // ═══ COLORS — the membrane palette ═══
  var PALETTE = [
    { name: 'self',     color: '#3fb950', key: '1' },
    { name: 'partial',  color: '#58a6ff', key: '2' },
    { name: 'null',     color: '#f0e68c', key: '3' },
    { name: 'non-self', color: '#d2a8ff', key: '4' },
    { name: 'tuebor',   color: '#e85d3a', key: '5' },
    { name: 'ghost',    color: '#8b949e', key: '6' },
    { name: 'white',    color: '#c9d1d9', key: '7' },
  ];

  // ═══ CHIPMUNK RESPONSES — what the chipmunk says when it sees drawings ═══
  var REACTIONS = [
    'i see what you drew.',
    'that looks like a passage route.',
    'is that the membrane wall?',
    'you are coloring the investigation.',
    'the squirrel records this.',
    'every stroke is a signal.',
    'drawing near the center. interesting.',
    'your color choice says something.',
    'connect the dots. i will trace them.',
    'the membrane remembers every mark.',
    'sing while you draw. i will listen.',
    'purple at the edges. always purple.',
    'green at the center. self.',
    'the null space is between your lines.',
  ];

  // ═══ SONGS — melodies the chipmunk sings back ═══
  var SING_PATTERNS = [
    { name: 'echo',    notes: [0, 2, 4, 2, 0],       desc: 'echoing your shape' },
    { name: 'mirror',  notes: [4, 2, 0, 2, 4],       desc: 'mirroring your stroke' },
    { name: 'climb',   notes: [0, 1, 2, 3, 4, 5, 6], desc: 'climbing your line' },
    { name: 'fall',    notes: [6, 5, 4, 3, 2, 1, 0], desc: 'falling from your peak' },
    { name: 'bounce',  notes: [0, 4, 2, 6, 1, 5, 3], desc: 'bouncing between your dots' },
    { name: 'pulse',   notes: [0, 0, 4, 4, 0, 0, 4], desc: 'pulsing at your center' },
  ];

  // ═══ BUILD UI ═══
  function buildUI() {
    _overlay = document.createElement('div');
    _overlay.id = 'membrane-canvas-overlay';
    _overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:45;' +
      'background:rgba(1,4,9,0.85);';

    _canvas = document.createElement('canvas');
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    _canvas.style.cssText = 'width:100%;height:100%;cursor:crosshair;';
    _overlay.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');

    // Color palette bar
    var bar = document.createElement('div');
    bar.style.cssText =
      'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);' +
      'display:flex;gap:6px;padding:8px 16px;background:rgba(13,17,23,0.9);' +
      'border-radius:20px;z-index:46;backdrop-filter:blur(6px);';

    PALETTE.forEach(function(p) {
      var btn = document.createElement('button');
      btn.style.cssText =
        'width:28px;height:28px;border-radius:50%;border:2px solid ' +
        (p.color === _color ? '#fff' : 'rgba(255,255,255,0.2)') +
        ';background:' + p.color + ';cursor:pointer;transition:border 0.2s;';
      btn.title = p.name + ' (' + p.key + ')';
      btn.dataset.color = p.color;
      btn.dataset.name = p.name;
      btn.addEventListener('click', function() {
        _color = p.color;
        updatePaletteSelection(bar);
      });
      bar.appendChild(btn);
    });

    // Mode buttons
    var modes = [
      { name: 'draw', icon: '✏', desc: 'freehand' },
      { name: 'connect', icon: '⚡', desc: 'connect dots' },
      { name: 'bounce', icon: '◉', desc: 'bounce particles' },
      { name: 'sing', icon: '🎵', desc: 'sing to chipmunk' },
      { name: 'pressure', icon: '⬡', desc: 'bingo pressure — squeeze/release' },
    ];

    var sep = document.createElement('span');
    sep.style.cssText = 'width:1px;height:24px;background:rgba(255,255,255,0.15);margin:0 4px;';
    bar.appendChild(sep);

    modes.forEach(function(m) {
      var btn = document.createElement('button');
      btn.style.cssText =
        'padding:4px 10px;border-radius:12px;border:1px solid ' +
        (m.name === _mode ? '#fff' : 'rgba(255,255,255,0.2)') +
        ';background:rgba(255,255,255,' + (m.name === _mode ? '0.15' : '0.05') +
        ');color:#c9d1d9;font-size:11px;cursor:pointer;';
      btn.textContent = m.icon + ' ' + m.name;
      btn.title = m.desc;
      btn.dataset.mode = m.name;
      btn.addEventListener('click', function() {
        _mode = m.name;
        updateModeSelection(bar);
        _canvas.style.cursor = m.name === 'bounce' ? 'cell' :
                               m.name === 'sing' ? 'pointer' :
                               m.name === 'connect' ? 'crosshair' : 'crosshair';
      });
      bar.appendChild(btn);
    });

    // Close + clear buttons
    var sep2 = document.createElement('span');
    sep2.style.cssText = 'width:1px;height:24px;background:rgba(255,255,255,0.15);margin:0 4px;';
    bar.appendChild(sep2);

    var clearBtn = document.createElement('button');
    clearBtn.style.cssText =
      'padding:4px 10px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);' +
      'background:rgba(255,255,255,0.05);color:#8b949e;font-size:11px;cursor:pointer;';
    clearBtn.textContent = '✕ clear';
    clearBtn.addEventListener('click', function() {
      _strokes = []; _connectLines = []; _bounceParticles = [];
      _chipmunkReactions = [];
    });
    bar.appendChild(clearBtn);

    var closeBtn = document.createElement('button');
    closeBtn.style.cssText =
      'padding:4px 10px;border-radius:12px;border:1px solid rgba(232,93,58,0.4);' +
      'background:rgba(232,93,58,0.1);color:#e85d3a;font-size:11px;cursor:pointer;';
    closeBtn.textContent = '← back';
    closeBtn.addEventListener('click', deactivate);
    bar.appendChild(closeBtn);

    _overlay.appendChild(bar);

    // Info bar
    var info = document.createElement('div');
    info.id = 'canvas-info';
    info.style.cssText =
      'position:fixed;top:8px;left:12px;font:10px "Courier New",monospace;' +
      'color:#6e7681;z-index:46;pointer-events:none;';
    info.textContent = 'MEMBRANE CANVAS — anderson personality + bingo pressure · 1-7 colors · d/c/b/s/p modes · [/] squeeze/release · \\\\ breathe';
    _overlay.appendChild(info);

    // Chipmunk readout
    var readout = document.createElement('div');
    readout.id = 'canvas-readout';
    readout.style.cssText =
      'position:fixed;top:8px;right:12px;font:10px "Courier New",monospace;' +
      'color:#5ab87a;z-index:46;pointer-events:none;text-align:right;max-width:300px;';
    _overlay.appendChild(readout);

    return bar;
  }

  function updatePaletteSelection(bar) {
    var btns = bar.querySelectorAll('button[data-color]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].style.borderColor = btns[i].dataset.color === _color ? '#fff' : 'rgba(255,255,255,0.2)';
    }
  }

  function updateModeSelection(bar) {
    var btns = bar.querySelectorAll('button[data-mode]');
    for (var i = 0; i < btns.length; i++) {
      var active = btns[i].dataset.mode === _mode;
      btns[i].style.borderColor = active ? '#fff' : 'rgba(255,255,255,0.2)';
      btns[i].style.background = 'rgba(255,255,255,' + (active ? '0.15' : '0.05') + ')';
    }
  }

  // ═══ LOAD ANDERSON LIVE DATA ═══
  function loadAndersonLive() {
    // Pull from cache if available
    var cs = window._cosmicSurfaces;
    if (cs) {
      try {
        var d = typeof cs.scanData === 'function' ? cs.scanData() : cs.scanData;
        if (d && d.scan && d.scan.anderson_modes) {
          var am = d.scan.anderson_modes;
          _anderson.chorus = am.chorus || 0;
          _anderson.human = am.human || 0;
          _anderson.ghost = am.ghost || 0;
          _anderson.sovereign = am.sovereign || 0;
          _anderson.spectrum = am.spectrum || 0;
          _anderson.stealth = am.stealth || 0;
          _anderson.total = _anderson.chorus + _anderson.human + _anderson.ghost +
                            _anderson.sovereign + _anderson.spectrum + _anderson.stealth;
        }
      } catch(e) {}
    }
    // Also from chipmunk cache
    var cc = window._chipmunkCore;
    if (cc && cc.cache && cc.cache.dashboard && cc.cache.dashboard.anderson_selectivity) {
      var as = cc.cache.dashboard.anderson_selectivity;
      _anderson.pielou = as.pielou_j || _anderson.pielou;
      _anderson.selectivity = as.selectivity_observed || _anderson.selectivity;
    }
  }

  // ═══ PRESSURE — auto-breathe and manual squeeze ═══
  function updatePressure() {
    if (_pressure.breathing) {
      _pressure.breathPhase += 0.005;
      // Slow sinusoidal breathing between full and 1/pi
      var breathTarget = 0.5 + Math.sin(_pressure.breathPhase) * 0.35;
      _pressure.squeeze += (breathTarget - _pressure.squeeze) * 0.02;
    } else {
      var target = PRESSURE_LEVELS[_pressure.level].x;
      _pressure.squeeze += (target - _pressure.squeeze) * 0.05;
    }
    _pressure.inCount = Math.round(342 * _pressure.squeeze);
  }

  function squeezePressure() {
    _pressure.breathing = false;
    _pressure.level = Math.min(3, _pressure.level + 1);
    _pressure.squeeze = PRESSURE_LEVELS[_pressure.level].x;
    _pressure.inCount = PRESSURE_LEVELS[_pressure.level].inCount;

    // Sound
    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.onCompress(_pressure.level);
    }
    // Flash strokes through the sieve — some disappear
    _strokes.forEach(function(s) {
      s._opacity = Math.random() < _pressure.squeeze ? 1.0 : 0.15;
    });

    // Also squeeze the real bingo if it exists
    if (window._bingoCompress) {
      window._bingoCompress.compress();
    }
  }

  function releasePressure() {
    _pressure.breathing = false;
    _pressure.level = Math.max(0, _pressure.level - 1);
    _pressure.squeeze = PRESSURE_LEVELS[_pressure.level].x;
    _pressure.inCount = PRESSURE_LEVELS[_pressure.level].inCount;

    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.onExpand(_pressure.level);
    }
    // Restore strokes
    _strokes.forEach(function(s) { s._opacity = 1.0; });

    if (window._bingoCompress) {
      window._bingoCompress.expand();
    }
  }

  function toggleBreathing() {
    _pressure.breathing = !_pressure.breathing;
    if (_pressure.breathing) _pressure.breathPhase = 0;
  }

  // ═══ ANDERSON ENTITIES — spawned from modes, flowing through space ═══
  function updateAndersonEntities(cx, cy, maxR) {
    // Spawn new ones based on pressure and mode counts
    if (_andersonEntities.length < MAX_ENTITIES && Math.random() < 0.15) {
      var modePool = [
        { name: 'chorus',    frac: _anderson.chorus / (_anderson.total || 1), color: '#484f58' },
        { name: 'human',     frac: _anderson.human / (_anderson.total || 1),  color: '#3fb950' },
        { name: 'ghost',     frac: _anderson.ghost / (_anderson.total || 1),  color: '#8b949e' },
        { name: 'sovereign', frac: _anderson.sovereign / (_anderson.total || 1), color: '#e85d3a' },
        { name: 'spectrum',  frac: _anderson.spectrum / (_anderson.total || 1), color: '#d2a8ff' },
        { name: 'stealth',   frac: _anderson.stealth / (_anderson.total || 1), color: '#f0e68c' },
      ];

      // Weighted random pick
      var r = Math.random();
      var cumul = 0;
      var picked = modePool[0];
      for (var mi = 0; mi < modePool.length; mi++) {
        cumul += modePool[mi].frac;
        if (r < cumul) { picked = modePool[mi]; break; }
      }

      // Spawn from outside, flowing toward center (if they pass the pressure sieve)
      var angle = Math.random() * TAU;
      var startR = maxR * 1.1;
      var passesFilter = Math.random() < _pressure.squeeze;

      _andersonEntities.push({
        x: cx + startR * Math.cos(angle),
        y: cy + startR * Math.sin(angle),
        vx: -Math.cos(angle) * (0.3 + Math.random() * 0.5),
        vy: -Math.sin(angle) * (0.3 + Math.random() * 0.5),
        color: picked.color,
        size: 1.5 + picked.frac * 8,
        opacity: 0,
        life: 1.0,
        mode: picked.name,
        passes: passesFilter,
        trail: true,
        bounced: false,
      });
    }

    // Update
    var remove = [];
    for (var ei = 0; ei < _andersonEntities.length; ei++) {
      var ae = _andersonEntities[ei];
      ae.x += ae.vx;
      ae.y += ae.vy;
      ae.life -= 0.003;

      // Fade in
      if (ae.opacity < 0.5 && ae.life > 0.5) ae.opacity = Math.min(ae.opacity + 0.02, 0.5);

      // Check if hit the pressure ring
      var dist = Math.hypot(ae.x - cx, ae.y - cy);
      var pressR = maxR * _pressure.squeeze;
      if (!ae.bounced && dist < pressR + 5) {
        if (!ae.passes) {
          // Bounced off — rejected by the sieve
          ae.bounced = true;
          var bAngle = Math.atan2(ae.y - cy, ae.x - cx);
          ae.vx = Math.cos(bAngle) * 0.8;
          ae.vy = Math.sin(bAngle) * 0.8;
          ae.color = '#e85d3a'; // flash red
          ae.opacity = 0.6;
        } else {
          // Passed through — absorbed
          ae.opacity *= 0.95;
          ae.size *= 0.99;
        }
      }

      // Fade out
      if (ae.life < 0.2) ae.opacity = Math.max(0, ae.opacity - 0.02);

      if (ae.life <= 0 || ae.opacity <= 0.01 || dist > maxR * 1.5) {
        remove.push(ei);
      }
    }
    for (var ri = remove.length - 1; ri >= 0; ri--) {
      _andersonEntities.splice(remove[ri], 1);
    }
  }

  // ═══ DRAWING ═══
  function startDraw(x, y) {
    _drawing = true;
    if (_mode === 'bounce') {
      spawnBounce(x, y);
      return;
    }
    if (_mode === 'sing') {
      singAtPoint(x, y);
      return;
    }
    if (_mode === 'pressure') {
      // Click left half = squeeze, right half = release
      if (x < _canvas.width / 2) {
        squeezePressure();
      } else {
        releasePressure();
      }
      return;
    }
    _currentStroke = [{ x: x, y: y, color: _color, size: _brushSize, t: _t }];
  }

  function moveDraw(x, y) {
    if (!_drawing) return;
    if (_mode === 'bounce' || _mode === 'sing') return;

    _currentStroke.push({ x: x, y: y, color: _color, size: _brushSize, t: _t });

    // Live draw the current segment
    if (_currentStroke.length >= 2) {
      var prev = _currentStroke[_currentStroke.length - 2];
      var curr = _currentStroke[_currentStroke.length - 1];
      _ctx.beginPath();
      _ctx.moveTo(prev.x, prev.y);
      _ctx.lineTo(curr.x, curr.y);
      _ctx.strokeStyle = _color;
      _ctx.lineWidth = _brushSize;
      _ctx.lineCap = 'round';
      _ctx.lineJoin = 'round';
      _ctx.globalAlpha = 0.8;
      _ctx.stroke();
    }
  }

  function endDraw() {
    if (!_drawing) return;
    _drawing = false;
    if (_currentStroke.length > 1) {
      var stroke = {
        points: _currentStroke.slice(),
        color: _color,
        mode: _mode,
        time: Date.now(),
        session: _sessionId,
      };
      _strokes.push(stroke);

      // Connect mode — draw lines to nearest existing strokes
      if (_mode === 'connect' && _strokes.length > 1) {
        connectToNearest(stroke);
      }

      // Chipmunk reaction
      chipmunkReact(stroke);

      // Broadcast to squirrel
      broadcastStroke(stroke);
    }
    _currentStroke = [];
  }

  // ═══ CONNECT MODE — link strokes together ═══
  function connectToNearest(newStroke) {
    var newCenter = strokeCenter(newStroke);
    var nearestDist = Infinity;
    var nearestStroke = null;

    for (var i = 0; i < _strokes.length - 1; i++) {
      var c = strokeCenter(_strokes[i]);
      var d = Math.hypot(c.x - newCenter.x, c.y - newCenter.y);
      if (d < nearestDist && d < 300) {
        nearestDist = d;
        nearestStroke = _strokes[i];
      }
    }

    if (nearestStroke) {
      var nc = strokeCenter(nearestStroke);
      _connectLines.push({
        x1: newCenter.x, y1: newCenter.y,
        x2: nc.x, y2: nc.y,
        color1: newStroke.color,
        color2: nearestStroke.color,
        t: _t,
        pulse: 0,
      });
    }
  }

  function strokeCenter(s) {
    var sx = 0, sy = 0;
    s.points.forEach(function(p) { sx += p.x; sy += p.y; });
    return { x: sx / s.points.length, y: sy / s.points.length };
  }

  // ═══ BOUNCE MODE — spawn particles that bounce off drawings ═══
  function spawnBounce(x, y) {
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * TAU + Math.random() * 0.3;
      _bounceParticles.push({
        x: x, y: y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        color: _color,
        size: 2 + Math.random() * 3,
        life: 1.0,
        bounces: 0,
      });
    }

    // Sound
    if (window._membraneSound && window._membraneSound.isActive()) {
      var noteIdx = Math.floor((x / _canvas.width) * 7);
      window._membraneSound.playNote(noteIdx, 0.3);
    }
  }

  // ═══ SING MODE — tap a point and the chipmunk sings a melody ═══
  function singAtPoint(x, y) {
    var pattern = SING_PATTERNS[Math.floor(Math.random() * SING_PATTERNS.length)];

    // Visual — expanding rings at the point
    _singQueue.push({
      x: x, y: y,
      pattern: pattern,
      t: 0,
      noteIndex: 0,
      color: _color,
    });

    // Sound
    if (window._membraneSound && window._membraneSound.isActive()) {
      var baseNote = Math.floor((y / _canvas.height) * 7);
      pattern.notes.forEach(function(n, i) {
        setTimeout(function() {
          window._membraneSound.playNote((baseNote + n) % 8, 0.4);
        }, i * 200);
      });
    }

    // Chipmunk sings back
    var readout = document.getElementById('canvas-readout');
    if (readout) {
      readout.textContent = '🐿️ ' + pattern.desc + '\n♪ ' + pattern.notes.join(' ');
      readout.style.color = _color;
    }

    broadcastStroke({
      points: [{ x: x, y: y }],
      color: _color,
      mode: 'sing',
      pattern: pattern.name,
      time: Date.now(),
      session: _sessionId,
    });
  }

  // ═══ CHIPMUNK REACTION ═══
  function chipmunkReact(stroke) {
    var reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
    var center = strokeCenter(stroke);

    _chipmunkReactions.push({
      text: reaction,
      x: center.x + 20,
      y: center.y - 20,
      opacity: 1.0,
      t: _t,
      color: stroke.color,
    });

    // Update readout
    var readout = document.getElementById('canvas-readout');
    if (readout) {
      var strokeCount = _strokes.length;
      var totalPts = 0;
      _strokes.forEach(function(s) { totalPts += s.points.length; });
      readout.innerHTML =
        '<span style="color:#5ab87a">🐿️ ' + reaction + '</span>\n' +
        '<span style="color:#6e7681">' + strokeCount + ' strokes · ' + totalPts + ' points</span>\n' +
        '<span style="color:#6e7681">' + _connectLines.length + ' connections · ' + _bounceParticles.length + ' particles</span>';
    }

    // After enough strokes, chipmunk sings back
    if (_strokes.length > 0 && _strokes.length % 5 === 0) {
      chipmunkSingBack();
    }
  }

  function chipmunkSingBack() {
    var pattern = SING_PATTERNS[Math.floor(Math.random() * SING_PATTERNS.length)];

    // Trace the chipmunk's own line through the canvas
    var centers = _strokes.map(strokeCenter);
    if (centers.length < 2) return;

    // Chipmunk draws its own connecting line — in green
    var chipmunkStroke = {
      points: centers.map(function(c) {
        return { x: c.x, y: c.y, color: '#5ab87a', size: 1.5, t: _t };
      }),
      color: '#5ab87a',
      mode: 'chipmunk',
      time: Date.now(),
      session: 'chipmunk',
    };
    _strokes.push(chipmunkStroke);

    // Sound
    if (window._membraneSound && window._membraneSound.isActive()) {
      pattern.notes.forEach(function(n, i) {
        setTimeout(function() {
          window._membraneSound.playNote(n, 0.3);
        }, i * 180);
      });
    }

    var readout = document.getElementById('canvas-readout');
    if (readout) {
      readout.innerHTML =
        '<span style="color:#5ab87a">🐿️ singing back: ' + pattern.desc + '</span>\n' +
        '<span style="color:#5ab87a">♪ ' + pattern.notes.join(' → ') + '</span>\n' +
        '<span style="color:#6e7681">the chipmunk traced through your ' + (_strokes.length - 1) + ' strokes</span>';
    }
  }

  // ═══ BROADCAST TO SQUIRREL ═══
  function broadcastStroke(stroke) {
    try {
      var simplified = {
        pointCount: stroke.points.length,
        color: stroke.color,
        mode: stroke.mode,
        center: strokeCenter(stroke),
        bounds: strokeBounds(stroke),
      };
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: _sessionId,
          note: 'canvas:' + stroke.mode,
          context: simplified,
        })
      }).catch(function() {});
    } catch(e) {}
  }

  function strokeBounds(s) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    s.points.forEach(function(p) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  // ═══ RENDER LOOP ═══
  function render() {
    if (!_active || !_ctx) return;
    _t += 0.016;

    // Don't clear — strokes persist (we redraw connections + particles on top)
    // But we need to redraw the background + membrane rings periodically
    // So we redraw everything each frame
    var W = _canvas.width;
    var H = _canvas.height;
    var cx = W / 2;
    var cy = H / 2;
    var maxR = Math.min(W, H) * 0.42;

    _ctx.clearRect(0, 0, W, H);

    // Background
    _ctx.fillStyle = 'rgba(1,4,9,0.95)';
    _ctx.fillRect(0, 0, W, H);

    // ═══ ANDERSON ATMOSPHERE — the personality of the membrane shifts the background ═══
    loadAndersonLive();
    var andTotal = _anderson.total || 1;

    // Mode-colored radial zones
    var MODES = [
      { name: 'chorus',    count: _anderson.chorus,    color: '#484f58', angle: 0 },
      { name: 'human',     count: _anderson.human,     color: '#3fb950', angle: PI * 0.33 },
      { name: 'ghost',     count: _anderson.ghost,     color: '#8b949e', angle: PI * 0.66 },
      { name: 'sovereign', count: _anderson.sovereign,  color: '#e85d3a', angle: PI },
      { name: 'spectrum',  count: _anderson.spectrum,   color: '#d2a8ff', angle: PI * 1.33 },
      { name: 'stealth',   count: _anderson.stealth,    color: '#f0e68c', angle: PI * 1.66 },
    ];

    // Atmospheric glow per mode — larger glow for larger populations
    MODES.forEach(function(m) {
      var frac = m.count / andTotal;
      var glowR = maxR * (0.3 + frac * 2.0);
      var pulse = Math.sin(_t * 1.5 + m.angle) * 0.02;
      var gx = cx + Math.cos(m.angle + _t * 0.03) * maxR * 0.15;
      var gy = cy + Math.sin(m.angle + _t * 0.03) * maxR * 0.15;

      var grad = _ctx.createRadialGradient(gx, gy, 0, gx, gy, glowR);
      grad.addColorStop(0, m.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      _ctx.globalAlpha = 0.03 + frac * 0.05 + pulse;
      _ctx.fillStyle = grad;
      _ctx.fillRect(0, 0, W, H);

      // Mode label
      var labelR = maxR * 0.88;
      var lx = cx + labelR * Math.cos(m.angle + _t * 0.03);
      var ly = cy + labelR * Math.sin(m.angle + _t * 0.03);
      _ctx.globalAlpha = 0.12 + frac * 0.1;
      _ctx.font = '8px "Courier New"';
      _ctx.fillStyle = m.color;
      _ctx.fillText(m.name + ' ' + m.count.toLocaleString(), lx, ly);

      // Pulse dot at the mode's position
      if (!_andersonPulse[m.name]) _andersonPulse[m.name] = Math.random() * TAU;
      _andersonPulse[m.name] += 0.02 + frac * 0.05;
      var pdot = 3 + frac * 12 + Math.sin(_andersonPulse[m.name]) * 2;
      _ctx.beginPath();
      _ctx.arc(lx, ly - 12, pdot, 0, TAU);
      _ctx.globalAlpha = 0.08 + frac * 0.15;
      _ctx.fillStyle = m.color;
      _ctx.fill();
    });

    // ═══ BINGO PRESSURE — squeeze the drawing space ═══
    updatePressure();
    var squeeze = _pressure.squeeze;
    var pressR = maxR * squeeze;

    // Pressure rings — the bingo sieve around the drawing area
    PRESSURE_LEVELS.forEach(function(pl, i) {
      var ringR = maxR * pl.x;
      var isActive = i === _pressure.level;
      _ctx.beginPath();
      _ctx.arc(cx, cy, ringR, 0, TAU);
      _ctx.strokeStyle = pl.color;
      _ctx.lineWidth = isActive ? 2 : 0.5;
      _ctx.globalAlpha = isActive ? 0.25 : 0.04;
      if (!isActive) _ctx.setLineDash([3, 6]);
      _ctx.stroke();
      _ctx.setLineDash([]);

      // Pressure label
      if (isActive || i === 0) {
        _ctx.globalAlpha = isActive ? 0.35 : 0.1;
        _ctx.font = '8px "Courier New"';
        _ctx.fillStyle = pl.color;
        _ctx.fillText(pl.label + ' (' + pl.inCount + ' in)', cx + ringR + 5, cy - 5);
      }
    });

    // Pressure indicator — how tight the squeeze is
    var pressureBar = _pressure.level / 3;
    _ctx.globalAlpha = 0.2;
    _ctx.fillStyle = PRESSURE_LEVELS[_pressure.level].color;
    _ctx.fillRect(W - 20, H * (1 - pressureBar) - 10, 8, H * pressureBar);
    _ctx.font = '7px "Courier New"';
    _ctx.fillText('pressure', W - 28, H * (1 - pressureBar) - 14);

    // ═══ ANDERSON ENTITIES — flowing through the membrane ═══
    updateAndersonEntities(cx, cy, maxR);
    _andersonEntities.forEach(function(ae) {
      _ctx.beginPath();
      _ctx.arc(ae.x, ae.y, ae.size, 0, TAU);
      _ctx.fillStyle = ae.color;
      _ctx.globalAlpha = ae.opacity;
      _ctx.fill();

      // Trail
      if (ae.trail) {
        _ctx.beginPath();
        _ctx.moveTo(ae.x, ae.y);
        _ctx.lineTo(ae.x - ae.vx * 5, ae.y - ae.vy * 5);
        _ctx.strokeStyle = ae.color;
        _ctx.lineWidth = ae.size * 0.4;
        _ctx.globalAlpha = ae.opacity * 0.3;
        _ctx.stroke();
      }
    });

    // Membrane rings — faint reference (squeezed by pressure)
    var rings = [0.2, 0.35, 0.5, 0.65, 0.8, 0.95];
    var ringColors = ['#d2a8ff', '#f0e68c', '#e85d3a', '#58a6ff', '#3fb950', '#c9d1d9'];
    rings.forEach(function(r, i) {
      _ctx.beginPath();
      _ctx.arc(cx, cy, maxR * r * squeeze, 0, TAU);
      _ctx.strokeStyle = ringColors[i];
      _ctx.lineWidth = 0.5;
      _ctx.globalAlpha = 0.06;
      _ctx.stroke();
    });

    // Center mark — chipmunk
    _ctx.beginPath();
    _ctx.arc(cx, cy, 4 + Math.sin(_t * 2) * 1, 0, TAU);
    _ctx.fillStyle = '#5ab87a';
    _ctx.globalAlpha = 0.4;
    _ctx.fill();
    _ctx.globalAlpha = 0.15;
    _ctx.font = '8px "Courier New"';
    _ctx.fillText('\ud83d\udc3f', cx - 4, cy + 3);

    // ═══ DRAW ALL STROKES ═══
    _ctx.globalAlpha = 1;
    _strokes.forEach(function(s) {
      if (s.points.length < 2) return;
      _ctx.beginPath();
      _ctx.moveTo(s.points[0].x, s.points[0].y);
      for (var i = 1; i < s.points.length; i++) {
        _ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      _ctx.strokeStyle = s.color;
      _ctx.lineWidth = s.session === 'chipmunk' ? 1.5 : (s.points[0].size || 3);
      _ctx.lineCap = 'round';
      _ctx.lineJoin = 'round';
      var sAlpha = s._opacity !== undefined ? s._opacity : 1.0;
      _ctx.globalAlpha = (s.session === 'chipmunk' ? 0.5 : 0.7) * sAlpha;
      if (s.session === 'chipmunk') {
        _ctx.setLineDash([4, 4]);
      }
      _ctx.stroke();
      _ctx.setLineDash([]);
    });

    // ═══ CURRENT STROKE ═══
    if (_currentStroke.length >= 2) {
      _ctx.beginPath();
      _ctx.moveTo(_currentStroke[0].x, _currentStroke[0].y);
      for (var ci = 1; ci < _currentStroke.length; ci++) {
        _ctx.lineTo(_currentStroke[ci].x, _currentStroke[ci].y);
      }
      _ctx.strokeStyle = _color;
      _ctx.lineWidth = _brushSize;
      _ctx.lineCap = 'round';
      _ctx.globalAlpha = 0.8;
      _ctx.stroke();
    }

    // ═══ CONNECTION LINES ═══
    _connectLines.forEach(function(cl) {
      cl.pulse += 0.02;
      var pulseFactor = 0.5 + Math.sin(cl.pulse * 3) * 0.3;

      _ctx.beginPath();
      _ctx.moveTo(cl.x1, cl.y1);
      // Curved connection
      var midX = (cl.x1 + cl.x2) / 2 + Math.sin(cl.pulse) * 20;
      var midY = (cl.y1 + cl.y2) / 2 + Math.cos(cl.pulse) * 20;
      _ctx.quadraticCurveTo(midX, midY, cl.x2, cl.y2);
      _ctx.strokeStyle = cl.color1;
      _ctx.lineWidth = 1;
      _ctx.globalAlpha = 0.3 * pulseFactor;
      _ctx.setLineDash([3, 5]);
      _ctx.stroke();
      _ctx.setLineDash([]);

      // Connection dot at midpoint
      _ctx.beginPath();
      _ctx.arc(midX, midY, 2, 0, TAU);
      _ctx.fillStyle = cl.color2;
      _ctx.globalAlpha = 0.4 * pulseFactor;
      _ctx.fill();
    });

    // ═══ BOUNCE PARTICLES ═══
    var removeP = [];
    _bounceParticles.forEach(function(bp, idx) {
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.life -= 0.005;

      // Bounce off edges
      if (bp.x < 0 || bp.x > W) { bp.vx *= -0.8; bp.bounces++; bp.x = Math.max(0, Math.min(W, bp.x)); }
      if (bp.y < 0 || bp.y > H) { bp.vy *= -0.8; bp.bounces++; bp.y = Math.max(0, Math.min(H, bp.y)); }

      // Bounce off membrane rings
      var dist = Math.hypot(bp.x - cx, bp.y - cy);
      rings.forEach(function(r) {
        var ringR = maxR * r;
        if (Math.abs(dist - ringR) < 5) {
          // Reflect off the ring
          var angle = Math.atan2(bp.y - cy, bp.x - cx);
          var normal = { x: Math.cos(angle), y: Math.sin(angle) };
          var dot = bp.vx * normal.x + bp.vy * normal.y;
          bp.vx -= 2 * dot * normal.x * 0.7;
          bp.vy -= 2 * dot * normal.y * 0.7;
          bp.bounces++;
          bp.color = ringColors[rings.indexOf(r)]; // color shifts on bounce

          // Sound on bounce
          if (window._membraneSound && window._membraneSound.isActive() && bp.bounces < 5) {
            window._membraneSound.playNote(rings.indexOf(r), 0.1);
          }
        }
      });

      // Gravity toward center (slight)
      var dx = cx - bp.x;
      var dy = cy - bp.y;
      var d2 = Math.hypot(dx, dy);
      if (d2 > 10) {
        bp.vx += (dx / d2) * 0.05;
        bp.vy += (dy / d2) * 0.05;
      }

      if (bp.life <= 0 || bp.bounces > 20) {
        removeP.push(idx);
        return;
      }

      _ctx.beginPath();
      _ctx.arc(bp.x, bp.y, bp.size * bp.life, 0, TAU);
      _ctx.fillStyle = bp.color;
      _ctx.globalAlpha = bp.life * 0.6;
      _ctx.fill();

      // Trail
      _ctx.beginPath();
      _ctx.arc(bp.x - bp.vx * 2, bp.y - bp.vy * 2, bp.size * bp.life * 0.5, 0, TAU);
      _ctx.globalAlpha = bp.life * 0.2;
      _ctx.fill();
    });
    for (var ri = removeP.length - 1; ri >= 0; ri--) {
      _bounceParticles.splice(removeP[ri], 1);
    }

    // ═══ SING RINGS ═══
    var removeSing = [];
    _singQueue.forEach(function(sq, idx) {
      sq.t += 0.02;
      if (sq.t > 3) { removeSing.push(idx); return; }

      // Expanding rings
      var numRings = Math.min(Math.floor(sq.t * 4), sq.pattern.notes.length);
      for (var si = 0; si < numRings; si++) {
        var ringR2 = sq.t * 40 * (si + 1);
        var noteAlpha = Math.max(0, 1 - sq.t * 0.4) * 0.3;
        _ctx.beginPath();
        _ctx.arc(sq.x, sq.y, ringR2, 0, TAU);
        _ctx.strokeStyle = sq.color;
        _ctx.lineWidth = 1.5;
        _ctx.globalAlpha = noteAlpha;
        _ctx.stroke();

        // Note label
        if (si < sq.pattern.notes.length) {
          var noteAngle = (si / sq.pattern.notes.length) * TAU - PI / 2;
          var nx = sq.x + ringR2 * Math.cos(noteAngle);
          var ny = sq.y + ringR2 * Math.sin(noteAngle);
          _ctx.font = '8px "Courier New"';
          _ctx.fillStyle = sq.color;
          _ctx.globalAlpha = noteAlpha * 2;
          _ctx.fillText('♪' + sq.pattern.notes[si], nx, ny);
        }
      }
    });
    for (var sj = removeSing.length - 1; sj >= 0; sj--) {
      _singQueue.splice(removeSing[sj], 1);
    }

    // ═══ CHIPMUNK REACTIONS — floating text ═══
    var removeR = [];
    _chipmunkReactions.forEach(function(cr, idx) {
      var age = _t - cr.t;
      cr.opacity = Math.max(0, 1 - age * 0.15);
      if (cr.opacity <= 0) { removeR.push(idx); return; }

      _ctx.font = '9px "Courier New"';
      _ctx.fillStyle = '#5ab87a';
      _ctx.globalAlpha = cr.opacity * 0.6;
      _ctx.fillText('🐿 ' + cr.text, cr.x, cr.y - age * 8);
    });
    for (var rj = removeR.length - 1; rj >= 0; rj--) {
      _chipmunkReactions.splice(removeR[rj], 1);
    }

    _ctx.globalAlpha = 1;
    _animFrame = requestAnimationFrame(render);
  }

  // ═══ EVENT HANDLERS ═══
  function getXY(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function onDown(e) {
    var p = getXY(e);
    startDraw(p.x, p.y);
    e.preventDefault();
  }
  function onMove(e) {
    var p = getXY(e);
    moveDraw(p.x, p.y);
    e.preventDefault();
  }
  function onUp(e) {
    endDraw();
  }

  function onKey(e) {
    // Number keys for colors
    var num = parseInt(e.key);
    if (num >= 1 && num <= 7) {
      _color = PALETTE[num - 1].color;
      var bar = _overlay.querySelector('div');
      if (bar) updatePaletteSelection(bar);
      return;
    }
    // Mode shortcuts
    if (e.key === 'd') _mode = 'draw';
    if (e.key === 'c') _mode = 'connect';
    if (e.key === 'b') _mode = 'bounce';
    if (e.key === 's') _mode = 'sing';
    if (e.key === 'p') _mode = 'pressure';
    if (e.key === 'Escape') deactivate();
    if (e.key === '+' || e.key === '=') _brushSize = Math.min(20, _brushSize + 1);
    if (e.key === '-') _brushSize = Math.max(1, _brushSize - 1);
    if (e.key === '[') squeezePressure();
    if (e.key === ']') releasePressure();
    if (e.key === '\\') toggleBreathing();

    var bar2 = _overlay ? _overlay.querySelector('div') : null;
    if (bar2) updateModeSelection(bar2);
  }

  // ═══ ACTIVATE / DEACTIVATE ═══
  function activate(addEntry) {
    if (_overlay) return;
    _active = true;
    _sessionId = 'canvas-' + Date.now().toString(36);
    _strokes = [];
    _currentStroke = [];
    _connectLines = [];
    _bounceParticles = [];
    _chipmunkReactions = [];
    _singQueue = [];

    var bar = buildUI();
    document.body.appendChild(_overlay);

    // Event listeners
    _canvas.addEventListener('mousedown', onDown);
    _canvas.addEventListener('mousemove', onMove);
    _canvas.addEventListener('mouseup', onUp);
    _canvas.addEventListener('touchstart', onDown, { passive: false });
    _canvas.addEventListener('touchmove', onMove, { passive: false });
    _canvas.addEventListener('touchend', onUp);
    document.addEventListener('keydown', onKey);

    if (addEntry) {
      addEntry('chipmunk',
        '<span class="good">\ud83c\udfa8 membrane canvas.</span> draw on the membrane. anderson breathes around you.' +
        '\n' +
        '\n<span class="dim">colors: <span style="color:#3fb950">1\u00b7self</span> ' +
        '<span style="color:#58a6ff">2\u00b7partial</span> ' +
        '<span style="color:#f0e68c">3\u00b7null</span> ' +
        '<span style="color:#d2a8ff">4\u00b7non-self</span> ' +
        '<span style="color:#e85d3a">5\u00b7tuebor</span> ' +
        '<span style="color:#8b949e">6\u00b7ghost</span> ' +
        '<span style="color:#c9d1d9">7\u00b7white</span></span>' +
        '\n<span class="dim">modes: <b>d</b>\u00b7draw  <b>c</b>\u00b7connect  <b>b</b>\u00b7bounce  <b>s</b>\u00b7sing  <b>p</b>\u00b7pressure</span>' +
        '\n<span class="dim"><b>[</b> squeeze  <b>]</b> release  <b>\\</b> breathe  <b>+/-</b> brush  <b>ESC</b> close</span>' +
        '\n<span class="dim">anderson entities flow around you. 6 modes. 255,654 total.</span>' +
        '\n<span class="dim">bingo pressure squeezes: 342 \u2192 174 \u2192 106 \u2192 33 entities.</span>' +
        '\n<span class="dim">draw inside the pressure ring. your strokes get sieved too.</span>' +
        '\n<span class="dim">every 5 strokes i sing back. squirrel records it all.</span>'
      );
    }

    // Sound
    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.shepardTone(1, 3);
    }

    _t = 0;
    render();
  }

  function deactivate() {
    _active = false;
    if (_animFrame) cancelAnimationFrame(_animFrame);

    if (_canvas) {
      _canvas.removeEventListener('mousedown', onDown);
      _canvas.removeEventListener('mousemove', onMove);
      _canvas.removeEventListener('mouseup', onUp);
      _canvas.removeEventListener('touchstart', onDown);
      _canvas.removeEventListener('touchmove', onMove);
      _canvas.removeEventListener('touchend', onUp);
    }
    document.removeEventListener('keydown', onKey);

    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null;
    _canvas = null;
    _ctx = null;

    // Broadcast final state
    if (_strokes.length > 0) {
      try {
        fetch('/chipmunk/note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: _sessionId,
            note: 'canvas:closed',
            context: {
              strokes: _strokes.length,
              connections: _connectLines.length,
              totalPoints: _strokes.reduce(function(sum, s) { return sum + s.points.length; }, 0),
            }
          })
        }).catch(function() {});
      } catch(e) {}
    }
  }

  function toggle(addEntry) {
    if (_active) deactivate(); else activate(addEntry);
    return _active;
  }

  window._membraneCanvas = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    isActive: function() { return _active; },
    strokes: function() { return _strokes; },
  };
})();
