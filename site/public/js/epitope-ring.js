// epitope-ring.js — the eye. A stabilized topology on other topologies.
// IS (pupil) spins fastest. NEARBY (iris) counter-rotates. WAS (sclera) drifts.
// When green and blue align → focus. Photons enter the red dotted cornea.
// Complexity increases spin. The difference between in and out IS relative speed.
// Passages as chord lines between epitopes.
// Fleet count as the outer halo. Billboard text orbits the ring.
// Can render standalone (in #d-presence) OR injected into the membrane SVG.
(function() {
  'use strict';
  var _m = window._membrane || {};
  var svgNS = 'http://www.w3.org/2000/svg';
  var el = _m.el || function(tag,a,p){var e=document.createElementNS(svgNS,tag);if(a)Object.keys(a).forEach(function(k){e.setAttribute(k,a[k]);});if(p)p.appendChild(e);return e;};

  var PI = Math.PI;
  var TAU = PI * 2;

  var EP_COLORS = {
    MEMBRANE:'#3fb950', INVESTIGATION:'#f0883e', IMMUNE:'#a371f7',
    TOPOLOGY:'#58a6ff', SCIENCE:'#79c0ff', SIGNAL:'#d2a8ff',
    OTHER:'#6e7681', UNKNOWN:'#484f58'
  };

  var SORT_COLORS = {
    'self': '#3fb950', 'non-self': '#e85d3a', 'partial': '#f0883e', 'null': '#484f58'
  };

  var EP_ORDER = ['MEMBRANE','INVESTIGATION','IMMUNE','TOPOLOGY','SCIENCE','SIGNAL','OTHER'];



  function polarToCart(cx, cy, r, angleRad) {
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  }

  function arcPath(cx, cy, r, startAngle, endAngle) {
    var s = polarToCart(cx, cy, r, startAngle);
    var e = polarToCart(cx, cy, r, endAngle);
    var largeArc = (endAngle - startAngle) > PI ? 1 : 0;
    return 'M ' + s.x.toFixed(1) + ' ' + s.y.toFixed(1) +
           ' A ' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 ' + largeArc + ' 1 ' +
           e.x.toFixed(1) + ' ' + e.y.toFixed(1);
  }

  // Create standalone ring SVG (for #d-presence card)
  function ensureRingSvg() {
    var existing = document.getElementById('epitope-ring-svg');
    if (existing) { existing.innerHTML = ''; return existing; }
    var container = document.getElementById('d-presence');
    if (!container) return null;
    var svg = document.createElementNS(svgNS, 'svg');
    svg.id = 'epitope-ring-svg';
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.setAttribute('width', '100%');
    svg.setAttribute('style', 'max-width:400px;margin:0 auto;display:block');
    return svg;
  }

  // ─── Core ring renderer ───
  // opts: { cx, cy, rIS, rNearby, rWas, rFleet, rLabel, group, fontSize, showCenter, showLegend }
  // If group is provided, renders INTO that SVG group (membrane injection).
  // Otherwise creates a standalone SVG in #d-presence.
  function renderRing(presence, dashboard, scanSort, opts) {
    opts = opts || {};
    var cx = opts.cx || 200, cy = opts.cy || 200;
    var rInner  = opts.rIS     || 60;
    var rMiddle = opts.rNearby || 100;
    var rOuter  = opts.rWas    || 140;
    var rFleet  = opts.rFleet  || 170;
    var rLabel  = opts.rLabel  || 155;
    var fontSize = opts.fontSize || 9;
    var showCenter = opts.showCenter !== false;
    var showLegend = opts.showLegend !== false;

    var svg;
    if (opts.group) {
      // Injected mode: render into provided SVG group
      svg = opts.group;
      svg.innerHTML = '';
    } else {
      svg = ensureRingSvg();
      if (!svg) return null;
    }

    var et = presence.epitope_tense || {};
    var eg = presence.epitope_gravity || {};
    var passages = presence.passages || [];

    // Calculate total gravity for proportional arcs
    var totalGravity = 0;
    EP_ORDER.forEach(function(ep) {
      totalGravity += (eg[ep] ? eg[ep].count : 0) + 1;
    });

    // Assign angles proportional to gravity
    var angles = {};
    var gapAngle = 0.04;
    var usableAngle = TAU - gapAngle * EP_ORDER.length;
    var currentAngle = -PI / 2;

    EP_ORDER.forEach(function(ep) {
      var gravity = (eg[ep] ? eg[ep].count : 0) + 1;
      var arcAngle = (gravity / totalGravity) * usableAngle;
      angles[ep] = {
        start: currentAngle,
        end: currentAngle + arcAngle,
        mid: currentAngle + arcAngle / 2
      };
      currentAngle += arcAngle + gapAngle;
    });

    // Background circle
    el('circle', {
      cx: cx, cy: cy, r: rOuter + 5,
      fill: 'none', stroke: '#161b22', 'stroke-width': '1'
    }, svg);

    // ── Sort state ring (outermost, behind everything) ──
    if (scanSort) {
      var sortG = el('g', { opacity: '0.25', id: 'ring-sort-state' }, svg);
      var sc = scanSort.sort || scanSort.summary || {};
      var de = sc.detroit_entities || {};
      var sortTotal = (de.self || 0) + (de['non-self'] || 0) + (de.partial || 0) + (de['null'] || 0);
      if (sortTotal > 0) {
        var rSort = rOuter + 12;
        var sortAngle = -PI / 2;
        ['self', 'non-self', 'partial', 'null'].forEach(function(cls) {
          var count = de[cls] || 0;
          if (count === 0) return;
          var span = (count / sortTotal) * TAU;
          el('path', {
            d: arcPath(cx, cy, rSort, sortAngle, sortAngle + span),
            fill: 'none',
            stroke: SORT_COLORS[cls] || '#484f58',
            'stroke-width': '4',
            'stroke-linecap': 'round',
            opacity: '0.7'
          }, sortG);
          // Label at midpoint
          var mid = polarToCart(cx, cy, rSort + 8, sortAngle + span / 2);
          el('text', {
            x: mid.x.toFixed(1), y: mid.y.toFixed(1),
            fill: SORT_COLORS[cls] || '#484f58',
            'font-size': Math.max(5, fontSize - 3), 'font-family': 'monospace',
            'text-anchor': 'middle', opacity: '0.6'
          }, sortG).textContent = cls.replace('non-', '¬') + ' ' + count;
          sortAngle += span;
        });
      }
    }

    // ── WAS ring (outer) — sclera, structural memory ──
    // Spins slowest. The difference between layers IS relative speed.
    var wasGroup = el('g', { opacity: '0.4' }, svg);
    wasGroup.setAttribute('class', 'ring-was');
    wasGroup.style.transformOrigin = cx + 'px ' + cy + 'px';
    EP_ORDER.forEach(function(ep) {
      var a = angles[ep];
      var t = et[ep] || {};
      var wasCount = t.was || 0;
      if (typeof wasCount === 'object') wasCount = wasCount.humans || wasCount.count || 0;
      if (wasCount === 0) return;
      var thickness = Math.max(2, Math.min(12, wasCount * 0.5));
      el('path', {
        d: arcPath(cx, cy, rOuter, a.start, a.end),
        fill: 'none', stroke: EP_COLORS[ep] || '#6e7681',
        'stroke-width': thickness.toFixed(1), 'stroke-linecap': 'round', opacity: '0.5'
      }, wasGroup);
    });

    // ── NEARBY ring (middle) — iris, aperture control ──
    // Spins at medium rate. When aligned with IS → focus event.
    var nearbyGroup = el('g', { opacity: '0.7' }, svg);
    nearbyGroup.setAttribute('class', 'ring-nearby');
    nearbyGroup.style.transformOrigin = cx + 'px ' + cy + 'px';
    EP_ORDER.forEach(function(ep) {
      var a = angles[ep];
      var t = et[ep] || {};
      var nearbyCount = t.nearby || 0;
      if (typeof nearbyCount === 'object') nearbyCount = nearbyCount.humans || nearbyCount.count || 0;
      if (nearbyCount === 0) return;
      var thickness = Math.max(3, Math.min(14, nearbyCount * 1.2));
      el('path', {
        d: arcPath(cx, cy, rMiddle, a.start, a.end),
        fill: 'none', stroke: EP_COLORS[ep] || '#6e7681',
        'stroke-width': thickness.toFixed(1), 'stroke-linecap': 'round', opacity: '0.7'
      }, nearbyGroup);
    });

    // ── IS ring (inner) — pupil, sharpest focus ──
    // Spins fastest. Complexity increases spin rate.
    var isGroup = el('g', {}, svg);
    isGroup.setAttribute('class', 'ring-is');
    isGroup.style.transformOrigin = cx + 'px ' + cy + 'px';
    EP_ORDER.forEach(function(ep) {
      var a = angles[ep];
      var t = et[ep] || {};
      var isCount = t.is || 0;
      if (typeof isCount === 'object') isCount = isCount.humans || isCount.count || 0;
      if (isCount === 0) return;
      var thickness = Math.max(4, Math.min(16, isCount * 2));
      el('path', {
        d: arcPath(cx, cy, rInner, a.start, a.end),
        fill: 'none', stroke: EP_COLORS[ep] || '#6e7681',
        'stroke-width': thickness.toFixed(1), 'stroke-linecap': 'round', opacity: '1'
      }, isGroup);
      var mid = polarToCart(cx, cy, rInner, a.mid);
      var pulse = el('circle', {
        cx: mid.x.toFixed(1), cy: mid.y.toFixed(1), r: '4',
        fill: EP_COLORS[ep] || '#6e7681', opacity: '0.9'
      }, isGroup);
      el('animate', {
        attributeName: 'r', values: '4;7;4', dur: '2s', repeatCount: 'indefinite'
      }, pulse);
    });

    // ── Passage chords ──
    var chordGroup = el('g', { opacity: '0.4' }, svg);
    passages.forEach(function(p) {
      var fromA = angles[p.from];
      var toA = angles[p.to];
      if (!fromA || !toA) return;
      var from = polarToCart(cx, cy, rMiddle, fromA.mid);
      var to = polarToCart(cx, cy, rMiddle, toA.mid);
      var ctrl = {
        x: cx + (from.x - cx + to.x - cx) * 0.15,
        y: cy + (from.y - cy + to.y - cy) * 0.15
      };
      el('path', {
        d: 'M ' + from.x.toFixed(1) + ' ' + from.y.toFixed(1) +
           ' Q ' + ctrl.x.toFixed(1) + ' ' + ctrl.y.toFixed(1) +
           ' ' + to.x.toFixed(1) + ' ' + to.y.toFixed(1),
        fill: 'none', stroke: EP_COLORS[p.from] || '#6e7681',
        'stroke-width': Math.max(1, Math.min(3, (p.humans || 1) * 0.8)).toFixed(1),
        'stroke-dasharray': '4,3', opacity: '0.6'
      }, chordGroup);
      el('circle', {
        cx: to.x.toFixed(1), cy: to.y.toFixed(1), r: '2',
        fill: EP_COLORS[p.to] || '#6e7681', opacity: '0.6'
      }, chordGroup);
    });

    // ── NORTHGATE STORIES — chipmunk pushes braids outward ──
    // All roads lead to Rome. Stories saturate the null range [0,π].
    var ng = window._northgate;
    if (ng && ng.stories && ng.stories.length > 0) {
      var storyG = el('g', { opacity: '0.6', id: 'ring-northgate' }, svg);
      var storyR = rMiddle + 5;  // between nearby and was
      ng.stories.forEach(function(story, si) {
        var angle = -PI/2 + (si / Math.max(ng.stories.length, 1)) * TAU;
        var pos = polarToCart(cx, cy, storyR, angle);
        // Story dot — size by intrigue, color by type
        var sColor = story.type === 'braid' ? '#f0883e' :
                     story.type === 'signal' ? '#3fb950' :
                     story.type === 'wake' ? '#d2a8ff' : '#484f58';
        var sR = 1.5 + (story.intrigue || 0) * 3;
        var dot = el('circle', {
          cx: pos.x.toFixed(1), cy: pos.y.toFixed(1),
          r: sR.toFixed(1), fill: sColor, opacity: '0.7'
        }, storyG);
        // Pulse the most recent story
        if (si === ng.stories.length - 1) {
          el('animate', {
            attributeName: 'r', values: sR.toFixed(1) + ';' + (sR + 3).toFixed(1) + ';' + sR.toFixed(1),
            dur: '2s', repeatCount: 'indefinite'
          }, dot);
          el('animate', {
            attributeName: 'opacity', values: '0.7;1;0.7',
            dur: '2s', repeatCount: 'indefinite'
          }, dot);
        }
        // Line from story dot inward toward center — the road to Rome
        if (story.from) {
          var fromA = angles[story.from];
          if (fromA) {
            var fromPt = polarToCart(cx, cy, rInner, fromA.mid);
            el('line', {
              x1: pos.x.toFixed(1), y1: pos.y.toFixed(1),
              x2: fromPt.x.toFixed(1), y2: fromPt.y.toFixed(1),
              stroke: sColor, 'stroke-width': '0.5', opacity: '0.3',
              'stroke-dasharray': '2,3'
            }, storyG);
          }
        }
      });

      // π-saturation arc — how much of [0,π] is filled
      if (ng.saturation > 0) {
        var satAngle = (ng.saturation / PI) * TAU;  // map [0,π] → [0,2π]
        var satR = rOuter + 20;
        el('path', {
          d: arcPath(cx, cy, satR, -PI/2, -PI/2 + Math.min(satAngle, TAU - 0.01)),
          fill: 'none', stroke: '#d2a8ff', 'stroke-width': '1.5',
          'stroke-linecap': 'round', opacity: '0.4',
          'stroke-dasharray': '1,2'
        }, storyG);
        // Label
        var satPos = polarToCart(cx, cy, satR + 8, -PI/2 + satAngle / 2);
        el('text', {
          x: satPos.x.toFixed(1), y: satPos.y.toFixed(1),
          fill: '#d2a8ff', 'font-size': '6', 'font-family': 'monospace',
          'text-anchor': 'middle', opacity: '0.5'
        }, storyG).textContent = '\u03c0-sat ' + (ng.saturation / PI * 100).toFixed(0) + '%';
      }
    }

    // ── Fleet halo ──
    if (dashboard) {
      var fleetIps = dashboard.fleet_ips || 0;
      var humanIps = dashboard.human_ips || 1;
      var fleetAngle = Math.min(TAU * 0.95, (fleetIps / (fleetIps + humanIps)) * TAU);
      el('path', {
        d: arcPath(cx, cy, rFleet, -PI/2, -PI/2 + fleetAngle),
        fill: 'none', stroke: '#e74c3c', 'stroke-width': '2',
        'stroke-linecap': 'round', opacity: '0.25', 'stroke-dasharray': '1,3'
      }, svg);
      el('path', {
        d: arcPath(cx, cy, rFleet, -PI/2 + fleetAngle, -PI/2 + TAU - 0.01),
        fill: 'none', stroke: '#3fb950', 'stroke-width': '2',
        'stroke-linecap': 'round', opacity: '0.4'
      }, svg);
    }

    // ── Labels ──
    var labelGroup = el('g', {}, svg);
    EP_ORDER.forEach(function(ep) {
      var a = angles[ep];
      var arcSpan = a.end - a.start;
      var t = et[ep] || {};
      var isC = t.is || 0; if (typeof isC === 'object') isC = isC.humans || isC.count || 0;
      var nearC = t.nearby || 0; if (typeof nearC === 'object') nearC = nearC.humans || nearC.count || 0;
      var wasC = t.was || 0; if (typeof wasC === 'object') wasC = wasC.humans || wasC.count || 0;
      var total = isC + nearC + wasC;

      var minArc = 0.15;
      if (arcSpan < minArc && total === 0) return;

      var labelR = arcSpan < 0.3 ? rLabel + 12 : rLabel;
      var pos = polarToCart(cx, cy, labelR, a.mid);
      var angleDeg = (a.mid * 180 / PI);
      var flip = (angleDeg > 90 && angleDeg < 270) || (angleDeg < -90);

      el('text', {
        x: pos.x.toFixed(1), y: pos.y.toFixed(1),
        fill: EP_COLORS[ep] || '#6e7681',
        'font-size': arcSpan < 0.2 ? Math.max(5, fontSize - 2) : fontSize,
        'font-family': 'monospace',
        'text-anchor': flip ? 'end' : 'start',
        transform: 'rotate(' + (flip ? angleDeg + 180 : angleDeg).toFixed(1) +
                   ' ' + pos.x.toFixed(1) + ' ' + pos.y.toFixed(1) + ')',
        opacity: total > 0 ? '1' : '0.35'
      }, labelGroup).textContent = ep.toLowerCase() + ' ' + isC + '/' + nearC + '/' + wasC;

      if (total > 0) {
        var tickStart = polarToCart(cx, cy, rOuter + 2, a.mid);
        var tickEnd = polarToCart(cx, cy, labelR - 4, a.mid);
        el('line', {
          x1: tickStart.x.toFixed(1), y1: tickStart.y.toFixed(1),
          x2: tickEnd.x.toFixed(1), y2: tickEnd.y.toFixed(1),
          stroke: EP_COLORS[ep] || '#6e7681', 'stroke-width': '0.5', opacity: '0.3'
        }, labelGroup);
      }
    });

    // ═══ NULL-π FIELD — background gradient black(0) to white(π) ═══
    var ng = window._northgate;
    var piSat = ng ? ng.saturation / PI : 0;
    var voidOp = Math.max(0.1, 0.6 - piSat * 0.2);
    el('circle', {
      cx: cx, cy: cy, r: rInner.toFixed(1),
      fill: '#000000', opacity: voidOp.toFixed(3)
    }, svg);
    if (piSat > 0.3) {
      el('circle', {
        cx: cx, cy: cy, r: (rInner * 0.35).toFixed(1),
        fill: '#ffffff', opacity: (piSat * 0.1).toFixed(3)
      }, svg);
    }

    // ── Center text ──
    if (showCenter) {
      el('text', {
        x: cx, y: cy - 12, fill: '#3fb950', 'font-size': '24', 'font-weight': 'bold',
        'text-anchor': 'middle', 'font-family': 'monospace'
      }, svg).textContent = (presence.is || {}).count || 0;
      el('text', {
        x: cx, y: cy + 4, fill: '#8b949e', 'font-size': '8',
        'text-anchor': 'middle', 'font-family': 'monospace'
      }, svg).textContent = 'IS';
      el('text', {
        x: cx, y: cy + 16, fill: '#58a6ff', 'font-size': '11',
        'text-anchor': 'middle', 'font-family': 'monospace'
      }, svg).textContent = ((presence.nearby || {}).count || 0) + ' nearby';
      el('text', {
        x: cx, y: cy + 28, fill: '#6e7681', 'font-size': '10',
        'text-anchor': 'middle', 'font-family': 'monospace'
      }, svg).textContent = ((presence.was || {}).count || 0) + ' was';

      // Cascade context: null from above, projection from below
      var cas = window._cascade;
      if (cas) {
        var epLayer = cas[2];  // epitope is layer 2
        if (epLayer && epLayer.null_down > 0) {
          el('text', {
            x: cx, y: cy + 42, fill: '#e85d3a', 'font-size': '8',
            'text-anchor': 'middle', 'font-family': 'monospace', opacity: '0.7'
          }, svg).textContent = '\u2193 ' + epLayer.null_down + ' null from above';
        }
        if (epLayer && epLayer.proj_up > 0) {
          el('text', {
            x: cx, y: cy + 52, fill: '#3fb950', 'font-size': '8',
            'text-anchor': 'middle', 'font-family': 'monospace', opacity: '0.7'
          }, svg).textContent = '\u2191 ' + (epLayer.proj_up * 100).toFixed(0) + '% classified below';
        }
      }
    }

    // ── Null-π scale bar: black(0)→white(π) ──
    var scaleY = 375;
    var scaleW = 60;
    var scaleX = cx - scaleW / 2;
    for (var si = 0; si <= 10; si++) {
      var sfrac = si / 10;
      var sgrey = Math.round(sfrac * 255);
      el('rect', {
        x: (scaleX + sfrac * scaleW).toFixed(1), y: scaleY,
        width: (scaleW / 10 + 0.5).toFixed(1), height: '4',
        fill: 'rgb(' + sgrey + ',' + sgrey + ',' + sgrey + ')',
        opacity: '0.4'
      }, svg);
    }
    el('text', {
      x: (scaleX - 2).toFixed(1), y: scaleY + 3,
      fill: '#484f58', 'font-size': '4', 'font-family': 'monospace', 'text-anchor': 'end'
    }, svg).textContent = '0';
    el('text', {
      x: (scaleX + scaleW + 2).toFixed(1), y: scaleY + 3,
      fill: '#c9d1d9', 'font-size': '4', 'font-family': 'monospace', 'text-anchor': 'start'
    }, svg).textContent = 'π';
    if (piSat > 0) {
      var smarkerX = scaleX + piSat * scaleW;
      el('line', {
        x1: smarkerX.toFixed(1), y1: scaleY,
        x2: smarkerX.toFixed(1), y2: scaleY + 4,
        stroke: '#f0883e', 'stroke-width': '1'
      }, svg);
      el('text', {
        x: smarkerX.toFixed(1), y: scaleY + 9,
        fill: '#f0883e', 'font-size': '3.5', 'font-family': 'monospace', 'text-anchor': 'middle'
      }, svg).textContent = (piSat * 100).toFixed(0) + '%';
    }

    if (showLegend && !opts.group) {
      el('text', {
        x: cx, y: 385, fill: '#484f58', 'font-size': '7',
        'text-anchor': 'middle', 'font-family': 'monospace'
      }, svg).textContent = 'pupil=IS · iris=NEARBY · sclera=WAS · cornea=fleet:human · nerves=passages';
    }

    // ── EYE SPIN ──
    // Each layer spins at a different rate. Relative speed = the boundary.
    // IS (pupil) = fastest. WAS (sclera) = slowest. Difference = observation.
    // Complexity (alive epitopes) accelerates all layers.
    var isCount = (presence.is || {}).count || 1;
    var complexity = Math.max(1, isCount);
    var speedScale = Math.sqrt(complexity) / PI;  // faster with more activity
    // IS: π rad/min, NEARBY: 1 rad/min, WAS: 1/π rad/min (all × complexity)
    var durIS     = Math.max(8, 60 / (PI * speedScale));      // fastest
    var durNearby = Math.max(15, 60 / (1 * speedScale));      // medium
    var durWas    = Math.max(30, 60 / (speedScale / PI));      // slowest
    // IS and NEARBY counter-rotate — when they align, green+blue overlap = FOCUS
    if (isGroup) {
      var aIS = el('animateTransform', {
        attributeName: 'transform', type: 'rotate',
        from: '0 ' + cx + ' ' + cy, to: '360 ' + cx + ' ' + cy,
        dur: durIS.toFixed(1) + 's', repeatCount: 'indefinite'
      }, isGroup);
    }
    if (nearbyGroup) {
      el('animateTransform', {
        attributeName: 'transform', type: 'rotate',
        from: '0 ' + cx + ' ' + cy, to: '-360 ' + cx + ' ' + cy,
        dur: durNearby.toFixed(1) + 's', repeatCount: 'indefinite'
      }, nearbyGroup);
    }
    if (wasGroup) {
      el('animateTransform', {
        attributeName: 'transform', type: 'rotate',
        from: '0 ' + cx + ' ' + cy, to: '360 ' + cx + ' ' + cy,
        dur: durWas.toFixed(1) + 's', repeatCount: 'indefinite'
      }, wasGroup);
    }
    // Northgate stories spin with nearby (pollinator layer)
    var ngG = svg.querySelector('#ring-northgate');
    if (ngG) {
      el('animateTransform', {
        attributeName: 'transform', type: 'rotate',
        from: '0 ' + cx + ' ' + cy, to: '-360 ' + cx + ' ' + cy,
        dur: durNearby.toFixed(1) + 's', repeatCount: 'indefinite'
      }, ngG);
    }
    // Chords spin with NEARBY (they connect through the iris)
    if (chordGroup) {
      el('animateTransform', {
        attributeName: 'transform', type: 'rotate',
        from: '0 ' + cx + ' ' + cy, to: '-360 ' + cx + ' ' + cy,
        dur: durNearby.toFixed(1) + 's', repeatCount: 'indefinite'
      }, chordGroup);
    }

    return svg;
  }

  // Legacy wrapper
  function renderEpitopeRing(presence, dashboard) {
    return renderRing(presence, dashboard, null, {});
  }

  // Billboard ring
  function renderBillboardRing(svg, billboardText, cx, cy, r) {
    if (!svg || !billboardText) return;
    var lines = billboardText.split('\n').filter(function(l) { return l.trim().length > 0; });
    if (!lines.length) return;
    var billboardG = el('g', { opacity: '0.3' }, svg);
    var step = TAU / Math.max(lines.length, 1);
    var startAngle = -PI / 2;
    lines.slice(0, 12).forEach(function(line, i) {
      var angle = startAngle + i * step;
      var pos = polarToCart(cx, cy, r, angle);
      var angleDeg = angle * 180 / PI;
      var flip = angleDeg > 90 || angleDeg < -90;
      el('text', {
        x: pos.x.toFixed(1), y: pos.y.toFixed(1),
        fill: '#6e7681', 'font-size': '6', 'font-family': 'Georgia, serif',
        'text-anchor': flip ? 'end' : 'start',
        transform: 'rotate(' + (flip ? angleDeg + 180 : angleDeg).toFixed(1) +
                   ' ' + pos.x.toFixed(1) + ' ' + pos.y.toFixed(1) + ')',
        opacity: '0.5'
      }, billboardG).textContent = line.trim().substring(0, 50);
    });
  }

  // Expose
  window._epitopeRing = {
    render: renderEpitopeRing,
    renderRing: renderRing,
    renderBillboard: renderBillboardRing,
    EP_ORDER: EP_ORDER,
    EP_COLORS: EP_COLORS,
    SORT_COLORS: SORT_COLORS
  };

  // Auto-render in HUD card
  if (window._piBus) {
    var dashCache = null, sortCache = null;
    window._piBus.sub('/dashboard.json', function(d) { dashCache = d; }, 'slow');
    window._piBus.sub('/scan_sweep_sort.json', function(s) { sortCache = s; }, 'slow');
    window._piBus.sub('/presence.json', function(p) {
      var container = document.getElementById('d-presence');
      if (!container) return;
      container.innerHTML = '';
      var svg = renderRing(p, dashCache, sortCache, {});
      if (svg) {
        container.appendChild(svg);
        var bbEl = document.getElementById('hud-billboard-msg');
        if (bbEl && bbEl.textContent) {
          renderBillboardRing(svg, bbEl.textContent, 200, 200, 190);
        }
      }
    }, 'fast');
  }
})();
