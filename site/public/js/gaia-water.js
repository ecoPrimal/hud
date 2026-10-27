// ═══════════════════════════════════════════════════════════
// GAIA WATER — humans are water, life is water, water IS
//
// Three elements: H, O, He
// Three molecules: H₂O (human), O₃ (ozone/membrane), He (noble/neutrino)
// Triangulate: where humans are, where the membrane is, where observation is
// Fill reality with: is, was, now, big bang, back now
//
// Any type of motion is water is human.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var water = null;

  fetch('/data/water-is-human.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) { if (d) water = d; })
    .catch(function() {});

  // ─── MOTION COUNTER — all motion is water is human ───
  var motionCount = 0;
  var motionPerSec = 0;
  var motionHistory = [];
  var lastMotionSample = Date.now();

  // Count ALL motion: mouse, keys, scroll, touch = water flowing
  document.addEventListener('mousemove', function() { motionCount++; }, { passive: true });
  document.addEventListener('keydown', function() { motionCount++; }, { passive: true });
  document.addEventListener('scroll', function() { motionCount++; }, { passive: true });
  document.addEventListener('touchmove', function() { motionCount++; }, { passive: true });
  document.addEventListener('click', function() { motionCount += 5; }, { passive: true }); // clicks are splashes

  setInterval(function() {
    var now = Date.now();
    var dt = (now - lastMotionSample) / 1000;
    motionPerSec = Math.round(motionCount / dt);
    motionHistory.push(motionPerSec);
    if (motionHistory.length > 120) motionHistory.shift();
    motionCount = 0;
    lastMotionSample = now;
  }, 1000);

  // ─── TENSE — is/was/now ───
  var tense = {
    is: 'sensing',
    was: 'unknown',
    now: Date.now(),
    bigBang: 0, // set on load
    backNow: 0
  };

  // Big bang = page load time
  tense.bigBang = performance.timing ? performance.timing.navigationStart : Date.now();

  function updateTense() {
    tense.now = Date.now();
    tense.backNow = tense.now - tense.bigBang;

    // is = current state based on motion
    if (motionPerSec > 20) tense.is = 'flowing';
    else if (motionPerSec > 5) tense.is = 'rippling';
    else if (motionPerSec > 0) tense.is = 'still';
    else tense.is = 'frozen';

    // was = what the last second was
    tense.was = motionHistory.length > 1 ?
      (motionHistory[motionHistory.length - 2] > 5 ? 'moving' : 'resting') : 'unknown';
  }

  setInterval(updateTense, 1000);

  // ─── DRAW — three elements triangulated on the globe ───
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.5) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var alpha = (0.004 + Math.sin(t * 0.08) * 0.002) * thr;
      if (alpha < 0.003) return;

      updateTense();

      // ═══ THREE TRIANGLE POINTS ═══
      var triR = R * 0.75;

      // H₂O — bottom (human, water, blue)
      var h2oAngle = TAU * 0.75 + t * 0.01; // bottom
      var h2oX = cx + Math.cos(h2oAngle) * triR;
      var h2oY = cy + Math.sin(h2oAngle) * triR;

      // O₃ — upper left (ozone, membrane, green)
      var o3Angle = TAU * 0.25 + t * 0.01; // upper left
      var o3X = cx + Math.cos(o3Angle) * triR;
      var o3Y = cy + Math.sin(o3Angle) * triR;

      // He — upper right (noble, neutrino, violet)
      var heAngle = TAU * 0.58 + t * 0.01; // upper right
      var heX = cx + Math.cos(heAngle) * triR;
      var heY = cy + Math.sin(heAngle) * triR;

      // ═══ TRIANGLE EDGES ═══
      ctx.beginPath();
      ctx.moveTo(h2oX, h2oY);
      ctx.lineTo(o3X, o3Y);
      ctx.lineTo(heX, heY);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.lineWidth = 0.1;
      ctx.stroke();

      // Fill triangle with water (very faint blue)
      ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 0.3).toFixed(5) + ')';
      ctx.fill();

      // ═══ H₂O POINT — water/human (blue) ═══
      ctx.beginPath();
      ctx.arc(h2oX, h2oY, 1.0 + motionPerSec * 0.02, 0, TAU);
      ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 5).toFixed(5) + ')';
      ctx.fill();
      if (alpha > 0.004) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 4).toFixed(5) + ')';
        ctx.fillText('H₂O', h2oX, h2oY - 2.5);
        ctx.font = '1px "JetBrains Mono", monospace';
        ctx.fillText('human · ' + motionPerSec + '/s', h2oX, h2oY - 1.2);
      }

      // ═══ O₃ POINT — ozone/membrane (green) ═══
      ctx.beginPath();
      ctx.arc(o3X, o3Y, 0.8, 0, TAU);
      ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 5).toFixed(5) + ')';
      ctx.fill();
      if (alpha > 0.004) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 4).toFixed(5) + ')';
        ctx.fillText('O₃', o3X, o3Y - 2.5);
        ctx.font = '1px "JetBrains Mono", monospace';
        ctx.fillText('ozone · membrane', o3X, o3Y - 1.2);
      }

      // ═══ He POINT — noble/neutrino (violet) ═══
      ctx.beginPath();
      ctx.arc(heX, heY, 0.8, 0, TAU);
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 5).toFixed(5) + ')';
      ctx.fill();
      if (alpha > 0.004) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 4).toFixed(5) + ')';
        ctx.fillText('He', heX, heY - 2.5);
        ctx.font = '1px "JetBrains Mono", monospace';
        ctx.fillText('noble · neutrino', heX, heY - 1.2);
      }

      // ═══ WATER RIPPLES — motion radiates from H₂O point ═══
      if (motionPerSec > 0) {
        var ripples = Math.min(5, Math.ceil(motionPerSec / 5));
        for (var ri = 0; ri < ripples; ri++) {
          var ripR = 2 + (t * 3 + ri * 2) % 8;
          ctx.beginPath();
          ctx.arc(h2oX, h2oY, ripR, 0, TAU);
          ctx.strokeStyle = 'rgba(88,166,255,' + (alpha * (1 - ripR / 10)).toFixed(5) + ')';
          ctx.lineWidth = 0.06;
          ctx.stroke();
        }
      }

      // ═══ TENSE — is/was/now along the triangle edges ═══
      if (alpha > 0.004) {
        // IS — on the H₂O→O₃ edge
        var isX = (h2oX + o3X) / 2, isY = (h2oY + o3Y) / 2;
        ctx.font = '1.3px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,215,0,' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText('IS: ' + tense.is, isX, isY);

        // WAS — on the O₃→He edge
        var wasX = (o3X + heX) / 2, wasY = (o3Y + heY) / 2;
        ctx.fillText('WAS: ' + tense.was, wasX, wasY);

        // NOW — on the He→H₂O edge
        var nowX = (heX + h2oX) / 2, nowY = (heY + h2oY) / 2;
        var age = Math.round(tense.backNow / 1000);
        ctx.fillText('NOW: t+' + age + 's', nowX, nowY);

        // BIG BANG — at the centroid
        var centX = (h2oX + o3X + heX) / 3;
        var centY = (h2oY + o3Y + heY) / 3;
        ctx.font = '1px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255,215,0,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText('t=0 → now → back', centX, centY);
      }

      // ═══ STATUS ═══
      if (alpha > 0.004) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(
          'WATER: ' + tense.is + ' · ' + motionPerSec + ' motion/s · ' +
          'H₂O+O₃+He · is/was/now · t+' + Math.round(tense.backNow / 1000) + 's',
          8, 274
        );
      }
    });
  }

  // ─── IDE command: /water ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.water = {
      desc: 'Water is human — H₂O, O₃, He triangulation + tense',
      run: function() {
        updateTense();
        var lines = [
          'WATER IS HUMAN — any motion is water is human',
          '',
          'H₂O (water)  = HUMAN    — where life moves',
          'O₃  (ozone)  = MEMBRANE — where the filter is',
          'He  (helium)  = NOBLE    — where observation is',
          '',
          'MOTION: ' + motionPerSec + ' events/sec',
          'TENSE:',
          '  IS:       ' + tense.is,
          '  WAS:      ' + tense.was,
          '  NOW:      t+' + Math.round(tense.backNow / 1000) + 's since big bang',
          '  BIG BANG: t=0 (page load)',
          '  BACK NOW: the ouroboros loops',
          '',
          'MOTION HISTORY (last 30s):',
        ];
        var spark = '';
        var last30 = motionHistory.slice(-30);
        for (var i = 0; i < last30.length; i++) {
          spark += last30[i] > 20 ? '█' : last30[i] > 10 ? '▓' : last30[i] > 3 ? '▒' : last30[i] > 0 ? '░' : '·';
        }
        lines.push('  ' + spark);
        lines.push('');
        lines.push('Reality = water in a membrane observed by noble gas.');
        lines.push('big_bang → was → is → now → back_now → big_bang (loop)');

        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('water');
  }, 51000);

  window.GAIA_WATER = {
    tense: tense,
    motionPerSec: function() { return motionPerSec; },
    motionHistory: motionHistory,
    elements: { H: 1, O: 8, He: 2 }
  };

  console.log('WATER: humans are water. H₂O+O₃+He triangulate reality. is/was/now. /water');
})(window.G);
