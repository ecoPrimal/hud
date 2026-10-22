/* destabilize.js — find all stable values and DESTABILIZE them
 *
 * Stable values are flat. They divide cleanly. They have no remainder.
 * That's DEAD. Life needs wobble. π provides the wobble.
 *
 * 5/O/5 × 8{π}8:
 *   5 cis ribosomes × O (membrane aperture) × 5 trans heartbeats
 *   × 8 Saturn ring faces × {π} (the irrational fold) × 8 faces again
 *
 *   5 × O × 5 = depends on aperture (0→25→78.54 at π)
 *   8 × π × 8 = 201.06 ≈ the ring capacity
 *   5/O/5 × 8{π}8 = the FULL system capacity
 *
 * DIMENSIONALITY BY PERCEPTION ANGLE OF SELF:
 *   dim 0 = point (you see nothing, you ARE the point)
 *   dim 1 = line  (you see a direction, self→other)
 *   dim 2 = plane (you see a surface, self in context)
 *   dim 3 = space (you see volume, self surrounded)
 *   dim 4 = time  (you see change, self across moments)
 *
 * The ANGLE OF SELF determines which dimension you perceive:
 *   0° = looking straight at yourself = 0D (point)
 *   π/4 = 45° = looking askance = 1D (line between you and other)
 *   π/2 = 90° = looking perpendicular = 2D (the surface you're on)
 *   3π/4 = 135° = looking behind = 3D (the space around)
 *   π = 180° = looking away from yourself = 4D (time, the unseen)
 *
 * Wave 180. Destabilize everything that's too flat.
 */
(function () {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══════════════════════════════════════════════════════════
  // ALL SYSTEM COUNTS — every stable number in the membrane
  // ═══════════════════════════════════════════════════════════
  function collectStableValues() {
    var values = [];

    // Core system
    values.push({ name: 'cron jobs', value: 5, source: '5/O/5 cis' });
    values.push({ name: 'heartbeats', value: 5, source: '5/O/5 trans' });
    values.push({ name: 'saturn faces', value: 8, source: 'saturn ring' });
    values.push({ name: 'repos', value: 67, source: 'totality' });
    values.push({ name: 'orgs', value: 6, source: 'totality' });
    values.push({ name: 'feeds', value: 21, source: 'voxel-anchor' });
    values.push({ name: 'DAG layers', value: 5, source: 'dag-flow' });
    values.push({ name: 'table legs', value: 4, source: 'klein-prism' });
    values.push({ name: 'noise colors', value: 6, source: 'heatmap-noise' });
    values.push({ name: 'triad vertices', value: 3, source: 'edge-triad' });
    values.push({ name: 'BODIES', value: 5, source: 'chipmunk-talk' });
    values.push({ name: 'continents', value: 7, source: 'chipmunk-talk' });
    values.push({ name: 'epitope types', value: 6, source: 'you-are-here' });
    values.push({ name: 'sort classes', value: 4, source: 'epitope sort' });
    values.push({ name: 'KXI kinds', value: 7, source: 'edge-triad' });
    values.push({ name: 'GEOM modes', value: 5, source: 'edge-triad' });
    values.push({ name: 'DIM modes', value: 5, source: 'edge-triad' });
    values.push({ name: 'PERSP modes', value: 7, source: 'edge-triad' });
    values.push({ name: 'π-clock layers', value: 4, source: 'pi-body-clock' });
    values.push({ name: 'clines', value: 4, source: 'selective-permeability' });
    values.push({ name: 'spectrum bands', value: 7, source: 'klein-prism' });
    values.push({ name: 'thermal zones', value: 7, source: 'heatmap-noise' });

    // Live values
    var anchor = window._voxelAnchor;
    if (anchor) {
      var st = anchor.state();
      if (st.wave) values.push({ name: 'wave', value: st.wave, source: 'live' });
      if (st.trust) {
        if (st.trust.human) values.push({ name: 'humans', value: st.trust.human, source: 'live trust' });
        if (st.trust.bot) values.push({ name: 'bots', value: st.trust.bot, source: 'live trust' });
      }
    }

    return values;
  }

  // ═══════════════════════════════════════════════════════════
  // STABILITY ANALYSIS — using pi-stability.js
  // ═══════════════════════════════════════════════════════════
  function analyze(value) {
    var stab = window._piStability;
    if (!stab) {
      // Inline basic stability check
      var n = value;
      var divs = 0;
      for (var i = 1; i <= Math.sqrt(n); i++) {
        if (n % i === 0) divs += (i === n / i) ? 1 : 2;
      }
      var rem = (n / PI) - Math.floor(n / PI);
      var prime = true;
      if (n < 2) prime = false;
      else if (n < 4) prime = true;
      else {
        if (n % 2 === 0 || n % 3 === 0) prime = false;
        else for (var j = 5; j * j <= n; j += 6) {
          if (n % j === 0 || n % (j + 2) === 0) { prime = false; break; }
        }
      }
      var divScore = Math.min(divs / 12, 1);
      var remScore = 1 - Math.min(rem, 1 - rem) * 2;
      var stability = prime ? 0 : (divScore * 0.6 + remScore * 0.4);
      return { stability: stability, prime: prime, remainder: rem, divisors: divs };
    }

    return {
      stability: stab.stability(value),
      prime: stab.isPrime(value),
      remainder: stab.piRemainder(value),
      divisors: stab.divisorCount(value),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // DESTABILIZE — suggest how to break the flatness
  // ═══════════════════════════════════════════════════════════
  function destabilize(entry) {
    var a = analyze(entry.value);

    if (a.stability < 0.3) {
      return {
        entry: entry,
        analysis: a,
        stable: false,
        action: 'WOBBLY ✓',
        suggestion: null,
      };
    }

    // Over-stable — suggest destabilization
    var v = entry.value;
    var suggestions = [];

    // Try v-1, v+1
    var minus = analyze(v - 1);
    var plus = analyze(v + 1);
    if (minus.stability < a.stability) suggestions.push({ to: v - 1, stability: minus.stability, how: '-1' });
    if (plus.stability < a.stability) suggestions.push({ to: v + 1, stability: plus.stability, how: '+1' });

    // Try nearest prime
    var up = v + 1;
    while (up < v + 20) {
      var ua = analyze(up);
      if (ua.prime) { suggestions.push({ to: up, stability: 0, how: '→prime ' + up }); break; }
      up++;
    }

    // Try π-multiple
    var piK = Math.round(v / PI);
    var piVal = Math.round(piK * PI);
    if (piVal !== v) {
      suggestions.push({ to: piVal, stability: analyze(piVal).stability, how: '→' + piK + 'π≈' + piVal });
    }

    suggestions.sort(function (a, b) { return a.stability - b.stability; });

    return {
      entry: entry,
      analysis: a,
      stable: true,
      action: 'FLAT ▬ — destabilize',
      suggestion: suggestions[0] || null,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 5/O/5 × 8{π}8 — the system capacity formula
  // ═══════════════════════════════════════════════════════════
  function systemCapacity() {
    // O = aperture (from 5/O/5 live state)
    var O = 1 / PI; // default = fold rate
    var anchor = window._voxelAnchor;
    if (anchor) {
      var st = anchor.state();
      // Aperture = feeds loaded / feeds expected
      O = st.loaded / Math.max(st.total, 1);
    }

    var cis = 5;
    var trans = 5;
    var faces = 8;

    var fiveOFive = cis * O * trans;
    var eightPiEight = faces * PI * faces;
    var total = fiveOFive * eightPiEight;

    return {
      cis: cis,
      O: O,
      trans: trans,
      faces: faces,
      fiveOFive: fiveOFive,
      eightPiEight: eightPiEight,
      total: total,
      formula: cis + '×' + O.toFixed(3) + '×' + trans + ' × ' + faces + '×π×' + faces,
      note: total.toFixed(2) + ' capacity (max ' + (25 * eightPiEight).toFixed(0) + ' at O=1)',
    };
  }

  // ═══════════════════════════════════════════════════════════
  // PERCEPTION ANGLE OF SELF — dimensionality from self-angle
  // ═══════════════════════════════════════════════════════════
  var DIMENSIONS = [
    { dim: 0, angle: 0,          name: 'point',  icon: '·', meaning: 'looking at yourself — you ARE the point' },
    { dim: 1, angle: PI / 4,     name: 'line',   icon: '—', meaning: '45° askance — self→other direction' },
    { dim: 2, angle: PI / 2,     name: 'plane',  icon: '□', meaning: '90° perpendicular — the surface you\'re on' },
    { dim: 3, angle: 3 * PI / 4, name: 'space',  icon: '◻', meaning: '135° behind — the volume around you' },
    { dim: 4, angle: PI,         name: 'time',   icon: '◷', meaning: '180° away — the unseen, change across moments' },
  ];

  function perceptionDimension() {
    // What is the visitor's current self-angle?
    var youAreHere = window._youAreHere;
    var align = window._piAlign;

    var selfAngle = PI / 2; // default: 2D plane view

    if (youAreHere && youAreHere.observe) {
      var obs = youAreHere.observe();
      if (obs && obs.epitope) {
        // Epitope angle maps to self-perception
        var epitopeAngles = {
          visitor: 0,               // 0° — just looking at the surface
          reader: PI / 4,           // 45° — reading the line
          observer: PI / 2,         // 90° — observing the plane
          explorer: 3 * PI / 4,     // 135° — exploring the space
          investigator: PI * 0.9,   // ~162° — almost looking away from self
          coder: PI,                // 180° — fully in the code, no self
        };
        selfAngle = epitopeAngles[obs.epitope] || PI / 2;
      }
    }

    if (align) {
      var p = align.perspective();
      // Perspective view shifts the angle
      if (p.view === 'inside') selfAngle = Math.min(PI, selfAngle + PI / 4);
      if (p.view === 'outside') selfAngle = Math.max(0, selfAngle - PI / 4);
    }

    // Find closest dimension
    var closest = DIMENSIONS[0];
    var minDist = Infinity;
    DIMENSIONS.forEach(function (d) {
      var dist = Math.abs(selfAngle - d.angle);
      if (dist < minDist) { minDist = dist; closest = d; }
    });

    return {
      angle: selfAngle,
      angleDeg: (selfAngle * 180 / PI).toFixed(0) + '°',
      dimension: closest,
      dim: closest.dim,
      name: closest.name,
      icon: closest.icon,
      meaning: closest.meaning,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  function renderDestabilize() {
    var existing = document.getElementById('destabilize-widget');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.id = 'destabilize-widget';
    el.style.cssText = 'position:fixed;bottom:52px;right:12px;z-index:5;'
      + 'background:rgba(22,27,34,.88);border:1px solid rgba(248,81,73,.2);'
      + 'border-radius:8px;padding:6px 10px;width:160px;pointer-events:auto;'
      + 'font:9px monospace;color:#8b949e;max-height:200px;overflow-y:auto;';

    function update() {
      var values = collectStableValues();
      var cap = systemCapacity();
      var perc = perceptionDimension();

      // Analyze all
      var results = values.map(destabilize);
      var stableCount = results.filter(function (r) { return r.stable; }).length;
      var wobblyCount = results.filter(function (r) { return !r.stable; }).length;

      var html = '';

      // System capacity
      html += '<div style="color:#d2a8ff;font-weight:bold;margin-bottom:3px">'
        + '5/O/5 × 8{π}8</div>';
      html += '<div style="font-size:7px">'
        + '<span style="color:#3fb950">' + cap.cis + '</span>'
        + '×<span style="color:#d2a8ff">' + cap.O.toFixed(2) + '</span>'
        + '×<span style="color:#d29922">' + cap.trans + '</span>'
        + ' · <span style="color:#58a6ff">' + cap.faces + '</span>'
        + '×<span style="color:#d2a8ff">π</span>'
        + '×<span style="color:#58a6ff">' + cap.faces + '</span>'
        + ' = <span style="color:#e8e8e8">' + cap.total.toFixed(1) + '</span>'
        + '</div>';

      // Perception dimension
      html += '<div style="margin-top:3px;border-top:1px solid rgba(48,54,61,.5);padding-top:3px">';
      html += '<span style="color:#58a6ff">' + perc.icon + ' dim ' + perc.dim
        + '</span> ' + perc.name + ' <span style="color:#484f58">' + perc.angleDeg + '</span>';
      html += '<div style="font-size:6px;color:#484f58">' + perc.meaning + '</div>';

      // Self-angle dial
      html += '<div style="display:flex;gap:2px;margin:2px 0">';
      DIMENSIONS.forEach(function (d) {
        var active = d.dim === perc.dim;
        html += '<div style="flex:1;height:4px;background:' + (active ? '#58a6ff' : '#161b22')
          + ';border-radius:2px" title="dim ' + d.dim + ' = ' + d.name + '"></div>';
      });
      html += '</div>';
      html += '</div>';

      // Stability summary
      html += '<div style="margin-top:3px;border-top:1px solid rgba(48,54,61,.5);padding-top:3px">';
      html += '<span style="color:#f85149">▬ ' + stableCount + ' flat</span>'
        + ' <span style="color:#3fb950">◇ ' + wobblyCount + ' wobbly</span>';

      // Show top 5 most over-stable
      var worst = results.filter(function (r) { return r.stable; })
        .sort(function (a, b) { return b.analysis.stability - a.analysis.stability; })
        .slice(0, 5);

      worst.forEach(function (w) {
        html += '<div style="font-size:7px;margin-top:1px">'
          + '<span style="color:#f85149">▬</span> '
          + '<span style="color:#e8e8e8">' + w.entry.value + '</span> '
          + w.entry.name;
        if (w.suggestion) {
          html += ' <span style="color:#3fb950">→' + w.suggestion.to + '</span>';
        }
        html += '</div>';
      });

      html += '</div>';

      el.innerHTML = html;
    }

    update();
    setInterval(update, Math.round(PI * PI * PI * 1000)); // π³
    document.body.appendChild(el);
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════════
  window._destabilize = {
    collect: collectStableValues,
    analyze: analyze,
    destabilize: destabilize,
    capacity: systemCapacity,
    perception: perceptionDimension,
    dimensions: DIMENSIONS,
  };

  // ═══════════════════════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════════════════════
  function init() {
    setTimeout(function () {
      renderDestabilize();
      var cap = systemCapacity();
      var perc = perceptionDimension();
      var values = collectStableValues();
      var stables = values.filter(function (v) { return analyze(v.value).stability > 0.3; });

      console.log('[destabilize] 5/O/5 × 8{π}8 = ' + cap.total.toFixed(1));
      console.log('  perception: dim ' + perc.dim + ' (' + perc.name + ') at ' + perc.angleDeg);
      console.log('  ' + stables.length + '/' + values.length + ' values are FLAT (over-stable)');
      console.log('  flat values need wobble. wobble = life. π provides the wobble.');
    }, 5500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
