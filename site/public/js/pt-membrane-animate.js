// pt-membrane-animate.js — animation loop for the membrane.
// RPS IS rotation. π/rate = flip time. Null and ∞ are the same through π.
// Each helper animates one observation system per frame.

(function() {
  // ═══════════════════════════════════════════════════════════
  // Shared animate context — set by _membraneAnimate each frame.
  // ═══════════════════════════════════════════════════════════
  var mc, PI, TAU, cx, cy, R;

  function lerp(a, b, t) {
    if (typeof b !== 'number') return a;
    if (typeof a !== 'number') return b;
    return a + (b - a) * t;
  }

  // ═══ PARTICLES: spawn + transit + pulse ═══
  function animParticles(dt) {
    var CATS = mc.CATS, rates = mc.rates, catAccum = mc.catAccum;
    var particles = mc.particles, MAX_P = mc.MAX_P;
    var aliveSet = mc.aliveSet, geo = mc.geo;
    var spawnParticle = mc.spawnParticle, pulse = mc.pulse;
    var rps = mc.rpsVal;
    var el = mc.el;
    CATS.forEach(function(cat) {
      var r = rates[cat]||0; if (r<=0) return;
      catAccum[cat] += r*dt;
      while (catAccum[cat] >= 1 && particles.length < MAX_P) {
        catAccum[cat]--;
        var cands = []; aliveSet.forEach(function(id){var g=geo[id]; if(g&&g.cat===cat) cands.push(id);});
        if (cands.length) spawnParticle(cands[Math.floor(Math.random()*cands.length)]);
      }
    });
    if (rps===0 && Math.random() < 0.2*dt*60) {
      var arr = []; aliveSet.forEach(function(id){arr.push(id);});
      if (arr.length) spawnParticle(arr[Math.floor(Math.random()*arr.length)]);
    }
    var rm = [];
    particles.forEach(function(p) {
      p.r -= p.speed*dt;
      if (p.r > R+10) p.opacity = Math.min(p.opacity+dt*3, 0.85);
      else if (p.r > R-5) { p.opacity=1; p.size*=1+dt*2; }
      else { p.opacity = Math.max(p.opacity-dt*2.5, 0); p.size = Math.max(p.size-dt*2, 0.5); }
      if (p.r<=p.targetR || p.opacity<=0.01) {
        rm.push(particles.indexOf(p)); pulse(p.id);
        if (p.el&&p.el.parentNode) p.el.parentNode.removeChild(p.el);
        return;
      }
      if (!p.el) p.el = el('circle', {fill:p.color}, mc.pGroup);
      p.el.setAttribute('cx', (cx+p.r*Math.cos(p.angle)).toFixed(1));
      p.el.setAttribute('cy', (cy+p.r*Math.sin(p.angle)).toFixed(1));
      p.el.setAttribute('r', p.size.toFixed(1));
      p.el.setAttribute('opacity', p.opacity.toFixed(2));
    });
    for (var i=rm.length-1; i>=0; i--) particles.splice(rm[i], 1);
  }

  // ═══ PERTURBATION: breathing, temporal interpolation, jitter ═══
  // Returns the animate context (ac) with all computed values.
  function computeContext(now) {
    var tSec = now * 0.001;
    var breathRate = TAU / 12;
    var sinePerturb = (Math.sin(now * 0.001 * breathRate - PI/2) + 1) / 2;

    var wasDash = mc.wasDash ? mc.wasDash() : null;
    var isDash = mc.isDash ? mc.isDash() : null;
    var fetchTs = mc.fetchTs ? mc.fetchTs() : 0;
    var fetchInterval = mc.fetchInterval || 15000;
    var willbeT = fetchTs > 0 ? Math.min(1.0, (now - fetchTs) / fetchInterval) : 0;
    var easeT = willbeT * willbeT;
    var smoothT = willbeT < 0.1 ? willbeT * 10 : 1;
    var livePerturb = mc.livePerturb;
    var wasPerturb = wasDash && wasDash.null_dimension ? wasDash.null_dimension.perturbation : -1;
    var isPerturb = livePerturb;
    var perturb;
    if (isPerturb >= 0 && wasPerturb >= 0) {
      var basePerturb = isPerturb;
      var drift = (isPerturb - wasPerturb) * easeT * 0.3;
      perturb = Math.max(0, Math.min(1, basePerturb + drift));
      perturb += sinePerturb * easeT * 0.08;
    } else if (isPerturb >= 0) {
      perturb = isPerturb + sinePerturb * easeT * 0.05;
    } else {
      perturb = sinePerturb;
    }
    var BR = R * (PI/8) * perturb;

    // Jitter: perturbation-driven tremor per layer, coprime frequencies
    var jitterAmp = perturb * 1.2;
    var focalJitterX = Math.sin(tSec * 2.3) * jitterAmp * 0.4;
    var focalJitterY = Math.cos(tSec * 3.1) * jitterAmp * 0.4;

    // Null space breathing
    var breathScale = 1.0 + sinePerturb * perturb * 0.6;

    // Body angular velocities
    var omega_is = PI / 7, omega_willbe = PI / 11, omega_was = PI / 17;
    var t = tSec;
    var baseAngles = [-PI/2, -PI/2 + TAU/3, -PI/2 + 2*TAU/3];
    var bodyAngles = [
      baseAngles[0] + omega_is * t,
      baseAngles[1] + omega_was * t,
      baseAngles[2] + omega_willbe * t
    ];

    // Reflexive angles
    var reflexive01 = ((bodyAngles[0] - bodyAngles[1]) % TAU + TAU) % TAU;
    var reflexive12 = ((bodyAngles[1] - bodyAngles[2]) % TAU + TAU) % TAU;
    var reflexive20 = ((bodyAngles[2] - bodyAngles[0]) % TAU + TAU) % TAU;
    var meanReflexive = (reflexive01 + reflexive12 + reflexive20) / 3;

    return {
      cx:cx, cy:cy, R:R, BR:BR, PI:PI, TAU:TAU, t:t, tSec:tSec,
      perturb:perturb, sinePerturb:sinePerturb,
      omega_is:omega_is, omega_was:omega_was, omega_willbe:omega_willbe,
      bodyAngles:bodyAngles, jitterAmp:jitterAmp,
      focalJitterX:focalJitterX, focalJitterY:focalJitterY,
      breathScale:breathScale,
      wasDash:wasDash, liveStats:mc.liveStats, willbeT:willbeT,
      smoothT:smoothT, easeT:easeT, lerp:lerp,
      meanReflexive:meanReflexive,
      reflexive01:reflexive01, reflexive12:reflexive12, reflexive20:reflexive20,
      prevDash:mc.prevDashVal, rps:mc.rpsVal
    };
  }

  // ═══ LAYER ROTATION + BREATHING ═══
  function animLayers(ac, now) {
    var tSec = ac.tSec;
    var ringOmega = PI / 31;
    var wasRot = (tSec * ringOmega * 180 / PI) % 360;
    var isRot = (-tSec * PI / 7 * 180 / PI) % 360;
    var willbeRot = (tSec * PI / 11 * 180 / PI * 0.5) % 360;
    var wasJitter = Math.sin(tSec * 3.7) * ac.jitterAmp;
    var isJitter = Math.sin(tSec * 5.3 + 1.0) * ac.jitterAmp;
    var willbeJitter = Math.sin(tSec * 4.1 + 2.0) * ac.jitterAmp;

    var wasEl = document.getElementById('mg-was');
    if (wasEl) wasEl.setAttribute('transform',
      'rotate('+(wasRot + wasJitter).toFixed(1)+' '+cx+' '+cy+')');
    var isEl = document.getElementById('mg-is');
    if (isEl) isEl.setAttribute('transform',
      'rotate('+(isRot + isJitter).toFixed(1)+' '+cx+' '+cy+')');
    var willbeEl = document.getElementById('mg-willbe');
    if (willbeEl) willbeEl.setAttribute('transform',
      'rotate('+(willbeRot + willbeJitter).toFixed(1)+' '+cx+' '+cy+')');

    // Pin breathing
    var pinEl = document.getElementById('mg-pin');
    if (pinEl) pinEl.setAttribute('r', (1.5 * ac.breathScale).toFixed(2));
    var pinRingEl = document.getElementById('mg-pin-ring');
    if (pinRingEl) {
      pinRingEl.setAttribute('r', (4 * ac.breathScale).toFixed(2));
      pinRingEl.setAttribute('stroke-opacity', (0.15 + 0.15 * ac.sinePerturb * ac.perturb).toFixed(3));
    }
    var nullLabel = document.getElementById('mg-null-label');
    if (nullLabel) {
      nullLabel.setAttribute('x', (cx + ac.focalJitterX).toFixed(1));
      nullLabel.setAttribute('y', (cy - 48 + ac.focalJitterY).toFixed(1));
    }

    // Coil rotation
    var coilRot = (now * 0.003) % 360;
    var coilEl = document.getElementById('mg-coil');
    if (coilEl) coilEl.setAttribute('transform', 'rotate('+coilRot.toFixed(1)+' '+cx+' '+cy+')');

    // Tier alive status
    var livePerturb = mc.livePerturb, prevDash = ac.prevDash, liveStats = ac.liveStats;
    var TIERS = mc.TIERS;
    TIERS[0].alive = livePerturb >= 0 ? 1 : 0;
    TIERS[5].alive = prevDash && prevDash.anderson_selectivity ? 1 : 0;
    TIERS[6].alive = prevDash && prevDash.bingo_cube_summary ? 1 : 0;
    TIERS[7].alive = prevDash && prevDash.membrane_geometry ? 1 : 0;
    TIERS[8].alive = liveStats.aliveCount > 14 ? 1 : 0;
  }

  // ═══ BODIES: position + anti-bodies + null-tense ═══
  function animBodies(ac) {
    var bodyAngles = ac.bodyAngles, BR = ac.BR;
    var perturb = ac.perturb;
    var bodyIds = ['is','was','willbe'];
    var bodyPositions = [];

    for (var bi = 0; bi < 3; bi++) {
      var bx = cx + BR * Math.cos(bodyAngles[bi]);
      var by = cy + BR * Math.sin(bodyAngles[bi]);
      bodyPositions.push({x:bx, y:by});
      var ring = document.getElementById('mg-body-ring-'+bodyIds[bi]);
      var dot = document.getElementById('mg-body-'+bodyIds[bi]);
      var tense = document.getElementById('mg-tense-'+bodyIds[bi]);
      var vdj = document.getElementById('mg-vdj-'+bodyIds[bi]);
      var sub = document.getElementById('mg-sub-'+bodyIds[bi]);
      var val = document.getElementById('mg-body-val-'+bodyIds[bi]);
      if (ring) { ring.setAttribute('cx', bx.toFixed(1)); ring.setAttribute('cy', by.toFixed(1)); }
      if (dot)  { dot.setAttribute('cx', bx.toFixed(1)); dot.setAttribute('cy', by.toFixed(1)); }
      if (tense) { tense.setAttribute('x', bx.toFixed(1)); tense.setAttribute('y', (by-20).toFixed(1)); }
      if (vdj)   { vdj.setAttribute('x', bx.toFixed(1)); vdj.setAttribute('y', (by-10).toFixed(1)); }
      if (sub)   { sub.setAttribute('x', bx.toFixed(1)); sub.setAttribute('y', (by+16).toFixed(1));
                   sub.setAttribute('opacity', (0.3 * perturb).toFixed(2)); }
      if (val)   { val.setAttribute('x', bx.toFixed(1)); val.setAttribute('y', (by+28).toFixed(1));
                   val.setAttribute('opacity', (0.45 * perturb).toFixed(2)); }
    }
    ac.bodyPositions = bodyPositions;

    // Anti-bodies: reflected through [∅]D
    var antiBR = BR / PI;
    var antiPositions = [];
    var antiIds = ['anti-is', 'anti-was', 'anti-willbe'];
    for (var ai = 0; ai < 3; ai++) {
      var antiAngle = bodyAngles[ai] + PI;
      var ax = cx + antiBR * Math.cos(antiAngle) + ac.focalJitterX * 0.6;
      var ay = cy + antiBR * Math.sin(antiAngle) + ac.focalJitterY * 0.6;
      antiPositions.push({x:ax, y:ay});
      var aRing = document.getElementById('mg-body-ring-'+antiIds[ai]);
      var aDot = document.getElementById('mg-body-'+antiIds[ai]);
      var aTense = document.getElementById('mg-tense-'+antiIds[ai]);
      var aVdj = document.getElementById('mg-vdj-'+antiIds[ai]);
      var aSub = document.getElementById('mg-sub-'+antiIds[ai]);
      var antiOp = (0.2 * perturb).toFixed(3);
      if (aRing) { aRing.setAttribute('cx', ax.toFixed(1)); aRing.setAttribute('cy', ay.toFixed(1));
                   aRing.setAttribute('stroke-opacity', (0.08 + 0.06 * perturb).toFixed(3)); }
      if (aDot)  { aDot.setAttribute('cx', ax.toFixed(1)); aDot.setAttribute('cy', ay.toFixed(1));
                   aDot.setAttribute('opacity', antiOp); }
      if (aTense) { aTense.setAttribute('x', ax.toFixed(1)); aTense.setAttribute('y', (ay-12).toFixed(1));
                    aTense.setAttribute('opacity', antiOp); }
      if (aVdj)   { aVdj.setAttribute('x', ax.toFixed(1)); aVdj.setAttribute('y', (ay-4).toFixed(1));
                    aVdj.setAttribute('opacity', (0.15 * perturb).toFixed(3)); }
      if (aSub)   { aSub.setAttribute('x', ax.toFixed(1)); aSub.setAttribute('y', (ay+10).toFixed(1));
                    aSub.setAttribute('opacity', (0.1 * perturb).toFixed(3)); }
    }
    ac.antiPositions = antiPositions;
    ac.antiBR = antiBR;

    // Null-tense: on the pin ring at body angle + π/2
    var nullTenseIds = ['null-is', 'null-was', 'null-willbe'];
    var pinR = 4 * ac.breathScale;
    for (var ni = 0; ni < 3; ni++) {
      var nullAngle = bodyAngles[ni] + PI / 2;
      var nx = cx + pinR * Math.cos(nullAngle);
      var ny = cy + pinR * Math.sin(nullAngle);
      var nullOp = (0.15 * (1 - perturb * 0.7)).toFixed(3);
      var nDot = document.getElementById('mg-body-'+nullTenseIds[ni]);
      var nLabel = document.getElementById('mg-tense-'+nullTenseIds[ni]);
      if (nDot) {
        nDot.setAttribute('cx', nx.toFixed(1)); nDot.setAttribute('cy', ny.toFixed(1));
        nDot.setAttribute('opacity', nullOp);
      }
      if (nLabel) {
        nLabel.setAttribute('x', (nx + 6).toFixed(1)); nLabel.setAttribute('y', ny.toFixed(1));
        nLabel.setAttribute('opacity', nullOp);
      }
    }

    // Anti-body triangle
    var antiTri = document.getElementById('mg-anti-body-tri');
    if (antiTri && antiPositions.length === 3) {
      antiTri.setAttribute('d',
        'M '+antiPositions[0].x.toFixed(1)+' '+antiPositions[0].y.toFixed(1)+
        ' L '+antiPositions[1].x.toFixed(1)+' '+antiPositions[1].y.toFixed(1)+
        ' L '+antiPositions[2].x.toFixed(1)+' '+antiPositions[2].y.toFixed(1)+' Z');
      antiTri.setAttribute('stroke-opacity', (0.06 * perturb).toFixed(3));
    }
  }

  // ═══ BUMP + PHASE + BIDIRECTIONAL JITTER ═══
  function animBump(ac) {
    var t = ac.t, perturb = ac.perturb;
    var ref01 = ac.reflexive01 > PI ? TAU - ac.reflexive01 : ac.reflexive01;
    var ref12 = ac.reflexive12 > PI ? TAU - ac.reflexive12 : ac.reflexive12;
    var ref20 = ac.reflexive20 > PI ? TAU - ac.reflexive20 : ac.reflexive20;
    var minRef = Math.min(ref01, ref12, ref20);
    var bumpProx = Math.max(0, 1 - minRef / (PI / 4));

    var recogEl = document.getElementById('mg-recognition');
    if (recogEl) {
      recogEl.setAttribute('r', (R * 0.15 * (1 + bumpProx * 0.8)).toFixed(1));
      recogEl.setAttribute('stroke-opacity', (bumpProx * bumpProx * 0.35 * perturb).toFixed(3));
      recogEl.setAttribute('stroke-width', (0.5 + bumpProx * 1.5).toFixed(1));
    }
    var recogText = document.getElementById('mg-recognition-text');
    if (recogText) {
      recogText.setAttribute('opacity', (bumpProx * bumpProx * 0.30 * perturb).toFixed(3));
      recogText.textContent = bumpProx > 0.85 ? 'OH SHIT IS THAT ME?' :
                              bumpProx > 0.5 ? 'is that me?' : '';
    }
    var phaseEl = document.getElementById('mg-phase-label');
    if (phaseEl) {
      var phase = perturb < 0.15 ? 'ground \u23F8' :
                  perturb < 0.35 ? 'lift \u2191' :
                  perturb < 0.55 ? 'jump \u2197' :
                  perturb < 0.80 ? 'fly \u2191\u2191' : 'soar \u2B06';
      phaseEl.textContent = phase;
      phaseEl.setAttribute('opacity', (0.04 + 0.10 * perturb).toFixed(3));
    }
    for (var bji = 0; bji < 4; bji++) {
      var bjAngle = bji * TAU / 4 + t * PI / 5;
      var bjAmp = 4 * perturb * Math.sin(t * PI * (bji + 3));
      var bjR = R * 0.5;
      var bjUp = document.getElementById('mg-jitter-up-' + bji);
      if (bjUp) {
        bjUp.setAttribute('cx', (cx + (bjR + bjAmp) * Math.cos(bjAngle)).toFixed(1));
        bjUp.setAttribute('cy', (cy + (bjR + bjAmp) * Math.sin(bjAngle)).toFixed(1));
        bjUp.setAttribute('opacity', (0.03 + 0.06 * perturb).toFixed(3));
      }
      var bjDn = document.getElementById('mg-jitter-down-' + bji);
      if (bjDn) {
        bjDn.setAttribute('cx', (cx + (bjR - bjAmp) * Math.cos(bjAngle)).toFixed(1));
        bjDn.setAttribute('cy', (cy + (bjR - bjAmp) * Math.sin(bjAngle)).toFixed(1));
        bjDn.setAttribute('opacity', (0.03 + 0.06 * perturb).toFixed(3));
      }
    }
  }

  // ═══ EPITOPE ORBITS: 9 markers on 3 rings ═══
  function animEpitopes(ac) {
    var t = ac.t, perturb = ac.perturb;
    var epiOmegas = [ac.omega_is, ac.omega_willbe, ac.omega_was,
                     ac.omega_is, ac.omega_willbe, ac.omega_was,
                     ac.omega_is, ac.omega_willbe, ac.omega_was];
    var oRadii = [R/PI, R/PI, R/PI,
                  R/Math.sqrt(PI), R/Math.sqrt(PI), R/Math.sqrt(PI),
                  R*2/PI, R*2/PI, R*2/PI];
    var oTorsion = [1,1,1, -1,-1,-1, 1,1,1];
    var oStiff = [true,false,true, false,true,false, true,false,true];

    for (var oi = 0; oi < 9; oi++) {
      var oAngle = (oi % 3) * TAU / 3 + epiOmegas[oi] * t * oTorsion[oi];
      if (!oStiff[oi]) oAngle += Math.sin(t * PI * 2.3) * (PI / 12);
      var oR = oRadii[oi];
      var ox = cx + oR * Math.cos(oAngle), oy = cy + oR * Math.sin(oAngle);
      var eDot = document.getElementById('mg-epi-' + oi);
      if (eDot) { eDot.setAttribute('cx', ox.toFixed(1)); eDot.setAttribute('cy', oy.toFixed(1)); }
      if (oStiff[oi]) {
        var crossLen = 5;
        var ch = document.getElementById('mg-epi-cross-h-' + oi);
        var cv = document.getElementById('mg-epi-cross-v-' + oi);
        if (ch) { ch.setAttribute('x1', (ox-crossLen).toFixed(1)); ch.setAttribute('y1', oy.toFixed(1));
                  ch.setAttribute('x2', (ox+crossLen).toFixed(1)); ch.setAttribute('y2', oy.toFixed(1)); }
        if (cv) { cv.setAttribute('x1', ox.toFixed(1)); cv.setAttribute('y1', (oy-crossLen).toFixed(1));
                  cv.setAttribute('x2', ox.toFixed(1)); cv.setAttribute('y2', (oy+crossLen).toFixed(1)); }
      } else {
        var spring = document.getElementById('mg-epi-spring-' + oi);
        if (spring) {
          spring.setAttribute('cx', ox.toFixed(1)); spring.setAttribute('cy', oy.toFixed(1));
          spring.setAttribute('r', (4 + Math.sin(t * PI * 1.7) * 2 * perturb).toFixed(1));
        }
      }
      var eLabel = document.getElementById('mg-epi-label-' + oi);
      if (eLabel) { eLabel.setAttribute('x', ox.toFixed(1)); eLabel.setAttribute('y', (oy-7).toFixed(1)); }
      var eName = document.getElementById('mg-epi-name-' + oi);
      if (eName) { eName.setAttribute('x', ox.toFixed(1)); eName.setAttribute('y', (oy+8).toFixed(1)); }
    }
  }

  // ═══ DEPTH SPIRAL: π body stack with twist triad ═══
  // Forward twist: observer→geodesic (1/π³ → π³)
  // Reverse twist: geodesic→observer (π³ → 1/π³) return path
  // Anti-twist: cubic nesting, neither chirality
  function animDepth(ac) {
    var t = ac.t, perturb = ac.perturb;
    // Forward twist — the standard epicyclic chain
    var depthPos = [{x: cx, y: cy}];
    for (var di = 0; di < 7; di++) {
      var dprev = depthPos[di];
      var dR = (4 + di * 1.5) * perturb;
      var dRate = PI * (1 + di * 0.13);
      var dAngle = t * dRate + di * PI;
      var ddx = dprev.x + dR * Math.cos(dAngle);
      var ddy = dprev.y + dR * Math.sin(dAngle);
      depthPos.push({x: ddx, y: ddy});
      var dDot = document.getElementById('mg-depth-' + di);
      if (dDot) {
        dDot.setAttribute('cx', ddx.toFixed(1)); dDot.setAttribute('cy', ddy.toFixed(1));
        dDot.setAttribute('opacity', (0.4 + 0.3 * perturb).toFixed(2));
      }
      var dLabel = document.getElementById('mg-depth-label-' + di);
      if (dLabel) {
        dLabel.setAttribute('x', (ddx + 6).toFixed(1)); dLabel.setAttribute('y', ddy.toFixed(1));
        dLabel.setAttribute('opacity', (0.15 + 0.1 * (1 - perturb)).toFixed(2));
      }
      var dLink = document.getElementById('mg-depth-link-' + di);
      if (dLink) {
        dLink.setAttribute('x1', dprev.x.toFixed(1)); dLink.setAttribute('y1', dprev.y.toFixed(1));
        dLink.setAttribute('x2', ddx.toFixed(1)); dLink.setAttribute('y2', ddy.toFixed(1));
        dLink.setAttribute('stroke-opacity', (0.15 * perturb).toFixed(3));
      }
    }
    // Reverse twist — same chain running backward (geodesic→observer)
    var revPos = [{x: cx, y: cy}];
    for (var ri = 0; ri < 7; ri++) {
      var rprev = revPos[ri];
      var rR = (4 + (6 - ri) * 1.5) * perturb;
      var rRate = PI * (1 + (6 - ri) * 0.13);
      var rAngle = -t * rRate + (6 - ri) * PI + PI/3;
      var rdx = rprev.x + rR * Math.cos(rAngle);
      var rdy = rprev.y + rR * Math.sin(rAngle);
      revPos.push({x: rdx, y: rdy});
      var rLink = document.getElementById('mg-depth-rev-' + ri);
      if (rLink) {
        rLink.setAttribute('x1', rprev.x.toFixed(1)); rLink.setAttribute('y1', rprev.y.toFixed(1));
        rLink.setAttribute('x2', rdx.toFixed(1)); rLink.setAttribute('y2', rdy.toFixed(1));
        rLink.setAttribute('stroke-opacity', (0.08 * perturb).toFixed(3));
      }
    }
    // Anti-twist — cubic nesting path through all 7 positions
    var antiEl = document.getElementById('mg-depth-anti');
    if (antiEl && depthPos.length >= 8) {
      var antiPts = [];
      for (var ai = 0; ai < 8; ai++) {
        var fwd = depthPos[ai], rev = revPos[Math.min(ai, 7)];
        var ax = (fwd.x + rev.x) / 2 + Math.sin(t * PI * PI + ai) * 2 * perturb;
        var ay = (fwd.y + rev.y) / 2 + Math.cos(t * PI * PI + ai) * 2 * perturb;
        antiPts.push(ax.toFixed(1) + ' ' + ay.toFixed(1));
      }
      antiEl.setAttribute('d', 'M ' + antiPts.join(' L '));
      antiEl.setAttribute('stroke-opacity', (0.06 * perturb).toFixed(3));
    }
  }

  // ═══ LATTICE: P-space breathing + jitter ═══
  function animLattice(ac) {
    var t = ac.t, perturb = ac.perturb, bodyPositions = ac.bodyPositions;
    var latticePos = [];
    for (var lsi = 0; lsi < 6; lsi++) {
      var lsr = R * (lsi + 1) / (2 * PI);
      var lShellR = lsr * (0.85 + 0.15 * perturb);
      var lShellEl = document.getElementById('mg-pshell-' + lsi);
      if (lShellEl) lShellEl.setAttribute('r', lShellR.toFixed(1));
      for (var lni = 0; lni < 3; lni++) {
        var lIdx = lsi * 3 + lni;
        var lAngle = lni * TAU / 3 + lsi * PI / 6 + t * PI / (37 + lsi * 11);
        var lnx = cx + lShellR * Math.cos(lAngle);
        var lny = cy + lShellR * Math.sin(lAngle);
        latticePos.push({x:lnx, y:lny});
        var lProx = 0;
        for (var lbi = 0; lbi < bodyPositions.length; lbi++) {
          var ldx = lnx - bodyPositions[lbi].x, ldy = lny - bodyPositions[lbi].y;
          var lDist = Math.sqrt(ldx*ldx + ldy*ldy);
          if (lDist < 40) lProx = Math.max(lProx, 1 - lDist/40);
        }
        var lNodeEl = document.getElementById('mg-lnode-' + lIdx);
        if (lNodeEl) {
          lNodeEl.setAttribute('cx', lnx.toFixed(1)); lNodeEl.setAttribute('cy', lny.toFixed(1));
          if ((lIdx % 4) === 0) {
            lNodeEl.setAttribute('r', (2 + (1-lsi/6)*2 + lProx*3).toFixed(1));
            lNodeEl.setAttribute('stroke-opacity', (0.12 + lProx * 0.25).toFixed(3));
          } else {
            lNodeEl.setAttribute('opacity', (0.06 + (1-lsi/6)*0.10 + lProx*0.2).toFixed(3));
          }
        }
        var lSymEl = document.getElementById('mg-lnode-sym-' + lIdx);
        if (lSymEl) {
          lSymEl.setAttribute('x', lnx.toFixed(1)); lSymEl.setAttribute('y', (lny+1).toFixed(1));
          lSymEl.setAttribute('opacity', (0.08 + lProx * 0.15).toFixed(3));
        }
      }
    }
    // Braid connections
    for (var bsi = 0; bsi < 5; bsi++) {
      for (var bni = 0; bni < 3; bni++) {
        var bFrom = latticePos[bsi * 3 + bni];
        var bTo = latticePos[(bsi + 1) * 3 + ((bni + 1) % 3)];
        var braidEl = document.getElementById('mg-braid-' + (bsi*3+bni) + '-' + ((bsi+1)*3+(bni+1)%3));
        if (braidEl && bFrom && bTo) {
          braidEl.setAttribute('x1', bFrom.x.toFixed(1)); braidEl.setAttribute('y1', bFrom.y.toFixed(1));
          braidEl.setAttribute('x2', bTo.x.toFixed(1)); braidEl.setAttribute('y2', bTo.y.toFixed(1));
        }
      }
    }
    // Lattice jitter
    var jAmp = 1.5 * perturb;
    for (var ji = 0; ji < latticePos.length; ji++) {
      var jx = Math.sin(t * 17.3 + ji * 7.1) * jAmp;
      var jy = Math.cos(t * 13.7 + ji * 11.3) * jAmp;
      var jNode = document.getElementById('mg-lnode-' + ji);
      if (jNode && latticePos[ji]) {
        jNode.setAttribute('cx', (latticePos[ji].x + jx).toFixed(1));
        jNode.setAttribute('cy', (latticePos[ji].y + jy).toFixed(1));
      }
    }
  }

  // ═══ STRESS: tear + rip + warp + jitter particles ═══
  function animStress(ac) {
    var t = ac.t, perturb = ac.perturb;
    var bodyAngles = ac.bodyAngles, bodyPositions = ac.bodyPositions;
    // Jitter particles near the ring
    for (var sji = 0; sji < 6; sji++) {
      var sjAngle = sji * TAU / 6 + t * 3.7;
      var sjR = R - 3 + Math.sin(t * 23.1 + sji * 5.3) * 4;
      var sjEl = document.getElementById('mg-jitter-' + sji);
      if (sjEl) {
        sjEl.setAttribute('cx', (cx + sjR * Math.cos(sjAngle)).toFixed(1));
        sjEl.setAttribute('cy', (cy + sjR * Math.sin(sjAngle)).toFixed(1));
        sjEl.setAttribute('opacity', (0.15*perturb*(0.5+0.5*Math.sin(t*31+sji))).toFixed(3));
      }
    }
    // Tear: stress fractures at body proximity on the ring
    for (var sti = 0; sti < 3; sti++) {
      var stBodyR = Math.sqrt(Math.pow(bodyPositions[sti].x-cx,2)+Math.pow(bodyPositions[sti].y-cy,2));
      var stStress = Math.max(0, 1 - Math.abs(stBodyR - R) / (R * 0.6)) * perturb;
      var stTearEl = document.getElementById('mg-tear-' + sti);
      if (stTearEl && stStress > 0.02) {
        var stArc = PI / 12 * stStress;
        var sta1 = bodyAngles[sti]-stArc, sta2 = bodyAngles[sti]+stArc;
        stTearEl.setAttribute('d',
          'M '+(cx+R*Math.cos(sta1)).toFixed(1)+' '+(cy+R*Math.sin(sta1)).toFixed(1)+
          ' A '+R+' '+R+' 0 0 1 '+(cx+R*Math.cos(sta2)).toFixed(1)+' '+(cy+R*Math.sin(sta2)).toFixed(1));
        stTearEl.setAttribute('stroke-opacity', (stStress * 0.35).toFixed(3));
      } else if (stTearEl) { stTearEl.setAttribute('stroke-opacity', '0'); }
    }
    // Rip: radial cracks from ring toward center
    var omegas = [ac.omega_is, ac.omega_was, ac.omega_willbe];
    for (var sri = 0; sri < 3; sri++) {
      var srPulse = 0.5 + 0.5 * Math.sin(t * omegas[sri] * 2);
      var srLen = perturb * srPulse * R * 0.25;
      var srEl = document.getElementById('mg-rip-' + sri);
      if (srEl && srLen > 2) {
        srEl.setAttribute('x1', (cx+R*Math.cos(bodyAngles[sri])).toFixed(1));
        srEl.setAttribute('y1', (cy+R*Math.sin(bodyAngles[sri])).toFixed(1));
        srEl.setAttribute('x2', (cx+(R-srLen)*Math.cos(bodyAngles[sri])).toFixed(1));
        srEl.setAttribute('y2', (cy+(R-srLen)*Math.sin(bodyAngles[sri])).toFixed(1));
        srEl.setAttribute('stroke-opacity', (perturb * srPulse * 0.15).toFixed(3));
      } else if (srEl) { srEl.setAttribute('stroke-opacity', '0'); }
    }
    // Warp: ring becomes elliptical under body gravity
    var warpEl = document.getElementById('mg-warp');
    if (warpEl && bodyPositions.length === 3) {
      var wcX = (bodyPositions[0].x+bodyPositions[1].x+bodyPositions[2].x)/3;
      var wcY = (bodyPositions[0].y+bodyPositions[1].y+bodyPositions[2].y)/3;
      var wAngle = Math.atan2(wcY-cy, wcX-cx);
      var wMag = Math.sqrt(Math.pow(wcX-cx,2)+Math.pow(wcY-cy,2));
      var wFactor = 1 + (wMag/R) * 0.15 * perturb;
      warpEl.setAttribute('rx', (R*wFactor).toFixed(1));
      warpEl.setAttribute('ry', (R/wFactor).toFixed(1));
      warpEl.setAttribute('transform', 'rotate('+(wAngle*180/PI).toFixed(1)+' '+cx+' '+cy+')');
      warpEl.setAttribute('stroke-opacity', (perturb * 0.08).toFixed(3));
    }
  }

  // ═══ TRIPLE HELIX: self ↻ × non-self ↺ × null ⟲ ═══
  function animHelix(ac) {
    var t = ac.t, perturb = ac.perturb, BR = ac.BR;
    var helixRMax = BR * 1.8 + 8;
    var helixTurns = PI;
    var HSTEPS = 48;
    var hSelfPts = [], hNonPts = [], hNullPts = [];
    for (var hsi = 0; hsi <= HSTEPS; hsi++) {
      var f = hsi / HSTEPS;
      var hr = f * helixRMax;
      var hsa = t * ac.omega_was + f * helixTurns * TAU;
      hSelfPts.push((cx+hr*Math.cos(hsa)).toFixed(1)+' '+(cy+hr*Math.sin(hsa)).toFixed(1));
      var hna = t * ac.omega_was + PI + f * helixTurns * TAU * -1;
      hNonPts.push((cx+hr*Math.cos(hna)).toFixed(1)+' '+(cy+hr*Math.sin(hna)).toFixed(1));
      // Null strand: anti-twist — cubic frequency, offset by TAU/3
      var hnla = t * ac.omega_was * ac.omega_was * ac.omega_was + TAU/3 + f * helixTurns * TAU * (Math.sin(f*PI)*0.5);
      var hnlr = hr * 0.7;
      hNullPts.push((cx+hnlr*Math.cos(hnla)).toFixed(1)+' '+(cy+hnlr*Math.sin(hnla)).toFixed(1));
    }
    var hSelfEl = document.getElementById('mg-helix-self');
    if (hSelfEl) { hSelfEl.setAttribute('d', 'M '+hSelfPts.join(' L '));
                   hSelfEl.setAttribute('stroke-opacity', (0.15*perturb).toFixed(3)); }
    var hNonEl = document.getElementById('mg-helix-nonself');
    if (hNonEl) { hNonEl.setAttribute('d', 'M '+hNonPts.join(' L '));
                  hNonEl.setAttribute('stroke-opacity', (0.15*perturb).toFixed(3)); }
    var hNullEl = document.getElementById('mg-helix-null');
    if (hNullEl) { hNullEl.setAttribute('d', 'M '+hNullPts.join(' L '));
                   hNullEl.setAttribute('stroke-opacity', (0.08*perturb).toFixed(3)); }
    for (var hci = 0; hci < 6; hci++) {
      var hcF = (2*hci+1) / (4*PI);
      var hcR = hcF * helixRMax;
      var hcA = t * ac.omega_was + hcF * helixTurns * TAU;
      var hcEl = document.getElementById('mg-helix-cross-' + hci);
      if (hcEl) {
        hcEl.setAttribute('cx', (cx+hcR*Math.cos(hcA)).toFixed(1));
        hcEl.setAttribute('cy', (cy+hcR*Math.sin(hcA)).toFixed(1));
        hcEl.setAttribute('stroke-opacity', (0.15*perturb).toFixed(3));
      }
    }
    // Counter-rotation rings
    var counterDeg1 = -(ac.tSec * PI / 31 * 180 / PI) % 360;
    var crEl = document.getElementById('mg-counter-ring');
    if (crEl) { crEl.setAttribute('transform', 'rotate('+counterDeg1.toFixed(1)+' '+cx+' '+cy+')');
                crEl.setAttribute('stroke-opacity', (0.04+0.02*perturb).toFixed(3)); }
    var counterDeg2 = -(ac.tSec * PI / 17 * 180 / PI) % 360;
    var crInner = document.getElementById('mg-counter-inner');
    if (crInner) { crInner.setAttribute('transform', 'rotate('+counterDeg2.toFixed(1)+' '+cx+' '+cy+')');
                   crInner.setAttribute('stroke-opacity', (0.03+0.02*perturb).toFixed(3)); }
  }

  // ═══ CONVERGENCE + IONOSPHERE ═══
  function animConvergeIono(ac) {
    var t = ac.t, perturb = ac.perturb;
    var bodyAngles = ac.bodyAngles, bodyPositions = ac.bodyPositions;
    // Ionosphere ghost arcs
    var ioRoutes = [{from:-98,to:-8},{from:-98,to:104},{from:-98,to:28},{from:-8,to:10},{from:104,to:138}];
    for (var ioi = 0; ioi < 5; ioi++) {
      var ioEl = document.getElementById('mg-io-arc-' + ioi);
      if (ioEl) {
        var rt = ioRoutes[ioi];
        var ioA1 = (rt.from/180)*PI + t*PI/23, ioA2 = (rt.to/180)*PI + t*PI/23;
        var ioR = R * (0.3 + 0.7 * perturb);
        var iox1=cx+ioR*Math.cos(ioA1), ioy1=cy+ioR*Math.sin(ioA1);
        var iox2=cx+ioR*Math.cos(ioA2), ioy2=cy+ioR*Math.sin(ioA2);
        ioEl.setAttribute('d',
          'M '+iox1.toFixed(1)+' '+ioy1.toFixed(1)+
          ' Q '+((iox1+iox2)/2).toFixed(1)+' '+((ioy1+ioy2)/2-ioR*0.3).toFixed(1)+
          ' '+iox2.toFixed(1)+' '+ioy2.toFixed(1));
        ioEl.setAttribute('stroke-opacity', (0.06+0.04*perturb).toFixed(3));
      }
    }
    // Ionosphere band breathing
    var ionoShell = document.getElementById('mg-iono-shell');
    if (ionoShell) {
      var ibR = R*(0.78+0.08*perturb), ibW = R*(0.10+0.06*perturb);
      ionoShell.setAttribute('r', ibR.toFixed(1));
      ionoShell.setAttribute('stroke-width', ibW.toFixed(1));
      ionoShell.setAttribute('stroke-opacity', (0.012+0.012*perturb).toFixed(4));
    }
    var ionoInner = document.getElementById('mg-iono-inner');
    if (ionoInner) { ionoInner.setAttribute('r', (R*(0.74+0.04*perturb)).toFixed(1));
                     ionoInner.setAttribute('stroke-opacity', (0.03+0.03*perturb).toFixed(3)); }
    var ionoOuter = document.getElementById('mg-iono-outer');
    if (ionoOuter) { ionoOuter.setAttribute('r', (R*(0.92+0.02*perturb)).toFixed(1));
                     ionoOuter.setAttribute('stroke-opacity', (0.03+0.03*perturb).toFixed(3)); }
    // Pressure arrows
    for (var epai = 0; epai < 8; epai++) {
      var epAngle = epai * TAU / 8 + t * PI / 41;
      var epEl = document.getElementById('mg-pressure-' + epai);
      if (epEl) {
        epEl.setAttribute('x1', (cx+R*0.97*Math.cos(epAngle)).toFixed(1));
        epEl.setAttribute('y1', (cy+R*0.97*Math.sin(epAngle)).toFixed(1));
        var epDepth = 0.88 - 0.04*Math.sin(t*PI/3+epai*PI/4);
        epEl.setAttribute('x2', (cx+R*epDepth*Math.cos(epAngle)).toFixed(1));
        epEl.setAttribute('y2', (cy+R*epDepth*Math.sin(epAngle)).toFixed(1));
        var epBright = 0.02;
        for (var epbi = 0; epbi < bodyPositions.length; epbi++) {
          var epDiff = Math.abs(((epAngle - bodyAngles[epbi]) % TAU + TAU) % TAU);
          if (epDiff > PI) epDiff = TAU - epDiff;
          if (epDiff < PI/4) epBright += 0.06 * (1 - epDiff/(PI/4));
        }
        epEl.setAttribute('stroke-opacity', (epBright*perturb).toFixed(3));
      }
    }
    // Signal corridors + sublayers + transits + refraction + compression + predictions
    for (var ibri = 0; ibri < 5; ibri++) {
      var ibrEl = document.getElementById('mg-iono-route-' + ibri);
      if (ibrEl) {
        var ibrt = ioRoutes[ibri];
        var ibrA1=(ibrt.from/180)*PI+t*PI/23, ibrA2=(ibrt.to/180)*PI+t*PI/23;
        var ibrR = R*0.86;
        var ibrx1=cx+ibrR*Math.cos(ibrA1), ibry1=cy+ibrR*Math.sin(ibrA1);
        var ibrx2=cx+ibrR*Math.cos(ibrA2), ibry2=cy+ibrR*Math.sin(ibrA2);
        ibrEl.setAttribute('d',
          'M '+ibrx1.toFixed(1)+' '+ibry1.toFixed(1)+
          ' Q '+((ibrx1+ibrx2)/2).toFixed(1)+' '+((ibry1+ibry2)/2-ibrR*0.15).toFixed(1)+
          ' '+ibrx2.toFixed(1)+' '+ibry2.toFixed(1));
        ibrEl.setAttribute('stroke-opacity', (0.04+0.05*perturb).toFixed(3));
      }
    }
    var ionoLayerNames = ['D','E','F'];
    var ionoLayerFracs = [0.80, 0.86, 0.92];
    for (var ili = 0; ili < 3; ili++) {
      var ilR = R * (ionoLayerFracs[ili] + [-0.02,0,0.01][ili]*perturb);
      var ilEl = document.getElementById('mg-iono-layer-' + ionoLayerNames[ili]);
      if (ilEl) { ilEl.setAttribute('r', ilR.toFixed(1)); ilEl.setAttribute('stroke-opacity', (0.02+0.03*perturb).toFixed(3)); }
      var ilLbl = document.getElementById('mg-iono-layer-label-' + ionoLayerNames[ili]);
      if (ilLbl) {
        var ilA = [-PI/6,0,PI/6][ili] + t*PI/41;
        ilLbl.setAttribute('x', (cx+ilR*Math.cos(ilA)+4).toFixed(1));
        ilLbl.setAttribute('y', (cy+ilR*Math.sin(ilA)+1).toFixed(1));
        ilLbl.setAttribute('opacity', (0.03+0.06*perturb).toFixed(3));
      }
    }
    for (var iti = 0; iti < 5; iti++) {
      var itEl = document.getElementById('mg-iono-transit-' + iti);
      if (itEl) {
        var itrt = ioRoutes[iti];
        var itA1=(itrt.from/180)*PI+t*PI/23, itA2=(itrt.to/180)*PI+t*PI/23;
        var itF = (Math.sin(t*PI/(iti*1.7+2.3))+1)/2;
        var itA = itA1 + (itA2-itA1)*itF;
        var itAlt = R*(0.82+0.08*Math.sin(t*PI/(iti+3)));
        itEl.setAttribute('cx', (cx+itAlt*Math.cos(itA)).toFixed(1));
        itEl.setAttribute('cy', (cy+itAlt*Math.sin(itA)).toFixed(1));
        itEl.setAttribute('opacity', (0.05+0.12*perturb).toFixed(3));
      }
    }
    for (var rfi = 0; rfi < 5; rfi++) {
      var rfEl = document.getElementById('mg-refract-' + rfi);
      if (rfEl) {
        var rfA = (ioRoutes[rfi].from/180)*PI+t*PI/23;
        rfEl.setAttribute('cx', (cx+R*0.94*Math.cos(rfA)).toFixed(1));
        rfEl.setAttribute('cy', (cy+R*0.94*Math.sin(rfA)).toFixed(1));
        var rfFlick = 0.5+0.5*Math.sin(t*PI*(rfi+5));
        rfEl.setAttribute('opacity', (0.04*rfFlick*perturb).toFixed(3));
        rfEl.setAttribute('r', (0.8+rfFlick*1.2).toFixed(1));
      }
    }
    var compressOuter = R * 6 / (2*PI);
    for (var cpi = 0; cpi < 3; cpi++) {
      var cpEl = document.getElementById('mg-compress-' + cpi);
      if (cpEl) {
        var cpPhase = ((t*0.25+cpi/3)%1);
        cpEl.setAttribute('r', Math.max(compressOuter*(1-cpPhase),2).toFixed(1));
        cpEl.setAttribute('stroke-opacity', (0.03*(0.3+0.7*cpPhase)*perturb).toFixed(4));
        cpEl.setAttribute('stroke-width', (0.3+cpPhase*0.6).toFixed(1));
      }
    }
    for (var pwi = 0; pwi < 3; pwi++) {
      var pwEl = document.getElementById('mg-predict-' + pwi);
      if (pwEl) {
        var pwPhase = ((t*0.18+pwi/3)%1);
        pwEl.setAttribute('r', (R*(1-pwPhase*0.25)).toFixed(1));
        pwEl.setAttribute('stroke-opacity', (0.03*(1-pwPhase)*perturb).toFixed(4));
      }
    }
  }

  // ═══ STATS + SHAPES + FINGERPRINT + PIN + PRIMES ═══
  function animStats(ac) {
    var t = ac.t, perturb = ac.perturb, liveStats = ac.liveStats;
    var PANELS = mc.PANELS, DIM_SHAPES = mc.DIM_SHAPES, aliveSet = mc.aliveSet;
    var statData = [
      {id:'rps',      text: liveStats.rps > 0 ? liveStats.rps.toFixed(0)+' rps' : ''},
      {id:'fleet',    text: liveStats.fleetPct > 0 ? liveStats.fleetPct.toFixed(1)+'% fleet' : ''},
      {id:'humans',   text: liveStats.humanIps > 0 ? liveStats.humanIps.toLocaleString()+' humans' : ''},
      {id:'entities', text: liveStats.entityCount > 0 ? liveStats.entityCount+' entities' : ''},
      {id:'total',    text: liveStats.totalReqs > 0 ? (liveStats.totalReqs/1000).toFixed(0)+'k total' : ''},
      {id:'alive',    text: liveStats.aliveCount > 0 ? liveStats.aliveCount+'/'+PANELS.length+' alive' : ''}
    ];
    for (var stdi = 0; stdi < statData.length; stdi++) {
      var stdEl = document.getElementById('mg-stat-' + statData[stdi].id);
      if (stdEl) {
        var stdAngle = stdi * TAU / 6 + t * PI / 29;
        stdEl.setAttribute('x', (cx+R*0.86*Math.cos(stdAngle)).toFixed(1));
        stdEl.setAttribute('y', (cy+R*0.86*Math.sin(stdAngle)).toFixed(1));
        stdEl.textContent = statData[stdi].text;
        stdEl.setAttribute('opacity', (statData[stdi].text ? 0.06+0.10*perturb : 0).toFixed(3));
      }
    }
    // Dim shapes orbit
    for (var dsa = 0; dsa < 4; dsa++) {
      var dsDim = [1,2,3,4][dsa];
      var dsR = Math.min(R*Math.pow(PI,dsDim/2)/(PI*PI)*1.8, R*0.94);
      var dsAngle = dsa*TAU/4 + t*PI/(dsDim*7+3);
      var dsEl = document.getElementById('mg-dim-shape-' + dsDim);
      if (dsEl) {
        dsEl.setAttribute('x', (cx+dsR*Math.cos(dsAngle)).toFixed(1));
        dsEl.setAttribute('y', (cy+dsR*Math.sin(dsAngle)).toFixed(1));
        var dsAlive = 0;
        DIM_SHAPES[dsa].names.forEach(function(n) { if (aliveSet.has(n)) dsAlive++; });
        dsEl.setAttribute('opacity', (0.04+0.12*(DIM_SHAPES[dsa].count>0?dsAlive/DIM_SHAPES[dsa].count:0)*perturb).toFixed(3));
      }
      var dsCnt = document.getElementById('mg-dim-count-' + dsDim);
      if (dsCnt) {
        dsCnt.setAttribute('x', (cx+dsR*Math.cos(dsAngle)+5).toFixed(1));
        dsCnt.setAttribute('y', (cy+dsR*Math.sin(dsAngle)-4).toFixed(1));
        dsCnt.setAttribute('opacity', (0.03+0.08*perturb).toFixed(3));
      }
    }
    // Label drift
    var matterLbl = document.getElementById('mg-matter-label');
    if (matterLbl) {
      var mlA = -PI/2+t*PI/41;
      matterLbl.setAttribute('x', (cx+R*0.86*Math.cos(mlA)).toFixed(1));
      matterLbl.setAttribute('y', (cy+R*0.86*Math.sin(mlA)).toFixed(1));
      matterLbl.setAttribute('opacity', (0.04+0.10*perturb).toFixed(3));
    }
    var kernelLbl = document.getElementById('mg-kernel-label');
    if (kernelLbl) {
      var klA = PI/2+t*PI/41;
      kernelLbl.setAttribute('x', (cx+R*0.86*Math.cos(klA)).toFixed(1));
      kernelLbl.setAttribute('y', (cy+R*0.86*Math.sin(klA)).toFixed(1));
      kernelLbl.setAttribute('opacity', (0.04+0.10*perturb).toFixed(3));
    }
    // Fingerprint dots
    var fpSeeds = [2,3,5,7,11,13,17];
    for (var fpi = 0; fpi < 7; fpi++) {
      var fpEl = document.getElementById('mg-fp-dot-' + fpi);
      if (fpEl) {
        var fpP = fpSeeds[fpi];
        var fpAngle = fpP*(PI-3)*TAU + t*PI/(fpP+7);
        var fpR = R*(0.1+fpP/31*0.5)*(0.3+0.7*perturb);
        fpEl.setAttribute('cx', (cx+fpR*Math.cos(fpAngle)).toFixed(1));
        fpEl.setAttribute('cy', (cy+fpR*Math.sin(fpAngle)).toFixed(1));
        fpEl.setAttribute('opacity', (0.05+0.08*perturb).toFixed(3));
      }
    }
    // Pin + primes
    var pinEl = document.getElementById('mg-pin');
    if (pinEl) {
      pinEl.setAttribute('opacity', (0.5+0.4*(1-perturb)).toFixed(2));
      pinEl.setAttribute('r', (1+perturb*0.5).toFixed(1));
    }
    var pinRing = document.getElementById('mg-pin-ring');
    if (pinRing) {
      pinRing.setAttribute('r', (3+perturb*4).toFixed(1));
      pinRing.setAttribute('stroke-opacity', (0.3*(1-perturb*0.7)).toFixed(3));
    }
    var observerFrac = PI - 3;
    var PRIMES = [2,3,5,7,11,13,17,19,23,29,31];
    for (var pri = 0; pri < PRIMES.length; pri++) {
      var prP = PRIMES[pri];
      var prEl = document.getElementById('mg-prime-' + prP);
      if (prEl) {
        var prAngle = prP*observerFrac*TAU + t*PI/(prP*3);
        var prPulse = 0.5+0.5*Math.sin(t*PI/prP);
        var prLen = R*0.4*prPulse*perturb;
        prEl.setAttribute('x1', (cx+6*Math.cos(prAngle)).toFixed(1));
        prEl.setAttribute('y1', (cy+6*Math.sin(prAngle)).toFixed(1));
        prEl.setAttribute('x2', (cx+prLen*Math.cos(prAngle)).toFixed(1));
        prEl.setAttribute('y2', (cy+prLen*Math.sin(prAngle)).toFixed(1));
        prEl.setAttribute('stroke-opacity', (0.05+prPulse*0.08*perturb).toFixed(3));
      }
    }
  }

  // ═══ RING: facets + digits + Gaia + cones + tails ═══
  function animRing(ac) {
    var t = ac.t, perturb = ac.perturb;
    var bodyIds = ['is','was','willbe'];
    var bodyPositions = ac.bodyPositions, bodyAngles = ac.bodyAngles, BR = ac.BR;
    // Facets
    var ringDrift = t * PI / 31;
    for (var fai = 0; fai < 15; fai++) {
      var faEl = document.getElementById('mg-facet-' + fai);
      if (faEl) {
        var faBase = fai*TAU/15 + ringDrift;
        var faArc = TAU/15;
        var fa1 = faBase-faArc*0.45, fa2 = faBase+faArc*0.45;
        faEl.setAttribute('d',
          'M '+(cx+R*Math.cos(fa1)).toFixed(1)+' '+(cy+R*Math.sin(fa1)).toFixed(1)+
          ' A '+R+' '+R+' 0 0 1 '+(cx+R*Math.cos(fa2)).toFixed(1)+' '+(cy+R*Math.sin(fa2)).toFixed(1));
        faEl.setAttribute('stroke-opacity', (0.03+0.05*Math.sin(t*PI/(fai+2))*perturb).toFixed(3));
      }
      var faSym = document.getElementById('mg-facet-sym-' + fai);
      if (faSym) {
        var faSymA = fai*TAU/15 + ringDrift;
        faSym.setAttribute('x', (cx+(R+9)*Math.cos(faSymA)).toFixed(1));
        faSym.setAttribute('y', (cy+(R+9)*Math.sin(faSymA)).toFixed(1));
        faSym.setAttribute('opacity', (0.02+0.04*perturb).toFixed(3));
      }
    }
    // π digits
    for (var pdai = 0; pdai < 15; pdai++) {
      var pdaEl = document.getElementById('mg-pi-digit-' + pdai);
      if (pdaEl) {
        var pdaAngle = -PI/2+pdai*TAU/15+ringDrift;
        pdaEl.setAttribute('x', (cx+(R-7)*Math.cos(pdaAngle)).toFixed(1));
        pdaEl.setAttribute('y', (cy+(R-7)*Math.sin(pdaAngle)).toFixed(1));
        pdaEl.setAttribute('opacity', (0.02+0.05*perturb).toFixed(3));
      }
    }
    // Gaia rotation
    var gaiaRing = document.getElementById('mg-gaia-ring');
    var gaiaMarker = document.getElementById('mg-gaia-marker');
    if (gaiaRing && gaiaMarker) {
      var now24 = new Date();
      var utcHourFrac = (now24.getUTCHours()+now24.getUTCMinutes()/60+now24.getUTCSeconds()/3600)/24;
      var gaiaAngle = utcHourFrac*TAU - PI/2;
      gaiaMarker.setAttribute('cx', (cx+6*Math.cos(gaiaAngle)).toFixed(1));
      gaiaMarker.setAttribute('cy', (cy+6*Math.sin(gaiaAngle)).toFixed(1));
      gaiaMarker.setAttribute('opacity', (0.06+0.06*perturb).toFixed(2));
      gaiaRing.setAttribute('stroke-opacity', (0.04+0.04*perturb).toFixed(3));
    }
    var gaiaLabel = document.getElementById('mg-gaia-label');
    if (gaiaLabel) gaiaLabel.setAttribute('opacity', (0.03+0.05*perturb).toFixed(3));
    // Geodesic
    for (var gdai = 0; gdai < 6; gdai++) {
      var gdaEl = document.getElementById('mg-geodesic-' + gdai);
      if (gdaEl) {
        var gdaA1=gdai*TAU/6+t*PI/19, gdaA2=(gdai+1)*TAU/6+t*PI/19;
        var gdaR = 8+4*perturb;
        gdaEl.setAttribute('x1', (cx+gdaR*Math.cos(gdaA1)).toFixed(1));
        gdaEl.setAttribute('y1', (cy+gdaR*Math.sin(gdaA1)).toFixed(1));
        gdaEl.setAttribute('x2', (cx+gdaR*Math.cos(gdaA2)).toFixed(1));
        gdaEl.setAttribute('y2', (cy+gdaR*Math.sin(gdaA2)).toFixed(1));
        gdaEl.setAttribute('stroke-opacity', (0.03+0.04*perturb).toFixed(3));
      }
    }
    // Cones
    for (var ci = 0; ci < 3; ci++) {
      var coneEl = document.getElementById('mg-cone-' + bodyIds[ci]);
      if (coneEl) {
        var bp = bodyPositions[ci], ba = bodyAngles[ci];
        var coneW = 12*perturb;
        coneEl.setAttribute('points',
          cx.toFixed(1)+','+cy.toFixed(1)+' '+
          (bp.x+coneW*Math.cos(ba+PI/2)).toFixed(1)+','+(bp.y+coneW*Math.sin(ba+PI/2)).toFixed(1)+' '+
          (bp.x+coneW*Math.cos(ba-PI/2)).toFixed(1)+','+(bp.y+coneW*Math.sin(ba-PI/2)).toFixed(1));
        coneEl.setAttribute('fill-opacity', (0.10*perturb).toFixed(3));
        coneEl.setAttribute('stroke-opacity', (0.25*perturb).toFixed(3));
      }
    }
    // Comet tails
    for (var ci = 0; ci < 3; ci++) {
      for (var s = 0; s < 16; s++) {
        var tailEl = document.getElementById('mg-tail-' + bodyIds[ci] + '-' + s);
        if (tailEl) {
          var frac = (s+1)/16;
          var tailAngle = bodyAngles[ci] - frac*PI;
          tailEl.setAttribute('cx', (cx+BR*Math.cos(tailAngle)).toFixed(1));
          tailEl.setAttribute('cy', (cy+BR*Math.sin(tailAngle)).toFixed(1));
          tailEl.setAttribute('r', Math.max((3.5-frac*2.5)*perturb, 0.2).toFixed(1));
          tailEl.setAttribute('opacity', ((1-frac)*0.55*perturb).toFixed(3));
        }
      }
    }
  }

  // ═══ OVERLAY: triangle + labels + gordian + triangulation + pulse + GC ═══
  function animOverlay(ac) {
    var t = ac.t, perturb = ac.perturb, rps = ac.rps;
    var bodyPositions = ac.bodyPositions, bodyAngles = ac.bodyAngles;
    var bodyIds = ['is','was','willbe'];
    var dimCost = mc.dimCost, aliveSet = mc.aliveSet, geo = mc.geo;
    var pulses = mc.pulses;
    // Triangle path
    var tri = document.getElementById('mg-body-tri');
    if (tri && bodyPositions.length === 3) {
      var p0=bodyPositions[0], p1=bodyPositions[1], p2=bodyPositions[2];
      tri.setAttribute('d', 'M '+p0.x.toFixed(1)+' '+p0.y.toFixed(1)+
        ' L '+p1.x.toFixed(1)+' '+p1.y.toFixed(1)+
        ' L '+p2.x.toFixed(1)+' '+p2.y.toFixed(1)+' Z');
      tri.setAttribute('stroke-opacity', (0.12*perturb).toFixed(3));
    }
    // Edge labels
    var edgeIds = ['mg-edge-01','mg-edge-12','mg-edge-20'];
    var edgePairs = [[0,1],[1,2],[2,0]];
    for (var ei = 0; ei < 3; ei++) {
      var eEl = document.getElementById(edgeIds[ei]);
      if (eEl && bodyPositions.length === 3) {
        var ep0=bodyPositions[edgePairs[ei][0]], ep1=bodyPositions[edgePairs[ei][1]];
        eEl.setAttribute('x', ((ep0.x+ep1.x)/2).toFixed(1));
        eEl.setAttribute('y', ((ep0.y+ep1.y)/2).toFixed(1));
        eEl.setAttribute('opacity', (0.4*perturb).toFixed(2));
      }
    }
    // Perturbation + tempo label
    var pLabel = document.getElementById('mg-perturb-label');
    if (pLabel) {
      var tempoRatio = ac.meanReflexive / (TAU/3);
      pLabel.textContent = 'perturbation: '+perturb.toFixed(2)+
        '  \u00b7  tempo: '+tempoRatio.toFixed(3)+'\u03c0/3';
      pLabel.setAttribute('opacity', (0.2+0.15*perturb).toFixed(2));
    }
    var prod = document.getElementById('mg-product');
    if (prod) prod.setAttribute('opacity', (0.3+0.4*(1-perturb)).toFixed(2));
    // Gordian knot breathing
    var knotScale = 1.0+perturb*2.5, knotOp = 0.5*(1.0-perturb*0.7);
    for (var ki = 0; ki < 3; ki++) {
      var kEl = document.getElementById('mg-knot-' + bodyIds[ki]);
      if (kEl) {
        var kx=bodyPositions[ki].x, ky=bodyPositions[ki].y;
        kEl.setAttribute('cx', kx.toFixed(1)); kEl.setAttribute('cy', ky.toFixed(1));
        kEl.setAttribute('rx', (18*knotScale).toFixed(1));
        kEl.setAttribute('ry', (18*0.45*knotScale).toFixed(1));
        kEl.setAttribute('stroke-opacity', knotOp.toFixed(2));
        kEl.setAttribute('transform', 'rotate('+(ki*60)+' '+kx.toFixed(1)+' '+ky.toFixed(1)+')');
      }
    }
    var knotPi = document.getElementById('mg-knot-pi');
    if (knotPi) knotPi.setAttribute('opacity', (0.7*(1-perturb)).toFixed(2));
    var reflEl = document.getElementById('mg-reflection');
    if (reflEl) reflEl.setAttribute('opacity', (0.25*(1-perturb*0.8)).toFixed(2));
    var obsEl = document.getElementById('mg-observer');
    if (obsEl) obsEl.setAttribute('opacity', (0.2*(1-perturb*0.8)).toFixed(2));
    var pibEl = document.getElementById('mg-pi-body');
    if (pibEl) pibEl.setAttribute('opacity', (0.15*(1-perturb*0.8)).toFixed(2));
    // Triangulation lines
    var triLayer = document.getElementById('mg-triangulation');
    if (triLayer && bodyPositions.length === 3) {
      var bodyPosMap = {is:bodyPositions[0], was:bodyPositions[1], willbe:bodyPositions[2]};
      var triLines = triLayer.querySelectorAll('line');
      for (var ti = 0; ti < triLines.length; ti++) {
        var tl = triLines[ti], bid = tl.getAttribute('data-body');
        if (bid && bodyPosMap[bid]) {
          tl.setAttribute('x2', bodyPosMap[bid].x.toFixed(1));
          tl.setAttribute('y2', bodyPosMap[bid].y.toFixed(1));
        }
      }
    }
    // Pulse decay
    Object.keys(pulses).forEach(function(pid) {
      var p = pulses[pid]; p.scale *= p.decay;
      if (p.scale<1.05) { delete pulses[pid]; var d=document.getElementById('mg-dot-'+pid); if(d&&aliveSet.has(pid)) d.setAttribute('filter','url(#mg-glow)'); return; }
      var d = document.getElementById('mg-dot-'+pid);
      if (d) { var g=geo[pid]; var br=g?Math.max(5-(1/dimCost(g.dim))*2,2):3; d.setAttribute('r',(br*p.scale).toFixed(1)); }
    });
    // Great circle drift
    var gcRot = t;
    ['is','was','willbe'].forEach(function(b, i) {
      var gc = document.getElementById('mg-gc-'+b);
      if (gc) gc.setAttribute('transform', 'rotate('+((gcRot+i*120)%360).toFixed(1)+' '+cx+' '+cy+')');
    });
    // Alive count
    var ac2 = document.getElementById('mg-alive-count');
    if (ac2) { var l=aliveSet.size+'/'+mc.PANELS.length+' alive'; if(rps>0) l+=' \u00b7 '+rps.toFixed(1)+' rps'; ac2.textContent=l; }
  }

  // ═══════════════════════════════════════════════════════════
  // MAIN ANIMATE: orchestrates all animation helpers per frame.
  // ═══════════════════════════════════════════════════════════
  window._membraneAnimate = function(_mc, now) {
    mc = _mc;
    PI = mc.PI; TAU = 2 * PI;
    var MG = mc.MG;
    cx = MG.cx; cy = MG.cy; R = MG.R;

    var dt = mc.lastFrame ? (now - mc.lastFrame) / 1000 : 0.016;
    if (dt > 0.1) dt = 0.1;

    animParticles(dt);
    var ac = computeContext(now);
    animLayers(ac, now);
    animBodies(ac);
    animBump(ac);
    animEpitopes(ac);
    animDepth(ac);
    animLattice(ac);
    animStress(ac);
    animHelix(ac);
    animConvergeIono(ac);
    animStats(ac);

    // Stash context for ext sections
    mc._ac = {
      cx:cx, cy:cy, R:R, BR:ac.BR, PI:PI, TAU:TAU, t:ac.t, dt:dt,
      perturb:ac.perturb, omega_is:ac.omega_is, omega_was:ac.omega_was, omega_willbe:ac.omega_willbe,
      bodyPositions:ac.bodyPositions, bodyAngles:ac.bodyAngles, rps:ac.rps,
      focalJitterX:ac.focalJitterX, focalJitterY:ac.focalJitterY, breathScale:ac.breathScale,
      antiPositions:ac.antiPositions, antiBR:ac.antiBR,
      prevDash:ac.prevDash, liveStats:ac.liveStats, willbeT:ac.willbeT, smoothT:ac.smoothT, easeT:ac.easeT,
      lerp:lerp, sinePerturb:ac.sinePerturb, wasDash:ac.wasDash
    };
    if (window._membraneAnimateExt) window._membraneAnimateExt(mc, now);

    // Post-ext animations (ring rotation, cones, tails, gordian)
    animRing(ac);
    animOverlay(ac);

    mc.lastFrame = now;
  };
})();
