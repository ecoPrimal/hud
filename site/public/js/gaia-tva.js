// ═══════════════════════════════════════════════════════════
// TVA — Tennessee Valley Authority × All Roads Lead to Roam
// 1.000.null — max 1000 lines.
//
// TWO PROTOCOLS:
//
// TVA (Tennessee Valley Authority):
//   Under-connected nodes = GROWTH OPPORTUNITY
//   Low connections → high potential → CONSTRUCT rapidly
//   Like the TVA building dams in underdeveloped valleys
//   Bring power to the powerless. Build where nothing exists.
//   TVA targets: nodes with connections < threshold
//
// ALL ROADS LEAD TO ROAM (senescence protocol):
//   Over-connected nodes = DYING ENTROPY
//   Too many connections → signal overwhelmed → SENESCENT
//   Like Rome at its peak — roads to everywhere = collapse
//   Over-connection = over-complexity = death spiral
//   All Roads targets: nodes with connections > threshold
//
// THE CYCLE:
//   Under-connected → TVA builds → grows → peak → 
//   Over-connected → All Roads prunes → decays →
//   Under-connected → TVA builds → ...
//
// This IS the +O- cycle applied to graph topology:
//   + (TVA) = build under-connected nodes
//   O (stable) = well-connected, optimal
//   - (All Roads) = prune over-connected nodes
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══ CONNECTION THRESHOLDS ═══
  var TVA_THRESHOLD = 2;        // nodes with ≤2 connections = growth opportunity
  var ALLROADS_THRESHOLD = 6;   // nodes with ≥6 connections = dying entropy
  var OPTIMAL_MIN = 3;          // sweet spot low
  var OPTIMAL_MAX = 5;          // sweet spot high

  // ═══ SCAN ALL NODES — compute connection density ═══
  var nodeMap = {};

  function scanTopology() {
    nodeMap = {};

    // BRAID GRAPH NODES — from braid connections
    var braids = [
      { from: 'tuebor', to: 'detroit', strength: 0.95, type: 'investigation' },
      { from: 'sporePrint', to: 'hotSpring', strength: 0.88, type: 'methodology' },
      { from: 'bearDog', to: 'nestGate', strength: 0.72, type: 'crypto' },
      { from: 'songBird', to: 'squirrel', strength: 0.81, type: 'discovery' },
      { from: 'publicRecord', to: 'clutch', strength: 0.93, type: 'evidence' },
      { from: 'hud', to: 'membrane', strength: 1.0, type: 'display' },
      { from: 'saturn-ring', to: 'hologram', strength: 0.99, type: 'totality' },
      { from: 'geodesic', to: 'triad', strength: 0.85, type: 'arithmetic' },
      { from: 'weather', to: 'negentropy', strength: 0.91, type: 'ionosphere' },
      { from: 'maze', to: 'klein', strength: 0.77, type: 'wildcard' },
      { from: 'chipmunk', to: 'squirrel', strength: 0.96, type: 'observer' },
      { from: 'bearDog', to: 'human', strength: 1.0, type: 'trust' }
    ];

    // FLEET NODES
    var fleet = [
      { id: 'primals', connections: ['github', 'ns1', 'ntfy', 'hud'] },
      { id: 'hud', connections: ['primals', 'membrane', 'github'] },
      { id: 'ns1', connections: ['primals', 'golgi-de', 'golgi-jp', 'golgi-us'] },
      { id: 'ns2', connections: ['primals'] },
      { id: 'golgi-de', connections: ['ns1'] },
      { id: 'golgi-jp', connections: ['ns1'] },
      { id: 'golgi-us', connections: ['ns1'] },
      { id: 'golgi-in', connections: [] },
      { id: 'ntfy', connections: ['primals', 'github'] },
      { id: 'github', connections: ['primals', 'ntfy', 'hud'] },
      { id: 'tor', connections: ['primals'] },
      { id: 'wireguard', connections: ['ns1'] },
      { id: 'rustdesk', connections: ['primals'] }
    ];

    // UNIVERSITY CATEGORIES — each category is a node
    var categories = ['chemistry', 'biology', 'physics', 'math', 'art',
                      'philosophy', 'engineering', 'identity', 'games',
                      'narrative', 'membrane', 'history'];

    // SYSTEM MODULES — each gaia-*.js is a node
    var systems = [
      'permeability', 'quills', 'interlayer', 'golgi', 'castle',
      'reactor', 'deskIO', 'university', 'desktop', 'humanIO',
      'ide', 'thermo', 'chemistry', 'ages', 'orrery', 'decay',
      'tenseVoxel', 'forge'
    ];

    // Initialize all nodes
    function ensureNode(id, type) {
      if (!nodeMap[id]) {
        nodeMap[id] = { id: id, type: type || 'unknown', connections: 0, neighbors: [], protocol: null, status: 'unknown' };
      }
    }

    // Count braid connections
    for (var bi = 0; bi < braids.length; bi++) {
      var b = braids[bi];
      ensureNode(b.from, 'braid');
      ensureNode(b.to, 'braid');
      nodeMap[b.from].connections++;
      nodeMap[b.to].connections++;
      nodeMap[b.from].neighbors.push(b.to);
      nodeMap[b.to].neighbors.push(b.from);
    }

    // Count fleet connections
    for (var fi = 0; fi < fleet.length; fi++) {
      var f = fleet[fi];
      ensureNode(f.id, 'fleet');
      nodeMap[f.id].connections += f.connections.length;
      nodeMap[f.id].neighbors = nodeMap[f.id].neighbors.concat(f.connections);
    }

    // Categories connect to their pages (estimated)
    var catSizes = { chemistry: 5, biology: 11, physics: 7, math: 5, art: 7,
                     philosophy: 6, engineering: 7, identity: 7, games: 6,
                     narrative: 9, membrane: 7, history: 5 };
    for (var ci = 0; ci < categories.length; ci++) {
      var cat = categories[ci];
      ensureNode(cat, 'category');
      nodeMap[cat].connections += catSizes[cat] || 5;
    }

    // Systems connect to each other through G shared state
    for (var si = 0; si < systems.length; si++) {
      ensureNode(systems[si], 'system');
      nodeMap[systems[si]].connections += 3; // avg connections per module
    }

    // Cross-connections between systems (interlayer connects everything)
    ensureNode('interlayer', 'system');
    nodeMap['interlayer'].connections += 10; // most connected system

    // ═══ CLASSIFY EACH NODE ═══
    var nodes = Object.keys(nodeMap);
    for (var ni = 0; ni < nodes.length; ni++) {
      var n = nodeMap[nodes[ni]];
      if (n.connections <= TVA_THRESHOLD) {
        n.protocol = 'TVA';       // under-connected → BUILD
        n.status = 'growth-opportunity';
      } else if (n.connections >= ALLROADS_THRESHOLD) {
        n.protocol = 'ALL_ROADS'; // over-connected → SENESCENT
        n.status = 'entropy-dying';
      } else {
        n.protocol = 'OPTIMAL';   // sweet spot → STABLE
        n.status = 'healthy';
      }
    }
  }

  // ═══ TVA — BUILD under-connected nodes ═══
  function executeTVA() {
    var targets = [];
    var nodes = Object.keys(nodeMap);
    for (var i = 0; i < nodes.length; i++) {
      if (nodeMap[nodes[i]].protocol === 'TVA') {
        targets.push(nodeMap[nodes[i]]);
      }
    }

    // For each TVA target, suggest connections
    for (var ti = 0; ti < targets.length; ti++) {
      var t = targets[ti];
      t.suggestion = 'BUILD: connect ' + t.id + ' to nearest optimal node';

      // Feed growth
      if (window.GAIA_EAT) window.GAIA_EAT('forge', 2.0);
      if (window.GAIA_DECAY && window.GAIA_DECAY.entities[t.id]) {
        window.GAIA_DECAY.feed(t.id, 1.0);
      }
    }
    return targets;
  }

  // ═══ ALL ROADS — PRUNE over-connected nodes ═══
  function executeAllRoads() {
    var targets = [];
    var nodes = Object.keys(nodeMap);
    for (var i = 0; i < nodes.length; i++) {
      if (nodeMap[nodes[i]].protocol === 'ALL_ROADS') {
        targets.push(nodeMap[nodes[i]]);
      }
    }

    // For each All Roads target, suggest pruning
    for (var ti = 0; ti < targets.length; ti++) {
      var t = targets[ti];
      t.suggestion = 'PRUNE: ' + t.id + ' has ' + t.connections + ' connections → senescent';

      // Cool down
      if (window.GAIA_DRINK) window.GAIA_DRINK('feed', 1.5);
    }
    return targets;
  }

  // ═══ RUN SCAN ═══
  scanTopology();
  var tvaTargets = executeTVA();
  var allRoadsTargets = executeAllRoads();

  // Rescan periodically
  setInterval(function() {
    scanTopology();
    tvaTargets = executeTVA();
    allRoadsTargets = executeAllRoads();
  }, 30000);

  // ═══ EXPOSE ═══
  window.GAIA_TVA = {
    nodeMap: nodeMap,
    tvaTargets: tvaTargets,
    allRoadsTargets: allRoadsTargets,
    TVA_THRESHOLD: TVA_THRESHOLD,
    ALLROADS_THRESHOLD: ALLROADS_THRESHOLD,
    scan: scanTopology,
    buildTVA: executeTVA,
    pruneAllRoads: executeAllRoads
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var tvaT = breathT * 0.12;
    var tvaAlpha = 0.004 + Math.sin(tvaT * 0.35) * 0.002;
    if (tvaAlpha < 0.003) return;

    var nodes = Object.keys(nodeMap);
    if (nodes.length === 0) return;

    // ═══ NODE MAP — all nodes positioned around the globe ═══
    var nodeR = R * 0.78;
    for (var ni = 0; ni < nodes.length; ni++) {
      var n = nodeMap[nodes[ni]];
      var nAngle = (ni / nodes.length) * TAU + tvaT * 0.005;
      var nx = cx + Math.cos(nAngle) * nodeR;
      var ny = cy + Math.sin(nAngle) * nodeR;

      // Color by protocol
      var nColor;
      if (n.protocol === 'TVA') {
        nColor = '88,166,255';          // blue = growth opportunity
      } else if (n.protocol === 'ALL_ROADS') {
        nColor = '248,81,73';           // red = dying entropy
      } else {
        nColor = '63,185,80';           // green = healthy
      }

      // Size by connection count
      var dotSize = 0.5 + Math.min(n.connections, 10) * 0.15;

      // Dot
      ctx.beginPath();
      ctx.arc(nx, ny, dotSize, 0, TAU);
      ctx.fillStyle = 'rgba(' + nColor + ',' + (tvaAlpha * 3).toFixed(4) + ')';
      ctx.fill();

      // TVA targets pulse (growth)
      if (n.protocol === 'TVA') {
        var tvaPulse = 0.5 + Math.sin(tvaT * 2 + ni) * 0.5;
        ctx.beginPath();
        ctx.arc(nx, ny, dotSize + 2, 0, TAU);
        ctx.strokeStyle = 'rgba(88,166,255,' + (tvaAlpha * 2 * tvaPulse).toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      // All Roads targets dim (entropy)
      if (n.protocol === 'ALL_ROADS') {
        ctx.beginPath();
        ctx.arc(nx, ny, dotSize + 1, 0, TAU);
        ctx.strokeStyle = 'rgba(248,81,73,' + (tvaAlpha * 1.5).toFixed(4) + ')';
        ctx.lineWidth = 0.2;
        ctx.setLineDash([1, 1]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Label for significant nodes
      if (tvaAlpha > 0.005 && (n.protocol !== 'OPTIMAL' || ni % 5 === 0)) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(' + nColor + ',' + (tvaAlpha * 2).toFixed(4) + ')';
        ctx.textAlign = 'center';
        ctx.fillText(n.id + '(' + n.connections + ')', nx, ny - dotSize - 1.5);
      }
    }

    // ═══ STATUS LINE ═══
    if (tvaAlpha > 0.006) {
      var tvaCount = tvaTargets.length;
      var arCount = allRoadsTargets.length;
      var optCount = nodes.length - tvaCount - arCount;
      ctx.font = '2.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(88,166,255,' + (tvaAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText('🏗 TVA:' + tvaCount + ' build · 🟢 optimal:' + optCount + ' · ☠ roads:' + arCount + ' prune', 8, 98);
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.tva = {
      desc: 'Tennessee Valley Authority — growth targets',
      run: function() {
        scanTopology();
        var targets = executeTVA();
        var lines = ['═══ TVA — GROWTH OPPORTUNITIES (≤' + TVA_THRESHOLD + ' connections) ═══', ''];
        if (targets.length === 0) lines.push('  No under-connected nodes found!');
        for (var i = 0; i < targets.length; i++) {
          lines.push('  🏗 ' + targets[i].id + ' · ' + targets[i].connections + ' connections · ' + targets[i].type);
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.roads = {
      desc: 'All Roads — senescent targets',
      run: function() {
        scanTopology();
        var targets = executeAllRoads();
        var lines = ['═══ ALL ROADS LEAD TO ROAM — ENTROPY DYING (≥' + ALLROADS_THRESHOLD + ' connections) ═══', ''];
        if (targets.length === 0) lines.push('  No over-connected nodes found!');
        for (var i = 0; i < targets.length; i++) {
          lines.push('  ☠ ' + targets[i].id + ' · ' + targets[i].connections + ' connections · ' + targets[i].type);
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.scan = {
      desc: 'Full topology scan',
      run: function() {
        scanTopology();
        var nodes = Object.keys(nodeMap);
        var tva = 0, opt = 0, ar = 0;
        for (var i = 0; i < nodes.length; i++) {
          if (nodeMap[nodes[i]].protocol === 'TVA') tva++;
          else if (nodeMap[nodes[i]].protocol === 'ALL_ROADS') ar++;
          else opt++;
        }
        return '═══ TOPOLOGY SCAN ═══\n  total nodes: ' + nodes.length +
          '\n  🏗 TVA (build): ' + tva + ' nodes (≤' + TVA_THRESHOLD + ' conn)' +
          '\n  🟢 optimal: ' + opt + ' nodes (' + OPTIMAL_MIN + '-' + OPTIMAL_MAX + ' conn)' +
          '\n  ☠ all roads (prune): ' + ar + ' nodes (≥' + ALLROADS_THRESHOLD + ' conn)' +
          '\n\n  sweet spot: ' + OPTIMAL_MIN + '-' + OPTIMAL_MAX + ' connections per node';
      }
    };
    window.GAIA_IDE.language.push('tva', 'roads', 'scan');
  }

})(window.G);
