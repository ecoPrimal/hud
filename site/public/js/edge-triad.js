/* edge-triad.js — the wild one on the HUD glass
 *
 * Two triangles already exist: white→in, black←out.
 * The third sits at the rim where HUD windshield meets the inside.
 * Three non-collinear vertices = unique orientation. Full rotation.
 *
 * Color bounce on that rim IS the backscatter of the raytrace:
 * ray goes out, hits the edge, returns with wavelength (sort class).
 *
 * On the fly: /geom /dim /persp   also /triad /rim /backscatter
 */
(function () {
  var PI = Math.PI, TAU = PI * 2;
  var canvas, ctx, host, raf = 0, t0 = 0, live = true, W = 0, H = 0;
  var rays = [];
  var GEOM = ['triangle', 'grid', 'mobius', 'sphere', 'kxi'];
  var DIMS = ['∅', '1', '2', '3', '4'];
  var PERSP = ['on', 'inside', 'through', 'above', 'below', 'beside', 'before'];
  var state = { geom: 4, dim: 2, persp: 2, rot: 0, mix: null, through: '', electron: null, blend: 0.5 };
  var KXI = {
    self:     { k: 0.28, xi: 0.72, blend: 0.25 },
    organic:  { k: 0.18, xi: 0.85, blend: 0.55 },
    soap:     { k: 0.42, xi: 0.80, blend: 1.00 },
    aqueous:  { k: 0.45, xi: 0.50, blend: 0.08 },
    partial:  { k: 0.55, xi: 0.40, blend: 0.30 },
    null:     { k: 0.70, xi: 0.18, blend: 0.00 },
    non_self: { k: 0.88, xi: 0.12, blend: 0.00 }
  };
  var EPITOPE_ANGLE = {
    visitor: 0, coder: PI * 0.33, investigator: PI * 0.67,
    reader: PI, explorer: PI * 1.33, observer: PI * 1.67
  };
  var COLORS = {
    self: '#3fb950', non_self: '#f85149', partial: '#f0883e',
    null: '#484f58', organic: '#58a6ff', soap: '#d2a8ff', aqueous: '#7ee787'
  };
  var triad = [
    { name: 'in',   label: 'in',   color: '#ffffff', role: 'nucleus' },
    { name: 'out',  label: 'out',  color: '#8b949e', role: 'HUD glass' },
    { name: 'edge', label: '△ edge', color: '#58a6ff', role: 'backscatter', wild: true }
  ];

  function init() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'edge-triad';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:4;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    host = document.getElementById('membrane-focal-svg') || document.body;
    resize();
    window.addEventListener('resize', resize);
    seedRays();
    fetchLive();
    setInterval(fetchLive, 20000);
    t0 = performance.now();
    loop();
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function applyKinds(kinds) {
    if (!kinds || !kinds.length) { seedRays(); return; }
    rays = kinds.map(function (k, i) {
      return {
        a: (i / kinds.length) * TAU,
        phase: Math.random(),
        kind: k,
        speed: 0.14 + (i % 7) * 0.03
      };
    });
  }

  function seedRays() {
    applyKinds(['soap', 'organic', 'self', 'non_self', 'partial', 'aqueous', 'organic', 'self', 'soap', 'non_self', 'partial', 'aqueous', 'organic', 'self', 'aqueous', 'null', 'organic', 'self', 'aqueous', 'partial', 'soap', 'non_self', 'organic', 'self']);
  }

  function fetchLive() {
    fetch('/triad.json').then(function (r) { return r.json(); }).catch(function () { return null; }).then(function (d) {
      if (d && d.kinds) {
        applyKinds(d.kinds);
        state.mix = d.mix;
        state.through = (d.io && d.io.through) || '';
        return;
      }
      return Promise.all([
        fetch('/now.json').then(function (r) { return r.json(); }).catch(function () { return {}; }),
        fetch('/backscatter.json').then(function (r) { return r.json(); }).catch(function () { return {}; }),
        fetch('/amphiphile.json').then(function (r) { return r.json(); }).catch(function () { return {}; })
      ]).then(function (pack) {
        var now = pack[0] || {}, bs = pack[1] || {}, am = pack[2] || {};
        var cls = now.classification || {};
        var soap = ((am.laws || {}).soap || {}).ok;
        var kinds = [];
        var n = 24;
        function push(k, w) { for (var i = 0; i < Math.max(0, Math.round(w * n)); i++) kinds.push(k); }
        push('self', (cls.self || 0) / Math.max(cls.total || 1, 1));
        push('organic', ((now.flow || {}).human_pct) || 0.1);
        push('soap', soap ? 0.12 : 0);
        push('non_self', ((cls.non_self || 0) / Math.max(cls.total || 1, 1)) + ((bs.hostile_pct || 0) / 100));
        push('partial', (cls.partial || 0) / Math.max(cls.total || 1, 1));
        while (kinds.length < n) kinds.push('aqueous');
        applyKinds(kinds.slice(0, n));
        state.through = soap ? 'soap film' : 'bounce';
      });
    });
  }

  function applyShift(continuous) {
    if (!host) return;
    var g = GEOM[state.geom], d = DIMS[state.dim], p = PERSP[state.persp];
    var rot = state.rot * 180 / PI;
    if (g === 'kxi') {
      if (host) host.style.transform = '';
      return;
    }
    var liveGeom = (g === 'mobius' || g === 'sphere' || d === '4');
    if (continuous && !liveGeom) return;
    var t = [];
    if (g === 'mobius') t.push('perspective(900px) rotateY(' + rot + 'deg) rotateZ(' + (rot * 0.31) + 'deg)');
    else if (g === 'sphere') t.push('perspective(800px) rotateX(' + (10 + Math.sin(state.rot) * 16) + 'deg) rotateZ(' + (rot * 0.18) + 'deg)');
    if (d === '∅') t.push('scale(0.92)');
    else if (d === '4') t.push('scale(' + (1 + Math.sin(state.rot * 2) * 0.03) + ')');
    var origin = { on: '50% 0%', inside: '50% 50%', through: '50% 50%', above: '50% 0%', below: '50% 100%', beside: '0% 50%', before: '50% 50%' };
    host.style.transformOrigin = origin[p] || '50% 50%';
    host.style.transition = liveGeom ? 'none' : 'transform 0.55s cubic-bezier(.2,.8,.2,1)';
    host.style.transform = t.join(' ') || '';
    host.dataset.geom = g;
    host.dataset.dim = d;
    host.dataset.persp = p;
  }

  function verts(cx, cy, R, rot) {
    return triad.map(function (tri, i) {
      var a = -PI / 2 + i * TAU / 3 + rot;
      return { tri: tri, a: a, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
    });
  }

  function projectKxi(k, xi, blend, ox, oy, R) {
    var x = ox + k * R * 1.55;
    var y = oy - xi * R * 1.55;
    var z = (blend - 0.5) * R * 0.7 * (0.35 + state.blend);
    x += z * 0.55;
    y -= z * 0.28;
    return { x: x, y: y, z: z };
  }

  function drawKxi(cx, cy, R, dt) {
    var dim = DIMS[state.dim];
    var ox = cx - R * 0.55, oy = cy + R * 0.45;
    var pK = projectKxi(1, 0, 0, ox, oy, R);
    var pX = projectKxi(0, 1, 0, ox, oy, R);
    var pB = projectKxi(0, 0, 1, ox, oy, R);
    var o = projectKxi(0, 0, 0, ox, oy, R);

    function axis(to, color, label) {
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = color;
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, to.x + 14, to.y);
    }
    if (dim !== '∅') {
      if (dim === '1' || dim === '2' || dim === '3' || dim === '4') axis(pK, '#f0883e', 'k');
      if (dim === '2' || dim === '3' || dim === '4') axis(pX, '#7ee787', 'ξ');
      if (dim === '3' || dim === '4') axis(pB, '#d2a8ff', 'blend');
    }

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#8b949e';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('cartesian  k ⊥ ξ ⊥ blend  — not a spin', o.x, o.y + 22);

    if (dim === '∅') return;
    rays.forEach(function (ray) {
      ray.phase += dt * ray.speed;
      if (ray.phase >= 2) ray.phase -= 2;
      var base = KXI[ray.kind] || KXI.aqueous;
      var goingOut = ray.phase < 1;
      var frac = goingOut ? ray.phase : 2 - ray.phase;
      var k = goingOut ? base.k * frac : base.k;
      var xi = goingOut ? base.xi * 0.15 : (base.xi * frac);
      if (ray.kind === 'non_self' || ray.kind === 'null') {
        xi = goingOut ? 0.08 : base.xi * (1 - frac);
      }
      var b = base.blend * (0.4 + state.blend);
      var p = projectKxi(k, xi, b, ox, oy, R);
      var col = goingOut ? COLORS.aqueous : (COLORS[ray.kind] || COLORS.partial);
      ctx.beginPath();
      ctx.arc(p.x, p.y, goingOut ? 1.7 : 2.8 + b * 2, 0, TAU);
      ctx.globalAlpha = goingOut ? 0.35 : 0.85;
      ctx.fillStyle = col;
      ctx.fill();
    });

    if (state.electron) {
      var e = projectKxi(0.12, 0.9, 0.6, ox, oy, R);
      ctx.beginPath();
      ctx.arc(e.x, e.y, 4.5, 0, TAU);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.fillText('e⁻', e.x + 12, e.y - 4);
    }
  }

  function drawTri(x, y, a, color, s, wild) {
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * s, y + Math.sin(a) * s);
    ctx.lineTo(x + Math.cos(a + 2.4) * s * 0.55, y + Math.sin(a + 2.4) * s * 0.55);
    ctx.lineTo(x + Math.cos(a - 2.4) * s * 0.55, y + Math.sin(a - 2.4) * s * 0.55);
    ctx.closePath();
    ctx.globalAlpha = wild ? 0.9 : 0.55;
    ctx.fillStyle = color;
    ctx.fill();
    if (wild) { ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke(); }
  }

  function loop() {
    if (!live) { raf = requestAnimationFrame(loop); return; }
    if (!ctx) return;
    var now = performance.now();
    var dt = Math.min(0.05, (now - t0) / 1000 || 0.016);
    t0 = now;
    var you = window._youAreHere && window._youAreHere.observe ? window._youAreHere.observe() : null;
    state.electron = you;
    if (you && you.epitope) {
      var want = EPITOPE_ANGLE[you.epitope] || 0;
      var edgeRest = -PI / 2 + 2 * TAU / 3;
      var lock = want - edgeRest;
      state.rot = lock + Math.sin(now / 1800) * 0.08;
    } else {
      state.rot = (state.rot + dt * 0.12) % TAU;
    }

    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2;
    var R = Math.min(W, H) * 0.42;
    var rim = R * 1.05;
    var dim = DIMS[state.dim];
    var geom = GEOM[state.geom];

    if (geom === 'kxi') {
      drawKxi(cx, cy, R, dt);
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#58a6ff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('geom kξ  ·  dim ' + dim + '  ·  persp ' + PERSP[state.persp] + '  ·  blend ' + state.blend.toFixed(2) + (state.through ? '  ·  ' + state.through : '') + (state.electron ? '  ·  e⁻ ' + state.electron.epitope : ''), cx, H - 52);
      applyShift(true);
      raf = requestAnimationFrame(loop);
      return;
    }

    if (dim !== '∅' && dim !== '1') {
      var rings = dim === '4' ? 6 : 4;
      for (var i = 1; i <= rings; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.45 + 0.6 * i / rings), 0, TAU);
        ctx.strokeStyle = '#1f6feb';
        ctx.globalAlpha = 0.08 + (i === rings ? 0.08 : 0);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      var spokes = geom === 'triangle' ? 3 : 12;
      for (var s = 0; s < spokes; s++) {
        var sa = s * TAU / spokes + (geom === 'grid' ? 0 : state.rot * 0.12);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sa) * rim, cy + Math.sin(sa) * rim);
        ctx.strokeStyle = '#30363d';
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }

    var V = verts(cx, cy, rim, state.rot);
    if (dim === '2' || dim === '3' || dim === '4' || geom === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(V[0].x, V[0].y);
      V.forEach(function (v) { ctx.lineTo(v.x, v.y); });
      ctx.closePath();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#58a6ff';
      ctx.fill();
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = '#58a6ff';
      ctx.lineWidth = 1.4;
      ctx.setLineDash(geom === 'mobius' ? [6, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    V.forEach(function (v) {
      var pointing = v.tri.name === 'in' ? v.a + PI : v.tri.name === 'out' ? v.a : v.a + PI / 2;
      drawTri(v.x, v.y, pointing, v.tri.color, Math.max(18, R * 0.06), v.tri.wild);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = v.tri.color;
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(v.tri.label, v.x + Math.cos(v.a) * 22, v.y + Math.sin(v.a) * 22);
    });

    if (dim !== '∅') {
      rays.forEach(function (ray) {
        ray.phase += dt * ray.speed;
        if (ray.phase >= 2) ray.phase -= 2;
        var goingOut = ray.phase < 1;
        var frac = goingOut ? ray.phase : 2 - ray.phase;
        var a = ray.a + state.rot * 0.15;
        var x = cx + Math.cos(a) * rim * frac;
        var y = cy + Math.sin(a) * rim * frac;
        var col = goingOut ? COLORS.aqueous : (COLORS[ray.kind] || COLORS.partial);
        if (dim === '1') {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.strokeStyle = col;
          ctx.globalAlpha = goingOut ? 0.2 : 0.5;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, goingOut ? 1.6 : 2.6, 0, TAU);
        ctx.globalAlpha = goingOut ? 0.4 : 0.9;
        ctx.fillStyle = col;
        ctx.fill();
        if (!goingOut && dim !== '1') {
          var scatter = (1 - frac) * R * 0.1;
          var n = ray.a + PI / 2;
          ctx.globalAlpha = 0.35 * frac;
          ctx.beginPath();
          ctx.arc(x + Math.cos(n) * scatter, y + Math.sin(n) * scatter, 1.4, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x - Math.cos(n) * scatter * 0.7, y - Math.sin(n) * scatter * 0.7, 1.2, 0, TAU);
          ctx.fill();
        }
      });
    }

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#58a6ff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    var mixLine = state.mix
      ? '  ·  org ' + Math.round((state.mix.organic || 0) * 100) + '% bounce ' + Math.round((state.mix.non_self || 0) * 100) + '% soap ' + Math.round((state.mix.soap || 0) * 100) + '%'
      : '';
    var eLine = state.electron ? '  ·  e⁻ ' + state.electron.epitope : '';
    ctx.fillText('geom ' + GEOM[state.geom] + '  ·  dim ' + DIMS[state.dim] + '  ·  persp ' + PERSP[state.persp] + '  ·  triad locked' + mixLine + eLine + (state.through ? '  ·  ' + state.through : ''), cx, H - 52);

    applyShift(true);
    raf = requestAnimationFrame(loop);
  }

  function status() {
    return {
      geom: GEOM[state.geom],
      dim: DIMS[state.dim],
      persp: PERSP[state.persp],
      rotation: +state.rot.toFixed(3),
      mix: state.mix,
      through: state.through,
      electron: state.electron && state.electron.epitope,
      blend: state.blend,
      triad: triad.map(function (t) { return t.name + ':' + t.role; }),
      note: GEOM[state.geom] === 'kxi'
        ? 'cartesian k ⊥ ξ ⊥ blend — orthogonal Anderson axes, not spinning 2D'
        : 'in + out + edge = full rotation. color bounce = backscatter of the ray.'
    };
  }

  function cycle(listName, name) {
    var list = listName === 'geom' ? GEOM : listName === 'dim' ? DIMS : PERSP;
    var key = listName === 'geom' ? 'geom' : listName === 'dim' ? 'dim' : 'persp';
    if (name) {
      var i = list.indexOf(name);
      if (i < 0) i = list.findIndex(function (x) { return x.indexOf(name) === 0; });
      if (i >= 0) state[key] = i;
    } else {
      state[key] = (state[key] + 1) % list.length;
    }
    applyShift(false);
    return status();
  }

  window._edgeTriad = {
    toggle: function () { live = !live; canvas.style.display = live ? 'block' : 'none'; if (live && !raf) loop(); return live; },
    shiftGeom: function (n) { return cycle('geom', n); },
    shiftDim: function (n) { return cycle('dim', n); },
    shiftPersp: function (n) { return cycle('persp', n); },
    shiftBlend: function (n) {
      if (n === undefined || n === '') state.blend = (state.blend + 0.25) % 1.0001;
      else state.blend = Math.max(0, Math.min(1, parseFloat(n)));
      if (GEOM[state.geom] !== 'kxi') cycle('geom', 'kxi');
      return status();
    },
    status: status,
    show: function () { live = true; if (canvas) canvas.style.display = 'block'; return status(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
