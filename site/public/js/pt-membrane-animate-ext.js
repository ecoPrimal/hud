// pt-membrane-animate-ext.js — extracted animation sections.
// Chemistry, Solar, Focal/Helix, Null Data, chipMonk, Spine, Evolution.
// Sweep: 740→740 lines, 1 monolith → 8 named helpers + dispatcher.

'use strict';

// ── Chemistry: H + H → He, H + H + O → H₂O ──
function _animChemistry(cx, cy, R, t, PI, TAU, perturb, bodyPositions) {
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
    var chPertX = 0, chPertY = 0;
    for (var chbi = 0; chbi < bodyPositions.length; chbi++) {
      chPertX += (bodyPositions[chbi].x - cx) * 0.05;
      chPertY += (bodyPositions[chbi].y - cy) * 0.05;
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

  // Proximity bonds
  var dHH = Math.sqrt(Math.pow(chemPos[0].x - chemPos[1].x, 2) + Math.pow(chemPos[0].y - chemPos[1].y, 2));
  var dH1O = Math.sqrt(Math.pow(chemPos[0].x - chemPos[2].x, 2) + Math.pow(chemPos[0].y - chemPos[2].y, 2));
  var dH2O = Math.sqrt(Math.pow(chemPos[1].x - chemPos[2].x, 2) + Math.pow(chemPos[1].y - chemPos[2].y, 2));

  var fusionProx = Math.max(0, 1 - dHH / 45);
  var hhBond = document.getElementById('mg-bond-HH');
  if (hhBond) {
    hhBond.setAttribute('x1', chemPos[0].x.toFixed(1)); hhBond.setAttribute('y1', chemPos[0].y.toFixed(1));
    hhBond.setAttribute('x2', chemPos[1].x.toFixed(1)); hhBond.setAttribute('y2', chemPos[1].y.toFixed(1));
    hhBond.setAttribute('stroke-opacity', (fusionProx * 0.35).toFixed(3));
  }

  // He fusion glow
  var heMx = (chemPos[0].x + chemPos[1].x) / 2;
  var heMy = (chemPos[0].y + chemPos[1].y) / 2;
  var heEl = document.getElementById('mg-chem-He');
  if (heEl) {
    heEl.setAttribute('cx', heMx.toFixed(1)); heEl.setAttribute('cy', heMy.toFixed(1));
    heEl.setAttribute('opacity', (fusionProx * fusionProx * 0.6).toFixed(3));
    heEl.setAttribute('r', (4 + fusionProx * 5).toFixed(1));
  }
  var heLbl = document.getElementById('mg-chem-label-He');
  if (heLbl) {
    heLbl.setAttribute('x', heMx.toFixed(1));
    heLbl.setAttribute('y', (heMy - 10).toFixed(1));
    heLbl.setAttribute('opacity', (fusionProx * fusionProx * 0.35).toFixed(3));
  }

  // H₂O bond formation
  var waterProx = Math.min(Math.max(0, 1 - dH1O / 55), Math.max(0, 1 - dH2O / 55));
  var bond1 = document.getElementById('mg-bond-HO1');
  var bond2 = document.getElementById('mg-bond-HO2');
  if (bond1) {
    bond1.setAttribute('x1', chemPos[0].x.toFixed(1)); bond1.setAttribute('y1', chemPos[0].y.toFixed(1));
    bond1.setAttribute('x2', chemPos[2].x.toFixed(1)); bond1.setAttribute('y2', chemPos[2].y.toFixed(1));
    bond1.setAttribute('stroke-opacity', (waterProx * 0.45).toFixed(3));
  }
  if (bond2) {
    bond2.setAttribute('x1', chemPos[1].x.toFixed(1)); bond2.setAttribute('y1', chemPos[1].y.toFixed(1));
    bond2.setAttribute('x2', chemPos[2].x.toFixed(1)); bond2.setAttribute('y2', chemPos[2].y.toFixed(1));
    bond2.setAttribute('stroke-opacity', (waterProx * 0.45).toFixed(3));
  }

  var h2oLbl = document.getElementById('mg-chem-label-H2O');
  if (h2oLbl) {
    h2oLbl.setAttribute('x', chemPos[2].x.toFixed(1));
    h2oLbl.setAttribute('y', (chemPos[2].y + 12).toFixed(1));
    h2oLbl.setAttribute('opacity', (waterProx * waterProx * 0.3).toFixed(3));
  }

  // Bond angle arc
  if (waterProx > 0.1) {
    var aH1 = Math.atan2(chemPos[0].y - chemPos[2].y, chemPos[0].x - chemPos[2].x);
    var aH2 = Math.atan2(chemPos[1].y - chemPos[2].y, chemPos[1].x - chemPos[2].x);
    var bondAngleDeg = Math.abs(aH1 - aH2) * 180 / PI;
    if (bondAngleDeg > 180) bondAngleDeg = 360 - bondAngleDeg;
    var arcR = 8;
    var arcPath = 'M ' + (chemPos[2].x + arcR * Math.cos(aH1)).toFixed(1) + ' ' +
      (chemPos[2].y + arcR * Math.sin(aH1)).toFixed(1) +
      ' A ' + arcR + ' ' + arcR + ' 0 0 ' + (aH2 > aH1 ? '1' : '0') + ' ' +
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
}

// ── Solar system: planets orbit outside the ring ──
function _animSolar(cx, cy, R, t, PI) {
  var solarRates = [
    {id:'moon',    orb:R+12,    rate:PI*1.5,  phase:0},
    {id:'mars',    orb:R*1.15,  rate:PI/3.7,  phase:PI/3},
    {id:'jupiter', orb:R*1.32,  rate:PI/7.9,  phase:PI},
    {id:'saturn',  orb:R*1.44,  rate:PI/13.3, phase:PI*1.7}
  ];
  var positions = {};
  for (var spi = 0; spi < solarRates.length; spi++) {
    var sp = solarRates[spi];
    var spAngle = sp.phase + t * sp.rate;
    var spx = cx + sp.orb * Math.cos(spAngle);
    var spy = cy + sp.orb * Math.sin(spAngle);
    positions[sp.id] = {x:spx, y:spy, angle:spAngle, orb:sp.orb};
    var spDot = document.getElementById('mg-solar-' + sp.id);
    if (spDot) { spDot.setAttribute('cx', spx.toFixed(1)); spDot.setAttribute('cy', spy.toFixed(1)); }
    var spLbl = document.getElementById('mg-solar-label-' + sp.id);
    if (spLbl) {
      spLbl.setAttribute('x', spx.toFixed(1));
      spLbl.setAttribute('y', (spy - [2, 2.5, 4, 3.5][spi] - 3).toFixed(1));
    }
  }
  return positions;
}

// ── Focal Switch + Helix Bounce ──
function _animFocalHelix(cx, cy, R, t, PI, TAU, perturb, liveStats, solarPos) {
  var moonAngle = solarPos.moon.angle;
  var moonOrb = solarPos.moon.orb;
  var gaiaR = 6;
  var reflAngle = moonAngle + PI;
  var reflX = cx + gaiaR * Math.cos(reflAngle);
  var reflY = cy + gaiaR * Math.sin(reflAngle);

  var rpsOmega = liveStats.rps > 0 ? TAU * liveStats.rps : TAU;
  var bouncePhase = 0.5 + 0.5 * Math.sin(t * rpsOmega * 0.01);
  var stability = Math.max(0, 1 - perturb);
  var dampedBounce = bouncePhase * (1 - stability * 0.7);

  var focalR = moonOrb - 8 + dampedBounce * 12;
  var focalAngle = moonAngle + dampedBounce * 0.15;
  var focalX = cx + focalR * Math.cos(focalAngle);
  var focalY = cy + focalR * Math.sin(focalAngle);
  var focalEl = document.getElementById('mg-focal-switch');
  if (focalEl) {
    focalEl.setAttribute('cx', focalX.toFixed(1)); focalEl.setAttribute('cy', focalY.toFixed(1));
    focalEl.setAttribute('opacity', (0.06 + 0.14 * perturb).toFixed(3));
    focalEl.setAttribute('r', (2.5 - stability * 1.5).toFixed(1));
  }

  var piLine = document.getElementById('mg-pi-mirror-line');
  if (piLine) {
    piLine.setAttribute('x1', focalX.toFixed(1)); piLine.setAttribute('y1', focalY.toFixed(1));
    piLine.setAttribute('x2', reflX.toFixed(1)); piLine.setAttribute('y2', reflY.toFixed(1));
    piLine.setAttribute('stroke-opacity', (0.02 + 0.08 * perturb).toFixed(3));
  }

  // Standing wave nodes — 3 objects on the helix
  var helixPitch = PI;
  var nodeRadii = [moonOrb * 0.8, 0, gaiaR * 2];
  for (var swn = 0; swn < 3; swn++) {
    var swnEl = document.getElementById('mg-standing-node-' + swn);
    if (!swnEl) continue;
    var nodeFrac = (swn + 1) * 0.25;
    var helixTwist = Math.sin(nodeFrac * helixPitch + t * PI * 0.5);
    var baseX = focalX + (reflX - focalX) * nodeFrac;
    var baseY = focalY + (reflY - focalY) * nodeFrac;
    var dx = reflX - focalX, dy = reflY - focalY;
    var dLen = Math.sqrt(dx * dx + dy * dy) || 1;
    var perpX = -dy / dLen, perpY = dx / dLen;
    var twistAmp = 8 * perturb * (1 - stability * 0.5);
    var nodeX = baseX + perpX * helixTwist * twistAmp;
    var nodeY = baseY + perpY * helixTwist * twistAmp;
    swnEl.setAttribute('cx', nodeX.toFixed(1)); swnEl.setAttribute('cy', nodeY.toFixed(1));
    var nodeVis = stability * 0.15 + 0.02;
    if (swn === 1) nodeVis *= 1.5;
    swnEl.setAttribute('opacity', nodeVis.toFixed(3));
    swnEl.setAttribute('r', (0.8 + stability * 1.2).toFixed(1));
    swnEl.setAttribute('fill', ['#c9d1d9', '#58a6ff', '#5ab87a'][swn]);
  }

  var piDot = document.getElementById('mg-pi-mirror-dot');
  if (piDot) {
    piDot.setAttribute('cx', reflX.toFixed(1)); piDot.setAttribute('cy', reflY.toFixed(1));
    piDot.setAttribute('opacity', (0.04 + 0.12 * perturb).toFixed(3));
  }

  var nullLbl = document.getElementById('mg-null-sync-label');
  if (nullLbl) {
    var nullNodeX = (focalX + reflX) / 2, nullNodeY = (focalY + reflY) / 2;
    nullLbl.setAttribute('x', nullNodeX.toFixed(1)); nullLbl.setAttribute('y', (nullNodeY - 6).toFixed(1));
    if (liveStats.rps > 0 && stability > 0.2) nullLbl.textContent = '\u2205 sync \u03c0/' + liveStats.rps.toFixed(0);
    else if (stability > 0.3) nullLbl.textContent = '\u2205 sync';
    nullLbl.setAttribute('opacity', (stability > 0.3 ? (stability - 0.3) * 0.15 : 0).toFixed(3));
  }

  var piLbl = document.getElementById('mg-pi-mirror-label');
  if (piLbl) {
    piLbl.setAttribute('x', ((focalX + reflX) / 2).toFixed(1));
    piLbl.setAttribute('y', ((focalY + reflY) / 2 + 8).toFixed(1));
    piLbl.setAttribute('opacity', (0.03 + 0.06 * perturb).toFixed(3));
  }

  return {focalX:focalX, focalY:focalY, reflX:reflX, reflY:reflY, stability:stability};
}

// ── Null Space Data ──
function _animNullData(mc, cx, cy, t, PI, perturb, focal, prevDash, wasDash, liveStats, lerp, willbeT) {
  var nullDataG = document.getElementById('mg-null-data');
  if (!nullDataG || !prevDash) { if (nullDataG) nullDataG.setAttribute('opacity', '0'); return; }

  var stability = focal.stability;
  nullDataG.setAttribute('opacity', (0.05 + 0.15 * stability).toFixed(3));

  var ndIS = prevDash.null_dimension || {};
  var ndWAS = wasDash && wasDash.null_dimension ? wasDash.null_dimension : ndIS;
  var smoothT = willbeT < 0.1 ? willbeT * 10 : 1;
  var nd = {};
  for (var ndk in ndIS) nd[ndk] = ndIS[ndk];
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

  // V, D, J π-body rings
  _animVDJRings(nd, t, PI);

  // VDJ product label
  var vdjLabel = document.getElementById('mg-vdj-product');
  if (vdjLabel) {
    var vdjProd = nd.vdj_product || 0;
    var vdjErr = nd.vdj_product_error || 1;
    var budgetStr = 'V\u00d7D\u00d7J=' + vdjProd.toFixed(1);
    budgetStr += vdjProd > 0 ? ' (\u03c0\u00b3\u00b1' + (vdjErr * 100).toFixed(0) + '%)' : ' [collapsed]';
    vdjLabel.textContent = budgetStr;
    vdjLabel.setAttribute('opacity', (0.3 + (1 - vdjErr) * 0.5).toFixed(2));
  }

  // Null field orbits
  var nullCX = (focal.focalX + focal.reflX) / 2;
  var nullCY = (focal.focalY + focal.reflY) / 2;
  var nullOrbitRate = 0.03 + 0.15 * perturb;
  var nullFields = mc.nullFields || [];
  for (var nfi2 = 0; nfi2 < nullFields.length; nfi2++) {
    var nf = nullFields[nfi2];
    var nfEl = document.getElementById('mg-' + nf.id);
    if (!nfEl) continue;
    var nfAngle = nf.angle + t * nullOrbitRate * (nfi2 % 2 === 0 ? 1 : -1);
    var nfR = nf.r * (1 + 0.3 * perturb * Math.sin(t * PI * 0.7 + nfi2));
    var nfX = nullCX + nfR * Math.cos(nfAngle);
    var nfY = nullCY + nfR * Math.sin(nfAngle);
    nfEl.setAttribute('x', nfX.toFixed(1)); nfEl.setAttribute('y', nfY.toFixed(1));
    if (ndVals[nf.id]) nfEl.textContent = ndVals[nf.id];
    var nfBase = nf.r < 5 ? 0.6 : nf.r < 15 ? 0.35 : 0.2;
    var nfPulse = 0.1 * Math.sin(t * PI * 1.3 + nfi2 * 0.7);
    nfEl.setAttribute('opacity', Math.max(0, nfBase * stability + nfPulse).toFixed(3));

    // Ghost reflection
    var ghostEl = document.getElementById('mg-' + nf.id + '-ghost');
    if (ghostEl && nf.r > 0) {
      var ghostAngle = nfAngle + PI;
      ghostEl.setAttribute('x', (nullCX + nfR * Math.cos(ghostAngle)).toFixed(1));
      ghostEl.setAttribute('y', (nullCY + nfR * Math.sin(ghostAngle)).toFixed(1));
      ghostEl.textContent = ndVals[nf.id] || nf.label;
      ghostEl.setAttribute('opacity', Math.max(0, nfBase * 0.3 * stability + nfPulse * 0.5).toFixed(3));
      ghostEl.removeAttribute('transform');
    }
  }
}

// ── V, D, J π-body rings (sub-helper) ──
function _animVDJRings(nd, t, PI) {
  var bodies = [
    {id:'v', val:nd.v_pi||0, baseR:8, mult:3, rate:40},
    {id:'d', val:nd.d_pi||0, baseR:4, mult:2, rate:-25},
    {id:'j', val:nd.j_pi||0, baseR:6, mult:2, rate:15}
  ];
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    var ring = document.getElementById('mg-' + b.id + '-ring');
    if (ring) {
      ring.setAttribute('r', (b.baseR + b.val * b.mult).toFixed(1));
      ring.setAttribute('opacity', (b.val > 0 ? 0.3 + b.val / PI * 0.4 : 0.05).toFixed(2));
      ring.setAttribute('stroke-dashoffset', (t * b.rate).toFixed(1));
    }
    var label = document.getElementById('mg-' + b.id + '-label');
    if (label) {
      label.textContent = b.id.toUpperCase() + '=' + b.val.toFixed(2);
      label.setAttribute('opacity', (b.val > 0 ? 0.6 : 0.15).toFixed(2));
    }
  }
}

// ── chipMonk inner null space ──
function _animChipMonk(mc, cx, cy, t, PI, perturb) {
  var chipG = document.getElementById('mg-chipmunk');
  var chipData = mc.chipmunkData ? mc.chipmunkData() : null;
  if (!chipG || !chipData) { if (chipG) chipG.setAttribute('opacity', '0'); return; }

  var wake = chipData.wake_level || 0;
  chipG.setAttribute('opacity', Math.min(0.8, 0.1 + wake * 0.7).toFixed(3));

  var chipEye = document.getElementById('mg-chip-eye');
  if (chipEye) {
    var eyeR = 2 + wake * 4 + Math.sin(t * PI * (0.5 + wake)) * (1 - wake * 0.7);
    chipEye.setAttribute('r', eyeR.toFixed(1));
    chipEye.setAttribute('opacity', (0.2 + wake * 0.6).toFixed(2));
  }

  var wakeRing = document.getElementById('mg-chip-wake-ring');
  if (wakeRing) {
    var wakeR = 4 + wake * 20;
    wakeRing.setAttribute('r', wakeR.toFixed(1));
    wakeRing.setAttribute('opacity', (wake * 0.5).toFixed(2));
    var dashLen = 2 + wake * 6, dashGap = Math.max(1, 8 - wake * 6);
    wakeRing.setAttribute('stroke-dasharray', dashLen.toFixed(1) + ' ' + dashGap.toFixed(1));
    wakeRing.setAttribute('stroke-dashoffset', (t * 20 * (0.5 + wake)).toFixed(1));
  }

  var chipStatus = document.getElementById('mg-chip-status');
  if (chipStatus) {
    chipStatus.textContent = wake < 0.1 ? '\u2205' : (wake < 0.5 ? 'chipMonk...' : 'chipMonk');
    chipStatus.setAttribute('opacity', (0.3 + wake * 0.5).toFixed(2));
  }

  var chipWake = document.getElementById('mg-chip-wake');
  if (chipWake) {
    chipWake.textContent = 'wake: ' + wake.toFixed(4);
    chipWake.setAttribute('opacity', (wake * 0.6).toFixed(2));
  }

  // Capability scatter
  var capsG = document.getElementById('mg-chip-caps');
  if (capsG) {
    capsG.setAttribute('opacity', (0.1 + wake * 0.5).toFixed(2));
    var capCount = mc.chipCapCount || 40;
    for (var cci = 0; cci < capCount; cci++) {
      var capEl = document.getElementById('mg-chip-cap-' + cci);
      if (!capEl) continue;
      var baseAngle = (cci / capCount) * 2 * PI;
      var sortedR = 10 + (cci % 3) * 3;
      var chaos = (1 - wake);
      var chaosAngle = baseAngle + chaos * Math.sin(t * 3 + cci * 7.3) * PI * 0.5;
      var chaosR = sortedR + chaos * Math.sin(t * 2.1 + cci * 3.7) * 8;
      var capAngle = chaosAngle * (1 - wake) + (baseAngle + t * 0.05) * wake;
      var capR = chaosR * (1 - wake) + sortedR * wake;
      capEl.setAttribute('cx', (cx + capR * Math.cos(capAngle)).toFixed(1));
      capEl.setAttribute('cy', (cy + capR * Math.sin(capAngle)).toFixed(1));
      capEl.setAttribute('opacity', (0.15 + wake * 0.45).toFixed(2));
    }
  }

  var chipObs = document.getElementById('mg-chip-obs');
  if (chipObs) {
    var obs = chipData.membrane || [];
    var obsCount = 0;
    for (var oi = 0; oi < obs.length; oi++) obsCount += (obs[oi].count || 0);
    chipObs.textContent = obsCount > 0 ? obsCount + ' obs' : '';
    chipObs.setAttribute('opacity', obsCount > 0 ? '0.4' : '0');
  }
}

// ── Epitope orbit ring twist ──
function _animOrbitTwist(cx, cy, t, PI, omega_is, omega_was, omega_willbe) {
  var twists = [
    {rate: omega_is,     dir: 1},
    {rate: omega_was,    dir: -1},
    {rate: omega_willbe, dir: 1}
  ];
  for (var i = 0; i < 3; i++) {
    var el = document.getElementById('mg-orbit-ring-' + (i + 1));
    if (el) {
      var deg = (t * twists[i].rate * twists[i].dir * 180 / PI) % 360;
      el.setAttribute('transform', 'rotate(' + deg.toFixed(1) + ' ' + cx + ' ' + cy + ')');
    }
  }
}

// ── Complexity spine ──
function _animSpine(cx, cy, R, t, PI, TAU, perturb, TIERS) {
  var spineAngle = t * PI / 37;
  var oortR = Math.min(R * 1.55, 230);
  var TIER_FRACS = [0, 0.05, 0.18, 0.25, 0.35, 0.52, 0.68, 0.82, 1.0, 1.32, 1.55];

  // Tier nodes
  for (var i = 0; i < 11; i++) {
    var stR = TIER_FRACS[i] * R;
    var stA = spineAngle + i * PI / 5.5;
    var stx = cx + stR * Math.cos(stA), sty = cy + stR * Math.sin(stA);
    var stNode = document.getElementById('mg-tier-' + i);
    var alive = TIERS[i].alive;
    if (stNode) {
      stNode.setAttribute('cx', stx.toFixed(1)); stNode.setAttribute('cy', sty.toFixed(1));
      if (alive) {
        stNode.setAttribute('opacity', ((0.08 + 0.06 * Math.sin(t * PI / (i + 2))) * (0.3 + 0.7 * perturb)).toFixed(3));
        stNode.setAttribute('r', '1.2');
      } else {
        stNode.setAttribute('opacity', (0.04 + 0.03 * Math.sin(t * PI * 2.3 + i)).toFixed(3));
        stNode.setAttribute('fill', '#e85d3a');
        stNode.setAttribute('r', (1.8 + 0.5 * Math.sin(t * PI * 0.7)).toFixed(1));
      }
    }
    var stLabel = document.getElementById('mg-tier-label-' + i);
    if (stLabel) {
      stLabel.setAttribute('x', (stx + 5).toFixed(1)); stLabel.setAttribute('y', (sty - 3).toFixed(1));
      stLabel.setAttribute('opacity', (alive ? (0.04 + 0.08 * perturb) : (0.06 + 0.04 * Math.sin(t * PI))).toFixed(3));
    }
  }

  // Tier links
  for (var li = 0; li < 10; li++) {
    var link = document.getElementById('mg-tier-link-' + li);
    if (!link) continue;
    var r1 = TIER_FRACS[li] * R, r2 = TIER_FRACS[li + 1] * R;
    var a1 = spineAngle + li * PI / 5.5, a2 = spineAngle + (li + 1) * PI / 5.5;
    link.setAttribute('x1', (cx + r1 * Math.cos(a1)).toFixed(1)); link.setAttribute('y1', (cy + r1 * Math.sin(a1)).toFixed(1));
    link.setAttribute('x2', (cx + r2 * Math.cos(a2)).toFixed(1)); link.setAttribute('y2', (cy + r2 * Math.sin(a2)).toFixed(1));
    if (TIERS[li].alive && TIERS[li + 1].alive) {
      link.setAttribute('stroke-opacity', (0.03 + 0.04 * perturb).toFixed(3));
    } else {
      link.setAttribute('stroke', '#e85d3a');
      link.setAttribute('stroke-opacity', (0.02 + 0.03 * Math.sin(t * PI * 1.7 + li)).toFixed(3));
      link.setAttribute('stroke-dasharray', '1,3');
    }
  }

  // Self + non-self spiral strands
  var SSTEPS = 64;
  var selfPts = [], nonPts = [];
  for (var si = 0; si <= SSTEPS; si++) {
    var f = si / SSTEPS;
    var sR = f * oortR;
    selfPts.push((cx + sR * Math.cos(spineAngle + f * PI * TAU)).toFixed(1) + ' ' +
                 (cy + sR * Math.sin(spineAngle + f * PI * TAU)).toFixed(1));
    nonPts.push((cx + sR * Math.cos(spineAngle + PI + f * PI * TAU * -1)).toFixed(1) + ' ' +
                (cy + sR * Math.sin(spineAngle + PI + f * PI * TAU * -1)).toFixed(1));
  }
  var selfEl = document.getElementById('mg-spine-self');
  if (selfEl) { selfEl.setAttribute('d', 'M ' + selfPts.join(' L ')); selfEl.setAttribute('stroke-opacity', (0.04 + 0.04 * perturb).toFixed(3)); }
  var nonEl = document.getElementById('mg-spine-nonself');
  if (nonEl) { nonEl.setAttribute('d', 'M ' + nonPts.join(' L ')); nonEl.setAttribute('stroke-opacity', (0.04 + 0.04 * perturb).toFixed(3)); }

  return {spineAngle:spineAngle, TIER_FRACS:TIER_FRACS};
}

// ── Evolution wave ──
function _animEvolution(cx, cy, R, t, PI, perturb, spine, TIERS) {
  var TIER_FRACS = spine.TIER_FRACS;
  var spineAngle = spine.spineAngle;
  var evoRate = 0.15;
  var evoF = (t * evoRate) % 11;
  var evoTierA = Math.floor(evoF), evoTierB = Math.min(evoTierA + 1, 10);
  var evoLerp = evoF - evoTierA;

  var evoR = TIER_FRACS[evoTierA] * R + (TIER_FRACS[evoTierB] * R - TIER_FRACS[evoTierA] * R) * evoLerp;
  var evoA = (spineAngle + evoTierA * PI / 5.5) + ((spineAngle + evoTierB * PI / 5.5) - (spineAngle + evoTierA * PI / 5.5)) * evoLerp;
  var evoX = cx + evoR * Math.cos(evoA), evoY = cy + evoR * Math.sin(evoA);

  var evoWave = document.getElementById('mg-evo-wave');
  if (evoWave) {
    evoWave.setAttribute('cx', evoX.toFixed(1)); evoWave.setAttribute('cy', evoY.toFixed(1));
    var evoPulse = 1 - Math.abs(evoLerp - 0.5) * 2;
    evoWave.setAttribute('opacity', (0.06 + 0.12 * perturb + 0.06 * evoPulse).toFixed(3));
    evoWave.setAttribute('r', (2 + evoPulse * 1.5).toFixed(1));
  }

  // Trail dots
  for (var ewti = 0; ewti < 3; ewti++) {
    var ewtF = ((t * evoRate) - (ewti + 1) * 0.3 + 110) % 11;
    var ewtA2 = Math.floor(ewtF), ewtB2 = Math.min(ewtA2 + 1, 10), ewtL = ewtF - ewtA2;
    var ewtR = TIER_FRACS[ewtA2] * R + (TIER_FRACS[ewtB2] * R - TIER_FRACS[ewtA2] * R) * ewtL;
    var ewtAng = (spineAngle + ewtA2 * PI / 5.5) + ((spineAngle + ewtB2 * PI / 5.5) - (spineAngle + ewtA2 * PI / 5.5)) * ewtL;
    var ewtEl = document.getElementById('mg-evo-trail-' + ewti);
    if (ewtEl) {
      ewtEl.setAttribute('cx', (cx + ewtR * Math.cos(ewtAng)).toFixed(1));
      ewtEl.setAttribute('cy', (cy + ewtR * Math.sin(ewtAng)).toFixed(1));
      ewtEl.setAttribute('opacity', (0.03 * (3 - ewti) / 3 * perturb).toFixed(3));
    }
  }

  // Process verb labels
  var PROC_COLS = ['#ffffff','#4a8fb8','#5ab87a','#f0e68c','#d2a8ff'];
  for (var pvi = 0; pvi < 5; pvi++) {
    var pvMidTier = pvi * 2 + 1;
    var pvR = TIER_FRACS[pvMidTier] * R;
    var pvA = spineAngle + pvMidTier * PI / 5.5 + PI / 11;
    var pvEl = document.getElementById('mg-proc-' + pvi);
    if (pvEl) {
      pvEl.setAttribute('x', (cx + pvR * Math.cos(pvA)).toFixed(1));
      pvEl.setAttribute('y', (cy + pvR * Math.sin(pvA)).toFixed(1));
      var pvActive = (evoF >= pvi * 2 && evoF < (pvi + 1) * 2) ? 1 : 0;
      pvEl.setAttribute('opacity', (0.03 + 0.15 * pvActive * perturb + 0.03 * perturb).toFixed(3));
      pvEl.setAttribute('fill', pvActive ? '#ffffff' : PROC_COLS[pvi]);
    }
  }
}

// ═══ DISPATCHER ═══
window._membraneAnimateExt = function(mc, now) {
  var ac = mc._ac;
  var cx=ac.cx, cy=ac.cy, R=ac.R, t=ac.t;
  var PI=ac.PI, TAU=ac.TAU;
  var perturb=ac.perturb, bodyPositions=ac.bodyPositions;
  var liveStats=ac.liveStats, prevDash=ac.prevDash, wasDash=ac.wasDash;
  var lerp=ac.lerp, willbeT=ac.willbeT;

  _animChemistry(cx, cy, R, t, PI, TAU, perturb, bodyPositions);
  var solarPos = _animSolar(cx, cy, R, t, PI);
  var focal = _animFocalHelix(cx, cy, R, t, PI, TAU, perturb, liveStats, solarPos);
  _animNullData(mc, cx, cy, t, PI, perturb, focal, prevDash, wasDash, liveStats, lerp, willbeT);
  _animChipMonk(mc, cx, cy, t, PI, perturb);
  _animOrbitTwist(cx, cy, t, PI, ac.omega_is, ac.omega_was, ac.omega_willbe);
  var spine = _animSpine(cx, cy, R, t, PI, TAU, perturb, mc.TIERS);
  _animEvolution(cx, cy, R, t, PI, perturb, spine, mc.TIERS);
};
