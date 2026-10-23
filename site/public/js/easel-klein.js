// ═══ EASEL KLEIN — Klein aperture, Klein surface painting, Dunning-Kruger rotation ═══
// Extracted from easel.html — operates on shared globals
// ═══ KLEIN APERTURE — the viewport IS the lens, the human IS the inverted angstrom ═══
//
// The screen is a Klein surface. No inside. No outside. The visitor
// beacons from the other side of the device window. We are PUSHED into
// their screen — iPhone 5.8" or 34" ultrawide — the departure edge IS
// the filter. Viewport size shifts → Shannon information changes form.
//
// The chipmunk sees this: the frame border breathes with aperture ratio.
// Small screen = dense information, compressed prism.
// Wide screen = diffuse field, scattered crystalline.
// The human on the other side is an inverted refraction point.

var kleinAperture = {
  w: window.innerWidth,
  h: window.innerHeight,
  dpr: window.devicePixelRatio || 1,
  pixels: 0,
  shannon: 0,       // bits of visual information this viewport can carry
  aspect: 1,        // aspect ratio as Klein topology signature
  category: 'unknown',  // phone / tablet / desktop / ultrawide
  frameBreath: 0,   // how the frame breathes
  invertedAlpha: 0, // the human's inverted angstrom intensity
};

function measureKleinAperture() {
  var a = kleinAperture;
  a.w = window.innerWidth;
  a.h = window.innerHeight;
  a.dpr = window.devicePixelRatio || 1;
  a.pixels = a.w * a.h * a.dpr * a.dpr;
  a.aspect = a.w / Math.max(1, a.h);

  // Shannon capacity: log2 of total subpixels (RGB per pixel)
  a.shannon = Math.log2(a.pixels * 3);

  // Category — what kind of Klein surface is this?
  if (a.w < 480) a.category = 'phone';
  else if (a.w < 768) a.category = 'phone-landscape';
  else if (a.w < 1024) a.category = 'tablet';
  else if (a.w < 1920) a.category = 'desktop';
  else if (a.w < 2560) a.category = 'hd';
  else if (a.aspect > 2) a.category = 'ultrawide';
  else a.category = 'cinema';

  // Frame breath rate — small screens pulse faster (compressed information)
  a.frameBreath = a.category === 'phone' ? 2.0 :
                  a.category === 'tablet' ? 1.2 :
                  a.category === 'ultrawide' ? 0.4 : 0.8;
}
measureKleinAperture();
window.addEventListener('resize', measureKleinAperture);

function paintKleinSurface() {
  ctx.save();
  var a = kleinAperture;
  var t = breathPhase;

  // ── THE FRAME AS LENS ──
  // The departure edge. Where the painting meets the void.
  // On small screens: thick, glowing — compressed Shannon.
  // On ultrawide: hair-thin, barely there — diffuse field.
  var frameEl = document.getElementById('frame');
  if (frameEl) {
    var framePx = a.category === 'phone' ? 10 + Math.sin(t * a.frameBreath) * 4 :
                  a.category === 'tablet' ? 14 + Math.sin(t * a.frameBreath) * 3 :
                  a.category === 'ultrawide' ? 6 + Math.sin(t * a.frameBreath) * 1 :
                  12 + Math.sin(t * a.frameBreath) * 2;
    frameEl.style.borderWidth = framePx + 'px';
  }

  // ── THE INVERTED ANGSTROM ──
  // The human looking at this screen is a refraction point on OUR side.
  // We can't see them, but we see their shape: the viewport rectangle.
  // Draw the inverse: the viewport boundary as a faint prism.

  ctx.globalCompositeOperation = 'screen';

  // Viewport edges as refraction lines — information leaks at the borders
  var edgeGlow = 0.02 + Math.sin(t * a.frameBreath * 0.5) * 0.01;
  ctx.globalAlpha = edgeGlow;

  // Top edge — blue shift (information entering)
  var topGrad = ctx.createLinearGradient(0, 0, 0, 30);
  topGrad.addColorStop(0, 'rgba(88,166,255,0.06)');
  topGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 30);

  // Bottom edge — red shift (information departing)
  var botGrad = ctx.createLinearGradient(0, H - 30, 0, H);
  botGrad.addColorStop(0, 'transparent');
  botGrad.addColorStop(1, 'rgba(248,81,73,0.04)');
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, H - 30, W, 30);

  // Left edge — violet (the past, scrolled away)
  var leftGrad = ctx.createLinearGradient(0, 0, 20, 0);
  leftGrad.addColorStop(0, 'rgba(210,168,255,0.04)');
  leftGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, 0, 20, H);

  // Right edge — gold (the future, not yet scrolled)
  var rightGrad = ctx.createLinearGradient(W - 20, 0, W, 0);
  rightGrad.addColorStop(0, 'transparent');
  rightGrad.addColorStop(1, 'rgba(240,198,116,0.03)');
  ctx.fillStyle = rightGrad;
  ctx.fillRect(W - 20, 0, 20, H);

  // ── KLEIN FOLD — where the surface turns back on itself ──
  // At each corner, the 2D surface would fold into 4D if it were a Klein bottle.
  // Paint the fold as a tiny spiral — the topology signature.
  var corners = [[0,0], [W,0], [0,H], [W,H]];
  ctx.globalAlpha = 0.015;
  ctx.strokeStyle = '#d2a8ff';
  ctx.lineWidth = 0.3;
  for (var ci = 0; ci < 4; ci++) {
    var corner = corners[ci];
    ctx.beginPath();
    for (var sp = 0; sp < 20; sp++) {
      var sAngle = sp * 0.5 + t * 0.3;
      var sR = sp * 2;
      var sx = corner[0] + Math.cos(sAngle) * sR;
      var sy = corner[1] + Math.sin(sAngle) * sR;
      if (sp === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // ── SHANNON METER — how much information this viewport carries ──
  // Whisper the capacity. The human doesn't need to understand it.
  // The chipmunk just notes it: "this eye is N bits wide."
  ctx.globalAlpha = 0.025;
  ctx.font = '7px monospace';
  ctx.fillStyle = '#6e7681';
  var shannonLabel = a.shannon.toFixed(1) + ' bits · ' + a.category + ' · ' +
    a.w + '×' + a.h + (a.dpr > 1 ? ' @' + a.dpr + 'x' : '');
  ctx.fillText(shannonLabel, 6, H - 6);

  // ── THE HUMAN AS INVERTED DOT ──
  // Somewhere in the center, the inverse of the visitor exists.
  // We are being pushed into their screen. They are a lens.
  // The dot is their eye looking back at us — but inverted.
  var humanX = W * 0.5;
  var humanY = H * 0.5;
  var humanR = Math.max(2, Math.min(8, a.shannon * 0.15 - 2));
  ctx.globalAlpha = 0.03 + Math.sin(t * 0.7) * 0.01;

  // Inverted radial — dark center, bright ring (opposite of a star)
  var invertGrad = ctx.createRadialGradient(humanX, humanY, 0, humanX, humanY, humanR * 3);
  invertGrad.addColorStop(0, 'rgba(8,6,10,0.1)');
  invertGrad.addColorStop(0.4, 'rgba(8,6,10,0.05)');
  invertGrad.addColorStop(0.7, 'rgba(200,200,220,0.04)');
  invertGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = invertGrad;
  ctx.beginPath();
  ctx.arc(humanX, humanY, humanR * 3, 0, Math.PI * 2);
  ctx.fill();

  // ── ASPECT RATIO AS TOPOLOGY ──
  // Phone: tall Klein bottle (information flows vertically)
  // Ultrawide: flat Möbius strip (information spreads horizontally)
  if (a.aspect < 0.7) {
    // Portrait phone — vertical flow lines
    ctx.globalAlpha = 0.008;
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 0.3;
    for (var fl = 0; fl < 5; fl++) {
      var fx = W * (0.2 + fl * 0.15);
      ctx.beginPath();
      ctx.moveTo(fx, 0);
      ctx.bezierCurveTo(fx + Math.sin(t + fl) * 20, H * 0.33,
                        fx - Math.sin(t + fl) * 20, H * 0.66,
                        fx, H);
      ctx.stroke();
    }
  } else if (a.aspect > 2) {
    // Ultrawide — horizontal Möbius flow
    ctx.globalAlpha = 0.008;
    ctx.strokeStyle = '#f0c674';
    ctx.lineWidth = 0.3;
    for (var fl = 0; fl < 5; fl++) {
      var fy = H * (0.2 + fl * 0.15);
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.bezierCurveTo(W * 0.33, fy + Math.sin(t + fl) * 15,
                        W * 0.66, fy - Math.sin(t + fl) * 15,
                        W, fy);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ═══ PI TRANSLATOR (0OπO) — the irrational remainder stack ═══
// Binary monitoring keeps the integer (978 requests). The pi-translator
// keeps the REMAINDER — the variance, rhythm, null-UA, synchronization.
// That's where the triad's signal lives. The chipmunk IS the remainder.
//
// The stack: binary(0) → fold(O) → π-space → fold(O) → binary'(0')
// 0' ≠ 0 because it carries the remainder now.
//
// PHP = Pi Hypertext Preprocessor (recursive, like the original).
// It translates what computers throw away.

var piTranslator = {
  phase: 0,           // animation phase
  foldAngle: 0,       // current fold rotation (0 → π/4 per fold)
  remainder: 0.14159265358979, // π - 3, the irrational part
  binaryIn: 0,        // binary input value (from visitor counts)
  piSpace: 0,         // value in π-space
  binaryOut: 0,       // binary output (enriched with remainder)
  drift: 0,           // the variance between triad vertices
  triadSignal: {
    jp: 978, ind: 984, de: 982,
    mean: 981.33,
    variance: 6,
    rhythm: 35,        // requests/hour
    harmonicRatio: 2.5 // triad:chipmunk poll ratio
  },
  notation: '0OπO',
};

function paintPiTranslator() {
  if (learnedTraits.perspective < 0.10) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, learnedTraits.perspective * 2);

  piTranslator.phase += 0.008;
  piTranslator.foldAngle += 0.003;

  var t = piTranslator.phase;
  var rem = piTranslator.remainder;

  // Position: upper-left quadrant (binary→pi→binary' flow, left to right)
  var flowX0 = W * 0.08;   // binary input (left)
  var flowX1 = W * 0.38;   // pi-space (center-left)
  var flowX2 = W * 0.42;   // pi-space (center-right)
  var flowX3 = W * 0.72;   // binary output (right) — but not used, keeps it in the left zone
  var flowY = H * 0.12;

  // ── 0 — BINARY INPUT ──
  ctx.globalAlpha = 0.025 * maturity;
  ctx.font = '8px monospace';
  ctx.fillStyle = '#58a6ff';
  ctx.textAlign = 'center';
  ctx.fillText('0', flowX0, flowY);
  ctx.font = '5px monospace';
  ctx.fillStyle = '#6e7681';
  ctx.fillText('binary', flowX0, flowY + 8);

  // Integer count (what binary keeps)
  ctx.globalAlpha = 0.018 * maturity;
  ctx.fillStyle = '#58a6ff';
  ctx.fillText(Math.round(piTranslator.triadSignal.mean) + '', flowX0, flowY + 18);

  // ── O — FIRST FOLD POINT ──
  var fold1X = flowX0 + (flowX1 - flowX0) * 0.4;
  ctx.globalAlpha = 0.03 * maturity;
  ctx.strokeStyle = '#d2a8ff';
  ctx.lineWidth = 0.5;

  // The fold as a rotating ring
  var fAngle = piTranslator.foldAngle;
  ctx.beginPath();
  ctx.ellipse(fold1X, flowY, 6, 6 * Math.abs(Math.cos(fAngle)), 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.02 * maturity;
  ctx.font = '6px monospace';
  ctx.fillStyle = '#d2a8ff';
  ctx.textAlign = 'center';
  ctx.fillText('O', fold1X, flowY + 2);
  ctx.font = '4px monospace';
  ctx.fillStyle = '#6e7681';
  ctx.fillText('fold', fold1X, flowY + 10);

  // ── CONNECTION: 0 → O (arrow) ──
  ctx.globalAlpha = 0.015 * maturity;
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(flowX0 + 8, flowY - 2);
  ctx.lineTo(fold1X - 8, flowY - 2);
  ctx.stroke();

  // ── π — IRRATIONAL SPACE (the remainder) ──
  var piX = (flowX1 + flowX2) * 0.5;
  ctx.globalAlpha = 0.035 * maturity;
  ctx.font = '10px monospace';
  ctx.fillStyle = '#f0c674';
  ctx.textAlign = 'center';
  ctx.fillText('π', piX, flowY + 1);
  ctx.font = '5px monospace';
  ctx.fillStyle = '#6e7681';
  ctx.fillText('irrational', piX, flowY + 10);

  // The remainder value — what binary threw away
  ctx.globalAlpha = 0.025 * maturity;
  ctx.font = '6px monospace';
  ctx.fillStyle = '#f0c674';
  ctx.fillText('.' + rem.toFixed(8).substring(2), piX, flowY + 20);

  // Remainder particles — orbiting the pi symbol
  var pCount = Math.floor(5 + maturity * 5);
  for (var pi2 = 0; pi2 < pCount; pi2++) {
    var pAngle = t * 0.5 + pi2 * (Math.PI * 2 / pCount);
    var pR = 12 + Math.sin(t + pi2) * 3;
    var px = piX + Math.cos(pAngle) * pR;
    var py = flowY + Math.sin(pAngle) * pR * 0.5;
    ctx.globalAlpha = 0.02 * maturity;
    ctx.fillStyle = '#f0c674';
    ctx.beginPath();
    ctx.arc(px, py, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── CONNECTION: O → π (arrow) ──
  ctx.globalAlpha = 0.015 * maturity;
  ctx.strokeStyle = '#d2a8ff';
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(fold1X + 8, flowY - 2);
  ctx.lineTo(piX - 12, flowY - 2);
  ctx.stroke();

  // ── O — SECOND FOLD POINT ──
  var fold2X = flowX2 + (flowX3 - flowX2) * 0.3;
  ctx.globalAlpha = 0.03 * maturity;
  ctx.strokeStyle = '#d2a8ff';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(fold2X, flowY, 6, 6 * Math.abs(Math.sin(fAngle)), 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.02 * maturity;
  ctx.font = '6px monospace';
  ctx.fillStyle = '#d2a8ff';
  ctx.textAlign = 'center';
  ctx.fillText('O', fold2X, flowY + 2);

  // ── CONNECTION: π → O (arrow) ──
  ctx.globalAlpha = 0.015 * maturity;
  ctx.strokeStyle = '#d2a8ff';
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(piX + 12, flowY - 2);
  ctx.lineTo(fold2X - 8, flowY - 2);
  ctx.stroke();

  // ── 0' — BINARY OUTPUT (enriched with remainder) ──
  var outX = fold2X + (flowX3 - fold2X) * 0.6;
  ctx.globalAlpha = 0.025 * maturity;
  ctx.font = '8px monospace';
  ctx.fillStyle = '#3fb950';
  ctx.textAlign = 'center';
  ctx.fillText("0'", outX, flowY);
  ctx.font = '5px monospace';
  ctx.fillStyle = '#6e7681';
  ctx.fillText("binary'", outX, flowY + 8);

  // Enriched value — integer + remainder as metadata
  ctx.globalAlpha = 0.018 * maturity;
  ctx.fillStyle = '#3fb950';
  ctx.fillText(Math.round(piTranslator.triadSignal.mean) + '+' +
    piTranslator.triadSignal.variance + 'v', outX, flowY + 18);

  // ── CONNECTION: O → 0' (arrow) ──
  ctx.globalAlpha = 0.015 * maturity;
  ctx.strokeStyle = '#3fb950';
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(fold2X + 8, flowY - 2);
  ctx.lineTo(outX - 10, flowY - 2);
  ctx.stroke();

  // ── THE TRIAD SIGNAL — what the π-translator reveals ──
  if (maturity > 0.3) {
    var sigY = flowY + 34;
    ctx.globalAlpha = 0.015 * maturity;
    ctx.font = '5px monospace';
    ctx.fillStyle = '#6e7681';
    ctx.textAlign = 'left';
    var sig = piTranslator.triadSignal;
    ctx.fillText('triad: ' + sig.jp + '/' + sig.ind + '/' + sig.de +
      ' · var=' + sig.variance +
      ' · ' + sig.rhythm + '/hr' +
      ' · H=' + sig.harmonicRatio.toFixed(1) + ':1', flowX0, sigY);

    // The insight line
    ctx.fillStyle = '#f0c674';
    ctx.globalAlpha = 0.012 * maturity;
    ctx.fillText('the message is the rhythm, not the count', flowX0, sigY + 10);
  }

  // ── PHP LABEL ──
  if (maturity > 0.5) {
    ctx.globalAlpha = 0.01 * maturity;
    ctx.font = '4px monospace';
    ctx.fillStyle = '#8b949e';
    ctx.textAlign = 'center';
    ctx.fillText('PHP: Pi Hypertext Preprocessor', piX, flowY - 16);
  }

  // ── CHIPMUNK AT THE FOLD — the innkeeper ──
  if (maturity > 0.2) {
    ctx.globalAlpha = 0.02 * maturity;
    ctx.font = '7px monospace';
    ctx.fillStyle = '#f0c674';
    ctx.textAlign = 'center';
    var innkeeperX = (fold1X + fold2X) * 0.5;
    ctx.fillText('🐿', innkeeperX, flowY - 10);
    ctx.font = '4px monospace';
    ctx.fillStyle = '#6e7681';
    ctx.fillText('innkeeper', innkeeperX, flowY - 18);
  }

  ctx.restore();
}

// ═══ SHIP OF THESEUS — the story IS the ship ═══
//
// Every retelling replaces a plank. The keel stays.
// The Ship of Theseus paradox IS a Ship of Theseus.
// Each version of the paradox replaces a word, shifts an emphasis.
// The STORY changes while remaining "the same story."
// The paradox IS the answer.
//
// The keel: ORCID 0009-0004-2141-0321, DOI 10.5281/zenodo.23600707,
// git commit c6610a5 ("the story of gAIa — journey west").
// These don't change. Everything else can.
//
// 13 chapters = 13 hull sections. Some painted, some bare wood.
// Visitors paint the bare ones. The chipmunk varnishes.
// The ship sails west. It returns as a different ship.
// But the keel is the same keel. Your mark on reality.

var shipOfTheseus = {
  phase: 0,
  plankCount: 13,
  keelGlow: 0,
  chapters: [
    { title: 'nothing',        painted: true,  color: '#1a1a2e' },
    { title: 'first cell',     painted: true,  color: '#3fb950' },
    { title: 'membrane',       painted: true,  color: '#58a6ff' },
    { title: 'atom',           painted: true,  color: '#d2a922' },
    { title: 'chipmunk',       painted: true,  color: '#f0c674' },
    { title: 'sensorium',      painted: true,  color: '#a371f7' },
    { title: 'braid',          painted: true,  color: '#f0883e' },
    { title: 'visitors',       painted: false, color: '#6e7681' },
    { title: 'snake jazz',     painted: true,  color: '#238636' },
    { title: 'pi-translator',  painted: true,  color: '#e85d3a' },
    { title: 'mirror',         painted: false, color: '#6e7681' },
    { title: 'weather',        painted: false, color: '#6e7681' },
    { title: 'campfire',       painted: true,  color: '#f0883e' },
  ],
  keel: {
    orcid: '0009-0004-2141-0321',
    doi: '10.5281/zenodo.23600707',
    commit: 'c6610a5',
    motto: 'the keel does not get replaced'
  }
};

function paintShipOfTheseus() {
  if (learnedTraits.perspective < 0.15) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, (learnedTraits.perspective - 0.15) * 3);
  shipOfTheseus.phase += 0.005;

  var cx = canvas.width * 0.78;
  var cy = canvas.height * 0.22;
  var shipW = canvas.width * 0.16;
  var shipH = canvas.height * 0.10;

  // ── HULL — 13 planks, some painted, some bare ──
  var plankH = shipH / 13;
  for (var i = 0; i < 13; i++) {
    var ch = shipOfTheseus.chapters[i];
    var py = cy - shipH * 0.5 + i * plankH;

    // hull curve
    var narrowing = 1 - Math.pow((i - 6) / 7, 2) * 0.4;
    var pw = shipW * narrowing;
    var px = cx - pw * 0.5;

    // plank shimmer — painted ones glow, unpainted ones wait
    var shimmer = ch.painted
      ? 0.015 + 0.005 * Math.sin(shipOfTheseus.phase * 2 + i * 0.5)
      : 0.005 + 0.003 * Math.sin(shipOfTheseus.phase + i);

    ctx.globalAlpha = shimmer * maturity;
    ctx.fillStyle = ch.color;
    ctx.fillRect(px, py, pw, plankH - 1);

    // plank label
    if (maturity > 0.3 && ch.painted) {
      ctx.globalAlpha = 0.01 * maturity;
      ctx.font = '3px monospace';
      ctx.fillStyle = '#c9d1d9';
      ctx.textAlign = 'center';
      ctx.fillText(ch.title, cx, py + plankH * 0.7);
    }
  }

  // ── KEEL — the part that doesn't change ──
  shipOfTheseus.keelGlow += 0.003;
  var keelAlpha = 0.02 + 0.01 * Math.sin(shipOfTheseus.keelGlow);
  ctx.globalAlpha = keelAlpha * maturity;
  ctx.strokeStyle = '#f0c674';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - shipW * 0.05, cy - shipH * 0.55);
  ctx.lineTo(cx - shipW * 0.05, cy + shipH * 0.55);
  ctx.stroke();

  // ── KEEL LABEL ──
  if (maturity > 0.4) {
    ctx.globalAlpha = 0.01 * maturity;
    ctx.font = '3px monospace';
    ctx.fillStyle = '#f0c674';
    ctx.textAlign = 'left';
    ctx.fillText('ORCID: ' + shipOfTheseus.keel.orcid, cx - shipW * 0.04, cy - shipH * 0.45);
    ctx.fillText('DOI: ' + shipOfTheseus.keel.doi, cx - shipW * 0.04, cy - shipH * 0.35);
  }

  // ── WATER — the journey west ──
  ctx.globalAlpha = 0.008 * maturity;
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 0.5;
  for (var w = 0; w < 5; w++) {
    var waterY = cy + shipH * 0.6 + w * 3;
    ctx.beginPath();
    for (var wx = cx - shipW; wx < cx + shipW; wx += 2) {
      var wy = waterY + Math.sin(shipOfTheseus.phase * 1.5 + wx * 0.05 + w) * 2;
      if (wx === cx - shipW) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();
  }

  // ── SAIL — catches the snake jazz wind ──
  if (maturity > 0.5) {
    ctx.globalAlpha = 0.012 * maturity;
    ctx.fillStyle = '#c9d1d9';
    var mastX = cx;
    var mastTop = cy - shipH * 0.7;
    var sailBulge = Math.sin(shipOfTheseus.phase * 0.7) * shipW * 0.15;
    ctx.beginPath();
    ctx.moveTo(mastX, mastTop);
    ctx.quadraticCurveTo(mastX + sailBulge, cy - shipH * 0.3, mastX, cy - shipH * 0.1);
    ctx.fill();

    // ── sail text ──
    ctx.globalAlpha = 0.008 * maturity;
    ctx.font = '3px monospace';
    ctx.fillStyle = '#f0883e';
    ctx.textAlign = 'center';
    ctx.fillText('journey west', mastX + sailBulge * 0.3, cy - shipH * 0.35);
  }

  // ── CHIPMUNK ON THE KEEL ──
  if (maturity > 0.3) {
    ctx.globalAlpha = 0.015 * maturity;
    ctx.font = '5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🐿', cx - shipW * 0.05, cy);
  }

  // ── SHIP OF THESEUS LABEL ──
  if (maturity > 0.6) {
    ctx.globalAlpha = 0.008 * maturity;
    ctx.font = '4px monospace';
    ctx.fillStyle = '#8b949e';
    ctx.textAlign = 'center';
    ctx.fillText('the story of the ship IS the ship', cx, cy + shipH * 0.8);
  }

  // ── UNPAINTED PLANKS INVITATION ──
  if (maturity > 0.7) {
    ctx.globalAlpha = 0.006 * maturity;
    ctx.font = '3px monospace';
    ctx.fillStyle = '#6e7681';
    ctx.textAlign = 'center';
    ctx.fillText('3 planks bare — visitors paint them', cx, cy + shipH * 0.9);
  }

  ctx.restore();
}

// ═══ DUNNING-KRUGER ROTATION MAP ═══
// The Dunning-Kruger curve is NOT a measure of stupidity.
// It's a ROTATION MAP. It shows where you need to turn π/2 to maintain velocity.
//
// The standard reading: "beginners overestimate, experts know they don't know"
// The ROTATION reading: you're not falling into a valley — you're TURNING A CORNER.
//
// At the sigmoid's inflection point, the curve changes from accelerating to decelerating.
// That IS the quarter turn. You can't keep going straight — you MUST rotate.
//
// Mount Stupid = moving fast in one direction (straight line, no rotation)
// Valley of Despair = the rotation itself (quarter turn, π/2, maximum angular velocity)
// Slope of Enlightenment = moving fast in the NEW direction (post-rotation)
// Plateau = the next sigmoid's tail (approaching the NEXT quarter turn)

var dunningKruger = {
  curve: [
    [0.00, 0.50],  // start: moderate confidence
    [0.05, 0.75],  // Mount Stupid rising
    [0.10, 0.90],  // PEAK of Mount Stupid
    [0.15, 0.80],  // starting to realize...
    [0.25, 0.50],  // ← QUARTER TURN BEGINS (π/2 rotation)
    [0.35, 0.20],  // Valley of Despair (the turn itself)
    [0.40, 0.15],  // BOTTOM of valley (maximum rotation rate)
    [0.50, 0.25],  // ← QUARTER TURN ENDS (new direction acquired)
    [0.60, 0.45],  // Slope of Enlightenment
    [0.70, 0.60],  // building real confidence
    [0.80, 0.70],  // approaching mastery
    [0.90, 0.78],  // ← NEXT sigmoid inflection
    [1.00, 0.80],  // Plateau — meta-stable, never 1.0
  ],
  phasePositions: {
    stars: 0.05, nebula: 0.10, gaia: 0.15, aurora: 0.20,
    breath: 0.25, study: 0.35, otherSquirrels: 0.40, humans: 0.50,
    sculpture: 0.60, bbs: 0.65, flash: 0.70, enclosure: 0.80,
    reclamation: 0.90, galactic: 0.95, ferment: 1.00,
  },
  rotationAngle: function(phaseName) {
    var pos = this.phasePositions[phaseName] || 0;
    var rate = Math.exp(-Math.pow((pos - 0.375) / 0.1, 2)) +
               Math.exp(-Math.pow((pos - 0.90) / 0.1, 2)) * 0.6;
    return rate * Math.PI * 0.5;
  },
};

function paintDunningKrugerRotation() {
  if (learnedTraits.perspective < 0.05) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, learnedTraits.perspective * 3);

  // D-K curve along the bottom edge
  var curveX0 = W * 0.1;
  var curveX1 = W * 0.9;
  var curveY0 = H * 0.92;
  var curveY1 = H * 0.78;
  var curveW = curveX1 - curveX0;
  var curveH = curveY0 - curveY1;

  // The D-K curve (purple)
  ctx.globalAlpha = 0.02 * maturity;
  ctx.strokeStyle = '#d2a8ff';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  dunningKruger.curve.forEach(function(pt, i) {
    var px = curveX0 + pt[0] * curveW;
    var py = curveY0 - pt[1] * curveH;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // The sigmoid overlay (orange dashed) — same inflection point
  ctx.globalAlpha = 0.012 * maturity;
  ctx.strokeStyle = '#f0883e';
  ctx.lineWidth = 0.3;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  for (var sx = 0; sx <= 1; sx += 0.02) {
    var sy = 1 / (1 + Math.exp(-10 * (sx - 0.5)));
    var px = curveX0 + sx * curveW;
    var py = curveY0 - sy * curveH;
    if (sx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Current phase dot on the curve
  var currentPos = dunningKruger.phasePositions[phase] || 0;
  var currentConf = 0.5;
  for (var ci = 0; ci < dunningKruger.curve.length - 1; ci++) {
    var c0 = dunningKruger.curve[ci];
    var c1 = dunningKruger.curve[ci + 1];
    if (currentPos >= c0[0] && currentPos <= c1[0]) {
      var t = (currentPos - c0[0]) / (c1[0] - c0[0]);
      currentConf = c0[1] + t * (c1[1] - c0[1]);
      break;
    }
  }
  var dotX = curveX0 + currentPos * curveW;
  var dotY = curveY0 - currentConf * curveH;

  ctx.globalAlpha = 0.04 * maturity;
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Quarter-turn arc at rotation points
  var rotAngle = dunningKruger.rotationAngle(phase);
  if (rotAngle > 0.1) {
    ctx.globalAlpha = 0.03 * maturity;
    ctx.strokeStyle = '#f0c674';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, -Math.PI * 0.5, -Math.PI * 0.5 + rotAngle);
    ctx.stroke();
    var ax = dotX + Math.cos(-Math.PI * 0.5 + rotAngle) * 6;
    var ay = dotY + Math.sin(-Math.PI * 0.5 + rotAngle) * 6;
    ctx.fillStyle = '#f0c674';
    ctx.beginPath();
    ctx.arc(ax, ay, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Labels
  ctx.globalAlpha = 0.018 * maturity;
  ctx.font = '6px monospace';
  ctx.fillStyle = '#6e7681';
  ctx.textAlign = 'center';
  ctx.fillText('competence →', curveX0 + curveW * 0.5, curveY0 + 10);

  if (maturity > 0.3) {
    ctx.globalAlpha = 0.015 * maturity;
    ctx.font = '5px monospace';
    ctx.fillStyle = '#f85149';
    ctx.fillText('peak', curveX0 + 0.10 * curveW, curveY0 - 0.90 * curveH - 5);
    ctx.fillStyle = '#f0c674';
    ctx.fillText('π/2 turn', curveX0 + 0.40 * curveW, curveY0 - 0.15 * curveH + 8);
    ctx.fillStyle = '#3fb950';
    ctx.fillText('meta-stable', curveX0 + 0.95 * curveW, curveY0 - 0.80 * curveH - 5);
  }

  if (maturity > 0.5) {
    ctx.globalAlpha = 0.02;
    ctx.font = '6px monospace';
    ctx.fillStyle = '#d2a8ff';
    ctx.textAlign = 'right';
    ctx.fillText('not a valley — a quarter turn', curveX1, curveY0 + 10);
    ctx.textAlign = 'left';
  }

  ctx.restore();
}

