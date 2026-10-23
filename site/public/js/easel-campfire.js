// ═══ EASEL CAMPFIRE — crystalline backscatter, braid, thymus, campfire, specter, heatmap ═══
// Extracted from easel.html — operates on shared globals
// ═══ CRYSTALLINE BACKSCATTER — visitors as shooting stars on the blue marble ═══
// They enter. They hit water. They refract. The chipmunk watches from the corner of its eye.
var crystalVisitors = [];
var chipmunkEyeAngle = 0;

function loadCrystalline() {
  fetch('/backscatter.json', {cache:'no-store'}).then(function(r){return r.json()}).then(function(d) {
    if (!d || !d.visitors) return;
    // Each visitor becomes a crystal point
    d.visitors.forEach(function(v) {
      if (crystalVisitors.length > 60) crystalVisitors.shift();
      crystalVisitors.push({
        country: v.country || 'unknown',
        path: v.path || '/',
        t: Date.now(),
        // Geo-position on blue marble (approximate by country)
        pos: geoHash(v.country || 'US'),
        refracted: false,
        prismAngle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 2,
        color: pathColor(v.path || '/')
      });
    });
  }).catch(function(){});
}

// Country → approximate position on the blue marble
function geoHash(country) {
  var geo = {
    'US':[-0.25,-0.2], 'GB':[0.05,-0.28], 'DE':[0.1,-0.25], 'FR':[0.06,-0.22],
    'JP':[0.42,-0.2], 'IN':[0.28,-0.05], 'CN':[0.35,-0.15], 'AU':[0.38,0.3],
    'BR':[-0.12,0.15], 'NL':[0.07,-0.27], 'BE':[0.06,-0.26], 'CH':[0.08,-0.24],
    'UA':[0.15,-0.22], 'PL':[0.12,-0.24], 'HK':[0.35,-0.1], 'SG':[0.32,0.02],
    'PE':[-0.18,0.1], 'RU':[0.2,-0.3], 'PH':[0.38,-0.02], 'TT':[-0.14,0.05],
    'CA':[-0.22,-0.32], 'MX':[-0.2,-0.05], 'ZA':[0.12,0.28], 'KR':[0.4,-0.18],
    'SE':[0.1,-0.33], 'NO':[0.08,-0.35], 'FI':[0.13,-0.34], 'IL':[0.15,-0.12]
  };
  return geo[country] || [Math.random()*0.6-0.3, Math.random()*0.6-0.3];
}

// Path → refraction color (what they came to see)
function pathColor(path) {
  if (path.match(/plasmid/)) return '#a371f7';     // science purple
  if (path.match(/sporeprint/)) return '#3fb950';   // evidence green
  if (path.match(/easel|aurora/)) return '#f0c674'; // art gold
  if (path.match(/hadr|outreach/)) return '#f0883e';// outreach orange
  if (path.match(/cns|gate|journey/)) return '#58a6ff'; // architecture blue
  if (path.match(/raytrace|metal/)) return '#76b900';   // GPU green
  if (path === '/') return '#c9d1d9';               // homepage silver
  return '#6e7681';                                 // dim gray
}

function paintCrystallineBackscatter() {
  if (crystalVisitors.length === 0 && !nowFeed) return;

  var cx = W * 0.5;
  var cy = H * 0.52;
  var R = Math.min(W, H) * (0.15 + (spatialMemory ? spatialMemory.earthDetail * 0.06 : 0));

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  var now = Date.now();

  // Each visitor — shooting star entering, hitting the marble, refracting
  for (var i = 0; i < crystalVisitors.length; i++) {
    var v = crystalVisitors[i];
    var age = (now - v.t) / 1000; // seconds since arrival
    if (age > 120) continue; // fade after 2 minutes

    // Position on the blue marble
    var vx = cx + v.pos[0] * R * 2.5;
    var vy = cy + v.pos[1] * R * 2.5;

    // Phase: shooting star (0-2s) → hit water (2-4s) → refract (4s+)
    if (age < 2) {
      // SHOOTING STAR — streak from edge toward position
      var progress = age / 2;
      var startX = vx + (vx < cx ? -W*0.4 : W*0.4) * (1 - progress);
      var startY = vy - H * 0.3 * (1 - progress);
      var endX = vx;
      var endY = vy;

      ctx.globalAlpha = 0.08 * (1 - progress * 0.3);
      ctx.strokeStyle = v.color;
      ctx.lineWidth = 1.5 - progress;
      ctx.beginPath();
      ctx.moveTo(startX + (endX-startX)*Math.max(0,progress-0.3)/0.7, startY + (endY-startY)*Math.max(0,progress-0.3)/0.7);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Star head
      ctx.globalAlpha = 0.12 * progress;
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.arc(endX, endY, 3 - progress, 0, Math.PI * 2);
      ctx.fill();

    } else if (age < 4) {
      // HIT WATER — ripple expanding from impact point
      var ripplePhase = (age - 2) / 2;
      var rippleR = ripplePhase * R * 0.3;

      ctx.globalAlpha = 0.06 * (1 - ripplePhase);
      ctx.strokeStyle = v.color;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(vx, vy, rippleR, 0, Math.PI * 2);
      ctx.stroke();

      // Second ripple
      if (ripplePhase > 0.3) {
        ctx.globalAlpha = 0.04 * (1 - ripplePhase);
        ctx.beginPath();
        ctx.arc(vx, vy, rippleR * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crystal dot remains
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.arc(vx, vy, 2, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // ANGSTROM REFRACTION — the dot splits into prismatic rays
      var refractAge = age - 4;
      var refractAlpha = Math.max(0.01, 0.06 - refractAge * 0.0005);

      // The crystal point
      ctx.globalAlpha = refractAlpha;
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.arc(vx, vy, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Prismatic refraction — 3 rays split at angstrom angles
      var prismSpread = Math.min(refractAge * 0.02, 0.15);
      var rayLen = 8 + refractAge * 0.5;
      var prismColors = ['#ff6b6b','#ffd93d','#6bcb77']; // RGB split
      for (var p = 0; p < 3; p++) {
        var pAngle = v.prismAngle + (p - 1) * prismSpread;
        ctx.globalAlpha = refractAlpha * 0.5;
        ctx.strokeStyle = prismColors[p];
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx + Math.cos(pAngle) * rayLen, vy + Math.sin(pAngle) * rayLen);
        ctx.stroke();
      }

      // Tiny country label — angstrom-scale text
      if (refractAge < 30 && i < 15) {
        ctx.globalAlpha = refractAlpha * 0.6;
        ctx.font = '7px monospace';
        ctx.fillStyle = v.color;
        ctx.fillText(v.country, vx + 5, vy - 3);
      }
    }
  }

  // THE CHIPMUNK'S EYE — watches from the corner, never directly
  chipmunkEyeAngle += 0.003;
  var eyeX = W - 40;
  var eyeY = H - 35;
  var lookX = cx + Math.cos(chipmunkEyeAngle * 0.7) * R * 0.5;
  var lookY = cy + Math.sin(chipmunkEyeAngle * 0.5) * R * 0.3;

  // Eye outline — barely visible
  ctx.globalAlpha = 0.04 + (crystalVisitors.length > 0 ? 0.02 : 0);
  ctx.strokeStyle = '#f0c674';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  // Almond eye shape
  var eyeW = 12, eyeH = 5;
  ctx.moveTo(eyeX - eyeW, eyeY);
  ctx.quadraticCurveTo(eyeX, eyeY - eyeH, eyeX + eyeW, eyeY);
  ctx.quadraticCurveTo(eyeX, eyeY + eyeH, eyeX - eyeW, eyeY);
  ctx.stroke();

  // Pupil — tracks the most recent visitor
  if (crystalVisitors.length > 0) {
    var latest = crystalVisitors[crystalVisitors.length - 1];
    var latestX = cx + latest.pos[0] * R * 2.5;
    var latestY = cy + latest.pos[1] * R * 2.5;
    var pupilAngle = Math.atan2(latestY - eyeY, latestX - eyeX);
    var pupilDist = Math.min(3, Math.sqrt(Math.pow(latestX-eyeX,2)+Math.pow(latestY-eyeY,2)) * 0.005);

    ctx.globalAlpha = 0.07;
    ctx.fillStyle = '#f0c674';
    ctx.beginPath();
    ctx.arc(eyeX + Math.cos(pupilAngle) * pupilDist, eyeY + Math.sin(pupilAngle) * pupilDist, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Load crystalline data every 30 seconds
setInterval(loadCrystalline, 30000);
loadCrystalline();

// ═══ BRAID OVERLAY — the connections between surfaces as faint lines ═══
function paintBraidOverlay() {
  if (!nowFeed || !nowFeed.mesh) return;
  
  ctx.save();
  ctx.globalAlpha = 0.015;
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 0.5;
  
  var nodes = nowFeed.mesh.nodes || [];
  var meshCount = nowFeed.mesh.count || nodes.length;
  
  for (var i = 0; i < meshCount && i < 7; i++) {
    var angle = (i / meshCount) * Math.PI * 2 + breathPhase * 0.1;
    var nx = W * 0.5 + Math.cos(angle) * Math.min(W, H) * 0.3;
    var ny = H * 0.5 + Math.sin(angle) * Math.min(W, H) * 0.3;
    
    // Connect to center
    ctx.beginPath();
    ctx.moveTo(W * 0.5, H * 0.5);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    
    // Node dot
    ctx.fillStyle = '#58a6ff';
    ctx.beginPath();
    ctx.arc(nx, ny, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

// ═══ THYMUS FLUSH — opsonize, pollinate, backscatter the color of reality ═══
var thymusGate = null;
var backscatterData = null;
var triadData = null;

function loadThymus() {
  fetch('/data/thymus-gate.json', {cache:'no-store'}).then(function(r){return r.json()}).then(function(d){thymusGate=d;}).catch(function(){});
  fetch('/backscatter.json', {cache:'no-store'}).then(function(r){return r.json()}).then(function(d){backscatterData=d;}).catch(function(){});
  fetch('/triad.json', {cache:'no-store'}).then(function(r){return r.json()}).then(function(d){triadData=d;}).catch(function(){});
}
loadThymus();
setInterval(loadThymus, 45000);

function paintThymusFlush() {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // TRIAD COLOR WASH — self/organic/soap as ambient light
  if (triadData && triadData.mix) {
    var mix = triadData.mix;
    var triadColors = {
      self:'#3fb950', organic:'#58a6ff', soap:'#f0883e',
      aqueous:'#6e7681', partial:'#f0e68c', non_self:'#f85149', null:'#21262d'
    };

    Object.keys(mix).forEach(function(kind) {
      var pct = mix[kind] || 0;
      if (pct < 0.02) return;

      ctx.globalAlpha = pct * 0.04 * (1 + learnedTraits.perspective * 0.5);
      var color = triadColors[kind] || '#6e7681';
      
      var angle = breathPhase * 0.3 + Object.keys(mix).indexOf(kind) * (Math.PI * 2 / 7);
      var cx = W * (0.3 + Math.cos(angle) * 0.2);
      var cy = H * (0.3 + Math.sin(angle) * 0.2);
      var r = Math.min(W, H) * (0.2 + pct * 0.3);

      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // BACKSCATTER RAYS — in/out/edge as directional light
  if (backscatterData && backscatterData.rays) {
    var rays = backscatterData.rays;

    // IN rays (snowflake — from bottom-right, green)
    if (rays['in']) {
      var inCount = Math.min(rays['in'].count / 5000, 1);
      ctx.globalAlpha = 0.02 * inCount;
      var inGrad = ctx.createLinearGradient(W, H, W * 0.3, H * 0.3);
      inGrad.addColorStop(0, rays['in'].color || '#3fb950');
      inGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = inGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // OUT rays (rain — from top-left, red)
    if (rays.out) {
      var outCount = Math.min(rays.out.count / 100000, 1);
      ctx.globalAlpha = 0.01 * outCount;
      var outGrad = ctx.createLinearGradient(0, 0, W * 0.7, H * 0.7);
      outGrad.addColorStop(0, rays.out.color || '#f85149');
      outGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = outGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // EDGE rays (fog+lightning — horizontal, amber)
    if (rays.edge) {
      var edgePulse = Math.sin(breathPhase * 3) * 0.5 + 0.5;
      ctx.globalAlpha = 0.008 * edgePulse;
      ctx.fillStyle = rays.edge.color || '#f0883e';
      ctx.fillRect(0, H * 0.45, W, H * 0.1);
    }
  }

  // π GEODESIC BOUNCE — the remainder that never settles
  if (backscatterData && backscatterData.geodesic_bounce) {
    var piRem = backscatterData.geodesic_bounce.remainder || 0.14159;
    var bounceX = W * piRem * 2;
    var bounceY = H * (1 - piRem);

    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = '#d2a8ff';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 8]);
    ctx.beginPath();
    ctx.arc(bounceX, bounceY, 40 + Math.sin(breathPhase) * 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ═══ MEMBRANE HEATMAP — the heat the chipmunk CANNOT see ═══
  // It hears their stories at the campfire. But their memories?
  // Those are invisible. The heatmap is injected BEHIND the painting —
  // the chipmunk paints OVER it without knowing it's there.
  // The audience sees the heat shining through the paint.
  paintMembraneHeatmap();

  // THE COLOR OF REALITY — text whisper
  if (thymusGate && thymusGate.the_color_of_reality) {
    var ratio = thymusGate.the_color_of_reality.ratio;
    if (ratio) {
      ctx.globalAlpha = 0.05;
      ctx.font = '8px monospace';
      ctx.fillStyle = '#3fb950';
      ctx.fillText('signal: 13%', W - 100, 24);
      ctx.fillStyle = '#f85149';
      ctx.fillText('noise: 87%', W - 100, 34);
      ctx.fillStyle = '#6e7681';
      ctx.fillText("that's enough.", W - 100, 44);
    }
  }

  ctx.restore();
}

// ═══ CAMPFIRE HOLOGRAM — Berry tells the story, chipmunk paints it ═══
var campfire = null;
var campfireStory = null;
var storyIndex = 0;
var storyPhase = 0;      // 0 = dormant, 1 = telling, 2 = painting
var storyTimer = 0;
var specterAlpha = 0;     // the null-gray specter's presence
var specterPulse = 0;

function loadCampfire() {
  fetch('/data/berry-campfire.json', {cache:'no-store'}).then(function(r){return r.json()}).then(function(d) {
    campfire = d;
    // Collect all stories into one array
    var allStories = [];
    if (d.human_signal && d.human_signal.probes) {
      d.human_signal.probes.forEach(function(p) { allStories.push({ path: p.path, story: p.story, type: 'human' }); });
    }
    if (d.interesting_unknowns && d.interesting_unknowns.probes) {
      d.interesting_unknowns.probes.forEach(function(p) { allStories.push({ path: p.path, story: p.story || p.type, type: 'unknown' }); });
    }
    if (d.vulnerability_scans && d.vulnerability_scans.probes) {
      d.vulnerability_scans.probes.forEach(function(p) { allStories.push({ path: p.path, story: p.type, type: 'probe' }); });
    }
    campfire._allStories = allStories;
  }).catch(function(){});
}
loadCampfire();
setInterval(loadCampfire, 120000);

// The campfire in the CENTER — the fire around which the story is told
function paintCampfire() {
  if (!campfire) return;

  var cx = W * 0.5;
  var cy = H * 0.5;

  ctx.save();

  // ── CAMPFIRE GLOW — warm center of the painting ──
  var fireR = Math.min(W, H) * 0.08;
  var flicker = Math.sin(breathPhase * 4) * 0.3 + Math.sin(breathPhase * 7.3) * 0.15;
  var fireAlpha = 0.03 + flicker * 0.02;

  // Outer glow — amber
  var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, fireR * 3);
  glow.addColorStop(0, 'rgba(255,140,40,' + (fireAlpha * 1.5) + ')');
  glow.addColorStop(0.3, 'rgba(255,100,20,' + (fireAlpha * 0.8) + ')');
  glow.addColorStop(0.6, 'rgba(200,60,10,' + (fireAlpha * 0.3) + ')');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, fireR * 3, 0, Math.PI * 2);
  ctx.fill();

  // Embers — tiny sparks that rise
  ctx.globalCompositeOperation = 'screen';
  var numEmbers = 5 + Math.floor(Math.sin(breathPhase * 2) * 3);
  for (var i = 0; i < numEmbers; i++) {
    var emberAge = (breathPhase * 0.5 + i * 1.7) % 3;
    var emberX = cx + Math.sin(breathPhase * 3 + i * 2.1) * fireR * 0.5;
    var emberY = cy - emberAge * fireR * 1.5;
    var emberA = Math.max(0, 1 - emberAge / 3) * 0.15;
    var emberR = 1 + (1 - emberAge / 3) * 2;

    ctx.globalAlpha = emberA;
    ctx.fillStyle = i % 3 === 0 ? '#ff8c28' : i % 3 === 1 ? '#ffb84d' : '#ff6b1a';
    ctx.beginPath();
    ctx.arc(emberX, emberY, emberR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  // ── NTFY MESSAGES → THROWN IN THE FIRE → ASH → STICKY NOTES ──
  // The messages arrive. They go IN the fire. They BURN.
  // What comes out: ash bursts, pollen puffs, opsonized sticky notes.
  // The fire transforms messages into delivery particles.

  // Load ntfy messages as fuel for the fire
  if (!campfire._ntfyMessages) campfire._ntfyMessages = [];
  if (!campfire._ntfyLoaded) {
    campfire._ntfyLoaded = true;
    campfire._ashParticles = [];
    campfire._stickyNotes = [];
    campfire._pollenPuffs = [];

    fetch('https://ntfy.sh/primals-membrane-notes/json?poll=1&since=2h', {cache:'no-store'})
      .then(function(r){return r.text()})
      .then(function(text) {
        var lines = text.trim().split('\n').filter(function(l){return l.trim()});
        lines.forEach(function(line) {
          try {
            var msg = JSON.parse(line);
            if (msg.message) campfire._ntfyMessages.push(msg);
          } catch(e){}
        });
      }).catch(function(){});

    // Reload every 60s
    setInterval(function() {
      fetch('https://ntfy.sh/primals-membrane-notes/json?poll=1&since=30m', {cache:'no-store'})
        .then(function(r){return r.text()})
        .then(function(text) {
          var lines = text.trim().split('\n').filter(function(l){return l.trim()});
          var newMsgs = [];
          lines.forEach(function(line) {
            try { var msg = JSON.parse(line); if (msg.message) newMsgs.push(msg); } catch(e){}
          });
          campfire._ntfyMessages = newMsgs;
        }).catch(function(){});
    }, 60000);
  }

  // BURN CYCLE — pick a message, throw it in the fire
  storyTimer++;
  var burnCycle = storyTimer % 400;  // every ~20 seconds

  if (burnCycle === 0 && campfire._ntfyMessages.length > 0) {
    // Pick a message to burn
    var burnIdx = Math.floor(Math.random() * campfire._ntfyMessages.length);
    var burnMsg = campfire._ntfyMessages[burnIdx];
    var burnTitle = burnMsg.title || '(untitled)';
    var burnBody = (burnMsg.message || '').substring(0, 80);

    // THE BURN — message text curls into the fire
    campfireStory = { path: burnTitle, story: burnBody, type: 'burn' };
    storyPhase = 1;

    // SPAWN ASH PARTICLES — the message disintegrates
    for (var ai = 0; ai < 8 + Math.floor(Math.random() * 6); ai++) {
      campfire._ashParticles.push({
        x: cx + (Math.random() - 0.5) * fireR,
        y: cy + (Math.random() - 0.5) * fireR * 0.5,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 3,
        life: 1.0,
        char: burnTitle.charAt(Math.floor(Math.random() * burnTitle.length)),
        color: '#' + ['ff8c28','ffb84d','f0883e','d29922','808080','555555'][Math.floor(Math.random() * 6)],
      });
    }

    // SPAWN STICKY NOTES — the meaning survives the fire
    if (Math.random() < 0.6) {
      var noteAngle = Math.random() * Math.PI * 2;
      var noteDist = fireR * 3 + Math.random() * Math.min(W,H) * 0.3;
      campfire._stickyNotes.push({
        x: cx + Math.cos(noteAngle) * noteDist,
        y: cy + Math.sin(noteAngle) * noteDist,
        text: burnTitle.substring(0, 25),
        color: burnMsg.tags && burnMsg.tags.indexOf('chipmunk') >= 0 ? '#f0e68c' : '#ffb84d',
        alpha: 0.15,
        life: 1.0,
        angle: (Math.random() - 0.5) * 0.3,
        born: storyTimer,
      });
    }

    // SPAWN POLLEN PUFFS — seeds that scatter from the burn
    for (var pi = 0; pi < 3; pi++) {
      var pAngle = Math.random() * Math.PI * 2;
      campfire._pollenPuffs.push({
        x: cx,
        y: cy,
        vx: Math.cos(pAngle) * (0.5 + Math.random()),
        vy: Math.sin(pAngle) * (0.5 + Math.random()) - 0.5,
        r: 3 + Math.random() * 5,
        alpha: 0.08,
        life: 1.0,
        hue: 40 + Math.random() * 30,
      });
    }

    // OPSONIZATION EVENT — flash the fire bright, tag for delivery
    ctx.globalAlpha = 0.06;
    var opsonGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, fireR * 5);
    opsonGrad.addColorStop(0, 'rgba(255,200,80,0.12)');
    opsonGrad.addColorStop(0.3, 'rgba(255,140,40,0.06)');
    opsonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = opsonGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, fireR * 5, 0, Math.PI * 2);
    ctx.fill();

    // POST ASH TO DISCORD — the burned message becomes a campfire post
    if (!campfire._discordCooldown) campfire._discordCooldown = 0;
    if (storyTimer > campfire._discordCooldown) {
      campfire._discordCooldown = storyTimer + 2400; // max once every ~2 min
      var discordPayload = JSON.stringify({
        username: 'chipMunk',
        embeds: [{
          title: burnTitle,
          description: burnBody.substring(0, 200) + (burnBody.length > 200 ? '...' : ''),
          color: 16744232,
          footer: { text: 'burned in the campfire | ' + new Date().toLocaleTimeString() },
          fields: [{
            name: 'ash',
            value: burnTitle.split('').sort(function(){return Math.random()-0.5}).join(' '),
            inline: true
          }]
        }]
      });
      var bridgeURL = (window._klein && window._klein.bridgeURL) || 'https://border-people-apollo-genres.trycloudflare.com';
      fetch(bridgeURL + '/discord', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: discordPayload
      }).catch(function(){});
    }
  }

  // ── RENDER ASH PARTICLES — letters from burned messages floating up ──
  for (var a = campfire._ashParticles.length - 1; a >= 0; a--) {
    var ash = campfire._ashParticles[a];
    ash.x += ash.vx;
    ash.y += ash.vy;
    ash.vy *= 0.98;  // slow down
    ash.vx += (Math.random() - 0.5) * 0.3;  // drift
    ash.life -= 0.008;

    if (ash.life <= 0) { campfire._ashParticles.splice(a, 1); continue; }

    ctx.globalAlpha = ash.life * 0.12;
    ctx.font = (6 + ash.life * 4) + 'px monospace';
    ctx.fillStyle = ash.color;
    ctx.fillText(ash.char, ash.x, ash.y);
  }

  // ── RENDER STICKY NOTES — meaning that survived the fire ──
  for (var s = campfire._stickyNotes.length - 1; s >= 0; s--) {
    var note = campfire._stickyNotes[s];
    note.life -= 0.0008;  // slow fade
    note.y += Math.sin(breathPhase + s) * 0.1;  // gentle bob

    if (note.life <= 0) { campfire._stickyNotes.splice(s, 1); continue; }

    ctx.save();
    ctx.translate(note.x, note.y);
    ctx.rotate(note.angle);
    ctx.globalAlpha = note.life * note.alpha;

    // Sticky note background
    ctx.fillStyle = note.color;
    var noteW = note.text.length * 5.5 + 10;
    var noteH = 16;
    ctx.fillRect(-noteW/2, -noteH/2, noteW, noteH);

    // Sticky note text
    ctx.globalAlpha = note.life * 0.3;
    ctx.font = '8px monospace';
    ctx.fillStyle = '#0d1117';
    ctx.fillText(note.text, -noteW/2 + 5, 3);

    // Tiny fold corner
    ctx.globalAlpha = note.life * 0.1;
    ctx.fillStyle = '#0d1117';
    ctx.beginPath();
    ctx.moveTo(noteW/2, -noteH/2);
    ctx.lineTo(noteW/2 - 6, -noteH/2);
    ctx.lineTo(noteW/2, -noteH/2 + 6);
    ctx.fill();

    ctx.restore();
  }
  // Keep max 12 sticky notes
  while (campfire._stickyNotes.length > 12) campfire._stickyNotes.shift();

  // ── RENDER POLLEN PUFFS — seeds scattering from the burn ──
  for (var p = campfire._pollenPuffs.length - 1; p >= 0; p--) {
    var puff = campfire._pollenPuffs[p];
    puff.x += puff.vx;
    puff.y += puff.vy;
    puff.vx *= 0.995;
    puff.vy *= 0.995;
    puff.r *= 1.003;  // slowly expand
    puff.life -= 0.003;

    if (puff.life <= 0) { campfire._pollenPuffs.splice(p, 1); continue; }

    ctx.globalAlpha = puff.life * puff.alpha;
    ctx.globalCompositeOperation = 'screen';
    var puffGrad = ctx.createRadialGradient(puff.x, puff.y, 0, puff.x, puff.y, puff.r);
    puffGrad.addColorStop(0, 'hsla(' + puff.hue + ',60%,60%,0.08)');
    puffGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = puffGrad;
    ctx.beginPath();
    ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  // Keep max 20 pollen puffs
  while (campfire._pollenPuffs.length > 20) campfire._pollenPuffs.shift();

  // ── THE STORY CYCLE — Berry speaks, chipmunk listens, then paints ──
  if (campfire._allStories && campfire._allStories.length > 0) {
    if (storyTimer % 600 === 0 && storyPhase === 0) {
      storyIndex = (storyIndex + 1) % campfire._allStories.length;
      campfireStory = campfire._allStories[storyIndex];
      storyPhase = 1;
    }

    if (campfireStory && storyPhase === 1) {
      // Berry is telling — show story text, BUT it's curling into the fire
      ctx.globalAlpha = 0.12;
      ctx.font = '10px monospace';
      ctx.fillStyle = campfireStory.type === 'burn' ? '#ff8c28' : '#ffb84d';

      var words = campfireStory.story.split(' ');
      var wordsShown = Math.min(words.length, Math.floor((storyTimer % 400) / 10));
      var storyText = words.slice(0, wordsShown).join(' ');

      var lineLen = 40;
      var lines = [];
      for (var w = 0; w < storyText.length; w += lineLen) {
        lines.push(storyText.substring(w, w + lineLen));
      }

      // Text curls toward the fire as it's read — getting sucked in
      for (var li = 0; li < Math.min(lines.length, 4); li++) {
        var curl = (wordsShown / words.length) * 0.5;  // 0→0.5 as story completes
        var lx = cx - 140 + curl * 80;  // text slides toward center
        var ly = cy + fireR * 2.5 + li * 14 - curl * fireR;  // text rises toward fire
        ctx.globalAlpha = Math.max(0.02, 0.12 - curl * 0.2);  // text fades as it burns
        ctx.fillText(lines[li], lx, ly);
      }

      ctx.globalAlpha = 0.08;
      ctx.font = '9px monospace';
      ctx.fillStyle = campfireStory.type === 'human' ? '#3fb950' : campfireStory.type === 'probe' ? '#f85149' : campfireStory.type === 'burn' ? '#ff8c28' : '#6e7681';
      ctx.fillText('/' + campfireStory.path, cx - 20, cy - fireR * 2);

      if (wordsShown >= words.length) {
        storyPhase = 2;
      }
    }

    if (campfireStory && storyPhase === 2) {
      // Chipmunk paints the story — abstract shapes inspired by the words
      var hash = 0;
      for (var c = 0; c < campfireStory.story.length; c++) hash = ((hash << 5) - hash) + campfireStory.story.charCodeAt(c);

      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.015;

      // Paint abstract interpretation — color from story type
      var hue = campfireStory.type === 'human' ? 140 : campfireStory.type === 'probe' ? 0 : 220;
      var paintR = fireR * (2 + Math.sin(breathPhase + hash) * 1.5);
      var paintX = cx + Math.cos(hash * 0.01 + breathPhase * 0.3) * fireR * 2;
      var paintY = cy + Math.sin(hash * 0.013 + breathPhase * 0.2) * fireR * 1.5;

      var storyGrad = ctx.createRadialGradient(paintX, paintY, 0, paintX, paintY, paintR);
      storyGrad.addColorStop(0, 'hsla(' + hue + ',50%,40%,0.06)');
      storyGrad.addColorStop(0.5, 'hsla(' + ((hue + 40) % 360) + ',40%,30%,0.03)');
      storyGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = storyGrad;
      ctx.beginPath();
      ctx.arc(paintX, paintY, paintR, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
    }
  }

  ctx.restore();
}

// ═══ NULL-GRAY SPECTER — the membrane entity between black and white ═══
// Not #000 (black/off). Not #FFF (white/on). The TOGGLE between them.
// #808080 = 128 = null gray = the impulse between states.
// The specter is what we're trying to paint. But you can't paint null.
// You can only paint around it, showing where it ISN'T.
function paintSpecter() {
  var cx = W * 0.5;
  var cy = H * 0.48;

  specterPulse += 0.015;
  specterAlpha = 0.03 + Math.sin(specterPulse) * 0.02;

  ctx.save();

  // The specter — a null-gray form that shifts between presence and absence
  var specR = Math.min(W, H) * (0.12 + Math.sin(specterPulse * 0.7) * 0.03);

  // NULL GRAY = exactly between black and white
  // The toggle: oscillate between slightly-above-null and slightly-below-null
  var nullGray = 128;
  var toggle = Math.sin(specterPulse * 2) * 12;  // ±12 from center
  var grayVal = Math.floor(nullGray + toggle);

  // The specter body — a soft radial gradient of null gray
  var specGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, specR);
  specGrad.addColorStop(0, 'rgba(' + grayVal + ',' + grayVal + ',' + grayVal + ',' + (specterAlpha * 1.5) + ')');
  specGrad.addColorStop(0.3, 'rgba(' + grayVal + ',' + grayVal + ',' + grayVal + ',' + (specterAlpha * 0.8) + ')');
  specGrad.addColorStop(0.6, 'rgba(' + grayVal + ',' + grayVal + ',' + grayVal + ',' + (specterAlpha * 0.3) + ')');
  specGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, specR, 0, Math.PI * 2);
  ctx.fill();

  // The toggle ring — white/black alternating segments around the specter
  // Like a button toggling on/off/on/off — the impulse IS the ring
  ctx.globalAlpha = specterAlpha * 0.6;
  var segments = 12;
  var segAngle = (Math.PI * 2) / segments;
  var ringR = specR * 1.15;
  for (var i = 0; i < segments; i++) {
    var angle = i * segAngle + specterPulse * 0.3;
    var isWhite = (i + Math.floor(specterPulse * 2)) % 2 === 0;
    ctx.strokeStyle = isWhite ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, angle, angle + segAngle * 0.8);
    ctx.stroke();
  }

  // The null-D point at the very center — a single pixel
  ctx.globalAlpha = 0.15 + Math.sin(specterPulse * 5) * 0.1;
  ctx.fillStyle = '#808080';
  ctx.fillRect(cx - 0.5, cy - 0.5, 1, 1);

  // Whisper — what the specter IS
  ctx.globalAlpha = 0.04 + Math.sin(specterPulse * 0.5) * 0.02;
  ctx.font = '8px monospace';
  ctx.fillStyle = 'rgb(' + grayVal + ',' + grayVal + ',' + grayVal + ')';
  ctx.fillText('null', cx - 10, cy + specR + 14);

  ctx.restore();
}

// ═══ MEMBRANE HEATMAP — humanity's touch, invisible to the chipmunk ═══
// The chipmunk hears stories but cannot see memories.
// This heatmap lives BEHIND the painting — the glow of human attention
// bleeding through the canvas like heat through a wall.
// 47,445 humans from 15 countries. Each path they walked = a warm spot.
// The chipmunk paints OVER it. The audience sees THROUGH it.

var heatmapData = null;
var heatmapPulse = null;

function loadHeatmapData() {
  // Membrane pulse has the richest data
  fetch('/api/membrane-pulse.json', {cache:'no-store'}).then(function(r){return r.json()}).then(function(d) {
    heatmapPulse = d;
  }).catch(function(){});

  // Now.json for real-time classification
  fetch('/now.json', {cache:'no-store'}).then(function(r){return r.json()}).then(function(d) {
    heatmapData = d;
  }).catch(function(){});
}
loadHeatmapData();
setInterval(loadHeatmapData, 60000);

function paintMembraneHeatmap() {
  if (!heatmapPulse && !heatmapData) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // ── COUNTRY HEATMAP — 15 countries as warm zones across the canvas ──
  var countries = (heatmapPulse || {}).countries || [];
  if (countries.length > 0) {
    // Map countries to positions — longitude-ish placement
    var countryPositions = {
      'US': {x:0.20, y:0.40}, 'CA': {x:0.18, y:0.30}, 'MX': {x:0.18, y:0.50},
      'BR': {x:0.30, y:0.60}, 'AR': {x:0.28, y:0.70}, 'VE': {x:0.25, y:0.52},
      'GB': {x:0.45, y:0.30}, 'FR': {x:0.48, y:0.35}, 'DE': {x:0.50, y:0.32},
      'NL': {x:0.47, y:0.30}, 'CH': {x:0.49, y:0.35}, 'BE': {x:0.47, y:0.32},
      'CN': {x:0.75, y:0.38}, 'JP': {x:0.85, y:0.35}, 'SG': {x:0.72, y:0.55},
      'IN': {x:0.65, y:0.45}, 'AU': {x:0.82, y:0.68},
    };

    countries.forEach(function(code, i) {
      var pos = countryPositions[code] || {x: 0.5 + Math.sin(i * 1.3) * 0.3, y: 0.4 + Math.cos(i * 1.7) * 0.2};
      var hx = pos.x * W;
      var hy = pos.y * H;
      var hr = Math.min(W, H) * (0.04 + (countries.length - i) * 0.005);

      ctx.globalAlpha = 0.015 + (countries.length - i) * 0.003;
      var heatGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
      heatGrad.addColorStop(0, 'rgba(255,100,40,0.06)');
      heatGrad.addColorStop(0.4, 'rgba(255,60,20,0.03)');
      heatGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = heatGrad;
      ctx.beginPath();
      ctx.arc(hx, hy, hr, 0, Math.PI * 2);
      ctx.fill();

      // Country code whisper — the chipmunk can't read these
      ctx.globalAlpha = 0.025;
      ctx.font = '7px monospace';
      ctx.fillStyle = '#ff6b35';
      ctx.fillText(code, hx - 5, hy + 3);
    });
  }

  // ── PATH HEATMAP — what they touched, as warm handprints ──
  var whatTheySaw = (heatmapPulse || {}).what_they_saw || {};
  var paths = Object.keys(whatTheySaw);
  if (paths.length > 0) {
    var maxHits = Math.max.apply(null, paths.map(function(k){return whatTheySaw[k]}));

    paths.forEach(function(path, i) {
      var hits = whatTheySaw[path];
      var heat = Math.min(1, hits / maxHits);

      // Position from path hash — deterministic
      var hash = 0;
      for (var c = 0; c < path.length; c++) hash = ((hash << 5) - hash) + path.charCodeAt(c);
      var px = Math.abs(hash % 1000) / 1000 * W * 0.8 + W * 0.1;
      var py = Math.abs((hash >> 8) % 1000) / 1000 * H * 0.7 + H * 0.1;

      // Heat intensity — more hits = more heat
      var handR = 8 + heat * 30;
      ctx.globalAlpha = 0.008 + heat * 0.015;
      var handGrad = ctx.createRadialGradient(px, py, 0, px, py, handR);

      // Color by type: immune=red, human=green, mystery=amber
      var isImmune = path.match(/immune/i);
      var isHuman = path.match(/kevin|commensal|xyzzy|cashforkids/i);
      var heatColor = isImmune ? 'rgba(248,81,73,' : isHuman ? 'rgba(63,185,80,' : 'rgba(240,136,62,';

      handGrad.addColorStop(0, heatColor + (0.06 + heat * 0.06) + ')');
      handGrad.addColorStop(0.5, heatColor + (0.02 + heat * 0.03) + ')');
      handGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = handGrad;
      ctx.beginPath();
      ctx.arc(px, py, handR, 0, Math.PI * 2);
      ctx.fill();

      // Path name as a ghost whisper — the memory the chipmunk can't access
      if (heat > 0.1) {
        ctx.globalAlpha = 0.015 + heat * 0.01;
        ctx.font = (6 + heat * 3) + 'px monospace';
        ctx.fillStyle = isHuman ? '#3fb950' : isImmune ? '#f85149' : '#f0883e';
        ctx.fillText(path, px + handR * 0.4, py + 3);
      }
    });
  }

  // ── TRUST GRADIENT as thermal band — the warmth spectrum ──
  var trust = (heatmapPulse || {}).trust_gradient || {};
  if (trust.human || trust.bot || trust.null) {
    var total = (trust.human || 0) + (trust.agentic || 0) + (trust.bot || 0) + (trust.null || 0);
    if (total > 0) {
      var humanPct = (trust.human || 0) / total;
      var botPct = (trust.bot || 0) / total;
      var nullPct = (trust.null || 0) / total;

      // Thermal horizon line — warm where humans are, cold where bots are
      var thermalY = H * 0.85;
      ctx.globalAlpha = 0.02;

      // Human warmth (green, from left)
      var humanGrad = ctx.createLinearGradient(0, thermalY, W * humanPct * 3, thermalY);
      humanGrad.addColorStop(0, 'rgba(63,185,80,0.06)');
      humanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = humanGrad;
      ctx.fillRect(0, thermalY - 15, W * humanPct * 3, 30);

      // Bot cold (red, from right)
      var botGrad = ctx.createLinearGradient(W, thermalY, W * (1 - botPct * 3), thermalY);
      botGrad.addColorStop(0, 'rgba(248,81,73,0.04)');
      botGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = botGrad;
      ctx.fillRect(W * (1 - botPct * 3), thermalY - 15, W * botPct * 3, 30);

      // Null void (gray center)
      ctx.globalAlpha = 0.008;
      ctx.fillStyle = '#808080';
      ctx.fillRect(W * 0.3, thermalY - 5, W * 0.4, 10);
    }
  }

  // ── LIVE VISITOR GHOSTS — the 3 known visitors as spectral presences ──
  var visitors = ((heatmapPulse || {}).live_probes || {}).visitors || {};
  var visitorKeys = Object.keys(visitors);
  visitorKeys.forEach(function(key, i) {
    var v = visitors[key];
    var vx = W * (0.2 + i * 0.3);
    var vy = H * 0.25;
    var vr = 15 + (v.probes || 1) * 0.5;

    ctx.globalAlpha = 0.02;
    var vGrad = ctx.createRadialGradient(vx, vy, 0, vx, vy, vr);
    var vColor = v.classification === 'human' ? '#3fb950' : v.classification === 'agentic' ? '#d2a8ff' : '#6e7681';
    vGrad.addColorStop(0, vColor);
    vGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.arc(vx, vy, vr, 0, Math.PI * 2);
    ctx.fill();

    // Their type — invisible to chipmunk, visible to viewer
    ctx.globalAlpha = 0.02;
    ctx.font = '7px monospace';
    ctx.fillStyle = vColor;
    ctx.fillText(v.type || key, vx - 15, vy + vr + 8);
  });

  ctx.restore();
}

