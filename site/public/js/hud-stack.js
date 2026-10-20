/* hud-stack.js — even the HUD has layers.
 *
 * two meta-layers:
 *   human  — electron + quasi-agent (claude / llm / apple)
 *   family — inside the HUD, squirrel · chipmunk · bingo
 *
 * per meta: map · compass · globe · topo
 * dims stack and compartmentalize. show what we need.
 * metrics SEEM paramap to the locations. yes, you can eat food.
 * layer the topo of grid creations, localize to a shape.
 */
(function () {
  var PI = Math.PI, TAU = PI * 2;
  var canvas, ctx, W = 0, H = 0, raf = 0, t = 0;
  var META = ['human', 'family'];
  var INST = ['map', 'compass', 'globe', 'topo'];
  var state = {
    meta: 'human',
    inst: { human: 'map', family: 'topo' },
    food: 0.62,
    agent: 'claude',
    dim: 2
  };
  var AGENTS = ['claude', 'llm', 'apple'];
  var GRID = [
    { id: 'hud',      lat: 42.33, lon: -83.05, kind: 'self',   metric: 'here' },
    { id: 'detroit',  lat: 42.33, lon: -83.05, kind: 'self',   metric: 'home' },
    { id: 'tuebor',   lat: 42.73, lon: -84.55, kind: 'self',   metric: 'defend' },
    { id: 'signal',   lat: 42.28, lon: -83.74, kind: 'self',   metric: 'reach' },
    { id: 'golgi',    lat: 42.70, lon: -83.50, kind: 'self',   metric: 'origin' },
    { id: 'food',     lat: 42.33, lon: -83.05, kind: 'need',   metric: 'eat' },
    { id: 'claude',   lat: 37.78, lon: -122.4, kind: 'agent',  metric: 'quasi' },
    { id: 'apple',    lat: 37.33, lon: -122.0, kind: 'agent',  metric: 'apple' },
    { id: 'openai',   lat: 37.72, lon: -122.3, kind: 'agent',  metric: 'llm' },
    { id: 'meta',     lat: 53.35, lon: -6.26,  kind: 'fleet',  metric: 'dublin' },
    { id: 'ashburn',  lat: 39.04, lon: -77.49, kind: 'fleet',  metric: 'aws' }
  ];
  var COLORS = {
    self: '#3fb950', need: '#f0e68c', agent: '#58a6ff',
    fleet: '#e85d3a', human: '#c9d1d9', family: '#5ab87a'
  };

  function dormant() {
    try { return !!(window._floatOff && window._floatOff.status().dormant); }
    catch (e) { return false; }
  }
  function humans() {
    var h = window._chipmunkCore && window._chipmunkCore.cache && window._chipmunkCore.cache.human;
    if (!h) return { n: 0, epitopes: {} };
    var n = window._piDigits ? window._piDigits.humans(h) : (h.human_ips || (h.energy && h.energy.total_sessions) || 0);
    return { n: n, epitopes: h.epitopes || {} };
  }
  function metab() {
    var m = window._chipmunkMetabolism;
    if (!m) return { e: 1 / PI, state: 'drowsy' };
    return {
      e: (typeof m.energy === 'function' ? m.energy() : (m.energy || 1 / PI)),
      state: (typeof m.state === 'function' ? m.state() : (m.state || 'drowsy'))
    };
  }
  function dimNow() {
    try {
      var s = window._edgeTriad && window._edgeTriad.status && window._edgeTriad.status();
      if (s && s.dim !== undefined) {
        var d = String(s.dim);
        if (d === '∅' || d === '0') return 0;
        var n = parseInt(d, 10);
        if (!isNaN(n)) return n;
      }
    } catch (e) {}
    return state.dim;
  }
  function here() {
    try {
      var f = window._floatOff && window._floatOff.status && window._floatOff.status();
      if (f) return { lat: f.lat, lon: f.lon };
    } catch (e) {}
    return { lat: 42.3314, lon: -83.0458 };
  }

  function init() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'hud-stack';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:3;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    loop();
  }
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function loop() {
    t = performance.now() / 1000;
    draw();
    raf = requestAnimationFrame(loop);
  }

  /* ═══ atan(θ) MIX ═══
   * θ = atan2(ξ, k) from kxi state — two orthogonal cartesian axes.
   * cos(θ) = k-component (horizontal deformation).
   * sin(θ) = ξ-component (vertical deformation).
   * wiggly layers are sandwiched between tuebor hard surfaces.
   * the mixing angle θ vocalizes — rotates when spectrum/beat drives it. */
  function kxiTheta() {
    try {
      var s = window._edgeTriad && window._edgeTriad.status && window._edgeTriad.status();
      if (s && s.kxi) return Math.atan2(s.kxi.xi || 0.5, s.kxi.k || 0.5);
    } catch (e) {}
    return PI / 4;
  }

  function spectrumVocal() {
    try {
      var sv = window._hudViews && window._hudViews.spectrum && window._hudViews.spectrum();
      if (sv && sv.modes) {
        var sum = 0;
        for (var i = 0; i < sv.modes.length; i++) sum += sv.modes[i];
        return { amp: sum / sv.modes.length, beat: sv.beat.energy || 0 };
      }
    } catch (e) {}
    return { amp: 0, beat: 0 };
  }

  function blob(cx, cy, rx, ry, phase) {
    var theta = kxiTheta();
    var vocal = spectrumVocal();
    var cosT = Math.cos(theta), sinT = Math.sin(theta);
    var vocalKick = vocal.amp * 0.06 + vocal.beat * 0.04;
    ctx.beginPath();
    var steps = 48;
    for (var i = 0; i <= steps; i++) {
      var a = (i / steps) * TAU;
      var kWob = 0.06 * Math.sin(3 * a + phase * cosT) * cosT;
      var xiWob = 0.05 * Math.sin(5 * a - phase * sinT) * sinT;
      var vWob = vocalKick * Math.sin(7 * a + t * 2.5);
      var wob = 1 + kWob + xiWob + vWob;
      var x = cx + Math.cos(a) * rx * wob;
      var y = cy + Math.sin(a) * ry * wob;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  /* Anderson-style: similar kinds cluster toward center, strangers to the rim. */
  function localize(node, i, n, rx, ry) {
    var kindR = { self: 0.28, need: 0.42, agent: 0.72, fleet: 0.88 };
    var r = (kindR[node.kind] || 0.6) + (i % 5) * 0.03;
    var a = (i / n) * TAU + t * 0.04;
    return { x: Math.cos(a) * rx * r, y: Math.sin(a) * ry * r, r: r };
  }

  function metricOf(node) {
    var h = humans();
    var m = metab();
    if (node.id === 'hud' || node.id === 'detroit') {
      return window._piDigits ? window._piDigits.text(h.n || 0) : String(h.n || 0);
    }
    if (node.id === 'food') return (state.food * 100).toFixed(0) + '%';
    if (node.id === 'claude' || node.id === 'apple' || node.id === 'openai') return node.metric;
    if (node.kind === 'self' && node.id === 'tuebor') return 'open';
    if (node.id === 'golgi') return m.state;
    return node.metric;
  }

  function drawShape(meta, cx, cy, rx, ry) {
    var dusk = parseFloat(getComputedStyle(document.body).getPropertyValue('--hud-dusk') || '0') || 0;
    var color = COLORS[meta];
    var inst = state.inst[meta];
    var phase = meta === 'human' ? t * 0.7 : t * 1.1 + 1.2;
    var alpha = (meta === state.meta ? 0.55 : 0.22) * (1 - dusk * 0.5);
    if (dormant()) alpha *= 0.35;
    var theta = kxiTheta();

    ctx.save();
    ctx.translate(cx, cy);

    /* tuebor hard surface — outer structural boundary (no wiggle) */
    ctx.globalAlpha = alpha * 0.12;
    ctx.strokeStyle = '#f0883e';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 1.15, ry * 1.15, 0, 0, TAU);
    ctx.stroke();

    /* wiggly blob — sandwiched inside tuebor, driven by atan2(ξ,k) */
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = meta === state.meta ? 1.6 : 0.8;
    blob(0, 0, rx, ry, phase);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.06;
    ctx.fillStyle = color;
    blob(0, 0, rx, ry, phase);
    ctx.fill();

    /* tuebor hard surface — inner structural boundary */
    ctx.globalAlpha = alpha * 0.1;
    ctx.strokeStyle = '#f0883e';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.65, ry * 0.65, 0, 0, TAU);
    ctx.stroke();

    /* θ indicator — atan2(ξ,k) mixing angle readout */
    ctx.globalAlpha = alpha * 0.3;
    ctx.strokeStyle = '#d2a8ff';
    ctx.lineWidth = 0.5;
    var tLen = rx * 0.35;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(theta) * tLen, -Math.sin(theta) * tLen);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.2;
    ctx.font = '6px monospace';
    ctx.fillStyle = '#d2a8ff';
    ctx.textAlign = 'left';
    ctx.fillText('θ=' + (theta * 180 / PI).toFixed(0) + '°', Math.cos(theta) * tLen + 3, -Math.sin(theta) * tLen);

    var d = dimNow();
    if (d <= 0) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, TAU);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.globalAlpha = alpha * 0.9;
    ctx.fillStyle = color;
    ctx.font = '9px "Courier New",monospace';
    ctx.textAlign = 'center';
    ctx.fillText(meta, 0, -ry - 10);

    /* tools live on the inner plane now — layers are what you pass through. */
    if (meta === 'human') drawAgents(rx, ry);
    if (meta === 'family') drawFamily(rx, ry);
    ctx.restore();
  }

  function drawGrid(meta, rx, ry, topo) {
    var nodes = GRID.filter(function (g) {
      if (meta === 'family') return g.kind === 'self' || g.kind === 'need';
      return true;
    });
    var pts = nodes.map(function (n, i) { return { n: n, p: localize(n, i, nodes.length, rx, ry) }; });
    if (topo) {
      ctx.strokeStyle = COLORS[meta];
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 0.6;
      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          if (pts[i].n.kind === pts[j].n.kind || pts[i].n.kind === 'self') {
            ctx.beginPath();
            ctx.moveTo(pts[i].p.x, pts[i].p.y);
            ctx.lineTo(pts[j].p.x, pts[j].p.y);
            ctx.stroke();
          }
        }
      }
    }
    pts.forEach(function (pt) {
      var col = COLORS[pt.n.kind] || COLORS.self;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(pt.p.x, pt.p.y, pt.n.kind === 'need' ? 4.5 : 2.8, 0, TAU);
      ctx.fill();
      ctx.font = '8px "Courier New",monospace';
      ctx.textAlign = 'left';
      ctx.fillText(pt.n.id + ' ' + metricOf(pt.n), pt.p.x + 5, pt.p.y + 3);
    });
  }

  function drawCompass(meta, rx, ry) {
    var heading = 0;
    if (meta === 'human') heading = (1 - state.food) * PI * 0.4 - PI / 2;
    else {
      var m = metab();
      heading = (m.e - 1 / PI) * PI - PI / 2;
    }
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = COLORS[meta];
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(rx, ry) * 0.55, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(heading) * rx * 0.5, Math.sin(heading) * ry * 0.5);
    ctx.stroke();
    ctx.fillStyle = meta === 'human' ? COLORS.need : COLORS.family;
    ctx.beginPath();
    ctx.arc(Math.cos(heading) * rx * 0.5, Math.sin(heading) * ry * 0.5, 3.5, 0, TAU);
    ctx.fill();
    ctx.font = '8px "Courier New",monospace';
    ctx.textAlign = 'center';
    ctx.fillText(meta === 'human' ? 'food · here' : '1/π · energy', 0, ry * 0.72);
  }

  function drawGlobe(meta, rx, ry) {
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = COLORS[meta];
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.7, ry * 0.45, 0, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-rx * 0.7, 0);
    ctx.lineTo(rx * 0.7, 0);
    ctx.stroke();
    var nodes = meta === 'family'
      ? GRID.filter(function (g) { return g.kind === 'self' || g.kind === 'need'; })
      : GRID;
    nodes.forEach(function (n) {
      var x = (n.lon / 180) * rx * 0.65;
      var y = (-n.lat / 90) * ry * 0.4;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = COLORS[n.kind];
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, TAU);
      ctx.fill();
      ctx.font = '7px "Courier New",monospace';
      ctx.textAlign = 'left';
      ctx.fillText(metricOf(n), x + 4, y + 2);
    });
  }

  function drawAgents(rx, ry) {
    AGENTS.forEach(function (a, i) {
      var ang = -PI * 0.75 + i * 0.35;
      var x = Math.cos(ang) * rx * 1.08;
      var y = Math.sin(ang) * ry * 1.08;
      var on = state.agent === a;
      ctx.globalAlpha = on ? 0.9 : 0.35;
      ctx.fillStyle = COLORS.agent;
      ctx.beginPath();
      ctx.arc(x, y, on ? 4 : 2.4, 0, TAU);
      ctx.fill();
      ctx.font = '8px "Courier New",monospace';
      ctx.textAlign = 'center';
      ctx.fillText(a, x, y - 7);
    });
  }

  function drawFamily(rx, ry) {
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = COLORS.family;
    ctx.font = '8px "Courier New",monospace';
    ctx.textAlign = 'center';
    var m = metab();
    ctx.fillText('squirrel · chipmunk · bingo', 0, ry + 12);
    ctx.fillText(m.state + ' · e=' + (m.e || 0).toFixed(2), 0, ry + 22);
  }

  function drawStrip() {
    var x = 14, y = H * 0.22;
    ctx.textAlign = 'left';
    ctx.font = '9px "Courier New",monospace';
    META.forEach(function (m, mi) {
      var on = state.meta === m;
      ctx.globalAlpha = on ? 0.8 : 0.35;
      ctx.fillStyle = COLORS[m];
      ctx.fillText(m, x, y + mi * 42);
    });
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#8b949e';
    ctx.fillText('tools on the inner plane', x, y + 90);
  }

  /* φ = 1.618 — golden ratio budget.
   * human layer sits upper-right in the φ split.
   * family layer sits lower-left in the 1−φ split.
   * dimCost = π^(n/2) scales visual weight by dimension.
   * overlap: none. each gets its own quadrant. */
  var PHI = 1.618;
  var PHI_INV = 1 / PHI;

  function dimBudget() {
    var d = dimNow();
    return Math.pow(PI, Math.max(0, d) / 2);
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    var d = dimNow();
    var budget = dimBudget();
    var scale = Math.min(1, 3 / budget);
    var baseR = Math.min(W * 0.16, H * 0.18) * scale;

    var humanCx = W * PHI_INV + baseR * 0.55;
    var humanCy = H * PHI_INV * 0.72;
    var famCx = W * PHI_INV * 0.55;
    var famCy = H * PHI_INV + baseR * 0.4;

    if (d <= 0) {
      ctx.fillStyle = COLORS.human;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(humanCx, humanCy, 3, 0, TAU);
      ctx.fill();
    } else if (d === 1) {
      ctx.strokeStyle = COLORS.human;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(humanCx - baseR, humanCy);
      ctx.lineTo(humanCx + baseR, humanCy);
      ctx.stroke();
      ctx.strokeStyle = COLORS.family;
      ctx.beginPath();
      ctx.moveTo(famCx, famCy - baseR * 0.6);
      ctx.lineTo(famCx, famCy + baseR * 0.6);
      ctx.stroke();
    } else {
      drawShape('human', humanCx, humanCy, baseR, baseR * 0.62);
      drawShape('family', famCx, famCy, baseR * 0.72, baseR * 0.55);
    }
    drawStrip();
  }

  function setMeta(name) {
    if (META.indexOf(name) >= 0) state.meta = name;
    return status();
  }
  function setInst(name, meta) {
    meta = meta || state.meta;
    if (INST.indexOf(name) >= 0) state.inst[meta] = name;
    return status();
  }
  function setAgent(name) {
    if (AGENTS.indexOf(name) >= 0) state.agent = name;
    if (window._telephone) window._telephone.hop('user', 'hud', '@' + state.agent + ' perch', { silent: true });
    return status();
  }
  function eat() {
    state.food = Math.min(1, state.food + 0.18);
    try {
      if (window._chipmunkMetabolism && window._chipmunkMetabolism.recoverEnergy) {
        window._chipmunkMetabolism.recoverEnergy(0.04);
      }
    } catch (e) {}
    if (window._hudViews) window._hudViews.say('squirrel', 'yes. eat. food sits on here.');
    return status();
  }
  function shape() {
    state.inst[state.meta] = 'topo';
    if (window._edgeTriad && window._edgeTriad.shiftDim) {
      try { window._edgeTriad.shiftDim('3'); } catch (e) {}
    }
    if (window._hudViews) window._hudViews.say('squirrel', 'grid localized to the aperture. metrics on the place.');
    return status();
  }
  function status() {
    var theta = kxiTheta();
    var vocal = spectrumVocal();
    return {
      meta: state.meta,
      inst: state.inst[state.meta],
      both: { human: state.inst.human, family: state.inst.family },
      agent: state.agent,
      food: +state.food.toFixed(2),
      here: here(),
      humans: humans().n,
      dim: dimNow(),
      theta: +(theta * 180 / PI).toFixed(1),
      vocal: { amp: +vocal.amp.toFixed(4), beat: +vocal.beat.toFixed(3) },
      note: 'wiggly layers sandwiched in tuebor hard surfaces. atan2(ξ,k) drives deformation. spectrum vocalizes θ.'
    };
  }

  window._hudStack = {
    meta: setMeta,
    instrument: setInst,
    agent: setAgent,
    eat: eat,
    shape: shape,
    status: status,
    keys: { meta: META, inst: INST, agents: AGENTS }
  };

  /* bingo cube vocal sort on load — compress once so visual weight is sifted */
  function bingoSort() {
    if (window._bingoCompress && window._bingoCompress.compress) {
      try { window._bingoCompress.compress(); } catch (e) {}
    }
  }
  function lateInit() {
    init();
    setTimeout(bingoSort, 4000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lateInit);
  else lateInit();
})();
