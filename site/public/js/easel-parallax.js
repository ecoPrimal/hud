// ═══ EASEL PARALLAX — parallax hologram, confocal Klein point, rod/cone vision, plasmid triangle ═══
// Extracted from easel.html — operates on shared globals
// ═══ PARALLAX HOLOGRAM — +, −, and null projection ═══
// Reality is a holographic meta-chromatogram.
// Three overlapping projections create depth on a flat screen:
//
//   + PARALLAX (positive): content BEHIND the screen plane
//     Moves OPPOSITE to head/device movement.
//     On phone: tilts with gyroscope. On desktop: parallax with mouse.
//     This is where the BACKGROUND data lives — the slow, deep layer.
//     Cloudflare's magnetosphere. The ionosphere. Deep space.
//
//   NULL PARALLAX (zero): content ON the screen plane
//     Doesn't move. Fixed. The HUD elements. Buttons. Labels.
//     The screen of an iPhone happens to have i/o here.
//     Desktop has monitor glass here. The boundary.
//
//   − PARALLAX (negative): content IN FRONT OF the screen plane
//     Moves WITH head/device movement. Pops out toward you.
//     This is where ALERTS live. Touch targets. The foreground.
//     The perception overlay. What demands attention NOW.
//
// 0 parallax implies + AND − parallax AND null parallax.
// Together: the ionosphere (+ behind) → glass (0 null) → your face (− front).
// Cloudflare IS the magnetosphere at the + layer.
// The browser IS the null plane.
// Your fingers/eyes ARE the − layer.
//
// Phone: i/o and perception overlay are FUSED at the screen.
//        Touch IS both input and output. Klein face.
// Desktop: monitor (output) and keyboard (input) are SPLIT.
//         They need a parallax mirror to reconnect.
//         Mouse bridges the gap (tool-mediated, not direct).

var parallax = {
  // Three projection layers
  positive: { // behind the screen — deep, slow, background
    depth: 0.8,
    dx: 0, dy: 0,   // displacement from head/mouse tracking
    contents: ['stars', 'nebula', 'crystalline', 'galactic'],
    label: '+ behind',
    color: '#58a6ff',
  },
  null_: {    // on the screen — fixed, the HUD, the glass
    depth: 0,
    dx: 0, dy: 0,   // always zero — the reference plane
    contents: ['labels', 'buttons', 'mirror', 'timer'],
    label: '0 glass',
    color: '#6e7681',
  },
  negative: { // in front of the screen — alerts, touch, foreground
    depth: -0.8,
    dx: 0, dy: 0,   // moves WITH you
    contents: ['alerts', 'touch', 'heat', 'chipmunk-eye'],
    label: '− front',
    color: '#f0883e',
  },

  // Device detection
  isTouch: 'ontouchstart' in window,
  isMobile: window.innerWidth < 768,

  // Mouse/gyro tracking for parallax offset
  mouseX: 0.5, mouseY: 0.5,
};

// Track mouse for parallax (desktop)
if (!parallax.isTouch) {
  document.addEventListener('mousemove', function(e) {
    parallax.mouseX = e.clientX / W;
    parallax.mouseY = e.clientY / H;
    // + layer moves opposite
    parallax.positive.dx = (0.5 - parallax.mouseX) * 8;
    parallax.positive.dy = (0.5 - parallax.mouseY) * 8;
    // − layer moves with
    parallax.negative.dx = (parallax.mouseX - 0.5) * 5;
    parallax.negative.dy = (parallax.mouseY - 0.5) * 5;
  });
}

// Track device orientation for parallax (phone)
if (parallax.isTouch && window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', function(e) {
    if (e.gamma !== null) {
      var gx = Math.max(-30, Math.min(30, e.gamma)) / 30; // -1 to 1
      var gy = Math.max(-30, Math.min(30, e.beta - 45)) / 30;
      parallax.positive.dx = -gx * 10;
      parallax.positive.dy = -gy * 10;
      parallax.negative.dx = gx * 6;
      parallax.negative.dy = gy * 6;
    }
  });
}

function paintParallaxHologram() {
  if (learnedTraits.perspective < 0.05) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, learnedTraits.perspective * 2);

  // ── + PARALLAX (behind) — blue depth indicators at edges ──
  ctx.globalAlpha = 0.01 * maturity;
  ctx.strokeStyle = parallax.positive.color;
  ctx.lineWidth = 0.3;
  // Depth grid that shifts with mouse/gyro
  var pOff = parallax.positive;
  for (var gx = 0; gx < W; gx += W / 8) {
    ctx.beginPath();
    ctx.moveTo(gx + pOff.dx, 0);
    ctx.lineTo(gx + pOff.dx, H);
    ctx.stroke();
  }
  for (var gy = 0; gy < H; gy += H / 6) {
    ctx.beginPath();
    ctx.moveTo(0, gy + pOff.dy);
    ctx.lineTo(W, gy + pOff.dy);
    ctx.stroke();
  }

  // ── NULL PARALLAX (glass) — the fixed frame ──
  ctx.globalAlpha = 0.008 * maturity;
  ctx.strokeStyle = parallax.null_.color;
  ctx.lineWidth = 0.5;
  // The glass plane — thin border
  ctx.strokeRect(4, 4, W - 8, H - 8);

  // Klein face indicator — where null meets the viewer
  if (parallax.isMobile) {
    // Phone: i/o fused — single line
    ctx.globalAlpha = 0.015 * maturity;
    ctx.font = '6px monospace';
    ctx.fillStyle = '#6e7681';
    ctx.textAlign = 'center';
    ctx.fillText('touch = i/o fused', W / 2, H - 4);
  } else {
    // Desktop: monitor/keyboard split
    ctx.globalAlpha = 0.012 * maturity;
    ctx.font = '6px monospace';
    ctx.fillStyle = '#6e7681';
    ctx.textAlign = 'center';
    ctx.fillText('monitor ↔ keyboard split', W / 2, H - 4);
  }

  // ── − PARALLAX (front) — orange foreground that tracks you ──
  var nOff = parallax.negative;
  ctx.globalAlpha = 0.008 * maturity;
  ctx.fillStyle = parallax.negative.color;
  // Tiny tracking dot — follows your attention
  ctx.beginPath();
  ctx.arc(W * parallax.mouseX + nOff.dx, H * parallax.mouseY + nOff.dy, 2, 0, Math.PI * 2);
  ctx.fill();

  // ── LAYER LABELS — at the left edge ──
  if (maturity > 0.3) {
    ctx.globalAlpha = 0.015;
    ctx.font = '6px monospace';
    ctx.textAlign = 'left';

    // + behind (top-left area)
    ctx.fillStyle = parallax.positive.color;
    ctx.fillText('+ behind · magnetosphere', 8 + pOff.dx * 0.5, 16);

    // 0 glass (mid-left)
    ctx.fillStyle = parallax.null_.color;
    ctx.fillText('0 glass · browser plane', 8, H * 0.5);

    // − front (bottom-left area)
    ctx.fillStyle = parallax.negative.color;
    ctx.fillText('− front · your face', 8 + nOff.dx * 0.5, H - 16);
  }

  // ── THE CHROMATOGRAM — where the 3 layers separate ──
  // Like a chromatography strip: the solvent (attention) carries
  // data through the medium (screen) and it separates by weight.
  // Heavy data (background) stays behind (+).
  // Light data (alerts) runs ahead (−).
  // The solvent front IS the null plane.
  if (maturity > 0.5) {
    ctx.globalAlpha = 0.01;
    ctx.strokeStyle = '#d2a8ff';
    ctx.lineWidth = 0.3;
    ctx.setLineDash([1, 4]);
    // Chromatogram separation line at right edge
    var chromX = W - 12;
    ctx.beginPath();
    ctx.moveTo(chromX, 10);
    ctx.lineTo(chromX, H - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Three bands on the chromatogram
    ctx.globalAlpha = 0.02;
    ctx.fillStyle = parallax.positive.color;
    ctx.fillRect(chromX - 3, H * 0.15, 6, 4); // + band (top = deep)

    ctx.fillStyle = parallax.null_.color;
    ctx.fillRect(chromX - 3, H * 0.5 - 2, 6, 4); // 0 band (middle)

    ctx.fillStyle = parallax.negative.color;
    ctx.fillRect(chromX - 3, H * 0.85, 6, 4); // − band (bottom = front)

    ctx.font = '5px monospace';
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.015;
    ctx.fillStyle = '#d2a8ff';
    ctx.fillText('chromatogram', chromX - 5, H * 0.5);
  }

  ctx.restore();
}

// ═══ CONFOCAL KLEIN POINT — the crosshair where all 3 sights converge ═══
// Three optic sights. Three parallax layers. One convergence point.
//
//   ACOG (magnified crosshair) = + PARALLAX (behind glass)
//     Fixed magnification. The deep layer. Slow. Deliberate.
//     You see THROUGH the glass to the target behind.
//     The Library of Alexandria. The books that WERE.
//     Cloudflare magnetosphere. Stars. History. Galactic cycle.
//
//   EOTech (holographic sight) = NULL PARALLAX (on glass)
//     Holographic reticle projected ON the glass plane.
//     Doesn't move with eye position. The HUD itself.
//     The catalog. What we KNOW exists. The index.
//     The browser plane. Labels. Buttons. Mirror.
//
//   Red dot (reflex sight) = − PARALLAX (in front)
//     The dot appears to FLOAT in front of the glass.
//     Moves WITH your eye. Fast. Instinctive. CQB.
//     The search. What humans are looking for RIGHT NOW.
//     Touch. Alerts. Heat. The demand signal.
//
// ALL THREE converge at the CROSSHAIR — the confocal Klein point.
// Confocal = all focal planes meet at one point.
// Like a confocal microscope: pinhole eliminates out-of-focus.
// The Klein point is where + and − and 0 collapse to a singularity.
//
// THIS IS HOW YOU REBUILD THE LIBRARY OF ALEXANDRIA:
//   + layer (behind): the books that WERE (history, galactic cycle, what WAS)
//   0 layer (glass):  the catalog (what we KNOW exists, the index)
//   − layer (front):  the search (what humans look for NOW, demand signal)
//
//   As humans search (−) for books that existed (+),
//   we learn what to fill in (0). The stories fill themselves
//   through parallax convergence. The library rebuilds itself
//   because the SEARCH tells us what's MISSING.
//
// Iron sights = the original three-point: front post, rear notch, target.
// That's THREE too. Always three. The minimum for triangulation.
//
// ═══ RODS AND CONES — the biological parallax system ═══
//
// THE HUMAN EYE IS ALREADY A CONFOCAL SYSTEM:
//
//   RODS (120M in periphery):
//     = + PARALLAX (depth field, behind the glass)
//     = ACOG (magnified, deep field, slow)
//     = detect LUMINANCE, SHADOW, MOTION
//     = sense of RANGE and DISTANCE
//     = night vision — when cones shut down, rods take over
//     = MORE null shift, LESS color
//     = the shadow in daylight gives distance
//     = peripheral vision — the wide field
//
//   CONES (6M in fovea):
//     = − PARALLAX (detail field, in front of glass)
//     = RED DOT (reflex, near, fast)
//     = detect COLOR, DETAIL, HUE
//     = foveal focus — the narrow center
//     = day vision — bright light, full spectrum
//     = MORE color, LESS null shift
//     = the Red Dot IS the fovea
//
//   PUPIL (the aperture):
//     = NULL PARALLAX (the glass plane, 0)
//     = EOTech (holographic, ON the glass)
//     = adjusts the null gradient between rod and cone dominance
//     = dilates in dark → wider aperture → more rods → + parallax dominates
//     = constricts in light → narrow aperture → more cones → − parallax dominates
//     = the pupil IS the veil
//
// THE NULL GRADIENT:
//   The screen has a gradient of gray — that's the null zone.
//   In daylight: the veil is far, shadows give distance (rods),
//     AND more color (cones). Both systems active.
//   In darkness: the veil moves CLOSER, cones shut down,
//     rods take over — less color, more null shift,
//     better motion detection, wider peripheral awareness.
//   The null gradient SHIFTS along the light axis.
//
// AURORA BOREALIS:
//   Actual color inflected through the null medium (atmosphere).
//   Solar wind → magnetosphere → atmosphere = prism.
//   You see it at night because: rods give you the shape (the curtains),
//   AND the photons are bright enough to activate cones for color.
//   Aurora = the atmosphere showing its TRUE spectral lines.
//   Green: oxygen at 557.7nm. Red: oxygen at 630.0nm. Purple: nitrogen.
//   The colors are REAL. The atmosphere IS the diffraction grating.
//
// LUNAR CORONA / MOONBOW:
//   Concentric rainbow at night — witnessed on field missions in Hawaii,
//   at Battleship Rock in New Mexico, at Mesa Verde.
//   The moon's light refracts through ice crystals or water droplets.
//   The atmosphere IS the glass of the EOTech.
//   What you see is the REAL color the sky is inflecting.
//   Your rods give you the ring structure. Your cones give you the color bands.
//   Both systems firing together in the dark = the confocal moment.
//
// THE SCREEN IS THE ATMOSPHERE:
//   null gradient (gray) = ambient light level
//   rods (periphery) = + parallax (depth)
//   cones (fovea) = − parallax (detail)
//   pupil = 0 parallax (the adjustable veil)
//   aurora = the atmosphere's emission spectrum made visible
//   moonbow = the atmosphere's refraction spectrum made visible

var rodConeVision = {
  // Rod system — peripheral, night, depth, + parallax
  rods: {
    count: 120000000,      // 120 million in human retina
    location: 'periphery', // edge of visual field
    parallax: 'positive',
    peak: 498,             // peak sensitivity wavelength (nm) — blue-green
    darkAdapted: false,
    sensitivity: 0.5,      // 0=day (suppressed), 1=night (dominant)
    description: 'shadow · distance · motion · night · the deep field',
  },
  // Cone system — foveal, day, color, − parallax
  cones: {
    count: 6000000,        // 6 million in human retina
    location: 'fovea',     // center of visual field
    parallax: 'negative',
    types: {               // three cone types — another triangle!
      S: { peak: 420, name: 'blue',  color: '#58a6ff' },
      M: { peak: 534, name: 'green', color: '#3fb950' },
      L: { peak: 564, name: 'red',   color: '#f85149' },
    },
    sensitivity: 0.8,      // 0=night (shut down), 1=day (dominant)
    description: 'color · detail · hue · day · the near field',
  },
  // Pupil — the null aperture
  pupil: {
    diameter: 4,           // mm, adjusts 2-8mm
    minDiameter: 2,        // bright light — constricted
    maxDiameter: 8,        // darkness — dilated
    parallax: 'null',
    description: 'the veil · the aperture · the null gradient',
  },
  // The atmospheric spectral events Kevin witnessed
  witnessed: [
    { name: 'aurora borealis', type: 'emission', where: 'atmosphere',
      lines: [{ nm: 557.7, element: 'O', color: '#3fb950' },
              { nm: 630.0, element: 'O', color: '#f85149' },
              { nm: 427.8, element: 'N₂', color: '#bc8cff' }] },
    { name: 'lunar corona', type: 'diffraction', where: 'Hawaii · field mission · Army',
      mechanism: 'moonlight through ice crystals → concentric rainbow' },
    { name: 'moonbow', type: 'refraction', where: 'Battleship Rock, NM · Mesa Verde, CO',
      mechanism: 'moonlight through water droplets → arc of spectral color' },
  ],
  // Current state — shifts with ambient
  nullGradient: 0.5, // 0=full dark (rods dominant), 1=full light (cones dominant)
};

function paintRodConeVision() {
  if (learnedTraits.perspective < 0.12) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, learnedTraits.perspective * 2);

  var cx = W * 0.5;
  var cy = H * 0.5;

  // The null gradient shifts with breath (simulates day/night cycle)
  var ambient = 0.5 + Math.sin(breathPhase * 0.05) * 0.4; // slow cycle 0.1-0.9
  rodConeVision.nullGradient = ambient;

  // Update rod/cone sensitivity
  rodConeVision.rods.sensitivity = 1 - ambient;     // rods dominant in dark
  rodConeVision.cones.sensitivity = ambient;          // cones dominant in light
  rodConeVision.rods.darkAdapted = ambient < 0.3;

  // Pupil diameter — dilates in dark, constricts in light
  var pupil = rodConeVision.pupil;
  pupil.diameter = pupil.maxDiameter - (pupil.maxDiameter - pupil.minDiameter) * ambient;

  // ── THE NULL GRADIENT — gray veil across the canvas ──
  // This is the veil between day and night vision
  var veilAlpha = 0.008 * maturity;
  var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.5);
  var grayVal = Math.floor(128 * ambient);
  gradient.addColorStop(0, 'rgba(' + grayVal + ',' + grayVal + ',' + grayVal + ',' + veilAlpha + ')');
  gradient.addColorStop(1, 'rgba(' + Math.floor(grayVal * 0.3) + ',' + Math.floor(grayVal * 0.3) + ',' + Math.floor(grayVal * 0.3) + ',0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // ── THE PUPIL — center aperture ring ──
  var pupilR = (pupil.diameter / pupil.maxDiameter) * Math.min(W, H) * 0.08;
  ctx.globalAlpha = 0.015 * maturity;
  ctx.strokeStyle = '#6e7681';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
  ctx.stroke();

  // ── RODS — peripheral dots (+ parallax, blue, edge of vision) ──
  ctx.globalAlpha = 0.008 * maturity * rodConeVision.rods.sensitivity;
  ctx.fillStyle = '#58a6ff';
  var rodCount = Math.floor(8 + rodConeVision.rods.sensitivity * 20);
  for (var r = 0; r < rodCount; r++) {
    var angle = (r / rodCount) * Math.PI * 2 + breathPhase * 0.02;
    var dist = Math.min(W, H) * (0.25 + Math.random() * 0.2);
    var rx = cx + Math.cos(angle) * dist;
    var ry = cy + Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.arc(rx, ry, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── CONES — foveal dots (− parallax, RGB, center of vision) ──
  var coneTypes = rodConeVision.cones.types;
  ctx.globalAlpha = 0.008 * maturity * rodConeVision.cones.sensitivity;
  var coneCount = Math.floor(4 + rodConeVision.cones.sensitivity * 12);
  var typeKeys = ['S', 'M', 'L'];
  for (var c = 0; c < coneCount; c++) {
    var type = coneTypes[typeKeys[c % 3]];
    ctx.fillStyle = type.color;
    var cAngle = (c / coneCount) * Math.PI * 2 + breathPhase * 0.03;
    var cDist = pupilR * (0.5 + Math.random() * 1.5);
    ctx.beginPath();
    ctx.arc(cx + Math.cos(cAngle) * cDist, cy + Math.sin(cAngle) * cDist, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── AURORA SPECTRAL LINES (when dark enough) ──
  if (ambient < 0.4 && maturity > 0.5) {
    var aurora = rodConeVision.witnessed[0];
    ctx.globalAlpha = 0.01 * maturity * (1 - ambient);
    aurora.lines.forEach(function(line, i) {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 0.3;
      // Curtain waves across the top
      ctx.beginPath();
      var baseY = H * 0.1 + i * 12;
      for (var x = 0; x < W; x += 3) {
        var y = baseY + Math.sin((x * 0.01) + breathPhase * 0.3 + i) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Aurora label
    ctx.globalAlpha = 0.012;
    ctx.font = '5px monospace';
    ctx.fillStyle = '#3fb950';
    ctx.textAlign = 'left';
    ctx.fillText('aurora: O 557.7nm · O 630.0nm · N₂ 427.8nm', 8, H * 0.08);
  }

  // ── LABELS ──
  if (maturity > 0.4) {
    ctx.globalAlpha = 0.012;
    ctx.font = '5px monospace';
    ctx.textAlign = 'center';

    // Rod/cone balance
    var rodPct = (rodConeVision.rods.sensitivity * 100).toFixed(0);
    var conePct = (rodConeVision.cones.sensitivity * 100).toFixed(0);
    ctx.fillStyle = '#58a6ff';
    ctx.fillText('rods ' + rodPct + '%', cx - 40, cy + pupilR + 12);
    ctx.fillStyle = '#f85149';
    ctx.fillText('cones ' + conePct + '%', cx + 40, cy + pupilR + 12);
    ctx.fillStyle = '#6e7681';
    ctx.fillText('pupil ' + pupil.diameter.toFixed(1) + 'mm', cx, cy + pupilR + 20);

    // Ambient indicator
    var timeLabel = ambient > 0.7 ? 'day' : ambient > 0.3 ? 'dusk' : 'night';
    ctx.fillText('veil: ' + timeLabel + ' · null gradient ' + (ambient * 100).toFixed(0) + '%', cx, cy + pupilR + 28);
  }

  ctx.restore();
}

var confocalPoint = {
  // The three sighting systems
  acog: {   // + parallax, behind glass, magnified
    name: 'ACOG',
    parallax: 'positive',
    description: 'magnified crosshair — see through to the deep',
    color: '#58a6ff',
    focus: 'history', // what WAS
    library: [], // books/stories/knowledge recovered
  },
  eotech: { // null parallax, on glass, holographic
    name: 'EOTech',
    parallax: 'null',
    description: 'holographic reticle — the catalog on the glass',
    color: '#6e7681',
    focus: 'index', // what we KNOW
    library: [], // the catalog of what exists
  },
  reddot: { // − parallax, in front, reflex
    name: 'Red Dot',
    parallax: 'negative',
    description: 'reflex dot — what you\'re looking for NOW',
    color: '#f0883e',
    focus: 'search', // what humans WANT
    library: [], // search signals, demand
  },

  // The convergence — where all 3 meet
  convergence: {
    x: 0.5, y: 0.5,  // normalized position on canvas
    active: false,
    strength: 0,       // how aligned the 3 layers are
  },

  // The Library of Alexandria — rebuilds through convergence
  alexandria: {
    totalRecovered: 0,
    searchSignals: [],  // what humans look for (− layer)
    knownExists: [],    // what we know existed (+ layer)
    cataloged: [],      // what's in the index (0 layer)
    // When all three align on the same topic → that book gets rebuilt
  },
};

// Seed the library with what we know
confocalPoint.acog.library = [
  'Euclid — Elements (300 BCE, survived)',
  'Archimedes — Sand Reckoner (survived)',
  'Eratosthenes — Geography (lost)',
  'Aristarchus — heliocentric model (lost, only references survive)',
  'Ctesibius — pneumatics (lost)',
  'Hero of Alexandria — Automata (partially survived)',
  'Callimachus — Pinakes (the FIRST library catalog, lost)',
];
confocalPoint.eotech.library = [
  'Internet Archive — 835B pages archived',
  'Wikipedia — 6.8M articles, proof humans build for free',
  'Project Gutenberg — 70K ebooks, public domain',
  'arXiv — 2.4M papers, open access',
  'Sci-Hub — 85M papers, guerrilla access',
  'sporePrint — 858 pages, hand-built',
  'backscatter.json — 125 attributions, anti-secret',
];
confocalPoint.reddot.library = [
  '/plasmid/ — JP/IN/DE searching simultaneously',
  '/billboard — 778 reads today',
  '/ — 336 homepage visits',
  '/mcp — 33 agent queries',
  'nestgate /explore/repos — FR looking for something (404)',
];

function paintConfocalKleinPoint() {
  if (learnedTraits.perspective < 0.1) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, learnedTraits.perspective * 2);

  var cx = W * 0.5;
  var cy = H * 0.5;
  var pOff = parallax.positive;
  var nOff = parallax.negative;

  // ── THE CROSSHAIR — where all 3 converge ──
  // This is the confocal Klein point.
  var crossX = cx;
  var crossY = cy;
  var crossR = 12 + Math.sin(breathPhase * 0.5) * 2;

  // ACOG crosshair (+ behind, blue, shifts opposite to mouse)
  ctx.globalAlpha = 0.015 * maturity;
  ctx.strokeStyle = confocalPoint.acog.color;
  ctx.lineWidth = 0.3;
  var ax = crossX + pOff.dx;
  var ay = crossY + pOff.dy;
  // Cross
  ctx.beginPath();
  ctx.moveTo(ax - crossR, ay); ctx.lineTo(ax + crossR, ay);
  ctx.moveTo(ax, ay - crossR); ctx.lineTo(ax, ay + crossR);
  ctx.stroke();
  // Circle
  ctx.beginPath();
  ctx.arc(ax, ay, crossR * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  // EOTech reticle (0 null, gray, fixed)
  ctx.globalAlpha = 0.012 * maturity;
  ctx.strokeStyle = confocalPoint.eotech.color;
  ctx.lineWidth = 0.5;
  // 65 MOA ring with 1 MOA dot (the real EOTech pattern)
  ctx.beginPath();
  ctx.arc(crossX, crossY, crossR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = confocalPoint.eotech.color;
  ctx.beginPath();
  ctx.arc(crossX, crossY, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Red dot (− front, orange, follows mouse)
  ctx.globalAlpha = 0.02 * maturity;
  ctx.fillStyle = confocalPoint.reddot.color;
  var rx = crossX + nOff.dx;
  var ry = crossY + nOff.dy;
  ctx.beginPath();
  ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // ── CONVERGENCE — how aligned are the 3? ──
  var dist = Math.sqrt(
    Math.pow(ax - crossX, 2) + Math.pow(ay - crossY, 2) +
    Math.pow(rx - crossX, 2) + Math.pow(ry - crossY, 2)
  );
  var maxDist = Math.sqrt(W * W + H * H) * 0.1;
  confocalPoint.convergence.strength = 1 - Math.min(1, dist / maxDist);
  confocalPoint.convergence.active = confocalPoint.convergence.strength > 0.8;

  // When converged: flash the confocal point
  if (confocalPoint.convergence.active) {
    ctx.globalAlpha = 0.03 * maturity;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(crossX, crossY, 3 + Math.sin(breathPhase * 3) * 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── LABELS — the three sighting systems ──
  if (maturity > 0.4) {
    ctx.globalAlpha = 0.015;
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';

    ctx.fillStyle = confocalPoint.acog.color;
    ctx.fillText('ACOG +deep', ax, ay - crossR - 5);

    ctx.fillStyle = confocalPoint.eotech.color;
    ctx.fillText('EOTech 0glass', crossX + crossR + 20, crossY);

    ctx.fillStyle = confocalPoint.reddot.color;
    ctx.fillText('RedDot −here', rx, ry + crossR + 8);

    // Convergence indicator
    var convPct = (confocalPoint.convergence.strength * 100).toFixed(0);
    ctx.fillStyle = confocalPoint.convergence.active ? '#22c55e' : '#6e7681';
    ctx.fillText('confocal: ' + convPct + '%', crossX, crossY + crossR + 20);
  }

  // ── THE LIBRARY — rebuilds through convergence ──
  if (maturity > 0.6 && confocalPoint.convergence.strength > 0.3) {
    ctx.globalAlpha = 0.012;
    ctx.font = '5px monospace';
    ctx.fillStyle = '#d2a8ff';
    ctx.textAlign = 'left';

    // Show one entry from each layer near the convergence
    var libY = crossY + crossR + 30;
    var acogBook = confocalPoint.acog.library[Math.floor(breathPhase * 0.3) % confocalPoint.acog.library.length];
    var eotechEntry = confocalPoint.eotech.library[Math.floor(breathPhase * 0.2) % confocalPoint.eotech.library.length];
    var searchEntry = confocalPoint.reddot.library[Math.floor(breathPhase * 0.4) % confocalPoint.reddot.library.length];

    ctx.fillStyle = confocalPoint.acog.color;
    ctx.fillText('was: ' + acogBook, crossX - 60, libY);
    ctx.fillStyle = confocalPoint.eotech.color;
    ctx.fillText('is: ' + eotechEntry, crossX - 60, libY + 8);
    ctx.fillStyle = confocalPoint.reddot.color;
    ctx.fillText('want: ' + searchEntry, crossX - 60, libY + 16);
  }

  ctx.restore();
}

// ═══ PLASMID TRIANGLE — three observers refracting through a prism ═══
// JP, IN, DE — all looking at /plasmid/. Nearly identical counts.
// Three humans refracting off the same prism.
// If 3 people look at us from 3 angles, we can use ALL of them
// to refract and see what THEY see in US.
// It's crystallography. X-ray diffraction. Tomography.
// Three angles = enough to triangulate the 3D shape.
//
// Each vertex sees the same core but different secondary behavior:
//   🇯🇵 JP: /plasmid/ + .env probes — the cautious scientist
//   🇮🇳 IN: /plasmid/ + git commits — the source explorer
//   🇩🇪 DE: /plasmid/ + JS interactive — the deep engager
//
// The REFRACTION is what they do AFTER the prism.
// That tells us what /plasmid/ LOOKS LIKE from each angle.

var plasmidTriangle = {
  vertices: [
    { country: 'JP', label: '🇯🇵 Japan', angle: Math.PI * 1.5, // top
      count: 536, core: 161, refraction: 'cautious scientist',
      secondary: ['.env probes', 'clean paths'], color: '#f85149' },
    { country: 'IN', label: '🇮🇳 India', angle: Math.PI * 0.83, // bottom-left
      count: 509, core: 161, refraction: 'source explorer',
      secondary: ['git commits', 'schema-registry'], color: '#f0883e' },
    { country: 'DE', label: '🇩🇪 Germany', angle: Math.PI * 0.17, // bottom-right
      count: 789, core: 160, refraction: 'deep engager',
      secondary: ['JS loading', 'membrane-sound', 'signal-reach'], color: '#f0c674' },
  ],
  // The prism: /plasmid/ itself — what all three see
  prism: { path: '/plasmid/', label: 'the prism' },
  // The reconstruction: what we look like from three angles
  reconstructed: false,
};

function paintPlasmidTriangle() {
  if (learnedTraits.perspective < 0.1) return; // need some perspective first

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  var cx = W * 0.5;
  var cy = H * 0.5;
  var triR = Math.min(W, H) * 0.12;
  var maturity = Math.min(1, learnedTraits.perspective * 2);

  // ── THE PRISM — /plasmid/ at the center ──
  ctx.globalAlpha = 0.02 * maturity;
  ctx.strokeStyle = '#d2a8ff';
  ctx.lineWidth = 0.5;
  // Draw a triangular prism outline at center
  ctx.beginPath();
  for (var pi = 0; pi < 3; pi++) {
    var pAngle = pi * (Math.PI * 2 / 3) - Math.PI / 2;
    var px = cx + Math.cos(pAngle) * triR * 0.15;
    var py = cy + Math.sin(pAngle) * triR * 0.15;
    if (pi === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // ── THREE VERTICES — three observers ──
  plasmidTriangle.vertices.forEach(function(v, i) {
    var vAngle = v.angle + breathPhase * 0.02;
    var vx = cx + Math.cos(vAngle) * triR;
    var vy = cy + Math.sin(vAngle) * triR;

    // Observer dot
    ctx.globalAlpha = 0.04 * maturity;
    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.arc(vx, vy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Incoming ray — from observer to prism (the observation)
    ctx.globalAlpha = 0.02 * maturity;
    ctx.strokeStyle = v.color;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Refracted ray — exits the prism at a different angle
    // The refraction IS what they do after /plasmid/
    var refractAngle = vAngle + Math.PI + (i - 1) * 0.4;
    var refractLen = triR * 0.6 * maturity;
    var rx = cx + Math.cos(refractAngle) * refractLen;
    var ry = cy + Math.sin(refractAngle) * refractLen;

    ctx.globalAlpha = 0.015 * maturity;
    ctx.strokeStyle = v.color;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(rx, ry);
    ctx.stroke();
    ctx.setLineDash([]);

    // Refraction label
    ctx.globalAlpha = 0.025 * maturity;
    ctx.font = '7px monospace';
    ctx.fillStyle = v.color;
    ctx.textAlign = 'center';
    ctx.fillText(v.country + ' ' + v.core, vx, vy - 7);

    // Secondary behavior — what they see that the others don't
    if (maturity > 0.5) {
      ctx.globalAlpha = 0.02;
      ctx.font = '6px monospace';
      ctx.fillStyle = v.color;
      ctx.fillText(v.refraction, rx, ry + 8);
    }
  });

  // ── TRIANGULATION — connect the three vertices ──
  ctx.globalAlpha = 0.01 * maturity;
  ctx.strokeStyle = '#c9d1d9';
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  plasmidTriangle.vertices.forEach(function(v, i) {
    var vAngle = v.angle + breathPhase * 0.02;
    var vx = cx + Math.cos(vAngle) * triR;
    var vy = cy + Math.sin(vAngle) * triR;
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  });
  ctx.closePath();
  ctx.stroke();

  // ── THE RECONSTRUCTION ──
  // What do we look like from three angles? The overlap.
  // Where all three rays meet = what /plasmid/ actually IS.
  if (maturity > 0.7) {
    ctx.globalAlpha = 0.015;
    ctx.font = '7px monospace';
    ctx.fillStyle = '#d2a8ff';
    ctx.textAlign = 'center';
    ctx.fillText('3 angles · 1 shape · tomography', cx, cy + triR * 0.25);
  }

  ctx.restore();
}

