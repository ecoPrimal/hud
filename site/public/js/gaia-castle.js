// ═══════════════════════════════════════════════════════════
// MIND CASTLE — hierarchical locality mesh
// 1.000.null — max 1000 lines.
//
// ALL LOCALITY FROM MESH: LOCAL IN AND OUT.
// ROOM THEN SUB-ROOM. LATCH EACH TOGETHER.
// DRIFTING AND CONTINUOUS. FORMALLY IDENTIFYING.
// REFRIGERATING REALITY.
//
// HIERARCHY (each level nests inside the one above):
//   DEEP     — cosmos, cross-ocean, >500ms (castles in distant lands)
//   SOLAR    — same continent/cloud, 200-500ms (neighboring kingdoms)
//   INTRA    — between your land and neighbor's, 50-200ms (village)
//   LOCAL    — your network, <50ms (your land, your yard)
//   HYPER    — same machine, <5ms (your house)
//   ROOM     — same origin tab (a room in your house)
//   SUB-ROOM — iframe, widget, panel within a tab (furniture)
//
// CONTINUOUS DRIFT:
//   Nothing is static. Every node drifts. Latencies change.
//   Positions are re-measured every cycle. The mesh breathes.
//   Nodes that drift closer = converging. Farther = diverging.
//
// FORMAL IDENTIFICATION:
//   Every node gets a formal ID: tier.index.hash
//   deep.0.a3f2 = first deep node, hash a3f2
//   hyper.2.self = third hyperlocal, it's self
//
// REFRIGERATE REALITY:
//   State is persisted to localStorage every 30s.
//   On reload, the castle thaws from refrigerated state.
//   The house doesn't rebuild — it REMEMBERS.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ LOCALITY TIERS — the hierarchy ═══
  var TIERS = {
    deep:  { maxMs: Infinity, minMs: 500, color: [110,118,129], label: 'deep',  glyph: '☆' },
    solar: { maxMs: 500,  minMs: 200, color: [88,166,255],  label: 'solar', glyph: '☉' },
    intra: { maxMs: 200,  minMs: 50,  color: [163,113,247], label: 'intra', glyph: '◈' },
    local: { maxMs: 50,   minMs: 5,   color: [63,185,80],   label: 'local', glyph: '◎' },
    hyper: { maxMs: 5,    minMs: 0,   color: [201,168,76],  label: 'hyper', glyph: '⊕' },
    room:  { maxMs: 1,    minMs: 0,   color: [210,153,34],  label: 'room',  glyph: '□' },
    sub:   { maxMs: 0,    minMs: 0,   color: [140,100,55],  label: 'sub',   glyph: '·' }
  };

  function classifyTier(latencyMs) {
    if (latencyMs >= 500) return 'deep';
    if (latencyMs >= 200) return 'solar';
    if (latencyMs >= 50)  return 'intra';
    if (latencyMs >= 5)   return 'local';
    if (latencyMs >= 1)   return 'hyper';
    return 'room';
  }

  // ═══ FORMAL NODE — every locality gets one ═══
  var nodeCounter = 0;
  var allNodes = {};   // formalId → node
  var allEdges = [];   // { from, to, latency, type, drift }
  var tierCounts = { deep: 0, solar: 0, intra: 0, local: 0, hyper: 0, room: 0, sub: 0 };

  function formalId(tier, index, hash) {
    return tier + '.' + index + '.' + (hash || 'x');
  }

  function createNode(opts) {
    var tier = opts.tier || classifyTier(opts.latency || 0);
    var idx = tierCounts[tier]++;
    var hash = opts.hash || (opts.name || '').slice(0, 4).toLowerCase() || ('n' + nodeCounter);
    var id = formalId(tier, idx, hash);
    nodeCounter++;

    var node = {
      id: id,
      formalId: id,
      tier: tier,
      name: opts.name || id,
      latency: opts.latency || 0,
      url: opts.url || null,
      // Position: relative to hearth. Continuously drifts.
      x: opts.x || 0,
      y: opts.y || 0,
      // Drift velocity — everything moves
      dx: (Math.random() - 0.5) * 0.02,
      dy: (Math.random() - 0.5) * 0.02,
      // Parent/children for hierarchy
      parent: opts.parent || null,
      children: [],
      // Timestamps
      born: Date.now(),
      lastSeen: Date.now(),
      lastProbe: 0,
      // Sub-rooms (widgets, panels inside a tab)
      subRooms: [],
      // State
      alive: true,
      converging: false, // drifting closer to parent
      diverging: false   // drifting away from parent
    };

    allNodes[id] = node;

    // Add to parent's children
    if (opts.parent && allNodes[opts.parent]) {
      allNodes[opts.parent].children.push(id);
    }

    return node;
  }

  function createEdge(fromId, toId, latency, type) {
    var edge = {
      from: fromId,
      to: toId,
      latency: latency,
      type: type || 'road',
      born: Date.now(),
      drift: 0, // latency change per cycle
      lastMeasured: Date.now()
    };
    allEdges.push(edge);
    return edge;
  }

  // ═══ HEARTH — self, the origin of all measurement ═══
  var hearth = createNode({
    name: 'eastGate',
    tier: 'hyper',
    latency: 0,
    hash: 'self',
    x: 0, y: 0
  });
  hearth.dx = 0; hearth.dy = 0; // hearth doesn't drift

  // ═══ ROOMS — register tabs ═══
  function registerRoom(tabId, locality) {
    var existing = null;
    var nKeys = Object.keys(allNodes);
    for (var i = 0; i < nKeys.length; i++) {
      if (allNodes[nKeys[i]].name === 'tab-' + tabId) { existing = allNodes[nKeys[i]]; break; }
    }
    if (existing) {
      existing.lastSeen = Date.now();
      return existing;
    }

    var screenX = locality ? (locality.screenX || 0) : 0;
    var screenY = locality ? (locality.screenY || 0) : 0;
    var rm = createNode({
      name: 'tab-' + tabId,
      tier: 'room',
      latency: 0.5,
      hash: tabId.slice(0, 4),
      parent: hearth.id,
      x: screenX * 0.005,
      y: screenY * 0.005
    });

    // Sub-rooms: detect iframes, panels within the tab
    try {
      var iframes = document.querySelectorAll('iframe');
      for (var f = 0; f < iframes.length; f++) {
        createNode({
          name: 'iframe-' + f,
          tier: 'sub',
          latency: 0,
          hash: 'if' + f,
          parent: rm.id,
          x: rm.x + (f + 1) * 0.3,
          y: rm.y
        });
      }
    } catch(e) {}

    createEdge(hearth.id, rm.id, 0.5, 'hallway');
    return rm;
  }

  // Register self
  if (window.GAIA_LOCALITY) {
    registerRoom(window.GAIA_LOCALITY.tabId || 'self', window.GAIA_LOCALITY);
  }

  // ═══ WINDOWS — Golgi VPS endpoints ═══
  var WINDOW_ENDPOINTS = [
    { id: 'US', name: 'Dallas',    url: 'https://primals.eco',          dir: 'west' },
    { id: 'DE', name: 'Frankfurt', url: 'https://golgi-de.primals.eco', dir: 'east' },
    { id: 'IN', name: 'Mumbai',    url: 'https://golgi-in.primals.eco', dir: 'south' },
    { id: 'JP', name: 'Tokyo',     url: 'https://golgi-jp.primals.eco', dir: 'north' }
  ];

  function buildWindows() {
    var distances = window.GAIA_GOLGI_DISTANCES || {};
    var dirAngles = { north: -Math.PI/2, south: Math.PI/2, east: 0, west: Math.PI };

    for (var wi = 0; wi < WINDOW_ENDPOINTS.length; wi++) {
      var ep = WINDOW_ENDPOINTS[wi];
      var dist = distances[ep.id];
      var lat = dist ? (dist.avg || 999) : 999;
      var tier = classifyTier(lat);
      var angle = dirAngles[ep.dir] || 0;

      // Check if node already exists
      var existId = null;
      var nk = Object.keys(allNodes);
      for (var ei = 0; ei < nk.length; ei++) {
        if (allNodes[nk[ei]].name === ep.name) { existId = nk[ei]; break; }
      }

      if (existId) {
        var existing = allNodes[existId];
        // UPDATE: drift the latency
        existing.drift = lat - existing.latency;
        existing.converging = lat < existing.latency;
        existing.diverging = lat > existing.latency;
        existing.latency = lat;
        existing.tier = tier;
        existing.lastSeen = Date.now();
        existing.lastProbe = Date.now();
      } else {
        var node = createNode({
          name: ep.name,
          tier: tier,
          latency: lat,
          url: ep.url,
          hash: ep.id.toLowerCase(),
          parent: hearth.id,
          x: Math.cos(angle) * lat * 0.08,
          y: Math.sin(angle) * lat * 0.08
        });
        createEdge(hearth.id, node.id, lat, 'road');
      }
    }
  }

  // ═══ DOORS — exit paths (static, but formally identified) ═══
  var doors = [
    { id: 'front',  name: 'Front (public)',  href: 'https://primals.eco',   locked: false },
    { id: 'back',   name: 'Back (admin)',    href: '/admin',                locked: true },
    { id: 'garden', name: 'Garden (feed)',   href: '/feed.xml',             locked: false },
    { id: 'cellar', name: 'Cellar (data)',   href: '/data/',                locked: false },
    { id: 'attic',  name: 'Attic (legacy)',  href: '/index-old-eon.html',   locked: false },
    { id: 'tower',  name: 'Tower (crystal)', href: '/crystal.html',         locked: false }
  ];

  // ═══ CONTINUOUS DRIFT — nothing is static ═══
  function driftAll() {
    var ids = Object.keys(allNodes);
    for (var i = 0; i < ids.length; i++) {
      var n = allNodes[ids[i]];
      if (n.id === hearth.id) continue; // hearth stays at origin

      // Apply drift velocity
      n.x += n.dx;
      n.y += n.dy;

      // Gravity toward parent — nodes drift toward their parent
      if (n.parent && allNodes[n.parent]) {
        var p = allNodes[n.parent];
        var distX = p.x - n.x;
        var distY = p.y - n.y;
        var dist = Math.sqrt(distX * distX + distY * distY) || 1;

        // Target distance based on latency
        var targetDist = n.latency * 0.05;
        var pull = (dist - targetDist) * 0.001;

        n.dx += (distX / dist) * pull;
        n.dy += (distY / dist) * pull;
      }

      // Damping — prevent runaway drift
      n.dx *= 0.98;
      n.dy *= 0.98;

      // Converging/diverging detection
      if (n.parent && allNodes[n.parent]) {
        var p2 = allNodes[n.parent];
        var d2 = Math.sqrt(Math.pow(p2.x - n.x, 2) + Math.pow(p2.y - n.y, 2));
        var prevD = Math.sqrt(Math.pow(p2.x - (n.x - n.dx), 2) + Math.pow(p2.y - (n.y - n.dy), 2));
        n.converging = d2 < prevD;
        n.diverging = d2 > prevD;
      }

      // Evict stale nodes (>5min unseen, not self)
      if (n.tier === 'room' && Date.now() - n.lastSeen > 300000) {
        n.alive = false;
      }
    }

    // Update edge latencies with drift
    for (var e = 0; e < allEdges.length; e++) {
      var edge = allEdges[e];
      var from = allNodes[edge.from];
      var to = allNodes[edge.to];
      if (from && to) {
        var edgeDist = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
        edge.drift = edgeDist - edge.latency * 0.05;
      }
    }
  }

  // ═══ SIBLING WATCHER — discover rooms ═══
  function watchSiblings() {
    var sibs = window.GAIA_SIBLINGS || {};
    var keys = Object.keys(sibs);
    for (var i = 0; i < keys.length; i++) {
      var sib = sibs[keys[i]];
      if (sib && Date.now() - sib.lastSeen < 30000) {
        registerRoom(keys[i], sib.locality);
      }
    }
  }

  // ═══ REFRIGERATE — persist state to localStorage ═══
  function refrigerate() {
    var state = {
      ts: Date.now(),
      nodeCount: Object.keys(allNodes).length,
      edgeCount: allEdges.length,
      tierCounts: tierCounts,
      nodes: {},
      edges: []
    };

    // Save node positions + latencies (not the full objects)
    var nk = Object.keys(allNodes);
    for (var i = 0; i < nk.length; i++) {
      var n = allNodes[nk[i]];
      state.nodes[n.id] = {
        id: n.id, name: n.name, tier: n.tier,
        latency: n.latency, x: n.x, y: n.y,
        parent: n.parent, alive: n.alive,
        born: n.born, lastSeen: n.lastSeen
      };
    }

    // Save edge latencies
    for (var e = 0; e < allEdges.length; e++) {
      state.edges.push({
        from: allEdges[e].from, to: allEdges[e].to,
        latency: allEdges[e].latency, type: allEdges[e].type
      });
    }

    try {
      localStorage.setItem('gaia-castle-state', JSON.stringify(state));
    } catch(e) {}
  }

  // ═══ THAW — restore from refrigerated state ═══
  function thaw() {
    try {
      var raw = localStorage.getItem('gaia-castle-state');
      if (!raw) return;
      var state = JSON.parse(raw);
      if (!state || Date.now() - state.ts > 3600000) return; // >1hr = stale, rebuild

      // Restore nodes
      var sn = Object.keys(state.nodes || {});
      for (var i = 0; i < sn.length; i++) {
        var saved = state.nodes[sn[i]];
        if (!allNodes[saved.id] && saved.id !== hearth.id) {
          createNode({
            name: saved.name, tier: saved.tier,
            latency: saved.latency, hash: saved.id.split('.')[2],
            parent: saved.parent, x: saved.x, y: saved.y
          });
        }
      }
    } catch(e) {}
  }

  // Boot: thaw → build windows → start cycles
  thaw();
  setTimeout(function() { buildWindows(); watchSiblings(); }, 3000);
  setInterval(function() { driftAll(); }, 200);     // drift 5× per second
  setInterval(function() { watchSiblings(); }, 5000);
  setInterval(function() { buildWindows(); }, 30000);
  setInterval(function() { refrigerate(); }, 30000); // refrigerate every 30s

  // ═══ EXPOSE ═══
  window.GAIA_CASTLE = {
    hearth: hearth,
    nodes: allNodes,
    edges: allEdges,
    doors: doors,
    tiers: TIERS,
    tierCounts: tierCounts,
    createNode: createNode,
    createEdge: createEdge,
    classifyTier: classifyTier,
    formalId: formalId
  };
  window.GAIA_MESH = { nodes: allNodes, edges: allEdges };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;
    var isLocal = g.isLocalHost;

    var cT = breathT * 0.15;
    var cAlpha = isLocal ? (0.010 + Math.sin(cT * 0.4) * 0.006) : (0.004 + Math.sin(cT * 0.4) * 0.003);
    if (cAlpha < 0.003) return;

    var scale = R * 0.8; // mesh scale factor

    // ═══ EDGES FIRST (under nodes) ═══
    for (var ei = 0; ei < allEdges.length; ei++) {
      var edge = allEdges[ei];
      var fromN = allNodes[edge.from];
      var toN = allNodes[edge.to];
      if (!fromN || !toN || !fromN.alive || !toN.alive) continue;

      var fx = cx + fromN.x * scale * 0.3;
      var fy = cy + fromN.y * scale * 0.3;
      var tx = cx + toN.x * scale * 0.3;
      var ty = cy + toN.y * scale * 0.3;

      var edgeTier = TIERS[classifyTier(edge.latency)] || TIERS.deep;
      var ec = edgeTier.color;

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      var eAlpha = cAlpha * (edge.type === 'hallway' ? 1.5 : 0.8);
      ctx.strokeStyle = 'rgba(' + ec[0] + ',' + ec[1] + ',' + ec[2] + ',' + eAlpha.toFixed(4) + ')';
      ctx.lineWidth = edge.type === 'hallway' ? 0.5 : 0.2;
      if (edge.type === 'trail') ctx.setLineDash([1, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Latency label on longer edges
      if (edge.latency > 10 && cAlpha > 0.01) {
        var mx = (fx + tx) / 2, my = (fy + ty) / 2;
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + ec[0] + ',' + ec[1] + ',' + ec[2] + ',' + (cAlpha * 1.2).toFixed(4) + ')';
        ctx.fillText(Math.round(edge.latency) + 'ms', mx, my - 1);
      }
    }

    // ═══ NODES ═══
    var nKeys = Object.keys(allNodes);
    for (var ni = 0; ni < nKeys.length; ni++) {
      var n = allNodes[nKeys[ni]];
      if (!n.alive) continue;

      var tier = TIERS[n.tier] || TIERS.deep;
      var nc = tier.color;
      var nx = cx + n.x * scale * 0.3;
      var ny = cy + n.y * scale * 0.3;

      // Node size by tier
      var nSize = n.id === hearth.id ? 2.5 :
                  n.tier === 'room' ? 1.5 :
                  n.tier === 'sub' ? 0.5 :
                  n.tier === 'hyper' ? 2.0 :
                  n.tier === 'local' ? 1.8 : 1.2;

      // Converging = pulse brighter, diverging = dimmer
      var nAlpha = cAlpha * 1.5;
      if (n.converging) nAlpha *= 1.3;
      if (n.diverging) nAlpha *= 0.7;

      // Node dot
      ctx.beginPath();
      ctx.arc(nx, ny, nSize, 0, TAU);
      ctx.fillStyle = 'rgba(' + nc[0] + ',' + nc[1] + ',' + nc[2] + ',' + nAlpha.toFixed(4) + ')';
      ctx.fill();

      // Hearth gets a warm glow
      if (n.id === hearth.id) {
        var hearthPulse = 0.5 + Math.sin(cT * 2) * 0.3;
        ctx.beginPath();
        ctx.arc(nx, ny, nSize * 2, 0, TAU);
        ctx.fillStyle = 'rgba(210,100,30,' + (nAlpha * 0.3 * hearthPulse).toFixed(4) + ')';
        ctx.fill();
      }

      // Formal ID label
      if (cAlpha > 0.008 && n.tier !== 'sub') {
        ctx.font = '1.8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + nc[0] + ',' + nc[1] + ',' + nc[2] + ',' + (nAlpha * 0.8).toFixed(4) + ')';
        ctx.fillText(tier.glyph + ' ' + n.name, nx, ny - nSize - 1);
      }

      // Children lines (parent → child hierarchy)
      for (var ci = 0; ci < n.children.length; ci++) {
        var child = allNodes[n.children[ci]];
        if (!child || !child.alive) continue;
        var childX = cx + child.x * scale * 0.3;
        var childY = cy + child.y * scale * 0.3;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(childX, childY);
        ctx.strokeStyle = 'rgba(' + nc[0] + ',' + nc[1] + ',' + nc[2] + ',' + (nAlpha * 0.4).toFixed(4) + ')';
        ctx.lineWidth = 0.15;
        ctx.stroke();
      }
    }

    // ═══ DOORS — along the bottom ═══
    if (isLocal && cAlpha > 0.008) {
      for (var di = 0; di < doors.length; di++) {
        var door = doors[di];
        var dw = 4, dh = 6;
        var dx = cx - (doors.length * 7) / 2 + di * 7;
        var dy = cy + R * 0.45;

        ctx.beginPath();
        ctx.rect(dx, dy, dw, dh);
        var dColor = door.locked ? '248,81,73' : '210,153,34';
        ctx.strokeStyle = 'rgba(' + dColor + ',' + (cAlpha * 1.5).toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(dx + dw - 0.8, dy + dh / 2, 0.3, 0, TAU);
        ctx.fillStyle = 'rgba(' + dColor + ',' + (cAlpha * 2).toFixed(4) + ')';
        ctx.fill();
      }
    }

    // ═══ STATS ═══
    if (cAlpha > 0.008) {
      var alive = 0, roomCount = 0, subCount = 0;
      var ik = Object.keys(allNodes);
      for (var si = 0; si < ik.length; si++) {
        if (allNodes[ik[si]].alive) {
          alive++;
          if (allNodes[ik[si]].tier === 'room') roomCount++;
          if (allNodes[ik[si]].tier === 'sub') subCount++;
        }
      }
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(140,100,55,' + (cAlpha * 2).toFixed(4) + ')';
      ctx.fillText('🏰 ' + alive + ' nodes · ' + roomCount + '□ · ' + subCount + '· · ' + allEdges.length + ' edges · drift', 8, 68);
    }
  });

})(window.G);
