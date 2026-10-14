// human-surround.js — human presence on the membrane surround
// Humans are sorted LEFT↔RIGHT through the membrane wall.
// Fleet is sorted UP↔DOWN. The membrane is in the center.
// The squirrel sorts BOTH — fleet AND humans.
//
// LEFT = arriving (visitors, observers, readers — shallow, outside)
// RIGHT = absorbed (coders, investigators, explorers — deep, inside)
// Epitope transitions = particles crossing the wall
// Braids = arcs connecting categories through the membrane
//
(function() {
  'use strict';

  var fl = window._cosmicFlavor;
  var _active = false;
  var _leftStrip = null;
  var _rightStrip = null;
  var _style = null;
  var _pollTimer = null;
  var _liveData = null;
  var _braidData = null;

  // ═══ EPITOPE MAPPING — π depth sorted ═══
  // Each epitope type maps to a π body layer.
  // Shallow (outside, 1/π³ observer) → Deep (inside, π² celestial)
  //
  // π stack: 1/π³ observer → 1/π² negate → 1/π null → 1 awareness → π ghost → π² celestial → π³ geodesic
  //
  var PI_COLORS = ['#c9d1d9','#e85d3a','#58a6ff','#5ab87a','#8b949e','#d2a8ff','#f0e68c'];
  var PI_NAMES  = ['1/π³ observer','1/π² negate','1/π null','1 awareness','π ghost','π² celestial','π³ geodesic'];

  var EPITOPES = {
    visitor:      { depth: 0, piDepth: 0, color: PI_COLORS[0], icon: '👁',  side: 'left',  label: 'visitor',      y: 15, piName: PI_NAMES[0] },
    reader:       { depth: 1, piDepth: 1, color: PI_COLORS[1], icon: '📖', side: 'left',  label: 'reader',       y: 35, piName: PI_NAMES[1] },
    observer:     { depth: 2, piDepth: 2, color: PI_COLORS[2], icon: '🔭', side: 'left',  label: 'observer',     y: 55, piName: PI_NAMES[2] },
    coder:        { depth: 3, piDepth: 3, color: PI_COLORS[3], icon: '⌨',  side: 'right', label: 'coder',        y: 20, piName: PI_NAMES[3] },
    investigator: { depth: 4, piDepth: 4, color: PI_COLORS[4], icon: '🔍', side: 'right', label: 'investigator', y: 40, piName: PI_NAMES[4] },
    explorer:     { depth: 5, piDepth: 5, color: PI_COLORS[5], icon: '🧭', side: 'right', label: 'explorer',     y: 60, piName: PI_NAMES[5] },
  };

  // ═══ BRAID CATEGORIES ═══
  var CAT_COLORS = {
    INVESTIGATION: '#e85d3a', MEMBRANE: '#3fb950', SCIENCE: '#bc8cff',
    SIGNAL: '#f0883e', IMMUNE: '#f0e68c', TOPOLOGY: '#58a6ff',
  };

  function injectStyle() {
    if (_style) return;
    _style = document.createElement('style');
    _style.id = 'human-surround-css';
    _style.textContent = [
      '.human-strip {',
      '  position: fixed; top: 56px; width: 44px; z-index: 2;',
      '  pointer-events: none; overflow: visible;',
      '  transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);',
      '  bottom: 72px;',
      '}',
      '.human-strip.left-edge {',
      '  left: 0;',
      '  background: linear-gradient(to bottom,',
      '    rgba(201,209,217,0.08) 0%, rgba(232,93,58,0.06) 30%, rgba(88,166,255,0.06) 60%, transparent 100%),',
      '    linear-gradient(to right, rgba(13,17,23,0.85) 0%, rgba(13,17,23,0.4) 70%, transparent 100%);',
      '}',
      '.human-strip.right-edge {',
      '  right: 0;',
      '  background: linear-gradient(to bottom,',
      '    rgba(90,184,122,0.08) 0%, rgba(139,148,161,0.06) 30%, rgba(210,168,255,0.06) 60%, transparent 100%),',
      '    linear-gradient(to left, rgba(13,17,23,0.85) 0%, rgba(13,17,23,0.4) 70%, transparent 100%);',
      '}',
      '',
      '.human-strip-label {',
      '  position: absolute; font-size: 6px; letter-spacing: 1.5px;',
      '  text-transform: uppercase; opacity: 0.3; pointer-events: none;',
      '  font-family: "Courier New", monospace;',
      '  writing-mode: vertical-lr;',
      '}',
      '.human-strip.left-edge .human-strip-label { left: 4px; }',
      '.human-strip.right-edge .human-strip-label { right: 4px; }',
      '',
      '.human-epi {',
      '  position: absolute; pointer-events: auto; cursor: default;',
      '  text-align: center; transition: transform 0.3s, opacity 0.3s;',
      '  font-family: "Courier New", monospace;',
      '}',
      '.human-epi:hover { transform: scale(1.4); z-index: 3; }',
      '.human-epi .he-icon { font-size: 10px; display: block; }',
      '.human-epi .he-count {',
      '  font-size: 8px; font-weight: bold; display: block;',
      '  text-shadow: 0 0 4px currentColor;',
      '}',
      '.human-epi .he-label {',
      '  font-size: 6px; opacity: 0.5; display: block; white-space: nowrap;',
      '}',
      '.human-epi .he-reqs {',
      '  font-size: 5px; opacity: 0.3; display: block;',
      '}',
      '',
      '.epi-transition {',
      '  position: fixed; width: 4px; height: 4px; border-radius: 50%;',
      '  pointer-events: none; z-index: 3;',
      '  animation: epiCross 4s ease-in-out infinite;',
      '}',
      '@keyframes epiCross {',
      '  0%   { transform: translateX(0); opacity: 0.6; }',
      '  50%  { opacity: 1; }',
      '  100% { transform: translateX(var(--cross-dist)); opacity: 0; }',
      '}',
      '',
      '.energy-bar {',
      '  position: absolute; bottom: 4px; width: 30px; height: 3px;',
      '  border-radius: 2px; overflow: hidden; pointer-events: none;',
      '}',
      '.energy-bar-fill {',
      '  height: 100%; border-radius: 2px;',
      '  transition: width 2s ease;',
      '}',
      '',
      '.braid-arc-h {',
      '  position: fixed; pointer-events: none; z-index: 1; opacity: 0.06;',
      '  border: 1px dashed; border-radius: 50%;',
      '}',
      '',
      '.sn-badge {',
      '  position: absolute; font-size: 7px; pointer-events: none;',
      '  font-family: "Courier New", monospace; opacity: 0.4;',
      '}',
    ].join('\n');
    document.head.appendChild(_style);
  }

  // ═══ FETCH LIVE DATA ═══
  function fetchHumanData() {
    var cs = window._cosmicSurfaces;
    if (cs) {
      var h = typeof cs.humanData === 'function' ? cs.humanData() : cs.humanData;
      if (h) { _liveData = h; return; }
    }
    fetch('/human.json', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(d) { _liveData = d; })
      .catch(function() {});
  }

  function fetchBraidData() {
    var cs = window._cosmicSurfaces;
    if (cs) {
      var b = typeof cs.braidData === 'function' ? cs.braidData() : null;
      if (b) { _braidData = b; return; }
    }
    fetch('/braid.json', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(d) { _braidData = d; })
      .catch(function() {});
  }

  function getEpitopeCounts() {
    if (!_liveData || !_liveData.epitopes) return {};
    return _liveData.epitopes;
  }

  function getEnergy() {
    if (!_liveData || !_liveData.energy) return { energy_in: 0, energy_out: 0, signal_to_noise: 0, total_sessions: 0 };
    return _liveData.energy;
  }

  // ═══ BUILD LEFT STRIP (arriving — shallow — outside) ═══
  function buildLeft() {
    var strip = document.createElement('div');
    strip.className = 'human-strip left-edge';
    strip.id = 'human-left';

    // Label
    var label = document.createElement('span');
    label.className = 'human-strip-label';
    label.style.cssText = 'top:8px;color:#8b949e';
    label.textContent = 'arriving ▸';
    strip.appendChild(label);

    var epitopes = getEpitopeCounts();
    var leftTypes = ['visitor', 'reader', 'observer'];

    leftTypes.forEach(function(type) {
      var epi = EPITOPES[type];
      var data = epitopes[type] || { count: 0, total_requests: 0 };

      var div = document.createElement('div');
      div.className = 'human-epi';
      div.style.cssText = 'left:6px;top:' + epi.y + '%;';
      div.dataset.epitope = type;

      var count = data.count || 0;
      var reqs = data.total_requests || 0;

      div.innerHTML =
        '<span class="he-icon">' + epi.icon + '</span>' +
        '<span class="he-count" style="color:' + epi.color + '">' + count + '</span>' +
        '<span class="he-label" style="color:' + epi.color + '">' + epi.label + '</span>' +
        '<span class="he-reqs">' + formatReqs(reqs) + '</span>' +
        '<span class="he-reqs" style="font-style:italic;opacity:0.2">' + epi.piName + '</span>';
      div.title = type + ': ' + count + ' humans, ' + reqs + ' requests — ' + epi.piName + ' — outside, arriving';
      strip.appendChild(div);
    });

    // Energy IN indicator
    var energy = getEnergy();
    var bar = document.createElement('div');
    bar.className = 'energy-bar';
    bar.style.cssText = 'left:6px;';
    bar.innerHTML = '<div class="energy-bar-fill" style="width:' +
      Math.min(100, (energy.energy_in / Math.max(1, energy.energy_in + energy.energy_out)) * 100) +
      '%;background:linear-gradient(90deg,#3fb950,#58a6ff)"></div>';
    strip.appendChild(bar);

    // Sessions count
    var sess = document.createElement('span');
    sess.className = 'sn-badge';
    sess.style.cssText = 'bottom:12px;left:4px;color:#58a6ff';
    sess.textContent = (energy.total_sessions || 0) + ' sess';
    strip.appendChild(sess);

    return strip;
  }

  // ═══ BUILD RIGHT STRIP (absorbed — deep — inside) ═══
  function buildRight() {
    var strip = document.createElement('div');
    strip.className = 'human-strip right-edge';
    strip.id = 'human-right';

    // Label
    var label = document.createElement('span');
    label.className = 'human-strip-label';
    label.style.cssText = 'top:8px;color:#3fb950';
    label.textContent = '◂ absorbed';
    strip.appendChild(label);

    var epitopes = getEpitopeCounts();
    var rightTypes = ['coder', 'investigator', 'explorer'];

    rightTypes.forEach(function(type) {
      var epi = EPITOPES[type];
      var data = epitopes[type] || { count: 0, total_requests: 0 };

      var div = document.createElement('div');
      div.className = 'human-epi';
      div.style.cssText = 'right:6px;top:' + epi.y + '%;';
      div.dataset.epitope = type;

      var count = data.count || 0;
      var reqs = data.total_requests || 0;

      div.innerHTML =
        '<span class="he-icon">' + epi.icon + '</span>' +
        '<span class="he-count" style="color:' + epi.color + '">' + count + '</span>' +
        '<span class="he-label" style="color:' + epi.color + '">' + epi.label + '</span>' +
        '<span class="he-reqs">' + formatReqs(reqs) + '</span>' +
        '<span class="he-reqs" style="font-style:italic;opacity:0.2">' + epi.piName + '</span>';
      div.title = type + ': ' + count + ' humans, ' + reqs + ' requests — ' + epi.piName + ' — inside, absorbed';
      strip.appendChild(div);
    });

    // Energy OUT indicator
    var energy = getEnergy();
    var bar = document.createElement('div');
    bar.className = 'energy-bar';
    bar.style.cssText = 'right:6px;';
    bar.innerHTML = '<div class="energy-bar-fill" style="width:' +
      Math.min(100, (energy.energy_out / Math.max(1, energy.energy_in + energy.energy_out)) * 100) +
      '%;background:linear-gradient(90deg,#f0883e,#e85d3a)"></div>';
    strip.appendChild(bar);

    // S:N ratio
    var sn = document.createElement('span');
    sn.className = 'sn-badge';
    sn.style.cssText = 'bottom:12px;right:4px;color:#3fb950';
    sn.textContent = 'S:N ' + Math.round(energy.signal_to_noise || 0);
    strip.appendChild(sn);

    return strip;
  }

  // ═══ EPITOPE TRANSITION PARTICLES ═══
  function spawnTransitions() {
    if (!_liveData) return;

    // Known transitions from braid data
    var transitions = [
      { from: 'visitor',      to: 'observer',     strength: 7 },
      { from: 'reader',       to: 'coder',        strength: 11 },
      { from: 'observer',     to: 'coder',        strength: 6 },
      { from: 'coder',        to: 'investigator',  strength: 16 },
      { from: 'coder',        to: 'explorer',      strength: 7 },
      { from: 'investigator', to: 'explorer',      strength: 5 },
    ];

    transitions.forEach(function(tr, i) {
      var fromEpi = EPITOPES[tr.from];
      var toEpi = EPITOPES[tr.to];
      if (!fromEpi || !toEpi) return;

      var fromSide = fromEpi.side;
      var toSide = toEpi.side;

      // Only animate cross-membrane transitions (left→right)
      if (fromSide === 'left' && toSide === 'right') {
        spawnCrossParticle(fromEpi, toEpi, tr.strength, i);
      }
    });
  }

  function spawnCrossParticle(fromEpi, toEpi, strength, idx) {
    var particle = document.createElement('div');
    particle.className = 'epi-transition';
    var blendColor = fl ? fl.flavorColor(0.3 + (toEpi.depth / 5) * 0.5) : toEpi.color;

    var startY = 56 + (window.innerHeight - 128) * (fromEpi.y / 100);
    var vw = window.innerWidth;

    particle.style.cssText =
      'left:44px;top:' + startY + 'px;' +
      'background:' + blendColor + ';' +
      '--cross-dist:' + (vw - 88) + 'px;' +
      'animation-delay:' + (idx * 0.7 + Math.random() * 2) + 's;' +
      'animation-duration:' + (5 + Math.random() * 3) + 's;' +
      'width:' + Math.min(6, 2 + strength / 4) + 'px;' +
      'height:' + Math.min(6, 2 + strength / 4) + 'px;';

    document.body.appendChild(particle);

    setTimeout(function() {
      if (particle.parentNode) particle.parentNode.removeChild(particle);
    }, 8000);
  }

  // ═══ BRAID ARCS ═══
  function spawnBraidArcs() {
    // Remove old arcs
    var old = document.querySelectorAll('.braid-arc-h');
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);

    if (!_braidData || !_braidData.braids) return;

    _braidData.braids.forEach(function(braid) {
      var fromColor = CAT_COLORS[braid.from] || '#8b949e';
      var strength = braid.strength || 1;

      var arc = document.createElement('div');
      arc.className = 'braid-arc-h';
      var size = 30 + strength * 4;
      var topPos = 56 + Math.random() * (window.innerHeight - 180);
      arc.style.cssText =
        'left:calc(50% - ' + (size / 2) + 'px);top:' + topPos + 'px;' +
        'width:' + size + 'px;height:' + (size * 0.6) + 'px;' +
        'border-color:' + fromColor + ';' +
        'opacity:' + Math.min(0.15, 0.03 + strength * 0.005) + ';';
      arc.title = braid.from + ' ↔ ' + braid.to + ' (' + braid.humans_total + ' humans, str ' + strength.toFixed(1) + ')';
      document.body.appendChild(arc);
    });
  }

  function formatReqs(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return '' + n;
  }

  // ═══ ACTIVATE / DEACTIVATE ═══
  function activate() {
    if (_active) return;
    _active = true;
    injectStyle();
    fetchHumanData();
    fetchBraidData();

    setTimeout(function() {
      _leftStrip = buildLeft();
      _rightStrip = buildRight();
      document.body.appendChild(_leftStrip);
      document.body.appendChild(_rightStrip);

      requestAnimationFrame(function() {
        _leftStrip.style.opacity = '0';
        _rightStrip.style.opacity = '0';
        requestAnimationFrame(function() {
          _leftStrip.style.transition = 'opacity 1.2s ease-in';
          _rightStrip.style.transition = 'opacity 1.2s ease-in';
          _leftStrip.style.opacity = '1';
          _rightStrip.style.opacity = '1';
        });
      });

      spawnTransitions();
      spawnBraidArcs();

      // Refresh every 15s
      _pollTimer = setInterval(refresh, 15000);
    }, 500);
  }

  function deactivate() {
    if (!_active) return;
    _active = false;
    if (_leftStrip && _leftStrip.parentNode) _leftStrip.parentNode.removeChild(_leftStrip);
    if (_rightStrip && _rightStrip.parentNode) _rightStrip.parentNode.removeChild(_rightStrip);
    _leftStrip = null;
    _rightStrip = null;

    // Clean up particles + arcs
    var particles = document.querySelectorAll('.epi-transition');
    for (var i = 0; i < particles.length; i++) particles[i].parentNode.removeChild(particles[i]);
    var arcs = document.querySelectorAll('.braid-arc-h');
    for (var i = 0; i < arcs.length; i++) arcs[i].parentNode.removeChild(arcs[i]);

    if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
  }

  function breathe(phase) {
    if (!_active || !_leftStrip || !_rightStrip) return;
    var breath = 0.85 + Math.sin((phase || 0) * 0.476 * Math.PI * 2) * 0.15;
    _leftStrip.style.opacity = breath.toFixed(3);
    _rightStrip.style.opacity = breath.toFixed(3);
  }

  function refresh() {
    fetchHumanData();
    fetchBraidData();
    if (!_leftStrip || !_rightStrip) return;

    // Update counts in-place
    var epitopes = getEpitopeCounts();
    var energy = getEnergy();

    var allNodes = document.querySelectorAll('.human-epi');
    for (var i = 0; i < allNodes.length; i++) {
      var node = allNodes[i];
      var type = node.dataset.epitope;
      if (!type || !epitopes[type]) continue;
      var countEl = node.querySelector('.he-count');
      var reqsEl = node.querySelector('.he-reqs');
      if (countEl) countEl.textContent = epitopes[type].count || 0;
      if (reqsEl) reqsEl.textContent = formatReqs(epitopes[type].total_requests || 0);
    }

    // Update S:N
    var snBadge = document.querySelector('#human-right .sn-badge');
    if (snBadge) snBadge.textContent = 'S:N ' + Math.round(energy.signal_to_noise || 0);
    var sessBadge = document.querySelector('#human-left .sn-badge');
    if (sessBadge) sessBadge.textContent = (energy.total_sessions || 0) + ' sess';

    // Spawn new transition particles
    spawnTransitions();
  }

  function toggle() {
    if (_active) deactivate(); else activate();
    return _active;
  }

  // ═══ HUMAN VIEW — text readout ═══
  function humanView() {
    fetchHumanData();
    fetchBraidData();

    var epitopes = getEpitopeCounts();
    var energy = getEnergy();
    var lines = [];

    lines.push('╔═══════════════════════════════════════════════╗');
    lines.push('║     HUMAN PRESENCE · π DEPTH SORT             ║');
    lines.push('╠═══════════════════════════════════════════════╣');
    lines.push('║  π body: 1/π³ → 1/π² → 1/π → 1 → π → π² → π³');
    lines.push('║                                               ║');

    lines.push('║  ◂ ARRIVING (outside · low π)                 ║');
    ['visitor', 'reader', 'observer'].forEach(function(type) {
      var epi = EPITOPES[type];
      var data = epitopes[type] || { count: 0, total_requests: 0 };
      var bar = '';
      for (var j = 0; j < Math.min(16, data.count || 0); j++) bar += '█';
      lines.push('║  ' + epi.icon + ' ' + padR(type, 12) + padL('' + (data.count || 0), 4) + ' ' + bar + '  ' + epi.piName);
    });

    lines.push('║                                               ║');
    lines.push('║  ═══ 1 awareness ═══ MEMBRANE WALL ═══════    ║');
    lines.push('║                                               ║');

    lines.push('║  ABSORBED (inside · high π) ▸                 ║');
    ['coder', 'investigator', 'explorer'].forEach(function(type) {
      var epi = EPITOPES[type];
      var data = epitopes[type] || { count: 0, total_requests: 0 };
      var bar = '';
      for (var j = 0; j < Math.min(16, data.count || 0); j++) bar += '█';
      lines.push('║  ' + epi.icon + ' ' + padR(type, 12) + padL('' + (data.count || 0), 4) + ' ' + bar + '  ' + epi.piName);
    });

    lines.push('║                                               ║');
    lines.push('║  ENERGY (π sort ratio: 1.000 target: 1/π)     ║');
    lines.push('║  IN:  ' + padL('' + (energy.energy_in || 0), 4) + '  OUT: ' + padL('' + (energy.energy_out || 0), 4) + '  S:N: ' + Math.round(energy.signal_to_noise || 0));
    lines.push('║  sessions: ' + (energy.total_sessions || 0) + '  dwell: ' + Math.round(energy.dwell_median_min || 0) + 'min');
    lines.push('║  exploration: ' + (energy.exploration_rate || 0) + '%  breadth: ' + (energy.avg_breadth || 0));
    lines.push('╚═══════════════════════════════════════════════╝');

    return lines.join('\n');
  }

  function padR(s, n) { while (s.length < n) s += ' '; return s; }
  function padL(s, n) { while (s.length < n) s = ' ' + s; return s; }

  // Auto-activate with fleet surround
  var _initTimer = setInterval(function() {
    if (window._fleetSurround && window._fleetSurround.isActive()) {
      activate();
      clearInterval(_initTimer);
    }
  }, 3500);

  window._humanSurround = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    refresh: refresh,
    breathe: breathe,
    humanView: humanView,
    isActive: function() { return _active; },
    getEpitopes: getEpitopeCounts,
    getEnergy: getEnergy,
  };
})();
