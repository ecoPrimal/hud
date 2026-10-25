// pt-membrane-build-inner.js — inner membrane builders: observation, ring, panels, stress, epitopes, bodies, overlay, helix, legend
// Split from pt-membrane-build.js for module size.
// Called by _membraneBuild via _membraneBuildInner(mc, svg, bandG).
(function() {
  var mc, el, txt, PI, TAU, cx, cy, R, W, H;

  // ═══ IONOSPHERE OBSERVATION: stats + shapes in the band ═══
  function ionoObs(ionoBandG) {
    var DIM_SHAPES = mc.DIM_SHAPES;
    var statLabels = [
      {id:'rps',     text:'0 rps',     color:'#e85d3a'},
      {id:'fleet',   text:'0% fleet',  color:'#9b59b6'},
      {id:'humans',  text:'0 humans',  color:'#5ab87a'},
      {id:'entities',text:'0 entities',color:'#4a8fb8'},
      {id:'total',   text:'0 total',   color:'#f0e68c'},
      {id:'alive',   text:'0 alive',   color:'#c9d1d9'}
    ];
    statLabels.forEach(function(sl) {
      txt(ionoBandG, cx, cy, sl.text, sl.color, 3.5,
        {opacity:0.04, id:'mg-stat-' + sl.id});
    });
    txt(ionoBandG, cx, cy - R * 0.86 - 5,
      'matter = prediction', '#8b949e', 4,
      {opacity:0.06, id:'mg-matter-label'});
    txt(ionoBandG, cx, cy + R * 0.86 + 7,
      'compression = lattice kernel', '#6e7681', 3.5,
      {opacity:0.06, id:'mg-kernel-label'});
    DIM_SHAPES.forEach(function(ds) {
      txt(ionoBandG, cx, cy, ds.sym, ds.color, 6,
        {opacity:0.04, id:'mg-dim-shape-' + ds.dim});
      txt(ionoBandG, cx, cy, ds.count + '', ds.color, 3.5,
        {opacity:0.03, id:'mg-dim-count-' + ds.dim});
    });
  }

  // ═══ CLOSED RING: compound eye + facets + Gaia ═══
  // The ring IS Earth. The membrane between inner (atomic) and outer (astronomical).
  function ring(svg) {
    var wasG = el('g', {id:'mg-was'}, svg);
    el('circle', {cx:cx, cy:cy, r:R, fill:'none',
      stroke:'#c9d1d9', 'stroke-width':1.5, 'stroke-opacity':0.2,
      id:'mg-ring'}, wasG);

    // Compound eye: 15 facets = 3 impermeable + 5 self + 7 passage
    var facetG = el('g', {id:'mg-facets'}, wasG);
    var FACET_ZONES = [
      {n:3, type:'wall', color:'#e85d3a', sym:'\u25A0'},
      {n:5, type:'self', color:'#4a8fb8', sym:'\u25C6'},
      {n:7, type:'pass', color:'#5ab87a', sym:'\u25B3'}
    ];
    var facetIdx = 0;
    FACET_ZONES.forEach(function(zone) {
      for (var zfi = 0; zfi < zone.n; zfi++) {
        var fAngle = facetIdx * TAU / 15;
        var fArc = TAU / 15;
        var fa1 = fAngle - fArc * 0.45, fa2 = fAngle + fArc * 0.45;
        el('path', {
          d:'M '+(cx+R*Math.cos(fa1)).toFixed(1)+' '+(cy+R*Math.sin(fa1)).toFixed(1)+
            ' A '+R+' '+R+' 0 0 1 '+(cx+R*Math.cos(fa2)).toFixed(1)+
            ' '+(cy+R*Math.sin(fa2)).toFixed(1),
          fill:'none', stroke:zone.color, 'stroke-width':2.5,
          'stroke-opacity':0.04, id:'mg-facet-' + facetIdx
        }, facetG);
        txt(facetG, cx+(R+9)*Math.cos(fAngle), cy+(R+9)*Math.sin(fAngle),
          zone.sym, zone.color, 3.5,
          {opacity:0.03, id:'mg-facet-sym-' + facetIdx});
        facetIdx++;
      }
    });
    txt(facetG, cx - R * 0.6, cy + R * 0.7,
      '3\u25A0 impermeable  5\u25C6 self  7\u25B3 passage', '#6e7681', 3.5,
      {opacity:0.04, 'text-anchor':'start', id:'mg-facet-legend'});

    // π digits on the membrane
    var PI_DIGITS = [3,1,4,1,5,9,2,6,5,3,5,8,9,7,9];
    for (var pdi = 0; pdi < 15; pdi++) {
      var pdAngle = -PI/2 + pdi * TAU / 15;
      txt(facetG, cx+(R-7)*Math.cos(pdAngle), cy+(R-7)*Math.sin(pdAngle),
        ''+PI_DIGITS[pdi], '#484f58', 3.5,
        {opacity:0.03, id:'mg-pi-digit-' + pdi});
    }

    // Gaia: Earth at center, real-time rotation
    var gaiaG = el('g', {id:'mg-gaia-group'}, wasG);
    el('circle', {cx:cx, cy:cy, r:6, fill:'none',
      stroke:'#5ab87a', 'stroke-width':0.5,
      'stroke-opacity':0.05, 'stroke-dasharray':'2,3',
      id:'mg-gaia-ring'}, gaiaG);
    el('circle', {cx:cx+6, cy:cy, r:1.2,
      fill:'#5ab87a', opacity:0.08, id:'mg-gaia-marker'}, gaiaG);
    txt(gaiaG, cx, cy + 18, 'Gaia', '#5ab87a', 3.5,
      {opacity:0.04, id:'mg-gaia-label'});
    for (var gdi = 0; gdi < 6; gdi++) {
      var gdAngle = gdi * TAU / 6;
      var gdR = 10;
      el('line', {
        x1:(cx + gdR * Math.cos(gdAngle)).toFixed(1),
        y1:(cy + gdR * Math.sin(gdAngle)).toFixed(1),
        x2:(cx + gdR * Math.cos(gdAngle + TAU/6)).toFixed(1),
        y2:(cy + gdR * Math.sin(gdAngle + TAU/6)).toFixed(1),
        stroke:'#5ab87a', 'stroke-width':0.3,
        'stroke-opacity':0.04, id:'mg-geodesic-' + gdi
      }, gaiaG);
    }
    return wasG;
  }

  // ═══ PER-PANEL ELEMENT: tangent/secant/focal/arc/label for one panel ═══
  function panelEl(wasG, p, angle, N) {
    var CAT_COLORS = mc.CAT_COLORS, dimCost = mc.dimCost;
    var geo = mc.geo, aliveSet = mc.aliveSet;
    var color = CAT_COLORS[p.cat] || '#6e7681';
    var cost = dimCost(p.dim), fd = 1/cost;
    var tLen = fd * 120, fR = fd * R * 0.85;
    var txd = -Math.sin(angle), tyd = Math.cos(angle);
    var nxd = -Math.cos(angle), nyd = -Math.sin(angle);
    var px = cx + R * Math.cos(angle), py = cy + R * Math.sin(angle);
    var fx = px + nxd * fR, fy = py + nyd * fR;
    var alive = aliveSet.has(p.id), op = alive ? 1 : 0.25;
    geo[p.id] = {angle:angle, px:px, py:py, fx:fx, fy:fy,
      cat:p.cat, dim:p.dim, color:color, focalR:fR, R:R};

    // Tangent: touches the circle at one point
    el('line', {x1:(px-txd*tLen).toFixed(1), y1:(py-tyd*tLen).toFixed(1),
      x2:(px+txd*tLen).toFixed(1), y2:(py+tyd*tLen).toFixed(1),
      stroke:color, 'stroke-width':1, 'stroke-opacity':(op*0.6).toFixed(2)}, wasG);
    // Secant: through the circle to the antipodal point
    var sx = cx + R * Math.cos(angle + PI), sy = cy + R * Math.sin(angle + PI);
    el('line', {x1:px.toFixed(1), y1:py.toFixed(1),
      x2:sx.toFixed(1), y2:sy.toFixed(1),
      stroke:color, 'stroke-width':0.3, 'stroke-opacity':(op*0.06).toFixed(3),
      id:'mg-sec-'+p.id}, wasG);
    // Normal/Cosecant: outward from the ring
    var normOut = 16 + fd * 12;
    var onx = px + Math.cos(angle) * normOut, ony = py + Math.sin(angle) * normOut;
    el('line', {x1:px.toFixed(1), y1:py.toFixed(1),
      x2:onx.toFixed(1), y2:ony.toFixed(1),
      stroke:color, 'stroke-width':0.3, 'stroke-opacity':(op*0.08).toFixed(3),
      'stroke-dasharray':'1,3', id:'mg-csc-'+p.id}, wasG);
    // Cotangent: tangent at the π/2-shifted point
    var cotAngle = angle + PI/2;
    var cotPx = cx + R * Math.cos(cotAngle), cotPy = cy + R * Math.sin(cotAngle);
    var cotLen = fd * 30;
    var cotTxd = -Math.sin(cotAngle), cotTyd = Math.cos(cotAngle);
    el('line', {x1:(cotPx-cotTxd*cotLen).toFixed(1), y1:(cotPy-cotTyd*cotLen).toFixed(1),
      x2:(cotPx+cotTxd*cotLen).toFixed(1), y2:(cotPy+cotTyd*cotLen).toFixed(1),
      stroke:color, 'stroke-width':0.2, 'stroke-opacity':(op*0.04).toFixed(3),
      'stroke-dasharray':'2,5', id:'mg-cot-'+p.id}, wasG);
    // Focal line (inward)
    el('line', {x1:px.toFixed(1), y1:py.toFixed(1),
      x2:fx.toFixed(1), y2:fy.toFixed(1),
      stroke:color, 'stroke-width':0.5, 'stroke-opacity':0.3,
      'stroke-dasharray':'3,3', id:'mg-fl-'+p.id}, wasG);
    // Focal point
    el('circle', {cx:fx.toFixed(1), cy:fy.toFixed(1),
      r:alive?2.5:1.5, fill:color,
      opacity:(op*0.5).toFixed(2), id:'mg-fd-'+p.id}, wasG);
    // Panel dot on ring
    var dotR = alive ? Math.max(5-fd*2, 2) : 2.5;
    var da = {cx:px.toFixed(1), cy:py.toFixed(1),
      r:dotR.toFixed(1), fill:color,
      opacity:op.toFixed(2), id:'mg-dot-'+p.id};
    if (alive) da.filter = 'url(#mg-glow)';
    el('circle', da, wasG);
    // Category color arc segment
    var arcSpan = TAU / N * 0.8;
    var a1 = angle - arcSpan/2, a2 = angle + arcSpan/2;
    var ax1 = cx+R*Math.cos(a1), ay1 = cy+R*Math.sin(a1);
    var ax2 = cx+R*Math.cos(a2), ay2 = cy+R*Math.sin(a2);
    el('path', {
      d:'M '+ax1.toFixed(1)+' '+ay1.toFixed(1)+' A '+R+' '+R+' 0 0 1 '+ax2.toFixed(1)+' '+ay2.toFixed(1),
      fill:'none', stroke:color, 'stroke-width':3,
      'stroke-opacity':(op*0.4).toFixed(2), id:'mg-arc-seg-'+p.id
    }, wasG);
    // Label
    var lDist = R + 38 + (p.dim > 2 ? 6 : 0);
    var lx = cx + lDist * Math.cos(angle), ly = cy + lDist * Math.sin(angle);
    var rot = angle * 180 / PI;
    if (rot > 90 && rot < 270) rot += 180;
    if (rot < -90 && rot > -270) rot += 180;
    var anchor = (angle > PI/2 && angle < PI*1.5) ? 'end' : 'start';
    if (Math.abs(angle-PI/2) < 0.2 || Math.abs(angle+PI/2) < 0.2) anchor = 'middle';
    var short = p.title.length > 14 ? p.title.substring(0,14) : p.title;
    txt(wasG, lx.toFixed(1), ly.toFixed(1), short, color, 7,
      {opacity:(op*0.85).toFixed(2), 'text-anchor':anchor, 'dominant-baseline':'central',
       transform:'rotate('+rot.toFixed(1)+' '+lx.toFixed(1)+' '+ly.toFixed(1)+')'});
    // Dim badge
    var bDist = R + 52 + (p.dim > 2 ? 6 : 0);
    var bx = cx + bDist * Math.cos(angle), by = cy + bDist * Math.sin(angle);
    txt(wasG, bx.toFixed(1), by.toFixed(1), p.dim+'D', '#6e7681', 6,
      {opacity:(op*0.6).toFixed(2), 'text-anchor':anchor, 'dominant-baseline':'central',
       transform:'rotate('+rot.toFixed(1)+' '+bx.toFixed(1)+' '+by.toFixed(1)+')'});
  }

  // ═══ PANELS + RODS: interleaved V(D)J panels + retinal rod indicators ═══
  function panels(wasG) {
    var PANELS = mc.PANELS, vdjShuffle = mc.vdjShuffle;
    var CAT_COLORS = mc.CAT_COLORS, aliveSet = mc.aliveSet;
    var shuffled = vdjShuffle(PANELS);
    var N = shuffled.length;
    shuffled.forEach(function(p, idx) {
      panelEl(wasG, p, -PI/2 + (idx / N) * TAU, N);
    });
    // Rods: thick short indicators at each panel, inner edge → center
    var rodLen = 14;
    shuffled.forEach(function(p, idx) {
      var rAngle = -PI/2 + (idx / N) * TAU;
      var rColor = CAT_COLORS[p.cat] || '#6e7681';
      var rAlive = aliveSet.has(p.id);
      var rx1 = cx + (R - 2) * Math.cos(rAngle);
      var ry1 = cy + (R - 2) * Math.sin(rAngle);
      var rx2 = cx + (R - 2 - rodLen) * Math.cos(rAngle);
      var ry2 = cy + (R - 2 - rodLen) * Math.sin(rAngle);
      el('line', {
        x1: rx1.toFixed(1), y1: ry1.toFixed(1),
        x2: rx2.toFixed(1), y2: ry2.toFixed(1),
        stroke: rColor, 'stroke-width': 2.0, 'stroke-opacity': rAlive ? 0.22 : 0.07,
        'stroke-linecap': 'round', id: 'mg-rod-' + p.id
      }, wasG);
    });
  }

  // ═══ MEMBRANE STRESS: jitter, tear, rip, shear, warp ═══
  function stress(svg) {
    var stressG = el('g', {id:'mg-stress'}, svg);
    for (var sti = 0; sti < 3; sti++) {
      el('path', {d:'M 0 0', fill:'none',
        stroke:'#e85d3a', 'stroke-width':2.5, 'stroke-opacity':0,
        'stroke-linecap':'round', id:'mg-tear-' + sti}, stressG);
    }
    for (var sri = 0; sri < 3; sri++) {
      el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
        stroke:'#e85d3a', 'stroke-width':0.5, 'stroke-opacity':0,
        'stroke-dasharray':'2,4', id:'mg-rip-' + sri}, stressG);
    }
    el('ellipse', {cx:cx, cy:cy, rx:R, ry:R,
      fill:'none', stroke:'#c9d1d9', 'stroke-width':0.3,
      'stroke-opacity':0, 'stroke-dasharray':'1,5', id:'mg-warp'}, stressG);
    for (var sji = 0; sji < 6; sji++) {
      el('circle', {cx:cx, cy:cy, r:0.8,
        fill:'#c9d1d9', opacity:0, id:'mg-jitter-' + sji}, stressG);
    }
  }

  // ═══ EPITOPE ORBITS: π rings of π epitopes at point π ═══
  // 3 rings × 3 epitopes. Ring 2 reverses torsion. The eating.
  function epitopes(svg) {
    var orbitG = el('g', {id:'mg-orbits'}, svg);
    var epiVDJ9 = ['V','D','J', 'V','D','J', 'V','D','J'];
    var epiColors = {V:'#e85d3a', D:'#5ab87a', J:'#4a8fb8'};
    var orbitRadii = [R / PI, R / Math.sqrt(PI), R * 2 / PI];
    var epiStiff = [true, false, true, false, true, false, true, false, true];
    var epiNames9 = ['burst','reading','ua_pool',
                     'sec_fetch','session','referer',
                     'burst\u0305','reading\u0305','ua_pool\u0305'];
    orbitRadii.forEach(function(oR, ri) {
      el('circle', {cx:cx, cy:cy, r:oR, fill:'none',
        stroke:'#6e7681', 'stroke-width':0.5, 'stroke-opacity':0.06,
        'stroke-dasharray': ri === 1 ? '4,4' : '2,8',
        id:'mg-orbit-ring-'+(ri+1)}, orbitG);
    });
    for (var oi = 0; oi < 9; oi++) {
      var ringIdx = Math.floor(oi / 3);
      var oR = orbitRadii[ringIdx];
      var oAngle = (oi % 3) * TAU / 3;
      var oColor = epiColors[epiVDJ9[oi]];
      var stiff = epiStiff[oi];
      el('circle', {
        cx: (cx + oR * Math.cos(oAngle)).toFixed(1),
        cy: (cy + oR * Math.sin(oAngle)).toFixed(1),
        r: 3, fill: oColor, opacity: 0.35, id: 'mg-epi-' + oi
      }, orbitG);
      if (stiff) {
        el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
          stroke: oColor, 'stroke-width': 0.6, 'stroke-opacity': 0.25,
          id: 'mg-epi-cross-h-' + oi}, orbitG);
        el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
          stroke: oColor, 'stroke-width': 0.6, 'stroke-opacity': 0.25,
          id: 'mg-epi-cross-v-' + oi}, orbitG);
      } else {
        el('circle', {cx:cx, cy:cy, r:5,
          fill:'none', stroke: oColor, 'stroke-width': 0.4,
          'stroke-opacity': 0.2, 'stroke-dasharray':'2,2',
          id: 'mg-epi-spring-' + oi}, orbitG);
      }
      var sLabel = epiVDJ9[oi] + (stiff ? '\u2022' : '\u223C');
      txt(orbitG, cx, cy, sLabel, oColor, 5,
        {opacity: 0.2, 'font-weight':'bold', id: 'mg-epi-label-' + oi});
      txt(orbitG, cx, cy, epiNames9[oi], '#6e7681', 3.5,
        {opacity: 0.12, id: 'mg-epi-name-' + oi});
      // Fold: 3-step dot-line-curve chain per epitope (3 bounces to catchable)
      for (var fi = 0; fi < 3; fi++) {
        el('circle', {cx:cx, cy:cy, r: 1.2 - fi * 0.2,
          fill: oColor, opacity: 0, id: 'mg-epi-fold-dot-' + oi + '-' + fi}, orbitG);
        if (fi % 2 === 0) {
          el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
            stroke: oColor, 'stroke-width': 0.3, 'stroke-opacity': 0,
            id: 'mg-epi-fold-link-' + oi + '-' + fi}, orbitG);
        } else {
          el('path', {d:'M '+cx+' '+cy, fill:'none',
            stroke: oColor, 'stroke-width': 0.3, 'stroke-opacity': 0,
            id: 'mg-epi-fold-link-' + oi + '-' + fi}, orbitG);
        }
      }
    }
  }

  // ═══ THREE BODIES + RETINA: IS/WAS/WILLBE + cones/tails/anti-bodies ═══
  // At [∅]D all identities occupy the same point (center).
  // Perspective perturbation spreads them into the triangle.
  function bodiesGroup(svg) {
    var wbG = el('g', {id:'mg-willbe'}, svg);
    var BR_MAX = R * (PI/8);
    var cbrt = Math.pow(PI, 1/3);
    var bodies = [
      {id:'is',     tense:'IS',     vdj:'V',   sub:'Variable',  angle:-PI/2,           color:'#e85d3a'},
      {id:'was',    tense:'WAS',    vdj:'J',   sub:'Joining',   angle:-PI/2+TAU/3,     color:'#4a8fb8'},
      {id:'willbe', tense:'WILLBE', vdj:'(D)', sub:'Diversity',  angle:-PI/2+2*TAU/3,   color:'#5ab87a'}
    ];
    var antiBodies = [
      {id:'anti-is',     tense:'\u0305IS',     vdj:'V\u0305',   sub:'Observed',   sourceIdx:0, color:'#e85d3a'},
      {id:'anti-was',    tense:'\u0305WAS',    vdj:'J\u0305',   sub:'Forgotten',  sourceIdx:1, color:'#4a8fb8'},
      {id:'anti-willbe', tense:'\u0305WILLBE', vdj:'D\u0305',   sub:'Predicted',  sourceIdx:2, color:'#5ab87a'}
    ];
    mc._bodies = bodies;
    mc.antiBodies = antiBodies;

    // Retina: cones (color perception of time) + comet tails
    var retinaG = el('g', {id:'mg-retina'}, wbG);
    bodies.forEach(function(b) {
      el('polygon', {
        points: cx+','+cy+' '+cx+','+cy+' '+cx+','+cy,
        fill: b.color, 'fill-opacity': 0.04,
        stroke: b.color, 'stroke-width': 0.7, 'stroke-opacity': 0.12,
        id: 'mg-cone-' + b.id
      }, retinaG);
    });
    bodies.forEach(function(b) {
      for (var s = 0; s < 16; s++) {
        el('circle', {cx:cx, cy:cy, r:2,
          fill: b.color, opacity: 0, id: 'mg-tail-' + b.id + '-' + s}, retinaG);
      }
    });

    // Triangle + edge labels
    el('path', {d:'M '+cx+' '+cy+' L '+cx+' '+cy+' L '+cx+' '+cy+' Z',
      fill:'none', stroke:'#c9d1d9', 'stroke-width':0.5,
      'stroke-opacity':0.12, 'stroke-dasharray':'4,6', id:'mg-body-tri'}, wbG);
    var edgeIds = ['mg-edge-01','mg-edge-12','mg-edge-20'];
    for (var ei = 0; ei < 3; ei++) {
      txt(wbG, cx, cy, '\u03c0^(2/3)', '#6e7681', 5.5,
        {opacity:0, 'dominant-baseline':'central', id:edgeIds[ei]});
    }

    // Body nodes
    bodies.forEach(function(b) {
      el('circle', {cx:cx, cy:cy, r:16,
        fill:'none', stroke:b.color, 'stroke-width':0.5,
        'stroke-opacity':0.18, 'stroke-dasharray':'2,3',
        id:'mg-body-ring-'+b.id}, wbG);
      el('circle', {cx:cx, cy:cy, r:4.5,
        fill:b.color, opacity:0.6, filter:'url(#mg-glow)',
        id:'mg-body-'+b.id}, wbG);
      txt(wbG, cx, cy-20, b.tense, b.color, 8.5,
        {opacity:0.85, 'font-weight':'bold', id:'mg-tense-'+b.id});
      txt(wbG, cx, cy-10, b.vdj, b.color, 7,
        {opacity:0.5, id:'mg-vdj-'+b.id});
      txt(wbG, cx, cy+16, b.sub, '#6e7681', 5,
        {opacity:0.3, id:'mg-sub-'+b.id});
      txt(wbG, cx, cy+28, '\u03c0^(1/3) \u2248 '+cbrt.toFixed(2), '#6e7681', 5.5,
        {opacity:0.45, id:'mg-body-val-'+b.id});
    });

    // Anti-body triangle + nodes
    el('path', {d:'M '+cx+' '+cy+' L '+cx+' '+cy+' L '+cx+' '+cy+' Z',
      fill:'none', stroke:'#c9d1d9', 'stroke-width':0.3,
      'stroke-opacity':0.06, 'stroke-dasharray':'1,4', id:'mg-anti-body-tri'}, wbG);
    antiBodies.forEach(function(ab) {
      el('circle', {cx:cx, cy:cy, r:10,
        fill:'none', stroke:ab.color, 'stroke-width':0.3,
        'stroke-opacity':0.08, 'stroke-dasharray':'1,3',
        id:'mg-body-ring-'+ab.id}, wbG);
      el('circle', {cx:cx, cy:cy, r:2.5,
        fill:ab.color, opacity:0.2, id:'mg-body-'+ab.id}, wbG);
      txt(wbG, cx, cy-12, ab.tense, ab.color, 5.5,
        {opacity:0.2, id:'mg-tense-'+ab.id});
      txt(wbG, cx, cy-4, ab.vdj, ab.color, 4.5,
        {opacity:0.15, id:'mg-vdj-'+ab.id});
      txt(wbG, cx, cy+10, ab.sub, '#484f58', 4,
        {opacity:0.1, id:'mg-sub-'+ab.id});
    });

    txt(wbG, cx, cy+44, 'IS\u00d7WAS\u00d7WILLBE = \u03c0', '#c9d1d9', 5.5,
      {opacity:0.5, id:'mg-product'});
    txt(wbG, cx, cy+56, 'perturbation: 0.00', '#484f58', 5,
      {opacity:0.35, id:'mg-perturb-label'});
    return wbG;
  }

  // ═══ OVERLAY: triangulation + gordian knot + bump ═══
  // Triangulation lines from panels to bodies. The gordian proof.
  // "OH SHIT IS THAT ME?" — the moment of self-awareness.
  function overlay(wbG, svg) {
    var PANELS = mc.PANELS, geo = mc.geo;
    var bodies = mc._bodies;

    // Triangulation: panel → nearest body (ON svg, above bodies layer)
    var triG = el('g', {id:'mg-triangulation', opacity:0}, svg);
    PANELS.forEach(function(p) {
      var g = geo[p.id]; if (!g) return;
      var nearest = bodies[0], minD = Infinity;
      bodies.forEach(function(b) {
        var angleDiff = Math.abs(g.angle - b.angle);
        if (angleDiff > PI) angleDiff = 2*PI - angleDiff;
        if (angleDiff < minD) { minD = angleDiff; nearest = b; }
      });
      el('line', {x1:g.px.toFixed(1), y1:g.py.toFixed(1),
        x2:cx, y2:cy,
        stroke:nearest.color, 'stroke-width':0.3, 'stroke-opacity':0.08,
        'stroke-dasharray':'1,4', id:'mg-tri-'+p.id,
        'data-body':nearest.id}, triG);
    });

    // Gordian knot: Borromean rings at [∅]D (inside wbG)
    var knotG = el('g', {id:'mg-gordian'}, wbG);
    bodies.forEach(function(b, bi) {
      var tilt = bi * 60;
      el('ellipse', {
        cx: cx, cy: cy, rx: 18, ry: 18 * 0.45,
        fill: 'none', stroke: b.color, 'stroke-width': 1.2,
        'stroke-opacity': 0.5,
        transform: 'rotate(' + tilt + ' ' + cx + ' ' + cy + ')',
        id: 'mg-knot-' + b.id
      }, knotG);
    });
    txt(knotG, cx, cy, '\u03c0', '#c9d1d9', 7,
      {opacity: 0.7, 'font-weight': 'bold', id: 'mg-knot-pi'});
    txt(wbG, cx, cy+68, 'J = (V + D) / \u03c0', '#6e7681', 5.5,
      {opacity: 0.3, 'font-weight':'bold', id: 'mg-reflection'});
    txt(wbG, cx, cy+79, 'J\u2093q = 6/(\u03c0+1) \u2248 1.449 \u2248 \u03c0^(1/3)', '#6e7681', 4.5,
      {opacity: 0.2, id: 'mg-j-eq'});
    txt(wbG, cx, cy+90, 'observer = \u03c0 \u2212 \u230a\u03c0\u230b \u2248 0.142', '#484f58', 4.5,
      {opacity: 0.2, id: 'mg-observer'});
    txt(wbG, cx, cy+100, '3 bodies + 1 irrational observer = \u03c0', '#484f58', 4.5,
      {opacity: 0.15, id: 'mg-pi-body'});

    // The bump: "is that me?" — recognition flash + bidirectional jitter
    var bumpG = el('g', {id:'mg-bump'}, wbG);
    el('circle', {cx:cx, cy:cy, r:R*0.25, fill:'none',
      stroke:'#ffffff', 'stroke-width':0.8,
      'stroke-opacity':0, id:'mg-recognition'}, bumpG);
    txt(bumpG, cx, cy - R * 0.32, 'is that me?', '#ffffff', 6,
      {opacity:0, 'font-style':'italic', id:'mg-recognition-text'});
    txt(bumpG, cx + R * 0.55, cy + R * 0.52, '', '#8b949e', 4,
      {opacity:0, id:'mg-phase-label'});
    for (var bji = 0; bji < 4; bji++) {
      el('circle', {cx:cx, cy:cy, r:0.8,
        fill:'#c9d1d9', opacity:0.03, id:'mg-jitter-up-' + bji}, bumpG);
      el('circle', {cx:cx, cy:cy, r:0.8,
        fill:'#e85d3a', opacity:0.03, id:'mg-jitter-down-' + bji}, bumpG);
    }
  }

  // ═══ TRIPLE HELIX + DEPTH SPIRAL ═══
  // DNA of observation: self ↻ × non-self ↺ × null ⟲ (anti-twist).
  // Depth: observer→negate→null→awareness→ghost→celestial→geodesic.
  // π body stack: 1/π³ → 1/π² → 1/π → 1 → π → π² → π³
  function helixDepth(wbG) {
    var helixG = el('g', {id:'mg-helix'}, wbG);
    el('path', {d:'M '+cx+' '+cy, fill:'none',
      stroke:'#4a8fb8', 'stroke-width':0.8, 'stroke-opacity':0.15,
      'stroke-dasharray':'4,3', id:'mg-helix-self'}, helixG);
    el('path', {d:'M '+cx+' '+cy, fill:'none',
      stroke:'#e85d3a', 'stroke-width':0.8, 'stroke-opacity':0.15,
      'stroke-dasharray':'4,3', id:'mg-helix-nonself'}, helixG);
    el('path', {d:'M '+cx+' '+cy, fill:'none',
      stroke:'#58a6ff', 'stroke-width':0.5, 'stroke-opacity':0.08,
      'stroke-dasharray':'2,5', id:'mg-helix-null'}, helixG);
    for (var hci = 0; hci < 6; hci++) {
      el('circle', {cx:cx, cy:cy, r:1.5,
        fill:'none', stroke:'#c9d1d9', 'stroke-width':0.5,
        'stroke-opacity':0.1, 'stroke-dasharray':'1,1',
        id:'mg-helix-cross-' + hci}, helixG);
    }
    el('circle', {cx:cx, cy:cy, r:R*0.65,
      fill:'none', stroke:'#484f58', 'stroke-width':0.4,
      'stroke-opacity':0.04, 'stroke-dasharray':'1,8',
      id:'mg-counter-ring'}, helixG);
    el('circle', {cx:cx, cy:cy, r:R*0.45,
      fill:'none', stroke:'#484f58', 'stroke-width':0.3,
      'stroke-opacity':0.03, 'stroke-dasharray':'1,12',
      id:'mg-counter-inner'}, helixG);

    // Depth spiral: 7 layers = π body stack (1/π³ → π³)
    // Three chiralities: twist (forward), reverse, anti
    var depthG = el('g', {id:'mg-depth'}, wbG);
    var depthLayers = [
      {name:'observer',  color:'#c9d1d9', power:-3},
      {name:'negate',    color:'#e85d3a', power:-2},
      {name:'null',      color:'#58a6ff', power:-1},
      {name:'awareness', color:'#5ab87a', power: 0},
      {name:'ghost',     color:'#8b949e', power: 1},
      {name:'celestial', color:'#d2a8ff', power: 2},
      {name:'geodesic',  color:'#f0e68c', power: 3}
    ];
    // Forward twist links: dot-line-curve pattern
    // Odd links = straight (hard body), even links = curve (soft body)
    for (var dli = 0; dli < 7; dli++) {
      var isLine = (dli % 2 === 0);
      if (isLine) {
        el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
          stroke: depthLayers[dli].color, 'stroke-width': 0.5,
          'stroke-opacity': 0.2, id: 'mg-depth-link-' + dli}, depthG);
      } else {
        el('path', {d:'M '+cx+' '+cy, fill:'none',
          stroke: depthLayers[dli].color, 'stroke-width': 0.5,
          'stroke-opacity': 0.2, id: 'mg-depth-link-' + dli}, depthG);
      }
    }
    // Reverse twist links (geodesic→observer return path)
    for (var rli = 0; rli < 7; rli++) {
      var isRevLine = (rli % 2 === 1);
      if (isRevLine) {
        el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
          stroke: depthLayers[6 - rli].color, 'stroke-width': 0.3,
          'stroke-opacity': 0.08, 'stroke-dasharray':'3,4',
          id: 'mg-depth-rev-' + rli}, depthG);
      } else {
        el('path', {d:'M '+cx+' '+cy, fill:'none',
          stroke: depthLayers[6 - rli].color, 'stroke-width': 0.3,
          'stroke-opacity': 0.08, 'stroke-dasharray':'3,4',
          id: 'mg-depth-rev-' + rli}, depthG);
      }
    }
    // Anti-twist path (cubic nesting, neither chirality)
    el('path', {d:'M '+cx+' '+cy, fill:'none',
      stroke:'#58a6ff', 'stroke-width':0.4, 'stroke-opacity':0.06,
      'stroke-dasharray':'1,3', id:'mg-depth-anti'}, depthG);
    depthLayers.forEach(function(layer, i) {
      el('circle', {cx:cx, cy:cy, r: 2.5 - i * 0.2,
        fill: layer.color, opacity: 0.5, id: 'mg-depth-' + i}, depthG);
      txt(depthG, cx, cy, layer.name, layer.color, 4,
        {opacity: 0.2, id: 'mg-depth-label-' + i});
    });
  }

  // ═══ IS LAYER + LEGEND: live particles + status ═══
  function isLegend(svg) {
    var aliveSet = mc.aliveSet, PANELS = mc.PANELS, MAX_P = mc.MAX_P;
    el('g', {id:'mg-is'}, svg);
    txt(svg, cx, cy-38, '[\u2205]D', '#c9d1d9', 11, {'font-weight':'bold'});
    txt(svg, cx, cy-24, '1/0 = null', '#6e7681', 6);
    txt(svg, cx, cy-12, 'IS\u00d7WAS\u00d7WILLBE', '#8b949e', 7);
    txt(svg, cx, cy+2, '= \u03c0', '#58a6ff', 9, {'font-weight':'bold'});
    txt(svg, cx, cy+16, 'over under inside itself', '#484f58', 5.5);
    txt(svg, cx, cy+30, aliveSet.size+'/'+PANELS.length+' alive', '#6e7681', 7, {id:'mg-alive-count'});
    el('circle', {cx:cx, cy:cy, r:28, fill:'none', stroke:'#58a6ff',
      'stroke-width':0.3, 'stroke-opacity':0.1, 'stroke-dasharray':'1,3'}, svg);
    el('circle', {cx:cx, cy:cy, r:14, fill:'none', stroke:'#c9d1d9',
      'stroke-width':0.3, 'stroke-opacity':0.06, 'stroke-dasharray':'1,3'}, svg);

    var lgG = el('g', {id:'mg-legend'}, svg);
    txt(lgG, 14, H-84, '[\u2205]D \u2014 null dimension. 1/0 = over\u00b7under\u00b7inside itself', '#c9d1d9', 7, {'text-anchor':'start', 'font-weight':'bold'});
    txt(lgG, 14, H-73, 'IS\u00d7WAS\u00d7WILLBE = \u03c0 \u2014 each body = \u03c0^(1/3) \u2248 1.46', '#8b949e', 6.5, {'text-anchor':'start'});
    txt(lgG, 14, H-62, 'C(n) = \u03c0^(n/2) observes. Gap: \u03c0^(3/2)/\u03c0 = \u221a\u03c0 = cost of collapse', '#6e7681', 6.5, {'text-anchor':'start'});
    [['[\u2205]D: \u03c0^(1/3) \u2248 1.46 \u2192 null','#c9d1d9'],
     ['1D: \u221a\u03c0 \u2248 1.77 \u2192 f = 0.56','#9b59b6'],
     ['2D: \u03c0 \u2248 3.14 \u2192 f = 0.32','#4a8fb8'],
     ['3D: \u03c0^1.5 \u2248 5.57 \u2192 f = 0.18','#5ab87a'],
     ['4D: \u03c0\u00b2 \u2248 9.87 \u2192 f = 0.10','#e85d3a']].forEach(function(leg, i) {
      var ly = H-49+i*10;
      el('circle', {cx:18, cy:ly-3, r: i===0 ? 3.5 : 3, fill:leg[1], opacity: i===0 ? 0.9 : 0.7}, lgG);
      txt(lgG, 26, ly, leg[0], '#6e7681', 6.5, {'text-anchor':'start'});
    });
    [[W-160,'signal transit',2,'#58a6ff',0.8],[W-98,'alive',3,'#5ab87a',1],[W-62,'dormant',2,'#6e7681',0.25]].forEach(function(l) {
      el('circle', {cx:l[0], cy:H-33, r:l[2], fill:l[3], opacity:l[4]}, lgG);
      txt(lgG, l[0]+7, H-30, l[1], '#6e7681', 6.5, {'text-anchor':'start'});
    });
    txt(lgG, W-10, H-14, '\u03c0-budget: \u230a\u03c0\u00b3\u230b=' + MAX_P + ' particles', '#484f58', 5.5, {'text-anchor':'end'});
  }

  window._membraneBuildInner = function(_mc, svg, bandG) {
    mc = _mc; el = mc.el; txt = mc.txt;
    PI = mc.PI; TAU = 2 * PI;
    var MG = mc.MG;
    W = MG.W; H = MG.H; cx = MG.cx; cy = MG.cy; R = MG.R;

    ionoObs(bandG);
    var wasG = ring(svg);
    panels(wasG);
    stress(svg);
    epitopes(svg);
    var wbG = bodiesGroup(svg);
    overlay(wbG, svg);
    helixDepth(wbG);
    isLegend(svg);
  };
})();
