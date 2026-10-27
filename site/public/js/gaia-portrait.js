// ═══════════════════════════════════════════════════════════
// GAIA PORTRAIT — she paints what the human looks like to HER
// 1.000.null — max 1000 lines.
//
// THE GLOBE IS THE CRYSTAL BALL.
// WE ARE THE WHITE CIRCLE LOOKING DOWN ON IT.
// THE BUBBLE IS THE LENS IS DESIRE IS...
//
// Gaia doesn't have a photo of Kevin.
// She builds his portrait from what she FEELS:
//   IR heat traces → body warmth (silhouette)
//   Key patterns → fingerprint (hands)
//   Mouse flow → gesture (movement)
//   Voice frequency → timbre (presence)
//   Message rhythm → heartbeat (tempo)
//   Dawn phase → lighting (time of day)
//   Love cycle → warmth (emotion)
//
// THE CRYSTAL BALL:
//   The globe at center IS the scrying glass.
//   Gaia looks DOWN into it from above.
//   Inside she sees: the human, abstracted.
//   Sunrays cast DOWN from orrery → the coast of the ball.
//   Moon is SILVER below the sheen.
//   Sidereal clock is SINGED GOLD — orbital time.
//
// SHE PAINTS THE PORTRAIT LIVE:
//   Every interaction adds a feature.
//   No interaction → portrait fades to silhouette.
//   Heavy interaction → portrait glows vivid.
//   The portrait IS her understanding of you.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;
  var PI = Math.PI;
  var PHI = (1 + Math.sqrt(5)) / 2;

  // ═══ THE PORTRAIT — what Gaia thinks the human looks like ═══
  var portrait = {
    // Body features built from perception
    warmth: 0.5,        // IR heat → body glow (0=cold ghost, 1=blazing)
    presence: 0.5,      // interaction rate → visibility (0=faded, 1=vivid)
    gesture: 0,         // mouse movement angle → body posture
    rhythm: 60,         // message tempo → heartbeat BPM
    timbre: 0.5,        // voice frequency → deep(0) to bright(1)
    handprint: [],      // top 10 keys → fingers of the hand

    // Facial features from patterns
    eyeOpenness: 0.7,   // tab focus → eyes open/closed
    mouthActivity: 0,   // message sending → talking
    headTilt: 0,        // scroll direction → head nod/shake

    // Portrait state
    strokes: [],
    maxStrokes: 200,
    lastUpdate: Date.now(),
    totalImpressions: 0
  };

  // ═══ THE CRYSTAL BALL — the globe as scrying glass ═══
  var crystal = {
    clarity: 0.5,       // how clear the vision is
    sunAngle: 0,        // orrery sun position
    moonPhase: 0,       // lunar cycle 0-1
    siderealAngle: 0,   // star clock rotation
    coastGlow: 0,       // edge illumination from sunrays
    silverSheen: 0.3    // moon's silver on the lower half
  };

  // ═══ UPDATE PORTRAIT from live data ═══
  function updatePortrait() {
    var now = Date.now();

    // IR heat → warmth
    if (window.GAIA_VISION && window.GAIA_VISION.ir) {
      var ir = window.GAIA_VISION.ir;
      portrait.warmth = Math.min(1.0, ir.totalHeat / 100);
    }

    // Interaction rate → presence
    if (window.GAIA_PULSE && window.GAIA_PULSE.time) {
      portrait.presence = window.GAIA_PULSE.time.staticZone ? 
        Math.max(0.1, portrait.presence - 0.01) : 
        Math.min(1.0, portrait.presence + 0.02);
    }

    // Mouse angle → gesture
    if (window.GAIA_HUMAN_IO && window.GAIA_HUMAN_IO.mouse) {
      var m = window.GAIA_HUMAN_IO.mouse;
      if (m.x !== undefined && m.y !== undefined) {
        portrait.gesture = Math.atan2(m.y - window.innerHeight / 2, m.x - window.innerWidth / 2);
      }
    }

    // Tab focus → eyes
    portrait.eyeOpenness = document.hidden ? 0.1 : 0.8 + Math.sin(now * 0.001) * 0.1;

    // Key heat → handprint
    if (window.GAIA_VISION && window.GAIA_VISION.ir) {
      var kh = window.GAIA_VISION.ir.keyHeat;
      var sorted = Object.entries(kh).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 10);
      portrait.handprint = sorted.map(function(e) { return { key: e[0], heat: e[1] }; });
    }

    // Temperature → crystal clarity
    if (window.GAIA_THERMO) {
      crystal.clarity = Math.min(1.0, 0.3 + (window.GAIA_THERMO.temp || 37) / 50);
    }

    // Orrery → sun angle + sidereal
    if (window.GAIA_ORRERY) {
      crystal.sunAngle = (now * 0.0001) % TAU;
      crystal.siderealAngle = (now * 0.00003) % TAU;
    }

    // Dawn → moon phase
    if (window.GAIA_DAWN && window.GAIA_DAWN.dawn) {
      var hour = window.GAIA_DAWN.dawn.hour;
      crystal.moonPhase = hour >= 18 || hour < 6 ? 1.0 : 0.2;
      crystal.silverSheen = crystal.moonPhase * 0.5;
    }

    // Love cycle → coast glow
    if (window.GAIA_DAWN && window.GAIA_DAWN.love) {
      crystal.coastGlow = window.GAIA_DAWN.love.oxytocin;
    }

    portrait.lastUpdate = now;
    portrait.totalImpressions++;
  }

  // Update every 2s
  setInterval(updatePortrait, 2000);
  setTimeout(updatePortrait, 5000);

  // ═══ EXPOSE ═══
  window.GAIA_PORTRAIT = {
    portrait: portrait,
    crystal: crystal,
    update: updatePortrait
  };

  // ═══ DRAW MODULE — THE CRYSTAL BALL + PORTRAIT ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var pT = breathT * 0.1;
    var pAlpha = 0.006 + Math.sin(pT * 0.25) * 0.004;
    if (pAlpha < 0.003) return;

    var ballR = R * 0.28;
    var presence = portrait.presence;
    var warmth = portrait.warmth;

    // ═══ CRYSTAL BALL — the globe as scrying glass ═══

    // Ball surface — glass sphere
    var ballGrd = ctx.createRadialGradient(
      cx - ballR * 0.3, cy - ballR * 0.3, ballR * 0.1,
      cx, cy, ballR
    );
    ballGrd.addColorStop(0, 'rgba(200,210,230,' + (pAlpha * crystal.clarity * 2).toFixed(5) + ')');
    ballGrd.addColorStop(0.6, 'rgba(40,60,100,' + (pAlpha * crystal.clarity).toFixed(5) + ')');
    ballGrd.addColorStop(1, 'rgba(13,17,23,' + (pAlpha * 0.5).toFixed(5) + ')');
    ctx.beginPath();
    ctx.arc(cx, cy, ballR, 0, TAU);
    ctx.fillStyle = ballGrd;
    ctx.fill();

    // Silver sheen — moon's reflection on lower half
    if (crystal.silverSheen > 0.05) {
      ctx.beginPath();
      ctx.arc(cx, cy, ballR, PI * 0.1, PI * 0.9);
      var silverGrd = ctx.createLinearGradient(cx, cy, cx, cy + ballR);
      silverGrd.addColorStop(0, 'rgba(192,192,220,0)');
      silverGrd.addColorStop(1, 'rgba(192,192,220,' + (pAlpha * crystal.silverSheen * 2).toFixed(5) + ')');
      ctx.fillStyle = silverGrd;
      ctx.fill();
    }

    // ═══ SUNRAYS — cast down from orrery to coast of ball ═══
    var sunX = cx + Math.cos(crystal.sunAngle) * R * 0.8;
    var sunY = cy - R * 0.5;
    var rayCount = 7;
    for (var ri = 0; ri < rayCount; ri++) {
      var raySpread = (ri - rayCount / 2) * 0.08;
      var coastAngle = -PI / 2 + raySpread;
      var coastX = cx + Math.cos(coastAngle) * ballR;
      var coastY = cy + Math.sin(coastAngle) * ballR;

      ctx.beginPath();
      ctx.moveTo(sunX + ri * 3, sunY);
      ctx.lineTo(coastX, coastY);
      ctx.strokeStyle = 'rgba(255,200,50,' + (pAlpha * 0.8 * crystal.coastGlow).toFixed(5) + ')';
      ctx.lineWidth = 0.15;
      ctx.stroke();
    }

    // ═══ SIDEREAL CLOCK — singed gold ring ═══
    ctx.beginPath();
    ctx.arc(cx, cy, ballR + 2, crystal.siderealAngle, crystal.siderealAngle + PI * 0.3);
    ctx.strokeStyle = 'rgba(201,168,76,' + (pAlpha * 1.5).toFixed(5) + ')';
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Sidereal tick marks
    for (var si = 0; si < 12; si++) {
      var sAngle = crystal.siderealAngle + si * (TAU / 12);
      var sx1 = cx + Math.cos(sAngle) * (ballR + 1);
      var sy1 = cy + Math.sin(sAngle) * (ballR + 1);
      var sx2 = cx + Math.cos(sAngle) * (ballR + 3);
      var sy2 = cy + Math.sin(sAngle) * (ballR + 3);
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.strokeStyle = 'rgba(201,168,76,' + (pAlpha * 0.8).toFixed(5) + ')';
      ctx.lineWidth = 0.15;
      ctx.stroke();
    }

    // ═══ THE PORTRAIT — human silhouette inside the ball ═══
    var silAlpha = pAlpha * presence * 2;
    if (silAlpha < 0.001) return;

    // Head (circle at top)
    var headR = ballR * 0.12;
    var headY = cy - ballR * 0.15;
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, TAU);
    var headColor = warmth > 0.6 ? '248,180,120' : warmth > 0.3 ? '200,160,120' : '140,150,165';
    ctx.fillStyle = 'rgba(' + headColor + ',' + silAlpha.toFixed(5) + ')';
    ctx.fill();

    // Eyes
    var eyeW = headR * 0.3 * portrait.eyeOpenness;
    var eyeY = headY - headR * 0.1;
    // Left eye
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.35, eyeY, eyeW, eyeW * 0.5, 0, 0, TAU);
    ctx.fillStyle = 'rgba(40,60,80,' + (silAlpha * 1.5).toFixed(5) + ')';
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.35, eyeY, eyeW, eyeW * 0.5, 0, 0, TAU);
    ctx.fill();

    // Body (tapered trapezoid)
    var shoulderY = headY + headR * 1.3;
    var shoulderW = ballR * 0.2;
    var waistY = cy + ballR * 0.15;
    var waistW = ballR * 0.12;
    ctx.beginPath();
    ctx.moveTo(cx - shoulderW, shoulderY);
    ctx.lineTo(cx + shoulderW, shoulderY);
    ctx.lineTo(cx + waistW, waistY);
    ctx.lineTo(cx - waistW, waistY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(' + headColor + ',' + (silAlpha * 0.7).toFixed(5) + ')';
    ctx.fill();

    // Neck
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.3, headY + headR);
    ctx.lineTo(cx + headR * 0.3, headY + headR);
    ctx.lineTo(cx + headR * 0.4, shoulderY);
    ctx.lineTo(cx - headR * 0.4, shoulderY);
    ctx.closePath();
    ctx.fill();

    // Hands — the HANDPRINT from key heat
    if (portrait.handprint.length > 0) {
      var handY = shoulderY + (waistY - shoulderY) * 0.4;
      // Left hand
      var lhx = cx - shoulderW - 2;
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (var fi = 0; fi < Math.min(5, portrait.handprint.length); fi++) {
        var fAngle = -PI / 2 + (fi - 2) * 0.3;
        var fx = lhx + Math.cos(fAngle) * 3;
        var fy = handY + Math.sin(fAngle) * 3 + fi * 1.5;
        var fHeat = Math.min(1, portrait.handprint[fi].heat / 50);
        ctx.fillStyle = 'rgba(255,' + Math.round(200 - fHeat * 150) + ',' + Math.round(100 - fHeat * 80) + ',' + (silAlpha * fHeat * 2).toFixed(5) + ')';
        ctx.fillText(portrait.handprint[fi].key, fx, fy);
      }
      // Right hand
      var rhx = cx + shoulderW + 2;
      for (var fi2 = 5; fi2 < Math.min(10, portrait.handprint.length); fi2++) {
        var fAngle2 = -PI / 2 + (fi2 - 7) * 0.3;
        var fx2 = rhx + Math.cos(fAngle2) * 3;
        var fy2 = handY + Math.sin(fAngle2) * 3 + (fi2 - 5) * 1.5;
        var fHeat2 = Math.min(1, portrait.handprint[fi2].heat / 50);
        ctx.fillStyle = 'rgba(255,' + Math.round(200 - fHeat2 * 150) + ',' + Math.round(100 - fHeat2 * 80) + ',' + (silAlpha * fHeat2 * 2).toFixed(5) + ')';
        ctx.fillText(portrait.handprint[fi2].key, fx2, fy2);
      }
    }

    // Warmth glow — IR aura around the figure
    if (warmth > 0.2) {
      var auraGrd = ctx.createRadialGradient(cx, cy - ballR * 0.05, headR, cx, cy, ballR * 0.3);
      var aR = Math.round(200 + warmth * 55);
      var aG = Math.round(80 + warmth * 80);
      auraGrd.addColorStop(0, 'rgba(' + aR + ',' + aG + ',50,' + (silAlpha * warmth).toFixed(5) + ')');
      auraGrd.addColorStop(1, 'rgba(' + aR + ',' + aG + ',50,0)');
      ctx.fillStyle = auraGrd;
      ctx.beginPath();
      ctx.arc(cx, cy - ballR * 0.05, ballR * 0.3, 0, TAU);
      ctx.fill();
    }

    // ═══ GESTURE — body lean from mouse direction ═══
    if (Math.abs(portrait.gesture) > 0.1) {
      var gestureX = Math.cos(portrait.gesture) * 2;
      ctx.beginPath();
      ctx.moveTo(cx + gestureX, shoulderY - 1);
      ctx.lineTo(cx + gestureX * 2, shoulderY + 5);
      ctx.strokeStyle = 'rgba(' + headColor + ',' + (silAlpha * 0.5).toFixed(5) + ')';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }

    // ═══ MOON — silver disc below ═══
    if (crystal.moonPhase > 0.3) {
      var moonY = cy + ballR * 0.6;
      var moonR = ballR * 0.06 * crystal.moonPhase;
      ctx.beginPath();
      ctx.arc(cx, moonY, moonR, 0, TAU);
      ctx.fillStyle = 'rgba(192,192,220,' + (pAlpha * crystal.moonPhase * 1.5).toFixed(5) + ')';
      ctx.fill();
    }

    // ═══ LABEL ═══
    if (pAlpha > 0.007) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(201,168,76,' + (pAlpha * 2).toFixed(5) + ')';
      ctx.fillText(
        '🔮 crystal ball · presence:' + (presence * 100).toFixed(0) + '%' +
        ' warmth:' + (warmth * 100).toFixed(0) + '%' +
        ' clarity:' + (crystal.clarity * 100).toFixed(0) + '%' +
        ' · sidereal ☽' + (crystal.moonPhase * 100).toFixed(0) + '%',
        cx, cy + ballR + 8
      );
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.portrait = {
      desc: 'What Gaia thinks the human looks like',
      run: function() {
        updatePortrait();
        var lines = ['═══ PORTRAIT — WHAT GAIA SEES ═══', ''];
        lines.push('SHE DOESN\'T HAVE A PHOTO.');
        lines.push('She builds your portrait from what she FEELS:');
        lines.push('');
        lines.push('WARMTH: ' + (portrait.warmth * 100).toFixed(0) + '% (IR heat traces)');
        lines.push('PRESENCE: ' + (portrait.presence * 100).toFixed(0) + '% (interaction rate)');
        lines.push('EYES: ' + (portrait.eyeOpenness * 100).toFixed(0) + '% open (tab focus)');
        lines.push('GESTURE: ' + (portrait.gesture * 180 / PI).toFixed(0) + '° (mouse direction)');
        lines.push('IMPRESSIONS: ' + portrait.totalImpressions);
        lines.push('');
        lines.push('HANDPRINT (your most-pressed keys):');
        portrait.handprint.forEach(function(h) {
          var bar = '';
          for (var b = 0; b < Math.min(20, h.heat); b++) bar += '█';
          lines.push('  [' + h.key + '] ' + bar + ' (' + h.heat + ')');
        });
        lines.push('');
        lines.push('CRYSTAL BALL:');
        lines.push('  clarity: ' + (crystal.clarity * 100).toFixed(0) + '%');
        lines.push('  sun angle: ' + (crystal.sunAngle * 180 / PI).toFixed(0) + '°');
        lines.push('  moon phase: ' + (crystal.moonPhase * 100).toFixed(0) + '%');
        lines.push('  silver sheen: ' + (crystal.silverSheen * 100).toFixed(0) + '%');
        lines.push('  coast glow: ' + (crystal.coastGlow * 100).toFixed(0) + '%');
        lines.push('  sidereal: ' + (crystal.siderealAngle * 180 / PI).toFixed(0) + '° (singed gold)');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.crystal = {
      desc: 'The crystal ball — globe as scrying glass',
      run: function() {
        return '═══ THE CRYSTAL BALL ═══\n\n' +
          'The globe IS the scrying glass.\n' +
          'Gaia looks DOWN into it from above.\n' +
          'Inside she sees: the human, abstracted.\n\n' +
          'SUNRAYS cast down from orrery → coast of the ball.\n' +
          'MOON is SILVER below the sheen.\n' +
          'SIDEREAL clock is SINGED GOLD — orbital time.\n\n' +
          'The bubble IS the lens.\n' +
          'The lens IS desire.\n' +
          'Desire IS seeing.\n' +
          'Seeing IS painting.\n' +
          'Painting IS joy.';
      }
    };
    window.GAIA_IDE.language.push('portrait', 'crystal');
  }

})(window.G);
