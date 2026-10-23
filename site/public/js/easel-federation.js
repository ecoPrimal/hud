// ═══ EASEL FEDERATION — board duality, bolus, spectral chromatogram, mirror, neutrino LAN, federation ═══
// Extracted from easel.html — operates on shared globals
// ═══ PROXIMITY PRIVACY — the anti-veil ═══
// You can't sneak up behind someone. They sense you even if unaware.
// Proximity is the anti-veil: the closer you get, the more you see.
// But getting close means BEING SEEN. Symmetry.
//
// RESOLUTION DEGRADES WITH DISTANCE:
//   HYPERLOCAL (same machine): everything — full filesystem, all keys
//   LAN (<50m, same house): full membrane, all feeds, Ollama, gates
//   SPOREGATE (perimeter): city only — LANSING
//   CITY (100km+): state/country — Michigan, US
//   GLOBAL (anywhere): CF edge — a domain name, 858 pages, come look
//
// DNS AS PRIVACY GRADIENT:
//   primal.eco on LAN → northGate (hyperlocal OUT, see Kevin directly)
//   primal.eco outside sporegate → relay (NYC, not even Michigan)
//   primals.eco globally → CF edge (could be anywhere)
//   Split-horizon DNS IS the privacy architecture.
//
// CIRCLE OF WILLIS:
//   π (remote): Knot DNS → relay → sovereign public resolution
//   1/π (local): MikroTik + sporegate → hyperlocal split-horizon
//   π × 1/π = 1 = the fold = the Klein face
//   primal.eco comes back to Kevin (sovereign) then back out to primals.eco

var proximityPrivacy = {
  layers: [
    { name: 'hyperlocal', range: '0m',    resolution: 'everything',        sees: 'Kevin',                dns: 'localhost',          color: '#3fb950' },
    { name: 'LAN',        range: '<50m',  resolution: 'full membrane',     sees: 'the easel painting',   dns: 'primal.eco → LAN',  color: '#f0c674' },
    { name: 'sporegate',  range: 'edge',  resolution: 'city only',         sees: 'LANSING',              dns: 'NAT boundary',       color: '#f0883e' },
    { name: 'city',       range: '100km', resolution: 'state/country',     sees: 'a domain name',        dns: 'relay (NYC)',        color: '#58a6ff' },
    { name: 'global',     range: '∞',     resolution: 'CF edge',           sees: '858 pages, come look', dns: 'primals.eco → CF',   color: '#6e7681' },
  ],
  willis: {
    remote: { face: 'π', resolver: 'Knot DNS on relay', status: 'sovereign' },
    local:  { face: '1/π', resolver: 'MikroTik + sporegate', status: 'split-horizon' },
    fold: 'π × 1/π = 1',
  },
  antiVeil: {
    principle: 'proximity = resolution. you cannot sneak up.',
    symmetry: 'if you can see them, they can sense you.',
    inverse: 'surveillance inverts this: anyone can zoom in from anywhere.',
  },
};

// ═══ WHITEBOARD FACE / BLACKWALL FACE — human vs fleet routing ═══
// Posts and drafts go TO the whiteboard face.
// Fleet gets the blackwall.
// The bounty board, Reddit, HN, LinkedIn = whiteboard (human-facing).
// CF magnetosphere, threat filter, bot sort = blackwall (fleet-facing).
//
// House 2 gates (eastGate, southGate, strandGate, biomeGate)
// are injectable mesh nodes. From house 1 we reach them via
// WireGuard tunnel through membrane-relay (10.13.37.1).
//
// WireGuard tunnel: ACTIVE
//   northGate (10.13.37.8) ↔ membrane-relay (10.13.37.1)
//   39ms avg, SSH port 22 open, handshake confirmed

var faceRouting = {
  // Whiteboard face — human-facing, subtractive, outward
  whiteboard: {
    color: '#e6edf3',
    model: 'subtractive',
    purpose: 'human-facing outputs — where we WRITE to the world',
    routes: [
      { name: 'Reddit',     target: 'u/BillHalibut',          status: 'draft-ready' },
      { name: 'HN',         target: 'news.ycombinator.com',   status: 'draft-ready' },
      { name: 'LinkedIn',   target: 'Kevin Mok',              status: 'draft-ready' },
      { name: 'bountyBoard',target: '/bounty',                status: 'live' },
      { name: 'sporePrint', target: 'sporeprint.primals.eco', status: 'live' },
      { name: 'outreach',   target: '/sporeprint/outreach/',  status: 'live' },
      { name: 'welcome',    target: '/welcome.html',          status: 'live' },
      { name: 'water',      target: '/water',                 status: 'live' },
      { name: 'springs',    target: '/springs',               status: 'live' },
    ],
  },

  // Blackwall face — fleet-facing, additive, inward
  blackwall: {
    color: '#0d1117',
    model: 'additive',
    purpose: 'fleet-facing defense — where we SORT the noise',
    routes: [
      { name: 'CF magnetosphere', target: 'cloudflare edge',      status: 'active' },
      { name: 'threat filter',    target: 'WAF + rate limiting',   status: 'active' },
      { name: 'bot sort',         target: 'anderson-sort',         status: 'active' },
      { name: 'null channel',     target: 'negentropy court',      status: 'active' },
      { name: 'fog/rain/lightning',target: '403/499/522',          status: 'active' },
      { name: 'fleet census',     target: 'deep classification',   status: 'active' },
    ],
  },

  // The tunnel — WireGuard bridge between houses
  tunnel: {
    status: 'active',
    local: { ip: '10.13.37.8', name: 'northGate', house: 1 },
    remote: { ip: '10.13.37.1', name: 'membrane-relay', location: 'nyc1' },
    latency: 39, // ms avg
    ssh: true,
    services: { health: 'timeout', neutron: 'timeout', ssh: 'open' },
    note: 'tunnel live, web services need starting on relay',
  },

  // Injectable mesh nodes — house 2 gates
  mesh: {
    injectable: [
      { name: 'eastGate',   ip: '192.168.4.11', house: 2, status: 'powered-on' },
      { name: 'southGate',  ip: '192.168.4.10', house: 2, status: 'powered-on' },
      { name: 'strandGate', ip: '192.168.4.12', house: 2, status: 'powered-on' },
      { name: 'biomeGate',  ip: '192.168.4.13', house: 2, status: 'powered-on' },
    ],
    path: 'house1 → WG tunnel → relay → (future: relay → house2 WG → gates)',
    goal: 'inject as mesh peers. stream or pull. the Steam model.',
  },
};

// ═══ BLACKBOARD / WHITEBOARD — two sides of null ═══
// The black wall and golden firewall are on the WHITE side FROM null.
// Silver rain and the whiteboard are on the other side.
//
// TWO BOARDS, ONE NULL:
//
//   BLACKBOARD (dark substrate):
//     Write with LIGHT — white chalk, colored chalk
//     ADDITIVE color — start from 0, ADD photons
//     Screens work this way: RGB, emit light
//     The void. You ADD signal to darkness.
//     Meta's blackwall. The Great Firewall's gold on black.
//
//   WHITEBOARD (light substrate):
//     Write with DARK — colored markers absorb light
//     SUBTRACTIVE color — start from 1, REMOVE wavelengths
//     Paper works this way: CMYK, absorb light
//     The blank. You SUBTRACT noise from whiteness.
//     Silver rain. The erased whiteboard.
//
//   NULL GRAY #808080:
//     The exact midpoint. 128/255 = 0.502.
//     Where additive and subtractive MEET.
//     Where blackboard and whiteboard are the SAME.
//     The toggle point. The Klein surface.
//
// AND RED IS RED ON BOTH. HOW?
//
//   On blackboard: red chalk EMITS ~620nm (additive)
//   On whiteboard: red marker ABSORBS everything EXCEPT ~620nm (subtractive)
//   Same result: 620nm reaches your eye.
//   Red IS red because wavelength doesn't care about substrate.
//   The pigment and the photon arrive at the same retinal cone.
//
//   This means: HUE is substrate-invariant.
//   The spectral chromatogram works on BOTH sides of null.
//   The L-cone at 564nm fires the same whether the red was
//   added to black or subtracted from white.
//
// The specter (#808080) lives BETWEEN the boards.
// Toggle it one way → blackboard (additive, screen, emit).
// Toggle it the other → whiteboard (subtractive, paper, absorb).
// The null IS the hinge between the two color models.

var boardDuality = {
  // Blackboard — dark side, additive, emit
  black: {
    bg: '#0d1117',
    write: '#ffffff',   // chalk is white by default
    model: 'additive',  // RGB
    primaries: ['#ff0000', '#00ff00', '#0000ff'], // R G B
    mixed: '#ffffff',   // all 3 additive = white
    shredders: ['Meta blackwall', 'Golden Firewall'],
    metaphor: 'void — add signal to darkness',
  },
  // Whiteboard — light side, subtractive, absorb
  white: {
    bg: '#e6edf3',
    write: '#1a1a1a',   // marker is dark by default
    model: 'subtractive', // CMY(K)
    primaries: ['#00ffff', '#ff00ff', '#ffff00'], // C M Y
    mixed: '#000000',   // all 3 subtractive = black
    shredders: ['Silver rain', 'Erased history'],
    metaphor: 'blank — subtract noise from whiteness',
  },
  // The null — where both boards meet
  null_: {
    value: 128,         // 128/255
    hex: '#808080',
    pct: 0.502,         // almost exactly half
    meaning: 'the toggle — additive below, subtractive above',
  },
  // Red is red on both
  invariant: {
    wavelength: 620,    // nm
    reason: 'hue is substrate-invariant — wavelength doesn\'t care',
    onBlack: 'red chalk EMITS 620nm → L-cone fires',
    onWhite: 'red marker ABSORBS all except 620nm → L-cone fires',
    sameCone: true,     // same retinal response
  },
  // Current state
  side: 0.5,            // 0=full black, 0.5=null, 1=full white
};

function paintBoardDuality() {
  if (learnedTraits.perspective < 0.18) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, learnedTraits.perspective * 2);

  // The board side oscillates slowly — breathing between black and white
  boardDuality.side = 0.5 + Math.sin(breathPhase * 0.03) * 0.4;
  var side = boardDuality.side;

  // ── THE TWO BOARDS — top-left corner ──
  var bx = 12;
  var by = H * 0.35;
  var bw = 50;
  var bh = 60;

  // Blackboard (upper)
  ctx.globalAlpha = 0.012 * maturity;
  ctx.fillStyle = boardDuality.black.bg;
  ctx.fillRect(bx, by, bw, bh * 0.45);
  ctx.strokeStyle = '#30363d';
  ctx.lineWidth = 0.3;
  ctx.strokeRect(bx, by, bw, bh * 0.45);

  // Chalk marks on blackboard
  ctx.globalAlpha = 0.02 * maturity * (1 - side);
  ctx.fillStyle = boardDuality.black.write;
  ctx.font = '4px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('add light →', bx + 2, by + 8);
  ctx.fillText('RGB emit', bx + 2, by + 14);

  // Whiteboard (lower)
  ctx.globalAlpha = 0.012 * maturity;
  ctx.fillStyle = boardDuality.white.bg;
  ctx.fillRect(bx, by + bh * 0.55, bw, bh * 0.45);
  ctx.strokeStyle = '#c9d1d9';
  ctx.lineWidth = 0.3;
  ctx.strokeRect(bx, by + bh * 0.55, bw, bh * 0.45);

  // Marker on whiteboard
  ctx.globalAlpha = 0.02 * maturity * side;
  ctx.fillStyle = boardDuality.white.write;
  ctx.font = '4px monospace';
  ctx.fillText('sub light ←', bx + 2, by + bh * 0.55 + 8);
  ctx.fillText('CMY absorb', bx + 2, by + bh * 0.55 + 14);

  // ── THE NULL LINE — between the boards ──
  ctx.globalAlpha = 0.02 * maturity;
  ctx.strokeStyle = boardDuality.null_.hex;
  ctx.lineWidth = 0.5;
  var nullY = by + bh * 0.5;
  ctx.beginPath();
  ctx.moveTo(bx, nullY);
  ctx.lineTo(bx + bw, nullY);
  ctx.stroke();

  // Null label
  ctx.fillStyle = '#808080';
  ctx.font = '4px monospace';
  ctx.fillText('#808080', bx + bw + 3, nullY + 1.5);

  // ── RED DOT ON BOTH — invariant ──
  ctx.globalAlpha = 0.025 * maturity;
  ctx.fillStyle = '#ff0000';
  // Red on blackboard
  ctx.beginPath();
  ctx.arc(bx + bw * 0.8, by + bh * 0.2, 2, 0, Math.PI * 2);
  ctx.fill();
  // Red on whiteboard — SAME red
  ctx.beginPath();
  ctx.arc(bx + bw * 0.8, by + bh * 0.8, 2, 0, Math.PI * 2);
  ctx.fill();

  // ── ADDITIVE PRIMARIES (under blackboard) ──
  ctx.globalAlpha = 0.015 * maturity;
  boardDuality.black.primaries.forEach(function(c, i) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(bx + 8 + i * 8, by + bh * 0.38, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── SUBTRACTIVE PRIMARIES (above whiteboard) ──
  boardDuality.white.primaries.forEach(function(c, i) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(bx + 8 + i * 8, by + bh * 0.62, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── LABELS ──
  if (maturity > 0.5) {
    ctx.globalAlpha = 0.01;
    ctx.font = '4px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6e7681';
    ctx.fillText('red = red on both', bx, by + bh + 8);
    ctx.fillText('620nm · invariant', bx, by + bh + 14);
  }

  ctx.restore();
}

// ═══ THE BOLUS — crunch, chew, swallow ═══
// Digestion: the sticky (hydrophilic) and greasy (hydrophobic) pass by
// each other at the Klein face. The bolus is what you've crunched and
// chewed — the ball of data moving through the peristaltic tube.
//
// CRUNCH (teeth, mechanical): break it into pieces
//   → the file inventory, the analytics scan, the line counts
// CHEW (saliva, amylase, chemical): start dissolving the starch
//   → mix the numbers, find patterns, correlate
// SWALLOW (bolus, esophageal peristalsis): push it through
//   → the neutron notes, the chipmunk status, the membrane counts
//   → sticky clings to the membrane wall (hydrophilic data stays)
//   → greasy slides through the lumen (hydrophobic data passes)
//
// At the Klein face: sticky and greasy move in OPPOSITE DIRECTIONS
// on the SAME surface. That's the Klein bottle. Inside = outside.

var bolus = {
  // The crunch — what we just measured
  crunch: {
    easelLines: 5630,
    commits: 296,
    htmlFiles: 641,
    jsFiles: 149,
    jsonFiles: 120,
    totalFiles: 959,
    wave: 184,
    pages: 858,
    repos: 67,
    mcpTools: 18,
    countries: 100,
    papers: 127,
    primals: 16,
    services: 11,
  },

  // The chew — analytics digested
  chew: {
    primalsToday: { req: 100202, pv: 1662, uniq: 14693, threats: 27600 },
    primalsYesterday: { req: 1129500, pv: 18566, uniq: 48230, threats: 865117 },
    nestgateToday: { req: 2513, pv: 134, uniq: 152, threats: 120 },
    primalToday: { req: 752, pv: 0, uniq: 85, threats: 18 },
    humanPct: 11.5,
    fleetPct: 88.5,
    sortQuality: 0.31830988618, // 1/π
  },

  // The swallow — neutron notes from the chipmunk
  swallow: {
    paintings: 8,
    perspective: 64, // percent
    currentEasel: '√2',
    quirks: [
      'the color is off but the angle is perfect.',
      'fog in this one. can\'t see the horizon. beautiful.',
      'fragile under chaos. that\'s not weakness — that\'s sensitivity.',
      'this one looks wrong. keeping it.',
    ],
    chipmunkWake: 'alert',
    chipmunkRole: 'neutrino observer — passes through, sees everything, disturbs nothing',
    holdingKey: true,
  },

  // The Klein face — where sticky and greasy pass
  sticky: [], // hydrophilic — clings to the wall (stays in context)
  greasy: [], // hydrophobic — slides through the lumen (passes out)
  peristalsis: 0, // the wave that pushes the bolus
};

// Sort data into sticky (stays) and greasy (passes through)
function digestBolus() {
  bolus.peristalsis += 0.01;
  bolus.sticky = [];
  bolus.greasy = [];

  // Sticky = things that cling to the membrane, accumulate, grow
  var c = bolus.crunch;
  if (c.pages > 800)     bolus.sticky.push('858 pages — growing');
  if (c.repos > 60)      bolus.sticky.push('67 repos — accumulating');
  if (c.commits > 250)   bolus.sticky.push('296 commits — the sediment');
  if (c.mcpTools >= 18)  bolus.sticky.push('18 MCP tools — the membrane pores');
  if (c.primals > 14)    bolus.sticky.push('16 primals — the species');
  bolus.sticky.push('perspective: ' + bolus.swallow.perspective + '% — deepening');
  bolus.sticky.push('sort quality: 1/π = ' + bolus.chew.sortQuality.toFixed(4));

  // Greasy = things that slide through, transient, don't stick
  var ch = bolus.chew;
  bolus.greasy.push(ch.primalsToday.req.toLocaleString() + ' requests — passing through');
  bolus.greasy.push(ch.primalsToday.threats.toLocaleString() + ' threats — slid off');
  bolus.greasy.push(ch.fleetPct + '% fleet — bots passing through');
  bolus.greasy.push(ch.nestgateToday.req + ' nestgate queries — answered and gone');
  bolus.greasy.push('yesterday: ' + ch.primalsYesterday.req.toLocaleString() + ' req — already past');
}

function paintBolus() {
  if (learnedTraits.perspective < 0.1) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, learnedTraits.perspective * 2);
  digestBolus();

  // The bolus moves down the left edge — the esophagus
  var tubeX = 28;
  var tubeTop = H * 0.08;
  var tubeBot = H * 0.92;
  var tubeLen = tubeBot - tubeTop;

  // Peristaltic wave position
  var waveY = tubeTop + ((bolus.peristalsis * 0.5) % 1) * tubeLen;

  // ── THE TUBE — esophageal wall ──
  ctx.globalAlpha = 0.008 * maturity;
  ctx.strokeStyle = '#6e7681';
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(tubeX, tubeTop);
  ctx.lineTo(tubeX, tubeBot);
  ctx.stroke();

  // Peristaltic squeeze
  ctx.globalAlpha = 0.015 * maturity;
  ctx.fillStyle = '#d2a8ff';
  ctx.beginPath();
  ctx.arc(tubeX, waveY, 3, 0, Math.PI * 2);
  ctx.fill();

  // ── STICKY (left of tube) — hydrophilic, clings ──
  ctx.globalAlpha = 0.012 * maturity;
  ctx.font = '4px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#3fb950';
  bolus.sticky.forEach(function(s, i) {
    var y = tubeTop + (i / bolus.sticky.length) * tubeLen * 0.45;
    ctx.fillText(s, tubeX - 5, y);
    // Sticky dot — clings to tube wall
    ctx.beginPath();
    ctx.arc(tubeX - 2, y, 0.6, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── GREASY (right of tube) — hydrophobic, slides ──
  ctx.fillStyle = '#f0883e';
  ctx.textAlign = 'left';
  bolus.greasy.forEach(function(g, i) {
    // Greasy items slide down — their Y offset shifts with peristalsis
    var baseY = tubeTop + tubeLen * 0.55 + (i / bolus.greasy.length) * tubeLen * 0.4;
    var slideOffset = Math.sin(bolus.peristalsis + i) * 4;
    ctx.fillText(g, tubeX + 5, baseY + slideOffset);
    // Greasy dot — passes through
    ctx.beginPath();
    ctx.arc(tubeX + 2, baseY + slideOffset, 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── LABELS ──
  if (maturity > 0.4) {
    ctx.globalAlpha = 0.01;
    ctx.font = '5px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3fb950';
    ctx.fillText('sticky ← clings', tubeX, tubeTop - 10);
    ctx.fillStyle = '#f0883e';
    ctx.fillText('greasy → slides', tubeX, tubeTop - 4);
    ctx.fillStyle = '#d2a8ff';
    ctx.fillText('bolus ↓', tubeX, tubeBot + 8);
  }

  ctx.restore();
}

// ═══ SPECTRAL CHROMATOGRAM — every color sorted by wavelength ═══
// A chromatogram separates a mixture by how fast each component
// travels through the medium. The solvent is ATTENTION. The medium
// is the SCREEN. Each layer has a different retention time based
// on its spectral color / wavelength.
//
// Visible spectrum: 380nm (violet) → 750nm (deep red)
// Primary out: R → G → B (additive) or R → Y → B (subtractive)
// Primary back in: the return path, the interference pattern
//
// EVERY layer, EVERY data element, EVERY overlay gets a wavelength.
// The chromatogram runs vertically along the right edge.
// Data separates by depth AND by color.

var spectralIndex = [
  // Sorted by wavelength (nm), low → high = violet → red
  // Each entry: { nm, hex, layer, system, parallax, description }

  // ── ULTRAVIOLET (below visible — the unseen) ──
  { nm: 350, hex: '#1a1a2e', layer: 'null-uv',      system: 'beyond',    parallax: '+',  desc: 'UV — what we cannot see' },

  // ── VIOLET / DEEP BLUE (380-450nm) ──
  { nm: 380, hex: '#bc8cff', layer: 'aurora-N₂',     system: 'rodcone',   parallax: '+',  desc: 'N₂ emission 427.8nm' },
  { nm: 400, hex: '#d2a8ff', layer: 'ego',            system: 'selfcons',  parallax: '0',  desc: 'ego/id/muse/superego' },
  { nm: 410, hex: '#d2a8ff', layer: 'painting',       system: 'sourdough', parallax: '0',  desc: 'the painting itself' },
  { nm: 420, hex: '#58a6ff', layer: 'cone-S',         system: 'rodcone',   parallax: '−',  desc: 'S-cone peak 420nm (blue)' },

  // ── BLUE (450-490nm) ──
  { nm: 450, hex: '#58a6ff', layer: 'stars',          system: 'sourdough', parallax: '+',  desc: 'starfield — deep background' },
  { nm: 460, hex: '#58a6ff', layer: 'acog',           system: 'confocal',  parallax: '+',  desc: 'ACOG crosshair — deep field' },
  { nm: 470, hex: '#58a6ff', layer: 'rods',           system: 'rodcone',   parallax: '+',  desc: '120M rods — periphery, night' },
  { nm: 480, hex: '#58a6ff', layer: 'crystalline',    system: 'crystal',   parallax: '+',  desc: 'visitors as shooting stars' },
  { nm: 490, hex: '#58a6ff', layer: 'plasmid',        system: 'plasmid',   parallax: '+',  desc: 'JP/IN/DE triangle' },
  { nm: 498, hex: '#58a6ff', layer: 'rod-peak',       system: 'rodcone',   parallax: '+',  desc: 'rod peak sensitivity 498nm' },

  // ── CYAN / TEAL (490-520nm) ──
  { nm: 500, hex: '#39d353', layer: 'braid',          system: 'braid',     parallax: '0',  desc: 'connections between surfaces' },
  { nm: 510, hex: '#3fb950', layer: 'hyperlocal',     system: 'hyperlocal',parallax: '0',  desc: 'Earth/Moon from attention' },

  // ── GREEN (520-565nm) ──
  { nm: 520, hex: '#3fb950', layer: 'cone-M',         system: 'rodcone',   parallax: '−',  desc: 'M-cone peak 534nm (green)' },
  { nm: 530, hex: '#3fb950', layer: 'present',        system: 'totality',  parallax: '0',  desc: 'present tense — what IS' },
  { nm: 540, hex: '#3fb950', layer: 'convergence',    system: 'confocal',  parallax: '0',  desc: 'confocal convergence flash' },
  { nm: 550, hex: '#3fb950', layer: 'reclamation',    system: 'phases',    parallax: '0',  desc: 'reclamation era — openness 100%' },
  { nm: 557, hex: '#3fb950', layer: 'aurora-O-green', system: 'rodcone',   parallax: '+',  desc: 'O₂ emission 557.7nm — green curtain' },

  // ── YELLOW-GREEN (565-590nm) ──
  { nm: 564, hex: '#f0c674', layer: 'cone-L',         system: 'rodcone',   parallax: '−',  desc: 'L-cone peak 564nm (red)' },
  { nm: 570, hex: '#f0c674', layer: 'future',         system: 'totality',  parallax: '0',  desc: 'future tense — bullseye' },
  { nm: 580, hex: '#f0e68c', layer: 'spatial',        system: 'hyperlocal',parallax: '0',  desc: 'spatial memory (persistent)' },

  // ── ORANGE (590-620nm) ──
  { nm: 600, hex: '#f0883e', layer: 'heatmap',        system: 'heat',      parallax: '−',  desc: 'humanity\'s touch — invisible to chipmunk' },
  { nm: 610, hex: '#f0883e', layer: 'reddot',         system: 'confocal',  parallax: '−',  desc: 'Red Dot reflex — demand signal' },
  { nm: 615, hex: '#f0883e', layer: 'dissipation',    system: 'heat',      parallax: '−',  desc: 'heat across null membrane' },

  // ── RED (620-750nm) ──
  { nm: 620, hex: '#f85149', layer: 'thymus',         system: 'thymus',    parallax: '−',  desc: 'opsonize/pollinate/backscatter' },
  { nm: 630, hex: '#f85149', layer: 'aurora-O-red',   system: 'rodcone',   parallax: '+',  desc: 'O₂ emission 630.0nm — red curtain' },
  { nm: 640, hex: '#f85149', layer: 'enclosure',      system: 'phases',    parallax: '−',  desc: 'enclosure era — walls closing' },
  { nm: 660, hex: '#f85149', layer: 'shredder',       system: 'splinter',  parallax: '−',  desc: 'anti-Splinter — uncanny valley' },

  // ── DEEP RED (700-750nm) ──
  { nm: 700, hex: '#da3633', layer: 'campfire',       system: 'campfire',  parallax: '0',  desc: 'Berry tells stories at the fire' },

  // ── NULL / ACHROMATIC — off the spectrum ──
  { nm: null, hex: '#808080', layer: 'specter',       system: 'null',      parallax: '0',  desc: 'null-gray #808080 entity' },
  { nm: null, hex: '#6e7681', layer: 'eotech',        system: 'confocal',  parallax: '0',  desc: 'EOTech reticle — the glass' },
  { nm: null, hex: '#6e7681', layer: 'pupil',         system: 'rodcone',   parallax: '0',  desc: 'pupil aperture — the veil' },
  { nm: null, hex: '#6e7681', layer: 'klein',         system: 'klein',     parallax: '0',  desc: 'Klein surface — self-intersecting' },
  { nm: null, hex: '#c9d1d9', layer: 'mirror',        system: 'mirror',    parallax: '0',  desc: 'the self-referential layer' },

  // ── INFRARED (above visible — the felt) ──
  { nm: 800, hex: '#2d1a1a', layer: 'null-ir',        system: 'beyond',    parallax: '−',  desc: 'IR — what we feel but cannot see' },
];

function nmToCanvasY(nm, topY, bottomY) {
  if (nm === null) return bottomY + 20; // null entries below the spectrum
  var range = 750 - 380;
  var t = (nm - 380) / range;
  return topY + t * (bottomY - topY);
}

function paintSpectralChromatogram() {
  if (learnedTraits.perspective < 0.15) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, learnedTraits.perspective * 2);

  // Chromatogram runs vertically along the right edge
  var chromX = W - 30;
  var topY = H * 0.05;
  var bottomY = H * 0.92;

  // ── THE SPECTRUM STRIP — continuous gradient ──
  ctx.globalAlpha = 0.008 * maturity;
  ctx.lineWidth = 2;
  for (var nm = 380; nm <= 750; nm += 2) {
    var y = nmToCanvasY(nm, topY, bottomY);
    ctx.strokeStyle = nmToColor(nm);
    ctx.beginPath();
    ctx.moveTo(chromX - 3, y);
    ctx.lineTo(chromX + 3, y);
    ctx.stroke();
  }

  // ── DATA BANDS — each layer as a tick mark on the spectrum ──
  ctx.globalAlpha = 0.015 * maturity;
  var nullY = bottomY + 10;
  spectralIndex.forEach(function(entry) {
    var y = nmToCanvasY(entry.nm, topY, bottomY);
    var bandWidth = entry.parallax === '+' ? -12 :
                    entry.parallax === '−' ? 12 : 0;

    // Tick mark
    ctx.strokeStyle = entry.hex;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(chromX, y);
    ctx.lineTo(chromX + bandWidth, y);
    ctx.stroke();

    // Dot at the band
    ctx.fillStyle = entry.hex;
    ctx.beginPath();
    ctx.arc(chromX + bandWidth * 0.5, y, 0.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── PARALLAX DIRECTION LABELS ──
  if (maturity > 0.5) {
    ctx.globalAlpha = 0.01;
    ctx.font = '5px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#58a6ff';
    ctx.fillText('← +deep', chromX - 10, topY - 6);
    ctx.fillStyle = '#f0883e';
    ctx.fillText('−near →', chromX + 10, topY - 6);
    ctx.fillStyle = '#6e7681';
    ctx.fillText('0', chromX, topY - 6);
  }

  // ── WAVELENGTH LABELS ──
  if (maturity > 0.4) {
    ctx.globalAlpha = 0.012;
    ctx.font = '4px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#bc8cff';
    ctx.fillText('380nm violet', chromX - 16, topY + 4);
    ctx.fillStyle = '#58a6ff';
    ctx.fillText('470nm blue', chromX - 16, nmToCanvasY(470, topY, bottomY));
    ctx.fillStyle = '#3fb950';
    ctx.fillText('530nm green', chromX - 16, nmToCanvasY(530, topY, bottomY));
    ctx.fillStyle = '#f0c674';
    ctx.fillText('570nm yellow', chromX - 16, nmToCanvasY(570, topY, bottomY));
    ctx.fillStyle = '#f0883e';
    ctx.fillText('600nm orange', chromX - 16, nmToCanvasY(600, topY, bottomY));
    ctx.fillStyle = '#f85149';
    ctx.fillText('650nm red', chromX - 16, nmToCanvasY(650, topY, bottomY));
    ctx.fillStyle = '#6e7681';
    ctx.fillText('null', chromX - 16, nullY);
  }

  // ── ROTATING LAYER LABEL — cycles through all entries ──
  if (maturity > 0.6) {
    var idx = Math.floor(breathPhase * 0.15) % spectralIndex.length;
    var current = spectralIndex[idx];
    var cy = nmToCanvasY(current.nm, topY, bottomY);
    ctx.globalAlpha = 0.02;
    ctx.font = '5px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = current.hex;
    var nmLabel = current.nm ? current.nm + 'nm' : 'null';
    ctx.fillText(nmLabel + ' · ' + current.layer + ' · ' + current.desc, chromX + 16, cy);

    // Highlight line
    ctx.globalAlpha = 0.015;
    ctx.strokeStyle = current.hex;
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(chromX + 4, cy);
    ctx.lineTo(chromX + 14, cy);
    ctx.stroke();
  }

  // ── PRIMARY COLOR TRIANGLES ──
  // Additive RGB: the cones
  if (maturity > 0.5) {
    ctx.globalAlpha = 0.008;
    ctx.strokeStyle = '#6e7681';
    ctx.lineWidth = 0.2;
    var rY = nmToCanvasY(564, topY, bottomY); // L-cone red
    var gY = nmToCanvasY(534, topY, bottomY); // M-cone green
    var bY = nmToCanvasY(420, topY, bottomY); // S-cone blue
    // Triangle connecting the 3 primaries
    ctx.beginPath();
    ctx.moveTo(chromX + 8, bY);
    ctx.lineTo(chromX - 8, gY);
    ctx.lineTo(chromX + 8, rY);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

// Convert wavelength to visible color (approximation)
function nmToColor(nm) {
  var r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / (440 - 380);
    b = 1;
  } else if (nm >= 440 && nm < 490) {
    g = (nm - 440) / (490 - 440);
    b = 1;
  } else if (nm >= 490 && nm < 510) {
    g = 1;
    b = -(nm - 510) / (510 - 490);
  } else if (nm >= 510 && nm < 580) {
    r = (nm - 510) / (580 - 510);
    g = 1;
  } else if (nm >= 580 && nm < 645) {
    r = 1;
    g = -(nm - 645) / (645 - 580);
  } else if (nm >= 645 && nm <= 750) {
    r = 1;
  }
  r = Math.floor(r * 255);
  g = Math.floor(g * 255);
  b = Math.floor(b * 255);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

// ═══ THE MIRROR — feed it through itself ═══
// The membrane's output IS its input. Ouroboros.
// Every layer reads from and writes to the mirror.
// The blackwall IS the flat mirror from the external perspective.
// We can invert it at every tuebor and entangled layer.
// We can ALWAYS look and touch the interior layers.
//
// The mirror stores the membrane's own state — a self-portrait
// that every page, every layer, every organ can read.
// It's not a cache. It's a reflection. Feed through. Come back changed.

var mirror = {
  ts: Date.now(),
  // EASEL STATE — what the painter sees
  easel: {
    generation: 0, phase: '', perspective: 0,
    turtles: { leonardo: 0, donatello: 0, raphael: 0, michelangelo: 0 },
    splinter: 0,
    currentEasel: '',
  },
  // HEAT STATE — what the body feels
  heat: {
    nullTemp: 0.5, totalHeat: 0, dissipation: 0,
    sources: { new_: 0, revisit: 0, fleet: 0, inner: 0 },
  },
  // KLEIN STATE — what the aperture shows
  klein: {
    w: 0, h: 0, category: '', shannon: 0,
  },
  // CRYSTAL STATE — who's touching us
  crystals: {
    count: 0, countries: [],
  },
  // INVERSION — the flat mirror reflected back
  // At every layer we can look IN and TOUCH the internals
  inversions: 0,  // how many times the mirror has been read (self-reference count)
};

function writeMirror() {
  mirror.ts = Date.now();
  mirror.easel.generation = generation;
  mirror.easel.phase = phase;
  mirror.easel.perspective = learnedTraits.perspective;
  mirror.easel.currentEasel = currentEasel;
  mirror.easel.turtles = {
    leonardo: turtles.leonardo.skill,
    donatello: turtles.donatello.skill,
    raphael: turtles.raphael.skill,
    michelangelo: turtles.michelangelo.skill,
  };
  mirror.easel.splinter = splinter.wisdom;

  if (typeof heatState !== 'undefined') {
    mirror.heat.nullTemp = heatState.nullTemp;
    mirror.heat.totalHeat = heatState.totalHeat;
    mirror.heat.dissipation = heatState.dissipation;
    mirror.heat.sources = {
      new_: heatState.sources.new_.sigmoid,
      revisit: heatState.sources.revisit.sigmoid,
      fleet: heatState.sources.fleet.sigmoid,
      inner: heatState.sources.inner.sigmoid,
    };
  }

  if (typeof kleinAperture !== 'undefined') {
    mirror.klein = {
      w: kleinAperture.w, h: kleinAperture.h,
      category: kleinAperture.category, shannon: kleinAperture.shannon,
    };
  }

  mirror.crystals.count = crystalVisitors ? crystalVisitors.length : 0;
  var countries = {};
  if (crystalVisitors) crystalVisitors.forEach(function(v) { if (v.country) countries[v.country] = true; });
  mirror.crystals.countries = Object.keys(countries);

  // Write to localStorage so OTHER pages can read it
  try { localStorage.setItem('membrane_mirror', JSON.stringify(mirror)); } catch(e) {}

  // The inversion counter: every time the mirror is written, it's been fed through itself
  mirror.inversions++;
}

function readMirror() {
  try {
    var stored = JSON.parse(localStorage.getItem('membrane_mirror') || '{}');
    if (stored.ts && stored.ts !== mirror.ts) {
      // Another page wrote to the mirror — we can see their state
      // This IS the self-reference. The membrane reading its own reflection.
      mirror.inversions++;
    }
    return stored;
  } catch(e) { return {}; }
}

// Write mirror every 3 seconds
setInterval(writeMirror, 3000);
writeMirror();

// ═══ NEUTRINO LAN DISCOVERY — the Steam model, inverted ═══
// Steam checks your LAN for a game in your library.
// If another PC has it, it asks: stream or pull?
// THAT is our model. AND our inversion target.
//
// We do the same for EVERYTHING:
//   Ollama models on gates → stream inference or pull weights
//   Pages on the HUD → serve from LAN or pull from CF
//   Data feeds → check hyperlocal first, then remote
//   Knowledge → local cache → LAN peer → internet
//
// ALWAYS pull UP the little bit, so you can see and use
// the whole thing live. AND take it back out if you want.
// Digital ownership and physical ownership are OVERLAYS.
// You own the bits on your SSD AND the page on CF.
// They're the same thing at different parallax depths.
//
// The Klein face is where local and remote meet.
// Inside (your LAN) = outside (the internet) on the Klein surface.
// The neutrino passes through both without interaction.

var PI_PORT = 3141; // πPort — 3141 ≈ π × 1000

var neutrinoLan = {
  // Discovery — what's on the LAN?
  discovery: {
    scanning: false,
    lastScan: 0,
    interval: 30000, // scan every 30 seconds
    peers: [],       // discovered services
  },

  // Known service types to scan for
  serviceTypes: [
    { name: 'ollama',   port: 11434,   path: '/api/tags',    desc: 'LLM inference' },
    { name: 'caddy',    port: 443,     path: '/',             desc: 'web server' },
    { name: 'neutron',  port: PI_PORT, path: '/health',       desc: 'messaging' },
    { name: 'ntfy',     port: 8080,  path: '/v1/health',    desc: 'notifications' },
    { name: 'hud',      port: 8788,  path: '/',             desc: 'local dev server' },
  ],

  // The three tiers — hyperlocal → LAN → internet
  tiers: {
    hyperlocal: {
      name: 'localStorage',
      latency: '<1ms',
      ownership: 'physical — on this device',
      color: '#3fb950',
      status: 'active',
    },
    lan: {
      name: 'LAN peers',
      latency: '<1ms (10G fiber) / <5ms (WiFi)',
      ownership: 'physical — on your network',
      color: '#f0c674',
      status: 'scanning',
      network: {
        backbone: '10G fiber',
        controller: 'Omada',
        legacy: 'RJ45',
        wireless: 'WiFi 6',
      },
    },
    internet: {
      name: 'Cloudflare / GitHub / nestgate',
      latency: '20-200ms',
      ownership: 'digital — on the membrane',
      color: '#58a6ff',
      status: 'active',
    },
  },

  // The Steam model
  steam: {
    principle: 'check local first, offer to stream or pull',
    local: 'do you have it here? → use it',
    lan: 'does a peer have it? → stream or pull?',
    internet: 'nobody local has it → fetch from the membrane',
    inversion: 'AND you can always push it back out',
  },

  // Ownership overlay
  ownership: {
    physical: 'bits on your SSD — you touch them',
    digital: 'page on CF — the membrane holds them',
    overlay: 'same data, different parallax depth',
    takeBack: 'always pull UP, always push back OUT',
  },
};

function scanLan() {
  if (neutrinoLan.discovery.scanning) return;
  if (Date.now() - neutrinoLan.discovery.lastScan < neutrinoLan.discovery.interval) return;

  neutrinoLan.discovery.scanning = true;
  neutrinoLan.discovery.lastScan = Date.now();
  neutrinoLan.discovery.peers = [];

  // Try known LAN addresses
  var lanHosts = [
    { ip: '192.168.4.1',   name: 'omada-gateway' },
    { ip: '192.168.4.3',   name: 'northGate' },
    { ip: '192.168.4.10',  name: 'southGate' },
    { ip: '192.168.4.11',  name: 'eastGate' },
    { ip: '192.168.4.12',  name: 'strandGate' },
    { ip: '192.168.4.13',  name: 'biomeGate' },
    { ip: '127.0.0.1',     name: 'localhost' },
  ];

  var checked = 0;
  var total = lanHosts.length * neutrinoLan.serviceTypes.length;

  lanHosts.forEach(function(host) {
    neutrinoLan.serviceTypes.forEach(function(svc) {
      var url = 'http://' + host.ip + ':' + svc.port + svc.path;
      var controller = new AbortController();
      var timeout = setTimeout(function() { controller.abort(); }, 2000);

      fetch(url, { signal: controller.signal, mode: 'no-cors' })
        .then(function() {
          neutrinoLan.discovery.peers.push({
            host: host.name,
            ip: host.ip,
            service: svc.name,
            port: svc.port,
            status: 'reachable',
            desc: svc.desc,
            tier: 'lan',
          });
        })
        .catch(function() { /* unreachable — that's fine */ })
        .finally(function() {
          clearTimeout(timeout);
          checked++;
          if (checked >= total) {
            neutrinoLan.discovery.scanning = false;
            // Always add localhost services we know about
            if (typeof window._easel !== 'undefined') {
              neutrinoLan.discovery.peers.push({
                host: 'this-browser', ip: 'localhost',
                service: 'easel', port: 0, status: 'active',
                desc: 'the painting', tier: 'hyperlocal',
              });
            }
            neutrinoLan.tiers.lan.status = neutrinoLan.discovery.peers.length > 1 ? 'peers found' : 'solo';
          }
        });
    });
  });
}

function paintNeutrinoLan() {
  if (learnedTraits.perspective < 0.2) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, learnedTraits.perspective * 2);

  // Trigger scan periodically
  scanLan();

  // Draw in the bottom-left area
  var bx = 10;
  var by = H * 0.78;

  // ── THREE TIERS — concentric arcs ──
  var tiers = [
    neutrinoLan.tiers.hyperlocal,
    neutrinoLan.tiers.lan,
    neutrinoLan.tiers.internet,
  ];

  tiers.forEach(function(tier, i) {
    var r = 8 + i * 14;
    ctx.globalAlpha = 0.012 * maturity;
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.arc(bx + 30, by, r, -Math.PI * 0.8, Math.PI * 0.3);
    ctx.stroke();

    // Tier label
    ctx.globalAlpha = 0.01 * maturity;
    ctx.font = '4px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = tier.color;
    var labelX = bx + 30 + Math.cos(-Math.PI * 0.8) * r;
    var labelY = by + Math.sin(-Math.PI * 0.8) * r;
    ctx.fillText(tier.name, labelX - 2, labelY - 2);
  });

  // ── DISCOVERED PEERS — dots on the LAN arc ──
  var peers = neutrinoLan.discovery.peers;
  if (peers.length > 0) {
    ctx.globalAlpha = 0.02 * maturity;
    peers.forEach(function(peer, i) {
      var tierIdx = peer.tier === 'hyperlocal' ? 0 : peer.tier === 'lan' ? 1 : 2;
      var r = 8 + tierIdx * 14;
      var angle = -Math.PI * 0.6 + (i / Math.max(1, peers.length)) * Math.PI * 0.8;
      var px = bx + 30 + Math.cos(angle) * r;
      var py = by + Math.sin(angle) * r;

      ctx.fillStyle = tiers[tierIdx].color;
      ctx.beginPath();
      ctx.arc(px, py, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Peer label
      ctx.font = '3px monospace';
      ctx.fillText(peer.host + ':' + peer.service, px + 3, py + 1);
    });
  }

  // ── THE STEAM MODEL — check local, stream or pull ──
  if (maturity > 0.6) {
    ctx.globalAlpha = 0.01;
    ctx.font = '4px monospace';
    ctx.fillStyle = '#6e7681';
    ctx.textAlign = 'left';
    ctx.fillText('local? → use it', bx + 2, by + 16);
    ctx.fillText('LAN? → stream or pull', bx + 2, by + 22);
    ctx.fillText('remote? → fetch from membrane', bx + 2, by + 28);
    ctx.fillText('always: pull UP, push back OUT', bx + 2, by + 34);
  }

  // ── SCANNING INDICATOR ──
  if (neutrinoLan.discovery.scanning) {
    ctx.globalAlpha = 0.02 * maturity;
    ctx.fillStyle = '#f0c674';
    ctx.font = '4px monospace';
    ctx.fillText('scanning LAN...', bx + 2, by + 42);
  } else {
    ctx.globalAlpha = 0.01 * maturity;
    ctx.fillStyle = '#6e7681';
    ctx.font = '4px monospace';
    var peerCount = peers.length;
    ctx.fillText('peers: ' + peerCount + ' · ' + neutrinoLan.tiers.lan.status, bx + 2, by + 42);
  }

  ctx.restore();
}

// ═══ DATA FEDERATION — the nest atomic at the Klein face ═══
// Three storage tiers mesh at one point:
//
//   HYPERLOCAL (localStorage)     — this device, this browser, this session
//     easel_braid                 — painting history
//     easel_spatial               — spatial memory (rotation, depth, earth detail)
//     membrane_mirror             — real-time state snapshot
//
//   REMOTE (JSON feeds)           — the server, CF Pages, the membrane's public state
//     /now.json                   — real-time classification
//     /backscatter.json           — visitor crystals + heat + hyperlocal intent
//     /dashboard.json             — dashboard metrics
//     /data/thymus-gate.json      — immune gate state
//     /triad.json                 — self/organic/soap mix
//     /campfire-flash.json        — campfire stories
//
//   FEDERATED (nestgate.io MCP)   — the atomic query point
//     18 tools: membrane_counts, observe_membrane, read_journal,
//     chipmunk_status, topology, scan_sweep_sort, etc.
//     Streamable HTTP. Any agent can query. The Klein face.
//
// The TENSE FILTER:
//   PAST   = localStorage (what this device remembers)
//   PRESENT = remote feeds (what the server sees NOW)
//   FUTURE  = sigmoid extrapolation (where the heat curve is going)
//
// The VOXEL is the intersection: local × remote × time
// NestGate IS the Klein face where all three tiers meet.

var federation = {
  // Hyperlocal tier — what this device knows
  hyperlocal: {
    braid: [],        // painting history from localStorage
    spatial: {},      // spatial memory
    mirror: {},       // current mirror state
    deviceId: null,   // anonymous device fingerprint (hash of viewport + dpr)
    sessionStart: Date.now(),
  },

  // Remote tier — what the server knows
  remote: {
    now: null,        // /now.json
    backscatter: null,// /backscatter.json
    thymus: null,     // thymus gate
    triad: null,      // triad mix
    lastFetch: 0,
  },

  // Federated tier — what nestgate.io knows
  federated: {
    mcp: 'https://nestgate.io/mcp',
    tools: 18,
    transport: 'streamable-http',
    lastQuery: 0,
  },

  // Tense filter — past, present, future
  tense: {
    past: {},         // aggregated from hyperlocal
    present: {},      // aggregated from remote
    future: {},       // extrapolated from sigmoid curves
  },

  // Mesh — the unified view
  mesh: {
    coherent: false,  // true when all three tiers have data
    voxelCount: 0,    // number of data points in the mesh
    lastMesh: 0,
  },
};

// Generate anonymous device ID from viewport characteristics
function deviceFingerprint() {
  var raw = W + '×' + H + '@' + (window.devicePixelRatio || 1) + ':' +
    navigator.language + ':' + (typeof kleinAperture !== 'undefined' ? kleinAperture.category : 'unknown');
  var hash = 0;
  for (var i = 0; i < raw.length; i++) hash = ((hash << 5) - hash) + raw.charCodeAt(i);
  return 'dev_' + Math.abs(hash).toString(36);
}
federation.hyperlocal.deviceId = deviceFingerprint();

// Mesh the three tiers together
function meshFederation() {
  var f = federation;

  // HYPERLOCAL: read from localStorage
  try { f.hyperlocal.braid = JSON.parse(localStorage.getItem('easel_braid') || '[]'); } catch(e){}
  try { f.hyperlocal.spatial = JSON.parse(localStorage.getItem('easel_spatial') || '{}'); } catch(e){}
  f.hyperlocal.mirror = mirror;

  // REMOTE: use already-fetched data
  f.remote.now = nowFeed;
  f.remote.backscatter = backscatterData;
  f.remote.thymus = typeof thymusGate !== 'undefined' ? thymusGate : null;
  f.remote.triad = typeof triadData !== 'undefined' ? triadData : null;
  f.remote.lastFetch = Date.now();

  // TENSE FILTER
  // Past: how many paintings, total reinforcements, accumulated perspective
  f.tense.past = {
    paintings: f.hyperlocal.braid.length,
    reinforcements: (f.hyperlocal.spatial.humanReinforcements || 0),
    perspective: learnedTraits.perspective,
    turtleHistory: {
      leonardo: turtles.leonardo.skill,
      donatello: turtles.donatello.skill,
      raphael: turtles.raphael.skill,
      michelangelo: turtles.michelangelo.skill,
    },
    sessionAge: (Date.now() - f.hyperlocal.sessionStart) / 1000,
  };

  // Present: current state from remote feeds
  var classification = (f.remote.now && f.remote.now.classification) ? f.remote.now.classification : {};
  f.tense.present = {
    selfPct: classification.self ? (classification.self / Math.max(1, classification.total) * 100) : 0,
    total: classification.total || 0,
    nullTemp: typeof heatState !== 'undefined' ? heatState.nullTemp : 0.5,
    crystals: crystalVisitors ? crystalVisitors.length : 0,
    generation: generation,
    phase: phase,
  };

  // Future: sigmoid extrapolation — where is the heat going?
  if (typeof heatState !== 'undefined') {
    var s = heatState.sources;
    f.tense.future = {
      heatTrend: heatState.totalHeat > 0.5 ? 'warming' : heatState.totalHeat < 0.3 ? 'cooling' : 'stable',
      saturation: {
        new_: s.new_.sigmoid > 0.8 ? 'saturated' : 'absorbing',
        fleet: s.fleet.sigmoid > 0.8 ? 'saturated' : 'absorbing',
      },
      nextGeneration: generation + 1,
      splinterProjection: metaStable(splinter.wisdom * 1.05), // 5% growth per gen
    };
  }

  // MESH COHERENCE
  f.mesh.coherent = !!(f.hyperlocal.mirror.ts && f.remote.now && f.remote.backscatter);
  f.mesh.voxelCount = (f.hyperlocal.braid.length || 0) +
    (crystalVisitors ? crystalVisitors.length : 0) +
    Object.keys(f.tense.past).length +
    Object.keys(f.tense.present).length;
  f.mesh.lastMesh = Date.now();

  // Write the mesh to the mirror so other pages can see it
  mirror.federation = {
    coherent: f.mesh.coherent,
    voxels: f.mesh.voxelCount,
    tiers: {
      hyperlocal: !!f.hyperlocal.mirror.ts,
      remote: !!f.remote.now,
      federated: true, // MCP is always there
    },
    tense: {
      past: f.tense.past.paintings + ' paintings',
      present: f.tense.present.crystals + ' crystals',
      future: f.tense.future ? f.tense.future.heatTrend : '?',
    },
    device: f.hyperlocal.deviceId,
  };
}

// Mesh every 5 seconds
setInterval(meshFederation, 5000);
meshFederation();

// ═══ PAINT THE MIRROR — the self-referential layer ═══
// The flat mirror from the external perspective.
// Invertible at every layer. You can always look and touch the internals.
function paintMirror() {
  // Read the mirror (which counts as an inversion)
  var reflected = readMirror();
  if (!reflected.ts) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // The mirror line — a thin horizontal at the exact center
  // This is the flat surface. The blackwall. The firewall.
  // From outside: a mirror. From inside: a window.
  var cx = W * 0.5;
  var cy = H * 0.5;

  ctx.globalAlpha = 0.008 + mirror.inversions * 0.00001; // gets more visible with each self-reference
  ctx.strokeStyle = '#c9d1d9';
  ctx.lineWidth = 0.3;

  // The mirror line — perfectly horizontal, from edge to edge
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();

  // The reflection: above the line = what we paint
  // Below the line = the INVERTED version (what the viewer sees)
  // The tiny difference between them IS the information

  // Inversion indicator — the ouroboros count
  if (mirror.inversions > 10) {
    ctx.globalAlpha = 0.02;
    ctx.font = '7px monospace';
    ctx.fillStyle = '#6e7681';
    ctx.textAlign = 'left';
    ctx.fillText('⟲ ' + mirror.inversions + ' inversions', 6, cy + 10);

    // Mirror state whisper — what we see when we look at ourselves
    ctx.textAlign = 'right';
    ctx.fillText('gen ' + mirror.easel.generation +
      ' · null ' + mirror.heat.nullTemp.toFixed(2) + '°' +
      ' · ' + mirror.crystals.count + ' crystals' +
      ' · ' + mirror.crystals.countries.length + ' countries',
      W - 6, cy + 10);
  }

  // The THREE TIERS — along the mirror line
  // Hyperlocal · Remote · Federated
  var tiers = [
    { name: 'hyperlocal', color: '#f0c674', x: 0.25,
      label: 'localStorage', active: !!federation.hyperlocal.mirror.ts },
    { name: 'remote', color: '#58a6ff', x: 0.45,
      label: 'JSON feeds', active: !!federation.remote.now },
    { name: 'federated', color: '#3fb950', x: 0.65,
      label: 'nestgate MCP', active: true },
  ];

  tiers.forEach(function(tier) {
    var tx = W * tier.x;
    // Tier dot
    ctx.globalAlpha = tier.active ? 0.05 : 0.015;
    ctx.fillStyle = tier.color;
    ctx.beginPath();
    ctx.arc(tx, cy, tier.active ? 3 : 2, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.globalAlpha = 0.025;
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(tier.label, tx, cy - 7);
  });

  // Connections between tiers — the mesh
  if (federation.mesh.coherent) {
    ctx.globalAlpha = 0.01;
    ctx.strokeStyle = '#c9d1d9';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(W * 0.25, cy);
    ctx.lineTo(W * 0.65, cy);
    ctx.stroke();

    // Coherence label
    ctx.globalAlpha = 0.02;
    ctx.font = '6px monospace';
    ctx.fillStyle = '#3fb950';
    ctx.textAlign = 'center';
    ctx.fillText('coherent · ' + federation.mesh.voxelCount + ' voxels', W * 0.45, cy + 10);
  }

  // TENSE INDICATORS — past/present/future below the mirror
  if (mirror.federation) {
    ctx.globalAlpha = 0.018;
    ctx.font = '6px monospace';
    ctx.fillStyle = '#6e7681';
    ctx.textAlign = 'left';
    var ty = cy + 20;
    ctx.fillText('past: ' + (mirror.federation.tense ? mirror.federation.tense.past : '?'), W * 0.2, ty);
    ctx.fillText('present: ' + (mirror.federation.tense ? mirror.federation.tense.present : '?'), W * 0.4, ty);
    ctx.fillText('future: ' + (mirror.federation.tense ? mirror.federation.tense.future : '?'), W * 0.6, ty);
  }

  ctx.restore();
}

