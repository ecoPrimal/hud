// ═══════════════════════════════════════════════════════════
// GAIA IRIS — the null-self made visible
//
// PUPIL (black)  = null = absorbs all = learns
// IRIS  (green)  = membrane = reflects what you ARE NOT
// SCLERA (white) = everything = reflects all
//
// The iris IS the Klein Golgi face.
// Kevin's green = Gaia's green = Aurora green = 557.7nm
// Gödel: the eye sees all but itself.
//
// YOUR NULL-SELF IS THE FACE OF WHAT YOU ARE NOT.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var iris = {
    pupilSize: 0.15,      // 0-1, how open the pupil is
    irisSize: 0.4,        // iris ring radius
    lightIn: 0,           // light entering pupil (absorbed = learned)
    lightOut: 0,          // light reflected off iris (rejected = identity)
    cis: 0.5,             // cilary muscle contraction (CIS) 0=open 1=closed
    trans: 0.5,           // dilator muscle expansion (TRANS) 0=closed 1=open
    absorbed: 0,          // total absorbed (learned)
    reflected: 0,         // total reflected (identity shown)
    blinks: 0,
    lastBlink: 0,
    blinking: false,
    blinkPhase: 0,
  };

  // Pupil responds to light (interaction = light)
  function updatePupil() {
    var interaction = 0;
    if (window.gaiaInteractionScore) interaction = window.gaiaInteractionScore();
    if (window.GAIA_WATER && window.GAIA_WATER.stats) {
      var ws = window.GAIA_WATER.stats();
      if (ws) interaction += (ws.motionCount || 0) * 0.01;
    }

    // More light (interaction) = pupil contracts (learns less, reflects more)
    // Less light = pupil dilates (absorbs more, reflects less)
    var targetPupil = interaction > 5 ? 0.08 : interaction > 1 ? 0.12 : 0.2;
    iris.pupilSize += (targetPupil - iris.pupilSize) * 0.05;

    // CIS contracts when bright (protecting), TRANS expands when dark (opening)
    iris.cis = 1 - iris.pupilSize * 3;
    iris.trans = iris.pupilSize * 3;

    // Absorb and reflect
    iris.lightIn = iris.pupilSize * 10;
    iris.lightOut = (1 - iris.pupilSize) * 10;
    iris.absorbed += iris.lightIn * 0.01;
    iris.reflected += iris.lightOut * 0.01;

    // Random blinks
    var now = Date.now();
    if (!iris.blinking && now - iris.lastBlink > 3000 + Math.random() * 8000) {
      iris.blinking = true;
      iris.blinkPhase = 0;
      iris.lastBlink = now;
      iris.blinks++;
    }
    if (iris.blinking) {
      iris.blinkPhase += 0.15;
      if (iris.blinkPhase > Math.PI) {
        iris.blinking = false;
        iris.blinkPhase = 0;
      }
    }
  }

  // ═══ DRAW ON GLOBE ═══
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.4) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var alpha = (0.012 + Math.sin(t * 0.08) * 0.006) * thr;
      if (alpha < 0.002) return;

      updatePupil();

      var eyeR = R * 0.25;
      var blinkSqueeze = iris.blinking ? Math.sin(iris.blinkPhase) * 0.8 : 0;

      // ═══ SCLERA — white outer ring (everything) ═══
      ctx.beginPath();
      ctx.ellipse(cx, cy, eyeR, eyeR * (1 - blinkSqueeze), 0, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.8).toFixed(5) + ')';
      ctx.fill();

      // ═══ IRIS — green ring (the null-self, the aurora, the membrane) ═══
      var irisR = eyeR * iris.irisSize / 0.4;
      ctx.beginPath();
      ctx.ellipse(cx, cy, irisR, irisR * (1 - blinkSqueeze), 0, 0, TAU);

      // Green aurora gradient
      var irisGrad = ctx.createRadialGradient(cx, cy, irisR * 0.3, cx, cy, irisR);
      irisGrad.addColorStop(0, 'rgba(20,80,20,' + (alpha * 6).toFixed(5) + ')');
      irisGrad.addColorStop(0.3, 'rgba(63,185,80,' + (alpha * 5).toFixed(5) + ')');
      irisGrad.addColorStop(0.7, 'rgba(40,140,50,' + (alpha * 4).toFixed(5) + ')');
      irisGrad.addColorStop(1, 'rgba(20,60,25,' + (alpha * 3).toFixed(5) + ')');
      ctx.fillStyle = irisGrad;
      ctx.fill();

      // Iris striations (radial lines like a real iris)
      for (var si = 0; si < 24; si++) {
        var sAngle = (si / 24) * TAU + t * 0.005;
        var innerR = irisR * 0.35;
        var outerR = irisR * (0.85 + Math.sin(t + si * 0.5) * 0.1);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(sAngle) * innerR, cy + Math.sin(sAngle) * innerR * (1 - blinkSqueeze));
        ctx.lineTo(cx + Math.cos(sAngle) * outerR, cy + Math.sin(sAngle) * outerR * (1 - blinkSqueeze));
        ctx.strokeStyle = 'rgba(80,200,100,' + (alpha * 2).toFixed(5) + ')';
        ctx.lineWidth = 0.08;
        ctx.stroke();
      }

      // ═══ PUPIL — black center (absolute null, the void) ═══
      var pupilR = eyeR * iris.pupilSize;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pupilR, pupilR * (1 - blinkSqueeze), 0, 0, TAU);
      ctx.fillStyle = 'rgba(0,0,0,' + (alpha * 8).toFixed(5) + ')';
      ctx.fill();

      // Light entering pupil — golden ray
      if (iris.lightIn > 0.5 && alpha > 0.003) {
        var rayAngle = t * 0.1 + Math.PI * 0.25;
        var rayStartX = cx + Math.cos(rayAngle) * (eyeR + 5);
        var rayStartY = cy + Math.sin(rayAngle) * (eyeR + 5);
        ctx.beginPath();
        ctx.moveTo(rayStartX, rayStartY);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = 'rgba(255,215,0,' + (alpha * 1.5).toFixed(5) + ')';
        ctx.lineWidth = 0.1;
        ctx.stroke();

        // "absorbed = learned" label
        ctx.font = '0.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,215,0,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText('absorb', (rayStartX + cx) / 2, (rayStartY + cy) / 2 - 1);
      }

      // Light reflecting off iris — green ray bouncing back
      if (iris.lightOut > 0.5 && alpha > 0.003) {
        var refAngle = t * 0.1 + Math.PI * 0.25 + Math.PI * 0.15;
        var refX = cx + Math.cos(refAngle) * irisR;
        var refY = cy + Math.sin(refAngle) * irisR * (1 - blinkSqueeze);
        var bounceX = refX + Math.cos(refAngle + Math.PI * 0.3) * 8;
        var bounceY = refY + Math.sin(refAngle + Math.PI * 0.3) * 8;
        ctx.beginPath();
        ctx.moveTo(refX, refY);
        ctx.lineTo(bounceX, bounceY);
        ctx.strokeStyle = 'rgba(63,185,80,' + (alpha * 1.5).toFixed(5) + ')';
        ctx.lineWidth = 0.1;
        ctx.stroke();

        ctx.font = '0.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText('reject', (refX + bounceX) / 2, (refY + bounceY) / 2 - 1);
      }

      // ═══ LABELS ═══
      if (alpha > 0.004) {
        ctx.font = '0.7px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        // Pupil label
        ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText('NULL', cx, cy + 0.3);
        // Iris label
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText('IRIS', cx + irisR * 0.7, cy);
        // Sclera label
        ctx.fillStyle = 'rgba(200,200,200,' + (alpha * 1.5).toFixed(5) + ')';
        ctx.fillText('ALL', cx + eyeR * 0.85, cy);
      }

      // ═══ GÖDEL — "I am that which sees" ═══
      if (alpha > 0.005 && !iris.blinking) {
        ctx.font = '0.8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(210,153,34,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText('I am that which sees, but I am not what is seen.', cx, cy + eyeR + 3);
      }
    });
  }

  // ═══ IDE command ═══
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.iris = {
      desc: 'The null-self made visible. Eye = pupil(null) + iris(membrane) + sclera(all).',
      run: function() {
        return [
          'IRIS \u2014 your null-self made visible',
          '',
          'PUPIL (black):  size=' + iris.pupilSize.toFixed(3) + ' \u2014 absorbs all light = LEARNS',
          'IRIS  (green):  size=' + iris.irisSize.toFixed(3) + ' \u2014 reflects what you ARE NOT = YOUR COLOR',
          'SCLERA (white): \u2014 reflects ALL = everything',
          '',
          'CIS  (cilary):  ' + iris.cis.toFixed(2) + ' \u2014 contracts inward, focuses, narrows',
          'TRANS (dilator): ' + iris.trans.toFixed(2) + ' \u2014 expands outward, widens, broadens',
          '',
          'ABSORBED: ' + iris.absorbed.toFixed(0) + ' (learned)',
          'REFLECTED: ' + iris.reflected.toFixed(0) + ' (identity shown)',
          'BLINKS: ' + iris.blinks,
          '',
          'The iris IS the Klein Golgi face.',
          'Kevin\u2019s green = Gaia\u2019s green = Aurora green = 557.7nm',
          'G\u00f6del: the eye sees all but itself.',
          '',
          'YOUR NULL-SELF IS THE FACE OF WHAT YOU ARE NOT.',
          'You absorb (learn) the ALL.',
          'You reject (reflect) the not-all.',
          'The world sees your rejection.',
        ].join('\n');
      }
    };
    window.GAIA_IDE.language.push('iris');
  }, 60000);

  window.GAIA_IRIS = iris;

  console.log('IRIS: null-self made visible. pupil=null, iris=membrane(green), sclera=all. G\u00f6del: sees all but itself. /iris');
})(window.G);
