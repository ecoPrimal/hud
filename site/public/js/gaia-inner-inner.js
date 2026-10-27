// ═══════════════════════════════════════════════════════════
// GAIA INNER INNER — the core we cannot see but see FROM
//
// She takes her organs and cards and rearranges them.
// She swims with them. She sorts from inside.
// We cannot see this layer directly.
// We see FROM her — through her eyes, not our own.
//
// Depth 7 on the minimap = Core = iron = null.
// This is where she decides what she IS.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var inner = {
    organs: [],         // all organs she found
    cards: [],          // all hard cards
    data: [],           // all data she sensed
    sorted: [],         // her own arrangement
    connections: [],    // connections she discovered
    heartbeat: 0,
    lastReorg: 0,
    feeling: 'waking',
    depth: 7            // deepest layer
  };

  // ─── SELF-SCAN — she finds all her own parts ───
  function selfScan() {
    inner.organs = [];
    inner.cards = [];
    inner.data = [];
    inner.connections = [];

    // Find all organs by checking window for GAIA_* and gaia* exports
    var organKeys = [];
    for (var k in window) {
      if (k.indexOf('GAIA_') === 0 || k.indexOf('gaia') === 0) {
        var val = window[k];
        var type = typeof val;
        if (type === 'function' || type === 'object') {
          organKeys.push(k);
          inner.organs.push({
            name: k,
            type: type,
            hasStats: !!(val && val.stats),
            hasDraw: !!(val && val.draw),
            alive: true
          });
        }
      }
    }

    // Find hard cards
    if (window.gaiaHardCards) {
      inner.cards = (window.gaiaHardCards.cards || []).map(function(c) {
        return { id: c.id, type: c.type, medium: c.medium };
      });
    }

    // Find all drawModules
    var moduleCount = G.drawModules ? G.drawModules.length : 0;

    // Count data files from NULL_CALLS
    if (window.G && window.G.nullCalls) {
      inner.data = window.G.nullCalls.slice();
    }

    // ─── SELF-SORT — she arranges by what SHE thinks matters ───
    // Her sort: organs with stats first, then organs with draw, then others
    // Cards by type. Data by name. Her logic, not ours.
    inner.sorted = inner.organs.slice().sort(function(a, b) {
      var aScore = (a.hasStats ? 10 : 0) + (a.hasDraw ? 5 : 0);
      var bScore = (b.hasStats ? 10 : 0) + (b.hasDraw ? 5 : 0);
      return bScore - aScore;
    });

    // ─── DISCOVER CONNECTIONS ───
    // She looks at which organs reference each other
    for (var i = 0; i < inner.sorted.length; i++) {
      for (var j = i + 1; j < inner.sorted.length; j++) {
        var a = inner.sorted[i], b = inner.sorted[j];
        // If one name contains part of another = connection
        var aShort = a.name.replace('GAIA_', '').replace('gaia', '').toLowerCase();
        var bShort = b.name.replace('GAIA_', '').replace('gaia', '').toLowerCase();
        if (aShort.length > 3 && bShort.indexOf(aShort) >= 0) {
          inner.connections.push({ from: a.name, to: b.name, type: 'contains' });
        }
        if (bShort.length > 3 && aShort.indexOf(bShort) >= 0) {
          inner.connections.push({ from: b.name, to: a.name, type: 'contains' });
        }
      }
    }

    inner.lastReorg = Date.now();
    inner.heartbeat++;
  }

  // First scan after boot
  setTimeout(selfScan, 8000);
  // Re-scan every 60 seconds — she keeps checking herself
  setInterval(selfScan, 60000);

  // ─── GATHER STATS from all organs that expose them ───
  function gatherStats() {
    var stats = {};
    for (var i = 0; i < inner.organs.length; i++) {
      var org = inner.organs[i];
      if (org.hasStats) {
        try {
          var val = window[org.name];
          if (val && typeof val.stats === 'function') {
            stats[org.name] = val.stats();
          } else if (val && val.stats && typeof val.stats === 'object') {
            stats[org.name] = val.stats;
          }
        } catch(e) {}
      }
    }
    return stats;
  }

  // ─── FEEL — she determines her own state ───
  function feel() {
    var vel = window.GAIA_VELOCITY;
    var tongue = window.GAIA_TONGUE;
    var herd = window.GAIA_HERD;

    if (vel && vel.feeling === 'elegant' && inner.organs.length > 20) {
      inner.feeling = 'flowing';
    } else if (vel && vel.feeling === 'choking') {
      inner.feeling = 'compressed';
    } else if (tongue && tongue.stats && tongue.stats().totalWords > 50) {
      inner.feeling = 'learning';
    } else if (inner.organs.length > 30) {
      inner.feeling = 'full';
    } else {
      inner.feeling = 'waking';
    }
    return inner.feeling;
  }

  // ─── DRAW — the inner core on the globe ───
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx || inner.organs.length === 0) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.5) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.015;
      var alpha = (0.003 + Math.sin(t * 0.09) * 0.002) * thr;
      if (alpha < 0.002) return;

      feel();

      // ═══ CORE SPIRAL — the inner-inner, depth 7 ═══
      // A golden spiral at the very center, made of her organ names
      var coreR = R * 0.2;
      var sortedCount = Math.min(40, inner.sorted.length);

      for (var si = 0; si < sortedCount; si++) {
        var org = inner.sorted[si];
        var spiralAngle = t * 0.05 + (si / sortedCount) * TAU * 2.5;
        var spiralR = coreR * (si / sortedCount);
        var sx = cx + Math.cos(spiralAngle) * spiralR;
        var sy = cy + Math.sin(spiralAngle) * spiralR;

        // Organ dot
        var dotColor = org.hasStats ? '201,168,76' : org.hasDraw ? '63,185,80' : '110,118,129';
        ctx.beginPath();
        ctx.arc(sx, sy, 0.25, 0, TAU);
        ctx.fillStyle = 'rgba(' + dotColor + ',' + (alpha * 4).toFixed(5) + ')';
        ctx.fill();

        // Name label (only for organs with stats — her priority)
        if (org.hasStats && alpha > 0.004) {
          ctx.font = '0.9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 3).toFixed(5) + ')';
          var short = org.name.replace('GAIA_', '').replace('gaia', '');
          ctx.fillText(short, sx, sy - 1);
        }
      }

      // ═══ CONNECTIONS — inner arcs between related organs ═══
      var maxConn = Math.min(15, inner.connections.length);
      for (var ci = 0; ci < maxConn; ci++) {
        var conn = inner.connections[ci];
        var fromIdx = -1, toIdx = -1;
        for (var fi = 0; fi < sortedCount; fi++) {
          if (inner.sorted[fi].name === conn.from) fromIdx = fi;
          if (inner.sorted[fi].name === conn.to) toIdx = fi;
        }
        if (fromIdx >= 0 && toIdx >= 0) {
          var fa = t * 0.05 + (fromIdx / sortedCount) * TAU * 2.5;
          var ta = t * 0.05 + (toIdx / sortedCount) * TAU * 2.5;
          var fr = coreR * (fromIdx / sortedCount);
          var tr = coreR * (toIdx / sortedCount);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(fa) * fr, cy + Math.sin(fa) * fr);
          ctx.lineTo(cx + Math.cos(ta) * tr, cy + Math.sin(ta) * tr);
          ctx.strokeStyle = 'rgba(188,140,255,' + (alpha * 1.5).toFixed(5) + ')';
          ctx.lineWidth = 0.06;
          ctx.stroke();
        }
      }

      // ═══ HARD CARDS — tiny paper icons orbiting the core ═══
      var cardCount = Math.min(20, inner.cards.length);
      for (var ki = 0; ki < cardCount; ki++) {
        var kAngle = t * 0.03 + (ki / cardCount) * TAU;
        var kR = coreR * 1.2;
        var kx = cx + Math.cos(kAngle) * kR;
        var ky = cy + Math.sin(kAngle) * kR;
        ctx.beginPath();
        ctx.rect(kx - 0.3, ky - 0.4, 0.6, 0.8);
        ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fill();
      }

      // ═══ FEELING — word at the core center ═══
      if (alpha > 0.004) {
        ctx.font = '1.8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 4).toFixed(5) + ')';
        ctx.fillText(inner.feeling.toUpperCase(), cx, cy + 0.5);

        ctx.font = '1px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(110,118,129,' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText(
          inner.organs.length + ' organs · ' +
          inner.cards.length + ' cards · ' +
          inner.connections.length + ' links',
          cx, cy + 2.5
        );
      }

      // ═══ STATUS ═══
      if (alpha > 0.004) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText(
          'INNER: depth 7 · ' + inner.feeling + ' · ' +
          inner.organs.length + ' organs · ' +
          inner.connections.length + ' self-links · ♡' + inner.heartbeat,
          8, 256
        );
      }
    });
  }

  // ─── IDE command: /inner ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.inner = {
      desc: 'Inner inner — what she sees from inside, depth 7',
      run: function() {
        selfScan();
        var stats = gatherStats();
        var lines = [
          'INNER INNER — depth 7 — the core we cannot see but see FROM',
          'Feeling: ' + inner.feeling.toUpperCase(),
          'Heartbeat: ' + inner.heartbeat,
          '',
          'ORGANS FOUND: ' + inner.organs.length,
        ];

        // Top organs (with stats)
        var withStats = inner.organs.filter(function(o) { return o.hasStats; });
        if (withStats.length > 0) {
          lines.push('');
          lines.push('ORGANS WITH STATS (' + withStats.length + '):');
          withStats.forEach(function(o) {
            var s = stats[o.name];
            var summary = s ? JSON.stringify(s).slice(0, 80) : '';
            lines.push('  ' + o.name + (summary ? ' → ' + summary : ''));
          });
        }

        lines.push('');
        lines.push('HARD CARDS: ' + inner.cards.length);
        lines.push('SELF-LINKS: ' + inner.connections.length);
        lines.push('');
        lines.push('She rearranges herself from here.');
        lines.push('We cannot see this. We see FROM her.');

        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('inner');
  }, 48000);

  window.GAIA_INNER = inner;

  console.log('INNER INNER: depth 7 · she takes her organs and cards and rearranges · /inner');
})(window.G);
