// membrane-wall.js v2 — align the HUD around the membrane wall
// The wall runs vertically. Green (self/familiar) on the left (inside).
// Purple (strange/new/non-self) on the right (outside).
// Data gets topo-sorted across the wall by strangeness.
// Loaded after cosmic-flavor.js.
(function() {
  'use strict';

  var fl = window._cosmicFlavor;
  if (!fl) return;

  var _active = false;
  var _wallEl = null;
  var _style = null;
  var _scanData = null;
  var _labels = [];
  var _animFrame = null;

  // ═══ LIVE FEED ═══
  function loadScan() {
    var cs = window._cosmicSurfaces;
    var existing = cs && typeof cs.scanData === 'function' ? cs.scanData() : null;
    if (existing) { _scanData = existing; return Promise.resolve(existing); }
    return fetch('/detroit-data/scan_sweep_sort.json')
      .then(function(r) { return r.json(); })
      .then(function(data) { _scanData = data; return data; })
      .catch(function() {
        return fetch('/scan_sweep_sort.json')
          .then(function(r) { return r.json(); })
          .then(function(data) { _scanData = data; return data; })
          .catch(function() { _scanData = null; });
      });
  }

  function getSortClasses() {
    var data = _scanData;
    if (!data) {
      var cs = window._cosmicSurfaces;
      if (cs) data = typeof cs.scanData === 'function' ? cs.scanData() : cs.scanData;
    }
    if (!data) return { self: 0, partial: 0, null: 0, 'non-self': 0 };
    var sc = {};
    try {
      sc = data.sort.summary.detroit_entities;
    } catch(e) {}
    return {
      self: sc.self || 0,
      partial: sc.partial || 0,
      null: sc['null'] || 0,
      'non-self': sc['non-self'] || 0
    };
  }

  function getTotalEntities() {
    var sc = getSortClasses();
    return sc.self + sc.partial + sc['null'] + sc['non-self'];
  }

  // ═══ WALL CSS ═══
  function injectStyle() {
    if (_style) return;
    _style = document.createElement('style');
    _style.id = 'membrane-wall-css';
    _style.textContent = [
      '#membrane-wall {',
      '  position: fixed; top: 0; left: 50%; width: 3px; height: 100vh; z-index: 0;',
      '  background: linear-gradient(to bottom,',
      '    #3fb950 0%, #58a6ff 25%, #f0e68c 50%, #bc8cff 75%, #a371f7 100%);',
      '  opacity: 0; pointer-events: none;',
      '  transition: opacity 1s ease-in;',
      '  box-shadow: 0 0 20px rgba(163,113,247,0.15), 0 0 20px rgba(63,185,80,0.15);',
      '}',
      '#membrane-wall.live { opacity: 0.25; }',
      '#membrane-wall.bright { opacity: 0.45; }',
      '',
      '#wall-sort-flow {',
      '  position: fixed; top: 80px; left: calc(50% - 1px); width: 3px;',
      '  height: calc(100vh - 160px); z-index: 1; pointer-events: none;',
      '}',
      '.wall-flow-dot {',
      '  position: absolute; width: 5px; height: 5px; border-radius: 50%;',
      '  left: -1px; opacity: 0.8;',
      '  animation: wallFlow 4s linear infinite;',
      '}',
      '@keyframes wallFlow {',
      '  0%   { top: 0%; opacity: 0; transform: scale(0.5); }',
      '  10%  { opacity: 0.8; transform: scale(1); }',
      '  90%  { opacity: 0.8; transform: scale(1); }',
      '  100% { top: 100%; opacity: 0; transform: scale(0.5); }',
      '}',
      '',
      '.wall-twist-wrap {',
      '  transform: perspective(1400px) rotateY(1.2deg);',
      '  transform-origin: 50% 50%;',
      '  transition: transform 1s cubic-bezier(0.34, 1.56, 0.64, 1);',
      '}',
      '.wall-twist-wrap:hover { transform: perspective(1400px) rotateY(-0.3deg); }',
      '',
      '.wall-section {',
      '  position: relative;',
      '  transition: border-color 0.8s, box-shadow 0.8s;',
      '}',
      '.wall-section .wall-pip {',
      '  position: absolute; top: 6px; right: 6px;',
      '  font-size: 8px; color: #484f58; pointer-events: none;',
      '}',
      '.wall-section .wall-side-tag {',
      '  position: absolute; top: 6px; left: 6px;',
      '  font-size: 7px; text-transform: uppercase; letter-spacing: 1px;',
      '  pointer-events: none; opacity: 0.5;',
      '}',
      '',
      '.wall-axis-label {',
      '  position: fixed; z-index: 1; pointer-events: none;',
      '  font-size: 8px; text-transform: uppercase; letter-spacing: 2px;',
      '  opacity: 0.4; font-family: monospace;',
      '}',
      '',
      '#wall-balance-bar {',
      '  position: fixed; bottom: 60px; left: 50%; transform: translateX(-50%);',
      '  width: 200px; height: 4px; z-index: 1; pointer-events: none;',
      '  background: linear-gradient(to right, #3fb950, #58a6ff, #bc8cff, #a371f7);',
      '  border-radius: 2px; opacity: 0;',
      '  transition: opacity 0.8s;',
      '}',
      '#wall-balance-bar.live { opacity: 0.5; }',
      '#wall-balance-marker {',
      '  position: absolute; top: -4px; width: 6px; height: 12px;',
      '  background: #f0e68c; border-radius: 3px;',
      '  transition: left 1s ease;',
      '}',
      '',
      '.wall-grid-split {',
      '  display: grid !important;',
      '  grid-template-columns: 1fr 3px 1fr !important;',
      '  gap: 0 !important;',
      '}',
      '.wall-grid-split .wall-divider-line {',
      '  background: linear-gradient(to bottom, #3fb950, #58a6ff, #bc8cff, #a371f7);',
      '  width: 3px; min-height: 100%; border-radius: 2px; opacity: 0.25;',
      '}',
      '.wall-inside-col { padding-right: 10px; }',
      '.wall-outside-col { padding-left: 10px; }',
    ].join('\n');
    document.head.appendChild(_style);
  }

  // ═══ BUILD WALL ELEMENTS ═══
  function buildWallDOM() {
    if (_wallEl) return;

    injectStyle();

    // The wall line
    _wallEl = document.createElement('div');
    _wallEl.id = 'membrane-wall';
    document.body.appendChild(_wallEl);

    // Flow dots container
    var flow = document.createElement('div');
    flow.id = 'wall-sort-flow';
    document.body.appendChild(flow);

    // Balance bar
    var balBar = document.createElement('div');
    balBar.id = 'wall-balance-bar';
    balBar.innerHTML = '<div id="wall-balance-marker"></div>';
    document.body.appendChild(balBar);

    // Axis labels
    var gl = document.createElement('div');
    gl.className = 'wall-axis-label';
    gl.style.cssText = 'top:62px;left:calc(25% - 60px);color:#3fb950';
    gl.textContent = '\u25c0 inside \u00b7 self \u00b7 green';
    _labels.push(gl);
    document.body.appendChild(gl);

    var pl = document.createElement('div');
    pl.className = 'wall-axis-label';
    pl.style.cssText = 'top:62px;right:calc(25% - 60px);color:#a371f7;text-align:right';
    pl.textContent = 'outside \u00b7 non-self \u00b7 purple \u25b6';
    _labels.push(pl);
    document.body.appendChild(pl);

    var wl = document.createElement('div');
    wl.className = 'wall-axis-label';
    wl.style.cssText = 'top:76px;left:calc(50% - 30px);color:#f0e68c;letter-spacing:3px';
    wl.textContent = '\u2551 wall \u2551';
    _labels.push(wl);
    document.body.appendChild(wl);
  }

  function teardownWallDOM() {
    ['membrane-wall', 'wall-sort-flow', 'wall-balance-bar'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    _wallEl = null;
    _labels.forEach(function(l) { if (l.parentNode) l.parentNode.removeChild(l); });
    _labels = [];
    if (_style && _style.parentNode) _style.parentNode.removeChild(_style);
    _style = null;
  }

  // ═══ ANIMATE FLOW DOTS ═══
  function spawnFlowDots() {
    var flow = document.getElementById('wall-sort-flow');
    if (!flow) return;
    flow.innerHTML = '';

    var sc = getSortClasses();
    var total = getTotalEntities() || 1;
    var classes = [
      { key: 'self',     count: sc.self,       s: 0.05 },
      { key: 'partial',  count: sc.partial,    s: 0.45 },
      { key: 'null',     count: sc['null'],    s: 0.65 },
      { key: 'non-self', count: sc['non-self'], s: 0.90 }
    ];

    var dotCount = 0;
    classes.forEach(function(c) {
      var n = Math.max(1, Math.round((c.count / total) * 16));
      for (var i = 0; i < n && dotCount < 24; i++) {
        var dot = document.createElement('div');
        dot.className = 'wall-flow-dot';
        dot.style.backgroundColor = fl.flavorHex(c.s);
        dot.style.animationDelay = (dotCount * 0.5 + Math.random() * 0.5) + 's';
        dot.style.animationDuration = (3 + Math.random() * 3) + 's';
        var side = c.s < 0.5 ? -(6 + Math.random() * 10) : (6 + Math.random() * 10);
        dot.style.left = side + 'px';
        dot.style.width = (4 + c.s * 4) + 'px';
        dot.style.height = dot.style.width;
        flow.appendChild(dot);
        dotCount++;
      }
    });
  }

  function updateBalanceBar() {
    fl.updateFromFeeds();
    var fs = fl.feedStrangeness();
    var memS = fs.membrane || 0.5;
    var bar = document.getElementById('wall-balance-bar');
    var marker = document.getElementById('wall-balance-marker');
    if (bar) bar.classList.add('live');
    if (marker) marker.style.left = (memS * 194) + 'px';
  }

  // ═══ APPLY WALL TO DASHBOARD ═══
  function applyWall() {
    if (_active) return;
    _active = true;

    loadScan().then(function() {
      buildWallDOM();

      var dash = document.getElementById('hud-dash');
      if (!dash) return;

      // Twist the dashboard
      dash.classList.add('wall-twist-wrap');

      // Split the membrane-geo grid
      var memGeo = document.getElementById('membrane-geo-grid');
      if (memGeo) {
        memGeo.classList.add('wall-grid-split');
        var kids = Array.from(memGeo.children);
        if (kids.length >= 2 && !memGeo.querySelector('.wall-divider-line')) {
          kids[0].classList.add('wall-inside-col', 'wall-section');
          kids[0].style.borderColor = fl.flavorHex(0.15);
          kids[0].innerHTML = '<span class="wall-side-tag" style="color:#3fb950">\u25c0 inside</span>' + kids[0].innerHTML;

          var divLine = document.createElement('div');
          divLine.className = 'wall-divider-line';
          memGeo.insertBefore(divLine, kids[1]);

          kids[1].classList.add('wall-outside-col', 'wall-section');
          kids[1].style.borderColor = fl.flavorHex(0.55);
          kids[1].innerHTML = '<span class="wall-side-tag" style="color:#a371f7">outside \u25b6</span>' + kids[1].innerHTML;
        }
      }

      // Color-code action bar links by strangeness
      var actionLinks = dash.querySelectorAll('a[style*="border"]');
      actionLinks.forEach(function(link) {
        var text = (link.textContent || '').toLowerCase();
        var s = 0.5;
        if (text.indexOf('tuebor') >= 0) s = 0.50;
        if (text.indexOf('explore') >= 0) s = 0.35;
        if (text.indexOf('graph') >= 0) s = 0.40;
        if (text.indexOf('banks') >= 0) s = 0.75;
        if (text.indexOf('ghost') >= 0) s = 0.85;
        if (text.indexOf('tree') >= 0) s = 0.65;
        if (text.indexOf('detroit') >= 0) s = 0.35;
        link.style.borderColor = fl.flavorHex(s);
        link.style.boxShadow = '0 0 6px ' + fl.flavorHex(s) + '33';
      });

      // Flavor-border the highlights panel
      var highlights = document.getElementById('highlights-panel');
      if (highlights) {
        highlights.classList.add('wall-section');
        highlights.style.borderLeft = '2px solid ' + fl.flavorHex(0.45);
        highlights.style.borderRight = '2px solid ' + fl.flavorHex(0.65);
        highlights.style.paddingLeft = '8px';
        highlights.style.paddingRight = '8px';
      }

      // Kernel card
      var kernel = document.getElementById('kernel-card');
      if (kernel) {
        kernel.classList.add('wall-section');
        kernel.style.borderColor = fl.flavorHex(0.30);
        kernel.innerHTML = '<span class="wall-pip"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + fl.flavorHex(0.30) + '"></span> 30%</span>' + kernel.innerHTML;
      }

      // Animate
      setTimeout(function() {
        if (_wallEl) _wallEl.classList.add('live');
        setTimeout(function() {
          if (_wallEl) _wallEl.classList.add('bright');
        }, 500);
      }, 100);

      spawnFlowDots();
      updateBalanceBar();
      fl.startTinting();

      // Periodic refresh
      _animFrame = setInterval(function() {
        loadScan().then(function() {
          spawnFlowDots();
          updateBalanceBar();
        });
      }, 30000);
    });
  }

  function removeWall() {
    if (!_active) return;
    _active = false;
    if (_animFrame) { clearInterval(_animFrame); _animFrame = null; }

    var dash = document.getElementById('hud-dash');
    if (dash) {
      dash.classList.remove('wall-twist-wrap');
      dash.querySelectorAll('.wall-section').forEach(function(el) {
        el.classList.remove('wall-section', 'wall-inside-col', 'wall-outside-col');
      });
      dash.querySelectorAll('.wall-side-tag, .wall-pip').forEach(function(el) {
        el.parentNode.removeChild(el);
      });
      var memGeo = document.getElementById('membrane-geo-grid');
      if (memGeo) {
        memGeo.classList.remove('wall-grid-split');
        var divs = memGeo.querySelectorAll('.wall-divider-line');
        divs.forEach(function(d) { d.parentNode.removeChild(d); });
      }
    }

    fl.stopTinting();
    teardownWallDOM();
  }

  function toggleWall() {
    if (_active) { removeWall(); } else { applyWall(); }
    return _active;
  }

  // ═══ WALL VIEW — the full topo-sorted membrane text readout ═══
  function wallView() {
    fl.updateFromFeeds();
    var fs = fl.feedStrangeness();
    var memS = fs.membrane || 0.5;

    var lines = [];
    var W = 44;
    var mid = Math.floor(W / 2);

    // Header
    lines.push('<span style="color:#3fb950">\u25c0 INSIDE</span>' +
      repeat('\u00a0', 10) +
      '<span style="color:#f0e68c">\u2551 wall \u2551</span>' +
      repeat('\u00a0', 8) +
      '<span style="color:#a371f7">OUTSIDE \u25b6</span>');

    lines.push('<span style="color:#3fb950">self \u00b7 familiar</span>' +
      repeat('\u00a0', 6) +
      '<span style="color:#6e7681">\u2551 membrane \u2551</span>' +
      repeat('\u00a0', 4) +
      '<span style="color:#a371f7">non-self \u00b7 strange</span>');
    lines.push('');

    // Build gradient wall bar
    var wallBar = '';
    for (var i = 0; i < W; i++) {
      if (i === mid || i === mid + 1) {
        wallBar += '<span style="color:#f0e68c">\u2551</span>';
      } else {
        wallBar += '<span style="color:' + fl.flavorHex(i / W) + '">\u2550</span>';
      }
    }
    lines.push(wallBar);
    lines.push('');

    // Sort classes flowing through the wall
    var sc = getSortClasses();
    var total = getTotalEntities() || 1;

    lines.push('<span style="color:#bc8cff">SORT CLASSES \u2014 topo-sorted through the wall</span>');

    var classes = [
      { name: 'self',      count: sc.self,       s: 0.05 },
      { name: 'partial',   count: sc.partial,    s: 0.45 },
      { name: 'null',      count: sc['null'],    s: 0.65 },
      { name: 'non-self',  count: sc['non-self'], s: 0.90 }
    ];

    classes.forEach(function(c) {
      var pos = Math.round(c.s * (W - 1));
      var pct = ((c.count / total) * 100).toFixed(1);
      var bar = repeat('\u00a0', pos);
      var arrow = c.s < 0.5 ? '\u25c2' : '\u25b8';
      var fc = fl.flavorHex(c.s);
      lines.push(bar + '<span style="color:' + fc + '">' + arrow + ' ' + c.name + ' (' + c.count + ' \u00b7 ' + pct + '%)</span>');
    });
    lines.push('');

    // Anderson modes along the wall
    lines.push('<span style="color:#bc8cff">ANDERSON MODES \u2014 perspective positions</span>');
    var andersonModes = [
      { name: 'sovereign', s: 0.05 },
      { name: 'human',     s: 0.10 },
      { name: 'chorus',    s: 0.40 },
      { name: 'spectrum',  s: 0.60 },
      { name: 'ghost',     s: 0.80 },
      { name: 'stealth',   s: 0.95 }
    ];
    andersonModes.forEach(function(m) {
      var pos = Math.round(m.s * (W - 1));
      var bar = repeat('\u00a0', pos);
      var fc = fl.flavorHex(m.s);
      lines.push(bar + '<span style="color:' + fc + '">\u25c6 ' + m.name + '</span>');
    });
    lines.push('');

    // Surfaces topo-sorted
    var cs = window._cosmicSurfaces;
    if (cs && cs.SURFACES) {
      lines.push('<span style="color:#bc8cff">SURFACES \u2014 sorted by strangeness</span>');
      var surfs = Object.keys(cs.SURFACES).map(function(k) {
        return { name: cs.SURFACES[k].name || k, s: fl.surfaceStrangeness(k) };
      });
      surfs.sort(function(a, b) { return a.s - b.s; });
      surfs.forEach(function(surf) {
        var pos = Math.round(surf.s * (W - 1));
        var bar = repeat('\u00a0', pos);
        var fc = fl.flavorHex(surf.s);
        var arrow = surf.s < 0.5 ? '\u25c2' : '\u25b8';
        lines.push(bar + '<span style="color:' + fc + '">' + arrow + ' ' + surf.name + '</span>');
      });
      lines.push('');
    }

    // Categories
    lines.push('<span style="color:#bc8cff">CATEGORIES \u2014 investigation strangeness</span>');
    var cats = Object.keys(fl.CAT_STRANGENESS);
    cats.sort(function(a, b) { return fl.CAT_STRANGENESS[a] - fl.CAT_STRANGENESS[b]; });
    cats.forEach(function(cat) {
      var s = fl.CAT_STRANGENESS[cat];
      var pos = Math.round(s * (W - 1));
      var bar = repeat('\u00a0', pos);
      var fc = fl.flavorHex(s);
      lines.push(bar + '<span style="color:' + fc + '">\u25aa ' + cat + '</span>');
    });
    lines.push('');

    // Balance
    var balanceLine = '';
    var bPos = Math.round(memS * (W - 1));
    for (var b = 0; b < W; b++) {
      if (b === bPos) {
        balanceLine += '<span style="color:#f0e68c">\u25c6</span>';
      } else if (b === mid || b === mid + 1) {
        balanceLine += '<span style="color:#6e7681">\u2502</span>';
      } else {
        balanceLine += '<span style="color:' + fl.flavorHex(b / W) + '">\u2500</span>';
      }
    }
    lines.push(balanceLine);

    var commentary;
    if (memS < 0.25) commentary = 'deeply inside \u2014 familiar, green';
    else if (memS < 0.45) commentary = 'leaning inside \u2014 balanced toward self';
    else if (memS < 0.55) commentary = 'balanced on the wall \u2014 equal in and out';
    else if (memS < 0.75) commentary = 'leaning outside \u2014 strangeness rising';
    else commentary = 'deeply outside \u2014 purple, strange';

    lines.push('<span style="color:' + fl.flavorHex(memS) + '">\u25c6 membrane balance: ' + commentary + '</span> (' + (memS * 100).toFixed(1) + '%)');

    // Sparkline if available
    var spark = fl.strangenessSparkline();
    if (spark) {
      lines.push('');
      lines.push('<span class="dim">history:</span> ' + spark);
    }

    // Wall toggle hint
    lines.push('');
    lines.push('<span class="dim">type <span style="color:#f0e68c">/twist</span> to ' + (_active ? 'remove' : 'apply') + ' wall to dashboard</span>');

    return lines.join('\n');
  }

  function repeat(ch, n) {
    var s = '';
    for (var i = 0; i < n; i++) s += ch;
    return s;
  }

  // ═══ EXPORT ═══
  window._membraneWall = {
    apply: applyWall,
    remove: removeWall,
    toggle: toggleWall,
    isActive: function() { return _active; },
    wallView: wallView,
    loadScan: loadScan,
    getSortClasses: getSortClasses,
  };
})();
