// pt-membrane-animate.js — animation loop for the membrane.
// RPS IS rotation. π/rate = flip time. Null and ∞ are the same through π.
// The maze increases diffraction → ∞. More leak, less impact per leak.
window._membraneAnimate = function(mc, now) {
  var PI=mc.PI, el=mc.el, MG=mc.MG, PANELS=mc.PANELS;
  var CAT_COLORS=mc.CAT_COLORS, DIM_SHAPES=mc.DIM_SHAPES;
  var aliveSet=mc.aliveSet, liveStats=mc.liveStats;
  var particles=mc.particles, pulses=mc.pulses, arcGlow=mc.arcGlow;
  var geo=mc.geo, CATS=mc.CATS, catAccum=mc.catAccum, rates=mc.rates;
  var MAX_P=mc.MAX_P, dimCost=mc.dimCost, spawnParticle=mc.spawnParticle;
  var rps=mc.rpsVal, prevDash=mc.prevDashVal, livePerturb=mc.livePerturb;
  var TIERS=mc.TIERS;
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

    // ── Ring rotation: the outside is alive ──
    // π/31 rad/s — 31 = ⌊π³⌋ (the particle budget). Slowest wheel.
    // Coprime to body rates (7, 11, 17). Nothing locks. Everything turns.
    var ringOmega = PI / 31;
    var ringDeg = (now * 0.001 * ringOmega * 180 / PI) % 360;
    var wasEl = document.getElementById('mg-was');
    if (wasEl) wasEl.setAttribute('transform', 'rotate('+ringDeg.toFixed(1)+' '+cx+' '+cy+')');

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
    var perturb = livePerturb >= 0 ? livePerturb : sinePerturb;
    var BR = R * (PI/8) * perturb;

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
    var t = now * 0.001; // seconds
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

      // Extract dashboard values
      var nd = prevDash.null_dimension || {};
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
