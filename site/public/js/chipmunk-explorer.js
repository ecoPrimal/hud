// chipmunk-explorer.js — the pager
// Inside tuebor. Outside squirrel. Below the humans' feet.
// Each human's trail persists in localStorage — the chipmunk sees footprints,
// the human sees where they've been, and the membrane remembers passage.
(function() {
  'use strict';
  var STORE_KEY = 'chipmunk-trail-v2';
  var MAX_STEPS = 500;
  var PI = Math.PI;
  var NS = 'http://www.w3.org/2000/svg';

  var CAT_ANGLE = {
    TOPOLOGY: -PI/2,              INVESTIGATION: -PI/2 + PI*0.33,
    MEMBRANE: -PI/2 + PI*0.67,    IMMUNE: -PI/2 + PI,
    SIGNAL: -PI/2 + PI*1.33,      OTHER: -PI/2 + PI*1.67,
    SCIENCE: -PI/2 + PI*0.5,
  };
  var CAT_COLOR = {
    TOPOLOGY: '#58a6ff', INVESTIGATION: '#e85d3a', MEMBRANE: '#3fb950',
    IMMUNE: '#f0e68c', SIGNAL: '#f0883e', OTHER: '#8b949e', SCIENCE: '#bc8cff',
  };

  // ═══ TRAIL PERSISTENCE ═══

  var trail = loadTrail();
  var _listeners = [];   // step listeners: function(step, trail)
  var _discoveries = []; // categories discovered THIS session

  function loadTrail() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var t = JSON.parse(raw);
        if (t && t.steps && t.id) {
          // Migrate from v1 if needed
          if (!t.categories) t.categories = {};
          if (!t.growth) t.growth = 0;
          if (!t.branches) t.branches = {};
          if (!t.milestones) t.milestones = [];
          if (!t.pastVisits) t.pastVisits = [];
          return t;
        }
      }
    } catch(e) {}
    // Also try v1
    try {
      var v1 = localStorage.getItem('chipmunk-trail-v1');
      if (v1) {
        var t1 = JSON.parse(v1);
        if (t1 && t1.steps && t1.id) {
          t1.categories = {};
          t1.growth = t1.steps.length * 0.01;
          t1.branches = {};
          t1.milestones = [];
          t1.pastVisits = [];
          return t1;
        }
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
      seen: {},          // { panelName: count }
      entities: {},      // { entityId: firstSeen }
      braids: {},        // { braidKey: count }
      commands: {},      // { commandName: count }
      categories: {},    // { CATEGORY: { first: ts, count: n, lastStep: i } }
      growth: 0,         // continuous depth: grows with every step, never caps
      branches: {},      // { CATEGORY: [step indices] } — per-category tendrils
      milestones: [],    // [{ t, kind, detail }] — discoveries, firsts, crossings
      pastVisits: [],    // [{ start, end, steps, depth }] — ghost trails from prior visits
      visits: 1,
      lastVisit: Date.now(),
    };
  }

  function save() {
    try {
      if (trail.steps.length > MAX_STEPS) {
        trail.steps = trail.steps.slice(-MAX_STEPS);
      }
      localStorage.setItem(STORE_KEY, JSON.stringify(trail));
    } catch(e) {}
  }

  // ═══ STEP — every action deepens the trail ═══

  function step(kind, detail) {
    var cat = classify(kind, detail);
    var isFirst = !trail.categories[cat];
    var s = { t: Date.now(), k: kind, d: detail, c: cat, i: trail.steps.length };
    trail.steps.push(s);

    // Aggregates
    if (kind === 'panel')   trail.seen[detail] = (trail.seen[detail] || 0) + 1;
    if (kind === 'entity')  { if (!trail.entities[detail]) trail.entities[detail] = Date.now(); }
    if (kind === 'braid')   trail.braids[detail] = (trail.braids[detail] || 0) + 1;
    if (kind === 'command') trail.commands[detail] = (trail.commands[detail] || 0) + 1;

    // Category tracking
    if (!trail.categories[cat]) {
      trail.categories[cat] = { first: Date.now(), count: 0, lastStep: s.i };
    }
    trail.categories[cat].count++;
    trail.categories[cat].lastStep = s.i;

    // Branch tracking — each category accumulates its own tendril
    if (!trail.branches[cat]) trail.branches[cat] = [];
    trail.branches[cat].push(s.i);

    // Growth — continuous, never caps. Diminishing returns per step.
    var prevGrowth = trail.growth;
    var stepGrowth = 1 / (1 + trail.growth * 0.5); // diminishing
    // Momentum bonus: faster exploration = slightly more growth
    var momBonus = 1 + momentum() * 0.3;
    trail.growth += stepGrowth * 0.1 * momBonus;
    s._prevGrowth = prevGrowth; // for milestone threshold detection

    // Double-back detection
    var db = detectDoubleBack(cat);
    if (db && db.gap > 10) {
      trail.milestones.push({ t: Date.now(), kind: 'double-back', detail: cat + ' (gap ' + db.gap + ')' });
    }

    // Discovery events
    if (isFirst) {
      _discoveries.push(cat);
      trail.milestones.push({ t: Date.now(), kind: 'discovery', detail: cat });
      notifyDiscovery(cat);
    }

    // Milestone checks
    checkMilestones(s);

    save();

    // Notify listeners (metabolism, etc.)
    _listeners.forEach(function(fn) { try { fn(s, trail); } catch(e) {} });

    // Metabolism nudge: exploration is energy
    if (window._chipmunkCore && window._chipmunkCore._metab) {
      // Deeper growth = stronger nudge, but diminishing
      var nudge = 0.002 + trail.growth * 0.001;
      if (nudge > 0.01) nudge = 0.01;
      window._chipmunkCore._metab.addSpringV(nudge);
    }
  }

  function classify(kind, detail) {
    var d = (detail || '').toLowerCase();
    if (d.indexOf('fleet') >= 0 || d.indexOf('scan') >= 0 || d.indexOf('sieve') >= 0) return 'INVESTIGATION';
    if (d.indexOf('genome') >= 0 || d.indexOf('immune') >= 0 || d.indexOf('tuebor') >= 0) return 'IMMUNE';
    if (d.indexOf('membrane') >= 0 || d.indexOf('observe') >= 0 || d.indexOf('energy') >= 0) return 'MEMBRANE';
    if (d.indexOf('explore') >= 0 || d.indexOf('braid') >= 0) return 'INVESTIGATION';
    if (d.indexOf('topology') >= 0 || d.indexOf('topo') >= 0) return 'TOPOLOGY';
    if (d.indexOf('signal') >= 0 || d.indexOf('sing') >= 0) return 'SIGNAL';
    if (d.indexOf('sort') >= 0 || d.indexOf('pollen') >= 0) return 'MEMBRANE';
    if (d.indexOf('memory') >= 0 || d.indexOf('rest') >= 0 || d.indexOf('sleep') >= 0) return 'SCIENCE';
    return 'OTHER';
  }

  function notifyDiscovery(cat) {
    // Tell the chipmunk log about the discovery — if addEntry is available
    setTimeout(function() {
      var core = window._chipmunkCore;
      if (!core || !core.addEntry) return;
      var catCount = Object.keys(trail.categories).length;
      var color = CAT_COLOR[cat] || '#8b949e';
      if (catCount === 1) {
        core.addEntry('chipmunk', '<span style="color:' + color + '">\u25cf</span> first step into <b>' + cat + '</b>. the pager begins.');
      } else if (catCount === 3) {
        core.addEntry('chipmunk', '<span style="color:' + color + '">\u25cf</span> three branches now. the trail is growing roots.');
      } else if (catCount === 5) {
        core.addEntry('chipmunk', '<span style="color:' + color + '">\u25cf</span> five categories. you are seeing the whole membrane.');
      } else {
        core.addEntry('chipmunk', '<span style="color:' + color + '">\u25cf</span> new branch: <b>' + cat + '</b>. ' + catCount + ' categories explored.');
      }
    }, 500);
  }

  function checkMilestones(s) {
    var n = trail.steps.length;
    // Step count milestones
    if (n === 10 || n === 50 || n === 100 || n === 200 || n === 500) {
      trail.milestones.push({ t: Date.now(), kind: 'steps', detail: n });
    }
    // Entity milestones
    var entCount = Object.keys(trail.entities).length;
    if (entCount === 1 || entCount === 10 || entCount === 25 || entCount === 50) {
      var last = trail.milestones[trail.milestones.length - 1];
      if (!last || last.kind !== 'entities' || last.detail !== entCount) {
        trail.milestones.push({ t: Date.now(), kind: 'entities', detail: entCount });
      }
    }
    // Growth depth milestones (π thresholds)
    var piDepths = [1, PI, PI * 2, PI * PI, PI * PI * PI / 3];
    var piLabels = ['1', 'π', '2π', 'π²', 'π³/3'];
    for (var gi = 0; gi < piDepths.length; gi++) {
      if (trail.growth >= piDepths[gi] && trail.growth - s._prevGrowth < piDepths[gi]) {
        trail.milestones.push({ t: Date.now(), kind: 'depth', detail: piLabels[gi] });
        notifyDepth(piLabels[gi]);
        break;
      }
    }
    // Branch diversity milestone
    var catCount = Object.keys(trail.categories).length;
    if (catCount === 7) {
      var prev = trail.milestones.filter(function(m) { return m.kind === 'all-cats'; });
      if (!prev.length) {
        trail.milestones.push({ t: Date.now(), kind: 'all-cats', detail: 'all categories explored' });
      }
    }
  }

  function notifyDepth(label) {
    setTimeout(function() {
      var core = window._chipmunkCore;
      if (!core || !core.addEntry) return;
      core.addEntry('chipmunk', '<span style="color:#e85d3a">↓ depth ' + label + '</span> — ' +
        'you are deep inside tuebor now. growth=' + trail.growth.toFixed(2));
    }, 700);
  }

  // ═══ MOMENTUM — how fast you're exploring right now ═══
  function momentum() {
    var recent = trail.steps.slice(-10);
    if (recent.length < 2) return 0;
    var dt = (recent[recent.length - 1].t - recent[0].t) / 1000;
    if (dt <= 0) return 1;
    var stepsPerSec = recent.length / dt;
    return Math.min(1, stepsPerSec * 5);
  }

  // ═══ DOUBLE-BACK — detect when you return to a previously explored category ═══
  function detectDoubleBack(cat) {
    if (!trail.categories[cat]) return null;
    var catSteps = trail.branches[cat] || [];
    if (catSteps.length < 3) return null;
    var lastIdx = trail.steps.length - 1;
    var prevVisit = catSteps[catSteps.length - 2];
    if (lastIdx - prevVisit > 5) {
      return { from: prevVisit, to: lastIdx, gap: lastIdx - prevVisit };
    }
    return null;
  }

  // ═══ POSITION ═══
  // Inside tuebor (R*0.65), below feet (R*0.48).
  // Depth maps growth to radius: 0.42 → approaches 0.12 asymptotically.

  function currentPosition() {
    var recent = trail.steps.slice(-10);
    if (!recent.length) return { angle: -PI/2, r: 0.42, growth: 0, category: 'none' };

    var categoryHits = {};
    recent.forEach(function(s) {
      var cat = s.c || classify(s.k, s.d);
      categoryHits[cat] = (categoryHits[cat] || 0) + 1;
    });

    var bestCat = 'OTHER', bestN = 0;
    Object.keys(categoryHits).forEach(function(c) {
      if (categoryHits[c] > bestN) { bestCat = c; bestN = categoryHits[c]; }
    });

    var angle = CAT_ANGLE[bestCat] || -PI/2;

    // Continuous depth: asymptotic approach to 0.12 (near chipmunk but never touching)
    // r = 0.42 * e^(-growth*0.3) + 0.12
    var r = 0.30 * Math.exp(-trail.growth * 0.3) + 0.12;

    return { angle: angle, r: r, growth: trail.growth, category: bestCat };
  }

  // ═══ UNSEEN ═══

  var ALL_PANELS = ['observe', 'fleet', 'genome', 'explore', 'scan', 'sieve', 'memory', 'energy', 'trail'];
  var ALL_CATS = ['TOPOLOGY', 'INVESTIGATION', 'MEMBRANE', 'IMMUNE', 'SIGNAL', 'SCIENCE', 'OTHER'];

  function unseen() {
    var unseenPanels = ALL_PANELS.filter(function(p) { return !trail.seen[p]; });
    var unseenCats = ALL_CATS.filter(function(c) { return !trail.categories[c]; });

    return {
      panels: unseenPanels,
      categories: unseenCats,
      entityCount: Object.keys(trail.entities).length,
      braidCount: Object.keys(trail.braids).length,
      growth: trail.growth,
      suggestion: suggest(unseenPanels, unseenCats),
    };
  }

  function suggest(unseenPanels, unseenCats) {
    if (trail.steps.length === 0) return 'try typing something — the chipmunk is listening';
    if (unseenCats.length >= 5 && unseenPanels.indexOf('observe') >= 0) return 'type /observe to see what the chipmunk sees';
    if (unseenCats.indexOf('INVESTIGATION') >= 0 && unseenPanels.indexOf('explore') >= 0) return '/explore — follow the investigation paths';
    if (unseenCats.indexOf('INVESTIGATION') >= 0 && unseenPanels.indexOf('fleet') >= 0) return '/fleet — who else is outside the membrane?';
    if (unseenCats.indexOf('IMMUNE') >= 0 && unseenPanels.indexOf('genome') >= 0) return '/genome — look up at the biology';
    if (unseenPanels.indexOf('scan') >= 0) return '/scan — the full sort pipeline';
    if (unseenPanels.indexOf('sieve') >= 0) return '/sieve — the π-sieve at work';
    if (unseenCats.indexOf('SIGNAL') >= 0) return '/sing — make sound, reach outward';
    if (unseenPanels.indexOf('memory') >= 0) return '/memory — the chipmunk\'s cross-cycle memory';
    // For experienced explorers
    if (trail.growth > 2) return 'try exploring an entity — click a name in /explore';
    if (trail.growth > 3) return 'your trail is deep. try /note to leave a message for the chipmunk';
    return null;
  }

  // ═══ TRAIL VISUALIZATION ═══
  // Inside tuebor, below feet. Branches grow per category.

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, '' + attrs[k]);
    return e;
  }

  function renderTrail(svg, cx, cy, R) {
    var old = svg.querySelector('#explorer-trail');
    if (old) old.parentNode.removeChild(old);

    var g = el('g', { id: 'explorer-trail' });
    var pos = currentPosition();

    // ── Ghost trails from past visits ──
    if (trail.pastVisits && trail.pastVisits.length > 0) {
      trail.pastVisits.slice(-3).forEach(function(pv, vi) {
        var ghostOp = 0.04 + vi * 0.02;
        var ghostR = R * (0.42 - vi * 0.02);
        var gc = el('circle', {
          cx: cx, cy: cy, r: ghostR,
          fill: 'none', stroke: '#e85d3a',
          'stroke-width': 0.3, 'stroke-dasharray': '1 4',
          opacity: ghostOp,
        });
        g.appendChild(gc);
      });
    }

    // ── Growth rings — one per visit, radiating inward from 0.42 ──
    var maxRings = Math.min(trail.visits, 7);
    for (var ri = 0; ri < maxRings; ri++) {
      var ringR = R * (0.42 - ri * 0.025);
      if (ringR < R * 0.12) break;
      var ringEl = el('circle', {
        cx: cx, cy: cy, r: ringR,
        fill: 'none', stroke: '#e85d3a',
        'stroke-width': 0.2, 'stroke-dasharray': '0.5 6',
        opacity: 0.06 + ri * 0.01,
      });
      g.appendChild(ringEl);
    }

    // ── Category branches — tendrils radiating from center toward each explored category ──
    var catKeys = Object.keys(trail.categories);
    catKeys.forEach(function(cat) {
      var catInfo = trail.categories[cat];
      var angle = CAT_ANGLE[cat];
      if (angle === undefined) return;
      var color = CAT_COLOR[cat] || '#8b949e';

      // Branch length grows with category step count (diminishing)
      var branchGrowth = 1 - Math.exp(-catInfo.count * 0.1);
      var innerR = R * pos.r;       // current depth
      var outerR = innerR + R * 0.15 * branchGrowth; // grows toward feet
      if (outerR > R * 0.44) outerR = R * 0.44; // never cross above tuebor zone

      // Draw branch line
      var x1 = cx + Math.cos(angle) * innerR;
      var y1 = cy + Math.sin(angle) * innerR;
      var x2 = cx + Math.cos(angle) * outerR;
      var y2 = cy + Math.sin(angle) * outerR;

      var branch = el('line', {
        x1: x1.toFixed(1), y1: y1.toFixed(1),
        x2: x2.toFixed(1), y2: y2.toFixed(1),
        stroke: color, 'stroke-width': 0.6 + branchGrowth * 0.8,
        opacity: 0.15 + branchGrowth * 0.15,
        'stroke-linecap': 'round',
      });
      g.appendChild(branch);

      // Branch tip dot — size grows with exploration
      var tipR = R * (0.004 + branchGrowth * 0.005);
      var tip = el('circle', {
        cx: x2.toFixed(1), cy: y2.toFixed(1), r: tipR.toFixed(1),
        fill: color, opacity: (0.3 + branchGrowth * 0.4).toFixed(2),
      });
      g.appendChild(tip);

      // Category label at branch tip (only for well-explored branches)
      if (catInfo.count >= 3) {
        var lblR = outerR + R * 0.015;
        var lx = cx + Math.cos(angle) * lblR;
        var ly = cy + Math.sin(angle) * lblR;
        var lbl = el('text', {
          x: lx.toFixed(1), y: ly.toFixed(1),
          'text-anchor': 'middle', fill: color,
          'font-size': (R * 0.01) + 'px', 'font-family': 'monospace',
          opacity: (0.2 + branchGrowth * 0.2).toFixed(2),
        });
        lbl.textContent = cat.toLowerCase() + ' ×' + catInfo.count;
        g.appendChild(lbl);
      }
    });

    // ── Trail path through recent steps ──
    var recent = trail.steps.slice(-40);
    if (recent.length >= 2) {
      var points = [];
      recent.forEach(function(s, i) {
        var cat = s.c || classify(s.k, s.d);
        var angle = CAT_ANGLE[cat] || -PI/2;
        angle += Math.sin(i * 1.7 + trail.growth) * 0.12;
        // Depth progression within the trail
        var progress = i / recent.length;
        var stepR = R * (0.42 - progress * (0.42 - pos.r));
        stepR += Math.cos(i * 2.3) * R * 0.015;
        points.push({
          x: cx + Math.cos(angle) * stepR,
          y: cy + Math.sin(angle) * stepR,
          cat: cat,
        });
      });

      // Smooth path
      var d = 'M ' + points[0].x.toFixed(1) + ',' + points[0].y.toFixed(1);
      for (var pi = 1; pi < points.length; pi++) {
        var prev = points[pi - 1], curr = points[pi];
        var cpx = (prev.x + curr.x) / 2, cpy = (prev.y + curr.y) / 2;
        d += ' Q ' + prev.x.toFixed(1) + ',' + prev.y.toFixed(1) + ' ' + cpx.toFixed(1) + ',' + cpy.toFixed(1);
      }

      var path = el('path', {
        d: d, fill: 'none', stroke: '#e85d3a',
        'stroke-width': 0.8, opacity: 0.1,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        'stroke-dasharray': '2 3',
      });
      g.appendChild(path);

      // Step nodes — every 5th step gets a tiny dot
      for (var ni = 0; ni < points.length; ni += 5) {
        var p = points[ni];
        var color = CAT_COLOR[p.cat] || '#8b949e';
        var nodeAge = (recent.length - ni) / recent.length; // 1=oldest, 0=newest
        var nodeEl = el('circle', {
          cx: p.x.toFixed(1), cy: p.y.toFixed(1),
          r: (R * (0.002 + (1 - nodeAge) * 0.003)).toFixed(1),
          fill: color, opacity: (0.1 + (1 - nodeAge) * 0.3).toFixed(2),
        });
        g.appendChild(nodeEl);
      }
    }

    // ── Milestone markers ──
    var recentMilestones = trail.milestones.slice(-5);
    recentMilestones.forEach(function(m, mi) {
      // Place milestones along the growth spiral
      var mAngle = -PI/2 + mi * PI * 0.4;
      var mR = R * (pos.r + 0.03);
      var mx = cx + Math.cos(mAngle) * mR;
      var my = cy + Math.sin(mAngle) * mR;
      var mDot = el('circle', {
        cx: mx.toFixed(1), cy: my.toFixed(1), r: (R * 0.004).toFixed(1),
        fill: '#f0e68c', opacity: '0.4',
      });
      g.appendChild(mDot);
    });

    // ── π-depth rings — visible thresholds inside tuebor ──
    var piThresholds = [
      { growth: 1,       label: '1',     r: 0.30 * Math.exp(-1 * 0.3) + 0.12 },
      { growth: PI,      label: 'π',     r: 0.30 * Math.exp(-PI * 0.3) + 0.12 },
      { growth: PI * 2,  label: '2π',    r: 0.30 * Math.exp(-PI * 2 * 0.3) + 0.12 },
      { growth: PI * PI, label: 'π²',    r: 0.30 * Math.exp(-PI * PI * 0.3) + 0.12 },
    ];
    piThresholds.forEach(function(th) {
      if (trail.growth < th.growth * 0.5) return; // only show if near or past
      var thR = R * th.r;
      var passed = trail.growth >= th.growth;
      var ring = el('circle', {
        cx: cx, cy: cy, r: thR.toFixed(1),
        fill: 'none', stroke: passed ? '#e85d3a' : '#484f58',
        'stroke-width': passed ? 0.4 : 0.2,
        'stroke-dasharray': passed ? '1.5 3' : '0.5 5',
        opacity: passed ? 0.12 : 0.06,
      });
      g.appendChild(ring);
      // Label
      var lAngle = -PI * 0.15; // fixed position: upper right
      var lx = cx + Math.cos(lAngle) * (thR + R * 0.008);
      var ly = cy + Math.sin(lAngle) * (thR + R * 0.008);
      var depthLbl = el('text', {
        x: lx.toFixed(1), y: ly.toFixed(1),
        'text-anchor': 'start', fill: passed ? '#e85d3a' : '#484f58',
        'font-size': (R * 0.008) + 'px', 'font-family': 'monospace',
        opacity: passed ? 0.2 : 0.08,
      });
      depthLbl.textContent = th.label;
      g.appendChild(depthLbl);
    });

    // ── Momentum indicator — halo around position when moving fast ──
    var mom = momentum();
    if (mom > 0.3) {
      var momR = R * (0.02 + mom * 0.01);
      var momHalo = el('circle', {
        cx: (cx + Math.cos(pos.angle) * R * pos.r).toFixed(1),
        cy: (cy + Math.sin(pos.angle) * R * pos.r).toFixed(1),
        r: momR.toFixed(1),
        fill: 'none', stroke: '#f0e68c',
        'stroke-width': (0.3 + mom * 0.5).toFixed(1),
        opacity: (0.05 + mom * 0.1).toFixed(2),
      });
      var momAnim = el('animate', {
        attributeName: 'opacity',
        values: (0.05 + mom * 0.1).toFixed(2) + ';' + (0.02).toFixed(2) + ';' + (0.05 + mom * 0.1).toFixed(2),
        dur: (1 + (1 - mom) * 2) + 's',
        repeatCount: 'indefinite',
      });
      momHalo.appendChild(momAnim);
      g.appendChild(momHalo);
    }

    // ── Current position dot ──
    var myX = cx + Math.cos(pos.angle) * (R * pos.r);
    var myY = cy + Math.sin(pos.angle) * (R * pos.r);

    var dot = el('circle', {
      cx: myX.toFixed(1), cy: myY.toFixed(1),
      r: (R * (0.007 + trail.growth * 0.001)).toFixed(1), // grows with depth
      fill: '#e85d3a', opacity: '0.7',
    });
    g.appendChild(dot);

    // Pulse
    var pulse = el('circle', {
      cx: myX.toFixed(1), cy: myY.toFixed(1),
      r: (R * 0.014).toFixed(1),
      fill: 'none', stroke: '#e85d3a',
      'stroke-width': 0.5, opacity: '0.2',
    });
    var anim = el('animate', {
      attributeName: 'r',
      values: (R * 0.012).toFixed(1) + ';' + (R * 0.025).toFixed(1) + ';' + (R * 0.012).toFixed(1),
      dur: (3 + trail.growth * 0.5) + 's', // slower pulse as you go deeper
      repeatCount: 'indefinite',
    });
    pulse.appendChild(anim);
    g.appendChild(pulse);

    // Depth label
    var depthLabel = trail.growth < 0.5 ? 'surface' :
                     trail.growth < 1.5 ? '\u03c0 \u00b7 reading' :
                     trail.growth < 3.0 ? '\u03c0\u00b2 \u00b7 investigating' :
                     trail.growth < 5.0 ? '\u03c0\u00b3 \u00b7 exploring' :
                                          '\u03c0\u2074 \u00b7 deep';
    var lbl = el('text', {
      x: myX.toFixed(1), y: (myY + R * 0.022).toFixed(1),
      'text-anchor': 'middle', fill: '#e85d3a',
      'font-size': (R * 0.012) + 'px', 'font-family': 'monospace',
      opacity: '0.3',
    });
    lbl.textContent = depthLabel + ' \u00b7 ' + trail.steps.length;
    g.appendChild(lbl);

    svg.appendChild(g);
  }

  // ═══ COLLECTIVE TRAILS — other humans' passages rendered inside tuebor ═══

  function renderCollective(svg, cx, cy, R, presenceData) {
    var old = svg.querySelector('#collective-trails');
    if (old) old.parentNode.removeChild(old);
    if (!presenceData || !presenceData.passages) return;

    var g = el('g', { id: 'collective-trails' });

    presenceData.passages.forEach(function(p) {
      if (!p.humans || p.humans < 1) return;
      var a1 = CAT_ANGLE[p.from], a2 = CAT_ANGLE[p.to];
      if (a1 === undefined || a2 === undefined) return;

      // Collective trails sit at R*0.38 — just below the individual pager
      var arcR = R * 0.38;
      var x1 = cx + Math.cos(a1) * arcR, y1 = cy + Math.sin(a1) * arcR;
      var x2 = cx + Math.cos(a2) * arcR, y2 = cy + Math.sin(a2) * arcR;
      var midA = (a1 + a2) / 2;
      var midR = arcR * 0.7;
      var mx = cx + Math.cos(midA) * midR;
      var my = cy + Math.sin(midA) * midR;

      var color1 = CAT_COLOR[p.from] || '#484f58';
      var strength = Math.min(p.humans / 20, 1);

      var arc = el('path', {
        d: 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1),
        fill: 'none', stroke: color1,
        'stroke-width': (0.3 + strength * 1.2).toFixed(1),
        opacity: (0.04 + strength * 0.08).toFixed(2),
        'stroke-linecap': 'round',
      });
      g.appendChild(arc);

      // Flow dot along the arc
      if (p.humans >= 3) {
        var flowDot = el('circle', {
          r: (R * 0.003).toFixed(1),
          fill: color1, opacity: (0.2 + strength * 0.3).toFixed(2),
        });
        var motion = el('animateMotion', {
          dur: (6 + Math.random() * 6) + 's',
          repeatCount: 'indefinite',
          path: 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1),
        });
        flowDot.appendChild(motion);
        g.appendChild(flowDot);
      }

      // Count label for busy passages
      if (p.humans >= 5) {
        var countLbl = el('text', {
          x: mx.toFixed(1), y: (my + R * 0.008).toFixed(1),
          'text-anchor': 'middle', fill: color1,
          'font-size': (R * 0.008) + 'px', 'font-family': 'monospace',
          opacity: '0.15',
        });
        countLbl.textContent = p.humans;
        g.appendChild(countLbl);
      }
    });

    // ── Resonance sparks — where individual trail crosses collective passages ──
    var pos = currentPosition();
    var myCat = pos.category;
    presenceData.passages.forEach(function(p) {
      if (p.from !== myCat && p.to !== myCat) return;
      if (p.humans < 2) return;
      var sparkAngle = CAT_ANGLE[myCat];
      if (sparkAngle === undefined) return;
      var sparkR = R * 0.40; // between individual (0.42) and collective (0.38)
      var sx = cx + Math.cos(sparkAngle) * sparkR;
      var sy = cy + Math.sin(sparkAngle) * sparkR;
      var spark = el('circle', {
        cx: sx.toFixed(1), cy: sy.toFixed(1),
        r: (R * 0.003).toFixed(1),
        fill: '#f0e68c', opacity: '0',
      });
      var sparkAnim = el('animate', {
        attributeName: 'opacity',
        values: '0;0.5;0', dur: '2s', repeatCount: 'indefinite',
        begin: (Math.random() * 3).toFixed(1) + 's',
      });
      spark.appendChild(sparkAnim);
      g.appendChild(spark);
    });

    // Insert BEFORE the individual trail so collective is behind
    var indiv = svg.querySelector('#explorer-trail');
    if (indiv) {
      svg.insertBefore(g, indiv);
    } else {
      svg.appendChild(g);
    }
  }

  // ═══ TRAIL SUMMARY — /trail command ═══

  function trailSummary() {
    var pos = currentPosition();
    var u = unseen();
    var age = trail.born ? Math.round((Date.now() - trail.born) / 60000) : 0;
    var lines = [];

    var depthLabel = trail.growth < 0.5 ? 'surface' :
                     trail.growth < 1.5 ? '\u03c0 (reading)' :
                     trail.growth < 3.0 ? '\u03c0\u00b2 (investigating)' :
                     trail.growth < 5.0 ? '\u03c0\u00b3 (exploring)' :
                                          '\u03c0\u2074 (deep)';

    lines.push('<b>your pager — inside tuebor, below your feet</b>');
    lines.push('id: <span class="dim">' + trail.id + '</span> · ' + trail.visits + ' visits · ' + age + ' min');
    lines.push('growth: <span style="color:#e85d3a">' + trail.growth.toFixed(2) + '</span> → ' + depthLabel + ' · ' + trail.steps.length + ' steps');
    var mom = momentum();
    lines.push('facing: ' + pos.category + ' at r=' + pos.r.toFixed(3) + (mom > 0.2 ? ' · momentum <span style="color:#f0e68c">' + (mom * 100).toFixed(0) + '%</span>' : ''));
    lines.push('');

    // Branches
    var catKeys = Object.keys(trail.categories);
    if (catKeys.length) {
      lines.push('<span style="color:#e85d3a">branches:</span>');
      catKeys.forEach(function(cat) {
        var info = trail.categories[cat];
        var color = CAT_COLOR[cat] || '#8b949e';
        var age2 = Math.round((Date.now() - info.first) / 60000);
        lines.push('  <span style="color:' + color + '">\u25cf</span> ' + cat.toLowerCase() + ' · ' +
          info.count + ' steps · first ' + age2 + ' min ago');
      });
    }
    lines.push('');

    // What you've seen
    var panelNames = Object.keys(trail.seen);
    if (panelNames.length) {
      lines.push('<span style="color:#3fb950">seen:</span> ' + panelNames.map(function(p) {
        return p + '\u00d7' + trail.seen[p];
      }).join(' \u00b7 '));
    }

    var entCount = Object.keys(trail.entities).length;
    if (entCount) lines.push('entities: <span class="num">' + entCount + '</span>');
    var braidN = Object.keys(trail.braids).length;
    if (braidN) lines.push('braids: <span class="num">' + braidN + '</span>');

    // Milestones
    if (trail.milestones.length) {
      lines.push('');
      lines.push('<span style="color:#f0e68c">milestones:</span>');
      trail.milestones.slice(-5).forEach(function(m) {
        var mAge = Math.round((Date.now() - m.t) / 60000);
        lines.push('  \u2726 ' + m.kind + ': ' + m.detail + ' (' + mAge + ' min ago)');
      });
    }

    // Unseen
    if (u.categories.length) {
      lines.push('');
      lines.push('<span style="color:#f0883e">unexplored:</span> ' + u.categories.map(function(c) {
        return '<span style="color:' + (CAT_COLOR[c] || '#8b949e') + '">' + c.toLowerCase() + '</span>';
      }).join(', '));
    }
    if (u.suggestion) {
      lines.push('');
      lines.push('<span class="dim">\u2192 ' + u.suggestion + '</span>');
    }

    // Epitope
    if (trail.epitope) {
      lines.push('');
      lines.push('epitope: <span class="good">' + trail.epitope + '</span>');
    }

    // Past visits
    if (trail.pastVisits && trail.pastVisits.length) {
      lines.push('');
      lines.push('<span class="dim">' + trail.pastVisits.length + ' past visits — ghost trails visible on membrane</span>');
    }

    return lines.join('\n');
  }

  // ═══ VISIT TRACKING ═══

  if (trail.lastVisit && (Date.now() - trail.lastVisit) > 300000) {
    // Archive the previous visit as a ghost trail
    if (trail.steps.length > 5) {
      trail.pastVisits.push({
        start: trail.lastVisit,
        end: Date.now(),
        steps: trail.steps.length,
        growth: trail.growth,
        categories: Object.keys(trail.categories).length,
      });
      // Keep only last 10 ghost visits
      if (trail.pastVisits.length > 10) trail.pastVisits = trail.pastVisits.slice(-10);
    }
    trail.visits++;
  }
  trail.lastVisit = Date.now();
  save();

  // ═══ EXPORT ═══

  window._chipmunkExplorer = {
    step: step,
    trail: trail,
    position: currentPosition,
    unseen: unseen,
    summary: trailSummary,
    renderTrail: renderTrail,
    renderCollective: renderCollective,
    setEpitope: function(name) { trail.epitope = name; save(); },
    growth: function() { return trail.growth; },
    stepCount: function() { return trail.steps.length; },
    id: function() { return trail.id; },
    categories: function() { return trail.categories; },
    discoveries: function() { return _discoveries; },
    milestones: function() { return trail.milestones; },
    momentum: momentum,
    doubleBack: detectDoubleBack,
    onStep: function(fn) { _listeners.push(fn); },
  };
})();
