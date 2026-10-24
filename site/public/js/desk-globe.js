// desk-globe.js — inverse projection of BOTH sides of the HUD
// the globe is looking around a car and turning on the lights
// inside your mind, take a walk. flicker lights to see who's outside.
// moon = angle lever. sun = gradient control. eclipses = patterns.
(function() {
  'use strict';

  var PI = Math.PI, TWO_PI = PI * 2;
  var PHI = (1 + Math.sqrt(5)) / 2;
  var DEG = PI / 180, RAD = 180 / PI;

  var canvas, ctx, W, H, cx, cy, R;
  var rotX = 0.4, rotY = -1.4; // start: Great Lakes
  var autoRotate = true, rotSpeed = 0.002;
  var face = 'outside'; // 'outside' (cis) or 'inside' (trans)
  var dragStart = null, dragRX = 0, dragRY = 0;
  var moonAngle = 0, sunAngle = 0;
  var t = 0;

  // ═══ TOOL PINS — every tool on the globe ═══
  var TOOLS = [
    { name: 'membrane',    lat: 42.7, lon: -84.5, icon: '🫧', color: '#5ab87a', face: 'both',    link: '/' },
    { name: 'bingo',       lat: 51.2, lon: -1.8,  icon: '🎲', color: '#FFE135', face: 'inside',  link: '#bingo' },
    { name: 'go-kart',     lat: 29.9, lon: 31.1,  icon: '🏎️', color: '#f0883e', face: 'inside',  link: '#gokart' },
    { name: 'classroom',   lat: 22.5, lon: 30.7,  icon: '📚', color: '#d29922', face: 'inside',  link: '#classroom' },
    { name: 'arena',       lat: 20.7, lon: -88.6,  icon: '⚔️', color: '#f85149', face: 'inside',  link: '#arena' },
    { name: 'self-trace',  lat: 13.4, lon: 103.9,  icon: '📡', color: '#3fb950', face: 'outside', link: '#trace' },
    { name: 'canary:valve',lat: 47.6, lon: -122.3, icon: '🐤', color: '#d29922', face: 'outside', link: '/valve.html' },
    { name: 'canary:steam',lat: 37.8, lon: -122.4, icon: '🐤', color: '#d29922', face: 'outside', link: '/steam.html' },
    { name: 'crates.io',   lat: 52.5, lon: 13.4,   icon: '🦀', color: '#f0883e', face: 'outside', link: '/crates.html' },
    { name: 'moon-loc',    lat: 58.2, lon: -6.7,   icon: '🌙', color: '#58a6ff', face: 'both',    link: '#moon' },
    { name: 'gyro',        lat: -27.1,lon: -109.3,  icon: '🧭', color: '#d2a8ff', face: 'inside',  link: '#gyro' },
    { name: 'campfire',    lat: -13.2,lon: -72.5,   icon: '🔥', color: '#f0883e', face: 'inside',  link: '#campfire' },
    { name: 'pi-budget',   lat: 53.7, lon: -6.5,    icon: 'π',  color: '#d2a8ff', face: 'both',    link: '#pi' },
    { name: 'bell',        lat: 30.0, lon: 31.1,    icon: '🔔', color: '#3fb950', face: 'outside', link: '#bell' },
    { name: 'neutron',     lat: 0,    lon: 0,        icon: '◉',  color: '#58a6ff', face: 'inside',  link: '/neutron/core.html' },
    { name: 'globe',       lat: -33.9,lon: 18.4,    icon: '🌍', color: '#3fb950', face: 'outside', link: '/neutron/globe.html' },
    { name: 'easel',       lat: 35.7, lon: 139.7,   icon: '🎨', color: '#f0c674', face: 'inside',  link: '/easel.html' },
    { name: 'weather',     lat: 64.1, lon: -21.9,   icon: '☀',  color: '#ffe135', face: 'both',    link: '/weather.html' },
  ];

  // ═══ ECLIPSE DETECTION ═══
  function checkEclipse() {
    if (!window._celestialClock) return null;
    var moon = window._celestialClock.moonPhase();
    if (!moon) return null;
    // Solar eclipse: new moon (fraction < 0.03 or > 0.97)
    if (moon.fraction < 0.03 || moon.fraction > 0.97) {
      return { type: 'solar', msg: 'solar eclipse window — new moon', color: '#f1c40f' };
    }
    // Lunar eclipse: full moon (fraction 0.48-0.52)
    if (moon.fraction > 0.48 && moon.fraction < 0.52) {
      return { type: 'lunar', msg: 'lunar eclipse window — full moon', color: '#f85149' };
    }
    return null;
  }

  // ═══ 3D PROJECTION ═══
  function project(lat, lon) {
    var phi = lat * DEG, lambda = lon * DEG;
    var cosP = Math.cos(phi), sinP = Math.sin(phi);
    var cosL = Math.cos(lambda + rotY), sinL = Math.sin(lambda + rotY);
    var x = cosP * sinL;
    var y = sinP * Math.cos(rotX) - cosP * cosL * Math.sin(rotX);
    var z = sinP * Math.sin(rotX) + cosP * cosL * Math.cos(rotX);
    if (face === 'inside') z = -z; // flip for interior view
    return { x: cx + x * R, y: cy - y * R, z: z, visible: z > 0 };
  }

  // ═══ RENDER ═══
  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    // Get moon/sun state for lighting
    var moonPhase = null, sunPos = null;
    if (window._celestialClock) {
      moonPhase = window._celestialClock.moonPhase();
      sunPos = window._celestialClock.sunPosition();
    }

    // Moon controls rotation angle
    if (moonPhase) {
      moonAngle = moonPhase.fraction * TWO_PI;
    }

    // Sun controls gradient
    var sunGrad = sunPos ? (sunPos.altitude + 90) / 180 : 0.5;
    var bgHue = Math.round(220 + sunGrad * 30); // blue to purple
    var bgSat = Math.round(20 + sunGrad * 15);

    // Background: sun-controlled gradient
    var grad = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.8);
    grad.addColorStop(0, 'hsl(' + bgHue + ',' + bgSat + '%,6%)');
    grad.addColorStop(1, 'hsl(' + bgHue + ',' + (bgSat - 10) + '%,2%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Globe body
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TWO_PI);
    var gFill = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
    if (face === 'outside') {
      gFill.addColorStop(0, 'rgba(88,166,255,0.08)');
      gFill.addColorStop(1, 'rgba(13,17,23,0.95)');
    } else {
      gFill.addColorStop(0, 'rgba(90,184,122,0.08)');
      gFill.addColorStop(1, 'rgba(13,17,23,0.95)');
    }
    ctx.fillStyle = gFill;
    ctx.fill();
    ctx.strokeStyle = face === 'outside' ? 'rgba(88,166,255,0.2)' : 'rgba(90,184,122,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Lat/lon grid
    ctx.strokeStyle = 'rgba(48,54,61,0.3)';
    ctx.lineWidth = 0.5;
    for (var lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      for (var lon = -180; lon <= 180; lon += 5) {
        var p = project(lat, lon);
        if (p.visible) {
          if (lon === -180 || !project(lat, lon - 5).visible) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
    }
    for (var lon = -180; lon < 180; lon += 30) {
      ctx.beginPath();
      for (var lat = -90; lat <= 90; lat += 5) {
        var p = project(lat, lon);
        if (p.visible) {
          if (lat === -90 || !project(lat - 5, lon).visible) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
    }

    // Moon position on globe (angle lever)
    if (window._moonLocalizer && window._moonLocalizer.moon) {
      var ml = window._moonLocalizer.moon;
      var mp = project(ml.subLunarLat, ml.subLunarLon);
      if (mp.visible) {
        ctx.beginPath();
        ctx.arc(mp.x, mp.y, 8, 0, TWO_PI);
        ctx.fillStyle = 'rgba(88,166,255,0.2)';
        ctx.fill();
        ctx.fillStyle = '#58a6ff';
        ctx.font = '14px serif';
        ctx.textAlign = 'center';
        ctx.fillText(moonPhase ? moonPhase.emoji : '🌙', mp.x, mp.y + 5);
        ctx.font = '7px monospace';
        ctx.fillStyle = 'rgba(88,166,255,0.6)';
        ctx.fillText('drag to rotate', mp.x, mp.y + 16);
      }
    }

    // Sun position (gradient lever)
    if (sunPos) {
      var sunLat = sunPos.declination;
      var sunLon = -sunPos.hourAngle;
      var sp = project(sunLat, sunLon);
      if (sp.visible) {
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 6, 0, TWO_PI);
        ctx.fillStyle = 'rgba(255,225,53,0.15)';
        ctx.fill();
        ctx.fillStyle = '#ffe135';
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.fillText(sunPos.isDay ? '☀' : '🌙', sp.x, sp.y + 4);
      }
    }

    // Tool pins
    TOOLS.forEach(function(tool) {
      if (tool.face !== 'both' && tool.face !== face) return;
      var p = project(tool.lat, tool.lon);
      if (!p.visible) return;

      var alpha = 0.3 + p.z * 0.7;
      var sz = 6 + p.z * 4;

      ctx.globalAlpha = alpha;
      ctx.font = sz + 'px serif';
      ctx.textAlign = 'center';
      ctx.fillText(tool.icon, p.x, p.y + sz * 0.3);

      ctx.font = '7px monospace';
      ctx.fillStyle = tool.color;
      ctx.fillText(tool.name, p.x, p.y + sz * 0.3 + 10);
      ctx.globalAlpha = 1;
    });

    // Eclipse overlay
    var eclipse = checkEclipse();
    if (eclipse) {
      ctx.font = '10px monospace';
      ctx.fillStyle = eclipse.color;
      ctx.textAlign = 'center';
      ctx.fillText('⚡ ' + eclipse.msg, cx, cy + R + 16);
    }

    // Face label
    ctx.font = '9px monospace';
    ctx.fillStyle = face === 'outside' ? '#58a6ff' : '#5ab87a';
    ctx.textAlign = 'center';
    ctx.fillText(face === 'outside' ? '◈ cis face — outside looking in' : '◉ trans face — inside looking out', cx, 16);

    // Controls hint
    ctx.fillStyle = '#484f58';
    ctx.font = '8px monospace';
    ctx.fillText('click moon to rotate · click sun to shift gradient · F to flip · scroll to zoom', cx, H - 8);

    // Auto-rotate
    if (autoRotate) rotY += rotSpeed;
    t++;

    requestAnimationFrame(render);
  }

  // ═══ INTERACTION ═══
  function handleClick(e) {
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;

    // Check tool pins
    for (var i = 0; i < TOOLS.length; i++) {
      var tool = TOOLS[i];
      if (tool.face !== 'both' && tool.face !== face) continue;
      var p = project(tool.lat, tool.lon);
      if (!p.visible) continue;
      var dx = mx - p.x, dy = my - p.y;
      if (dx * dx + dy * dy < 200) {
        if (tool.link.startsWith('#')) {
          // Toggle internal tool
          var btn = document.getElementById(tool.link.slice(1) + '-toggle');
          if (btn) btn.click();
        } else {
          window.location.href = tool.link;
        }
        return;
      }
    }

    // Check moon click — use as rotation lever
    if (window._moonLocalizer && window._moonLocalizer.moon) {
      var ml = window._moonLocalizer.moon;
      var mp = project(ml.subLunarLat, ml.subLunarLon);
      if (mp.visible) {
        var dxm = mx - mp.x, dym = my - mp.y;
        if (dxm * dxm + dym * dym < 400) {
          // Snap rotation to moon's position
          rotY = -ml.subLunarLon * DEG;
          rotX = ml.subLunarLat * DEG * 0.5;
          autoRotate = false;
          return;
        }
      }
    }
  }

  function handleMouseDown(e) {
    dragStart = { x: e.clientX, y: e.clientY };
    dragRX = rotX; dragRY = rotY;
    autoRotate = false;
  }

  function handleMouseMove(e) {
    if (!dragStart) return;
    var dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
    rotY = dragRY + dx * 0.005;
    rotX = Math.max(-PI / 2, Math.min(PI / 2, dragRX - dy * 0.005));
  }

  function handleMouseUp() { dragStart = null; }

  function handleKey(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'f' || e.key === 'F') {
      face = face === 'outside' ? 'inside' : 'outside';
    } else if (e.key === ' ') {
      autoRotate = !autoRotate;
    }
  }

  function handleWheel(e) {
    R = Math.max(50, Math.min(Math.min(W, H) * 0.45, R + (e.deltaY > 0 ? -5 : 5)));
  }

  // ═══ TOGGLE UI ═══
  function createUI() {
    // Canvas overlay (hidden until toggled)
    var wrap = document.createElement('div');
    wrap.id = 'desk-globe-wrap';
    wrap.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:800;display:none;' +
      'background:rgba(1,4,9,0.95);cursor:grab;';
    canvas = document.createElement('canvas');
    canvas.id = 'desk-globe-canvas';
    canvas.style.cssText = 'width:100%;height:100%;';
    wrap.appendChild(canvas);

    // Close button
    var close = document.createElement('button');
    close.textContent = '✕ close globe';
    close.style.cssText = 'position:fixed;top:12px;right:16px;z-index:810;background:rgba(22,27,34,0.9);' +
      'border:1px solid #30363d;color:#8b949e;padding:6px 14px;border-radius:8px;cursor:pointer;font:11px monospace;';
    close.onclick = function() { wrap.style.display = 'none'; };
    wrap.appendChild(close);

    // Flip button
    var flip = document.createElement('button');
    flip.textContent = '↻ flip (F)';
    flip.style.cssText = 'position:fixed;top:12px;left:16px;z-index:810;background:rgba(22,27,34,0.9);' +
      'border:1px solid #30363d;color:#58a6ff;padding:6px 14px;border-radius:8px;cursor:pointer;font:11px monospace;';
    flip.onclick = function() { face = face === 'outside' ? 'inside' : 'outside'; };
    wrap.appendChild(flip);

    document.body.appendChild(wrap);

    // Events
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('keydown', handleKey);

    // Touch
    canvas.addEventListener('touchstart', function(e) {
      var t = e.touches[0];
      handleMouseDown({ clientX: t.clientX, clientY: t.clientY });
    }, { passive: true });
    canvas.addEventListener('touchmove', function(e) {
      var t = e.touches[0];
      handleMouseMove({ clientX: t.clientX, clientY: t.clientY });
    }, { passive: true });
    canvas.addEventListener('touchend', handleMouseUp);

    // Toggle button on HUD
    var btn = document.createElement('button');
    btn.id = 'desk-globe-toggle';
    btn.innerHTML = '🌐';
    btn.title = 'desk globe — both sides of the HUD';
    btn.style.cssText = 'position:fixed;bottom:12px;left:164px;z-index:5;' +
      'background:rgba(22,27,34,.9);border:1px solid rgba(88,166,255,.35);' +
      'color:#58a6ff;padding:6px 10px;border-radius:20px;cursor:pointer;' +
      'font-size:14px;font-family:monospace;';
    btn.onclick = function() {
      var w = document.getElementById('desk-globe-wrap');
      if (w.style.display === 'none') {
        w.style.display = 'block';
        resize();
        if (!ctx) { ctx = canvas.getContext('2d'); render(); }
      } else {
        w.style.display = 'none';
      }
    };
    if (!document.getElementById('desk-globe-toggle')) document.body.appendChild(btn);
  }

  function resize() {
    if (!canvas) return;
    W = canvas.width = canvas.parentElement.clientWidth;
    H = canvas.height = canvas.parentElement.clientHeight;
    cx = W / 2; cy = H / 2;
    R = Math.min(W, H) * 0.38;
  }

  // ═══ INIT ═══
  function boot() {
    createUI();
    window.addEventListener('resize', resize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 2800);
  }
})();
