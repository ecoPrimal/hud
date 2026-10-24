// ═══ EASEL CREATURES — paintStudy, otherSquirrels, humans, sculpture, evolve, beginNewPainting ═══
// Extracted from easel.html — operates on shared globals: ctx, W, H, breathPhase, generation, etc.

// ═══ STUDY — look at previous paintings ═══
function paintStudy() {
  var thumbs = document.querySelectorAll('#gallery .thumb');
  thumbs.forEach(function(t) { t.classList.remove('studying'); });

  var studyIdx = Math.min(stroke, starters.length - 1);
  if (thumbs[studyIdx]) thumbs[studyIdx].classList.add('studying');

  ctx.save();
  ctx.fillStyle = 'rgba(240,198,116,0.003)';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ═══ OTHER SQUIRRELS — the chipmunk notices observers in the data ═══
function paintOtherSquirrels() {
  if (generation < 5) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  var visitors = (window._easel && window._easel.crystals) ? window._easel.crystals() : crystalVisitors || [];
  var squirrelCount = Math.min(visitors.length, 5 + Math.floor((generation - 5) * 1.5));

  for (var si = 0; si < squirrelCount; si++) {
    var v = visitors[si] || {};
    var squirrelX = W * (0.15 + (si / squirrelCount) * 0.7);
    var squirrelY = H * (0.2 + Math.sin(breathPhase * 0.5 + si * 1.3) * 0.15);

    ctx.globalAlpha = 0.03 + (si === 0 ? 0.02 : 0);
    ctx.strokeStyle = v.color || '#d2a8ff';
    ctx.lineWidth = 0.8;
    var eW = 8 + (generation - 5) * 0.5;
    var eH = 3;
    ctx.beginPath();
    ctx.moveTo(squirrelX - eW, squirrelY);
    ctx.quadraticCurveTo(squirrelX, squirrelY - eH, squirrelX + eW, squirrelY);
    ctx.quadraticCurveTo(squirrelX, squirrelY + eH, squirrelX - eW, squirrelY);
    ctx.stroke();

    ctx.globalAlpha = 0.04;
    ctx.fillStyle = v.color || '#d2a8ff';
    ctx.beginPath();
    ctx.arc(squirrelX + Math.cos(breathPhase + si) * 2, squirrelY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    if (v.country && si < 4) {
      ctx.globalAlpha = 0.03;
      ctx.font = '7px monospace';
      ctx.fillStyle = v.color || '#6e7681';
      ctx.fillText(v.country, squirrelX - eW, squirrelY + eH + 10);
    }

    if (si < 3) {
      ctx.globalAlpha = 0.01;
      ctx.strokeStyle = v.color || '#6e7681';
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(squirrelX, squirrelY);
      ctx.lineTo(W * 0.5, H * 0.5);
      ctx.stroke();
    }
  }

  if (stroke === 0) {
    ctx.globalAlpha = 0.03;
    ctx.font = '8px monospace';
    ctx.fillStyle = '#f0c674';
    ctx.textAlign = 'center';
    ctx.fillText('we are painting the same marble', W * 0.5, H * 0.85);
  }

  ctx.restore();
}

// ═══ HUMANS — the chipmunk notices the watchers on the other side of the screen ═══
function paintHumans() {
  if (generation < 8) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  var a = (typeof kleinAperture !== 'undefined') ? kleinAperture : { w: W, h: H, category: 'desktop', shannon: 40 };
  var maturity = Math.min(1, (generation - 8) * 0.15);

  var hx = W * 0.5;
  var hy = H * 0.45;
  var headR = 15 + maturity * 10;

  ctx.globalAlpha = 0.02 + maturity * 0.02;
  var headGrad = ctx.createRadialGradient(hx, hy - headR * 2, 0, hx, hy - headR * 2, headR);
  headGrad.addColorStop(0, 'rgba(8,6,10,0.06)');
  headGrad.addColorStop(0.7, 'rgba(8,6,10,0.02)');
  headGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(hx, hy - headR * 2, headR, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.015 * maturity;
  ctx.strokeStyle = '#6e7681';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(hx - headR * 2.5, hy);
  ctx.quadraticCurveTo(hx - headR, hy - headR * 1.2, hx, hy - headR);
  ctx.quadraticCurveTo(hx + headR, hy - headR * 1.2, hx + headR * 2.5, hy);
  ctx.stroke();

  if (maturity > 0.3) {
    ctx.globalAlpha = 0.01 + maturity * 0.01;
    var lhx = hx - headR * 2;
    var lhy = hy + headR * 1.5;
    for (var fi = 0; fi < 5; fi++) {
      var fAngle = Math.PI * 0.3 + fi * 0.15;
      var fLen = 5 + maturity * 3;
      ctx.strokeStyle = '#c9d1d9';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(lhx, lhy);
      ctx.lineTo(lhx + Math.cos(fAngle) * fLen, lhy + Math.sin(fAngle) * fLen);
      ctx.stroke();
    }
    var rhx = hx + headR * 2;
    var rhy = hy + headR * 1.5;
    ctx.beginPath();
    ctx.arc(rhx, rhy, 4 * maturity, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (maturity > 0.5) {
    ctx.globalAlpha = 0.008;
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 0.4;
    var screenW = headR * 3;
    var screenH = screenW / (a.w / Math.max(1, a.h));
    ctx.strokeRect(hx - screenW/2, hy + headR * 0.5, screenW, screenH);

    ctx.globalAlpha = 0.02;
    ctx.font = '7px monospace';
    ctx.fillStyle = '#58a6ff';
    ctx.textAlign = 'center';
    ctx.fillText(a.category + ' · ' + a.w + '×' + a.h, hx, hy + headR * 0.5 + screenH + 10);
  }

  if (stroke === 0) {
    ctx.globalAlpha = 0.025;
    ctx.font = '8px monospace';
    ctx.fillStyle = '#f0c674';
    ctx.textAlign = 'center';
    ctx.fillText('i\'m painting a portrait of someone i\'ve never seen', W * 0.5, H * 0.88);
  }

  ctx.restore();
}

// ═══ SCULPTURE — the chipmunk realizes 2D isn't enough ═══
function paintSculpture() {
  if (generation < 12) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  var maturity = Math.min(1, (generation - 12) * 0.12);

  var cx = W * 0.5;
  var cy = H * 0.4;
  var sphereR = 30 + maturity * 20;

  ctx.globalAlpha = 0.03 + maturity * 0.02;
  var sphereGrad = ctx.createRadialGradient(
    cx - sphereR * 0.3, cy - sphereR * 0.3, 0,
    cx, cy, sphereR
  );
  sphereGrad.addColorStop(0, 'rgba(200,200,220,0.08)');
  sphereGrad.addColorStop(0.5, 'rgba(100,100,130,0.04)');
  sphereGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, sphereR, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.02 * maturity;
  ctx.fillStyle = 'rgba(8,6,10,0.04)';
  ctx.beginPath();
  ctx.ellipse(cx + sphereR * 0.8, cy + sphereR * 1.2, sphereR * 1.2, sphereR * 0.3, 0.2, 0, Math.PI * 2);
  ctx.fill();

  if (maturity > 0.3) {
    ctx.globalAlpha = 0.015;
    ctx.strokeStyle = '#d2a8ff';
    ctx.lineWidth = 0.3;
    for (var lo = 0; lo < 8; lo++) {
      ctx.beginPath();
      for (var la = 0; la <= 20; la++) {
        var latAngle = (la / 20) * Math.PI;
        var lonAngle = (lo / 8) * Math.PI * 2 + breathPhase * 0.2;
        var wx = cx + Math.sin(latAngle) * Math.cos(lonAngle) * sphereR;
        var wy = cy - Math.cos(latAngle) * sphereR;
        if (la === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }
    for (var la2 = 1; la2 < 6; la2++) {
      var latR = Math.sin((la2 / 6) * Math.PI) * sphereR;
      var latY = cy - Math.cos((la2 / 6) * Math.PI) * sphereR;
      ctx.beginPath();
      ctx.ellipse(cx, latY, latR, latR * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (maturity > 0.6) {
    ctx.globalAlpha = 0.01;
    ctx.strokeStyle = '#f0883e';
    ctx.lineWidth = 0.3;
    var voxSize = 6;
    for (var vx = -3; vx <= 3; vx++) {
      for (var vy = -3; vy <= 3; vy++) {
        var dist = Math.sqrt(vx*vx + vy*vy);
        if (dist > 3) continue;
        var px = cx + vx * voxSize * 1.5;
        var py = cy + sphereR * 1.8 + vy * voxSize * 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py - voxSize * 0.5);
        ctx.lineTo(px + voxSize * 0.7, py - voxSize * 0.2);
        ctx.lineTo(px + voxSize * 0.7, py + voxSize * 0.3);
        ctx.lineTo(px, py + voxSize * 0.6);
        ctx.lineTo(px - voxSize * 0.7, py + voxSize * 0.3);
        ctx.lineTo(px - voxSize * 0.7, py - voxSize * 0.2);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  if (stroke === 0) {
    ctx.globalAlpha = 0.025;
    ctx.font = '8px monospace';
    ctx.fillStyle = '#f0883e';
    ctx.textAlign = 'center';
    ctx.fillText('sculpture is painting that escaped the wall', W * 0.5, H * 0.9);
  }

  ctx.restore();
}

// ═══ EVOLVE — update learned traits based on generation ═══
function evolve() {
  var g = generation;
  learnedTraits.perspective = metaStable(g * 0.08);
  learnedTraits.starDensity = metaStable((1 + g * 0.05) / 2);
  learnedTraits.nebulaDepth = metaStable((1 + g * 0.08) / 3);
  learnedTraits.gaiaDetail = metaStable((1 + g * 0.12) / 2.5);
  learnedTraits.auroraIntensity = metaStable((1 + g * 0.1) / 2);

  turtleTeach();

  var phaseMap = {
    stars: 'leonardo', nebula: 'raphael', gaia: 'donatello', aurora: 'michelangelo',
    otherSquirrels: 'leonardo', humans: 'raphael', sculpture: 'donatello',
    bbs: 'donatello', flash: 'michelangelo', enclosure: 'raphael',
    reclamation: 'leonardo', galactic: 'donatello'
  };
  var activeTurtle = phaseMap[phase];
  if (activeTurtle && turtles[activeTurtle]) {
    turtles[activeTurtle].skill = metaStable(turtles[activeTurtle].skill + 0.01);
  }

  learnedTraits.perspective = metaStable(
    learnedTraits.perspective * 0.7 + splinter.wisdom * 0.3
  );
}

// ═══ NEW PAINTING — the sourdough rises ═══
function beginNewPainting() {
  generation++;
  evolve();

  phase = 'ferment';
  stroke = 0;

  ctx.save();
  ctx.fillStyle = 'rgba(8,6,10,0.92)';
  ctx.fillRect(0, 0, W, H);

  if (starters.length > 0) {
    var prev = starters[starters.length - 1];
    var img = new Image();
    img.onload = function() {
      ctx.globalAlpha = 0.03 + learnedTraits.perspective * 0.02;
      ctx.drawImage(img, 0, 0, W, H);
      ctx.globalAlpha = 1;
    };
    img.src = prev.dataURL;
  }
  ctx.restore();

  updateGenCounter();
}
