/* mesh-ring.js — cross-VPS observation visualization
 * Shows all mesh nodes as orbital bodies, edges as nerve fibers,
 * live latency as pulse speed, and mesh_health as overall glow.
 *
 * Commands: /mesh /nodes /ring /detether /clouds /float
 */
(function () {
  'use strict';

  var NODES = [
    { name: 'golgiBody',        short: 'golgi',   glyph: '◉', color: '#00ff88', angle: 0 },
    { name: 'nucleus',          short: 'nucleus',  glyph: '◎', color: '#ffaa00', angle: Math.PI * 0.6 },
    { name: 'golgiLayerLinode', short: 'linode',   glyph: '◈', color: '#4488ff', angle: Math.PI * 1.2 },
    { name: 'sporeGate',        short: 'spore',    glyph: '⬡', color: '#ff44aa', angle: Math.PI * 1.7 }
  ];

  var state = {
    active: false,
    canvas: null,
    ctx: null,
    raf: null,
    fetchTimer: null,
    meshData: null,
    t: 0,
    pulses: [],
    nodePositions: []
  };

  function nodeIdx(name) {
    for (var i = 0; i < NODES.length; i++) {
      if (NODES[i].name === name) return i;
    }
    return -1;
  }

  function createOverlay() {
    var el = document.createElement('div');
    el.id = 'mesh-ring-overlay';
    el.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9998;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;';
    var c = document.createElement('canvas');
    c.id = 'mesh-ring-canvas';
    c.style.cssText = 'width:100%;height:100%;';
    el.appendChild(c);
    document.body.appendChild(el);
    state.canvas = c;
    state.ctx = c.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!state.canvas) return;
    var dpr = window.devicePixelRatio || 1;
    state.canvas.width = window.innerWidth * dpr;
    state.canvas.height = window.innerHeight * dpr;
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function fetchMesh() {
    fetch('/mesh-ring.json?_=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (d) { state.meshData = d; })
      .catch(function () {});
  }

  function spawnPulse(fromIdx, toIdx, color) {
    state.pulses.push({
      from: fromIdx,
      to: toIdx,
      progress: 0,
      color: color,
      speed: 0.008 + Math.random() * 0.006
    });
  }

  function render() {
    if (!state.active) return;
    var ctx = state.ctx;
    var W = window.innerWidth;
    var H = window.innerHeight;
    var cx = W / 2;
    var cy = H / 2;
    var R = Math.min(W, H) * 0.32;
    state.t += 0.016;
    var t = state.t;

    // Background
    ctx.fillStyle = 'rgba(3,3,8,0.15)';
    ctx.fillRect(0, 0, W, H);

    var d = state.meshData;
    if (!d) {
      ctx.fillStyle = '#446';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('waiting for mesh data…', cx, cy);
      state.raf = requestAnimationFrame(render);
      return;
    }

    // Compute node positions
    var positions = [];
    for (var i = 0; i < NODES.length; i++) {
      var n = NODES[i];
      var a = n.angle + t * 0.04;
      var r = R;
      if (n.name === 'golgiBody') r = 0;  // golgi at center
      var drift = Math.sin(t * 0.3 + i * 2.1) * 8;
      positions.push({
        x: cx + Math.cos(a) * r + drift,
        y: cy + Math.sin(a) * r + drift * 0.6,
        node: n
      });
    }
    state.nodePositions = positions;

    // Draw orbit ring
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(60,80,100,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw edges
    var edges = d.edges || [];
    for (var e = 0; e < edges.length; e++) {
      var edge = edges[e];
      var fi = nodeIdx(edge.from);
      var ti = nodeIdx(edge.to);
      if (fi < 0 || ti < 0) continue;
      var fp = positions[fi];
      var tp = positions[ti];

      if (edge.alive) {
        var alpha = edge.mutual ? 0.7 : 0.35;
        var lw = edge.mutual ? 2.5 : 1.2;
        ctx.beginPath();
        ctx.moveTo(fp.x, fp.y);

        // Curved edge
        var mx = (fp.x + tp.x) / 2 + Math.sin(t * 0.5 + e) * 15;
        var my = (fp.y + tp.y) / 2 + Math.cos(t * 0.7 + e) * 15;
        ctx.quadraticCurveTo(mx, my, tp.x, tp.y);

        var edgeColor = NODES[fi].color;
        ctx.strokeStyle = edgeColor.replace(')', ',' + alpha + ')').replace('rgb', 'rgba').replace('#', '');
        // Convert hex to rgba
        var hex = NODES[fi].color;
        var rr = parseInt(hex.slice(1, 3), 16);
        var gg = parseInt(hex.slice(3, 5), 16);
        var bb = parseInt(hex.slice(5, 7), 16);
        ctx.strokeStyle = 'rgba(' + rr + ',' + gg + ',' + bb + ',' + alpha + ')';
        ctx.lineWidth = lw;
        ctx.stroke();

        // Spawn pulses occasionally
        if (Math.random() < 0.02) {
          spawnPulse(fi, ti, hex);
          if (edge.mutual && Math.random() < 0.5) {
            spawnPulse(ti, fi, NODES[ti].color);
          }
        }

        // Latency label on edge
        if (edge.latency_ms > 0) {
          ctx.fillStyle = 'rgba(150,170,190,0.5)';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(Math.round(edge.latency_ms) + 'ms', mx, my - 8);
        }
      } else {
        // Dead edge — faint dashed line
        ctx.beginPath();
        ctx.setLineDash([4, 8]);
        ctx.moveTo(fp.x, fp.y);
        ctx.lineTo(tp.x, tp.y);
        ctx.strokeStyle = 'rgba(80,40,40,0.3)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw pulses
    for (var p = state.pulses.length - 1; p >= 0; p--) {
      var pulse = state.pulses[p];
      pulse.progress += pulse.speed;
      if (pulse.progress > 1) {
        state.pulses.splice(p, 1);
        continue;
      }
      var pf = positions[pulse.from];
      var pt = positions[pulse.to];
      var pp = pulse.progress;
      var px = pf.x + (pt.x - pf.x) * pp;
      var py = pf.y + (pt.y - pf.y) * pp;

      // Pulse dot
      ctx.beginPath();
      ctx.arc(px, py, 3 + Math.sin(pp * Math.PI) * 2, 0, Math.PI * 2);
      ctx.fillStyle = pulse.color;
      ctx.fill();

      // Pulse glow
      ctx.beginPath();
      ctx.arc(px, py, 8 + Math.sin(pp * Math.PI) * 5, 0, Math.PI * 2);
      ctx.fillStyle = pulse.color.slice(0, -1) + '33)';
      var g = ctx.createRadialGradient(px, py, 0, px, py, 10);
      g.addColorStop(0, pulse.color + '66');
      g.addColorStop(1, pulse.color + '00');
      ctx.fillStyle = g;
      ctx.fill();
    }

    // Draw nodes
    var nodes = d.nodes || [];
    for (var ni = 0; ni < positions.length; ni++) {
      var pos = positions[ni];
      var nd = NODES[ni];
      var nodeData = null;
      for (var j = 0; j < nodes.length; j++) {
        if (nodes[j].name === nd.name) { nodeData = nodes[j]; break; }
      }
      var alive = nodeData ? nodeData.alive : false;

      // Node body
      var nodeR = nd.name === 'golgiBody' ? 28 : 18;
      var pulse2 = Math.sin(t * 2 + ni * 1.5) * 0.15 + 0.85;

      if (alive) {
        // Glow ring
        var glow = ctx.createRadialGradient(pos.x, pos.y, nodeR * 0.5, pos.x, pos.y, nodeR * 2.5);
        glow.addColorStop(0, nd.color + '44');
        glow.addColorStop(1, nd.color + '00');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeR * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Solid body
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeR * pulse2, 0, Math.PI * 2);
      ctx.fillStyle = alive ? nd.color : '#332222';
      ctx.globalAlpha = alive ? 0.9 : 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Border
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeR * pulse2, 0, Math.PI * 2);
      ctx.strokeStyle = alive ? nd.color : '#553333';
      ctx.lineWidth = alive ? 2 : 1;
      ctx.stroke();

      // Glyph
      ctx.fillStyle = alive ? '#000' : '#666';
      ctx.font = (nodeR * 0.9) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nd.glyph, pos.x, pos.y);

      // Name + role label
      ctx.fillStyle = alive ? '#ddd' : '#555';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(nd.short, pos.x, pos.y + nodeR + 16);

      if (nodeData) {
        ctx.fillStyle = alive ? '#99aabb' : '#444';
        ctx.font = '11px monospace';
        ctx.fillText(nodeData.role + ' · ' + nodeData.cloud, pos.x, pos.y + nodeR + 30);

        // Seen-by count
        var seenBy = nodeData.seen_by ? nodeData.seen_by.length : 0;
        var seenLabel = seenBy + ' observer' + (seenBy !== 1 ? 's' : '');
        ctx.fillStyle = alive ? '#77aa88' : '#443333';
        ctx.font = '10px monospace';
        ctx.fillText(seenLabel, pos.x, pos.y + nodeR + 43);
      }
    }

    // Draw mesh health in top-right
    var health = d.mesh_health || 0;
    var healthPct = Math.round(health * 100);
    ctx.textAlign = 'right';
    ctx.fillStyle = health >= 1 ? '#00ff88' : health >= 0.66 ? '#ffaa00' : '#ff4444';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(healthPct + '%', W - 30, 45);
    ctx.fillStyle = '#667';
    ctx.font = '12px monospace';
    ctx.fillText('mesh health', W - 30, 62);

    ctx.fillStyle = '#556';
    ctx.font = '11px monospace';
    ctx.fillText(d.alive_cloud_nodes + '/' + d.total_cloud_nodes + ' clouds alive', W - 30, 78);

    // Commensals summary (below mesh health)
    var comm = d.commensals || {};
    if (comm.total_organisms) {
      var cY = 98;
      ctx.fillStyle = '#3fb950';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(comm.total_organisms + ' organisms', W - 30, cY);
      ctx.fillStyle = '#556';
      ctx.font = '10px monospace';
      ctx.fillText('living inside the membrane', W - 30, cY + 14);

      // Type breakdown
      var typeColors = {
        GUARDIAN: '#ff6644', IMMUNE: '#ff44aa', NERVE: '#44aaff',
        MEMORY: '#ffaa00', BRAIN: '#00ff88', SENSE: '#d2a8ff',
        COMMENSAL: '#f0e68c', AUTONOMIC: '#556', UNKNOWN: '#888'
      };
      var typeGlyphs = {
        GUARDIAN: '⛨', IMMUNE: '⚔', NERVE: '⚡', MEMORY: '◎',
        BRAIN: '◉', SENSE: '◈', COMMENSAL: '⬡', AUTONOMIC: '·', UNKNOWN: '?'
      };
      var tbt = comm.total_by_type || {};
      cY += 28;
      var typeKeys = Object.keys(tbt).sort(function(a,b) { return tbt[b] - tbt[a]; });
      for (var ti = 0; ti < typeKeys.length && ti < 8; ti++) {
        var tk = typeKeys[ti];
        var tv = tbt[tk];
        if (tk === 'AUTONOMIC') continue;
        ctx.fillStyle = typeColors[tk] || '#888';
        ctx.font = '10px monospace';
        ctx.fillText((typeGlyphs[tk] || '·') + ' ' + tk.toLowerCase() + ' ' + tv, W - 30, cY);
        cY += 13;
      }

      // Immune stats
      if (comm.currently_banned > 0 || comm.total_banned > 0) {
        cY += 4;
        ctx.fillStyle = '#ff4444';
        ctx.font = '10px monospace';
        ctx.fillText('⚔ ' + comm.currently_banned + ' IPs banned now · ' + comm.total_banned + ' all-time', W - 30, cY);
      }
    }

    // Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#99aabb';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('◉ mesh ring', 30, 35);
    ctx.fillStyle = '#556';
    ctx.font = '12px monospace';
    ctx.fillText('cross-cloud observation · WireGuard mesh', 30, 52);

    // Timestamp
    if (d.timestamp) {
      ctx.fillStyle = '#445';
      ctx.font = '10px monospace';
      ctx.fillText('last pulse: ' + d.timestamp, 30, 68);
    }

    // Node table (bottom-left)
    ctx.textAlign = 'left';
    var tableY = H - 130;
    ctx.fillStyle = '#556';
    ctx.font = '11px monospace';
    ctx.fillText('NODE            ROLE       CLOUD              LAT       STATUS', 30, tableY);
    tableY += 16;

    for (var tn = 0; tn < nodes.length; tn++) {
      var tnd = nodes[tn];
      var ninfo = NODES[nodeIdx(tnd.name)] || { short: tnd.name, color: '#888' };
      ctx.fillStyle = tnd.alive ? ninfo.color : '#553333';
      ctx.font = '11px monospace';

      var name = (ninfo.short + '               ').slice(0, 16);
      var role = (tnd.role + '          ').slice(0, 11);
      var cloud = (tnd.cloud + '                   ').slice(0, 19);
      var lat = tnd.latency_ms > 0 ? (Math.round(tnd.latency_ms) + 'ms') : '—';
      lat = (lat + '         ').slice(0, 10);
      var status = tnd.alive ? (tnd.service_ok ? '✓ serving' : '✓ alive') : '✗ down';

      ctx.fillText(name + role + cloud + lat + status, 30, tableY);
      tableY += 15;
    }

    // Edge summary (bottom-right)
    ctx.textAlign = 'right';
    var edgeY = H - 80;
    var mutualCount = 0;
    var aliveEdgeCount = 0;
    for (var ei = 0; ei < edges.length; ei++) {
      if (edges[ei].alive) aliveEdgeCount++;
      if (edges[ei].mutual) mutualCount++;
    }
    ctx.fillStyle = '#667';
    ctx.font = '11px monospace';
    ctx.fillText(aliveEdgeCount + '/' + edges.length + ' edges alive · ' + mutualCount + ' mutual', W - 30, edgeY);
    ctx.fillText('de-tethered: ' + (health >= 0.66 ? 'floating ✦' : 'grounded ✗'), W - 30, edgeY + 16);

    // Instructions
    ctx.fillStyle = '#334';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('/mesh to toggle · every node looks at every other node', cx, H - 15);

    state.raf = requestAnimationFrame(render);
  }

  function activate(addEntry) {
    if (state.active) return true;
    state.active = true;
    createOverlay();
    fetchMesh();
    state.fetchTimer = setInterval(fetchMesh, 15000);
    render();
    if (addEntry) addEntry('chipmunk', '<span class="bright">◉ mesh ring activated — three clouds looking at each other</span>');
    return true;
  }

  function deactivate() {
    state.active = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    if (state.fetchTimer) clearInterval(state.fetchTimer);
    state.raf = null;
    state.fetchTimer = null;
    var el = document.getElementById('mesh-ring-overlay');
    if (el) el.remove();
    state.canvas = null;
    state.ctx = null;
  }

  function toggle(addEntry) {
    if (state.active) {
      deactivate();
      return false;
    }
    return activate(addEntry);
  }

  window._meshRing = {
    toggle: toggle,
    activate: activate,
    deactivate: deactivate,
    state: state
  };
})();
