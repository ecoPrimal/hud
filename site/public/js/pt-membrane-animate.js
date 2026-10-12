// pt-membrane-animate.js — animation loop for the membrane.
// RPS IS rotation. π/rate = flip time. Null and ∞ are the same through π.
// The maze increases diffraction → ∞. More leak, less impact per leak.
window._membraneAnimate = function(mc, now) {
  var PI=mc.PI, el=mc.el, MG=mc.MG, PANELS=mc.PANELS;
  var CAT_COLORS=mc.CAT_COLORS, DIM_SHAPES=mc.DIM_SHAPES;
  var aliveSet=mc.aliveSet, liveStats=mc.liveStats;
  var particles=mc.particles, pulses=mc.pulses, arcGlow=mc.arcGlow;
  var geo=mc.geo, CATS=mc.CATS, catAccum=mc.catAccum, rates=mc.rates;
  var MAX_P=mc.MAX_P, dimCost=mc.dimCost, spawnParticle=mc.spawnParticle, pulse=mc.pulse;
  var rps=mc.rpsVal, prevDash=mc.prevDashVal, livePerturb=mc.livePerturb;
  var TIERS=mc.TIERS;
    // Numeric lerp: a + (b-a)*t. Returns a if b is missing.
    function lerp(a, b, t) {
      if (typeof b !== 'number') return a;
      if (typeof a !== 'number') return b;
      return a + (b - a) * t;
    }
    var dt = mc.lastFrame ? (now-mc.lastFrame)/1000 : 0.016;
    if (dt > 0.1) dt = 0.1;
    var cx=MG.cx, cy=MG.cy, R=MG.R;
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
    particles.forEach(function(p, i) {
      p.r -= p.speed*dt;
      if (p.r > R+10) p.opacity = Math.min(p.opacity+dt*3, 0.85);
      else if (p.r > R-5) { p.opacity=1; p.size*=1+dt*2; }
      else { p.opacity = Math.max(p.opacity-dt*2.5, 0); p.size = Math.max(p.size-dt*2, 0.5); }
      if (p.r<=p.targetR || p.opacity<=0.01) {
        rm.push(i); pulse(p.id);
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

    // Coil rotation — shows the mixing in motion
    var coilRot = (now * 0.003) % 360;
    var coilEl = document.getElementById('mg-coil');
    if (coilEl) coilEl.setAttribute('transform', 'rotate('+coilRot.toFixed(1)+' '+cx+' '+cy+')');

    // ── Layer counter-rotation: base angles (no jitter yet — perturb not computed) ──
    var ringOmega = PI / 31; // ⌊π³⌋ = 31 budget
    var tSec = now * 0.001;
    var wasRot = (tSec * ringOmega * 180 / PI) % 360;
    var isRot = (-tSec * PI / 7 * 180 / PI) % 360; // counter: fastest backward
    var willbeRot = (tSec * PI / 11 * 180 / PI * 0.5) % 360; // half-speed forward

    // ═══ PERTURBATION BREATHING + ANGULAR ROTATION ═══
    // Each body rotates independently at its own angular velocity.
    // IS is fastest (it's NOW, always moving).
    // WAS is slowest (it's settled, conserved).
    // WILLBE is middle (emerging, not yet observed).
    //
    // The relative angle between any two bodies at any moment = the reflexive angle.
    // When two bodies align (reflexive angle = 0) = a "bump" = a signal event.
    // The rate of these alignments approaches π.
    //
    // t = π. Time IS the normalization constant.
    // Cellular life wasn't 2 things bumping — it was π things
    // aligning at the moment of reality.
    var TAU = 2 * PI;
    var breathRate = TAU / 12;
    var sinePerturb = (Math.sin(now * 0.001 * breathRate - PI/2) + 1) / 2;

    // ── IS×WAS×WILLBE temporal interpolation ──
    // willbeT: 0 right after fetch (pure IS), approaches 1 at next fetch (predicting WILLBE).
    // The jitter at willbeT→1 IS the prediction uncertainty — the tear between IS and WILLBE.
    // This replaces the hard snap-then-freeze pattern.
    var wasDash = mc.wasDash ? mc.wasDash() : null;
    var isDash = mc.isDash ? mc.isDash() : null;
    var fetchTs = mc.fetchTs ? mc.fetchTs() : 0;
    var fetchInterval = mc.fetchInterval || 15000;
    var willbeT = fetchTs > 0 ? Math.min(1.0, (now - fetchTs) / fetchInterval) : 0;

    // Smooth perturbation: lerp from WAS→IS, with easing
    // Early in cycle: mostly IS (smooth). Late: prediction tension increases.
    var easeT = willbeT * willbeT; // quadratic ease-in: calm at start, tense at end
    var smoothT = willbeT < 0.1 ? willbeT * 10 : 1; // snap in first 10%, then stable
    var wasPerturb = wasDash && wasDash.null_dimension ? wasDash.null_dimension.perturbation : -1;
    var isPerturb = livePerturb;
    var perturb;
    if (isPerturb >= 0 && wasPerturb >= 0) {
      // Interpolate: start at IS value, drift toward WAS×IS average as we predict
      var basePerturb = isPerturb;
      var drift = (isPerturb - wasPerturb) * easeT * 0.3; // gentle prediction drift
      perturb = Math.max(0, Math.min(1, basePerturb + drift));
      // Add breath at WILLBE end — the uncertainty shimmers
      perturb += sinePerturb * easeT * 0.08;
    } else if (isPerturb >= 0) {
      perturb = isPerturb + sinePerturb * easeT * 0.05;
    } else {
      perturb = sinePerturb;
    }
    var BR = R * (PI/8) * perturb;

    // ── Layer jitter + reflective jitter (perturb is now computed) ──
    // Object jitter: perturbation-driven tremor per layer, coprime frequencies
    var jitterAmp = perturb * 1.2;
    var wasJitter = Math.sin(tSec * 3.7) * jitterAmp;
    var isJitter = Math.sin(tSec * 5.3 + 1.0) * jitterAmp;
    var willbeJitter = Math.sin(tSec * 4.1 + 2.0) * jitterAmp;

    // Reflective jitter: the focal (center) trembles with the sum
    // The observer doesn't sit still — observation disturbs the observer
    var focalJitterX = (Math.sin(tSec * 2.3) * jitterAmp * 0.4);
    var focalJitterY = (Math.cos(tSec * 3.1) * jitterAmp * 0.4);

    // Apply counter-rotation + jitter to each layer
    // WAS rotates slowest forward. IS rotates fastest backward. WILLBE half-speed forward.
    var wasEl = document.getElementById('mg-was');
    if (wasEl) wasEl.setAttribute('transform',
      'rotate('+(wasRot + wasJitter).toFixed(1)+' '+cx+' '+cy+')');
    var isEl = document.getElementById('mg-is');
    if (isEl) isEl.setAttribute('transform',
      'rotate('+(isRot + isJitter).toFixed(1)+' '+cx+' '+cy+')');
    var willbeEl = document.getElementById('mg-willbe');
    if (willbeEl) willbeEl.setAttribute('transform',
      'rotate('+(willbeRot + willbeJitter).toFixed(1)+' '+cx+' '+cy+')');

    // ── Null space breathes: the center of [∅]D is alive ──
    // The pin expands/contracts with perturbation breathing.
    var breathScale = 1.0 + sinePerturb * perturb * 0.6;
    var pinEl = document.getElementById('mg-pin');
    if (pinEl) pinEl.setAttribute('r', (1.5 * breathScale).toFixed(2));
    var pinRingEl = document.getElementById('mg-pin-ring');
    if (pinRingEl) {
      pinRingEl.setAttribute('r', (4 * breathScale).toFixed(2));
      pinRingEl.setAttribute('stroke-opacity', (0.15 + 0.15 * sinePerturb * perturb).toFixed(3));
    }
    var nullLabel = document.getElementById('mg-null-label');
    if (nullLabel) {
      nullLabel.setAttribute('x', (cx + focalJitterX).toFixed(1));
      nullLabel.setAttribute('y', (cy - 48 + focalJitterY).toFixed(1));
    }

    // ── Evolve tier alive status from live data ──
    // When NullDimension data arrives, ∅ tier goes alive.
    // When bingo/anderson fields appear in dashboard, those tiers light up.
    // The dead zone shrinks as we wire the missing bridges.
    TIERS[0].alive = livePerturb >= 0 ? 1 : 0;  // ∅: alive when NullDimension data arrives
    // Tiers 5-7 evolve when their Rust modules start emitting to dashboard.json
    // For now: check if the dashboard has the fields (set in ingest)
    TIERS[5].alive = prevDash && prevDash.anderson_selectivity ? 1 : 0;  // lattice: Anderson
    TIERS[6].alive = prevDash && prevDash.bingo_cube_summary ? 1 : 0;    // helix: Bingo
    TIERS[7].alive = prevDash && prevDash.membrane_geometry ? 1 : 0;     // cell: membrane stack
    TIERS[8].alive = liveStats.aliveCount > 14 ? 1 : 0; // Earth: >50% panels alive

    // ── Angular velocities: 3 independent wheels ──
    // IS:     fastest — π/7  rad/s (completes a cycle in 14s)
    // WILLBE: middle  — π/11 rad/s (completes in 22s)
    // WAS:    slowest — π/17 rad/s (completes in 34s)
    // Ratios: 17:11:7 — coprime. The wheels never lock.
    // The system is aperiodic — it never exactly repeats.
    // That's the three-body problem: deterministic chaos.
    var t = tSec; // seconds (= now * 0.001, computed above for layer rotation)
    var omega_is     = PI / 7;   // fastest — the NOW
    var omega_willbe = PI / 11;  // middle — the emerging
    var omega_was    = PI / 17;  // slowest — the settled

    // Base angles: start at equilateral (120° apart), then rotate independently
    var baseAngles = [-PI/2, -PI/2 + TAU/3, -PI/2 + 2*TAU/3];
    var angularOffsets = [
      omega_is * t,       // IS rotates fastest
      omega_was * t,      // WAS rotates slowest
      omega_willbe * t    // WILLBE in between
    ];

    var bodyAngles = [
      baseAngles[0] + angularOffsets[0],
      baseAngles[1] + angularOffsets[1],
      baseAngles[2] + angularOffsets[2]
    ];
    var bodyIds = ['is','was','willbe'];
    var bodyPositions = [];

    // ── Reflexive angles: angular distance between each pair ──
    // When a reflexive angle crosses 0 = alignment = "bump"
    var reflexive01 = ((bodyAngles[0] - bodyAngles[1]) % TAU + TAU) % TAU;
    var reflexive12 = ((bodyAngles[1] - bodyAngles[2]) % TAU + TAU) % TAU;
    var reflexive20 = ((bodyAngles[2] - bodyAngles[0]) % TAU + TAU) % TAU;
    // Mean reflexive angle: at equilibrium = 2π/3. Deviation = tempo shift.
    var meanReflexive = (reflexive01 + reflexive12 + reflexive20) / 3;

    for (var bi = 0; bi < 3; bi++) {
      var bx = cx + BR * Math.cos(bodyAngles[bi]);
      var by = cy + BR * Math.sin(bodyAngles[bi]);
      bodyPositions.push({x:bx, y:by});

      // Move all elements for this body
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

    // ── THE BUMP: recognition when bodies align ──
    // Three entities bumped in the forest. Paused. Turned. "IS THAT ME?"
    // The moment of self-awareness. The membrane forms at the bump.
    // Jitter goes both ways. The tick IS life.

    // Detect closest alignment between any two bodies
    var ref01 = reflexive01 > PI ? TAU - reflexive01 : reflexive01;
    var ref12 = reflexive12 > PI ? TAU - reflexive12 : reflexive12;
    var ref20 = reflexive20 > PI ? TAU - reflexive20 : reflexive20;
    var minRef = Math.min(ref01, ref12, ref20);
    var bumpProx = Math.max(0, 1 - minRef / (PI / 4)); // near alignment

    // Recognition flash — pulse of "is that me?"
    var recogEl = document.getElementById('mg-recognition');
    if (recogEl) {
      var recogR = R * 0.15 * (1 + bumpProx * 0.8);
      recogEl.setAttribute('r', recogR.toFixed(1));
      recogEl.setAttribute('stroke-opacity',
        (bumpProx * bumpProx * 0.35 * perturb).toFixed(3));
      recogEl.setAttribute('stroke-width', (0.5 + bumpProx * 1.5).toFixed(1));
    }
    var recogText = document.getElementById('mg-recognition-text');
    if (recogText) {
      recogText.setAttribute('opacity',
        (bumpProx * bumpProx * 0.30 * perturb).toFixed(3));
      // At very high proximity, shift to "OH SHIT IS THAT ME?"
      if (bumpProx > 0.85) {
        recogText.textContent = 'OH SHIT IS THAT ME?';
      } else if (bumpProx > 0.5) {
        recogText.textContent = 'is that me?';
      } else {
        recogText.textContent = '';
      }
    }

    // Movement phase — ground → lift → jump → fly
    // Mapped to perturbation cycle. The breathing IS movement.
    // Stuck on ground (perturb ≈ 0). Lift on 1 leg (rising).
    // Jump (mid-air, scan). Flying (peak, evolved). Land (falling back).
    var phaseEl = document.getElementById('mg-phase-label');
    if (phaseEl) {
      var phase;
      if (perturb < 0.15) phase = 'ground \u23F8';
      else if (perturb < 0.35) phase = 'lift \u2191';
      else if (perturb < 0.55) phase = 'jump \u2197';
      else if (perturb < 0.80) phase = 'fly \u2191\u2191';
      else phase = 'soar \u2B06';
      phaseEl.textContent = phase;
      phaseEl.setAttribute('opacity', (0.04 + 0.10 * perturb).toFixed(3));
    }

    // Bidirectional jitter — life goes BOTH WAYS
    // 4 paired dots: one moves up/out, the other down/in.
    // The oscillation IS the tick. The tick IS life.
    for (var bjia = 0; bjia < 4; bjia++) {
      var bjAngle = bjia * TAU / 4 + t * PI / 5;
      var bjAmp = 4 * perturb * Math.sin(t * PI * (bjia + 3));
      var bjR = R * 0.5;
      // Up dot — moves outward
      var bjUp = document.getElementById('mg-jitter-up-' + bjia);
      if (bjUp) {
        bjUp.setAttribute('cx',
          (cx + (bjR + bjAmp) * Math.cos(bjAngle)).toFixed(1));
        bjUp.setAttribute('cy',
          (cy + (bjR + bjAmp) * Math.sin(bjAngle)).toFixed(1));
        bjUp.setAttribute('opacity', (0.03 + 0.06 * perturb).toFixed(3));
      }
      // Down dot — moves inward (opposite direction)
      var bjDn = document.getElementById('mg-jitter-down-' + bjia);
      if (bjDn) {
        bjDn.setAttribute('cx',
          (cx + (bjR - bjAmp) * Math.cos(bjAngle)).toFixed(1));
        bjDn.setAttribute('cy',
          (cy + (bjR - bjAmp) * Math.sin(bjAngle)).toFixed(1));
        bjDn.setAttribute('opacity', (0.03 + 0.06 * perturb).toFixed(3));
      }
    }

    // ── Epitope orbits: 9 markers on 3 rings, reverse torsion ──
    // Ring 1 (R/π): forward. Ring 2 (R/√π): REVERSE. Ring 3 (2R/π): forward.
    // Stiff epitopes hold angle. Elastic epitopes oscillate.
    // Ring 3 mirrors Ring 1 — reflections facing across [∅]D.
    var epiOmegas9 = [omega_is, omega_willbe, omega_was,
                      omega_is, omega_willbe, omega_was,
                      omega_is, omega_willbe, omega_was];
    var oRadii9 = [R/PI, R/PI, R/PI,
                   R/Math.sqrt(PI), R/Math.sqrt(PI), R/Math.sqrt(PI),
                   R*2/PI, R*2/PI, R*2/PI];
    var oTorsion9 = [1,1,1, -1,-1,-1, 1,1,1]; // ring 2 reverses
    var oStiff9 = [true,false,true, false,true,false, true,false,true];

    for (var oi = 0; oi < 9; oi++) {
      var oBaseAngle = (oi % 3) * TAU / 3;
      var oTorque = oTorsion9[oi];
      var oAngle = oBaseAngle + epiOmegas9[oi] * t * oTorque;
      var stiff = oStiff9[oi];

      // Elastic epitopes oscillate ±π/12 around their base orbit
      if (!stiff) {
        oAngle += Math.sin(t * PI * 2.3) * (PI / 12);
      }

      var oR = oRadii9[oi];
      var ox = cx + oR * Math.cos(oAngle);
      var oy = cy + oR * Math.sin(oAngle);

      var eDot = document.getElementById('mg-epi-' + oi);
      if (eDot) {
        eDot.setAttribute('cx', ox.toFixed(1));
        eDot.setAttribute('cy', oy.toFixed(1));
      }

      // Stiff crosshairs — rigid lines at fixed angle relative to orbit
      if (stiff) {
        var crossLen = 5;
        var ch = document.getElementById('mg-epi-cross-h-' + oi);
        var cv = document.getElementById('mg-epi-cross-v-' + oi);
        if (ch) {
          ch.setAttribute('x1', (ox - crossLen).toFixed(1));
          ch.setAttribute('y1', oy.toFixed(1));
          ch.setAttribute('x2', (ox + crossLen).toFixed(1));
          ch.setAttribute('y2', oy.toFixed(1));
        }
        if (cv) {
          cv.setAttribute('x1', ox.toFixed(1));
          cv.setAttribute('y1', (oy - crossLen).toFixed(1));
          cv.setAttribute('x2', ox.toFixed(1));
          cv.setAttribute('y2', (oy + crossLen).toFixed(1));
        }
      } else {
        // Elastic spring ring — breathes with perturbation
        var spring = document.getElementById('mg-epi-spring-' + oi);
        if (spring) {
          spring.setAttribute('cx', ox.toFixed(1));
          spring.setAttribute('cy', oy.toFixed(1));
          var springR = 4 + Math.sin(t * PI * 1.7) * 2 * perturb;
          spring.setAttribute('r', springR.toFixed(1));
        }
      }

      var eLabel = document.getElementById('mg-epi-label-' + oi);
      if (eLabel) {
        eLabel.setAttribute('x', ox.toFixed(1));
        eLabel.setAttribute('y', (oy - 7).toFixed(1));
      }
      var eName = document.getElementById('mg-epi-name-' + oi);
      if (eName) {
        eName.setAttribute('x', ox.toFixed(1));
        eName.setAttribute('y', (oy + 8).toFixed(1));
      }
    }

    // ── Depth spiral: observer→negate→null→awareness→ghost→celestial→geodesic ──
    // Epicyclic chain: each layer orbits the previous.
    // π torque π: offset π between layers, rate π per layer.
    // At singularity: tight coil at center (all layers collapsed).
    // At perturbation: contorting chain radiating from [∅]D.
    var depthPos = [{x: cx, y: cy}]; // center = anchor
    for (var di = 0; di < 7; di++) {
      var dprev = depthPos[di];
      var dR = (4 + di * 1.5) * perturb; // inner layers tight, outer layers wide
      var dRate = PI * (1 + di * 0.13);   // each layer slightly faster — never locks
      var dAngle = t * dRate + di * PI;   // π offset between layers (torque)
      var ddx = dprev.x + dR * Math.cos(dAngle);
      var ddy = dprev.y + dR * Math.sin(dAngle);
      depthPos.push({x: ddx, y: ddy});

      var dDot = document.getElementById('mg-depth-' + di);
      if (dDot) {
        dDot.setAttribute('cx', ddx.toFixed(1));
        dDot.setAttribute('cy', ddy.toFixed(1));
        dDot.setAttribute('opacity', (0.4 + 0.3 * perturb).toFixed(2));
      }
      var dLabel = document.getElementById('mg-depth-label-' + di);
      if (dLabel) {
        dLabel.setAttribute('x', (ddx + 6).toFixed(1));
        dLabel.setAttribute('y', ddy.toFixed(1));
        dLabel.setAttribute('opacity', (0.15 + 0.1 * (1 - perturb)).toFixed(2));
      }
      var dLink = document.getElementById('mg-depth-link-' + di);
      if (dLink) {
        dLink.setAttribute('x1', dprev.x.toFixed(1));
        dLink.setAttribute('y1', dprev.y.toFixed(1));
        dLink.setAttribute('x2', ddx.toFixed(1));
        dLink.setAttribute('y2', ddy.toFixed(1));
        dLink.setAttribute('stroke-opacity', (0.15 * perturb).toFixed(3));
      }
    }

    // ── Interstitial P-space: lattice breathing ──
    // Pressure shells expand/contract with perturbation.
    // Nodes orbit slowly along their shells — tectonic drift of matter.
    // Apertures dilate when bodies pass — the hole opens.
    // Elements brighten with body proximity — pressure wave propagation.
    // Rate per shell: π/(37 + s×11) — coprime, never locks.
    var latticePos = [];
    for (var lsi = 0; lsi < 6; lsi++) {
      var lsr = R * (lsi + 1) / (2 * PI);
      var lShellR = lsr * (0.85 + 0.15 * perturb);
      var lShellEl = document.getElementById('mg-pshell-' + lsi);
      if (lShellEl) lShellEl.setAttribute('r', lShellR.toFixed(1));

      var lPressure = 1 - (lsi / 6);
      for (var lni = 0; lni < 3; lni++) {
        var lIdx = lsi * 3 + lni;
        // Slow drift along shell — each shell at its own rate
        var lAngle = lni * TAU / 3 + lsi * PI / 6 + t * PI / (37 + lsi * 11);
        var lnx = cx + lShellR * Math.cos(lAngle);
        var lny = cy + lShellR * Math.sin(lAngle);
        latticePos.push({x:lnx, y:lny});

        // Body proximity → pressure wave (matter feels the bodies pass)
        var lProx = 0;
        for (var lbi = 0; lbi < bodyPositions.length; lbi++) {
          var ldx = lnx - bodyPositions[lbi].x;
          var ldy = lny - bodyPositions[lbi].y;
          var lDist = Math.sqrt(ldx*ldx + ldy*ldy);
          if (lDist < 40) lProx = Math.max(lProx, 1 - lDist/40);
        }

        var lNodeEl = document.getElementById('mg-lnode-' + lIdx);
        var lIsAperture = (lIdx % 4) === 0;
        if (lNodeEl) {
          lNodeEl.setAttribute('cx', lnx.toFixed(1));
          lNodeEl.setAttribute('cy', lny.toFixed(1));
          if (lIsAperture) {
            // Aperture: dilates with proximity — the pupil opens
            var laR = 2 + lPressure * 2 + lProx * 3;
            lNodeEl.setAttribute('r', laR.toFixed(1));
            lNodeEl.setAttribute('stroke-opacity', (0.12 + lProx * 0.25).toFixed(3));
          } else {
            // Solid: brightens with proximity — pressure wave illuminates
            lNodeEl.setAttribute('opacity', (0.06 + lPressure * 0.10 + lProx * 0.2).toFixed(3));
          }
        }
        // Aperture π symbol tracks the node
        var lSymEl = document.getElementById('mg-lnode-sym-' + lIdx);
        if (lSymEl) {
          lSymEl.setAttribute('x', lnx.toFixed(1));
          lSymEl.setAttribute('y', (lny + 1).toFixed(1));
          lSymEl.setAttribute('opacity', (0.08 + lProx * 0.15).toFixed(3));
        }
      }
    }

    // Update braid connections — the helical weave drifts with the nodes
    for (var bsi = 0; bsi < 5; bsi++) {
      for (var bni = 0; bni < 3; bni++) {
        var bFromIdx = bsi * 3 + bni;
        var bToIdx = (bsi + 1) * 3 + ((bni + 1) % 3);
        var bFrom = latticePos[bFromIdx];
        var bTo = latticePos[bToIdx];
        var braidEl = document.getElementById('mg-braid-' + bFromIdx + '-' + bToIdx);
        if (braidEl && bFrom && bTo) {
          braidEl.setAttribute('x1', bFrom.x.toFixed(1));
          braidEl.setAttribute('y1', bFrom.y.toFixed(1));
          braidEl.setAttribute('x2', bTo.x.toFixed(1));
          braidEl.setAttribute('y2', bTo.y.toFixed(1));
        }
      }
    }

    // ── Membrane stress: jitter, tear, rip, warp ──
    // The membrane deforms under observation. Bodies pull on the ring.
    // Jitter amplitude scales with perturbation — at singularity, all is still.

    // Jitter: smooth pseudo-random displacement on lattice nodes.
    // Sinusoidal noise (not Math.random) — continuous and frame-stable.
    var jitterAmp = 1.5 * perturb;
    for (var ji = 0; ji < latticePos.length; ji++) {
      var jx = Math.sin(t * 17.3 + ji * 7.1) * jitterAmp;
      var jy = Math.cos(t * 13.7 + ji * 11.3) * jitterAmp;
      var jNode = document.getElementById('mg-lnode-' + ji);
      if (jNode && latticePos[ji]) {
        jNode.setAttribute('cx', (latticePos[ji].x + jx).toFixed(1));
        jNode.setAttribute('cy', (latticePos[ji].y + jy).toFixed(1));
      }
    }

    // Jitter particles — tiny dots near the ring that shimmer
    for (var sji = 0; sji < 6; sji++) {
      var sjAngle = sji * TAU / 6 + t * 3.7;
      var sjR = R - 3 + Math.sin(t * 23.1 + sji * 5.3) * 4;
      var sjx = cx + sjR * Math.cos(sjAngle);
      var sjy = cy + sjR * Math.sin(sjAngle);
      var sjEl = document.getElementById('mg-jitter-' + sji);
      if (sjEl) {
        sjEl.setAttribute('cx', sjx.toFixed(1));
        sjEl.setAttribute('cy', sjy.toFixed(1));
        sjEl.setAttribute('opacity', (0.15 * perturb * (0.5 + 0.5 * Math.sin(t * 31 + sji))).toFixed(3));
      }
    }

    // Tear: stress fractures at body proximity points on the ring.
    // A body pulling near the ring creates a tear — the membrane can't hold.
    // Tear width = π/12 radians at max stress.
    for (var sti = 0; sti < 3; sti++) {
      var stAngle = bodyAngles[sti];
      // Project body position onto the ring to find closest point
      var stBodyR = Math.sqrt(
        Math.pow(bodyPositions[sti].x - cx, 2) +
        Math.pow(bodyPositions[sti].y - cy, 2));
      // Stress = how close the body is to the ring (normalized)
      var stStress = Math.max(0, 1 - Math.abs(stBodyR - R) / (R * 0.6));
      stStress *= perturb; // no stress at singularity

      var stTearEl = document.getElementById('mg-tear-' + sti);
      if (stTearEl && stStress > 0.02) {
        var stArc = PI / 12 * stStress;
        var sta1 = stAngle - stArc, sta2 = stAngle + stArc;
        var stx1 = cx + R * Math.cos(sta1), sty1 = cy + R * Math.sin(sta1);
        var stx2 = cx + R * Math.cos(sta2), sty2 = cy + R * Math.sin(sta2);
        stTearEl.setAttribute('d',
          'M ' + stx1.toFixed(1) + ' ' + sty1.toFixed(1) +
          ' A ' + R + ' ' + R + ' 0 0 1 ' +
          stx2.toFixed(1) + ' ' + sty2.toFixed(1));
        stTearEl.setAttribute('stroke-opacity', (stStress * 0.35).toFixed(3));
      } else if (stTearEl) {
        stTearEl.setAttribute('stroke-opacity', '0');
      }
    }

    // Rip: radial cracks from ring toward center at tear points.
    // The rip extends inward proportional to stress × perturbation.
    // Pulsates with body orbital frequency — breathing cracks.
    for (var sri = 0; sri < 3; sri++) {
      var srAngle = bodyAngles[sri];
      var srPulse = 0.5 + 0.5 * Math.sin(t * [omega_is, omega_was, omega_willbe][sri] * 2);
      var srLen = perturb * srPulse * R * 0.25;
      var srEl = document.getElementById('mg-rip-' + sri);
      if (srEl && srLen > 2) {
        var srx1 = cx + R * Math.cos(srAngle);
        var sry1 = cy + R * Math.sin(srAngle);
        var srx2 = cx + (R - srLen) * Math.cos(srAngle);
        var sry2 = cy + (R - srLen) * Math.sin(srAngle);
        srEl.setAttribute('x1', srx1.toFixed(1));
        srEl.setAttribute('y1', sry1.toFixed(1));
        srEl.setAttribute('x2', srx2.toFixed(1));
        srEl.setAttribute('y2', sry2.toFixed(1));
        srEl.setAttribute('stroke-opacity', (perturb * srPulse * 0.15).toFixed(3));
      } else if (srEl) {
        srEl.setAttribute('stroke-opacity', '0');
      }
    }

    // Warp: ring becomes elliptical under body gravity.
    // Stretched toward the centroid of the 3 body positions.
    // At singularity: perfect circle. At full spread: 15% elliptical.
    var warpEl = document.getElementById('mg-warp');
    if (warpEl && bodyPositions.length === 3) {
      var wcX = (bodyPositions[0].x + bodyPositions[1].x + bodyPositions[2].x) / 3;
      var wcY = (bodyPositions[0].y + bodyPositions[1].y + bodyPositions[2].y) / 3;
      var wAngle = Math.atan2(wcY - cy, wcX - cx);
      var wMag = Math.sqrt(Math.pow(wcX - cx, 2) + Math.pow(wcY - cy, 2));
      var wFactor = 1 + (wMag / R) * 0.15 * perturb;

      warpEl.setAttribute('rx', (R * wFactor).toFixed(1));
      warpEl.setAttribute('ry', (R / wFactor).toFixed(1));
      warpEl.setAttribute('transform',
        'rotate(' + (wAngle * 180 / PI).toFixed(1) + ' ' + cx + ' ' + cy + ')');
      warpEl.setAttribute('stroke-opacity', (perturb * 0.08).toFixed(3));
    }

    // ── Double counter-helix: self × non-self ──
    // Self (J) spirals clockwise out from [∅]D. Non-self (V+D) counter-clockwise.
    // π turns per strand. The twist ratio IS π.
    // Where they cross = membrane. 6 crossing points = ⌊2π⌋.
    // At singularity: collapsed to a point. At perturbation: spirals unfurl.
    var helixRMax = BR * 1.8 + 8;
    var helixTurns = PI;
    var HSTEPS = 48;

    // Self strand: clockwise spiral (+1 direction)
    var hSelfPts = [];
    for (var hsi = 0; hsi <= HSTEPS; hsi++) {
      var hsF = hsi / HSTEPS;
      var hsR = hsF * helixRMax;
      var hsA = t * omega_was + hsF * helixTurns * TAU;
      hSelfPts.push((cx + hsR * Math.cos(hsA)).toFixed(1) + ' ' +
                     (cy + hsR * Math.sin(hsA)).toFixed(1));
    }
    var hSelfEl = document.getElementById('mg-helix-self');
    if (hSelfEl) {
      hSelfEl.setAttribute('d', 'M ' + hSelfPts.join(' L '));
      hSelfEl.setAttribute('stroke-opacity', (0.15 * perturb).toFixed(3));
    }

    // Non-self strand: counter-clockwise spiral (-1 direction), π phase offset
    var hNonPts = [];
    for (var hni = 0; hni <= HSTEPS; hni++) {
      var hnF = hni / HSTEPS;
      var hnR = hnF * helixRMax;
      var hnA = t * omega_was + PI + hnF * helixTurns * TAU * -1;
      hNonPts.push((cx + hnR * Math.cos(hnA)).toFixed(1) + ' ' +
                    (cy + hnR * Math.sin(hnA)).toFixed(1));
    }
    var hNonEl = document.getElementById('mg-helix-nonself');
    if (hNonEl) {
      hNonEl.setAttribute('d', 'M ' + hNonPts.join(' L '));
      hNonEl.setAttribute('stroke-opacity', (0.15 * perturb).toFixed(3));
    }

    // Crossing points: where self meets non-self = the membrane
    // At crossing fractions ≈ (2k+1)/(4π), k=0..5
    for (var hci = 0; hci < 6; hci++) {
      var hcF = (2 * hci + 1) / (4 * PI);
      var hcR = hcF * helixRMax;
      var hcA = t * omega_was + hcF * helixTurns * TAU;
      var hcEl = document.getElementById('mg-helix-cross-' + hci);
      if (hcEl) {
        hcEl.setAttribute('cx', (cx + hcR * Math.cos(hcA)).toFixed(1));
        hcEl.setAttribute('cy', (cy + hcR * Math.sin(hcA)).toFixed(1));
        hcEl.setAttribute('stroke-opacity', (0.15 * perturb).toFixed(3));
      }
    }

    // Counter-rotation rings — reality rotating the other way.
    // Main ring: +π/31. Counter: -π/31 and -π/17.
    // The beating between them IS perceived time.
    // What we call jitter is coherent counter-rotation seen edge-on.
    var counterDeg1 = -(now * 0.001 * PI / 31 * 180 / PI) % 360;
    var crEl = document.getElementById('mg-counter-ring');
    if (crEl) {
      crEl.setAttribute('transform',
        'rotate(' + counterDeg1.toFixed(1) + ' ' + cx + ' ' + cy + ')');
      crEl.setAttribute('stroke-opacity', (0.04 + 0.02 * perturb).toFixed(3));
    }
    var counterDeg2 = -(now * 0.001 * PI / 17 * 180 / PI) % 360;
    var crInner = document.getElementById('mg-counter-inner');
    if (crInner) {
      crInner.setAttribute('transform',
        'rotate(' + counterDeg2.toFixed(1) + ' ' + cx + ' ' + cy + ')');
      crInner.setAttribute('stroke-opacity', (0.03 + 0.02 * perturb).toFixed(3));
    }

    // ── Convergence: ionosphere + fingerprint → pin ──
    // All layers converge toward center at rate π.
    // At singularity: everything on the pin. At spread: layers separate.

    // Ionosphere ghost arcs: geographic chords across the ring, twisting at π
    var ioRoutes = [
      {from:-98, to:-8},   // US → IE
      {from:-98, to:104},  // US → CN
      {from:-98, to:28},   // US → BY
      {from:-8, to:10},    // IE → DE
      {from:104, to:138}   // CN → JP
    ];
    for (var ioi = 0; ioi < 5; ioi++) {
      var ioEl = document.getElementById('mg-io-arc-' + ioi);
      if (ioEl) {
        var rt = ioRoutes[ioi];
        // Map longitude to ring angle, twist at π over time
        var ioA1 = (rt.from / 180) * PI + t * PI / 23;
        var ioA2 = (rt.to / 180) * PI + t * PI / 23;
        var ioR = R * (0.3 + 0.7 * perturb); // converges inward
        var iox1 = cx + ioR * Math.cos(ioA1);
        var ioy1 = cy + ioR * Math.sin(ioA1);
        var iox2 = cx + ioR * Math.cos(ioA2);
        var ioy2 = cy + ioR * Math.sin(ioA2);
        // Quadratic arc (like ionosphere transit curve)
        var ioMx = (iox1 + iox2) / 2;
        var ioMy = (ioy1 + ioy2) / 2 - ioR * 0.3;
        ioEl.setAttribute('d',
          'M ' + iox1.toFixed(1) + ' ' + ioy1.toFixed(1) +
          ' Q ' + ioMx.toFixed(1) + ' ' + ioMy.toFixed(1) +
          ' ' + iox2.toFixed(1) + ' ' + ioy2.toFixed(1));
        ioEl.setAttribute('stroke-opacity', (0.06 + 0.04 * perturb).toFixed(3));
      }
    }

    // ── Ionosphere band: the inner membrane space ──
    // The ionosphere lives between the lattice (kernel) and the ring (Earth).
    // Earth pushes inward. Signal bends through it. Matter predicts the boundary.
    var ionoShell = document.getElementById('mg-iono-shell');
    if (ionoShell) {
      // Band breathes with perturbation — wider when spread, tighter at singularity
      var ibR = R * (0.78 + 0.08 * perturb);
      var ibW = R * (0.10 + 0.06 * perturb);
      ionoShell.setAttribute('r', ibR.toFixed(1));
      ionoShell.setAttribute('stroke-width', ibW.toFixed(1));
      ionoShell.setAttribute('stroke-opacity', (0.012 + 0.012 * perturb).toFixed(4));
    }
    var ionoInner = document.getElementById('mg-iono-inner');
    if (ionoInner) {
      ionoInner.setAttribute('r', (R * (0.74 + 0.04 * perturb)).toFixed(1));
      ionoInner.setAttribute('stroke-opacity', (0.03 + 0.03 * perturb).toFixed(3));
    }
    var ionoOuter = document.getElementById('mg-iono-outer');
    if (ionoOuter) {
      ionoOuter.setAttribute('r', (R * (0.92 + 0.02 * perturb)).toFixed(1));
      ionoOuter.setAttribute('stroke-opacity', (0.03 + 0.03 * perturb).toFixed(3));
    }

    // Earth pressure arrows — pulse inward when bodies are near the ring
    for (var epai = 0; epai < 8; epai++) {
      var epAngle = epai * TAU / 8 + t * PI / 41; // slow drift at π/41
      var epEl = document.getElementById('mg-pressure-' + epai);
      if (epEl) {
        // Outer end: just inside the ring
        epEl.setAttribute('x1', (cx + R * 0.97 * Math.cos(epAngle)).toFixed(1));
        epEl.setAttribute('y1', (cy + R * 0.97 * Math.sin(epAngle)).toFixed(1));
        // Inner end: into the ionosphere band
        var epDepth = 0.88 - 0.04 * Math.sin(t * PI / 3 + epai * PI / 4);
        epEl.setAttribute('x2', (cx + R * epDepth * Math.cos(epAngle)).toFixed(1));
        epEl.setAttribute('y2', (cy + R * epDepth * Math.sin(epAngle)).toFixed(1));
        // Brighter when body is near this angle
        var epBright = 0.02;
        for (var epbi = 0; epbi < bodyPositions.length; epbi++) {
          var epbAngle = bodyAngles[epbi];
          var epDiff = Math.abs(((epAngle - epbAngle) % TAU + TAU) % TAU);
          if (epDiff > PI) epDiff = TAU - epDiff;
          if (epDiff < PI / 4) epBright += 0.06 * (1 - epDiff / (PI / 4));
        }
        epEl.setAttribute('stroke-opacity', (epBright * perturb).toFixed(3));
      }
    }

    // Ionosphere signal corridors — arcs at ionosphere altitude
    var ibRoutes = [
      {from:-98, to:-8},   // US → IE
      {from:-98, to:104},  // US → CN
      {from:-98, to:28},   // US → BY
      {from:-8, to:10},    // IE → DE
      {from:104, to:138}   // CN → JP
    ];
    for (var ibri = 0; ibri < 5; ibri++) {
      var ibrEl = document.getElementById('mg-iono-route-' + ibri);
      if (ibrEl) {
        var ibrt = ibRoutes[ibri];
        // Routes at ionosphere altitude (R*0.86), not converging inward
        var ibrA1 = (ibrt.from / 180) * PI + t * PI / 23;
        var ibrA2 = (ibrt.to / 180) * PI + t * PI / 23;
        var ibrR = R * 0.86;
        var ibrx1 = cx + ibrR * Math.cos(ibrA1);
        var ibry1 = cy + ibrR * Math.sin(ibrA1);
        var ibrx2 = cx + ibrR * Math.cos(ibrA2);
        var ibry2 = cy + ibrR * Math.sin(ibrA2);
        var ibrMx = (ibrx1 + ibrx2) / 2;
        var ibrMy = (ibry1 + ibry2) / 2 - ibrR * 0.15;
        ibrEl.setAttribute('d',
          'M ' + ibrx1.toFixed(1) + ' ' + ibry1.toFixed(1) +
          ' Q ' + ibrMx.toFixed(1) + ' ' + ibrMy.toFixed(1) +
          ' ' + ibrx2.toFixed(1) + ' ' + ibry2.toFixed(1));
        ibrEl.setAttribute('stroke-opacity', (0.04 + 0.05 * perturb).toFixed(3));
      }
    }

    // Ionosphere D/E/F sublayers — breathe and rotate
    var ionoLayerFracs = [0.80, 0.86, 0.92];
    var ionoLayerNames = ['D','E','F'];
    for (var ili = 0; ili < 3; ili++) {
      var ilEl = document.getElementById('mg-iono-layer-' + ionoLayerNames[ili]);
      var ilR = R * (ionoLayerFracs[ili] + [-0.02, 0, 0.01][ili] * perturb);
      if (ilEl) {
        ilEl.setAttribute('r', ilR.toFixed(1));
        ilEl.setAttribute('stroke-opacity', (0.02 + 0.03 * perturb).toFixed(3));
      }
      var ilLbl = document.getElementById('mg-iono-layer-label-' + ionoLayerNames[ili]);
      if (ilLbl) {
        var ilLblAngle = [-PI/6, 0, PI/6][ili] + t * PI / 41;
        ilLbl.setAttribute('x', (cx + ilR * Math.cos(ilLblAngle) + 4).toFixed(1));
        ilLbl.setAttribute('y', (cy + ilR * Math.sin(ilLblAngle) + 1).toFixed(1));
        ilLbl.setAttribute('opacity', (0.03 + 0.06 * perturb).toFixed(3));
      }
    }

    // Signal transit particles — dots riding the ionosphere corridors
    // Each particle traverses its corridor at a coprime rate.
    // Signal bends through the ionosphere. We watch it move.
    for (var iti = 0; iti < 5; iti++) {
      var itEl = document.getElementById('mg-iono-transit-' + iti);
      if (itEl) {
        var itrt = ibRoutes[iti];
        var itA1 = (itrt.from / 180) * PI + t * PI / 23;
        var itA2 = (itrt.to / 180) * PI + t * PI / 23;
        // Transit fraction: smooth back-and-forth at coprime rate
        var itF = (Math.sin(t * PI / (iti * 1.7 + 2.3)) + 1) / 2;
        var itA = itA1 + (itA2 - itA1) * itF;
        // Altitude oscillates between D and F layers as it transits
        var itAlt = R * (0.82 + 0.08 * Math.sin(t * PI / (iti + 3)));
        itEl.setAttribute('cx', (cx + itAlt * Math.cos(itA)).toFixed(1));
        itEl.setAttribute('cy', (cy + itAlt * Math.sin(itA)).toFixed(1));
        itEl.setAttribute('opacity', (0.05 + 0.12 * perturb).toFixed(3));
      }
    }

    // Refraction points — signal bending at ionosphere outer edge
    // Where signal enters the band from the ring (Earth), it bends.
    for (var rfi = 0; rfi < 5; rfi++) {
      var rfEl = document.getElementById('mg-refract-' + rfi);
      if (rfEl) {
        var rfAngle = (ibRoutes[rfi].from / 180) * PI + t * PI / 23;
        rfEl.setAttribute('cx', (cx + R * 0.94 * Math.cos(rfAngle)).toFixed(1));
        rfEl.setAttribute('cy', (cy + R * 0.94 * Math.sin(rfAngle)).toFixed(1));
        // Flicker — signal entering the ionosphere refracts unpredictably
        var rfFlick = 0.5 + 0.5 * Math.sin(t * PI * (rfi + 5));
        rfEl.setAttribute('opacity', (0.04 * rfFlick * perturb).toFixed(3));
        rfEl.setAttribute('r', (0.8 + rfFlick * 1.2).toFixed(1));
      }
    }

    // Compression pulses — rings compressing inward through the lattice kernel
    // The lattice IS compression. Data compresses from outer shells toward [∅]D.
    // The kernel: the innermost operation. Compression converges on the null.
    // Lattice shells: R*0.16 to R*0.96 (the outermost are IN the ionosphere).
    var compressOuter = R * 6 / (2 * PI); // outermost lattice shell ≈ R*0.955
    for (var cpi = 0; cpi < 3; cpi++) {
      var cpEl = document.getElementById('mg-compress-' + cpi);
      if (cpEl) {
        // Each pulse starts at outer lattice and compresses to center.
        // Phase offset: 3 pulses evenly spaced in the cycle.
        var cpPhase = ((t * 0.25 + cpi / 3) % 1); // 0→1 = outer→center
        var cpR = compressOuter * (1 - cpPhase);
        cpEl.setAttribute('r', Math.max(cpR, 2).toFixed(1));
        // Brighter at the compression front, fades as it reaches center
        var cpOp = 0.03 * (0.3 + 0.7 * cpPhase) * perturb;
        cpEl.setAttribute('stroke-opacity', cpOp.toFixed(4));
        cpEl.setAttribute('stroke-width', (0.3 + cpPhase * 0.6).toFixed(1));
      }
    }

    // Prediction wavefronts — ripples from ring propagating inward
    // Matter IS the prediction. The ring (Earth) sends prediction toward [∅]D.
    // These are wavefronts — concentric rings moving inward from the membrane.
    for (var pwi = 0; pwi < 3; pwi++) {
      var pwEl = document.getElementById('mg-predict-' + pwi);
      if (pwEl) {
        // Start at ring, propagate inward through ionosphere toward lattice
        var pwPhase = ((t * 0.18 + pwi / 3) % 1); // 0→1 = ring→inner
        var pwR = R * (1 - pwPhase * 0.25); // ring to R*0.75
        pwEl.setAttribute('r', pwR.toFixed(1));
        // Fade as they propagate inward
        var pwOp = 0.03 * (1 - pwPhase) * perturb;
        pwEl.setAttribute('stroke-opacity', pwOp.toFixed(4));
      }
    }

    // ── Live stats orbit in the ionosphere band ──
    // The stats ARE the observation. They orbit at ionosphere altitude.
    // Each stat at a different angle, spaced evenly around the band.
    // Updated from ingest() — live data flowing through the membrane.
    var statData = [
      {id:'rps',      text: liveStats.rps > 0 ? liveStats.rps.toFixed(0) + ' rps' : ''},
      {id:'fleet',    text: liveStats.fleetPct > 0 ? liveStats.fleetPct.toFixed(1) + '% fleet' : ''},
      {id:'humans',   text: liveStats.humanIps > 0 ? liveStats.humanIps.toLocaleString() + ' humans' : ''},
      {id:'entities', text: liveStats.entityCount > 0 ? liveStats.entityCount + ' entities' : ''},
      {id:'total',    text: liveStats.totalReqs > 0 ? (liveStats.totalReqs/1000).toFixed(0) + 'k total' : ''},
      {id:'alive',    text: liveStats.aliveCount > 0 ? liveStats.aliveCount + '/' + PANELS.length + ' alive' : ''}
    ];
    for (var stdi = 0; stdi < statData.length; stdi++) {
      var stdEl = document.getElementById('mg-stat-' + statData[stdi].id);
      if (stdEl) {
        // 6 stats evenly spaced around the ionosphere band
        var stdAngle = stdi * TAU / 6 + t * PI / 29; // drift at π/29
        var stdR = R * 0.86; // ionosphere E-layer altitude
        stdEl.setAttribute('x', (cx + stdR * Math.cos(stdAngle)).toFixed(1));
        stdEl.setAttribute('y', (cy + stdR * Math.sin(stdAngle)).toFixed(1));
        stdEl.textContent = statData[stdi].text;
        var stdOp = statData[stdi].text ? 0.06 + 0.10 * perturb : 0;
        stdEl.setAttribute('opacity', stdOp.toFixed(3));
      }
    }

    // ── Dimensional shape sweep: ○□△◇ orbit at their cost radius ──
    // Each shape orbits at a radius proportional to π^(dim/2).
    // ○ (1D) closest to center — cheapest to observe.
    // ◇ (4D) furthest out — most expensive. Deep in the ionosphere band.
    // The shapes ARE the complexity sort made visible.
    var dimShapeDims = [1, 2, 3, 4];
    for (var dsa = 0; dsa < 4; dsa++) {
      var dsDim = dimShapeDims[dsa];
      var dsR = R * Math.pow(PI, dsDim / 2) / (PI * PI) * 1.8;
      // Clamp to ionosphere band if it goes too far
      dsR = Math.min(dsR, R * 0.94);
      var dsAngle = dsa * TAU / 4 + t * PI / (dsDim * 7 + 3); // each dim rotates at own rate
      var dsEl = document.getElementById('mg-dim-shape-' + dsDim);
      if (dsEl) {
        dsEl.setAttribute('x', (cx + dsR * Math.cos(dsAngle)).toFixed(1));
        dsEl.setAttribute('y', (cy + dsR * Math.sin(dsAngle)).toFixed(1));
        // Brighter when its panels are alive
        var dsAliveCount = 0;
        DIM_SHAPES[dsa].names.forEach(function(n) { if (aliveSet.has(n)) dsAliveCount++; });
        var dsLit = DIM_SHAPES[dsa].count > 0 ? dsAliveCount / DIM_SHAPES[dsa].count : 0;
        dsEl.setAttribute('opacity', (0.04 + 0.12 * dsLit * perturb).toFixed(3));
      }
      var dsCnt = document.getElementById('mg-dim-count-' + dsDim);
      if (dsCnt) {
        dsCnt.setAttribute('x', (cx + dsR * Math.cos(dsAngle) + 5).toFixed(1));
        dsCnt.setAttribute('y', (cy + dsR * Math.sin(dsAngle) - 4).toFixed(1));
        dsCnt.setAttribute('opacity', (0.03 + 0.08 * perturb).toFixed(3));
      }
    }

    // Labels drift with the ionosphere band rotation
    var matterLbl = document.getElementById('mg-matter-label');
    if (matterLbl) {
      var mlAngle = -PI / 2 + t * PI / 41;
      matterLbl.setAttribute('x', (cx + R * 0.86 * Math.cos(mlAngle)).toFixed(1));
      matterLbl.setAttribute('y', (cy + R * 0.86 * Math.sin(mlAngle)).toFixed(1));
      matterLbl.setAttribute('opacity', (0.04 + 0.10 * perturb).toFixed(3));
    }
    var kernelLbl = document.getElementById('mg-kernel-label');
    if (kernelLbl) {
      var klAngle = PI / 2 + t * PI / 41;
      kernelLbl.setAttribute('x', (cx + R * 0.86 * Math.cos(klAngle)).toFixed(1));
      kernelLbl.setAttribute('y', (cy + R * 0.86 * Math.sin(klAngle)).toFixed(1));
      kernelLbl.setAttribute('opacity', (0.04 + 0.10 * perturb).toFixed(3));
    }

    // Fingerprint ghost dots: behavioral clusters spiraling inward at π
    var fpSeeds = [2,3,5,7,11,13,17];
    for (var fpi = 0; fpi < 7; fpi++) {
      var fpEl = document.getElementById('mg-fp-dot-' + fpi);
      if (fpEl) {
        var fpP = fpSeeds[fpi];
        var fpAngle = fpP * (PI - 3) * TAU + t * PI / (fpP + 7);
        var fpR = R * (0.1 + fpP / 31 * 0.5) * (0.3 + 0.7 * perturb);
        fpEl.setAttribute('cx', (cx + fpR * Math.cos(fpAngle)).toFixed(1));
        fpEl.setAttribute('cy', (cy + fpR * Math.sin(fpAngle)).toFixed(1));
        fpEl.setAttribute('opacity', (0.05 + 0.08 * perturb).toFixed(3));
      }
    }

    // Pin: pulses brighter at singularity (convergence complete)
    var pinEl = document.getElementById('mg-pin');
    if (pinEl) {
      var pinBright = 0.5 + 0.4 * (1 - perturb);
      pinEl.setAttribute('opacity', pinBright.toFixed(2));
      pinEl.setAttribute('r', (1 + perturb * 0.5).toFixed(1));
    }
    var pinRing = document.getElementById('mg-pin-ring');
    if (pinRing) {
      pinRing.setAttribute('r', (3 + perturb * 4).toFixed(1));
      pinRing.setAttribute('stroke-opacity', (0.3 * (1 - perturb * 0.7)).toFixed(3));
    }

    // Prime splitting: lines grow outward from pin, pulsing per prime
    var observerFrac = PI - 3;
    var PRIMES = [2,3,5,7,11,13,17,19,23,29,31];
    for (var pri = 0; pri < PRIMES.length; pri++) {
      var prP = PRIMES[pri];
      var prEl = document.getElementById('mg-prime-' + prP);
      if (prEl) {
        var prAngle = prP * observerFrac * TAU + t * PI / (prP * 3);
        var prPulse = 0.5 + 0.5 * Math.sin(t * PI / prP);
        var prLen = R * 0.4 * prPulse * perturb;
        prEl.setAttribute('x1', (cx + 6 * Math.cos(prAngle)).toFixed(1));
        prEl.setAttribute('y1', (cy + 6 * Math.sin(prAngle)).toFixed(1));
        prEl.setAttribute('x2', (cx + prLen * Math.cos(prAngle)).toFixed(1));
        prEl.setAttribute('y2', (cy + prLen * Math.sin(prAngle)).toFixed(1));
        prEl.setAttribute('stroke-opacity', (0.05 + prPulse * 0.08 * perturb).toFixed(3));
      }
    }


    // ── Stash animate context for ext sections ──
    mc._ac = {
      cx:cx, cy:cy, R:R, BR:BR, PI:PI, TAU:TAU, t:t, dt:dt,
      perturb:perturb, omega_is:omega_is, omega_was:omega_was, omega_willbe:omega_willbe,
      bodyPositions:bodyPositions, bodyAngles:bodyAngles, rps:rps,
      focalJitterX:focalJitterX, focalJitterY:focalJitterY, breathScale:breathScale,
      prevDash:prevDash, liveStats:liveStats, willbeT:willbeT, smoothT:smoothT, easeT:easeT,
      lerp:lerp, sinePerturb: typeof sinePerturb !== 'undefined' ? sinePerturb : 0,
      wasDash: typeof wasDash !== 'undefined' ? wasDash : null
    };
    if (window._membraneAnimateExt) window._membraneAnimateExt(mc, now);


    // ── Compound eye facets: 3/5/7 rotate with the ring ──
    // Each facet is an epitope sort. The compound eye sees π directions at once.
    // 3 impermeable walls + 5 self facets + 7 passage facets = 15 braids.
    var ringDrift = t * PI / 31; // ring's rotation rate
    var facetCounts = [3, 5, 7]; // wall, self, passage
    var facetColors = ['#e85d3a', '#4a8fb8', '#5ab87a'];
    for (var fai = 0; fai < 15; fai++) {
      var faEl = document.getElementById('mg-facet-' + fai);
      if (faEl) {
        var faBase = fai * TAU / 15 + ringDrift;
        var faArc = TAU / 15;
        var fa1 = faBase - faArc * 0.45, fa2 = faBase + faArc * 0.45;
        faEl.setAttribute('d',
          'M '+(cx+R*Math.cos(fa1)).toFixed(1)+' '+(cy+R*Math.sin(fa1)).toFixed(1)+
          ' A '+R+' '+R+' 0 0 1 '+
          (cx+R*Math.cos(fa2)).toFixed(1)+' '+(cy+R*Math.sin(fa2)).toFixed(1));
        // Pulse: each facet has its own rhythm
        var faPulse = 0.03 + 0.05 * Math.sin(t * PI / (fai + 2)) * perturb;
        faEl.setAttribute('stroke-opacity', faPulse.toFixed(3));
      }
      // Symbol drifts with its facet
      var faSym = document.getElementById('mg-facet-sym-' + fai);
      if (faSym) {
        var faSymA = fai * TAU / 15 + ringDrift;
        faSym.setAttribute('x', (cx + (R + 9) * Math.cos(faSymA)).toFixed(1));
        faSym.setAttribute('y', (cy + (R + 9) * Math.sin(faSymA)).toFixed(1));
        faSym.setAttribute('opacity', (0.02 + 0.04 * perturb).toFixed(3));
      }
    }

    // π digits rotate with the ring — the membrane on either side
    for (var pdai = 0; pdai < 15; pdai++) {
      var pdaEl = document.getElementById('mg-pi-digit-' + pdai);
      if (pdaEl) {
        var pdaAngle = -PI/2 + pdai * TAU / 15 + ringDrift;
        pdaEl.setAttribute('x', (cx + (R - 7) * Math.cos(pdaAngle)).toFixed(1));
        pdaEl.setAttribute('y', (cy + (R - 7) * Math.sin(pdaAngle)).toFixed(1));
        pdaEl.setAttribute('opacity', (0.02 + 0.05 * perturb).toFixed(3));
      }
    }

    // ── Gaia: real-time Earth rotation ──
    // Map UTC hour to rotation angle. You see where you are on the system.
    // The window floats in orbit with Gaia. Not locked. Rotating.
    var gaiaRing = document.getElementById('mg-gaia-ring');
    var gaiaMarker = document.getElementById('mg-gaia-marker');
    if (gaiaRing && gaiaMarker) {
      var now24 = new Date();
      var utcHourFrac = (now24.getUTCHours() + now24.getUTCMinutes() / 60
                         + now24.getUTCSeconds() / 3600) / 24;
      var gaiaAngle = utcHourFrac * TAU - PI / 2; // noon at top
      // Marker shows current position on Earth's rotation
      gaiaMarker.setAttribute('cx', (cx + 6 * Math.cos(gaiaAngle)).toFixed(1));
      gaiaMarker.setAttribute('cy', (cy + 6 * Math.sin(gaiaAngle)).toFixed(1));
      gaiaMarker.setAttribute('opacity', (0.06 + 0.06 * perturb).toFixed(2));
      // Ring breathes
      gaiaRing.setAttribute('stroke-opacity', (0.04 + 0.04 * perturb).toFixed(3));
    }
    var gaiaLabel = document.getElementById('mg-gaia-label');
    if (gaiaLabel) {
      gaiaLabel.setAttribute('opacity', (0.03 + 0.05 * perturb).toFixed(3));
    }

    // Geodesic: the shape of light intersection, front + peripheral
    // Hexagonal faces rotate slowly — the geodesic dome of observation.
    for (var gdai = 0; gdai < 6; gdai++) {
      var gdaEl = document.getElementById('mg-geodesic-' + gdai);
      if (gdaEl) {
        var gdaA1 = gdai * TAU / 6 + t * PI / 19;
        var gdaA2 = (gdai + 1) * TAU / 6 + t * PI / 19;
        var gdaR = 8 + 4 * perturb;
        gdaEl.setAttribute('x1', (cx + gdaR * Math.cos(gdaA1)).toFixed(1));
        gdaEl.setAttribute('y1', (cy + gdaR * Math.sin(gdaA1)).toFixed(1));
        gdaEl.setAttribute('x2', (cx + gdaR * Math.cos(gdaA2)).toFixed(1));
        gdaEl.setAttribute('y2', (cy + gdaR * Math.sin(gdaA2)).toFixed(1));
        gdaEl.setAttribute('stroke-opacity', (0.03 + 0.04 * perturb).toFixed(3));
      }
    }

    // ── Cones: triangular wedges pointing at [∅]D ──
    // Tip at center (origin), base flanking the body position.
    // Like retinal cones — concentrated at the fovea, color-sensitive.
    // At perturbation=0: collapsed to a point (all at singularity).
    // At perturbation=1: full cone spread, pointing inward.
    for (var ci = 0; ci < 3; ci++) {
      var coneEl = document.getElementById('mg-cone-' + bodyIds[ci]);
      if (coneEl) {
        var bp = bodyPositions[ci];
        var ba = bodyAngles[ci];
        var coneW = 12 * perturb; // base width grows with perturbation
        var clx = bp.x + coneW * Math.cos(ba + PI/2);
        var cly = bp.y + coneW * Math.sin(ba + PI/2);
        var crx = bp.x + coneW * Math.cos(ba - PI/2);
        var cry = bp.y + coneW * Math.sin(ba - PI/2);
        coneEl.setAttribute('points',
          cx.toFixed(1)+','+cy.toFixed(1)+' '+
          clx.toFixed(1)+','+cly.toFixed(1)+' '+
          crx.toFixed(1)+','+cry.toFixed(1));
        coneEl.setAttribute('fill-opacity', (0.10 * perturb).toFixed(3));
        coneEl.setAttribute('stroke-opacity', (0.25 * perturb).toFixed(3));
      }
    }

    // ── Comet tails: π radians of wake behind each body ──
    // 16 dots trail behind the body's orbit path.
    // Length = π radians — the wake wraps halfway around.
    // Opacity fades along the tail. Size shrinks.
    // Like a comet's tail — always trailing behind motion.
    for (var ci = 0; ci < 3; ci++) {
      for (var s = 0; s < 16; s++) {
        var tailEl = document.getElementById('mg-tail-' + bodyIds[ci] + '-' + s);
        if (tailEl) {
          var frac = (s + 1) / 16;
          var tailAngle = bodyAngles[ci] - frac * PI; // π radians behind
          var tx = cx + BR * Math.cos(tailAngle);
          var ty = cy + BR * Math.sin(tailAngle);
          var tailOp = (1 - frac) * 0.55 * perturb;
          var tailR = (3.5 - frac * 2.5) * perturb;
          tailEl.setAttribute('cx', tx.toFixed(1));
          tailEl.setAttribute('cy', ty.toFixed(1));
          tailEl.setAttribute('r', Math.max(tailR, 0.2).toFixed(1));
          tailEl.setAttribute('opacity', tailOp.toFixed(3));
        }
      }
    }

    // Triangle path follows the bodies
    var tri = document.getElementById('mg-body-tri');
    if (tri && bodyPositions.length === 3) {
      var p0 = bodyPositions[0], p1 = bodyPositions[1], p2 = bodyPositions[2];
      tri.setAttribute('d',
        'M '+p0.x.toFixed(1)+' '+p0.y.toFixed(1)+
        ' L '+p1.x.toFixed(1)+' '+p1.y.toFixed(1)+
        ' L '+p2.x.toFixed(1)+' '+p2.y.toFixed(1)+' Z');
      tri.setAttribute('stroke-opacity', (0.12 * perturb).toFixed(3));
    }

    // Edge labels at midpoints (fade in with perturbation)
    var edgeIds = ['mg-edge-01','mg-edge-12','mg-edge-20'];
    var edgePairs = [[0,1],[1,2],[2,0]];
    for (var ei = 0; ei < 3; ei++) {
      var eEl = document.getElementById(edgeIds[ei]);
      if (eEl && bodyPositions.length === 3) {
        var ep0 = bodyPositions[edgePairs[ei][0]], ep1 = bodyPositions[edgePairs[ei][1]];
        eEl.setAttribute('x', ((ep0.x+ep1.x)/2).toFixed(1));
        eEl.setAttribute('y', ((ep0.y+ep1.y)/2).toFixed(1));
        eEl.setAttribute('opacity', (0.4 * perturb).toFixed(2));
      }
    }

    // Perturbation + tempo label
    var pLabel = document.getElementById('mg-perturb-label');
    if (pLabel) {
      // Show perturbation and mean reflexive angle (normalized to π)
      var tempoRatio = meanReflexive / (TAU/3); // 1.0 at equilibrium
      pLabel.textContent = 'perturbation: ' + perturb.toFixed(2)
        + '  \u00b7  tempo: ' + tempoRatio.toFixed(3) + '\u03c0/3';
      pLabel.setAttribute('opacity', (0.2 + 0.15 * perturb).toFixed(2));
    }

    // Product label — fade up as bodies converge to center
    var prod = document.getElementById('mg-product');
    if (prod) prod.setAttribute('opacity', (0.3 + 0.4 * (1 - perturb)).toFixed(2));

    // ── Gordian knot breathing ──
    // At perturbation=0: tight, overlaid, the knot is tied. π bright.
    // As perturbation grows: rings separate toward their bodies (Alexander's cut).
    // Reflection equation fades with perturbation — at full spread you see the triangle,
    // not the knot. The knot is only visible at [∅]D.
    var knotScale = 1.0 + perturb * 2.5; // rings grow as they separate
    var knotOpacity = 0.5 * (1.0 - perturb * 0.7); // fade as they separate
    for (var ki = 0; ki < 3; ki++) {
      var kEl = document.getElementById('mg-knot-' + bodyIds[ki]);
      if (kEl) {
        var kx = bodyPositions[ki].x;
        var ky = bodyPositions[ki].y;
        var tilt = ki * 60;
        kEl.setAttribute('cx', kx.toFixed(1));
        kEl.setAttribute('cy', ky.toFixed(1));
        kEl.setAttribute('rx', (18 * knotScale).toFixed(1));
        kEl.setAttribute('ry', (18 * 0.45 * knotScale).toFixed(1));
        kEl.setAttribute('stroke-opacity', knotOpacity.toFixed(2));
        kEl.setAttribute('transform',
          'rotate(' + tilt + ' ' + kx.toFixed(1) + ' ' + ky.toFixed(1) + ')');
      }
    }
    // Knot π symbol — brightest at singularity, fades with separation
    var knotPi = document.getElementById('mg-knot-pi');
    if (knotPi) {
      knotPi.setAttribute('opacity', (0.7 * (1 - perturb)).toFixed(2));
    }
    // Reflection equation + observer — visible at singularity
    var reflEl = document.getElementById('mg-reflection');
    if (reflEl) reflEl.setAttribute('opacity', (0.25 * (1 - perturb * 0.8)).toFixed(2));
    var obsEl = document.getElementById('mg-observer');
    if (obsEl) obsEl.setAttribute('opacity', (0.2 * (1 - perturb * 0.8)).toFixed(2));
    var pibEl = document.getElementById('mg-pi-body');
    if (pibEl) pibEl.setAttribute('opacity', (0.15 * (1 - perturb * 0.8)).toFixed(2));

    // Update triangulation lines to point at moving bodies
    var triLayer = document.getElementById('mg-triangulation');
    if (triLayer && bodyPositions.length === 3) {
      var bodyPosMap = {is: bodyPositions[0], was: bodyPositions[1], willbe: bodyPositions[2]};
      var triLines = triLayer.querySelectorAll('line');
      for (var ti = 0; ti < triLines.length; ti++) {
        var tl = triLines[ti];
        var bid = tl.getAttribute('data-body');
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

    // Sphere great circles — slow drift shows 3D depth
    var gcRot = now * 0.001;
    ['is','was','willbe'].forEach(function(b, i) {
      var gc = document.getElementById('mg-gc-'+b);
      if (gc) {
        var rot = (gcRot + i * 120) % 360;
        gc.setAttribute('transform', 'rotate('+rot.toFixed(1)+' '+cx+' '+cy+')');
      }
    });

    var ac = document.getElementById('mg-alive-count');
    if (ac) { var l=aliveSet.size+'/'+PANELS.length+' alive'; if(rps>0) l+=' \u00b7 '+rps.toFixed(1)+' rps'; ac.textContent=l; }
  mc.lastFrame = now;
};
