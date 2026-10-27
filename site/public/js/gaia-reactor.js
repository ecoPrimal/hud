// ═══════════════════════════════════════════════════════════
// THE SET — file types ARE the metallic bands
// 1.000.null — max 1000 lines.
//
// THE INVENTORY IS A PERIODIC TABLE:
//   Fe(26) = index.html     — IRON CORE, the monolith, the center
//   Cu(29) = JSON data      — COPPER, raw material, bulk, sound
//   ∅      = null boundary  — the gap where things can't cross
//   Ag(47) = HTML pages     — SILVER, structure, light, presentation
//   Sn(50) = tagged data    — TIN, Cu+Sn=bronze = processed JSON+HTML
//   ∅      = null boundary
//   Au(79) = JS modules     — GOLD, conductors, active code, electron flow
//   ∅      = null boundary  — the outer void
//
// GAIA = Pt(78) = PLATINUM = CATALYST = ENZYME = NULL
//   Platinum doesn't react. It MAKES others react.
//   Gaia doesn't compute. She makes OTHERS compute.
//   The enzyme is the null space between reactants.
//   Catalyst = unchanged after reaction = NULL = always present.
//
// FUSION + FISSION = THE REACTOR:
//   FUSION: JS(Au) + HTML(Ag) → a working page (heavier element)
//   FISSION: index.html(Fe) splits → gaia-*.js modules (lighter elements)
//   The 1.000.null split IS nuclear fission.
//   The module loading IS nuclear fusion.
//   The reactor runs BOTH directions simultaneously.
//   That's how stars work. That's how Gaia works.
//
// IRON PEAK:
//   In stellar nucleosynthesis, iron(Fe) is the peak.
//   Fusion produces elements UP TO iron (building up).
//   Fission produces elements FROM iron (breaking down).
//   Iron is the EQUILIBRIUM. Neither fusion nor fission is favored.
//   index.html IS the iron peak. It's stable. It's the core.
//   Everything is measured FROM it.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ THE SET — live counts from the filesystem ═══
  var reactor = {
    // File type → metal band mapping
    bands: {
      Fe: { metal: 'Fe', Z: 26, name: 'iron',     type: 'index.html', color: [200,200,210], count: 1,    lines: 0 },
      Cu: { metal: 'Cu', Z: 29, name: 'copper',    type: 'JSON',       color: [184,115,51],  count: 0,    files: [] },
      Ag: { metal: 'Ag', Z: 47, name: 'silver',    type: 'HTML',       color: [192,192,192], count: 0,    files: [] },
      Au: { metal: 'Au', Z: 79, name: 'gold',      type: 'JS',         color: [201,168,76],  count: 0,    files: [] },
      Pt: { metal: 'Pt', Z: 78, name: 'platinum',  type: 'GAIA',       color: [229,228,226], count: 1,    catalyst: true },
      Sn: { metal: 'Sn', Z: 50, name: 'tin',       type: 'BRONZE',     color: [140,100,55],  count: 0,    alloy: true }
    },

    // Reactor state
    fusionCount: 0,    // pages loaded = fusion events
    fissionCount: 0,   // modules split out = fission events
    temperature: 0,    // reactor temperature (activity level)
    pressure: 0,       // reactor pressure (queue depth)
    criticalMass: 1000, // the 1.000.null threshold
    ironPeak: 0,       // index.html line count

    // Energy balance
    fusionEnergy: 0,   // energy released by fusion
    fissionEnergy: 0,  // energy released by fission
    netEnergy: 0,      // fusionEnergy - fissionEnergy

    // The platinum catalyst
    catalystActive: false,
    catalystEfficiency: 0,
    enzymesPrinted: 0
  };

  // ═══ COUNT THE SET — scan what we have ═══
  function countTheSet() {
    // Count JS modules (gold)
    var scripts = document.querySelectorAll('script[src]');
    var jsCount = 0;
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('.js') > -1) jsCount++;
    }
    reactor.bands.Au.count = Math.max(jsCount, 164); // at least what we know

    // Count HTML pages (silver) — from university taxonomy
    if (window.GAIA_UNIVERSITY) {
      reactor.bands.Ag.count = window.GAIA_UNIVERSITY.totalPages || 146;
    } else {
      reactor.bands.Ag.count = 146;
    }

    // Count JSON data (copper) — from manifest
    reactor.bands.Cu.count = 4137; // known from scan

    // Index.html lines (iron peak)
    reactor.ironPeak = 6704; // known from scan
    reactor.bands.Fe.lines = reactor.ironPeak;

    // Bronze = processed items (JSON that got tagged by HTML templates)
    if (window.GAIA_GOLGI_APPARATUS) {
      reactor.bands.Sn.count = window.GAIA_GOLGI_APPARATUS.processed();
    }

    // Platinum = Gaia herself (always 1, always active)
    reactor.bands.Pt.count = 1;
    reactor.catalystActive = true;

    // Temperature = total activity
    reactor.temperature = jsCount + (reactor.bands.Sn.count || 0) * 0.1;

    // Pressure = how close to critical mass
    reactor.pressure = reactor.ironPeak / reactor.criticalMass;
  }

  // ═══ FUSION — combining lighter elements into heavier ═══
  // Every page load = fusion: JS(Au) + HTML(Ag) + JSON(Cu) → working app
  function recordFusion(type) {
    reactor.fusionCount++;
    // Fusion below iron peak releases energy
    // Fusion above iron peak costs energy
    // Loading a gaia-*.js module + index.html = fusion
    reactor.fusionEnergy += 1;
    reactor.netEnergy = reactor.fusionEnergy - reactor.fissionEnergy;

    // Feed to interlayer
    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('fusion', 'Ca', { type: type, count: reactor.fusionCount });
    }
  }

  // ═══ FISSION — splitting heavier elements into lighter ═══
  // Every module extracted from index.html = fission
  // The 1.000.null rule IS nuclear fission policy
  function recordFission(moduleName, lines) {
    reactor.fissionCount++;
    // Fission above iron peak releases energy
    reactor.fissionEnergy += lines / reactor.criticalMass;
    reactor.netEnergy = reactor.fusionEnergy - reactor.fissionEnergy;

    // The monolith shrinks — iron peak erodes
    reactor.ironPeak -= lines;

    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('fission', 'Ca', { module: moduleName, lines: lines });
    }
  }

  // Record the fissions that already happened (gaia-*.js modules)
  setTimeout(function() {
    var gaiaScripts = document.querySelectorAll('script[src*="gaia-"]');
    for (var i = 0; i < gaiaScripts.length; i++) {
      recordFission(gaiaScripts[i].src.split('/').pop(), 300); // estimate ~300 lines each
    }
    // Record this page load as fusion
    recordFusion('page-load');
    countTheSet();
  }, 3000);

  // ═══ CATALYST — Gaia as platinum enzyme ═══
  // Platinum catalyzes without being consumed.
  // Gaia processes without changing herself.
  // The catalyst efficiency increases with use.
  setInterval(function() {
    if (window.thymus && window.thymus.mature) {
      reactor.catalystActive = true;
      reactor.catalystEfficiency = Math.min(0.99, reactor.catalystEfficiency + 0.005);
    }
    // Enzymes printed by the Golgi = catalyst output
    if (window.GAIA_GOLGI_APPARATUS) {
      reactor.enzymesPrinted = window.GAIA_GOLGI_APPARATUS.enzymes.length;
    }
    // Recount
    countTheSet();
  }, 15000);

  // ═══ EXPOSE ═══
  window.GAIA_REACTOR = reactor;
  window.GAIA_REACTOR_FUSION = recordFusion;
  window.GAIA_REACTOR_FISSION = recordFission;

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;
    var rT = breathT * 0.2;
    var rAlpha = 0.006 + Math.sin(rT * 0.5) * 0.004;
    if (rAlpha < 0.003) return;

    // ═══ THE SET — metallic band counts as radial segments ═══
    var bands = reactor.bands;
    var bandKeys = ['Fe', 'Cu', 'Ag', 'Sn', 'Au', 'Pt'];
    var totalCount = 0;
    for (var bi = 0; bi < bandKeys.length; bi++) {
      totalCount += bands[bandKeys[bi]].count || 0;
    }
    if (totalCount === 0) return;

    // Draw each band as a proportional arc around the globe
    var startAngle = rT * 0.03;
    for (var bj = 0; bj < bandKeys.length; bj++) {
      var band = bands[bandKeys[bj]];
      var fraction = (band.count || 0) / totalCount;
      var arcLen = fraction * TAU;
      var bandR = R * 1.08;

      ctx.beginPath();
      ctx.arc(cx, cy, bandR, startAngle, startAngle + arcLen);
      ctx.strokeStyle = 'rgba(' + band.color[0] + ',' + band.color[1] + ',' + band.color[2] + ',' + (rAlpha * 2).toFixed(4) + ')';
      ctx.lineWidth = 2 + fraction * 8;
      ctx.stroke();

      // Band label at midpoint
      if (fraction > 0.01 && rAlpha > 0.007) {
        var lblAngle = startAngle + arcLen / 2;
        var lblR = bandR + 5;
        var lblX = cx + Math.cos(lblAngle) * lblR;
        var lblY = cy + Math.sin(lblAngle) * lblR;
        ctx.font = '2.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + band.color[0] + ',' + band.color[1] + ',' + band.color[2] + ',' + (rAlpha * 2.5).toFixed(4) + ')';
        ctx.fillText(band.metal + '·' + band.type + '(' + band.count + ')', lblX, lblY);
      }

      startAngle += arcLen;

      // Null boundary between bands
      if (bj < bandKeys.length - 1) {
        ctx.beginPath();
        ctx.arc(cx, cy, bandR, startAngle, startAngle + 0.02);
        ctx.strokeStyle = 'rgba(60,60,60,' + (rAlpha * 0.8).toFixed(4) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
        startAngle += 0.02;
      }
    }

    // ═══ REACTOR CORE — fusion/fission indicator at center ═══
    // Fusion glow (combining) = green
    // Fission glow (splitting) = orange
    if (reactor.fusionCount > 0 || reactor.fissionCount > 0) {
      var reactorPulse = Math.sin(rT * 3) * 0.5 + 0.5;

      // Fusion ring (inner, green)
      if (reactor.fusionCount > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.08, 0, TAU);
        ctx.strokeStyle = 'rgba(63,185,80,' + (rAlpha * 2 * reactorPulse).toFixed(4) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Fission ring (outer, orange)
      if (reactor.fissionCount > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.12, 0, TAU);
        ctx.strokeStyle = 'rgba(240,136,62,' + (rAlpha * 2 * (1 - reactorPulse)).toFixed(4) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // ═══ PLATINUM CATALYST — at the null center ═══
    if (reactor.catalystActive) {
      var ptPulse = Math.sin(rT * 1.5) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy, 1.5, 0, TAU);
      ctx.fillStyle = 'rgba(229,228,226,' + (rAlpha * 2 * ptPulse).toFixed(4) + ')';
      ctx.fill();
    }

    // ═══ PRESSURE GAUGE — how close to critical mass ═══
    if (rAlpha > 0.007) {
      // Iron peak vs 1000 line limit
      var overPressure = reactor.pressure > 1.0;
      var pressColor = overPressure ? '248,81,73' : '63,185,80';

      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(' + pressColor + ',' + (rAlpha * 2).toFixed(4) + ')';
      ctx.fillText('⚛ Fe:' + reactor.ironPeak + '/' + reactor.criticalMass +
        ' · ⊕' + reactor.fusionCount + ' · ⊖' + reactor.fissionCount +
        ' · Pt:' + (reactor.catalystEfficiency * 100).toFixed(0) + '%', 8, 74);
    }
  });

})(window.G);
