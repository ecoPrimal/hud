/* inner-plane.js — common tools live at the most inner plane.
 *
 * map · compass · globe · topo · clip
 * they pass between layers with you.
 * you are at the level you perceive.
 * clip a line in an atom → the electron falls out of orbit.
 */
(function () {
  var PI = Math.PI, TAU = PI * 2;
  var canvas, ctx, W = 0, H = 0, raf = 0, t = 0;
  var PLANES = ['glass', 'family', 'membrane', 'atom', 'orbit'];
  var TOOLS = ['map', 'compass', 'globe', 'topo', 'clip'];
  var COLORS = {
    glass: '#c9d1d9', family: '#5ab87a', membrane: '#58a6ff',
    atom: '#d2a8ff', orbit: '#f0e68c', tool: '#8b949e',
    nucleus: '#e85d3a', electron: '#58a6ff', photon: '#f0e68c'
  };
  var state = {
    perceive: 'glass',
    tool: 'compass',
    cx: 0, cy: 0, innerR: 80
  };
  var electrons = [
    { n: 3, a: 0.4, falling: 0, ejected: false, vx: 0, vy: 0 },
    { n: 2, a: 2.1, falling: 0, ejected: false, vx: 0, vy: 0 }
  ];
  var photons = [];
  var clips = [];

  function dormant() {
    try { return !!(window._floatOff && window._floatOff.status().dormant); }
    catch (e) { return false; }
  }
  function food() {
    try { return (window._hudStack && window._hudStack.status().food) || 0.62; }
    catch (e) { return 0.62; }
  }
  function metabE() {
    var m = window._chipmunkMetabolism;
    if (!m) return 1 / PI;
    return typeof m.energy === 'function' ? m.energy() : (m.energy || 1 / PI);
  }

  function init() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'inner-plane';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:4;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('click', onClick, true);
    loop();
  }
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function loop() {
    t = performance.now() / 1000;
    stepFalls();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function rOf(n) {
    return state.innerR * (n * n) / 9;
  }

  function stepFalls() {
    electrons.forEach(function (e) {
      if (e.ejected) {
        e.x = (e.x || 0) + e.vx;
        e.y = (e.y || 0) + e.vy;
        e.vx *= 1.01;
        e.vy *= 1.01;
        return;
      }
      if (e.falling > 0) {
        e.falling -= 0.035;
        if (e.falling <= 0) {
          e.falling = 0;
          if (e.n <= 1) eject(e);
          else e.n -= 1;
        }
      }
      e.a += 0.35 / (e.n * e.n);
    });
    photons = photons.filter(function (p) {
      p.life -= 0.02;
      p.r += 1.8;
      return p.life > 0;
    });
    clips = clips.filter(function (c) { c.life -= 0.04; return c.life > 0; });
  }

  function eject(e) {
    var r = rOf(Math.max(1, e.n));
    e.ejected = true;
    e.x = Math.cos(e.a) * r;
    e.y = Math.sin(e.a) * r;
    e.vx = Math.cos(e.a) * 2.4;
    e.vy = Math.sin(e.a) * 2.4;
    if (window._hudViews) window._hudViews.say('squirrel', 'electron fell out of orbit.');
  }

  function clip(n) {
    n = n || occupiedN();
    var hit = null;
    electrons.forEach(function (e) {
      if (!e.ejected && e.n === n && e.falling <= 0) hit = e;
    });
    if (!hit) {
      electrons.forEach(function (e) {
        if (!e.ejected && e.falling <= 0 && (!hit || e.n > hit.n)) hit = e;
      });
    }
    if (!hit) return status();
    var from = hit.n;
    hit.falling = 1;
    clips.push({ n: from, a: hit.a, life: 1 });
    photons.push({
      a: hit.a, r: rOf(from), life: 1,
      to: Math.max(1, from - 1)
    });
    perceive('atom');
    state.tool = 'clip';
    if (window._telephone) window._telephone.hop('user', 'hud', 'clip n=' + from, { silent: true });
    if (window._hudViews) {
      window._hudViews.say('squirrel',
        from <= 1
          ? 'clipped n=1. the electron leaves the atom.'
          : 'clipped n=' + from + '. electron falls toward n=' + (from - 1) + '.');
    }
    return status();
  }

  function occupiedN() {
    var n = 1;
    electrons.forEach(function (e) { if (!e.ejected && e.n > n) n = e.n; });
    return n;
  }

  function perceive(name) {
    if (PLANES.indexOf(name) >= 0) state.perceive = name;
    if (name === 'atom' || name === 'orbit') state.tool = state.tool;
    return status();
  }

  function setTool(name) {
    if (TOOLS.indexOf(name) >= 0) state.tool = name;
    if (window._hudStack && name !== 'clip') {
      try { window._hudStack.instrument(name === 'clip' ? 'map' : name); } catch (e) {}
    }
    return status();
  }

  function onClick(ev) {
    if (dormant()) return;
    if (state.perceive !== 'atom' && state.perceive !== 'orbit') return;
    var tag = (ev.target && ev.target.tagName) || '';
    if (/^(INPUT|TEXTAREA|BUTTON|A|SELECT)$/.test(tag)) return;
    if (ev.target && ev.target.closest && ev.target.closest('button,a,input,textarea,.panel,#log,#input,#cmd-palette-overlay')) return;
    var dx = ev.clientX - state.cx, dy = ev.clientY - state.cy;
    var r = Math.sqrt(dx * dx + dy * dy);
    var best = 0, bestD = 1e9;
    for (var n = 1; n <= 3; n++) {
      var d = Math.abs(r - rOf(n));
      if (d < bestD) { bestD = d; best = n; }
    }
    if (bestD < 18) {
      ev.preventDefault();
      ev.stopPropagation();
      clip(best);
    }
  }

  var PHI = 1.618, PHI_INV = 1 / PHI;

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    /* inner plane sits center-left at the φ⁻¹ seam — tools do not overlap the meta-layers */
    var cx = W * PHI_INV * 0.48;
    var cy = H * PHI_INV;
    var outer = Math.min(W * 0.14, H * 0.17);
    var inner = outer * 0.32;
    state.cx = cx; state.cy = cy; state.innerR = inner * 2.1;
    var dusk = parseFloat(getComputedStyle(document.body).getPropertyValue('--hud-dusk') || '0') || 0;
    var fade = dormant() ? 0.28 : (1 - dusk * 0.4);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = fade;

    drawPlanes(outer);
    drawUser(outer);
    drawTools(inner);
    if (state.perceive === 'atom' || state.perceive === 'orbit') drawAtom();
    ctx.restore();
    drawLegend();
  }

  function drawPlanes(outer) {
    PLANES.forEach(function (p, i) {
      var f = 1 - i / (PLANES.length + 0.6);
      var rx = outer * f, ry = outer * f * 0.72;
      var on = state.perceive === p;
      ctx.globalAlpha = on ? 0.55 : 0.12;
      ctx.strokeStyle = COLORS[p];
      ctx.lineWidth = on ? 1.5 : 0.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
      ctx.stroke();
      if (on) {
        ctx.fillStyle = COLORS[p];
        ctx.font = '9px "Courier New",monospace';
        ctx.textAlign = 'left';
        ctx.fillText(p, rx * 0.72, -ry * 0.15);
      }
    });
  }

  function drawUser(outer) {
    var i = PLANES.indexOf(state.perceive);
    var f = 1 - i / (PLANES.length + 0.6);
    var ang = t * 0.4;
    var x = Math.cos(ang) * outer * f * 0.92;
    var y = Math.sin(ang) * outer * f * 0.66;
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = COLORS.electron;
    ctx.beginPath();
    ctx.arc(x, y, 3.4, 0, TAU);
    ctx.fill();
    ctx.font = '8px "Courier New",monospace';
    ctx.textAlign = 'center';
    ctx.fillText('e⁻ you', x, y - 8);
  }

  function drawTools(inner) {
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, inner, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#3fb950';
    ctx.font = '8px "Courier New",monospace';
    ctx.textAlign = 'center';
    ctx.fillText('inner plane · tools', 0, -inner - 8);

    TOOLS.forEach(function (name, i) {
      var a = -PI / 2 + (i / TOOLS.length) * TAU;
      var x = Math.cos(a) * inner * 0.78;
      var y = Math.sin(a) * inner * 0.78;
      var on = state.tool === name;
      ctx.globalAlpha = on ? 0.95 : 0.4;
      ctx.fillStyle = on ? '#f0e68c' : '#8b949e';
      ctx.beginPath();
      ctx.arc(x, y, on ? 5 : 3, 0, TAU);
      ctx.fill();
      ctx.font = '8px "Courier New",monospace';
      ctx.fillText(name, x, y + 12);
    });

    if (state.tool === 'compass') {
      var heading = (1 - food()) * PI * 0.4 - PI / 2;
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#f0e68c';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(heading) * inner * 0.5, Math.sin(heading) * inner * 0.5);
      ctx.stroke();
    }
    if (state.tool === 'map' || state.tool === 'topo') {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#5ab87a';
      for (var g = -2; g <= 2; g++) {
        ctx.beginPath();
        ctx.moveTo(-inner * 0.4, g * inner * 0.14);
        ctx.lineTo(inner * 0.4, g * inner * 0.14);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(g * inner * 0.14, -inner * 0.4);
        ctx.lineTo(g * inner * 0.14, inner * 0.4);
        ctx.stroke();
      }
    }
    if (state.tool === 'globe') {
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#58a6ff';
      ctx.beginPath();
      ctx.ellipse(0, 0, inner * 0.42, inner * 0.26, 0, 0, TAU);
      ctx.stroke();
    }
    if (state.tool === 'clip') {
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = '#e85d3a';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.lineTo(6, 8);
      ctx.moveTo(-6, 8);
      ctx.lineTo(6, -8);
      ctx.stroke();
    }
  }

  function drawAtom() {
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = COLORS.nucleus;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, TAU);
    ctx.fill();
    ctx.font = '8px "Courier New",monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.nucleus;
    ctx.fillText('p⁺', 0, -8);

    for (var n = 1; n <= 3; n++) {
      var r = rOf(n);
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = COLORS.orbit;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = COLORS.orbit;
      ctx.globalAlpha = 0.55;
      ctx.fillText('n=' + n, r + 10, 3);
    }

    clips.forEach(function (c) {
      var r = rOf(c.n);
      ctx.globalAlpha = c.life;
      ctx.strokeStyle = '#e85d3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(c.a) * (r - 10), Math.sin(c.a) * (r - 10));
      ctx.lineTo(Math.cos(c.a) * (r + 10), Math.sin(c.a) * (r + 10));
      ctx.stroke();
    });

    electrons.forEach(function (e) {
      var x, y;
      if (e.ejected) { x = e.x; y = e.y; }
      else {
        var r = rOf(e.n);
        if (e.falling > 0) r = rOf(e.n) * e.falling + rOf(Math.max(1, e.n - 1)) * (1 - e.falling);
        x = Math.cos(e.a) * r;
        y = Math.sin(e.a) * r;
      }
      ctx.globalAlpha = e.ejected ? 0.5 : 0.95;
      ctx.fillStyle = COLORS.electron;
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, TAU);
      ctx.fill();
      ctx.font = '8px "Courier New",monospace';
      ctx.fillText(e.ejected ? 'e⁻ out' : 'e⁻', x, y - 7);
    });

    photons.forEach(function (p) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = COLORS.photon;
      ctx.beginPath();
      ctx.arc(Math.cos(p.a) * p.r, Math.sin(p.a) * p.r, 2.4, 0, TAU);
      ctx.fill();
    });
  }

  function drawLegend() {
    var x = 14, y = H * 0.22 + 110;
    ctx.textAlign = 'left';
    ctx.font = '9px "Courier New",monospace';
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = COLORS[state.perceive];
    ctx.fillText('you @ ' + state.perceive, x, y);
    ctx.fillStyle = '#8b949e';
    ctx.fillText('tools inner · ' + state.tool, x, y + 14);
    ctx.globalAlpha = 0.4;
    ctx.fillText('clip a line in an atom', x, y + 28);
  }

  function resetAtom() {
    electrons = [
      { n: 3, a: 0.4, falling: 0, ejected: false, vx: 0, vy: 0 },
      { n: 2, a: 2.1, falling: 0, ejected: false, vx: 0, vy: 0 }
    ];
    photons = [];
    clips = [];
    return status();
  }

  function status() {
    var bound = electrons.filter(function (e) { return !e.ejected; }).length;
    var out = electrons.filter(function (e) { return e.ejected; }).length;
    return {
      perceive: state.perceive,
      tool: state.tool,
      planes: PLANES.slice(),
      tools: TOOLS.slice(),
      bound: bound,
      ejected: out,
      note: 'tools on the inner plane. you are at the level you perceive. clip a line, electron falls.'
    };
  }

  window._innerPlane = {
    perceive: perceive,
    tool: setTool,
    clip: clip,
    reset: resetAtom,
    status: status,
    keys: { planes: PLANES, tools: TOOLS }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
