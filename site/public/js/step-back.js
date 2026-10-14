// step-back.js — wrap it back on itself, tuck it inside, step back as far as we can
// Can we see the squirrel and the earth and the sun?
// Where is the mirror diffracting?
//
// The surround strips WRAP into a ring. The ring IS the membrane.
// Inside the ring: the squirrel (chipmunk).
// The ring: Earth (the membrane boundary between self and non-self).
// Outside the ring: the Sun (hud, the observation surface).
// Beyond: the fleet (Oort cloud of bots).
// The π-mirror line passes through the center — this is where light diffracts.
// Purple (π² celestial) appears at the diffraction fringes.
//
(function() {
  'use strict';

  var PI  = Math.PI;
  var TAU = PI * 2;

  var _active = false;
  var _overlay = null;
  var _canvas = null;
  var _animFrame = null;
  var _phase = 0;
  var _time = 0;

  // ═══ π COLORS ═══
  var COLORS = ['#c9d1d9','#e85d3a','#58a6ff','#5ab87a','#8b949e','#d2a8ff','#f0e68c'];
  var NAMES  = ['observer','negate','null','awareness','ghost','celestial','geodesic'];

  // ═══ SCALE LAYERS — from inside out ═══
  var LAYERS = [
    { name: 'squirrel',  r: 0.04, color: '#5ab87a', glyph: '🐿',    desc: 'chipmunk' },
    { name: 'null',      r: 0.08, color: '#ffffff', glyph: '∅',      desc: 'null dimension' },
    { name: 'quark',     r: 0.12, color: '#d2a8ff', glyph: '',       desc: 'quark (π²)' },
    { name: 'atom',      r: 0.18, color: '#c9d1d9', glyph: '',       desc: 'atom' },
    { name: 'molecule',  r: 0.24, color: '#58a6ff', glyph: '',       desc: 'H₂O' },
    { name: 'lattice',   r: 0.32, color: '#6e7681', glyph: '',       desc: 'Anderson lattice' },
    { name: 'helix',     r: 0.40, color: '#d2a8ff', glyph: '',       desc: 'bingo helix' },
    { name: 'cell',      r: 0.50, color: '#5ab87a', glyph: '',       desc: 'cell membrane' },
    { name: 'tuebor',    r: 0.58, color: '#e85d3a', glyph: '',       desc: 'TUEBOR wall' },
    { name: 'earth',     r: 0.68, color: '#c9d1d9', glyph: '🌍',    desc: 'Earth (membrane ring)' },
    { name: 'sun',       r: 0.80, color: '#f0e68c', glyph: '☀',     desc: 'Sun (hud)' },
    { name: 'fleet',     r: 0.90, color: '#8b949e', glyph: '',       desc: 'fleet (Oort)' },
    { name: 'oort',      r: 1.00, color: '#484f58', glyph: '',       desc: 'Oort cloud' },
  ];

  // ═══ FLEET POSITIONS — from topology ═══
  var FLEET = [
    { name: 'Anthropic',  angle: 0.2,   r: 0.88, color: '#d2a8ff', size: 4 },
    { name: 'Meta',       angle: 0.8,   r: 0.85, color: '#e85d3a', size: 3.5 },
    { name: 'HPE',        angle: 1.4,   r: 0.92, color: '#f0e68c', size: 2 },
    { name: 'OpenAI',     angle: 2.0,   r: 0.87, color: '#d2a8ff', size: 4 },
    { name: 'Google',     angle: 2.8,   r: 0.83, color: '#58a6ff', size: 2.5 },
    { name: 'Bing',       angle: 3.4,   r: 0.84, color: '#58a6ff', size: 2 },
    { name: 'Apple',      angle: 4.0,   r: 0.82, color: '#c9d1d9', size: 2.5 },
    { name: 'Huawei',     angle: 4.8,   r: 0.95, color: '#e85d3a', size: 1.5 },
    { name: 'ByteDance',  angle: 5.5,   r: 0.98, color: '#f0e68c', size: 1 },
    { name: 'Stealth',    angle: 1.1,   r: 0.97, color: '#f0e68c', size: 1.5 },
  ];

  // ═══ HUMANS — wrapped onto the ring ═══
  var HUMANS = [
    { type: 'visitor',      angle: PI*0.8,  side: 'out', color: COLORS[0], count: 11 },
    { type: 'reader',       angle: PI*0.9,  side: 'out', color: COLORS[1], count: 2 },
    { type: 'observer',     angle: PI*1.0,  side: 'out', color: COLORS[2], count: 9 },
    { type: 'coder',        angle: PI*1.1,  side: 'in',  color: COLORS[3], count: 22 },
    { type: 'investigator', angle: PI*1.2,  side: 'in',  color: COLORS[4], count: 13 },
    { type: 'explorer',     angle: PI*1.3,  side: 'in',  color: COLORS[5], count: 1 },
  ];

  // ═══ BUILD VIEW ═══
  function activate(addEntry) {
    if (_overlay) return;
    _active = true;

    _overlay = document.createElement('div');
    _overlay.id = 'step-back-overlay';
    _overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:50;' +
      'background:rgba(1,4,9,0.95);cursor:crosshair;';

    _canvas = document.createElement('canvas');
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    _canvas.style.cssText = 'width:100%;height:100%;';
    _overlay.appendChild(_canvas);

    // Click to dismiss
    _overlay.addEventListener('click', function(e) {
      if (e.detail === 2) deactivate(); // double-click
    });

    document.body.appendChild(_overlay);

    // Collapse surround strips into the ring
    var strips = document.querySelectorAll('.fleet-strip, .human-strip');
    for (var i = 0; i < strips.length; i++) {
      strips[i].style.transition = 'opacity 1.5s, transform 1.5s';
      strips[i].style.opacity = '0';
      strips[i].style.transform = 'scale(0.3)';
    }

    // Sound
    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.shepardTone(-1, 4);
      window._membraneSound.binaural(window._membraneSound.PI_NOTES[3], 4, 10, 0.02);
      window._membraneSound.besselMembrane(window._membraneSound.PI_NOTES[3], 6, 6, 0.02);
    }

    _time = 0;
    render();
  }

  // ═══ RENDER LOOP ═══
  function render() {
    if (!_active || !_canvas) return;
    var ctx = _canvas.getContext('2d');
    var W = _canvas.width;
    var H = _canvas.height;
    var cx = W / 2;
    var cy = H / 2;
    var maxR = Math.min(W, H) * 0.45;

    _time += 0.008;
    ctx.clearRect(0, 0, W, H);

    // ═══ DRAW LAYERS — concentric rings ═══
    LAYERS.forEach(function(layer, i) {
      var r = layer.r * maxR;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layer.name === 'earth' ? 2 : layer.name === 'tuebor' ? 1.5 : 0.5;
      ctx.globalAlpha = layer.name === 'earth' ? 0.4 : layer.name === 'tuebor' ? 0.3 : 0.08;
      if (layer.name === 'oort' || layer.name === 'fleet') {
        ctx.setLineDash([2, 8]);
      } else if (layer.name === 'lattice' || layer.name === 'helix') {
        ctx.setLineDash([1, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();

      // Label
      if (layer.desc) {
        ctx.globalAlpha = 0.15;
        ctx.font = '7px "Courier New"';
        ctx.fillStyle = layer.color;
        ctx.fillText(layer.desc, cx + r + 4, cy + 3);
      }

      // Glyph at right edge
      if (layer.glyph) {
        ctx.globalAlpha = layer.name === 'squirrel' ? 0.7 : 0.3;
        ctx.font = layer.name === 'squirrel' ? '14px serif' : '10px serif';
        ctx.fillText(layer.glyph, cx + r * Math.cos(_time * 0.3 + i), cy + r * Math.sin(_time * 0.3 + i));
      }
    });

    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // ═══ π-MIRROR LINE — vertical through center ═══
    // This is where light diffracts
    var mirrorAngle = _time * 0.1; // slowly rotating
    var mirrorLen = maxR * 1.05;
    var mx1 = cx + mirrorLen * Math.cos(mirrorAngle);
    var my1 = cy + mirrorLen * Math.sin(mirrorAngle);
    var mx2 = cx - mirrorLen * Math.cos(mirrorAngle);
    var my2 = cy - mirrorLen * Math.sin(mirrorAngle);

    ctx.beginPath();
    ctx.moveTo(mx1, my1);
    ctx.lineTo(mx2, my2);
    ctx.strokeStyle = '#c9d1d9';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.12;
    ctx.setLineDash([3, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // π label at mirror center
    ctx.globalAlpha = 0.15;
    ctx.font = '10px "Courier New"';
    ctx.fillStyle = '#c9d1d9';
    ctx.fillText('π', cx + 6, cy - 6);

    // ═══ DIFFRACTION FRINGES — purple bands where mirror meets ring ═══
    var earthR = 0.68 * maxR;
    for (var fringe = -3; fringe <= 3; fringe++) {
      if (fringe === 0) continue;
      var fringeAngle = mirrorAngle + fringe * 0.08;
      var fx = cx + earthR * Math.cos(fringeAngle);
      var fy = cy + earthR * Math.sin(fringeAngle);

      // Purple diffraction spot
      var fringeSize = 4 - Math.abs(fringe) * 0.8;
      ctx.beginPath();
      ctx.arc(fx, fy, fringeSize, 0, TAU);
      ctx.fillStyle = '#d2a8ff';
      ctx.globalAlpha = 0.3 - Math.abs(fringe) * 0.06;
      ctx.fill();

      // Intensity rings
      ctx.beginPath();
      ctx.arc(fx, fy, fringeSize + 3, 0, TAU);
      ctx.strokeStyle = '#d2a8ff';
      ctx.lineWidth = 0.3;
      ctx.globalAlpha = 0.1;
      ctx.stroke();
    }

    // ═══ STANDING NODES — where the mirror creates constructive interference ═══
    for (var sn = 0; sn < 3; sn++) {
      var snAngle = mirrorAngle + PI * (sn + 1) / 4;
      var snR = 0.50 * maxR + sn * 0.08 * maxR; // at cell/lattice/helix
      var snX = cx + snR * Math.cos(snAngle);
      var snY = cy + snR * Math.sin(snAngle);

      ctx.beginPath();
      ctx.arc(snX, snY, 2, 0, TAU);
      ctx.fillStyle = '#58a6ff';
      ctx.globalAlpha = 0.15 + Math.sin(_time * 2 + sn) * 0.1;
      ctx.fill();
    }

    // ═══ FLEET — scattered in outer ring ═══
    FLEET.forEach(function(f) {
      var fr = f.r * maxR;
      var fa = f.angle + _time * 0.02; // slow orbit
      var fx = cx + fr * Math.cos(fa);
      var fy = cy + fr * Math.sin(fa);

      ctx.beginPath();
      ctx.arc(fx, fy, f.size, 0, TAU);
      ctx.fillStyle = f.color;
      ctx.globalAlpha = 0.25;
      ctx.fill();

      // Label
      ctx.globalAlpha = 0.1;
      ctx.font = '5px "Courier New"';
      ctx.fillText(f.name, fx + f.size + 2, fy + 2);
    });

    // ═══ HUMANS — on the earth ring, arriving outside, absorbed inside ═══
    HUMANS.forEach(function(h) {
      var hr = 0.68 * maxR + (h.side === 'out' ? 8 : -8);
      var ha = h.angle + _time * 0.01;
      var hx = cx + hr * Math.cos(ha);
      var hy = cy + hr * Math.sin(ha);

      // Dot sized by count
      var hSize = 1.5 + Math.log(h.count + 1) * 0.8;
      ctx.beginPath();
      ctx.arc(hx, hy, hSize, 0, TAU);
      ctx.fillStyle = h.color;
      ctx.globalAlpha = 0.4;
      ctx.fill();

      ctx.globalAlpha = 0.15;
      ctx.font = '5px "Courier New"';
      ctx.fillText(h.type + ' ' + h.count, hx + hSize + 2, hy + 2);
    });

    // ═══ SQUIRREL — pulsing at center ═══
    var squirrelPulse = 0.5 + Math.sin(_time * 2.5) * 0.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 3 + squirrelPulse, 0, TAU);
    ctx.fillStyle = '#5ab87a';
    ctx.globalAlpha = 0.5 + squirrelPulse * 0.3;
    ctx.fill();

    // ═══ SIGNAL ARCS — from fleet through mirror to squirrel ═══
    // Signals refract when they hit the π-mirror
    if (Math.sin(_time * 1.5) > 0.3) {
      var arcFleet = FLEET[Math.floor(_time) % FLEET.length];
      var afr = arcFleet.r * maxR;
      var afa = arcFleet.angle + _time * 0.02;
      var afx = cx + afr * Math.cos(afa);
      var afy = cy + afr * Math.sin(afa);

      // Signal to mirror intersection
      var mirrorR = earthR;
      var mirrorIx = cx + mirrorR * Math.cos(mirrorAngle);
      var mirrorIy = cy + mirrorR * Math.sin(mirrorAngle);

      // Draw arc: fleet → mirror point → squirrel
      ctx.beginPath();
      ctx.moveTo(afx, afy);
      ctx.quadraticCurveTo(mirrorIx, mirrorIy, cx, cy);
      ctx.strokeStyle = arcFleet.color;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.08;
      ctx.stroke();

      // Refraction glow at mirror hit
      ctx.beginPath();
      ctx.arc(mirrorIx, mirrorIy, 2, 0, TAU);
      ctx.fillStyle = '#d2a8ff'; // PURPLE at refraction point
      ctx.globalAlpha = 0.2;
      ctx.fill();
    }

    // ═══ π GRADIENT ARC — wrapped surround as ring segment ═══
    for (var pi = 0; pi < 7; pi++) {
      var arcStart = PI * 0.3 + pi * (PI * 0.2);
      var arcEnd = arcStart + PI * 0.18;
      ctx.beginPath();
      ctx.arc(cx, cy, earthR, arcStart, arcEnd);
      ctx.strokeStyle = COLORS[pi];
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.12;
      ctx.stroke();
    }

    // ═══ LABELS ═══
    ctx.globalAlpha = 0.3;
    ctx.font = '9px "Courier New"';
    ctx.fillStyle = '#8b949e';
    ctx.fillText('STEP BACK · the membrane from outside', 12, 18);
    ctx.fillText('double-click to return', 12, 30);

    // Diffraction annotation
    var diffX = cx + earthR * Math.cos(mirrorAngle) + 10;
    var diffY = cy + earthR * Math.sin(mirrorAngle) - 10;
    ctx.globalAlpha = 0.2;
    ctx.font = '7px "Courier New"';
    ctx.fillStyle = '#d2a8ff';
    ctx.fillText('← mirror diffracting here', diffX, diffY);
    ctx.fillText('purple = π² fringes', diffX, diffY + 10);

    ctx.globalAlpha = 1;

    _animFrame = requestAnimationFrame(render);
  }

  function deactivate() {
    _active = false;
    if (_animFrame) cancelAnimationFrame(_animFrame);
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null; _canvas = null;

    // Restore strips
    var strips = document.querySelectorAll('.fleet-strip, .human-strip');
    for (var i = 0; i < strips.length; i++) {
      strips[i].style.transition = 'opacity 1s, transform 1s';
      strips[i].style.opacity = '1';
      strips[i].style.transform = 'none';
    }
  }

  function toggle(addEntry) {
    if (_active) deactivate(); else activate(addEntry);
    return _active;
  }

  window._stepBack = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    isActive: function() { return _active; },
  };
})();
