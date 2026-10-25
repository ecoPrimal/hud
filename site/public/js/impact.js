// impact.js — when things TOUCH, energy transforms.
//
// Kinetic (moving) → Latent (heat/sound/color at contact) → Potential (tension before next)
//
// Collision detection across ALL animated HUD systems:
//   pendulum eyes, orbit dots, π null points, helix layers, heartbeat, shadow.
//
// Three senses of impact:
//   SOUND  — Web Audio oscillators. Pitch from velocity, timbre from element type.
//   HEAT   — warm glow at contact. Accumulates. Decays exponentially.
//   COLOR  — additive mixing of colliding elements' colors. Flash at intersection.
//
// Energy is conserved on the Klein surface. It just changes form.
(function () {
  'use strict';

  var PI = Math.PI, TAU = PI * 2;

  // ═══ ENERGY MODEL ═══
  // Each pair of trackable objects has: { kinetic, latent, potential }
  // kinetic = |approach_speed|    latent = heat/glow after impact    potential = tension building
  var PAIRS = {};    // key = 'a:b', value = { kinetic, latent, potential, lastDist }
  var IMPACTS = [];  // recent impact events for rendering
  var MAX_IMPACTS = 24;

  // collision threshold in normalized screen units (0–1)
  var IMPACT_THRESHOLD = 0.035;  // ~35px on 1000px screen
  var HEAT_DECAY = 0.92;         // exponential decay per frame
  var POTENTIAL_RATE = 0.003;    // tension builds slowly as elements approach

  // ═══ AUDIO CONTEXT — lazy, requires user gesture ═══
  var audioCtx = null;
  var audioUnlocked = false;
  var masterGain = null;

  function ensureAudio() {
    if (audioCtx) return true;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.08; // quiet — ambient, not intrusive
      masterGain.connect(audioCtx.destination);
      audioUnlocked = true;
      return true;
    } catch (e) { return false; }
  }

  // unlock on first click/touch
  function unlockAudio() {
    if (audioUnlocked) return;
    ensureAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }
  document.addEventListener('click', unlockAudio, { once: false });
  document.addEventListener('touchstart', unlockAudio, { once: false });

  // ═══ SOUND SYNTHESIS ═══
  // Different timbres for different collision types
  var TIMBRES = {
    orbit_orbit:    { type: 'sine',     attack: 0.01, decay: 0.4,  baseHz: 440  },  // bell
    orbit_null:     { type: 'triangle', attack: 0.02, decay: 0.8,  baseHz: 110  },  // hum
    pendulum_fold:  { type: 'square',   attack: 0.001, decay: 0.05, baseHz: 880 },  // tick
    pendulum_orbit: { type: 'sine',     attack: 0.01, decay: 0.3,  baseHz: 330  },  // chime
    heartbeat:      { type: 'sine',     attack: 0.01, decay: 0.6,  baseHz: 55   },  // thump
    helix_align:    { type: 'sawtooth', attack: 0.05, decay: 1.0,  baseHz: 165  },  // drone
    default:        { type: 'sine',     attack: 0.01, decay: 0.3,  baseHz: 220  }
  };

  function playImpactSound(timbreKey, velocity, energy) {
    if (!audioCtx || audioCtx.state !== 'running') return;

    var t = TIMBRES[timbreKey] || TIMBRES.default;
    var now = audioCtx.currentTime;

    // frequency scales with velocity (faster approach = higher pitch)
    var hz = t.baseHz * (1 + velocity * 2);
    hz = Math.max(40, Math.min(hz, 4000));

    // create oscillator
    var osc = audioCtx.createOscillator();
    osc.type = t.type;
    osc.frequency.setValueAtTime(hz, now);
    // slight detune for organic feel
    osc.detune.setValueAtTime((Math.random() - 0.5) * 20, now);

    // envelope
    var env = audioCtx.createGain();
    var amp = Math.min(0.3, energy * 0.15);
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(amp, now + t.attack);
    env.gain.exponentialRampToValueAtTime(0.001, now + t.attack + t.decay);

    osc.connect(env);
    env.connect(masterGain);
    osc.start(now);
    osc.stop(now + t.attack + t.decay + 0.05);
  }

  // ═══ HEAT RENDERING ═══
  var heatContainer = null;

  function ensureHeatContainer() {
    if (heatContainer) return heatContainer;
    heatContainer = document.createElement('div');
    heatContainer.id = 'impact-heat-layer';
    heatContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'pointer-events:none;z-index:9996;overflow:hidden';
    document.body.appendChild(heatContainer);
    return heatContainer;
  }

  function createHeatSpot(x, y, color, intensity) {
    var container = ensureHeatContainer();
    var spot = document.createElement('div');
    spot.className = 'impact-heat-spot';
    var size = 20 + intensity * 60;
    spot.style.cssText = 'position:absolute;' +
      'left:' + (x - size / 2) + 'px;top:' + (y - size / 2) + 'px;' +
      'width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
      'background:radial-gradient(circle,' + color + ' 0%,transparent 70%);' +
      'opacity:' + Math.min(0.6, intensity * 0.3).toFixed(2) + ';' +
      'mix-blend-mode:screen;transition:opacity 0.1s';
    spot.dataset.born = Date.now();
    spot.dataset.life = (1000 + intensity * 2000).toFixed(0);
    container.appendChild(spot);
    return spot;
  }

  function decayHeatSpots() {
    if (!heatContainer) return;
    var spots = heatContainer.querySelectorAll('.impact-heat-spot');
    var now = Date.now();
    for (var i = 0; i < spots.length; i++) {
      var age = now - parseInt(spots[i].dataset.born);
      var life = parseInt(spots[i].dataset.life);
      if (age > life) {
        spots[i].remove();
      } else {
        var fade = 1 - (age / life);
        spots[i].style.opacity = (fade * 0.4).toFixed(3);
      }
    }
  }

  // ═══ COLOR FLASH ═══
  function blendColors(c1, c2) {
    // additive mix of two hex colors
    var r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
    var r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
    var r = Math.min(255, r1 + r2), g = Math.min(255, g1 + g2), b = Math.min(255, b1 + b2);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function createColorFlash(x, y, c1, c2, intensity) {
    var container = ensureHeatContainer();
    var flash = document.createElement('div');
    var blended = blendColors(c1, c2);
    var size = 6 + intensity * 12;
    flash.style.cssText = 'position:absolute;' +
      'left:' + (x - size / 2) + 'px;top:' + (y - size / 2) + 'px;' +
      'width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
      'background:' + blended + ';opacity:' + Math.min(0.7, intensity * 0.4).toFixed(2) + ';' +
      'mix-blend-mode:screen;pointer-events:none;' +
      'animation:impact-flash 0.6s ease-out forwards';
    container.appendChild(flash);
    setTimeout(function () { if (flash.parentNode) flash.remove(); }, 700);
  }

  // CSS animation for flash
  (function injectCSS() {
    if (document.getElementById('impact-css')) return;
    var style = document.createElement('style');
    style.id = 'impact-css';
    style.textContent =
      '@keyframes impact-flash{0%{transform:scale(1);opacity:0.7}' +
      '50%{transform:scale(2.5);opacity:0.4}100%{transform:scale(4);opacity:0}}' +
      '@keyframes impact-ripple{0%{transform:scale(0);opacity:0.5;border-width:2px}' +
      '100%{transform:scale(3);opacity:0;border-width:0.5px}}';
    document.head.appendChild(style);
  })();

  // ═══ TRACKABLE OBJECTS — gather positions of all animated elements ═══
  function gatherBodies() {
    var bodies = [];
    var vw = window.innerWidth, vh = window.innerHeight;

    // 1. ORBIT DOTS (from null-kaleidoscope.js)
    var orbitNames = ['real', 'imaginary', 'mechanical', 'unreal'];
    var orbitColors = ['#3fb950', '#d2a8ff', '#8b9ba8', '#f0883e'];
    for (var oi = 0; oi < orbitNames.length; oi++) {
      var dot = document.getElementById('orbit-dot-' + orbitNames[oi]);
      if (dot) {
        var cx = parseFloat(dot.getAttribute('cx'));
        var cy = parseFloat(dot.getAttribute('cy'));
        var svg = dot.closest('svg');
        if (svg) {
          var rect = svg.getBoundingClientRect();
          bodies.push({
            id: 'orbit-' + orbitNames[oi],
            type: 'orbit',
            x: (rect.left + cx) / vw,
            y: (rect.top + cy) / vh,
            screenX: rect.left + cx,
            screenY: rect.top + cy,
            color: orbitColors[oi],
            mass: 1.0
          });
        }
      }
    }

    // 2. π NULL POINTS (from null-kaleidoscope.js)
    var nullColors = ['#3fb950', '#d2a8ff', '#8b9ba8'];
    for (var ni = 0; ni < 3; ni++) {
      var nDot = document.getElementById('pi-null-' + ni);
      if (nDot) {
        var ncx = parseFloat(nDot.getAttribute('cx'));
        var ncy = parseFloat(nDot.getAttribute('cy'));
        var nsvg = nDot.closest('svg');
        if (nsvg) {
          var nrect = nsvg.getBoundingClientRect();
          bodies.push({
            id: 'null-' + ni,
            type: 'null',
            x: (nrect.left + ncx) / vw,
            y: (nrect.top + ncy) / vh,
            screenX: nrect.left + ncx,
            screenY: nrect.top + ncy,
            color: nullColors[ni],
            mass: 0.5  // lighter — they're null points
          });
        }
      }
    }

    // 3. PENDULUM DOTS (from pendulum-eyes.js)
    var pDots = document.querySelectorAll('#pendulum-dots span');
    for (var pi = 0; pi < pDots.length; pi++) {
      var pLeft = parseFloat(pDots[pi].style.left) / 100;
      bodies.push({
        id: 'pendulum-' + pi,
        type: 'pendulum',
        x: pLeft,
        y: 0.5,  // always on the 50% horizontal line
        screenX: pLeft * vw,
        screenY: vh * 0.5,
        color: '#d2a8ff',
        mass: 0.3
      });
    }

    // 4. PENDULUM FOLD POINT
    var foldEl = document.getElementById('pendulum-fold');
    if (foldEl) {
      bodies.push({
        id: 'fold-point',
        type: 'fold',
        x: 0.5,
        y: 0.5,
        screenX: vw * 0.5,
        screenY: vh * 0.5,
        color: '#d2a8ff',
        mass: 2.0  // heavy — the fold is significant
      });
    }

    // 5. IRON PEAK HEARTBEAT (temporal body — pulsing at bottom-left)
    var heartEl = document.getElementById('iron-peak-heart');
    if (heartEl) {
      var hRect = heartEl.getBoundingClientRect();
      bodies.push({
        id: 'heartbeat',
        type: 'heartbeat',
        x: (hRect.left + hRect.width / 2) / vw,
        y: (hRect.top + hRect.height / 2) / vh,
        screenX: hRect.left + hRect.width / 2,
        screenY: hRect.top + hRect.height / 2,
        color: '#f0883e',
        mass: 3.0  // heavy — the heart drives everything
      });
    }

    // 6. KALEIDOSCOPE RING CENTER
    var kRing = document.getElementById('kaleid-ring');
    if (kRing) {
      var kcx = parseFloat(kRing.getAttribute('cx'));
      var kcy = parseFloat(kRing.getAttribute('cy'));
      var ksvg = kRing.closest('svg');
      if (ksvg) {
        var krect = ksvg.getBoundingClientRect();
        bodies.push({
          id: 'kaleid-center',
          type: 'center',
          x: (krect.left + kcx) / vw,
          y: (krect.top + kcy) / vh,
          screenX: krect.left + kcx,
          screenY: krect.top + kcy,
          color: '#3fb950',
          mass: 1.5
        });
      }
    }

    // 7. CHROMATOGRAPH DOTS (from klein-window.js — bottom-right)
    var kleinOverlay = document.getElementById('klein-window-overlay');
    if (kleinOverlay) {
      var chromaDots = kleinOverlay.querySelectorAll('[style*="border-radius:50%"]');
      var chromaColors = ['#58a6ff', '#d2a8ff', '#3fb950', '#e85d3a', '#f0883e'];
      for (var ci = 0; ci < chromaDots.length; ci++) {
        var cRect = chromaDots[ci].getBoundingClientRect();
        bodies.push({
          id: 'chroma-' + ci,
          type: 'chroma',
          x: (cRect.left + cRect.width / 2) / vw,
          y: (cRect.top + cRect.height / 2) / vh,
          screenX: cRect.left + cRect.width / 2,
          screenY: cRect.top + cRect.height / 2,
          color: chromaColors[ci] || '#ffffff',
          mass: 0.2
        });
      }
    }

    return bodies;
  }

  // ═══ COLLISION DETECTION ═══
  var prevBodies = {};

  function detectCollisions(bodies) {
    var collisions = [];
    var currPositions = {};

    // store current positions for velocity calc
    for (var b = 0; b < bodies.length; b++) {
      currPositions[bodies[b].id] = { x: bodies[b].x, y: bodies[b].y };
    }

    // pairwise distance check
    for (var i = 0; i < bodies.length; i++) {
      for (var j = i + 1; j < bodies.length; j++) {
        var a = bodies[i], bObj = bodies[j];
        var dx = a.x - bObj.x, dy = a.y - bObj.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        var pairKey = a.id + ':' + bObj.id;
        var pair = PAIRS[pairKey] || { kinetic: 0, latent: 0, potential: 0, lastDist: dist, impacted: false };

        // velocity = change in distance per frame
        var approach = pair.lastDist - dist;  // positive = getting closer
        pair.kinetic = Math.max(0, approach);

        // IMPACT CHECK
        if (dist < IMPACT_THRESHOLD && !pair.impacted) {
          // IMPACT! kinetic → latent
          var energy = pair.kinetic + pair.potential;
          pair.latent += energy;
          pair.kinetic = 0;
          pair.potential = 0;
          pair.impacted = true;

          collisions.push({
            a: a, b: bObj,
            dist: dist,
            energy: energy,
            midX: (a.screenX + bObj.screenX) / 2,
            midY: (a.screenY + bObj.screenY) / 2
          });
        }

        // separating: reset impact flag, build potential
        if (dist > IMPACT_THRESHOLD * 1.5) {
          pair.impacted = false;
          // potential builds as they approach
          if (approach > 0) {
            pair.potential += approach * POTENTIAL_RATE;
          }
        }

        // latent decays
        pair.latent *= HEAT_DECAY;

        pair.lastDist = dist;
        PAIRS[pairKey] = pair;
      }
    }

    prevBodies = currPositions;
    return collisions;
  }

  // ═══ DETERMINE TIMBRE ═══
  function getTimbre(a, b) {
    var types = [a.type, b.type].sort().join('_');
    if (types.indexOf('orbit') !== -1 && types.indexOf('null') !== -1) return 'orbit_null';
    if (types === 'orbit_orbit') return 'orbit_orbit';
    if (types.indexOf('pendulum') !== -1 && types.indexOf('fold') !== -1) return 'pendulum_fold';
    if (types.indexOf('pendulum') !== -1 && types.indexOf('orbit') !== -1) return 'pendulum_orbit';
    if (types.indexOf('heartbeat') !== -1) return 'heartbeat';
    if (types.indexOf('helix') !== -1) return 'helix_align';
    return 'default';
  }

  // ═══ PROCESS IMPACTS ═══
  function processImpacts(collisions) {
    for (var i = 0; i < collisions.length; i++) {
      var c = collisions[i];
      var timbre = getTimbre(c.a, c.b);
      var energy = Math.min(c.energy * 10, 3); // normalize

      // SOUND
      playImpactSound(timbre, c.energy, energy);

      // HEAT
      var heatColor = blendColors(c.a.color, c.b.color);
      createHeatSpot(c.midX, c.midY, heatColor, energy);

      // COLOR flash
      createColorFlash(c.midX, c.midY, c.a.color, c.b.color, energy);

      // store for indicator
      IMPACTS.push({
        ts: Date.now(),
        a: c.a.id,
        b: c.b.id,
        energy: energy,
        timbre: timbre
      });
      if (IMPACTS.length > MAX_IMPACTS) IMPACTS.shift();
    }
  }

  // ═══ ENERGY INDICATOR ═══
  function createIndicator() {
    var el = document.getElementById('impact-indicator');
    if (el) return el;

    el = document.createElement('div');
    el.id = 'impact-indicator';
    el.style.cssText = 'position:fixed;top:12px;right:12px;z-index:9999;' +
      'font:8px SF Mono,monospace;color:#484f58;pointer-events:none;opacity:0.5;' +
      'text-align:right;max-width:180px';
    document.body.appendChild(el);
    return el;
  }

  function updateIndicator() {
    var el = createIndicator();
    if (!el) return;

    // sum energy across all pairs
    var totalKinetic = 0, totalLatent = 0, totalPotential = 0;
    var pairKeys = Object.keys(PAIRS);
    for (var i = 0; i < pairKeys.length; i++) {
      var p = PAIRS[pairKeys[i]];
      totalKinetic += p.kinetic;
      totalLatent += p.latent;
      totalPotential += p.potential;
    }

    var totalEnergy = totalKinetic + totalLatent + totalPotential;
    if (totalEnergy < 0.001) totalEnergy = 0;

    // color based on dominant energy type
    var color = totalLatent > totalKinetic && totalLatent > totalPotential
      ? '#f0883e'  // orange — hot from impacts
      : totalKinetic > totalPotential
        ? '#3fb950'  // green — things moving
        : '#d2a8ff'; // violet — tension building

    var recentImpacts = IMPACTS.filter(function (imp) { return Date.now() - imp.ts < 5000; }).length;

    el.style.color = color;
    el.innerHTML = '⚡ ' + totalEnergy.toFixed(3) +
      '<br><span style="color:#3fb950">K:' + totalKinetic.toFixed(3) + '</span>' +
      ' <span style="color:#f0883e">L:' + totalLatent.toFixed(3) + '</span>' +
      ' <span style="color:#d2a8ff">P:' + totalPotential.toFixed(3) + '</span>' +
      (recentImpacts > 0 ? '<br><span style="color:#f0e68c">💥' + recentImpacts + '</span>' : '') +
      (audioUnlocked ? '' : '<br><span style="color:#6e7681">🔇 click for sound</span>');

    // pulse on impact
    if (recentImpacts > 0) {
      el.style.opacity = '0.8';
      setTimeout(function () { el.style.opacity = '0.5'; }, 300);
    }
  }

  // ═══ HEARTBEAT SYNC — temporal collisions ═══
  // The heartbeat is a temporal body: it impacts all spatial bodies every π seconds
  var lastBeat = 0;
  function checkHeartbeatSync() {
    if (!window._ironPeak) return;
    var currentBeat = window._ironPeak.beatCount();
    if (currentBeat !== lastBeat) {
      lastBeat = currentBeat;
      // heartbeat sends a temporal shockwave — creates heat at heart location
      var heartEl = document.getElementById('iron-peak-heart');
      if (heartEl) {
        var hRect = heartEl.getBoundingClientRect();
        var hx = hRect.left + hRect.width / 2;
        var hy = hRect.top + hRect.height / 2;

        // the heartbeat pushes heat out in a ring
        createHeatSpot(hx, hy, 'rgba(240,136,62,0.3)', 1.5);
        playImpactSound('heartbeat', 0.3, 1.0);

        IMPACTS.push({
          ts: Date.now(),
          a: 'heartbeat',
          b: 'all',
          energy: 1.0,
          timbre: 'heartbeat'
        });
        if (IMPACTS.length > MAX_IMPACTS) IMPACTS.shift();
      }
    }
  }

  // ═══ HELIX ALIGNMENT DETECTION ═══
  // When counter-rotating layers align (angle difference → 0), that's an impact
  var lastHelixAngles = {};
  function checkHelixAlignment() {
    if (!window._helixTwist) return;
    var layers = window._helixTwist.findLayers();
    if (!layers || layers.length < 2) return;

    var TWIST_ANGLE = 45 / PI;
    for (var i = 0; i < layers.length - 1; i++) {
      var curr = (i * TWIST_ANGLE) % 180;
      var next = ((i + 1) * TWIST_ANGLE) % 180;
      var diff = Math.abs(curr - next);

      var key = 'helix-' + i + ':' + (i + 1);
      var prev = lastHelixAngles[key] || diff;

      // alignment = angle difference crossing through small value
      if (prev > 5 && diff < 3) {
        playImpactSound('helix_align', 0.1, 0.5);
        IMPACTS.push({
          ts: Date.now(),
          a: 'helix-' + i,
          b: 'helix-' + (i + 1),
          energy: 0.5,
          timbre: 'helix_align'
        });
      }
      lastHelixAngles[key] = diff;
    }
  }

  // ═══ MAIN LOOP ═══
  var frameCount = 0;

  function tick(t) {
    frameCount++;

    // gather all moving bodies
    var bodies = gatherBodies();

    // detect spatial collisions (every frame)
    var collisions = detectCollisions(bodies);

    // process: sound + heat + color
    if (collisions.length > 0) {
      processImpacts(collisions);
    }

    // decay heat spots
    if (frameCount % 3 === 0) {
      decayHeatSpots();
    }

    // check temporal impacts (heartbeat) every ~30 frames
    if (frameCount % 30 === 0) {
      checkHeartbeatSync();
    }

    // check helix alignment every ~60 frames
    if (frameCount % 60 === 0) {
      checkHelixAlignment();
    }

    // update indicator every ~20 frames
    if (frameCount % 20 === 0) {
      updateIndicator();
    }

    requestAnimationFrame(tick);
  }

  // ═══ EXPOSE ═══
  window._impact = {
    pairs: function () { return PAIRS; },
    impacts: function () { return IMPACTS; },
    bodies: gatherBodies,
    energy: function () {
      var k = 0, l = 0, p = 0;
      var keys = Object.keys(PAIRS);
      for (var i = 0; i < keys.length; i++) {
        k += PAIRS[keys[i]].kinetic;
        l += PAIRS[keys[i]].latent;
        p += PAIRS[keys[i]].potential;
      }
      return { kinetic: k, latent: l, potential: p, total: k + l + p };
    },
    mute: function () { if (masterGain) masterGain.gain.value = 0; },
    unmute: function () { if (masterGain) masterGain.gain.value = 0.08; },
    volume: function (v) { if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v)); }
  };

  // ═══ BOOT ═══
  function boot() {
    createIndicator();
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 3500); });
  } else {
    setTimeout(boot, 3500);
  }
})();
