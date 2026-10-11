// hud-pt.js — petalTongue bridge for hud.primals.eco
// Dimensional Cost Layout: C(n) ∝ π^(n/2)
// Epitope Sort: panels cluster by data availability + behavioral affinity
// baseCamp 52: GoG + Manim = Full Life
(function() {
  'use strict';

  var PI = Math.PI;

  // ═══════════════════════════════════════════════════════════
  // DIMENSIONAL COST — C(n) ∝ π^(n/2)
  // Higher-dimensional data costs more visual weight
  // ═══════════════════════════════════════════════════════════

  function dimCost(n) { return Math.pow(PI, n / 2); }

  // Panel registry: id → { title, subtitle, dimensions, equation, category }
  var PANELS = [
    // Signal (fire) — outside the membrane
    {id: 'summary-kpis',     title: 'Live Signal',               sub: 'RPS, fleet IPs, human IPs, fleet %, machine confidence.',
     dim: 2, eq: 'C(2) = π ≈ 3.14',    cat: 'fire',   full: true},

    // 3D panels — highest visual weight
    {id: 'bingo',            title: 'Bingo Cube',                 sub: 'Attention × Curiosity × Interaction.',
     dim: 3, eq: 'C(3) = π^1.5 ≈ 5.57', cat: 'membrane'},
    {id: 'fp-scatter',       title: 'Fingerprint Space',          sub: 'UA pool × IP count × behavioral shape.',
     dim: 3, eq: 'C(3) = π^1.5 ≈ 5.57', cat: 'membrane'},
    {id: 'organism-profile',  title: 'Organism Profile',          sub: 'Per-organism IPs × UA pool × blame%. Each facet = one fingerprint cluster.',
     dim: 3, eq: 'C(3) = π^1.5 ≈ 5.57', cat: 'membrane', full: true},

    // 2D panels — standard weight
    {id: 'epitope-summary',  title: 'Epitope Summary',            sub: 'Organism detection counts.',
     dim: 2, eq: 'C(2) = π',            cat: 'membrane'},
    {id: 'entity-pop',       title: 'Entity Population',          sub: 'Request volume by classified entity.',
     dim: 2, eq: 'C(2) = π',            cat: 'fire'},
    {id: 'collision',        title: 'Collision Detection',         sub: 'Coordination patterns.',
     dim: 2, eq: 'C(2) = π',            cat: 'immune'},
    {id: 'asn',              title: 'ASN Infrastructure',          sub: 'Where traffic originates.',
     dim: 2, eq: 'C(2) = π',            cat: 'fire'},
    {id: 'paths',            title: 'Path Classification',         sub: 'What the fleet targets.',
     dim: 2, eq: 'C(2) = π',            cat: 'fire'},
    {id: 'offenders',        title: 'Top Offenders',               sub: 'Highest-volume sources.',
     dim: 2, eq: 'C(2) = π',            cat: 'fire'},
    {id: 'targets',          title: 'Target Repos',                sub: 'Which repos targeted.',
     dim: 2, eq: 'C(2) = π',            cat: 'fire'},
    {id: 'geo',              title: 'Geographic Distribution',     sub: 'Requests per country.',
     dim: 2, eq: 'C(2) = π',            cat: 'fire'},
    {id: 'subnets',          title: 'Network Blocks',              sub: 'Subnet concentration.',
     dim: 2, eq: 'C(2) = π',            cat: 'fire'},

    // 1D panels — lightest weight
    {id: 'honesty',          title: 'Fleet Honesty',               sub: 'Proportion of honest traffic.',
     dim: 1, eq: 'C(1) = √π ≈ 1.77',   cat: 'immune'},
    {id: 'timing-cv',        title: 'Timing CV',                   sub: 'Coefficient of variation.',
     dim: 1, eq: 'C(1) = √π',           cat: 'immune'},
    {id: 'timing-interval',  title: 'Timing Interval',             sub: 'Mean ms between requests.',
     dim: 1, eq: 'C(1) = √π',           cat: 'immune'},

    // Matrices (4D) — highest cost
    {id: 'epitope-mx',       title: 'Epitope Matrix',              sub: 'Organisms × features.',
     dim: 4, eq: 'C(4) = π² ≈ 9.87',   cat: 'membrane'},
    {id: 'geo-mx',           title: 'Geographic × Entity',         sub: 'Country × entity type.',
     dim: 4, eq: 'C(4) = π²',           cat: 'fire'},
    {id: 'comparative',      title: 'Comparative Fingerprints',    sub: 'Entity × feature matrix.',
     dim: 4, eq: 'C(4) = π²',           cat: 'membrane'},
    {id: 'entity-matrix',    title: 'Entity Behavioral Matrix',    sub: 'Full comparison across all entities.',
     dim: 4, eq: 'C(4) = π²',           cat: 'membrane', full: true},

    // Selectivity (immune surface)
    {id: 'relay-selectivity', title: 'Anderson Selectivity',       sub: 'S = max(P) − min(P) — live.',
     dim: 1, eq: 'C(1) = √π',           cat: 'immune'},
    {id: 'relay-permeability',title: 'Per-Mode Permeability',      sub: 'Observed P per transport mode.',
     dim: 2, eq: 'C(2) = π',            cat: 'immune'},

    // Detail (faceted)
    {id: 'entity-gauges',    title: 'Entity Timing Gauges',        sub: 'Per-entity timing CV. Low CV = machine.',
     dim: 2, eq: 'C(2) = π',            cat: 'immune', full: true},
    {id: 'entity-detail',    title: 'Entity Behavioral Profile',   sub: 'Per-entity Chrome Lag, Blame%, RPS.',
     dim: 3, eq: 'C(3) = π^1.5',        cat: 'membrane', full: true},
    {id: 'organism-lang',    title: 'Accept-Language',              sub: 'Human vs machine tell — donut.',
     dim: 1, eq: 'C(1) = √π',           cat: 'membrane'},
  ];

  // Sort by dimensional cost (descending) — highest-dimension panels first
  function epitopeSort(panels, aliveSet) {
    return panels.slice().sort(function(a, b) {
      // Alive panels always before dead
      var aAlive = aliveSet.has(a.id) ? 1 : 0;
      var bAlive = aliveSet.has(b.id) ? 1 : 0;
      if (aAlive !== bAlive) return bAlive - aAlive;
      // Full-width panels maintain section breaks
      if (a.full && !b.full) return -1;
      if (!a.full && b.full) return 1;
      // Within alive/dead: sort by dimensional cost descending
      return dimCost(b.dim) - dimCost(a.dim);
    });
  }

  // Category colors (signal/beacon/membrane model)
  var CAT_COLORS = {
    fire: '#e85d3a',     // signal — outside
    sound: '#4a8fb8',    // beacon — inside
    membrane: '#5ab87a', // engagement surface
    immune: '#9b59b6'    // defense
  };

  // ═══════════════════════════════════════════════════════════
  // MEMBRANE FOCAL-POINT SVG — the live lens
  // Each epitope is a tangent point on the membrane circle.
  // Focal distance = 1 / C(n) = 1 / π^(n/2).
  // baseCamp 53: focal points. 55: rotation/wind. 56: transit animation.
  // Waves pass through the membrane. Known at time n → P.
  // ═══════════════════════════════════════════════════════════

  var MG = {W: 700, H: 480, R: 170, cx: 350, cy: 250};
  var mgPanelGeo = {}; // panelId → {angle, px, py, fx, fy, cat, dim, color}
  var mgParticles = [];
  var mgPulses = {};   // panelId → {scale, decay}
  var mgArcGlow = {};  // cat → intensity (0→1)
  var mgSvgEl = null;
  var mgParticleGroup = null;
  var mgBuilt = false;
  var mgLastFrame = 0;
  var mgAnimId = null;
  var MAX_PARTICLES = 60;

  function buildMembraneSVG() {
    var el = document.getElementById('membrane-focal-svg');
    if (!el) return;
    mgSvgEl = el;

    var W = MG.W, H = MG.H, cx = MG.cx, cy = MG.cy, R = MG.R;
    var NS = 'http://www.w3.org/2000/svg';

    var catOrder = ['fire', 'membrane', 'immune', 'sound'];
    var catPanels = {};
    catOrder.forEach(function(c) { catPanels[c] = []; });
    PANELS.forEach(function(p) {
      if (catPanels[p.cat]) catPanels[p.cat].push(p);
    });

    var totalPanels = PANELS.length;
    var TAU = 2 * PI;
    var GAP = 0.04;
    var usableArc = TAU - GAP * catOrder.length;

    var arcStarts = {}, arcSpans = {};
    var theta = -PI / 2;
    catOrder.forEach(function(cat) {
      var n = catPanels[cat].length;
      var span = (n / totalPanels) * usableArc;
      arcStarts[cat] = theta;
      arcSpans[cat] = span;
      theta += span + GAP;
    });

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.style.cssText = 'width:100%;max-height:460px;font-family:"Courier New",monospace';

    // Defs
    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<radialGradient id="mg-bg" cx="50%" cy="50%" r="50%">'
      + '<stop offset="0%" stop-color="#1a1a2e" stop-opacity="0.6"/>'
      + '<stop offset="100%" stop-color="#0d1117" stop-opacity="0.9"/>'
      + '</radialGradient>'
      + '<filter id="mg-glow"><feGaussianBlur stdDeviation="2" result="blur"/>'
      + '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
      + '<filter id="mg-pulse"><feGaussianBlur stdDeviation="4" result="blur"/>'
      + '<feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svg.appendChild(defs);

    // Background
    var bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('width', W); bg.setAttribute('height', H);
    bg.setAttribute('fill', 'url(#mg-bg)'); bg.setAttribute('rx', '8');
    svg.appendChild(bg);

    // Title
    var title = document.createElementNS(NS, 'text');
    title.setAttribute('x', W/2); title.setAttribute('y', 22);
    title.setAttribute('text-anchor', 'middle'); title.setAttribute('fill', '#c9d1d9');
    title.setAttribute('font-size', '11');
    title.textContent = 'Membrane — signal transit through the lens';
    svg.appendChild(title);

    // Category arcs
    catOrder.forEach(function(cat) {
      var color = CAT_COLORS[cat] || '#6e7681';
      var start = arcStarts[cat], span = arcSpans[cat], end = start + span;
      var x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
      var x2 = cx + R * Math.cos(end), y2 = cy + R * Math.sin(end);
      var la = span > PI ? 1 : 0;

      var arc = document.createElementNS(NS, 'path');
      arc.setAttribute('d', 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1)
        + ' A ' + R + ' ' + R + ' 0 ' + la + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1));
      arc.setAttribute('fill', 'none');
      arc.setAttribute('stroke', color);
      arc.setAttribute('stroke-width', '2.5');
      arc.setAttribute('stroke-opacity', '0.5');
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

    // Panel tangent points, focal lines, labels
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

        mgPanelGeo[p.id] = {angle:angle, px:px, py:py, fx:fx, fy:fy,
          cat:p.cat, dim:p.dim, color:color, focalR:focalR, R:R};

        // Tangent line
        var tl = document.createElementNS(NS, 'line');
        tl.setAttribute('x1', (px - txd*tangentLen).toFixed(1));
        tl.setAttribute('y1', (py - tyd*tangentLen).toFixed(1));
        tl.setAttribute('x2', (px + txd*tangentLen).toFixed(1));
        tl.setAttribute('y2', (py + tyd*tangentLen).toFixed(1));
        tl.setAttribute('stroke', color); tl.setAttribute('stroke-width', '1');
        tl.setAttribute('stroke-opacity', (opacity*0.6).toFixed(2));
        svg.appendChild(tl);

        // Focal line (dashed, tangent→focal)
        var fl = document.createElementNS(NS, 'line');
        fl.setAttribute('x1', px.toFixed(1)); fl.setAttribute('y1', py.toFixed(1));
        fl.setAttribute('x2', fx.toFixed(1)); fl.setAttribute('y2', fy.toFixed(1));
        fl.setAttribute('stroke', color); fl.setAttribute('stroke-width', '0.5');
        fl.setAttribute('stroke-opacity', '0.3'); fl.setAttribute('stroke-dasharray', '3,3');
        fl.id = 'mg-fl-' + p.id;
        svg.appendChild(fl);

        // Focal point dot
        var fd = document.createElementNS(NS, 'circle');
        fd.setAttribute('cx', fx.toFixed(1)); fd.setAttribute('cy', fy.toFixed(1));
        fd.setAttribute('r', alive ? '2.5' : '1.5'); fd.setAttribute('fill', color);
        fd.setAttribute('opacity', (opacity*0.5).toFixed(2));
        fd.id = 'mg-fd-' + p.id;
        svg.appendChild(fd);

        // Tangent point dot (the epitope on membrane)
        var td = document.createElementNS(NS, 'circle');
        td.setAttribute('cx', px.toFixed(1)); td.setAttribute('cy', py.toFixed(1));
        var dotR = alive ? Math.max(5 - focalDist * 2, 2) : 2.5;
        td.setAttribute('r', dotR.toFixed(1)); td.setAttribute('fill', color);
        td.setAttribute('opacity', opacity.toFixed(2));
        if (alive) td.setAttribute('filter', 'url(#mg-glow)');
        td.id = 'mg-dot-' + p.id;
        svg.appendChild(td);

        // Label
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
        lb.setAttribute('fill', color); lb.setAttribute('font-size', '7');
        lb.setAttribute('opacity', (opacity*0.85).toFixed(2));
        lb.setAttribute('transform', 'rotate(' + rotDeg.toFixed(1) + ' ' + lx.toFixed(1) + ' ' + ly.toFixed(1) + ')');
        lb.textContent = shortTitle;
        svg.appendChild(lb);

        // Dim badge
        var bDist = R + 52 + (p.dim > 2 ? 6 : 0);
        var bx = cx + bDist * Math.cos(angle), by = cy + bDist * Math.sin(angle);
        var db = document.createElementNS(NS, 'text');
        db.setAttribute('x', bx.toFixed(1)); db.setAttribute('y', by.toFixed(1));
        db.setAttribute('text-anchor', anchor); db.setAttribute('dominant-baseline', 'central');
        db.setAttribute('fill', '#6e7681'); db.setAttribute('font-size', '6');
        db.setAttribute('opacity', (opacity*0.6).toFixed(2));
        db.setAttribute('transform', 'rotate(' + rotDeg.toFixed(1) + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1) + ')');
        db.textContent = p.dim + 'D';
        svg.appendChild(db);
      });
    });

    // Particle layer (animated transit waves go here)
    mgParticleGroup = document.createElementNS(NS, 'g');
    mgParticleGroup.id = 'mg-particles';
    svg.appendChild(mgParticleGroup);

    // Center label
    var cl1 = document.createElementNS(NS, 'text');
    cl1.setAttribute('x', cx); cl1.setAttribute('y', cy - 8);
    cl1.setAttribute('text-anchor', 'middle'); cl1.setAttribute('fill', '#8b949e');
    cl1.setAttribute('font-size', '9'); cl1.textContent = 'membrane';
    svg.appendChild(cl1);
    var cl2 = document.createElementNS(NS, 'text');
    cl2.setAttribute('x', cx); cl2.setAttribute('y', cy + 6);
    cl2.setAttribute('text-anchor', 'middle'); cl2.setAttribute('fill', '#6e7681');
    cl2.setAttribute('font-size', '7'); cl2.id = 'mg-alive-count';
    cl2.textContent = aliveSet.size + '/' + PANELS.length + ' alive';
    svg.appendChild(cl2);

    // Legend
    var lgX = 14, lgY = H - 55;
    var lg0 = document.createElementNS(NS, 'text');
    lg0.setAttribute('x', lgX); lg0.setAttribute('y', lgY);
    lg0.setAttribute('fill', '#6e7681'); lg0.setAttribute('font-size', '7');
    lg0.textContent = 'focal distance = 1/C(n) = 1/\u03C0^(n/2)';
    svg.appendChild(lg0);
    lgY += 12;
    [['1D: \u221A\u03C0 \u2248 1.77 \u2192 f = 0.56', '#9b59b6'],
     ['2D: \u03C0 \u2248 3.14 \u2192 f = 0.32', '#4a8fb8'],
     ['3D: \u03C0^1.5 \u2248 5.57 \u2192 f = 0.18', '#5ab87a'],
     ['4D: \u03C0\u00B2 \u2248 9.87 \u2192 f = 0.10', '#e85d3a']
    ].forEach(function(leg) {
      var lc = document.createElementNS(NS, 'circle');
      lc.setAttribute('cx', lgX + 4); lc.setAttribute('cy', lgY - 3);
      lc.setAttribute('r', '3'); lc.setAttribute('fill', leg[1]); lc.setAttribute('opacity', '0.7');
      svg.appendChild(lc);
      var lt = document.createElementNS(NS, 'text');
      lt.setAttribute('x', lgX + 12); lt.setAttribute('y', lgY);
      lt.setAttribute('fill', '#6e7681'); lt.setAttribute('font-size', '6.5');
      lt.textContent = leg[0];
      svg.appendChild(lt);
      lgY += 11;
    });

    // Transit legend
    var trX = W - 160, trY = H - 30;
    var trD = document.createElementNS(NS, 'circle');
    trD.setAttribute('cx', trX); trD.setAttribute('cy', trY - 3);
    trD.setAttribute('r', '2'); trD.setAttribute('fill', '#58a6ff'); trD.setAttribute('opacity', '0.8');
    svg.appendChild(trD);
    var trT = document.createElementNS(NS, 'text');
    trT.setAttribute('x', trX + 7); trT.setAttribute('y', trY);
    trT.setAttribute('fill', '#6e7681'); trT.setAttribute('font-size', '6.5');
    trT.textContent = 'signal transit';
    svg.appendChild(trT);
    var alD = document.createElementNS(NS, 'circle');
    alD.setAttribute('cx', trX + 62); alD.setAttribute('cy', trY - 3);
    alD.setAttribute('r', '3'); alD.setAttribute('fill', '#5ab87a'); alD.setAttribute('opacity', '1');
    svg.appendChild(alD);
    var alT = document.createElementNS(NS, 'text');
    alT.setAttribute('x', trX + 69); alT.setAttribute('y', trY);
    alT.setAttribute('fill', '#6e7681'); alT.setAttribute('font-size', '6.5');
    alT.textContent = 'alive';
    svg.appendChild(alT);
    var dmD = document.createElementNS(NS, 'circle');
    dmD.setAttribute('cx', trX + 98); dmD.setAttribute('cy', trY - 3);
    dmD.setAttribute('r', '2'); dmD.setAttribute('fill', '#6e7681'); dmD.setAttribute('opacity', '0.25');
    svg.appendChild(dmD);
    var dmT = document.createElementNS(NS, 'text');
    dmT.setAttribute('x', trX + 105); dmT.setAttribute('y', trY);
    dmT.setAttribute('fill', '#6e7681'); dmT.setAttribute('font-size', '6.5');
    dmT.textContent = 'dormant';
    svg.appendChild(dmT);

    el.innerHTML = '';
    el.appendChild(svg);
    mgBuilt = true;
  }

  // ═══════════════════════════════════════════════════════════
  // TRANSIT ENGINE — data-driven signal transit visualization
  // baseCamp 56: known at time n → display is P
  // baseCamp 58: Tufte constraints active on every render
  //
  // Composition: dashboard.json → transit rates by category
  //   → FlowParticle spawn rate ∝ real request volume
  //   → arc glow = real RPS by category
  //   → tangent pulse on data change (differential)
  // ═══════════════════════════════════════════════════════════

  // Transit rate state — fed from dashboard.json each refresh
  var mgTransitRates = {fire: 0, membrane: 0, immune: 0, sound: 0};
  var mgTransitRPS = 0;
  var mgPrevDash = null; // previous dashboard snapshot for diffing

  // Map entity labels to panel categories for spawn routing
  function entityToCategory(label) {
    if (/Anthropic|OpenAI|Meta|Google|Amazon|Apple|Microsoft|ByteDance|Yandex|Baidu/i.test(label)) return 'fire';
    if (/Ghost|proxy|VPN|Tor/i.test(label)) return 'immune';
    if (/Bot|crawler|spider|scanner/i.test(label)) return 'membrane';
    if (/Human|organic/i.test(label)) return 'sound';
    return 'fire';
  }

  // Ingest dashboard.json transit data → compute spawn rates per category
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

    // Normalize to spawn rates: particles per second per category
    // Scale so total spawn rate ≈ rps * 0.3 (visually readable)
    var scale = totalReqs > 0 ? (rps * 0.3) / totalReqs : 0;
    Object.keys(catTotals).forEach(function(cat) {
      mgTransitRates[cat] = catTotals[cat] * scale;
    });

    // Arc glow baseline from real bandwidth
    Object.keys(catTotals).forEach(function(cat) {
      var pct = totalReqs > 0 ? catTotals[cat] / totalReqs : 0;
      mgArcGlow[cat] = Math.max(mgArcGlow[cat] || 0, pct * 0.6);
    });

    // Differential pulse — pulse panels whose values changed
    if (mgPrevDash) {
      var prevEpitopes = mgPrevDash.epitope_summary || {};
      var currEpitopes = dash.epitope_summary || {};
      Object.keys(currEpitopes).forEach(function(k) {
        if (currEpitopes[k] !== prevEpitopes[k]) {
          pulseTangent('epitope-summary');
        }
      });
      if (dash.total_requests !== mgPrevDash.total_requests) {
        pulseTangent('summary-kpis');
      }
      if ((dash.fleet_pct || 0) !== (mgPrevDash.fleet_pct || 0)) {
        pulseTangent('honesty');
      }
      var prevClusters = (mgPrevDash.epitope_clusters || []).length;
      var currClusters = (dash.epitope_clusters || []).length;
      if (currClusters !== prevClusters) {
        pulseTangent('bingo');
        pulseTangent('epitope-mx');
        pulseTangent('organism-profile');
      }
    }
    mgPrevDash = JSON.parse(JSON.stringify(dash));
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
      id: panelId,
      angle: angle,
      r: spawnR,
      targetR: geo.R - geo.focalR,
      speed: 35 + Math.random() * 25 + geo.dim * 8,
      color: geo.color,
      cat: geo.cat,
      dim: geo.dim,
      size: 1.0 + geo.dim * 0.4,
      opacity: 0.0,
      el: null
    });
  }

  function pulseTangent(panelId) {
    mgPulses[panelId] = {scale: 2.2, decay: 0.92};
    var dot = document.getElementById('mg-dot-' + panelId);
    if (dot) dot.setAttribute('filter', 'url(#mg-pulse)');
  }

  // Per-category spawn accumulators for fractional spawning
  var mgCatAccum = {fire: 0, membrane: 0, immune: 0, sound: 0};

  function mgAnimateFrame(now) {
    if (!mgBuilt || !mgParticleGroup) { mgAnimId = requestAnimationFrame(mgAnimateFrame); return; }
    var dt = mgLastFrame ? (now - mgLastFrame) / 1000 : 0.016;
    if (dt > 0.1) dt = 0.1;
    mgLastFrame = now;

    var NS = 'http://www.w3.org/2000/svg';
    var cx = MG.cx, cy = MG.cy, R = MG.R;

    // Data-driven spawning: accumulate fractional particles per category
    var catOrder = ['fire', 'membrane', 'immune', 'sound'];
    catOrder.forEach(function(cat) {
      var rate = mgTransitRates[cat] || 0;
      if (rate <= 0) return;
      mgCatAccum[cat] += rate * dt;

      while (mgCatAccum[cat] >= 1.0 && mgParticles.length < MAX_PARTICLES) {
        mgCatAccum[cat] -= 1.0;
        // Pick a random alive panel in this category
        var candidates = [];
        aliveSet.forEach(function(id) {
          var g = mgPanelGeo[id];
          if (g && g.cat === cat) candidates.push(id);
        });
        if (candidates.length > 0) {
          var pick = candidates[Math.floor(Math.random() * candidates.length)];
          spawnTransitParticle(pick);
        }
      }
    });

    // Fallback: if no transit data yet, spawn occasional random particles
    if (mgTransitRPS === 0 && Math.random() < 0.2 * dt * 60) {
      var aliveArr = [];
      aliveSet.forEach(function(id) { aliveArr.push(id); });
      if (aliveArr.length > 0) {
        var pick = aliveArr[Math.floor(Math.random() * aliveArr.length)];
        spawnTransitParticle(pick);
      }
    }

    // Update particles
    var toRemove = [];
    mgParticles.forEach(function(p, idx) {
      p.r -= p.speed * dt;

      // Fade in during approach
      if (p.r > R + 10) {
        p.opacity = Math.min(p.opacity + dt * 3, 0.85);
      } else if (p.r > R - 5) {
        // At membrane — bright flash
        p.opacity = 1.0;
        p.size *= 1.0 + dt * 2;
        mgArcGlow[p.cat] = Math.min((mgArcGlow[p.cat] || 0) + 0.15, 1.0);
      } else {
        // Past membrane, heading to focal — fade out
        p.opacity = Math.max(p.opacity - dt * 2.5, 0);
        p.size = Math.max(p.size - dt * 2, 0.5);
      }

      if (p.r <= p.targetR || p.opacity <= 0.01) {
        toRemove.push(idx);
        pulseTangent(p.id);
        if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
        return;
      }

      var px = cx + p.r * Math.cos(p.angle);
      var py = cy + p.r * Math.sin(p.angle);

      if (!p.el) {
        p.el = document.createElementNS(NS, 'circle');
        p.el.setAttribute('fill', p.color);
        mgParticleGroup.appendChild(p.el);
      }
      p.el.setAttribute('cx', px.toFixed(1));
      p.el.setAttribute('cy', py.toFixed(1));
      p.el.setAttribute('r', p.size.toFixed(1));
      p.el.setAttribute('opacity', p.opacity.toFixed(2));
    });

    // Remove dead particles (reverse order to preserve indices)
    for (var i = toRemove.length - 1; i >= 0; i--) {
      mgParticles.splice(toRemove[i], 1);
    }

    // Arc glow: data-driven baseline with particle-impact spikes, slow decay
    catOrder.forEach(function(cat) {
      var glow = mgArcGlow[cat] || 0;
      // Decay toward data-driven baseline
      var baseline = 0;
      var totalRate = 0;
      catOrder.forEach(function(c) { totalRate += mgTransitRates[c] || 0; });
      if (totalRate > 0) baseline = ((mgTransitRates[cat] || 0) / totalRate) * 0.5;
      // Decay faster above baseline, slower below
      if (glow > baseline) {
        mgArcGlow[cat] = Math.max(glow - dt * 0.3, baseline);
      }
      var arcEl = document.getElementById('mg-arc-' + cat);
      if (arcEl) {
        var sw = 2.5 + glow * 3;
        var so = 0.5 + glow * 0.4;
        arcEl.setAttribute('stroke-width', sw.toFixed(1));
        arcEl.setAttribute('stroke-opacity', so.toFixed(2));
      }
    });

    // Decay tangent pulses
    Object.keys(mgPulses).forEach(function(pid) {
      var pulse = mgPulses[pid];
      pulse.scale *= pulse.decay;
      if (pulse.scale < 1.05) {
        delete mgPulses[pid];
        var dot = document.getElementById('mg-dot-' + pid);
        if (dot && aliveSet.has(pid)) dot.setAttribute('filter', 'url(#mg-glow)');
        return;
      }
      var dot = document.getElementById('mg-dot-' + pid);
      if (dot) {
        var geo = mgPanelGeo[pid];
        var baseR = geo ? Math.max(5 - (1.0/dimCost(geo.dim)) * 2, 2) : 3;
        dot.setAttribute('r', (baseR * pulse.scale).toFixed(1));
      }
    });

    // Update alive count + RPS display
    var ac = document.getElementById('mg-alive-count');
    if (ac) {
      var label = aliveSet.size + '/' + PANELS.length + ' alive';
      if (mgTransitRPS > 0) label += ' · ' + mgTransitRPS.toFixed(1) + ' rps';
      ac.textContent = label;
    }

    mgAnimId = requestAnimationFrame(mgAnimateFrame);
  }

  // Legacy compat — called from markAlive
  function renderMembraneSVG() {
    if (!mgBuilt) buildMembraneSVG();
    // Update tangent dot states for newly alive panels
    aliveSet.forEach(function(pid) {
      var dot = document.getElementById('mg-dot-' + pid);
      if (dot) {
        dot.setAttribute('opacity', '1');
        dot.setAttribute('filter', 'url(#mg-glow)');
      }
      var fl = document.getElementById('mg-fl-' + pid);
      if (fl) fl.setAttribute('stroke-opacity', '0.3');
      var fd = document.getElementById('mg-fd-' + pid);
      if (fd) { fd.setAttribute('opacity', '0.5'); fd.setAttribute('r', '2.5'); }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // IONOSPHERE GLOBE — earth projection + signal transit arcs
  // The membrane exists in physical space. Visitors arrive from
  // geography. The ionosphere is the signal layer above.
  // ═══════════════════════════════════════════════════════════

  var GLOBE = {W: 700, H: 400, cx: 350, cy: 200};
  var globeSvgEl = null;
  var globeBuilt = false;
  var globeGeoData = null;
  var globeRotation = 0;
  var globeAnimId = null;

  // Country centroids (lon, lat) for projection
  var COUNTRY_POS = {
    US: [-98, 38], CN: [-104, 35], IE: [-8, 53], BY: [28, 53], GB: [-2, 54],
    DE: [10, 51], FR: [2, 46], JP: [138, 36], IN: [78, 22], BR: [-51, -10],
    RU: [100, 60], AU: [134, -25], CA: [-106, 56], KR: [127, 36], SG: [104, 1],
    NL: [5, 52], SE: [16, 62], FI: [26, 64], NO: [10, 62], IL: [35, 31],
    HK: [114, 22], TW: [121, 24], UA: [32, 49], PL: [20, 52], ES: [-4, 40],
    IT: [12, 42], CH: [8, 47], AT: [14, 47], BE: [4, 51], DK: [10, 56],
    MX: [-102, 23], AR: [-64, -34], CL: [-71, -35], CO: [-74, 4], ZA: [26, -29],
    NG: [8, 10], KE: [38, 0], EG: [31, 27], AE: [54, 24], SA: [45, 24],
    TR: [35, 39], GR: [22, 39], CZ: [15, 50], RO: [25, 46], HU: [19, 47],
    'IE/US': [-40, 48], '??': [0, 0]
  };

  // US region centroids (for city-level detail)
  var US_REGIONS = {
    'California': [-120, 37], 'Michigan': [-85, 44], 'Texas': [-99, 31],
    'Virginia': [-79, 38], 'Washington': [-121, 47], 'Colorado': [-106, 39],
    'New Jersey': [-74, 40], 'New York': [-74, 41], 'Massachusetts': [-72, 42],
    'Illinois': [-89, 40], 'Oregon': [-121, 44], 'Arizona': [-112, 34],
    'Florida': [-82, 28], 'Georgia': [-84, 33], 'Pennsylvania': [-78, 41],
    'Ohio': [-83, 40], 'North Carolina': [-80, 35]
  };

  // Epitope interest → color
  var EPITOPE_COLORS = {
    PHYSICS: '#e85d3a', TOPOLOGY: '#9b59b6', PHILOSOPHY: '#3fb950',
    METHOD: '#58a6ff', INVESTIGATION: '#f1c40f', IMMUNE: '#ff6b35',
    SCIENCE: '#e8e8e8', SIGNAL: '#4a8fb8', HOMEPAGE: '#6e7681',
    META: '#484f58', OTHER: '#30363d'
  };

  // Equirectangular projection
  function geoProject(lon, lat) {
    var W = GLOBE.W - 60, H = GLOBE.H - 40;
    var x = 30 + (lon + 180) / 360 * W;
    var y = 20 + (90 - lat) / 180 * H;
    return [x, y];
  }

  // Simplified world coastlines as SVG path data (low-poly)
  var COAST_PATHS = [
    // North America outline
    'M 85,95 L 80,100 75,108 72,118 74,130 82,140 95,148 110,145 115,138 130,135 140,132 148,128 152,120 148,112 140,105 130,100 120,98 105,95 Z',
    // South America
    'M 125,175 L 120,185 118,200 122,220 130,240 138,260 135,275 128,280 130,270 125,255 115,235 112,220 115,200 120,185 Z',
    // Europe
    'M 310,80 L 315,85 325,88 340,85 345,90 350,95 345,100 335,105 320,108 310,105 305,98 308,90 Z',
    // Africa
    'M 310,130 L 305,140 310,155 320,170 330,185 340,200 345,210 340,225 330,230 318,225 305,210 300,195 298,180 295,165 300,150 305,140 Z',
    // Asia
    'M 350,80 L 365,75 385,78 405,80 420,85 440,90 460,95 475,100 480,110 470,118 455,115 440,112 425,105 410,100 395,95 380,90 365,85 Z',
    // Australia
    'M 460,210 L 470,205 485,208 495,215 498,225 492,235 480,238 468,232 460,222 Z'
  ];

  function buildIonosphereSVG(geoData) {
    var el = document.getElementById('ionosphere-svg');
    if (!el) return;

    var W = GLOBE.W, H = GLOBE.H;
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.style.cssText = 'width:100%;max-height:420px;font-family:"Courier New",monospace;cursor:crosshair';

    // Defs
    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<radialGradient id="iono-bg" cx="50%" cy="45%" r="55%">'
      + '<stop offset="0%" stop-color="#0a0e17" stop-opacity="0.9"/>'
      + '<stop offset="100%" stop-color="#050810" stop-opacity="1"/>'
      + '</radialGradient>'
      + '<filter id="iono-glow"><feGaussianBlur stdDeviation="3" result="b"/>'
      + '<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
      + '<filter id="iono-soft"><feGaussianBlur stdDeviation="6" result="b"/>'
      + '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svg.appendChild(defs);

    // Background — deep space
    var bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('width', W); bg.setAttribute('height', H);
    bg.setAttribute('fill', 'url(#iono-bg)'); bg.setAttribute('rx', '8');
    svg.appendChild(bg);

    // Grid lines (latitude/longitude)
    for (var lon = -180; lon <= 180; lon += 30) {
      var p = geoProject(lon, 0);
      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', p[0]); line.setAttribute('y1', 20);
      line.setAttribute('x2', p[0]); line.setAttribute('y2', H - 20);
      line.setAttribute('stroke', '#1a1f2e'); line.setAttribute('stroke-width', '0.5');
      svg.appendChild(line);
    }
    for (var lat = -60; lat <= 80; lat += 20) {
      var pL = geoProject(-180, lat), pR = geoProject(180, lat);
      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', pL[0]); line.setAttribute('y1', pL[1]);
      line.setAttribute('x2', pR[0]); line.setAttribute('y2', pR[1]);
      line.setAttribute('stroke', '#1a1f2e'); line.setAttribute('stroke-width', '0.5');
      svg.appendChild(line);
    }

    // Coastlines — ghostly outlines
    COAST_PATHS.forEach(function(d) {
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#1e2639');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('opacity', '0.6');
      svg.appendChild(path);
    });

    // Title
    var title = document.createElementNS(NS, 'text');
    title.setAttribute('x', W/2); title.setAttribute('y', 14);
    title.setAttribute('text-anchor', 'middle'); title.setAttribute('fill', '#4a8fb8');
    title.setAttribute('font-size', '10'); title.setAttribute('opacity', '0.8');
    title.textContent = 'ionosphere — signal transit across the surface';
    svg.appendChild(title);

    // Membrane origin point (server location — Michigan)
    var memPos = geoProject(-83, 43);
    var memPulse = document.createElementNS(NS, 'circle');
    memPulse.setAttribute('cx', memPos[0]); memPulse.setAttribute('cy', memPos[1]);
    memPulse.setAttribute('r', '12'); memPulse.setAttribute('fill', 'none');
    memPulse.setAttribute('stroke', '#5ab87a'); memPulse.setAttribute('stroke-width', '0.8');
    memPulse.setAttribute('opacity', '0.3');
    var anim = document.createElementNS(NS, 'animate');
    anim.setAttribute('attributeName', 'r'); anim.setAttribute('values', '5;15;5');
    anim.setAttribute('dur', '3s'); anim.setAttribute('repeatCount', 'indefinite');
    memPulse.appendChild(anim);
    var anim2 = document.createElementNS(NS, 'animate');
    anim2.setAttribute('attributeName', 'opacity'); anim2.setAttribute('values', '0.4;0.1;0.4');
    anim2.setAttribute('dur', '3s'); anim2.setAttribute('repeatCount', 'indefinite');
    memPulse.appendChild(anim2);
    svg.appendChild(memPulse);

    var memDot = document.createElementNS(NS, 'circle');
    memDot.setAttribute('cx', memPos[0]); memDot.setAttribute('cy', memPos[1]);
    memDot.setAttribute('r', '3'); memDot.setAttribute('fill', '#5ab87a');
    memDot.setAttribute('filter', 'url(#iono-glow)');
    svg.appendChild(memDot);

    var memLabel = document.createElementNS(NS, 'text');
    memLabel.setAttribute('x', memPos[0]); memLabel.setAttribute('y', memPos[1] - 8);
    memLabel.setAttribute('text-anchor', 'middle'); memLabel.setAttribute('fill', '#5ab87a');
    memLabel.setAttribute('font-size', '7'); memLabel.setAttribute('opacity', '0.7');
    memLabel.textContent = 'membrane';
    svg.appendChild(memLabel);

    // Signal transit arcs layer
    var arcGroup = document.createElementNS(NS, 'g');
    arcGroup.id = 'iono-arcs';
    svg.appendChild(arcGroup);

    // Visitor dots layer
    var dotGroup = document.createElementNS(NS, 'g');
    dotGroup.id = 'iono-dots';
    svg.appendChild(dotGroup);

    // Signal transit particle layer
    var particleGroup = document.createElementNS(NS, 'g');
    particleGroup.id = 'iono-particles';
    svg.appendChild(particleGroup);

    // Render geographic data if available
    if (geoData && geoData.length > 0) {
      renderIonosphereData(svg, geoData);
    }

    // Legend — epitope interest colors
    var lgX = 10, lgY = H - 50;
    var legends = [
      ['signal', '#e85d3a'], ['topology', '#9b59b6'], ['philosophy', '#3fb950'],
      ['method', '#58a6ff'], ['investigation', '#f1c40f'], ['immune', '#ff6b35']
    ];
    legends.forEach(function(leg, i) {
      var row = Math.floor(i / 3);
      var col = i % 3;
      var lx = lgX + col * 80, ly = lgY + row * 11;
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', lx + 4); dot.setAttribute('cy', ly - 2);
      dot.setAttribute('r', '2'); dot.setAttribute('fill', leg[1]); dot.setAttribute('opacity', '0.8');
      svg.appendChild(dot);
      var txt = document.createElementNS(NS, 'text');
      txt.setAttribute('x', lx + 10); txt.setAttribute('y', ly);
      txt.setAttribute('fill', '#6e7681'); txt.setAttribute('font-size', '6');
      txt.textContent = leg[0];
      svg.appendChild(txt);
    });

    // Stats label
    var statLabel = document.createElementNS(NS, 'text');
    statLabel.setAttribute('x', W - 10); statLabel.setAttribute('y', H - 8);
    statLabel.setAttribute('text-anchor', 'end'); statLabel.setAttribute('fill', '#484f58');
    statLabel.setAttribute('font-size', '6');
    statLabel.id = 'iono-stats';
    svg.appendChild(statLabel);

    el.innerHTML = '';
    el.appendChild(svg);
    globeSvgEl = svg;
    globeBuilt = true;
  }

  function renderIonosphereData(svg, geoData) {
    var NS = 'http://www.w3.org/2000/svg';
    var arcGroup = svg.querySelector('#iono-arcs') || svg;
    var dotGroup = svg.querySelector('#iono-dots') || svg;
    var memPos = geoProject(-83, 43);
    var totalReqs = 0;

    geoData.forEach(function(g) { totalReqs += g.requests; });

    geoData.forEach(function(g) {
      if (g.country === '??' || !g.requests) return;
      var pos = COUNTRY_POS[g.country];
      if (!pos) return;

      var p = geoProject(pos[0], pos[1]);
      var pct = totalReqs > 0 ? g.requests / totalReqs : 0;
      var r = Math.max(2, Math.min(12, Math.sqrt(pct) * 20));

      // Transit arc — quadratic bezier from membrane to visitor cluster
      var mx = (memPos[0] + p[0]) / 2;
      var my = Math.min(memPos[1], p[1]) - 20 - pct * 80;
      var arc = document.createElementNS(NS, 'path');
      arc.setAttribute('d', 'M ' + memPos[0] + ' ' + memPos[1]
        + ' Q ' + mx + ' ' + my + ' ' + p[0] + ' ' + p[1]);
      arc.setAttribute('fill', 'none');
      arc.setAttribute('stroke', '#4a8fb8');
      arc.setAttribute('stroke-width', (0.5 + pct * 3).toFixed(1));
      arc.setAttribute('stroke-opacity', (0.15 + pct * 0.4).toFixed(2));
      arc.setAttribute('stroke-dasharray', '3,4');
      arcGroup.appendChild(arc);

      // Ionosphere glow — the signal layer above the arc
      if (pct > 0.05) {
        var ionoGlow = document.createElementNS(NS, 'path');
        ionoGlow.setAttribute('d', 'M ' + memPos[0] + ' ' + memPos[1]
          + ' Q ' + mx + ' ' + (my - 10) + ' ' + p[0] + ' ' + p[1]);
        ionoGlow.setAttribute('fill', 'none');
        ionoGlow.setAttribute('stroke', '#58a6ff');
        ionoGlow.setAttribute('stroke-width', (pct * 6).toFixed(1));
        ionoGlow.setAttribute('stroke-opacity', '0.08');
        ionoGlow.setAttribute('filter', 'url(#iono-soft)');
        arcGroup.appendChild(ionoGlow);
      }

      // Destination cluster dot
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]);
      dot.setAttribute('r', r.toFixed(1));
      var color = pct > 0.3 ? '#e85d3a' : pct > 0.1 ? '#f1c40f' : '#4a8fb8';
      dot.setAttribute('fill', color);
      dot.setAttribute('opacity', (0.3 + pct * 0.5).toFixed(2));
      if (pct > 0.1) dot.setAttribute('filter', 'url(#iono-glow)');
      dotGroup.appendChild(dot);

      // Country label
      if (pct > 0.01 || g.country !== '??') {
        var label = document.createElementNS(NS, 'text');
        label.setAttribute('x', p[0]); label.setAttribute('y', p[1] + r + 8);
        label.setAttribute('text-anchor', 'middle'); label.setAttribute('fill', '#6e7681');
        label.setAttribute('font-size', '6');
        label.textContent = g.country + ' (' + (pct * 100).toFixed(1) + '%)';
        dotGroup.appendChild(label);
      }

      // Sub-region detail for US
      if (g.country === 'US' && g.regions) {
        g.regions.forEach(function(reg) {
          var regPos = US_REGIONS[reg.region];
          if (!regPos || reg.requests < 50) return;
          var rp = geoProject(regPos[0], regPos[1]);
          var regPct = totalReqs > 0 ? reg.requests / totalReqs : 0;
          var regR = Math.max(1.5, Math.min(8, Math.sqrt(regPct) * 15));

          var regDot = document.createElementNS(NS, 'circle');
          regDot.setAttribute('cx', rp[0]); regDot.setAttribute('cy', rp[1]);
          regDot.setAttribute('r', regR.toFixed(1));
          regDot.setAttribute('fill', regPct > 0.3 ? '#e85d3a' : '#f1c40f');
          regDot.setAttribute('opacity', (0.2 + regPct * 0.4).toFixed(2));
          dotGroup.appendChild(regDot);

          if (regPct > 0.005) {
            var regLabel = document.createElementNS(NS, 'text');
            regLabel.setAttribute('x', rp[0]); regLabel.setAttribute('y', rp[1] - regR - 2);
            regLabel.setAttribute('text-anchor', 'middle'); regLabel.setAttribute('fill', '#484f58');
            regLabel.setAttribute('font-size', '5');
            regLabel.textContent = reg.region;
            dotGroup.appendChild(regLabel);
          }
        });
      }
    });

    // Stats
    var statEl = svg.querySelector('#iono-stats');
    if (statEl) {
      var countries = geoData.filter(function(g) { return g.country !== '??'; }).length;
      statEl.textContent = countries + ' countries · ' + totalReqs.toLocaleString() + ' signals';
    }
  }

  // Ionosphere transit particles — animate signals flowing between membrane and visitors
  var ionoParticles = [];
  var ionoLastFrame = 0;

  function ionoSpawnParticle(geoData) {
    if (ionoParticles.length >= 20 || !geoData || geoData.length === 0) return;
    var totalReqs = 0;
    geoData.forEach(function(g) { totalReqs += g.requests; });
    // Weighted pick
    var pick = Math.random() * totalReqs;
    var acc = 0;
    var target = geoData[0];
    for (var i = 0; i < geoData.length; i++) {
      acc += geoData[i].requests;
      if (acc >= pick) { target = geoData[i]; break; }
    }
    var pos = COUNTRY_POS[target.country];
    if (!pos) return;
    var dest = geoProject(pos[0], pos[1]);
    var memPos = geoProject(-83, 43);
    var inbound = Math.random() > 0.3;
    ionoParticles.push({
      sx: inbound ? dest[0] : memPos[0], sy: inbound ? dest[1] : memPos[1],
      ex: inbound ? memPos[0] : dest[0], ey: inbound ? memPos[1] : dest[1],
      t: 0, speed: 0.4 + Math.random() * 0.6,
      color: inbound ? '#4a8fb8' : '#5ab87a', el: null
    });
  }

  function ionoAnimateFrame(now) {
    if (!globeBuilt) { globeAnimId = requestAnimationFrame(ionoAnimateFrame); return; }
    var dt = ionoLastFrame ? (now - ionoLastFrame) / 1000 : 0.016;
    if (dt > 0.1) dt = 0.1;
    ionoLastFrame = now;

    var NS = 'http://www.w3.org/2000/svg';
    var pg = globeSvgEl ? globeSvgEl.querySelector('#iono-particles') : null;
    if (!pg) { globeAnimId = requestAnimationFrame(ionoAnimateFrame); return; }

    // Spawn
    if (Math.random() < dt * 2 && globeGeoData) {
      ionoSpawnParticle(globeGeoData);
    }

    var toRemove = [];
    ionoParticles.forEach(function(p, idx) {
      p.t += p.speed * dt;
      if (p.t >= 1.0) { toRemove.push(idx); if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el); return; }

      // Bezier interpolation with arc
      var mx = (p.sx + p.ex) / 2, my = Math.min(p.sy, p.ey) - 30;
      var t = p.t;
      var x = (1-t)*(1-t)*p.sx + 2*(1-t)*t*mx + t*t*p.ex;
      var y = (1-t)*(1-t)*p.sy + 2*(1-t)*t*my + t*t*p.ey;
      var opacity = t < 0.1 ? t/0.1 : t > 0.85 ? (1-t)/0.15 : 0.9;

      if (!p.el) {
        p.el = document.createElementNS(NS, 'circle');
        p.el.setAttribute('fill', p.color);
        p.el.setAttribute('r', '1.5');
        pg.appendChild(p.el);
      }
      p.el.setAttribute('cx', x.toFixed(1));
      p.el.setAttribute('cy', y.toFixed(1));
      p.el.setAttribute('opacity', opacity.toFixed(2));
    });

    for (var i = toRemove.length - 1; i >= 0; i--) {
      ionoParticles.splice(toRemove[i], 1);
    }

    globeAnimId = requestAnimationFrame(ionoAnimateFrame);
  }

  // ═══════════════════════════════════════════════════════════
  // EPITOPE SORT — navigable site index by interest category
  // All pages across all domains, organized by what draws you
  // ═══════════════════════════════════════════════════════════

  var EPITOPE_INDEX = [
    {
      epitope: 'PHYSICS',
      title: 'Physics & Mathematics',
      sub: 'Anderson localization, dimensional analysis, lattice QCD, spectral theory',
      color: '#e85d3a',
      sites: [
        {name: 'Anderson Localization', url: 'https://detroit.primals.eco/analysis/anderson-localization/', domain: 'detroit'},
        {name: 'Anderson Permeability', url: 'https://detroit.primals.eco/analysis/anderson-permeability/', domain: 'detroit'},
        {name: 'Mass-Energy Equivalence', url: 'https://sporeprint.primals.eco/science/32-mass-energy-equivalence/', domain: 'sporePrint'},
        {name: 'Neuromorphic Sovereign Driver', url: 'https://sporeprint.primals.eco/science/26-neuromorphic-sovereign-driver/', domain: 'sporePrint'},
        {name: 'Dimensional Cost Layout', url: 'https://sporeprint.primals.eco/science/52-dimensional-cost-petal-tongue-gog/', domain: 'sporePrint'},
        {name: 'WDM + GPU Pipeline', url: 'https://sporeprint.primals.eco/products/lattice-qcd/', domain: 'sporePrint'},
        {name: 'Spectral Analysis', url: 'https://sporeprint.primals.eco/science/44-spectral-fingerprint-anderson/', domain: 'sporePrint'},
        {name: 'Mobility Edge', url: 'https://sporeprint.primals.eco/science/46-mobility-edge-entropy-rps/', domain: 'sporePrint'}
      ]
    },
    {
      epitope: 'TOPOLOGY',
      title: 'Graph Theory & Topology',
      sub: 'Institutional capture graph, the machine, network structure, entity formation',
      color: '#9b59b6',
      sites: [
        {name: 'Institutional Capture Graph', url: 'https://detroit.primals.eco/analysis/institutional-capture-graph/', domain: 'detroit'},
        {name: 'The Machine', url: 'https://detroit.primals.eco/analysis/the-machine/', domain: 'detroit'},
        {name: 'Leak in the Dyke', url: 'https://detroit.primals.eco/analysis/leak-in-the-dyke/', domain: 'detroit'},
        {name: 'Flower to Wilk', url: 'https://detroit.primals.eco/analysis/the-flower-to-wilk/', domain: 'detroit'},
        {name: 'Corporate Network (Lara)', url: 'https://detroit.primals.eco/analysis/corporate-network-lara/', domain: 'detroit'},
        {name: 'Entity Formation', url: 'https://detroit.primals.eco/connections/entity-formation/', domain: 'detroit'},
        {name: 'Honeycomb Prism', url: 'https://sporeprint.primals.eco/science/38-honeycomb-prism-floating-pointer/', domain: 'sporePrint'},
        {name: 'BingoCube Prismatic Injection', url: 'https://sporeprint.primals.eco/methodology/bingocube-prismatic-injection/', domain: 'sporePrint'},
        {name: 'Focal Point Geometry', url: 'https://sporeprint.primals.eco/science/53-focal-point-geometry/', domain: 'sporePrint'}
      ]
    },
    {
      epitope: 'PHILOSOPHY',
      title: 'Philosophy & Purpose',
      sub: 'The many rooms, sovereignty, temptation of kingdoms, constrained architecture',
      color: '#3fb950',
      sites: [
        {name: 'The Many Rooms', url: 'https://sporeprint.primals.eco/philosophy/the-many-rooms/', domain: 'sporePrint'},
        {name: 'Temptation of Kingdoms', url: 'https://sporeprint.primals.eco/philosophy/the-temptation-of-kingdoms/', domain: 'sporePrint'},
        {name: 'Sovereignty', url: 'https://sporeprint.primals.eco/trails/sovereignty/', domain: 'sporePrint'},
        {name: 'Philosophy Thread', url: 'https://sporeprint.primals.eco/trails/philosophy-thread/', domain: 'sporePrint'},
        {name: 'Introduction', url: 'https://sporeprint.primals.eco/thesis/01-introduction/', domain: 'sporePrint'},
        {name: 'Thesis', url: 'https://thesis.primals.eco/', domain: 'thesis'}
      ]
    },
    {
      epitope: 'METHOD',
      title: 'Methodology & Architecture',
      sub: 'Signal sensing, data braid, provenance, artisan method, composition',
      color: '#58a6ff',
      sites: [
        {name: 'Signal Sensing Receptor', url: 'https://sporeprint.primals.eco/methodology/signal-sensing-receptor/', domain: 'sporePrint'},
        {name: 'The Artisan Method', url: 'https://detroit.primals.eco/analysis/the-artisan-method/', domain: 'detroit'},
        {name: 'Data Braid PCA Staff', url: 'https://detroit.primals.eco/analysis/data-braid-pca-staff/', domain: 'detroit'},
        {name: 'Provenance', url: 'https://sporeprint.primals.eco/trails/provenance/', domain: 'sporePrint'},
        {name: 'NF Pipeline', url: 'https://sporeprint.primals.eco/trails/nf-pipeline/', domain: 'sporePrint'},
        {name: 'ScyBorg Composition', url: 'https://sporeprint.primals.eco/methodology/scyborg/', domain: 'sporePrint'}
      ]
    },
    {
      epitope: 'INVESTIGATION',
      title: 'Investigation & Evidence',
      sub: 'FOIA documents, entities, actors, judges, coverage, network mapping',
      color: '#f1c40f',
      sites: [
        {name: 'TCR-22-12 Evidence', url: 'https://detroit.primals.eco/evidence/tcr-22-12/', domain: 'detroit'},
        {name: 'MDE FOIA Sep25', url: 'https://detroit.primals.eco/evidence/mde-foia-sep25/', domain: 'detroit'},
        {name: 'How to Build an OS', url: 'https://detroit.primals.eco/analysis/how-to-build-an-os/', domain: 'detroit'},
        {name: 'Institutional Response', url: 'https://detroit.primals.eco/analysis/institutional-response/', domain: 'detroit'},
        {name: 'Political Connections', url: 'https://detroit.primals.eco/network/political/', domain: 'detroit'},
        {name: 'Judges Network', url: 'https://detroit.primals.eco/network/judges/', domain: 'detroit'},
        {name: 'Professional Enablers', url: 'https://detroit.primals.eco/network/professional-enablers/', domain: 'detroit'},
        {name: 'Hemlock FOIA', url: 'https://tuebor.primals.eco/investigate/hemlock-foia/', domain: 'tuebor'},
        {name: 'Clutch Investigation', url: 'https://clutch.primals.eco/', domain: 'clutch'}
      ]
    },
    {
      epitope: 'IMMUNE',
      title: 'Immune System & Defense',
      sub: 'Reflexive immune, epitope bridge, collision detection, adversarial analysis',
      color: '#ff6b35',
      sites: [
        {name: 'Reflexive Immune Epitope Bridge', url: 'https://sporeprint.primals.eco/science/41-reflexive-immune-epitope-bridge/', domain: 'sporePrint'},
        {name: 'Collision Detection', url: 'https://hud.primals.eco/', domain: 'hud'},
        {name: 'Anderson Selectivity', url: 'https://hud.primals.eco/', domain: 'hud'},
        {name: 'Cross-Mirror Observation', url: 'https://sporeprint.primals.eco/science/47-cross-mirror-observation/', domain: 'sporePrint'}
      ]
    },
    {
      epitope: 'SIGNAL',
      title: 'Signal & Observation',
      sub: 'Billboard, observatory, HUD, real-time membrane watching',
      color: '#4a8fb8',
      sites: [
        {name: 'Billboard — Live', url: 'https://signal.primals.eco/billboard', domain: 'signal'},
        {name: 'Observatory', url: 'https://signal.primals.eco/', domain: 'signal'},
        {name: 'HUD — biomeOS', url: 'https://hud.primals.eco/', domain: 'hud'},
        {name: 'Hypothesis Dashboard', url: 'https://hypothesis.primals.eco/', domain: 'hypothesis'}
      ]
    },
    {
      epitope: 'SCIENCE',
      title: 'Science Papers — baseCamp',
      sub: 'The research log, 58 papers and counting',
      color: '#e8e8e8',
      sites: [
        {name: 'sporePrint Science Index', url: 'https://sporeprint.primals.eco/science/', domain: 'sporePrint'},
        {name: 'Signal Transit Membrane Meteorology', url: 'https://sporeprint.primals.eco/science/56-signal-transit-membrane-meteorology/', domain: 'sporePrint'},
        {name: 'Tufte Pipeline Wiring', url: 'https://sporeprint.primals.eco/science/58-tufte-pipeline-wiring/', domain: 'sporePrint'},
        {name: 'Git Source', url: 'https://git.primals.eco/ecoPrimals/', domain: 'git'}
      ]
    }
  ];

  function buildEpitopeIndex() {
    var el = document.getElementById('epitope-index');
    if (!el) return;

    var html = '';
    EPITOPE_INDEX.forEach(function(cat) {
      html += '<div style="margin-bottom:1.2em">'
        + '<div style="display:flex;align-items:center;gap:0.5em;margin-bottom:0.4em">'
        + '<span style="width:8px;height:8px;border-radius:50%;background:' + cat.color + ';display:inline-block"></span>'
        + '<span style="color:' + cat.color + ';font-size:0.85em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">' + cat.title + '</span>'
        + '</div>'
        + '<div style="color:#6e7681;font-size:0.72em;margin-bottom:0.3em;margin-left:1.2em">' + cat.sub + '</div>';

      cat.sites.forEach(function(s) {
        html += '<div style="margin-left:1.2em;margin-bottom:2px">'
          + '<a href="' + s.url + '" style="color:#c9d1d9;text-decoration:none;font-size:0.82em"'
          + ' onmouseover="this.style.color=\'' + cat.color + '\'" onmouseout="this.style.color=\'#c9d1d9\'">'
          + s.name + '</a>'
          + '<span style="color:#484f58;font-size:0.65em;margin-left:0.5em">' + s.domain + '</span>'
          + '</div>';
      });

      html += '</div>';
    });

    el.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════
  // MOUNT — build DOM from panel registry
  // ═══════════════════════════════════════════════════════════

  function mount() {
    var el = document.getElementById('pt-panels');
    if (!el) return;

    // Header card
    var html = '<div class="hud-card hud-card-full">'
      + '<div style="display:flex;justify-content:space-between;align-items:center">'
      + '<div class="hud-card-title">🔬 petalTongue — Dimensional Cost Layout</div>'
      + '<div><span id="pt-status"></span> <span id="pt-metrics" style="margin-left:0.8em"></span></div>'
      + '</div>'
      + '<div style="color:#8b949e;font-size:0.8em;margin-top:0.3em">'
      + 'C(n) ∝ π<sup>n/2</sup> — panel visual weight scales with data dimensionality. '
      + 'Panels with no data collapse. Highest-dimension panels surface first.'
      + '</div>'
      + '</div>';

    // Ionosphere — earth projection with signal transit
    html += '<div class="hud-card hud-card-full" style="border-left:3px solid #4a8fb8">'
      + '<div class="hud-card-title">Ionosphere — Signal Transit Across the Surface'
      + '<span class="hud-dim-cost">the view from above</span></div>'
      + '<div style="color:#6e7681;font-size:0.75em;margin-bottom:0.5em">'
      + 'The membrane exists in physical space. Visitors arrive from geography. '
      + 'Signal transits the ionosphere — the layer between observer and observed.</div>'
      + '<div id="ionosphere-svg"></div>'
      + '</div>';

    // Epitope Sort — navigable site index
    html += '<div class="hud-card hud-card-full" style="border-left:3px solid #3fb950">'
      + '<div class="hud-card-title">Epitope Sort — Navigate by Interest'
      + '<span class="hud-dim-cost">behavior · interest · path</span></div>'
      + '<div style="color:#6e7681;font-size:0.75em;margin-bottom:0.8em">'
      + 'All sites and pages organized by what draws you. '
      + 'Each epitope is a surface the membrane presents to a different kind of curiosity.</div>'
      + '<div id="epitope-index" style="column-count:2;column-gap:2em"></div>'
      + '</div>';

    // Membrane focal-point visualization — the lens view
    html += '<div class="hud-card hud-card-full" style="border-left:3px solid #5ab87a">'
      + '<div class="hud-card-title">Membrane Focal Points'
      + '<span class="hud-dim-cost">baseCamp 53</span></div>'
      + '<div style="color:#6e7681;font-size:0.75em;margin-bottom:0.5em">'
      + 'Each epitope is a tangent point on the membrane surface. '
      + 'Short tangent lines = high-dimensional data (sharp lens). '
      + 'Focal points inside = where observations converge.</div>'
      + '<div id="membrane-focal-svg"></div>'
      + '</div>';

    // Render panels in registration order (JS will reorder alive ones)
    PANELS.forEach(function(p) {
      var catColor = CAT_COLORS[p.cat] || '#6e7681';
      var cls = p.full ? 'hud-card hud-card-full' : 'hud-card';
      html += '<div class="' + cls + '" id="panel-' + p.id + '" data-dim="' + p.dim + '" data-alive="false"'
        + ' data-cat="' + p.cat + '" style="border-left:3px solid ' + catColor + '">'
        + '<div class="hud-card-title">' + p.title
        + '<span class="hud-dim-cost">' + p.eq + '</span></div>'
        + '<div style="color:#6e7681;font-size:0.75em;margin-bottom:0.5em">' + p.sub + '</div>'
        + '<div id="pt-' + p.id + '" class="pt-viz"></div>'
        + '</div>';
    });

    // Meta slot for selectivity
    html += '<div id="pt-relay-meta" style="grid-column:1/-1;padding:0 1em"></div>';

    el.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════
  // ALIVE TRACKING — panels reveal when they have data
  // ═══════════════════════════════════════════════════════════

  var aliveSet = new Set();

  function markAlive(panelId) {
    if (aliveSet.has(panelId)) return;
    aliveSet.add(panelId);
    var el = document.getElementById('panel-' + panelId);
    if (el) el.setAttribute('data-alive', 'true');
    renderMembraneSVG(); // update focal-point visualization
  }

  // ═══════════════════════════════════════════════════════════
  // PANEL RENDERING — data → GoG bindings → petalTongue SVG
  // ═══════════════════════════════════════════════════════════

  var wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  var pt = PetalBridge({
    wsUrl: wsProto + '//' + location.host + '/ws',
    domain: 'hud',
    statusEl: 'pt-status',
    metricsEl: 'pt-metrics',
    maxHeight: 280,
    onConnect: function() { pt.requestMetrics(); }
  });

  function renderPanels(dash, topo) {
    if (!pt.isConnected()) return;

    var clusters = dash.epitope_clusters || [];
    var entities = (topo && topo.entities) || [];

    // Entity population (2D)
    if (entities.length > 1) {
      var cats = [], vals = [];
      entities.forEach(function(e) {
        if (e.total_requests > 5) {
          cats.push(e.label.replace(/ \(.*\)/, ''));
          vals.push(e.total_requests);
        }
      });
      if (cats.length > 0) {
        markAlive('entity-pop');
        pt.renderBinding({
          channel_type: 'bar', id: 'entity-pop',
          label: 'Entity Population — Request Volume',
          categories: cats, values: vals, unit: 'requests'
        }, 'pt-entity-pop');
      }
    }

    // Fleet honesty (1D)
    if (entities.length > 1) {
      var honestReqs = 0, totalReqs = 0;
      entities.forEach(function(e) {
        totalReqs += e.total_requests;
        if (e.is_honest) honestReqs += e.total_requests;
      });
      if (totalReqs > 0) {
        var pct = Math.round(honestReqs / totalReqs * 1000) / 10;
        markAlive('honesty');
        pt.renderBinding({
          channel_type: 'gauge', id: 'honesty',
          label: 'Fleet Honesty — % Honest by Volume',
          value: pct, min: 0, max: 100, unit: '%',
          normal_range: [80, 100], warning_range: [50, 80]
        }, 'pt-honesty');
      }
    }

    // Bingo cube (3D)
    var cube = dash.bingo_cube_summary;
    if (cube) {
      var ck = Object.keys(cube).sort(function(a, b) { return cube[b] - cube[a]; });
      if (ck.length > 0) {
        markAlive('bingo');
        pt.renderBinding({
          channel_type: 'bar', id: 'bingo',
          label: 'Bingo Cube — Attention × Curiosity × Interaction',
          categories: ck, values: ck.map(function(k) { return cube[k]; }), unit: 'IPs'
        }, 'pt-bingo');
      }
    }

    // Collision (2D)
    var coll = dash.collision_level2;
    if (coll) {
      var collK = Object.keys(coll).sort(function(a, b) { return coll[b] - coll[a]; });
      if (collK.length > 0) {
        markAlive('collision');
        pt.renderBinding({
          channel_type: 'bar', id: 'collision',
          label: 'Collision — Coordination Detection',
          categories: collK, values: collK.map(function(k) { return coll[k]; }), unit: 'IPs'
        }, 'pt-collision');
      }
    }

    // ASN (2D)
    var asn = dash.asn_types;
    if (asn) {
      var ak = Object.keys(asn).sort(function(a, b) { return asn[b] - asn[a]; });
      if (ak.length > 0) {
        markAlive('asn');
        pt.renderBinding({
          channel_type: 'bar', id: 'asn',
          label: 'ASN Infrastructure Classification',
          categories: ak, values: ak.map(function(k) { return asn[k]; }), unit: 'requests'
        }, 'pt-asn');
      }
    }

    // Paths (2D)
    var paths = dash.path_types;
    if (paths) {
      var pk = Object.keys(paths).sort(function(a, b) { return paths[b] - paths[a]; });
      if (pk.length > 0) {
        markAlive('paths');
        pt.renderBinding({
          channel_type: 'bar', id: 'paths',
          label: 'Request Path Classification',
          categories: pk, values: pk.map(function(k) { return paths[k]; }), unit: 'requests'
        }, 'pt-paths');
      }
    }

    // Fingerprint scatter (3D)
    if (entities.length > 2) {
      var xs = [], ys = [];
      entities.forEach(function(e) {
        if (e.total_requests > 5) { xs.push(e.ua_pool_size || 1); ys.push(e.unique_ips); }
      });
      if (xs.length > 2) {
        markAlive('fp-scatter');
        pt.renderBinding({
          channel_type: 'scatter', id: 'fp-scatter',
          label: 'Behavioral Fingerprint Space',
          x: xs, y: ys, unit: 'entities'
        }, 'pt-fp-scatter');
      }
    }

    // Epitope matrix (4D)
    if (clusters.length > 1) {
      var hashes = clusters.map(function(c) { return c.hash.substring(0, 6); });
      var fvals = [];
      clusters.forEach(function(c) {
        fvals.push(c.ips); fvals.push(c.ua_pool_size);
        fvals.push(Math.round(c.blame_ratio * 100)); fvals.push(c.has_lang ? 100 : 0);
      });
      markAlive('epitope-mx');
      pt.renderBinding({
        channel_type: 'heatmap', id: 'epitope-mx',
        label: 'Epitope Feature Matrix',
        x_labels: ['ips', 'ua_pool', 'blame', 'has_lang'],
        y_labels: hashes, values: fvals, unit: 'value'
      }, 'pt-epitope-mx');
    }

    // Geo × entity (4D)
    var geo = dash.geography || [];
    if (geo.length > 0) {
      var countries = geo.map(function(g) { return g.country; });
      var geoVals = [];
      var fleetPct = (dash.fleet_pct || 50) / 100;
      countries.forEach(function(country) {
        var g = geo.find(function(x) { return x.country === country; });
        var reqs = g ? g.requests : 0;
        geoVals.push(Math.round(reqs * fleetPct));
        geoVals.push(Math.round(reqs * 0.15));
        geoVals.push(Math.round(reqs * (1 - fleetPct - 0.15)));
        geoVals.push(0);
      });
      markAlive('geo-mx');
      pt.renderBinding({
        channel_type: 'heatmap', id: 'geo-mx',
        label: 'Geographic × Entity Type',
        x_labels: ['Fleet', 'Agentic', 'Human', 'Scanner'],
        y_labels: countries, values: geoVals, unit: 'requests'
      }, 'pt-geo-mx');
    }

    // Anderson selectivity (1D)
    buildSelectivityPanel(pt);
    // Mark alive if selectivity data exists
    if (dash.selectivity !== undefined || dash.anderson_selectivity !== undefined) {
      markAlive('relay-selectivity');
      markAlive('relay-permeability');
    }

    // Timing (1D each)
    var timing = dash.timing || {};
    if (timing.cv !== undefined) {
      markAlive('timing-cv');
      pt.renderBinding({
        channel_type: 'gauge', id: 'timing-cv',
        label: 'Timing CV', value: Math.round(timing.cv * 1000) / 1000,
        min: 0, max: 2, unit: 'CV', normal_range: [0.8, 2.0], warning_range: [0.15, 0.8]
      }, 'pt-timing-cv');
    }
    if (timing.avg_interval_ms) {
      markAlive('timing-interval');
      pt.renderBinding({
        channel_type: 'gauge', id: 'timing-interval',
        label: 'Mean Inter-Request Interval', value: timing.avg_interval_ms,
        min: 0, max: 5000, unit: 'ms', normal_range: [1000, 5000], warning_range: [100, 1000]
      }, 'pt-timing-interval');
    }

    // Top offenders (2D)
    var offenders = dash.top_offenders || [];
    if (offenders.length > 0) {
      var oL = [], oV = [];
      offenders.slice(0, 10).forEach(function(ip) {
        var label = ip.org ? ip.org.substring(0, 18) : ip.ip;
        if (ip.country) label += ' (' + ip.country + ')';
        oL.push(label); oV.push(ip.requests);
      });
      markAlive('offenders');
      pt.renderBinding({channel_type:'bar',id:'offenders',label:'Top Offenders',categories:oL,values:oV,unit:'requests'}, 'pt-offenders');
    }

    // Target repos (2D)
    var targets = dash.targets || [];
    if (targets.length > 0) {
      var tL = [], tV = [];
      var fakeRepos = ['batch-processor','queue-worker','proxy-cache','http-proxy','deploy-scripts','graph-engine','auth-service','load-balancer','rate-limiter','service-mesh'];
      targets.slice(0, 10).forEach(function(t) {
        var name = t.repo.replace(/.*\//, '');
        var isFake = fakeRepos.some(function(f) { return name.indexOf(f) >= 0; });
        var label = name.length > 16 ? name.substring(0, 16) : name;
        if (isFake) label += ' *';
        tL.push(label); tV.push(t.requests);
      });
      markAlive('targets');
      pt.renderBinding({channel_type:'bar',id:'targets',label:'Target Repos',categories:tL,values:tV,unit:'requests'}, 'pt-targets');
    }

    // Geo bar (2D)
    if (geo.length > 0) {
      markAlive('geo');
      pt.renderBinding({
        channel_type: 'bar', id: 'geo',
        label: 'Geographic Distribution',
        categories: geo.map(function(g) { return g.country; }),
        values: geo.map(function(g) { return g.requests; }), unit: 'requests'
      }, 'pt-geo');
    }

    // Subnets (2D)
    var subnets = dash.subnets || [];
    if (subnets.length > 0) {
      var sL = [], sV = [];
      subnets.slice(0, 8).forEach(function(s) { sL.push(s.subnet + ' (' + s.unique_ips + ')'); sV.push(s.requests); });
      markAlive('subnets');
      pt.renderBinding({channel_type:'bar',id:'subnets',label:'Network Blocks',categories:sL,values:sV,unit:'requests'}, 'pt-subnets');
    }

    // Comparative fingerprints (4D)
    var comp = (topo && topo.comparative_fingerprints) || [];
    if (comp.length > 1) {
      var compE = comp.map(function(c) { return c.entity; });
      var compV = [];
      comp.forEach(function(c) {
        compV.push(c.ips); compV.push(parseInt(c.chrome) || 0);
        compV.push(c.sec_fetch === 'present' ? 100 : 0); compV.push(c.honest ? 100 : 0);
      });
      markAlive('comparative');
      pt.renderBinding({
        channel_type:'heatmap',id:'comparative',label:'Comparative Fingerprints',
        x_labels:['IPs','Chrome','Sec-Fetch%','Honest'],y_labels:compE,values:compV,unit:'value'
      }, 'pt-comparative');
    }

    // Shared panel builders
    buildSummaryKpis(pt, dash);
    if (dash.total_requests > 0) markAlive('summary-kpis');

    buildEpitopeSummary(pt, dash.epitope_summary || {});
    if (dash.epitope_summary && Object.keys(dash.epitope_summary).length > 0) markAlive('epitope-summary');

    buildOrganismProfile(pt, clusters);
    if (clusters.length > 0) markAlive('organism-profile');

    buildEntityGauges(pt, entities);
    if (entities.length > 1) markAlive('entity-gauges');

    buildEntityDetail(pt, entities);
    if (entities.length > 1) markAlive('entity-detail');

    buildEntityMatrix(pt, entities);
    if (entities.length > 1) markAlive('entity-matrix');

    buildAcceptLanguageDonut(pt, clusters);
    if (clusters.length > 0) markAlive('organism-lang');
  }

  // ═══════════════════════════════════════════════════════════
  // DATA LOOP
  // ═══════════════════════════════════════════════════════════

  // Push transit topology to Rust AnimationEngine via WebSocket
  function pushToAnimationEngine(dash, topo) {
    if (!pt.isConnected()) return;
    var entities = (topo && topo.entities) || [];
    var edges = [];
    var pulses = [];
    var totalReqs = 0;
    entities.forEach(function(e) { totalReqs += e.total_requests || 0; });

    entities.forEach(function(e) {
      if (e.total_requests > 10) {
        var cat = entityToCategory(e.label || '');
        var bw = totalReqs > 0 ? (e.total_requests / totalReqs) : 0;
        edges.push({source: 'membrane', target: e.label, bandwidth: bw});
        if (bw > 0.1) {
          pulses.push({node_id: e.label, frequency: 0.5 + bw * 4});
        }
      }
    });

    pt.rpc('pt.animation_ingest', {edges: edges, pulses: pulses});
  }

  function fetchAndRender() {
    var dashP = fetch('/dashboard.json', {cache: 'no-store'}).then(function(r) { return r.json(); });
    var topoP = fetch('/topology.json', {cache: 'no-store'}).then(function(r) { return r.json(); });
    Promise.all([dashP, topoP]).then(function(res) {
      ingestTransitData(res[0], res[1]);
      pushToAnimationEngine(res[0], res[1]);
      if (pt.isConnected()) { renderPanels(res[0], res[1]); pt.requestMetrics(); }
      // Feed ionosphere
      var geo = res[0].geography || [];
      if (geo.length > 0 && (!globeGeoData || JSON.stringify(geo) !== JSON.stringify(globeGeoData))) {
        globeGeoData = geo;
        if (globeBuilt) {
          var arcG = globeSvgEl.querySelector('#iono-arcs');
          var dotG = globeSvgEl.querySelector('#iono-dots');
          if (arcG) arcG.innerHTML = '';
          if (dotG) dotG.innerHTML = '';
          renderIonosphereData(globeSvgEl, geo);
        }
      }
    }).catch(function() {});
  }

  mount();
  buildMembraneSVG();
  buildEpitopeIndex();
  buildIonosphereSVG(null);
  mgAnimId = requestAnimationFrame(mgAnimateFrame);
  globeAnimId = requestAnimationFrame(ionoAnimateFrame);
  pt.connect();
  setTimeout(fetchAndRender, 2000);
  setInterval(fetchAndRender, 15000);
})();
