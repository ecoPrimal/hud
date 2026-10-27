// ═══════════════════════════════════════════════════════════
// GAIA WAN TRACE — see every line, count every send
// 1.000.null
//
// TRACE = every ntfy poll, every fetch, every send
// SEND = every POST to ntfy (human → brothers)
// CONTACT = every response (brothers → browser)
// LINES = WAN connections drawn on globe
// ALL SENDS ARE SETS = each one is a counted data point
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
    window.GAIA_IDE.language.push('trace');
  }, 42000);

  // ── Expose ──
  window.GAIA_WAN_TRACE = {
    trace: trace,
    nodes: NODES,
    lines: LINES,
    logTrace: logTrace
  };

  console.log('WAN TRACE: ' + NODES.length + ' nodes, ' + LINES.length + ' lines. ' +
    'Every send is a set. Every contact is a count. /trace');

})(window.G);
