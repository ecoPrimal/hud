// bingo-compress.js — compress the surround through the bingo sieve
// Squeeze tight → see what pops → reverse → let squirrel sort humans
//
// The bingo cube is Attention × Curiosity × Interaction.
// The sieve has 4 thresholds: full(1.0) → half(0.5) → 1/π(0.318) → tight(0.1)
// Compress: 342 entities → 14 clusters at 24.4:1
// Squirrel shakes: adds/removes dots based on who passes the sieve
//
(function() {
  'use strict';

  var _style = null;
  var _compressLevel = 0; // 0=full, 1=half, 2=pi, 3=tight
  var _compressed = false;
  var _bingoData = null;
  var _animFrame = null;

  // Sieve thresholds from compressed.json
  var SIEVE = [
    { x: 1.0,   label: 'full',  inCount: 342, outCount: 0,   self: 124, partial: 137, null: 73,  nonSelf: 8 },
    { x: 0.5,   label: 'half',  inCount: 174, outCount: 168, self: 60,  partial: 67,  null: 45,  nonSelf: 2 },
    { x: 0.318, label: '1/π',   inCount: 106, outCount: 236, self: 35,  partial: 44,  null: 25,  nonSelf: 2 },
    { x: 0.1,   label: 'tight', inCount: 33,  outCount: 309, self: 15,  partial: 13,  null: 4,   nonSelf: 1 },
  ];

  // π colors from fleet-surround
  var PI_COLORS = ['#c9d1d9','#e85d3a','#58a6ff','#5ab87a','#8b949e','#d2a8ff','#f0e68c'];

  function injectStyle() {
    if (_style) return;
    _style = document.createElement('style');
    _style.id = 'bingo-compress-css';
    _style.textContent = [
      '#bingo-sieve {',
      '  position: fixed; left: 50%; top: 50%; z-index: 5;',
      '  transform: translate(-50%, -50%);',
      '  pointer-events: none; transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);',
      '}',
      '.sieve-ring {',
      '  position: absolute; border-radius: 50%; border: 1px solid;',
      '  left: 50%; top: 50%; transform: translate(-50%, -50%);',
      '  transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);',
      '  pointer-events: none;',
      '}',
      '.sieve-label {',
      '  position: absolute; font-size: 7px; font-family: "Courier New", monospace;',
      '  pointer-events: none; white-space: nowrap;',
      '  transition: all 1s;',
      '}',
      '.sieve-particle {',
      '  position: absolute; border-radius: 50%; pointer-events: none;',
      '  transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);',
      '}',
      '.sieve-count {',
      '  position: absolute; font-size: 14px; font-weight: 600;',
      '  font-family: "Courier New", monospace; pointer-events: none;',
      '  text-align: center; transition: all 1s;',
      '}',
      '.compress-flash {',
      '  position: fixed; left: 0; top: 0; width: 100%; height: 100%;',
      '  pointer-events: none; z-index: 6;',
      '  transition: opacity 0.5s;',
      '}',
    ].join('\n');
    document.head.appendChild(_style);
  }

  // ═══ BUILD THE SIEVE RINGS ═══
  function buildSieve() {
    injectStyle();
    var container = document.getElementById('bingo-sieve');
    if (container) container.parentNode.removeChild(container);

    container = document.createElement('div');
    container.id = 'bingo-sieve';
    container.style.width = '300px';
    container.style.height = '300px';
    document.body.appendChild(container);

    // 4 concentric sieve rings
    SIEVE.forEach(function(s, i) {
      var size = 280 - i * 60;
      var ring = document.createElement('div');
      ring.className = 'sieve-ring';
      ring.dataset.level = i;
      var opacity = 0.08 + i * 0.04;
      var color = PI_COLORS[i];
      ring.style.cssText = 'width:' + size + 'px;height:' + size + 'px;border-color:' + color + ';opacity:' + opacity;
      container.appendChild(ring);

      // Label
      var label = document.createElement('span');
      label.className = 'sieve-label';
      label.style.cssText = 'left:50%;top:' + (50 - (size / 2 / 300) * 100 - 3) + '%;transform:translateX(-50%);color:' + color + ';opacity:0.4';
      label.textContent = s.label + ' x=' + s.x + ' (' + s.inCount + ' in)';
      container.appendChild(label);
    });

    // Center count
    var center = document.createElement('div');
    center.className = 'sieve-count';
    center.id = 'sieve-center-count';
    center.style.cssText = 'left:50%;top:50%;transform:translate(-50%,-50%);color:#5ab87a';
    center.textContent = '342';
    container.appendChild(center);

    // Scatter particles representing entities
    spawnParticles(container, 0);

    return container;
  }

  // ═══ PARTICLES — dots that get sieved ═══
  function spawnParticles(container, level) {
    // Remove old particles
    var old = container.querySelectorAll('.sieve-particle');
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);

    var sieve = SIEVE[level];
    var total = sieve.inCount;
    var maxDots = Math.min(total, 80);
    var ratio = total / 342;

    var classes = [
      { count: Math.round(sieve.self * maxDots / total) || 0,    color: PI_COLORS[3], cls: 'self' },
      { count: Math.round(sieve.partial * maxDots / total) || 0, color: PI_COLORS[4], cls: 'partial' },
      { count: Math.round(sieve.null * maxDots / total) || 0,    color: PI_COLORS[2], cls: 'null' },
      { count: Math.round(sieve.nonSelf * maxDots / total) || 0, color: PI_COLORS[1], cls: 'non-self' },
    ];

    var ring = 280 - level * 60;
    var dotIdx = 0;

    classes.forEach(function(cls) {
      for (var d = 0; d < cls.count; d++) {
        var angle = (dotIdx / maxDots) * Math.PI * 2 + Math.random() * 0.3;
        var r = (ring / 2 - 10) * (0.3 + Math.random() * 0.6);
        var px = 150 + Math.cos(angle) * r;
        var py = 150 + Math.sin(angle) * r;

        var dot = document.createElement('div');
        dot.className = 'sieve-particle';
        dot.dataset.sortClass = cls.cls;
        var size = 2 + Math.random() * 3;
        dot.style.cssText = 'left:' + px.toFixed(1) + 'px;top:' + py.toFixed(1) + 'px;' +
          'width:' + size + 'px;height:' + size + 'px;background:' + cls.color + ';opacity:0.5';
        container.appendChild(dot);
        dotIdx++;
      }
    });
  }

  // ═══ COMPRESS — squeeze to next level ═══
  function compress() {
    if (_compressLevel >= 3) return _compressLevel;
    _compressLevel++;
    _compressed = true;

    var container = document.getElementById('bingo-sieve');
    if (!container) container = buildSieve();

    var sieve = SIEVE[_compressLevel];

    // Shrink rings
    var rings = container.querySelectorAll('.sieve-ring');
    for (var i = 0; i < rings.length; i++) {
      var ringLevel = parseInt(rings[i].dataset.level);
      if (ringLevel < _compressLevel) {
        rings[i].style.opacity = '0.02';
        rings[i].style.borderStyle = 'dotted';
      } else if (ringLevel === _compressLevel) {
        rings[i].style.opacity = '0.3';
        rings[i].style.borderWidth = '2px';
      }
    }

    // Update center count
    var center = document.getElementById('sieve-center-count');
    if (center) {
      center.textContent = sieve.inCount;
      center.style.color = PI_COLORS[_compressLevel];
    }

    // Respawn particles at new level
    spawnParticles(container, _compressLevel);

    // Squeeze the surround strips
    squeezeSurround(_compressLevel);

    // Flash
    flash(PI_COLORS[_compressLevel]);

    // Shake — let squirrel remove dots from fleet/human surround
    squirrelShake(_compressLevel);

    // Sound
    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.onCompress(_compressLevel);
    }

    return _compressLevel;
  }

  // ═══ EXPAND — reverse, go back ═══
  function expand() {
    if (_compressLevel <= 0) { removeSieve(); return -1; }
    _compressLevel--;

    var container = document.getElementById('bingo-sieve');
    if (!container) return _compressLevel;

    var sieve = SIEVE[_compressLevel];

    // Restore rings
    var rings = container.querySelectorAll('.sieve-ring');
    for (var i = 0; i < rings.length; i++) {
      var ringLevel = parseInt(rings[i].dataset.level);
      if (ringLevel <= _compressLevel) {
        rings[i].style.opacity = (0.08 + ringLevel * 0.04).toString();
        rings[i].style.borderStyle = 'solid';
        rings[i].style.borderWidth = '1px';
      }
      if (ringLevel === _compressLevel) {
        rings[i].style.opacity = '0.2';
      }
    }

    var center = document.getElementById('sieve-center-count');
    if (center) {
      center.textContent = sieve.inCount;
      center.style.color = PI_COLORS[_compressLevel];
    }

    spawnParticles(container, _compressLevel);
    squeezeSurround(_compressLevel);
    squirrelRestore(_compressLevel);

    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.onExpand(_compressLevel);
    }

    if (_compressLevel === 0) _compressed = false;
    return _compressLevel;
  }

  // ═══ SQUEEZE THE SURROUND ═══
  function squeezeSurround(level) {
    var heights = [60, 45, 32, 20];
    var heightsB = [76, 56, 40, 24];
    var top = document.getElementById('fleet-above');
    var bottom = document.getElementById('fleet-below');
    if (top) {
      top.style.transition = 'height 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      top.style.height = heights[level] + 'px';
    }
    if (bottom) {
      bottom.style.transition = 'height 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      bottom.style.height = heightsB[level] + 'px';
    }
    // Human strips too
    var left = document.getElementById('human-left');
    var right = document.getElementById('human-right');
    var widths = [44, 34, 24, 16];
    if (left) {
      left.style.transition = 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      left.style.width = widths[level] + 'px';
    }
    if (right) {
      right.style.transition = 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      right.style.width = widths[level] + 'px';
    }
  }

  // ═══ SQUIRREL SHAKES — remove dots that don't pass the sieve ═══
  function squirrelShake(level) {
    var threshold = SIEVE[level].x;
    var allDots = document.querySelectorAll('.fleet-node');
    var removeCount = Math.floor(allDots.length * (1 - threshold));
    var indices = [];
    for (var i = 0; i < allDots.length; i++) indices.push(i);
    // Shuffle
    for (var j = indices.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = indices[j]; indices[j] = indices[k]; indices[k] = tmp;
    }

    for (var r = 0; r < removeCount; r++) {
      (function(dot, delay) {
        setTimeout(function() {
          dot.style.transition = 'opacity 0.5s, transform 0.5s';
          dot.style.opacity = '0';
          dot.style.transform = 'scale(0.3) translateY(' + (Math.random() > 0.5 ? '-20' : '20') + 'px)';
        }, delay);
      })(allDots[indices[r]], r * 60);
    }

    // Also shake human epitope dots
    var humanDots = document.querySelectorAll('.human-epi');
    var humanRemove = Math.floor(humanDots.length * (1 - threshold) * 0.5);
    for (var h = 0; h < Math.min(humanRemove, humanDots.length); h++) {
      (function(dot, delay) {
        setTimeout(function() {
          dot.style.transition = 'opacity 0.5s, transform 0.5s';
          dot.style.opacity = '0.15';
          dot.style.transform = 'scale(0.6)';
        }, delay);
      })(humanDots[h], h * 120);
    }
  }

  // ═══ SQUIRREL RESTORES — bring dots back ═══
  function squirrelRestore(level) {
    var allDots = document.querySelectorAll('.fleet-node');
    var threshold = SIEVE[level].x;
    var restoreCount = Math.floor(allDots.length * threshold);

    for (var i = 0; i < allDots.length; i++) {
      if (i < restoreCount) {
        (function(dot, delay) {
          setTimeout(function() {
            dot.style.transition = 'opacity 0.8s, transform 0.8s';
            dot.style.opacity = '1';
            dot.style.transform = '';
          }, delay);
        })(allDots[i], i * 40);
      }
    }

    var humanDots = document.querySelectorAll('.human-epi');
    for (var h = 0; h < humanDots.length; h++) {
      (function(dot, delay) {
        setTimeout(function() {
          dot.style.transition = 'opacity 0.8s, transform 0.8s';
          dot.style.opacity = '1';
          dot.style.transform = '';
        }, delay);
      })(humanDots[h], h * 80);
    }
  }

  // ═══ FLASH ═══
  function flash(color) {
    var el = document.createElement('div');
    el.className = 'compress-flash';
    el.style.background = 'radial-gradient(circle at center, ' + color + ' 0%, transparent 70%)';
    el.style.opacity = '0';
    document.body.appendChild(el);
    requestAnimationFrame(function() {
      el.style.opacity = '0.08';
      setTimeout(function() {
        el.style.opacity = '0';
        setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 600);
      }, 400);
    });
  }

  function removeSieve() {
    var container = document.getElementById('bingo-sieve');
    if (container) container.parentNode.removeChild(container);
    _compressLevel = 0;
    _compressed = false;
    squeezeSurround(0);
    squirrelRestore(0);
  }

  // ═══ FULL COMPRESS → POP SEQUENCE ═══
  function compressAndPop() {
    buildSieve();
    var phase = 0;
    var timer = setInterval(function() {
      if (phase < 3) {
        compress();
        phase++;
      } else if (phase === 3) {
        // Hold at tight for 2s
        phase++;
      } else if (phase < 7) {
        expand();
        phase++;
      } else {
        clearInterval(timer);
        removeSieve();
      }
    }, 1800);
  }

  // ═══ VIEW ═══
  function bingoView() {
    var level = SIEVE[_compressLevel];
    var lines = [];
    lines.push('\u2588\u2588 BINGO SIEVE \u2014 Attention \u00d7 Curiosity \u00d7 Interaction \u2588\u2588');
    lines.push('342 entities \u2192 14 clusters (24.4:1 compression)');
    lines.push('');
    SIEVE.forEach(function(s, i) {
      var active = (i === _compressLevel) ? ' \u25c0\u25c0\u25c0' : '';
      var color = PI_COLORS[i];
      lines.push('  x=' + s.x + ' (' + s.label + '): ' + s.inCount + ' in / ' + s.outCount + ' out' + active);
      lines.push('    self=' + s.self + ' partial=' + s.partial + ' null=' + s.null + ' non-self=' + s.nonSelf);
    });
    lines.push('');
    lines.push('\u03c0-sieve: 106/342 pass (top 31.8%)');
    lines.push('tight sieve: 33/342 survive (top 10%)');
    return lines.join('\n');
  }

  window._bingoCompress = {
    build: buildSieve,
    compress: compress,
    expand: expand,
    compressAndPop: compressAndPop,
    removeSieve: removeSieve,
    bingoView: bingoView,
    getLevel: function() { return _compressLevel; },
    isCompressed: function() { return _compressed; },
  };
})();
