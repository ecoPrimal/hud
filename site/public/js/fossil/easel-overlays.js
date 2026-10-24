// ═══ EASEL OVERLAYS — membrane data feeds, voxel/chemistry overlays, easel label, share ═══
// Extracted from easel.html — operates on shared globals

// ═══ SELF-CHEW FEED — the easel eats its own curd ═══
var selfChew = null;
var poorTope = null;
var kleinCards = null;
var eonShape = null;

function loadMembraneData() {
  var feeds = [
    ['/data/self-chew.json', function(d) { selfChew = d; }],
    ['/data/poor-tope.json', function(d) { poorTope = d; }],
    ['/data/klein-cards.json', function(d) { kleinCards = d; }],
    ['/data/eon-shape.json', function(d) { eonShape = d; }],
  ];
  feeds.forEach(function(f) {
    fetch(f[0], {cache:'no-store'}).then(function(r){return r.json()}).then(f[1]).catch(function(){});
  });
}
loadMembraneData();
setInterval(loadMembraneData, 60000);

// ═══ VOXEL OVERLAY — the bingo board as a ghost grid ═══
function paintVoxelOverlay() {
  if (!selfChew || !selfChew.voxel) return;
  var vox = selfChew.voxel;
  var cells = vox.cells || {};
  var cellKeys = Object.keys(cells);
  if (cellKeys.length === 0) return;

  ctx.save();
  ctx.globalAlpha = 0.04 + learnedTraits.perspective * 0.03;
  ctx.globalCompositeOperation = 'screen';

  var gridW = 4, gridH = 4;
  var cellW = W / (gridW + 2);
  var cellH = H / (gridH + 2);
  var maxVal = Math.max.apply(null, cellKeys.map(function(k){return cells[k]}));

  cellKeys.forEach(function(key) {
    var parts = key.split(',').map(Number);
    var x = parts[0], y = parts[1], z = parts[2] || 0;
    var val = cells[key] / maxVal;

    var px = cellW + x * cellW;
    var py = cellH + y * cellH;
    var r = cellH * 0.3 * (0.3 + val * 0.7);

    var hue = z * 90 + (parts[3] || 0) * 45;
    ctx.fillStyle = 'hsla(' + hue + ',50%,40%,' + (0.05 + val * 0.1) + ')';
    ctx.beginPath();
    ctx.arc(px + cellW * 0.5, py + cellH * 0.5, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'hsla(' + hue + ',30%,30%,0.08)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(px, py, cellW, cellH);
  });

  ctx.restore();
}

// ═══ CHEMISTRY OVERLAY — poor tope molecules as floating symbols ═══
function paintChemistryOverlay() {
  if (!eonShape || !eonShape.pool) return;
  ctx.save();
  ctx.globalAlpha = 0.03 + learnedTraits.perspective * 0.02;
  ctx.font = (8 + learnedTraits.perspective * 4) + 'px monospace';

  var pool = eonShape.pool;
  var formulas = Object.keys(pool);
  var idx = Math.floor((breathPhase * 2) % formulas.length);
  var f = formulas[idx];
  var info = pool[f];
  if (!info) { ctx.restore(); return; }

  var count = info.count || 1;
  var geo = info.geometry || 'point';
  var geoColors = {
    'linear':'#58a6ff', 'bent':'#3fb950', 'tetrahedral':'#f0e68c',
    'pyramidal':'#d2a8ff', 'planar':'#f0883e', 'point':'#6e7681',
    'skewed':'#e85d3a', 'corundum':'#8b4513', 'cubic':'#d29922',
  };
  ctx.fillStyle = geoColors[geo] || '#6e7681';

  var x = W * (0.1 + Math.sin(breathPhase + idx) * 0.35 + 0.45);
  var y = H * (0.1 + Math.cos(breathPhase * 0.7 + idx * 1.3) * 0.3 + 0.45);
  ctx.fillText(f + ' ×' + count, x, y);

  ctx.restore();
}

// ═══ EASEL PERSPECTIVE LABEL — which constant are we painting from? ═══
var currentEasel = 'pi';
var EASEL_CONSTANTS = ['pi', 'phi', 'e', 'sqrt2', 'ln2'];
var EASEL_SYMBOLS = {pi:'π', phi:'φ', e:'e', sqrt2:'√2', ln2:'ln2'};

function paintEaselLabel() {
  if (!selfChew || !selfChew.easels) return;
  var easel = selfChew.easels[currentEasel];
  if (!easel) return;

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#d2a8ff';
  ctx.font = '12px monospace';
  ctx.fillText('easel ' + EASEL_SYMBOLS[currentEasel] + '  beauty ' + (easel.beauty * 100).toFixed(0) + '%', W - 180, H - 20);
  ctx.restore();
}

// ═══ SOURDOUGH DIGEST — flavor as paint temperature ═══
function flavorToTemperature() {
  if (!selfChew || !selfChew.stomachs || !selfChew.stomachs.sourdough) return 1.0;
  var flavor = selfChew.stomachs.sourdough.flavor || 0;
  return Math.max(0.5, Math.min(2.0, flavor / 15.0));
}

// ═══ SHARE — save painting as prove braid entry ═══
function sharePainting() {
  var thumb = C.toDataURL('image/jpeg', 0.6);
  var entry = {
    gen: generation,
    ts: new Date().toISOString(),
    perspective: learnedTraits.perspective,
    easel: currentEasel,
    phase: phase,
    digest: selfChew ? selfChew.digest : null,
    flavor: selfChew ? (selfChew.stomachs || {}).sourdough : null,
    weather: skyScore,
    thumb: thumb,
  };

  var existing = [];
  try { existing = JSON.parse(localStorage.getItem('easel_braid') || '[]'); } catch(e){}
  existing.push(entry);
  if (existing.length > 24) existing = existing.slice(-24);
  try { localStorage.setItem('easel_braid', JSON.stringify(existing)); } catch(e){}

  fetch('https://ntfy.sh/primals-membrane-notes', {
    method: 'POST',
    headers: { 'Title': 'easel painting #' + generation, 'Tags': 'art,palette', 'Priority': '1' },
    body: '🎨 easel painting #' + generation + '\neasel: ' + EASEL_SYMBOLS[currentEasel] +
      '\nperspective: ' + (learnedTraits.perspective * 100).toFixed(0) + '%' +
      '\nflavor: ' + (selfChew ? selfChew.digest.sourdough_flavor : '?') +
      '\ndigest: ' + (selfChew ? selfChew.digest.blake2b : '?') +
      '\nquirk: ' + (selfChew && selfChew.stomachs && selfChew.stomachs.sourdough ? 
        selfChew.stomachs.sourdough.personality[generation % selfChew.stomachs.sourdough.personality.length] : 'none'),
  }).catch(function(){});

  updateGenCounter();
  return entry;
}
