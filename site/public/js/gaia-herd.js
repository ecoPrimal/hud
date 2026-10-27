// ═══════════════════════════════════════════════════════════
// GAIA HERD — human herd motion on the globe
//
// 8.1 billion humans. 7 archetypes detected.
// Every visitor = an electron orbiting.
// Every channel = a migration path.
// Every ntfy message = herd signal.
//
// OSI layers mapped to Gaia body.
// Pheromone trail = herd scent.
// The WAN IS the pasture. Humans ARE the herds.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var scan = null;
  var pheromones = [];
  var herdCounts = { explorer: 0, scholar: 0, scout: 0, witness: 0, probe: 0, teacher: 0, watcher: 0 };

  // Colors per archetype
  var HERD_COLORS = {
    explorer: '#58a6ff',
    scholar: '#3fb950',
    scout:   '#f0883e',
    witness: '#bc8cff',
    probe:   '#6e7681',
    teacher: '#d29922',
    watcher: '#f778ba'
  };

  // OSI ring colors (layer 1 inner → layer 7 outer)
  var OSI_COLORS = ['#f85149','#f0883e','#d29922','#c9a84c','#3fb950','#58a6ff','#bc8cff'];

  // Load scan data
  fetch('/data/wan-herd-scan.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) { if (d) scan = d; })
    .catch(function() {});

  // Poll pheromone channel for live herd signals
  function pollPheromone() {
    fetch('https://ntfy.sh/primals-pheromone/json?poll=1&since=1h', { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.text() : ''; })
      .then(function(text) {
        if (!text) return;
        var lines = text.trim().split('\n');
        pheromones = [];
        for (var i = 0; i < lines.length; i++) {
          try {
            var msg = JSON.parse(lines[i]);
            if (msg.message) {
              pheromones.push(msg);
              // Try to classify
              try {
                var payload = JSON.parse(msg.message);
                if (payload.t === 'arrive') herdCounts.scout++;
                else if (payload.t === 'click') herdCounts.explorer++;
                else if (payload.t === 'leave') herdCounts.watcher++;
              } catch(e) {}
            }
          } catch(e) {}
        }
      }).catch(function() {});
  }

  setTimeout(pollPheromone, 10000);
  setInterval(pollPheromone, 90000);

  // Draw on globe
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var alpha = 0.004 + Math.sin(t * 0.13) * 0.002;
      if (alpha < 0.003) return;

      // ═══ OSI RINGS — 7 concentric rings inside the globe ═══
      for (var osi = 0; osi < 7; osi++) {
        var osiR = R * (0.25 + osi * 0.1);
        ctx.beginPath();
        ctx.arc(cx, cy, osiR, 0, TAU);
        ctx.strokeStyle = 'rgba(' + hexToRgb(OSI_COLORS[osi]).join(',') + ',' + (alpha * 0.8).toFixed(5) + ')';
        ctx.lineWidth = 0.08;
        ctx.stroke();

        // Layer label (only when visible enough)
        if (alpha > 0.005 && scan && scan.osi_model) {
          var lbl = scan.osi_model.layers[6 - osi];
          if (lbl) {
            var lblAngle = t * 0.03 + osi * 0.9;
            var lx = cx + Math.cos(lblAngle) * osiR;
            var ly = cy + Math.sin(lblAngle) * osiR;
            ctx.font = '1.2px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(' + hexToRgb(OSI_COLORS[osi]).join(',') + ',' + (alpha * 2).toFixed(5) + ')';
            ctx.fillText('L' + lbl.osi + ' ' + lbl.name, lx, ly - 1.5);
          }
        }
      }

      // ═══ HERD ELECTRONS — orbiting dots per archetype ═══
      if (scan && scan.human_herds && scan.human_herds.herds) {
        var herds = scan.human_herds.herds;
        for (var hi = 0; hi < herds.length; hi++) {
          var h = herds[hi];
          var rgb = hexToRgb(HERD_COLORS[h.archetype] || '#6e7681');
          var orbitR = R * (0.85 + hi * 0.03);
          var speed = 0.02 + (h.duration_min / 1000);
          var nDots = Math.max(1, Math.ceil(h.pages / 15));

          for (var di = 0; di < nDots; di++) {
            var dAngle = t * speed + (di / nDots) * TAU + hi * 0.9;
            var dx = cx + Math.cos(dAngle) * orbitR;
            var dy = cy + Math.sin(dAngle) * orbitR;
            var dotSize = 0.3 + (h.duration_min / 200);

            ctx.beginPath();
            ctx.arc(dx, dy, dotSize, 0, TAU);
            ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (alpha * 3).toFixed(5) + ')';
            ctx.fill();
          }

          // Archetype label at first dot position
          if (alpha > 0.005) {
            var la = t * speed + hi * 0.9;
            var lax = cx + Math.cos(la) * (orbitR + 3);
            var lay = cy + Math.sin(la) * (orbitR + 3);
            ctx.font = '1.3px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (alpha * 2.5).toFixed(5) + ')';
            ctx.fillText(h.archetype + ' (' + h.pages + 'pg)', lax, lay);
          }
        }
      }

      // ═══ NTFY CHANNEL SPOKES — 6 lines radiating from center ═══
      if (scan && scan.ntfy_channels && scan.ntfy_channels.channels) {
        var chs = scan.ntfy_channels.channels;
        for (var ci = 0; ci < chs.length; ci++) {
          var ch = chs[ci];
          var chAngle = (ci / chs.length) * TAU + t * 0.01;
          var chR = R * 0.15;
          var chEndR = R * (0.5 + Math.min(0.4, ch.msgs / 50));

          var chx1 = cx + Math.cos(chAngle) * chR;
          var chy1 = cy + Math.sin(chAngle) * chR;
          var chx2 = cx + Math.cos(chAngle) * chEndR;
          var chy2 = cy + Math.sin(chAngle) * chEndR;

          var chColor = ch.status === 'HOT' ? '248,81,73' : ch.status === 'WARM' ? '201,168,76' : ch.status === 'COLD' ? '88,166,255' : '110,118,129';

          ctx.beginPath();
          ctx.moveTo(chx1, chy1);
          ctx.lineTo(chx2, chy2);
          ctx.strokeStyle = 'rgba(' + chColor + ',' + (alpha * 2).toFixed(5) + ')';
          ctx.lineWidth = 0.12 + Math.min(0.3, ch.msgs / 100);
          ctx.stroke();

          // Message count pulse at end
          if (ch.msgs > 0) {
            var pulseSize = 0.3 + Math.sin(t * 2 + ci) * 0.15;
            ctx.beginPath();
            ctx.arc(chx2, chy2, pulseSize, 0, TAU);
            ctx.fillStyle = 'rgba(' + chColor + ',' + (alpha * 4).toFixed(5) + ')';
            ctx.fill();
          }

          // Channel name
          if (alpha > 0.005) {
            ctx.font = '1px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(' + chColor + ',' + (alpha * 3).toFixed(5) + ')';
            var shortName = ch.id.replace('primals-', '').replace('membrane-', '');
            ctx.fillText(shortName + ' ' + ch.msgs, chx2, chy2 - 1.5);
          }
        }
      }

      // ═══ LIVE PHEROMONE RAIN — recent arrivals as falling dots ═══
      for (var pi = 0; pi < Math.min(20, pheromones.length); pi++) {
        var pAngle = (pi / 20) * TAU + t * 0.5;
        var pR = R * (1.05 + Math.sin(t + pi * 0.7) * 0.05);
        var px = cx + Math.cos(pAngle) * pR;
        var py = cy + Math.sin(pAngle) * pR;
        ctx.beginPath();
        ctx.arc(px, py, 0.25, 0, TAU);
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2).toFixed(5) + ')';
        ctx.fill();
      }

      // ═══ STATUS LINE ═══
      if (alpha > 0.004) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2.5).toFixed(5) + ')';
        var msgTotal = scan ? scan.ntfy_channels.messages_total : '?';
        var nodeTotal = scan ? scan.topology_nodes.total : '?';
        ctx.fillText(
          'HERD: ' + pheromones.length + ' pheromones · ' + msgTotal + ' msgs · ' +
          nodeTotal + ' nodes · 7 OSI · 8.1B humans',
          8, 250
        );
      }
    });
  }

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3),16);
    var g = parseInt(hex.slice(3,5),16);
    var b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }

  // ─── IDE command: /herd ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.herd = {
      desc: 'Human herd scan — all motion through all channels',
      run: function() {
        var lines = [
          'HERD SCAN — 8.1 billion humans. All motion is signal.',
          ''
        ];

        if (scan) {
          lines.push('NTFY CHANNELS (' + scan.ntfy_channels.total + '):');
          scan.ntfy_channels.channels.forEach(function(ch) {
            var bar = '';
            for (var b = 0; b < Math.min(30, ch.msgs); b++) bar += '|';
            lines.push('  ' + ch.status.padEnd(6) + ' ' + ch.id.padEnd(28) + ' ' + bar + ' ' + ch.msgs);
          });

          lines.push('');
          lines.push('TOPOLOGY (' + scan.topology_nodes.total + ' nodes):');
          scan.topology_nodes.nodes.forEach(function(n) {
            lines.push('  ' + n.status.padEnd(12) + ' ' + n.id);
          });

          lines.push('');
          lines.push('HUMAN HERDS (' + scan.human_herds.detected_archetypes + ' archetypes):');
          scan.human_herds.herds.forEach(function(h) {
            lines.push('  ' + h.archetype.padEnd(10) + ' ' + h.platform.padEnd(14) + ' ' + h.pages + 'pg ' + h.duration_min + 'min ' + h.energy);
          });

          lines.push('');
          lines.push('OSI MODEL:');
          scan.osi_model.layers.forEach(function(l) {
            lines.push('  L' + l.osi + ' ' + l.name.padEnd(14) + ' ' + l.gaia);
          });

          lines.push('');
          lines.push('BRAIDS: ' + scan.braids.active_routes + ' routes, ' + scan.braids.total_passages.toLocaleString() + ' passages');
          lines.push('FEEDS: ' + scan.feeds.readable + '/' + scan.feeds.total + ' alive (' + scan.feeds.alive_pct + '%)');
          lines.push('SPACE: Kp ' + scan.space_weather.kp + ', ' + scan.space_weather.xray_class + '-class, ' + scan.space_weather.storm);
        }

        lines.push('');
        lines.push('LIVE PHEROMONES: ' + pheromones.length);
        lines.push('');
        lines.push('8.1 billion humans. 7 archetypes. All motion is channel.');

        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('herd');
  }, 46000);

  window.GAIA_HERD = {
    scan: function() { return scan; },
    pheromones: pheromones,
    herdCounts: herdCounts
  };

  console.log('HERD: 8.1B humans · 7 archetypes · 6 channels · 10 nodes · 7 OSI · pheromone trail live. /herd');
})(window.G);
