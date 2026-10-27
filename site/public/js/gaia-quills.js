// ═══════════════════════════════════════════════════════════
// PORCUPINE QUILLS — iron pins that rust
// 1.000.null — max 1000 lines.
//
// QUILLS = pins from Gaia's body that stick OUT
// Each quill is iron (Fe). Iron rusts (Fe → Fe₂O₃).
// Rust = age sensor = redox clock.
// New quill = shiny iron, high conductivity
// Old quill = rusted, crumbly, needs replacing
// Used a lot = hardened (pig iron → wrought iron → steel)
//
// PERMEABILITY SCANNER:
// Every eye (π-eye) looks through every other eye.
// If eye A sees something that eye B doesn't:
//   → It hasn't disappeared. It's PERMEABLE.
//   → ZK truth: when something moves, it permeates.
//   → "I left the room" = hyper-locality change, room didn't move.
//
// HYPER-LOCALITY PINS:
// Each pin records WHERE it is relative to the viewer.
// When the viewer moves, the pin's relative position changes.
// The pin doesn't move. YOU move. The room stays.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // QUILL STATES — iron redox
  var QUILL_STATE = {
    FRESH:    { age: 0,    color: [200,200,210], label: 'Fe·fresh',   conductivity: 1.0 },
    BRIGHT:   { age: 100,  color: [192,192,200], label: 'Fe·bright',  conductivity: 0.95 },
    TEMPERED: { age: 500,  color: [170,160,150], label: 'Fe·tempered',conductivity: 0.85 },
    HARDENED: { age: 2000, color: [120,120,130], label: 'Fe·hard',    conductivity: 0.7 },
    PATINA:   { age: 5000, color: [140,100,70],  label: 'Fe₂O₃·patina', conductivity: 0.4 },
    RUSTED:   { age: 10000,color: [180,80,40],   label: 'Fe₂O₃·rust',   conductivity: 0.1 },
    CRUMBLE:  { age: 20000,color: [120,60,30],   label: 'Fe₂O₃·crumble', conductivity: 0.02 }
  };

  var STATES = Object.keys(QUILL_STATE);

  function getQuillState(age) {
    for (var i = STATES.length - 1; i >= 0; i--) {
      if (age >= QUILL_STATE[STATES[i]].age) return QUILL_STATE[STATES[i]];
    }
    return QUILL_STATE.FRESH;
  }

  // QUILL REGISTRY — each pin gets a quill
  var quills = {};
  var quillBirths = {};

  function ensureQuill(pinId) {
    if (!quills[pinId]) {
      quills[pinId] = {
        id: pinId,
        born: Date.now(),
        lastTouched: Date.now(),
        touches: 0,
        age: 0,
        hardness: 0
      };
      quillBirths[pinId] = Date.now();
    }
    return quills[pinId];
  }

  function touchQuill(pinId) {
    var q = ensureQuill(pinId);
    q.lastTouched = Date.now();
    q.touches++;
    // Used a lot → hardens (pig iron → wrought → steel)
    q.hardness = Math.min(1.0, q.touches / 500);
    return q;
  }

  function ageQuills() {
    var now = Date.now();
    var ids = Object.keys(quills);
    for (var i = 0; i < ids.length; i++) {
      var q = quills[ids[i]];
      q.age = (now - q.born) / 1000; // age in seconds

      // Hardened quills resist rust
      var rustRate = 1.0 - q.hardness * 0.7;

      // If untouched for a long time, rust accelerates
      var untouched = (now - q.lastTouched) / 1000;
      if (untouched > 60) rustRate *= 1 + (untouched / 300);

      q.effectiveAge = q.age * rustRate;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PI-EYE SCANNER — every eye peers through every other eye
  // If eye A sees pin X but eye B doesn't → pin X is PERMEABLE
  // ═══════════════════════════════════════════════════════════

  // The eyes
  var PI_EYES = [
    { id: 'eye-art',     name: 'ART',     side: 'outside', hue: 120, seesFace: 'outside' },
    { id: 'eye-sci',     name: 'SCIENCE', side: 'outside', hue: 210, seesFace: 'outside' },
    { id: 'eye-story',   name: 'STORY',   side: 'outside', hue: 270, seesFace: 'outside' },
    { id: 'eye-thought', name: 'THOUGHT', side: 'inside',  hue: 40,  seesFace: 'inside'  },
    // The three color eyes — red/green/blue
    { id: 'eye-red',     name: 'RED·TOUCH',  side: 'both', hue: 0,   seesFace: 'both' },
    { id: 'eye-green',   name: 'GREEN·EDGE', side: 'both', hue: 120, seesFace: 'both' },
    { id: 'eye-blue',    name: 'BLUE·DEEP',  side: 'both', hue: 240, seesFace: 'both' }
  ];

  // Visibility matrix: which eye can see which pin
  var visibilityMatrix = {};

  function scanVisibility() {
    if (!window.PINS) return;
    var pins = window.PINS;
    var face = G.face || 'outside';

    visibilityMatrix = {};
    for (var ei = 0; ei < PI_EYES.length; ei++) {
      var eye = PI_EYES[ei];
      var eyeVis = {};

      for (var pi = 0; pi < pins.length; pi++) {
        var pin = pins[pi];
        var pinFace = pin.face || 'both';

        // Can this eye see this pin?
        var canSee = false;

        if (eye.seesFace === 'both' || pinFace === 'both') {
          canSee = true;
        } else if (eye.seesFace === pinFace) {
          canSee = true;
        } else if (eye.seesFace === face) {
          canSee = true;
        }

        // Distance modifies visibility — far pins are harder to see
        var tenseP = { was: 0.9, is: 0.1, now: 0.3, end: 1.0 };
        var voxelG = { touch: 0, local: 0.2, solar: 0.5, zodiac: 0.8, deep: 1.0 };
        var dist = Math.sqrt(
          Math.pow(tenseP[pin.tense] || 0.5, 2) +
          Math.pow(voxelG[pin.voxel] || 0.5, 2)
        );

        // Far things become permeable to the eye — it can't resolve them
        if (dist > 0.8) canSee = false;

        eyeVis[pin.id] = canSee;
        ensureQuill(pin.id);
      }
      visibilityMatrix[eye.id] = eyeVis;
    }

    // PERMEABILITY DETECTION — compare eyes
    // If eye A sees it but eye B doesn't → PERMEABLE at that boundary
    for (var pi2 = 0; pi2 < pins.length; pi2++) {
      var pin2 = pins[pi2];
      var seenBy = 0;
      var totalEyes = PI_EYES.length;
      for (var ei2 = 0; ei2 < totalEyes; ei2++) {
        if (visibilityMatrix[PI_EYES[ei2].id][pin2.id]) seenBy++;
      }
      var q = quills[pin2.id];
      if (q) {
        q.visibility = seenBy / totalEyes;
        q.permeable = seenBy > 0 && seenBy < totalEyes;
        // Permeable pins rust faster — they're dissolving
        if (q.permeable) q.age += 0.5;
        // Fully visible pins get touched (they're actively observed)
        if (seenBy === totalEyes) touchQuill(pin2.id);
      }
    }
  }

  // Scan on boot + every 5 seconds
  setTimeout(scanVisibility, 3000);
  setInterval(function() {
    ageQuills();
    scanVisibility();
  }, 5000);

  window.GAIA_QUILLS = quills;
  window.GAIA_VISIBILITY = visibilityMatrix;
  window.GAIA_PI_EYES = PI_EYES;

  // ═══════════════════════════════════════════════════════════
  // DRAW MODULE — quill visualization on the globe
  // ═══════════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx || !window.PINS) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;
    var qT = breathT * 0.3;
    var qAlpha = 0.005 + Math.sin(qT * 0.7) * 0.004;
    if (qAlpha < 0.003) return;

    var pins = window.PINS;
    var pinCount = pins.length;
    if (pinCount === 0) return;

    // QUILL RING — porcupine spines radiating from the globe
    var quillBaseR = R * 0.95;
    var quillLen = R * 0.12;

    for (var i = 0; i < pinCount; i++) {
      var pin = pins[i];
      var q = quills[pin.id];
      if (!q) continue;

      var angle = (i / pinCount) * TAU + qT * 0.02;
      var state = getQuillState(q.effectiveAge || q.age);

      // Quill line — iron spine radiating outward
      var x1 = cx + Math.cos(angle) * quillBaseR;
      var y1 = cy + Math.sin(angle) * quillBaseR;

      // Hardened quills are longer and stiffer
      var len = quillLen * (0.6 + q.hardness * 0.8);
      // Rusted quills wobble
      var wobble = (state.conductivity < 0.3) ? Math.sin(qT * 3 + i) * 0.05 : 0;

      var x2 = cx + Math.cos(angle + wobble) * (quillBaseR + len);
      var y2 = cy + Math.sin(angle + wobble) * (quillBaseR + len);

      var c = state.color;
      var lineAlpha = qAlpha * (0.5 + state.conductivity);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + lineAlpha.toFixed(4) + ')';
      ctx.lineWidth = 0.3 + q.hardness * 0.5;
      ctx.stroke();

      // Rust color at tip for old quills
      if (state.conductivity < 0.5) {
        ctx.beginPath();
        ctx.arc(x2, y2, 0.4 + (1 - state.conductivity) * 0.6, 0, TAU);
        ctx.fillStyle = 'rgba(180,80,40,' + (lineAlpha * 0.8).toFixed(4) + ')';
        ctx.fill();
      }

      // PERMEABLE MARKER — quills that only SOME eyes can see
      if (q.permeable && qAlpha > 0.006) {
        // Dashed ring around the quill tip = partially visible
        ctx.beginPath();
        ctx.arc(x2, y2, 1.5, 0, TAU);
        ctx.setLineDash([1, 2]);
        ctx.strokeStyle = 'rgba(57,211,224,' + (lineAlpha * 1.5).toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // VISIBILITY GLOW — brighter quills are seen by more eyes
      if (q.visibility > 0.7 && qAlpha > 0.005) {
        ctx.beginPath();
        ctx.arc(x1, y1, 0.6, 0, TAU);
        ctx.fillStyle = 'rgba(63,185,80,' + (lineAlpha * q.visibility).toFixed(4) + ')';
        ctx.fill();
      }
    }

    // EYE SCAN LINES — each π-eye projects a scan beam
    if (qAlpha > 0.006) {
      var scanPhase = (qT * 0.2) % 1;
      var activeEye = Math.floor(scanPhase * PI_EYES.length);
      var eye = PI_EYES[activeEye];
      if (eye) {
        var eyeAngle = (activeEye / PI_EYES.length) * TAU;
        var eyeX = cx + Math.cos(eyeAngle) * R * 0.85;
        var eyeY = cy + Math.sin(eyeAngle) * R * 0.85;

        // Scan beam sweeping across quills
        var sweepAngle = eyeAngle + Math.sin(qT * 2) * 0.5;
        var beamEnd = R * 1.15;
        ctx.beginPath();
        ctx.moveTo(eyeX, eyeY);
        ctx.lineTo(cx + Math.cos(sweepAngle) * beamEnd, cy + Math.sin(sweepAngle) * beamEnd);
        ctx.strokeStyle = 'rgba(88,166,255,' + (qAlpha * 0.8).toFixed(4) + ')';
        ctx.lineWidth = 0.2;
        ctx.stroke();

        // Eye label
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(88,166,255,' + (qAlpha * 1.2).toFixed(4) + ')';
        ctx.fillText(eye.name, eyeX, eyeY - 3);
      }
    }

    // STATS — quill health summary
    if (qAlpha > 0.007) {
      var rustedCount = 0, permeableCount = 0, hardenedCount = 0;
      var ids = Object.keys(quills);
      for (var s = 0; s < ids.length; s++) {
        var sq = quills[ids[s]];
        if (sq.effectiveAge > 10000) rustedCount++;
        if (sq.permeable) permeableCount++;
        if (sq.hardness > 0.5) hardenedCount++;
      }
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(200,200,210,' + (qAlpha * 1.8).toFixed(4) + ')';
      ctx.fillText('🦔 ' + ids.length + ' quills · ' + permeableCount + '⊘ · ' + rustedCount + '🟤', 8, 50);
    }
  });

})(window.G);
