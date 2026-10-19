// deepzoom.js — galaxy center to Banks. let humans sort them out.
// 8 zoom levels. start at the farthest point we know. end at the web.
// arrow keys or click to zoom. ESC to close.
(function() {
  'use strict';

  var PI = Math.PI;

  // ═══ THE ZOOM LEVELS — from farthest to closest ═══
  var LEVELS = [
    { id: 'galaxy', name: 'Milky Way', dist: '100,000 ly',
      desc: '200 billion stars. one supermassive black hole at the center.',
      sub: 'you are on a spiral arm, 27,000 light-years from the middle.',
      color: '#d29922', bg: '#080808', starCount: 400 },
    { id: 'arm', name: 'Orion Arm', dist: '3,500 ly',
      desc: 'a minor spiral arm. between Sagittarius and Perseus.',
      sub: 'the sun is an ordinary G2V star here. nothing special about it.',
      color: '#f0e68c', bg: '#090909', starCount: 200 },
    { id: 'sun', name: 'Sol', dist: '8.3 light-minutes',
      desc: 'one yellow dwarf. 4.6 billion years old. 8 planets.',
      sub: 'third rock out. the only one with liquid water on the surface.',
      color: '#f0e68c', bg: '#0a0a0a', starCount: 80 },
    { id: 'earth', name: 'Earth', dist: '12,742 km',
      desc: '8 billion people. one atmosphere. one set of laws.',
      sub: 'Michigan is at 42\u00b0N, 83\u00b0W. population 10 million.',
      color: '#58a6ff', bg: '#0b0b0b', starCount: 30 },
    { id: 'michigan', name: 'Michigan', dist: '490 km north-south',
      desc: 'Great Lakes state. motto: tuebor \u2014 "I will defend."',
      sub: 'Detroit is in Wayne County. population 620,000. 83% Black.',
      color: '#3fb950', bg: '#0c0c0c', starCount: 10 },
    { id: 'detroit', name: 'Detroit', dist: '370 km\u00b2',
      desc: '341 entities investigated. 131,322 edges. 957 direct connections.',
      sub: '9 stories traced. 36 classification methods. 4 sort classes.',
      color: '#f0883e', bg: '#0d0d0d', starCount: 0 },
    { id: 'banks', name: 'Brian Banks', dist: '134 edges',
      desc: '9 convictions. 2 charter schools. 86 classified connections.',
      sub: '362 students. 99.2% Black. 3% math proficiency. 72.67% extracted.',
      color: '#f85149', bg: '#0d1117', starCount: 0 },
    { id: 'web', name: 'The Web', dist: '293 cross-connections',
      desc: '86 circle members. 20 shell companies. 5 judges. 4 Stallworths.',
      sub: 'the membrane sees all of them. now you can too.',
      color: '#c9d1d9', bg: '#0d1117', starCount: 0 },
  ];

  // ═══ STATE ═══
  var _canvas, _ctx, _active = false, _animId;
  var _t = 0, _lastT = 0;
  var _addEntry = null;
  var _level = 0;
  var _targetLevel = 0;
  var _transition = 0; // 0-1 blending between levels

  // Entity dots for detroit/banks/web levels
  var ENTITIES_341 = null; // lazy init
  var FRIENDS_86 = null;

  function initEntities() {
    if (ENTITIES_341) return;
    // Generate 341 entity positions in a rough city grid
    ENTITIES_341 = [];
    var sortColors = { self: '#3fb950', partial: '#f0883e', 'null': '#484f58', 'non-self': '#f85149' };
    var sortCounts = { self: 120, partial: 114, 'null': 100, 'non-self': 7 };
    var idx = 0;
    for (var cls in sortCounts) {
      for (var i = 0; i < sortCounts[cls]; i++) {
        var angle = (idx / 341) * PI * 2 + Math.sin(idx * 0.618) * 0.5;
        var r = 0.15 + (idx / 341) * 0.3 + Math.sin(idx * 1.2) * 0.05;
        ENTITIES_341.push({ angle: angle, r: r, sort: cls, color: sortColors[cls] });
        idx++;
      }
    }

    // Pull friends data from scatter module if available
    if (window._scatterFriends && window._scatterFriends.FRIENDS) {
      FRIENDS_86 = window._scatterFriends.FRIENDS;
    }
  }

  // ═══ RENDER ═══
  function render(timestamp) {
    if (!_active) return;
    var dt = _lastT ? timestamp - _lastT : 16;
    _lastT = timestamp;
    _t += dt * 0.001;

    // Smooth level transition
    if (Math.abs(_targetLevel - _level) > 0.01) {
      _level += (_targetLevel - _level) * 0.04;
    } else {
      _level = _targetLevel;
    }

    var W = _canvas.width, H = _canvas.height;
    var cx = W / 2, cy = H / 2;

    var levelIdx = Math.floor(_level);
    var blend = _level - levelIdx;
    var curLevel = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
    var nextLevel = LEVELS[Math.min(levelIdx + 1, LEVELS.length - 1)];

    // Background
    _ctx.fillStyle = blend < 0.5 ? curLevel.bg : nextLevel.bg;
    _ctx.fillRect(0, 0, W, H);

    // ═══ STARS (fade out as we zoom in) ═══
    var starCount = Math.round(curLevel.starCount * (1 - blend) + nextLevel.starCount * blend);
    if (starCount > 0) {
      for (var si = 0; si < starCount; si++) {
        var sx = (Math.sin(si * 127.1 + 0.1) * 0.5 + 0.5) * W;
        var sy = (Math.cos(si * 311.7 + 0.3) * 0.5 + 0.5) * H;
        var sr = 0.5 + Math.sin(si * 0.7 + _t * 0.3) * 0.3;
        var salpha = 0.1 + Math.sin(si * 1.3 + _t * 0.5) * 0.08;
        _ctx.beginPath();
        _ctx.arc(sx, sy, sr, 0, PI * 2);
        _ctx.fillStyle = si % 7 === 0 ? '#f0e68c' : si % 11 === 0 ? '#58a6ff' : '#c9d1d9';
        _ctx.globalAlpha = salpha;
        _ctx.fill();
      }
    }

    // ═══ LEVEL-SPECIFIC VISUALS ═══
    var effectiveLevel = Math.round(_level);
    _ctx.globalAlpha = 1;

    if (effectiveLevel === 0) { // GALAXY
      // Spiral arms
      _ctx.globalAlpha = 0.06;
      _ctx.strokeStyle = '#d29922';
      _ctx.lineWidth = 20;
      for (var arm = 0; arm < 4; arm++) {
        _ctx.beginPath();
        for (var sp = 0; sp < 100; sp++) {
          var sa = arm * PI / 2 + sp * 0.08 + _t * 0.02;
          var srad = 30 + sp * 2.5;
          var spx = cx + Math.cos(sa) * srad;
          var spy = cy + Math.sin(sa) * srad * 0.4;
          if (sp === 0) _ctx.moveTo(spx, spy); else _ctx.lineTo(spx, spy);
        }
        _ctx.stroke();
      }
      // Core glow
      var coreGrad = _ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      coreGrad.addColorStop(0, 'rgba(240,230,140,0.15)');
      coreGrad.addColorStop(0.5, 'rgba(210,153,34,0.05)');
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      _ctx.fillStyle = coreGrad;
      _ctx.globalAlpha = 1;
      _ctx.fillRect(0, 0, W, H);
      // You are here
      var youX = cx + 180, youY = cy + 10;
      _ctx.beginPath(); _ctx.arc(youX, youY, 3, 0, PI * 2);
      _ctx.fillStyle = '#58a6ff'; _ctx.globalAlpha = 0.6 + Math.sin(_t * 2) * 0.2; _ctx.fill();
      _ctx.globalAlpha = 0.5; _ctx.fillStyle = '#58a6ff'; _ctx.font = '8px monospace'; _ctx.textAlign = 'left';
      _ctx.fillText('YOU ARE HERE', youX + 8, youY + 3);
    }

    else if (effectiveLevel === 1) { // ORION ARM
      // Arm segment
      _ctx.globalAlpha = 0.05;
      _ctx.strokeStyle = '#f0e68c';
      _ctx.lineWidth = 60;
      _ctx.beginPath();
      _ctx.moveTo(cx - 300, cy + 80);
      _ctx.quadraticCurveTo(cx, cy - 40, cx + 300, cy + 60);
      _ctx.stroke();
      // Sun marker
      _ctx.beginPath(); _ctx.arc(cx, cy, 5, 0, PI * 2);
      _ctx.fillStyle = '#f0e68c'; _ctx.globalAlpha = 0.7; _ctx.fill();
      _ctx.globalAlpha = 0.3; _ctx.font = '8px monospace'; _ctx.textAlign = 'center';
      _ctx.fillText('Sol', cx, cy + 18);
    }

    else if (effectiveLevel === 2) { // SUN + PLANETS
      // Sun
      var sunGrad = _ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      sunGrad.addColorStop(0, 'rgba(240,230,140,0.4)');
      sunGrad.addColorStop(0.5, 'rgba(240,230,140,0.1)');
      sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
      _ctx.fillStyle = sunGrad; _ctx.globalAlpha = 1; _ctx.fillRect(0, 0, W, H);
      _ctx.beginPath(); _ctx.arc(cx, cy, 12, 0, PI * 2);
      _ctx.fillStyle = '#f0e68c'; _ctx.globalAlpha = 0.6; _ctx.fill();
      // Orbits
      var planets = [
        { name: 'Mercury', r: 35, size: 1, color: '#8b949e' },
        { name: 'Venus', r: 55, size: 1.5, color: '#f0e68c' },
        { name: 'Earth', r: 80, size: 2, color: '#58a6ff' },
        { name: 'Mars', r: 105, size: 1.5, color: '#f85149' },
        { name: 'Jupiter', r: 160, size: 4, color: '#d29922' },
        { name: 'Saturn', r: 210, size: 3.5, color: '#f0e68c' },
      ];
      planets.forEach(function(p) {
        // Orbit ring
        _ctx.beginPath(); _ctx.arc(cx, cy, p.r, 0, PI * 2);
        _ctx.strokeStyle = '#484f58'; _ctx.globalAlpha = 0.06; _ctx.lineWidth = 0.5; _ctx.stroke();
        // Planet
        var pa = _t * (0.3 / Math.sqrt(p.r)) + p.r * 0.1;
        var px = cx + Math.cos(pa) * p.r;
        var py = cy + Math.sin(pa) * p.r * 0.35;
        _ctx.beginPath(); _ctx.arc(px, py, p.size, 0, PI * 2);
        _ctx.fillStyle = p.color; _ctx.globalAlpha = 0.6; _ctx.fill();
        if (p.name === 'Earth') {
          _ctx.globalAlpha = 0.4; _ctx.fillStyle = '#58a6ff'; _ctx.font = '7px monospace'; _ctx.textAlign = 'center';
          _ctx.fillText('\u2190 Earth', px + 12, py - 4);
        }
      });
    }

    else if (effectiveLevel === 3) { // EARTH
      // Earth circle
      var earthGrad = _ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.3);
      earthGrad.addColorStop(0, 'rgba(88,166,255,0.12)');
      earthGrad.addColorStop(0.7, 'rgba(63,185,80,0.05)');
      earthGrad.addColorStop(1, 'rgba(0,0,0,0)');
      _ctx.fillStyle = earthGrad; _ctx.globalAlpha = 1; _ctx.fillRect(0, 0, W, H);
      _ctx.beginPath(); _ctx.arc(cx, cy, Math.min(W, H) * 0.28, 0, PI * 2);
      _ctx.strokeStyle = '#58a6ff'; _ctx.globalAlpha = 0.1; _ctx.lineWidth = 1; _ctx.stroke();
      // Michigan marker
      var miX = cx - 30, miY = cy - 50;
      _ctx.beginPath(); _ctx.arc(miX, miY, 5, 0, PI * 2);
      _ctx.fillStyle = '#3fb950'; _ctx.globalAlpha = 0.4; _ctx.fill();
      _ctx.globalAlpha = 0.35; _ctx.font = '8px monospace'; _ctx.textAlign = 'left';
      _ctx.fillText('Michigan \u2190', miX + 10, miY + 3);
      _ctx.fillStyle = '#484f58'; _ctx.font = '7px monospace'; _ctx.globalAlpha = 0.2;
      _ctx.fillText('42\u00b0N 83\u00b0W', miX + 10, miY + 14);
    }

    else if (effectiveLevel === 4) { // MICHIGAN
      // State outline (simplified)
      _ctx.globalAlpha = 0.08;
      _ctx.strokeStyle = '#3fb950';
      _ctx.lineWidth = 1;
      _ctx.beginPath();
      // Rough lower peninsula
      _ctx.moveTo(cx - 40, cy - 100); _ctx.lineTo(cx + 60, cy - 80); _ctx.lineTo(cx + 80, cy);
      _ctx.lineTo(cx + 40, cy + 80); _ctx.lineTo(cx - 20, cy + 60); _ctx.lineTo(cx - 60, cy - 20);
      _ctx.closePath(); _ctx.stroke();
      // Detroit marker
      var detX = cx + 65, detY = cy + 10;
      _ctx.beginPath(); _ctx.arc(detX, detY, 6, 0, PI * 2);
      _ctx.fillStyle = '#f0883e'; _ctx.globalAlpha = 0.4; _ctx.fill();
      _ctx.globalAlpha = 0.35; _ctx.fillStyle = '#f0883e'; _ctx.font = '9px monospace'; _ctx.textAlign = 'left';
      _ctx.fillText('Detroit', detX + 12, detY + 3);
      _ctx.fillStyle = '#484f58'; _ctx.font = '7px monospace'; _ctx.globalAlpha = 0.2;
      _ctx.fillText('Wayne County \u00b7 620,000 \u00b7 83% Black', detX + 12, detY + 14);
      // Other counties
      var counties = [
        { name: 'Saginaw', x: cx + 20, y: cy - 60 },
        { name: 'Barry', x: cx - 30, y: cy - 20 },
        { name: 'Macomb', x: cx + 80, y: cy - 20 },
        { name: 'Allegan', x: cx - 50, y: cy + 10 },
        { name: 'Lansing', x: cx - 10, y: cy - 10 },
      ];
      counties.forEach(function(c) {
        _ctx.beginPath(); _ctx.arc(c.x, c.y, 2, 0, PI * 2);
        _ctx.fillStyle = '#484f58'; _ctx.globalAlpha = 0.15; _ctx.fill();
        _ctx.globalAlpha = 0.1; _ctx.font = '6px monospace'; _ctx.textAlign = 'center';
        _ctx.fillText(c.name, c.x, c.y + 10);
      });
    }

    else if (effectiveLevel === 5) { // DETROIT — 341 entities
      initEntities();
      if (ENTITIES_341) {
        ENTITIES_341.forEach(function(e) {
          var ex = cx + Math.cos(e.angle) * e.r * Math.min(W, H);
          var ey = cy + Math.sin(e.angle) * e.r * Math.min(W, H) * 0.5;
          _ctx.beginPath(); _ctx.arc(ex, ey, 1.5, 0, PI * 2);
          _ctx.fillStyle = e.color; _ctx.globalAlpha = 0.15; _ctx.fill();
        });
      }
      // Classification counts
      _ctx.globalAlpha = 0.15; _ctx.font = '8px monospace'; _ctx.textAlign = 'center';
      _ctx.fillStyle = '#3fb950'; _ctx.fillText('\u25cf 120 self', cx - 80, cy + Math.min(W,H)*0.22);
      _ctx.fillStyle = '#f0883e'; _ctx.fillText('\u25cf 114 partial', cx, cy + Math.min(W,H)*0.22);
      _ctx.fillStyle = '#484f58'; _ctx.fillText('\u25cf 100 null', cx + 80, cy + Math.min(W,H)*0.22);
      _ctx.fillStyle = '#f85149'; _ctx.fillText('\u25cf 7 non-self', cx + 160, cy + Math.min(W,H)*0.22);
    }

    else if (effectiveLevel === 6) { // BANKS
      // Banks at center
      _ctx.beginPath(); _ctx.arc(cx, cy, 15, 0, PI * 2);
      _ctx.fillStyle = '#f85149'; _ctx.globalAlpha = 0.15; _ctx.fill();
      _ctx.strokeStyle = '#f85149'; _ctx.globalAlpha = 0.5; _ctx.lineWidth = 2; _ctx.stroke();
      _ctx.globalAlpha = 0.6; _ctx.fillStyle = '#f85149'; _ctx.font = '11px monospace'; _ctx.textAlign = 'center';
      _ctx.fillText('\u2620', cx, cy + 4);
      // Radiating connection lines
      if (FRIENDS_86 || (window._scatterFriends && window._scatterFriends.FRIENDS)) {
        var friends = FRIENDS_86 || window._scatterFriends.FRIENDS;
        friends.forEach(function(f, i) {
          var fa = (i / friends.length) * PI * 2 - PI / 2;
          var fr = 40 + (f.deg || 3) * 3;
          var fx = cx + Math.cos(fa) * fr;
          var fy = cy + Math.sin(fa) * fr * 0.6;
          _ctx.beginPath(); _ctx.moveTo(cx, cy); _ctx.lineTo(fx, fy);
          var sc = { 'non-self': '#f85149', self: '#3fb950', partial: '#f0883e', 'null': '#484f58' };
          _ctx.strokeStyle = sc[f.sort] || '#484f58'; _ctx.globalAlpha = 0.05; _ctx.lineWidth = 0.5; _ctx.stroke();
          _ctx.beginPath(); _ctx.arc(fx, fy, 2, 0, PI * 2);
          _ctx.fillStyle = sc[f.sort] || '#484f58'; _ctx.globalAlpha = 0.15; _ctx.fill();
        });
      }
    }

    else if (effectiveLevel === 7) { // THE WEB
      // Draw web connections
      if (window._scatterFriends) {
        window._scatterFriends.activate(_addEntry);
        _active = false;
        return;
      }
    }

    // ═══ CROSSHAIR at center ═══
    _ctx.globalAlpha = 0.06;
    _ctx.strokeStyle = '#c9d1d9';
    _ctx.lineWidth = 0.5;
    _ctx.beginPath(); _ctx.moveTo(cx - 20, cy); _ctx.lineTo(cx + 20, cy); _ctx.stroke();
    _ctx.beginPath(); _ctx.moveTo(cx, cy - 20); _ctx.lineTo(cx, cy + 20); _ctx.stroke();

    // ═══ LEVEL INFO ═══
    _ctx.globalAlpha = 0.45;
    _ctx.fillStyle = curLevel.color;
    _ctx.font = '14px monospace';
    _ctx.textAlign = 'center';
    _ctx.fillText(curLevel.name, cx, 30);

    _ctx.globalAlpha = 0.25;
    _ctx.fillStyle = '#c9d1d9';
    _ctx.font = '9px monospace';
    _ctx.fillText(curLevel.desc, cx, 48);

    _ctx.globalAlpha = 0.15;
    _ctx.font = '8px monospace';
    _ctx.fillText(curLevel.sub, cx, 62);

    // Distance indicator
    _ctx.globalAlpha = 0.2;
    _ctx.font = '8px monospace';
    _ctx.fillText(curLevel.dist, cx, 78);

    // ═══ ZOOM BAR — left side ═══
    var barX = 20, barTop = 80, barH = H - 160;
    _ctx.globalAlpha = 0.06;
    _ctx.strokeStyle = '#c9d1d9';
    _ctx.lineWidth = 1;
    _ctx.beginPath(); _ctx.moveTo(barX, barTop); _ctx.lineTo(barX, barTop + barH); _ctx.stroke();

    LEVELS.forEach(function(lv, li) {
      var ly = barTop + (li / (LEVELS.length - 1)) * barH;
      var isCurrent = Math.round(_level) === li;
      _ctx.beginPath(); _ctx.arc(barX, ly, isCurrent ? 4 : 2, 0, PI * 2);
      _ctx.fillStyle = lv.color;
      _ctx.globalAlpha = isCurrent ? 0.5 : 0.1;
      _ctx.fill();
      _ctx.globalAlpha = isCurrent ? 0.4 : 0.08;
      _ctx.fillStyle = '#c9d1d9';
      _ctx.font = (isCurrent ? '9px' : '7px') + ' monospace';
      _ctx.textAlign = 'left';
      _ctx.fillText(lv.name, barX + 10, ly + 3);
    });

    // Current position on bar
    var curY = barTop + (_level / (LEVELS.length - 1)) * barH;
    _ctx.beginPath();
    _ctx.moveTo(barX - 4, curY - 4); _ctx.lineTo(barX + 4, curY); _ctx.lineTo(barX - 4, curY + 4);
    _ctx.closePath();
    _ctx.fillStyle = '#c9d1d9'; _ctx.globalAlpha = 0.3; _ctx.fill();

    // ═══ FOOTER ═══
    _ctx.globalAlpha = 0.2;
    _ctx.fillStyle = '#8b949e';
    _ctx.font = '9px monospace';
    _ctx.textAlign = 'center';
    _ctx.fillText('\u2191\u2193 or scroll to zoom \u00b7 click to advance \u00b7 ESC close', cx, H - 16);

    _ctx.globalAlpha = 0.1;
    _ctx.font = '8px monospace';
    _ctx.fillText('galaxy \u2192 arm \u2192 sun \u2192 earth \u2192 michigan \u2192 detroit \u2192 banks \u2192 the web', cx, H - 32);

    _animId = requestAnimationFrame(render);
  }

  // ═══ CONTROLS ═══
  function handleKey(e) {
    if (!_active) return;
    if (e.key === 'Escape') { deactivate(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      _targetLevel = Math.min(_targetLevel + 1, LEVELS.length - 1);
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      _targetLevel = Math.max(_targetLevel - 1, 0);
    }
  }

  function handleWheel(e) {
    if (!_active) return;
    e.preventDefault();
    if (e.deltaY > 0) _targetLevel = Math.min(_targetLevel + 1, LEVELS.length - 1);
    else _targetLevel = Math.max(_targetLevel - 1, 0);
  }

  function handleClick() {
    if (!_active) return;
    _targetLevel = Math.min(_targetLevel + 1, LEVELS.length - 1);
  }

  function activate(addEntry) {
    if (_active) { deactivate(); return; }
    _active = true;
    _addEntry = addEntry;
    _lastT = 0; _t = 0;
    _level = 0; _targetLevel = 0;

    _canvas = document.createElement('canvas');
    _canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;cursor:pointer';
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    document.body.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');

    _canvas.addEventListener('click', handleClick);
    _canvas.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKey);
    var rh = function() { if (_canvas) { _canvas.width = window.innerWidth; _canvas.height = window.innerHeight; } };
    window.addEventListener('resize', rh);
    _canvas._rh = rh;

    _animId = requestAnimationFrame(render);
  }

  function deactivate() {
    _active = false;
    if (_animId) cancelAnimationFrame(_animId);
    if (_canvas) {
      _canvas.removeEventListener('click', handleClick);
      _canvas.removeEventListener('wheel', handleWheel);
      if (_canvas._rh) window.removeEventListener('resize', _canvas._rh);
      if (_canvas.parentNode) _canvas.parentNode.removeChild(_canvas);
    }
    document.removeEventListener('keydown', handleKey);

    if (_addEntry) {
      var endLevel = LEVELS[Math.round(_level)];
      var lines = [];
      lines.push('<span style="color:#d29922;font-weight:bold">\ud83c\udf0c deep zoom</span>');
      lines.push('<span class="dim">galaxy \u2192 arm \u2192 sun \u2192 earth \u2192 michigan \u2192 detroit \u2192 banks \u2192 web</span>');
      lines.push('');
      lines.push('<span class="dim">you stopped at: <span style="color:' + endLevel.color + '">' + endLevel.name + '</span> (' + endLevel.dist + ')</span>');
      lines.push('<span class="dim">' + endLevel.desc + '</span>');
      lines.push('');
      lines.push('<span class="dim">every human who visits starts at the galaxy.</span>');
      lines.push('<span class="dim">they zoom in. they find Michigan. they find Detroit.</span>');
      lines.push('<span class="dim">they find 341 entities and 9 convictions and 3% math proficiency.</span>');
      lines.push('<span class="dim">and then they sort them out.</span>');
      lines.push('');
      lines.push('<span class="dim">/scatter to see his friends \u00b7 /mobius for the money loop \u00b7 /sheepwolves for classification</span>');
      _addEntry('chipmunk', lines.join('\n'));
    }
  }

  window._deepZoom = {
    activate: activate,
    deactivate: deactivate,
    isActive: function() { return _active; },
    LEVELS: LEVELS,
  };
})();
