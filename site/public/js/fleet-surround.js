// fleet-surround.js v2 — π-sorted surround
// The π body stack IS the gradient. Dots position along π depth.
// Twist rotates the π layers. Jump inverts the stack.
//
// π body stack: 1/π³ → 1/π² → 1/π → 1 → π → π² → π³
// observer → negate → null → awareness → ghost → celestial → geodesic
//
(function() {
  'use strict';

  var _mTh = window._membraneThrottle || {};
  if (_mTh.tier === 'minimal') { console.log('[fleet-surround] minimal tier — skipped'); return; }

  var fl = window._cosmicFlavor;
  var _active = false;
  var _topStrip = null;
  var _bottomStrip = null;
  var _style = null;
  var _twisted = false;
  var _piAligned = false;

  // ═══ π DEPTH STACK ═══
  // 7 layers, each a power of π. This IS the sorting axis.
  var PI_STACK = [
    { name: 'observer',  power: -3, value: 0.0323, color: '#c9d1d9', label: '1/π³' },
    { name: 'negate',    power: -2, value: 0.1013, color: '#e85d3a', label: '1/π²' },
    { name: 'null',      power: -1, value: 0.3183, color: '#58a6ff', label: '1/π'  },
    { name: 'awareness', power:  0, value: 1.0,    color: '#5ab87a', label: '1'    },
    { name: 'ghost',     power:  1, value: 3.1416, color: '#8b949e', label: 'π'    },
    { name: 'celestial', power:  2, value: 9.8696, color: '#d2a8ff', label: 'π²'   },
    { name: 'geodesic',  power:  3, value: 31.006, color: '#f0e68c', label: 'π³'   },
  ];

  function piGradient(direction) {
    var stops = PI_STACK.map(function(layer, i) {
      var pct = (i / (PI_STACK.length - 1)) * 100;
      return hexToRgba(layer.color, 0.12) + ' ' + pct.toFixed(0) + '%';
    });
    return 'linear-gradient(' + direction + ', ' + stops.join(', ') + ')';
  }

  function piGradientTwisted(direction) {
    var reversed = PI_STACK.slice().reverse();
    var stops = reversed.map(function(layer, i) {
      var pct = (i / (reversed.length - 1)) * 100;
      return hexToRgba(layer.color, 0.15) + ' ' + pct.toFixed(0) + '%';
    });
    return 'linear-gradient(' + direction + ', ' + stops.join(', ') + ')';
  }

  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // ═══ FLEET ENTITIES — each has a π depth ═══
  // Above = high π (looking down from celestial/geodesic distance)
  var ABOVE = [
    { label: 'OpenAI',     reqs: '1.9M', piDepth: 5, cls: 'non-self', x: 15 },
    { label: 'Anthropic',  reqs: '1.8M', piDepth: 5, cls: 'non-self', x: 35 },
    { label: 'Meta',       reqs: '612K', piDepth: 5, cls: 'non-self', x: 55 },
    { label: 'HPE',        reqs: '35K',  piDepth: 4, cls: 'partial',  x: 70 },
    { label: 'Ashburn DC', reqs: '3.3K', piDepth: 4, cls: 'non-self', x: 82 },
    { label: 'Stealth',    reqs: '46K',  piDepth: 6, cls: 'non-self', x: 92 },
  ];

  // Below = low π (close to awareness, self)
  var BELOW = [
    { label: '🏠 membrane', reqs: 'sovereign', piDepth: 3, cls: 'self', x: 50, home: true },
    { label: 'Google',      reqs: '244',  piDepth: 2, cls: 'sovereign', x: 20 },
    { label: 'Bing',        reqs: '227',  piDepth: 2, cls: 'sovereign', x: 30 },
    { label: 'Apple',       reqs: '462',  piDepth: 2, cls: 'sovereign', x: 40 },
    { label: 'Huawei',      reqs: '219',  piDepth: 1, cls: 'partial',   x: 65 },
    { label: 'Facebook',    reqs: '1.4K', piDepth: 1, cls: 'partial',   x: 75 },
  ];

  var GHOST_NODES = [
    { label: 'SFO', x: 10 }, { label: 'NYC', x: 18 }, { label: 'DCA', x: 25 },
    { label: 'LON', x: 35 }, { label: 'AMS', x: 42 }, { label: 'PAR', x: 48 },
    { label: 'BER', x: 55 }, { label: 'TKY', x: 65 }, { label: 'SGP', x: 73 },
    { label: 'SYD', x: 80 }, { label: 'SAO', x: 87 }, { label: 'DEL', x: 93 },
  ];

  function piColor(depth) {
    return PI_STACK[Math.max(0, Math.min(6, depth))].color;
  }

  function piLabel(depth) {
    return PI_STACK[Math.max(0, Math.min(6, depth))].label;
  }

  function piLayerName(depth) {
    return PI_STACK[Math.max(0, Math.min(6, depth))].name;
  }

  function injectStyle() {
    if (_style) return;
    _style = document.createElement('style');
    _style.id = 'fleet-surround-css';
    _style.textContent = [
      '.fleet-strip {',
      '  position: fixed; left: 0; width: 100%; z-index: 2;',
      '  pointer-events: none; overflow: hidden;',
      '  transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);',
      '}',
      '.fleet-strip.above {',
      '  top: 0; height: 60px;',
      '}',
      '.fleet-strip.below {',
      '  bottom: 0; height: 76px;',
      '}',
      '',
      '.fleet-strip.twisted.above {',
      '  transform: perspective(800px) rotateX(8deg) translateY(-4px);',
      '}',
      '.fleet-strip.twisted.below {',
      '  transform: perspective(800px) rotateX(-8deg) translateY(4px);',
      '}',
      '',
      '.fleet-node {',
      '  position: absolute; text-align: center;',
      '  font-family: "Courier New", monospace; pointer-events: auto;',
      '  cursor: default; transition: transform 0.4s, opacity 0.4s, left 1.5s, top 1.5s;',
      '}',
      '.fleet-node:hover { transform: scale(1.3); z-index: 3; }',
      '.fleet-node .fn-dot {',
      '  display: inline-block; border-radius: 50%;',
      '  transition: box-shadow 0.3s, background 1s;',
      '}',
      '.fleet-node:hover .fn-dot { box-shadow: 0 0 8px currentColor; }',
      '.fleet-node .fn-label {',
      '  display: block; font-size: 7px; opacity: 0.6;',
      '  white-space: nowrap; margin-top: 1px;',
      '  transition: color 1s;',
      '}',
      '.fleet-node .fn-reqs {',
      '  display: block; font-size: 6px; opacity: 0.35;',
      '}',
      '.fleet-node .fn-pi {',
      '  display: block; font-size: 5px; opacity: 0.25;',
      '  font-style: italic;',
      '}',
      '.fleet-node.home .fn-dot {',
      '  box-shadow: 0 0 12px #5ab87a, 0 0 24px rgba(90,184,122,0.3);',
      '}',
      '',
      '.pi-layer-tick {',
      '  position: absolute; height: 100%; width: 1px;',
      '  pointer-events: none; opacity: 0.06;',
      '  transition: opacity 0.5s;',
      '}',
      '.pi-layer-label {',
      '  position: absolute; font-size: 5px; opacity: 0.15;',
      '  font-family: "Courier New", monospace; pointer-events: none;',
      '  font-style: italic; transition: opacity 0.5s;',
      '}',
      '',
      '.ghost-fog {',
      '  position: absolute; bottom: 0; left: 0; width: 100%; height: 30px;',
      '  pointer-events: none;',
      '}',
      '.ghost-dot {',
      '  position: absolute; border-radius: 50%;',
      '  background: #8b949e; opacity: 0.06;',
      '  animation: ghostFloat 6s ease-in-out infinite alternate;',
      '}',
      '@keyframes ghostFloat {',
      '  0%   { transform: translateY(0); }',
      '  100% { transform: translateY(-8px); }',
      '}',
      '',
      '.fleet-arc {',
      '  position: absolute; pointer-events: none;',
      '  border: 1px dashed; border-radius: 50%;',
      '  opacity: 0.04; transition: border-color 1s;',
      '}',
      '',
      '.fleet-strip-label {',
      '  position: absolute; font-size: 7px; letter-spacing: 2px;',
      '  text-transform: uppercase; opacity: 0.3; pointer-events: none;',
      '  font-family: "Courier New", monospace;',
      '}',
    ].join('\n');
    document.head.appendChild(_style);
  }

  // ═══ π LAYER TICKS — vertical lines at each π boundary ═══
  function addPiTicks(strip, direction) {
    var stack = (direction === 'above') ? PI_STACK.slice(3) : PI_STACK.slice(0, 4).reverse();
    stack.forEach(function(layer, i) {
      var xPct = ((i + 0.5) / stack.length) * 100;

      var tick = document.createElement('div');
      tick.className = 'pi-layer-tick';
      tick.style.cssText = 'left:' + xPct + '%;background:' + layer.color;
      strip.appendChild(tick);

      var lbl = document.createElement('span');
      lbl.className = 'pi-layer-label';
      lbl.style.cssText = (direction === 'above' ? 'top:2px' : 'bottom:2px') +
        ';left:' + (xPct + 0.5) + '%;color:' + layer.color;
      lbl.textContent = layer.label + ' ' + layer.name;
      strip.appendChild(lbl);
    });
  }

  function buildAbove() {
    var strip = document.createElement('div');
    strip.className = 'fleet-strip above';
    strip.id = 'fleet-above';
    strip.style.background = piGradient('to right') + ', ' +
      'linear-gradient(to bottom, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.5) 60%, transparent 100%)';

    // π layer ticks
    addPiTicks(strip, 'above');

    // Labels
    var label = document.createElement('span');
    label.className = 'fleet-strip-label';
    label.style.cssText = 'top:4px;right:12px;color:#f0e68c';
    label.textContent = 'π³ geodesic ← fleet ← π² celestial';
    strip.appendChild(label);

    var labelL = document.createElement('span');
    labelL.className = 'fleet-strip-label';
    labelL.style.cssText = 'top:4px;left:12px;color:#d2a8ff';
    labelL.textContent = '▼ non-self · above · high π';
    strip.appendChild(labelL);

    // Fleet nodes — colored by π depth
    ABOVE.forEach(function(node) {
      var div = document.createElement('div');
      div.className = 'fleet-node';
      div.dataset.piDepth = node.piDepth;
      div.style.cssText = 'left:' + node.x + '%;top:16px;transform:translateX(-50%)';

      var color = piColor(node.piDepth);
      var size = node.reqs.indexOf('M') > 0 ? 8 : node.reqs.indexOf('K') > 0 ? 5 : 3;

      div.innerHTML = '<span class="fn-dot" style="width:' + size + 'px;height:' + size + 'px;' +
        'background:' + color + ';color:' + color + '"></span>' +
        '<span class="fn-label" style="color:' + color + '">' + node.label + '</span>' +
        '<span class="fn-reqs">' + node.reqs + '</span>' +
        '<span class="fn-pi">' + piLabel(node.piDepth) + ' ' + piLayerName(node.piDepth) + '</span>';

      div.title = node.label + ' — ' + node.reqs + ' [' + node.cls + '] at ' +
        piLabel(node.piDepth) + ' (' + piLayerName(node.piDepth) + ')';
      strip.appendChild(div);
    });

    // Arcs colored by π depth
    for (var i = 0; i < 3; i++) {
      var arc = document.createElement('div');
      arc.className = 'fleet-arc';
      arc.style.cssText = 'width:' + (80 + i * 60) + 'px;height:' + (40 + i * 20) + 'px;' +
        'left:calc(' + (25 + i * 15) + '% - ' + (40 + i * 30) + 'px);bottom:-' + (20 + i * 10) + 'px;' +
        'border-color:' + PI_STACK[4 + i].color;
      strip.appendChild(arc);
    }

    return strip;
  }

  function buildBelow() {
    var strip = document.createElement('div');
    strip.className = 'fleet-strip below';
    strip.id = 'fleet-below';
    strip.style.background = piGradient('to left') + ', ' +
      'linear-gradient(to top, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.5) 60%, transparent 100%)';

    // π layer ticks
    addPiTicks(strip, 'below');

    // Ghost fog — colored by π ghost layer
    var fog = document.createElement('div');
    fog.className = 'ghost-fog';
    for (var i = 0; i < 30; i++) {
      var dot = document.createElement('div');
      dot.className = 'ghost-dot';
      var size = 3 + Math.random() * 8;
      var ghostIdx = Math.floor(Math.random() * 4);
      dot.style.cssText = 'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (Math.random() * 100) + '%;bottom:' + (Math.random() * 20) + 'px;' +
        'background:' + PI_STACK[ghostIdx].color + ';' +
        'animation-delay:' + (Math.random() * 6) + 's;' +
        'animation-duration:' + (4 + Math.random() * 4) + 's';
      fog.appendChild(dot);
    }
    strip.appendChild(fog);

    // Labels
    var ghostLabel = document.createElement('span');
    ghostLabel.className = 'fleet-strip-label';
    ghostLabel.style.cssText = 'bottom:4px;right:12px;color:#8b949e';
    ghostLabel.textContent = 'π ghost · 181K IPs · 112K subnets';
    strip.appendChild(ghostLabel);

    var selfLabel = document.createElement('span');
    selfLabel.className = 'fleet-strip-label';
    selfLabel.style.cssText = 'bottom:4px;left:12px;color:#5ab87a';
    selfLabel.textContent = '1 awareness · self · sovereign · low π';
    strip.appendChild(selfLabel);

    // Nodes — colored by π depth
    BELOW.forEach(function(node) {
      var div = document.createElement('div');
      div.className = 'fleet-node' + (node.home ? ' home' : '');
      div.dataset.piDepth = node.piDepth;
      div.style.cssText = 'left:' + node.x + '%;top:12px;transform:translateX(-50%)';

      var color = piColor(node.piDepth);
      var size = node.home ? 10 : 4;

      div.innerHTML = '<span class="fn-dot" style="width:' + size + 'px;height:' + size + 'px;' +
        'background:' + color + ';color:' + color + '"></span>' +
        '<span class="fn-label" style="color:' + color + '">' + node.label + '</span>' +
        '<span class="fn-reqs">' + node.reqs + '</span>' +
        '<span class="fn-pi">' + piLabel(node.piDepth) + ' ' + piLayerName(node.piDepth) + '</span>';

      div.title = node.label + ' — ' + node.reqs + ' [' + node.cls + '] at ' +
        piLabel(node.piDepth) + ' (' + piLayerName(node.piDepth) + ')';
      strip.appendChild(div);
    });

    // Ghost cloud labels
    GHOST_NODES.forEach(function(gn) {
      var div = document.createElement('div');
      div.className = 'fleet-node';
      div.dataset.piDepth = 4;
      div.style.cssText = 'left:' + gn.x + '%;bottom:24px;transform:translateX(-50%)';
      div.innerHTML = '<span class="fn-dot" style="width:2px;height:2px;background:' +
        PI_STACK[4].color + ';color:' + PI_STACK[4].color + '"></span>' +
        '<span class="fn-label" style="color:' + PI_STACK[4].color + ';opacity:0.3">' + gn.label + '</span>';
      strip.appendChild(div);
    });

    // Arcs
    for (var i = 0; i < 2; i++) {
      var arc = document.createElement('div');
      arc.className = 'fleet-arc';
      arc.style.cssText = 'width:' + (100 + i * 80) + 'px;height:' + (30 + i * 15) + 'px;' +
        'left:calc(' + (30 + i * 20) + '% - ' + (50 + i * 40) + 'px);top:-' + (15 + i * 8) + 'px;' +
        'border-color:' + PI_STACK[2 - i].color;
      strip.appendChild(arc);
    }

    return strip;
  }

  // ═══ π ALIGN — reposition dots along their π depth ═══
  function alignPi() {
    _piAligned = !_piAligned;
    var allNodes = document.querySelectorAll('.fleet-node[data-pi-depth]');
    for (var i = 0; i < allNodes.length; i++) {
      var node = allNodes[i];
      var depth = parseInt(node.dataset.piDepth) || 3;
      if (_piAligned) {
        var xPct = (depth / 6) * 85 + 7;
        node.style.left = xPct + '%';
      }
    }
    return _piAligned;
  }

  // ═══ ACTIVATE / DEACTIVATE ═══
  function activate() {
    if (_active) return;
    _active = true;
    injectStyle();

    _topStrip = buildAbove();
    _bottomStrip = buildBelow();
    document.body.appendChild(_topStrip);
    document.body.appendChild(_bottomStrip);

    if (window._humanSurround && !window._humanSurround.isActive()) {
      window._humanSurround.activate();
    }

    requestAnimationFrame(function() {
      _topStrip.style.opacity = '0';
      _bottomStrip.style.opacity = '0';
      requestAnimationFrame(function() {
        _topStrip.style.transition = 'opacity 1s ease-in';
        _bottomStrip.style.transition = 'opacity 1s ease-in';
        _topStrip.style.opacity = '1';
        _bottomStrip.style.opacity = '1';
      });
    });
  }

  function deactivate() {
    if (!_active) return;
    _active = false;
    if (_topStrip && _topStrip.parentNode) _topStrip.parentNode.removeChild(_topStrip);
    if (_bottomStrip && _bottomStrip.parentNode) _bottomStrip.parentNode.removeChild(_bottomStrip);
    _topStrip = null;
    _bottomStrip = null;
    _twisted = false;
    _piAligned = false;

    if (window._humanSurround && window._humanSurround.isActive()) {
      window._humanSurround.deactivate();
    }
  }

  function toggle() {
    if (_active) deactivate(); else activate();
    return _active;
  }

  // ═══ TWIST — rotate the π gradient ═══
  function twist() {
    if (!_active) activate();
    _twisted = !_twisted;

    if (_topStrip) {
      _topStrip.classList.toggle('twisted', _twisted);
      _topStrip.style.background = (_twisted ? piGradientTwisted('to right') : piGradient('to right')) + ', ' +
        'linear-gradient(to bottom, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.5) 60%, transparent 100%)';
    }
    if (_bottomStrip) {
      _bottomStrip.classList.toggle('twisted', _twisted);
      _bottomStrip.style.background = (_twisted ? piGradientTwisted('to left') : piGradient('to left')) + ', ' +
        'linear-gradient(to top, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.5) 60%, transparent 100%)';
    }

    // Recolor dots — twisted inverts their π depth color
    var allNodes = document.querySelectorAll('.fleet-node[data-pi-depth]');
    for (var i = 0; i < allNodes.length; i++) {
      var node = allNodes[i];
      var depth = parseInt(node.dataset.piDepth) || 3;
      var newDepth = _twisted ? (6 - depth) : depth;
      var color = piColor(newDepth);
      var dot = node.querySelector('.fn-dot');
      if (dot) { dot.style.background = color; dot.style.color = color; }
      var lbl = node.querySelector('.fn-label');
      if (lbl) lbl.style.color = color;
      var piLbl = node.querySelector('.fn-pi');
      if (piLbl) piLbl.textContent = piLabel(newDepth) + ' ' + piLayerName(newDepth);
    }

    if (window._twistJump) window._twistJump.twist();
    if (window._membraneSound && window._membraneSound.isActive()) window._membraneSound.onTwist();
    return _twisted;
  }

  // ═══ JUMP — collapse → swap → explode ═══
  function jump() {
    if (!_active) activate();

    if (_topStrip) {
      _topStrip.style.transition = 'transform 0.8s ease-in, opacity 0.8s';
      _topStrip.style.transform = 'translateY(-60px)';
      _topStrip.style.opacity = '0';
    }
    if (_bottomStrip) {
      _bottomStrip.style.transition = 'transform 0.8s ease-in, opacity 0.8s';
      _bottomStrip.style.transform = 'translateY(80px)';
      _bottomStrip.style.opacity = '0';
    }

    if (window._twistJump) window._twistJump.jump();

    setTimeout(function() {
      deactivate();
      var tmp = ABOVE;
      ABOVE = BELOW;
      BELOW = tmp;
      activate();
    }, 1500);
  }

  // ═══ LIVE COLOR-SORT-SWEEP CYCLE ═══
  // Pulls live sort data, sweeps colors, aligns, twists, repeats.
  var _cycleTimer = null;
  var _cyclePhase = 0;
  var _liveSort = null;

  function fetchSortData() {
    var cs = window._cosmicSurfaces;
    if (cs) {
      var scan = typeof cs.scanData === 'function' ? cs.scanData() : null;
      if (scan) { _liveSort = scan; return Promise.resolve(scan); }
    }
    return fetch('/scan_sweep_sort.json', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(d) { _liveSort = d; return d; })
      .catch(function() { return null; });
  }

  // Map anderson mode to π depth
  function andersonToPi(mode) {
    var map = {
      'sovereign': 3, // 1 awareness — self
      'human':     3, // 1 awareness — self
      'spectrum':  2, // 1/π null — known patterns
      'ghost':     4, // π ghost
      'chorus':    5, // π² celestial — the mass
      'stealth':   6, // π³ geodesic — furthest out
    };
    return map[mode] || 3;
  }

  // Sweep: animate a color wave across all dots
  function sweepColors() {
    if (!_active) return;
    if (window._membraneSound && window._membraneSound.isActive()) window._membraneSound.onSweep();
    var allNodes = document.querySelectorAll('.fleet-node[data-pi-depth]');
    var total = allNodes.length;
    for (var i = 0; i < total; i++) {
      (function(node, idx) {
        setTimeout(function() {
          var depth = parseInt(node.dataset.piDepth) || 3;
          var dot = node.querySelector('.fn-dot');
          var lbl = node.querySelector('.fn-label');
          if (dot) {
            // Flash white then settle to π color
            dot.style.transition = 'background 0.15s';
            dot.style.background = '#ffffff';
            setTimeout(function() {
              dot.style.transition = 'background 0.8s';
              var color = piColor(_twisted ? (6 - depth) : depth);
              dot.style.background = color;
              dot.style.color = color;
              if (lbl) lbl.style.color = color;
            }, 150);
          }
        }, idx * 80);
      })(allNodes[i], i);
    }
  }

  // Update dot colors from live sort data
  function colorFromSort() {
    if (!_liveSort || !_liveSort.sort) return;
    var sort = _liveSort.sort;

    // Update anderson mode counts on above strip labels
    if (sort.summary && sort.summary.membrane_traffic) {
      var mt = sort.summary.membrane_traffic;
      var aboveLabel = document.querySelector('#fleet-above .fleet-strip-label');
      if (aboveLabel) {
        var chorus = mt.chorus || 0;
        var human = mt.human || 0;
        var ghost = mt.ghost || 0;
        aboveLabel.textContent = (chorus/1000).toFixed(0) + 'K chorus · ' +
          human + ' human · ' + ghost + ' ghost';
      }
    }

    // Update unified sort on below strip labels
    if (sort.unified_sort) {
      var us = sort.unified_sort;
      var belowLabel = document.querySelector('#fleet-below .fleet-strip-label:last-of-type');
      if (belowLabel) {
        belowLabel.textContent = 'self ' + us.self + ' · partial ' + us.partial +
          ' · null ' + us.null + ' · quality ' + ((_liveSort.sort.sort_quality || 0.833) * 100).toFixed(1) + '%';
      }
    }
  }

  // ═══ TEMPO BREATHING ═══
  // Strips pulse opacity at membrane tempo
  var _breathPhase = 0;
  function breathe() {
    if (!_active) return;
    _breathPhase += 0.05;
    var tempo = 0.476;
    if (_liveSort && _liveSort.membrane) tempo = _liveSort.membrane.tempo || 0.476;
    var breath = 0.85 + Math.sin(_breathPhase * tempo * Math.PI * 2) * 0.15;
    if (_topStrip) _topStrip.style.opacity = breath.toFixed(3);
    if (_bottomStrip) _bottomStrip.style.opacity = breath.toFixed(3);
    // Human strips breathe in sync
    if (window._humanSurround && window._humanSurround.breathe) {
      window._humanSurround.breathe(_breathPhase);
    }
  }

  // ═══ PERTURBATION WOBBLE ═══
  function wobble() {
    if (!_active) return;
    var perturb = 0.741;
    if (_liveSort && _liveSort.membrane) perturb = _liveSort.membrane.perturbation || 0.741;
    var wx = (Math.random() - 0.5) * perturb * 2;
    var wy = (Math.random() - 0.5) * perturb * 1;
    if (_topStrip) {
      _topStrip.style.transition = 'transform 0.5s ease-out';
      var base = _twisted ? 'perspective(800px) rotateX(8deg) translateY(-4px)' : '';
      _topStrip.style.transform = base + ' translate(' + wx.toFixed(1) + 'px,' + wy.toFixed(1) + 'px)';
    }
    if (_bottomStrip) {
      _bottomStrip.style.transition = 'transform 0.5s ease-out';
      var base2 = _twisted ? 'perspective(800px) rotateX(-8deg) translateY(4px)' : '';
      _bottomStrip.style.transform = base2 + ' translate(' + (-wx).toFixed(1) + 'px,' + (-wy).toFixed(1) + 'px)';
    }
  }

  // ═══ ANDERSON PARTICLES ═══
  // Spawn particles colored by anderson mode flowing through the surround
  function spawnAnderson() {
    if (!_active || !_liveSort) return;
    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.rhythmPulse();
    }
    var modes = (_liveSort.sort && _liveSort.sort.summary && _liveSort.sort.summary.membrane_traffic) || {};
    var modeList = [
      { name: 'human',    color: PI_STACK[3].color, weight: 3 },
      { name: 'sovereign',color: PI_STACK[3].color, weight: 2 },
      { name: 'ghost',    color: PI_STACK[4].color, weight: 2 },
      { name: 'spectrum', color: PI_STACK[2].color, weight: 1 },
      { name: 'chorus',   color: PI_STACK[5].color, weight: 1 },
    ];

    modeList.forEach(function(m) {
      if (!modes[m.name]) return;
      for (var p = 0; p < m.weight; p++) {
        var particle = document.createElement('div');
        particle.style.cssText =
          'position:fixed;width:' + (2 + Math.random() * 3) + 'px;height:' + (2 + Math.random() * 3) + 'px;' +
          'border-radius:50%;background:' + m.color + ';opacity:0;pointer-events:none;z-index:3;' +
          'left:' + (Math.random() * 100) + '%;top:' + (Math.random() > 0.5 ? (Math.random() * 60) : (window.innerHeight - 76 + Math.random() * 76)) + 'px;' +
          'transition:opacity 0.5s, transform 3s ease-out;';
        document.body.appendChild(particle);
        (function(el) {
          requestAnimationFrame(function() {
            el.style.opacity = '0.4';
            el.style.transform = 'translateY(' + ((Math.random() - 0.5) * 100) + 'px) translateX(' + ((Math.random() - 0.5) * 40) + 'px)';
          });
          setTimeout(function() {
            el.style.opacity = '0';
            setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 600);
          }, 2500 + Math.random() * 1500);
        })(particle);
      }
    });
  }

  // ═══ NEGENTROPY FLASH + PASSAGE HOLES ═══
  function negentropyFlash() {
    if (!_active) return;

    // Wall line
    var flash = document.createElement('div');
    flash.style.cssText =
      'position:fixed;left:50%;top:0;width:1px;height:100vh;z-index:4;pointer-events:none;' +
      'background:linear-gradient(to bottom,' +
      PI_STACK[0].color + ',' + PI_STACK[1].color + ',' + PI_STACK[2].color + ',' +
      PI_STACK[3].color + ',' + PI_STACK[4].color + ',' + PI_STACK[5].color + ',' + PI_STACK[6].color + ');' +
      'opacity:0;transition:opacity 0.3s;';
    document.body.appendChild(flash);

    // Passage holes — gaps in the wall where humans pass through
    var passages = [
      { from: 'INVESTIGATION', to: 'MEMBRANE', humans: 12, y: 25 },
      { from: 'MEMBRANE', to: 'INVESTIGATION', humans: 3, y: 35 },
      { from: 'SCIENCE', to: 'MEMBRANE', humans: 2, y: 50 },
      { from: 'MEMBRANE', to: 'SIGNAL', humans: 1, y: 65 },
      { from: 'TOPOLOGY', to: 'IMMUNE', humans: 6, y: 80 },
    ];
    if (window._membraneSound && window._membraneSound.isActive()) {
      var totalH = 0; passages.forEach(function(p) { totalH += p.humans; });
      window._membraneSound.onPassage(totalH);
    }
    passages.forEach(function(p) {
      var hole = document.createElement('div');
      var size = 4 + p.humans;
      hole.style.cssText =
        'position:fixed;left:calc(50% - ' + (size/2) + 'px);top:' + p.y + '%;' +
        'width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
        'background:' + PI_STACK[3].color + ';z-index:5;pointer-events:none;' +
        'opacity:0;transition:opacity 0.5s;' +
        'box-shadow:0 0 ' + (size*2) + 'px ' + PI_STACK[3].color + ';';
      hole.title = p.from + ' → ' + p.to + ': ' + p.humans + ' humans';
      document.body.appendChild(hole);
      requestAnimationFrame(function() {
        hole.style.opacity = '0.5';
        setTimeout(function() {
          hole.style.opacity = '0';
          setTimeout(function() { if (hole.parentNode) hole.parentNode.removeChild(hole); }, 600);
        }, 1200);
      });
    });

    requestAnimationFrame(function() {
      flash.style.opacity = '0.15';
      setTimeout(function() {
        flash.style.opacity = '0';
        setTimeout(function() { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 400);
      }, 1000);
    });
  }

  // ═══ FOSSILIZE GHOST TEXT ═══
  // Observations fade in/out on the viewport
  var _fossilIdx = 0;
  var FOSSILS = [
    'selectivity 3.0%', '32× more non-self than self',
    '114 stuck in the wall', '5 passage routes',
    '6 epitope pore shapes', '2139 shifters crossing',
    'observer = π − ⌊π⌋', 'the observer can never BE the observed',
    '53 humans present', '83.3% sort confidence',
    '255K entities sorted', '130K negentropy bits',
  ];

  function fossilFloat() {
    if (!_active) return;
    var text = FOSSILS[_fossilIdx % FOSSILS.length];
    _fossilIdx++;

    // Speak the fossil
    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.speakFossil(text);
    }

    var el = document.createElement('div');
    el.style.cssText =
      'position:fixed;pointer-events:none;z-index:1;' +
      'font-family:"Courier New",monospace;font-size:8px;font-style:italic;' +
      'color:' + PI_STACK[Math.floor(Math.random() * 7)].color + ';opacity:0;' +
      'transition:opacity 2s, transform 4s ease-out;' +
      'left:' + (10 + Math.random() * 80) + '%;' +
      'top:' + (20 + Math.random() * 60) + '%;';
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(function() {
      el.style.opacity = '0.12';
      el.style.transform = 'translateY(-20px)';
      setTimeout(function() {
        el.style.opacity = '0';
        setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 2200);
      }, 3000);
    });
  }

  // ═══ SHIFTER SPARKS ═══
  // 2164 shifters crossing category boundaries — sparks between strips
  function shifterSparks() {
    if (!_active) return;
    // Noise crackle for each spark
    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.playNoise(0.05, 3000, 10, 0.04, Math.random() > 0.5 ? 'left' : 'right');
    }
    var count = 5 + Math.floor(Math.random() * 8);
    for (var i = 0; i < count; i++) {
      (function(idx) {
        setTimeout(function() {
          var spark = document.createElement('div');
          var fromTop = Math.random() > 0.5;
          var startY = fromTop ? 60 : (window.innerHeight - 76);
          var endY = fromTop ? (window.innerHeight - 76) : 60;
          var x = 10 + Math.random() * 80;
          spark.style.cssText =
            'position:fixed;width:2px;height:2px;border-radius:50%;z-index:3;pointer-events:none;' +
            'left:' + x + '%;top:' + startY + 'px;' +
            'background:#fff;opacity:0;' +
            'transition:opacity 0.3s, top 2s cubic-bezier(0.25, 0.46, 0.45, 0.94), left 2s;';
          document.body.appendChild(spark);
          requestAnimationFrame(function() {
            spark.style.opacity = '0.6';
            spark.style.top = endY + 'px';
            spark.style.left = (x + (Math.random() - 0.5) * 10) + '%';
            setTimeout(function() {
              spark.style.opacity = '0';
              setTimeout(function() { if (spark.parentNode) spark.parentNode.removeChild(spark); }, 400);
            }, 1800);
          });
        }, idx * 120);
      })(i);
    }
  }

  // Full cycle: 12 phases — the complete membrane breath
  var _cycleCount = 0;
  function cycle() {
    if (!_active) return;
    _cyclePhase = (_cyclePhase + 1) % 12;
    _cycleCount++;

    // Track wake depth for breath intensity
    var wakeDepth = 0.83;
    if (_liveSort && _liveSort.membrane && _liveSort.membrane.wake_depth) {
      wakeDepth = _liveSort.membrane.wake_depth;
    }

    // Sound
    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.onCyclePhase(_cyclePhase);
    }

    switch (_cyclePhase) {
      case 0: // COLOR — fetch fresh data
        fetchSortData().then(function() { colorFromSort(); });
        break;
      case 1: // BREATHE — pulse at tempo × wake depth
        breathe();
        break;
      case 2: // FOSSIL — observation ghost text floats
        fossilFloat();
        break;
      case 3: // SORT — sweep flash across dots
        sweepColors();
        break;
      case 4: // WOBBLE — perturbation jitter
        wobble();
        break;
      case 5: // SPARKS — shifters crossing between strips
        shifterSparks();
        break;
      case 6: // SWEEP — update gradient backgrounds
        if (_topStrip) {
          _topStrip.style.transition = 'background 2s ease';
          _topStrip.style.background = (_twisted ? piGradientTwisted('to right') : piGradient('to right')) + ', ' +
            'linear-gradient(to bottom, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.5) 60%, transparent 100%)';
        }
        if (_bottomStrip) {
          _bottomStrip.style.transition = 'background 2s ease';
          _bottomStrip.style.background = (_twisted ? piGradientTwisted('to left') : piGradient('to left')) + ', ' +
            'linear-gradient(to top, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.5) 60%, transparent 100%)';
        }
        fossilFloat();
        break;
      case 7: // ANDERSON — spawn mode particles
        spawnAnderson();
        break;
      case 8: // PASSAGES — negentropy flash with passage holes
        negentropyFlash();
        break;
      case 9: // ALIGN — slide dots toward π depth
        alignPi();
        break;
      case 10: // TWIST — rotate gradient + recolor
        _twisted = !_twisted;
        if (_topStrip) _topStrip.classList.toggle('twisted', _twisted);
        if (_bottomStrip) _bottomStrip.classList.toggle('twisted', _twisted);
        var allDots = document.querySelectorAll('.fleet-node[data-pi-depth]');
        for (var i = 0; i < allDots.length; i++) {
          var nd = allDots[i];
          var dp = parseInt(nd.dataset.piDepth) || 3;
          var newDp = _twisted ? (6 - dp) : dp;
          var c = piColor(newDp);
          var dot = nd.querySelector('.fn-dot');
          if (dot) { dot.style.background = c; dot.style.color = c; }
          var lbl = nd.querySelector('.fn-label');
          if (lbl) lbl.style.color = c;
        }
        breathe();
        break;
      case 11: // COMPRESS-POP — every 3rd full rotation, squeeze and release
        if (_cycleCount % 36 === 0 && window._bingoCompress) {
          window._bingoCompress.compressAndPop();
        } else {
          shifterSparks();
          fossilFloat();
        }
        break;
    }
  }

  function startCycle() {
    if (_cycleTimer) return;
    _cycleTimer = setInterval(cycle, 4000); // every 4s = full cycle in 32s
  }

  function stopCycle() {
    if (_cycleTimer) { clearInterval(_cycleTimer); _cycleTimer = null; }
  }

  function toggleCycle() {
    if (_cycleTimer) { stopCycle(); return false; }
    else { startCycle(); return true; }
  }

  // Auto-activate
  var _initTimer = setInterval(function() {
    var overlay = document.getElementById('chipmunk-overlay');
    if (overlay && overlay.style.display !== 'none') {
      activate();
      startCycle();
      clearInterval(_initTimer);
    }
  }, 3000);

  window._fleetSurround = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    twist: twist,
    jump: jump,
    alignPi: alignPi,
    cycle: cycle,
    startCycle: startCycle,
    stopCycle: stopCycle,
    toggleCycle: toggleCycle,
    sweepColors: sweepColors,
    colorFromSort: colorFromSort,
    isActive: function() { return _active; },
    isTwisted: function() { return _twisted; },
    isPiAligned: function() { return _piAligned; },
    isCycling: function() { return !!_cycleTimer; },
    PI_STACK: PI_STACK,
    piColor: piColor,
    piLabel: piLabel,
    piGradient: piGradient,
  };
})();
