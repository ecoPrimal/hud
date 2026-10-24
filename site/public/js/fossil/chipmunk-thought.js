/* chipmunk-thought.js — thought dimension system
 * Extracted from chipmunk-mind.js. Thoughts radiate outward
 * through π-dimensional layers: null → self → connect → thought → beyond.
 */
(function() {
  'use strict';
  var _c = window._chipmunkCore;
  if (!_c) return;

  var cache      = _c.cache;
  var learning   = _c.learning;
  var el         = _c.el;
  var n          = _c.n;
  var PI         = _c.PI;
  var PI2        = PI * PI, PI3 = PI * PI * PI;
  var MG         = _c.MG;
  var bodyRadius = _c.bodyRadius;
  var addEntry   = _c.addEntry;
  var thoughts   = _c.thoughts;
  var thoughtLog = _c.thoughtLog;
  var MAX_THOUGHTS = _c.MAX_THOUGHTS;
  var SORT_COLORS  = _c.SORT_COLORS;
  var sessionId    = _c.sessionId;
  var svgEl        = _c.svgEl;

  // ═══ THOUGHT DIMENSIONS ═══
  // Thoughts shift color as they cross π layers:
  //   null(π⁰) → self(π¹) → connect(π²) → thought(π³) → beyond(π^π)
  var THOUGHT_DIMENSIONS = [
    { name: 'null',     color: '#1a1a2e', glyph: '·', pi: 1,     label: 'void'    },
    { name: 'self',     color: '#3fb950', glyph: '?', pi: PI,    label: 'self'    },
    { name: 'connect',  color: '#58a6ff', glyph: '~', pi: PI2,   label: 'connect' },
    { name: 'thought',  color: '#e8e8e8', glyph: '○', pi: PI3,   label: 'thought' },
    { name: 'external', color: '#e85d3a', glyph: '!', pi: PI3 * 1.18, label: 'beyond' },
  ];

  function lerpColor(a, b, t) {
    var ah = parseInt(a.replace('#',''), 16);
    var bh = parseInt(b.replace('#',''), 16);
    var ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    var br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    var rr = Math.round(ar + (br - ar) * t);
    var rg = Math.round(ag + (bg - ag) * t);
    var rb = Math.round(ab + (bb - ab) * t);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1);
  }

  // Get the dimensional color for a thought at a given radius
  function thoughtDimensionColor(r) {
    var radii = THOUGHT_DIMENSIONS.map(function(d) { return bodyRadius(d.pi); });
    // Before first boundary: null color
    if (r <= radii[0]) return THOUGHT_DIMENSIONS[0].color;
    // After last boundary: external color
    if (r >= radii[radii.length - 1]) return THOUGHT_DIMENSIONS[radii.length - 1].color;
    // Interpolate between boundaries
    for (var i = 0; i < radii.length - 1; i++) {
      if (r >= radii[i] && r < radii[i + 1]) {
        var t = (r - radii[i]) / (radii[i + 1] - radii[i]);
        return lerpColor(THOUGHT_DIMENSIONS[i].color, THOUGHT_DIMENSIONS[i + 1].color, t);
      }
    }
    return THOUGHT_DIMENSIONS[0].color;
  }

  // Get the dimension name for a thought at a given radius
  function thoughtDimensionName(r) {
    var radii = THOUGHT_DIMENSIONS.map(function(d) { return bodyRadius(d.pi); });
    for (var i = radii.length - 1; i >= 0; i--) {
      if (r >= radii[i] * 0.9) return THOUGHT_DIMENSIONS[i];
    }
    return THOUGHT_DIMENSIONS[0];
  }

  // Get glyph for current dimension
  function thoughtGlyph(r) {
    return thoughtDimensionName(r).glyph;
  }


  // --- spawnFleetThought (L1951) ---
  function spawnFleetThought() {
    var anderson = cache.dashboard.anderson_selectivity || {};
    var modes = anderson.modes || [];
    var fleetClasses = modes.filter(function(m) { return m.class !== 'human' && m.class !== 'sovereign'; });
    if (fleetClasses.length === 0) return;

    // Pick a fleet class to hypothesize about
    var target = fleetClasses[Math.floor(Math.random() * fleetClasses.length)];
    
    // Hypothesis: what IS this fleet entity, really?
    var hypothesis;
    var confidence;
    var reasoning;

    if (target.class === 'chorus') {
      // Chorus is obviously non-self — high confidence
      hypothesis = 'non-self';
      confidence = 0.85 + Math.random() * 0.1;
      reasoning = 'chorus: ' + target.count.toLocaleString() + ' entities, p_obs=' + target.p_observed.toFixed(2) + ' — overwhelming volume, no pause, no reflection';
    }
    else if (target.class === 'ghost') {
      // Ghost is ambiguous — could be proxy exit (partial) or mimic (non-self)
      hypothesis = Math.random() < 0.6 ? 'partial' : 'non-self';
      confidence = 0.3 + Math.random() * 0.3;
      reasoning = 'ghost: ' + target.count.toLocaleString() + ' entities, p_obs=' + target.p_observed.toFixed(2) + ' — mimics human headers but identity uncertain';
    }
    else if (target.class === 'stealth') {
      // Stealth is invisible — null-like
      hypothesis = Math.random() < 0.5 ? 'non-self' : 'partial';
      confidence = 0.15 + Math.random() * 0.2;
      reasoning = 'stealth: ' + target.count + ' entities — evades all sensors, identity unknown';
    }
    else if (target.class === 'spectrum') {
      // Spectrum is at the boundary — partially classified
      hypothesis = 'partial';
      confidence = 0.4 + Math.random() * 0.2;
      reasoning = 'spectrum: ' + target.count + ' entities at classification boundary — in transit between self and non-self';
    }
    else {
      hypothesis = 'non-self';
      confidence = 0.5;
      reasoning = target.class + ': unknown fleet type';
    }

    // Use fleet learning to adjust confidence
    var fleetMem = learning.fleetMemory['fleet:' + target.class];
    if (fleetMem && fleetMem.prev_count !== null) {
      // If count is stable, increase confidence
      if (Math.abs(fleetMem.delta) < 10) confidence = Math.min(0.95, confidence + 0.1);
      // If count is volatile, decrease confidence  
      else confidence = Math.max(0.1, confidence - 0.1);
    }

    var angle = Math.random() * 2 * PI;
    var thought = {
      angle: angle,
      r: 3,
      hypothesis: hypothesis,
      reasoning: reasoning,
      confidence: confidence,
      speed: 2 + confidence * 4,
      opacity: 0,
      born: Date.now(),
      survived: false,
      popped: false,
      settled: false,
      el: null,
      labelEl: null,
      entityIdx: -1, // fleet thoughts use negative index
      isFleet: true,
      fleetClass: target.class,
    };

    thoughts.push(thought);
  }

  // --- spawnThought (L2027) ---
  function spawnThought() {
    if (thoughts.length >= MAX_THOUGHTS) return;
    if (!cache.scanSort || !cache.scanSort.scan) return;

    // 30% chance: think about a fleet entity instead of null
    var thinkFleet = Math.random() < 0.3 && cache.dashboard && cache.dashboard.anderson_selectivity;
    
    if (thinkFleet) {
      spawnFleetThought();
      return;
    }

    // Pick a null entity to think about
    var nullCount = (cache.scanSort.scan.sort_classes || {}).null || 0;
    if (nullCount === 0) return;

    // Generate a hypothesis based on what chipmunk has learned
    var hypothesis;
    var confidence;
    if (learning.phase === 'mimic') {
      // In mimic phase, hypothesis is random
      var r = Math.random();
      hypothesis = r < 0.4 ? 'self' : r < 0.7 ? 'partial' : 'non-self';
      confidence = 0.2 + Math.random() * 0.3; // low confidence
    } else {
      // In mirror/reflect, use learned ratios
      var r2 = Math.random();
      if (r2 < (learning.selfRatio || 0.3)) hypothesis = 'self';
      else if (r2 < (learning.selfRatio || 0.3) + (learning.partialRatio || 0.3)) hypothesis = 'partial';
      else hypothesis = 'non-self';
      confidence = Math.min(0.9, (learning.confidence || 0.3) + Math.random() * 0.2);
    }

    // Pick an edge type that might explain the entity
    var edgeTypes = (cache.scanSort.scan.edge_types) || {};
    var etKeys = Object.keys(edgeTypes);
    var reasoning = etKeys.length > 0 ? etKeys[Math.floor(Math.random() * etKeys.length)] : 'unknown';

    var angle = Math.random() * 2 * PI;
    var thought = {
      angle: angle,
      r: 3,
      hypothesis: hypothesis,
      reasoning: reasoning,
      confidence: confidence,
      speed: 2 + confidence * 4, // confident thoughts move faster
      opacity: 0,
      born: Date.now(),
      survived: false,
      popped: false,
      settled: false,
      el: null,
      labelEl: null,
      entityIdx: Math.floor(Math.random() * nullCount),
    };

    thoughts.push(thought);
  }

  // --- animateThoughts (L2086) ---
  function animateThoughts(now) {
    if (!svgEl) return;
    var cx2 = MG.cx, cy2 = MG.cy;
    var surfaceR = bodyRadius(PI3);

    // Create a thoughts group if needed
    var tGroup = svgEl.querySelector('#mg-thoughts');
    if (!tGroup) {
      tGroup = el('g', { id: 'mg-thoughts' }, svgEl);
      // Draw dimensional guide rings — faint circles at each π boundary
      THOUGHT_DIMENSIONS.forEach(function(dim) {
        var dimR = bodyRadius(dim.pi);
        el('circle', {
          cx: cx2, cy: cy2, r: dimR.toFixed(1),
          fill: 'none', stroke: dim.color,
          'stroke-width': '0.3',
          'stroke-dasharray': '2,4',
          opacity: '0.15'
        }, tGroup);
      });
    }

    for (var ti = thoughts.length - 1; ti >= 0; ti--) {
      var t = thoughts[ti];

      // Create SVG elements if needed
      if (!t.el) {
        t.el = el('circle', {
          r: 2.5 + t.confidence * 2,
          fill: SORT_COLORS[t.hypothesis] || '#484f58',
          opacity: 0,
          filter: 'url(#thought-glow)',
          'class': 'thought-bubble'
        }, tGroup);
        // Add a tiny label showing the hypothesis
        t.labelEl = el('text', {
          fill: '#c9d1d9', 'font-size': 2,
          'text-anchor': 'middle',
          'font-family': '"Courier New",monospace',
          opacity: 0,
          'class': 'thought-label'
        }, tGroup);
        t.labelEl.textContent = t.isAgent ? '\u2728' : t.hypothesis === 'self' ? '?' : t.hypothesis === 'non-self' ? '!' : '~';
      }

      // Move outward
      t.r += t.speed * 0.08;
      t.opacity = Math.min(0.6, t.opacity + 0.02);

      var tx = cx2 + t.r * Math.cos(t.angle);
      var ty = cy2 + t.r * Math.sin(t.angle);

      // Dimensional color shift — thought color changes as it crosses π layers
      var dimColor = thoughtDimensionColor(t.r);
      t.el.setAttribute('fill', dimColor);
      t.el.setAttribute('cx', tx.toFixed(1));
      t.el.setAttribute('cy', ty.toFixed(1));
      t.el.setAttribute('opacity', t.opacity.toFixed(2));

      // Glyph shifts with dimension
      var dimGlyph = thoughtGlyph(t.r);
      if (t.labelEl.textContent !== dimGlyph) t.labelEl.textContent = dimGlyph;
      t.labelEl.setAttribute('x', tx.toFixed(1));
      t.labelEl.setAttribute('y', (ty - 3).toFixed(1));
      t.labelEl.setAttribute('opacity', (t.opacity * 0.7).toFixed(2));

      // At each dimensional boundary, the thought transforms
      // null(black) → self(green) → connect(blue) → thought(white) → beyond(red)
      THOUGHT_DIMENSIONS.forEach(function(dim, di) {
        var br = bodyRadius(dim.pi);
        if (Math.abs(t.r - br) < 1.5 && !t['crossed_' + dim.name]) {
          t['crossed_' + dim.name] = true;
          t.currentDimension = dim.name;

          // Each boundary tests a different aspect
          var testScore;
          if (dim.name === 'null') {
            testScore = 0.9; // everything passes null — you exist
          } else if (dim.name === 'self') {
            // Self test: does this thought recognize itself?
            testScore = t.hypothesis === 'self' ? 0.8 : 0.5;
          } else if (dim.name === 'connect') {
            // Connection test: can this thought relate to others?
            testScore = t.hypothesis === 'partial' ? 0.7 : t.confidence;
          } else if (dim.name === 'thought') {
            // Thought test: is it clear enough to be expressed?
            testScore = t.confidence;
          } else {
            // Beyond test: does it survive contact with the external?
            testScore = t.hypothesis === 'non-self' ? 0.75 : t.confidence * 0.7;
          }

          if (Math.random() < testScore) {
            t.confidence = Math.min(0.95, t.confidence + 0.05);
            t.speed *= 1.1;
            // Flash: briefly brighten at boundary crossing
            t.opacity = Math.min(0.8, t.opacity + 0.15);
          } else {
            t.confidence *= 0.6;
            t.speed *= 0.5;
            t.angle += (Math.random() - 0.5) * 0.5;
          }
        }
      });

      // Dissipation check — low confidence thoughts pop
      if (t.confidence < 0.1 && t.r > bodyRadius(1)) {
        t.popped = true;
      }

      // Surface arrival — thought survived!
      if (t.r >= surfaceR * 0.9 && !t.popped && (!t.dir || t.dir > 0)) {
        t.survived = true;
      }
      // Core arrival — inward thought reached the center
      if (t.dir && t.dir < 0 && t.r <= 5 && !t.popped) {
        t.survived = true;
      }

      // Remove popped or survived thoughts
      if (t.popped || t.survived) {
        // Fade out
        t.opacity -= 0.1;
        if (t.opacity <= 0) {
          if (t.el && t.el.parentNode) t.el.parentNode.removeChild(t.el);
          if (t.labelEl && t.labelEl.parentNode) t.labelEl.parentNode.removeChild(t.labelEl);

          if (t.survived && !t.settled) {
            t.settled = true;
            // This thought made it — record the inner sort result
            thoughtLog.push({
              hypothesis: t.hypothesis,
              reasoning: t.reasoning,
              confidence: t.confidence,
              entityIdx: t.entityIdx,
              dimension: (t.currentDimension || thoughtDimensionName(t.r).name),
              color: thoughtDimensionColor(t.r),
              ts: Date.now()
            });

            // Announce it sparingly
            if (thoughtLog.length % 3 === 1) {
              addEntry('chipmunk',
                '<span class="dim">&#128173;</span> thought settled: <span style="color:' + thoughtDimensionColor(t.r) + '">' + thoughtDimensionName(t.r).label + '</span> #' + t.entityIdx +
                ' \u2192 <span class="' + (t.hypothesis === 'self' ? 'good' : 'warn') + '">' +
                t.hypothesis + '</span> (via ' + t.reasoning + ', conf ' + n(t.confidence, 2) + ')');

              // Journal the inner sort
              try {
                fetch('/chipmunk/note', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    session: sessionId,
                    note: 'THOUGHT_SORT: null#' + t.entityIdx + ' \u2192 ' + t.hypothesis,
                    context: {
                      reasoning: t.reasoning,
                      confidence: t.confidence,
                      phase: learning.phase,
                      thoughtsSettled: thoughtLog.length
                    }
                  })
                }).catch(function() {});
              } catch(e2) {}
            }
          }
          thoughts.splice(ti, 1);
        }
      }

      // Age out stale thoughts (> 30s, or > 20s for pressure thoughts)
      var maxAge = t.shell !== undefined ? 20000 : 30000;
      if (Date.now() - t.born > maxAge && !t.survived) {
        t.popped = true;
      }
    }
  }


  // ═══ EXPORT ═══
  window._chipmunkThought = {
    THOUGHT_DIMENSIONS: THOUGHT_DIMENSIONS,
    lerpColor: lerpColor,
    thoughtDimensionColor: thoughtDimensionColor,
    thoughtDimensionName: thoughtDimensionName,
    thoughtGlyph: thoughtGlyph,
    spawnFleetThought: spawnFleetThought,
    spawnThought: spawnThought,
    animateThoughts: animateThoughts
  };
})();
