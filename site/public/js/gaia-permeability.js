// ═══════════════════════════════════════════════════════════
// ANDERSON PERMEABILITY × TENSE RUBBERIZER
// 1.000.null — max 1000 lines. Water is the lubricant.
//
// PERMEABILITY = what can pass through the membrane.
// GRAVITY = what pulls things toward or away from the membrane.
// TENSE = the rubberizer loop (was/is/now/end stretch the surface).
//
// The skin is a salamander inside a snake:
//   Salamander = wet, permeable, breathes through skin
//   Snake = dry, scaled, impermeable, sheds
//   The overlap = where water drips through
//
// H₂O finds the gaps between rubber and scales:
//   High concentration → water passes through (osmosis)
//   Low concentration → water stays out (hydrophobic)
//   The tense determines how stretched the membrane is:
//     'is' = relaxed (0.1) → tight seal, low permeability
//     'now' = present (0.3) → slightly open, moderate permeability
//     'was' = stretched (0.9) → old rubber, cracks form, high permeability
//     'end' = torn (1.0) → fully permeable, water floods
//
// Water as lubricant:
//   Between every tense transition, water lubricates the fold.
//   The salamander's wet skin meets the snake's dry scales.
//   Where they overlap = the drip holes.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TENSE_PERMEABILITY = {
    is:  0.1,   // present tense = tight, sealed, low permeability
    now: 0.3,   // active present = slightly open, water can seep
    was: 0.7,   // past = stretched rubber, cracks forming
    end: 1.0    // terminal = fully permeable, membrane dissolving
  };

  var VOXEL_GRAVITY = {
    touch: 1.0,   // strongest pull — right against the membrane
    local: 0.6,   // moderate gravity — nearby
    solar: 0.3,   // weak gravity — system-level
    zodiac: 0.1,  // very weak — distant
    deep: 0.02    // near-zero — cosmic background
  };

  // PERMEABILITY STATE — tracks where water is seeping through
  var drips = [];          // active drip points
  var dripInterval = null;
  var permeabilityMap = {}; // pin.id → { permeability, gravity, waterLevel }

  function calculatePermeability(pin) {
    var tenseP = TENSE_PERMEABILITY[pin.tense] || 0.5;
    var voxelG = VOXEL_GRAVITY[pin.voxel] || 0.3;

    // Anderson localization: disorder increases permeability
    // More disorder (high tense + low gravity) = more drip holes
    var disorder = tenseP * (1 - voxelG);

    // Water level = how much H₂O is at this membrane point
    // Influenced by locality depth (closer = more water, more real)
    var localityFactor = 1 - (window.LOCALITY_DEPTH || 0.5);
    var waterLevel = disorder * localityFactor;

    // Permeability = can water pass through here?
    // Threshold: if waterLevel > 0.3, water drips through
    var permeable = waterLevel > 0.3;

    return {
      tense: pin.tense,
      voxel: pin.voxel,
      tenseP: tenseP,
      gravity: voxelG,
      disorder: disorder,
      waterLevel: waterLevel,
      permeable: permeable,
      // Rubberizer stretch: how much the tense is deforming the membrane
      stretch: tenseP * (1 + Math.sin(Date.now() * 0.001 + (pin.lat || 0) * 0.1) * 0.2)
    };
  }

  // Calculate permeability for all pins on boot
  function updatePermeabilityMap() {
    if (!window.PINS) return;
    var pins = window.PINS;
    for (var i = 0; i < pins.length; i++) {
      var p = pins[i];
      if (p.tense && p.voxel) {
        permeabilityMap[p.id] = calculatePermeability(p);
      }
    }

    // Find drip points — where water seeps through
    drips = [];
    var ids = Object.keys(permeabilityMap);
    for (var j = 0; j < ids.length; j++) {
      var pm = permeabilityMap[ids[j]];
      if (pm.permeable) {
        drips.push({
          id: ids[j],
          waterLevel: pm.waterLevel,
          stretch: pm.stretch,
          tense: pm.tense
        });
      }
    }
  }

  // Run on boot + every 10 seconds
  setTimeout(updatePermeabilityMap, 2000);
  setInterval(updatePermeabilityMap, 10000);

  window.GAIA_PERMEABILITY = permeabilityMap;
  window.GAIA_DRIPS = drips;

  // ═══════════════════════════════════════════════════════════
  // DRAW MODULE — visualize permeability on the globe
  // ═══════════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx || drips.length === 0) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;
    var permT = breathT * 0.4;
    var permAlpha = 0.006 + Math.sin(permT * 0.5) * 0.004;
    if (permAlpha < 0.003) return;

    // RUBBER STRETCH RING — the tense rubberizer around the globe
    // Thickness varies by tense: 'is'=thin, 'was'=thick, 'end'=torn
    var rubberR = R * 1.02; // just outside the globe surface
    ctx.beginPath();
    ctx.arc(cx, cy, rubberR, 0, TAU);
    var rubberThick = 0.5 + drips.length * 0.3;
    ctx.strokeStyle = 'rgba(90,70,50,' + (permAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = rubberThick;
    ctx.stroke();

    // SCALE OVERLAY — snake scales (impermeable patches)
    var scaleCount = 16;
    for (var sc = 0; sc < scaleCount; sc++) {
      var scAngle = sc * (TAU / scaleCount) + permT * 0.03;
      var scR = rubberR;
      var scX = cx + Math.cos(scAngle) * scR;
      var scY = cy + Math.sin(scAngle) * scR;

      // Check if this angle is near a drip point — if so, gap in scales
      var nearDrip = false;
      for (var d = 0; d < drips.length; d++) {
        var dripAngle = (drips[d].waterLevel * TAU + permT * 0.1) % TAU;
        if (Math.abs(scAngle - dripAngle) < 0.3) { nearDrip = true; break; }
      }

      if (!nearDrip) {
        // Scale = small arc (impermeable)
        ctx.beginPath();
        ctx.arc(scX, scY, 1.2, 0, TAU);
        ctx.fillStyle = 'rgba(70,80,60,' + (permAlpha * 0.8).toFixed(4) + ')';
        ctx.fill();
      }
    }

    // SALAMANDER WET PATCHES — permeable zones between scales
    for (var sl = 0; sl < drips.length; sl++) {
      var drip = drips[sl];
      var dAngle = (drip.waterLevel * TAU + permT * 0.1) % TAU;
      var dR = rubberR;
      var dX = cx + Math.cos(dAngle) * dR;
      var dY = cy + Math.sin(dAngle) * dR;

      // Wet patch = glistening blue-green
      ctx.beginPath();
      ctx.arc(dX, dY, 1 + drip.waterLevel * 1.5, 0, TAU);
      ctx.fillStyle = 'rgba(57,211,224,' + (permAlpha * 2 * drip.waterLevel).toFixed(4) + ')';
      ctx.fill();

      // WATER DRIP — H₂O dropping through the membrane
      var dripPhase = ((permT * 0.6 + sl * 0.4) % 1);
      var dripY = dY + dripPhase * R * 0.15; // drops fall inward
      var dripR = dR - dripPhase * R * 0.1;
      var dripX2 = cx + Math.cos(dAngle) * dripR;
      var dripAlpha = permAlpha * 2 * (1 - dripPhase);

      ctx.beginPath();
      ctx.ellipse(dripX2, dripY, 0.3, 0.5, dAngle, 0, TAU);
      ctx.fillStyle = 'rgba(88,166,255,' + dripAlpha.toFixed(4) + ')';
      ctx.fill();

      // Drip label on strong drips
      if (drip.waterLevel > 0.4 && permAlpha > 0.008) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(57,211,224,' + (permAlpha * 1.5).toFixed(4) + ')';
        ctx.fillText(drip.tense + '·drip', dX, dY - 4);
      }
    }

    // TENSE RUBBERIZER LABEL
    if (permAlpha > 0.008) {
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(57,211,224,' + (permAlpha * 2).toFixed(4) + ')';
      ctx.fillText('💧 ' + drips.length + ' drips · H₂O lubricant', 8, 44);
    }
  });

})(window.G);
