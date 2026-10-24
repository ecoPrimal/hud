// flat-invert.js — flat page · day=black · night=white · null=grey
// invert lets sun rays + backscatter read on the planet and other spheres
(function () {
  'use strict';
  var MODE_KEY = 'flat-invert-v1';
  var modes = ['day', 'night', 'null'];
  var canvas, ctx, raf = 0, t0 = 0;

  function mode() {
    return document.documentElement.getAttribute('data-flat') || '';
  }

  function setMode(m) {
    if (!m || m === 'off') {
      document.documentElement.removeAttribute('data-flat');
      localStorage.removeItem(MODE_KEY);
      stopRays();
    } else {
      document.documentElement.setAttribute('data-flat', m);
      localStorage.setItem(MODE_KEY, m);
      startRays();
    }
    syncButtons();
  }

  function buildCtl() {
    if (document.getElementById('flat-invert-ctl')) return;
    var box = document.createElement('div');
    box.id = 'flat-invert-ctl';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'flat invert: day black, night white, null grey');
    ['day', 'night', 'null', 'off'].forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.mode = m;
      b.textContent = m === 'day' ? '☀ day' : m === 'night' ? '☾ night' : m === 'null' ? '◌ null' : 'off';
      b.title = m === 'day' ? 'black = day — see sun rays' :
        m === 'night' ? 'white = night — see print on snow' :
        m === 'null' ? 'grey range — the invert between' : 'leave flat invert';
      b.addEventListener('click', function () { setMode(m === 'off' ? 'off' : m); });
      box.appendChild(b);
    });
    document.body.appendChild(box);
    syncButtons();
  }

  function syncButtons() {
    var cur = mode() || 'off';
    var box = document.getElementById('flat-invert-ctl');
    if (!box) return;
    [].forEach.call(box.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.dataset.mode === cur ? 'true' : 'false');
    });
  }

  function ensureCanvas() {
    canvas = document.getElementById('flat-ray-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'flat-ray-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(canvas);
    }
    ctx = canvas.getContext('2d');
    resize();
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function startRays() {
    ensureCanvas();
    cancelAnimationFrame(raf);
    t0 = performance.now();
    tick();
  }

  function stopRays() {
    cancelAnimationFrame(raf);
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function tick() {
    if (!mode()) return;
    var w = canvas.width, h = canvas.height;
    var t = (performance.now() - t0) / 1000;
    ctx.clearRect(0, 0, w, h);

    // sun — day: top-right hard; night: soft opposite; null: dim center-high
    var sun = mode() === 'night'
      ? { x: w * 0.15, y: h * 0.2 }
      : mode() === 'null'
        ? { x: w * 0.5, y: h * 0.12 }
        : { x: w * 0.82, y: h * 0.12 };

    var planet = { x: w * 0.5, y: h * 0.62, r: Math.min(w, h) * 0.14 };
    var moon = { x: w * 0.72, y: h * 0.45, r: Math.min(w, h) * 0.04 };
    var other = { x: w * 0.28, y: h * 0.4, r: Math.min(w, h) * 0.03 };

    var cs = getComputedStyle(document.documentElement);
    var ray = cs.getPropertyValue('--flat-ray').trim() || '#ffcc66';
    var back = cs.getPropertyValue('--flat-back').trim() || '#58a6ff';
    var planetC = cs.getPropertyValue('--flat-planet').trim() || '#3fb950';
    var fg = cs.getPropertyValue('--flat-fg').trim() || '#ccc';

    // primary rays from sun through space to planet
    var nRays = 14;
    for (var i = 0; i < nRays; i++) {
      var a = Math.atan2(planet.y - sun.y, planet.x - sun.x) + (i - nRays / 2) * 0.04;
      var len = Math.hypot(planet.x - sun.x, planet.y - sun.y) * 1.35;
      ctx.strokeStyle = ray;
      ctx.globalAlpha = 0.12 + 0.08 * Math.sin(t * 0.7 + i);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sun.x, sun.y);
      ctx.lineTo(sun.x + Math.cos(a) * len, sun.y + Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // sun disc
    ctx.fillStyle = ray;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // planet
    ctx.strokeStyle = planetC;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2);
    ctx.stroke();
    // terminator — day side faces sun
    var ang = Math.atan2(sun.y - planet.y, sun.x - planet.x);
    ctx.fillStyle = mode() === 'night' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.r - 1, ang - Math.PI / 2, ang + Math.PI / 2);
    ctx.fill();

    // backscatter — rays bounce off planet lit face toward viewer / other spheres
    for (var j = 0; j < 8; j++) {
      var ba = ang + Math.PI + (j - 3.5) * 0.11 + Math.sin(t + j) * 0.02;
      var hitX = planet.x + Math.cos(ang) * planet.r;
      var hitY = planet.y + Math.sin(ang) * planet.r;
      ctx.strokeStyle = back;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(hitX, hitY);
      ctx.lineTo(hitX + Math.cos(ba) * planet.r * 1.8, hitY + Math.sin(ba) * planet.r * 1.8);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // other spheres — moon + companion (receive faint backscatter)
    function sphere(s, label) {
      ctx.strokeStyle = fg;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.stroke();
      // ray from sun clipped past
      ctx.strokeStyle = ray;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.moveTo(sun.x, sun.y);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      // backscatter hop planet → sphere
      ctx.strokeStyle = back;
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.moveTo(planet.x + Math.cos(ang) * planet.r, planet.y + Math.sin(ang) * planet.r);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    sphere(moon, 'moon');
    sphere(other, 'other');

    // legend
    ctx.font = '10px monospace';
    ctx.fillStyle = fg;
    ctx.globalAlpha = 0.55;
    ctx.fillText('rays → planet · backscatter → other spheres · flat invert', 12, h - 14);
    ctx.globalAlpha = 1;

    raf = requestAnimationFrame(tick);
  }

  function boot() {
    buildCtl();
    var saved = localStorage.getItem(MODE_KEY);
    if (saved && modes.indexOf(saved) >= 0) setMode(saved);
    window.addEventListener('resize', function () {
      resize();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window._flatInvert = { set: setMode, mode: mode, modes: modes };
})();
