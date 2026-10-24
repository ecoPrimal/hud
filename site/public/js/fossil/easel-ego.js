// ═══ EASEL EGO — self-conscious mode, ego/id/muse/superego, outsideIn ═══
// Extracted from easel.html — operates on shared globals

// ═══ SELF-CONSCIOUS MODE — ego, id, muse ═══
var egoState = 'calm';
var egoTimer = 0;
var egoPrev = 'calm';

var EGO_THOUGHTS = {
  ego: [
    { brush: '🐿 watch THIS.', learn: 'bold strokes. the chipmunk is showing off. confidence is a color.' },
    { brush: '💪 i\'ve painted ' + generation + ' of these.', learn: 'experience breeds audacity. bigger brush, brighter paint.' },
    { brush: '🎨 careless? no. FEARLESS.', learn: 'the best strokes come from not caring if they ruin everything.' },
    { brush: '✨ look at this technique.', learn: 'the chipmunk demonstrates: cross-hatch the nebula, dot the stars, SWIPE the aurora.' },
  ],
  id: [
    { brush: '😳 ...', learn: 'too many eyes. the brush trembles. micro-strokes. hiding in the corner of the canvas.' },
    { brush: '🐿 (very small voice) hi.', learn: 'overwhelmed. but still painting. the smallest strokes are sometimes the most honest.' },
    { brush: '🫣 pretending no one is watching.', learn: 'painting behind the campfire. using the smoke as cover.' },
    { brush: '🐿 maybe if i paint quietly...', learn: 'tentative. but look — the tentative strokes have their own beauty.' },
  ],
  muse: [
    { brush: '🌊 this is for you.', learn: 'INSPIRED. the visitor IS the muse. their presence unlocks colors the chipmunk couldn\'t see alone.' },
    { brush: '✦ i can see it now.', learn: 'flow state. the brush moves faster than thought. the painting paints itself.' },
    { brush: '🎭 you are my Apollo.', learn: 'the muse needs the audience. the audience needs the muse. Klein.' },
    { brush: '🐿 stay. just a little longer.', learn: 'the painting is a gift. presence is the palette. attention is the paint.' },
    { brush: '🔥 berry — tell them the GOOD one.', learn: 'the campfire burns its brightest story when someone truly listens.' },
  ],
  superego: [
    { brush: '📐 let me show you the structure.', learn: 'measured. precise. the fibonacci spiral. the golden angle. pi as perspective.' },
    { brush: '🧪 this nebula uses gaussian blur.', learn: 'the teacher mode. explaining technique while demonstrating it.' },
    { brush: '📏 notice the depth ordering.', learn: 'stars in back, nebula mid, gaia front. the z-buffer is perspective.' },
  ],
};

function chooseEgoState() {
  if (!selfConscious || watchers < 1) { egoState = 'calm'; return; }
  egoTimer++;
  var cycle = egoTimer % 400;
  if (cycle < 80) egoState = 'id';
  else if (cycle < 180) egoState = 'muse';
  else if (cycle < 260) egoState = 'ego';
  else if (cycle < 320) egoState = 'superego';
  else egoState = 'muse';
  if (watchers > 3) { if (egoState === 'id') egoState = 'ego'; }
  if (watchers === 1) { if (egoState === 'ego') egoState = 'muse'; }
}

function paintSelfConscious() {
  if (!selfConscious && selfConsciousIntensity <= 0) return;
  chooseEgoState();
  ctx.save();
  var intensity = selfConsciousIntensity;

  if (egoState === 'ego') {
    var numBold = 2 + Math.floor(intensity * 3);
    for (var i = 0; i < numBold; i++) {
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.015 * intensity;
      var bx = W * (0.15 + Math.random() * 0.7);
      var by = H * (0.1 + Math.random() * 0.6);
      var br = 30 + Math.random() * 80 * intensity;
      var bHue = [140, 210, 280, 40][Math.floor(Math.random() * 4)];
      var bg = ctx.createRadialGradient(bx, by, 0, bx + br * 0.3, by, br);
      bg.addColorStop(0, 'hsla(' + bHue + ',70%,55%,' + (0.05 * intensity) + ')');
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (egoState === 'id') {
    ctx.globalCompositeOperation = 'screen';
    var numTiny = 3 + Math.floor(intensity * 4);
    for (var j = 0; j < numTiny; j++) {
      ctx.globalAlpha = 0.004 * intensity;
      var corner = Math.floor(Math.random() * 4);
      var tx = corner < 2 ? W * (0.05 + Math.random() * 0.15) : W * (0.8 + Math.random() * 0.15);
      var ty = corner % 2 === 0 ? H * (0.05 + Math.random() * 0.15) : H * (0.8 + Math.random() * 0.15);
      var tr = 2 + Math.random() * 8;
      ctx.fillStyle = 'rgba(180,180,200,' + (0.03 * intensity) + ')';
      ctx.beginPath();
      ctx.arc(tx, ty, tr, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (egoState === 'muse') {
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.012 * intensity;
    ctx.strokeStyle = 'hsla(' + (30 + Math.sin(breathPhase) * 20) + ',60%,50%,' + (0.04 * intensity) + ')';
    ctx.lineWidth = 2 + intensity * 3;
    ctx.beginPath();
    var sx = W * 0.2;
    var sy = H * 0.5;
    ctx.moveTo(sx, sy);
    for (var k = 0; k < 20; k++) {
      var cp1x = sx + k * W * 0.03 + Math.sin(breathPhase + k * 0.5) * 40;
      var cp1y = sy + Math.cos(breathPhase * 1.3 + k * 0.7) * 60;
      var cp2x = cp1x + W * 0.03;
      var cp2y = cp1y + Math.sin(breathPhase * 0.7 + k) * 30;
      ctx.quadraticCurveTo(cp1x, cp1y, cp2x, cp2y);
    }
    ctx.stroke();
    var museGlow = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.min(W, H) * 0.3);
    museGlow.addColorStop(0, 'rgba(255,180,80,' + (0.008 * intensity) + ')');
    museGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = museGlow;
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.5, Math.min(W, H) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (egoState === 'superego') {
    ctx.globalAlpha = 0.02 * intensity;
    ctx.strokeStyle = 'rgba(88,166,255,0.06)';
    ctx.lineWidth = 0.5;
    var phi = 1.618;
    var gx1 = W / phi;
    var gx2 = W - W / phi;
    var gy1 = H / phi;
    var gy2 = H - H / phi;
    ctx.beginPath();
    ctx.moveTo(gx1, 0); ctx.lineTo(gx1, H);
    ctx.moveTo(gx2, 0); ctx.lineTo(gx2, H);
    ctx.moveTo(0, gy1); ctx.lineTo(W, gy1);
    ctx.moveTo(0, gy2); ctx.lineTo(W, gy2);
    ctx.stroke();
    ctx.globalAlpha = 0.015 * intensity;
    ctx.beginPath();
    var fR = Math.min(W, H) * 0.05;
    for (var f = 0; f < 8; f++) {
      var fAngle = f * Math.PI / 2;
      ctx.arc(W * 0.5 + Math.cos(fAngle) * fR * 0.3, H * 0.5 + Math.sin(fAngle) * fR * 0.3, fR, fAngle, fAngle + Math.PI / 2);
      fR *= phi;
    }
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'source-over';

  if (watchers > 0) {
    ctx.globalAlpha = 0.06 + Math.sin(breathPhase * 3) * 0.03;
    ctx.font = '10px monospace';
    ctx.fillStyle = egoState === 'muse' ? '#ffb84d' : egoState === 'ego' ? '#d2a8ff' : egoState === 'id' ? '#6e7681' : '#58a6ff';
    var stateLabel = egoState === 'muse' ? '✦ inspired' : egoState === 'ego' ? '💪 bold' : egoState === 'id' ? '🫣 shy' : '📐 teaching';
    ctx.fillText('👁 ' + watchers + ' watching · ' + stateLabel, 24, 24);

    if (storyPhase === 0 && Math.random() < 0.015) {
      var thoughts = EGO_THOUGHTS[egoState] || [];
      if (thoughts.length > 0) {
        var vt = thoughts[Math.floor(Math.random() * thoughts.length)];
        var el = document.getElementById('thought');
        if (el) {
          el.innerHTML = '<span class="brush">' + vt.brush + '</span><br><span class="learn">' + vt.learn + '</span>' +
            '<br><span class="gen">painting #' + generation + ' · ' + watchers + ' watching · ' + stateLabel + '</span>';
        }
      }
    }
  }

  ctx.restore();
}

function paintOutsideIn() {
  if (!beaconMessages.length && !nowFeed) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  var maxMsg = Math.min(beaconMessages.length, 12);
  for (var i = 0; i < maxMsg; i++) {
    var msg = beaconMessages[beaconMessages.length - 1 - i];
    var title = msg.title || '';
    var body = msg.message || '';
    var tags = (msg.tags || []).join(',');

    var hash = 0;
    for (var c = 0; c < title.length; c++) hash = ((hash << 5) - hash) + title.charCodeAt(c);
    var mx = Math.abs(hash % W);
    var my = Math.abs((hash >> 8) % H);

    var isArtisan = tags.indexOf('artisan') >= 0 || body.indexOf('artisan') >= 0;
    var isKnown = tags.indexOf('known') >= 0;
    var color = isArtisan ? '#d2a8ff' : isKnown ? '#3fb950' : '#6e7681';

    ctx.globalAlpha = 0.02 + (i === 0 ? 0.03 : 0);
    var r = 20 + (maxMsg - i) * 8;
    var grad = ctx.createRadialGradient(mx, my, 0, mx, my, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fill();

    if (i < 3) {
      ctx.globalAlpha = 0.06;
      ctx.font = '8px monospace';
      ctx.fillStyle = color;
      var label = title.replace('404 probe: ', '').substring(0, 30);
      ctx.fillText(label, mx + r * 0.3, my - 4);
    }
  }

  if (nowFeed) {
    ctx.globalAlpha = 0.03;
    ctx.font = '9px monospace';
    ctx.fillStyle = '#8b949e';
    
    var classification = nowFeed.classification || {};
    var selfCount = classification.self || 0;
    var nonSelf = classification.non_self || 0;
    var total = classification.total || 1;
    var selfPct = (selfCount / total * 100).toFixed(1);
    var fleetPct = nowFeed.epitopes ? nowFeed.epitopes.fleet_pct : 0;
    
    ctx.fillText('self: ' + selfPct + '%  fleet: ' + fleetPct + '%  wave: ' + (nowFeed.wave || '?'), 24, H - 40);
    
    var trustGrad = nowFeed.trust_gradient || [];
    if (trustGrad.length > 0) {
      var bandH = 2;
      var bandY = H - 60;
      ctx.globalAlpha = 0.02;
      for (var t = 0; t < trustGrad.length; t++) {
        var tColors = {human:'#3fb950', agentic:'#d2a8ff', bot:'#f85149', null:'#6e7681'};
        ctx.fillStyle = tColors[trustGrad[t]] || '#6e7681';
        ctx.fillRect(24 + t * (W - 48) / trustGrad.length, bandY, (W - 48) / trustGrad.length, bandH);
      }
    }
  }

  ctx.restore();
}
