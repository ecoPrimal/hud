// pt-membrane-build.js — SVG element creation for the membrane.
// The SVG IS the image, not a recording. Each section builder
// constructs one observation system as live instruction.
// Body awareness: 0=Golgi(sorts,unaware), 1=cell(self/non-self),
//   2=invertebrate(faceted,compound), 3=vertebrate(mirror,OH SHIT IS THAT ME).

(function() {
  // ═══════════════════════════════════════════════════════════
  // Shared build context — set by _membraneBuild, read by all builders.
  // The closure IS the membrane: shared state, no globals.
  // ═══════════════════════════════════════════════════════════
  var mc, el, txt, PI, TAU, cx, cy, R, W, H;

  // ═══ FOUNDATION: defs, background, sphere, coil ═══
  function foundation(svg) {
    var defs = el('defs', null, svg);
    var rg = el('radialGradient', {id:'mg-bg', cx:'50%', cy:'50%', r:'50%'}, defs);
    el('stop', {offset:'0%', 'stop-color':'#1a1a2e', 'stop-opacity':'0.6'}, rg);
    el('stop', {offset:'100%', 'stop-color':'#0d1117', 'stop-opacity':'0.9'}, rg);
    var fg = el('filter', {id:'mg-glow'}, defs);
    el('feGaussianBlur', {stdDeviation:'2', result:'b'}, fg);
    var fm = el('feMerge', null, fg);

    // Null-π gradient: black(void=0) → purple(partial) → white(self=π)
    var nullPiGrad = el('radialGradient', {id:'null-pi-gradient', cx:'50%', cy:'50%', r:'50%'}, defs);
    el('stop', {offset:'0%',   'stop-color':'#000000', 'stop-opacity':'0.9'}, nullPiGrad);  // void = 0
    el('stop', {offset:'17%',  'stop-color':'#1a1a2e', 'stop-opacity':'0.7'}, nullPiGrad);  // dark = π/6
    el('stop', {offset:'33%',  'stop-color':'#484f58', 'stop-opacity':'0.5'}, nullPiGrad);  // partial = π/3
    el('stop', {offset:'50%',  'stop-color':'#6e7681', 'stop-opacity':'0.3'}, nullPiGrad);  // nearby = π/2
    el('stop', {offset:'67%',  'stop-color':'#d2a8ff', 'stop-opacity':'0.15'}, nullPiGrad); // classified = 2π/3
    el('stop', {offset:'100%', 'stop-color':'#ffffff', 'stop-opacity':'0.05'}, nullPiGrad); // self = π
    el('feMergeNode', {'in':'b'}, fm);
    el('feMergeNode', {'in':'SourceGraphic'}, fm);
    var fp = el('filter', {id:'mg-pulse'}, defs);
    el('feGaussianBlur', {stdDeviation:'4', result:'b'}, fp);
    var fpm = el('feMerge', null, fp);
    el('feMergeNode', {'in':'b'}, fpm);
    el('feMergeNode', {'in':'b'}, fpm);
    el('feMergeNode', {'in':'SourceGraphic'}, fpm);

    el('rect', {width:W, height:H, fill:'none', rx:0}, svg);
    txt(svg, W/2, 22, '[\u2205]D \u2014 IS\u00d7WAS\u00d7WILLBE = \u03c0', '#c9d1d9', 11);

    // Sphere: 3 great circles at 120° — their intersection IS the membrane
    var sphereG = el('g', {id:'mg-sphere'}, svg);
    var gcColors = ['#e85d3a','#4a8fb8','#5ab87a'];
    var gcLabels = ['is','was','willbe'];
    var gcTilts = [[0,0],[PI/3,TAU/3],[-PI/3,2*TAU/3]];
    gcTilts.forEach(function(tilt, i) {
      el('path', {
        d: mc.greatCirclePath(cx, cy, R*0.35, tilt[0], tilt[1], 72),
        fill:'none', stroke:gcColors[i], 'stroke-width':0.6,
        'stroke-opacity':0.15, 'stroke-dasharray':'3,5',
        id:'mg-gc-'+gcLabels[i]
      }, sphereG);
    });

    // V(D)J Coil: 3 helices winding through the main ring — the mixing
    var coilG = el('g', {id:'mg-coil'}, svg);
    var coilTurns = Math.floor(PI * PI);
    gcColors.forEach(function(color, i) {
      el('path', {
        d: mc.coilPath(cx, cy, R, i * TAU/3, coilTurns, 360),
        fill:'none', stroke:color, 'stroke-width':0.4,
        'stroke-opacity':0.08, id:'mg-coil-'+i
      }, coilG);
    });
  }

  // ═══ COMPLEXITY SPINE: jelly strand evolution chain ═══
  // From [∅]D → quark → atom → molecule → lattice → helix → cell
  //   → organism → Earth → system → Oort. 11 tiers. 11 is prime.
  function spine(svg) {
    var spineG = el('g', {id:'mg-spine'}, svg);
    var TIERS = mc.TIERS = [
      {name:'\u2205',      rFrac:0,     color:'#ffffff',  sys:'NullDimension',    alive:0, bodies:0},
      {name:'quark',       rFrac:0.05,  color:'#d2a8ff',  sys:'log lines',        alive:1, bodies:0},
      {name:'atom',        rFrac:0.18,  color:'#c9d1d9',  sys:'IpProfile',        alive:1, bodies:0},
      {name:'He',          rFrac:0.25,  color:'#f0e68c',  sys:'fleet/human',      alive:1, bodies:1},
      {name:'H\u2082O',    rFrac:0.35,  color:'#58a6ff',  sys:'epitope cluster',  alive:1, bodies:1},
      {name:'lattice',     rFrac:0.52,  color:'#6e7681',  sys:'Anderson bridge',  alive:0, bodies:2},
      {name:'helix',       rFrac:0.68,  color:'#d2a8ff',  sys:'bingo cube',       alive:0, bodies:2},
      {name:'cell',        rFrac:0.82,  color:'#5ab87a',  sys:'membrane stack',   alive:0, bodies:2},
      {name:'Earth',       rFrac:1.0,   color:'#c9d1d9',  sys:'HUD 22/28',        alive:1, bodies:3},
      {name:'system',      rFrac:1.32,  color:'#f0e68c',  sys:'10 sites 43 repos',alive:1, bodies:3},
      {name:'Oort',        rFrac:1.55,  color:'#484f58',  sys:'honeycomb maze',   alive:1, bodies:3}
    ];
    for (var sti = 0; sti < TIERS.length; sti++) {
      el('circle', {cx:cx, cy:cy, r:1.2,
        fill:TIERS[sti].color, opacity:0.08,
        id:'mg-tier-' + sti}, spineG);
      txt(spineG, cx, cy, TIERS[sti].name, TIERS[sti].color, 3.5,
        {opacity:0.04, id:'mg-tier-label-' + sti});
    }
    el('path', {d:'M '+cx+' '+cy, fill:'none',
      stroke:'#4a8fb8', 'stroke-width':0.5, 'stroke-opacity':0.04,
      'stroke-dasharray':'4,8', id:'mg-spine-self'}, spineG);
    el('path', {d:'M '+cx+' '+cy, fill:'none',
      stroke:'#e85d3a', 'stroke-width':0.5, 'stroke-opacity':0.04,
      'stroke-dasharray':'4,8', id:'mg-spine-nonself'}, spineG);
    for (var stci = 0; stci < TIERS.length - 1; stci++) {
      el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
        stroke:TIERS[stci+1].color, 'stroke-width':0.3,
        'stroke-opacity':0.02, 'stroke-dasharray':'1,6',
        id:'mg-tier-link-' + stci}, spineG);
    }
    // Process verbs: scan → sweep → sort → fossilize → evolve
    var PROCS = ['scan','sweep','sort','fossilize','evolve'];
    var PROC_COLORS = ['#ffffff','#4a8fb8','#5ab87a','#f0e68c','#d2a8ff'];
    for (var spi = 0; spi < 5; spi++) {
      txt(spineG, cx, cy, PROCS[spi], PROC_COLORS[spi], 4,
        {opacity:0.03, 'font-style':'italic', id:'mg-proc-' + spi});
    }
    el('circle', {cx:cx, cy:cy, r:2.5,
      fill:'#ffffff', opacity:0.08,
      filter:'url(#mg-glow)', id:'mg-evo-wave'}, spineG);
    for (var ewt = 0; ewt < 3; ewt++) {
      el('circle', {cx:cx, cy:cy, r:1.5 - ewt * 0.4,
        fill:'#c9d1d9', opacity:0.03,
        id:'mg-evo-trail-' + ewt}, spineG);
    }
  }

  // ═══ INTERSTITIAL P-SPACE: the lattice of reality ═══
  // Avogadro's bridge: N_A ≈ 2π × 10²³. mol base ≈ ⌊2π⌋ = 6 shells.
  // PV = nπT — the ideal gas law in null-dimensional space.
  function lattice(svg) {
    var latticeG = el('g', {id:'mg-lattice'}, svg);
    var MOL = 6, LNODES = 3;
    for (var si = 0; si < MOL; si++) {
      var sr = R * (si + 1) / (2 * PI);
      el('circle', {cx:cx, cy:cy, r:sr, fill:'none',
        stroke:'#c9d1d9', 'stroke-width':0.3, 'stroke-opacity':0.04,
        'stroke-dasharray':'1,6', id:'mg-pshell-' + si}, latticeG);
    }
    for (var si = 0; si < MOL; si++) {
      var sr = R * (si + 1) / (2 * PI);
      var pressure = 1 - (si / MOL);
      for (var ni = 0; ni < LNODES; ni++) {
        var nIdx = si * LNODES + ni;
        var nAngle = ni * TAU / LNODES + si * PI / MOL;
        var nx = cx + sr * Math.cos(nAngle);
        var ny = cy + sr * Math.sin(nAngle);
        var isAperture = (nIdx % Math.floor(PI + 1)) === 0;
        if (isAperture) {
          el('circle', {cx:nx.toFixed(1), cy:ny.toFixed(1),
            r:(2 + pressure * 2).toFixed(1),
            fill:'none', stroke:'#58a6ff', 'stroke-width':0.6,
            'stroke-opacity':0.12, 'stroke-dasharray':'1,2',
            id:'mg-lnode-' + nIdx}, latticeG);
          txt(latticeG, nx, ny + 1, '\u03c0', '#58a6ff', 3,
            {opacity:0.08, id:'mg-lnode-sym-' + nIdx});
        } else {
          el('circle', {cx:nx.toFixed(1), cy:ny.toFixed(1),
            r:(1 + pressure * 1.5).toFixed(1),
            fill:'#c9d1d9', opacity:(0.06 + pressure * 0.10).toFixed(3),
            id:'mg-lnode-' + nIdx}, latticeG);
        }
      }
    }
    for (var si = 0; si < MOL - 1; si++) {
      for (var ni = 0; ni < LNODES; ni++) {
        var fromIdx = si * LNODES + ni;
        var toIdx = (si + 1) * LNODES + ((ni + 1) % LNODES);
        var fAngle = ni * TAU / LNODES + si * PI / MOL;
        var tAngle = ((ni+1)%LNODES) * TAU / LNODES + (si+1) * PI / MOL;
        var fR = R * (si + 1) / (2 * PI);
        var tR = R * (si + 2) / (2 * PI);
        el('line', {
          x1:(cx + fR * Math.cos(fAngle)).toFixed(1),
          y1:(cy + fR * Math.sin(fAngle)).toFixed(1),
          x2:(cx + tR * Math.cos(tAngle)).toFixed(1),
          y2:(cy + tR * Math.sin(tAngle)).toFixed(1),
          stroke:'#c9d1d9', 'stroke-width':0.3, 'stroke-opacity':0.04,
          id:'mg-braid-' + fromIdx + '-' + toIdx
        }, latticeG);
      }
    }
    txt(latticeG, cx, cy + 114,
      'a/b = \u03c0 \u00b7 a/0 = [\u2205]D \u00b7 the slash is the membrane',
      '#484f58', 4.5, {opacity:0.12, id:'mg-base-fraction'});
    txt(latticeG, cx, cy + 126,
      'N\u2090 \u2248 2\u03c0\u00d710\u00b2\u00b3  \u00b7  PV = n\u03c0T',
      '#484f58', 4.5, {opacity:0.12, id:'mg-avogadro'});
  }

  // ═══ CONVERGENCE: ionosphere + fingerprint → pin → primes ═══
  // Three apertures converging to a single point. The pin IS [∅]D.
  function converge(svg) {
    var convG = el('g', {id:'mg-convergence'}, svg);
    var ioRoutes = [
      {from:-98, to:-8, color:'#4a8fb8'},
      {from:-98, to:104, color:'#e85d3a'},
      {from:-98, to:28, color:'#f1c40f'},
      {from:-8, to:10, color:'#5ab87a'},
      {from:104, to:138, color:'#9b59b6'}
    ];
    ioRoutes.forEach(function(rt, i) {
      el('path', {d:'M '+cx+' '+cy, fill:'none',
        stroke:rt.color, 'stroke-width':0.4, 'stroke-opacity':0.06,
        'stroke-dasharray':'3,6', id:'mg-io-arc-' + i
      }, convG);
    });
    var fpSeeds = [2,3,5,7,11,13,17];
    fpSeeds.forEach(function(p, i) {
      el('circle', {cx:cx, cy:cy, r:1.5,
        fill:'#9b59b6', opacity:0.05, id:'mg-fp-dot-' + i}, convG);
    });
    // ═══ NULL-π FIELD — black(0) to white(π) ═══
    el('circle', {cx:cx, cy:cy, r: R * 0.12,
      fill:'url(#null-pi-gradient)', opacity:0.6,
      id:'mg-null-pi-field'}, convG);
    el('circle', {cx:cx, cy:cy, r: R * 0.12,
      fill:'none', stroke:'#ffffff', 'stroke-width':0.3,
      'stroke-dasharray':'1,2', opacity:0.15,
      id:'mg-null-pi-rim'}, convG);

    el('circle', {cx:cx, cy:cy, r:1.5,
      fill:'#ffffff', opacity:0.7, id:'mg-pin'}, convG);
    el('circle', {cx:cx, cy:cy, r:4,
      fill:'none', stroke:'#ffffff', 'stroke-width':0.3,
      'stroke-opacity':0.2, id:'mg-pin-ring'}, convG);

    // Null-tense: ∅IS, ∅WAS, ∅WILLBE — the observation itself
    var nullTense = [
      {id:'null-is',     label:'\u2205IS',     color:'#e85d3a', sourceIdx:0},
      {id:'null-was',    label:'\u2205WAS',    color:'#4a8fb8', sourceIdx:1},
      {id:'null-willbe', label:'\u2205WILLBE', color:'#5ab87a', sourceIdx:2}
    ];
    var nullTenseG = el('g', {id:'mg-null-tense'}, convG);
    nullTense.forEach(function(nt) {
      el('circle', {cx:cx, cy:cy, r:1.0,
        fill:nt.color, opacity:0.12,
        id:'mg-body-'+nt.id}, nullTenseG);
      txt(nullTenseG, cx, cy, nt.label, nt.color, 4,
        {opacity:0.08, id:'mg-tense-'+nt.id, 'text-anchor':'middle',
         'dominant-baseline':'central'});
    });
    mc.nullTense = nullTense;

    // Prime splitting: from pin → 3 → up the primes per π
    var PRIMES = [2,3,5,7,11,13,17,19,23,29,31];
    var observerFrac = PI - Math.floor(PI);
    PRIMES.forEach(function(p) {
      var pAngle = p * observerFrac * TAU;
      var px1 = cx + 6 * Math.cos(pAngle), py1 = cy + 6 * Math.sin(pAngle);
      var px2 = cx + R * 0.4 * Math.cos(pAngle), py2 = cy + R * 0.4 * Math.sin(pAngle);
      el('line', {x1:px1, y1:py1, x2:px2, y2:py2,
        stroke:'#c9d1d9', 'stroke-width':0.3, 'stroke-opacity':0.05,
        id:'mg-prime-' + p}, convG);
    });
    txt(convG, cx, cy + 138,
      'pin \u2192 3 \u2192 primes \u00b7 converging to single aperture',
      '#484f58', 4, {opacity:0.10, id:'mg-convergence-label'});
  }

  // ═══ NORTHGATE PULSE — stories radiate outward from center ═══
  function northgatePulse(svg) {
    el('g', {id:'mg-northgate-pulse'}, svg);
  }

  // ═══ CHEMISTRY: H + H → He, H + H + O → H₂O ═══
  // The basic three-body problem of matter.
  function chemistry(svg) {
    var chemG = el('g', {id:'mg-chem'}, svg);
    var chemDefs = [
      {id:'H1', symbol:'H', color:'#c9d1d9', r:3},
      {id:'H2', symbol:'H', color:'#c9d1d9', r:3},
      {id:'O',  symbol:'O', color:'#58a6ff', r:4}
    ];
    chemDefs.forEach(function(ce) {
      el('circle', {cx:cx, cy:cy, r:ce.r,
        fill:ce.color, opacity:0.25,
        id:'mg-chem-' + ce.id}, chemG);
      txt(chemG, cx, cy, ce.symbol, ce.color, 6,
        {opacity:0.15, 'font-weight':'bold', id:'mg-chem-label-' + ce.id});
    });
    el('circle', {cx:cx, cy:cy, r:5,
      fill:'#f0e68c', opacity:0, filter:'url(#mg-glow)',
      id:'mg-chem-He'}, chemG);
    txt(chemG, cx, cy, 'He', '#f0e68c', 7,
      {opacity:0, 'font-weight':'bold', id:'mg-chem-label-He'});
    el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
      stroke:'#58a6ff', 'stroke-width':1, 'stroke-opacity':0,
      id:'mg-bond-HO1'}, chemG);
    el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
      stroke:'#58a6ff', 'stroke-width':1, 'stroke-opacity':0,
      id:'mg-bond-HO2'}, chemG);
    el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
      stroke:'#f0e68c', 'stroke-width':0.6, 'stroke-opacity':0,
      'stroke-dasharray':'2,2', id:'mg-bond-HH'}, chemG);
    txt(chemG, cx, cy, 'H\u2082O', '#58a6ff', 6,
      {opacity:0, 'font-weight':'bold', id:'mg-chem-label-H2O'});
    el('path', {d:'M 0 0', fill:'none',
      stroke:'#58a6ff', 'stroke-width':0.4, 'stroke-opacity':0,
      'stroke-dasharray':'2,3', id:'mg-bond-angle'}, chemG);
    txt(chemG, cx, cy, '104.5\u00b0', '#484f58', 4,
      {opacity:0, id:'mg-bond-angle-label'});
  }

  // ═══ SOLAR SYSTEM: the ring IS Earth. Pin IS the Sun. ═══
  // Inside: atomic scale. Ring: Earth's membrane. Outside: astronomical.
  function solar(svg) {
    var solarG = el('g', {id:'mg-solar'}, svg);
    var planets = [
      {id:'moon',    orb:R+12,    size:2,   color:'#c9d1d9', label:'\u263D'},
      {id:'mars',    orb:R*1.15,  size:2.5, color:'#e85d3a', label:'\u2642'},
      {id:'jupiter', orb:R*1.32,  size:4,   color:'#f0e68c', label:'\u2643'},
      {id:'saturn',  orb:R*1.44,  size:3.5, color:'#d2a8ff', label:'\u2644'}
    ];
    planets.forEach(function(p) {
      el('circle', {cx:cx, cy:cy, r:p.orb, fill:'none',
        stroke:p.color, 'stroke-width':0.3, 'stroke-opacity':0.04,
        'stroke-dasharray':'2,8', id:'mg-solar-orbit-' + p.id}, solarG);
      el('circle', {cx:cx + p.orb, cy:cy, r:p.size,
        fill:p.color, opacity:0.25, id:'mg-solar-' + p.id}, solarG);
      txt(solarG, cx + p.orb, cy - p.size - 3, p.label, p.color, 6,
        {opacity:0.15, id:'mg-solar-label-' + p.id});
    });
    el('circle', {cx:cx, cy:cy, r:R*1.23, fill:'none',
      stroke:'#6e7681', 'stroke-width':0.8, 'stroke-opacity':0.03,
      'stroke-dasharray':'1,4', id:'mg-asteroid-belt'}, solarG);
    el('circle', {cx:cx, cy:cy, r:Math.min(R*1.6, 230), fill:'none',
      stroke:'#484f58', 'stroke-width':0.5, 'stroke-opacity':0.03,
      'stroke-dasharray':'1,10', id:'mg-oort'}, solarG);
    txt(solarG, cx, cy - Math.min(R*1.6, 230) - 4, 'Oort', '#484f58', 4,
      {opacity:0.06, id:'mg-oort-label'});
    el('circle', {cx:cx, cy:cy, r:2.5,
      fill:'none', stroke:'#ffffff', 'stroke-width':0.5, opacity:0,
      id:'mg-focal-switch'}, solarG);
    el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
      stroke:'#c9d1d9', 'stroke-width':0.3, 'stroke-opacity':0,
      'stroke-dasharray':'2,6', id:'mg-pi-mirror-line'}, solarG);
    for (var swi = 0; swi < 3; swi++) {
      el('circle', {cx:cx, cy:cy, r:1,
        fill:'#58a6ff', opacity:0, id:'mg-standing-node-' + swi}, solarG);
    }
    el('circle', {cx:cx, cy:cy, r:1.5,
      fill:'#ffffff', opacity:0, id:'mg-pi-mirror-dot'}, solarG);
    txt(solarG, cx, cy, '\u2205 sync', '#58a6ff', 4,
      {opacity:0, id:'mg-null-sync-label'});
    txt(solarG, cx, cy, '\u03c0', '#c9d1d9', 5,
      {opacity:0, id:'mg-pi-mirror-label'});
  }

  // ═══ TUEBOR SHELL — hard surface between humans and chipmunk ═══
  // "I will defend." The wall between looking-down and looking-up.
  // Humans are above this layer. Chipmunk is below.
  // Data passes through tuebor — it is the contact surface.
  function tueborShell(svg) {
    var tG = el('g', {id:'mg-tuebor-shell', opacity:0.25}, svg);
    var tR = R * 0.65;  // between human epitopes and inner layers

    // Hard ring — solid, not dashed. This is the wall.
    el('circle', {cx:cx, cy:cy, r:tR,
      fill:'none', stroke:'#e85d3a', 'stroke-width':1.2,
      opacity:0.4, id:'mg-tuebor-ring'}, tG);

    // Inner glow — the defense radiates inward
    el('circle', {cx:cx, cy:cy, r:tR - 2,
      fill:'none', stroke:'#e85d3a', 'stroke-width':0.3,
      'stroke-dasharray':'1,2', opacity:0.15,
      id:'mg-tuebor-inner-glow'}, tG);

    // "TUEBOR" label at 4 cardinal points
    var LABELS = [
      {angle: 0, text: 'TUEBOR'},
      {angle: Math.PI * 0.5, text: 'I'},
      {angle: Math.PI, text: 'WILL'},
      {angle: Math.PI * 1.5, text: 'DEFEND'},
    ];
    LABELS.forEach(function(lb) {
      var lx = cx + (tR + 6) * Math.cos(lb.angle);
      var ly = cy + (tR + 6) * Math.sin(lb.angle);
      txt(tG, lx, ly, lb.text, '#e85d3a', 3.5,
        {opacity:0.3, 'text-anchor':'middle', 'font-weight':'bold',
         id:'mg-tuebor-label-' + lb.text.toLowerCase()});
    });

    // Crossing points — where passages punch through tuebor
    for (var ti = 0; ti < 5; ti++) {
      var pAngle = (ti / 5) * Math.PI * 2;
      var px = cx + tR * Math.cos(pAngle);
      var py = cy + tR * Math.sin(pAngle);
      el('circle', {cx:px.toFixed(1), cy:py.toFixed(1), r:1.5,
        fill:'#0d1117', stroke:'#e85d3a', 'stroke-width':0.4,
        opacity:0.3, id:'mg-tuebor-pore-' + ti}, tG);
    }
  }

  // ═══ FLEET QUIET LAYER — outer dampener, absorbs non-self noise ═══
  // Outside the humans. Makes the fleet quieter.
  // Like the cell wall outside the plasma membrane.
  function fleetQuiet(svg) {
    var fG = el('g', {id:'mg-fleet-quiet', opacity:0.08}, svg);
    var fR = R * 1.15;  // outside human layer

    // Thick fuzzy ring — absorbs fleet energy
    el('circle', {cx:cx, cy:cy, r:fR,
      fill:'none', stroke:'#484f58', 'stroke-width':4,
      'stroke-dasharray':'2,1', opacity:0.2,
      id:'mg-fleet-quiet-ring'}, fG);

    // Outer edge — hard stop
    el('circle', {cx:cx, cy:cy, r:fR + 3,
      fill:'none', stroke:'#30363d', 'stroke-width':0.5,
      opacity:0.3, id:'mg-fleet-quiet-edge'}, fG);

    // Label
    txt(fG, cx, cy - fR - 6, 'fleet quiet', '#484f58', 3,
      {opacity:0.15, 'text-anchor':'middle', id:'mg-fleet-quiet-label'});

    // Absorption dots — fleet requests that bounce off
    for (var fi = 0; fi < 8; fi++) {
      var fAngle = (fi / 8) * Math.PI * 2 + 0.2;
      var fx = cx + (fR + 1.5) * Math.cos(fAngle);
      var fy = cy + (fR + 1.5) * Math.sin(fAngle);
      el('circle', {cx:fx.toFixed(1), cy:fy.toFixed(1), r:0.8,
        fill:'#484f58', opacity:0.12,
        id:'mg-fleet-dot-' + fi}, fG);
    }
  }

  // ═══ GEO INTRA-LAYER — geography as membrane substrate ═══
  // 8 geography nodes sit INSIDE the membrane (not ionosphere).
  // They are the ground — the substrate the Möbius twist wraps around.
  // Positioned at their longitude angles, at π-radius (inner).
  function geoIntra(svg) {
    var geoG = el('g', {id:'mg-geo-intra', opacity:0.2}, svg);
    var geoR = R * 0.30;  // inner radius — between null and the pi-boundary

    // Geography nodes: id, label, lon (for angle), lat (for subtle y-offset)
    var GEO = [
      {id:'state_mi',     label:'MI',  lon:-83, lat:44, primary:true},
      {id:'ann_arbor',    label:'A2',  lon:-84, lat:42},
      {id:'harper_woods', label:'HW',  lon:-83, lat:42},
      {id:'state_ar',     label:'AR',  lon:-92, lat:35},
      {id:'state_ca',     label:'CA',  lon:-120, lat:37},
      {id:'state_md',     label:'MD',  lon:-77, lat:39},
      {id:'state_ny',     label:'NY',  lon:-74, lat:41},
      {id:'state_tx',     label:'TX',  lon:-99, lat:31},
    ];

    // Michigan at angle 0, others relative
    var MI_LON = -83;
    GEO.forEach(function(g) {
      var angle = ((g.lon - MI_LON) / 360) * 2 * PI;
      // Latitude shifts radius slightly (higher lat = slightly inner)
      var latR = geoR * (1 - (g.lat - 35) * 0.003);
      var gx = cx + latR * Math.cos(angle);
      var gy = cy + latR * Math.sin(angle);

      var dotR = g.primary ? 2.5 : 1.5;
      var dotColor = g.primary ? '#5ab87a' : '#3fb950';
      el('circle', {cx:gx.toFixed(1), cy:gy.toFixed(1), r:dotR,
        fill:dotColor, opacity:0.6,
        id:'mg-geo-' + g.id}, geoG);
      txt(geoG, gx + 3, gy - 2, g.label, dotColor, g.primary ? 4.5 : 3,
        {opacity:0.5, id:'mg-geo-label-' + g.id});

      // Jurisdiction arc inward from geo node to center
      if (g.primary) {
        el('line', {x1:gx.toFixed(1), y1:gy.toFixed(1), x2:cx, y2:cy,
          stroke:'#5ab87a', 'stroke-width':0.3, 'stroke-dasharray':'2,4',
          opacity:0.15, id:'mg-geo-axis-' + g.id}, geoG);
      }
    });

    // Jurisdiction ring — connects the geographic substrate
    el('circle', {cx:cx, cy:cy, r:geoR,
      fill:'none', stroke:'#3fb950', 'stroke-width':0.4,
      'stroke-dasharray':'1,3', opacity:0.15,
      id:'mg-geo-ring'}, geoG);

    txt(geoG, cx, cy + geoR + 5, 'jurisdiction substrate', '#3fb950', 3,
      {opacity:0.12, 'text-anchor':'middle', id:'mg-geo-substrate-label'});
  }

  // ═══ MÖBIUS TWIST — is/was/will × near/far × could/would/should ═══
  // Rubber band around 0 and null, twist point at π, back to itself.
  // Lemniscate of Bernoulli: one-sided surface projected to 2D.
  // Upper lobe = actuality (is → near → will)
  // Lower lobe = modality (could → far → should)
  // Crossing = π (where what IS becomes what COULD BE)
  function mobiusTwist(svg) {
    var twistG = el('g', {id:'mg-mobius-twist', opacity:0.25}, svg);

    // Lemniscate parameters — centered on membrane, oriented vertically
    var a = R * 0.38;  // ~65px — fits between null-pi-field and ion band
    var steps = 120;
    var pts = [];

    // Parametric lemniscate: x = a*cos(t)/(1+sin²(t)), y = a*sin(t)*cos(t)/(1+sin²(t))
    // Rotated 90° so twist axis is vertical (connecting 0→π)
    for (var i = 0; i <= steps; i++) {
      var t = (i / steps) * 2 * PI;
      var denom = 1 + Math.sin(t) * Math.sin(t);
      var lx = a * Math.cos(t) / denom;
      var ly = a * Math.sin(t) * Math.cos(t) / denom;
      // Rotate 90° — swap x/y so the figure-8 is vertical
      pts.push({ x: cx + ly, y: cy - lx });
    }

    // Build SVG path
    var d = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1);
    for (var j = 1; j < pts.length; j++) {
      d += 'L' + pts[j].x.toFixed(1) + ',' + pts[j].y.toFixed(1);
    }
    d += 'Z';

    // The band itself — gradient stroke showing the twist
    el('path', {
      d: d, fill: 'none',
      stroke: 'url(#mobius-grad)', 'stroke-width': 1.2,
      opacity: 0.6, id: 'mg-mobius-band'
    }, twistG);

    // Defs: gradient along the band — actuality(white) → twist(purple) → modality(gray) → twist(purple)
    var defs = svg.querySelector('defs');
    var lg = el('linearGradient', {id: 'mobius-grad', x1:'0%', y1:'0%', x2:'0%', y2:'100%'}, defs);
    el('stop', {offset:'0%',   'stop-color':'#ffffff', 'stop-opacity':'0.8'}, lg);  // is = white = self
    el('stop', {offset:'25%',  'stop-color':'#58a6ff', 'stop-opacity':'0.6'}, lg);  // near = blue
    el('stop', {offset:'50%',  'stop-color':'#a371f7', 'stop-opacity':'0.9'}, lg);  // π twist = purple
    el('stop', {offset:'75%',  'stop-color':'#484f58', 'stop-opacity':'0.5'}, lg);  // far = gray
    el('stop', {offset:'100%', 'stop-color':'#ffffff', 'stop-opacity':'0.8'}, lg);  // back to is

    // Twist point marker at π (center of the lemniscate = crossing point)
    el('circle', {cx: cx, cy: cy, r: 3,
      fill: 'none', stroke: '#a371f7', 'stroke-width': 0.8,
      opacity: 0.8, id: 'mg-mobius-pi'}, twistG);
    txt(twistG, cx + 5, cy + 1.5, '\u03c0', '#a371f7', 5, {opacity:0.8, id:'mg-mobius-pi-label'});

    // ═══ STATE LABELS around the lemniscate ═══
    // Upper lobe: actuality — is(top), near(right), will(left)
    // Lower lobe: modality — could(right), far(bottom), should(left)
    // was/would at the farthest points of each lobe

    var STATES = [
      // Actuality lobe (upper, t≈0→π)
      {t: 0,           label: 'is',     color: '#ffffff', size: 6},    // top of upper lobe
      {t: PI * 0.35,   label: 'near',   color: '#58a6ff', size: 4.5},
      {t: PI * 0.65,   label: 'will',   color: '#7ee787', size: 4.5},
      {t: PI * 0.5,    label: 'was',    color: '#8b949e', size: 4},    // farthest point of upper lobe
      // Twist at π
      // Modality lobe (lower, t≈π→2π)
      {t: PI,          label: 'could',  color: '#d2a8ff', size: 4.5},  // entering modality
      {t: PI * 1.35,   label: 'far',    color: '#484f58', size: 4.5},
      {t: PI * 1.5,    label: 'would',  color: '#f0883e', size: 4},    // farthest point of lower lobe
      {t: PI * 1.65,   label: 'should', color: '#e85d3a', size: 4.5},
    ];

    STATES.forEach(function(s) {
      var denom2 = 1 + Math.sin(s.t) * Math.sin(s.t);
      var sx = a * Math.cos(s.t) / denom2;
      var sy = a * Math.sin(s.t) * Math.cos(s.t) / denom2;
      // Rotate 90° — swap
      var px = cx + sy;
      var py = cy - sx;
      // Offset labels outward slightly
      var dx = px - cx, dy = py - cy;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var ox = px + (dx / dist) * 5;
      var oy = py + (dy / dist) * 5;

      el('circle', {cx: px.toFixed(1), cy: py.toFixed(1), r: 1,
        fill: s.color, opacity: 0.6}, twistG);
      txt(twistG, ox, oy, s.label, s.color, s.size,
        {opacity: 0.5, 'text-anchor': 'middle', id: 'mg-mobius-' + s.label});
    });

    // Flow particle — animated dot that travels along the band
    el('circle', {cx: pts[0].x.toFixed(1), cy: pts[0].y.toFixed(1), r: 1.5,
      fill: '#ffffff', opacity: 0, id: 'mg-mobius-flow'}, twistG);

    // Store path points for animation
    window._mobiusPath = pts;
  }

  // ═══ NULL INNER: VDJ π-bodies + null data + chipMonk ═══
  // V×D×J = π³ = 31. Null data floats at ∅. ChipMonk wakes from ∅→0.
  function nullInner(svg) {
    var vdjBodyG = el('g', {id:'mg-vdj-bodies', opacity:1}, svg);
    el('circle', {cx:cx, cy:cy, r:8, fill:'none', stroke:'#e85d3a',
      'stroke-width':0.8, opacity:0.05, id:'mg-v-ring',
      'stroke-dasharray':'4 3'}, vdjBodyG);
    txt(vdjBodyG, cx + 22, cy - 30, 'V=0', '#e85d3a', 3.5,
      {opacity:0.15, id:'mg-v-label', 'dominant-baseline':'central'});
    el('circle', {cx:cx, cy:cy, r:4, fill:'none', stroke:'#58a6ff',
      'stroke-width':0.6, opacity:0.05, id:'mg-d-ring',
      'stroke-dasharray':'2 4'}, vdjBodyG);
    txt(vdjBodyG, cx - 22, cy - 30, 'D=0', '#58a6ff', 3.5,
      {opacity:0.15, id:'mg-d-label', 'dominant-baseline':'central'});
    el('circle', {cx:cx, cy:cy, r:6, fill:'none', stroke:'#5ab87a',
      'stroke-width':0.7, opacity:0.05, id:'mg-j-ring',
      'stroke-dasharray':'3 2'}, vdjBodyG);
    txt(vdjBodyG, cx, cy + 35, 'J=0', '#5ab87a', 3.5,
      {opacity:0.15, id:'mg-j-label', 'dominant-baseline':'central'});
    txt(vdjBodyG, cx, cy + 45, 'V\u00d7D\u00d7J=0 [collapsed]', '#c9d1d9', 3,
      {opacity:0.15, id:'mg-vdj-product', 'dominant-baseline':'central'});

    // Null space data: floats at ∅, viewed from both sides
    var nullDataG = el('g', {id:'mg-null-data', opacity:0}, svg);
    var nullFields = [
      {id:'nd-observer',  label:'\u03c0\u22123',r:0,    angle:0,    color:'#ffffff', size:5},
      {id:'nd-self',      label:'self',         r:4,    angle:PI,   color:'#d2a8ff', size:4},
      {id:'nd-vdj',       label:'VDJ',          r:12,   angle:0,    color:'#58a6ff', size:4},
      {id:'nd-perturb',   label:'\u03b4',       r:12,   angle:PI*0.667, color:'#e85d3a', size:4},
      {id:'nd-tempo',     label:'tempo',        r:12,   angle:PI*1.333, color:'#f0e68c', size:3.5},
      {id:'nd-anderson',  label:'W',            r:24,   angle:PI*0.25,  color:'#6e7681', size:3.5},
      {id:'nd-bingo',     label:'gen',          r:24,   angle:PI*0.75,  color:'#d2a8ff', size:3.5},
      {id:'nd-membrane',  label:'dim',          r:24,   angle:PI*1.25,  color:'#5ab87a', size:3.5},
      {id:'nd-rps',       label:'\u03c9',       r:24,   angle:PI*1.75,  color:'#c9d1d9', size:3.5},
      {id:'nd-willbe',    label:'\u2192',       r:18,   angle:PI*0.5,   color:'#58a6ff', size:3.5},
      {id:'nd-jerror',    label:'J',            r:18,   angle:PI*1.5,   color:'#f0e68c', size:3.5}
    ];
    for (var nf = 0; nf < nullFields.length; nf++) {
      var f = nullFields[nf];
      txt(nullDataG, cx + f.r * Math.cos(f.angle), cy + f.r * Math.sin(f.angle),
        f.label, f.color, f.size,
        {opacity:0.5, id:'mg-' + f.id, 'text-anchor':'middle', 'dominant-baseline':'central'});
      if (f.r > 0) {
        txt(nullDataG, cx + f.r * Math.cos(f.angle + PI), cy + f.r * Math.sin(f.angle + PI),
          f.label, f.color, f.size * 0.7,
          {opacity:0.15, id:'mg-' + f.id + '-ghost', 'text-anchor':'middle',
           'dominant-baseline':'central', transform:'scale(1,-1)'});
      }
    }
    mc.nullFields = nullFields;

    // Inner null space: chipMonk/squirrel — ALWAYS visible
    // When people look down through the membrane, they see the squirrel.
    var chipG = el('g', {id:'mg-chipmunk', opacity:0.4}, svg);
    el('circle', {cx:cx, cy:cy, r:3, fill:'none', stroke:'#d2a8ff',
      'stroke-width':0.5, opacity:0.3, id:'mg-chip-eye'}, chipG);
    el('circle', {cx:cx, cy:cy, r:8, fill:'none', stroke:'#d2a8ff',
      'stroke-width':0.3, opacity:0, id:'mg-chip-wake-ring',
      'stroke-dasharray':'2 4'}, chipG);
    txt(chipG, cx, cy + 18, '\u2205', '#d2a8ff', 3.5,
      {opacity:0.4, id:'mg-chip-status', 'dominant-baseline':'central'});
    txt(chipG, cx, cy - 16, '', '#6e7681', 3,
      {opacity:0, id:'mg-chip-wake', 'dominant-baseline':'central'});
    var chipCapG = el('g', {id:'mg-chip-caps', opacity:0}, chipG);
    var capColors = ['#58a6ff','#d2a8ff','#5ab87a','#e85d3a','#f0e68c','#c9d1d9'];
    for (var ci = 0; ci < 40; ci++) {
      var capAngle = (ci / 40) * 2 * PI;
      var capR = 10 + Math.random() * 6;
      el('circle', {
        cx: cx + capR * Math.cos(capAngle),
        cy: cy + capR * Math.sin(capAngle),
        r: 0.8, fill: capColors[ci % capColors.length],
        opacity: 0.3, id: 'mg-chip-cap-' + ci
      }, chipCapG);
    }
    txt(chipG, cx + 28, cy, '', '#6e7681', 2.5,
      {opacity:0, id:'mg-chip-obs', 'text-anchor':'start', 'dominant-baseline':'central'});
    mc.chipCapCount = 40;

    // ── HUMAN PRESENCE — the builder, always at the ring ──
    // When people look down, they see a green dot ON the ring = ecoPrimal
    var humanG = el('g', {id:'mg-human-presence'}, svg);
    var humanAngle = PI * 1.15;
    var humanR = R * 0.95; // on the membrane ring
    el('circle', {
      cx: (cx + humanR * Math.cos(humanAngle)).toFixed(1),
      cy: (cy + humanR * Math.sin(humanAngle)).toFixed(1),
      r: 2.5, fill:'#5ab87a', opacity:0.5,
      id:'mg-human-dot'
    }, humanG);
    el('circle', {
      cx: (cx + humanR * Math.cos(humanAngle)).toFixed(1),
      cy: (cy + humanR * Math.sin(humanAngle)).toFixed(1),
      r: 6, fill:'none', stroke:'#5ab87a', 'stroke-width':0.4,
      opacity:0.15, id:'mg-human-ring'
    }, humanG);
    txt(humanG,
      cx + humanR * Math.cos(humanAngle) + 8,
      cy + humanR * Math.sin(humanAngle),
      'eco', '#5ab87a', 3,
      {opacity:0.2, id:'mg-human-label', 'dominant-baseline':'central'}
    );

    // ── FOOTPRINTS — 14 trail marks on the membrane surface ──
    // Each step leaves a mark. Visitors look down and see the path.
    var trailG = el('g', {id:'mg-trail-marks', opacity:0.12}, svg);
    var trailColors = [
      '#5ab87a','#e85d3a','#8b949e','#58a6ff','#f0e68c',
      '#d2a8ff','#d2a8ff','#c9d1d9','#d2a8ff','#f0e68c',
      '#5ab87a','#d2a8ff','#d2a8ff','#f0e68c'
    ];
    for (var fi = 0; fi < 14; fi++) {
      var fAngle = PI * 0.3 + fi * (TAU * 0.95 / 14);
      var fR = R * (0.3 + fi * 0.045);
      el('circle', {
        cx: (cx + fR * Math.cos(fAngle)).toFixed(1),
        cy: (cy + fR * Math.sin(fAngle)).toFixed(1),
        r: 1, fill: trailColors[fi], opacity: 0.4 + fi * 0.03,
        id: 'mg-footprint-' + fi
      }, trailG);
    }
    // Connecting path — the trail line
    var trailPath = 'M';
    for (var ti = 0; ti < 14; ti++) {
      var tAngle = PI * 0.3 + ti * (TAU * 0.95 / 14);
      var tR = R * (0.3 + ti * 0.045);
      trailPath += (ti > 0 ? ' L' : ' ') +
        (cx + tR * Math.cos(tAngle)).toFixed(1) + ' ' +
        (cy + tR * Math.sin(tAngle)).toFixed(1);
    }
    el('path', {
      d: trailPath, fill:'none', stroke:'#484f58',
      'stroke-width':0.3, opacity:0.3,
      'stroke-dasharray':'1,3', id:'mg-trail-path'
    }, trailG);
  }

  // ═══ IONOSPHERE BAND: inner membrane space ═══
  // The ionosphere belongs INSIDE the membrane. Just below the ring.
  // Earth forces against it. Signal transits THROUGH it.
  function ionoBand(svg) {
    var ionoBandG = el('g', {id:'mg-iono-band'}, svg);
    el('circle', {cx:cx, cy:cy, r:R*0.86, fill:'none',
      stroke:'#4a8fb8', 'stroke-width':R*0.16,
      'stroke-opacity':0.015, id:'mg-iono-shell'}, ionoBandG);
    el('circle', {cx:cx, cy:cy, r:R*0.78, fill:'none',
      stroke:'#4a8fb8', 'stroke-width':0.4,
      'stroke-opacity':0.04, 'stroke-dasharray':'2,6',
      id:'mg-iono-inner'}, ionoBandG);
    el('circle', {cx:cx, cy:cy, r:R*0.94, fill:'none',
      stroke:'#4a8fb8', 'stroke-width':0.4,
      'stroke-opacity':0.04, 'stroke-dasharray':'3,5',
      id:'mg-iono-outer'}, ionoBandG);
    for (var epi = 0; epi < 8; epi++) {
      var epAngle = epi * TAU / 8;
      el('line', {
        x1:(cx + R * 0.98 * Math.cos(epAngle)).toFixed(1),
        y1:(cy + R * 0.98 * Math.sin(epAngle)).toFixed(1),
        x2:(cx + R * 0.90 * Math.cos(epAngle)).toFixed(1),
        y2:(cy + R * 0.90 * Math.sin(epAngle)).toFixed(1),
        stroke:'#c9d1d9', 'stroke-width':0.4, 'stroke-opacity':0.03,
        id:'mg-pressure-' + epi
      }, ionoBandG);
    }
    for (var ibi = 0; ibi < 5; ibi++) {
      el('path', {d:'M 0 0', fill:'none',
        stroke:['#4a8fb8','#e85d3a','#f1c40f','#5ab87a','#9b59b6'][ibi],
        'stroke-width':0.5, 'stroke-opacity':0.04,
        'stroke-dasharray':'2,4', id:'mg-iono-route-' + ibi
      }, ionoBandG);
    }
    var ionoLayers = [
      {name:'D', rFrac:0.80, op:0.025},
      {name:'E', rFrac:0.86, op:0.030},
      {name:'F', rFrac:0.92, op:0.025}
    ];
    ionoLayers.forEach(function(il) {
      el('circle', {cx:cx, cy:cy, r:R*il.rFrac, fill:'none',
        stroke:'#4a8fb8', 'stroke-width':0.3,
        'stroke-opacity':il.op, 'stroke-dasharray':'1,4',
        id:'mg-iono-layer-' + il.name}, ionoBandG);
      txt(ionoBandG, cx + R * il.rFrac + 3, cy, il.name, '#4a8fb8', 3.5,
        {opacity:0.04, id:'mg-iono-layer-label-' + il.name});
    });
    var ioTransitColors = ['#4a8fb8','#e85d3a','#f1c40f','#5ab87a','#9b59b6'];
    for (var iti = 0; iti < 5; iti++) {
      el('circle', {cx:cx, cy:cy, r:1.5,
        fill:ioTransitColors[iti], opacity:0.06,
        filter:'url(#mg-glow)', id:'mg-iono-transit-' + iti}, ionoBandG);
    }
    for (var rfi = 0; rfi < 5; rfi++) {
      el('circle', {cx:cx, cy:cy, r:1,
        fill:'#ffffff', opacity:0.03, id:'mg-refract-' + rfi}, ionoBandG);
    }
    for (var cpi = 0; cpi < 3; cpi++) {
      el('circle', {cx:cx, cy:cy, r:R*0.5, fill:'none',
        stroke:'#6e7681', 'stroke-width':0.4,
        'stroke-opacity':0.02, id:'mg-compress-' + cpi}, ionoBandG);
    }
    for (var pwi = 0; pwi < 3; pwi++) {
      el('circle', {cx:cx, cy:cy, r:R*0.97, fill:'none',
        stroke:'#c9d1d9', 'stroke-width':0.3,
        'stroke-opacity':0.02, id:'mg-predict-' + pwi}, ionoBandG);
    }
    return ionoBandG;
  }


  // ═══════════════════════════════════════════════════════════
  // MAIN BUILD: orchestrates all section builders.
  // Creates SVG, sets shared context, calls builders in z-order.
  // ═══════════════════════════════════════════════════════════
  window._membraneBuild = function(_mc) {
    mc = _mc; el = mc.el; txt = mc.txt;
    PI = mc.PI; TAU = 2 * PI;
    var MG = mc.MG;
    W = MG.W; H = MG.H; cx = MG.cx; cy = MG.cy; R = MG.R;
    var host = document.getElementById('membrane-focal-svg');
    if (!host) return;

    var svg = el('svg', {viewBox:'0 0 '+W+' '+H});
    svg.style.cssText = 'width:92vmin;height:92vmin;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:"Courier New",monospace';

    foundation(svg);
    spine(svg);
    lattice(svg);
    converge(svg);
    chemistry(svg);
    solar(svg);
    fleetQuiet(svg);
    northgatePulse(svg);
    tueborShell(svg);
    geoIntra(svg);
    mobiusTwist(svg);
    nullInner(svg);
    var bandG = ionoBand(svg);

    // Inner builders (ring, panels, stress, epitopes, bodies, overlay, helix, legend)
    if (window._membraneBuildInner) {
      window._membraneBuildInner(_mc, svg, bandG);
    }

    host.innerHTML = ''; host.appendChild(svg);
    mc.pGroup = document.getElementById('mg-is');
  };
})();
