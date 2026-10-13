// chipmunk-explorer.js — individual exploration trail + collective awareness
// Each human builds their own path through the membrane.
// Trail persists in localStorage. Others' trails visible from presence data.
// The chipmunk knows where YOU are and what you haven't seen.
(function() {
  'use strict';
  var STORE_KEY = 'chipmunk-trail-v1';
  var MAX_TRAIL = 200;
  var PI = Math.PI;

  // ═══ EXPLORER IDENTITY ═══
  // Persistent across sessions via localStorage
  var trail = loadTrail();

  function loadTrail() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var t = JSON.parse(raw);
        if (t && t.steps && t.id) return t;
      }
    } catch(e) {}
    return freshTrail();
  }

  function freshTrail() {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
      born: Date.now(),
      epitope: null,
      steps: [],
      seen: {},        // { panelName: count }
      entities: {},    // { entityId: firstSeen timestamp }
      braids: {},      // { braidKey: count }
      commands: {},    // { commandName: count }
      depth: 0,        // π-depth: 0=surface, 1=π, 2=π², 3=π³
      visits: 1,
      lastVisit: Date.now(),
    };
  }

  function saveTrail() {
    try {
      // Trim old steps if needed
      if (trail.steps.length > MAX_TRAIL) {
        trail.steps = trail.steps.slice(-MAX_TRAIL);
      }
      localStorage.setItem(STORE_KEY, JSON.stringify(trail));
    } catch(e) {}
  }

  // ═══ TRAIL RECORDING ═══
  // Every exploration action adds a step

  function step(kind, detail) {
    var s = { t: Date.now(), k: kind, d: detail };
    trail.steps.push(s);

    // Update aggregates
    if (kind === 'panel') {
      trail.seen[detail] = (trail.seen[detail] || 0) + 1;
    } else if (kind === 'entity') {
      if (!trail.entities[detail]) trail.entities[detail] = Date.now();
    } else if (kind === 'braid') {
      trail.braids[detail] = (trail.braids[detail] || 0) + 1;
    } else if (kind === 'command') {
      trail.commands[detail] = (trail.commands[detail] || 0) + 1;
    }

    // Compute depth from what they've seen
    trail.depth = computeDepth();
    saveTrail();

    // Notify metabolism: exploration is energy
    var metab = window._chipmunkCore && window._chipmunkCore.metabolism;
    if (metab && window._chipmunkCore._metab) {
      window._chipmunkCore._metab.addSpringV(0.003); // tiny upward nudge per step
    }
  }

  function computeDepth() {
    var panelTypes = Object.keys(trail.seen).length;
    var entityCount = Object.keys(trail.entities).length;
    var braidCount = Object.keys(trail.braids).length;
    var cmdCount = Object.keys(trail.commands).length;

    // Depth layers correspond to π powers:
    // 0: visitor (just arrived)
    // 1: reader (opened panels, seen data)         — at π
    // 2: investigator (followed entities, braids)   — at π²
    // 3: explorer (deep commands, cross-references) — at π³
    if (cmdCount >= 5 && entityCount >= 10 && braidCount >= 3) return 3;
    if (entityCount >= 5 || braidCount >= 2 || cmdCount >= 3) return 2;
    if (panelTypes >= 2 || trail.steps.length >= 5) return 1;
    return 0;
  }

  // ═══ POSITION ON THE MEMBRANE ═══
  // Where is THIS human right now?

  function currentPosition() {
    // The human's angle on the membrane is determined by their most recent activity
    var recent = trail.steps.slice(-10);
    if (!recent.length) return { angle: -PI/2, r: 0.62, depth: 0, category: 'none' };

    // Map step kinds to membrane categories
    var categoryHits = {};
    recent.forEach(function(s) {
      var cat = stepCategory(s);
      categoryHits[cat] = (categoryHits[cat] || 0) + 1;
    });

    // Find dominant category
    var bestCat = 'OTHER', bestN = 0;
    Object.keys(categoryHits).forEach(function(c) {
      if (categoryHits[c] > bestN) { bestCat = c; bestN = categoryHits[c]; }
    });

    var CAT_ANGLE = {
      TOPOLOGY: -PI/2,              INVESTIGATION: -PI/2 + PI*0.33,
      MEMBRANE: -PI/2 + PI*0.67,    IMMUNE: -PI/2 + PI,
      SIGNAL: -PI/2 + PI*1.33,      OTHER: -PI/2 + PI*1.67,
      SCIENCE: -PI/2 + PI*0.5,
    };

    var angle = CAT_ANGLE[bestCat] || -PI/2;
    // Depth determines radial distance: deeper = closer to center
    var rNorm = 0.65 - trail.depth * 0.1; // 0.65 → 0.35

    return { angle: angle, r: rNorm, depth: trail.depth, category: bestCat };
  }

  function stepCategory(s) {
    var d = (s.d || '').toLowerCase();
    if (d.indexOf('fleet') >= 0 || d.indexOf('scan') >= 0 || d.indexOf('sieve') >= 0) return 'INVESTIGATION';
    if (d.indexOf('genome') >= 0 || d.indexOf('immune') >= 0 || d.indexOf('tuebor') >= 0) return 'IMMUNE';
    if (d.indexOf('membrane') >= 0 || d.indexOf('observe') >= 0 || d.indexOf('energy') >= 0) return 'MEMBRANE';
    if (d.indexOf('explore') >= 0 || d.indexOf('braid') >= 0) return 'INVESTIGATION';
    if (d.indexOf('topology') >= 0 || d.indexOf('topo') >= 0) return 'TOPOLOGY';
    if (d.indexOf('signal') >= 0) return 'SIGNAL';
    return 'OTHER';
  }

  // ═══ UNSEEN — what this human hasn't explored yet ═══

  function unseen() {
    var allPanels = ['observe', 'fleet', 'genome', 'explore', 'scan', 'sieve', 'memory', 'energy'];
    var allCommands = ['/observe', '/fleet', '/genome', '/explore', '/scan', '/sieve',
                       '/energy', '/memory', '/rest', '/sleep', '/wake',
                       '/note', '/sort', '/sing', '/pollen'];
    var unseenPanels = allPanels.filter(function(p) { return !trail.seen[p]; });
    var unseenCommands = allCommands.filter(function(c) { return !trail.commands[c.replace('/', '')]; });

    return {
      panels: unseenPanels,
      commands: unseenCommands,
      entityCount: Object.keys(trail.entities).length,
      braidCount: Object.keys(trail.braids).length,
      depth: trail.depth,
      suggestion: suggestNext(unseenPanels),
    };
  }

  function suggestNext(unseenPanels) {
    if (trail.steps.length === 0) return 'try typing something — the chipmunk is listening';
    if (trail.depth === 0 && unseenPanels.indexOf('observe') >= 0) return 'type /observe to see what the chipmunk sees';
    if (trail.depth <= 1 && unseenPanels.indexOf('explore') >= 0) return 'type /explore to follow the investigation paths';
    if (trail.depth <= 1 && unseenPanels.indexOf('fleet') >= 0) return 'type /fleet to see who else is outside the membrane';
    if (trail.depth <= 2 && unseenPanels.indexOf('scan') >= 0) return 'type /scan to see the full sort pipeline';
    if (unseenPanels.indexOf('genome') >= 0) return 'type /genome to look up at the biology';
    if (unseenPanels.indexOf('sieve') >= 0) return 'type /sieve to see the π-sieve at work';
    if (unseenPanels.indexOf('memory') >= 0) return 'type /memory to see the chipmunk\'s cross-cycle memory';
    return null;
  }

  // ═══ TRAIL VISUALIZATION ═══
  // Draw the human's path on the membrane SVG

  function renderTrail(svg, cx, cy, R) {
    // Remove old trail
    var old = svg.querySelector('#explorer-trail');
    if (old) old.parentNode.removeChild(old);

    var trailG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    trailG.setAttribute('id', 'explorer-trail');

    // Draw path through recent steps
    var recent = trail.steps.slice(-30);
    if (recent.length < 2) {
      svg.appendChild(trailG);
      return;
    }

    var points = [];
    recent.forEach(function(s, i) {
      var cat = stepCategory(s);
      var CAT_ANGLE = {
        TOPOLOGY: -PI/2, INVESTIGATION: -PI/2 + PI*0.33,
        MEMBRANE: -PI/2 + PI*0.67, IMMUNE: -PI/2 + PI,
        SIGNAL: -PI/2 + PI*1.33, OTHER: -PI/2 + PI*1.67,
        SCIENCE: -PI/2 + PI*0.5,
      };
      var angle = CAT_ANGLE[cat] || -PI/2;
      // Add jitter so the trail isn't a single line
      angle += (Math.sin(i * 1.7) * 0.15);
      var depth = Math.min(3, Math.floor(i / 10));
      var r = R * (0.65 - depth * 0.1);
      r += Math.cos(i * 2.3) * R * 0.03; // subtle radial jitter
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    });

    // Draw as a smooth path
    if (points.length >= 2) {
      var d = 'M ' + points[0].x.toFixed(1) + ',' + points[0].y.toFixed(1);
      for (var i = 1; i < points.length; i++) {
        var prev = points[i - 1], curr = points[i];
        var cpx = (prev.x + curr.x) / 2;
        var cpy = (prev.y + curr.y) / 2;
        d += ' Q ' + prev.x.toFixed(1) + ',' + prev.y.toFixed(1) + ' ' + cpx.toFixed(1) + ',' + cpy.toFixed(1);
      }

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#fff');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('opacity', '0.15');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');

      // Gradient: older steps fader
      path.setAttribute('stroke-dasharray', '3 2');
      trailG.appendChild(path);
    }

    // Current position: bright dot
    var pos = currentPosition();
    var myX = cx + Math.cos(pos.angle) * (R * pos.r);
    var myY = cy + Math.sin(pos.angle) * (R * pos.r);

    var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', myX.toFixed(1));
    dot.setAttribute('cy', myY.toFixed(1));
    dot.setAttribute('r', (R * 0.012).toFixed(1));
    dot.setAttribute('fill', '#fff');
    dot.setAttribute('opacity', '0.9');
    trailG.appendChild(dot);

    // Pulse ring around current position
    var ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', myX.toFixed(1));
    ring.setAttribute('cy', myY.toFixed(1));
    ring.setAttribute('r', (R * 0.02).toFixed(1));
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', '#fff');
    ring.setAttribute('stroke-width', '1');
    ring.setAttribute('opacity', '0.4');
    var anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    anim.setAttribute('attributeName', 'r');
    anim.setAttribute('values', (R * 0.018).toFixed(1) + ';' + (R * 0.04).toFixed(1) + ';' + (R * 0.018).toFixed(1));
    anim.setAttribute('dur', '3s');
    anim.setAttribute('repeatCount', 'indefinite');
    ring.appendChild(anim);
    trailG.appendChild(ring);

    // Depth label
    var DEPTH_NAMES = ['surface', 'π', 'π²', 'π³'];
    var lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', myX.toFixed(1));
    lbl.setAttribute('y', (myY - R * 0.03).toFixed(1));
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('fill', '#fff');
    lbl.setAttribute('font-size', (R * 0.016) + 'px');
    lbl.setAttribute('font-family', 'monospace');
    lbl.setAttribute('opacity', '0.6');
    lbl.textContent = '↓ you · ' + DEPTH_NAMES[pos.depth] + ' · ' + trail.steps.length + ' steps';
    trailG.appendChild(lbl);

    svg.appendChild(trailG);
  }

  // ═══ TRAIL SUMMARY — /trail command ═══

  function trailSummary() {
    var DEPTH_NAMES = ['surface (visitor)', 'π (reader)', 'π² (investigator)', 'π³ (explorer)'];
    var pos = currentPosition();
    var u = unseen();
    var age = trail.born ? Math.round((Date.now() - trail.born) / 60000) : 0;
    var lines = [];

    lines.push('<b>your trail through the membrane</b>');
    lines.push('id: <span class="dim">' + trail.id + '</span> · ' + trail.visits + ' visits · ' + age + ' min');
    lines.push('depth: <span class="good">' + DEPTH_NAMES[trail.depth] + '</span> · ' + trail.steps.length + ' steps');
    lines.push('position: ' + pos.category + ' at r=' + pos.r.toFixed(2));
    lines.push('');

    // What you've seen
    var panelNames = Object.keys(trail.seen);
    if (panelNames.length) {
      lines.push('<span style="color:#3fb950">seen:</span> ' + panelNames.map(function(p) {
        return p + '×' + trail.seen[p];
      }).join(' · '));
    }

    var entCount = Object.keys(trail.entities).length;
    if (entCount) lines.push('entities explored: <span class="num">' + entCount + '</span>');
    var braidN = Object.keys(trail.braids).length;
    if (braidN) lines.push('braids followed: <span class="num">' + braidN + '</span>');

    // What you haven't seen
    if (u.panels.length) {
      lines.push('');
      lines.push('<span style="color:#f0883e">unexplored:</span> ' + u.panels.join(', '));
    }
    if (u.suggestion) {
      lines.push('');
      lines.push('<span class="dim">→ ' + u.suggestion + '</span>');
    }

    // Epitope if declared
    if (trail.epitope) {
      lines.push('');
      lines.push('epitope: <span class="good">' + trail.epitope + '</span>');
    }

    return lines.join('\n');
  }

  // ═══ HOOKS — connect to chipmunk events ═══

  // Track when visit count increments (returning human)
  if (trail.lastVisit && (Date.now() - trail.lastVisit) > 300000) {
    trail.visits++;
  }
  trail.lastVisit = Date.now();
  saveTrail();

  // ═══ EXPORT ═══

  window._chipmunkExplorer = {
    step: step,
    trail: trail,
    position: currentPosition,
    unseen: unseen,
    summary: trailSummary,
    renderTrail: renderTrail,
    setEpitope: function(name) { trail.epitope = name; saveTrail(); },
    depth: function() { return trail.depth; },
    stepCount: function() { return trail.steps.length; },
    id: function() { return trail.id; },
  };
})();
