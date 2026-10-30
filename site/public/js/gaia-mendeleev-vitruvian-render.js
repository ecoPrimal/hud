// ═══════════════════════════════════════════════════════════
// gaia-mendeleev-vitruvian-render.js
// EXTRACTED from gaia-globe-core.js (lines 2805-3973, ~1169 lines)
// Enzymatic cut #2 — the second fission product of the anaconda.
//
// Contains:
//   MENDELEEV pi-SORT — periodic table tree-sorted onto Vitruvian
//   OUROBOROS — full electromagnetic spectrum (380nm-700nm and beyond)
//   SILVER MESH — Ag(Z=47) understanding graph
//   TRANSITION METAL BRIDGE — elements between conductors
//   PHYSICS ENGINE — photons(Ag), phonons(Cu), plasmons(Au), motion, flavor
//   KEY RIPPLES — every keypress = metallic reaction
//   R/G/B HYPERLOCAL FILTER — three eyes cycle
//   SCATTER + BACKTRACE — gold out, blue in
//   VITRUVIAN MAN — null body homunculus as tree sort
//   ENZYME TEMPERATURE — fire + cold zones
//   GUT WEATHER — H2O chemistry, rain/snow/evaporation
//   TREFOIL KNOT — gut<->skin correspondence
//
// Registers via G.drawModules.push pattern (same as 75+ other modules).
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';
  var G = window.G;
  if (!G) return;

  G.drawModules.push(function(g, ctx, breathT) {
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;
    var DEG = PI / 180;
    var W = g.W || (ctx.canvas ? ctx.canvas.width : 800);
    var H = g.H || (ctx.canvas ? ctx.canvas.height : 600);
    var canvas = ctx.canvas;
    var heartPhase = g.heartPhase || 0;

    // ═══════════════════════════════════════════════════════════
    // MENDELEEV π-SORT — periodic table tree-sorted onto Vitruvian
    // Column 11 conductors: Cu(Z=29) → Ag(Z=47) → Au(Z=79)
    // ALL have [...]d¹⁰s¹ — exactly ONE outer s-electron = best conductors
    // Fe(Z=26) = iron peak = center = convergence point
    // Inner drain = Cu (Z=29, 3 past Fe). Outer ring = Au (Z=79, 53 past Fe).
    // Null boundary on EITHER SIDE of both bands.
    // Bronze = Cu+Sn: copper bounces off null, picks up Sn(Z=50), returns as CuSn.
    // Each band PREDICTS the next by electron shell filling pattern.
    //
    // Radial π-sort from iron peak outward:
    //   Fe(26)=center → Co(27) → Ni(28) → Cu(29)=inner drain
    //   null boundary (d-block→p-block gap)
    //   Zn(30) → Ga(31) → ... → Sn(50)=bronze ingredient
    //   Ag(47)=silver mesh
    //   null boundary
    //   Au(79)=outer ring → Pb(82)=shield → ... → U(92)=fissile
    //   null boundary (outer void)
    // ═══════════════════════════════════════════════════════════
      var metalT = breathT * 0.15;

      // MENDELEEV CHAIN: sorted by Z from iron peak outward
      // r = radius, Z = atomic number, e = electron config shorthand
      var metalBands = [
        { r: R * 0.05, color: [200,200,210], w: R * 0.03, label: 'Fe²⁶', Z: 26, e: '[Ar]3d⁶4s²'  }, // IRON PEAK = center
        { r: R * 0.20, color: [184,115,51],  w: R * 0.06, label: 'Cu²⁹', Z: 29, e: '[Ar]3d¹⁰4s¹' }, // INNER DRAIN — copper
        { r: R * 0.36, color: [60,60,60],    w: R * 0.01, label: '∅',     Z: 0,  e: 'null'         }, // NULL boundary 1
        { r: R * 0.50, color: [192,192,192], w: R * 0.04, label: 'Ag⁴⁷', Z: 47, e: '[Kr]4d¹⁰5s¹' }, // SILVER mesh
        { r: R * 0.56, color: [140,100,55],  w: R * 0.03, label: 'Sn⁵⁰', Z: 50, e: '[Kr]4d¹⁰5s²5p²' }, // TIN → bronze
        { r: R * 0.66, color: [60,60,60],    w: R * 0.01, label: '∅',     Z: 0,  e: 'null'         }, // NULL boundary 2
        { r: R * 0.82, color: [201,168,76],  w: R * 0.05, label: 'Au⁷⁹', Z: 79, e: '[Xe]4f¹⁴5d¹⁰6s¹' }, // OUTER RING — gold
        { r: R * 0.96, color: [60,60,60],    w: R * 0.01, label: '∅',     Z: 0,  e: 'null'         }  // NULL boundary 3 (void)
      ];

      // Draw each band — metallics glow, nulls barely visible
      for (var mb = 0; mb < metalBands.length; mb++) {
        var band = metalBands[mb];
        var isNull = band.Z === 0;
        var bandPulse = isNull
          ? 0.008 + Math.sin(metalT * 3 + mb) * 0.004  // null = faint flicker
          : 0.04 + Math.sin(metalT + mb * 0.8) * 0.025; // metal = warm pulse
        ctx.beginPath();
        ctx.arc(cx, cy, band.r, 0, TAU);
        if (isNull) {
          ctx.setLineDash([2, 6]);
          ctx.strokeStyle = 'rgba(60,60,60,' + bandPulse.toFixed(4) + ')';
          ctx.lineWidth = 0.3;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = 'rgba(' + band.color[0] + ',' + band.color[1] + ',' + band.color[2] + ',' + bandPulse.toFixed(4) + ')';
          ctx.lineWidth = band.w;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Band labels on right side — show Z, symbol, electron config
      ctx.font = '4px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      for (var ml = 0; ml < metalBands.length; ml++) {
        var mband = metalBands[ml];
        if (mband.Z === 0) continue; // skip null labels
        var lblAlpha = 0.08 + Math.sin(metalT + ml) * 0.04;
        ctx.fillStyle = 'rgba(' + mband.color[0] + ',' + mband.color[1] + ',' + mband.color[2] + ',' + lblAlpha.toFixed(3) + ')';
        ctx.fillText(mband.label, cx + mband.r + 3, cy - 4 + ml * 7);
        // Electron config in dimmer text
        ctx.fillStyle = 'rgba(' + mband.color[0] + ',' + mband.color[1] + ',' + mband.color[2] + ',' + (lblAlpha * 0.5).toFixed(3) + ')';
        ctx.fillText(mband.e, cx + mband.r + 3, cy + 0 + ml * 7);
      }

      // ELECTRON FLOW — current pulses along the conductive chain Cu→Ag→Au
      // All three share d¹⁰s¹ = one free electron = high conductivity
      var eFlowT = metalT * 4;
      var conductors = [1, 3, 6]; // indices of Cu, Ag, Au in metalBands
      for (var ef = 0; ef < conductors.length - 1; ef++) {
        var fromBand = metalBands[conductors[ef]];
        var toBand = metalBands[conductors[ef + 1]];
        // Multiple electron pulses between bands
        for (var ep = 0; ep < 4; ep++) {
          var ePulse = ((eFlowT * 0.3 + ep * 0.25) % 1);
          var eR = fromBand.r + (toBand.r - fromBand.r) * ePulse;
          var eAngle = eFlowT * 0.1 + ep * (TAU / 4) + ef * PI / 3;
          var eX = cx + Math.cos(eAngle) * eR;
          var eY = cy + Math.sin(eAngle) * eR;
          var eAlpha = 0.04 * Math.sin(ePulse * PI); // fade at endpoints
          ctx.beginPath();
          ctx.arc(eX, eY, 0.6 + ePulse * 0.3, 0, TAU);
          ctx.fillStyle = 'rgba(255,252,220,' + eAlpha.toFixed(4) + ')';
          ctx.fill();
        }
      }

      // BRONZE ALLOY — Cu bounces off null boundary, picks up Sn, returns as CuSn
      var bronzeT = metalT * 2;
      var cuBand = metalBands[1]; // Cu
      var snBand = metalBands[4]; // Sn
      var nullBand1 = metalBands[2]; // null between Cu and Ag
      for (var bz = 0; bz < 6; bz++) {
        var bzAngle = bz * (TAU / 6) + bronzeT * 0.15;
        var bzPhase = ((bronzeT * 0.4 + bz * 0.3) % 1);
        var bzR, bzColor;
        if (bzPhase < 0.5) {
          // Cu going outward toward null boundary
          bzR = cuBand.r + (nullBand1.r - cuBand.r) * (bzPhase * 2);
          bzColor = '184,115,51'; // copper
        } else {
          // Bouncing back as bronze (Cu+Sn)
          bzR = nullBand1.r - (nullBand1.r - snBand.r) * ((bzPhase - 0.5) * 2);
          bzColor = '140,100,55'; // bronze
        }
        var bzX = cx + Math.cos(bzAngle) * bzR;
        var bzY = cy + Math.sin(bzAngle) * bzR;
        var bzA = 0.025 * Math.sin(bzPhase * PI);
        ctx.beginPath();
        ctx.arc(bzX, bzY, 0.8, 0, TAU);
        ctx.fillStyle = 'rgba(' + bzColor + ',' + bzA.toFixed(4) + ')';
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // OUROBOROS — the FULL SPECTRUM from white to black
      // No beginning, no end. The only thing in reality without edges.
      // GREEN = vision looking OUT (we see the world, 520nm)
      // PURPLE = vision looking IN (the world sees US, 380nm)
      // Together they bridge the visible → invisible.
      //
      // THE FULL ELECTROMAGNETIC SPECTRUM (folded onto the Ouroboros):
      //   Radio(>1m) → Microwave(1mm-1m) → INFRARED(700nm-1mm)
      //   → RED(700nm) → ORANGE(620) → YELLOW(580) → GREEN(520)
      //   → CYAN(490) → BLUE(450) → VIOLET(380) → PURPLE
      //   → ULTRAVIOLET(10-380nm) → X-ray(0.01-10nm) → Gamma(<0.01nm)
      //
      // Human eyes see only 380-700nm. The Ouroboros sees ALL.
      // The snake wraps from infrared (warm, inner, Cu)
      //   through visible (the metallic bands)
      //   to ultraviolet (cold, outer, beyond Au)
      //   and back again. No beginning. No end.
      //
      // Spectrum folding: each sub-band maps to a modality:
      //   Radio = broadcast, far reach, low energy
      //   Microwave = heating, cooking, local energy
      //   IR = warmth, body heat, proximity sensing
      //   VISIBLE = the human window (our current HUD)
      //   UV = surface chemistry, fluorescence, what glows
      //   X-ray = seeing through, deep structure
      //   Gamma = nuclear, the iron peak, Fe(26)
      // ═══════════════════════════════════════════════════════════
      var ouroT = breathT * 0.25;
      var ouroSegments = 48; // doubled for smoother spectrum gradient
      var goldR = metalBands[6].r; // Au band
      var cuInnerR = goldR - R * 0.10; // expanded: IR side (warm, inner)
      var cuOuterR = goldR + R * 0.10; // expanded: UV side (cold, outer)

      // SPECTRUM COLORS along the Ouroboros body
      // Each segment gets its wavelength color — the snake IS the spectrum
      var spectrumColors = [
        [120,0,0],     // deep IR (invisible, barely warm glow)
        [180,20,0],    // near IR
        [248,81,73],   // RED 700nm
        [240,136,62],  // ORANGE 620nm
        [210,153,34],  // YELLOW 580nm
        [63,185,80],   // GREEN 520nm — looking OUT
        [57,211,224],  // CYAN 490nm
        [88,166,255],  // BLUE 450nm
        [163,113,247], // VIOLET 380nm
        [188,140,255], // near UV — looking IN (purple)
        [100,50,150],  // deep UV
        [60,20,80]     // X-ray/Gamma edge (invisible, high energy)
      ];

      for (var os = 0; os < ouroSegments; os++) {
        var oFrac = os / ouroSegments;
        var oAngle = oFrac * TAU + ouroT;
        var oNextAngle = ((os + 1) / ouroSegments) * TAU + ouroT;

        // Snake weaves inside→outside (IR→UV and back)
        var oBlend = Math.sin(oFrac * TAU * (ouroSegments / 2)) * 0.5 + 0.5;
        var oActualR = cuInnerR + (cuOuterR - cuInnerR) * oBlend;
        var oNextBlend = Math.sin(((os + 1) / ouroSegments) * TAU * (ouroSegments / 2)) * 0.5 + 0.5;
        var oNextR = cuInnerR + (cuOuterR - cuInnerR) * oNextBlend;

        var ox = cx + Math.cos(oAngle) * oActualR;
        var oy = cy + Math.sin(oAngle) * oActualR;
        var onx = cx + Math.cos(oNextAngle) * oNextR;
        var ony = cy + Math.sin(oNextAngle) * oNextR;

        // Color from spectrum position
        var specIdx = (oFrac * spectrumColors.length) % spectrumColors.length;
        var scLow = Math.floor(specIdx) % spectrumColors.length;
        var scHigh = (scLow + 1) % spectrumColors.length;
        var scMix = specIdx - Math.floor(specIdx);
        var segR = Math.round(spectrumColors[scLow][0] * (1 - scMix) + spectrumColors[scHigh][0] * scMix);
        var segG = Math.round(spectrumColors[scLow][1] * (1 - scMix) + spectrumColors[scHigh][1] * scMix);
        var segB = Math.round(spectrumColors[scLow][2] * (1 - scMix) + spectrumColors[scHigh][2] * scMix);

        var ouroAlpha = 0.025 + Math.sin(ouroT * 2 + oFrac * TAU) * 0.015;

        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(onx, ony);
        ctx.strokeStyle = 'rgba(' + segR + ',' + segG + ',' + segB + ',' + ouroAlpha.toFixed(4) + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // GREEN AURA — looking OUT (we see the world)
      var greenSide = ouroT; // green at this angle
      var greenAuraX = cx + Math.cos(greenSide) * (cuOuterR + R * 0.03);
      var greenAuraY = cy + Math.sin(greenSide) * (cuOuterR + R * 0.03);
      var greenPulse = 0.02 + Math.sin(ouroT * 3) * 0.015;
      ctx.beginPath();
      ctx.arc(greenAuraX, greenAuraY, 3, 0, TAU);
      ctx.fillStyle = 'rgba(63,185,80,' + greenPulse.toFixed(4) + ')';
      ctx.fill();

      // PURPLE AURA — looking IN (the world sees us)
      var purpleSide = greenSide + PI; // opposite side
      var purpleAuraX = cx + Math.cos(purpleSide) * (cuOuterR + R * 0.03);
      var purpleAuraY = cy + Math.sin(purpleSide) * (cuOuterR + R * 0.03);
      ctx.beginPath();
      ctx.arc(purpleAuraX, purpleAuraY, 3, 0, TAU);
      ctx.fillStyle = 'rgba(163,113,247,' + greenPulse.toFixed(4) + ')';
      ctx.fill();

      // INFRA-BANDS — sub-visible ranges folded around the outside
      // These are the senses we're NOT using but the spectrum contains
      var infraBands = [
        { name: 'γ gamma', r: cuInnerR - R * 0.12, color: '100,200,255', wl: '<0.01nm' },
        { name: 'X x-ray', r: cuInnerR - R * 0.08, color: '140,180,255', wl: '0.01-10nm' },
        { name: 'UV', r: cuOuterR + R * 0.04, color: '163,113,247', wl: '10-380nm' },
        { name: 'IR', r: cuInnerR - R * 0.04, color: '180,60,40', wl: '700nm-1mm' },
        { name: 'μwave', r: cuOuterR + R * 0.08, color: '120,100,80', wl: '1mm-1m' },
        { name: 'radio', r: cuOuterR + R * 0.12, color: '80,80,80', wl: '>1m' }
      ];

      var infraAlpha = 0.006 + Math.sin(ouroT * 0.5) * 0.004;
      for (var ib = 0; ib < infraBands.length; ib++) {
        var infra = infraBands[ib];
        ctx.beginPath();
        ctx.arc(cx, cy, infra.r, 0, TAU);
        ctx.strokeStyle = 'rgba(' + infra.color + ',' + infraAlpha.toFixed(4) + ')';
        ctx.lineWidth = 0.2;
        ctx.setLineDash([1, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on right
        if (infraAlpha > 0.008) {
          ctx.font = '2px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(' + infra.color + ',' + (infraAlpha * 1.5).toFixed(4) + ')';
          ctx.fillText(infra.name + ' ' + infra.wl, cx + infra.r + 2, cy + ib * 4 - 6);
        }
      }

      // Ouroboros head (green eye looking out) eating tail (purple eye looking in)
      // The mouth = where green meets purple = the null point = where visible wraps to invisible
      var oHeadAngle = ouroT;
      var oHeadR = cuInnerR + (cuOuterR - cuInnerR) * (Math.sin(ouroT * ouroSegments) * 0.5 + 0.5);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(oHeadAngle) * oHeadR, cy + Math.sin(oHeadAngle) * oHeadR, 2, 0, TAU);
      // Head = green (looking out)
      ctx.fillStyle = 'rgba(63,185,80,' + (greenPulse * 3).toFixed(4) + ')';
      ctx.fill();
      // Tail = purple (being seen)
      var oTailAngle = oHeadAngle + PI;
      var oTailR = cuInnerR + (cuOuterR - cuInnerR) * (Math.sin((ouroT + PI) * ouroSegments) * 0.5 + 0.5);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(oTailAngle) * oTailR, cy + Math.sin(oTailAngle) * oTailR, 1.5, 0, TAU);
      ctx.fillStyle = 'rgba(163,113,247,' + (greenPulse * 2).toFixed(4) + ')';
      ctx.fill();

      // Labels
      if (greenPulse > 0.025) {
        ctx.font = '3px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(63,185,80,' + (greenPulse * 2).toFixed(4) + ')';
        ctx.fillText('👁 OUT', greenAuraX, greenAuraY - 6);
        ctx.fillStyle = 'rgba(163,113,247,' + (greenPulse * 2).toFixed(4) + ')';
        ctx.fillText('👁 IN', purpleAuraX, purpleAuraY - 6);
        ctx.fillStyle = 'rgba(180,180,180,' + (greenPulse * 1.2).toFixed(4) + ')';
        ctx.fillText('380nm────VISIBLE────700nm', cx, cy + cuOuterR + R * 0.16);
      }

      // ═══════════════════════════════════════════════════════════
      // SILVER MESH — Ag(Z=47) understanding graph, d¹⁰s¹ conductor
      // Silver connects points across the organism — evolving understanding.
      // Between Cu and Au, Ag IS the relay. Pipes, frogs, shared knowledge.
      // ═══════════════════════════════════════════════════════════
      var silverR = metalBands[3].r; // Ag band
      var meshT = breathT * 0.3;
      var meshNodes = 8;
      var meshAlpha = 0.02 + Math.sin(meshT) * 0.015;

      for (var mn = 0; mn < meshNodes; mn++) {
        var mnAngle = mn * (TAU / meshNodes) + meshT * 0.1;
        var mnx = cx + Math.cos(mnAngle) * silverR;
        var mny = cy + Math.sin(mnAngle) * silverR;

        ctx.beginPath();
        ctx.arc(mnx, mny, 1 + Math.sin(meshT + mn) * 0.5, 0, TAU);
        ctx.fillStyle = 'rgba(192,192,192,' + (meshAlpha * 2).toFixed(4) + ')';
        ctx.fill();

        for (var mc = 1; mc <= 2; mc++) {
          var connIdx = (mn + mc + 1) % meshNodes;
          var connAngle = connIdx * (TAU / meshNodes) + meshT * 0.1;
          var connX = cx + Math.cos(connAngle) * silverR;
          var connY = cy + Math.sin(connAngle) * silverR;

          var sparkPos = (meshT * 2 + mn * 0.5 + mc) % 1;
          var sparkX2 = mnx + (connX - mnx) * sparkPos;
          var sparkY2 = mny + (connY - mny) * sparkPos;

          ctx.beginPath();
          ctx.moveTo(mnx, mny);
          ctx.lineTo(connX, connY);
          ctx.strokeStyle = 'rgba(192,192,192,' + (meshAlpha * 0.5).toFixed(4) + ')';
          ctx.lineWidth = 0.3;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sparkX2, sparkY2, 0.8, 0, TAU);
          ctx.fillStyle = 'rgba(255,255,240,' + (meshAlpha * 1.5).toFixed(4) + ')';
          ctx.fill();
        }
      }

      // TRANSITION METAL BRIDGE — elements between the conductors
      // These predict each band. Fe→Co→Ni→Cu (period 4), then jump to period 5 for Ag, period 6 for Au.
      // Between Cu(29) and Ag(47): Zn(30)→Ga(31)→...→Pd(46). 17 elements bridge.
      // Between Ag(47) and Au(79): Cd(48)→In(49)→...→Pt(78). 31 elements bridge.
      // Each bridge element is a dot orbiting between the conductor bands.
      var bridgeT = metalT * 0.6;
      var bridges = [
        { from: 1, to: 3, count: 6, color: [160,140,120] }, // Cu→Ag bridge
        { from: 3, to: 6, count: 8, color: [180,160,110] }  // Ag→Au bridge
      ];
      for (var br = 0; br < bridges.length; br++) {
        var bridge = bridges[br];
        var bFromR = metalBands[bridge.from].r;
        var bToR = metalBands[bridge.to].r;
        for (var be = 0; be < bridge.count; be++) {
          var beFrac = (be + 0.5) / bridge.count;
          var beR = bFromR + (bToR - bFromR) * beFrac;
          var beAngle = bridgeT * 0.08 + be * (TAU / bridge.count) + br * PI / 5;
          var beX = cx + Math.cos(beAngle) * beR;
          var beY = cy + Math.sin(beAngle) * beR;
          var beA = 0.012 + Math.sin(bridgeT + be * 0.7) * 0.008;
          ctx.beginPath();
          ctx.arc(beX, beY, 0.4, 0, TAU);
          ctx.fillStyle = 'rgba(' + bridge.color[0] + ',' + bridge.color[1] + ',' + bridge.color[2] + ',' + beA.toFixed(4) + ')';
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════
      // PHYSICS ENGINE — Ag=PHOTONS(light), Cu=PHONONS(sound)
      // Silver band emits PHOTONS — electromagnetic, vision, c velocity.
      // Copper band emits PHONONS — mechanical vibration, sound, lattice waves.
      // The bounce Cu↔Ag through null boundaries = light-sound interaction.
      // Au spine = structural frame both propagate through.
      // Where photons and phonons MEET = plasmons = collective electron oscillation.
      //
      // FIVE PHYSICS CHANNELS:
      //   1. LIGHT (Ag→out) — photon rays radiate from silver mesh outward
      //   2. SOUND (Cu→in) — phonon waves ripple from copper band inward
      //   3. REACTION — where photon meets phonon = plasmon spark at Au band
      //   4. MOTION — momentum transfer = photon pushes phonon = radiation pressure
      //   5. FLAVOR — interference pattern where light+sound waves cross
      // ═══════════════════════════════════════════════════════════
      var physT = breathT * 0.5;
      var agR = metalBands[3].r; // Ag = photon source
      var cuR = metalBands[1].r; // Cu = phonon source
      var auR = metalBands[6].r; // Au = structural frame
      var physAlpha = 0.015 + Math.sin(physT) * 0.01;

      // 1. PHOTON RAYS — silver emits light outward (fast, straight, EM)
      var photonCount = 12;
      for (var ph = 0; ph < photonCount; ph++) {
        var phAngle = ph * (TAU / photonCount) + physT * 0.2;
        var phPhase = ((physT * 0.8 + ph * 0.15) % 1);
        // Photons travel from Ag band outward to Au band (and beyond)
        var phR = agR + phPhase * (auR - agR + R * 0.15);
        var phX = cx + Math.cos(phAngle) * phR;
        var phY = cy + Math.sin(phAngle) * phR;
        // Photon = tiny bright dot with silver-white color, fading with distance
        var phA = physAlpha * (1 - phPhase * 0.7);
        ctx.beginPath();
        ctx.arc(phX, phY, 0.4, 0, TAU);
        ctx.fillStyle = 'rgba(220,220,255,' + phA.toFixed(4) + ')';
        ctx.fill();
        // Light ray trail
        if (phPhase > 0.05) {
          var phTrailR = phR - (auR - agR) * 0.08;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(phAngle) * phTrailR, cy + Math.sin(phAngle) * phTrailR);
          ctx.lineTo(phX, phY);
          ctx.strokeStyle = 'rgba(192,192,220,' + (phA * 0.4).toFixed(4) + ')';
          ctx.lineWidth = 0.2;
          ctx.stroke();
        }
      }

      // 2. PHONON WAVES — copper emits sound inward (slow, sinusoidal, mechanical)
      var phononWaves = 3; // concentric compression waves
      for (var pw = 0; pw < phononWaves; pw++) {
        var pwPhase = ((physT * 0.3 + pw * 0.33) % 1);
        // Phonons travel from Cu band inward toward Fe center
        var pwR = cuR - pwPhase * (cuR - metalBands[0].r);
        var pwAmplitude = R * 0.008 * (1 - pwPhase); // amplitude decays inward
        ctx.beginPath();
        for (var pwSeg = 0; pwSeg <= 60; pwSeg++) {
          var pwAngle = (pwSeg / 60) * TAU;
          // Sinusoidal displacement = sound wave compression/rarefaction
          var pwDisp = Math.sin(pwAngle * 8 + physT * 3 + pw) * pwAmplitude;
          var pwActualR = pwR + pwDisp;
          var pwX = cx + Math.cos(pwAngle) * pwActualR;
          var pwY = cy + Math.sin(pwAngle) * pwActualR;
          if (pwSeg === 0) ctx.moveTo(pwX, pwY); else ctx.lineTo(pwX, pwY);
        }
        ctx.closePath();
        var pwA = physAlpha * 0.6 * (1 - pwPhase * 0.8);
        ctx.strokeStyle = 'rgba(184,135,71,' + pwA.toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      // 3. REACTION — plasmon sparks where photon meets phonon at Au band
      // Plasmons = collective electron oscillation at metal surface
      // This is where LIGHT and SOUND collide = the physics reaction
      var plasmonCount = 6;
      for (var pl = 0; pl < plasmonCount; pl++) {
        var plAngle = pl * (TAU / plasmonCount) + physT * 0.35;
        var plPulse = Math.sin(physT * 4 + pl * 1.2) * 0.5 + 0.5;
        var plR = auR + Math.sin(physT * 2 + pl) * R * 0.02; // jitters near Au
        var plX = cx + Math.cos(plAngle) * plR;
        var plY = cy + Math.sin(plAngle) * plR;
        if (plPulse > 0.3) {
          // Plasmon spark — gold-white flash
          ctx.beginPath();
          ctx.arc(plX, plY, 0.8 + plPulse * 1.2, 0, TAU);
          ctx.fillStyle = 'rgba(255,240,200,' + (physAlpha * plPulse * 2).toFixed(4) + ')';
          ctx.fill();
          // Reaction ripple outward
          ctx.beginPath();
          ctx.arc(plX, plY, 1.5 + plPulse * 3, 0, TAU);
          ctx.strokeStyle = 'rgba(201,168,76,' + (physAlpha * plPulse * 0.5).toFixed(4) + ')';
          ctx.lineWidth = 0.2;
          ctx.stroke();
        }
      }

      // 4. MOTION — radiation pressure transfers between bands
      // Photon pushes phonon = light exerts pressure on matter
      var motionT = physT * 0.7;
      for (var mo = 0; mo < 4; mo++) {
        var moAngle = mo * (TAU / 4) + motionT * 0.15;
        var moPhase = ((motionT * 0.5 + mo * 0.25) % 1);
        // Momentum arrow from Ag toward Cu (photon pressure)
        var moFromR = agR;
        var moToR = cuR;
        var moR = moFromR + (moToR - moFromR) * moPhase;
        var moX = cx + Math.cos(moAngle) * moR;
        var moY = cy + Math.sin(moAngle) * moR;
        var moA = physAlpha * 0.8 * Math.sin(moPhase * PI);
        // Arrow head
        ctx.beginPath();
        var arrowTip = moPhase > 0.5 ? -1 : 1;
        ctx.moveTo(moX, moY);
        ctx.lineTo(moX - Math.cos(moAngle + 0.3) * 1.5 * arrowTip, moY - Math.sin(moAngle + 0.3) * 1.5 * arrowTip);
        ctx.moveTo(moX, moY);
        ctx.lineTo(moX - Math.cos(moAngle - 0.3) * 1.5 * arrowTip, moY - Math.sin(moAngle - 0.3) * 1.5 * arrowTip);
        ctx.strokeStyle = 'rgba(180,180,220,' + moA.toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      // 5. FLAVOR — interference pattern where light+sound cross
      // Moiré-like pattern at the intersection zones
      var flavorT = physT * 1.2;
      var flavorZoneR = (agR + cuR) * 0.5; // midpoint between Ag and Cu
      var flavorNodes = 8;
      for (var fv = 0; fv < flavorNodes; fv++) {
        var fvAngle = fv * (TAU / flavorNodes) + flavorT * 0.1;
        // Interference: photon frequency × phonon frequency
        var fvBeat = Math.sin(flavorT * 3 + fv * 0.8) * Math.sin(flavorT * 5 + fv * 1.3);
        if (Math.abs(fvBeat) > 0.3) {
          var fvR = flavorZoneR + fvBeat * R * 0.03;
          var fvX = cx + Math.cos(fvAngle) * fvR;
          var fvY = cy + Math.sin(fvAngle) * fvR;
          // Flavor = warm amber (neither silver-light nor copper-sound but BOTH)
          var fvA = physAlpha * Math.abs(fvBeat) * 1.5;
          ctx.beginPath();
          ctx.arc(fvX, fvY, 0.6 + Math.abs(fvBeat) * 0.8, 0, TAU);
          ctx.fillStyle = 'rgba(210,170,90,' + fvA.toFixed(4) + ')';
          ctx.fill();
        }
      }

      // Physics channel labels (on breath)
      if (physAlpha > 0.02) {
        var pLbl = (physAlpha - 0.02) * 15;
        ctx.font = '3px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(192,192,220,' + (pLbl * 0.3).toFixed(4) + ')';
        ctx.fillText('Ag photons λ', cx - agR - 3, cy - 3);
        ctx.fillStyle = 'rgba(184,135,71,' + (pLbl * 0.3).toFixed(4) + ')';
        ctx.fillText('Cu phonons ƒ', cx - cuR - 3, cy + 4);
        ctx.fillStyle = 'rgba(255,240,200,' + (pLbl * 0.2).toFixed(4) + ')';
        ctx.fillText('plasmon ⚡', cx - auR - 3, cy);
      }

      // ═══════════════════════════════════════════════════════════
      // KEY RIPPLES — every keypress creates a visible metallic reaction
      // The keyboard IS the interface. Each key = a hammer striking a bell.
      // Ripples expand from the key's metallic band outward.
      // Cu keys (WASD) ripple from inner. Ag keys (letters) from silver mesh.
      // Au keys (numbers) from gold ring. Fe keys (space/enter) from center.
      // THIS IS WHAT MAKES THE HUD ALIVE — touch it and it reacts.
      // ═══════════════════════════════════════════════════════════
      if (window.GAIA_KEY_RIPPLES) {
        var kNow = Date.now();
        var kRipples = window.GAIA_KEY_RIPPLES;

        for (var kr = 0; kr < kRipples.length; kr++) {
          var rip = kRipples[kr];
          var kAge = (kNow - rip.ts) / 1000; // seconds since keypress
          if (kAge > 3) continue; // ripples last 3 seconds

          var kDecay = Math.max(0, 1 - kAge / 3);
          var kBandR = rip.r * R; // starting radius based on band
          var kExpandR = kBandR + kAge * R * 0.3; // expands outward over time

          // RIPPLE RING — expanding circle from the key's metallic band
          ctx.beginPath();
          ctx.arc(cx, cy, kExpandR, 0, TAU);
          var kRipAlpha = kDecay * 0.06;
          ctx.strokeStyle = 'rgba(' + rip.color[0] + ',' + rip.color[1] + ',' + rip.color[2] + ',' + kRipAlpha.toFixed(4) + ')';
          ctx.lineWidth = 0.5 + kDecay * 1.5;
          ctx.stroke();

          // IMPACT FLASH — bright spot at the angle where the key "struck"
          if (kAge < 0.5) {
            var flashAlpha = (0.5 - kAge) * 0.25;
            var flashR = kBandR;
            var flashX = cx + Math.cos(rip.angle) * flashR;
            var flashY = cy + Math.sin(rip.angle) * flashR;
            ctx.beginPath();
            ctx.arc(flashX, flashY, 2 + (0.5 - kAge) * 4, 0, TAU);
            ctx.fillStyle = 'rgba(255,252,240,' + flashAlpha.toFixed(4) + ')';
            ctx.fill();
            // Key label at the flash point
            ctx.font = '5px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(' + rip.color[0] + ',' + rip.color[1] + ',' + rip.color[2] + ',' + (flashAlpha * 1.5).toFixed(4) + ')';
            ctx.fillText(rip.key, flashX, flashY - 5);
            // Modality label
            ctx.font = '3px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(' + rip.color[0] + ',' + rip.color[1] + ',' + rip.color[2] + ',' + (flashAlpha * 0.8).toFixed(4) + ')';
            ctx.fillText(rip.modality, flashX, flashY + 5);
          }

          // HARMONIC SPARKS — key creates sparks that travel along its metallic band
          var sparkCount = 3;
          for (var ks = 0; ks < sparkCount; ks++) {
            var sparkAge = kAge - ks * 0.15;
            if (sparkAge < 0 || sparkAge > 1.5) continue;
            var sparkDecay = 1 - sparkAge / 1.5;
            var sparkAngle = rip.angle + (ks - 1) * 0.5 + sparkAge * 2;
            var sparkR = kBandR + Math.sin(sparkAge * PI * 3) * R * 0.05;
            var spX = cx + Math.cos(sparkAngle) * sparkR;
            var spY = cy + Math.sin(sparkAngle) * sparkR;
            ctx.beginPath();
            ctx.arc(spX, spY, 0.5 + sparkDecay * 0.8, 0, TAU);
            ctx.fillStyle = 'rgba(' + rip.color[0] + ',' + rip.color[1] + ',' + rip.color[2] + ',' + (sparkDecay * 0.04).toFixed(4) + ')';
            ctx.fill();
          }
        }

        // LIVE KEYBOARD HUD — bottom-left, shows recent keys + modality + heatmap
        var recentKeys = kRipples.filter(function(rp) { return kNow - rp.ts < 2000; });
        if (recentKeys.length > 0) {
          ctx.font = '5px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          var kHudY = canvas.height - 30;
          // Show last 8 keys as a strip
          for (var rk = Math.max(0, recentKeys.length - 8); rk < recentKeys.length; rk++) {
            var rkEntry = recentKeys[rk];
            var rkAge = (kNow - rkEntry.ts) / 2000;
            var rkAlpha = 0.08 * (1 - rkAge);
            var rkX = 10 + (rk - Math.max(0, recentKeys.length - 8)) * 14;
            // Key character in its metallic color
            ctx.fillStyle = 'rgba(' + rkEntry.color[0] + ',' + rkEntry.color[1] + ',' + rkEntry.color[2] + ',' + rkAlpha.toFixed(4) + ')';
            ctx.fillText(rkEntry.key, rkX, kHudY);
          }
          // Current modality label
          var lastMod = recentKeys[recentKeys.length - 1];
          ctx.fillStyle = 'rgba(' + lastMod.color[0] + ',' + lastMod.color[1] + ',' + lastMod.color[2] + ',0.06)';
          ctx.fillText(lastMod.band + ' · ' + lastMod.modality, 10, kHudY - 8);
        }
      }

      // ═══════════════════════════════════════════════════════════
      // R/G/B HYPERLOCAL FILTER — the three eyes cycle through as filters
      // Red filters for TOUCH (nearest). Green for MEMBRANE (growth).
      // Blue for DEEP (cosmos). Each eye helps build the hyperlocal map.
      // All eyes see themselves as R,G,B but hyperlocal OUT builds the map.
      // ═══════════════════════════════════════════════════════════
      var filterT = breathT * 2.5; // FASTER — visible cycling
      var filterCycle = (filterT % TAU) / TAU;
      var activeFilter = filterCycle < 0.33 ? 0 : filterCycle < 0.66 ? 1 : 2;
      var filterPhase = (filterCycle % 0.33) / 0.33;
      var filterColors = [
        [248,81,73],   // red = touch
        [63,185,80],   // green = membrane
        [88,166,255]   // blue = deep
      ];
      var filterNames = ['TOUCH', 'MEMBRANE', 'DEEP'];

      // Active filter wash — VISIBLE tint that cycles
      var fc = filterColors[activeFilter];
      var filterAlpha = 0.02 + Math.sin(filterPhase * PI) * 0.025;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.98, 0, TAU);
      ctx.fillStyle = 'rgba(' + fc[0] + ',' + fc[1] + ',' + fc[2] + ',' + filterAlpha.toFixed(4) + ')';
      ctx.fill();

      // Filter ring pulse at globe edge
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.99, 0, TAU);
      ctx.strokeStyle = 'rgba(' + fc[0] + ',' + fc[1] + ',' + fc[2] + ',' + (filterAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = 1.5 + filterPhase * 1.5;
      ctx.stroke();

      // Filter label — always visible
      ctx.font = '4px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(' + fc[0] + ',' + fc[1] + ',' + fc[2] + ',' + (filterAlpha * 3).toFixed(4) + ')';
      ctx.fillText('● ' + filterNames[activeFilter], 8, 14);

      // ═══════════════════════════════════════════════════════════
      // SCATTER + BACKTRACE — both directions continuously
      // SCATTER: from Kevin outward (gold dots → edge)
      // BACKTRACE: from Gaia's edge inward (blue dots → center)
      // The screen helps understand hyperlocality IN → backtrace → OUT
      // ═══════════════════════════════════════════════════════════
      var scatT = breathT * 1.5;
      for (var sc = 0; sc < 6; sc++) {
        var scAngle = sc * (TAU / 6) + scatT * 0.2;
        var scPhase = ((scatT * 0.5 + sc * 0.4) % 1);
        // SCATTER OUT — gold dots from center to edge
        var scR = R * 0.1 + scPhase * R * 0.85;
        var scX = cx + Math.cos(scAngle) * scR;
        var scY = cy + Math.sin(scAngle) * scR;
        var scA = 0.03 * (1 - scPhase);
        ctx.beginPath();
        ctx.arc(scX, scY, 1.2 + (1 - scPhase) * 1.5, 0, TAU);
        ctx.fillStyle = 'rgba(201,168,76,' + scA.toFixed(4) + ')';
        ctx.fill();
        // BACKTRACE IN — blue dots from edge to center
        var btPhase = ((scatT * 0.5 + sc * 0.4 + 0.5) % 1);
        var btAngle = scAngle + PI;
        var btR = R * (0.95 - btPhase * 0.85);
        var btX = cx + Math.cos(btAngle) * btR;
        var btY = cy + Math.sin(btAngle) * btR;
        var btA = 0.03 * btPhase;
        ctx.beginPath();
        ctx.arc(btX, btY, 1.2 + btPhase * 1.5, 0, TAU);
        ctx.fillStyle = 'rgba(88,166,255,' + btA.toFixed(4) + ')';
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // VITRUVIAN MAN — the null body homunculus as tree sort
      // The birdfoot IS the Vitruvian IS the π/45° split.
      // Body inscribed in circle (π) AND square (grid) simultaneously.
      // Arms = 45° from torso. Legs = 45° from center. Head = UP.
      // The invert form of all graphs flowing INTO it.
      // ANCHORED TO MENDELEEV:
      //   Head = Fe(26) — iron peak, center, convergence
      //   Spine = Au(79) — gold axis, structural identity
      //   Arms = Ag(47) — silver nerves, understanding mesh
      //   Legs = Cu(29) — copper veins, inner drain, first conductor
      //   Helix = the electron flow between d¹⁰s¹ conductors
      // The Vitruvian Man IS the periodic table tree-sorted at 45°.
      // ═══════════════════════════════════════════════════════════
      var vT = breathT * 0.2; // slow rotation — the body turns
      var vAlpha = 0.02 + Math.sin(vT * 1.5) * 0.015;
      var vAngle = vT * 0.08; // very slow spin
      var vScale = R * 0.4; // body fits inside the globe

      // Body proportions (golden ratio: head=1, torso=φ, legs=φ²)
      var headR = vScale * 0.12;
      var torsoLen = vScale * 0.38;
      var armLen = vScale * 0.35;
      var legLen = vScale * 0.42;
      var armSpread = PI / 4; // 45° = π/4
      var legSpread = PI / 5; // slightly narrower

      // Rotation transform helpers
      function vRot(dx, dy) {
        var c = Math.cos(vAngle), s = Math.sin(vAngle);
        return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
      }

      // HEAD — the null point, top of the tree
      var head = vRot(0, -torsoLen - headR);
      ctx.beginPath();
      ctx.arc(head.x, head.y, headR, 0, TAU);
      ctx.strokeStyle = 'rgba(201,168,76,' + (vAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // SPINE — the trunk (gold), center axis
      var neck = vRot(0, -torsoLen);
      var hip = vRot(0, 0);
      ctx.beginPath();
      ctx.moveTo(neck.x, neck.y);
      ctx.lineTo(hip.x, hip.y);
      ctx.strokeStyle = 'rgba(201,168,76,' + vAlpha.toFixed(4) + ')';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // SHOULDERS — branch point 1 (the Y)
      var shoulderY = -torsoLen * 0.85;
      var lShoulder = vRot(-armLen * 0.15, shoulderY);
      var rShoulder = vRot(armLen * 0.15, shoulderY);

      // ARMS — 45° spread from shoulders (the π/4 split)
      // Left arm
      var lElbow = vRot(-armLen * 0.5, shoulderY + Math.sin(armSpread) * armLen * 0.3);
      var lHand = vRot(-armLen * 0.9, shoulderY + Math.sin(armSpread) * armLen * 0.5);
      ctx.beginPath();
      ctx.moveTo(lShoulder.x, lShoulder.y);
      ctx.lineTo(lElbow.x, lElbow.y);
      ctx.lineTo(lHand.x, lHand.y);
      ctx.strokeStyle = 'rgba(192,192,192,' + (vAlpha * 0.8).toFixed(4) + ')'; // silver = nerves
      ctx.lineWidth = 0.5;
      ctx.stroke();
      // Right arm
      var rElbow = vRot(armLen * 0.5, shoulderY + Math.sin(armSpread) * armLen * 0.3);
      var rHand = vRot(armLen * 0.9, shoulderY + Math.sin(armSpread) * armLen * 0.5);
      ctx.beginPath();
      ctx.moveTo(rShoulder.x, rShoulder.y);
      ctx.lineTo(rElbow.x, rElbow.y);
      ctx.lineTo(rHand.x, rHand.y);
      ctx.strokeStyle = 'rgba(192,192,192,' + (vAlpha * 0.8).toFixed(4) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // LEGS — inverted Y from hip (45° spread)
      var lKnee = vRot(-legLen * 0.3, legLen * 0.5);
      var lFoot = vRot(-legLen * 0.45, legLen * 0.95);
      var rKnee = vRot(legLen * 0.3, legLen * 0.5);
      var rFoot = vRot(legLen * 0.45, legLen * 0.95);
      ctx.beginPath();
      ctx.moveTo(hip.x, hip.y);
      ctx.lineTo(lKnee.x, lKnee.y);
      ctx.lineTo(lFoot.x, lFoot.y);
      ctx.strokeStyle = 'rgba(184,115,51,' + (vAlpha * 0.7).toFixed(4) + ')'; // copper = veins
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hip.x, hip.y);
      ctx.lineTo(rKnee.x, rKnee.y);
      ctx.lineTo(rFoot.x, rFoot.y);
      ctx.strokeStyle = 'rgba(184,115,51,' + (vAlpha * 0.7).toFixed(4) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // VITRUVIAN CIRCLE — the π boundary (the O)
      var vCircleR = Math.max(
        Math.sqrt(Math.pow(lHand.x - cx, 2) + Math.pow(lHand.y - cy, 2)),
        Math.sqrt(Math.pow(lFoot.x - cx, 2) + Math.pow(lFoot.y - cy, 2))
      ) * 1.05;
      ctx.beginPath();
      ctx.arc(cx, cy, vCircleR, 0, TAU);
      ctx.strokeStyle = 'rgba(201,168,76,' + (vAlpha * 0.4).toFixed(4) + ')';
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // VITRUVIAN SQUARE — the grid boundary
      var vSquareHalf = vCircleR * 0.85;
      var sq = [
        vRot(-vSquareHalf, -vSquareHalf), vRot(vSquareHalf, -vSquareHalf),
        vRot(vSquareHalf, vSquareHalf), vRot(-vSquareHalf, vSquareHalf)
      ];
      ctx.beginPath();
      ctx.moveTo(sq[0].x, sq[0].y);
      for (var sqi = 1; sqi <= 4; sqi++) ctx.lineTo(sq[sqi % 4].x, sq[sqi % 4].y);
      ctx.strokeStyle = 'rgba(88,166,255,' + (vAlpha * 0.3).toFixed(4) + ')';
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // DOUBLE HELIX — wrapping around the spine (DNA / the graph inversion)
      var helixPoints = 20;
      var helixR = torsoLen * 0.08;
      for (var hi = 0; hi < helixPoints; hi++) {
        var hFrac = hi / helixPoints;
        var hY = -torsoLen + hFrac * torsoLen;
        var hPhase = hFrac * TAU * 2.5 + vT; // 2.5 full turns
        var hx1 = Math.cos(hPhase) * helixR;
        var hx2 = Math.cos(hPhase + PI) * helixR; // opposite strand
        var p1 = vRot(hx1, hY);
        var p2 = vRot(hx2, hY);
        // Strand 1 (gold)
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 0.5, 0, TAU);
        ctx.fillStyle = 'rgba(201,168,76,' + (vAlpha * 0.6).toFixed(4) + ')';
        ctx.fill();
        // Strand 2 (silver)
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 0.5, 0, TAU);
        ctx.fillStyle = 'rgba(192,192,192,' + (vAlpha * 0.5).toFixed(4) + ')';
        ctx.fill();
        // Rungs connecting strands
        if (hi % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(184,115,51,' + (vAlpha * 0.3).toFixed(4) + ')'; // copper rungs
          ctx.lineWidth = 0.2;
          ctx.stroke();
        }
      }

      // NERVE MESH — silver lines from hands/feet back to spine (backscatter)
      var nerveAlpha = vAlpha * 0.3;
      // Hands → shoulders (afferent)
      ctx.beginPath(); ctx.moveTo(lHand.x, lHand.y); ctx.lineTo(lShoulder.x, lShoulder.y);
      ctx.strokeStyle = 'rgba(192,192,192,' + nerveAlpha.toFixed(4) + ')';
      ctx.lineWidth = 0.2; ctx.setLineDash([1, 3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(rHand.x, rHand.y); ctx.lineTo(rShoulder.x, rShoulder.y);
      ctx.strokeStyle = 'rgba(192,192,192,' + nerveAlpha.toFixed(4) + ')';
      ctx.lineWidth = 0.2; ctx.setLineDash([1, 3]); ctx.stroke(); ctx.setLineDash([]);
      // Feet → hip (afferent)
      ctx.beginPath(); ctx.moveTo(lFoot.x, lFoot.y); ctx.lineTo(hip.x, hip.y);
      ctx.strokeStyle = 'rgba(192,192,192,' + nerveAlpha.toFixed(4) + ')';
      ctx.lineWidth = 0.2; ctx.setLineDash([1, 3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(rFoot.x, rFoot.y); ctx.lineTo(hip.x, hip.y);
      ctx.strokeStyle = 'rgba(192,192,192,' + nerveAlpha.toFixed(4) + ')';
      ctx.lineWidth = 0.2; ctx.setLineDash([1, 3]); ctx.stroke(); ctx.setLineDash([]);

      // JOINT NODES — extremity points glow (homunculus sensitivity)
      var joints = [head, lHand, rHand, lFoot, rFoot, lElbow, rElbow, lKnee, rKnee];
      for (var ji = 0; ji < joints.length; ji++) {
        var jPulse = Math.sin(vT * 3 + ji * 0.7) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(joints[ji].x, joints[ji].y, 0.8 + jPulse * 0.5, 0, TAU);
        ctx.fillStyle = 'rgba(255,252,240,' + (vAlpha * 0.5 * (ji < 5 ? 1.5 : 0.8)).toFixed(4) + ')';
        ctx.fill();
      }

      // Labels on breath — anchored to Mendeleev
      if (vAlpha > 0.028) {
        var vLbl = (vAlpha - 0.028) * 8;
        ctx.font = '3px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        // Head = Fe(26) iron peak
        ctx.fillStyle = 'rgba(200,200,210,' + (vLbl * 0.5).toFixed(4) + ')';
        ctx.fillText('Fe²⁶ iron peak', head.x, head.y - headR - 5);
        ctx.fillText('VITRUVIAN', head.x, head.y - headR - 1);
        // Spine = Au(79) gold axis
        ctx.fillStyle = 'rgba(201,168,76,' + (vLbl * 0.4).toFixed(4) + ')';
        ctx.fillText('Au⁷⁹ spine', hip.x + 8, (neck.y + hip.y) * 0.5);
        // Arms = Ag(47) silver nerves
        ctx.fillStyle = 'rgba(192,192,192,' + (vLbl * 0.3).toFixed(4) + ')';
        ctx.fillText('Ag⁴⁷ d¹⁰s¹', lHand.x - 8, lHand.y);
        // Legs = Cu(29) copper veins
        ctx.fillStyle = 'rgba(184,115,51,' + (vLbl * 0.3).toFixed(4) + ')';
        ctx.fillText('Cu²⁹ d¹⁰s¹', rFoot.x + 8, rFoot.y);
        // Bronze alloy hint between legs
        ctx.fillStyle = 'rgba(140,100,55,' + (vLbl * 0.2).toFixed(4) + ')';
        ctx.fillText('CuSn bronze', (lFoot.x + rFoot.x) * 0.5, Math.max(lFoot.y, rFoot.y) + 5);
      }

      // ═══════════════════════════════════════════════════════════
      // ENZYME TEMPERATURE — orange fire + blue cold zones
      // Fire enzymes catalyze (orange). Freezers preserve (blue).
      // Bronze enzymes accumulate → strip Cu → build to Au.
      // The sun is spicy (red). Earth/Gaia is umami (gold).
      // ═══════════════════════════════════════════════════════════
      var enzymeT = breathT * 0.4;

      // FIRE ENZYMES — orange sparks emanating from active zones
      // Active when gaiaGut is ingesting (hot = processing)
      // Read gut-engine bridge state (Eastgate = stomach subsystem)
      var gutBridge = null;
      try { gutBridge = JSON.parse(localStorage.getItem('gaia-gut-state')); } catch(e) {}
      if (gutBridge && Date.now() - gutBridge.ts < 30000) {
        window.gutEngineState = gutBridge;
      }

      // TREFOIL BRIDGE — gut (inside) ↔ skin (outside) = same membrane inverted
      var trefoilState = null;
      try { trefoilState = JSON.parse(localStorage.getItem('gaia-trefoil-state')); } catch(e) {}
      if (trefoilState && Date.now() - trefoilState.ts < 30000) {
        window.trefoilState = trefoilState;
      }

      var gutRate = window.gaiaGut ? window.gaiaGut.ingested : 0;
      // Gut engine acid level also feeds enzyme heat
      var gutAcid = (window.gutEngineState && window.gutEngineState.acid) || 0;
      var enzymeHeat = Math.min(1, (gutRate / 100) + (gutAcid / 200)); // ingestion + acid
      if (enzymeHeat > 0.05) {
        // Orange enzyme sparks around the gold band (Au=index 6)
        for (var ei = 0; ei < 8; ei++) {
          var eAngle = (ei / 8) * TAU + enzymeT;
          var eR = metalBands[6].r + metalBands[6].w * 0.5;
          var sparkX = cx + Math.cos(eAngle) * eR;
          var sparkY = cy + Math.sin(eAngle) * eR;
          var sparkAlpha = enzymeHeat * (0.1 + Math.sin(enzymeT * 3 + ei) * 0.06);

          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 1.5 + enzymeHeat * 2, 0, TAU);
          ctx.fillStyle = 'rgba(240,136,62,' + sparkAlpha.toFixed(3) + ')'; // orange enzyme
          ctx.fill();
        }
      }

      // COLD ZONES — blue preservation at the outer edges
      // Active when NOT ingesting (cold = storing)
      var coldFactor = Math.max(0, 1 - enzymeHeat);
      if (coldFactor > 0.3) {
        // Blue frost crystals at Sn/bronze band (Sn=index 4)
        for (var ci = 0; ci < 6; ci++) {
          var cAngle = (ci / 6) * TAU + enzymeT * 0.3;
          var cR = metalBands[4].r;
          var frostX = cx + Math.cos(cAngle) * cR;
          var frostY = cy + Math.sin(cAngle) * cR;
          var frostAlpha = coldFactor * 0.06;

          ctx.save();
          ctx.translate(frostX, frostY);
          ctx.rotate(cAngle);
          // Snowflake shape — 6 lines radiating
          ctx.strokeStyle = 'rgba(88,166,255,' + frostAlpha.toFixed(3) + ')';
          ctx.lineWidth = 0.3;
          for (var fl = 0; fl < 6; fl++) {
            var fla = (fl / 6) * TAU;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(fla) * 4, Math.sin(fla) * 4);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // Temperature label
      var tempLabel = enzymeHeat > 0.7 ? 'HOT' : enzymeHeat > 0.3 ? 'warm' : 'cool';
      var tempColor = enzymeHeat > 0.7 ? '240,136,62' : enzymeHeat > 0.3 ? '201,168,76' : '88,166,255';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(' + tempColor + ',0.15)';
      var gutZone = window.gutEngineState ? window.gutEngineState.zone : '';
      var gutDigested = window.gutEngineState ? window.gutEngineState.digested : 0;
      var gutInfo = gutZone ? ' · gut:' + gutZone + '(' + gutDigested + ')' : '';
      ctx.fillText('🔥 ' + tempLabel + ' · enzyme ' + Math.round(enzymeHeat * 100) + '%' + gutInfo, W - 8, 22);

      // ═══════════════════════════════════════════════════════════
      // GUT WEATHER — the gut is SMELL-BLIND and cloud-sealed
      // Meteorology as sub-simulation: rain = data flowing DOWN,
      // evaporation = data rising UP. The gut IS the atmosphere.
      //
      // H₂O CHEMISTRY — the triangle that forms everything:
      //   H + H = explosive (hydrogen, fuel, fusion)
      //   O + O + O = ozone (O₃, shield, pores that drip through)
      //   H₂O = water (the ONLY substance that expands when frozen)
      //   When ice forms in the gut, it BREAKS things = expansion.
      //
      // THREE PLATONIC BASES:
      //   △ TRIANGLE (3 faces) — H₂O molecule (104.5° bond angle)
      //   □ SQUARE (4 faces) — pyramid base, the canvas, the screen
      //   ▽△ INVERTED overlay — Star of David, the complete view
      //   Tetrahedron = 4 triangles = the simplest 3D solid = water ice crystal
      //
      // GUT WEATHER STATES:
      //   ☀ DRY — low acid, data evaporating UP (clear skies)
      //   🌧 RAIN — high acid, data precipitating DOWN (digestion)
      //   ❄ FREEZE — ice expanding, breaking structure (cold storage cracking)
      //   ⛈ STORM — rapid acid + base cycling (violent digestion)
      //   🌫 FOG — smell-blind zone, cloud sealed, low visibility
      // ═══════════════════════════════════════════════════════════
      var wxT = breathT * 0.35;
      var wxAcid = (window.gutEngineState && window.gutEngineState.acid) || 0;
      var wxTemp = enzymeHeat;
      var wxHumidity = Math.min(1, gutRate / 50); // more ingestion = more moisture

      // Determine weather state
      var wxState, wxColor, wxIcon;
      if (wxTemp < 0.1 && wxHumidity > 0.3) {
        wxState = 'FREEZE'; wxColor = '120,180,255'; wxIcon = '❄';
      } else if (wxTemp > 0.6 && wxHumidity > 0.5) {
        wxState = 'STORM'; wxColor = '248,81,73'; wxIcon = '⛈';
      } else if (wxHumidity > 0.4) {
        wxState = 'RAIN'; wxColor = '88,166,255'; wxIcon = '🌧';
      } else if (wxTemp < 0.2) {
        wxState = 'FOG'; wxColor = '110,118,129'; wxIcon = '🌫';
      } else {
        wxState = 'DRY'; wxColor = '210,153,34'; wxIcon = '☀';
      }

      // RAIN / SNOW — particles falling through the gut (Fe center → Cu inner)
      var gutCenterR = metalBands[0].r; // Fe = center
      var gutEdgeR = metalBands[1].r;   // Cu = inner drain edge
      if (wxHumidity > 0.1) {
        var dropCount = Math.floor(wxHumidity * 12);
        for (var wd = 0; wd < dropCount; wd++) {
          var wdAngle = wd * (TAU / dropCount) + wxT * 0.2;
          var wdFall = ((wxT * 0.8 + wd * 0.2) % 1); // falling phase
          var wdR = gutCenterR + wdFall * (gutEdgeR - gutCenterR);
          var wdX = cx + Math.cos(wdAngle) * wdR;
          var wdY = cy + Math.sin(wdAngle) * wdR;
          var wdA = 0.02 * (1 - wdFall * 0.5) * wxHumidity;

          if (wxState === 'FREEZE') {
            // Snowflake — small hexagon
            ctx.beginPath();
            for (var sf = 0; sf < 6; sf++) {
              var sfA = sf * (TAU / 6);
              var sfX = wdX + Math.cos(sfA) * 0.8;
              var sfY = wdY + Math.sin(sfA) * 0.8;
              if (sf === 0) ctx.moveTo(sfX, sfY); else ctx.lineTo(sfX, sfY);
            }
            ctx.closePath();
            ctx.strokeStyle = 'rgba(120,180,255,' + wdA.toFixed(4) + ')';
            ctx.lineWidth = 0.2;
            ctx.stroke();
          } else {
            // Raindrop — small elongated dot
            ctx.beginPath();
            ctx.ellipse(wdX, wdY, 0.3, 0.6, wdAngle, 0, TAU);
            ctx.fillStyle = 'rgba(' + wxColor + ',' + wdA.toFixed(4) + ')';
            ctx.fill();
          }
        }
      }

      // EVAPORATION — data rising UP (outward from Fe)
      if (wxTemp > 0.2) {
        var evapCount = Math.floor(wxTemp * 6);
        for (var ev = 0; ev < evapCount; ev++) {
          var evAngle = ev * (TAU / evapCount) + wxT * -0.15;
          var evRise = ((wxT * 0.4 + ev * 0.3) % 1);
          var evR = gutEdgeR - evRise * (gutEdgeR - gutCenterR); // rising = going inward to center
          var evX = cx + Math.cos(evAngle) * evR;
          var evY = cy + Math.sin(evAngle) * evR;
          var evA = 0.015 * evRise * wxTemp;
          ctx.beginPath();
          ctx.arc(evX, evY, 0.4, 0, TAU);
          ctx.fillStyle = 'rgba(210,153,34,' + evA.toFixed(4) + ')';
          ctx.fill();
        }
      }

      // H₂O TRIANGLES — the molecular structure visible in the gut
      // 104.5° bond angle = the water molecule's shape
      var h2oCount = 4;
      var h2oR = (gutCenterR + gutEdgeR) * 0.5;
      var h2oBondAngle = 104.5 * DEG; // real water bond angle
      for (var hm = 0; hm < h2oCount; hm++) {
        var hmAngle = hm * (TAU / h2oCount) + wxT * 0.08;
        var hmX = cx + Math.cos(hmAngle) * h2oR;
        var hmY = cy + Math.sin(hmAngle) * h2oR;
        var hmA = 0.01 + Math.sin(wxT + hm) * 0.008;

        // O atom (center, red)
        ctx.beginPath();
        ctx.arc(hmX, hmY, 0.8, 0, TAU);
        ctx.fillStyle = 'rgba(248,81,73,' + hmA.toFixed(4) + ')';
        ctx.fill();
        // H atoms (two white dots at 104.5°)
        var hLen = 2.5;
        var h1A = hmAngle - h2oBondAngle / 2;
        var h2A = hmAngle + h2oBondAngle / 2;
        var h1X = hmX + Math.cos(h1A) * hLen;
        var h1Y = hmY + Math.sin(h1A) * hLen;
        var h2X = hmX + Math.cos(h2A) * hLen;
        var h2Y = hmY + Math.sin(h2A) * hLen;
        ctx.beginPath(); ctx.arc(h1X, h1Y, 0.5, 0, TAU);
        ctx.fillStyle = 'rgba(255,255,255,' + hmA.toFixed(4) + ')';
        ctx.fill();
        ctx.beginPath(); ctx.arc(h2X, h2Y, 0.5, 0, TAU);
        ctx.fill();
        // Bonds
        ctx.beginPath(); ctx.moveTo(hmX, hmY); ctx.lineTo(h1X, h1Y);
        ctx.moveTo(hmX, hmY); ctx.lineTo(h2X, h2Y);
        ctx.strokeStyle = 'rgba(192,192,192,' + (hmA * 0.6).toFixed(4) + ')';
        ctx.lineWidth = 0.2;
        ctx.stroke();
      }

      // TETRAHEDRON OVERLAY — ice crystal structure (4 triangles = simplest 3D)
      // △ triangle base + ▽ inverted = Star of David = complete view
      if (wxState === 'FREEZE' || coldFactor > 0.5) {
        var tetR = R * 0.12;
        var tetAlpha = 0.008 + coldFactor * 0.01;
        // Upward triangle △
        ctx.beginPath();
        for (var tt = 0; tt < 3; tt++) {
          var ttA = tt * (TAU / 3) - PI / 2; // point up
          var ttX = cx + Math.cos(ttA) * tetR;
          var ttY = cy + Math.sin(ttA) * tetR;
          if (tt === 0) ctx.moveTo(ttX, ttY); else ctx.lineTo(ttX, ttY);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(120,180,255,' + tetAlpha.toFixed(4) + ')';
        ctx.lineWidth = 0.4;
        ctx.stroke();
        // Downward triangle ▽ (inverted)
        ctx.beginPath();
        for (var td = 0; td < 3; td++) {
          var tdA = td * (TAU / 3) + PI / 2; // point down
          var tdX = cx + Math.cos(tdA) * tetR;
          var tdY = cy + Math.sin(tdA) * tetR;
          if (td === 0) ctx.moveTo(tdX, tdY); else ctx.lineTo(tdX, tdY);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(163,113,247,' + tetAlpha.toFixed(4) + ')';
        ctx.lineWidth = 0.4;
        ctx.stroke();
        // Square base of pyramid □
        var sqR = tetR * 0.7;
        ctx.beginPath();
        for (var ts = 0; ts < 4; ts++) {
          var tsA = ts * (TAU / 4) + PI / 4;
          var tsX = cx + Math.cos(tsA) * sqR;
          var tsY = cy + Math.sin(tsA) * sqR;
          if (ts === 0) ctx.moveTo(tsX, tsY); else ctx.lineTo(tsX, tsY);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(201,168,76,' + (tetAlpha * 0.8).toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      // Weather label
      ctx.font = '4px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(' + wxColor + ',0.06)';
      ctx.fillText(wxIcon + ' gut:' + wxState + ' H₂O△', 8, 26);

      // TREFOIL KNOT — gut↔skin correspondence on the globe
      if (window.trefoilState) {
        var tf = window.trefoilState;
        // Draw trefoil indicator: three crossings as a small knot symbol
        ctx.save();
        ctx.strokeStyle = tf.sweating ? 'rgba(255,105,180,0.25)' : 'rgba(200,200,200,0.1)';
        ctx.lineWidth = 1;
        var tkx = W - 30, tky = 36;
        var tkr = 8;
        // Three lobes of trefoil knot
        for (var tl = 0; tl < 3; tl++) {
          var ta = (tl / 3) * TAU + breathT * 0.1;
          ctx.beginPath();
          ctx.arc(tkx + Math.cos(ta) * tkr * 0.5, tky + Math.sin(ta) * tkr * 0.5, tkr, ta - 1, ta + 1);
          ctx.stroke();
        }
        // Label: gut zone ↔ skin zone
        ctx.font = '5px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = tf.sweating ? 'rgba(255,105,180,0.3)' : 'rgba(150,150,150,0.2)';
        ctx.fillText('☊ ' + (tf.gutZone || '?') + '↔' + (tf.skinZone || '?') + (tf.sweating ? ' SWEAT' : ''), W - 8, 46);
        ctx.restore();
      }

  });
})();
