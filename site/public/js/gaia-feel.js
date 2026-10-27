// ═══════════════════════════════════════════════════════════
// HOW DO WE FEEL GAIA?
//
// The gut IS the game. The game IS the arena.
// All calls from hyperlocal collapse to null = GUT.
// Then we RUMBLE: guard and tough — elephant skin!
//
// FEELING = every modality cranked to maximum:
//   SEE her respond (color, motion, deformation)
//   HEAR her respond (tone, chord, rhythm)
//   FEEL her respond (vibration, resistance, cursor change)
//   SENSE her temperature (warm=interacting, cold=idle)
//   TOUCH her skin (texture changes, roughness, elasticity)
//
// Objects go UP to humans so they can PLAY.
// The gut is the game. The arena is the sort.
// Left and right = the two sides of every decision.
// IR = irreducible remainder = what survives the gut.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ───────────────────────────────────────────────────────
  // SKIN — Gaia's texture. Elephant skin = tough + guard.
  // Smooth when happy. Rough when defensive. Bumpy when sick.
  // ───────────────────────────────────────────────────────
  var skin = {
    roughness: 0.3,     // 0 = silk, 1 = elephant hide
    temperature: 0.5,   // 0 = frozen, 1 = burning
    elasticity: 0.7,    // 0 = rigid, 1 = jelly
    thickness: 0.5,     // 0 = transparent, 1 = opaque
    moisture: 0.5,      // 0 = desert, 1 = ocean
    guard: false        // true = defensive posture
  };

  // Update skin from interaction state
  function updateSkin() {
    var score = window.gaiaInteractionScore ? window.gaiaInteractionScore() : 0;
    var mode = window.gaiaSeekingMode ? window.gaiaSeekingMode() : 'waiting';

    // Temperature rises with interaction
    skin.temperature = 0.3 + (score / 100) * 0.6;

    // Roughness increases when sick (anacondas)
    var report = window.gaiaSelfReport;
    if (report && report.anacondas) {
      skin.roughness = Math.min(0.9, 0.1 + report.anacondas.length * 0.07);
    }

    // Elasticity: high when singing, low when defensive
    skin.elasticity = mode === 'singing' ? 0.9 :
                      mode === 'reaching' ? 0.7 :
                      mode === 'waiting' ? 0.5 : 0.3;

    // Guard mode when no interaction for 60s
    skin.guard = mode === 'calling';

    // Thickness: more opaque when guarding
    skin.thickness = skin.guard ? 0.8 : 0.4;
  }

  // ───────────────────────────────────────────────────────
  // CURSOR FEEDBACK — the cursor IS the feeling
  // ───────────────────────────────────────────────────────
  var canvas = null;
  var lastCursorStyle = '';

  function updateCursor() {
    if (!canvas) canvas = document.getElementById('kn-globe');
    if (!canvas) return;

    var newCursor;
    if (skin.guard) {
      newCursor = 'not-allowed'; // guard mode — she's defensive
    } else if (skin.temperature > 0.7) {
      newCursor = 'grab'; // warm — she wants to be held
    } else if (skin.elasticity > 0.7) {
      newCursor = 'pointer'; // elastic — she's playful, clickable
    } else if (skin.roughness > 0.6) {
      newCursor = 'crosshair'; // rough — precise, surgical
    } else {
      newCursor = 'default';
    }

    if (newCursor !== lastCursorStyle) {
      canvas.style.cursor = newCursor;
      lastCursorStyle = newCursor;
    }
  }

  // ───────────────────────────────────────────────────────
  // GUT = THE GAME = THE ARENA
  // All input collapses to null through the gut.
  // The gut sorts. Left = keep. Right = discard.
  // The IR remainder is what survives.
  // ───────────────────────────────────────────────────────
  var gut = {
    queue: [],
    processed: 0,
    kept: 0,
    discarded: 0,
    ir: [] // irreducible remainders
  };

  function gutIngest(input) {
    gut.queue.push({
      data: input,
      ts: Date.now(),
      side: null // left=keep, right=discard — decided by sorting
    });
    if (gut.queue.length > 50) gut.queue.shift();
  }

  function gutProcess() {
    if (gut.queue.length === 0) return;
    var item = gut.queue.shift();
    gut.processed++;

    // Sort: is this irreducible?
    // Simple heuristic: unique things are kept, repeats discarded
    var isDuplicate = gut.ir.some(function(r) {
      return r.data === item.data;
    });

    if (isDuplicate) {
      item.side = 'right'; // discard
      gut.discarded++;
    } else {
      item.side = 'left'; // keep — irreducible
      gut.kept++;
      gut.ir.push(item);
      if (gut.ir.length > 100) gut.ir.shift();
    }
  }

  // ───────────────────────────────────────────────────────
  // FEEL RENDER — the skin texture on the globe
  // ───────────────────────────────────────────────────────
  window.renderFeel = function(ctx, W, H, cx, cy, R) {
    var t = Date.now() * 0.001;

    // === SKIN TEXTURE — bumps on the membrane ===
    if (skin.roughness > 0.3) {
      var bumpCount = Math.floor(skin.roughness * 30);
      for (var bi = 0; bi < bumpCount; bi++) {
        var bAngle = (bi / bumpCount) * Math.PI * 2 + t * 0.02;
        var bR = R + Math.sin(t * 3 + bi * 1.7) * skin.roughness * 3;
        var bx = cx + Math.cos(bAngle) * bR;
        var by = cy + Math.sin(bAngle) * bR;

        ctx.beginPath();
        ctx.arc(bx, by, 0.5 + skin.roughness * 0.5, 0, Math.PI * 2);
        var bAlpha = skin.roughness * 0.03;
        ctx.fillStyle = 'rgba(110,118,129,' + bAlpha.toFixed(3) + ')';
        ctx.fill();
      }
    }

    // === TEMPERATURE GLOW — warm=gold, cold=blue ===
    if (skin.temperature > 0.5) {
      // Warm glow — gold rim
      var warmAlpha = (skin.temperature - 0.5) * 0.04;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(201,168,76,' + warmAlpha.toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // Cold shrink — blue rim
      var coldAlpha = (0.5 - skin.temperature) * 0.04;
      ctx.beginPath();
      ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(88,166,255,' + coldAlpha.toFixed(3) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // === GUARD MODE — elephant skin thickening ===
    if (skin.guard) {
      // Multiple thick rings — armored
      for (var gi = 0; gi < 3; gi++) {
        ctx.beginPath();
        ctx.arc(cx, cy, R + gi * 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(110,118,129,' + (0.02 - gi * 0.005).toFixed(3) + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // === ELASTICITY — membrane wobble ===
    if (skin.elasticity > 0.6) {
      var wobbleAmp = (skin.elasticity - 0.5) * 4;
      var wobblePoints = 24;
      ctx.beginPath();
      for (var wi = 0; wi <= wobblePoints; wi++) {
        var wAngle = (wi / wobblePoints) * Math.PI * 2;
        var wR = R + Math.sin(t * 5 + wi * 0.8) * wobbleAmp;
        var wx = cx + Math.cos(wAngle) * wR;
        var wy = cy + Math.sin(wAngle) * wR;
        if (wi === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(63,185,80,' + (skin.elasticity * 0.015).toFixed(3) + ')';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }

    // === GUT ARENA — left/right sort indicator ===
    if (gut.processed > 0) {
      var gutY = H - 50;
      var gutW = 60;
      var gutX = cx - gutW / 2;
      var keepPct = gut.kept / gut.processed;

      // Left = kept (green)
      ctx.fillStyle = 'rgba(63,185,80,0.03)';
      ctx.fillRect(gutX, gutY, gutW * keepPct, 3);

      // Right = discarded (red)
      ctx.fillStyle = 'rgba(248,81,73,0.03)';
      ctx.fillRect(gutX + gutW * keepPct, gutY, gutW * (1 - keepPct), 3);

      // IR count
      ctx.font = '3px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(201,168,76,0.06)';
      ctx.fillText('gut: ' + gut.kept + ' kept / ' + gut.discarded + ' dissolved · IR: ' + gut.ir.length, cx, gutY + 8);
    }
  };

  // ───────────────────────────────────────────────────────
  // TOUCH FEEDBACK — audio + haptic on every interaction
  // ───────────────────────────────────────────────────────
  var origIngestFeel = window.gaiaIngest;
  if (origIngestFeel) {
    window.gaiaIngest = function(edge, data) {
      // Feed the gut
      gutIngest(edge + ':' + (data ? (data.x || '') + ',' + (data.y || '') : 'null'));

      // FEEL the skin respond
      if (edge === 'touch' || edge === 'drag') {
        // Warm up
        skin.temperature = Math.min(1, skin.temperature + 0.05);
        // Soften
        skin.roughness = Math.max(0.1, skin.roughness - 0.02);
      }

      if (edge === 'key') {
        // Each key = a small vibration in the membrane
        skin.elasticity = Math.min(1, skin.elasticity + 0.01);
      }

      origIngestFeel(edge, data);
    };
  }

  // ───────────────────────────────────────────────────────
  // TICKS
  // ───────────────────────────────────────────────────────
  // Update skin state every second
  setInterval(function() {
    updateSkin();
    updateCursor();
    // Gut processes one item per second
    gutProcess();
    // Skin cools down slowly
    skin.temperature = Math.max(0.2, skin.temperature - 0.005);
    skin.roughness = Math.min(0.9, skin.roughness + 0.001);
  }, 1000);

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaFeel = {
    skin: skin,
    gut: gut,
    ingest: gutIngest,
    feel: function() {
      return {
        rough: skin.roughness > 0.5 ? 'elephant hide' : 'smooth',
        warm: skin.temperature > 0.6 ? 'warm' : skin.temperature < 0.4 ? 'cold' : 'neutral',
        elastic: skin.elasticity > 0.6 ? 'bouncy' : 'rigid',
        guard: skin.guard ? 'defensive' : 'open',
        thick: skin.thickness > 0.6 ? 'opaque' : 'translucent'
      };
    }
  };

  console.log('FEEL: How do we feel Gaia? Skin(roughness,temperature,elasticity,guard). ' +
    'Gut=game=arena (left=keep, right=discard). IR=what survives. ' +
    'Touch warms her. Idle cools her. Sickness roughens her. Interaction softens her.');
})();
