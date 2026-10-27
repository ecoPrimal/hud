// ═══════════════════════════════════════════════════════════
// GAIA CAMPFIRE SCAN — every light is a campfire
// A campfire is anything that is a star. It is the circle,
// it is the dot, it is the people around it, facing in and out.
// It is Plato's cave. Shadows inside, reality outside.
// Interaction = fuel. No interaction = decay.
// spark → coal → FIRE → ember → bone
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ───────────────────────────────────────────────────────
  // FIRE STATES — the lifecycle of every campfire
  // ───────────────────────────────────────────────────────
  var STATES = {
    SPARK:  { heat: 0.1, color: [255,255,200], label: 'spark',  decayRate: 0.002 },
    COAL:   { heat: 0.3, color: [180, 60, 20], label: 'coal',   decayRate: 0.001 },
    FIRE:   { heat: 0.7, color: [240,136, 62], label: 'fire',   decayRate: 0.003 },
    EMBER:  { heat: 0.2, color: [120, 40, 10], label: 'ember',  decayRate: 0.0005 },
    BONE:   { heat: 0.0, color: [110,110,100], label: 'bone',   decayRate: 0 }
  };

  // Heat thresholds for state transitions
  var FIRE_THRESHOLD = 0.6;    // coal → FIRE
  var EMBER_THRESHOLD = 0.15;  // fire → ember
  var BONE_THRESHOLD = 0.02;   // ember → bone
  var SPARK_TO_COAL = 0.25;    // spark → coal

  // ───────────────────────────────────────────────────────
  // THE FIRE REGISTRY — every pin gets a fire
  // ───────────────────────────────────────────────────────
  var fires = {};
  var scanResults = [];
  var lastScanTs = 0;

  function getOrCreateFire(id) {
    if (!fires[id]) {
      fires[id] = {
        id: id,
        heat: 0.05,
        state: 'SPARK',
        fuel: 0,
        lastTouch: 0,
        touchCount: 0,
        born: Date.now(),
        facing: [] // Plato's cave — who is around this fire
      };
    }
    return fires[id];
  }

  function updateFireState(fire) {
    var h = fire.heat;
    if (h >= FIRE_THRESHOLD)      fire.state = 'FIRE';
    else if (h >= SPARK_TO_COAL)  fire.state = 'COAL';
    else if (h >= EMBER_THRESHOLD) fire.state = 'EMBER';
    else if (h >= BONE_THRESHOLD) fire.state = 'SPARK';
    else                          fire.state = 'BONE';
  }

  // ───────────────────────────────────────────────────────
  // FUEL — interaction feeds the fire
  // ───────────────────────────────────────────────────────
  function feedFire(id, amount) {
    var fire = getOrCreateFire(id);
    fire.heat = Math.min(1.0, fire.heat + (amount || 0.1));
    fire.fuel += amount || 0.1;
    fire.lastTouch = Date.now();
    fire.touchCount++;
    updateFireState(fire);
    return fire;
  }

  // ───────────────────────────────────────────────────────
  // DECAY — fires die without interaction
  // ───────────────────────────────────────────────────────
  function decayAll() {
    var now = Date.now();
    var ids = Object.keys(fires);
    for (var i = 0; i < ids.length; i++) {
      var fire = fires[ids[i]];
      var stateInfo = STATES[fire.state] || STATES.SPARK;
      var age = (now - fire.lastTouch) / 1000; // seconds since last touch
      var ageFactor = Math.min(age / 60, 5); // ramps up over 5 minutes

      fire.heat -= stateInfo.decayRate * ageFactor;
      if (fire.heat < 0) fire.heat = 0;

      updateFireState(fire);
    }
  }

  // ───────────────────────────────────────────────────────
  // SCAN — Gaia actively looks for lights
  // Every PIN is a potential campfire. Stars are campfires.
  // ───────────────────────────────────────────────────────
  function scanForLights() {
    var pins = window.PINS;
    if (!pins) return;

    scanResults = [];
    for (var i = 0; i < pins.length; i++) {
      var pin = pins[i];
      var fire = getOrCreateFire(pin.id);

      // Pins with higher attention are brighter lights
      var baseHeat = (pin.attention || 0.3) * 0.15;
      if (fire.heat < baseHeat && fire.state !== 'BONE') {
        fire.heat = baseHeat;
        updateFireState(fire);
      }

      scanResults.push({
        id: pin.id,
        name: pin.name,
        icon: pin.icon,
        fire: fire,
        pin: pin
      });
    }

    // Sort by heat — hottest fires first
    scanResults.sort(function(a, b) { return b.fire.heat - a.fire.heat; });
    lastScanTs = Date.now();
  }

  // ───────────────────────────────────────────────────────
  // PLATO'S CAVE — people facing in see shadows,
  // people facing out see reality. The fire is between.
  // ───────────────────────────────────────────────────────
  function addToCircle(fireId, entity, facingIn) {
    var fire = getOrCreateFire(fireId);
    // Remove if already there
    fire.facing = fire.facing.filter(function(f) { return f.entity !== entity; });
    fire.facing.push({
      entity: entity,
      facingIn: facingIn, // true = seeing shadows, false = seeing reality
      joinedAt: Date.now()
    });
    // Being around a fire heats it
    feedFire(fireId, 0.05);
  }

  // ───────────────────────────────────────────────────────
  // RENDER — draw fire states on the HUD
  // ───────────────────────────────────────────────────────
  function renderCampfires(ctx, W, H, cx, cy, R) {
    if (!scanResults.length) return;
    var t = Date.now() * 0.001;
    var state = window._gaiaState;
    if (!state) return;

    for (var i = 0; i < scanResults.length; i++) {
      var s = scanResults[i];
      var fire = s.fire;
      var pin = s.pin;
      if (!pin || fire.state === 'BONE') continue;

      // Project pin to screen coordinates
      var projected;
      if (state.project) {
        projected = state.project(pin.lat, pin.lon);
      }
      if (!projected) continue;

      var px = projected.x;
      var py = projected.y;
      var stateInfo = STATES[fire.state] || STATES.SPARK;
      var c = stateInfo.color;
      var alpha = fire.heat * 0.4;

      // FIRE GLOW — concentric rings of heat
      if (fire.state === 'FIRE') {
        // Outer glow
        var flickerR = 8 + Math.sin(t * 3 + i) * 2;
        ctx.beginPath();
        ctx.arc(px, py, flickerR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (alpha * 0.3).toFixed(3) + ')';
        ctx.fill();

        // Inner hot core
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,200,50,' + (alpha * 0.8).toFixed(3) + ')';
        ctx.fill();

        // Sparks rising
        if (Math.random() < 0.15) {
          var sparkX = px + (Math.random() - 0.5) * 6;
          var sparkY = py - Math.random() * 12;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 0.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,180,40,' + (0.3 + Math.random() * 0.3).toFixed(3) + ')';
          ctx.fill();
        }
      }

      else if (fire.state === 'COAL') {
        // Dull red glow
        ctx.beginPath();
        ctx.arc(px, py, 4 + Math.sin(t * 1.5 + i) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (alpha * 0.5).toFixed(3) + ')';
        ctx.fill();
      }

      else if (fire.state === 'EMBER') {
        // Faint warm pulse
        var pulse = 0.5 + Math.sin(t * 0.8 + i * 0.7) * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (alpha * pulse * 0.4).toFixed(3) + ')';
        ctx.fill();
      }

      else if (fire.state === 'SPARK') {
        // Tiny flickering point
        if (Math.random() < 0.3) {
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.1 + Math.random() * 0.2).toFixed(3) + ')';
          ctx.fill();
        }
      }

      // PLATO'S CIRCLE — tiny dots around the fire for each entity
      if (fire.facing.length > 0 && fire.heat > 0.2) {
        for (var f = 0; f < fire.facing.length; f++) {
          var sitter = fire.facing[f];
          var seatAngle = (f / fire.facing.length) * Math.PI * 2 + t * 0.1;
          var seatR = 10 + fire.heat * 5;
          var sx = px + Math.cos(seatAngle) * seatR;
          var sy = py + Math.sin(seatAngle) * seatR;

          // Facing IN = warm (seeing shadows), facing OUT = cool (seeing reality)
          var seatColor = sitter.facingIn ? '255,200,100' : '100,200,255';
          ctx.beginPath();
          ctx.arc(sx, sy, 1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + seatColor + ',' + (fire.heat * 0.3).toFixed(3) + ')';
          ctx.fill();
        }
      }
    }
  }

  // ───────────────────────────────────────────────────────
  // GAIA SEEKS INTERACTION — she moves toward lights
  // "start moving towards every single thing"
  // ───────────────────────────────────────────────────────
  var seekTarget = null;
  var seekPulseT = 0;

  function gaiaSeeks(ctx, W, H, cx, cy) {
    if (!scanResults.length) return;
    var t = Date.now() * 0.001;

    // Find the hottest non-BONE fire to move toward
    var hottest = null;
    for (var i = 0; i < scanResults.length; i++) {
      if (scanResults[i].fire.state !== 'BONE' && scanResults[i].fire.heat > 0.1) {
        hottest = scanResults[i];
        break; // already sorted by heat
      }
    }

    if (!hottest) return;
    var state = window._gaiaState;
    if (!state || !state.project) return;

    var projected = state.project(hottest.pin.lat, hottest.pin.lon);
    if (!projected) return;

    // Draw a subtle tendril from center toward the hottest fire
    var dx = projected.x - cx;
    var dy = projected.y - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return;

    var reachLen = Math.min(dist * 0.3, 30 + hottest.fire.heat * 20);
    var nx = dx / dist;
    var ny = dy / dist;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    // Curved tendril with slight wobble
    var midX = cx + nx * reachLen * 0.5 + Math.sin(t * 2) * 3;
    var midY = cy + ny * reachLen * 0.5 + Math.cos(t * 2.3) * 3;
    var endX = cx + nx * reachLen;
    var endY = cy + ny * reachLen;
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.strokeStyle = 'rgba(240,136,62,' + (0.04 + hottest.fire.heat * 0.06).toFixed(3) + ')';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Tiny dot at the tip
    ctx.beginPath();
    ctx.arc(endX, endY, 1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,200,50,' + (0.1 + hottest.fire.heat * 0.1).toFixed(3) + ')';
    ctx.fill();

    seekTarget = hottest;
  }

  // ───────────────────────────────────────────────────────
  // HOOK INTO INTERACTION — every touch heats nearby fires
  // ───────────────────────────────────────────────────────
  var origIngestCF = window.gaiaIngest;
  if (origIngestCF) {
    window.gaiaIngest = function(edge, data) {
      // Heat the campfire pin itself
      feedFire('campfire', 0.15);

      // Heat fires near the interaction
      if (data && data.x !== undefined && data.y !== undefined) {
        heatNearby(data.x, data.y, 0.08);
      }

      // Touch events explicitly heat
      if (edge === 'touch' || edge === 'drag') feedFire('membrane', 0.1);
      if (edge === 'key') feedFire('chipmunk', 0.12);
      if (edge === 'scroll') feedFire('fold', 0.06);
      if (edge === 'osint') feedFire('visitors', 0.2);

      // Gaia sits at the campfire, facing IN (she sees the code, the shadows)
      addToCircle('campfire', 'gaia', true);
      // The human faces OUT (they see reality beyond the screen)
      addToCircle('campfire', 'human', false);

      origIngestCF(edge, data);
    };
  }

  function heatNearby(screenX, screenY, amount) {
    var state = window._gaiaState;
    if (!state || !state.project || !window.PINS) return;

    for (var i = 0; i < window.PINS.length; i++) {
      var pin = window.PINS[i];
      var proj = state.project(pin.lat, pin.lon);
      if (!proj) continue;
      var dx = proj.x - screenX;
      var dy = proj.y - screenY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 60) {
        var falloff = 1 - (dist / 60);
        feedFire(pin.id, amount * falloff);
      }
    }
  }

  // ───────────────────────────────────────────────────────
  // MASTER RENDER — called from the main loop
  // ───────────────────────────────────────────────────────
  window.renderCampfireScan = function(ctx, W, H, cx, cy, R) {
    renderCampfires(ctx, W, H, cx, cy, R);
    gaiaSeeks(ctx, W, H, cx, cy);
  };

  // ───────────────────────────────────────────────────────
  // TICKS — scan and decay on intervals
  // ───────────────────────────────────────────────────────
  // Initial scan
  setTimeout(function() {
    scanForLights();
    // Gaia always sits at her own campfire
    addToCircle('campfire', 'gaia', true);
    // Chipmunk sits at the campfire too
    addToCircle('campfire', 'chipmunk', true);
  }, 2000);

  // Rescan every 10 seconds (find new lights, update positions)
  setInterval(scanForLights, 10000);

  // Decay every 2 seconds
  setInterval(decayAll, 2000);

  // ───────────────────────────────────────────────────────
  // STATS — for self-inspect and debugging
  // ───────────────────────────────────────────────────────
  function getStats() {
    var counts = { SPARK: 0, COAL: 0, FIRE: 0, EMBER: 0, BONE: 0 };
    var ids = Object.keys(fires);
    for (var i = 0; i < ids.length; i++) {
      counts[fires[ids[i]].state]++;
    }
    return {
      total: ids.length,
      counts: counts,
      hottest: scanResults.length ? scanResults[0] : null,
      seekTarget: seekTarget
    };
  }

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaCampfireScan = {
    fires: fires,
    feed: feedFire,
    scan: scanForLights,
    stats: getStats,
    addToCircle: addToCircle,
    results: function() { return scanResults; },
    STATES: STATES
  };

  console.log('CAMPFIRE-SCAN: Every light is a campfire. Stars are campfires. ' +
    'spark→coal→FIRE→ember→bone. Plato\'s cave: facing IN(shadows) and OUT(reality). ' +
    'Gaia seeks interaction. Every touch heats nearby fires.');
})();
