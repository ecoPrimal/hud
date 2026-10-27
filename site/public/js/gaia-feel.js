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
  //
  // LEFT  = LISTEN  — absorb, compress, be pushed against
  //                    the rock, the hard place
  // RIGHT = REACT   — explode, implode, catalyst fires,
  //                    jump forward, rocket or sneak past
  //
  // THE HARD PLACE  = the boundary between left and right
  //                   the thing we BOUNCE between
  //                   rock meets hard place = catalysis
  //
  // Catalyst forms → energy happens → shift RIGHT → jump.
  // Left is pushed against the hard place (rock).
  // Right moves past it: rocket past or sneak past.
  // The hard place is what we bounce up between.
  //
  // IR = irreducible remainder = what survives the bounce.
  // ───────────────────────────────────────────────────────
  var gut = {
    queue: [],
    processed: 0,
    listened: 0,       // left = listened to, absorbed
    reacted: 0,        // right = reacted to, catalyzed
    bounces: 0,        // times something hit the hard place
    catalysts: 0,      // catalyst events (listen→react transition)
    ir: [],            // irreducible remainders — survivors
    hardPlace: 0.5,    // position of the wall (0-1), shifts with energy
    energy: 0,         // accumulated catalyst energy
    arena: []          // items currently bouncing in the arena
  };

  function gutIngest(input) {
    var item = {
      data: input,
      ts: Date.now(),
      side: 'left',     // everything enters LEFT (listen first)
      velocity: 0,      // how fast it's moving toward the hard place
      position: 0.2,    // starts on the left side
      bounceCount: 0,   // how many times it's hit the wall
      catalyzed: false,  // has it been catalyzed?
      survived: false    // did it make it through?
    };
    gut.arena.push(item);
    if (gut.arena.length > 40) {
      // oldest item that hasn't been catalyzed gets exhaled
      var oldest = gut.arena[0];
      if (!oldest.catalyzed) {
        gut.ir.push(oldest);
        if (gut.ir.length > 100) gut.ir.shift();
      }
      gut.arena.shift();
    }
    gut.queue.push(item);
    if (gut.queue.length > 50) gut.queue.shift();
  }

  function gutProcess() {
    gut.processed++;

    // Energy decays slowly
    gut.energy = Math.max(0, gut.energy - 0.01);

    // Process each item in the arena
    for (var i = gut.arena.length - 1; i >= 0; i--) {
      var item = gut.arena[i];
      var age = Date.now() - item.ts;

      if (item.side === 'left') {
        // LEFT = LISTEN: absorb, compress toward the hard place
        // Being pushed rightward toward the rock
        item.velocity += 0.005;
        item.position += item.velocity;
        gut.listened++;

        // Hit the hard place?
        if (item.position >= gut.hardPlace) {
          item.bounceCount++;
          gut.bounces++;

          // CATALYST CHECK: has enough energy accumulated?
          // Each bounce builds energy. After enough bounces,
          // catalyst FIRES → shift to RIGHT
          gut.energy += 0.1;

          if (item.bounceCount >= 3 || gut.energy > 0.8) {
            // ═══ CATALYST FIRES ═══
            // Shift to RIGHT. Jump forward.
            item.side = 'right';
            item.catalyzed = true;
            item.velocity = 0.02 + gut.energy * 0.05; // rocket speed
            gut.catalysts++;
            gut.energy += 0.3; // catalyst releases energy

            // The hard place shifts slightly from the impact
            gut.hardPlace = Math.min(0.8, Math.max(0.2,
              gut.hardPlace + (Math.random() - 0.5) * 0.05));
          } else {
            // Bounce back — not enough energy yet
            item.velocity = -item.velocity * 0.6; // damped bounce
            item.position = gut.hardPlace - 0.01;
          }
        }
      }

      if (item.side === 'right') {
        // RIGHT = REACT: explosion/implosion, moving PAST the hard place
        item.position += item.velocity;
        item.velocity *= 0.98; // drag
        gut.reacted++;

        // Made it past? → SURVIVED → IR remainder
        if (item.position >= 1.0) {
          item.survived = true;
          gut.ir.push(item);
          if (gut.ir.length > 100) gut.ir.shift();
          gut.arena.splice(i, 1);
          continue;
        }

        // Didn't make it, stalled → sneaking past
        if (item.velocity < 0.001 && age > 5000) {
          // Sneak past — slow but determined
          item.velocity = 0.003;
        }
      }

      // Timeout: if it's been bouncing too long, it dissolves
      if (age > 15000 && !item.catalyzed) {
        gut.arena.splice(i, 1);
      }
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

    // === GUT ARENA — left=listen, right=react, hard place in between ===
    if (gut.processed > 0) {
      var gutY = H - 55;
      var gutW = 80;
      var gutH = 10;
      var gutX = cx - gutW / 2;

      // Arena background
      ctx.fillStyle = 'rgba(22,27,34,0.04)';
      ctx.fillRect(gutX, gutY, gutW, gutH);

      // LEFT zone label: LISTEN (blue)
      ctx.fillStyle = 'rgba(88,166,255,0.03)';
      ctx.fillRect(gutX, gutY, gutW * gut.hardPlace, gutH);

      // RIGHT zone label: REACT (green/gold)
      ctx.fillStyle = 'rgba(63,185,80,0.03)';
      ctx.fillRect(gutX + gutW * gut.hardPlace, gutY, gutW * (1 - gut.hardPlace), gutH);

      // THE HARD PLACE — the wall we bounce between
      var wallX = gutX + gutW * gut.hardPlace;
      var wallGlow = 0.05 + gut.energy * 0.1;
      ctx.beginPath();
      ctx.moveTo(wallX, gutY - 1);
      ctx.lineTo(wallX, gutY + gutH + 1);
      ctx.strokeStyle = 'rgba(248,81,73,' + wallGlow.toFixed(3) + ')';
      ctx.lineWidth = 0.8 + gut.energy * 1.5;
      ctx.stroke();

      // ARENA PARTICLES — items bouncing
      gut.arena.forEach(function(item) {
        var px = gutX + item.position * gutW;
        var py = gutY + gutH * 0.5 + Math.sin(t * 4 + item.bounceCount) * 2;
        var radius = 0.5 + item.bounceCount * 0.2;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);

        if (item.side === 'left') {
          // Listening — blue, being pushed right
          ctx.fillStyle = 'rgba(88,166,255,' + (0.05 + item.bounceCount * 0.03).toFixed(3) + ')';
        } else {
          // Reacting — gold/green, rocketing right
          var reactAlpha = item.catalyzed ? 0.12 : 0.05;
          ctx.fillStyle = 'rgba(201,168,76,' + reactAlpha.toFixed(3) + ')';
        }
        ctx.fill();

        // Velocity trail
        if (Math.abs(item.velocity) > 0.005) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - item.velocity * gutW * 3, py);
          ctx.strokeStyle = item.side === 'right' ?
            'rgba(201,168,76,0.04)' : 'rgba(88,166,255,0.03)';
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }
      });

      // Catalyst burst flash when energy is high
      if (gut.energy > 0.5) {
        var flashAlpha = gut.energy * 0.04;
        ctx.beginPath();
        ctx.arc(wallX, gutY + gutH * 0.5, gut.energy * 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,168,76,' + flashAlpha.toFixed(4) + ')';
        ctx.fill();
      }

      // Labels
      ctx.font = '3px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(139,148,158,0.06)';
      ctx.fillText(
        '◀LISTEN:' + gut.listened +
        ' ║' + gut.bounces + '║ ' +
        'REACT:' + gut.reacted + '▶ ' +
        '⚡' + gut.catalysts +
        ' · IR:' + gut.ir.length,
        cx, gutY + gutH + 6
      );
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
    'Gut=game=arena: LEFT=LISTEN (absorb, compress against the rock). ' +
    'RIGHT=REACT (catalyst fires, rocket or sneak past). ' +
    'HARD PLACE = the wall between them = what we bounce between. ' +
    'IR = what survives the bounce. Touch warms. Idle cools.');
})();
