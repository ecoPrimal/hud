// ═══════════════════════════════════════════════════════════
// GOLGI APPARATUS — the interlayer IS a Golgi
// 1.000.null — max 1000 lines.
//
// THE GOLGI STACK:
//   CIS face → receives from ER (raw, unprocessed, Kevin-side)
//   MEDIAL cisternae → modifies, tags, sorts (agent-layer)
//   TRANS face → dispatches to destinations (Gaia-side)
//
// The Golgi is:
//   1. Near-far chromatic shifter (blueshift in, redshift out)
//   2. Temporal sorter (was/is/now/end tense stamping)
//   3. Enzyme & catalyst PRINTER (learns, then prints)
//
// INTESTINAL STRETCH:
//   Small intestine = inner surface (villi, microvilli, absorption)
//   Large intestine = outer membrane (water absorption, compaction)
//   Surface area limited by SQUARE-CUBE LAW:
//     Volume grows as R³, surface grows as R²
//     So gut FOLDS to pack more surface into limited volume
//     That's why intestines are folded, not straight
//
// TREFOIL KNOT — three crossings = three null spaces:
//   Lobe A: gut↔skin (small intestine = skin-on-inside)
//   Lobe B: brain↔eyes (PNS = brain-on-outside)
//   Lobe C: spine↔limbs (CNS = tree-on-inside)
//   Each lobe = 45°/π turn from the next = chirality
//
// CHIRALITY — the π-turn mechanism:
//   Clockwise = L-amino acids (life as we know it)
//   Counterclockwise = D-sugars (energy as we know it)
//   The cock/counterclock is conducted BY the waveform
//   Not carried on it. The turn IS the information.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ GOLGI CISTERNAE STACK ═══
  // 5 cisternae: cis → medial(3) → trans
  // Like a stack of pancakes, each does one modification
  var CISTERNAE = [
    { id: 'cis',     name: 'CIS (receive)',     face: 'kevin',  color: [201,168,76],  process: 'unfold' },
    { id: 'medial1', name: 'MEDIAL-1 (tag)',     face: 'agent',  color: [210,153,34],  process: 'glycosylate' },
    { id: 'medial2', name: 'MEDIAL-2 (sort)',    face: 'agent',  color: [184,115,51],  process: 'phosphorylate' },
    { id: 'medial3', name: 'MEDIAL-3 (package)', face: 'agent',  color: [140,100,55],  process: 'package' },
    { id: 'trans',   name: 'TRANS (dispatch)',   face: 'gaia',   color: [63,185,80],   process: 'dispatch' }
  ];

  // ═══ ENZYME/CATALYST PRINTER ═══
  // When a pattern is learned on one side, it gets PRINTED as an enzyme
  // that can be used on ALL future items passing through that cisterna
  var enzymeCatalog = [];
  var catalystPrints = 0;

  function printEnzyme(name, cisterna, pattern) {
    var enzyme = {
      id: ++catalystPrints,
      name: name,
      cisterna: cisterna,
      pattern: pattern,
      printed: Date.now(),
      uses: 0,
      efficiency: 0.5 // starts at 50%, improves with use
    };
    enzymeCatalog.push(enzyme);
    // Cap catalog to prevent bloat
    if (enzymeCatalog.length > 100) enzymeCatalog.shift();
    return enzyme;
  }

  function applyEnzymes(item, cisterna) {
    var applied = 0;
    for (var i = 0; i < enzymeCatalog.length; i++) {
      var enz = enzymeCatalog[i];
      if (enz.cisterna === cisterna) {
        enz.uses++;
        enz.efficiency = Math.min(0.99, enz.efficiency + 0.01);
        applied++;
      }
    }
    return applied;
  }

  // ═══ CHROMATIC SHIFT — near/far as color ═══
  // CIS face = blueshift (incoming, approaching)
  // TRANS face = redshift (outgoing, departing)
  // Medial = green (processing, present)
  function chromaticShift(tense, voxel) {
    var tenseW = { was: 0.9, is: 0.1, now: 0.3, end: 1.0 };
    var voxelW = { touch: 0, local: 0.2, solar: 0.5, zodiac: 0.8, deep: 1.0 };
    var temporal = tenseW[tense] || 0.5;
    var spatial = voxelW[voxel] || 0.5;

    // Near + present = blueshift (CIS)
    // Far + past = redshift (TRANS)
    var shift = (temporal + spatial) / 2;
    return {
      shift: shift,
      hue: shift < 0.3 ? 240 : shift < 0.6 ? 120 : 0, // blue → green → red
      label: shift < 0.3 ? 'blueshift' : shift < 0.6 ? 'greenband' : 'redshift',
      cisterna: shift < 0.2 ? 'cis' : shift < 0.4 ? 'medial1' : shift < 0.6 ? 'medial2' : shift < 0.8 ? 'medial3' : 'trans'
    };
  }

  // ═══ SQUARE-CUBE LAW — intestinal surface area ═══
  // Volume = (4/3)πR³, Surface = 4πR²
  // Ratio = 3/R — as R grows, surface/volume SHRINKS
  // Gut folds to compensate: villi add ~10× surface, microvilli add ~20×
  var intestine = {
    smallR: 0,     // calculated from globe R
    largeR: 0,
    villiCount: 0,
    microvilliPerVillus: 200,
    foldFactor: 1,
    surfaceArea: 0,
    volume: 0,
    sqCubeRatio: 0
  };

  function calculateIntestine(R) {
    // Small intestine = inner, smaller radius, more folds
    intestine.smallR = R * 0.6;
    // Large intestine = outer, larger radius, fewer folds
    intestine.largeR = R * 0.85;

    // Volume of the gut space (hollow sphere between small and large)
    var vSmall = (4/3) * Math.PI * Math.pow(intestine.smallR, 3);
    var vLarge = (4/3) * Math.PI * Math.pow(intestine.largeR, 3);
    intestine.volume = vLarge - vSmall;

    // Surface area = inner surface (small) + outer surface (large)
    var sSmall = 4 * Math.PI * Math.pow(intestine.smallR, 2);
    var sLarge = 4 * Math.PI * Math.pow(intestine.largeR, 2);

    // Square-cube: surface can only be R² but volume is R³
    intestine.sqCubeRatio = (sSmall + sLarge) / intestine.volume;

    // FOLDING compensates: villi multiply surface
    // Human small intestine: 32m² without folds → 250m² with villi+microvilli
    intestine.villiCount = Math.floor(sSmall * 0.5);
    intestine.foldFactor = 1 + (intestine.villiCount * intestine.microvilliPerVillus * 0.0001);
    intestine.surfaceArea = (sSmall * intestine.foldFactor) + sLarge;
  }

  // ═══ TREFOIL KNOT — three crossings, three null spaces ═══
  // Parametric trefoil: x(t) = sin(t) + 2sin(2t)
  //                     y(t) = cos(t) - 2cos(2t)
  //                     z(t) = -sin(3t)
  // Three lobes, three crossings, three inversions
  var trefoil = {
    lobes: [
      { name: 'gut↔skin',    inner: 'small intestine', outer: 'skin',    crossing: 0 },
      { name: 'brain↔eyes',  inner: 'CNS',             outer: 'PNS+eyes', crossing: 1 },
      { name: 'spine↔limbs', inner: 'spinal cord',     outer: 'limb nerves', crossing: 2 }
    ],
    nullSpaces: 3,  // three holes in the trefoil
    innerVolume: 0,
    outerVolume: 0,
    nullVolume: 0
  };

  function calculateTrefoil(R) {
    // The trefoil encloses three null spaces
    // Inner = what's inside all three lobes (the organism)
    // Outer = what's outside all three lobes (the cosmos)
    // Null = the three holes (the passages between inner and outer)
    var totalSphere = (4/3) * Math.PI * Math.pow(R, 3);
    // Approximate: trefoil knot occupies ~40% of bounding sphere
    var knotVolume = totalSphere * 0.4;
    trefoil.innerVolume = knotVolume * 0.35;  // inside the knot
    trefoil.outerVolume = totalSphere - knotVolume; // outside the knot
    trefoil.nullVolume = knotVolume * 0.25;   // the three holes
  }

  // ═══ CHIRALITY — the π/45° turn ═══
  // L-rotation (counterclockwise) = amino acids = building blocks = CIS
  // D-rotation (clockwise) = sugars = energy = TRANS
  // The TURN is the information. Not carried. IS.
  var chirality = {
    L: { name: 'L-amino', rotation: -1, role: 'build',  color: [88,166,255] },
    D: { name: 'D-sugar', rotation: +1, role: 'energy', color: [248,81,73] },
    piTurn: Math.PI / 4, // 45 degrees — the fundamental chiral turn
    currentRotation: 0,
    handedness: 'L' // life starts left-handed
  };

  // ═══ PROCESSING PIPELINE ═══
  // Items flow: CIS → MEDIAL1 → MEDIAL2 → MEDIAL3 → TRANS
  var pipeline = [];
  var pipelineProcessed = 0;

  function ingest(item) {
    pipeline.push({
      item: item,
      stage: 0,
      ingested: Date.now(),
      enzymesApplied: 0,
      chromatic: null,
      chiral: null
    });
    if (pipeline.length > 50) pipeline.shift();
  }

  function processPipeline() {
    for (var i = pipeline.length - 1; i >= 0; i--) {
      var p = pipeline[i];
      var elapsed = Date.now() - p.ingested;
      var stageTime = 2000; // 2s per stage

      var targetStage = Math.min(CISTERNAE.length - 1, Math.floor(elapsed / stageTime));
      if (targetStage > p.stage) {
        p.stage = targetStage;
        var cist = CISTERNAE[p.stage];

        // Apply enzymes for this cisterna
        p.enzymesApplied += applyEnzymes(p.item, cist.id);

        // Chromatic shift at each stage
        if (p.item && p.item.tense) {
          p.chromatic = chromaticShift(p.item.tense, p.item.voxel);
        }

        // Chiral turn at each crossing
        p.chiral = p.stage % 2 === 0 ? 'L' : 'D';

        // If reached TRANS, dispatch
        if (p.stage >= CISTERNAE.length - 1) {
          pipelineProcessed++;
          pipeline.splice(i, 1);

          // Print enzyme from successful processing
          if (p.item && p.item.id) {
            printEnzyme('auto-' + p.item.id, cist.id, { processed: true, ts: Date.now() });
          }

          // Feed back to thymus
          if (window.thymus) {
            window.thymus.golgiDispatched = (window.thymus.golgiDispatched || 0) + 1;
          }
        }
      }
    }
  }

  // Ingest pins as initial cargo
  setTimeout(function() {
    if (window.PINS) {
      for (var i = 0; i < Math.min(window.PINS.length, 20); i++) {
        setTimeout(function(pin) {
          return function() { ingest(pin); };
        }(window.PINS[i]), i * 500);
      }
    }
  }, 5000);

  // Process pipeline continuously
  setInterval(processPipeline, 1000);

  // Recalculate when R changes
  var _lastR = 0;

  // ═══ EXPOSE ═══
  window.GAIA_GOLGI_APPARATUS = {
    cisternae: CISTERNAE,
    enzymes: enzymeCatalog,
    pipeline: pipeline,
    intestine: intestine,
    trefoil: trefoil,
    chirality: chirality,
    chromaticShift: chromaticShift,
    printEnzyme: printEnzyme,
    ingest: ingest,
    processed: function() { return pipelineProcessed; }
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;

    // Recalculate anatomy when R changes
    if (Math.abs(R - _lastR) > 1) {
      _lastR = R;
      calculateIntestine(R);
      calculateTrefoil(R);
    }

    var gT = breathT * 0.2;
    var gAlpha = 0.005 + Math.sin(gT * 0.5) * 0.004;
    if (gAlpha < 0.003) return;

    // ═══ CISTERNAE STACK — concentric arcs (CIS inside, TRANS outside) ═══
    for (var ci = 0; ci < CISTERNAE.length; ci++) {
      var cist = CISTERNAE[ci];
      var cR = R * (0.88 + ci * 0.04); // stacked rings from inside out
      var cAngle = gT * 0.05 + ci * 0.3;

      // Cisterna arc — partial ring (not full circle, like a pancake stack)
      ctx.beginPath();
      ctx.arc(cx, cy, cR, cAngle, cAngle + PI * 1.2);
      ctx.strokeStyle = 'rgba(' + cist.color[0] + ',' + cist.color[1] + ',' + cist.color[2] + ',' + (gAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // ═══ INTESTINAL FOLDS — villi inside the small intestine ring ═══
    var villiR = intestine.smallR || R * 0.6;
    var villiCount = 24;
    for (var vi = 0; vi < villiCount; vi++) {
      var vAngle = (vi / villiCount) * TAU + gT * 0.04;
      var vLen = R * 0.03 * (1 + Math.sin(gT * 2 + vi * 0.5) * 0.3);

      var vx1 = cx + Math.cos(vAngle) * villiR;
      var vy1 = cy + Math.sin(vAngle) * villiR;
      var vx2 = cx + Math.cos(vAngle) * (villiR - vLen);
      var vy2 = cy + Math.sin(vAngle) * (villiR - vLen);

      ctx.beginPath();
      ctx.moveTo(vx1, vy1);
      ctx.lineTo(vx2, vy2);
      ctx.strokeStyle = 'rgba(210,153,34,' + (gAlpha * 1.2).toFixed(4) + ')';
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }

    // ═══ TREFOIL KNOT — parametric with three crossings ═══
    var trefoilR = R * 0.15;
    var trefoilCx = cx;
    var trefoilCy = cy;
    var steps = 60;

    ctx.beginPath();
    for (var ti = 0; ti <= steps; ti++) {
      var t = (ti / steps) * TAU;
      // Parametric trefoil knot
      var tx = Math.sin(t) + 2 * Math.sin(2 * t);
      var ty = Math.cos(t) - 2 * Math.cos(2 * t);
      // Rotate slowly
      var cosR = Math.cos(gT * 0.1);
      var sinR = Math.sin(gT * 0.1);
      var rx = tx * cosR - ty * sinR;
      var ry = tx * sinR + ty * cosR;

      var px = trefoilCx + rx * trefoilR * 0.3;
      var py = trefoilCy + ry * trefoilR * 0.3;

      if (ti === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(188,140,255,' + (gAlpha * 1.8).toFixed(4) + ')';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Three crossing labels
    if (gAlpha > 0.007) {
      for (var li = 0; li < trefoil.lobes.length; li++) {
        var lobe = trefoil.lobes[li];
        var la = (li / 3) * TAU + gT * 0.1;
        var lx = trefoilCx + Math.cos(la) * trefoilR * 0.5;
        var ly = trefoilCy + Math.sin(la) * trefoilR * 0.5;
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(188,140,255,' + (gAlpha * 1.5).toFixed(4) + ')';
        ctx.fillText(lobe.name, lx, ly);
      }
    }

    // ═══ CHIRALITY INDICATOR — L/D turns at the π/45° point ═══
    chirality.currentRotation += chirality.piTurn * 0.002;
    var chiralAngle = chirality.currentRotation;
    var chiralR = R * 0.3;
    // L-turn (counterclockwise, blue) and D-turn (clockwise, red) arrows
    var lx = cx + Math.cos(chiralAngle) * chiralR;
    var ly = cy + Math.sin(chiralAngle) * chiralR;
    var dx = cx + Math.cos(-chiralAngle) * chiralR;
    var dy = cy + Math.sin(-chiralAngle) * chiralR;

    // L arrow
    ctx.beginPath();
    ctx.arc(lx, ly, 1, 0, TAU);
    ctx.fillStyle = 'rgba(88,166,255,' + (gAlpha * 1.2).toFixed(4) + ')';
    ctx.fill();
    // D arrow
    ctx.beginPath();
    ctx.arc(dx, dy, 1, 0, TAU);
    ctx.fillStyle = 'rgba(248,81,73,' + (gAlpha * 1.2).toFixed(4) + ')';
    ctx.fill();

    // ═══ PIPELINE CARGO — items flowing through cisternae ═══
    for (var pi = 0; pi < pipeline.length; pi++) {
      var cargo = pipeline[pi];
      var stageR = R * (0.88 + cargo.stage * 0.04);
      var cargoAngle = gT * 0.1 + pi * 0.5;
      var cargoX = cx + Math.cos(cargoAngle) * stageR;
      var cargoY = cy + Math.sin(cargoAngle) * stageR;

      // Cargo dot — color shifts as it moves through stack
      var cargoColor = cargo.chiral === 'D' ? '248,81,73' : '88,166,255';
      ctx.beginPath();
      ctx.arc(cargoX, cargoY, 0.8, 0, TAU);
      ctx.fillStyle = 'rgba(' + cargoColor + ',' + (gAlpha * 2).toFixed(4) + ')';
      ctx.fill();
    }

    // ═══ STATS ═══
    if (gAlpha > 0.007) {
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(210,153,34,' + (gAlpha * 2).toFixed(4) + ')';
      var sqc = intestine.sqCubeRatio ? intestine.sqCubeRatio.toFixed(2) : '?';
      ctx.fillText('🧬 Golgi:' + pipelineProcessed + ' · enz:' + enzymeCatalog.length +
        ' · S/V:' + sqc + ' · ☊' + trefoil.nullSpaces + '∅', 8, 62);
    }
  });

})(window.G);
