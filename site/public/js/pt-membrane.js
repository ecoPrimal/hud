// pt-membrane.js — membrane focal-point SVG + transit animation
// Extracted from hud-pt.js for epitope boundary split
// baseCamp 53: focal points. 55: rotation/wind. 56: transit animation.
window.PtMembrane = function(deps) {
  var PI = deps.PI, dimCost = deps.dimCost, PANELS = deps.PANELS;
  var CAT_COLORS = deps.CAT_COLORS, aliveSet = deps.aliveSet;

  var MG = {W: 700, H: 480, R: 170, cx: 350, cy: 250};
  var mgPanelGeo = {};
  var mgParticles = [];
  var mgPulses = {};
  var mgArcGlow = {};
  var mgSvgEl = null;
  var mgParticleGroup = null;
  var mgBuilt = false;
  var mgLastFrame = 0;
  var mgAnimId = null;
  var MAX_PARTICLES = 60;
  var mgTransitRates = {fire: 0, membrane: 0, immune: 0, sound: 0};
  var mgTransitRPS = 0;
  var mgPrevDash = null;
  var mgCatAccum = {fire: 0, membrane: 0, immune: 0, sound: 0};

  function entityToCategory(label) {
    if (/Anthropic|OpenAI|Meta|Google|Amazon|Apple|Microsoft|ByteDance|Yandex|Baidu/i.test(label)) return 'fire';
    if (/Ghost|proxy|VPN|Tor/i.test(label)) return 'immune';
    if (/Bot|crawler|spider|scanner/i.test(label)) return 'membrane';
    if (/Human|organic/i.test(label)) return 'sound';
    return 'fire';
  }

  function spawnTransitParticle(panelId) {
    var geo = mgPanelGeo[panelId];
    if (!geo) return;
    if (mgParticles.length >= MAX_PARTICLES) return;
    var cx = MG.cx, cy = MG.cy;
    var spawnR = geo.R + 50 + Math.random() * 40;
    var jitter = (Math.random() - 0.5) * 0.15;
    var angle = geo.angle + jitter;
    mgParticles.push({
      id: panelId, angle: angle, r: spawnR,
      targetR: geo.R - geo.focalR,
      speed: 35 + Math.random() * 25 + geo.dim * 8,
      color: geo.color, cat: geo.cat, dim: geo.dim,
      size: 1.0 + geo.dim * 0.4, opacity: 0.0, el: null
    });
  }

  function pulseTangent(panelId) {
    mgPulses[panelId] = {scale: 2.2, decay: 0.92};
    var dot = document.getElementById('mg-dot-' + panelId);
    if (dot) dot.setAttribute('filter', 'url(#mg-pulse)');
  }

  function ingestTransitData(dash, topo) {
    var rps = dash.rps || 0;
    mgTransitRPS = rps;
    var entities = (topo && topo.entities) || [];
    var catTotals = {fire: 0, membrane: 0, immune: 0, sound: 0};
    var totalReqs = 0;
    entities.forEach(function(e) {
      var cat = entityToCategory(e.label || '');
      catTotals[cat] += e.total_requests || 0;
      totalReqs += e.total_requests || 0;
    });
    var scale = totalReqs > 0 ? (rps * 0.3) / totalReqs : 0;
    Object.keys(catTotals).forEach(function(cat) {
      mgTransitRates[cat] = catTotals[cat] * scale;
    });
    Object.keys(catTotals).forEach(function(cat) {
      var pct = totalReqs > 0 ? catTotals[cat] / totalReqs : 0;
      mgArcGlow[cat] = Math.max(mgArcGlow[cat] || 0, pct * 0.6);
    });
    if (mgPrevDash) {
      var prevEpitopes = mgPrevDash.epitope_summary || {};
      var currEpitopes = dash.epitope_summary || {};
      Object.keys(currEpitopes).forEach(function(k) {
        if (currEpitopes[k] !== prevEpitopes[k]) pulseTangent('epitope-summary');
      });
      if (dash.total_requests !== mgPrevDash.total_requests) pulseTangent('summary-kpis');
      if ((dash.fleet_pct || 0) !== (mgPrevDash.fleet_pct || 0)) pulseTangent('honesty');
      var prevClusters = (mgPrevDash.epitope_clusters || []).length;
      var currClusters = (dash.epitope_clusters || []).length;
      if (currClusters !== prevClusters) {
        pulseTangent('bingo');
        pulseTangent('epitope-mx');
        pulseTangent('organism-profile');
      }
    }
    // Update three-body values from dashboard
    var tb = dash.threebody_pi;
    if (tb && tb.emc2) {
      var isV = document.getElementById("mg-body-val-is");
      var wasV = document.getElementById("mg-body-val-was");
      var wbV = document.getElementById("mg-body-val-willbe");
      if (isV) isV.textContent = "E = " + tb.emc2.energy.toFixed(2) + " \u2248 4\u03c0";
      if (wasV) wasV.textContent = "m = " + tb.emc2.mass.toFixed(3);
      if (wbV) wbV.textContent = "c\u00b2 = " + tb.emc2.c_squared.toFixed(2) + " \u2248 3\u03c0";
      // Pulse body rings proportional to values
      var isR = document.getElementById("mg-body-ring-is");
      var wasR = document.getElementById("mg-body-ring-was");
      var wbR = document.getElementById("mg-body-ring-willbe");
      if (isR) isR.setAttribute("r", (12 + tb.emc2.energy * 0.5).toFixed(1));
      if (wasR) wasR.setAttribute("r", (12 + tb.emc2.mass * 4).toFixed(1));
      if (wbR) wbR.setAttribute("r", (12 + tb.emc2.c_squared * 0.6).toFixed(1));
    }
    mgPrevDash = JSON.parse(JSON.stringify(dash));
  }

  function buildMembraneSVG() {
    var el = document.getElementById('membrane-focal-svg');
    if (!el) return;
    mgSvgEl = el;
    var W = MG.W, H = MG.H, cx = MG.cx, cy = MG.cy, R = MG.R;
    var NS = 'http://www.w3.org/2000/svg';
    var catOrder = ['fire', 'membrane', 'immune', 'sound'];
    var catPanels = {};
    catOrder.forEach(function(c) { catPanels[c] = []; });
    PANELS.forEach(function(p) { if (catPanels[p.cat]) catPanels[p.cat].push(p); });
    var totalPanels = PANELS.length;
    var TAU = 2 * PI;
    var GAP = 0.04;
    var usableArc = TAU - GAP * catOrder.length;
    var arcStarts = {}, arcSpans = {};
    var theta = -PI / 2;
    catOrder.forEach(function(cat) {
      var n = catPanels[cat].length;
      var span = (n / totalPanels) * usableArc;
      arcStarts[cat] = theta; arcSpans[cat] = span;
      theta += span + GAP;
    });
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.style.cssText = 'width:100%;max-height:460px;font-family:"Courier New",monospace';
    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<radialGradient id="mg-bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1a1a2e" stop-opacity="0.6"/><stop offset="100%" stop-color="#0d1117" stop-opacity="0.9"/></radialGradient><filter id="mg-glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="mg-pulse"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svg.appendChild(defs);
    var bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('width', W); bg.setAttribute('height', H);
    bg.setAttribute('fill', 'url(#mg-bg)'); bg.setAttribute('rx', '8');
    svg.appendChild(bg);
    var title = document.createElementNS(NS, 'text');
    title.setAttribute('x', W/2); title.setAttribute('y', 22);
    title.setAttribute('text-anchor', 'middle'); title.setAttribute('fill', '#c9d1d9');
    title.setAttribute('font-size', '11');
    title.textContent = 'Membrane \u2014 signal transit through the lens';
    svg.appendChild(title);
    catOrder.forEach(function(cat) {
      var color = CAT_COLORS[cat] || '#6e7681';
      var start = arcStarts[cat], span = arcSpans[cat], end = start + span;
      var x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
      var x2 = cx + R * Math.cos(end), y2 = cy + R * Math.sin(end);
      var la = span > PI ? 1 : 0;
      var arc = document.createElementNS(NS, 'path');
      arc.setAttribute('d', 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A ' + R + ' ' + R + ' 0 ' + la + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1));
      arc.setAttribute('fill', 'none'); arc.setAttribute('stroke', color);
      arc.setAttribute('stroke-width', '2.5'); arc.setAttribute('stroke-opacity', '0.5');
      arc.id = 'mg-arc-' + cat;
      svg.appendChild(arc);
      mgArcGlow[cat] = 0;
      var midA = start + span / 2;
      var catLabels = {fire:'signal',membrane:'membrane',immune:'immune',sound:'beacon'};
      var lbl = document.createElementNS(NS, 'text');
      lbl.setAttribute('x', (cx + (R + 22) * Math.cos(midA)).toFixed(1));
      lbl.setAttribute('y', (cy + (R + 22) * Math.sin(midA)).toFixed(1));
      lbl.setAttribute('text-anchor', 'middle'); lbl.setAttribute('dominant-baseline', 'central');
      lbl.setAttribute('fill', color); lbl.setAttribute('font-size', '8'); lbl.setAttribute('opacity', '0.7');
      lbl.textContent = catLabels[cat] || cat;
      svg.appendChild(lbl);
    });
    catOrder.forEach(function(cat) {
      var panels = catPanels[cat];
      var start = arcStarts[cat], span = arcSpans[cat];
      var color = CAT_COLORS[cat] || '#6e7681';
      panels.forEach(function(p, i) {
        var t = panels.length === 1 ? 0.5 : i / (panels.length - 1);
        var angle = start + span * (0.1 + 0.8 * t);
        var px = cx + R * Math.cos(angle), py = cy + R * Math.sin(angle);
        var txd = -Math.sin(angle), tyd = Math.cos(angle);
        var cost = dimCost(p.dim);
        var focalDist = 1.0 / cost;
        var tangentLen = focalDist * 120;
        var focalR = focalDist * R * 0.85;
        var nxd = -Math.cos(angle), nyd = -Math.sin(angle);
        var fx = px + nxd * focalR, fy = py + nyd * focalR;
        var alive = aliveSet.has(p.id);
        var opacity = alive ? 1.0 : 0.25;
        mgPanelGeo[p.id] = {angle:angle, px:px, py:py, fx:fx, fy:fy, cat:p.cat, dim:p.dim, color:color, focalR:focalR, R:R};
        var tl = document.createElementNS(NS, 'line');
        tl.setAttribute('x1', (px - txd*tangentLen).toFixed(1)); tl.setAttribute('y1', (py - tyd*tangentLen).toFixed(1));
        tl.setAttribute('x2', (px + txd*tangentLen).toFixed(1)); tl.setAttribute('y2', (py + tyd*tangentLen).toFixed(1));
        tl.setAttribute('stroke', color); tl.setAttribute('stroke-width', '1'); tl.setAttribute('stroke-opacity', (opacity*0.6).toFixed(2));
        svg.appendChild(tl);
        var fl = document.createElementNS(NS, 'line');
        fl.setAttribute('x1', px.toFixed(1)); fl.setAttribute('y1', py.toFixed(1));
        fl.setAttribute('x2', fx.toFixed(1)); fl.setAttribute('y2', fy.toFixed(1));
        fl.setAttribute('stroke', color); fl.setAttribute('stroke-width', '0.5');
        fl.setAttribute('stroke-opacity', '0.3'); fl.setAttribute('stroke-dasharray', '3,3');
        fl.id = 'mg-fl-' + p.id; svg.appendChild(fl);
        var fd = document.createElementNS(NS, 'circle');
        fd.setAttribute('cx', fx.toFixed(1)); fd.setAttribute('cy', fy.toFixed(1));
        fd.setAttribute('r', alive ? '2.5' : '1.5'); fd.setAttribute('fill', color);
        fd.setAttribute('opacity', (opacity*0.5).toFixed(2)); fd.id = 'mg-fd-' + p.id; svg.appendChild(fd);
        var td = document.createElementNS(NS, 'circle');
        td.setAttribute('cx', px.toFixed(1)); td.setAttribute('cy', py.toFixed(1));
        var dotR = alive ? Math.max(5 - focalDist * 2, 2) : 2.5;
        td.setAttribute('r', dotR.toFixed(1)); td.setAttribute('fill', color);
        td.setAttribute('opacity', opacity.toFixed(2));
        if (alive) td.setAttribute('filter', 'url(#mg-glow)');
        td.id = 'mg-dot-' + p.id; svg.appendChild(td);
        var labelDist = R + 38 + (p.dim > 2 ? 6 : 0);
        var lx = cx + labelDist * Math.cos(angle), ly = cy + labelDist * Math.sin(angle);
        var rotDeg = angle * 180 / PI;
        if (rotDeg > 90 && rotDeg < 270) rotDeg += 180;
        if (rotDeg < -90 && rotDeg > -270) rotDeg += 180;
        var anchor = (angle > PI/2 && angle < PI*1.5) ? 'end' : 'start';
        if (Math.abs(angle - PI/2) < 0.2 || Math.abs(angle + PI/2) < 0.2) anchor = 'middle';
        var shortTitle = p.title.length > 14 ? p.title.substring(0, 14) : p.title;
        var lb = document.createElementNS(NS, 'text');
        lb.setAttribute('x', lx.toFixed(1)); lb.setAttribute('y', ly.toFixed(1));
        lb.setAttribute('text-anchor', anchor); lb.setAttribute('dominant-baseline', 'central');
        lb.setAttribute('fill', color); lb.setAttribute('font-size', '7'); lb.setAttribute('opacity', (opacity*0.85).toFixed(2));
        lb.setAttribute('transform', 'rotate(' + rotDeg.toFixed(1) + ' ' + lx.toFixed(1) + ' ' + ly.toFixed(1) + ')');
        lb.textContent = shortTitle; svg.appendChild(lb);
        var bDist = R + 52 + (p.dim > 2 ? 6 : 0);
        var bx = cx + bDist * Math.cos(angle), by = cy + bDist * Math.sin(angle);
        var db = document.createElementNS(NS, 'text');
        db.setAttribute('x', bx.toFixed(1)); db.setAttribute('y', by.toFixed(1));
        db.setAttribute('text-anchor', anchor); db.setAttribute('dominant-baseline', 'central');
        db.setAttribute('fill', '#6e7681'); db.setAttribute('font-size', '6'); db.setAttribute('opacity', (opacity*0.6).toFixed(2));
        db.setAttribute('transform', 'rotate(' + rotDeg.toFixed(1) + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1) + ')');
        db.textContent = p.dim + 'D'; svg.appendChild(db);
      });
    });

    // ── Three-body interior: IS / WAS / WILLBE ──
    var BODY_R = R * 0.40;
    var bodyDefs = [
      {id:"is",     label:"IS",     sub:"energy \u2248 4\u03c0",  angle: -Math.PI/2,              color:"#e85d3a"},
      {id:"was",    label:"WAS",    sub:"ground",                    angle: -Math.PI/2 + 2*Math.PI/3, color:"#4a8fb8"},
      {id:"willbe", label:"WILLBE", sub:"predict \u2248 1/d",      angle: -Math.PI/2 + 4*Math.PI/3, color:"#5ab87a"}
    ];
    var bodyPos = {};
    bodyDefs.forEach(function(b) {
      bodyPos[b.id] = {x: cx + BODY_R * Math.cos(b.angle), y: cy + BODY_R * Math.sin(b.angle)};
    });
    // Orbital triangle
    var triD = "M " + bodyPos.is.x.toFixed(1) + " " + bodyPos.is.y.toFixed(1)
      + " L " + bodyPos.was.x.toFixed(1) + " " + bodyPos.was.y.toFixed(1)
      + " L " + bodyPos.willbe.x.toFixed(1) + " " + bodyPos.willbe.y.toFixed(1) + " Z";
    var tri = document.createElementNS(NS, "path");
    tri.setAttribute("d", triD); tri.setAttribute("fill", "none");
    tri.setAttribute("stroke", "#c9d1d9"); tri.setAttribute("stroke-width", "0.5");
    tri.setAttribute("stroke-opacity", "0.12"); tri.setAttribute("stroke-dasharray", "4,6");
    tri.id = "mg-body-tri"; svg.appendChild(tri);
    // Edge labels: E, m, c2 on triangle sides
    var edgeLabels = [
      {from:"is",to:"was",     label:"E = IS/WAS",    color:"#e85d3a"},
      {from:"was",to:"willbe", label:"m = NP/WAS",    color:"#6e7681"},
      {from:"willbe",to:"is",  label:"c\u00b2 = IS/NP", color:"#5ab87a"}
    ];
    edgeLabels.forEach(function(e) {
      var ax = (bodyPos[e.from].x + bodyPos[e.to].x) / 2;
      var ay = (bodyPos[e.from].y + bodyPos[e.to].y) / 2;
      var el = document.createElementNS(NS, "text");
      el.setAttribute("x", ax.toFixed(1)); el.setAttribute("y", ay.toFixed(1));
      el.setAttribute("text-anchor", "middle"); el.setAttribute("dominant-baseline", "central");
      el.setAttribute("fill", e.color); el.setAttribute("font-size", "5.5");
      el.setAttribute("opacity", "0.4"); el.textContent = e.label; svg.appendChild(el);
    });
    // Body nodes
    bodyDefs.forEach(function(b) {
      var pos = bodyPos[b.id];
      var ring = document.createElementNS(NS, "circle");
      ring.setAttribute("cx", pos.x.toFixed(1)); ring.setAttribute("cy", pos.y.toFixed(1));
      ring.setAttribute("r", "16"); ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", b.color); ring.setAttribute("stroke-width", "0.5");
      ring.setAttribute("stroke-opacity", "0.18"); ring.setAttribute("stroke-dasharray", "2,3");
      ring.id = "mg-body-ring-" + b.id; svg.appendChild(ring);
      var dot = document.createElementNS(NS, "circle");
      dot.setAttribute("cx", pos.x.toFixed(1)); dot.setAttribute("cy", pos.y.toFixed(1));
      dot.setAttribute("r", "4.5"); dot.setAttribute("fill", b.color);
      dot.setAttribute("opacity", "0.6"); dot.setAttribute("filter", "url(#mg-glow)");
      dot.id = "mg-body-" + b.id; svg.appendChild(dot);
      var lbl = document.createElementNS(NS, "text");
      lbl.setAttribute("x", pos.x.toFixed(1)); lbl.setAttribute("y", (pos.y - 20).toFixed(1));
      lbl.setAttribute("text-anchor", "middle"); lbl.setAttribute("fill", b.color);
      lbl.setAttribute("font-size", "8.5"); lbl.setAttribute("opacity", "0.85");
      lbl.setAttribute("font-weight", "bold"); lbl.textContent = b.label; svg.appendChild(lbl);
      var sub = document.createElementNS(NS, "text");
      sub.setAttribute("x", pos.x.toFixed(1)); sub.setAttribute("y", (pos.y + 24).toFixed(1));
      sub.setAttribute("text-anchor", "middle"); sub.setAttribute("fill", "#6e7681");
      sub.setAttribute("font-size", "5.5"); sub.setAttribute("opacity", "0.45");
      sub.id = "mg-body-val-" + b.id; sub.textContent = b.sub; svg.appendChild(sub);
    });

    mgParticleGroup = document.createElementNS(NS, 'g');
    mgParticleGroup.id = 'mg-particles'; svg.appendChild(mgParticleGroup);
    var cl1 = document.createElementNS(NS, 'text');
    cl1.setAttribute('x', cx); cl1.setAttribute('y', cy - 8);
    cl1.setAttribute('text-anchor', 'middle'); cl1.setAttribute('fill', '#8b949e');
    cl1.setAttribute('font-size', '9'); cl1.textContent = 'epitopes'; svg.appendChild(cl1);
    var cl2 = document.createElementNS(NS, 'text');
    cl2.setAttribute('x', cx); cl2.setAttribute('y', cy + 6);
    cl2.setAttribute('text-anchor', 'middle'); cl2.setAttribute('fill', '#6e7681');
    cl2.setAttribute('font-size', '7'); cl2.id = 'mg-alive-count';
    cl2.textContent = aliveSet.size + '/' + PANELS.length + ' alive'; svg.appendChild(cl2);
    var lgX = 14, lgY = H - 55;
    var lg0 = document.createElementNS(NS, 'text');
    lg0.setAttribute('x', lgX); lg0.setAttribute('y', lgY);
    lg0.setAttribute('fill', '#6e7681'); lg0.setAttribute('font-size', '7');
    lg0.textContent = 'focal distance = 1/C(n) = 1/\u03C0^(n/2)'; svg.appendChild(lg0);
    lgY += 12;
    [['1D: \u221A\u03C0 \u2248 1.77 \u2192 f = 0.56', '#9b59b6'],
     ['2D: \u03C0 \u2248 3.14 \u2192 f = 0.32', '#4a8fb8'],
     ['3D: \u03C0^1.5 \u2248 5.57 \u2192 f = 0.18', '#5ab87a'],
     ['4D: \u03C0\u00B2 \u2248 9.87 \u2192 f = 0.10', '#e85d3a']
    ].forEach(function(leg) {
      var lc = document.createElementNS(NS, 'circle');
      lc.setAttribute('cx', lgX + 4); lc.setAttribute('cy', lgY - 3);
      lc.setAttribute('r', '3'); lc.setAttribute('fill', leg[1]); lc.setAttribute('opacity', '0.7'); svg.appendChild(lc);
      var lt = document.createElementNS(NS, 'text');
      lt.setAttribute('x', lgX + 12); lt.setAttribute('y', lgY);
      lt.setAttribute('fill', '#6e7681'); lt.setAttribute('font-size', '6.5'); lt.textContent = leg[0]; svg.appendChild(lt);
      lgY += 11;
    });
    var trX = W - 160, trY = H - 30;
    var trD = document.createElementNS(NS, 'circle');
    trD.setAttribute('cx', trX); trD.setAttribute('cy', trY - 3);
    trD.setAttribute('r', '2'); trD.setAttribute('fill', '#58a6ff'); trD.setAttribute('opacity', '0.8'); svg.appendChild(trD);
    var trT = document.createElementNS(NS, 'text');
    trT.setAttribute('x', trX + 7); trT.setAttribute('y', trY);
    trT.setAttribute('fill', '#6e7681'); trT.setAttribute('font-size', '6.5'); trT.textContent = 'signal transit'; svg.appendChild(trT);
    var alD = document.createElementNS(NS, 'circle');
    alD.setAttribute('cx', trX + 62); alD.setAttribute('cy', trY - 3);
    alD.setAttribute('r', '3'); alD.setAttribute('fill', '#5ab87a'); alD.setAttribute('opacity', '1'); svg.appendChild(alD);
    var alT = document.createElementNS(NS, 'text');
    alT.setAttribute('x', trX + 69); alT.setAttribute('y', trY);
    alT.setAttribute('fill', '#6e7681'); alT.setAttribute('font-size', '6.5'); alT.textContent = 'alive'; svg.appendChild(alT);
    var dmD = document.createElementNS(NS, 'circle');
    dmD.setAttribute('cx', trX + 98); dmD.setAttribute('cy', trY - 3);
    dmD.setAttribute('r', '2'); dmD.setAttribute('fill', '#6e7681'); dmD.setAttribute('opacity', '0.25'); svg.appendChild(dmD);
    var dmT = document.createElementNS(NS, 'text');
    dmT.setAttribute('x', trX + 105); dmT.setAttribute('y', trY);
    dmT.setAttribute('fill', '#6e7681'); dmT.setAttribute('font-size', '6.5'); dmT.textContent = 'dormant'; svg.appendChild(dmT);
    el.innerHTML = ''; el.appendChild(svg);
    mgBuilt = true;
  }

  function mgAnimateFrame(now) {
    if (!mgBuilt || !mgParticleGroup) { mgAnimId = requestAnimationFrame(mgAnimateFrame); return; }
    var dt = mgLastFrame ? (now - mgLastFrame) / 1000 : 0.016;
    if (dt > 0.1) dt = 0.1;
    mgLastFrame = now;
    var NS = 'http://www.w3.org/2000/svg';
    var cx = MG.cx, cy = MG.cy, R = MG.R;
    var catOrder = ['fire', 'membrane', 'immune', 'sound'];
    catOrder.forEach(function(cat) {
      var rate = mgTransitRates[cat] || 0;
      if (rate <= 0) return;
      mgCatAccum[cat] += rate * dt;
      while (mgCatAccum[cat] >= 1.0 && mgParticles.length < MAX_PARTICLES) {
        mgCatAccum[cat] -= 1.0;
        var candidates = [];
        aliveSet.forEach(function(id) { var g = mgPanelGeo[id]; if (g && g.cat === cat) candidates.push(id); });
        if (candidates.length > 0) spawnTransitParticle(candidates[Math.floor(Math.random() * candidates.length)]);
      }
    });
    if (mgTransitRPS === 0 && Math.random() < 0.2 * dt * 60) {
      var aliveArr = []; aliveSet.forEach(function(id) { aliveArr.push(id); });
      if (aliveArr.length > 0) spawnTransitParticle(aliveArr[Math.floor(Math.random() * aliveArr.length)]);
    }
    var toRemove = [];
    mgParticles.forEach(function(p, idx) {
      p.r -= p.speed * dt;
      if (p.r > R + 10) { p.opacity = Math.min(p.opacity + dt * 3, 0.85); }
      else if (p.r > R - 5) { p.opacity = 1.0; p.size *= 1.0 + dt * 2; mgArcGlow[p.cat] = Math.min((mgArcGlow[p.cat] || 0) + 0.15, 1.0); }
      else { p.opacity = Math.max(p.opacity - dt * 2.5, 0); p.size = Math.max(p.size - dt * 2, 0.5); }
      if (p.r <= p.targetR || p.opacity <= 0.01) {
        toRemove.push(idx); pulseTangent(p.id);
        if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
        return;
      }
      var px = cx + p.r * Math.cos(p.angle);
      var py = cy + p.r * Math.sin(p.angle);
      if (!p.el) { p.el = document.createElementNS(NS, 'circle'); p.el.setAttribute('fill', p.color); mgParticleGroup.appendChild(p.el); }
      p.el.setAttribute('cx', px.toFixed(1)); p.el.setAttribute('cy', py.toFixed(1));
      p.el.setAttribute('r', p.size.toFixed(1)); p.el.setAttribute('opacity', p.opacity.toFixed(2));
    });
    for (var i = toRemove.length - 1; i >= 0; i--) mgParticles.splice(toRemove[i], 1);
    catOrder.forEach(function(cat) {
      var glow = mgArcGlow[cat] || 0;
      var baseline = 0, totalRate = 0;
      catOrder.forEach(function(c) { totalRate += mgTransitRates[c] || 0; });
      if (totalRate > 0) baseline = ((mgTransitRates[cat] || 0) / totalRate) * 0.5;
      if (glow > baseline) mgArcGlow[cat] = Math.max(glow - dt * 0.3, baseline);
      var arcEl = document.getElementById('mg-arc-' + cat);
      if (arcEl) { arcEl.setAttribute('stroke-width', (2.5 + glow * 3).toFixed(1)); arcEl.setAttribute('stroke-opacity', (0.5 + glow * 0.4).toFixed(2)); }
    });
    Object.keys(mgPulses).forEach(function(pid) {
      var pulse = mgPulses[pid];
      pulse.scale *= pulse.decay;
      if (pulse.scale < 1.05) { delete mgPulses[pid]; var dot = document.getElementById('mg-dot-' + pid); if (dot && aliveSet.has(pid)) dot.setAttribute('filter', 'url(#mg-glow)'); return; }
      var dot = document.getElementById('mg-dot-' + pid);
      if (dot) { var geo = mgPanelGeo[pid]; var baseR = geo ? Math.max(5 - (1.0/dimCost(geo.dim)) * 2, 2) : 3; dot.setAttribute('r', (baseR * pulse.scale).toFixed(1)); }
    });
    var ac = document.getElementById('mg-alive-count');
    if (ac) { var label = aliveSet.size + '/' + PANELS.length + ' alive'; if (mgTransitRPS > 0) label += ' \u00b7 ' + mgTransitRPS.toFixed(1) + ' rps'; ac.textContent = label; }
    mgAnimId = requestAnimationFrame(mgAnimateFrame);
  }

  function renderMembraneSVG() {
    if (!mgBuilt) buildMembraneSVG();
    aliveSet.forEach(function(pid) {
      var dot = document.getElementById('mg-dot-' + pid);
      if (dot) { dot.setAttribute('opacity', '1'); dot.setAttribute('filter', 'url(#mg-glow)'); }
      var fl = document.getElementById('mg-fl-' + pid);
      if (fl) fl.setAttribute('stroke-opacity', '0.3');
      var fd = document.getElementById('mg-fd-' + pid);
      if (fd) { fd.setAttribute('opacity', '0.5'); fd.setAttribute('r', '2.5'); }
    });
  }

  return {
    build: buildMembraneSVG,
    animate: mgAnimateFrame,
    render: renderMembraneSVG,
    ingest: ingestTransitData,
    entityToCategory: entityToCategory,
    panelGeo: mgPanelGeo
  };
};
