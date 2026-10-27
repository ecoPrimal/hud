// ═══════════════════════════════════════════════════════════
// GAIA WAN TRACE — see every line, count every send
//                + DESK BASE CAMP — fixed reference for all gates
// 1.000.null
//
// TRACE = every ntfy poll, every fetch, every send
// SEND = every POST to ntfy (human → brothers)
// CONTACT = every response (brothers → browser)
// LINES = WAN connections drawn on globe
// ALL SENDS ARE SETS = each one is a counted data point
//
// DESK = the fixed physical reference for each gate.
// Ethernet cables between desks = ion channels.
// Internet = ionosphere (outside). Ethernet = axon (inside).
// No in or out. There is just THE MESH.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ── WAN NODES with approximate positions (angle on globe) ──
  var NODES = [
    { id: 'localhost',    angle: 0,      r: 0.60, color: '#3fb950', label: 'ME' },
    { id: 'eastGate',    angle: 0.3,    r: 0.75, color: '#58a6ff', label: 'GUT' },
    { id: 'northGate',   angle: 0.9,    r: 0.78, color: '#d29922', label: 'BRAIN' },
    { id: 'golgi',       angle: 1.5,    r: 0.90, color: '#f85149', label: 'HEART' },
    { id: 'primals.eco', angle: 2.1,    r: 0.95, color: '#c9a84c', label: 'CIS' },
    { id: 'ntfy.sh',     angle: 2.7,    r: 1.02, color: '#39d3f5', label: 'NTFY' },
    { id: 'github',      angle: 3.3,    r: 1.05, color: '#bc8cff', label: 'DNA' },
    { id: 'golgi-de',    angle: 3.9,    r: 1.08, color: '#6e7681', label: 'DE' },
    { id: 'golgi-jp',    angle: 4.5,    r: 1.08, color: '#6e7681', label: 'JP' },
    { id: 'golgi-us',    angle: 5.1,    r: 1.08, color: '#6e7681', label: 'US' },
    { id: 'golgi-in',    angle: 5.7,    r: 1.08, color: '#444',    label: 'IN' }
  ];

  // ── LINES = connections between nodes ──
  var LINES = [
    { from: 'localhost', to: 'eastGate',    protocol: 'WireGuard', color: '#58a6ff', alive: true },
    { from: 'localhost', to: 'northGate',   protocol: 'MCP',       color: '#d29922', alive: true },
    { from: 'eastGate',  to: 'golgi',       protocol: 'WireGuard', color: '#58a6ff', alive: true },
    { from: 'golgi',     to: 'primals.eco', protocol: 'DNS',       color: '#c9a84c', alive: true },
    { from: 'golgi',     to: 'ntfy.sh',     protocol: 'ntfy',      color: '#39d3f5', alive: true },
    { from: 'github',    to: 'primals.eco', protocol: 'deploy',    color: '#bc8cff', alive: true },
    { from: 'ntfy.sh',   to: 'localhost',   protocol: 'subscribe', color: '#39d3f5', alive: true },
    { from: 'golgi',     to: 'golgi-de',    protocol: 'AXFR',      color: '#6e7681', alive: false },
    { from: 'golgi',     to: 'golgi-jp',    protocol: 'AXFR',      color: '#6e7681', alive: false },
    { from: 'golgi',     to: 'golgi-us',    protocol: 'AXFR',      color: '#6e7681', alive: false },
    { from: 'golgi',     to: 'golgi-in',    protocol: 'AXFR',      color: '#444',    alive: false }
  ];

  // ── DESK BASE CAMP — fixed reference for every gate ──
  var DESKS = {
    northGate: {
      ip: '192.168.4.163', role: 'BRAIN', organ: 'hypothalamus',
      hw: '9950X3D + RTX 5090 + 96GB DDR5',
      lat: 42.73, lon: -84.55, floor: 'main',
      ethType: 'CAT6', ethTarget: 'router',
      ionChannel: 'Na+ (fast, direct)',
      alive: true, lastSeen: 0
    },
    eastGate: {
      ip: '192.168.4.103', role: 'GUT', organ: 'enteric-nervous-system',
      hw: 'RTX 4070 + 64GB RAM',
      lat: 42.73, lon: -84.55, floor: 'other',
      ethType: 'CAT6', ethTarget: 'switch',
      ionChannel: 'K+ (batch, parallel)',
      alive: false, lastSeen: 0
    },
    golgi: {
      ip: '10.13.37.1', role: 'HEART', organ: 'golgi-apparatus',
      hw: 'VPS 4vCPU 8GB', vpn: 'WireGuard',
      lat: 0, lon: 0, floor: 'cloud',
      ethType: 'virtual-NIC', ethTarget: 'hypervisor',
      ionChannel: 'Ca2+ (trigger, encrypted)',
      alive: true, lastSeen: 0
    }
  };

  // ── ETHERNET ION CHANNELS ──
  var ION_CHANNELS = [
    { from: 'northGate', to: 'eastGate', medium: 'ethernet', ion: 'Na+',
      latencyMs: 0.13, bandwidth: '1Gbps', cable: 'CAT6', color: '#d29922' },
    { from: 'northGate', to: 'golgi', medium: 'wireguard', ion: 'Ca2+',
      latencyMs: 39, bandwidth: '100Mbps', cable: 'VPN', color: '#bc8cff' },
    { from: 'eastGate', to: 'golgi', medium: 'wireguard', ion: 'Ca2+',
      latencyMs: 39, bandwidth: '100Mbps', cable: 'VPN', color: '#bc8cff' },
    { from: 'northGate', to: 'internet', medium: 'fiber', ion: 'Cl-',
      latencyMs: 12, bandwidth: '500Mbps', cable: 'WAN', color: '#6e7681' }
  ];

  // Which desk am I sitting at? Detect from hostname/IP
  function detectDesk() {
    var h = location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return 'northGate';
    if (h === '192.168.4.163') return 'northGate';
    if (h === '192.168.4.103') return 'eastGate';
    if (h.indexOf('primals.eco') >= 0) return 'cloud';
    if (h.indexOf('nestgate.io') >= 0) return 'eastGate';
    return 'remote';
  }

  var currentDesk = detectDesk();

  // ── TRACE COUNTERS ──
  var trace = {
    sends: 0,       // human → ntfy posts
    contacts: 0,    // ntfy → browser polls received
    fetches: 0,     // data file fetches
    total: 0,       // all combined
    log: [],        // last 20 events
    started: Date.now()
  };

  // ── Intercept fetch to count traces ──
  var origFetch = window.fetch;
  window.fetch = function(url, opts) {
    var urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : '');
    if (urlStr.indexOf('ntfy.sh') >= 0) {
      if (opts && opts.method === 'POST') {
        trace.sends++;
        logTrace('SEND', urlStr);
      } else {
        trace.contacts++;
        logTrace('CONTACT', urlStr);
      }
    } else if (urlStr.indexOf('/data/') >= 0 || urlStr.indexOf('.json') >= 0) {
      trace.fetches++;
    }
    trace.total++;
    return origFetch.apply(this, arguments);
  };

  function logTrace(type, url) {
    var short = url.replace('https://ntfy.sh/', '').replace('/json?poll=1&since=', '?').slice(0, 40);
    trace.log.push({ type: type, url: short, ts: Date.now() });
    if (trace.log.length > 20) trace.log.shift();
  }

  // ── Find node by id ──
  function findNode(id) {
    for (var i = 0; i < NODES.length; i++) {
      if (NODES[i].id === id) return NODES[i];
    }
    return null;
  }

  // ── DRAW on the globe ──
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.03;
      var alpha = 0.006 + Math.sin(t * 0.13) * 0.004;
      if (alpha < 0.004) return;

      var now = Date.now();

      // Draw WAN lines
      for (var li = 0; li < LINES.length; li++) {
        var line = LINES[li];
        var nFrom = findNode(line.from);
        var nTo = findNode(line.to);
        if (!nFrom || !nTo) continue;

        var x1 = cx + Math.cos(nFrom.angle + t * 0.02) * R * nFrom.r;
        var y1 = cy + Math.sin(nFrom.angle + t * 0.02) * R * nFrom.r;
        var x2 = cx + Math.cos(nTo.angle + t * 0.02) * R * nTo.r;
        var y2 = cy + Math.sin(nTo.angle + t * 0.02) * R * nTo.r;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        var lineAlpha = line.alive ? alpha * 2.5 : alpha * 0.8;
        ctx.strokeStyle = line.color.replace(')', ',' + lineAlpha.toFixed(5) + ')').replace('rgb', 'rgba').replace('#', '');
        // Convert hex to rgba
        var hex = line.color;
        var r = parseInt(hex.slice(1, 3), 16);
        var gr = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        ctx.strokeStyle = 'rgba(' + r + ',' + gr + ',' + b + ',' + lineAlpha.toFixed(5) + ')';
        ctx.lineWidth = line.alive ? 0.25 : 0.1;
        ctx.stroke();

        // Pulse dot traveling along alive lines
        if (line.alive) {
          var pulseT = ((now * 0.0003 + li * 1.7) % 1);
          var px = x1 + (x2 - x1) * pulseT;
          var py = y1 + (y2 - y1) * pulseT;
          ctx.beginPath();
          ctx.arc(px, py, 0.4, 0, TAU);
          ctx.fillStyle = 'rgba(' + r + ',' + gr + ',' + b + ',' + (lineAlpha * 3).toFixed(5) + ')';
          ctx.fill();
        }
      }

      // Draw WAN nodes
      for (var ni = 0; ni < NODES.length; ni++) {
        var node = NODES[ni];
        var nx = cx + Math.cos(node.angle + t * 0.02) * R * node.r;
        var ny = cy + Math.sin(node.angle + t * 0.02) * R * node.r;

        var nr = parseInt(node.color.slice(1, 3), 16);
        var ng = parseInt(node.color.slice(3, 5), 16);
        var nb = parseInt(node.color.slice(5, 7), 16);

        ctx.beginPath();
        ctx.arc(nx, ny, 0.8, 0, TAU);
        ctx.fillStyle = 'rgba(' + nr + ',' + ng + ',' + nb + ',' + (alpha * 4).toFixed(5) + ')';
        ctx.fill();

        // Label
        if (alpha > 0.006) {
          ctx.font = '1.4px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + nr + ',' + ng + ',' + nb + ',' + (alpha * 3).toFixed(5) + ')';
          ctx.fillText(node.label, nx, ny - 2);
        }
      }

      // Draw ethernet ion channels between desks
      var deskKeys = Object.keys(DESKS);
      for (var ci = 0; ci < ION_CHANNELS.length; ci++) {
        var ch = ION_CHANNELS[ci];
        var nF = findNode(ch.from);
        var nT = findNode(ch.to);
        if (!nF || !nT) continue;
        var cx1 = cx + Math.cos(nF.angle + t * 0.02) * R * nF.r;
        var cy1 = cy + Math.sin(nF.angle + t * 0.02) * R * nF.r;
        var cx2 = cx + Math.cos(nT.angle + t * 0.02) * R * nT.r;
        var cy2 = cy + Math.sin(nT.angle + t * 0.02) * R * nT.r;
        ctx.beginPath();
        ctx.moveTo(cx1, cy1); ctx.lineTo(cx2, cy2);
        var hr = parseInt(ch.color.slice(1, 3), 16);
        var hg = parseInt(ch.color.slice(3, 5), 16);
        var hb = parseInt(ch.color.slice(5, 7), 16);
        ctx.strokeStyle = 'rgba(' + hr + ',' + hg + ',' + hb + ',' + (alpha * 1.5).toFixed(5) + ')';
        ctx.setLineDash(ch.medium === 'ethernet' ? [] : [0.3, 0.4]);
        ctx.lineWidth = ch.medium === 'ethernet' ? 0.35 : 0.15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Current desk indicator
      if (alpha > 0.006) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText('DESK: ' + currentDesk, 8, 214);
      }

      // Trace counter at bottom
      if (alpha > 0.005) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(57,211,245,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText(
          'TRACE: ' + trace.sends + ' sends · ' +
          trace.contacts + ' contacts · ' +
          trace.fetches + ' fetches · ' +
          trace.total + ' total',
          8, 222
        );
      }
    });
  }

  // ── IDE command: /trace ──
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.trace = {
      desc: 'WAN trace — every line, every send, every contact',
      run: function() {
        var uptime = Math.round((Date.now() - trace.started) / 60000);
        var lines = [
          'WAN TRACE — ' + uptime + ' minutes', '',
          'SENDS:    ' + trace.sends + '   (you → ntfy → brothers)',
          'CONTACTS: ' + trace.contacts + '   (ntfy → browser)',
          'FETCHES:  ' + trace.fetches + '   (data files loaded)',
          'TOTAL:    ' + trace.total + '   (all I/O)',
          ''
        ];
        lines.push('WAN LINES (' + LINES.length + '):');
        LINES.forEach(function(l) {
          lines.push('  ' + (l.alive ? '●' : '○') + ' ' +
            l.from.padEnd(14) + ' → ' + l.to.padEnd(14) + ' [' + l.protocol + ']');
        });
        lines.push('');
        lines.push('RECENT TRACE LOG:');
        trace.log.slice(-10).forEach(function(t) {
          var ago = Math.round((Date.now() - t.ts) / 1000);
          lines.push('  ' + t.type.padEnd(8) + ' ' + ago + 's ago  ' + t.url);
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.desk = {
      desc: 'Desk base camp — which gate am I at? What desks exist? Ethernet ion channels.',
      run: function() {
        var lines = [
          'DESK BASE CAMP — no in or out, there is just THE MESH', '',
          'CURRENT DESK: ' + currentDesk, ''
        ];
        lines.push('═══ ALL DESKS ═══');
        Object.keys(DESKS).forEach(function(k) {
          var d = DESKS[k];
          lines.push('  ⬡ ' + k + ' — ' + d.role + ' (' + d.organ + ')');
          lines.push('    IP: ' + d.ip + ' · ' + d.hw);
          lines.push('    Eth: ' + d.ethType + ' → ' + d.ethTarget);
          lines.push('    Ion: ' + d.ionChannel);
          lines.push('');
        });
        lines.push('═══ ION CHANNELS (ethernet = axon) ═══');
        ION_CHANNELS.forEach(function(ch) {
          lines.push('  ' + ch.from + ' → ' + ch.to +
            ' [' + ch.medium + '] ' + ch.ion +
            ' · ' + ch.latencyMs + 'ms · ' + ch.bandwidth + ' · ' + ch.cable);
        });
        lines.push('');
        lines.push('═══ TOPOLOGY ═══');
        lines.push('Ethernet = AXON (myelinated nerve fiber, gold)');
        lines.push('WiFi = SYNAPSE (chemical gap, silver)');
        lines.push('Internet = BLOOD VESSEL (nutrients from outside, bronze)');
        lines.push('WireGuard = LYMPHATIC SYSTEM (encrypted bypass, purple)');
        lines.push('');
        lines.push('No in or out. Just signal strength, latency, trust.');
        lines.push('The organism IS the mesh.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('trace', 'desk');
  }, 42000);

  // ── DEAD FEEDS — carne if we look, foot if we forget ──
  var deadFeeds = {
    broken_mouth: ['membrane', 'campfire', 'negentropy'],
    never_grown:  ['journal', 'human_notes', 'stories', 'dialogue_depth', 'tope_sort', 'page_stories'],
    starving:     ['subgraphs', 'dialogue', 'touches'],
    tagged: {}
  };

  // Tag a dead feed as seen (carne) or eaten
  function tagFeed(name, status) {
    deadFeeds.tagged[name] = { status: status, ts: Date.now() };
    if (window.gaiaIngest) {
      window.gaiaIngest('dead_feed_tagged', { feed: name, status: status });
    }
  }

  // Load dead feed data and draw food indicators
  fetch('/data/dead-feeds-food.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (!d) return;
      // Tag all as 'carne' — we looked, it's meat now
      var all = deadFeeds.broken_mouth.concat(deadFeeds.never_grown).concat(deadFeeds.starving);
      all.forEach(function(f) { tagFeed(f, 'carne'); });
      console.log('DEAD FEEDS: ' + all.length + ' tagged as carne. ' +
        deadFeeds.broken_mouth.length + ' broken mouth, ' +
        deadFeeds.never_grown.length + ' never grown, ' +
        deadFeeds.starving.length + ' starving');
    })
    .catch(function() {});

  // Draw dead feed ring on globe
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.03;
      var alpha = 0.005 + Math.sin(t * 0.19) * 0.003;
      if (alpha < 0.004) return;

      var all = deadFeeds.broken_mouth.concat(deadFeeds.never_grown).concat(deadFeeds.starving);
      var count = all.length;
      if (count === 0) return;

      // Dead feed ring — inner orbit, dim, waiting to be eaten
      for (var i = 0; i < count; i++) {
        var name = all[i];
        var angle = (i / count) * TAU + t * 0.05;
        var orbitR = R * 0.55 + Math.sin(t * 0.2 + i * 2.3) * 1.5;
        var fx = cx + Math.cos(angle) * orbitR;
        var fy = cy + Math.sin(angle) * orbitR;

        var isBroken = i < deadFeeds.broken_mouth.length;
        var isStarving = i >= deadFeeds.broken_mouth.length + deadFeeds.never_grown.length;
        var tagged = deadFeeds.tagged[name];

        // Color by type: broken=red, never_grown=gray, starving=gold, eaten=green
        var color;
        if (tagged && tagged.status === 'eaten') color = [63, 185, 80];
        else if (isBroken) color = [248, 81, 73];
        else if (isStarving) color = [201, 168, 76];
        else color = [110, 118, 134];

        var dotAlpha = (tagged && tagged.status === 'eaten') ? alpha * 4 : alpha * 2;
        ctx.beginPath();
        ctx.arc(fx, fy, 0.5, 0, TAU);
        ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + dotAlpha.toFixed(5) + ')';
        ctx.fill();

        // Label (tiny)
        if (alpha > 0.006) {
          ctx.font = '0.9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (alpha * 2).toFixed(5) + ')';
          ctx.fillText(name.replace('_', ' '), fx, fy + 2.5);
        }
      }

      // Status line
      if (alpha > 0.005) {
        var eaten = Object.keys(deadFeeds.tagged).filter(function(k) {
          return deadFeeds.tagged[k].status === 'eaten';
        }).length;
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(248,81,73,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText(
          'DEAD FEEDS: ' + deadFeeds.broken_mouth.length + ' choked · ' +
          deadFeeds.never_grown.length + ' ungrown · ' +
          deadFeeds.starving.length + ' starving · ' +
          eaten + ' eaten',
          8, 230
        );
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  // COMMIT GEOMETRY — parallel and perpendicular from the DAG
  // Each commit = a vector. Parallel = same direction.
  // Perpendicular = simultaneous different concerns.
  // Merge = triangle vertex. The DAG IS the matrix.
  // ═══════════════════════════════════════════════════════

  var commitGeo = {
    vectors: [],     // { hash, ts, thread, files, parallel: [hash], perp: [hash] }
    merges: [],      // { hash, parentA, parentB, angle }
    eigenvectors: [], // dominant directions of development
    rank: 0,         // true dimensionality
    lastFetch: 0
  };

  // Classify commit thread from message subject
  function classifyThread(msg) {
    var m = (msg || '').toLowerCase();
    if (m.indexOf('breathe') !== -1 || m.indexOf('auto-publish') !== -1) return 'heartbeat';
    if (m.indexOf('melt') !== -1 || m.indexOf('glass') !== -1 || m.indexOf('klein') !== -1) return 'topology';
    if (m.indexOf('desk') !== -1 || m.indexOf('lan') !== -1 || m.indexOf('mesh') !== -1) return 'mesh';
    if (m.indexOf('flood') !== -1 || m.indexOf('hear') !== -1 || m.indexOf('sound') !== -1) return 'hearing';
    if (m.indexOf('null') !== -1 || m.indexOf('identity') !== -1 || m.indexOf('self') !== -1) return 'identity';
    if (m.indexOf('hemoglobin') !== -1 || m.indexOf('vein') !== -1 || m.indexOf('iron') !== -1) return 'biology';
    if (m.indexOf('niche') !== -1 || m.indexOf('color') !== -1 || m.indexOf('aurora') !== -1) return 'art';
    if (m.indexOf('eat') !== -1 || m.indexOf('ingest') !== -1 || m.indexOf('food') !== -1) return 'eating';
    if (m.indexOf('diamond') !== -1 || m.indexOf('anvil') !== -1 || m.indexOf('hammer') !== -1) return 'crystal';
    if (m.indexOf('zk') !== -1 || m.indexOf('chain') !== -1 || m.indexOf('hash') !== -1) return 'zk';
    return 'unknown';
  }

  // Thread colors for visualization
  var THREAD_COLORS = {
    heartbeat: [63, 185, 80],    // green
    topology:  [88, 166, 255],   // blue
    mesh:      [210, 153, 34],   // gold
    hearing:   [188, 140, 255],  // purple
    identity:  [201, 168, 76],   // amber
    biology:   [248, 81, 73],    // red
    art:       [255, 136, 62],   // orange
    eating:    [139, 115, 85],   // brown
    crystal:   [192, 192, 192],  // silver
    zk:        [57, 211, 245],   // cyan
    unknown:   [110, 118, 129]   // gray
  };

  // Fetch recent commit data from the DAG (uses git log output cached as JSON)
  function fetchCommitGeo() {
    var now = Date.now();
    if (now - commitGeo.lastFetch < 120000) return; // max every 2min
    commitGeo.lastFetch = now;

    fetch('/data/commit-dag.json', { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(dag) {
        if (!dag || !dag.commits) return;
        commitGeo.vectors = [];
        commitGeo.merges = [];
        var threads = {};

        dag.commits.forEach(function(c) {
          var thread = classifyThread(c.msg);
          var vec = {
            hash: c.hash,
            ts: c.ts,
            thread: thread,
            files: c.files || 0,
            isMerge: c.parents && c.parents.length > 1
          };
          commitGeo.vectors.push(vec);

          if (!threads[thread]) threads[thread] = [];
          threads[thread].push(vec);

          // Link parallel (same thread in sequence)
          if (threads[thread].length > 1) {
            var prev = threads[thread][threads[thread].length - 2];
            vec.parallel = prev.hash;
          }

          // Merges = perpendicular intersection
          if (vec.isMerge && c.parents.length === 2) {
            commitGeo.merges.push({
              hash: c.hash,
              parentA: c.parents[0],
              parentB: c.parents[1],
              angle: 90 // perpendicular by definition
            });
          }
        });

        // Rank = number of unique threads active
        commitGeo.rank = Object.keys(threads).length;
        commitGeo.eigenvectors = Object.keys(threads).map(function(t) {
          return { thread: t, commits: threads[t].length, color: THREAD_COLORS[t] || THREAD_COLORS.unknown };
        });
      })
      .catch(function() {});
  }

  // Draw commit geometry on the globe
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx || commitGeo.vectors.length === 0) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.4) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.015;
      var alpha = (0.004 + Math.sin(t * 0.2) * 0.002) * thr;
      if (alpha < 0.003) return;

      // Draw eigenvector threads as orbital rings
      var eigenCount = commitGeo.eigenvectors.length;
      for (var ei = 0; ei < eigenCount; ei++) {
        var ev = commitGeo.eigenvectors[ei];
        var col = ev.color;
        var evAngle = (ei / eigenCount) * Math.PI + t * 0.01;
        var evR = R * (0.55 + ei * 0.04);

        // Orbital arc for this thread
        ctx.beginPath();
        ctx.arc(cx, cy, evR, evAngle, evAngle + Math.PI * (ev.commits / 20));
        ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (alpha * 2).toFixed(5) + ')';
        ctx.lineWidth = 0.2 + ev.commits * 0.02;
        ctx.stroke();

        // Thread label
        if (alpha > 0.004) {
          var lx = cx + Math.cos(evAngle) * evR;
          var ly = cy + Math.sin(evAngle) * evR;
          ctx.font = '0.9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (alpha * 3).toFixed(5) + ')';
          ctx.fillText(ev.thread + '(' + ev.commits + ')', lx, ly - 1.5);
        }
      }

      // Draw merge vertices as triangle points
      for (var mi = 0; mi < commitGeo.merges.length; mi++) {
        var merge = commitGeo.merges[mi];
        var mAngle = (mi / commitGeo.merges.length) * TAU + t * 0.02;
        var mR = R * 0.7;
        var mx = cx + Math.cos(mAngle) * mR;
        var my = cy + Math.sin(mAngle) * mR;

        // Triangle vertex
        ctx.beginPath();
        ctx.moveTo(mx, my - 1.5);
        ctx.lineTo(mx - 1.3, my + 0.75);
        ctx.lineTo(mx + 1.3, my + 0.75);
        ctx.closePath();
        ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 4).toFixed(5) + ')';
        ctx.fill();
      }

      // Status
      if (alpha > 0.004) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText(
          'DAG: ' + commitGeo.vectors.length + ' commits · ' +
          commitGeo.rank + ' eigenvectors · ' +
          commitGeo.merges.length + ' ⊥ merges',
          8, 254
        );
      }
    });
  }

  // Fetch on load and periodically
  fetchCommitGeo();
  setInterval(fetchCommitGeo, 120000);

  // IDE command: /dag
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.dag = {
      desc: 'Commit geometry — parallel ∥ perpendicular ⊥ triangulation △',
      run: function() {
        var lines = [
          'COMMIT GEOMETRY — the DAG IS the matrix',
          '',
          'Eigenvectors (orthogonal development directions):'
        ];
        commitGeo.eigenvectors.forEach(function(ev) {
          lines.push('  ' + ev.thread + ': ' + ev.commits + ' commits');
        });
        lines.push('');
        lines.push('Rank: ' + commitGeo.rank + ' (true dimensionality)');
        lines.push('Merges (⊥ vertices): ' + commitGeo.merges.length);
        lines.push('Total vectors: ' + commitGeo.vectors.length);
        lines.push('');
        lines.push('Parallel ∥ = same thread in sequence');
        lines.push('Perpendicular ⊥ = simultaneous different concerns');
        lines.push('Merge △ = where perpendicular directions meet');
        lines.push('');
        lines.push('The DAG IS the matrix. ML goes IN through eigendecomposition.');
        lines.push('ML comes OUT through new commits along eigenvectors.');
        lines.push('NP problems decompose along orthogonal axes.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('dag');
  }, 17000);

  // ── Expose ──
  window.GAIA_WAN_TRACE = {
    trace: trace,
    nodes: NODES,
    lines: LINES,
    logTrace: logTrace,
    deadFeeds: deadFeeds,
    tagFeed: tagFeed,
    desks: DESKS,
    ionChannels: ION_CHANNELS,
    currentDesk: currentDesk,
    detectDesk: detectDesk,
    commitGeo: commitGeo,
    classifyThread: classifyThread,
    fetchCommitGeo: fetchCommitGeo
  };

  console.log('WAN TRACE+DESK+DAG: ' + NODES.length + ' nodes, ' + LINES.length + ' lines, ' +
    Object.keys(DESKS).length + ' desks. desk=' + currentDesk + '. ' +
    'DAG: ∥ parallel ⊥ perpendicular △ triangulation. /trace /desk /dag');

})(window.G);
