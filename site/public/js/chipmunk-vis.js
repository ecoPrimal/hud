// chipmunk-vis.js — membrane SVG rendering, animation, transit, braids
// Extracted from chipmunk-talk.js for decomposition.
// Initialized by talk.js via _chipmunkVis.init(scope).
(function() {
  'use strict';
  var _m = window._membrane || {};
  var el = _m.el || function(tag,a,p){var e=document.createElementNS('http://www.w3.org/2000/svg',tag);if(a)for(var k in a)e.setAttribute(k,''+a[k]);if(p)p.appendChild(e);return e;};

  // Scope injected by talk.js
  var cache, n, addEntry, bumpAttention, escapeHtml;
  var MG, NS, PI, PI2, PI3;
  var BODIES, CONTINENTS, SORT_COLORS, EPITOPE_DEPTH, PLANETS;
  var svgEl = null, bubbleGroup = null, unfurlGroup = null;
  var bubbles = [], MAX_BUBBLES, lastFrame = 0, isOverlay = false;
  var _braidGroup = null;

  function init(s) {
    cache = s.cache; n = s.n; addEntry = s.addEntry;
    bumpAttention = s.bumpAttention; escapeHtml = s.escapeHtml;
    MG = s.MG; NS = s.NS; PI = s.PI;
    PI2 = PI * PI; PI3 = PI * PI * PI;
    BODIES = s.BODIES; CONTINENTS = s.CONTINENTS;
    SORT_COLORS = s.SORT_COLORS; EPITOPE_DEPTH = s.EPITOPE_DEPTH;
    PLANETS = s.PLANETS; MAX_BUBBLES = Math.floor(PI3);
    isOverlay = s.isOverlay || false;
  }


  function bodyRadius(value) {
    if (value <= 0) return 2;
    return (value / PI3) * MG.R;
  }

  function buildMembrane() {
    var host = document.getElementById('membrane-canvas');

    // If no standalone canvas, check if we're inside HUD (overlay mode)
    if (!host) {
      var hudSvg = document.querySelector('#membrane-focal-svg svg');
      if (hudSvg) {
        // Overlay mode: use HUD's existing SVG, don't build our own
        svgEl = hudSvg;
        isOverlay = true;
        // Read geometry from HUD's SVG
        var vb = svgEl.getAttribute('viewBox');
        if (vb) {
          var parts = vb.split(' ');
          MG.W = parseFloat(parts[2]) || MG.W;
          MG.H = parseFloat(parts[3]) || MG.H;
          MG.cx = MG.W / 2;
          MG.cy = MG.H / 2;
        }
        // Create chipmunk groups in HUD SVG if needed
        bubbleGroup = svgEl.querySelector("#mg-bubbles");
        if (!bubbleGroup) {
          bubbleGroup = document.createElementNS(NS, "g");
          bubbleGroup.setAttribute("id", "mg-bubbles");
          svgEl.appendChild(bubbleGroup);
        }
        unfurlGroup = svgEl.querySelector("#mg-unfurl");
        if (!unfurlGroup) {
          unfurlGroup = document.createElementNS(NS, "g");
          unfurlGroup.setAttribute("id", "mg-unfurl");
          svgEl.appendChild(unfurlGroup);
        }
        return; // overlay mode: using HUD SVG
      }
      return; // neither canvas nor HUD — can't boot
    }

    svgEl = document.createElementNS(NS, 'svg');
    svgEl.setAttribute('viewBox', '0 0 ' + MG.W + ' ' + MG.H);
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    host.appendChild(svgEl);

    var cx = MG.cx, cy = MG.cy, R = MG.R;

    // Defs
    var defs = el('defs', {}, svgEl);
    var filter = el('filter', { id: 'mg-glow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    el('feGaussianBlur', { stdDeviation: '3', result: 'blur' }, filter);
    var merge = el('feMerge', {}, filter);
    el('feMergeNode', { 'in': 'blur' }, merge);
    el('feMergeNode', { 'in': 'SourceGraphic' }, merge);

    // Thought bubble glow — softer, more diffuse than mg-glow
    var tFilter = el('filter', { id: 'thought-glow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    el('feGaussianBlur', { stdDeviation: '5', result: 'tblur' }, tFilter);
    var tMerge = el('feMerge', {}, tFilter);
    el('feMergeNode', { 'in': 'tblur' }, tMerge);
    el('feMergeNode', { 'in': 'SourceGraphic' }, tMerge);

    // Background
    el('rect', { width: MG.W, height: MG.H, fill: '#0d1117' }, svgEl);

    var mainG = el('g', { id: 'mg-pangaea', opacity: '0.7' }, svgEl);

    // π-body rings
    BODIES.forEach(function(body, i) {
      var r = bodyRadius(body.value);
      if (r < 1) return;
      el('circle', {
        cx: cx, cy: cy, r: r.toFixed(1),
        fill: 'none', stroke: body.color,
        'stroke-width': i === BODIES.length - 1 ? 1.5 : 0.8,
        'stroke-opacity': 0.15 + i * 0.06,
        'stroke-dasharray': i === 0 ? '' : (2 + i * 2) + ',' + (3 + i),
        id: 'mg-ring-' + body.name
      }, mainG);

      var labelY = cy - r - 5;
      el('text', {
        x: cx, y: labelY,
        fill: body.color, 'font-size': 8,
        'text-anchor': 'middle', opacity: 0.35,
        'font-family': '"Courier New",monospace'
      }, mainG).textContent = body.label + ' \u2014 ' + body.desc;
    });

    // Null center
    el('circle', {
      cx: cx, cy: cy, r: 4,
      fill: '#ffffff', opacity: 0.25,
      filter: 'url(#mg-glow)', id: 'mg-null-center'
    }, mainG);
    el('text', {
      x: cx, y: cy + 2,
      fill: '#ffffff', 'font-size': 6,
      'text-anchor': 'middle', opacity: 0.4,
      'font-family': '"Courier New",monospace'
    }, mainG).textContent = '\u2205';

    // Continents
    var pangaeaG = el('g', { id: 'mg-continents' }, mainG);
    CONTINENTS.forEach(function(cont) {
      var surfaceR = bodyRadius(PI3) * 0.85;
      var sx = cx + surfaceR * Math.cos(cont.angle);
      var sy = cy + surfaceR * Math.sin(cont.angle);

      el('line', {
        x1: cx, y1: cy, x2: sx.toFixed(1), y2: sy.toFixed(1),
        stroke: cont.color, 'stroke-width': 0.5,
        'stroke-opacity': 0.08, 'stroke-dasharray': '2,6'
      }, pangaeaG);

      el('circle', {
        cx: sx.toFixed(1), cy: sy.toFixed(1), r: 3.5,
        fill: cont.color, opacity: 0.3
      }, pangaeaG);

      var lx = cx + (surfaceR + 14) * Math.cos(cont.angle);
      var ly = cy + (surfaceR + 14) * Math.sin(cont.angle);
      el('text', {
        x: lx.toFixed(1), y: ly.toFixed(1),
        fill: cont.color, 'font-size': 7,
        'text-anchor': 'middle', opacity: 0.35,
        'font-family': '"Courier New",monospace'
      }, pangaeaG).textContent = cont.name;
    });

    // Process stage labels
    var STAGES = [
      { name: 'scan', r: 0.15, color: '#ffffff' },
      { name: 'sweep', r: 0.35, color: '#58a6ff' },
      { name: 'sort', r: 0.55, color: '#5ab87a' },
      { name: 'fossilize', r: 0.75, color: '#f0e68c' },
      { name: 'evolve', r: 0.95, color: '#d2a8ff' },
    ];
    unfurlGroup = el('g', { id: 'mg-unfurl' }, mainG);
    STAGES.forEach(function(st, i) {
      var stAngle = -PI / 2 + i * 0.25;
      var stR = bodyRadius(PI3) * st.r;
      var sx = cx + stR * Math.cos(stAngle);
      var sy = cy + stR * Math.sin(stAngle);
      el('text', {
        x: sx.toFixed(1), y: sy.toFixed(1),
        fill: st.color, 'font-size': 5,
        'text-anchor': 'middle', opacity: 0.15,
        'font-style': 'italic', 'font-family': '"Courier New",monospace'
      }, unfurlGroup).textContent = st.name;
    });

    // Celestial — system orbit + oort + planets
    var celG = el('g', { id: 'mg-celestial' }, mainG);
    var systemR = R * 1.32;
    var oortR = R * 1.55;

    el('circle', {
      cx: cx, cy: cy, r: systemR.toFixed(1),
      fill: 'none', stroke: '#f0e68c',
      'stroke-width': 0.5, 'stroke-opacity': 0.08, 'stroke-dasharray': '4,8'
    }, celG);
    el('circle', {
      cx: cx, cy: cy, r: oortR.toFixed(1),
      fill: 'none', stroke: '#484f58',
      'stroke-width': 0.4, 'stroke-opacity': 0.06, 'stroke-dasharray': '1,6'
    }, celG);

    PLANETS.forEach(function(p, i) {
      var orbitR = R * p.r;
      el('circle', {
        cx: cx, cy: cy, r: orbitR.toFixed(1),
        fill: 'none', stroke: p.color,
        'stroke-width': 0.2, 'stroke-opacity': 0.04
      }, celG);
      el('circle', {
        cx: (cx + orbitR).toFixed(1), cy: cy,
        r: p.size.toFixed(1),
        fill: p.color, opacity: 0.3,
        id: 'mg-planet-' + i
      }, celG);
    });


    // ═══ CLOCK HANDS — 3 working, 1 at rest ═══
    var clockG = el('g', { id: 'mg-clock-hands' }, mainG);
    var handLen = bodyRadius(PI3) * 0.95;
    var CLOCK_HANDS = [
      { name: 'scan',    color: '#ffffff', width: 1.0, speed: 1.0,  offset: 0 },
      { name: 'sort',    color: '#3fb950', width: 0.8, speed: 0.618, offset: 2*PI/3 },
      { name: 'connect', color: '#58a6ff', width: 0.6, speed: 0.382, offset: 4*PI/3 },
    ];
    CLOCK_HANDS.forEach(function(h) {
      el('line', {
        x1: cx, y1: cy, x2: cx, y2: cy - handLen,
        stroke: h.color, 'stroke-width': h.width,
        'stroke-opacity': 0.12, 'stroke-linecap': 'round',
        id: 'mg-hand-' + h.name
      }, clockG);
      el('path', {
        d: 'M ' + cx + ',' + cy + ' L ' + cx + ',' + cy,
        fill: h.color, opacity: 0.02,
        id: 'mg-trust-' + h.name
      }, clockG);
    });
    el('text', {
      x: cx, y: cy, fill: '#484f58', 'font-size': 5,
      'text-anchor': 'middle', opacity: 0,
      'font-family': '"Courier New",monospace',
      id: 'mg-rest-label'
    }, clockG).textContent = '\u25cc rest';

    // Bubble group
    bubbleGroup = el('g', { id: 'mg-bubbles' }, mainG);

    // Transit/IP overlay group — shows humans moving through membrane
    el('g', { id: 'mg-transit' }, mainG);
  }

  // ═══ BUBBLES ═══
  function spawnBubble() {
    if (bubbles.length >= MAX_BUBBLES) return;
    var cx = MG.cx, cy = MG.cy;
    var targetR = bodyRadius(PI3) * 0.85;
    var angle, color, size, speed, sortClass;

    if (cache && cache.scanSort && cache.scanSort.sort && Math.random() < 0.7) {
      var u = cache.scanSort.sort.unified_sort || {};
      var roll = Math.random();
      var total = (u.self || 0) + (u.non_self || 0) + (u.partial || 0) + (u.null || 0);
      if (total === 0) total = 1;
      var selfP = (u.self || 0) / total;
      var nonSelfP = (u.non_self || 0) / total;
      var partialP = (u.partial || 0) / total;

      if (roll < selfP) sortClass = 'self';
      else if (roll < selfP + nonSelfP) sortClass = 'non-self';
      else if (roll < selfP + nonSelfP + partialP) sortClass = 'partial';
      else sortClass = 'null';

      color = SORT_COLORS[sortClass];
      speed = sortClass === 'self' ? (6 + Math.random() * 8) :
              sortClass === 'non-self' ? (15 + Math.random() * 20) :
              (8 + Math.random() * 12);
      size = sortClass === 'self' ? (1.2 + Math.random() * 1.5) :
             sortClass === 'non-self' ? (0.5 + Math.random() * 0.6) :
             (0.8 + Math.random() * 1.0);
      if (sortClass === 'non-self') {
        targetR = bodyRadius(PI + Math.random() * PI);
      } else if (sortClass === 'null') {
        targetR = bodyRadius(PI2 * 0.5);
      }
      // Chromatographic angular sorting — each sort class gets its own band
      // self = top quadrant (boundary), non-self = right (output), partial = bottom (feeds), null = left (void)
      var bandCenter = sortClass === 'self' ? 0 :
                       sortClass === 'non-self' ? PI * 0.5 :
                       sortClass === 'partial' ? PI :
                       PI * 1.5;
      angle = bandCenter + (Math.random() - 0.5) * PI * 0.45; // spread within band
    } else {
      var cont = CONTINENTS[Math.floor(Math.random() * CONTINENTS.length)];
      angle = cont.angle + (Math.random() - 0.5) * 0.4;
      color = cont.color;
      speed = 8 + Math.random() * 15;
      size = 0.8 + Math.random() * 1.2;
      sortClass = 'unknown';
    }

    bubbles.push({
      angle: angle, r: 2 + Math.random() * 3,
      targetR: targetR, speed: speed,
      color: color, size: size, opacity: 0,
      sortClass: sortClass, trust: 0.5, lastSwept: 0, el: null
    });
  }

  function animate(now) {
    if (!bubbleGroup) { requestAnimationFrame(animate); return; }
    var dt = lastFrame ? (now - lastFrame) / 1000 : 0.016;
    if (dt > 0.1) dt = 0.1;
    lastFrame = now;
    var cx = MG.cx, cy = MG.cy;

    // Bubble rate coupled to metabolism — more energy → more bubbles
    var mEnergy = (window._chipmunkCore && window._chipmunkCore.metabolism) ?
      window._chipmunkCore.metabolism.energy : 0.4;
    if (Math.random() < dt * (1 + mEnergy * 4)) spawnBubble();

    // In overlay mode: skip planets, clock, null-center (HUD handles those)
    if (!isOverlay) {
    // Planets orbit
    PLANETS.forEach(function(p, i) {
      var planet = document.getElementById('mg-planet-' + i);
      if (planet) {
        var orbitR = MG.R * p.r;
        var angle = (now / 1000) * p.speed * 0.1;
        planet.setAttribute('cx', (cx + orbitR * Math.cos(angle)).toFixed(1));
        planet.setAttribute('cy', (cy + orbitR * Math.sin(angle)).toFixed(1));
      }
    });


    // ═══ CLOCK HANDS — sweep + trust ═══
    var t = now / 1000;
    var handAngles = [];
    var CLOCK_SPEEDS = [
      { name: 'scan', speed: 1.0, offset: 0 },
      { name: 'sort', speed: 0.618, offset: 2*PI/3 },
      { name: 'connect', speed: 0.382, offset: 4*PI/3 },
    ];
    var handLen2 = bodyRadius(PI3) * 0.95;
    CLOCK_SPEEDS.forEach(function(h) {
      var angle = t * h.speed * 0.1 + h.offset;
      handAngles.push(angle);
      var hEl = document.getElementById('mg-hand-' + h.name);
      if (hEl) {
        hEl.setAttribute('x2', (cx + handLen2 * Math.sin(angle)).toFixed(1));
        hEl.setAttribute('y2', (cy - handLen2 * Math.cos(angle)).toFixed(1));
      }
      var tEl = document.getElementById('mg-trust-' + h.name);
      if (tEl) {
        var sp = PI / 6;
        var a1 = angle - sp, a2 = angle + sp;
        var r = handLen2;
        tEl.setAttribute('d',
          'M ' + cx + ',' + cy +
          ' L ' + (cx + r * Math.sin(a1)).toFixed(1) + ',' + (cy - r * Math.cos(a1)).toFixed(1) +
          ' A ' + r.toFixed(1) + ',' + r.toFixed(1) + ' 0 0 1 ' +
          (cx + r * Math.sin(a2)).toFixed(1) + ',' + (cy - r * Math.cos(a2)).toFixed(1) + ' Z'
        );
      }
    });
    // Rest label
    var rl = document.getElementById('mg-rest-label');
    if (rl && handAngles.length === 3) {
      var ba2 = 0, bd2 = 0;
      for (var pr2 = 0; pr2 < 12; pr2++) {
        var pa2 = pr2 * PI / 6;
        var mn2 = PI;
        for (var h2 = 0; h2 < 3; h2++) {
          var df2 = Math.abs(((pa2 - handAngles[h2]) % (2*PI) + 3*PI) % (2*PI) - PI);
          if (df2 < mn2) mn2 = df2;
        }
        if (mn2 > bd2) { bd2 = mn2; ba2 = pa2; }
      }
      rl.setAttribute('x', (cx + handLen2*0.5*Math.sin(ba2)).toFixed(1));
      rl.setAttribute('y', (cy - handLen2*0.5*Math.cos(ba2)).toFixed(1));
      // Rest label pulses with metabolism — brighter when resting, dimmer when awake
      var metab = (window._chipmunkCore && window._chipmunkCore.metabolism) ?
        window._chipmunkCore.metabolism : null;
      var restBright = metab ? (metab.state === 'resting' ? 0.25 : metab.state === 'asleep' ? 0.35 : 0.06) : 0.08;
      rl.setAttribute('opacity', (restBright + 0.04 * Math.sin(t * (metab && metab.state === 'asleep' ? 0.5 : 2))).toFixed(3));
      if (metab) {
        var MICON2 = { awake: '\u25cf', drowsy: '\u25d4', resting: '\u25d1', asleep: '\u25cb' };
        rl.textContent = (MICON2[metab.state] || '\u25cc') + ' ' + metab.state;
      }
    }

    // Null center pulse
    if (cache.human && cache.human.energy) {
      var eIn = (cache.human.energy.energy_in || 0) / 100;
      var nc = document.getElementById('mg-null-center');
      if (nc) {
        var pulse = 3 + Math.sin(now / 1000) * eIn * 2;
        nc.setAttribute('r', pulse.toFixed(1));
        nc.setAttribute('opacity', (0.2 + eIn * 0.2).toFixed(2));
      }
    }

    } // end !isOverlay skip

    // Animate bubbles — always run (this IS the injection)
    var remove = [];
    _mind('animateThoughts', now);
    bubbles.forEach(function(b, i) {
      b.r += b.speed * dt;
      var progress = b.r / b.targetR;
      if (progress < 0.1) b.opacity = progress / 0.1 * 0.6;
      else if (progress > 0.85) b.opacity = (1 - progress) / 0.15 * 0.6;
      else b.opacity = 0.6;

      var bodyRadii = [bodyRadius(1), bodyRadius(PI), bodyRadius(PI2)];
      bodyRadii.forEach(function(br) {
        if (Math.abs(b.r - br) < 3) {
          b.opacity = Math.min(1, b.opacity + 0.3);
          if (b.sortClass === 'self') b.size *= 1.02;
          if (b.sortClass === 'non-self') { b.size *= 0.95; b.speed *= 1.1; }
          if (b.sortClass === 'partial') b.opacity = 0.3 + Math.random() * 0.5;
        }
      });

      // Trust collapse from clock hands
      if (handAngles && handAngles.length) {
        for (var hi2 = 0; hi2 < handAngles.length; hi2++) {
          var ad = Math.abs(((b.angle - handAngles[hi2]) % (2*PI) + 3*PI) % (2*PI) - PI);
          if (ad < PI/12) { b.trust = 1.0; b.lastSwept = t; }
        }
        var ss = t - (b.lastSwept || 0);
        if (ss > 0.1) b.trust = 0.5 + (b.trust - 0.5) * Math.exp(-ss / PI);
        b.opacity *= (0.3 + b.trust * 0.7);
        if (b.trust > 0.8 && b.size > 1.2) b.speed *= 0.99;
      }

      if (b.r >= b.targetR) {
        remove.push(i);
        if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
        return;
      }

      // Chromatographic drift — bubbles slowly sort into their angular band
      if (b.sortClass && b.sortClass !== 'unknown') {
        var bandTarget = b.sortClass === 'self' ? 0 :
                         b.sortClass === 'non-self' ? PI * 0.5 :
                         b.sortClass === 'partial' ? PI :
                         PI * 1.5;
        var angleDiff = ((bandTarget - b.angle + 3 * PI) % (2 * PI)) - PI;
        b.angle += angleDiff * 0.002; // gentle drift toward band
      }

      var x = cx + b.r * Math.cos(b.angle);
      var y = cy + b.r * Math.sin(b.angle);
      if (!b.el) {
        b.el = el('circle', { fill: b.color, r: b.size.toFixed(1), style: 'cursor:pointer;pointer-events:all' }, bubbleGroup);
        if (b.entity) b.el.setAttribute('data-entity', b.entity);
      }
      b.el.setAttribute('cx', x.toFixed(1));
      b.el.setAttribute('cy', y.toFixed(1));
      b.el.setAttribute('opacity', b.opacity.toFixed(2));
      b.el.setAttribute('r', b.size.toFixed(1));
    });

    for (var i = remove.length - 1; i >= 0; i--) bubbles.splice(remove[i], 1);
    requestAnimationFrame(animate);
  }

  // ═══ TRANSIT OVERLAY — human IPs moving through the membrane ═══
  function updateTransit(humanData) {
    var tg = document.getElementById('mg-transit');
    if (!tg || !humanData || !humanData.epitopes) return;

    // Clear old
    while (tg.firstChild) tg.removeChild(tg.firstChild);

    var cx = MG.cx, cy = MG.cy;
    var epKeys = Object.keys(humanData.epitopes);
    var angleStep = (2 * PI) / Math.max(epKeys.length, 1);

    var ECOLORS = {
      explorer: '#3fb950', scholar: '#a371f7', investigator: '#f0883e',
      reader: '#58a6ff', coder: '#79c0ff', witness: '#d29922',
      observer: '#8b949e', visitor: '#6e7681'
    };

    epKeys.forEach(function(name, idx) {
      var info = humanData.epitopes[name];
      var depth = EPITOPE_DEPTH[name] || 1;
      var r = bodyRadius(depth);
      var angle = idx * angleStep + PI / 6;
      var x = cx + r * Math.cos(angle);
      var y = cy + r * Math.sin(angle);
      var color = ECOLORS[name] || '#6e7681';
      var dotR = Math.min(7, 2 + info.count * 0.3);

      el('circle', {
        cx: x.toFixed(1), cy: y.toFixed(1),
        r: dotR.toFixed(1),
        fill: color, opacity: 0.35, filter: 'url(#mg-glow)'
      }, tg);

      el('text', {
        x: x.toFixed(1), y: (y - dotR - 3).toFixed(1),
        fill: color, 'font-size': 6,
        'text-anchor': 'middle', opacity: 0.5,
        'font-family': '"Courier New",monospace'
      }, tg).textContent = name + ' (' + info.count + ')';
    });

    // Host distribution as orbit dots
    if (humanData.host_distribution) {
      var hosts = humanData.host_distribution;
      var hostKeys = Object.keys(hosts).sort(function(a, b) { return hosts[b] - hosts[a]; });
      var maxHits = hosts[hostKeys[0]] || 1;

      hostKeys.slice(0, 10).forEach(function(site, idx) {
        var hits = hosts[site];
        var hostAngle = (idx / 10) * 2 * PI - PI / 2;
        var hostR = bodyRadius(PI3) * 0.92;
        var x = cx + hostR * Math.cos(hostAngle);
        var y = cy + hostR * Math.sin(hostAngle);
        var sz = 1 + (hits / maxHits) * 4;

        var cont = null;
        CONTINENTS.forEach(function(c) { if (c.name.toLowerCase() === site) cont = c; });
        var color = cont ? cont.color : '#6e7681';

        el('circle', {
          cx: x.toFixed(1), cy: y.toFixed(1), r: sz.toFixed(1),
          fill: color, opacity: 0.2
        }, tg);
      });
    }
  }

  // ═══ UNFURL ═══
  function updateUnfurl(data) {
    if (!unfurlGroup || !data || !data.sort) return;
    var old = unfurlGroup.querySelectorAll('.uf');
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);

    var u = data.sort.unified_sort || {};
    var total = (u.self || 0) + (u.non_self || 0) + (u.partial || 0) + (u.null || 0);
    if (total === 0) return;

    var cx = MG.cx, cy = MG.cy;
    var rings = [
      { body: 1,   sorted: 0.2 },
      { body: PI,  sorted: 0.5 },
      { body: PI2, sorted: 0.8 },
      { body: PI3, sorted: 1.0 },
    ];

    rings.forEach(function(ring) {
      var r = bodyRadius(ring.body);
      var selfFrac = (u.self || 0) / total * ring.sorted;
      if (selfFrac > 0.001) {
        var selfAngle = selfFrac * 2 * PI;
        var startA = -PI / 2;
        var endA = startA + selfAngle;
        var large = selfAngle > PI ? 1 : 0;
        var g = el('path', {
          d: 'M ' + (cx + r * Math.cos(startA)).toFixed(1) + ' ' + (cy + r * Math.sin(startA)).toFixed(1) +
             ' A ' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 ' + large + ' 1 ' +
             (cx + r * Math.cos(endA)).toFixed(1) + ' ' + (cy + r * Math.sin(endA)).toFixed(1),
          fill: 'none', stroke: SORT_COLORS['self'],
          'stroke-width': 2, 'stroke-opacity': 0.3, 'class': 'uf'
        }, unfurlGroup);
      }
      var nsFrac = (u.non_self || 0) / total * (1 - ring.sorted);
      if (nsFrac > 0.001) {
        var nsAngle = nsFrac * 2 * PI;
        var startA2 = PI / 2;
        var endA2 = startA2 + nsAngle;
        var large2 = nsAngle > PI ? 1 : 0;
        el('path', {
          d: 'M ' + (cx + r * Math.cos(startA2)).toFixed(1) + ' ' + (cy + r * Math.sin(startA2)).toFixed(1) +
             ' A ' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 ' + large2 + ' 1 ' +
             (cx + r * Math.cos(endA2)).toFixed(1) + ' ' + (cy + r * Math.sin(endA2)).toFixed(1),
          fill: 'none', stroke: SORT_COLORS['non-self'],
          'stroke-width': 1.5, 'stroke-opacity': 0.2, 'class': 'uf'
        }, unfurlGroup);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // DISPLAY + DATA
  // ═══════════════════════════════════════════════════════════

  function reverseView() {
    var h = cache.human;
    if (!h) return;

    var lines = ['<span class="dim">&#128065; reverse view — what do they see?</span>'];

    // Most popular pages — this IS what humans see
    if (h.top_pages && h.top_pages.length > 0) {
      lines.push('<span class="good">top views:</span>');
      var pages = h.top_pages.slice(0, 5);
      pages.forEach(function(p) {
        var page = p.page || '';
        // Strip common prefixes for readability
        page = page.replace('hud/', '').replace('.json', '');
        lines.push('  ' + page + ': ' + p.hits + ' hits');
      });
    }

    // Orbits — the paths humans take, which defines what they see in sequence
    if (h.orbits && h.orbits.length > 0) {
      lines.push('<span class="good">their journey:</span>');
      h.orbits.slice(0, 3).forEach(function(o) {
        lines.push('  ' + o.path + ' (' + o.visitors + ')');
      });
      // Point-to-point: if we know the orbit, we know what they see next
      var topOrbit = h.orbits[0];
      var sites = topOrbit.path.split(' \u2192 ');
      if (sites.length >= 2) {
        var lastSite = sites[sites.length - 1].trim();
        lines.push('<span class="dim">they last saw: ' + lastSite + '</span>');
        lines.push('<span class="dim">\u2192 so they know about the ' + lastSite + ' surface</span>');
      }
    }

    // Host distribution — which sites are "visible" to humans right now
    if (h.host_distribution) {
      var hosts = h.host_distribution;
      var total = 0;
      Object.keys(hosts).forEach(function(k) { total += hosts[k]; });
      var topHost = Object.keys(hosts).sort(function(a, b) { return hosts[b] - hosts[a]; })[0];
      if (topHost) {
        lines.push('<span class="dim">black wall view: ' + topHost + ' (' + Math.round(hosts[topHost] / total * 100) + '% of attention)</span>');
      }
    }

    // Pollination — what gets spread outward
    var bb = cache.billboard;
    if (bb && bb.billboards) {
      lines.push('<span class="good">pollinating:</span> ' + bb.billboards.length + ' billboard entries, wave ' + (bb.wave || '?'));
      // Pick a random billboard to surface
      var bbPick = bb.billboards[Math.floor(Math.random() * bb.billboards.length)];
      if (bbPick && bbPick.text) {
        var bbText = bbPick.text.substring(0, 60);
        lines.push('<span class="dim">"' + bbText + '..."</span>');
      }
    }

    // Sitemap awareness — check if chipmunk knows how many pages are indexed
    // (This is fetched periodically, not every cycle)
    if (!cache._sitemapCount) {
      cache._sitemapCount = 'checking';
      // Fetch sitemap counts asynchronously
      var sitemapUrls = [
        'https://sporeprint.primals.eco/sitemap.xml',
        'https://detroit.primals.eco/sitemap.xml',
        'https://hypothesis.primals.eco/sitemap.xml'
      ];
      var totalUrls = 0;
      var pending = sitemapUrls.length;
      sitemapUrls.forEach(function(url) {
        fetch(url).then(function(r) { return r.text(); }).then(function(xml) {
          var matches = xml.match(/<loc>/g);
          totalUrls += (matches ? matches.length : 0);
          pending--;
          if (pending === 0) {
            cache._sitemapCount = totalUrls;
          }
        }).catch(function() { pending--; });
      });
    } else if (typeof cache._sitemapCount === 'number') {
      lines.push('<span class="dim">indexed surface: ' + cache._sitemapCount + ' pages across 3 sites</span>');
    }

    addEntry('chipmunk', lines.join('\n'));
    bumpAttention(0.02);
  }




  // ═══ THOUGHT BUBBLES — chipmunk's inner sort on null entities ═══
  // Each thought is a hypothesis about a null entity.
  // It floats outward through π layers. If it survives → classification.
  // If it pops → inconclusive. What falls out = the inner sort.
  var thoughts = [];
  var MAX_THOUGHTS = Math.floor(PI * 3); // ~9 concurrent thoughts
  var thoughtLog = []; // settled thoughts (inner sort results)

  // Spawn thoughts periodically — one every few seconds
  setInterval(function() {
    if (cache && cache.scanSort) _mind('spawnThought');
  }, 4000);

  // Periodically report on the inner sort
  setInterval(function() {
    if (thoughtLog.length === 0) return;

    // Count settled classifications
    var counts = { self: 0, 'non-self': 0, partial: 0 };
    thoughtLog.forEach(function(t2) { counts[t2.hypothesis] = (counts[t2.hypothesis] || 0) + 1; });

    var total2 = thoughtLog.length;
    var lines2 = ['<span class="dim">inner sort on ' + total2 + ' null thoughts:</span>'];
    Object.keys(counts).forEach(function(k) {
      if (counts[k] > 0) {
        lines2.push('  ' + k + ': ' + counts[k] + ' (' + Math.round(counts[k] / total2 * 100) + '%)');
      }
    });

    addEntry('chipmunk', lines2.join('\n'));
  }, 120000); // every 2 minutes


  // ═══ GRAPH WALKER — chipmunk can trace paths through the network ═══
  var graphCache = { nodes: null, edges: null, adjList: null, lastFetch: 0 };

  function paintAttention() {
    if (!svgEl) return;
    // Clean old attention markers
    var oldMarkers = svgEl.querySelectorAll('.attn-marker');
    for (var ai = 0; ai < oldMarkers.length; ai++) {
      oldMarkers[ai].parentNode.removeChild(oldMarkers[ai]);
    }

    // Paint based on epitope tense — where is attention concentrated?
    if (!cache.chipmunk || !cache.chipmunk.membrane) return;
    cache.chipmunk.membrane.forEach(function(m) {
      var tense = m.metadata && m.metadata.epitope_tense;
      if (!tense) return;

      var cats = Object.keys(tense);
      var maxIs = 0, hotCat = null;
      cats.forEach(function(cat) {
        var isCount = tense[cat].is || 0;
        if (isCount > maxIs) { maxIs = isCount; hotCat = cat; }
      });

      if (hotCat && maxIs > 0) {
        // Paint a glow on the hottest category
        var CAT_ANGLES2 = {
          'INVESTIGATION': 0, 'MEMBRANE': PI/3, 'IMMUNE': 2*PI/3,
          'SCIENCE': PI, 'TOPOLOGY': 4*PI/3, 'OTHER': 5*PI/3
        };
        var angle = CAT_ANGLES2[hotCat];
        if (angle !== undefined) {
          var r = bodyRadius(PI2);
          var ax = MG.cx + r * Math.cos(angle - PI/2);
          var ay = MG.cy + r * Math.sin(angle - PI/2);
          var glow = el('circle', {
            cx: ax.toFixed(1), cy: ay.toFixed(1),
            r: Math.min(12, maxIs * 0.5).toFixed(1),
            fill: 'none', stroke: '#3fb950',
            'stroke-width': 0.5, opacity: 0.3,
            'class': 'attn-marker'
          }, svgEl);
        }
      }
    });
  }


  // ═══ LEARNING ENGINE — mimic, mirror, reflect ═══
  // Phase 1: MIMIC — watch patterns, build a model
  // Phase 2: MIRROR — act on the model, show what it sees
  // Phase 3: REFLECT — compare predictions to outcomes, adjust

  var learning = {
    phase: 'mimic',     // mimic → mirror → reflect
    sortHistory: [],    // past sort votes and outcomes
    braidMemory: {},    // braid states over time
    orbitPatterns: [],   // human orbit patterns observed
    predictions: [],    // chipmunk's own predictions
    correct: 0,         // prediction accuracy
    total: 0,
    confidence: 0,      // learned confidence (0-1)
    lastReflection: 0,  // timestamp of last reflection
    fleetMemory: {},    // fleet entity behavioral fingerprints over time
    fleetPatterns: [],  // observed non-life behavioral patterns
  };

  // ─── PHASE TRANSITIONS ───
  // mimic → mirror: after 5 minutes of observation with data
  // mirror → reflect: after making 5+ predictions
  function weaveBraids() {
    if (!svgEl) return;
    var b = cache.braid;
    if (!b || !b.braids) return;

    // Create or clear braid weave group
    if (_braidGroup) { _braidGroup.parentNode.removeChild(_braidGroup); }
    _braidGroup = el('g', { id: 'mg-braid-weave', opacity: 0.6 }, svgEl);

    var cx2 = MG.cx, cy2 = MG.cy;

    // Category → angle mapping (spread around the membrane)
    var CAT_ANGLES = {
      'INVESTIGATION': -PI/3,
      'MEMBRANE':       PI/6,
      'TOPOLOGY':       PI*2/3,
      'SCIENCE':        PI,
      'IMMUNE':        -PI*2/3,
      'OTHER':          PI*5/6
    };
    var CAT_COLORS = {
      'INVESTIGATION': '#e85d3a',
      'MEMBRANE':      '#5ab87a',
      'TOPOLOGY':      '#58a6ff',
      'SCIENCE':       '#a371f7',
      'IMMUNE':        '#d29922',
      'OTHER':         '#6e7681'
    };
    var TREND_OPACITY = {
      'growing': 0.5, 'emerging': 0.4, 'stable': 0.25, 'fading': 0.1, 'initial': 0.15
    };

    // ═══ 1. CATEGORY BRAIDS — thick arcs between sectors ═══
    var maxStr = 1;
    b.braids.forEach(function(br) { if (br.strength > maxStr) maxStr = br.strength; });

    b.braids.forEach(function(br, idx) {
      var a1 = CAT_ANGLES[br.from] || 0;
      var a2 = CAT_ANGLES[br.to] || PI;
      var r = bodyRadius(PI2) * 0.7;
      var thick = 0.5 + (br.strength / maxStr) * 3;
      var op = TREND_OPACITY[br.trend] || 0.2;
      var col = CAT_COLORS[br.from] || '#6e7681';

      // Quadratic bezier arc through center region
      var x1 = cx2 + r * Math.cos(a1);
      var y1 = cy2 + r * Math.sin(a1);
      var x2 = cx2 + r * Math.cos(a2);
      var y2 = cy2 + r * Math.sin(a2);
      var midA = (a1 + a2) / 2;
      var bulge = r * 0.3;
      var mx = cx2 + bulge * Math.cos(midA + PI/2);
      var my = cy2 + bulge * Math.sin(midA + PI/2);

      var path = el('path', {
        d: 'M ' + x1.toFixed(1) + ',' + y1.toFixed(1) +
           ' Q ' + mx.toFixed(1) + ',' + my.toFixed(1) +
           ' ' + x2.toFixed(1) + ',' + y2.toFixed(1),
        fill: 'none', stroke: col,
        'stroke-width': thick.toFixed(1),
        'stroke-opacity': op.toFixed(2),
        'stroke-dasharray': br.direction === 'bidirectional' ? '' : '6,4',
        'stroke-linecap': 'round',
        id: 'mg-cat-braid-' + idx
      }, _braidGroup);

      // Flow animation for growing braids
      if (br.trend === 'growing' || br.trend === 'emerging') {
        path.style.animation = 'none';
        path.setAttribute('stroke-dasharray', '8,4');
        path.setAttribute('stroke-dashoffset', '0');
      }

      // Braid label at midpoint
      el('text', {
        x: mx.toFixed(1), y: my.toFixed(1),
        fill: col, 'font-size': 3.5,
        'text-anchor': 'middle', opacity: op * 0.6,
        'font-family': '"Courier New",monospace'
      }, _braidGroup).textContent = br.humans_total + 'h';
    });

    // ═══ 2. SITE BRAIDS — interstitial threads ═══
    if (b.site_braids) {
      var siteAngles = {};
      CONTINENTS.forEach(function(c) { siteAngles[c.name.toLowerCase()] = c.angle; });

      // Add angles for sites not in CONTINENTS
      var knownSites = {
        'relay': 0.2, 'beacon': 0.4, 'layer2': 0.6, 'antigen': 0.8,
        'antibody': 1.0, 'macrophage': 1.3, 'epitope': 1.6,
        'lansing': 1.9, 'clutch': 2.2
      };
      for (var ks in knownSites) {
        if (!siteAngles[ks]) siteAngles[ks] = knownSites[ks];
      }

      b.site_braids.forEach(function(sb, idx) {
        var a1 = siteAngles[sb.site_a] || Math.random() * 2 * PI;
        var a2 = siteAngles[sb.site_b] || Math.random() * 2 * PI;
        var r1 = bodyRadius(PI3) * 0.75;
        var r2 = bodyRadius(PI3) * 0.8;
        var x1 = cx2 + r1 * Math.cos(a1);
        var y1 = cy2 + r1 * Math.sin(a1);
        var x2 = cx2 + r2 * Math.cos(a2);
        var y2 = cy2 + r2 * Math.sin(a2);
        var col = sb.cross_category ? '#a371f7' : '#484f58';
        var op = sb.cross_category ? 0.25 : 0.1;

        el('line', {
          x1: x1.toFixed(1), y1: y1.toFixed(1),
          x2: x2.toFixed(1), y2: y2.toFixed(1),
          stroke: col, 'stroke-width': 0.4 + sb.co_strength * 0.8,
          'stroke-opacity': op, 'stroke-dasharray': '2,3',
          id: 'mg-site-braid-' + idx
        }, _braidGroup);
      });
    }

    // ═══ 3. EPITOPE TRANSITIONS — radial braids through π layers ═══
    if (b.epitope_transitions) {
      var EP_DEPTH = {
        observer: 1, visitor: 1, reader: PI, witness: PI,
        coder: PI2, investigator: PI2, explorer: PI3, scholar: PI3
      };
      var EP_COLORS = {
        observer: '#8b949e', visitor: '#6e7681', reader: '#58a6ff',
        witness: '#4a8fb8', coder: '#79c0ff', investigator: '#f0883e',
        explorer: '#3fb950', scholar: '#a371f7'
      };

      b.epitope_transitions.forEach(function(et, idx) {
        var r1 = bodyRadius(EP_DEPTH[et.from_epitope] || PI);
        var r2 = bodyRadius(EP_DEPTH[et.to_epitope] || PI2);
        var angle = -PI/2 + idx * PI / 4;
        var x1 = cx2 + r1 * Math.cos(angle);
        var y1 = cy2 + r1 * Math.sin(angle);
        var x2 = cx2 + r2 * Math.cos(angle + 0.15);
        var y2 = cy2 + r2 * Math.sin(angle + 0.15);
        var col = EP_COLORS[et.to_epitope] || '#6e7681';
        var thick = 0.3 + (et.combined_humans / 30) * 1.5;

        // Curved path through layers
        var midR = (r1 + r2) / 2;
        var midAngle = angle + 0.08;
        var mx = cx2 + midR * 1.15 * Math.cos(midAngle);
        var my = cy2 + midR * 1.15 * Math.sin(midAngle);

        el('path', {
          d: 'M ' + x1.toFixed(1) + ',' + y1.toFixed(1) +
             ' Q ' + mx.toFixed(1) + ',' + my.toFixed(1) +
             ' ' + x2.toFixed(1) + ',' + y2.toFixed(1),
          fill: 'none', stroke: col,
          'stroke-width': thick.toFixed(1),
          'stroke-opacity': 0.2,
          'stroke-linecap': 'round',
          'stroke-dasharray': '3,2',
          id: 'mg-ep-trans-' + idx
        }, _braidGroup);

        // Arrow at destination
        el('circle', {
          cx: x2.toFixed(1), cy: y2.toFixed(1), r: 1.5,
          fill: col, opacity: 0.3
        }, _braidGroup);

        // Label
        el('text', {
          x: mx.toFixed(1), y: (my - 3).toFixed(1),
          fill: col, 'font-size': 3, opacity: 0.2,
          'text-anchor': 'middle',
          'font-family': '"Courier New",monospace'
        }, _braidGroup).textContent = et.from_epitope + '\u2192' + et.to_epitope + ' (' + et.combined_humans + ')';
      });
    }

    // ═══ 4. GRAPH SUMMARY — edge type distribution as ring segments ═══
    if (cache && cache.scanSort && cache.scanSort.scan) {
      var edgeTypes = cache.scanSort.scan.edge_types || {};
      var edgeKeys = Object.keys(edgeTypes).sort(function(a,b) { return edgeTypes[b] - edgeTypes[a]; });
      var totalEdges = 0;
      edgeKeys.forEach(function(k) { totalEdges += edgeTypes[k]; });

      if (totalEdges > 0) {
        var edgeR = bodyRadius(PI2) * 1.1;
        var startAngle = -PI/2;
        var EDGE_COLORS = [
          '#e85d3a','#58a6ff','#5ab87a','#a371f7','#d29922',
          '#f0883e','#79c0ff','#4a8fb8','#6e7681','#484f58'
        ];

        edgeKeys.slice(0, 8).forEach(function(key, idx) {
          var pct = edgeTypes[key] / totalEdges;
          var sweep = pct * 2 * PI;
          var endAngle = startAngle + sweep;
          var x1 = cx2 + edgeR * Math.cos(startAngle);
          var y1 = cy2 + edgeR * Math.sin(startAngle);
          var x2 = cx2 + edgeR * Math.cos(endAngle);
          var y2 = cy2 + edgeR * Math.sin(endAngle);
          var largeArc = sweep > PI ? 1 : 0;
          var col = EDGE_COLORS[idx % EDGE_COLORS.length];

          el('path', {
            d: 'M ' + x1.toFixed(1) + ',' + y1.toFixed(1) +
               ' A ' + edgeR.toFixed(1) + ',' + edgeR.toFixed(1) +
               ' 0 ' + largeArc + ' 1 ' +
               x2.toFixed(1) + ',' + y2.toFixed(1),
            fill: 'none', stroke: col,
            'stroke-width': 1.2,
            'stroke-opacity': 0.08,
            id: 'mg-edge-type-' + idx
          }, _braidGroup);

          // Label
          var midA = (startAngle + endAngle) / 2;
          el('text', {
            x: (cx2 + (edgeR + 8) * Math.cos(midA)).toFixed(1),
            y: (cy2 + (edgeR + 8) * Math.sin(midA)).toFixed(1),
            fill: col, 'font-size': 3, opacity: 0.12,
            'text-anchor': 'middle',
            'font-family': '"Courier New",monospace',
            transform: 'rotate(' + ((midA * 180 / PI) + 90).toFixed(0) + ',' +
              (cx2 + (edgeR + 8) * Math.cos(midA)).toFixed(1) + ',' +
              (cy2 + (edgeR + 8) * Math.sin(midA)).toFixed(1) + ')'
          }, _braidGroup).textContent = key + ' ' + edgeTypes[key];

          startAngle = endAngle;
        });
      }
    }
  }
  // Expose vis API
  window._chipmunkVis = {
    init: init,
    buildMembrane: buildMembrane,
    spawnBubble: spawnBubble,
    animate: animate,
    updateTransit: updateTransit,
    updateUnfurl: updateUnfurl,
    reverseView: reverseView,
    paintAttention: paintAttention,
    weaveBraids: weaveBraids,
    refs: function() { return { svgEl: svgEl, bubbleGroup: bubbleGroup, unfurlGroup: unfurlGroup }; },
  };
})();
