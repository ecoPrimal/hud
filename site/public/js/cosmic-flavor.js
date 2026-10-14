// cosmic-flavor.js — the strangeness axis
// Purple (#a371f7) = strange, new, rare, unknown — UP
// Green  (#3fb950) = base, familiar, common, nearby — DOWN
// Every entity gets a strangeness score 0→1.
// Spin cycles through sort perspectives. Sort arranges by flavor.
// Loaded after cosmic-cards.js, cosmic-strategy.js, before chipmunk-commands.js.
(function() {
  'use strict';

  // ═══ COLOR SPECTRUM ═══
  // green (0) → teal → blue → purple (1)
  var PALETTE = [
    [63,185,80],    // 0.00 — #3fb950 green: base, home, familiar
    [88,166,255],   // 0.33 — #58a6ff blue: known, mapped, charted
    [188,140,255],  // 0.66 — #bc8cff lavender: unusual, noteworthy
    [163,113,247],  // 1.00 — #a371f7 purple: strange, new, rare, unknown
  ];

  function flavorColor(strangeness) {
    var s = Math.max(0, Math.min(1, strangeness));
    var idx = s * (PALETTE.length - 1);
    var lo = Math.floor(idx);
    var hi = Math.min(lo + 1, PALETTE.length - 1);
    var t = idx - lo;
    var r = Math.round(PALETTE[lo][0] + (PALETTE[hi][0] - PALETTE[lo][0]) * t);
    var g = Math.round(PALETTE[lo][1] + (PALETTE[hi][1] - PALETTE[lo][1]) * t);
    var b = Math.round(PALETTE[lo][2] + (PALETTE[hi][2] - PALETTE[lo][2]) * t);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function flavorHex(strangeness) {
    var s = Math.max(0, Math.min(1, strangeness));
    var idx = s * (PALETTE.length - 1);
    var lo = Math.floor(idx);
    var hi = Math.min(lo + 1, PALETTE.length - 1);
    var t = idx - lo;
    var r = Math.round(PALETTE[lo][0] + (PALETTE[hi][0] - PALETTE[lo][0]) * t);
    var g = Math.round(PALETTE[lo][1] + (PALETTE[hi][1] - PALETTE[lo][1]) * t);
    var b = Math.round(PALETTE[lo][2] + (PALETTE[hi][2] - PALETTE[lo][2]) * t);
    return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }

  // ═══ STRANGENESS SCORES ═══

  var RARITY_STRANGENESS = {
    common: 0.1, uncommon: 0.3, rare: 0.55,
    mythic: 0.8, legendary: 0.9, boss: 0.95,
  };

  var TYPE_BASE = {
    epitope: 0.2,   // humans are nearby
    surface: 0.35,  // sites are mapped
    ability: 0.6,   // powers are strange
    fleet: 0.75,    // fleet is alien
    entity: 0.4,    // evidence is halfway
  };

  var CAT_STRANGENESS = {
    MEMBRANE: 0.15,     // home base
    SIGNAL: 0.25,       // sensing — nearby
    INVESTIGATION: 0.4, // digging — moderate
    IMMUNE: 0.5,        // defense — halfway
    SCIENCE: 0.6,       // knowledge — unfamiliar territory
    CREATIVE: 0.85,     // esoteric — very strange
    TOPOLOGY: 0.3,      // structure — mapped
    OTHER: 0.45,
  };

  var ANDERSON_STRANGENESS = {
    sovereign: 0.05, // on our side — very green
    human: 0.1,      // us — green
    chorus: 0.4,     // mass noise — mid
    spectrum: 0.6,   // organized — above mid
    ghost: 0.8,      // hard to see — strange
    stealth: 0.95,   // invisible — very purple
  };

  var SORT_STRANGENESS = {
    self: 0.05,
    partial: 0.45,
    null: 0.65,
    'non-self': 0.9,
  };

  function cardStrangeness(card) {
    if (!card) return 0.5;
    var base = TYPE_BASE[card.type] || 0.5;
    var rarity = RARITY_STRANGENESS[card.rarity] || 0.5;
    var cat = card.cat ? (CAT_STRANGENESS[card.cat] || 0.5) : base;
    var anderson = card.anderson ? (ANDERSON_STRANGENESS[card.anderson] || 0.5) : base;

    if (card.type === 'fleet' && card.anderson) return anderson;
    if (card.type === 'surface') return (cat * 0.6 + rarity * 0.4);
    if (card.type === 'ability') return (0.55 + (card.cost || 1) * 0.1);
    return (base * 0.4 + rarity * 0.6);
  }

  function entityStrangeness(sortClass, confidence) {
    var base = SORT_STRANGENESS[sortClass] || 0.5;
    var conf = confidence || 0.5;
    // low confidence makes things stranger
    return base + (1 - conf) * 0.2;
  }

  function surfaceStrangeness(surfaceKey) {
    var cs = window._cosmicSurfaces;
    if (!cs || !cs.SURFACES) return 0.5;
    var s = cs.SURFACES[surfaceKey];
    if (!s) return 0.5;
    return CAT_STRANGENESS[s.cat] || 0.5;
  }

  // ═══ SPIN — rotate through sort perspectives ═══

  var PERSPECTIVES = [
    { name: 'strangeness', desc: 'purple=strange, green=familiar', fn: function(a, b) { return cardStrangeness(b) - cardStrangeness(a); } },
    { name: 'power',       desc: 'strongest first',                fn: function(a, b) { return (b.power || 0) - (a.power || 0); } },
    { name: 'toughness',   desc: 'toughest first',                 fn: function(a, b) { return (b.toughness || 0) - (a.toughness || 0); } },
    { name: 'type',        desc: 'grouped by type',                fn: function(a, b) { return (a.type || '').localeCompare(b.type || ''); } },
    { name: 'rarity',      desc: 'rarest first',                   fn: function(a, b) { return (RARITY_STRANGENESS[b.rarity]||0) - (RARITY_STRANGENESS[a.rarity]||0); } },
    { name: 'cost',        desc: 'most expensive first',           fn: function(a, b) { return (b.cost || 0) - (a.cost || 0); } },
  ];

  var _perspective = 0;

  function spin() {
    _perspective = (_perspective + 1) % PERSPECTIVES.length;
    return PERSPECTIVES[_perspective];
  }

  function currentPerspective() {
    return PERSPECTIVES[_perspective];
  }

  function setPerspective(name) {
    for (var i = 0; i < PERSPECTIVES.length; i++) {
      if (PERSPECTIVES[i].name === name) { _perspective = i; return PERSPECTIVES[i]; }
    }
    return null;
  }

  // ═══ SORT — arrange cards by current perspective ═══

  function sortCards(cards) {
    var p = PERSPECTIVES[_perspective];
    return cards.slice().sort(p.fn);
  }

  function sortedHandView() {
    var cc = window._cosmicCards;
    if (!cc) return 'card engine not loaded';
    var hand = cc.hand();
    if (hand.length === 0) return 'Hand empty. /draw to pull from live data.';

    var p = PERSPECTIVES[_perspective];
    var sorted = sortCards(hand);
    var lines = [
      '<span style="color:#a371f7">\u2b06 PURPLE</span> strange \u00b7 new \u00b7 rare \u00b7 unknown',
      '<span style="color:#6e7681">sorted by: ' + p.name + ' \u2014 ' + p.desc + '</span>',
      '',
    ];

    sorted.forEach(function(c, i) {
      var s = cardStrangeness(c);
      var bar = flavorBar(s);
      var fc = flavorHex(s);
      lines.push(bar + ' <span style="color:' + fc + '">' + (c.icon || '') + c.name + '</span>' +
        (c.power !== undefined ? ' ' + c.power + '/' + c.toughness : '') +
        (c.cost ? ' (' + c.cost + ')' : '') +
        ' <span class="dim">[' + c.type + ']</span>');
    });

    lines.push('');
    lines.push('<span style="color:#3fb950">\u2b07 GREEN</span> base \u00b7 familiar \u00b7 common \u00b7 nearby');
    lines.push('<span class="dim">/spin to rotate perspective \u00b7 /sort to re-sort</span>');

    return lines.join('\n');
  }

  function flavorBar(strangeness) {
    var s = Math.max(0, Math.min(1, strangeness));
    var width = 8;
    var filled = Math.round(s * width);
    var bar = '';
    for (var i = 0; i < width; i++) {
      var pos = i / width;
      if (i < filled) {
        bar += '<span style="color:' + flavorHex(pos) + '">\u2588</span>';
      } else {
        bar += '<span style="color:#21262d">\u2591</span>';
      }
    }
    return bar;
  }

  // ═══ FLAVOR MAP — everything scored on the axis ═══

  function flavorMapView() {
    var lines = [
      '<span style="color:#a371f7">\u2b06 PURPLE</span> \u2014 strange, new, rare, unknown',
      '',
    ];

    // Anderson modes sorted by strangeness
    lines.push('<span style="color:#bc8cff">ANDERSON TERRAIN</span>');
    var modes = ['stealth', 'ghost', 'spectrum', 'chorus', 'human', 'sovereign'];
    modes.forEach(function(m) {
      var s = ANDERSON_STRANGENESS[m] || 0.5;
      lines.push('  ' + flavorBar(s) + ' ' + m + ' (' + (s * 100).toFixed(0) + '%)');
    });

    // Sort classes
    lines.push('\n<span style="color:#bc8cff">SORT CLASSES</span>');
    var classes = ['non-self', 'null', 'partial', 'self'];
    classes.forEach(function(c) {
      var s = SORT_STRANGENESS[c] || 0.5;
      lines.push('  ' + flavorBar(s) + ' ' + c + ' (' + (s * 100).toFixed(0) + '%)');
    });

    // Categories
    lines.push('\n<span style="color:#bc8cff">SURFACE CATEGORIES</span>');
    var cats = Object.keys(CAT_STRANGENESS).sort(function(a, b) { return CAT_STRANGENESS[b] - CAT_STRANGENESS[a]; });
    cats.forEach(function(c) {
      var s = CAT_STRANGENESS[c];
      lines.push('  ' + flavorBar(s) + ' ' + c + ' (' + (s * 100).toFixed(0) + '%)');
    });

    // Card types
    lines.push('\n<span style="color:#bc8cff">CARD TYPES</span>');
    var types = Object.keys(TYPE_BASE).sort(function(a, b) { return TYPE_BASE[b] - TYPE_BASE[a]; });
    types.forEach(function(t) {
      var s = TYPE_BASE[t];
      lines.push('  ' + flavorBar(t === 'fleet' ? 0.75 : s) + ' ' + t + ' (base ' + (s * 100).toFixed(0) + '%)');
    });

    lines.push('');
    lines.push('<span style="color:#3fb950">\u2b07 GREEN</span> \u2014 base, familiar, common, nearby');

    return lines.join('\n');
  }

  // ═══ COSMIC VIEW FLAVOR OVERLAY ═══

  function applyFlavorToCosmic() {
    var cv = window._cosmicView;
    if (!cv || !cv.getSvg) return;
    var svg = cv.getSvg();
    if (!svg) return;

    var surfEls = svg.querySelectorAll('[data-surface]');
    for (var i = 0; i < surfEls.length; i++) {
      var el = surfEls[i];
      var surfName = el.getAttribute('data-surface');
      var s = surfaceStrangeness(surfName);
      var fc = flavorHex(s);

      if (el.tagName === 'circle') {
        el.setAttribute('stroke', fc);
        el.setAttribute('stroke-width', '0.5');
      }
      if (el.tagName === 'text') {
        el.setAttribute('fill', fc);
      }
    }

    // Apply to gate stars
    var gates = svg.querySelectorAll('[data-gate]');
    for (var j = 0; j < gates.length; j++) {
      var gate = gates[j];
      gate.setAttribute('fill', flavorHex(0.15));
    }
  }

  function removeFlavorFromCosmic() {
    var cv = window._cosmicView;
    if (!cv || !cv.getSvg) return;
    var svg = cv.getSvg();
    if (!svg) return;

    var cs = window._cosmicSurfaces;
    if (!cs || !cs.SURFACES) return;

    var surfEls = svg.querySelectorAll('[data-surface]');
    for (var i = 0; i < surfEls.length; i++) {
      var el = surfEls[i];
      var surfName = el.getAttribute('data-surface');
      var surf = cs.SURFACES[surfName];
      if (surf && el.tagName === 'circle') {
        el.setAttribute('stroke', 'none');
      }
      if (surf && el.tagName === 'text') {
        el.setAttribute('fill', surf.c || '#8b949e');
      }
    }
  }

  var _flavorActive = false;

  function toggleFlavor() {
    _flavorActive = !_flavorActive;
    if (_flavorActive) {
      applyFlavorToCosmic();
    } else {
      removeFlavorFromCosmic();
    }
    return _flavorActive;
  }

  // ═══ WIRE ZOOM EVENTS ═══

  var cv = window._cosmicView;
  if (cv && cv.onZoom) {
    cv.onZoom(function() {
      if (_flavorActive) {
        setTimeout(applyFlavorToCosmic, 100);
      }
    });
  }


  // ═══ DYNAMIC STRANGENESS FROM LIVE DATA ═══

  var _feedStrangeness = {};

  function updateFromFeeds() {
    var cs = window._cosmicSurfaces;
    if (!cs) return;

    // Scan sweep sort — entities with sort classes get real-time scores
    var scanRaw = typeof cs.scanData === 'function' ? cs.scanData() : cs.scanData;
    if (scanRaw) {
      var scan = scanRaw;
      var sortCounts = { self: 0, partial: 0, null: 0, 'non-self': 0 };
      var sc = (scan.sort && scan.sort.summary && scan.sort.summary.detroit_entities) || scan.sort_classes || {};
      for (var cls in sc) {
        if (sortCounts.hasOwnProperty(cls)) sortCounts[cls] = sc[cls] || 0;
      }
      var total = sortCounts.self + sortCounts.partial + sortCounts['null'] + sortCounts['non-self'];
      if (total > 0) {
        _feedStrangeness.membrane = (
          sortCounts['non-self'] * 0.9 +
          sortCounts['null'] * 0.65 +
          sortCounts.partial * 0.45 +
          sortCounts.self * 0.05
        ) / total;
      }
    }

    // Topology — connection density affects strangeness
    var topoRaw = typeof cs.topoData === 'function' ? cs.topoData() : cs.topoData;
    if (topoRaw) {
      var topo = topoRaw;
      var edges = topo.total_edges || 0;
      var nodes = topo.total_nodes || 1;
      var density = edges / (nodes * (nodes - 1) / 2 || 1);
      _feedStrangeness.topology = Math.min(1, density * 5);
    }

    // Human data — S/N ratio affects strangeness
    var humanRaw = typeof cs.humanData === 'function' ? cs.humanData() : cs.humanData;
    if (humanRaw) {
      var human = humanRaw;
      var sn = (human.energy && human.energy.signal_to_noise) || 1;
      _feedStrangeness.signalNoise = Math.max(0, 1 - (sn / 1000));
    }

    return _feedStrangeness;
  }

  function feedStrangeness() { return _feedStrangeness; }

  function liveCardStrangeness(card) {
    var base = cardStrangeness(card);
    var memS = _feedStrangeness.membrane || 0.5;
    return base * 0.7 + memS * 0.3;
  }

  // ═══ SPECTRUM VIEW — live gradient visualization ═══

  function spectrumView() {
    updateFromFeeds();
    var lines = [
      '<span style="color:#a371f7">\u2b06 THE SPECTRUM</span> \u2014 live strangeness across the membrane',
      '',
    ];

    // Build a 40-character gradient bar
    var bar = '';
    for (var i = 0; i < 40; i++) {
      var s = i / 39;
      bar += '<span style="color:' + flavorHex(s) + '">\u2588</span>';
    }
    lines.push(bar);
    lines.push('<span style="color:#3fb950">GREEN</span>' + ' '.repeat(28) + '<span style="color:#a371f7">PURPLE</span>');
    lines.push('');

    // Live feed strangeness
    lines.push('<span style="color:#bc8cff">LIVE FEED READINGS</span>');
    var feedKeys = Object.keys(_feedStrangeness);
    if (feedKeys.length === 0) {
      lines.push('  <span class="dim">no feed data yet \u2014 /draw to pull</span>');
    } else {
      feedKeys.sort(function(a, b) { return (_feedStrangeness[b] || 0) - (_feedStrangeness[a] || 0); });
      feedKeys.forEach(function(k) {
        var s = _feedStrangeness[k];
        lines.push('  ' + flavorBar(s) + ' ' + k + ' <span style="color:' + flavorHex(s) + '">' + (s * 100).toFixed(1) + '%</span>');
      });
    }

    // Current hand strangeness
    var cc = window._cosmicCards;
    if (cc && cc.hand().length > 0) {
      var hand = cc.hand();
      var avgS = 0;
      hand.forEach(function(c) { avgS += cardStrangeness(c); });
      avgS /= hand.length;
      lines.push('\n<span style="color:#bc8cff">HAND STRANGENESS</span>');
      lines.push('  ' + flavorBar(avgS) + ' average: <span style="color:' + flavorHex(avgS) + '">' + (avgS * 100).toFixed(1) + '%</span> across ' + hand.length + ' cards');

      var minS = 1, maxS = 0, minC = null, maxC = null;
      hand.forEach(function(c) {
        var s = cardStrangeness(c);
        if (s < minS) { minS = s; minC = c; }
        if (s > maxS) { maxS = s; maxC = c; }
      });
      if (minC) lines.push('  <span style="color:#3fb950">\u2b07 greenest:</span> ' + minC.name + ' (' + (minS * 100).toFixed(0) + '%)');
      if (maxC) lines.push('  <span style="color:#a371f7">\u2b06 purplest:</span> ' + maxC.name + ' (' + (maxS * 100).toFixed(0) + '%)');
    }

    // Overall membrane strangeness
    var memS = _feedStrangeness.membrane;
    if (memS !== undefined) {
      lines.push('\n<span style="color:#bc8cff">MEMBRANE BALANCE</span>');
      var pos = Math.round(memS * 38);
      var gauge = '';
      for (var j = 0; j < 40; j++) {
        if (j === pos) {
          gauge += '<span style="color:#f0e68c">\u25c6</span>';
        } else {
          gauge += '<span style="color:' + flavorHex(j / 39) + '">\u2500</span>';
        }
      }
      lines.push('  ' + gauge);
      var label = memS < 0.3 ? 'mostly familiar' : memS < 0.5 ? 'balanced' : memS < 0.7 ? 'shifting strange' : 'deeply purple';
      lines.push('  <span style="color:' + flavorHex(memS) + '">' + label + '</span> (' + (memS * 100).toFixed(1) + '% strangeness)');
    }

    lines.push('');
    lines.push('<span style="color:#3fb950">\u2b07 GREEN</span> \u2014 base, familiar, common, nearby');
    lines.push('<span class="dim">/purple to search up \u00b7 /green to search down \u00b7 /spin to rotate</span>');

    return lines.join('\n');
  }

  // ═══ ORBIT WOBBLE — planets drift by strangeness ═══

  var _wobbleActive = false;
  var _wobblePhase = 0;

  function startOrbitWobble() {
    if (_wobbleActive) return;
    _wobbleActive = true;
    _wobblePhase = 0;
    _wobbleLoop();
  }

  function stopOrbitWobble() {
    _wobbleActive = false;
  }

  function _wobbleLoop() {
    if (!_wobbleActive) return;
    _wobblePhase += 0.02;

    var cv = window._cosmicView;
    if (!cv || !cv.getSvg || !cv.isVisible()) {
      requestAnimationFrame(_wobbleLoop);
      return;
    }
    var svg = cv.getSvg();
    if (!svg) { requestAnimationFrame(_wobbleLoop); return; }

    var surfEls = svg.querySelectorAll('circle[data-surface][data-orbit-r]');
    for (var i = 0; i < surfEls.length; i++) {
      var el = surfEls[i];
      var surfName = el.getAttribute('data-surface');
      var baseR = parseFloat(el.getAttribute('data-orbit-r'));
      var s = surfaceStrangeness(surfName);

      // Wobble: purple things drift outward, green things drift inward
      var wobble = Math.sin(_wobblePhase + s * 6.28) * (s - 0.5) * 4;
      el.setAttribute('data-orbit-r', (baseR + wobble).toFixed(1));
    }

    requestAnimationFrame(_wobbleLoop);
  }



  // ═══ FLAVOR PARTICLES — drift up (purple) and down (green) in cosmic view ═══

  var _particles = [];
  var _particlesActive = false;
  var _particleGroup = null;
  var MAX_PARTICLES = 60;

  function _createParticle(svg, cx, cy) {
    var s = Math.random();
    var color = flavorHex(s);
    var x = cx + (Math.random() - 0.5) * 280;
    var y = cy + (Math.random() - 0.5) * 200;
    var speed = (s - 0.5) * 0.3;
    var drift = (Math.random() - 0.5) * 0.1;
    var size = 0.5 + Math.random() * 1.5;
    var opacity = 0.1 + Math.random() * 0.3;
    var life = 200 + Math.random() * 400;

    var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', size.toFixed(1));
    c.setAttribute('fill', color);
    c.setAttribute('opacity', opacity.toFixed(2));
    c.setAttribute('cx', x.toFixed(1));
    c.setAttribute('cy', y.toFixed(1));

    return { el: c, x: x, y: y, vx: drift, vy: -speed, life: life, age: 0, s: s };
  }

  function startParticles() {
    if (_particlesActive) return;
    _particlesActive = true;

    var cv = window._cosmicView;
    if (!cv || !cv.getSvg || !cv.isVisible()) return;
    var svg = cv.getSvg();
    if (!svg) return;

    var dims = cv.dims || { cx: 450, cy: 320 };

    _particleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    _particleGroup.setAttribute('id', 'flavor-particles');
    _particleGroup.setAttribute('opacity', '0.6');
    svg.appendChild(_particleGroup);

    for (var i = 0; i < MAX_PARTICLES; i++) {
      var p = _createParticle(svg, dims.cx, dims.cy);
      _particleGroup.appendChild(p.el);
      _particles.push(p);
    }

    _particleLoop();
  }

  function stopParticles() {
    _particlesActive = false;
    if (_particleGroup && _particleGroup.parentNode) {
      _particleGroup.parentNode.removeChild(_particleGroup);
    }
    _particleGroup = null;
    _particles = [];
  }

  function _particleLoop() {
    if (!_particlesActive) return;

    var cv = window._cosmicView;
    if (!cv || !cv.isVisible()) { requestAnimationFrame(_particleLoop); return; }
    var dims = cv.dims || { cx: 450, cy: 320 };

    for (var i = 0; i < _particles.length; i++) {
      var p = _particles[i];
      p.age++;
      p.x += p.vx;
      p.y += p.vy;

      var fade = 1 - (p.age / p.life);
      if (fade <= 0 || p.y < dims.cy - 350 || p.y > dims.cy + 350) {
        if (_particleGroup) _particleGroup.removeChild(p.el);
        var np = _createParticle(null, dims.cx, dims.cy);
        if (_particleGroup) _particleGroup.appendChild(np.el);
        _particles[i] = np;
        continue;
      }

      p.el.setAttribute('cx', p.x.toFixed(1));
      p.el.setAttribute('cy', p.y.toFixed(1));
      p.el.setAttribute('opacity', (fade * 0.3).toFixed(2));
    }

    requestAnimationFrame(_particleLoop);
  }

  // ═══ FLAVOR AURA — strangeness ring around "you are here" position ═══

  function flavorAura() {
    var yah = window._youAreHere;
    if (!yah || !yah.observe) return null;
    var self = yah.observe();
    if (!self) return null;

    var catS = CAT_STRANGENESS[self.category] || 0.5;
    var depthFactor = Math.min(1, self.depth * 2);
    var aura = catS * 0.6 + depthFactor * 0.2 + (self.breadth > 5 ? 0.1 : 0) + (self.dwellMin > 5 ? 0.1 : 0);
    aura = Math.max(0, Math.min(1, aura));

    var fc = flavorHex(aura);
    var label = aura < 0.3 ? 'green aura \u2014 familiar ground' :
                aura < 0.5 ? 'balanced aura' :
                aura < 0.7 ? 'shifting purple' :
                'deep purple aura \u2014 strange territory';

    return {
      strangeness: aura,
      color: fc,
      label: label,
      bar: flavorBar(aura),
      category: self.category,
      epitope: self.epitope,
      depth: self.depth,
      breadth: self.breadth,
    };
  }

  // ═══ FLAVOR CONTAGION — visiting a surface shifts your hand's flavor ═══

  var _contagionHistory = [];
  var MAX_CONTAGION = 20;

  function contagion(surfaceKey) {
    var s = surfaceStrangeness(surfaceKey);
    _contagionHistory.push({ surface: surfaceKey, strangeness: s, ts: Date.now() });
    if (_contagionHistory.length > MAX_CONTAGION) _contagionHistory.shift();

    var cc = window._cosmicCards;
    if (cc && cc.hand().length > 0) {
      var hand = cc.hand();
      var closest = null, minDist = 2;
      hand.forEach(function(c) {
        var cs = cardStrangeness(c);
        var dist = Math.abs(cs - s);
        if (dist < minDist) { minDist = dist; closest = c; }
      });
      if (closest) {
        closest._contagion = s;
        closest._contagionFrom = surfaceKey;
      }
    }

    return { surface: surfaceKey, strangeness: s };
  }

  function contagionTrail() {
    if (_contagionHistory.length === 0) return 'no contagion trail yet';
    var lines = ['<span style="color:#bc8cff">CONTAGION TRAIL</span> \u2014 surfaces touched, flavor left behind'];
    _contagionHistory.forEach(function(c) {
      var age = Math.round((Date.now() - c.ts) / 60000);
      lines.push('  ' + flavorBar(c.strangeness) + ' ' + c.surface + ' (' + (c.strangeness * 100).toFixed(0) + '%) ' + age + 'm ago');
    });
    var avg = 0;
    _contagionHistory.forEach(function(c) { avg += c.strangeness; });
    avg /= _contagionHistory.length;
    lines.push('\naverage trail: ' + flavorBar(avg) + ' <span style="color:' + flavorHex(avg) + '">' + (avg * 100).toFixed(1) + '%</span>');
    return lines.join('\n');
  }

  // ═══ STRANGENESS HISTORY — sparkline over heartbeat cycles ═══

  var _strangenessHistory = [];
  var MAX_HISTORY = 60;

  function recordStrangeness(value) {
    _strangenessHistory.push({ value: value, ts: Date.now() });
    if (_strangenessHistory.length > MAX_HISTORY) _strangenessHistory.shift();
  }

  function strangenessSparkline() {
    if (_strangenessHistory.length < 2) return '<span class="dim">not enough data for sparkline</span>';

    var chars = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];
    var min = 1, max = 0;
    _strangenessHistory.forEach(function(h) {
      if (h.value < min) min = h.value;
      if (h.value > max) max = h.value;
    });
    var range = max - min || 0.01;

    var spark = '';
    _strangenessHistory.forEach(function(h) {
      var idx = Math.round(((h.value - min) / range) * (chars.length - 1));
      var color = flavorHex(h.value);
      spark += '<span style="color:' + color + '">' + chars[idx] + '</span>';
    });

    var latest = _strangenessHistory[_strangenessHistory.length - 1].value;
    var first = _strangenessHistory[0].value;
    var trend = latest > first + 0.05 ? '\u2197 drifting purple' :
                latest < first - 0.05 ? '\u2198 settling green' : '\u2192 stable';

    return spark + '\n<span class="dim">' + _strangenessHistory.length + ' readings \u00b7 ' + trend + '</span>';
  }

  // Poll heartbeat for strangeness history
  function _pollStrangeness() {
    if (!window._signalRelay) return;
    window._signalRelay.pulse().then(function(p) {
      if (p && p.heartbeat && p.heartbeat.strangeness !== undefined) {
        recordStrangeness(p.heartbeat.strangeness);
      }
    }).catch(function() {});
  }
  setInterval(_pollStrangeness, 30000);
  setTimeout(_pollStrangeness, 5000);

  // ═══ HUD TINTING — shift the page itself by membrane strangeness ═══

  var _tintActive = false;

  function startTinting() {
    _tintActive = true;
    _tintLoop();
  }

  function stopTinting() {
    _tintActive = false;
    document.documentElement.style.removeProperty('--flavor-hue');
    var cards = document.querySelectorAll('.card-panel, .investigate-card, .entity-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.removeProperty('border-color');
    }
  }

  function _tintLoop() {
    if (!_tintActive) return;

    var s = _feedStrangeness.membrane;
    if (s === undefined) s = 0.5;

    var hue = Math.round(120 + s * 180);
    document.documentElement.style.setProperty('--flavor-hue', hue);

    var borderColor = flavorHex(s);
    var memStatus = document.querySelector('.membrane-status, .hud-live');
    if (memStatus) {
      memStatus.style.borderLeftColor = borderColor;
    }

    var footerEl = document.querySelector('.hud-footer, footer');
    if (footerEl) {
      footerEl.style.borderTopColor = borderColor;
    }

    setTimeout(_tintLoop, 10000);
  }


  // ═══ EXPORT ═══

  window._cosmicFlavor = {
    // color
    flavorColor: flavorColor,
    flavorHex: flavorHex,
    flavorBar: flavorBar,
    // scoring
    cardStrangeness: cardStrangeness,
    entityStrangeness: entityStrangeness,
    surfaceStrangeness: surfaceStrangeness,
    // spin + sort
    spin: spin,
    currentPerspective: currentPerspective,
    setPerspective: setPerspective,
    sortCards: sortCards,
    // views
    sortedHandView: sortedHandView,
    flavorMapView: flavorMapView,
    // cosmic overlay
    toggleFlavor: toggleFlavor,
    applyFlavorToCosmic: applyFlavorToCosmic,
    removeFlavorFromCosmic: removeFlavorFromCosmic,
    isActive: function() { return _flavorActive; },
    // constants
    PALETTE: PALETTE,
    RARITY_STRANGENESS: RARITY_STRANGENESS,
    CAT_STRANGENESS: CAT_STRANGENESS,
    ANDERSON_STRANGENESS: ANDERSON_STRANGENESS,
    SORT_STRANGENESS: SORT_STRANGENESS,
    PERSPECTIVES: PERSPECTIVES,
    // dynamic
    updateFromFeeds: updateFromFeeds,
    feedStrangeness: feedStrangeness,
    liveCardStrangeness: liveCardStrangeness,
    spectrumView: spectrumView,
    // wobble
    startOrbitWobble: startOrbitWobble,
    stopOrbitWobble: stopOrbitWobble,
    // particles
    startParticles: startParticles,
    stopParticles: stopParticles,
    // aura
    flavorAura: flavorAura,
    // contagion
    contagion: contagion,
    contagionTrail: contagionTrail,
    // history
    recordStrangeness: recordStrangeness,
    strangenessSparkline: strangenessSparkline,
    // tinting
    startTinting: startTinting,
    stopTinting: stopTinting,
  };
})();
