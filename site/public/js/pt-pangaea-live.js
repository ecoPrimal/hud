// pt-pangaea-live.js — bubble spawning, animation, data feeds, geo layer
// Split from pt-pangaea.js for module size. Reads shared context from window._ptPangaeaCtx.
(function() {
  'use strict';
  var _ = window._ptPangaeaCtx;
  if (!_) { console.warn('pt-pangaea-live: no shared context'); return; }

  var el = _.el, PI = _.PI, PI2 = _.PI2, PI3 = _.PI3, NS = _.NS;
  var BODIES = _.BODIES, CONTINENTS = _.CONTINENTS, EPITOPE_DEPTH = _.EPITOPE_DEPTH;
  var SORT_COLORS = _.SORT_COLORS, MAX_BUBBLES = _.MAX_BUBBLES;
  var bodyRadius = _.bodyRadius;
  var bubbles = _.bubbles;

  // ═══ BUBBLE SPAWNING — real data unfurling through π layers ═══
  function spawnBubble() {
    if (bubbles.length >= MAX_BUBBLES) return;

    var targetR = bodyRadius(PI3) * 0.85;
    var angle, color, size, speed, sortClass;

    if (_.sortData && _.sortData.sort && Math.random() < 0.7) {
      // Spawn from real sort data — entity unfurling
      var u = _.sortData.sort.unified_sort || {};
      var roll = Math.random();
      var total = (u.self || 0) + (u.non_self || 0) + (u.partial || 0) + (u.null || 0);
      if (total === 0) total = 1;

      // Pick sort class weighted by actual counts
      var selfP = (u.self || 0) / total;
      var nonSelfP = (u.non_self || 0) / total;
      var partialP = (u.partial || 0) / total;

      if (roll < selfP) {
        sortClass = 'self';
      } else if (roll < selfP + nonSelfP) {
        sortClass = 'non-self';
      } else if (roll < selfP + nonSelfP + partialP) {
        sortClass = 'partial';
      } else {
        sortClass = 'null';
      }

      color = SORT_COLORS[sortClass];
      // Self entities move deliberately, non-self bounce off faster
      speed = sortClass === 'self' ? (6 + Math.random() * 8) :
              sortClass === 'non-self' ? (15 + Math.random() * 20) :
              (8 + Math.random() * 12);
      // Self gets bigger, non-self stays small and fast
      size = sortClass === 'self' ? (1.2 + Math.random() * 1.5) :
             sortClass === 'non-self' ? (0.5 + Math.random() * 0.6) :
             (0.8 + Math.random() * 1.0);
      // Non-self doesn't reach the surface — it bounces at π² or π
      if (sortClass === 'non-self') {
        targetR = bodyRadius(PI + Math.random() * PI); // stops between π and π²
      } else if (sortClass === 'null') {
        targetR = bodyRadius(PI2 * 0.5); // null fades early
      }
      angle = Math.random() * 2 * PI;
    } else {
      // Continent-directed bubble (original behavior)
      var cont = CONTINENTS[Math.floor(Math.random() * CONTINENTS.length)];
      angle = cont.angle + (Math.random() - 0.5) * 0.4;
      color = cont.color;
      speed = 8 + Math.random() * 15;
      size = 0.8 + Math.random() * 1.2;
      sortClass = 'unknown';
    }

    bubbles.push({
      angle: angle,
      r: 2 + Math.random() * 3,
      targetR: targetR,
      speed: speed,
      color: color,
      size: size,
      opacity: 0,
      sortClass: sortClass,
      trust: 0.5,        // starts as maybe (0=unknown, 0.5=maybe, 1=certain)
      lastSwept: 0,      // timestamp of last hand sweep
      el: null
    });
  }

  // ═══ ANIMATION — bubbles rise through π layers ═══
  function animate(now) {
    if (!_.built || !_.bubbleGroup) {
      requestAnimationFrame(animate);
      return;
    }
    try {

    var dt = _.lastFrame ? (now - _.lastFrame) / 1000 : 0.016;
    if (dt > 0.1) dt = 0.1;
    _.lastFrame = now;

    // Spawn new bubbles
    if (Math.random() < dt * 3) spawnBubble();

    // Animate planets — celestial bodies orbit
    if (_.svgGroup && _.svgGroup._planets) {
      _.svgGroup._planets.forEach(function(p, i) {
        var planet = document.getElementById('mg-planet-' + i);
        if (planet) {
          var orbitR = _.R * p.r;
          var angle = (now / 1000) * p.speed * 0.1;
          planet.setAttribute('cx', (_.cx + orbitR * Math.cos(angle)).toFixed(1));
          planet.setAttribute('cy', (_.cy + orbitR * Math.sin(angle)).toFixed(1));
        }
      });
    }


    // ═══ CLOCK HANDS — sweep and trust gradient ═══
    try {
    if (_.svgGroup && _.svgGroup._hands) {
      var t = now / 1000;
      // Find rest position (where no hand is — the gap)
      var handAngles = [];

      _.svgGroup._hands.forEach(function(h, i) {
        // Each hand sweeps at its own speed
        // Scan: 1 revolution per minute (like seconds hand)
        // Sort: golden ratio slower (like minute hand)
        // Connect: golden ratio² slower (like hour hand)
        var angle = t * h.speed * 0.1 + h.offset;
        handAngles.push(angle);

        var handEl = document.getElementById('mg-hand-' + h.name);
        if (handEl) {
          var endX = _.cx + _.handLen * Math.sin(angle);
          var endY = _.cy - _.handLen * Math.cos(angle);
          handEl.setAttribute('x2', endX.toFixed(1));
          handEl.setAttribute('y2', endY.toFixed(1));
        }

        // Trust cone: wedge of awareness around the hand
        var trustEl = document.getElementById('mg-trust-' + h.name);
        if (trustEl) {
          var spread = PI / 6; // 30° awareness cone
          var a1 = angle - spread;
          var a2 = angle + spread;
          var r = _.handLen;
          var x1 = _.cx + r * Math.sin(a1);
          var y1 = _.cy - r * Math.cos(a1);
          var x2 = _.cx + r * Math.sin(a2);
          var y2 = _.cy - r * Math.cos(a2);
          trustEl.setAttribute('d',
            'M ' + _.cx + ',' + _.cy +
            ' L ' + x1.toFixed(1) + ',' + y1.toFixed(1) +
            ' A ' + r.toFixed(1) + ',' + r.toFixed(1) + ' 0 0 1 ' +
            x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z'
          );
        }
      });

      // Rest label: place in the gap (the quadrant farthest from all hands)
      var restLabel = document.getElementById('mg-rest-label');
      if (restLabel && handAngles.length === 3) {
        // Find the angle farthest from all 3 hands
        var bestAngle = 0, bestDist = 0;
        for (var probe = 0; probe < 12; probe++) {
          var pa = probe * PI / 6;
          var minD = PI;
          for (var hi = 0; hi < 3; hi++) {
            var diff = Math.abs(((pa - handAngles[hi]) % (2*PI) + 3*PI) % (2*PI) - PI);
            if (diff < minD) minD = diff;
          }
          if (minD > bestDist) { bestDist = minD; bestAngle = pa; }
        }
        var restR = _.handLen * 0.5;
        var restX = _.cx + restR * Math.sin(bestAngle);
        var restY = _.cy - restR * Math.cos(bestAngle);
        restLabel.setAttribute('x', restX.toFixed(1));
        restLabel.setAttribute('y', restY.toFixed(1));
        // Rest label pulses gently — it's where new data arrives
        restLabel.setAttribute('opacity', (0.08 + 0.04 * Math.sin(t * 2)).toFixed(3));
      }

      // ═══ CLOCK SORTING — trust collapse + inward pull ═══
      // 3 of 4 quadrants are "working" — where the hands sweep
      // The 4th is "at rest" — receiving zone
      // Trust: when a hand sweeps past a bubble, trust collapses
      //   far from hand → trust decays toward 0.5 (maybe/likely)
      //   hand passes → trust jumps to 1.0 (certain! observed!)
      //   then fades back to maybe as hand moves on
      // Large certain drops are pulled inward (toward center/compression)
      bubbles.forEach(function(b) {
        var nearestHandDist = PI;
        for (var hi = 0; hi < handAngles.length; hi++) {
          var angleDiff = Math.abs(((b.angle - handAngles[hi]) % (2*PI) + 3*PI) % (2*PI) - PI);
          if (angleDiff < nearestHandDist) nearestHandDist = angleDiff;

          // Hand sweep collapse: hand passes within 15° → trust collapses to certain
          if (angleDiff < PI/12) {
            b.trust = 1.0;
            b.lastSwept = t;
            // Self confirmed by observation — grows
            if (b.sortClass === 'self') b.size *= 1.005;
            // Non-self exposed — shrinks faster
            if (b.sortClass === 'non-self') b.speed *= 1.03;
          }
        }

        // Trust decay: certain→maybe over ~3s (π seconds)
        var sinceSweep = t - (b.lastSwept || 0);
        if (sinceSweep > 0.1) {
          b.trust = 0.5 + (b.trust - 0.5) * Math.exp(-sinceSweep / PI);
        }

        // Visual: trust affects opacity and size perception
        // Certain bubbles are vivid; maybe bubbles are ghostly
        var trustMod = 0.3 + b.trust * 0.7;
        b.opacity *= trustMod;

        // Inward pull: large + certain → compressed toward center
        if (b.trust > 0.8 && b.size > 1.2) {
          b.speed *= 0.98;  // slowed (pulled back)
        }

        // Rest zone: bubbles in the gap drift freely outward
        if (nearestHandDist > PI/3) {
          b.speed *= 1.002; // slightly faster in the rest zone
        }
      });
    }

    } catch(clockErr) { /* clock error - rAF continues */ }

    // Update ring pulse based on human data
    if (_.humanData && _.humanData.energy) {
      var energyIn = (_.humanData.energy.energy_in || 0) / 100;
      var nullRing = document.getElementById('mg-null-center');
      if (nullRing) {
        var pulse = 2 + Math.sin(now / 1000) * energyIn * 2;
        nullRing.setAttribute('r', pulse.toFixed(1));
        nullRing.setAttribute('opacity', (0.15 + energyIn * 0.2).toFixed(2));
      }
    }

    // Animate bubbles
    var remove = [];
    bubbles.forEach(function(b, i) {
      b.r += b.speed * dt;

      // Opacity: fade in near center, hold in middle, fade out at surface
      var progress = b.r / b.targetR;
      if (progress < 0.1) {
        b.opacity = progress / 0.1 * 0.6;
      } else if (progress > 0.85) {
        b.opacity = (1 - progress) / 0.15 * 0.6;
      } else {
        b.opacity = 0.6;
      }

      // Crossing a π-body boundary: the sort happens HERE
      var bodyRadii = [bodyRadius(1), bodyRadius(PI), bodyRadius(PI2)];
      bodyRadii.forEach(function(br) {
        if (Math.abs(b.r - br) < 3) {
          b.opacity = Math.min(1, b.opacity + 0.3);
          // Self grows through each boundary (recognized, let through)
          if (b.sortClass === 'self') {
            b.size *= 1.02;
          }
          // Non-self shrinks (rejected by each layer)
          if (b.sortClass === 'non-self') {
            b.size *= 0.95;
            b.speed *= 1.1; // accelerates — being pushed out
          }
          // Partial flickers between colors at boundaries
          if (b.sortClass === 'partial') {
            b.opacity = 0.3 + Math.random() * 0.5;
          }
        }
      });

      if (b.r >= b.targetR) {
        remove.push(i);
        if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
        return;
      }

      var x = _.cx + b.r * Math.cos(b.angle);
      var y = _.cy + b.r * Math.sin(b.angle);

      if (!b.el) {
        b.el = el('circle', {
          fill: b.color, r: b.size.toFixed(1)
        }, _.bubbleGroup);
      }
      b.el.setAttribute('cx', x.toFixed(1));
      b.el.setAttribute('cy', y.toFixed(1));
      b.el.setAttribute('opacity', b.opacity.toFixed(2));
      b.el.setAttribute('r', b.size.toFixed(1));
    });


    for (var i = remove.length - 1; i >= 0; i--) {
      bubbles.splice(remove[i], 1);
    }

    } catch(animErr) { window.__pangaeaErr = (window.__pangaeaErr || '') + animErr.message + ' at ' + (animErr.stack || '').split('\n')[1] + '; '; }
    requestAnimationFrame(animate);
  }

  // ═══ HUMAN DATA FEED — update from human.json ═══
  function updateHumans(data) {
    _.humanData = data;
    if (!_.built || !data || !data.epitopes) return;

    // Place human epitope counts at their depth layers
    var pangaeaG = document.getElementById('mg-pangaea-continents');
    if (!pangaeaG) return;

    // Remove old epitope markers
    var old = pangaeaG.querySelectorAll('.mg-human-ep');
    for (var i = 0; i < old.length; i++) {
      old[i].parentNode.removeChild(old[i]);
    }

    var epKeys = Object.keys(data.epitopes);
    var angleStep = (2 * PI) / Math.max(epKeys.length, 1);

    epKeys.forEach(function(name, idx) {
      var info = data.epitopes[name];
      var depth = EPITOPE_DEPTH[name] || 1;
      var r = bodyRadius(depth);
      var angle = idx * angleStep + PI / 6;

      var x = _.cx + r * Math.cos(angle);
      var y = _.cy + r * Math.sin(angle);

      var ECOLORS = {
        explorer: '#3fb950', scholar: '#a371f7', investigator: '#f0883e',
        reader: '#58a6ff', coder: '#79c0ff', witness: '#d29922',
        observer: '#8b949e', visitor: '#6e7681'
      };
      var color = ECOLORS[name] || '#6e7681';

      var g = el('g', { 'class': 'mg-human-ep' }, pangaeaG);

      el('circle', {
        cx: x.toFixed(1), cy: y.toFixed(1),
        r: Math.min(6, 2 + info.count * 0.3).toFixed(1),
        fill: color, opacity: 0.3, filter: 'url(#mg-glow)'
      }, _.svgGroup);

      el('text', {
        x: x.toFixed(1), y: (y - 5).toFixed(1),
        fill: color, 'font-size': 5.5,
        'text-anchor': 'middle', opacity: 0.5,
        'font-family': '"Courier New",monospace'
      }, g).textContent = name + ' (' + info.count + ')';
    });
  }

  // ═══ UNFURL UPDATE — render the sort state inside the membrane ═══
  function updateUnfurl(data) {
    _.sortData = data;
    if (!_.built || !_.unfurlGroup || !data || !data.sort) return;

    // Clear old unfurl elements
    var old = _.unfurlGroup.querySelectorAll('.mg-unfurl-el');
    for (var i = 0; i < old.length; i++) {
      old[i].parentNode.removeChild(old[i]);
    }

    var u = data.sort.unified_sort || {};
    var total = (u.self || 0) + (u.non_self || 0) + (u.partial || 0) + (u.null || 0);
    if (total === 0) return;

    // Draw sort arcs at each π-body ring
    // At ring 1 (ghost): everything is mixed
    // At ring π (celestial): patterns emerge — some sorted
    // At ring π² (geodesic): connections clear — mostly sorted
    // At ring π³ (surface): fully sorted

    var rings = [
      { body: 1,   sorted: 0.2, label: 'scanning...' },
      { body: PI,  sorted: 0.5, label: 'sweeping...' },
      { body: PI2, sorted: 0.8, label: 'sorting...' },
      { body: PI3, sorted: 1.0, label: 'sorted' },
    ];

    rings.forEach(function(ring, ri) {
      var r = bodyRadius(ring.body);
      var sortPct = ring.sorted;

      // Self arc (green) — grows at each ring
      var selfFrac = (u.self || 0) / total * sortPct;
      if (selfFrac > 0.001) {
        var selfAngle = selfFrac * 2 * PI;
        var startA = -PI / 2;
        var endA = startA + selfAngle;
        var sx = _.cx + r * Math.cos(startA);
        var sy = _.cy + r * Math.sin(startA);
        var ex = _.cx + r * Math.cos(endA);
        var ey = _.cy + r * Math.sin(endA);
        var large = selfAngle > PI ? 1 : 0;
        var g = el('path', {
          d: 'M ' + sx.toFixed(1) + ' ' + sy.toFixed(1) +
             ' A ' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 ' + large + ' 1 ' +
             ex.toFixed(1) + ' ' + ey.toFixed(1),
          fill: 'none', stroke: SORT_COLORS.self,
          'stroke-width': 2 + ri, 'stroke-opacity': 0.15 + ri * 0.05,
          'class': 'mg-unfurl-el'
        }, _.unfurlGroup);
      }

      // Non-self arc (red) — shrinks at each ring (rejected)
      var nonSelfFrac = (u.non_self || 0) / total * (1 - sortPct * 0.8);
      if (nonSelfFrac > 0.001 && ri < 3) {
        var nsAngle = nonSelfFrac * 2 * PI;
        var nsStart = PI / 2;
        var nsEnd = nsStart + nsAngle;
        var nsx = _.cx + r * Math.cos(nsStart);
        var nsy = _.cy + r * Math.sin(nsStart);
        var nex = _.cx + r * Math.cos(nsEnd);
        var ney = _.cy + r * Math.sin(nsEnd);
        var nsLarge = nsAngle > PI ? 1 : 0;
        el('path', {
          d: 'M ' + nsx.toFixed(1) + ' ' + nsy.toFixed(1) +
             ' A ' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 ' + nsLarge + ' 1 ' +
             nex.toFixed(1) + ' ' + ney.toFixed(1),
          fill: 'none', stroke: SORT_COLORS['non-self'],
          'stroke-width': Math.max(0.5, 3 - ri), 'stroke-opacity': 0.12 - ri * 0.02,
          'class': 'mg-unfurl-el'
        }, _.unfurlGroup);
      }
    });

    // Sort quality indicator at center
    var conf = (data.sort.sort_quality || 0);
    var confCircle = document.getElementById('mg-null-center');
    if (confCircle) {
      confCircle.setAttribute('fill', conf > 0.85 ? '#3fb950' : conf > 0.7 ? '#f0883e' : '#e85d3a');
    }

    // Sweep patterns — show as faint radial marks
    var patterns = (data.sweep || {}).patterns || [];
    patterns.forEach(function(p, pi) {
      if (pi > 5) return;
      var pAngle = PI + pi * 0.5;
      var pR1 = bodyRadius(1) * 0.8;
      var pR2 = bodyRadius(PI3) * 0.7;
      el('line', {
        x1: (_.cx + pR1 * Math.cos(pAngle)).toFixed(1),
        y1: (_.cy + pR1 * Math.sin(pAngle)).toFixed(1),
        x2: (_.cx + pR2 * Math.cos(pAngle)).toFixed(1),
        y2: (_.cy + pR2 * Math.sin(pAngle)).toFixed(1),
        stroke: '#58a6ff', 'stroke-width': 0.3,
        'stroke-opacity': 0.06, 'stroke-dasharray': '1,4',
        'class': 'mg-unfurl-el'
      }, _.unfurlGroup);
    });
  }

  // ═══ GEOGRAPHIC INTRA-LAYER — geo signals on the geodesic ring ═══
  // Geography is an intra-membrane layer: substrate, not ionosphere.
  // Countries map onto angles around the π² (geodesic) ring.
  // Michigan (membrane beacon) sits at angle 0. Signals arc inward.
  var ionoGroup = null;

  // Country code → [longitude, latitude] (same as pt-ionosphere.js POS)
  var GEO_POS = {
    US:[-98,38],CN:[-104,35],IE:[-8,53],BY:[28,53],GB:[-2,54],
    DE:[10,51],FR:[2,46],JP:[138,36],IN:[78,22],BR:[-51,-10],
    RU:[100,60],AU:[134,-25],CA:[-106,56],KR:[127,36],SG:[104,1],
    NL:[5,52],SE:[16,62],FI:[26,64],NO:[10,62],IL:[35,31],
    HK:[114,22],TW:[121,24],UA:[32,49],PL:[20,52],ES:[-4,40],
    IT:[12,42],CH:[8,47],AT:[14,47],BE:[4,51],DK:[10,56],
    MX:[-102,23],AR:[-64,-34],CL:[-71,-35],CO:[-74,4],ZA:[26,-29],
    NG:[8,10],KE:[38,0],EG:[31,27],AE:[54,24],SA:[45,24],
    TR:[35,39],GR:[22,39],CZ:[15,50],RO:[25,46],HU:[19,47],
    'IE/US':[-40,48]
  };

  // Longitude to ring angle: -180..180 → 0..2π, offset so Michigan (-83°) = 0
  function lonToAngle(lon) {
    return ((lon + 83) / 360) * 2 * PI;
  }

  function updateIonosphere(geo) {
    if (!_.built || !_.svgGroup || !geo || !geo.length) return;

    if (!ionoGroup) {
      ionoGroup = el('g', { id: 'mg-pangaea-iono' }, _.svgGroup);
    }
    ionoGroup.innerHTML = '';

    // Geography sits on the geodesic (π²) ring — intra-membrane, not ionosphere
    var geoR = bodyRadius(PI2);
    var ionoR = geoR * 1.02;
    var tot = 0;
    geo.forEach(function(g) { tot += (g.requests || 0); });
    if (tot === 0) return;

    // Michigan beacon at angle 0 — on the geodesic ring
    var mAngle = 0;
    var mx = _.cx + geoR * Math.cos(mAngle);
    var my = _.cy + geoR * Math.sin(mAngle);

    el('circle', {
      cx: mx.toFixed(1), cy: my.toFixed(1), r: 4,
      fill: '#5ab87a', opacity: 0.35, filter: 'url(#mg-glow)',
      id: 'mg-iono-beacon'
    }, ionoGroup);

    geo.forEach(function(g) {
      if (g.country === '??' || !g.requests) return;
      var pct = g.requests / tot;
      if (pct < 0.005) return;

      var pos = GEO_POS[g.country];
      if (!pos) return;

      var angle = lonToAngle(pos[0]);
      var dx = _.cx + ionoR * Math.cos(angle);
      var dy = _.cy + ionoR * Math.sin(angle);

      var dotR = Math.max(1.5, Math.min(5, Math.sqrt(pct) * 12));
      var color = pct > 0.3 ? '#e85d3a' : pct > 0.1 ? '#f1c40f' : '#4a8fb8';

      // Signal arc from beacon to country — curves inward through the celestial (π) layer
      var midAngle = mAngle + (angle - mAngle) * 0.5;
      if (Math.abs(angle - mAngle) > PI) {
        midAngle = mAngle + (angle - mAngle + (angle > mAngle ? -2*PI : 2*PI)) * 0.5;
      }
      var arcR = bodyRadius(PI) * (0.7 + pct * 0.2);
      var amx = _.cx + arcR * Math.cos(midAngle);
      var amy = _.cy + arcR * Math.sin(midAngle);

      el('path', {
        d: 'M ' + mx.toFixed(1) + ' ' + my.toFixed(1) +
           ' Q ' + amx.toFixed(1) + ' ' + amy.toFixed(1) +
           ' ' + dx.toFixed(1) + ' ' + dy.toFixed(1),
        fill: 'none', stroke: color,
        'stroke-width': (0.3 + pct * 2).toFixed(1),
        'stroke-opacity': (0.06 + pct * 0.15).toFixed(2),
        'stroke-dasharray': '2,4'
      }, ionoGroup);

      // Country dot on geodesic ring (intra-membrane)
      el('circle', {
        cx: dx.toFixed(1), cy: dy.toFixed(1),
        r: dotR.toFixed(1), fill: color,
        opacity: (0.2 + pct * 0.4).toFixed(2)
      }, ionoGroup);

      // Label significant countries
      if (pct > 0.02) {
        var labelR = ionoR + 8;
        var lx = _.cx + labelR * Math.cos(angle);
        var ly = _.cy + labelR * Math.sin(angle);
        el('text', {
          x: lx.toFixed(1), y: ly.toFixed(1),
          fill: '#6e7681', 'font-size': 4.5,
          'text-anchor': 'middle', opacity: 0.4,
          'font-family': '"Courier New",monospace'
        }, ionoGroup).textContent = g.country;
      }
    });
  }

  // ═══ FETCH LOOP — sync with membrane breath ═══
  function fetchHumans() {
    fetch('/human.json', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(d) { updateHumans(d); })
      .catch(function() {});
  }

  function fetchIonosphere() {
    fetch('/dashboard.json', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.geography) updateIonosphere(d.geography);
      })
      .catch(function() {});
  }

  function fetchScanSort() {
    fetch('/scan_sweep_sort.json', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(d) { updateUnfurl(d); })
      .catch(function() {});
  }

  // ═══ HOOK INTO MEMBRANE BUILD ═══
  var origBuild = window._membraneBuild;
  if (origBuild) {
    window._membraneBuild = function(mc) {
      origBuild(mc);
      // Use membrane geometry from the shared context
      if (mc && mc.MG) {
        _.cx = mc.MG._.cx; _.cy = mc.MG._.cy; _.R = mc.MG.R;
      }
      var host = document.getElementById('membrane-focal-svg');
      if (host) {
        var svg = host.querySelector('svg');
        if (svg) {
          _._mc = mc;  // store for build() access
          build(svg);
          requestAnimationFrame(animate);
          if (!window._pangaeaPolling) {
            window._pangaeaPolling = true;
            // pi-bus: subscribe to shared channels (no duplicate fetches)
            if (window._piBus) {
              window._piBus.sub('/human.json', function(d) { updateHumans(d); }, 'medium');
              window._piBus.sub('/dashboard.json', function(d) { if (d && d.geography) updateIonosphere(d.geography); }, 'fast');
              window._piBus.sub('/scan_sweep_sort.json', function(d) { updateUnfurl(d); }, 'slow');
            } else {
              setTimeout(fetchHumans, 2000);
              setTimeout(fetchIonosphere, 3000);
              setTimeout(fetchScanSort, 4000);
              setInterval(fetchHumans, 30000);
              setInterval(fetchIonosphere, 30000);
              setInterval(fetchScanSort, 60000);
            }
          }
        }
      }
    };
  }

  // Extend PtPangaea with live functions
  var pp = window.PtPangaea || {};
  pp.animate = animate;
  pp.updateHumans = updateHumans;
  pp.updateIonosphere = updateIonosphere;
  pp.updateUnfurl = updateUnfurl;
  window.PtPangaea = pp;
})();
