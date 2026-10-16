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

    // ═══ CONGA LINE — tense echoes flowing outward to membrane ═══
    // WAS→IS→WILLBE trail like a conga line from center to surface
    // Each echo gets its own ring. Trail refreshes at π³ (~31s)
    if (!mc._congaEchoes) {
      mc._congaEchoes = [];
      mc._congaTimer = 0;
    }
    var congaT = ac.tSec || 0;
    var PI3_INTERVAL = 31; // π³

    // Spawn new echoes every π³ seconds
    if (congaT - mc._congaTimer > PI3_INTERVAL || mc._congaEchoes.length === 0) {
      mc._congaTimer = congaT;
      // Each body spawns an echo at its current position
      for (var ci = 0; ci < 3; ci++) {
        var bp = bodyPositions[ci];
        if (bp) {
          mc._congaEchoes.push({
            x: bp.x, y: bp.y,
            originX: bp.x, originY: bp.y,
            color: ['#e85d3a','#4a8fb8','#5ab87a'][ci],
            tense: ['IS','WAS','WILLBE'][ci],
            r: 0, // distance from origin
            maxR: R * 0.8, // membrane boundary
            speed: R * 0.008, // px per frame
            ringR: 8, // ring radius around echo
            opacity: 0.5,
            born: congaT,
            bodyIdx: ci
          });
        }
      }
      // Limit total echoes (π³ budget = 31)
      while (mc._congaEchoes.length > 31) mc._congaEchoes.shift();
    }

    // Animate echoes — flow outward from body toward membrane
    var svg = document.getElementById('membrane-focal-svg');
    var congaSvg = svg ? svg.querySelector('svg') : null;
    var congaG = congaSvg ? congaSvg.querySelector('#mg-conga') : null;
    if (congaSvg && !congaG) {
      congaG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      congaG.id = 'mg-conga';
      var willbeG = congaSvg.querySelector('#mg-willbe');
      if (willbeG) willbeG.appendChild(congaG);
    }

    if (congaG) {
      // Remove old elements and rebuild (simpler than tracking)
      while (congaG.firstChild) congaG.removeChild(congaG.firstChild);

      var deadEchoes = [];
      mc._congaEchoes.forEach(function(echo, ei) {
        // Move outward from origin
        var age = congaT - echo.born;
        var dist = echo.speed * age * 60; // approximate frames
        if (dist > echo.maxR) {
          deadEchoes.push(ei);
          return;
        }

        // Direction: outward from center
        var dx = echo.originX - cx;
        var dy = echo.originY - cy;
        var len = Math.sqrt(dx*dx + dy*dy) || 1;
        var ex = echo.originX + (dx/len) * dist;
        var ey = echo.originY + (dy/len) * dist;

        // Fade with distance
        var fade = 1 - (dist / echo.maxR);
        var op = echo.opacity * fade * fade;
        if (op < 0.01) { deadEchoes.push(ei); return; }

        // Ring around the echo
        var ringEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ringEl.setAttribute('cx', ex.toFixed(1));
        ringEl.setAttribute('cy', ey.toFixed(1));
        ringEl.setAttribute('r', (echo.ringR + dist * 0.02).toFixed(1));
        ringEl.setAttribute('fill', 'none');
        ringEl.setAttribute('stroke', echo.color);
        ringEl.setAttribute('stroke-width', '0.5');
        ringEl.setAttribute('stroke-opacity', (op * 0.3).toFixed(3));
        ringEl.setAttribute('stroke-dasharray', '2,3');
        congaG.appendChild(ringEl);

        // Echo dot
        var dotEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dotEl.setAttribute('cx', ex.toFixed(1));
        dotEl.setAttribute('cy', ey.toFixed(1));
        dotEl.setAttribute('r', (2 * fade + 1).toFixed(1));
        dotEl.setAttribute('fill', echo.color);
        dotEl.setAttribute('opacity', op.toFixed(3));
        congaG.appendChild(dotEl);
      });

      // Clean up dead echoes (reverse order)
      for (var di = deadEchoes.length - 1; di >= 0; di--) {
        mc._congaEchoes.splice(deadEchoes[di], 1);
      }
    }


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

  // ═══ NORTHGATE — stories radiate from center, null-π field brightens ═══
  function animNorthgate(ac) {
    var ng = window._northgate;
    var piField = document.getElementById('mg-null-pi-field');
    var piRim = document.getElementById('mg-null-pi-rim');
    var pulseG = document.getElementById('mg-northgate-pulse');

    if (piField) {
      // Null-π field opacity scales with saturation: 0→black(opaque), π→white(transparent)
      var sat = ng ? ng.saturation / PI : 0;
      var fieldOp = 0.3 + sat * 0.4;  // brighter as π-sat increases
      piField.setAttribute('opacity', fieldOp.toFixed(3));
      // Pulse the rim when stories are fresh
      if (ng && ng.lastStory && Date.now() - ng.lastPush < 5000) {
        var pulse = Math.sin(ac.t * 3) * 0.15 + 0.25;
        if (piRim) piRim.setAttribute('opacity', pulse.toFixed(3));
      }
    }

    // Radiate story pulses outward from center
    if (pulseG && ng && ng.stories && ng.stories.length > 0) {
      // Remove old pulse rings
      while (pulseG.childNodes.length > 9) {
        pulseG.removeChild(pulseG.firstChild);
      }

      // Each story gets an expanding ring
      var now = Date.now();
      ng.stories.forEach(function(story, si) {
        var age = (now - (ng.lastPush - (ng.stories.length - si) * 3000)) / 1000;
        if (age < 0) age = 0;
        var pulseR = 3 + age * 8;  // expand outward
        var pulseOp = Math.max(0, 0.2 - age * 0.015);
        if (pulseOp <= 0) return;

        var ringId = 'mg-ng-pulse-' + si;
        var ring = document.getElementById(ringId);
        if (!ring) {
          ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          ring.id = ringId;
          pulseG.appendChild(ring);
        }
        var sColor = story.type === 'braid' ? '#f0883e' :
                     story.type === 'signal' ? '#3fb950' :
                     story.type === 'wake' ? '#d2a8ff' : '#484f58';
        ring.setAttribute('cx', cx);
        ring.setAttribute('cy', cy);
        ring.setAttribute('r', pulseR.toFixed(1));
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', sColor);
        ring.setAttribute('stroke-width', '0.4');
        ring.setAttribute('stroke-opacity', pulseOp.toFixed(3));
        ring.setAttribute('stroke-dasharray', '2,4');
      });
    }
  }

  // ═══ TUEBOR SHELL — the hard surface pulses with passage ═══
  function animTuebor(ac) {
    var tG = document.getElementById('mg-tuebor-shell');
    if (!tG) return;
    var t = ac.t;
    var ng = window._northgate;
    var piSat = ng ? ng.saturation / PI : 0;
    var perturb = ac.perturb || 0.5;

    // Shell visibility — harder when more humans present
    var shellOp = 0.15 + piSat * 0.25 + perturb * 0.1;
    tG.setAttribute('opacity', shellOp.toFixed(3));

    // Ring pulses with a slow heartbeat
    var ring = document.getElementById('mg-tuebor-ring');
    if (ring) {
      var rOp = 0.3 + Math.sin(t * 0.5) * 0.1 + piSat * 0.15;
      ring.setAttribute('opacity', rOp.toFixed(3));
      ring.setAttribute('stroke-width', (1.0 + Math.sin(t * 0.3) * 0.3).toFixed(2));
    }

    // Pores pulse — passages through tuebor
    for (var ti = 0; ti < 5; ti++) {
      var pore = document.getElementById('mg-tuebor-pore-' + ti);
      if (pore) {
        var pPhase = t * 0.8 + ti * 1.2;
        var pR = 1.5 + Math.sin(pPhase) * 0.5;
        pore.setAttribute('r', pR.toFixed(1));
        pore.setAttribute('opacity', (0.2 + Math.sin(pPhase) * 0.15).toFixed(3));
      }
    }

    // Labels fade in/out in sequence
    ['tuebor','i','will','defend'].forEach(function(word, wi) {
      var lbl = document.getElementById('mg-tuebor-label-' + word);
      if (lbl) {
        var lOp = 0.15 + Math.sin(t * 0.4 + wi * PI * 0.5) * 0.15;
        lbl.setAttribute('opacity', lOp.toFixed(3));
      }
    });
  }

  // ═══ FLEET QUIET — outer dampener breathes opposite to membrane ═══
  function animFleetQuiet(ac) {
    var fG = document.getElementById('mg-fleet-quiet');
    if (!fG) return;
    var t = ac.t;
    var perturb = ac.perturb || 0.5;

    // Quiet layer is MORE visible when fleet is active (perturb high)
    // and LESS visible when humans dominate (piSat high)
    var ng = window._northgate;
    var piSat = ng ? ng.saturation / PI : 0;
    var fOp = 0.04 + perturb * 0.08 - piSat * 0.02;
    fG.setAttribute('opacity', Math.max(0.02, fOp).toFixed(3));

    // Absorption dots shimmer
    for (var fi = 0; fi < 8; fi++) {
      var dot = document.getElementById('mg-fleet-dot-' + fi);
      if (dot) {
        var dOp = 0.08 + Math.sin(t * 2 + fi * 0.8) * 0.06;
        dot.setAttribute('opacity', dOp.toFixed(3));
      }
    }
  }

  // ═══ GEO INTRA-LAYER — geography substrate breathing ═══
  function animGeoIntra(ac) {
    var geoG = document.getElementById('mg-geo-intra');
    if (!geoG) return;
    var t = ac.t;
    var perturb = ac.perturb || 0.5;
    var ng = window._northgate;
    var piSat = ng ? ng.saturation / PI : 0;

    // Substrate visibility scales with perturb + piSat
    var geoOp = 0.12 + perturb * 0.15 + piSat * 0.15;
    geoG.setAttribute('opacity', geoOp.toFixed(3));

    // Michigan beacon pulses
    var mi = document.getElementById('mg-geo-state_mi');
    if (mi) {
      var miPulse = 2.5 + Math.sin(t * 1.2) * 0.8;
      mi.setAttribute('r', miPulse.toFixed(1));
      mi.setAttribute('opacity', (0.4 + perturb * 0.3).toFixed(3));
    }

    // Geo ring breathes
    var ring = document.getElementById('mg-geo-ring');
    if (ring) {
      var rOp = 0.1 + Math.sin(t * 0.3) * 0.05 + piSat * 0.1;
      ring.setAttribute('opacity', rOp.toFixed(3));
    }
  }

  // ═══ MÖBIUS TWIST — flow particle + breathing + saturation ═══
  var _mobiusFrame = 0;
  function animMobius(ac) {
    var pts = window._mobiusPath;
    if (!pts || pts.length < 2) return;

    var twistG = document.getElementById('mg-mobius-twist');
    var flowEl = document.getElementById('mg-mobius-flow');
    var bandEl = document.getElementById('mg-mobius-band');
    var piEl   = document.getElementById('mg-mobius-pi');
    if (!twistG) return;

    var t = ac.t;
    var perturb = ac.perturb || 0.5;
    var ng = window._northgate;
    var piSat = ng ? ng.saturation / PI : 0;

    // Band opacity scales with π-saturation: more saturated = more visible
    var baseOp = 0.25 + piSat * 0.45;
    twistG.setAttribute('opacity', baseOp.toFixed(3));

    // Flow particle — travels along the lemniscate path
    _mobiusFrame = (_mobiusFrame + 0.4) % pts.length;
    var idx = Math.floor(_mobiusFrame);
    var frac = _mobiusFrame - idx;
    var p0 = pts[idx];
    var p1 = pts[(idx + 1) % pts.length];
    if (flowEl && p0 && p1) {
      var fx = p0.x + (p1.x - p0.x) * frac;
      var fy = p0.y + (p1.y - p0.y) * frac;
      flowEl.setAttribute('cx', fx.toFixed(1));
      flowEl.setAttribute('cy', fy.toFixed(1));

      // Flow particle color shifts: white in actuality lobe, purple at twist, gray in modality
      var halfLen = pts.length / 2;
      var lobePos = _mobiusFrame < halfLen ? _mobiusFrame / halfLen : (pts.length - _mobiusFrame) / halfLen;
      var flowOp = 0.3 + perturb * 0.5;
      flowEl.setAttribute('opacity', flowOp.toFixed(3));

      // Near the twist point (center), flash purple
      var distToCenter = Math.sqrt((fx - cx) * (fx - cx) + (fy - cy) * (fy - cy));
      var nearTwist = Math.max(0, 1 - distToCenter / 15);
      if (nearTwist > 0.5) {
        flowEl.setAttribute('fill', '#a371f7');
        flowEl.setAttribute('r', (1.5 + nearTwist * 2).toFixed(1));
      } else if (_mobiusFrame > halfLen) {
        flowEl.setAttribute('fill', '#8b949e');
        flowEl.setAttribute('r', '1.5');
      } else {
        flowEl.setAttribute('fill', '#ffffff');
        flowEl.setAttribute('r', '1.5');
      }
    }

    // π twist marker — pulses with the crossing
    if (piEl) {
      var piPulse = 2.5 + Math.sin(t * 1.5) * 0.8;
      piEl.setAttribute('r', piPulse.toFixed(1));
      piEl.setAttribute('opacity', (0.4 + piSat * 0.4).toFixed(3));
    }

    // Band stroke breathes
    if (bandEl) {
      var sw = 0.8 + Math.sin(t * 0.7) * 0.3 + perturb * 0.4;
      bandEl.setAttribute('stroke-width', sw.toFixed(2));
    }

    // State labels: "is" brightens when flow particle is near it
    var stateLabels = ['is', 'near', 'will', 'was', 'could', 'far', 'would', 'should'];
    stateLabels.forEach(function(name) {
      var lbl = document.getElementById('mg-mobius-' + name);
      if (!lbl) return;
      // Pulse opacity gently
      var phase = stateLabels.indexOf(name) / stateLabels.length;
      var pulse = 0.45 + Math.sin(t * 0.5 + phase * TAU) * 0.25;
      lbl.setAttribute('opacity', pulse.toFixed(3));
    });
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

      // Fold: 3-bounce dot-line-curve chain from each epitope
      // Bounce 1: hard (line), Bounce 2: soft (curve), Bounce 3: catch
      // Each fold gets smaller — energy dissipating
      var foldPos = [{x: ox, y: oy}];
      var foldAngle = oAngle + PI;
      for (var fi = 0; fi < 3; fi++) {
        var fprev = foldPos[fi];
        var fR = (3 - fi) * perturb;
        var fRate = PI * (1.7 + fi * 0.31 + oi * 0.07);
        var fA = t * fRate + foldAngle + fi * PI + PI/4;
        var fx = fprev.x + fR * Math.cos(fA);
        var fy = fprev.y + fR * Math.sin(fA);
        foldPos.push({x: fx, y: fy});
        var fDot = document.getElementById('mg-epi-fold-dot-' + oi + '-' + fi);
        if (fDot) {
          fDot.setAttribute('cx', fx.toFixed(1)); fDot.setAttribute('cy', fy.toFixed(1));
          fDot.setAttribute('opacity', (fi === 2 ? 0.4 * perturb : 0.25 * perturb * (1 - fi * 0.2)).toFixed(3));
        }
        var fLink = document.getElementById('mg-epi-fold-link-' + oi + '-' + fi);
        if (fLink) {
          if (fi % 2 === 0) {
            fLink.setAttribute('x1', fprev.x.toFixed(1)); fLink.setAttribute('y1', fprev.y.toFixed(1));
            fLink.setAttribute('x2', fx.toFixed(1)); fLink.setAttribute('y2', fy.toFixed(1));
          } else {
            var fmx = (fprev.x + fx) / 2, fmy = (fprev.y + fy) / 2;
            var fdx = fx - fprev.x, fdy = fy - fprev.y;
            var flen = Math.sqrt(fdx*fdx + fdy*fdy) || 1;
            var fperp = flen * 0.5 * ((oi + fi) % 2 === 0 ? 1 : -1);
            var fcpx = fmx + (-fdy/flen) * fperp;
            var fcpy = fmy + (fdx/flen) * fperp;
            fLink.setAttribute('d',
              'M ' + fprev.x.toFixed(1) + ' ' + fprev.y.toFixed(1) +
              ' Q ' + fcpx.toFixed(1) + ' ' + fcpy.toFixed(1) +
              ' ' + fx.toFixed(1) + ' ' + fy.toFixed(1));
          }
          fLink.setAttribute('stroke-opacity', (fi === 2 ? 0.35 * perturb : 0.18 * perturb * (1 - fi * 0.15)).toFixed(3));
        }
      }
    }
  }

  // ═══ DEPTH SPIRAL: dot-line-curve at 45° ═══
  // Pattern: ●━◜●━◜●━◜ — dot(node), line(hard), curve(soft), repeat
  // Forward starts at PI/4 (45°), each twist alternates opposite
  // Reverse runs backward, anti-twist traces the midpoint
  function animDepth(ac) {
    var t = ac.t, perturb = ac.perturb;
    var DEG45 = PI / 4;
    // Forward twist — dot-line-curve chain starting at 45°
    var depthPos = [{x: cx, y: cy}];
    for (var di = 0; di < 7; di++) {
      var dprev = depthPos[di];
      var dR = (4 + di * 1.5) * perturb;
      var dRate = PI * (1 + di * 0.13);
      var dAngle = t * dRate + di * PI + DEG45;
      var ddx = dprev.x + dR * Math.cos(dAngle);
      var ddy = dprev.y + dR * Math.sin(dAngle);
      depthPos.push({x: ddx, y: ddy});
      // Dot
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
      // Line (even) or Curve (odd)
      var dLink = document.getElementById('mg-depth-link-' + di);
      if (dLink) {
        if (di % 2 === 0) {
          // Straight line — hard body segment
        dLink.setAttribute('x1', dprev.x.toFixed(1)); dLink.setAttribute('y1', dprev.y.toFixed(1));
        dLink.setAttribute('x2', ddx.toFixed(1)); dLink.setAttribute('y2', ddy.toFixed(1));
        } else {
          // Curve — soft body arc, control point offset perpendicular
          var cmx = (dprev.x + ddx) / 2, cmy = (dprev.y + ddy) / 2;
          var cdx = ddx - dprev.x, cdy = ddy - dprev.y;
          var clen = Math.sqrt(cdx * cdx + cdy * cdy) || 1;
          var cperp = ((di % 4 === 1) ? 1 : -1) * clen * 0.4;
          var cpx = cmx + (-cdy / clen) * cperp;
          var cpy = cmy + (cdx / clen) * cperp;
          dLink.setAttribute('d',
            'M ' + dprev.x.toFixed(1) + ' ' + dprev.y.toFixed(1) +
            ' Q ' + cpx.toFixed(1) + ' ' + cpy.toFixed(1) +
            ' ' + ddx.toFixed(1) + ' ' + ddy.toFixed(1));
        }
        dLink.setAttribute('stroke-opacity', (0.15 * perturb).toFixed(3));
      }
    }
    // Reverse twist — backward, curves where forward has lines
    var revPos = [{x: cx, y: cy}];
    for (var ri = 0; ri < 7; ri++) {
      var rprev = revPos[ri];
      var rR = (4 + (6 - ri) * 1.5) * perturb;
      var rRate = PI * (1 + (6 - ri) * 0.13);
      var rAngle = -t * rRate + (6 - ri) * PI + PI/3 + DEG45;
      var rdx = rprev.x + rR * Math.cos(rAngle);
      var rdy = rprev.y + rR * Math.sin(rAngle);
      revPos.push({x: rdx, y: rdy});
      var rLink = document.getElementById('mg-depth-rev-' + ri);
      if (rLink) {
        if (ri % 2 === 1) {
          // Straight on reverse where forward curves
          rLink.setAttribute('x1', rprev.x.toFixed(1)); rLink.setAttribute('y1', rprev.y.toFixed(1));
          rLink.setAttribute('x2', rdx.toFixed(1)); rLink.setAttribute('y2', rdy.toFixed(1));
          } else {
          // Curve on reverse where forward is straight
          var rmx = (rprev.x + rdx) / 2, rmy = (rprev.y + rdy) / 2;
          var rvdx = rdx - rprev.x, rvdy = rdy - rprev.y;
          var rlen = Math.sqrt(rvdx * rvdx + rvdy * rvdy) || 1;
          var rperp = ((ri % 4 === 0) ? -1 : 1) * rlen * 0.35;
          var rcpx = rmx + (-rvdy / rlen) * rperp;
          var rcpy = rmy + (rvdx / rlen) * rperp;
          rLink.setAttribute('d',
            'M ' + rprev.x.toFixed(1) + ' ' + rprev.y.toFixed(1) +
            ' Q ' + rcpx.toFixed(1) + ' ' + rcpy.toFixed(1) +
            ' ' + rdx.toFixed(1) + ' ' + rdy.toFixed(1));
        }
        rLink.setAttribute('stroke-opacity', (0.08 * perturb).toFixed(3));
      }
    }
    // Anti-twist — traces midpoint of forward/reverse, π² wobble
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
    animFleetQuiet(ac);
    animNorthgate(ac);
    animTuebor(ac);
    animGeoIntra(ac);
    animMobius(ac);

    // Deep animations (lattice, stress, helix, convergence, stats, ring, overlay)
    if (window._membraneAnimateDeep) {
      window._membraneAnimateDeep(mc, ac, { cx:cx, cy:cy, R:R, PI:PI, TAU:TAU, lerp:lerp });
    }

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
    _membraneAnimateExt(mc, now);

    mc.lastFrame = now;
  };

  // ═══ EXT: extracted to pt-membrane-animate-ext.js ═══
  // _animChemistry, _animSolar, _animFocalHelix, _animNullData,
  // _animChipMonk, _animOrbitTwist, _animSpine, _animEvolution,
  // _animVDJRings, _membraneAnimateExt — loaded inline before this.

})();