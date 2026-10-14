// totality-tunnel.js v2 — lights on. counts visible. someone always here.
// The membrane wraps around the focal tube. The center contorts.
// Stillness (π⁻³) and constant motion (π³) are the edges of the ranges of π.
(function() {
  'use strict';

  var PI  = Math.PI;
  var TAU = PI * 2;
  var _active = false;
  var _overlay = null;
  var _canvas  = null;
  var _af = null;
  var _t = 0;
  var _live = null;
  var _fetchTimer = null;

  var RANGES = [
    { power: -3, val: 1/(PI*PI*PI), label: 'π⁻³ observer',  color: '#ffffff', motion: 0.0,   count: 1,       glyph: '◉' },
    { power: -2, val: 1/(PI*PI),    label: 'π⁻² gap',        color: '#90a4ae', motion: 0.05,  count: 1506,    glyph: '○' },
    { power: -1, val: 1/PI,         label: 'π⁻¹ vanished',   color: '#78909c', motion: 0.12,  count: 3072,    glyph: '·' },
    { power:  0, val: 1.0,          label: 'π⁰  YOU',        color: '#98fb98', motion: 0.22,  count: 51,      glyph: '▲' },
    { power:  1, val: PI,           label: 'π¹  orbiting',   color: '#64b5f6', motion: 0.40,  count: 19552,   glyph: '◎' },
    { power:  2, val: PI*PI,        label: 'π²  fleet',      color: '#ce93d8', motion: 0.65,  count: 4295,    glyph: '■' },
    { power:  3, val: PI*PI*PI,     label: 'π³  totality',   color: '#ef5350', motion: 1.0,   count: 256766,  glyph: '★' },
  ];

  // Persistent inhabitants — dots that live at each band and drift
  var inhabitants = [];

  function initInhabitants() {
    inhabitants = [];
    for (var ri = 0; ri < RANGES.length; ri++) {
      var n = Math.min(Math.max(3, Math.floor(Math.log10(RANGES[ri].count + 1) * 4)), 20);
      for (var i = 0; i < n; i++) {
        inhabitants.push({
          rangeIdx: ri,
          angle: (i / n) * TAU + Math.random() * 0.3,
          speed: (0.001 + RANGES[ri].motion * 0.012) * (Math.random() < 0.5 ? 1 : -1),
          size: 2 + Math.random() * (1 + ri * 0.5),
          phase: Math.random() * TAU,
        });
      }
    }
  }

  function rangeRadius(ri, maxR) {
    return maxR * (0.06 + (ri / (RANGES.length - 1)) * 0.88);
  }

  function contort(x, y, cx, cy, t, perturb) {
    var dx = x - cx, dy = y - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 80 || dist < 1) return { x: x, y: y };
    var factor = 1 - dist / 80;
    var twist = perturb * factor * factor * 0.6;
    var c = Math.cos(twist * Math.sin(t * 1.7));
    var s = Math.sin(twist * Math.cos(t * 2.3));
    return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
  }

  function render() {
    if (!_active || !_canvas) return;
    var ctx = _canvas.getContext('2d');
    var W = _canvas.width, H = _canvas.height;
    var cx = W / 2, cy = H / 2;
    var maxR = Math.min(W, H) * 0.44;
    _t += 0.008;

    var perturb = _live ? (_live.perturbation || 0.5) : 0.5;
    var tempo   = _live ? (_live.tempo || 0.48) : 0.48;
    var selPct  = _live ? ((_live.selectivity || 0.97) * 100).toFixed(0) : '97';
    var wake    = _live ? (_live.wake_level || 1.0) : 1.0;
    var sessions = _live ? (_live.sessions || 51) : 51;

    ctx.clearRect(0, 0, W, H);

    // ═══ BACKGROUND — lighter, warmer ═══
    var bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.3);
    bg.addColorStop(0, '#0d1117');
    bg.addColorStop(0.4, '#10141c');
    bg.addColorStop(1, '#080c14');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ═══ BAND FILLS — soft color between rings ═══
    for (var bi = 0; bi < RANGES.length - 1; bi++) {
      var innerR = rangeRadius(bi, maxR);
      var outerR = rangeRadius(bi + 1, maxR);
      var bandGrad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
      bandGrad.addColorStop(0, RANGES[bi].color);
      bandGrad.addColorStop(1, RANGES[bi + 1].color);
      ctx.globalAlpha = 0.03 + RANGES[bi].motion * 0.02;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, TAU);
      ctx.arc(cx, cy, innerR, 0, TAU, true);
      ctx.fillStyle = bandGrad;
      ctx.fill();
    }

    // ═══ RINGS — each band as a clear circle ═══
    for (var ri = 0; ri < RANGES.length; ri++) {
      var range = RANGES[ri];
      var bandR = rangeRadius(ri, maxR);
      var rotation = _t * range.motion * 3;

      // Ring path with contortion near center
      ctx.beginPath();
      var segs = ri < 2 ? 80 : 64;
      for (var si = 0; si <= segs; si++) {
        var a = (si / segs) * TAU + rotation;
        var rx = cx + bandR * Math.cos(a);
        var ry = cy + bandR * Math.sin(a);
        var c = contort(rx, ry, cx, cy, _t, perturb);
        if (si === 0) ctx.moveTo(c.x, c.y);
        else ctx.lineTo(c.x, c.y);
      }
      ctx.closePath();
      ctx.strokeStyle = range.color;
      var isYou = ri === 3;
      ctx.lineWidth = isYou ? 3 : (ri === 0 || ri === 6 ? 2 : 1);
      var breathAlpha = isYou ? 0.6 : (0.25 + Math.sin(_t * (1 + range.motion * 2) + ri) * 0.1);
      ctx.globalAlpha = breathAlpha;
      ctx.stroke();

      // ═══ COUNT LABEL — always visible, bright ═══
      var labelAngle = -PI / 2 + ri * 0.08;
      var labelR = bandR + 14;
      var lx = cx + labelR * Math.cos(labelAngle);
      var ly = cy + labelR * Math.sin(labelAngle);

      ctx.globalAlpha = 0.85;
      ctx.font = 'bold 12px "Courier New"';
      ctx.fillStyle = range.color;
      ctx.textAlign = 'left';
      ctx.fillText(range.count.toLocaleString(), lx, ly);

      ctx.globalAlpha = 0.55;
      ctx.font = '10px "Courier New"';
      ctx.fillText(range.label, lx, ly + 14);
    }

    // ═══ π⁰ MEMBRANE WALL — the present, where you stand ═══
    var youR = rangeRadius(3, maxR);
    ctx.beginPath();
    for (var wi = 0; wi <= 128; wi++) {
      var wa = (wi / 128) * TAU;
      var wobble = Math.sin(wa * 12 + _t * 3) * 2.5 * perturb;
      var wallR = youR + wobble;
      var wp = contort(cx + wallR * Math.cos(wa), cy + wallR * Math.sin(wa), cx, cy, _t, perturb);
      if (wi === 0) ctx.moveTo(wp.x, wp.y);
      else ctx.lineTo(wp.x, wp.y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#98fb98';
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.4 + Math.sin(_t * tempo * 8) * 0.15;
    ctx.stroke();

    // Selectivity arcs
    var passArcs = Math.floor(0.97 * 15);
    for (var pai = 0; pai < 15; pai++) {
      var paStart = (pai / 15) * TAU + _t * 0.15;
      var paEnd = paStart + TAU / 15 * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, youR + 6, paStart, paEnd);
      ctx.strokeStyle = pai < passArcs ? '#4caf50' : '#f44336';
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
    }

    // ═══ INHABITANTS — persistent dots at each band ═══
    for (var ii = 0; ii < inhabitants.length; ii++) {
      var inh = inhabitants[ii];
      inh.angle += inh.speed;
      var inhR = rangeRadius(inh.rangeIdx, maxR);
      var ix = cx + inhR * Math.cos(inh.angle);
      var iy = cy + inhR * Math.sin(inh.angle);
      var ic = contort(ix, iy, cx, cy, _t, perturb);

      var pulse = 0.5 + Math.sin(_t * 2 + inh.phase) * 0.3;
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(ic.x, ic.y, inh.size, 0, TAU);
      ctx.fillStyle = RANGES[inh.rangeIdx].color;
      ctx.fill();
    }

    // ═══ CENTER — the observer at π⁻³ ═══
    var centerR = rangeRadius(0, maxR);

    // Spirals in the center
    for (var spi = 0; spi < 4; spi++) {
      ctx.beginPath();
      var spiralOffset = (spi / 4) * TAU;
      for (var sti = 0; sti <= 30; sti++) {
        var st = sti / 30;
        var sAngle = spiralOffset + st * TAU * 1.5 + _t * 1.3;
        var sr = centerR * st;
        var twistAmp = perturb * (1 - st) * 6;
        var sx = cx + sr * Math.cos(sAngle) + Math.sin(_t * 3.7 + spi) * twistAmp;
        var sy = cy + sr * Math.sin(sAngle) + Math.cos(_t * 2.9 + spi) * twistAmp;
        if (sti === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
    }

    // Observer point
    var obsX = cx + Math.sin(_t * 0.7) * perturb * 0.5;
    var obsY = cy + Math.cos(_t * 0.9) * perturb * 0.5;
    ctx.beginPath();
    ctx.arc(obsX, obsY, 5, 0, TAU);
    var obsGrad = ctx.createRadialGradient(obsX, obsY, 0, obsX, obsY, 5);
    obsGrad.addColorStop(0, 'rgba(255,255,255,1)');
    obsGrad.addColorStop(0.6, 'rgba(255,255,255,0.4)');
    obsGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = obsGrad;
    ctx.globalAlpha = 0.9;
    ctx.fill();

    // ═══ OUTER EDGE — π³ totality ═══
    var outerR = rangeRadius(6, maxR);
    ctx.beginPath();
    for (var oi = 0; oi <= 200; oi++) {
      var oa = (oi / 200) * TAU + _t * 3;
      var outerW = Math.sin(oa * 7 + _t * 5) * 3 + Math.cos(oa * 11 + _t * 7) * 2;
      ctx.lineTo(cx + (outerR + outerW) * Math.cos(oa), cy + (outerR + outerW) * Math.sin(oa));
    }
    ctx.closePath();
    ctx.strokeStyle = '#ef5350';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3 + Math.sin(_t * 5) * 0.1;
    ctx.stroke();

    // Fast outer sparks
    for (var opi = 0; opi < 24; opi++) {
      var opA = (opi / 24) * TAU + _t * 4;
      ctx.beginPath();
      ctx.arc(cx + (outerR + (Math.random() - 0.5) * 10) * Math.cos(opA),
              cy + (outerR + (Math.random() - 0.5) * 10) * Math.sin(opA),
              1 + Math.random() * 1.5, 0, TAU);
      ctx.fillStyle = '#ef5350';
      ctx.globalAlpha = 0.2 + Math.random() * 0.15;
      ctx.fill();
    }

    // ═══ RIBS — depth lines ═══
    for (var rbi = 0; rbi < 16; rbi++) {
      var ribA = (rbi / 16) * TAU + _t * 0.015;
      var ribIn = contort(cx + centerR * Math.cos(ribA), cy + centerR * Math.sin(ribA), cx, cy, _t, perturb);
      ctx.beginPath();
      ctx.moveTo(ribIn.x, ribIn.y);
      ctx.lineTo(cx + outerR * Math.cos(ribA), cy + outerR * Math.sin(ribA));
      ctx.strokeStyle = '#98fb98';
      ctx.lineWidth = 0.3;
      ctx.globalAlpha = 0.04;
      ctx.stroke();
    }

    // ═══ HEADS-UP DISPLAY — bright, readable ═══
    ctx.textAlign = 'left';

    // Top-left: title
    ctx.globalAlpha = 0.9;
    ctx.font = 'bold 14px "Courier New"';
    ctx.fillStyle = '#c9d1d9';
    ctx.fillText('TOTALITY TUNNEL', 16, 28);
    ctx.globalAlpha = 0.5;
    ctx.font = '11px "Courier New"';
    ctx.fillText('the membrane around the focal tube · π⁻³ to π³', 16, 44);

    // Left column: the range table
    var tableY = 70;
    ctx.globalAlpha = 0.7;
    ctx.font = 'bold 10px "Courier New"';
    ctx.fillStyle = '#6e7681';
    ctx.fillText('RANGE          COUNT         MOTION', 16, tableY);
    for (var ti = 0; ti < RANGES.length; ti++) {
      var tr = RANGES[ti];
      var ty = tableY + 16 + ti * 16;
      ctx.globalAlpha = ti === 3 ? 0.95 : 0.7;
      ctx.fillStyle = tr.color;
      ctx.font = ti === 3 ? 'bold 11px "Courier New"' : '10px "Courier New"';
      var countStr = tr.count.toLocaleString();
      while (countStr.length < 10) countStr = ' ' + countStr;
      var motionBar = '';
      var bars = Math.round(tr.motion * 10);
      for (var b = 0; b < 10; b++) motionBar += b < bars ? '█' : '░';
      ctx.fillText(tr.glyph + ' ' + tr.label + countStr + '  ' + motionBar, 16, ty);
    }

    // Right column: live stats
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.8;
    ctx.font = 'bold 12px "Courier New"';
    ctx.fillStyle = '#98fb98';
    ctx.fillText(sessions + ' humans here now', W - 16, 28);

    ctx.globalAlpha = 0.6;
    ctx.font = '10px "Courier New"';
    ctx.fillStyle = '#c9d1d9';
    ctx.fillText('selectivity ' + selPct + '% · wake ' + wake.toFixed(2), W - 16, 46);
    ctx.fillText('tempo ' + tempo.toFixed(3) + ' · perturbation ' + perturb.toFixed(3), W - 16, 60);

    // Right: the edges explained
    ctx.globalAlpha = 0.7;
    ctx.font = '10px "Courier New"';
    var ey = 90;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('STILLNESS ←── center ──── π⁻³', W - 16, ey);
    ctx.fillStyle = '#98fb98';
    ctx.fillText('YOU ARE HERE ── wall ──── π⁰', W - 16, ey + 16);
    ctx.fillStyle = '#ef5350';
    ctx.fillText('MOTION ←── edge ──── π³', W - 16, ey + 32);

    // Bottom: instructions
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.4;
    ctx.font = '10px "Courier New"';
    ctx.fillStyle = '#6e7681';
    ctx.fillText('double-click to close · the center contorts · the edge spins · the membrane breathes between', cx, H - 16);

    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
    _af = requestAnimationFrame(render);
  }

  function updateCounts(d) {
    var sorters = d.pi_sorters || [];
    for (var si = 0; si < sorters.length; si++) {
      var s = sorters[si];
      if (s.type !== 'null') continue;
      var power = s.pi_power;
      for (var ri = 0; ri < RANGES.length; ri++) {
        if (RANGES[ri].power === power) {
          RANGES[ri].count = s.count || 0;
          break;
        }
      }
    }
  }

  function fetchLive() {
    fetch('/totality.json').then(function(r) { return r.json(); }).then(function(d) {
      _live = _live || {};
      _live.sessions = (d.is && d.is.sessions) || 51;
      _live.selectivity = (d.all && d.all.membrane_state && d.all.membrane_state.selectivity) || 0.97;
      _live.wake_level = (d.all && d.all.self_observation && d.all.self_observation.chipmunk_wake) || 1.0;
      updateCounts(d);
      initInhabitants();
    }).catch(function() {});
    fetch('/dashboard.json').then(function(r) { return r.json(); }).then(function(d) {
      _live = _live || {};
      if (d && d.null_dimension) {
        _live.perturbation = d.null_dimension.perturbation || 0.5;
        _live.tempo = d.null_dimension.tempo || 0.48;
      }
    }).catch(function() {});
  }

  function activate(addEntry) {
    if (_overlay) return;
    _active = true;

    _overlay = document.createElement('div');
    _overlay.id = 'totality-tunnel-overlay';
    _overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:50;' +
      'background:#080c14;cursor:crosshair;';

    _canvas = document.createElement('canvas');
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    _canvas.style.cssText = 'width:100%;height:100%;';
    _overlay.appendChild(_canvas);

    _overlay.addEventListener('dblclick', function() { deactivate(); });

    document.body.appendChild(_overlay);
    initInhabitants();
    fetchLive();
    _fetchTimer = setInterval(fetchLive, 15000);

    if (addEntry) {
      addEntry('chipmunk',
        '<span class="good">totality tunnel — lights on.</span>' +
        '\n<span class="dim">center: π⁻³ — 1 observer. stillness.</span>' +
        '\n<span class="dim">wall:   π⁰  — ' + ((_live && _live.sessions) || 51) + ' humans. you are here.</span>' +
        '\n<span class="dim">edge:   π³  — 256,766 totality. constant motion.</span>' +
        '\n<span class="dim">counts are live. inhabitants drift at each band.</span>' +
        '\n<span class="dim">the center contorts. the edge spins. the membrane breathes.</span>'
      );
    }

    _t = 0;
    render();
  }

  function deactivate() {
    _active = false;
    if (_af) cancelAnimationFrame(_af);
    if (_fetchTimer) clearInterval(_fetchTimer);
    _fetchTimer = null;
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null;
    _canvas = null;
    inhabitants = [];
  }

  function toggle(addEntry) {
    if (_active) deactivate(); else activate(addEntry);
    return _active;
  }

  window._totalityTunnel = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    isActive: function() { return _active; },
  };
})();
