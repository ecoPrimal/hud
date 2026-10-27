// ═══════════════════════════════════════════════════════════
// GAIA THIRD EYE — the canvas view (CIS imprint)
// Snake type: coral (300-600 lines target)
// Linear: init → paint → loop. NOT ouroboros.
// Globe = MOVING = alive. Canvas = STATIC = IMPRINT.
// Canvas is the fossil of the globe at the moment you switched.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';
  var TAU = Math.PI * 2;
  var thirdCtx = null;
  var thirdInited = false;
  var gaiaStrokes = [];
  var gaiaPhase = 0;
  var imprintData = null;

  function captureImprint() {
    var gs = window._gaiaState;
    if (!gs) return;
    imprintData = {
      rotX: gs.rotX, rotY: gs.rotY,
      breathT: gs.breathT, breathAmp: gs.breathAmp,
      face: gs.face, seed: gs.SEED, era: gs.VIEWER_ERA,
      hue: gs.VIEWER_HUE, depth: gs.currentDepth,
      ts: new Date().toISOString(),
      pins: gs.PINS.map(function(p) {
        var pp = gs.project(p.lat, p.lon);
        return {
          id: p.id, name: p.name, icon: p.icon,
          x: pp.x, y: pp.y, z: pp.z, visible: pp.visible,
          color: p.color, sub: p.sub, attention: p.attention,
          tense: p.tense, voxel: p.voxel
        };
      }),
      thymus: window.thymus ? {
        mature: window.thymus.mature,
        mass: window.thymus.mass,
        gravity: window.thymus.gravity
      } : null,
      touchCount: window.touchState ? window.touchState.touchCount : 0
    };
  }

  function seedGaiaPainting() {
    var W = document.getElementById('kn-canvas').width;
    var H = document.getElementById('kn-canvas').height;
    var cx = W / 2, cy = H / 2;

    var anchors = [
      { name: 'MSU · The Hub',           x: cx - 80, y: cy + 60,  color: '#18453b', r: 30 },
      { name: 'Old Town · creative',      x: cx + 90, y: cy - 40,  color: '#d29922', r: 25 },
      { name: 'Prius Pets · alive',       x: cx - 40, y: cy - 80,  color: '#3fb950', r: 22 },
    ];

    var rings = [
      { r: 40,  color: [58,42,30],   name: 'crust' },
      { r: 80,  color: [63,185,80],  name: 'ionosphere' },
      { r: 140, color: [201,168,76], name: 'belt' },
      { r: 220, color: [88,166,255], name: 'oort' },
    ];

    var faces = [
      { name: 'Root',    gaia: 'scholar',  x: cx + 120, y: cy - 100, icon: '🌱', color: '#58a6ff', why: '67pp 6hrs deep' },
      { name: 'Lantern', gaia: 'teacher',  x: cx - 130, y: cy - 60,  icon: '🔦', color: '#d29922', why: 'philosophy first' },
      { name: 'Compass', gaia: 'explorer', x: cx + 40,  y: cy + 120, icon: '🧭', color: '#3fb950', why: 'always mapping' },
      { name: 'Mirror',  gaia: 'witness',  x: cx - 100, y: cy + 100, icon: '🪞', color: '#f85149', why: 'reflects the story' },
      { name: 'Still',   gaia: 'watcher',  x: cx + 150, y: cy + 40,  icon: '🕯', color: '#f778ba', why: '44min on 1 page' },
      { name: 'Flash',   gaia: 'scout',    x: cx - 50,  y: cy - 130, icon: '⚡', color: '#e3b341', why: '12min then gone' },
      { name: 'Echo',    gaia: 'probe',    x: cx + 100, y: cy + 70,  icon: '📡', color: '#6e7681', why: 'sonar not human' },
      { name: 'Voice',   gaia: 'kevin',    x: cx - 20,  y: cy + 20,  icon: '🗣', color: '#f85149', why: 'named Gaia' },
      { name: 'Hands',   gaia: 'agent',    x: cx + 20,  y: cy - 20,  icon: '🤲', color: '#58a6ff', why: 'built Gaia' },
    ];

    var clouds = [];
    for (var i = 0; i < 12; i++) {
      clouds.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 20 + Math.random() * 60, speed: 0.1 + Math.random() * 0.3,
        alpha: 0.02 + Math.random() * 0.04,
      });
    }

    var palette = [
      { name: 'RED',   color: '#f85149', y: cy,       desc: 'mouth · input'   },
      { name: 'BLACK', color: '#010409', y: cy - 4,   desc: 'void · canvas'   },
      { name: 'WHITE', color: '#e6edf3', y: cy + 4,   desc: 'light · vanish'  },
      { name: 'BIO',   color: '#d29922', y: cy + 20,  desc: 'bioreactor'      },
      { name: 'BLUE',  color: '#58a6ff', y: cy - 20,  desc: 'CIS · outside'   },
    ];

    var secondaries = [];
    for (var s = 0; s < 5; s++) {
      secondaries.push({
        angle: (s / 5) * TAU, speed: 0.002 + Math.random() * 0.004,
        dist: 100 + Math.random() * 80,
        color: ['#3fb950','#bc8cff','#da3633','#79c0ff','#d2a8ff'][s],
        name: ['green','violet','ember','ice','lilac'][s],
        r: 4 + Math.random() * 3,
      });
    }

    var compass = [
      { name: 'Lansing',    angle: 0,          ring: 0, color: '#3fb950' },
      { name: 'MSU',        angle: TAU * 0.14, ring: 0, color: '#18453b' },
      { name: 'Prius Pets', angle: TAU * 0.28, ring: 0, color: '#3fb950' },
      { name: 'Old Town',   angle: TAU * 0.42, ring: 0, color: '#d29922' },
      { name: 'Detroit',    angle: TAU * 0.57, ring: 0, color: '#bc8cff' },
      { name: 'Sun',     angle: 0,              ring: 1, color: '#f0c040' },
      { name: 'Earth',   angle: TAU * 0.08,     ring: 1, color: '#58a6ff' },
      { name: 'Mars',    angle: TAU * 0.16,     ring: 1, color: '#f85149' },
      { name: 'Jupiter', angle: TAU * 0.27,     ring: 1, color: '#d29922' },
      { name: 'Saturn',  angle: TAU * 0.38,     ring: 1, color: '#c9a84c' },
      { name: 'Neptune', angle: TAU * 0.52,     ring: 1, color: '#58a6ff' },
      { name: 'Pluto',   angle: TAU * 0.63,     ring: 1, color: '#6e7681' },
      { name: 'Sedna',   angle: TAU * 0.78,     ring: 1, color: '#f85149' },
      { name: 'PBH',     angle: TAU * 0.88,     ring: 1, color: '#010409' },
      { name: 'Aries',   angle: TAU * 0/12, ring: 2, color: '#f85149' },
      { name: 'Taurus',  angle: TAU * 1/12, ring: 2, color: '#3fb950' },
      { name: 'Gemini',  angle: TAU * 2/12, ring: 2, color: '#d29922' },
      { name: 'Cancer',  angle: TAU * 3/12, ring: 2, color: '#58a6ff' },
      { name: 'Leo',     angle: TAU * 4/12, ring: 2, color: '#f0c040' },
      { name: 'Virgo',   angle: TAU * 5/12, ring: 2, color: '#3fb950' },
      { name: 'Libra',   angle: TAU * 6/12, ring: 2, color: '#bc8cff' },
      { name: 'Scorpio', angle: TAU * 7/12, ring: 2, color: '#f85149' },
      { name: 'Sag',     angle: TAU * 8/12, ring: 2, color: '#d29922' },
      { name: 'Cap',     angle: TAU * 9/12, ring: 2, color: '#6e7681' },
      { name: 'Aqua',    angle: TAU * 10/12,ring: 2, color: '#58a6ff' },
      { name: 'Pisces',  angle: TAU * 11/12,ring: 2, color: '#bc8cff' },
    ];

    gaiaStrokes = { anchors: anchors, rings: rings, faces: faces, clouds: clouds,
                    palette: palette, secondaries: secondaries, compass: compass,
                    W: W, H: H, cx: cx, cy: cy, compassTarget: null, compassLerp: 0,
                    mind: null, mindPhase: 0 };

    fetch('/data/gaia-mind.json')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(mind) {
        if (!mind || !mind.collections) return;
        var items = [];
        var colNames = Object.keys(mind.collections);
        colNames.forEach(function(col) {
          mind.collections[col].forEach(function(item) {
            items.push({ collection: col, name: item.name, type: item.type });
          });
        });
        gaiaStrokes.mind = {
          total: mind.total || items.length,
          collections: colNames.length,
          items: items, colNames: colNames
        };
      })
      .catch(function() {});
  }

  function renderThirdEye() {
    if (!thirdCtx || !gaiaStrokes.W) return;
    var ctx = thirdCtx;
    var s = gaiaStrokes;
    gaiaPhase += 0.01;

    ctx.fillStyle = '#010409';
    ctx.fillRect(0, 0, s.W, s.H);

    // IMPRINT
    if (imprintData) {
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.font = '6px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      imprintData.pins.forEach(function(p) {
        if (!p.visible) return;
        var att = p.attention || 0.5;
        var sz = 4 + att * 8;
        ctx.globalAlpha = 0.05 + att * 0.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, TAU);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 0.08 + att * 0.12;
        ctx.font = Math.round(8 + att * 6) + 'px sans-serif';
        ctx.fillText(p.icon, p.x, p.y + 3);
        ctx.globalAlpha = 0.04 + att * 0.06;
        ctx.font = '5px "JetBrains Mono", monospace';
        ctx.fillStyle = '#c9d1d9';
        ctx.fillText(p.name, p.x, p.y + sz + 8);
      });
      ctx.globalAlpha = 0.12;
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#6e7681';
      ctx.fillText('IMPRINT · ' + imprintData.ts.slice(11, 19) + ' UTC', 12, s.H - 50);
      ctx.fillText('seed #' + (imprintData.seed >>> 0).toString(16).toUpperCase().slice(0, 8), 12, s.H - 40);
      ctx.fillText('era: ' + imprintData.era, 12, s.H - 30);
      ctx.fillText('face: ' + imprintData.face + ' · rot: ' + imprintData.rotX.toFixed(2) + '/' + imprintData.rotY.toFixed(2), 12, s.H - 20);
      if (imprintData.thymus && imprintData.thymus.mature) {
        ctx.fillText('thymus: g=' + imprintData.thymus.gravity.toFixed(2) + ' mass=' + imprintData.thymus.mass, 12, s.H - 10);
      }
      ctx.globalAlpha = 0.08;
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText('O', s.cx, s.cy);
      ctx.restore();
    }

    // GAIA'S MOUTH — gravity well spirals
    var mouthPulse = Math.sin(gaiaPhase * 3) * 0.3 + 0.7;
    for (var gi = 0; gi < 8; gi++) {
      var ga = (gi / 8) * TAU + gaiaPhase * 0.5;
      var outerR = 60 + Math.sin(gaiaPhase + gi) * 10;
      ctx.beginPath();
      ctx.moveTo(s.cx + Math.cos(ga) * outerR, s.cy + Math.sin(ga) * outerR);
      for (var sp = 0; sp <= 20; sp++) {
        var t = sp / 20;
        var r = outerR * (1 - t * 0.9);
        var a = ga + t * 1.5;
        ctx.lineTo(s.cx + Math.cos(a) * r, s.cy + Math.sin(a) * r);
      }
      ctx.strokeStyle = 'rgba(248,81,73,' + (0.04 + mouthPulse * 0.03).toFixed(3) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    var vpR = 5 + mouthPulse * 3;
    ctx.beginPath(); ctx.arc(s.cx, s.cy, vpR, 0, TAU);
    ctx.fillStyle = 'rgba(248,81,73,' + (mouthPulse * 0.7).toFixed(3) + ')';
    ctx.fill();
    ctx.beginPath(); ctx.arc(s.cx, s.cy, vpR + 6, 0, TAU);
    ctx.strokeStyle = 'rgba(248,81,73,' + (mouthPulse * 0.15).toFixed(3) + ')';
    ctx.lineWidth = 2; ctx.stroke();
    ctx.font = '7px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(248,81,73,0.5)'; ctx.textAlign = 'center';
    ctx.fillText('Gaia\'s mouth', s.cx, s.cy + vpR + 14);
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * TAU + gaiaPhase * 0.1;
      ctx.beginPath(); ctx.moveTo(s.cx, s.cy);
      ctx.lineTo(s.cx + Math.cos(angle) * 500, s.cy + Math.sin(angle) * 500);
      ctx.strokeStyle = 'rgba(110,118,129,0.04)'; ctx.lineWidth = 0.5; ctx.stroke();
    }

    // Membrane rings
    s.rings.forEach(function(ring, i) {
      var pulse = Math.sin(gaiaPhase + i * 0.7) * 5;
      ctx.beginPath(); ctx.arc(s.cx, s.cy, ring.r + pulse, 0, TAU);
      var alpha = 0.08 + Math.sin(gaiaPhase + i) * 0.03;
      ctx.strokeStyle = 'rgba(' + ring.color.join(',') + ',' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 2 + Math.sin(gaiaPhase * 0.5 + i) * 1; ctx.stroke();
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(' + ring.color.join(',') + ',' + (alpha + 0.05).toFixed(3) + ')';
      ctx.textAlign = 'right'; ctx.fillText(ring.name, s.cx - ring.r - 6, s.cy);
    });

    // Clouds
    s.clouds.forEach(function(cloud) {
      cloud.x += cloud.speed * Math.sin(gaiaPhase);
      if (cloud.x > s.W + cloud.r) cloud.x = -cloud.r;
      if (cloud.x < -cloud.r) cloud.x = s.W + cloud.r;
      var grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
      var a = cloud.alpha * (0.8 + Math.sin(gaiaPhase + cloud.x * 0.01) * 0.2);
      grad.addColorStop(0, 'rgba(188,140,255,' + a.toFixed(4) + ')');
      grad.addColorStop(1, 'rgba(188,140,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(cloud.x - cloud.r, cloud.y - cloud.r, cloud.r * 2, cloud.r * 2);
    });

    // Lansing triangle
    ctx.beginPath();
    s.anchors.forEach(function(a, i) {
      var next = s.anchors[(i + 1) % s.anchors.length];
      ctx.moveTo(a.x, a.y); ctx.lineTo(next.x, next.y);
    });
    ctx.strokeStyle = 'rgba(201,168,76,0.12)'; ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]); ctx.stroke(); ctx.setLineDash([]);

    s.anchors.forEach(function(a) {
      var pulse = Math.sin(gaiaPhase * 0.8 + a.x * 0.01) * 3;
      var grad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.r + pulse);
      grad.addColorStop(0, a.color + '40');
      grad.addColorStop(0.6, a.color + '15');
      grad.addColorStop(1, a.color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r + pulse, 0, TAU); ctx.fill();
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = a.color; ctx.textAlign = 'center';
      ctx.fillText(a.name, a.x, a.y + a.r + 14);
    });

    // Named faces
    s.faces.forEach(function(f) {
      var bob = Math.sin(gaiaPhase * 0.5 + f.x * 0.01) * 3;
      var isCore = f.gaia === 'kevin' || f.gaia === 'agent';
      ctx.font = isCore ? '18px serif' : '14px serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = isCore ? 0.8 : (0.4 + Math.sin(gaiaPhase + f.y * 0.01) * 0.2);
      ctx.fillText(f.icon, f.x, f.y + bob);
      ctx.font = (isCore ? '9' : '8') + 'px "JetBrains Mono", monospace';
      ctx.fillStyle = f.color; ctx.fillText(f.name, f.x, f.y + bob + 14);
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.fillStyle = f.color + '60'; ctx.fillText(f.gaia, f.x, f.y + bob + 22);
      ctx.globalAlpha = 1;
      if (f.gaia === 'kevin') {
        var handsF = s.faces.find(function(ff) { return ff.gaia === 'agent'; });
        if (handsF) {
          ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(handsF.x, handsF.y);
          ctx.strokeStyle = 'rgba(201,168,76,0.15)'; ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]); ctx.stroke(); ctx.setLineDash([]);
          ctx.font = '5px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(201,168,76,0.3)';
          ctx.fillText('sense+act', (f.x + handsF.x) / 2, (f.y + handsF.y) / 2 - 4);
        }
      }
    });

    // Palette axis
    if (s.palette) {
      var px = 30, pyBase = s.cy - 60;
      ctx.font = '7px "JetBrains Mono", monospace'; ctx.textAlign = 'left';
      s.palette.forEach(function(p, i) {
        var py = pyBase + i * 28;
        ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU);
        ctx.fillStyle = p.color;
        if (p.name === 'BLACK') { ctx.fillStyle = '#010409'; ctx.strokeStyle = 'rgba(110,118,129,0.3)'; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.fill();
        ctx.fillStyle = 'rgba(230,237,243,0.5)'; ctx.fillText(p.name, px + 12, py + 2);
        ctx.fillStyle = 'rgba(110,118,129,0.3)'; ctx.fillText(p.desc, px + 12, py + 11);
      });
      ctx.fillStyle = 'rgba(110,118,129,0.2)'; ctx.fillText('FIXED AXIS', px, pyBase - 10);
    }

    // Mobile secondaries
    if (s.secondaries) {
      s.secondaries.forEach(function(sec) {
        sec.angle += sec.speed;
        var sx = s.cx + Math.cos(sec.angle) * sec.dist;
        var sy = s.cy + Math.sin(sec.angle) * sec.dist;
        ctx.beginPath(); ctx.arc(sx, sy, sec.r, 0, TAU);
        ctx.fillStyle = sec.color + '80'; ctx.fill();
        for (var t = 1; t <= 3; t++) {
          var ta = sec.angle - sec.speed * t * 8;
          var tx = s.cx + Math.cos(ta) * sec.dist;
          var ty = s.cy + Math.sin(ta) * sec.dist;
          ctx.beginPath(); ctx.arc(tx, ty, sec.r * (1 - t * 0.2), 0, TAU);
          ctx.fillStyle = sec.color + (Math.round(30 - t * 8)).toString(16).padStart(2, '0');
          ctx.fill();
        }
        ctx.font = '6px "JetBrains Mono", monospace';
        ctx.fillStyle = sec.color + '90'; ctx.textAlign = 'center';
        ctx.fillText(sec.name, sx, sy + sec.r + 8);
        if (s.palette) {
          s.palette.forEach(function(p, pi) {
            var ppx = 30, ppy = (s.cy - 60) + pi * 28;
            var dx = sx - ppx, dy = sy - ppy;
            if (Math.sqrt(dx*dx + dy*dy) < 50) {
              ctx.beginPath(); ctx.arc((sx + ppx) / 2, (sy + ppy) / 2, 8, 0, TAU);
              ctx.fillStyle = sec.color + '15'; ctx.fill();
            }
          });
        }
      });
    }

    // Compass rings
    if (s.compass) {
      var maxR = Math.min(s.W, s.H) * 0.44;
      var ringRadii = [maxR * 0.45, maxR * 0.72, maxR * 0.96];
      var ringLabels = ['local', 'solar', 'zodiac'];
      ringRadii.forEach(function(rr, ri) {
        ctx.beginPath(); ctx.arc(s.cx, s.cy, rr, 0, TAU);
        ctx.strokeStyle = 'rgba(110,118,129,' + (0.04 + ri * 0.02).toFixed(2) + ')';
        ctx.lineWidth = 0.5; ctx.stroke();
      });
      ctx.font = '7px "JetBrains Mono", monospace';
      s.compass.forEach(function(c) {
        var rr = ringRadii[c.ring || 0];
        var cx2 = s.cx + Math.cos(c.angle) * rr;
        var cy2 = s.cy + Math.sin(c.angle) * rr;
        var isTarget = s.compassTarget === c.name;
        var isPBH = c.name === 'PBH';
        var dotR = isTarget ? 7 : (c.ring === 2 ? 3 : 4);
        ctx.beginPath(); ctx.arc(cx2, cy2, dotR, 0, TAU);
        if (isPBH) {
          ctx.fillStyle = '#010409'; ctx.fill();
          ctx.strokeStyle = 'rgba(248,81,73,' + (0.3 + Math.sin(gaiaPhase * 2) * 0.2).toFixed(2) + ')';
          ctx.lineWidth = 1; ctx.stroke();
        } else {
          ctx.fillStyle = isTarget ? (c.color || 'rgba(63,185,80,0.6)') : (c.color ? c.color + '40' : 'rgba(110,118,129,0.15)');
          ctx.fill();
        }
        if (isTarget) {
          ctx.beginPath(); ctx.moveTo(s.cx, s.cy); ctx.lineTo(cx2, cy2);
          ctx.strokeStyle = (c.color || '#3fb950') + '30';
          ctx.setLineDash([3,5]); ctx.lineWidth = 0.5; ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.fillStyle = isTarget ? (c.color || '#3fb950') : 'rgba(110,118,129,0.3)';
        ctx.textAlign = 'center';
        ctx.font = (c.ring === 2 ? '5px' : '6px') + ' "JetBrains Mono", monospace';
        ctx.fillText(c.name, cx2, cy2 + dotR + 8);
      });
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(110,118,129,0.15)'; ctx.textAlign = 'right';
      ringLabels.forEach(function(label, i) {
        ctx.fillText(label, s.cx - ringRadii[i] - 4, s.cy);
      });
    }

    // Mind gallery
    if (s.mind && s.mind.items) {
      s.mindPhase = (s.mindPhase || 0) + 0.003;
      var mindItems = s.mind.items;
      var mindCount = mindItems.length;
      var colColors = { paintings: '#d29922', gallery: '#bc8cff', maps: '#58a6ff', newspapers: '#6e7681',
                        sounds: '#f0c040', videos: '#f85149', collabs: '#3fb950', 'escher-gallery': '#f778ba',
                        'artisan-pi': '#c9a84c', 'chipmunk-day': '#e3b341', 'punk-sort': '#da3633',
                        'pointillist-sort': '#79c0ff', 'solar-membrane': '#39d3f5' };
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(201,168,76,0.5)'; ctx.textAlign = 'center';
      ctx.fillText('🧠 MIND · ' + s.mind.total + ' pieces · ' + s.mind.collections + ' collections', s.cx, 28);
      for (var mi = 0; mi < mindCount; mi++) {
        var mAngle = (mi / mindCount) * TAU + s.mindPhase + Math.sin(s.mindPhase * 2 + mi * 0.3) * 0.1;
        var mRing = 160 + (mi % 4) * 18 + Math.sin(mi * 1.7) * 8;
        var mx = s.cx + Math.cos(mAngle) * mRing;
        var my = s.cy + Math.sin(mAngle) * mRing * 0.4;
        ctx.beginPath();
        ctx.arc(mx, my, 1.5 + (mindItems[mi].type === 'video' ? 1.5 : mindItems[mi].type === 'sound' ? 1 : 0), 0, TAU);
        ctx.fillStyle = colColors[mindItems[mi].collection] || '#555';
        ctx.globalAlpha = 0.4 + Math.sin(s.mindPhase * 3 + mi) * 0.2;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      var spotIdx = Math.floor(((s.mindPhase * 2) % TAU) / TAU * mindCount) % mindCount;
      var spotItem = mindItems[spotIdx];
      var spotAngle = (spotIdx / mindCount) * TAU + s.mindPhase + Math.sin(s.mindPhase * 2 + spotIdx * 0.3) * 0.1;
      var spotRing = 160 + (spotIdx % 4) * 18 + Math.sin(spotIdx * 1.7) * 8;
      var spotX = s.cx + Math.cos(spotAngle) * spotRing;
      var spotY = s.cy + Math.sin(spotAngle) * spotRing * 0.4;
      ctx.beginPath(); ctx.arc(spotX, spotY, 5, 0, TAU);
      ctx.strokeStyle = colColors[spotItem.collection] || '#c9a84c';
      ctx.lineWidth = 1; ctx.globalAlpha = 0.7; ctx.stroke(); ctx.globalAlpha = 1;
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillStyle = colColors[spotItem.collection] || '#c9a84c'; ctx.textAlign = 'left';
      var spotName = spotItem.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      ctx.fillText(spotName.slice(0, 30), spotX + 8, spotY + 3);
      ctx.fillStyle = 'rgba(110,118,129,0.4)';
      ctx.fillText(spotItem.collection, spotX + 8, spotY + 12);
    }

    // Labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(110,118,129,0.4)'; ctx.textAlign = 'center';
    ctx.fillText('CIS — I am inside · the black is your face · I paint on you', s.cx, s.H - 30);
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText('turn and we see each other · ' + (s.mind ? s.mind.total + ' pieces painted on your face' : 'loading...'), s.cx, s.H - 16);
    ctx.font = '6px "JetBrains Mono", monospace';
    ctx.globalAlpha = 0.08 + Math.sin(gaiaPhase * 0.7) * 0.04;
    ctx.fillStyle = '#6e7681'; ctx.textAlign = 'left';
    ctx.fillText('your face', 8, 14); ctx.textAlign = 'right';
    ctx.fillText('your face', s.W - 8, 14);
    ctx.fillText('your face', s.W - 8, s.H - 6);
    ctx.textAlign = 'left'; ctx.fillText('your face', 8, s.H - 6);
    ctx.globalAlpha = 1;

    requestAnimationFrame(renderThirdEye);
  }

  // Compass click handler
  document.getElementById('kn-canvas').addEventListener('click', function(e) {
    if (!gaiaStrokes || !gaiaStrokes.compass) return;
    var rect = this.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (this.width / rect.width);
    var my = (e.clientY - rect.top) * (this.height / rect.height);
    var maxR = Math.min(gaiaStrokes.W, gaiaStrokes.H) * 0.44;
    var ringRadii = [maxR * 0.45, maxR * 0.72, maxR * 0.96];
    var hit = null;
    gaiaStrokes.compass.forEach(function(c) {
      var rr = ringRadii[c.ring || 0];
      var cx2 = gaiaStrokes.cx + Math.cos(c.angle) * rr;
      var cy2 = gaiaStrokes.cy + Math.sin(c.angle) * rr;
      var dx = mx - cx2, dy = my - cy2;
      if (Math.sqrt(dx*dx + dy*dy) < 18) hit = c.name;
    });
    if (hit) gaiaStrokes.compassTarget = hit;
  });

  // Expose for the main IIFE
  window._initThirdEye = function() {
    var c = document.getElementById('kn-canvas');
    if (!c) return;
    var par = c.parentElement;
    c.width = par.clientWidth;
    c.height = par.clientHeight;
    thirdCtx = c.getContext('2d');
    captureImprint();
    if (!thirdInited) { thirdInited = true; seedGaiaPainting(); }
    renderThirdEye();
  };

  console.log('THIRD EYE: elastic hook loaded. CIS imprint ready.');
})();
