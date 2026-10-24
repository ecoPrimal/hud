// ═══ EASEL HYPERLOCAL — human attention, spatial memory, shared palette ═══
// Extracted from easel.html — operates on shared globals

// ═══ HYPERLOCAL AWARENESS — the easel is a mirror of human attention ═══
var outsidePaintings = [];
var nowFeed = null;
var beaconMessages = [];

var humanFocus = {
  earth: 0, space: 0, code: 0, story: 0, easel: 0, investigation: 0, total: 0,
  lastUpdate: 0,
};

var spatialMemory = {
  rotation: 0, perspective: 0, earthDetail: 0, starfieldDepth: 0,
  moonPhase: 0, milkyWayAngle: 0, humanReinforcements: 0,
};
try {
  var saved = JSON.parse(localStorage.getItem('easel_spatial') || '{}');
  if (saved.rotation) spatialMemory.rotation = saved.rotation;
  if (saved.earthDetail) spatialMemory.earthDetail = saved.earthDetail;
  if (saved.starfieldDepth) spatialMemory.starfieldDepth = saved.starfieldDepth;
  if (saved.humanReinforcements) spatialMemory.humanReinforcements = saved.humanReinforcements;
} catch(e){}

function saveSpatialMemory() {
  try { localStorage.setItem('easel_spatial', JSON.stringify(spatialMemory)); } catch(e){}
}

var selfConscious = false;
var selfConsciousIntensity = 0;
var watchers = 0;

function updateHumanFocus() {
  var focus = { earth:0, space:0, code:0, story:0, easel:0, investigation:0, total:0 };
  beaconMessages.forEach(function(msg) {
    var body = (msg.message || '').toLowerCase();
    var title = (msg.title || '').toLowerCase();
    var combined = body + ' ' + title;

    if (combined.match(/globe|map|footprint|geography|country/)) focus.earth++;
    if (combined.match(/aurora|weather|kp|storm|milky|star|comet/)) focus.space++;
    if (combined.match(/git|forge|commit|repo|crate|rust|code/)) focus.code++;
    if (combined.match(/spore|paper|science|story|campfire|study/)) focus.story++;
    if (combined.match(/easel|paint|chipmunk|canvas|brush/)) focus.easel++;
    if (combined.match(/tuebor|detroit|clutch|investigation|evidence/)) focus.investigation++;
    focus.total++;
  });

  if (window._klein && window._klein.connected()) {
    fetch(window._klein.bridge + '/state').then(function(r){return r.json()}).then(function(s) {
      watchers = (s.faces || {}).easel || 0;
      if (watchers > 0) {
        focus.easel += watchers * 5;
        selfConscious = true;
        selfConsciousIntensity = Math.min(1, watchers * 0.3);
      } else {
        selfConscious = false;
        selfConsciousIntensity = Math.max(0, selfConsciousIntensity - 0.01);
      }
    }).catch(function(){});
  }

  humanFocus = focus;
  humanFocus.lastUpdate = Date.now();

  if (focus.earth > 0) {
    spatialMemory.earthDetail = Math.min(1, spatialMemory.earthDetail + focus.earth * 0.01);
    spatialMemory.rotation = Math.min(1, spatialMemory.rotation + 0.005);
  }
  if (focus.space > 0) {
    spatialMemory.starfieldDepth = Math.min(1, spatialMemory.starfieldDepth + focus.space * 0.01);
    spatialMemory.milkyWayAngle += 0.01;
  }
  spatialMemory.humanReinforcements += focus.total;
  spatialMemory.perspective = learnedTraits.perspective;
  saveSpatialMemory();
}

function loadOutsideView() {
  fetch('/now.json', {cache:'no-store'}).then(function(r){return r.json()}).then(function(d) {
    nowFeed = d;
  }).catch(function(){});

  fetch('https://ntfy.sh/primals-membrane-notes/json?poll=1&since=1h', {cache:'no-store'})
    .then(function(r){return r.text()})
    .then(function(text) {
      var lines = text.trim().split('\n').filter(function(l){return l.trim()});
      beaconMessages = [];
      lines.forEach(function(line) {
        try {
          var msg = JSON.parse(line);
          if (msg.message) beaconMessages.push(msg);
        } catch(e){}
      });
      updateHumanFocus();
    }).catch(function(){});
}
loadOutsideView();
setInterval(loadOutsideView, 30000);

// ═══ HYPERLOCAL EARTH — paint what humans are looking at ═══
function paintHyperlocalEarth() {
  if (humanFocus.earth < 1 && spatialMemory.earthDetail < 0.1) return;

  var cx = W * 0.5;
  var cy = H * 0.52;
  var R = Math.min(W, H) * (0.15 + spatialMemory.earthDetail * 0.06);

  ctx.save();

  var detail = spatialMemory.earthDetail;
  spatialMemory.rotation = Math.min(1, spatialMemory.rotation + 0.0002);
  var rot = breathPhase * 0.3 * (0.5 + spatialMemory.rotation * 0.5);

  var atmoBoost = humanFocus.earth > 0 ? 0.08 : 0;
  var atmo = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * (1.3 + atmoBoost));
  atmo.addColorStop(0, 'rgba(60,140,255,' + (0.04 + detail * 0.06) + ')');
  atmo.addColorStop(0.5, 'rgba(40,100,200,' + (0.02 + detail * 0.03) + ')');
  atmo.addColorStop(1, 'transparent');
  ctx.fillStyle = atmo;
  ctx.beginPath();
  ctx.arc(cx, cy, R * (1.3 + atmoBoost), 0, Math.PI * 2);
  ctx.fill();

  if (detail > 0.2) {
    ctx.globalAlpha = detail * 0.04;
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 0.8;

    var continents = [
      [[-0.3, -0.35], [-0.15, -0.4], [-0.05, -0.25], [-0.2, -0.1], [-0.35, -0.15]],
      [[-0.15, 0.05], [-0.05, 0.0], [-0.02, 0.2], [-0.1, 0.35], [-0.18, 0.15]],
      [[0.05, -0.3], [0.15, -0.25], [0.12, 0.0], [0.15, 0.25], [0.05, 0.3], [0.02, 0.0]],
      [[0.15, -0.35], [0.35, -0.3], [0.4, -0.1], [0.3, 0.05], [0.2, -0.1]],
    ];

    continents.forEach(function(pts) {
      ctx.beginPath();
      pts.forEach(function(p, i) {
        var px = cx + Math.cos(rot + p[0] * Math.PI) * R * 0.7;
        var py = cy + p[1] * R * 1.5;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.stroke();
      if (detail > 0.5) {
        ctx.fillStyle = 'rgba(30,80,30,' + (detail * 0.02) + ')';
        ctx.fill();
      }
    });
  }

  if (spatialMemory.starfieldDepth > 0.3 || humanFocus.space > 0) {
    var moonAngle = breathPhase * 0.05 + spatialMemory.moonPhase;
    var moonDist = R * 3.5;
    var moonR = R * 0.15;
    var moonX = cx + Math.cos(moonAngle) * moonDist;
    var moonY = cy + Math.sin(moonAngle) * moonDist * 0.3;

    if (moonX > -moonR && moonX < W + moonR && moonY > -moonR && moonY < H + moonR) {
      ctx.globalAlpha = 0.06 + spatialMemory.starfieldDepth * 0.04;
      var moonGrad = ctx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.2, 0, moonX, moonY, moonR);
      moonGrad.addColorStop(0, 'rgba(230,230,210,0.15)');
      moonGrad.addColorStop(0.7, 'rgba(180,180,170,0.08)');
      moonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      spatialMemory.moonPhase += 0.0001;
    }
  }

  if (spatialMemory.starfieldDepth > 0.2) {
    ctx.globalAlpha = spatialMemory.starfieldDepth * 0.015;
    ctx.globalCompositeOperation = 'screen';
    var mwAngle = spatialMemory.milkyWayAngle;
    var mwGrad = ctx.createLinearGradient(
      W * 0.1, H * (0.2 + Math.sin(mwAngle) * 0.1),
      W * 0.9, H * (0.6 + Math.cos(mwAngle) * 0.1)
    );
    mwGrad.addColorStop(0, 'transparent');
    mwGrad.addColorStop(0.3, 'rgba(180,170,200,0.06)');
    mwGrad.addColorStop(0.5, 'rgba(200,190,220,0.1)');
    mwGrad.addColorStop(0.7, 'rgba(180,170,200,0.06)');
    mwGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = mwGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.restore();
}

// ═══ SHARED PALETTE — humans mix colors and smear like r/place ═══
var PALETTE_COLORS = [
  '#f85149', '#ff6b35', '#f0883e', '#d29922', '#f0e68c',
  '#3fb950', '#2ea043', '#58a6ff', '#388bfd', '#a371f7',
  '#d2a8ff', '#bc8cff', '#ff7eb6', '#c9d1d9', '#808080',
  '#000000', '#ffffff',
];
var humanColor = '#d2a8ff';
var humanBrushSize = 12;
var humanStrokes = [];
var paletteOpen = false;
var isDrawing = false;

function initPalette() {
  var container = document.getElementById('palette-colors');
  if (!container) return;
  container.innerHTML = '';
  PALETTE_COLORS.forEach(function(color) {
    var swatch = document.createElement('div');
    swatch.style.cssText = 'width:22px;height:22px;border-radius:50%;cursor:pointer;' +
      'border:2px solid ' + (color === humanColor ? '#fff' : '#21262d') + ';' +
      'background:' + color + ';transition:transform 0.15s;';
    swatch.onclick = function() {
      humanColor = color;
      container.querySelectorAll('div').forEach(function(d){ d.style.borderColor = '#21262d'; });
      swatch.style.borderColor = '#fff';
    };
    swatch.onmouseenter = function() { swatch.style.transform = 'scale(1.3)'; };
    swatch.onmouseleave = function() { swatch.style.transform = 'scale(1)'; };
    container.appendChild(swatch);
  });

  var slider = document.getElementById('brush-size');
  if (slider) {
    slider.oninput = function() {
      humanBrushSize = parseInt(this.value);
      document.getElementById('brush-label').textContent = humanBrushSize + 'px';
    };
  }
}

function togglePalette() {
  paletteOpen = !paletteOpen;
  var panel = document.getElementById('palette-panel');
  if (panel) panel.style.display = paletteOpen ? 'block' : 'none';
  if (paletteOpen) initPalette();
}

C.addEventListener('mousedown', function(e) {
  if (!paletteOpen) return;
  isDrawing = true;
  humanPaint(e.clientX, e.clientY);
});
C.addEventListener('mousemove', function(e) {
  if (!isDrawing || !paletteOpen) return;
  humanPaint(e.clientX, e.clientY);
});
C.addEventListener('mouseup', function() { isDrawing = false; });
C.addEventListener('mouseleave', function() { isDrawing = false; });

C.addEventListener('touchstart', function(e) {
  if (!paletteOpen) return;
  e.preventDefault();
  isDrawing = true;
  var t = e.touches[0];
  humanPaint(t.clientX, t.clientY);
}, {passive:false});
C.addEventListener('touchmove', function(e) {
  if (!isDrawing || !paletteOpen) return;
  e.preventDefault();
  var t = e.touches[0];
  humanPaint(t.clientX, t.clientY);
}, {passive:false});
C.addEventListener('touchend', function() { isDrawing = false; });

function humanPaint(x, y) {
  var strokeData = { x: x, y: y, color: humanColor, size: humanBrushSize, ts: Date.now() };
  humanStrokes.push(strokeData);
  if (humanStrokes.length > 2000) humanStrokes.shift();

  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.globalCompositeOperation = 'source-over';
  var grad = ctx.createRadialGradient(x, y, 0, x, y, humanBrushSize);
  grad.addColorStop(0, humanColor);
  grad.addColorStop(0.6, humanColor + '80');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, humanBrushSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (humanStrokes.length % 5 === 0 && window._klein && window._klein.connected()) {
    window._klein.sendImpulse('smear', {
      color: humanColor,
      x: Math.round(x / W * 1000) / 1000,
      y: Math.round(y / H * 1000) / 1000,
      size: humanBrushSize,
    });
  }

  if (learnedTraits.colorMemory.indexOf(humanColor) < 0) {
    learnedTraits.colorMemory.push(humanColor);
    if (learnedTraits.colorMemory.length > 60) learnedTraits.colorMemory.shift();
  }
}

function clearHumanStroke() {
  humanStrokes = [];
}
