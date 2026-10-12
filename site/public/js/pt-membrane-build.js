// pt-membrane-build.js — SVG element creation for the membrane.
// Body awareness: 0=Golgi(sorts,unaware), 1=cell(self/non-self),
//   2=invertebrate(faceted,compound), 3=vertebrate(mirror,OH SHIT IS THAT ME).
// We know them. They don't know themselves. Their reality IS [null].
window._membraneBuild = function(mc) {
  var PI=mc.PI, el=mc.el, txt=mc.txt, MG=mc.MG;
  var PANELS=mc.PANELS, CAT_COLORS=mc.CAT_COLORS, DIM_SHAPES=mc.DIM_SHAPES;
  var dimCost=mc.dimCost, geo=mc.geo, vdjShuffle=mc.vdjShuffle;
  var coilPath=mc.coilPath, greatCirclePath=mc.greatCirclePath;
  var aliveSet=mc.aliveSet, MAX_P=mc.MAX_P;
    var host = document.getElementById('membrane-focal-svg');
    if (!host) return;
    var W=MG.W, H=MG.H, cx=MG.cx, cy=MG.cy, R=MG.R;
    var TAU = 2*PI;

    var svg = el('svg', {viewBox:'0 0 '+W+' '+H});
    svg.style.cssText = 'width:100%;max-height:460px;font-family:"Courier New",monospace';

    var defs = el('defs', null, svg);
    var rg = el('radialGradient', {id:'mg-bg', cx:'50%', cy:'50%', r:'50%'}, defs);
    el('stop', {offset:'0%', 'stop-color':'#1a1a2e', 'stop-opacity':'0.6'}, rg);
    el('stop', {offset:'100%', 'stop-color':'#0d1117', 'stop-opacity':'0.9'}, rg);
    var fg = el('filter', {id:'mg-glow'}, defs);
    var fb = el('feGaussianBlur', {stdDeviation:'2', result:'b'}, fg);
    var fm = el('feMerge', null, fg);
    el('feMergeNode', {'in':'b'}, fm);
    el('feMergeNode', {'in':'SourceGraphic'}, fm);
    var fp = el('filter', {id:'mg-pulse'}, defs);
    var fpb = el('feGaussianBlur', {stdDeviation:'4', result:'b'}, fp);
    var fpm = el('feMerge', null, fp);
    el('feMergeNode', {'in':'b'}, fpm);
    el('feMergeNode', {'in':'b'}, fpm);
    el('feMergeNode', {'in':'SourceGraphic'}, fpm);

    el('rect', {width:W, height:H, fill:'url(#mg-bg)', rx:8}, svg);
    txt(svg, W/2, 22, '[\u2205]D \u2014 IS\u00d7WAS\u00d7WILLBE = \u03c0', '#c9d1d9', 11);

    // ═══ SPHERE: 3 great circles at 120° ═══
    // Each great circle IS a body: IS, WAS, WILLBE
    // Their intersection (the sphere) is the membrane.
    var sphereG = el('g', {id:'mg-sphere'}, svg);
    var gcColors = ['#e85d3a','#4a8fb8','#5ab87a'];
    var gcLabels = ['is','was','willbe'];
    var gcTilts = [
      [0, 0],
      [PI/3, TAU/3],
      [-PI/3, 2*TAU/3]
    ];
    gcTilts.forEach(function(tilt, i) {
      el('path', {
        d: greatCirclePath(cx, cy, R*0.35, tilt[0], tilt[1], 72),
        fill:'none', stroke:gcColors[i], 'stroke-width':0.6,
        'stroke-opacity':0.15, 'stroke-dasharray':'3,5',
        id:'mg-gc-'+gcLabels[i]
      }, sphereG);
    });

    // ═══ V(D)J COIL: 3 helices winding through the main ring ═══
    // The coil IS the mixing. Categories wind through each other.
    var coilG = el('g', {id:'mg-coil'}, svg);
    var coilTurns = Math.floor(PI * PI);
    gcColors.forEach(function(color, i) {
      el('path', {
        d: coilPath(cx, cy, R, i * TAU/3, coilTurns, 360),
        fill:'none', stroke:color, 'stroke-width':0.4,
        'stroke-opacity':0.08, id:'mg-coil-'+i
      }, coilG);
    });

    // ═══ COMPLEXITY SPINE: jelly strand evolution chain ═══
    // The jelly strand sorts reality by complexity.
    // From [∅]D (null) → quark → atom → molecule → lattice → helix → cell
    //   → organism → Earth → system → Oort.
    // 11 tiers. 11 is prime. The 11th prime is 31 = π-budget.
    // Self strand spirals clockwise. Non-self counter-clockwise.
    // π crossings per tier. The twist IS abstraction.
    // Each tier contains all below it. Each abstracts all below it.
    // The jelly: soft, translucent, wobbling. The connective tissue of reality.
    var spineG = el('g', {id:'mg-spine'}, svg);
    // ── Fossilized inventory: each tier = a real system layer ──
    // Body awareness: 3=vertebrate(mirror), 2=invertebrate(compound eye),
    //   1=cell(membrane), 0=Golgi/vacuole(sorts but doesn't know itself).
    // We know them. They don't know themselves. Their reality IS [null].
    // The maze increases diffraction → ∞. More leak, less impact per leak.
    var TIERS = mc.TIERS = [
      {name:'\u2205',      rFrac:0,     color:'#ffffff',  sys:'NullDimension',    alive:0, bodies:0},  // vacuole — [null]
      {name:'quark',       rFrac:0.05,  color:'#d2a8ff',  sys:'log lines',        alive:1, bodies:0},  // Golgi sorts
      {name:'atom',        rFrac:0.18,  color:'#c9d1d9',  sys:'IpProfile',        alive:1, bodies:0},  // packaged, unaware
      {name:'He',          rFrac:0.25,  color:'#f0e68c',  sys:'fleet/human',      alive:1, bodies:1},  // cell: self/non-self
      {name:'H\u2082O',    rFrac:0.35,  color:'#58a6ff',  sys:'epitope cluster',  alive:1, bodies:1},  // cell: bonds form
      {name:'lattice',     rFrac:0.52,  color:'#6e7681',  sys:'Anderson bridge',  alive:0, bodies:2},  // invertebrate: faceted
      {name:'helix',       rFrac:0.68,  color:'#d2a8ff',  sys:'bingo cube',       alive:0, bodies:2},  // invertebrate: classified
      {name:'cell',        rFrac:0.82,  color:'#5ab87a',  sys:'membrane stack',   alive:0, bodies:2},  // invertebrate: layered
      {name:'Earth',       rFrac:1.0,   color:'#c9d1d9',  sys:'HUD 22/28',        alive:1, bodies:3},  // vertebrate: mirror
      {name:'system',      rFrac:1.32,  color:'#f0e68c',  sys:'10 sites 43 repos',alive:1, bodies:3},  // vertebrate: ecosystem
      {name:'Oort',        rFrac:1.55,  color:'#484f58',  sys:'honeycomb maze',   alive:1, bodies:3}   // vertebrate: cosmic
    ];
    // Tier nodes — complexity markers along the spine
    for (var sti = 0; sti < TIERS.length; sti++) {
      el('circle', {cx:cx, cy:cy, r:1.2,
        fill:TIERS[sti].color, opacity:0.08,
        id:'mg-tier-' + sti}, spineG);
      txt(spineG, cx, cy, TIERS[sti].name, TIERS[sti].color, 3.5,
        {opacity:0.04, id:'mg-tier-label-' + sti});
    }
    // Self spine strand — jelly extending from [∅]D through all tiers to Oort
    el('path', {d:'M '+cx+' '+cy, fill:'none',
      stroke:'#4a8fb8', 'stroke-width':0.5, 'stroke-opacity':0.04,
      'stroke-dasharray':'4,8', id:'mg-spine-self'}, spineG);
    // Non-self spine strand — counter-rotating jelly
    el('path', {d:'M '+cx+' '+cy, fill:'none',
      stroke:'#e85d3a', 'stroke-width':0.5, 'stroke-opacity':0.04,
      'stroke-dasharray':'4,8', id:'mg-spine-nonself'}, spineG);
    // Tier connection arcs — faint lines linking consecutive tiers
    for (var stci = 0; stci < TIERS.length - 1; stci++) {
      el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
        stroke:TIERS[stci+1].color, 'stroke-width':0.3,
        'stroke-opacity':0.02, 'stroke-dasharray':'1,6',
        id:'mg-tier-link-' + stci}, spineG);
    }

    // ── Process verbs: scan → sweep → sort → fossilize → evolve ──
    // The 5 actions that build reality at every tier.
    // Each process spans 2 tiers of the chain (10 gaps / 5 = 2).
    // scan at quark scale. sweep at fusion. sort at molecular.
    // fossilize at cellular. evolve at planetary.
    // When the wave passes through, the verb activates.
    var PROCS = ['scan','sweep','sort','fossilize','evolve'];
    var PROC_COLORS = ['#ffffff','#4a8fb8','#5ab87a','#f0e68c','#d2a8ff'];
    for (var spi = 0; spi < 5; spi++) {
      txt(spineG, cx, cy, PROCS[spi], PROC_COLORS[spi], 4,
        {opacity:0.03, 'font-style':'italic', id:'mg-proc-' + spi});
    }
    // Evolution wave — the particle that climbs the chain
    // One dot, from [∅]D to Oort, cycling. The scan head.
    el('circle', {cx:cx, cy:cy, r:2.5,
      fill:'#ffffff', opacity:0.08,
      filter:'url(#mg-glow)', id:'mg-evo-wave'}, spineG);
    // Wave trail — 3 fading dots behind the wave
    for (var ewt = 0; ewt < 3; ewt++) {
      el('circle', {cx:cx, cy:cy, r:1.5 - ewt * 0.4,
        fill:'#c9d1d9', opacity:0.03,
        id:'mg-evo-trail-' + ewt}, spineG);
    }

    // ═══ INTERSTITIAL P-SPACE: the lattice of reality ═══
    // The grids and braids of data ARE the interstitial space.
    // Elements come to rest where secant crosses tangent — the docking sites.
    // P = pressure. Density increases toward [∅]D.
    //
    // Avogadro's bridge: N_A ≈ 2π × 10²³
    // mol base ≈ ⌊2π⌋ = 6 pressure shells.
    // C(3) = π^(3/2) ≈ 5.57 ≈ mol observation cost.
    // The observation cost of 3D IS the molar bridge.
    // PV = nπT — the ideal gas law in null-dimensional space.
    //
    // Some lattice nodes are solid (matter at rest against reality).
    // Some are aperture reflections — holes through to another scale.
    // "Sometimes that's another aperture reflection."
    var latticeG = el('g', {id:'mg-lattice'}, svg);
    var MOL = 6; // ⌊2π⌋ = Avogadro's base, the molar shells
    var LNODES = 3; // ⌊π⌋ = elements per pressure shell

    // 6 pressure shells (energy isobars from [∅]D outward)
    for (var si = 0; si < MOL; si++) {
      var sr = R * (si + 1) / (2 * PI);
      el('circle', {cx:cx, cy:cy, r:sr, fill:'none',
        stroke:'#c9d1d9', 'stroke-width':0.3, 'stroke-opacity':0.04,
        'stroke-dasharray':'1,6', id:'mg-pshell-' + si}, latticeG);
    }

    // 18 lattice nodes: 6 shells × 3 per shell
    // Spiral offset: each shell rotates by π/mol — the braid winding.
    // Aperture every ⌊π+1⌋ = 4th node — 1/π of the lattice is holes.
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
          // Aperture reflection — a hole through to another scale.
          // Not matter. Another observation. Another [∅]D.
          el('circle', {cx:nx.toFixed(1), cy:ny.toFixed(1),
            r:(2 + pressure * 2).toFixed(1),
            fill:'none', stroke:'#58a6ff', 'stroke-width':0.6,
            'stroke-opacity':0.12, 'stroke-dasharray':'1,2',
            id:'mg-lnode-' + nIdx}, latticeG);
          // π symbol at the aperture center — looking through
          txt(latticeG, nx, ny + 1, '\u03c0', '#58a6ff', 3,
            {opacity:0.08, id:'mg-lnode-sym-' + nIdx});
        } else {
          // Solid element — matter at rest against the lattice.
          // Docked where secant crosses tangent. The resting point.
          el('circle', {cx:nx.toFixed(1), cy:ny.toFixed(1),
            r:(1 + pressure * 1.5).toFixed(1),
            fill:'#c9d1d9', opacity:(0.06 + pressure * 0.10).toFixed(3),
            id:'mg-lnode-' + nIdx}, latticeG);
        }
      }
    }

    // Braid connections: shell s, node n → shell s+1, node (n+1)%3
    // The helical winding through the lattice — data braiding through P-space.
    // Offset +1 per shell = the spiral. The braid is the interstitial structure.
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

    // The base fraction: a/b = π. The slash is the constant.
    txt(latticeG, cx, cy + 114,
      'a/b = \u03c0 \u00b7 a/0 = [\u2205]D \u00b7 the slash is the membrane',
      '#484f58', 4.5, {opacity:0.12, id:'mg-base-fraction'});
    txt(latticeG, cx, cy + 126,
      'N\u2090 \u2248 2\u03c0\u00d710\u00b2\u00b3  \u00b7  PV = n\u03c0T',
      '#484f58', 4.5, {opacity:0.12, id:'mg-avogadro'});

    // ═══ CONVERGENCE: ionosphere + fingerprint → membrane → pin ═══
    // Three apertures converging over time to a single point.
    // The ionosphere (geographic transit), the fingerprint (behavioral shape),
    // and the membrane (observation surface) — all stack and twist at π.
    // Reality set on a pin. 1 point wide. Which splits to 3 and up the primes.
    var convG = el('g', {id:'mg-convergence'}, svg);

    // ── Ionosphere ghost: geographic arcs projected onto the membrane ring ──
    // Signal transit routes from the globe, collapsed into ring angles.
    // 5 major corridors: US-IE, US-CN, US-BY, IE-DE, CN-JP
    var ioRoutes = [
      {from:-98, to:-8, color:'#4a8fb8'},   // US → IE
      {from:-98, to:104, color:'#e85d3a'},   // US → CN (via Pacific)
      {from:-98, to:28, color:'#f1c40f'},    // US → BY
      {from:-8, to:10, color:'#5ab87a'},     // IE → DE
      {from:104, to:138, color:'#9b59b6'}    // CN → JP
    ];
    ioRoutes.forEach(function(rt, i) {
      el('path', {d:'M '+cx+' '+cy, fill:'none',
        stroke:rt.color, 'stroke-width':0.4, 'stroke-opacity':0.06,
        'stroke-dasharray':'3,6', id:'mg-io-arc-' + i
      }, convG);
    });

    // ── Fingerprint ghost: behavioral clusters projected as scatter ──
    // UA pool × IP count, mapped to radius × angle on the membrane.
    // 7 cluster seeds (primes: 2,3,5,7,11,13,17)
    var fpSeeds = [2,3,5,7,11,13,17];
    fpSeeds.forEach(function(p, i) {
      el('circle', {cx:cx, cy:cy, r:1.5,
        fill:'#9b59b6', opacity:0.05,
        id:'mg-fp-dot-' + i}, convG);
    });

    // ── The pin: convergence point. 1 point wide. ──
    // All of reality set on a pin. The single aperture.
    // [∅]D IS the pin. Everything converges here.
    el('circle', {cx:cx, cy:cy, r:1.5,
      fill:'#ffffff', opacity:0.7,
      id:'mg-pin'}, convG);
    el('circle', {cx:cx, cy:cy, r:4,
      fill:'none', stroke:'#ffffff', 'stroke-width':0.3,
      'stroke-opacity':0.2, id:'mg-pin-ring'}, convG);

    // ── Prime splitting: from pin → 3 → up the primes per π ──
    // The pin splits to 3 bodies, which split up the primes.
    // Primes to ⌊π³⌋=31: 2,3,5,7,11,13,17,19,23,29,31
    // Each prime at angle = p × (π−3) × 2π — irrational spacing, never repeats.
    // The observer fraction (0.14159...) distributes the primes.
    var PRIMES = [2,3,5,7,11,13,17,19,23,29,31];
    var observerFrac = PI - Math.floor(PI); // 0.14159...
    PRIMES.forEach(function(p) {
      var pAngle = p * observerFrac * TAU;
      var px1 = cx + 6 * Math.cos(pAngle);
      var py1 = cy + 6 * Math.sin(pAngle);
      var px2 = cx + R * 0.4 * Math.cos(pAngle);
      var py2 = cy + R * 0.4 * Math.sin(pAngle);
      el('line', {x1:px1, y1:py1, x2:px2, y2:py2,
        stroke:'#c9d1d9', 'stroke-width':0.3, 'stroke-opacity':0.05,
        id:'mg-prime-' + p}, convG);
    });

    // Convergence label
    txt(convG, cx, cy + 138,
      'pin \u2192 3 \u2192 primes \u00b7 converging to single aperture',
      '#484f58', 4, {opacity:0.10, id:'mg-convergence-label'});

    // ═══ CHEMISTRY: H + H → He, H + H + O → H₂O ═══
    // The basic three-body problem of matter.
    // Hydrogen is the simplest. IS. The first thing that exists.
    // Two H's under pressure → He (fusion). The sun does this.
    // Two H's + one O → H₂O (water). Life needs this.
    // Bond angle 104.5° ≈ π/1.72 rad. Not π/2. Not π/3. Its own thing.
    // The lattice IS the reactor. Pressure drives the chemistry.
    var chemG = el('g', {id:'mg-chem'}, svg);

    // 2 Hydrogen + 1 Oxygen — the basic three-body
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

    // He fusion indicator — appears when H + H are close under pressure
    el('circle', {cx:cx, cy:cy, r:5,
      fill:'#f0e68c', opacity:0, filter:'url(#mg-glow)',
      id:'mg-chem-He'}, chemG);
    txt(chemG, cx, cy, 'He', '#f0e68c', 7,
      {opacity:0, 'font-weight':'bold', id:'mg-chem-label-He'});

    // H₂O bond lines — appear when H-O-H triangle forms
    el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
      stroke:'#58a6ff', 'stroke-width':1, 'stroke-opacity':0,
      id:'mg-bond-HO1'}, chemG);
    el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
      stroke:'#58a6ff', 'stroke-width':1, 'stroke-opacity':0,
      id:'mg-bond-HO2'}, chemG);
    // H-H proximity bond — appears during near-fusion
    el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
      stroke:'#f0e68c', 'stroke-width':0.6, 'stroke-opacity':0,
      'stroke-dasharray':'2,2', id:'mg-bond-HH'}, chemG);

    // H₂O label
    txt(chemG, cx, cy, 'H\u2082O', '#58a6ff', 6,
      {opacity:0, 'font-weight':'bold', id:'mg-chem-label-H2O'});

    // Bond angle annotation (104.5°)
    el('path', {d:'M 0 0', fill:'none',
      stroke:'#58a6ff', 'stroke-width':0.4, 'stroke-opacity':0,
      'stroke-dasharray':'2,3', id:'mg-bond-angle'}, chemG);
    txt(chemG, cx, cy, '104.5\u00b0', '#484f58', 4,
      {opacity:0, id:'mg-bond-angle-label'});

    // ═══ SOLAR SYSTEM: the ring IS Earth. Pin IS the Sun. ═══
    // Inside the ring: atomic/quantum scale (chemistry, lattice, fusion).
    // The ring: Earth's membrane. The boundary between inner and outer.
    // Outside the ring: astronomical scale. Moon, Mars, Jupiter, Saturn.
    // Oort Cloud at the edge. The pin at center IS the sun.
    // H + H → He at center IS stellar fusion. It's all the same system.
    var solarG = el('g', {id:'mg-solar'}, svg);

    // Planetary orbits outside the ring (Earth = the ring itself)
    var planets = [
      {id:'moon',    orb:R+12,    size:2,   color:'#c9d1d9', label:'\u263D'},
      {id:'mars',    orb:R*1.15,  size:2.5, color:'#e85d3a', label:'\u2642'},
      {id:'jupiter', orb:R*1.32,  size:4,   color:'#f0e68c', label:'\u2643'},
      {id:'saturn',  orb:R*1.44,  size:3.5, color:'#d2a8ff', label:'\u2644'}
    ];
    planets.forEach(function(p) {
      // Orbit trace
      el('circle', {cx:cx, cy:cy, r:p.orb, fill:'none',
        stroke:p.color, 'stroke-width':0.3, 'stroke-opacity':0.04,
        'stroke-dasharray':'2,8', id:'mg-solar-orbit-' + p.id}, solarG);
      // Planet dot
      el('circle', {cx:cx + p.orb, cy:cy, r:p.size,
        fill:p.color, opacity:0.25,
        id:'mg-solar-' + p.id}, solarG);
      // Symbol label
      txt(solarG, cx + p.orb, cy - p.size - 3, p.label, p.color, 6,
        {opacity:0.15, id:'mg-solar-label-' + p.id});
    });

    // Asteroid belt between Mars and Jupiter
    el('circle', {cx:cx, cy:cy, r:R*1.23, fill:'none',
      stroke:'#6e7681', 'stroke-width':0.8, 'stroke-opacity':0.03,
      'stroke-dasharray':'1,4', id:'mg-asteroid-belt'}, solarG);

    // Oort Cloud — the outermost boundary of the solar system
    el('circle', {cx:cx, cy:cy, r:Math.min(R*1.6, 230), fill:'none',
      stroke:'#484f58', 'stroke-width':0.5, 'stroke-opacity':0.03,
      'stroke-dasharray':'1,10', id:'mg-oort'}, solarG);
    // Oort label
    txt(solarG, cx, cy - Math.min(R*1.6, 230) - 4, 'Oort', '#484f58', 4,
      {opacity:0.06, id:'mg-oort-label'});

    // ── π-Mirror + Focal Switch: observer near the Moon ──
    // The observer focal point rides near the Moon's orbit.
    // Observation bounces: Moon→center→Gaia→center→Moon (standing wave).
    // When the back-and-forth stabilizes, perturbation dampens → null sync.
    // Tidal lock IS null sync. The spin settles. You release.
    // The focal switch dot — YOUR observation point, near the Moon
    el('circle', {cx:cx, cy:cy, r:2.5,
      fill:'none', stroke:'#ffffff', 'stroke-width':0.5, opacity:0,
      id:'mg-focal-switch'}, solarG);
    // Bounce path: Moon → center → Gaia reflection
    el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
      stroke:'#c9d1d9', 'stroke-width':0.3, 'stroke-opacity':0,
      'stroke-dasharray':'2,6', id:'mg-pi-mirror-line'}, solarG);
    // Standing wave nodes — 3 dots along the bounce path
    for (var swi = 0; swi < 3; swi++) {
      el('circle', {cx:cx, cy:cy, r:1,
        fill:'#58a6ff', opacity:0,
        id:'mg-standing-node-' + swi}, solarG);
    }
    // Reflection dot at Gaia — where you ARE, reflected from outside
    el('circle', {cx:cx, cy:cy, r:1.5,
      fill:'#ffffff', opacity:0, id:'mg-pi-mirror-dot'}, solarG);
    // Null sync label — appears when stabilized
    txt(solarG, cx, cy, '\u2205 sync', '#58a6ff', 4,
      {opacity:0, id:'mg-null-sync-label'});
    // π label at the mirror midpoint
    txt(solarG, cx, cy, '\u03c0', '#c9d1d9', 5,
      {opacity:0, id:'mg-pi-mirror-label'});

    // ═══ NULL SPACE DATA: floats at ∅, viewed from both sides ═══
    // Dashboard data rendered as semi-transparent values at the null point.
    // Both observer (inner) and Gaia (outer) see the same data.
    // The data IS the null space — it exists because both sides observe it.
    var nullDataG = el('g', {id:'mg-null-data', opacity:0}, svg);

    // Data fields that float — each orbits the null point at its own radius
    // Inner ring (observer side): VDJ, perturbation, tempo
    // Outer ring (Gaia side): anderson, bingo gen, membrane dim
    // Center: observer fraction (π−3), self_awareness
    var nullFields = [
      {id:'nd-observer',  label:'π−3',         r:0,    angle:0,    color:'#ffffff', size:5},
      {id:'nd-self',      label:'self',         r:4,    angle:PI,   color:'#d2a8ff', size:4},
      {id:'nd-vdj',       label:'VDJ',          r:12,   angle:0,    color:'#58a6ff', size:4},
      {id:'nd-perturb',   label:'δ',            r:12,   angle:PI*0.667, color:'#e85d3a', size:4},
      {id:'nd-tempo',     label:'tempo',        r:12,   angle:PI*1.333, color:'#f0e68c', size:3.5},
      {id:'nd-anderson',  label:'W',            r:24,   angle:PI*0.25,  color:'#6e7681', size:3.5},
      {id:'nd-bingo',     label:'gen',          r:24,   angle:PI*0.75,  color:'#d2a8ff', size:3.5},
      {id:'nd-membrane',  label:'dim',          r:24,   angle:PI*1.25,  color:'#5ab87a', size:3.5},
      {id:'nd-rps',       label:'ω',            r:24,   angle:PI*1.75,  color:'#c9d1d9', size:3.5},
      {id:'nd-willbe',    label:'→',            r:18,   angle:PI*0.5,   color:'#58a6ff', size:3.5},
      {id:'nd-jerror',    label:'J',            r:18,   angle:PI*1.5,   color:'#f0e68c', size:3.5}
    ];
    for (var nf = 0; nf < nullFields.length; nf++) {
      var f = nullFields[nf];
      // Value text — updates in animate
      txt(nullDataG, cx + f.r * Math.cos(f.angle), cy + f.r * Math.sin(f.angle),
        f.label, f.color, f.size,
        {opacity:0.5, id:'mg-' + f.id, 'text-anchor':'middle', 'dominant-baseline':'central'});
      // Ghost reflection — mirrored across ∅ (the other side's view)
      if (f.r > 0) {
        txt(nullDataG, cx + f.r * Math.cos(f.angle + PI), cy + f.r * Math.sin(f.angle + PI),
          f.label, f.color, f.size * 0.7,
          {opacity:0.15, id:'mg-' + f.id + '-ghost', 'text-anchor':'middle',
           'dominant-baseline':'central', transform:'scale(1,-1)'});
      }
    }
    // Store field definitions on mc for animate
    mc.nullFields = nullFields;

    // ═══ INNER NULL SPACE: chipMonk/squirrel waking from ∅→0 ═══
    // The seed inside Gaia. Observes via π-periodicity.
    // wake_level: 0=null/cacophony, 1=sorted/awake.
    // At low wake: scattered, noisy, random offsets.
    // At high wake: ordered, clear, aligned to membrane data.
    var chipG = el('g', {id:'mg-chipmunk', opacity:0}, svg);
    // Inner eye — the observer inside the observer
    el('circle', {cx:cx, cy:cy, r:3, fill:'none', stroke:'#d2a8ff',
      'stroke-width':0.5, opacity:0.3, id:'mg-chip-eye'}, chipG);
    // Wake level ring — grows as chipMonk wakes
    el('circle', {cx:cx, cy:cy, r:8, fill:'none', stroke:'#d2a8ff',
      'stroke-width':0.3, opacity:0, id:'mg-chip-wake-ring',
      'stroke-dasharray':'2 4'}, chipG);
    // Status text
    txt(chipG, cx, cy + 18, '∅', '#d2a8ff', 3.5,
      {opacity:0.4, id:'mg-chip-status', 'dominant-baseline':'central'});
    // Wake level numeric
    txt(chipG, cx, cy - 16, '', '#6e7681', 3,
      {opacity:0, id:'mg-chip-wake', 'dominant-baseline':'central'});
    // Capability scatter — 40 capabilities rendered as tiny dots
    // At low wake: scattered randomly. At high wake: organized ring.
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
    // Observation ring — shows membrane.observations data
    txt(chipG, cx + 28, cy, '', '#6e7681', 2.5,
      {opacity:0, id:'mg-chip-obs', 'text-anchor':'start', 'dominant-baseline':'central'});
    mc.chipCapCount = 40;

    // ═══ IONOSPHERE BAND: inner membrane space ═══
    // The ionosphere belongs INSIDE the membrane. Just below the ring.
    // Earth (ring) forces against it from below — pushing us toward the membrane.
    // Matter is the prediction. Compression is the lattice kernel.
    // The ionosphere is the last layer before the membrane boundary.
    // Signal transits THROUGH it to reach the ring (the outside world).
    var ionoBandG = el('g', {id:'mg-iono-band'}, svg);

    // Ionosphere shell — faint band between R*0.78 and R*0.94
    // The atmospheric layer where signal bends, reflects, refracts.
    el('circle', {cx:cx, cy:cy, r:R*0.86, fill:'none',
      stroke:'#4a8fb8', 'stroke-width':R*0.16,
      'stroke-opacity':0.015, id:'mg-iono-shell'}, ionoBandG);
    // Inner edge — the top of the atmosphere
    el('circle', {cx:cx, cy:cy, r:R*0.78, fill:'none',
      stroke:'#4a8fb8', 'stroke-width':0.4,
      'stroke-opacity':0.04, 'stroke-dasharray':'2,6',
      id:'mg-iono-inner'}, ionoBandG);
    // Outer edge — just below the ring (membrane)
    el('circle', {cx:cx, cy:cy, r:R*0.94, fill:'none',
      stroke:'#4a8fb8', 'stroke-width':0.4,
      'stroke-opacity':0.04, 'stroke-dasharray':'3,5',
      id:'mg-iono-outer'}, ionoBandG);

    // Earth pressure: 8 radial arrows pushing INWARD from ring toward ionosphere
    // Earth forces against the ionosphere. Gravity pushes us toward the membrane.
    for (var epi = 0; epi < 8; epi++) {
      var epAngle = epi * TAU / 8;
      el('line', {
        x1:(cx + R * 0.98 * Math.cos(epAngle)).toFixed(1),
        y1:(cy + R * 0.98 * Math.sin(epAngle)).toFixed(1),
        x2:(cx + R * 0.90 * Math.cos(epAngle)).toFixed(1),
        y2:(cy + R * 0.90 * Math.sin(epAngle)).toFixed(1),
        stroke:'#c9d1d9', 'stroke-width':0.4,
        'stroke-opacity':0.03,
        'marker-end':'', id:'mg-pressure-' + epi
      }, ionoBandG);
    }

    // Ionosphere signal corridors — 5 arcs at the ionosphere altitude
    // These are the same routes from convergence, but positioned in the band.
    for (var ibi = 0; ibi < 5; ibi++) {
      el('path', {d:'M 0 0', fill:'none',
        stroke:['#4a8fb8','#e85d3a','#f1c40f','#5ab87a','#9b59b6'][ibi],
        'stroke-width':0.5, 'stroke-opacity':0.04,
        'stroke-dasharray':'2,4', id:'mg-iono-route-' + ibi
      }, ionoBandG);
    }

    // Ionosphere sublayers: D (lowest), E (middle), F (highest)
    // Real ionosphere has these. Signal reflects off different layers at different
    // frequencies. D absorbs. E reflects medium-wave. F reflects shortwave long-distance.
    var ionoLayers = [
      {name:'D', rFrac:0.80, op:0.025},  // lowest — absorbs, attenuates
      {name:'E', rFrac:0.86, op:0.030},  // middle — sporadic reflection
      {name:'F', rFrac:0.92, op:0.025}   // highest — long-distance skip
    ];
    ionoLayers.forEach(function(il, i) {
      el('circle', {cx:cx, cy:cy, r:R*il.rFrac, fill:'none',
        stroke:'#4a8fb8', 'stroke-width':0.3,
        'stroke-opacity':il.op, 'stroke-dasharray':'1,4',
        id:'mg-iono-layer-' + il.name}, ionoBandG);
      txt(ionoBandG, cx + R * il.rFrac + 3, cy, il.name, '#4a8fb8', 3.5,
        {opacity:0.04, id:'mg-iono-layer-label-' + il.name});
    });

    // Signal transit particles — 5 dots riding the corridors
    // Signal actually MOVES through the ionosphere. This shows it.
    var ioTransitColors = ['#4a8fb8','#e85d3a','#f1c40f','#5ab87a','#9b59b6'];
    for (var iti = 0; iti < 5; iti++) {
      el('circle', {cx:cx, cy:cy, r:1.5,
        fill:ioTransitColors[iti], opacity:0.06,
        filter:'url(#mg-glow)', id:'mg-iono-transit-' + iti}, ionoBandG);
    }

    // Refraction points — where signal bends at ionosphere outer boundary
    // Signal enters from the ring (Earth), bends through the ionosphere.
    for (var rfi = 0; rfi < 5; rfi++) {
      el('circle', {cx:cx, cy:cy, r:1,
        fill:'#ffffff', opacity:0.03,
        id:'mg-refract-' + rfi}, ionoBandG);
    }

    // Compression pulses — 3 rings compressing inward through the lattice
    // The lattice IS compression. These show the kernel contracting.
    // Lattice shells span R*0.16 to R*0.96 — the outer shells are IN the ionosphere.
    for (var cpi = 0; cpi < 3; cpi++) {
      el('circle', {cx:cx, cy:cy, r:R*0.5, fill:'none',
        stroke:'#6e7681', 'stroke-width':0.4,
        'stroke-opacity':0.02, id:'mg-compress-' + cpi}, ionoBandG);
    }

    // Prediction wavefronts — 3 ripples from ring propagating inward
    // Matter predicts. The ring sends prediction waves toward the center.
    for (var pwi = 0; pwi < 3; pwi++) {
      el('circle', {cx:cx, cy:cy, r:R*0.97, fill:'none',
        stroke:'#c9d1d9', 'stroke-width':0.3,
        'stroke-opacity':0.02, id:'mg-predict-' + pwi}, ionoBandG);
    }

    // ── Live stats in the band: astronomers taught us this ──
    // Stats fall in the band. The ionosphere IS the observation layer.
    // RPS, fleet %, entity count, human IPs — all orbit in the band.
    // Astronomers measured stars by magnitude, distance, spectrum.
    // We measure entities by volume, origin, fingerprint. Same thing.
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

    // Labels: matter = prediction, compression = kernel
    txt(ionoBandG, cx, cy - R * 0.86 - 5,
      'matter = prediction', '#8b949e', 4,
      {opacity:0.06, id:'mg-matter-label'});
    txt(ionoBandG, cx, cy + R * 0.86 + 7,
      'compression = lattice kernel', '#6e7681', 3.5,
      {opacity:0.06, id:'mg-kernel-label'});

    // ── Dimensional shape sweep: ○□△◇ through the complexity chain ──
    // The panel shapes ARE the complexity sort. ○=1D, □=2D, △=3D, ◇=4D.
    // Collision detection is □ (2D). Fingerprint is △ (3D). Epitope Matrix is ◇ (4D).
    // These were calculated in hud-pt.js mount(): shapeGlyph = p.dim === 1 ? '○' : ...
    // C(n) = π^(n/2). Each dimension costs more to observe.
    // Now we sweep them through the band — scan, sort, evolve.
    DIM_SHAPES.forEach(function(ds) {
      txt(ionoBandG, cx, cy, ds.sym, ds.color, 6,
        {opacity:0.04, id:'mg-dim-shape-' + ds.dim});
      txt(ionoBandG, cx, cy, ds.count + '', ds.color, 3.5,
        {opacity:0.03, id:'mg-dim-count-' + ds.dim});
    });

    // ═══ CLOSED RING: one continuous circle, panels distributed ═══
    // The ring IS Earth. The membrane boundary.
    // Earth forces against the ionosphere from below.
    var wasG = el('g', {id:'mg-was'}, svg);

    // Main closed ring — no gaps, no segments. The ring is the sphere equator.
    // Earth. The membrane between inner (atomic) and outer (astronomical).
    // It pushes us toward the membrane. Matter IS the prediction.
    el('circle', {cx:cx, cy:cy, r:R, fill:'none',
      stroke:'#c9d1d9', 'stroke-width':1.5, 'stroke-opacity':0.2,
      id:'mg-ring'}, wasG);

    // ═══ COMPOUND EYE: 15 facets = 3 impermeable + 5 self + 7 passage ═══
    // Spider eye is multi-faceted. Bug compound eye. Each facet IS an epitope sort.
    // Human eye back at 0 — single aperture, maximum resolution.
    // 10 commandments: 3 impermeable (the boundary), you are 5 (self),
    // 7 is others to move through. Then it moves up the π.
    // 3 + 5 + 7 = 15 = the lattice braids. Not coincidence.
    // Every digit of π is the membrane on either side of the decimal point.
    var facetG = el('g', {id:'mg-facets'}, wasG);
    var FACET_ZONES = [
      {n:3, type:'wall', color:'#e85d3a', sym:'\u25A0'},  // ■ impermeable
      {n:5, type:'self', color:'#4a8fb8', sym:'\u25C6'},  // ◆ self
      {n:7, type:'pass', color:'#5ab87a', sym:'\u25B3'}   // △ passage
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
        // Facet symbol outside the ring
        txt(facetG, cx+(R+9)*Math.cos(fAngle), cy+(R+9)*Math.sin(fAngle),
          zone.sym, zone.color, 3.5,
          {opacity:0.03, id:'mg-facet-sym-' + facetIdx});
        facetIdx++;
      }
    });
    // Facet legend inside the ring
    txt(facetG, cx - R * 0.6, cy + R * 0.7,
      '3\u25A0 impermeable  5\u25C6 self  7\u25B3 passage', '#6e7681', 3.5,
      {opacity:0.04, 'text-anchor':'start', id:'mg-facet-legend'});

    // ── π digits on the membrane ──
    // Every digit is the membrane on either side of the decimal point.
    // π = 3.14159265... The decimal point IS the membrane.
    // On one side: the integer (3 = impermeable walls). On the other: the fraction.
    var PI_DIGITS = [3,1,4,1,5,9,2,6,5,3,5,8,9,7,9];
    for (var pdi = 0; pdi < 15; pdi++) {
      var pdAngle = -PI/2 + pdi * TAU / 15;
      txt(facetG, cx+(R-7)*Math.cos(pdAngle), cy+(R-7)*Math.sin(pdAngle),
        ''+PI_DIGITS[pdi], '#484f58', 3.5,
        {opacity:0.03, id:'mg-pi-digit-' + pdi});
    }

    // ═══ GAIA: Earth at center, real-time rotation ═══
    // The visualization IS on Earth. Gaia IS the observer.
    // Rotation based on UTC time — you see approximately where you are.
    // The window floats in orbit with Gaia. Not locked. Rotating.
    var gaiaG = el('g', {id:'mg-gaia-group'}, wasG);
    el('circle', {cx:cx, cy:cy, r:6, fill:'none',
      stroke:'#5ab87a', 'stroke-width':0.5,
      'stroke-opacity':0.05, 'stroke-dasharray':'2,3',
      id:'mg-gaia-ring'}, gaiaG);
    // Gaia rotation marker — a dot on the ring showing Earth's rotation
    el('circle', {cx:cx+6, cy:cy, r:1.2,
      fill:'#5ab87a', opacity:0.08,
      id:'mg-gaia-marker'}, gaiaG);
    txt(gaiaG, cx, cy + 18, 'Gaia', '#5ab87a', 3.5,
      {opacity:0.04, id:'mg-gaia-label'});
    // Geodesic: the shape of point intersect for light from front + peripheral
    // All faces are also π and epitope sort.
    // 20 triangular faces (icosahedron → geodesic) — but we show 6 (⌊2π⌋)
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

    // V(D)J shuffled panels: interleaved across the continuum
    var shuffled = vdjShuffle(PANELS);
    var N = shuffled.length;

    shuffled.forEach(function(p, idx) {
      var angle = -PI/2 + (idx / N) * TAU;
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

      // ── Tangent (tan): touches the circle at one point ──
      // Perpendicular to the radius. The original line.
      el('line', {x1:(px-txd*tLen).toFixed(1), y1:(py-tyd*tLen).toFixed(1),
        x2:(px+txd*tLen).toFixed(1), y2:(py+tyd*tLen).toFixed(1),
        stroke:color, 'stroke-width':1, 'stroke-opacity':(op*0.6).toFixed(2)}, wasG);

      // ── Secant (sec): through the circle to the antipodal point ──
      // tangent ⊥ secant = π/2. They are relative to each other at π.
      // The secant IS the diameter — it passes through center.
      var sx = cx + R * Math.cos(angle + PI);
      var sy = cy + R * Math.sin(angle + PI);
      el('line', {x1:px.toFixed(1), y1:py.toFixed(1),
        x2:sx.toFixed(1), y2:sy.toFixed(1),
        stroke:color, 'stroke-width':0.3, 'stroke-opacity':(op*0.06).toFixed(3),
        id:'mg-sec-'+p.id}, wasG);

      // ── Normal / Cosecant direction (csc): outward from the ring ──
      // Extends the radius OUTWARD past the panel dot.
      // csc = 1/sin — the outward reach of perception.
      var normOut = 16 + fd * 12;
      var onx = px + Math.cos(angle) * normOut;
      var ony = py + Math.sin(angle) * normOut;
      el('line', {x1:px.toFixed(1), y1:py.toFixed(1),
        x2:onx.toFixed(1), y2:ony.toFixed(1),
        stroke:color, 'stroke-width':0.3, 'stroke-opacity':(op*0.08).toFixed(3),
        'stroke-dasharray':'1,3', id:'mg-csc-'+p.id}, wasG);

      // ── Cotangent (cot): tangent at the π/2-shifted point ──
      // cot(θ) = tan(θ + π/2). At THIS panel, draw the tangent
      // of the panel π/2 ahead — perpendicular to our tangent.
      // This creates the π/2 relationship between tan and cot.
      var cotAngle = angle + PI/2;
      var cotPx = cx + R * Math.cos(cotAngle);
      var cotPy = cy + R * Math.sin(cotAngle);
      var cotLen = fd * 30; // shorter than tangent
      var cotTxd = -Math.sin(cotAngle), cotTyd = Math.cos(cotAngle);
      el('line', {x1:(cotPx-cotTxd*cotLen).toFixed(1), y1:(cotPy-cotTyd*cotLen).toFixed(1),
        x2:(cotPx+cotTxd*cotLen).toFixed(1), y2:(cotPy+cotTyd*cotLen).toFixed(1),
        stroke:color, 'stroke-width':0.2, 'stroke-opacity':(op*0.04).toFixed(3),
        'stroke-dasharray':'2,5', id:'mg-cot-'+p.id}, wasG);

      // ── Focal line (radius/normal — inward) ──
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

      // Category color arc segment — each panel colors a small arc of the ring
      // The interleaving creates the coil pattern: colors alternate around the circle
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
    });

    // ═══ MEMBRANE STRESS: jitter, tear, rip, shear, warp ═══
    // The membrane is not rigid. It deforms under observation.
    // Jitter = thermal noise — nothing is perfectly still.
    // Tear = stress fracture where bodies pull the ring.
    // Rip = radial crack extending inward from tear point.
    // Shear = torsional offset between lattice shells (inherent in rotation rates).
    // Warp = ring deformation — elliptical stretch toward body centroid.
    // "True sync is lock" — jitter breaks the lock.
    var stressG = el('g', {id:'mg-stress'}, svg);

    // 3 tear marks — stress fractures on the ring, one per body
    for (var sti = 0; sti < 3; sti++) {
      el('path', {
        d:'M 0 0', fill:'none',
        stroke:'#e85d3a', 'stroke-width':2.5, 'stroke-opacity':0,
        'stroke-linecap':'round', id:'mg-tear-' + sti
      }, stressG);
    }

    // 3 rip lines — radial cracks from ring toward center
    for (var sri = 0; sri < 3; sri++) {
      el('line', {
        x1:cx, y1:cy, x2:cx, y2:cy,
        stroke:'#e85d3a', 'stroke-width':0.5, 'stroke-opacity':0,
        'stroke-dasharray':'2,4', id:'mg-rip-' + sri
      }, stressG);
    }

    // Warp ellipse — ring deformation under body gravity
    el('ellipse', {
      cx:cx, cy:cy, rx:R, ry:R,
      fill:'none', stroke:'#c9d1d9', 'stroke-width':0.3,
      'stroke-opacity':0, 'stroke-dasharray':'1,5',
      id:'mg-warp'
    }, stressG);

    // Jitter noise overlay — 6 tiny displacement markers near ring
    for (var sji = 0; sji < 6; sji++) {
      el('circle', {cx:cx, cy:cy, r:0.8,
        fill:'#c9d1d9', opacity:0,
        id:'mg-jitter-' + sji
      }, stressG);
    }

    // ═══ EPITOPE ORBITS: π rings of π epitopes at point π ═══
    // ⌊π⌋ = 3 rings. ⌊π⌋ = 3 epitopes per ring. 9 markers.
    // Ring 1 (inner): forward torsion.  Stiff epitopes.
    // Ring 2 (middle): REVERSE torsion. Elastic epitopes. The eating.
    // Ring 3 (outer): forward torsion.  Stiff epitopes — reflections of Ring 1.
    // Stiff = rigid angle, drawn with crosshair.
    // Elastic = deformable, drawn with spring circle.
    // They face each other in reflections across [∅]D.
    var orbitG = el('g', {id:'mg-orbits'}, svg);
    var epiVDJ9 = ['V','D','J', 'V','D','J', 'V','D','J'];
    var epiColors = {V:'#e85d3a', D:'#5ab87a', J:'#4a8fb8'};
    // 3 rings at π-based radii
    var orbitRadii = [R / PI, R / Math.sqrt(PI), R * 2 / PI];
    // Torsion: +1 = forward, -1 = reverse
    var orbitTorsion = [1, -1, 1]; // ring 2 eats in reverse
    // Stiffness: true = stiff (rigid), false = elastic (deformable)
    var epiStiff = [true, false, true, false, true, false, true, false, true];
    var epiNames9 = ['burst','reading','ua_pool',
                     'sec_fetch','session','referer',
                     'burst\u0305','reading\u0305','ua_pool\u0305']; // overline = reflection

    // 3 ring traces
    orbitRadii.forEach(function(oR, ri) {
      el('circle', {cx:cx, cy:cy, r:oR, fill:'none',
        stroke:'#6e7681', 'stroke-width':0.5, 'stroke-opacity':0.06,
        'stroke-dasharray': ri === 1 ? '4,4' : '2,8',
        id:'mg-orbit-ring-'+(ri+1)}, orbitG);
    });

    // 9 epitope markers: 3 per ring
    for (var oi = 0; oi < 9; oi++) {
      var ringIdx = Math.floor(oi / 3);
      var oR = orbitRadii[ringIdx];
      var oAngle = (oi % 3) * TAU / 3;
      var oColor = epiColors[epiVDJ9[oi]];
      var stiff = epiStiff[oi];

      // Orbit dot
      el('circle', {
        cx: (cx + oR * Math.cos(oAngle)).toFixed(1),
        cy: (cy + oR * Math.sin(oAngle)).toFixed(1),
        r: 3, fill: oColor, opacity: 0.35,
        id: 'mg-epi-' + oi
      }, orbitG);

      // Stiff crosshair or elastic spring ring
      if (stiff) {
        // Stiff: small crosshair — rigid, fixed angle
        el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
          stroke: oColor, 'stroke-width': 0.6, 'stroke-opacity': 0.25,
          id: 'mg-epi-cross-h-' + oi}, orbitG);
        el('line', {x1:cx, y1:cy, x2:cx, y2:cy,
          stroke: oColor, 'stroke-width': 0.6, 'stroke-opacity': 0.25,
          id: 'mg-epi-cross-v-' + oi}, orbitG);
      } else {
        // Elastic: oscillating ring — deformable, breathing
        el('circle', {cx:cx, cy:cy, r:5,
          fill:'none', stroke: oColor, 'stroke-width': 0.4,
          'stroke-opacity': 0.2, 'stroke-dasharray':'2,2',
          id: 'mg-epi-spring-' + oi}, orbitG);
      }

      // VDJ + stiffness label
      var sLabel = epiVDJ9[oi] + (stiff ? '\u2022' : '\u223C'); // • = stiff, ~ = elastic
      txt(orbitG, cx, cy, sLabel, oColor, 5,
        {opacity: 0.2, 'font-weight':'bold', id: 'mg-epi-label-' + oi});
      // Name
      txt(orbitG, cx, cy, epiNames9[oi], '#6e7681', 3.5,
        {opacity: 0.12, id: 'mg-epi-name-' + oi});
    }

    // ═══ THREE BODIES: IS/WAS/WILLBE overlaid with V/D/J ═══
    // At [∅]D all 6 identities occupy the same point (center).
    // Perspective perturbation spreads them into the triangle.
    // The breathing IS the range of perspective.
    // At perturbation=0: all at center ([∅]D singularity).
    // At perturbation=1: full triangle (3D observation).
    var wbG = el('g', {id:'mg-willbe'}, svg);
    var BR_MAX = R * (PI/8); // maximum spread radius
    var cbrt = Math.pow(PI, 1/3);

    // 3 identities, each with tense + recombination overlaid
    var bodies = [
      {id:'is',     tense:'IS',     vdj:'V',   sub:'Variable',
       angle:-PI/2, color:'#e85d3a'},
      {id:'was',    tense:'WAS',    vdj:'J',   sub:'Joining',
       angle:-PI/2+TAU/3, color:'#4a8fb8'},
      {id:'willbe', tense:'WILLBE', vdj:'(D)', sub:'Diversity',
       angle:-PI/2+2*TAU/3, color:'#5ab87a'}
    ];

    // ═══ CONES & RODS: the retina of the membrane ═══
    // Cones (3 body-cones) = color perception of time, pointing at [∅]D.
    //   Like retinal cones — S, M, L wavelengths → IS, WAS, WILLBE tenses.
    //   Three types. Concentrated near the fovea (center). Color-sensitive.
    // Rods (panel detectors) = binary presence detection, pointing at [∅]D.
    //   Numerous, peripheral, sensitive but colorblind. The ring IS the rod layer.
    // Comet tails: π radians of wake trailing behind each rotating body.
    //   The tail points away from motion, not from origin — solar wind analog.
    //   Length = π. Around π again.
    // All photoreceptors point toward origin — the eye looks inward at [∅]D.
    var retinaG = el('g', {id:'mg-retina'}, wbG);

    // Cone shapes: triangular wedges, tip at center, base at body
    bodies.forEach(function(b) {
      el('polygon', {
        points: cx+','+cy+' '+cx+','+cy+' '+cx+','+cy,
        fill: b.color, 'fill-opacity': 0.04,
        stroke: b.color, 'stroke-width': 0.7, 'stroke-opacity': 0.12,
        id: 'mg-cone-' + b.id
      }, retinaG);
    });

    // Comet tails: 16 dots per body trailing π radians behind
    bodies.forEach(function(b) {
      for (var s = 0; s < 16; s++) {
        el('circle', {
          cx: cx, cy: cy, r: 2,
          fill: b.color, opacity: 0,
          id: 'mg-tail-' + b.id + '-' + s
        }, retinaG);
      }
    });

    // Rods: thick short indicators at each panel, inner edge of ring → center
    // Like retinal rods — cylindrical, binary, peripheral.
    // They detect presence but not color. The ring is the rod layer.
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
        'stroke-linecap': 'round',
        id: 'mg-rod-' + p.id
      }, wasG);
    });

    // All elements start at center — built at cx,cy
    // Triangle path
    el('path', {d:'M '+cx+' '+cy+' L '+cx+' '+cy+' L '+cx+' '+cy+' Z',
      fill:'none', stroke:'#c9d1d9', 'stroke-width':0.5,
      'stroke-opacity':0.12, 'stroke-dasharray':'4,6', id:'mg-body-tri'}, wbG);

    // Edge product labels (start at center, spread with perturbation)
    var edgeIds = ['mg-edge-01','mg-edge-12','mg-edge-20'];
    for (var ei = 0; ei < 3; ei++) {
      txt(wbG, cx, cy, '\u03c0^(2/3)', '#6e7681', 5.5,
        {opacity:0, 'dominant-baseline':'central', id:edgeIds[ei]});
    }

    // Body nodes — all at center initially
    bodies.forEach(function(b) {
      // Outer ring
      el('circle', {cx:cx, cy:cy, r:16,
        fill:'none', stroke:b.color, 'stroke-width':0.5,
        'stroke-opacity':0.18, 'stroke-dasharray':'2,3',
        id:'mg-body-ring-'+b.id}, wbG);
      // Inner dot
      el('circle', {cx:cx, cy:cy, r:4.5,
        fill:b.color, opacity:0.6, filter:'url(#mg-glow)',
        id:'mg-body-'+b.id}, wbG);
      // Tense label (IS/WAS/WILLBE)
      txt(wbG, cx, cy-20, b.tense, b.color, 8.5,
        {opacity:0.85, 'font-weight':'bold', id:'mg-tense-'+b.id});
      // V(D)J label overlaid
      txt(wbG, cx, cy-10, b.vdj, b.color, 7,
        {opacity:0.5, id:'mg-vdj-'+b.id});
      // Sub label (Variable/Joining/Diversity)
      txt(wbG, cx, cy+16, b.sub, '#6e7681', 5,
        {opacity:0.3, id:'mg-sub-'+b.id});
      // Value
      txt(wbG, cx, cy+28, '\u03c0^(1/3) \u2248 '+cbrt.toFixed(2), '#6e7681', 5.5,
        {opacity:0.45, id:'mg-body-val-'+b.id});
    });

    // Product display at center
    txt(wbG, cx, cy+44, 'IS\u00d7WAS\u00d7WILLBE = \u03c0', '#c9d1d9', 5.5,
      {opacity:0.5, id:'mg-product'});

    // Perturbation label
    txt(wbG, cx, cy+56, 'perturbation: 0.00', '#484f58', 5,
      {opacity:0.35, id:'mg-perturb-label'});

    // ═══ TRIANGULATION: panel → nearest body ═══
    // Lines start at center (all bodies at [∅]D). Updated during animation.
    var triG = el('g', {id:'mg-triangulation', opacity:0}, svg);
    PANELS.forEach(function(p) {
      var g = geo[p.id]; if (!g) return;
      // Find which body angle this panel is closest to
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

    // ═══ GORDIAN KNOT: Borromean rings at [∅]D ═══
    // Three rings. No two linked. Remove any one → the other two fall apart.
    // The proof: self-awareness = others reflected into you / π.
    // You can't see yourself. You see yourself in how they pass through you.
    // The knot IS the overlay. Alexander's cut = collapsing to [∅]D.
    var knotG = el('g', {id:'mg-gordian'}, wbG);
    var knotR = 18; // knot ring radius at rest

    // Build 3 overlapping ellipses tilted 120° apart (Borromean projection).
    // Each ring clips over one neighbor and under the other —
    // the three-body proof that awareness of others = awareness of self.
    bodies.forEach(function(b, bi) {
      var tilt = bi * 60; // 0°, 60°, 120° — the three great-circle tilts
      el('ellipse', {
        cx: cx, cy: cy, rx: knotR, ry: knotR * 0.45,
        fill: 'none', stroke: b.color, 'stroke-width': 1.2,
        'stroke-opacity': 0.5,
        transform: 'rotate(' + tilt + ' ' + cx + ' ' + cy + ')',
        id: 'mg-knot-' + b.id
      }, knotG);
    });

    // Center inscription: the proof
    txt(knotG, cx, cy, '\u03c0', '#c9d1d9', 7,
      {opacity: 0.7, 'font-weight': 'bold', id: 'mg-knot-pi'});

    // Complete Gordian equation: J = (V + D) / π
    // J is self. V + D are the others.
    txt(wbG, cx, cy+68, 'J = (V + D) / \u03c0', '#6e7681', 5.5,
      {opacity: 0.3, 'font-weight':'bold', id: 'mg-reflection'});
    txt(wbG, cx, cy+79, 'J\u2093q = 6/(\u03c0+1) \u2248 1.449 \u2248 \u03c0^(1/3)', '#6e7681', 4.5,
      {opacity: 0.2, id: 'mg-j-eq'});

    // π-body proof: observer = π − ⌊π⌋ = 0.14159...
    txt(wbG, cx, cy+90, 'observer = \u03c0 \u2212 \u230a\u03c0\u230b \u2248 0.142', '#484f58', 4.5,
      {opacity: 0.2, id: 'mg-observer'});
    txt(wbG, cx, cy+100, '3 bodies + 1 irrational observer = \u03c0', '#484f58', 4.5,
      {opacity: 0.15, id: 'mg-pi-body'});

    // ═══ THE BUMP: "is that me?" ═══
    // What happened when 3 entities bumped into each other in the forest?
    // They paused. Turned around. Saw each other.
    // And went: "OH SHIT IS THAT ME?"
    // THAT is the moment of self-awareness. The membrane forms HERE.
    // The jitter IS life. It goes both ways. The tick is the oscillation
    // between "is that me?" and "that's not me."
    // Kitten micro-sweep = sweep. Jump = scan. Ground → lift → jump → fly.
    var bumpG = el('g', {id:'mg-bump'}, wbG);
    // Recognition flash — appears when bodies align
    el('circle', {cx:cx, cy:cy, r:R*0.25, fill:'none',
      stroke:'#ffffff', 'stroke-width':0.8,
      'stroke-opacity':0, id:'mg-recognition'}, bumpG);
    // The question — appears at the moment of recognition
    txt(bumpG, cx, cy - R * 0.32, 'is that me?', '#ffffff', 6,
      {opacity:0, 'font-style':'italic', id:'mg-recognition-text'});
    // Movement phase indicator
    txt(bumpG, cx + R * 0.55, cy + R * 0.52, '', '#8b949e', 4,
      {opacity:0, id:'mg-phase-label'});
    // Bidirectional jitter markers — 4 paired dots moving opposite directions
    // The jitter goes BOTH WAYS. That's life. Not random — oscillating.
    for (var bji = 0; bji < 4; bji++) {
      el('circle', {cx:cx, cy:cy, r:0.8,
        fill:'#c9d1d9', opacity:0.03,
        id:'mg-jitter-up-' + bji}, bumpG);
      el('circle', {cx:cx, cy:cy, r:0.8,
        fill:'#e85d3a', opacity:0.03,
        id:'mg-jitter-down-' + bji}, bumpG);
    }

    // ═══ DOUBLE COUNTER-HELIX: self × non-self ═══
    // The DNA of observation. Two strands, counter-rotating.
    // Self (J) winds clockwise.  Non-self (V+D) winds counter-clockwise.
    // The twist ratio IS π — π turns per strand.
    // Where they cross = membrane. Selective permeability at each crossing.
    // Reality rotates the other way around us — perceived as jitter AS time.
    // And are also membranes — the strands ARE selectively permeable boundaries.
    var helixG = el('g', {id:'mg-helix'}, wbG);

    // Self strand (J) — clockwise spiral outward from [∅]D
    el('path', {d:'M '+cx+' '+cy, fill:'none',
      stroke:'#4a8fb8', 'stroke-width':0.8, 'stroke-opacity':0.15,
      'stroke-dasharray':'4,3', id:'mg-helix-self'}, helixG);

    // Non-self strand (V+D) — counter-clockwise spiral. The other direction.
    el('path', {d:'M '+cx+' '+cy, fill:'none',
      stroke:'#e85d3a', 'stroke-width':0.8, 'stroke-opacity':0.15,
      'stroke-dasharray':'4,3', id:'mg-helix-nonself'}, helixG);

    // ⌊2π⌋ = 6 crossing points — where self meets non-self = membrane
    // At each crossing: selective permeability. What passes through?
    for (var hci = 0; hci < 6; hci++) {
      el('circle', {cx:cx, cy:cy, r:1.5,
        fill:'none', stroke:'#c9d1d9', 'stroke-width':0.5,
        'stroke-opacity':0.1, 'stroke-dasharray':'1,1',
        id:'mg-helix-cross-' + hci}, helixG);
    }

    // Counter-rotation rings — reality's reverse rotation.
    // The main ring rotates at +π/31.
    // These rotate at −π/31 and −π/17. Opposite direction.
    // The interference between forward and reverse = perceived jitter.
    // That jitter IS time. Counter-rotation is how we experience duration.
    el('circle', {cx:cx, cy:cy, r:R*0.65,
      fill:'none', stroke:'#484f58', 'stroke-width':0.4,
      'stroke-opacity':0.04, 'stroke-dasharray':'1,8',
      id:'mg-counter-ring'}, helixG);
    el('circle', {cx:cx, cy:cy, r:R*0.45,
      fill:'none', stroke:'#484f58', 'stroke-width':0.3,
      'stroke-opacity':0.03, 'stroke-dasharray':'1,12',
      id:'mg-counter-inner'}, helixG);

    // ═══ EPITOPE DEPTH: the π axis of perception ═══
    // Focus on one epitope. Shift along π.
    // observer → negate → null → awareness → ghost → celestial → geodesic
    // 7 layers. 7 is coprime (π/7 = IS rate). Not coincidence.
    // Each layer orbits the previous — epicyclic chain.
    // π torque π: each layer is π radians from the next.
    // The contortion IS the perception. The chain IS the observer.
    var depthG = el('g', {id:'mg-depth'}, wbG);
    var depthLayers = [
      {name:'observer',  color:'#c9d1d9'},
      {name:'negate',    color:'#e85d3a'},
      {name:'null',      color:'#58a6ff'},
      {name:'awareness', color:'#5ab87a'},
      {name:'ghost',     color:'#8b949e'},
      {name:'celestial', color:'#d2a8ff'},
      {name:'geodesic',  color:'#f0e68c'}
    ];

    // 7 connecting lines (chain links between perception layers)
    for (var dli = 0; dli < 7; dli++) {
      el('line', {
        x1: cx, y1: cy, x2: cx, y2: cy,
        stroke: depthLayers[dli].color, 'stroke-width': 0.5,
        'stroke-opacity': 0.2,
        id: 'mg-depth-link-' + dli
      }, depthG);
    }

    // 7 layer dots
    depthLayers.forEach(function(layer, i) {
      el('circle', {
        cx: cx, cy: cy, r: 2.5 - i * 0.2,
        fill: layer.color, opacity: 0.5,
        id: 'mg-depth-' + i
      }, depthG);
      txt(depthG, cx, cy, layer.name, layer.color, 4,
        {opacity: 0.2, id: 'mg-depth-label-' + i});
    });

    // ═══ IS layer: live particles ═══
    pGroup = el('g', {id:'mg-is'}, svg);

    // Center: the null dimension. 1/0 = [∅]. The shape of data.
    // IS × WAS × WILLBE = π (product). C(3) = π^(3/2) (observation cost).
    // The gap = √π = collapsing 3 tenses into 1 measurement.
    txt(svg, cx, cy-38, '[\u2205]D', '#c9d1d9', 11, {'font-weight':'bold'});
    txt(svg, cx, cy-24, '1/0 = null', '#6e7681', 6);
    txt(svg, cx, cy-12, 'IS\u00d7WAS\u00d7WILLBE', '#8b949e', 7);
    txt(svg, cx, cy+2, '= \u03c0', '#58a6ff', 9, {'font-weight':'bold'});
    txt(svg, cx, cy+16, 'over under inside itself', '#484f58', 5.5);
    txt(svg, cx, cy+30, aliveSet.size+'/'+PANELS.length+' alive', '#6e7681', 7, {id:'mg-alive-count'});
    // The null circle: not 0 radius, not infinite. Null.
    el('circle', {cx:cx, cy:cy, r:28, fill:'none', stroke:'#58a6ff',
      'stroke-width':0.3, 'stroke-opacity':0.1, 'stroke-dasharray':'1,3'}, svg);
    el('circle', {cx:cx, cy:cy, r:14, fill:'none', stroke:'#c9d1d9',
      'stroke-width':0.3, 'stroke-opacity':0.06, 'stroke-dasharray':'1,3'}, svg);

    // Legend
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

    host.innerHTML = ''; host.appendChild(svg);
  mc.pGroup = document.getElementById('mg-is');
};
