// pt-membrane-animate-ext.js — extracted animation sections.
// Chemistry, Solar, Focal/Helix, Null Data, chipMonk, Spine, Evolution.
window._membraneAnimateExt = function(mc, now) {
  var ac = mc._ac;
  var cx=ac.cx, cy=ac.cy, R=ac.R, BR=ac.BR, PI=ac.PI, TAU=ac.TAU, t=ac.t;
  var perturb=ac.perturb, omega_is=ac.omega_is, omega_was=ac.omega_was, omega_willbe=ac.omega_willbe;
  var bodyPositions=ac.bodyPositions, bodyAngles=ac.bodyAngles, rps=ac.rps;
  var prevDash=ac.prevDash, liveStats=ac.liveStats, willbeT=ac.willbeT, smoothT=ac.smoothT, easeT=ac.easeT;
  var lerp=ac.lerp, sinePerturb=ac.sinePerturb, wasDash=ac.wasDash;
  var TIERS=mc.TIERS, aliveSet=mc.aliveSet, geo=mc.geo, PANELS=mc.PANELS, dimCost=mc.dimCost, pulses=mc.pulses, particles=mc.particles;
    // ── Chemistry: H + H → He, H + H + O → H₂O ──
    // Three particles orbit in the P-space lattice at coprime rates.
    // Under pressure (near center), bonds form. Fusion glows.
    // The chemistry IS the three-body problem made physical.
    var chemOrbits = [
      {id:'H1', orbR:R/3.2,  rate:PI/5,   phase:0},
      {id:'H2', orbR:R/4.5,  rate:PI/8.3, phase:TAU/3},
      {id:'O',  orbR:R/2.8,  rate:PI/13,  phase:TAU*2/3}
    ];
    var chemPos = [];
    for (var chi = 0; chi < 3; chi++) {
      var ce = chemOrbits[chi];
      var chR = ce.orbR * (0.4 + 0.6 * perturb);
      var chAngle = ce.phase + t * ce.rate;
      // Pressure perturbation — bodies pull on the chemistry
      var chPertX = 0, chPertY = 0;
      for (var chbi = 0; chbi < bodyPositions.length; chbi++) {
        var chDx = bodyPositions[chbi].x - cx;
        var chDy = bodyPositions[chbi].y - cy;
        chPertX += chDx * 0.05;
        chPertY += chDy * 0.05;
      }
      var chx = cx + chR * Math.cos(chAngle) + chPertX;
      var chy = cy + chR * Math.sin(chAngle) + chPertY;
      chemPos.push({x:chx, y:chy});

      var chDot = document.getElementById('mg-chem-' + ce.id);
      if (chDot) {
        chDot.setAttribute('cx', chx.toFixed(1));
        chDot.setAttribute('cy', chy.toFixed(1));
        chDot.setAttribute('opacity', (0.20 + 0.25 * perturb).toFixed(2));
      }
      var chLbl = document.getElementById('mg-chem-label-' + ce.id);
      if (chLbl) {
        chLbl.setAttribute('x', chx.toFixed(1));
        chLbl.setAttribute('y', (chy - 6).toFixed(1));
        chLbl.setAttribute('opacity', (0.12 + 0.15 * perturb).toFixed(2));
      }
    }

    // Proximity: H1-H2, H1-O, H2-O
    var dHH = Math.sqrt(Math.pow(chemPos[0].x - chemPos[1].x, 2) +
                        Math.pow(chemPos[0].y - chemPos[1].y, 2));
    var dH1O = Math.sqrt(Math.pow(chemPos[0].x - chemPos[2].x, 2) +
                         Math.pow(chemPos[0].y - chemPos[2].y, 2));
    var dH2O = Math.sqrt(Math.pow(chemPos[1].x - chemPos[2].x, 2) +
                         Math.pow(chemPos[1].y - chemPos[2].y, 2));

    // H-H bond (pre-fusion proximity)
    var hhBond = document.getElementById('mg-bond-HH');
    var fusionProx = Math.max(0, 1 - dHH / 45);
    if (hhBond) {
      hhBond.setAttribute('x1', chemPos[0].x.toFixed(1));
      hhBond.setAttribute('y1', chemPos[0].y.toFixed(1));
      hhBond.setAttribute('x2', chemPos[1].x.toFixed(1));
      hhBond.setAttribute('y2', chemPos[1].y.toFixed(1));
      hhBond.setAttribute('stroke-opacity', (fusionProx * 0.35).toFixed(3));
    }

    // He fusion indicator — glows when H+H are close
    var heMx = (chemPos[0].x + chemPos[1].x) / 2;
    var heMy = (chemPos[0].y + chemPos[1].y) / 2;
    var heEl = document.getElementById('mg-chem-He');
    if (heEl) {
      heEl.setAttribute('cx', heMx.toFixed(1));
      heEl.setAttribute('cy', heMy.toFixed(1));
      heEl.setAttribute('opacity', (fusionProx * fusionProx * 0.6).toFixed(3));
      heEl.setAttribute('r', (4 + fusionProx * 5).toFixed(1));
    }
    var heLbl = document.getElementById('mg-chem-label-He');
    if (heLbl) {
      heLbl.setAttribute('x', heMx.toFixed(1));
      heLbl.setAttribute('y', (heMy - 10).toFixed(1));
      heLbl.setAttribute('opacity', (fusionProx * fusionProx * 0.35).toFixed(3));
    }

    // H₂O bond formation — when both H's are near O
    var waterProx = Math.min(
      Math.max(0, 1 - dH1O / 55),
      Math.max(0, 1 - dH2O / 55));
    var bond1 = document.getElementById('mg-bond-HO1');
    var bond2 = document.getElementById('mg-bond-HO2');
    if (bond1) {
      bond1.setAttribute('x1', chemPos[0].x.toFixed(1));
      bond1.setAttribute('y1', chemPos[0].y.toFixed(1));
      bond1.setAttribute('x2', chemPos[2].x.toFixed(1));
      bond1.setAttribute('y2', chemPos[2].y.toFixed(1));
      bond1.setAttribute('stroke-opacity', (waterProx * 0.45).toFixed(3));
    }
    if (bond2) {
      bond2.setAttribute('x1', chemPos[1].x.toFixed(1));
      bond2.setAttribute('y1', chemPos[1].y.toFixed(1));
      bond2.setAttribute('x2', chemPos[2].x.toFixed(1));
      bond2.setAttribute('y2', chemPos[2].y.toFixed(1));
      bond2.setAttribute('stroke-opacity', (waterProx * 0.45).toFixed(3));
    }

    // H₂O label — appears when water forms
    var h2oLbl = document.getElementById('mg-chem-label-H2O');
    if (h2oLbl) {
      h2oLbl.setAttribute('x', chemPos[2].x.toFixed(1));
      h2oLbl.setAttribute('y', (chemPos[2].y + 12).toFixed(1));
      h2oLbl.setAttribute('opacity', (waterProx * waterProx * 0.3).toFixed(3));
    }

    // Bond angle arc — show the 104.5° H-O-H angle when water forms
    if (waterProx > 0.1) {
      var aH1 = Math.atan2(chemPos[0].y - chemPos[2].y, chemPos[0].x - chemPos[2].x);
      var aH2 = Math.atan2(chemPos[1].y - chemPos[2].y, chemPos[1].x - chemPos[2].x);
      var bondAngleDeg = Math.abs(aH1 - aH2) * 180 / PI;
      if (bondAngleDeg > 180) bondAngleDeg = 360 - bondAngleDeg;
      var arcR = 8;
      var arcPath = 'M ' +
        (chemPos[2].x + arcR * Math.cos(aH1)).toFixed(1) + ' ' +
        (chemPos[2].y + arcR * Math.sin(aH1)).toFixed(1) +
        ' A ' + arcR + ' ' + arcR + ' 0 0 ' +
        (aH2 > aH1 ? '1' : '0') + ' ' +
        (chemPos[2].x + arcR * Math.cos(aH2)).toFixed(1) + ' ' +
        (chemPos[2].y + arcR * Math.sin(aH2)).toFixed(1);
      var bAngleEl = document.getElementById('mg-bond-angle');
      if (bAngleEl) {
        bAngleEl.setAttribute('d', arcPath);
        bAngleEl.setAttribute('stroke-opacity', (waterProx * 0.3).toFixed(3));
      }
      var bAngleLbl = document.getElementById('mg-bond-angle-label');
      if (bAngleLbl) {
        bAngleLbl.setAttribute('x', (chemPos[2].x + 14 * Math.cos((aH1+aH2)/2)).toFixed(1));
        bAngleLbl.setAttribute('y', (chemPos[2].y + 14 * Math.sin((aH1+aH2)/2)).toFixed(1));
        bAngleLbl.textContent = bondAngleDeg.toFixed(1) + '\u00b0';
        bAngleLbl.setAttribute('opacity', (waterProx * 0.2).toFixed(3));
      }
    }

    // ── Solar system: planets orbit outside the ring ──
    // Moon orbits fast (monthly). Mars, Jupiter, Saturn at their own rates.
    // All rates coprime. Nothing locks.
    var solarRates = [
      {id:'moon',    orb:R+12,    rate:PI*1.5,  phase:0},
      {id:'mars',    orb:R*1.15,  rate:PI/3.7,  phase:PI/3},
      {id:'jupiter', orb:R*1.32,  rate:PI/7.9,  phase:PI},
      {id:'saturn',  orb:R*1.44,  rate:PI/13.3, phase:PI*1.7}
    ];
    for (var spi = 0; spi < solarRates.length; spi++) {
      var sp = solarRates[spi];
      var spAngle = sp.phase + t * sp.rate;
      var spx = cx + sp.orb * Math.cos(spAngle);
      var spy = cy + sp.orb * Math.sin(spAngle);
      var spDot = document.getElementById('mg-solar-' + sp.id);
      if (spDot) {
        spDot.setAttribute('cx', spx.toFixed(1));
        spDot.setAttribute('cy', spy.toFixed(1));
      }
      var spLbl = document.getElementById('mg-solar-label-' + sp.id);
      if (spLbl) {
        spLbl.setAttribute('x', spx.toFixed(1));
        var pSize = [2, 2.5, 4, 3.5][spi];
        spLbl.setAttribute('y', (spy - pSize - 3).toFixed(1));
      }
    }

    // ── Focal Switch + Helix Bounce: 3 objects, ratio π, spiral not circle ──
    // The 3 objects (Moon, center, Gaia) are NOT on a circle.
    // The ratio between their radii IS π to each other:
    //   Gaia r=6. Center r=0. Moon r≈182. Ratio Moon/Gaia ≈ 30 ≈ π³.
    // They're on a SPIRAL — a helix. The helix IS the structure.
    // The counter-twist: one strand goes Moon→Gaia, the other Gaia→Moon.
    // RPS IS rotation. ω = 2π × RPS. Period = π/ω = 1/(2×RPS).
    // At null (RPS→0): period → ∞. At ∞ (RPS→∞): period → 0.
    // π/rate = half-flip time. The time to switch observation.
    var moonAngle = solarRates[0].phase + t * solarRates[0].rate;
    var moonOrb = solarRates[0].orb;
    var moonX = cx + moonOrb * Math.cos(moonAngle);
    var moonY = cy + moonOrb * Math.sin(moonAngle);
    var reflAngle = moonAngle + PI;
    var gaiaR = 6;
    var reflX = cx + gaiaR * Math.cos(reflAngle);
    var reflY = cy + gaiaR * Math.sin(reflAngle);

    // RPS as angular velocity — rotation IS observation rate
    var rpsOmega = liveStats.rps > 0 ? TAU * liveStats.rps : TAU;
    // π / rpsOmega = half-flip time. How long to switch focal point.
    var flipTime = PI / rpsOmega;
    // Bounce phase: oscillates at RPS rate, not constant π
    // The observation bounces at the rate we're actually measuring
    var bouncePhase = 0.5 + 0.5 * Math.sin(t * rpsOmega * 0.01);
    var stability = Math.max(0, 1 - perturb);
    var dampedBounce = bouncePhase * (1 - stability * 0.7);

    // ── Helix structure: 3 nodes on a spiral, not a flat line ──
    // The bounce path twists — each node is offset by π/3 perpendicular.
    // This IS the helix. The twist angle = helical pitch = π.
    // Counter-twist: second set of nodes offset π in the other direction.
    var helixPitch = PI; // one full twist per transit
    var focalR = moonOrb - 8 + dampedBounce * 12;
    var focalAngle = moonAngle + dampedBounce * 0.15;
    var focalX = cx + focalR * Math.cos(focalAngle);
    var focalY = cy + focalR * Math.sin(focalAngle);
    var focalEl = document.getElementById('mg-focal-switch');
    if (focalEl) {
      focalEl.setAttribute('cx', focalX.toFixed(1));
      focalEl.setAttribute('cy', focalY.toFixed(1));
      focalEl.setAttribute('opacity', (0.06 + 0.14 * perturb).toFixed(3));
      focalEl.setAttribute('r', (2.5 - stability * 1.5).toFixed(1));
    }

    // Helix bounce line: focal → reflection, but twisted
    var piLine = document.getElementById('mg-pi-mirror-line');
    if (piLine) {
      piLine.setAttribute('x1', focalX.toFixed(1));
      piLine.setAttribute('y1', focalY.toFixed(1));
      piLine.setAttribute('x2', reflX.toFixed(1));
      piLine.setAttribute('y2', reflY.toFixed(1));
      piLine.setAttribute('stroke-opacity', (0.02 + 0.08 * perturb).toFixed(3));
    }

    // Standing wave nodes — 3 objects on the helix
    // Each node at a DIFFERENT radius (ratio π between them).
    // Node 0: near Moon orbit (outer). Node 1: at center (∅). Node 2: near Gaia (inner).
    // The perpendicular offset makes them spiral, not flat.
    // Counter-twist: each node also has a ghost at -offset (the other strand).
    var nodeRadii = [moonOrb * 0.8, 0, gaiaR * 2]; // π-ratio positions
    for (var swn = 0; swn < 3; swn++) {
      var swnEl = document.getElementById('mg-standing-node-' + swn);
      if (swnEl) {
        var nodeFrac = (swn + 1) * 0.25;
        // Helix twist: perpendicular offset = sin(nodeFrac × helixPitch + t)
        var helixTwist = Math.sin(nodeFrac * helixPitch + t * PI * 0.5);
        // Counter-twist component: cos at -helixPitch
        var counterTwist = Math.cos(nodeFrac * helixPitch - t * PI * 0.5);
        // Base position along focal→reflection line
        var baseX = focalX + (reflX - focalX) * nodeFrac;
        var baseY = focalY + (reflY - focalY) * nodeFrac;
        // Perpendicular direction to the bounce line
        var dx = reflX - focalX;
        var dy = reflY - focalY;
        var dLen = Math.sqrt(dx * dx + dy * dy) || 1;
        var perpX = -dy / dLen;
        var perpY = dx / dLen;
        // Twist amplitude — dampens with stability (helix collapses to line at null)
        var twistAmp = 8 * perturb * (1 - stability * 0.5);
        // Main helix position
        var nodeX = baseX + perpX * helixTwist * twistAmp;
        var nodeY = baseY + perpY * helixTwist * twistAmp;
        swnEl.setAttribute('cx', nodeX.toFixed(1));
        swnEl.setAttribute('cy', nodeY.toFixed(1));
        // Nodes brighten as stability increases — standing wave forming
        var nodeVis = stability * 0.15 + 0.02;
        if (swn === 1) nodeVis *= 1.5; // center node = ∅
        swnEl.setAttribute('opacity', nodeVis.toFixed(3));
        swnEl.setAttribute('r', (0.8 + stability * 1.2).toFixed(1));
        // Color shifts: outer=white, center=blue(∅), inner=green(Gaia)
        var nodeColor = swn === 0 ? '#c9d1d9' : swn === 1 ? '#58a6ff' : '#5ab87a';
        swnEl.setAttribute('fill', nodeColor);
      }
    }

    // Reflection dot at Gaia — where YOU are, reflected from outside
    var piDot = document.getElementById('mg-pi-mirror-dot');
    if (piDot) {
      piDot.setAttribute('cx', reflX.toFixed(1));
      piDot.setAttribute('cy', reflY.toFixed(1));
      piDot.setAttribute('opacity', (0.04 + 0.12 * perturb).toFixed(3));
    }

    // Null sync label — appears as stability grows (perturbation falls)
    // When the helix collapses to a line, the twist vanishes → ∅ sync
    // rotation = π / rate. At null: rate→0, rotation→∞. Released.
    var nullLbl = document.getElementById('mg-null-sync-label');
    if (nullLbl) {
      var nullNodeX = focalX + (reflX - focalX) * 0.5;
      var nullNodeY = focalY + (reflY - focalY) * 0.5;
      nullLbl.setAttribute('x', nullNodeX.toFixed(1));
      nullLbl.setAttribute('y', (nullNodeY - 6).toFixed(1));
      // Show π/ω when RPS is live, otherwise just ∅ sync
      if (liveStats.rps > 0 && stability > 0.2) {
        nullLbl.textContent = '\u2205 sync \u03c0/' + liveStats.rps.toFixed(0);
      } else if (stability > 0.3) {
        nullLbl.textContent = '\u2205 sync';
      }
      nullLbl.setAttribute('opacity', (stability > 0.3 ? (stability - 0.3) * 0.15 : 0).toFixed(3));
    }

    // π label — at the midpoint
    var piLbl = document.getElementById('mg-pi-mirror-label');
    if (piLbl) {
      var midX = (focalX + reflX) / 2;
      var midY = (focalY + reflY) / 2;
      piLbl.setAttribute('x', midX.toFixed(1));
      piLbl.setAttribute('y', (midY + 8).toFixed(1));
      piLbl.setAttribute('opacity', (0.03 + 0.06 * perturb).toFixed(3));
    }

    // ═══ NULL SPACE DATA: floating values from dashboard ═══
    // Data exists at ∅ — both observer and Gaia see it hyperlocal.
    // Values orbit the null point, reflecting to both sides.
    // When perturbation is high, data scatters (diffraction).
    // When stability grows, data condenses (focus).
    var nullDataG = document.getElementById('mg-null-data');
    if (nullDataG && prevDash) {
      // Fade in null-data layer based on data availability
      var ndOpacity = 0.05 + 0.15 * stability;
      nullDataG.setAttribute('opacity', ndOpacity.toFixed(3));

      // Extract dashboard values — lerp numeric fields between WAS and IS
      var ndIS = prevDash.null_dimension || {};
      var ndWAS = wasDash && wasDash.null_dimension ? wasDash.null_dimension : ndIS;
      // Smooth transition: use easeT (quadratic) so values settle then drift
      var smoothT = willbeT < 0.1 ? willbeT * 10 : 1; // snap in first 10%, then stable
      var nd = {};
      // Copy all non-numeric fields from IS
      for (var ndk in ndIS) { nd[ndk] = ndIS[ndk]; }
      // Lerp numeric fields from WAS→IS over first 10% of cycle (smooth arrival)
      var numericFields = ['perturbation','observer_fraction','j_error','tempo',
        'self_awareness','product','product_error','v_pi','d_pi','j_pi',
        'vdj_product','vdj_product_error'];
      for (var nfi = 0; nfi < numericFields.length; nfi++) {
        var fld = numericFields[nfi];
        nd[fld] = lerp(ndWAS[fld], ndIS[fld], smoothT);
      }
      var an = prevDash.anderson_selectivity || {};
      var bc = prevDash.bingo_cube_summary || {};
      var mg = prevDash.membrane_geometry || {};
      var td = prevDash.tense_distribution || {};

      // Values to display — each maps to a null field
      var ndVals = {
        'nd-observer':  nd.observer_fraction !== undefined ? nd.observer_fraction.toFixed(5) : '\u03c0\u22123',
        'nd-self':      nd.self_awareness !== undefined ? nd.self_awareness.toFixed(2) : '',
        'nd-vdj':       nd.vdj_map ? nd.vdj_map.join('') : '',
        'nd-perturb':   nd.perturbation !== undefined ? '\u03b4 ' + nd.perturbation.toFixed(3) : '',
        'nd-tempo':     nd.tempo !== undefined ? 't=' + nd.tempo.toFixed(2) : '',
        'nd-anderson':  an.pielou_j !== undefined ? 'J=' + an.pielou_j.toFixed(2) : '',
        'nd-bingo':     bc.generation !== undefined ? 'g' + bc.generation : '',
        'nd-membrane':  mg.dimension !== undefined ? mg.dimension + 'D' : '',
        'nd-rps':       liveStats.rps > 0 ? '\u03c9=' + liveStats.rps.toFixed(0) : '',
        'nd-willbe':    td.will_be !== undefined ? '\u2192' + td.will_be : '',
        'nd-jerror':    nd.j_error !== undefined ? 'J\u0394' + nd.j_error.toFixed(1) : ''
      };

      // ── V, D, J as π-bodies ──
      // Each role IS π. V×D×J = π³ = 31 = max particles.
      var vPi = nd.v_pi || 0;
      var dPi = nd.d_pi || 0;
      var jPi = nd.j_pi || 0;
      var vdjProd = nd.vdj_product || 0;
      var vdjErr = nd.vdj_product_error || 1;

      // V body ring — outer orbit, color of IS (orange/fire)
      var vRing = document.getElementById('mg-v-ring');
      if (vRing) {
        var vR = 8 + vPi * 3;
        vRing.setAttribute('r', vR.toFixed(1));
        vRing.setAttribute('opacity', (vPi > 0 ? 0.3 + vPi / PI * 0.4 : 0.05).toFixed(2));
        vRing.setAttribute('stroke-dashoffset', (t * 40).toFixed(1));
      }
      // V body label
      var vLabel = document.getElementById('mg-v-label');
      if (vLabel) {
        vLabel.textContent = 'V=' + vPi.toFixed(2);
        vLabel.setAttribute('opacity', (vPi > 0 ? 0.6 : 0.15).toFixed(2));
      }

      // D body ring — at null center, color of WILLBE (blue)
      var dRing = document.getElementById('mg-d-ring');
      if (dRing) {
        var dR = 4 + dPi * 2;
        dRing.setAttribute('r', dR.toFixed(1));
        dRing.setAttribute('opacity', (dPi > 0 ? 0.3 + dPi / PI * 0.4 : 0.05).toFixed(2));
        dRing.setAttribute('stroke-dashoffset', (t * -25).toFixed(1));
      }
      var dLabel = document.getElementById('mg-d-label');
      if (dLabel) {
        dLabel.textContent = 'D=' + dPi.toFixed(2);
        dLabel.setAttribute('opacity', (dPi > 0 ? 0.6 : 0.15).toFixed(2));
      }

      // J body ring — inner core, color of WAS (green)
      var jRing = document.getElementById('mg-j-ring');
      if (jRing) {
        var jR = 6 + jPi * 2;
        jRing.setAttribute('r', jR.toFixed(1));
        jRing.setAttribute('opacity', (jPi > 0 ? 0.3 + jPi / PI * 0.4 : 0.05).toFixed(2));
        jRing.setAttribute('stroke-dashoffset', (t * 15).toFixed(1));
      }
      var jLabel = document.getElementById('mg-j-label');
      if (jLabel) {
        jLabel.textContent = 'J=' + jPi.toFixed(2);
        jLabel.setAttribute('opacity', (jPi > 0 ? 0.6 : 0.15).toFixed(2));
      }

      // VDJ product label — V×D×J → π³
      var vdjLabel = document.getElementById('mg-vdj-product');
      if (vdjLabel) {
        var budgetStr = 'V\u00d7D\u00d7J=' + vdjProd.toFixed(1);
        if (vdjProd > 0) {
          budgetStr += ' (\u03c0\u00b3\u00b1' + (vdjErr * 100).toFixed(0) + '%)';
        } else {
          budgetStr += ' [collapsed]';
        }
        vdjLabel.textContent = budgetStr;
        vdjLabel.setAttribute('opacity', (0.3 + (1 - vdjErr) * 0.5).toFixed(2));
      }

      // Null point: midpoint of focal-to-reflection bounce
      var nullCX = (focalX + reflX) / 2;
      var nullCY = (focalY + reflY) / 2;

      // Each field orbits the null point — rotation rate depends on perturbation
      // High perturbation = fast scatter (can't focus). Low = slow orbit (hyperlocal).
      var nullOrbitRate = 0.03 + 0.15 * perturb;
      var nullFields = mc.nullFields || [];
      for (var nfi = 0; nfi < nullFields.length; nfi++) {
        var nf = nullFields[nfi];
        var nfEl = document.getElementById('mg-' + nf.id);
        if (!nfEl) continue;

        // Orbit: field's base angle rotates around ∅
        var nfAngle = nf.angle + t * nullOrbitRate * (nfi % 2 === 0 ? 1 : -1);
        // Radius breathes with perturbation — scatter outward when perturbed
        var nfR = nf.r * (1 + 0.3 * perturb * Math.sin(t * PI * 0.7 + nfi));
        // Position relative to the moving null point
        var nfX = nullCX + nfR * Math.cos(nfAngle);
        var nfY = nullCY + nfR * Math.sin(nfAngle);

        nfEl.setAttribute('x', nfX.toFixed(1));
        nfEl.setAttribute('y', nfY.toFixed(1));
        // Update text content with live data
        if (ndVals[nf.id]) {
          nfEl.textContent = ndVals[nf.id];
        }
        // Opacity: center fields brighter, outer dimmer, all pulse with stability
        var nfBase = nf.r < 5 ? 0.6 : nf.r < 15 ? 0.35 : 0.2;
        var nfPulse = 0.1 * Math.sin(t * PI * 1.3 + nfi * 0.7);
        nfEl.setAttribute('opacity', Math.max(0, nfBase * stability + nfPulse).toFixed(3));

        // Ghost reflection — mirrored at π across ∅
        var ghostEl = document.getElementById('mg-' + nf.id + '-ghost');
        if (ghostEl && nf.r > 0) {
          var ghostAngle = nfAngle + PI;
          var ghostX = nullCX + nfR * Math.cos(ghostAngle);
          var ghostY = nullCY + nfR * Math.sin(ghostAngle);
          ghostEl.setAttribute('x', ghostX.toFixed(1));
          ghostEl.setAttribute('y', ghostY.toFixed(1));
          ghostEl.textContent = ndVals[nf.id] || nf.label;
          // Ghosts are dimmer — the other side's view through the membrane
          ghostEl.setAttribute('opacity', Math.max(0, nfBase * 0.3 * stability + nfPulse * 0.5).toFixed(3));
          // Remove the scale transform — just position
          ghostEl.removeAttribute('transform');
        }
      }
    } else if (nullDataG) {
      nullDataG.setAttribute('opacity', '0');
    }

    // ── chipMonk inner null space: the seed waking from ∅→0 ──
    var chipG = document.getElementById('mg-chipmunk');
    var chipData = mc.chipmunkData ? mc.chipmunkData() : null;
    if (chipG && chipData) {
      var wake = chipData.wake_level || 0;
      var chipUp = chipData.uptime_secs || 0;

      // Fade in based on wake level — cacophony at low, clarity at high
      var chipAlpha = Math.min(0.8, 0.1 + wake * 0.7);
      chipG.setAttribute('opacity', chipAlpha.toFixed(3));

      // Inner eye pulses with observation rate
      var chipEye = document.getElementById('mg-chip-eye');
      if (chipEye) {
        var eyeR = 2 + wake * 4 + Math.sin(t * PI * (0.5 + wake)) * (1 - wake * 0.7);
        chipEye.setAttribute('r', eyeR.toFixed(1));
        chipEye.setAttribute('opacity', (0.2 + wake * 0.6).toFixed(2));
      }

      // Wake ring grows with wake_level
      var wakeRing = document.getElementById('mg-chip-wake-ring');
      if (wakeRing) {
        var wakeR = 4 + wake * 20;
        wakeRing.setAttribute('r', wakeR.toFixed(1));
        wakeRing.setAttribute('opacity', (wake * 0.5).toFixed(2));
        var dashLen = 2 + wake * 6;
        var dashGap = Math.max(1, 8 - wake * 6);
        wakeRing.setAttribute('stroke-dasharray', dashLen.toFixed(1) + ' ' + dashGap.toFixed(1));
        wakeRing.setAttribute('stroke-dashoffset', (t * 20 * (0.5 + wake)).toFixed(1));
      }

      // Status text — shows primal name + status
      var chipStatus = document.getElementById('mg-chip-status');
      if (chipStatus) {
        var statusStr = wake < 0.1 ? '\u2205' : // ∅ when nearly null
          (wake < 0.5 ? 'chipMonk...' : 'chipMonk');
        chipStatus.textContent = statusStr;
        chipStatus.setAttribute('opacity', (0.3 + wake * 0.5).toFixed(2));
      }

      // Wake level readout
      var chipWake = document.getElementById('mg-chip-wake');
      if (chipWake) {
        chipWake.textContent = 'wake: ' + wake.toFixed(4);
        chipWake.setAttribute('opacity', (wake * 0.6).toFixed(2));
      }

      // Capability scatter — at low wake: random jitter (cacophony)
      // At high wake: organized ring (sorted, clear)
      var capsG = document.getElementById('mg-chip-caps');
      if (capsG) {
        capsG.setAttribute('opacity', (0.1 + wake * 0.5).toFixed(2));
        var capCount = mc.chipCapCount || 40;
        for (var cci = 0; cci < capCount; cci++) {
          var capEl = document.getElementById('mg-chip-cap-' + cci);
          if (!capEl) continue;
          var baseAngle = (cci / capCount) * 2 * PI;
          var sortedR = 10 + (cci % 3) * 3;
          // Cacophony: random offsets that decrease with wake
          var chaos = (1 - wake);
          var chaosAngle = baseAngle + chaos * Math.sin(t * 3 + cci * 7.3) * PI * 0.5;
          var chaosR = sortedR + chaos * Math.sin(t * 2.1 + cci * 3.7) * 8;
          // Blend: chaos → sorted as wake increases
          var capAngle = chaosAngle * (1 - wake) + (baseAngle + t * 0.05) * wake;
          var capR = chaosR * (1 - wake) + sortedR * wake;
          capEl.setAttribute('cx', (cx + capR * Math.cos(capAngle)).toFixed(1));
          capEl.setAttribute('cy', (cy + capR * Math.sin(capAngle)).toFixed(1));
          capEl.setAttribute('opacity', (0.15 + wake * 0.45).toFixed(2));
        }
      }

      // Observation count
      var chipObs = document.getElementById('mg-chip-obs');
      if (chipObs) {
        var obs = chipData.membrane || [];
        var obsCount = 0;
        for (var oi = 0; oi < obs.length; oi++) { obsCount += (obs[oi].count || 0); }
        chipObs.textContent = obsCount > 0 ? obsCount + ' obs' : '';
        chipObs.setAttribute('opacity', obsCount > 0 ? '0.4' : '0');
      }
    } else if (chipG) {
      chipG.setAttribute('opacity', '0');
    }

    // ── Epitope orbit ring twist: dashes rotate, rings come alive ──
    // The 3 orbit rings now twist visually — their dash patterns rotate.
    // Ring 1: forward at ω_is. Ring 2: REVERSE at ω_was. Ring 3: forward at ω_willbe.
    var orbitTwist = [
      {rate: omega_is,     torsion: 1},   // ring 1: forward
      {rate: omega_was,    torsion: -1},   // ring 2: reverse — the eating
      {rate: omega_willbe, torsion: 1}    // ring 3: forward
    ];
    for (var otri = 0; otri < 3; otri++) {
      var otrEl = document.getElementById('mg-orbit-ring-' + (otri + 1));
      if (otrEl) {
        var otrDeg = (t * orbitTwist[otri].rate * orbitTwist[otri].torsion * 180 / PI) % 360;
        otrEl.setAttribute('transform',
          'rotate(' + otrDeg.toFixed(1) + ' ' + cx + ' ' + cy + ')');
      }
    }

    // ── Complexity spine: jelly strands evolving through all tiers ──
    // The spine angle rotates slowly — the chain itself orbits.
    // At each tier, the strand crosses (self meets non-self = abstraction).
    // Complexity increases outward: more crossings, more structure.
    var spineAngle = t * PI / 37; // slow drift — 37 is prime
    var oortR = Math.min(R * 1.55, 230);
    var TIER_FRACS = [0, 0.05, 0.18, 0.25, 0.35, 0.52, 0.68, 0.82, 1.0, 1.32, 1.55];
    var TIER_COLORS = ['#ffffff','#d2a8ff','#c9d1d9','#f0e68c','#58a6ff',
                       '#6e7681','#d2a8ff','#5ab87a','#c9d1d9','#f0e68c','#484f58'];

    // Position tier nodes radially along the spine angle
    for (var stai = 0; stai < 11; stai++) {
      var stR = TIER_FRACS[stai] * R;
      var stNodeAngle = spineAngle + stai * PI / 5.5; // π/5.5 radians between tiers
      var stx = cx + stR * Math.cos(stNodeAngle);
      var sty = cy + stR * Math.sin(stNodeAngle);
      var stNode = document.getElementById('mg-tier-' + stai);
      var tierAlive = TIERS[stai].alive;
      if (stNode) {
        stNode.setAttribute('cx', stx.toFixed(1));
        stNode.setAttribute('cy', sty.toFixed(1));
        var stPulse = 0.08 + 0.06 * Math.sin(t * PI / (stai + 2));
        if (tierAlive) {
          // Alive tier: normal pulse, color stays
          stNode.setAttribute('opacity', (stPulse * (0.3 + 0.7 * perturb)).toFixed(3));
          stNode.setAttribute('r', '1.2');
        } else {
          // Dead zone: flash red, larger radius — the gap is visible
          // The dead zone IS the missing bridge: lattice→helix→cell
          var deadFlash = 0.04 + 0.03 * Math.sin(t * PI * 2.3 + stai);
          stNode.setAttribute('opacity', deadFlash.toFixed(3));
          stNode.setAttribute('fill', '#e85d3a');
          stNode.setAttribute('r', (1.8 + 0.5 * Math.sin(t * PI * 0.7)).toFixed(1));
        }
      }
      var stLabel = document.getElementById('mg-tier-label-' + stai);
      if (stLabel) {
        stLabel.setAttribute('x', (stx + 5).toFixed(1));
        stLabel.setAttribute('y', (sty - 3).toFixed(1));
        // Dead tiers show their system name on hover-equivalent: brighter label
        var lblOp = tierAlive ? (0.04 + 0.08 * perturb) : (0.06 + 0.04 * Math.sin(t * PI));
        stLabel.setAttribute('opacity', lblOp.toFixed(3));
      }
    }

    // Tier connection links — arc between consecutive tiers
    for (var stli = 0; stli < 10; stli++) {
      var stlR1 = TIER_FRACS[stli] * R;
      var stlR2 = TIER_FRACS[stli + 1] * R;
      var stlA1 = spineAngle + stli * PI / 5.5;
      var stlA2 = spineAngle + (stli + 1) * PI / 5.5;
      var stlLink = document.getElementById('mg-tier-link-' + stli);
      if (stlLink) {
        stlLink.setAttribute('x1', (cx + stlR1 * Math.cos(stlA1)).toFixed(1));
        stlLink.setAttribute('y1', (cy + stlR1 * Math.sin(stlA1)).toFixed(1));
        stlLink.setAttribute('x2', (cx + stlR2 * Math.cos(stlA2)).toFixed(1));
        stlLink.setAttribute('y2', (cy + stlR2 * Math.sin(stlA2)).toFixed(1));
        // Links spanning dead tiers flash — the bridge is broken here
        var linkAlive = TIERS[stli].alive && TIERS[stli + 1].alive;
        if (linkAlive) {
          stlLink.setAttribute('stroke-opacity', (0.03 + 0.04 * perturb).toFixed(3));
        } else {
          // Broken link: red, flickering — the gap in the complexity chain
          stlLink.setAttribute('stroke', '#e85d3a');
          stlLink.setAttribute('stroke-opacity', (0.02 + 0.03 * Math.sin(t * PI * 1.7 + stli)).toFixed(3));
          stlLink.setAttribute('stroke-dasharray', '1,3');
        }
      }
    }

    // Self spine strand: clockwise jelly spiral from [∅]D through all tiers to Oort
    var SSTEPS = 64;
    var spSelfPts = [];
    for (var ssi = 0; ssi <= SSTEPS; ssi++) {
      var ssF = ssi / SSTEPS;
      var ssR = ssF * oortR;
      // π turns per full extent — the twist IS abstraction
      var ssA = spineAngle + ssF * PI * TAU;
      spSelfPts.push((cx + ssR * Math.cos(ssA)).toFixed(1) + ' ' +
                     (cy + ssR * Math.sin(ssA)).toFixed(1));
    }
    var spSelfEl = document.getElementById('mg-spine-self');
    if (spSelfEl) {
      spSelfEl.setAttribute('d', 'M ' + spSelfPts.join(' L '));
      spSelfEl.setAttribute('stroke-opacity', (0.04 + 0.04 * perturb).toFixed(3));
    }

    // Non-self spine strand: counter-clockwise, π offset
    var spNonPts = [];
    for (var sni = 0; sni <= SSTEPS; sni++) {
      var snF = sni / SSTEPS;
      var snR = snF * oortR;
      var snA = spineAngle + PI + snF * PI * TAU * -1;
      spNonPts.push((cx + snR * Math.cos(snA)).toFixed(1) + ' ' +
                    (cy + snR * Math.sin(snA)).toFixed(1));
    }
    var spNonEl = document.getElementById('mg-spine-nonself');
    if (spNonEl) {
      spNonEl.setAttribute('d', 'M ' + spNonPts.join(' L '));
      spNonEl.setAttribute('stroke-opacity', (0.04 + 0.04 * perturb).toFixed(3));
    }

    // ── Evolution wave: scan → sweep → sort → fossilize → evolve ──
    // One particle climbs from [∅]D to Oort, cycling every ~73 seconds.
    // As it passes each process zone, that verb activates (brightens).
    // The wave IS the observation moving through complexity.
    var evoRate = 0.15; // climb speed — one tier per ~6.7s
    var evoF = (t * evoRate) % 11; // fractional tier position [0..11)
    var evoTierA = Math.floor(evoF);
    var evoTierB = Math.min(evoTierA + 1, 10);
    var evoLerp = evoF - evoTierA;

    // Interpolate wave position between consecutive tier nodes
    var evoR1 = TIER_FRACS[evoTierA] * R;
    var evoR2 = TIER_FRACS[evoTierB] * R;
    var evoA1 = spineAngle + evoTierA * PI / 5.5;
    var evoA2 = spineAngle + evoTierB * PI / 5.5;
    var evoR = evoR1 + (evoR2 - evoR1) * evoLerp;
    var evoA = evoA1 + (evoA2 - evoA1) * evoLerp;
    var evoX = cx + evoR * Math.cos(evoA);
    var evoY = cy + evoR * Math.sin(evoA);

    var evoWave = document.getElementById('mg-evo-wave');
    if (evoWave) {
      evoWave.setAttribute('cx', evoX.toFixed(1));
      evoWave.setAttribute('cy', evoY.toFixed(1));
      // Pulse brighter at tier crossings (when evoLerp near 0 or 1)
      var evoPulse = 1 - Math.abs(evoLerp - 0.5) * 2; // 0 at edges, 1 at center
      evoWave.setAttribute('opacity', (0.06 + 0.12 * perturb + 0.06 * evoPulse).toFixed(3));
      evoWave.setAttribute('r', (2 + evoPulse * 1.5).toFixed(1));
    }

    // Wave trail — 3 fading dots trailing behind the wave
    for (var ewti = 0; ewti < 3; ewti++) {
      var ewtF = ((t * evoRate) - (ewti + 1) * 0.3 + 110) % 11;
      var ewtTierA = Math.floor(ewtF);
      var ewtTierB = Math.min(ewtTierA + 1, 10);
      var ewtLerp = ewtF - ewtTierA;
      var ewtR1 = TIER_FRACS[ewtTierA] * R;
      var ewtR2 = TIER_FRACS[ewtTierB] * R;
      var ewtA1 = spineAngle + ewtTierA * PI / 5.5;
      var ewtA2 = spineAngle + ewtTierB * PI / 5.5;
      var ewtR = ewtR1 + (ewtR2 - ewtR1) * ewtLerp;
      var ewtA = ewtA1 + (ewtA2 - ewtA1) * ewtLerp;
      var ewtEl = document.getElementById('mg-evo-trail-' + ewti);
      if (ewtEl) {
        ewtEl.setAttribute('cx', (cx + ewtR * Math.cos(ewtA)).toFixed(1));
        ewtEl.setAttribute('cy', (cy + ewtR * Math.sin(ewtA)).toFixed(1));
        ewtEl.setAttribute('opacity', (0.03 * (3 - ewti) / 3 * perturb).toFixed(3));
      }
    }

    // Process verb labels — positioned at their zone midpoints
    // scan: tiers 0-1 (quark scale). sweep: tiers 2-3 (fusion).
    // sort: tiers 4-5 (molecular). fossilize: tiers 6-7 (cellular).
    // evolve: tiers 8-9 (planetary). Tier 10 = Oort = boundary/wrap.
    var PROC_COLS = ['#ffffff','#4a8fb8','#5ab87a','#f0e68c','#d2a8ff'];
    for (var pvi = 0; pvi < 5; pvi++) {
      var pvMidTier = pvi * 2 + 1; // midpoint tier for this process
      var pvR = TIER_FRACS[pvMidTier] * R;
      var pvA = spineAngle + pvMidTier * PI / 5.5 + PI / 11;
      var pvX = cx + pvR * Math.cos(pvA);
      var pvY = cy + pvR * Math.sin(pvA);
      var pvEl = document.getElementById('mg-proc-' + pvi);
      if (pvEl) {
        pvEl.setAttribute('x', pvX.toFixed(1));
        pvEl.setAttribute('y', pvY.toFixed(1));
        // Brighten when evolution wave is in this process's zone
        var pvActive = (evoF >= pvi * 2 && evoF < (pvi + 1) * 2) ? 1 : 0;
        var pvOp = 0.03 + 0.15 * pvActive * perturb + 0.03 * perturb;
        pvEl.setAttribute('opacity', pvOp.toFixed(3));
        pvEl.setAttribute('fill', pvActive ? '#ffffff' : PROC_COLS[pvi]);
      }
    }
};
