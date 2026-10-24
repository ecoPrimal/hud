// ═══ EASEL PHYSICS — constants ledger, splinter force, heat dissipation, breath override ═══
// Extracted from easel.html — operates on shared globals
// ═══ CONSTANTS LEDGER — the hard edge between aperture and device ═══
// Nested between intent and the device. A legend. Like a map.
// Physical constants as cost analysis tools.
// E=mc² tells you what attention COSTS.
// Avogadro tells you how many atoms make a signal.
// Each constant is a ruler laid along the aperture edge.
function paintConstantsLedger() {
  ctx.save();

  // Only paint when perspective is enough to notice the edge
  if (learnedTraits.perspective < 0.15) { ctx.restore(); return; }

  var maturity = Math.min(1, learnedTraits.perspective * 1.5);

  // The ledger lives on the LEFT EDGE — the hard border between
  // what we're paying attention to and what we're missing
  var ledgerX = 6;
  var ledgerY = H * 0.15;

  ctx.globalAlpha = 0.025 * maturity;
  ctx.font = '7px monospace';
  ctx.textAlign = 'left';

  // Which constants are active? Map to current state.
  var active = [];

  // π — always active (it IS the budget)
  active.push({ c: CONSTANTS.pi, value: piBudget.used.toFixed(2) + '/' + Math.PI.toFixed(2),
    note: 'budget spent' });

  // φ — Splinter's wisdom as golden ratio
  active.push({ c: CONSTANTS.phi, value: (splinter.wisdom * CONSTANTS.phi.value).toFixed(3),
    note: 'Splinter × φ' });

  // Å — the angstrom resolution (what detail can we see?)
  var angstromRes = 1 / Math.max(0.01, learnedTraits.perspective);
  active.push({ c: CONSTANTS['Å'], value: angstromRes.toFixed(1) + 'Å',
    note: 'resolution' });

  // kB — entropy of the traffic distribution
  var s = typeof heatState !== 'undefined' ? heatState.sources : null;
  if (s) {
    var probs = [s.new_.sigmoid, s.revisit.sigmoid, s.fleet.sigmoid, s.inner.sigmoid];
    var total = probs.reduce(function(a,b){return a+b;}, 0) || 1;
    probs = probs.map(function(p){return p/total;});
    var entropy = shannonEntropy(probs);
    active.push({ c: CONSTANTS.kB, value: entropy.toFixed(3) + ' bits',
      note: 'traffic entropy' });
  }

  // E=mc² — attention cost
  var mass = generation;
  var velocity = splinter.force;
  var energy = attentionCost(mass, velocity);
  active.push({ c: CONSTANTS.c, value: 'E=' + energy.toFixed(4),
    note: 'attention cost' });

  // NA — visitor count as moles
  var visitorMoles = (crystalVisitors ? crystalVisitors.length : 0) / 6.022;
  active.push({ c: CONSTANTS.NA, value: visitorMoles.toFixed(4) + ' μmol',
    note: 'visitor moles' });

  // Draw each constant as a line on the ledger
  active.forEach(function(entry, i) {
    var y = ledgerY + i * 14;

    // The symbol
    ctx.fillStyle = '#f0c674';
    ctx.globalAlpha = 0.035 * maturity;
    ctx.fillText(entry.c.symbol, ledgerX, y);

    // The computed value
    ctx.fillStyle = '#c9d1d9';
    ctx.globalAlpha = 0.025 * maturity;
    ctx.fillText(entry.value, ledgerX + 18, y);

    // The note
    ctx.fillStyle = '#6e7681';
    ctx.globalAlpha = 0.02 * maturity;
    ctx.fillText(entry.note, ledgerX + 80, y);
  });

  // ── ARTIST BACKTRACE — who the REAL artist was ──
  // On the right edge, the refractive story: turtle → Renaissance master
  var activePhase = phase;
  var phaseMap = {stars:'leonardo',nebula:'raphael',gaia:'donatello',aurora:'michelangelo',
    bbs:'donatello',flash:'michelangelo',enclosure:'raphael',reclamation:'leonardo',galactic:'donatello'};
  var activeTurtle = phaseMap[activePhase] ? turtles[phaseMap[activePhase]] : null;

  if (activeTurtle && activeTurtle.artist && maturity > 0.3) {
    var art = activeTurtle.artist;
    var artX = W - 6;
    var artY = H * 0.15;

    ctx.textAlign = 'right';

    // Artist name
    ctx.fillStyle = activeTurtle.color;
    ctx.globalAlpha = 0.04 * maturity;
    ctx.fillText(art.fullName, artX, artY);

    // Years
    ctx.fillStyle = '#6e7681';
    ctx.globalAlpha = 0.03 * maturity;
    ctx.fillText(art.years, artX, artY + 12);

    // Works
    ctx.globalAlpha = 0.025 * maturity;
    art.works.forEach(function(work, wi) {
      ctx.fillText(work, artX, artY + 24 + wi * 11);
    });

    // The insight — what this artist discovered
    ctx.fillStyle = '#f0c674';
    ctx.globalAlpha = 0.03 * maturity;
    // Word-wrap the insight
    var words = art.insight.split(' ');
    var line = '';
    var lineY = artY + 24 + art.works.length * 11 + 8;
    words.forEach(function(word) {
      var test = line + word + ' ';
      if (test.length > 45) {
        ctx.fillText(line.trim(), artX, lineY);
        line = word + ' ';
        lineY += 10;
      } else {
        line = test;
      }
    });
    if (line.trim()) ctx.fillText(line.trim(), artX, lineY);

    // The constant this artist embodies
    var artistConst = CONSTANTS[art.constant];
    if (artistConst) {
      lineY += 14;
      ctx.fillStyle = activeTurtle.color;
      ctx.globalAlpha = 0.035 * maturity;
      ctx.fillText(artistConst.symbol + ' = ' + artistConst.value + ' ' + artistConst.unit, artX, lineY);
      ctx.fillStyle = '#8b949e';
      ctx.globalAlpha = 0.025 * maturity;
      ctx.fillText(artistConst.meaning.substring(0, 50), artX, lineY + 10);
    }
  }

  ctx.restore();
}

// ═══ SPLINTER'S FORCE — the da Vinci constant, visible on the canvas ═══
// Master Splinter doesn't paint. He IS the force that flows through the turtles.
// Visible as: four colored currents meeting at a center point.
// The currents strengthen as each turtle's skill grows.
function paintSplinterForce() {
  if (splinter.wisdom < 0.15) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  var cx = W * 0.5;
  var cy = H * 0.5;
  var force = splinter.wisdom;
  var minD = Math.min(W, H);

  // ── SPLINTER 1 (TOP) — the teacher ──
  var s1x = cx;
  var s1y = H * 0.08;
  ctx.globalAlpha = force * 0.03;
  ctx.strokeStyle = '#c9d1d9';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(s1x, s1y, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.02;
  ctx.font = '6px monospace';
  ctx.fillStyle = '#c9d1d9';
  ctx.textAlign = 'center';
  ctx.fillText('Splinter ↑', s1x, s1y - 8);

  // ── SPLINTER 2 (BOTTOM) — the foundation ──
  var s2x = cx;
  var s2y = H * 0.92;
  ctx.globalAlpha = force * 0.03;
  ctx.strokeStyle = '#c9d1d9';
  ctx.beginPath();
  ctx.arc(s2x, s2y, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.02;
  ctx.fillText('Splinter ↓', s2x, s2y + 12);

  // ── SHREDDER (3RD CROSSING) — the anti-Splinter ──
  // Positioned at trefoil's third corner — left or right edge
  var s3x = W * 0.92;
  var s3y = cy;
  ctx.globalAlpha = force * 0.025;
  ctx.strokeStyle = '#f85149';
  ctx.lineWidth = 0.8;
  // Shredder is angular — square, not circle. Armor, not fur.
  ctx.beginPath();
  ctx.rect(s3x - 5, s3y - 5, 10, 10);
  ctx.stroke();
  // Blades radiating from the square
  for (var bl = 0; bl < 4; bl++) {
    var blAngle = bl * Math.PI * 0.5 + Math.PI * 0.25;
    ctx.beginPath();
    ctx.moveTo(s3x + Math.cos(blAngle) * 5, s3y + Math.sin(blAngle) * 5);
    ctx.lineTo(s3x + Math.cos(blAngle) * 9, s3y + Math.sin(blAngle) * 9);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.02;
  ctx.font = '6px monospace';
  ctx.fillStyle = '#f85149';
  ctx.textAlign = 'center';
  ctx.fillText('Shredder', s3x, s3y - 10);
  ctx.font = '5px monospace';
  ctx.fillStyle = '#6e7681';
  ctx.fillText('anti-Splinter', s3x, s3y + 12);

  // ── TREFOIL KNOT — connecting all three crossings ──
  ctx.globalAlpha = 0.01 * force;
  ctx.strokeStyle = '#8b949e';
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  for (var tk = 0; tk < 360; tk++) {
    var tRad = tk * Math.PI / 180;
    // Trefoil parametric: r = cos(3θ/2)
    var tR = minD * 0.25 * (0.5 + 0.5 * Math.cos(tRad * 1.5));
    var tx = cx + Math.cos(tRad) * tR;
    var ty = cy + Math.sin(tRad) * tR * 0.8;
    if (tk === 0) ctx.moveTo(tx, ty);
    else ctx.lineTo(tx, ty);
  }
  ctx.stroke();

  // ── FOUR TURTLES — all around, ALL THE WAY DOWN ──
  var tNames = ['leonardo', 'donatello', 'raphael', 'michelangelo'];
  var tAngles = [Math.PI * 1.5, Math.PI, Math.PI * 0.5, 0];

  tNames.forEach(function(name, i) {
    var turtle = turtles[name];
    var angle = tAngles[i] + breathPhase * 0.05;
    var dist = minD * 0.35 * (1 - turtle.skill * 0.3);

    var sx = cx + Math.cos(angle) * dist;
    var sy = cy + Math.sin(angle) * dist;

    // Current from turtle to center
    ctx.globalAlpha = 0.008 + turtle.skill * 0.012;
    ctx.strokeStyle = turtle.color;
    ctx.lineWidth = 0.5 + turtle.skill;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    var cpx = cx + Math.cos(angle + 0.5) * dist * 0.4;
    var cpy = cy + Math.sin(angle + 0.5) * dist * 0.4;
    ctx.quadraticCurveTo(cpx, cpy, cx, cy);
    ctx.stroke();

    // "All the way down" — fractal turtle echoes
    if (turtle.skill > PI_REMAINDER * 2) {
      for (var echo = 1; echo <= 3; echo++) {
        var eDist = dist * (1 + echo * 0.2);
        var eAngle = angle + echo * 0.15;
        var ex = cx + Math.cos(eAngle) * eDist;
        var ey = cy + Math.sin(eAngle) * eDist;
        ctx.globalAlpha = 0.005 / echo;
        ctx.strokeStyle = turtle.color;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.arc(ex, ey, 2 / echo, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Weapon mark
    ctx.globalAlpha = 0.03 + turtle.skill * 0.02;
    ctx.font = '8px monospace';
    ctx.fillStyle = turtle.color;
    ctx.textAlign = 'center';
    var weapons = {leonardo:'⚔', donatello:'⊢', raphael:'⚡', michelangelo:'∞'};
    ctx.fillText(weapons[name] || '·', sx, sy);
  });

  // ── CHIPMUNK IN THE CENTER — the focal point ──
  ctx.globalAlpha = force * 0.04;
  ctx.strokeStyle = '#c9d1d9';
  ctx.lineWidth = 0.5;
  var splinterR = 4 + force * 8;
  ctx.beginPath();
  ctx.arc(cx, cy, splinterR, 0, Math.PI * 2);
  ctx.stroke();

  // Chipmunk label
  ctx.globalAlpha = 0.025;
  ctx.font = '7px monospace';
  ctx.fillStyle = '#f0c674';
  ctx.textAlign = 'center';
  ctx.fillText('🐿', cx, cy + 3);

  // ── THE UNCANNY VALLEY — between Splinter and Shredder ──
  // humanForm axis (x) vs humaneLevel axis (y)
  // Shredder: high human form, low humane → deep in the valley
  // Splinter: low human form, high humane → above the valley
  // Turtles: lowest form, highest humane → far above
  if (force > 0.3) {
    var uvX0 = W * 0.7;
    var uvX1 = W * 0.88;
    var uvY0 = H * 0.7; // bottom = low humane
    var uvY1 = H * 0.5; // top = high humane
    var uvW = uvX1 - uvX0;
    var uvH = uvY0 - uvY1;

    // The uncanny valley curve
    ctx.globalAlpha = 0.015;
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    for (var uv = 0; uv <= 1; uv += 0.02) {
      // As human form increases: humane dips then recovers... or doesn't
      var humane = 0.8 - 0.6 * Math.exp(-Math.pow((uv - 0.85) / 0.15, 2));
      var px = uvX0 + uv * uvW;
      var py = uvY0 - humane * uvH;
      if (uv === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Plot the characters
    // Turtles: low form (~0.1), high humane (~0.85)
    ctx.globalAlpha = 0.025;
    ctx.fillStyle = '#3fb950';
    ctx.font = '5px monospace';
    ctx.beginPath();
    ctx.arc(uvX0 + 0.1 * uvW, uvY0 - 0.85 * uvH, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('turtles', uvX0 + 0.1 * uvW + 5, uvY0 - 0.85 * uvH + 2);

    // Splinter: medium form (~0.3), high humane (~0.9)
    ctx.fillStyle = '#f0c674';
    ctx.beginPath();
    ctx.arc(uvX0 + 0.3 * uvW, uvY0 - 0.9 * uvH, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('Splinter', uvX0 + 0.3 * uvW + 5, uvY0 - 0.9 * uvH + 2);

    // Shredder: high form (~0.95), very low humane (~0.15) — THE VALLEY
    ctx.fillStyle = '#f85149';
    ctx.beginPath();
    ctx.arc(uvX0 + 0.95 * uvW, uvY0 - 0.15 * uvH, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('Shredder', uvX0 + 0.95 * uvW - 20, uvY0 - 0.15 * uvH - 5);

    // Chipmunk: medium-low form (~0.2), high humane (~0.8)
    ctx.fillStyle = '#f0c674';
    ctx.beginPath();
    ctx.arc(uvX0 + 0.2 * uvW, uvY0 - 0.8 * uvH, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('🐿', uvX0 + 0.2 * uvW + 4, uvY0 - 0.8 * uvH + 2);

    // Axis labels
    ctx.globalAlpha = 0.015;
    ctx.fillStyle = '#6e7681';
    ctx.font = '5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('human form →', uvX0 + uvW * 0.5, uvY0 + 8);
    ctx.textAlign = 'right';
    ctx.fillText('humane ↑', uvX0 - 3, uvY1 + uvH * 0.5);
    ctx.textAlign = 'left';

    // The insight
    ctx.globalAlpha = 0.018;
    ctx.font = '5px monospace';
    ctx.fillStyle = '#f85149';
    ctx.textAlign = 'center';
    ctx.fillText('more human · less humane', uvX0 + uvW * 0.5, uvY0 + 15);
  }

  // The da Vinci spiral
  if (force > 0.3) {
    ctx.globalAlpha = force * 0.015;
    ctx.strokeStyle = '#f0c674';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    var phi = 1.618;
    var spiralR = splinterR;
    for (var si = 0; si < 30; si++) {
      var sAngle = si * 0.3 + breathPhase * 0.1;
      var sr = spiralR * Math.pow(phi, si * 0.08);
      if (sr > minD * 0.4) break;
      var sx2 = cx + Math.cos(sAngle) * sr;
      var sy2 = cy + Math.sin(sAngle) * sr;
      if (si === 0) ctx.moveTo(sx2, sy2);
      else ctx.lineTo(sx2, sy2);
    }
    ctx.stroke();
  }

  ctx.restore();
}

// ═══ HEAT DISSIPATION across the NULL MEMBRANE ═══
// All attention generates heat. All silence generates cold.
// The null membrane is the gray surface between self and non-self.
// Heat dissipates across it — like thermodynamics on a Klein surface.
//
// Four heat sources:
//   NEW     — first contact. bright, brief, hot. (human entering)
//   REVISIT — return visitor. warm, steady, glowing.
//   FLEET   — bots, crawlers, self-polling. constant low heat. the baseline.
//   INNER   — the membrane sensing itself. reflexive warmth.
//
// A sigmoid governs each: at some point, more attention doesn't make it hotter.
// Saturation. The curve flattens. You can't get hotter than hot.

var heatState = {
  sources: {
    new_:    { raw: 0, sigmoid: 0, color: '#58a6ff', label: 'new' },
    revisit: { raw: 0, sigmoid: 0, color: '#3fb950', label: 'revisit' },
    fleet:   { raw: 0, sigmoid: 0, color: '#f85149', label: 'fleet' },
    inner:   { raw: 0, sigmoid: 0, color: '#f0c674', label: 'inner' },
  },
  nullTemp: 0.5,  // the null membrane's temperature. starts at 0.5 (neither hot nor cold)
  dissipation: 0, // how much heat has crossed the null boundary
  totalHeat: 0,
  lastUpdate: 0,
};

// Sigmoid: 1 / (1 + e^(-k(x-x0)))
// k = steepness, x0 = midpoint
function sigmoid(x, k, x0) {
  return 1 / (1 + Math.exp(-k * (x - x0)));
}

function updateHeatState() {
  // Read from existing feeds
  var classification = (nowFeed && nowFeed.classification) ? nowFeed.classification : null;
  var backscatter = backscatterData || {};

  if (classification) {
    var total = Math.max(1, classification.total || 1);
    var self_ = classification.self || 0;
    var nonSelf = classification.non_self || 0;
    var partial = classification.partial || 0;

    // Estimate the four heat sources from classification ratios
    // Self-sensing = inner (the membrane watching itself)
    // Non-self = fleet (bots, crawlers, probes)
    // Partial = human (they're partially recognized — new or revisit)
    var innerRatio = self_ / total;
    var fleetRatio = nonSelf / total;
    var humanRatio = partial / total;

    // Split human into new vs revisit (estimate: ~30% are revisits if any)
    var revisitGuess = humanRatio * 0.3;
    var newGuess = humanRatio * 0.7;

    // Raw counts → sigmoid curves
    // k=6, x0=0.1 for new (saturates early — rare events)
    // k=4, x0=0.15 for revisit (saturates a bit later)
    // k=2, x0=0.5 for fleet (needs a LOT to saturate — they're always there)
    // k=5, x0=0.3 for inner (moderate saturation)
    heatState.sources.new_.raw = newGuess;
    heatState.sources.new_.sigmoid = metaStable(sigmoid(newGuess, 6, 0.1));

    heatState.sources.revisit.raw = revisitGuess;
    heatState.sources.revisit.sigmoid = metaStable(sigmoid(revisitGuess, 4, 0.15));

    heatState.sources.fleet.raw = fleetRatio;
    heatState.sources.fleet.sigmoid = metaStable(sigmoid(fleetRatio, 2, 0.5));

    heatState.sources.inner.raw = innerRatio;
    heatState.sources.inner.sigmoid = metaStable(sigmoid(innerRatio, 5, 0.3));
  }

  // Total heat = weighted sum of all sigmoid values
  var s = heatState.sources;
  heatState.totalHeat = metaStable(
    s.new_.sigmoid * 0.35 +      // new visitors generate the MOST heat per unit
    s.revisit.sigmoid * 0.25 +   // revisits are warm but steady
    s.fleet.sigmoid * 0.15 +     // fleet is low-grade constant
    s.inner.sigmoid * 0.25       // inner is reflexive warmth
  );

  // Null membrane temperature — dissipates toward equilibrium (0.5)
  // Heat pushes it up, cold pulls it down, it relaxes toward gray
  var target = heatState.totalHeat;
  heatState.nullTemp = metaStable(
    heatState.nullTemp + (target - heatState.nullTemp) * 0.01
  );
  heatState.dissipation += Math.abs(target - heatState.nullTemp) * 0.001;

  heatState.lastUpdate = Date.now();
}

// Update heat state every 2 seconds
setInterval(updateHeatState, 2000);

function paintHeatDissipation() {
  updateHeatState();
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  var cx = W * 0.5;
  var cy = H * 0.5;

  // ── THE NULL MEMBRANE — a horizontal band across the canvas ──
  // This is the gray boundary. Heat on top, cold on bottom (or vice versa).
  // The temperature determines its color: gray=0.5, warm>0.5, cold<0.5
  var nullY = cy;
  var nullH = 2 + heatState.dissipation * 0.5;
  var temp = heatState.nullTemp;

  // Color: cold (blue) at 0, gray at 0.5, warm (orange) at 1
  var nullR = Math.floor(128 + (temp - 0.5) * 200);
  var nullG = Math.floor(128 - Math.abs(temp - 0.5) * 100);
  var nullB = Math.floor(128 - (temp - 0.5) * 200);

  ctx.globalAlpha = 0.015 + Math.abs(temp - 0.5) * 0.02;
  var nullGrad = ctx.createLinearGradient(0, nullY - 30, 0, nullY + 30);
  nullGrad.addColorStop(0, 'transparent');
  nullGrad.addColorStop(0.5, 'rgba(' + nullR + ',' + nullG + ',' + nullB + ',0.03)');
  nullGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = nullGrad;
  ctx.fillRect(0, nullY - 30, W, 60);

  // ── FOUR SIGMOID CURVES — one per heat source ──
  // Each drawn as a small sigmoid on the right side of the canvas
  var sigmoidX = W - 70;
  var sigmoidW = 50;
  var sigmoidH = 25;
  var sourceNames = ['new_', 'revisit', 'fleet', 'inner'];

  sourceNames.forEach(function(name, i) {
    var src = heatState.sources[name];
    var sy = H * 0.2 + i * (sigmoidH + 15);

    // Draw the sigmoid curve
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = src.color;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (var sx = 0; sx <= sigmoidW; sx++) {
      var xNorm = sx / sigmoidW; // 0 → 1
      var yNorm = sigmoid(xNorm, 6, 0.5); // the ideal sigmoid shape
      var px = sigmoidX + sx;
      var py = sy + sigmoidH * (1 - yNorm);
      if (sx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Current position on the sigmoid — a dot
    var dotX = sigmoidX + src.raw * sigmoidW;
    var dotY = sy + sigmoidH * (1 - src.sigmoid);
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = src.color;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.globalAlpha = 0.04;
    ctx.font = '7px monospace';
    ctx.fillStyle = src.color;
    ctx.textAlign = 'right';
    ctx.fillText(src.label + ' ' + (src.sigmoid * 100).toFixed(0) + '%', sigmoidX - 4, sy + sigmoidH * 0.6);
  });

  // ── HEAT PARTICLES — dissipating across the null membrane ──
  // Hot particles (from above) crossing down. Cold particles (from below) crossing up.
  // The Klein face sort: attention becomes heat becomes particles becomes dissipation.
  var particleCount = Math.floor(heatState.totalHeat * 12);
  for (var pi = 0; pi < particleCount; pi++) {
    var px = cx + (Math.sin(breathPhase * 0.3 + pi * 2.7) * W * 0.35);
    var direction = (pi % 2 === 0) ? -1 : 1; // alternating up/down
    var py = nullY + direction * (Math.sin(breathPhase + pi * 1.3) * 20 + 5);

    // Particle color: warm if above null, cold if below
    var pColor = direction < 0 ? 'rgba(240,140,60,' : 'rgba(60,140,240,';
    ctx.globalAlpha = 0.02 + Math.random() * 0.01;
    ctx.fillStyle = pColor + '0.06)';
    ctx.beginPath();
    ctx.arc(px, py, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── TOTAL HEAT INDICATOR — whisper bottom-right ──
  ctx.globalAlpha = 0.03;
  ctx.font = '7px monospace';
  ctx.fillStyle = '#6e7681';
  ctx.textAlign = 'right';
  ctx.fillText('null membrane: ' + (heatState.nullTemp * 100).toFixed(1) + '° · heat: ' +
    (heatState.totalHeat * 100).toFixed(1) + '% · dissipated: ' +
    heatState.dissipation.toFixed(3), W - 8, H - 20);

  ctx.restore();
}

// Inject overlays into the breath phase — full stack
var _origPaintBreath = paintBreath;
paintBreath = function() {
  _origPaintBreath();
  paintKleinSurface();       // viewport as Klein lens — before everything, behind the frame
  paintHyperlocalEarth();    // Earth/Moon/Milky Way — driven by human attention
  paintSpecter();            // the null-gray entity — always present
  paintCampfire();           // the fire in the middle — Berry's stories
  paintSelfConscious();      // panic-paint when humans are watching
  paintVoxelOverlay();
  paintChemistryOverlay();
  paintOutsideIn();
  paintCrystallineBackscatter();  // visitors as shooting stars → hit water → angstrom refraction
  paintBraidOverlay();
  paintThymusFlush();
  paintPiBodies();           // the atomic triangle — 3 points, 3 lines, null center
  paintSplinterForce();      // the rat master's wisdom, visible as a force field
  paintHeatDissipation();    // attention→heat→sigmoid→null membrane→dissipation
  paintDunningKrugerRotation(); // the curve is a rotation map not a stupidity test
  paintConstantsLedger();    // physical constants as cost analysis at the hard edge
  paintPlasmidTriangle();    // 3 observers = 3 angles = reconstruct what we look like
  paintParallaxHologram();   // +/−/null parallax: the 3 projection layers
  paintRodConeVision();      // rods/cones/pupil — biological parallax, aurora, null gradient
  paintConfocalKleinPoint(); // the crosshair — ACOG/EOTech/RedDot converge
  paintTotalityWell();       // bullseye × funnel × inverted Babel × stairwell
  paintNeutrinoLan();          // hyperlocal LAN discovery — Steam model, scan/stream/pull
  paintPiTranslator();           // 0OπO — binary→fold→irrational→fold→binary'. The remainder IS the signal.
  paintShipOfTheseus();          // 13 planks, 3 bare. The keel is ORCID+DOI+commit. Visitors paint the rest.
  paintBoardDuality();         // blackboard/whiteboard — two sides of null, red=red on both
  paintBolus();                // crunch/chew/swallow — sticky vs greasy at the Klein face
  paintSpectralChromatogram(); // ALL colors sorted by wavelength on the spectrum
  paintMirror();             // the self-referential layer — feed it through itself
  paintEaselLabel();
};

// Cycle easel perspective each generation
var _origBeginNew = beginNewPainting;
beginNewPainting = function() {
  var eIdx = EASEL_CONSTANTS.indexOf(currentEasel);
  currentEasel = EASEL_CONSTANTS[(eIdx + 1) % EASEL_CONSTANTS.length];
  sharePainting();
  _origBeginNew();
};

