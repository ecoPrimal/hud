// focal-tunnel.js v1 — look through the tube
// You are at Earth. The membrane is around you. The galaxy is at the far end.
// 8,144 entities passed through. 244,125 bounced off the walls.
// 114 are stuck in the membrane right now, partially through.
// The tube IS the focal tunnel. Look through it.
(function() {
  'use strict';

  var PI  = Math.PI;
  var TAU = PI * 2;
  var _active = false;
  var _overlay = null;
  var _canvas = null;
  var _animFrame = null;
  var _t = 0;

  // ═══ TUNNEL RINGS — depth layers from near (you) to far (galaxy) ═══
  var RINGS = [
    { z: 0.00, label: 'you are here',        color: '#c9d1d9', alpha: 0.6, r: 1.0 },
    { z: 0.06, label: 'investigation',        color: '#f1c40f', alpha: 0.3, r: 0.97 },
    { z: 0.12, label: '120 self',             color: '#3fb950', alpha: 0.25, r: 0.93 },
    { z: 0.20, label: '114 partial (in wall)', color: '#58a6ff', alpha: 0.35, r: 0.88 },
    { z: 0.30, label: 'membrane wall',        color: '#e85d3a', alpha: 0.4, r: 0.82 },
    { z: 0.40, label: '100 null (stuck)',      color: '#ffffff', alpha: 0.2, r: 0.75 },
    { z: 0.50, label: 'tuebor boundary',       color: '#e85d3a', alpha: 0.3, r: 0.67 },
    { z: 0.60, label: '7 non-self',           color: '#ff6b35', alpha: 0.25, r: 0.58 },
    { z: 0.72, label: '3,044 ghost',          color: '#8b949e', alpha: 0.2, r: 0.47 },
    { z: 0.82, label: 'fleet (244,132)',       color: '#6e7681', alpha: 0.15, r: 0.35 },
    { z: 0.90, label: 'galaxy (7,213 nodes)',  color: '#d2a8ff', alpha: 0.12, r: 0.22 },
    { z: 1.00, label: 'the outside',           color: '#484f58', alpha: 0.08, r: 0.08 },
  ];

  // ═══ PARTICLES — things flowing through the tunnel ═══
  var particles = [];
  var MAX_P = 120;

  function spawnParticle() {
    var inbound = Math.random() < 0.03; // 3% come in, 97% bounce outward
    var passed = Math.random() < 0.032; // 8144/255654
    var stuck = Math.random() < 0.004; // 114/... partial
    var angle = Math.random() * TAU;
    var rFrac = 0.6 + Math.random() * 0.35; // how close to wall

    var p = {
      z: inbound ? 1.0 : 0.0,
      speed: inbound ? -(0.002 + Math.random() * 0.004) : (0.001 + Math.random() * 0.003),
      angle: angle,
      rFrac: rFrac,
      color: inbound ? '#58a6ff' : '#e85d3a',
      size: 1 + Math.random() * 2,
      opacity: 0,
      alive: true,
      stuck: stuck,
      passed: passed,
      bounced: false,
      stuckAt: stuck ? (0.20 + Math.random() * 0.12) : 0, // membrane wall zone
    };

    // Color by type
    if (inbound) {
      p.color = '#3fb950'; // self entering
    } else if (passed) {
      p.color = '#d2a8ff'; // passed through — purple
      p.speed = 0.003 + Math.random() * 0.003;
    } else {
      // bounced off — flash red at the wall
      p.color = Math.random() < 0.5 ? '#e85d3a' : '#8b949e';
    }

    particles.push(p);
  }

  // ═══ WALL TEXTURE — the membrane wall pattern around the tunnel ═══
  function drawWallRing(ctx, cx, cy, ringR, z, alpha) {
    var segments = 32;
    var wobble = Math.sin(_t * 0.7 + z * 8) * 0.03;

    for (var i = 0; i < segments; i++) {
      var a1 = (i / segments) * TAU;
      var a2 = ((i + 0.6) / segments) * TAU;
      var selfPct = 1 - z;
      var hue;
      if (selfPct > 0.7) hue = '#3fb950';
      else if (selfPct > 0.5) hue = '#58a6ff';
      else if (selfPct > 0.3) hue = '#f0e68c';
      else if (selfPct > 0.15) hue = '#d2a8ff';
      else hue = '#484f58';

      // Alternating bright/dim segments for texture
      var segAlpha = alpha * (0.3 + wobble + (i % 2 === 0 ? 0.15 : 0));
      ctx.globalAlpha = segAlpha;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, a1, a2);
      ctx.strokeStyle = hue;
      ctx.lineWidth = 1.5 + (1 - z) * 3;
      ctx.stroke();
    }

    // Inner glow — fill between rings
    if (z > 0.15 && z < 0.55) {
      var grad = ctx.createRadialGradient(cx, cy, ringR * 0.95, cx, cy, ringR * 1.05);
      grad.addColorStop(0, 'rgba(232,93,58,0)');
      grad.addColorStop(0.5, 'rgba(232,93,58,' + (alpha * 0.08) + ')');
      grad.addColorStop(1, 'rgba(232,93,58,0)');
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, TAU);
      ctx.strokeStyle = 'rgba(0,0,0,0)';
      ctx.fillStyle = grad;
      // Don't fill — just a hint via a wider stroke
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'rgba(232,93,58,' + (alpha * 0.04) + ')';
      ctx.stroke();
    }
  }

  // ═══ PERSPECTIVE PROJECTION ═══
  function project(cx, cy, maxR, z, angle, rFrac) {
    // z=0 is near (full size), z=1 is far (vanishing point)
    var scale = 1 - z * 0.92; // perspective foreshortening
    var ringR = maxR * scale;
    var tunnelR = ringR * rFrac;
    return {
      x: cx + tunnelR * Math.cos(angle),
      y: cy + tunnelR * Math.sin(angle),
      r: ringR,
      scale: scale,
    };
  }

  // ═══ RENDER ═══
  function render() {
    if (!_active || !_canvas) return;
    var ctx = _canvas.getContext('2d');
    var W = _canvas.width;
    var H = _canvas.height;
    var cx = W / 2;
    var cy = H / 2;
    var maxR = Math.min(W, H) * 0.44;

    _t += 0.012;
    ctx.clearRect(0, 0, W, H);

    // ═══ BACKGROUND — deep space gradient from center ═══
    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.2);
    grad.addColorStop(0, 'rgba(10,8,20,1)');
    grad.addColorStop(0.5, 'rgba(4,6,12,1)');
    grad.addColorStop(1, 'rgba(1,4,9,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ═══ TUNNEL WALLS — draw from far to near (painter's algorithm) ═══
    for (var ri = RINGS.length - 1; ri >= 0; ri--) {
      var ring = RINGS[ri];
      var scale = 1 - ring.z * 0.92;
      var ringR = maxR * scale * ring.r;

      // Wall ring
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, TAU);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = ring.z < 0.05 ? 2 : Math.max(0.3, 1.5 * scale);
      ctx.globalAlpha = ring.alpha * (0.7 + Math.sin(_t + ring.z * 5) * 0.3);
      ctx.stroke();

      // Wall texture between this ring and next
      if (ri > 0) {
        drawWallRing(ctx, cx, cy, ringR, ring.z, ring.alpha * 0.3);
      }

      // Label — along the right side
      if (ring.label) {
        ctx.globalAlpha = ring.alpha * 0.8;
        ctx.font = (7 + 5 * scale) + 'px "Courier New"';
        ctx.fillStyle = ring.color;
        var labelX = cx + ringR + 8;
        var labelY = cy + (ri - RINGS.length / 2) * 2;
        ctx.fillText(ring.label, labelX, labelY);
      }
    }

    // ═══ TUNNEL WALL FILL — gradient between near and far rings ═══
    // Green at the near end, fading through blue to purple at the far end
    var wallGrad = ctx.createRadialGradient(cx, cy, maxR * 0.06, cx, cy, maxR * 0.98);
    wallGrad.addColorStop(0, 'rgba(163,113,247,0.06)');
    wallGrad.addColorStop(0.2, 'rgba(163,113,247,0.03)');
    wallGrad.addColorStop(0.4, 'rgba(232,93,58,0.04)');
    wallGrad.addColorStop(0.6, 'rgba(88,166,255,0.03)');
    wallGrad.addColorStop(0.85, 'rgba(63,185,80,0.02)');
    wallGrad.addColorStop(1, 'rgba(63,185,80,0)');
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 0.98, 0, TAU);
    ctx.fillStyle = wallGrad;
    ctx.fill();

    // ═══ VANISHING POINT — the outside ═══
    var vpR = maxR * 0.08;
    ctx.beginPath();
    ctx.arc(cx, cy, vpR, 0, TAU);
    var vpGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, vpR);
    vpGrad.addColorStop(0, 'rgba(211,168,255,0.15)');
    vpGrad.addColorStop(0.5, 'rgba(100,80,160,0.05)');
    vpGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vpGrad;
    ctx.globalAlpha = 1;
    ctx.fill();

    // Tiny light at the center — the far end of the tunnel
    ctx.beginPath();
    ctx.arc(cx, cy, 2 + Math.sin(_t * 2) * 0.5, 0, TAU);
    ctx.fillStyle = '#d2a8ff';
    ctx.globalAlpha = 0.4 + Math.sin(_t * 3) * 0.15;
    ctx.fill();

    // ═══ DEPTH LINES — perspective ribs running along the tunnel ═══
    var ribs = 16;
    for (var rib = 0; rib < ribs; rib++) {
      var ribAngle = (rib / ribs) * TAU + _t * 0.03;
      ctx.beginPath();
      // From near ring to far ring
      var nearX = cx + maxR * 0.95 * Math.cos(ribAngle);
      var nearY = cy + maxR * 0.95 * Math.sin(ribAngle);
      var farX  = cx + maxR * 0.06 * Math.cos(ribAngle);
      var farY  = cy + maxR * 0.06 * Math.sin(ribAngle);
      ctx.moveTo(nearX, nearY);
      ctx.lineTo(farX, farY);
      ctx.strokeStyle = '#3fb950';
      ctx.lineWidth = 0.3;
      ctx.globalAlpha = 0.06;
      ctx.stroke();
    }

    // ═══ PARTICLES — flowing through the tunnel ═══
    // Spawn
    if (particles.length < MAX_P && Math.random() < 0.3) {
      spawnParticle();
    }

    // Update and draw
    var removeIdx = [];
    for (var pi = 0; pi < particles.length; pi++) {
      var p = particles[pi];

      // Stuck particles oscillate
      if (p.stuck && Math.abs(p.z - p.stuckAt) < 0.05) {
        p.speed = Math.sin(_t * 3 + pi) * 0.0005;
        p.color = '#f0e68c'; // gold — stuck in the wall
      }

      p.z += p.speed;

      // Bounce check — at the membrane wall zone (z=0.25-0.35)
      if (!p.passed && !p.stuck && !p.bounced && p.z > 0.25 && p.z < 0.40) {
        p.bounced = true;
        p.speed = -p.speed * 1.5; // bounce back faster
        p.color = '#e85d3a'; // flash red
        p.size = 3; // flash bigger
      }

      // Fade in/out
      if (p.z > 0 && p.z < 0.1) p.opacity = Math.min(p.opacity + 0.05, 0.7);
      else if (p.z > 0.9) p.opacity = Math.max(p.opacity - 0.03, 0);
      else if (p.z < 0) p.opacity = Math.max(p.opacity - 0.05, 0);
      else p.opacity = Math.min(p.opacity + 0.02, 0.5);

      // Remove dead
      if (p.z > 1.1 || p.z < -0.1 || p.opacity <= 0.01) {
        removeIdx.push(pi);
        continue;
      }

      // Project and draw
      var proj = project(cx, cy, maxR, p.z, p.angle + _t * 0.02, p.rFrac);
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, TAU);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();

      // Trail
      if (p.passed || p.stuck) {
        var trailZ = p.z - p.speed * 8;
        if (trailZ > 0 && trailZ < 1) {
          var tp = project(cx, cy, maxR, trailZ, p.angle + _t * 0.02, p.rFrac);
          ctx.beginPath();
          ctx.moveTo(proj.x, proj.y);
          ctx.lineTo(tp.x, tp.y);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.5 * proj.scale;
          ctx.globalAlpha = p.opacity * 0.3;
          ctx.stroke();
        }
      }
    }
    // Prune
    for (var ri2 = removeIdx.length - 1; ri2 >= 0; ri2--) {
      particles.splice(removeIdx[ri2], 1);
    }

    // ═══ STATS — bottom left ═══
    ctx.globalAlpha = 0.35;
    ctx.font = '10px "Courier New"';
    ctx.fillStyle = '#c9d1d9';
    ctx.fillText('FOCAL TUNNEL — looking through the membrane', 12, H - 80);
    ctx.fillText('near: Earth · you · 51 humans · 120 self · 114 partial', 12, H - 66);
    ctx.fillText('wall: 100 null (stuck) · tuebor boundary · 97% selectivity', 12, H - 52);
    ctx.fillText('far:  7 non-self · 3,044 ghost · 244,132 fleet · 7,213 galaxy', 12, H - 38);
    ctx.fillText('through: 8,144 passed · 244,125 bounced · 5 passage routes', 12, H - 24);

    // ═══ TOP RIGHT — what you see at each end ═══
    ctx.textAlign = 'right';
    ctx.font = '9px "Courier New"';
    ctx.fillStyle = '#3fb950';
    ctx.globalAlpha = 0.25;
    ctx.fillText('NEAR (behind you): Earth, investigation, self', W - 12, 20);
    ctx.fillStyle = '#d2a8ff';
    ctx.fillText('FAR (ahead): galaxy, fleet, the unknown', W - 12, 34);
    ctx.fillStyle = '#e85d3a';
    ctx.fillText('WALL (around you): membrane, tuebor, the boundary', W - 12, 48);
    ctx.fillStyle = '#f0e68c';
    ctx.fillText('STUCK (in the wall): 114 partial, 100 null', W - 12, 62);
    ctx.textAlign = 'left';

    // ═══ NEAR LABEL — "you are here" with arrow ═══
    ctx.globalAlpha = 0.5;
    ctx.font = '11px "Courier New"';
    ctx.fillStyle = '#c9d1d9';
    var youX = cx + maxR * 0.7;
    var youY = cy + maxR * 0.7;
    ctx.fillText('← you are here', youX, youY);
    ctx.font = '8px "Courier New"';
    ctx.fillStyle = '#5ab87a';
    ctx.globalAlpha = 0.3;
    ctx.fillText('the chipmunk is behind you', youX, youY + 14);
    ctx.fillText('looking the same direction', youX, youY + 26);

    // ═══ DISMISS HINT ═══
    ctx.globalAlpha = 0.2;
    ctx.font = '9px "Courier New"';
    ctx.fillStyle = '#6e7681';
    ctx.fillText('double-click to return · scroll to zoom depth', 12, H - 8);

    ctx.globalAlpha = 1;
    _animFrame = requestAnimationFrame(render);
  }

  // ═══ ACTIVATE ═══
  function activate(addEntry) {
    if (_overlay) return;
    _active = true;
    particles = [];

    _overlay = document.createElement('div');
    _overlay.id = 'focal-tunnel-overlay';
    _overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:50;' +
      'background:#010409;cursor:crosshair;';

    _canvas = document.createElement('canvas');
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    _canvas.style.cssText = 'width:100%;height:100%;';
    _overlay.appendChild(_canvas);

    _overlay.addEventListener('dblclick', function() { deactivate(); });

    // Scroll to zoom
    _overlay.addEventListener('wheel', function(e) {
      e.preventDefault();
      // Adjust perspective — shift the near plane
      var delta = e.deltaY > 0 ? 0.02 : -0.02;
      RINGS.forEach(function(r) {
        r.z = Math.max(0, Math.min(1, r.z + delta));
      });
    });

    document.body.appendChild(_overlay);

    // Sound
    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.shepardTone(1, 6);
      window._membraneSound.binaural(window._membraneSound.PI_NOTES[2], 6, 8, 0.02);
    }

    if (addEntry) {
      addEntry('chipmunk',
        '<span class="good">focal tunnel.</span> looking through the membrane.' +
        '\n<span class="dim">near: Earth, you, 51 humans, the investigation.</span>' +
        '\n<span class="dim">wall: 100 nulls stuck. 114 partials in transit. tuebor.</span>' +
        '\n<span class="dim">far: 244,132 fleet. 7,213 galaxy nodes. the outside.</span>' +
        '\n<span class="dim">the purple light at the center is the other end.</span>' +
        '\n<span class="dim">green particles enter. red ones bounce off the walls.</span>' +
        '\n<span class="dim">gold ones are stuck in the membrane — partially through.</span>'
      );
    }

    _t = 0;
    render();
  }

  function deactivate() {
    _active = false;
    if (_animFrame) cancelAnimationFrame(_animFrame);
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null;
    _canvas = null;
    particles = [];
  }

  function toggle(addEntry) {
    if (_active) deactivate(); else activate(addEntry);
    return _active;
  }

  window._focalTunnel = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    isActive: function() { return _active; },
  };
})();
